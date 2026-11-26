begin;

create schema wand_legacy;
revoke all on schema wand_legacy from public, anon, authenticated;

create table wand_legacy.regra (
  codigo text primary key,
  xp integer not null check (xp >= 0),
  energia integer not null check (energia >= 0)
);

insert into wand_legacy.regra values
  ('primeiro_treino',50,20), ('treino',20,10), ('aerobico',10,5),
  ('meta_semanal',50,20), ('meta_mensal',150,50),
  ('consistencia_3',300,100), ('consistencia_6',600,200), ('consistencia_12',1200,400),
  ('anamnese',50,10), ('avaliacao_fisica',50,15), ('avaliacao_fotografica',30,10),
  ('reavaliacao',50,15), ('checkin',5,0), ('missao',50,20),
  ('meta_curta',100,30), ('meta_media',250,80), ('meta_longa',500,150),
  ('forca',100,30), ('mobilidade',100,30), ('resistencia',100,30),
  ('composicao',200,60), ('reconhecimento',0,0),
  ('disciplina_ouro',100,30), ('centuriao',300,100), ('legado_eterno',0,500);

create table wand_legacy.regra_personal (
  treinador_id uuid not null,
  codigo text not null references wand_legacy.regra(codigo),
  xp integer not null check (xp between 0 and 100000),
  energia integer not null check (energia between 0 and 100000),
  primary key (treinador_id,codigo)
);
alter table wand_legacy.regra_personal enable row level security;

create table wand_legacy.evento (
  aluno_id bigint not null references public.alunos(id),
  codigo text not null references wand_legacy.regra(codigo),
  referencia text not null,
  xp integer not null check (xp >= 0),
  energia integer not null check (energia >= 0),
  validado_por uuid not null,
  criado_em timestamptz not null default now(),
  primary key (aluno_id, codigo, referencia)
);

create table wand_legacy.treino_validado (
  sessao_id uuid primary key,
  aluno_id bigint not null references public.alunos(id),
  dia date not null,
  unique (aluno_id, dia)
);
create unique index on wand_legacy.evento (aluno_id,referencia)
  where codigo in ('avaliacao_fisica','reavaliacao');
create table wand_legacy.frequencia_semanal (
  aluno_id bigint not null references public.alunos(id),
  semana date not null,
  frequencia integer not null check (frequencia between 1 and 7),
  primary key (aluno_id,semana)
);
alter table wand_legacy.frequencia_semanal enable row level security;

create table wand_legacy.insignia (
  codigo text primary key,
  nome text not null,
  descricao text not null
);
insert into wand_legacy.insignia values
  ('primeiro_passo','Primeiro Passo','Primeiro treino validado'),
  ('disciplina_ouro','Disciplina de Ouro','Quatro metas semanais consecutivas'),
  ('centuriao','Centurião','100 treinos validados'),
  ('inabalavel','Inabalável','Seis meses de consistência'),
  ('superacao','Superação','Grande meta individual validada'),
  ('legado_eterno','Legado Eterno','Nível Lendário alcançado');

create table wand_legacy.conquista (
  aluno_id bigint not null references public.alunos(id),
  codigo text not null references wand_legacy.insignia(codigo),
  conquistada_em timestamptz not null default now(),
  primary key (aluno_id, codigo)
);

alter table wand_legacy.regra enable row level security;
alter table wand_legacy.evento enable row level security;
alter table wand_legacy.treino_validado enable row level security;
alter table wand_legacy.insignia enable row level security;
alter table wand_legacy.conquista enable row level security;

create table wand_legacy.missao (
  id uuid primary key default gen_random_uuid(),
  aluno_id bigint not null references public.alunos(id),
  treinador_id uuid not null,
  titulo text not null check (length(trim(titulo)) between 1 and 160),
  codigo text not null references wand_legacy.regra(codigo),
  estado text not null default 'atribuida' check (estado in ('atribuida','em_validacao','validada')),
  criada_em timestamptz not null default now()
);
create index on wand_legacy.missao (aluno_id,treinador_id);
alter table wand_legacy.missao enable row level security;

