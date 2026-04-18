import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { trainModel } from './trainer.js';
import { trainCartModel } from './trainer-cart.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.join(__dirname, '../..');

const modelPaths = {
  manual: path.join(appRoot, process.env.MODEL_PATH || 'models/risk-model.json'),
  cart: path.join(appRoot, process.env.CART_MODEL_PATH || 'models/risk-model-cart.json')
};
const trainingDataPath = path.join(appRoot, 'data/training-data.json');

function normalizeEngine(engine = 'manual') {
  return engine === 'cart' ? 'cart' : 'manual';
}

function getTrainer(engine) {
  return normalizeEngine(engine) === 'cart' ? trainCartModel : trainModel;
}

export function loadTrainingData() {
  return JSON.parse(fs.readFileSync(trainingDataPath, 'utf-8'));
}

export function saveModel(model, engine = 'manual') {
  const modelPath = getModelPath(engine);
  fs.mkdirSync(path.dirname(modelPath), { recursive: true });
  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2));
}

export function loadModel(engine = 'manual') {
  const modelPath = getModelPath(engine);
  if (!fs.existsSync(modelPath)) {
    const { model } = getTrainer(engine)(loadTrainingData());
    saveModel(model, engine);
    return model;
  }

  return JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
}

export function trainAndSaveModel(engine = 'manual') {
  const trainingData = loadTrainingData();
  const result = getTrainer(engine)(trainingData);
  saveModel(result.model, engine);
  return result;
}

export function getModelPath(engine = 'manual') {
  return modelPaths[normalizeEngine(engine)];
}
