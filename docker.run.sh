#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'HELP'
用法：bash docker.run.sh [start|stop|restart|status|run|logs|help]

  start    后台启动游戏容器（默认），Docker 重启后自动恢复
  stop     停止本项目的游戏容器，保留容器日志
  restart  停止并重新创建容器，应用最新镜像和端口配置
  status   查看容器状态和端口；0 表示运行中，3 表示未运行
  run      在当前终端前台运行，退出后保留容器日志
  logs     显示最近 100 行容器日志并持续跟踪
  help     显示此帮助

run 模式下按 Ctrl+C 停止游戏；logs 模式下只退出日志查看。
游戏目录挂载到 /opt/mud；配置为 docker.config.cfg，文件日志位于 log/。
首次启动会从 data/.env.example 补齐缺失的 data/.env。

环境变量：
  MUD_DOCKER_IMAGE    镜像名称，默认 fluffos:latest
  MUD_DOCKER_NAME     容器名称，默认按项目路径生成
  MUD_BIND_IP         宿主机监听地址，默认 0.0.0.0
  MUD_TELNET_PORT     GBK Telnet 端口，默认 5566
  MUD_UTF8_PORT       UTF-8 Telnet 端口，默认 6666
  MUD_WEB_PORT        网页和 WebSocket 端口，默认 8080
  MUD_DOCKER_NETWORK  已存在的 Docker 桥接网络，默认 bridge
  MUD_START_TIMEOUT   等待游戏就绪的最长秒数，默认 60
  MUD_STOP_TIMEOUT    停止容器等待秒数，默认 30

镜像仅运行游戏驱动；NPC AI 服务需单独启动并配置网络。
容器中的 127.0.0.1 指向容器自身，不能直接连接宿主机上的 NPC AI。
HELP
}
fail() { printf '错误：%s\n' "$*" >&2; exit 1; }
ai_hint() {
    printf '如需 AI 功能，请单独启动 NPC AI 服务，并配置容器与该服务之间的网络。\n'
}
COMMAND="${1:-start}"
(( $# <= 1 )) || { usage >&2; exit 1; }
case "$COMMAND" in
    help|--help|-h) usage; exit 0 ;;
    start|stop|restart|status|run|logs) ;;
    *) usage >&2; fail "未知指令：$COMMAND" ;;
esac

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
MOUNT_DIR="$PROJECT_DIR"
if [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* ]]; then
    export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'
    MOUNT_DIR="$(cygpath -am "$PROJECT_DIR")"
fi
PROJECT_ID="$(printf '%s' "$MOUNT_DIR" | sha256sum)"
PROJECT_ID="${PROJECT_ID%% *}"
NAME="${MUD_DOCKER_NAME:-mud-${PROJECT_ID:0:12}}"
IMAGE="${MUD_DOCKER_IMAGE:-fluffos:latest}"
[[ "$NAME" =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]*$ ]] || fail "容器名称格式无效：$NAME"
command -v docker >/dev/null 2>&1 || fail "未安装 Docker。"
docker info >/dev/null || fail "Docker 引擎不可用，请先启动 Docker。"

CONTAINER_ID=""
STATE=""
# 先列举成功再判断不存在，避免将连接失败误认为容器不存在。
NAMES="$(docker container ls --all --format '{{.Names}}')"
while IFS= read -r entry; do
    [[ "$entry" == "$NAME" ]] || continue
    DETAILS="$(docker container inspect --format '{{.Id}}|{{index .Config.Labels "org.mud.project"}}|{{.State.Status}}' "$NAME")"
    IFS='|' read -r CONTAINER_ID OWNER STATE <<< "$DETAILS"
    [[ "$OWNER" == "$PROJECT_ID" ]] || fail "容器 $NAME 不属于当前项目，未进行操作。"
    break
done <<< "$NAMES"

case "$COMMAND" in
    status)
        if [[ -z "$CONTAINER_ID" ]]; then printf '游戏容器未创建：%s\n' "$NAME"; exit 3; fi
        printf '游戏容器：%s，状态：%s\n' "$NAME" "$STATE"
        docker container port "$CONTAINER_ID"
        [[ "$STATE" == running ]] && exit 0
        exit 3
        ;;
    logs)
        [[ -n "$CONTAINER_ID" ]] || fail "游戏容器未创建，请先执行 start。"
        exec docker container logs --tail 100 --follow "$CONTAINER_ID"
        ;;
esac
TIMEOUT="${MUD_STOP_TIMEOUT:-30}"
[[ "$TIMEOUT" =~ ^[1-9][0-9]*$ && "${#TIMEOUT}" -le 4 ]] ||
    fail "MUD_STOP_TIMEOUT 必须是 1 至 9999 的整数。"

if [[ "$COMMAND" == start || "$COMMAND" == run ]] && [[ "$STATE" == running ]]; then
    printf '游戏容器已在运行：%s\n' "$NAME"
    ai_hint
    [[ "$COMMAND" == start ]] && exit 0
    exit 1
