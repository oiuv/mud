// Persistent producer wiring contracts. Synthetic traces are not native samples or gameplay coverage.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { buildInventory, scanSource, sha256 } from './inventory.mjs';
import { buildCatalog, collectCatalog } from './catalog.mjs';
import { createSeries, openSeries, digest } from './ledger.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { selectConditions, validateQualificationSources } from './execution.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';
import { mingjiaoForceRemainingConditions } from './school_mingjiao_force_remaining_cases.mjs';
import { validateMingjiaoForceRemainingRecord } from './school_mingjiao_force_remaining_record.mjs';
import { mingjiaoForceRemainingReport, mingjiaoForceRemainingMarkdown } from './school_mingjiao_force_remaining_report.mjs';
import { mingjiaoCombinationConditions, mingjiaoCombinationSourcePaths } from './school_mingjiao_combination_cases.mjs';
import { createMingjiaoCombinationRecordValidator } from './school_mingjiao_combination_record.mjs';
import { mingjiaoCombinationReport, mingjiaoCombinationMarkdown } from './school_mingjiao_combination_report.mjs';
import { healingStepExpected } from './school_wudang_healing_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const evidence = fs.mkdtempSync(join(tmpdir(), 'mud-mingjiao-producer-integration-'));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const readSource = path => fs.readFileSync(join(root, path));
const sourceContext = { catalog, readSource }, copy = x => structuredClone(x);
const groups = ['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout'];
const total = conditions => conditions.reduce((n, c) => n + c.samples, 0);
const sumShapes = { formal: 149, smoke: 289 };
let registry;
function plans() {
    if (!registry) registry = Object.fromEntries(['formal', 'smoke'].map(mode => {
        const all = schoolCombatConditions(catalog, { smoke: mode === 'smoke' });
        return [mode, Object.fromEntries(groups.map(caseGroup => [caseGroup, selectConditions(all, { caseGroup })]))];
    }));
    return registry;
}

// Same explicitly-authored helper extraction as existing report tests: do not import node:test registrations.
const combinationUrl = new URL('./school_mingjiao_combination_record.test.mjs', import.meta.url).href;
const combinationSource = fs.readFileSync(new URL(combinationUrl), 'utf8');
const combinationBody = combinationSource.slice(combinationSource.indexOf('export function syntheticMingjiaoCombinationFixtures()'),
    combinationSource.indexOf('// END_SYNTHETIC_FIXTURES')).replace('export function ', 'function ')
    .replaceAll('import.meta.url', 'fixtureUrl');
const combinationFixture = new Function('assert', 'fs', 'scanSource', 'sha256', 'buildCatalog', 'make', 'paths',
    'createMingjiaoCombinationRecordValidator', 'fixtureUrl', combinationBody + '\nreturn syntheticMingjiaoCombinationFixtures();')(
    assert, fs, scanSource, sha256, buildCatalog, mingjiaoCombinationConditions, mingjiaoCombinationSourcePaths,
    createMingjiaoCombinationRecordValidator, combinationUrl);
const forceSource = fs.readFileSync(new URL('./school_mingjiao_force_remaining_record.test.mjs', import.meta.url), 'utf8');
const forceBody = forceSource.slice(forceSource.indexOf('const copy ='), forceSource.indexOf('const bad ='));
const { successful, adversarial } = new Function('healingStepExpected', forceBody + '\nreturn { successful, adversarial };')(healingStepExpected);
const combinationChecks = Object.fromEntries(['formal', 'smoke'].map(mode => [mode,
    createMingjiaoCombinationRecordValidator(catalog, readSource, { smoke: mode === 'smoke' })]));
