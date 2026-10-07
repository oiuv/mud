// Production scheduler/events in a disposable MUDLIB. Clock controls exist only here.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = process.argv.includes('--integrity-baseline');
const driver = resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-world-events-'));
console.log('Isolated world events: ' + sandbox + (baseline ? ' (b85d40ff integrity baseline)' : ''));
const source = file => readFileSync(join(root, file), 'utf8');
const git = (dir, args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
const put = (file, text) => {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    writeFileSync(join(sandbox, file), text, 'utf8');
};
const files = new Set([...git(root, ['ls-files', '-z']).split('\0'),
    ...git(root, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0'),
    ...git(join(root, 'mudcore'), ['ls-files', '-z']).split('\0').map(file => 'mudcore/' + file)]);
for (const file of files) {
    if (!/\.(?:c|lpc|h)$/.test(file) || !/^(?:adm|feature|include|inherit|std|mudcore)\//.test(file)
        || !existsSync(join(root, file)) || file.split('/').some(part => part === 'tests' || part.startsWith('.'))) continue;
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    cpSync(join(root, file), join(sandbox, file));
}
for (const dir of ['tests', 'data', 'log/static']) mkdirSync(join(sandbox, dir), { recursive: true });
if (baseline) for (const file of ['adm/daemons/eventd.c', 'adm/daemons/event/wuliang.c', 'adm/daemons/timed.c'])
    put(file, git(root, ['show', 'b85d40ff:' + file]));
const hostClock = readFileSync(join(sandbox, 'adm/daemons/timed.c'), 'utf8');
for (const file of ['clock', 'probe', 'wall_clock'])
    put(`tests/${file}.lpc`, source(`tools/tests/world_events/${file}.lpc`));
put('adm/daemons/natured.c', '#include <localtime.h>\n'
    + 'mixed *query_localtime() { return TIME_D->query_game_time(); }\n');
put('adm/daemons/channeld.c', 'void do_channel(object ob, string name, string msg) {}\n');
// Count entry to the actual reward body, without depending on a random prize.
let copied = readFileSync(join(sandbox, 'adm/daemons/event/wuliang.c'), 'utf8');
assert.equal(copied.split('do_bonus(room);').length, 2);
copied = copied.replace('do_bonus(room);', '{ "/tests/regression"->record_bonus(); do_bonus(room); }');
put('adm/daemons/event/wuliang.c', copied);
put('d/wanjiegu/wlhoushan.lpc', 'inherit ROOM;\n');
const listener = createServer();
await new Promise((done, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', done); });
const port = listener.address().port;
await new Promise(done => listener.close(done));
let checks = 0, failures = 0;
for (const [fixture, label] of [['regression', 'WORLD_CALENDAR'], ['host', 'WORLD_CLOCK'], ['restart', 'WORLD_RESTART']]) {
    put('tests/master.lpc', source('tools/tests/weapon_classification/startup_master.lpc')
        .replaceAll('WEAPON_STARTUP', label));
    put('tests/regression.lpc', source(`tools/tests/world_events/${fixture}.lpc`));
    // Only the temporary copy substitutes wall-clock input; all host logic stays real.
    put('adm/daemons/timed.c', fixture === 'regression' ? 'inherit "/tests/clock";\n'
        : hostClock.replace(/\btime\(\)/g, '"/tests/wall_clock"->query_now()'));
    put('driver.cfg', ['name : World Events Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
        'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log',
        'debug log file : ' + fixture + '.log',
        'master file : /tests/master', 'simulated efun file : /adm/single/simul_efun',
        'include directories : /include:/mudcore/include', 'global include file : <globals.h>', 'gametick msec : 100',
    ].join('\n') + '\n');
    const result = await new Promise((done, reject) => {
        const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
        let output = '';
        const timer = setTimeout(() => child.kill(), 60000);
        child.stdout.on('data', data => { output += data; });
        child.stderr.on('data', data => { output += data; });
        child.on('error', error => { clearTimeout(timer); reject(error); });
        child.on('close', code => { clearTimeout(timer); done({ code, output }); });
    });
    put(`${fixture}-output.txt`, result.output);
    const log = join(sandbox, `log/${fixture}.log`);
    const diagnostics = result.output + (existsSync(log) ? readFileSync(log, 'utf8') : '');
    console.log(result.output.split(/\r?\n/).filter(line => /WORLD_|FAIL:|error:|warning:/i.test(line)).join('\n'));
    const counts = result.output.match(new RegExp(`${label} CHECKS: (\\d+) FAILURES: (\\d+)`));
    assert.ok(counts && Number(counts[1]) > 0, 'Incomplete regression; see ' + sandbox);
    assert.equal(result.code, Number(counts[2]) ? 1 : 0, 'Unexpected process exit; see ' + sandbox);
    assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line)
        && !/^WARNING: Platform doesn't support eval limit!$/.test(line)), 'LPC diagnostics; see ' + sandbox);
    checks += Number(counts[1]);
    failures += Number(counts[2]);
}
console.log(`WORLD_EVENTS CHECKS: ${checks} FAILURES: ${failures}`);
console.log(failures ? 'WORLD_EVENTS FAIL' : 'WORLD_EVENTS PASS');
process.exitCode = failures ? 1 : 0;
