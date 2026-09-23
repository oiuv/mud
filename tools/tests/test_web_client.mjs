import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../../www/client.js', import.meta.url), 'utf8');

class TextNode {
    constructor(data) { this.data = data; }
    appendData(data) { this.data += data; }
    get textContent() { return this.data; }
}
class Element {
    constructor(tag = 'div') {
        this.tagName = tag.toUpperCase();
        this.childNodes = [];
        this.style = {};
        this.listeners = {};
        this.value = '';
        this.checked = false;
        this.disabled = true;
        this.type = 'text';
        this.scrollTop = 0;
        this.scrollHeight = 0;
        this.clientHeight = 528;
        this.clientWidth = 640;
    }
    get children() { return this.childNodes.filter(n => n instanceof Element); }
    get firstChild() { return this.childNodes[0] || null; }
    get textContent() { return this.childNodes.map(n => n.textContent).join(''); }
    set textContent(value) { this.childNodes = [new TextNode(value)]; }
    set innerHTML(_) { throw new Error('HTML rendering must not be used'); }
    appendChild(node) { this.childNodes.push(node); return node; }
    removeChild(node) { this.childNodes.splice(this.childNodes.indexOf(node), 1); }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    focus() {}
    trigger(name, data = {}) { this.listeners[name]?.({ preventDefault() {}, ...data }); }
}
// 协议单测使用终端边界替身；实际 xterm 渲染与键盘另由浏览器回归验证。
class TerminalStub {
    constructor(options) { this.options = options; this.cols = 80; this.rows = 24; }
    open(element) { this.element = element; }
    loadAddon(addon) { addon.term = this; }
    onData(fn) { this.dataHandler = fn; }
    onBinary(fn) { this.binaryHandler = fn; }
    onResize(fn) { this.resizeHandler = fn; }
    focus() {}
    write(text) { this.element.textContent += text; }
    resize(cols, rows) {
        if (this.cols === cols && this.rows === rows) return;
        this.cols = cols; this.rows = rows; this.resizeHandler?.({ cols, rows });
    }
}
class FitStub {
    fit() { this.term.resize(Math.floor(this.term.element.clientWidth / 8), Math.floor(this.term.element.clientHeight / 22)); }
}
function setup() {
    const elements = new Map(), sockets = [], timers = new Map(), windowEvents = {}, openedPages = [], debugMessages = [];
    let nextTimer = 0;
    class Socket {
        static CONNECTING = 0;
        static OPEN = 1;
        constructor(url, protocols) {
            this.url = url; this.protocols = protocols; this.protocol = protocols[0] || ''; this.readyState = 0; this.sent = []; this.closes = 0;
            sockets.push(this);
        }
        open() { this.readyState = 1; this.onopen?.(); }
        send(bytes) { assert.equal(this.readyState, 1); this.sent.push(typeof bytes === 'string' ? bytes : Array.from(bytes)); }
        close() { this.closes++; this.readyState = 3; }
        receive(data) { this.onmessage?.({ data }); }
        end(code = 1006) { this.readyState = 3; this.onclose?.({ code }); }
    }
    const context = vm.createContext({
        TextDecoder, TextEncoder, Uint8Array, ArrayBuffer, Blob, URL, Terminal: TerminalStub, FitAddon: { FitAddon: FitStub }, console: { ...console, debug: (...args) => debugMessages.push(args) }, WebSocket: Socket,
        document: {
            getElementById(id) { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); },
            createElement(tag) { return new Element(tag); }, createTextNode(data) { return new TextNode(data); }
        },
        window: { addEventListener(name, fn) { windowEvents[name] = fn; },
            open(...args) { openedPages.push(args); } },
        setTimeout(fn, ms) { const id = ++nextTimer; timers.set(id, { fn, ms }); return id; },
        clearTimeout(id) { timers.delete(id); }, alert() {}
    });
    vm.runInContext(source + '\nglobalThis.api = { client, TelnetStream, GameTerminal, TELNET };', context);
    const { client: c, ...api } = context.api;
    const fixture = { c, ...api, sockets, timers, windowEvents, openedPages, debugMessages,
        open(protocol = 'telnet') { c.subprotocolSelect.value = protocol; c.handleConnect(); sockets.at(-1).open(); return sockets.at(-1); },
        async receive(data) { const session = c.session; session.ws.receive(data); await session.queue; },
        runTimer(id) { const timer = timers.get(id); timers.delete(id); timer.fn(); }
    };
    return fixture;
}
const bytes = values => Uint8Array.from(values).buffer;
const packet = text => new TextEncoder().encode(text).buffer;
const plain = value => JSON.parse(JSON.stringify(value));

