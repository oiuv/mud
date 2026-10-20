// Read-only consumer replay. Never calls a driver or rewrites collection evidence.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { openSeries, readSamples } from './ledger.mjs';
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
        smoke: manifest.identity.execution.smoke ?? null, runs, snapshot_gaps: snapshotGaps, ...replay };
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
            if (reason) pending.push({ batch: n, key, path, disposition: 'pending_review', reason });
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
