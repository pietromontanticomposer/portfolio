import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { list, put } from '@vercel/blob';

function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const INBOX = process.argv[2] || 'asset_inbox';
const PREFIX = process.argv[3] || 'portfolio';
const MANIFEST_PATH = argValue('--manifest', 'scripts/blob-urls.json');
const OVERWRITE = process.argv.includes('--overwrite');

const EXTENSIONS = new Set([
  '.mp3', '.wav', '.aiff', '.flac',
  '.mp4', '.webm',
  '.png', '.jpg', '.jpeg'
]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXTENSIONS.has(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

function loadManifest(p) {
  if (!fs.existsSync(p)) return {};
  try {
    const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '').trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  } catch {
    return {};
  }
}

function saveManifest(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
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

const manifest = loadManifest(MANIFEST_PATH);
const remote = await listAll(PREFIX);

let uploaded = 0;
let skipped = 0;

for (const abs of files) {
  const rel = path.relative(INBOX, abs).split(path.sep).join('/');
  const pathname = `${PREFIX}/${rel}`;

  if (remote.has(pathname) && !OVERWRITE) {
    skipped++;
    continue;
  }

  const res = await put(pathname, fs.createReadStream(abs), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: OVERWRITE
  });

  manifest[pathname] = res.url;
  console.log(`OK ${pathname} -> ${res.url}`);
  uploaded++;
}

saveManifest(MANIFEST_PATH, manifest);
console.log(`FATTO. Caricati: ${uploaded}, Saltati: ${skipped}`);
