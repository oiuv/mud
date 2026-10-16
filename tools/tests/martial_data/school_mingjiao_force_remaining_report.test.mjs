// Synthetic missing/error reports only. They do not pretend producer/native readiness.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { digest } from './ledger.mjs';
import { mingjiaoForceRemainingConditions } from './school_mingjiao_force_remaining_cases.mjs';
import { mingjiaoForceRemainingReport as report, mingjiaoForceRemainingMarkdown as markdown } from './school_mingjiao_force_remaining_report.mjs';
import { healingStepExpected } from './school_wudang_healing_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url)), read = path => fs.readFileSync(new URL(path, new URL('../../../', import.meta.url)));
const catalog = collectCatalog(root, buildInventory(root));
const formal = mingjiaoForceRemainingConditions(catalog, read), smoke = mingjiaoForceRemainingConditions(catalog, read, { smoke: true });
const copy = v => structuredClone(v), sha = v => createHash('sha256').update(v).digest('hex');
function manifest(c) {
    const path = c.entry_id.split(':')[0], entry = { id: c.entry_id, path, sha256: c.parameters.source_evidence[path], role: c.entry_id.includes(':') ? 'exert' : 'file' };
    const entries = [entry], identity = { source_fingerprint: sha('synthetic only'), entries_sha256: digest(entries),
        conditions: [copy(c)], execution: { collection: 'school-combat', smoke: c.parameters.run_mode === 'smoke', source_files: copy(c.parameters.source_evidence) } };
    return { format: 1, kind: 'martial_data_series', identity, entries, fingerprint: digest(identity) };
}
function row(c, m, index = 0, outcome = 'error') {
    const raw = { kind: 'sample', method: c.method, condition_id: c.id, index, outcome, reason: 'synthetic missing producer', elapsed: 0.1 };
    return { format: 1, fingerprint: m.fingerprint, condition_id: c.id, condition_sha256: digest(c), index,
        outcome, reason: raw.reason, raw_sha256: digest(raw), raw };
}
function seal(m) { m.identity.entries_sha256 = digest(m.entries); m.fingerprint = digest(m.identity); }
// Reuse the explicit hand-written synthetic helpers, without importing node:test
// registrations, running a driver, or claiming these rows came from the game.
const fixtureText = fs.readFileSync(new URL('./school_mingjiao_force_remaining_record.test.mjs', import.meta.url), 'utf8');
const fixtureBody = fixtureText.slice(fixtureText.indexOf('const copy ='), fixtureText.indexOf('const bad ='));
const { successful, adversarial } = new Function('healingStepExpected', fixtureBody + '\nreturn { successful, adversarial };')(healingStepExpected);

