import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaAttacks, taohuaAttackConditions, taohuaAttackSourcePaths,
    validateTaohuaAttackRecord, taohuaAttackEffects } from './school_taohua_attack_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const sha = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const catalog = { skills: taohuaAttacks.map(d => {
    const path = `kungfu/skill/${d.skill}.c`, text = read(path), parsed = scanSource(text);
    assert.deepEqual(parsed.lexical_issues, []);
    assert.ok(parsed.functions.some(f => f.name === 'query_action'));
    assert.equal(parsed.functions.some(f => f.name === 'hit_ob'), false);
    return { id: d.skill, path, sha256: sha(text), entries: [] };
}) };
const cases = taohuaAttackConditions(catalog, read), smoke = taohuaAttackConditions(catalog, read, { smoke: true });
const choose = (skill = 'canglang-zhi', tag = 'baseline', level = 200) => {
    const c = cases.find(c => c.parameters.skill === skill && c.parameters.variant === tag && c.parameters.level === level);
    assert.ok(c); return c;
};
function snapshot(cfg, side) {
    const apply = { armor: 100, ...(cfg.equipment ? { damage: 50, dodge: -1 } : {}) };
    const special = key => key.includes('/') || key === 'character';
    return { ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !special(k))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => special(k))),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left', userp: 1, interactive: 1,
        wizardp: 0, living: 1, ghost: 0, fighting_opponent: 1, busy: null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), temp: { apply }, conditions: null,
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k,
            Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (apply[k] ?? 0)])),
        weapon: cfg.equipment ? 'sword' : 'none', weapon_details: cfg.equipment ? {
            object: '/tests/sword#' + (200 + side), program: '/tests/sword', skill_type: 'sword',
            weight: 3000, damage: 50, flag: 4, consistence: 100, material: null, rigidity: null, no_wield: null,
        } : {}, secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}
