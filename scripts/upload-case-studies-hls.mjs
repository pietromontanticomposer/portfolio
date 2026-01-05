import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
config({ path: path.join(path.dirname(__filename), '..', '.env.local') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadHLS() {
  console.log('🚀 Uploading Case Studies HLS to Vercel Blob...\n');

  const hlsDir = path.join(__dirname, '..', 'public', 'uploads', 'video', '_hls');

  // Get all directories that contain case study videos
  const caseStudyDirs = [
    'Soggetto Obsoleto/Soggetto Obsoleto Sitting On The Seashore Case Stu',
    'I Veneti Antichi The Battle New',
    'La Sonata Del Caos/La Sonata Del Caos Something Threatening Case Stud',
    'La Sonata Del Caos/La Sonata Del Caos The Mother_s Tale Case Study',
    'La Sonata Del Caos/La Sonata Del Caos A Close Encounter In The Wood',
    'La Sonata Del Caos/La Sonata Del Caos Talia_s Farewell',
    'Claudio Re/Claudio Re The Storm Case Study',
    'Claudio Re/Claudio Re My Sin Is Rotten',
    'Claudio Re/Claudio Re My Crown, My Ambition, My Queen Case St',
    'Claudio Re/Claudio Re The Spectre',
    'Claudio Re/Claudio Re What If A Man Can_t Regret Case Study',
  ];

  let uploaded = 0;
  let failed = 0;

  for (const dir of caseStudyDirs) {
    const fullDir = path.join(hlsDir, dir);

    if (!fs.existsSync(fullDir)) {
      console.log(`⚠️ Directory not found: ${dir}`);
      continue;
    }

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.m3u8') || f.endsWith('.ts'));
    console.log(`📁 ${dir} (${files.length} files)`);

    for (const file of files) {
      const localPath = path.join(fullDir, file);
      const blobPath = `uploads/video/_hls/${dir}/${file}`;

      try {
        const fileBuffer = fs.readFileSync(localPath);
        const contentType = file.endsWith('.m3u8')
          ? 'application/vnd.apple.mpegurl'
          : 'video/MP2T';

        await put(blobPath, fileBuffer, {
          access: 'public',
          addRandomSuffix: false,
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
    console.log(' ✅');
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60));
}

uploadHLS().catch(console.error);
