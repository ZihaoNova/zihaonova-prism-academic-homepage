# PRISM GitHub Pages Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the independent PRISM academic homepage at its GitHub Project Pages URL with automatic deployment, deterministic path verification, pnpm-only dependency management, and no changes to the HugoIO homepage.

**Architecture:** Keep the existing Next.js 15 static export and add an environment-controlled repository base path. A shared URL helper handles root-relative static assets while Next.js `Link` handles application routes; a Node standard-library verifier checks the exported artifact before GitHub Pages can deploy it. GitHub Actions builds with pnpm and deploys only the PRISM repository.

**Tech Stack:** Next.js 15.5.28, React 19, TypeScript, Node.js 22, pnpm 11.25.0, Node `node:test`, GitHub Actions, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-10-16-prism-pages-completion-design.md`

## Global Constraints

- Modify only `F:\CODE\Python\PRISM` and `ZihaoNova/zihaonova-prism-academic-homepage`.
- Do not modify `F:\CODE\Python\HugoIO`, `ZihaoNova/zihaonova-academic-homepage`, or `ZihaoNova/zihaonova.github.io`.
- Deploy only at `/zihaonova-prism-academic-homepage/`; do not use the root `zihaonova.github.io` path.
- Keep `origin` pointed at `ZihaoNova/zihaonova-prism-academic-homepage`; keep `template` fetch-only with push URL `DISABLED`.
- Use pnpm as the only JavaScript package manager and keep only `pnpm-lock.yaml`.
- Pin both `next` and `eslint-config-next` to `15.5.28`; do not cross a Next.js major-version boundary.
- Pin `packageManager` to `pnpm@11.25.0`.
- Use Node.js 22 in CI.
- Use only Node standard-library APIs for export verification and its tests.
- Keep transient test files outside the repository. Node tests use `os.tmpdir()` and remove their own exact temporary directory. Pytest runs with a dedicated OS temporary directory and no in-repository cache provider.
- Preserve PRISM attribution and upstream links.
- Do not force-push.

## Review Focus

- A root-relative value that already includes `/zihaonova-prism-academic-homepage` must remain single-prefixed; `tests/site-path.test.mjs` pins this in Task 2.
- Protocol-relative and absolute external URLs must remain unchanged; `tests/site-path.test.mjs` pins this in Task 2.
- A stale or incomplete `out/` directory must fail verification rather than produce a false pass; `tests/verify-export.test.mjs` pins this in Task 1.
- A workflow edit that silently returns to npm or loses the `main` push trigger must fail repository tests; `tests/workflow-policy.test.mjs` pins this in Task 4.
- The export must not contain root-relative PRISM routes/assets or HugoIO deployment references; `tests/verify-export.test.mjs` and the Pages build in Task 2 pin this.

---

### Task 1: Static Export Verifier

**Files:**
- Create: `scripts/verify-export.mjs`
- Create: `tests/verify-export.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: exported files under an `outDir` and a normalized GitHub Pages `basePath`.
- Produces: `verifyExport({ outDir, basePath }): Promise<void>` exported from `scripts/verify-export.mjs`; it resolves on success and throws one diagnostic `Error` on failure. The CLI reads `OUT_DIR` (default `out`) and `NEXT_PUBLIC_BASE_PATH` (default empty) and exits nonzero on failure.
- Produces: package scripts `test:node` and `verify:export` for later tasks and CI.

- [ ] **Step 1: Write failing verifier tests**

Create `tests/verify-export.test.mjs` with Node `node:test`. Each test creates one exact directory using `fs.mkdtemp(path.join(os.tmpdir(), 'prism-export-'))` and removes that directory in `afterEach`/`finally`.

Tests must assert:

