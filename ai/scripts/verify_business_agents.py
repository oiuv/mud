"""用合成资料联调 NPC、摘要和世界 Agent；默认不调用模型，不访问正式业务数据。"""
import argparse
import json
import logging
import re
import sys
import tempfile
import time
from contextlib import ExitStack
from dataclasses import replace
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ai.src.npc.manager import NPCManager
from ai.src.npc.service import NPCService
from ai.src.runtime.hooks import Hook, Hooks
from ai.src.settings import load_settings
from ai.src.world.generator import Generator
from ai.src.world.protocol import TEXT_FIELDS, content_key, digest, facts_digest
from ai.src.world.service import WorldService


def expected_numbers(answer):
    """Fixture-only check; accept normal Chinese numbers, not a general judge."""
    return bool(re.search(r"(?:至少|门槛|须.{0,8}贡献).{0,4}(?:200|二百|两百)", answer)
                and re.search(r"(?:扣除|扣去|扣).{0,4}(?:50|五十)", answer))


def world_fixture():
    manifest = dict(world_id="test-agent-probe", seed=42, generator_version=1, catalog_version="probe-v1",
                    catalog_digest="a" * 64, content_version=1, test_world=1,
                    parameters=dict(coordinate_limit=1000000000, chunk_size=16, anchor_size=32))
    manifest["manifest_digest"] = digest(["illusion-manifest-v1", manifest["world_id"], "42", "1", "probe-v1",
                                          "a" * 64, "1", "1", "1000000000", "16", "32"])
    facts = {key: "" for key in TEXT_FIELDS}
    facts.update(schema_version=1, name="苍岭·松岗", biome="ridge", biome_name="苍岭", patch="松岗", theme="悔恨",
                 role="wilderness", description="岩坡间夹着松树，旧路穿行其间。", elevation=54000,
                 moisture=32000, temperature=32000, slope=100, road=1, landmarks=[])
    sha = facts_digest(facts, 0, 0)
    payload = dict(world_id=manifest["world_id"], manifest_digest=manifest["manifest_digest"], x=0, y=0,
                   facts=facts, facts_digest=sha, content_key=content_key(manifest["manifest_digest"], 0, 0, sha))
    return manifest, payload


def run_cases(settings):
    events = []
    hooks = Hooks([Hook("run_end", lambda event: events.append(dict(event)))])
    with tempfile.TemporaryDirectory(prefix="ai-business-probe-") as temporary, ExitStack() as stack:
        root = Path(temporary)
        (root / "help").mkdir()
        (root / "help/xiamen").write_text(
            "霞门拜师规则：拜师之前须已有门派贡献至少200；成功拜师只扣除贡献50。两者不同。", encoding="utf-8")
        (root / "roles.json").write_text(json.dumps({"probe": {"name": "霞门长老", "memory_capacity": 10,
            "role": "霞门掌管入门事务的长老", "knowledge_threshold": 0}}, ensure_ascii=False), encoding="utf-8")
        settings = replace(settings, data_dir=root / "state", help_dir=root / "help", roles_file=root / "roles.json",
                           world_content_dir=root / "world", world_enabled=True, dashscope_api_key="",
                           rerank_enabled=False, knowledge_update_enabled=False)
        manager = NPCManager(settings=settings, hooks=hooks)
        stack.callback(manager.close)
        service = NPCService(settings, npc_manager=manager)
        stack.callback(service.close)
        for index in range(10):
            service.history.save_conversation("probe", "霞门长老", "probe-player", "旅人",
                "user" if index % 2 == 0 else "assistant",
                "我打算日后拜入霞门，目前尚未拜师。" if index % 2 == 0 else "待少侠准备妥当，再来相询便是。")
        request = dict(type="chat", request_id="probe-chat", npc_id="probe", player_id="probe-player",
                       player_name="旅人", message="拜入霞门之前至少要有多少门派贡献，成功拜师实际扣除多少？", context="山门")
        started = time.monotonic()
        response = service.process_request(request, time.monotonic() + 80)
        replay = service.process_request(request, time.monotonic() + 80)
        summary = service.history.get_summary("probe", "probe-player")
        answer = response.get("response", "")
        npc_passed = (response["type"] == "chat" and expected_numbers(answer)
                      and summary["through_id"] > 0 and response == replay
                      and len(events) == 2 and all(e["status"] == "completed" for e in events))
        npc = dict(passed=npc_passed, elapsed_s=round(time.monotonic() - started, 3),
                   answer=answer, summary=summary["content"], replay_unchanged=response == replay)
        manifest, payload = world_fixture()
        (root / "world/worlds").mkdir(parents=True)
        (root / "world/worlds/test-agent-probe.json").write_text(json.dumps(manifest), encoding="utf-8")
        generator = Generator(settings, hooks=hooks)
        stack.callback(generator.close)
        world = WorldService(settings, generator=generator, start_worker=False)
        stack.callback(world.close)
        if world.store is None:
            raise RuntimeError("probe_world_unavailable")
        world.process_request(dict(type="world_describe", request_id="probe-world", **payload), time.monotonic() + 3)
        started = time.monotonic()
        world.tick()  # Exactly one durable attempt. No automatic resubmission on failure.
        row = world.store.get(payload["content_key"])
        prose = json.loads(row["prose"])["description"] if row["prose"] else ""
        world_passed = (row["state"] == "ready" and bool(row["published"]) and row["attempts"] == 1
                        and not world.tick() and len(events) == 3 and events[-1]["status"] == "completed")
        narration = dict(passed=world_passed, elapsed_s=round(time.monotonic() - started, 3),
                         description=prose, state=row["state"], attempts=row["attempts"])
        total_calls = sum(e["budget"]["model_calls"] for e in events)
        tokens = sum(e["budget"]["usage"]["total_tokens"] for e in events)
        return dict(passed=npc_passed and world_passed, model=settings.chat_model, synthetic_only=True,
                    npc=npc, world=narration, model_calls=total_calls, total_tokens=tokens,
                    runs=[{**{key: e[key] for key in ("agent", "status", "code")},
                           "budget": {**dict(e["budget"]), "usage": dict(e["budget"]["usage"])}}
                          for e in events])


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true", help="允许真实调用；总计最多7次模型调用，不自动重试失败批次")
    options = parser.parse_args(argv)
    if not options.execute:
        print(json.dumps(dict(mode="dry_run", cases=["npc", "summary", "world"], max_model_calls=7,
                              synthetic_only=True), ensure_ascii=False))
        return 0
    logging.basicConfig(level=logging.WARNING)
    settings = load_settings()
    if not settings.chat_api_key or settings.chat_api_key.startswith("your-"):
        print(json.dumps(dict(passed=False, error="model_unconfigured")))
        return 1
    try:
        report = run_cases(settings)
    except Exception as error:
        print(json.dumps(dict(passed=False, error=type(error).__name__)))
        return 1
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    # Windows redirected output must remain UTF-8, matching the service/docs.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
