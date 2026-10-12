import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSeries, openSeries } from './ledger.mjs';
import { scanSource } from './inventory.mjs';
import { taohuaCombinationSkills, taohuaCombinationPairs, taohuaCombinationSourcePaths, taohuaCombinationFightValues,
    taohuaCombinationFixtureRequirements, taohuaCombinationConditions,
    validateTaohuaCombinationRecord, taohuaCombinationEffects } from './school_taohua_combination_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const skills = Object.keys(taohuaCombinationSkills).map(id => {
    const path = `kungfu/skill/${id}.c`, text = read(path), parsed = scanSource(text);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(text), entries: parsed.functions.filter(f => f.name === 'query_action')
        .map(f => ({ id: `${path}:${f.line}:${f.name}`, role: 'query_action' })) };
});
const catalog = { skills, source_fingerprint: hash(skills), dictionary_sha256: hash('offline-taohua-combination-no-dictionary') };
const cases = taohuaCombinationConditions(catalog, read);
const smoke = taohuaCombinationConditions(catalog, read, { smoke: true });
const copy = structuredClone;
const pair = cases.find(c => c.parameters.combination === 'pair-round');
const solo = cases.find(c => c.parameters.combination === 'solo-round');
const prepare = cases.find(c => c.method === 'prepare');

function snapshot(cfg, side) {
    const highest = Math.max(0, ...['unarmed', 'hand', 'finger', 'strike', 'claw', 'cuff'].map(k => cfg.skills[k] ?? 0));
    const inCultivation = key => key.includes('/') || key === 'character';
    return { ...Object.fromEntries(Object.entries(cfg.properties).filter(([key]) => !inCultivation(key))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([key]) => inCultivation(key))),
        object: `/tests/actor#${100 + side}`, id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null,
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: {}, preparation_order: [], learned: {},
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, n]) =>
            [key, Math.trunc(n / 2) + (cfg.skills[cfg.mappings[key]] ?? 0)])),
        effective_str: cfg.properties.str + Math.trunc(highest / 10), effective_dex: cfg.properties.dex + Math.trunc(cfg.skills.dodge / 10),
        effective_con: cfg.properties.con + Math.trunc(cfg.skills.force / 10),
        conditions: null, weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {},
        temp: { user_setup: 1, apply: { armor: 100 } } };
}

