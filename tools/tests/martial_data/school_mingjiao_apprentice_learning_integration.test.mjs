// Integration assertions do not manufacture gameplay evidence.
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
import { mingjiaoApprenticeLearningConditions, mingjiaoApprenticeLearningSourcePaths,
    mingjiaoApprenticeLearningEffects } from './school_mingjiao_apprentice_learning_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';
import { teachingEntries } from './teaching_cases.mjs';
import { createSeries } from './ledger.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const inventory = buildInventory(root);
const catalog = collectCatalog(root, inventory);
const cases = mingjiaoApprenticeLearningConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('19条件430正式38烟雾，原师承命令与学习明确分离', () => {
    assert.equal(cases.length, 19);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'mingjiao-apprentice-learning'), cases);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 430);
    assert.equal(mingjiaoApprenticeLearningConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 38);
    for (const variant of ['learn-cap200', 'learn-no-potential'])
        assert.equal(cases.find(c => c.parameters.variant === variant).parameters.expected, 'refused');
});

test('school-combat教学入口必须登记原教师create，不混成武学perform', () => {
    const entries = teachingEntries(cases);
    assert.deepEqual(entries, [cases[0].parameters.teaching_entry]);
    assert.equal(entries[0].id, 'kungfu/class/mingjiao/zhangwuji.c:12:create');
    const directory = mkdtempSync(join(tmpdir(), 'mud-mingjiao-entries-unit-'));
    const args = { inventory, catalog, conditions: cases, execution: { synthetic_test_only: true } };
    assert.throws(() => createSeries(directory, args), /条件引用的入口不在源码清单中/);
    assert.doesNotThrow(() => createSeries(directory, { ...args, teachingEntries: entries }));
    assert.ok(read('tools/tests/martial_data/execution.mjs').includes(
        "collection === 'school-combat' ? teachingEntries(conditions.filter(c => c.method === 'teaching'))"));
});

test('实际来源与新工具冻结，不新增或改写观察探针', () => {
    const s = snapshot(); validateQualificationSources(cases, s.files);
    for (const p of mingjiaoApprenticeLearningSourcePaths) assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    for (const name of ['school_mingjiao_apprentice_learning_cases.mjs',
        'school_mingjiao_apprentice_learning.test.mjs', 'school_mingjiao_apprentice_learning_integration.test.mjs']) {
        const p = 'tools/tests/martial_data/' + name;
        assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    }
    const fusion = s.probes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = s.probes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    assert.equal(probes.length, 15);
    assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
});

test('有限教学不开放任意命令、伪师父、装备或熟练度预写', () => {
    const s = snapshot();
    for (const mutate of [c => c.parameters.teaching_expectations[0].action = 'eval 1',
        c => c.parameters.teacher.path = '/kungfu/class/taohua/huang',
        c => c.parameters.actor.learned = { 'shenghuo-ling': 1 },
        c => c.parameters.actor.equipment = { type: 'sword' },
        c => c.parameters.capture_skill_loads = [], c => c.parameters.actor.temp.quest.count = 4]) {
        const c = structuredClone(cases[0]); mutate(c);
        assert.throws(() => validateQualificationSources([c], s.files));
    }
});

test('原USER首次加载、NPC师承和真实逐步状态；不改技能或随机', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const observer = read('tools/tests/martial_data/teaching_observer.lpc');
    for (const text of ['prepare_mingjiao_apprentice_learning',
        '"function": "valid_enable", "argument": "sword"',
        'SKILL_D("shenghuo-ling")->valid_enable("sword")',
        'parameters["teaching_kind"] == "ordinary-learning"']) assert.ok(runner.includes(text));
    for (const text of ['"teacher_pending_recruit_before"', '"qualification"',
        '"detach/明教"', '"effective_str"']) assert.ok(observer.includes(text));
    assert.doesNotMatch(runner, /destruct\([^\n]*shenghuo-ling/);
});

test('专用拜师/授课表不生成零伤害，无原件仍保持未知', () => {
    const report = { fingerprint: 'test-only', evidence_sha256: 'not-real-evidence',
        totals: { conditions: 19, samples: 0, observed: 0, refused: 0, errors: 0 },
        conditions: cases.map(c => ({ ...c, planned: c.samples, recorded: 0, missing: c.samples,
            counts: { observed: 0, refused: 0, error: 0, not_applicable: 0 },
            mingjiao_apprentice_learning: mingjiaoApprenticeLearningEffects([], c) })) };
    const before = structuredClone(report), md = schoolCombatMarkdown(report);
    assert.deepEqual(report, before);
    assert.ok(md.includes('原拜师与圣火令普通授课'));
    assert.ok(md.includes('未观测'));
    assert.ok(md.includes('未知'));
    for (const c of cases) assert.equal(md.split(`| ${c.id} |`).length - 1, 1);
});
