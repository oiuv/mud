// Resealed synthetic rows test the consumer boundary, not real gameplay quality.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { scanSource, sha256 } from './inventory.mjs';
import { buildCatalog } from './catalog.mjs';
import { digest } from './ledger.mjs';
import { mingjiaoCombinationConditions as make, mingjiaoCombinationSourcePaths as paths } from './school_mingjiao_combination_cases.mjs';
import { createMingjiaoCombinationRecordValidator } from './school_mingjiao_combination_record.mjs';
import { mingjiaoCombinationReport as report, mingjiaoCombinationMarkdown as markdown } from './school_mingjiao_combination_report.mjs';

const source = fs.readFileSync(new URL('./school_mingjiao_combination_record.test.mjs', import.meta.url), 'utf8');
const fixtureBody = source.slice(source.indexOf('export function syntheticMingjiaoCombinationFixtures()'),
    source.indexOf('// END_SYNTHETIC_FIXTURES')).replace('export function ', 'function ').replaceAll('import.meta.url', 'fixtureUrl');
const factory = new Function('assert', 'fs', 'scanSource', 'sha256', 'buildCatalog', 'make', 'paths',
    'createMingjiaoCombinationRecordValidator', 'fixtureUrl', fixtureBody + '\nreturn syntheticMingjiaoCombinationFixtures;')(
    assert, fs, scanSource, sha256, buildCatalog, make, paths, createMingjiaoCombinationRecordValidator,
    new URL('./school_mingjiao_combination_record.test.mjs', import.meta.url).href);
const { formal, smoke, trace, sourceContext, copy } = factory();
const seal = m => { m.identity.entries_sha256 = digest(m.entries); m.fingerprint = digest(m.identity); return m; };
function manifest(c) {
    const entries = [{ id: c.entry_id, path: c.entry_id, role: c.method === 'bout' ? 'npc' : 'file',
        sha256: c.parameters.source_evidence[c.entry_id] }];
    return seal({ format: 1, kind: 'martial_data_series', entries,
        identity: { source_fingerprint: sha256('synthetic-not-native'), entries_sha256: digest(entries),
            execution: { collection: 'school-combat', smoke: c.parameters.run_mode === 'smoke',
                source_files: copy(c.parameters.source_evidence) }, conditions: [copy(c)] } });
}
function row(c, m, raw, index) {
    raw = { ...copy(raw), index };
    return { format: 1, fingerprint: m.fingerprint, condition_id: c.id, condition_sha256: digest(c),
        index, outcome: raw.outcome, reason: raw.reason, raw_sha256: digest(raw), raw };
}
const rows = (c, m, raw) => Array.from({ length: c.samples }, (_, i) => row(c, m, trace(c, { index: i, ...(raw ?? {}) }), i));
const reseal = rs => rs.forEach(r => { r.raw_sha256 = digest(r.raw); r.outcome = r.raw.outcome; r.reason = r.raw.reason; });
function reject(c, m, rs, edit) {
    const altered = copy(rs); edit(altered); reseal(altered);
    assert.throws(() => report(altered, c, m, sourceContext));
}

test('every reviewed method and all nine NPCs have mode-bound report evidence, not zero-filled absence', () => {
    for (const c of smoke) {
        const m = manifest(c), rs = rows(c, m), s = report(rs, c, m, sourceContext);
        assert.equal(s.coverage.complete, true, c.id); assert.equal(s.coverage.validated, 2);
        assert.equal(s.series.smoke, true); assert.match(markdown(s, m, rs, sourceContext), /独立烟雾/);
        const empty = report([], c, m, sourceContext);
        assert.equal(empty.coverage.complete, false); assert.equal(empty.effects.known, false);
        assert.equal(empty.effects.resources[0].qi.decrease.total, null);
        assert.equal(empty.effects.commands.evaluation_cost, null);
    }
});

