"""A single pair of tools for explicitly bound business capabilities."""


def build_tools(services):
    delegates = services.get("agents")
    if delegates is not None:
        yield from delegates.tools()
