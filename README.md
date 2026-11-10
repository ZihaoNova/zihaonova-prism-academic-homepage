# Zihao Huang PRISM Academic Homepage

[中文](README_cn.md)

This repository contains the PRISM-based backup academic homepage for **Zihao Huang**, Lecturer at Zhejiang A&F University, built with Next.js, Tailwind CSS, and TypeScript.

Public Pages URL: <https://zihaonova.github.io/zihaonova-prism-academic-homepage/>.

HugoIO remains independent: this repository neither replaces nor modifies that homepage, its repository, or its deployment.

## Content

- Site metadata and navigation: `content/config.toml`; homepage layout: `content/about.toml`.
- Biography, news, and CV: `content/bio.md`, `content/news.toml`, and `content/cv.md`.
- Publications: `content/publications.bib`; research and tooling: `content/research.toml` and `content/tooling.toml`.
- Awards and service: `content/awards.toml` and `content/services.toml`.
- Chinese content: `content_zh/`, falling back to `content/` when a localized file is missing.
- Profile, research, and publication assets: `public/profile/`, `public/research/`, and `public/papers/`.

### Publication preview images

Place publication images in `public/papers/` and reference their filenames in the publication's BibTeX entry. The legacy single-image field remains supported:

```bibtex
preview = {paper-overview.png}
```

For a carousel, use `previews` with semicolon-separated filenames in display order:

```bibtex
previews = {paper-overview.png; paper-method.png; paper-results.png}
```

Each publication supports a maximum of 4 unique images. Compose landscape images at 4:3 and portrait images at 9:16; keep labels and other important content away from the edges. The carousel appears only on the Publications page, while Research and home-page publication cards remain single-image layouts.

## Local Development

Use Node.js 22 and pnpm 11.25.0 (pinned in `package.json`). Run from the repository root with `NEXT_PUBLIC_BASE_PATH` unset for root-path development:

```powershell
pnpm install --frozen-lockfile
pnpm run dev
```

Open <http://localhost:3000/>. For a local root-path static export:

```powershell
pnpm run test:node
pnpm run build
pnpm run verify:export
```

## GitHub Pages

`.github/workflows/deploy.yml` automatically builds, verifies, and deploys pushes to `main`; manual dispatch is also available. It uses Node.js 22, the pinned pnpm version, a frozen install, and the Pages base path below. Static output is written to `out/`.

To verify the Pages export locally in PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/zihaonova-prism-academic-homepage'
pnpm run build
pnpm run verify:export
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

## Attribution

Adapted from [PRISM](https://github.com/xyjoey/PRISM) by Joey Liu and contributors. Distributed under the [MIT License](LICENSE).
