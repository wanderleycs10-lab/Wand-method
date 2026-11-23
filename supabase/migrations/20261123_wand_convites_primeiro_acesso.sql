-- WAND METHOD: rastreamento seguro de convites para primeiro acesso.
-- Preparação: não dispara e-mails e não altera cadastros existentes.
create table if not exists public.wand_convites_acesso (
 aluno_id bigint primary key references public.alunos(id) on delete cascade,
 proposta_id uuid references public.wand_propostas(id),
 email_destino text not null,
 auth_uid uuid references auth.users(id),
 status text not null default 'pendente' check (status in ('pendente','enviado','configurado','erro')),
 enviado_em timestamptz,
 configurado_em timestamptz,
 erro_ultimo_envio text,
 atualizado_em timestamptz not null default now()
);
alter table public.wand_convites_acesso enable row level security;
revoke all on public.wand_convites_acesso from public, anon, authenticated;
grant select,insert,update on public.wand_convites_acesso to service_role;
create index if not exists wand_convites_acesso_proposta_idx on public.wand_convites_acesso(proposta_id);
comment on table public.wand_convites_acesso is 'Controle de convites de acesso, sem armazenar senha ou token de autenticação';
notify pgrst, 'reload schema';
