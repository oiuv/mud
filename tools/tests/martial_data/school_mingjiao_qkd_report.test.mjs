// Pure synthetic summaries/diagnostic envelopes; never native samples, a driver, or a model.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource, sha256 } from './inventory.mjs';
import { digest } from './ledger.mjs';
import { mingjiaoQkdConditions, mingjiaoQkdSourcePaths,
    mingjiaoQkdEffects } from './school_mingjiao_qkd_cases.mjs';
import { mingjiaoQkdReport, mingjiaoQkdMarkdown } from './school_mingjiao_qkd_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const path = 'kungfu/skill/qiankun-danuoyi.c', source = read(path);
const catalog = { skills: [{ id: 'qiankun-danuoyi', path, sha256: sha256(source),
    entries: scanSource(source).functions.map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'query_or_gate' })) }] };
const cases = mingjiaoQkdConditions(catalog, read);
const pick = variant => {
    const c = cases.find(c => c.parameters.variant === variant); assert.ok(c, variant); return c;
};
const envelope = (raw, c) => ({ format: 1, fingerprint: 'a'.repeat(64), condition_id: c.id,
    condition_sha256: digest(c), index: raw.index, outcome: raw.outcome, reason: raw.reason,
    raw, raw_sha256: digest(raw), recorded: '2026-10-14T00:00:00.000Z' });
const diagnostic = (c, index = 0, outcome = 'error') => envelope({ kind: 'sample', condition_id: c.id,
    index, method: c.method, outcome, reason: 'synthetic diagnostic, not a gameplay observation', elapsed: 0.01 }, c);

