-- WAND METHOD | complemento de PACOTES DE AULAS
-- Execute após a migração de contratações v2 já instalada.
alter table public.wand_propostas add column if not exists quantidade_aulas integer;
alter table public.wand_propostas add column if not exists validade_dias integer;
alter table public.wand_propostas drop constraint if exists wand_propostas_plano_check;
alter table public.wand_propostas add constraint wand_propostas_plano_check check (plano in ('mensal','trimestral','semestral','pacote'));
alter table public.wand_propostas drop constraint if exists wand_propostas_meses_check;
alter table public.wand_propostas add constraint wand_propostas_meses_check check (meses in (0,1,3,6));
alter table public.wand_propostas add constraint wand_propostas_pacote_campos_check check (
 (plano='pacote' and quantidade_aulas between 1 and 200 and validade_dias between 1 and 730 and meses=0 and desconto_percentual=0 and multa_percentual=0)
 or (plano<>'pacote' and quantidade_aulas is null and validade_dias is null and meses in (1,3,6))
);
create or replace function public.wand_contrato_criar_pacote(
 p_aluno_id bigint,p_documento text,p_versao text,p_quantidade integer,
 p_validade integer,p_total numeric,p_descricao text default ''
) returns uuid language plpgsql security definer set search_path=public,extensions
as $$
declare v_id uuid;
begin
 if not public.wand_contrato_admin() then raise exception 'Acesso não autorizado';end if;
 if not exists(select 1 from public.alunos where id=p_aluno_id and user_id is not null) then raise exception 'Aluno sem conta vinculada';end if;
 if p_quantidade is null or p_quantidade not between 1 and 200 or p_validade is null or p_validade not between 1 and 730 then raise exception 'Quantidade ou validade inválida';end if;
 if p_total is null or p_total<=0 or p_total>1000000 then raise exception 'Preço inválido';end if;
 if nullif(trim(p_versao),'') is null or length(coalesce(p_documento,''))<200 or length(coalesce(p_documento,''))>60000 or length(coalesce(p_descricao,''))>2000 then raise exception 'Documento inválido';end if;
 update public.wand_propostas set status='substituida' where aluno_id=p_aluno_id and status='enviada';
 insert into public.wand_propostas(aluno_id,criado_por,modalidade,plano,descricao,valor_referencia,desconto_percentual,mensalidade,meses,total,multa_percentual,documento_texto,documento_sha256,versao_contrato,quantidade_aulas,validade_dias)
 values(p_aluno_id,auth.uid(),'Pacote de aulas','pacote',coalesce(p_descricao,''),p_total,0,p_total,0,p_total,0,p_documento,encode(extensions.digest(convert_to(p_documento,'UTF8'),'sha256'),'hex'),p_versao,p_quantidade,p_validade)
 returning id into v_id;
 return v_id;
end $$;
revoke all on function public.wand_contrato_criar_pacote(bigint,text,text,integer,integer,numeric,text) from public;
grant execute on function public.wand_contrato_criar_pacote(bigint,text,text,integer,integer,numeric,text) to authenticated;
