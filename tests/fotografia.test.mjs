// Testes de contrato sem credenciais e sem alterar dados reais.
// Execute: node --test tests/fotografia.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const painel = readFileSync(resolve('avaliacao-fotografica-painel.html'), 'utf8');
const aluno = readFileSync(resolve('avaliacao-fotografica.js'), 'utf8');

test('WandCoach registra solicitações na tabela correta', () => {
  assert.match(painel, /from\('wand_solicitacoes_fotograficas'\)\s*\.insert\(/);
  for (const campo of ['aluno_id:id', 'solicitado_por:user.id', "status:'pendente'"]) {
    assert.ok(painel.includes(campo), 'Campo obrigatório ausente: '+campo);
  }
});
test('WandCoach impede duplicacao de pedido pendente', () => {
  assert.match(painel, /if\(pedidos\?\.length\)/);
  assert.match(painel, /já possui uma solicitação fotográfica pendente/);
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
test('Solicitacao direta exige consentimento e informa resultado', () => {
  assert.match(painel, /consent\?\.status_avaliacao!=='autorizada'/);
  assert.match(painel, /O aluno ainda não autorizou a avaliação fotográfica/);
  assert.match(painel, /Fotografia solicitada com sucesso!/);
  assert.doesNotMatch(painel, /Orientações para o aluno \(opcional\)/);
  assert.doesNotMatch(painel, /Registrar solicitação/);
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

test('Cartão inicial sinaliza pedido pendente sem duplicar aviso', () => {
  assert.match(aluno, /\[data-view="fotografica"\]/);
  assert.match(aluno, /data-wand-foto-aviso/);
  assert.match(aluno, /anterior\.remove\(\)/);
  assert.match(aluno, /if \(!solicitacaoPendente\) return/);
});

test('Aluno revisa tres fotos antes de confirmar o envio', () => {
  assert.match(aluno, /const rascunhos = new Map/);
  assert.match(aluno, /function cartoes\(pai\)/);
  assert.match(aluno, /editarImagem\(posicao,input\.files\[0\]\)/);
  assert.match(aluno, /Enviar fotografias/);
  assert.match(aluno, /enviarConjunto/);
  assert.match(aluno, /posicoes\.some\(p=>!rascunhos\.has\(p\)\)/);
  assert.doesNotMatch(aluno, /enviar\(posicao, input\.files\[0\]\)/);
});
test('Editor permite zoom, arraste e recorte local', () => {
  assert.match(aluno, /zoom\.max='3'/);
  assert.match(aluno, /pointermove/);
  assert.match(aluno, /tela\.toBlob/);
  assert.match(aluno, /Trocar fotografia/);
});
test('Historico duplicado nao aparece na area de envio do aluno', () => {
  assert.match(aluno, /if \(pagina !== "aluno\.html"\) historico\(container\)/);
});
test('Menu do WandCoach separa solicitacao, analise, comparacao e documentos', () => {
  const admin = readFileSync(resolve('admin.html'), 'utf8');
  assert.match(admin, /\['Solicitar Fotografias','Pedir ao aluno imagens de frente, lado e costas'/);
  assert.match(admin, /\['solicitar','postural','comparar','autorizacoes'\]\[index\]/);
  assert.match(painel, /if\(m==='solicitar'\)/);
  assert.match(painel, /if\(m==='autorizacoes'\)/);
});
