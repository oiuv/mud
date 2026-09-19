"""Synchronize help chunks and resume missing embeddings before service startup."""
import logging

from .knowledge_basic import BasicKnowledgeSystem
from .knowledge_qwen import QwenKnowledgeSystem

logger = logging.getLogger(__name__)


def update_knowledge(settings):
    basic = BasicKnowledgeSystem(settings=settings, auto_build=False)
    before, _ = basic.corpus()
    basic.process_files()
    after, _ = basic.corpus()
    stats = basic.get_stats()
    stats["changed"] = before != after
    logger.info("BM25 %s: %s source files, %s chunks",
                "updated" if stats["changed"] else "unchanged",
                stats["source_files"], stats["total_documents"])
    if not settings.dashscope_api_key:
        stats["vectors"] = "skipped"
        logger.info("DASHSCOPE_API_KEY is not configured; using local BM25")
        return stats
    try:
        vectors = QwenKnowledgeSystem(settings=settings, basic=basic)
        vectors.update_vectors()
        stats["vectors"] = "ready"
        stats["indexed_vectors"] = vectors.get_stats()["indexed_vectors"]
        logger.info("Vector index ready: %s chunks (%s)",
                    stats["indexed_vectors"], settings.embedding_model)
    except Exception as error:
        # Completed vectors are committed individually and reused on the next startup.
        stats["vectors"] = "unavailable"
        logger.warning("Vector update failed (%s); continuing with BM25; will retry missing vectors next startup",
                       type(error).__name__)
    return stats
