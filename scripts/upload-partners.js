const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function uploadPartners() {
  const dir = path.join(__dirname, '..', 'public', 'partners');
  if (!fs.existsSync(dir)) {
    console.error('Partners directory not found:', dir);
    process.exit(1);
  }

  const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
  const results = [];

  for (const f of files) {
    const localPath = path.join(dir, f);
    try {
      const buffer = fs.readFileSync(localPath);
      const blobPath = `partners/${f}`;
      const blob = await put(blobPath, buffer, {
        access: 'public',
        addRandomSuffix: false,
      });

      console.log(`✅ ${f} -> ${blob.url}`);
      results.push({ local: `public/partners/${f}`, blob: blobPath, url: blob.url });
    } catch (err) {
      console.error(`❌ FAILED ${f}:`, err.message || err);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'blob-partners.json'), JSON.stringify(results, null, 2));
  console.log('\nSaved mapping to: scripts/blob-partners.json');
}

uploadPartners().catch(err => {
  console.error(err);
  process.exit(1);
});
