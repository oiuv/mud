"""Shared business admission for direct and delegated entry paths."""
import threading
from contextlib import contextmanager

from .runtime.contracts import RuntimeFault


class Capacity:
    def __init__(self, size):
        self._slots = threading.BoundedSemaphore(size)
        self._lock = threading.Lock()
        self._active = 0

    @property
    def active(self):
        with self._lock:
            return self._active > 0

    @contextmanager
    def enter(self):
        if not self._slots.acquire(blocking=False):
            raise RuntimeFault("business_busy")
        with self._lock:
            self._active += 1
        try:
            yield
        finally:
            with self._lock:
                self._active -= 1
            self._slots.release()
