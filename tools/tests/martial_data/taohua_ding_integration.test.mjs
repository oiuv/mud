import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { taohuaDingConditions } from './school_taohua_ding_cases.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { taohuaDingReport } from './school_taohua_ding_report.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';
import { summarizeSamples } from './statistics.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const runner = read('tools/tests/martial_data/runner.lpc');
const body = name => {
    const match = new RegExp('(?:private\\s+)?(?:int|void|mapping)\\s+' + name
        + '\\([^;]*?\\)\\s*\\{').exec(runner);
    assert.ok(match, 'actual definition: ' + name);
    const end = runner.indexOf('\n}\n', match.index);
    assert.ok(end > match.index, 'complete function: ' + name);
    return runner.slice(match.index, end + 3);
};

test('DING历史15752窗口仅尾追加22条件；矩阵与旧15730窗口次数保持', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke }).slice(0, 15752);
        assert.equal(all.length, 15752);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        const tail = all.slice(15730);
        assert.deepEqual(tail, taohuaDingConditions(catalog, read, { smoke }));
        assert.equal(sha256(JSON.stringify(tail)), smoke
            ? '60b1984b8a1c996afb99ee0d7594b3a0b9b4aa23e88df5f2ff06e26cb5cdf624'
            : '0fc7550bd2d034e5557e9eaba77d1d7e87de9e3c6baaedfd53363b8246950c11');
        assert.equal(all.slice(0, 15730).reduce((n, c) => n + c.samples, 0), smoke ? 25955 : 409714);
        assert.equal(all.reduce((n, c) => n + c.samples, 0), smoke ? 25999 : 410444);
    }
});

test('15隔离处理文件48接点；DING真实原件/头/接线依赖冻结且探针可逆', () => {
    const snapshot = createSandbox(root);
    for (const name of ['taohua_ding_receivers.h', 'taohua_ding_receivers.test.mjs',
        'taohua_ding_probes.mjs', 'taohua_ding_probes.test.mjs', 'taohua_ding_integration.test.mjs',
        'school_taohua_ding_report.mjs', 'school_taohua_ding_report.test.mjs',
        'school_taohua_ding_cases.mjs', 'school_taohua_ding.test.mjs'])
        assert.equal(snapshot.files['tools/tests/martial_data/' + name], sha256(read('tools/tests/martial_data/' + name)));
    assert.equal(snapshot.probes.length, 15);
    assert.equal(snapshot.probes.reduce((n, p) => n + p.sites.length, 0), 48);
    const probe = snapshot.probes.find(p => p.path === 'kungfu/skill/tanzhi-shentong/ding.c');
    assert.equal(probe.before, sha256(read(probe.path)));
    assert.equal(probe.sites.length, 2);
    assert.notEqual(probe.before, probe.after);
});

test('实际caller只在observe_callback入口读，快照/精确目标/禁招字段不伪造', () => {
    const fn = body('observe_callback');
    assert.match(fn, /owner = previous_object\(\)/);
    assert.match(fn, /frames = call_stack\(2\)/);
    assert.ok(fn.indexOf('frames = call_stack(2)') < fn.indexOf('taohua_ding_callback(me, phase, owner, frames[1])'));
    assert.match(body('snapshot'), /return taohua_ding_snapshot\(ob, result\)/);
    assert.match(body('prepare_actor'), /present\(side \? "right" : "left", this_object\(\)\) == ob/);
    assert.match(body('prepare_actor'), /force_me\("enable finger tanzhi-shentong"\)/);
    assert.doesNotMatch(fn, /call_out\(|delete_temp\(|"ding_end"/);
});

test('公共早拒绝只读取实际notify_fail，不造技能launch或替代原perform', () => {
    const fn = body('perform_sample');
    const start = fn.indexOf('if ((is_taohua_ding() || is_taohua_zhuan()) && !result && !sizeof(current["refusals"]))');
    assert.ok(start >= 0);
    const gate = fn.slice(start).split('\n        }')[0];
    assert.match(gate, /players\[0\]->query_temp\("notify_fail"\)/);
    assert.match(gate, /"reason": reason/);
    assert.doesNotMatch(gate, /observe_launch|"launches"|->perform\(|"技能入口未/);
    assert.match(body('observe_direct'), /"taohua-ding"/);
    assert.match(body('advance'), /"taohua-ding"/);
});

test('真实执行入口逐键核source_evidence，不给缺少qualification_sources补空数组', () => {
    const conditions = taohuaDingConditions(catalog, read);
    const files = { ...conditions[0].parameters.source_evidence };
    validateQualificationSources(conditions, files);
    const path = 'data/e2c_dict.o';
    assert.throws(() => validateQualificationSources(conditions, { ...files, [path]: undefined }));
    assert.throws(() => validateQualificationSources(conditions, { ...files, [path]: '0'.repeat(64) }));
    for (const mutate of [c => delete c.parameters.source_evidence,
        c => delete c.parameters.source_evidence[path],
        c => c.parameters.source_evidence[path] = '',
        c => c.parameters.source_evidence['data/private.o'] = '0'.repeat(64)]) {
        const changed = structuredClone(conditions); mutate(changed[0]);
        assert.throws(() => validateQualificationSources(changed, files));
    }
    assert.throws(() => validateQualificationSources([{ parameters: {} }], files));
});

test('正式学校报告接本组独立语义专节，空样本的费用和自然解除保持未知', () => {
    const condition = taohuaDingConditions(catalog, read)[0];
    const taohua_ding = taohuaDingReport([], condition);
    const result = schoolCombatMarkdown({ fingerprint: 'synthetic', evidence_sha256: 'synthetic',
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 },
        conditions: [{ ...condition, taohua_ding, effects: null }] });
    assert.match(result, /桃花岛·弹指神通「定昆仑」/);
    assert.match(result, /原值是执行成本/);
    assert.match(result, /禁招与忙乱不是同一状态/);
    assert.match(result, /未观察（n=0，未知=0）/);
    assert.equal(taohua_ding.coverage.missing, 100);
});

test('正式消费端传原冻结condition，不能误传仅有planned的汇总对象', () => {
    const condition = taohuaDingConditions(catalog, read)[0];
    const summary = summarizeSamples({ identity: { conditions: [condition], execution: {} } }, []);
    assert.equal(summary.conditions[0].samples, undefined);
    assert.equal(summary.conditions[0].planned, condition.samples);
    assert.throws(() => taohuaDingReport([], summary.conditions[0]));
    assert.equal(taohuaDingReport([], condition).coverage.planned, condition.samples);
    assert.match(read('tools/tests/martial_data/school_combat_report.mjs'),
        /condition\.taohua_ding = taohuaDingReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\)/);
});
