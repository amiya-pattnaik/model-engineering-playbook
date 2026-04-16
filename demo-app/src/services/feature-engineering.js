const CRITICALITY_SCORE = {
  low: 0.2,
  medium: 0.55,
  high: 1
};

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function validateChange(input) {
  const required = [
    'filesChanged',
    'linesAdded',
    'linesDeleted',
    'coveragePercent',
    'complexityScore',
    'previousDefects',
    'serviceCriticality',
    'hasDatabaseChange',
    'hasSecurityChange'
  ];

  const missing = required.filter((key) => input[key] === undefined || input[key] === null || input[key] === '');
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const criticality = String(input.serviceCriticality).toLowerCase();
  if (!CRITICALITY_SCORE[criticality]) {
    throw new Error('serviceCriticality must be low, medium, or high');
  }
}

export function buildFeatures(input) {
  validateChange(input);

  const linesAdded = numberOrZero(input.linesAdded);
  const linesDeleted = numberOrZero(input.linesDeleted);
  const filesChanged = numberOrZero(input.filesChanged);
  const coveragePercent = numberOrZero(input.coveragePercent);
  const complexityScore = numberOrZero(input.complexityScore);
  const previousDefects = numberOrZero(input.previousDefects);
  const serviceCriticality = String(input.serviceCriticality).toLowerCase();

  return {
    changeSize: clamp((linesAdded + linesDeleted) / 1000),
    fileSpread: clamp(filesChanged / 20),
    coverageRisk: clamp((100 - coveragePercent) / 60),
    complexityRisk: clamp(complexityScore / 10),
    defectHistoryRisk: clamp(previousDefects / 5),
    criticalityRisk: CRITICALITY_SCORE[serviceCriticality],
    databaseRisk: input.hasDatabaseChange ? 1 : 0,
    securityRisk: input.hasSecurityChange ? 1 : 0
  };
}

export function featureVector(features) {
  return [
    features.changeSize,
    features.fileSpread,
    features.coverageRisk,
    features.complexityRisk,
    features.defectHistoryRisk,
    features.criticalityRisk,
    features.databaseRisk,
    features.securityRisk
  ];
}

export function explainChange(input, features) {
  const reasons = [];

  if (features.changeSize >= 0.5 || features.fileSpread >= 0.5) reasons.push('large change size');
  if (features.coverageRisk >= 0.55) reasons.push('low test coverage');
  if (features.complexityRisk >= 0.7) reasons.push('high complexity');
  if (features.defectHistoryRisk >= 0.4) reasons.push('previous defect history');
  if (features.criticalityRisk >= 1) reasons.push('high service criticality');
  if (input.hasDatabaseChange) reasons.push('database/schema change');
  if (input.hasSecurityChange) reasons.push('security-sensitive change');

  if (reasons.length === 0) {
    reasons.push('small change with healthy coverage and low complexity');
  }

  return reasons;
}
