import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { gumuDirectMoves, gumuDirectConditions, validateGumuDirectRecord, gumuDirectEffects } from './school_gumu_direct_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = gumuDirectConditions(catalog);
const pick = (ability, suffix = '', level = 200) => {
    const c = cases.find(c => c.parameters.ability === ability && c.parameters.level === level
        && c.id === `school-gumu-direct-${c.parameters.skill}-${ability}-l${level}${suffix}`);
    assert.ok(c); return c;
};

// Synthetic traces are collector tests only; never append them to the live sample ledger.
function raw(c, { direct, disarmed } = {}) {
    const p = c.parameters, low = c.id.endsWith('-low-defense');
    direct ??= low ? (p.ability === 'feng' ? 2 : p.ability === 'he' ? 0 : 1)
        : /-low-target-(parry|dodge)$/.test(c.id) ? 1 : 0;
    disarmed ??= p.ability === 'feng' && (low || c.id.endsWith('-low-target-force'));
    const before = [p.actor, p.target].map((cfg, side) => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
        neili: 6000, max_neili: 6000, ...cfg.properties, skills: structuredClone(cfg.skills),
        mappings: structuredClone(cfg.mappings), weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? 0,
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)
                + (k === 'dodge' && cfg.equipment ? -1 : 0)])),
        temp: { apply: cfg.equipment ? { dodge: -1 } : {} },
        weapon_details: cfg.equipment ? { object: '/tests/weapon#' + side } : {},
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        metrics: [{}, {}], launches: [], attacks: [], dropped: [], reason: '' };
    if (p.expected === 'refused') { r.reason = '此刻不能施展'; return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    const cost = p.ability === 'he' ? (direct ? 350 : 0)
        : p.ability === 'feng' ? (!p.target.equipment ? 300 : disarmed ? 350 : 330) : direct ? 220 : 100;
    r.metrics[0].direct = direct; r.metrics[0].neili_cost = cost; r.immediate[0].neili -= cost;
    r.immediate[0].busy = p.ability === 'he' ? (direct ? 2 : 3)
        : p.ability === 'feng' ? 2 : direct ? 2 : 4;
    if (direct) {
        r.immediate[1].qi -= direct * 100; r.immediate[1].eff_qi -= direct * 20;
        r.metrics[1].qi_cost = direct * 100; r.metrics[1].eff_qi_cost = direct * 20;
    }
    if (disarmed) {
        r.immediate[1].weapon = 'none'; r.immediate[1].weapon_details = {};
        r.dropped.push({ type: before[1].weapon, object: before[1].weapon_details.object });
    }
    return r;
}

test('古墓四项直伤：独立93条件4008计划记录，所有来源与烟雾参数闭合', () => {
    assert.equal(gumuDirectMoves.length, 4); assert.equal(cases.length, 93);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4008);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => s.entries.map(e => e.id)));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id));
        assert.equal(c.parameters.collection_group, 'gumu-direct');
        assert.equal(c.parameters.actor.properties.jiali, 0);
        assert.equal(c.parameters.observe_seconds, 0);
        for (const file of c.parameters.qualification_sources) assert.ok(existsSync(join(root, file)), file);
        validateGumuDirectRecord(raw(c), c);
    }
    const smoke = gumuDirectConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 186);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.throws(() => gumuDirectConditions({ skills: [] }));
    for (const samples of [0, -1, 1.5, NaN]) assert.throws(() => gumuDirectConditions(catalog, { samples }));
});

test('接入统一分发，原11683条件的数量和完整JSON指纹不变', () => {
    const all = schoolCombatConditions(catalog);
    const old = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school)
        && !['quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group)
        || c.parameters.collection_group === 'gumu-control');
    assert.equal(old.length, 11683);
    assert.equal(old.reduce((n, c) => n + c.samples, 0), 292266);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '2017f94ea37ec6d81149a8287d6fb0ca937084028a1ea8c3939d8dabeae9d8c1');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-direct'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) validateSchoolCombatRecord(raw(c), c);
    const c = pick('feng'), invalid = raw(c); invalid.metrics[0].direct = 3;
    assert.throws(() => validateSchoolCombatRecord(invalid, c));
});

