"""One deployment-owned repository; private runtime paths are never source."""
import os
from glob import escape
from pathlib import Path

from .runtime.contracts import RuntimeFault
from .runtime.filesystem import SafeRoot
from .tools.source import Scope, Sources


def load_sources(settings):
    """Disabled deployments need no source tree; roots do not depend on cwd.

    The fixed repository identity is evidence metadata, not a scope selector.
    """
    if not settings.source_enabled:
        return Sources()
    root = Path(os.path.abspath(settings.source_root))
    private = [settings.data_dir, settings.world_content_dir]
    if settings.cli_programs_file is not None:
        private.append(settings.cli_programs_file)
    if settings.reasoning_trace_file is not None:
        private.append(settings.reasoning_trace_file.parent)
    excluded = []
    for path in private:
        # Normalize without following links; SafeRoot checks final objects.
        path = Path(os.path.abspath(path))
        if root == path or path in root.parents:
            raise ValueError("SOURCE_ROOT must not be a private runtime directory")
        try:
            relative = path.relative_to(root).as_posix()
        except ValueError:
            continue
        relative = escape(relative)
        excluded.extend((relative, relative + "/*"))
    try:
        scope = Scope("repository", root, exclude=tuple(excluded))
        with SafeRoot(root).opened("", directory=True):
            pass
        return Sources((scope,))
    except (OSError, RuntimeFault, ValueError, TypeError):
        raise ValueError("Invalid SOURCE_ROOT repository configuration") from None
