"""A live socket caller, not an Agent task-duration budget."""
import threading
import time

HEARTBEAT_SECONDS = 5
LEASE_SECONDS = 30


class RequestLifetime:
    def __init__(self, *, clock=time.monotonic, lease_seconds=LEASE_SECONDS):
        self.clock = clock
        self.lease_seconds = lease_seconds
        self.expires = clock() + lease_seconds
        self.cancelled = threading.Event()
        self.lock = threading.RLock()

    def alive(self):
        with self.lock:
            if self.clock() >= self.expires:
                self.cancelled.set()
            return not self.cancelled.is_set()

    def renew(self):
        with self.lock:
            if not self.alive():
                return False
            self.expires = self.clock() + self.lease_seconds
            return True

    def cancel(self):
        with self.lock:
            self.cancelled.set()
