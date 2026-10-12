import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { combatPassiveProbes } from './execution.mjs';
import { kongmingParryCoefficient, quanzhenDefenses } from './school_quanzhen_defense_cases.mjs';
import { schoolDefenseEffects, quanzhenPassiveEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen'].includes(c.parameters.school)),
    cases = all.filter(c => c.parameters.collection_group === 'quanzhen-defense');
const find = suffix => cases.find(c => c.id.endsWith(suffix));

test('全真防御83条件5556样本，不改变此前525条件的定义与采样数', () => {
    assert.equal(cases.length, 83); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 5556);
    const old = all.filter(c => !['quanzhen-defense', 'quanzhen-practice', 'quanzhen-cultivation', 'quanzhen-auxiliary', 'quanzhen-study', 'quanzhen-recovery'].includes(c.parameters.collection_group));
    assert.equal(old.length, 525); assert.equal(old.reduce((n, c) => n + c.samples, 0), 29960);
    assert.equal(cases.filter(c => c.samples === 100).length, 55);
    assert.equal(new Set(cases.map(c => c.id)).size, 83);
    assert.ok(cases.every(c => c.parameters.expected === 'observed'));
    assert.ok(cases.every(c => catalog.skills.some(s => s.path === c.entry_id)));
});

test('金关count、空明有效内功与先天加力是独立对照变量', () => {
    for (const level of [200, 400, 800]) {
        const a = find(`jinguan-yusuo-direct-l${level}-count0`), b = find(`jinguan-yusuo-direct-l${level}-count300`);
        const actor = structuredClone(b.parameters.actor); actor.skills.count = 0;
        assert.deepEqual(actor, a.parameters.actor); assert.deepEqual(a.parameters.target, b.parameters.target);
        const basic = find(`kongming-quan-direct-l${level}-basic-force`), mapped = find(`kongming-quan-direct-l${level}-mapped-force`);
        assert.equal(mapped.parameters.actor.skills.force, basic.parameters.actor.skills.force);
        assert.equal(mapped.parameters.actor.skills['xuanmen-neigong'], 600);
        assert.deepEqual(basic.parameters.target, mapped.parameters.target);
    }
    assert.equal(find('xiantian-gong-ordinary-l400-str600-jiali50').parameters.actor.properties.str, 600);
});

test('战斗七处观察可逆，两个hit_ob仍只调用原函数一次', () => {
    const original = readFileSync(join(root, 'adm/daemons/combatd.c'), 'utf8');
    const { changed, sites } = combatPassiveProbes(original);
    assert.equal(sites.length, 7);
    let restored = changed;
    for (const site of [...sites].reverse()) restored = Array.isArray(site)
        ? restored.replace(site[1], '') : restored.replace(site.anchor + site.insert, site.anchor);
    assert.equal(restored, original);
    assert.equal((changed.match(/->hit_ob\(/g) ?? []).length, (original.match(/->hit_ob\(/g) ?? []).length);
    assert.throws(() => combatPassiveProbes(original.replace('my["jiali"]);', '0);')), /不唯一/);
});

function row(c) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations ?? {}), living: 1, effective_con: 90,
        effective_skills: { force: config.skills.force / 2 + (config.skills[config.mappings.force] ?? 0) },
        weapon: config.equipment?.type ?? 'none', busy: config.busy ?? 0, temp: { apply: {} },
    }));
    return { outcome: 'observed', before, immediate: structuredClone(before),
        interfaces: [], defenses: [], passives: [], attacks: [], launches: [], metrics: [{}, {}] };
}

