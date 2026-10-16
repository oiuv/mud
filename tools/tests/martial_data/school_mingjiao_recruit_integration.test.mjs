// Offline integration assertions are not real-driver sampling evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { teachingEntries } from './teaching_cases.mjs';
import { createSeries } from './ledger.mjs';
import { mingjiaoRecruitConditions, mingjiaoRecruitSourcePaths } from './school_mingjiao_recruit_cases.mjs';
import { mingjiaoApprenticeLearningConditions } from './school_mingjiao_apprentice_learning_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = mingjiaoRecruitConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('85条件170确定性记录302原命令，六可拜教师和两个无入口NPC分列', () => {
    assert.equal(cases.length, 85);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 170);
    assert.equal(cases.reduce((n, c) => n + c.samples * c.parameters.teaching_expectations.length, 0), 302);
    assert.equal(mingjiaoRecruitConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 170);
    const all = schoolCombatConditions(catalog);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'mingjiao-recruit'), cases);
    const legacy = mingjiaoApprenticeLearningConditions(catalog, read);
    assert.equal(legacy.length, 19); assert.equal(legacy.reduce((n, c) => n + c.samples, 0), 430);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'mingjiao-apprentice-learning'), legacy);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
});

test('八NPC create登记在教学清单中，不伪造成perform或普通技能入口', () => {
    const entries = teachingEntries(cases);
    assert.equal(entries.length, 8); assert.ok(entries.every(e => e.function === 'create' && e.role === 'teaching'));
    const directory = mkdtempSync(join(tmpdir(), 'mud-mingjiao-recruit-unit-'));
    const args = { inventory, catalog, conditions: cases, execution: { synthetic_test_only: true } };
    assert.throws(() => createSeries(directory, args), /条件引用的入口不在源码清单中/);
    assert.doesNotThrow(() => createSeries(directory, { ...args, teachingEntries: entries }));
});

test('116来源和新增四工具冻结，原15文件48观察点不变', () => {
    const s = snapshot(); validateQualificationSources(cases, s.files);
    assert.equal(mingjiaoRecruitSourcePaths.length, 116);
    for (const p of mingjiaoRecruitSourcePaths) assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    for (const name of ['school_mingjiao_recruit_cases.mjs', 'school_mingjiao_recruit_cases.test.mjs',
        'school_mingjiao_recruit_integration.test.mjs', 'school_mingjiao_recruit_report.test.mjs']) {
        const p = 'tools/tests/martial_data/' + name;
        assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    }
    const fusion = s.probes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = s.probes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    assert.equal(probes.length, 15); assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
});

test('运行前严格有限参数，不开放命令、教师状态覆写或假进度', () => {
    const s = snapshot();
    for (const mutate of [c => c.parameters.action = 'eval 1',
        c => c.parameters.teaching_expectations[0].action = 'eval 1',
        c => c.parameters.teacher.path = '/kungfu/class/taohua/huang',
        c => c.parameters.actor.learned = { force: 1 },
        c => c.parameters.actor.equipment = { type: 'sword' },
        c => c.parameters.teacher_properties = { class: 'fighter' },
        c => c.parameters.actor.temp.quest.count++,
        c => c.parameters.actor.properties.gongxian++,
        c => c.parameters.capture_skill_loads = [],
        c => c.parameters.teaching_entry.line++]) {
        const c = structuredClone(cases[0]); mutate(c);
        assert.throws(() => validateQualificationSources([c], s.files));
    }
    const files = { ...s.files }; delete files[mingjiaoRecruitSourcePaths[0]];
    assert.throws(() => validateQualificationSources(cases, files));
});

test('真实USER原命令观察完整师承、NPC状态和取消前后意向', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const observer = read('tools/tests/martial_data/teaching_observer.lpc');
    for (const text of ['prepare_mingjiao_recruit', 'parameters["teacher"]["path"] == "/kungfu/class/mingjiao/" + key',
        '"initializer_actor": "not_observed"', '"born_family": teacher->query("born_family")',
        '"attempt_source": function_exists("attempt_apprentice", teacher)',
        'step["after"]["recruitment"]["family"]["master_name"] == parameters["teacher"]["name"]'])
        assert.ok(runner.includes(text), text);
    for (const text of ['"teacher_pending_recruit_before"', '"pending_betrayer"', '"teacher_before"',
        '"teacher_after"', '"gender"', '"busy"', '"born_family"']) assert.ok(observer.includes(text), text);
    assert.doesNotMatch(runner, /destruct\([^\n]*shenghuo-ling/);
});
