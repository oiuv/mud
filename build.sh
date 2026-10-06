#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'HELP'
用法：bash build.sh [--local] [--no-install] [--build-dir DIR] [--debug] [--march-native] [--help]

在 Linux Bash 中运行，可从任意目录调用。自动安装依赖适用于 Debian/Ubuntu。

默认流程：
  更新 apt 软件包列表并安装依赖，从 GitHub 拉取 FluffOS 官方源码，
  增量编译驱动和发布工具，产物保留在 fluffos/build/bin/，
  并将 driver 复制到 /usr/local/games/（与旧脚本一致）。
  不丢弃源码修改，不删除构建目录；依赖安装及系统复制按需使用 sudo。

选项：
  --local       使用本地源码和已安装依赖，跳过 apt、clone 和 pull
  --no-install  不复制到 /usr/local/games/，仍将产物安装到构建目录的 bin/
  --build-dir DIR
                指定构建目录，默认 fluffos/build
                相对路径以本项目根目录为准，也支持 Linux 绝对路径
  --debug       使用 Debug 构建；默认 Release，不改变构建目录
  --march-native
                开启本机 CPU 优化；默认关闭，产物可能无法在较旧 CPU 上运行
  --help        显示此帮助

BUILD_JOBS 可指定并行任务数，例如：
  BUILD_JOBS=4 bash build.sh --local --no-install
  bash build.sh --local --no-install --debug --build-dir fluffos/build-debug
  bash build.sh --local --no-install --march-native

默认启用 CRYPTO（包含 hash）、SQLite，关闭 MySQL/PostgreSQL。
SQLite 后端编号和默认数据库编号均为 1（不是 SQLite 版本号）。
Linux 使用动态链接；只构建发布程序，不构建上游单元测试或基准程序。
复用目录会重新配置，不沿用缓存中的 Debug 或本机 CPU 优化选项。
更新正在使用的驱动前请先停服；仅验证时请另选构建目录并加 --no-install。
run.sh 仍使用默认的 fluffos/build/bin/driver；自定义目录的驱动需手动运行。
HELP
}

fail() {
    printf '错误：%s\n' "$*" >&2
    exit 1
}

as_root() {
    if (( EUID == 0 )); then
        "$@"
    else
        sudo "$@"
    fi
}

trap 'printf "错误：构建在第 %s 行失败，已停止后续操作。\n" "$LINENO" >&2' ERR

LOCAL_BUILD=false
INSTALL=true
BUILD_DIR=""
BUILD_TYPE=Release
MARCH_NATIVE=OFF
while (( $# )); do
    case "$1" in
        --local) LOCAL_BUILD=true ;;
        --no-install) INSTALL=false ;;
        --debug) BUILD_TYPE=Debug ;;
        --march-native) MARCH_NATIVE=ON ;;
        --build-dir)
            [[ $# -ge 2 && -n "${2:-}" && "${2:-}" != --* ]] ||
                fail "--build-dir 需要非空目录参数。"
            BUILD_DIR="$2"
            shift
            ;;
        --help|-h) usage; exit 0 ;;
        *) usage >&2; fail "未知参数：$1" ;;
    esac
    shift
done

[[ "$(uname -s)" == Linux ]] || fail "请在 Linux 中运行；Windows 请使用 build_msys2.sh。"
PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
SOURCE_DIR="$PROJECT_DIR/fluffos"
SOURCE_URL=https://github.com/fluffos/fluffos.git
BUILD_DIR="$(cd -- "$PROJECT_DIR" && realpath -m -- "${BUILD_DIR:-fluffos/build}")"
SOURCE_ROOT="$(realpath -m -- "$SOURCE_DIR")"
# 禁止在源码内原地构建，或把项目的祖先目录作为构建目录。
[[ "$BUILD_DIR" != / && "$PROJECT_DIR/" != "$BUILD_DIR/"* &&
   "$SOURCE_ROOT/" != "$BUILD_DIR/"* ]] ||
    fail "构建目录不能是项目或 FluffOS 源码根目录及其上级，请指定独立目录。"
JOBS="${BUILD_JOBS:-$(nproc)}"
[[ "$JOBS" =~ ^[1-9][0-9]*$ ]] || fail "BUILD_JOBS 必须是正整数。"

