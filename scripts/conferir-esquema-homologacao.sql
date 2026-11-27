-- Execute no SQL Editor da homologação. A consulta lê somente metadados.
begin read only;

with tabelas(nome) as (
  values ('profiles'), ('alunos'), ('wand_exercicios'), ('wand_metodos'),
         ('wand_treinos'), ('wand_treino_exercicios'), ('wand_treino_series'),
         ('wand_programas_treino'), ('wand_programa_fichas'), ('wand_adaptacoes_programadas'),
         ('wand_sessoes_treino'), ('wand_series_executadas'), ('wand_notificacoes_internas')
)
select tabelas.nome,
       c.oid is not null as presente,
       coalesce(c.relrowsecurity, false) as rls,
       (select count(*) from pg_policy p where p.polrelid = c.oid) as politicas
from tabelas
left join pg_class c on c.oid = to_regclass(format('public.%I', tabelas.nome))
order by tabelas.nome;

with rpcs(assinatura) as (
  values ('public.wand_publicar_programa(uuid,integer)'),
         ('public.wand_aluno_historico()'),
         ('public.wand_aluno_historico_treinos()')
)
select assinatura, to_regprocedure(assinatura) is not null as presente,
       has_function_privilege('authenticated', to_regprocedure(assinatura), 'EXECUTE') as permite_autenticado,
       has_function_privilege('anon', to_regprocedure(assinatura), 'EXECUTE') as permite_anonimo
from rpcs;

select id, public as bucket_publico
from storage.buckets
order by id;

rollback;
