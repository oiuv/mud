import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { gumuUnarmedMoves, gumuUnarmedConditions, validateGumuUnarmedRecord,
    gumuUnarmedEffects, gumuUnarmedFixtureRequirements, validateGumuUnarmedLoads } from './school_gumu_unarmed_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = gumuUnarmedConditions(catalog);
function pick(ability, suffix = '', level = 200) {
    const d = gumuUnarmedMoves.find(x => x.ability === ability);
    const c = cases.find(x => x.id === `school-gumu-unarmed-${d.skill}-${ability}-l${level}${suffix}`);
    assert.ok(c); return c;
}

// Deliberately synthetic; these traces test the collector, never game outcomes.
function trace(c, success = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, side) => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
        object: `/tests/actor#${side}`, cultivation: { character: cfg.properties.character },
        perform_grant: cfg.properties[`can_perform/${p.skill}/${p.ability}`] ?? null,
        neili: 6000, max_neili: 6000, ...cfg.properties, skills: structuredClone(cfg.skills),
        mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations ?? {}),
        weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? 0,
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)
                - Number(k === 'dodge' && !!cfg.equipment)])),
        temp: { apply: { armor: 100, ...(cfg.equipment ? { dodge: -1 } : {}) } },
    }));
    const r = { before, immediate: structuredClone(before), metrics: [{}, {}],
        outcome: p.expected, launches: [], attacks: [], dropped: [], reason: '' };
    if (p.skill === 'wudu-shenzhang') r.skill_load_context = {
        actor: before[0].object, already_loaded: 0, skills: structuredClone(before[0].skills),
        command: 'enable parry wudu-shenzhang',
    };
    if (p.expected === 'refused') { r.reason = '此刻不能施展'; return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    if (p.ability === 'you') {
        r.metrics[0].neili_cost = success ? 100 : 0;
        r.metrics[0].direct = Number(success); r.immediate[0].busy = success ? 2 : 3;
        if (success) {
            r.metrics[1].qi_cost = 80; r.metrics[1].eff_qi_cost = 20;
            r.immediate[1].qi -= 80; r.immediate[1].eff_qi -= 20;
        }
    } else if (p.ability === 'wang') {
        r.metrics[0].neili_cost = 60; r.immediate[0].busy = success ? 3 : 1;
        if (success) r.immediate[1].busy = Math.trunc(before[0].skills[p.skill] / 16) + 2;
    } else {
        r.metrics[0].neili_cost = success ? 80 : 30; r.immediate[0].busy = success ? 1 : 2;
        let ap = before[0].skills[p.skill] + Math.trunc(before[0].skills.dodge / 2);
        if (before[1].shen > 0) ap += Math.trunc(ap * 10 / 100);
        if (before[1].gender !== '女性') ap += Math.trunc(ap * 15 / 100);
        if (success) r.immediate[1].busy = Math.trunc(ap / 45) + 1;
    }
    r.immediate[0].neili -= r.metrics[0].neili_cost;
    return r;
}

test('三项原徒手绝招70条件2884计划记录，保留门槛与原文依据', () => {
    assert.equal(gumuUnarmedMoves.length, 3); assert.equal(cases.length, 70);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2884);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => s.entries.map(e => e.id)));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id)); assert.equal(c.parameters.actor.properties.jiali, 0);
        assert.equal(c.parameters.observe_seconds, 0);
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        validateGumuUnarmedRecord(trace(c), c);
        if (c.parameters.expected === 'observed') {
            const r = trace(c, true), [b, t] = r.before;
            let ap = b.skills[c.parameters.skill] + Math.trunc(b.skills.dodge / 2);
            if (t.shen > 0) ap += Math.trunc(ap / 10);
            if (t.gender !== '女性') ap += Math.trunc(ap * 15 / 100);
            const possible = c.parameters.ability === 'you'
                ? b.effective_skills.force - 1 > Math.trunc(t.effective_skills.force / 2)
                : c.parameters.ability === 'wang'
                    ? b.skills[c.parameters.skill] - 1 > Math.trunc(t.skills.dodge / 2)
                    : ap - 1 > Math.trunc(t.effective_skills.dodge / 2);
            if (possible) validateGumuUnarmedRecord(r, c);
            else assert.throws(() => validateGumuUnarmedRecord(r, c));
        }
    }
    const smoke = gumuUnarmedConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 140);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.equal(gumuUnarmedFixtureRequirements.length, 3);
    assert.throws(() => gumuUnarmedConditions({ skills: [] }));
    for (const samples of [0, -1, 1.5, NaN]) assert.throws(() => gumuUnarmedConditions(catalog, { samples }));
});

