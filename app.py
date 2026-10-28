import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import db
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

try:
    from flask_cors import CORS
    _HAS_CORS = True
except ImportError:
    _HAS_CORS = False

app = Flask(__name__, template_folder="static/template", static_folder="static")
app.secret_key = os.environ.get("SECRET_KEY", "dev-school-portal-secret")

if _HAS_CORS:
    CORS(app, supports_credentials=True, origins=os.environ.get("ALLOWED_ORIGINS", "*").split(","))


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


def get_meta_value(key):
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT value FROM meta WHERE key = ?", (key,))
    row = cur.fetchone()
    conn.close()
    return row["value"] if row is not None else None


def set_meta_value(key, value):
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, str(value)),
    )
    conn.commit()
    conn.close()


def load_students():
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT roll_no,name,class,maths,science,english,kannada,social_science,hindi FROM students ORDER BY roll_no")
    rows = cur.fetchall()
    conn.close()
    if not rows:
        seeded = get_meta_value("students_seeded") == "1"
        if seeded:
            return []

        # migrate from legacy JSON if present
        legacy = []
        if DATA_FILE.exists():
            try:
                legacy = json.loads(DATA_FILE.read_text(encoding="utf-8"))
                if not isinstance(legacy, list):
                    legacy = []
            except (OSError, json.JSONDecodeError):
                legacy = []
        if legacy:
            save_students(legacy)
            set_meta_value("students_seeded", "1")
            return load_students()

        set_meta_value("students_seeded", "1")
        return []

    if get_meta_value("students_seeded") != "1":
        set_meta_value("students_seeded", "1")
    students = []
    for row in rows:
        students.append(
            {
                "roll_no": int(row["roll_no"]),
                "name": row["name"],
                "class": row["class"],
                "maths": int(row["maths"]),
                "science": int(row["science"]),
                "english": int(row["english"]),
                "kannada": int(row["kannada"]),
                "social_science": int(row["social_science"]),
                "hindi": int(row["hindi"]),
            }
        )
    return students


def save_students(students):
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM students")
    normalized_students = []
    for student in students:
        normalized = normalize_student(student)
        normalized_students.append(normalized)
        cur.execute(
            "INSERT INTO students (roll_no,name,class,maths,science,english,kannada,social_science,hindi) VALUES (?,?,?,?,?,?,?,?,?)",
            (
                int(normalized["roll_no"]), normalized["name"], normalized["class"],
                int(normalized["maths"]), int(normalized["science"]), int(normalized["english"]),
                int(normalized["kannada"]), int(normalized["social_science"]), int(normalized["hindi"]),
            ),
        )
    conn.commit()
    conn.close()

    # keep legacy JSON in sync so deleted records never reappear on migration
    try:
        DATA_FILE.write_text(json.dumps(normalized_students, indent=2), encoding="utf-8")
    except OSError:
        pass


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
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT data FROM event_photos")
    rows = cur.fetchall()
    conn.close()
    photos = []
    for row in rows:
        try:
            photos.append(json.loads(row["data"]))
        except (TypeError, json.JSONDecodeError):
            continue
    if not photos and EVENT_PHOTOS_FILE.exists():
        try:
            legacy = json.loads(EVENT_PHOTOS_FILE.read_text(encoding="utf-8"))
            if isinstance(legacy, list) and legacy:
                save_event_photos(legacy)
                return load_event_photos()
        except (OSError, json.JSONDecodeError):
            pass
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
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM event_photos")
    normalized_photos = []
    for photo in photos:
        normalized = normalize_event_photo(photo)
        if normalized is None:
            continue
        normalized_photos.append(normalized)
        cur.execute("INSERT INTO event_photos (id,data) VALUES (?,?)", (normalized["id"], json.dumps(normalized)))
    conn.commit()
    conn.close()

    try:
        EVENT_PHOTOS_FILE.write_text(json.dumps(normalized_photos, indent=2), encoding="utf-8")
    except OSError:
        pass


def syllabus_class_key(class_name):
    return clean_text(class_name).casefold()


def normalize_syllabus_chapter(raw_chapter, fallback_pdf=None):
    if not isinstance(raw_chapter, dict):
        raw_chapter = {"content": raw_chapter}
    title = clean_text(raw_chapter.get("title"))
    content = clean_text(raw_chapter.get("content") or raw_chapter.get("text"))
    pdf = None
    raw_pdf = raw_chapter.get("pdf")
    if not isinstance(raw_pdf, dict):
        raw_pdf = fallback_pdf
    if isinstance(raw_pdf, dict):
        stored_filename = secure_filename(clean_text(raw_pdf.get("stored_filename")))
        if stored_filename and Path(stored_filename).suffix.lower() in ALLOWED_SYLLABUS_PDF_EXTENSIONS:
            pdf = {
                "original_filename": clean_text(raw_pdf.get("original_filename")) or stored_filename,
                "stored_filename": stored_filename,
                "url": build_syllabus_pdf_url(stored_filename),
            }
    return {"title": title, "content": content, "pdf": pdf}



