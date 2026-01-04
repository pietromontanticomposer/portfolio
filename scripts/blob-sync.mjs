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
const HEAD_TIMEOUT_MS = Number(process.env.BLOB_HEAD_TIMEOUT_MS || 60000);
const PUT_TIMEOUT_MS = Number(process.env.BLOB_PUT_TIMEOUT_MS || 1200000);

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEAD_TIMEOUT_MS);
    const res = await head(pathname, { abortSignal: controller.signal });
    clearTimeout(timeoutId);
    const metadata = {
      url: res?.url || '',
      size: typeof res?.size === 'number' ? res.size : 0
    };
    remoteCache.set(pathname, metadata);
    return metadata;
  } catch (err) {
    if (err instanceof BlobNotFoundError || err?.name === 'BlobNotFoundError') {
      const missing = { url: '', size: 0 };
      remoteCache.set(pathname, missing);
      return missing;
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

const CONCURRENCY = Number(process.env.BLOB_CONCURRENCY || 3);

const toUpload = [];

for (const abs of files) {
  const rel = path.relative(sourceDir, abs).split(path.sep).join('/');
  const pathname = PREFIX ? `${PREFIX}/${rel}` : rel;
  console.log(`Check ${pathname}`);

  const stats = fs.statSync(abs);
  const localSize = stats.size;
  let forceOverwrite = false;

  if (!OVERWRITE) {
    const remote = await getRemote(pathname);
    if (remote.url) {
      manifest[pathname] = remote.url;
      saveManifest(MANIFEST_PATH, manifest);
      if (remote.size >= localSize) {
        skipped++;
        continue;
      }
      console.log(`Blob ${pathname} esistente (${Math.round(remote.size)}B) è più piccolo di ${Math.round(localSize)}B, lo sovrascrivo.`);
      forceOverwrite = true;
    } else if (manifest[pathname]) {
      delete manifest[pathname];
      saveManifest(MANIFEST_PATH, manifest);
    }
  }

  toUpload.push({ abs, pathname, size: localSize, forceOverwrite });
}

async function uploadFile({ abs, pathname, size, forceOverwrite }) {
  try {
    const useMultipart = size > 20 * 1024 * 1024;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PUT_TIMEOUT_MS);

    const stream = fs.createReadStream(abs);
    let sent = 0;
    const start = Date.now();
    const barWidth = 30;
    let lastRender = 0;

    function renderProgress(final) {
      const now = Date.now();
      const elapsed = Math.max(0.001, (now - start) / 1000);
      const pct = Math.min(100, Math.round((sent / size) * 100));
      const filled = Math.round((pct / 100) * barWidth);
      const bar = '[' + '#'.repeat(filled) + '-'.repeat(barWidth - filled) + ']';
      const sentMb = (sent / 1024 / 1024).toFixed(2);
      const totalMb = (size / 1024 / 1024).toFixed(2);
      const speed = (sent / 1024 / 1024) / elapsed; // MB/s
      const eta = speed > 0 ? Math.round(((size - sent) / 1024 / 1024) / speed) : 0;
      const speedStr = speed.toFixed(2);
      if (final) {
        process.stdout.write(`\r${pathname} ${bar} 100% ${totalMb}MB/${totalMb}MB ${speedStr}MB/s ETA 0s\n`);
      } else {
        process.stdout.write(`\r${pathname} ${bar} ${pct}% ${sentMb}MB/${totalMb}MB ${speedStr}MB/s ETA ${eta}s`);
      }
    }

    stream.on('data', (chunk) => {
      sent += chunk.length;
      const now = Date.now();
      if (now - lastRender >= 200) { // throttle to 5fps
        lastRender = now;
        renderProgress(false);
      }
    });

    stream.on('end', () => renderProgress(true));

    console.log(`Upload ${pathname} (${Math.round(size / 1024 / 1024)}MB) ${useMultipart ? 'multipart' : 'single'}`);
    const res = await put(pathname, stream, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: OVERWRITE || forceOverwrite,
      multipart: useMultipart,
      abortSignal: controller.signal
    });

    clearTimeout(timeoutId);

    manifest[pathname] = res.url;
    saveManifest(MANIFEST_PATH, manifest);
    console.log(`OK ${pathname} -> ${res.url}`);
    return true;
  } catch (err) {
    console.warn(`Fallback to vercel CLI for ${pathname}: ${err?.message || err}`);
    const args = ['blob', 'put', abs, '--pathname', pathname, '--no-color'];
    if (OVERWRITE || forceOverwrite) args.push('--force');
    const res = spawnSync('vercel', args, { stdio: 'inherit' });
    if (res.status !== 0) throw err;
    console.log(`OK ${pathname} -> uploaded via vercel CLI`);
    if (!manifest[pathname]) {
      const existingUrl = await getRemote(pathname);
      if (existingUrl) {
        manifest[pathname] = existingUrl;
        saveManifest(MANIFEST_PATH, manifest);
      }
    }
    return true;
  }
}

for (let i = 0; i < toUpload.length; i += CONCURRENCY) {
  const batch = toUpload.slice(i, i + CONCURRENCY);
  await Promise.all(batch.map(uploadFile));
  uploaded += batch.length;
}

saveManifest(MANIFEST_PATH, manifest);
console.log(`FATTO. Caricati: ${uploaded}, Saltati: ${skipped}`);
