#!/usr/bin/env python3
"""Startup preflight: local corpus failures are fatal; vector failures degrade to BM25."""
import logging
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.knowledge_update import update_knowledge
from src.settings import load_settings


def main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    try:
        settings = load_settings()
        if settings.knowledge_update_enabled:
            update_knowledge(settings)
        else:
            logging.info("Startup knowledge update disabled by configuration")
        return 0
    except Exception as error:
        logging.error("Local knowledge update failed (%s): %s", type(error).__name__, error)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
