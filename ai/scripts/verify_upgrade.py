"""离线升级/回退演练：只操作自动创建的临时副本，不读取 .env 或玩家数据。"""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import zipfile


BASELINE = "2f8192a5356af2e2306392132a7406715a85c44b"
SERVICE = Path(__file__).resolve().parents[1]


def run():
    with tempfile.TemporaryDirectory(prefix="mud-ai-upgrade-") as temporary:
        root = Path(temporary)
        archive = root / "baseline.zip"
        # Export only trusted, pinned source. Never switch/clean the user's tree.
        subprocess.run(["git", "archive", "--format=zip", "--output=" + str(archive), BASELINE, "ai/src"],
                       cwd=SERVICE.parent, check=True, capture_output=True, timeout=30)
        old = root / "baseline"
        with zipfile.ZipFile(archive) as source:
            source.extractall(old)
        current = root / "current/ai"
        shutil.copytree(SERVICE / "src", current / "src", ignore=shutil.ignore_patterns("__pycache__"))
        shutil.copytree(SERVICE / "skills", current / "skills")
        # Each predecessor has exited before its data is copied or another owner starts.
        phases = []
        previous = None
        for stage, code in (("seed", old / "ai"), ("source_policy_change", current), ("upgrade", current),
                            ("rollback", old / "ai"), ("reupgrade", current)):
            state = root / stage
            before = None
            if previous is not None:
                before = fingerprint(previous)
                shutil.copytree(previous, state)
            else:
                state.mkdir()
            result = subprocess.run([sys.executable, str(SERVICE / "tests/upgrade_fixture.py"),
                                     str(code), str(state), stage], cwd=root,
                                    capture_output=True, text=True, encoding="utf-8", timeout=60)
            if result.returncode:
                raise RuntimeError(f"{stage} failed:\n{result.stdout}\n{result.stderr}")
            phases.append(json.loads(result.stdout))
            if previous is not None and fingerprint(previous) != before:
                raise AssertionError("A prior data snapshot changed")
            previous = state
        return {"passed": True, "baseline": BASELINE, "phases": phases,
                "external_model_calls": 0, "prior_snapshots_unchanged": True}


def fingerprint(root):
    return {str(path.relative_to(root)): hashlib.sha256(path.read_bytes()).hexdigest()
            for path in root.rglob("*") if path.is_file()}


if __name__ == "__main__":
    print(json.dumps(run(), ensure_ascii=False, indent=2))
