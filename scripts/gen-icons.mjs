// Génère les icônes PWA (PNG) à partir du logo SVG, via sharp.
// Lancer : npm run icons   (sharp est requis : npm i -D sharp)
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const R =
  '<path d="M150 120h120c66 0 112 40 112 100 0 44-25 76-66 91l78 81h-92l-70-74h-30v74h-52V120zm52 52v72h64c34 0 56-14 56-36s-22-36-56-36h-64z" fill="#ffffff"/>';

// Icône standard monochrome : carré noir arrondi, R blanc plein cadre.
const standard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#000000"/>${R}</svg>`;

// Icône maskable : fond noir plein, logo réduit dans la zone de sécurité (~70%).
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#000000"/>
  <g transform="translate(76 76) scale(0.703)">${R}</g></svg>`;

const targets = [
  { svg: standard, size: 192, file: "icon-192.png" },
  { svg: standard, size: 512, file: "icon-512.png" },
  { svg: maskable, size: 512, file: "icon-maskable-512.png" },
  { svg: standard, size: 180, file: "apple-touch-icon.png" },
];

for (const t of targets) {
  const png = await sharp(Buffer.from(t.svg)).resize(t.size, t.size).png().toBuffer();
  await writeFile(new URL(`../public/${t.file}`, import.meta.url), png);
  console.log(`✓ public/${t.file} (${t.size}×${t.size})`);
}
