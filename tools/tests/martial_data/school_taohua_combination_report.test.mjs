// Explicitly synthetic report-consumer fixtures; no driver, sample writes or RNG forcing.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { taohuaCombinationConditions, taohuaCombinationSkills, taohuaCombinationSourcePaths,
    taohuaCombinationFightValues, taohuaCombinationEffects } from './school_taohua_combination_cases.mjs';
import { taohuaCombinationReport, schoolCombatMarkdown, readSchoolCombat } from './school_combat_report.mjs';
import { summarizeSamples } from './statistics.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const catalog = { skills: Object.keys(taohuaCombinationSkills).map(id => {
    const path = `kungfu/skill/${id}.c`;
    return { id, path, sha256: hash(read(path)) };
}) };
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
        effective_str: cfg.properties.str + Math.trunc(highest / 10),
        effective_dex: cfg.properties.dex + Math.trunc(cfg.skills.dodge / 10),
        effective_con: cfg.properties.con + Math.trunc(cfg.skills.force / 10),
        conditions: null, weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {},
        temp: { user_setup: 1, apply: { armor: 100 } } };
}

// Zero-damage hits are source-reachable for every final row used here. Positive
// damage below is only a labelled synthetic branch, not sampled game evidence.
function trace(c, { index = 0, cost = 137, results = [0], reversed = false,
    zeroHit = true, wounded = 0 } = {}) {
    const p = c.parameters, before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const prepared = copy(before[0]);
    prepared.preparations = copy(p.prepare_commands[0].preparations);
    prepared.preparation_order = Object.keys(prepared.preparations);
    if (reversed) prepared.preparation_order.reverse();
    const raw = { kind: 'sample', condition_id: c.id, index, method: c.method,
        outcome: 'observed', reason: '', elapsed: 0.01,
        before, immediate: [copy(prepared), copy(before[1])], metrics: [{}, {}],
        prepare_steps: [{ action: p.prepare_commands[0].action, accepted: cost,
            reason: '', before: copy(before[0]), after: prepared }],
        attacks: [], interfaces: [], launches: [], callbacks: [], terminals: [], dropped: [] };
    if (c.method === 'round') {
        raw.immediate[0].temp.guarding = 0;
        for (const [i, result] of results.entries()) {
            const usage = prepared.preparation_order[i], skill = p.actor.mappings[usage];
            const triples = taohuaCombinationFightValues[skill], firstReachable = Math.max(0, triples.length - 6);
            raw.immediate[0].temp.fight = Object.fromEntries(['attack', 'dodge', 'parry']
                .map((key, n) => [key, triples[firstReachable][n]]));
            const force = { 'xuanfeng-tui': 160, 'pikong-zhang': 100, 'lanhua-shou': 170, 'luoying-shenzhang': 210 }[skill];
            const incoming = Math.trunc((before[0].effective_str + Math.trunc(force * before[0].effective_str / 100)) / 3);
            const possible = incoming + Math.trunc(incoming * (before[0].str * 2 + before[0].effective_str) / 300);
            const damage = result === 0 && !zeroHit ? possible : 0;
            raw.attacks.push({ actor: 0, target: 1, type: 0, result, damage,
                action_flag: i === 0 ? null : 1, attack_usage: usage, attack_skill: skill });
            const metric = result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry';
            raw.metrics[0][metric] = (raw.metrics[0][metric] ?? 0) + 1;
            if (damage) {
                raw.metrics[1].qi_cost = (raw.metrics[1].qi_cost ?? 0) + damage;
                raw.immediate[1].qi -= damage;
            }
        }
        if (results.length === 2) raw.immediate[0].temp.action_flag = 0;
        if (wounded) { raw.metrics[1].eff_qi_cost = wounded; raw.immediate[1].eff_qi -= wounded; }
    }
    raw.after = copy(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, index: raw.index, outcome: raw.outcome, reason: raw.reason, raw });
function exception(c, index = 0, outcome = 'error', reason = '原记录 | <详情>\n下一行') {
    return row({ kind: 'sample', condition_id: c.id, index, method: c.method, outcome, reason });
}
function report(c, rows) {
    const result = summarizeSamples({ fingerprint: 'synthetic-only', versions: {},
        identity: { conditions: [c], execution: { smoke: false } } }, rows);
    const summary = result.conditions[0];
    summary.effects = null; summary.taohua_combination = taohuaCombinationReport(rows, c);
    result.totals = { conditions: 1, samples: rows.length, observed: summary.counts.observed,
        refused: summary.counts.refused, errors: summary.counts.error };
    result.evidence_sha256 = 'synthetic-only'; return result;
}

