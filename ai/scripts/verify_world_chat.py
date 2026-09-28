"""临时 UDP 服务并行验证周不通闲谈与场景创作；默认预览，不连接正式游戏。"""
import argparse
import copy
import hashlib
import json
import logging
import sys
import tempfile
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from contextlib import ExitStack
from dataclasses import replace
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ai.scripts.example_socket import request
from ai.scripts.verify_business_agents import world_fixture
from ai.src.llm import ChatModel
from ai.src.npc.manager import NPCManager
from ai.src.npc.service import NPCService
from ai.src.settings import load_settings
from ai.src.udp_server import UDPServer
from ai.src.world.generator import Generator
from ai.src.world.protocol import content_key, facts_digest
from ai.src.world.service import WorldService


class ObservedModel(ChatModel):
    """Observe the existing adapter call, without changing messages or options."""
    def __init__(self, settings, client, kind, calls, started):
        super().__init__(settings, client)
        self.kind, self.calls, self.started = kind, calls, started

    def __call__(self, messages, **options):
        record = dict(kind=self.kind, started=time.monotonic(), thread=threading.get_ident(), usage=None)
        self.calls.append(record)
        self.started.set()
        receive = options.get("usage_callback")
        def usage_callback(usage):
            record["usage"] = dict(usage) if usage else None
            if receive is not None:
                receive(usage)
        options["usage_callback"] = usage_callback
        try:
            response = super().__call__(messages, **options)
            record.update(status="completed")
            if response.usage:
                record["usage"] = response.usage
            return response
        except Exception as error:
            record.update(status="failed", error=type(error).__name__,
                          status_code=getattr(error, "status_code", None))
            raise
        finally:
            record["ended"] = time.monotonic()


def overlap_seconds(calls):
    return sum(max(0, min(a["ended"], b["ended"]) - max(a["started"], b["started"]))
               for a in calls if a["kind"] == "world"
               for b in calls if b["kind"] == "npc")


