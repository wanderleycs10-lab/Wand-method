-- Correção candidata. Aplicar somente com aprovação de release.

BEGIN;

CREATE OR REPLACE FUNCTION public.wand_coach_atender_interrupcao(p_notificacao_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Nao autenticado'; END IF;
 UPDATE public.wand_notificacoes_internas n SET atendida_em=COALESCE(n.atendida_em,now())
 WHERE n.id=p_notificacao_id AND n.destinatario_id=auth.uid()
   AND n.tipo='treino_interrompido'
   AND EXISTS (SELECT 1 FROM public.wand_sessoes_treino s JOIN public.wand_treinos t ON t.id=s.treino_id
               WHERE s.id=n.referencia_id AND s.aluno_id=n.aluno_id AND t.treinador_id=auth.uid());
 IF NOT FOUND THEN RAISE EXCEPTION 'Aviso nao encontrado ou acesso negado'; END IF;
 RETURN true;
END $function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_atender_interrupcao"(p_notificacao_id uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_atender_interrupcao"(p_notificacao_id uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_coach_atender_solicitacao(p_solicitacao_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
 if auth.uid() is null then raise exception 'Sessão inválida'; end if;
 update public.wand_solicitacoes_ajuste s
 set status='atendida',atendido_em=now(),atendido_por=auth.uid()
 where s.id=p_solicitacao_id and s.status='pendente'
 and exists(select 1 from public.wand_treinos t
            where t.aluno_id=s.aluno_id and t.treinador_id=auth.uid());
 if not found then raise exception 'Solicitação não encontrada, já atendida ou sem permissão'; end if;
end $function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_atender_solicitacao"(p_solicitacao_id uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_atender_solicitacao"(p_solicitacao_id uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_coach_ativar_protocolo(p_protocolo_id uuid, p_ativo boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
 update public.wand_protocolos_adaptacao p set ativo=p_ativo
 where p.id=p_protocolo_id and p.treinador_id=auth.uid();
 if not found then raise exception 'Protocolo nao encontrado ou sem permissao'; end if;
end $function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_ativar_protocolo"(p_protocolo_id uuid, p_ativo boolean) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_ativar_protocolo"(p_protocolo_id uuid, p_ativo boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_coach_bemestar_aluno(p_aluno_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare pref record; registros jsonb;
begin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
 if auth.uid() is null or not exists(select 1 from public.wand_treinos t where t.aluno_id=p_aluno_id and t.treinador_id=auth.uid()) then
  raise exception 'Acesso não autorizado'; end if;
 select * into pref from public.wand_bemestar_preferencias where aluno_id=p_aluno_id;
 if not found or not pref.ativo then return jsonb_build_object('ativo',false,'registros','[]'::jsonb); end if;
 select coalesce(jsonb_agg(jsonb_build_object(
  'dia',r.dia,'energia',r.energia,'sono',r.sono,'disposicao',r.disposicao,
  'dor_muscular',r.dor_muscular,'observacoes',r.observacoes,'pedir_ajuste',r.pedir_ajuste,
  'menstruando',case when pref.ciclo_ativo and pref.compartilhar_ciclo then to_jsonb(r.menstruando) else 'null'::jsonb end,
  'colica',case when pref.ciclo_ativo and pref.compartilhar_ciclo then to_jsonb(r.colica) else 'null'::jsonb end,
  'inicio_menstruacao',case when pref.ciclo_ativo and pref.compartilhar_ciclo then to_jsonb(r.inicio_menstruacao) else 'null'::jsonb end
 ) order by r.dia desc),'[]'::jsonb) into registros
 from (select * from public.wand_bemestar_registros where aluno_id=p_aluno_id order by dia desc limit 90) r;
 return jsonb_build_object('ativo',true,'ciclo_compartilhado',pref.ciclo_ativo and pref.compartilhar_ciclo,
 'situacao_ciclo',case when pref.ciclo_ativo and pref.compartilhar_ciclo then pref.situacao_ciclo else null end,
 'registros',registros);
end $function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_bemestar_aluno"(p_aluno_id bigint) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_bemestar_aluno"(p_aluno_id bigint) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_coach_criar_protocolo(p_aluno_id bigint, p_treino_original uuid, p_treino_alternativo uuid, p_titulo text, p_descricao text DEFAULT NULL::text, p_modo text DEFAULT 'aprovacao'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.wand_treinos
    WHERE aluno_id=p_aluno_id AND treinador_id=auth.uid()
  ) THEN
    RAISE EXCEPTION 'Sem permissao';
  END IF;
  IF p_modo IS DISTINCT FROM 'aprovacao' THEN
    RAISE EXCEPTION 'Somente protocolos com aprovacao individual sao permitidos';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.wand_treinos
    WHERE id=p_treino_original AND aluno_id=p_aluno_id AND treinador_id=auth.uid()
  ) OR NOT EXISTS (
    SELECT 1 FROM public.wand_treinos
    WHERE id=p_treino_alternativo AND aluno_id=p_aluno_id AND treinador_id=auth.uid()
  ) THEN
    RAISE EXCEPTION 'Ambos os treinos devem pertencer ao mesmo aluno e treinador';
  END IF;
  INSERT INTO public.wand_protocolos_adaptacao
    (aluno_id,treinador_id,treino_original_id,treino_alternativo_id,titulo,descricao,modo)
  VALUES
    (p_aluno_id,auth.uid(),p_treino_original,p_treino_alternativo,p_titulo,p_descricao,'aprovacao')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_criar_protocolo"(p_aluno_id bigint, p_treino_original uuid, p_treino_alternativo uuid, p_titulo text, p_descricao text, p_modo text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_criar_protocolo"(p_aluno_id bigint, p_treino_original uuid, p_treino_alternativo uuid, p_titulo text, p_descricao text, p_modo text) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_coach_historico_aluno(p_aluno_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.wand_treinos t
    WHERE t.aluno_id = p_aluno_id
      AND t.treinador_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso não autorizado';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'treino', t.nome,
        'iniciada_em', s.iniciada_em,
        'finalizada_em', s.finalizada_em,
        'observacoes', s.observacoes,
        'ultima_serie_em', dados.ultima_serie_em,
        'duracao_sessao_segundos', CASE
          WHEN s.finalizada_em IS NOT NULL THEN
            GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (s.finalizada_em - s.iniciada_em)))::bigint)
          ELSE NULL
        END,
        'tempo_ate_ultima_serie_segundos', CASE
          WHEN dados.ultima_serie_em IS NOT NULL THEN
            GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (dados.ultima_serie_em - s.iniciada_em)))::bigint)
          ELSE NULL
        END,
        'intervalo_apos_ultima_serie_segundos', CASE
          WHEN s.finalizada_em IS NOT NULL AND dados.ultima_serie_em IS NOT NULL THEN
            GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (s.finalizada_em - dados.ultima_serie_em)))::bigint)
          ELSE NULL
        END,
        'alerta_duracao', CASE
          WHEN s.finalizada_em IS NOT NULL
            AND s.finalizada_em - s.iniciada_em > INTERVAL '2 hours 30 minutes'
          THEN true
          ELSE false
        END,
        'series', COALESCE(dados.series, '[]'::jsonb)
      ) ORDER BY s.iniciada_em DESC, s.id
    ), '[]'::jsonb
  ) INTO v_result
  FROM public.wand_sessoes_treino s
  JOIN public.wand_treinos t ON t.id = s.treino_id
  LEFT JOIN LATERAL (
    SELECT
      MAX(se.registrada_em) FILTER (WHERE se.concluida IS TRUE) AS ultima_serie_em,
      jsonb_agg(
        jsonb_build_object(
          'exercicio', COALESCE(to_jsonb(e)->>'nome', to_jsonb(e)->>'nome_exercicio', 'Exercício'),
          'exercicio_id', te.exercicio_id,
          'treino_exercicio_id', te.id,
          'ordem', te.ordem,
          'metodo_id', te.metodo_id,
          'metodo', COALESCE(
            NULLIF(te.configuracao_metodo->>'grupo_metodo_nome', ''),
            NULLIF(te.configuracao_metodo->>'tipo', ''),
            CASE WHEN te.metodo_id IS NULL THEN 'Tradicional' ELSE 'Método configurado' END
          ),
          'grupo_prescricao_id', te.configuracao_metodo->>'grupo_prescricao_id',
          'grupo_posicao', te.configuracao_metodo->'grupo_posicao',
          'grupo_total', te.configuracao_metodo->'grupo_total',
          'configuracao_metodo', te.configuracao_metodo,
          'numero', sr.numero_serie,
          'repeticoes', se.repeticoes_realizadas,
          'carga', se.carga_realizada_kg,
          'concluida', se.concluida,
          'observacoes', se.observacoes,
          'registrada_em', se.registrada_em
        ) ORDER BY te.ordem NULLS LAST, sr.numero_serie NULLS LAST, se.registrada_em NULLS LAST, se.id
      ) AS series
    FROM public.wand_series_executadas se
    JOIN public.wand_treino_series sr ON sr.id = se.serie_id
    JOIN public.wand_treino_exercicios te ON te.id = sr.treino_exercicio_id
    LEFT JOIN public.wand_exercicios e ON e.id = te.exercicio_id
    WHERE se.sessao_id = s.id
  ) dados ON true
  WHERE s.aluno_id = p_aluno_id
    AND t.treinador_id = auth.uid();

  RETURN v_result;