test('全部12冻结条件可由专用报告消费，保留原808/12计划及26来源', () => {
    assert.equal(cases.length, 12); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 808);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 12);
    assert.equal(hash(cases), 'dfa064bd9999cdae5b510d91e946df7bd0631c56c5bbcda939cf41ba696b4724');
    assert.equal(hash(smoke), 'cd0d3755a3c77d18591a9098ae5812053f2445dd95e9fe61ee369780501613df');
    for (const c of cases) {
        const rows = [row(trace(c))], before = JSON.stringify({ c, rows });
        const summary = taohuaCombinationReport(rows, c);
        assert.equal(summary.planned, c.samples); assert.equal(summary.recorded, 1);
        assert.equal(summary.counts.observed, 1); assert.equal(summary.missing, c.samples - 1);
        assert.equal(summary.commands.steps, 1); assert.equal(summary.commands.accepted, 1);
        assert.equal(summary.commands.execution_cost.mean, 137);
        assert.equal(summary.effects.prepare_only_samples, Number(c.method === 'prepare'));
        assert.equal(summary.effects.rounds, Number(c.method === 'round'));
        assert.deepEqual(summary.effects, taohuaCombinationEffects(rows, c));
        assert.equal(summary.attacks.count, c.method === 'round' ? 1 : 0);
        assert.equal(Object.hasOwn(rows[0].raw, 'parameters'), false);
        assert.equal(JSON.stringify({ c, rows }), before);
        assert.equal(Object.keys(c.parameters.source_evidence).length, 26);
    }
});

test('原准备命令正成本与受理次数、出手数和实际内力账严格分列', () => {
    const rows = [row(trace(pair, { cost: 23 })), row(trace(pair, { index: 1, cost: 137, results: [0, -1] }))];
    const before = JSON.stringify(rows), s = taohuaCombinationReport(rows, pair);
    assert.equal(s.commands.steps, 2); assert.equal(s.commands.accepted, 2); assert.equal(s.commands.refused, 0);
    assert.equal(s.commands.execution_cost.mean, 80); assert.equal(s.commands.execution_cost.n, 2);
    assert.equal(s.actor_neili_cost.n, 2); assert.equal(s.actor_neili_cost.mean, 0);
    assert.equal(s.effects.rounds, 2); assert.equal(s.attacks.count, 3);
    assert.equal(JSON.stringify(rows), before);
    for (const cost of [0, -1, null, false, true, '137', 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1])
        assert.throws(() => taohuaCombinationReport([row(trace(pair, { cost }))], pair));
    const missing = trace(pair); delete missing.prepare_steps[0].accepted;
    assert.throws(() => taohuaCombinationReport([row(missing)], pair));
});

test('单备、双备、仅准备分母和keys实际顺序不混，零伤命中仍命中', () => {
    const rows = [row(trace(pair, { results: [0] })),
        row(trace(pair, { index: 1, results: [-1, -2], reversed: true })),
        row(trace(pair, { index: 2, results: [0, 0] }))];
    const s = taohuaCombinationReport(rows, pair);
    assert.equal(s.effects.rounds, 3); assert.equal(s.effects.attacking_rounds, 3);
    assert.equal(s.effects.guarding_rounds, 0); assert.equal(s.attacks.count, 5);
    assert.equal(s.effects.double_rounds.successes, 2); assert.equal(s.effects.double_rounds.trials, 3);
    assert.equal(s.effects.double_given_attack.trials, 3);
    assert.equal(s.attacks.hit, 3); assert.equal(s.attacks.dodge, 1); assert.equal(s.attacks.parry, 1);
    assert.equal(s.attacks.zero_damage_hits, 3); assert.equal(s.attacks.hit_rate.rate, 3 / 5);
    assert.equal(Object.hasOwn(s.attacks.hit_rate, 'low95'), false, '相关出招不报独立试验区间');
    assert.equal(s.effects.actual_preparation_orders.length, 2);
    assert.equal(Object.values(s.effects.by_usage).reduce((n, usage) => n + usage.all, 0), 5);
    const single = taohuaCombinationReport([row(trace(solo))], solo);
    assert.equal(single.effects.double_rounds.trials, 1); assert.equal(single.effects.double_rounds.successes, 0);
    const only = taohuaCombinationReport([row(trace(prepare))], prepare);
    assert.equal(only.effects.prepare_only_samples, 1); assert.equal(only.effects.rounds, 0);
    assert.equal(only.effects.double_rounds.rate, null); assert.equal(only.attacks.hit_rate.rate, null);
    assert.equal(only.effects.target_qi_loss.n, 1); assert.equal(only.effects.target_qi_loss.mean, 0);
});

