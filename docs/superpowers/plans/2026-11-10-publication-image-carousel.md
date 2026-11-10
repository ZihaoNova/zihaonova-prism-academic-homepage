# Publication Image Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a stable, orientation-aware 1–4 image carousel to full publication cards while leaving Research and home-page publication cards unchanged.

**Architecture:** Normalize the legacy `preview` and new semicolon-separated `previews` BibTeX fields through a small tested JavaScript utility, then render the resulting list with a focused client carousel component. The carousel uses a fixed outer stage so mixed landscape and portrait slides never resize their publication card; intrinsic image dimensions choose a 4:3 or 9:16 inner frame.

**Tech Stack:** Next.js 15, React 19, TypeScript, Framer Motion, Next Image, Heroicons, Node test runner, Playwright CLI.

**Spec:** `docs/superpowers/specs/2026-11-10-publication-image-carousel-design.md`

## Global Constraints

- Support one to four preview images per publication.
- Keep legacy `preview` content working without edits; `previews` takes precedence when valid.
- Interpret landscape and square images as 4:3, portrait images as 9:16.
- Keep a publication card's height unchanged while its slides change.
- Use `object-contain` so scientific figures are not cropped.
- Do not add a carousel to Research or the selected-publications section on the home page.
- Add no runtime dependency and preserve GitHub Pages base-path/static-export behavior.

## Review Focus

- A `previews` value containing whitespace, empty segments, and duplicates must return unique trimmed filenames in source order.
- More than four configured images must be limited to the first four valid unique filenames.
- An empty or invalid `previews` value must fall back to the legacy `preview` value.
- Failed images must be removed without leaving navigation on a nonexistent slide; all failures must remove the media column.
- Mixed 4:3 and 9:16 slides must change only the inner frame, never the fixed carousel stage or card height.

---

### Task 1: Preview Metadata Normalization

**Files:**
- Create: `src/lib/publicationPreview.mjs`
- Create: `tests/publication-preview.test.mjs`
- Modify: `src/types/publication.ts`
- Modify: `src/lib/bibtexParser.ts`

**Interfaces:**
- Produces: `parsePublicationPreviews(previews: unknown, preview: unknown, limit?: number): string[]`
- Produces: `classifyPreviewOrientation(width: number, height: number): 'landscape' | 'portrait'`
- Produces: `Publication.previews?: string[]`

- [ ] **Step 1: Write failing normalization and orientation tests**

Test these exact cases in `tests/publication-preview.test.mjs`:

- `parsePublicationPreviews('a.png; b.png;;a.png; c.png', undefined)` equals `['a.png', 'b.png', 'c.png']`.
- Five unique filenames return only the first four.
- whitespace-only `previews` plus `preview = ' legacy.png '` returns `['legacy.png']`.
- valid `previews` takes precedence over `preview`.
- non-string values and empty values return `[]`.
- `(1200, 900)` and `(900, 900)` classify as `landscape`; `(900, 1200)` classifies as `portrait`.
- zero, negative, and non-finite dimensions classify as `landscape` for a stable pre-load default.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/publication-preview.test.mjs`

Expected: FAIL because `src/lib/publicationPreview.mjs` does not exist.

- [ ] **Step 3: Implement the metadata utility**

Create `src/lib/publicationPreview.mjs` with the two interfaces above. Split only `previews` on semicolons, trim values, remove empty and duplicate entries in source order, and apply the default limit of four.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/publication-preview.test.mjs`

Expected: all preview utility tests PASS.

- [ ] **Step 5: Integrate normalized previews into publication parsing**

Add `previews?: string[]` to `Publication`. In `parseBibTeX`, call `parsePublicationPreviews(tags.previews, tags.preview)` and assign the result when nonempty. Retain `preview` for compatibility and exclude both `preview` and `previews` from reconstructed/copyable BibTeX.

- [ ] **Step 6: Verify parser integration and the full Node suite**

Run: `pnpm run test:node`

Expected: all tests PASS with no failures.

- [ ] **Step 7: Commit Task 1**

```bash
git add src/lib/publicationPreview.mjs src/types/publication.ts src/lib/bibtexParser.ts tests/publication-preview.test.mjs
git commit -m "feat: parse publication preview galleries"
```

### Task 2: Stable Publication Carousel

**Files:**
- Create: `src/components/publications/PublicationImageCarousel.tsx`
- Create: `tests/publication-carousel-policy.test.mjs`
- Modify: `src/components/publications/PublicationsList.tsx`
- Modify: `src/lib/i18n/messages.ts`

**Interfaces:**
- Consumes: `Publication.previews?: string[]`
- Consumes: `classifyPreviewOrientation(width, height)`
- Produces: `PublicationImageCarousel({ images, title }: { images: string[]; title: string }): JSX.Element | null`

