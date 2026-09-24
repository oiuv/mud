// Isolated real FluffOS + Python UDP regression. No production service or model calls.
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const driver = resolve(process.argv[2] || join(root, 'bin/driver.exe'));
const python = process.argv[3] || join(root, process.platform === 'win32' ? 'ai/.venv/Scripts/python.exe' : 'ai/.venv/bin/python');
const sandbox = mkdtempSync(join(tmpdir(), 'mud-ai-lpc-'));
const put = (path, text) => writeFileSync(join(sandbox, path), text, 'utf8');
console.log('Isolated AI regression: ' + sandbox);
for (const dir of ['tests', 'include', 'log', 'adm/daemons', 'ai', '.hidden/nested'])
    mkdirSync(join(sandbox, dir), { recursive: true });
cpSync(join(root, 'ai/tests/lpc'), join(sandbox, 'tests'), { recursive: true });
for (const path of ['adm/daemons/ai_client_d.c', 'adm/daemons/ai_npc_d.lpc'])
    cpSync(join(root, path), join(sandbox, path));
cpSync(join(root, 'cmds/adm/updateall.c'), join(sandbox, 'tests/updateall.c'));
cpSync(join(root, 'mudcore/system/kernel/simul_efun/json.c'), join(sandbox, 'tests/json.c'));
for (const name of ['socket.h', 'ansi.h']) cpSync(join(root, 'mudcore/include', name), join(sandbox, 'include', name));
put('ai/invalid.c', 'this must never compile');
put('.hidden/nested/invalid.c', 'this must never compile');
// Compile the unchanged real chat entry functions against tiny host stubs.
for (const name of ['butong', 'libai', 'ai_npc_template']) {
    const text = readFileSync(join(root, 'u/mudren/npc', name + '.c'), 'utf8');
    const start = text.indexOf('int accept_talk(object me, string topic) {');
    const end = text.indexOf('\n}', start) + 2;
    if (start < 0 || end < start) throw new Error('Cannot find NPC chat entry: ' + name);
    put('tests/' + name + '.lpc', 'inherit "/tests/actor";\n' + text.slice(start, end) + '\n');
}
cpSync(join(root, 'shadow/ai.c'), join(sandbox, 'tests/shadow.c'));
const socket = createServer();
await new Promise(resolveReady => socket.listen(0, '127.0.0.1', resolveReady));
const loginPort = socket.address().port;
await new Promise(resolveClose => socket.close(resolveClose));
let backendOutput = '';
const backend = spawn(python, [join(root, 'ai/tests/udp_fixture.py'), sandbox], { cwd: root, windowsHide: true });
backend.stdout.on('data', data => { backendOutput += data; });
backend.stderr.on('data', data => { backendOutput += data; });
const backendDone = new Promise((resolveDone, reject) => {
    backend.on('error', reject);
    backend.on('close', code => resolveDone(code));
});
try {
    const end = Date.now() + 10000;
    while (!existsSync(join(sandbox, 'ready.json')) && Date.now() < end && backend.exitCode === null)
        await new Promise(resolveWait => setTimeout(resolveWait, 20));
    if (!existsSync(join(sandbox, 'ready.json'))) throw new Error('UDP fixture failed: ' + backendOutput);
    const { port } = JSON.parse(readFileSync(join(sandbox, 'ready.json'), 'utf8'));
    put('include/globals.h', [
        '#define AI_CLIENT_D "/adm/daemons/ai_client_d"',
        '#define AI_NPC_D "/adm/daemons/ai_npc_d"',
        '#define AI_SERVER_PORT ' + port,
        '#define F_SHADOW "/tests/shadow_actor"',
        '#define F_CLEAN_UP "/tests/actor"',
        '#define NATURE_D "/tests/actor"',
        '#define SECURITY_D "/tests/actor"',
        '#define VOID_OB "/tests/actor"',
    ].join('\n') + '\n');
    put('driver.cfg', [
        'name : AI Regression', 'mud ip : 127.0.0.1', 'port number : ' + loginPort,
        'mudlib directory : ' + sandbox.replaceAll('\\', '/'),
        'log directory : /log', 'debug log file : debug.log',
        'include directories : /include', 'global include file : <globals.h>',
        'master file : /tests/master', 'simulated efun file : /tests/sefun',
        'maximum evaluation cost : 100000000', 'gametick msec : 100',
    ].join('\n') + '\n');
    const result = await new Promise((resolveDone, reject) => {
        const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
        let output = '';
        const timer = setTimeout(() => child.kill(), 20000);
        child.stdout.on('data', data => { output += data; });
        child.stderr.on('data', data => { output += data; });
        child.on('error', error => { clearTimeout(timer); reject(error); });
        child.on('close', code => { clearTimeout(timer); resolveDone({ code, output }); });
    });
    put('driver-output.txt', result.output);
    console.log(result.output.split('\n').filter(line => /AI LPC|FAIL:|error:/.test(line)).join('\n'));
    if (result.code !== 0 || !result.output.includes('AI LPC PASS'))
        throw new Error('Driver regression failed; see ' + join(sandbox, 'driver-output.txt'));
} finally {
    put('stop', '');
    const forcedStop = setTimeout(() => backend.kill(), 5000);
    const code = await backendDone;
    clearTimeout(forcedStop);
    put('backend-output.txt', backendOutput);
    if (code !== 0) throw new Error('Backend exited with ' + code + '; see ' + sandbox);
}
