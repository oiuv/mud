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
import { taohuaXiaoConditions, taohuaXiaoSourcePaths } from './school_taohua_xiao_cases.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { taohuaXiaoReport } from './school_taohua_xiao_report.mjs';
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

test('历史XIAO15769窗口保持，完整旧15752正式/烟雾有序内容与原v4相同', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke }).slice(0, 15769);
        assert.equal(all.length, 15769);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(sha256(JSON.stringify(all.slice(0, 15752))), smoke
            ? '560d3fea811eea8218d3abe1fc55bd492aebdbd7a6265f687d529eedd9e750ca'
            : '5ab55c258bddc6616b8ea24c50cc9fc02a41f669346eacf0a6813fc7d49831af');
        const tail = all.slice(15752);
        assert.deepEqual(tail, taohuaXiaoConditions(catalog, { smoke }));
        assert.equal(sha256(JSON.stringify(tail)), smoke
            ? 'fb35782bfa6fbeb886ddf1918d2db2555a63133a1d4205fd73630ac5d54590e4'
            : 'e6852c55078ec1899c9981b3f259d6f2633e8f5d668ea4fb298cc3e37bd2539d');
        assert.equal(all.reduce((n, c) => n + c.samples, 0), smoke ? 26033 : 411164);
    }
});

test('新增头/条件/自检/报告依赖均冻结；原15文件48探针完整保持', () => {
    const snapshot = createSandbox(root);
    for (const name of ['taohua_xiao_receivers.h', 'taohua_xiao_integration.test.mjs',
        'school_taohua_xiao_cases.mjs', 'school_taohua_xiao.test.mjs',
        'school_taohua_xiao_report.mjs', 'school_taohua_xiao_report.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(snapshot.files[path], sha256(read(path)));
    }
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
    assert.equal(historicalProbes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(historicalProbes)),
        'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    assert.match(read('tools/tests/martial_data/execution.mjs'),
        /copy\('tools\/tests\/martial_data\/taohua_xiao_receivers\.h', 'tests\/taohua_xiao_receivers\.h'\)/);
});

test('XIAO来源沿用原26清单及两原摘要，不增加缺省空源或修改矩阵', () => {
    const conditions = taohuaXiaoConditions(catalog);
    const files = Object.fromEntries(taohuaXiaoSourcePaths.map(path => [path, sha256(read(path))]));
    validateQualificationSources(conditions, files);
    for (const path of taohuaXiaoSourcePaths)
        assert.throws(() => validateQualificationSources(conditions, { ...files, [path]: undefined }));
    for (const mutate of [c => c.parameters.qualification_sources.pop(),
        c => c.parameters.qualification_sources.push('data/private.o'),
        c => c.parameters.ability_source.path = c.parameters.base_source.path,
        c => c.parameters.ability_source.sha256 = '0'.repeat(64),
        c => c.parameters.base_source.sha256 = '0'.repeat(64),
        c => c.parameters.ability_source.entry_id = 'wrong']) {
        const changed = structuredClone(conditions); mutate(changed[0]);
        assert.throws(() => validateQualificationSources(changed, files));
    }
    assert.throws(() => validateQualificationSources([{ parameters: {} }], files));
});

test('限定实际USER快照与原别名/enable入口，不补领悟或副手', () => {
    const header = read('tools/tests/martial_data/taohua_xiao_receivers.h');
    assert.match(header, /if \(!is_taohua_xiao\(\)\) return result/);
    assert.match(header, /"can_perform\/tanzhi-shentong\/xiao"/);
    assert.match(header, /ob->is_fighting\(opponent\)/);
    assert.match(header, /ob->query_temp\("secondary_weapon"\)/);
    assert.match(header, /equipment_snapshot\(secondary\)/);
    assert.doesNotMatch(header, /->set\(|->set_temp\(|->map_skill\(|call_out\(|random\(/);
    assert.match(body('snapshot'), /result = taohua_xiao_snapshot\(ob, result\)/);
    const prepare = body('prepare_actor');
    assert.match(prepare, /if \(is_taohua_xiao\(\)\)/);
    assert.match(prepare, /ob->id\(side \? "right" : "left"\)/);
    assert.match(prepare, /present\(side \? "right" : "left", this_object\(\)\) == ob/);
    assert.match(prepare, /original XIAO enable context/);
    assert.match(runner, /#include "\/tests\/taohua_xiao_receivers\.h"/);
});

test('原昏迷三个门禁一致加入；准备终态分账，不唤醒或直接调用绝招', () => {
    const perform = body('perform_sample');
    assert.equal((perform.match(/"taohua-xiao"/g) ?? []).length, 3);
    assert.match(perform, /players\[1\]->unconcious\(\)/);
    assert.match(perform, /current\["preparation"\]\["terminals"\] = copy\(current\["terminals"\]\)/);
    assert.match(perform, /current\["terminals"\] = \(\{\}\)/);
    assert.doesNotMatch(read('tools/tests/martial_data/taohua_xiao_receivers.h'), /revive|start_busy|perform\(/);
    assert.doesNotMatch(body('perform_sample'), /is_taohua_xiao/);
});

test('报告消费端传完整原condition而非planned汇总；精神与内力专节不混气血表', () => {
    const condition = taohuaXiaoConditions(catalog)[0];
    const summary = summarizeSamples({ identity: { conditions: [condition], execution: {} } }, []);
    assert.equal(summary.conditions[0].samples, undefined);
    assert.throws(() => taohuaXiaoReport([], summary.conditions[0]));
    const taohua_xiao = taohuaXiaoReport([], condition);
    assert.equal(taohua_xiao.coverage.missing, 100);
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic', evidence_sha256: 'synthetic',
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 },
        conditions: [{ ...condition, taohua_xiao, effects: null }] });
    assert.match(markdown, /桃花岛·弹指神通「啸沧海」/);
    assert.match(markdown, /归零修正/);
    assert.match(markdown, /未观察（n=0，未知=0）/);
    const report = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(report, /condition\.taohua_xiao = taohuaXiaoReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\)/);
    assert.match(report, /filter\(c => (?:!c\.[a-z_]+ && )*!c\.taohua_xiao && !c\.taohua_ding/);
});
