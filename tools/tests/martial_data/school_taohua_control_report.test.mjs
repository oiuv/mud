import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaControlConditions, taohuaControlEffects } from './school_taohua_control_cases.mjs';
import { taohuaControlReport, schoolCombatMarkdown } from './school_combat_report.mjs';
import { summarizeSamples } from './statistics.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const catalog = { skills: ['lanhua-shou', 'lanhua-shou/fu', 'luoying-shenjian', 'luoying-shenjian/sui'].map(id => {
    const path = `kungfu/skill/${id}.c`, source = read(path), parsed = scanSource(source);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: parsed.functions.filter(fn => fn.name === 'perform')
        .map(fn => ({ id: `${path}:${fn.line}:perform`, role: 'perform' })) };
}) };
const cases = taohuaControlConditions(catalog, read);
const smoke = taohuaControlConditions(catalog, read, { smoke: true });
const pick = (ability = 'fu', variant = 'baseline', level = 200) => {
    const c = cases.find(c => c.parameters.ability === ability && c.parameters.variant === variant && c.parameters.level === level);
    assert.ok(c, `${ability}/${variant}/${level}`); return c;
};

function snapshot(config, side) {
    const apply = { armor: 100, ...(config.equipment ? { damage: 50, dodge: -1 } : {}) };
    const qualified = key => key.includes('/') || key === 'character';
    const unarmed = Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => config.skills[k] ?? 0));
    return { ...Object.fromEntries(Object.entries(config.properties).filter(([key]) => !qualified(key))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([key]) => qualified(key))),
        object: `/tests/actor#${100 + side}`, id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, living: 1, ghost: 0, fighting_opponent: 1, busy: config.busy ?? null,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations), learned: {}, temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, level]) =>
            [key, Math.trunc(level / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_str: config.properties.str + Math.trunc(unarmed / 10),
        effective_con: config.properties.con + Math.trunc(config.skills.force / 10),
        weapon: config.equipment ? 'sword' : 'none', weapon_damage: config.equipment ? 50 : 0,
        weapon_flag: config.equipment ? 4 : 0, weapon_details: config.equipment ? {
            object: `/tests/sword#${200 + side}`, program: '/tests/sword', skill_type: 'sword',
            weight: 3000, damage: 50, flag: 4, consistence: 100, material: null,
            rigidity: null, no_wield: null,
        } : {}, secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

// Explicit synthetic protocol examples only: no driver samples or RNG estimates.
function trace(condition, { index = 0, hit, cost = 23, progress = 1 } = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const raw = { kind: 'sample', condition_id: condition.id, index, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        command_accepted: accepted ? cost : 0, launches: [], refusals: [], attacks: [], passives: [],
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
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals = [{ actor: before[0].object, reason: raw.reason }];
        raw.immediate[0].temp.notify_fail = p.refusal;
    }
    raw.after = structuredClone(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, index: raw.index,
    outcome: raw.outcome, reason: raw.reason, raw });
const error = (c, index = 0) => row({ kind: 'sample', condition_id: c.id, index,
    method: 'perform', outcome: 'error', reason: '原错误 | <详情>\n第二行' });
function report(c, rows) {
    const s = taohuaControlReport(rows, c);
    const result = summarizeSamples({ fingerprint: 'synthetic', versions: {},
        identity: { conditions: [c], execution: { smoke: false } } }, rows);
    result.evidence_sha256 = 'synthetic-only';
    result.totals = { conditions: 1, samples: rows.length, observed: s.counts.observed,
        refused: s.counts.refused, errors: s.counts.error };
    const summary = result.conditions[0];
    assert.deepEqual(summary.counts, s.counts); assert.equal(summary.planned, s.planned);
    assert.equal(summary.recorded, s.recorded); assert.equal(summary.missing, s.missing);
    summary.effects = null; summary.taohua_control = s;
    return result;
}

test('固定27/1034/54和28来源不变，全部原条件经专用报告合成消费', () => {
    assert.equal(cases.length, 27); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1034);
    assert.equal(smoke.length, 27); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 54);
    assert.equal(hash(cases), '4ca1afa364c2b385615aaaeae13016b5da2c945efafc59972f6f8b7cd8896b6f');
    assert.equal(hash(smoke), '1d6d039c4af6eee41187809511f35d21822395d8ef0e896c9db365a514cea81b');
    for (const c of cases) {
        assert.equal(Object.keys(c.parameters.source_evidence).length, 28);
        const rows = [row(trace(c))], before = JSON.stringify(rows), s = taohuaControlReport(rows, c);
        assert.equal(s.recorded, 1); assert.equal(s.counts[c.parameters.expected], 1);
        assert.deepEqual(s.effects, taohuaControlEffects(rows, c));
        assert.equal(Object.hasOwn(rows[0].raw, 'parameters'), false);
        assert.equal(JSON.stringify(rows), before);
        assert.doesNotThrow(() => schoolCombatMarkdown(report(c, rows)));
    }
});

