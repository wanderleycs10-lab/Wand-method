import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const read = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const routes = read('docs/design-system-wand-method.md');
const authenticated = [...routes.matchAll(/^\| `([^\x60]+\.html)` \| Nível (\d)/gm)];

test('todo HTML da raiz consta no inventário', () => {
  const files = readdirSync(new URL('../', import.meta.url)).filter(file => file.endsWith('.html'));
  for (const file of files) assert.ok(routes.includes('| `' + file + '` |'), file);
});

test('as rotas autenticadas usam o nível explícito, o tema e a ilha compartilhada', () => {
  assert.equal(authenticated.length, 20);
  for (const [, file, level] of authenticated) {
    const page = read(file);
    assert.match(page, new RegExp('<body[^>]+data-wand-level="' + level + '"'), file);
    assert.match(page, /wand-premium\.css/, file);
    assert.match(page, /wand-navigation\.css/, file);
    assert.match(page, /wand-navigation\.js[^>]+data-profile="(?:coach|student)"/, file);
  }
});

test('a biblioteca tem um único Voltar contextual e mantém seus destinos internos', () => {
  const page = read('biblioteca-exercicios.html');
  assert.equal([...page.matchAll(/\bdata-wand-back\b/g)].length, 1);
  assert.match(page, /id="voltarBiblioteca" href="admin\.html#wc\/treinos"/);
  assert.match(page, /voltar\.href=ficha\?"#gerenciar":interno\?"#biblioteca":"admin\.html#wc\/treinos"/);
});

test('o retorno fotográfico preserva a rota interna autorizada e rejeita destinos externos', () => {
  const element = {
    classList: { add() {} },
    querySelector() { return this; },
    replaceChildren() {}
  };
  const window = {};
  const document = {
    currentScript: { dataset: { profile: 'coach', root: 'true' } },
    querySelector: () => element,
    createElement: () => ({ ...element }),
    addEventListener() {}
  };
  runInNewContext(read('wand-navigation.js'), {
    window, document, URL,
    location: { href: 'https://wandmethod.example/app/avaliacao-postural.html' }
  });
  const pages = ['avaliacao-fotografica-central.html', 'avaliacao-fotografica-painel.html'];
  const fallback = 'admin.html#wc/fotografica';
  const link = 'avaliacao-fotografica-painel.html?id=7&modo=postural';
  assert.equal(window.wandContextUrl(link, pages, fallback), 'https://wandmethod.example/app/' + link);
  for (const value of [
    'https://fora.example/app/' + link,
    'https://wandmethod.example/outra/' + link,
    'javascript:alert(1)',
    'http://['
  ]) assert.equal(window.wandContextUrl(value, pages, fallback), fallback);
});
