// 无 npm 依赖。用独立 Chrome/Chromium 配置和本机测试服务器验证实际终端。
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, sep, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const www = join(root, 'www');
const chromePath = process.env.CHROME_PATH || [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].find(existsSync);
assert.ok(chromePath, '请通过 CHROME_PATH 指定 Chrome/Chromium 可执行文件。');
const artifacts = mkdtempSync(join(tmpdir(), 'mud-web-browser-'));
const profile = join(artifacts, 'profile'); mkdirSync(profile);
const peers = [], sockets = new Set();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) {
    const deadline = Date.now() + 12000;
    while (Date.now() < deadline) { if (await check()) return; await delay(40); }
    throw new Error('等待失败：' + label);
}
function frame(data, opcode = 2) {
    const bytes = Buffer.from(data), header = Buffer.alloc(bytes.length < 126 ? 2 : 4);
    header[0] = 0x80 | opcode;
    if (bytes.length < 126) header[1] = bytes.length;
    else { assert.ok(bytes.length < 65536); header[1] = 126; header.writeUInt16BE(bytes.length, 2); }
    return Buffer.concat([header, bytes]);
}
const server = createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = resolve(www, '.' + (pathname === '/' ? '/index.html' : decodeURIComponent(pathname)));
    if (!file.startsWith(www + sep) || !existsSync(file)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css' }[extname(file)] || 'text/plain');
    res.end(readFileSync(file));
});
server.on('connection', socket => { sockets.add(socket); socket.on('close', () => sockets.delete(socket)); });
server.on('upgrade', (req, socket) => {
    const mode = req.headers['sec-websocket-protocol'] || '';
    const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n' +
        (mode ? 'Sec-WebSocket-Protocol: ' + mode + '\r\n' : '') + '\r\n');
    const peer = { mode, sent: [], write: data => socket.write(frame(data)), socket };
    peers.push(peer);
    let buffer = Buffer.alloc(0);
    socket.on('data', chunk => {
        buffer = Buffer.concat([buffer, chunk]);
        while (buffer.length >= 2) {
            const opcode = buffer[0] & 15, masked = buffer[1] & 128;
            let size = buffer[1] & 127, offset = 2;
            if (size === 126) { if (buffer.length < 4) return; size = buffer.readUInt16BE(2); offset = 4; }
            if (size === 127) { if (buffer.length < 10) return; size = Number(buffer.readBigUInt64BE(2)); offset = 10; }
            if (size > 1048576) { socket.destroy(); return; }
            if (buffer.length < offset + (masked ? 4 : 0) + size) return;
            const mask = buffer.subarray(offset, offset + 4); if (masked) offset += 4;
            const data = Buffer.from(buffer.subarray(offset, offset + size));
            if (masked) for (let i = 0; i < data.length; i++) data[i] ^= mask[i % 4];
            buffer = buffer.subarray(offset + size);
            if (opcode === 8) { socket.end(frame(data, 8)); return; }
            if (opcode === 9) socket.write(frame(data, 10));
            if (opcode === 1 || opcode === 2) peer.sent.push({ opcode, data });
        }
    });
});
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const port = server.address().port;
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-extensions',
    '--disable-component-update', '--no-proxy-server', '--window-size=1100,760', 'about:blank'],
    { stdio:'ignore', windowsHide:true });
