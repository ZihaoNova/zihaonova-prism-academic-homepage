import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const list = read('src/components/publications/PublicationsList.tsx');
const selected = read('src/components/home/SelectedPublications.tsx');
const cardPage = read('src/components/pages/CardPage.tsx');
const messages = read('src/lib/i18n/messages.ts');

test('integrates the carousel only into full publication cards', () => {
  assert.match(list, /import PublicationImageCarousel from ['"]\.\/PublicationImageCarousel['"]/);
  assert.match(
    list,
    /<PublicationImageCarousel[\s\S]*?images=\{pub\.previews \|\| \(pub\.preview \? \[pub\.preview\] : \[\]\)\}[\s\S]*?title=\{pub\.title\}/,
  );
  assert.doesNotMatch(selected, /PublicationImageCarousel/);
  assert.doesNotMatch(cardPage, /PublicationImageCarousel/);
});

test('uses a fixed stage and orientation-aware uncropped images', () => {
  const carousel = read('src/components/publications/PublicationImageCarousel.tsx');

  assert.match(carousel, /h-72/);
  assert.match(carousel, /w-full md:w-48/);
  assert.match(carousel, /classifyPreviewOrientation/);
  assert.match(carousel, /aspect-\[4\/3\]/);
  assert.match(carousel, /aspect-\[9\/16\]/);
  assert.match(carousel, /object-contain/);
  assert.match(carousel, /withBasePath\(`\/papers\/\$\{/);
  assert.match(carousel, /onLoad=/);
  assert.doesNotMatch(carousel, /onLoadingComplete/);
});

test('provides accessible controls, keyboard navigation, and swipe navigation', () => {
  const carousel = read('src/components/publications/PublicationImageCarousel.tsx');

  assert.match(carousel, /messages\.publications\.previousImage/);
  assert.match(carousel, /messages\.publications\.nextImage/);
  assert.match(carousel, /event\.key === 'ArrowLeft'/);
  assert.match(carousel, /event\.key === 'ArrowRight'/);
  assert.match(carousel, /drag="x"/);
  assert.match(carousel, /SWIPE_THRESHOLD\s*=\s*50/);
  assert.match(carousel, /availableImages\.length > 1/);
});

test('defines English and Chinese carousel accessibility messages', () => {
  for (const key of ['previousImage', 'nextImage', 'imagePosition', 'imageGallery']) {
    assert.equal((messages.match(new RegExp(`${key}:`, 'g')) ?? []).length, 3);
  }
});
