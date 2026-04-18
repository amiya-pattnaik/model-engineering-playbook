import { getModelPath, trainAndSaveModel } from '../src/services/model-store.js';

const engineArg = process.argv.find((arg) => arg.startsWith('--engine='));
const engine = engineArg?.split('=')[1] === 'cart' ? 'cart' : 'manual';
const result = trainAndSaveModel(engine);

console.log(`Engine: ${engine}`);
console.log(`Model saved to ${getModelPath(engine)}`);
console.log(`Records: ${result.model.trainingRecords}`);
console.log(`Accuracy: ${result.evaluation.accuracy}`);
console.log(JSON.stringify(result.evaluation.confusionMatrix, null, 2));
