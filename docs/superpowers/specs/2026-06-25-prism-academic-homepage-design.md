# PRISM Academic Homepage Backup Design

Date: 2026-06-25
Status: Approved for specification

## Goal

Build an independent PRISM-based backup academic homepage for Zihao Huang in `F:\CODE\Python\PRISM`, using `xyjoey/PRISM` as the template and the existing local `ZihaoNova.github.io` Jekyll homepage as the content source.

This project is a backup academic homepage, not a replacement for the current published `ZihaoNova.github.io` site. The existing Jekyll repository must not be overwritten.

## Source Repositories

- Template source: `https://github.com/xyjoey/PRISM`
- Existing profile source: `F:\CODE\Python\ZihaoNova.github.io`
- Target workspace: `F:\CODE\Python\PRISM`

## Scope

The PRISM site will be customized as an English-first academic homepage with Chinese companion content. It should emphasize Zihao Huang's academic identity and research profile:

- Faculty member / Lecturer at Zhejiang A&F University
- Forest resource remote sensing
- Land use/cover change simulation
- Forest age dynamics
- Forest carbon cycle modeling
- Reproducible geospatial Python tooling as supporting research infrastructure

The current Jekyll homepage remains untouched except for read-only use as a source of text, links, publication details, and image assets.

## Recommended Approach

Use a content-first PRISM migration with minimal code changes.

1. Clone or copy the PRISM template into `F:\CODE\Python\PRISM`.
2. Populate PRISM content files rather than rewriting core React components.
3. Add light component or style edits only if the stock PRISM content model cannot represent the academic sections cleanly.
4. Preserve a clean boundary between the backup PRISM site and the existing Jekyll homepage.

This approach keeps the site easier to update from upstream PRISM and avoids unnecessary code ownership.

## Content Structure

### Global Site Configuration

Populate `content/config.toml` with:

- Site title: `Zihao Huang`
- Site description focused on forest remote sensing, LUCC simulation, forest age, and forest carbon modeling
- Site URL set to the local backup/deployment target chosen during implementation; default to `https://zihaonova.github.io` only if this PRISM site is later promoted to production
- Author profile:
  - Name: Zihao Huang
  - Title: Faculty member / Lecturer
  - Organization: Zhejiang A&F University
  - Location: Hangzhou, Zhejiang, China
  - Email: `zihhuang@outlook.com`
  - GitHub: `ZihaoNova`
  - Google Scholar link
  - ResearchGate link
  - ORCID link
  - institutional profile link
- Navigation for About, Research, Publications, CV, and Tooling

### Homepage

Populate `content/about.toml` with:

- A concise academic biography
- Research focus summary
- News items migrated from the current homepage
- Selected publications
- Selected research themes

The tone should be academic and internationally legible. Engineering content should support the research story rather than become the primary identity.

### Publications

Create `content/publications.bib` from the current publication list. Include at least the seven publications currently shown on the Jekyll homepage, preserving:

- Authors
- Year
- Title
- Journal
- Volume, issue, pages/article number where available
- DOI or URL where available
- Co-first author note where relevant
- Selected/highlight metadata if PRISM supports it
- Preview or description metadata where useful

### Research / Projects

Create `content/research.toml` as a PRISM card-style page for three primary research themes:

1. Forest age estimation from disturbance and recovery
2. LUCC simulation under climate and human effects
3. Forest carbon storage and NEP projection

Each theme should include:

- Short title
- Methods and tools
- Related papers
- One concise summary
- Image asset copied from the existing homepage when available

### CV Page

Create `content/cv.md` containing:

- Experience
- Education
- Honors and awards
- Talks
- Services

Use the existing homepage as the initial source. Fix any mojibake/encoding issues while migrating, especially Chinese names and Chinese talk titles.

### Chinese Content

Use PRISM's `content_zh/` structure for Chinese companion content.

- Mirror key pages where Chinese source is available or can be reliably reconstructed.
- Keep English as the default site language.
- If a localized file is missing, rely on PRISM fallback behavior rather than forcing incomplete Chinese pages.

## Assets

Copy relevant image assets from `F:\CODE\Python\ZihaoNova.github.io\images` into PRISM's `public/` asset tree. Rename copied assets to stable ASCII filenames and update content references accordingly.

Important assets include:

- Forest age estimation image
- LUCC simulation image
- Forest carbon storage and NEP projection image
- GitHub avatar or local academic profile image if available
- Existing icons only if they fit PRISM's asset model

## Implementation Boundaries

Do not overwrite `F:\CODE\Python\ZihaoNova.github.io`.

Do not make the PRISM site the production GitHub Pages repository unless explicitly requested later.

Do not introduce broad redesign work before the content migration is complete and buildable.

Do not install dependencies unless needed for local build verification.

## Verification

After implementation:

1. Install dependencies if `node_modules` is missing.
2. Run `npm run build`.
3. Run the local dev server.
4. Inspect the site in a browser.
5. Check desktop and mobile homepage layout.
6. Check publications rendering and filtering if present.
7. Check Chinese content or fallback behavior.
8. Check that copied images render correctly.

## Risks And Handling

- Network access may require approval for cloning PRISM or installing npm packages.
- The current sandbox is read-only, so writing files requires approval.
- Existing `ZihaoNova.github.io` has one uncommitted change in `_pages/about.md`; it must not be reverted or overwritten.
- The current homepage contains mojibake in several Chinese strings. Migration should repair these strings where confidently recoverable and leave uncertain wording out rather than preserving corrupted text.
- PRISM depends on a modern Node version. If the local Node version is incompatible, record that and still complete content migration.

## Success Criteria

The task is complete when `F:\CODE\Python\PRISM` contains a PRISM-based, buildable backup academic homepage populated with Zihao Huang's profile, research themes, publications, CV content, links, and image assets, with the existing Jekyll homepage left untouched.

