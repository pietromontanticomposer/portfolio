import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { list, put } from '@vercel/blob';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env.local' });

const args = process.argv.slice(2);
const INBOX = args[0] || 'asset_inbox';
const PREFIX = args[1] || 'portfolio';
const OVERWRITE = args.includes('--overwrite');

const mi = args.indexOf('--manifest');
const MANIFEST_PATH = (mi !== -1 && args[mi + 1]) ? args[mi + 1] : 'scripts/blob-urls.json';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('ERRORE: manca BLOB_READ_WRITE_TOKEN. Usa DOTENV_CONFIG_PATH=.env.local');
  process.exit(1);
}

const EXTENSIONS = new Set(['.mp3','.wav','.aiff','.flac','.mp4','.webm','.png','.jpg','.jpeg']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXTENSIONS.has(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

function loadManifest(p) {
  try {
    if (!fs.existsSync(p)) return {};
    const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '').trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    return {};
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
if (!files.length) { console.log('Niente da caricare.'); process.exit(0); }

const remote = await listAll(PREFIX);
const manifest = loadManifest(MANIFEST_PATH);

let uploaded = 0;
let skipped = 0;

for (const abs of files) {
  const rel = path.relative(INBOX, abs).split(path.sep).join('/');
  const pathname = `${PREFIX}/${rel}`;

  if (remote.has(pathname) && !OVERWRITE) { skipped++; continue; }

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
