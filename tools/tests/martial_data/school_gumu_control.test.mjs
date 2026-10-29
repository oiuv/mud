import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { gumuControls, gumuControlConditions, validateGumuControlRecord, gumuControlEffects } from './school_gumu_control_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = gumuControlConditions(catalog);
const pick = (skill, suffix = '', level = 200) => {
    const c = cases.find(x => x.parameters.skill === skill && x.parameters.level === level
        && x.id === `school-gumu-control-${skill}-${x.parameters.ability}-l${level}${suffix}`);
    assert.ok(c); return c;
};

// Synthetic traces exercise validation, never count as actual game samples.
function raw(c, applied = c.id.endsWith('-low-defense')) {
    const p = c.parameters, d = gumuControls.find(x => x.skill === p.skill);
    const before = [p.actor, p.target].map(cfg => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
        neili: 6000, max_neili: 6000, ...cfg.properties, skills: structuredClone(cfg.skills),
        mappings: structuredClone(cfg.mappings), weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? 0,
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)
                + (k === 'dodge' && cfg.equipment ? -1 : 0)])),
        temp: { apply: cfg.equipment ? { dodge: -1 } : {} },
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        metrics: [{}, {}], launches: [], attacks: [], dropped: [], reason: '' };
    if (p.expected === 'refused') { r.reason = '此刻不能施展'; return r; }
    r.launches.push({ skill: d.skill, argument: d.ability });
    r.metrics[0].neili_cost = d.cost; r.immediate[0].neili -= d.cost;
    r.immediate[0].busy = d.ability === 'mei' ? (applied ? 1 : 2) : 1;
    if (applied) r.immediate[1].busy = ['mei', 'dian'].includes(d.ability) ? 2
        : Math.trunc(before[0].effective_skills[d.skill] / (d.ability === 'wei' ? 20 : 25)) + 2;
    return r;
}

test('四个古墓控制入口独立准备：71条件2102计划记录，不假称已实测', () => {
    assert.equal(gumuControls.length, 4); assert.equal(cases.length, 71);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2102);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => s.entries.map(e => e.id)));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id));
        assert.equal(c.parameters.collection_group, 'gumu-control');
        assert.equal(c.parameters.observe_seconds, 0);
        assert.equal(c.parameters.actor.properties.jiali, 0);
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        validateGumuControlRecord(raw(c), c);
    }
    const smoke = gumuControlConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 142);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.throws(() => gumuControlConditions({ skills: [] }));
    for (const samples of [0, -1, 1.5, NaN]) assert.throws(() => gumuControlConditions(catalog, { samples }));
});

test('古墓控制接入统一采集和校验，保留此前11612条件的完整指纹', () => {
    const all = preOctober29SchoolConditions(catalog);
    const old = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school)
        && !['quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 11612);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        'f1025bda9e7e6005ed0b6dde3b39ad6b22cae1057404430d9bc3090a7da07fba');
    assert.equal(old.length + cases.length, 11683);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-control'), cases);
    for (const c of cases) validateSchoolCombatRecord(raw(c), c);
    const c = pick('yunv-jian'), invalid = raw(c);
    invalid.metrics[0].neili_cost++;
    assert.throws(() => validateSchoolCombatRecord(invalid, c));
});

test('依据原入口区分风魔舞不查领悟，其余三招查领悟；不把教学门槛当施展门槛', () => {
    for (const d of gumuControls) {
        const c = pick(d.skill, '-no-grant');
        assert.equal(c.parameters.expected, d.grant ? 'refused' : 'observed');
        validateGumuControlRecord(raw(c), c);
        assert.equal(pick(d.skill, '-minimum-skill').parameters.actor.skills[d.skill], d.minimum);
        assert.equal(pick(d.skill, '-low-skill').parameters.actor.skills[d.skill], d.minimum - 1);
        assert.equal(pick(d.skill, '-minimum-neili').parameters.actor.properties.neili, d.neili);
        assert.equal(pick(d.skill, '-low-neili').parameters.actor.properties.neili, d.neili - 1);
    }
    assert.equal(pick('yunv-jian', '-minimum-skill').parameters.actor.skills['yunv-jian'], 40);
    assert.equal(pick('yunzhou-fufa', '-minimum-skill').parameters.actor.skills['yunzhou-fufa'], 60);
});

test('原始与有效轻功／内功独立，直接读取特殊技能时保留二分之一口径', () => {
    for (const [skill, metric, threshold] of [['yunv-jian', 'dodge', 60], ['yinsuo-jinling', 'force', 100]]) {
        for (const low of [false, true]) {
            const c = pick(skill, `-${low ? 'low' : 'minimum'}-${metric}`), r = raw(c);
            assert.equal(r.before[0].effective_skills[metric], threshold - Number(low));
            validateGumuControlRecord(r, c);
            r.before[0].effective_skills[metric]++; assert.throws(() => validateGumuControlRecord(r, c));
        }
    }
    for (const skill of ['yunzhou-fufa', 'sanwu-shou']) {
        const c = pick(skill), r = raw(c, true);
        assert.equal(r.before[0].effective_skills[skill], 100);
        validateGumuControlRecord(r, c);
        r.immediate[1].busy = Math.trunc(200 / (skill === 'sanwu-shou' ? 20 : 25)) + 2;
        assert.throws(() => validateGumuControlRecord(r, c));
    }
});

