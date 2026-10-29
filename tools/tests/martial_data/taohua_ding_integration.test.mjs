import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { mingjiaoJiuyangFusionProbes, restoreMingjiaoJiuyangFusionProbes }
    from './school_mingjiao_jiuyang_fusion_probes.mjs';
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
    // Only the separately reviewed yanlian probe is projected out of the old 15/48 baseline.
    const fusionPath = 'cmds/skill/yanlian.c';
    const fusionProbes = snapshot.probes.filter(p => p.path === fusionPath);
    assert.equal(fusionProbes.length, 1);
    const fusionSource = read(fusionPath);
    const prepared = mingjiaoJiuyangFusionProbes(fusionSource, { collectionGroup: 'mingjiao-jiuyang-fusion' });
    assert.equal(prepared.sites.length, 17);
    assert.deepEqual(fusionProbes[0], { path: fusionPath, before: sha256(fusionSource),
        after: sha256(prepared.changed), sites: prepared.sites });
    assert.equal(snapshot.files[fusionPath], sha256(fusionSource));
    assert.equal(restoreMingjiaoJiuyangFusionProbes(prepared.changed), fusionSource);
    for (const name of [
        'school_mingjiao_jiuyang_fusion_cases.mjs',
        'school_mingjiao_jiuyang_fusion_cases.test.mjs',
        'school_mingjiao_jiuyang_fusion_observation.mjs',
        'school_mingjiao_jiuyang_fusion_observation.test.mjs',
        'school_mingjiao_jiuyang_fusion_probes.mjs',
        'school_mingjiao_jiuyang_fusion_probes.test.mjs',
        'school_mingjiao_jiuyang_fusion_record.mjs',
        'school_mingjiao_jiuyang_fusion_record.test.mjs',
        'school_mingjiao_jiuyang_fusion_report.mjs',
        'school_mingjiao_jiuyang_fusion_report.test.mjs',
        'school_mingjiao_jiuyang_fusion_integration.test.mjs',
        'jiuyang_fusion_receivers.h',
    ]) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(snapshot.files[path], sha256(read(path)), path);
    }
    const historicalProbes = snapshot.probes.filter(p => p.path !== fusionPath);
    assert.equal(historicalProbes.length, 15);
    assert.equal(sha256(JSON.stringify(historicalProbes)),
        'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    assert.equal(historicalProbes.reduce((n, p) => n + p.sites.length, 0), 48);
    const probe = snapshot.probes.find(p => p.path === 'kungfu/skill/tanzhi-shentong/ding.c');
    assert.equal(probe.before, sha256(read(probe.path)));
    assert.equal(probe.sites.length, 2);
    assert.notEqual(probe.before, probe.after);
});

test('实际caller只在observe_callback入口读，快照/精确目标/禁招字段不伪造', () => {
    const actual = body('observe_callback');
    const forceExpiry = "    if (active && is_mingjiao_force_remaining()) {\n"
        + "        require(current[\"parameters\"][\"panel\"] == \"expiry\" && me == players[0] && previous_object() == me,\n"
        + "            \"original force expiry USER callback\");\n"
        + "        if (phase == \"before\") begin_force_event(\"expiry\");\n"
        + "        current[\"callbacks\"] += ({ ([ \"side\": 0, \"phase\": phase,\n"
        + "            \"elapsed\": time_ns() / 1000000000.0 - started, \"state\": snapshot(me) ]) });\n"
        + "        if (phase == \"after\") {\n"
        + "            end_force_event(\"expiry\");\n"
        + "            // The original eval_function and its remove_effect have returned.\n"
        + "            // Do not replace this with a call at the predicted delay.\n"
        + "            call_out(\"finish_sample\", 0);\n"
        + "        }\n"
        + "        return;\n"
        + "    }\n";
    assert.equal(actual.split(forceExpiry).length, 2, 'one exact force-expiry callback branch');
    assert.equal(body('is_mingjiao_force_remaining').replace(/\s+/g, ' ').trim(),
        'int is_mingjiao_force_remaining() { return mapp(current) && mapp(current["parameters"]) && current["parameters"]["collection_group"] == "mingjiao-force-remaining"; }');
    const fn = actual.replace(forceExpiry, '');
    assert.match(fn, /owner = previous_object\(\)/);
    assert.match(fn, /frames = call_stack\(2\)/);
    assert.ok(fn.indexOf('frames = call_stack(2)') < fn.indexOf('taohua_ding_callback(me, phase, owner, frames[1])'));
    assert.match(body('snapshot'), /return taohua_ding_snapshot\(ob, result\)/);
    assert.match(body('prepare_actor'), /present\(side \? "right" : "left", this_object\(\)\) == ob/);
    assert.match(body('prepare_actor'), /force_me\("enable finger tanzhi-shentong"\)/);
    assert.doesNotMatch(fn, /call_out\(|delete_temp\(|"ding_end"/);
});

test('公共早拒绝只读取实际notify_fail，不造技能launch或替代原perform', () => {
    assert.equal(body('is_mingjiao_remaining_perform').replace(/\s+/g, ' ').trim(),
        'private int is_mingjiao_remaining_perform() { return current["parameters"]["collection_group"] == "mingjiao-remaining-perform"; }',
        'project only the exact remaining-perform group');
    const actual = body('perform_sample');
    // Remove only the exact new-group disjunct; the historical refusal gate stays unchanged.
    const remainingGate = 'current["parameters"]["collection_group"] == "mingjiao-jiuyang-remaining" ||\n'
        + '            is_mingjiao_remaining_perform()';
    assert.equal(actual.split(remainingGate).length, 2, 'one exact remaining-perform refusal disjunct');
    const fn = actual.replace(remainingGate,
        'current["parameters"]["collection_group"] == "mingjiao-jiuyang-remaining"');
    const start = fn.search(/if \(\(is_taohua_ding\(\) \|\| is_taohua_zhuan\(\) \|\|\s+current\["parameters"\]\["collection_group"\] == "s1-duan-perform"\s+\|\|\s+current\["parameters"\]\["collection_group"\] == "s1-piaoxu"\s+\|\|\s+current\["parameters"\]\["collection_group"\] == "s1-panlong-tan"\s+\|\|\s+current\["parameters"\]\["collection_group"\] == "mingjiao-shenghuo"\s+\|\|\s+current\["parameters"\]\["collection_group"\] == "mingjiao-ling-perform"\s+\|\|\s+current\["parameters"\]\["collection_group"\] == "mingjiao-jiuyang-direct"\s+\|\|\s+current\["parameters"\]\["collection_group"\] == "mingjiao-jiuyang-remaining"\) &&\s+!result && !sizeof\(current\["refusals"\]\)\)/);
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
