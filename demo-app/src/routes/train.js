import express from 'express';
import { getModelPath, trainAndSaveModel } from '../services/model-store.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const start = Date.now();
    const result = trainAndSaveModel();

    res.json({
      runId: `train_${start}`,
      latency_ms: Date.now() - start,
      modelPath: getModelPath(),
      model: result.model,
      evaluation: result.evaluation
    });
  } catch (err) {
    res.status(500).json({
      error: 'training_failed',
      detail: err.message
    });
  }
});

export default router;
