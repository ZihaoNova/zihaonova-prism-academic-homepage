# PRISM GitHub Pages Completion Design

**Date:** 2026-10-16  
**Repository:** `ZihaoNova/zihaonova-prism-academic-homepage`  
**Target site:** `https://zihaonova.github.io/zihaonova-prism-academic-homepage/`

## Purpose

Finish the independent PRISM-based academic homepage so it is automatically built, deployed, and verified on GitHub Pages. The work must preserve the existing HugoIO homepage as a separate project and deployment.

## Hard Isolation Boundary

The implementation operates only on `F:\CODE\Python\PRISM` and the GitHub repository `ZihaoNova/zihaonova-prism-academic-homepage`.

It must not:

- modify `F:\CODE\Python\HugoIO` or any repository below it;
- modify `ZihaoNova/zihaonova-academic-homepage`;
- modify `ZihaoNova/zihaonova.github.io`;
- change the GitHub Pages settings, workflows, branches, or files of either existing homepage;
- reuse the HugoIO deployment URL.

The PRISM repository keeps `origin` pointed at the ZihaoNova PRISM repository. The upstream template remains a fetch-only `template` remote with its push URL disabled.

## Selected Approach

Use a conservative completion of the existing Next.js 15 static-export architecture. Configure repository-subpath deployment, standardize pnpm, add deterministic export verification, clean remaining template artifacts, and update only within the Next.js 15 release line.

This avoids a major-version framework migration while addressing the known incomplete deployment and maintenance work.

## Deployment Architecture

### Local development

Local development continues at the root path:

```text
http://127.0.0.1:3000/
```

No GitHub repository prefix is applied during ordinary local development.

### GitHub Pages

Production export uses this base path:

```text
/zihaonova-prism-academic-homepage
```

The workflow supplies the deployment base path through an environment variable. `next.config.ts` reads that value and applies `basePath` only for the Pages build. Internal navigation, favicon, profile image, publication previews, and research images must all resolve below the repository path.

A small shared path utility will prefix root-relative application assets when a Pages base path is active. Absolute external URLs, anchors, mail links, and already-prefixed values remain unchanged. This keeps content files readable while avoiding duplicated path logic in React components.

### Automatic deployment

`.github/workflows/deploy.yml` will:

1. run on pushes to `main` and on manual dispatch;
2. check out the repository;
3. install the pinned pnpm version;
4. set up Node.js 22 with pnpm caching;
5. configure GitHub Pages with the official Pages action;
6. install dependencies with `pnpm install --frozen-lockfile`;
7. build the static export with the repository base path;
8. run the export verification script;
9. upload `out/` and deploy it with the official GitHub Pages actions.

The repository's Pages source will be set to GitHub Actions before the first deployment. This changes only the PRISM repository's Pages settings.

The workflow receives only `contents: read`, `pages: write`, and `id-token: write` permissions.

## Package and Dependency Policy

pnpm is the sole package manager.

- Keep `pnpm-lock.yaml` and `pnpm-workspace.yaml`.
- Remove `package-lock.json`.
- Add a `packageManager` declaration to `package.json` using the pnpm version used to regenerate the lockfile.
- Replace workflow `npm` commands and caching with pnpm equivalents.
- Update `next` and `eslint-config-next` together from `15.3.3` to `15.5.28`.
- Do not upgrade to a newer Next.js major version in this task.
- Keep other dependency upgrades out of scope unless they are strictly required by Next.js 15.5.28.

## Repository Cleanup

The completion pass will:

- remove the unused `public/papers/example.png` template image;
- replace remaining generic Chinese template setup text in `README_cn.md` with repository-specific Chinese documentation;
- update the English README with the public site URL, pnpm commands, deployment behavior, and repository isolation notes;
- preserve the PRISM attribution and upstream link in the footer and documentation;
- preserve design and implementation records under `docs/superpowers/`.

Template attribution is not considered unwanted template residue.

## Verification Design

### Static export verification

Add `scripts/verify-export.mjs`, implemented with Node.js standard-library APIs so it introduces no test dependency. It will fail with a nonzero exit code when any required condition is missing.

The verifier checks:

- `out/index.html` exists;
- exported pages exist for `research`, `publications`, `tooling`, `awards`, `services`, and `cv`;
- generated HTML contains the configured repository base path for internal application assets and navigation;
- required profile, research, and publication images exist in `out/`;
- generated HTML contains no unprefixed root-relative references to known internal routes or assets;
- generated files contain no references to the HugoIO repository or deployment path.

`package.json` exposes the verifier through a `verify:export` script. The GitHub workflow runs it after the production build.

### Local checks

The implementation must run:

```powershell
pnpm install --frozen-lockfile
pnpm run build
pnpm run verify:export
D:\anaconda3\envs\torchenv\python.exe -m pytest -v
```

The project currently has no Python tests, so `pytest -v` may report zero collected tests and exit with pytest's no-tests status. That result must be reported accurately; it is not a substitute for the Node build and export verification.

Transient pytest files must use a verified OS temporary directory outside the repository and be removed after the run. No pytest scratch directory may be created inside the repository.

### Online checks

After deployment, verify with a real browser at desktop and mobile viewport sizes:

- the public URL returns the PRISM homepage;
- the profile image and research/publication images load;
- all primary navigation routes load without 404 errors;
- English and Chinese content switching works;
- internal links remain inside the PRISM repository path;
- there is no horizontal overflow or incoherent overlap;
- the HugoIO public URL still returns its existing homepage.

## Error Handling and Rollback

- Build or export-verifier failures prevent deployment.
- Deployment is performed only from `main` after local verification.
- A failed Pages run leaves the prior successful deployment intact.
- No force push is used.
- If online verification fails, fix the PRISM branch and redeploy; do not change HugoIO configuration.
- The previous PRISM commit remains available through Git history for rollback.

## Implementation Isolation

Implementation will use an isolated Git worktree on branch `codex/complete-pages-deployment`. The main checkout and HugoIO checkout remain untouched while changes are developed and tested.

After review and successful verification, the branch will be merged locally into `main`, tested again, pushed to the PRISM `origin`, and allowed to deploy through the workflow. External publication occurs only after the user has already approved this design and later selects the plan execution method.

## Acceptance Criteria

The work is complete when all of the following are true:

1. The repository uses pnpm as its only package manager.
2. Next.js and `eslint-config-next` are pinned to `15.5.28` and the lockfile is current.
3. Local root-path development remains supported.
4. GitHub Pages output works under `/zihaonova-prism-academic-homepage/`.
5. Pushes to `main` automatically run the Pages workflow.
6. The production build and export verifier pass.
7. The GitHub Pages workflow completes successfully.
8. Desktop and mobile browser checks pass for the deployed PRISM site.
9. The existing HugoIO site remains available and unchanged.
10. The PRISM local and remote `main` branches end at the same verified commit.

## Non-Goals

- Replacing the HugoIO homepage.
- Publishing PRISM at the root `zihaonova.github.io` domain.
- Migrating to a newer Next.js major version.
- Redesigning the PRISM visual system or rewriting academic content.
- Adding a server, database, analytics, CMS, or custom domain.
- Refactoring unrelated template components.
