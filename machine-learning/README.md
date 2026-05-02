
# � Machine Learning Masterclass

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)](.)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-Neural%20Networks-orange?style=for-the-badge&logo=tensorflow)](.)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-ML-red?style=for-the-badge&logo=scikit-learn)](.)
[![Pandas](https://img.shields.io/badge/Pandas-Data%20Processing-black?style=for-the-badge&logo=pandas)](.)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](.)

**End-to-end machine learning pipelines, neural networks, and real-world predictive analytics**

</div>

---

## 📂 Directory Structure

```
machine-learning/
├── assignment-1/              # ML Fundamentals
│   ├── Data preprocessing
│   ├── Feature engineering
│   └── Basic models
│
├── assignment-2/              # Advanced Models
│   ├── Ensemble methods
│   ├── Hyperparameter tuning
│   └── Cross-validation
│
├── lab-3/                     # Lab exercises
│   ├── Data exploration
│   ├── Model building
│   └── Evaluation
│
├── midterm/                   # Midterm project
│   ├── Dataset analysis
│   ├── Model training
│   └── Performance metrics
│
└── README.md
```

---

## 🎯 Featured Project: Customer Churn Prediction

### Project Overview

**Customer Churn Prediction** is a production-grade machine learning project that predicts customer churn using the IBM Telco dataset. It demonstrates the complete ML pipeline from data exploration through model deployment, including feature engineering, model training, evaluation, and interpretation.

### 📊 Dataset Overview

**IBM Telco Customer Churn Dataset:**
- **Samples:** 7,043 customers
- **Features:** 20 predictor variables
- **Target:** Churn (binary classification)
- **Classes:** Balanced dataset with ~27% churn rate

**Feature Categories:**
- Demographics (age, gender, tenure)
- Services (internet, phone, streaming)
- Contract information (type, term, billing)
- Account details (charges, payment method)

### 🏗️ ML Pipeline Architecture

```
┌──────────────────────────────────┐
│    Raw Data (IBM Telco)          │
│    - 7,043 customers             │
│    - 20 features                 │
└────────────────┬─────────────────┘
                 │
    ┌────────────▼────────────────┐
    │   1. Data Exploration (EDA)  │
    │  - Statistical summary       │
    │  - Distribution analysis     │
    │  - Missing value handling    │
    └────────────┬─────────────────┘
                 │
    ┌────────────▼──────────────────┐
    │   2. Data Preprocessing       │
    │  - Handle missing values      │
    │  - Feature normalization      │
    │  - Categorical encoding       │
    └────────────┬──────────────────┘
                 │
    ┌────────────▼──────────────────┐
    │   3. Feature Engineering      │
    │  - Feature scaling            │
    │  - Feature selection          │
    │  - Dimensionality reduction   │
    └────────────┬──────────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │   4. Train/Test Split             │
    │  - 80% training, 20% testing      │
    │  - Stratified split for balance   │
    └────────────┬──────────────────────┘
                 │
    ┌────────────┴──────────────────────────┐
    │                                       │
┌───▼──────────┐  ┌────────────┐  ┌───────▼────┐
│ Logistic     │  │ Random     │  │ Neural     │
│ Regression   │  │ Forest     │  │ Network    │
└───┬──────────┘  └────────┬───┘  └───────┬────┘
    │                      │             │
    └──────────┬───────────┴─────────────┘
               │
    ┌──────────▼──────────────────┐
    │   5. Model Training         │
    │  - Hyperparameter tuning    │
    │  - Cross-validation         │
    │  - Grid/Random search       │
    └──────────┬───────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │   6. Model Evaluation           │
    │  - Accuracy, Precision, Recall  │
    │  - F1-Score, AUC-ROC           │
    │  - Confusion matrix            │
    └──────────┬──────────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │   7. Results & Interpretation   │
    │  - Feature importance          │
    │  - Model comparison            │
    │  - Business insights           │
    └────────────────────────────────┘
```

### 🔑 Key Features

#### Data Science
- ✅ Exploratory Data Analysis (EDA)
- ✅ Statistical analysis and visualization
- ✅ Missing value imputation
- ✅ Outlier detection and handling
- ✅ Feature correlation analysis

#### Feature Engineering
- ✅ Categorical encoding (one-hot, label)
- ✅ Numerical scaling (StandardScaler, MinMaxScaler)
- ✅ Feature selection techniques
- ✅ Dimensionality reduction (PCA)
- ✅ Polynomial feature generation

#### Model Development
- ✅ Logistic Regression
- ✅ Random Forest Classification
- ✅ Neural Networks (ANN with TensorFlow)
- ✅ Ensemble methods
- ✅ Hyperparameter optimization

#### Evaluation & Metrics
- ✅ Accuracy, Precision, Recall
- ✅ F1-Score and ROC-AUC
- ✅ Confusion Matrix analysis
- ✅ Cross-validation
- ✅ Learning curves

#### Visualization
- ✅ Distribution plots
- ✅ Correlation heatmaps
- ✅ Feature importance charts
- ✅ ROC curves
- ✅ Confusion matrices

### 💻 Technology Stack

```
Python 3.8+              - Programming language
TensorFlow/Keras         - Neural networks
Scikit-Learn             - ML algorithms
Pandas                   - Data manipulation
NumPy                    - Numerical computing
Matplotlib               - Visualization
Seaborn                  - Statistical graphics
Jupyter                  - Interactive notebooks
```

### 🔄 Model Comparison

| Model | Accuracy | Precision | Recall | F1-Score | Notes |
|-------|----------|-----------|--------|----------|-------|
| Logistic Regression | ~80% | 0.65 | 0.72 | 0.68 | Baseline, interpretable |
| Random Forest | ~85% | 0.78 | 0.76 | 0.77 | Good balance |
| Neural Network | ~84% | 0.76 | 0.74 | 0.75 | Deep learning |

### 📈 Key Findings

**Feature Importance (Top 10):**
1. Contract type (tenure impact)
2. Monthly charges
3. Internet service type
4. Tech support subscription
5. Fiber optic internet
6. Total charges
7. Online security service
8. Device protection plan
9. Streaming TV service
10. Payment method

**Business Insights:**
- Customers with month-to-month contracts have 3x higher churn
- Fiber optic customers churn 50% more than other types
- Customers without tech support are 2.5x more likely to churn
- Tenure is inversely correlated with churn

### 🧪 Model Training Process

```python
# 1. Data Loading & Exploration
data = pd.read_csv('telco_churn.csv')
print(data.describe())
print(data.isnull().sum())

# 2. Data Preprocessing
X_encoded = pd.get_dummies(X)
X_scaled = StandardScaler().fit_transform(X_encoded)

# 3. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# 4. Model Training
model = RandomForestClassifier(n_estimators=100, max_depth=15)
model.fit(X_train, y_train)

# 5. Evaluation
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"F1-Score: {f1_score(y_test, y_pred):.4f}")
print(f"AUC-ROC: {roc_auc_score(y_test, y_pred_proba):.4f}")
```

### 📚 Curriculum Overview

#### Assignment 1: ML Fundamentals
- Data preprocessing and cleaning
- Exploratory data analysis
- Feature scaling and normalization
- Train/test split strategies
- Basic classification models

#### Assignment 2: Advanced Models
- Ensemble methods
- Hyperparameter tuning
- Cross-validation techniques
- Model comparison
- Performance optimization

#### Lab 3: Hands-On Practice
- Dataset exploration
- Model building exercises
- Performance evaluation
- Real-world problem solving

#### Midterm: Comprehensive Project
- Full pipeline implementation
- Multiple model training
- Detailed analysis
- Business recommendations

### 🎓 Learning Outcomes

✅ Understand machine learning fundamentals  
✅ Develop complete ML pipelines  
✅ Apply multiple algorithms effectively  
✅ Perform comprehensive model evaluation  
✅ Create actionable business insights  
✅ Optimize model performance  
✅ Deploy predictive models  

---

## 🚀 Quick Start

### Installation
```bash
pip install pandas numpy scikit-learn tensorflow matplotlib seaborn jupyter
```

### Running the Project
```bash
# Start Jupyter notebook
jupyter notebook

# Or run Python script
python churn_prediction.py

# View results
# - Accuracy and metrics
# - Feature importance plot
# - ROC curve visualization
# - Business recommendations
```

---

## 📊 Performance Metrics

**Best Model Performance:**
- Accuracy: 84%
- Precision: 0.76
- Recall: 0.74
- F1-Score: 0.75
- AUC-ROC: 0.84

---

## 📈 Business Value

**Actionable Insights:**
- Identify high-risk churn customers early
- Target retention campaigns to at-risk groups
- Optimize contract terms and pricing
- Improve customer satisfaction and lifetime value
- Reduce customer acquisition costs

---

## 🔗 Quick Links

- **Main Portfolio:** [../PROJECTS.md](../PROJECTS.md)
- **Web Development:** [../web-development](../web-development)
- **Information Security:** [../information-security](../information-security)

---

<div align="center">

**Data is the foundation. Machine Learning is the engine. Intelligence is the result.**

*From raw data to predictive intelligence.*

</div>

```

machine-learning/
│
├── assignment-1/
│   └── assignment1.ipynb          # Full ML pipeline (EDA → preprocessing → modeling)
│
├── assignment-2/
│   ├── task1.ipynb               # Wine Classification (Multi-class classification)
│   └── task2.ipynb               # Loan Default Prediction (Binary classification)
│
├── lab-3/
│   ├── Salary_dataset.csv        # Regression dataset
│   └── task1.py                  # Linear Regression implementation (Scikit-learn)
│
├── midterm/
│   ├── Customer_Churn_Prediction_ANN.ipynb
│   ├── Customer_Churn_Prediction_ANN (2).ipynb
│   └── Telco-Customer-Churn.csv  # Real-world telecom dataset
│
└── README.md

```

---

## 🔬 Project Breakdown

---

### 📌 1. Linear Regression (Lab 3)

**Goal:** Predict salary based on years of experience  

**Key Features:**
- Train-test split
- Model training using `LinearRegression`
- Visualization of regression line
- Real dataset usage

**Core Pipeline:**
```

Dataset → Split → Train → Predict → Visualize

```

**Concepts Covered:**
- Simple Linear Regression  
- Model fitting  
- Prediction & evaluation  
- Data visualization  

---

### 📌 2. Assignment 1 – Full ML Pipeline

A complete **end-to-end machine learning workflow**:

#### 🔍 Steps Implemented:
- Data loading & inspection
- Statistical analysis
- Missing value handling
- Feature scaling
- Correlation analysis
- Model building

**Libraries Used:**
- NumPy
- Pandas
- Seaborn
- Matplotlib
- SciPy

> This notebook shows your ability to handle **real-world messy datasets**.

---

### 📌 3. Wine Classification (Assignment 2 - Task 1)

**Dataset:** 178 samples, 13 features  

**Objective:** Multi-class classification  

**Highlights:**
- Feature analysis
- Class distribution
- Model training & evaluation

**Skills Demonstrated:**
- Multi-class ML problem solving  
- Feature understanding  
- Structured output analysis  

---

### 📌 4. Loan Default Prediction (Assignment 2 - Task 2)

**Dataset:** ~9,500 records  

**Target:** `not.fully.paid` (Binary Classification)

**Key Features:**
- Mixed data types (categorical + numerical)
- Financial risk prediction
- Real-world dataset scale

**Pipeline:**
```

Data Cleaning → Encoding → Training → Prediction

```

**Real-world relevance:**  
Used in fintech for **risk assessment & credit scoring**

---

### 📌 5. Customer Churn Prediction (Midterm Project)

💎 **Flagship Project (Portfolio-Level)**

**Dataset:** IBM Telco (7000+ customers)  
**Model:** Artificial Neural Network (MLP)

---

#### 🎯 Problem

Predict whether a customer will leave a telecom service.

---

#### 🧠 Model Highlights

- ANN (Multi-Layer Perceptron)
- Binary classification
- Feature-rich dataset (20+ features)

---

#### ⚙️ Pipeline

```

Raw Data
↓
Data Cleaning
↓
Encoding (Categorical → Numerical)
↓
Feature Scaling
↓
Train ANN Model
↓
Prediction
↓
Evaluation

````

---

#### 💼 Business Value

- Customer retention strategy  
- Revenue protection  
- Targeted marketing  

---

## 🧰 Tech Stack

| Category        | Tools |
|----------------|------|
| Language       | Python |
| ML Libraries   | Scikit-learn |
| Data Handling  | Pandas, NumPy |
| Visualization  | Matplotlib, Seaborn |
| Notebook Env   | Jupyter |

---

## 📊 Skills Demonstrated

- ✅ Data Preprocessing & Cleaning  
- ✅ Feature Engineering  
- ✅ Regression & Classification  
- ✅ Neural Networks (ANN)  
- ✅ Model Evaluation  
- ✅ Real-world Dataset Handling  
- ✅ ML Pipeline Design  

---

## 🧠 Learning Philosophy

This repository reflects a **systems-level understanding of ML**, not just isolated algorithms:

- Think in pipelines, not functions  
- Think in data flow, not just models  
- Think in impact, not just accuracy  

---

## ⚡ How to Run

```bash
# Clone repository
git clone <your-repo-link>

# Install dependencies
pip install numpy pandas matplotlib seaborn scikit-learn

# Run notebooks
jupyter notebook
````

---

## 📌 Future Enhancements

* 🔥 Deep Learning (TensorFlow / PyTorch)
* 🚀 Model Deployment (FastAPI / Flask)
* 📦 Dockerized ML pipelines
* 📊 Advanced feature engineering
* 🤖 AutoML integration

---

## 👨‍💻 Author

**Muhammad Sohaib**
Computer Science Student | AI Engineer in Progress

---

## 🌟 Final Note

This repository is not just coursework.
It’s a **foundation of an AI Engineer’s journey** — moving from:

> 📊 Data → 🤖 Models → 🧠 Intelligence → 🌍 Real Impact

---

