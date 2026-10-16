import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { mingjiaoXinfaConditions, mingjiaoXinfaSourcePaths, mingjiaoXinfaAbsentPaths,
    mingjiaoXinfaReviewedSourceHash, validateMingjiaoXinfaRecord, mingjiaoXinfaEffects } from './school_mingjiao_xinfa_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url)), read = path => readFileSync(join(root, path));
const hash = v => createHash('sha256').update(typeof v === 'string' || Buffer.isBuffer(v) ? v : JSON.stringify(v)).digest('hex');
const xinfa = 'shenghuo-xinfa', shengong = 'shenghuo-shengong';
const catalog = { skills: [xinfa, shengong, xinfa + '/powerup', 'force/recover'].map(id => {
    const path = `kungfu/skill/${id}.c`, bytes = read(path), parsed = scanSource(bytes.toString('utf8'));
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(bytes), entries: parsed.functions.filter(f => f.name === 'exert')
        .map(f => ({ id: `${path}:${f.line}:exert`, role: 'exert' })) };
}) };
const cases = mingjiaoXinfaConditions(catalog, read), smoke = mingjiaoXinfaConditions(catalog, read, { smoke: true });
const pick = variant => { const c = cases.find(c => c.parameters.variant === variant); assert.ok(c, variant); return c; };
const emptyFields = ['env/no_learn', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/guimai',
    'special_skill/wuxing', 'special_skill/self', 'class', 'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int'];
const ansi = '\x1b[256D\x1b[K';
function effective(s) {
    s.effective_skills = Object.fromEntries(Object.entries(s.skills).map(([k, lvl]) =>
        [k, Math.trunc(lvl / 2) + (s.skills[s.mappings[k]] ?? 0) + (s.temp.apply[k] ?? 0)]));
}
// Independent fixed-exp oracle for the synthetic examples, not calls to original code.
function powers(s) {
    return Object.fromEntries(['attack', 'dodge', 'parry'].map(kind => {
        const level = s.effective_skills[kind === 'attack' ? 'unarmed' : kind] + (s.temp.apply[kind === 'attack' ? 'attack' : 'defense'] ?? 0);
        const power = level > 500 ? Math.trunc(level / 10) * level * level : Math.trunc(level ** 3 / 10);
        return [kind, Math.trunc((power + 6950000) / 30) * 36];
    }));
}
function snapshot(config, side, fighting) {
    const properties = Object.entries(config.properties), apply = { armor: 100 };
    for (const [k, v] of Object.entries(config.temp ?? {})) apply[k.slice(6)] = v;
    const s = { ...Object.fromEntries(properties.filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: { ...Object.fromEntries(emptyFields.map(k => [k, null])),
            ...Object.fromEntries(properties.filter(([k]) => k.includes('/') || k === 'character')) },
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null,
        conditions: null, fighting_opponent: Number(fighting), skills: structuredClone(config.skills),
        learned: {}, mappings: structuredClone(config.mappings), preparations: {},
        effective_int: 36, effective_str: 36 + Math.trunc(Math.max(0,
            ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => config.skills[k] ?? 0)) / 10),
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {}, secondary_weapon: 'none',
        secondary_weapon_details: {}, weapon_damage: 0, weapon_flag: 0, ammunition: 0,
        temp: { user_setup: 1, apply } };
    effective(s); return s;
}
const results = { 'b-force9': 0, 'b-force10': 1, 'b-eunuch100': 1, 'b-eunuch101': 0, 'b-male101': 1,
    'd-known-shengong': 1, 'd-known-xinfa': 1, 'd-known-huashan': 0,
    'e-total': 5080, 'e-current-xinfa': 3000, 'e-current-shengong': 5080 };

