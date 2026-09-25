"""Fail-closed, read-only local file snapshots on Windows and Linux.

Windows holds non-delete-sharing handles for every parent and denies concurrent
writes to the leaf. Linux walks directory descriptors with O_NOFOLLOW and
revalidates the complete directory chain and file identity after reading.
Neither backend follows links, accepts multiply-linked files, or runs commands.
"""
import os
import re
import stat
import sys
from contextlib import contextmanager
from pathlib import Path

from .contracts import RuntimeFault


def relative_parts(value, *, empty=False):
    if not isinstance(value, str) or len(value) > 512:
        raise RuntimeFault("file_unavailable")
    if value == "" and empty:
        return ()
    parts = value.split("/")
    if (not parts or any(not part or part in (".", "..") or part.endswith((".", " "))
                         or re.search(r'[\\:*?"<>|\x00-\x1f\x7f]', part)
                         or re.fullmatch(r"(?i)(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?", part)
                         for part in parts)):
        raise RuntimeFault("file_unavailable")
    return tuple(parts)


def _identity(info):
    return info.st_dev, info.st_ino


def _stamp(info):
    return _identity(info), info.st_size, info.st_mtime_ns, info.st_ctime_ns, info.st_nlink


class SafeRoot:
    def __init__(self, root):
        root = Path(root)
        if not root.is_absolute() or ".." in root.parts:
            raise ValueError("Read root must be an absolute local path")
        if os.name == "nt" and (not re.fullmatch(r"[A-Za-z]:", root.drive) or str(root).startswith("\\\\")):
            raise ValueError("Read root must be a local drive path")
        self.root = root

    @contextmanager
    def opened(self, relative, *, directory=False):
        parts = relative_parts(relative, empty=directory)
        if os.name == "nt":
            backend = self._windows(parts, directory)
        elif sys.platform == "linux" and hasattr(os, "O_NOFOLLOW") and os.open in os.supports_dir_fd:
            backend = self._linux(parts, directory)
        else:
            raise RuntimeFault("safe_filesystem_unavailable")
        try:
            with backend as opened:
                yield opened
        except OSError:
            # Missing, denied, linked and locked paths intentionally share an error.
            raise RuntimeFault("file_unavailable") from None

    @contextmanager
    def _linux(self, parts, directory):
        descriptors = []
        chain = []
        try:
            flags = os.O_RDONLY | os.O_CLOEXEC | os.O_NOFOLLOW | os.O_NONBLOCK
            parent = os.open("/", flags | os.O_DIRECTORY)
            descriptors.append(parent)
            components = self.root.parts[1:] + parts
            for index, name in enumerate(components):
                is_directory = directory or index < len(components) - 1
                descriptor = os.open(name, flags | (os.O_DIRECTORY if is_directory else 0), dir_fd=parent)
                descriptors.append(descriptor)
                info = os.fstat(descriptor)
                if not is_directory and (not stat.S_ISREG(info.st_mode) or info.st_nlink != 1):
                    raise RuntimeFault("file_unavailable")
                chain.append((parent, name, descriptor, _identity(info)))
                parent = descriptor
            before = os.fstat(parent)
            def validate():
                for base, name, descriptor, identity in chain:
                    current = os.stat(name, dir_fd=base, follow_symlinks=False)
                    if _identity(current) != identity or stat.S_ISLNK(current.st_mode):
                        raise RuntimeFault("source_changed")
                current = os.fstat(parent)
                if not directory and _stamp(before) != _stamp(current):
                    raise RuntimeFault("source_changed")
            yield _OpenFile(parent, self.root.joinpath(*parts), directory, before.st_size, validate)
            validate()
        finally:
            for descriptor in reversed(descriptors):
                os.close(descriptor)

    @contextmanager
    def _windows(self, parts, directory):
        import ctypes
        import msvcrt
        from ctypes import wintypes as w

        kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        class Information(ctypes.Structure):
            _fields_ = [("attributes", w.DWORD), ("created", w.FILETIME), ("accessed", w.FILETIME),
                        ("written", w.FILETIME), ("volume", w.DWORD), ("size_high", w.DWORD),
                        ("size_low", w.DWORD), ("links", w.DWORD), ("index_high", w.DWORD), ("index_low", w.DWORD)]
        kernel.CreateFileW.argtypes = [w.LPCWSTR, w.DWORD, w.DWORD, w.LPVOID, w.DWORD, w.DWORD, w.HANDLE]
        kernel.CreateFileW.restype = w.HANDLE
        kernel.CloseHandle.argtypes = [w.HANDLE]
        kernel.CloseHandle.restype = w.BOOL
        kernel.GetFileInformationByHandle.argtypes = [w.HANDLE, ctypes.POINTER(Information)]
        kernel.GetFileInformationByHandle.restype = w.BOOL
        kernel.GetFinalPathNameByHandleW.argtypes = [w.HANDLE, w.LPWSTR, w.DWORD, w.DWORD]
        kernel.GetFinalPathNameByHandleW.restype = w.DWORD
        handles, descriptor = [], None
        target = self.root.joinpath(*parts)
        paths = [Path(target.anchor)]
        for name in target.parts[1:]:
            paths.append(paths[-1] / name)
        def inspect(handle, path, is_directory):
            info = Information()
            if not kernel.GetFileInformationByHandle(handle, ctypes.byref(info)):
                raise OSError("Handle metadata unavailable")
            if (info.attributes & 0x400 or bool(info.attributes & 0x10) != is_directory
                    or (not is_directory and info.links != 1)):
                raise RuntimeFault("file_unavailable")
            buffer = ctypes.create_unicode_buffer(32768)
            length = kernel.GetFinalPathNameByHandleW(handle, buffer, len(buffer), 0)
            if not 0 < length < len(buffer):
                raise RuntimeFault("file_unavailable")
            actual = buffer.value
            if actual.startswith("\\\\?\\"):
                actual = actual[4:]
            if os.path.normcase(os.path.normpath(actual)) != os.path.normcase(os.path.normpath(str(path))):
                raise RuntimeFault("source_changed")
            stamp = (info.volume, info.index_high, info.index_low, info.links,
                     info.size_high, info.size_low, info.written.dwHighDateTime, info.written.dwLowDateTime)
            return stamp, (info.size_high << 32) | info.size_low
        try:
            for index, path in enumerate(paths):
                is_directory = directory or index < len(paths) - 1
                # Parents may be written, but cannot be renamed/replaced while held.
                handle = kernel.CreateFileW(str(path), 0x80 if is_directory else 0x80000000,
                                            3 if is_directory else 1, None, 3, 0x02200000, None)
                if handle == ctypes.c_void_p(-1).value:
                    raise OSError("Safe open failed")
                handles.append(handle)
                stamp, size = inspect(handle, path, is_directory)
            def validate():
                if inspect(handles[-1], target, directory)[0] != stamp:
                    raise RuntimeFault("source_changed")
            if not directory:
                # CRT assumes ownership; remove it from the native handle cleanup.
                descriptor = msvcrt.open_osfhandle(handles[-1], os.O_RDONLY | os.O_BINARY)
            yield _OpenFile(descriptor, target, directory, size, validate)
            validate()
        finally:
            if descriptor is not None:
                os.close(descriptor)
                handles.pop()
            for handle in reversed(handles):
                kernel.CloseHandle(handle)

    def read(self, relative, max_bytes=262144):
        with self.opened(relative) as opened:
            if opened.size > max_bytes:
                raise RuntimeFault("file_too_large")
            chunks, remaining = [], max_bytes + 1
            while remaining:
                chunk = os.read(opened.descriptor, min(remaining, 65536))
                if not chunk:
                    break
                chunks.append(chunk)
                remaining -= len(chunk)
            data = b"".join(chunks)
            if len(data) > max_bytes:
                raise RuntimeFault("file_too_large")
            opened.validate()
        return data

    def entries(self, relative="", limit=4096, *, with_count=False):
        with self.opened(relative, directory=True) as opened:
            target = opened.descriptor if os.name != "nt" else opened.path
            entries = []
            truncated = False
            examined = 0
            with os.scandir(target) as iterator:
                for index, entry in enumerate(iterator):
                    if index >= limit:
                        truncated = True
                        break
                    examined += 1
                    info = entry.stat(follow_symlinks=False)
                    # Filter links here as well as at open; never enumerate a link target.
                    if stat.S_ISLNK(info.st_mode) or getattr(info, "st_file_attributes", 0) & 0x400:
                        continue
                    entries.append((entry.name, stat.S_ISDIR(info.st_mode)))
            opened.validate()
        result = (sorted(entries), truncated)
        # Internal accounting includes filtered links, not just visible entries.
        # Never include this count in a model/tool result.
        return (*result, examined) if with_count else result


class _OpenFile:
    def __init__(self, descriptor, path, directory, size, validate):
        self.descriptor, self.path, self.directory = descriptor, path, directory
        self.size, self.validate = size, validate
