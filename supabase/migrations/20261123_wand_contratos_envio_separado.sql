-- Distingue proposta criada de e-mail efetivamente enviado.
alter table public.wand_propostas add column if not exists email_enviado_em timestamptz;
create index if not exists wand_propostas_email_enviado_idx on public.wand_propostas(email_enviado_em);
comment on column public.wand_propostas.email_enviado_em is 'Preenchido apenas após confirmação de envio pelo provedor de e-mail; NULL indica proposta pronta para envio.';
