// Disposable real-driver tests. Only tracked source/public dictionary is copied;
// no game service or player saves are accessed. --baseline replays pre-fix commerce.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { createServer, createConnection } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = process.argv.includes('--baseline');
const baselineRef = 'd43c418f';
const driver = resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-commerce-audit-'));
console.log('Isolated commerce regression: ' + sandbox + (baseline ? ` (${baselineRef} baseline)` : ''));
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
const commerce = ['feature/dealer.c', 'feature/user_storage.c', 'adm/daemons/moneyd.c',
    'adm/daemons/shopd.c', 'cmds/usr/buy.c', 'clone/misc/shang-ling.c'];
if (baseline) for (const file of commerce) put(file, git(root, ['show', baselineRef + ':' + file]));
put('tests/master.lpc', readFileSync(join(root, 'tools/tests/weapon_classification/startup_master.lpc'), 'utf8')
    .replaceAll('WEAPON_STARTUP', 'COMMERCE_AUDIT')
    .replace('if (!caught) {', 'debug_message(sprintf("COMMERCE_AUDIT TRACE: %O", details));\n    if (!caught) {')
    .replace('object connect() { return 0; }', `
private object *clients = ({});
object connect() { return new("/tests/actor"); }
object *query_clients() { return clients; }
void register_connection(object ob) {
    clients += ({ ob });
    if (sizeof(clients) == 2) call_out("run", 0);
}`)
    .replace('call_out("run", 0); return ({});', 'return ({});'));
put('tests/actor.lpc', readFileSync(join(root, 'tools/tests/weapon_classification/startup_actor.lpc'), 'utf8')
    + '\nint execute_test(string text) { return command(text); }\n'
    + 'mapping query_depot_for_test() { return my_depot; }\n'
    + 'void seed_depot_for_test(mapping data) { my_depot = data; restore_depot(); }\n'
    + 'int logon() { set_heart_beat(0); master()->register_connection(this_object()); return 1; }\n');
put('tests/regression.lpc', readFileSync(join(root, 'tools/tests/commerce_audit/regression.lpc'), 'utf8'));
put('tests/food.lpc', readFileSync(join(root, 'tools/tests/commerce_audit/food.lpc'), 'utf8'));
put('tests/fragile.lpc', readFileSync(join(root, 'tools/tests/commerce_audit/fragile.lpc'), 'utf8'));
const listener = createServer();
await new Promise((done, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', done); });
const port = listener.address().port;
await new Promise(done => listener.close(done));
put('driver.cfg', ['name : Commerce Audit Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log', 'debug log file : debug.log',
    'master file : /tests/master', 'simulated efun file : /adm/single/simul_efun',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>', 'gametick msec : 100',
].join('\n') + '\n');
const result = await new Promise((done, reject) => {
    const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
    const sockets = [];
    let output = '', connected = false;
    const timer = setTimeout(() => child.kill(), 60000);
    const collect = data => {
        output += data;
        if (!connected && output.includes('Initializations complete.')) {
            connected = true;
            for (let i = 0; i < 2; i++) {
                const socket = createConnection({ host: '127.0.0.1', port });
                socket.on('data', () => {});
                socket.on('error', error => {
                    if (error.code !== 'ECONNRESET') output += '\nCLIENT ERROR: ' + error.message;
                });
                sockets.push(socket);
            }
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
console.log(result.output.split(/\r?\n/).filter(line => /COMMERCE_AUDIT|FAIL:|error:|warning:/i.test(line)).join('\n'));
assert.equal(result.code, 0, 'Regression failed; see ' + sandbox);
assert.ok(result.output.includes('COMMERCE_AUDIT PASS'), 'Incomplete regression');
assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line)
    && !/^WARNING: Platform doesn't support eval limit!$/.test(line)), 'LPC diagnostics; see ' + sandbox);
