// Pure report tests over explicitly synthetic hand anchors, never native collection evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { digest } from './ledger.mjs';
import { mingjiaoRemainingPerformConditions as factory } from './school_mingjiao_remaining_perform_cases.mjs';
import { validateMingjiaoRemainingPerformRecord as check } from './school_mingjiao_remaining_perform_record.mjs';
import { mingjiaoRemainingPerformReport as report, mingjiaoRemainingPerformMarkdown as markdown } from './school_mingjiao_remaining_perform_report.mjs';

const copy = value => structuredClone(value);
// Reuse ONLY the hand-written fixture declarations without registering another test module.
let fixture = fs.readFileSync(new URL('./school_mingjiao_remaining_perform_record.test.mjs', import.meta.url), 'utf8').split('\ntest(')[0];
fixture = fixture.replace(/^import .*;\r?$/gm, '').replace("new URL('../../../', import.meta.url)", JSON.stringify(new URL('../../../', import.meta.url).href));
const { trace, selected, formal, smoke } = new Function('assert', 'fs', 'createHash', 'factory', 'check',
    fixture + '\nreturn { trace, selected, formal, smoke };')(assert, fs, createHash, factory, check);
function manifest(c) {
    const p = c.parameters, entries = [copy(p.source_entry)];
    const identity = { source_fingerprint: digest('synthetic source identity; not native'), entries_sha256: digest(entries),
        conditions: [copy(c)], execution: { collection: 'school-combat', smoke: p.run_mode === 'smoke', source_files: copy(p.source_evidence) } };
    return { format: 1, kind: 'martial_data_series', identity, entries, fingerprint: digest(identity) };
}
function row(raw, c, m) {
    return { format: 1, fingerprint: m.fingerprint, condition_id: c.id, condition_sha256: digest(c),
        index: raw.index, outcome: raw.outcome, reason: raw.reason, raw_sha256: digest(raw), raw: copy(raw) };
}
const reseal = m => { m.identity.entries_sha256 = digest(m.entries); m.fingerprint = digest(m.identity); return m; };
function complete(c, options = {}) {
    const m = manifest(c), rows = Array.from({ length: c.samples }, (_, index) => {
        const raw = trace(c, options); raw.index = index; return row(raw, c, m);
    });
    return { c, m, rows };
}

