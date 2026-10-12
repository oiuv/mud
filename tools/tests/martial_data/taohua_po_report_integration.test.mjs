import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaPoConditions, taohuaPoEffects } from './school_taohua_po_cases.mjs';
import { taohuaPoReport, schoolCombatEffects, schoolCombatMarkdown } from './school_combat_report.mjs';
import { summarizeSamples } from './statistics.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const catalog = { skills: ['tanzhi-shentong', 'tanzhi-shentong/po'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', source = readFileSync(join(root, path), 'utf8');
    const parsed = scanSource(source); assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: parsed.functions.filter(fn => fn.name === 'perform')
        .map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'perform' })) };
}) };
const cases = taohuaPoConditions(catalog), skill = 'tanzhi-shentong';
const flower = '/d/items/throwing/taohua_ban';
const pick = (tag = 'baseline') => {
    const condition = cases.find(c => c.id === 'school-taohua-po-' + tag);
    assert.ok(condition, tag); return condition;
};
function sword(side) {
    return { program: '/tests/sword', object: '/tests/sword#' + (200 + side), skill_type: 'sword',
        weight: 3000, damage: 50, flag: 4, consistence: 100, material: null, no_wield: null,
        amount: null, daub: {}, rigidity: null };
}
function snapshot(cfg, side, fighting) {
    const equipment = cfg.equipment, armed = !!equipment && !equipment.hold;
    const apply = { armor: 100, ...(armed ? { damage: 50, dodge: -1 } : {}) };
    const fields = Object.entries(cfg.properties), object = '/tests/actor#' + (100 + side);
    const hand = !equipment?.hold ? {} : equipment.type === 'sword' ? sword(side) : {
        program: flower, object: flower + '#300', skill_type: 'throwing', flag: 8,
        weight: equipment.amount, amount: equipment.amount, material: 'wood', consistence: 100,
        damage: 2, no_wield: '暗器不是用来装备的。\n', stable: null, daub: {}, rigidity: null };
    return { ...Object.fromEntries(fields.filter(([key]) => !key.includes('/'))),
        cultivation: Object.fromEntries(fields.filter(([key]) => key.includes('/'))),
        object, id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1,
        wizardp: 0, living: 1, ghost: 0, fighting_opponent: Number(fighting), busy: null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), learned: {}, conditions: null,
        temp: { apply, ...(equipment?.hold ? { handing: hand.object } : {}),
            ...(armed ? { weapon: sword(side).object } : {}) },
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: armed ? 'sword' : 'none', weapon_details: armed ? sword(side) : {},
        weapon_damage: armed ? 50 : 0, weapon_flag: armed ? 4 : 0,
        secondary_weapon: 'none', secondary_weapon_details: {},
        handing: equipment?.hold ? equipment.type : 'none', handing_details: hand,
        ammunition: equipment?.hold ? equipment.type === 'throwing' ? equipment.amount : null : 0 };
}

