import fs from 'fs';
import path from 'path';
import { list, put } from '@vercel/blob';

const INBOX = process.argv[2] || '_blob_inbox';
const PREFIX = process.argv[3] || 'portfolio';
const OVERWRITE = process.argv.includes('--overwrite');

const EXTENSIONS = new Set([
  '.mp3', '.wav', '.aiff', '.flac',
  '.mp4', '.webm',
  '.png', '.jpg', '.jpeg'
]);

const MANIFEST_PATH = 'scripts/blob-urls.json';
const manifest = fs.existsSync(MANIFEST_PATH)
  ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
  : {};

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXTENSIONS.has(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

async function listAll(prefix) {
  const set = new Set();
  let cursor;
  while (true) {
    const page = await list({ prefix, cursor });
    for (const b of page.blobs) set.add(b.pathname);
    if (!page.cursor) break;
    cursor = page.cursor;
  }
  return set;
}

const files = fs.existsSync(INBOX) ? walk(INBOX) : [];
if (!files.length) {
  console.log('Niente da caricare.');
  process.exit(0);
}

const remote = await listAll(PREFIX);

let uploaded = 0;
let skipped = 0;

for (const abs of files) {
  const rel = path.relative(INBOX, abs).replace(/\\\\/g, '/');
  const pathname = `${PREFIX}/${rel}`;

  if (remote.has(pathname) && !OVERWRITE) {
    skipped++;
    continue;
  }

  const buffer = fs.readFileSync(abs);
  const res = await put(pathname, buffer, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: OVERWRITE,
  });

  manifest[pathname] = res.url;
  uploaded++;
  console.log(`OK ${pathname} -> ${res.url}`);
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\\n', 'utf8');
console.log(`FATTO. Caricati: ${uploaded}, Saltati: ${skipped}`);

