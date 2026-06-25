# Zihao Huang PRISM Academic Homepage

This repository contains a PRISM-based backup academic homepage for **Zihao Huang**, Lecturer at Zhejiang A&F University.

The site is adapted from [`xyjoey/PRISM`](https://github.com/xyjoey/PRISM), a configurable Next.js, Tailwind CSS, and TypeScript academic homepage template.

## Content

- Global site metadata and navigation: `content/config.toml`
- Homepage structure: `content/about.toml`
- English biography: `content/bio.md`
- News: `content/news.toml`
- Publications: `content/publications.bib`
- Research themes: `content/research.toml`
- Geospatial tooling: `content/tooling.toml`
- CV: `content/cv.md`
- Chinese companion content: `content_zh/`
- Static assets: `public/research/`, `public/papers/`, and `public/profile/`

The existing Jekyll homepage repository at `F:\CODE\Python\ZihaoNova.github.io` was used only as a source of public profile content and assets.

## Local Development

PRISM requires Node.js 22 or later.

```powershell
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Build

```powershell
npm run build
```

## Notes

- This repository is a backup academic homepage and does not replace the current `ZihaoNova.github.io` site.
- The current customization is content-first. React component changes are limited to rendering existing PRISM card fields for images and external links.
- Chinese content is maintained under `content_zh/`; missing localized data falls back to `content/` through PRISM's i18n loader.

## Acknowledgements

Built from PRISM by Joey Liu and contributors. PRISM is licensed under the MIT License.
