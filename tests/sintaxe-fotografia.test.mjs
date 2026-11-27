// Verifica sintaxe dos scripts reais sem conectar ao Supabase.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function check(source, extension) {
  const dir = mkdtempSync(join(tmpdir(), 'wand-syntax-'));
  try {
    const file = join(dir, 'script.' + extension);
    writeFileSync(file, source, 'utf8');
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout || 'Falha de sintaxe');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('Scripts do painel fotográfico têm sintaxe JavaScript válida', () => {
  const html = readFileSync('avaliacao-fotografica-painel.html', 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attrs]) => !/\bsrc\s*=/.test(attrs));
  assert.ok(scripts.length > 0, 'Nenhum script embutido encontrado');
  for (const [, attrs, body] of scripts) {
    check(body, /type=["']module["']/.test(attrs) ? 'mjs' : 'js');
  }
});

test('Script da área fotográfica do aluno tem sintaxe válida', () => {
  check(readFileSync('avaliacao-fotografica.js', 'utf8'), 'js');
});

test('Script principal do WandCoach tem sintaxe JavaScript válida', () => {
  const html = readFileSync('admin.html', 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attrs]) => !/\bsrc\s*=/.test(attrs));
  assert.ok(scripts.length > 0, 'Nenhum script embutido do WandCoach encontrado');
  for (const [, attrs, body] of scripts) {
    check(body, /type=["']module["']/.test(attrs) ? 'mjs' : 'js');
  }
});
