import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { legacyProgress, LEGACY_LEVELS, loadLegacy, renderLegacy } from '../wand-legacy.js';

test('WAND LEGACY aplica os limites dos dez níveis e do prestígio', () => {
  for (const level of LEGACY_LEVELS) {
    assert.equal(legacyProgress(level.minimumXp).current, level);
  }
  assert.equal(legacyProgress(49999).prestige, 0);
  assert.equal(legacyProgress(50000).prestige, 1);
  assert.equal(legacyProgress(60000).prestige, 2);
});

test('Resumo consulta apenas o aluno indicado e propaga falhas de acesso', async () => {
  const summary = { xp: 50, energia: 20, insignias: [] };
  const client = { rpc: async (name, args) => {
    assert.equal(name, 'wand_legacy_resumo');
    assert.deepEqual(args, { p_aluno_id: 7 });
    return { data: summary };
  } };
  assert.equal(await loadLegacy(client, 7), summary);
  await assert.rejects(loadLegacy({ rpc: async () => ({ error: new Error('Acesso negado') }) }, 7), /negado/);
});

test('Resumo apresenta XP, energia e a insígnia registrada pelo servidor', () => {
  const element = () => ({
    children: [],
    dataset: {},
    style: {},
    setAttribute() {},
    append(...children) { this.children.push(...children); },
    get childElementCount() { return this.children.length; },
    get firstChild() { return this.children[0]; },
  });
  const panel = {
    ownerDocument: { createElement: element, createElementNS: element },
    classList: { add() {} },
    replaceChildren(...children) { this.children = children; },
  };
  const progress = renderLegacy(panel, {
    xp: 50, energia: 20,
    insignias: [{ codigo: 'primeiro_passo', nome: 'Primeiro Passo', descricao: 'Primeiro treino',
      conquistada_em: '2026-01-01T12:00:00Z' }],
  });
  assert.equal(progress.current.roman, 'I');
  assert.match(panel.children[2].textContent, /50 XP.*20 WAND ENERGY/);
  assert.equal(panel.children[6].children[0].children[2].textContent, 'Primeiro Passo');
  const cards = panel.children[7].children[1].children;
  assert.equal(cards.length,1);
  assert.equal(cards[0].children[0].children[1].children[0].textContent,'Nível I — Iniciação');
  renderLegacy(panel, {xp:1500,energia:20,insignias:[]});
  assert.equal(panel.children[0].src,'./imagens/wand-legacy-transparente.png');
  const studentCards = panel.children[7].children[1].children;
  assert.equal(studentCards.length,1);
  assert.match(studentCards[0].children[0].children[1].children[0].textContent,/Nível III/);
});

