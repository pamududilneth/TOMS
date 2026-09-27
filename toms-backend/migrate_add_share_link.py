import sqlite3

conn = sqlite3.connect("toms.db")
cur = conn.cursor()

for column, col_type in [
    ("email", "TEXT"),
    ("first_shared_at", "TEXT"),
    ("share_link", "TEXT"),
]:
    try:
        cur.execute(f"ALTER TABLE clients ADD COLUMN {column} {col_type}")
    except sqlite3.OperationalError:
        pass  # already exists

conn.commit()
conn.close()
print("Migration complete.")