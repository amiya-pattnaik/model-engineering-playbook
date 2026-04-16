import { predictRisk } from './predictor.js';

export function evaluateModel(model, records) {
  const labels = model.labels || ['low', 'medium', 'high'];
  const confusionMatrix = Object.fromEntries(
    labels.map((actual) => [actual, Object.fromEntries(labels.map((predicted) => [predicted, 0]))])
  );

  let correct = 0;

  for (const record of records) {
    const prediction = predictRisk(model, record);
    confusionMatrix[record.riskLabel][prediction.risk] += 1;
    if (prediction.risk === record.riskLabel) correct += 1;
  }

  return {
    total: records.length,
    correct,
    accuracy: Number((correct / records.length).toFixed(3)),
    confusionMatrix
  };
}