// Explicitly synthetic traces of source-reachable branches, never real samples or RNG forcing.
function trace(c, { two = false, reversed = false, results, zeroHit = false, wounded = 0 } = {}) {
    const p = c.parameters, before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const prepared = copy(before[0]);
    prepared.preparations = copy(p.prepare_commands[0].preparations);
    prepared.preparation_order = Object.keys(prepared.preparations);
    if (reversed) prepared.preparation_order.reverse();
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, outcome: 'observed', reason: '', elapsed: 0.01,
        before, immediate: [copy(prepared), copy(before[1])], metrics: [{}, {}], after: [],
        prepare_steps: [{ action: p.prepare_commands[0].action, accepted: 1, reason: '', before: copy(before[0]), after: prepared }],
        attacks: [], interfaces: [], launches: [], callbacks: [], terminals: [], dropped: [] };
    if (c.method === 'round') {
        const outcome = results ?? (two ? [0, -1] : [0]);
        raw.immediate[0].temp.guarding = 0;
        for (const [index, result] of outcome.entries()) {
            const usage = prepared.preparation_order[index], skill = p.actor.mappings[usage];
            const firstReachable = Math.max(0, taohuaCombinationFightValues[skill].length - 6);
            const fight = Object.fromEntries(['attack', 'dodge', 'parry'].map((key, i) => [key, taohuaCombinationFightValues[skill][firstReachable][i]]));
            const force = { 'xuanfeng-tui': 160, 'pikong-zhang': 100, 'lanhua-shou': 170, 'luoying-shenzhang': 210 }[skill];
            const incoming = Math.trunc((before[0].effective_str + Math.trunc(force * before[0].effective_str / 100)) / 3);
            // One possible original random(damage_bonus)=0, no int bonus or final dex dodge.
            const dealt = incoming + Math.trunc(incoming * (before[0].str * 2 + before[0].effective_str) / 300);
            const damage = result === 0 && !zeroHit ? dealt : 0;
            raw.attacks.push({ actor: 0, target: 1, type: 0, result, damage,
                action_flag: index === 0 ? null : 1, attack_usage: usage, attack_skill: skill });
            raw.immediate[0].temp.fight = fight;
            const key = result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry';
            raw.metrics[0][key] = (raw.metrics[0][key] ?? 0) + 1;
            if (damage) {
                raw.metrics[1].qi_cost = (raw.metrics[1].qi_cost ?? 0) + damage;
                raw.immediate[1].qi -= damage;
            }
        }
        if (outcome.length === 2) raw.immediate[0].temp.action_flag = 0;
        if (wounded) { raw.metrics[1].eff_qi_cost = wounded; raw.immediate[1].eff_qi -= wounded; }
    }
    raw.after = copy(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
function reject(c, change, options) {
    const raw = trace(c, options); change(raw); raw.after = copy(raw.immediate);
    assert.throws(() => validateTaohuaCombinationRecord(raw, c));
}

test('固定12条件/808正式/12烟雾，只有双向prepare和一次原fight，无额外轴', () => {
    assert.equal(cases.length, 12); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 808);
    assert.equal(smoke.length, 12); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 12);
    assert.equal(hash(cases), 'dfa064bd9999cdae5b510d91e946df7bd0631c56c5bbcda939cf41ba696b4724');
    assert.equal(hash(smoke), 'cd0d3755a3c77d18591a9098ae5812053f2445dd95e9fe61ee369780501613df');
    assert.deepEqual(smoke.map(c => ({ ...c, samples: 1 })), cases.map(c => ({ ...c, samples: 1 })));
    assert.equal(new Set(cases.map(c => c.id)).size, 12);
    assert.equal(cases.filter(c => c.method === 'prepare').length, 4);
    for (const variant of ['solo-round', 'pair-round']) assert.equal(cases.filter(c => c.parameters.combination === variant).length, 4);
    for (const c of cases) {
        const p = c.parameters;
        assert.match(c.id, /^[a-z][a-z0-9_-]*$/); assert.equal(p.level, 400);
        assert.equal(p.actor.skills.force, 600); assert.equal(p.actor.mappings.force, undefined);
        assert.equal(p.actor.skills['jingluo-xue'], undefined); assert.equal(p.actor.properties.jiali, 0);
        assert.deepEqual(p.actor.preparations, {}); assert.deepEqual(p.target.preparations, {});
        assert.equal(p.actor.temp, undefined); assert.equal(p.target.temp, undefined);
        assert.equal(p.observe_seconds, 0); assert.equal(p.expected, 'observed');
        assert.equal(p.prepare_commands.length, 1); assert.equal(p.prepare_commands[0].accepted, 1);
    }
    for (const members of taohuaCombinationPairs) {
        const matching = cases.filter(c => c.parameters.pair[0] === members[0]);
        for (const c of matching) assert.deepEqual(c.parameters.actor, matching[0].parameters.actor);
        assert.deepEqual(matching.filter(c => c.method === 'prepare').map(c => c.parameters.prepare_commands[0].action),
            [`prepare ${members.join(' ')}`, `prepare ${[...members].reverse().join(' ')}`]);
    }
});

test('原两向valid_combine、静态表、资源隔离与完整来源SHA均冻结', () => {
    for (const [a, b] of taohuaCombinationPairs) for (const [first, second] of [[a, b], [b, a]]) {
        const source = read(`kungfu/skill/${first}.c`);
        assert.match(source, new RegExp('valid_combine\\(string combo\\)\\s*\\{\\s*return combo == "' + second + '";'));
        assert.doesNotMatch(source, /this_player\(\)/);
        const staticPart = source.slice(0, source.indexOf('int valid_enable'));
        const triples = [...staticPart.matchAll(/\(\[\s*"action"([\s\S]*?)\]\)/g)].map(match =>
            ['attack', 'dodge', 'parry'].map(key => {
                const number = match[1].match(new RegExp('"' + key + '"\\s*:\\s*(-?\\d+)'));
                return number ? Number(number[1]) : null;
            }));
        assert.deepEqual(triples, taohuaCombinationFightValues[first]);
    }
    const expected = Object.fromEntries(taohuaCombinationSourcePaths.map(path => [path, hash(read(path))]));
    for (const c of cases) assert.deepEqual(c.parameters.source_evidence, expected);
    const wrongCatalog = copy(catalog); wrongCatalog.skills[0].sha256 = '0'.repeat(64);
    assert.throws(() => taohuaCombinationConditions(wrongCatalog, read));
    assert.throws(() => taohuaCombinationConditions(catalog, path => path.endsWith('/prepare.c') ? '' : read(path)));
    assert.ok(taohuaCombinationFixtureRequirements.some(s => s.includes('No new probe')));
    assert.ok(taohuaCombinationFixtureRequirements.some(s => s.includes('wudangCombinationEffects')));
});

