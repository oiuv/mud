import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { combatDodgeProbes, combatPassiveProbes } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { jinyanDodgeCoefficient, quanzhenAuxiliaryConditions } from './school_quanzhen_auxiliary_cases.mjs';
import { schoolAuxiliaryEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = quanzhenAuxiliaryConditions(catalog);
const find = suffix => cases.find(c => c.id.endsWith(suffix));

test('辅助采集79条件2118样本；旧890条件39706样本不变', () => {
    assert.equal(cases.length, 79); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2118);
    assert.equal(new Set(cases.map(c => c.id)).size, 79);
    const old = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen'].includes(c.parameters.school) && !['quanzhen-auxiliary', 'quanzhen-study', 'quanzhen-recovery', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 890); assert.equal(old.reduce((n, c) => n + c.samples, 0), 39706);
    assert.equal(quanzhenAuxiliaryConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 158);
});

test('系数分档边界，未实现接口与返回0分开', () => {
    assert.deepEqual([1, 29, 30, 49, 50, 99, 100, 149, 150, 199, 200, 400, 800].map(jinyanDodgeCoefficient),
        [0, 0, 10, 10, 20, 20, 30, 30, 40, 40, 50, 50, 50]);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 13);
});

test('两处AP/DP探针可逆，不重跑任何原判定或随机', () => {
    const source = readFileSync(join(root, 'adm/daemons/combatd.c'), 'utf8');
    const base = combatPassiveProbes(source), probe = combatDodgeProbes(source);
    assert.equal(probe.sites.length, 9);
    let restored = probe.changed;
    for (const s of probe.sites.slice(7).reverse()) restored = restored.replace(s.anchor + s.insert, s.anchor);
    assert.equal(restored, base.changed);
    assert.throws(() => combatDodgeProbes(source.replace('        dp /= 3;', '        dp /= 4;')), /不唯一/);
});

function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties, skills: structuredClone(config.skills),
        mappings: structuredClone(config.mappings), weapon: config.equipment?.type ?? 'none', temp: {}, busy: config.busy ?? 0 }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原拒绝',
        launches: [], interfaces: [], attacks: [], dodge_checks: [], command_accepted: 0, metrics: [{}, {}] };
    if (c.method === 'ordinary') {
        const coeff = p.target.mappings.dodge === 'jinyan-gong' ? jinyanDodgeCoefficient(p.level) : 0;
        let dp = 203 + 2 * coeff;
        if (p.target.busy) dp = Math.trunc(dp / 3);
        const base = { actor: 0, target: 1, type: 0, ap: 400, dp: 203, phase: 'base', skill: p.target.mappings.dodge ?? null, busy: p.target.busy ?? 0 };
        r.dodge_checks.push(base, { ...base, dp, phase: 'settled' });
        r.attacks.push({ actor: 0, target: 1, type: 0, result: -1 });
    } else if (c.method === 'interface') {
        const value = p.ability === 'query_effect_dodge' ? (p.skill === 'jinyan-gong' ? jinyanDodgeCoefficient(p.level) : 0)
            : p.ability === 'query_dodge_msg' ? '$n躲开。\n'
                : p.ability === 'type' ? (p.skill === 'taoism' ? 'knowledge' : 'martial')
                    : p.ability === 'valid_learn_level' ? (p.skill === 'taoism' ? 999 : 200)
                        : Number(p.expected === 'observed');
        r.interfaces.push({ ...p.interface, result: value || null,
            ...(p.ability === 'query_effect_dodge' ? { implemented_by: p.skill === 'jinyan-gong' ? '/kungfu/skill/jinyan-gong' : null } : {}) });
    }
    return r;
}

test('全部条件核验原始记录，辅助拒绝仅允许通知属性变化', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    const c = find('taoism-research-l400'), r = row(c);
    r.immediate[0].temp.notify_fail = '只能学习'; validateSchoolCombatRecord(r, c);
    r.immediate[0].neili--; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('忙乱先加成后除3；缺失观测、重复原攻击和无来源系数不能通过', () => {
    const c = find('jinyan-gong-ordinary-l400-busy'), r = row(c);
    assert.equal(r.dodge_checks[1].dp, 101); validateSchoolCombatRecord(r, c);
    r.dodge_checks[1].dp = 102; assert.throws(() => validateSchoolCombatRecord(r, c));
    const missing = row(c); missing.dodge_checks = []; assert.throws(() => validateSchoolCombatRecord(missing, c));
    const tianshan = find('tianshan-feidu-query_effect_dodge-l400'), t = row(tianshan);
    t.interfaces[0].implemented_by = '/fake'; assert.throws(() => validateSchoolCombatRecord(t, tianshan));
    const unmapped = find('jinyan-gong-ordinary-l400-unmapped'), u = row(unmapped);
    for (const check of u.dodge_checks) check.skill = 0;
    validateSchoolCombatRecord(u, unmapped);
});

test('统计独立保留接口文本、公式概率和实际频率，不把反击混入原攻击', () => {
    const c = find('jinyan-gong-ordinary-l400'), r = row(c);
    r.attacks.push({ actor: 1, target: 0, type: 1, result: -1 });
    const e = schoolAuxiliaryEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(e.primary_dodge.trials, 1); assert.equal(e.primary_dodge.successes, 1);
    assert.equal(e.formula_probability.mean, 303 / 703);
    const text = schoolAuxiliaryEffects([{ outcome: 'observed', raw: row(find('taoism-type-l200')) }]);
    assert.deepEqual(text.interface_texts, { knowledge: 1 }); assert.equal(text.interface_numbers.mean, null);
});
