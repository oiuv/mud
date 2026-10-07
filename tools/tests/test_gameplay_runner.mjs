import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { root, suites, parseArgs, preflight, suiteArgs, parseResult, executeSuite, runSuites } from '../test_gameplay.mjs';

const options = parseArgs([]);
const outputFor = (suite, checks = 7, failures = 0) => suite.reconnect
    ? `${suite.prefix} PASS: ${checks} checks\n`
    : `${suite.prefix} CHECKS: ${checks} FAILURES: ${failures}\n${suite.prefix} ${failures ? 'FAIL' : 'PASS'}\n`;
const silent = () => {};

test('fixed seven positive suites, no discovery or baseline flags', () => {
    assert.deepEqual(suites.map(suite => suite.script), [
        'tools/tests/test_commerce_audit.mjs', 'tools/tests/test_weapon_combat.mjs',
        'tools/tests/test_martial_audit.mjs', 'ai/scripts/verify_lpc.mjs', 'ai/scripts/verify_npc_reconnect.mjs',
        'tools/tests/test_world_events.mjs',
        'tools/tests/test_identity_quest_rewards.mjs',
    ]);
    assert.deepEqual(suites.map(suite => suiteArgs(suite, options).length), [2, 2, 2, 3, 2, 2, 2]);
    for (const suite of suites) assert.equal(suiteArgs(suite, options)[1], options.driver);
    assert.equal(suiteArgs(suites[3], options)[2], options.python);
});

test('platform defaults and relative paths with spaces', () => {
    assert.equal(parseArgs([], root, 'win32').driver, join(root, 'bin/driver.exe'));
    assert.equal(parseArgs([], root, 'linux').driver, join(root, 'bin/driver'));
    assert.equal(parseArgs([], root, 'linux').python, join(root, 'ai/.venv/bin/python'));
    const cwd = join(tmpdir(), 'caller folder');
    const parsed = parseArgs(['--driver', 'engine folder/driver', '--python', 'python folder/python'], cwd);
    assert.equal(parsed.driver, resolve(cwd, 'engine folder/driver'));
    assert.equal(parsed.python, resolve(cwd, 'python folder/python'));
});

test('unknown, incomplete and duplicate options are rejected', () => {
    for (const args of [['--bad'], ['some-file'], ['--driver'], ['--python', '--help'],
        ['--driver', 'a', '--driver', 'b'], ['--help', '--help']]) assert.throws(() => parseArgs(args));
});

test('preflight checks dependencies without starting test processes', () => {
    const repository = mkdtempSync(join(tmpdir(), 'mud-runner-preflight-'));
    const local = { driver: join(repository, 'driver'), python: join(repository, 'python') };
    const put = file => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, 'fixture'); };
    let gitCalls = 0;
    const git = (...args) => { gitCalls++; assert.equal(args[0], 'git'); assert.deepEqual(args[1], ['--version']); };
    assert.throws(() => preflight(local, repository, git), /请先编译驱动/);
    put(local.driver);
    assert.throws(() => preflight(local, repository, git), /Python/);
    put(local.python);
    assert.throws(() => preflight(local, repository, git), /仓库测试文件/);
    for (const suite of suites) put(join(repository, suite.script));
    assert.throws(() => preflight(local, repository, git), /git submodule update --init/);
    for (const file of ['include/socket.h', 'include/ansi.h', 'system/kernel/simul_efun/json.c'])
        put(join(repository, 'mudcore', file));
    assert.equal(gitCalls, 0);
    preflight(local, repository, git);
    assert.equal(gitCalls, 1);
    assert.throws(() => preflight(local, repository, () => { throw new Error('missing'); }), /Git 不可用/);
});

test('help works outside repository without driver or Python', () => {
    const result = spawnSync(process.execPath, [join(root, 'tools/test_gameplay.mjs'),
        '--help', '--driver', 'does-not-exist', '--python', 'does-not-exist'], { cwd: tmpdir(), encoding: 'utf8' });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /用法/);
    assert.doesNotMatch(result.stdout, /回归汇总|Isolated/);
});

test('real CLI rejects unknown arguments and missing dependencies without running suites', () => {
    for (const args of [['--unknown'], ['--driver', join(tmpdir(), 'missing-regression-driver')]]) {
        const result = spawnSync(process.execPath, [join(root, 'tools/test_gameplay.mjs'), ...args], { encoding: 'utf8' });
        assert.equal(result.status, 1);
        assert.doesNotMatch(result.stdout, /Isolated|回归汇总/);
        assert.match(result.stderr, /未知参数|缺少文件/);
    }
});

for (const suite of suites) test('parse dynamic counts: ' + suite.name, () => {
    const result = parseResult(suite, 'Isolated example: C:/temp/中文 path\r\n' + outputFor(suite, 9), 0);
    assert.equal(result.ok, true);
    assert.equal(result.checks, 9);
    assert.equal(result.failures, 0);
    assert.equal(result.evidence, 'C:/temp/中文 path');
});

test('exit failure overrides PASS and retains known counts', () => {
    const result = parseResult(suites[0], outputFor(suites[0]), 1);
    assert.equal(result.ok, false);
    assert.equal(result.checks, 7);
    assert.match(result.reason, /退出码/);
});

