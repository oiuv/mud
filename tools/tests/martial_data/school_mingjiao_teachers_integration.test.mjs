// Synthetic integration assertions are not real-driver collection evidence.
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
import { schoolCombatMarkdown } from './school_combat_report.mjs';
import { teachingEntries } from './teaching_cases.mjs';
import { createSeries } from './ledger.mjs';
import { mingjiaoTeachers, mingjiaoTeachersConditions, mingjiaoTeachersSourcePaths,
    mingjiaoTeachersEffects } from './school_mingjiao_teachers_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = mingjiaoTeachersConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('九教师116原配置关系、41技能，363条件11604正式726烟雾', () => {
    assert.equal(mingjiaoTeachers.length, 9);
    assert.equal(mingjiaoTeachers.reduce((n, t) => n + Object.keys(t.levels).length, 0), 116);
    assert.equal(new Set(mingjiaoTeachers.flatMap(t => Object.keys(t.levels))).size, 41);
    assert.equal(cases.length, 363);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 11604);
    assert.equal(mingjiaoTeachersConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 726);
    const all = schoolCombatConditions(catalog);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'mingjiao-teachers'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.equal(cases.filter(c => c.parameters.variant === 'base').length, 115);
    assert.equal(cases.filter(c => c.parameters.random_observation).length, 111);
});

test('原九位教师create必须独立登记，不把普通授课登记成武学绝招', () => {
    const entries = teachingEntries(cases);
    assert.equal(entries.length, 9);
    assert.deepEqual(new Set(entries.map(e => '/' + e.path.slice(0, -2))), new Set(mingjiaoTeachers.map(t => t.path)));
    const directory = mkdtempSync(join(tmpdir(), 'mud-mingjiao-teachers-unit-'));
    const args = { inventory, catalog, conditions: cases, execution: { synthetic_test_only: true } };
    assert.throws(() => createSeries(directory, args), /条件引用的入口不在源码清单中/);
    assert.doesNotThrow(() => createSeries(directory, { ...args, teachingEntries: entries }));
});

test('116公开来源和新工具冻结，15文件48探针保持不变', () => {
    const s = snapshot();
    validateQualificationSources(cases, s.files);
    assert.equal(mingjiaoTeachersSourcePaths.length, 116);
    for (const p of mingjiaoTeachersSourcePaths) assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    for (const name of ['school_mingjiao_teachers_cases.mjs', 'school_mingjiao_teachers_cases.test.mjs',
        'school_mingjiao_teachers_integration.test.mjs']) {
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

test('有限教学参数拒绝任意命令、伪教师、装备改值或预写学习进度', () => {
    const s = snapshot();
    for (const mutate of [c => c.parameters.action = 'eval 1',
        c => c.parameters.teacher.path = '/kungfu/class/taohua/huang',
        c => c.parameters.teaching_entry.line++,
        c => c.parameters.actor.learned = { force: 1 },
        c => c.parameters.actor.temp = { weapon: 'forged' },
        c => c.parameters.actor.equipment = { type: 'sword', program: '/clone/weapon/gangjian', damage: 999 },
        c => c.parameters.actor.secondary_equipment = { type: 'sword', program: '/clone/weapon/gangjian' },
        c => c.parameters.room_properties = { no_learn: 1 },
        c => c.parameters.teacher_properties = { 'env/no_teach': 2 },
        c => delete c.parameters.source_evidence[mingjiaoTeachersSourcePaths[0]]]) {
        const c = structuredClone(cases[0]); mutate(c);
        assert.throws(() => validateQualificationSources([c], s.files));
    }
    const files = { ...s.files }; delete files[mingjiaoTeachersSourcePaths[0]];
    assert.throws(() => validateQualificationSources(cases, files));
});

test('双持走原装备move/wield，观察实际教师状态与房间禁学条件', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const observer = read('tools/tests/martial_data/teaching_observer.lpc');
    for (const text of ['prepare_mingjiao_teachers', 'mingjiao_teacher_state',
        'item = new("/clone/weapon/dagger")', '"teacher_properties"', '"room_properties"',
        'foreach (load_skill in ({ "shenghuo-ling", "qishang-quan" }))',
        'load_argument = load_skill == "shenghuo-ling" ? "sword" : "cuff"',
        'SKILL_D(load_skill)->valid_enable(load_argument)']) assert.ok(runner.includes(text), text);
    for (const text of ['"teacher_before"', '"teacher_after"', '"room_pigging"',
        '"encumbrance"', '"qiankun-except"']) assert.ok(observer.includes(text), text);
    const dual = cases.filter(c => c.parameters.variant === 'guard-dual-wielded');
    assert.equal(dual.length, 11);
    assert.ok(dual.every(c => c.parameters.actor.equipment.program === '/clone/weapon/gangjian'
        && c.parameters.actor.secondary_equipment.program === '/clone/weapon/dagger'));
});

test('未采样教学单列表，不编造零伤害或学习成功，渲染不改输入', () => {
    const report = { fingerprint: 'unit-only', evidence_sha256: 'not-real-sample-evidence',
        totals: { conditions: 363, samples: 0, observed: 0, refused: 0, errors: 0 },
        conditions: cases.map(c => ({ ...c, planned: c.samples, recorded: 0, missing: c.samples,
            counts: { observed: 0, refused: 0, error: 0, not_applicable: 0 },
            mingjiao_teachers: mingjiaoTeachersEffects([], c) })) };
    const before = structuredClone(report), md = schoolCombatMarkdown(report);
    assert.deepEqual(report, before);
    assert.ok(md.includes('明教各教师：原普通授课') && md.includes('未观测'));
    for (const c of cases) {
        assert.equal(md.split(`| ${c.id} |`).length - 1, 1);
        const e = mingjiaoTeachersEffects([], c);
        assert.equal(e.learned_points, null); assert.equal(e.jing_cost, null);
    }
});