const datasets = new Map();
function isForce(c) { return c.parameters.collection_group === groups[0]; }
function strict(raw, c) {
    return isForce(c) ? validateMingjiaoForceRemainingRecord(raw, c) : combinationChecks[c.parameters.run_mode](raw, c);
}
function raw(c, index) {
    const result = isForce(c) ? successful(c) : combinationFixture.trace(c, { index });
    result.index = index; return result;
}
function row(c, manifest, index, record = raw(c, index)) {
    return { format: 1, fingerprint: manifest.fingerprint, condition_id: c.id, condition_sha256: digest(c), index,
        outcome: record.outcome, reason: record.reason, raw_sha256: digest(record), raw: record };
}
function dataset(mode, group) {
    const key = mode + ':' + group;
    if (datasets.has(key)) return datasets.get(key);
    const conditions = plans()[mode][group], directory = fs.mkdtempSync(join(evidence, mode + '-'));
    const manifest = createSeries(directory, { inventory: { ...inventory, versions: { node: process.version,
        scope: 'pure_contract_no_driver' } }, catalog, conditions,
        execution: { collection: 'school-combat', smoke: mode === 'smoke', source_files: copy(conditions[0].parameters.source_evidence) },
        npcEntries: conditions.filter(c => c.method === 'bout').map(c => copy(c.parameters.npc.source)) });
    assert.deepEqual(openSeries(directory), manifest);
    assert.deepEqual(openSeries(directory, manifest.identity), manifest);
    const rows = conditions.flatMap(c => Array.from({ length: mode === 'formal' ? 1 : c.samples }, (_, i) => row(c, manifest, i)));
    const result = { mode, group, conditions, directory, manifest, rows, summaries: [] };
    datasets.set(key, result); return result;
}
function report(rows, c, manifest) {
    return isForce(c) ? mingjiaoForceRemainingReport(rows, c, manifest)
        : mingjiaoCombinationReport(rows, c, manifest, sourceContext);
}
function markdown(summary, rows, c, manifest) {
    return isForce(c) ? mingjiaoForceRemainingMarkdown(summary, manifest, rows)
        : mingjiaoCombinationMarkdown(summary, manifest, rows, sourceContext);
}
function top(data) {
    return { fingerprint: data.manifest.fingerprint, evidence_sha256: digest(data.summaries),
        totals: { conditions: data.conditions.length, samples: data.rows.length,
            observed: data.rows.filter(r => r.outcome === 'observed').length,
            refused: data.rows.filter(r => r.outcome === 'refused').length }, conditions: data.summaries };
}
function summaries(data) {
    if (!data.summaries.length) data.summaries = data.conditions.map(c => ({ id: c.id,
        [isForce(c) ? 'mingjiao_force_remaining' : 'mingjiao_combination']:
            report(data.rows.filter(r => r.condition_id === c.id), c, data.manifest) }));
    return data.summaries;
}
function rejectAtFiveEntries(data, c, changed, label, reason) {
    const originalRows = data.rows.filter(r => r.condition_id === c.id), alteredRows = copy(originalRows);
    alteredRows[0] = row(c, data.manifest, 0, changed);
    const summary = report(originalRows, c, data.manifest);
    const allRows = [...data.rows.filter(r => r.condition_id !== c.id), ...alteredRows];
    summaries(data);
    for (const [entry, run] of [
        ['strict', () => strict(changed, c)],
        ['dispatcher', () => validateSchoolCombatRecord(changed, c, sourceContext)],
        ['Report', () => report(alteredRows, c, data.manifest)],
        ['Markdown', () => markdown(summary, alteredRows, c, data.manifest)],
        ['global Markdown', () => schoolCombatMarkdown(top(data), data.manifest, allRows, sourceContext)],
    ]) assert.throws(run, reason, label + ': ' + entry);
    return { label, manifest: data.manifest, rows: alteredRows, rejected_entries: 5 };
}

test('real global factory registers exact unchanged112/28/9 plans, modes and source qualification', t => {
    t.diagnostic('Pure-contract evidence, not native samples: ' + evidence);
    for (const mode of ['formal', 'smoke']) {
        const registered = plans()[mode], smoke = mode === 'smoke';
        const expectedForce = mingjiaoForceRemainingConditions(catalog, readSource, { smoke });
        const expectedCombo = mingjiaoCombinationConditions(catalog, readSource, { smoke });
        assert.deepEqual(registered[groups[0]], expectedForce);
        for (const group of groups.slice(1)) assert.deepEqual(registered[group], expectedCombo.filter(c => c.parameters.collection_group === group));
        assert.deepEqual(groups.map(g => registered[g].length), [112, 28, 9]);
        assert.deepEqual(groups.map(g => total(registered[g])), smoke ? [215, 56, 18] : [2772, 840, 180]);
        for (const group of groups) validateQualificationSources(registered[group], registered[group][0].parameters.source_evidence, sourceContext);
        assert.throws(() => validateQualificationSources([...expectedForce, ...expectedCombo], {}, sourceContext), /独立/);
    }
});

test('three original independent groups actually create and reopen in both modes with true file/NPC entries', () => {
    for (const mode of ['formal', 'smoke']) for (const group of groups) {
        const data = dataset(mode, group);
        assert.deepEqual(data.manifest.identity.conditions, plans()[mode][group]);
        for (const c of data.conditions) {
            const entry = data.manifest.entries.filter(e => e.id === c.entry_id); assert.equal(entry.length, 1);
            assert.equal(entry[0].sha256, c.parameters.source_evidence[entry[0].path]);
            assert.equal(entry[0].role, c.method === 'bout' ? 'npc' : c.entry_id.includes(':') ? 'exert' : 'file');
        }
        assert.equal(data.manifest.entries.filter(e => e.role === 'npc').length, group === groups[2] ? 9 : 0);
    }
});

test('actual dispatcher and strict records accept149 formal shapes and all289 independent smoke shapes', () => {
    for (const mode of ['formal', 'smoke']) {
        let count = 0;
        for (const group of groups) for (const r of dataset(mode, group).rows) {
            const c = plans()[mode][group].find(c => c.id === r.condition_id);
            assert.ok(strict(r.raw, c)); assert.ok(validateSchoolCombatRecord(r.raw, c, sourceContext)); count++;
        }
        assert.equal(count, sumShapes[mode]);
    }
});

