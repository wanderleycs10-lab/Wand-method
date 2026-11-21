import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync('sql/022_leitura_notificacoes_fotograficas.sql','utf8');
test('RLS limita leitura ao destinatario autenticado',()=>{
 assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/FOR SELECT TO authenticated/);
 assert.match(sql,/destinatario_id = \(SELECT auth\.uid\(\)\)/);
});
test('Marcacao de leitura limitada a notificacoes fotograficas do usuario',()=>{
 assert.match(sql,/SECURITY DEFINER/);
 assert.match(sql,/SET search_path = ''/);
 assert.match(sql,/AND tipo = 'fotografia_concluida'/);
 assert.match(sql,/AND lida_em IS NULL/);
 assert.match(sql,/SET lida_em = now\(\)/);
});
test('Nao concede update direto nem execucao anonima',()=>{
 assert.doesNotMatch(sql,/GRANT UPDATE/);
 assert.match(sql,/FROM PUBLIC, anon/);
 assert.match(sql,/TO authenticated/);
});
