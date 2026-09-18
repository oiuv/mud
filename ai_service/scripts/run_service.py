#!/usr/bin/env python3
"""Windows background entrypoint: append stdout, stderr and startup errors to one log."""
import argparse
from pathlib import Path
import runpy
import sys

parser = argparse.ArgumentParser()
parser.add_argument("--log-file", type=Path)
options, service_args = parser.parse_known_args()
if options.log_file:
    options.log_file.parent.mkdir(parents=True, exist_ok=True)
    sys.stdout = sys.stderr = options.log_file.open("a", encoding="utf-8", buffering=1)
service_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(service_dir))
sys.argv = [str(service_dir / "main.py"), *service_args]
runpy.run_path(sys.argv[0], run_name="__main__")
