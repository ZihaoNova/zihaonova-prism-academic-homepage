import * as fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const routes = ['research', 'publications', 'tooling', 'awards', 'services', 'cv'];
const requiredFiles = [
  'index.html',
  ...routes.map(route => `${route}/index.html`),
  'profile/github-avatar.png',
  'research/forest-age.png',
  'research/lucc-simulation.png',
  'research/forest-carbon.png',
  'papers/forest-age.png',
  'papers/lucc-simulation.png',
  'papers/forest-carbon.png',
  'favicon.svg',
];
const forbiddenMarkers = ['zihaonova-academic-homepage', String.raw`F:\CODE\Python\HugoIO`];

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

  async function inspect(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await inspect(target);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        const relative = path.relative(outDir, target).split(path.sep).join('/');
        const html = await fs.readFile(target, 'utf8');
        for (const marker of forbiddenMarkers) {
          if (html.includes(marker)) {
            throw new Error(`${relative}: forbidden marker ${marker}`);
          }
        }
        if (!basePath) continue;

        const attributes = /\b(href|src|srcset|action|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
        for (const match of html.matchAll(attributes)) {
          const value = (match[2] ?? match[3] ?? match[4]).trim();
          const urls = match[1].toLowerCase() === 'srcset'
            ? value.split(',').map(candidate => candidate.trim().split(/\s+/)[0])
            : [value];
          for (const url of urls) {
            if (url.startsWith('/') && !url.startsWith('//')
              && url !== basePath && !url.startsWith(`${basePath}/`)) {
              throw new Error(`${relative}: local URL ${url} must equal ${basePath} or start with ${basePath}/`);
            }
          }
        }
      }
    }
  }

  await inspect(outDir);
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