test('all112 formal/smoke original manifests: missing/error are unknown not successful zeros', () => {
    for (const c of [...formal, ...smoke]) {
        const m = manifest(c), empty = report([], c, m), rs = [row(c, m)], s = report(rs, c, m);
        assert.equal(empty.coverage.complete, false); assert.equal(s.coverage.complete, false);
        assert.equal(s.coverage.errors, 1); assert.equal(s.effects.unknown_samples, c.samples);
        assert.equal(s.effects.resources[0].qi.decrease.total, null); assert.equal(s.effects.command_samples, 0);
        assert.equal(s.effects.commands_accepted, null); assert.equal(s.effects.known, false);
        const text = markdown(s, m, rs); assert.match(text, /未知/); assert.match(text, /未注册消费者准备/);
    }
});
test('full slots of errors/NA never close completion or fabricate resource distributions', () => {
    const c = smoke[0], m = manifest(c), rs = Array.from({ length: c.samples }, (_, i) => row(c, m, i, i ? 'not_applicable' : 'error'));
    const s = report(rs, c, m); assert.deepEqual(s.coverage.missing, []); assert.equal(s.coverage.complete, false);
    assert.equal(s.coverage.validated, 0); assert.equal(s.effects.unknown_samples, c.samples);
});
test('original mode/source/entry/condition must survive even a locally resealed manifest', () => {
    const c = formal[0];
    for (const mutate of [m => { m.identity.execution.smoke = true; }, m => { m.identity.conditions[0].samples--; },
        m => { m.entries[0].role = 'forged'; }, m => { m.entries[0].sha256 = 'a'.repeat(64); },
        m => { delete m.identity.execution.source_files['cmds/skill/research.c']; }, m => { m.identity.conditions.push(copy(c)); }]) {
        const m = manifest(c); mutate(m); seal(m); assert.throws(() => report([], c, m));
    }
});
test('row digest/index/identity duplication and forged report Markdown cannot be laundered', () => {
    const c = smoke[0], m = manifest(c), r = row(c, m), s = report([r], c, m);
    assert.throws(() => report([r, copy(r)], c, m));
    for (const mutate of [v => { v.raw.reason += '!'; }, v => { v.reason = 'different'; }, v => { v.index = c.samples; },
        v => { v.fingerprint = 'b'.repeat(64); }, v => { v.condition_sha256 = 'b'.repeat(64); }]) {
        const v = copy(r); mutate(v); assert.throws(() => report([v], c, m));
    }
    const fake = copy(s); fake.coverage.complete = true; assert.throws(() => markdown(fake, m, [r]));
    assert.throws(() => markdown(s, m)); assert.throws(() => markdown(s, m, []));
});
test('all nine panels recompute valid complete synthetic rows and Markdown, including refusals without faked effects', () => {
    for (const panel of ['research', 'exercise', 'inherited-hit', 'capacity', 'expiry', 'healing', 'dispel', 'repeat', 'recovery']) {
        const c = formal.find(c => c.parameters.panel === panel), m = manifest(c), sample = successful(c);
        const rows = Array.from({ length: c.samples }, (_, index) => {
            const raw = { ...copy(sample), index };
            return { format: 1, fingerprint: m.fingerprint, condition_id: c.id, condition_sha256: digest(c),
                index, outcome: raw.outcome, reason: raw.reason, raw_sha256: digest(raw), raw };
        });
        const s = report(rows, c, m); assert.equal(s.coverage.complete, true); assert.equal(s.coverage.validated, c.samples);
        assert.ok(markdown(s, m, rows).includes(c.id));
        const fake = copy(s); fake.effects.resources[0].qi.decrease.total++;
        assert.throws(() => markdown(fake, m, rows));
        const wrong = copy(rows); wrong[0].raw.metrics[0].qi_cost = (wrong[0].raw.metrics[0].qi_cost ?? 0) + 1;
        wrong[0].raw_sha256 = digest(wrong[0].raw); assert.throws(() => report(wrong, c, m), 'resealing raw must not bypass original resource ledger');
    }
});

test('held-sword synthetic reports preserve real equipment apply and reject stripped or double-counted stats', () => {
    const c = formal.find(c => c.parameters.panel === 'inherited-hit' && c.parameters.variant === 'held-sword');
    const m = manifest(c), sample = successful(c);
    const wrap = raw => ({ format: 1, fingerprint: m.fingerprint, condition_id: c.id, condition_sha256: digest(c),
        index: raw.index, outcome: raw.outcome, reason: raw.reason, raw_sha256: digest(raw), raw });
    const rows = Array.from({ length: c.samples }, (_, index) => wrap({ ...copy(sample), index }));
    const valid = report(rows, c, m); assert.equal(valid.coverage.complete, true);
    assert.ok(markdown(valid, m, rows).includes(c.id));
    const edits = [s => { delete s.temp.apply.damage; },
        s => { delete s.temp.apply.dodge; s.effective_skills.dodge = 100; },
        s => { s.effective_skills.dodge--; },
        s => { s.temp.weapon = '/tests/sword#999'; }];
    for (const edit of edits) {
        const wrong = copy(rows), raw = wrong[0].raw;
        for (const phase of ['before', 'immediate', 'after']) edit(raw[phase][0]);
        wrong[0] = wrap(raw);
        assert.throws(() => report(wrong, c, m));
        assert.throws(() => markdown(valid, m, wrong), 're-signing rows must not launder false equipment');
    }
});
test('all eight independent causal counterexamples reject even canonically resealed report rows and forged complete Markdown', () => {
    for (const { label, condition: c, raw, reason } of adversarial(formal)) {
        const m = manifest(c), wrapped = { format: 1, fingerprint: m.fingerprint, condition_id: c.id, condition_sha256: digest(c),
            index: raw.index, outcome: raw.outcome, reason: raw.reason, raw_sha256: digest(raw), raw };
        assert.throws(() => report([wrapped], c, m), reason, label);
        const forged = report([], c, m); forged.coverage.complete = true;
        assert.throws(() => markdown(forged, m, [wrapped]), reason, label + ' Markdown');
    }
});
