import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { taohuaDingConditions, taohuaDingFixtureRequirements, taohuaDingSourcePaths,
    taohuaDingQiSupport, validateTaohuaDingRecord, taohuaDingEffects } from './school_taohua_ding_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value)
    ? value : JSON.stringify(value)).digest('hex');
const skill = 'tanzhi-shentong', grant = 'can_perform/tanzhi-shentong/ding';
const skills = [skill, skill + '/ding'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', source = read(path), parsed = scanSource(source);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: parsed.functions.filter(fn => fn.name === 'perform')
        .map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'perform' })) };
});
const catalog = { skills, source_fingerprint: hash(skills), dictionary_sha256: hash('synthetic-test-no-dictionary') };
const cases = taohuaDingConditions(catalog, read), smoke = taohuaDingConditions(catalog, read, { smoke: true });
const pick = (tag = 'baseline', level = 200) => {
    const result = cases.find(item => item.id === `school-taohua-ding-l${level}-${tag}`);
    assert.ok(result, tag); return result;
};

function snapshot(cfg, side, fighting) {
    const equipped = !!cfg.equipment, apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    const cultivationKey = key => key.includes('/') || key === 'character';
    const fields = Object.entries(cfg.properties);
    const unarmed = Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0));
    return { ...Object.fromEntries(fields.filter(([key]) => !cultivationKey(key))),
        cultivation: Object.fromEntries(fields.filter(([key]) => cultivationKey(key))),
        object: '/tests/actor#' + (side + 100), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: Number(fighting), busy: cfg.busy ?? null, no_perform: cfg.temp?.no_perform ?? null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), learned: {}, temp: { apply, ...cfg.temp },
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_str: cfg.properties.str + Math.trunc(unarmed / 10),
        effective_con: cfg.properties.con + Math.trunc(cfg.skills.force / 10),
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0, weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { program: '/tests/sword', object: '/tests/sword#' + (side + 200),
            skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100, material: null } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

// Independent arithmetic for synthetic traces, not an observed MUD event or sample.
function qiDamage(input, actor, intellect) {
    let value = input;
    if (actor.jiali) value += Math.trunc(actor.jiali * value / 200);
    const strength = actor.str * 2 + actor.effective_str;
    assert.ok(strength >= 70 && actor.int === 36, 'only frozen neutral inputs');
    value += Math.trunc(value * (Math.trunc((strength - 60) / 4) + 30) / 50);
    if (intellect) value += Math.trunc(value * 7 / 36);
    if (value > 1500) return Math.trunc((value - 1500) / 4) + 1000;
    if (value > 500) return Math.trunc((value - 500) / 2) + 500;
    return value;
}

function trace(condition, { hit, damage, intellect = false, progress = 1 } = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 });
        preparation.after = structuredClone(before[1]);
    }
    const raw = { kind: 'sample', condition_id: condition.id, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        command_accepted: Number(accepted), launches: [], refusals: [], directs: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [], callbacks: [],
        elapsed: p.observe_seconds ? 6.01 : 0.01, reason: '', ...(preparation ? { preparation } : {}) };
    if (accepted) {
        hit ??= p.gate_expectation !== 'miss';
        raw.launches.push({ actor: before[0].object, skill, argument: 'ding right' });
        raw.metrics[0].ability_launched = 1;
        raw.immediate[0].busy = hit ? 2 : 1;
        const neili = hit ? 200 + before[0].jiali : 150;
        raw.metrics[0].neili_cost = neili; raw.immediate[0].neili -= neili;
        if (hit) {
            const ap = before[0].effective_skills.finger;
            damage ??= Math.trunc(ap / 4);
            raw.directs.push({ actor: 0, target: 1, type: 2, damage, percent: 0, weapon: 'none', weapon_object: '' });
            raw.metrics[0].direct = 1;
            const loss = qiDamage(damage, before[0], intellect);
            raw.metrics[1].qi_cost = loss; raw.immediate[1].qi -= loss;
            raw.immediate[1].no_perform = 1; raw.immediate[1].temp.no_perform = 1;
        }
        if (progress) raw.immediate[0].learned[skill] = progress;
    } else {
        const refusal = p.refusal === 'unmapped-finger-command' ? '你现在的(finger)中并没有这种外功。\n' : p.refusal;
        raw.reason = '\x1b[256D\x1b[K' + refusal;
        raw.refusals.push({ actor: before[0].object, reason: raw.reason });
        raw.immediate[0].temp.notify_fail = raw.reason;
    }
    raw.after = structuredClone(raw.immediate);
    if (p.observe_seconds) {
        raw.after[1].no_perform = null; delete raw.after[1].temp.no_perform;
        raw.callbacks = ['before', 'after'].map((phase, index) => ({
            owner: '/kungfu/skill/tanzhi-shentong/ding', function: 'ding_end', side: 1, phase,
            elapsed: 2 + index / 1000, state: structuredClone(index ? raw.after[1] : raw.immediate[1]) }));
    }
    return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
