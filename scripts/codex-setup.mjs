import { access } from 'node:fs/promises';

if (process.versions.node.split('.')[0] !== '22') {
  throw new Error('Selecione Node.js 22, a versão principal usada pelo GitHub Actions.');
}

for (const path of ['AGENTS.md', 'index.html', 'tests/fotografia.test.mjs']) {
  await access(new URL('../' + path, import.meta.url));
}

console.log('WAND METHOD pronto para testes com Node.js ' + process.version);
console.log('Execute node --test tests/*.test.mjs a partir da raiz.');
