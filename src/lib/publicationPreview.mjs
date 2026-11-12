const DEFAULT_PREVIEW_LIMIT = 8;

function normalizeFilenames(value, split) {
  if (typeof value !== 'string') return [];

  const values = split ? value.split(';') : [value];
  return values.map((filename) => filename.trim()).filter(Boolean);
}

/**
 * Normalize the multi-image field with a legacy single-image fallback.
 *
 * @param {unknown} previews
 * @param {unknown} preview
 * @param {number} [limit]
 * @returns {string[]}
 */
export function parsePublicationPreviews(previews, preview, limit = DEFAULT_PREVIEW_LIMIT) {
  const multi = normalizeFilenames(previews, true);
  const source = multi.length > 0 ? multi : normalizeFilenames(preview, false);
  const resolvedLimit = Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_PREVIEW_LIMIT;

  return Array.from(new Set(source)).slice(0, resolvedLimit);
}

/**
 * @param {number} width
 * @param {number} height
 * @returns {'landscape' | 'portrait'}
 */
export function classifyPreviewOrientation(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return 'landscape';
  }

  return height > width ? 'portrait' : 'landscape';
}