test('hand anchor preserves per-step evaluation cost and partial preparation acceptance', () => {
    const c = formal.find(c => c.id.endsWith('pili-quan-feihua-zhang-sequential'));
    const m = manifest(c), rs = rows(c, m), s = report(rs, c, m, sourceContext);
    assert.equal(s.coverage.complete, true); assert.equal(s.coverage.observed, 2);
    assert.equal(s.effects.commands.steps, 4); assert.equal(s.effects.commands.accepted, 2);
    assert.equal(s.effects.commands.refused, 2); assert.equal(s.effects.commands.evaluation_cost, 626);
    assert.equal(s.effects.resources[0].neili.decrease.total, 0);
    const md = markdown(s, m, rs, sourceContext); assert.match(md, /626/); assert.match(md, /非成功率/);
    assert.match(md, /正式固定条件/);
    const changed = copy(s); changed.effects.commands.evaluation_cost++;
    assert.throws(() => markdown(changed, m, rs, sourceContext));
    reject(c, m, rs, x => x[0].raw.prepare_steps[1].accepted = 313);
});

test('formal 100-round sampling stays independent of 0/1/2 attack-count denominators', () => {
    const c = formal.find(c => c.method === 'round' && c.id.endsWith('-pair')), m = manifest(c);
    const rs = Array.from({ length: 100 }, (_, i) => row(c, m, trace(c, { attacks: i % 3 }), i));
    const s = report(rs, c, m, sourceContext);
    assert.equal(s.coverage.complete, true); assert.equal(s.effects.rounds.samples, 100);
    assert.equal(s.effects.attacks, 99); assert.equal(s.effects.rounds.primary_attacks.mean, 0.99);
    assert.equal(s.effects.rounds.any_hit.trials, 100); assert.equal(s.effects.rounds.any_hit.successes, 0);
    reject(c, m, rs, x => x[1].raw.metrics[0].dodge++);
    reject(c, m, rs, x => { x[2].raw.attacks[1].action_flag = 0; });
});

test('NPC nets, unobserved gross and original closure returns never become command success or zero endpoints', () => {
    const c = smoke.find(c => c.parameters.npc?.id === 'fanyao'), m = manifest(c);
    const rs = [row(c, m, trace(c, { fanyaoChoice: true }), 0),
        row(c, m, trace(c, { index: 1, death: true, pendingRound: true }), 1)];
    const s = report(rs, c, m, sourceContext);
    assert.equal(s.coverage.complete, true); assert.equal(s.effects.npc.samples, 2);
    assert.equal(s.effects.npc.gross_resources, 'not_observed'); assert.equal(s.effects.npc.user_wins, 1);
    assert.equal(s.effects.npc.endpoint_net_loss.qi.n, 1); assert.equal(s.effects.npc.preterminal_net_loss.qi.n, 1);
    assert.equal(s.effects.npc.choices[0].calls, 1); assert.deepEqual(s.effects.npc.choices[0].raw_returns, [null]);
    assert.equal(s.effects.npc.choices[0].command_evaluation_cost, null);
    reject(c, m, rs, x => x[0].raw.npc_bout.chat_choices[0].owner = '/external#1');
    reject(c, m, rs, x => x[1].raw.attack_rounds[0].result = 0);
    reject(c, m, rs, x => x[1].raw.npc_bout.corpse_returns = []);
    const altered = copy(s); altered.effects.npc.gross_resources = 0;
    assert.throws(() => markdown(altered, m, rs, sourceContext));
});

test('error and missing observations keep coverage incomplete and unknowns distinct from measured zero', () => {
    const c = smoke[0], m = manifest(c);
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: 0,
        outcome: 'error', reason: 'observer failure preserved' };
    const rs = [row(c, m, raw, 0)], s = report(rs, c, m, sourceContext);
    assert.equal(s.coverage.complete, false); assert.equal(s.coverage.errors, 1);
    assert.deepEqual(s.coverage.missing, [1]); assert.equal(s.effects.known, false);
    assert.equal(s.effects.resources[0].qi.decrease.total, null);
    assert.equal(s.effects.attacks, null); assert.equal(s.records[0].evidence, null);
    const all = [row(c, m, raw, 0), row(c, m, raw, 1)];
    assert.equal(report(all, c, m, sourceContext).coverage.complete, false, 'all errors cannot pass');
    reject(c, m, rs, x => x[0].raw.reason = '');
});

