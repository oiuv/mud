import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaPassiveConditions, taohuaPassiveBounds, taohuaPassiveEffects,
    taohuaPassiveSourcePaths } from './school_taohua_passive_cases.mjs';
import { taohuaPassiveReport, schoolCombatMarkdown, readSchoolCombat } from './school_combat_report.mjs';
import { summarizeSamples } from './statistics.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const path = 'kungfu/skill/yuxiao-jian.c', source = read(path), parsed = scanSource(source);
assert.deepEqual(parsed.lexical_issues, []);
const fn = parsed.functions.find(f => f.name === 'hit_ob');
assert.ok(fn);
const catalog = { skills: [{ id: 'yuxiao-jian', path, sha256: hash(source), entries: [{
    id: `${path}:${fn.line}:hit_ob`, function: 'hit_ob', role: 'combat_interface',
    evidence: { path, line: fn.line, sha256: hash(source) },
}] }] };
const cases = taohuaPassiveConditions(catalog, read);
const smoke = taohuaPassiveConditions(catalog, read, { smoke: true });
const copy = structuredClone, resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const message = '\x1b[1;37m$N\x1b[1;37m手中演武兵器\x1b[1;37m发出阵阵箫音，让$n\x1b[1;37m感到难受至极。\n\x1b[0m';
const pick = (variant = 'baseline', level = 200) => {
    const c = cases.find(c => c.parameters.variant === variant && c.parameters.level === level);
    assert.ok(c, `${variant}/${level}`); return c;
};

function snapshot(config, side) {
    const special = key => key.includes('/') || key === 'character';
    const properties = Object.entries(config.properties);
    const apply = { armor: 100, ...(config.equipment ? { damage: 50, dodge: -1 } : {}) };
    return { ...Object.fromEntries(properties.filter(([key]) => !special(key))),
        cultivation: Object.fromEntries(properties.filter(([key]) => special(key))),
        object: `/tests/actor#${100 + side}`, id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0, busy: null,
        fighting_opponent: 0, conditions: null, skills: copy(config.skills), learned: {},
        mappings: copy(config.mappings), preparations: copy(config.preparations), temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_con: config.properties.con + Math.trunc(config.skills.force / 10), effective_str: config.properties.str,
        weapon: config.equipment ? 'sword' : 'none', weapon_damage: config.equipment ? 50 : 0,
        weapon_flag: config.equipment ? 4 : 0, weapon_details: config.equipment ? {
            object: '/tests/sword#200', program: '/tests/sword', skill_type: 'sword', weight: 3000,
            damage: 50, flag: 4, consistence: 100, material: null, rigidity: null, no_wield: null,
        } : {}, secondary_weapon: 'none', secondary_weapon_details: {},
        handing: 'none', handing_details: {}, ammunition: 0 };
}

function sync(raw) {
    raw.after = copy(raw.immediate);
    const event = raw.passives[0];
    event.before = copy(raw.before); event.after = copy(raw.immediate);
    event.neili_after = raw.immediate[0].neili; event.target_eff_qi_after = raw.immediate[1].eff_qi;
    event.target_busy_after = raw.immediate[1].busy; raw.interfaces[0].result = event.result;
    return raw;
}

// Synthetic protocol traces only, never driver output, a sample ledger or real RNG evidence.
function trace(condition = pick(), options = {}) {
    const p = condition.parameters, before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const raw = { kind: 'sample', condition_id: condition.id, index: options.index ?? 0, method: 'interface',
        outcome: 'observed', reason: '', elapsed: 0.001, command_accepted: options.cost ?? 53,
        before, immediate: copy(before), metrics: [{}, {}],
        passives: [{ actor: 0, target: 1, skill: 'yuxiao-jian', route: 'interface',
            incoming: p.interface.damage, factor: 0,
            result: options.triggered ? message : Object.hasOwn(options, 'result') ? options.result : null }],
        interfaces: [{ object: p.interface.object, function: 'hit_ob' }],
        actions: [], attacks: [], defenses: [], dodge_checks: [], launches: [], refusals: [],
        callbacks: [], terminals: [], dropped: [], skill_loads: [] };
    if (options.triggered) {
        const requested = options.wound ?? Math.trunc(p.interface.damage * 2 / 3);
        raw.immediate[0].neili -= 60;
        raw.immediate[1].eff_jing = Math.max(-1, before[1].eff_jing - requested);
        raw.immediate[1].jing = Math.min(before[1].jing, raw.immediate[1].eff_jing);
    }
    for (const side of [0, 1]) for (const key of resources) {
        const cost = raw.before[side][key] - raw.immediate[side][key];
        if (cost) raw.metrics[side][key + '_cost'] = cost;
    }
    return sync(raw);
}
const row = raw => ({ condition_id: raw.condition_id, index: raw.index,
    outcome: raw.outcome, reason: raw.reason, raw_sha256: hash(raw), raw });
