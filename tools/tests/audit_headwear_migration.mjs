// Exact allowed caller edits and historical semantics; no live data access.
import assert from 'node:assert/strict';
import { afterWristsMigration } from './wrists_inventory.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { root, original, readBaseline, canonicalGroups, renderDefinitions, expectedCaller,
    dynamicCallers, excluded, unrelatedCallers } from './headwear_inventory.mjs';
import { renameReferences } from './item_ids.mjs';
import { afterHandsMigration } from './hands_inventory.mjs';
import { afterNeckMigration } from './neck_inventory.mjs';

const semantic = source => tokenize(source.replaceAll('\r\n', '\n'))
    .filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const baseline = readBaseline();
const callers = new Set([...baseline.hits.map(h => h.file), ...dynamicCallers]);
for (const file of callers) assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')),
    semantic(afterWristsMigration(file, afterNeckMigration(file, afterHandsMigration(file, expectedCaller(file), semantic), semantic), semantic)), 'Unexpected caller change: ' + file);
assert.equal(callers.size, 30);
assert.equal(baseline.hits.length, 45);
assert.equal(references(baseline.varieties).hits.length, 0, 'Old executable reference');
assert.deepEqual(semantic(readFileSync(join(root, 'd/items/headwear_data.h'), 'utf8')), semantic(renderDefinitions()));
if (!process.argv.includes('--before-removal')) {
    for (const row of baseline.varieties) {
        assert.equal(existsSync(join(root, row.old_path.slice(1) + '.c')), false, 'Old source remains');
        for (const suffix of ['.c', '.lpc']) assert.equal(existsSync(join(root, row.new_path.slice(1) + suffix)), false);
    }
}
for (const file of [...excluded, ...unrelatedCallers])
    assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')),
        semantic(afterWristsMigration(file, afterNeckMigration(file, afterHandsMigration(file, renameReferences(original(file)), semantic), semantic), semantic)), 'Excluded behavior changed: ' + file);
for (const file of callers) {
    const paths = new Map();
    for (const h of baseline.hits.filter(h => h.file === file)) {
        if (!paths.has(h.new_path)) paths.set(h.new_path, new Set());
        paths.get(h.new_path).add(h.old_path);
    }
    assert.ok([...paths.values()].every(p => p.size === 1), 'Review merged configuration keys: ' + file);
}
assert.equal(canonicalGroups().length, 36);
assert.ok(canonicalGroups().every(g => !/_npc_|_obj_/.test(g.id)));
console.log('HEADWEAR AUDIT PASS: 39 originals -> 36 varieties; 30 caller files, 45 static + 1 dynamic; no key collisions; excluded unchanged'
    + (process.argv.includes('--before-removal') ? '; old file removal NOT checked' : '; no old files or per-variety shells'));
