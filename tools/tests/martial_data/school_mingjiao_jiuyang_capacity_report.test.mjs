// Hand-built synthetic ledger/manifest fixtures only. No native samples or files are written.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { digest } from './ledger.mjs';
import { mingjiaoJiuyangCapacityConditions } from './school_mingjiao_jiuyang_capacity_cases.mjs';
import { mingjiaoJiuyangCapacityReport, mingjiaoJiuyangCapacityEffects,
    mingjiaoJiuyangCapacityMarkdown } from './school_mingjiao_jiuyang_capacity_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const source = path => readFileSync(resolve(root, path));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const main = 'kungfu/skill/jiuyang-shengong.c';
const catalog = { skills: [{ path: main, sha256: sha(source(main)) }] };
const conditions = mingjiaoJiuyangCapacityConditions(catalog, source);
const copy = value => structuredClone(value);
const selected = (variant, ability = 'query_neili_limit') => conditions.find(c =>
    c.parameters.variant === variant && c.parameters.ability === ability);
const baseline = selected('level200');

// Independent literal anchors, not copied from parameters.expected_return.
function originalValue(p) {
    if (p.ability === 'query_neili_improve') return { level200: 750, level400: 3000, level800: 12000 }[p.variant];
    if (p.variant === 'owned-force1000') return p.ability === 'query_neili_limit' ? 23000 : 3750;
    return { level200: 3750, level400: 9000, level800: 24000, improve10: 4125, breakup: 5250,
        mystery: 4350, guimai: 4312, 'bonze-shaolin': 4250, 'bonze-mingjiao': 3750 }[p.variant];
}

function snapshot(config, side) {
    const p = config.properties, s = config.skills;
    const state = { object: '/tests/actor#' + (side + 31), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        busy: null, conditions: null, fighting_opponent: 0, skills: copy(s),
        mappings: copy(config.mappings), preparations: {}, learned: {},
        temp: { user_setup: 1, apply: { armor: 100 } },
        cultivation: { sex: null, 'immune/poison': null, 'wudang-jiuyang': null, 'special_skill/divine': null },
        effective_skills: Object.fromEntries(Object.entries(s).map(([key, value]) =>
            [key, Math.floor(value / 2) + (key === 'force' ? s['jiuyang-shengong'] : 0)])),
        effective_str: p.str + s.unarmed / 10, effective_con: p.con + s.force / 10,
        effective_int: p.int, effective_dex: p.dex + s.dodge / 10,
        craze: 0, max_craze: 5000, force_attribute: null, age: 25,
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {},
        weapon_damage: 0, weapon_flag: 0, ammunition: 0,
    };
    for (const [key, value] of Object.entries(p)) {
        if (['name', 'race'].includes(key)) continue;
        if (key.includes('/') || ['class', 'character', 'reborn', 'doing', 'breakup'].includes(key))
            state.cultivation[key] = value;
        else state[key] = value;
    }
    return state;
}
function raw(condition, index = 0, cost = 23) {
    const p = condition.parameters, before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const value = originalValue(p), owner = p.ability === 'query_neili_improve'
        ? '/kungfu/skill/jiuyang-shengong' : '/clone/user/user';
    return { kind: 'sample', condition_id: condition.id, method: 'interface', index,
        outcome: 'observed', reason: '', elapsed: 0.01, command_accepted: cost,
        before, immediate: copy(before), after: copy(before), metrics: [{}, {}],
        actions: [], attacks: [], directs: [], passives: [], defenses: [], dodge_checks: [],
        launches: [], refusals: [], callbacks: [], dropped: [], terminals: [], background_stopped: [], skill_messages: [],
        interfaces: [{ object: p.interface.object, function: p.ability, result: value, implemented_by: owner }],
        interface_steps: [{ command: 'test_interface', entry_actor: before[0].object, return_actor: before[0].object,
            before: copy(before[0]), after: copy(before[0]), result: value, implemented_by: owner, reason: '', messages: [] }] };
}
function manifest(smoke = false) {
    const entries = [{ id: main, path: main, role: 'file', sha256: catalog.skills[0].sha256 }];
    const identity = { source_fingerprint: digest({ explicitly_synthetic: 'source' }), dictionary_sha256: null,
        entries_sha256: digest(entries), execution: { collection: 'school-combat', smoke }, conditions: copy(conditions) };
    return { format: 1, kind: 'martial_data_series', identity, fingerprint: digest(identity), entries };
}
const formal = manifest(), smoke = manifest(true);
function row(condition, original, series = formal) {
    return { format: 1, fingerprint: series.fingerprint, condition_id: condition.id,
        condition_sha256: digest(condition), index: original.index, outcome: original.outcome,
        reason: original.reason, raw: original, raw_sha256: digest(original), recorded: '2026-10-14T00:00:00.000Z' };
}
const samples = (c = baseline, series = formal) => [row(c, raw(c, 0, 23), series), row(c, raw(c, 1, 476), series)];
function diagnostic(c, index, outcome = 'error', reason = '原诊断', series = formal) {
    return row(c, { kind: 'sample', condition_id: c.id, method: 'interface', index,
        outcome, elapsed: 0.2, reason }, series);
}
const rehash = r => { r.raw_sha256 = digest(r.raw); };
const reseal = m => { m.identity.entries_sha256 = digest(m.entries); m.fingerprint = digest(m.identity); };