test('真实气血支出与创伤分别对账，不由命中数量推伤害或相加', () => {
    const raw = trace(pair, { zeroHit: false, wounded: 20 });
    const s = taohuaCombinationReport([row(raw)], pair);
    assert.ok(raw.attacks[0].damage > 20);
    assert.equal(s.effects.target_qi_loss.mean, raw.attacks[0].damage);
    assert.equal(s.effects.target_wound.mean, 20); assert.equal(s.attacks.zero_damage_hits, 0);
    for (const change of [r => r.metrics[1].qi_cost++, r => r.metrics[1].eff_qi_cost++,
        r => r.metrics[0].neili_cost = 1, r => r.metrics[0].neili_cost = null,
        r => r.metrics[0].hit++, r => r.metrics[0].heartbeats = 1,
        r => r.attacks[0].result = -1, r => r.attacks[0].actor = 1]) {
        const bad = copy(raw); change(bad);
        assert.throws(() => taohuaCombinationReport([row(bad)], pair));
    }
});

test('error/未适用/缺样本保留未知，不能把未观察命令、攻击或资源补零', () => {
    const rows = [row(trace(pair)), exception(pair, 1), exception(pair, 2, 'not_applicable')];
    const s = taohuaCombinationReport(rows, pair);
    assert.deepEqual(s.counts, { observed: 1, refused: 0, error: 1, not_applicable: 1 });
    assert.equal(s.recorded, 3); assert.equal(s.missing, 97);
    assert.equal(s.effects.samples, 1); assert.equal(s.effects.unknown_samples, 2);
    assert.equal(s.commands.execution_cost.n, 1); assert.equal(s.attacks.hit_rate.trials, 1);
    assert.equal(s.effects.target_qi_loss.n, 1); assert.equal(s.exceptional.length, 2);
    const only = taohuaCombinationReport([exception(pair)], pair);
    assert.equal(only.commands.execution_cost.mean, null); assert.equal(only.actor_neili_cost.mean, null);
    assert.equal(only.attacks.hit_rate.rate, null); assert.equal(only.effects.target_qi_loss.mean, null);
    const empty = taohuaCombinationReport([], pair);
    assert.equal(empty.missing, 100); assert.equal(empty.recorded, 0);
    assert.equal(empty.effects.unknown_samples, 0); assert.equal(empty.effects.target_wound.mean, null);
    for (const outcome of ['refused', 'invalid', null, undefined]) {
        const bad = exception(pair); bad.outcome = bad.raw.outcome = outcome;
        assert.throws(() => taohuaCombinationReport([bad], pair));
    }
    for (const outcome of ['error', 'not_applicable']) for (const reason of ['', ' ', null, undefined]) {
        const bad = exception(pair, 0, outcome); bad.reason = bad.raw.reason = reason;
        assert.throws(() => taohuaCombinationReport([bad], pair));
    }
});

test('所有结果的outer/raw ID、index、method、outcome、reason必须同源', () => {
    for (const outcome of ['observed', 'error', 'not_applicable']) {
        const valid = outcome === 'observed' ? row(trace(pair)) : exception(pair, 0, outcome);
        for (const change of [r => r.condition_id = 'foreign', r => delete r.condition_id,
            r => r.raw.condition_id = 'foreign', r => delete r.raw.condition_id,
            r => r.index = 1, r => r.index = -1, r => r.index = null, r => delete r.index,
            r => r.raw.index = 1, r => r.raw.index = null, r => delete r.raw.index,
            r => r.raw.kind = 'not-sample', r => delete r.raw.kind,
            r => r.raw.method = 'interface', r => delete r.raw.method,
            r => r.outcome = outcome === 'error' ? 'not_applicable' : 'error',
            r => delete r.raw.outcome, r => r.reason = 'foreign reason',
            r => delete r.reason, r => delete r.raw.reason, r => delete r.raw]) {
            const bad = copy(valid); change(bad);
            assert.throws(() => taohuaCombinationReport([bad], pair));
        }
    }
});

