import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync('sql/020_concluir_solicitacao_fotografica.sql', 'utf8');

test('Conclui por trigger somente apos insercao de fotografia', () => {
  assert.match(sql, /AFTER INSERT ON public\.fotos_avaliacao/);
  assert.match(sql, /FOR EACH ROW/);
});
test('Exige tres posicoes fotografadas apos a solicitacao', () => {
  assert.match(sql, /f\.criado_em >= s\.criada_em/g);
  assert.match(sql, /lower\(f\.posicao\) = 'frente'/);
  assert.match(sql, /lower\(f\.posicao\) IN \('perfil','lado'\)/);
  assert.match(sql, /lower\(f\.posicao\) = 'costas'/);
});
test('Exige consentimento interno e status pendente', () => {
  assert.match(sql, /c\.status_avaliacao = 'autorizada'/);
  assert.match(sql, /s\.status = 'pendente'/);
  assert.match(sql, /SET status = 'concluida'/);
});
test('Funcao nao fica executavel diretamente por usuarios', () => {
  assert.match(sql, /SECURITY DEFINER/);
  assert.match(sql, /SET search_path = ''/);
  assert.match(sql, /REVOKE ALL ON FUNCTION public\.wand_concluir_solicitacao_fotografica\(\)/);
});
