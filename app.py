import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, render_template, request, session
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "students.json"
EVENT_PHOTOS_FILE = BASE_DIR / "data" / "event_photos.json"
CREDENTIALS_FILE = BASE_DIR / "data" / "admin_credentials.json"
EVENT_PHOTO_UPLOAD_DIR = BASE_DIR / "static" / "uploads" / "event-photos"
EVENT_PHOTO_WEB_DIR = "uploads/event-photos"
SUBJECT_FIELDS = ("maths", "science", "english", "kannada", "social_science", "hindi")
ALLOWED_EVENT_PHOTO_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

DEFAULT_STUDENTS = [
    {
        "roll_no": 101,
        "name": "Akash",
        "class": "10A",
        "maths": 90,
        "science": 85,
        "english": 88,
        "kannada": 91,
        "social_science": 86,
        "hindi": 89,
    },
    {
        "roll_no": 102,
        "name": "Rahul",
        "class": "10A",
        "maths": 80,
        "science": 75,
        "english": 82,
        "kannada": 78,
        "social_science": 74,
        "hindi": 80,
    },
    {
        "roll_no": 103,
        "name": "Anjali",
        "class": "10A",
        "maths": 95,
        "science": 92,
        "english": 90,
        "kannada": 94,
        "social_science": 96,
        "hindi": 91,
    },
    {
        "roll_no": 104,
        "name": "Adithya",
        "class": "7A",
        "maths": 78,
        "science": 67,
        "english": 99,
        "kannada": 84,
        "social_science": 72,
        "hindi": 76,
    },
]

app = Flask(__name__, template_folder="static/template", static_folder="static")
app.secret_key = os.environ.get("SECRET_KEY", "dev-school-portal-secret")


def default_students():
    return [student.copy() for student in DEFAULT_STUDENTS]


def normalize_student(student):
    normalized = {
        "roll_no": int(student["roll_no"]),
        "name": str(student["name"]).strip(),
        "class": str(student["class"]).strip(),
    }

    for field in SUBJECT_FIELDS:
        try:
            normalized[field] = int(student.get(field, 0))
        except (TypeError, ValueError):
            normalized[field] = 0

    return normalized


def load_students():
    if not DATA_FILE.exists():
        save_students(default_students())

    try:
        with DATA_FILE.open("r", encoding="utf-8") as handle:
            students = json.load(handle)
    except (OSError, json.JSONDecodeError):
        students = default_students()
        save_students(students)
        return students

    if not isinstance(students, list):
        students = default_students()
        save_students(students)
        return students

    normalized_students = []
    for student in students:
        if not isinstance(student, dict):
            continue
        try:
            normalized_students.append(normalize_student(student))
        except (KeyError, TypeError, ValueError):
            continue

    normalized_students = sorted(
        normalized_students,
        key=lambda student: student["roll_no"],
    )
    if normalized_students != students:
        save_students(normalized_students)
    return normalized_students


def save_students(students):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("w", encoding="utf-8") as handle:
        json.dump(students, handle, indent=2)


def build_event_photo_url(stored_filename):
    return f"/static/{EVENT_PHOTO_WEB_DIR}/{stored_filename}"


def clean_text(value):
    if value is None:
        return ""
    return str(value).strip()


def normalize_event_photo(photo):
    stored_filename = clean_text(photo.get("stored_filename"))
    if not stored_filename:
        return None

    title = clean_text(photo.get("title")) or "School event"
    original_filename = clean_text(photo.get("original_filename")) or stored_filename
    uploaded_at = clean_text(photo.get("uploaded_at"))
    uploaded_by = clean_text(photo.get("uploaded_by"))
    photo_id = clean_text(photo.get("id")) or stored_filename

    normalized = {
        "id": photo_id,
        "title": title,
        "original_filename": original_filename,
        "stored_filename": stored_filename,
        "url": clean_text(photo.get("url")) or build_event_photo_url(stored_filename),
        "uploaded_at": uploaded_at,
    }

    if uploaded_by:
        normalized["uploaded_by"] = uploaded_by

    return normalized


def load_event_photos():
    if not EVENT_PHOTOS_FILE.exists():
        return []

    try:
        with EVENT_PHOTOS_FILE.open("r", encoding="utf-8") as handle:
            photos = json.load(handle)
    except (OSError, json.JSONDecodeError):
        photos = []
        save_event_photos(photos)
        return photos

    if not isinstance(photos, list):
        save_event_photos([])
        return []

    normalized_photos = []
    for photo in photos:
        if not isinstance(photo, dict):
            continue
        normalized_photo = normalize_event_photo(photo)
        if normalized_photo is not None:
            normalized_photos.append(normalized_photo)

    normalized_photos.sort(key=lambda item: item.get("uploaded_at", ""), reverse=True)

    if normalized_photos != photos:
        save_event_photos(normalized_photos)

    return normalized_photos


