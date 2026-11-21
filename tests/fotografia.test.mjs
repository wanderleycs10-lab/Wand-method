// Testes de contrato sem credenciais e sem alterar dados reais.
// Execute: node --test tests/fotografia.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const painel = readFileSync(resolve('avaliacao-fotografica-painel.html'), 'utf8');
const aluno = readFileSync(resolve('avaliacao-fotografica.js'), 'utf8');

test('WandCoach registra solicitações na tabela correta', () => {
  assert.match(painel, /from\('wand_solicitacoes_fotograficas'\)\.insert\(/);
  for (const campo of ['aluno_id:id', 'solicitado_por:user.id', "status:'pendente'"]) {
    assert.ok(painel.includes(campo), 'Campo obrigatório ausente: '+campo);
  }
});
test('WandCoach consulta solicitações existentes e evita duplicação na interface', () => {
  assert.match(painel, /from\('wand_solicitacoes_fotograficas'\)\.select\(/);
  assert.match(painel, /registros\.find\(x=>x\.status==='pendente'\)/);
  assert.match(painel, /if\(pendente\)/);
});
test('Consentimento fotográfico permanece separado da solicitação', () => {
  assert.match(painel, /from\('consentimentos_fotograficos'\)/);
  assert.match(aluno, /consentimentos_fotograficos/);
  assert.match(aluno, /status_avaliacao/);
  assert.match(painel, /divulgacao_autorizada/);
});
test('Envio das fotos preserva identidade do remetente e armazenamento privado', () => {
  assert.match(painel, /enviado_por:\(await db\.auth\.getUser\(\)\)\.data\.user\?\.id/);
  assert.match(painel, /from\('avaliacoes-fotograficas'\)\.upload\(/);
  assert.match(aluno, /const BUCKET = "avaliacoes-fotograficas"/);
});
test('Não confundir criação de solicitação com notificação entregue ao aluno', () => {
  assert.match(painel, /O aviso na área do aluno será integrado na próxima etapa/);
});
