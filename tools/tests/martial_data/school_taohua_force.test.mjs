import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaForceConditions, taohuaForceSourcePaths, taohuaForceAbsentPaths,
    taohuaForceFixtureRequirements, taohuaForcePracticeGain, taohuaForceResearchSupport,
    validateTaohuaForceRecord, taohuaForceEffects } from './school_taohua_force_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value)
    ? value : JSON.stringify(value)).digest('hex');
const bibo = 'bibo-shengong', luoying = 'luoying-xinfa', anying = 'anying-fuxiang';
const catalog = { skills: [bibo, luoying, anying, bibo + '/powerup', 'force/recover'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', bytes = read(path), parsed = scanSource(bytes.toString('utf8'));
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(bytes), entries: parsed.functions.filter(fn => fn.name === 'exert')
        .map(fn => ({ id: `${path}:${fn.line}:exert`, role: 'exert' })) };
}) };
const cases = taohuaForceConditions(catalog, read), smoke = taohuaForceConditions(catalog, read, { smoke: true });
const pick = variant => { const c = cases.find(c => c.parameters.variant === variant); assert.ok(c, variant); return c; };
const emptyFields = ['env/no_learn', 'improve/neili', 'breakup', 'special_skill/mystery',
    'special_skill/guimai', 'special_skill/wuxing', 'special_skill/self', 'class',
    'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int'];
const ansi = '\x1b[256D\x1b[K';

function snapshot(config, side, fighting) {
    const entries = Object.entries(config.properties), apply = { armor: 100 };
    for (const [key, value] of Object.entries(config.temp ?? {})) apply[key.slice(6)] = value;
    return { ...Object.fromEntries(entries.filter(([key]) => !key.includes('/') && key !== 'character')),
        cultivation: { ...Object.fromEntries(emptyFields.map(key => [key, null])),
            ...Object.fromEntries(entries.filter(([key]) => key.includes('/') || key === 'character')) },
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        busy: null, conditions: null, fighting_opponent: Number(fighting),
        skills: structuredClone(config.skills), learned: {}, mappings: structuredClone(config.mappings), preparations: {},
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (config.skills[config.mappings[key]] ?? 0)])),
        effective_int: 36, effective_str: 36 + Math.trunc(Math.max(0, ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw']
            .map(key => config.skills[key] ?? 0)) / 10),
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {},
        secondary_weapon: 'none', secondary_weapon_details: {}, weapon_damage: 0, weapon_flag: 0, ammunition: 0,
        temp: { user_setup: 1, apply } };
}

// Independent arithmetic for the fixed raw-200, exp100000000 USERs; no source function is called.
function powers(state) {
    return Object.fromEntries(['attack', 'dodge', 'parry'].map(kind => {
        const level = 100 + (state.temp.apply[kind === 'attack' ? 'attack' : 'defense'] ?? 0);
        return [kind, Math.trunc((Math.trunc(level ** 3 / 10) + 6950000) / 30) * 36];
    }));
}
const interfaceResults = { 'b1-qualified': 1, 'b2-music99': 0, 'b3-eunuch49': 1,
    'b4-eunuch50': 0, 'b5-force9': 0, 'b6-known-luoying': 1, 'b7-known-bibo': 1,
    'b8-known-huashan': 0, 'b9-total-capacity': 6400, 'b10-current-bibo': 6400, 'b11-current-luoying': 4900 };
const practice = { 'c1-level29': [10, 4], 'c2-level30': [25, 5], 'c3-level49': [25, 7],
    'c4-level50': [40, 7], 'c5-qi49': [0, 0], 'c6-partial': [80, 14] };
const qualificationRefusals = { 'b2-music99': '你没有精通吹箫技法，无法领会碧波神功的奥秘。\n',
    'b4-eunuch50': '你无根无性，阴阳不调，难以领会高深的碧波神功。\n',
    'b5-force9': '你的基本内功火候不够，不能学习特殊内功。\n', 'b8-known-huashan': '你发现自身所学的华山心法和碧波神功冲突不已，根本没办法并存。\n' };

