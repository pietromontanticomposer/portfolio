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

    // Auto-trim white borders
    const trimmed = image.trim({
      background: { r: 255, g: 255, b: 255 },
      threshold: 10 // Tolerance for "white" detection
    });

    const trimmedInfo = await trimmed.toBuffer({ resolveWithObject: true });
    console.log(`Trimmed dimensions: ${trimmedInfo.info.width}x${trimmedInfo.info.height}`);

    // Export to webp
    await sharp(trimmedInfo.data)
      .webp({ quality: 85, effort: 6 })
      .toFile(path.join(outputDir, 'poster claudio re.webp'));

    console.log('✓ Created webp');

    // Export to avif
    await sharp(trimmedInfo.data)
      .avif({ quality: 70, effort: 6 })
      .toFile(path.join(outputDir, 'poster claudio re.avif'));

    console.log('✓ Created avif');
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixClaudioPoster();
