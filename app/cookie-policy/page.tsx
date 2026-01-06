import fs from "node:fs";
import path from "node:path";
import CookiePolicyClient from "./CookiePolicyClient";

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

export default function CookiePolicyPage() {
  return (
    <CookiePolicyClient
      cookies={scanData?.cookies ?? []}
      generatedAt={scanData?.generatedAt ?? null}
      scanError={scanError}
    />
  );
}
