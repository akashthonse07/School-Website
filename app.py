import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, render_template, request, session
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "students.json"
EVENT_PHOTOS_FILE = BASE_DIR / "data" / "event_photos.json"
SYLLABUS_FILE = BASE_DIR / "data" / "syllabus.json"
EVENT_PHOTO_UPLOAD_DIR = BASE_DIR / "static" / "uploads" / "event-photos"
EVENT_PHOTO_WEB_DIR = "uploads/event-photos"
SYLLABUS_PDF_UPLOAD_DIR = BASE_DIR / "static" / "uploads" / "syllabus-pdfs"
SYLLABUS_PDF_WEB_DIR = "uploads/syllabus-pdfs"
SUBJECT_FIELDS = ("maths", "science", "english", "kannada", "social_science", "hindi")
ALLOWED_EVENT_PHOTO_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_SYLLABUS_PDF_EXTENSIONS = {".pdf"}
ADMIN_EMAIL = "akashthonse8@gmail.com"
ADMIN_PASSWORD = "akash8217"

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


def build_syllabus_pdf_url(stored_filename):
    return f"/static/{SYLLABUS_PDF_WEB_DIR}/{stored_filename}"


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


def syllabus_class_key(class_name):
    return clean_text(class_name).casefold()


def normalize_syllabus_entry(entry):
    class_name = clean_text(entry.get("class"))
    if not class_name:
        return None

    normalized = {"class": class_name}
    for field in SUBJECT_FIELDS:
        normalized[field] = clean_text(entry.get(field))

    pdfs = {}
    raw_pdfs = entry.get("pdfs")
    if isinstance(raw_pdfs, dict):
        for field in SUBJECT_FIELDS:
            raw_pdf = raw_pdfs.get(field)
            if not isinstance(raw_pdf, dict):
                continue

            stored_filename = secure_filename(clean_text(raw_pdf.get("stored_filename")))
            if not stored_filename or Path(stored_filename).suffix.lower() not in ALLOWED_SYLLABUS_PDF_EXTENSIONS:
                continue

            pdfs[field] = {
                "original_filename": clean_text(raw_pdf.get("original_filename")) or stored_filename,
                "stored_filename": stored_filename,
                "url": build_syllabus_pdf_url(stored_filename),
            }

    if pdfs:
        normalized["pdfs"] = pdfs
    return normalized


def load_syllabus():
    if not SYLLABUS_FILE.exists():
        return []

    try:
        with SYLLABUS_FILE.open("r", encoding="utf-8") as handle:
            syllabus = json.load(handle)
    except (OSError, json.JSONDecodeError):
        syllabus = []
        save_syllabus(syllabus)
        return syllabus

    if not isinstance(syllabus, list):
        save_syllabus([])
        return []

    normalized_syllabus = []
    for entry in syllabus:
        if not isinstance(entry, dict):
            continue
        normalized_entry = normalize_syllabus_entry(entry)
        if normalized_entry is not None:
            normalized_syllabus.append(normalized_entry)

    normalized_syllabus.sort(key=lambda item: syllabus_class_key(item.get("class")))

    if normalized_syllabus != syllabus:
        save_syllabus(normalized_syllabus)

    return normalized_syllabus


def save_syllabus(syllabus):
    SYLLABUS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with SYLLABUS_FILE.open("w", encoding="utf-8") as handle:
        json.dump(syllabus, handle, indent=2)


def is_allowed_event_photo(filename):
    return Path(filename).suffix.lower() in ALLOWED_EVENT_PHOTO_EXTENSIONS


def is_allowed_syllabus_pdf(filename):
    return Path(filename).suffix.lower() in ALLOWED_SYLLABUS_PDF_EXTENSIONS


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


def delete_syllabus_pdf_file(stored_filename):
    filename = secure_filename(clean_text(stored_filename))
    if not filename or not is_allowed_syllabus_pdf(filename):
        return

    try:
        base_path = SYLLABUS_PDF_UPLOAD_DIR.resolve(strict=False)
        target_path = (SYLLABUS_PDF_UPLOAD_DIR / filename).resolve(strict=False)
    except (OSError, RuntimeError, ValueError):
        return

    try:
        if target_path != base_path and target_path.is_relative_to(base_path) and target_path.exists():
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


def normalize_email(value):
    return str(value or "").strip().lower()


def load_admin_credentials():
    return {
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
    }


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


def parse_syllabus_payload(payload):
    class_name = clean_text(payload.get("class"))

    if not class_name:
        return None, "Class is required."

    syllabus_entry = {"class": class_name}
    for field in SUBJECT_FIELDS:
        subject_syllabus = clean_text(payload.get(field))
        if subject_syllabus:
            syllabus_entry[field] = subject_syllabus
    return syllabus_entry, None


