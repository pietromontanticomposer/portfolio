const { put, list } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const MEDIA_FILES = [
  // Videos
  { local: 'public/background.mp4', blob: 'videos/background.mp4' },
  { local: 'public/background.webm', blob: 'videos/background.webm' },

  // Tracks - Claudio Re
  { local: "public/uploads/tracks/musiche claudio re/The Storm.mp3", blob: "tracks/musiche-claudio-re/The-Storm.mp3" },
  { local: "public/uploads/tracks/musiche claudio re/Kings Lament.mp3", blob: "tracks/musiche-claudio-re/Kings-Lament.mp3" },
  { local: "public/uploads/tracks/musiche claudio re/King's Lament.mp3", blob: "tracks/musiche-claudio-re/Kings-Lament-alt.mp3" },
  { local: "public/uploads/tracks/musiche claudio re/What If A Man Can't Regret.mp3", blob: "tracks/musiche-claudio-re/What-If-A-Man-Cant-Regret.mp3" },
  { local: "public/uploads/tracks/musiche claudio re/What If A Man Cant Regret.mp3", blob: "tracks/musiche-claudio-re/What-If-A-Man-Cant-Regret-alt.mp3" },
  { local: "public/uploads/tracks/musiche claudio re/My Crown, My Ambition, My Queen.mp3", blob: "tracks/musiche-claudio-re/My-Crown-My-Ambition-My-Queen.mp3" },
  { local: "public/uploads/tracks/musiche claudio re/The Spectre.mp3", blob: "tracks/musiche-claudio-re/The-Spectre.mp3" },
  { local: "public/uploads/tracks/musiche claudio re/My Sin Is Rotten.mp3", blob: "tracks/musiche-claudio-re/My-Sin-Is-Rotten.mp3" },

  // Tracks - Freefall
  { local: "public/uploads/tracks/musiche freefall/Ludopathy.mp3", blob: "tracks/musiche-freefall/Ludopathy.mp3" },
  { local: "public/uploads/tracks/musiche freefall/The Responsibilities We All Have.mp3", blob: "tracks/musiche-freefall/The-Responsibilities-We-All-Have.mp3" },
  { local: "public/uploads/tracks/musiche freefall/Restarting The Loop.mp3", blob: "tracks/musiche-freefall/Restarting-The-Loop.mp3" },

  // Tracks - I Veneti Antichi
  { local: "public/uploads/tracks/musiche i veneti antichi/The Battle.mp3", blob: "tracks/musiche-i-veneti-antichi/The-Battle.mp3" },
  { local: "public/uploads/tracks/musiche i veneti antichi/Convivium.mp3", blob: "tracks/musiche-i-veneti-antichi/Convivium.mp3" },

  // Tracks - L'Appartamento
  { local: "public/uploads/tracks/musiche l'appartamento/Nonostante tutto.mp3", blob: "tracks/musiche-lappartamento/Nonostante-tutto.mp3" },
  { local: "public/uploads/tracks/musiche l'appartamento/Occhi chiusi, cuore aperto.mp3", blob: "tracks/musiche-lappartamento/Occhi-chiusi-cuore-aperto.mp3" },
  { local: "public/uploads/tracks/musiche l'appartamento/Il mio ritmo.mp3", blob: "tracks/musiche-lappartamento/Il-mio-ritmo.mp3" },
  { local: "public/uploads/tracks/musiche l'appartamento/Come sono, dove sono.mp3", blob: "tracks/musiche-lappartamento/Come-sono-dove-sono.mp3" },

  // Tracks - L'Appartamento (alt path)
  { local: "public/uploads/tracks/musiche lappartamento/Nonostante tutto.mp3", blob: "tracks/musiche-lappartamento/Nonostante-tutto-alt.mp3" },
  { local: "public/uploads/tracks/musiche lappartamento/Occhi chiusi, cuore aperto.mp3", blob: "tracks/musiche-lappartamento/Occhi-chiusi-cuore-aperto-alt.mp3" },
  { local: "public/uploads/tracks/musiche lappartamento/Il mio ritmo.mp3", blob: "tracks/musiche-lappartamento/Il-mio-ritmo-alt.mp3" },
  { local: "public/uploads/tracks/musiche lappartamento/Come sono, dove sono.mp3", blob: "tracks/musiche-lappartamento/Come-sono-dove-sono-alt.mp3" },

  // Tracks - La Sonata del Caos
  { local: "public/uploads/tracks/musiche la sonata del caos/Talia's Farewell.mp3", blob: "tracks/musiche-la-sonata-del-caos/Talias-Farewell.mp3" },
  { local: "public/uploads/tracks/musiche la sonata del caos/Talias Farewell.mp3", blob: "tracks/musiche-la-sonata-del-caos/Talias-Farewell-alt.mp3" },
  { local: "public/uploads/tracks/musiche la sonata del caos/The Mother's Tale.mp3", blob: "tracks/musiche-la-sonata-del-caos/The-Mothers-Tale.mp3" },
  { local: "public/uploads/tracks/musiche la sonata del caos/The Mothers Tale.mp3", blob: "tracks/musiche-la-sonata-del-caos/The-Mothers-Tale-alt.mp3" },
  { local: "public/uploads/tracks/musiche la sonata del caos/Waiting.mp3", blob: "tracks/musiche-la-sonata-del-caos/Waiting.mp3" },
  { local: "public/uploads/tracks/musiche la sonata del caos/Something Threatening.mp3", blob: "tracks/musiche-la-sonata-del-caos/Something-Threatening.mp3" },
  { local: "public/uploads/tracks/musiche la sonata del caos/A Close Encounter In The Wood.mp3", blob: "tracks/musiche-la-sonata-del-caos/A-Close-Encounter-In-The-Wood.mp3" },

  // Tracks - Polvere Sotto al Tappeto
  { local: "public/uploads/tracks/musiche polvere sotto al tappeto/Projection ⧸ Reflection.mp3", blob: "tracks/musiche-polvere-sotto-al-tappeto/Projection-Reflection.mp3" },
  { local: "public/uploads/tracks/musiche polvere sotto al tappeto/Good Morning, Love.mp3", blob: "tracks/musiche-polvere-sotto-al-tappeto/Good-Morning-Love.mp3" },
  { local: "public/uploads/tracks/musiche polvere sotto al tappeto/Dust Under the Rug.mp3", blob: "tracks/musiche-polvere-sotto-al-tappeto/Dust-Under-the-Rug.mp3" },
  { local: "public/uploads/tracks/musiche polvere sotto al tappeto/Trigger Point.mp3", blob: "tracks/musiche-polvere-sotto-al-tappeto/Trigger-Point.mp3" },
  { local: "public/uploads/tracks/musiche polvere sotto al tappeto/She's Not Here Anymore.mp3", blob: "tracks/musiche-polvere-sotto-al-tappeto/Shes-Not-Here-Anymore.mp3" },
  { local: "public/uploads/tracks/musiche polvere sotto al tappeto/Rationalization.mp3", blob: "tracks/musiche-polvere-sotto-al-tappeto/Rationalization.mp3" },

  // Tracks - Soggetto Obsoleto
  { local: "public/uploads/tracks/musiche soggetto obsoleto/Obsolete Subject And Past Times.mp3", blob: "tracks/musiche-soggetto-obsoleto/Obsolete-Subject-And-Past-Times.mp3" },
  { local: "public/uploads/tracks/musiche soggetto obsoleto/Sitting On The Seashore.mp3", blob: "tracks/musiche-soggetto-obsoleto/Sitting-On-The-Seashore.mp3" },
  { local: "public/uploads/tracks/musiche soggetto obsoleto/Ending Titles.mp3", blob: "tracks/musiche-soggetto-obsoleto/Ending-Titles.mp3" },

  // Tracks - Selected
  { local: "public/uploads/tracks/selected tracks/The Battle.mp3", blob: "tracks/selected-tracks/The-Battle.mp3" },
  { local: "public/uploads/tracks/selected tracks/Obsolete Subject And Past Times.mp3", blob: "tracks/selected-tracks/Obsolete-Subject-And-Past-Times.mp3" },
  { local: "public/uploads/tracks/selected tracks/Talia's Farewell.mp3", blob: "tracks/selected-tracks/Talias-Farewell.mp3" },
  { local: "public/uploads/tracks/selected tracks/Talias Farewell.mp3", blob: "tracks/selected-tracks/Talias-Farewell-alt.mp3" },
  { local: "public/uploads/tracks/selected tracks/The Mother's Tale.mp3", blob: "tracks/selected-tracks/The-Mothers-Tale.mp3" },
  { local: "public/uploads/tracks/selected tracks/The Mothers Tale.mp3", blob: "tracks/selected-tracks/The-Mothers-Tale-alt.mp3" },
  { local: "public/uploads/tracks/selected tracks/What If A Man Can't Regret.mp3", blob: "tracks/selected-tracks/What-If-A-Man-Cant-Regret.mp3" },
  { local: "public/uploads/tracks/selected tracks/What If A Man Cant Regret.mp3", blob: "tracks/selected-tracks/What-If-A-Man-Cant-Regret-alt.mp3" },
  { local: "public/uploads/tracks/selected tracks/Il mio ritmo.mp3", blob: "tracks/selected-tracks/Il-mio-ritmo.mp3" },
  { local: "public/uploads/tracks/selected tracks/My Crown, My Ambition, My Queen.mp3", blob: "tracks/selected-tracks/My-Crown-My-Ambition-My-Queen.mp3" },
  { local: "public/uploads/tracks/selected tracks/Convivium.mp3", blob: "tracks/selected-tracks/Convivium.mp3" },
  { local: "public/uploads/tracks/selected tracks/The Spectre.mp3", blob: "tracks/selected-tracks/The-Spectre.mp3" },
  { local: "public/uploads/tracks/selected tracks/Ending Titles.mp3", blob: "tracks/selected-tracks/Ending-Titles.mp3" },
];

async function uploadToBlob() {
  console.log('🚀 Starting upload to Vercel Blob...\n');

  const results = [];
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of MEDIA_FILES) {
    const localPath = path.join(__dirname, '..', file.local);

    if (!fs.existsSync(localPath)) {
      console.log(`⚠️  SKIP: ${file.local} (not found)`);
      skipped++;
      continue;
    }

    try {
      const fileBuffer = fs.readFileSync(localPath);
      const blob = await put(file.blob, fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
      });

      console.log(`✅ ${file.local}`);
      console.log(`   → ${blob.url}\n`);

      results.push({
        local: file.local,
        blob: file.blob,
        url: blob.url
      });
      uploaded++;
    } catch (error) {
      console.log(`❌ FAILED: ${file.local}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60) + '\n');

  // Save mapping
  fs.writeFileSync(
    path.join(__dirname, 'blob-urls.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('📝 Mapping saved to: scripts/blob-urls.json\n');
}

uploadToBlob().catch(console.error);
