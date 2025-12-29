import fs from 'fs';
import path from 'path';

const root = process.cwd();
const mapPath = path.join(root, 'scripts', 'blob-urls.json');

if (!fs.existsSync(mapPath)) {
  console.log('blob-urls.json not found: skip replace.');
  process.exit(0);
}

let mappings = {};
try {
  mappings = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
} catch {
  console.log('blob-urls.json invalid: skip replace.');
  process.exit(0);
}

const entries = Object.entries(mappings);
if (!entries.length) {
  console.log('blob-urls.json empty: skip replace.');
  process.exit(0);
}

const targets = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs);
    else if (abs.endsWith('.ts') || abs.endsWith('.tsx')) targets.push(abs);
  }
}

const roots = ['src', 'app', 'components', 'lib', 'data'];
for (const r of roots) {
  walk(path.join(root, r));
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let changed = 0;
for (const file of targets) {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content;
  for (const [pathname, url] of entries) {
    const withSlash = `/${pathname}`;
    const variants = [withSlash];
    if (withSlash.includes("'")) variants.push(withSlash.replace(/'/g, "\\'"));
    for (const v of variants) {
      if (!updated.includes(v)) continue;
      const pattern = new RegExp(`(['"\`])${escapeRegExp(v)}`, 'g');
      updated = updated.replace(pattern, `$1${url}`);
    }
  }
  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
  }
}

console.log(`replace-blob-urls: updated ${changed} file(s).`);
