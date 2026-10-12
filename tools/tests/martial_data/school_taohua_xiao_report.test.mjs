import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaXiaoConditions, taohuaXiaoEffects } from './school_taohua_xiao_cases.mjs';
import { taohuaXiaoReport, taohuaXiaoMarkdown } from './school_taohua_xiao_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const digest = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const catalog = { skills: ['tanzhi-shentong', 'tanzhi-shentong/xiao'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', source = readFileSync(join(root, path), 'utf8');
    const parsed = scanSource(source); assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: digest(source), entries: parsed.functions.filter(fn => fn.name === 'perform')
        .map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'perform' })) };
}) };
const cases = taohuaXiaoConditions(catalog), skill = 'tanzhi-shentong';
const pick = (variant = 'baseline', level = 200) => {
    const condition = cases.find(c => c.id === `school-taohua-xiao-l${level}-${variant}`);
    assert.ok(condition); return condition;
};

function snapshot(cfg, side, fighting) {
    const equipped = !!cfg.equipment, apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    const fields = Object.entries(cfg.properties);
    return { ...Object.fromEntries(fields.filter(([key]) => !key.includes('/'))),
        cultivation: Object.fromEntries(fields.filter(([key]) => key.includes('/'))),
        object: '/tests/actor#' + (side + 100), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: Number(fighting), busy: null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), learned: {}, temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0, weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { program: '/tests/sword', object: '/tests/sword#' + (side + 200),
            skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100, material: null } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

// Synthetic contract examples only; these are never written to a sample ledger or used as observations.
function record(condition = pick(), { index = 0, hit, damage, progress = 1, cost = 23 } = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 }); preparation.after = structuredClone(before[1]);
    }
    const raw = { kind: 'sample', condition_id: condition.id, index, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        command_accepted: accepted ? cost : 0, launches: [], refusals: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [], callbacks: [],
        elapsed: 0.01, reason: '', ...(preparation ? { preparation } : {}) };
    if (accepted) {
        hit ??= p.gate_expectation !== 'miss';
        raw.launches.push({ actor: before[0].object, skill, argument: 'xiao right' });
        raw.metrics[0].ability_launched = 1; raw.immediate[0].busy = hit ? 3 : 4;
        if (hit) {
            const ap = Math.trunc(p.actor.skills.finger / 2) + p.actor.skills[skill];
            damage ??= ap;
            const jing = Math.trunc(4 * damage / 3), wound = Math.trunc(damage / 3), gross = 3 * damage;
            raw.metrics[1] = { jing_cost: jing, eff_jing_cost: wound, neili_cost: gross,
                neili_recovery: Math.max(gross - p.target.properties.neili, 0) };
            raw.immediate[1].jing -= jing; raw.immediate[1].eff_jing -= wound;
            raw.immediate[1].neili = Math.max(p.target.properties.neili - gross, 0);
        }
        if (progress) raw.immediate[0].learned[skill] = progress;
    } else {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals.push({ actor: before[0].object, reason: raw.reason });
    }
    raw.after = structuredClone(raw.immediate);
    return { condition_id: condition.id, index, outcome: raw.outcome, reason: raw.reason, raw };
}
function errorRecord(condition = pick(), index = 0, reason = '原观察缺少字段\n') {
    return { condition_id: condition.id, index, outcome: 'error', reason,
        raw: { kind: 'sample', condition_id: condition.id, index, method: 'perform', outcome: 'error', reason } };
}
function freeze(value) {
    if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
    return value;
}

test('报告不改变17／720／34有序矩阵或源条目，逐条件仅用合成原件自检', () => {
    const smoke = taohuaXiaoConditions(catalog, { smoke: true });
    assert.equal(cases.length, 17); assert.equal(cases.reduce((sum, c) => sum + c.samples, 0), 720);
    assert.equal(smoke.reduce((sum, c) => sum + c.samples, 0), 34);
    assert.equal(digest(cases), 'e6852c55078ec1899c9981b3f259d6f2633e8f5d668ea4fb298cc3e37bd2539d');
    assert.equal(digest(smoke), 'fb35782bfa6fbeb886ddf1918d2db2555a63133a1d4205fd73630ac5d54590e4');
    for (const condition of cases) {
        const rows = [record(condition)], summary = taohuaXiaoReport(rows, condition);
        assert.deepEqual(summary.effects, taohuaXiaoEffects(rows, condition));
        assert.equal(summary.coverage.recorded, 1); assert.equal(summary.coverage.missing, condition.samples - 1);
        assert.match(taohuaXiaoMarkdown(summary), /桃花岛·弹指神通「啸沧海」/);
    }
});

