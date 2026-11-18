-- WAND METHOD — Contratações v2 (executar no SQL Editor do Supabase)
-- Substitui o rascunho anterior, que usava aluno_id uuid indevidamente.
-- Exige public.alunos(id numérico, user_id uuid), public.profiles(id uuid, role text).
create extension if not exists pgcrypto;
create table if not exists public.wand_propostas (
 id uuid primary key default gen_random_uuid(),
 aluno_id bigint not null references public.alunos(id),
 criado_por uuid not null references auth.users(id),
 modalidade text not null,
 plano text not null check(plano in ('mensal','trimestral','semestral')),
 descricao text not null default '',
 valor_referencia numeric(12,2) not null check(valor_referencia>0),
 desconto_percentual numeric(5,2) not null check(desconto_percentual between 0 and 100),
 mensalidade numeric(12,2) not null check(mensalidade>0),
 meses integer not null check(meses in (1,3,6)),
 total numeric(12,2) not null check(total>0),
 multa_percentual numeric(5,2) not null check(multa_percentual between 0 and 10),
 documento_texto text not null,
 documento_sha256 text not null,
 versao_contrato text not null,
 status text not null default 'enviada' check(status in ('enviada','aceita','recusada','substituida')),
 enviada_em timestamptz not null default now(),
 decidida_em timestamptz,
 criada_em timestamptz not null default now()
);
create table if not exists public.wand_aceites (
 id uuid primary key default gen_random_uuid(),
 proposta_id uuid not null unique references public.wand_propostas(id),
 aluno_auth_uid uuid not null references auth.users(id),
 decisao text not null check(decisao in ('aceito','recusado')),
 versao_contrato text not null,
 documento_sha256 text not null,
 registrado_em timestamptz not null default now()
);
create table if not exists public.wand_pagamentos_contrato (
 proposta_id uuid primary key references public.wand_propostas(id),
 confirmado_por uuid not null references auth.users(id),
 confirmado_em timestamptz not null default now(),
 observacao text
);
create table if not exists public.wand_ativacoes_contrato (
 proposta_id uuid primary key references public.wand_propostas(id),
 ativado_por uuid not null references auth.users(id),
 ativado_em timestamptz not null default now()
);
create index if not exists wand_propostas_aluno_idx on public.wand_propostas(aluno_id,criada_em desc);
alter table public.wand_propostas enable row level security;
alter table public.wand_aceites enable row level security;
alter table public.wand_pagamentos_contrato enable row level security;
alter table public.wand_ativacoes_contrato enable row level security;
revoke all on public.wand_propostas,public.wand_aceites,public.wand_pagamentos_contrato,public.wand_ativacoes_contrato from anon,authenticated;

create or replace function public.wand_contrato_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
revoke all on function public.wand_contrato_admin() from public;
grant execute on function public.wand_contrato_admin() to authenticated;

create or replace function public.wand_contrato_criar(
 p_aluno_id bigint,p_modalidade text,p_plano text,p_descricao text,
 p_valor numeric,p_desconto numeric,p_multa numeric,p_documento text,p_versao text
) returns uuid language plpgsql security definer set search_path=public
as $$
declare v_meses integer;v_mensal numeric(12,2);v_total numeric(12,2);v_id uuid;
begin
 if not public.wand_contrato_admin() then raise exception 'Acesso não autorizado';end if;
 if not exists(select 1 from public.alunos where id=p_aluno_id and user_id is not null) then raise exception 'Aluno sem conta vinculada';end if;
 if p_plano not in ('mensal','trimestral','semestral') then raise exception 'Plano inválido';end if;
 if p_valor is null or p_valor<=0 or p_valor>1000000 or p_desconto is null or p_desconto<0 or p_desconto>=100 or p_multa is null or p_multa<0 or p_multa>10 then raise exception 'Valores inválidos';end if;
 if nullif(trim(p_modalidade),'') is null or length(p_modalidade)>150 or length(coalesce(p_descricao,''))>2000 or length(coalesce(p_documento,''))<200 or length(coalesce(p_documento,''))>60000 or nullif(trim(p_versao),'') is null then raise exception 'Documento ou modalidade inválida';end if;
 v_meses:=case p_plano when 'mensal' then 1 when 'trimestral' then 3 else 6 end;
 if v_meses=1 and (p_desconto<>0 or p_multa<>0) then raise exception 'Plano mensal não tem desconto de prazo nem multa de fidelidade';end if;
 v_mensal:=round(p_valor*(1-p_desconto/100),2);v_total:=round(v_mensal*v_meses,2);
 update public.wand_propostas set status='substituida' where aluno_id=p_aluno_id and status='enviada';
 insert into public.wand_propostas(aluno_id,criado_por,modalidade,plano,descricao,valor_referencia,desconto_percentual,mensalidade,meses,total,multa_percentual,documento_texto,documento_sha256,versao_contrato)
 values(p_aluno_id,auth.uid(),trim(p_modalidade),p_plano,coalesce(p_descricao,''),p_valor,p_desconto,v_mensal,v_meses,v_total,p_multa,p_documento,encode(digest(convert_to(p_documento,'UTF8'),'sha256'),'hex'),p_versao)
 returning id into v_id;
 return v_id;