test('empty and diagnostic evidence keep actual quantities unknown rather than use plan values', () => {
    const c = selected('jin'), m = manifest(c), empty = report([], c, m);
    assert.equal(empty.coverage.planned, 100); assert.equal(empty.coverage.missing.length, 100);
    assert.equal(empty.effects.command_cost, null); assert.equal(empty.effects.resources, null);
    assert.equal(empty.effects.known, false); assert.match(markdown(empty, m, []), /未知/);
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: 0,
        outcome: 'error', reason: 'synthetic error, not native' };
    const diagnostic = report([row(raw, c, m)], c, m);
    assert.equal(diagnostic.coverage.errors, 1); assert.equal(diagnostic.effects.measured_records, 0);
    assert.equal(diagnostic.effects.actual_calls, null); assert.equal(diagnostic.coverage.complete, false);
    raw.outcome = 'not_applicable'; assert.equal(report([row(raw, c, m)], c, m).coverage.not_applicable, 1);
});
test('partial records give bounded measured quantities without declaring the complete plan', () => {
    const c = selected('jin'), m = manifest(c), raw = trace(c, { direct: true });
    const r = report([row(raw, c, m)], c, m);
    assert.equal(r.coverage.validated, 1); assert.equal(r.coverage.complete, false);
    assert.equal(r.effects.command_cost, 23); assert.equal(r.effects.commands_accepted, 1);
    assert.equal(r.effects.resources[1].qi.decrease, 70); assert.equal(r.effects.resources[1].eff_qi.decrease, 30);
    assert.equal(r.effects.unknown.requested_gross_damage, null);
    assert.match(markdown(r, m, [row(raw, c, m)]), /只汇总 1 条/);
});
test('complete formal data count actual costs, separate refusal and retain unknowns', () => {
    const c = selected('jin', 'actor-busy1'), { m, rows } = complete(c), r = report(rows, c, m);
    assert.equal(r.coverage.complete, true); assert.equal(r.coverage.refused, 2);
    assert.equal(r.effects.command_cost, 0); assert.equal(r.effects.commands_accepted, 0);
    assert.equal(r.effects.unknown.poison_natural_lifecycle, null);
    assert.match(markdown(r, m, rows), /模式：正式/);
    const accepted = smoke.find(x => x.id === selected('jin').id), set = complete(accepted, { cost: 476 });
    const s = report(set.rows, accepted, set.m);
    assert.equal(s.effects.command_cost, 952); assert.equal(s.effects.commands_accepted, 2);
    assert.match(markdown(s, set.m, set.rows), /烟雾（不并入正式分布）/);
});
test('formal100 cannot be reduced to smoke2; deterministic same-sized2 still binds original mode', () => {
    for (const c of [selected('jin'), selected('jin', 'actor-busy1')]) {
        const m = manifest(c), reduced = copy(c); reduced.samples = 2;
        if (c.samples === 100) assert.throws(() => report([], reduced, m));
        const sm = smoke.find(s => s.id === c.id); assert.throws(() => report([], sm, m));
        const altered = copy(m); altered.identity.execution.smoke = true; reseal(altered);
        assert.throws(() => report([], c, altered));
    }
    assert.equal(formal.length, 328); assert.equal(smoke.length, 328);
});
test('duplicate indices, wrong fingerprint, raw digest, condition digest and resealed source/entry drift reject', () => {
    const { c, m, rows } = complete(smoke.find(c => c.parameters.ability === 'jin' && c.parameters.variant === 'level400'));
    assert.throws(() => report([rows[0], rows[0]], c, m));
    for (const key of ['fingerprint', 'raw_sha256', 'condition_sha256']) {
        const r = copy(rows); r[0][key] = '0'.repeat(64); assert.throws(() => report(r, c, m));
    }
    for (const edit of [v => { v.entries.push(copy(v.entries[0])); }, v => { v.entries[0].role = 'interface'; },
        v => { v.entries[0].path = 'cmds/skill/perform.c'; },
        v => { v.identity.execution.source_files['cmds/skill/perform.c'] = '0'.repeat(64); },
        v => { v.identity.conditions.push(copy(c)); }]) {
        const changed = copy(m); edit(changed); reseal(changed); assert.throws(() => report([], c, changed));
    }
});
test('rehashed malformed raw still rejects; normal outcome follows actual cost and dispatch, not expected', () => {
    const c = selected('jin'), m = manifest(c), raw = trace(c, { accepted: false });
    const r = report([row(raw, c, m)], c, m);
    assert.equal(r.coverage.refused, 1); assert.deepEqual(r.coverage.unmatched, [0]);
    raw.command_context.actor = '/tests/actor#999'; assert.throws(() => report([row(raw, c, m)], c, m));
});
test('flower original equipment survives report and Markdown; resealed malformed fields still reject', () => {
    const c = selected('hua'), m = manifest(c), original = trace(c), rows = [row(original, c, m)];
    assert.equal(original.before[0].handing_details.no_wield, '暗器不是用来装备的。\n');
    assert.equal(original.before[0].handing_details.consistence, 100);
    const bytes = JSON.stringify(rows), summary = report(rows, c, m);
    assert.equal(summary.effects.flower.consumed, 10); markdown(summary, m, rows);
    assert.equal(JSON.stringify(rows), bytes);
    const editItems = (value, key, replacement) => {
        if (!value || typeof value !== 'object') return;
        if (value.program === '/clone/weapon/flower_leaf') value[key] = replacement;
        Object.values(value).forEach(child => editItems(child, key, replacement));
    };
    for (const [key, value] of [['no_wield', 0], ['no_wield', 1], ['no_wield', null], ['no_wield', {}],
        ['no_wield', '暗器不是用来装备的。'], ['consistence', null], ['consistence', 99], ['damage', '2']]) {
        const raw = copy(original); editItems(raw, key, value);
        const forged = [row(raw, c, m)]; assert.equal(forged[0].raw_sha256, digest(raw));
        assert.throws(() => report(forged, c, m)); assert.throws(() => markdown(summary, m, forged));
    }
});
test('NUOYI resealed rows cannot turn self damage or caster attacks into ordinary redirect evidence', () => {
    const c = selected('nuoyi', 'middle-with-third'), m = manifest(c), original = trace(c, { redirect: true });
    const summary = report([row(original, c, m)], c, m);
    for (const [actor, target] of [[1, 1], [2, 2], [0, 1], [0, 2], [1, 0], [2, 0]]) {
        const raw = copy(original), metrics = [...raw.metrics, raw.extra_target_metrics];
        for (const name of ['actions', 'attacks']) Object.assign(raw[name][0], { actor, target });
        raw.actions[0].skill = actor === 0 ? c.parameters.skill : null;
        raw.attacks[0].neili = actor === 2 ? raw.extra_target_after.neili : raw.after[actor].neili;
        metrics[1].dodge--; metrics[actor].dodge = (metrics[actor].dodge ?? 0) + 1;
        const forgedRows = [row(raw, c, m)];
        assert.equal(forgedRows[0].raw_sha256, digest(raw));
        assert.throws(() => report(forgedRows, c, m), /foreign combat role|exact right\/third pair/);
        assert.throws(() => markdown(summary, m, forgedRows), /foreign combat role|exact right\/third pair/);
    }
    const self = selected('nuoyi', 'weak-target'), sm = manifest(self), raw = trace(self, { self: true });
    const rows = [row(raw, self, sm)], result = report(rows, self, sm);
    assert.equal(result.effects.actual_calls.attacks, 0); assert.equal(result.effects.actual_calls.direct_inputs, 0);
    assert.equal(result.effects.resources[1].qi.decrease, 500000);
    assert.equal(result.effects.resources[1].eff_qi.decrease, 500000);
    assert.equal(result.effects.accepted_sample_events.any_ordinary_attack.successes, 0);
    assert.equal(result.effects.accepted_sample_events.targets[0].positive_resource_net_decrease.successes, 1);
    assert.match(markdown(result, sm, rows), /未知/);
    raw.actions.push({ actor: 1, target: 0, skill: null, action: { action: 'synthetic forbidden pair', force: 1 } });
    raw.attacks.push({ actor: 1, target: 0, type: 0, result: -1, damage: 0, neili: raw.after[1].neili, apply_attack: null });
    raw.metrics[1].dodge = 1;
    assert.throws(() => report([row(raw, self, sm)], self, sm), /exact right\/third pair/);
});
test('Markdown requires original manifest and original rows, rejects forged mode and quantity summaries', () => {
    const c = smoke.find(c => c.id === selected('jin').id), { m, rows } = complete(c), r = report(rows, c, m);
    const original = JSON.stringify({ m, rows, c });
    const first = markdown(r, m, rows); assert.equal(first, markdown(copy(r), m, copy(rows)));
    assert.equal(JSON.stringify({ m, rows, c }), original);
    assert.throws(() => markdown(r)); assert.throws(() => markdown(r, m));
    for (const edit of [s => { s.series.smoke = false; }, s => { s.effects.command_cost = 2; },
        s => { s.coverage.complete = false; }, s => { s.records[0].evidence.unknown.requested_gross_damage = 0; }]) {
        const forged = copy(r); edit(forged); assert.throws(() => markdown(forged, m, rows));
    }
});
test('flower, poison seeds and three real roles summarize only supplied hand anchors', () => {
    const entries = [selected('hua', 'petals10'), selected('feng'), selected('nuoyi', 'middle-with-third')];
    for (const c of entries) {
        const m = manifest(c), raw = trace(c, { poison: c.parameters.ability === 'feng', redirect: c.parameters.ability === 'nuoyi' });
        const rows = [row(raw, c, m)], r = report(rows, c, m);
        if (c.parameters.ability === 'hua') assert.deepEqual(r.effects.flower, { consumed: 10, destroyed_after_return: 1 });
        if (c.parameters.ability === 'feng') assert.equal(r.effects.poison_seed_records, 1);
        if (c.parameters.ability === 'nuoyi') { assert.equal(r.effects.resources.length, 3); assert.equal(r.effects.actual_calls.attacks, 2); }
        assert.equal(r.effects.unknown.planned_kuai_attacks, null); assert.ok(markdown(r, m, rows).includes('未知'));
    }
});
test('sample distributions and Wilson denominators use actual accepted slots, not correlated attack counts', () => {
    const c = smoke.find(x => x.id === selected('jin').id), m = manifest(c);
    const raws = [trace(c, { cost: 23, direct: true }), trace(c, { cost: 476 })]; raws[1].index = 1;
    const rows = raws.map(r => row(r, c, m)), s = report(rows, c, m), d = s.effects.distributions.command_cost.accepted;
    assert.equal(d.n, 2); assert.equal(d.mean, 249.5); assert.equal(d.median, 249.5);
    assert.equal(d.p10, 68.30000000000001); assert.equal(d.p90, 430.7); assert.equal(d.p95, 453.34999999999997);
    assert.equal(s.effects.distributions.command_cost.refused.n, 0);
    assert.equal(s.effects.distributions.resources[1].accepted.qi.decrease.mean, 35);
    const event = s.effects.accepted_sample_events.any_direct_input;
    assert.equal(event.successes, 1); assert.equal(event.trials, 2); assert.equal(event.rate, 0.5);
    assert.ok(event.low95 < 0.5 && event.high95 > 0.5);
    assert.equal(s.effects.accepted_sample_events.targets[0].positive_resource_net_decrease.successes, 1);
    const forged = copy(s); forged.effects.accepted_sample_events.any_direct_input.trials = 4;
    assert.throws(() => markdown(forged, m, rows)); assert.match(markdown(s, m, rows), /Wilson 95%/);
    const combo = selected('kuai'), cm = manifest(combo), cr = trace(combo, { passive: true });
    const cs = report([row(cr, combo, cm)], combo, cm);
    assert.equal(cs.effects.actual_calls.attacks, 4); assert.equal(cs.effects.attack_result_rates.dodge, 1);
    assert.equal(cs.effects.accepted_sample_events.any_ordinary_attack.trials, 1);
    assert.equal(cs.effects.accepted_sample_events.targets[0].increased_busy_state.successes, 1);
    assert.equal(report([], c, m).effects.distributions.command_cost.accepted.mean, null);
});

