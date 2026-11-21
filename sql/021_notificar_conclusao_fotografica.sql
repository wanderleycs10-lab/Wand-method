-- WAND METHOD | SQL 21
-- Notificacao interna ao treinador quando uma solicitacao fotografica for concluida.
-- Nao envia push, WhatsApp ou e-mail. Nao expoe fotografias.
BEGIN;

CREATE OR REPLACE FUNCTION public.wand_notificar_conclusao_fotografica()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.status = 'pendente' AND NEW.status = 'concluida' THEN
    INSERT INTO public.wand_notificacoes_internas
      (destinatario_id, aluno_id, tipo, referencia_id, titulo)
    SELECT NEW.solicitado_por,
           NEW.aluno_id,
           'fotografia_concluida',
           NEW.id,
           'Avaliação fotográfica recebida'
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.wand_notificacoes_internas n
      WHERE n.destinatario_id = NEW.solicitado_por
        AND n.tipo = 'fotografia_concluida'
        AND n.referencia_id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.wand_notificar_conclusao_fotografica()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS wand_notificar_conclusao_fotografica
ON public.wand_solicitacoes_fotograficas;

CREATE TRIGGER wand_notificar_conclusao_fotografica
AFTER UPDATE OF status ON public.wand_solicitacoes_fotograficas
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.wand_notificar_conclusao_fotografica();

COMMIT;
