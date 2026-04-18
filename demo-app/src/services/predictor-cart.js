import { DecisionTreeClassifier } from 'ml-cart';
import { buildFeatures, explainChange, featureVector } from './feature-engineering.js';

export function predictRiskCart(model, input) {
  if (!model?.tree) {
    throw new Error('CART model artifact is missing decision tree data');
  }

  const features = buildFeatures(input);
  const vector = featureVector(features);
  const classifier = DecisionTreeClassifier.load(model.tree);
  const predictedId = classifier.predict([vector])[0];
  const risk = model.idToLabel[String(predictedId)] || model.idToLabel[predictedId];

  return {
    risk,
    confidence: 0.9,
    reasons: explainChange(input, features),
    features,
    model: {
      version: model.version,
      type: model.type,
      engine: model.engine,
      trainedAt: model.trainedAt,
      trainingRecords: model.trainingRecords
    }
  };
}
