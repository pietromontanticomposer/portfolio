const sharp = require('sharp');
const path = require('path');

async function restoreClaudioPoster() {
  const inputPath = path.join(__dirname, '../public/posters/poster claudio re.jpg');
  const outputDir = path.join(__dirname, '../public/optimized/posters');

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

    // NO TRIM - keep the white borders as part of the poster design
    // Export to webp
    await sharp(inputPath)
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(outputDir, 'poster claudio re.webp'));

    console.log('✓ Created webp (with original borders)');

    // Export to avif
    await sharp(inputPath)
      .avif({ quality: 75, effort: 6 })
      .toFile(path.join(outputDir, 'poster claudio re.avif'));

    console.log('✓ Created avif (with original borders)');
    console.log('Restored! White borders are part of the poster design.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

restoreClaudioPoster();