def save_event_photos(photos):
    EVENT_PHOTOS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with EVENT_PHOTOS_FILE.open("w", encoding="utf-8") as handle:
        json.dump(photos, handle, indent=2)


def is_allowed_event_photo(filename):
    return Path(filename).suffix.lower() in ALLOWED_EVENT_PHOTO_EXTENSIONS


def delete_event_photo_file(stored_filename):
    filename = clean_text(stored_filename)
    if not filename:
        return

    try:
        base_path = EVENT_PHOTO_UPLOAD_DIR.resolve(strict=False)
        target_path = (EVENT_PHOTO_UPLOAD_DIR / filename).resolve(strict=False)
    except (OSError, RuntimeError, ValueError):
        return

    try:
        if target_path == base_path or target_path.is_relative_to(base_path):
            if target_path.exists():
                target_path.unlink()
    except (OSError, ValueError):
        pass


def remove_event_photo(photo_id):
    target_photo_id = clean_text(photo_id)
    if not target_photo_id:
        return None, load_event_photos()

    photos = load_event_photos()
    remaining_photos = []
    removed_photo = None

    for photo in photos:
        if removed_photo is None and clean_text(photo.get("id")) == target_photo_id:
            removed_photo = photo
            continue
        remaining_photos.append(photo)

    if removed_photo is None:
        return None, photos

    delete_event_photo_file(removed_photo.get("stored_filename"))
    save_event_photos(remaining_photos)
    return removed_photo, load_event_photos()


def load_admin_credentials():
    if not CREDENTIALS_FILE.exists():
        return None

    try:
        with CREDENTIALS_FILE.open("r", encoding="utf-8") as handle:
            credentials = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return None

    if not isinstance(credentials, dict):
        return None

    username = str(credentials.get("username", "")).strip()
    password_hash = str(credentials.get("password_hash", "")).strip()

    if not username or not password_hash:
        return None

    return {
        "username": username,
        "password_hash": password_hash,
    }


def save_admin_credentials(username, password):
    CREDENTIALS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with CREDENTIALS_FILE.open("w", encoding="utf-8") as handle:
        json.dump(
            {
                "username": username,
                "password_hash": generate_password_hash(password),
            },
            handle,
            indent=2,
        )


def request_payload():
    payload = request.get_json(silent=True)
    if payload is None:
        payload = request.form.to_dict(flat=True)
    return payload or {}


def parse_student_payload(payload):
    try:
        roll_no = int(payload["roll_no"])
        marks = {field: int(payload[field]) for field in SUBJECT_FIELDS}
    except (KeyError, TypeError, ValueError):
        return None, "Roll number and marks must be valid numbers."

    name = str(payload.get("name", "")).strip()
    class_name = str(payload.get("class", "")).strip()

    if not name or not class_name:
        return None, "Student name and class are required."

    if roll_no <= 0:
        return None, "Roll number must be greater than zero."

    if any(mark < 0 or mark > 100 for mark in marks.values()):
        return None, "Marks must be between 0 and 100."

    student = {
        "roll_no": roll_no,
        "name": name,
        "class": class_name,
    }
    student.update(marks)
    return student, None


def find_student(students, roll_no):
    for student in students:
        try:
            if int(student.get("roll_no", -1)) == roll_no:
                return student
        except (TypeError, ValueError):
            continue
    return None


def admin_is_configured():
    return load_admin_credentials() is not None


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/students")
@app.route("/students")
def get_students():
    return jsonify(load_students())


@app.route("/api/students/<int:roll_no>")
def get_student(roll_no):
    student = find_student(load_students(), roll_no)
    if student is None:
        return jsonify({"ok": False, "message": "Student not found."}), 404
    return jsonify(student)


@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    payload = request_payload()
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))

    credentials = load_admin_credentials()
    if credentials is None:
        return jsonify({"ok": False, "message": "No admin credentials have been created yet."}), 400

    if username == credentials["username"] and check_password_hash(credentials["password_hash"], password):
        session["admin_logged_in"] = True
        session["admin_username"] = credentials["username"]
        return jsonify({"ok": True, "message": "Admin login successful.", "username": credentials["username"]})

    return jsonify({"ok": False, "message": "Invalid admin username or password."}), 401


@app.route("/api/admin/credentials", methods=["POST"])
def admin_credentials():
    payload = request_payload()
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))
    confirm_password = str(payload.get("confirm_password", ""))

    if not username or not password or not confirm_password:
        return jsonify({"ok": False, "message": "Please complete every credential field."}), 400

    if len(username) < 3:
        return jsonify({"ok": False, "message": "Username must be at least 3 characters long."}), 400

    if len(password) < 6:
        return jsonify({"ok": False, "message": "Password must be at least 6 characters long."}), 400

    if password != confirm_password:
        return jsonify({"ok": False, "message": "Passwords do not match."}), 400

    credentials = load_admin_credentials()
    if credentials is not None and not session.get("admin_logged_in"):
        return jsonify({"ok": False, "message": "Admin login required to change credentials."}), 403

    save_admin_credentials(username, password)
    session["admin_logged_in"] = True
    session["admin_username"] = username

    action = "created" if credentials is None else "updated"
    return jsonify(
        {
            "ok": True,
            "message": f"Admin credentials {action} successfully.",
            "logged_in": True,
            "username": username,
        }
    )


