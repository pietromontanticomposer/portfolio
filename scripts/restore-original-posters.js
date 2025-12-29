const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

async function restoreOriginalPosters() {
  const postersDir = path.join(__dirname, '../public/posters');
  const outputDir = path.join(__dirname, '../public/optimized/posters');

  try {
    const files = await fs.readdir(postersDir);

    // Filter for image files
    const imageFiles = files.filter(f =>
      /\.(jpg|jpeg|png)$/i.test(f) && !f.startsWith('.')
    );

    console.log(`Restoring ${imageFiles.length} posters to original appearance\n`);

    for (const file of imageFiles) {
      const inputPath = path.join(postersDir, file);
      const baseName = file.replace(/\.(jpg|jpeg|png)$/i, '');

      console.log(`Processing: ${file}`);

      // NO TRIMMING - just convert with high quality
      const image = sharp(inputPath);

      // Export to webp - highest quality, preserve everything
      await image
        .clone()
        .webp({
          quality: 95,
          effort: 4,
          lossless: false
        })
        .toFile(path.join(outputDir, `${baseName}.webp`));

      // Export to avif - high quality
      await image
        .clone()
        .avif({
          quality: 85,
          effort: 4
        })
        .toFile(path.join(outputDir, `${baseName}.avif`));

      console.log(`  ✓ Restored original appearance\n`);
    }

    console.log('Done! All posters restored with original colors and brightness.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

restoreOriginalPosters();
