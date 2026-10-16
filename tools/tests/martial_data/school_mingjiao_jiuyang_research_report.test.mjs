// Pure synthetic evidence only. No native collection, file writes or imports of another test module.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { digest } from './ledger.mjs';
import { mingjiaoJiuyangResearchConditions } from './school_mingjiao_jiuyang_research_cases.mjs';
import { mingjiaoJiuyangResearchReport as report, mingjiaoJiuyangResearchEffects as effects,
    mingjiaoJiuyangResearchMarkdown as markdown } from './school_mingjiao_jiuyang_research_report.mjs';

const root = new URL('../../../', import.meta.url), path = 'kungfu/skill/jiuyang-shengong.c', skill = 'jiuyang-shengong';
const read = p => readFileSync(new URL(p, root)), hash = b => createHash('sha256').update(b).digest('hex');
const catalog = { skills: [{ path, sha256: hash(read(path)) }] };
const formalConditions = mingjiaoJiuyangResearchConditions(catalog, read);
const smokeConditions = mingjiaoJiuyangResearchConditions(catalog, read, { smoke: true });
const copy = v => structuredClone(v), epoch = 1791975600;
const pick = (variant, smoke = false) => (smoke ? smokeConditions : formalConditions).find(c => c.parameters.variant === variant);
function manifest(conditions = formalConditions, smoke = false) {
    const entries = [{ id: path, path, role: 'file', sha256: catalog.skills[0].sha256 }];
    const identity = { source_fingerprint: digest({ synthetic: true }), dictionary_sha256: null,
        entries_sha256: digest(entries), execution: { collection: 'school-combat', smoke }, conditions: copy(conditions) };
    return { format: 1, kind: 'martial_data_series', identity, fingerprint: digest(identity), entries };
}
const formal = manifest(), smoke = manifest(smokeConditions, true);
const reseal = m => { m.identity.entries_sha256 = digest(m.entries); m.fingerprint = digest(m.identity); };
function row(c, raw, m = formal) {
    return { format: 1, fingerprint: m.fingerprint, condition_id: c.id, condition_sha256: digest(c),
        index: raw.index, outcome: raw.outcome, reason: raw.reason, raw, raw_sha256: digest(raw) };
}
function diagnostic(c, index = 0, outcome = 'error', reason = '原诊断', m = formal) {
    return row(c, { kind: 'sample', method: 'research', condition_id: c.id, index, outcome, reason, elapsed: 0.1 }, m);
}
function snapshot(config, side) {
    const p = config.properties, s = config.skills;
    const a = { object: '/tests/actor#' + (side + 71), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null, fighting_opponent: 0,
        conditions: null, skills: copy(s), mappings: copy(config.mappings), preparations: {}, learned: {},
        temp: { user_setup: 1, apply: { armor: 100 } }, cultivation: { sex: null,
            'immune/poison': null, 'wudang-jiuyang': null, 'special_skill/divine': null },
        effective_skills: Object.fromEntries(Object.entries(s).map(([key, value]) => [key,
            Math.trunc(value / 2) + (s[config.mappings[key]] ?? 0)])),
        craze: 0, max_craze: 5000, force_attribute: null, weapon: 'none', weapon_details: {},
        handing: 'none', handing_details: {}, secondary_weapon: 'none', secondary_weapon_details: {},
        weapon_damage: 0, weapon_flag: 0, ammunition: 0 };
    for (const [key, value] of Object.entries(p)) {
        if (['name', 'race'].includes(key)) continue;
        (key.includes('/') || ['class', 'character', 'reborn', 'doing', 'breakup'].includes(key) ? a.cultivation : a)[key] = value;
    }
    for (const [key, basic] of [['str', 'unarmed'], ['con', 'force'], ['dex', 'dodge'], ['int', 'literate']])
        a['effective_' + key] = p[key] + Math.trunc((s[basic] ?? 0) / 10);
    return a;
}

