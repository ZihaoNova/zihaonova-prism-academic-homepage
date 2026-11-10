import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  classifyPreviewOrientation,
  parsePublicationPreviews,
} from '../src/lib/publicationPreview.mjs';

test('normalizes semicolon-separated previews and removes duplicates', () => {
  assert.deepEqual(
    parsePublicationPreviews('a.png; b.png;;a.png; c.png', undefined),
    ['a.png', 'b.png', 'c.png'],
  );
});

test('limits previews to the first four unique filenames', () => {
  assert.deepEqual(
    parsePublicationPreviews('a.png;b.png;c.png;d.png;e.png', undefined),
    ['a.png', 'b.png', 'c.png', 'd.png'],
  );
});

test('falls back to the legacy preview when previews is blank', () => {
  assert.deepEqual(parsePublicationPreviews('  ; ', ' legacy.png '), ['legacy.png']);
});

test('prefers valid previews over the legacy preview', () => {
  assert.deepEqual(parsePublicationPreviews('a.png; b.png', 'legacy.png'), ['a.png', 'b.png']);
});

test('returns no previews for non-string and empty values', () => {
  assert.deepEqual(parsePublicationPreviews(undefined, undefined), []);
  assert.deepEqual(parsePublicationPreviews(42, { filename: 'a.png' }), []);
  assert.deepEqual(parsePublicationPreviews('', ''), []);
});

test('classifies landscape, square, and portrait dimensions', () => {
  assert.equal(classifyPreviewOrientation(1200, 900), 'landscape');
  assert.equal(classifyPreviewOrientation(900, 900), 'landscape');
  assert.equal(classifyPreviewOrientation(900, 1200), 'portrait');
});

test('uses landscape as the stable default for invalid dimensions', () => {
  for (const [width, height] of [
    [0, 900],
    [900, 0],
    [-1, 900],
    [900, -1],
    [Number.NaN, 900],
    [900, Number.POSITIVE_INFINITY],
  ]) {
    assert.equal(classifyPreviewOrientation(width, height), 'landscape');
  }
});

test('publication parsing exposes normalized previews and omits custom fields from copied BibTeX', () => {
  const parser = readFileSync(new URL('../src/lib/bibtexParser.ts', import.meta.url), 'utf8');
  const types = readFileSync(new URL('../src/types/publication.ts', import.meta.url), 'utf8');

  assert.match(parser, /parsePublicationPreviews\(tags\.previews, tags\.preview\)/);
  assert.match(parser, /previews:\s*previews\.length\s*>\s*0\s*\?\s*previews\s*:\s*undefined/);
  assert.match(parser, /\['selected', 'preview', 'previews', 'description', 'keywords', 'code'\]/);
  assert.match(types, /previews\?:\s*string\[\]/);
});
