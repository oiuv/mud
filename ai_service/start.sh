#!/usr/bin/env bash
# Linux server launcher. Use: bash ai_service/start.sh help
set -euo pipefail
umask 077

SERVICE_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
VENV_PYTHON="$SERVICE_DIR/.venv/bin/python"
RUN_DIR="$SERVICE_DIR/.run"
PID_FILE="$RUN_DIR/ai_service.pid"
LOG_FILE="$SERVICE_DIR/logs/ai_service.log"
STOP_TIMEOUT="${AI_STOP_TIMEOUT:-90}"

usage() {
    cat <<'HELP'
用法: bash ai_service/start.sh [命令] [-d]

  setup      创建 .venv、安装依赖，复制缺失的配置模板（首次部署/更新依赖）
  start      后台启动（默认），日志追加到 logs/ai_service.log
  stop       等待正在处理的请求结束后停止，最多等待 90 秒
  restart    停止后重新后台启动
  status     查看运行状态；未运行时退出码为 3
  logs       持续查看最近 100 行日志，Ctrl+C 退出
  run        前台运行，适合调试或由 systemd 等进程管理器托管
  help       显示帮助

start / restart / run 可以附加 -d 或 --debug。
setup 可通过 AI_PYTHON=/path/to/python3 指定 Python 3.10+。
stop / restart 可通过 AI_STOP_TIMEOUT=120 调整等待秒数。
配置读取 ai_service/.env；setup 不覆盖已有文件。
每次 start / restart / run 启动前自动同步知识库；配置密钥后会补齐缺失向量。
HELP
}

fail() {
    printf '错误：%s\n' "$*" >&2
    exit 1
}

ACTION="${1:-start}"
if (( $# > 0 )); then
    shift
fi
case "$ACTION" in
    help|-h|--help) usage; exit 0 ;;
    setup|start|stop|restart|status|logs|run) ;;
    *) usage >&2; exit 2 ;;