fi
# restart 先检查启动条件，避免配置错误时停止正常运行的容器。
if [[ "$COMMAND" != stop ]]; then
    [[ -f "$PROJECT_DIR/docker.config.cfg" ]] || fail "找不到 docker.config.cfg。"
    [[ -d "$PROJECT_DIR/mudcore/include" ]] || fail "缺少 mudcore，请先执行 git submodule update --init。"
    docker image inspect "$IMAGE" >/dev/null 2>&1 || fail "找不到镜像 $IMAGE，请先执行 bash docker.build.sh。"
    [[ -f "$PROJECT_DIR/data/.env" || -f "$PROJECT_DIR/data/.env.example" ]] ||
        fail "缺少 data/.env 及其示例配置。"
    START_TIMEOUT="${MUD_START_TIMEOUT:-60}"
    [[ "$START_TIMEOUT" =~ ^[1-9][0-9]*$ && "${#START_TIMEOUT}" -le 4 ]] ||
        fail "MUD_START_TIMEOUT 必须是 1 至 9999 的整数。"
    TELNET_PORT="${MUD_TELNET_PORT:-5566}"
    UTF8_PORT="${MUD_UTF8_PORT:-6666}"
    WEB_PORT="${MUD_WEB_PORT:-8080}"
    for port in "$TELNET_PORT" "$UTF8_PORT" "$WEB_PORT"; do
        [[ "$port" =~ ^[1-9][0-9]*$ && "${#port}" -le 5 ]] &&
            (( port <= 65535 )) || fail "端口必须是 1 至 65535 的整数：$port"
    done
    [[ "$TELNET_PORT" != "$UTF8_PORT" && "$TELNET_PORT" != "$WEB_PORT" && "$UTF8_PORT" != "$WEB_PORT" ]] ||
        fail "三个宿主机端口不能相同。"
    BIND_IP="${MUD_BIND_IP:-0.0.0.0}"
    NETWORK="${MUD_DOCKER_NETWORK:-bridge}"
    [[ "$NETWORK" != host && "$NETWORK" != none && "$NETWORK" != container:* ]] ||
        fail "MUD_DOCKER_NETWORK 必须使用桥接网络，以支持端口映射。"
    docker network inspect "$NETWORK" >/dev/null || fail "Docker 网络不存在：$NETWORK"
fi

if [[ "$COMMAND" == stop || "$COMMAND" == restart ]]; then
    if [[ -n "$CONTAINER_ID" ]]; then
        docker container stop --time "$TIMEOUT" "$CONTAINER_ID" >/dev/null
        printf '游戏容器已停止：%s\n' "$NAME"
    else
        printf '游戏容器未创建：%s\n' "$NAME"
    fi
    [[ "$COMMAND" == stop ]] && exit 0
    STATE=exited
fi
if [[ -n "$CONTAINER_ID" ]]; then
    case "$STATE" in
        exited|created|dead)
            docker container rm "$CONTAINER_ID" >/dev/null ;;
        *) fail "容器状态为 $STATE，请先执行 stop。" ;;
    esac
fi

mkdir -p -- "$PROJECT_DIR/log"
if [[ ! -f "$PROJECT_DIR/data/.env" ]]; then
    cp -- "$PROJECT_DIR/data/.env.example" "$PROJECT_DIR/data/.env"
    printf '已创建 data/.env，请按需修改游戏配置。\n'
fi
OPTIONS=(--name "$NAME" --label "org.mud.project=$PROJECT_ID"
    --workdir /opt/mud --mount "type=bind,source=$MOUNT_DIR,target=/opt/mud"
    --network "$NETWORK" --stop-timeout "$TIMEOUT"
    --publish "$BIND_IP:$TELNET_PORT:5566"
    --publish "$BIND_IP:$UTF8_PORT:6666"
    --publish "$BIND_IP:$WEB_PORT:80")
# 官方镜像提供 BusyBox wget；从容器内检查网页端口，不依赖宿主机工具。
IMAGE_HEALTH="$(docker image inspect --format '{{if .Config.Healthcheck}}{{index .Config.Healthcheck.Test 0}}{{end}}' "$IMAGE")"
if [[ -z "$IMAGE_HEALTH" || "$IMAGE_HEALTH" == NONE ]]; then
    OPTIONS+=(--health-cmd 'wget -q -T 2 -O /dev/null http://127.0.0.1:80/'
        --health-interval 5s --health-timeout 3s --health-start-period 60s --health-retries 3)
fi
if [[ "$COMMAND" == run ]]; then
    printf '正在前台启动游戏容器：%s，按 Ctrl+C 停止。\n' "$NAME"
    ai_hint
    exec docker run "${OPTIONS[@]}" "$IMAGE" /opt/mud/docker.config.cfg
fi
# 就绪后才启用自动重启，避免启动失败的驱动反复崩溃。
CONTAINER_ID="$(docker run --detach "${OPTIONS[@]}" "$IMAGE" /opt/mud/docker.config.cfg)"
DEADLINE=$((SECONDS + START_TIMEOUT))
READY=false
while (( SECONDS < DEADLINE )); do
    sleep 1
    DETAILS="$(docker container inspect --format '{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CONTAINER_ID")"
    IFS='|' read -r STATE HEALTH <<< "$DETAILS"
    [[ "$STATE" == running ]] || break
    if [[ "$HEALTH" == healthy || "$HEALTH" == none ]]; then
        READY=true
        break
    fi
done
if ! $READY; then
    docker container logs --tail 40 "$CONTAINER_ID" >&2
    fail "游戏未在 $START_TIMEOUT 秒内就绪（$STATE），未启用自动重启；请执行 logs 查看日志。"
fi
docker container update --restart unless-stopped "$CONTAINER_ID" >/dev/null
printf '游戏容器已启动：%s\n端口：GBK %s，UTF-8 %s，网页 %s\n' "$NAME" "$TELNET_PORT" "$UTF8_PORT" "$WEB_PORT"
printf '查看日志：bash docker.run.sh logs\n'
ai_hint