function exception(condition, index = 0, outcome = 'error') {
    return row({ kind: 'sample', method: 'interface', condition_id: condition.id, index, outcome,
        reason: '原记录 | <详情>\n下一行' });
}
function report(condition, rows) {
    const result = summarizeSamples({ fingerprint: 'synthetic-only', versions: {},
        identity: { conditions: [condition], execution: { smoke: false } } }, rows);
    const c = result.conditions[0];
    c.effects = null; c.taohua_passive = taohuaPassiveReport(rows, condition);
    result.totals = { conditions: 1, samples: rows.length, observed: c.counts.observed,
        refused: c.counts.refused, errors: c.counts.error };
    result.evidence_sha256 = 'synthetic-only'; return result;
}

test('固定16/1110/16和22来源不变，所有条件原空返回均消费而不记拒绝', () => {
    assert.equal(cases.length, 16); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1110);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 16);
    assert.equal(hash(cases), '1c34e98de633e6777e87df2a565ca6088ca0dbc0591e20a471051e490b289f0a');
    assert.equal(hash(smoke), 'ca8207fd1539745c1e34f39f78854bd668211486bfcd3aa457fcb0afc4f2eb0b');
    assert.equal(taohuaPassiveSourcePaths.length, 22);
    for (const c of cases) for (const result of [0, null]) {
        const r = row(trace(c, { result })), bytes = JSON.stringify(r), s = taohuaPassiveReport([r], c);
        assert.equal(s.counts.observed, 1); assert.equal(s.counts.refused, 0);
        assert.equal(s.commands.accepted, 1); assert.equal(s.effects.interface_calls, 1);
        assert.equal(s.effects.no_effect_returns, 1); assert.equal(s.effects.trigger_per_call.rate, 0);
        assert.deepEqual(s.effects, taohuaPassiveEffects([r], c)); assert.equal(JSON.stringify(r), bytes);
    }
});

test('正命令成本/接口次数/触发三个分母分开，只依赖原冻结condition', () => {
    const c = pick(), rows = [row(trace(c, { triggered: true, cost: 71 })),
        row(trace(c, { index: 1, result: 0, cost: 303 })), row(trace(c, { index: 2, result: null, cost: 10 })),
        exception(c, 3)];
    rows[0].raw.parameters = { actor: {}, interface: { damage: 99999 } };
    const s = taohuaPassiveReport(rows, c), e = s.effects;
    assert.equal(s.commands.accepted, 3); assert.equal(s.commands.execution_cost.mean, 128);
    assert.deepEqual(s.returns, { zero: 1, null: 1, triggered: 1 });
    assert.equal(e.interface_calls, 3); assert.equal(e.eligible_calls, 3); assert.equal(s.eligible_no_effect, 2);
    assert.equal(e.trigger_per_call.trials, 3); assert.equal(e.trigger_when_eligible.rate, 1 / 3);
    assert.equal(e.actor_neili_cost.mean, 20); assert.equal(e.triggered_neili_cost.mean, 60);
    assert.equal(e.target_eff_jing_loss.mean, 400 / 3); assert.equal(e.triggered_eff_jing_loss.mean, 400);
    assert.equal(e.unknown_or_unobserved, 1); assert.equal(e.actor_neili_cost.n, 3);
});

