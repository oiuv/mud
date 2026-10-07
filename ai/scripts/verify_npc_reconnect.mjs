// 真实 TCP 重连/顶号 + UDP 回包；只启动临时驱动，不连接正式游戏或模型。
import { mkdtempSync, mkdirSync, cpSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { createConnection, createServer } from 'node:net';
import { createSocket } from 'node:dgram';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = process.argv.includes('--baseline');
const baselineCommit = 'd43c418f';
const driver = resolve(process.argv.find((arg, i) => i > 1 && arg !== '--baseline') || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-npc-reconnect-'));
const put = (path, text) => writeFileSync(join(sandbox, path), text, 'utf8');
console.log('Isolated NPC reconnect regression: ' + sandbox);
for (const dir of ['tests', 'include', 'log', 'adm/daemons']) mkdirSync(join(sandbox, dir), { recursive: true });
cpSync(join(root, 'ai/tests/lpc/reconnect'), join(sandbox, 'tests'), { recursive: true });
cpSync(join(root, 'ai/tests/lpc/actor.lpc'), join(sandbox, 'tests/actor.lpc'));
cpSync(join(root, 'mudcore/system/kernel/simul_efun/json.c'), join(sandbox, 'tests/json.c'));
cpSync(join(root, 'mudcore/include/socket.h'), join(sandbox, 'include/socket.h'));
for (const path of ['adm/daemons/ai_client_d.c', 'adm/daemons/ai_npc_d.lpc']) cpSync(join(root, path), join(sandbox, path));
if (baseline) put('adm/daemons/ai_npc_d.lpc', execFileSync('git', ['show', baselineCommit + ':adm/daemons/ai_npc_d.lpc'], { cwd: root, encoding: 'utf8' }));

const listener = createServer();
await new Promise(resolveReady => listener.listen(0, '127.0.0.1', resolveReady));
const loginPort = listener.address().port;
await new Promise(resolveClose => listener.close(resolveClose));
const udp = createSocket('udp4');
await new Promise(resolveReady => udp.bind(0, '127.0.0.1', resolveReady));
const requests = new Map(), cancelled = new Set();
const send = (packet, address) => udp.send(Buffer.from(JSON.stringify(packet)), address.port, address.address);
udp.on('message', (data, address) => {
    const packet = JSON.parse(data.toString());
    if (packet.type === 'request_control') {
        if (packet.action === 'cancel') cancelled.add(packet.request_id);
        return;
    }
    requests.set(packet.message, { packet, address });
    send({ type: 'request_progress', request_id: packet.request_id, request_token: packet.request_token,
        heartbeat_seconds: 5, lease_seconds: 30 }, address);
});
put('include/globals.h', '#define AI_CLIENT_D "/adm/daemons/ai_client_d"\n#define AI_NPC_D "/adm/daemons/ai_npc_d"\n#define AI_SERVER_PORT ' + udp.address().port + '\n');
put('driver.cfg', [
    'name : NPC Reconnect Regression', 'mud ip : 127.0.0.1', 'port number : ' + loginPort,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log', 'debug log file : debug.log',
    'include directories : /include', 'global include file : <globals.h>', 'master file : /tests/master',
    'simulated efun file : /tests/sefun', 'maximum evaluation cost : 100000000', 'gametick msec : 100',
].join('\n') + '\n');
let output = '', checks = 0;
const clients = [];
const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
child.stdout.on('data', data => { output += data; });
child.stderr.on('data', data => { output += data; });
const done = new Promise((resolveDone, reject) => { child.on('error', reject); child.on('close', resolveDone); });
const timer = setTimeout(() => child.kill(), 30000);
const sleep = ms => new Promise(resolveWait => setTimeout(resolveWait, ms));
async function waitFor(predicate, label, timeout = 4000) {
    const deadline = Date.now() + timeout;
    while (!predicate() && Date.now() < deadline && child.exitCode === null) await sleep(20);
    assert.ok(predicate(), label + '; see ' + sandbox);
    checks++;
}
async function login() {
    const socket = createConnection({ host: '127.0.0.1', port: loginPort });
    const client = { socket, text: '', error: null };
    clients.push(client);
    socket.on('data', data => { client.text += data.toString('utf8'); });
    socket.on('error', error => { client.error = error; });
    await waitFor(() => client.text.includes('LOGIN'), 'login prompt');
    socket.write('tester\n');
    await waitFor(() => client.text.includes('READY'), 'real exec connection transfer');
    client.identity = client.text.match(/READY \d+ (\S+)/)[1];
    return client;
}
async function ask(client, message) {
    client.socket.write('ask ' + message + '\n');
    await waitFor(() => requests.has(message), 'request sent: ' + message);
    return requests.get(message);
}
function reply(request, text) {
    send({ ...request.packet, type: 'chat', response: text }, request.address);
}
async function drained(client) {
    await sleep(180);
    client.text = '';
    client.socket.write('status\n');
    await waitFor(() => /PENDING 0/.test(client.text), 'no pending transport leaks');
}
try {
    await waitFor(() => output.includes('Initializations complete.'), 'driver startup');
    let client = await login();
    const identity = client.identity;
    const old = await ask(client, 'disconnect');
    client.socket.destroy();
    client = await login();
    assert.equal(client.identity, identity, 'same player object survives disconnect'); checks++;
    reply(old, 'STALE_DISCONNECT');
    await waitFor(() => cancelled.has(old.packet.request_id), 'old connection response is cancelled before heartbeat');
    assert.ok(!client.text.includes('STALE_DISCONNECT'), 'no disconnected reply'); checks++;
    await drained(client);

    const takeover = await ask(client, 'takeover');
    client = await login();
    assert.equal(client.identity, identity, 'takeover keeps player object'); checks++;
    reply(takeover, 'STALE_TAKEOVER');
    await waitFor(() => cancelled.has(takeover.packet.request_id), 'takeover reply cancelled');
    assert.ok(!client.text.includes('STALE_TAKEOVER'), 'no takeover reply'); checks++;
    await drained(client);

    const pending = await ask(client, 'before_new');
    client.socket.destroy();
    client = await login();
    const fresh = await ask(client, 'new_question');
    await waitFor(() => cancelled.has(pending.packet.request_id), 'new question clears stale duplicate guard');
    reply(pending, 'STALE_AFTER_NEW');
    reply(fresh, 'FRESH_REPLY');
    await waitFor(() => client.text.includes('FRESH_REPLY'), 'new connection gets its own reply');
    assert.ok(!client.text.includes('STALE_AFTER_NEW'), 'old result cannot replace new result'); checks++;
    await drained(client);

    const lease = await ask(client, 'lease');
    client.socket.destroy();
    client = await login();
    await waitFor(() => cancelled.has(lease.packet.request_id), 'heartbeat rejects stale connection without any reply', 6500);
    await drained(client);

    await ask(client, 'before_remove');
    client.socket.destroy();
    client = await login();
    client.socket.write('remove\n');
    await waitFor(() => client.text.includes('REMOVED'), 'daemon cleanup');
    assert.ok(!client.text.includes('方才的话音被打断了'), 'reload does not notify replacement connection'); checks++;
    await drained(client);
    client.socket.write('finish\n');
    assert.equal(await done, 0);
    assert.ok(output.includes('AI RECONNECT PASS'));
    const diagnostics = output.replace("WARNING: Platform doesn't support eval limit!", '');
    assert.ok(!/error:|FAIL:|warning:/i.test(diagnostics), 'no driver diagnostics');
    console.log(`AI NPC RECONNECT PASS: ${checks} checks`);
} finally {
    for (const client of clients) client.socket.destroy();
    if (child.exitCode === null) child.kill();
    await done;
    clearTimeout(timer);
    udp.close();
    put('driver-output.txt', output);
}