// Independent literal fixture for three original branches, not a production predictor.
function raw(c, index = 0, cost = 23, cross = false) {
    const p = c.parameters, same = p.variant === 'same-second-jing24', partial = p.variant === 'jing51-times3';
    assert.ok(same || partial || /^level(180|200|400|800)$/.test(p.variant));
    const before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const r = { kind: 'sample', method: 'research', condition_id: c.id, index, elapsed: 0.04,
        before, research_room: { no_fight: null, pigging: null, research_improve: null },
        research_steps: [], skill_messages: [], command_accepted: 0 };
    for (const key of ['actions', 'attacks', 'directs', 'passives', 'defenses', 'dodge_checks',
        'launches', 'refusals', 'interfaces', 'callbacks', 'dropped', 'terminals', 'background_stopped']) r[key] = [];
    let state = before, metrics = [{}, {}];
    const defaultNotice = '依你目前的能力，没有办法研究这种技能。\n';
    const sameNotice = '你刚刚才研究过（如果你要连续研究，可以指明研究的次数）。\n';
    for (const [i, action] of p.actions.entries()) {
        const reject = same && i === 1 && !cross, completed = same ? 0 : partial ? 2 : 1;
        const jingCost = same ? (i ? 0 : 24) : partial ? 51 : 25;
        const step = { action, accepted: reject ? 0 : cost, entry_actor: before[0].object, return_actor: before[0].object,
            before: copy(state), after: copy(state), metrics_before: copy(metrics), metrics_after: copy(metrics),
            reason: reject ? '\x1b[256D\x1b[K' + sameNotice : '', wall_time_before: epoch + Number(i > 0 && cross),
            wall_time_after: epoch + Number(i > 0 && cross), messages: [] };
        const a = step.after[0]; a.jing -= jingCost; a.learned_points += completed;
        a.temp.notify_fail = reject ? sameNotice : defaultNotice;
        if (!reject) a.temp.time = { research: step.wall_time_before };
        if (completed) a.learned[skill] = partial ? 8 : 1;
        if (jingCost) step.metrics_after[0].jing_cost = (metrics[0].jing_cost ?? 0) + jingCost;
        if (!reject) {
            step.messages.push({ side: 0, type: 'write', text: `你开始研究${partial ? '三' : '一'}次有关「九阳神功」的奥秘。\n` },
                { side: 1, type: 'vision', text: '试侠在冥神思索。\n' });
            step.messages.push({ side: 0, type: 'write', text: completed
                ? '你研究了一会，似乎对「九阳神功」有些新的领悟。\n' : '你今天太累了，结果什么也没有研究成。\n' });
            if (partial) step.messages.push({ side: 0, type: 'write', text: '你觉得太累了，研究了二次后只好停下来休息。\n' });
        }
        r.research_steps.push(step); r.skill_messages.push(...copy(step.messages)); r.command_accepted += step.accepted;
        state = step.after; metrics = step.metrics_after;
    }
    r.immediate = copy(state); r.after = copy(state); r.metrics = copy(metrics);
    r.outcome = same ? 'refused' : 'observed'; r.reason = same ? state[0].temp.notify_fail : '';
    return r;
}

test('pure preparation: all25 fixed conditions support unknown summaries without fake observations', () => {
    assert.equal(formalConditions.length, 25); assert.equal(formalConditions.reduce((n, c) => n + c.samples, 0), 1128);
    assert.equal(smokeConditions.reduce((n, c) => n + c.samples, 0), 50);
    for (const c of formalConditions) {
        const r = report([], c, formal); assert.equal(r.effects.known, null); assert.equal(r.effects.complete_plan, null);
        assert.equal(r.coverage.complete, false); assert.equal(r.coverage.missing, c.samples);
        assert.match(markdown(r, formal, []), /研究次数、费用与熟练进展：未知/);
    }
});

