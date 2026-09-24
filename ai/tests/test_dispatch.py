"""Real loopback UDP tests; no model clients or persistent player data."""
import json
import socket
import threading
import time
import unittest
from unittest.mock import Mock, patch
from types import SimpleNamespace

from ai.src.settings import Settings
from ai.src.udp_server import UDPServer
from ai.src.llm import complete_chat, create_chat_client, ModelUnavailable
from ai.src.protocol import MAX_DATAGRAM


class DispatchTests(unittest.TestCase):
    def setUp(self):
        self.server = UDPServer(host="127.0.0.1", port=0, settings=Settings())
        self.client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.client.settimeout(2)
        self.addCleanup(self.client.close)
        self.addCleanup(self.server.stop)

    def start(self):
        self.thread = threading.Thread(target=self.server.start)
        self.thread.start()
        self.addCleanup(self.thread.join, 3)
        # Cleanup is LIFO: stop before joining the receiver.
        self.addCleanup(self.server.stop)
        end = time.monotonic() + 3
        while not self.server.running and time.monotonic() < end:
            time.sleep(0.01)
        self.assertTrue(self.server.running)

    def send(self, data):
        if not isinstance(data, bytes):
            data = json.dumps(data, ensure_ascii=False).encode()
        self.client.sendto(data, ("127.0.0.1", self.server.port))

    def receive(self):
        raw = self.client.recv(MAX_DATAGRAM + 1)
        self.assertLessEqual(len(raw), MAX_DATAGRAM)
        return json.loads(raw)

    def test_common_validation_and_non_npc(self):
        handler = Mock(side_effect=lambda request, deadline: {"answer": request.get("text", "")})
        self.server.register("echo", handler, max_workers=1, timeout=3)
        self.start()
        self.send({"type": "echo", "text": "无玩家字段"})
        response = self.receive()
        self.assertEqual(response["answer"], "无玩家字段")
        self.assertTrue(response["request_id"])
        for request in (b"\xff", b"{", b"[" * 1500 + b"]" * 1500,
                        [], {"type": []}, {"type": None}, {"type": "missing"},
                        {"type": "echo", "request_id": []},
                        b'{"type":"echo","text":"\\ud800"}',
                        b'{"type":"echo","number":NaN}', b" " * (MAX_DATAGRAM + 1)):
            with self.subTest(request=str(request)[:40]):
                self.send(request)
                self.assertEqual(self.receive()["type"], "error")
        self.assertEqual(handler.call_count, 1)
        self.send({"type": "echo", "text": "still alive"})
        self.assertEqual(self.receive()["answer"], "still alive")

    def test_capacity_inflight_conflict_and_independent_route(self):
        entered, release = threading.Event(), threading.Event()
        self.addCleanup(release.set)
        calls = []
        def slow(request, deadline):
            calls.append(request)
            entered.set()
            release.wait(3)
            return {"answer": "done"}
        self.server.register("chat", slow, max_workers=1, timeout=5)
        self.server.register("ack", lambda request, deadline: {"ok": True}, max_workers=1, timeout=1)
        self.start()
        request = {"request_id": "same"}
        self.send(request)  # legacy missing type is chat
        self.assertTrue(entered.wait(1))
        self.send(request)
        self.send({**request, "changed": True})
        self.assertEqual(self.receive()["code"], "invalid_request")
        self.send({"type": "chat", "request_id": "busy"})
        self.assertEqual(self.receive()["code"], "busy")
        self.send({"type": "ack", "request_id": "fast"})
        self.assertEqual(self.receive()["request_id"], "fast")
        release.set()
        self.assertEqual(self.receive()["request_id"], "same")
        self.assertEqual(len(calls), 1)

    def test_exceptions_invalid_results_and_close_release_capacity(self):
        cleanup = Mock()
        def handler(request, deadline):
            mode = request.get("mode")
            if mode == "raise":
                raise RuntimeError("secret-key-and-prompt")
            if mode == "large":
                return {"text": "字" * MAX_DATAGRAM}
            if mode == "wrong":
                return {"type": "different"}
            if mode == "timeout":
                raise TimeoutError()
            return {"ok": True}
        self.server.register("probe", handler, max_workers=1, timeout=1, close=cleanup)
        self.start()
        for mode, code in (("raise", "internal_error"), ("large", "too_large"),
                           ("wrong", "internal_error"), ("timeout", "timeout")):
            with self.subTest(mode=mode):
                self.send({"type": "probe", "request_id": mode, "mode": mode})
                self.assertEqual(self.receive()["code"], code)
                # Receipt can precede the worker finally block by a few microseconds.
                end = time.monotonic() + 1
                while self.server._inflight and time.monotonic() < end:
                    time.sleep(0.005)
        self.send({"type": "probe", "request_id": "success"})
        self.assertTrue(self.receive()["ok"])
        self.server.stop()
        self.thread.join(3)
        self.server.stop()
        cleanup.assert_called_once()
        self.assertFalse(self.server._inflight)

    def test_registration_and_expired_dispatch(self):
        seen = []
        self.server.register("short", lambda request, deadline: seen.append(deadline) or {},
                             max_workers=1, timeout=1)
        self.server.register("long", lambda request, deadline: seen.append(deadline) or {},
                             max_workers=1, timeout=120)
        self.assertEqual(self.server.process_request({"type": "short"}, time.monotonic() - 2)["code"], "timeout")
        now = time.monotonic()
        self.server.process_request({"type": "long"}, now)
        self.assertAlmostEqual(seen[0], now + 120)
        for kwargs in (dict(request_types="long", max_workers=1, timeout=1),
                       dict(request_types="x", max_workers=0, timeout=1),
                       dict(request_types="x", max_workers=1, timeout=float("inf"))):
            with self.assertRaises(ValueError):
                self.server.register(handler=lambda *_: {}, **kwargs)


