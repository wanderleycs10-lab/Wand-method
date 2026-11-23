-- WAND METHOD: acesso exclusivo do backend de contratos.
-- Não concede acesso a anon ou authenticated e não desativa RLS.
-- service_role é a identidade privilegiada das Edge Functions no servidor.
grant usage on schema public to service_role;
grant select on table public.wand_propostas to service_role;
grant update (email_enviado_em,status,decidida_em) on table public.wand_propostas to service_role;
grant select on table public.alunos to service_role;
grant select on table public.profiles to service_role;
grant select,insert,update on table public.wand_contrato_verificacoes to service_role;
grant select,insert on table public.wand_aceites_email to service_role;
-- Permissões necessárias para a API PostgREST consultar os metadados das tabelas.
notify pgrst, 'reload schema';
