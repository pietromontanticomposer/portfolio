const sharp = require('sharp');
const path = require('path');

async function fixClaudioPoster() {
  const inputPath = path.join(__dirname, '../public/posters/poster claudio re.jpg');
  const outputDir = path.join(__dirname, '../public/optimized/posters');

  try {
    // Load image and get metadata
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

    // Try more aggressive trim with higher threshold
    const trimmed = image.trim({
      background: { r: 255, g: 255, b: 255 },
      threshold: 25 // More aggressive to catch all white borders
    });

    const trimmedInfo = await trimmed.toBuffer({ resolveWithObject: true });
    console.log(`Trimmed dimensions: ${trimmedInfo.info.width}x${trimmedInfo.info.height}`);

    // Export to webp with higher quality
    await sharp(trimmedInfo.data)
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(outputDir, 'poster claudio re.webp'));

    console.log('✓ Created webp');

    // Export to avif with higher quality
    await sharp(trimmedInfo.data)
      .avif({ quality: 75, effort: 6 })
      .toFile(path.join(outputDir, 'poster claudio re.avif'));

    console.log('✓ Created avif');
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixClaudioPoster();
