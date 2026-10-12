import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { emeiWeapons, emeiWeaponConditions, validateEmeiWeaponRecord, emeiWeaponEffects } from './school_emei_weapons_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan, schoolCombatMarkdown, schoolCombatEffects } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = emeiWeaponConditions(catalog);
const pick = (skill, ability, suffix = '', level = 200) => {
    const c = cases.find(x => x.id === `school-emei-weapons-${skill}-${ability}-l${level}${suffix}`);
    assert.ok(c); return c;
};

// Synthetic event records validate the collector only, not the original gameplay.
function raw(c, direct = 0) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000,
        jing: 10000, eff_jing: 10000, neili: 6000, max_neili: 6000, ...cfg.properties,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        effective_skills: { force: Math.trunc(cfg.skills.force / 2) + (cfg.skills[cfg.mappings.force] ?? 0) },
        weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? 0, temp: { apply: {} },
    }));
    const r = { outcome: p.expected, before, immediate: structuredClone(before), metrics: [{}, {}],
        launches: [], attacks: [], dropped: [], reason: '' };
    if (r.outcome === 'refused') { r.reason = '此刻不能施展'; return r; }
    if (c.method === 'ordinary') { r.attacks.push({ actor: 0, target: 1, type: 0 }); return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    r.metrics[0].direct = direct;
    const cost = { xian: 75, jue: 400, mie: direct ? 150 : 60, huan: 80, fumo: 150 }[p.ability];
    r.metrics[0].neili_cost = cost; r.immediate[0].neili -= cost;
    r.immediate[0].busy = { xian: 3, jue: 2, mie: direct ? 2 : 3, huan: 1, fumo: 3 }[p.ability];
    if (p.ability === 'huan') r.attacks = Array.from({ length: 5 }, () => ({ actor: 0, target: 1, type: 0 }));
    if (direct) {
        r.immediate[1].qi -= direct * 100; r.immediate[1].eff_qi -= direct * 10;
        r.metrics[1].qi_cost = direct * 100; r.metrics[1].eff_qi_cost = direct * 10;
    }
    return r;
}

test('峨嵋独立用例为四门兵器五个绝招，97条件3330计划记录，来源和ID闭合', () => {
    assert.equal(emeiWeapons.length, 4); assert.equal(emeiWeapons.flatMap(x => x.moves).length, 5);
    assert.equal(cases.length, 97); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3330);
    assert.equal(new Set(cases.map(x => x.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id), c.entry_id);
        assert.equal(c.parameters.actor.properties.gender, '女性');
        assert.equal(c.parameters.actor.properties['family/family_name'], '峨嵋派');
        assert.equal(c.parameters.actor.properties.jiali, 0);
        assert.equal(c.parameters.observation, 'single_action_immediate');
        for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
        const certainHit = c.id.endsWith('-low-defense') && ['xian', 'fumo'].includes(c.parameters.ability);
        validateEmeiWeaponRecord(raw(c, certainHit ? 1 : 0), c);
    }
    assert.equal(emeiWeaponConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 194);
    assert.throws(() => emeiWeaponConditions({ skills: [] }));
    assert.throws(() => emeiWeaponConditions(catalog, { samples: 0 }));
});