test('五种守卫不满足仍observed，eligible分母0不能充作随机失败或命令拒绝', () => {
    const guards = cases.filter(c => c.samples === 2);
    assert.equal(guards.length, 5);
    for (const c of guards) {
        const s = taohuaPassiveReport([row(trace(c))], c);
        assert.equal(s.effects.guard_no_effect, 1); assert.equal(s.effects.eligible_calls, 0);
        assert.equal(s.effects.trigger_when_eligible.rate, null); assert.equal(s.eligible_no_effect, 0);
        assert.equal(s.effects.actor_neili_cost.mean, 0); assert.equal(s.counts.refused, 0);
        assert.throws(() => taohuaPassiveReport([row(trace(c, { triggered: true }))], c));
    }
});

test('11种可触发配置使用原整数支持集，等级/吹箫/有效根骨不偷换', () => {
    for (const c of cases.filter(c => c.samples === 100)) {
        const raw = trace(c), limits = taohuaPassiveBounds(raw.before[0], raw.before[1], c.parameters.interface.damage);
        assert.equal(limits.eligible, true);
        for (const wound of [limits.source_wound_min, limits.source_wound_max]) {
            const s = taohuaPassiveReport([row(trace(c, { triggered: true, wound }))], c);
            assert.equal(s.effects.trigger_per_call.rate, 1); assert.equal(s.effects.triggered_neili_cost.mean, 60);
            assert.deepEqual(s.effects.requested_wound, { observation: 'not_observed',
                source_support_if_triggered: { min: limits.source_wound_min, max: limits.source_wound_max } });
        }
    }
    for (const [variant, min, max] of [['baseline', 400, 449], ['chuixiao-absent', 400, 400],
        ['chuixiao400', 400, 499], ['incoming120-con19', 80, 129], ['incoming582-con96', 388, 437]]) {
        const s = taohuaPassiveReport([], pick(variant));
        assert.deepEqual(s.effects.requested_wound.source_support_if_triggered, { min, max });
        assert.equal(s.effects.requested_wound.observation, 'not_observed');
    }
});

test('两类精神夹制以原实际账分列，不能倒推请求或宣称后续昏迷', () => {
    const low = pick('jing-below-eff'), a = taohuaPassiveReport([row(trace(low, { triggered: true, wound: 449 }))], low);
    assert.equal(a.effects.triggered_eff_jing_loss.mean, 449); assert.equal(a.effects.triggered_jing_loss.mean, 0);
    const clipped = pick('eff-jing-clipped'), rows = [row(trace(clipped, { triggered: true, wound: 400 })),
        row(trace(clipped, { index: 1, triggered: true, wound: 449 }))];
    const s = taohuaPassiveReport(rows, clipped), e = s.effects;
    assert.equal(e.immediate_clipped, 2); assert.equal(e.target_eff_jing_loss.mean, 201);
    assert.equal(e.target_jing_loss.mean, 101); assert.equal(e.requested_wound.observation, 'not_observed');
    assert.equal(e.later_unconsciousness_or_death, 'not_observed');
    assert.equal(e.craze, 'not_observed'); assert.equal(e.last_damage_attribution, 'not_observed');
    assert.equal(e.ordinary_hit_rate, 'not_observed');
    for (const r of rows) { assert.equal(r.raw.immediate[1].jing, -1); assert.equal(r.raw.immediate[1].living, 1); }
    const bad = trace(clipped, { triggered: true }); bad.metrics[1].eff_jing_cost = 400;
    assert.throws(() => taohuaPassiveReport([row(bad)], clipped));
});

test('错误/未适用/空集合和缺样本保留未知，不伪造成零触发或零费用', () => {
    const c = pick();
    for (const rows of [[], [exception(c)], [exception(c, 0, 'not_applicable')]]) {
        const bytes = JSON.stringify(rows), s = taohuaPassiveReport(rows, c);
        assert.equal(s.recorded, rows.length); assert.equal(s.missing, c.samples - rows.length);
        assert.equal(s.effects.unknown_or_unobserved, rows.length); assert.equal(s.effects.interface_calls, 0);
        assert.equal(s.effects.trigger_per_call.rate, null); assert.equal(s.effects.trigger_when_eligible.rate, null);
        assert.equal(s.effects.actor_neili_cost.n, 0); assert.equal(s.effects.actor_neili_cost.mean, null);
        assert.equal(s.commands.execution_cost.mean, null); assert.equal(s.effects.no_effect_returns, 0);
        assert.equal(s.exceptional.length, rows.length); assert.equal(JSON.stringify(rows), bytes);
    }
    const refused = exception(c, 0, 'refused');
    assert.throws(() => taohuaPassiveReport([refused], c), '无触发不能记成接口拒绝');
});

