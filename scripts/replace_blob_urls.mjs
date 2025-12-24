import fs from "fs";
import path from "path";

const root = process.cwd();
const mapPath = path.join(root, "scripts", "blob-map.json");

if (!fs.existsSync(mapPath)) {
  throw new Error("blob-map.json not found. Run scripts/upload_blobs.mjs first.");
}

const mappings = JSON.parse(fs.readFileSync(mapPath, "utf8"));

const targets = [
  "app/layout.tsx",
  "app/head.tsx",
  "app/page.tsx",
  "data/projects.ts",
  "components/ProjectModal.tsx",
  "app/portfolio/[slug]/page.tsx",
];

for (const rel of targets) {
  const full = path.join(root, rel);
  let content = fs.readFileSync(full, "utf8");
  for (const [oldPath, newUrl] of Object.entries(mappings)) {
    if (content.includes(oldPath)) {
      content = content.split(oldPath).join(newUrl);
    }
  }
  fs.writeFileSync(full, content);
  process.stdout.write(`Updated ${rel}\n`);
}
