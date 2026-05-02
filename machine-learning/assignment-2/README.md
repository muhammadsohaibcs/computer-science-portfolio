# Machine Learning Classification Tasks — Assignment 2

## Project Overview

Advanced machine learning classification assignment implementing **Naive Bayes classifiers** on two distinct datasets. Demonstrates supervised learning, data preprocessing, model comparison, evaluation metrics, and professional-grade visualizations.

---

## Task 1: Wine Classification System

### Problem Statement
Multi-class classification task: classify wines into three quality categories using chemical properties.

**Dataset:** scikit-learn Wine Dataset
- **Samples:** 178 wine instances
- **Features:** 13 chemical properties (alcohol, acidity, phenols, etc.)
- **Classes:** 3 wine types (class_0, class_1, class_2)
- **Distribution:** Balanced across all classes

### Implemented Classifiers

#### 1. Gaussian Naive Bayes
- **Assumption:** Features follow Gaussian (normal) distribution
- **Use Case:** Continuous features with no scaling required
- **Accuracy:** ~97% on test set (elite performance)
- **Advantage:** Works directly on original feature distributions

#### 2. Multinomial Naive Bayes
- **Preprocessing:** MinMaxScaler transforms features to [0, 1] range
- **Requirement:** Non-negative features for probability calculations
- **Accuracy:** ~81% on test set (baseline comparison)
- **Note:** Lower performance due to feature distribution assumptions

### Data Pipeline

```
1. Load wine dataset from sklearn
2. Extract features (X) and target (y)
3. Stratified train-test split (75% train, 25% test)
4. Train two separate models:
   - GaussianNB: Direct on original data
   - MultinomialNB: After MinMaxScaler normalization
5. Generate predictions and probability estimates
6. Evaluate using multiple metrics
```

### Evaluation Metrics

**Per-Model Evaluation:**
- Accuracy score
- Precision, Recall, F1-score (per class)
- Confusion matrix (3x3)
- Sample predictions on first 10 test instances

**Cross-Model Comparison:**
- Gaussian NB vs. Multinomial NB accuracy
- Winner selection based on test performance

### Feature Analysis

- **Feature Variance:** Sorted bar chart showing which features vary most
- **Feature Distributions:** Histograms by class for top features (alcohol, flavanoids)
- **Class Separation:** Visual inspection of distribution overlap

### Visualizations (3×3 Grid)

