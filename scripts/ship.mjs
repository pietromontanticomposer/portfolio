import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import dotenv from 'dotenv';

const DEFAULT_REMOTE = 'https://github.com/pietromontanticomposer/portfolio.git';

const root = process.cwd();
const inbox = path.join(root, 'asset_inbox');

// Carica variabili d'ambiente locali se esiste .env.local (fonte di verità locale)
const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Caricate variabili da .env.local');
} else {
  console.log('.env.local non trovato: procedo comunque (assumo variabili d\'ambiente già impostate).');
}

// Arg parsing: support `--dry-run` and message after flags
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run') || process.env.DRY_RUN === '1';
const filtered = argv.filter((a) => a !== '--dry-run');
const msg = filtered.join(' ').trim() || 'chore: update';

function run(cmd, args, opts = {}) {
  if (dryRun) {
    console.log('[dry-run]', cmd, ...args);
    return { status: 0 };
  }
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

const doneDir = path.join(root, '_blob_done');
const hasInbox = hasInboxFiles(inbox);

if (hasInbox) {
  // Evitiamo di tentare qualsiasi operazione di provisioning del Blob store.
  // Eseguiamo operazioni Blob solo se è presente il token di scrittura nei env locali.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    run('npm', ['run', 'blob:sync']);
    run('npm', ['run', 'blob:replace']);
    run('node', ['scripts/verify-blob-urls.mjs']);
  } else {
    console.error('BLOB_READ_WRITE_TOKEN non trovato in ambiente (.env.local). Salto operazioni Blob per evitare ricreare o riconfigurare lo store.');
  }
} else {
  console.log('asset_inbox vuota: salto upload blob.');
}

if (hasInbox) {
  if (dryRun) {
    console.log('[dry-run] would move files from', inbox, 'to', doneDir);
    const sample = [];
    const stack = [inbox];
    while (stack.length) {
      const current = stack.pop();
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const e of entries) {
        const abs = path.join(current, e.name);
        const rel = path.relative(inbox, abs);
        const target = path.join(doneDir, rel);
        if (e.isDirectory()) stack.push(abs);
        else sample.push({ from: abs, to: target });
      }
    }
    for (const s of sample.slice(0, 20)) console.log('[dry-run] move', s.from, '->', s.to);
    if (sample.length > 20) console.log('[dry-run] ...', sample.length - 20, 'more files');
  } else {
    fs.mkdirSync(doneDir, { recursive: true });
    const stack = [inbox];
    while (stack.length) {
      const current = stack.pop();
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const e of entries) {
        const abs = path.join(current, e.name);
        const rel = path.relative(inbox, abs);
        const target = path.join(doneDir, rel);
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
}

const ensureRemote = spawnSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' });
if (ensureRemote.status !== 0) {
  if (dryRun) {
    console.log('[dry-run] git remote add origin', DEFAULT_REMOTE);
  } else {
    run('git', ['remote', 'add', 'origin', DEFAULT_REMOTE]);
  }
}

// Aggiungi solo codice e configurazione del progetto.
const safeRoots = [
  'app',
  'components',
  'lib',
  'data',
  'public',
  'scripts',
  '.github',
  '.gitignore',
  '.lighthouseci',
  'check-token.cjs',
  'content',
  'privacy.config.json',
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'next-env.d.ts',
  'tsconfig.json',
  'postcss.config.mjs',
  'eslint.config.mjs',
  '.lighthouserc.json',
  '.vercelignore',
  'README.md'
];
const toAdd = safeRoots.filter((p) => fs.existsSync(path.join(root, p)));
if (toAdd.length === 0) {
  console.log('Nessun file "sicuro" da aggiungere. Annullamento commit.');
  process.exit(0);
}

run('git', ['add', '-A', '--', ...toAdd]);

if (dryRun) {
  console.log('[dry-run] git commit -m', JSON.stringify(msg), '--allow-empty');
  console.log('[dry-run] git push --force-with-lease');
} else {
  // Sempre crea commit (anche se vuoto) per triggerare deploy
  run('git', ['commit', '-m', msg, '--allow-empty']);

  // Push sempre, anche se identico
  console.log('Push to GitHub...');
  run('git', ['push', '--force-with-lease']);

  console.log('✅ Push completed! Deploy will be triggered automatically by Vercel.');
}