def find_student(students, roll_no):
    for student in students:
        try:
            if int(student.get("roll_no", -1)) == roll_no:
                return student
        except (TypeError, ValueError):
            continue
    return None


def admin_is_configured():
    return True


def clear_admin_session():
    session.pop("admin_logged_in", None)
    session.pop("admin_username", None)


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
    username = str(payload.get("email") or payload.get("username", "")).strip()
    email = normalize_email(username)
    password = str(payload.get("password", ""))

    credentials = load_admin_credentials()

    if email != normalize_email(credentials["username"]):
        clear_admin_session()
        return jsonify(
            {
                "ok": True,
                "role": "student",
                "message": "Student portal opened. Admin access is only for the approved email.",
            }
        )

    if password == credentials["password"]:
        session["admin_logged_in"] = True
        session["admin_username"] = credentials["username"]
        return jsonify(
            {
                "ok": True,
                "role": "admin",
                "message": "Admin login successful.",
                "username": credentials["username"],
            }
        )

    clear_admin_session()
    return jsonify({"ok": False, "message": "Invalid admin email or password."}), 401


@app.route("/api/admin/credentials", methods=["POST"])
def admin_credentials():
    return jsonify({"ok": False, "message": "Admin credentials are fixed for this portal."}), 403


@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.pop("admin_logged_in", None)
    session.pop("admin_username", None)
    return jsonify({"ok": True, "message": "Admin logged out."})


@app.route("/api/event-photos")
def get_event_photos():
    return jsonify(load_event_photos())


@app.route("/api/syllabus")
def get_syllabus():
    return jsonify(load_syllabus())


@app.route("/api/admin/syllabus", methods=["POST"])
def save_syllabus_entry():
    if not session.get("admin_logged_in"):
        return jsonify({"ok": False, "message": "Admin login required."}), 403

    payload = request_payload()
    syllabus_entry, error = parse_syllabus_payload(payload)
    if error:
        return jsonify({"ok": False, "message": error}), 400

    syllabus = load_syllabus()
    target_key = syllabus_class_key(syllabus_entry["class"])
    existing = None
    for entry in syllabus:
        if syllabus_class_key(entry.get("class")) == target_key:
            existing = entry
            break

    uploaded_pdfs = []
    for field in SUBJECT_FIELDS:
        file = request.files.get(f"{field}_pdf")
        if not file or not file.filename:
            continue

        original_filename = secure_filename(file.filename)
        if not original_filename or not is_allowed_syllabus_pdf(original_filename):
            return jsonify(
                {
                    "ok": False,
                    "message": f"The {field.replace('_', ' ')} attachment must be a PDF file.",
                }
            ), 400
        uploaded_pdfs.append((field, file, original_filename))

    if len(syllabus_entry) == 1 and not uploaded_pdfs:
        return jsonify(
            {
                "ok": False,
                "message": "Add at least one subject syllabus or PDF attachment before saving.",
            }
        ), 400

    new_pdfs = dict(existing.get("pdfs", {})) if existing else {}
    replaced_pdfs = []
    saved_filenames = []

    try:
        if uploaded_pdfs:
            SYLLABUS_PDF_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        for field, file, original_filename in uploaded_pdfs:
            stored_filename = f"{uuid.uuid4().hex}.pdf"
            file.save(SYLLABUS_PDF_UPLOAD_DIR / stored_filename)
            saved_filenames.append(stored_filename)

            previous_pdf = new_pdfs.get(field)
            if isinstance(previous_pdf, dict):
                replaced_pdfs.append(previous_pdf.get("stored_filename"))

            new_pdfs[field] = {
                "original_filename": original_filename,
                "stored_filename": stored_filename,
                "url": build_syllabus_pdf_url(stored_filename),
            }
    except OSError:
        for stored_filename in saved_filenames:
            delete_syllabus_pdf_file(stored_filename)
        return jsonify({"ok": False, "message": "Unable to save the PDF attachment."}), 500

    if new_pdfs:
        syllabus_entry["pdfs"] = new_pdfs

    if existing is None:
        syllabus.append(syllabus_entry)
        action = "added"
    else:
        existing.update(syllabus_entry)
        action = "updated"

    syllabus.sort(key=lambda item: syllabus_class_key(item.get("class")))
    save_syllabus(syllabus)

    for stored_filename in replaced_pdfs:
        delete_syllabus_pdf_file(stored_filename)

    return jsonify(
        {
            "ok": True,
            "message": f"Syllabus for class {syllabus_entry['class']} {action} successfully.",
            "syllabus": syllabus,
            "entry": syllabus_entry,
        }
    )


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