// Synthetic contract examples only: no driver, RNG, wall-clock waiting, game object or sample ledger.
function trace(condition, { gain, busy = 2, falseResult = null } = {}) {
    const p = condition.parameters, ok = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    if (condition.method === 'exert') before[0].powers = powers(before[0]);
    const raw = { kind: 'sample', condition_id: condition.id, method: condition.method, outcome: p.expected,
        before, immediate: structuredClone(before), after: [], command_accepted: p.command_return,
        metrics: [{}, {}], attacks: [], passives: [], defenses: [], dodge_checks: [], dropped: [], terminals: [],
        interfaces: [], launches: [], refusals: [], callbacks: [], elapsed: 0.01, reason: '' };
    const a = raw.immediate[0];
    if (condition.method === 'exert') {
        a.temp.notify_fail = '你所学的内功中没有这种功能。\n';
        if (ok) {
            const recover = p.ability === 'recover';
            a.neili -= recover ? 33 : 100; raw.metrics[0] = { neili_cost: recover ? 33 : 100, ability_launched: 1 };
            a.learned[recover ? 'force' : bibo] = 1;
            raw.launches.push({ actor: a.object, skill: recover ? 'force' : bibo, argument: p.action.slice(6) });
            if (recover) { a.qi += 100; raw.metrics[0].qi_recovery = 100; }
            else {
                const amount = p.variant === 'a7-expiry' ? 16 : 66;
                a.temp.apply.attack = (a.temp.apply.attack ?? 0) + amount;
                a.temp.apply.defense = (a.temp.apply.defense ?? 0) + amount;
                a.temp.powerup = 1; if (p.fighting) a.busy = busy;
            }
        } else {
            a.temp.notify_fail = p.refusal; raw.reason = ansi + p.refusal;
            raw.refusals.push({ actor: a.object, reason: raw.reason });
        }
        a.powers = powers(a);
        if (p.repeat_actions) {
            const firstAfter = structuredClone(a), reason = ansi + '你已经在运功中了。\n';
            a.temp.notify_fail = '你已经在运功中了。\n'; raw.refusals.push({ actor: a.object, reason });
            raw.repeat_steps = [
                { action: p.action, before: structuredClone(before[0]), after: firstAfter, accepted: 1,
                    launches_before: 0, launches_after: 1, refusals_before: 0, refusals_after: 0,
                    metrics: structuredClone(raw.metrics[0]), reason: '' },
                { action: p.action, before: structuredClone(firstAfter), after: structuredClone(a), accepted: 0,
                    launches_before: 1, launches_after: 1, refusals_before: 0, refusals_after: 1,
                    metrics: structuredClone(raw.metrics[0]), reason },
            ];
        }
    } else if (condition.method === 'interface') {
        const result = interfaceResults[p.variant];
        raw.interfaces.push({ ...p.interface, result: result || falseResult,
            implemented_by: p.ability === 'can_learn' ? '/cmds/skill/learn' : p.ability.startsWith('query_')
                ? '/clone/user/user' : '/kungfu/skill/' + p.skill });
        if (!ok) { a.temp.notify_fail = qualificationRefusals[p.variant]; raw.reason = ansi + a.temp.notify_fail; }
    } else {
        a.temp.time = { [condition.method]: 1791763200 };
        raw.movement_room = { no_fight: null, practice_improve: null, research_improve: null };
        if (condition.method === 'research') {
            raw.research_room = { no_fight: null, pigging: null, research_improve: null };
            a.jing -= 27; raw.metrics[0].jing_cost = 27; a.learned_points++;
            a.learned[bibo] = gain ?? (p.variant === 'b12-research-alone' ? 11 : 17);
            a.temp.notify_fail = '依你目前的能力，没有办法研究这种技能。\n';
        } else {
            const [cost, progress] = practice[p.variant]; a.qi -= cost;
            if (cost) raw.metrics[0].qi_cost = cost;
            if (progress) a.learned[anying] = progress;
            a.temp.notify_fail = p.completed === p.repetitions ? '你试着练习暗影浮香，但是并没有任何进步。\n'
                : '你的体力太差了，不能练暗影浮香。\n';
            if (!ok) raw.reason = ansi + a.temp.notify_fail;
        }
    }
    raw.after = structuredClone(raw.immediate);
    if (p.observe_seconds) {
        const end = raw.after[0]; end.temp.apply.attack = 7; end.temp.apply.defense = 11;
        delete end.temp.powerup; end.powers = powers(end); raw.elapsed = 52.02;
        raw.callbacks = [{ side: 0, phase: 'before', elapsed: 50.001, state: structuredClone(a) },
            { side: 0, phase: 'after', elapsed: 50.002, state: structuredClone(end) }];
    }
    return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
function reject(c, operation, options) { const raw = trace(c, options); operation(raw); assert.throws(() => validateTaohuaForceRecord(raw, c)); }
function bothImmediate(raw, operation) { operation(raw.immediate[0]); raw.after = structuredClone(raw.immediate); }

test('有限29条件／352正式／58烟雾；仅三个随机条件100次，其他各2次', () => {
    assert.equal(cases.length, 29); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 352);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 58);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 21);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 8);
    assert.deepEqual(cases.filter(c => c.samples === 100).map(c => c.parameters.variant),
        ['a2-fighting', 'b12-research-alone', 'b13-research-pair']);
    assert.equal(new Set(cases.map(c => c.id)).size, 29);
    assert.deepEqual(cases.map(({ samples, ...c }) => c), smoke.map(({ samples, ...c }) => c));
    assert.equal(hash(cases), '1a968d245494a522ef94c4bf5f0716e18ee080ca51b69ada629dc9e43c5ed685');
    assert.equal(hash(smoke), 'd1f5018b8474a42d21bd7e55f9f731e6681598ab70952b4f9832175a6fbd188c');
    assert.equal(taohuaForceFixtureRequirements.length, 7);
    for (const c of cases) {
        assert.equal(c.parameters.collection_group, 'taohua-force');
        assert.deepEqual(c.parameters.qualification_sources, taohuaForceSourcePaths);
        assert.deepEqual(c.parameters.absent_sources, taohuaForceAbsentPaths);
        for (const path of taohuaForceSourcePaths) assert.equal(c.parameters.source_evidence[path], hash(read(path)));
        assert.equal(c.parameters.actor.equipment, undefined); assert.equal(c.parameters.target.equipment, undefined);
    }
});