test('failed assertions are reported, not converted to an incomplete zero', () => {
    const result = parseResult(suites[0], outputFor(suites[0], 7, 2), 1);
    assert.equal(result.ok, false);
    assert.equal(result.checks, 7);
    assert.equal(result.failures, 2);
});

test('missing, conflicting, empty or invalid counts cannot pass', () => {
    for (const output of ['', 'COMMERCE_AUDIT PASS\n', outputFor(suites[0], 0),
        outputFor(suites[0], 3, 4), outputFor(suites[0], Number.MAX_SAFE_INTEGER + 1),
        outputFor(suites[0], 4) + outputFor(suites[0], 5)]) {
        const result = parseResult(suites[0], output, 0);
        assert.equal(result.ok, false);
        assert.equal(result.checks, null);
        assert.equal(result.failures, null);
    }
});

test('missing or contradictory PASS/FAIL markers cannot pass', () => {
    for (const output of ['COMMERCE_AUDIT CHECKS: 3 FAILURES: 0\n',
        outputFor(suites[0]) + 'COMMERCE_AUDIT FAIL\n']) assert.equal(parseResult(suites[0], output, 0).ok, false);
    assert.equal(parseResult(suites[4], outputFor(suites[4]) + 'AI NPC RECONNECT FAIL\n', 0).ok, false);
});

test('signal or launch error cannot pass with otherwise valid output', () => {
    assert.equal(parseResult(suites[0], outputFor(suites[0]), 0, 'SIGTERM').ok, false);
    assert.equal(parseResult(suites[0], outputFor(suites[0]), 0, null, 'spawn error').ok, false);
});

test('repeated identical summary does not double count', () => {
    const result = parseResult(suites[0], outputFor(suites[0]) + outputFor(suites[0]), 0);
    assert.equal(result.ok, true);
    assert.equal(result.checks, 7);
});

test('real Node child preserves cwd, argv, Chinese stdout/stderr and space paths', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'mud runner child '));
    const file = join(directory, 'child script.mjs');
    writeFileSync(file, 'console.log(JSON.stringify({ cwd: process.cwd(), args: process.argv.slice(2) }));\n'
        + 'console.log("中文输出"); console.error("中文诊断");\n');
    let forwarded = '';
    const suite = { script: file, python: true };
    const expected = { driver: join(directory, 'driver file'), python: join(directory, 'python file') };
    const child = await executeSuite(suite, expected, text => { forwarded += text; });
    assert.equal(child.code, 0);
    const line = child.output.split(/\r?\n/).find(text => text.startsWith('{'));
    assert.deepEqual(JSON.parse(line), { cwd: root, args: [expected.driver, expected.python] });
    assert.match(forwarded, /中文输出/);
    assert.match(forwarded, /中文诊断/);
});

test('runs sequentially and sums actual counts, never the historical total', async () => {
    const seen = [];
    let active = false, text = '';
    const result = await runSuites(options, { write: chunk => { text += chunk; }, execute: async suite => {
        assert.equal(active, false); active = true;
        await new Promise(resolveDone => setImmediate(resolveDone));
        active = false; seen.push(suite.name);
        return { code: 0, output: outputFor(suite, seen.length) };
    } });
    assert.deepEqual(seen, suites.map(suite => suite.name));
    assert.equal(result.exitCode, 0);
    assert.equal(result.checks, 28);
    assert.match(text, /7\/7 组通过/);
    assert.doesNotMatch(text, /788/);
});

test('assertion failure, missing summary and thrown spawn error all allow later groups', async () => {
    let index = 0, text = '';
    const result = await runSuites(options, { write: chunk => { text += chunk; }, execute: async suite => {
        index++;
        if (index === 1) return { code: 1, output: outputFor(suite, 7, 2) };
        if (index === 2) return { code: 0, output: '' };
        if (index === 3) throw new Error('cannot spawn');
        return { code: 0, output: 'Isolated test: C:/temp/proof\n' + outputFor(suite, 3) };
    } });
    assert.equal(index, 7);
    assert.equal(result.exitCode, 1);
    assert.equal(result.checks, 19);
    assert.equal(result.failures, 2);
    assert.equal(result.unknown, 2);
    assert.match(text, /未知/);
    assert.match(text, /证据目录：C:\/temp\/proof/);
    assert.match(text, /总结果：失败/);
});

test('interrupt waits for active suite and never starts another', async () => {
    const controller = new AbortController();
    let calls = 0, finished = false, text = '';
    const result = await runSuites(options, { signal: controller.signal,
        write: chunk => { text += chunk; }, execute: async suite => {
            calls++; controller.abort('SIGINT');
            await new Promise(resolveDone => setImmediate(resolveDone)); finished = true;
            return { code: 0, output: outputFor(suite) };
        } });
    assert.equal(finished, true);
    assert.equal(calls, 1);
    assert.equal(result.exitCode, 130);
    assert.match(text, /未运行/);
    assert.match(text, /总结果：已中断/);
});

test('pre-aborted run starts no process and SIGTERM uses nonzero exit', async () => {
    const controller = new AbortController(); controller.abort('SIGTERM');
    const result = await runSuites(options, { signal: controller.signal, write: silent,
        execute: () => assert.fail('must not start') });
    assert.equal(result.exitCode, 143);
    assert.equal(result.results.length, 0);
});