test('空明系数阈值与持器零值，查询不改变状态', () => {
    assert.equal(kongmingParryCoefficient(79), 0); assert.equal(kongmingParryCoefficient(80), 50);
    assert.equal(kongmingParryCoefficient(200), 80); assert.equal(kongmingParryCoefficient(280), 100);
    assert.equal(kongmingParryCoefficient(350), 120); assert.equal(kongmingParryCoefficient(800, true), 0);
    for (const c of cases.filter(c => c.parameters.ability === 'query_effect_parry')) {
        const r = row(c); r.interfaces.push({ result: kongmingParryCoefficient(c.parameters.level, !!c.parameters.target.equipment) });
        validateSchoolCombatRecord(r, c);
        r.immediate[1].neili--; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

function defenseRow(c, success) {
    const r = row(c), p = c.parameters, result = success ? { damage: -1000 } : 0;
    r.defenses.push({ actor: 0, target: 1, skill: p.skill, incoming: 1000, result,
        route: p.ability === 'direct' ? 'direct' : 'interface' });
    r.interfaces.push({ result });
    if (p.ability === 'direct') { r.metrics[0].direct = 1; r.metrics[1].qi_cost = success ? 0 : 500; }
    return r;
}

test('原公式确定性边界不伪造概率，接口化解和实际零伤害分别核验', () => {
    const zero = find('jinguan-yusuo-valid_damage-l400-count0');
    validateSchoolCombatRecord(defenseRow(zero, false), zero);
    assert.throws(() => validateSchoolCombatRecord(defenseRow(zero, true), zero));
    const all = find('kongming-quan-direct-l800-basic-force');
    validateSchoolCombatRecord(defenseRow(all, true), all);
    assert.throws(() => validateSchoolCombatRecord(defenseRow(all, false), all));
    const armed = find('kongming-quan-valid_damage-l800-target-armed');
    validateSchoolCombatRecord(defenseRow(armed, false), armed);
    assert.throws(() => validateSchoolCombatRecord(defenseRow(armed, true), armed));
    const r = defenseRow(all, true); r.metrics[1].qi_cost = 1;
    assert.throws(() => validateSchoolCombatRecord(r, all));
});

test('先天接口严格大于后天根骨、内力门槛和原扣费，不把传入factor当倍率', () => {
    for (const c of cases.filter(c => c.parameters.ability === 'hit_ob')) {
        const r = row(c), p = c.parameters, a = r.before[0], input = p.interface.damage;
        const trigger = Math.trunc(input / 6) > 90 && a.neili >= 300 && a.weapon === 'none'
            && a.preparations.unarmed === 'xiantian-gong' && a.mappings.force === 'xiantian-gong';
        const result = trigger ? '原附加描述' : 0;
        r.passives.push({ actor: 0, target: 1, skill: 'xiantian-gong', incoming: input,
            result, route: 'interface', factor: p.interface.factor });
        r.interfaces.push({ result });
        r.metrics[0].neili_cost = trigger ? 30 : 0;
        r.metrics[1].qi_cost = r.metrics[1].eff_qi_cost = trigger ? Math.trunc((input - 100) / 3) : 0;
        validateSchoolCombatRecord(r, c);
        r.metrics[0].neili_cost++; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('统计分别保留化解调用与样本，以及内功/拳脚触发路线', () => {
    const c = find('kongming-quan-direct-l800-basic-force'), raw = defenseRow(c, true);
    const d = schoolDefenseEffects([{ outcome: 'observed', raw }], quanzhenDefenses);
    assert.equal(d.calls, 1); assert.equal(d.samples_with_negation.successes, 1);
    raw.passives = ['force', 'martial', 'martial'].map((route, i) => ({ actor: 0, target: 1,
        skill: 'xiantian-gong', incoming: 1000, route, result: i < 2 ? '附加' : 0 }));
    const p = quanzhenPassiveEffects([{ outcome: 'observed', raw }]);
    assert.equal(p.samples_with_effect.successes, 1);
    assert.equal(p.routes.force.calls, 1); assert.equal(p.routes.martial.calls, 2);
    assert.equal(p.routes.martial.triggered, 1); assert.equal(p.routes.martial.source_wound_on_trigger.mean, 300);
});
