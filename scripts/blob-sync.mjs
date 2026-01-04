import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { head, put, BlobNotFoundError } from '@vercel/blob';

const root = process.cwd();

function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const INBOX = process.argv[2] || 'asset_inbox';
const RAW_PREFIX = argValue('--prefix', (process.argv[3] && !process.argv[3].startsWith('--')) ? process.argv[3] : '');
const PREFIX = RAW_PREFIX.replace(/^\/+|\/+$/g, '');
const MANIFEST_PATH = argValue('--manifest', 'scripts/blob-urls.json');
const OVERWRITE = process.argv.includes('--overwrite');

const EXTENSIONS = new Set([
  '.mp3', '.wav', '.aiff', '.flac',
  '.mp4', '.webm',
  '.png', '.jpg', '.jpeg', '.webp', '.avif',
  '.m3u8', '.ts'
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

const remoteCache = new Map();

async function getRemote(pathname) {
  if (remoteCache.has(pathname)) return remoteCache.get(pathname);
  try {
    const res = await head(pathname);
    const url = res?.url || '';
    remoteCache.set(pathname, url);
    return url;
  } catch (err) {
    if (err instanceof BlobNotFoundError || err?.name === 'BlobNotFoundError') {
      remoteCache.set(pathname, '');
      return '';
    }
    throw err;
  }
}

let sourceDir = INBOX;
let files = fs.existsSync(INBOX) ? walk(INBOX) : [];
if (!files.length) {
  const fallback = path.join(root, '_blob_done');
  if (fs.existsSync(fallback)) {
    const fallbackFiles = walk(fallback);
    if (fallbackFiles.length) {
      sourceDir = fallback;
      files = fallbackFiles;
      console.log('asset_inbox vuota: ricostruisco manifest da _blob_done.');
    }
  }
}
if (!files.length) {
  console.log('Niente da caricare.');
  process.exit(0);
}

const manifest = loadManifest(MANIFEST_PATH);

let uploaded = 0;
let skipped = 0;

for (const abs of files) {
  const rel = path.relative(sourceDir, abs).split(path.sep).join('/');
  const pathname = PREFIX ? `${PREFIX}/${rel}` : rel;

  if (!OVERWRITE && manifest[pathname]) {
    skipped++;
    continue;
  }

  if (!OVERWRITE) {
    const existingUrl = await getRemote(pathname);
    if (existingUrl) {
      manifest[pathname] = existingUrl;
      skipped++;
      continue;
    }
  }

  try {
    const res = await put(pathname, fs.readFileSync(abs), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: OVERWRITE
    });

    manifest[pathname] = res.url;
    console.log(`OK ${pathname} -> ${res.url}`);
    uploaded++;
  } catch (err) {
    const args = ['blob', 'put', abs, '--pathname', pathname, '--no-color'];
    if (OVERWRITE) args.push('--force');
    const res = spawnSync('vercel', args, { stdio: 'inherit' });
    if (res.status !== 0) throw err;
    console.log(`OK ${pathname} -> uploaded via vercel CLI`);
    uploaded++;
  }
}

saveManifest(MANIFEST_PATH, manifest);
console.log(`FATTO. Caricati: ${uploaded}, Saltati: ${skipped}`);
