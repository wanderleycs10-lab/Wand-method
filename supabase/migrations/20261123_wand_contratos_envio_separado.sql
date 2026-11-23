-- Distingue proposta criada de e-mail efetivamente enviado.
alter table public.wand_propostas add column if not exists email_enviado_em timestamptz;
create index if not exists wand_propostas_email_enviado_idx on public.wand_propostas(email_enviado_em);
comment on column public.wand_propostas.email_enviado_em is 'Preenchido apenas após confirmação de envio pelo provedor de e-mail; NULL indica proposta pronta para envio.';

-- Atualiza a listagem administrativa para incluir o registro de envio.
-- É necessário recriar a função pois a estrutura de retorno foi ampliada.
drop function if exists public.wand_contrato_admin_propostas();
create function public.wand_contrato_admin_propostas()
returns table(id uuid,aluno_id bigint,modalidade text,plano text,mensalidade numeric,total numeric,status text,enviada_em timestamptz,decidida_em timestamptz,pagamento_confirmado boolean,ativado boolean,email_enviado_em timestamptz)
language plpgsql stable security definer set search_path=public
as $$
begin
 if not public.wand_contrato_admin() then raise exception 'Acesso não autorizado';end if;
 return query select p.id,p.aluno_id,p.modalidade,p.plano,p.mensalidade,p.total,p.status,p.enviada_em,p.decidida_em,
 exists(select 1 from public.wand_pagamentos_contrato x where x.proposta_id=p.id),
 exists(select 1 from public.wand_ativacoes_contrato x where x.proposta_id=p.id),p.email_enviado_em
 from public.wand_propostas p order by p.criada_em desc limit 200;
end $$;
revoke all on function public.wand_contrato_admin_propostas() from public;
grant execute on function public.wand_contrato_admin_propostas() to authenticated;