def normalize_syllabus_entry(entry):
    class_name = clean_text(entry.get("class"))
    if not class_name:
        return None

    normalized = {"class": class_name, "subjects": {}}

    raw_subjects = entry.get("subjects")
    if isinstance(raw_subjects, dict):
        for field in SUBJECT_FIELDS:
            raw_chapters = raw_subjects.get(field)
            chapters = []
            if isinstance(raw_chapters, list):
                for rc in raw_chapters:
                    ch = normalize_syllabus_chapter(rc)
                    if ch["title"] or ch["content"] or ch["pdf"]:
                        chapters.append(ch)
            elif raw_chapters is not None:
                ch = normalize_syllabus_chapter(raw_chapters)
                if ch["title"] or ch["content"] or ch["pdf"]:
                    chapters.append(ch)
            if chapters:
                normalized["subjects"][field] = chapters

    raw_pdfs = entry.get("pdfs") if isinstance(entry.get("pdfs"), dict) else {}
    for field in SUBJECT_FIELDS:
        if field in normalized["subjects"]:
            continue
        value = entry.get(field)
        pdf = raw_pdfs.get(field) if isinstance(raw_pdfs.get(field), dict) else None
        chapters = []
        if isinstance(value, list):
            for v in value:
                ch = normalize_syllabus_chapter({"content": v}, pdf)
                if ch["title"] or ch["content"] or ch["pdf"]:
                    chapters.append(ch)
        else:
            text = clean_text(value)
            if text or pdf:
                chapters.append(normalize_syllabus_chapter({"content": text}, pdf))
        if chapters and pdf and not any(c.get("pdf") for c in chapters):
            chapters[0]["pdf"] = normalize_syllabus_chapter({}, pdf)["pdf"]
        if chapters and (chapters[0]["content"] or chapters[0]["pdf"]):
            normalized["subjects"][field] = chapters

    return normalized


def load_syllabus():
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT data FROM syllabus")
    rows = cur.fetchall()
    conn.close()
    syllabus = []
    for row in rows:
        try:
            syllabus.append(json.loads(row["data"]))
        except (TypeError, json.JSONDecodeError):
            continue
    if not syllabus and SYLLABUS_FILE.exists():
        try:
            legacy = json.loads(SYLLABUS_FILE.read_text(encoding="utf-8"))
            if isinstance(legacy, list) and legacy:
                save_syllabus(legacy)
                return load_syllabus()
        except (OSError, json.JSONDecodeError):
            pass
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
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM syllabus")
    for entry in syllabus:
        cur.execute("INSERT INTO syllabus (class,data) VALUES (?,?)", (clean_text(entry.get("class")), json.dumps(entry)))
    conn.commit()
    conn.close()

    try:
        SYLLABUS_FILE.write_text(json.dumps(syllabus, indent=2), encoding="utf-8")
    except OSError:
        pass


def is_allowed_event_photo(filename):
    return Path(filename).suffix.lower() in ALLOWED_EVENT_PHOTO_EXTENSIONS


def is_allowed_syllabus_pdf(filename):
    return Path(filename).suffix.lower() in ALLOWED_SYLLABUS_PDF_EXTENSIONS


def delete_event_photo_file(stored_filename):
    filename = secure_filename(clean_text(stored_filename))
    if not filename or not is_allowed_event_photo(filename):
        return

    try:
        base_path = EVENT_PHOTO_UPLOAD_DIR.resolve(strict=False)
        target_path = (EVENT_PHOTO_UPLOAD_DIR / filename).resolve(strict=False)
    except (OSError, RuntimeError, ValueError):
        return

    try:
        if target_path != base_path and target_path.is_relative_to(base_path) and target_path.exists():
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