- a complete fixture containing `index.html`, all six route `index.html` files, and all required image files resolves;
- a missing `cv/index.html` rejects with a diagnostic naming that path;
- a missing profile image rejects with a diagnostic naming that image;
- unprefixed `href="/research/"`, `src="/profile/github-avatar.png"`, and `src="/_next/` reject when `basePath` is `/zihaonova-prism-academic-homepage`;
- already-prefixed internal URLs pass;
- HTML containing `zihaonova-academic-homepage` or `F:\CODE\Python\HugoIO` rejects;
- an absent or stale/incomplete output directory rejects rather than passing.

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/verify-export.test.mjs`

Expected: FAIL because `scripts/verify-export.mjs` does not exist.

- [ ] **Step 3: Implement `verifyExport` and package scripts**

Implement `scripts/verify-export.mjs` with `node:fs/promises`, `node:path`, and URL extraction from generated HTML. Required routes are `research`, `publications`, `tooling`, `awards`, `services`, and `cv`. Required assets are:

```text
profile/github-avatar.png
research/forest-age.png
research/lucc-simulation.png
research/forest-carbon.png
papers/forest-age.png
papers/lucc-simulation.png
papers/forest-carbon.png
favicon.svg
```

Only inspect local root-relative URLs. Ignore `http:`, `https:`, `mailto:`, hash fragments, and protocol-relative URLs. When `basePath` is nonempty, every local URL extracted from HTML must equal the base path or start with `${basePath}/`. Reject the two forbidden HugoIO markers exactly as specified by the tests.

Add these scripts to `package.json`:

```json
"test:node": "node --test tests/*.test.mjs",
"verify:export": "node scripts/verify-export.mjs"
```

- [ ] **Step 4: Run verifier tests and verify GREEN**

Run: `pnpm run test:node`

Expected: all Task 1 tests PASS; temporary directories are removed.

- [ ] **Step 5: Commit Task 1**

```powershell
git add package.json scripts/verify-export.mjs tests/verify-export.test.mjs
git commit -m "test: add static export verifier"
```

---

### Task 2: GitHub Project Pages Base Path

**Files:**
- Create: `src/lib/sitePath.mjs`
- Create: `tests/site-path.test.mjs`
- Modify: `next.config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/home/Profile.tsx`
- Modify: `src/components/publications/PublicationsList.tsx`
- Modify: `src/components/pages/CardPage.tsx`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_BASE_PATH`, which is empty locally and `/zihaonova-prism-academic-homepage` in Pages builds.
- Produces: `normalizeBasePath(value: string): string` and `withBasePath(value: string, basePath?: string): string` from `src/lib/sitePath.mjs` using JSDoc string types.
- Produces: the `next.config.ts` `basePath` value derived from `normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? '')`.
- Consumes: `verifyExport` and package scripts from Task 1.

- [ ] **Step 1: Write failing URL-helper tests**

Create `tests/site-path.test.mjs` and assert:

```javascript
assert.equal(normalizeBasePath(''), '');
assert.equal(normalizeBasePath('/repo/'), '/repo');
assert.equal(withBasePath('/profile/a.png', '/repo'), '/repo/profile/a.png');
assert.equal(withBasePath('/repo/profile/a.png', '/repo'), '/repo/profile/a.png');
assert.equal(withBasePath('https://example.com/a.png', '/repo'), 'https://example.com/a.png');
assert.equal(withBasePath('//cdn.example.com/a.png', '/repo'), '//cdn.example.com/a.png');
assert.equal(withBasePath('mailto:test@example.com', '/repo'), 'mailto:test@example.com');
assert.equal(withBasePath('#section', '/repo'), '#section');
assert.equal(withBasePath('/profile/a.png', ''), '/profile/a.png');
```

- [ ] **Step 2: Run helper tests and verify RED**

Run: `pnpm run test:node`

Expected: FAIL because `src/lib/sitePath.mjs` does not exist.

- [ ] **Step 3: Implement the shared path helper**

Implement both exported functions in `src/lib/sitePath.mjs`. `normalizeBasePath` returns empty or exactly one leading slash with no trailing slash. `withBasePath` prefixes only single-slash root-relative values and refuses to double-prefix.

- [ ] **Step 4: Run helper tests and verify GREEN**

Run: `pnpm run test:node`

Expected: all Task 1 and Task 2 tests PASS.

- [ ] **Step 5: Prove the current Pages export is RED**

In PowerShell, set `NEXT_PUBLIC_BASE_PATH` to `/zihaonova-prism-academic-homepage`, run `pnpm run build`, then run `pnpm run verify:export`.

Expected: build completes, but verifier FAILS because the current Next.js configuration and static asset references do not apply the repository prefix.

- [ ] **Step 6: Apply the base path to configuration and static assets**

In `next.config.ts`, derive `deploymentBasePath` from `normalizeBasePath` and set `basePath` to that value or `undefined` when empty. Do not set `assetPrefix`; Next.js documents `basePath` as the correct mechanism for sub-path hosting and applies it to framework assets and `next/link` routes.

Use `withBasePath` for static assets that Next.js does not prefix automatically:

- `src/app/layout.tsx`: metadata icon and explicit favicon `<link>`;
- `src/components/home/Profile.tsx`: `author.avatar` passed to `Image`;
- `src/components/publications/PublicationsList.tsx`: publication preview source;
- `src/components/pages/CardPage.tsx`: `item.image` passed to `Image`.

Do not manually prefix `next/link` route destinations; Next.js applies `basePath` to those links.

- [ ] **Step 7: Verify Pages and local builds are GREEN**

