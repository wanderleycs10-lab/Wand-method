-- WAND METHOD — base privada para aceite pré-cadastro por e-mail.
-- Executar no SQL Editor. Não libera leitura nem decisão sem verificação.
create extension if not exists pgcrypto;
create table if not exists public.wand_contrato_verificacoes (
 id uuid primary key default gen_random_uuid(),
 proposta_id uuid not null references public.wand_propostas(id) on delete cascade,
 email_destino text not null,
 codigo_hash text,
 codigo_expira_em timestamptz,
 codigo_tentativas integer not null default 0 check (codigo_tentativas between 0 and 10),
 codigo_enviado_em timestamptz,
 acesso_hash text,
 acesso_expira_em timestamptz,
 acesso_utilizado_em timestamptz,
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now(),
 unique (proposta_id)
);
create index if not exists wand_contrato_verificacoes_expira_idx on public.wand_contrato_verificacoes(codigo_expira_em);
alter table public.wand_contrato_verificacoes enable row level security;
revoke all on public.wand_contrato_verificacoes from public, anon, authenticated;
-- Apenas a função de servidor com service_role poderá consultar ou modificar esses registros.
comment on table public.wand_contrato_verificacoes is 'Verificação privada de e-mail para propostas antes da criação de login; nunca expor hashes nem códigos ao cliente.';