def remove_syllabus_entry(class_name):
    target_class = clean_text(class_name)
    if not target_class:
        return None, load_syllabus()

    entries = load_syllabus()
    removed_entry = None
    remaining_entries = []

    for entry in entries:
        if removed_entry is None and syllabus_class_key(entry.get("class")) == syllabus_class_key(target_class):
            removed_entry = entry
            continue
        remaining_entries.append(entry)

    if removed_entry is None:
        return None, entries

    for subject, chapters in (removed_entry.get("subjects") or {}).items():
        if not isinstance(chapters, list):
            continue
        for chapter in chapters:
            if isinstance(chapter, dict) and isinstance(chapter.get("pdf"), dict):
                delete_syllabus_pdf_file(chapter["pdf"].get("stored_filename"))

    save_syllabus(remaining_entries)
    return removed_entry, load_syllabus()


@app.route("/api/admin/syllabus/chapter", methods=["DELETE"])
def delete_syllabus_chapter():
    if not session.get("admin_logged_in"):
        return jsonify({"ok": False, "message": "Admin login required."}), 403

    payload = request_payload()
    class_name = clean_text(payload.get("class"))
    subject = clean_text(payload.get("subject"))
    try:
        index = int(payload.get("index"))
    except (TypeError, ValueError):
        return jsonify({"ok": False, "message": "Chapter index is required."}), 400

    if not class_name or subject not in SUBJECT_FIELDS:
        return jsonify({"ok": False, "message": "Class and valid subject are required."}), 400

    syllabus = load_syllabus()
    target_key = syllabus_class_key(class_name)
    entry = None
    for item in syllabus:
        if syllabus_class_key(item.get("class")) == target_key:
            entry = item
            break

    if entry is None:
        return jsonify({"ok": False, "message": "Syllabus entry not found."}), 404

    subjects = entry.get("subjects") or {}
    chapters = subjects.get(subject)
    if not isinstance(chapters, list) or index < 0 or index >= len(chapters):
        return jsonify({"ok": False, "message": "Chapter not found."}), 404

    removed_chapter = chapters.pop(index)
    if isinstance(removed_chapter, dict) and isinstance(removed_chapter.get("pdf"), dict):
        delete_syllabus_pdf_file(removed_chapter["pdf"].get("stored_filename"))

    if chapters:
        subjects[subject] = chapters
    else:
        subjects.pop(subject, None)

    entry["subjects"] = subjects
    save_syllabus(syllabus)

    return jsonify(
        {
            "ok": True,
            "message": "Chapter deleted successfully.",
            "syllabus": load_syllabus(),
        }
    )
@app.route("/api/admin/syllabus/<path:class_name>", methods=["DELETE"])

def delete_syllabus_entry(class_name):
    if not session.get("admin_logged_in"):
        return jsonify({"ok": False, "message": "Admin login required."}), 403

    removed_entry, remaining_entries = remove_syllabus_entry(class_name)
    if removed_entry is None:
        return jsonify({"ok": False, "message": "Syllabus entry not found."}), 404

    return jsonify(
        {
            "ok": True,
            "message": f"Syllabus for class {removed_entry.get('class')} deleted successfully.",
            "syllabus": remaining_entries,
        }
    )
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
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT value FROM meta WHERE key = ?", (key,))
    row = cur.fetchone()
    conn.close()
    return row["value"] if row is not None else None


def set_meta_value(key, value):
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, str(value)),
    )
    conn.commit()
    conn.close()
    return str(value or "").strip().lower()


