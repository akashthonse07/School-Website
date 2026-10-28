import app, db

conn = db.get_connection()
cur = conn.cursor()
cur.execute("DELETE FROM students WHERE roll_no IN (101,102,103,104,105)")
conn.commit()
remaining_rows = cur.execute("SELECT roll_no,name,class,maths,science,english,kannada,social_science,hindi FROM students").fetchall()
conn.close()

remaining = []
for row in remaining_rows:
    remaining.append({
        "roll_no": int(row["roll_no"]),
        "name": row["name"],
        "class": row["class"],
        "maths": int(row["maths"]),
        "science": int(row["science"]),
        "english": int(row["english"]),
        "kannada": int(row["kannada"]),
        "social_science": int(row["social_science"]),
        "hindi": int(row["hindi"]),
    })

app.save_students(remaining)
app.set_meta_value("students_seeded", "1")
print("remaining students:", [s["roll_no"] for s in app.load_students()])