test('控制成功／失败均按原固定费用，拒绝不容许扣费、施展、伤害或假玩家', () => {
    for (const d of gumuControls) {
        for (const applied of [false, true]) validateGumuControlRecord(raw(pick(d.skill), applied), pick(d.skill));
        const c = pick(d.skill, '-low-neili');
        for (const change of [
            r => { r.metrics[0].neili_cost = 1; r.immediate[0].neili--; },
            r => { r.immediate[1].qi--; }, r => { r.before[0].userp = 0; },
            r => { r.before[1].wizardp = 1; }, r => { r.launches.push({}); },
            r => { r.attacks.push({ actor: 0, target: 1 }); }, r => { r.metrics[0] = null; },
            r => { r.metrics[0].direct = null; }, r => { r.metrics[0].neili_cost = null; },
        ]) { const r = raw(c); change(r); assert.throws(() => validateGumuControlRecord(r, c)); }
        const normal = pick(d.skill);
        for (const change of [
            r => { r.metrics[0].neili_cost++; r.immediate[0].neili--; },
            r => { r.metrics[0].direct = 1; }, r => { r.immediate[0].temp.apply.attack = 1; },
            r => { r.immediate[1].neili--; }, r => { r.launches[0].skill = 'wrong'; },
            r => { r.immediate[1].busy = 999; },
        ]) { const r = raw(normal); change(r); assert.throws(() => validateGumuControlRecord(r, normal)); }
    }
});

test('对方已忙不是统一拒绝条件：千姿百媚可改写，另三招拒绝', () => {
    const c = pick('yunv-jian', '-target-busy');
    for (const applied of [false, true]) validateGumuControlRecord(raw(c, applied), c);
    for (const skill of ['yinsuo-jinling', 'yunzhou-fufa', 'sanwu-shou']) {
        const refused = pick(skill, '-target-busy');
        assert.equal(refused.parameters.expected, 'refused'); validateGumuControlRecord(raw(refused), refused);
    }
    const high = pick('yunv-jian', '-high-defense');
    assert.throws(() => validateGumuControlRecord(raw(high, true), high));
    const low = pick('yunv-jian', '-low-defense');
    assert.throws(() => validateGumuControlRecord(raw(low, false), low));
    // Exp-based tests still allow random(large) == 0 against a low-exp target.
    for (const skill of ['yinsuo-jinling', 'yunzhou-fufa', 'sanwu-shou']) {
        const lowExp = pick(skill, '-low-defense');
        for (const applied of [false, true]) validateGumuControlRecord(raw(lowExp, applied), lowExp);
    }
});

test('控制计数与墙钟分开，既有忙乱被改写也可观察；缺记录不补零', () => {
    const c = pick('yunv-jian', '-target-busy');
    const rows = [raw(c, false), raw(c, true), { outcome: 'observed' }].map(r => ({ outcome: r.outcome, raw: r }));
    rows.push({ outcome: 'refused', raw: {} }, { outcome: 'error', raw: {} });
    const e = gumuControlEffects(rows);
    assert.equal(e.samples, 3); assert.equal(e.unmeasured_control, 1);
    assert.equal(e.control_applied.trials, 2); assert.equal(e.control_applied.successes, 1);
    assert.equal(e.target_busy.mean, 26); assert.equal(e.target_busy.unknown, 1);
    assert.equal(e.neili_cost.mean, 50); assert.equal(e.neili_cost.unknown, 1);
    assert.equal(e.unknown_or_unobserved, 2);
    assert.equal(gumuControlEffects([]).control_applied.rate, null);
    const invalid = raw(c, true); invalid.metrics[0].neili_cost = null;
    assert.equal(gumuControlEffects([{ outcome: 'observed', raw: invalid }]).neili_cost.mean, null);
});

test('原query_busy未设置的null计为零，有效技能包含装备修正但不能漏测', () => {
    const c = pick('yunv-jian'), r = raw(c, false);
    r.before.forEach(s => { s.busy = null; });
    r.immediate[1].busy = null;
    assert.equal(r.before[0].effective_skills.dodge, 299);
    validateSchoolCombatRecord(r, c);
    const e = gumuControlEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(e.unmeasured_control, 0);
    assert.equal(e.control_applied.trials, 1);
    assert.equal(e.control_applied.successes, 0);
    assert.equal(e.target_busy.mean, 0);
    delete r.immediate[1].busy;
    assert.throws(() => validateSchoolCombatRecord(r, c));
    assert.equal(gumuControlEffects([{ outcome: 'observed', raw: r }]).unmeasured_control, 1);
});