test('原内功、轻功与准备门槛分别核对，不将学习资格强加给施展', () => {
    for (const d of gumuUnarmedMoves) {
        for (const suffix of ['-no-grant', '-low-skill', '-low-neili', '-no-prepare', '-no-map', '-weapon']) {
            const c = pick(d.ability, suffix); assert.equal(c.parameters.expected, 'refused');
            validateGumuUnarmedRecord(trace(c), c);
        }
        assert.equal(pick(d.ability, '-minimum-skill').parameters.actor.skills[d.skill], d.minimum);
        assert.equal(pick(d.ability, '-minimum-neili').parameters.actor.properties.neili, d.neili);
        const metric = d.force ? 'force' : 'dodge', min = d.force ?? d.dodgeMinimum;
        for (const low of [false, true]) {
            const c = pick(d.ability, `-${low ? 'low' : 'minimum'}-${metric}`), r = trace(c);
            assert.equal(r.before[0].effective_skills[metric], min - Number(low));
            validateGumuUnarmedRecord(r, c);
        }
    }
    for (const ability of ['wang', 'huan']) {
        const c = pick(ability, '-no-force-threshold');
        assert.equal(c.parameters.expected, 'observed');
        assert.equal(trace(c).before[0].effective_skills.force, 2);
    }
});

test('直伤未命中不收费，控制失败费用不同；低防仍允许原random等于零', () => {
    for (const ability of ['you', 'wang', 'huan']) {
        const c = pick(ability, '-low-defense');
        for (const success of [false, true]) validateGumuUnarmedRecord(trace(c, success), c);
        const high = pick(ability, '-high-defense');
        assert.throws(() => validateGumuUnarmedRecord(trace(high, true), high));
        const r = trace(c); r.metrics[0].neili_cost++; r.immediate[0].neili--;
        assert.throws(() => validateGumuUnarmedRecord(r, c));
    }
    assert.equal(trace(pick('you')).immediate[0].neili, 6000);
    assert.equal(trace(pick('wang')).immediate[0].neili, 5940);
    assert.equal(trace(pick('huan')).immediate[0].neili, 5970);
});

test('千幻原始轻功与目标性别正邪顺序整除影响控制，不能替换为有效等级', () => {
    const expected = [
        ['', 7], ['-female-shen1', 8], ['-male-shen0', 8], ['-male-shen1', 9],
        ['-raw-dodge-2', 5], ['-raw-dodge-400', 9],
    ];
    for (const [suffix, busy] of expected) {
        const c = pick('huan', suffix), r = trace(c, true);
        assert.equal(r.immediate[1].busy, busy); validateGumuUnarmedRecord(r, c);
        r.immediate[1].busy++; assert.throws(() => validateGumuUnarmedRecord(r, c));
    }
    for (const basic of [2, 400]) assert.equal(trace(pick('huan', `-raw-dodge-${basic}`)).before[0].effective_skills.dodge, 300);
    for (const special of [1, 10000]) {
        const c = pick('wang', `-target-dodge-mapped-${special}`), r = trace(c, true);
        assert.equal(r.before[1].skills.dodge, 200);
        assert.equal(r.before[1].effective_skills.dodge, 100 + special - 1);
        assert.equal(r.immediate[1].busy, 14); validateGumuUnarmedRecord(r, c);
    }
});

test('已有忙乱：幽居可攻击但不改忙乱，两个控制入口拒绝', () => {
    for (const ability of ['you', 'wang', 'huan']) {
        const c = pick(ability, '-target-busy'), r = trace(c, true);
        assert.equal(c.parameters.expected, ability === 'you' ? 'observed' : 'refused');
        assert.equal(r.immediate[1].busy, 50); validateGumuUnarmedRecord(r, c);
    }
});

