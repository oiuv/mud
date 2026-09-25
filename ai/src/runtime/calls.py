"""Bounded waits for trusted cooperative tools; threads are never force-killed."""
import queue
import threading
import time

from .contracts import RuntimeFault


class Calls:
    def __init__(self, capacity=4):
        self.slots = threading.BoundedSemaphore(capacity)

    def invoke(self, callback, context, started=None, gate=None):
        context.check()
        if not self.slots.acquire(blocking=False):
            raise RuntimeFault("tool_capacity")
        result = queue.Queue(maxsize=1)

        def run():
            acquired = False
            try:
                if gate is not None:
                    while not acquired:
                        context.check()
                        acquired = gate.acquire(timeout=min(.02, max(.001, context.deadline - time.monotonic())))
                context.check()
                if started is not None:
                    started()
                result.put((True, callback()))
            except Exception as error:
                result.put((False, error))
            finally:
                if acquired:
                    gate.release()
                self.slots.release()

        try:
            threading.Thread(target=run, daemon=True, name="ai-tool").start()
        except Exception:
            self.slots.release()
            raise
        while True:
            context.check()
            try:
                success, value = result.get(timeout=min(.02, max(.001, context.deadline - time.monotonic())))
            except queue.Empty:
                continue
            context.check()
            if not success:
                raise value
            return value