test('原未设busy的null为已知零；缺观察不能冒充零，有效轻功包含原装备修正', () => {
    for (const c of cases) {
        const r = raw(c);
        for (const states of [r.before, r.immediate])
            for (const state of states) if (state.busy === 0) state.busy = null;
        validateGumuDirectRecord(r, c);
        for (const [part, side] of [['before', 0], ['before', 1], ['immediate', 0], ['immediate', 1]]) {
            const missing = structuredClone(r); delete missing[part][side].busy;
            assert.throws(() => validateGumuDirectRecord(missing, c));
        }
    }
    const c = pick('he'), r = raw(c);
    assert.equal(r.before[0].effective_skills.dodge, 299);
    r.before[0].effective_skills.dodge = 300;
    assert.throws(() => validateGumuDirectRecord(r, c));
});

test('资格分别采集原始等级、有效内功与资源，不把合璧强制要求领悟或两把剑', () => {
    for (const d of gumuDirectMoves) {
        assert.equal(pick(d.ability, '-no-grant').parameters.expected, d.grant ? 'refused' : 'observed');
        for (const offset of [-1, 0]) {
            const label = offset ? 'low' : 'minimum';
            assert.equal(pick(d.ability, `-${label}-skill`).parameters.actor.skills[d.skill], d.minimum + offset);
            assert.equal(pick(d.ability, `-${label}-neili`).parameters.actor.properties.neili, d.neili + offset);
            const c = pick(d.ability, `-${label}-force`), r = raw(c);
            assert.equal(r.before[0].effective_skills.force, d.force + offset);
            validateGumuDirectRecord(r, c);
            r.before[0].effective_skills.force++; assert.throws(() => validateGumuDirectRecord(r, c));
        }
    }
    assert.equal(pick('he', '-low-quanzhen').parameters.actor.skills['quanzhen-jian'], 49);
    assert.equal(pick('he', '-minimum-quanzhen').parameters.expected, 'observed');
    assert.equal(pick('he', '-yunv0').parameters.expected, 'observed');
    assert.equal(pick('he', '-yunv0').parameters.actor.skills['yunv-jian'], 0);
    assert.deepEqual(pick('he').parameters.actor.equipment, { type: 'sword', hold: false });
    assert.ok(!cases.some(c => c.parameters.actor.temp || c.parameters.actor.secondary_equipment));
});

test('合璧命中扣350、失败不扣，不将低防的随机失败判为采集错误', () => {
    for (const suffix of ['', '-low-defense', '-no-grant', '-yunv0']) {
        const c = pick('he', suffix);
        for (const direct of [0, 1]) validateGumuDirectRecord(raw(c, { direct }), c);
    }
    const high = pick('he', '-high-defense');
    assert.throws(() => validateGumuDirectRecord(raw(high, { direct: 1 }), high));
    const c = pick('he');
    for (const change of [
        r => { r.metrics[0].direct = 2; },
        r => { r.metrics[0].neili_cost = 100; r.immediate[0].neili -= 100; },
        r => { r.immediate[0].busy = 2; },
    ]) { const r = raw(c); change(r); assert.throws(() => validateGumuDirectRecord(r, c)); }
});

test('风神诀两段直伤与缴械独立，地上实物身份与330／350／300支出闭合', () => {
    const c = pick('feng');
    for (const direct of [0, 1, 2]) for (const disarmed of [false, true])
        validateGumuDirectRecord(raw(c, { direct, disarmed }), c);
    const bare = pick('feng', '-target-unarmed');
    for (const direct of [0, 1, 2]) validateGumuDirectRecord(raw(bare, { direct }), bare);
    for (const change of [
        r => { r.metrics[0].direct = 3; }, r => { r.dropped = []; },
        r => { r.dropped[0].object = '/tests/unrelated#3'; },
        r => { r.metrics[0].neili_cost = 330; r.immediate[0].neili = r.before[0].neili - 330; },
        r => { r.immediate[0].busy = 6; }, r => { r.immediate[1].weapon = 'sword'; },
    ]) { const r = raw(c, { direct: 1, disarmed: true }); change(r); assert.throws(() => validateGumuDirectRecord(r, c)); }
    const low = pick('feng', '-low-defense'), high = pick('feng', '-high-defense');
    validateGumuDirectRecord(raw(low), low); validateGumuDirectRecord(raw(high), high);
    assert.throws(() => validateGumuDirectRecord(raw(low, { direct: 1 }), low));
    assert.throws(() => validateGumuDirectRecord(raw(high, { disarmed: true }), high));
    for (const field of ['parry', 'dodge']) {
        const lo = pick('feng', '-low-target-' + field), hi = pick('feng', '-high-target-' + field);
        for (const direct of [1, 2]) validateGumuDirectRecord(raw(lo, { direct }), lo);
        for (const direct of [0, 1]) validateGumuDirectRecord(raw(hi, { direct }), hi);
        assert.throws(() => validateGumuDirectRecord(raw(lo, { direct: 0 }), lo));
        assert.throws(() => validateGumuDirectRecord(raw(hi, { direct: 2 }), hi));
    }
    assert.equal(pick('feng', '-additional-whips').parameters.actor.skills['sanwu-shou'], 200);
    assert.equal(pick('feng', '-additional-whips').parameters.actor.skills['yunzhou-fufa'], 200);
});