function rejected(condition, mutation, options) {
    const raw = trace(condition, options); mutation(raw);
    assert.throws(() => validateTaohuaDingRecord(raw, condition));
}

test('固定22条件/730正式/44烟雾，门槛与三种观察边界不做笛卡尔积', () => {
    assert.equal(cases.length, 22); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 730);
    assert.equal(smoke.length, 22); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 44);
    assert.equal(hash(cases), '0fc7550bd2d034e5557e9eaba77d1d7e87de9e3c6baaedfd53363b8246950c11');
    assert.equal(hash(smoke), '60b1984b8a1c996afb99ee0d7594b3a0b9b4aa23e88df5f2ff06e26cb5cdf624');
    for (const [matrix, original] of [[cases, '23593f12042eb042bdaefcc7ba30bbc48e188637fe8da5095881357934f0e7cf'],
        [smoke, '99a3d1d6335dcb5002c8894c5a69f1990e2e68577ffbe45cc0883394f1ebea0b']]) {
        const previous = structuredClone(matrix);
        for (const c of previous) for (const path of ['adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c', 'data/e2c_dict.o'])
            delete c.parameters.source_evidence[path];
        assert.equal(hash(previous), original, '追加三份中文来源以外，旧准备条件逐字段不变');
    }
    assert.deepEqual(smoke.map(c => ({ ...c, samples: 0 })), cases.map(c => ({ ...c, samples: 0 })));
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 13);
    assert.equal(cases.filter(c => c.parameters.refusal_scope === 'command').length, 3);
    assert.equal(cases.filter(c => c.parameters.observe_seconds > 0).length, 1);
    assert.equal(pick('natural-release').samples, 2); assert.equal(pick('natural-release').parameters.observe_seconds, 6);
    assert.equal(pick('minimum', 120).parameters.actor.skills[skill], 120);
    assert.equal(pick('minimum', 120).parameters.actor.skills['jingluo-xue'], 120);
    assert.equal(pick('minimum', 120).parameters.actor.properties.max_neili, 1500);
    assert.equal(pick('minimum', 120).parameters.actor.properties.neili, 300);
    assert.equal(pick('target-busy50').parameters.target.busy, 50);
    assert.equal(pick('sword').parameters.actor.equipment.type, 'sword');
    assert.deepEqual(pick('no-map').parameters.actor.preparations, {});
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
});

test('所有实际来源保留SHA，目录冒充或任一源码字节漂移拒绝', () => {
    for (const condition of cases) {
        assert.deepEqual(Object.keys(condition.parameters.source_evidence), taohuaDingSourcePaths);
        for (const path of taohuaDingSourcePaths) assert.equal(condition.parameters.source_evidence[path], hash(read(path)));
    }
    const wrong = structuredClone(catalog); wrong.skills[0].sha256 = '0'.repeat(64);
    assert.throws(() => taohuaDingConditions(wrong, read));
    assert.throws(() => taohuaDingConditions(catalog, path => read(path) + (path.endsWith('/ding.c') ? '\n' : '')));
    for (const samples of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => taohuaDingConditions(catalog, read, { samples }));
    assert.throws(() => taohuaDingConditions(catalog));
    assert.match(read('kungfu/skill/tanzhi-shentong/ding.c'), /call_out\("ding_end", 1 \+ random\(5\), me, target\)/);
    assert.match(read('adm/daemons/combatd.c'), /damage_bonus = jiali \* damage \/ 200;/);
    assert.match(read('data/e2c_dict.o'), /"finger":"基本指法"/);
    assert.ok(taohuaDingFixtureRequirements.some(s => s.includes('query_notify_fail')));
    assert.ok(taohuaDingFixtureRequirements.some(s => s.includes('reverse-checked ding_end')));
});