test('hand-written partial data: 2 iterations/8 progress/50 fee+SET1 and 23 cost, not75/3/expected data', () => {
    const c = pick('jing51-times3'), rows = [row(c, raw(c))], r = report(rows, c, formal), k = r.effects.known;
    assert.deepEqual([k.commands, k.commands_accepted, k.command_cost, k.completed, k.learned_points_used,
        k.normal_jing_fee, k.jing_writeoff, k.jing_cost, k.learned_net, k.source_derived_gross, k.skill_upgrades],
    [1, 1, 23, 2, 2, 50, 1, 51, 8, 8, 0]);
    assert.equal(r.coverage.missing, 99); assert.equal(r.effects.complete_plan, null);
    assert.deepEqual(effects(rows, c, formal).known, k);
    assert.equal(k.potential_field_cost, 0); assert.deepEqual(k.hidden_random_input, { unobserved: 1, not_called: 0 });
    assert.match(markdown(r, formal, rows), /\| 1 \| 1\/0 \| 23 \| 2 \| 50 \| 1 \| 51 \|/);
});

test('same-second matched refusals are fully covered; commands4/accepted2/cost499/writeoff48 remain distinct', () => {
    const c = pick('same-second-jing24'), rows = [row(c, raw(c, 1, 476)), row(c, raw(c, 0, 23))], r = report(rows, c, formal);
    assert.equal(r.coverage.complete, true); assert.equal(r.coverage.observed, 0); assert.equal(r.coverage.refused, 2);
    assert.deepEqual([r.effects.known.commands, r.effects.known.commands_accepted, r.effects.known.commands_refused,
        r.effects.known.command_cost, r.effects.known.completed, r.effects.known.jing_writeoff], [4, 2, 2, 499, 0, 48]);
    assert.deepEqual(r.effects.known.same_second, { trials: 2, refused: 2 });
    assert.deepEqual(r.effects.complete_plan, r.effects.known); assert.deepEqual(r.records.map(v => v.index), [0, 1]);
});

test('whole handwritten Chinese Markdown golden: matched original refusals, not fabricated research success', () => {
    const c = pick('same-second-jing24'), rows = [row(c, raw(c, 0, 23)), row(c, raw(c, 1, 476))];
    const r = report(rows, c, formal);
    const golden = `### 九阳研究（正式）：school-mingjiao-research-jiuyang-same-second-jing24

| 条件 | 计划/记录 | 有进展/无进展 | 诊断 | 匹配/未匹配 | 缺样本 |
| --- | --- | --- | --- | --- | --- |
| same-second-jing24 | 2/2 | 0/2 | 0 | 2/0 | 0 |

仅为该有限正式条件，不代表完整修养或自然养成。
原执行成本、命令受理次数与实际完成遍数分列；potential 字段不扣，使用量来自 learned_points 增量。
跨秒记录保留真实费用与命令事实，但不计同秒匹配；未匹配、诊断或缺样本都不能完成本条件。

| 已知命令 | 受理/拒绝 | 原执行成本 | 实际完成 | 正常精神费 | SET 清零 | 精神毛扣 |
| --- | --- | --- | --- | --- | --- | --- |
| 4 | 2/2 | 499 | 0 | 0 | 48 | 48 |

| potential 字段扣除 | 已用潜能增量 | 净熟练 | 源码推导毛熟练 | 升级 | 隐藏随机输入 |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 0 | 0 | 未观察 0；未调用 2 |

| 槽位 | 原结果 | 条件匹配 | 命令/受理 | 完成遍数 | 正常费/清零 | 净熟练 | 同秒状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | refused | 是 | 2/1 | 0 | 0/24 | 0 | met |
| 1 | refused | 是 | 2/1 | 0 | 0/24 | 0 | met |

| 槽位/步骤 | 原命令 | 原成本 | 原时钟括 | 原研究时间：前→后 |
| --- | --- | --- | --- | --- |
| 0/0 | research jiuyang-shengong 1 | 23 | 1791975600…1791975600 | 未写入→1791975600 |
| 0/1 | research jiuyang-shengong 1 | 0 | 1791975600…1791975600 | 1791975600→1791975600 |
| 1/0 | research jiuyang-shengong 1 | 476 | 1791975600…1791975600 | 未写入→1791975600 |
| 1/1 | research jiuyang-shengong 1 | 0 | 1791975600…1791975600 | 1791975600→1791975600 |

完整计划汇总：已匹配，费用与进展均有已验证记录。

毛熟练仅在此无升级窗口等于净熟练；随机输入未观察，源码支持范围不是强选随机或实测抽签。
本纯消费者不证明原始日志、驱动、源副本或真实采样已验收；learned 快照的空映射不证明底层原始 null。
冻结来源 139 份；摘要 a5b3c385cafed6781b4f83faef0205d6c1c7187f111db8502d61eb74afb464fe。
系列指纹 ${formal.fingerprint}；模式 正式。`;
    assert.equal(markdown(r, formal, rows), golden);
});

