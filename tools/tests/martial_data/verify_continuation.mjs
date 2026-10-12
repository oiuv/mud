// Explicit real-driver verification; all writes remain in fresh temporary copies.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { resumeCollection, runAbilities, runWeapons } from './execution.mjs';
import { coverage, openSeries, readSamples } from './ledger.mjs';

const driver = resolve(process.argv[2] ?? join(root, 'bin/driver.exe'));
const temp = () => mkdtempSync(join(tmpdir(), 'mud-martial-continuation-'));
const hashes = directory => Object.fromEntries(readdirSync(join(directory, 'samples'))
    .map(name => [name, readFileSync(join(directory, 'samples', name), 'utf8')]));
const runs = directory => readdirSync(join(directory, 'runs')).map(name => join(directory, 'runs', name));

console.log('续跑验收：真实驱动、临时角色；含主动中断及故障注入，绝不作为游戏错误登记。');
const interrupted = temp(), options = { driver, smoke: true, case: 'ability-powerup-expiry' };
await assert.rejects(runAbilities(root, interrupted, { ...options, interruptAfter: 1 }), /已中断/);
let manifest = openSeries(interrupted), records = readSamples(interrupted, manifest);
assert.equal(records.length, 1, '第一次中断应保留一个完整样本');
const original = hashes(interrupted);
await resumeCollection(root, interrupted, { driver });
assert.equal(coverage(interrupted).totals.recorded_samples, 2);
for (const [name, content] of Object.entries(original)) assert.equal(readFileSync(join(interrupted, 'samples', name), 'utf8'), content);
assert.equal(new Set(runs(interrupted).map(p => JSON.parse(readFileSync(join(p, 'result.json'))).process.pid)).size, 2);
const count = runs(interrupted).length;
await resumeCollection(root, interrupted, { driver });
assert.equal(runs(interrupted).length, count, '收齐后续跑不能再次发动技能');
console.log('INTERRUPT/RESUME PASS', interrupted);

for (const stage of ['action', 'callback']) {
    const directory = temp();
    const key = stage === 'action' ? 'sword-ordinary-l200-j0' : 'ability-powerup-expiry';
    const run = stage === 'action' ? runWeapons : runAbilities;
    await assert.rejects(run(root, directory, { driver, smoke: true, case: key,
        injectedFault: { condition_id: key, index: 0, stage } }), /含运行错误/);
    manifest = openSeries(directory); records = readSamples(directory, manifest).sort((a, b) => a.index - b.index);
    assert.deepEqual(records.map(r => r.outcome), ['error', 'observed']);
    assert.equal(records[0].raw.injected_fault, stage);
    assert.ok(!records[1].raw.before[0].temp.fixture_fault_poison);
    const attempts = runs(directory);
    assert.equal(attempts.length, 2);
    assert.equal(new Set(attempts.map(p => JSON.parse(readFileSync(join(p, 'result.json'))).process.pid)).size, 2);
    assert.equal(coverage(directory).totals.errors, 1);
    const preserved = hashes(directory);
    await assert.rejects(resumeCollection(root, directory, { driver }), /含运行错误/);
    assert.deepEqual(hashes(directory), preserved); assert.equal(runs(directory).length, 2);
    console.log('FAULT ISOLATION PASS', stage, directory);
}

// Simulate an interrupted last write without deleting any completed evidence.
const finalRun = runs(interrupted).at(-1);
writeFileSync(join(finalRun, 'mudlib/log/events.jsonl'), '{"partial":', { flag: 'a' });
await resumeCollection(root, interrupted, { driver });
assert.equal(coverage(interrupted).totals.recorded_samples, 2);
assert.equal(runs(interrupted).length, count);
console.log('PARTIAL TAIL PRESERVED PASS', interrupted);
console.log('MARTIAL CONTINUATION PASS');
