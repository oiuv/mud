import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaForceConditions, taohuaForceSourcePaths, taohuaForceAbsentPaths,
    validateTaohuaForceRecord, taohuaForceEffects } from './school_taohua_force_cases.mjs';
import { taohuaForceReport } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value)
    ? value : JSON.stringify(value)).digest('hex');
const bibo = 'bibo-shengong', luoying = 'luoying-xinfa', anying = 'anying-fuxiang';
const catalog = { skills: [bibo, luoying, anying, bibo + '/powerup', 'force/recover'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', bytes = read(path), parsed = scanSource(bytes.toString('utf8'));
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(bytes), entries: parsed.functions.filter(fn => fn.name === 'exert')
        .map(fn => ({ id: path + ':' + fn.line + ':exert', role: 'exert' })) };
}) };
const cases = taohuaForceConditions(catalog, read);
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

function powers(state) {
    return Object.fromEntries(['attack', 'dodge', 'parry'].map(kind => {
        const level = 100 + (state.temp.apply[kind === 'attack' ? 'attack' : 'defense'] ?? 0);
        return [kind, Math.trunc((Math.trunc(level ** 3 / 10) + 6950000) / 30) * 36];
    }));
}
const interfaceResults = { 'b1-qualified': 1, 'b2-music99': 0, 'b3-eunuch49': 1,
    'b4-eunuch50': 0, 'b5-force9': 0, 'b6-known-luoying': 1, 'b7-known-bibo': 1,
    'b8-known-huashan': 0, 'b9-total-capacity': 6400, 'b10-current-bibo': 6400, 'b11-current-luoying': 4900 };
const practiceCosts = { 'c1-level29': [10, 4], 'c2-level30': [25, 5], 'c3-level49': [25, 7],
    'c4-level50': [40, 7], 'c5-qi49': [0, 0], 'c6-partial': [80, 14] };
const qualificationRefusals = { 'b2-music99': '你没有精通吹箫技法，无法领会碧波神功的奥秘。\n',
    'b4-eunuch50': '你无根无性，阴阳不调，难以领会高深的碧波神功。\n',
    'b5-force9': '你的基本内功火候不够，不能学习特殊内功。\n', 'b8-known-huashan': '你发现自身所学的华山心法和碧波神功冲突不已，根本没办法并存。\n' };