// Synthetic report inputs only: never written to series, logs, or real sample ledgers.
function trace(condition, { hit, wound, disarm = false, progress = 1, index = 0, cost = 23 } = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 }); preparation.after = structuredClone(before[1]);
    }
    const old = p.target.equipment ? { ...sword(1), environment: before[1].object, equipped: 'wielded' } : {};
    const raw = { kind: 'sample', condition_id: condition.id, index, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        command_accepted: accepted ? cost : 0, launches: [], refusals: [], needle_hits: [],
        attacks: [], passives: [], defenses: [], dodge_checks: [], interfaces: [],
        dropped: [], terminals: [], callbacks: [], reason: '', elapsed: 0.01,
        po_equipment: { actor_room: '/tests/runner', target_room: '/tests/runner',
            target_weapon: { before: structuredClone(old), immediate: structuredClone(old), after: {} } },
        ...(preparation ? { preparation } : {}) };
    const [actor, target] = raw.immediate;
    if (accepted) {
        hit ??= p.gate_expectation !== 'miss';
        raw.launches = [{ actor: before[0].object, skill, argument: 'po right' }];
        raw.metrics[0] = { neili_cost: 300, ability_launched: 1 };
        actor.neili -= 300; actor.busy = hit ? 2 : 3;
        actor.handing_details.amount--; actor.ammunition--;
        if (actor.ammunition > 0) actor.handing_details.weight = actor.ammunition;
        if (progress) actor.learned[skill] = progress;
        if (hit) {
            const ap = Math.trunc(p.actor.skills.finger / 2) + 2 * p.actor.skills[skill]
                + Math.trunc(p.actor.skills.throwing / 2);
            wound ??= Math.trunc(ap / 2);
            target.eff_qi -= wound; target.qi = Math.min(target.qi, target.eff_qi);
            raw.metrics[1] = { eff_qi_cost: wound, qi_cost: before[1].qi - target.qi };
            raw.needle_hits = [{ actor: 0, target: 1, program: flower,
                object: before[0].handing_details.object, damage_bonus: p.actor.properties.jiali + 300 }];
            if (disarm && p.target.equipment) {
                Object.assign(target, { weapon: 'none', weapon_details: {}, weapon_damage: 0, weapon_flag: 0 });
                delete target.temp.weapon; target.temp.apply.damage -= 50; target.temp.apply.dodge += 1;
                target.effective_skills.dodge++;
                Object.assign(raw.po_equipment.target_weapon.immediate, { environment: '/tests/runner', equipped: null });
                raw.dropped.push({ object: before[1].weapon_details.object, name: '演武兵器', type: 'sword', no_wield: null });
            }
        }
    } else {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals = [{ actor: before[0].object, reason: raw.reason }];
    }
    raw.po_equipment.target_weapon.after = structuredClone(raw.po_equipment.target_weapon.immediate);
    raw.after = structuredClone(raw.immediate);
    const empty = accepted && p.actor.equipment.amount === 1;
    raw.ammo_cleanup = { checked: 1, object_exists: Number(!!p.actor.equipment && !empty),
        handing_object: !p.actor.equipment || empty ? null : before[0].handing_details.object };
    if (empty) {
        Object.assign(raw.after[0], { handing: 'none', handing_details: {}, ammunition: 0 });
        raw.after[0].temp.handing = null;
    }
    return raw;
}
const row = raw => ({ condition_id: raw.condition_id, index: raw.index,
    outcome: raw.outcome, reason: raw.reason, raw });
const error = (condition, index = 0) => row({ kind: 'sample', condition_id: condition.id, index,
    method: condition.method, outcome: 'error', reason: '原错误 | <详情>\n第二行', elapsed: 0.01 });
function report(condition, rows) {
    const result = summarizeSamples({ fingerprint: 'synthetic-only', identity: { conditions: [condition], execution: {} } }, rows);
    Object.assign(result.conditions[0], { effects: schoolCombatEffects(rows), taohua_po: taohuaPoReport(rows, condition) });
    return { ...result, evidence_sha256: 'synthetic-only', totals: { conditions: 1, samples: rows.length,
        observed: rows.filter(r => r.outcome === 'observed').length,
        refused: rows.filter(r => r.outcome === 'refused').length, errors: rows.filter(r => r.outcome === 'error').length } };
}

test('消费原冻结 condition，19 条契约不改，原件无 parameters 且不被补写', () => {
    assert.equal(hash(cases), 'ee880690ba7e83ae10650a077f15024ab3376418fdbf1cc46e0b5584d0fba436');
    assert.equal(hash(taohuaPoConditions(catalog, { smoke: true })), '8d7498c44125df052c37d4cffb57b8766fbd973a27a936137ed8f31e5285a21e');
    for (const condition of cases) {
        const rows = [row(trace(condition))], prior = JSON.stringify({ condition, rows });
        assert.equal(Object.hasOwn(rows[0].raw, 'parameters'), false);
        const summary = report(condition, rows).conditions[0];
        assert.deepEqual(summary.taohua_po.effects, taohuaPoEffects(rows, condition));
        assert.equal(summary.recorded, 1); assert.equal(summary.missing, condition.samples - 1);
        assert.equal(summary.sides.length, 2); assert.equal(Object.hasOwn(summary.taohua_po, 'coverage'), false);
        assert.equal(JSON.stringify({ condition, rows }), prior);
        assert.throws(() => taohuaPoReport(rows, summary), '统计摘要不能代替原 condition.samples');
    }
    const source = readFileSync(join(root, 'tools/tests/martial_data/school_combat_report.mjs'), 'utf8');
    assert.match(source, /condition\.taohua_po = taohuaPoReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\)/);
});

