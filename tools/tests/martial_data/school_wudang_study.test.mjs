import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangStudyConditions, wudangStudyProfiles, wudangStudyBound } from './school_wudang_study_cases.mjs';
import { schoolStudyEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-study');
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('武当研究470条件6330样本，既有2706条件80204样本不变', () => {
    assert.equal(cases.length, 470); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 6330);
    assert.equal(cases.filter(c => c.method === 'upgrade').length, 60);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 194);
    assert.equal(cases.filter(c => c.samples === 100).length, 55);
    const old = all.filter(c => !['wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 2706); assert.equal(old.reduce((n, c) => n + c.samples, 0), 80204);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.equal(wudangStudyConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 940);
    for (const c of cases) for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
    assert.throws(() => wudangStudyConditions({ skills: catalog.skills.filter(s => s.id !== 'sword') }), /必须有真实定义/);
});

function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties, skills: structuredClone(config.skills),
        mappings: structuredClone(config.mappings), learned: {}, weapon: config.equipment?.type ?? 'none',
        temp: {}, busy: config.busy ?? 0 }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原命令提示',
        launches: [], attacks: [], interfaces: [], command_accepted: p.command_return, metrics: [{}, {}] };
    const after = r.immediate[0];
    after.jing = p.clear_jing ? 0 : after.jing - p.completed * Math.trunc(1000 / after.int);
    after.learned_points += p.completed;
    if (c.method === 'upgrade') {
        after.skills[p.skill]++; after.learned[p.skill] = 0;
        const primed = structuredClone(before[0]);
        primed.learned[p.skill] = 1 + Math.trunc(p.primer.amount * 100 / (p.level + 100));
        r.upgrades = [{ before: structuredClone(before[0]), primed, after: structuredClone(after),
            implemented_by: '/inherit/skill/skill', action: p.action, accepted: 1 }];
    } else if (p.completed) after.learned[p.skill] = p.completed;
    return r;
}

test('全部条件状态核验，测试只断言区间而不替换随机进度', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    const c = find('wudang-jian-research-l200'), r = row(c);
    r.immediate[0].learned[c.parameters.skill] = wudangStudyBound(c.parameters) + 1;
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('同级与500分段，招架只给valid_enable接受的技能加成', () => {
    for (const [skill, usage] of wudangStudyProfiles) if (usage !== 'force')
        assert.deepEqual([200, 400, 800].map(l => wudangStudyBound(find(`${skill}-research-l${l}`).parameters)), [8, 8, 9]);
    assert.deepEqual([499, 500].map(l => wudangStudyBound(find(`wudang-jian-research-l${l}`).parameters)), [8, 10]);
    assert.equal(wudangStudyBound(find('wudang-jian-research-l200-related-parry').parameters), 13);
    for (const skill of ['furong-jinzhen', 'tiyunzong'])
        assert.equal(wudangStudyBound(find(`${skill}-research-l200-related-parry`).parameters), 8);
    assert.equal(wudangStudyBound(find('wudang-jian-research-l200-wuxing').parameters), 9);
    assert.throws(() => wudangStudyBound(find('taiji-shengong-upgrade-l199').parameters));
});

test('神门当前内力、拳掌空手、无同级限制不被通用假设覆盖', () => {
    assert.equal(find('shenmen-jian-research-l200-neili299').parameters.expected, 'refused');
    assert.equal(find('shenmen-jian-research-l200-neili300').parameters.expected, 'observed');
    assert.equal(find('shenmen-jian-research-l200-neili0').parameters.expected, 'refused');
    assert.equal(find('wudang-jian-research-l200-neili0').parameters.expected, 'observed');
    for (const skill of ['paiyun-shou', 'tiyunzong']) assert.equal(find(`${skill}-research-l200-basic199`).parameters.expected, 'observed');
    assert.equal(find('taiji-quan-research-l200-weapon').parameters.expected, 'refused');
    assert.equal(find('wudang-jian-research-l200-weapon').parameters.expected, 'observed');
    assert.equal(find('wudang-zhang-research-l200-baihua-known').parameters.expected, 'refused');
});

test('实际部分研究与返回1但零进度分开，资源账不能虚报完成', () => {
    const c = find('wudang-jian-research-l200-partial'), r = row(c);
    const e = schoolStudyEffects([{ outcome: 'observed', raw: r }], c.parameters.skill);
    assert.equal(e.command_accepted, 1); assert.equal(e.potential_used.mean, 2); assert.equal(e.jing_cost.mean, 60);
    r.immediate[0].learned_points = 3; assert.throws(() => validateSchoolCombatRecord(r, c));
    for (const suffix of ['exp799999', 'jing26']) {
        const p = find('wudang-jian-research-l200-' + suffix).parameters;
        assert.equal(p.command_return, 1); assert.equal(p.completed, 0); assert.equal(p.expected, 'refused');
    }
});

test('20门原技能均继承空升级回调，无固有valid_research或难度覆盖', () => {
    assert.equal(wudangStudyProfiles.length, 20);
    for (const [skill, usage] of wudangStudyProfiles) {
        const source = readFileSync(join(root, 'kungfu/skill', skill + '.c'), 'utf8');
        assert.match(source, usage === 'force' ? /inherit FORCE;/ : /inherit SKILL;/);
        assert.doesNotMatch(source, /\b(?:void|int)\s+(?:skill_improved|valid_research|difficult_level)\s*\(/);
    }
    assert.doesNotMatch(readFileSync(join(root, 'inherit/skill/force.c'), 'utf8'), /\bskill_improved\s*\(/);
    assert.match(readFileSync(join(root, 'inherit/skill/skill.c'), 'utf8'), /void\s+skill_improved\(object me\)\s*\{\s*\}/);
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.doesNotMatch(runner, /->skill_improved\s*\(/);
    assert.match(runner, /member_array\(\s*parameters\["collection_group"\],\s*\(\{ "quanzhen-study", "wudang-study" \}\)\s*\)/);
});

test('升级预置和真实收益分离；不得提前升级、扣内力或虚构回调', () => {
    const c = find('taiji-shengong-upgrade-l799'), r = row(c);
    const e = schoolStudyEffects([{ outcome: 'observed', raw: r }], c.parameters.skill);
    assert.equal(e.level_gain.mean, 1); assert.equal(e.progress.mean, 0); assert.equal(e.potential_used.mean, 1);
    assert.equal(e.jing_cost.mean, 27); assert.equal(e.neili_cost.mean, 0); assert.equal(e.upgrade_attempts, 1);
    assert.deepEqual(e.implemented_by, ['/inherit/skill/skill']);
    for (const mutate of [s => s.upgrades[0].primed.skills[c.parameters.skill]++,
        s => s.upgrades[0].implemented_by = '/fake', s => s.immediate[0].neili--,
        s => s.immediate[0].skills.taoism++]) {
        const bad = row(c); mutate(bad); assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
});

test('辅助资格与旧练习/修养组分开，只有太极剑带前置太极拳', () => {
    for (const c of cases) {
        const p = c.parameters;
        if (p.skill !== 'taiji-jian' && p.skill !== 'taiji-quan') assert.ok(!Object.hasOwn(p.actor.skills, 'taiji-quan'));
        assert.ok(!Object.hasOwn(p.actor.skills, 'move'));
        if (p.usage === 'force') assert.equal(c.method, 'upgrade');
    }
});