// 分片、协商和 UTF-8 均使用实际客户端类，不另写一份解析器作为测试对象。
test('Telnet parser preserves bytes at every possible split', () => {
    const { TelnetStream } = setup();
    const input = [65,255,249,66,255,251,201,255,250,201,88,255,255,89,255,240,67,255,255];
    for (let split = 0; split <= input.length; split++) {
        const commands = [], sub = [];
        const parser = new TelnetStream((...v) => commands.push(v), (...v) => sub.push(v));
        const result = [...parser.feed(input.slice(0, split)), ...parser.feed(input.slice(split))];
        assert.deepEqual(result, [65,66,67,255]);
        assert.deepEqual(plain(commands), [[251,201]]);
        assert.deepEqual(plain(sub), [[201,[88,255,89]]]);
    }
});
test('UTF-8 decoding and ANSI bytes survive WebSocket message boundaries', async () => {
    const f = setup(); f.open();
    await f.receive(bytes([27,91,48,59]));
    await f.receive(bytes([51,50,109,0xe4]));
    await f.receive(bytes([0xb8]));
    await f.receive(bytes([0xad,27]));
    await f.receive(packet('[0m文'));
    assert.ok(f.c.terminal.textContent.endsWith('\x1b[0;32m中\x1b[0m文'));
});
test('WILL ECHO masks passwords and excludes them from history', async () => {
    const f = setup(); const ws = f.open();
    await f.receive(bytes([255,251,1]));
    assert.equal(f.c.commandInput.type, 'password');
    f.c.commandInput.value = 'fake-test-password'; f.c.handleSendCommand();
    assert.equal(f.c.history.length, 0);
    assert.equal(new TextDecoder().decode(Uint8Array.from(ws.sent.at(-1))), 'fake-test-password\r\n');
    await f.receive(bytes([255,252,1]));
    assert.equal(f.c.commandInput.type, 'text');
    f.c.commandInput.value = 'look'; f.c.handleSendCommand();
    assert.deepEqual(plain(f.c.history), ['look']);
    await f.receive(bytes([255,251,1]));
    f.c.commandInput.value = 'second-secret'; f.c.handleSendCommand();
    assert.deepEqual(plain(f.c.history), ['look']);
});
test('legacy Binary also switches password mode automatically', async () => {
    const f = setup(); f.open('binary');
    await f.receive(bytes([255,251,1]));
    assert.equal(f.c.commandInput.type, 'password');
    f.c.commandInput.value = 'fake-secret'; f.c.handleSendCommand();
    assert.equal(f.c.history.length, 0);
    await f.receive(bytes([255,252,1]));
    assert.equal(f.c.commandInput.type, 'text');
});
test('GMCP, terminal type, charset and NAWS negotiate without duplicate acknowledgements', async () => {
    const f = setup(); const ws = f.open();
    f.c.output.term.resize(255, 24);
    await f.receive(bytes([255,251,201,255,253,24,255,253,31,255,251,42]));
    assert.ok(ws.sent.some(v => JSON.stringify(v) === '[255,253,201]'));
    assert.ok(ws.sent.some(v => JSON.stringify(v).includes('31,0,255,255,')));
    const count = ws.sent.length;
    await f.receive(bytes([255,251,201,255,253,31]));
    assert.equal(ws.sent.length, count);
    const gmcp = new TextEncoder().encode('Room.Info {"name":"客栈"}');
    await f.receive(bytes([255,250,201, ...gmcp.slice(0,15)]));
    await f.receive(bytes([...gmcp.slice(15),255,240]));
    assert.equal(f.c.gmcp.get('Room.Info').name, '客栈');
    await f.receive(bytes([255,250,24,1,255,240]));
    assert.ok(new TextDecoder().decode(Uint8Array.from(ws.sent.at(-1))).includes('xterm-256color'));
    await f.receive(bytes([255,250,42,1,32,85,84,70,45,56,32,65,83,67,73,73,255,240]));
    assert.deepEqual(ws.sent.at(-1), [255,250,42,2,85,84,70,45,56,255,240]);
});
test('IME Enter and arrow keys are not intercepted while composing', () => {
    const f = setup(); const ws = f.open();
    f.c.commandInput.value = 'say 中文';
    f.c.commandInput.trigger('keydown', { key: 'Enter', isComposing: true });
    f.c.commandInput.trigger('keydown', { key: 'Enter', keyCode: 229 });
    f.c.commandInput.trigger('compositionstart');
    f.c.commandInput.trigger('keydown', { key: 'Enter' });
    assert.equal(ws.sent.length, 0);
    f.c.commandInput.trigger('compositionend');
    f.c.commandInput.trigger('keydown', { key: 'Enter' });
    assert.equal(ws.sent.length, 1);
});
test('history down restores draft and history up stops at oldest entry', () => {
    const f = setup(); f.open(); f.c.history = ['look', 'score']; f.c.commandInput.value = 'draft';
    f.c.navigateHistory(-1); f.c.navigateHistory(1);
    assert.equal(f.c.commandInput.value, 'draft');
    f.c.navigateHistory(-1); f.c.navigateHistory(-1); f.c.navigateHistory(-1);
    assert.equal(f.c.commandInput.value, 'look');
});
test('manual reconnect cancels pending retry and ignores late close callbacks', async () => {
    const f = setup(); const first = f.open(); const old = f.c.session;
    first.end(); await old.queue;
    const retry = f.c.retryTimer;
    assert.ok(f.timers.has(retry));
    const manual = f.open();
    assert.equal(f.timers.has(retry), false);
    assert.equal(manual.closes, 0);
    assert.equal(f.c.statusText.textContent, '已连接');
    f.c.finishSession(old, true, 'late callback');
    assert.equal(f.c.session.ws, manual);
});
test('normal close does not reconnect; abnormal short connections stop after three retries', async () => {
    const f = setup(); f.open();
    let session = f.c.session;
    session.ws.end(1000); await session.queue;
    assert.equal(f.c.retryTimer, null);
    f.open();
    for (let i = 0; i < 4; i++) {
        session = f.c.session;
        session.ws.end(1006); await session.queue;
        if (i < 3) { f.runTimer(f.c.retryTimer); f.c.session.ws.open(); }
    }
    assert.equal(f.c.retryTimer, null);
    assert.equal(f.c.disconnectBtn.disabled, true);
});
test('disconnect cancels timers, preserves output and clears sensitive input', () => {
    const f = setup(); f.open(); f.c.output.write('retain transcript'); f.c.commandInput.value = 'secret';
    f.c.disconnect();
    assert.equal(f.c.session, null);
    assert.equal(f.timers.size, 0);
    assert.ok(f.c.terminal.textContent.includes('retain transcript'));
    assert.equal(f.c.commandInput.value, '');
    assert.equal(f.c.sendBtn.disabled, true);
});
test('connection timeout releases socket and allows retry cancellation', () => {
    const f = setup(); f.c.handleConnect(); const ws = f.c.session.ws;
    f.runTimer(f.c.session.connectTimer);
    assert.equal(ws.closes, 1);
    assert.equal(f.c.session, null);
    assert.notEqual(f.c.retryTimer, null);
    f.c.disconnect(); assert.equal(f.timers.size, 0);
});
test('out-of-order Blob completion cannot reorder output or leak into a new session', async () => {
    let resolveBlob;
    class DeferredBlob extends Blob { arrayBuffer() { return new Promise(resolve => { resolveBlob = resolve; }); } }
    const f = setup(); const ws = f.open(); const old = f.c.session;
    ws.receive(new DeferredBlob()); ws.receive(packet('B')); await Promise.resolve();
    resolveBlob(packet('A')); await old.queue;
    assert.ok(f.c.terminal.textContent.endsWith('AB'));
    ws.receive(new DeferredBlob()); await Promise.resolve();
    f.open(); resolveBlob(packet('OLD-SESSION')); await old.queue;
    assert.equal(f.c.terminal.textContent.includes('OLD-SESSION'), false);
});
test('late close waits for received output before showing disconnect notice', async () => {
    const f = setup(); const ws = f.open(); const session = f.c.session;
    ws.receive(packet('last line\n')); ws.end(1000); await session.queue;
    assert.ok(f.c.terminal.textContent.indexOf('last line') < f.c.terminal.textContent.indexOf('连接已断开'));
});
test('invalid port is rejected and bracketed IPv6 URL remains valid', () => {
    const f = setup(); f.c.portInput.value = '1e3'; f.c.handleConnect();
    assert.equal(f.sockets.length, 0);
    f.c.portInput.value = '8888'; f.c.addressInput.value = '::1'; f.c.protocolSelect.value = 'ws://';
    f.c.handleConnect(); assert.equal(f.sockets[0].url, 'ws://[::1]:8888/');
});

