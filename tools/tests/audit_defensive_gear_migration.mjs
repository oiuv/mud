import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { root, readBaseline, canonicalGroups, expectedCaller, renderDefinitions, original, families, preserved } from './defensive_gear_inventory.mjs';
const semantic = s => tokenize(s.replaceAll('\r\n', '\n')).filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const hash = s => createHash('sha256').update(s).digest('hex');
const data = readBaseline();
assert.equal(data.count, 18); assert.equal(data.varieties.length, 18);
assert.equal(data.hits.length, 17); assert.equal(data.dynamic.length, 5);
assert.equal(Object.keys(data.callers).length, 14); assert.equal(data.excluded.length, preserved.length);
assert.equal(data.observations.length, 18);
const normalize = v => Array.isArray(v) ? v.map(normalize) : v && typeof v === 'object'
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, normalize(v)])) : v;
const identity = row => { const { path, ...value } = data.observations.find(o => o.path === row.old_path); return normalize(value); };
assert.equal(new Set(data.varieties.map(r => JSON.stringify(identity(r)))).size, 10, 'Merge all equivalent definitions');
for (const g of canonicalGroups()) for (const r of g.rows) assert.deepEqual(identity(r), identity(g.representative), g.id);
for (const row of data.varieties) {
    assert.equal(hash(row.source), row.source_hash); assert.equal(original(row.old_path.slice(1) + '.c'), row.source);
    if (!process.argv.includes('--baseline-only')) {
        assert.ok(!existsSync(join(root, row.old_path.slice(1) + '.c')), 'old source removed');
        for (const suffix of ['.c', '.lpc']) assert.ok(!existsSync(join(root, row.new_path.slice(1) + suffix)), 'no forwarding file');
    }
}
for (const file of Object.keys(data.callers)) {
    assert.equal(data.callers[file], original(file));
    if (!process.argv.includes('--baseline-only'))
        assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(expectedCaller(file)), file);
}
for (const { file, source_hash } of data.excluded) assert.equal(hash(readFileSync(join(root, file))), source_hash, file);
if (!process.argv.includes('--baseline-only')) {
    assert.equal(references(data.varieties).hits.length, 0, 'old runtime references');
    for (const f of families) assert.deepEqual(semantic(readFileSync(join(root, 'd/items/' + f + '_data.h'), 'utf8')), semantic(renderDefinitions(f)), f);
}
console.log('DEFENSIVE_GEAR AUDIT PASS: 18 originals -> 10 varieties; 14 callers; preserved special items and parents');