test('all 23 source-bound synthetic conditions retain independent values, owners and 2/499 command accounting', () => {
    assert.equal(conditions.length, 23);
    assert.equal(sha(JSON.stringify(conditions)), 'c63b87553793c1f53973f277c3213299ecf26ed6e221c378029aba32ad523cdc');
    for (const c of conditions) {
        const rows = samples(c), before = copy({ c, rows, formal });
        const report = mingjiaoJiuyangCapacityReport(rows, c, formal), e = report.effects;
        assert.deepEqual(report.coverage, { planned: 2, recorded: 2, observed: 2, error: 0,
            not_applicable: 0, unknown: 0, missing: 0, missing_indices: [], complete: true });
        assert.deepEqual(e.known, { commands: 2, commands_accepted: 2, command_cost: 499,
            interface_calls: 2, interface_values: { [originalValue(c.parameters)]: 2 },
            implemented_by: { [c.parameters.ability === 'query_neili_improve'
                ? '/kungfu/skill/jiuyang-shengong' : '/clone/user/user']: 2 },
            actor_unchanged: 2, target_unchanged: 2 });
        assert.deepEqual(e.complete_plan, e.known); assert.notEqual(e.complete_plan, e.known);
        assert.deepEqual(report.steps.map(s => s.command_cost), [23, 476]);
        assert.ok(mingjiaoJiuyangCapacityMarkdown(report, formal).includes('正执行成本 499'));
        const effects = mingjiaoJiuyangCapacityEffects(rows, c, formal);
        assert.deepEqual(effects.series, { fingerprint: formal.fingerprint, smoke: false });
        assert.deepEqual(effects.coverage, report.coverage); assert.deepEqual(effects.known, e.known);
        assert.deepEqual({ c, rows, formal }, before);
    }
});

test('empty/diagnostic/partial records keep capacities and complete-plan totals unknown', () => {
    const empty = mingjiaoJiuyangCapacityReport([], baseline, formal);
    assert.deepEqual(empty.effects, { known: null, complete_plan: null });
    assert.deepEqual(empty.coverage.missing_indices, [0, 1]); assert.equal(empty.coverage.missing, 2);
    const emptyMd = mingjiaoJiuyangCapacityMarkdown(empty, formal);
    assert.match(emptyMd, /容量返回.*未知/); assert.doesNotMatch(emptyMd, /3750/);
    assert.match(emptyMd, /缺少原件编号：0、1/);
    const rows = [diagnostic(baseline, 0), diagnostic(baseline, 1, 'not_applicable')];
    const unknown = mingjiaoJiuyangCapacityReport(rows, baseline, formal);
    assert.deepEqual(unknown.effects, { known: null, complete_plan: null });
    assert.deepEqual([unknown.coverage.recorded, unknown.coverage.observed, unknown.coverage.error,
        unknown.coverage.not_applicable, unknown.coverage.unknown, unknown.coverage.missing, unknown.coverage.complete], [2, 0, 1, 1, 2, 0, false]);
    assert.doesNotMatch(mingjiaoJiuyangCapacityMarkdown(unknown, formal), /3750/);
    for (const partial of [[samples()[0]], [samples()[0], rows[1]]]) {
        const r = mingjiaoJiuyangCapacityReport(partial, baseline, formal);
        assert.equal(r.effects.known.command_cost, 23); assert.equal(r.effects.known.commands_accepted, 1);
        assert.deepEqual(r.effects.known.interface_values, { 3750: 1 }); assert.equal(r.effects.complete_plan, null);
        assert.equal(r.coverage.complete, false); assert.match(mingjiaoJiuyangCapacityMarkdown(r, formal), /完整计划汇总：未知/);
    }
    const oneError = mingjiaoJiuyangCapacityEffects([rows[0]], baseline, formal);
    assert.equal(oneError.known, null); assert.equal(oneError.coverage.unknown, 1); assert.equal(oneError.coverage.missing, 1);
});

