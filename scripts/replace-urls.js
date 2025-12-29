const fs = require('fs');
const path = require('path');

const urlMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'url-map.json'), 'utf8'));

const filesToUpdate = [
  'data/projects.ts',
  'app/page.tsx',
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skip: ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let replacements = 0;

  Object.entries(urlMap).forEach(([oldPath, newUrl]) => {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = (content.match(regex) || []).length;
    if (matches > 0) {
      content = content.replace(regex, newUrl);
      replacements += matches;
    }
  });

  if (replacements > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}: ${replacements} URLs replaced`);
  } else {
    console.log(`➖ ${filePath}: no changes`);
  }
});

console.log('\n✅ Done!');
