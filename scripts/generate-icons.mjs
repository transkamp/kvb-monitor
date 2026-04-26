/**
 * One-shot icon generator for the PWA.
 *
 * Generates simple placeholder icons: blue accent background with white "KVB"
 * monogram. Run once with `node scripts/generate-icons.mjs`.
 *
 * After generation, sharp can be removed from devDependencies if desired.
 */

import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public", "icons");
await mkdir(OUT_DIR, { recursive: true });

const ACCENT = "#2563EB";
const TEXT = "#FFFFFF";

function svgIcon(size, { padding = 0, bg = ACCENT } = {}) {
  const fontSize = Math.round(size * 0.32);
  const inner = size - padding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${Math.round(inner * 0.18)}" fill="${bg}"/>
  <text x="50%" y="50%" font-family="-apple-system, system-ui, sans-serif" font-size="${fontSize}" font-weight="700" fill="${TEXT}" text-anchor="middle" dominant-baseline="central" letter-spacing="-1">KVB</text>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, padding: 0 },
  { name: "icon-512.png", size: 512, padding: 0 },
  // Maskable: safe zone is inner 80%, so add 10% padding via inner box.
  { name: "icon-maskable-512.png", size: 512, padding: 52 },
  { name: "apple-touch-icon.png", size: 180, padding: 0 },
];

for (const t of targets) {
  const svg = svgIcon(t.size, { padding: t.padding });
  await sharp(Buffer.from(svg)).png().toFile(join(OUT_DIR, t.name));
  console.log(`✓ ${t.name} (${t.size}x${t.size})`);
}

// Favicon (32x32)
const favSvg = svgIcon(32, { padding: 0 });
await sharp(Buffer.from(favSvg)).png().toFile(join(process.cwd(), "public", "favicon.png"));
console.log("✓ favicon.png (32x32)");

console.log("\nDone. You can now remove sharp from devDependencies if desired.");
