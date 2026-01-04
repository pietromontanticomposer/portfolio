import fs from 'fs';
const root = process.cwd();
const manifestPath = root + '/scripts/blob-urls.json';
const partnersPath = root + '/scripts/blob-partners.json';
if (!fs.existsSync(partnersPath)) {
  console.log('no partners file'); process.exit(0);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const partners = JSON.parse(fs.readFileSync(partnersPath,'utf8'));
let changed = 0;
for (const p of partners) {
  if (!p.blob || !p.url) continue;
  if (!manifest[p.blob]) {
    manifest[p.blob] = p.url;
    changed++;
  }
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest,null,2)+'\n','utf8');
console.log('merged',changed,'partners into manifest');