END;
$function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_historico_aluno"(p_aluno_id bigint) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_historico_aluno"(p_aluno_id bigint) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_coach_programar_adaptacao(p_protocolo_id uuid, p_dia date, p_solicitacao_id uuid DEFAULT NULL::uuid, p_justificativa text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE p public.wand_protocolos_adaptacao%rowtype; v_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
 SELECT * INTO p FROM public.wand_protocolos_adaptacao
 WHERE id=p_protocolo_id AND treinador_id=auth.uid() AND ativo;
 IF NOT FOUND THEN RAISE EXCEPTION 'Protocolo nao ativo ou sem permissao'; END IF;
 IF p_dia < (now() AT TIME ZONE 'America/Sao_Paulo')::date THEN RAISE EXCEPTION 'Data no passado'; END IF;
 IF p_solicitacao_id IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM public.wand_solicitacoes_ajuste s WHERE s.id=p_solicitacao_id
   AND s.aluno_id=p.aluno_id AND s.status='pendente') THEN
  RAISE EXCEPTION 'Solicitacao nao esta pendente'; END IF;
 IF EXISTS(SELECT 1 FROM public.wand_adaptacoes_programadas a WHERE a.aluno_id=p.aluno_id
  AND a.treino_original_id=p.treino_original_id AND a.dia=p_dia) THEN
  RAISE EXCEPTION 'Ja existe adaptacao para esse treino e dia'; END IF;
 INSERT INTO public.wand_adaptacoes_programadas
 (aluno_id,treinador_id,protocolo_id,solicitacao_id,treino_original_id,treino_alternativo_id,dia,justificativa)
 VALUES(p.aluno_id,auth.uid(),p.id,p_solicitacao_id,p.treino_original_id,p.treino_alternativo_id,p_dia,p_justificativa)
 RETURNING id INTO v_id;
 IF p_solicitacao_id IS NOT NULL THEN
 UPDATE public.wand_solicitacoes_ajuste SET status='atendida',atendido_em=now(),atendido_por=auth.uid()
 WHERE id=p_solicitacao_id;
 END IF;
 RETURN v_id;