Pages build:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/zihaonova-prism-academic-homepage'
pnpm run build
pnpm run verify:export
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

Expected: build exits 0 and verifier prints a success summary for all required routes/assets.

Local-root build:

```powershell
pnpm run build
pnpm run verify:export
pnpm run test:node
```

Expected: all commands exit 0; root-path output remains valid and every Node test passes.

- [ ] **Step 8: Commit Task 2**

```powershell
git add next.config.ts src/lib/sitePath.mjs tests/site-path.test.mjs src/app/layout.tsx src/components/home/Profile.tsx src/components/publications/PublicationsList.tsx src/components/pages/CardPage.tsx
git commit -m "feat: support GitHub Pages base path"
```

---

### Task 3: pnpm-Only Dependency Policy and Next.js Patch Update

**Files:**
- Create: `tests/repository-policy.test.mjs`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Delete: `package-lock.json`

**Interfaces:**
- Consumes: `test:node` from Task 1.
- Produces: package-manager policy `packageManager: "pnpm@11.25.0"`, `next: "15.5.28"`, and `eslint-config-next: "15.5.28"`.
- Produces: a lockfile accepted by `pnpm install --frozen-lockfile` on Node.js 22.

- [ ] **Step 1: Write failing repository-policy tests**

Create `tests/repository-policy.test.mjs` using `node:test`. Assert:

- `package.json.packageManager === 'pnpm@11.25.0'`;
- `dependencies.next === '15.5.28'`;
- `devDependencies['eslint-config-next'] === '15.5.28'`;
- `package-lock.json` does not exist;
- `pnpm-lock.yaml` exists.

- [ ] **Step 2: Run policy tests and verify RED**

Run: `pnpm run test:node`

Expected: FAIL on the missing `packageManager`, old Next.js versions, and existing `package-lock.json`.

- [ ] **Step 3: Apply dependency policy**

Update `package.json`, remove `package-lock.json`, and regenerate `pnpm-lock.yaml` with pnpm 11.25.0. Use the registry only for the specified Next.js packages and unavoidable peer/lockfile resolution.

Run: `pnpm install --lockfile-only`

Expected: exit 0 and lockfile entries resolve `next` and `eslint-config-next` to `15.5.28`.

- [ ] **Step 4: Verify frozen install and full local suite**

Run:

```powershell
pnpm install --frozen-lockfile
pnpm run test:node
pnpm run build
pnpm run verify:export
```

Expected: all commands exit 0 and all Node tests PASS.

- [ ] **Step 5: Commit Task 3**

```powershell
git add package.json pnpm-lock.yaml tests/repository-policy.test.mjs
git rm package-lock.json
git commit -m "build: standardize pnpm and update Next.js"
```

---

### Task 4: GitHub Pages Workflow Policy

**Files:**
- Create: `tests/workflow-policy.test.mjs`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: pnpm policy from Task 3 and `verify:export` from Task 1.
- Produces: automatic deployment on `main`, manual dispatch, Node.js 22 with pnpm cache, frozen install, repository base-path build, artifact verification, and official Pages deployment.

- [ ] **Step 1: Write failing workflow-policy tests**

Create `tests/workflow-policy.test.mjs` using `node:test` and read `.github/workflows/deploy.yml` as text. Assert that it contains:

- an active `push` trigger for `main` and `workflow_dispatch`;
- `pnpm/action-setup@v4`;
- `node-version: 22` and `cache: pnpm`;
- `actions/configure-pages@v5`;
- `pnpm install --frozen-lockfile`;
- `NEXT_PUBLIC_BASE_PATH: /zihaonova-prism-academic-homepage` on the build path;
- `pnpm run build` followed by `pnpm run verify:export`;
- `actions/upload-pages-artifact@v3` with `path: ./out`;
- `actions/deploy-pages@v4`;
- only `contents: read`, `pages: write`, and `id-token: write` permissions;
- no `npm install`, `npm run`, or `cache: npm`.

- [ ] **Step 2: Run workflow tests and verify RED**

Run: `pnpm run test:node`

Expected: FAIL because push deployment is commented out and the workflow still uses npm.

- [ ] **Step 3: Implement the deployment workflow**

Update `.github/workflows/deploy.yml` in this order: checkout, pnpm setup, Node setup, Pages configuration, frozen install, base-path build, export verification, artifact upload, deploy. Keep the existing least-privilege permissions and `github-pages` environment URL.

- [ ] **Step 4: Run workflow tests and full build verification**

Run:

