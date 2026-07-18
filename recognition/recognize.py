import sys
import os
sys.path.append(os.path.join("..", "alert_system"))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
from alert_system.alert import trigger_alert

import cv2
import pickle
import numpy as np
from keras_facenet import FaceNet

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_FILE = os.path.join(BASE_DIR, "model", "trained_model.pkl")
IMG_SIZE = (160, 160)
CONFIDENCE_THRESHOLD = 0.50

latest_result = {
    "name": "",
    "confidence": 0.0,
    "status": "unknown"
}

# Load Haar Cascade
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Load FaceNet
embedder = FaceNet()

# Load trained model
with open(MODEL_FILE, "rb") as f:
    data = pickle.load(f)

clf = data["model"]
label_encoder = data["label_encoder"]


def get_embedding(face_img):
    face_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
    face_rgb = cv2.resize(face_rgb, IMG_SIZE)
    face_rgb = np.expand_dims(face_rgb, axis=0)
    embedding = embedder.embeddings(face_rgb)
    return embedding[0]


def find_camera():
    for i in range(5):
        # Try default backend
        cap = cv2.VideoCapture(i)

        if cap.isOpened():
            ret, frame = cap.read()

            if ret:
                print(f"Using camera index {i}")
                return cap

            cap.release()

    return None


def start_recognition():

    print("STEP1")

    cap = find_camera()

    print("STEP2")

    if cap is None:
        print("Cannot access webcam.")
        return

    print("STEP3")

    print("STEP4")

    print("STEP5")
    print("Starting recognition... Press 'q' to quit.")

    while True:

        print("\n==============================")
        print("Inside Loop")

        ret, frame = cap.read()

        print("ret =", ret)

        if not ret:
            print("Frame not received")
            continue

        print("Frame received")

        frame = cv2.flip(frame, 1)

        print("Before cvtColor")
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        print("After cvtColor")

        print("Before detectMultiScale")

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.05,
            minNeighbors=3,
            minSize=(20, 20)
        )

        print("After detectMultiScale")
        print("Faces detected:", len(faces))

        for (x, y, w, h) in faces:

            print("Processing detected face...")

            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

            face_crop = frame[y:y+h, x:x+w]

            if face_crop.size == 0:
                print("Empty face crop")
                continue

            print("Generating embedding...")

            embedding = get_embedding(face_crop)
            embedding = embedding.reshape(1, -1)

            print("Predicting...")

            probs = clf.predict_proba(embedding)[0]

            best_idx = np.argmax(probs)
            confidence = probs[best_idx]

            predicted_name = label_encoder.inverse_transform([best_idx])[0]

            print("=" * 40)
            print("Predicted :", predicted_name)
            print("Confidence:", confidence)
            print("=" * 40)

            if confidence >= CONFIDENCE_THRESHOLD:
                name = predicted_name
                color = (0, 255, 0)

                latest_result["name"] = name
                latest_result["confidence"] = float(confidence)
                latest_result["status"] = "known"

                trigger_alert(name, confidence, "known")

            else:
                name = "Unknown"
                color = (0, 0, 255)

                latest_result["name"] = name
                latest_result["confidence"] = float(confidence)
                latest_result["status"] = "unknown"

                trigger_alert(name, confidence, "unknown")

            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

            cv2.putText(
                frame,
                f"{name} ({confidence:.2f})",
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                color,
                2
            )

        print("Before imshow")

        cv2.imshow("Face Recognition & Alert System", frame)

        print("After imshow")

        key = cv2.waitKey(1)

        print("Key =", key)

        if key & 0xFF == ord('q'):
            print("Exiting...")
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    start_recognition()