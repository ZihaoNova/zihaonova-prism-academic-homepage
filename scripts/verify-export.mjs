import * as fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, URL } from 'node:url';

const routes = ['research', 'publications', 'tooling', 'awards', 'services', 'cv'];
const requiredPages = ['index.html', ...routes.map(route => `${route}/index.html`)];
const requiredAssets = [
  'profile/github-avatar.png',
  'research/forest-age.png',
  'research/lucc-simulation.png',
  'research/forest-carbon.png',
  'papers/forest-age.png',
  'papers/lucc-simulation.png',
  'papers/forest-carbon.png',
  'favicon.svg',
];
const requiredFiles = [...requiredPages, ...requiredAssets];
const forbiddenMarkers = ['zihaonova-academic-homepage', String.raw`F:\CODE\Python\HugoIO`];
const textExtensions = new Set([
  '.html', '.htm', '.js', '.mjs', '.cjs', '.json', '.map', '.txt', '.text', '.rsc',
  '.css', '.svg', '.xml', '.webmanifest',
]);

// These named references affect URL syntax; other names cannot hide a path separator or dot segment.
const urlReferences = {
  amp: '&', AMP: '&', quot: '"', QUOT: '"', apos: "'",
  lt: '<', LT: '<', gt: '>', GT: '>',
  sol: '/', bsol: '\\', period: '.', colon: ':', quest: '?', num: '#',
  percnt: '%', equals: '=', semi: ';', comma: ',', Tab: '\t', NewLine: '\n',
};

function decodeUrlReferences(value) {
  return value.replace(/&#(?:x([0-9a-f]+)|([0-9]+));?|&([a-z][a-z0-9]*);/gi,
    (reference, hex, decimal, name) => {
      if (name) return urlReferences[name] ?? reference;
      const point = Number.parseInt(hex ?? decimal, hex ? 16 : 10);
      return point === 0 || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff)
        ? '\uFFFD'
        : String.fromCodePoint(point);
    });
}

export async function verifyExport({ outDir, basePath }) {
  for (const relative of requiredFiles) {
    const target = path.join(outDir, relative);
    let stat;
    try {
      stat = await fs.stat(target);
    } catch (error) {
      throw new Error(`Cannot read required export file ${relative} in ${outDir}: ${error.message}`);
    }
    if (!stat.isFile()) {
      throw new Error(`Required export path is not a file: ${relative} in ${outDir}`);
    }
  }

  const assetReferences = new Set();
  const exportRoot = path.resolve(outDir);
  const origin = 'https://prism-export.invalid';

  async function localTarget(url, relative) {
    if (!url || url.startsWith('#') || url.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(url)) return;
    const pageUrl = `${origin}${basePath}/${relative.replace(/index\.html$/, '')}`;
    const resolved = new URL(url, pageUrl);
    if (resolved.origin !== origin
      || (basePath && resolved.pathname !== basePath && !resolved.pathname.startsWith(`${basePath}/`))) {
      throw new Error(`${relative}: local URL ${url} resolves to ${resolved.pathname}; path must equal ${basePath} or start with ${basePath}/`);
    }
    const local = decodeURIComponent(resolved.pathname.slice(basePath.length)).replace(/^\/+/, '');
    const target = path.resolve(exportRoot, local);
    const location = path.relative(exportRoot, target);
    if (location === '..' || location.startsWith(`..${path.sep}`) || path.isAbsolute(location)) {
      throw new Error(`${relative}: local target ${local} escapes the export directory`);
    }
    try {
      const stat = await fs.stat(target);
      const file = stat.isDirectory() ? await fs.stat(path.join(target, 'index.html')) : stat;
      if (!file.isFile()) throw new Error('not a file or exported route');
    } catch (error) {
      throw new Error(`${relative}: local URL ${url} references missing or invalid target ${local || 'index.html'}: ${error.message}`);
    }
    return local.replace(/\/$/, '');
  }

  async function inspect(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await inspect(target);
      } else if (entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase())) {
        const relative = path.relative(outDir, target).split(path.sep).join('/');
        const html = await fs.readFile(target, 'utf8');
        // JS/JSON/RSC can serialize Windows paths with repeated backslashes.
        const markerText = html.replace(/\\+/g, '\\');
        for (const marker of forbiddenMarkers) {
          if (markerText.includes(marker)) {
            throw new Error(`${relative}: forbidden marker ${marker}`);
          }
        }
        if (path.extname(entry.name).toLowerCase() !== '.html') continue;
        const isApplicationPage = requiredPages.includes(relative);
        if (isApplicationPage && !html.trim()) throw new Error(`${relative}: empty application HTML`);
        const navigation = new Set();
        let hasScript = false;
        let hasStylesheet = false;

        const attributes = /(?:^|[\t\n\f\r ])(href|src|srcset|action|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
        for (const match of html.matchAll(attributes)) {
          const value = decodeUrlReferences(match[2] ?? match[3] ?? match[4]).trim();
          const urls = match[1].toLowerCase() === 'srcset'
            ? value.split(',').map(candidate => candidate.trim().split(/\s+/)[0])
            : [value];
          for (const url of urls) {
            const local = await localTarget(url, relative);
            if (local === undefined || !isApplicationPage) continue;
            assetReferences.add(local);
            const attribute = match[1].toLowerCase();
            if (attribute === 'href') navigation.add(local);
            if (local.startsWith('_next/static/')) {
              if (attribute === 'src' && local.endsWith('.js')) hasScript = true;
              if (attribute === 'href' && local.endsWith('.css')) hasStylesheet = true;
            }
          }
        }
        if (isApplicationPage) {
          for (const route of ['', ...routes]) {
            if (!navigation.has(route)) throw new Error(`${relative}: missing required navigation reference /${route}`);
          }
          if (!hasScript) throw new Error(`${relative}: missing required framework script reference`);
          if (!hasStylesheet) throw new Error(`${relative}: missing required framework stylesheet reference`);
        }
      }
    }
  }

  await inspect(outDir);
  for (const asset of requiredAssets) {
    if (!assetReferences.has(asset)) throw new Error(`Missing required static-asset reference: ${asset}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await verifyExport({
      outDir: process.env.OUT_DIR ?? 'out',
      basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
