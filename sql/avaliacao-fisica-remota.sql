-- WAND METHOD — Avaliação física remota, com revisão obrigatória
-- Execute no SQL Editor do Supabase antes de testar o envio.
create table if not exists public.wand_solicitacoes_avaliacao_fisica (
 id bigint generated always as identity primary key,
 aluno_id bigint not null references public.alunos(id) on delete cascade,
 status text not null default 'pendente' check (status in ('pendente','enviada','validada')),
 medidas jsonb not null default '{}'::jsonb,
 solicitada_em timestamptz not null default now(),
 enviada_em timestamptz,
 validada_em timestamptz,
 avaliacao_id bigint,
 constraint wand_avaliacao_medidas_objeto check (jsonb_typeof(medidas)='object')
);
create index if not exists wand_solicitacoes_avaliacao_aluno_idx on public.wand_solicitacoes_avaliacao_fisica(aluno_id,status);
alter table public.wand_solicitacoes_avaliacao_fisica enable row level security;
revoke all on public.wand_solicitacoes_avaliacao_fisica from anon,authenticated;
grant usage on schema public to authenticated;
create or replace function public.wand_avaliacao_eh_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;
create or replace function public.wand_solicitar_avaliacao_fisica(p_aluno_id bigint)
returns bigint language plpgsql security definer set search_path=public as $$
declare v_id bigint;
begin
 if not public.wand_avaliacao_eh_admin() then raise exception 'Acesso não autorizado'; end if;
 if not exists(select 1 from public.alunos where id=p_aluno_id) then raise exception 'Aluno não encontrado'; end if;
 if exists(select 1 from public.wand_solicitacoes_avaliacao_fisica where aluno_id=p_aluno_id and status in ('pendente','enviada')) then raise exception 'Já existe uma solicitação em andamento para este aluno'; end if;
 insert into public.wand_solicitacoes_avaliacao_fisica(aluno_id) values(p_aluno_id) returning id into v_id;
 return v_id;
end;$$;
create or replace function public.wand_aluno_avaliacoes_pendentes()
returns table(id bigint, solicitada_em timestamptz) language sql stable security definer set search_path=public as $$
 select s.id,s.solicitada_em from public.wand_solicitacoes_avaliacao_fisica s join public.alunos a on a.id=s.aluno_id where a.user_id=auth.uid() and s.status='pendente' order by s.solicitada_em desc;
$$;
create or replace function public.wand_enviar_avaliacao_aluno(p_solicitacao_id bigint,p_medidas jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare k text; v numeric;
begin
 if p_medidas is null or jsonb_typeof(p_medidas)<>'object' or p_medidas='{}'::jsonb then raise exception 'Informe ao menos uma medida'; end if;
 for k in select jsonb_object_keys(p_medidas) loop
  if k not in ('peso','cintura','quadril','braco_direito','braco_esquerdo','coxa_direita','coxa_esquerda') then raise exception 'Campo não permitido'; end if;
  if jsonb_typeof(p_medidas->k)<>'number' then raise exception 'Medida inválida'; end if;
  v=(p_medidas->>k)::numeric;
  if v<=0 or v>500 then raise exception 'Valor de medida fora do intervalo'; end if;
 end loop;
 update public.wand_solicitacoes_avaliacao_fisica s set medidas=p_medidas,status='enviada',enviada_em=now()
 where s.id=p_solicitacao_id and s.status='pendente' and exists(select 1 from public.alunos a where a.id=s.aluno_id and a.user_id=auth.uid());
 if not found then raise exception 'Solicitação não encontrada ou já enviada'; end if;
end;$$;
create or replace function public.wand_coach_avaliacoes_pendentes(p_aluno_id bigint)
returns table(id bigint, medidas jsonb, enviada_em timestamptz) language plpgsql stable security definer set search_path=public as $$
begin
 if not public.wand_avaliacao_eh_admin() then raise exception 'Acesso não autorizado'; end if;
 return query select s.id,s.medidas,s.enviada_em from public.wand_solicitacoes_avaliacao_fisica s where s.aluno_id=p_aluno_id and s.status='enviada' order by s.enviada_em desc;
end;$$;
create or replace function public.wand_validar_avaliacao_aluno(p_solicitacao_id bigint,p_parecer text)
returns bigint language plpgsql security definer set search_path=public as $$
declare s public.wand_solicitacoes_avaliacao_fisica%rowtype; v_id bigint;
begin
 if not public.wand_avaliacao_eh_admin() then raise exception 'Acesso não autorizado'; end if;
 if length(trim(coalesce(p_parecer,'')))<1 then raise exception 'Parecer obrigatório'; end if;
 select * into s from public.wand_solicitacoes_avaliacao_fisica where id=p_solicitacao_id and status='enviada' for update;
 if not found then raise exception 'Solicitação não encontrada ou já validada'; end if;
 insert into public.avaliacoes_fisicas(aluno_id,data_avaliacao,peso,cintura,quadril,braco_direito,braco_esquerdo,coxa_direita,coxa_esquerda,observacoes,parecer_profissional)
 values(s.aluno_id,(s.enviada_em at time zone 'America/Sao_Paulo')::date,
 (s.medidas->>'peso')::numeric,(s.medidas->>'cintura')::numeric,(s.medidas->>'quadril')::numeric,
 (s.medidas->>'braco_direito')::numeric,(s.medidas->>'braco_esquerdo')::numeric,
 (s.medidas->>'coxa_direita')::numeric,(s.medidas->>'coxa_esquerda')::numeric,
 'Medidas informadas pelo aluno e revisadas pelo treinador.',trim(p_parecer)) returning id into v_id;
 perform public.aprovar_avaliacao_fisica(v_id,trim(p_parecer));
 update public.wand_solicitacoes_avaliacao_fisica set status='validada',validada_em=now(),avaliacao_id=v_id where id=s.id;
 return v_id;
end;$$;
revoke all on function public.wand_avaliacao_eh_admin() from public;
grant execute on function public.wand_avaliacao_eh_admin() to authenticated;
grant execute on function public.wand_solicitar_avaliacao_fisica(bigint) to authenticated;
grant execute on function public.wand_aluno_avaliacoes_pendentes() to authenticated;
grant execute on function public.wand_enviar_avaliacao_aluno(bigint,jsonb) to authenticated;
grant execute on function public.wand_coach_avaliacoes_pendentes(bigint) to authenticated;
grant execute on function public.wand_validar_avaliacao_aluno(bigint,text) to authenticated;
