"""Long socket requests and operation timeouts, with no provider or player data."""
import json
import socket
import threading
import time
from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import Mock, patch

from ai.src.database import connect
from ai.src.npc.manager import NPCManager
from ai.src.npc.service import NPCService
from ai.src.request_lifetime import RequestLifetime
from ai.src.runtime.context import Budget
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.hooks import Hook, Hooks
from ai.src.runtime.runner import Runner
from ai.src.runtime.tools import Tool, Tools
from ai.src.llm import ModelResponse
from ai.src.udp_server import UDPServer
from ai.scripts.example_socket import request as socket_request
from ai.tests.test_npc_ai import Fixture
from ai.tests.test_npc_runtime import completion, reply
from ai.tests.test_runtime import DATA, QUERY, RuntimeFixture, ScriptedModel, tool_call


class SocketLifetimeTests(Fixture):
    def start_server(self, handler):
        self.server = UDPServer(host="127.0.0.1", port=0, settings=self.settings)
        self.server.register("work", handler, max_workers=1, timeout=.05, long_types=("work",))
        self.server.register("short", lambda req, deadline: {"ok": True}, max_workers=1, timeout=.05)
        self.thread = threading.Thread(target=self.server.start)
        self.thread.start()
        until = time.monotonic() + 3
        while not self.server.running and time.monotonic() < until:
            time.sleep(.01)
        self.assertTrue(self.server.running)
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.settimeout(2)
        self.addCleanup(self.sock.close)
        self.addCleanup(self.thread.join, 3)
        self.addCleanup(self.server.stop)
        self.request = dict(type="work", request_id="long-request", request_mode="long",
                            request_token="0123456789abcdef", goal="查证条件")

    def send(self, value):
        self.sock.sendto(json.dumps(value).encode(), ("127.0.0.1", self.server.port))

    def receive(self):
        return json.loads(self.sock.recv(8192))

    def control(self, action="renew", **changes):
        self.send(dict(type="request_control", request_id=self.request["request_id"],
                       request_token=self.request["request_token"], action=action, **changes))

    def test_progress_renew_duplicate_conflict_and_lost_final_replay(self):
        release, entered = threading.Event(), threading.Event()
        calls = []
        def handler(request, deadline, *, lifetime):
            calls.append(request)
            self.assertIsNone(deadline)
            self.assertNotIn("request_mode", request)
            entered.set()
            release.wait(2)
            return {"answer": "门槛六十，扣除三十"}
        self.start_server(handler)
        self.addCleanup(release.set)
        self.send(self.request)
        self.assertEqual(self.receive()["type"], "request_progress")
        self.assertTrue(entered.wait(1))
        time.sleep(.08)  # Beyond the capability's short deadline.
        for _ in range(3):
            self.control()
            self.assertEqual(self.receive()["type"], "request_progress")
        self.send(self.request)
        self.assertEqual(self.receive()["type"], "request_progress")
        self.send({**self.request, "goal": "另一条消息"})
        self.assertEqual(self.receive()["code"], "invalid_request")
        self.send({"type": "short", "request_id": "independent"})
        self.assertTrue(self.receive()["ok"])
        release.set()
        final = self.receive()
        self.assertEqual(final["type"], "work")
        self.assertEqual(final["request_token"], self.request["request_token"])
        self.control()  # The final datagram may have been lost by the client.
        self.assertEqual(self.receive(), final)
        self.send(self.request)
        self.assertEqual(self.receive(), final)
        self.assertEqual(len(calls), 1)

    def test_cancel_and_expired_lease_do_not_revive(self):
        for explicit in (False, True):
            with self.subTest(explicit=explicit):
                now = [0.0]
                lease = RequestLifetime(clock=lambda: now[0])
                release, entered = threading.Event(), threading.Event()
                observed = []
                def handler(request, deadline, *, lifetime):
                    entered.set()
                    release.wait(2)
                    observed.append(lifetime.alive())
                    return {"answer": "late"}
                self.start_server(handler)
                self.addCleanup(release.set)
                with patch("ai.src.udp_server.RequestLifetime", return_value=lease):
                    self.send(self.request)
                    self.assertEqual(self.receive()["type"], "request_progress")
                    self.assertTrue(entered.wait(1))
                if explicit:
                    self.control("cancel")
                    self.send({"type": "short", "request_id": "barrier"})
                    self.assertTrue(self.receive()["ok"])
                else:
                    now[0] = 31  # Lost cancellation packet; no caller renewal.
                self.assertFalse(lease.renew())
                release.set()
                self.assertEqual(self.receive()["code"], "cancelled")
                self.assertEqual(observed, [False])
                self.control()
                self.assertEqual(self.receive()["code"], "cancelled")
                self.server.stop()
                self.thread.join(3)

    def test_renew_during_final_send_replays_settled_response(self):
        sending, release_send = threading.Event(), threading.Event()
        calls = []
        def handler(request, deadline, *, lifetime):
            calls.append(request)
            return {"answer": "完成"}
        self.start_server(handler)
        self.addCleanup(release_send.set)
        original_send = self.server._send
        def delayed_send(response, address):
            original_send(response, address)
            if response.get("type") == "work" and not sending.is_set():
                sending.set()
                release_send.wait(3)  # Keep worker cleanup pending after delivery.
        with patch.object(self.server, "_send", side_effect=delayed_send):
            self.send(self.request)
            self.assertEqual(self.receive()["type"], "request_progress")
            final = self.receive()
            self.assertEqual(final["type"], "work")
            self.assertTrue(sending.wait(1))
            self.control()
            self.assertEqual(self.receive(), final)
            self.send(self.request)
            self.assertEqual(self.receive(), final)
            self.assertEqual(len(calls), 1)
            release_send.set()

    def test_control_cannot_change_identity_or_launch_after_restart(self):
        calls, release, entered = [], threading.Event(), threading.Event()
        def handler(request, deadline, *, lifetime):
            calls.append(lifetime)
            entered.set()
            release.wait(2)
            return {"ok": True}
        self.start_server(handler)
        self.addCleanup(release.set)
        self.control()
        self.assertEqual(self.receive()["code"], "request_gone")
        self.assertEqual(calls, [])
        self.send(self.request)
        self.receive()
        self.assertTrue(entered.wait(1))
        self.send({"type": "request_control", "request_id": self.request["request_id"],
                   "request_token": "wrong", "action": "cancel"})
        self.control(actor="admin")
        self.assertEqual(self.receive()["code"], "invalid_request")
        self.assertTrue(calls[0].alive())
        release.set()
        self.assertTrue(self.receive()["ok"])

    def test_shutdown_revokes_active_work(self):
        entered, finished = threading.Event(), threading.Event()
        def handler(request, deadline, *, lifetime):
            entered.set()
            while lifetime.alive():
                lifetime.cancelled.wait(.01)
            finished.set()
            return {"ok": True}
        self.start_server(handler)
        self.send(self.request)
        self.receive()
        self.assertTrue(entered.wait(1))
        self.server.stop()
        self.assertTrue(finished.is_set())

    def test_standalone_client_survives_lost_progress_and_final_packets(self):
        calls = []
        def handler(request, deadline, *, lifetime):
            calls.append(request)
            # Longer than the 5s renewal interval, without any model text.
            time.sleep(6)
            self.assertTrue(lifetime.alive())
            return {"answer": "完成"}
        self.start_server(handler)
        original = self.server._send
        dropped = {"request_progress": 0, "work": 0}
        def send(response, address):
            kind = response.get("type")
            if kind in dropped and dropped[kind] == 0:
                dropped[kind] += 1
                return
            original(response, address)
        self.server._send = send
        response = socket_request({"type": "work", "request_id": "standalone"},
                                  ("127.0.0.1", self.server.port), long_mode=True, timeout=.01)
        self.assertEqual(response["answer"], "完成")
        self.assertEqual(dropped, {"request_progress": 1, "work": 1})
        self.assertEqual(len(calls), 1)

    def test_oversized_long_reply_is_correlated_terminal_error(self):
        self.start_server(lambda request, deadline, lifetime: {"answer": "字" * 9000})
        response = socket_request({"type": "work"}, ("127.0.0.1", self.server.port), long_mode=True)
        self.assertEqual(response["code"], "too_large")
        self.assertIsInstance(response["request_token"], str)
        with self.server._inflight_lock:
            saved = next(iter(self.server._settled.values()))[1]
        self.assertEqual(saved["code"], "too_large")
        self.assertLessEqual(len(json.dumps(saved).encode()), 8192)

    def test_stopping_server_rejects_new_dispatch_before_joining_workers(self):
        server = UDPServer(settings=self.settings)
        callback = Mock(return_value={"ok": True})
        server.register("short", callback, max_workers=1, timeout=1)
        pool = server._routes["short"].pool
        original = pool.shutdown
        def shutdown(*args, **kwargs):
            self.assertEqual(server.process_request({"type": "short"})["code"], "timeout")
            original(*args, **kwargs)
        with patch.object(pool, "shutdown", side_effect=shutdown):
            server.stop()
        callback.assert_not_called()

    def test_long_mode_is_opt_in_and_requires_live_transport(self):
        server = UDPServer(settings=self.settings)
        self.addCleanup(server.stop)
        callback = Mock(return_value={})
        server.register("work", callback, max_workers=1, timeout=1)
        request = dict(type="work", request_id="r", request_mode="long", request_token="x" * 16)
        self.assertEqual(server.process_request(request)["code"], "invalid_request")
        callback.assert_not_called()
        server.register("enabled", callback, max_workers=1, timeout=1, long_types=("enabled",))
        self.assertEqual(server.process_request({**request, "type": "enabled"})["code"], "invalid_request")


