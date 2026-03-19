import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function firstEnv(...keys) {
  for (const k of keys) {
    const v = process.env[k];
    if (v && String(v).trim()) return String(v).trim();
  }
  return null;
}

// Prefer CI/deploy-provided SHAs; git isn't available in many Docker builds.
const gitSha = firstEnv(
  'GIT_SHA',
  'COMMIT_SHA',
  'SOURCE_VERSION',
  'RAILWAY_GIT_COMMIT_SHA',
  'RAILWAY_GIT_COMMIT',
  'VERCEL_GIT_COMMIT_SHA',
  'GITHUB_SHA',
);

const payload = {
  gitSha,
  buildTime: new Date().toISOString(),
};

const outDir = path.resolve('public');
const outFile = path.join(outDir, 'version.json');

await mkdir(outDir, { recursive: true });
await writeFile(outFile, JSON.stringify(payload, null, 2) + '\n', 'utf8');
