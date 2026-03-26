import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const imagesDir = path.join(ROOT, "public", "images");

// Safe defaults:
// - Only resize images that are "big" (either bytes or dimensions).
// - Always write a WebP sibling for photos/backgrounds.
// - Keep small UI-ish assets mostly untouched.
const MAX_WIDTH = 1920;
const MIN_BYTES_TO_OPTIMIZE = 200 * 1024; // 200 KB
const MIN_WIDTH_TO_RESIZE = 2200; // px
const MIN_WEBP_ABS_SAVINGS = 20 * 1024; // 20 KB
const MIN_WEBP_PCT_SAVINGS = 0.08; // 8%
const SUPPORTED_EXTS = new Set([".png", ".jpg", ".jpeg"]);
const SKIP_BASENAMES = new Set([
  // tiny UI assets / icons; keep as-is unless they get large
  "home-icon.png",
  "clapperboard.png",
  "clapperboard2.png",
  "clapperboard3.png",
  "clapperboard4.png",
  "clapperboard5.png",
]);

async function statSafe(p) {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

function fmtBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

async function optimizeOne(filename) {
  const inputPath = path.join(imagesDir, filename);
  const before = await statSafe(inputPath);
  if (!before) {
    console.warn(`Skip (missing): ${path.relative(ROOT, inputPath)}`);
    return;
  }

  const img = sharp(inputPath, { animated: false, failOn: "none" });
  const meta = await img.metadata();
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename);

  if (!SUPPORTED_EXTS.has(ext)) return;
  if (SKIP_BASENAMES.has(base) && before.size < MIN_BYTES_TO_OPTIMIZE) return;

  const width = meta.width ?? 0;
  const shouldResize = width >= MIN_WIDTH_TO_RESIZE;
  const shouldOptimize = before.size >= MIN_BYTES_TO_OPTIMIZE || shouldResize;

  if (!shouldOptimize) return;

  const pipeline = shouldResize
    ? img.rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true })
    : img.rotate();

  const processed = pipeline.withMetadata({ orientation: undefined });

  const webpPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  const tmpWebpPath = `${webpPath}.tmp`;

  // Re-encode the original format (smaller, also strips heavy metadata).
  const tmpReencodedPath = `${inputPath}.tmp`;
  if (ext === ".png") {
    await processed
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: true,
      })
      .toFile(tmpReencodedPath);
  } else if (ext === ".jpg" || ext === ".jpeg") {
    await processed
      .jpeg({
        quality: 82,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      })
      .toFile(tmpReencodedPath);
  } else {
    await processed.toFile(tmpReencodedPath);
  }

  await processed
    .webp({
      quality: 82,
      alphaQuality: 82,
      effort: 6,
    })
    .toFile(tmpWebpPath);

  await fs.rename(tmpReencodedPath, inputPath);
  await fs.rename(tmpWebpPath, webpPath);

  const afterOriginal = await fs.stat(inputPath);
  const afterWebp = await fs.stat(webpPath);
  const savingsBytes = afterOriginal.size - afterWebp.size;
  const savingsPct =
    afterOriginal.size > 0 ? savingsBytes / afterOriginal.size : 0;

  // Keep WebP only when it materially helps (or when it at least doesn't regress).
  // This avoids "two of everything" where WebP is barely smaller or larger.
  const keepWebp =
    savingsBytes > 0 &&
    (savingsBytes >= MIN_WEBP_ABS_SAVINGS || savingsPct >= MIN_WEBP_PCT_SAVINGS);

  if (!keepWebp) {
    await fs.unlink(webpPath).catch(() => {});
  }

  console.log(
    [
      `Optimized ${filename}`,
      meta.width && meta.height ? `(${meta.width}×${meta.height})` : "",
      `${ext.toUpperCase().slice(1)}: ${fmtBytes(before.size)} → ${fmtBytes(afterOriginal.size)}`,
      keepWebp
        ? `WEBP: ${fmtBytes(afterWebp.size)} (${path.basename(webpPath)})`
        : `WEBP: skipped (not enough savings)`,
    ]
      .filter(Boolean)
      .join("  "),
  );
}

await fs.mkdir(imagesDir, { recursive: true });
const entries = await fs.readdir(imagesDir, { withFileTypes: true });
const candidates = entries
  .filter((e) => e.isFile())
  .map((e) => e.name)
  .filter((name) => SUPPORTED_EXTS.has(path.extname(name).toLowerCase()))
  .sort((a, b) => a.localeCompare(b));

for (const f of candidates) {
  // eslint-disable-next-line no-await-in-loop
  await optimizeOne(f);
}
