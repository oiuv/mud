import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaAttacks, taohuaAttackConditions, taohuaAttackEffects } from './school_taohua_attack_cases.mjs';
import { taohuaAttackReport, schoolCombatMarkdown } from './school_combat_report.mjs';
import { summarizeSamples } from './statistics.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const catalog = { skills: taohuaAttacks.map(d => {
    const path = `kungfu/skill/${d.skill}.c`, source = read(path), parsed = scanSource(source);
    assert.deepEqual(parsed.lexical_issues, []);
    assert.ok(parsed.functions.some(fn => fn.name === 'query_action'));
    assert.equal(parsed.functions.some(fn => fn.name === 'hit_ob'), false);
    return { id: d.skill, path, sha256: hash(source), entries: [] };
}) };
const cases = taohuaAttackConditions(catalog, read), smoke = taohuaAttackConditions(catalog, read, { smoke: true });
const pick = (skill = 'canglang-zhi', variant = 'baseline', level = 200) => {
    const c = cases.find(c => c.parameters.skill === skill && c.parameters.variant === variant && c.parameters.level === level);
    assert.ok(c, `${skill}/${variant}/${level}`); return c;
};

function snapshot(config, side) {
    const apply = { armor: 100, ...(config.equipment ? { damage: 50, dodge: -1 } : {}) };
    const qualified = key => key.includes('/') || key === 'character';
    return { ...Object.fromEntries(Object.entries(config.properties).filter(([key]) => !qualified(key))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([key]) => qualified(key))),
        object: `/tests/actor#${100 + side}`, id: side ? 'right' : 'left', userp: 1, interactive: 1,
        wizardp: 0, living: 1, ghost: 0, fighting_opponent: 1, busy: null,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations), temp: { apply }, conditions: null,
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, level]) =>
            [key, Math.trunc(level / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: config.equipment ? 'sword' : 'none', weapon_details: config.equipment ? {
            object: `/tests/sword#${200 + side}`, program: '/tests/sword', skill_type: 'sword',
            weight: 3000, damage: 50, flag: 4, consistence: 100, material: null, rigidity: null, no_wield: null,
        } : {}, secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

// Synthetic protocol examples only, not driver observations or random samples.
function trace(condition, { index = 0, result = 0, extra = false, passive = true, callbackResult = null, wear = 0 } = {}) {
    const p = condition.parameters, before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const immediate = structuredClone(before);
    const action = extra ? { action: '兰花额外动作合成夹具', weapon: '兰花指', force: 200,
        attack: 100, dodge: 300, parry: 300, damage: 100, damage_type: '点穴' }
        : { action: '普通动作合成夹具', lvl: 0, force: 100, damage: 1, damage_type: '瘀伤' };
    immediate[0].neili -= extra ? 300 : 0;
    const passiveBefore = structuredClone(immediate);
    if (result === 0 && passive) { immediate[1].qi -= 100; immediate[1].eff_qi -= 10; }
    if (wear) immediate[0].weapon_details.consistence -= wear;
    const metrics = [{ [result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry']: 1 }, {}];
    for (const side of [0, 1]) for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
        const cost = before[side][key] - immediate[side][key]; if (cost) metrics[side][key + '_cost'] = cost;
    }
    return { kind: 'sample', condition_id: condition.id, index, method: 'ordinary', outcome: 'observed',
        reason: '', elapsed: 0.01, before, immediate, after: structuredClone(immediate), metrics,
        actions: [{ actor: 0, target: 1, skill: p.skill, action }], attacks: [{ actor: 0, target: 1, type: 0, result }],
        passives: result === 0 && passive ? [{ actor: 0, target: 1, route: 'martial', skill: p.skill,
            incoming: 100, factor: 0, result: callbackResult, before: passiveBefore, after: structuredClone(passiveBefore) }] : [],
        interfaces: [], launches: [], dropped: [], skill_loads: [] };
}
const row = raw => ({ condition_id: raw.condition_id, index: raw.index, outcome: raw.outcome, reason: raw.reason, raw });
const unknown = (c, outcome = 'error', index = 0) => row({ kind: 'sample', condition_id: c.id, index,
    method: 'ordinary', outcome, reason: '原理由 | <详情>\n第二行' });
function report(c, rows) {
    const s = taohuaAttackReport(rows, c);
    const result = summarizeSamples({ fingerprint: 'synthetic', versions: {},
        identity: { conditions: [c], execution: { smoke: false } } }, rows);
    result.evidence_sha256 = 'synthetic-only';
    result.totals = { conditions: 1, samples: rows.length, observed: s.counts.observed,
        refused: s.counts.refused, errors: s.counts.error };
    const summary = result.conditions[0];
    assert.deepEqual(summary.counts, s.counts); assert.equal(summary.planned, s.planned);
    assert.equal(summary.recorded, s.recorded); assert.equal(summary.missing, s.missing);
    summary.effects = null; summary.taohua_attack = s;
    return result;
}

test('原25/2108/25、34来源和45静态动作不变，全部条件合成消费不代表实采', () => {
    assert.equal(cases.length, 25); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2108);
    assert.equal(smoke.length, 25); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 25);
    assert.equal(hash(cases), 'dab363b293a8da013c5d948872d2e21efc7ddb2d4b2fe489c56b20a16b8acc5f');
    assert.equal(hash(smoke), '5bf0d38e682b40a71f223ba3ba1061df671e6f4fbee7418f39d1498322e61fad');
    assert.equal(taohuaAttacks.reduce((n, d) => n + d.levels.length, 0), 45);
    for (const c of cases) {
        assert.equal(Object.keys(c.parameters.source_evidence).length, 34);
        assert.equal(hash(Object.entries(c.parameters.source_evidence)), '7c3db68228cb7aef8d73bb8d068b7a0ef233224a7f507e3619784c69ebb623f5');
        const rows = [row(trace(c))], before = JSON.stringify(rows), s = taohuaAttackReport(rows, c);
        assert.equal(s.recorded, 1); assert.equal(s.counts.observed, 1);
        assert.deepEqual(s.effects, taohuaAttackEffects(rows, c));
        assert.equal(Object.hasOwn(rows[0].raw, 'parameters'), false);
        assert.equal(Object.hasOwn(rows[0].raw, 'command_accepted'), false);
        assert.equal(Object.hasOwn(s, 'commands'), false);
        assert.equal(JSON.stringify(rows), before);
        assert.doesNotThrow(() => schoolCombatMarkdown(report(c, rows)));
    }
});

test('consumer必须传原冻结条件，普通方法/技能/窗口错配及planned替samples拒绝', () => {
    const source = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(source, /condition\.taohua_attack = taohuaAttackReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\)/);
    assert.match(source, /: condition\.parameters\.collection_group === 'taohua-attack' \? null\s*: schoolCombatEffects/);
    for (const mutate of [c => { c.planned = c.samples; delete c.samples; },
        c => c.samples = 0, c => c.samples = 1.5, c => c.method = 'perform', c => c.entry_id = 'other.c',
        c => c.parameters.collection_group = 'taohua-direct', c => c.parameters.skill = 'tanzhi-shentong',
        c => c.parameters.usage = 'sword', c => c.parameters.ability = 'ding',
        c => c.parameters.action = 'perform finger.ding right', c => c.parameters.observe_seconds = 1,
        c => c.parameters.observation = 'natural_bout', c => c.parameters.expected = 'refused',
        c => c.parameters.not_applicable = 'skip', c => c.parameters.named_participants = false,
        c => c.parameters.fighting = false, c => c.parameters.target_state = 'unconscious']) {
        const c = structuredClone(pick()); mutate(c); assert.throws(() => taohuaAttackReport([], c));
    }
});

test('一次攻击三类结果分母与实际选招次数，不把静态条目当覆盖', () => {
    for (const d of taohuaAttacks) {
        const c = pick(d.skill), rows = [0, -1, -2].map((result, index) => row(trace(c, { result, index })));
        rows.push(unknown(c, 'error', 3));
        const s = taohuaAttackReport(rows, c), e = s.effects;
        assert.deepEqual(s.counts, { observed: 3, refused: 0, error: 1, not_applicable: 0 });
        for (const probability of [e.hit, s.dodge, s.parry]) {
            assert.equal(probability.successes, 1); assert.equal(probability.trials, 3);
        }
        assert.equal(e.unknown_or_unobserved, 1); assert.equal(s.static_action_entries, d.levels.length);
        assert.equal(s.selected_action_texts, 1); assert.deepEqual(e.move_counts, { 普通动作合成夹具: 3 });
        assert.equal(e.target_qi_loss.mean, 100 / 3); assert.equal(e.target_wound.mean, 10 / 3);
        assert.equal(e.actor_neili_cost.mean, 0);
        const md = schoolCombatMarkdown(report(c, rows));
        assert.match(md, /六门共 45 条普通动作静态条目/); assert.match(md, /普通动作合成夹具：3/);
        assert.match(md, /动作文本种数不是静态条目覆盖率/);
    }
});

test('兰花额外选中与命中分开，闪避和招架仍先扣300且空结果不是命中', () => {
    const c = pick('lanhua-shou', 'extra-enabled');
    const rows = [0, -1, -2].map((result, index) => row(trace(c, { result, index, extra: true })));
    rows.push(row(trace(c, { index: 3 })), unknown(c, 'not_applicable', 4));
    const s = taohuaAttackReport(rows, c), e = s.effects;
    assert.equal(e.lanhua_extra_action.successes, 3); assert.equal(e.lanhua_extra_action.trials, 4);
    assert.equal(e.hit.successes, 2); assert.equal(e.hit.trials, 4);
    assert.deepEqual([s.extra_action.hit, s.extra_action.dodge, s.extra_action.parry, s.extra_action.samples], [1, 1, 1, 3]);
    assert.equal(s.extra_action.actor_neili_cost.n, 3); assert.equal(s.extra_action.actor_neili_cost.mean, 300);
    assert.equal(e.actor_neili_cost.mean, 225); assert.equal(e.target_qi_loss.mean, 50);
    assert.equal(e.target_wound.mean, 5); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(s.counts.not_applicable, 1);
    const md = schoolCombatMarkdown(report(c, rows));
    assert.match(md, /兰花额外动作在选招时先扣 300 内力/); assert.match(md, /选中次数不是命中次数/);
    for (const index of [1, 2]) {
        const bad = structuredClone(rows[index]); bad.raw.immediate[0].neili += 300;
        bad.raw.after = structuredClone(bad.raw.immediate); delete bad.raw.metrics[0].neili_cost;
        assert.throws(() => taohuaAttackReport([bad], c));
    }
});

test('原严格额外选招边界仅核结果，2次最低资格不能强制随机命中', () => {
    for (const variant of ['level100', 'jingluo100', 'neili1000']) {
        const c = cases.find(c => c.parameters.variant === variant); assert.ok(c);
        const s = taohuaAttackReport([row(trace(c))], c);
        assert.equal(s.effects.lanhua_extra_action.successes, 0);
        assert.throws(() => taohuaAttackReport([row(trace(c, { extra: true }))], c));
    }
    const c = cases.find(c => c.parameters.variant === 'minimum-extra'); assert.ok(c); assert.equal(c.samples, 2);
    const rows = [row(trace(c)), row(trace(c, { index: 1, extra: true, result: -1 }))];
    const s = taohuaAttackReport(rows, c);
    assert.equal(s.effects.lanhua_extra_action.successes, 1); assert.equal(s.effects.lanhua_extra_action.trials, 2);
    assert.equal(s.extra_action.hit, 0); assert.equal(s.extra_action.dodge, 1);
});

test('真实回调0/null、未到达及命中零损伤分开，缺返回或伪额外回调拒绝', () => {
    const c = pick(), rows = [row(trace(c, { callbackResult: 0 })), row(trace(c, { index: 1 })),
        row(trace(c, { index: 2, passive: false })), row(trace(c, { index: 3, result: -1 }))];
    const s = taohuaAttackReport(rows, c);
    assert.deepEqual(s.martial_callback, { reached: 2, returned_zero: 1, returned_null: 1, not_reached: 2, hits_without_callback: 1 });
    assert.equal(s.effects.hit.successes, 3); assert.equal(s.effects.target_qi_loss.mean, 50);
    for (const mutate of [r => delete r.passives, r => r.passives[0].result = undefined,
        r => delete r.passives[0].result, r => r.passives[0].result = 1,
        r => r.passives[0].actor = 1, r => r.passives[0].target = 0,
        r => r.passives[0].route = 'force', r => r.passives.push(structuredClone(r.passives[0]))]) {
        const raw = trace(c); mutate(raw); assert.throws(() => taohuaAttackReport([row(raw)], c));
    }
    assert.match(schoolCombatMarkdown(report(c, rows)), /未到达不补成返回0/);
});

test('标准剑磨损观察只给合法子集，不虚构item回调次数或概率', () => {
    const c = pick('luoying-shenjian'), rows = [row(trace(c, { wear: 1 })), row(trace(c, { index: 1 })),
        row(trace(c, { index: 2, passive: false })), row(trace(c, { index: 3, result: -2 }))];
    const s = taohuaAttackReport(rows, c), w = s.ordinary_sword;
    assert.deepEqual([w.samples, w.hit_samples, w.hit_reached_martial_samples, w.changed_samples], [4, 3, 2, 1]);
    assert.equal(w.wear_when_hit_and_martial_reached.n, 2); assert.equal(w.wear_when_hit_and_martial_reached.mean, 0.5);
    assert.equal(w.item_callback_calls, null); assert.equal(Object.hasOwn(w, 'probability'), false);
    assert.equal(taohuaAttackReport([row(trace(pick()))], pick()).ordinary_sword, null);
    for (const options of [{ wear: 2 }, { wear: 1, result: -1 }, { wear: 1, passive: false }])
        assert.throws(() => taohuaAttackReport([row(trace(c, options))], c));
    for (const mutate of [r => r.immediate[1].weapon_details.consistence = 99,
        r => delete r.immediate[0].weapon_details.consistence,
        r => r.immediate[0].weapon_details.consistence = null,
        r => r.immediate[0].weapon_details.damage = 51]) {
        const raw = trace(c); mutate(raw); raw.after = structuredClone(raw.immediate);
        assert.throws(() => taohuaAttackReport([row(raw)], c));
    }
    const md = schoolCombatMarkdown(report(c, rows));
    assert.match(md, /该子集耐久减少 0\.50/); assert.match(md, /物品回调次数未观察/);
});

test('未知和缺样不补零：空分母、费用和剑磨损无观测，错误理由保留', () => {
    for (const c of [pick('lanhua-shou'), pick('luoying-shenjian')]) for (const rows of [[], [unknown(c)], [unknown(c, 'not_applicable')]]) {
        const s = taohuaAttackReport(rows, c), e = s.effects;
        assert.equal(s.missing, c.samples - rows.length); assert.equal(e.samples, 0);
        assert.equal(e.unknown_or_unobserved, rows.length);
        for (const value of [e.hit, s.dodge, s.parry]) assert.equal(value.rate, null);
        for (const value of [e.actor_neili_cost, e.target_qi_loss, e.target_wound]) {
            assert.equal(value.n, 0); assert.equal(value.mean, null);
        }
        if (s.ordinary_sword) assert.equal(s.ordinary_sword.wear_when_hit_and_martial_reached.mean, null);
        if (s.extra_action) assert.equal(s.extra_action.actor_neili_cost.mean, null);
        const md = schoolCombatMarkdown(report(c, rows));
        assert.match(md, /未知（分母0）/); assert.doesNotMatch(md, /0\/0；0\.00%/);
        if (rows.length) assert.match(md, /原理由 \\\| &lt;详情&gt;<br>第二行/);
    }
});

test('所有结果先核outer/raw身份索引结果理由，错误与未适用也不能混入别组', () => {
    const c = pick();
    for (const original of [row(trace(c)), unknown(c), unknown(c, 'not_applicable')]) {
        for (const mutate of [r => delete r.condition_id, r => r.condition_id = 'foreign',
            r => r.condition_id = null, r => delete r.raw, r => r.raw.condition_id = 'foreign',
            r => r.raw.kind = 'other', r => r.raw.method = 'perform', r => delete r.index,
            r => r.index = -1, r => r.index = c.samples, r => r.index = 0.5, r => r.raw.index = 1,
            r => r.outcome = 'foreign', r => r.raw.outcome = 'foreign',
            r => delete r.reason, r => r.reason = null, r => r.raw.reason = 'other']) {
            const bad = structuredClone(original); mutate(bad); assert.throws(() => taohuaAttackReport([bad], c));
        }
        assert.throws(() => taohuaAttackReport([original, structuredClone(original)], c));
    }
    for (const outcome of ['error', 'not_applicable']) {
        const blank = unknown(c, outcome); blank.reason = ''; blank.raw.reason = '';
        assert.throws(() => taohuaAttackReport([blank], c));
    }
    const refused = row(trace(c)); refused.outcome = 'refused'; refused.raw.outcome = 'refused';
    assert.throws(() => taohuaAttackReport([refused], c));
});

test('缺资源账、额外恢复和计数错误不能被report滤成正常零值', () => {
    const c = pick();
    for (const mutate of [r => delete r.metrics, r => r.metrics[0] = null,
        r => delete r.metrics[1].qi_cost, r => r.metrics[1].qi_cost = null,
        r => r.metrics[1].qi_recovery = 1, r => r.metrics[0].hit = 0,
        r => r.metrics[0].dodge = 1, r => r.metrics[1].hit = 1,
        r => r.metrics[0].quick = 1, r => r.metrics[1].riposte = 1, r => r.metrics[0].heartbeats = 1,
        r => r.metrics[0].direct = 1, r => delete r.immediate[1].qi,
        r => r.immediate[1].qi = null, r => r.immediate[0].object = '/tests/actor#999']) {
        const raw = trace(c); mutate(raw); raw.after = structuredClone(raw.immediate);
        assert.throws(() => taohuaAttackReport([row(raw)], c));
    }
});

test('报告只用冻结condition且不回填raw，实际选招文本正确转义并排除generic损伤表', () => {
    const c = pick(), raw = trace(c), rows = [row(raw)];
    raw.actions[0].action.skill_name = '合成 | <名称>\n第二行';
    const before = JSON.stringify(rows), s = taohuaAttackReport(rows, c);
    raw.parameters = { skill: 'foreign', actor: { properties: { neili: 0 } } };
    assert.deepEqual(taohuaAttackReport(rows, c), s);
    delete raw.parameters; assert.equal(JSON.stringify(rows), before);
    const summary = report(c, rows);
    // A generic renderer would fail rather than silently using USER0/USER1 columns.
    delete summary.conditions[0].sides;
    const md = schoolCombatMarkdown(summary), own = md.indexOf('## 桃花岛·六门普攻');
    assert.ok(own > 0); assert.equal(md.slice(0, own).includes(c.id), false);
    assert.match(md, /合成 \\\| &lt;名称&gt;<br>第二行：1/);
    assert.match(md, /本组没有自然心跳、持续交锋或自然DPS数据/);
});
