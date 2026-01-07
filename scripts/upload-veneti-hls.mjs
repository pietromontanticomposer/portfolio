import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
config({ path: path.join(path.dirname(__filename), '..', '.env.local') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadVenetiHLS() {
  console.log('🚀 Re-uploading I Veneti Antichi HLS to Vercel Blob (with audio)...\n');

  const hlsDir = path.join(__dirname, '..', 'public', 'uploads', 'video', '_hls', 'I Veneti Antichi The Battle New');

  if (!fs.existsSync(hlsDir)) {
    console.log('❌ Directory not found:', hlsDir);
    return;
  }

  const files = fs.readdirSync(hlsDir).filter(f => f.endsWith('.m3u8') || f.endsWith('.ts'));
  console.log(`📁 Found ${files.length} files to upload`);

  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const localPath = path.join(hlsDir, file);
    const blobPath = `uploads/video/_hls/I Veneti Antichi The Battle New/${file}`;

    try {
      const fileBuffer = fs.readFileSync(localPath);
      const contentType = file.endsWith('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : 'video/MP2T';

      await put(blobPath, fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType,
      });

      process.stdout.write('.');
      uploaded++;

      // Avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.log(`\n❌ ${file}: ${error.message}`);
      failed++;
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60));
}

uploadVenetiHLS().catch(console.error);
