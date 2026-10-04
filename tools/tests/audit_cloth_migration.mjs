// Verify the broad caller edit is exactly the approved path substitution.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { original, root, references, readBaseline } from './cloth_inventory.mjs';
import { canonicalBaseline, canonicalGroups, renderDefinitions } from './cloth_canonical.mjs';

const baseline = canonicalBaseline();
const files = new Map();
for (const hit of baseline.hits) {
    if (!files.has(hit.file)) files.set(hit.file, []);
    files.get(hit.file).push(hit);
}
const dynamic = ['d/xiangyang/npc/wuxiuwen.c', 'kungfu/class/shaolin/dao-xiang.c'];
for (const file of dynamic) if (!files.has(file)) files.set(file, []);
const semanticTokens = source => tokenize(source.replaceAll('\r\n', '\n'))
    .filter(token => token.kind !== 'whitespace').map(token => [token.kind, token.text]);
for (const [file, hits] of files) {
    let expected = original(file);
    for (const hit of [...hits].sort((a, b) => b.start - a.start)) {
        assert.equal(expected.slice(hit.start, hit.end), hit.expression, file + ' baseline offsets');
        expected = expected.slice(0, hit.start) + JSON.stringify(hit.new_path) + expected.slice(hit.end);
    }
    if (dynamic.includes(file)) {
        const expression = 'new("/d/shaolin/obj/" + name)';
        const offset = expected.lastIndexOf(expression);
        assert.ok(offset >= 0, file + ' dynamic iron vest branch');
        expected = expected.slice(0, offset) + 'new("/d/items/cloth/tie_beixin_sengmen")' +
            expected.slice(offset + expression.length);
    }
    assert.deepEqual(semanticTokens(readFileSync(join(root, file), 'utf8')), semanticTokens(expected),
        'Unexpected non-formatting change: ' + file);
}
assert.equal(new Set(baseline.varieties.map(row => row.new_path)).size, 148);
assert.deepEqual(semanticTokens(readFileSync(join(root, 'd/items/cloth_data.h'), 'utf8')),
    semanticTokens(renderDefinitions()), 'Canonical data differs from reviewed historical groups');
assert.equal(references(readBaseline().varieties.map(row => ({ ...row, old_path: row.new_path }))).hits.length,
    0, 'Intermediate directory-derived IDs remain in game code');
for (const group of canonicalGroups()) {
    assert.ok(group.rows.length > 0);
    assert.ok(!/_npc_|_obj_/.test(group.id), 'Directory-derived canonical identity');
}
for (const row of baseline.varieties) {
    assert.equal(existsSync(join(root, row.old_path.slice(1) + '.c')), false, 'Old source remains: ' + row.old_path);
    assert.equal(existsSync(join(root, row.new_path.slice(1) + '.c')), false, 'Per-variety .c shell');
    assert.equal(existsSync(join(root, row.new_path.slice(1) + '.lpc')), false, 'Per-variety .lpc shell');
}
console.log(`CLOTH CALLER AUDIT PASS: ${files.size} files, ${baseline.hits.length} static substitutions, 2 dynamic branches, 202 historical definitions -> 148 varieties, no per-variety shells or intermediate IDs`);
