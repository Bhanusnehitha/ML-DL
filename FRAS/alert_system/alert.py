import os
import csv
import time
from datetime import datetime
import threading
import winsound   # built-in on Windows only

LOG_FILE = os.path.join("..", "logs", "detection_log.csv")

def play_alarm():
    try:
        # frequency=1000Hz, duration=700ms, repeated 3 times
        for _ in range(3):
            winsound.Beep(1000, 700)
            time.sleep(0.2)
    except Exception as e:
        print(f"Could not play alarm sound: {e}")

def trigger_alert(name, confidence, status):
    """
    status: 'known' or 'unknown'
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if status == "unknown":
        threading.Thread(target=play_alarm, daemon=True).start()
        print(f"🚨 ALERT [{timestamp}]: Unknown face detected (confidence: {confidence:.2f})")

    log_detection(timestamp, name, confidence, status)

def log_detection(timestamp, name, confidence, status):
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    file_exists = os.path.isfile(LOG_FILE)

    with open(LOG_FILE, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["Timestamp", "Name", "Confidence", "Status"])
        writer.writerow([timestamp, name, f"{confidence:.2f}", status])