let cdp;
try {
    const activePort = join(profile, 'DevToolsActivePort');
    await until(() => existsSync(activePort), 'Chrome 启动');
    const debugPort = readFileSync(activePort, 'utf8').split('\n')[0];
    const tabs = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
    cdp = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { cdp.onopen = resolve; cdp.onerror = reject; });
    let serial = 0;
    const pending = new Map(), errors = [];
    cdp.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.id) { const promise = pending.get(data.id); pending.delete(data.id); data.error ? promise.reject(new Error(JSON.stringify(data.error))) : promise.resolve(data.result); }
        else if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.text);
    };
    function call(method, params = {}) {
        return new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); cdp.send(JSON.stringify({ id, method, params })); });
    }
    async function evaluate(expression) {
        const value = await call('Runtime.evaluate', { expression, returnByValue:true, awaitPromise:true });
        if (value.exceptionDetails) throw new Error(JSON.stringify(value.exceptionDetails));
        return value.result.value;
    }
    const screen = `Array.from({length:client.output.term.buffer.active.length},(_,i)=>client.output.term.buffer.active.getLine(i).translateToString(true)).join(String.fromCharCode(10))`;
    const screenshot = async name => {
        const result = await call('Page.captureScreenshot', { format:'png' });
        writeFileSync(join(artifacts, name + '.png'), Buffer.from(result.data, 'base64'));
    };
    await call('Runtime.enable'); await call('Page.enable');
    await call('Emulation.setDeviceMetricsOverride', { width:1100, height:760, deviceScaleFactor:1, mobile:false });
    await call('Page.navigate', { url:`http://127.0.0.1:${port}/` });
    await until(() => evaluate(`typeof client !== 'undefined'`), '客户端初始化');
    assert.deepEqual(await evaluate(`Array.from(document.querySelector('#subprotocolSelect').options,o=>o.value)`), ['ascii','telnet','binary','http','']);
    assert.equal(await evaluate(`!!document.getElementById('privateInput')`), false);
    await screenshot('desktop-options');
    const visited = [];
    for (const mode of ['ascii','telnet','binary','']) {
        const count = peers.length;
        await evaluate(`document.getElementById('protocolSelect').value='ws://'; document.getElementById('addressInput').value='127.0.0.1'; document.getElementById('portInput').value='${port}'; document.getElementById('subprotocolSelect').value=${JSON.stringify(mode)}; document.getElementById('connectBtn').click()`);
        await until(() => peers.length > count, '连接 ' + mode);
        const peer = peers.at(-1);
        await until(() => evaluate(`client.session?.ws.readyState===1`), '握手 ' + mode);
        assert.equal(await evaluate(`getComputedStyle(client.output.term.element).display!=='none' && client.output.term.element.getBoundingClientRect().height>0`), true);
        const marker = 'SESSION_' + (mode || 'none');
        const payload = Buffer.from(marker + '\r\n\x1b[0;32m欢迎来到客栈\x1b[0m\r\n<img src=x onerror="window.injected=1">\r\n');
        peer.write(payload.subarray(0, 9)); peer.write(payload.subarray(9));
        await until(async () => (await evaluate(screen)).includes(marker), '当前会话输出');
        for (const previous of visited) assert.ok((await evaluate(screen)).includes(previous));
        visited.push(marker);
        await until(async () => (await evaluate(screen)).includes('欢迎来到客栈'), '中文分片显示');
        assert.equal(await evaluate(`window.injected || document.querySelectorAll('#terminal img').length`), 0);
        await evaluate(`document.getElementById('commandInput').focus()`);
        await call('Input.insertText', { text:'say 你好' });
        await call('Input.dispatchKeyEvent', { type:'keyDown', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 });
        await call('Input.dispatchKeyEvent', { type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 });
        await until(() => peer.sent.some(v => v.data.toString().includes('say 你好')), '中文命令发送');
        const command = peer.sent.find(v => v.data.toString().includes('say 你好'));
        assert.equal(command.opcode, ['telnet','binary'].includes(mode) ? 2 : 1);
        if (mode === 'telnet') {
            peer.write([255,251,1,255,253,31]);
            await until(() => evaluate(`document.getElementById('commandInput').type==='password'`), '隐藏输入');
            await call('Input.insertText', { text:'fixture-secret' });
            await evaluate(`document.getElementById('sendBtn').click()`);
            await until(() => peer.sent.some(v => v.data.toString().includes('fixture-secret')), '密码发送');
            assert.equal(await evaluate(`client.history.includes('fixture-secret')`), false);
            peer.write([255,252,1,255,251,3]);
            peer.write(Buffer.from('\x1b[?1049h\x1b[2J\x1b[1;1H\x1b[31m菜单\x1b[0m\x1b[2;1H选择A'));
            await until(() => evaluate(`client.charMode && client.output.term.buffer.active.type==='alternate'`), '即时输入和备用屏幕');
            assert.equal(await evaluate(`client.output.term.buffer.active.getLine(0).translateToString(true)`), '菜单');
            assert.equal(await evaluate(`client.output.term.buffer.active.getLine(0).getCell(0).getFgColor()`), 1);
            await call('Input.dispatchKeyEvent', { type:'keyDown', key:'k', code:'KeyK', text:'k', windowsVirtualKeyCode:75 });
            await call('Input.dispatchKeyEvent', { type:'keyUp', key:'k', code:'KeyK', windowsVirtualKeyCode:75 });
            try {
                await until(() => peer.sent.some(v => v.data.equals(Buffer.from('k'))), '即时按键无回车');
            } catch (error) {
                console.log('KEY STATE', await evaluate(`({charMode:client.charMode,stdin:client.output.term.options.disableStdin,active:document.activeElement.className,tag:document.activeElement.tagName,focus:document.hasFocus(),bar:document.getElementById('inputArea').style.display})`));
                console.log('RECENT FRAMES', peer.sent.slice(-8).map(v=>v.data.toString('hex')));
                await screenshot('key-failure');
                console.log('ARTIFACTS', artifacts);
                throw error;
            }
            await call('Input.dispatchKeyEvent', { type:'keyDown', key:'ArrowUp', code:'ArrowUp', windowsVirtualKeyCode:38 });
            await call('Input.dispatchKeyEvent', { type:'keyUp', key:'ArrowUp', code:'ArrowUp', windowsVirtualKeyCode:38 });
            await until(() => peer.sent.some(v => v.data.equals(Buffer.from('\x1b[A'))), '方向键');
            await screenshot('desktop-terminal');
            await call('Emulation.setTouchEmulationEnabled', { enabled:true });
            await call('Emulation.setDeviceMetricsOverride', { width:390, height:844, deviceScaleFactor:1, mobile:true });
            await until(() => evaluate(`client.output.term.cols<80`), '手机字符网格');
            const size = await evaluate(`client.output.size`);
            await until(() => peer.sent.some(v => v.data.equals(Buffer.from([255,250,31,0,size.width,0,size.height,255,240]))), '真实 NAWS 网格');
            assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`), true);
            await screenshot('mobile-terminal');
            peer.write(Buffer.from('\x1b[?1049l'));
            peer.write([255,252,3]);
            await until(() => evaluate(`!client.charMode && client.output.term.buffer.active.type==='normal'`), '恢复命令输入');
            assert.ok((await evaluate(screen)).includes(marker));
            await screenshot('mobile-chat');
            assert.equal(await evaluate(`client.output.term.options.fontSize`), 12);
            assert.equal(await evaluate(`getComputedStyle(client.commandInput).fontSize`), '12px');
            await evaluate(`client.commandInput.value='say 键盘测试'; client.commandInput.focus()`);
            // 模拟软键盘仅缩小 VisualViewport，布局视口仍为 390×844。
            await evaluate(`(() => {
                for (const [key,value] of Object.entries({height:420,offsetTop:30,scale:1})) {
                    Object.defineProperty(visualViewport,key,{configurable:true,value});
                }
                visualViewport.dispatchEvent(new Event('resize'));
            })()`);
            await until(() => evaluate(`Math.abs(document.body.getBoundingClientRect().height-420)<1 &&
                document.body.classList.contains('compact') && client.output.term.rows<20`), '键盘展开后的可见布局');
            assert.equal(await evaluate(`innerHeight`), 844);
            assert.equal(await evaluate(`(() => { const input=client.commandInput.getBoundingClientRect();
                return input.top>=visualViewport.offsetTop && input.bottom<=visualViewport.offsetTop+visualViewport.height &&
                    client.terminal.getBoundingClientRect().height>100; })()`), true);
            const keyboardSize = await evaluate(`client.output.size`);
            await until(() => peer.sent.some(v => v.data.equals(Buffer.from([255,250,31,0,keyboardSize.width,0,keyboardSize.height,255,240]))), '键盘展开后上报 NAWS');
            await screenshot('mobile-keyboard');
            // 平移或聚焦自动缩放后输入栏仍位于可见区域，字号、列数和草稿保持不变。
            await evaluate(`Object.defineProperty(visualViewport,'offsetTop',{configurable:true,value:45});
                visualViewport.dispatchEvent(new Event('scroll'))`);
            assert.equal(await evaluate(`document.body.getBoundingClientRect().top`), 45);
            await evaluate(`Object.defineProperty(visualViewport,'scale',{configurable:true,value:2});
                Object.defineProperty(visualViewport,'height',{configurable:true,value:210});
                visualViewport.dispatchEvent(new Event('resize'))`);
            assert.equal(await evaluate(`client.output.size.width`), keyboardSize.width);
            assert.equal(await evaluate(`client.output.term.options.fontSize`), 12);
            assert.equal(await evaluate(`document.body.getBoundingClientRect().height`), 210);
            assert.equal(await evaluate(`client.commandInput.getBoundingClientRect().bottom<=255`), true);
            await evaluate(`for (const key of ['height','offsetTop','scale']) delete visualViewport[key];
                visualViewport.dispatchEvent(new Event('resize'))`);
            await until(() => evaluate(`!document.body.classList.contains('compact') && client.output.term.rows>20`), '键盘收起后恢复');
            assert.equal(await evaluate(`client.commandInput.value`), 'say 键盘测试');
            assert.ok((await evaluate(screen)).includes(marker));
            await evaluate(`client.commandInput.value=''`);
            await call('Emulation.setDeviceMetricsOverride', { width:844, height:390, deviceScaleFactor:1, mobile:true });
            await until(() => evaluate(`document.body.classList.contains('compact') && client.output.term.cols>60`), '手机横屏');
            assert.equal(await evaluate(`client.output.term.options.fontSize`), 14);
            assert.equal(await evaluate(`client.commandInput.getBoundingClientRect().bottom<=390 &&
                client.terminal.getBoundingClientRect().height>100 && document.documentElement.scrollWidth<=innerWidth`), true);
            await screenshot('mobile-landscape');
            await call('Emulation.setTouchEmulationEnabled', { enabled:false });
            await call('Emulation.setDeviceMetricsOverride', { width:1100, height:760, deviceScaleFactor:1, mobile:false });
        }
        await evaluate(`document.getElementById('disconnectBtn').click()`);
        assert.ok((await evaluate(screen)).includes('欢迎来到客栈'));
    }
    assert.deepEqual(errors, []);
    console.log('PASS: all connection choices, real xterm display, UTF-8, safe text, password history, immediate keys, alternate screen, resize, mobile layout and simulated keyboard viewport');
    console.log('Screenshots: ' + artifacts);
} finally {
    cdp?.close();
    if (chrome.exitCode === null) chrome.kill();
    for (const socket of sockets) socket.destroy();
    server.close();
}