test('真实create/open计划校验：有序条件、非法ID/入口/漂移/覆盖均检查，不启动驱动', () => {
    const inventory = { source_fingerprint: catalog.source_fingerprint, versions: { note: 'offline synthetic plan only' },
        files: taohuaCombinationSourcePaths.map(path => ({ path, sha256: hash(read(path)) })) };
    const execution = { kind: 'offline-taohua-combination-plan', source_files: cases[0].parameters.source_evidence };
    const directory = mkdtempSync(join(tmpdir(), 'mud-taohua-combination-plan-'));
    for (const [suffix, conditions] of [['formal', cases], ['smoke', smoke]]) {
        const destination = join(directory, suffix), manifest = createSeries(destination, { inventory, catalog, conditions, execution });
        assert.deepEqual(openSeries(destination, manifest.identity).identity.conditions, conditions);
        assert.throws(() => createSeries(destination, { inventory, catalog, conditions, execution }));
        const drift = copy(manifest.identity); drift.conditions[0].parameters.actor.properties.neili++;
        assert.throws(() => openSeries(destination, drift));
    }
    for (const bad of ['中文', 'leading.dot', 'UpperCase']) {
        const conditions = copy(cases); conditions[0].id = bad;
        assert.throws(() => createSeries(join(directory, 'bad-' + bad), { inventory, catalog, conditions, execution }));
    }
    const conditions = copy(cases); conditions[0].entry_id = 'kungfu/skill/missing.c';
    assert.throws(() => createSeries(join(directory, 'missing-entry'), { inventory, catalog, conditions, execution }));
});

test('12条合成原契约通过且不改raw，不依赖已经删除的raw.parameters', () => {
    for (const c of cases) {
        const raw = trace(c), saved = JSON.stringify(raw), facts = validateTaohuaCombinationRecord(raw, c);
        assert.equal(facts.commands, 1); assert.equal(facts.attacks, c.method === 'round' ? 1 : 0);
        assert.equal(Object.hasOwn(raw, 'parameters'), false); assert.equal(JSON.stringify(raw), saved);
    }
});

test('准备原正成本1/23/137/476保留，布尔视图不回写原件或放宽失败成本', () => {
    for (const c of cases) for (const cost of [1, 23, 137, 476]) {
        const raw = trace(c); raw.prepare_steps[0].accepted = cost;
        const before = JSON.stringify(raw);
        validateTaohuaCombinationRecord(raw, c);
        assert.equal(JSON.stringify(raw), before);
        assert.equal(raw.prepare_steps[0].accepted, cost);
        assert.equal(taohuaCombinationEffects([row(raw)], c).accepted, 1);
    }
    for (const cost of [0, -1, null, undefined, false, true, '1', 1.5, Infinity,
        Number.MAX_SAFE_INTEGER + 1])
        reject(pair, raw => { raw.prepare_steps[0].accepted = cost; });
    reject(pair, raw => { delete raw.prepare_steps[0].accepted; });
});

test('400级原NewRandom只选解锁末六项，表头不可达不得伪称正常最后fight', () => {
    for (const c of cases.filter(c => c.parameters.combination === 'solo-round')) {
        const skill = c.parameters.skill, values = taohuaCombinationFightValues[skill];
        const firstReachable = Math.max(0, values.length - 6);
        for (const [index, triple] of values.entries()) {
            // Final zero-damage hits are source-reachable for every row here; this
            // membership test must not keep the first row's force-derived positive damage.
            const raw = trace(c, { zeroHit: true });
            raw.immediate[0].temp.fight = Object.fromEntries(['attack', 'dodge', 'parry']
                .map((key, i) => [key, triple[i]]));
            raw.after = copy(raw.immediate);
            if (index < firstReachable) assert.throws(() => validateTaohuaCombinationRecord(raw, c));
            else validateTaohuaCombinationRecord(raw, c);
        }
    }
});

