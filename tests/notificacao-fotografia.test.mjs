import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync('sql/021_notificar_conclusao_fotografica.sql','utf8');
test('Notifica somente transicao pendente para concluida',()=>{
 assert.match(sql,/OLD\.status = 'pendente' AND NEW\.status = 'concluida'/);
 assert.match(sql,/AFTER UPDATE OF status/);
});
test('Destinatario e treinador que solicitou, com referencia correta',()=>{
 assert.match(sql,/NEW\.solicitado_por/);
 assert.match(sql,/NEW\.aluno_id/);
 assert.match(sql,/NEW\.id/);
 assert.match(sql,/'fotografia_concluida'/);
});
test('Evita notificacoes duplicadas e nao expõe fotos',()=>{
 assert.match(sql,/WHERE NOT EXISTS/);
 assert.doesNotMatch(sql,/caminho|storage\.objects|foto_url/);
});
test('Funcao protegida e revogacao de execucao direta',()=>{
 assert.match(sql,/SECURITY DEFINER/);
 assert.match(sql,/SET search_path = ''/);
 assert.match(sql,/REVOKE ALL ON FUNCTION/);
});
