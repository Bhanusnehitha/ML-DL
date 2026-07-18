import os
import cv2
import numpy as np
import pickle
from keras_facenet import FaceNet

embedder = FaceNet()

INPUT_DIR = os.path.join("..", "processed_faces")
OUTPUT_FILE = os.path.join("..", "embeddings", "embeddings.pkl")

def get_embedding(face_img):
    # keras_facenet expects RGB images
    face_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
    face_rgb = np.expand_dims(face_rgb, axis=0)  # add batch dimension
    embedding = embedder.embeddings(face_rgb)
    return embedding[0]  # 512-d vector

def main():
    data = {"embeddings": [], "labels": []}

    for person_name in os.listdir(INPUT_DIR):
        person_path = os.path.join(INPUT_DIR, person_name)
        if not os.path.isdir(person_path):
            continue

        for img_name in os.listdir(person_path):
            img_path = os.path.join(person_path, img_name)
            img = cv2.imread(img_path)

            if img is None:
                print(f"Could not read: {img_path}")
                continue

            embedding = get_embedding(img)
            data["embeddings"].append(embedding)
            data["labels"].append(person_name)
            print(f"Processed: {img_path}")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "wb") as f:
        pickle.dump(data, f)

    print(f"\nDone. Saved {len(data['embeddings'])} embeddings to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()