@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.pop("admin_logged_in", None)
    session.pop("admin_username", None)
    return jsonify({"ok": True, "message": "Admin logged out."})


@app.route("/api/event-photos")
def get_event_photos():
    return jsonify(load_event_photos())


@app.route("/api/admin/event-photos", methods=["POST"])
def save_event_photos_upload():
    if not session.get("admin_logged_in"):
        return jsonify({"ok": False, "message": "Admin login required."}), 403

    title = str(request.form.get("title", "")).strip() or "School event"
    selected_files = [file for file in request.files.getlist("photos") if file and file.filename]

    if not selected_files:
        return jsonify({"ok": False, "message": "Please choose at least one photo to upload."}), 400

    validated_files = []
    for file in selected_files:
        original_filename = secure_filename(file.filename)
        if not original_filename:
            return jsonify({"ok": False, "message": "Every photo must have a valid filename."}), 400
        if not is_allowed_event_photo(original_filename):
            return jsonify(
                {
                    "ok": False,
                    "message": "Only JPG, JPEG, PNG, GIF, and WebP images are allowed.",
                }
            ), 400
        validated_files.append((file, original_filename))

    EVENT_PHOTO_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    existing_photos = load_event_photos()
    uploaded_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    uploaded_photos = []

    for file, original_filename in validated_files:
        extension = Path(original_filename).suffix.lower()
        stored_filename = f"{uuid.uuid4().hex}{extension}"
        target_path = EVENT_PHOTO_UPLOAD_DIR / stored_filename
        file.save(target_path)
        uploaded_photos.append(
            {
                "id": uuid.uuid4().hex,
                "title": title,
                "original_filename": original_filename,
                "stored_filename": stored_filename,
                "url": build_event_photo_url(stored_filename),
                "uploaded_at": uploaded_at,
                "uploaded_by": session.get("admin_username", "Admin"),
            }
        )

    save_event_photos(uploaded_photos + existing_photos)

    return jsonify(
        {
            "ok": True,
            "message": f"{len(uploaded_photos)} event photo{'s' if len(uploaded_photos) != 1 else ''} uploaded successfully.",
            "photos": load_event_photos(),
        }
    )


@app.route("/api/admin/event-photos/<photo_id>", methods=["DELETE"])
def delete_event_photo(photo_id):
    if not session.get("admin_logged_in"):
        return jsonify({"ok": False, "message": "Admin login required."}), 403

    removed_photo, remaining_photos = remove_event_photo(photo_id)
    if removed_photo is None:
        return jsonify({"ok": False, "message": "Event photo not found."}), 404

    return jsonify(
        {
            "ok": True,
            "message": "Event photo deleted successfully.",
            "photos": remaining_photos,
        }
    )


@app.route("/api/admin/students", methods=["POST"])
def save_student():
    if not session.get("admin_logged_in"):
        return jsonify({"ok": False, "message": "Admin login required."}), 403

    payload = request_payload()
    student, error = parse_student_payload(payload)
    if error:
        return jsonify({"ok": False, "message": error}), 400

    students = load_students()
    existing = find_student(students, student["roll_no"])

    if existing is None:
        students.append(student)
        action = "added"
    else:
        existing.update(student)
        action = "updated"

    students = sorted(students, key=lambda item: int(item.get("roll_no", 0)))
    save_students(students)

    return jsonify(
        {
            "ok": True,
            "message": f"Student {action} successfully.",
            "student": student,
            "students": students,
        }
    )


@app.route("/api/admin/students/<int:roll_no>", methods=["DELETE"])
def delete_student(roll_no):
    if not session.get("admin_logged_in"):
        return jsonify({"ok": False, "message": "Admin login required."}), 403

    students = load_students()
    remaining_students = []
    deleted_student = None

    for student in students:
        try:
            if deleted_student is None and int(student.get("roll_no", -1)) == roll_no:
                deleted_student = student
                continue
        except (TypeError, ValueError):
            pass

        remaining_students.append(student)

    if deleted_student is None:
        return jsonify({"ok": False, "message": "Student not found."}), 404

    remaining_students = sorted(remaining_students, key=lambda item: int(item.get("roll_no", 0)))
    save_students(remaining_students)

    return jsonify(
        {
            "ok": True,
            "message": f"Student roll number {roll_no} deleted successfully.",
            "student": deleted_student,
            "students": remaining_students,
        }
    )


@app.route("/api/admin/status")
def admin_status():
    return jsonify(
        {
            "logged_in": bool(session.get("admin_logged_in")),
            "configured": admin_is_configured(),
            "username": session.get("admin_username", "") if session.get("admin_logged_in") else "",
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