test('page retains all original protocol choices and no manual password option', () => {
    const html = readFileSync(new URL('../../www/index.html', import.meta.url), 'utf8');
    const select = html.match(/<select id="subprotocolSelect">([\s\S]*?)<\/select>/)[1];
    assert.deepEqual([...select.matchAll(/value="([^"]*)"/g)].map(match => match[1]),
        ['ascii', 'telnet', 'binary', 'http', '']);
    assert.ok(select.includes('Telnet (推荐)'));
    assert.equal(html.includes('privateInput'), false);
});
test('ASCII sends text frames, preserves UTF-8 chunks and retains command history', async () => {
    const f = setup(); const ws = f.open('ascii');
    assert.deepEqual(plain(ws.protocols), ['ascii']);
    const encoded = new TextEncoder().encode('欢迎来到客栈\n');
    await f.receive(encoded.slice(0, 1).buffer);
    await f.receive(new Blob([encoded.slice(1)]));
    await f.receive('> ');
    assert.ok(f.c.terminal.textContent.endsWith('欢迎来到客栈\n> '));
    f.c.commandInput.value = 'say 你好'; f.c.handleSendCommand();
    assert.equal(ws.sent.at(-1), 'say 你好\n');
    assert.deepEqual(plain(f.c.history), ['say 你好']);
    f.c.commandInput.value = 'draft'; f.c.navigateHistory(-1); f.c.navigateHistory(1);
    assert.equal(f.c.commandInput.value, 'draft');
    // 原始文本中的 IAC 字节不能被解释为 Telnet 选项。
    await f.receive(bytes([255, 251, 1, 65]));
    assert.equal(f.c.commandInput.type, 'text');
    assert.equal(ws.sent.length, 1);
    assert.ok(f.c.terminal.textContent.endsWith('A'));
});
test('no subprotocol omits the offer and preserves text send and receive', async () => {
    const f = setup(); const ws = f.open('');
    assert.deepEqual(plain(ws.protocols), []);
    await f.receive('welcome');
    assert.ok(f.c.terminal.textContent.endsWith('welcome'));
    f.c.commandInput.value = 'look'; f.c.handleSendCommand();
    assert.equal(ws.sent.at(-1), 'look\n');
});
test('HTTP opens the static site without interrupting the game session', async () => {
    const f = setup(); const ws = f.open();
    const session = f.c.session;
    f.c.subprotocolSelect.value = 'http'; f.c.handleConnect();
    assert.deepEqual(f.openedPages[0], ['https://mud.ren:8888/', '_blank', 'noopener,noreferrer']);
    assert.equal(f.c.session, session);
    assert.equal(ws.closes, 0);
    assert.equal(f.sockets.length, 1);
    f.c.protocolSelect.value = 'ws://'; f.c.addressInput.value = '::1'; f.c.handleConnect();
    assert.equal(f.openedPages[1][0], 'http://[::1]:8888/');
});
test('ASCII and no-subprotocol reconnections retain the selected mode', async () => {
    for (const protocol of ['ascii', '']) {
        const f = setup(); const ws = f.open(protocol); const session = f.c.session;
        ws.end(1006); await session.queue;
        f.c.subprotocolSelect.value = 'telnet';
        f.runTimer(f.c.retryTimer);
        const retried = f.c.session.ws; retried.open();
        assert.deepEqual(plain(retried.protocols), protocol ? [protocol] : []);
        f.c.commandInput.value = 'look'; f.c.handleSendCommand();
        assert.equal(retried.sent.at(-1), 'look\n');
    }
});

