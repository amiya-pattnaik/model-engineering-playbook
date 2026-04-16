import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import predictRouter from './routes/predict.js';
import trainRouter from './routes/train.js';
import scenariosRouter from './routes/scenarios.js';
import { trainAndSaveModel } from './services/model-store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api/predict', predictRouter);
app.use('/api/train', trainRouter);
app.use('/api/scenarios', scenariosRouter);

const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

app.listen(port, () => {
  const result = trainAndSaveModel();
  console.log(`Demo app listening on http://localhost:${port}`);
  console.log(`Model trained with ${result.model.trainingRecords} records. Accuracy: ${result.evaluation.accuracy}`);
});
