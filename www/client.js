"use strict";

const TELNET = Object.freeze({
    IAC: 255, DONT: 254, DO: 253, WONT: 252, WILL: 251, SB: 250, SE: 240,
    ECHO: 1, SGA: 3, TTYPE: 24, NAWS: 31, CHARSET: 42, MSP: 90, GMCP: 201
});

// WebSocket 消息边界不是 Telnet 指令或 UTF-8 字符边界。
class TelnetStream {
    constructor(onCommand, onSubnegotiation) {
        this.onCommand = onCommand;
        this.onSubnegotiation = onSubnegotiation;
        this.state = "data";
        this.subData = [];
        this.overflow = false;
    }

    feed(bytes) {
        const text = [];
        for (const byte of bytes) {
            switch (this.state) {
                case "data":
                    if (byte === TELNET.IAC) this.state = "iac";
                    else text.push(byte);
                    break;
                case "iac":
                    if (byte === TELNET.IAC) {
                        text.push(byte);
                        this.state = "data";
                    } else if ([TELNET.DO, TELNET.DONT, TELNET.WILL, TELNET.WONT].includes(byte)) {
                        this.command = byte;
                        this.state = "option";
                    } else if (byte === TELNET.SB) {
                        this.state = "subType";
                        this.subData = [];
                        this.overflow = false;
                    } else {
                        // GA、NOP 等只有两个字节，没有 option 字节。
                        this.state = "data";
                    }
                    break;
                case "option":
                    this.onCommand(this.command, byte);
                    this.state = "data";
                    break;
                case "subType":
                    this.subType = byte;
                    this.state = "subData";
                    break;
                case "subData":
                    if (byte === TELNET.IAC) this.state = "subIac";
                    else this.appendSubByte(byte);
                    break;
                case "subIac":
                    if (byte === TELNET.SE) {
                        if (!this.overflow) this.onSubnegotiation(this.subType, this.subData);
                        this.subData = [];
                        this.state = "data";
                    } else {
                        if (byte === TELNET.IAC) this.appendSubByte(byte);
                        this.state = "subData";
                    }
                    break;
            }
        }
        return Uint8Array.from(text);
    }

    appendSubByte(byte) {
        if (this.subData.length < 65536) this.subData.push(byte);
        else this.overflow = true;
    }
}

// 使用 FluffOS 同款终端组件处理字符宽度、ANSI 和键盘编码；游戏输出不作为 HTML。
class GameTerminal {
    constructor(element, handlers) {
        this.element = element;
        this.term = new Terminal({
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            fontSize: 14, lineHeight: 1.3, scrollback: 2000, convertEol: true,
            disableStdin: true, cursorInactiveStyle: "none",
            theme: {
                background: "#000000", foreground: "#e0e0e0", cursor: "#00ff00",
                scrollbarSliderBackground: "#008000",
                scrollbarSliderHoverBackground: "#00a000",
                scrollbarSliderActiveBackground: "#00c000"
            }
        });
        this.fitAddon = new FitAddon.FitAddon();
        this.term.loadAddon(this.fitAddon);
        this.term.open(element);
        this.term.onData(handlers.onData);
        this.term.onBinary(handlers.onBinary);
        this.term.onResize(handlers.onResize);
        if (typeof ResizeObserver !== "undefined") {
            this.observer = new ResizeObserver(() => this.fit());
            this.observer.observe(element);
        }
    }

    fit() {
        if (!this.element.clientWidth || !this.element.clientHeight) return;
        this.term.options.fontSize = window.innerWidth <= 768 ? 12 : 14;
        this.fitAddon.fit();
    }

    get size() { return { width: this.term.cols, height: this.term.rows }; }

    setInteractive(enabled) {
        this.term.options.disableStdin = !enabled;
        if (enabled) this.term.focus();
    }

    reset() {
        // 取消未结束的控制序列并退出备用屏幕，保留正常屏幕中的聊天记录。
        this.term.write("\x18\x1b7\x1b[?1049l\x1b[!p\x1b[0m\x1b[?1l\x1b[?1000l\x1b[?1002l\x1b[?1003l\x1b[?1006l\x1b[?2004l");
    }

    write(text) { this.term.write(text); }

    notice(text, className = "system") {
        const color = className === "error" ? 91 : 93;
        this.term.write(`\r\n\x1b[${color}m${text}\x1b[0m\r\n`);
    }
}

