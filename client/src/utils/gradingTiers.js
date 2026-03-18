import yaml from 'js-yaml';
import gradingTiersYaml from '../data/gradingTiers.yaml?raw';

const tiers = (yaml.load(gradingTiersYaml)?.tiers || []).slice().sort((a, b) => b.tier - a.tier);

function normalizeTier(value) {
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function getGradingTier(tier) {
  const t = normalizeTier(tier);
  if (t == null) return null;
  return tiers.find((x) => x.tier === t) || null;
}

export function getGradingLabel(tier) {
  const found = getGradingTier(tier);
  return found?.grade || null;
}

export function getGradingDefinition(tier) {
  const found = getGradingTier(tier);
  return found?.definition || null;
}

export function getAllGradingTiers() {
  return tiers;
}