def load_admin_credentials():
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT username, password_hash FROM admin_credentials WHERE id = 1")
    row = cur.fetchone()
    conn.close()
    if row is None:
        # seed default
        from werkzeug.security import generate_password_hash
        save_admin_credentials({"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        return {"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD, "password_hash": generate_password_hash(ADMIN_PASSWORD)}
    # support both hashed and plaintext
    result = {"username": row["username"]}
    if "password_hash" in row.keys() and row["password_hash"]:
        result["password_hash"] = row["password_hash"]
    else:
        result["password"] = row.get("password", ADMIN_PASSWORD) if hasattr(row, "get") else ADMIN_PASSWORD
    return result


def save_admin_credentials(credentials):
    from werkzeug.security import generate_password_hash
    username = credentials.get("username", ADMIN_EMAIL)
    password = credentials.get("password")
    password_hash = credentials.get("password_hash")
    if password_hash is None and password is not None:
        password_hash = generate_password_hash(password)
    if password_hash is None:
        password_hash = generate_password_hash(ADMIN_PASSWORD)
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO admin_credentials (id,username,password_hash) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET username=excluded.username, password_hash=excluded.password_hash",
        (username, password_hash),
    )
    conn.commit()
    conn.close()


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

    syllabus_entry = {"class": class_name, "subjects": {}}

    for field in SUBJECT_FIELDS:
        chapters = []
        index = 0
        while True:
            title_key = f"{field}_chapter_{index}_title"
            content_key = f"{field}_chapter_{index}_content"
            title = clean_text(payload.get(title_key))
            content = clean_text(payload.get(content_key))
            if title_key not in payload and content_key not in payload:
                # also check for any higher index? stop at first gap
                if index > 0 and (f"{field}_chapter_{index + 1}_title" in payload or f"{field}_chapter_{index + 1}_content" in payload):
                    index += 1
                    continue
                break
            if title or content:
                chapters.append({"title": title, "content": content})
            index += 1
            if index > 50:
                break

        if chapters:
            syllabus_entry["subjects"][field] = chapters

    if not syllabus_entry["subjects"]:
        return syllabus_entry, None
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
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS c FROM admin_credentials")
    count = cur.fetchone()["c"]
    conn.close()
    return count > 0


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

    password_ok = False
    if "password_hash" in credentials:
        from werkzeug.security import check_password_hash

        password_ok = check_password_hash(credentials["password_hash"], password)
    else:
        password_ok = password == credentials.get("password")

    if password_ok:
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
    payload = request_payload()
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))
    confirm_password = str(payload.get("confirm_password", ""))

    if not username or not password:
        return jsonify({"ok": False, "message": "Username and password are required."}), 400

    if password != confirm_password and confirm_password:
        return jsonify({"ok": False, "message": "Passwords do not match."}), 400

    is_logged_in = bool(session.get("admin_logged_in"))
    if not is_logged_in and admin_is_configured():
        return jsonify({"ok": False, "message": "Admin login required."}), 403

    save_admin_credentials({"username": username, "password": password})

    session["admin_logged_in"] = True
    session["admin_username"] = username
    return jsonify(
        {
            "ok": True,
            "message": "Admin credentials saved successfully.",
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
        chapters = syllabus_entry["subjects"].get(field, [])
        for index in range(len(chapters)):
            file = request.files.get(f"{field}_chapter_{index}_pdf")
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
            uploaded_pdfs.append((field, index, file, original_filename))

    if not syllabus_entry["subjects"] and not uploaded_pdfs:
        return jsonify(
            {
                "ok": False,
                "message": "Add at least one subject syllabus or PDF attachment before saving.",
            }
        ), 400

    existing_subjects = existing.get("subjects", {}) if existing else {}
    new_subjects = {k: [dict(c) for c in v] for k, v in syllabus_entry["subjects"].items()}

    saved_filenames = []
    replaced_pdfs = []

    try:
        if uploaded_pdfs:
            SYLLABUS_PDF_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        for field, index, file, original_filename in uploaded_pdfs:
            chapters = new_subjects.setdefault(field, [])
            while len(chapters) <= index:
                chapters.append({"title": "", "content": ""})
            stored_filename = f"{uuid.uuid4().hex}.pdf"
            file.save(SYLLABUS_PDF_UPLOAD_DIR / stored_filename)
            saved_filenames.append(stored_filename)

            previous_pdf = None
            # (append-only: new chapters never replace existing pdfs)

            chapters[index]["pdf"] = {
                "original_filename": original_filename,
                "stored_filename": stored_filename,
                "url": build_syllabus_pdf_url(stored_filename),
            }

        syllabus_entry["subjects"] = new_subjects

    except OSError:
        for stored_filename in saved_filenames:
            delete_syllabus_pdf_file(stored_filename)
        return jsonify({"ok": False, "message": "Unable to save the PDF attachment."}), 500

    if existing is None:
        syllabus.append(syllabus_entry)
        action = "added"
    else:
        # merge new chapters into existing subjects (append, one at a time)
        merged_subjects = dict(existing.get("subjects") or {})
        for field, chapters in (syllabus_entry.get("subjects") or {}).items():
            merged_subjects.setdefault(field, []).extend(chapters)
        existing["subjects"] = merged_subjects
        existing["class"] = syllabus_entry["class"]
        syllabus_entry["subjects"] = merged_subjects
        action = "updated"

    syllabus.sort(key=lambda item: syllabus_class_key(item.get("class")))
    save_syllabus(syllabus)

    for stored_filename in replaced_pdfs:
        delete_syllabus_pdf_file(stored_filename)

    return jsonify(
        {
            "ok": True,
            "message": f"Syllabus for class {syllabus_entry['class']} {action} successfully.",
            "syllabus": load_syllabus(),
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


db.init_db()

if not admin_is_configured():
    save_admin_credentials({"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD})

if __name__ == "__main__":
    app.run(debug=True)
