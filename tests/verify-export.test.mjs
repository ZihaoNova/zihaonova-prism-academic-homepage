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

function applicationHtml(prefix = basePath) {
  return `<!doctype html><html><head>
    <link rel="stylesheet" href="${prefix}/_next/static/css/main.css">
    <script src="${prefix}/_next/static/chunks/main.js"></script>
    <link rel="icon" href="${prefix}/favicon.svg">
    </head><body><nav><a href="${prefix}/">Home</a>
    ${routes.map(route => `<a href="${prefix}/${route}/">${route}</a>`).join('')}
    </nav>${assets.map(asset => `<img src="${prefix}/${asset}">`).join('')}
    </body></html>`;
}

async function fixture(html = '', prefix = basePath) {
  for (const file of ['index.html', ...routes.map(route => `${route}/index.html`), ...assets]) {
    await write(file, file.endsWith('.html') ? applicationHtml(prefix) + html : 'fixture asset');
  }
  await write('_next/static/chunks/main.js', 'console.log("PRISM");');
  await write('_next/static/main.js', 'console.log("PRISM");');
  await write('_next/static/css/main.css', 'body { color: black; }');
  await write('one.png', 'fixture asset');
  await write('two.png', 'fixture asset');
}

test('accepts a complete export', async () => {
  await fixture();
  assert.equal(await verifyExport({ outDir, basePath }), undefined);
});

for (const file of ['index.html', ...routes.map(route => `${route}/index.html`)]) {
  test(`rejects empty required HTML: ${file}`, async () => {
    await fixture();
    await write(file, ' \n');
    await assert.rejects(verifyExport({ outDir, basePath }), error => {
      assert.ok(error.message.includes(file));
      assert.match(error.message, /empty|required.*reference/i);
      return true;
    });
  });
}

for (const [name, fragment] of [
  ['home navigation', `<a href="${basePath}/">Home</a>`],
  ...routes.map(route => [`${route} navigation`, `<a href="${basePath}/${route}/">${route}</a>`]),
  ['framework script', `<script src="${basePath}/_next/static/chunks/main.js"></script>`],
  ['framework stylesheet', `<link rel="stylesheet" href="${basePath}/_next/static/css/main.css">`],
]) {
  test(`rejects required application HTML without ${name}`, async () => {
    await fixture();
    await write('cv/index.html', applicationHtml().replace(fragment, ''));
    await assert.rejects(verifyExport({ outDir, basePath }), /cv\/index\.html.*required.*reference/i);
  });
}

for (const asset of assets) {
  test(`rejects an export without a required static-asset reference: ${asset}`, async () => {
    await fixture();
    for (const file of ['index.html', ...routes.map(route => `${route}/index.html`)]) {
      await write(file, applicationHtml().replaceAll(`href="${basePath}/${asset}"`, '')
        .replaceAll(`src="${basePath}/${asset}"`, ''));
    }
    await assert.rejects(verifyExport({ outDir, basePath }), error => {
      assert.match(error.message, /required.*reference/i);
      assert.ok(error.message.includes(asset));
      return true;
    });
  });
}

for (const prefix of [basePath, '']) {
  for (const [name, html, missing] of [
    ['chunk', `<script src="${prefix}/_next/static/chunks/missing.js"></script>`, '_next/static/chunks/missing.js'],
    ['stylesheet', `<link rel="stylesheet" href="${prefix}/_next/static/css/missing.css">`, '_next/static/css/missing.css'],
    ['asset', `<img src="${prefix}/papers/missing.png">`, 'papers/missing.png'],
    ['route', `<a href="${prefix}/missing/">Missing</a>`, 'missing/'],
    ['srcset asset', `<img srcset="${prefix}/one.png 1x, ${prefix}/missing.png 2x">`, 'missing.png'],
    ['relative target', '<a href="missing/">Missing</a>', 'cv/missing/'],
    ['encoded asset', `<img src="${prefix}/papers/missing%20image.png?size=1#image">`, 'papers/missing image.png'],
  ]) {
    test(`rejects nonexistent ${prefix ? 'prefixed' : 'root'} ${name}`, async () => {
      await fixture('', prefix);
      await write('cv/index.html', applicationHtml(prefix) + html);
      await assert.rejects(verifyExport({ outDir, basePath: prefix }), error => {
        assert.match(error.message, /cv\/index\.html/);
        assert.match(error.message, /target/i);
        assert.ok(error.message.includes(missing));
        return true;
      });
    });
  }
}

