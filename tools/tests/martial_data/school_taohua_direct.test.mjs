import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaDirectMoves, taohuaDirectConditions, taohuaDirectSourcePaths,
    taohuaDirectBounds, validateTaohuaDirectRecord, taohuaDirectEffects } from './school_taohua_direct_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const ids = [...new Set(taohuaDirectMoves.flatMap(d => [d.skill, `${d.skill}/${d.ability}`]))];
const catalog = { skills: ids.map(id => {
    const path = `kungfu/skill/${id}.c`, source = read(path), scanned = scanSource(source);
    assert.deepEqual(scanned.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: scanned.functions.filter(f => f.name === 'perform')
        .map(f => ({ id: `${path}:${f.line}:perform`, role: 'perform' })) };
}) };
const cases = taohuaDirectConditions(catalog, read), smoke = taohuaDirectConditions(catalog, read, { smoke: true });
const pick = (ability = 'tao', variant = 'baseline', level = 200) => {
    const c = cases.find(c => c.parameters.ability === ability && c.parameters.variant === variant && c.parameters.level === level);
    assert.ok(c, `${ability} ${variant} ${level}`); return c;
};
function snapshot(config, side) {
    const equipped = !!config.equipment, cultivationKey = k => k.includes('/') || k === 'character';
    const apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    const unarmed = Math.max(...['unarmed', 'finger', 'strike', 'hand', 'claw', 'cuff'].map(k => config.skills[k] ?? 0));
    return { ...Object.fromEntries(Object.entries(config.properties).filter(([k]) => !cultivationKey(k))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([k]) => cultivationKey(k))),
        object: `/tests/actor#${side + 100}`, id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0, fighting_opponent: 1,
        busy: null, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations), learned: {}, temp: { apply },
        effective_str: config.properties.str + Math.trunc(unarmed / 10),
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([k, n]) => [k,
            Math.trunc(n / 2) + (config.skills[config.mappings[k]] ?? 0) + (apply[k] ?? 0)])),
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0, weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { object: `/tests/sword#${side + 200}`, program: '/tests/sword',
            skill_type: 'sword', damage: 50, flag: 4, weight: 3000, consistence: 100, material: null } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

// Synthetic source-shaped traces only. These never count as driver observations.
function trace(c, { hit, input, wear = false, progress = 1, busy } = {}) {
    const p = c.parameters, d = taohuaDirectMoves.find(d => d.skill === p.skill && d.ability === p.ability);
    const accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const raw = { kind: 'sample', condition_id: c.id, method: 'perform', outcome: p.expected,
        command_accepted: Number(accepted), before, immediate: structuredClone(before), after: [],
        metrics: [{}, {}], launches: [], refusals: [], directs: [], attacks: [], dropped: [], terminals: [],
        callbacks: [], passives: [], defenses: [], interfaces: [], dodge_checks: [], reason: '', elapsed: 0.01 };
    if (accepted) {
        const bounds = taohuaDirectBounds(...before, d); hit ??= bounds.hit_numerator > 0;
        raw.launches = [{ actor: before[0].object, skill: d.skill, argument: d.ability + ' right' }];
        raw.metrics[0].ability_launched = 1;
        raw.metrics[0].neili_cost = hit ? d.hitFee : d.missFee;
        raw.immediate[0].neili -= raw.metrics[0].neili_cost;
        raw.immediate[0].busy = busy ?? (hit ? 2 : d.ability === 'tian' ? 2 : 3);
        if (progress) raw.immediate[0].learned[d.skill] = progress;
        if (hit) {
            input ??= bounds.input_min;
            raw.directs = [{ actor: 0, target: 1, type: d.usage === 'sword' ? 1 : 0, damage: input,
                percent: d.percent, weapon: d.usage === 'sword' ? 'sword' : 'none',
                weapon_object: d.usage === 'sword' ? before[0].weapon_details.object : '' }];
            raw.metrics[0].direct = 1;
            // One legal neutral branch: no intellect proc and an armor roll of zero.
            let damage = input + (d.usage === 'sword' ? 50 : 0);
            const strength = before[0].str * 2 + before[0].effective_str;
            damage += Math.trunc(damage * (Math.trunc((strength - 60) / 4) + 30) / 50);
            if (damage > 1500) damage = Math.trunc((damage - 1500) / 4) + 1000;
            else if (damage > 500) damage = Math.trunc((damage - 500) / 2) + 500;
            let wound = Math.trunc(damage * d.percent / 100);
            wound -= Math.trunc(wound * 20 / 100); wound -= Math.trunc(wound * 26 / 100);
            Object.assign(raw.metrics[1], { qi_cost: damage, eff_qi_cost: wound });
            raw.immediate[1].qi -= damage; raw.immediate[1].eff_qi -= wound;
            if (d.ability === 'zhuan') raw.immediate[1].busy = 2;
            if (wear && d.ability === 'tian') raw.immediate[0].weapon_details.consistence--;
        }
    } else {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals = [{ actor: before[0].object, reason: raw.reason }];
        raw.immediate[0].temp.notify_fail = raw.reason;
    }
    raw.after = structuredClone(raw.immediate); return raw;
}
const resync = raw => { raw.after = structuredClone(raw.immediate); return raw; };

