-- WAND METHOD: propostas para interessados sem login (etapa 1).
-- Não concede acesso aos treinos nem permite aceite público sem autenticação de e-mail.
create or replace function public.wand_contrato_criar(
 p_aluno_id bigint,p_modalidade text,p_plano text,p_descricao text,
 p_valor numeric,p_desconto numeric,p_multa numeric,p_documento text,p_versao text
) returns uuid language plpgsql security definer set search_path=public
as $$
declare v_meses integer;v_mensal numeric(12,2);v_total numeric(12,2);v_id uuid;
begin
 if not public.wand_contrato_admin() then raise exception 'Acesso não autorizado';end if;
 if not exists(select 1 from public.alunos where id=p_aluno_id and nullif(trim(email),'') is not null) then raise exception 'Interessado sem e-mail cadastrado';end if;
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


revoke all on function public.wand_contrato_criar(bigint,text,text,text,numeric,numeric,numeric,text,text) from public;
grant execute on function public.wand_contrato_criar(bigint,text,text,text,numeric,numeric,numeric,text,text) to authenticated;
