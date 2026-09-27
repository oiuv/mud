"""One configured CLI tool; discovery is separate from invocation authority."""
from pathlib import Path
import re

from ..runtime.cli import command_prefix, run_cli
from ..runtime.contracts import Contract, RuntimeFault, json_text
from ..runtime.tools import Tool


class Program:
    """A trusted command binding and its operation-specific argv contracts.

    Special integrations may supply authorize/execute callbacks without adding
    a model tool. General CLIs use the same launcher and their declared stdout.
    """
    def __init__(self, name, command, cwd, description, operations, *, authorize=None, execute=None,
                 validate_arguments=None):
        if (not re.fullmatch(r"[a-z][a-z0-9_-]{0,47}", name)
                or not isinstance(description, str) or not 0 < len(description) <= 1000
                or not isinstance(operations, dict) or not 1 <= len(operations) <= 32):
            raise ValueError("Invalid CLI program definition")
        self.name, self.command, self.cwd = name, command_prefix(command), Path(cwd)
        self.description, self.authorizer, self.executor = description, authorize, execute
        self.validate_arguments = validate_arguments
        self.operations = {}
        for operation, definition in operations.items():
            if (not re.fullmatch(r"[a-z][a-z0-9_-]{0,47}", operation)
                    or not isinstance(definition, dict)
                    or set(definition) != {"description", "arguments"}
                    or not isinstance(definition["description"], str)
                    or not 0 < len(definition["description"]) <= 1000):
                raise ValueError("Invalid CLI operation definition")
            # Reuse the runtime's local JSON contracts, not a shell parser.
            contract = Contract(definition["arguments"])
            if contract.schema.get("type") != "array":
                raise ValueError("CLI operation arguments must be an array contract")
            self.operations[operation] = (definition["description"], contract)

    def allowed(self, context):
        context.check()
        if self.authorizer is not None:
            self.authorizer(context)

    def validate(self, context, args):
        self.allowed(context)
        if not args or args[0] not in self.operations:
            raise RuntimeFault("cli_operation_denied")
        self.operations[args[0]][1].validate(args[1:], 8192)
        if self.validate_arguments is not None:
            self.validate_arguments(context, args)

    def invoke(self, context, args):
        self.validate(context, args)
        if self.executor is not None:
            return self.executor(context, args)
        return {"stdout": run_cli(self.command, self.cwd, args, context, max_bytes=8000),
                "untrusted": True}

    def catalog(self):
        return {"program": self.name, "description": self.description,
                "operations": {name: {"description": description, "arguments": contract.schema}
                               for name, (description, contract) in self.operations.items()}}


def load_programs(path, base):
    """Configuration is local administrator data, never a request/Skill path."""
    if not path:
        return []
    path = Path(path)
    path = path if path.is_absolute() else Path(base) / path
    try:
        from ..runtime.contracts import parse_json
        config = parse_json(path.read_text(encoding="utf-8"), 65536)
        if not isinstance(config, dict) or len(config) > 16:
            raise ValueError()
        programs = []
        for name, item in config.items():
            if (not isinstance(item, dict)
                    or set(item) != {"command", "cwd", "description", "operations"}
                    or not isinstance(item["cwd"], str) or not item["cwd"].strip()):
                raise ValueError()
            cwd = Path(item["cwd"])
            programs.append(Program(name, item["command"], cwd if cwd.is_absolute() else Path(base) / cwd,
                                    item["description"], item["operations"]))
        return programs
    except (OSError, ValueError, TypeError, RuntimeFault):
        raise ValueError("Invalid CLI_PROGRAMS_FILE; check trusted CLI configuration") from None


class Commands:
    def __init__(self, programs):
        self.programs = {}
        for program in programs:
            if program.name in self.programs:
                raise ValueError("Duplicate CLI program alias")
            self.programs[program.name] = program

    def authorize(self, context, arguments):
        program = self.programs.get(arguments["program"])
        if program is None:
            raise RuntimeFault("cli_program_denied")
        program.validate(context, arguments["args"])

    def execute(self, context, arguments):
        self.authorize(context, arguments)
        return self.programs[arguments["program"]].invoke(context, arguments["args"])

    def describe(self, context):
        catalog = []
        for program in self.programs.values():
            try:
                program.allowed(context)
            except RuntimeFault:
                context.check()
                continue
            catalog.append(program.catalog())
        return "通过程序别名与参数数组调用已授权 CLI，不接受 Shell 命令。args 第一项为操作。可用命令：" + json_text(catalog, 24000)

    def tool(self):
        return Tool("exec", "调用管理员配置并授权的 CLI。", Contract({
            "type": "object", "required": ["program", "args"], "additionalProperties": False,
            "properties": {
                "program": {"type": "string", "minLength": 1, "maxLength": 48},
                "args": {"type": "array", "minItems": 1, "maxItems": 32,
                         "items": {"type": "string", "maxLength": 1024,
                                   "pattern": "^[^\\u0000\\r\\n]*$"}},
            }}), Contract({"type": "object"}), self.execute, self.authorize,
            timeout=15, describe=self.describe)


def build_tools(services):
    settings = services.get("settings")
    if settings is None:
        return
    from ..settings import SERVICE_DIR
    from .codegraph import build_program
    programs = load_programs(settings.cli_programs_file, SERVICE_DIR)
    if any(program.name == "codegraph" for program in programs):
        raise ValueError("codegraph is reserved; configure CODEGRAPH_* for source-safe queries")
    graph = build_program(services)
    if graph is not None:
        programs.append(graph)
    if programs:
        yield Commands(programs).tool()