test('单命令正执行成本1/23/476均受理，统计不累加成本且原记录不改写', () => {
    for (const condition of cases.filter(item => item.parameters.expected === 'observed')) {
        const records = [1, 23, 476].map(cost => {
            const raw = trace(condition); raw.command_accepted = cost; return raw;
        });
        const before = records.map(raw => JSON.stringify(raw));
        for (const raw of records) assert.equal(validateTaohuaDirectRecord(raw, condition).accepted, true);
        const wrap = raw => ({ condition_id: condition.id, outcome: raw.outcome, raw });
        assert.deepEqual(taohuaDirectEffects(records.map(wrap), condition),
            taohuaDirectEffects(records.map(raw => wrap({ ...raw, command_accepted: 1 })), condition));
        assert.deepEqual(records.map(raw => JSON.stringify(raw)), before, '原成本不可归一化或回填');
    }
});

test('命令成本必须显式非负安全整数，拒绝只允许0且不能以缺值冒充', () => {
    const invalid = [undefined, null, false, true, '1', {}, [], -1, 0.5, NaN, Infinity,
        Number.MAX_SAFE_INTEGER + 1];
    for (const condition of cases) {
        const missing = trace(condition); delete missing.command_accepted;
        assert.throws(() => validateTaohuaDirectRecord(missing, condition), condition.id);
        for (const cost of invalid) {
            const raw = trace(condition); raw.command_accepted = cost;
            assert.throws(() => validateTaohuaDirectRecord(raw, condition), condition.id + ': ' + String(cost));
        }
        if (condition.parameters.expected === 'observed') {
            const raw = trace(condition); raw.command_accepted = 0;
            assert.throws(() => validateTaohuaDirectRecord(raw, condition), '已受理不可记0成本');
        } else {
            const zero = trace(condition); zero.command_accepted = 0;
            assert.equal(validateTaohuaDirectRecord(zero, condition).accepted, false);
            for (const cost of [1, 23, 476]) {
                const raw = trace(condition); raw.command_accepted = cost;
                assert.throws(() => validateTaohuaDirectRecord(raw, condition), '拒绝不可记正成本');
            }
        }
    }
});

test('actual source bytes and finite unregistered matrix', () => {
    assert.equal(cases.length, 41); assert.equal(smoke.length, 41);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1650);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 41);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.deepEqual(cases.map(({ samples, ...c }) => c), smoke.map(({ samples, ...c }) => c));
    assert.ok(taohuaDirectSourcePaths.every(path => existsSync(join(root, path))));
    assert.throws(() => taohuaDirectConditions(catalog, path => read(path) + '\n'));
    assert.throws(() => taohuaDirectConditions(catalog, read, { samples: 0 }));
    for (const d of taohuaDirectMoves) assert.equal(cases.filter(c => c.parameters.skill === d.skill && c.parameters.variant === 'baseline').length, 3);
});