class NPCLifetimeTests(Fixture):
    def runtime(self, hooks=None):
        knowledge, _ = self.knowledge()
        self.addCleanup(knowledge.close)
        client = Mock()
        client.with_options.return_value = client
        manager = NPCManager(settings=self.settings, knowledge=knowledge, client=client, hooks=hooks)
        service = NPCService(self.settings, npc_manager=manager)
        self.addCleanup(service.close)
        self.contexts = []
        original = manager.create_context
        def capture(*args, **kwargs):
            context = original(*args, **kwargs)
            self.contexts.append(context)
            return context
        manager.create_context = capture
        return manager, service, client

    def counts(self, service):
        with connect(service.history.db_path) as db:
            return [db.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
                    for table in ("conversations", "player_memories", "request_results")]

    def test_npc_and_summary_complete_after_old_80_90_second_limits(self):
        manager, service, client = self.runtime()
        now = [1000.0]
        lease = RequestLifetime(clock=lambda: now[0])
        for i in range(10):
            service.history.save_conversation("npc", "侠客", "player", "少侠",
                                              "user" if i % 2 == 0 else "assistant", f"往事{i}")
        responses = iter([completion("玩家尚未拜师。"), completion(reply(kind="rules")),
                          completion(reply(kind="rules")), completion(reply())])
        durations = iter([1, 4, 4, 4])
        def respond(**kwargs):
            # Each I/O is <60 seconds; renew independently while it runs.
            for _ in range(next(durations)):
                now[0] += 10
                self.assertTrue(lease.renew())
            return next(responses)
        client.chat.completions.create.side_effect = respond
        clock = SimpleNamespace(monotonic=lambda: now[0])
        with patch("ai.src.llm.time", clock), patch("ai.src.runtime.context.time", clock):
            response = service.process_request(self.request(), None, lifetime=lease)
        self.assertEqual(response["type"], "chat")
        self.assertGreater(now[0] - 1000, 90)
        self.assertEqual(self.counts(service), [12, 1, 1])
        self.assertIsNone(self.contexts[0].deadline)
        self.assertEqual(self.contexts[0].budget.counts["model_calls"], 4)
        self.assertEqual(self.contexts[0].budget.usage["total_tokens"], 60)
        self.assertEqual(client.chat.completions.create.call_count, 4)
        self.assertEqual(service.history.get_summary("npc", "player")["through_id"], 10)

    def test_expired_or_cancelled_caller_rejects_late_model_and_commit(self):
        for stage in ("model", "commit", "expiry"):
            with self.subTest(stage=stage):
                now = [0.0]
                lease = RequestLifetime(clock=lambda: now[0])
                hooks = Hooks([Hook("before_commit", lambda event: lease.cancel())]) if stage == "commit" else None
                manager, service, client = self.runtime(hooks)
                def respond(**kwargs):
                    if stage == "expiry":
                        now[0] = 31
                    elif stage == "model":
                        lease.cancel()
                    return completion(reply())
                client.chat.completions.create.side_effect = respond
                response = service.process_request(self.request(request_id=stage), None, lifetime=lease)
                self.assertEqual(response["type"], "error")
                self.assertEqual(self.counts(service), [0, 0, 0])
                self.assertEqual(self.contexts[-1].budget.usage["total_tokens"], 15)
                self.assertEqual(client.chat.completions.create.call_count, 1)


