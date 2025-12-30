import { chromium } from 'playwright';

const url = process.env.CHECK_URL || 'http://localhost:4000';
const viewports = [
  { name: '320x800', width: 320, height: 800 },
  { name: '360x800', width: 360, height: 800 },
  { name: '375x800', width: 375, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '414x896', width: 414, height: 896 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '820x1180', width: 820, height: 1180 },
  { name: '1024x800', width: 1024, height: 800 },
  { name: '1440x900', width: 1440, height: 900 },
];

const shouldFail = (width) => width <= 820;

const describeClass = (cls) => {
  if (!cls) return '';
  if (typeof cls === 'string') return cls.trim();
  try {
    return String(cls);
  } catch {
    return '';
  }
};

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let hasFailures = false;

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const rootScroll = document.documentElement.scrollWidth;
      const rootClient = document.documentElement.clientWidth;
      const candidates = Array.from(document.querySelectorAll('*'));
      const rows = [];

      const stripOverflows = (strip) => {
        if (!strip) return false;
        const rect = strip.getBoundingClientRect();
        const rectOverflow = rect.right > vw + 0.5 || rect.left < -0.5;
        return rectOverflow;
      };

      for (const el of candidates) {
        if (el === document.documentElement || el === document.body) continue;
        const rect = el.getBoundingClientRect();
        const rectLeft = rect.left;
        const rectRight = rect.right;
        const scrollWidth = el.scrollWidth;
        const rectOverflow = rectRight > vw + 0.5 || rectLeft < -0.5;
        const isScrollStrip = el.classList?.contains('scroll-strip');
        const hasScrollStripDesc = typeof el.querySelector === 'function' && !!el.querySelector('.scroll-strip');
        const scrollOverflow = !isScrollStrip && !hasScrollStripDesc && scrollWidth > vw + 1;
        if (!rectOverflow && !scrollOverflow) continue;

        const strip = el.closest('.scroll-strip');
        if (strip && !stripOverflows(strip)) {
          continue;
        }

        if (!isScrollStrip && hasScrollStripDesc) {
          const embeddedStrip = el.querySelector('.scroll-strip');
          if (embeddedStrip && !stripOverflows(embeddedStrip)) {
            continue;
          }
        }

        rows.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: el.className || '',
          rectLeft: Number(rectLeft.toFixed(2)),
          rectRight: Number(rectRight.toFixed(2)),
          scrollWidth,
          vw,
        });
      }

      return {
        vw,
        rootScroll,
        rootClient,
        offenders: rows,
      };
    });

    console.log(`\nViewport ${vp.name} -> offenders: ${result.offenders.length} | root ${result.rootScroll}/${result.rootClient}`);
    if (result.offenders.length) {
      console.table(
        result.offenders.map((o) => ({
          tag: o.tag,
          id: o.id,
          className: describeClass(o.className),
          rectLeft: o.rectLeft,
          rectRight: o.rectRight,
          scrollWidth: o.scrollWidth,
          vw: o.vw,
        }))
      );
    }

    if (shouldFail(vp.width) && result.offenders.length) {
      hasFailures = true;
    }
  }

  await browser.close();
  process.exit(hasFailures ? 1 : 0);
};

run().catch((err) => {
  console.error('[check-horizontal-overflow] failed', err);
  process.exit(1);
});
