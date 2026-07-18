from flask import Flask, jsonify, request
from flask_cors import CORS
from recognition.recognize import start_recognition, latest_result
import threading
import os
import csv
import json
from datetime import datetime, time as dtime
from collections import defaultdict

app = Flask(__name__)
CORS(app)

recognition_thread = None
running = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DETECTION_LOG = os.path.join(BASE_DIR, "logs", "detection_log.csv")
STUDENTS_FILE = os.path.join(BASE_DIR, "students.json")
PROCESSED_FACES_DIR = os.path.join(BASE_DIR, "processed_faces")

LATE_THRESHOLD = dtime(9, 0)          # check-in after 9:00 AM => "Late"
MIN_GAP_MINUTES_FOR_CHECKOUT = 2      # if first/last sighting are closer than this, treat as "Incomplete"


# ---------- Students storage ----------

def get_face_folders():
    """All subfolder names under processed_faces, regardless of naming convention."""
    folders = []
    if os.path.isdir(PROCESSED_FACES_DIR):
        for entry in sorted(os.listdir(PROCESSED_FACES_DIR)):
            full_path = os.path.join(PROCESSED_FACES_DIR, entry)
            if os.path.isdir(full_path):
                folders.append(entry)
    return folders


def load_students():
    if not os.path.exists(STUDENTS_FILE):
        students = [{"id": f, "name": f, "class": "", "photo": ""} for f in get_face_folders()]
        save_students(students)
        return students

    try:
        with open(STUDENTS_FILE) as f:
            students = json.load(f)
        if not isinstance(students, list):
            raise ValueError("students.json did not contain a list")
    except (json.JSONDecodeError, ValueError) as e:
        # File is corrupted (e.g. malformed JSON) - back it up and reseed
        backup_path = STUDENTS_FILE + ".corrupt.bak"
        try:
            os.replace(STUDENTS_FILE, backup_path)
            print(f"students.json was invalid ({e}); backed up to {backup_path} and reseeding.")
        except OSError:
            print(f"students.json was invalid ({e}); could not back it up, reseeding anyway.")
        students = [{"id": f, "name": f, "class": "", "photo": ""} for f in get_face_folders()]
        save_students(students)
        return students

    # Top up with any face folders not yet represented, without touching existing entries
    existing_ids = {s["id"] for s in students}
    added = False
    for folder in get_face_folders():
        if folder not in existing_ids:
            students.append({"id": folder, "name": folder, "class": "", "photo": ""})
            added = True

    if added:
        save_students(students)

    return students


def save_students(students):
    with open(STUDENTS_FILE, "w") as f:
        json.dump(students, f, indent=2)


@app.route("/api/students", methods=["GET"])
def get_students():
    return jsonify(load_students())


@app.route("/api/students", methods=["POST"])
def add_student():
    data = request.get_json(silent=True) or {}
    if not data.get("id") or not data.get("name"):
        return jsonify({"error": "id and name are required"}), 400

    students = load_students()
    if any(s["id"] == data["id"] for s in students):
        return jsonify({"error": "A student with this ID already exists"}), 409

    new_student = {
        "id": data["id"],
        "name": data["name"],
        "class": data.get("class", ""),
        "photo": data.get("photo", "")
    }
    students.append(new_student)
    save_students(students)
    return jsonify(new_student), 201


@app.route("/api/students/<student_id>", methods=["PUT"])
def update_student(student_id):
    data = request.get_json(silent=True) or {}
    students = load_students()

    for s in students:
        if s["id"] == student_id:
            s["name"] = data.get("name", s["name"])
            s["class"] = data.get("class", s["class"])
            save_students(students)
            return jsonify(s)

    return jsonify({"error": "Student not found"}), 404


@app.route("/api/students/<student_id>", methods=["DELETE"])
def delete_student(student_id):
    students = load_students()
    remaining = [s for s in students if s["id"] != student_id]

    if len(remaining) == len(students):
        return jsonify({"error": "Student not found"}), 404

    save_students(remaining)
    return jsonify({"success": True})


# ---------- Existing routes ----------

@app.route("/")
def home():
    return jsonify({"message": "Backend Running"})


@app.route("/api/start", methods=["POST"])
def start():
    global recognition_thread, running
    if not running:
        running = True
        recognition_thread = threading.Thread(target=start_recognition, daemon=True)
        recognition_thread.start()
    return jsonify({"success": True})


@app.route("/api/status")
def status():
    return jsonify({"running": running})


@app.route("/api/result")
def result():
    return jsonify(latest_result)


@app.route("/api/attendance")
def get_attendance():
    if not os.path.exists(DETECTION_LOG):
        return jsonify([])

    # Build a quick id -> name lookup from the students store
    students = load_students()
    name_lookup = {s["id"]: s["name"] for s in students}
    all_student_ids = set(name_lookup.keys())

    sightings = defaultdict(list)

    with open(DETECTION_LOG, newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) < 4:
                continue
            ts_str, name, confidence, det_status = row[0], row[1], row[2], row[3]
            if det_status != "known":
                continue
            try:
                ts = datetime.strptime(ts_str.strip(), "%Y-%m-%d %H:%M:%S")
            except ValueError:
                continue
            date_str = ts.strftime("%Y-%m-%d")
            sightings[(name, date_str)].append(ts)

    attendance = []
    seen_by_date = defaultdict(set)  # date_str -> set of student_ids with a real record that day

    for (student_id, date_str), timestamps in sightings.items():
        timestamps.sort()
        check_in = timestamps[0]
        check_out = timestamps[-1]
        gap_minutes = (check_out - check_in).total_seconds() / 60

        if gap_minutes < MIN_GAP_MINUTES_FOR_CHECKOUT:
            record_status = "Incomplete"
            check_out_str = "--:--:--"
        else:
            record_status = "Late" if check_in.time() > LATE_THRESHOLD else "Present"
            check_out_str = check_out.strftime("%H:%M:%S")

        attendance.append({
            "studentId": student_id,
            "studentName": name_lookup.get(student_id, student_id),  # falls back to ID if not found
            "date": date_str,
            "checkInTime": check_in.strftime("%H:%M:%S"),
            "checkOutTime": check_out_str,
            "status": record_status
        })
        seen_by_date[date_str].add(student_id)

    # For every date the camera actually logged something, mark roster students
    # with no sighting that day as Absent.
    active_dates = seen_by_date.keys()
    for date_str in active_dates:
        missing_ids = all_student_ids - seen_by_date[date_str]
        for student_id in missing_ids:
            attendance.append({
                "studentId": student_id,
                "studentName": name_lookup.get(student_id, student_id),
                "date": date_str,
                "checkInTime": "--:--:--",
                "checkOutTime": "--:--:--",
                "status": "Absent"
            })

    attendance.sort(key=lambda r: (r["date"], r["checkInTime"]))
    return jsonify(attendance)


if __name__ == "__main__":
    app.run(debug=False)