-- WAND METHOD: executar no SQL Editor do Supabase antes de testar o formulário público.
-- Solicitações são registros pré-contratuais, não criam usuário auth nem liberam acesso.
create table if not exists public.wand_solicitacoes_cadastro (
 id bigint generated always as identity primary key,
 nome_completo text not null check (length(nome_completo) between 3 and 150),
 email text not null,
 whatsapp text not null,
 modalidade text not null check(modalidade in ('online','presencial','semipresencial')),
 status text not null default 'pendente' check(status in ('pendente','em_contato','aprovada','recusada')),
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now(),
 aluno_id bigint null
);
create index if not exists wand_solicitacoes_cadastro_status_idx on public.wand_solicitacoes_cadastro(status,criado_em desc);
alter table public.wand_solicitacoes_cadastro enable row level security;
revoke all on public.wand_solicitacoes_cadastro from anon,authenticated;
create or replace function public.wand_solicitar_cadastro(p_nome text,p_email text,p_whatsapp text,p_modalidade text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
 if length(trim(coalesce(p_nome,''))) not between 3 and 150
 or length(trim(coalesce(p_email,''))) not between 5 and 254
 or trim(p_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 or length(trim(coalesce(p_whatsapp,''))) not between 10 and 20
 or p_modalidade not in ('online','presencial','semipresencial') then
  raise exception 'Dados de cadastro inválidos';
 end if;
 -- Não retornar dados pessoais; evitar revelar se e-mail já consta na base.
 insert into public.wand_solicitacoes_cadastro(nome_completo,email,whatsapp,modalidade)
 values(trim(p_nome),lower(trim(p_email)),trim(p_whatsapp),p_modalidade);
end $$;
revoke all on function public.wand_solicitar_cadastro(text,text,text,text) from public;
grant execute on function public.wand_solicitar_cadastro(text,text,text,text) to anon,authenticated;
-- Antes da exposição pública em escala, adicionar rate limiting / CAPTCHA no endpoint (Edge Function).
create or replace function public.wand_coach_solicitacoes_cadastro()
returns setof public.wand_solicitacoes_cadastro language plpgsql security definer set search_path = public, pg_temp as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then raise exception 'Acesso negado';end if;
 return query select * from public.wand_solicitacoes_cadastro order by criado_em desc;
end $$;
revoke all on function public.wand_coach_solicitacoes_cadastro() from public;
grant execute on function public.wand_coach_solicitacoes_cadastro() to authenticated;
create or replace function public.wand_coach_status_solicitacao(p_id bigint,p_status text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then raise exception 'Acesso negado';end if;
 if p_status not in ('pendente','em_contato','aprovada','recusada') then raise exception 'Status inválido';end if;
 update public.wand_solicitacoes_cadastro set status=p_status,atualizado_em=now() where id=p_id;
 if not found then raise exception 'Solicitação não encontrada';end if;
end $$;
revoke all on function public.wand_coach_status_solicitacao(bigint,text) from public;
grant execute on function public.wand_coach_status_solicitacao(bigint,text) to authenticated;
-- Aprovar uma solicitação ainda NÃO cria um aluno, convite, contrato ou senha.
-- Essas transições dependem de integrar com as RPCs de contratos já existentes e de
-- um backend autenticado com permissões adequadas para enviar convites Auth.
