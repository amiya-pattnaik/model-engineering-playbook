import express from 'express';
import { getModelPath, trainAndSaveModel } from '../services/model-store.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const start = Date.now();
    const engine = req.query.engine === 'cart' || req.body?.engine === 'cart' ? 'cart' : 'manual';
    const result = trainAndSaveModel(engine);

    res.json({
      runId: `train_${start}`,
      engine,
      latency_ms: Date.now() - start,
      modelPath: getModelPath(engine),
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
