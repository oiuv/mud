// Real game lifecycle in an isolated source-only MUDLIB; no production accounts or AI.
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { createServer, createConnection } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
assert.ok(args.filter(arg => arg.startsWith('--')).every(arg => ['--before', '--reload'].includes(arg)));
const before = args.includes('--before');
const reload = args.includes('--reload');
assert.ok(!(before && reload), 'Use either --before or --reload');
const driver = resolve(args.find(arg => !arg.startsWith('--')) || join(root, 'bin', process.platform === 'win32' ? 'driver.exe' : 'driver'));
const baseline = '6926d0bf';
const sandbox = mkdtempSync(join(tmpdir(), 'mud-illusion-lifecycle-'));
console.log('Isolated illusion lifecycle: ' + sandbox);
const source = file => readFileSync(join(root, file), 'utf8');
const put = (file, text) => {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    writeFileSync(join(sandbox, file), text, 'utf8');
};
const gitFiles = (directory, args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
const files = new Set([...gitFiles(root, ['ls-files', '-z']),
    ...gitFiles(root, ['ls-files', '--others', '--exclude-standard', '-z']),
    ...gitFiles(join(root, 'mudcore'), ['ls-files', '-z']).map(file => 'mudcore/' + file)]);
for (const file of files) {
    if (!/^(?:adm|b|clone|cmds|d|feature|include|inherit|kungfu|mudcore|std|world)\//.test(file)
        || !/\.(?:c|lpc|h)$/.test(file) || !existsSync(join(root, file))
        || file.split('/').some(part => part === 'tests' || part.startsWith('.'))) continue;
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    copyFileSync(join(root, file), join(sandbox, file));
}
for (const directory of ['tests', 'data', 'log']) mkdirSync(join(sandbox, directory), { recursive: true });
for (const file of ['data/e2c_dict.o', 'd/illusion/catalog.json', 'd/illusion/catalog-wuxia-v1.json']) put(file, source(file));
for (const file of ['actor', 'room', 'regression', 'hotreload']) put('tests/' + file + '.lpc', source('tools/tests/illusion_lifecycle/' + file + '.lpc'));
put('tests/legacy_next.lpc', source('tools/tests/illusion_lifecycle/room.lpc'));
if (before || reload) put('kungfu/class/generate/demon.c', execFileSync('git', ['show', baseline + ':kungfu/class/generate/demon.c'],
    { cwd: root, encoding: 'utf8' }));
let master = source('tools/tests/weapon_classification/startup_master.lpc')
    .replaceAll('WEAPON_STARTUP', 'ILLUSION_LIFECYCLE')
    .replace('object connect() { return 0; }', 'object connect() { return new("/tests/actor"); }')
    .replace('if (err) check(0, err);\n    finish();', 'if (err) { check(0, err); finish(); }')
    .replace('call_out("run", 0); return ({});', 'debug_message("ILLUSION_LIFECYCLE READY"); call_out("await_players", 0); return ({});');
assert.ok(master.includes('ILLUSION_LIFECYCLE READY'));
if (reload) master = master.replace('/tests/regression', '/tests/hotreload');
master += '\nprivate object *players = ({});\nobject *query_players() { return players; }\n'
    + 'void register_connection(object player) { players += ({ player }); }\n'
    + 'void await_players() { if (sizeof(players) == 2) run(); else call_out("await_players", 0.1); }\n';
put('tests/master.lpc', master);
put('tests/baseline.txt', before ? baseline : 'current');
// Use ordinary fixture identities without deployment wizard/account data.
put('adm/daemons/securityd.c', 'int get_wiz_level(mixed ob) { return 0; }\nstring get_status(mixed ob) { return "(player)"; }\n');
const listener = createServer();
await new Promise((done, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', done); });
const port = listener.address().port;
await new Promise(done => listener.close(done));
put('driver.cfg', ['name : Illusion Lifecycle Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log', 'debug log file : debug.log',
    'master file : /tests/master', 'simulated efun file : /adm/single/simul_efun',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>', 'gametick msec : 100',
].join('\n') + '\n');
const result = await new Promise((done, reject) => {
    const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
    let output = '', connected = false, updated = false;
    const clients = [];
    const timer = setTimeout(() => child.kill(), 60000);
    const receive = data => {
        output += data;
        if (reload && !updated && output.includes('ILLUSION_LIFECYCLE RELOAD_READY')) {
            updated = true;
            put('kungfu/class/generate/demon.c', source('kungfu/class/generate/demon.c'));
            put('data/reload_ready', 'ready\n');
        }
        if (!connected && output.includes('ILLUSION_LIFECYCLE READY') && output.includes('Initializations complete.')) {
            connected = true;
            for (let i = 0; i < 2; i++) {
                const client = createConnection({ host: '127.0.0.1', port });
                client.on('data', () => {});
                client.on('error', error => { if (error.code !== 'ECONNRESET') output += '\nFixture socket: ' + error.code; });
                clients.push(client);
            }
        }
    };
    child.stdout.on('data', receive);
    child.stderr.on('data', receive);
    child.on('error', error => { clearTimeout(timer); for (const client of clients) client.destroy(); reject(error); });
    child.on('close', code => { clearTimeout(timer); for (const client of clients) client.destroy(); done({ code, output }); });
});
put('driver-output.txt', result.output);
put('result.json', JSON.stringify({ ...result, output: undefined, mode: reload ? 'reload' : before ? 'before' : 'current', baseline }, null, 2) + '\n');
console.log(result.output.split(/\r?\n/).filter(line => /ILLUSION_LIFECYCLE|BASELINE|FAIL:|error:|warning:|TEST TRACE/i.test(line)).join('\n'));
const debug = join(sandbox, 'log/debug.log');
const diagnostics = result.output + (existsSync(debug) ? readFileSync(debug, 'utf8') : '');
assert.ok(!/\b(?:error|warning):/i.test(diagnostics
    .replaceAll("WARNING: Platform doesn't support eval limit!", '')
    .replaceAll('EXPECTED BASELINE PATH ERROR:', 'EXPECTED BASELINE PATH:')),
    'Compiler diagnostics; inspect ' + sandbox);
if (before) {
    assert.equal(result.code, 1);
    for (const text of ['ILLUSION_LIFECYCLE FAIL', 'EXPECTED BASELINE PATH ERROR: *illusion: invalid or expired room path.',
        'FAIL: expired demon no longer blocks room cleanup', 'FAIL: actual driver heartbeat recycles expired demon'])
        assert.ok(result.output.includes(text), 'Missing specific negative control: ' + text);
    const expected = new Set([
        'expired demon no longer blocks room cleanup',
        'normal room cleanup recycles stale demon and its inventory',
        'expired movement does not load rejected destination',
        'expired movement recycles demon',
        'expired movement produces no repeated go log',
        'expired heartbeat recycles before death or combat',
        'destroyed owner safely retires leftover demon',
        'daemon replacement safely retires obsolete session demon',
        'actual driver heartbeat recycles expired demon',
        'heartbeat recovery does not log failed routes',
    ]);
    for (const line of result.output.split(/\r?\n/).filter(line => line.startsWith('FAIL: ')))
        assert.ok(expected.has(line.slice(6)), 'Unexpected baseline failure: ' + line);
    console.log('ILLUSION_LIFECYCLE BEFORE: expected lifecycle defects reproduced');
} else {
    assert.equal(result.code, 0, 'Driver failed; inspect ' + sandbox);
    assert.ok(result.output.includes('ILLUSION_LIFECYCLE PASS'), 'Incomplete lifecycle regression');
}
