import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const INBOX = path.join(ROOT, 'asset_inbox');
const DONE = path.join(ROOT, '_blob_done');

const EXTENSIONS = new Set([
  '.mp3', '.wav', '.aiff', '.flac',
  '.mp4', '.webm',
  '.png', '.jpg', '.jpeg', '.webp', '.avif'
  ,'.m3u8', '.ts'
]);

function isAllowed(file) {
  return EXTENSIONS.has(path.extname(file).toLowerCase());
}

const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.vercel',
  '_blob_done',
  '_blob_inbox',
  '_blob_inbox_done',
  'asset_inbox',
  'uploads-backup'
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && IGNORE_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (isAllowed(p)) out.push(p);
  }
  return out;
}

function hashFile(p) {
  const h = crypto.createHash('sha256');
  h.update(fs.readFileSync(p));
  return h.digest('hex');
}

function normalizeRel(rel) {
  return rel.split(path.sep).join('/');
}

function collectHashes(dir, map) {
  if (!fs.existsSync(dir)) return;
  const files = walk(dir);
  for (const f of files) {
    try {
      const hash = hashFile(f);
      if (!map.has(hash)) map.set(hash, f);
    } catch {
      // Ignore unreadable files.
    }
  }
}

const args = process.argv.slice(2);
const moveIdx = args.indexOf('--move');
const prefixIdx = args.indexOf('--prefix');
const MOVE = moveIdx !== -1;
if (MOVE) args.splice(moveIdx, 1);

let prefix = '';
if (prefixIdx !== -1) {
  prefix = args[prefixIdx + 1] || '';
  args.splice(prefixIdx, 2);
}
prefix = prefix.replace(/^\/+|\/+$/g, '');

let sources = args.filter((a) => a && !a.startsWith('--'));
if (sources.length === 0) {
  const defaults = ['public', 'uploads', 'assets'];
  for (const d of defaults) {
    if (fs.existsSync(path.join(ROOT, d))) sources.push(d);
  }
  if (sources.length === 0) {
    console.log('Nessuna cartella media trovata.');
    process.exit(0);
  }
}

fs.mkdirSync(INBOX, { recursive: true });

const existingHashes = new Map();
collectHashes(INBOX, existingHashes);
collectHashes(DONE, existingHashes);

let copied = 0;
let skipped = 0;
let conflicts = 0;
const seenNew = new Set();

for (const src of sources) {
  const abs = path.resolve(src);
  if (!fs.existsSync(abs)) {
    console.log(`Skip: ${src} non esiste.`);
    skipped++;
    continue;
  }

  const stat = fs.statSync(abs);
  const files = stat.isDirectory() ? walk(abs) : [abs];

  for (const f of files) {
    if (!isAllowed(f)) {
      skipped++;
      continue;
    }
    if (f.startsWith(INBOX + path.sep)) {
      skipped++;
      continue;
    }

    const fileHash = hashFile(f);
    if (existingHashes.has(fileHash) || seenNew.has(fileHash)) {
      skipped++;
      continue;
    }

    const rel = stat.isDirectory()
      ? normalizeRel(path.relative(abs, f))
      : path.basename(f);
    const relPath = prefix ? `${prefix}/${rel}` : rel;
    const dest = path.join(INBOX, relPath);

    if (fs.existsSync(dest)) {
      const destHash = hashFile(dest);
      if (destHash === fileHash) {
        skipped++;
      } else {
        conflicts++;
        console.log(`Conflitto: ${relPath} esiste con contenuto diverso. Skip.`);
      }
      continue;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (MOVE) fs.renameSync(f, dest);
    else fs.copyFileSync(f, dest);

    existingHashes.set(fileHash, dest);
    seenNew.add(fileHash);
    copied++;
  }
}

console.log(`Inbox: copiati ${copied}, saltati ${skipped}, conflitti ${conflicts}.`);