test('原命令正成本1／23／476保留分布，受理不是成本求和也不是内力费用', () => {
    const condition = pick(), rows = [1, 23, 476].map((cost, index) => record(condition, { cost, index }));
    const summary = taohuaXiaoReport(rows, condition);
    assert.equal(summary.commands.known, 3); assert.equal(summary.commands.accepted, 3);
    assert.equal(summary.commands.execution_cost.mean, 500 / 3);
    assert.equal(summary.commands.accepted_execution_cost.min, 1);
    assert.equal(summary.commands.accepted_execution_cost.max, 476);
    assert.equal(summary.effects.hit.trials, 3); assert.equal(summary.effects.actor_neili_cost.mean, 0);
    const md = taohuaXiaoMarkdown(summary);
    assert.match(md, /正成本／受理 \| 3 \| 166\.667 /);
    assert.match(md, /施招者实际内力消耗 \| 受理（含失手） \| 0 \[0, 0\]；n=3/);
    assert.match(md, /不是技能内力费用、命中次数或固定布尔 1/);
});

test('命中率用受理分母；失手随机D未知，但已知伤害与费用为零', () => {
    const condition = pick(), rows = [record(condition, { damage: 301 }),
        record(condition, { index: 1, hit: false, progress: 0 })];
    const summary = taohuaXiaoReport(rows, condition), e = summary.effects;
    assert.equal(e.hit.trials, 2); assert.equal(e.hit.successes, 1); assert.equal(e.hit.rate, 0.5);
    assert.equal(e.misses, 1); assert.equal(e.damage_draw.mean, 301);
    assert.equal(e.damage_draw.n, 1); assert.equal(e.damage_draw.unknown, 1);
    assert.equal(e.jing_damage.mean, 401 / 2); assert.equal(e.jing_wound.mean, 100 / 2);
    assert.equal(e.target_neili_gross_cost.mean, 903 / 2); assert.equal(e.busy.mean, 3.5);
    assert.equal(e.learned_progress.rate, 0.5);
    const md = taohuaXiaoMarkdown(summary);
    assert.match(md, /\| 2 \| 1 \| 1 \| 50%（Wilson 95%/);
    assert.match(md, /目标精神毛损伤 \| 受理（含失手） \| 200\.5 /);
    assert.match(md, /目标有效精神创伤 \| 受理（含失手） \| 50 /);
    assert.match(md, /原随机量 D（由命中毛扣反推） \| 命中可还原；失手未知 \| 301 \[301, 301\]；n=1，未知=1/);
    assert.match(md, /忙乱 3／4 是原状态值，不是实测自然解除秒数/);
});

test('目标内力0／899／900分列毛扣、归零修正、净减少和剩余，不当作回内', () => {
    for (const initial of [0, 899, 900]) {
        const condition = pick('target-neili' + initial), summary = taohuaXiaoReport([record(condition)], condition);
        const e = summary.effects, md = taohuaXiaoMarkdown(summary);
        assert.equal(e.target_neili_gross_cost.mean, 900);
        assert.equal(e.target_neili_zero_correction.mean, 900 - initial);
        assert.equal(e.target_neili_net_loss.mean, initial); assert.equal(e.target_neili_remaining.mean, 0);
        assert.equal(e.actor_neili_cost.mean, 0);
        assert.ok(md.includes(`目标内力毛扣 | 受理（含失手） | 900 [900, 900]；n=1`));
        assert.ok(md.includes(`目标内力归零修正（原 recovery 计数） | 受理（含失手） | ${900 - initial} [`));
        assert.ok(md.includes(`目标内力净减少 | 受理（含失手） | ${initial} [`));
        assert.match(md, /不是治疗或回内/);
    }
});

test('九种原拒绝的0命令成本有实值，但效果与命中分母为空而不是零效果', () => {
    const rejected = cases.filter(c => c.parameters.expected === 'refused'); assert.equal(rejected.length, 9);
    for (const condition of rejected) {
        const row = record(condition), summary = taohuaXiaoReport([row], condition), md = taohuaXiaoMarkdown(summary);
        assert.equal(summary.coverage.accepted, 0); assert.equal(summary.coverage.refused, 1);
        assert.equal(summary.commands.refused_execution_cost.mean, 0);
        assert.equal(summary.effects.actor_neili_cost.mean, null); assert.equal(summary.effects.hit.rate, null);
        assert.equal(summary.effects.jing_damage.n, 0);
        assert.deepEqual(summary.refusals, [{ index: 0, reason: row.raw.reason }]);
        assert.match(md, /零成本／拒绝 \| 1 \| 0 \[0, 0\]；n=1/);
        assert.match(md, /未知（受理分母为0）/); assert.ok(md.includes('\\x1b[256D\\x1b[K'));
        assert.ok(md.includes('<br>')); assert.equal(md.includes('\x1b'), false);
    }
});

