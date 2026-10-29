import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { piaoxuConditions, validatePiaoxuRecord } from './school_piaoxu_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = piaoxuConditions(catalog, read);
const find = suffix => cases.find(c => c.id.endsWith(suffix));
function row(c, enhanced = true) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, i) => ({
        ...structuredClone(cfg.properties), object: '/tests/actor#' + i, userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, living: 1, ghost: 0,
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), learned: {}, busy: cfg.busy ?? null,
        temp: { apply: { armor: 100 } }, piao_grant: cfg.properties['can_perform/piaoxu-zhang/piao'] ?? null,
        weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'none' : cfg.equipment?.type ?? 'none',
        secondary_weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none',
        secondary_weapon_details: cfg.equipment?.slot === 'secondary_weapon' ? { program: '/tests/sword' } : {},
        effective_skills: { force: Math.trunc(cfg.skills.force / 2) + (cfg.skills['xueshan-neigong'] ?? 0),
            strike: Math.trunc(cfg.skills.strike / 2) + (cfg.mappings.strike ? cfg.skills['piaoxu-zhang'] : 0) },
    }));
    const preparation = p.target_state === 'unconscious' ? { before: structuredClone(before[1]),
        terminals: [{ side: 1, state: 'unconscious' }] } : null;
    if (preparation) {
        before[1].living = 0; before[1].qi = 0; before[1].jing = 0;
        preparation.after = structuredClone(before[1]);
    }
    const r = { method: c.method, outcome: p.expected, before, immediate: structuredClone(before),
        launches: [], interfaces: [], attacks: [], directs: [], passives: [], metrics: [{}, {}],
        command_accepted: p.expected === 'observed' ? 1 : 0, reason: p.refusal,
        refusals: c.method === 'perform' && p.expected === 'refused' ? [{ actor: before[0].object, reason: p.refusal }] : [],
        ...(preparation ? { preparation } : {}) };
    const [b, t] = before, [a, v] = r.immediate;
    if (c.method === 'interface') {
        r.interfaces.push({ ...p.interface, result: p.expected_result });
        if (p.ability === 'practice_skill' && p.expected_result) {
            a.qi -= 45; a.neili -= 25; r.metrics[0].qi_cost = 45; r.metrics[0].neili_cost = 25;
        }
    } else if (p.expected === 'observed') {
        const isPiao = p.ability === 'piao';
        let bonus = 0;
        if (isPiao) {
            if (p.target.skills.force >= 100000) enhanced = false;
            bonus = enhanced ? Math.trunc(b.skills['piaoxu-zhang'] / 5) : 0;
            r.launches.push({ actor: b.object, skill: p.skill, argument: 'piao right' });
            a.busy = 0; a.learned[p.skill] = 1; a.neili -= 50;
        }
        for (let i = 0; i < (isPiao ? 3 : 1); i++) {
            r.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 10,
                attack_usage: 'strike', attack_skill: p.skill, apply_attack: bonus, apply_unarmed_damage: 0 });
            if (b.jiali && a.neili > b.jiali) {
                a.neili -= b.jiali;
                r.passives.push({ actor: 0, target: 1, route: 'force', skill: 'xueshan-neigong', factor: b.jiali, result: 10 });
            }
            r.passives.push({ actor: 0, target: 1, route: 'martial', skill: p.skill,
                factor: 0, incoming: 10, result: null });
        }
        v.qi -= r.attacks.length * 10; v.eff_qi -= r.attacks.length;
        r.metrics[1].qi_cost = t.qi - v.qi; r.metrics[1].eff_qi_cost = t.eff_qi - v.eff_qi;
        r.metrics[0].neili_cost = b.neili - a.neili;
    }
    r.after = structuredClone(r.immediate);
    return r;
}