esac
case "$ACTION" in
    start|restart|run)
        if (( $# > 1 )) || { (( $# == 1 )) && [[ "$1" != "-d" && "$1" != "--debug" ]]; }; then
            usage >&2
            exit 2
        fi
        ;;
    *)
        if (( $# > 0 )); then
            usage >&2
            exit 2
        fi
        ;;
esac
[[ "$STOP_TIMEOUT" =~ ^[1-9][0-9]{0,5}$ ]] || fail "AI_STOP_TIMEOUT 必须是 1 到 999999 的整数。"
[[ -r /proc/sys/kernel/random/boot_id ]] || fail "该脚本需要 Linux；其他平台请直接运行 main.py。"
read -r BOOT_ID < /proc/sys/kernel/random/boot_id
cd -- "$SERVICE_DIR"

# Include the boot ID and kernel start time, so an old PID file cannot match a reused PID.
process_token() {
    local stat rest
    local -a fields
    [[ "$1" =~ ^[1-9][0-9]*$ && -r "/proc/$1/stat" ]] || return 1
    stat="$(cat "/proc/$1/stat" 2>/dev/null)" || return 1
    rest="${stat##*) }"
    read -r -a fields <<< "$rest"
    (( ${#fields[@]} >= 20 )) || return 1
    [[ "${fields[0]}" != Z && "${fields[0]}" != X ]] || return 1
    printf '%s:%s\n' "$BOOT_ID" "${fields[19]}"
}

is_running() {
    local current extra
    [[ -f "$PID_FILE" ]] || return 1
    read -r SERVICE_PID SERVICE_TOKEN extra < "$PID_FILE" || return 1
    [[ -z "$extra" ]] || return 1
    current="$(process_token "$SERVICE_PID")" || return 1
    [[ "$current" == "$SERVICE_TOKEN" ]]
}

write_pid() {
    # Atomic replacement lets status safely read while another command starts the service.
    printf '%s %s\n' "$1" "$2" > "$PID_FILE.tmp"
    mv -f -- "$PID_FILE.tmp" "$PID_FILE"
}

check_environment() {
    [[ -x "$VENV_PYTHON" ]] || fail "未找到 .venv，请先执行 bash \"$SERVICE_DIR/start.sh\" setup。"
    [[ -f "$SERVICE_DIR/.env" ]] || fail "未找到 .env，请先执行 setup 并填写模型密钥。"
    "$VENV_PYTHON" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else "需要 Python 3.10+")'
}

setup_environment() {
    local python="${AI_PYTHON:-python3}"
    if is_running; then
        fail "服务正在运行（PID $SERVICE_PID），请先停止再更新依赖。"
    fi
    command -v "$python" >/dev/null 2>&1 || fail "找不到 $python，请安装 Python 3.10+ 和 venv。"
    "$python" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else "需要 Python 3.10+")'
    if [[ ! -x "$VENV_PYTHON" ]]; then
        "$python" -m venv "$SERVICE_DIR/.venv" || fail "创建虚拟环境失败；Debian/Ubuntu 请安装 python3-venv。"
    fi
    "$VENV_PYTHON" -m pip install -r "$SERVICE_DIR/requirements.txt"
    if [[ ! -e "$SERVICE_DIR/.env" ]]; then
        cp -- "$SERVICE_DIR/.env.example" "$SERVICE_DIR/.env"
        chmod 600 "$SERVICE_DIR/.env"
    fi
    if [[ ! -e "$SERVICE_DIR/config/npc_roles.json" ]]; then
        cp -- "$SERVICE_DIR/config/npc_roles.example.json" "$SERVICE_DIR/config/npc_roles.json"
    fi
    printf '环境已准备好。请编辑 %s/.env，再执行 start。\n' "$SERVICE_DIR"
    printf '启动时会自动检查知识库，并按配置补齐缺失向量。\n'
}

update_knowledge() {
    printf "正在检查并更新知识库…\n"
    "$VENV_PYTHON" -u "$SERVICE_DIR/scripts/update_knowledge.py"
}

start_service() {
    local pid token
    if is_running; then
        printf 'AI 服务已在运行（PID %s）。\n' "$SERVICE_PID"
        return 0
    fi
    check_environment
    update_knowledge
    mkdir -p -- "$SERVICE_DIR/logs"
    # Do not let the background process retain the command lock.
    nohup "$VENV_PYTHON" -u "$SERVICE_DIR/main.py" "$@" </dev/null >>"$LOG_FILE" 2>&1 9>&- &
    pid=$!
    if ! token="$(process_token "$pid")"; then
        wait "$pid" || true
        tail -n 30 -- "$LOG_FILE" >&2
        fail "启动失败，请检查日志：$LOG_FILE"
    fi
    write_pid "$pid" "$token"
    sleep 2
    if ! is_running; then
        wait "$pid" || true
        rm -f -- "$PID_FILE"
        tail -n 30 -- "$LOG_FILE" >&2
        fail "启动失败，请检查日志：$LOG_FILE"
    fi
    printf 'AI 服务进程已启动（PID %s）。\n日志：%s\n' "$pid" "$LOG_FILE"
}

stop_service() {
    local pid token current deadline
    if ! is_running; then
        rm -f -- "$PID_FILE"
        printf 'AI 服务未运行。\n'
        return 0
    fi
    pid="$SERVICE_PID"
    token="$SERVICE_TOKEN"
    printf '正在停止 AI 服务（PID %s），等待当前请求结束…\n' "$pid"
    if ! kill -TERM "$pid" 2>/dev/null; then
        # A process exiting between the status check and kill is already stopped.
        if is_running; then
            fail "无法向 PID $pid 发送停止信号，请使用启动服务的用户执行。"
        fi
    fi
    deadline=$((SECONDS + STOP_TIMEOUT))
    while current="$(process_token "$pid")" && [[ "$current" == "$token" ]]; do
        if (( SECONDS >= deadline )); then
            fail "等待超时，保留进程和 PID 文件。请查看日志或增大 AI_STOP_TIMEOUT 后重试。"
        fi
        sleep 1
    done
    rm -f -- "$PID_FILE"
    printf 'AI 服务已停止。\n'
}

case "$ACTION" in
    status)
        if is_running; then
            printf 'AI 服务正在运行（PID %s）。\n日志：%s\n' "$SERVICE_PID" "$LOG_FILE"
        else
            printf 'AI 服务未运行。\n'
            exit 3
        fi
        exit 0
        ;;
    logs)
        [[ -f "$LOG_FILE" ]] || fail "尚无日志，请先启动服务。"
        exec tail -n 100 -F -- "$LOG_FILE"
        ;;
esac

command -v flock >/dev/null 2>&1 || fail "缺少 flock，请安装 util-linux。"
mkdir -p -- "$RUN_DIR"
exec 9>"$RUN_DIR/control.lock"
flock -n 9 || fail "另一个管理命令正在执行，请稍后重试。"

case "$ACTION" in
    setup) setup_environment ;;
    start) start_service "$@" ;;
    stop) stop_service ;;
    restart) stop_service; start_service "$@" ;;
    run)
        if is_running; then
            fail "服务已在运行（PID $SERVICE_PID），请先停止。"
        fi
        check_environment
        update_knowledge
        write_pid "$$" "$(process_token "$$")"
        flock -u 9
        exec 9>&-
        exec "$VENV_PYTHON" -u "$SERVICE_DIR/main.py" "$@"
        ;;
esac
