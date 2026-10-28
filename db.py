import json
import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = os.environ.get("DATABASE_PATH", str(BASE_DIR / "data" / "school.db"))


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_connection()
    cur = conn.cursor()
    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS students (
            roll_no INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            class TEXT NOT NULL,
            maths INTEGER DEFAULT 0,
            science INTEGER DEFAULT 0,
            english INTEGER DEFAULT 0,
            kannada INTEGER DEFAULT 0,
            social_science INTEGER DEFAULT 0,
            hindi INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS syllabus (
            class TEXT PRIMARY KEY,
            data TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS event_photos (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS admin_credentials (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            username TEXT NOT NULL,
            password_hash TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        """
    )
    conn.commit()
    conn.close()


def seed_if_empty(load_students_default, load_syllabus_default, load_event_photos_default):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS c FROM students")
    if cur.fetchone()["c"] == 0:
        for s in load_students_default():
            cur.execute(
                "INSERT INTO students (roll_no,name,class,maths,science,english,kannada,social_science,hindi) VALUES (?,?,?,?,?,?,?,?,?)",
                (
                    int(s["roll_no"]), s["name"], s["class"],
                    int(s.get("maths", 0)), int(s.get("science", 0)), int(s.get("english", 0)),
                    int(s.get("kannada", 0)), int(s.get("social_science", 0)), int(s.get("hindi", 0)),
                ),
            )
    cur.execute("SELECT COUNT(*) AS c FROM syllabus")
    if cur.fetchone()["c"] == 0:
        for e in load_syllabus_default():
            cur.execute("INSERT INTO syllabus (class,data) VALUES (?,?)", (e["class"], json.dumps(e)))
    cur.execute("SELECT COUNT(*) AS c FROM event_photos")
    if cur.fetchone()["c"] == 0:
        for p in load_event_photos_default():
            cur.execute("INSERT INTO event_photos (id,data) VALUES (?,?)", (p["id"], json.dumps(p)))
    conn.commit()
    conn.close()