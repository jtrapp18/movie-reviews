import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = process.cwd();
const fontsDir = path.join(ROOT, "public", "fonts");

// `ttf2woff2` is CommonJS; load via require to avoid ESM interop hangs/issues.
const require = createRequire(import.meta.url);
const ttf2woff2 = require("ttf2woff2");

const targets = [
  "Merriweather-VariableFont_opsz,wdth,wght.ttf",
  "Rubik-VariableFont_wght.ttf",
  "Rubik-Italic-VariableFont_wght.ttf",
  "NotoSerif-VariableFont_wdth,wght.ttf",
  "Caveat-VariableFont_wght.ttf",
  "Mogra-Regular.ttf",
];

function fmt(bytes) {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function convertOne(ttfName) {
  const inPath = path.join(fontsDir, ttfName);
  if (!(await exists(inPath))) return;

  const outName = ttfName.replace(/\.ttf$/i, ".woff2");
  const outPath = path.join(fontsDir, outName);

  console.log(`Converting ${ttfName}...`);
  const before = (await fs.stat(inPath)).size;
  const ttf = await fs.readFile(inPath);
  const woff2 = ttf2woff2(new Uint8Array(ttf));
  await fs.writeFile(outPath, Buffer.from(woff2));
  const after = (await fs.stat(outPath)).size;

  console.log(
    `${ttfName} -> ${outName}   ${fmt(before)} → ${fmt(after)}  (${(
      (1 - after / before) *
      100
    ).toFixed(1)}% smaller)`,
  );
}

await fs.mkdir(fontsDir, { recursive: true });
console.log(`Writing WOFF2 into ${path.relative(ROOT, fontsDir)}`);
for (const ttfName of targets) {
  try {
    // eslint-disable-next-line no-await-in-loop
    await convertOne(ttfName);
  } catch (err) {
    console.error(`Failed converting ${ttfName}:`, err);
  }
}
console.log("Done.");
