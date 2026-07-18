import cv2
import os
import math
from mtcnn import MTCNN

detector = MTCNN()

# paths relative to face_detection/ folder
INPUT_DIR = os.path.join("..", "gt_db")
OUTPUT_DIR = os.path.join("..", "processed_faces")
IMG_SIZE = (160, 160)   # standard size for FaceNet input later

def align_face(image, keypoints):
    left_eye = keypoints['left_eye']
    right_eye = keypoints['right_eye']

    dy = float(right_eye[1] - left_eye[1])
    dx = float(right_eye[0] - left_eye[0])
    angle = math.degrees(math.atan2(dy, dx))

    center = (image.shape[1] // 2, image.shape[0] // 2)
    rot_matrix = cv2.getRotationMatrix2D(center, angle, 1)
    aligned = cv2.warpAffine(image, rot_matrix, (image.shape[1], image.shape[0]))
    return aligned

def process_image(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return None

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = detector.detect_faces(img_rgb)

    if len(results) == 0:
        print(f"No face found: {img_path}")
        return None

    face = max(results, key=lambda r: r['box'][2] * r['box'][3])
    x, y, w, h = face['box']
    x, y = max(0, x), max(0, y)

    aligned_img = align_face(img, face['keypoints'])

    aligned_rgb = cv2.cvtColor(aligned_img, cv2.COLOR_BGR2RGB)
    results2 = detector.detect_faces(aligned_rgb)
    if len(results2) == 0:
        cropped = aligned_img[y:y+h, x:x+w]
    else:
        face2 = max(results2, key=lambda r: r['box'][2] * r['box'][3])
        x2, y2, w2, h2 = face2['box']
        x2, y2 = max(0, x2), max(0, y2)
        cropped = aligned_img[y2:y2+h2, x2:x2+w2]

    if cropped.size == 0:
        return None

    resized = cv2.resize(cropped, IMG_SIZE)
    return resized

def main():
    for person_name in os.listdir(INPUT_DIR):
        person_path = os.path.join(INPUT_DIR, person_name)
        if not os.path.isdir(person_path):
            continue

        out_person_path = os.path.join(OUTPUT_DIR, person_name)
        os.makedirs(out_person_path, exist_ok=True)

        for img_name in os.listdir(person_path):
            img_path = os.path.join(person_path, img_name)
            processed = process_image(img_path)

            if processed is not None:
                save_path = os.path.join(out_person_path, img_name)
                cv2.imwrite(save_path, processed)
                print(f"Saved: {save_path}")
            else:
                print(f"Skipped: {img_path}")

if __name__ == "__main__":
    main()