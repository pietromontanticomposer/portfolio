import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const url = process.env.PRIVACY_SCAN_URL || "http://localhost:4000/";
const outputPath = path.join(process.cwd(), "data", "privacy-scan.json");

const trackingPatterns = [
  /googletagmanager/i,
  /google-analytics/i,
  /analytics\.google/i,
  /gtag/i,
  /doubleclick/i,
  /facebook\.com/i,
  /fbq/i,
  /hotjar/i,
  /clarity/i,
  /tiktok/i,
  /linkedin/i,
  /pixel/i,
];

const allowedCookieNames = new Set([]);

const isFirstParty = (hostname, baseHost) => {
  if (!hostname) return true;
  if (hostname === baseHost) return true;
  if (hostname.endsWith(`.${baseHost}`)) return true;
  if (baseHost === "localhost" && (hostname === "127.0.0.1" || hostname === "localhost")) {
    return true;
  }
  return false;
};

const run = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const thirdParty = new Set();
  const trackingHits = new Set();
  const baseHost = new URL(url).hostname;

  page.on("request", (request) => {
    const reqUrl = request.url();
    if (!reqUrl.startsWith("http")) return;
    let hostname;
    try {
      hostname = new URL(reqUrl).hostname;
    } catch {
      return;
    }

    if (!isFirstParty(hostname, baseHost)) {
      thirdParty.add(hostname);
    }

    if (trackingPatterns.some((pattern) => pattern.test(reqUrl))) {
      trackingHits.add(reqUrl);
    }
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const cookies = await context.cookies();
  const nonTechnicalCookies = cookies.filter((cookie) => !allowedCookieNames.has(cookie.name));

  const result = {
    generatedAt: new Date().toISOString(),
    siteUrl: url,
    cookies,
    thirdPartyRequests: Array.from(thirdParty).sort(),
    trackingRequests: Array.from(trackingHits).sort(),
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log("Cookies:", cookies.map((c) => c.name));
  console.log("Third-party domains:", result.thirdPartyRequests);
  console.log("Tracking requests:", result.trackingRequests);

  await browser.close();

  if (nonTechnicalCookies.length > 0) {
    console.error("Non-technical cookies detected:", nonTechnicalCookies.map((c) => c.name));
    process.exit(1);
  }

  if (result.trackingRequests.length > 0) {
    console.error("Tracking requests detected.");
    process.exit(1);
  }
};

run().catch((error) => {
  console.error("[privacy-scan] failed", error);
  process.exit(1);
});
