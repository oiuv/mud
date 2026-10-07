import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, writeFileSync, mkdtempSync, symlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { parseArgs, outsideRepository, root, applyProbes } from '../../bench_weapon_balance.mjs';
import { distribution, probability, efficiency, compareBatches, validateRun, summarize } from './statistics.mjs';

test('参数、帮助及无效驱动不启动游戏', () => {
    assert.equal(parseArgs([]).samples, 100);
    assert.equal(parseArgs(['--smoke']).bouts, 2);
    assert.equal(parseArgs(['--smoke', '--samples', '7']).samples, 7);
    for (const args of [['--unknown'], ['--samples'], ['--samples', '0'], ['--duration', 'NaN'], ['--bouts', '1.5']])
        assert.throws(() => parseArgs(args));
    const help = execFileSync(process.execPath, [join(root, 'tools/bench_weapon_balance.mjs'), '--help'], { encoding: 'utf8' });
    assert.ok(help.includes('仅显示帮助') && !help.includes('隔离兵器评测：'));
    const bad = spawnSync(process.execPath, [join(root, 'tools/bench_weapon_balance.mjs'), '--driver', join(root, 'missing-driver')], { encoding: 'utf8' });
    assert.notEqual(bad.status, 0);
    assert.ok(!bad.stdout.includes('隔离兵器评测：'));
});

test('输出拒绝仓库、子模块、已有结果和 junction 等价路径', () => {
    for (const path of [root, join(root, 'mudcore/new-benchmark'), join(root, 'temp/new-benchmark')])
        assert.throws(() => outsideRepository(path));
    const temporary = mkdtempSync(join(tmpdir(), 'weapon-balance-cli-'));
    assert.throws(() => outsideRepository(temporary));
    const link = join(temporary, 'repository');
    symlinkSync(root, link, 'junction');
    assert.throws(() => outsideRepository(join(link, 'outside-by-name')));
    assert.equal(outsideRepository(join(temporary, 'fresh')), join(temporary, 'fresh'));
});

