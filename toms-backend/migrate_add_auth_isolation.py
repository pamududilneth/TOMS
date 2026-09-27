import sqlite3

conn = sqlite3.connect("toms.db")
cur = conn.cursor()

for table, column, col_type in [
    ("users", "email", "TEXT"),
    ("users", "google_sub", "TEXT"),
    ("incidents", "owner_id", "INTEGER"),
    ("breakdowns", "owner_id", "INTEGER"),
]:
    try:
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
    except sqlite3.OperationalError:
        pass

conn.commit()
conn.close()
print("Migration complete.")