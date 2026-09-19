#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'HELP'
用法：bash build_msys2.sh [--local] [--no-install] [--help]

在 MSYS2 MinGW64 终端中运行，可从任意目录调用。

默认流程：
  更新 MSYS2 并安装依赖，恢复 FluffOS 已跟踪文件的本地修改，
  拉取官方源码，编译静态 EXE，最后复制到本项目的 bin/。

选项：
  --local       使用本地源码和已安装依赖，跳过 pacman、checkout 和 pull
  --no-install  编译产物保留在 fluffos/build-msys2/bin/，不复制到项目 bin/
  --help        显示此帮助

BUILD_JOBS 可指定并行任务数，例如：
  BUILD_JOBS=4 bash build_msys2.sh --local --no-install

默认启用 CRYPTO（包含 hash）、SQLite，关闭 MySQL/PostgreSQL。
MSYS2 核心升级可能要求关闭终端；重开 MinGW64 终端后重新执行脚本。
复制驱动前请先停止游戏，也可使用 --no-install 仅完成编译。
HELP
}

fail() {
    printf '错误：%s\n' "$*" >&2
    exit 1
}

trap 'printf "错误：构建在第 %s 行失败，已停止后续操作。\n" "$LINENO" >&2' ERR

LOCAL_BUILD=false
INSTALL=true
while (( $# )); do
    case "$1" in
        --local) LOCAL_BUILD=true ;;
        --no-install) INSTALL=false ;;
        --help|-h) usage; exit 0 ;;
        *) usage >&2; fail "未知参数：$1" ;;
    esac
    shift
done

[[ "$(uname -o)" == Msys ]] || fail "请在 MSYS2 MinGW64 终端中运行此脚本。"
[[ "${MSYSTEM:-}" == MINGW64 ]] || fail "当前不是 MinGW64 环境，请打开 MSYS2 MinGW64 终端。"

# 使用同一套 MinGW64 工具链，避免混用 MSYS/UCRT64/其他 CMake。
export PATH="/mingw64/bin:/usr/bin:$PATH"
export PKG_CONFIG_PATH="/mingw64/lib/pkgconfig:/mingw64/share/pkgconfig"
export PKG_CONFIG_LIBDIR="$PKG_CONFIG_PATH"
PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
SOURCE_DIR="$PROJECT_DIR/fluffos"
BUILD_DIR="$SOURCE_DIR/build-msys2"
TARGET_DIR="$PROJECT_DIR/bin"
JOBS="${BUILD_JOBS:-$(nproc)}"
[[ "$JOBS" =~ ^[1-9][0-9]*$ ]] || fail "BUILD_JOBS 必须是正整数。"

if ! $LOCAL_BUILD; then
    printf '正在更新 MSYS2；如提示关闭终端，请重开后再次运行本脚本。\n'
    pacman -Syu
    pacman --noconfirm -S --needed \
        git bison flex make \
        mingw-w64-x86_64-toolchain mingw-w64-x86_64-cmake \
        mingw-w64-x86_64-zlib mingw-w64-x86_64-pcre mingw-w64-x86_64-icu \
        mingw-w64-x86_64-sqlite3 mingw-w64-x86_64-jemalloc mingw-w64-x86_64-gtest \
        mingw-w64-x86_64-openssl mingw-w64-x86_64-pkgconf mingw-w64-x86_64-libffi
fi

for tool in git cmake gcc g++ bison make pkg-config; do
    command -v "$tool" >/dev/null 2>&1 || fail "缺少 $tool，请先不带 --local 执行脚本安装依赖。"
done
[[ "$(gcc -dumpmachine)" == x86_64-w64-mingw32 ]] || fail "检测到错误的编译器，请检查 MinGW64 工具链。"

if [[ ! -e "$SOURCE_DIR" ]]; then
    $LOCAL_BUILD && fail "未找到 fluffos/ 源码，请先不带 --local 执行脚本。"
    git clone https://gitee.com/fluffos/fluffos.git "$SOURCE_DIR"
