# Demo App: Change Risk Predictor

Small Node.js app that demonstrates the model engineering lifecycle:

```text
training data -> feature engineering -> train model -> evaluate -> serve prediction
```

This demo predicts software change risk as `low`, `medium`, or `high` based on fields such as files changed, lines added/deleted, test coverage, complexity, previous defects, service criticality, database changes, and security changes.

The app supports two model engines:
- `manual`: a centroid classifier that shows the model mechanics directly.
- `cart`: an `ml-cart` decision tree classifier for a framework-backed v2 path.

## Run Locally

```bash
cd demo-app
npm install
npm run train
npm run train:v2
npm run dev
# open http://localhost:3000
```

## What the App Does

- Trains a simple centroid classifier from `data/training-data.json`.
- Trains an `ml-cart` decision tree classifier for v2 comparison.
- Saves a model artifact to `models/risk-model.json`.
- Saves the v2 model artifact to `models/risk-model-cart.json`.
- Serves predictions through `POST /api/predict`.
- Exposes `POST /api/train` to retrain from the browser.
- Loads reusable demo scenarios from `scenarios/*.json`.
- Writes scenario reports to `reports/`.

## Simple Mental Model

This PoC is not an LLM prompt workflow. It is a small supervised model workflow.

```text
training-data.json = past examples with known risk
trainer.js         = learns the average pattern for low/medium/high
risk-model.json    = saved learned patterns
browser input      = new change to classify
predictor.js       = compares new change to learned patterns
```

Short explanation:

> This PoC trains a simple interpretable classifier. It learns what low, medium, and high risk changes typically look like from sample data, then compares a new change against those learned patterns.

## Startup Flow

When you run:

```bash
npm run dev
```

the server starts from `src/server.js`.

Startup sequence:

1. Express server starts.
2. API routes are registered:
   - `POST /api/predict`
   - `POST /api/train`
   - `GET /api/scenarios`
3. Static UI is served from `public/index.html`.
4. The manual model is trained from `data/training-data.json`.
5. The `ml-cart v2` model is trained from the same data.
6. Model artifacts are saved to `models/risk-model.json` and `models/risk-model-cart.json`.

So every server restart refreshes the demo model from the sample training data.

## Training Flow

Training data lives in:

```text
data/training-data.json
```

Each training record has input fields plus a known answer:

```json
{
  "filesChanged": 12,
  "linesAdded": 650,
  "coveragePercent": 61,
  "complexityScore": 8,
  "previousDefects": 3,
  "serviceCriticality": "high",
  "hasDatabaseChange": true,
  "hasSecurityChange": false,
  "riskLabel": "high"
}
```

The trainer in `src/services/trainer.js` works like this:

1. Convert each training record into numeric features.
2. Group records by `riskLabel`: `low`, `medium`, `high`.
3. Calculate the average feature vector for each group.
4. Save those averages as class centroids in `models/risk-model.json`.

The model does not train like a neural network. It uses a simpler, interpretable centroid approach:

```text
average low-risk example     -> low centroid
average medium-risk example  -> medium centroid
average high-risk example    -> high centroid
```

The `cart` engine uses a decision tree instead:

```text
training examples -> feature vectors -> ml-cart decision tree -> low/medium/high prediction
```

Both engines use the same raw data and feature engineering layer.

## Feature Engineering Flow

Feature engineering happens in:

```text
src/services/feature-engineering.js
```

Raw input fields are converted into normalized numeric features:

| Raw Field | Feature |
|---|---|
| `linesAdded + linesDeleted` | `changeSize` |
| `filesChanged` | `fileSpread` |
| `coveragePercent` | `coverageRisk` |
| `complexityScore` | `complexityRisk` |
| `previousDefects` | `defectHistoryRisk` |
| `serviceCriticality` | `criticalityRisk` |
| `hasDatabaseChange` | `databaseRisk` |
| `hasSecurityChange` | `securityRisk` |

Example:

```text
lower coveragePercent -> higher coverageRisk
higher complexityScore -> higher complexityRisk
```

This step matters because the model compares numbers, not raw form labels.

## Prediction Flow

When you click **Predict risk** in the browser:

```text
form values
   |
   v
POST /api/predict
   |
   v
feature-engineering.js converts fields into numeric features
   |
   v
predictor.js compares features to low/medium/high centroids
   |
   v
API returns risk + confidence + reasons
   |
   v
UI renders the result
```

The prediction code is in:

```text
src/services/predictor.js
```

It calculates the distance between the new change and each saved centroid:

```text
new change -> distance to low centroid
new change -> distance to medium centroid
new change -> distance to high centroid
```

The closest centroid becomes the predicted risk.

## What Happens When You Change Browser Values?

Changing values in the browser creates a new prediction input. It does **not** retrain the model.

Examples:

- More files changed, more lines changed, higher complexity, and lower coverage usually increase risk.
- `hasDatabaseChange = true` and `hasSecurityChange = true` usually increase risk.
- Lower complexity, high coverage, and fewer changed files usually reduce risk.

To change the actual model, update `data/training-data.json` and run:

```bash
npm run train
```

or click **Train model** in the browser.

## Train Model Button

When you click **Train model**, the browser calls:

```text
POST /api/train
```

That route:

1. Loads `data/training-data.json`.
2. Rebuilds the centroid model.
3. Saves `models/risk-model.json`.
4. Returns evaluation metrics such as accuracy and confusion matrix.

So:

```text
Predict risk = use the current saved model
Train model  = rebuild the model from training data
```

## Scenario Picker Flow

Scenario files live in:

```text
scenarios/*.json
```

When the browser loads:

1. UI calls `GET /api/scenarios`.
2. Server reads scenario JSON files.
3. Scenario dropdown is populated.
4. Selecting a scenario fills the form.
5. Clicking **Predict risk** sends that scenario to `/api/predict`.

Scenarios are reusable demo inputs. They do not train the model.

## Scenario Runner

Run one scenario:

```bash
npm run demo:scenario
```

Run all scenarios:

```bash
npm run demo:scenarios
```

Run the `ml-cart v2` scenario path:

```bash
npm run demo:scenario:v2
npm run demo:scenarios:v2
```

Reports are written to `reports/` as JSON and Markdown.

The scenario runner is useful for repeatable demos and lightweight model checks.

## Main Files

- `src/server.js`: Express server and startup training.
- `src/services/feature-engineering.js`: validates and normalizes raw change data.
- `src/services/trainer.js`: trains class centroids from labeled records.
- `src/services/trainer-cart.js`: trains the `ml-cart` decision tree model.
- `src/services/evaluator.js`: computes accuracy and confusion matrix.
- `src/services/predictor.js`: predicts risk and returns reasons.
- `src/services/predictor-cart.js`: predicts risk through the `ml-cart` model.
- `src/services/model-store.js`: loads/saves model artifacts.
- `src/routes/predict.js`: prediction API.
- `src/routes/train.js`: training API.
- `src/routes/scenarios.js`: scenario API.
- `public/index.html`: browser demo UI.

## Commands

```bash
# train and save model
npm run train

# train and save ml-cart v2 model
npm run train:v2

# run API + UI
npm run dev

# run one scenario
npm run demo:scenario

# run all scenarios
npm run demo:scenarios

# run ml-cart v2 scenarios
npm run demo:scenarios:v2

# syntax check
npm run lint
```

## Notes

- This is an interpretable PoC, not a production model.
- Confidence is based on relative centroid distance, not calibrated probability.
- Replace sample data with real historical change data before using this pattern for actual release decisions.
