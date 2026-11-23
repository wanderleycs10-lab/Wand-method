-- WAND METHOD — aceite verificado por e-mail antes do cadastro.
-- Rodar uma vez no SQL Editor do Supabase.
create table if not exists public.wand_aceites_email (
 proposta_id uuid primary key references public.wand_propostas(id),
 email_confirmado text not null,
 decisao text not null check(decisao in ('aceito','recusado')),
 versao_contrato text not null,
 documento_sha256 text not null,
 registrado_em timestamptz not null default now(),
 ip_hash text,
 agente_usuario text
);
alter table public.wand_aceites_email enable row level security;
revoke all on public.wand_aceites_email from public, anon, authenticated;
-- A ativação continua restrita ao treinador, pagamento confirmado e aceite registrado.
create or replace function public.wand_contrato_ativar(p_proposta_id uuid)
returns void language plpgsql security definer set search_path=public
as $$
declare v_aluno bigint;
begin
 if not public.wand_contrato_admin() then raise exception 'Acesso não autorizado';end if;
 select aluno_id into v_aluno from public.wand_propostas where id=p_proposta_id and status='aceita' for update;
 if not found or not (
   exists(select 1 from public.wand_aceites where proposta_id=p_proposta_id and decisao='aceito')
   or exists(select 1 from public.wand_aceites_email where proposta_id=p_proposta_id and decisao='aceito')
 ) or not exists(select 1 from public.wand_pagamentos_contrato where proposta_id=p_proposta_id)
 then raise exception 'Aceite e pagamento obrigatórios';end if;
 -- Sem login vinculado, a ativação de acesso não é permitida.
 if not exists(select 1 from public.alunos where id=v_aluno and user_id is not null)
 then raise exception 'Aluno precisa concluir o cadastro de acesso antes da ativação';end if;
 insert into public.wand_ativacoes_contrato(proposta_id,ativado_por) values(p_proposta_id,auth.uid());
 update public.alunos set "Status"='ativo' where id=v_aluno;
end $$;
revoke all on function public.wand_contrato_ativar(uuid) from public;
grant execute on function public.wand_contrato_ativar(uuid) to authenticated;