test('源catalog与专用缺席入口必须实核；读权限失败不冒充ENOENT', () => {
    assert.equal(taohuaForceSourcePaths.length, 40); assert.equal(taohuaForceAbsentPaths.length, 8);
    for (const path of taohuaForceAbsentPaths) assert.throws(() => read(path), { code: 'ENOENT' });
    const changed = structuredClone(catalog); changed.skills[0].sha256 = '0'.repeat(64);
    assert.throws(() => taohuaForceConditions(changed, read));
    assert.throws(() => taohuaForceConditions({ skills: [] }, read));
    assert.throws(() => taohuaForceConditions(catalog, read, { samples: 0 }));
    const noEntry = structuredClone(catalog); noEntry.skills.find(s => s.id === bibo + '/powerup').entries = [];
    assert.throws(() => taohuaForceConditions(noEntry, read));
    assert.throws(() => taohuaForceConditions(catalog, path => taohuaForceAbsentPaths.includes(path) ? Buffer.from('present') : read(path)));
    assert.throws(() => taohuaForceConditions(catalog, path => {
        if (taohuaForceAbsentPaths.includes(path)) throw Object.assign(new Error('denied'), { code: 'EACCES' });
        return read(path);
    }), { code: 'EACCES' });
});

test('29条合成契约独立自检且不回写原记录，不证明真实LPC已接入', () => {
    for (const c of cases) {
        const raw = trace(c), original = hash(raw);
        validateTaohuaForceRecord(raw, c); assert.equal(hash(raw), original);
        assert.equal(Object.hasOwn(raw, 'parameters'), false);
        assert.equal(taohuaForceEffects([row(raw)], c).validated_samples, 1);
    }
});