test('原始等级、有效内功与内力门槛分别配置，不凭统一模板补门槛', () => {
    for (const d of emeiWeapons) for (const move of d.moves) {
        const low = pick(d.skill, move.ability, '-low-skill'), minimum = pick(d.skill, move.ability, '-minimum-skill');
        assert.equal(low.parameters.actor.skills[d.skill], move.minimum - 1);
        assert.equal(minimum.parameters.actor.skills[d.skill], move.minimum);
        assert.equal(low.parameters.expected, 'refused'); assert.equal(minimum.parameters.expected, 'observed');
        assert.equal(pick(d.skill, move.ability, '-low-neili').parameters.actor.properties.neili, move.neili - 1);
        assert.equal(pick(d.skill, move.ability, '-minimum-neili').parameters.actor.properties.neili, move.neili);
        if (move.force) for (const suffix of ['-low-force', '-minimum-force']) {
            const c = pick(d.skill, move.ability, suffix), r = raw(c);
            validateEmeiWeaponRecord(r, c);
            r.before[0].effective_skills.force++; assert.throws(() => validateEmeiWeaponRecord(r, c));
        } else assert.equal(pick(d.skill, move.ability, '-no-force-threshold').parameters.expected, 'observed');
    }
    assert.ok(!cases.some(c => c.parameters.actor.temp), '无预写强化或命中结果');
});

test('峨嵋兵器接入原注册与校验，烟雾和正式参数不混用', () => {
    const registered = schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'emei-weapons');
    assert.deepEqual(registered, cases);
    validateSchoolCombatPlan(registered, catalog);
    assert.throws(() => validateSchoolCombatPlan(emeiWeaponConditions(catalog, { smoke: true }), catalog));
    for (const c of registered) {
        const hit = c.id.endsWith('-low-defense') && ['xian', 'fumo'].includes(c.parameters.ability);
        validateSchoolCombatRecord(raw(c, hit ? 1 : 0), c);
    }
    const c = pick('huifeng-jian', 'jue'), r = raw(c, 3);
    assert.throws(() => validateSchoolCombatRecord({ ...r, metrics: null }, c));
    const text = schoolCombatMarkdown({ fingerprint: 'test', evidence_sha256: 'test',
        totals: { conditions: 1, samples: 1, observed: 1, refused: 0, errors: 0 },
        conditions: [{ id: c.id, parameters: c.parameters, counts: { observed: 1, refused: 0 },
            emei_weapons: emeiWeaponEffects([{ outcome: 'observed', raw: r }]),
            sides: [{ metrics: { neili_cost: { mean: 400 } } },
                { metrics: { qi_cost: { mean: 300 }, eff_qi_cost: { mean: 30 } } }],
            effects: schoolCombatEffects([{ outcome: 'observed', raw: r }]),
            recorded: 1, planned: 1 }] });
    assert.match(text, /峨嵋兵器：直伤与普通连击/);
    assert.match(text, /3.00\/0.00/); assert.match(text, /300.00\/30.00/);
});

test('资格拒绝不允许收费、伤害、偷偷施展或非真实玩家身份', () => {
    const c = pick('huifeng-jian', 'jue', '-no-grant'), r = raw(c);
    validateEmeiWeaponRecord(r, c);
    for (const change of [
        x => { x.metrics[0].neili_cost = 1; }, x => { x.immediate[1].qi--; },
        x => { x.launches.push({ skill: 'huifeng-jian', argument: 'jue' }); },
        x => { x.before[0].userp = 0; }, x => { x.before[1].wizardp = 1; },
        x => { x.metrics[0] = null; }, x => { x.metrics[0].direct = null; },
    ]) { const bad = structuredClone(r); change(bad); assert.throws(() => validateEmeiWeaponRecord(bad, c)); }
    const noMap = pick('emei-jian', 'xian', '-no-map');
    assert.ok(!Object.hasOwn(noMap.parameters.actor.mappings, 'sword'));
    validateEmeiWeaponRecord(raw(noMap), noMap);
});

test('绝剑允许零至五段独立直伤，不把未中算施展失败或把文案算内力损失', () => {
    const c = pick('huifeng-jian', 'jue');
    for (let n = 0; n <= 5; n++) validateEmeiWeaponRecord(raw(c, n), c);
    for (const change of [
        x => { x.metrics[0].direct = 6; }, x => { x.metrics[0].direct = 1.5; },
        x => { x.metrics[0].neili_cost = 500; x.immediate[0].neili = x.before[0].neili - 500; },
        x => { x.immediate[0].busy = 7; }, x => { x.immediate[1].neili--; },
    ]) { const bad = raw(c); change(bad); assert.throws(() => validateEmeiWeaponRecord(bad, c)); }
    const high = pick('huifeng-jian', 'jue', '-high-defense');
    validateEmeiWeaponRecord(raw(high), high);
    assert.throws(() => validateEmeiWeaponRecord(raw(high, 1), high));
});