if { ! $LOCAL_BUILD || $INSTALL; } && (( EUID != 0 )); then
    command -v sudo >/dev/null 2>&1 || fail "缺少 sudo；仅本地编译可使用 --local --no-install。"
fi
if ! $LOCAL_BUILD; then
    command -v apt-get >/dev/null 2>&1 ||
        fail "自动安装依赖仅支持 Debian/Ubuntu；其他 Linux 请安装依赖后使用 --local。"
    as_root apt-get update
    as_root apt-get install -y \
        git bison flex build-essential autoconf automake cmake pkg-config \
        libjemalloc-dev zlib1g-dev libssl-dev libsqlite3-dev libpcre2-dev \
        libevent-dev libicu-dev libdw-dev binutils-dev libffi-dev python3
fi

for tool in git cmake gcc g++ bison make pkg-config; do
    command -v "$tool" >/dev/null 2>&1 || fail "缺少 $tool，请先安装构建依赖。"
done
if [[ ! -e "$SOURCE_DIR" ]]; then
    $LOCAL_BUILD && fail "未找到 fluffos/ 源码，请先不带 --local 执行脚本。"
    git clone "$SOURCE_URL" "$SOURCE_DIR"
fi
[[ -f "$SOURCE_DIR/CMakeLists.txt" ]] || fail "fluffos/ 不是有效的源码目录。"
REPO_ROOT="$(git -C "$SOURCE_DIR" rev-parse --show-toplevel)"
[[ "$(cd -- "$REPO_ROOT" && pwd -P)" == "$(cd -- "$SOURCE_DIR" && pwd -P)" ]] ||
    fail "fluffos/ 必须是独立的 Git 仓库。"
if ! $LOCAL_BUILD; then
    # 不自动 checkout/reset/stash；本地修改交由维护者处理。
    SOURCE_STATUS="$(git -C "$SOURCE_DIR" status --porcelain)"
    [[ -z "$SOURCE_STATUS" ]] ||
        fail "fluffos/ 有未提交修改，请先处理，或使用 --local 编译当前源码。"
    printf '正在快进更新 FluffOS 官方源码…\n'
    git -C "$SOURCE_DIR" pull --ff-only "$SOURCE_URL"
fi

START_SECONDS=$SECONDS
printf '开始编译，并行任务数：%s\n构建目录：%s\n' "$JOBS" "$BUILD_DIR"
printf '构建类型：%s\n本机 CPU 优化：%s\n' "$BUILD_TYPE" "$MARCH_NATIVE"
# 清除旧 PCRE 缓存以重新探测 PCRE2，不删除其他增量构建结果。
cmake -S "$SOURCE_DIR" -B "$BUILD_DIR" -G "Unix Makefiles" \
    -U PCRE_LIBRARY -U PCRE_INCLUDE_DIR \
    -DCMAKE_BUILD_TYPE="$BUILD_TYPE" -DCMAKE_INSTALL_PREFIX="$BUILD_DIR" \
    -DSTATIC=OFF -DMARCH_NATIVE="$MARCH_NATIVE" \
    -DPACKAGE_CRYPTO=ON -DPACKAGE_DB=ON \
    -DPACKAGE_DB_MYSQL="" -DPACKAGE_DB_POSTGRESQL="" \
    -DPACKAGE_DB_SQLITE=1 -DPACKAGE_DB_DEFAULT_DB=1
# portbind 是 Linux 上 cmake --install 需要的额外发布程序。
cmake --build "$BUILD_DIR" --parallel "$JOBS" \
    --target driver lpcc lpcshell symbol o2json json2o portbind
cmake --install "$BUILD_DIR"

[[ -s "$BUILD_DIR/bin/driver" && -x "$BUILD_DIR/bin/driver" ]] ||
    fail "构建没有生成有效的 driver。"
if $INSTALL; then
    as_root mkdir -p -- /usr/local/games
    as_root cp -- "$BUILD_DIR/bin/driver" /usr/local/games/driver
    printf '驱动已复制到：/usr/local/games/driver\n'
else
    printf '编译完成，未复制到系统目录。\n'
fi
printf '产物目录：%s/bin/\n构建耗时：%s 秒。\n' "$BUILD_DIR" "$((SECONDS - START_SECONDS))"