test('飘絮46条件1270正式/92独立烟雾，当前真实入口及来源钉住', () => {
    assert.equal(cases.length, 46); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1270);
    assert.equal(piaoxuConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 92);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 's1-piaoxu'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    assert.throws(() => piaoxuConditions(catalog, path => read(path) + ' '), /重新审阅/);
});
test('原学习门槛和练习费用独立，未适用查询0不是资格拒绝', () => {
    assert.equal(find('valid_enable-sword').parameters.expected, 'observed');
    assert.equal(find('valid_enable-sword').parameters.expected_result, 0);
    for (const suffix of ['valid_learn-force29', 'valid_learn-max-neili99', 'valid_learn-minimum-basic19',
        'valid_learn-basic199', 'valid_learn-weapon', 'valid_learn-secondary_weapon',
        'practice_skill-qi59', 'practice_skill-neili49']) assert.equal(find(suffix).parameters.expected, 'refused');
    const c = find('practice_skill-baseline'), r = row(c);
    r.immediate[0].qi++; r.after = structuredClone(r.immediate);
    assert.throws(() => validatePiaoxuRecord(r, c));
    const bad = structuredClone(find('valid_learn-force29')); bad.parameters.expected_result = 1;
    assert.throws(() => validatePiaoxuRecord(row(bad), bad));
});
test('原piao只三击、只增加攻击；增强失败仍三击，忙乱0也是合法观察', () => {
    const c = find('piao-l400-jiali50');
    validatePiaoxuRecord(row(c, false), c); validatePiaoxuRecord(row(c, true), c);
    for (const mutate of [r => r.attacks.push(r.attacks[0]),
        r => { r.attacks[0].apply_unarmed_damage = 20; },
        r => { r.attacks[0].apply_attack = 40; },
        r => { r.immediate[0].busy = 3; },
        r => { r.immediate[0].temp.apply.attack = 80; }]) {
        const r = row(c); mutate(r); r.after = structuredClone(r.immediate);
        assert.throws(() => validatePiaoxuRecord(r, c));
    }
    const high = find('piao-high-dp'); validatePiaoxuRecord(row(high), high);
});
test('原内功回调与费用对应，拒绝不能夹带发动，普通攻击也要核对实际技能', () => {
    for (const suffix of ['ordinary-l400-jiali50', 'piao-l400-jiali50']) {
        const c = find(suffix), r = row(c); r.passives.shift(); assert.throws(() => validatePiaoxuRecord(r, c));
        const wrong = row(c); wrong.attacks[0].attack_skill = 'lingxiao-quan';
        assert.throws(() => validatePiaoxuRecord(wrong, c));
    }
    const c = find('piao-actor-busy'), r = row(c); r.refusals = [];
    assert.throws(() => validatePiaoxuRecord(r, c));
    const u = find('piao-unconscious'), unconscious = row(u); delete unconscious.preparation.before;
    assert.throws(() => validatePiaoxuRecord(unconscious, u));
});
test('真实runner接线包括早期拒绝、直伤空数组和副手原对象，而非只靠合成样本', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /"s1-piaoxu",\s*"mingjiao-qishang"[\s\S]{0,100}current\["directs"\] = \(\{\}\);/);
    assert.match(runner, /"s1-piaoxu"[\s\S]{0,200}result\["piao_grant"\] = serializable/);
    const c = find('piao-secondary-only'), r = row(c);
    validatePiaoxuRecord(r, c); r.before[0].secondary_weapon_details.program = '/fake/sword';
    assert.throws(() => validatePiaoxuRecord(r, c));
    const missing = row(c); delete missing.directs; assert.throws(() => validatePiaoxuRecord(missing, c));
});

test('拳脚空回调仍须逐次记录且不混入内功费用，不接受额外路由或伪造效果', () => {
    const c = find('ordinary-l200-jiali0'); validatePiaoxuRecord(row(c), c);
    for (const mutate of [r => { r.passives = []; }, r => { r.passives[0].result = 1; },
        r => { r.passives[0].route = 'unknown'; }, r => { r.passives[0].target = 0; }]) {
        const r = row(c); mutate(r); assert.throws(() => validatePiaoxuRecord(r, c));
    }
});
