"""开发诊断：只读源码问答；默认预览，--execute 才调用模型。"""
import argparse
import json
import logging
import os
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.runtime.lifecycle import error_code
from src.settings import load_settings
from src.source_diagnostic import diagnose_source


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("question", help="所问目标、门派、学习或施展等具体问题")
    parser.add_argument("--audience", choices=("player", "admin"), default="player",
                        help="本地诊断视图；两种视图使用相同仓库和敏感排除，默认玩家")
    parser.add_argument("--report", type=Path, help="新建报告文件，不覆盖已有批次；管理报告须存放在受保护目录")
    parser.add_argument("--execute", action="store_true", help="明确同意本次按配置外发所选范围并调用真实模型")
    options = parser.parse_args(argv)
    if not options.execute:
        print(json.dumps({"mode": "preview", "audience": options.audience,
                          "source_read": False, "model_calls": 0}, ensure_ascii=False))
        return 0
    if options.report is None:
        parser.error("--execute 必须指定新的 --report 文件；禁止覆盖已有报告")
    logging.basicConfig(level=logging.WARNING)
    # Do not print the question or unrestricted provider errors to shared logs.
    try:
        # POSIX: owner-only mode. Windows: use the operator's protected NTFS
        # directory ACL; Python's mode bits cannot replace an ACL policy.
        descriptor = os.open(options.report, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            json.dump({"state": "started", "audience": options.audience}, stream)
            stream.flush()
            try:
                report = diagnose_source(load_settings(), options.question, audience=options.audience)
                report["state"] = "interrupted" if report["status"] == "cancelled" else "finished"
            except KeyboardInterrupt:
                report = {"state": "interrupted", "status": "cancelled"}
            except Exception as error:
                report = {"state": "interrupted", "status": "failed", "code": error_code(error, "diagnostic_failed")}
            stream.seek(0)
            json.dump(report, stream, ensure_ascii=False, indent=2)
            stream.truncate()
            stream.flush()
        print(json.dumps({"state": report["state"], "status": report["status"],
                          "human_review_required": True}, ensure_ascii=False))
        return 0 if report["status"] == "completed" else 1
    except OSError:
        print("报告文件不可新建；请检查目录权限并使用新文件名。", file=sys.stderr)
        return 1


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