create table wand_legacy.presente (
  aluno_id bigint not null references public.alunos(id),
  nivel integer not null check (nivel between 1 and 10),
  descricao text not null check (length(trim(descricao)) between 1 and 160),
  entregue boolean not null,
  treinador_id uuid not null,
  atualizado_em timestamptz not null default now(),
  primary key (aluno_id,nivel)
);
create table wand_legacy.presente_historico (
  id bigint generated always as identity primary key,
  aluno_id bigint not null,
  nivel integer not null,
  descricao text not null,
  entregue boolean not null,
  treinador_id uuid not null,
  atualizado_em timestamptz not null default now()
);
create index on wand_legacy.presente_historico (aluno_id,id);
alter table wand_legacy.presente enable row level security;
alter table wand_legacy.presente_historico enable row level security;

create table wand_legacy.recompensa (
  id integer generated always as identity primary key,
  nome text not null,
  descricao text not null default '',
  condicoes text not null default '',
  custo integer not null check (custo > 0),
  estoque integer check (estoque >= 0),
  ativa boolean not null default true,
  validade date
);
insert into wand_legacy.recompensa (nome,custo) values
  ('Avaliação física extra',600), ('Desconto de R$ 20 na mensalidade',800),
  ('Desconto de R$ 50 na mensalidade',2000), ('Camiseta WAND METHOD',2500),
  ('Sessão extra de personal',3500), ('Desconto de R$ 100 na mensalidade',4000);

create table wand_legacy.resgate (
  id uuid primary key default gen_random_uuid(),
  aluno_id bigint not null references public.alunos(id),
  recompensa_id integer not null references wand_legacy.recompensa(id),
  chave uuid not null,
  custo integer not null check (custo > 0),
  estado text not null default 'solicitado' check (estado in ('solicitado','aprovado','entregue','cancelado')),
  criado_em timestamptz not null default now(),
  unique (aluno_id,chave)
);
create index on wand_legacy.resgate (aluno_id);
create unique index on wand_legacy.resgate (aluno_id,recompensa_id) where estado in ('solicitado','aprovado');
alter table wand_legacy.recompensa enable row level security;
alter table wand_legacy.resgate enable row level security;

create table wand_legacy.aviso (
  id bigint generated always as identity primary key,
  destinatario uuid not null,
  aluno_id bigint not null,
  titulo text not null,
  destino text not null,
  lido boolean not null default false
);
create index on wand_legacy.aviso (destinatario,id desc) where not lido;
alter table wand_legacy.aviso enable row level security;

create function public.wand_legacy_avisos()
returns table (id bigint, aluno_id bigint, titulo text, destino text)
language sql stable security definer set search_path = '' as $$
  select a.id,a.aluno_id,a.titulo,a.destino from wand_legacy.aviso a
  where a.destinatario = auth.uid() and not a.lido order by a.id desc limit 20;
$$;

create function public.wand_legacy_ler_aviso(p_id bigint) returns void
language sql security definer set search_path = '' as $$
  update wand_legacy.aviso set lido = true where id = p_id and destinatario = auth.uid();
$$;

create function wand_legacy.avisar_credito() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_xp bigint;
begin
  if new.energia > 0 or new.xp > 0 then
    insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
      select a.user_id,new.aluno_id,'WAND LEGACY: +'||new.xp||' XP e +'||new.energia||' WAND ENERGY','historico'
      from public.alunos a where a.id = new.aluno_id and a.user_id is not null;
  end if;
  select sum(xp) into v_xp from wand_legacy.evento where aluno_id = new.aluno_id;
  if exists (select 1 from unnest(array[500,1500,3000,5000,8000,12000,18000,26000,40000]) limite
      where limite > v_xp - new.xp and limite <= v_xp) then
    insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
      select a.user_id,new.aluno_id,'Você subiu de nível no WAND LEGACY','conquistas'
      from public.alunos a where a.id = new.aluno_id and a.user_id is not null;
    insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
      values (new.validado_por,new.aluno_id,'Aluno subiu de nível no WAND LEGACY','conquistas');
  end if;
  return new;
end;
$$;
create trigger wand_legacy_credito_aviso after insert on wand_legacy.evento
  for each row execute function wand_legacy.avisar_credito();

