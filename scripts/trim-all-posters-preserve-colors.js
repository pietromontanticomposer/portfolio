const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

async function trimAllPosters() {
  const postersDir = path.join(__dirname, '../public/posters');
  const outputDir = path.join(__dirname, '../public/optimized/posters');

  try {
    const files = await fs.readdir(postersDir);

    // Filter for image files (jpg, jpeg, png)
    const imageFiles = files.filter(f =>
      /\.(jpg|jpeg|png)$/i.test(f) && !f.startsWith('.')
    );

    console.log(`Found ${imageFiles.length} poster images to process\n`);

    for (const file of imageFiles) {
      const inputPath = path.join(postersDir, file);
      const baseName = file.replace(/\.(jpg|jpeg|png)$/i, '');

      console.log(`Processing: ${file}`);

      const image = sharp(inputPath);
      const metadata = await image.metadata();

      console.log(`  Original: ${metadata.width}x${metadata.height}`);

      // Trim with more aggressive threshold
      const trimmed = image.trim({
        threshold: 5  // More aggressive trimming
      });

      const trimmedBuffer = await trimmed.toBuffer({ resolveWithObject: true });
      console.log(`  Trimmed: ${trimmedBuffer.info.width}x${trimmedBuffer.info.height}`);

      // Export to webp - preserve color space, no darkening
      await sharp(trimmedBuffer.data)
        .withMetadata() // Preserve metadata including color profile
        .webp({
          quality: 92,
          effort: 6,
          smartSubsample: false  // Prevent color shifts
        })
        .toFile(path.join(outputDir, `${baseName}.webp`));

      // Export to avif - preserve color space
      await sharp(trimmedBuffer.data)
        .withMetadata()
        .avif({
          quality: 78,
          effort: 6,
          chromaSubsampling: '4:4:4'  // Best color fidelity
        })
        .toFile(path.join(outputDir, `${baseName}.avif`));

      console.log(`  ✓ Created webp and avif (colors preserved)\n`);
    }

    console.log('Done! All posters trimmed with original colors preserved.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

trimAllPosters();
