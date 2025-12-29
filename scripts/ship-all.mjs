import { spawnSync } from 'child_process';

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

const argv = process.argv.slice(2);
let msg = '';
const msgIdx = argv.indexOf('--msg');
if (msgIdx !== -1) {
  msg = argv[msgIdx + 1] || '';
  argv.splice(msgIdx, 2);
}

run('node', ['scripts/inbox-add.mjs', ...argv]);
const shipArgs = msg ? ['scripts/ship.mjs', msg] : ['scripts/ship.mjs'];
run('node', shipArgs);