test('resealed report rows preserve wrong-held null ammunition and reject missing or mismatched equipment evidence', () => {
    const c = selected('hua', 'wrong-held-item'), m = manifest(c), original = trace(c), rows = [row(original, c, m)];
    const bytes = JSON.stringify(rows), summary = report(rows, c, m);
    assert.equal(summary.effects.commands_accepted, 0); markdown(summary, m, rows);
    assert.equal(JSON.stringify(rows), bytes); assert.equal(rows[0].raw.before[0].ammunition, null);
    const editEmpty = (value, replacement) => {
        if (!value || typeof value !== 'object') return;
        if (value.id === 'left' && Object.hasOwn(value, 'ammunition')) value.ammunition = replacement;
        if (value.program === '/tests/sword') value.amount = replacement;
        Object.values(value).forEach(child => editEmpty(child, replacement));
    };
    for (const edit of [r => { delete r.before[0].ammunition; }, r => { delete r.before[0].handing_details.amount; },
        r => { r.before[0].ammunition = 0; }, r => { r.before[0].handing_details.amount = 0; },
        ...[-1, 1, 0.5, Number.MAX_SAFE_INTEGER + 1, '0', true, false, undefined, {}, []].map(v => r => editEmpty(r, v))]) {
        const raw = copy(original); edit(raw);
        assert.throws(() => report([row(raw, c, m)], c, m));
    }
    for (const other of [selected('hua', 'no-held-item'), selected('hua'), selected('fei')]) {
        const raw = trace(other), originalManifest = manifest(other); raw.before[0].ammunition = null;
        assert.throws(() => report([row(raw, other, originalManifest)], other, originalManifest));
    }
});