test('命令成本、受理、实际命中与持兵命中缴械使用不同分母', () => {
    const condition = pick();
    const rows = [row(trace(condition, { hit: false, cost: 1 })),
        row(trace(condition, { index: 1, cost: 23 })),
        row(trace(condition, { index: 2, cost: 476, disarm: true })), error(condition, 3)];
    const result = report(condition, rows), c = result.conditions[0], s = c.taohua_po, e = s.effects;
    assert.deepEqual(c.counts, { observed: 3, refused: 0, error: 1, not_applicable: 0 });
    assert.equal(c.missing, 96); assert.equal(s.commands.accepted_execution_cost.mean, 500 / 3);
    assert.equal(s.commands.refused_execution_cost.mean, null);
    assert.deepEqual([e.hit.successes, e.hit.trials, e.disarm_among_armed_hits.successes,
        e.disarm_among_armed_hits.trials, e.disarm_per_accepted.trials], [2, 3, 1, 2, 3]);
    assert.equal(e.unknown_effect_samples, 1); assert.equal(e.wound.mean, 200); assert.equal(e.wound_on_hit.mean, 300);
    assert.equal(e.actor_neili_cost.mean, 300); assert.equal(e.ammunition_cost.mean, 1);
    assert.equal(c.sides[0].metrics.hit.mean, 0); assert.equal(c.sides[0].metrics.direct.mean, 0);
    const md = schoolCombatMarkdown(result);
    assert.match(md, /4\/100 \| 3\/0\/1\/0\/96/); assert.match(md, /166\.67 \[5\.40, 385\.40\]/);
    assert.match(md, /2\/3；66\.67%/); assert.match(md, /1\/2；50\.00%/);
    assert.match(md, /本招不是破甲/); assert.match(md, /普攻计数为零不能当作绝招失手/);
    assert.match(md, /原错误 \\\| &lt;详情&gt;<br>第二行/);
});