class MudClient {
    constructor() {
        for (const id of ["terminal", "commandInput", "sendBtn", "status", "statusText", "connectionPanel",
            "protocolSelect", "addressInput", "portInput", "subprotocolSelect", "connectBtn", "defaultBtn",
            "disconnectBtn", "historyHint", "inputArea"]) {
            this[id] = document.getElementById(id);
        }
        this.output = new GameTerminal(this.terminal, {
            onData: text => this.handleTerminalInput(new TextEncoder().encode(text)),
            onBinary: text => this.handleTerminalInput(Uint8Array.from(text, char => char.charCodeAt(0))),
            onResize: () => this.reportWindowSize()
        });
        this.session = null;
        this.retryTimer = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.history = [];
        this.historyIndex = -1;
        this.currentInput = "";
        this.serverNoEcho = false;
        this.charMode = false;
        this.composing = false;
        this.gmcp = new Map();
        this.setDefaultConfig();
        this.setupEvents();
    }

    setDefaultConfig() {
        this.protocolSelect.value = "wss://";
        this.addressInput.value = "mud.ren";
        this.portInput.value = "8888";
        this.subprotocolSelect.value = "telnet";
    }

    setupEvents() {
        this.connectBtn.addEventListener("click", () => this.handleConnect());
        this.defaultBtn.addEventListener("click", () => this.setDefaultConfig());
        this.disconnectBtn.addEventListener("click", () => this.disconnect());
        for (const input of [this.addressInput, this.portInput]) {
            input.addEventListener("keydown", event => {
                if (event.key === "Enter" && !event.isComposing && event.keyCode !== 229) this.handleConnect();
            });
        }
        this.commandInput.addEventListener("compositionstart", () => { this.composing = true; });
        this.commandInput.addEventListener("compositionend", () => { this.composing = false; });
        this.commandInput.addEventListener("input", () => { this.historyIndex = -1; });
        this.commandInput.addEventListener("keydown", event => {
            if (event.isComposing || this.composing || event.keyCode === 229) return;
            if (event.key === "Enter") {
                event.preventDefault();
                this.handleSendCommand();
            } else if (this.canRecordHistory() && ["ArrowUp", "ArrowDown"].includes(event.key)) {
                event.preventDefault();
                this.navigateHistory(event.key === "ArrowUp" ? -1 : 1);
            }
        });
        this.sendBtn.addEventListener("click", () => { if (!this.composing) this.handleSendCommand(); });
        window.addEventListener("resize", () => this.output.fit());
        window.addEventListener("pagehide", () => this.disconnect(false));
    }

    updateStatus(text, state) {
        this.statusText.textContent = text;
        this.status.className = "status " + state;
    }

    setInputEnabled(enabled) {
        this.commandInput.disabled = !enabled || this.charMode;
        this.sendBtn.disabled = !enabled || this.charMode;
        this.output.setInteractive(enabled && this.charMode);
    }

    updateInputMode() {
        this.inputArea.style.display = this.charMode ? "none" : "";
        const secret = this.serverNoEcho;
        this.commandInput.type = secret ? "password" : "text";
        this.commandInput.placeholder = secret ? "请输入密码..." : "输入命令...";
        this.historyHint.style.display = this.canRecordHistory() ? "block" : "none";
        this.historyIndex = -1;
        this.currentInput = "";
        this.setInputEnabled(this.session?.ws.readyState === WebSocket.OPEN);
        this.output.fit();
    }

    setCharMode(enabled) {
        if (this.charMode === enabled) return;
        this.charMode = enabled;
        this.updateInputMode();
        if (!enabled && !this.commandInput.disabled) this.commandInput.focus();
    }

    handleTerminalInput(bytes) {
        if (!this.charMode || !this.session?.telnet) return;
        this.sendTelnetData(this.session, bytes);
    }

    reportWindowSize() {
        if (!this.session) return;
        if (this.session.localOptions.get(TELNET.NAWS)) this.sendWindowSize(this.session);
        this.sendGMCPWindow(this.session);
    }

    canRecordHistory() {
        return Boolean(this.session) && !this.serverNoEcho && !this.charMode;
    }

