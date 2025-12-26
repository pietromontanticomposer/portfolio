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
} else {
  console.log('asset_inbox vuota: salto upload blob.');
}

const status = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
const dirty = (status.stdout || '').trim().length > 0;

if (!dirty) {
  console.log('Nessuna modifica da committare.');
  process.exit(0);
}

run('git', ['add', '-A']);
run('git', ['commit', '-m', msg]);
run('git', ['push']);