test('keepalive retains empty frames and is cancelled on disconnect in all game modes', () => {
    for (const mode of ['ascii', 'telnet', 'binary', '']) {
        const f = setup(); const ws = f.open(mode); const session = f.c.session;
        f.runTimer(session.keepAliveTimer);
        assert.equal(ws.sent.at(-1), '');
        assert.equal(f.c.history.length, 0);
        assert.ok(f.timers.has(session.keepAliveTimer));
        const late = f.timers.get(session.keepAliveTimer).fn;
        f.c.disconnect();
        assert.equal(f.timers.size, 0);
        late();
        assert.equal(ws.sent.length, 1);
        assert.equal(f.timers.size, 0);
    }
});
test('reconnect preserves command history without automatically replaying commands', async () => {
    const f = setup(); const ws = f.open();
    f.c.commandInput.value = 'look'; f.c.handleSendCommand();
    const session = f.c.session; ws.end(1006); await session.queue;
    assert.equal(f.timers.has(session.keepAliveTimer), false);
    f.runTimer(f.c.retryTimer); const next = f.c.session.ws; next.open();
    assert.deepEqual(plain(f.c.history), ['look']);
    assert.equal(next.sent.length, 0);
    f.c.navigateHistory(-1); assert.equal(f.c.commandInput.value, 'look');
});
test('GMCP retains client GUI and window reporting, custom modules and legacy DO negotiation', async () => {
    for (const command of [251, 253]) {
        const f = setup(); const ws = f.open();
        await f.receive(bytes([255,command,201]));
        const messages = ws.sent.filter(v => Array.isArray(v) && v[1] === 250)
            .map(v => new TextDecoder().decode(Uint8Array.from(v.slice(3, -2))));
        for (const name of ['Core.Hello', 'Client.GUI', 'Client.Window']) {
            assert.ok(messages.some(text => text.startsWith(name + ' ')));
        }
        const count = ws.sent.length;
        await f.receive(bytes([255,command,201]));
        assert.equal(ws.sent.length, count);
        const data = new TextEncoder().encode('Client.Map {"url":"/map.json"}');
        await f.receive(bytes([255,250,201, ...data,255,240]));
        assert.equal(f.c.gmcp.get('Client.Map').url, '/map.json');
        assert.equal(f.debugMessages.at(-1)[1], 'Client.Map');
        f.c.terminal.clientWidth = 800; f.windowEvents.resize();
        assert.ok(new TextDecoder().decode(Uint8Array.from(ws.sent.at(-1))).includes('"width":100'));
    }
});
test('MSP retains negotiation and received message logging across chunks', async () => {
    const f = setup(); const ws = f.open();
    await f.receive(bytes([255,251,90]));
    assert.deepEqual(ws.sent.at(-1), [255,253,90]);
    const count = ws.sent.length;
    await f.receive(bytes([255,251,90])); assert.equal(ws.sent.length, count);
    await f.receive(bytes([255,250,90,83]));
    await f.receive(bytes([70,88,255,240]));
    assert.deepEqual(f.debugMessages.at(-1), ['MSP:', 'SFX']);
});

