"""Versioned, byte-framed facts shared with inherit/illusion/content.lpc."""
import hashlib
import json
import re
import unicodedata

TEXT_FIELDS = ("name", "biome", "biome_name", "patch", "theme", "role", "description",
               "transition", "secondary", "scene_id", "scene_name", "scene_biome", "scene_theme", "material", "condition")
INT_FIELDS = ("elevation", "moisture", "temperature", "slope", "road")
DIGEST = re.compile(r"[0-9a-f]{64}\Z")
WORLD_ID = re.compile(r"[a-z][a-z0-9-]{0,47}\Z")
LIMIT = 1_000_000_000


def frame(fields):
    return "".join(f"{len(value.encode('utf-8'))}:{value}" for value in fields)


def digest(fields):
    return hashlib.sha256(frame(fields).encode("utf-8")).hexdigest()


def strict_json(text):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError("duplicate field")
            result[key] = value
        return result
    return json.loads(text, object_pairs_hook=pairs,
                      parse_constant=lambda value: (_ for _ in ()).throw(ValueError("non-finite")))


def safe_text(value, limit=600, *, newline=False):
    if not isinstance(value, str) or len(value) > limit:
        raise ValueError("invalid text")
    # Reject terminal controls, surrogates, bidi/zero-width format controls.
    if any(unicodedata.category(ch).startswith("C") and not (newline and ch == "\n") for ch in value):
        raise ValueError("control character")
    value.encode("utf-8")
    return value


def integer(value, low, high):
    if type(value) is not int or not low <= value <= high:
        raise ValueError("integer outside range")
    return value


def manifest_digest(world):
    expected = {"world_id", "seed", "generator_version", "catalog_version", "catalog_digest",
                "content_version", "test_world", "parameters", "manifest_digest"}
    if not isinstance(world, dict) or set(world) != expected:
        raise ValueError("manifest fields")
    if not WORLD_ID.fullmatch(world["world_id"]) or not WORLD_ID.fullmatch(world["catalog_version"]):
        raise ValueError("world ID")
    integer(world["seed"], 0, 2147483647)
    integer(world["generator_version"], 1, 1)
    integer(world["content_version"], 1, 1)
    integer(world["test_world"], 0, 1)
    if world["world_id"].startswith("test-") != bool(world["test_world"]):
        raise ValueError("test world")
    params = world["parameters"]
    if not isinstance(params, dict) or set(params) != {"coordinate_limit", "chunk_size", "anchor_size"}:
        raise ValueError("parameters")
    for key, value in (("coordinate_limit", LIMIT), ("chunk_size", 16), ("anchor_size", 32)):
        integer(params[key], value, value)
    if not DIGEST.fullmatch(world["catalog_digest"]):
        raise ValueError("catalog digest")
    result = digest(["illusion-manifest-v1", world["world_id"], str(world["seed"]), "1",
                     world["catalog_version"], world["catalog_digest"], "1",
                     str(world["test_world"]), str(LIMIT), "16", "32"])
    if result != world["manifest_digest"]:
        raise ValueError("manifest digest")
    return result


def facts_digest(facts, x, y):
    if not isinstance(facts, dict) or set(facts) != set(TEXT_FIELDS + INT_FIELDS) | {"schema_version", "landmarks"}:
        raise ValueError("facts fields")
    integer(facts["schema_version"], 1, 1)
    fields = ["illusion-facts-v1"]
    for key in TEXT_FIELDS:
        fields.append(safe_text(facts[key], newline=True))
    for key in INT_FIELDS:
        fields.append(str(integer(facts[key], 0, 1 if key == "road" else 131070 if key == "slope" else 65535)))
    landmarks = facts["landmarks"]
    if not isinstance(landmarks, list) or len(landmarks) > 1:
        raise ValueError("landmarks")
    fields.append(str(len(landmarks)))
    for mark in landmarks:
        if not isinstance(mark, dict) or set(mark) != {"id", "name", "x", "y", "direction"}:
            raise ValueError("landmark fields")
        dx = integer(mark["x"], -LIMIT, LIMIT) - x
        dy = integer(mark["y"], -LIMIT, LIMIT) - y
        direction = ("north" if dy > 0 else "south" if dy < 0 else "") + ("east" if dx > 0 else "west" if dx < 0 else "")
        if max(abs(dx), abs(dy)) > 8 or mark["direction"] != (direction or "here"):
            raise ValueError("landmark direction")
        if not facts["scene_id"] or mark["id"] != facts["scene_id"] + ":landmark":
            raise ValueError("landmark identity")
        fields += [safe_text(mark["id"], 128), safe_text(mark["name"], 128),
                   str(mark["x"]), str(mark["y"]), mark["direction"]]
    return digest(fields)


def content_key(manifest, x, y, facts_sha):
    if not isinstance(manifest, str) or not DIGEST.fullmatch(manifest) or not DIGEST.fullmatch(facts_sha):
        raise ValueError("digest")
    integer(x, -LIMIT, LIMIT)
    integer(y, -LIMIT, LIMIT)
    return digest(["illusion-content-v1", manifest, str(x), str(y), facts_sha])


def validate_payload(payload):
    if set(payload) != {"world_id", "manifest_digest", "x", "y", "facts", "facts_digest", "content_key"}:
        raise ValueError("payload fields")
    if not isinstance(payload["world_id"], str) or not WORLD_ID.fullmatch(payload["world_id"]):
        raise ValueError("world ID")
    x, y = payload["x"], payload["y"]
    integer(x, -LIMIT, LIMIT)
    integer(y, -LIMIT, LIMIT)
    sha = facts_digest(payload["facts"], x, y)
    if sha != payload["facts_digest"] or content_key(payload["manifest_digest"], x, y, sha) != payload["content_key"]:
        raise ValueError("content identity")
    if len(json.dumps(payload, ensure_ascii=False).encode("utf-8")) > 6144:
        raise ValueError("facts too large")
    return payload


def validate_prose(raw, facts):
    """Validate the output contract, not literary detail or full semantic consistency.

    Plausible scenery and metaphor need not copy input wording or have fact IDs.
    Only references to supplied landmarks use used_fact_ids; semantic review is separate.
    """
    result = strict_json(raw) if isinstance(raw, str) else raw
    if not isinstance(result, dict) or set(result) != {"schema_version", "description", "used_fact_ids"}:
        raise ValueError("prose fields")
    integer(result["schema_version"], 1, 1)
    text = safe_text(result["description"], 360, newline=True)
    if not text.strip() or len(text.encode("utf-8")) > 1800 or text.count("\n") > 2 or len([line for line in text.split("\n") if line.strip()]) > 2:
        raise ValueError("prose length")
    if any(token in text for token in ("```", "<|", "[INST]", "</", "<script", "API", "数据库", "后台队列")):
        raise ValueError("unsafe prose")
    ids = result["used_fact_ids"]
    allowed = {mark["id"] for mark in facts["landmarks"]}
    if not isinstance(ids, list) or len(ids) > len(allowed) or any(not isinstance(key, str) or key not in allowed for key in ids) or len(set(ids)) != len(ids):
        raise ValueError("unknown fact reference")
    return result
