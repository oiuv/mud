// Read-only consumer replay. Never calls a driver or rewrites collection evidence.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { digest, openSeries, readSamples } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { validateRecord } from './execution.mjs';

export function summarizeReplay(conditions, rows, validate) {
    const result = { planned: conditions.reduce((n, c) => n + c.samples, 0), recorded: rows.length,
        outcomes: { observed: 0, refused: 0, error: 0, not_applicable: 0 },
        replayed: 0, passed: 0, failures: [], missing: [], pending: [] };
    const byId = new Map(conditions.map(c => [c.id, c]));
    const seen = new Set();
    for (const row of rows) {
        const c = byId.get(row.condition_id);
        assert.ok(c, 'unknown condition');
        const key = `${c.id}.${row.index}`;
        assert.ok(!seen.has(key), 'duplicate sample slot'); seen.add(key);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < c.samples);
        assert.ok(Object.hasOwn(result.outcomes, row.outcome));
        result.outcomes[row.outcome]++;
        if (['error', 'not_applicable'].includes(row.outcome)) {
            result.pending.push({ slot: key, outcome: row.outcome, reason: row.reason });
            continue;
        }
        result.replayed++;
        try {
            assert.equal(row.raw.outcome, row.outcome);
            assert.equal(row.raw.index, row.index);
            assert.equal(row.raw.condition_id, c.id);
            validate(row.raw, c);
            result.passed++;
        } catch (error) {
            result.failures.push({ slot: key, reason: error.message });
        }
    }
    for (const c of conditions) {
        const missing = Array.from({ length: c.samples }, (_, i) => i)
            .filter(i => !seen.has(`${c.id}.${i}`));
        if (missing.length) result.missing.push({ condition: c.id, indices: missing });
    }
    result.missing_samples = result.missing.reduce((n, c) => n + c.indices.length, 0);
    result.complete = result.missing_samples === 0 && result.failures.length === 0
        && result.pending.length === 0;
    return result;
}

async function validatorFor(condition) {
    const group = condition.parameters.collection_group;
    const batch = /^b([1-9]|[12][0-9])-perform$/.exec(group);
    if (batch) {
        const module = await import(`./b${batch[1]}_perform_cases.mjs`);
        return module[`validateB${batch[1]}Record`];
    }
    const slice = /^slice([1-8])-/.exec(group);
    if (slice) {
        const module = await import(`./school_slice${slice[1]}_cases.mjs`);
        return module[`validateSlice${slice[1]}Record`];
    }
    const combination = {
        'wudang-combination': ['school_wudang_combination_cases.mjs', 'validateWudangCombinationRecord'],
        'shaolin-combination': ['school_shaolin_combination_cases.mjs', 'validateShaolinCombinationRecord'],
        'emei-combination': ['school_emei_combination_cases.mjs', 'validateEmeiCombinationRecord'],
        'gumu-combination': ['school_gumu_combination_cases.mjs', 'validateGumuCombinationRecord'],
        'quanzhen-combination': ['school_quanzhen_combination_cases.mjs', 'validateQuanzhenCombinationRecord'],
        'huashan-combination': ['school_huashan_combination_cases.mjs', 'validateHuashanCombinationRecord'],
        'slice-combination': ['school_slice_combination_cases.mjs', 'validateSliceCombinationRecord'],
    };
    if (combination[group]) {
        const module = await import('./' + combination[group][0]);
        return module[combination[group][1]];
    }
    if (/^(quanzhen|huashan|mingjiao|taohua)-bout$/.test(group)
        || /^(wudang|shaolin|emei|gumu)-bout-perform$/.test(group)) {
        const module = await import('./school_combat_cases.mjs');
        return module.validateSchoolCombatRecord;
    }
    throw new Error(`Unsupported replay group (not counted as passed): ${group}`);
}

export async function reviewSeries(directory) {
    const manifest = openSeries(directory);
    // readSamples checks frozen condition hashes, raw hashes and slot identities.
    const rows = readSamples(directory, manifest);
    const validators = new Map();
    for (const c of manifest.identity.conditions)
        validators.set(c.id, await validatorFor(c));
    const replay = summarizeReplay(manifest.identity.conditions, rows,
        (raw, c) => { validateRecord(raw, c); validators.get(c.id)(raw, c); });
    const runsDir = join(directory, 'runs');
    const runs = existsSync(runsDir) ? readdirSync(runsDir).flatMap(name => {
        const path = join(runsDir, name, 'result.json');
        if (!existsSync(path)) return [];
        const r = JSON.parse(readFileSync(path, 'utf8'));
        return [{ attempt: name, process: r.process, imported: r.imported,
            validation_errors: r.validation_errors, incomplete_bytes: r.incomplete_bytes }];
    }) : [];
    const groups = new Set(manifest.identity.conditions.map(c => c.parameters.collection_group));
    const snapshotGaps = [...groups].filter(g => /^b\d+-perform$/.test(g)).map(g =>
        `tools/tests/martial_data/${g.replace('-perform', '_perform_cases')}.mjs`)
        .filter(p => !manifest.identity.execution.source_files?.[p]);
    return { directory, fingerprint: manifest.fingerprint,
        source_fingerprint: manifest.identity.source_fingerprint,
        execution_sha256: digest(manifest.identity.execution),
        conditions: manifest.identity.conditions.map(c => ({ id: c.id, sha256: digest(c),
            group: c.parameters.collection_group, planned: c.samples,
            recorded_indices: rows.filter(r => r.condition_id === c.id).map(r => r.index) })),
        smoke: manifest.identity.execution.smoke ?? null, runs, snapshot_gaps: snapshotGaps, ...replay };
}

