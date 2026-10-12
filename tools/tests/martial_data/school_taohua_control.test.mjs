import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { taohuaControlConditions, taohuaControlSourcePaths, taohuaControlFixtureRequirements,
    validateTaohuaControlRecord, taohuaControlEffects } from './school_taohua_control_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value)
    ? value : JSON.stringify(value)).digest('hex');
const skills = ['lanhua-shou', 'lanhua-shou/fu', 'luoying-shenjian', 'luoying-shenjian/sui'].map(id => {
    const path = `kungfu/skill/${id}.c`, text = read(path), parsed = scanSource(text);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(text), entries: parsed.functions.filter(fn => fn.name === 'perform')
        .map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'perform' })) };
});
const catalog = { skills, source_fingerprint: hash(skills), dictionary_sha256: hash('offline-control-no-dictionary') };
const cases = taohuaControlConditions(catalog, read), smoke = taohuaControlConditions(catalog, read, { smoke: true });
const pick = (ability = 'fu', tag = 'baseline', level = 200) => {
    const result = cases.find(c => c.id === `school-taohua-control-${ability}-l${level}-${tag}`);
    assert.ok(result, `${ability}/${level}/${tag}`); return result;
};

function snapshot(config, side) {
    const apply = { armor: 100, ...(config.equipment ? { damage: 50, dodge: -1 } : {}) };
    const qualified = key => key.includes('/') || key === 'character';
    const unarmed = Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => config.skills[k] ?? 0));
    return { ...Object.fromEntries(Object.entries(config.properties).filter(([key]) => !qualified(key))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([key]) => qualified(key))),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, living: 1, ghost: 0, fighting_opponent: 1, busy: config.busy ?? null,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations), learned: {}, temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, level]) =>
            [key, Math.trunc(level / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_str: config.properties.str + Math.trunc(unarmed / 10),
        effective_con: config.properties.con + Math.trunc(config.skills.force / 10),
        weapon: config.equipment ? 'sword' : 'none', weapon_damage: config.equipment ? 50 : 0,
        weapon_flag: config.equipment ? 4 : 0, weapon_details: config.equipment ? {
            object: '/tests/sword#' + (200 + side), program: '/tests/sword', skill_type: 'sword',
            weight: 3000, damage: 50, flag: 4, consistence: 100, material: null,
        } : {}, secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

// Explicit synthetic raw protocol; never an observed MUD event or random-frequency oracle.
function trace(condition, { hit, progress = 1, colored = false } = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const raw = { kind: 'sample', condition_id: condition.id, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        command_accepted: Number(accepted), launches: [], refusals: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [], callbacks: [],
        reason: '', elapsed: 0.01 };
    if (accepted) {
        hit ??= p.gate_expectation !== 'miss';
        raw.launches = [{ actor: before[0].object, skill: p.skill, argument: `${p.ability} right` }];
        raw.metrics[0].ability_launched = 1;
        const fee = p.ability === 'fu' ? (hit ? 100 : 0) : (hit ? 80 : 180);
        if (fee) raw.metrics[0].neili_cost = fee;
        raw.immediate[0].neili -= fee;
        if (p.ability === 'fu') raw.immediate[0].busy = hit ? 1 : 2;
        else if (!hit) raw.immediate[0].busy = 1;
        if (hit) raw.immediate[1].busy = p.ability === 'fu'
            ? Math.trunc(before[0].effective_skills.hand / 30) + 2
            : Math.trunc(before[0].skills[p.skill] / 22) + 1;
        if (progress) raw.immediate[0].learned[p.skill] = progress;
        raw.immediate[0].temp.notify_fail = '你所使用的外功中没有这种功能。\n';
    } else {
        const message = colored ? '\x1b[1;36m' + p.refusal + '\x1b[0m' : p.refusal;
        raw.reason = '\x1b[256D\x1b[K' + message;
        raw.refusals = [{ actor: before[0].object, reason: raw.reason }];
        raw.immediate[0].temp.notify_fail = message;
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
function rejects(condition, mutation, options) {
    const raw = trace(condition, options); mutation(raw); raw.after = structuredClone(raw.immediate);
    assert.throws(() => validateTaohuaControlRecord(raw, condition));
}

test('单命令正执行成本1/23/476均受理，统计不累加成本且原记录不改写', () => {
    for (const condition of cases.filter(item => item.parameters.expected === 'observed')) {
        const records = [1, 23, 476].map(cost => {
            const raw = trace(condition); raw.command_accepted = cost; return raw;
        });
        const before = records.map(raw => JSON.stringify(raw));
        for (const raw of records) assert.equal(validateTaohuaControlRecord(raw, condition).accepted, true);
        const wrap = raw => ({ condition_id: condition.id, outcome: raw.outcome, raw });
        assert.deepEqual(taohuaControlEffects(records.map(wrap), condition),
            taohuaControlEffects(records.map(raw => wrap({ ...raw, command_accepted: 1 })), condition));
        assert.deepEqual(records.map(raw => JSON.stringify(raw)), before, '原成本不可归一化或回填');
    }
});

test('命令成本必须显式非负安全整数，拒绝只允许0且不能以缺值冒充', () => {
    const invalid = [undefined, null, false, true, '1', {}, [], -1, 0.5, NaN, Infinity,
        Number.MAX_SAFE_INTEGER + 1];
    for (const condition of cases) {
        const missing = trace(condition); delete missing.command_accepted;
        assert.throws(() => validateTaohuaControlRecord(missing, condition), condition.id);
        for (const cost of invalid) {
            const raw = trace(condition); raw.command_accepted = cost;
            assert.throws(() => validateTaohuaControlRecord(raw, condition), condition.id + ': ' + String(cost));
        }
        if (condition.parameters.expected === 'observed') {
            const raw = trace(condition); raw.command_accepted = 0;
            assert.throws(() => validateTaohuaControlRecord(raw, condition), '已受理不可记0成本');
        } else {
            const zero = trace(condition); zero.command_accepted = 0;
            assert.equal(validateTaohuaControlRecord(zero, condition).accepted, false);
            for (const cost of [1, 23, 476]) {
                const raw = trace(condition); raw.command_accepted = cost;
                assert.throws(() => validateTaohuaControlRecord(raw, condition), '拒绝不可记正成本');
            }
        }
    }
});

test('有限27条件/1034正式/54烟雾，三修为、原门槛与负内力分列', () => {
    assert.equal(cases.length, 27); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1034);
    assert.equal(smoke.length, 27); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 54);
    assert.equal(hash(cases), '4ca1afa364c2b385615aaaeae13016b5da2c945efafc59972f6f8b7cd8896b6f');
    assert.equal(hash(smoke), '1d6d039c4af6eee41187809511f35d21822395d8ef0e896c9db365a514cea81b');
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 13);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.deepEqual(smoke.map(c => ({ ...c, samples: 0 })), cases.map(c => ({ ...c, samples: 0 })));
    for (const c of cases) {
        assert.equal(c.parameters.observe_seconds, 0);
        assert.equal(c.parameters.actor.properties.character, '光明磊落');
        assert.equal(c.parameters.target.properties.character, '光明磊落');
        assert.equal(c.parameters.actor.skills['zuoyou-hubo'], undefined);
        assert.equal(c.parameters.actor.skills['martial-cognize'], undefined);
        assert.equal(c.parameters.actor.properties.jiali, 0);
        assert.equal(c.parameters.refusal_scope === 'command', false);
    }
    assert.equal(pick('fu', 'minimum', 120).parameters.actor.skills['jingluo-xue'], 120);
    assert.equal(pick('sui', 'minimum', 80).parameters.actor.skills.force, 100);
    assert.equal(pick('sui', 'minimum', 80).parameters.actor.skills['bibo-shengong'], 50);
    assert.equal(pick('sui', 'miss-neili100').parameters.actor.properties.neili, 100);
    assert.equal(pick('sui', 'force99').parameters.actor.skills.force, 98);
    assert.ok(taohuaControlFixtureRequirements.some(s => s.includes('no new probe')));
});

test('28份真实来源字节冻结；陌生入口、来源和非法样本量不生成', () => {
    assert.equal(taohuaControlSourcePaths.length, 28);
    for (const c of cases) {
        assert.deepEqual(Object.keys(c.parameters.source_evidence), taohuaControlSourcePaths);
        for (const path of taohuaControlSourcePaths) assert.equal(c.parameters.source_evidence[path], hash(read(path)));
    }
    for (const samples of [0, -1, 1.5, NaN, Infinity, '100'])
        assert.throws(() => taohuaControlConditions(catalog, read, { samples }));
    assert.throws(() => taohuaControlConditions(catalog));
    assert.throws(() => taohuaControlConditions(catalog, () => ''));
    for (const mutation of [c => c.skills[1].path = 'wrong.c', c => c.skills[1].sha256 = '0'.repeat(64),
        c => c.skills[1].entries = [], c => c.skills[1].entries[0].id += ':wrong']) {
        const wrong = structuredClone(catalog); mutation(wrong);
        assert.throws(() => taohuaControlConditions(wrong, read));
    }
    assert.throws(() => taohuaControlConditions(catalog, path => read(path) + (path.endsWith('/sui.c') ? '\n' : '')));
    assert.match(read('kungfu/skill/luoying-shenjian/sui.c'), /query\("neili"\) < 100/);
    assert.match(read('kungfu/skill/luoying-shenjian/sui.c'), /me->add\("neili", -80\)/);
    assert.match(read('mudcore/inherit/dbase.c'), /return set\(prop, old \+ data\)/);
});

test('真实createSeries/openSeries建档及非法ID/入口/重写负例，不启动驱动', () => {
    const inventory = { source_fingerprint: catalog.source_fingerprint, versions: { note: 'offline synthetic plan only' },
        files: taohuaControlSourcePaths.map(path => ({ path, sha256: hash(read(path)) })) };
    const execution = { kind: 'offline-taohua-control-plan', source_files: cases[0].parameters.source_evidence };
    const directory = mkdtempSync(join(tmpdir(), 'mud-taohua-control-plan-'));
    const manifest = createSeries(directory, { inventory, catalog, conditions: cases, execution });
    assert.deepEqual(openSeries(directory, manifest.identity).identity.conditions, cases);
    const small = createSeries(join(directory, 'smoke'), { inventory, catalog, conditions: smoke, execution });
    assert.deepEqual(openSeries(join(directory, 'smoke'), small.identity).identity.conditions, smoke);
    const wrong = structuredClone(cases); wrong[0].id += '-中文';
    assert.throws(() => createSeries(join(directory, 'bad-id'), { inventory, catalog, conditions: wrong, execution }));
    wrong[0].id = cases[0].id; wrong[0].entry_id = 'kungfu/skill/not-real.c:1:perform';
    assert.throws(() => createSeries(join(directory, 'bad-entry'), { inventory, catalog, conditions: wrong, execution }));
    assert.throws(() => createSeries(directory, { inventory, catalog, conditions: cases, execution }));
    const drift = structuredClone(manifest.identity); drift.conditions[0].parameters.actor.properties.neili++;
    assert.throws(() => openSeries(directory, drift));
});

test('27条合成契约全部通过且不改写原记录；raw无需parameters', () => {
    for (const c of cases) {
        const raw = trace(c), original = JSON.stringify(raw), observation = validateTaohuaControlRecord(raw, c);
        assert.equal(observation.accepted, c.parameters.expected === 'observed');
        assert.equal(Object.hasOwn(raw, 'parameters'), false); assert.equal(JSON.stringify(raw), original);
    }
});

test('两个原比较均按整数支持集核验，不强迫随机样本有指定频次', () => {
    for (const ability of ['fu', 'sui']) {
        const c = pick(ability);
        for (const hit of [false, true]) assert.equal(validateTaohuaControlRecord(trace(c, { hit }), c).acquired, hit);
        assert.throws(() => validateTaohuaControlRecord(trace(pick(ability, 'guaranteed-hit'), { hit: false }), pick(ability, 'guaranteed-hit')));
        assert.throws(() => validateTaohuaControlRecord(trace(pick(ability, 'guaranteed-miss'), { hit: true }), pick(ability, 'guaranteed-miss')));
        const zero = taohuaControlEffects(Array.from({ length: 100 }, () => row(trace(c, { hit: false }))), c);
        assert.equal(zero.control_given_accepted.rate, 0); assert.equal(zero.acceptance.rate, 1);
        const all = taohuaControlEffects(Array.from({ length: 100 }, () => row(trace(c, { hit: true }))), c);
        assert.equal(all.control_given_accepted.rate, 1);
    }
    assert.throws(() => validateTaohuaControlRecord(trace(pick('fu', 'baseline', 400), { hit: false }), pick('fu', 'baseline', 400)));
    assert.throws(() => validateTaohuaControlRecord(trace(pick('sui', 'baseline', 800), { hit: false }), pick('sui', 'baseline', 800)));
});

test('兰花命中AP/30+2、费100忙1；失手不收费忙2；目标无伤害', () => {
    for (const [level, expected] of [[120, 8], [200, 12], [400, 22], [800, 42]]) {
        const c = pick('fu', level === 120 ? 'minimum' : 'baseline', level);
        const result = validateTaohuaControlRecord(trace(c), c);
        assert.equal(result.target_busy_gain, expected); assert.equal(result.actor_neili_cost, 100);
        assert.equal(result.actor_busy, 1);
    }
    const miss = pick('fu', 'guaranteed-miss'), result = validateTaohuaControlRecord(trace(miss), miss);
    assert.equal(result.actor_neili_cost, 0); assert.equal(result.actor_busy, 2); assert.equal(result.target_busy_gain, 0);
    rejects(pick(), r => r.immediate[1].busy--);
    rejects(pick(), r => { r.immediate[0].neili++; r.metrics[0].neili_cost--; });
    rejects(miss, r => { r.immediate[0].neili--; r.metrics[0].neili_cost = 1; });
    rejects(pick(), r => { r.immediate[1].qi--; r.metrics[1].qi_cost = 1; });
});

test('随波按原始剑法/22+1而非有效剑法，命中不自忙；失手实际扣180', () => {
    for (const [level, expected] of [[80, 4], [200, 10], [400, 19], [800, 37]]) {
        const c = pick('sui', level === 80 ? 'minimum' : 'baseline', level);
        const result = validateTaohuaControlRecord(trace(c), c);
        assert.equal(result.target_busy_gain, expected); assert.equal(result.actor_neili_cost, 80); assert.equal(result.actor_busy, 0);
    }
    const c = pick('sui', 'guaranteed-miss'), result = validateTaohuaControlRecord(trace(c), c);
    assert.equal(result.actor_neili_cost, 180); assert.equal(result.actor_busy, 1); assert.equal(result.target_busy_gain, 0);
    rejects(pick('sui'), r => r.immediate[0].busy = 1);
    rejects(pick('sui'), r => r.immediate[1].busy = Math.trunc(r.before[0].effective_skills.sword / 22) + 1);
    rejects(c, r => { r.immediate[0].neili += 80; r.metrics[0].neili_cost -= 80; });
});

test('sui内力100失手保留-80、180失手为0，归零补款即使净差一致也拒绝', () => {
    for (const neili of [100, 180]) {
        const c = pick('sui', `miss-neili${neili}`), result = validateTaohuaControlRecord(trace(c), c);
        assert.equal(result.actor_neili_remaining, neili - 180); assert.equal(result.negative_neili, neili === 100);
        rejects(c, r => { r.metrics[0].neili_cost += 1; r.metrics[0].neili_recovery = 1; });
    }
    const c = pick('sui', 'miss-neili100');
    rejects(c, r => { r.immediate[0].neili = 0; r.metrics[0].neili_recovery = 80; });
    rejects(c, r => { r.immediate[0].neili = 0; r.metrics[0].neili_cost = 100; });
});

test('13种原局部拒绝无发动/费用/熟练；已有忙50保留但不算本次控制', () => {
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) {
        const raw = trace(c, { colored: true }), result = validateTaohuaControlRecord(raw, c);
        assert.equal(result.accepted, false); assert.equal(result.acquired, null); assert.equal(result.actor_neili_cost, 0);
        rejects(c, r => r.immediate[0].learned[c.parameters.skill] = 1);
        rejects(c, r => { r.reason = '其他错误\n'; r.refusals[0].reason = r.reason; r.immediate[0].temp.notify_fail = r.reason; });
    }
    for (const ability of ['fu', 'sui']) {
        const c = pick(ability, 'target-busy50'), report = taohuaControlEffects([row(trace(c))], c);
        assert.equal(report.target_busy_initial.mean, 50); assert.equal(report.target_busy_final.mean, 50);
        assert.equal(report.acquired_busy.n, 0); assert.equal(report.control_given_accepted.rate, null);
        assert.equal(report.refusal.rate, 1); assert.equal(report.control_per_known_command.rate, 0);
        rejects(c, r => r.immediate[1].busy = 0);
    }
});

