import { DecisionTreeClassifier } from 'ml-cart';
import { buildFeatures, featureVector } from './feature-engineering.js';
import { predictRiskCart } from './predictor-cart.js';

const LABELS = ['low', 'medium', 'high'];
const LABEL_TO_ID = Object.fromEntries(LABELS.map((label, index) => [label, index]));
const ID_TO_LABEL = Object.fromEntries(LABELS.map((label, index) => [index, label]));

function evaluateCartModel(model, records) {
  const confusionMatrix = Object.fromEntries(
    LABELS.map((actual) => [actual, Object.fromEntries(LABELS.map((predicted) => [predicted, 0]))])
  );

  let correct = 0;

  for (const record of records) {
    const prediction = predictRiskCart(model, record);
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

export function trainCartModel(records) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('Training data must be a non-empty array');
  }

  const features = [];
  const labels = [];

  for (const record of records) {
    if (!LABEL_TO_ID.hasOwnProperty(record.riskLabel)) {
      throw new Error(`Invalid riskLabel for ${record.id || 'record'}: ${record.riskLabel}`);
    }

    features.push(featureVector(buildFeatures(record)));
    labels.push(LABEL_TO_ID[record.riskLabel]);
  }

  const classifier = new DecisionTreeClassifier({
    gainFunction: 'gini',
    maxDepth: 6,
    minNumSamples: 1
  });

  classifier.train(features, labels);

  const model = {
    version: '0.1.0',
    type: 'ml-cart-decision-tree-classifier',
    engine: 'cart',
    labels: LABELS,
    labelToId: LABEL_TO_ID,
    idToLabel: ID_TO_LABEL,
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
    tree: classifier.toJSON(),
    trainedAt: new Date().toISOString(),
    trainingRecords: records.length
  };

  return {
    model,
    evaluation: evaluateCartModel(model, records)
  };
}