// Synthetic contract examples only: no driver, RNG, game object, time waiting or sample ledger.
export function syntheticXinfaTrace(c, { gain, busy = 3 } = {}) {
    const p = c.parameters, ok = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    if (c.method === 'exert') before[0].powers = powers(before[0]);
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}], command_accepted: p.command_return,
        attacks: [], passives: [], defenses: [], dodge_checks: [], dropped: [], terminals: [],
        actions: [], directs: [], interfaces: [], launches: [], refusals: [], callbacks: [], elapsed: 0.01, reason: '' };
    const a = raw.immediate[0];
    if (c.method === 'exert') {
        a.temp.notify_fail = '你所学的内功中没有这种功能。\n';
        if (ok) {
            const recover = p.ability === 'recover', cost = recover ? 33 : 150;
            a.neili -= cost; raw.metrics[0] = { neili_cost: cost, ability_launched: 1 };
            a.learned[recover ? 'force' : xinfa] = gain ?? 1;
            raw.launches = [{ actor: a.object, skill: recover ? 'force' : xinfa, argument: p.action.slice(6) }];
            if (recover) { a.qi += 100; raw.metrics[0].qi_recovery = 100; }
            else {
                const amount = Math.trunc(before[0].effective_skills.force / 6);
                for (const k of ['attack', 'dodge', 'parry']) a.temp.apply[k] = (a.temp.apply[k] ?? 0) + amount;
                a.temp.powerup = 1; if (p.fighting) a.busy = busy;
            }
        } else {
            a.temp.notify_fail = p.refusal; raw.reason = ansi + p.refusal;
            if (p.variant === 'f-unmapped') raw.reason = '技能入口未返回成功';
            else raw.refusals = [{ actor: a.object, reason: raw.reason }];
        }
        effective(a); a.powers = powers(a);
        if (p.repeat_actions) {
            const first = structuredClone(a), reason = ansi + '你已经在运功中了。\n';
            a.temp.notify_fail = '你已经在运功中了。\n'; raw.refusals = [{ actor: a.object, reason }];
            raw.repeat_steps = [{ action: p.action, before: structuredClone(before[0]), after: first, accepted: 1,
                launches_before: 0, launches_after: 1, refusals_before: 0, refusals_after: 0,
                metrics: structuredClone(raw.metrics[0]), reason: '' },
            { action: p.action, before: structuredClone(first), after: structuredClone(a), accepted: 0,
                launches_before: 1, launches_after: 1, refusals_before: 0, refusals_after: 1,
                metrics: structuredClone(raw.metrics[0]), reason }];
        }
    } else if (c.method === 'interface') {
        raw.interfaces = [{ ...p.interface, result: results[p.variant] || null,
            implemented_by: p.ability === 'can_learn' ? '/cmds/skill/learn'
                : p.ability.startsWith('query_') ? '/clone/user/user' : '/kungfu/skill/' + p.skill }];
        if (!ok) { a.temp.notify_fail = p.refusal; raw.reason = ansi + p.refusal; }
    } else {
        a.temp.time = { practice: 1791900000 }; a.temp.notify_fail = p.refusal; raw.reason = ansi + p.refusal;
        raw.movement_room = { no_fight: null, practice_improve: null, research_improve: null };
    }
    raw.after = structuredClone(raw.immediate);
    if (p.observe_seconds) {
        const end = raw.after[0]; end.temp.apply = structuredClone(before[0].temp.apply); delete end.temp.powerup;
        effective(end); end.powers = powers(end); raw.elapsed = 32.02;
        raw.callbacks = [{ side: 0, phase: 'before', elapsed: 30.001, state: structuredClone(a) },
            { side: 0, phase: 'after', elapsed: 30.002, state: structuredClone(end) }];
    }
    return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
const alter = (raw, f) => { f(raw.immediate[0]); raw.after = structuredClone(raw.immediate); };
function reject(c, f, options) { const raw = syntheticXinfaTrace(c, options); f(raw); assert.throws(() => validateMingjiaoXinfaRecord(raw, c)); }