test('真实createSeries/openSeries入口与非法ID/入口负例（仅临时台账，无driver）', () => {
    const inventory = { source_fingerprint: catalog.source_fingerprint, versions: { note: 'offline synthetic plan only' },
        files: taohuaDingSourcePaths.map(path => ({ path, sha256: hash(read(path)) })) };
    const execution = { kind: 'offline-ding-plan-validation', smoke: false,
        source_files: { ...cases[0].parameters.source_evidence } };
    const directory = mkdtempSync(join(tmpdir(), 'mud-taohua-ding-plan-'));
    const manifest = createSeries(directory, { inventory, catalog, conditions: cases, execution });
    assert.deepEqual(openSeries(directory, manifest.identity).identity.conditions, cases);
    const smokeManifest = createSeries(join(directory, 'smoke'), { inventory, catalog, conditions: smoke,
        execution: { ...execution, smoke: true } });
    assert.deepEqual(openSeries(join(directory, 'smoke'), smokeManifest.identity).identity.conditions, smoke);
    const illegal = structuredClone(cases); illegal[0].id += '-中文';
    assert.throws(() => createSeries(join(directory, 'illegal-id'), { inventory, catalog, conditions: illegal, execution }));
    illegal[0].id = cases[0].id; illegal[0].entry_id = 'kungfu/skill/not-real.c:1:perform';
    assert.throws(() => createSeries(join(directory, 'illegal-entry'), { inventory, catalog, conditions: illegal, execution }));
    assert.throws(() => createSeries(directory, { inventory, catalog, conditions: cases, execution }));
    const changed = structuredClone(manifest.identity); changed.conditions[0].samples++;
    assert.throws(() => openSeries(directory, changed));
});

test('22条合成原协议均通过，注册状态不冒充实际采集', () => {
    for (const condition of cases) {
        const raw = trace(condition), bytes = JSON.stringify(raw);
        const result = validateTaohuaDingRecord(raw, condition);
        assert.equal(JSON.stringify(raw), bytes, '不得修写原记录');
        assert.equal(result.accepted, condition.parameters.expected === 'observed');
    }
    assert.ok(read('tools/tests/martial_data/school_combat_cases.mjs').includes('school_taohua_ding_cases'));
});

test('原force_me成功保留1/23/476执行成本，受理和命中统计不累加成本', () => {
    for (const condition of cases.filter(c => c.parameters.expected === 'observed')) {
        for (const cost of [1, 23, 476]) {
            const raw = trace(condition); raw.command_accepted = cost;
            const bytes = JSON.stringify(raw);
            assert.equal(validateTaohuaDingRecord(raw, condition).accepted, true);
            assert.equal(raw.command_accepted, cost);
            assert.equal(JSON.stringify(raw), bytes, '不改写原成本');
        }
    }
    const c = pick(), rows = [1, 23, 476].map((cost, index) => {
        const raw = trace(c, { hit: index !== 1 }); raw.command_accepted = cost; return row(raw);
    });
    const report = taohuaDingEffects(rows, c);
    assert.equal(report.observed, 3); assert.equal(report.refused, 0);
    assert.equal(report.hit.trials, 3); assert.equal(report.hit.successes, 2);
    assert.equal(report.ability_neili.n, 3);
});

test('命令成本缺键/非法类型/越界拒绝，成功零值及拒绝正值不能混淆', () => {
    for (const condition of cases) {
        rejected(condition, raw => { delete raw.command_accepted; });
        for (const value of [undefined, null, false, true, '1', {}, [], -1, 0.5, NaN, Infinity,
            Number.MAX_SAFE_INTEGER + 1]) rejected(condition, raw => { raw.command_accepted = value; });
        if (condition.parameters.expected === 'observed')
            rejected(condition, raw => { raw.command_accepted = 0; });
        else {
            assert.equal(validateTaohuaDingRecord(trace(condition), condition).accepted, false);
            for (const value of [1, 23, 476]) rejected(condition, raw => { raw.command_accepted = value; });
        }
    }
});

test('原AP/DP严格不等式：300/300可命中或失手，DP149必过/449必不过，800必过', () => {
    for (const hit of [true, false]) validateTaohuaDingRecord(trace(pick(), { hit }), pick());
    rejected(pick('parry298'), () => {}, { hit: false });
    rejected(pick('parry898'), () => {}, { hit: true });
    rejected(pick('baseline', 800), () => {}, { hit: false });
    rejected(pick('minimum', 120), () => {}, { hit: false });
    const minimum = trace(pick('minimum', 120));
    assert.equal(minimum.before[0].effective_skills.finger, 180);
    assert.equal(minimum.before[1].effective_skills.parry, 89);
});

