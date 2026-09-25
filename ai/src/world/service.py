"""Short durable acknowledgements and one separately scheduled narration worker."""
import json
import logging
import sqlite3
import threading
import time

from ..llm import ModelUnavailable
from ..protocol import RequestError
from .generator import Generator, PROMPT_VERSION
from .protocol import DIGEST
from .store import Store

logger = logging.getLogger(__name__)


class WorldService:
    request_types = ("world_describe", "world_status")

    def __init__(self, settings, *, generator=None, chat_busy=lambda: False, start_worker=True):
        self.settings = settings
        self.store = None
        self.generator = generator
        self._owns_generator = generator is None
        self.chat_busy = chat_busy
        self._stop = threading.Event()
        self._wake = threading.Event()
        self._worker = None
        self._backoff = 0.0
        self._tick_lock = threading.Lock()
        if not settings.world_enabled:
            return
        if generator is None and (not settings.chat_api_key or settings.chat_api_key.startswith("your-")):
            logger.warning("World creation disabled: model is unconfigured")
            return
        try:
            self.store = Store(settings)
            self.store.refresh_usage()
            if self.generator is None:
                self.generator = Generator(settings)
            if start_worker:
                self._worker = threading.Thread(target=self._run, name="world-narration", daemon=True)
                self._worker.start()
        except Exception as error:
            if self.store:
                self.store.close()
            self.store = None
            self._worker = None
            if self._owns_generator and self.generator is not None:
                self.generator.close()
                self.generator = None
            logger.warning("World creation disabled: error=%s; NPC service unaffected", type(error).__name__)

    def process_request(self, request, deadline):
        if time.monotonic() >= deadline:
            raise TimeoutError()
        key = request.get("content_key")
        if not isinstance(key, str) or not DIGEST.fullmatch(key):
            raise RequestError("invalid_request", "Invalid world content key")
        response = {"content_key": key, "status": "retry_later"}
        if self._stop.is_set() or self.store is None:
            return response
        try:
            if request["type"] == "world_describe":
                payload = {name: value for name, value in request.items() if name not in ("type", "request_id")}
                row = self.store.submit(payload, deadline)
                accepted = row is not None and row["state"] == "queued" and row["attempts"] == 0
            elif request["type"] == "world_status":
                if set(request) != {"type", "request_id", "content_key"}:
                    raise ValueError("status fields")
                row = self.store.get(key)
                accepted = False
            else:
                raise ValueError("world request type")
            if row is None:
                return response
            self.store.request_repair(row)
            row = self.store.get(key)
            response["status"] = ("ready" if row["published"] else "pending") if row["state"] == "ready" else (
                "failed" if row["state"] == "failed" else "accepted" if accepted else "pending")
            response["state"] = row["state"]
            self._wake.set()
            return response
        except (ValueError, TypeError, KeyError, UnicodeError, RecursionError):
            raise RequestError("invalid_request", "Invalid world facts or manifest") from None
        except (OSError, sqlite3.Error):
            logger.warning("World request not acknowledged: persistence unavailable")
            return response

    def tick(self, allowed_keys=None):
        if not self._tick_lock.acquire(blocking=False):
            return False
        try:
            return self._tick(allowed_keys)
        finally:
            self._tick_lock.release()

    def _tick(self, allowed_keys):
        if self.store is None or self._stop.is_set():
            return False
        if time.monotonic() - self.store._usage_at >= 60:
            self.store.refresh_usage()
        # Repairs do not need a model or budget, and continue while chat is busy.
        self.store.publish_pending()
        if self.chat_busy() or time.monotonic() < self._backoff:
            return False
        row = self.store.claim(allowed_keys=allowed_keys)
        if not row:
            return False
        if isinstance(self.generator, Generator):
            self.generator.usage = {}
        try:
            payload = json.loads(row["payload"])
            self.store.verify_world(payload)
            prose = self.generator(payload)
            usage = self.generator.usage if isinstance(self.generator, Generator) else None
            self.store.complete(row, prose, self.settings.chat_model, PROMPT_VERSION, usage)
        except Exception as error:
            code = error.code if isinstance(error, ModelUnavailable) else "invalid_result" if isinstance(error, ValueError) else "generation_failed"
            retry_after = getattr(error, "retry_after", 0) or 0
            if getattr(error, "status_code", None) == 429:
                retry_after = max(60, retry_after)
                self._backoff = time.monotonic() + retry_after
            usage = self.generator.usage if isinstance(self.generator, Generator) else None
            self.store.fail(row["content_key"], code, retry_after, usage=usage)
            logger.warning("World attempt failed: key=%s code=%s", row["content_key"], code)
        self.store.publish_pending()
        return True

    def _run(self):
        while not self._stop.is_set():
            try:
                if self.tick():
                    continue
            except Exception as error:
                logger.warning("World worker paused: error=%s", type(error).__name__)
            self._wake.wait(1)
            self._wake.clear()

    def close(self):
        self._stop.set()
        self._wake.set()
        # Do not release the process lock while a model call could still be live.
        if self._worker is not None:
            self._worker.join()
        if self._owns_generator and self.generator is not None:
            self.generator.close()
        if self.store is not None:
            self.store.close()