test('NUOYI report preserves omitted forward type and rejects resealed reverse or foreign null attacks', () => {
    const c = selected('nuoyi', 'third-enemy-level200'), m = manifest(c), raw = trace(c, { redirect: true });
    const rows = [row(raw, c, m)], bytes = JSON.stringify(rows), summary = report(rows, c, m);
    assert.equal(summary.effects.actual_calls.attacks, 2); markdown(summary, m, rows);
    assert.ok(rows[0].raw.attacks.every(x => x.type === null)); assert.equal(JSON.stringify(rows), bytes);
    const reverse = copy(raw);
    for (const x of [...reverse.attacks, ...reverse.actions]) { x.actor = 2; x.target = 1; }
    delete reverse.metrics[1].dodge; reverse.extra_target_metrics.dodge = 2;
    assert.throws(() => report([row(reverse, c, m)], c, m));
    for (const edit of [r => { delete r.attacks[0].type; },
        ...[undefined, -1, 3, 0.5, '0', true, false, {}, []].map(v => r => { r.attacks[0].type = v; })]) {
        const altered = copy(raw); edit(altered); assert.throws(() => report([row(altered, c, m)], c, m));
    }
    const kuai = selected('kuai'), km = manifest(kuai), other = trace(kuai); other.attacks[0].type = null;
    assert.throws(() => report([row(other, kuai, km)], kuai, km));
});
