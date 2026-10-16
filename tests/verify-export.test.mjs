import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { verifyExport } from '../scripts/verify-export.mjs';

const basePath = '/zihaonova-prism-academic-homepage';
const routes = ['research', 'publications', 'tooling', 'awards', 'services', 'cv'];
const assets = [
  'profile/github-avatar.png',
  'research/forest-age.png',
  'research/lucc-simulation.png',
  'research/forest-carbon.png',
  'papers/forest-age.png',
  'papers/lucc-simulation.png',
  'papers/forest-carbon.png',
  'favicon.svg',
];
const run = promisify(execFile);
const cli = fileURLToPath(new URL('../scripts/verify-export.mjs', import.meta.url));
let tempDir;
let outDir;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'prism-export-'));
  outDir = path.join(tempDir, 'out');
});

afterEach(async () => {
  const resolved = await fs.realpath(tempDir);
  assert.equal(path.dirname(resolved), await fs.realpath(os.tmpdir()));
  assert.ok(path.basename(resolved).startsWith('prism-export-'));
  await fs.rm(resolved, { recursive: true, force: true });
  await assert.rejects(fs.access(resolved), { code: 'ENOENT' });
});

async function write(relative, content = '') {
  const target = path.join(outDir, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
}

async function fixture(html = '<!doctype html><html><body>PRISM</body></html>') {
  for (const file of ['index.html', ...routes.map(route => `${route}/index.html`), ...assets]) {
    await write(file, file.endsWith('.html') ? html : 'fixture asset');
  }
}

test('accepts a complete export', async () => {
  await fixture();
  assert.equal(await verifyExport({ outDir, basePath }), undefined);
});

for (const file of ['index.html', ...routes.map(route => `${route}/index.html`), ...assets]) {
  test(`rejects a missing required file: ${file}`, async () => {
    await fixture();
    await fs.rm(path.join(outDir, file));
    await assert.rejects(verifyExport({ outDir, basePath }), error => {
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes(file));
      return true;
    });
  });
}

for (const html of [
  '<a href="/research/">Research</a>',
  '<img src="/profile/github-avatar.png">',
  '<script src="/_next/static/main.js"></script>',
  '<a href="/zihaonova-prism-academic-homepage-other/">Wrong prefix</a>',
  "<IMG SRC = '/profile/github-avatar.png'>",
  '<a href=/research/>Research</a>',
  `<img src="${basePath}/profile/github-avatar.png" srcset="${basePath}/profile/github-avatar.png 1x, /profile/github-avatar.png 2x">`,
]) {
  test(`rejects unprefixed local URLs: ${html}`, async () => {
    await fixture();
    await write('cv/index.html', html);
    await assert.rejects(verifyExport({ outDir, basePath }), /cv\/index\.html/);
  });
}

test('accepts prefixed URLs, exact base path, and ignored URL kinds', async () => {
  await fixture(`<a href="${basePath}">Home</a>
    <a href="${basePath}/research/">Research</a>
    <img src="${basePath}/profile/github-avatar.png">
    <script src="${basePath}/_next/static/main.js"></script>
    <img srcset="${basePath}/one.png 1x, ${basePath}/two.png 2x">
    <a href="http://example.com/research/">HTTP</a>
    <a href="https://example.com/research/">HTTPS</a>
    <a href="mailto:person@example.com">Mail</a>
    <a href="#research">Section</a><a href="//example.com/research/">External</a>
    <a href="research/">Relative</a>`);
  await verifyExport({ outDir, basePath });
});

test('accepts root-relative URLs for a root deployment', async () => {
  await fixture('<a href="/research/">Research</a><img src="/profile/github-avatar.png">');
  await verifyExport({ outDir, basePath: '' });
});

for (const marker of ['zihaonova-academic-homepage', String.raw`F:\CODE\Python\HugoIO`]) {
  test(`rejects forbidden HTML marker: ${marker}`, async () => {
    await fixture();
    await write('research/index.html', `<p>${marker}</p>`);
    await assert.rejects(verifyExport({ outDir, basePath }), error => {
      assert.ok(error.message.includes(marker));
      assert.ok(error.message.includes('research/index.html'));
      return true;
    });
  });
}

test('inspects additional nested HTML, not only the required routes', async () => {
  await fixture();
  await write('extra/deep/page.html', '<a href="/research/">Research</a>');
  await assert.rejects(verifyExport({ outDir, basePath }), /extra\/deep\/page\.html/);
});

test('rejects an absent output directory', async () => {
  await assert.rejects(verifyExport({ outDir, basePath }), /out/);
});

test('rejects stale incomplete output', async () => {
  await write('index.html', '<p>Old export</p>');
  await assert.rejects(verifyExport({ outDir, basePath }), /research\/index\.html/);
});

test('rejects a directory in place of a required file', async () => {
  await fixture();
  await fs.rm(path.join(outDir, 'cv/index.html'));
  await fs.mkdir(path.join(outDir, 'cv/index.html'));
  await assert.rejects(verifyExport({ outDir, basePath }), /cv\/index\.html/);
});

function environment(overrides = {}) {
  const env = { ...process.env };
  delete env.OUT_DIR;
  delete env.NEXT_PUBLIC_BASE_PATH;
  return { ...env, ...overrides };
}

test('CLI defaults to out and an empty base path', async () => {
  await fixture('<a href="/research/">Research</a>');
  await run(process.execPath, [cli], { cwd: tempDir, env: environment() });
});

test('CLI honors OUT_DIR and NEXT_PUBLIC_BASE_PATH', async () => {
  outDir = path.join(tempDir, 'custom-export');
  await fixture(`<a href="${basePath}/research/">Research</a>`);
  const env = environment({ OUT_DIR: outDir, NEXT_PUBLIC_BASE_PATH: basePath });
  await run(process.execPath, [cli], { cwd: tempDir, env });
  await write('index.html', '<a href="/research/">Research</a>');
  await assert.rejects(run(process.execPath, [cli], { cwd: tempDir, env }), error => {
    assert.equal(error.code, 1);
    assert.match(error.stderr, /index\.html/);
    assert.match(error.stderr, /\/research\//);
    return true;
  });
});

test('CLI exits nonzero for an absent default export', async () => {
  await assert.rejects(run(process.execPath, [cli], { cwd: tempDir, env: environment() }), error => {
    assert.equal(error.code, 1);
    assert.match(error.stderr, /out/);
    return true;
  });
});
