const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
require('dotenv').config({ path: '.env.local' });

async function uploadHLSToBlob() {
  console.log('🚀 Uploading HLS files with AUDIO to Vercel Blob...\n');

  const hlsDir = path.join(__dirname, '..', 'public', 'uploads', 'video', '_hls');

  // Find all HLS files (m3u8 and ts segments)
  const hlsFiles = await glob('**/*.{m3u8,ts}', { cwd: hlsDir });

  console.log(`Found ${hlsFiles.length} HLS files to upload\n`);

  let uploaded = 0;
  let failed = 0;

  for (const file of hlsFiles) {
    const localPath = path.join(hlsDir, file);
    const blobPath = `uploads/video/_hls/${file}`;

    try {
      const fileBuffer = fs.readFileSync(localPath);
      const contentType = file.endsWith('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : 'video/MP2T';

      const blob = await put(blobPath, fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType,
      });

      console.log(`✅ ${file}`);
      uploaded++;

      // Avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`❌ FAILED: ${file} - ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60) + '\n');
}

uploadHLSToBlob().catch(console.error);
