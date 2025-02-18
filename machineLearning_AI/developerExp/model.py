from sklearn.linear_model import LogisticRegression
import joblib
import numpy as np

# Dummy training data:
# Features: [number of lines, average line length]
X_train = np.array([
    [20, 30],   # Example for Junior level
    [50, 45],   # Example for Mid-level
    [100, 60]   # Example for Senior level
])
# Labels: 0 = Junior, 1 = Mid-level, 2 = Senior
y_train = [0, 1, 2]

model = LogisticRegression()
model.fit(X_train, y_train)

# Save the model to model.pkl
joblib.dump(model, 'model.pkl')
print("Model trained and saved as model.pkl.")
