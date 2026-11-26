begin;

alter table wand_legacy.aviso add column sessao_id uuid;
create unique index wand_legacy_aviso_sessao_unico
  on wand_legacy.aviso (destinatario,sessao_id) where sessao_id is not null;

create function wand_legacy.avisar_treino() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.situacao is distinct from 'concluido' or new.finalizada_em is null then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    if old.situacao = 'concluido' and old.finalizada_em is not null then return new; end if;
  end if;
  insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino,sessao_id)
    select t.treinador_id,new.aluno_id,'Treino concluído: '||coalesce(t.nome,'Treino prescrito'),'treinos',new.id
    from public.wand_treinos t
    join public.profiles p on p.id = t.treinador_id and p.role = 'admin'
    where t.id = new.treino_id and t.aluno_id = new.aluno_id
    on conflict do nothing;
  return new;
end;
$$;

create trigger wand_legacy_treino_aviso after insert or update of situacao,finalizada_em
on public.wand_sessoes_treino for each row execute function wand_legacy.avisar_treino();

create function wand_legacy.avisar_personal_credito() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.xp > 0 or new.energia > 0 then
    insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
      values (new.validado_por,new.aluno_id,
        'Crédito registrado: +'||new.xp||' XP e +'||new.energia||' WAND ENERGY','historico');
  end if;
  return new;
end;
$$;

create trigger wand_legacy_personal_credito_aviso after insert on wand_legacy.evento
for each row execute function wand_legacy.avisar_personal_credito();

create function wand_legacy.avisar_missao_atribuida() returns trigger
language plpgsql set search_path = '' as $$
begin
  insert into wand_legacy.aviso (destinatario,aluno_id,titulo,destino)
    select a.user_id,new.aluno_id,'Nova missão ou meta: '||new.titulo,'missoes'
    from public.alunos a where a.id = new.aluno_id and a.user_id is not null;
  return new;
end;
$$;

create trigger wand_legacy_missao_atribuida_aviso after insert on wand_legacy.missao
for each row execute function wand_legacy.avisar_missao_atribuida();

create function public.wand_legacy_total_novas_conquistas() returns bigint
language sql stable security definer set search_path = '' as $$
  select count(distinct a.aluno_id)
  from wand_legacy.aviso a
  where a.destinatario = auth.uid() and not a.lido and a.destino = 'conquistas'
    and wand_legacy.coach(a.aluno_id);
$$;

revoke all on function wand_legacy.avisar_treino(), wand_legacy.avisar_personal_credito(),
  wand_legacy.avisar_missao_atribuida(), public.wand_legacy_total_novas_conquistas() from public, anon, authenticated;
grant execute on function public.wand_legacy_total_novas_conquistas() to authenticated;

commit;