def run_case(settings, *, run_id, calls=None):
    calls = [] if calls is None else calls
    world_started, npc_started, cancelled = threading.Event(), threading.Event(), threading.Event()
    roles = json.loads(settings.roles_file.read_text(encoding="utf-8"))
    role = roles["zhou butong"]
    with tempfile.TemporaryDirectory(prefix="ai-world-chat-") as temporary, ExitStack() as stack:
        root = Path(temporary)
        (root / "help").mkdir()
        encoded_role = json.dumps({"zhou butong": role}, ensure_ascii=False)
        (root / "roles.json").write_text(encoded_role, encoding="utf-8")
        settings = replace(settings, data_dir=root / "state", help_dir=root / "help",
                           roles_file=root / "roles.json", world_content_dir=root / "world",
                           world_enabled=True, source_enabled=False, codegraph_enabled=False,
                           cli_programs_file=None, dashscope_api_key="", rerank_enabled=False,
                           knowledge_update_enabled=False, reasoning_trace_file=None,
                           reasoning_trace_console=False, max_workers=1)
        manifest, payload = world_fixture()
        waiting = copy.deepcopy(payload)
        waiting["x"] = 1
        waiting["facts_digest"] = facts_digest(waiting["facts"], 1, 0)
        waiting["content_key"] = content_key(waiting["manifest_digest"], 1, 0, waiting["facts_digest"])
        folder = settings.world_content_dir / "worlds"
        folder.mkdir(parents=True)
        (folder / f"{manifest['world_id']}.json").write_text(json.dumps(manifest), encoding="utf-8")
        manager = NPCManager(settings=settings)
        stack.callback(manager.close)
        manager.runner.model = ObservedModel(settings, manager.client, "npc", calls, npc_started)
        npc = NPCService(settings, npc_manager=manager)
        stack.callback(npc.close)
        generator = Generator(settings)
        stack.callback(generator.close)
        generator.runner.model = ObservedModel(settings, generator.client, "world", calls, world_started)
        server = UDPServer(settings=settings, host="127.0.0.1", port=0)
        chat_checks = []
        def chat_busy():
            busy = server.capability_active("chat") or bool(npc.capacity.active)
            chat_checks.append(busy)
            return busy
        world = WorldService(settings, generator=generator, start_worker=False,
                             chat_busy=chat_busy)
        stack.callback(world.close)
        if world.store is None:
            raise RuntimeError("isolated_world_unavailable")
        server.register(npc.request_types, npc.process_request, max_workers=1,
                        timeout=settings.request_timeout, long_types=("chat",))
        server.register(world.request_types, world.process_request, max_workers=settings.world_short_workers,
                        timeout=settings.world_short_timeout)
        listener = threading.Thread(target=server.start, name="probe-udp", daemon=True)
        listener.start()
        stack.callback(listener.join)
        stack.callback(server.stop)
        stack.callback(cancelled.set)
        startup_deadline = time.monotonic() + 5
        while not server.running:
            if not listener.is_alive() or time.monotonic() >= startup_deadline:
                raise RuntimeError("isolated_listener_unavailable")
            time.sleep(.01)
        address = ("127.0.0.1", server.port)
        def send(kind, **fields):
            return request(dict(type=kind, request_id=uuid.uuid4().hex, **fields), address,
                           timeout=settings.world_short_timeout + 2)
        accepted = [send("world_describe", **p) for p in (payload, waiting)]
        chat = dict(type="chat", request_id=run_id + "-chat", npc_id="zhou butong",
                    player_id="isolated-probe", player_name="旅人",
                    message="周大侠，初次见面，想听你讲讲年轻时闯荡江湖的一段趣事。",
                    context="旅人路过客店，初次与周不通闲谈。")
        with ThreadPoolExecutor(max_workers=2) as workers:
            generated = workers.submit(world.tick, {payload["content_key"]})
            if not world_started.wait(30):
                raise RuntimeError("world_model_not_started")
            answered = workers.submit(request, chat, address, long_mode=True, cancelled=cancelled)
            if not npc_started.wait(30):
                cancelled.set()
                raise RuntimeError("npc_model_not_started")
            started = time.monotonic()
            queried = [send("world_status", content_key=p["content_key"]) for p in (payload, waiting)]
            query_s = time.monotonic() - started
            generated.result()
            checked = len(chat_checks)
            # Chat may finish between observation and tick. Never let that race
            # claim the second queued job and produce an extra paid attempt.
            ticked = world.tick({payload["content_key"]})
            yielded = not ticked and len(chat_checks) > checked and chat_checks[-1]
            response = answered.result()
        row = world.store.get(payload["content_key"])
        queued = world.store.get(waiting["content_key"])
        before_replay = len(calls)
        replay = request(chat, address, long_mode=True, cancelled=cancelled)
        repeated = send("world_describe", **payload)
        # Each client negotiates its own transport token; the business reply must be identical.
        same_reply = ({k: v for k, v in response.items() if k != "request_token"}
                      == {k: v for k, v in replay.items() if k != "request_token"})
        overlap = overlap_seconds(calls)
        passed = (all(r.get("status") == "accepted" for r in accepted)
                  and response.get("type") == "chat" and bool(response.get("response"))
                  and row["state"] == "ready" and row["published"] == 1 and row["attempts"] == 1
                  and queued["state"] == "queued" and queued["attempts"] == 0
                  and all(r.get("type") == "world_status" for r in queried)
                  and same_reply and len(calls) == before_replay and repeated.get("status") == "ready"
                  and overlap > 0 and yielded is True)
        return dict(passed=passed, run_id=run_id, model=settings.chat_model,
                    scope="isolated_udp_actual_npc_role_synthetic_world_no_game_client",
                    role_sha256=hashlib.sha256(encoded_role.encode()).hexdigest(), npc_workers=1,
                    npc_response=response, world_prose=json.loads(row["prose"]) if row["prose"] else None,
                    world=dict(state=row["state"], attempts=row["attempts"], published=row["published"]),
                    waiting=dict(state=queued["state"], attempts=queued["attempts"]),
                    queries=queried, query_elapsed_s=round(query_s, 4), overlap_s=round(overlap, 4),
                    yielded_to_chat=yielded, replay_unchanged=same_reply,
                    replay_model_calls=len(calls) - before_replay, calls=calls,
                    provider_429_observed=any(c.get("status_code") == 429 for c in calls))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true", help="允许一次真实并行验证；不自动重试场景生成")
    parser.add_argument("--report", type=Path, help="新的本地 JSON 报告路径；不能覆盖已有结果")
    options = parser.parse_args(argv)
    if not options.execute:
        print(json.dumps(dict(mode="preview", model_calls=0, npc="zhou butong", temporary_data=True,
                              world="synthetic", planned_tasks=["npc_chat", "world_description"],
                              external_scope="configured NPC role, public Skills, synthetic greeting and room facts")))
        return 0
    if options.report is None:
        parser.error("--execute 需要 --report 保存本次结果")
    settings = load_settings()
    if not settings.chat_api_key or settings.chat_api_key.startswith("your-"):
        parser.error("未配置聊天模型密钥")
    logging.basicConfig(level=logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    run_id = "world-chat-" + uuid.uuid4().hex
    calls = []
    options.report.parent.mkdir(parents=True, exist_ok=True)
    with options.report.open("x", encoding="utf-8") as output:
        output.write(json.dumps(dict(run_id=run_id, status="started")))
        output.flush()
        try:
            report = run_case(settings, run_id=run_id, calls=calls)
        except Exception as error:
            report = dict(passed=False, run_id=run_id, error=type(error).__name__, calls=calls,
                          note="不自动重试；此前可能已有模型消费。")
        output.seek(0)
        output.truncate()
        json.dump(report, output, ensure_ascii=False, indent=2)
        output.write("\n")
    print(json.dumps(dict(passed=report["passed"], run_id=run_id, report=str(options.report)), ensure_ascii=False))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
