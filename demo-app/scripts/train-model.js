import { getModelPath, trainAndSaveModel } from '../src/services/model-store.js';

const result = trainAndSaveModel();

console.log(`Model saved to ${getModelPath()}`);
console.log(`Records: ${result.model.trainingRecords}`);
console.log(`Accuracy: ${result.evaluation.accuracy}`);
console.log(JSON.stringify(result.evaluation.confusionMatrix, null, 2));