test('错误、缺样本和全拒绝保留未知，不制造零费用正常样本', () => {
    for (const rows of [[], [error(pick())]]) {
        const result = report(pick(), rows), c = result.conditions[0], e = c.taohua_po.effects;
        assert.equal(c.missing, 100 - rows.length); assert.equal(e.hit.trials, 0); assert.equal(e.hit.rate, null);
        assert.equal(e.actor_neili_cost.mean, null); assert.equal(c.taohua_po.commands.accepted_execution_cost.n, 0);
        const md = schoolCombatMarkdown(result);
        assert.match(md, /未知（分母0）/); assert.match(md, /未观察（n=0，未知=0）/);
        assert.doesNotMatch(md, /0\/0；0\.00%/);
    }
    const condition = pick('no-grant'), rows = [row(trace(condition))];
    const result = report(condition, rows), s = result.conditions[0].taohua_po;
    assert.equal(s.effects.refused_samples, 1); assert.equal(s.effects.accepted_samples, 0);
    assert.equal(s.commands.refused_execution_cost.mean, 0); assert.equal(s.effects.actor_neili_cost.mean, null);
    assert.equal(s.refusals[0].reason, rows[0].raw.reason);
    assert.match(schoolCombatMarkdown(result), /\\x1b\[256D/);
});

test('创伤与当前气血夹制分列，回调实参不是二次实伤', () => {
    const condition = pick('target-qi9000'), rows = [row(trace(condition))];
    const s = taohuaPoReport(rows, condition), e = s.effects;
    assert.equal(e.hit.successes, 1); assert.equal(e.wound.mean, 300);
    assert.equal(e.qi_clamp.mean, 0); assert.equal(e.target_qi_net_loss.mean, 0);
    assert.equal(e.needle_calls.mean, 1); assert.equal(e.hit_bonus.mean, 300);
    const md = schoolCombatMarkdown(report(condition, rows));
    assert.match(md, /目标已有伤时可以命中而当前气血不降/);
    assert.match(md, /回调实参 jiali\+300 不是额外实伤/);
    for (const mutate of [r => { r.metrics[1].qi_cost = 300; }, r => { r.needle_hits[0].damage_bonus++; }]) {
        const invalid = structuredClone(rows); mutate(invalid[0].raw);
        assert.throws(() => taohuaPoReport(invalid, condition));
    }
});

test('缴械只认原物移至同房间，卸兵属性变化不是护甲减益', () => {
    const condition = pick(), rows = [row(trace(condition, { disarm: true }))];
    const s = taohuaPoReport(rows, condition);
    assert.deepEqual(Object.fromEntries(Object.entries(s.target_apply_delta).map(([key, value]) => [key, value.mean])),
        { damage: -50, dodge: 1, parry: 0, armor: 0 });
    for (const mutate of [r => { r.po_equipment.target_weapon.after.environment = '/other'; },
        r => { r.po_equipment.target_weapon.immediate.object = '/tests/sword#999'; },
        r => { r.immediate[1].temp.apply.armor--; }, r => { delete r.before[1].temp.apply; }]) {
        const invalid = structuredClone(rows); mutate(invalid[0].raw);
        assert.throws(() => taohuaPoReport(invalid, condition));
    }
    const bare = pick('unarmed-target'), effect = taohuaPoReport([row(trace(bare))], bare).effects;
    assert.equal(effect.disarm_among_armed_hits.trials, 0); assert.equal(effect.disarm_among_armed_hits.rate, null);
    assert.equal(effect.disarm_per_accepted.rate, 0);
});

test('最后一片保留同步命中与原自然清理，不推导忙乱解除或清理秒数', () => {
    const condition = pick('last-ammo');
    const rows = [row(trace(condition)), row(trace(condition, { index: 1, hit: false }))];
    const result = report(condition, rows), c = result.conditions[0], s = c.taohua_po;
    assert.deepEqual([s.effects.natural_empty_cleanup.successes, s.effects.natural_empty_cleanup.trials], [2, 2]);
    assert.equal(s.effects.busy.mean, 2.5); assert.equal(c.effects.target_busy.mean, 0);
    assert.equal(c.sides[0].busy_seconds.mean, null);
    assert.equal(rows[0].raw.immediate[0].handing_details.amount, 0);
    assert.equal(rows[0].raw.immediate[0].handing_details.weight, 1);
    assert.equal(rows[0].raw.after[0].handing, 'none');
    assert.match(schoolCombatMarkdown(result), /未测自然解除秒数/);
    for (const mutate of [r => { delete r.ammo_cleanup; }, r => { r.ammo_cleanup.object_exists = 1; },
        r => { r.immediate[0].handing_details.weight = 0; }, r => { r.after[0] = structuredClone(r.immediate[0]); }]) {
        const invalid = structuredClone(rows); mutate(invalid[0].raw);
        assert.throws(() => taohuaPoReport(invalid, condition));
    }
});

test('外层与 raw 的 ID、入口、结果、理由、索引严格同源且不接受重复/越界', () => {
    const condition = pick();
    const mutations = [r => { r.condition_id = 'other'; }, r => { delete r.condition_id; },
        r => { r.raw.condition_id = 'other'; }, r => { r.raw.method = 'attack'; },
        r => { r.index = 1; }, r => { delete r.raw.index; }, r => { r.index = r.raw.index = -1; },
        r => { r.index = r.raw.index = 100; }, r => { r.index = r.raw.index = 0.5; },
        r => { r.outcome = 'refused'; }, r => { r.raw.outcome = r.outcome === 'error' ? 'observed' : 'error'; },
        r => { r.outcome = r.raw.outcome = 'not_applicable'; }, r => { r.reason = 'different'; },
        r => { delete r.raw.reason; }];
    for (const original of [row(trace(condition)), error(condition)]) for (const mutate of mutations) {
        const invalid = structuredClone(original); mutate(invalid);
        assert.throws(() => taohuaPoReport([invalid], condition));
    }
    const valid = row(trace(condition)); assert.throws(() => taohuaPoReport([valid, valid], condition));
    const blank = error(condition); blank.reason = blank.raw.reason = ' ';
    assert.throws(() => taohuaPoReport([blank], condition));
});