fi
[[ -f "$SOURCE_DIR/CMakeLists.txt" ]] || fail "fluffos/ 不是有效的源码目录。"
# 防止错误目录使 git 向上找到游戏仓库，进而恢复了错误仓库的文件。
REPO_ROOT="$(git -C "$SOURCE_DIR" rev-parse --show-toplevel)"
[[ "$(cd -- "$REPO_ROOT" && pwd -P)" == "$(cd -- "$SOURCE_DIR" && pwd -P)" ]] ||
    fail "fluffos/ 必须是独立的 Git 仓库。"

if ! $LOCAL_BUILD; then
    printf '正在恢复并更新 FluffOS 官方源码…\n'
    git -C "$SOURCE_DIR" checkout -- .
    git -C "$SOURCE_DIR" pull --ff-only
fi

START_SECONDS=$SECONDS
printf '开始编译，并行任务数：%s\n构建目录：%s\n' "$JOBS" "$BUILD_DIR"
# 使用独立构建目录并增量编译，不删除现有 build/ 或递归清理目录。
cmake -S "$SOURCE_DIR" -B "$BUILD_DIR" -G "MSYS Makefiles" \
    -DCMAKE_C_COMPILER=/mingw64/bin/gcc.exe \
    -DCMAKE_CXX_COMPILER=/mingw64/bin/g++.exe \
    -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX="$BUILD_DIR" \
    -DSTATIC=ON -DMARCH_NATIVE=OFF \
    -DPACKAGE_CRYPTO=ON -DPACKAGE_DB=ON \
    -DPACKAGE_DB_MYSQL="" -DPACKAGE_DB_POSTGRESQL="" \
    -DPACKAGE_DB_SQLITE=2 -DPACKAGE_DB_DEFAULT_DB=2
cmake --build "$BUILD_DIR" --parallel "$JOBS"
cmake --install "$BUILD_DIR"

[[ -s "$BUILD_DIR/bin/driver.exe" ]] || fail "构建没有生成有效的 driver.exe。"
if $INSTALL; then
    command -v powershell.exe >/dev/null 2>&1 || fail "找不到 PowerShell，无法检查驱动是否运行；可用 --no-install 保留构建结果。"
    # 只检查当前项目的 EXE，不停止或影响其他项目。
    if MUD_BUILD_BIN="$(cygpath -aw "$TARGET_DIR")" powershell.exe -NoProfile -NonInteractive -Command '
        $ErrorActionPreference = "Stop"
        $target = [IO.Path]::GetFullPath($env:MUD_BUILD_BIN).TrimEnd([char]92) + [char]92
        foreach ($process in @(Get-Process -Name driver,lpcc,lpcshell,symbol,o2json,json2o -ErrorAction SilentlyContinue)) {
            if (-not $process.Path) { throw "Cannot inspect process $($process.Id)." }
            if ($process.Path.StartsWith($target, [StringComparison]::OrdinalIgnoreCase)) { exit 2 }
        }
        exit 0
    '; then
        mkdir -p -- "$TARGET_DIR"
        cp -- "$BUILD_DIR"/bin/*.exe "$TARGET_DIR/"
    else
        status=$?
        if (( status == 2 )); then
            fail "本项目的驱动或编译工具正在运行，未复制任何文件。请停止后重新执行，或使用 --no-install。"
        fi
        fail "无法检查正在运行的驱动，未复制任何文件；构建结果保留在 $BUILD_DIR/bin/。"
    fi
    printf '驱动已复制到：%s\n' "$TARGET_DIR"
else
    printf '编译完成，未复制到项目 bin/。产物目录：%s/bin/\n' "$BUILD_DIR"
fi
printf '构建耗时：%s 秒。\n' "$((SECONDS - START_SECONDS))"