test('正常强化的原费用100、零气血扣费、66加成、判定功力及原熟练1', () => {
    const c = pick('a1-powerup'), raw = trace(c), obs = validateTaohuaForceRecord(raw, c);
    assert.equal(raw.before[0].powers.attack, 8460000); assert.equal(raw.immediate[0].powers.attack, 8888904);
    assert.deepEqual(raw.immediate[0].temp.apply, { armor: 100, attack: 66, defense: 66 });
    assert.equal(obs.costs.neili, 100); assert.equal(obs.costs.qi, 0); assert.equal(obs.learned_gain, 1);
    assert.equal(obs.powers_delta.attack, 428904); assert.equal(obs.launches, 1);
    for (const operation of [r => r.metrics[0].qi_cost = 1, r => bothImmediate(r, s => s.powers.attack++),
        r => bothImmediate(r, s => s.temp.apply.damage = 66), r => bothImmediate(r, s => s.learned.force = 1),
        r => bothImmediate(r, s => s.learned[bibo] = 0), r => bothImmediate(r, s => s.skills[bibo]++)]) reject(c, operation);
});

test('实战busy支持1/2/3而非预设频率；无战斗busy保持0或null', () => {
    const c = pick('a2-fighting');
    for (const busy of [1, 2, 3]) validateTaohuaForceRecord(trace(c, { busy }), c);
    for (const busy of [null, 0, 4, -1, '2']) assert.throws(() => validateTaohuaForceRecord(trace(c, { busy }), c));
    reject(pick('a1-powerup'), r => bothImmediate(r, s => s.busy = 1));
    reject(c, r => r.before[1].fighting_opponent = 0);
});

test('neili99拒绝与100耗尽、目标不同、落英无专用强化不伪作成功', () => {
    for (const variant of ['a3-neili99', 'a5-other', 'a8-no-powerup']) {
        const c = pick(variant), r = trace(c), obs = validateTaohuaForceRecord(r, c);
        assert.equal(obs.launches, 0); assert.equal(obs.learned_gain, 0); assert.equal(obs.costs.neili, 0);
        reject(c, bad => bad.reason = '其他拒绝'); reject(c, bad => bad.refusals[0].actor = bad.before[1].object);
        reject(c, bad => bad.refusals[0].reason = ansi + '其他拒绝');
    }
    assert.equal(trace(pick('a4-neili100')).after[0].neili, 0);
});

test('重复两命令分母为2尝试1受理1发动，第二拒绝不叠加费用或熟练', () => {
    const c = pick('a6-repeat'), raw = trace(c), obs = validateTaohuaForceRecord(raw, c);
    assert.equal(obs.command_attempts, 2); assert.equal(obs.commands_accepted, 1); assert.equal(obs.launches, 1);
    for (const operation of [r => delete r.repeat_steps, r => r.repeat_steps[1].accepted = 1,
        r => r.repeat_steps[1].before.neili++, r => r.repeat_steps[0].metrics.neili_cost = 200,
        r => r.repeat_steps[1].launches_after = 2, r => r.repeat_steps[1].refusals_after = 0,
        r => r.repeat_steps[1].reason = '', r => r.repeat_steps[0].after.object = r.before[1].object,
        r => bothImmediate(r, s => s.learned[bibo] = 2)]) reject(c, operation);
});