test('观测探针可逐字还原原战斗代码，没有替换随机或公式', () => {
    const original = readFileSync(join(root, 'adm/daemons/combatd.c'), 'utf8');
    const { changed, sites } = applyProbes(original);
    let restored = changed;
    for (const [, insert] of sites) restored = restored.replace(insert, '');
    assert.equal(restored, original);
    assert.equal(changed.match(/random\(/g).length, original.match(/random\(/g).length);
    assert.throws(() => applyProbes('different source'));
});

test('均值、中位数、线性分位数、Wilson 区间和零分母', () => {
    assert.deepEqual(distribution([0, 2, 4, 6, 8]), { n: 5, mean: 4, median: 4, p10: 0.8, p90: 7.2 });
    assert.equal(distribution([]).mean, null);
    assert.throws(() => distribution([NaN]));
    assert.equal(efficiency(100, 0), null);
    assert.equal(efficiency(100, 50), 2);
    assert.equal(probability(0, 0).wilson95, null);
    assert.equal(probability(5, 10).rate, 0.5);
    assert.ok(probability(0, 10).wilson95[1] > 0);
    assert.throws(() => probability(11, 10));
});

function completeRun() {
    const records = [{ kind: 'preflight', ok: 1 }];
    for (let c = 0; c < 40; c++) {
        const bout = c >= 28;
        records.push({ kind: 'sample', id: String(c), condition: (bout ? 'bout:' : 'single:') + c,
            mode: bout ? 'bout' : 'ordinary', error: '', fresh: 1, elapsed: 1,
            before: [{ qi: 0, eff_qi: 0, neili: 0, jing: 0, eff_jing: 0 }, { qi: 0, eff_qi: 0, neili: 0, jing: 0, eff_jing: 0 }],
            after: [{ qi: 0, eff_qi: 0, neili: 0, jing: 0, eff_jing: 0 }, { qi: 0, eff_qi: 0, neili: 0, jing: 0, eff_jing: 0 }],
            metrics: [{}, {}], busy_seconds: [0, 0], first_actor: 0,
            first: 0, index: 0, terminal: 'time_limit', winner: -1 });
    }
    return { result: { code: 0, text: 'BALANCE PASS' }, diagnostics: '', records, parameters: { samples: 1, bouts: 1 } };
}

test('缺样本、状态残留、异常退出、诊断和截尾伪胜均阻止发布', () => {
    validateRun(completeRun());
    const faults = [r => r.records.pop(), r => { r.result.code = 1; },
        r => { r.records[1].fresh = 0; }, r => { r.records[1].error = 'runtime'; },
        r => { r.diagnostics = 'warning: incompatible'; }, r => { r.result.text = 'WATCHDOG'; },
        r => { r.records.at(-1).winner = 0; }, r => { r.records.at(-1).first = 1; },
        r => { r.records.at(-1).metrics[0].neili_cost = 10; }];
    for (const fault of faults) { const r = completeRun(); fault(r); assert.throws(() => validateRun(r)); }
    compareBatches({ status: 'passed', fingerprint: 'a' }, { status: 'passed', fingerprint: 'a' });
    assert.throws(() => compareBatches({ status: 'passed', fingerprint: 'a' }, { status: 'passed', fingerprint: 'b' }));
});

test('汇总保留拒绝与截尾，气血创伤不相加，消耗恢复各列', () => {
    const base = { kind: 'sample', condition: 'perform:0:jiali0', mode: 'perform', launched: 1,
        elapsed: 0.01, error: '', terminal: 'single', winner: -1, busy_seconds: [0, 0],
        before: [{ qi: 100, eff_qi: 100 }, { qi: 100, eff_qi: 100 }],
        after: [{ qi: 100, eff_qi: 100, busy: 3 }, { qi: 80, eff_qi: 90, busy: 0 }],
        metrics: [{ neili_cost: 50, neili_recovery: 10, direct: 1, perform_launched: 1 }, {}] };
    const refused = structuredClone(base);
    refused.launched = 0; refused.metrics = [{}, {}];
    refused.after[1] = { qi: 100, eff_qi: 100, busy: 0 };
    const [summary] = summarize([base, refused]);
    assert.equal(summary.n, 2); assert.equal(summary.refused, 1);
    assert.equal(summary.sides[0].qi_loss_inflicted.mean, 10);
    assert.equal(summary.sides[0].eff_qi_loss_inflicted.mean, 5);
    assert.equal(summary.sides[0].damage_per_neili, 0.4);
    assert.equal(summary.sides[0].neili_recovery.mean, 5);
    assert.equal(summary.sides[0].wins.rate, null);
    const bout = { ...base, mode: 'bout', terminal: 'time_limit' };
    const [unfinished] = summarize([bout]);
    assert.equal(unfinished.censored, 1);
    assert.equal(unfinished.sides[0].wins.successes, 0);
    assert.equal(unfinished.sides[1].wins.successes, 0);
});

test('故障注入在独立验证进程非零退出，保留部分证据供复核', () => {
    const directory = mkdtempSync(join(tmpdir(), 'weapon-balance-faults-'));
    const moduleURL = pathToFileURL(join(root, 'tools/tests/weapon_balance/statistics.mjs')).href;
    for (const [name, mutate] of [
        ['driver-exit', r => { r.result.code = 2; }],
        ['diagnostics', r => { r.diagnostics = 'error: injected'; }],
        ['missing-sample', r => r.records.pop()],
        ['residual-state', r => { r.records[1].fresh = 0; }],
    ]) {
        const data = completeRun(); mutate(data);
        const file = join(directory, name + '.json');
        writeFileSync(file, JSON.stringify(data));
        const code = `import {readFileSync} from 'node:fs'; import {validateRun} from ${JSON.stringify(moduleURL)}; validateRun(JSON.parse(readFileSync(process.argv[1], 'utf8')));`;
        const result = spawnSync(process.execPath, ['--input-type=module', '-e', code, file], { encoding: 'utf8' });
        assert.notEqual(result.status, 0, name);
        assert.ok(existsSync(file), '失败现场不能被删除');
        assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), data);
    }
    const mismatch = spawnSync(process.execPath, ['--input-type=module', '-e',
        `import {compareBatches} from ${JSON.stringify(moduleURL)}; compareBatches({status:'passed',fingerprint:'A'},{status:'passed',fingerprint:'B'});`], { encoding: 'utf8' });
    assert.notEqual(mismatch.status, 0);
    console.log('Fault evidence: ' + directory);
});
