import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { quanzhenStudyConditions, quanzhenStudyProfiles, studyProgressBound } from './school_quanzhen_study_cases.mjs';
import { schoolStudyEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = quanzhenStudyConditions(catalog);
const find = suffix => cases.find(c => c.id.endsWith(suffix));

test('全真研究309条件4244样本，旧969条件41824样本不变', () => {
    assert.equal(cases.length, 309); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4244);
    assert.equal(cases.filter(c => c.method === 'upgrade').length, 45);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 134);
    assert.equal(new Set(cases.map(c => c.id)).size, 309);
    assert.equal(quanzhenStudyConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 618);
    assert.ok(cases.every(c => !('move' in c.parameters.actor.skills)));
    assert.throws(() => quanzhenStudyConditions({ skills: catalog.skills.filter(s => s.id !== 'sword') }), /必须有真实定义/);
    const old = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen'].includes(c.parameters.school) && !['quanzhen-study', 'quanzhen-recovery', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 969); assert.equal(old.reduce((n, c) => n + c.samples, 0), 41824);
});

test('普通研究的分段与相关基本功按原整数公式，不套用force倍率', () => {
    for (const skill of quanzhenStudyProfiles.filter(p => p[1] !== 'force').map(p => p[0]))
        assert.deepEqual([200, 400, 800].map(l => studyProgressBound(find(`${skill}-research-l${l}`).parameters)), [8, 8, 9]);
    assert.deepEqual([499, 500].map(l => studyProgressBound(find(`qixing-jian-research-l${l}`).parameters)), [8, 10]);
    assert.equal(studyProgressBound(find('qixing-jian-research-l200-related-basic').parameters), 13);
    assert.throws(() => studyProgressBound(find('xiantian-gong-upgrade-l199').parameters));
});

function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties, skills: structuredClone(config.skills),
        mappings: structuredClone(config.mappings), learned: {}, weapon: config.equipment?.type ?? 'none',
        temp: {}, busy: config.busy ?? 0 }));
    const raw = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原拒绝',
        launches: [], attacks: [], interfaces: [], command_accepted: p.command_return, metrics: [{}, {}] };
    const after = raw.immediate[0];
    after.jing = p.clear_jing ? 0 : after.jing - p.completed * Math.trunc(1000 / after.int);
    after.learned_points += p.completed;
    if (c.method === 'upgrade') {
        after.skills[p.skill]++; after.learned[p.skill] = 0;
        const primed = structuredClone(before[0]);
        primed.learned[p.skill] = 1 + Math.trunc(p.primer.amount * 100 / (p.level + 100));
        raw.upgrades = [{ before: structuredClone(before[0]), primed, after: structuredClone(after),
            implemented_by: '/inherit/skill/skill',
            action: p.action, accepted: 1 }];
    } else if (p.completed) after.learned[p.skill] = p.completed;
    return raw;
}

test('全部条件核验；研究拒绝不等于命令返回0，部分研究保留实际进度', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    const c = find('quanzhen-jian-research-l200-partial'), r = row(c);
    assert.equal(r.command_accepted, 1); assert.equal(r.immediate[0].jing, 0);
    assert.equal(r.immediate[0].learned_points, 2);
    r.immediate[0].learned_points = 3; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('预置不能提前升级、直接制造领悟或扣除内力', () => {
    const c = find('xiantian-gong-upgrade-l199');
    for (const damage of [r => r.upgrades[0].primed.skills['xiantian-gong']++,
        r => r.immediate[0].neili--, r => r.upgrades[0].implemented_by = '/fake',
        r => r.upgrades[0].primed.learned['xiantian-gong'] = 0,
        r => r.immediate[0].skills['xuanmen-neigong'] = 1]) {
        const r = row(c); damage(r); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('原始源码仍继承空升级回调，测试入口不直接调用skill_improved', () => {
    for (const [skill, usage] of quanzhenStudyProfiles) {
        const source = readFileSync(join(root, 'kungfu/skill', skill + '.c'), 'utf8');
        assert.match(source, usage === 'force' ? /inherit FORCE;/ : /inherit SKILL;/);
        assert.doesNotMatch(source, /\b(?:void|int)\s+skill_improved\s*\(/);
    }
    assert.match(readFileSync(join(root, 'include/globals.h'), 'utf8'), /#define\s+FORCE\s+"\/inherit\/skill\/force"/);
    const force = readFileSync(join(root, 'inherit/skill/force.c'), 'utf8');
    assert.match(force, /inherit SKILL;/); assert.doesNotMatch(force, /\bskill_improved\s*\(/);
    assert.match(readFileSync(join(root, 'inherit/skill/skill.c'), 'utf8'), /void\s+skill_improved\(object me\)\s*\{\s*\}/);
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.doesNotMatch(runner, /->skill_improved\s*\(/);
    assert.match(runner, /players\[0\]->improve_skill\(grant, 10000000, 1\)/);
});

test('统计把升级与普通进度分列，不将预置算作研究收益', () => {
    const c = find('qixing-jian-upgrade-l199'), r = row(c);
    const e = schoolStudyEffects([{ outcome: 'observed', raw: r }], c.parameters.skill);
    assert.equal(e.command_accepted, 1);
    assert.equal(e.level_gain.mean, 1); assert.equal(e.progress.mean, 0);
    assert.equal(e.potential_used.mean, 1); assert.equal(e.jing_cost.mean, 27);
    assert.equal(e.neili_cost.mean, 0); assert.equal(e.upgrade_attempts, 1);
    assert.deepEqual(e.implemented_by, ['/inherit/skill/skill']);
});
