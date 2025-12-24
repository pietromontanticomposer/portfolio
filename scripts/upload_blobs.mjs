import fs from "fs";
import path from "path";
import process from "process";
import dotenv from "dotenv";
import { put } from "@vercel/blob";

dotenv.config({ path: ".env.local" });

const root = process.cwd();
const publicDir = path.join(root, "public");
const outPath = path.join(root, "scripts", "blob-map.json");

function argValue(name) {
  const idx = process.argv.indexOf(name);
  return idx !== -1 ? process.argv[idx + 1] : null;
}

const filter = argValue("--filter") || "public";
const token = process.env.BLOB_READ_WRITE_TOKEN;

if (!token) {
  console.error("Missing BLOB_READ_WRITE_TOKEN in .env.local");
  process.exit(1);
}

function walk(dir) {
  let out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out = out.concat(walk(p));
    else out.push(p);
  }
  return out;
}

function toPosix(p) {
  return p.replace(/\\/g, "/");
}

function encodePathSegments(rel) {
  return rel.split("/").map(encodeURIComponent).join("/");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadMap() {
  if (!fs.existsSync(outPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(outPath, "utf8"));
  } catch {
    return {};
  }
}

function saveMap(m) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(m, null, 2));
}

async function uploadOne(rel, abs, mappings) {
  // rel è path “del sito” (raw), pathname è il path per Blob (encoded)
  const key = `/${rel}`;
  if (mappings[key]) {
    process.stdout.write(`Skip ${rel}\n`);
    return;
  }

  const pathname = encodePathSegments(rel);

  // Buffer only (no streams)
  const payload = fs.readFileSync(abs);

  // Timeout alto
  const TIMEOUT_MS = 30 * 60 * 1000;

  // Retry
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      process.stdout.write(`Uploading ${rel}...\n`);
      const upload = put(pathname, payload, {
        access: "public",
        addRandomSuffix: false,
        token,
      });

      const result = await Promise.race([
        upload,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout uploading ${rel}`)), TIMEOUT_MS)
        ),
      ]);

      mappings[key] = result.url;
      saveMap(mappings);
      process.stdout.write(`Uploaded ${rel}\n`);
      return;
    } catch (e) {
      process.stdout.write(`Retry ${attempt}/${MAX_RETRIES} for ${rel}\n`);
      if (attempt === MAX_RETRIES) throw e;
      await sleep(1000 * attempt);
    }
  }
}

async function main() {
  process.stdout.write(`cwd: ${root}\n`);
  process.stdout.write(`publicDir: ${publicDir}\n`);
  process.stdout.write(`outPath: ${outPath}\n`);
  process.stdout.write(`filter: ${filter}\n`);

  const mappings = loadMap();

  // raccogli tutti i file sotto public
  let files = walk(publicDir);

  // ignora .DS_Store
  files = files.filter((f) => path.basename(f) !== ".DS_Store");

  // applica filtro
  // filtro è tipo: public/uploads oppure public/uploads/tracks/Selected Tracks
  const filterAbs = path.join(root, filter);
  files = files.filter((f) => f.startsWith(filterAbs + path.sep) || f === filterAbs);

  // solo file dentro public
  files = files.filter((f) => f.startsWith(publicDir + path.sep));

  if (!files.length) {
    throw new Error("No files matched filter.");
  }

  process.stdout.write(`matched: ${files.length}\n`);
  process.stdout.write(`first 3: ${files.slice(0, 3).join(", ")}\n`);

  for (const abs of files) {
    const rel = toPosix(path.relative(publicDir, abs));
    await uploadOne(rel, abs, mappings);
  }

  process.stdout.write(`Saved mapping to ${outPath}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
