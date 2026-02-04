import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { safeRoots } from './ship-roots.mjs';

const root = process.cwd();
const debounceMs = Number.parseInt(process.env.AUTO_SHIP_DEBOUNCE ?? '1500', 10);
const ignoreDirNames = new Set([
  '.git',
  'node_modules',
  '.next',
  '.vercel',
  '.turbo',
  'asset_inbox',
  '_blob_done',
  'out'
]);
const ignoreFilePatterns = [/^\.DS_Store$/, /~$/, /\.swp$/, /\.tmp$/];

const normalize = (input) => input.split(path.sep).join('/');
const normalizedRoots = safeRoots.map((entry) => normalize(entry));

const isInSafeRoots = (relPath) => {
  const rel = normalize(relPath);
  return normalizedRoots.some((rootEntry) => rel === rootEntry || rel.startsWith(`${rootEntry}/`));
};

const shouldIgnore = (relPath) => {
  const rel = normalize(relPath);
  const parts = rel.split('/');
  if (parts.some((part) => ignoreDirNames.has(part))) return true;
  const filename = parts[parts.length - 1] || '';
  return ignoreFilePatterns.some((pattern) => pattern.test(filename));
};

const hasChanges = () => {
  const res = spawnSync('git', ['status', '--porcelain', '--', ...safeRoots], {
    encoding: 'utf8'
  });
  if (res.status !== 0) return true;
  return res.stdout.trim().length > 0;
};

let timer = null;
let running = false;
let pending = false;
let lastEvent = null;

const schedule = (relPath) => {
  lastEvent = relPath;
  if (running) {
    pending = true;
    return;
  }
  if (timer) clearTimeout(timer);
  timer = setTimeout(runShip, debounceMs);
};

const runShip = () => {
  timer = null;
  if (!hasChanges()) {
    return;
  }
  running = true;
  const stamp = new Date().toISOString().replace('T', ' ').replace(/\..*$/, '');
  const msg = process.env.AUTO_SHIP_MESSAGE ?? `chore: auto-ship ${stamp}`;
  console.log(`[auto-ship] change detected (${lastEvent}). Running ship...`);
  const res = spawnSync('npm', ['run', 'ship', '--', msg], { stdio: 'inherit' });
  running = false;
  if (pending) {
    pending = false;
    schedule('pending');
  }
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
};

const handleEvent = (eventType, filename) => {
  if (!filename) return;
  const rel = filename.toString();
  if (shouldIgnore(rel)) return;
  if (!isInSafeRoots(rel)) return;
  schedule(rel);
};

const startWatcher = () => {
  try {
    fs.watch(root, { recursive: true }, handleEvent);
    console.log('[auto-ship] watching project for changes...');
  } catch (err) {
    console.warn('[auto-ship] recursive watch unavailable, using fallback.');
    for (const entry of safeRoots) {
      const target = path.join(root, entry);
      if (!fs.existsSync(target)) continue;
      const stat = fs.statSync(target);
      if (stat.isDirectory()) {
        fs.watch(target, { recursive: true }, handleEvent);
      } else {
        fs.watch(target, handleEvent);
      }
    }
  }
};

const shutdown = () => {
  console.log('\n[auto-ship] stopping.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startWatcher();
