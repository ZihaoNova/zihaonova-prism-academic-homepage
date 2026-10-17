import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('pins pnpm as the repository package manager', () => {
  assert.equal(manifest.packageManager, 'pnpm@11.25.0');
});

test('pins the required Next.js patch', () => {
  assert.equal(manifest.dependencies.next, '15.5.28');
});

test('aligns eslint-config-next with the Next.js patch', () => {
  assert.equal(manifest.devDependencies['eslint-config-next'], '15.5.28');
});

test('does not retain an npm lockfile', () => {
  assert.equal(existsSync(new URL('../package-lock.json', import.meta.url)), false);
});

test('retains the pnpm lockfile', () => {
  assert.equal(existsSync(new URL('../pnpm-lock.yaml', import.meta.url)), true);
});
