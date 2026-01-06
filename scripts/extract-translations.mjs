import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const exts = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const results = {};
let counter = 0;

function slugify(s){
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,80) || `key-${++counter}`;
}

async function walk(dir){
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries){
    const res = path.join(dir, e.name);
    if (e.isDirectory()){
      if (e.name === 'node_modules' || e.name === '.next' || e.name === 'public') continue;
      await walk(res);
    } else {
      if (!exts.includes(path.extname(e.name))) continue;
      const text = await fs.readFile(res, 'utf8');
      const regex = /t\(\s*(['"])([\s\S]*?)\1\s*,\s*(['"])([\s\S]*?)\3\s*\)/g;
      let m;
      while ((m = regex.exec(text)) !== null){
        const it = m[2].trim();
        const en = m[4].trim();
        const keyBase = slugify(it);
        let key = keyBase;
        let i = 1;
        while (results[key] && (results[key].it !== it || results[key].en !== en)){
          key = `${keyBase}-${i++}`;
        }
        results[key] = { it, en, file: path.relative(root, res) };
      }
    }
  }
}

(async ()=>{
  await walk(root);
  const out = { translations: results };
  await fs.mkdir(path.join(root, 'locales'), { recursive: true });
  await fs.writeFile(path.join(root, 'scripts', 'translations.json'), JSON.stringify(out, null, 2));
  console.log('Found', Object.keys(results).length, 'entries. Wrote scripts/translations.json');
})();
