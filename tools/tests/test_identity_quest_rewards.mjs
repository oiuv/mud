import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { createServer, createConnection } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = process.argv.includes('--baseline');
const baselineRef = '95cb63b1';
const driver = resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-identity-quest-'));
console.log('Isolated identity/quest regression: ' + sandbox + (baseline ? ' (old-code negative control)' : ''));
const git = (directory, args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8' });
const files = new Set([...git(root, ['ls-files', '-z']).split('\0'),
    ...git(root, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0'),
    ...git(join(root, 'mudcore'), ['ls-files', '-z']).split('\0').map(file => 'mudcore/' + file)]);
const excluded = /^(?:backup|bin|binaries|data|doc|docs|dump|fluffos|grant|help|log|ai|openspec|temp|version|www|tools)\//;
const put = (file, text) => {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    writeFileSync(join(sandbox, file), text, 'utf8');
};
for (const file of files) {
    if (!/\.(?:c|lpc|h)$/.test(file) || excluded.test(file) || !existsSync(join(root, file))
        || file.split('/').some(part => part === 'tests' || part.startsWith('.'))) continue;
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    cpSync(join(root, file), join(sandbox, file));
}
for (const directory of ['tests', 'log', 'data']) mkdirSync(join(sandbox, directory), { recursive: true });
cpSync(join(root, 'data/e2c_dict.o'), join(sandbox, 'data/e2c_dict.o'));
put('adm/etc/wizlist', '# Isolated regression: no administrators.\n');
const targets = ['feature/command.c', 'cmds/usr/quest2.c', 'adm/daemons/quest/_0_smith.c',
    'adm/daemons/task/set_task.c', 'clone/quest/deliver.c'];
if (baseline) {
    for (const file of targets) put(file, git(root, ['show', baselineRef + ':' + file]));
    const coreRef = git(root, ['rev-parse', baselineRef + ':mudcore']).trim();
    put('mudcore/system/daemons/quest_d.c', git(join(root, 'mudcore'), ['show', coreRef + ':system/daemons/quest_d.c']));
}
for (const name of ['master', 'actor', 'regression', 'quests', 'quest_info', 'item', 'goods']) {
    put('tests/' + name + '.lpc', readFileSync(join(root, 'tools/tests/identity_quest', name + '.lpc'), 'utf8'));
}
for (let i = 0; i < 4; i++) put('tests/player' + i + '.lpc', 'inherit "/tests/actor";\n');
put('tests/npc.lpc', readFileSync(join(root, 'tools/tests/weapon_classification/startup_actor.lpc'), 'utf8'));
// Replace only the random input in isolated copies; reward/move implementations remain real.
for (const file of ['adm/daemons/task/set_task.c', 'clone/quest/deliver.c']) {
    put(file, '#define random(n) "/tests/regression"->next_random(n)\n' + readFileSync(join(sandbox, file), 'utf8'));
}
const listener = createServer();
await new Promise((done, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', done); });
const port = listener.address().port;
await new Promise(done => listener.close(done));
put('driver.cfg', ['name : Identity Quest Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log', 'debug log file : debug.log',
    'master file : /tests/master', 'simulated efun file : /adm/single/simul_efun',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>', 'gametick msec : 100',
].join('\n') + '\n');
const result = await new Promise((done, reject) => {
    const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
    const sockets = [];
    let output = '', connected = false, reconnecting = false;
    const timer = setTimeout(() => child.kill(), 60000);
    const collect = data => {
        output += data;
        if (!connected && output.includes('Initializations complete.')) {
            connected = true;
            for (let i = 0; i < 4; i++) {
                const socket = createConnection({ host: '127.0.0.1', port });
                socket.on('data', () => {});
                socket.on('error', error => {
                    if (error.code !== 'ECONNRESET') output += '\nCLIENT ERROR: ' + error.message;
                });
                sockets.push(socket);
            }
        }
        if (!reconnecting && output.includes('IDENTITY_QUEST RECONNECT')) {
            reconnecting = true;
            sockets[1].destroy();
            setTimeout(() => {
                const socket = createConnection({ host: '127.0.0.1', port });
                socket.on('data', () => {});
                socket.on('error', error => {
                    if (error.code !== 'ECONNRESET') output += '\nRECONNECT ERROR: ' + error.message;
                });
                sockets.push(socket);
            }, 300);
        }
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => {
        clearTimeout(timer);
        sockets.forEach(socket => socket.destroy());
        done({ code, output });
    });
});
put('driver-output.txt', result.output);
const log = join(sandbox, 'log/debug.log');
const diagnostics = result.output + (existsSync(log) ? readFileSync(log, 'utf8') : '');
console.log(result.output.split(/\r?\n/).filter(line => /IDENTITY_QUEST|FAIL:|error:|warning:/i.test(line)).join('\n'));
assert.equal(result.code, 0, 'Regression failed; see ' + sandbox);
assert.ok(result.output.includes('IDENTITY_QUEST PASS'), 'Incomplete regression');
assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line)
    && !/^WARNING: Platform doesn't support eval limit!$/.test(line)), 'LPC diagnostics; see ' + sandbox);
