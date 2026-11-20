-- WAND METHOD · Avaliação Postural (executar no SQL Editor do Supabase)
-- O aluno não tem acesso a esta tabela nesta etapa. A futura área Minha Evolução terá política específica.
create table if not exists public.wand_avaliacoes_posturais (
 id uuid primary key default gen_random_uuid(),
 aluno_id uuid not null references public.alunos(id) on delete cascade,
 avaliado_em date not null default current_date,
 observacoes jsonb not null default '[]'::jsonb,
 prioridades text not null default '',
 estrategia text not null default '',
 resumo text not null default '',
 status text not null default 'rascunho' check(status in ('rascunho','publicado')),
 criado_por uuid not null default auth.uid(),
 criado_em timestamptz not null default now()
);
create index if not exists wand_avaliacoes_posturais_aluno_data_idx on public.wand_avaliacoes_posturais(aluno_id,avaliado_em desc);
alter table public.wand_avaliacoes_posturais enable row level security;
revoke all on public.wand_avaliacoes_posturais from anon;
grant select,insert,update,delete on public.wand_avaliacoes_posturais to authenticated;
drop policy if exists wand_postural_coach_select on public.wand_avaliacoes_posturais;
drop policy if exists wand_postural_coach_insert on public.wand_avaliacoes_posturais;
drop policy if exists wand_postural_coach_update on public.wand_avaliacoes_posturais;
drop policy if exists wand_postural_coach_delete on public.wand_avaliacoes_posturais;
create policy wand_postural_coach_select on public.wand_avaliacoes_posturais for select to authenticated using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin'));
create policy wand_postural_coach_insert on public.wand_avaliacoes_posturais for insert to authenticated with check (criado_por=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin'));
create policy wand_postural_coach_update on public.wand_avaliacoes_posturais for update to authenticated using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin'));
create policy wand_postural_coach_delete on public.wand_avaliacoes_posturais for delete to authenticated using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin'));
