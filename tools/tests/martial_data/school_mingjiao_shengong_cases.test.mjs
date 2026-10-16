import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { scanSource } from './inventory.mjs';
import { mingjiaoShengongConditions, mingjiaoShengongSourcePaths, mingjiaoShengongAbsentPaths,
    mingjiaoShengongReviewedSourceHash, mingjiaoShengongResearchSupport,
    validateMingjiaoShengongRecord, mingjiaoShengongEffects } from './school_mingjiao_shengong_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url)), read = p => readFileSync(join(root, p));
const hash = v => createHash('sha256').update(v).digest('hex');
const skill = 'shenghuo-shengong', xinfa = 'shenghuo-xinfa';
const catalog = { skills: [skill, xinfa, skill + '/powerup', skill + '/shield', 'force/recover', 'force/regenerate'].map(id => {
    const path = `kungfu/skill/${id}.c`, bytes = read(path), parsed = scanSource(bytes.toString('utf8'));
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(bytes), entries: parsed.functions.filter(f => f.name === 'exert')
        .map(f => ({ id: `${path}:${f.line}:exert`, role: 'exert' })) };
}) };
const cases = mingjiaoShengongConditions(catalog, read), smoke = mingjiaoShengongConditions(catalog, read, { smoke: true });
const pick = v => { const c = cases.find(c => c.parameters.variant === v); assert.ok(c, v); return c; };
const emptyFields = ['env/no_learn', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/guimai',
    'special_skill/wuxing', 'special_skill/self', 'class', 'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int'];
