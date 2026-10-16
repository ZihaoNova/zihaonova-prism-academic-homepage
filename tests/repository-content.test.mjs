import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

for (const filename of ['README.md', 'README_cn.md']) {
  const text = readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8');

  test(`${filename} identifies the public PRISM Pages URL`, () => {
    assert.ok(text.includes('https://zihaonova.github.io/zihaonova-prism-academic-homepage/'));
  });

  for (const command of ['pnpm install', 'pnpm run dev', 'pnpm run build']) {
    test(`${filename} documents ${command}`, () => {
      assert.ok(text.includes(command));
    });
  }

  test(`${filename} keeps HugoIO independent`, () => {
    assert.match(text, /HugoIO[^\n]*(?:independent|独立)/i);
  });

  test(`${filename} preserves PRISM attribution and MIT licensing`, () => {
    assert.match(text, /PRISM/);
    assert.ok(text.includes('https://github.com/xyjoey/PRISM'));
    assert.match(text, /MIT/);
  });
}

const chineseReadme = readFileSync(new URL('../README_cn.md', import.meta.url), 'utf8');
for (const forbidden of [
  /git clone https:\/\/github\.com\/xyjoey\/PRISM\.git/,
  /\bnpm install\b/,
  /Next\.js 20/,
  /(?:给|點|点)[^\n]*Star|(?:please|give)[^\n]*\bstar\b/i,
]) {
  test(`Chinese README omits template residue: ${forbidden}`, () => {
    assert.doesNotMatch(chineseReadme, forbidden);
  });
}

test('removes only the unused template example image', () => {
  assert.equal(existsSync(new URL('../public/papers/example.png', import.meta.url)), false);
});
