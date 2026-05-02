# ========================================
# Step 1: Import Required Libraries
# ========================================
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


# ========================================
# Step 2: Import the Dataset
# ========================================
dataset = pd.read_csv("e:\Semester 5\ML\Lab 3\Salary_dataset.csv")

# Independent Variable (Years of Experience)
X = dataset.iloc[:, :1].values

# Dependent Variable (Salary)
y = dataset.iloc[:, -1].values
print (X)
print(y)

# ========================================
# Step 3: Split Dataset into Training & Test Set
# ========================================
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=1/3, random_state=0
)

# Display split data
print("X_train:\n", X_train)
print("y_train:\n", y_train)
print("X_test:\n", X_test)
print("y_test:\n", y_test)


# ========================================
# Step 4: Train the Simple Linear Regression Model
# ========================================
from sklearn.linear_model import LinearRegression

regressor = LinearRegression()
regressor.fit(X_train, y_train)


# ========================================
# Step 5: Predict the Test Set Results
# ========================================
y_pred = regressor.predict(X_test)


# ========================================
# Step 6: Visualize Training Set Results
# ========================================
plt.scatter(X_train, y_train, color='red')
plt.plot(X_train, regressor.predict(X_train), color='blue')
plt.title('Salary vs Experience (Training Set)')
plt.xlabel('Years of Experience')
plt.ylabel('Salary')
plt.show()


# ========================================
# Step 7: Visualize Test Set Results
# ========================================
plt.scatter(X_test, y_test, color='red')
plt.plot(X_train, regressor.predict(X_train), color='blue')
plt.title('Salary vs Experience (Test Set)')
plt.xlabel('Years of Experience')
plt.ylabel('Salary')
plt.show()


# ========================================
# Step 8: Visualize Test Results Using Predictions
# ========================================
plt.scatter(X_test, y_test, color='red')
plt.plot(X_test, y_pred, color='blue')
plt.title('Salary vs Experience (Predicted Results)')
plt.xlabel('Years of Experience')
plt.ylabel('Salary')
plt.show()


# ========================================
# Step 9: Make a Single Prediction
# ========================================
single_prediction = regressor.predict([[12]])
print("Predicted Salary for 12 years experience:", single_prediction)


# ========================================
# Step 10: Display Model Parameters
# ========================================
coefficient = regressor.coef_
intercept = regressor.intercept_

print("Coefficient (Slope):", coefficient)
print("Intercept:", intercept)


# ========================================
# Step 11: Extra Practice – Manual vs Auto Prediction
# ========================================
manual_prediction = intercept + coefficient[0] * 15
print("Manual Prediction for 15 years:", manual_prediction)

auto_prediction = regressor.predict([[15]])
print("Auto Prediction for 15 years:", auto_prediction)