test('52秒窗口仅接原50秒成对回调，恢复7/11且保留一次费用与熟练', () => {
    const c = pick('a7-expiry'), raw = trace(c), obs = validateTaohuaForceRecord(raw, c);
    assert.deepEqual(raw.immediate[0].temp.apply, { armor: 100, attack: 23, defense: 27 });
    assert.deepEqual(raw.after[0].temp.apply, { armor: 100, attack: 7, defense: 11 });
    assert.equal(obs.callback_pairs, 1); assert.equal(obs.expiry_seconds, 50.001);
    for (const operation of [r => r.callbacks = [], r => r.callbacks.reverse(), r => r.callbacks[0].side = 1,
        r => r.callbacks[0].state.object = r.before[1].object, r => r.callbacks[0].elapsed = 1,
        r => r.callbacks[1].elapsed = 60, r => r.elapsed = 50, r => r.callbacks[1].state.learned[bibo] = 0,
        r => r.after[0].temp.apply.attack = 0, r => r.after[0].temp.powerup = 1,
        r => r.after[0].neili++, r => r.metrics[0].neili_recovery = 100]) reject(c, operation);
});

test('两内功的recover复用原公共force归属，33内力换100当前气血', () => {
    for (const variant of ['a9-bibo-recover', 'a10-luoying-recover']) {
        const c = pick(variant), r = trace(c), obs = validateTaohuaForceRecord(r, c);
        assert.equal(obs.costs.neili, 33); assert.equal(obs.recovery.qi, 100); assert.equal(obs.net.qi, 100);
        assert.deepEqual(r.immediate[0].learned, { force: 1 }); assert.equal(r.launches[0].skill, 'force');
        reject(c, bad => bad.launches[0].skill = c.parameters.skill);
        reject(c, bad => bothImmediate(bad, s => s.eff_qi = 10100));
        reject(c, bad => { bad.metrics[0].neili_cost++; bad.metrics[0].neili_recovery = 1; });
        reject(c, bad => { bad.metrics[0].qi_recovery++; bad.metrics[0].qi_cost = 1; });
    }
});

test('资格接口返回与外包装受理分开；null/0只在own假值位置可接受', () => {
    for (const [variant, result] of Object.entries(interfaceResults)) {
        const c = pick(variant), raw = trace(c), obs = validateTaohuaForceRecord(raw, c);
        assert.equal(raw.command_accepted, 1); assert.equal(obs.interface_result, result);
        assert.equal(obs.command_attempts, 0); assert.equal(obs.commands_accepted, 0); assert.equal(obs.completed, null);
        if (!result) for (const falseResult of [0, null]) validateTaohuaForceRecord(trace(c, { falseResult }), c);
        reject(c, r => delete r.interfaces[0].result);
        reject(c, r => r.interfaces[0].implemented_by = '/inherit/skill/force');
        reject(c, r => r.interfaces[0].object = '/not-the-original-object');
        if (!result) {
            reject(c, r => r.reason = '不相关的拒绝');
            reject(c, r => bothImmediate(r, s => s.temp.notify_fail = '不相关的拒绝'));
        }
    }
    const c = pick('b2-music99');
    for (const value of [false, undefined, '', '0', [], {}]) reject(c, r => r.interfaces[0].result = value);
    for (const variant of ['b6-known-luoying', 'b7-known-bibo', 'b8-known-huashan'])
        reject(pick(variant), r => delete r.interfaces[0].argument);
});

test('容量总6400与当前6400/4900实际接口，不能改映射或提前改内力', () => {
    for (const [variant, expected] of [['b9-total-capacity', 6400], ['b10-current-bibo', 6400], ['b11-current-luoying', 4900]]) {
        const c = pick(variant), r = trace(c); assert.equal(validateTaohuaForceRecord(r, c).interface_result, expected);
        reject(c, bad => bad.interfaces[0].result++);
        reject(c, bad => bothImmediate(bad, s => s.neili = expected));
        reject(c, bad => bothImmediate(bad, s => s.mappings.force = 'huashan-xinfa'));
    }
});

