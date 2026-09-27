import sqlite3

conn = sqlite3.connect("toms.db")
cur = conn.cursor()

for column, col_type in [
    ("incident_datetime", "TEXT"),
    ("job_no", "TEXT"),
    ("customer_id", "INTEGER"),
    ("driver", "TEXT"),
    ("supplier_id", "INTEGER"),
    ("category", "TEXT"),
    ("category_detail", "TEXT"),
    ("injury_category", "TEXT"),
    ("root_cause", "TEXT"),
    ("shipment_content", "TEXT"),
    ("third_party_life", "TEXT"),
    ("driver_assistant_life", "TEXT"),
    ("vehicle_impact", "TEXT"),
    ("third_party_property", "TEXT"),
    ("delivery_on_time", "TEXT"),
    ("involvement_of_police", "TEXT"),
    ("legal_impact", "TEXT"),
]:
    try:
        cur.execute(f"ALTER TABLE breakdowns ADD COLUMN {column} {col_type}")
    except sqlite3.OperationalError:
        pass

cur.execute("""
    CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )
""")

conn.commit()
conn.close()
print("Migration complete.")