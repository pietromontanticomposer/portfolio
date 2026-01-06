import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const tpath = path.join(root, 'scripts', 'translations.json');
const outdir = path.join(root, 'locales');

(async () => {
  const txt = await fs.readFile(tpath, 'utf8');
  const data = JSON.parse(txt);
  const translations = data.translations || {};
  const it = {};
  const en = {};
  for (const key of Object.keys(translations)) {
    it[key] = translations[key].it;
    en[key] = translations[key].en;
  }
  await fs.mkdir(outdir, { recursive: true });
  await fs.writeFile(path.join(outdir, 'it.json'), JSON.stringify(it, null, 2));
  await fs.writeFile(path.join(outdir, 'en.json'), JSON.stringify(en, null, 2));
  console.log('Wrote', Object.keys(translations).length, 'entries to locales/it.json and locales/en.json');
})();