test('consumer传原冻结condition，拒绝summary planned和技能/入口/窗口错配', () => {
    const source = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(source, /condition\.taohua_control = taohuaControlReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\)/);
    assert.match(source, /condition\.effects = condition\.npc_bout_effects \|\| \['taohua-zhuan', 'taohua-control'\]\.includes\(condition\.parameters\.collection_group\) \? null/);
    for (const mutate of [c => { c.planned = c.samples; delete c.samples; },
        c => c.samples = 0, c => c.samples = 1.5, c => c.method = 'attack',
        c => c.parameters.collection_group = 'taohua-direct', c => c.parameters.skill = 'tanzhi-shentong',
        c => c.parameters.ability = 'ding', c => c.parameters.usage = 'sword',
        c => c.parameters.action = 'perform hand.fu missing', c => c.parameters.observe_seconds = 1,
        c => c.parameters.observation = 'natural_bout', c => c.parameters.expected = 'not_applicable',
        c => c.parameters.not_applicable = 'skip', c => c.parameters.named_participants = false,
        c => c.parameters.fighting = false, c => c.parameters.target_state = 'unconscious']) {
        const c = structuredClone(pick()); mutate(c);
        assert.throws(() => taohuaControlReport([], c));
    }
});

test('命中/失手/错误分别分母，新增忙量仅命中且费用不等于command成本', () => {
    for (const ability of ['fu', 'sui']) {
        const c = pick(ability), rows = [row(trace(c)), row(trace(c, { index: 1, hit: false })), error(c, 2)];
        const s = taohuaControlReport(rows, c), e = s.effects;
        assert.deepEqual(s.counts, { observed: 2, refused: 0, error: 1, not_applicable: 0 });
        assert.equal(e.known_command_samples, 2); assert.equal(e.unknown_effect_samples, 1);
        assert.equal(e.control_given_accepted.successes, 1); assert.equal(e.control_given_accepted.trials, 2);
        assert.equal(e.control_per_known_command.trials, 2); assert.equal(e.accepted_misses, 1);
        assert.equal(e.acquired_busy.n, 1); assert.equal(e.acquired_busy.mean, ability === 'fu' ? 12 : 10);
        assert.equal(e.target_busy_initial.mean, 0); assert.equal(e.target_busy_final.mean, ability === 'fu' ? 6 : 5);
        assert.equal(e.actor_neili_cost.n, 2); assert.equal(e.actor_neili_cost.mean, ability === 'fu' ? 50 : 130);
        assert.equal(s.commands.accepted_execution_cost.mean, 23);
        assert.equal(e.learned_progress.successes, 2); assert.equal(e.learned_progress.trials, 2);
        const md = schoolCombatMarkdown(report(c, rows));
        assert.match(md, /1\/2；50\.00%/); assert.match(md, /原错误 \\\| &lt;详情&gt;<br>第二行/);
    }
});