    handleConnect() {
        const protocol = this.protocolSelect.value;
        let host = this.addressInput.value.trim();
        const port = this.portInput.value;
        const subprotocol = this.subprotocolSelect.value;
        if (!host || /[\s/?#@]/.test(host) || !["ws://", "wss://"].includes(protocol)) {
            alert("请输入有效的服务器域名或 IP 地址，不包含路径。");
            return;
        }
        if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
            alert("请输入 1–65535 之间的整数端口号。");
            return;
        }
        if (!["ascii", "telnet", "binary", "http", ""].includes(subprotocol)) return;
        if (host.includes(":") && !host.startsWith("[")) host = `[${host}]`;
        let url;
        try { url = new URL(`${protocol}${host}:${port}/`).href; }
        catch { alert("服务器地址格式不正确。"); return; }
        if (subprotocol === "http") {
            // FluffOS 的 HTTP 入口提供静态文件，不建立游戏 WebSocket 会话。
            window.open(url.replace(/^ws/, "http"), "_blank", "noopener,noreferrer");
            return;
        }
        this.cancelRetry();
        this.retryCount = 0;
        this.connect({ url, subprotocol });
    }

    cancelRetry() {
        if (this.retryTimer !== null) clearTimeout(this.retryTimer);
        this.retryTimer = null;
    }