const ansi = '\x1b[256D\x1b[K';
function effective(s) {
    s.effective_skills = Object.fromEntries(Object.entries(s.skills).map(([k, l]) =>
        [k, Math.trunc(l / 2) + (s.skills[s.mappings[k]] ?? 0) + (s.temp.apply[k] ?? 0)]));
}
// Independent fixed-exp power oracle for synthetic examples. No original game call.
function powers(s) {
    return Object.fromEntries(['attack', 'dodge', 'parry'].map(kind => {
        const lvl = s.effective_skills[kind === 'attack' ? 'unarmed' : kind] + (s.temp.apply[kind === 'attack' ? 'attack' : 'defense'] ?? 0);
        const p = lvl > 500 ? Math.trunc(lvl / 10) * lvl * lvl : Math.trunc(lvl ** 3 / 10);
        return [kind, Math.trunc((p + 6950000) / 30) * 36];
    }));
}
function snapshot(cfg, side, fighting) {
    const properties = Object.entries(cfg.properties), apply = { armor: 100 };
    for (const [k, v] of Object.entries(cfg.temp ?? {})) apply[k.slice(6)] = v;
    const s = { ...Object.fromEntries(properties.filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: { ...Object.fromEntries(emptyFields.map(k => [k, null])),
            ...Object.fromEntries(properties.filter(([k]) => k.includes('/') || k === 'character')) },
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null,
        conditions: null, fighting_opponent: Number(fighting), skills: structuredClone(cfg.skills),
        learned: {}, mappings: structuredClone(cfg.mappings), preparations: {},
        effective_int: cfg.properties.int, effective_str: cfg.properties.str + Math.trunc(Math.max(0,
            ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0)) / 10),
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {}, secondary_weapon: 'none',
        secondary_weapon_details: {}, weapon_damage: 0, weapon_flag: 0, ammunition: 0,
        temp: { user_setup: 1, apply } };
    effective(s); return s;
}
function ifaceOwner(p) {
    return p.ability === 'query_current_neili_limit' ? '/clone/user/user'
        : ['type', 'valid_research', 'valid_learn_level'].includes(p.ability) ? '/inherit/skill/skill' : '/kungfu/skill/' + skill;
}
// Synthetic contract traces only: no driver, actual RNG, timer wait or sample ledger.
export function syntheticShengongTrace(c, { gain, busy = 2 } = {}) {
    const p = c.parameters, ok = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    if (c.method === 'exert') before[0].powers = powers(before[0]);
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}], command_accepted: p.command_return,
        attacks: [], actions: [], directs: [], passives: [], defenses: [], dodge_checks: [], dropped: [], terminals: [],
        interfaces: [], launches: [], refusals: [], callbacks: [], reason: '', elapsed: 0.02 };
    const a = raw.immediate[0], b = before[0], m = raw.metrics[0];
    if (c.method === 'interface') raw.interfaces = [{ ...p.interface, result: p.interface_result, implemented_by: ifaceOwner(p) }];
    if (c.method === 'research') {
        const completed = p.completed, writeoff = p.jing_writeoff ?? 0, fee = completed * Math.trunc(1000 / b.int);
        if (fee + writeoff) { m.jing_cost = fee + writeoff; a.jing -= fee + writeoff; }
        if (completed) { a.learned_points += completed; a.learned[skill] = gain ?? completed; }
        if (completed || p.research_started) a.temp.time = { research: 1791980000 };
        a.temp.notify_fail = p.refusal ?? '依你目前的能力，没有办法研究这种技能。\n';
        raw.movement_room = { no_fight: null, practice_improve: null, research_improve: null };
    }
    if (c.method === 'practice') {
        a.temp.time = { practice: 1791980000 };
        raw.movement_room = { no_fight: null, practice_improve: null, research_improve: null };
    }
    if (c.method === 'exert') {
        if (ok) {
            const shared = ['recover', 'regenerate'].includes(p.ability), flag = p.ability === 'powerup' ? 'powerup' : 'shield';
            const cost = shared ? p.ability === 'recover' ? 33 : 20 : p.ability === 'powerup' ? 150 : 100;
            m.neili_cost = cost; a.neili -= cost; m.ability_launched = 1;
            a.learned[shared ? 'force' : skill] = gain ?? 1;
            raw.launches = [{ actor: b.object, skill: shared ? 'force' : skill, argument: p.action.slice(6) }];
            if (shared) {
                const resource = p.ability === 'recover' ? 'qi' : 'jing'; a[resource] += 100; m[resource + '_recovery'] = 100;
            } else {
                const amount = Math.trunc(p.level / (p.ability === 'powerup' ? 3 : 2));
                for (const k of p.ability === 'powerup' ? ['attack', 'dodge', 'parry'] : ['armor']) a.temp.apply[k] = (a.temp.apply[k] ?? 0) + amount;
                a.temp[flag] = 1; if (p.fighting) a.busy = p.ability === 'shield' ? 2 : busy;
            }
        }
        effective(a); a.powers = powers(a);
        if (p.repeat_actions) {
            const first = structuredClone(a), reason = ansi + '你已经在运功中了。\n';
            a.temp.notify_fail = '你已经在运功中了。\n'; raw.refusals = [{ actor: a.object, reason }];
            raw.repeat_steps = [
                { action: p.repeat_actions[0], accepted: 1, reason: '', before: b, after: first, metrics: structuredClone(m),
                    launches_before: 0, launches_after: 1, refusals_before: 0, refusals_after: 0 },
                { action: p.repeat_actions[1], accepted: 0, reason, before: first, after: a, metrics: structuredClone(m),
                    launches_before: 1, launches_after: 1, refusals_before: 0, refusals_after: 1 },
            ];
        }
    }
    if (!ok) {
        a.temp.notify_fail = p.refusal; raw.reason = ansi + p.refusal;
        if (c.method === 'exert') raw.refusals = [{ actor: a.object, reason: raw.reason }];
    }
    raw.after = structuredClone(raw.immediate);
    if (p.observe_seconds) {
        const end = raw.after[0], flag = p.ability === 'powerup' ? 'powerup' : 'shield';
        end.temp.apply = structuredClone(b.temp.apply); delete end.temp[flag];
        effective(end); end.powers = powers(end); raw.elapsed = p.observe_seconds + 0.02;
        raw.callbacks = [{ side: 0, phase: 'before', elapsed: p.level + 0.001, state: structuredClone(a) },
            { side: 0, phase: 'after', elapsed: p.level + 0.002, state: structuredClone(end) }];
    }
    return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
const alter = (raw, f) => { f(raw.immediate[0]); raw.after = structuredClone(raw.immediate); };
function reject(c, f, options) { const raw = syntheticShengongTrace(c, options); f(raw); assert.throws(() => validateMingjiaoShengongRecord(raw, c)); }

