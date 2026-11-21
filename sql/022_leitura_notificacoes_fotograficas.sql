-- WAND METHOD | SQL 22
-- Leitura privada de notificacoes e confirmacao de leitura pelo destinatario.
-- Sem acesso de anonimos e sem permissao direta de escrita aos usuarios.
BEGIN;

ALTER TABLE public.wand_notificacoes_internas ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.wand_notificacoes_internas TO authenticated;

DROP POLICY IF EXISTS wand_notificacao_destinatario_select
ON public.wand_notificacoes_internas;

CREATE POLICY wand_notificacao_destinatario_select
ON public.wand_notificacoes_internas
FOR SELECT TO authenticated
USING (destinatario_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.wand_marcar_notificacao_fotografica_lida(p_notificacao_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sessao nao autenticada';
  END IF;

  UPDATE public.wand_notificacoes_internas
  SET lida_em = now()
  WHERE id = p_notificacao_id
    AND destinatario_id = (SELECT auth.uid())
    AND tipo = 'fotografia_concluida'
    AND lida_em IS NULL
  RETURNING id INTO v_id;

  RETURN v_id IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.wand_marcar_notificacao_fotografica_lida(uuid)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.wand_marcar_notificacao_fotografica_lida(uuid)
TO authenticated;

COMMIT;