1. **Class Distribution Bar Chart** — Instance count per wine type
2. **Model Accuracy Comparison** — Side-by-side accuracy bars with percentages
3. **Feature Variance Ranking** — Horizontal bar chart of feature variances
4. **Confusion Matrix - Gaussian NB** — 3×3 matrix with color heatmap (blue)
5. **Confusion Matrix - Multinomial NB** — 3×3 matrix with color heatmap (orange)
6. **Alcohol Distribution by Class** — Overlapping histograms showing class separation
7. **Flavanoids Distribution by Class** — Overlapping histograms
8. **GNB Prediction Probabilities** — Line plot of predicted class probabilities for first 20 test samples
9. **Dark Theme Styling** — Professional dark background (#0f1117) with white text and colored accents

### Key Implementation Details

```python
# Model Training
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

gnb = GaussianNB()
gnb.fit(X_train, y_train)
y_pred = gnb.predict(X_test)

# Evaluation
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred, target_names=target_names)
```

### Output Files
- **lab_task1_wine.png** — High-resolution (150 dpi) publication-ready visualization

---

## Task 2: Loan Default Prediction System

### Problem Statement
Binary classification: predict loan customers likely to **default (not fully pay)** their loans based on financial profile and credit history.

**Dataset:** Synthetically generated realistic loan data
- **Samples:** 9,578 loan records
- **Features:** 13 financial and credit indicators
- **Target:** not.fully.paid (0=Fully Paid, 1=Default)
- **Class Balance:** ~77% paid, ~23% default (realistic imbalance)

### Feature Set

#### Credit & Policy Features
- `credit.policy` — Binary (0/1): Customer adheres to credit policy
- `purpose` — Categorical: Loan purpose (debt consolidation, credit card, home improvement, etc.)

#### Loan Terms
- `int.rate` — Float: Loan interest rate (6%-24%)
- `installment` — Float: Monthly installment amount ($50-$900)

#### Income & Debt
- `log.annual.inc` — Float: Log-scaled annual income
- `dti` — Float: Debt-to-income ratio (0-35)

#### Credit History
- `fico` — Integer: FICO credit score (612-827)
- `days.with.cr.line` — Integer: Days with credit line (2-16+ years)
- `delinq.2yrs` — Integer: Delinquencies in past 2 years (0-3)
- `pub.rec` — Integer: Public records (0-2)

#### Revolving Credit
- `revol.bal` — Integer: Revolving account balance ($0-$120k)
- `revol.util` — Float: Revolving utilization percentage (0-119%)

#### Recent Inquiries
- `inq.last.6mths` — Integer: Credit inquiries last 6 months (0-9)

### Data Generation Strategy

Synthetic data created with realistic default probability rules:

```python
default_prob = (0.15                    # Base default rate
                + 0.15 * (int_rate > 0.15)      # High interest → default risk
                + 0.10 * (fico < 680)           # Low FICO → default risk
                + 0.08 * (credit_policy == 0)   # Non-compliant → default risk
                + 0.05 * (dti > 25)             # High debt ratio → default risk
                - 0.05 * (log_annual_inc > 11.5))  # High income → lower risk
default_prob = np.clip(default_prob, 0.05, 0.75)
```

### Classification Model

**Gaussian Naive Bayes Classifier**
- Assumes features are conditionally independent given class
- Assumes Gaussian distribution within each class
- Generates prediction probabilities for threshold optimization

### Data Preprocessing

1. **Encoding:** LabelEncoder transforms categorical `purpose` to numeric values
2. **Train-Test Split:** 70% train, 30% test (stratified)
3. **No Scaling:** Gaussian NB doesn't require feature scaling

### Model Evaluation

**Classification Metrics:**
- **Accuracy:** Overall correct predictions
- **Precision:** True positives / (True positives + False positives)
- **Recall:** True positives / (True positives + False negatives) — crucial for loan defaults
- **F1-Score:** Harmonic mean of precision and recall
- **Confusion Matrix:** True positives, true negatives, false positives, false negatives

**Probability Analysis:**
- Prediction probabilities for each test sample
- ROC curve with AUC score
- Probability calibration visualization

### Correlation Analysis

Features ranked by correlation with default outcome:
- Negative correlations: protective factors (income, FICO, credit policy)
- Positive correlations: risk factors (delinquencies, inquiries)

### Visualizations (3×3 Grid)

1. **Target Distribution Pie Chart** — Fully Paid vs. Default percentages
2. **FICO Score Distribution** — Overlapping histograms by payment status
3. **Interest Rate Distribution** — Overlapping histograms showing rate impact
4. **Default Rate by Purpose** — Horizontal bar chart, colored by risk level
5. **Confusion Matrix** — 2×2 matrix (Paid/Not Paid) with coolwarm colormap
6. **ROC Curve** — Sensitivity vs. 1-specificity with AUC annotation and filled area
7. **DTI vs. Interest Rate Scatter** — Colored by payment status (400 samples each)
8. **Predicted Probability Distribution** — Overlapping histograms showing model calibration with threshold line
9. **Dark Theme Styling** — Consistent dark background with professional color scheme

### Advanced Features

**ROC Analysis:**
- False Positive Rate vs. True Positive Rate curve
- Area Under Curve (AUC) metric for model discrimination ability
- Threshold visualization for decision optimization

**Feature Interaction Visualization:**
- 2D scatter plot: Debt-to-Income vs. Interest Rate
- Color-coded by actual payment status
- Shows decision boundary patterns

**Probability Calibration:**
- Distribution of predicted default probabilities
- Separated by actual payment status
- Shows model confidence alignment

### Key Implementation Details

```python
# Data Creation
n = 9578
np.random.seed(42)
# ... feature generation with realistic distributions ...

# Model Training
gnb = GaussianNB()
gnb.fit(X_train, y_train)
y_pred = gnb.predict(X_test)
y_prob = gnb.predict_proba(X_test)[:, 1]

# Evaluation
accuracy = accuracy_score(y_test, y_pred)
fpr, tpr, _ = roc_curve(y_test, y_prob)
roc_auc = auc(fpr, tpr)
```

### Output Files
- **lab_task2_loan.png** — High-resolution (150 dpi) publication-ready visualization

---

## Technical Stack

### Libraries Used

```python
# Data Manipulation
import numpy as np
import pandas as pd

# Machine Learning
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB
from sklearn.preprocessing import MinMaxScaler, LabelEncoder

# Evaluation Metrics
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
    roc_curve,
    auc
)

# Visualization
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
```

### Environment
- Python 3.7+
- scikit-learn (sklearn)
- NumPy, Pandas, Matplotlib
- Jupyter Notebook execution environment

---

## Learning Outcomes Achieved

### Concept Mastery

✅ **Naive Bayes Theory**
- Conditional probability and independence assumptions
- Gaussian, Multinomial, and Bernoulli variants
- Posterior probability calculation

✅ **Multi-Class Classification**
- One-vs-rest problem formulation
- Class separation and decision boundaries
- Multi-class metrics (precision, recall per class)

✅ **Binary Classification**
- Imbalanced dataset handling
- Threshold optimization strategies
- ROC analysis and AUC interpretation

✅ **Data Preprocessing**
- Feature scaling and normalization strategies
- Categorical encoding (LabelEncoder)
- Train-test splitting with stratification

✅ **Model Evaluation**
- Accuracy limitations and alternatives
- Confusion matrix interpretation
- Precision-Recall trade-offs
- ROC curves and AUC for threshold selection

### Implementation Skills

✅ **Scikit-learn Proficiency**
- Model training and prediction pipeline
- Preprocessing transformers (MinMaxScaler, LabelEncoder)
- Metrics calculation and visualization

✅ **Data Analysis**
- Exploratory data analysis with pandas
- Statistical summary generation
- Feature correlation analysis
- Class balance assessment

✅ **Professional Visualization**
- Multi-panel grid layouts with GridSpec
- Dark theme custom styling
- Color coding and legend management
- Publication-ready output formatting

✅ **Realistic Data Generation**
- Synthetic dataset creation with realistic distributions
- Feature correlation engineering
- Target variable generation with probability rules

---

## Performance Metrics Summary

### Task 1 - Wine Classification
| Model | Accuracy | Notes |
|-------|----------|-------|
| Gaussian NB | ~97% | **Best performer** - native feature distribution |
| Multinomial NB | ~81% | Lower due to scaling assumptions |

### Task 2 - Loan Default Prediction
| Metric | Value |
|--------|-------|
| Accuracy | Model dependent |
| ROC AUC | Ranges 0.6-0.9 depending on splits |
| Default Rate | 23% (realistic imbalance) |
| Train Samples | 6704 |
| Test Samples | 2874 |

---

## Code Quality & Best Practices

✅ Stratified sampling for class balance preservation
✅ Random seed (42) for reproducibility
✅ Separate preprocessing for each model variant
✅ Comprehensive evaluation metrics
✅ Professional visualization styling
✅ Descriptive variable naming conventions
✅ Clear code comments and sections
✅ Error handling (warnings suppressed appropriately)
✅ High-resolution output (150 dpi)

---

## What You Accomplished

✅ Implemented 2 complete ML classification pipelines
✅ Mastered Naive Bayes variants (Gaussian, Multinomial)
✅ Created realistic synthetic datasets with domain logic
✅ Performed comprehensive EDA and correlation analysis
✅ Generated publication-quality visualizations (9 plots per task)
✅ Applied model evaluation best practices
✅ Analyzed probability calibration and ROC curves
✅ Demonstrated feature engineering and preprocessing
✅ Professional dark-themed visualization design
✅ Reproducible ML experiments with random seeds

---

## Usage & Execution

### Running the Notebooks

Each notebook is self-contained and can be executed end-to-end:

```bash
# Task 1: Wine Classification
jupyter notebook task1.ipynb

# Task 2: Loan Default Prediction
jupyter notebook task2.ipynb
```

### Notebook Execution
- All imports and data generation are at the top
- Outputs print to console and save PNG files
- No external data files required
- Execution time: ~10-30 seconds per notebook

---

## Key Insights

### Wine Classification
- Gaussian NB achieves 97% accuracy — excellent feature separation
- Feature variance distribution is highly skewed — few dominant features
- Alcohol content and flavanoids are most discriminative
- Model confidently separates wine classes (see probability plots)

### Loan Default Prediction
- Default rate correlates strongly with FICO score and interest rate
- Debt-to-income ratio shows clear separation pattern
- DTI > 25 significantly increases default probability
- FICO < 680 is a major risk indicator
- Different loan purposes have varying default rates (student loans vs. cash advances)
- Model produces well-calibrated probabilities for threshold selection

---

## Future Enhancement Opportunities

- Cross-validation for more robust evaluation
- Feature importance ranking (via permutation or SHAP)
- Hyperparameter tuning (Laplace smoothing)
- Ensemble methods (voting, stacking)
- SMOTE for handling class imbalance
- Grid search for optimal decision thresholds
- Production deployment considerations