test('cross-second preserves actual known cost but never matches or completes same-second coverage', () => {
    const c = pick('same-second-jing24'), rows = [row(c, raw(c, 0, 23)), row(c, raw(c, 1, 476, true))], r = report(rows, c, formal);
    assert.deepEqual([r.coverage.matched, r.coverage.unmatched, r.coverage.complete], [1, 1, false]);
    assert.equal(r.effects.known.command_cost, 975); assert.equal(r.effects.known.commands_accepted, 3);
    assert.equal(r.effects.known.jing_cost, 48); assert.equal(r.effects.matched_known.command_cost, 23);
    assert.equal(r.effects.complete_plan, null); assert.deepEqual(r.effects.known.same_second, { trials: 1, refused: 1 });
    const only = report([rows[1]], c, formal); assert.equal(only.effects.matched_known, null);
    assert.deepEqual(only.effects.known.same_second, { trials: null, refused: null });
    assert.match(markdown(r, formal, rows), /完整计划汇总：未知/);
});

test('diagnostic/NA/partial use unknown complete_plan and retain actual original reasons', () => {
    const c = pick('same-second-jing24'), rows = [diagnostic(c), diagnostic(c, 1, 'not_applicable', '<坏>|`原话`\n')];
    const r = report(rows, c, formal); assert.equal(r.effects.known, null); assert.equal(r.effects.complete_plan, null);
    assert.deepEqual([r.coverage.error, r.coverage.not_applicable, r.coverage.unknown, r.coverage.missing], [1, 1, 2, 0]);
    assert.match(markdown(r, formal, rows), /&lt;坏&gt;\\\|&#96;原话&#96;<br>/);
    const partial = report([row(c, raw(c)), rows[1]], c, formal);
    assert.equal(partial.effects.known.jing_writeoff, 24); assert.equal(partial.effects.complete_plan, null);
});

test('mode needs manifest binding even for equal2 counts; entry must be unique and source accurate', () => {
    const c = pick('same-second-jing24', true), rows = [row(c, raw(c), smoke)], r = report(rows, c, smoke);
    assert.equal(r.series.smoke, true); assert.match(markdown(r, smoke, rows), /仅为烟雾记录/);
    assert.throws(() => report(rows, c, formal)); r.series.smoke = false; assert.throws(() => markdown(r, smoke, rows));
    for (const edit of [m => { m.entries.push(copy(m.entries[0])); }, m => { m.entries[0].sha256 = '0'.repeat(64); },
        m => { m.identity.conditions.push(copy(c)); }, m => { m.identity.execution.smoke = 0; }]) {
        const m = copy(smoke); edit(m); reseal(m); assert.throws(() => report([], c, m));
    }
});

test('formal100 cannot shrink to2 or be relabeled smoke under a resealed formal manifest', () => {
    for (const relabel of [false, true]) {
        const c = copy(pick('level200')); c.samples = 2;
        if (relabel) c.parameters.run_mode = 'smoke';
        const m = manifest([c], false), rows = [0, 1].map(i => row(c, raw(c, i), m));
        assert.throws(() => report(rows, c, m), relabel ? /run mode must match original manifest/ : /samples must match run mode/);
        const s = pick('level200', true), smokeRows = [0, 1].map(i => row(s, raw(s, i), smoke));
        const forged = copy(report(smokeRows, s, smoke));
        forged.condition = copy(c); forged.series = { fingerprint: m.fingerprint, smoke: false };
        assert.throws(() => markdown(forged, m, rows));
    }
});

test('a consistently resealed manifest boolean cannot relabel either mode, even with equal2 counts', () => {
    for (const useSmoke of [false, true]) {
        const c = pick('same-second-jing24', useSmoke), original = useSmoke ? smoke : formal;
        const m = copy(original); m.identity.execution.smoke = !useSmoke; reseal(m);
        const rows = [0, 1].map(i => row(c, raw(c, i), m));
        assert.throws(() => report(rows, c, m), /run mode must match original manifest/);
        const originalRows = [0, 1].map(i => row(c, raw(c, i), original));
        const forged = copy(report(originalRows, c, original));
        forged.series = { fingerprint: m.fingerprint, smoke: !useSmoke };
        assert.throws(() => markdown(forged, m, rows), /run mode must match original manifest/);
    }
});

test('valid formal100 and smoke2 complete separately; deterministic2 remains correctly labeled in both modes', () => {
    for (const useSmoke of [false, true]) {
        for (const variant of ['level200', 'same-second-jing24']) {
            const c = pick(variant, useSmoke), m = useSmoke ? smoke : formal;
            const rows = Array.from({ length: c.samples }, (_, i) => row(c, raw(c, i), m));
            const r = report(rows, c, m);
            assert.equal(r.coverage.complete, true); assert.equal(r.coverage.recorded, c.samples);
            assert.equal(r.series.smoke, useSmoke);
            assert.match(markdown(r, m, rows), useSmoke ? /九阳研究（烟雾）/ : /九阳研究（正式）/);
        }
    }
});

test('ledger row hashes/slots/condition identity strict; no missing fields or coherent raw forgery', () => {
    const c = pick('level200'), good = row(c, raw(c));
    for (const key of Object.keys(good)) { const bad = copy(good); delete bad[key]; assert.throws(() => report([bad], c, formal)); }
    for (const edit of [r => { r.index = null; }, r => { r.index = -1; }, r => { r.index = c.samples; },
        r => { r.index = 0.5; }, r => { r.condition_sha256 = '0'.repeat(64); }, r => { r.fingerprint = smoke.fingerprint; },
        r => { r.raw_sha256 = '0'.repeat(64); }, r => { r.reason = 'changed'; }]) {
        const bad = copy(good); edit(bad); assert.throws(() => report([bad], c, formal));
    }
    assert.throws(() => report([good, good], c, formal));
    const bad = copy(good); bad.raw.research_steps[0].after[0].jing--;
    bad.raw_sha256 = digest(bad.raw); assert.throws(() => report([bad], c, formal));
});

test('MD requires original rows and rejects coherent cost/matched/complete rewrites', () => {
    const c = pick('same-second-jing24'), rows = [row(c, raw(c, 0, 23, true))], r = report(rows, c, formal);
    assert.throws(() => markdown(r, formal)); assert.throws(() => markdown(r, undefined, rows));
    for (const edit of [r => { r.effects.known.command_cost++; }, r => { r.effects.complete_plan = copy(r.effects.known); },
        r => { r.coverage.unmatched = 0; r.coverage.matched = 1; r.records[0].observation.condition_matched = true; },
        r => { r.records[0].command_steps[1].timestamp_after.value--; }]) {
        const changed = copy(r); edit(changed); assert.throws(() => markdown(changed, formal, rows));
    }
});

test('original integer cost overflow rejected, count is not cost, and all inputs stay unchanged', () => {
    const c = pick('same-second-jing24'), rows = [row(c, raw(c, 0, Number.MAX_SAFE_INTEGER)), row(c, raw(c, 1, 1))];
    assert.throws(() => report(rows, c, formal));
    const normal = [row(c, raw(c))], before = copy({ normal, c, formal }), r = report(normal, c, formal);
    const rb = copy(r); markdown(r, formal, normal); assert.deepEqual(r, rb);
    r.condition.parameters.actor.properties.int = 99; r.records[0].observation.command_cost = 0;
    assert.deepEqual({ normal, c, formal }, before);
});