create function wand_legacy.avisar_insignia() returns trigger
language plpgsql set search_path = '' as $$
begin
  insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
    select a.user_id,new.aluno_id,'Nova insígnia: '||i.nome,'conquistas'
    from public.alunos a join wand_legacy.insignia i on i.codigo = new.codigo
    where a.id = new.aluno_id and a.user_id is not null;
  if auth.uid() is not null then
    insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
      select auth.uid(),new.aluno_id,'Aluno conquistou a insígnia '||nome,'conquistas'
      from wand_legacy.insignia where codigo = new.codigo;
  end if;
  return new;
end;
$$;
create trigger wand_legacy_insignia_aviso after insert on wand_legacy.conquista
  for each row execute function wand_legacy.avisar_insignia();

create function wand_legacy.saldo(p_aluno_id bigint) returns bigint
language sql stable set search_path = '' as $$
  select (select coalesce(sum(energia),0) from wand_legacy.evento where aluno_id = p_aluno_id)
       - (select coalesce(sum(custo),0) from wand_legacy.resgate where aluno_id = p_aluno_id and estado <> 'cancelado');
$$;

create function wand_legacy.coach(p_aluno_id bigint) returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
     and exists (
       select 1 from public.wand_treinos
       where aluno_id = p_aluno_id and treinador_id = auth.uid()
     );
$$;

create function public.wand_legacy_presentes(p_aluno_id bigint) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not wand_legacy.coach(p_aluno_id) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'sugestoes', array['Chaveiro','Pulseira','Toalha','Garrafa','Camiseta','Nécessaire',
      'Garrafa térmica premium','Mochila esportiva','Kit esportivo exclusivo','Kit Lendário e troféu'],
    'registros', (select coalesce(jsonb_agg(to_jsonb(p) order by nivel),'[]'::jsonb)
      from wand_legacy.presente p where aluno_id = p_aluno_id),
    'historico', (select coalesce(jsonb_agg(to_jsonb(h) order by id desc),'[]'::jsonb)
      from (select id,nivel,descricao,entregue,atualizado_em from wand_legacy.presente_historico
       where aluno_id = p_aluno_id order by id desc limit 100) h)
  );
end;
$$;