test('灭剑成败费用不同，普通直伤与雁行连击不混为同一事件', () => {
    for (const [skill, ability] of [['emei-jian', 'xian'], ['huifeng-jian', 'mie'], ['yitian-jian', 'fumo']]) {
        const c = pick(skill, ability);
        for (const direct of [0, 1]) validateEmeiWeaponRecord(raw(c, direct), c);
        assert.throws(() => validateEmeiWeaponRecord(raw(c, 2), c));
    }
    for (const [skill, ability] of [['emei-jian', 'xian'], ['yitian-jian', 'fumo']]) {
        const c = pick(skill, ability, '-low-defense');
        validateEmeiWeaponRecord(raw(c, 1), c);
        assert.throws(() => validateEmeiWeaponRecord(raw(c), c));
    }
    const h = pick('yanxing-dao', 'huan'), r = raw(h);
    for (const n of [1, 3, 5]) {
        const x = structuredClone(r); x.attacks.length = n; validateEmeiWeaponRecord(x, h);
    }
    for (const change of [
        x => { x.attacks = []; }, x => { x.attacks.push({ actor: 0, target: 1, type: 0 }); },
        x => { x.metrics[0].direct = 1; }, x => { x.immediate[0].temp.apply.attack = 30; },
    ]) { const bad = structuredClone(r); change(bad); assert.throws(() => validateEmeiWeaponRecord(bad, h)); }
});

test('大乘修养和目标正邪单独编号，普通攻击三档保留原等级', () => {
    for (const mahayana of [0, 800]) {
        const c = pick('emei-jian', 'xian', `-mahayana${mahayana}`);
        assert.equal(c.parameters.actor.skills.mahayana, mahayana); assert.equal(c.samples, 100);
        validateEmeiWeaponRecord(raw(c, 1), c);
    }
    for (const level of [200, 400, 800]) {
        const evil = pick('yitian-jian', 'fumo', '-evil-target', level);
        assert.equal(evil.parameters.target.properties.shen, -200000);
        validateEmeiWeaponRecord(raw(evil), evil);
        for (const d of emeiWeapons) {
            const c = pick(d.skill, 'ordinary', '', level);
            assert.equal(c.parameters.actor.skills[d.skill], level);
            validateEmeiWeaponRecord(raw(c), c);
        }
    }
});

test('统计只使用已观察事件，损伤与创伤分列，缺少计数不是零', () => {
    const r = raw(pick('huifeng-jian', 'jue'), 3);
    const missing = structuredClone(r); delete missing.metrics; delete missing.attacks;
    const e = emeiWeaponEffects([{ outcome: 'observed', raw: r }, { outcome: 'observed', raw: missing },
        { outcome: 'refused', raw: {} }, { outcome: 'error', raw: {} }]);
    assert.equal(e.samples, 2); assert.equal(e.unknown_or_unobserved, 2);
    assert.equal(e.direct_calls.mean, 3); assert.equal(e.direct_calls.unknown, 1);
    assert.equal(e.any_direct_call.trials, 1); assert.equal(e.any_direct_call.rate, 1);
    assert.equal(e.regular_attacks.unknown, 1);
    assert.equal(e.target_loss.qi.mean, 300); assert.equal(e.target_loss.eff_qi.mean, 30);
    assert.equal(e.target_loss.neili.mean, 0);
    assert.equal(emeiWeaponEffects([]).direct_calls.mean, null);
    assert.equal(emeiWeaponEffects([]).any_direct_call.rate, null);
});