// Narrow independent copy of the collector's explicit pure USER fixture shape.
// No import of its test module, no fixture writes, no claim of real observations.
function state(cfg, side, p) {
    const s = { cultivation: Object.fromEntries(['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
        'special_skill/guimai', 'wudang-jiuyang', 'immune/poison'].map(k => [k, null])), object: '/tests/actor#' + (100 + side),
        id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        busy: cfg.busy ?? null, conditions: null, fighting_opponent: Number(p.fighting), skills: structuredClone(cfg.skills),
        mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations), learned: {},
        temp: { user_setup: 1, apply: { armor: 100 } }, weapon: 'none', weapon_damage: 0, weapon_flag: 0,
        weapon_details: {}, handing: 'none', handing_details: {}, craze: 0, max_craze: 5000 };
    assert.ok(!cfg.equipment && !cfg.temp, 'fixture only covers the explicit unequipped cases');
    for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
        if (k.includes('/') || ['character', 'class', 'doing'].includes(k)) s.cultivation[k] = v; else s[k] = v;
    }
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)]));
    s.effective_str = 36 + Math.trunc(Math.max(0, ...['unarmed', 'strike', 'finger', 'hand', 'claw', 'cuff'].map(k => cfg.skills[k] ?? 0)) / 10);
    s.effective_int = 40; s.effective_dex = 36 + Math.trunc((cfg.skills.dodge ?? 0) / 10); s.effective_con = 36 + Math.trunc((cfg.skills.force ?? 0) / 10);
    return s;
}
function normal(c, { queued = false, callback = 'miss', cancel = false } = {}) {
    const p = c.parameters, before = [state(p.actor, 0, p), state(p.target, 1, p)];
    const point = (time, pending = []) => ({ wall_time: time, fighting: [Number(p.fighting), Number(p.fighting)], pending });
    const parry = '$N一招击在$n身上，却被$n暗运乾坤大挪移，将内力尽数移入地下。\n';
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: queued ? 2.1 : .01,
        outcome: 'observed', reason: '', before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        actions: [], directs: [], attacks: [], passives: [], defenses: [], defense_messages: [], dodge_checks: [],
        interfaces: [], launches: [], refusals: [], callbacks: [], dropped: [], terminals: [], busy_calls: [],
        bhinfo: { before: null, after: null, cleared: null },
        qkd_queue: { before: point(100), immediate: point(100), final: point(queued ? 102 : 100) } };
    let value = p.ability === 'valid_enable' ? Number(p.interface.argument === 'parry') : null;
    if (p.ability === 'valid_damage') {
        if (cancel || queued) value = { damage: -1000, msg: queued ? '\n$N一招攻出，却见$n迎身而上，冷笑道：「区区寒冰绵掌，能奈我何？」\n$n当即运起乾坤大挪移第七层心法，企图挪移$N的攻势。\n\n' : parry };
        raw.defenses = [{ actor: 0, target: 1, skill: 'qiankun-danuoyi', incoming: 1000, result: value, route: 'interface' }];
    }
    raw.command_accepted = 1;
    raw.interfaces = [{ object: p.interface.object, function: p.ability, result: value, implemented_by: '/kungfu/skill/qiankun-danuoyi',
        ...(Object.hasOwn(p.interface, 'argument') ? { argument: p.interface.argument } : {}) }];
    if (queued) {
        raw.immediate[1].busy = 2; raw.immediate[1].temp.nuoyi = { left: 1 };
        raw.qkd_queue.immediate.pending = [{ owner: before[1].object, function: 'eval_function', tuple_size: 3, remaining: 1 }];
        raw.busy_calls = [{ side: 1, caller_side: 0, requested: 2, before: null, after: 2 }];
    }
    raw.after = structuredClone(raw.immediate);
    if (queued && p.fighting) {
        raw.busy_calls.push({ side: 1, caller_side: -1, requested: 2, before: 2, after: 2 }); delete raw.after[1].temp.nuoyi;
        if (callback === 'hit') {
            const input = raw.immediate[1].effective_skills.parry + raw.immediate[0].effective_skills.force;
            raw.directs = [{ actor: 1, target: 0, type: 2, damage: input, percent: 300, weapon: 'none', weapon_object: '' }];
            const pre = input + Math.trunc(input * 57 / 50);
            const d = pre > 1500 ? Math.trunc((pre - 1500) / 4) + 1000 : pre > 500 ? Math.trunc((pre - 500) / 2) + 500 : pre;
            let w = d * 3; w -= Math.trunc(w * .2); w -= Math.trunc(w * .26);
            raw.after[0].eff_qi -= w; raw.after[0].qi = Math.min(10000 - d, raw.after[0].eff_qi);
            raw.after[0].craze = Math.min(5000, Math.trunc(d / 5) + Math.trunc(w / 3));
            raw.metrics[1].direct = 1; raw.metrics[0] = { qi_cost: 10000 - raw.after[0].qi, eff_qi_cost: w };
        }
    }
    if (queued) raw.callbacks = ['before', 'after'].map((phase, i) => ({ side: 1, phase, elapsed: 1.01,
        state: structuredClone((i ? raw.after : raw.immediate)[1]), qkd: { ...point(101.01), owner: before[1].object,
            function: 'eval_function', states: structuredClone(i ? raw.after : raw.immediate) } }));
    return envelope(raw, c);
}

test('QKD report uses the actual frozen 39/3430 plan, including five 300-sample windows', () => {
    assert.equal(mingjiaoQkdSourcePaths.length, 124); assert.equal(cases.length, 39);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3430);
    assert.equal(cases.filter(c => c.samples === 300).length, 5);
    const smoke = mingjiaoQkdConditions(catalog, read, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 78);
    const c = pick('seven-eligible351'), report = mingjiaoQkdReport([], c);
    assert.equal(report.coverage.planned, 300); assert.equal(report.coverage.missing, 300);
    assert.equal(report.context.level, c.parameters.level);
    assert.equal(report.context.source_count, 124);
    assert.deepEqual(report.context.actor, c.parameters.actor);
    assert.equal(report.context.callback_if_queued, true);
    assert.equal(report.effects, null); assert.match(mingjiaoQkdMarkdown(report), /效果：未观测/);
});

