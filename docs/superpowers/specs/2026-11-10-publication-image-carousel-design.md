# Publication Image Carousel Design

## Intent

Add an image carousel to each publication card so a paper can show three or four representative figures without changing the Research page. The carousel should reduce the visually unbalanced empty area beside long publication metadata while keeping the list compact and stable.

## Goals

- Support one to four preview images per publication.
- Preserve the current single-image `preview` field for backward compatibility.
- Detect each loaded image as landscape or portrait from its intrinsic dimensions.
- Render landscape images in a 4:3 frame and portrait images in a 9:16 frame.
- Keep each publication card at a constant height while its carousel changes slides.
- Center the media frame vertically in the left side of the publication card.
- Provide accessible previous/next controls, clickable position indicators, a slide counter, keyboard navigation, and mobile swipe navigation.
- Keep GitHub Pages base-path handling and static export compatibility.

## Non-goals

- Do not add a carousel to Research cards or the selected-publications section on the home page.
- Do not render PDFs or fetch images from publication websites.
- Do not add a new carousel dependency; use the existing React, Framer Motion, Heroicons, and Next Image stack.
- Do not make every publication card the same height. Only slide changes within one card must not resize that card.

## Content Format

Images remain under `public/papers/`. A publication may keep the existing single-image field:

```bibtex
preview = {forest-age.png},
```

or use a semicolon-separated multi-image field:

```bibtex
previews = {forest-age-overview.png; forest-age-method.png; forest-age-results.png},
```

`previews` takes precedence when present. Empty entries are ignored, surrounding whitespace is trimmed, and a maximum of four images is retained. `preview` becomes a one-item fallback so existing content continues to work without edits. Both custom fields are omitted from copied BibTeX output.

## Selected Approach

### A. Centered adaptive carousel

Use a fixed-size media stage in the publication card's left column. The current slide is centered inside that stage. After the image loads, its intrinsic width and height determine its presentation frame:

- landscape or square: 4:3
- portrait: 9:16

The fixed outer stage prevents card height changes when a carousel mixes landscape and portrait images. The inner frame uses `object-contain` so scientific figures are not cropped. A neutral background makes any unavoidable remaining space intentional rather than accidental.

On narrow screens, the media stage moves above the publication text but retains a bounded height. The card remains stable during slide changes.

### Alternatives considered

- **Equal-height media rail:** filled the left column more strongly but made the media area visually heavier than the publication metadata.
- **Top wide gallery:** minimized side whitespace but made every publication card substantially taller and reduced list-scanning efficiency.

The centered adaptive carousel was selected because it preserves the current card structure and the deliberate breathing room visible in the existing design.

## Interaction

- One image: show the image without arrows, dots, or a counter.
- Two to four images: show previous and next icon buttons, clickable dots, and `current / total`.
- Arrow buttons wrap from last to first and first to last.
- Left and right arrow keys operate while the carousel has focus.
- Horizontal swipe changes slides on touch devices.
- Slide transitions use a short restrained fade/translate animation and respect reduced-motion preferences.
- Controls include localized accessible labels; they do not require visible instructional text.

## Components and Data Flow

1. `content/publications.bib` declares `preview` or `previews` filenames.
2. `src/lib/bibtexParser.ts` normalizes them into `Publication.previews: string[]` while retaining `preview` compatibility.
3. A focused publication-carousel component owns the active slide and loaded orientation state.
4. `PublicationsList.tsx` renders that component only on the full Publications page card.
5. Every image URL continues through `withBasePath('/papers/...')` for GitHub Pages.

The Research page continues to read `content/research.toml` and is unaffected.

## Error Handling

- Missing or failed images fall back to the next configured image when available.
- If all configured images fail, the media stage is removed so the publication text uses the full card width.
- Duplicate filenames are de-duplicated while preserving order.
- Invalid or empty `previews` values fall back to `preview`.

## Testing and Verification

- Add tests for single-image fallback, semicolon-separated lists, trimming, de-duplication, four-image limiting, and orientation classification.
- Verify existing publication parsing and copied BibTeX behavior.
- Run `pnpm run test:node`.
- Run the GitHub Pages-prefix production build and static-export verification.
- Run `pytest -v` with `D:\anaconda3\envs\torchenv\python.exe`; zero collected Python tests is expected for this Next.js repository.
- Use browser screenshots at desktop and mobile widths to verify stable card height, mixed-orientation slides, controls, swipe behavior, and absence of horizontal overflow.