test('all source-shaped conditions validate without driver', () => {
    for (const c of cases) assert.doesNotThrow(() => validateTaohuaDirectRecord(trace(c), c), c.id);
});
test('strict comparisons retain the zero random roll for tao and dai', () => {
    for (const ability of ['tao', 'dai']) {
        const c = pick(ability, 'low-defense'), raw = trace(c, { hit: false });
        const result = validateTaohuaDirectRecord(raw, c);
        assert.equal(result.hit_numerator, result.ap - 1); assert.equal(result.hit, false);
    }
});
test('each high defense is a guaranteed miss, not a fabricated damage sample', () => {
    for (const d of taohuaDirectMoves) {
        const c = pick(d.ability, 'high-defense');
        assert.equal(validateTaohuaDirectRecord(trace(c), c).hit_numerator, 0);
        assert.throws(() => validateTaohuaDirectRecord(trace(c, { hit: true }), c));
    }
});
test('immediate luoying control survives original interrupt=0', () => {
    const c = pick('zhuan'), raw = trace(c);
    for (const n of [2, 3, 4]) { raw.immediate[1].busy = n; assert.doesNotThrow(() => validateTaohuaDirectRecord(resync(raw), c)); }
    for (const n of [0, 1, 5]) { raw.immediate[1].busy = n; assert.throws(() => validateTaohuaDirectRecord(resync(raw), c)); }
});
test('tian ordinary sword durability is allowed only on hit', () => {
    const c = pick('tian');
    for (const wear of [true, false]) assert.doesNotThrow(() => validateTaohuaDirectRecord(trace(c, { wear }), c));
    const raw = trace(c, { hit: false }); raw.immediate[0].weapon_details.consistence = 99;
    assert.throws(() => validateTaohuaDirectRecord(resync(raw), c));
    const tooMuch = trace(c, { wear: true }); tooMuch.immediate[0].weapon_details.consistence = 98;
    assert.throws(() => validateTaohuaDirectRecord(resync(tooMuch), c));
});
test('exact input endpoints and attack type remain distinct from real damage', () => {
    for (const d of taohuaDirectMoves) {
        const c = pick(d.ability), b = trace(c).before, bounds = taohuaDirectBounds(...b, d);
        for (const input of [bounds.input_min, bounds.input_max]) assert.doesNotThrow(() => validateTaohuaDirectRecord(trace(c, { input }), c));
        for (const input of [bounds.input_min - 1, bounds.input_max + 1]) assert.throws(() => validateTaohuaDirectRecord(trace(c, { input }), c));
        const badType = trace(c); badType.directs[0].type = 2;
        assert.throws(() => validateTaohuaDirectRecord(badType, c));
    }
});
test('fees, closure and unknown state cannot silently become valid zeroes', () => {
    const c = pick();
    for (const mutate of [
        r => { r.metrics[0].neili_cost++; }, r => { r.immediate[1].qi--; },
        r => { delete r.before[1].busy; }, r => { delete r.metrics; },
        r => { r.immediate[0].temp.apply.attack = 10; }, r => { r.before[0].wizardp = 1; },
        r => { r.before[0].effective_skills.finger++; }, r => { r.before[0].effective_str++; },
        r => { r.directs[0].weapon_object = '/tests/sword#999'; }, r => { r.attacks.push({}); },
        r => { r.immediate[0].learned[c.parameters.skill] = 2; }, r => { r.before[1].skills.force++; },
    ]) { const raw = trace(c); mutate(raw); assert.throws(() => validateTaohuaDirectRecord(resync(raw), c)); }
});
test('refusals retain exact text and leave resources and target unchanged', () => {
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) {
        const raw = trace(c); assert.equal(validateTaohuaDirectRecord(raw, c).accepted, false);
        raw.reason += '额外'; assert.throws(() => validateTaohuaDirectRecord(raw, c));
    }
});
test('public ability progress is separate from levels and actual damage', () => {
    for (const progress of [0, 1]) assert.doesNotThrow(() => validateTaohuaDirectRecord(trace(pick(), { progress }), pick()));
    const c = pick('tao', 'baseline', 400);
    assert.throws(() => validateTaohuaDirectRecord(trace(c, { progress: 0 }), c));
    assert.doesNotThrow(() => validateTaohuaDirectRecord(trace(c, { progress: 1 }), c));
});
test('effects distinguish unknown, refused, accepted and successful comparisons', () => {
    const c = pick();
    const report = taohuaDirectEffects([{ condition_id: c.id, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, outcome: 'observed', raw: trace(c, { hit: false }) }, { outcome: 'error' }], c);
    assert.equal(report.records, 3); assert.equal(report.accepted, 2); assert.equal(report.unknown_or_unobserved, 1);
    assert.equal(report.hit_when_accepted.successes, 1); assert.equal(report.hit_when_accepted.trials, 2);
});
test('effects require ledger envelope and raw sample to identify the same outcome and condition', () => {
    const c = pick(), valid = { condition_id: c.id, outcome: 'observed', raw: trace(c) };
    for (const replacement of [{ outcome: 'refused' }, { condition_id: 'other' }, { condition_id: undefined }])
        assert.throws(() => taohuaDirectEffects([{ ...valid, ...replacement }], c));
});