test('错误与缺样本分别保留；原错误中碰巧有成本也不补为已知费用', () => {
    const condition = pick(), error = errorRecord(condition, 2, '观察未完成 | `原值` <未知>\n');
    error.raw.command_accepted = 476;
    const rows = [record(condition), record(condition, { index: 1, hit: false, progress: 0 }), error];
    const summary = taohuaXiaoReport(rows, condition);
    assert.deepEqual(summary.coverage, { planned: 100, recorded: 3, accepted: 2, refused: 0,
        errors: 1, not_applicable: 0, missing: 97 });
    assert.equal(summary.commands.known, 2); assert.equal(summary.commands.unknown, 1);
    assert.equal(summary.commands.execution_cost.mean, 23); assert.equal(summary.effects.hit.rate, 0.5);
    assert.equal(summary.effects.unknown_effect_samples, 1);
    assert.deepEqual(summary.exceptional, [{ index: 2, outcome: 'error', reason: error.reason }]);
    const md = taohuaXiaoMarkdown(summary);
    assert.match(md, /\| 100 \| 3 \| 2 \| 0 \| 1 \| 0 \| 97 \|/);
    assert.ok(md.includes('观察未完成 \\| &#96;原值&#96; &lt;未知&gt;<br>'));
});

test('全错误或空集合不填零均值／零命中率，也不虚报720正式已完成', () => {
    const condition = pick();
    for (const rows of [[], [errorRecord(condition)]]) {
        const summary = taohuaXiaoReport(rows, condition);
        assert.equal(summary.commands.execution_cost.n, 0); assert.equal(summary.commands.execution_cost.mean, null);
        assert.equal(summary.effects.hit.trials, 0); assert.equal(summary.effects.hit.rate, null);
        assert.equal(summary.effects.damage_draw.mean, null); assert.equal(summary.effects.busy.mean, null);
        assert.equal(summary.coverage.missing, condition.samples - rows.length);
        const md = taohuaXiaoMarkdown(summary);
        assert.match(md, /未观察（n=0，未知=0）/); assert.match(md, /未知（受理分母为0）/);
    }
});

test('只读冻结condition，不依赖raw.parameters，原成本与原文不回写', () => {
    const condition = structuredClone(pick()), rows = [record(condition)];
    const original = JSON.stringify({ condition, rows });
    const base = taohuaXiaoReport(freeze(rows), freeze(condition));
    assert.equal(JSON.stringify({ condition, rows }), original);
    const withUntrusted = structuredClone(rows);
    withUntrusted[0].raw.parameters = { level: 9999, variant: '伪造', target: { properties: { neili: 0 } } };
    assert.deepEqual(taohuaXiaoReport(withUntrusted, condition), base);
    assert.equal(base.context.level, 200); assert.equal(base.context.target_neili, 10000);
    assert.equal(Object.hasOwn(rows[0].raw, 'parameters'), false);
});

test('受理／拒绝／错误都严格核外层与原件条件、编号、结果、原理由与入口', () => {
    const operations = [
        row => row.condition_id = 'foreign', row => delete row.condition_id,
        row => row.raw.condition_id = 'foreign', row => delete row.raw.condition_id,
        row => row.index = 1, row => delete row.index, row => row.index = '0', row => row.index = -1,
        row => row.index = 0.5, row => row.index = null, row => row.raw.index = 1,
        row => delete row.raw.index, row => row.raw.method = 'ordinary', row => delete row.raw.method,
        row => row.outcome = row.outcome === 'error' ? 'observed' : 'error',
        row => row.raw.outcome = row.raw.outcome === 'error' ? 'observed' : 'error',
        row => row.reason += '错', row => row.raw.reason += '错', row => delete row.reason,
        row => delete row.raw.reason, row => row.raw = null,
    ];
    for (const [condition, seed] of [[pick(), record()], [pick('no-grant'), record(pick('no-grant'))],
        [pick(), errorRecord()]]) {
        for (const operation of operations) {
            const row = structuredClone(seed); operation(row);
            assert.throws(() => taohuaXiaoReport([row], condition));
        }
    }
});

test('重复／越界／无理由错误与未声明not_applicable不进入分母', () => {
    const condition = pick(), seed = record();
    assert.throws(() => taohuaXiaoReport([seed, structuredClone(seed)], condition));
    for (const index of [condition.samples, Number.MAX_SAFE_INTEGER + 1]) {
        const row = record(condition); row.index = row.raw.index = index;
        assert.throws(() => taohuaXiaoReport([row], condition));
    }
    for (const reason of ['', ' \n', null, 0, undefined]) {
        const row = errorRecord(condition); row.reason = row.raw.reason = reason;
        assert.throws(() => taohuaXiaoReport([row], condition));
    }
    for (const outcome of ['not_applicable', 'unknown', 'success', '', null]) {
        const row = errorRecord(condition); row.outcome = row.raw.outcome = outcome;
        assert.throws(() => taohuaXiaoReport([row], condition));
    }
});

