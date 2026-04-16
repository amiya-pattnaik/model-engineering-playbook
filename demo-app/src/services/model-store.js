import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { trainModel } from './trainer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.join(__dirname, '../..');

const modelPath = path.join(appRoot, process.env.MODEL_PATH || 'models/risk-model.json');
const trainingDataPath = path.join(appRoot, 'data/training-data.json');

export function loadTrainingData() {
  return JSON.parse(fs.readFileSync(trainingDataPath, 'utf-8'));
}

export function saveModel(model) {
  fs.mkdirSync(path.dirname(modelPath), { recursive: true });
  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2));
}

export function loadModel() {
  if (!fs.existsSync(modelPath)) {
    const { model } = trainModel(loadTrainingData());
    saveModel(model);
    return model;
  }

  return JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
}

export function trainAndSaveModel() {
  const trainingData = loadTrainingData();
  const result = trainModel(trainingData);
  saveModel(result.model);
  return result;
}

export function getModelPath() {
  return modelPath;
}