function raw(c, { extra = false, result = 0, passive = true } = {}) {
    const p = c.parameters, before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const immediate = structuredClone(before);
    const action = extra ? { action: '兰花额外动作合成夹具', weapon: '兰花指', force: 200, attack: 100,
        dodge: 300, parry: 300, damage: 100, damage_type: '点穴' }
        : { action: '普通动作合成夹具', lvl: 0, force: 100, damage: 1, damage_type: '瘀伤' };
    immediate[0].neili -= extra ? 300 : 0;
    const passiveBefore = structuredClone(immediate);
    if (result === 0) { immediate[1].qi -= 100; immediate[1].eff_qi -= 10; }
    const metrics = [{ [result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry']: 1 }, {}];
    for (const side of [0, 1]) for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
        const value = before[side][k] - immediate[side][k]; if (value) metrics[side][k + '_cost'] = value;
    }
    return { condition_id: c.id, method: 'ordinary', outcome: 'observed', before, immediate,
        after: structuredClone(immediate), metrics, actions: [{ actor: 0, target: 1, skill: p.skill, action }],
        attacks: [{ actor: 0, target: 1, type: 0, result }],
        passives: result === 0 && passive ? [{ actor: 0, target: 1, route: 'martial', skill: p.skill,
            incoming: 100, factor: 0, result: null, before: passiveBefore, after: structuredClone(passiveBefore) }] : [],
        interfaces: [], launches: [], dropped: [], skill_loads: [] };
}
const wrap = r => ({ condition_id: r.condition_id, outcome: r.outcome, raw: r });

test('有限条件和烟雾数量，独立来源摘要', () => {
    assert.equal(cases.length, 25); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2108);
    assert.equal(smoke.length, 25); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 25);
    assert.equal(new Set(cases.map(c => c.id)).size, 25);
    assert.ok(cases.every(c => Object.keys(c.parameters.source_evidence).length === taohuaAttackSourcePaths.length));
    assert.deepEqual(taohuaAttackConditions(catalog, read), cases);
});
test('六门普通命中、闪避、招架与到达零伤害后的无被动记录', () => {
    for (const d of taohuaAttacks) for (const result of [0, -1, -2]) validateTaohuaAttackRecord(raw(choose(d.skill), { result }), choose(d.skill));
    const c = choose(); validateTaohuaAttackRecord(raw(c, { passive: false }), c);
});
test('兰花额外动作扣费与最后是否命中独立', () => {
    const c = choose('lanhua-shou', 'extra-enabled');
    for (const result of [0, -1, -2]) validateTaohuaAttackRecord(raw(c, { extra: true, result }), c);
    validateTaohuaAttackRecord(raw(c), c);
});
test('额外动作真实严格门槛，边界不会被合成通过', () => {
    for (const tag of ['level100', 'jingluo100', 'neili1000']) {
        const c = choose('lanhua-shou', tag, tag === 'level100' ? 100 : 200);
        validateTaohuaAttackRecord(raw(c), c);
        assert.throws(() => validateTaohuaAttackRecord(raw(c, { extra: true }), c));
    }
    const minimum = choose('lanhua-shou', 'minimum-extra', 101);
    validateTaohuaAttackRecord(raw(minimum, { extra: true }), minimum);
});
test('选招严格等级前缀及额外动作数值不接受缺失或伪造', () => {
    const c = choose('luoying-shenzhang'), r = raw(c);
    r.actions[0].action.lvl = 200; assert.throws(() => validateTaohuaAttackRecord(r, c));
    const l = choose('lanhua-shou', 'extra-enabled'), q = raw(l, { extra: true });
    q.actions[0].action.damage = 99; assert.throws(() => validateTaohuaAttackRecord(q, l));
});
test('身份、真实计数、费用、事件及状态缺失均拒绝', () => {
    const c = choose();
    for (const mutate of [
        r => { r.before[0].wizardp = 1; }, r => { r.condition_id = 'other'; },
        r => { r.before[1].object = r.before[0].object; }, r => { delete r.metrics[1]; },
        r => { delete r.before[0].busy; }, r => { delete r.immediate[1].conditions; },
        r => { r.metrics[1].qi_cost = 99; }, r => { r.passives[0].skill = 'another'; },
        r => { delete r.passives[0].result; }, r => { r.actions.push(r.actions[0]); },
        r => { r.passives[0].after[0].neili--; }, r => { r.immediate[1].weapon_details.damage++; },
        r => { delete r.before[1].weapon_details.rigidity; }, r => { delete r.before[1].weapon_details.no_wield; },
    ]) { const r = raw(c); mutate(r); assert.throws(() => validateTaohuaAttackRecord(r, c)); }
});
test('原主手可磨损，目标与未命中主手不得伪造磨损', () => {
    const c = choose('luoying-shenjian'), r = raw(c);
    r.immediate[0].weapon_details.consistence = 99; r.after = structuredClone(r.immediate);
    validateTaohuaAttackRecord(r, c);
    const miss = raw(c, { result: -2 }); miss.immediate[0].weapon_details.consistence = 99;
    miss.after = structuredClone(miss.immediate); assert.throws(() => validateTaohuaAttackRecord(miss, c));
    const target = raw(c); target.immediate[1].weapon_details.consistence = 99;
    target.after = structuredClone(target.immediate); assert.throws(() => validateTaohuaAttackRecord(target, c));
});
test('原命中三分类及快速/反击计数逐侧核对', () => {
    const c = choose();
    for (const mutate of [r => { r.metrics[0].hit = null; }, r => { r.metrics[0].hit = -1; },
        r => { r.metrics[0].hit = 99; }, r => { delete r.metrics[0].hit; },
        r => { r.metrics[1].hit = 99; }, r => { r.metrics[0].dodge = 1; },
        r => { r.metrics[0].quick = 1; }, r => { r.metrics[1].riposte = 1; }]) {
        const r = raw(c); mutate(r); assert.throws(() => validateTaohuaAttackRecord(r, c));
    }
});
test('报告保留实际分母、未知记录及台账与原始记录同源', () => {
    const c = choose('lanhua-shou', 'extra-enabled');
    const failure = { condition_id: c.id, outcome: 'error', raw: { condition_id: c.id, outcome: 'error', reason: '合成故障' } };
    const rows = [wrap(raw(c, { extra: true })), wrap(raw(c, { result: -1 })), failure];
    const stats = taohuaAttackEffects(rows, c);
    assert.equal(stats.samples, 2); assert.equal(stats.unknown_or_unobserved, 1);
    assert.equal(stats.hit.trials, 2); assert.equal(stats.lanhua_extra_action.trials, 2);
    assert.throws(() => taohuaAttackEffects([{ ...rows[0], outcome: 'refused' }], c));
    assert.throws(() => taohuaAttackEffects([{ ...rows[0], outcome: 'error' }], c));
    assert.throws(() => taohuaAttackEffects([{ ...failure, condition_id: 'other' }], c));
    assert.throws(() => taohuaAttackEffects([{ ...failure, raw: { condition_id: 'other', outcome: 'error' } }], c));
    assert.throws(() => taohuaAttackEffects([{ outcome: 'error' }], c));
    const empty = taohuaAttackEffects([failure], c);
    assert.equal(empty.hit.trials, 0); assert.equal(empty.actor_neili_cost.n, 0);
});

console.log(JSON.stringify({ preparation: 'taohua-attack', real_samples: 0, conditions: cases.length,
    planned_formal: cases.reduce((n, c) => n + c.samples, 0), planned_smoke: smoke.length,
    formal_sha256: sha(cases), smoke_sha256: sha(smoke), source_count: taohuaAttackSourcePaths.length,
    source_sha256: sha(Object.entries(cases[0].parameters.source_evidence)) }));
