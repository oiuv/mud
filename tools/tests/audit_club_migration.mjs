// Strict frozen-source/caller/effective-identity audit; no live records.
import assert from 'node:assert/strict';
import { afterBookMigration } from './book_inventory.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { root, readBaseline, canonicalGroups, expectedCaller, renderDefinitions, original } from './club_inventory.mjs';
const semantic = source => tokenize(source.replaceAll('\r\n', '\n')).filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const data = readBaseline();
assert.equal(data.varieties.length, 18); assert.equal(data.excluded.length, 9);
assert.equal(data.hits.length, 27); assert.equal(new Set(data.hits.map(h => h.file)).size, 21);
assert.equal(data.dynamic.length, 4); assert.equal(Object.keys(data.callers).length, 24);
if (!process.argv.includes('--baseline-only')) {
    for (const file of Object.keys(data.callers)) {
        assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(afterBookMigration(file, expectedCaller(file), semantic)), file);
        assert.deepEqual(semantic(data.callers[file]), semantic(original(file)), 'Frozen caller: ' + file);
        const paths = new Map();
        for (const hit of data.hits.filter(h => h.file === file)) {
            if (!paths.has(hit.new_path)) paths.set(hit.new_path, new Set());
            paths.get(hit.new_path).add(hit.old_path);
        }
        assert.ok([...paths.values()].every(values => values.size === 1), 'Review merged configuration keys: ' + file);
    }
    assert.equal(references(data.varieties).hits.length, 0, 'Old runtime references');
    assert.deepEqual(semantic(readFileSync(join(root, 'd/items/club_data.h'), 'utf8')), semantic(renderDefinitions()));
    for (const row of data.varieties) {
        assert.equal(createHash('sha256').update(row.source).digest('hex'), row.source_hash);
        if (!process.argv.includes('--before-removal')) assert.equal(existsSync(join(root, row.old_path.slice(1) + '.c')), false);
        for (const suffix of ['.c', '.lpc']) assert.equal(existsSync(join(root, row.new_path.slice(1) + suffix)), false);
    }
    for (const { file, source_hash } of data.excluded) {
        assert.equal(createHash('sha256').update(readFileSync(join(root, file))).digest('hex'), source_hash, 'Special club changed: ' + file);
    }
    for (const { file } of data.dynamic) if (!data.callers[file])
        assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(original(file)), 'Unrelated dynamic clue changed: ' + file);
}
const normalize = value => Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).filter(([k]) => k !== 'id').sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, normalize(v)])) : value;
const identity = row => { const { path, ids, ...record } = data.observations.find(o => o.path === row.old_path); return normalize(record); };
assert.equal(data.observations.length, 18);
assert.equal(data.observations.filter(o => o.blueprint.flag === 16).length, 18);
assert.equal(new Set(data.varieties.map(row => JSON.stringify(identity(row)))).size, canonicalGroups().length,
    'All effectively identical clubs must merge');
for (const group of canonicalGroups()) for (const row of group.rows)
    assert.deepEqual(identity(row), identity(group.representative), 'Effective grouping: ' + group.id);
console.log(`CLUB AUDIT PASS: 18 originals -> ${canonicalGroups().length} varieties; 24 callers, 27 static + 3 dynamic; LONG flags`
    + (process.argv.includes('--baseline-only') ? '; baseline only' : '; no key collisions; 8 preserved objects and Qian unchanged')
    + (process.argv.includes('--baseline-only') || process.argv.includes('--before-removal') ? '; removal not checked' : '; no old files or forwarding shells'));
