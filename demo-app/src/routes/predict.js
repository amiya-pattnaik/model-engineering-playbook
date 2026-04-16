import express from 'express';
import { loadModel } from '../services/model-store.js';
import { predictRisk } from '../services/predictor.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const start = Date.now();
    const model = loadModel();
    const prediction = predictRisk(model, req.body || {});

    res.json({
      runId: `pred_${start}`,
      latency_ms: Date.now() - start,
      prediction
    });
  } catch (err) {
    res.status(400).json({
      error: 'prediction_failed',
      detail: err.message
    });
  }
});

export default router;