create function public.wand_legacy_salvar_presente(p_aluno_id bigint,p_nivel integer,p_descricao text,p_entregue boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not wand_legacy.coach(p_aluno_id) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  insert into wand_legacy.presente as atual (aluno_id,nivel,descricao,entregue,treinador_id)
    values (p_aluno_id,p_nivel,trim(p_descricao),p_entregue,auth.uid())
    on conflict (aluno_id,nivel) do update set descricao = excluded.descricao, entregue = excluded.entregue,
      treinador_id = excluded.treinador_id, atualizado_em = now()
    where (atual.descricao,atual.entregue) is distinct from (excluded.descricao,excluded.entregue);
  if found then
    insert into wand_legacy.presente_historico (aluno_id,nivel,descricao,entregue,treinador_id)
      values (p_aluno_id,p_nivel,trim(p_descricao),p_entregue,auth.uid());
    if not p_entregue then
      insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
        values (auth.uid(),p_aluno_id,'Presente de reconhecimento pendente','reconhecimento');
    end if;
  end if;
end;
$$;

create function wand_legacy.creditar(p_aluno_id bigint, p_codigo text, p_referencia text)
returns void language sql set search_path = '' as $$
  insert into wand_legacy.evento (aluno_id,codigo,referencia,xp,energia,validado_por)
  select p_aluno_id,r.codigo,p_referencia,coalesce(p.xp,r.xp),coalesce(p.energia,r.energia),auth.uid()
  from wand_legacy.regra r left join wand_legacy.regra_personal p
    on p.codigo = r.codigo and p.treinador_id = auth.uid()
  where r.codigo = p_codigo
  on conflict do nothing;
$$;

create function public.wand_legacy_validar_acompanhamento(p_aluno_id bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_evento record;
begin
  if not wand_legacy.coach(p_aluno_id) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  perform 1 from public.alunos where id = p_aluno_id for update;
  if exists (
    select 1 from public.anamneses a where a.aluno_id = p_aluno_id
      and a.status = 'concluida' and a.concluida_em <= now()
  ) then
    perform wand_legacy.creditar(p_aluno_id,'anamnese','primeira');
  end if;
  for v_evento in
    select a.id, row_number() over (order by a.liberada_em,a.id) as ordem
    from public.avaliacoes_fisicas a where a.aluno_id = p_aluno_id and a.liberada_em <= now()
  loop
    perform wand_legacy.creditar(p_aluno_id,
      case when v_evento.ordem = 1 then 'avaliacao_fisica' else 'reavaliacao' end,v_evento.id::text);
  end loop;
  for v_evento in
    select distinct r.dia from public.wand_bemestar_registros r
    where r.aluno_id = p_aluno_id and r.dia <= (now() at time zone 'America/Sao_Paulo')::date
      and (r.energia is not null or r.sono is not null or r.disposicao is not null)
  loop
    perform wand_legacy.creditar(p_aluno_id,'checkin',v_evento.dia::text);
  end loop;
  for v_evento in
    select a.id from public.wand_avaliacoes_posturais a
    where a.aluno_id = p_aluno_id and a.status = 'publicado' and a.criado_por = auth.uid()
  loop
    perform wand_legacy.creditar(p_aluno_id,'avaliacao_fotografica',v_evento.id::text);
  end loop;
end;
$$;

create function public.wand_legacy_regras()
returns table (codigo text,xp integer,energia integer)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  return query select r.codigo,coalesce(p.xp,r.xp),coalesce(p.energia,r.energia)
  from wand_legacy.regra r left join wand_legacy.regra_personal p
    on p.codigo = r.codigo and p.treinador_id = auth.uid() order by r.codigo;
end;
$$;

create function public.wand_legacy_salvar_regra(p_codigo text,p_xp integer,p_energia integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  insert into wand_legacy.regra_personal values (auth.uid(),p_codigo,p_xp,p_energia)
  on conflict (treinador_id,codigo) do update set xp = excluded.xp, energia = excluded.energia;
end;
$$;

create function wand_legacy.sessoes_elegiveis(p_aluno_id bigint)
returns table (id uuid, treino_id uuid, nome text, finalizada_em timestamptz, dia date)
language sql stable set search_path = '' as $$
  select s.id, t.id, t.nome, s.finalizada_em, (s.finalizada_em at time zone 'America/Sao_Paulo')::date
  from public.wand_sessoes_treino s
  join public.wand_treinos t on t.id = s.treino_id
  join public.alunos a on a.id = s.aluno_id
  where s.aluno_id = p_aluno_id and t.aluno_id = p_aluno_id and t.treinador_id = auth.uid()
    and s.situacao = 'concluido' and s.finalizada_em > s.iniciada_em and s.finalizada_em <= now()
    and (a.user_id = s.user_id or s.conduzida_por = auth.uid())
    and (t.validade_inicio is null or t.validade_inicio <= (s.iniciada_em at time zone 'America/Sao_Paulo')::date)
    and (t.validade_fim is null or t.validade_fim >= (s.iniciada_em at time zone 'America/Sao_Paulo')::date);
$$;

create function public.wand_legacy_resumo(p_aluno_id bigint) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_coach boolean := wand_legacy.coach(p_aluno_id);
begin
  if not v_coach and not exists (
    select 1 from public.alunos a where a.id = p_aluno_id and a.user_id = auth.uid()
  ) then raise exception 'Acesso não autorizado' using errcode = '42501'; end if;

  return jsonb_build_object(
    'nome', (select nome_completo from public.alunos where id = p_aluno_id),
    'missoes', (select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'titulo',m.titulo,'codigo',m.codigo,
      'estado',m.estado) order by m.criada_em desc),'[]'::jsonb)
      from wand_legacy.missao m where m.aluno_id = p_aluno_id
        and (not v_coach or m.treinador_id = auth.uid())),
    'xp', (select coalesce(sum(xp),0) from wand_legacy.evento where aluno_id = p_aluno_id),
    'energia', wand_legacy.saldo(p_aluno_id),
    'historico', (select coalesce(jsonb_agg(to_jsonb(h) order by h.criado_em desc),'[]'::jsonb)
      from (select codigo,xp,energia,criado_em from wand_legacy.evento
        where aluno_id = p_aluno_id order by criado_em desc,codigo,referencia limit 100) h),
    'recompensas', (select coalesce(jsonb_agg(to_jsonb(r) order by r.custo),'[]'::jsonb)
      from wand_legacy.recompensa r where r.ativa and (r.estoque is null or r.estoque > 0)
        and (r.validade is null or r.validade >= (now() at time zone 'America/Sao_Paulo')::date)),
    'resgates', (select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'nome',c.nome,
       'estado',r.estado,'custo',r.custo) order by r.criado_em desc),'[]'::jsonb)
       from wand_legacy.resgate r join wand_legacy.recompensa c on c.id = r.recompensa_id
       where r.aluno_id = p_aluno_id),
    'insignias', (select coalesce(jsonb_agg(jsonb_build_object('codigo',i.codigo,'nome',i.nome,
                   'descricao',i.descricao,'conquistada_em',c.conquistada_em)
                   order by c.conquistada_em,i.codigo),'[]'::jsonb)
                  from wand_legacy.conquista c join wand_legacy.insignia i using (codigo)
                  where c.aluno_id = p_aluno_id),
    'treinos_para_validar', case when v_coach then (
      select coalesce(jsonb_agg(to_jsonb(f) order by f.finalizada_em desc),'[]'::jsonb) from (
        select s.id,s.nome,s.finalizada_em
        from wand_legacy.sessoes_elegiveis(p_aluno_id) s
        where not exists (
            select 1 from wand_legacy.treino_validado v where v.aluno_id = p_aluno_id
              and v.dia = s.dia
          )
        order by s.finalizada_em desc limit 30
      ) f
    ) else '[]'::jsonb end
  );
