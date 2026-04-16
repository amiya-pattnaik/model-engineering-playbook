import { buildFeatures, explainChange, featureVector } from './feature-engineering.js';

function euclideanDistance(a, b) {
  const sum = a.reduce((total, value, index) => total + ((value - b[index]) ** 2), 0);
  return Math.sqrt(sum);
}

function confidenceFromDistances(sortedDistances) {
  const best = sortedDistances[0].distance;
  const second = sortedDistances[1]?.distance ?? best + 1;
  const separation = second - best;
  return Number(Math.max(0.5, Math.min(0.98, 0.55 + separation)).toFixed(2));
}

export function predictRisk(model, input) {
  if (!model?.centroids) {
    throw new Error('Model artifact is missing centroids');
  }

  const features = buildFeatures(input);
  const vector = featureVector(features);
  const distances = model.labels
    .map((label) => ({
      label,
      distance: euclideanDistance(vector, model.centroids[label])
    }))
    .sort((a, b) => a.distance - b.distance);

  const risk = distances[0].label;
  const confidence = confidenceFromDistances(distances);

  return {
    risk,
    confidence,
    reasons: explainChange(input, features),
    distances: Object.fromEntries(
      distances.map((item) => [item.label, Number(item.distance.toFixed(4))])
    ),
    features,
    model: {
      version: model.version,
      type: model.type,
      trainedAt: model.trainedAt,
      trainingRecords: model.trainingRecords
    }
  };
}
