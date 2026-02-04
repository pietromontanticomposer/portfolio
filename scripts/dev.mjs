import { spawn } from 'child_process';

const run = (cmd, args) =>
  spawn(cmd, args, {
    stdio: 'inherit'
  });

const nextProc = run('node', ['node_modules/next/dist/bin/next', 'dev', '-p', '3000']);
const autoShipProc = run('node', ['scripts/auto-ship.mjs']);

const shutdown = (signal) => {
  if (!nextProc.killed) nextProc.kill(signal);
  if (!autoShipProc.killed) autoShipProc.kill(signal);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

nextProc.on('exit', (code) => {
  if (!autoShipProc.killed) autoShipProc.kill('SIGTERM');
  process.exit(code ?? 0);
});

autoShipProc.on('exit', (code) => {
  if (code && code !== 0) {
    console.error('[dev] auto-ship stopped with error. Shutting down dev server.');
    if (!nextProc.killed) nextProc.kill('SIGTERM');
    process.exit(code);
  }
});
