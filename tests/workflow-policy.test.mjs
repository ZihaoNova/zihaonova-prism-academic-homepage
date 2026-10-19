import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// Comments cannot enable deployment policy.
const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')
  .replace(/\r\n/g, '\n')
  .replace(/^[ \t]*#[^\r\n]*/gm, '');
const steps = workflow.split(/^      - /m).slice(1);

function assertFrozenInstall(source) {
  assert.match(source, /^        run: pnpm install --frozen-lockfile[ \t]*$/m, 'Missing exact frozen install');
}

function assertMainRefGuards(source) {
  for (const job of ['build', 'deploy']) {
    const block = source.match(new RegExp(`^  ${job}:\n((?:    [^\n]*\n|\n)+)`, 'm'))?.[1] ?? '';
    assert.match(block, /^    if: \$\{\{ github\.ref == 'refs\/heads\/main' \}\}[ \t]*$/m,
      `${job} must be gated on the main branch ref for every event`);
  }
}

function assertPagesConcurrency(source) {
  assert.match(source, /^concurrency:\n  group: pages\n  cancel-in-progress: false[ \t]*$/m);
}

function assertOrderedPolicy(source) {
  const orderedPolicy = [
    'uses: actions/checkout@v7',
    'uses: pnpm/action-setup@v6',
    'uses: actions/setup-node@v7',
    'uses: actions/configure-pages@v6',
    'run: pnpm install --frozen-lockfile',
    'run: pnpm run test:node',
    'run: pnpm run build',
    'run: pnpm run verify:export',
    'uses: actions/upload-pages-artifact@v5',
    'uses: actions/deploy-pages@v5',
  ];
  let previous = -1;
  for (const declaration of orderedPolicy) {
    const index = source.search(new RegExp(`^        ${declaration}[ \\t]*$`, 'm'));
    assert.ok(index > previous, `Missing or out-of-order policy: ${declaration}`);
    previous = index;
  }
}

test('deploys automatically on main and supports manual dispatch', () => {
  assert.match(workflow, /^on:\s*\n  push:\s*\n    branches:\s*\n      - main\s*\n  workflow_dispatch:/m);
});

test('prevents non-main manual dispatch from building or deploying', () => {
  assertMainRefGuards(workflow);
});

test('serializes Pages deployments across refs without cancelling an in-progress deployment', () => {
  assertPagesConcurrency(workflow);
});

test('main-only policy rejects absent or permissive job guards', () => {
  for (const job of ['build', 'deploy']) {
    const guarded = workflow.replace(/^    if: [^\n]+\n/gm, '').replace(/^  (build|deploy):\n/gm,
      "$&    if: ${{ github.ref == 'refs/heads/main' }}\n");
    const unsafe = guarded.replace(new RegExp(`(  ${job}:\n)    if: [^\n]+\n`), '$1');
    assert.throws(() => assertMainRefGuards(unsafe));
    assert.throws(() => assertMainRefGuards(guarded.replaceAll(
      "github.ref == 'refs/heads/main'", "github.event_name == 'workflow_dispatch' || github.ref == 'refs/heads/main'")));
  }
});

test('concurrency policy rejects ref-specific groups and implicit cancellation', () => {
  assert.throws(() => assertPagesConcurrency('concurrency:\n  group: pages-${{ github.ref }}\n  cancel-in-progress: false\n'));
  assert.throws(() => assertPagesConcurrency('concurrency:\n  group: pages\n'));
  assert.throws(() => assertPagesConcurrency('concurrency:\n  group: pages\n  cancel-in-progress: true\n'));
});

test('frozen-install policy rejects invalid suffixes and shell continuations', () => {
  for (const suffix of ['-false', '=false', ' --no-frozen-lockfile', ' || true', ' && echo ignored']) {
    assert.throws(() => assertFrozenInstall(`        run: pnpm install --frozen-lockfile${suffix}\n`),
      `Accepted invalid frozen install suffix: ${suffix}`);
  }
});

test('frozen-install policy accepts the exact run declaration', () => {
  assertFrozenInstall('        run: pnpm install --frozen-lockfile\n');
});

test('sets up pnpm before Node 22 with pnpm caching and Pages configuration', () => {
  assert.match(workflow, /uses: pnpm\/action-setup@v6\s*\n/);
  const node = steps.find((step) => step.includes('uses: actions/setup-node@v7')) ?? '';
  assert.match(node, /node-version: 22\s*\n/);
  assert.match(node, /cache: pnpm\s*\n/);
  assert.match(workflow, /uses: actions\/configure-pages@v6\s*\n/);
});

test('installs frozen dependencies and verifies the Pages-prefix build before upload', () => {
  assertFrozenInstall(workflow);
  const build = steps.find((step) => /run: pnpm run build\s*$/m.test(step)) ?? '';
  assert.match(build, /env:\s*\n          NEXT_PUBLIC_BASE_PATH: \/zihaonova-prism-academic-homepage\s*\n/);
  const verify = steps.find((step) => /run: pnpm run verify:export\s*$/m.test(step)) ?? '';
  assert.match(verify, /env:\s*\n          NEXT_PUBLIC_BASE_PATH: \/zihaonova-prism-academic-homepage\s*\n/);
  assertOrderedPolicy(workflow);
});

test('CI ordering policy rejects tests before install or after build', () => {
  const source = workflow.replace(/^      - name: Test Node policies\n        run: pnpm run test:node\n\n/m, '');
  const correct = source.replace('        run: pnpm install --frozen-lockfile\n',
    '        run: pnpm install --frozen-lockfile\n\n      - name: Test Node policies\n        run: pnpm run test:node\n');
  assertOrderedPolicy(correct);
  assert.throws(() => assertOrderedPolicy(source.replace('        run: pnpm install --frozen-lockfile',
    '        run: pnpm run test:node\n        run: pnpm install --frozen-lockfile')));
  assert.throws(() => assertOrderedPolicy(source.replace('        run: pnpm run build',
    '        run: pnpm run build\n        run: pnpm run test:node')));
});

test('uploads the static export and deploys it through the github-pages environment', () => {
  const upload = steps.find((step) => step.includes('uses: actions/upload-pages-artifact@v5')) ?? '';
  assert.match(upload, /with:\s*\n          path: \.\/out\s*$/m);
  assert.match(workflow, /deploy:\s*\n    needs: build\s*\n/);
  assert.match(workflow, /environment:\s*\n      name: github-pages\s*\n      url: \$\{\{ steps\.deployment\.outputs\.page_url \}\}/);
  const deploy = steps.find((step) => step.includes('uses: actions/deploy-pages@v5')) ?? '';
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
