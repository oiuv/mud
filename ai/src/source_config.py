"""Load explicit deployment read scopes; configuration never grants tool access."""
import os
from pathlib import Path

from .runtime.contracts import Contract, RuntimeFault, parse_json
from .runtime.filesystem import SafeRoot
from .tools.source import Scope, Sources


RULES = Contract({
    "type": "object", "required": ["version", "scopes"], "additionalProperties": False,
    "properties": {
        "version": {"const": 1, "type": "integer"},
        "scopes": {"type": "array", "maxItems": 32, "items": {
            "type": "object", "required": ["name", "root"], "additionalProperties": False,
            "properties": {
                "name": {"type": "string", "pattern": "^[a-z][a-z0-9_-]{0,47}$"},
                "enabled": {"type": "boolean"},
                "root": {"type": "string", "minLength": 1, "maxLength": 1024},
                **{key: {"type": "array", "maxItems": 128, "uniqueItems": True,
                         "items": {"type": "string", "minLength": 1, "maxLength": 256}}
                   for key in ("include", "exclude", "extensions", "agents")},
                "audiences": {"type": "array", "uniqueItems": True, "maxItems": 3,
                              "items": {"enum": ["player", "admin", "internal"]}},
                "egress": {"type": "boolean"},
            },
        }},
    },
})


def load_sources(path=None):
    """Roots resolve relative to the config file, never cwd or a game checkout.

    Disabled entries are validated syntactically but do not touch their roots.
    Active entries require a safely opened directory at startup. The JSON file
    itself is trusted OS-protected configuration, not model-readable material.
    """
    if path is None:
        return Sources()
    path = Path(os.path.abspath(path))
    try:
        with path.open("rb") as stream:
            data = stream.read(65537)
        config = RULES.validate(parse_json(data.decode("utf-8-sig"), 65536), 65536)
        scopes, seen = [], set()
        for entry in config["scopes"]:
            entry = dict(entry)
            enabled = entry.pop("enabled", False)
            if entry["name"] in seen:
                raise ValueError("Duplicate source scope")
            seen.add(entry["name"])
            root = Path(entry["root"])
            if not root.is_absolute():
                root = path.parent / root
            entry["root"] = Path(os.path.abspath(root))  # Normalize .. without following links.
            scope = Scope(**entry)
            if enabled:
                with SafeRoot(scope.root).opened("", directory=True):
                    pass
                scopes.append(scope)
        return Sources(scopes)
    except (OSError, UnicodeError, RuntimeFault, ValueError, TypeError):
        # Avoid exposing JSON contents, private paths or filesystem error detail.
        raise ValueError("Invalid source scope configuration") from None