test('拒绝与成功都保留身份、资源和临时属性，不能用缺失观测冒充零', () => {
    const c = pick('you'), denied = pick('you', '-low-neili');
    for (const condition of [c, denied]) for (const mutate of [
        r => { r.before[0].userp = 0; }, r => { r.before[1].wizardp = 1; },
        r => { r.before[0].preparations = {}; }, r => { r.before[0].cultivation.character = '狡黠多变'; },
        r => { r.before[0].effective_skills.force++; }, r => { r.metrics[0] = null; },
        r => { r.metrics[0].direct = null; }, r => { r.metrics[0].neili_cost = null; },
        r => { r.immediate[1].qi--; }, r => { r.immediate[0].temp.apply.attack = -70; },
        r => { r.attacks.push({}); }, r => { r.dropped.push({}); },
    ]) { const r = trace(condition); mutate(r); assert.throws(() => validateGumuUnarmedRecord(r, condition)); }
    const r = trace(denied); r.launches.push({});
    assert.throws(() => validateGumuUnarmedRecord(r, denied));
});

test('施展、直伤结算、控制和未知分母分别保留，不称为胜率或持续秒数', () => {
    const c = pick('you');
    const rows = [trace(c), trace(c, true), {}].map(raw => ({ outcome: 'observed', raw }));
    rows.push({ outcome: 'refused', raw: {} });
    const e = gumuUnarmedEffects(rows);
    assert.equal(e.samples, 3); assert.equal(e.direct_resolution.trials, 2);
    assert.equal(e.direct_resolution.successes, 1); assert.equal(e.control_applied.successes, 0);
    assert.equal(e.neili_cost.mean, 50); assert.equal(e.neili_cost.unknown, 1);
    assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(gumuUnarmedEffects([]).direct_resolution.rate, null);
    const r = trace(c); r.metrics[0].direct = null; r.metrics[0].neili_cost = null;
    const unknown = gumuUnarmedEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(unknown.direct_resolution.trials, 0); assert.equal(unknown.neili_cost.mean, null);
});

test('已有11877条件完整指纹不变，统一入口实际分发本批验证', () => {
    const all = schoolCombatConditions(catalog);
    const old = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school)
        && !['quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group)
        || ['gumu-control', 'gumu-direct', 'gumu-advanced'].includes(c.parameters.collection_group));
    assert.equal(old.length, 11877); assert.equal(old.reduce((n, c) => n + c.samples, 0), 300102);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '993303e13a5da4b5f925bde83326c3d0610dac34def3b1b85d23c7e8743f3908');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-unarmed'), cases);
    for (const c of cases) validateSchoolCombatRecord(trace(c), c);
});

test('已观测undefined忙乱可归零，缺少忙乱、领悟与五毒首次加载上下文不可冒充通过', () => {
    const c = pick('huan'), r = trace(c);
    for (const state of [...r.before, r.immediate[1]]) state.busy = null;
    validateGumuUnarmedRecord(r, c);
    const e = gumuUnarmedEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(e.target_busy.mean, 0); assert.equal(e.control_applied.trials, 1);
    for (const mutate of [
        row => { delete row.before[0].busy; }, row => { delete row.immediate[1].busy; },
        row => { delete row.before[0].perform_grant; }, row => { row.before[0].perform_grant = 0; },
        row => { delete row.skill_load_context; }, row => { row.skill_load_context.actor = 'wrong'; },
        row => { row.skill_load_context.skills.strike++; },
    ]) { const row = structuredClone(r); mutate(row); assert.throws(() => validateGumuUnarmedRecord(row, c)); }
});

test('独立徒手进程必须留存实际首次加载者，不用后续已加载记录冒充', () => {
    const c = pick('huan'), a = trace(c), b = trace(c);
    a.condition_id = b.condition_id = c.id;
    b.skill_load_context.already_loaded = 1;
    validateGumuUnarmedLoads([a, b]);
    a.skill_load_context.already_loaded = 1;
    assert.throws(() => validateGumuUnarmedLoads([a, b]));
    a.skill_load_context.already_loaded = 0; delete b.skill_load_context;
    assert.throws(() => validateGumuUnarmedLoads([a, b]));
});
