import os
import pickle
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

EMBEDDINGS_FILE = os.path.join("..", "embeddings", "embeddings.pkl")
MODEL_OUTPUT_FILE = os.path.join("trained_model.pkl")

def main():
    # Load embeddings
    with open(EMBEDDINGS_FILE, "rb") as f:
        data = pickle.load(f)

    X = np.array(data["embeddings"])
    y = np.array(data["labels"])

    print(f"Loaded {len(X)} embeddings for {len(set(y))} people")

    # Encode string labels (s01, s02...) into numbers
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # Split into train/test to evaluate accuracy
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42
    )

    # Train SVM
    clf = SVC(kernel="linear", probability=True)
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(
        y_test, y_pred, target_names=label_encoder.classes_
    ))

    # Save model + label encoder together
    with open(MODEL_OUTPUT_FILE, "wb") as f:
        pickle.dump({"model": clf, "label_encoder": label_encoder}, f)

    print(f"Model saved to {MODEL_OUTPUT_FILE}")

if __name__ == "__main__":
    main()