test('smoke/formal uses the original manifest boolean and fingerprints, not equal sample counts', () => {
    assert.notEqual(smoke.fingerprint, formal.fingerprint);
    assert.equal(smoke.identity.conditions[0].samples, formal.identity.conditions[0].samples);
    const report = mingjiaoJiuyangCapacityReport(samples(baseline, smoke), baseline, smoke);
    assert.equal(report.series.smoke, true);
    assert.match(mingjiaoJiuyangCapacityMarkdown(report, smoke), /仅为烟雾验证，不能并入正式容量统计/);
    assert.match(mingjiaoJiuyangCapacityMarkdown(report, smoke), /烟雾成功查询 2 次/);
    assert.equal(mingjiaoJiuyangCapacityEffects(samples(baseline, smoke), baseline, smoke).series.smoke, true);
    assert.throws(() => mingjiaoJiuyangCapacityReport(samples(), baseline));
    assert.throws(() => mingjiaoJiuyangCapacityReport(samples(baseline, smoke), baseline, formal));
    assert.throws(() => mingjiaoJiuyangCapacityReport([samples()[0], samples(baseline, smoke)[1]], baseline, formal));
    for (const value of [null, 0, 1, undefined, 'false']) {
        const m = copy(formal); m.identity.execution.smoke = value;
        if (value !== undefined) reseal(m);
        assert.throws(() => mingjiaoJiuyangCapacityReport([], baseline, m));
    }
    const m = copy(formal); m.identity.execution.smoke = true;
    assert.throws(() => mingjiaoJiuyangCapacityReport([], baseline, m));
});

test('Markdown requires the original manifest and cannot relabel a smoke summary as formal', () => {
    for (const rows of [[], samples(baseline, smoke)]) {
        const report = mingjiaoJiuyangCapacityReport(rows, baseline, smoke);
        assert.match(mingjiaoJiuyangCapacityMarkdown(report, smoke), /九阳容量查询（烟雾）/);
        assert.throws(() => mingjiaoJiuyangCapacityMarkdown(report));
        assert.throws(() => mingjiaoJiuyangCapacityMarkdown(report, null));
        assert.throws(() => mingjiaoJiuyangCapacityMarkdown(report, formal));
        const relabelled = copy(report); relabelled.series.smoke = false;
        assert.equal(relabelled.series.fingerprint, report.series.fingerprint);
        assert.throws(() => mingjiaoJiuyangCapacityMarkdown(relabelled, smoke), /original series/);
        const m = copy(smoke); m.identity.execution.smoke = false;
        assert.throws(() => mingjiaoJiuyangCapacityMarkdown(relabelled, m));
        reseal(m); assert.notEqual(m.fingerprint, smoke.fingerprint);
        assert.throws(() => mingjiaoJiuyangCapacityMarkdown(relabelled, m), /original series/);
        const sameMode = copy(smoke); sameMode.identity.source_fingerprint = '0'.repeat(64); reseal(sameMode);
        assert.throws(() => mingjiaoJiuyangCapacityMarkdown(report, sameMode), /original series/);
    }
});