test('双方初始apply严格等于护甲100，完整状态链一致漂移或缺键也不得通过', () => {
    const changes = [
        state => { state.temp.apply.armor = 999; },
        state => { state.temp.apply.attack = 999; },
        state => { delete state.temp.apply; },
        state => { delete state.temp.apply.armor; },
    ];
    for (const side of [0, 1]) for (const change of changes) {
        const raw = trace(pair);
        const states = [raw.before[side], raw.immediate[side], raw.after[side],
            ...(side === 0 ? raw.prepare_steps.flatMap(step => [step.before, step.after]) : [])];
        for (const state of states) change(state);
        assert.throws(() => validateTaohuaCombinationRecord(raw, pair));
    }
    const raw = trace(pair), saved = JSON.stringify(raw);
    validateTaohuaCombinationRecord(raw, pair);
    assert.equal(JSON.stringify(raw), saved, '保留user_setup及全部原始temp，不回填或删除');
    for (const state of [...raw.before, ...raw.immediate, ...raw.after,
        ...raw.prepare_steps.flatMap(step => [step.before, step.after])]) {
        assert.equal(state.temp.user_setup, 1);
        assert.deepEqual(state.temp.apply, { armor: 100 });
    }
});

test('以真实keys定序：同一参数顺序下两种映射顺序都合法，随机单/双击均保留', () => {
    for (const c of cases.filter(c => c.parameters.combination === 'pair-round')) {
        for (const two of [false, true]) for (const reversed of [false, true]) {
            const raw = trace(c, { two, reversed });
            const facts = validateTaohuaCombinationRecord(raw, c);
            assert.equal(facts.attacks, two ? 2 : 1);
            assert.equal(raw.attacks[0].attack_usage, raw.prepare_steps[0].after.preparation_order[0]);
        }
        reject(c, raw => { raw.attacks[0].attack_usage = raw.prepare_steps[0].after.preparation_order[1]; });
        reject(c, raw => { raw.attacks[0].attack_skill = 'not-the-active-skill'; });
        reject(c, raw => { raw.immediate[0].preparation_order.reverse(); });
        reject(c, raw => { raw.prepare_steps[0].after.preparation_order[1] = raw.prepare_steps[0].after.preparation_order[0]; });
    }
});

test('当前膂力必进攻、无目标守势；不伪造空轮/反击/单备双击/三击', () => {
    reject(pair, raw => { raw.attacks = []; raw.metrics = [{}, {}]; raw.immediate[0].temp = { apply: { armor: 100 }, guarding: 1 };
        raw.immediate[1] = copy(raw.before[1]); });
    reject(pair, raw => { raw.attacks[0].actor = 1; raw.attacks[0].target = 0; raw.attacks[0].type = 1; });
    for (const type of [1, 2, 3, null]) reject(pair, raw => { raw.attacks[0].type = type; });
    reject(pair, raw => { raw.before[1].temp.guarding = 1; });
    reject(solo, raw => { raw.attacks.push(copy(raw.attacks[0])); });
    reject(pair, raw => { raw.attacks.push(copy(raw.attacks[0])); }, { two: true });
    reject(prepare, raw => { raw.attacks.push(copy(trace(pair).attacks[0])); });
});

test('准备命令与状态链严格对照，不能直接注入映射、补技能或更换USER', () => {
    for (const change of [
        r => { r.prepare_steps[0].action = 'prepare unarmed strike'; },
        r => { r.prepare_steps[0].accepted = 0; },
        r => { r.prepare_steps[0].reason = 'fictional refusal'; },
        r => { r.prepare_steps[0].before.neili++; },
        r => { r.prepare_steps[0].after.skills.force++; },
        r => { r.prepare_steps[0].after.temp.apply.attack = 999; },
        r => { r.prepare_steps[0].after.object = '/tests/actor#999'; },
        r => { r.prepare_steps[0].after.preparations.unarmed = 'not-a-skill'; },
        r => { r.prepare_steps[0].after.preparation_order = []; },
        r => { r.before[0].preparations = copy(r.prepare_steps[0].after.preparations); },
    ]) reject(pair, change);
});

test('命中/闪躲/招架与实际气血/创伤独立对账，最终零伤命中不冒充闪躲', () => {
    for (const result of [0, -1, -2]) {
        const raw = trace(pair, { results: [result] }); validateTaohuaCombinationRecord(raw, pair);
    }
    validateTaohuaCombinationRecord(trace(pair, { zeroHit: true }), pair);
    validateTaohuaCombinationRecord(trace(pair, { two: true, wounded: 20 }), pair);
    for (const change of [
        r => { r.metrics[0].hit++; }, r => { r.metrics[0].dodge = 1; }, r => { r.metrics[1].qi_cost++; },
        r => { delete r.metrics[1].qi_cost; }, r => { r.attacks[0].damage++; }, r => { r.attacks[0].result = -1; },
        r => { r.metrics[1].eff_qi_cost = 161; r.immediate[1].eff_qi -= 161; },
        r => { r.metrics[1].qi_recovery = 1; r.immediate[1].qi++; },
        r => { r.metrics[0].neili_cost = 300; r.immediate[0].neili -= 300; },
        r => { r.metrics[0].neili_cost = null; }, r => { r.metrics[1].qi_cost = -1; },
        r => { r.metrics[1].jing_cost = 1; r.immediate[1].jing--; },
    ]) reject(pair, change);
});

