import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { parse } from 'smol-toml';

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

  test(`${filename} documents publication preview galleries`, () => {
    assert.match(text, /\bpreview\s*=/);
    assert.match(text, /\bpreviews\s*=/);
    assert.match(text, /(?:maximum|最多)[^\n]*4/i);
    assert.match(text, /4:3/);
    assert.match(text, /9:16/);
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

for (const directory of ['content', 'content_zh']) {
  const directoryUrl = new URL(`../${directory}/`, import.meta.url);
  for (const filename of readdirSync(directoryUrl).filter((name) => name.endsWith('.toml'))) {
    test(`${directory}/${filename} is valid TOML`, () => {
      const source = readFileSync(new URL(filename, directoryUrl), 'utf8');
      assert.doesNotThrow(() => parse(source));
    });
  }
}
