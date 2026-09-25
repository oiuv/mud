"""Bounded JSON contracts. Schemas are trusted deployment data, never model input."""
import json
import re
from types import MappingProxyType

from jsonschema import Draft202012Validator
from referencing import Registry


class RuntimeFault(Exception):
    def __init__(self, code, status="failed"):
        self.code = code if isinstance(code, str) and re.fullmatch(r"[a-z][a-z0-9_]{0,63}", code) else "internal_error"
        self.status = status if status in ("failed", "incomplete", "cancelled") else "failed"
        super().__init__(self.code)


def json_text(value, limit=131072):
    try:
        text = json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
        if len(text.encode("utf-8")) > limit:
            raise RuntimeFault("size_limit", "incomplete")
        return text
    except (ValueError, TypeError, UnicodeError, RecursionError) as error:
        raise RuntimeFault("invalid_json") from error


def parse_json(text, limit=32768):
    if not isinstance(text, str) or len(text.encode("utf-8", errors="replace")) > limit:
        raise RuntimeFault("invalid_json")
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError("duplicate key")
            result[key] = value
        return result
    def invalid_constant(value):
        raise ValueError("non-finite JSON")
    try:
        return json.loads(text, object_pairs_hook=pairs, parse_constant=invalid_constant)
    except (ValueError, TypeError, RecursionError) as error:
        raise RuntimeFault("invalid_json") from error


def freeze(value):
    if isinstance(value, dict):
        return MappingProxyType({key: freeze(item) for key, item in value.items()})
    if isinstance(value, (tuple, list)):
        return tuple(freeze(item) for item in value)
    return value


class Contract:
    def __init__(self, schema):
        self._schema = parse_json(json_text(schema, 65536), 65536)
        # No network/filesystem reference resolution, even for trusted plugin schemas.
        def check_refs(node):
            if isinstance(node, dict):
                for key, value in node.items():
                    if key in ("$ref", "$dynamicRef") and not str(value).startswith("#"):
                        raise ValueError("Only local schema references are supported")
                    check_refs(value)
            elif isinstance(node, list):
                for item in node:
                    check_refs(item)
        check_refs(self._schema)
        Draft202012Validator.check_schema(self._schema)
        self._validator = Draft202012Validator(self._schema, registry=Registry())

    @property
    def schema(self):
        return parse_json(json_text(self._schema, 65536), 65536)

    def validate(self, value, limit=131072):
        # Reject arbitrary objects, NaN and unbounded values before schema traversal.
        copied = parse_json(json_text(value, limit), limit)
        try:
            self._validator.validate(copied)
        except Exception as error:
            # Validation messages include instance values; never expose them to logs.
            raise RuntimeFault("contract_violation") from error
        return copied
