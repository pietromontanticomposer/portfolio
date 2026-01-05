const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function uploadBattle() {
  const localPath = path.join(__dirname, '..', 'public/uploads/tracks/musiche i veneti antichi/The Battle.mp3');

  if (!fs.existsSync(localPath)) {
    console.log('❌ File not found:', localPath);
    return;
  }

  console.log('📤 Uploading The Battle.mp3...');

  try {
    const fileBuffer = fs.readFileSync(localPath);
    const blob = await put('tracks/musiche-i-veneti-antichi/The-Battle.mp3', fileBuffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    console.log('✅ Upload complete!');
    console.log('   URL:', blob.url);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

uploadBattle();
