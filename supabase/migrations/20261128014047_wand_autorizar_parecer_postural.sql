-- Usa o mesmo vínculo por treino da autorização do WAND LEGACY.
-- Alunos têm leitura dos pareceres publicados. Publicar preserva a linha existente.

drop policy if exists wand_postural_coach_select on public.wand_avaliacoes_posturais;
create policy wand_postural_coach_select on public.wand_avaliacoes_posturais
for select to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
  and exists (
    select 1 from public.wand_treinos t
    where t.aluno_id = wand_avaliacoes_posturais.aluno_id
      and t.treinador_id = (select auth.uid())
  )
  and (status = 'publicado' or criado_por = (select auth.uid()))
);

drop policy if exists wand_postural_coach_insert on public.wand_avaliacoes_posturais;
create policy wand_postural_coach_insert on public.wand_avaliacoes_posturais
for insert to authenticated with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
  and exists (
    select 1 from public.wand_treinos t
    where t.aluno_id = wand_avaliacoes_posturais.aluno_id
      and t.treinador_id = (select auth.uid())
  )
  and criado_por = (select auth.uid())
);

drop policy if exists wand_postural_coach_update on public.wand_avaliacoes_posturais;
create policy wand_postural_coach_update on public.wand_avaliacoes_posturais
for update to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
  and exists (
    select 1 from public.wand_treinos t
    where t.aluno_id = wand_avaliacoes_posturais.aluno_id
      and t.treinador_id = (select auth.uid())
  )
  and criado_por = (select auth.uid())
  and status = 'rascunho'
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
  and exists (
    select 1 from public.wand_treinos t
    where t.aluno_id = wand_avaliacoes_posturais.aluno_id
      and t.treinador_id = (select auth.uid())
  )
  and criado_por = (select auth.uid())
);

drop policy if exists wand_postural_coach_delete on public.wand_avaliacoes_posturais;
create policy wand_postural_coach_delete on public.wand_avaliacoes_posturais
for delete to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
  and exists (
    select 1 from public.wand_treinos t
    where t.aluno_id = wand_avaliacoes_posturais.aluno_id
      and t.treinador_id = (select auth.uid())
  )
  and criado_por = (select auth.uid())
  and status = 'rascunho'
);

drop policy if exists wand_postural_aluno_publicado_select on public.wand_avaliacoes_posturais;
create policy wand_postural_aluno_publicado_select on public.wand_avaliacoes_posturais
for select to authenticated using (
  status = 'publicado'
  and exists (
    select 1 from public.alunos a
    where a.id = wand_avaliacoes_posturais.aluno_id
      and a.user_id = (select auth.uid())
  )
);
