import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeBasePath, withBasePath } from '../src/lib/sitePath.mjs';

for (const [value, expected] of [
  ['', ''],
  ['/repo/', '/repo'],
  ['repo', '/repo'],
  ['///repo///', '/repo'],
  ['/', ''],
]) {
  test(`normalizes base path ${JSON.stringify(value)}`, () => {
    assert.equal(normalizeBasePath(value), expected);
  });
}

for (const [value, basePath, expected] of [
  ['/profile/a.png', '/repo', '/repo/profile/a.png'],
  ['/repo/profile/a.png', '/repo', '/repo/profile/a.png'],
  ['https://example.com/a.png', '/repo', 'https://example.com/a.png'],
  ['//cdn.example.com/a.png', '/repo', '//cdn.example.com/a.png'],
  ['mailto:test@example.com', '/repo', 'mailto:test@example.com'],
  ['#section', '/repo', '#section'],
  ['/profile/a.png', '', '/profile/a.png'],
  ['/repo', '/repo', '/repo'],
  ['/repo?view=home', '/repo', '/repo?view=home'],
  ['/repo#section', '/repo', '/repo#section'],
  ['/repo-other/a.png', '/repo', '/repo/repo-other/a.png'],
  ['profile/a.png', '/repo', 'profile/a.png'],
  ['', '/repo', ''],
  ['/profile/a.png', '/repo/', '/repo/profile/a.png'],
]) {
  test(`resolves ${JSON.stringify(value)} under ${JSON.stringify(basePath)}`, () => {
    assert.equal(withBasePath(value, basePath), expected);
  });
}

test('defaults to NEXT_PUBLIC_BASE_PATH and falls back to local root', () => {
  const original = process.env.NEXT_PUBLIC_BASE_PATH;
  try {
    process.env.NEXT_PUBLIC_BASE_PATH = '/repo';
    assert.equal(withBasePath('/profile/a.png'), '/repo/profile/a.png');
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    assert.equal(withBasePath('/profile/a.png'), '/profile/a.png');
  } finally {
    if (original === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = original;
  }
});