test('re-signed raw tampering cannot bypass nested consumers or original manifest source/mode binding', () => {
    const c = smoke.find(c => c.method === 'bout'), m = manifest(c), rs = rows(c, m);
    for (const edit of [x => delete x[0].raw.npc_observation.before.effective_mappings,
        x => x[0].raw.npc_observation.before.properties.jiali++,
        x => x[0].raw.npc_observation.cleanup.objects.pop(),
        x => x[0].raw.npc_bout.first_actor = 0,
        x => x[0].raw.npc_bout.npc_gross_resources = 0]) reject(c, m, rs, edit);
    for (const edit of [x => x.identity.execution.smoke = false,
        x => x.identity.execution.source_files[paths[0]] = '0'.repeat(64),
        x => x.identity.conditions.push(copy(c)), x => x.entries[0].role = 'perform',
        x => x.entries[0].sha256 = '0'.repeat(64)]) {
        const altered = copy(m); edit(altered); seal(altered);
        const rebound = copy(rs); rebound.forEach(r => r.fingerprint = altered.fingerprint);
        assert.throws(() => report(rebound, c, altered, sourceContext));
    }
    assert.throws(() => report([rs[0], rs[0]], c, m, sourceContext));
    const altered = copy(rs); altered[0].condition_sha256 = '0'.repeat(64);
    assert.throws(() => report(altered, c, m, sourceContext));
});

test('Markdown requires original rows and recomputes even when raw digests and summary were replaced', () => {
    const c = smoke.find(c => c.method === 'prepare'), m = manifest(c), rs = rows(c, m);
    const s = report(rs, c, m, sourceContext);
    assert.throws(() => markdown(s, m, undefined, sourceContext));
    const altered = copy(rs); altered[0].raw.prepare_steps[0].after.neili--; reseal(altered);
    assert.throws(() => markdown(s, m, altered, sourceContext));
    const forged = copy(s); forged.coverage.complete = false;
    assert.throws(() => markdown(forged, m, rs, sourceContext));
});

test('re-signed review witnesses cannot turn false post/choice effective values into complete reports or Markdown', () => {
    const c = smoke.find(c => c.parameters.npc?.id === 'fanyao'), m = manifest(c);
    const original = rows(c, m, { fanyaoChoice: true }), s = report(original, c, m, sourceContext);
    for (const edit of [rs => rs[0].raw.npc_observation.after.effective_skills.force = 99999,
        rs => {
            const raw = rs[0].raw;
            for (const state of [raw.npc_bout.chat_choices[0].before_state,
                raw.npc_bout.chat_choices[0].after_state, raw.npc_observation.after]) {
                state.effective_mappings.finger = null; state.effective_skills.finger = 170;
            }
        }]) {
        const altered = copy(original); edit(altered); reseal(altered);
        assert.throws(() => report(altered, c, m, sourceContext));
        assert.throws(() => markdown(s, m, altered, sourceContext));
    }
    const buffed = copy(original);
    for (const r of buffed) for (const state of [r.raw.npc_bout.chat_choices[0].before_state,
        r.raw.npc_bout.chat_choices[0].after_state, r.raw.npc_observation.after]) {
        state.temp.apply = { force: 20, finger: 15 };
        state.effective_skills.force = 190; state.effective_skills.finger = 525;
    }
    reseal(buffed);
    const valid = report(buffed, c, m, sourceContext);
    assert.equal(valid.coverage.complete, true);
    assert.match(markdown(valid, m, buffed, sourceContext), /独立烟雾/);
});
