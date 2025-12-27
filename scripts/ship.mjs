import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();
const inbox = path.join(root, 'asset_inbox');

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

function hasInboxFiles(dir) {
  if (!fs.existsSync(dir)) return false;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(current, e.name);
      if (e.isDirectory()) stack.push(p);
      else return true;
    }
  }
  return false;
}

const msg = process.argv.slice(2).join(' ').trim() || 'chore: update';

if (hasInboxFiles(inbox)) {
  run('npm', ['run', 'blob:sync']);
  run('npm', ['run', 'blob:replace']);
} else {
  console.log('asset_inbox vuota: salto upload blob.');
}

if (hasInboxFiles(inbox)) {
  const done = path.join(root, '_blob_done');
  fs.mkdirSync(done, { recursive: true });
  const stack = [inbox];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const abs = path.join(current, e.name);
      const rel = path.relative(inbox, abs);
      const target = path.join(done, rel);
      if (e.isDirectory()) {
        stack.push(abs);
      } else {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.renameSync(abs, target);
      }
    }
  }
  // Clean up empty dirs in asset_inbox.
  const prune = [inbox];
  while (prune.length) {
    const dir = prune.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) prune.push(path.join(dir, e.name));
    }
    if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
  }
}

const status = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
const dirty = (status.stdout || '').trim().length > 0;

if (!dirty) {
  console.log('Nessuna modifica da committare.');
  process.exit(0);
}

// Aggiungi soltanto i file di configurazione / metadata, non l'intero albero.
const safeFiles = [
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'next-env.d.ts',
  'scripts/ship.mjs'
];

// Verifica quali di questi esistono prima di aggiungerli
const toAdd = safeFiles.filter((f) => fs.existsSync(path.join(root, f)));
if (toAdd.length === 0) {
  console.log('Nessun file "sicuro" da aggiungere. Annullamento commit.');
  process.exit(0);
}

run('git', ['add', ...toAdd]);
run('git', ['commit', '-m', msg]);
run('git', ['push']);