test('accepts query strings, fragments, encoded assets, and relative existing targets', async () => {
  await fixture();
  await write('papers/a b.png', 'fixture asset');
  await write('cv/index.html', applicationHtml() + `<a href="../research/?view=1#top">Research</a>
    <img src="${basePath}/papers/a%20b.png?size=1#image">`);
  await verifyExport({ outDir, basePath });
});

test('rejects a directory without an exported index as a local target', async () => {
  await fixture();
  await fs.mkdir(path.join(outDir, 'empty-route'));
  await write('cv/index.html', applicationHtml() + `<a href="${basePath}/empty-route/">Empty</a>`);
  await assert.rejects(verifyExport({ outDir, basePath }), /cv\/index\.html.*target.*empty-route/i);
});

for (const [tag, attribute, dataAttribute] of [
  ['a', 'href', 'data-nav-href'],
  ['img', 'src', 'data-src'],
  ['img', 'srcset', 'data-srcset'],
  ['form', 'action', 'data-action'],
  ['video', 'poster', 'data-poster'],
]) {
  test(`only matches complete URL attribute names: ${attribute}`, async () => {
    await fixture(`<${tag} ${dataAttribute}="/" ${attribute}="${basePath}/research/">`);
    await verifyExport({ outDir, basePath });
    await write('cv/index.html', `<${tag} ${dataAttribute}="${basePath}/" ${attribute}="/research/">`);
    await assert.rejects(verifyExport({ outDir, basePath }), /cv\/index\.html/);
  });
}

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

for (const [name, url] of [
  ['decimal character reference', '&#47;research/'],
  ['hexadecimal character reference', '&#x2f;research/'],
  ['semicolonless character reference', '&#47research/'],
  ['named slash reference', '&sol;research/'],
  ['literal parent segment', `${basePath}/../research/`],
  ['percent-encoded parent segment', `${basePath}/%2e%2e/research/`],
  ['character-reference parent segment', `${basePath}/&period;&period;/research/`],
  ['encoded backslash separator', `${basePath}/..&bsol;research/`],
]) {
  test(`rejects browser-resolved URLs outside base path: ${name}`, async () => {
    await fixture();
    await write('cv/index.html', `<a href="${url}">Research</a>`);
    await assert.rejects(verifyExport({ outDir, basePath }), error => {
      assert.match(error.message, /cv\/index\.html/);
      assert.ok(error.message.includes('/research/'));
      return true;
    });
  });
}

test('rejects character references in srcset URLs before splitting candidates', async () => {
  await fixture();
  await write('cv/index.html', `<img srcset="${basePath}/one.png 1x&comma;&#47;profile/github-avatar.png 2x">`);
  await assert.rejects(verifyExport({ outDir, basePath }), /cv\/index\.html/);
});

test('accepts encoded and normalized paths that remain inside base path', async () => {
  await fixture(`<a href="&#47;zihaonova-prism-academic-homepage&#47;research/?a=1&amp;b=2">Research</a>
    <a href="${basePath}/research/../cv/">CV</a>
    <a href="${basePath}?view=home#top">Home</a>
    <a href="&#47;&#47;example.com/research/">External</a>
    <img srcset="${basePath}&#47;one.png 1x&comma; ${basePath}/two.png 2x">`);
  await verifyExport({ outDir, basePath });
});

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
    <a href="./">Relative</a>`);
  await verifyExport({ outDir, basePath });
});

test('accepts root-relative URLs for a root deployment', async () => {
  await fixture('<a href="/research/">Research</a><img src="/profile/github-avatar.png">', '');
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

  for (const file of ['_next/static/chunks/extra.js', 'research/index.txt', 'extra/page.rsc',
    'extra/data.json', '_next/static/css/extra.css', 'extra/site.xml', 'extra/icon.svg', 'extra/debug.js.map']) {
    test(`rejects forbidden emitted text marker in ${file}: ${marker}`, async () => {
      await fixture();
      await write(file, JSON.stringify({ marker }));
      await assert.rejects(verifyExport({ outDir, basePath }), error => {
        assert.ok(error.message.includes(file));
        assert.ok(error.message.includes(marker));
        return true;
      });
    });
  }
}

test('does not treat binary images as emitted text', async () => {
  await fixture();
  await write('extra.png', 'zihaonova-academic-homepage');
  await verifyExport({ outDir, basePath });
});

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
  await fixture('<a href="/research/">Research</a>', '');
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