test('所有已知命令仍经原validator：成本缺失、虚构毛扣、费用或回调不能过报告', () => {
    const operations = [row => delete row.raw.command_accepted,
        row => row.raw.command_accepted = true, row => row.raw.command_accepted = 0,
        row => row.raw.command_accepted = 1.5,
        row => { row.raw.metrics[1].neili_cost = 0; row.raw.metrics[1].neili_recovery = 0; },
        row => { row.raw.metrics[0].neili_cost = 800; row.raw.metrics[0].neili_recovery = 800; },
        row => { row.raw.metrics[1].jing_cost++; row.raw.metrics[1].jing_recovery = 1; },
        row => row.raw.callbacks.push({ event: 'fake' }),
        row => row.raw.directs = [{}], row => row.raw.after[0].busy--];
    const condition = pick('target-neili0');
    for (const operation of operations) {
        const row = record(condition); operation(row);
        assert.throws(() => taohuaXiaoReport([row], condition));
    }
    const refused = pick('no-grant'), row = record(refused); row.raw.command_accepted = 23;
    assert.throws(() => taohuaXiaoReport([row], refused));
});

test('冻结条件入口／分组／窗口与计划格式不符时空集合也拒绝', () => {
    const operations = [c => c.id = '', c => c.method = 'ordinary', c => c.samples = 0,
        c => c.samples = 1.5, c => c.parameters.collection_group = 'foreign',
        c => c.parameters.skill = 'fake', c => c.parameters.ability = 'ding',
        c => c.parameters.usage = 'sword', c => c.parameters.action = 'perform finger.xiao',
        c => c.parameters.observation = 'natural', c => c.parameters.observe_seconds = 6,
        c => c.parameters.expected = 'not_applicable', c => c.parameters.not_applicable = '伪造',
        c => c.parameters.actor.properties.neili = null, c => delete c.parameters.target.properties.neili];
    for (const operation of operations) {
        const condition = structuredClone(pick()); operation(condition);
        assert.throws(() => taohuaXiaoReport([], condition));
    }
});

test('Markdown拒绝改坏分母、未知或覆盖账的摘要，不将缺值格式化成0', () => {
    const baseline = taohuaXiaoReport([record(), record(pick(), { index: 1, hit: false }), errorRecord(pick(), 2)], pick());
    const operations = [s => s.coverage.missing++, s => s.coverage.errors = 0,
        s => s.commands.known++, s => s.commands.unknown = 0,
        s => s.commands.execution_cost.n++, s => s.commands.execution_cost.mean = null,
        s => s.effects.hit.trials++, s => s.effects.hit.rate = 1,
        s => s.effects.misses = 0, s => s.effects.damage_draw.unknown = 0,
        s => s.effects.jing_damage.n++, s => s.effects.actor_neili_cost.unknown = 1,
        s => s.effects.learned_progress.trials++, s => s.exceptional = [],
        s => s.context.observe_seconds = 6, s => s.effects.jing_wound.mean = NaN];
    for (const operation of operations) {
        const summary = structuredClone(baseline); operation(summary);
        assert.throws(() => taohuaXiaoMarkdown(summary));
    }
    const empty = taohuaXiaoReport([], pick()); empty.effects.actor_neili_cost.mean = 0;
    assert.throws(() => taohuaXiaoMarkdown(empty));
});

test('Markdown转义表格与标签不改JSON原文，保留换行和终端标记', () => {
    const condition = structuredClone(pick());
    condition.parameters.qualification_note = '资格 | `说明` <b>&\n下一行';
    const row = errorRecord(condition, 0, '\x1b[31m原错 | `值` <b>&\r\n下一行');
    const summary = taohuaXiaoReport([row], condition), before = JSON.stringify(summary);
    const md = taohuaXiaoMarkdown(freeze(summary));
    assert.ok(md.includes('资格 \\| &#96;说明&#96; &lt;b&gt;&amp;<br>下一行'));
    assert.ok(md.includes('\\x1b[31m原错 \\| &#96;值&#96; &lt;b&gt;&amp;<br>下一行'));
    assert.equal(JSON.stringify(summary), before); assert.equal(md.includes('\r'), false);
    assert.ok(md.endsWith('\n')); assert.equal(summary.exceptional[0].reason, row.reason);
});