test('SGA switches to immediate input and restores the command bar', async () => {
    const f = setup(); const ws = f.open();
    await f.receive(bytes([255,251,3]));
    assert.equal(f.c.inputArea.style.display, 'none');
    assert.equal(f.c.commandInput.disabled, true);
    assert.equal(f.c.output.term.options.disableStdin, false);
    f.c.output.term.dataHandler('q');
    assert.deepEqual(ws.sent.at(-1), [113]);
    f.c.output.term.dataHandler('\x1b[A');
    assert.deepEqual(ws.sent.at(-1), [27,91,65]);
    f.c.output.term.binaryHandler(String.fromCharCode(255));
    assert.deepEqual(ws.sent.at(-1), [255,255]);
    assert.equal(f.c.history.length, 0);
    await f.receive(bytes([255,252,3]));
    assert.equal(f.c.inputArea.style.display, '');
    assert.equal(f.c.commandInput.disabled, false);
    assert.equal(f.c.output.term.options.disableStdin, true);
    const count = ws.sent.length;
    f.c.output.term.dataHandler('ignored');
    assert.equal(ws.sent.length, count);
});
test('password state and disconnect remain correct around character mode', async () => {
    const f = setup(); const ws = f.open();
    await f.receive(bytes([255,251,1,255,251,3]));
    await f.receive(bytes([255,252,3]));
    assert.equal(f.c.commandInput.type, 'password');
    assert.equal(f.c.historyHint.style.display, 'none');
    await f.receive(bytes([255,251,3]));
    f.c.disconnect();
    const count = ws.sent.length;
    f.c.output.term.dataHandler('late');
    assert.equal(ws.sent.length, count);
    assert.equal(f.c.inputArea.style.display, '');
    assert.equal(f.c.output.term.options.disableStdin, true);
});
test('NAWS uses the renderer character grid and reports resize', async () => {
    const f = setup(); const ws = f.open();
    await f.receive(bytes([255,253,31]));
    f.c.output.term.resize(132, 43);
    assert.deepEqual(ws.sent.at(-1), [255,250,31,0,132,0,43,255,240]);
});
test('unused protocol offers are declined without disrupting the game', async () => {
    const f = setup(); const ws = f.open();
    await f.receive(bytes([255,251,93,255,251,69,255,253,91,255,251,86]));
    for (const response of [[255,254,93],[255,254,69],[255,252,91],[255,254,86]]) {
        assert.ok(ws.sent.some(v => JSON.stringify(v) === JSON.stringify(response)));
    }
    f.c.commandInput.value = 'look'; f.c.handleSendCommand();
    assert.equal(new TextDecoder().decode(Uint8Array.from(ws.sent.at(-1))), 'look\r\n');
});
