# Model Engineering Playbook — Demo (Node.js)

Small, runnable repository that demonstrates a practical model engineering workflow for engineering/QA/platform teams.

This playbook builds a simple **software change risk prediction model**. Given change metadata such as files changed, lines added, coverage, complexity, and previous defects, the app predicts whether the change is `low`, `medium`, or `high` risk.

This repo supports two model paths:
- `manual`: a simple centroid classifier that shows the fundamentals clearly.
- `ml-cart v2`: a framework-backed decision tree classifier using `ml-cart`.

## What You Get

- `docs/playbook.md` with the model engineering workflow.
- `demo-app/` with a web UI, training endpoint, prediction endpoint, scenarios, and reports.
- A small interpretable manual model that can be trained locally without external services.
- A framework-backed v2 model using `ml-cart` for comparison.
- Scenario runner for repeatable demo/evaluation runs.

## Concept Primer: What Is Model Engineering?

Model engineering is the lifecycle around building and operating predictive models:

1. Prepare data.
2. Engineer features.
3. Train a model.
4. Evaluate the model.
5. Save a model artifact.
6. Serve predictions.
7. Monitor and improve behavior over time.

This differs from the GenAI/RAG/Agentic playbooks because the model is trained on labeled examples rather than prompted at runtime.

## Demo Scope

The demo predicts software delivery risk for a code change:

- `low`: small, well-tested, low complexity change.
- `medium`: moderate size or mixed risk signals.
- `high`: large, low-coverage, high-complexity, or defect-prone change.

The model is intentionally simple and interpretable so the workflow is easy to explain.

## Quick Start

```bash
cd demo-app
npm install
npm run train
npm run dev
# open http://localhost:3000
```

## End-to-End Flow

1. Training data is loaded from `demo-app/data/training-data.json`.
2. Feature engineering normalizes change metadata into numeric model features.
3. Trainer computes class centroids for `low`, `medium`, and `high` risk examples.
4. Evaluator scores the trained model on the sample dataset.
5. Model artifact is saved to `demo-app/models/risk-model.json`.
6. UI/API sends a change payload to `POST /api/predict`.
7. Predictor returns risk, confidence, contributing factors, and model metadata.

## Manual vs ml-cart v2

The manual path is the baseline implementation:

```text
training examples -> feature vectors -> low/medium/high centroids -> nearest centroid prediction
```

The `ml-cart v2` path keeps the same input fields and API shape, but replaces the centroid classifier with a decision tree from `ml-cart`:

```text
training examples -> feature vectors -> decision tree -> class prediction
```

This mirrors the pattern used in the other AI playbooks:

- manual implementation first, to show fundamentals
- framework-backed v2 second, to show how the same workflow maps to a known library

## Simple Mental Model

This PoC is not an LLM prompt workflow. It is a small supervised model workflow.

```text
training-data.json = past examples with known risk
trainer.js         = learns the average pattern for low/medium/high
risk-model.json    = saved learned patterns
browser input      = new change to classify
predictor.js       = compares new change to learned patterns
```

The trainer does not learn like a neural network. It uses a simpler approach:

1. Convert each training record into numeric features.
2. Group records by `riskLabel`: `low`, `medium`, `high`.
3. Calculate the average feature vector for each group.
4. Save those averages as class centroids in `risk-model.json`.

Prediction is then:

```text
new browser input -> numeric features -> compare distance to each average -> choose closest risk
```

Short explanation:

> This PoC trains a simple interpretable classifier. It learns what low, medium, and high risk changes typically look like from sample data, then compares a new change against those learned patterns.

## What Happens When You Change Values in the Browser?

Changing values in the browser creates a new prediction input. It does **not** retrain the model.

Browser prediction flow:

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

Examples:
- More files changed, more lines changed, higher complexity, and lower coverage usually increase risk.
- `hasDatabaseChange = true` and `hasSecurityChange = true` usually increase risk.
- Lower complexity, high coverage, and fewer changed files usually reduce risk.

To change the actual model, update `training-data.json` and run:

```bash
npm run train
```

or click **Train model** in the browser.

## Why This Model Is Useful for a PoC

- It is easy to explain to engineering/QA leaders.
- It connects directly to release risk and testing strategy.
- It demonstrates data-to-model-to-serving lifecycle.
- It is interpretable, so predictions include reasons.

## Demo Commands

```bash
# train and save model
npm run train

# run API + UI
npm run dev

# run one scenario
npm run demo:scenario

# run all scenarios
npm run demo:scenarios

# syntax check
npm run lint
```

## Repo Layout

- `docs/playbook.md`: model lifecycle and extension guidance.
- `demo-app/data/training-data.json`: labeled sample training data.
- `demo-app/models/risk-model.json`: generated model artifact after training.
- `demo-app/src/services`: feature engineering, training, evaluation, model storage, prediction.
- `demo-app/src/routes`: `/api/train`, `/api/predict`, `/api/scenarios`.
- `demo-app/public/index.html`: simple UI with scenario picker.
- `demo-app/scenarios`: reusable prediction examples.
- `demo-app/reports`: generated scenario reports.

## Extend Quickly

- Replace sample data with real change history from GitHub/Jira/CI.
- Add features such as test failures, code ownership, deployment frequency, incident history, or service criticality.
- Replace the simple centroid classifier with logistic regression, decision trees, or TensorFlow.js.
- Add monitoring for prediction drift, confidence distribution, and post-release defect correlation.

Framework-backed v2 is available on the `feature/ml-cart-v2` branch. It uses `ml-cart` for a lightweight decision tree classifier while keeping the same training, prediction, scenario, and UI flow.

TensorFlow.js can still be added later as another branch if a neural-network style model is useful for comparison.

## Limitations

- Sample data is synthetic and intentionally small.
- The model is not meant to be production-grade.
- Confidence is a relative similarity score, not a calibrated probability.
- Real production use requires data quality checks, bias review, monitoring, and human approval.
