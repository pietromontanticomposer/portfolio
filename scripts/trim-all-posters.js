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

      // Trim excess transparency/empty space
      const trimmed = image.trim({
        threshold: 2  // Low threshold - only removes nearly empty areas
      });

      const trimmedInfo = await trimmed.toBuffer({ resolveWithObject: true });
      console.log(`  Trimmed: ${trimmedInfo.info.width}x${trimmedInfo.info.height}`);

      // Export to webp
      await sharp(trimmedInfo.data)
        .webp({ quality: 90, effort: 6 })
        .toFile(path.join(outputDir, `${baseName}.webp`));

      // Export to avif
      await sharp(trimmedInfo.data)
        .avif({ quality: 75, effort: 6 })
        .toFile(path.join(outputDir, `${baseName}.avif`));

      console.log(`  ✓ Created webp and avif\n`);
    }

    console.log('Done! All posters trimmed and optimized.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

trimAllPosters();