test('逐级穷举原damage支持集与两种悟性结果；REMOTE输入不等于实际掉血', () => {
    let checked = 0;
    for (const condition of [pick('minimum', 120), pick(), pick('baseline', 400), pick('baseline', 800), pick('jiali50')]) {
        const ap = trace(condition).before[0].effective_skills.finger;
        for (let input = Math.trunc(ap / 4); input < Math.trunc(ap / 4) + Math.trunc(ap / 2); input++) {
            for (const intellect of [false, true]) {
                const raw = trace(condition, { damage: input, intellect });
                assert.equal(validateTaohuaDingRecord(raw, condition).qi_loss, qiDamage(input, raw.before[0], intellect));
                checked++;
            }
        }
        rejected(condition, raw => { raw.directs[0].damage = Math.trunc(ap / 4) - 1; });
        rejected(condition, raw => { raw.directs[0].damage = Math.trunc(ap / 4) + Math.trunc(ap / 2); });
    }
    assert.equal(checked, 2580);
    const base = trace(pick());
    assert.deepEqual(taohuaDingQiSupport(75, base.before[0]), [145, 173]);
    assert.notEqual(base.directs[0].damage, base.metrics[1].qi_cost);
    const forced = trace(pick('jiali50'));
    assert.deepEqual(taohuaDingQiSupport(75, forced.before[0]), [180, 215]);
});

test('原费用与资源闭账：命中200+加力、失手150，不能把创伤、恢复或输入damage混作掉血', () => {
    for (const [condition, options, cost] of [[pick(), {}, 200], [pick(), { hit: false }, 150], [pick('jiali50'), {}, 250]]) {
        const raw = trace(condition, options);
        const result = validateTaohuaDingRecord(raw, condition);
        assert.equal(result.total_neili, cost); assert.equal(result.wound, 0);
        for (const side of [0, 1]) for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            rejected(condition, r => { r.metrics[side][key + '_cost'] = (r.metrics[side][key + '_cost'] ?? 0) + 1; }, options);
            rejected(condition, r => { r.metrics[side][key + '_recovery'] = 1; }, options);
            rejected(condition, r => { r.immediate[side][key]--; }, options);
        }
    }
    rejected(pick(), r => {
        const wrong = r.directs[0].damage;
        r.metrics[1].qi_cost = wrong; r.immediate[1].qi = r.before[1].qi - wrong;
        r.after = structuredClone(r.immediate);
    });
    rejected(pick(), r => {
        r.metrics[1].eff_qi_cost = 1; r.immediate[1].eff_qi--; r.after = structuredClone(r.immediate);
    });
});

test('禁招不等于忙乱，原目标busy50经默认interrupt0保留，缺字段不可当零', () => {
    const condition = pick('target-busy50'), raw = trace(condition), result = validateTaohuaDingRecord(raw, condition);
    assert.equal(result.actor_busy, 2); assert.equal(result.target_busy, 50);
    assert.equal(raw.immediate[1].no_perform, 1);
    for (const value of [0, 4, 7, 49, 51, null, '50']) rejected(condition, r => { r.immediate[1].busy = value; });
    for (const key of ['busy', 'no_perform']) for (const phase of ['before', 'immediate', 'after'])
        for (const side of [0, 1]) rejected(pick(), r => { delete r[phase][side][key]; });
    for (const value of [undefined, false, '0', -1, 2, NaN]) rejected(pick(), r => { r.before[0].no_perform = value; });
    for (const value of [null, 0]) {
        const r = trace(pick()); r.before[0].no_perform = value;
        validateTaohuaDingRecord(r, pick());
    }
    rejected(pick(), r => { delete r.immediate[1].temp.no_perform; });
    rejected(pick(), r => { r.immediate[1].busy = 2; });
});

