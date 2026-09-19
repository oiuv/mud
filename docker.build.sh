#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'HELP'
用法：bash docker.build.sh [--local] [--help]

默认恢复并更新 FluffOS 官方源码，然后构建游戏驱动镜像。
  --local  使用本地已提交的源码版本（HEAD），跳过 checkout、pull 和 clone
  --help   显示此帮助

环境变量：
  MUD_DOCKER_IMAGE  镜像名称，默认 fluffos:latest

直接使用 FluffOS 自带 Dockerfile 及默认编译选项，不修改其源码或 Dockerfile。
构建上下文来自 Git HEAD，不包含本地未提交文件或宿主机编译产物。
HELP
}
fail() { printf '错误：%s\n' "$*" >&2; exit 1; }
trap 'printf "错误：构建在第 %s 行失败，已停止。\n" "$LINENO" >&2' ERR

LOCAL_BUILD=false
while (( $# )); do
    case "$1" in
        --local) LOCAL_BUILD=true ;;
        --help|-h) usage; exit 0 ;;
        *) usage >&2; fail "未知参数：$1" ;;
    esac
    shift
done

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
SOURCE_DIR="$PROJECT_DIR/fluffos"
IMAGE="${MUD_DOCKER_IMAGE:-fluffos:latest}"
for tool in docker git; do
    command -v "$tool" >/dev/null 2>&1 || fail "找不到 $tool。"
done
docker info >/dev/null || fail "Docker 引擎不可用，请先启动 Docker。"

if [[ ! -e "$SOURCE_DIR" ]]; then
    $LOCAL_BUILD && fail "未找到 fluffos/，请先不带 --local 执行脚本。"
    git clone https://gitee.com/fluffos/fluffos.git "$SOURCE_DIR"
fi
[[ -f "$SOURCE_DIR/CMakeLists.txt" ]] || fail "fluffos/ 不是有效的源码目录。"
REPO_ROOT="$(git -C "$SOURCE_DIR" rev-parse --show-toplevel)"
[[ "$(cd -- "$REPO_ROOT" && pwd -P)" == "$(cd -- "$SOURCE_DIR" && pwd -P)" ]] ||
    fail "fluffos/ 必须是独立的 Git 仓库。"
if ! $LOCAL_BUILD; then
    git -C "$SOURCE_DIR" checkout -- .
    git -C "$SOURCE_DIR" pull --ff-only
fi
# 构建上下文为当前提交的原版源码，包括 FluffOS 自带的 Dockerfile。
# 不带入宿主机的 build/、.env 或本地未提交文件。
if [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* ]]; then
    export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'
fi
git -C "$SOURCE_DIR" archive --format=tar HEAD |
    docker build --progress=plain --tag "$IMAGE" -
printf '镜像构建完成：%s\n启动游戏：bash docker.run.sh start\n' "$IMAGE"