test('dedicated Report/Markdown and global Markdown validate the same original149/289 shapes without native claims', () => {
    for (const mode of ['formal', 'smoke']) {
        let count = 0;
        for (const group of groups) {
            const data = dataset(mode, group);
            for (const c of data.conditions) {
                const rs = data.rows.filter(r => r.condition_id === c.id), summary = report(rs, c, data.manifest);
                assert.equal(summary.coverage.validated, rs.length);
                assert.equal(summary.coverage.complete, rs.length === c.samples);
                assert.equal(typeof markdown(summary, rs, c, data.manifest), 'string'); count += rs.length;
            }
            summaries(data);
            assert.equal(typeof schoolCombatMarkdown(top(data), data.manifest, data.rows, sourceContext), 'string');
        }
        assert.equal(count, sumShapes[mode]);
    }
});

test('eight existing force adversaries reject at strict/dispatch/Report/Markdown/global Markdown after resealing', () => {
    const data = dataset('smoke', groups[0]), cases = adversarial(data.conditions); assert.equal(cases.length, 8);
    const witnesses = cases.map(x => rejectAtFiveEntries(data, x.condition, x.raw, x.label, x.reason));
    fs.writeFileSync(join(evidence, 'force-resealed-witnesses.json'), JSON.stringify(witnesses, null, 2) + '\n', { flag: 'wx' });
});

test('missing/forged/incorrect-owner/inconsistent skill-load evidence cannot bypass any of five entries', () => {
    const data = dataset('smoke', groups[2]), c = data.conditions.find(c => c.parameters.npc.id === 'daijisi');
    const original = data.rows.find(r => r.condition_id === c.id).raw;
    const edits = {
        missing: r => delete r.skill_load_contexts,
        forged: r => r.skill_load_contexts = [{ actor: 'FAKE', skill: 'FORGED', result: 99 }],
        wrong_owner: r => { r.skill_load_contexts[0].actor = r.npc_observation.before.object;
            r.npc_observation.preparation.skill_load_contexts = copy(r.skill_load_contexts); },
        inconsistent_metadata: r => r.npc_observation.preparation.skill_load_contexts[0].already_loaded = 1,
        inconsistent_skills: r => { r.skill_load_contexts[0].skills.force--;
            r.npc_observation.preparation.skill_load_contexts = copy(r.skill_load_contexts); },
        wrong_result: r => { r.skill_load_contexts[0].result = 99;
            r.npc_observation.preparation.skill_load_contexts = copy(r.skill_load_contexts); },
    };
    const witnesses = Object.entries(edits).map(([label, edit]) => {
        const changed = copy(original); edit(changed); return rejectAtFiveEntries(data, c, changed, label);
    });
    fs.writeFileSync(join(evidence, 'load-resealed-witnesses.json'), JSON.stringify(witnesses, null, 2) + '\n', { flag: 'wx' });
    const altered = copy(top(data)); delete altered.conditions[0].mingjiao_combination;
    assert.throws(() => schoolCombatMarkdown(altered, data.manifest, data.rows, sourceContext));
});

test('wall/per remain required actual fields; producer query checks use tokens, not formatting or expected literals', () => {
    for (const mode of ['formal', 'smoke']) for (const group of groups.slice(1)) {
        const data = dataset(mode, group);
        for (const c of data.conditions) {
            const original = data.rows.find(r => r.condition_id === c.id).raw;
            assert.equal(c.parameters.actor.properties['can_learn/yunv-xinjing/wall'], 0);
            const missing = copy(original); delete missing.before[0].cultivation['can_learn/yunv-xinjing/wall'];
            assert.throws(() => strict(missing, c));
            const wrong = copy(original); wrong.before[0].cultivation['can_learn/yunv-xinjing/wall'] = null;
            assert.throws(() => strict(wrong, c));
            if (group === groups[1]) {
                const missingPer = copy(original); delete missingPer.before[0].per;
                assert.throws(() => strict(missingPer, c));
            }
        }
    }
    const runner = fs.readFileSync(new URL('./runner.lpc', import.meta.url), 'utf8');
    const tokens = source => tokenize(source).filter(t => !['whitespace', 'comment', 'directive'].includes(t.kind)).map(t => t.text);
    const actual = tokens(runner), contains = fragment => {
        const expected = tokens(fragment);
        assert.ok(actual.some((_, i) => expected.every((text, j) => actual[i + j] === text)), 'actual query token sequence: ' + fragment);
    };
    contains('({ "mingjiao-combination", "mingjiao-npc-bout" })');
    contains('result["per"] = ob->query("per");');
    contains('foreach (key in ({ "character", "can_learn/yunv-xinjing/wall" })) result["cultivation"][key] = ob->query(key);');
});
