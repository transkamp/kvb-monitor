/**
 * Re-renders all PNG icons from the SVG masters in public/icons/.
 *
 * Sources (edit these to change branding):
 *   public/icons/icon-master.svg   — main app icon (rounded square bg)
 *   public/icons/icon-maskable.svg — Android adaptive icon (full-bleed bg)
 *   public/icons/favicon.svg       — small-size simplified version
 *
 * Run with `node scripts/generate-icons.mjs` after editing any SVG.
 */

import sharp from "sharp";
import { readFile } from "fs/promises";
import { join } from "path";

const ICONS_DIR = join(process.cwd(), "public", "icons");

const masterSvg = await readFile(join(ICONS_DIR, "icon-master.svg"));
const maskableSvg = await readFile(join(ICONS_DIR, "icon-maskable.svg"));
const faviconSvg = await readFile(join(ICONS_DIR, "favicon.svg"));

const masterTargets = [
  { name: "icon-96.png", size: 96 },
  { name: "icon-144.png", size: 144 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-256.png", size: 256 },
  { name: "icon-384.png", size: 384 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon-152.png", size: 152 },
  { name: "apple-touch-icon-167.png", size: 167 },
  { name: "apple-touch-icon.png", size: 180 },
];

const maskableTargets = [
  { name: "icon-maskable-192.png", size: 192 },
  { name: "icon-maskable-512.png", size: 512 },
];

const faviconTargets = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "favicon-48.png", size: 48 },
];

async function render(svg, targets) {
  for (const t of targets) {
    await sharp(svg).resize(t.size, t.size).png().toFile(join(ICONS_DIR, t.name));
    console.log(`✓ ${t.name} (${t.size}x${t.size})`);
  }
}

await render(masterSvg, masterTargets);
await render(maskableSvg, maskableTargets);
await render(faviconSvg, faviconTargets);

console.log("\nDone. PNG icons regenerated from SVG masters.");
