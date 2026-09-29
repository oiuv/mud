// 真实 FluffOS 回归：只使用临时 MUDLIB 和回环 TCP，不连接游戏或 AI 服务。
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer, createConnection } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const driver = resolve(process.argv[2] || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-hotupdate-'));
const put = (path, text) => writeFileSync(join(sandbox, path), text, 'utf8');
console.log('Isolated hotupdate regression: ' + sandbox);
for (const directory of ['tests', 'include', 'log/static', 'cmds/adm', 'cases'])
    mkdirSync(join(sandbox, directory), { recursive: true });
cpSync(join(root, 'tools/tests/hotupdate'), join(sandbox, 'tests'), { recursive: true });
cpSync(join(root, 'cmds/adm/hotupdate.lpc'), join(sandbox, 'cmds/adm/hotupdate.lpc'));
cpSync(join(root, 'mudcore/include/runtime_config.h'), join(sandbox, 'include/runtime_config.h'));
put('include/globals.h', '#define DEBUG 0\n#define ROOT_UID "Root"\n#define SECURITY_D "/tests/security"\n#define F_CLEAN_UP "/tests/cleanup"\n');
// Reuse production authorization and file-read rules; only account/ACL storage is synthetic.
const extractFunction = (source, signature) => {
    const start = source.indexOf(signature + ' {');
    const end = source.indexOf('\n}', start) + 2;
    if (start < 0 || end < start) throw new Error('Cannot locate ' + signature);
    return source.slice(start, end);
};
const securitySource = readFileSync(join(root, 'adm/daemons/securityd.c'), 'utf8');
const securityFixture = [
    'mapping grant = ([]), trusted_read = ([]), exclude_read = ([]);',
    'mapping wiz_status = ([ "testadmin": "(admin)" ]);',
    'string *wiz_levels = ({ "(player)", "(immortal)", "(apprentice)", "(wizard)", "(arch)", "(admin)" });',
    'void set_test_status(string uid, string status) { wiz_status[uid] = status; }',
    ...[
        'string get_status(mixed ob)',
        'int get_wiz_level(mixed ob)',
        'int valid_read(string file, mixed user, string func)',
        'int valid_seteuid(object ob, string uid)',
        'int valid_grant(object ob, string min_level)',
    ].map(signature => extractFunction(securitySource, signature)),
].join('\n') + '\n';
put('tests/security.lpc', securityFixture);
const masterRules = readFileSync(join(root, 'adm/single/master/valid.c'), 'utf8');
const masterFixture = readFileSync(join(sandbox, 'tests/master.lpc'), 'utf8')
    .replace('int valid_read(string file, mixed user, string func) { return 1; }',
        extractFunction(masterRules, 'int valid_read(string file, mixed user, string func)'));
put('tests/master.lpc', masterFixture);
put('tests/untrusted.lpc', [
    'int attempt(object target) { return recompile_object(target); }',
    'string attempt_read() { return read_file("/tests/cleanup.lpc"); }',
].join('\n') + '\n');
const listener = createServer();
await new Promise((ready, reject) => {
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', ready);
});
const port = listener.address().port;
await new Promise(done => listener.close(done));
put('driver.cfg', [
    'name : Hotupdate Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'),
    'log directory : /log', 'debug log file : debug.log',
    'include directories : /include', 'global include file : <globals.h>',
    'master file : /tests/master', 'simulated efun file : /tests/sefun',
    'maximum evaluation cost : 100000000', 'gametick msec : 100',
].join('\n') + '\n');

let transcript = '', inputBuffer = '';
const result = await new Promise((done, reject) => {
    const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
    let output = '', client, connected = false, connecting = false;
    const connectTimer = setInterval(() => {
        if (connected || connecting || !output.includes('HOTUPDATE READY')) return;
        connecting = true;
        client = createConnection({ host: '127.0.0.1', port });
        client.on('connect', () => { connected = true; clearInterval(connectTimer); });
        client.on('data', data => {
            const text = data.toString('utf8');
            transcript += text;
            inputBuffer += text;
            let offset;
            while ((offset = inputBuffer.indexOf('HOTUPDATE STEP')) >= 0) {
                inputBuffer = inputBuffer.slice(offset + 'HOTUPDATE STEP'.length);
                client.write('\r\n');
            }
        });
        client.on('error', () => { connecting = false; });
    }, 100);
    const timeout = setTimeout(() => child.kill(), 25000);
    const cleanup = () => {
        clearInterval(connectTimer);
        clearTimeout(timeout);
        client?.destroy();
    };
    child.stdout.on('data', data => { output += data.toString('utf8'); });
    child.stderr.on('data', data => { output += data.toString('utf8'); });
    child.once('error', error => { cleanup(); reject(error); });
    child.once('close', code => { cleanup(); done({ code, output }); });
});
put('driver-output.txt', result.output);
put('client-output.txt', transcript);
console.log(result.output.split('\n').filter(line => /HOTUPDATE|FAIL:|error:/.test(line)).join('\n'));
if (result.code !== 0 || !result.output.includes('HOTUPDATE PASS'))
    throw new Error('Hotupdate regression failed; see ' + join(sandbox, 'driver-output.txt'));