    disposeSession() {
        const session = this.session;
        this.session = null;
        if (!session) return;
        clearTimeout(session.connectTimer);
        clearTimeout(session.stableTimer);
        clearTimeout(session.keepAliveTimer);
        const ws = session.ws;
        ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
        if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) ws.close(1000);
    }

    disconnect(showNotice = true) {
        this.cancelRetry();
        this.disposeSession();
        this.serverNoEcho = false;
        this.charMode = false;
        this.commandInput.value = "";
        this.setInputEnabled(false);
        this.updateInputMode();
        this.connectionPanel.style.display = "block";
        this.disconnectBtn.disabled = true;
        this.updateStatus("已断开", "disconnected");
        if (showNotice) this.output.notice("已断开连接，自动重连已取消。");
    }

    connect(config) {
        this.cancelRetry();
        this.disposeSession();
        this.setInputEnabled(false);
        this.commandInput.value = "";
        this.historyIndex = -1;
        this.currentInput = "";
        this.serverNoEcho = false;
        this.charMode = false;
        this.gmcp.clear();
        this.output.reset();
        this.updateStatus("正在连接...", "connecting");
        this.disconnectBtn.disabled = false;
        this.terminal.style.display = "block";
        this.output.fit();
        let ws;
        try { ws = new WebSocket(config.url, config.subprotocol ? [config.subprotocol] : []); }
        catch {
            this.updateStatus("连接失败", "disconnected");
            this.disconnectBtn.disabled = true;
            this.connectionPanel.style.display = "block";
            this.updateInputMode();
            this.output.notice("无法创建连接，请检查地址、协议和浏览器的安全连接限制。", "error");
            return;
        }
        ws.binaryType = "arraybuffer";
        const session = { ws, config, telnet: ["telnet", "binary"].includes(config.subprotocol), decoder: new TextDecoder("utf-8"), queue: Promise.resolve(),
            remoteOptions: new Map(), localOptions: new Map() };
        session.parser = new TelnetStream(
            (command, option) => this.negotiate(session, command, option),
            (type, bytes) => this.handleSubnegotiation(session, type, bytes)
        );
        this.session = session;
        this.updateInputMode();
        session.connectTimer = setTimeout(() => {
            if (this.session === session) this.finishSession(session, true, "连接超时。");
        }, 15000);
        ws.onopen = () => {
            if (this.session !== session) return;
            clearTimeout(session.connectTimer);
            session.telnet = ["telnet", "binary"].includes(ws.protocol || config.subprotocol);
            this.updateStatus("已连接", "connected");
            this.setInputEnabled(true);
            this.connectionPanel.style.display = "none";
            this.output.fit();
            this.output.notice("已连接到 MUD 服务器。");
            this.commandInput.focus();
            this.scheduleKeepAlive(session);
            // 短暂接通不能无限重置重试次数。
            session.stableTimer = setTimeout(() => {
                if (this.session === session) this.retryCount = 0;
            }, 30000);
        };
        ws.onmessage = event => {
            session.queue = session.queue.then(async () => {
                if (this.session !== session) return;
                let data = event.data;
                if (data instanceof Blob) data = await data.arrayBuffer();
                if (this.session !== session) return;
                if (typeof data === "string") data = new TextEncoder().encode(data);
                else data = new Uint8Array(data);
                if (session.telnet) data = session.parser.feed(data);
                if (this.session !== session) return;
                this.output.write(session.decoder.decode(data, { stream: true }));
            }).catch(() => {
                if (this.session === session) this.finishSession(session, false, "收到无法处理的数据，连接已关闭。");
            });
        };
        ws.onclose = event => {
            clearTimeout(session.connectTimer);
            clearTimeout(session.stableTimer);
            clearTimeout(session.keepAliveTimer);
            if (this.session === session) this.setInputEnabled(false);
            // 先处理已经到达的消息，包括异步 Blob，再显示断开提示。
            session.queue = session.queue.then(() => {
                if (this.session !== session) return;
                this.output.write(session.decoder.decode());
                this.finishSession(session, ![1000, 1008].includes(event.code), "连接已断开。");
            });
        };
        ws.onerror = () => {
            if (this.session === session) this.updateStatus("连接异常", "disconnected");
        };
    }

    scheduleKeepAlive(session) {
        // 保留原客户端的空帧保活，不向游戏提交命令，也不将其当作 ping/pong 检测。
        session.keepAliveTimer = setTimeout(() => {
            if (this.sendData(session, "")) this.scheduleKeepAlive(session);
        }, 30000);
    }

    finishSession(session, retry, message) {
        if (this.session !== session) return;
        const config = session.config;
        this.disposeSession();
        this.setInputEnabled(false);
        this.serverNoEcho = false;
        this.charMode = false;
        this.commandInput.value = "";
        this.updateInputMode();
        this.connectionPanel.style.display = "block";
        this.updateStatus("已断开", "disconnected");
        this.output.notice(message, "error");
        if (retry && this.retryCount < this.maxRetries) {
            const attempt = ++this.retryCount;
            this.updateStatus(`等待重连（${attempt}/${this.maxRetries}）`, "connecting");
            this.retryTimer = setTimeout(() => {
                this.retryTimer = null;
                this.connect(config);
            }, 2000 * attempt);
        } else this.disconnectBtn.disabled = true;
    }

    sendBytes(session, bytes) {
        return this.sendData(session, Uint8Array.from(bytes));
    }

    sendData(session, data) {
        if (this.session !== session || session.ws.readyState !== WebSocket.OPEN) return false;
        try { session.ws.send(data); return true; }
        catch { this.finishSession(session, true, "发送失败，连接已断开。"); return false; }
    }

    sendTelnetData(session, data) {
        const bytes = [];
        for (const byte of data) {
            bytes.push(byte);
            if (byte === TELNET.IAC) bytes.push(byte);
        }
        return this.sendBytes(session, bytes);
    }

    sendNegotiation(session, command, option) {
        return this.sendBytes(session, [TELNET.IAC, command, option]);
    }

    sendSubnegotiation(session, type, data) {
        const bytes = [TELNET.IAC, TELNET.SB, type];
        for (const byte of data) {
            bytes.push(byte);
            if (byte === TELNET.IAC) bytes.push(byte);
        }
        bytes.push(TELNET.IAC, TELNET.SE);
        return this.sendBytes(session, bytes);
    }

    negotiate(session, command, option) {
        if (this.session !== session) return;
        if (command === TELNET.WILL || command === TELNET.WONT) {
            const enabled = command === TELNET.WILL &&
                [TELNET.ECHO, TELNET.SGA, TELNET.GMCP, TELNET.CHARSET, TELNET.MSP].includes(option);
            const previous = session.remoteOptions.get(option);
            if (enabled && previous !== true) this.sendNegotiation(session, TELNET.DO, option);
            else if (!enabled && (previous === true || (command === TELNET.WILL && previous === undefined))) {
                this.sendNegotiation(session, TELNET.DONT, option);
            }
            session.remoteOptions.set(option, enabled);
            if (option === TELNET.ECHO) {
                this.serverNoEcho = enabled;
                this.updateInputMode();
            }
            if (option === TELNET.SGA) this.setCharMode(enabled);
        } else {
            const enabled = command === TELNET.DO && [TELNET.TTYPE, TELNET.NAWS, TELNET.SGA, TELNET.GMCP].includes(option);
            const previous = session.localOptions.get(option);
            if (enabled && previous !== true) this.sendNegotiation(session, TELNET.WILL, option);
            else if (!enabled && (previous === true || (command === TELNET.DO && previous === undefined))) {
                this.sendNegotiation(session, TELNET.WONT, option);
            }
            session.localOptions.set(option, enabled);
            if (option === TELNET.NAWS && enabled && previous !== true) this.sendWindowSize(session);
        }
        if (option === TELNET.GMCP) this.initGMCP(session);
    }

    gmcpEnabled(session) {
        return session.remoteOptions.get(TELNET.GMCP) || session.localOptions.get(TELNET.GMCP);
    }

    initGMCP(session) {
        if (!this.gmcpEnabled(session)) {
            session.gmcpStarted = false;
            return;
        }
        if (session.gmcpStarted) return;
        session.gmcpStarted = true;
        this.sendGMCP(session, "Core.Hello", { client: "FluffOS-WebClient", version: "1.1" });
        this.sendGMCP(session, "Client.GUI", {
            version: "1.1", type: "websocket", client: "FluffOS-WebClient"
        });
        this.sendGMCPWindow(session);
    }

    sendGMCPWindow(session) {
        this.sendGMCP(session, "Client.Window", this.output.size);
    }

    sendWindowSize(session) {
        const { width, height } = this.output.size;
        this.sendSubnegotiation(session, TELNET.NAWS, [width >> 8, width & 255, height >> 8, height & 255]);
    }

    sendGMCP(session, module, data) {
        if (!this.gmcpEnabled(session)) return;
        const text = module + (data === undefined ? "" : " " + JSON.stringify(data));
        this.sendSubnegotiation(session, TELNET.GMCP, new TextEncoder().encode(text));
    }

    handleSubnegotiation(session, type, data) {
        if (type === TELNET.TTYPE && session.localOptions.get(type) && data[0] === 1) {
            this.sendSubnegotiation(session, type, [0, ...new TextEncoder().encode("xterm-256color")]);
        } else if (type === TELNET.CHARSET && session.remoteOptions.get(type) && data[0] === 1) {
            const names = new TextDecoder().decode(Uint8Array.from(data.slice(2))).split(String.fromCharCode(data[1]));
            if (names.some(name => name.toUpperCase() === "UTF-8")) {
                this.sendSubnegotiation(session, type, [2, ...new TextEncoder().encode("UTF-8")]);
            } else this.sendSubnegotiation(session, type, [3]);
        } else if (type === TELNET.GMCP && this.gmcpEnabled(session)) {
            const text = new TextDecoder().decode(Uint8Array.from(data));
            const space = text.indexOf(" ");
            const module = space < 0 ? text : text.slice(0, space);
            if (!module) return;
            try {
                const data = space < 0 || !text.slice(space + 1).trim() ? {} : JSON.parse(text.slice(space + 1));
                this.gmcp.delete(module);
                this.gmcp.set(module, data);
                if (this.gmcp.size > 100) this.gmcp.delete(this.gmcp.keys().next().value);
                console.debug("GMCP:", module, data);
            } catch { /* 单条无效 GMCP 不影响终端正文。 */ }
        } else if (type === TELNET.MSP && session.remoteOptions.get(type)) {
            // 原客户端提供 MSP 协商和消息记录，未包含音频播放实现。
            console.debug("MSP:", new TextDecoder().decode(Uint8Array.from(data)));
        }
    }

    handleSendCommand() {
        const session = this.session;
        if (!session || session.ws.readyState !== WebSocket.OPEN || this.charMode) return;
        const command = this.commandInput.value;
        const record = this.canRecordHistory();
        // ws_ascii_callback 拒绝二进制输入帧；Telnet 数据需要 IAC 转义。
        const sent = session.telnet
            ? this.sendTelnetData(session, new TextEncoder().encode(command + "\r\n"))
            : this.sendData(session, command + "\n");
        if (!sent) return;
        if (record && command.trim() && command !== this.history[this.history.length - 1]) {
            this.history.push(command);
            if (this.history.length > 100) this.history.shift();
        }
        this.commandInput.value = "";
        this.historyIndex = -1;
        this.currentInput = "";
        this.commandInput.focus();
    }

    navigateHistory(direction) {
        if (!this.canRecordHistory() || !this.history.length) return;
        if (this.historyIndex === -1) {
            if (direction > 0) return;
            this.currentInput = this.commandInput.value;
            this.historyIndex = this.history.length;
        }
        const next = this.historyIndex + direction;
        if (next >= this.history.length) {
            this.historyIndex = -1;
            this.commandInput.value = this.currentInput;
        } else {
            this.historyIndex = Math.max(0, next);
            this.commandInput.value = this.history[this.historyIndex];
        }
    }
}

const client = new MudClient();