test('related entry ID must be unique even when conflicting or identical duplicates are resealed', () => {
    for (const edit of [e => { e.sha256 = '0'.repeat(64); }, e => { e.path = 'clone/user/user.c'; }, () => {}]) {
        for (const first of [false, true]) {
            const m = copy(formal), duplicate = copy(m.entries[0]); edit(duplicate);
            if (first) m.entries.unshift(duplicate); else m.entries.push(duplicate);
            reseal(m); assert.notEqual(m.fingerprint, formal.fingerprint);
            assert.equal(m.identity.entries_sha256, digest(m.entries)); assert.equal(m.fingerprint, digest(m.identity));
            assert.throws(() => mingjiaoJiuyangCapacityReport([], baseline, m), /entry must be unique/);
            assert.throws(() => mingjiaoJiuyangCapacityEffects([], baseline, m), /entry must be unique/);
            const report = mingjiaoJiuyangCapacityReport([], baseline, formal);
            report.series = { fingerprint: m.fingerprint, smoke: false };
            assert.throws(() => mingjiaoJiuyangCapacityMarkdown(report, m), /entry must be unique/);
        }
    }
});

test('series/condition/source identity rejects resealed wrong context and mixed or duplicated slots', () => {
    for (const edit of [m => { m.format = 2; }, m => { m.kind = 'unknown'; },
        m => { m.identity.execution.collection = 'scene'; },
        m => { m.identity.conditions = []; }, m => { m.identity.conditions.push(copy(baseline)); },
        m => { m.identity.conditions.find(c => c.id === baseline.id).parameters.expected_return++; },
        m => { m.entries[0].sha256 = '0'.repeat(64); }]) {
        const m = copy(formal); edit(m); reseal(m);
        assert.throws(() => mingjiaoJiuyangCapacityReport([], baseline, m));
    }
    const duplicate = samples(); duplicate[1] = copy(duplicate[0]);
    assert.throws(() => mingjiaoJiuyangCapacityReport(duplicate, baseline, formal));
    assert.throws(() => mingjiaoJiuyangCapacityReport([...samples(), samples()[0]], baseline, formal));
    const other = selected('level400');
    assert.throws(() => mingjiaoJiuyangCapacityReport([row(other, raw(other))], baseline, formal));
    for (const edit of [c => { c.parameters.expected_return++; },
        c => { c.parameters.actor.properties.con++; }, c => { c.parameters.interface.object = '/clone/user/user'; },
        c => { c.parameters.interface.function = 'improve_neili'; },
        c => { c.parameters.source_evidence['clone/user/user.c'] = '0'.repeat(64); },
        c => { c.parameters.qualification_evidence.reverse(); }, c => { c.parameters.qualification_note = 'changed'; },
        c => { c.entry_id = 'clone/user/user.c'; }]) {
        const c = copy(baseline); edit(c);
        assert.throws(() => mingjiaoJiuyangCapacityReport([], c, formal));
    }
});

test('every ledger envelope field binds raw bytes and the original frozen condition', () => {
    for (const edit of [r => { r.format = 0; }, r => { r.fingerprint = smoke.fingerprint; },
        r => { r.condition_id += '-other'; }, r => { r.condition_sha256 = '0'.repeat(64); },
        r => { r.raw_sha256 = '0'.repeat(64); }, r => { r.index = 1; }, r => { r.index = -1; },
        r => { r.index = 0.5; }, r => { r.index = 2; }, r => { r.outcome = 'error'; },
        r => { r.reason = 'changed'; }, r => { r.raw.command_accepted = 476; }]) {
        const r = samples()[0]; edit(r); assert.throws(() => mingjiaoJiuyangCapacityReport([r], baseline, formal));
    }
    for (const key of ['format', 'fingerprint', 'condition_id', 'condition_sha256', 'index', 'outcome', 'reason', 'raw', 'raw_sha256']) {
        const r = samples()[0]; delete r[key];
        assert.throws(() => mingjiaoJiuyangCapacityReport([r], baseline, formal));
    }
});