test('51有限条件788正式102烟雾，七个随机条件100与22/42原生命周期独立', () => {
    assert.equal(cases.length, 51); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 788);
    assert.equal(smoke.length, 51); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 102);
    assert.equal(cases.filter(c => c.samples === 100).length, 7);
    assert.deepEqual(cases.filter(c => c.parameters.observe_seconds).map(c => [c.parameters.level, c.parameters.actor.skills.force, c.parameters.observe_seconds]), [[20, 200, 22], [40, 200, 42]]);
    assert.equal(new Set(cases.map(c => c.id)).size, 51);
    for (const c of cases) validateMingjiaoShengongRecord(syntheticShengongTrace(c), c);
});
test('41来源字节和8明确缺席入口；变动、错catalog、非ENOENT及新增回退均拒', () => {
    assert.equal(mingjiaoShengongSourcePaths.length, 41); assert.equal(mingjiaoShengongAbsentPaths.length, 8);
    const evidence = mingjiaoShengongSourcePaths.map(p => [p, hash(read(p))]);
    assert.equal(hash(JSON.stringify(evidence)), mingjiaoShengongReviewedSourceHash);
    assert.throws(() => mingjiaoShengongConditions(catalog, p => p === mingjiaoShengongSourcePaths[0] ? Buffer.concat([read(p), Buffer.from('\n')]) : read(p)));
    const wrong = structuredClone(catalog); wrong.skills[0].sha256 = '0'.repeat(64); assert.throws(() => mingjiaoShengongConditions(wrong, read));
    assert.throws(() => mingjiaoShengongConditions(catalog, p => mingjiaoShengongAbsentPaths.includes(p) ? Buffer.from('present') : read(p)));
    assert.throws(() => mingjiaoShengongConditions(catalog, p => { if (mingjiaoShengongAbsentPaths.includes(p)) throw Object.assign(new Error('denied'), { code: 'EACCES' }); return read(p); }));
});
test('原资格正反与继承owner；type字符串不伪造数字，缺返回/错误来源拒', () => {
    for (const v of ['a-enable-force', 'a-enable-dodge', 'a-int31', 'a-int32', 'a-force179', 'a-force180', 'a-eunuch49', 'a-eunuch50', 'a-male50', 'a-type', 'a-valid-research', 'a-learn-level']) {
        const c = pick(v); assert.equal(validateMingjiaoShengongRecord(syntheticShengongTrace(c), c).interface_result, c.parameters.interface_result);
        reject(c, raw => { delete raw.interfaces[0].result; });
        reject(c, raw => { raw.interfaces[0].implemented_by = 0; });
    }
    reject(pick('a-type'), raw => { raw.interfaces[0].result = 1; });
    reject(pick('a-enable-force'), raw => { raw.interfaces[0].argument = 'dodge'; });
    reject(pick('a-valid-research'), raw => { raw.interfaces[0].implemented_by = '/kungfu/skill/' + skill; });
    reject(pick('a-eunuch50'), raw => { raw.outcome = 'observed'; });
});
test('query_neili_improve是原USER实参，容量200/400/800为3480/7920/19680', () => {
    assert.deepEqual([200, 400, 800].map(n => pick('b-improve' + n).parameters.interface_result), [480, 1920, 7680]);
    assert.deepEqual([200, 400, 800].map(n => pick('b-current' + n).parameters.interface_result), [3480, 7920, 19680]);
    reject(pick('b-improve200'), raw => { raw.interfaces[0].object = 'player'; });
    reject(pick('b-current800'), raw => { raw.interfaces[0].result = 12000; });
});
test('原force研究scale/强熟练整数support；等级成长与兼修不套泛化规则', () => {
    const bounds = [180, 200, 400, 800].map(n => mingjiaoShengongResearchSupport(pick('a-research' + n).parameters).random_bound);
    assert.deepEqual(bounds, [30, 33, 57, 92]);
    assert.equal(mingjiaoShengongResearchSupport(pick('a-research-pair').parameters).random_bound, 49);
    for (const v of ['a-research180', 'a-research200', 'a-research400', 'a-research800', 'a-research-pair', 'a-partial']) {
        const c = pick(v), support = mingjiaoShengongResearchSupport(c.parameters);
        for (const gain of support.gains) validateMingjiaoShengongRecord(syntheticShengongTrace(c, { gain }), c);
        reject(c, raw => alter(raw, a => { a.learned[skill] = Math.max(...support.gains) + 1; }));
        reject(c, raw => alter(raw, a => { a.learned_points += 1; }));
    }
});
test('jing26直接清零费用26非27研究费；partial54只完成两次，闭账拒漏费/多费/假进度', () => {
    const zero = pick('a-jing26'), r = syntheticShengongTrace(zero), v = validateMingjiaoShengongRecord(r, zero);
    assert.equal(r.command_accepted, 1); assert.equal(r.outcome, 'refused'); assert.equal(v.completed, 0);
    assert.equal(v.research_fee, 0); assert.equal(v.jing_writeoff, 26); assert.equal(v.costs.jing, 26);
    assert.equal(r.after[0].jing, 0); assert.equal(v.learned_gain, 0);
    reject(zero, raw => { delete raw.metrics[0].jing_cost; });
    reject(zero, raw => { raw.metrics[0].jing_cost = 27; });
    reject(zero, raw => alter(raw, a => { a.jing = 26; }));
    reject(zero, raw => alter(raw, a => { a.learned[skill] = 1; }));
    reject(zero, raw => { raw.command_accepted = 0; });
    const partial = pick('a-partial'), pv = validateMingjiaoShengongRecord(syntheticShengongTrace(partial, { gain: 22 }), partial);
    assert.equal(pv.completed, 2); assert.equal(pv.research_fee, 54); assert.equal(pv.jing_writeoff, 0);
    reject(partial, raw => { raw.metrics[0].jing_cost = 81; });
    reject(partial, raw => alter(raw, a => { a.jing = -27; }));
    const early = pick('a-effjing26'); reject(early, raw => { raw.metrics[0].jing_cost = 26; });
    reject(pick('a-potential0'), raw => alter(raw, a => { a.temp.time = { research: 1791980000 }; }));
});
test('强化按raw/3与raw/2，精确费用、战斗忙乱及拒绝不产生强化/弱熟练', () => {
    const p = pick('c-powerup400'), s = pick('c-shield400');
    assert.deepEqual(validateMingjiaoShengongRecord(syntheticShengongTrace(p), p).apply_delta, { attack: 133, dodge: 133, parry: 133, armor: 0 });
    assert.deepEqual(validateMingjiaoShengongRecord(syntheticShengongTrace(s), s).apply_delta, { attack: 0, dodge: 0, parry: 0, armor: 200 });
    const f = pick('c-powerup-fighting');
    for (const busy of [1, 2, 3]) assert.equal(validateMingjiaoShengongRecord(syntheticShengongTrace(f, { busy }), f).busy, busy);
    reject(f, raw => alter(raw, a => { a.busy = 0; }));
    reject(pick('c-shield-fighting'), raw => alter(raw, a => { a.busy = 1; }));
    reject(p, raw => alter(raw, a => { a.temp.apply.attack = 200; effective(a); a.powers = powers(a); }));
    for (const v of ['c-powerup149', 'c-powerup-other', 'c-shield99', 'c-shield39', 'c-shield-other']) {
        const c = pick(v); reject(c, raw => alter(raw, a => { a.learned[skill] = 1; }));
        reject(c, raw => { raw.launches.push({ actor: raw.before[0].object, skill, argument: c.parameters.ability }); });
    }
});
test('重复施展只一次费用/弱熟练，原20/40自然到期收还本次加成不清已有偏移', () => {
    for (const ability of ['powerup', 'shield']) {
        const repeat = pick('c-' + ability + '-repeat'); validateMingjiaoShengongRecord(syntheticShengongTrace(repeat), repeat);
        reject(repeat, raw => { raw.repeat_steps[1].accepted = 1; });
        reject(repeat, raw => { raw.metrics[0].neili_cost *= 2; });
        const expiry = pick('c-' + ability + '-expiry'); validateMingjiaoShengongRecord(syntheticShengongTrace(expiry), expiry);
        reject(expiry, raw => { raw.callbacks = []; });
        reject(expiry, raw => { raw.callbacks[0].elapsed = 1; });
        reject(expiry, raw => { raw.after[0].temp.apply = { armor: 100 }; effective(raw.after[0]); raw.after[0].powers = powers(raw.after[0]); });
        reject(expiry, raw => { raw.after[0].temp[ability] = 1; });
        const fx = mingjiaoShengongEffects([row(syntheticShengongTrace(expiry))], expiry);
        assert.equal(fx.progression, null); assert.equal(fx.callback_pairs, 1);
    }
});
test('公共recover/regenerate真实force路由仅增长基本force，恢复当前值不改有效值', () => {
    for (const [ability, cost, resource] of [['recover', 33, 'qi'], ['regenerate', 20, 'jing']]) {
        const c = pick('d-' + ability), r = syntheticShengongTrace(c), v = validateMingjiaoShengongRecord(r, c);
        assert.equal(v.learned_skill, 'force'); assert.equal(v.costs.neili, cost); assert.equal(v.recovery[resource], 100);
        assert.equal(r.launches[0].skill, 'force');
        reject(c, raw => { raw.launches[0].skill = skill; });
        reject(c, raw => alter(raw, a => { a.learned = { [skill]: 1 }; }));
        reject(c, raw => { raw.metrics[0]['eff_' + resource + '_recovery'] = 100; });
    }
});
test('缺阶段/动作数组/计数未知/身份漂移不能用合成零弥补', () => {
    const c = pick('c-shield200');
    for (const k of ['before', 'after', 'actions', 'directs', 'interfaces', 'metrics']) reject(c, raw => { delete raw[k]; });
    reject(c, raw => { raw.metrics[0].neili_cost = null; });
    reject(c, raw => alter(raw, a => { a.skills[skill] += 1; effective(a); }));
    reject(c, raw => { raw.before[0].wizardp = 1; });
    reject(c, raw => { raw.immediate[1].jing -= 1; raw.after[1].jing -= 1; });
    const drift = structuredClone(c); drift.parameters.actor.properties.int = 40;
    assert.throws(() => validateMingjiaoShengongRecord(syntheticShengongTrace(drift), drift));
});
test('错误/NA独立未知；type文本结果和拒绝query返回0不误当缺失', () => {
    const c = pick('a-jing26'), unknown = outcome => row({ kind: 'sample', condition_id: c.id,
        method: c.method, index: 0, elapsed: 0.02, outcome, reason: 'Synthetic unknown boundary, not a real sample.' });
    const fx = mingjiaoShengongEffects([row(syntheticShengongTrace(c)), unknown('error'), unknown('not_applicable')], c);
    assert.deepEqual(fx.counts, { observed: 0, refused: 1, error: 1, not_applicable: 1 });
    assert.equal(fx.validated_samples, 1); assert.equal(fx.unknown_samples, 2); assert.equal(fx.jing_writeoff.mean, 26);
    assert.equal(fx.research_fee.mean, 0); assert.equal(fx.costs.jing.unknown, 2);
    const type = pick('a-type'), tf = mingjiaoShengongEffects([row(syntheticShengongTrace(type))], type);
    assert.equal(tf.interface_result, null); assert.deepEqual(tf.interface_values, { martial: 1 });
    const guard = pick('a-enable-dodge'), gf = mingjiaoShengongEffects([row(syntheticShengongTrace(guard))], guard);
    assert.equal(gf.interface_result.mean, 0); assert.equal(gf.validated_samples, 1);
    const research = pick('a-research200'), rf = mingjiaoShengongEffects([row(syntheticShengongTrace(research, { gain: 3 }))], research);
    assert.equal(rf.completed.mean, 1); assert.equal(rf.research_fee.mean, 27); assert.equal(rf.jing_writeoff.mean, 0);
});
test('错误/NA留痕不冒正常研究或运功，身份/编号/耗时/原因不得缺失', () => {
    const c = pick('a-jing26');
    const trace = outcome => ({ kind: 'sample', condition_id: c.id, method: c.method,
        index: 0, elapsed: 0.02, outcome, reason: 'Synthetic runtime failure, not a real sample.' });
    for (const outcome of ['error', 'not_applicable']) {
        assert.equal(validateMingjiaoShengongRecord(trace(outcome), c), null);
        for (const edit of [r => { delete r.kind; }, r => { r.condition_id += '-other'; },
            r => { r.method = 'ordinary'; }, r => { delete r.index; }, r => { r.index = null; },
            r => { r.index = -1; }, r => { r.index = 0.5; }, r => { r.index = c.samples; },
            r => { r.index = '0'; }, r => { delete r.elapsed; }, r => { r.elapsed = -1; },
            r => { r.elapsed = Infinity; }, r => { delete r.reason; }, r => { r.reason = '  '; }]) {
            const bad = trace(outcome); edit(bad);
            assert.throws(() => validateMingjiaoShengongRecord(bad, c));
            assert.throws(() => mingjiaoShengongEffects([row(bad)], c));
        }
    }
    const effects = mingjiaoShengongEffects(['error', 'not_applicable'].map(o => row(trace(o))), c);
    assert.equal(effects.validated_samples, 0); assert.equal(effects.unknown_samples, 2);
    assert.equal(effects.costs.jing.n, 0); assert.equal(effects.costs.jing.mean, null);
    assert.equal(effects.costs.jing.unknown, 2); assert.equal(effects.completed.mean, null);
});
