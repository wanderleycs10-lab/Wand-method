import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const admin=readFileSync('admin.html','utf8');
test('Central consulta notificacoes fotograficas somente do treinador autenticado',()=>{
 assert.match(admin,/from\('wand_notificacoes_internas'\)/);
 assert.match(admin,/\.eq\('destinatario_id',user\.id\)/);
 assert.match(admin,/\.eq\('tipo','fotografia_concluida'\)/);
 assert.match(admin,/\.is\('lida_em',null\)/);
});
test('Notificacao abre fotografias do aluno correto',()=>{
 assert.match(admin,/tipo:'fotografia'/);
 assert.match(admin,/avaliacao-fotografica-painel\.html\?id=/);
 assert.match(admin,/modo=consultar/);
 assert.match(admin,/Ver fotografias/);
});
test('Falha na fonte fotografica nao oculta as outras notificacoes',()=>{
 assert.match(admin,/Falha ao consultar notificações fotográficas/);
 assert.match(admin,/falhas\+\+/);
});

test('Treinador marca notificacao fotografica como lida por RPC segura',()=>{
 assert.match(admin,/notificacaoId:n\.id/);
 assert.match(admin,/wand_marcar_notificacao_fotografica_lida/);
 assert.match(admin,/p_notificacao_id:n\.notificacaoId/);
 assert.match(admin,/data!==true/);
 assert.match(admin,/done\.disabled=true/);
});

test('Contador reconsulta notificacoes ao retornar à aba com limite de frequencia',()=>{
 assert.match(admin,/window\.addEventListener\('focus'/);
 assert.match(admin,/agora-wcUltimaConsultaNotificacoes<30000/);
 assert.match(admin,/if\(document\.hidden/);
 assert.match(admin,/wcAtualizarNotificacoes\(\)/);
});