- [ ] **Step 1: Write failing carousel boundary tests**

Create source-policy tests that assert:

- `PublicationsList.tsx` imports and renders `PublicationImageCarousel` with `pub.previews || (pub.preview ? [pub.preview] : [])`.
- `SelectedPublications.tsx` and `CardPage.tsx` do not import `PublicationImageCarousel`.
- the carousel uses `withBasePath('/papers/...')`, localized previous/next labels, keyboard left/right handling, swipe/drag handling, and a fixed stage-height class.
- single-image rendering suppresses previous/next controls, dots, and counter through an explicit `images.length > 1` guard.

- [ ] **Step 2: Run the policy test and verify RED**

Run: `node --test tests/publication-carousel-policy.test.mjs`

Expected: FAIL because the carousel component and integration do not exist.

- [ ] **Step 3: Add localized accessibility labels**

Extend `LocaleMessages.publications` and both `en`/`zh` objects with `previousImage`, `nextImage`, `imagePosition`, and `imageGallery` strings. These labels are for `aria-label`/screen-reader output, not visible instructions.

- [ ] **Step 4: Implement `PublicationImageCarousel`**

Use a fixed `h-72` media stage with `w-full md:w-48`, centered content, and no layout-affecting dimension changes after load. Track active index, per-source orientation, drag direction, and failed sources. Use `onLoadingComplete` intrinsic dimensions to select a 4:3 landscape frame or 9:16 portrait frame; render images with `object-contain` and `withBasePath`.

For two or more valid images, add wrapping previous/next icon buttons, clickable dots, `current / total`, focusable left/right keyboard navigation, and a 50-pixel horizontal drag threshold. Respect reduced motion through Framer Motion. If an image fails, remove it and clamp the active index; return `null` when no valid image remains.

- [ ] **Step 5: Replace the inline image block in `PublicationsList`**

Render the new component only inside the full publication-card mapping. Keep the text column and all existing search, filter, abstract, BibTeX, DOI, and code interactions unchanged. Use `md:items-stretch` so the fixed media stage remains vertically centered beside variable text.

- [ ] **Step 6: Run the focused policy test and full Node suite**

Run: `node --test tests/publication-carousel-policy.test.mjs`

Expected: carousel policy tests PASS.

Run: `pnpm run test:node`

Expected: all tests PASS.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/components/publications/PublicationImageCarousel.tsx src/components/publications/PublicationsList.tsx src/lib/i18n/messages.ts tests/publication-carousel-policy.test.mjs
git commit -m "feat: add stable publication image carousel"
```

### Task 3: Build, Browser Verification, and Documentation

**Files:**
- Modify: `README.md`
- Modify: `README_cn.md`

**Interfaces:**
- Consumes: the `preview` and `previews` BibTeX content format.
- Produces: user-facing instructions for adding one to four paper images under `public/papers/`.

- [ ] **Step 1: Add content-author documentation**

Document the legacy single-image example and the semicolon-separated multi-image example in both README files. State the four-image maximum and recommend 4:3 landscape or 9:16 portrait source composition with important content kept away from edges.

- [ ] **Step 2: Run complete automated verification**

Run: `pnpm run test:node`

Expected: all Node tests PASS.

Run: `$env:NEXT_PUBLIC_BASE_PATH='/zihaonova-prism-academic-homepage'; pnpm run build`

Expected: production build and static export complete successfully.

Run: `$env:NEXT_PUBLIC_BASE_PATH='/zihaonova-prism-academic-homepage'; pnpm run verify:export`

Expected: exit code 0.

Run: `D:\anaconda3\envs\torchenv\python.exe -m pytest -v -p no:cacheprovider`

Expected: zero Python tests collected for this Next.js repository; report pytest exit code 5 as no-tests-collected, not as a product failure.

- [ ] **Step 3: Run browser verification**

Start the local development server on an available port. With Playwright CLI, inspect desktop and mobile widths for the publication list and confirm:

- existing single-image cards render without carousel controls;
- the image stage is vertically centered and bounded;
- card content has no overlap or horizontal overflow;
- Research cards and home selected-publication cards remain unchanged;
- language switching keeps the carousel's accessible labels localized.

Use a temporary external test fixture or browser-side state only for mixed-orientation/multi-slide interaction checks; do not commit unrelated paper images or write transient verification files inside the repository.

- [ ] **Step 4: Commit Task 3**

```bash
git add README.md README_cn.md
git commit -m "docs: explain publication preview galleries"
```

- [ ] **Step 5: Final branch review**

Run `git diff origin/main...HEAD --check`, inspect the complete diff against the spec, and request a fresh whole-branch review before integration or push.

