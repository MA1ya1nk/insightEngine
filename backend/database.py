import sqlite3
import json
from datetime import datetime

DB_PATH = "insightengine.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        topic TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        report_data TEXT,
        summary TEXT
    )''')
    conn.commit()
    conn.close()

def save_session(session_id: str, topic: str, status: str, report_data: dict = None, summary: str = None):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    existing = c.execute("SELECT id FROM sessions WHERE id=?", (session_id,)).fetchone()
    if existing:
        c.execute("""UPDATE sessions SET status=?, updated_at=?, report_data=?, summary=?
                     WHERE id=?""",
                  (status, now, json.dumps(report_data) if report_data else None, summary, session_id))
    else:
        c.execute("""INSERT INTO sessions (id, topic, status, created_at, updated_at, report_data, summary)
                     VALUES (?, ?, ?, ?, ?, ?, ?)""",
                  (session_id, topic, status, now, now, 
                   json.dumps(report_data) if report_data else None, summary))
    conn.commit()
    conn.close()

def get_sessions():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    rows = c.execute("SELECT * FROM sessions ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_session(session_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    row = c.execute("SELECT * FROM sessions WHERE id=?", (session_id,)).fetchone()
    conn.close()
    return dict(row) if row else None