class LongRuntimeTests(RuntimeFixture):
    def test_recoverable_tool_timeout_changes_method_and_completes(self):
        def lookup(context, arguments):
            if arguments["q"] == "entry":
                context.budget.cancelled.wait(.06)
                context.check()
            return {"found": True}
        tools = Tools([Tool("lookup", "Find", QUERY, DATA, lookup, timeout=.02, concurrent_safe=True)])
        model = ScriptedModel(tool_call(), tool_call("two", arguments='{"q":"alternative"}'), ModelResponse("verified"))
        context = replace(self.context(), deadline=None)
        outcome = Runner(model, [self.agent()], tools).run("answer", {"goal": "rule"}, context)
        self.assertEqual(outcome.result.status, "completed")
        self.assertIn("tool_timeout", model.inputs[1][-1]["content"])
        self.assertEqual(context.budget.counts["model_calls"], 3)

    def test_child_has_no_total_deadline_and_shares_root_cancellation(self):
        lease = RequestLifetime()
        root = replace(self.context(), deadline=None, budget=Budget(alive=lease.alive))
        child = root.enter("child", root.policy, root.budget.limits, delegated=True)
        self.assertIsNone(child.deadline)
        child.budget.reserve(child.deadline, model_calls=30)
        self.assertEqual(root.budget.counts["model_calls"], 30)
        lease.cancel()
        with self.assertRaises(RuntimeFault):
            child.check()
        with self.assertRaises(RuntimeFault):
            root.check()
