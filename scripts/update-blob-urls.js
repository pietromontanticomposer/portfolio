/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'blob-urls.json'), 'utf8'));

// Create lookup map
const urlMap = {};
mapping.forEach(item => {
  const localPath = item.local.replace('public/', '/');
  urlMap[localPath] = item.url;
});

console.log('\n📋 URL MAPPING:\n');
console.log(JSON.stringify(urlMap, null, 2));

// Save for reference
fs.writeFileSync(
  path.join(__dirname, 'url-map.json'),
  JSON.stringify(urlMap, null, 2)
);

console.log('\n✅ Saved to: scripts/url-map.json');
