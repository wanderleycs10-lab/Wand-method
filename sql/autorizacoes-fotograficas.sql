-- WAND METHOD: consentimentos fotográficos (base para integração com área do aluno)
-- Consentimento precisa ser concedido pelo próprio titular em fluxo autenticado;
-- este script NÃO cria autorizações automaticamente.
create table if not exists public.wand_autorizacoes_fotograficas (
 id bigint generated always as identity primary key,
 aluno_id bigint not null references public.alunos(id) on delete cascade,
 tipo text not null check(tipo in ('avaliacao','divulgacao')),
 concedida_em timestamptz not null default now(),
 criado_em timestamptz not null default now(),
 revogada_em timestamptz,
 versao_termo text not null,
 titular_uid uuid not null,
 constraint autorizacao_termo_obrigatorio check(length(trim(versao_termo))>0)
);
create unique index if not exists wand_autorizacao_foto_ativa on public.wand_autorizacoes_fotograficas(aluno_id,tipo) where revogada_em is null;
alter table public.wand_autorizacoes_fotograficas enable row level security;
revoke all on public.wand_autorizacoes_fotograficas from anon,authenticated;
grant select on public.wand_autorizacoes_fotograficas to authenticated;
drop policy if exists wand_autorizacao_consulta on public.wand_autorizacoes_fotograficas;
create policy wand_autorizacao_consulta on public.wand_autorizacoes_fotograficas for select to authenticated using (
 exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
 or titular_uid=auth.uid()
);
-- Concessão e revogação exigem RPCs autenticadas e termo específico,
-- a serem integrados com a área do aluno antes de habilitar o recurso.
