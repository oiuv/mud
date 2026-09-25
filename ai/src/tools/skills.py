"""Skill discovery/loading for both direct preload and model tool calls."""
from ..runtime.contracts import Contract
from ..runtime.tools import Tool


def build_tools(services):
    skills = services.get("skills")
    if skills is None:
        return
    name = {"type": "string", "pattern": "^[a-z][a-z0-9-]{0,47}$"}
    yield Tool("skill", "按名称加载获准使用的专业技能。可选 path 读取该技能声明的参考资料；不执行脚本。",
               Contract({"type": "object", "properties": {
                   "name": name, "path": {"type": "string", "minLength": 1, "maxLength": 256}},
                   "required": ["name"], "additionalProperties": False}),
               Contract({"type": "object"}), skills.invoke, skills.authorize,
               max_bytes=65536, resource="skill", concurrent_safe=True)