test('无孔不入的性别／正邪对照分开，开天辟地与其成败费用、忙乱不混用', () => {
    for (const level of [200, 400, 800]) {
        const profiles = ['', '-righteous-female', '-neutral-male', '-righteous-male'].map(s => pick('kong', s, level));
        assert.deepEqual(profiles.map(c => [c.parameters.target.properties.gender, c.parameters.target.properties.shen]),
            [['女性', 0], ['女性', 200000], ['男性', 0], ['男性', 200000]]);
        for (const c of profiles) for (const direct of [0, 1]) validateGumuDirectRecord(raw(c, { direct }), c);
    }
    for (const ability of ['kai', 'kong']) {
        const c = pick(ability);
        for (const direct of [0, 1]) validateGumuDirectRecord(raw(c, { direct }), c);
        const r = raw(c, { direct: 1 }); r.immediate[0].busy = 1;
        if (ability === 'kong') validateGumuDirectRecord(r, c);
        else assert.throws(() => validateGumuDirectRecord(r, c));
    }
});

test('拒绝、错误身份、未知计数、漏报资源、遗留强化不能误报通过', () => {
    for (const d of gumuDirectMoves) {
        const c = pick(d.ability, '-low-neili');
        for (const change of [
            r => { r.immediate[1].qi--; }, r => { r.before[0].userp = 0; },
            r => { r.before[1].wizardp = 1; }, r => { r.launches.push({}); },
            r => { r.attacks.push({}); }, r => { r.metrics[0] = null; },
            r => { r.metrics[0].direct = null; }, r => { r.metrics[0].neili_cost = null; },
            r => { r.metrics[1].qi_cost = 1; }, r => { r.metrics[1].eff_qi_cost = null; },
        ]) { const r = raw(c); change(r); assert.throws(() => validateGumuDirectRecord(r, c)); }
        const normal = pick(d.ability);
        for (const change of [
            r => { r.immediate[0].temp.apply.attack = 10; },
            r => { r.metrics[1].qi_cost++; }, r => { r.immediate[1].neili--; },
            r => { r.launches[0].argument = 'other'; }, r => { r.immediate[0].qi--; },
        ]) { const r = raw(normal, { direct: 1 }); change(r); assert.throws(() => validateGumuDirectRecord(r, normal)); }
    }
});

test('统计不把两段视为独立样本，不将原本空手算缴械失败，缺证据保持未知', () => {
    const rows = [raw(pick('feng'), { direct: 2, disarmed: true }), raw(pick('feng')),
        raw(pick('feng', '-target-unarmed'), { direct: 1 }), { outcome: 'observed' }]
        .map(r => ({ outcome: r.outcome, raw: r }));
    rows.push({ outcome: 'refused', raw: {} });
    const e = gumuDirectEffects(rows);
    assert.equal(e.samples, 4); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(e.any_direct_call.trials, 3); assert.equal(e.any_direct_call.successes, 2);
    assert.equal(e.disarmed_when_held.trials, 2); assert.equal(e.disarmed_when_held.successes, 1);
    assert.equal(e.unmeasured_weapon_state, 1); assert.equal(e.direct_calls.unknown, 1);
    assert.equal(e.target_loss.qi.mean, 100); assert.equal(e.target_loss.eff_qi.mean, 20);
    assert.equal(e.neili_cost.mean, (350 + 330 + 300) / 3);
    const unknown = raw(pick('he')); unknown.metrics[0].direct = null;
    assert.equal(gumuDirectEffects([{ outcome: 'observed', raw: unknown }]).any_direct_call.trials, 0);
    assert.equal(gumuDirectEffects([]).direct_calls.mean, null);
});
