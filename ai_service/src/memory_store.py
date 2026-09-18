"""SQLite relationship storage; migrate legacy JSON once without changing it."""
import json
from pathlib import Path
from .database import connect, initialize
from .settings import load_settings


class MemoryStore:
    def __init__(self, data_dir=None):
        self.data_dir = load_settings().data_dir if data_dir is None else Path(data_dir)
        self.db_path = self.data_dir / "conversations.db"
        initialize(self.db_path)
        with connect(self.db_path) as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS player_memories(
                    npc_id TEXT NOT NULL, player_id TEXT NOT NULL, data TEXT NOT NULL,
                    PRIMARY KEY(npc_id,player_id)
                );
                CREATE TABLE IF NOT EXISTS migrations(name TEXT PRIMARY KEY);
            """)
            db.execute("BEGIN IMMEDIATE")
            if not db.execute("SELECT 1 FROM migrations WHERE name='memories_json'").fetchone():
                source = self.data_dir / "memories.json"
                if source.exists():
                    memories = json.loads(source.read_text(encoding="utf-8"))
                    if not isinstance(memories, dict):
                        raise ValueError("Invalid legacy memories.json; original file is preserved")
                    for npc_id, players in memories.items():
                        for player_id, memory in players.items():
                            if not isinstance(memory, dict):
                                raise ValueError("Invalid legacy memory record")
                            db.execute("INSERT OR IGNORE INTO player_memories VALUES(?,?,?)",
                                       (npc_id, player_id, json.dumps(memory, ensure_ascii=False)))
                db.execute("INSERT INTO migrations VALUES('memories_json')")

    def get_player_memory(self, npc_name, player_id):
        with connect(self.db_path) as db:
            row = db.execute("SELECT data FROM player_memories WHERE npc_id=? AND player_id=?",
                             (npc_name, player_id)).fetchone()
        return json.loads(row["data"]) if row else {}

    def update_player_memory(self, npc_name, player_id, player_name, updates):
        with connect(self.db_path) as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT data FROM player_memories WHERE npc_id=? AND player_id=?",
                             (npc_name, player_id)).fetchone()
            memory = json.loads(row["data"]) if row else {}
            memory.update(updates)
            memory["name"] = player_name
            db.execute("""
                INSERT INTO player_memories VALUES(?,?,?)
                ON CONFLICT(npc_id,player_id) DO UPDATE SET data=excluded.data
            """, (npc_name, player_id, json.dumps(memory, ensure_ascii=False)))

    def get_npc_players(self, npc_name):
        with connect(self.db_path) as db:
            return {row["player_id"]: json.loads(row["data"]) for row in db.execute(
                "SELECT player_id,data FROM player_memories WHERE npc_id=?", (npc_name,))}
