import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// Comments cannot enable deployment policy.
const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')
  .replace(/^[ \t]*#[^\r\n]*/gm, '');
const steps = workflow.split(/^      - /m).slice(1);

test('deploys automatically on main and supports manual dispatch', () => {
  assert.match(workflow, /^on:\s*\n  push:\s*\n    branches:\s*\n      - main\s*\n  workflow_dispatch:/m);
});

test('sets up pnpm before Node 22 with pnpm caching and Pages configuration', () => {
  assert.match(workflow, /uses: pnpm\/action-setup@v4\s*\n/);
  const node = steps.find((step) => step.includes('uses: actions/setup-node@v4')) ?? '';
  assert.match(node, /node-version: 22\s*\n/);
  assert.match(node, /cache: pnpm\s*\n/);
  assert.match(workflow, /uses: actions\/configure-pages@v5\s*\n/);
});

test('installs frozen dependencies and verifies the Pages-prefix build before upload', () => {
  const build = steps.find((step) => /run: pnpm run build\s*$/m.test(step)) ?? '';
  assert.match(build, /env:\s*\n          NEXT_PUBLIC_BASE_PATH: \/zihaonova-prism-academic-homepage\s*\n/);
  const verify = steps.find((step) => /run: pnpm run verify:export\s*$/m.test(step)) ?? '';
  assert.match(verify, /env:\s*\n          NEXT_PUBLIC_BASE_PATH: \/zihaonova-prism-academic-homepage\s*\n/);
  const orderedPolicy = [
    'uses: actions/checkout@v4',
    'uses: pnpm/action-setup@v4',
    'uses: actions/setup-node@v4',
    'uses: actions/configure-pages@v5',
    'run: pnpm install --frozen-lockfile',
    'run: pnpm run build',
    'run: pnpm run verify:export',
    'uses: actions/upload-pages-artifact@v3',
    'uses: actions/deploy-pages@v4',
  ];
  let previous = -1;
  for (const declaration of orderedPolicy) {
    const index = workflow.indexOf(declaration);
    assert.ok(index > previous, `Missing or out-of-order policy: ${declaration}`);
    previous = index;
  }
});

test('uploads the static export and deploys it through the github-pages environment', () => {
  const upload = steps.find((step) => step.includes('uses: actions/upload-pages-artifact@v3')) ?? '';
  assert.match(upload, /with:\s*\n          path: \.\/out\s*$/m);
  assert.match(workflow, /deploy:\s*\n    needs: build\s*\n/);
  assert.match(workflow, /environment:\s*\n      name: github-pages\s*\n      url: \$\{\{ steps\.deployment\.outputs\.page_url \}\}/);
  const deploy = steps.find((step) => step.includes('uses: actions/deploy-pages@v4')) ?? '';
  assert.match(deploy, /id: deployment\s*\n/);
});

test('grants only the required Pages permissions without overrides', () => {
  assert.equal((workflow.match(/^\s*permissions:/gm) ?? []).length, 1);
  const permissions = workflow.match(/^permissions:\s*\n((?:  [^\n]+\n)+)/m)?.[1];
  assert.ok(permissions, 'Missing explicit permissions');
  assert.deepEqual(permissions.trim().split('\n').map((line) => line.trim()).sort(), [
    'contents: read', 'id-token: write', 'pages: write',
  ]);
});

test('does not use npm installation, scripts, or caching', () => {
  assert.doesNotMatch(workflow, /\bnpm\s+(?:install|run)\b|cache:\s*npm\b/);
});
