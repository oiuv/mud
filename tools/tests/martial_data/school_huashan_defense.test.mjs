import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { combatDefenseProbes } from './execution.mjs';
import { parryCoefficient } from './school_huashan_defense_cases.mjs';
import { schoolDefenseEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const all = schoolCombatConditions(catalog).filter(c => c.parameters.school === 'huashan'
    && c.parameters.collection_group !== 'huashan-combination');
const cases = all.filter(c => c.parameters.collection_group === 'huashan-defense');
const find = suffix => cases.find(c => c.id.endsWith(suffix));

test('防御78条件4174样本，保留旧183条件，不将接口零值判作拒绝', () => {
    assert.equal(cases.length, 78);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4174);
    assert.equal(cases.filter(c => c.samples === 100).length, 41);
    assert.ok(cases.every(c => c.parameters.expected === 'observed'));
    const previous = all.filter(c => !['huashan-defense', 'huashan-upgrade', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(previous.length, 183);
    assert.equal(previous.reduce((n, c) => n + c.samples, 0), 12420);
    assert.ok(cases.every(c => c.entry_id === catalog.skills.find(s => s.id === 'dugu-jiujian').path));
});

test('无招与count对照仅改变指定变量；左攻击右防守', () => {
    for (const ability of ['valid_damage', 'ordinary', 'direct']) for (const level of [200, 400, 800]) {
        const normal = find(`${ability}-l${level}-count0`), nothing = find(`${ability}-l${level}-nothing-count0`);
        const target = structuredClone(nothing.parameters.target);
        target.properties['can_learn/dugu-jiujian/nothing'] = 0;
        assert.deepEqual(target, normal.parameters.target);
        assert.deepEqual(nothing.parameters.actor, normal.parameters.actor);
        const counted = structuredClone(find(`${ability}-l${level}-count300`).parameters.actor);
        counted.skills.count = 0;
        assert.deepEqual(counted, normal.parameters.actor);
        assert.deepEqual(normal.parameters.actor.mappings, {});
        assert.equal(normal.parameters.target.mappings.parry, 'dugu-jiujian');
    }
});

test('战斗临时探针逐字可逆，只读一次原化解返回', () => {
    const original = readFileSync(join(root, 'adm/daemons/combatd.c'), 'utf8');
    const { changed, sites } = combatDefenseProbes(original);
    assert.equal(sites.length, 5);
    let restored = changed;
    for (const site of [...sites].reverse()) restored = Array.isArray(site)
        ? restored.replace(site[1], '') : restored.replace(site.anchor + site.insert, site.anchor);
    assert.equal(restored, original);
    assert.equal((changed.match(/->valid_damage\(/g) ?? []).length, (original.match(/->valid_damage\(/g) ?? []).length);
    assert.throws(() => combatDefenseProbes(original + original), /不唯一/);
});

function row(c) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        nothing: config.properties['can_learn/dugu-jiujian/nothing'] ?? 0,
        effective_skills: { parry: config.skills.parry / 2 + (config.skills['dugu-jiujian'] ?? 0),
            sword: config.skills.sword / 2 + (config.skills['dugu-jiujian'] ?? 0) },
        busy: config.busy ?? 0, weapon: config.equipment?.type === 'xsword' ? 'sword' : config.equipment?.type ?? 'none',
        weapon_details: { program: '/tests/' + config.equipment?.type }, temp: { apply: { damage: 50 } },
    }));
    return { outcome: 'observed', before, immediate: structuredClone(before),
        interfaces: [], defenses: [], attacks: [], launches: [], metrics: [{}, {}] };
}

test('查询23档系数及非剑零值，查询不得伤害或改变状态', () => {
    for (const c of cases.filter(c => c.parameters.ability === 'query_effect_parry')) {
        const raw = row(c);
        raw.interfaces.push({ function: 'query_effect_parry', result: parryCoefficient(c.parameters.level, raw.before[1].weapon) });
        validateSchoolCombatRecord(raw, c);
        raw.interfaces[0].result++;
        assert.throws(() => validateSchoolCombatRecord(raw, c));
    }
    assert.equal(parryCoefficient(350), 120);
    assert.equal(parryCoefficient(800, 'pin'), 0);
});

function withDefense(c, success) {
    const raw = row(c), p = c.parameters;
    const incoming = p.ability === 'direct' ? 1050 : 1000;
    const result = success ? { damage: -incoming, msg: '原化解描述' } : 0;
    raw.interfaces = [{ function: p.interface.function, result: p.ability === 'direct' ? '原公共伤害描述' : result }];
    raw.defenses = [{ actor: 0, target: 1, skill: 'dugu-jiujian', incoming, result,
        route: p.ability === 'valid_damage' ? 'interface' : 'direct' }];
    if (success && raw.before[1].nothing && !raw.before[0].busy) raw.immediate[0].busy = 1;
    if (p.ability === 'direct') { raw.metrics[0].direct = 1; raw.metrics[1].qi_cost = success ? 0 : 100; }
    return raw;
}

test('接口不结算伤害；无招保留已有忙乱；不伪造确定性拒绝或化解', () => {
    const c = find('valid_damage-l200-nothing-count0'), raw = withDefense(c, true);
    validateSchoolCombatRecord(raw, c);
    const empty = withDefense(c, false);
    empty.interfaces[0].result = null; empty.defenses[0].result = null;
    validateSchoolCombatRecord(empty, c);
    const wrong = structuredClone(raw); wrong.immediate[1].neili--;
    assert.throws(() => validateSchoolCombatRecord(wrong, c));
    const busy = find('valid_damage-l200-nothing-attacker-busy'), kept = withDefense(busy, true);
    validateSchoolCombatRecord(kept, busy);
    kept.immediate[0].busy = 1;
    assert.throws(() => validateSchoolCombatRecord(kept, busy));
    for (const suffix of ['valid_damage-l119', 'valid_damage-l200-count300', 'valid_damage-l200-busy', 'valid_damage-l200-pin']) {
        const denied = find(suffix);
        validateSchoolCombatRecord(withDefense(denied, false), denied);
        assert.throws(() => validateSchoolCombatRecord(withDefense(denied, true), denied));
    }
});

test('公共伤害实际落地与化解返回相符，接口采到返回不代替实际结算', () => {
    const c = find('direct-l200-count0');
    for (const success of [true, false]) {
        const raw = withDefense(c, success);
        validateSchoolCombatRecord(raw, c);
        raw.metrics[1].qi_cost = success ? 100 : 0;
        assert.throws(() => validateSchoolCombatRecord(raw, c));
    }
});

test('统计按调用区分化解和闪避/招架，不从零伤害推断', () => {
    const c = find('direct-l200-count0'), yes = withDefense(c, true), no = withDefense(c, false);
    const dodge = row(find('ordinary-l200-count0'));
    dodge.attacks = [{ actor: 0, target: 1, type: 0, result: -1, damage: 0 }];
    const stats = schoolDefenseEffects([yes, no, dodge].map(raw => ({ raw, outcome: 'observed' })));
    assert.equal(stats.calls, 2);
    assert.equal(stats.negated_per_call.rate, 0.5);
    assert.equal(stats.samples_with_negation.rate, 1 / 3);
    assert.equal(stats.coefficient.mean, null);
    assert.deepEqual(stats.primary_attack_results, { hit: 0, dodge: 1, parry: 0 });
});