test('QKD errors, not-applicable and missing records remain separate unknowns without raw state', () => {
    const c = pick('damage-200'), rows = [diagnostic(c), diagnostic(c, 1, 'not_applicable')];
    const report = mingjiaoQkdReport(rows, c);
    assert.deepEqual(report.coverage, { planned: c.samples, recorded: 2, observed: 0, refused: 0,
        error: 1, not_applicable: 1, known: 0, unknown: 2, missing: c.samples - 2 });
    assert.equal(report.exceptional.length, 2);
    assert.deepEqual(report.effects, mingjiaoQkdEffects(rows, c));
    const md = mingjiaoQkdMarkdown(report);
    assert.match(md, /接口返回0也可能/); assert.match(md, /缺样本不补成失手或零效果/);
    assert.match(md, /eval_function/); assert.match(md, /type 0/); assert.match(md, /type 2/);
    assert.match(md, /不计算DPS/); assert.doesNotMatch(md, /0DPS|全部明教完成|全量覆盖/);
});

test('QKD adapter rejects wrong identity, missing reason, illegal indices, elapsed and changed SHA', () => {
    const c = pick('seven-eligible351'), good = diagnostic(c);
    for (const edit of [r => r.condition_id = 'wrong-id', r => r.raw.condition_id = 'wrong-id',
        r => r.raw.method = 'perform', r => r.index = null, r => r.raw.index = null,
        r => r.index = -1, r => r.raw.index = c.samples, r => delete r.raw.reason,
        r => r.raw.reason = '', r => r.raw.elapsed = -1, r => r.raw.elapsed = null,
        r => r.outcome = 'observed', r => r.raw.kind = 'not-sample']) {
        const row = structuredClone(good); edit(row); row.raw_sha256 = digest(row.raw);
        assert.throws(() => mingjiaoQkdReport([row], c));
    }
    const bad = structuredClone(good); bad.raw_sha256 = 'b'.repeat(64);
    assert.throws(() => mingjiaoQkdReport([bad], c), /原件摘要/);
    assert.throws(() => mingjiaoQkdReport([good, good], c), /重复/);
});

test('QKD report does not rewrite original ledger/raw data or trust raw.parameters for context', () => {
    const c = pick('seven-eligible351'), row = diagnostic(c);
    row.raw.parameters = { level: 1, family: 'fake', ability: 'invented' }; row.raw_sha256 = digest(row.raw);
    const before = structuredClone(row), conditionBefore = structuredClone(c);
    const report = mingjiaoQkdReport([row], c);
    assert.equal(report.context.level, c.parameters.level);
    assert.equal(report.context.ability, c.parameters.ability);
    mingjiaoQkdMarkdown(report);
    assert.deepEqual(row, before); assert.deepEqual(c, conditionBefore);
    report.context.actor.properties.neili = 1;
    assert.deepEqual(c, conditionBefore, '报告上下文不能修改冻结输入');
});

test('known interface cancellation is not callback hit; interface zero is still observed', () => {
    const enabled = pick('enable-dodge'), zero = mingjiaoQkdReport([normal(enabled)], enabled);
    assert.equal(zero.coverage.observed, 1); assert.deepEqual(zero.effects.interface_values, { '0': 1 });
    const c = pick('damage-200'), row = normal(c, { cancel: true }), before = structuredClone(row);
    const report = mingjiaoQkdReport([row], c), e = report.effects;
    assert.equal(e.defense_calls, 1); assert.equal(e.canceled, 1); assert.equal(e.queued, 0);
    assert.equal(e.callback_hit, 0); assert.equal(e.callback_miss, 0); assert.deepEqual(e.results, { not_queued: 1 });
    assert.equal(e.public_damage, 0); assert.equal(e.qi_cost, 0);
    assert.deepEqual(report.incoming, { damage: 1000, canceled_damage: 1000 });
    const md = mingjiaoQkdMarkdown(report);
    assert.match(md, /未排队单独记为 not_queued/); assert.match(md, /实际防御调用为分母/);
    assert.match(md, /\| 防御调用 \| 取消 \| 七层排队/); assert.deepEqual(row, before);
});

