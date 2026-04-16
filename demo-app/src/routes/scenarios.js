import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenariosDir = path.join(__dirname, '../../scenarios');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const scenarios = fs.readdirSync(scenariosDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const data = JSON.parse(fs.readFileSync(path.join(scenariosDir, file), 'utf-8'));
        return {
          name: data.name || path.basename(file, '.json'),
          expectedRisk: data.expectedRisk,
          change: data.change
        };
      });

    res.json({ scenarios });
  } catch (err) {
    res.status(500).json({
      error: 'scenario_load_failed',
      detail: err.message
    });
  }
});

export default router;
