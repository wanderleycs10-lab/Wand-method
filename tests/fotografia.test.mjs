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
test('Confirma apenas disponibilidade na área fotográfica, sem prometer push', () => {
  assert.match(painel, /O pedido já pode ser consultado na área fotográfica do aluno/);
});

test('Aluno consulta somente a solicitação pendente do próprio cadastro', () => {
  assert.match(aluno, /from\("wand_solicitacoes_fotograficas"\)/);
  assert.match(aluno, /\.eq\("aluno_id", aluno\.id\)/);
  assert.match(aluno, /\.eq\("status", "pendente"\)/);
  assert.match(aluno, /Solicitação de fotografias do treinador/);
  assert.match(aluno, /solicitacaoPendente\.orientacoes/);
});
test('Falha na consulta de solicitações não impede a visualização das fotos', () => {
  assert.match(aluno, /erroSolicitacao = Boolean\(consultaSolicitacao\.error\)/);
  assert.match(aluno, /Suas fotografias continuam disponíveis/);
});

test('WandCoach exibe a data de conclusão e não duplica o histórico ao atualizar', () => {
  assert.match(painel, /Concluída em /);
  assert.match(painel, /historicoArea\.replaceChildren\(\)/);
  assert.match(painel, /undefined,historicoArea,'card'/);
});

test('Cartão inicial sinaliza pedido pendente sem duplicar aviso', () => {
  assert.match(aluno, /\[data-view="fotografica"\]/);
  assert.match(aluno, /data-wand-foto-aviso/);
  assert.match(aluno, /anterior\.remove\(\)/);
  assert.match(aluno, /if \(!solicitacaoPendente\) return/);
});
