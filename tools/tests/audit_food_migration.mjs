// Exact caller edits and frozen behavior, without reading runtime data.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { root, readBaseline, canonicalGroups, expectedCaller, renderDefinitions, original } from './food_inventory.mjs';
const semantic = source => tokenize(source.replaceAll('\r\n', '\n')).filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const data = readBaseline();
assert.equal(data.varieties.length, 167); assert.equal(data.excluded.length, 17);
assert.equal(data.hits.length, 186); assert.equal(Object.keys(data.callers).length, 100);
for (const file of Object.keys(data.callers)) {
    assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(expectedCaller(file)), file);
    assert.deepEqual(semantic(data.callers[file]), semantic(original(file)), 'Frozen caller at baseline: ' + file);
    const paths = new Map();
    for (const hit of data.hits.filter(h => h.file === file)) {
        if (!paths.has(hit.new_path)) paths.set(hit.new_path, new Set());
        paths.get(hit.new_path).add(hit.old_path);
    }
    assert.ok([...paths.values()].every(values => values.size === 1), 'Review merged keys: ' + file);
}
assert.equal(references(data.varieties).hits.length, 0, 'Old runtime references');
assert.deepEqual(semantic(readFileSync(join(root, 'd/items/food_data.h'), 'utf8')), semantic(renderDefinitions()));
for (const row of data.varieties) {
    assert.equal(createHash('sha256').update(row.source).digest('hex'), row.source_hash);
    if (!process.argv.includes('--before-removal')) assert.equal(existsSync(join(root, row.old_path.slice(1) + '.c')), false);
    for (const suffix of ['.c', '.lpc']) assert.equal(existsSync(join(root, row.new_path.slice(1) + suffix)), false);
}
for (const { file, source_hash } of data.excluded)
    assert.equal(createHash('sha256').update(readFileSync(join(root, file))).digest('hex'), source_hash, 'Special food changed: ' + file);
for (const { file } of data.dynamic) if (!data.callers[file])
    assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(original(file)), 'Dynamic clue changed: ' + file);
assert.equal(canonicalGroups().length, 119);
for (const group of canonicalGroups()) {
    const identity = row => {
        const { path, ids, ...record } = row.observed;
        const normalize = props => Object.fromEntries(Object.entries(props).filter(([k]) => k !== 'id').sort(([a], [b]) => a.localeCompare(b)));
        return { ...record, blueprint: normalize(record.blueprint), clone: normalize(record.clone) };
    };
    for (const row of group.rows) assert.deepEqual(identity(row), identity(group.representative), 'Effective grouping: ' + group.id);
}
console.log('FOOD AUDIT PASS: 167 originals -> 119 varieties; 186 references in 100 callers; no key collisions; 17 special foods unchanged'
    + (process.argv.includes('--before-removal') ? '; removal not checked' : '; no old files or forwarding shells'));
