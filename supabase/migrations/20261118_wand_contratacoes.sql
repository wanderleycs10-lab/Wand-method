-- WAND METHOD | Contratações v1
-- Executar no SQL Editor do projeto Supabase após revisar os vínculos de autenticação.
-- NÃO executar automaticamente a partir do navegador.
create extension if not exists pgcrypto;
create table if not exists public.wand_propostas (
 id uuid primary key default gen_random_uuid(),
 aluno_id uuid not null references public.alunos(id),
 criado_por uuid not null default auth.uid(),
 plano text not null check (plano in ('mensal','trimestral','semestral')),
 modalidade text not null,
 descricao text,
 valor_referencia numeric(12,2) not null check(valor_referencia>=0),
 desconto_percentual numeric(5,2) not null check(desconto_percentual between 0 and 100),
 mensalidade numeric(12,2) not null check(mensalidade>=0),
 meses integer not null check(meses in (1,3,6)),
 total numeric(12,2) not null check(total>=0),
 multa_percentual numeric(5,2) not null default 0 check(multa_percentual between 0 and 10),
 versao_contrato text not null,
 documento_sha256 text,
 documento_url text,
 status text not null default 'rascunho' check(status in ('rascunho','enviada','aceita','recusada','substituida','cancelada')),
 enviada_em timestamptz,
 decidida_em timestamptz,
 criada_em timestamptz not null default now(),
 atualizada_em timestamptz not null default now()
);
create table if not exists public.wand_aceites (
 id uuid primary key default gen_random_uuid(),
 proposta_id uuid not null unique references public.wand_propostas(id),
 aluno_auth_uid uuid not null,
 decisao text not null check(decisao in ('aceito','recusado')),
 versao_contrato text not null,
 documento_sha256 text not null,
 registrado_em timestamptz not null default now()
);
create table if not exists public.wand_pagamentos_contrato (
 id uuid primary key default gen_random_uuid(),
 proposta_id uuid not null unique references public.wand_propostas(id),
 confirmado_por uuid not null,
 confirmado_em timestamptz not null default now(),
 observacao text
);
create table if not exists public.wand_ativacoes_contrato (
 id uuid primary key default gen_random_uuid(),
 proposta_id uuid not null unique references public.wand_propostas(id),
 ativado_por uuid not null,
 ativado_em timestamptz not null default now()
);
create index if not exists wand_propostas_aluno_idx on public.wand_propostas(aluno_id,status);
alter table public.wand_propostas enable row level security;
alter table public.wand_aceites enable row level security;
alter table public.wand_pagamentos_contrato enable row level security;
alter table public.wand_ativacoes_contrato enable row level security;
-- Segurança: nenhum acesso direto por anon/authenticated até mapear
-- com segurança alunos.id -> auth.uid() e os papéis de treinador.
-- Criar políticas RLS e funções SECURITY DEFINER auditadas antes de liberar.
revoke all on public.wand_propostas,public.wand_aceites,public.wand_pagamentos_contrato,public.wand_ativacoes_contrato from anon,authenticated;
-- Regras obrigatórias da futura API:
-- 1) só treinador autorizado cria/envia/substitui proposta;
-- 2) só aluno autenticado vinculado à proposta pode aceitar/recusar;
-- 3) aceite exige hash SHA-256 do PDF final imutável;
-- 4) uma proposta substituída não pode ser aceita;
-- 5) pagamento só pode ser confirmado pelo treinador ou webhook validado;
-- 6) ativação somente pelo treinador, com aceite e pagamento confirmados;
-- 7) registrar trilha de auditoria e não permitir editar proposta aceita.
