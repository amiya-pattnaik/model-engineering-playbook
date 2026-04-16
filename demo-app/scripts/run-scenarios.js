import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadModel } from '../src/services/model-store.js';
import { predictRisk } from '../src/services/predictor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenariosDir = path.join(__dirname, '../scenarios');
const reportsDir = path.join(__dirname, '../reports');

fs.mkdirSync(reportsDir, { recursive: true });

function loadScenarios(args) {
  if (args.length === 0) {
    return fs.readdirSync(scenariosDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => path.join(scenariosDir, file));
  }

  return args
    .map((arg) => (arg.endsWith('.json') ? arg : `${arg}.json`))
    .map((arg) => {
      if (path.isAbsolute(arg)) return arg;
      if (arg.startsWith('scenarios/')) return path.join(__dirname, '..', arg);
      return path.join(scenariosDir, arg);
    });
}

function renderMarkdown(run) {
  return [
    `# Scenario: ${run.scenario}`,
    '',
    `- Expected Risk: ${run.expectedRisk || 'n/a'}`,
    `- Predicted Risk: ${run.prediction.risk}`,
    `- Confidence: ${run.prediction.confidence}`,
    `- Pass: ${run.pass}`,
    '',
    '## Reasons',
    '',
    ...run.prediction.reasons.map((reason) => `- ${reason}`),
    '',
    '## Full Prediction',
    '',
    '```json',
    JSON.stringify(run.prediction, null, 2),
    '```',
    ''
  ].join('\n');
}

function runScenario(filePath, model) {
  const scenario = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const start = Date.now();
  const prediction = predictRisk(model, scenario.change);
  const latencyMs = Date.now() - start;
  const pass = scenario.expectedRisk ? prediction.risk === scenario.expectedRisk : null;

  const run = {
    scenario: scenario.name || path.basename(filePath, '.json'),
    expectedRisk: scenario.expectedRisk,
    pass,
    latency_ms: latencyMs,
    change: scenario.change,
    prediction
  };

  const baseName = run.scenario.replace(/\s+/g, '-').toLowerCase();
  fs.writeFileSync(path.join(reportsDir, `${baseName}.json`), JSON.stringify(run, null, 2));
  fs.writeFileSync(path.join(reportsDir, `${baseName}.md`), renderMarkdown(run));

  console.log(`${pass === false ? 'x' : '✓'} ${run.scenario}: ${prediction.risk} (${prediction.confidence})`);
}

const model = loadModel();
const files = loadScenarios(process.argv.slice(2));

for (const file of files) {
  runScenario(file, model);
}
