// One real USER / one actual LF. Not a formal martial collection or keepalive framework.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createConnection, createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSandbox } from './martial_data/execution.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
if (args.includes('--help')) {
    console.log('node tools/tests/test_martial_idle_probe.mjs --output NEW_DIRECTORY [--driver PATH]\n'
        + 'Starts one isolated actual driver and USER, sends one LF after 3 seconds, observes 5 seconds.\n'
        + 'No formal series, game server, account data, model or fake clock. Output must not exist.');
    process.exit(0);
}
let driver = join(root, 'bin/driver.exe'), output;
for (let i = 0; i < args.length; i += 2) {
    assert.ok(['--driver', '--output'].includes(args[i]) && args[i + 1], 'unknown or missing argument');
    if (args[i] === '--driver') driver = resolve(args[i + 1]);
    else output = resolve(args[i + 1]);
}
assert.ok(output && !existsSync(output), 'explicit NEW output directory required');
assert.ok(existsSync(driver), 'driver absent');
mkdirSync(output, { recursive: true });
const wx = (name, value) => writeFileSync(join(output, name), typeof value === 'string'
    ? value : JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
const hash = value => createHash('sha256').update(value).digest('hex');
const paths = ['tools/tests/test_martial_idle_probe.mjs', 'tools/tests/martial_data/idle_probe_runner.lpc',
    'tools/tests/martial_data/execution.mjs', 'tools/tests/weapon_balance/master.lpc',
    'tools/tests/weapon_balance/actor.lpc', 'feature/alias.c', 'inherit/char/char.c'];
const sourceHashes = () => Object.fromEntries(paths.map(path => [path, hash(readFileSync(join(root, path)))]));
const before = sourceHashes();
wx('before.json', { sources: before, driver, driverSha256: hash(readFileSync(driver)),
    scope: 'actual driver input only; no base/force formal pass claim' });
const copyStarted = Date.now();
const { sandbox, files, probes } = createSandbox(root, output);
for (const [source, destination] of [
    ['tools/tests/weapon_balance/master.lpc', 'tests/master.lpc'],
    ['tools/tests/weapon_balance/actor.lpc', 'tests/actor.lpc'],
    ['tools/tests/martial_data/idle_probe_runner.lpc', 'tests/runner.lpc'],
]) writeFileSync(join(sandbox, destination), readFileSync(join(root, source)));
wx('sandbox.json', { files, probes, copyMs: Date.now() - copyStarted,
    overrides: ['tests/master.lpc', 'tests/actor.lpc', 'tests/runner.lpc'] });
const port = await new Promise((done, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => done(port)); });
});
writeFileSync(join(sandbox, 'driver.cfg'), ['name : Real LF Idle Probe', 'mud ip : 127.0.0.1',
    `port number : ${port}`, 'mudlib directory : .', 'log directory : /log',
    'debug log file : debug.log', 'master file : /tests/master',
    'simulated efun file : /adm/single/simul_efun',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>',
    'gametick msec : 1000', 'heartbeat interval msec : 1000', ''].join('\n'));