test('rehashing an invalid raw does not bypass original capacity observation contracts', () => {
    for (const edit of [r => { r.kind = 'other'; }, r => { r.method = 'exert'; },
        r => { r.condition_id += '-wrong'; }, r => { r.before[0].interactive = 0; },
        r => { r.before[1].object = r.before[0].object; }, r => { r.immediate[0].neili--; },
        r => { r.after[1].skills.force++; }, r => { r.metrics[0].jing_cost = 1; },
        r => { r.metrics[1] = null; }, r => { r.interfaces[0].result = 0; },
        r => { r.interfaces[0].implemented_by = '/tests/actor'; },
        r => { r.interface_steps[0].return_actor = r.before[1].object; },
        r => { r.interface_steps[0].after.neili++; }, r => { r.interface_steps = []; },
        r => { r.callbacks.push({ side: 0 }); }, r => { delete r.before[0].conditions; },
        r => { r.before[0].learned = null; }, r => { r.outcome = 'refused'; r.reason = 'not a normal query'; }]) {
        const r = samples()[0]; edit(r.raw); rehash(r); r.outcome = r.raw.outcome; r.reason = r.raw.reason;
        assert.throws(() => mingjiaoJiuyangCapacityReport([r], baseline, formal));
    }
});

test('integer command costs are preserved; aggregate overflow and illegal values cannot become valid totals', () => {
    for (const cost of [1, 23, 476, Number.MAX_SAFE_INTEGER]) {
        const r = row(baseline, raw(baseline, 0, cost));
        const effects = mingjiaoJiuyangCapacityEffects([r], baseline, formal);
        assert.equal(effects.known.commands_accepted, 1); assert.equal(effects.known.command_cost, cost);
        assert.equal(effects.complete_plan, null); assert.equal(r.raw.command_accepted, cost);
    }
    for (const cost of [0, -1, 0.5, null, false, '23', Number.MAX_SAFE_INTEGER + 1]) {
        const r = row(baseline, raw(baseline, 0, cost));
        assert.throws(() => mingjiaoJiuyangCapacityReport([r], baseline, formal));
    }
    const huge = [row(baseline, raw(baseline, 0, Number.MAX_SAFE_INTEGER)), row(baseline, raw(baseline, 1, 1))];
    assert.throws(() => mingjiaoJiuyangCapacityReport(huge, baseline, formal));
});

test('diagnostics retain unknown costs/results and require strict actual identity/time/reason', () => {
    for (const outcome of ['error', 'not_applicable']) {
        const r = diagnostic(baseline, 0, outcome);
        r.raw.command_accepted = 476; rehash(r);
        const report = mingjiaoJiuyangCapacityReport([r], baseline, formal);
        assert.equal(report.effects.known, null); assert.equal(report.effects.complete_plan, null);
        for (const edit of [v => { v.reason = ''; }, v => { v.reason = null; }, v => { v.elapsed = -1; },
            v => { v.elapsed = null; }, v => { delete v.elapsed; }, v => { v.index = 2; },
            v => { v.method = 'yanlian'; }, v => { v.condition_id += '-unknown'; }]) {
            const changed = copy(r); edit(changed.raw); changed.reason = changed.raw.reason; rehash(changed);
            assert.throws(() => mingjiaoJiuyangCapacityReport([changed], baseline, formal));
        }
    }
    const wrong = diagnostic(baseline, 0, 'unknown');
    assert.throws(() => mingjiaoJiuyangCapacityReport([wrong], baseline, formal));
});

test('complete Chinese Markdown matches the full handwritten baseline, not only selected tokens', () => {
    const report = mingjiaoJiuyangCapacityReport(samples().reverse(), baseline, formal);
    const expected = `### 九阳容量查询（正式）：school-mingjiao-capacity-jiuyang-level200-neili_limit

| 原入口 | 条件 | 原等级配置 | 计划/记录 | 成功/诊断 | 缺样本 |
| --- | --- | --- | --- | --- | --- |
| query_neili_limit | level200 | 200 | 2/2 | 2/0 | 0 |

本表仅为当前正式条件的有限观察，不代表整个武学或养成路径完成。
命令受理次数与原正整数执行成本分列；一个成功查询始终只计一次受理。原返回值与方法实现归属来自已验证原件，不从源码预期补造实测。
已记录槽位是否齐全：是；本条件计划是否全部为成功观察：是。

| 已知子集命令 | 受理次数 | 正执行成本总和 | 接口调用 | 施术 USER 记录未变 | 另一 USER 记录未变 |
| --- | --- | --- | --- | --- | --- |
| 2 | 2 | 499 | 2 | 2 | 2 |

| 编号 | 原返回 | 实现归属 | 原执行成本 | 施术 USER | 另一 USER | 两方记录未变 |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 3750 | /clone/user/user | 23 | /tests/actor#31 | /tests/actor#32 | 是／是 |
| 1 | 3750 | /clone/user/user | 476 | /tests/actor#31 | /tests/actor#32 | 是／是 |

本条件完整计划汇总：正式成功查询 2 次，受理 2 次，正执行成本 499。

这里只证明传入记录的容量查询和快照表示未变，不证明自然增长、教学资格或兼修合法，也不代表原始日志、驱动与源副本已独立验收。
learned 使用现有规范化快照，不能据此区分原始 null 与空映射；name/race 未在该快照中观察。

冻结方案备注（原文，不作为本次运行状态判定）：只准备真实USER的原容量查询，未接入执行器或实采。预存技能、许可和资源池是实验输入，不证明自然养成、可传授或兼修合法；不调用improve_neili、不改max_neili。当前映射与全部已学最大值分别观察，保留原.c扫描及整数修正顺序。返回预期来自固定源码，不是实测结果。

冻结来源 137 份；摘要 2b25e7e41899f6432deef87f3631e3fc9840a02967c933e5b8ef9c714a5d500c。
系列指纹 ${formal.fingerprint}；模式 正式。`;
    assert.equal(mingjiaoJiuyangCapacityMarkdown(report, formal), expected);
});

