/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

async function convertNoTrim(filename) {
  const postersDir = path.join(__dirname, '../public/posters');
  const outputDir = path.join(__dirname, '../public/optimized/posters');
  const inputPath = path.join(postersDir, filename);
  const baseName = filename.replace(/\.[^.]+$/, '');

  try {
    const buffer = await fs.readFile(inputPath);

    // Direct conversion without trimming
    await sharp(buffer)
      .withMetadata()
      .webp({ quality: 92, effort: 6, smartSubsample: false })
      .toFile(path.join(outputDir, `${baseName}.webp`));

    await sharp(buffer)
      .withMetadata()
      .avif({ quality: 78, effort: 6, chromaSubsampling: '4:4:4' })
      .toFile(path.join(outputDir, `${baseName}.avif`));

    console.log(`Converted ${filename} -> ${baseName}.webp/.avif (no trim)`);
  } catch (err) {
    console.error('Error converting:', err);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node convert-no-trim.js <filename>');
  process.exit(1);
}
convertNoTrim(args[0]);