test('seven-layer hit input, damage, wound and clamped resource cost are distinct', () => {
    const c = pick('seven-eligible351'), row = normal(c, { queued: true, callback: 'hit' });
    const report = mingjiaoQkdReport([row], c), e = report.effects;
    assert.equal(e.queued, 1); assert.equal(e.callback_hit, 1); assert.equal(e.callback_miss, 0);
    assert.equal(e.callback_input, row.raw.directs[0].damage);
    assert.deepEqual(report.incoming, { damage: 1000, canceled_damage: 1000 });
    assert.ok(e.callback_wound > e.callback_damage); assert.notEqual(e.callback_input, e.callback_damage);
    assert.equal(e.qi_cost, row.raw.metrics[0].qi_cost); assert.equal(e.eff_qi_cost, row.raw.metrics[0].eff_qi_cost);
    assert.equal(e.public_damage, 0); assert.match(mingjiaoQkdMarkdown(report), /USER1→USER0/);
    for (const edit of [r => r.raw.directs[0].type = 0, r => r.raw.directs[0].damage = e.callback_damage,
        r => r.raw.metrics[0].qi_cost++, r => r.raw.qkd_queue.immediate.pending[0].function = 'nuoyi']) {
        const wrong = structuredClone(row); edit(wrong); wrong.raw_sha256 = digest(wrong.raw);
        assert.throws(() => mingjiaoQkdReport([wrong], c));
    }
});

test('queued miss and no-fight early return are separate original callback outcomes', () => {
    for (const [variant, key] of [['seven-mixed-callback', 'callback_miss'], ['seven-no-fight', 'callback_early_return']]) {
        const c = pick(variant), report = mingjiaoQkdReport([normal(c, { queued: true })], c);
        assert.equal(report.effects.queued, 1); assert.equal(report.effects[key], 1);
        assert.equal(report.effects.callback_hit, 0);
        assert.equal(report.effects[key === 'callback_miss' ? 'callback_early_return' : 'callback_miss'], 0);
        assert.match(mingjiaoQkdMarkdown(report), /实际排队为分母/);
    }
});

test('mixed known and diagnostic records never turn unknown totals into zero', () => {
    const c = pick('damage-200'), good = normal(c, { cancel: true }), report = mingjiaoQkdReport([good, diagnostic(c, 1)], c);
    assert.equal(report.coverage.known, 1); assert.equal(report.coverage.unknown, 1);
    assert.equal(report.effects.canceled, null); assert.equal(report.effects.qi_cost, null);
    assert.equal(report.incoming, null);
    assert.deepEqual(report.effects.results, { not_queued: 1 });
    assert.match(mingjiaoQkdMarkdown(report), /\| 未知 \| 未知 \| 未知/);
    const wrong = structuredClone(report); wrong.effects.validated = 2;
    assert.throws(() => mingjiaoQkdMarkdown(wrong));
    const falseZero = structuredClone(report); falseZero.effects.qi_cost = 0;
    assert.throws(() => mingjiaoQkdMarkdown(falseZero), /未知合计/);
});

test('rendered known result denominators cannot be changed or mixed with another route', () => {
    const c = pick('seven-eligible351'), report = mingjiaoQkdReport([normal(c, { queued: true, callback: 'hit' })], c);
    const md = mingjiaoQkdMarkdown(report);
    assert.match(md, /接口原返回汇总键/); assert.doesNotMatch(md, /普通攻击原结果码/);
    for (const edit of [s => s.effects.queued = 2, s => s.effects.callback_miss = 1,
        s => s.effects.results.hit = 2, s => s.effects.interface_values = {}, s => s.effects.callback_damage = null]) {
        const wrong = structuredClone(report); edit(wrong); assert.throws(() => mingjiaoQkdMarkdown(wrong));
    }
});
