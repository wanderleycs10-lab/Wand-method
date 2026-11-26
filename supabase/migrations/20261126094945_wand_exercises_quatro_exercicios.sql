begin;

insert into public.wand_exercicios
  (nome, grupo_muscular, equipamento, categoria, ativo)
select item.nome, item.grupo, item.equipamento, 'Musculação', true
from (values
  ('Elevação lateral com halteres', 'Ombros', 'Halteres'),
  ('Panturrilha em pé', 'Panturrilhas', 'Degrau'),
  ('Remada curvada com barra', 'Costas', 'Barra'),
  ('Desenvolvimento sentado com halteres', 'Ombros', 'Halteres e banco')
) as item(nome, grupo, equipamento)
where not exists (
  select 1 from public.wand_exercicios e where lower(trim(e.nome)) = lower(item.nome)
);

commit;
