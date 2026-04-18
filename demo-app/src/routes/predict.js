import express from 'express';
import { loadModel } from '../services/model-store.js';
import { predictRisk } from '../services/predictor.js';
import { predictRiskCart } from '../services/predictor-cart.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const start = Date.now();
    const engine = req.query.engine === 'cart' || req.body?.engine === 'cart' ? 'cart' : 'manual';
    const model = loadModel(engine);
    const prediction = engine === 'cart'
      ? predictRiskCart(model, req.body || {})
      : predictRisk(model, req.body || {});

    res.json({
      runId: `pred_${start}`,
      engine,
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
