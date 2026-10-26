import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { expectedForceCapacity, forceBonus, forceResearchBound, quanzhenForces } from './school_quanzhen_cultivation_cases.mjs';
import { schoolCultivationEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog)
    .filter(c => ['huashan', 'quanzhen'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'quanzhen-cultivation');
const find = suffix => cases.find(c => c.id.endsWith(suffix));

test('内功修养146条件3526样本，原744条件36180样本不变', () => {
    assert.equal(cases.length, 146); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3526);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 42);
    assert.equal(cases.filter(c => c.method === 'research').length, 60);
    assert.equal(new Set(cases.map(c => c.id)).size, 146);
    const old = all.filter(c => !['quanzhen-cultivation', 'quanzhen-auxiliary', 'quanzhen-study', 'quanzhen-recovery', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 744); assert.equal(old.reduce((n, c) => n + c.samples, 0), 36180);
    assert.ok(cases.every(c => catalog.skills.some(s => s.path === c.entry_id)));
});

function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        learned: {}, weapon: 'none', temp: {}, busy: config.busy ?? 0,
        cultivation: Object.fromEntries(['sex', 'improve/neili', 'breakup', 'special_skill/mystery',
            'special_skill/guimai', 'class', 'family/family_name'].map(k => [k, config.properties[k] ?? null])),
    }));
    const raw = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原接口提示',
        launches: [], attacks: [], interfaces: [], command_accepted: p.command_return, metrics: [{}, {}] };
    if (c.method === 'research') {
        const a = raw.immediate[0]; a.learned_points += p.completed;
        a.jing = p.clear_jing ? 0 : a.jing - p.completed * Math.trunc(1000 / a.int);
        if (p.completed) a.learned[p.skill] = p.completed;
    } else {
        const value = p.ability === 'valid_learn' ? Number(p.expected === 'observed')
            : p.ability === 'difficult_level' ? (p.skill === 'xiantian-gong' ? 500 : 0)
                : p.ability === 'query_neili_improve' ? forceBonus(p.skill, p.actor.skills[p.skill], p.actor.properties.sex)
                    : expectedForceCapacity(p.actor, p.ability === 'query_current_neili_limit');
        raw.interfaces.push({ ...p.interface, result: value || null });
    }
    return raw;
}

test('内功额外上限及真实USER结果分开，兼修取最大而非相加', () => {
    assert.deepEqual([200, 400, 800].map(l => forceBonus('xiantian-gong', l)), [660, 2640, 10560]);
    assert.deepEqual([200, 400, 800].map(l => forceBonus('xuanmen-neigong', l)), [240, 960, 3840]);
    assert.equal(forceBonus('xiantian-gong', 400, 1), 0);
    for (const [mapping, expected] of [['xiantian-gong', 8640], ['xuanmen-neigong', 6960], ['quanzhen-xinfa', 6000], ['unmapped', 2000]]) {
        const p = find('xiantian-gong-query_current_neili_limit-l400-all-' + mapping).parameters;
        assert.equal(expectedForceCapacity(p.actor, true), expected);
        assert.equal(expectedForceCapacity(p.actor, false), 8640);
    }
    assert.equal(expectedForceCapacity(find('xiantian-gong-query_neili_limit-l400-combined').parameters.actor, false), 15921);
    assert.equal(expectedForceCapacity(find('quanzhen-xinfa-query_neili_limit-l201').parameters.actor, false), 3010);
});

test('研究进度上界遵循500分段、难度及公共整数进度换算', () => {
    assert.deepEqual([200, 400, 800].map(l => forceResearchBound(find('xiantian-gong-research-l' + l).parameters)), [7, 6, 8]);
    for (const skill of quanzhenForces.slice(1)) {
        assert.deepEqual([200, 400, 800].map(l => forceResearchBound(find(skill + '-research-l' + l).parameters)), [11, 12, 11]);
        assert.deepEqual([200, 400, 800].map(l => forceResearchBound(find(skill + '-research-l' + l + '-compatible').parameters)), [17, 18, 14]);
    }
});

test('全部条件验证原结果；缺失接口值0、提示临时属性与真实拒绝兼容', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    const c = find('quanzhen-xinfa-query_neili_improve-l200'), r = row(c);
    r.immediate[0].temp.notify_fail = '原提示'; validateSchoolCombatRecord(r, c);
    r.interfaces[0].result = 1; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('命令返回1不冒充研究成功；耗尽精神可能有2次进度', () => {
    for (const skill of quanzhenForces) {
        for (const suffix of ['jing26', 'exp799999']) {
            const c = find(skill + '-research-l200-' + suffix), r = row(c);
            assert.equal(r.command_accepted, 1); assert.equal(r.outcome, 'refused');
            validateSchoolCombatRecord(r, c);
        }
        const c = find(skill + '-research-l200-partial'), r = row(c);
        assert.equal(r.immediate[0].jing, 0); assert.equal(r.immediate[0].learned_points, 2);
        r.immediate[0].learned_points = 3; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('查询不改变max_neili，研究不扣内力，保留原旁观者状态', () => {
    const c = find('xiantian-gong-query_neili_limit-l400'), r = row(c);
    r.immediate[0].max_neili = 8640; assert.throws(() => validateSchoolCombatRecord(r, c));
    const research = find('xiantian-gong-research-l200'), rr = row(research);
    rr.immediate[0].neili--; assert.throws(() => validateSchoolCombatRecord(rr, research));
});

test('统计保留拒绝、已用潜能和精神清零，不把进度换算为整级', () => {
    const selected = ['xiantian-gong-research-l200', 'xiantian-gong-research-l200-jing26', 'xiantian-gong-research-l200-partial'].map(find);
    const summary = schoolCultivationEffects(selected.map(c => ({ outcome: c.parameters.expected, raw: row(c) })), 'xiantian-gong');
    assert.equal(summary.attempts, 3); assert.equal(summary.command_accepted, 3);
    assert.equal(summary.progress.mean, 1); assert.equal(summary.potential_used.mean, 1);
    assert.equal(summary.jing_cost.mean, 113 / 3); assert.equal(summary.neili_cost.mean, 0);
});