test('研究按force系数150/120而非默认80，原随机支持33/49，熟练1..11/1..17', () => {
    for (const [variant, bound, maximum] of [['b12-research-alone', 33, 11], ['b13-research-pair', 49, 17]]) {
        const c = pick(variant), support = taohuaForceResearchSupport(c.parameters);
        assert.equal(support.random_bound, bound); assert.deepEqual(support.gains, Array.from({ length: maximum }, (_, i) => i + 1));
        for (let gain = 1; gain <= maximum; gain++) validateTaohuaForceRecord(trace(c, { gain }), c);
        for (const gain of [0, maximum + 1, -1, null, '1']) assert.throws(() => {
            const r = trace(c); bothImmediate(r, s => s.learned[bibo] = gain); validateTaohuaForceRecord(r, c);
        });
        const r = trace(c), obs = validateTaohuaForceRecord(r, c);
        assert.equal(obs.completed, 1); assert.equal(obs.costs.jing, 27); assert.equal(obs.learned_points, 1);
        assert.equal(r.after[0].potential, r.before[0].potential); assert.equal(r.after[0].skills[bibo], 200);
        for (const operation of [bad => bad.metrics[0].jing_cost = 26, bad => bothImmediate(bad, s => s.learned_points = 0),
            bad => bothImmediate(bad, s => s.potential--), bad => bothImmediate(bad, s => s.learned[luoying] = 1),
            bad => bad.research_room.research_improve = 10]) reject(c, operation);
    }
    const source = read('cmds/skill/research.c').toString('utf8');
    assert.match(source, /if \(SKILL_D\(skill\)->valid_enable\("force"\)\)\s+skill = "force";/);
    assert.match(source, /case "force":\s+return \(\{ 150, 120,/);
});

test('暗影四个等级分段只扣气血10/25/25/40，实际熟练4/5/7/7', () => {
    for (const [variant, [cost, gain]] of Object.entries(practice).slice(0, 4)) {
        const c = pick(variant), raw = trace(c), obs = validateTaohuaForceRecord(raw, c);
        assert.equal(taohuaForcePracticeGain(c.parameters), gain);
        assert.equal(obs.costs.qi, cost); assert.equal(obs.costs.neili, 0); assert.equal(obs.learned_gain, gain);
        assert.equal(obs.completed, 1); assert.equal(obs.commands_accepted, 1);
        reject(c, r => r.metrics[0].qi_cost = cost + 1);
        reject(c, r => bothImmediate(r, s => s.learned[anying] = gain - 1));
    }
});

test('气血49原拒绝仍写时钟，90请求3次仅完成2次，return0保留80费用/14熟练', () => {
    const denied = pick('c5-qi49'), partial = pick('c6-partial');
    assert.equal(validateTaohuaForceRecord(trace(denied), denied).completed, 0);
    const raw = trace(partial), obs = validateTaohuaForceRecord(raw, partial);
    assert.equal(raw.command_accepted, 0); assert.equal(raw.outcome, 'observed'); assert.equal(raw.after[0].qi, 10);
    assert.equal(obs.completed, 2); assert.equal(obs.learned_gain, 14); assert.equal(obs.costs.qi, 80);
    for (const c of [denied, partial]) {
        reject(c, r => bothImmediate(r, s => delete s.temp.time));
        reject(c, r => bothImmediate(r, s => s.temp.time.practice = null));
        reject(c, r => r.command_accepted = 1);
    }
    reject(partial, r => r.outcome = 'refused'); reject(partial, r => bothImmediate(r, s => s.learned[anying] = 21));
});

test('outer/raw与条件严格同ID/入口/方法，不从raw.parameters或漂移参数推导结果', () => {
    const c = pick('a1-powerup');
    for (const operation of [r => delete r.condition_id, r => r.condition_id = pick('a2-fighting').id,
        r => r.method = 'interface', r => r.outcome = 'error', r => delete r.command_accepted]) reject(c, operation);
    for (const operation of [bad => bad.id += '-extra', bad => bad.entry_id = 'wrong',
        bad => bad.method = 'perform', bad => bad.stage = 'teaching', bad => bad.parameters.actor.skills[bibo]++,
        bad => bad.parameters.expected = 'refused', bad => delete bad.parameters.source_evidence]) {
        const bad = structuredClone(c); operation(bad); assert.throws(() => validateTaohuaForceRecord(trace(c), bad));
    }
    const raw = trace(c); raw.parameters = { expected: 'refused', skill: 'invented' };
    validateTaohuaForceRecord(raw, c);
    assert.throws(() => taohuaForceEffects([{ ...row(raw), condition_id: 'wrong' }], c));
    assert.throws(() => taohuaForceEffects([{ ...row(raw), outcome: 'refused' }], c));
});

test('实际空值与缺键不同；USER、房间、学习映射和资源未知不补零', () => {
    for (const [variant, operation] of [
        ['a1-powerup', r => delete r.before[0].busy], ['a1-powerup', r => r.before[0].userp = 0],
        ['a1-powerup', r => r.before[0].wizardp = 1], ['a1-powerup', r => delete r.before[1].conditions],
        ['a1-powerup', r => delete r.before[0].cultivation['special_skill/self']],
        ['a1-powerup', r => r.before[0].learned = []], ['a1-powerup', r => r.before[0].temp.apply.attack = 1],
        ['a1-powerup', r => r.before[0].effective_int = 40], ['a1-powerup', r => r.before[0].effective_str = 36],
        ['a1-powerup', r => r.metrics[0] = null], ['a1-powerup', r => r.metrics[1].qi_cost = null],
        ['a1-powerup', r => bothImmediate(r, s => delete s.neili)],
        ['c1-level29', r => delete r.movement_room.no_fight], ['b12-research-alone', r => delete r.research_room.pigging],
    ]) reject(pick(variant), operation);
});

test('无普通攻击两侧hit/dodge/parry等稀疏计数只许0，不接未知、负数或心跳', () => {
    const c = pick('a1-powerup');
    for (const side of [0, 1]) for (const key of ['hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats']) {
        const raw = trace(c); raw.metrics[side][key] = 0; validateTaohuaForceRecord(raw, c);
        for (const value of [1, null, -1]) reject(c, r => r.metrics[side][key] = value);
    }
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'dropped', 'terminals'])
        reject(c, r => r[key].push({}));
});