const pglitePath = process.env.WAND_LEGACY_PGLITE;
test('Migração isola alunos e credita no máximo um treino por dia', { skip: !pglitePath }, async () => {
  const { PGlite } = createRequire(import.meta.url)(pglitePath);
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create function auth.uid() returns uuid language sql stable
        as $$ select nullif(current_setting('test.uid', true),'')::uuid $$;
      create table profiles(id uuid primary key, role text);
      create table alunos(id bigint primary key, user_id uuid, nome_completo text);
      create table wand_treinos(id uuid primary key, aluno_id bigint, treinador_id uuid,
        nome text, validade_inicio date, validade_fim date);
      create table wand_sessoes_treino(id uuid primary key, treino_id uuid, aluno_id bigint,
        user_id uuid, conduzida_por uuid, situacao text, iniciada_em timestamptz, finalizada_em timestamptz);
      create table wand_programas_treino(id uuid primary key, aluno_id bigint, treinador_id uuid,
        status text, criado_em timestamptz, dias_preferenciais integer[]);
      create table wand_programa_fichas(programa_id uuid, treino_id uuid, modalidade text);
      create table anamneses(aluno_id bigint, status text, concluida_em timestamptz);
      create table avaliacoes_fisicas(id bigint, aluno_id bigint, liberada_em timestamptz);
      create table wand_avaliacoes_posturais(id uuid, aluno_id bigint, status text, criado_por uuid);
      create table wand_bemestar_registros(aluno_id bigint, dia date, energia integer, sono integer, disposicao integer);
      insert into profiles values ('00000000-0000-0000-0000-000000000001','admin'),
        ('00000000-0000-0000-0000-000000000004','admin');
      insert into alunos values (10,'00000000-0000-0000-0000-000000000002','Aluno A'),
        (20,'00000000-0000-0000-0000-000000000003','Aluno B');
      insert into wand_treinos values ('10000000-0000-0000-0000-000000000001',10,
        '00000000-0000-0000-0000-000000000001','Treino A',null,null);
      insert into wand_sessoes_treino
      select ('20000000-0000-0000-0000-00000000000'||n)::uuid,
        '10000000-0000-0000-0000-000000000001',10,'00000000-0000-0000-0000-000000000002',
        null,case when n=3 then 'interrompido' else 'concluido' end,
        '2026-01-01 10:00Z','2026-01-01 11:00Z' from generate_series(1,3) n;
    `);
    const url = new URL('../supabase/migrations/20261126025347_wand_legacy_progressao.sql', import.meta.url);
    await db.exec(readFileSync(url, 'utf8'));
    const identity = (role, n) => db.exec(`set role ${role}; set test.uid='00000000-0000-0000-0000-00000000000${n}'`);
    const summary = async () => (await db.query('select wand_legacy_resumo(10) as data')).rows[0].data;
    const validate = async (n) => (await db.query('select wand_legacy_validar_treino(10,$1) as ok',
      [`20000000-0000-0000-0000-00000000000${n}`])).rows[0].ok;

    await identity('anon', 0);
    await assert.rejects(summary, { code: '42501' });
    await identity('authenticated', 3);
    await assert.rejects(summary, { code: '42501' });
    assert.deepEqual((await db.query('select * from wand_legacy_alunos()')).rows, []);
    await identity('authenticated', 4);
    await assert.rejects(summary, { code: '42501' });
    await identity('authenticated', 2);
    assert.equal((await summary()).xp, 0);
    await assert.rejects(validate.bind(null, 1), { code: '42501' });
    await assert.rejects(db.query('select * from wand_legacy.evento'), { code: '42501' });
    await identity('authenticated', 1);
    assert.deepEqual((await db.query('select nome from wand_legacy_alunos()')).rows, [{nome:'Aluno A'}]);
    assert.equal((await summary()).treinos_para_validar.length, 2);
    await assert.rejects(validate.bind(null, 3), /Sessão inválida/);
    assert.equal(await validate(1), true);
    assert.equal(await validate(1), false);
    assert.equal(await validate(2), false);
    await identity('authenticated', 2);
    const result = await summary();
    assert.equal(result.xp, 50);
    assert.equal(result.energia, 20);
    assert.deepEqual(result.treinos_para_validar, []);
    assert.deepEqual(result.insignias.map(badge => badge.codigo), ['primeiro_passo']);
    const request = (reward, key) => db.query('select wand_legacy_resgatar(10,$1,$2) as id', [reward,key]);
    const key = '30000000-0000-0000-0000-000000000001';
    await assert.rejects(request(1,key), /insuficiente/);
    await db.exec(`reset role;
      insert into wand_legacy.evento (aluno_id,codigo,referencia,xp,energia,validado_por)
      values (10,'reconhecimento','fixture',0,600,'00000000-0000-0000-0000-000000000001');`);
    await identity('authenticated', 2);
    const requests = await Promise.all([request(1,key),request(1,key)]);
    const id = requests[0].rows[0].id;
    assert.equal(id, requests[1].rows[0].id);
    assert.equal((await summary()).energia, 20);
    const decide = (state) => db.query('select wand_legacy_decidir_resgate(10,$1,$2)', [id,state]);
    await assert.rejects(decide('cancelado'), { code:'42501' });
    await identity('authenticated', 1);
    await decide('aprovado');
    await decide('cancelado');
    await decide('cancelado');
    const refunded = await summary();
    assert.equal(refunded.energia, 620);
    assert.equal(refunded.xp, 50);
    assert.equal(refunded.resgates[0].estado, 'cancelado');
    await db.query("select wand_legacy_salvar_regra('meta_longa',550,150)");
    await db.query("select wand_legacy_atribuir_missao(10,'Meta profissional','meta_longa')");
    const [mission] = (await summary()).missoes;
    const updateMission = (state) => db.query('select wand_legacy_atualizar_missao(10,$1,$2)', [mission.id,state]);
    await identity('authenticated', 2);
    await assert.rejects(updateMission('validada'), { code:'42501' });
    await assert.rejects(db.query("select wand_legacy_salvar_regra('meta_longa',999,999)"), { code:'42501' });
    await updateMission('em_validacao');
    await identity('authenticated', 1);
    await updateMission('validada');
    await updateMission('validada');
    const rewarded = await summary();
    assert.equal(rewarded.xp, 600);
    assert.equal(rewarded.energia, 770);
    assert.deepEqual(rewarded.insignias.map(badge => badge.codigo), ['primeiro_passo','superacao']);
    await db.query("select wand_legacy_salvar_recompensa(1,'Avaliação extra','Descrição','Condições',650,4,null,true)");
    assert.equal((await summary()).recompensas.find(item => item.id === 1).custo, 650);
    await db.query("select wand_legacy_salvar_presente(10,1,'Chaveiro',false)");
    await db.query("select wand_legacy_salvar_presente(10,1,'Chaveiro',true)");
    const privateData = (await db.query('select wand_legacy_presentes(10) as data')).rows[0].data;
    assert.equal(privateData.historico.length, 2);
    assert.equal(privateData.registros[0].entregue, true);
    await identity('authenticated', 2);
    await assert.rejects(db.query('select wand_legacy_presentes(10)'), { code:'42501' });
    assert.equal((await summary()).presentes, undefined);
    const alerts = (await db.query('select * from wand_legacy_avisos()')).rows;
    assert.ok(alerts.some(alert => alert.titulo.includes('Superação')));
    await db.query('select wand_legacy_ler_aviso($1)',[alerts[0].id]);
    assert.equal((await db.query('select * from wand_legacy_avisos()')).rows.length, alerts.length-1);
    await db.exec(`reset role;
      insert into anamneses values (10,'concluida','2026-01-01');
      insert into avaliacoes_fisicas values (1,10,'2026-01-02');
      insert into wand_bemestar_registros values (10,'2026-01-02',3,null,null);`);
    await identity('authenticated', 1);
    await db.query('select wand_legacy_validar_acompanhamento(10)');
    await db.query('select wand_legacy_validar_acompanhamento(10)');
    assert.equal((await summary()).xp,705);
    await db.exec(`reset role;
      insert into wand_programas_treino values ('40000000-0000-0000-0000-000000000001',10,
        '00000000-0000-0000-0000-000000000001','ativo','2026-01-01',array[2,4]);
      insert into wand_sessoes_treino
      select ('50000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,
        '10000000-0000-0000-0000-000000000001',10,'00000000-0000-0000-0000-000000000002',
        null,'concluido','2026-02-03 10:00Z'::timestamptz + ((n/2)*7+(n%2)*2)*interval '1 day',
        '2026-02-03 11:00Z'::timestamptz + ((n/2)*7+(n%2)*2)*interval '1 day'
      from generate_series(0,7) n;`);
    await identity('authenticated', 1);
    for (const n of [7,6,5,4,3,2,1,0]) {
      await db.query('select wand_legacy_validar_treino(10,$1)', [
        '50000000-0000-0000-0000-'+String(n).padStart(12,'0'),
      ]);
    }
    const consistency = await summary();
    assert.equal(consistency.historico.filter(item => item.codigo === 'meta_semanal').length,4);
    assert.equal(consistency.historico.filter(item => item.codigo === 'meta_mensal').length,1);
    assert.ok(consistency.insignias.some(badge => badge.codigo === 'disciplina_ouro'));
  } finally {
    await db.close();
  }
});