test('自然ding_end必须真实成对同源，保留测时且只解除禁招，不伪称忙乱自然恢复', () => {
    const c = pick('natural-release'), raw = trace(c), result = validateTaohuaDingRecord(raw, c);
    assert.equal(result.release_observed, true); assert.equal(result.release_elapsed, 2.001);
    assert.equal(raw.after[0].busy, 2); assert.equal(raw.after[1].no_perform, null);
    const instant = validateTaohuaDingRecord(trace(pick()), pick());
    assert.equal(instant.release_observed, null); assert.equal(instant.release_elapsed, null);
    const mutations = [r => { r.callbacks = []; }, r => { r.callbacks.pop(); }, r => { r.callbacks.reverse(); },
        r => { r.callbacks[0].owner = '/kungfu/skill/other'; }, r => { r.callbacks[0].function = 'fake'; },
        r => { r.callbacks[0].side = 0; }, r => { r.callbacks[1].phase = 'before'; },
        r => { r.callbacks[0].elapsed = -1; }, r => { r.callbacks[1].elapsed = r.elapsed + 1; },
        r => { r.callbacks[0].elapsed = 3; }, r => { r.callbacks[1].state.qi--; },
        r => { delete r.callbacks[1].state.no_perform; }, r => { r.after[1].no_perform = 1; },
        r => { r.after[1].temp.no_perform = 1; }, r => { r.after[1].temp.other = 1; r.callbacks[1].state.temp.other = 1; },
        r => { r.after[0].busy = 0; }, r => { r.after[1].qi--; }, r => { r.metrics[1].heartbeats = 1; }];
    for (const mutate of mutations) rejected(c, mutate);
    const integerTick = trace(c); integerTick.callbacks[0].elapsed = 0.5; integerTick.callbacks[1].elapsed = 0.501;
    validateTaohuaDingRecord(integerTick, c); // integer call_out ticks need not mean >= 1 wall second.
    rejected(pick(), r => { r.callbacks.push(raw.callbacks[0]); });
});

test('三种公共拒绝与十种招式拒绝不混入受理分母，原提示必须同源', () => {
    for (const condition of cases.filter(c => c.parameters.expected === 'refused')) {
        const raw = trace(condition), result = validateTaohuaDingRecord(raw, condition);
        assert.equal(result.accepted, false); assert.equal(result.hit, false); assert.equal(result.total_neili, 0);
        assert.equal(result.refusal_scope, condition.parameters.refusal_scope);
        for (const mutation of [r => { r.command_accepted = 1; }, r => { r.refusals = []; },
            r => { r.reason = ''; }, r => { r.refusals[0].reason = '伪造'; },
            r => { r.reason = r.refusals[0].reason = '错误入口\n'; },
            r => { r.launches.push({ actor: r.before[0].object, skill, argument: 'ding right' }); },
            r => { r.immediate[0].learned[skill] = 1; }]) rejected(condition, mutation);
    }
    const wrongScope = trace(pick('no-map'));
    wrongScope.reason = wrongScope.refusals[0].reason = '你没有激发弹指神通，难以施展「定昆仑」。\n';
    assert.throws(() => validateTaohuaDingRecord(wrongScope, pick('no-map')));
    for (const name of ['指法', '基本指法', 'x']) rejected(pick('no-map'), r => {
        r.reason = r.refusals[0].reason = `你现在的${name}(finger)中并没有这种外功。\n`;
    });
});

test('原弱熟练：200与最低资格允许0/1，400/800必增1；不得加等级或其它武学进度', () => {
    for (const c of [pick(), pick('minimum', 120)]) for (const progress of [0, 1])
        assert.equal(validateTaohuaDingRecord(trace(c, { progress }), c).learned_gain, progress);
    for (const level of [400, 800]) rejected(pick('baseline', level), () => {}, { progress: 0 });
    for (const value of [-1, 2, null, undefined, '1']) rejected(pick(), r => { r.immediate[0].learned[skill] = value; });
    rejected(pick(), r => { r.before[0].learned[skill] = 1; });
    rejected(pick(), r => { r.immediate[1].learned[skill] = 1; });
    rejected(pick(), r => { r.immediate[0].learned.finger = 1; });
    rejected(pick(), r => { r.immediate[0].skills[skill]++; });
});