test('报告区分样本/尝试/受理/发动/进展，接口与非练研遍数不补0', () => {
    const repeat = pick('a6-repeat'), partial = pick('c6-partial'), denied = pick('c5-qi49'), iface = pick('b9-total-capacity');
    const r = taohuaForceEffects([row(trace(repeat)), row(trace(repeat))], repeat);
    assert.equal(r.samples, 2); assert.equal(r.command_attempts, 4); assert.equal(r.commands_accepted, 2);
    assert.equal(r.launches, 2); assert.equal(r.learned_gain.mean, 1); assert.equal(r.costs.neili.mean, 100);
    assert.equal(r.completed_repetitions.n, 0); assert.equal(r.completed_repetitions.unknown, 2);
    const p = taohuaForceEffects([row(trace(partial))], partial);
    assert.equal(p.partial_practice_samples, 1); assert.equal(p.progressed_samples, 1); assert.equal(p.completed_repetitions.mean, 2);
    assert.equal(p.commands_accepted, 0); assert.equal(p.learned_gain.mean, 14);
    const d = taohuaForceEffects([row(trace(denied))], denied); assert.equal(d.counts.refused, 1); assert.equal(d.costs.qi.mean, 0);
    const i = taohuaForceEffects([row(trace(iface))], iface); assert.equal(i.interface_samples, 1);
    assert.equal(i.interface_result.mean, 6400); assert.equal(i.command_attempts, 0); assert.equal(i.commands_accepted, 0);
    assert.equal(i.powers_delta.attack.mean, null);
});

