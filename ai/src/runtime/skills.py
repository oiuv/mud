"""Deployment-owned guidance, pinned per run, never executable capabilities."""
import hashlib
import logging
import re
from pathlib import Path

import yaml

from .contracts import Contract, RuntimeFault, json_text, parse_json
from .filesystem import SafeRoot, relative_parts

logger = logging.getLogger(__name__)
METADATA = Contract({"type": "object", "required": ["name", "description", "version"],
                     "properties": {
                         "name": {"type": "string", "pattern": "^[a-z][a-z0-9-]{0,47}$"},
                         "description": {"type": "string", "minLength": 1, "maxLength": 600},
                         "version": {"type": "string", "minLength": 1, "maxLength": 64},
                         "resources": {"type": "array", "maxItems": 8, "uniqueItems": True,
                                       "items": {"type": "string", "maxLength": 256}},
                         "allowed-tools": {"type": "array", "maxItems": 32, "uniqueItems": True,
                                           "items": {"type": "string", "maxLength": 64}}},
                     "additionalProperties": False})


class Skills:
    def __init__(self, root):
        root = Path(root)
        if any(part.casefold() in (".agents", ".codex", ".claude") for part in root.parts):
            raise ValueError("Developer skills are not service skills")
        self.files = SafeRoot(root)
        entries, truncated = self.files.entries(limit=512)
        if truncated:
            raise ValueError("Too many skill directory entries")
        self.names = tuple(name for name, directory in entries
                           if directory and re.fullmatch(r"[a-z][a-z0-9-]{0,47}", name))

    def authorize(self, context, arguments):
        context.check()
        if ("skill" not in context.policy.tools
                or (context.state.tool_ceiling is not None and "skill" not in context.state.tool_ceiling)):
            raise RuntimeFault("tool_denied")
        name = arguments.get("name")
        if name is not None and (not isinstance(name, str) or not re.fullmatch(r"[a-z][a-z0-9-]{0,47}", name)
                                  or name not in context.policy.skills):
            raise RuntimeFault("skill_denied")

    def _manifest(self, name):
        try:
            text = self.files.read(f"{name}/SKILL.md", 32768).decode("utf-8-sig")
            lines = text.splitlines()
            if not lines or lines[0] != "---":
                raise ValueError("Missing metadata")
            end = lines.index("---", 1)
            metadata = METADATA.validate(yaml.safe_load("\n".join(lines[1:end])))
            if metadata["name"] != name:
                raise ValueError("Skill name mismatch")
            body = "\n".join(lines[end + 1:]).strip()
            if not body:
                raise ValueError("Empty guidance")
            for resource in metadata.get("resources", []):
                relative_parts(resource)
                if (not resource.startswith(("references/", "assets/"))
                        or Path(resource).suffix.casefold() not in (".md", ".txt", ".json")):
                    raise ValueError("Unsupported resource")
            return metadata, body
        except (RuntimeFault, ValueError, UnicodeError, yaml.YAMLError, RecursionError):
            raise RuntimeFault("skill_unavailable") from None

    def _snapshot(self, name, context):
        metadata, body = self._manifest(name)
        resources, total = {}, 0
        for resource in metadata.get("resources", []):
            context.check()
            data = self.files.read(f"{name}/{resource}", 32768)
            total += len(data)
            if total > 65536:
                raise RuntimeFault("skill_too_large")
            # Pin all resource hashes without adding their contents to the prompt.
            resources[resource] = hashlib.sha256(data).hexdigest()
        digest = hashlib.sha256(json_text([metadata, body, resources]).encode("utf-8")).hexdigest()
        return {"metadata": metadata, "guidance": body, "hash": digest,
                "resources": resources, "loaded_resources": {}}

    def _catalog(self, context):
        self.authorize(context, {})
        with context.state.lock:
            if context.state.skill_catalog is None:
                catalog = {}
                for name in self.names:
                    if name not in context.policy.skills:
                        continue
                    context.check()
                    try:
                        catalog[name] = self._snapshot(name, context)
                    except RuntimeFault as error:
                        if error.code in ("cancelled", "deadline", "budget_exhausted"):
                            raise
                        # An invalid optional pack cannot break unrelated Agents.
                        continue
                context.check()
                context.state.skill_catalog = catalog
            return context.state.skill_catalog

    def catalog_message(self, context):
        self.authorize(context, {})
        catalog = self._catalog(context)
        visible = [{key: item["metadata"][key] for key in ("name", "description")}
                   for name, item in catalog.items() if name in context.policy.skills]
        if not visible:
            return None
        return {"role": "system", "content": "可用专业技能（按需调用 skill，使用 name；读取包内资料时另加 path）："
                + json_text(visible, 16384)}

    def invoke(self, context, arguments):
        if "path" in arguments:
            return self.read_resource(context, arguments)
        return self.load(context, arguments)

    def load(self, context, arguments):
        self.authorize(context, arguments)
        name = arguments["name"]
        with context.state.lock:
            pinned = context.state.skills.get(name)
            if pinned is None:
                pinned = self._catalog(context).get(name)
                if pinned is None:
                    raise RuntimeFault("skill_unavailable")
                metadata = pinned["metadata"]
                context.check()
                context.state.skills[name] = pinned
                if "allowed-tools" in metadata:
                    ceiling = frozenset(metadata["allowed-tools"]) & context.policy.tools
                    old = context.state.tool_ceiling
                    context.state.tool_ceiling = ceiling if old is None else old & ceiling
                logger.info("AI skill run=%s name=%s version=%s hash=%s", context.run_id, name, metadata["version"], pinned["hash"])
            return {"name": name, "version": pinned["metadata"]["version"], "hash": pinned["hash"],
                    "guidance": pinned["guidance"], "resources": sorted(pinned["resources"])}

    def read_resource(self, context, arguments):
        self.authorize(context, arguments)
        name, path = arguments["name"], arguments["path"]
        self.load(context, {"name": name})
        pinned = context.state.skills[name]
        if path not in pinned["resources"]:
            raise RuntimeFault("skill_resource_denied")
        previous = pinned["loaded_resources"].get(path)
        if previous is not None:
            return parse_json(json_text(previous))
        data = self.files.read(f"{name}/{path}", 32768)
        digest = hashlib.sha256(data).hexdigest()
        if digest != pinned["resources"][path]:
            raise RuntimeFault("skill_changed")
        try:
            text = data.decode("utf-8-sig")
        except UnicodeError:
            raise RuntimeFault("skill_unavailable") from None
        result = {"name": name, "path": path, "hash": digest, "content": text}
        context.check()
        pinned["loaded_resources"][path] = result
        logger.info("AI skill resource run=%s name=%s path=%s hash=%s", context.run_id, name, path, digest)
        return parse_json(json_text(result))