test('明确缺键不是0/null；USER身份、有效修为、装备、busy与其他temp差异都拒绝', () => {
    for (const side of [0, 1]) for (const key of ['busy', 'object', 'playerp', 'effective_str', 'effective_dex',
        'preparation_order', 'conditions', 'weapon_details', 'secondary_weapon'])
        reject(pair, r => { delete r.before[side][key]; });
    for (const change of [
        r => { r.before[0].wizardp = 1; }, r => { r.before[1].object = r.before[0].object; },
        r => { r.before[0].skills['jingluo-xue'] = 200; }, r => { r.before[0].effective_skills.force = 600; },
        r => { r.before[0].effective_str++; }, r => { r.before[0].mappings.force = 'bibo-shengong'; },
        r => { r.before[0].temp.action_flag = 0; }, r => { r.immediate[0].weapon = 'sword'; },
        r => { r.immediate[0].busy = 1; }, r => { r.immediate[1].living = 0; },
        r => { r.immediate[0].temp.apply.attack = 99; }, r => { r.immediate[1].temp.pending = { foo: 1 }; },
        r => { r.immediate[0].learned['xuanfeng-tui'] = 1; }, r => { r.immediate[0].combat_exp++; },
        r => { r.immediate[0].temp.action_flag = 1; }, r => { delete r.attacks[0].action_flag; },
        r => { r.immediate[0].temp.fight.attack = 999; },
        r => { r.attacks[0].action_flag = false; }, r => { r.metrics[0].heartbeats = 1; },
        r => { r.callbacks = [{ phase: 'after' }]; }, r => { r.terminals = [{ event: 'unconscious' }]; },
    ]) reject(pair, change);
    reject(pair, r => { r.immediate[0].temp.action_flag = 1; }, { two: true });
});

test('复用既有报告但分母分开；冻结条件归属、未知样本与实际keys顺序不丢', () => {
    const a = row(trace(pair)), b = row(trace(pair, { two: true, reversed: true }));
    const stats = taohuaCombinationEffects([a, b, { condition_id: pair.id, outcome: 'error' }], pair);
    assert.equal(stats.samples, 2); assert.equal(stats.unknown_samples, 1);
    assert.equal(stats.commands, 2); assert.equal(stats.accepted, 2); assert.equal(stats.rounds, 2);
    assert.equal(stats.primary_attacks, 3); assert.deepEqual(stats.double_rounds.successes, 1);
    assert.equal(stats.double_rounds.trials, 2); assert.equal(stats.double_given_attack.trials, 2);
    assert.equal(stats.actual_preparation_orders.length, 2); assert.equal(stats.target_qi_loss.n, 2);
    const onlyPrepare = taohuaCombinationEffects([row(trace(prepare))], prepare);
    assert.equal(onlyPrepare.prepare_only_samples, 1); assert.equal(onlyPrepare.rounds, 0);
    assert.equal(onlyPrepare.double_rounds.rate, null);
    const absent = taohuaCombinationEffects([{ condition_id: pair.id, outcome: 'error' }], pair);
    assert.equal(absent.samples, 0); assert.equal(absent.target_qi_loss.mean, null);
    assert.throws(() => taohuaCombinationEffects([a], undefined));
    assert.throws(() => taohuaCombinationEffects([row(trace(solo))], pair));
    const wrong = copy(a); wrong.condition_id = 'foreign-condition';
    assert.throws(() => taohuaCombinationEffects([wrong], pair));
    for (const outcome of ['observed', 'error', 'not_applicable']) {
        const valid = outcome === 'observed' ? a : { condition_id: pair.id, outcome,
            raw: { condition_id: pair.id, outcome } };
        for (const change of [r => { r.condition_id = 'foreign-condition'; }, r => { delete r.condition_id; },
            r => { r.raw.condition_id = 'foreign-condition'; }, r => { delete r.raw.condition_id; },
            r => { r.outcome = outcome === 'error' ? 'not_applicable' : 'error'; }]) {
            const broken = copy(valid); change(broken);
            assert.throws(() => taohuaCombinationEffects([broken], pair));
        }
    }
});