test('Markdown escapes original diagnostic text and does not emit zero observations for absent evidence', () => {
    const r = diagnostic(baseline, 0, 'error', '<坏> | `提示`\n\x1b[31m&');
    const report = mingjiaoJiuyangCapacityReport([r], baseline, formal), before = copy(report);
    const md = mingjiaoJiuyangCapacityMarkdown(report, formal);
    assert.match(md, /&lt;坏&gt; \\\| &#96;提示&#96;<br>\\x1b\[31m&amp;/);
    assert.match(md, /完整计划汇总：未知/); assert.match(md, /缺少原件编号：1/);
    assert.doesNotMatch(md, /\| 0 \| 0 \| 0 \| 0/); assert.doesNotMatch(md, /3750/);
    assert.deepEqual(report, before);
});

test('tampered summaries cannot launder missing/diagnostic evidence, cost, capacity or source metadata', () => {
    for (const edit of [r => { r.coverage.recorded = 1; }, r => { r.coverage.observed = 1; },
        r => { r.effects.known.command_cost = 2; }, r => { r.effects.complete_plan.interface_calls = 1; },
        r => { r.steps[0].value = 23000; }, r => { r.steps[0].actor_unchanged = false; },
        r => { r.steps[0].target = r.steps[0].actor; }, r => { r.steps[1].index = 0; },
        r => { r.steps[0].implemented_by = '/tests/actor'; }, r => { r.series.smoke = null; },
        r => { r.condition.parameters.source_evidence['clone/user/user.c'] = '0'.repeat(64); }]) {
        const r = mingjiaoJiuyangCapacityReport(samples(), baseline, formal); edit(r);
        assert.throws(() => mingjiaoJiuyangCapacityMarkdown(r, formal));
    }
    const empty = mingjiaoJiuyangCapacityReport([], baseline, formal);
    empty.effects.known = { interface_values: { 3750: 0 } };
    assert.throws(() => mingjiaoJiuyangCapacityMarkdown(empty, formal));
    const partial = mingjiaoJiuyangCapacityReport([samples()[0]], baseline, formal);
    partial.effects.complete_plan = copy(partial.effects.known);
    assert.throws(() => mingjiaoJiuyangCapacityMarkdown(partial, formal));
});

test('inputs and frozen source metadata remain untouched and returned contexts are independent copies', () => {
    const rows = samples(), snapshotBefore = copy({ rows, baseline, formal });
    const report = mingjiaoJiuyangCapacityReport(rows, baseline, formal);
    const reportBefore = copy(report); mingjiaoJiuyangCapacityMarkdown(report, formal);
    assert.deepEqual(report, reportBefore); assert.deepEqual({ rows, baseline, formal }, snapshotBefore);
    report.condition.parameters.source_evidence[main] = '0'.repeat(64);
    report.condition.parameters.actor.skills.force = 1;
    report.effects.complete_plan.command_cost = 0;
    assert.equal(report.effects.known.command_cost, 499);
    assert.deepEqual({ rows, baseline, formal }, snapshotBefore);
});
