# PRISM Academic Homepage Backup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and run an independent PRISM-based backup academic homepage for Zihao Huang in `F:\CODE\Python\PRISM`.

**Architecture:** Use `xyjoey/PRISM` as the upstream Next.js template and keep customization content-first. Populate `content/`, `content_zh/`, and `public/` from the existing local Jekyll homepage while keeping `F:\CODE\Python\ZihaoNova.github.io` read-only.

**Tech Stack:** Git, Next.js 15, React 19, TypeScript, Tailwind CSS, TOML, Markdown, BibTeX, npm.

---

## File Structure

- Modify: `content/config.toml` for site metadata, navigation, author, links, and language settings.
- Modify: `content/about.toml` for homepage sections.
- Modify: `content/bio.md` for English biography.
- Modify: `content/news.toml` for homepage news.
- Modify: `content/publications.bib` for publication records and selected publication metadata.
- Modify: `content/publications.toml` for the publications page description.
- Modify: `content/cv.toml` and `content/cv.md` for CV routing and English CV content.
- Modify: `content/awards.toml` for honors and awards.
- Modify: `content/services.toml` for reviewer/service content.
- Create: `content/research.toml` for research themes as cards.
- Create: `content/tooling.toml` for reproducible geospatial tooling as cards.
- Modify: `content_zh/config.toml`, `content_zh/about.toml`, `content_zh/bio.md`, `content_zh/news.toml`, `content_zh/cv.md`, `content_zh/awards.toml`, `content_zh/services.toml`.
- Create: `content_zh/research.toml` and `content_zh/tooling.toml`.
- Create: `public/research/forest-age.png`, `public/research/lucc-simulation.png`, `public/research/forest-carbon.png`, `public/papers/forest-age.png`, `public/papers/lucc-simulation.png`, `public/papers/forest-carbon.png`, and `public/profile/github-avatar.png`.
- Modify: `src/components/pages/CardPage.tsx` to render optional card images and links already declared in `src/types/page.ts`.
- Modify: `README.md` to identify this fork as Zihao Huang's backup PRISM academic homepage.
- Keep: `F:\CODE\Python\ZihaoNova.github.io` read-only; do not write into it.

---

### Task 1: Finalize PRISM Repository Bootstrap

**Files:**
- Modify: `.git/` repository metadata
- Add: `docs/superpowers/specs/2026-06-25-prism-academic-homepage-design.md`
- Add: `docs/superpowers/plans/2026-06-25-prism-academic-homepage-implementation.md`

- [ ] **Step 1: Confirm branch and upstream template**

Run:

```powershell
git branch --show-current
git remote -v
git status --short
```

Expected:

```text
zihao-academic-homepage
origin  https://github.com/xyjoey/PRISM.git (fetch)
origin  https://github.com/xyjoey/PRISM.git (push)
?? docs/superpowers/
```

- [ ] **Step 2: Add planning artifacts**

Run:

```powershell
git add docs/superpowers/specs/2026-06-25-prism-academic-homepage-design.md docs/superpowers/plans/2026-06-25-prism-academic-homepage-implementation.md
```

Expected: command exits with code 0.

- [ ] **Step 3: Commit planning artifacts**

Run:

```powershell
git commit -m "docs: add Zihao PRISM homepage plan"
```

Expected: a commit is created on `zihao-academic-homepage`.

---

### Task 2: Migrate English Academic Homepage Content

**Files:**
- Modify: `content/config.toml`
- Modify: `content/about.toml`
- Modify: `content/bio.md`
- Modify: `content/news.toml`
- Modify: `content/publications.bib`
- Modify: `content/publications.toml`
- Create: `content/research.toml`
- Create: `content/tooling.toml`

- [ ] **Step 1: Replace global English site configuration**

Write `content/config.toml` with site metadata for Zihao Huang, links for email, Google Scholar, ORCID, ResearchGate, GitHub, institutional profile, and navigation entries for About, Research, Publications, Tooling, Awards, Services, and CV.

- [ ] **Step 2: Replace homepage section configuration**

Write `content/about.toml` so the homepage renders biography, research cards, selected publications, and news using PRISM's existing section types.