class CommonModelTests(unittest.TestCase):
    def client(self, content="result", finish="stop"):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(finish_reason=finish, message=SimpleNamespace(content=content))])
        return client

    def test_non_npc_limits_are_independent_and_messages_unchanged(self):
        settings = Settings(chat_api_key="test-only-key")
        with patch("ai.src.llm.OpenAI") as factory:
            create_chat_client(settings)
        self.assertEqual(factory.call_args.kwargs["max_retries"], 0)
        messages = [{"role": "user", "content": "scene-only"}]
        client = self.client()
        result = complete_chat(settings, client, messages, timeout=180, max_tokens=123, operation="scene")
        self.assertEqual(result, "result")
        self.assertEqual(client.with_options.call_args.kwargs["timeout"], 180)
        args = client.chat.completions.create.call_args.kwargs
        self.assertIs(args["messages"], messages)
        self.assertEqual(args["max_tokens"], 123)
        self.assertEqual(args["extra_body"], settings.chat_extra_body)
        self.assertEqual(args["model"], settings.chat_model)

    def test_empty_truncated_late_and_private_failures(self):
        for content, finish, code in ((" ", "stop", "empty"), ("partial", "length", "truncated")):
            with self.assertRaises(ModelUnavailable) as caught:
                complete_chat(Settings(), self.client(content, finish), [])
            self.assertEqual(caught.exception.code, code)
        with patch("ai.src.llm.time.monotonic", side_effect=[10, 12, 12]):
            with self.assertRaises(ModelUnavailable) as caught:
                complete_chat(Settings(), self.client(), [], timeout=1)
        self.assertEqual(caught.exception.code, "timeout")
        client = self.client()
        client.chat.completions.create.side_effect = RuntimeError("PRIVATE KEY PROMPT RESPONSE")
        with self.assertLogs("ai.src.llm", "WARNING") as logs:
            with self.assertRaises(ModelUnavailable):
                complete_chat(Settings(), client, [{"content": "PRIVATE KEY PROMPT RESPONSE"}])
        self.assertNotIn("PRIVATE", "\n".join(logs.output))


if __name__ == "__main__":
    unittest.main()