test('原目标忙乱50拒绝原样保留，不能冒充新增控制或正常零费用', () => {
    for (const ability of ['fu', 'sui']) {
        const c = pick(ability, 'target-busy50'), rows = [row(trace(c))], s = taohuaControlReport(rows, c);
        const e = s.effects;
        assert.equal(e.refused_samples, 1); assert.equal(e.accepted_samples, 0);
        assert.equal(e.target_busy_initial.mean, 50); assert.equal(e.target_busy_final.mean, 50);
        assert.equal(e.acquired_busy.n, 0); assert.equal(e.acquired_busy.mean, null);
        assert.equal(e.control_given_accepted.rate, null); assert.equal(e.control_per_known_command.rate, 0);
        assert.equal(s.commands.refused_execution_cost.mean, 0); assert.equal(e.actor_neili_cost.mean, null);
        assert.equal(s.refusals[0].reason, rows[0].reason);
        const md = schoolCombatMarkdown(report(c, rows));
        assert.match(md, /已有忙乱 50 导致的拒绝不是控制成功/);
        assert.match(md, /50\.00 \[50\.00, 50\.00\]（n=1/);
    }
});

test('随波失手100留-80、180留0，原毛扣和负值比例不归零修正', () => {
    for (const neili of [100, 180]) {
        const c = pick('sui', `miss-neili${neili}`), s = taohuaControlReport([row(trace(c))], c), e = s.effects;
        assert.equal(e.actor_neili_cost.mean, 180); assert.equal(e.actor_neili_remaining.mean, neili - 180);
        assert.equal(e.control_given_accepted.rate, 0); assert.equal(e.acquired_busy.mean, null);
        assert.equal(e.negative_neili.successes, Number(neili === 100)); assert.equal(e.negative_neili.trials, 1);
        assert.match(schoolCombatMarkdown(report(c, [row(trace(c))])), /实际剩余 −80/);
    }
    const c = pick('fu', 'guaranteed-miss'), e = taohuaControlReport([row(trace(c))], c).effects;
    assert.equal(e.actor_neili_cost.mean, 0); assert.equal(e.actor_neili_remaining.mean, 800);
});