test('有效属性、真实USER/武器、REMOTE类型/归属、稀疏计数及必需观察数组严格拒绝伪值', () => {
    const mutations = [r => { r.before[0].effective_str = 36; }, r => { r.before[0].effective_con = 36; },
        r => { r.before[0].effective_skills.finger = 200; }, r => { r.before[0].temp.str = 10; },
        r => { r.before[0].temp.debuff = { '1st': 50 }; }, r => { r.immediate[0].temp.apply.armor = 101; },
        r => { r.before[0].cultivation[grant] = 0; }, r => { r.before[0].cultivation.character = '狡黠多变'; },
        r => { r.before[0].userp = 0; }, r => { r.before[0].playerp = null; }, r => { r.before[0].wizardp = 1; },
        r => { r.before[0].object = r.before[1].object; }, r => { r.immediate[1].object += '0'; },
        r => { r.immediate[1].weapon_details.object += '0'; }, r => { r.immediate[1].weapon_details.consistence--; },
        r => { r.before[0].secondary_weapon = 'sword'; }, r => { r.before[1].weapon_flag = 0; },
        r => { r.directs[0].actor = 1; }, r => { r.directs[0].target = 0; }, r => { r.directs[0].type = 0; },
        r => { r.directs[0].percent = 10; }, r => { r.directs[0].weapon = 'sword'; }, r => { r.directs[0].weapon_object = '/tests/sword#1'; },
        r => { r.directs.push(structuredClone(r.directs[0])); }, r => { r.metrics[0].direct = 0; },
        r => { r.metrics[0].ability_launched = null; }, r => { delete r.metrics; }];
    for (const mutate of mutations) rejected(pick(), mutate);
    for (const key of ['directs', 'callbacks', 'attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'dropped', 'terminals']) {
        rejected(pick(), r => { delete r[key]; });
        if (!['directs', 'callbacks'].includes(key)) rejected(pick(), r => { r[key] = [{}]; });
    }
    for (const value of [null, '0', -1, NaN]) rejected(pick(), r => { r.metrics[1].qi_recovery = value; });
});

test('原昏迷准备与正式窗口分离，不能移除证据或将受伤准备计作招式伤害', () => {
    const c = pick('unconscious-target');
    for (const mutate of [r => { delete r.preparation; }, r => { r.preparation.before.object += '0'; },
        r => { r.preparation.before.living = 0; }, r => { r.preparation.before.qi = 0; },
        r => { r.preparation.after.qi = 1; }, r => { r.preparation.terminals = []; },
        r => { r.terminals = r.preparation.terminals; }, r => { r.metrics[1].qi_cost = 10000; }]) rejected(c, mutate);
});

test('冻结condition驱动统计：raw不带parameters，错误未知不伪装零费用，命中与回调分母独立', () => {
    const c = pick(), h = row(trace(c, { hit: true })), m = row(trace(c, { hit: false }));
    const report = taohuaDingEffects([h, m, { condition_id: c.id, outcome: 'error' }], c);
    assert.equal(Object.hasOwn(h.raw, 'parameters'), false);
    assert.equal(report.observed, 2); assert.equal(report.errors, 1); assert.equal(report.invalid_or_unknown, 1);
    assert.equal(report.hit.successes, 1); assert.equal(report.hit.trials, 2);
    assert.equal(report.input_damage_on_hit.n, 1); assert.equal(report.qi_loss.n, 2);
    assert.equal(report.ability_neili.mean, 175); assert.equal(report.jiali_neili.mean, 0);
    assert.equal(report.release_observed, 0); assert.equal(report.release_unobserved, 1); assert.equal(report.release_elapsed.mean, null);
    const empty = taohuaDingEffects([{ condition_id: c.id, outcome: 'error' }], c);
    assert.equal(empty.total_neili.mean, null); assert.equal(empty.hit.rate, null);
    const natural = pick('natural-release'), release = taohuaDingEffects([row(trace(natural))], natural);
    assert.equal(release.release_observed, 1); assert.equal(release.release_unobserved, 0); assert.equal(release.release_elapsed.n, 1);
    for (const condition of [pick('no-map'), pick('no-prepare')]) {
        const r = taohuaDingEffects([row(trace(condition))], condition);
        assert.equal(r.refused, 1); assert.equal(r.hit.trials, 0); assert.equal(r.total_neili.mean, null);
        assert.equal(r[condition.parameters.refusal_scope + '_refused'], 1);
    }
    assert.throws(() => taohuaDingEffects([row(trace(pick('no-map')))], c));
    assert.throws(() => taohuaDingEffects([{ ...h, outcome: 'refused' }], c));
    const damaged = structuredClone(h); delete damaged.raw.metrics;
    assert.throws(() => taohuaDingEffects([damaged], c));
});
