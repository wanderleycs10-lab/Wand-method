-- WAND METHOD | SQL 20
-- Concluir pedido somente quando as tres posicoes forem registradas
-- apos a criacao do pedido. Executar no SQL Editor do Supabase.
-- Nao modifica fotografias, consentimentos ou pedidos anteriores.

BEGIN;

CREATE OR REPLACE FUNCTION public.wand_concluir_solicitacao_fotografica()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_pedido uuid;
BEGIN
  SELECT s.id INTO v_pedido
  FROM public.wand_solicitacoes_fotograficas s
  WHERE s.aluno_id = NEW.aluno_id
    AND s.status = 'pendente'
    AND s.criada_em <= NEW.criado_em
    AND EXISTS (
      SELECT 1 FROM public.consentimentos_fotograficos c
      WHERE c.aluno_id = NEW.aluno_id
        AND c.status_avaliacao = 'autorizada'
    )
    AND EXISTS (
      SELECT 1 FROM public.fotos_avaliacao f
      WHERE f.aluno_id = NEW.aluno_id
        AND f.criado_em >= s.criada_em
        AND lower(f.posicao) = 'frente'
    )
    AND EXISTS (
      SELECT 1 FROM public.fotos_avaliacao f
      WHERE f.aluno_id = NEW.aluno_id
        AND f.criado_em >= s.criada_em
        AND lower(f.posicao) IN ('perfil','lado')
    )
    AND EXISTS (
      SELECT 1 FROM public.fotos_avaliacao f
      WHERE f.aluno_id = NEW.aluno_id
        AND f.criado_em >= s.criada_em
        AND lower(f.posicao) = 'costas'
    )
  ORDER BY s.criada_em DESC
  LIMIT 1;

  IF v_pedido IS NOT NULL THEN
    UPDATE public.wand_solicitacoes_fotograficas
       SET status = 'concluida',
           concluida_em = now()
     WHERE id = v_pedido
       AND status = 'pendente';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.wand_concluir_solicitacao_fotografica()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS wand_foto_concluir_apos_envio
ON public.fotos_avaliacao;

CREATE TRIGGER wand_foto_concluir_apos_envio
AFTER INSERT ON public.fotos_avaliacao
FOR EACH ROW
EXECUTE FUNCTION public.wand_concluir_solicitacao_fotografica();

COMMIT;
