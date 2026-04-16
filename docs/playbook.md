# Model Engineering Playbook

## Goal

Build a small, explainable machine learning workflow that demonstrates how teams move from labeled data to a served prediction.

The demo problem is software change risk prediction:

```text
change metadata -> feature engineering -> trained model -> risk prediction
```

## Architecture

```text
Training Data
    |
    v
Feature Engineering
    |
    v
Train Model -> Evaluate -> Save Artifact
    |
    v
Prediction API -> UI / Scenario Runner -> Reports
```

## Data Contract

Each training or prediction record contains:

- `filesChanged`
- `linesAdded`
- `linesDeleted`
- `coveragePercent`
- `complexityScore`
- `previousDefects`
- `serviceCriticality`
- `hasDatabaseChange`
- `hasSecurityChange`

Training records also include:

- `riskLabel`: `low`, `medium`, or `high`

## Feature Engineering

The demo converts raw fields into normalized features:

- change size
- coverage risk
- complexity risk
- defect history risk
- criticality score
- database change flag
- security change flag

Feature engineering is intentionally separate from model training so it can be tested and evolved independently.

## Model Choice

This PoC uses a simple centroid classifier:

1. Convert each labeled training record into a feature vector.
2. Compute the average vector for each risk class.
3. For a new change, compute distance to each class centroid.
4. Pick the nearest class.
5. Convert relative distances into a confidence score.

Why this model:

- no external service required
- easy to explain
- deterministic
- interpretable enough for a PoC

## Prediction Explanation

The prediction includes contributing factors such as:

- large change size
- low test coverage
- high complexity
- previous defects
- critical service
- database change
- security-sensitive change

These are rule-based explanations based on the input features. In a production model, explanations could come from SHAP, feature importance, or model-specific explainability tools.

## Evaluation

The demo evaluator computes:

- total records
- correct predictions
- accuracy
- confusion matrix

For a real implementation, add:

- train/test split
- cross-validation
- precision/recall per class
- calibration checks
- post-release defect correlation

## Production Considerations

- Data quality matters more than model complexity.
- Labels must be trusted and consistently defined.
- Model artifacts should be versioned.
- Predictions should include confidence and explanation.
- Human review should remain in the loop for deployment decisions.
- Monitor drift in input features and prediction outcomes.

## How This Complements the Other Playbooks

- Generative AI: prompt/context -> structured output.
- RAG: source documents -> grounded answer.
- Agentic AI: workflow state -> coordinated multi-step output.
- Model Engineering: labeled data -> trained model -> prediction.