test('正执行成本1/23/476计三次受理，非法/缺成本不能被分布滤成未知', () => {
    const c = pick(), rows = [1, 23, 476].map((cost, index) => row(trace(c, { cost, index })));
    const s = taohuaControlReport(rows, c);
    assert.equal(s.effects.accepted_samples, 3); assert.equal(s.effects.control_given_accepted.trials, 3);
    assert.equal(s.commands.accepted_execution_cost.mean, 500 / 3); assert.equal(s.effects.actor_neili_cost.mean, 100);
    for (const cost of [null, undefined, false, true, '23', -1, 0, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        const raw = trace(c); raw.command_accepted = cost;
        assert.throws(() => taohuaControlReport([row(raw)], c));
    }
    const absent = trace(c); delete absent.command_accepted;
    assert.throws(() => taohuaControlReport([row(absent)], c));
    const rejected = pick('fu', 'neili99'), raw = trace(rejected); raw.command_accepted = 23;
    assert.throws(() => taohuaControlReport([row(raw)], rejected));
});

test('弱熟练与控制成败分开，仅用冻结条件且不回写raw.parameters', () => {
    const c = pick('sui'), a = trace(c, { hit: true, progress: 0 }), b = trace(c, { index: 1, hit: false });
    const rows = [row(a), row(b)], before = JSON.stringify(rows), s = taohuaControlReport(rows, c);
    assert.equal(s.effects.control_given_accepted.successes, 1); assert.equal(s.effects.learned_progress.successes, 1);
    assert.equal(s.effects.learned_delta.mean, 0.5); assert.equal(JSON.stringify(rows), before);
    a.parameters = { skill: 'wrong', ability: 'fu', target: { busy: 50 } };
    assert.deepEqual(taohuaControlReport(rows, c), s);
    delete a.parameters; assert.equal(JSON.stringify(rows), before);
});

test('缺样/错误保留原理由与未知空分母，不伪造零控制或零费用', () => {
    const c = pick();
    for (const rows of [[], [error(c)]]) {
        const s = taohuaControlReport(rows, c), e = s.effects;
        assert.equal(s.missing, c.samples - rows.length); assert.equal(e.unknown_effect_samples, rows.length);
        for (const key of ['control_given_accepted', 'control_per_known_command', 'negative_neili', 'learned_progress'])
            assert.equal(e[key].rate, null);
        for (const key of ['target_busy_initial', 'target_busy_final', 'acquired_busy', 'actor_neili_cost', 'actor_neili_remaining'])
            assert.equal(e[key].mean, null);
        assert.equal(s.commands.accepted_execution_cost.mean, null);
        const md = schoolCombatMarkdown(report(c, rows));
        assert.match(md, /未知（分母0）/); assert.doesNotMatch(md, /0\/0；0\.00%/);
    }
});

test('所有结果先核outer/raw身份索引结果理由，错误和拒绝不豁免', () => {
    const refused = pick('sui', 'target-busy50');
    for (const [c, original] of [[pick(), row(trace(pick()))], [pick(), error(pick())], [refused, row(trace(refused))]]) {
        for (const mutate of [r => delete r.condition_id, r => r.condition_id = 'foreign',
            r => r.condition_id = null, r => delete r.raw, r => r.raw.condition_id = 'foreign',
            r => r.raw.kind = 'other', r => r.raw.method = 'attack', r => delete r.index,
            r => r.index = -1, r => r.index = c.samples, r => r.index = 0.5, r => r.raw.index = 1,
            r => r.outcome = 'not_applicable', r => r.raw.outcome = 'foreign',
            r => delete r.reason, r => r.reason = null, r => r.raw.reason = 'other']) {
            const bad = structuredClone(original); mutate(bad);
            assert.throws(() => taohuaControlReport([bad], c));
        }
        assert.throws(() => taohuaControlReport([original, structuredClone(original)], c));
    }
    const blank = error(pick()); blank.reason = ''; blank.raw.reason = '';
    assert.throws(() => taohuaControlReport([blank], pick()));
});

test('缺资源/额外恢复/攻击回调和装备变化不经报告变成正常数据', () => {
    const c = pick('sui', 'miss-neili100');
    for (const mutate of [r => delete r.metrics, r => r.metrics[0] = null,
        r => r.metrics[0].neili_cost = null, r => delete r.metrics[0].neili_cost,
        r => r.metrics[0].neili_cost++, r => r.metrics[0].neili_recovery = 1,
        r => r.immediate[0].neili = 0, r => r.immediate[0].neili = null,
        r => delete r.immediate[1].busy, r => r.metrics[0].hit = 1,
        r => r.metrics[1].dodge = 1, r => r.metrics[0].parry = 1,
        r => r.metrics[0].direct = 1, r => r.metrics[0].heartbeats = 1,
        r => r.callbacks.push({ function: 'not_real' }), r => r.directs = [{ damage: 0 }],
        r => r.immediate[0].weapon_details.consistence--, r => r.immediate[1].object = '/tests/actor#999']) {
        const raw = trace(c); mutate(raw); raw.after = structuredClone(raw.immediate);
        const before = JSON.stringify(raw);
        assert.throws(() => taohuaControlReport([row(raw)], c)); assert.equal(JSON.stringify(raw), before);
    }
});

test('Markdown两专表不借generic sides/伤害，并明确即时窗口和未知', () => {
    for (const c of [pick(), pick('sui', 'miss-neili100'), pick('fu', 'target-busy50')]) {
        const result = report(c, [row(trace(c))]); result.conditions[0].sides = null;
        const md = schoolCombatMarkdown(result), split = md.indexOf('## 桃花岛·兰花拂穴／随波逐流');
        assert.ok(split > 0); assert.equal(md.slice(0, split).includes('| ' + c.id + ' |'), false);
        assert.equal(md.split('| ' + c.id + ' |').length - 1, 2);
        assert.match(md, /受理不等于控制命中/); assert.match(md, /原命令正整数是执行成本，不是内力费用/);
        assert.match(md, /目标初忙 50 原样保留/); assert.match(md, /不是实测解除秒数/);
        assert.match(md, /没有直伤、自然心跳、回调或自然解忙观察/); assert.match(md, /不作强弱排名/);
    }
});