test('有限24条件146正式48烟雾；随机即时100与两条原自然到期独立', () => {
    assert.equal(cases.length, 24); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 146);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 48);
    assert.equal(pick('a-low30').samples, 100); assert.equal(pick('a-expiry').samples, 2);
    assert.equal(pick('a-expiry').parameters.observe_seconds, 32);
    assert.deepEqual(cases.filter(c => c.samples > 2).map(c => c.parameters.variant), ['a-low30']);
    assert.equal(mingjiaoXinfaSourcePaths.length, 39);
    assert.equal(hash(mingjiaoXinfaSourcePaths.map(p => [p, hash(read(p))])), mingjiaoXinfaReviewedSourceHash);
    for (const c of cases) validateMingjiaoXinfaRecord(syntheticXinfaTrace(c), c);
});
test('原源码/缺席入口/条件和catalog任意漂移均拒绝', () => {
    assert.throws(() => mingjiaoXinfaConditions(catalog, p => p === 'kungfu/skill/shenghuo-xinfa.c' ? Buffer.concat([read(p), Buffer.from('\n')]) : read(p)));
    for (const absent of mingjiaoXinfaAbsentPaths) assert.throws(() => mingjiaoXinfaConditions(catalog, p => p === absent ? Buffer.from('present') : read(p)));
    const mutated = structuredClone(catalog); mutated.skills[0].sha256 = '0'.repeat(64);
    assert.throws(() => mingjiaoXinfaConditions(mutated, read));
    const c = structuredClone(pick('a-powerup200')); c.parameters.actor.properties.neili = 5999;
    assert.throws(() => validateMingjiaoXinfaRecord(syntheticXinfaTrace(c), c));
    const h = structuredClone(pick('a-powerup200')); h.parameters.source_evidence['kungfu/skill/shenghuo-xinfa.c'] = '0'.repeat(64);
    assert.throws(() => validateMingjiaoXinfaRecord(syntheticXinfaTrace(h), h));
});
test('强化核真实三项apply/effective/powers，不把dodge和parry误放defense', () => {
    for (const [level, amount] of [[200, 50], [400, 100], [800, 200]]) {
        const c = pick('a-powerup' + level), raw = syntheticXinfaTrace(c);
        for (const k of ['attack', 'dodge', 'parry']) assert.equal(raw.immediate[0].temp.apply[k], amount);
        assert.equal(validateMingjiaoXinfaRecord(raw, c).costs.neili, 150);
        for (const k of ['attack', 'dodge', 'parry']) reject(c, r => alter(r, s => s.temp.apply[k]--));
        reject(c, r => alter(r, s => { s.temp.apply.defense = amount; delete s.temp.apply.dodge; effective(s); s.powers = powers(s); }));
        reject(c, r => alter(r, s => s.effective_skills.dodge--));
        reject(c, r => alter(r, s => s.powers.parry--));
    }
    for (const busy of [1, 2, 4]) reject(pick('a-fighting'), r => alter(r, s => s.busy = busy));
    for (const k of ['actions', 'directs']) reject(pick('a-powerup200'), r => delete r[k]);
    reject(pick('a-neili149'), r => alter(r, s => s.neili--));
    reject(pick('a-neili150'), r => r.metrics[0].neili_cost--);
    reject(pick('a-other'), r => r.immediate[1].qi--);
});
test('低功力原random120 weak熟练0/1，高功力必增；不串到force或升raw', () => {
    for (const variant of ['a-low30', 'a-expiry']) for (const gain of [0, 1]) validateMingjiaoXinfaRecord(syntheticXinfaTrace(pick(variant), { gain }), pick(variant));
    reject(pick('a-low30'), r => alter(r, s => s.learned[xinfa] = 2));
    reject(pick('a-powerup200'), r => alter(r, s => s.learned[xinfa] = 0));
    reject(pick('a-powerup200'), r => alter(r, s => { s.learned.force = 1; delete s.learned[xinfa]; }));
    reject(pick('a-powerup200'), r => alter(r, s => s.skills[xinfa]++));
    reject(pick('f-recover'), r => alter(r, s => { s.learned[xinfa] = 1; delete s.learned.force; }));
});
test('重复拒绝无额外扣费/发动/学习，步骤深快照不可伪造', () => {
    const c = pick('a-repeat'); validateMingjiaoXinfaRecord(syntheticXinfaTrace(c), c);
    reject(c, r => r.repeat_steps[1].accepted = 1);
    reject(c, r => r.repeat_steps[1].metrics.neili_cost = 300);
    reject(c, r => r.repeat_steps[0].after.learned[xinfa] = 0);
    reject(c, r => r.repeat_steps[1].before.skills.force++);
    reject(c, r => r.launches.push(structuredClone(r.launches[0])));
});
test('原自然到期30秒与三项偏移还原，禁止假回调/提前清除/漏属性', () => {
    const c = pick('a-expiry'), raw = syntheticXinfaTrace(c);
    validateMingjiaoXinfaRecord(raw, c);
    assert.deepEqual(raw.after[0].temp.apply, { armor: 100, attack: 7, dodge: 11, parry: 13 });
    reject(c, r => r.callbacks[0].elapsed = 28.9);
    reject(c, r => r.callbacks = []);
    reject(c, r => r.callbacks[1].state.object = '/tests/actor#999');
    reject(c, r => { r.after[0].temp.apply.dodge = 0; r.callbacks[1].state = structuredClone(r.after[0]); });
    reject(c, r => { r.after[0].neili++; r.callbacks[1].state = structuredClone(r.after[0]); });
    reject(c, r => r.metrics[0].heartbeats = 1);
});
test('资格raw9/10及无性神功100/101、双向兼修、容量与练习拒绝都有独立契约', () => {
    for (const variant of ['b-force9', 'b-force10', 'b-eunuch100', 'b-eunuch101', 'b-male101',
        'd-known-shengong', 'd-known-xinfa', 'd-known-huashan', 'e-total', 'e-current-xinfa', 'e-current-shengong', 'c-practice']) {
        const c = pick(variant); validateMingjiaoXinfaRecord(syntheticXinfaTrace(c), c);
        if (c.method === 'interface') { reject(c, r => r.interfaces[0].result = 777); reject(c, r => delete r.interfaces[0].result); }
    }
    assert.equal(pick('b-eunuch100').parameters.actor.skills[xinfa], 50);
    assert.equal(pick('b-eunuch101').parameters.actor.skills[shengong], 101);
    reject(pick('c-practice'), r => alter(r, s => s.learned[xinfa] = 1));
    reject(pick('c-practice'), r => delete r.immediate[0].temp.time);
    reject(pick('e-total'), r => r.interfaces[0].implemented_by = '/tests/fake');
});
test('公共recover只恢复当前qi并学习基本force；未激发不发动', () => {
    const c = pick('f-recover'), raw = syntheticXinfaTrace(c);
    const result = validateMingjiaoXinfaRecord(raw, c);
    assert.equal(result.costs.neili, 33); assert.equal(result.recovery.qi, 100);
    assert.equal(result.recovery.eff_qi, 0); assert.equal(raw.launches[0].skill, 'force');
    reject(c, r => r.launches[0].skill = xinfa);
    reject(c, r => alter(r, s => s.eff_qi--));
    reject(c, r => r.metrics[0].qi_recovery = 0);
    reject(pick('f-unmapped'), r => r.launches.push({ actor: r.before[0].object, skill: 'force', argument: 'recover' }));
});
test('未激发内功是外层拒绝，原notify_fail与空事件完整保留，不制造SKILL拒绝', () => {
    const c = pick('f-unmapped'), raw = syntheticXinfaTrace(c);
    validateMingjiaoXinfaRecord(raw, c);
    assert.equal(raw.reason, '技能入口未返回成功');
    assert.equal(raw.immediate[0].temp.notify_fail, '你请先用 enable 指令选择你要使用的内功。\n');
    assert.deepEqual(raw.launches, []); assert.deepEqual(raw.refusals, []);
    reject(c, r => delete r.refusals);
    reject(c, r => r.refusals.push({ actor: r.before[0].object, reason: ansi + c.parameters.refusal }));
    reject(c, r => alter(r, s => delete s.temp.notify_fail));
    reject(c, r => alter(r, s => s.temp.notify_fail = '你的内力不够。\n'));
    reject(c, r => r.reason = ansi + c.parameters.refusal);
    reject(c, r => r.command_accepted = 1);
    reject(c, r => r.metrics[0].neili_cost = 1);
    reject(c, r => alter(r, s => s.learned[xinfa] = 1));
});
test('错误/NA留未知，低功力独立分母；生命周期2条不报告随机率', () => {
    const c = pick('a-low30'), good = [0, 1].map(gain => row(syntheticXinfaTrace(c, { gain })));
    const unknown = outcome => row({ kind: 'sample', condition_id: c.id, method: c.method,
        index: 0, elapsed: 0.02, outcome, reason: 'Synthetic unknown boundary, not a real sample.' });
    const result = mingjiaoXinfaEffects([...good, unknown('error'), unknown('not_applicable')], c);
    assert.deepEqual(result.counts, { observed: 2, refused: 0, error: 1, not_applicable: 1 });
    assert.equal(result.progression.successes, 1); assert.equal(result.progression.trials, 2);
    assert.equal(result.learned_gain.n, 2); assert.equal(result.learned_gain.unknown, 2);
    assert.equal(result.costs.neili.mean, 150); assert.equal(result.costs.neili.unknown, 2);
    const expiry = pick('a-expiry'); assert.equal(mingjiaoXinfaEffects([row(syntheticXinfaTrace(expiry))], expiry).progression, null);
    const refused = pick('a-neili149'); assert.equal(mingjiaoXinfaEffects([row(syntheticXinfaTrace(refused))], refused).counts.refused, 1);
    const noRecords = mingjiaoXinfaEffects([], c); assert.equal(noRecords.learned_gain.mean, null); assert.equal(noRecords.progression.rate, null);
    assert.throws(() => mingjiaoXinfaEffects([row(syntheticXinfaTrace(pick('a-powerup200')))], c));
});
test('真实错误留痕入口只校验完整身份/编号/耗时/原因，错误效果未知而非零', () => {
    const c = pick('a-low30');
    const trace = outcome => ({ kind: 'sample', condition_id: c.id, method: c.method,
        index: 0, elapsed: 0.02, outcome, reason: 'Synthetic runtime failure, not a real sample.' });
    for (const outcome of ['error', 'not_applicable']) {
        assert.equal(validateMingjiaoXinfaRecord(trace(outcome), c), null);
        for (const edit of [r => { delete r.kind; }, r => { r.condition_id += '-other'; },
            r => { r.method = 'ordinary'; }, r => { delete r.index; }, r => { r.index = null; },
            r => { r.index = -1; }, r => { r.index = 0.5; }, r => { r.index = c.samples; },
            r => { r.index = '0'; }, r => { delete r.elapsed; }, r => { r.elapsed = -1; },
            r => { r.elapsed = Infinity; }, r => { delete r.reason; }, r => { r.reason = '  '; }]) {
            const bad = trace(outcome); edit(bad);
            assert.throws(() => validateMingjiaoXinfaRecord(bad, c));
            assert.throws(() => mingjiaoXinfaEffects([row(bad)], c));
        }
    }
    const effects = mingjiaoXinfaEffects(['error', 'not_applicable'].map(o => row(trace(o))), c);
    assert.equal(effects.validated_samples, 0); assert.equal(effects.unknown_samples, 2);
    assert.equal(effects.costs.neili.n, 0); assert.equal(effects.costs.neili.mean, null);
    assert.equal(effects.costs.neili.unknown, 2); assert.equal(effects.progression.trials, 0);
});