- [ ] **Step 3: Replace English biography**

Write `content/bio.md` with an academic biography centered on forest resource remote sensing, LUCC simulation, forest age dynamics, forest carbon cycle modeling, and reproducible geospatial workflows.

- [ ] **Step 4: Replace news items**

Write `content/news.toml` with the four existing news items from the Jekyll homepage.

- [ ] **Step 5: Replace publication records**

Write `content/publications.bib` with the seven publication records from the current homepage. Mark the first five as `selected = {true}` and include `preview` values for the three research-theme papers.

- [ ] **Step 6: Update publications page metadata**

Write `content/publications.toml` with title `Publications`, a description about forest remote sensing, LUCC, forest age, and carbon cycle modeling, and source `publications.bib`.

- [ ] **Step 7: Create research cards**

Write `content/research.toml` with three cards: forest age estimation, LUCC simulation, and forest carbon storage / NEP projection.

- [ ] **Step 8: Create tooling cards**

Write `content/tooling.toml` with cards for Google Earth Engine workflows, geospatial Python pipelines, raster validation, and ML/DL modeling.

- [ ] **Step 9: Run content sanity checks**

Run:

```powershell
rg -n "Jiale|John Doe|University of Example|Example Award|prestigious journal" content/config.toml content/about.toml content/bio.md content/news.toml content/publications.bib content/publications.toml content/research.toml content/tooling.toml
```

Expected: no matches.

- [ ] **Step 10: Commit English content**

Run:

```powershell
git add content/config.toml content/about.toml content/bio.md content/news.toml content/publications.bib content/publications.toml content/research.toml content/tooling.toml
git commit -m "content: migrate Zihao academic profile"
```

Expected: a commit is created on `zihao-academic-homepage`.

---

### Task 3: Add CV, Awards, Services, Chinese Content, and Assets

**Files:**
- Modify: `content/cv.toml`
- Modify: `content/cv.md`
- Modify: `content/awards.toml`
- Modify: `content/services.toml`
- Modify: `content_zh/config.toml`
- Modify: `content_zh/about.toml`
- Modify: `content_zh/bio.md`
- Modify: `content_zh/news.toml`
- Modify: `content_zh/cv.md`
- Modify: `content_zh/awards.toml`
- Modify: `content_zh/services.toml`
- Create: `content_zh/research.toml`
- Create: `content_zh/tooling.toml`
- Create: `public/research/forest-age.png`
- Create: `public/research/lucc-simulation.png`
- Create: `public/research/forest-carbon.png`
- Create: `public/papers/forest-age.png`
- Create: `public/papers/lucc-simulation.png`
- Create: `public/papers/forest-carbon.png`
- Create: `public/profile/github-avatar.png`
- Modify: `src/components/pages/CardPage.tsx`

- [ ] **Step 1: Replace English CV routing and Markdown**

Write `content/cv.toml` with `type = "text"`, `title = "CV"`, and `source = "cv.md"`. Write `content/cv.md` with experience, education, honors, talks, and services from the current homepage.

- [ ] **Step 2: Replace awards cards**

Write `content/awards.toml` with four cards: National Scholarship, Zhejiang Provincial Outstanding Graduate, Outstanding Doctoral Dissertation, and First-class Academic Scholarship.

- [ ] **Step 3: Replace services cards**

Write `content/services.toml` with reviewer service content for the SCI journals listed on the current homepage.

- [ ] **Step 4: Replace Chinese content files**

Write the corresponding `content_zh/` files with Chinese page titles, biography, news, research cards, tooling cards, CV, awards, and services. Use clean Chinese text for confidently recoverable items and omit corrupted Chinese talk titles that cannot be reconstructed from source text.

- [ ] **Step 5: Copy image assets**

Copy image assets from `F:\CODE\Python\ZihaoNova.github.io\images` into `public/research/` and `public/papers/` with stable ASCII names:

```powershell
New-Item -ItemType Directory -Force -Path public\research | Out-Null
New-Item -ItemType Directory -Force -Path public\papers | Out-Null
Copy-Item -LiteralPath "F:\CODE\Python\ZihaoNova.github.io\images\Forest age estimation from disturbance and recovery.png" -Destination "public\research\forest-age.png" -Force
Copy-Item -LiteralPath "F:\CODE\Python\ZihaoNova.github.io\images\LUCC simulation under climate and human effects.png" -Destination "public\research\lucc-simulation.png" -Force
Copy-Item -LiteralPath "F:\CODE\Python\ZihaoNova.github.io\images\Forest carbon storage and NEP projection.png" -Destination "public\research\forest-carbon.png" -Force
Copy-Item -LiteralPath "public\research\forest-age.png" -Destination "public\papers\forest-age.png" -Force
Copy-Item -LiteralPath "public\research\lucc-simulation.png" -Destination "public\papers\lucc-simulation.png" -Force
Copy-Item -LiteralPath "public\research\forest-carbon.png" -Destination "public\papers\forest-carbon.png" -Force
```

Expected: three image files exist under `public\research` and three matching preview files exist under `public\papers`.

- [ ] **Step 6: Render card images and links**

Modify `src/components/pages/CardPage.tsx` so each card renders `item.image` above the card text and wraps `item.link` as an external "Learn more" link at the bottom. Use the existing `CardItem` fields; do not add new content schema fields.

- [ ] **Step 7: Create local GitHub avatar**

Create `public/profile/github-avatar.png` from `https://github.com/ZihaoNova.png?size=320` using a network download command.

- [ ] **Step 8: Run content sanity checks**

Run:

```powershell
rg -n "Jiale|John Doe|University of Example|Example Award|prestigious journal" content content_zh
```

Expected: no matches.

- [ ] **Step 9: Commit CV, localization, assets, and card rendering**

Run:

```powershell
git add content/cv.toml content/cv.md content/awards.toml content/services.toml content/teaching.toml content_zh public/research public/papers public/profile src/app/globals.css src/app/layout.tsx src/components/home/Profile.tsx src/components/pages/CardPage.tsx src/lib/i18n/messages.ts docs/superpowers/plans/2026-06-25-prism-academic-homepage-implementation.md
git commit -m "content: add CV localization and research assets"
```

Expected: a commit is created on `zihao-academic-homepage`.

---

### Task 4: Update Documentation and Install Dependencies

**Files:**
- Modify: `README.md`
- Modify: `package-lock.json`
- Create: `node_modules/` locally, untracked

- [ ] **Step 1: Replace README project identity**

Write `README.md` to describe this repository as Zihao Huang's PRISM-based backup academic homepage, list content files, and provide local build/run commands.

- [ ] **Step 2: Commit README**

Run:

```powershell
git add README.md
git commit -m "docs: describe Zihao PRISM homepage"
```

Expected: a commit is created on `zihao-academic-homepage`.

- [ ] **Step 3: Install dependencies**

Run:

```powershell
npm install
```

Expected: dependencies install successfully and `node_modules/` exists.

---

### Task 5: Build, Run, and Verify

**Files:**
- Modify: build output under `.next/`
- Create: local dev server log file `tmp/prism-dev.log`

- [ ] **Step 1: Run production build**

Run:

```powershell
npm run build
```

Expected: Next.js build completes successfully.

- [ ] **Step 2: Start local development server**

Run a hidden background process:

```powershell
New-Item -ItemType Directory -Force -Path tmp | Out-Null
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev -- --hostname 127.0.0.1 --port 3000" -WorkingDirectory "F:\CODE\Python\PRISM" -RedirectStandardOutput "F:\CODE\Python\PRISM\tmp\prism-dev.log" -RedirectStandardError "F:\CODE\Python\PRISM\tmp\prism-dev.err.log" -WindowStyle Hidden
```

Expected: local server starts on `http://127.0.0.1:3000`.

- [ ] **Step 3: Probe homepage**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000 | Select-Object -ExpandProperty StatusCode
```

Expected:

```text
200
```

- [ ] **Step 4: Probe key pages**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/publications | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/research | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/cv | Select-Object -ExpandProperty StatusCode
```

Expected: each command prints `200`.

- [ ] **Step 5: Review git status**

Run:

```powershell
git status --short
```

Expected: source changes are committed; build and dependency artifacts are untracked or ignored.
