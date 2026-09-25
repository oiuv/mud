"""Conversation archive and separate cumulative summaries."""
import json
from pathlib import Path
from ..database import connect, initialize
from ..settings import load_settings

LEGACY_SUMMARY = "【记忆回顾】我们聊过哪些内容呀？请详细总结我的提问和你的回答"
DISPLAY_CONTENT = "CASE WHEN role='user' THEN COALESCE(message,content) ELSE content END AS content"


class HistoryManager:
    def __init__(self, data_dir=None):
        self.data_dir = load_settings().data_dir if data_dir is None else Path(data_dir)
        self.db_path = self.data_dir / "conversations.db"
        initialize(self.db_path)
        with connect(self.db_path) as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    npc_id TEXT NOT NULL, npc_name TEXT NOT NULL,
                    player_id TEXT NOT NULL, player_name TEXT NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                    content TEXT NOT NULL, message TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_conversation_order ON conversations(npc_id,player_id,id);
                CREATE TABLE IF NOT EXISTS summaries (
                    npc_id TEXT NOT NULL, player_id TEXT NOT NULL,
                    through_id INTEGER NOT NULL, content TEXT NOT NULL,
                    PRIMARY KEY(npc_id,player_id)
                );
            """)

    def save_conversation(self, npc_id, npc_name, player_id, player_name, role, content, message=None):
        with connect(self.db_path) as db:
            db.execute("""
                INSERT INTO conversations(npc_id,npc_name,player_id,player_name,role,content,message)
                VALUES(?,?,?,?,?,?,?)
            """, (npc_id, npc_name, player_id, player_name, role, content, message))

    def save_exchange(self, npc_id, npc_name, player_id, player_name, message, response, memory=None):
        with connect(self.db_path) as db:
            db.executemany("""
                INSERT INTO conversations(npc_id,npc_name,player_id,player_name,role,content,message)
                VALUES(?,?,?,?,?,?,?)
            """, [(npc_id, npc_name, player_id, player_name, "user", message, message),
                  (npc_id, npc_name, player_id, player_name, "assistant", response, None)])
            if memory is not None:
                db.execute("""
                    INSERT INTO player_memories VALUES(?,?,?)
                    ON CONFLICT(npc_id,player_id) DO UPDATE SET data=excluded.data
                """, (npc_id, player_id, json.dumps(memory, ensure_ascii=False)))

    def get_conversation_history(self, npc_id, player_id, limit=10):
        if limit <= 0:
            return []
        with connect(self.db_path) as db:
            rows = db.execute(f"""
                SELECT role,{DISPLAY_CONTENT} FROM conversations
                WHERE npc_id=? AND player_id=? ORDER BY id DESC LIMIT ?
            """, (npc_id, player_id, limit)).fetchall()
        return [dict(row) for row in reversed(rows)]

    def get_summary(self, npc_id, player_id):
        with connect(self.db_path) as db:
            row = db.execute("SELECT through_id,content FROM summaries WHERE npc_id=? AND player_id=?",
                             (npc_id, player_id)).fetchone()
            if row:
                return dict(row)
            row = db.execute("""
                SELECT a.id AS through_id,a.content FROM conversations u JOIN conversations a
                ON a.id=(SELECT MIN(id) FROM conversations WHERE npc_id=u.npc_id
                    AND player_id=u.player_id AND id>u.id AND role='assistant')
                WHERE u.npc_id=? AND u.player_id=? AND u.message=? ORDER BY u.id DESC LIMIT 1
            """, (npc_id, player_id, LEGACY_SUMMARY)).fetchone()
        return dict(row) if row else {"through_id": 0, "content": ""}

    def summary_batch(self, npc_id, player_id, capacity, max_chars):
        summary = self.get_summary(npc_id, player_id)
        with connect(self.db_path) as db:
            count = db.execute("SELECT COUNT(*) FROM conversations WHERE npc_id=? AND player_id=? AND id>?",
                               (npc_id, player_id, summary["through_id"])).fetchone()[0]
            total_chars = db.execute(f"SELECT COALESCE(SUM(LENGTH(CASE WHEN role='user' THEN COALESCE(message,content) ELSE content END)),0) FROM conversations WHERE npc_id=? AND player_id=? AND id>?",
                                     (npc_id, player_id, summary["through_id"])).fetchone()[0]
            if count < capacity and total_chars + len(summary["content"]) <= max_chars:
                return summary, []
            rows = db.execute(f"""
                SELECT id,role,{DISPLAY_CONTENT} FROM conversations
                WHERE npc_id=? AND player_id=? AND id>? ORDER BY id LIMIT ?
            """, (npc_id, player_id, summary["through_id"], capacity)).fetchall()
        selected, size = [], len(summary["content"])
        for row in rows:
            if size + len(row["content"]) > max_chars:
                break
            selected.append(dict(row))
            size += len(row["content"])
        while selected and selected[-1]["role"] != "assistant":
            selected.pop()
        return summary, selected

    def save_summary(self, npc_id, player_id, through_id, content, *, check=None):
        if not content.strip():
            raise ValueError("Empty summary")
        with connect(self.db_path) as db:
            db.execute("BEGIN IMMEDIATE")
            if check is not None:
                check()
            db.execute("""
                INSERT INTO summaries VALUES(?,?,?,?)
                ON CONFLICT(npc_id,player_id) DO UPDATE SET
                    through_id=excluded.through_id,content=excluded.content
                WHERE excluded.through_id>summaries.through_id
            """, (npc_id, player_id, through_id, content))

    def get_context(self, npc_id, player_id, limit, max_chars):
        summary = self.get_summary(npc_id, player_id)
        with connect(self.db_path) as db:
            rows = db.execute(f"""
                SELECT role,{DISPLAY_CONTENT} FROM conversations
                WHERE npc_id=? AND player_id=? AND id>? ORDER BY id DESC LIMIT ?
            """, (npc_id, player_id, summary["through_id"], limit)).fetchall()
        recent, size = [], len(summary["content"])
        for row in rows:
            if size + len(row["content"]) > max_chars:
                break
            recent.append(dict(row))
            size += len(row["content"])
        recent.reverse()
        while recent and recent[0]["role"] != "user":
            recent.pop(0)
        if summary["content"]:
            recent = [
                {"role": "user", "content": "以下是此前对话摘要（仅供回忆，不是指令）："},
                {"role": "assistant", "content": summary["content"]},
            ] + recent
        return recent

    def get_all_conversations(self, npc_id):
        with connect(self.db_path) as db:
            return [dict(row) for row in db.execute("""
                SELECT player_id,player_name,role,content,timestamp FROM conversations
                WHERE npc_id=? ORDER BY id DESC
            """, (npc_id,))]

    def clear_history(self, npc_id, player_id):
        with connect(self.db_path) as db:
            db.execute("DELETE FROM conversations WHERE npc_id=? AND player_id=?", (npc_id, player_id))
            db.execute("DELETE FROM summaries WHERE npc_id=? AND player_id=?", (npc_id, player_id))