end $$;

create or replace function public.wand_contrato_minhas_propostas()
returns table(id uuid,aluno_id bigint,modalidade text,plano text,mensalidade numeric,total numeric,status text,documento_texto text,documento_sha256 text,versao_contrato text,enviada_em timestamptz,decidida_em timestamptz,pagamento_confirmado boolean,ativado boolean)
language sql stable security definer set search_path=public
as $$
select p.id,p.aluno_id,p.modalidade,p.plano,p.mensalidade,p.total,p.status,p.documento_texto,p.documento_sha256,p.versao_contrato,p.enviada_em,p.decidida_em,
exists(select 1 from public.wand_pagamentos_contrato x where x.proposta_id=p.id),
exists(select 1 from public.wand_ativacoes_contrato x where x.proposta_id=p.id)
from public.wand_propostas p join public.alunos a on a.id=p.aluno_id
where a.user_id=auth.uid() order by p.criada_em desc limit 30 $$;

create or replace function public.wand_contrato_admin_propostas()
returns table(id uuid,aluno_id bigint,modalidade text,plano text,mensalidade numeric,total numeric,status text,enviada_em timestamptz,decidida_em timestamptz,pagamento_confirmado boolean,ativado boolean)
language plpgsql stable security definer set search_path=public
as $$
begin
 if not public.wand_contrato_admin() then raise exception 'Acesso não autorizado';end if;
 return query select p.id,p.aluno_id,p.modalidade,p.plano,p.mensalidade,p.total,p.status,p.enviada_em,p.decidida_em,
 exists(select 1 from public.wand_pagamentos_contrato x where x.proposta_id=p.id),
 exists(select 1 from public.wand_ativacoes_contrato x where x.proposta_id=p.id)
 from public.wand_propostas p order by p.criada_em desc limit 200;
end $$;

create or replace function public.wand_contrato_decidir(p_proposta_id uuid,p_aceitar boolean)
returns void language plpgsql security definer set search_path=public
as $$
declare v public.wand_propostas%rowtype;
begin
 select p.* into v from public.wand_propostas p join public.alunos a on a.id=p.aluno_id
 where p.id=p_proposta_id and a.user_id=auth.uid() for update of p;
 if not found then raise exception 'Proposta não encontrada';end if;
 if v.status<>'enviada' then raise exception 'Proposta indisponível para aceite';end if;
 insert into public.wand_aceites(proposta_id,aluno_auth_uid,decisao,versao_contrato,documento_sha256)
 values(v.id,auth.uid(),case when p_aceitar then 'aceito' else 'recusado' end,v.versao_contrato,v.documento_sha256);
 update public.wand_propostas set status=case when p_aceitar then 'aceita' else 'recusada' end,decidida_em=now() where id=v.id;
end $$;

create or replace function public.wand_contrato_confirmar_pagamento(p_proposta_id uuid,p_observacao text default null)
returns void language plpgsql security definer set search_path=public
as $$
begin
 if not public.wand_contrato_admin() then raise exception 'Acesso não autorizado';end if;
 if not exists(select 1 from public.wand_propostas where id=p_proposta_id and status='aceita') then raise exception 'Contrato ainda não aceito';end if;
 insert into public.wand_pagamentos_contrato(proposta_id,confirmado_por,observacao) values(p_proposta_id,auth.uid(),left(coalesce(p_observacao,''),500));
end $$;

create or replace function public.wand_contrato_ativar(p_proposta_id uuid)
returns void language plpgsql security definer set search_path=public
as $$
declare v_aluno bigint;
begin
 if not public.wand_contrato_admin() then raise exception 'Acesso não autorizado';end if;
 select aluno_id into v_aluno from public.wand_propostas where id=p_proposta_id and status='aceita' for update;
 if not found or not exists(select 1 from public.wand_aceites where proposta_id=p_proposta_id and decisao='aceito')
 or not exists(select 1 from public.wand_pagamentos_contrato where proposta_id=p_proposta_id) then raise exception 'Aceite e pagamento obrigatórios';end if;
 insert into public.wand_ativacoes_contrato(proposta_id,ativado_por) values(p_proposta_id,auth.uid());
 update public.alunos set "Status"='ativo' where id=v_aluno;
end $$;

revoke all on function public.wand_contrato_criar(bigint,text,text,text,numeric,numeric,numeric,text,text) from public;
revoke all on function public.wand_contrato_minhas_propostas() from public;
revoke all on function public.wand_contrato_admin_propostas() from public;
revoke all on function public.wand_contrato_decidir(uuid,boolean) from public;
revoke all on function public.wand_contrato_confirmar_pagamento(uuid,text) from public;
revoke all on function public.wand_contrato_ativar(uuid) from public;
grant execute on function public.wand_contrato_criar(bigint,text,text,text,numeric,numeric,numeric,text,text),public.wand_contrato_minhas_propostas(),public.wand_contrato_admin_propostas(),public.wand_contrato_decidir(uuid,boolean),public.wand_contrato_confirmar_pagamento(uuid,text),public.wand_contrato_ativar(uuid) to authenticated;