test('每种结果的包层/raw身份与理由同源，错误不能绕过校验', () => {
    const c = pick();
    for (const make of [() => row(trace(c)), () => exception(c), () => exception(c, 0, 'not_applicable')]) {
        for (const change of [r => r.condition_id = 'foreign', r => r.raw.condition_id = 'foreign',
            r => delete r.condition_id, r => delete r.raw.condition_id, r => r.raw = null,
            r => r.raw.kind = 'other', r => r.raw.method = 'perform', r => r.raw.index++,
            r => delete r.raw.index, r => r.raw.outcome = 'foreign', r => r.outcome = 'foreign',
            r => delete r.outcome, r => r.raw.reason += 'foreign', r => r.reason = null,
            r => delete r.reason, r => delete r.raw.reason]) {
            const r = make(); change(r); assert.throws(() => taohuaPassiveReport([r], c));
        }
    }
    for (const outcome of ['error', 'not_applicable']) for (const reason of ['', ' ', null, 0, undefined]) {
        const r = exception(c, 0, outcome); r.reason = r.raw.reason = reason;
        assert.throws(() => taohuaPassiveReport([r], c));
    }
});

test('索引/重复/原samples严格，不能把统计summary传回原condition', () => {
    const c = pick(), r = row(trace(c));
    assert.throws(() => taohuaPassiveReport([r, copy(r)], c));
    for (const index of [undefined, null, '0', -1, 0.5, c.samples, NaN, Infinity]) {
        const x = copy(r); x.index = x.raw.index = index;
        assert.throws(() => taohuaPassiveReport([x], c));
    }
    const summary = copy(c); delete summary.samples; summary.planned = c.samples;
    assert.throws(() => taohuaPassiveReport([r], summary));
    assert.equal(taohuaPassiveReport([row(trace(c, { index: c.samples - 1 }))], c).missing, c.samples - 1);
});

test('无样本仍锁定精确入口、22来源与即时窗口，不以未知填零掩盖错绑定', () => {
    const changes = [c => c.parameters.collection_group = 'taohua-bihai', c => c.parameters.school = 'gumu',
        c => c.parameters.family = '古墓派', c => c.id = '', c => c.samples = 0, c => c.method = 'perform',
        c => c.parameters.skill = 'bihai-chaosheng', c => c.parameters.ability = 'bihai',
        c => c.parameters.usage = 'finger', c => c.parameters.action = 'perform sword.bihai right',
        c => c.entry_id = 'foreign:8:hit_ob', c => c.entry_id = `${path}:0:hit_ob`,
        c => c.parameters.interface.object = '/kungfu/skill/force', c => c.parameters.interface.function = 'valid_learn',
        c => c.parameters.interface.factor = 1, c => c.parameters.interface.damage = null,
        c => c.parameters.interface.damage = 0.5, c => delete c.parameters.source_evidence,
        c => delete c.parameters.source_evidence[path], c => c.parameters.source_evidence[path] = null,
        c => c.parameters.source_evidence['foreign.c'] = '0'.repeat(64), c => c.parameters.qualification_sources.pop(),
        c => c.parameters.observe_seconds = 1, c => c.parameters.observation = 'natural',
        c => c.parameters.expected = 'refused', c => c.parameters.not_applicable = 'fallback',
        c => c.parameters.named_participants = false, c => c.parameters.fighting = true,
        c => c.parameters.target_state = 'dead', c => c.parameters.capture_skill_loads = ['foreign']];
    for (const change of changes) {
        const c = copy(pick()); change(c); assert.throws(() => taohuaPassiveReport([], c));
    }
});

