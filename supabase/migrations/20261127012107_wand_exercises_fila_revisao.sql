begin;

alter table public.wand_exercicios
  add column status_revisao text,
  add column musculos_primarios text,
  add column pegada text,
  add column variacao text,
  add column caracteristicas text,
  add column video_proposto_url text,
  add column status_revisao_midia text check (status_revisao_midia in ('pendente','aprovado','rejeitado')),
  add column midia_revisada_em timestamptz,
  add column video_tipo_anterior text,
  add column video_url_anterior text,
  add constraint wand_exercicios_proposta_midia_check
    check (status_revisao_midia is distinct from 'pendente' or video_proposto_url is not null),
  add constraint wand_exercicios_status_revisao_check
    check (status_revisao in ('pendente', 'aprovado', 'rejeitado')),
  add constraint wand_exercicios_visibilidade_revisao_check
    check (status_revisao not in ('pendente', 'rejeitado') or ativo is false);

-- A biblioteca e a fila compartilham os IDs e a política de edição administrativa.
create unique index wand_exercicios_identidade_ativa_ou_pendente_uidx
  on public.wand_exercicios (
    translate(lower(regexp_replace(trim(nome), '\s+', ' ', 'g')), 'áàâãéêíóôõúüç', 'aaaaeeiooouuc'),
    lower(regexp_replace(trim(coalesce(equipamento,'')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(coalesce(pegada,'')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(coalesce(variacao,'')), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(coalesce(caracteristicas,'')), '\s+', ' ', 'g'))
  )
  where ativo is true or status_revisao = 'pendente';

create index wand_exercicios_fila_idx on public.wand_exercicios (nome, id)
  where status_revisao = 'pendente';

create index wand_exercicios_fila_midia_idx on public.wand_exercicios (nome, id)
  where ativo is true and status_revisao_midia = 'pendente';

create function public.wand_importar_exercicios_revisao(p_lote jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare total int; inseridos int;
begin
  if not exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin') then
    raise exception 'Acesso exclusivo ao WandCoach.' using errcode='42501';
  end if;
  if jsonb_typeof(p_lote) is distinct from 'array' then
    raise exception 'Informe um lote JSON em formato de lista.';
  end if;
  total := jsonb_array_length(p_lote);
  if total not between 1 and 500 then raise exception 'Informe de 1 a 500 exercícios.'; end if;
  if exists (
    select 1 from jsonb_to_recordset(p_lote) as x(nome text, grupo_muscular text, equipamento text,
      musculos_primarios text, musculos_secundarios text, instrucoes text, video_url text)
    where nullif(trim(x.nome),'') is null or length(x.nome)>180
      or nullif(trim(x.grupo_muscular),'') is null or nullif(trim(x.equipamento),'') is null
      or nullif(trim(x.musculos_primarios),'') is null or nullif(trim(x.instrucoes),'') is null
      or x.video_url is null or x.video_url !~ '^https://www\.youtube\.com/watch\?v=[A-Za-z0-9_-]{11}$'
  ) then
    raise exception 'Revise os campos obrigatórios e os links do YouTube no lote.';
  end if;
  perform pg_advisory_xact_lock(hashtext('wand_importar_exercicios_revisao'));
  with fonte as (
    select x.*, translate(lower(regexp_replace(trim(x.nome), '\s+', ' ', 'g')), 'áàâãéêíóôõúüç', 'aaaaeeiooouuc') as chave
    from jsonb_to_recordset(p_lote) as x(nome text, grupo_muscular text, equipamento text,
      musculos_primarios text, musculos_secundarios text, instrucoes text, erros_comuns text,
      pegada text, variacao text, caracteristicas text, video_url text)
  )
  insert into public.wand_exercicios (nome,grupo_muscular,equipamento,musculos_primarios,
    musculos_secundarios,instrucoes,erros_comuns,pegada,variacao,caracteristicas,
    video_url,video_tipo,categoria,ativo,status_revisao)
  select trim(f.nome),trim(f.grupo_muscular),trim(f.equipamento),trim(f.musculos_primarios),
    trim(f.musculos_secundarios),trim(f.instrucoes),trim(f.erros_comuns),trim(f.pegada),
    trim(f.variacao),trim(f.caracteristicas),f.video_url,'youtube','Musculação',false,'pendente'
  from fonte f
  where not exists (
    select 1 from public.wand_exercicios e
    where (e.ativo or e.status_revisao = 'pendente')
      and translate(lower(regexp_replace(trim(e.nome), '\s+', ' ', 'g')), 'áàâãéêíóôõúüç', 'aaaaeeiooouuc') = f.chave
      and (nullif(trim(e.equipamento),'') is null or lower(trim(e.equipamento)) = lower(trim(f.equipamento)))
      and (nullif(trim(e.pegada),'') is null or nullif(trim(f.pegada),'') is null or lower(trim(e.pegada))=lower(trim(f.pegada)))
      and (nullif(trim(e.variacao),'') is null or nullif(trim(f.variacao),'') is null or lower(trim(e.variacao))=lower(trim(f.variacao)))
      and (nullif(trim(e.caracteristicas),'') is null or nullif(trim(f.caracteristicas),'') is null or lower(trim(e.caracteristicas))=lower(trim(f.caracteristicas)))
  )
  on conflict do nothing;
  get diagnostics inseridos = row_count;
  return jsonb_build_object('inseridos', inseridos, 'ignorados', total-inseridos);
end;
$$;

revoke all on function public.wand_importar_exercicios_revisao(jsonb) from public, anon;
grant execute on function public.wand_importar_exercicios_revisao(jsonb) to authenticated;

create function public.wand_decidir_midia_exercicio(p_id uuid, p_url text, p_aprovar boolean)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin') then
    raise exception 'Acesso exclusivo ao WandCoach.' using errcode='42501';
  end if;
  update public.wand_exercicios
  set status_revisao_midia = case when p_aprovar then 'aprovado' else 'rejeitado' end,
      video_tipo_anterior = case when p_aprovar then video_tipo else video_tipo_anterior end,
      video_url_anterior = case when p_aprovar then video_url else video_url_anterior end,
      midia_revisada_em = case when p_aprovar then now() else midia_revisada_em end,
      video_tipo = case when p_aprovar then 'youtube' else video_tipo end,
      video_url = case when p_aprovar then video_proposto_url else video_url end
  where id=p_id and ativo is true and status_revisao_midia='pendente' and video_proposto_url=p_url
    and video_proposto_url ~ '^https://www\.youtube\.com/watch\?v=[A-Za-z0-9_-]{11}$';
  return found;
end;
$$;

revoke all on function public.wand_decidir_midia_exercicio(uuid,text,boolean) from public, anon;
grant execute on function public.wand_decidir_midia_exercicio(uuid,text,boolean) to authenticated;

-- Impeça que uma chamada direta prescreva um item ainda indisponível.
create schema if not exists private;
create function private.wand_validar_exercicio_prescrito()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.wand_exercicios e
    where e.id = new.exercicio_id and e.status_revisao in ('pendente', 'rejeitado')
  ) then
    raise exception 'Este exercício ainda não está disponível para prescrição.' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function private.wand_validar_exercicio_prescrito() from public, anon, authenticated;

create trigger wand_validar_exercicio_prescrito
  before insert or update of exercicio_id on public.wand_treino_exercicios
  for each row execute function private.wand_validar_exercicio_prescrito();

CREATE OR REPLACE FUNCTION public.wand_aluno_treinos()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_aluno bigint; v_result jsonb; v_dia date;
begin
 v_aluno:=public.wand_aluno_da_conta();
 if auth.uid() is null or v_aluno is null then raise exception 'Aluno não autenticado ou sem vínculo'; end if;
 v_dia := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
 select coalesce(jsonb_agg(jsonb_build_object(
  'id',t.id,'nome',t.nome,'objetivo',t.objetivo,'observacoes',t.observacoes,'status',t.status,
  'validade_inicio',t.validade_inicio,'validade_fim',t.validade_fim,
  'exercicios',coalesce((select jsonb_agg(jsonb_build_object(
   'id',te.id,'ordem',te.ordem,'nome',coalesce(to_jsonb(e)->>'nome',to_jsonb(e)->>'nome_exercicio','Exercício'),
   'exercicio_id',te.exercicio_id,
   'video_tipo',case when e.video_tipo = 'youtube' then e.video_tipo end,
   'video_url',case when e.video_tipo = 'youtube' then e.video_url end,
   'midia_revisada_em',e.midia_revisada_em,
   'metodo',coalesce(to_jsonb(m)->>'nome',to_jsonb(m)->>'nome_metodo',''),
   'observacoes',te.observacoes,
   'series',coalesce((select jsonb_agg(jsonb_build_object(
    'id',s.id,'numero',s.numero_serie,'repeticoes',s.repeticoes,'carga',s.carga_kg,
    'descanso',s.descanso_segundos,'rir',to_jsonb(s)->>'rir','rpe',to_jsonb(s)->>'rpe',
    'cadencia',to_jsonb(s)->>'cadencia','observacoes',s.observacoes
   ) order by s.numero_serie) from public.wand_treino_series s where s.treino_exercicio_id=te.id),'[]'::jsonb)
  ) order by te.ordem) from public.wand_treino_exercicios te
   left join public.wand_exercicios e on e.id=te.exercicio_id
   left join public.wand_metodos m on m.id=te.metodo_id
   where te.treino_id=t.id),'[]'::jsonb)
 ) order by t.nome),'[]'::jsonb) into v_result
 from public.wand_treinos t
 where t.aluno_id=v_aluno and t.status='ativo'
   and (t.validade_inicio is null or t.validade_inicio <= v_dia)
   and (t.validade_fim is null or t.validade_fim >= v_dia);
 return v_result;
end $function$;

CREATE OR REPLACE FUNCTION public.wand_aluno_treinos_adaptados_autorizados(p_dia date DEFAULT CURRENT_DATE)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_aluno bigint; v_result jsonb; v_hoje date;
BEGIN
 v_aluno:=public.wand_aluno_da_conta();
 IF auth.uid() IS NULL OR v_aluno IS NULL THEN RAISE EXCEPTION 'Aluno não autenticado'; END IF;
 v_hoje := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
 IF p_dia <> v_hoje THEN RAISE EXCEPTION 'Consulta permitida somente para hoje'; END IF;
 SELECT COALESCE(jsonb_agg(jsonb_build_object(
  'id',t.id,'nome',t.nome,'objetivo',t.objetivo,'observacoes',t.observacoes,'status',t.status,
  'validade_inicio',t.validade_inicio,'validade_fim',t.validade_fim,
  'exercicios',COALESCE((SELECT jsonb_agg(jsonb_build_object(
   'id',te.id,'ordem',te.ordem,'nome',COALESCE(to_jsonb(e)->>'nome',to_jsonb(e)->>'nome_exercicio','Exercício'),
   'exercicio_id',te.exercicio_id,
   'video_tipo',case when e.video_tipo = 'youtube' then e.video_tipo end,
   'video_url',case when e.video_tipo = 'youtube' then e.video_url end,
   'midia_revisada_em',e.midia_revisada_em,
   'metodo',COALESCE(to_jsonb(m)->>'nome',to_jsonb(m)->>'nome_metodo',''),
   'observacoes',te.observacoes,
   'series',COALESCE((SELECT jsonb_agg(jsonb_build_object(
    'id',s.id,'numero',s.numero_serie,'repeticoes',s.repeticoes,'carga',s.carga_kg,
    'descanso',s.descanso_segundos,'rir',to_jsonb(s)->>'rir','rpe',to_jsonb(s)->>'rpe',
    'cadencia',to_jsonb(s)->>'cadencia','observacoes',s.observacoes
   ) ORDER BY s.numero_serie) FROM public.wand_treino_series s WHERE s.treino_exercicio_id=te.id),'[]'::jsonb)
  ) ORDER BY te.ordem) FROM public.wand_treino_exercicios te
   LEFT JOIN public.wand_exercicios e ON e.id=te.exercicio_id
   LEFT JOIN public.wand_metodos m ON m.id=te.metodo_id
   WHERE te.treino_id=t.id),'[]'::jsonb)
 ) ORDER BY t.nome),'[]'::jsonb) INTO v_result
 FROM public.wand_treinos t
 WHERE t.aluno_id=v_aluno AND t.status IN ('rascunho','ativo')
 AND (t.validade_inicio IS NULL OR t.validade_inicio<=p_dia)
 AND (t.validade_fim IS NULL OR t.validade_fim>=p_dia)
 AND EXISTS (
   SELECT 1 FROM public.wand_adaptacoes_programadas a
   JOIN public.wand_protocolos_adaptacao p ON p.id=a.protocolo_id
   JOIN public.wand_treinos original ON original.id=a.treino_original_id
   WHERE a.aluno_id=v_aluno AND a.treino_alternativo_id=t.id
     AND a.dia=p_dia AND a.status='programada'
     AND p.aluno_id=v_aluno AND p.ativo
     AND p.treino_original_id=a.treino_original_id
     AND p.treino_alternativo_id=a.treino_alternativo_id
     AND original.aluno_id=v_aluno AND original.status='ativo'
 );
 RETURN v_result;
END;
$function$;

with lote(nome, grupo_muscular, musculos_primarios, musculos_secundarios, equipamento, padrao_movimento,
          dificuldade, instrucoes, erros_comuns, video_url) as (
  values
    ('Supino inclinado com halteres', 'Peitoral', 'Peitoral maior, porção clavicular', 'Deltoide anterior, tríceps', 'Halteres e banco inclinado', 'Empurrar', 'Intermediário', 'Apoie os pés e abaixe os halteres com controle ao lado do peito, com punhos alinhados.', 'Perder o apoio ou bater os halteres no topo.', 'https://www.youtube.com/watch?v=IP4oeKh1Sd4'),
    ('Crucifixo no voador', 'Peitoral', 'Peitoral maior', 'Deltoide anterior', 'Máquina voador', 'Adução horizontal', 'Iniciante', 'Ajuste o assento para alinhar as empunhaduras ao peito. Aproxime os braços com cotovelos semiflexionados.', 'Encolher os ombros ou forçar a abertura.', 'https://www.youtube.com/watch?v=1D9x_U6PkY8'),
    ('Remada baixa com triângulo', 'Dorsal', 'Latíssimo do dorso', 'Romboides, trapézio médio, flexores do cotovelo', 'Polia baixa e triângulo', 'Puxar horizontal', 'Iniciante', 'Use pegada neutra fechada e puxe o triângulo em direção ao abdômen sem balanço.', 'Estender o tronco para iniciar a puxada.', 'https://www.youtube.com/watch?v=SJZKt8Wz3oo'),
    ('Remada unilateral com halter apoiada', 'Dorsal', 'Latíssimo do dorso', 'Romboides, deltoide posterior, flexores do cotovelo', 'Halter e banco', 'Puxar horizontal', 'Intermediário', 'Apoie-se no banco, segure o halter com pegada neutra e leve o cotovelo para trás.', 'Girar o tronco ou elevar o ombro.', 'https://www.youtube.com/watch?v=dFzUjzfih7k'),
    ('Elevação lateral unilateral na polia', 'Ombros', 'Deltoide lateral', 'Supraespinal, trapézio', 'Polia baixa e puxador individual', 'Abdução do ombro', 'Iniciante', 'Eleve o braço lateralmente com cotovelo levemente flexionado, dentro da amplitude confortável.', 'Inclinar o tronco ou dar impulso na saída.', 'https://www.youtube.com/watch?v=Z5FA9aq3L6A'),
    ('Face pull com corda', 'Ombros', 'Deltoide posterior', 'Trapézio médio, romboides, rotadores externos', 'Polia e corda', 'Puxar horizontal', 'Intermediário', 'Puxe a corda em direção ao rosto e separe as pontas durante a puxada, com tronco estável.', 'Arquear a lombar ou puxar em direção ao abdômen.', 'https://www.youtube.com/watch?v=C0XHJJ4dZQ4'),
    ('Cadeira adutora', 'Adutores', 'Adutores longo, curto e magno', 'Pectíneo e grácil', 'Máquina adutora', 'Adução do quadril', 'Iniciante', 'Apoie as costas e ajuste a abertura inicial. Aproxime as pernas com controle e retorne sem soltar a carga.', 'Balançar o tronco ou forçar a abertura inicial.', 'https://www.youtube.com/watch?v=CjAVezAggkI'),
    ('Rosca martelo com halteres', 'Bíceps', 'Braquial', 'Braquiorradial, bíceps braquial', 'Halteres', 'Flexão do cotovelo', 'Iniciante', 'Flexione os cotovelos com pegada neutra contínua, junto ao tronco. Ênfase no braquial e braquiorradial.', 'Balançar o corpo ou supinar os punhos.', 'https://www.youtube.com/watch?v=CFBZ4jN1CMI'),
    ('Rosca inclinada com halteres', 'Bíceps', 'Bíceps braquial', 'Braquial, braquiorradial', 'Halteres e banco inclinado', 'Flexão do cotovelo', 'Intermediário', 'Apoie as costas no banco e flexione os cotovelos com as palmas voltadas para cima no esforço.', 'Projetar os cotovelos para a frente ou levantar as costas.', 'https://www.youtube.com/watch?v=HhHHBj3qTJ4'),
    ('Tríceps acima da cabeça na polia com corda', 'Tríceps', 'Tríceps braquial', 'Antebraços e musculatura do tronco como estabilizadores', 'Polia e corda', 'Extensão do cotovelo', 'Intermediário', 'De costas para a polia, mantenha os braços elevados e estenda os cotovelos segurando as pontas da corda.', 'Compensar com a lombar ou mover excessivamente os braços.', 'https://www.youtube.com/watch?v=U_qMtEvHuQM'),
    ('Leg press 45°', 'Quadríceps', 'Quadríceps', 'Glúteo máximo, adutor magno', 'Leg press 45°', 'Empurrar com as pernas', 'Iniciante', 'Mantenha pés apoiados e alinhados aos joelhos. Desça até onde a pelve permanece apoiada.', 'Elevar a pelve ou deixar os joelhos colapsarem para dentro.', 'https://www.youtube.com/watch?v=waAxlYvtCcI'),
    ('Cadeira extensora', 'Quadríceps', 'Quadríceps', 'Musculatura do tronco como estabilizadora', 'Cadeira extensora', 'Extensão do joelho', 'Iniciante', 'Alinhe o joelho ao eixo da máquina e ajuste o rolo acima do tornozelo. Estenda e retorne com controle.', 'Chutar a carga ou levantar o quadril do assento.', 'https://www.youtube.com/watch?v=eSgIvwS36ws'),
    ('Cadeira flexora', 'Posterior de coxa', 'Isquiotibiais', 'Gastrocnêmio', 'Cadeira flexora', 'Flexão do joelho', 'Iniciante', 'Alinhe o joelho ao eixo da máquina, ajuste os apoios e flexione sem levantar a pelve.', 'Perder o contato com o assento ou soltar a carga na volta.', 'https://www.youtube.com/watch?v=G5iP_YcDQdE'),
    ('Levantamento terra romeno com barra', 'Posterior de coxa', 'Isquiotibiais', 'Glúteo máximo, adutor magno, eretores como estabilizadores', 'Barra e anilhas', 'Dobradiça de quadril', 'Intermediário', 'Com pegada pronada, leve o quadril para trás com joelhos semiflexionados e barra próxima às pernas.', 'Arredondar a coluna ou transformar o movimento em agachamento.', 'https://www.youtube.com/watch?v=amLSSb8cXok'),
    ('Elevação pélvica com barra', 'Glúteos', 'Glúteo máximo', 'Posteriores de coxa, adutor magno', 'Barra, anilhas e banco', 'Extensão do quadril', 'Intermediário', 'Apoie a parte alta das costas em banco firme e a barra acolchoada no quadril. Eleve sem hiperestender a lombar.', 'Impulsionar com o pescoço ou abrir as costelas no topo.', 'https://www.youtube.com/watch?v=XAO5YepO8DI'),
    ('Extensão de quadril na polia com tornozeleira', 'Glúteos', 'Glúteo máximo', 'Posteriores de coxa', 'Polia baixa e tornozeleira', 'Extensão do quadril', 'Iniciante', 'Apoie as mãos, estabilize a pelve e leve a perna para trás com movimento no quadril.', 'Girar a pelve ou arquear a lombar.', 'https://www.youtube.com/watch?v=Ag6UMYXRZVU'),
    ('Panturrilha sentada na máquina', 'Panturrilhas', 'Sóleo', 'Gastrocnêmio', 'Máquina de panturrilha sentada', 'Flexão plantar', 'Iniciante', 'Apoie a parte da frente dos pés na plataforma e eleve os calcanhares sob controle. Ênfase no sóleo.', 'Fazer balanço ou tirar o antepé do apoio.', 'https://www.youtube.com/watch?v=Bx6elAOgxMI'),
    ('Abdominal ajoelhado na polia com corda', 'Abdominal', 'Reto abdominal', 'Oblíquos', 'Polia alta, corda e colchonete', 'Flexão do tronco', 'Intermediário', 'Ajoelhe-se de frente para a polia e aproxime as costelas da pelve com a corda perto da cabeça.', 'Puxar com os braços ou mover apenas o quadril.', 'https://www.youtube.com/watch?v=kc0PRn372lo'),
    ('Prancha frontal nos antebraços', 'Abdominal', 'Reto abdominal e transverso', 'Oblíquos, glúteos, serrátil anterior', 'Colchonete', 'Antiextensão', 'Iniciante', 'Apoie antebraços e pés, alinhe os cotovelos sob os ombros e mantenha a respiração.', 'Afundar a lombar ou elevar excessivamente a pelve.', 'https://www.youtube.com/watch?v=3QZlgJ40LfU'),
    ('Agachamento búlgaro com halteres', 'Quadríceps', 'Quadríceps', 'Glúteo máximo, adutores', 'Halteres e banco', 'Agachar unilateral', 'Intermediário', 'Apoie o pé traseiro em banco firme. Desça sob controle sobre o pé da frente, com halteres ao lado do corpo.', 'Impulsionar com a perna traseira ou perder apoio do pé dianteiro.', 'https://www.youtube.com/watch?v=p0ZwhGPfJe8')
)
insert into public.wand_exercicios (
  nome, grupo_muscular, musculos_primarios, musculos_secundarios, equipamento, padrao_movimento,
  dificuldade, instrucoes, erros_comuns, video_url, video_tipo, categoria, ativo, criado_por, status_revisao
)
select nome, grupo_muscular, musculos_primarios, musculos_secundarios, equipamento, padrao_movimento,
       dificuldade, instrucoes, erros_comuns, video_url, 'youtube', 'Musculação', false, null, 'pendente'
from lote
where not exists (
  select 1 from public.wand_exercicios existente
  where translate(lower(trim(existente.nome)), 'áàâãéêíóôõúüç', 'aaaaeeiooouuc')
    = translate(lower(trim(lote.nome)), 'áàâãéêíóôõúüç', 'aaaaeeiooouuc')
  or existente.video_url = lote.video_url
)
on conflict do nothing;

-- Encaminhe os vídeos para revisão, sem mudar as mídias atuais.
update public.wand_exercicios e
set status_revisao_midia='pendente', video_proposto_url='https://www.youtube.com/watch?v=' || proposta.video_id
from (values
  ('Agachamento livre', '4CBU0uYCVCE'),
  ('Crucifixo com halteres', 'dRlG-eC5N0U'),
  ('Desenvolvimento sentado com halteres', 'SSXS4Z8OkCg'),
  ('Elevação lateral com halteres', '4p_m96HXMLk'),
  ('Panturrilha em pé', 'jfKTT_hr8bk'),
  ('Puxada frontal', '3oKVLtxQQ6U'),
  ('Remada curvada com barra', 'OChKu05590M'),
  ('Rosca Direta c/Barra W', 'fjS0CqDR4v8'),
  ('Supino reto com barra', 'CayG6UYqL8g'),
  ('Triceps na polia', 'Rpv1iD4u7Us')
) as proposta(nome,video_id)
where e.ativo is true and e.nome=proposta.nome and e.status_revisao_midia is null;

commit;
