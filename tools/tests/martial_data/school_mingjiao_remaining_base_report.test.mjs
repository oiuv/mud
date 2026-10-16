// Synthetic evidence only; no driver and no measured gameplay distribution.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { digest } from './ledger.mjs';
import { mingjiaoRemainingBaseConditions, mingjiaoRemainingBaseProfiles } from './school_mingjiao_remaining_base_cases.mjs';
import { validateMingjiaoRemainingBaseRecord as check } from './school_mingjiao_remaining_base_record.mjs';
import { mingjiaoRemainingBaseReport as report, mingjiaoRemainingBaseMarkdown as markdown } from './school_mingjiao_remaining_base_report.mjs';

const root = new URL('../../../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const sha = x => createHash('sha256').update(x).digest('hex');
// Reuse only the explicitly hand-written paths, not node:test registrations.
const fixtureText = fs.readFileSync(new URL('./school_mingjiao_remaining_base_record.test.mjs', import.meta.url), 'utf8');
const fixtureBody = fixtureText.slice(fixtureText.indexOf('const copy ='), fixtureText.indexOf('const bad ='));
const { select, trace, formal, smoke } = new Function('assert', 'mingjiaoRemainingBaseProfiles',
    'mingjiaoRemainingBaseConditions', 'read', 'sha', fixtureBody + '\nreturn { select, trace, formal, smoke };')(
    assert, mingjiaoRemainingBaseProfiles, mingjiaoRemainingBaseConditions, read, sha);
const copy = x => structuredClone(x);
function manifest(c) {
    const p = c.parameters, role = c.method === 'ordinary' ? 'file'
        : p.source_entry.function === 'hit_ob' ? 'combat_interface'
            : p.source_entry.function === 'valid_learn' ? 'query_or_gate' : 'other_function';
    const entries = [{ id: c.entry_id, path: p.base_source.path, role, sha256: p.base_source.sha256 }];
    const identity = { source_fingerprint: sha('synthetic source set, not native'), entries_sha256: digest(entries),
        execution: { collection: 'school-combat', smoke: p.run_mode === 'smoke', source_files: copy(p.source_evidence) },
        conditions: [copy(c)] };
    return { format: 1, kind: 'martial_data_series', identity, entries, fingerprint: digest(identity) };
}
function seal(m) { m.identity.entries_sha256 = digest(m.entries); m.fingerprint = digest(m.identity); return m; }
function row(c, m, raw, index = 0) {
    raw = { ...copy(raw), index };
    return { format: 1, fingerprint: m.fingerprint, condition_id: c.id, condition_sha256: digest(c),
        index, outcome: raw.outcome, reason: raw.reason, raw_sha256: digest(raw), raw };
}
const rows = (c, m, raw, n = c.samples) => Array.from({ length: n }, (_, i) => row(c, m, raw, i));
const reject = (c, m, rs, change) => { const values = copy(rs); change(values); assert.throws(() => report(values, c, m)); };

test('original plans remain338/15670/676 and all actual catalog roles are bound', () => {
    assert.equal(formal.length, 338); assert.equal(smoke.length, 338);
    assert.equal(formal.reduce((n, c) => n + c.samples, 0), 15670);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 676);
    for (const c of formal) {
        const s = report([], c, manifest(c));
        assert.equal(s.effects.known, false); assert.equal(s.coverage.complete, false);
        assert.equal(s.effects.resources[0].qi.decrease.total, null);
    }
});
test('hand anchor: public practice command cost476 counts once, original gain13 and55/45 fees', () => {
    const c = select('pili-quan', 'public_practice', 'basic-plus-one'), m = manifest(c);
    const rs = rows(c, m, trace(c, { qi: 55, neili: 45, gain: 13, cost: 476 }));
    const s = report(rs, c, m);
    assert.equal(s.coverage.complete, true); assert.equal(s.effects.commands.accepted, 2);
    assert.equal(s.effects.commands.cost, 952); assert.equal(s.effects.commands.accepted_cost.median, 476);
    assert.equal(s.effects.resources[0].qi.decrease.total, 110); assert.equal(s.effects.resources[0].neili.decrease.total, 90);
    assert.equal(s.effects.practice.total_gain, 26); assert.equal(s.effects.practice.skill_level_change, 0);
    assert.equal(s.records[0].evidence.original_learned[0].before, null);
    assert.deepEqual(s.records[0].evidence.original_learned[0].after, { 'pili-quan': 13 });
    const text = markdown(s, m, rs); assert.match(text, /正式固定条件/); assert.match(text, /952/);
    assert.match(text, /原dbase/); assert.match(text, /未知/); assert.equal(markdown(s, m, rs), text);
});
test('failed valid_learn and direct practice retain original return0 despite accepted outer command', () => {
    for (const [ability, variant] of [['valid_learn', 'force-below'], ['practice_skill', 'qi-below']]) {
        const c = select('pili-quan', ability, variant), m = manifest(c), rs = rows(c, m, trace(c, { result: 0, cost: 23 }));
        const s = report(rs, c, m);
        assert.equal(s.coverage.refused, 2); assert.equal(s.coverage.complete, true);
        assert.equal(s.effects.commands.accepted, 2); assert.equal(s.effects.commands.cost, 46);
        assert.deepEqual(s.effects.interface_results, [0, 0]); assert.equal(s.effects.practice.total_gain, null);
        assert.equal(s.effects.refused_resources[0].neili.decrease.total, 0);
    }
});
test('ordinary calls are not commands and call hit ratios are not independent confidence intervals', () => {
    const c = select('pili-quan', 'ordinary', 'baseline', 200, 'smoke'), m = manifest(c);
    const rs = [row(c, m, trace(c, { hit: true }), 0), row(c, m, trace(c), 1)], s = report(rs, c, m);
    assert.equal(s.effects.commands.cost, null); assert.equal(s.effects.commands.accepted, null);
    assert.equal(s.effects.ordinary.attacks, 2); assert.equal(s.effects.ordinary.call_hit_rate, 0.5);
    assert.equal(s.effects.ordinary.any_hit.trials, 2); assert.equal(s.effects.ordinary.any_hit.successes, 1);
    assert.ok(s.effects.ordinary.any_hit.low95 < 0.5); assert.ok(s.effects.ordinary.any_hit.high95 > 0.5);
    assert.equal(s.effects.unknown.requested_damage, null);
    assert.match(markdown(s, m, rs), /烟雾，不能并入正式统计/);
});
test('poison seed, natural no-seed and original victim-HB removal use different denominators', () => {
    const c = select('hanbing-mianzhang', 'poison_lifecycle', 'normal', 200, 'smoke'), m = manifest(c);
    const rs = [row(c, m, trace(c), 0), row(c, m, trace(c, { seed: true, recovery: true }), 1)], s = report(rs, c, m);
    const life = s.effects.poison.lifecycle;
    assert.equal(life.n, 2); assert.equal(life.seeded, 1); assert.equal(life.no_seed, 1); assert.equal(life.completed, 1);
    assert.equal(life.removed_given_seed.trials, 1); assert.equal(life.heartbeats.mean, 4);
    assert.equal(life.natural_resources[1].qi.decrease.total, 40);
    assert.equal(life.natural_resources[1].qi.recovery.total, 5);
    assert.equal(life.natural_resources[1].qi.net_decrease.total, 35);
    assert.equal(s.effects.poison.return_values.filter(v => typeof v === 'string').length, 1);
    assert.match(markdown(s, m, rs), /无种毒 1，原解除 1/);
});
test('Report and Markdown reject re-sealed compressed clocks and flag3 healing despite balanced totals', () => {
    const c = select('hanbing-mianzhang', 'poison_lifecycle', 'normal', 200, 'smoke'), m = manifest(c);
    const raw = trace(c, { seed: true, recovery: true }), original = rows(c, m, raw), s = report(original, c, m);
    assert.equal(s.effects.poison.lifecycle.natural_resources[1].qi.decrease.total, 80);
    assert.equal(s.effects.poison.lifecycle.natural_resources[1].qi.recovery.total, 10);
    assert.equal(s.effects.poison.lifecycle.natural_resources[1].qi.net_decrease.total, 70);
    for (const [index, change] of [
        r => { r.condition_heartbeats.forEach(hb => { hb.wall_time_before = 1000; hb.wall_time_after = 1000; }); },
        r => { r.condition_heartbeats.forEach((hb, i) => { hb.wall_time_before = 1000 + 3 * i; hb.wall_time_after = 1000 + 3 * i; }); },
        r => { r.condition_heartbeats[1].wall_time_before = 1003; r.condition_heartbeats[1].wall_time_after = 1004; },
        r => {
            r.condition_heartbeats[0].after.qi += 5;
            for (const hb of r.condition_heartbeats.slice(1)) { hb.before.qi += 5; hb.after.qi += 5; }
            for (const event of r.condition_events.slice(2)) event.state.qi += 5;
            r.after[1].qi += 5; r.metrics[1].qi_recovery += 5;
            assert.equal(r.before[1].qi - r.after[1].qi, r.metrics[1].qi_cost - r.metrics[1].qi_recovery);
        },
    ].entries()) {
        const changed = copy(raw); change(changed);
        const rs = rows(c, m, changed), resealed = copy(s);
        rs.forEach((r, i) => { assert.equal(r.raw_sha256, digest(r.raw)); resealed.records[i].raw_sha256 = r.raw_sha256; });
        const reason = index === 3 ? /CND_NO_HEAL_UP forbids post-callback resource changes/
            : /original condition update clock has no feasible time/;
        assert.throws(() => report(rs, c, m), reason);
        assert.throws(() => markdown(resealed, m, rs), reason);
    }
    assert.match(markdown(s, m, original), /原解除 2/);
});
test('Xiaoyao original integer proc and80 neili cost do not invent natural busy duration', () => {
    const c = select('xiaoyao-jian', 'busy_passive', 'zero-incoming', 200, 'smoke'), m = manifest(c);
    const rs = rows(c, m, trace(c, { result: 1 })), s = report(rs, c, m);
    assert.equal(s.effects.busy.any_proc.successes, 2); assert.equal(s.effects.resources[0].neili.decrease.total, 160);
    assert.equal(s.effects.busy.duration_seconds, null); assert.equal(s.effects.ordinary.attacks, 0);
    assert.deepEqual(s.effects.interface_results, [1, 1]);
});
test('empty, missing, error and NA are unknown rather than zero measured gameplay', () => {
    const c = select('pili-quan', 'valid_learn', 'minimum'), m = manifest(c);
    const empty = report([], c, m); assert.deepEqual(empty.coverage.missing, [0, 1]);
    assert.equal(empty.effects.commands.cost, null); assert.equal(empty.effects.ordinary.hits, null);
    assert.equal(empty.effects.resources[1].qi.decrease.distribution.mean, null);
    for (const outcome of ['error', 'not_applicable']) {
        const raw = { kind: 'sample', condition_id: c.id, index: 0, method: c.method, elapsed: 600,
            outcome, reason: 'explicit synthetic diagnostic, not native completion' };
        const s = report([row(c, m, raw)], c, m);
        assert.equal(s.coverage.complete, false); assert.equal(s.effects.known, false);
        assert.equal(s.records[0].evidence, null); assert.equal(s.effects.resources[0].neili.decrease.total, null);
        assert.match(markdown(s, m, [row(c, m, raw)]), /未知/);
    }
    const partial = report([row(c, m, trace(c))], c, m);
    assert.equal(partial.effects.known, true); assert.equal(partial.effects.complete_plan, false);
});
test('duplicate slot, wrong condition/raw digest and illegal re-sealed raw are rejected', () => {
    const c = select('pili-quan', 'valid_learn', 'minimum'), m = manifest(c), rs = rows(c, m, trace(c));
    reject(c, m, rs, x => { x[1] = copy(x[0]); });
    reject(c, m, rs, x => { x[0].condition_sha256 = '0'.repeat(64); });
    reject(c, m, rs, x => { x[0].raw_sha256 = '0'.repeat(64); });
    reject(c, m, rs, x => { x[0].fingerprint = '0'.repeat(64); });
    reject(c, m, rs, x => { x[0].outcome = 'refused'; });
    reject(c, m, rs, x => { x[0].raw.after[0].neili--; x[0].raw_sha256 = digest(x[0].raw); });
    reject(c, m, rs, x => { x[0].raw.command_accepted = 1.5; x[0].raw_sha256 = digest(x[0].raw); });
    reject(c, m, rs, x => { delete x[0].raw.immediate_metrics; x[0].raw_sha256 = digest(x[0].raw); });
});
test('manifest mode, deterministic equal counts and formal100-to2 cannot relabel samples', () => {
    for (const c of [select('pili-quan', 'ordinary', 'baseline'), select('pili-quan', 'valid_learn', 'minimum')]) {
        const m = manifest(c), wrong = copy(m); wrong.identity.execution.smoke = true; seal(wrong);
        assert.throws(() => report([], c, wrong));
        const sc = smoke.find(x => x.id === c.id); assert.ok(sc);
        const mislabeled = manifest(sc); mislabeled.identity.execution.smoke = false; seal(mislabeled);
        assert.throws(() => report([], sc, mislabeled));
    }
    const c = copy(select('pili-quan', 'ordinary', 'baseline')); c.samples = 2;
    assert.throws(() => report([], c, manifest(c)));
    const noMode = copy(select('pili-quan', 'valid_learn', 'minimum')); delete noMode.parameters.run_mode;
    assert.throws(() => report([], noMode, manifest(noMode)));
});
test('original source closure and unique catalog id/role/path/hash are mandatory even after re-sealing', () => {
    const c = select('pili-quan', 'valid_learn', 'minimum');
    for (const change of [
        m => { delete m.identity.execution.source_files['feature/skill.c']; },
        m => { m.identity.execution.source_files[c.parameters.base_source.path] = '0'.repeat(64); },
        m => { m.entries[0].role = 'combat_interface'; },
        m => { m.entries[0].path = 'kungfu/skill/fake.c'; },
        m => { m.entries[0].sha256 = '0'.repeat(64); },
        m => { m.entries[0].id += '-foreign'; },
        m => { m.entries.push({ ...m.entries[0], sha256: '0'.repeat(64) }); },
        m => { m.identity.conditions.push(copy(c)); },
    ]) { const m = manifest(c); change(m); seal(m); assert.throws(() => report([], c, m)); }
});
test('Markdown requires the same original manifest and rows and rejects summary tampering', () => {
    const c = select('pili-quan', 'valid_learn', 'minimum'), m = manifest(c), rs = rows(c, m, trace(c));
    const s = report(rs, c, m), original = JSON.stringify([m, rs]);
    assert.throws(() => markdown(s, m)); assert.throws(() => markdown(s, undefined, rs));
    for (const change of [x => { x.series.smoke = true; }, x => { x.effects.commands.cost = 0; },
        x => { x.coverage.complete = false; }, x => { x.records[0].raw_sha256 = '0'.repeat(64); }]) {
        const changed = copy(s); change(changed); assert.throws(() => markdown(changed, m, rs));
    }
    assert.throws(() => markdown(s, m, rs.slice(0, 1)));
    markdown(s, m, rs); assert.equal(JSON.stringify([m, rs]), original, 'source evidence must not be rewritten');
});