test('重复索引、超计划、错误绑定和缺失26来源不能混入报告', () => {
    assert.throws(() => taohuaCombinationReport([row(trace(pair)), row(trace(pair))], pair));
    for (const index of [pair.samples, 0.1, '0', Number.MAX_SAFE_INTEGER + 1]) {
        const raw = trace(pair); raw.index = index;
        assert.throws(() => taohuaCombinationReport([row(raw)], pair));
    }
    assert.throws(() => taohuaCombinationReport([row(trace(solo))], pair));
    assert.throws(() => taohuaCombinationReport([], undefined));
    for (const change of [c => c.parameters.collection_group = 'wudang-combination',
        c => c.parameters.school = 'wudang', c => c.parameters.family = '武当派',
        c => c.stage = 'interface', c => c.samples = 0, c => c.samples = null,
        c => c.method = 'interface', c => c.parameters.ability = 'perform', c => c.parameters.level = 200,
        c => c.entry_id = 'kungfu/skill/force.c', c => c.parameters.skill = 'force',
        c => c.parameters.pair.reverse(), c => c.parameters.combination = 'pair-prepare',
        c => c.parameters.action = 'test_interface', c => c.parameters.fighting = false,
        c => c.parameters.observe_seconds = 1, c => c.parameters.observation = 'natural',
        c => c.parameters.expected = 'refused', c => c.parameters.not_applicable = 'fictional',
        c => delete c.parameters.source_evidence, c => delete c.parameters.qualification_sources,
        c => c.parameters.qualification_sources.pop(),
        c => delete c.parameters.source_evidence['cmds/skill/prepare.c'],
        c => c.parameters.source_evidence['cmds/skill/prepare.c'] = 'bad-hash',
        c => c.parameters.source_evidence['foreign.c'] = '0'.repeat(64)]) {
        const bad = copy(pair); change(bad);
        assert.throws(() => taohuaCombinationReport([], bad));
    }
    assert.equal(taohuaCombinationSourcePaths.length, 26);
});

test('冻结condition独立消费，summary.planned不能假装原samples，raw.parameters不影响报告', () => {
    const rows = [row(trace(pair))], original = taohuaCombinationReport(rows, pair);
    rows[0].raw.parameters = { collection_group: 'foreign', actor: { properties: { neili: -999 } } };
    assert.deepEqual(taohuaCombinationReport(rows, pair), original);
    const summary = summarizeSamples({ fingerprint: 'synthetic-only', versions: {},
        identity: { conditions: [pair], execution: { smoke: false } } }, rows).conditions[0];
    assert.equal(summary.planned, pair.samples); assert.equal(summary.samples, undefined);
    assert.throws(() => taohuaCombinationReport(rows, summary));
});

test('Markdown专用双表使用真实分母、命令成本与keys；不进入generic伤害表', () => {
    const rows = [row(trace(pair, { cost: 23 })), row(trace(pair, { index: 1, cost: 137,
        results: [-1, -2], reversed: true })), exception(pair, 2)];
    const data = report(pair, rows), before = JSON.stringify(data), md = schoolCombatMarkdown(data);
    assert.equal(JSON.stringify(data), before);
    assert.match(md, /## 桃花岛·互备：原准备命令与单次攻击轮/);
    assert.match(md, /单击轮\/双击轮/); assert.match(md, /1\/2；50\.00%/);
    assert.match(md, /1\/3；33\.33%/); assert.match(md, /80\.00 \[/);
    assert.match(md, /命中\/闪躲\/招架；命中但0伤/);
    assert.match(md, /实际准备次序/); assert.match(md, /按基本技能：出招\/命中\/闪躲\/招架/);
    assert.match(md, /不按命令参数顺序推断/); assert.match(md, /正整数是执行成本/);
    assert.match(md, /不等于逐击选招文本已观察/); assert.match(md, /300内力扣费在本配置不可达/);
    assert.match(md, /原记录 \\\| &lt;详情&gt;<br>下一行/);
    const generic = md.slice(0, md.indexOf('## 桃花岛·互备'));
    assert.equal(generic.split('\n').some(line => line.startsWith(`| ${pair.id} |`)), false);
    assert.equal(md.includes('NaN'), false); assert.equal(md.includes('undefined'), false);
});

test('仅准备与无有效样本Markdown为空分母，不把零轮当作失败率', () => {
    const prepared = schoolCombatMarkdown(report(prepare, [row(trace(prepare))]));
    assert.match(prepared, /仅准备/); assert.match(prepared, /未知（分母0）/);
    const unknown = schoolCombatMarkdown(report(pair, [exception(pair)]));
    assert.match(unknown, /未观察（n=0，未知=0）/); assert.match(unknown, /未知（分母0）/);
    assert.equal(unknown.includes('NaN'), false); assert.equal(unknown.includes('undefined'), false);
});

test('共享consumer取原冻结condition，generic排除新组，strict reader继续拒烟雾', () => {
    const text = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(text, /condition\.taohua_combination = taohuaCombinationReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\);/);
    assert.match(text, /else if \(condition\.parameters\.collection_group === 'taohua-combination'\) condition\.effects = null;/);
    assert.match(text, /!c\.taohua_passive && !c\.taohua_combination &&/);
    assert.match(readSchoolCombat.toString(), /assert\.equal\(manifest\.identity\.execution\.smoke, false, '烟雾不是完整统计'\)/);
});
