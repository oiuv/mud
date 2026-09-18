"""Local BM25 retrieval over complete, overlapping help-file chunks."""
import hashlib
import math
import re
import threading
from collections import Counter
from pathlib import Path

from .database import connect, initialize
from .settings import load_settings

STOP_WORDS = {"如何", "怎么", "什么", "请问", "一下", "一个", "哪些", "是否"}
TITLE_MAP = {"shaolin": "少林派", "wudang": "武当派", "emei": "峨眉派",
             "huashan": "华山派", "gaibang": "丐帮", "taohua": "桃花岛",
             "xingxiu": "星宿派", "xiaoyao": "逍遥派", "gumu": "古墓派",
             "quanzhen": "全真派", "mingjiao": "明教", "riyue": "日月神教",
             "newbie": "新手指南", "work": "工作指南", "menpai": "门派系统"}


def tokenize(text):
    """Chinese bigrams avoid an external dictionary; preserve English command names."""
    tokens = []
    for part in re.findall(r"[\u3400-\u9fff]+|[a-z0-9_-]+", text.lower()):
        if re.fullmatch(r"[\u3400-\u9fff]+", part):
            tokens.extend([part] if len(part) == 1 else
                          [part[i:i + 2] for i in range(len(part) - 1)])
        else:
            tokens.append(part)
    return [token for token in tokens if token not in STOP_WORDS]


class BM25Index:
    def __init__(self, documents):
        self.counts = [Counter(tokenize(
            f"{doc['title']} {doc['title']} {doc['filename']} {doc['content']}"
        )) for doc in documents]
        self.lengths = [sum(count.values()) for count in self.counts]
        self.average = sum(self.lengths) / max(1, len(self.lengths))
        self.frequencies = Counter(token for count in self.counts for token in count)

    def scores(self, query):
        scores = [0.0] * len(self.counts)
        for token in set(tokenize(query)):
            frequency = self.frequencies[token]
            if not frequency:
                continue
            idf = math.log(1 + (len(self.counts) - frequency + 0.5) / (frequency + 0.5))
            for index, count in enumerate(self.counts):
                tf = count[token]
                if tf:
                    denominator = tf + 1.5 * (0.25 + 0.75 * self.lengths[index] / (self.average or 1))
                    scores[index] += idf * tf * 2.5 / denominator
        return scores


class BasicKnowledgeSystem:
    def __init__(self, data_dir=None, settings=None, auto_build=True):
        self.settings = settings or load_settings()
        self.data_dir = Path(data_dir) if data_dir is not None else self.settings.data_dir
        self.help_dir = self.settings.help_dir
        self.db_path = self.data_dir / "basic_knowledge.db"
        self._lock = threading.RLock()
        self._revision = None
        self._documents = []
        self._index = BM25Index([])
        initialize(self.db_path)
        with connect(self.db_path) as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS chunks(
                    id TEXT PRIMARY KEY,title TEXT,filename TEXT,content TEXT,category TEXT
                );
                CREATE TABLE IF NOT EXISTS corpus_meta(id INTEGER PRIMARY KEY,revision INTEGER);
                INSERT OR IGNORE INTO corpus_meta VALUES(1,0);
            """)
            empty = db.execute("SELECT COUNT(*) FROM chunks").fetchone()[0] == 0
        if auto_build and empty and self.help_dir.is_dir():
            self.process_files()

    def process_files(self):
        if not self.help_dir.is_dir():
            raise FileNotFoundError(f"Help directory does not exist: {self.help_dir}")
        documents = []
        # Cap each chunk conservatively by UTF-8 bytes for both external models.
        max_bytes = min(self.settings.embedding_max_bytes, self.settings.rerank_max_bytes) - 1024
        if max_bytes < 16:
            raise ValueError("Model input budget is too small for document chunks")
        for file in sorted(self.help_dir.rglob("*")):
            if not file.is_file() or file.name.startswith("."):
                continue
            try:
                content = file.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                content = file.read_text(encoding="gbk", errors="replace")
            content = re.sub(r"\x1b\[[0-9;]*m|\$[A-Z]+\$", "", content).strip()
            if not content:
                continue
            filename = file.relative_to(self.help_dir).as_posix()
            title = TITLE_MAP.get(file.stem, file.stem)
            position, chunk_number = 0, 0
            while position < len(content):
                chunk = content[position:position + self.settings.chunk_size]
                chunk = chunk.encode("utf-8")[:max_bytes].decode("utf-8", errors="ignore")
                if not chunk:
                    raise ValueError("Empty chunk after applying model input budget")
                doc_id = hashlib.sha256(f"{filename}\0{chunk_number}\0{chunk}".encode()).hexdigest()
                documents.append((doc_id, title, filename, chunk, "帮助"))
                if position + len(chunk) >= len(content):
                    break
                position += max(1, len(chunk) - min(self.settings.chunk_overlap, len(chunk) // 2))
                chunk_number += 1
        with self._lock, connect(self.db_path) as db:
            # Compare full records: content, filenames, titles and chunk settings matter.
            db.execute("BEGIN IMMEDIATE")
            existing = {tuple(row) for row in db.execute("SELECT * FROM chunks")}
            if existing == set(documents):
                return len(documents)
            # Atomic swap; old corpus remains usable if reading/building failed.
            db.execute("DELETE FROM chunks")
            db.executemany("INSERT INTO chunks VALUES(?,?,?,?,?)", documents)
            db.execute("UPDATE corpus_meta SET revision=revision+1 WHERE id=1")
            self._revision = None
        return len(documents)

    def _refresh(self):
        with connect(self.db_path) as db:
            revision = db.execute("SELECT revision FROM corpus_meta WHERE id=1").fetchone()[0]
            if revision != self._revision:
                documents = [dict(row) for row in db.execute("SELECT * FROM chunks ORDER BY id")]
                self._documents = documents
                self._index = BM25Index(documents)
                self._revision = revision

    def corpus(self):
        with self._lock:
            self._refresh()
            return self._revision, [dict(doc) for doc in self._documents]

    def search(self, query, limit=3):
        if not query.strip() or limit <= 0:
            return []
        with self._lock:
            self._refresh()
            scores = self._index.scores(query)
            ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
            return [dict(self._documents[i], score=scores[i], bm25_score=scores[i])
                    for i in ranked if scores[i] > 0][:limit]

    def get_stats(self):
        _, documents = self.corpus()
        categories = Counter(doc["category"] for doc in documents)
        return {"total_documents": len(documents),
                "source_files": len({doc["filename"] for doc in documents}),
                "total_categories": len(categories), "category_distribution": dict(categories)}
