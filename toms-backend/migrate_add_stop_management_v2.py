import sqlite3

conn = sqlite3.connect("toms.db")
cur = conn.cursor()

for column, col_type in [
    ("customer_id", "INTEGER"),
    ("stop_category", "TEXT"),
    ("job_no", "TEXT"),
    ("stopped_date", "TEXT"),
    ("stopped_time", "TEXT"),
    ("duration", "TEXT"),
]:
    try:
        cur.execute(f"ALTER TABLE incidents ADD COLUMN {column} {col_type}")
    except sqlite3.OperationalError:
        pass

conn.commit()
conn.close()
print("Migration complete.")