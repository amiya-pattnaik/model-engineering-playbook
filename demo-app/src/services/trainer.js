import { buildFeatures, featureVector } from './feature-engineering.js';
import { evaluateModel } from './evaluator.js';

const LABELS = ['low', 'medium', 'high'];

function average(vectors) {
  const width = vectors[0].length;
  const totals = Array.from({ length: width }, () => 0);

  for (const vector of vectors) {
    vector.forEach((value, index) => {
      totals[index] += value;
    });
  }

  return totals.map((value) => Number((value / vectors.length).toFixed(4)));
}

export function trainModel(records) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('Training data must be a non-empty array');
  }

  const grouped = Object.fromEntries(LABELS.map((label) => [label, []]));

  for (const record of records) {
    if (!LABELS.includes(record.riskLabel)) {
      throw new Error(`Invalid riskLabel for ${record.id || 'record'}: ${record.riskLabel}`);
    }

    grouped[record.riskLabel].push(featureVector(buildFeatures(record)));
  }

  for (const label of LABELS) {
    if (grouped[label].length === 0) {
      throw new Error(`Training data must include at least one ${label} example`);
    }
  }

  const centroids = Object.fromEntries(
    LABELS.map((label) => [label, average(grouped[label])])
  );

  const model = {
    version: '0.1.0',
    type: 'centroid-risk-classifier',
    labels: LABELS,
    featureNames: [
      'changeSize',
      'fileSpread',
      'coverageRisk',
      'complexityRisk',
      'defectHistoryRisk',
      'criticalityRisk',
      'databaseRisk',
      'securityRisk'
    ],
    centroids,
    trainedAt: new Date().toISOString(),
    trainingRecords: records.length
  };

  return {
    model,
    evaluation: evaluateModel(model, records)
  };
}