test('原提示字段仅单独核对且保留色码，不忽略整个temp或任意终端格式', () => {
    const c = pick('fu', 'wrong-weapon');
    assert.equal(validateTaohuaControlRecord(trace(c, { colored: true }), c).accepted, false);
    for (const mutation of [r => delete r.immediate[0].temp.notify_fail,
        r => r.immediate[0].temp.notify_fail = '', r => r.immediate[0].temp.notify_fail += ' ',
        r => r.immediate[0].temp.extra = 1, r => r.immediate[1].temp.notify_fail = '错误\n',
        r => r.immediate[0].temp.notify_fail = r.immediate[0].temp.notify_fail.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')])
        rejects(c, mutation, { colored: true });
    rejects(pick(), r => r.immediate[0].temp.notify_fail = '成功了\n');
    rejects(pick(), r => r.immediate[0].temp.apply.hand = 1);
});

test('原命令弱熟练与控制成功独立，拒绝不得涨熟练或偷升修为', () => {
    for (const ability of ['fu', 'sui']) for (const hit of [true, false]) for (const progress of [0, 1])
        assert.equal(validateTaohuaControlRecord(trace(pick(ability), { hit, progress }), pick(ability)).learned_delta, progress);
    for (const ability of ['fu', 'sui']) {
        const c = pick(ability, 'baseline', 400);
        assert.throws(() => validateTaohuaControlRecord(trace(c, { progress: 0 }), c));
        rejects(c, r => r.immediate[0].learned[c.parameters.skill] = 2);
        rejects(c, r => r.immediate[0].skills[c.parameters.skill]++);
        rejects(c, r => r.immediate[1].learned.sword = 1);
    }
});

test('明确无busy/无grant接受原null或0，缺键/类型/负值不能冒充空闲', () => {
    const c = pick('fu', 'no-grant'), grant = 'can_perform/lanhua-shou/fu';
    for (const value of [null, 0]) {
        const raw = trace(c); raw.before[0].cultivation[grant] = value;
        raw.immediate[0].cultivation[grant] = value; raw.after = structuredClone(raw.immediate);
        assert.equal(validateTaohuaControlRecord(raw, c).accepted, false);
    }
    for (const value of [undefined, false, '0', '', [], {}, -1, 0.1]) {
        rejects(pick(), r => r.before[0].busy = value);
        rejects(c, r => { r.before[0].cultivation[grant] = value; r.immediate[0].cultivation[grant] = value; });
    }
    rejects(pick(), r => delete r.before[0].busy);
    rejects(c, r => { delete r.before[0].cultivation[grant]; delete r.immediate[0].cultivation[grant]; });
    for (const value of [null, false, '0', -1]) rejects(pick(), r => r.metrics[0].neili_cost = value);
    rejects(pick(), r => r.metrics[0] = null);
});

test('身份/真实资格/有效属性/装备不容漂移，缺少观测不当正常', () => {
    for (const mutate of [r => r.before[0].userp = 0, r => r.before[0].interactive = 0,
        r => r.before[0].wizardp = 1, r => r.before[1].fighting_opponent = 0,
        r => r.before[0].cultivation.character = '狡黠多变', r => r.before[0].effective_skills.hand++,
        r => r.before[1].effective_skills.parry++, r => r.before[0].effective_str++,
        r => r.before[1].effective_con++, r => r.before[0].mappings.hand = 'fake',
        r => r.before[1].weapon_details.weight--, r => r.immediate[1].weapon_details.consistence--,
        r => r.immediate[1].weapon_details.object = '/tests/sword#999', r => delete r.before[1].secondary_weapon,
        r => r.immediate[0].object = r.immediate[1].object, r => r.immediate[0].max_neili++,
        r => r.immediate[0].cultivation['family/family_name'] = '古墓派']) rejects(pick(), mutate);
});

test('实际命令/发动归属与纯控制事件严格闭合，不接受攻击/回调伪样本', () => {
    for (const mutate of [r => r.command_accepted = 0, r => r.launches = [],
        r => r.launches[0].actor = r.before[1].object, r => r.launches[0].argument = 'fu',
        r => r.metrics[0].ability_launched = 0, r => r.metrics[0].direct = 1,
        r => r.metrics[1].heartbeats = 1, r => r.callbacks = [{ function: 'unknown' }],
        r => r.attacks = [{ damage: 0 }], r => r.directs = [{ damage: 0 }],
        r => delete r.attacks, r => r.outcome = 'refused', r => r.condition_id = 'other',
        r => r.method = 'attack', r => r.elapsed = null]) rejects(pick(), mutate);
    const delayed = trace(pick()); delayed.after[1].busy--;
    assert.throws(() => validateTaohuaControlRecord(delayed, pick()));
});

test('统计只从冻结condition读取，错误和未观察不是零控制/零费用', () => {
    const c = pick('sui'), error = { condition_id: c.id, method: 'perform', outcome: 'error', reason: 'isolated failure' };
    const report = taohuaControlEffects([row(trace(c)), row(trace(c, { hit: false })), row(error)], c);
    assert.deepEqual(report.counts, { observed: 2, refused: 0, error: 1, not_applicable: 0 });
    assert.equal(report.acceptance.trials, 2); assert.equal(report.control_given_accepted.trials, 2);
    assert.equal(report.control_given_accepted.successes, 1); assert.equal(report.actor_neili_cost.mean, 130);
    assert.equal(report.acquired_busy.n, 1); assert.equal(report.unknown_effect_samples, 1);
    for (const empty of [[], [row(error)]]) {
        const r = taohuaControlEffects(empty, c);
        assert.equal(r.control_given_accepted.rate, null); assert.equal(r.actor_neili_cost.mean, null);
        assert.equal(r.target_busy_final.mean, null);
    }
    const fake = trace(c); fake.parameters = { skill: 'wrong', ability: 'fu' };
    assert.equal(taohuaControlEffects([row(fake)], c).actor_neili_cost.mean, 80);
    assert.throws(() => taohuaControlEffects([row(trace(pick('fu')))], c));
    assert.throws(() => taohuaControlEffects([{ ...row(trace(c)), outcome: 'refused' }], c));
});
