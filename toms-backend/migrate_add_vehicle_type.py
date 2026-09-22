import sqlite3

conn = sqlite3.connect("toms.db")
cur = conn.cursor()
try:
    cur.execute("ALTER TABLE breakdowns ADD COLUMN vehicle_type TEXT")
except sqlite3.OperationalError:
    pass
conn.commit()
conn.close()
print("Migration complete.")