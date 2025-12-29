import fs from 'fs';
import path from 'path';

const root = process.cwd();
const roots = ['src', 'app', 'components', 'lib', 'data'];
const exts = new Set(['.ts', '.tsx']);

const localMediaPattern = /['"`](\/(?:optimized|uploads|posters|partners|hls)\/[^'"`]+)['"`]/g;
const doubleUrlPattern = /https:\/\/[^'"`\s]+https:\/\//g;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(abs, out);
    } else if (exts.has(path.extname(e.name)) && !e.name.endsWith('.bak')) {
      out.push(abs);
    }
  }
  return out;
}

function findMatches(file, content, pattern) {
  const matches = [];
  let m;
  while ((m = pattern.exec(content)) !== null) {
    const before = content.slice(0, m.index);
    const line = before.split('\n').length;
    matches.push({ line, text: m[0] });
  }
  return matches;
}

const targets = [];
for (const r of roots) {
  walk(path.join(root, r), targets);
}

let issues = 0;
for (const file of targets) {
  const content = fs.readFileSync(file, 'utf8');
  const localMatches = findMatches(file, content, localMediaPattern);
  const doubleMatches = findMatches(file, content, doubleUrlPattern);
  if (localMatches.length || doubleMatches.length) {
    console.log(`\n${path.relative(root, file)}`);
    for (const m of localMatches) {
      console.log(`  local-media:${m.line}: ${m.text}`);
    }
    for (const m of doubleMatches) {
      console.log(`  double-url:${m.line}: ${m.text}`);
    }
    issues += localMatches.length + doubleMatches.length;
  }
}

if (issues > 0) {
  console.error(`\nverify-blob-urls: found ${issues} issue(s).`);
  process.exit(1);
}

console.log('verify-blob-urls: ok');