end;
$$;

create function public.wand_legacy_atribuir_missao(p_aluno_id bigint,p_titulo text,p_codigo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not wand_legacy.coach(p_aluno_id) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  if not coalesce(p_codigo in ('missao','meta_curta','meta_media','meta_longa','forca','mobilidade','resistencia','composicao','reconhecimento'),false) then
    raise exception 'Categoria inválida';
  end if;
  insert into wand_legacy.missao (aluno_id,treinador_id,titulo,codigo)
    values (p_aluno_id,auth.uid(),trim(p_titulo),p_codigo);
end;
$$;

create function public.wand_legacy_atualizar_missao(p_aluno_id bigint,p_missao_id uuid,p_estado text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_missao wand_legacy.missao%rowtype;
begin
  perform 1 from public.alunos where id = p_aluno_id for update;
  if p_estado = 'em_validacao' and exists (select 1 from public.alunos where id = p_aluno_id and user_id = auth.uid()) then
    update wand_legacy.missao set estado = p_estado
      where id = p_missao_id and aluno_id = p_aluno_id and estado = 'atribuida'
      returning * into v_missao;
    if found then
      insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
        values (v_missao.treinador_id,p_aluno_id,'Missão ou meta aguardando validação','missoes');
    end if;
    return;
  end if;
  if p_estado is distinct from 'validada' or not wand_legacy.coach(p_aluno_id) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  update wand_legacy.missao set estado = p_estado
    where id = p_missao_id and aluno_id = p_aluno_id and treinador_id = auth.uid() and estado = 'em_validacao'
    returning * into v_missao;
  if not found then return; end if;
  perform wand_legacy.creditar(p_aluno_id,v_missao.codigo,v_missao.id::text);
  insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
    select user_id,id,'Missão ou meta validada','missoes' from public.alunos
    where id = p_aluno_id and user_id is not null;
  if v_missao.codigo = 'meta_longa' then
    insert into wand_legacy.conquista (aluno_id,codigo) values (p_aluno_id,'superacao') on conflict do nothing;
  end if;
  if (select sum(xp) from wand_legacy.evento where aluno_id = p_aluno_id) >= 40000 then
    insert into wand_legacy.conquista (aluno_id,codigo) values (p_aluno_id,'legado_eterno') on conflict do nothing;
    if found then perform wand_legacy.creditar(p_aluno_id,'legado_eterno','insignia'); end if;
  end if;
end;
$$;

create function public.wand_legacy_resgatar(p_aluno_id bigint,p_recompensa_id integer,p_chave uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_recompensa wand_legacy.recompensa%rowtype;
begin
  perform 1 from public.alunos where id = p_aluno_id and user_id = auth.uid() for update;
  if not found then raise exception 'Acesso não autorizado' using errcode = '42501'; end if;
  select id into v_id from wand_legacy.resgate where aluno_id = p_aluno_id and chave = p_chave;
  if found then return v_id; end if;
  select id into v_id from wand_legacy.resgate where aluno_id = p_aluno_id
    and recompensa_id = p_recompensa_id and estado in ('solicitado','aprovado');
  if found then return v_id; end if;
  select * into v_recompensa from wand_legacy.recompensa where id = p_recompensa_id for update;
  if not found or not v_recompensa.ativa or v_recompensa.estoque = 0
    or v_recompensa.validade < (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'Recompensa indisponível';
  end if;
  if wand_legacy.saldo(p_aluno_id) < v_recompensa.custo then
    raise exception 'WAND ENERGY insuficiente';
  end if;
  insert into wand_legacy.resgate (aluno_id,recompensa_id,chave,custo)
    values (p_aluno_id,p_recompensa_id,p_chave,v_recompensa.custo) returning id into v_id;
  update wand_legacy.recompensa set estoque = estoque - 1 where id = p_recompensa_id and estoque is not null;
  insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
    select distinct t.treinador_id,p_aluno_id,'Nova solicitação de resgate','recompensas'
    from public.wand_treinos t join public.profiles p on p.id = t.treinador_id and p.role = 'admin'
    where t.aluno_id = p_aluno_id;
  return v_id;
end;
$$;

create function public.wand_legacy_catalogo()
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  return (select coalesce(jsonb_agg(to_jsonb(r) order by r.id),'[]'::jsonb) from wand_legacy.recompensa r);
end;
$$;

create function public.wand_legacy_salvar_recompensa(p_id integer,p_nome text,p_descricao text,
  p_condicoes text,p_custo integer,p_estoque integer,p_validade date,p_ativa boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  if p_nome is null or length(trim(p_nome)) not between 1 and 120
    or length(p_descricao) > 2000 or length(p_condicoes) > 2000 then
    raise exception 'Dados da recompensa inválidos';
  end if;
  if p_id is null then
    insert into wand_legacy.recompensa (nome,descricao,condicoes,custo,estoque,validade,ativa)
      values (trim(p_nome),p_descricao,p_condicoes,p_custo,p_estoque,p_validade,p_ativa);
  else
    update wand_legacy.recompensa
      set nome = trim(p_nome), descricao = p_descricao, condicoes = p_condicoes,
          custo = p_custo, estoque = p_estoque, validade = p_validade, ativa = p_ativa
      where id = p_id;
    if not found then raise exception 'Recompensa indisponível'; end if;
  end if;
end;
$$;

create function public.wand_legacy_decidir_resgate(p_aluno_id bigint,p_resgate_id uuid,p_estado text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_resgate wand_legacy.resgate%rowtype;
begin
  if not wand_legacy.coach(p_aluno_id) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  perform 1 from public.alunos where id = p_aluno_id for update;
  select * into v_resgate from wand_legacy.resgate where id = p_resgate_id and aluno_id = p_aluno_id for update;
  if not found then raise exception 'Resgate indisponível'; end if;
  if v_resgate.estado = p_estado then return; end if;
  if not coalesce(
    (v_resgate.estado = 'solicitado' and p_estado in ('aprovado','cancelado'))
    or (v_resgate.estado = 'aprovado' and p_estado in ('entregue','cancelado')), false
  ) then raise exception 'Transição de resgate inválida'; end if;
  update wand_legacy.resgate set estado = p_estado where id = p_resgate_id;
  insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
    select user_id,id,'Seu resgate foi '||p_estado,'recompensas' from public.alunos
    where id = p_aluno_id and user_id is not null;
  if p_estado = 'cancelado' then
    update wand_legacy.recompensa set estoque = estoque + 1 where id = v_resgate.recompensa_id and estoque is not null;
  end if;
end;
$$;

create function public.wand_legacy_validar_treino(p_aluno_id bigint,p_sessao_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_dia date;
  v_tipo text;
  v_total bigint;
  v_semana date;
  v_mes date;
  v_fim date;
  v_frequencia integer;
  v_meses integer;
begin
  if not wand_legacy.coach(p_aluno_id) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;

  perform 1 from public.alunos where id = p_aluno_id for update;
  select s.dia,
         case when exists (
           select 1 from public.wand_programa_fichas f
           join public.wand_programas_treino p on p.id = f.programa_id
           where f.treino_id = s.treino_id and p.aluno_id = p_aluno_id and p.treinador_id = auth.uid()
             and lower(f.modalidade) in ('aerobico','aeróbico')
         ) then 'aerobico' else 'treino' end
    into v_dia,v_tipo
  from wand_legacy.sessoes_elegiveis(p_aluno_id) s where s.id = p_sessao_id;
  if not found then raise exception 'Sessão inválida para pontuação'; end if;

  insert into wand_legacy.treino_validado values (p_sessao_id,p_aluno_id,v_dia)
  on conflict do nothing;
  if not found then return false; end if;

  select count(*) into v_total from wand_legacy.treino_validado where aluno_id = p_aluno_id;
  if v_total = 1 then
    perform wand_legacy.creditar(p_aluno_id,'primeiro_treino','primeiro');
    insert into wand_legacy.conquista (aluno_id,codigo) values (p_aluno_id,'primeiro_passo');
  else
    perform wand_legacy.creditar(p_aluno_id,v_tipo,p_sessao_id::text);
  end if;
  if v_total = 100 then
    insert into wand_legacy.conquista (aluno_id,codigo) values (p_aluno_id,'centuriao');
    perform wand_legacy.creditar(p_aluno_id,'centuriao','insignia');
  end if;
  v_semana := date_trunc('week',v_dia::timestamp)::date;
  v_mes := date_trunc('month',(v_semana + 3)::timestamp)::date;
  insert into wand_legacy.frequencia_semanal
    select p_aluno_id,v_semana,cardinality(p.dias_preferenciais)
    from public.wand_programas_treino p
    where p.aluno_id = p_aluno_id and p.treinador_id = auth.uid() and p.status = 'ativo'
      and (p.criado_em at time zone 'America/Sao_Paulo')::date <= v_dia
      and cardinality(p.dias_preferenciais) between 1 and 7
    order by p.criado_em desc,p.id limit 1
  on conflict do nothing;
  select frequencia into v_frequencia from wand_legacy.frequencia_semanal
    where aluno_id = p_aluno_id and semana = v_semana;
  if (select count(*) from wand_legacy.treino_validado where aluno_id = p_aluno_id
      and dia between v_semana and v_semana + 6) >= v_frequencia then
    perform wand_legacy.creditar(p_aluno_id,'meta_semanal',v_semana::text);
    if exists (
      select 1 from generate_series(0,3) deslocamento
      where (select count(*) from wand_legacy.evento e
        where e.aluno_id = p_aluno_id and e.codigo = 'meta_semanal'
          and e.referencia in (select (v_semana + 7 * (deslocamento - i))::text from generate_series(0,3) i)) = 4
    ) then
      insert into wand_legacy.conquista (aluno_id,codigo) values (p_aluno_id,'disciplina_ouro') on conflict do nothing;
      if found then perform wand_legacy.creditar(p_aluno_id,'disciplina_ouro','insignia'); end if;
    end if;
    if not exists (
      select 1 from generate_series(v_mes::timestamp,(v_mes + interval '1 month - 1 day')::timestamp,interval '1 day') d
      where extract(isodow from d) = 4 and not exists (
        select 1 from wand_legacy.evento e where e.aluno_id = p_aluno_id and e.codigo = 'meta_semanal'
          and e.referencia = (d::date - 3)::text
      )
    ) then
      perform wand_legacy.creditar(p_aluno_id,'meta_mensal',v_mes::text);
      for v_meses in select unnest(array[3,6,12]) loop
        select d::date into v_fim from generate_series(v_mes::timestamp,
          v_mes + (v_meses-1) * interval '1 month',interval '1 month') d
        where not exists (
          select 1 from generate_series(0,v_meses-1) i where not exists (
            select 1 from wand_legacy.evento e where e.aluno_id = p_aluno_id and e.codigo = 'meta_mensal'
              and e.referencia = (d - i * interval '1 month')::date::text
          )
        ) limit 1;
        if found then
          perform wand_legacy.creditar(p_aluno_id,'consistencia_'||v_meses,'marco');
          if v_meses = 6 then
            insert into wand_legacy.conquista (aluno_id,codigo) values (p_aluno_id,'inabalavel') on conflict do nothing;
          end if;
        end if;
      end loop;
    end if;
  end if;
  if (select sum(xp) from wand_legacy.evento where aluno_id = p_aluno_id) >= 40000 then
    insert into wand_legacy.conquista (aluno_id,codigo) values (p_aluno_id,'legado_eterno') on conflict do nothing;
    if found then perform wand_legacy.creditar(p_aluno_id,'legado_eterno','insignia'); end if;
  end if;
  return true;
end;
$$;

revoke all on all functions in schema wand_legacy from public, anon, authenticated;
revoke all on function public.wand_legacy_resumo(bigint), public.wand_legacy_validar_treino(bigint,uuid) from public, anon, authenticated;
grant execute on function public.wand_legacy_resumo(bigint), public.wand_legacy_validar_treino(bigint,uuid) to authenticated;

create function public.wand_legacy_alunos() returns table (id bigint, nome text, xp bigint)
language sql stable security definer set search_path = '' as $$
  select a.id, a.nome_completo,
     (select coalesce(sum(e.xp),0) from wand_legacy.evento e where e.aluno_id = a.id)
  from public.alunos a
  where wand_legacy.coach(a.id)
  order by a.nome_completo,a.id;
$$;
revoke all on function public.wand_legacy_alunos() from public, anon, authenticated;
grant execute on function public.wand_legacy_alunos() to authenticated;
revoke all on function public.wand_legacy_resgatar(bigint,integer,uuid), public.wand_legacy_decidir_resgate(bigint,uuid,text) from public, anon, authenticated;
grant execute on function public.wand_legacy_resgatar(bigint,integer,uuid), public.wand_legacy_decidir_resgate(bigint,uuid,text) to authenticated;
revoke all on function public.wand_legacy_regras(), public.wand_legacy_salvar_regra(text,integer,integer) from public, anon, authenticated;
grant execute on function public.wand_legacy_regras(), public.wand_legacy_salvar_regra(text,integer,integer) to authenticated;
revoke all on function public.wand_legacy_catalogo(), public.wand_legacy_salvar_recompensa(integer,text,text,text,integer,integer,date,boolean) from public, anon, authenticated;
grant execute on function public.wand_legacy_catalogo(), public.wand_legacy_salvar_recompensa(integer,text,text,text,integer,integer,date,boolean) to authenticated;
revoke all on function public.wand_legacy_atribuir_missao(bigint,text,text), public.wand_legacy_atualizar_missao(bigint,uuid,text) from public, anon, authenticated;
grant execute on function public.wand_legacy_atribuir_missao(bigint,text,text), public.wand_legacy_atualizar_missao(bigint,uuid,text) to authenticated;
revoke all on function public.wand_legacy_presentes(bigint), public.wand_legacy_salvar_presente(bigint,integer,text,boolean) from public, anon, authenticated;
grant execute on function public.wand_legacy_presentes(bigint), public.wand_legacy_salvar_presente(bigint,integer,text,boolean) to authenticated;
revoke all on function public.wand_legacy_avisos(), public.wand_legacy_ler_aviso(bigint) from public, anon, authenticated;
grant execute on function public.wand_legacy_avisos(), public.wand_legacy_ler_aviso(bigint) to authenticated;
revoke all on function public.wand_legacy_validar_acompanhamento(bigint) from public, anon, authenticated;
grant execute on function public.wand_legacy_validar_acompanhamento(bigint) to authenticated;

commit;