function trace(condition, { gain, busy = 2 } = {}) {
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
        raw.interfaces.push({ ...p.interface, result: interfaceResults[p.variant],
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
            const [cost, progress] = practiceCosts[p.variant]; a.qi -= cost;
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
const row = (raw, index = 0) => {
    raw.index = index;
    return { condition_id: raw.condition_id, index, outcome: raw.outcome, reason: raw.reason, raw };
};

test('29条件合成原件均经专用报告且不回写；字段与同源效果一致', () => {
    for (const c of cases) {
        const rows = [row(trace(c)), row(trace(c), 1)];
        const original = JSON.stringify(rows);
        const report = taohuaForceReport(rows, c);
        assert.equal(JSON.stringify(rows), original, '报告消费不得回写原记录');
        assert.equal(report.collection_group, 'taohua-force');
        assert.equal(report.condition_id, c.id);
        assert.equal(report.variant, c.parameters.variant);
        assert.equal(report.planned, c.samples);
        assert.equal(report.recorded, 2);
        assert.equal(report.missing, c.samples - 2);
        assert.deepEqual(report.counts, { observed: c.parameters.expected === 'observed' ? 2 : 0,
            refused: c.parameters.expected === 'refused' ? 2 : 0, error: 0, not_applicable: 0 });
        assert.deepEqual(report.effects, taohuaForceEffects(rows, c));
        assert.equal(report.effects.samples, 2);
        assert.equal(report.effects.validated_samples, 2);
        assert.equal(report.effects.unknown_samples, 0);
        assert.equal(report.exceptional.length, 0);
        assert.equal(report.refusals.length, c.parameters.expected === 'refused' ? 2 : 0);
    }
});

test('错误与不适用保留原理由并计入未知，不进效果分母', () => {
    const c = pick('a1-powerup'), good = trace(c);
    const broken = trace(c); broken.outcome = 'error'; broken.reason = '驱动连接中断';
    const rows = [row(good), row(broken, 1)];
    const report = taohuaForceReport(rows, c);
    assert.equal(report.counts.error, 1);
    assert.equal(report.effects.unknown_samples, 1);
    assert.equal(report.effects.validated_samples, 1);
    assert.deepEqual(report.exceptional, [{ index: 1, outcome: 'error', reason: '驱动连接中断' }]);
});

test('条件与记录错配拒绝：冻结矩阵、索引、状态与来源不得漂移', () => {
    const c = pick('a1-powerup'), raw = trace(c);
    const wrong = structuredClone(c); wrong.parameters.skill = 'luoying-xinfa';
    assert.throws(() => taohuaForceReport([row(raw)], wrong));
    const wrongMethod = structuredClone(c); wrongMethod.method = 'perform';
    assert.throws(() => taohuaForceReport([row(raw)], wrongMethod));
    const wrongObservation = structuredClone(c); wrongObservation.parameters.observation = 'timed_effect';
    assert.throws(() => taohuaForceReport([row(raw)], wrongObservation));
    const wrongSources = structuredClone(c); wrongSources.parameters.qualification_sources = ['kungfu/skill/bibo-shengong.c'];
    assert.throws(() => taohuaForceReport([row(raw)], wrongSources));
    const missingEvidence = structuredClone(c); delete missingEvidence.parameters.source_evidence;
    assert.throws(() => taohuaForceReport([row(raw)], missingEvidence));
    const absentChanged = structuredClone(c); absentChanged.parameters.absent_sources = [];
    assert.throws(() => taohuaForceReport([row(raw)], absentChanged));
    const badIndex = row(trace(c), 5);
    assert.throws(() => taohuaForceReport([badIndex], c));
    const mismatch = row(trace(c)); mismatch.raw.outcome = 'refused';
    assert.throws(() => taohuaForceReport([mismatch], c));
    const duplicated = [row(trace(c)), row(trace(c))];
    assert.throws(() => taohuaForceReport(duplicated, c));
});

test('部分练习与到期回调保持原分母；报告不把毛费用合成净值', () => {
    const partial = pick('c6-partial'), rows = [row(trace(partial))];
    const report = taohuaForceReport(rows, partial);
    assert.equal(report.effects.partial_practice_samples, 1);
    assert.equal(report.effects.command_attempts, 1);
    assert.equal(report.effects.commands_accepted, 0);
    assert.equal(report.effects.progressed_samples, 1);
    const expiry = pick('a7-expiry'), expiryRows = [row(trace(expiry))];
    const expiryReport = taohuaForceReport(expiryRows, expiry);
    assert.equal(expiryReport.effects.callback_pairs, 1);
    assert.equal(expiryReport.effects.expiry_seconds.n, 1);
    assert.equal(expiryReport.effects.powers_delta.attack.n, 1);
    const repeat = pick('a6-repeat'), repeatRows = [row(trace(repeat))];
    const repeatReport = taohuaForceReport(repeatRows, repeat);
    assert.equal(repeatReport.effects.command_attempts, 2);
    assert.equal(repeatReport.effects.commands_accepted, 1);
});

test('报告入口由统一school-combat消费，专用模块冻结来源清单', () => {
    const source = read('tools/tests/martial_data/school_combat_report.mjs').toString();
    assert.match(source, /condition\.taohua_force = taohuaForceReport\(rows\.filter\(r => r\.condition_id === condition\.id\),/);
    assert.ok(source.includes("import { taohuaForceEffects, taohuaForceSourcePaths, taohuaForceAbsentPaths } from './school_taohua_force_cases.mjs';"));
    assert.equal(taohuaForceSourcePaths.length, 40);
    assert.equal(taohuaForceAbsentPaths.length, 8);
    for (const c of cases) {
        assert.equal(c.parameters.source_evidence['kungfu/skill/bibo-shengong.c'],
            hash(read('kungfu/skill/bibo-shengong.c')));
    }
});