// A repeated run is another attempt, not another planned sample position.
// Cross-version slots are coverage only; retain cohorts and never pool their statistics.
export function summarizeSeriesCoverage(series) {
    const conditions = new Map();
    let attempts = 0;
    for (const s of series.filter(s => s.smoke === false && !s.integrity_error)) {
        const failed = new Set([...s.failures, ...s.pending].map(f => f.slot));
        for (const c of s.conditions) {
            const key = `${s.source_fingerprint}:${c.sha256}`;
            const entry = conditions.get(key) ?? { id: c.id, group: c.group, condition_sha256: c.sha256,
                source_fingerprint: s.source_fingerprint, planned: c.planned, slots: new Map() };
            for (const index of c.recorded_indices) {
                attempts++;
                const slot = entry.slots.get(index) ?? { index, attempts: [] };
                slot.attempts.push({ directory: s.directory, execution_sha256: s.execution_sha256,
                    passed: !failed.has(`${c.id}.${index}`) });
                entry.slots.set(index, slot);
            }
            conditions.set(key, entry);
        }
    }
    const groups = {};
    const details = [...conditions.values()].map(c => {
        const slots = [...c.slots.values()].sort((a, b) => a.index - b.index);
        const passed = slots.filter(s => s.attempts.some(a => a.passed)).length;
        const g = groups[c.group] ??= { conditions: 0, complete_conditions: 0, planned: 0,
            attempts: 0, recorded_slots: 0, passed_slots: 0, multi_version_slots: 0 };
        g.conditions++; g.complete_conditions += Number(passed === c.planned); g.planned += c.planned;
        g.attempts += slots.reduce((n, s) => n + s.attempts.length, 0);
        g.recorded_slots += slots.length; g.passed_slots += passed;
        g.multi_version_slots += slots.filter(s => new Set(s.attempts.map(a => a.execution_sha256)).size > 1).length;
        return { ...c, slots };
    });
    const recorded = Object.values(groups).reduce((n, g) => n + g.recorded_slots, 0);
    return { attempts, recorded_slots: recorded, repeated_attempts: attempts - recorded,
        groups, conditions: details,
        excluded: series.filter(s => s.smoke !== false || s.integrity_error).map(s => s.directory),
        limitation: 'Coverage of supplied frozen conditions only. Execution versions stay separate; no pooled distribution or full 4.2 acceptance.' };
}

export async function reviewDefinitions() {
    const paths = new Map(), pending = [];
    let declarations = 0, activePlacements = 0;
    for (let n = 1; n <= 29; n++) {
        const module = await import(`./b${n}_perform_cases.mjs`);
        for (const [key, cfg] of Object.entries(module[`b${n}Schools`])) {
            declarations++;
            const path = `kungfu/skill/${cfg.skill}/${cfg.abilityPath ?? cfg.ability}.c`;
            const reason = module[`b${n}Pending`]?.[key];
            if (reason) pending.push({ batch: n, key, path,
                disposition: module[`b${n}Dispositions`]?.[key]?.disposition ?? 'pending_review', reason });
            else activePlacements++;
            const placements = paths.get(path) ?? [];
            placements.push({ batch: n, key, active: !reason }); paths.set(path, placements);
        }
    }
    return { declarations, active_placements: activePlacements,
        unique_declared_paths: paths.size,
        unique_active_paths: [...paths.values()].filter(ps => ps.some(p => p.active)).length,
        duplicates: [...paths].filter(([, ps]) => ps.length > 1)
            .map(([path, placements]) => ({ path, placements })),
        pending,
        limitation: 'Declarations are not executed coverage. Pending fixture/window items are not N/A acceptance.' };
}

export function reviewToolHashes(root) {
    const dir = join(root, 'tools/tests/martial_data');
    const paths = ['tools/review_martial_data.mjs', ...readdirSync(dir)
        .filter(n => n.endsWith('.mjs')).map(n => `tools/tests/martial_data/${n}`)];
    return Object.fromEntries(paths.sort().map(p => [p, sha256(readFileSync(join(root, p)))]));
}