let stdout = '', stderr = '', socket, connected = false, send, networkError, timedOut = false;
const started = Date.now();
const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
const watchdog = setTimeout(() => { timedOut = true; child.kill(); }, 30000);
const receive = data => {
    stdout += data;
    if (!connected && stdout.includes('BALANCE WAITING') && stdout.includes('Initializations complete.')) {
        connected = true;
        socket = createConnection({ host: '127.0.0.1', port });
        socket.on('data', () => {});
        socket.on('error', error => {
            let phasesAtError;
            try {
                phasesAtError = readFileSync(join(sandbox, 'log/idle_probe.jsonl'), 'utf8')
                    .trim().split('\n').map(line => JSON.parse(line).phase);
            } catch { phasesAtError = null; }
            // Capture the state at the error, not eventual rows written after an early reset.
            networkError ??= { message: error.message, code: error.code,
                finishSeenAtError: stdout.includes('IDLE PROBE finish'), phasesAtError };
        });
    }
    if (!send && stdout.includes('IDLE PROBE before_lf')) {
        send = { hex: '0a', bytes: 1, wallTime: new Date().toISOString(),
            monotonicNs: process.hrtime.bigint().toString(), note: 'write attempt; native idle is acceptance evidence' };
        try { send.acceptedBySocket = socket.write(Buffer.from([0x0a])); }
        catch (error) { send.error = error.message; }
    }
};
child.stdout.on('data', receive);
child.stderr.on('data', data => { stderr += data; });
const outcome = await new Promise(done => {
    child.once('error', error => done({ code: null, signal: null, spawnError: error.message }));
    child.once('close', (code, signal) => done({ code, signal }));
});
clearTimeout(watchdog);
socket?.destroy();
wx('stdout.log', stdout); wx('stderr.log', stderr);
const rawPath = join(sandbox, 'log/idle_probe.jsonl');
const raw = existsSync(rawPath) ? readFileSync(rawPath, 'utf8') : '';
wx('observations.jsonl', raw);
if (existsSync(join(sandbox, 'log/debug.log'))) wx('debug.log', readFileSync(join(sandbox, 'log/debug.log'), 'utf8'));
const result = { outcome, elapsedMs: Date.now() - started, timedOut, networkError: networkError ?? null,
    send: send ?? null, status: 'fail', assertions: [], afterSources: sourceHashes() };
try {
    assert.equal(outcome.code, 0); assert.equal(outcome.signal, null); assert.equal(timedOut, false);
    assert.ok(send && !send.error);
    assert.equal(send.hex, '0a');
    const rows = raw.trim().split('\n').map(line => JSON.parse(line));
    assert.deepEqual(rows.map(row => row.phase), ['connected', 'before_lf', 'after_lf', 'finish']);
    if (networkError) {
        assert.equal(networkError.code, 'ECONNRESET', 'only normal driver shutdown reset can be classified');
        assert.equal(networkError.finishSeenAtError, true, 'early reset must fail');
        assert.deepEqual(networkError.phasesAtError, ['connected', 'before_lf', 'after_lf', 'finish'],
            'all four native observations must already exist at reset');
        result.networkErrorClassification = 'after native finish and four rows; driver shutdown(0)';
    }
    const [initial, beforeLf, afterLf, finish] = rows;
    for (const row of rows) {
        assert.ok(row.clock_lower <= row.clock_upper);
        assert.equal(row.hb_before, row.hb_after, 'original heartbeat must complete');
        assert.deepEqual(row.state, initial.state, 'actor resource/skills/learning/busy projection');
        assert.deepEqual(row.counters, {}, 'no hidden resource costs or recoveries');
        assert.equal(row.state.interactive, 1); assert.equal(row.state.player, 1);
        assert.equal(row.state.living, 1); assert.equal(row.state.busy, 0); assert.equal(row.state.fighting, 0);
    }
    assert.ok(beforeLf.idle >= 2 && beforeLf.idle > initial.idle, 'idle naturally grows');
    assert.ok(afterLf.idle <= 1 && afterLf.idle < beforeLf.idle, 'actual LF resets native idle');
    assert.ok(beforeLf.hb_after >= 1 && finish.hb_after > beforeLf.hb_after, 'original HB continues across LF');
    assert.ok(finish.clock_lower - initial.clock_upper >= 4 && finish.clock_upper - initial.clock_lower <= 8);
    assert.deepEqual(result.afterSources, before, 'observed source inputs unchanged');
    result.status = 'pass';
    result.assertions = ['natural idle growth', 'one real LF accepted by native idle drop',
        'original USER HB continues', 'resource/skill/learning/busy projection unchanged', 'source inputs unchanged'];
} catch (error) { result.failure = error.message; }
wx('result.json', result);
console.log(JSON.stringify({ status: result.status, output, outcome, elapsedMs: result.elapsedMs,
    failure: result.failure ?? null }, null, 2));
process.exitCode = result.status === 'pass' ? 0 : 1;