test('原校验拒绝假返回/身份/毛账相抵/缺字段/普攻或发动计数，不为报告放宽', () => {
    const c = pick();
    const changes = [r => r.command_accepted = 0, r => r.command_accepted = null,
        r => delete r.command_accepted, r => r.command_accepted = 1.5,
        r => { r.passives[0].result = r.interfaces[0].result = ''; },
        r => delete r.passives[0].result, r => r.passives[0].actor = -1,
        r => r.interfaces[0].object = '/kungfu/skill/force', r => r.passives[0].incoming++,
        r => delete r.metrics[0].neili_cost, r => r.metrics[1].eff_jing_cost = null,
        r => { r.metrics[0].neili_cost++; r.metrics[0].neili_recovery = 1; },
        r => r.metrics[1].qi_cost = 1, r => r.metrics[0].hit = 1, r => r.metrics[1].heartbeats = 1,
        r => r.metrics[0].ability_launched = 1, r => r.metrics[1].ability_launched = 1,
        r => r.before[0].userp = 0, r => delete r.before[0].weapon_details.rigidity,
        r => { r.immediate[0].weapon_details.consistence--; sync(r); },
        r => { r.immediate[1].living = 0; sync(r); }, r => r.passives.push(copy(r.passives[0]))];
    for (const change of changes) {
        const raw = trace(c, { triggered: true }); change(raw);
        assert.throws(() => taohuaPassiveReport([row(raw)], c));
    }
    for (const result of [undefined, false, '', 1, 'not the original text'])
        assert.throws(() => taohuaPassiveReport([row(trace(c, { result }))], c));
});

test('Markdown独立精神专节保留真实分母/未知/夹制，不误套通用气血表', () => {
    const c = pick(), rows = [row(trace(c, { triggered: true })), row(trace(c, { index: 1, result: 0 })),
        row(trace(c, { index: 2, result: null })), exception(c, 3)];
    const data = report(c, rows), before = JSON.stringify(data), md = schoolCombatMarkdown(data);
    assert.equal(JSON.stringify(data), before);
    assert.match(md, /## 桃花岛·玉箫剑法命中被动：一次原接口与精神创伤/);
    assert.match(md, /原返回0\/null\/触发文本/); assert.match(md, /守卫无效\/满足守卫未触发/);
    assert.match(md, /1\/3；33\.33%/); assert.match(md, /对方当前精神净减：全部\/触发/);
    assert.match(md, /对方有效精神创伤：全部\/触发/); assert.match(md, /not_observed；400\.\.449/);
    assert.match(md, /实际返回 0\/null 仍是已观察接口，不是命令拒绝或普攻失手/);
    assert.match(md, /实际损失201\/101，不能倒推原请求/);
    assert.match(md, /没有物品命中回调或耐久损耗/); assert.match(md, /−1不等于已观察昏迷或死亡/);
    assert.match(md, /原记录 \\\| &lt;详情&gt;<br>下一行/);
    const generic = md.slice(0, md.indexOf('## 桃花岛·玉箫剑法'));
    assert.equal(generic.split('\n').some(line => line.startsWith(`| ${c.id} |`)), false);
    const unknown = schoolCombatMarkdown(report(c, [exception(c)]));
    assert.match(unknown, /未知（分母0）/); assert.match(unknown, /未观察（n=0，未知=0）/);
    assert.equal(unknown.includes('NaN'), false); assert.equal(unknown.includes('undefined'), false);
});

test('共享consumer传原冻结condition、专组排除generic，正式reader仍拒smoke', () => {
    const text = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(text, /condition\.taohua_passive = taohuaPassiveReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\);/);
    assert.match(text, /else if \(condition\.parameters\.collection_group === 'taohua-passive'\) condition\.effects = null;/);
    assert.match(text, /report\.conditions\.filter\(c => !c\.taohua_combo && !c\.taohua_bihai && !c\.taohua_passive &&/);
    assert.match(readSchoolCombat.toString(), /assert\.equal\(manifest\.identity\.execution\.smoke, false, '烟雾不是完整统计'\)/);
});
