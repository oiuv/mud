import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { root, original, readBaseline, canonicalGroups, renderDefinitions, expectedCaller, dynamicCallers } from './boots_inventory.mjs';

const semantic = source => tokenize(source.replaceAll('\r\n', '\n'))
    .filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const baseline = readBaseline();
const callers = new Set([...baseline.hits.map(h => h.file), ...dynamicCallers]);
for (const file of callers) assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')),
    semantic(expectedCaller(file)), 'Unexpected caller change: ' + file);
assert.equal(callers.size, 15);
assert.equal(baseline.hits.length, 17);
assert.equal(references(baseline.varieties).hits.length, 0, 'Old executable reference');
assert.deepEqual(semantic(readFileSync(join(root, 'd/items/boots_data.h'), 'utf8')), semantic(renderDefinitions()));
for (const row of baseline.varieties) {
    assert.equal(existsSync(join(root, row.old_path.slice(1) + '.c')), false);
    for (const suffix of ['.c', '.lpc']) assert.equal(existsSync(join(root, row.new_path.slice(1) + suffix)), false);
}
for (const file of ['d/lanzhou/npc/obj/shoes.c', 'd/lanzhou/obj/shoes.c', 'd/village/npc/obj/shoes.c',
    'd/city/npc/cloth/shoes.c', 'd/xiangyang/npc/wuxiuwen.c', 'kungfu/class/shaolin/dao-chen.c'])
    assert.equal(readFileSync(join(root, file), 'utf8'), original(file), 'Excluded behavior changed: ' + file);
// No two substitutions in one file collapse distinct configuration keys in this batch.
for (const file of callers) {
    const paths = new Map();
    for (const h of baseline.hits.filter(h => h.file === file)) {
        if (!paths.has(h.new_path)) paths.set(h.new_path, new Set());
        paths.get(h.new_path).add(h.old_path);
    }
    assert.ok([...paths.values()].every(p => p.size === 1), 'Review merged configuration keys: ' + file);
}
assert.equal(canonicalGroups().length, 8);
console.log('BOOTS AUDIT PASS: 19 originals -> 8 varieties; 15 caller files, 17 static + 2 dynamic; no key collisions, old files or aliases; excluded files unchanged');