test('报告error保留未知分母，不当成功零费；跨条件/缺raw/不适用不可混入', () => {
    const c = pick('a1-powerup'), raw = { condition_id: c.id, method: c.method, outcome: 'error' };
    const report = taohuaForceEffects([row(raw)], c);
    assert.equal(report.counts.error, 1); assert.equal(report.unknown_samples, 1); assert.equal(report.validated_samples, 0);
    assert.equal(report.costs.neili.n, 0); assert.equal(report.costs.neili.unknown, 1); assert.equal(report.costs.neili.mean, null);
    assert.equal(report.net.qi.mean, null); assert.equal(report.learned_gain.mean, null);
    assert.throws(() => taohuaForceEffects([row(trace(pick('a4-neili100')))], c));
    assert.throws(() => taohuaForceEffects([{ condition_id: c.id, outcome: 'observed' }], c));
    assert.throws(() => taohuaForceEffects([row({ ...raw, outcome: 'not_applicable' })], c));
});

test('原command成功为正成本1/23/476，单次与接口均按受理布尔核验而保留raw', () => {
    for (const c of cases.filter(c => !c.parameters.repeat_actions && c.parameters.command_return === 1)) {
        const rows = [];
        for (const cost of [1, 23, 476]) {
            const raw = trace(c); raw.command_accepted = cost; const original = hash(raw);
            const result = validateTaohuaForceRecord(raw, c);
            assert.equal(raw.command_accepted, cost); assert.equal(hash(raw), original);
            assert.equal(result.commands_accepted, c.method === 'interface' ? 0 : 1);
            rows.push(row(raw));
        }
        assert.equal(taohuaForceEffects(rows, c).commands_accepted, c.method === 'interface' ? 0 : 3);
        for (const value of [0, -1, 0.5, undefined, null, '23', false, true, {}, [], NaN, Infinity])
            reject(c, raw => raw.command_accepted = value);
        reject(c, raw => delete raw.command_accepted);
    }
    // Expected command failure remains exactly zero, even when partial practice progressed.
    for (const c of cases.filter(c => c.parameters.command_return === 0)) {
        validateTaohuaForceRecord(trace(c), c);
        for (const value of [1, 23, 476, -1, 0.5, undefined, null, '0', false])
            reject(c, raw => raw.command_accepted = value);
    }
});

test('重复步骤保留正成本，顶层仍是runner聚合1；第二步0，不把成本累加为受理数', () => {
    const c = pick('a6-repeat'), rows = [];
    for (const cost of [1, 23, 476]) {
        const raw = trace(c); raw.repeat_steps[0].accepted = cost; const original = hash(raw);
        const result = validateTaohuaForceRecord(raw, c);
        assert.equal(raw.command_accepted, 1); assert.equal(raw.repeat_steps[1].accepted, 0);
        assert.equal(hash(raw), original); assert.equal(result.commands_accepted, 1); rows.push(row(raw));
    }
    const effect = taohuaForceEffects(rows, c);
    assert.equal(effect.commands_accepted, 3); assert.equal(effect.command_attempts, 6); assert.equal(effect.launches, 3);
    for (const value of [0, -1, 0.5, undefined, null, '23', false, true, {}, []])
        reject(c, raw => raw.repeat_steps[0].accepted = value);
    for (const value of [1, 23, 476, -1, 0.5, undefined, null, '0', false])
        reject(c, raw => raw.repeat_steps[1].accepted = value);
    for (const side of [0, 1]) reject(c, raw => delete raw.repeat_steps[side].accepted);
    for (const value of [0, 23, 476, -1, 0.5, undefined, null, '1', true])
        reject(c, raw => raw.command_accepted = value);
});