```powershell
pnpm run test:node
$env:NEXT_PUBLIC_BASE_PATH = '/zihaonova-prism-academic-homepage'
pnpm run build
pnpm run verify:export
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

Expected: all tests and Pages export checks PASS.

- [ ] **Step 5: Commit Task 4**

```powershell
git add .github/workflows/deploy.yml tests/workflow-policy.test.mjs
git commit -m "ci: deploy PRISM with GitHub Pages"
```

---

### Task 5: Repository-Specific Documentation and Template Cleanup

**Files:**
- Create: `tests/repository-content.test.mjs`
- Modify: `README.md`
- Modify: `README_cn.md`
- Delete: `public/papers/example.png`

**Interfaces:**
- Consumes: public URL, pnpm policy, and deployment behavior from Tasks 2-4.
- Produces: English and Chinese repository documentation that describes this Zihao Huang site rather than the generic template.

- [ ] **Step 1: Write failing content-policy tests**

Create `tests/repository-content.test.mjs` and assert:

- both READMEs contain `https://zihaonova.github.io/zihaonova-prism-academic-homepage/`;
- both use `pnpm install`, `pnpm run dev`, and `pnpm run build`;
- both explain that HugoIO remains independent;
- `README_cn.md` does not contain `git clone https://github.com/xyjoey/PRISM.git`, `npm install`, `Next.js 20`, or generic star-request copy;
- `public/papers/example.png` does not exist;
- PRISM attribution and `https://github.com/xyjoey/PRISM` remain present.

- [ ] **Step 2: Run content tests and verify RED**

Run: `pnpm run test:node`

Expected: FAIL on generic README content, npm commands, missing public URL, and the example image.

- [ ] **Step 3: Rewrite documentation and remove the unused image**

Keep both READMEs concise and repository-specific. Document content locations, Node.js 22, pnpm commands, root-path local development, automatic `main` deployment, the public Pages URL, and the hard separation from HugoIO. Preserve MIT and PRISM attribution.

Delete only `public/papers/example.png`; retain all Zihao research/publication assets.

- [ ] **Step 4: Run the complete local verification suite**

Run:

```powershell
pnpm install --frozen-lockfile
pnpm run test:node
$env:NEXT_PUBLIC_BASE_PATH = '/zihaonova-prism-academic-homepage'
pnpm run build
pnpm run verify:export
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
pnpm run build
pnpm run verify:export
git diff --check
```

Expected: every command exits 0 and all Node tests PASS.

- [ ] **Step 5: Run the required pytest command without repository scratch files**

Resolve a unique directory below `[System.IO.Path]::GetTempPath()`, verify that its full path starts with the resolved OS temporary root, create it, set `TEMP` and `TMP` to it, and run:

```powershell
D:\anaconda3\envs\torchenv\python.exe -m pytest -v -p no:cacheprovider
```

Expected: pytest starts under `torchenv`. Because this repository has no Python tests, record `collected 0 items` and pytest exit code 5 as the expected no-tests result, not as a passing Python suite. After the process exits, remove only the exact unique temporary directory and verify it no longer exists. Remove the pre-existing ignored `F:\CODE\Python\PRISM\.pytest_cache` only after resolving and verifying that exact path is inside this repository and no pytest process is running.

- [ ] **Step 6: Commit Task 5**

```powershell
git add README.md README_cn.md tests/repository-content.test.mjs
git rm public/papers/example.png
git commit -m "docs: finish PRISM repository documentation"
```

---

## Final Review and Integration

After all five tasks:

1. Run the full Node test suite and both root-path and Pages-path builds again.
2. Use `superpowers:requesting-code-review` for a fresh whole-branch review against this plan, its spec, and the execution ledger.
3. Fix Critical or Important findings with RED-to-GREEN tests; record Minor findings without expanding scope.
4. Use `superpowers:finishing-a-development-branch` to integrate `codex/complete-pages-deployment` into `main` only after the suite is green.
5. Re-run the complete verification suite on merged `main`.
6. Confirm `origin` and `template` remotes still satisfy the isolation boundary.
7. Set only `ZihaoNova/zihaonova-prism-academic-homepage` Pages build type to `workflow`. Read first; create the Pages site if absent or update it if present.
8. Push verified `main` to the PRISM `origin` without force.
9. Watch the `Deploy PRISM to GitHub Pages` workflow to a successful conclusion.
10. Use a real browser to check desktop and mobile layouts, English/Chinese switching, all primary routes, all required images, internal URL prefixes, and absence of horizontal overflow.
11. Verify `https://zihaonova.github.io/zihaonova-academic-homepage/` still returns the existing HugoIO homepage and was not changed.
12. Confirm local and remote PRISM `main` resolve to the same commit.

The release is incomplete until the workflow, PRISM public URL, HugoIO isolation check, and local/remote commit comparison all pass.
