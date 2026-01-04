import fs from "node:fs";
import path from "node:path";

type CookieRow = {
  name: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
};

const scanPath = path.join(process.cwd(), "data", "privacy-scan.json");
const isProduction = process.env.NODE_ENV === "production";

let scanData: { cookies: CookieRow[]; generatedAt?: string } | null = null;
let scanError: string | null = null;

try {
  if (!fs.existsSync(scanPath)) {
    scanError = "Missing privacy scan results. Run scripts/privacy-scan.mjs.";
  } else {
    const raw = fs.readFileSync(scanPath, "utf8");
    scanData = JSON.parse(raw);
  }
} catch (error) {
  scanError = error instanceof Error ? error.message : "Failed to parse privacy scan results.";
}

if (isProduction && scanError) {
  throw new Error(scanError);
}

const cookies = scanData?.cookies ?? [];

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="section-title text-3xl text-[color:var(--foreground)]">
        Cookie Policy
      </h1>
      <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
        This page lists only the technical cookies actually set on the first load.
      </p>
      {scanData?.generatedAt ? (
        <p className="mt-2 text-xs text-[color:var(--muted)]">
          Last check: {scanData.generatedAt}
        </p>
      ) : null}

      {scanError ? (
        <p className="mt-6 text-sm text-[color:var(--muted)]">
          {scanError}
        </p>
      ) : cookies.length === 0 ? (
        <p className="mt-6 text-sm text-[color:var(--muted)]">
          No technical cookies detected on the first load.
        </p>
      ) : (
        <div className="mt-6 space-y-4 text-sm text-[color:var(--muted)]">
          {cookies.map((cookie) => (
            <div key={`${cookie.name}-${cookie.domain}`} className="rounded-lg border border-white/10 p-3">
              <div className="text-[color:var(--foreground)] font-semibold">
                {cookie.name}
              </div>
              <div>Domain: {cookie.domain}</div>
              <div>Path: {cookie.path}</div>
              <div>Secure: {cookie.secure ? "Yes" : "No"}</div>
              <div>HttpOnly: {cookie.httpOnly ? "Yes" : "No"}</div>
              <div>SameSite: {cookie.sameSite ?? "N/A"}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