END $function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_programar_adaptacao"(p_protocolo_id uuid, p_dia date, p_solicitacao_id uuid, p_justificativa text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_programar_adaptacao"(p_protocolo_id uuid, p_dia date, p_solicitacao_id uuid, p_justificativa text) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_coach_protocolos(p_aluno_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_result jsonb;
begin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
 if auth.uid() is null or not exists(select 1 from public.wand_treinos where aluno_id=p_aluno_id and treinador_id=auth.uid()) then
  raise exception 'Sem permissao para acessar este aluno'; end if;
 select coalesce(jsonb_agg(to_jsonb(p) order by p.criado_em desc),'[]'::jsonb) into v_result
 from public.wand_protocolos_adaptacao p where p.aluno_id=p_aluno_id and p.treinador_id=auth.uid();
 return v_result;
end $function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_protocolos"(p_aluno_id bigint) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_protocolos"(p_aluno_id bigint) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_coach_resumo_interrupcao(p_sessao_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Nao autenticado'; END IF;
 SELECT jsonb_build_object(
  'sessao_id',s.id,'iniciada_em',s.iniciada_em,'interrompida_em',s.finalizada_em,
  'duracao_segundos',CASE WHEN s.finalizada_em IS NOT NULL THEN GREATEST(0,FLOOR(EXTRACT(EPOCH FROM (s.finalizada_em-s.iniciada_em)))::bigint) ELSE NULL END,
  'exercicios_previstos',(SELECT count(*) FROM public.wand_treino_exercicios te WHERE te.treino_id=s.treino_id),
  'series_previstas',(SELECT count(*) FROM public.wand_treino_series ts JOIN public.wand_treino_exercicios te ON te.id=ts.treino_exercicio_id WHERE te.treino_id=s.treino_id),
  'series',COALESCE((SELECT jsonb_agg(jsonb_build_object(
   'treino_exercicio_id',te.id,'exercicio',COALESCE(to_jsonb(e)->>'nome',to_jsonb(e)->>'nome_exercicio','Exercicio'),
   'ordem',te.ordem,'numero',ts.numero_serie,'repeticoes',se.repeticoes_realizadas,
   'carga',se.carga_realizada_kg,'registrada_em',se.registrada_em,'observacoes',se.observacoes
  ) ORDER BY se.registrada_em,te.ordem,ts.numero_serie)
  FROM public.wand_series_executadas se
  JOIN public.wand_treino_series ts ON ts.id=se.serie_id
  JOIN public.wand_treino_exercicios te ON te.id=ts.treino_exercicio_id
  LEFT JOIN public.wand_exercicios e ON e.id=te.exercicio_id
  WHERE se.sessao_id=s.id AND se.concluida IS TRUE),'[]'::jsonb)
 ) INTO v
 FROM public.wand_sessoes_treino s
 JOIN public.wand_treinos t ON t.id=s.treino_id
 WHERE s.id=p_sessao_id AND t.treinador_id=auth.uid() AND s.situacao='interrompido';
 IF v IS NULL THEN RAISE EXCEPTION 'Sessao interrompida nao encontrada ou acesso negado'; END IF;
 RETURN v;
END $function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_resumo_interrupcao"(p_sessao_id uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_resumo_interrupcao"(p_sessao_id uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_coach_solicitacoes_aluno(p_aluno_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare resultado jsonb;
begin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
 if auth.uid() is null or not exists(
  select 1 from public.wand_treinos t
  where t.aluno_id=p_aluno_id and t.treinador_id=auth.uid()
 ) then raise exception 'Acesso não autorizado'; end if;
 select coalesce(jsonb_agg(jsonb_build_object(
  'id',s.id,'dia',s.dia,'criado_em',s.criado_em
 ) order by s.criado_em desc),'[]'::jsonb) into resultado
 from public.wand_solicitacoes_ajuste s
 where s.aluno_id=p_aluno_id and s.status='pendente';
 return resultado;
end $function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_solicitacoes_aluno"(p_aluno_id bigint) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_solicitacoes_aluno"(p_aluno_id bigint) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_coach_status_sessoes(p_aluno_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_result jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.wand_treinos WHERE aluno_id=p_aluno_id AND treinador_id=auth.uid()) THEN
    RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
  END IF;
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Nao autenticado'; END IF;
 SELECT COALESCE(jsonb_agg(jsonb_build_object('id',s.id,'situacao',s.situacao,
   'motivo_interrupcao',s.motivo_interrupcao,'observacao_interrupcao',s.observacao_interrupcao,
   'iniciada_em',s.iniciada_em,'finalizada_em',s.finalizada_em) ORDER BY s.iniciada_em DESC),'[]'::jsonb)
 INTO v_result FROM public.wand_sessoes_treino s
 JOIN public.wand_treinos t ON t.id=s.treino_id
 WHERE s.aluno_id=p_aluno_id AND t.treinador_id=auth.uid();
 RETURN v_result;
END $function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_coach_status_sessoes"(p_aluno_id bigint) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_coach_status_sessoes"(p_aluno_id bigint) TO authenticated;

CREATE OR REPLACE FUNCTION public.wand_contrato_aluno_elegivel(p_aluno_id bigint)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.alunos a
        WHERE a.id = p_aluno_id
          AND auth.uid() IS NOT NULL
          AND (a.user_id = auth.uid() OR public.wand_contrato_admin())
          AND (
              a.user_id IS NOT NULL
              OR EXISTS (
                  SELECT 1
                  FROM public.wand_solicitacoes_cadastro s
                  WHERE s.aluno_id = a.id
                    AND s.status = 'aprovada'
              )
          )
    );
$function$;

REVOKE EXECUTE ON FUNCTION "public"."wand_contrato_aluno_elegivel"(p_aluno_id bigint) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION "public"."wand_contrato_aluno_elegivel"(p_aluno_id bigint) TO authenticated;

ALTER POLICY "wand_comunicacoes_coach" ON "public"."wand_comunicacoes" USING ((treinador_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))) WITH CHECK ((treinador_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')));

ALTER POLICY "wand_contratos_coach" ON "public"."wand_contratos" USING ((treinador_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))) WITH CHECK (((treinador_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) AND (EXISTS ( SELECT 1
   FROM wand_planos p
  WHERE ((p.id = wand_contratos.plano_id) AND (p.treinador_id = auth.uid()))))));

ALTER POLICY "wand_planos_coach" ON "public"."wand_planos" USING ((treinador_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))) WITH CHECK ((treinador_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')));

ALTER POLICY "wand_relatorios_coach" ON "public"."wand_relatorios_evolucao" USING ((treinador_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))) WITH CHECK ((treinador_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')));

COMMIT;
