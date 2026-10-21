import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { taijiParryCoefficient, wudangDefenses } from './school_wudang_defense_cases.mjs';
import { schoolDefenseEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), cases = all.filter(c => c.parameters.collection_group === 'wudang-defense');
const by = (skill, ability, level = 200, suffix = '-basic-force-count0') =>
    cases.find(c => c.id === `school-wudang-defense-${skill}-${ability}-l${level}${suffix}`);

test('太极防御112条件6888样本；旧1614条件53110样本不变且来源存在', () => {
    assert.equal(cases.length, 112); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 6888);
    assert.equal(cases.filter(c => c.samples === 100).length, 68);
    const old = all.filter(c => !['wudang-defense', 'wudang-passive', 'wudang-special', 'wudang-weapons', 'wudang-shenmen', 'wudang-unarmed', 'wudang-learning', 'wudang-cultivation', 'wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 1614); assert.equal(old.reduce((s, c) => s + c.samples, 0), 53110);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) for (const source of c.parameters.qualification_sources) assert.ok(existsSync(join(root, source)), source);
    assert.equal(schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'wudang-defense')
        .reduce((s, c) => s + c.samples, 0), 224);
});

test('count与有效内功独立改变；门派防守者不复制对手资格', () => {
    for (const skill of ['taiji-quan', 'taiji-jian']) for (const level of [200, 400, 800]) {
        const base = by(skill, 'direct', level), count = by(skill, 'direct', level, '-basic-force-count300');
        const mapped = by(skill, 'direct', level, '-mapped-force-count0');
        const actor = structuredClone(count.parameters.actor); actor.skills.count = 0;
        assert.deepEqual(actor, base.parameters.actor);
        assert.equal(mapped.parameters.actor.skills.force, base.parameters.actor.skills.force);
        assert.equal(mapped.parameters.actor.skills['xuanmen-neigong'], 600);
        assert.deepEqual(mapped.parameters.target, base.parameters.target);
        assert.equal(by(skill, 'direct', 200, '-attacker-unarmed').parameters.interface.attack_type, 0);
        assert.equal(base.parameters.interface.attack_type, 1);
    }
});

function row(c, result = 0) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        living: 1, busy: config.busy ?? 0, temp: { apply: {} },
        effective_skills: { force: Math.trunc(config.skills.force / 2) + (config.skills[config.mappings.force] ?? 0) },
        weapon: config.equipment?.type === 'xsword' ? 'sword' : config.equipment?.type ?? 'none',
        weapon_details: config.equipment ? { program: '/tests/' + config.equipment.type } : {},
    }));
    const raw = { outcome: 'observed', before, immediate: structuredClone(before), launches: [], attacks: [], defenses: [],
        interfaces: [{ function: p.interface?.function, result }], metrics: [{}, {}] };
    if (p.ability !== 'query_effect_parry') raw.defenses.push({ actor: 0, target: 1, skill: p.skill,
        incoming: 1000, result, route: p.ability === 'valid_damage' ? 'interface' : p.ability });
    if (p.ability === 'direct') { raw.metrics[0].direct = 1; raw.metrics[1].qi_cost = result ? 0 : 500; }
    return raw;
}
const negation = { damage: -1000, msg: '原化解文字' };

test('五档招架系数独立于化解门槛，箫按真实sword类型、针按pin类型核验', () => {
    assert.deepEqual([79, 80, 199, 200, 279, 280, 349, 350, 800].map(l => taijiParryCoefficient('taiji-quan', l, 'none')),
        [0, 50, 50, 80, 80, 100, 100, 120, 120]);
    for (const c of cases.filter(c => c.parameters.ability === 'query_effect_parry')) {
        const raw = row(c); raw.interfaces[0].result = taijiParryCoefficient(c.parameters.skill, c.parameters.level, raw.before[1].weapon);
        validateSchoolCombatRecord(raw, c);
        raw.immediate[1].neili--; assert.throws(() => validateSchoolCombatRecord(raw, c));
    }
    const x = by('taiji-jian', 'query_effect_parry', 200, '-xsword'), r = row(x, 80);
    validateSchoolCombatRecord(r, x); r.before[1].weapon_details.program = '/tests/sword';
    assert.throws(() => validateSchoolCombatRecord(r, x));
});

test('99级拒绝化解、100级原资格生效，不用低概率随机作门槛证据', () => {
    for (const skill of ['taiji-quan', 'taiji-jian']) {
        const low = by(skill, 'valid_damage', 99, '-force200'), min = by(skill, 'valid_damage', 100, '-force200');
        validateSchoolCombatRecord(row(low), low);
        assert.throws(() => validateSchoolCombatRecord(row(low, negation), low));
        validateSchoolCombatRecord(row(min, negation), min);
        assert.throws(() => validateSchoolCombatRecord(row(min), min));
    }
});

test('原随机公式只核对必定成功/失败边界，不强制随机率；忙乱与无内力不是接口禁用条件', () => {
    for (const skill of ['taiji-quan', 'taiji-jian']) {
        const zero = by(skill, 'valid_damage', 200, '-basic-force-count300');
        validateSchoolCombatRecord(row(zero), zero);
        assert.throws(() => validateSchoolCombatRecord(row(zero, negation), zero));
        const full = by(skill, 'direct', 800);
        validateSchoolCombatRecord(row(full, negation), full);
        assert.throws(() => validateSchoolCombatRecord(row(full), full));
        const mixed = by(skill, 'valid_damage', 400, '-mapped-force-count0');
        validateSchoolCombatRecord(row(mixed), mixed); validateSchoolCombatRecord(row(mixed, negation), mixed);
        for (const suffix of ['-busy', '-neili0']) {
            const c = by(skill, 'valid_damage', 200, suffix);
            validateSchoolCombatRecord(row(c), c); validateSchoolCombatRecord(row(c, negation), c);
        }
    }
});

test('太极拳持主手、太极剑持非剑禁止化解；公共直伤须实际落实返回', () => {
    for (const [skill, suffix] of [['taiji-quan', '-sword'], ['taiji-jian', '-none'], ['taiji-jian', '-pin']]) {
        const c = by(skill, 'valid_damage', 200, suffix);
        validateSchoolCombatRecord(row(c), c); assert.throws(() => validateSchoolCombatRecord(row(c, negation), c));
    }
    const c = by('taiji-jian', 'direct', 800), r = row(c, negation);
    r.metrics[1].qi_cost = 1; assert.throws(() => validateSchoolCombatRecord(r, c));
    const q = by('taiji-quan', 'valid_damage'), v = row(q, negation);
    v.immediate[1].neili--; assert.throws(() => validateSchoolCombatRecord(v, q));
});

test('未进入化解接口不能由零伤害推断化解；其他方向回调不混入分母', () => {
    const raw = row(by('taiji-quan', 'valid_damage'), negation);
    raw.defenses.push({ ...raw.defenses[0], actor: 1, target: 0 });
    const result = schoolDefenseEffects([{ outcome: 'observed', raw }], wudangDefenses);
    assert.equal(result.calls, 1); assert.equal(result.samples_with_negation.successes, 1);
    raw.defenses = []; raw.metrics[1].qi_cost = 0;
    const none = schoolDefenseEffects([{ outcome: 'observed', raw }], wudangDefenses);
    assert.equal(none.calls, 0); assert.equal(none.negated_per_call.rate, null);
    assert.equal(none.samples_with_negation.successes, 0);
});
