"""BM25 + dense retrieval, reciprocal rank fusion, then DashScope reranking."""
import hashlib
import json
import logging
import threading
import time
from collections import OrderedDict
from pathlib import Path

import httpx
import numpy as np
from openai import OpenAI

from .database import connect, initialize
from .knowledge_basic import BasicKnowledgeSystem
from .settings import load_settings

logger = logging.getLogger(__name__)


def remaining_timeout(settings, deadline=None, *, timeout=None):
    limit = settings.api_timeout if timeout is None else timeout
    remaining = limit if deadline is None else deadline - time.monotonic()
    if remaining <= 0:
        raise TimeoutError("AI request deadline exceeded")
    return min(limit, remaining)


class QwenKnowledgeSystem:
    def __init__(self, data_dir=None, model_name=None, dimensions=None, settings=None, basic=None, client=None):
        self.settings = settings or load_settings()
        self.data_dir = Path(data_dir) if data_dir is not None else self.settings.data_dir
        self.model_name = model_name or self.settings.embedding_model
        self.dimensions = dimensions or self.settings.embedding_dimensions
        self.basic = basic or BasicKnowledgeSystem(self.data_dir, self.settings)
        self.db_path = self.data_dir / "qwen_knowledge.db"
        self.client = client
        self._lock = threading.RLock()
        self.vector_cache = OrderedDict()
        self.cache_stats = {"hits": 0, "misses": 0, "total": 0}
        self.fingerprint = hashlib.sha256(json.dumps(
            [self.settings.embedding_base_url, self.model_name, self.dimensions]
        ).encode()).hexdigest()
        initialize(self.db_path)
        with connect(self.db_path) as db:
            # Legacy vectors are preserved but never silently reused for another model.
            db.execute("""CREATE TABLE IF NOT EXISTS embeddings(
                document_id TEXT NOT NULL,fingerprint TEXT NOT NULL,vector BLOB NOT NULL,
                PRIMARY KEY(document_id,fingerprint))""")

    def _client(self):
        with self._lock:
            if self.client is None:
                if not self.settings.dashscope_api_key:
                    raise RuntimeError("DASHSCOPE_API_KEY is not configured")
                self.client = OpenAI(api_key=self.settings.dashscope_api_key,
                                     base_url=self.settings.embedding_base_url,
                                     timeout=self.settings.api_timeout, max_retries=0)
            return self.client

    def get_embedding(self, text, deadline=None):
        if len(text.encode("utf-8")) > self.settings.embedding_max_bytes:
            raise ValueError("Embedding input exceeds configured byte budget")
        result = self._client().with_options(
            timeout=remaining_timeout(self.settings, deadline)
        ).embeddings.create(model=self.model_name, input=text, dimensions=self.dimensions,
                            encoding_format="float")
        vector = np.asarray(result.data[0].embedding, dtype=np.float32)
        if vector.shape != (self.dimensions,) or not np.all(np.isfinite(vector)) or np.linalg.norm(vector) == 0:
            raise ValueError("Invalid embedding vector")
        return vector

    def _query_vector(self, query, deadline=None):
        now = time.monotonic()
        with self._lock:
            self.cache_stats["total"] += 1
            cached = self.vector_cache.get(query)
            if cached and now - cached[0] < self.settings.vector_cache_ttl:
                self.cache_stats["hits"] += 1
                self.vector_cache.move_to_end(query)
                return cached[1]
            self.vector_cache.pop(query, None)
            self.cache_stats["misses"] += 1
        vector = self.get_embedding(query, deadline)
        # Failed calls raise; zero vectors and errors never poison the cache.
        with self._lock:
            self.vector_cache[query] = (time.monotonic(), vector)
            while len(self.vector_cache) > self.settings.vector_cache_size:
                self.vector_cache.popitem(last=False)
        return vector

    def process_files(self):
        self.basic.process_files()
        return self.update_vectors()

    def update_vectors(self):
        _, documents = self.basic.corpus()
        with connect(self.db_path) as db:
            existing = {row[0] for row in db.execute(
                "SELECT document_id FROM embeddings WHERE fingerprint=?", (self.fingerprint,))}
        missing = [doc for doc in documents if doc["id"] not in existing]
        logger.info("Vector update: %s missing of %s chunks", len(missing), len(documents))
        for index, document in enumerate(missing, 1):
            vector = self.get_embedding(document["content"])
            # Commit completed work immediately. A later API failure must not discard it.
            # No SQLite write transaction remains open during remote calls.
            with connect(self.db_path) as db:
                db.execute("INSERT OR REPLACE INTO embeddings VALUES(?,?,?)",
                           (document["id"], self.fingerprint, vector.tobytes()))
            if index % 25 == 0:
                logger.info("Vector update progress: %s/%s", index, len(missing))
        active = {doc["id"] for doc in documents}
        with connect(self.db_path) as db:
            db.executemany("DELETE FROM embeddings WHERE document_id=? AND fingerprint=?",
                           [(doc_id, self.fingerprint) for doc_id in existing - active])
        return len(documents)

    def semantic_search(self, query, limit=5, threshold=0.4, deadline=None):
        if not query.strip() or threshold >= 1 or limit <= 0:
            return []
        _, documents = self.basic.corpus()
        by_id = {doc["id"]: doc for doc in documents}
        with connect(self.db_path) as db:
            rows = db.execute("SELECT document_id,vector FROM embeddings WHERE fingerprint=?",
                              (self.fingerprint,)).fetchall()
        valid = []
        for row in rows:
            if row["document_id"] not in by_id:
                continue
            vector = np.frombuffer(row["vector"], dtype=np.float32)
            if vector.shape == (self.dimensions,) and np.all(np.isfinite(vector)) and np.linalg.norm(vector) > 0:
                valid.append((row["document_id"], vector))
        if not valid:
            return []
        query_vector = self._query_vector(query, deadline)
        matrix = np.stack([item[1] for item in valid])
        scores = (matrix @ query_vector) / (np.linalg.norm(matrix, axis=1) * np.linalg.norm(query_vector))
        ranked = np.argsort(-scores)
        return [dict(by_id[valid[i][0]], score=float(scores[i]), vector_score=float(scores[i]))
                for i in ranked if scores[i] >= threshold][:limit]

    def rerank(self, query, documents, limit, deadline=None):
        if not documents or not self.settings.rerank_enabled or not self.settings.dashscope_api_key:
            return documents[:limit]
        query_bytes = len(query.encode("utf-8"))
        if query_bytes > min(4000, self.settings.rerank_max_bytes):
            return documents[:limit]
        selected, texts, total = [], [], 0
        for doc in documents:
            text = doc["title"] + "\n" + doc["content"]
            length = len(text.encode("utf-8"))
            if length > self.settings.rerank_max_bytes:
                continue
            if total + query_bytes + length > self.settings.rerank_total_bytes:
                break
            selected.append(doc)
            texts.append(text)
            total += query_bytes + length
        if not selected:
            return documents[:limit]
        body = {"model": self.settings.rerank_model,
                "input": {"query": query, "documents": texts},
                "parameters": {"top_n": min(limit, len(texts)),
                               "instruct": "Given a Chinese martial arts game question, retrieve relevant game help passages."}}
        response = httpx.post(self.settings.rerank_url,
                              headers={"Authorization": f"Bearer {self.settings.dashscope_api_key}"},
                              json=body, timeout=remaining_timeout(self.settings, deadline))
        response.raise_for_status()
        data = response.json()
        if data.get("code"):
            raise ValueError("Rerank API returned an error")
        results = data["output"]["results"]
        if not isinstance(results, list) or not results:
            raise ValueError("Rerank API returned no results")
        ranked, seen = [], set()
        for result in results:
            index, score = result["index"], result["relevance_score"]
            if (type(index) is not int or not 0 <= index < len(selected)
                    or index in seen or not isinstance(score, (int, float)) or not np.isfinite(score)):
                raise ValueError("Invalid rerank result")
            seen.add(index)
            ranked.append(dict(selected[index], rerank_score=float(score)))
        return sorted(ranked, key=lambda doc: doc["rerank_score"], reverse=True)[:limit]

    def hybrid_search(self, query, limit=None, threshold=0.4, deadline=None):
        limit = self.settings.retrieval_top_k if limit is None else limit
        if threshold >= 1 or limit <= 0 or not query.strip():
            return []
        count = max(limit, self.settings.retrieval_candidates)
        keyword = self.basic.search(query, count)
        try:
            semantic = self.semantic_search(query, count, threshold, deadline)
        except Exception as error:
            logger.warning("Vector retrieval unavailable (%s); using BM25", type(error).__name__)
            semantic = []
        fused = {}
        for source, ranking in (("bm25", keyword), ("vector", semantic)):
            for rank, doc in enumerate(ranking, 1):
                entry = fused.setdefault(doc["id"], dict(doc, score=0.0, sources=[]))
                entry["score"] += 1.0 / (60 + rank)
                entry["sources"].append(source)
                score_key = f"{source}_score"
                if score_key in doc:
                    entry[score_key] = doc[score_key]
        candidates = sorted(fused.values(), key=lambda doc: doc["score"], reverse=True)[:count]
        try:
            return self.rerank(query, candidates, limit, deadline)
        except Exception as error:
            logger.warning("Reranking unavailable (%s); using fused ranks", type(error).__name__)
            return candidates[:limit]

    def get_cache_rate(self):
        with self._lock:
            return 100 * self.cache_stats["hits"] / max(1, self.cache_stats["total"])

    def get_stats(self):
        stats = self.basic.get_stats()
        with connect(self.db_path) as db:
            stats["indexed_vectors"] = db.execute(
                "SELECT COUNT(*) FROM embeddings WHERE fingerprint=?", (self.fingerprint,)).fetchone()[0]
        stats.update(model=self.model_name, dimensions=self.dimensions,
                     cache_stats=dict(self.cache_stats, hit_rate_percent=round(self.get_cache_rate(), 2)))
        return stats
