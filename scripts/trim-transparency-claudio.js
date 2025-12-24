const sharp = require('sharp');
const path = require('path');

async function trimTransparency() {
  const inputPath = path.join(__dirname, '../public/posters/poster claudio re.jpg');
  const outputDir = path.join(__dirname, '../public/optimized/posters');

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

    // Trim only fully transparent/empty areas, not white borders
    // For JPG files without alpha, this will trim very light/near-white edges
    const trimmed = image.trim({
      threshold: 2  // Very low threshold - only removes nearly transparent/empty areas
    });

    const trimmedInfo = await trimmed.toBuffer({ resolveWithObject: true });
    console.log(`After trimming transparency: ${trimmedInfo.info.width}x${trimmedInfo.info.height}`);

    // Export to webp
    await sharp(trimmedInfo.data)
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(outputDir, 'poster claudio re.webp'));

    console.log('✓ Created webp');

    // Export to avif
    await sharp(trimmedInfo.data)
      .avif({ quality: 75, effort: 6 })
      .toFile(path.join(outputDir, 'poster claudio re.avif'));

    console.log('✓ Created avif');
    console.log('Done! Trimmed only excess transparency, kept white borders.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

trimTransparency();
