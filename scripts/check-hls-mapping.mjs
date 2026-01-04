import fs from 'fs';
const m = JSON.parse(fs.readFileSync(new URL('./blob-urls.json', import.meta.url)));
const files = ['data/caseStudies.ts','app/case-studies/page.tsx','app/for-directors/page.tsx','components/ShowreelSection.tsx','components/CaseStudyDuration.tsx','app/page.tsx'];
const re = /\/uploads\/video\/_hls\/(.+?)\/index\.m3u8/g;
for (const f of files) {
  if (!fs.existsSync(new URL('../' + f, import.meta.url))) continue;
  const c = fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
  let match;
  while ((match = re.exec(c))) {
    const candidate = `uploads/video/${match[1]}.mp4`;
    const ok = Boolean(m[candidate]);
    console.log(f, '->', match[0], '=>', candidate, ok);
  }
}
