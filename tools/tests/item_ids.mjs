// Offline naming history for migration and audits. Never loaded by the MUD.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

export const renamedIds = JSON.parse(readFileSync(new URL('./item_id_renames.json', import.meta.url), 'utf8'));
export const validId = id => typeof id === 'string' && /^[a-z]+(?:_[a-z]+)*[0-9]*$/.test(id);
export const canonicalId = (family, id) => renamedIds[family]?.[id] ?? id;
export const renamedPaths = family => Object.fromEntries(Object.entries(renamedIds[family]).map(([oldId, id]) =>
    [`/d/items/${family}/${oldId}`, `/d/items/${family}/${id}`]));
const paths = Object.assign({}, ...Object.keys(renamedIds).map(renamedPaths));
export const canonicalPath = path => paths[path] ?? path;

// Project current targets without rewriting the saved source, hash or historical file.
export const currentBaseline = (family, saved) => ({ ...saved,
    varieties: saved.varieties.map(row => ({ ...row, id: canonicalId(family, row.id), new_path: canonicalPath(row.new_path) })),
    hits: saved.hits.map(hit => ({ ...hit, new_path: canonicalPath(hit.new_path) })),
});
export const renameReferences = source => source.replace(/\/d\/items\/(?:cloth|boots|headwear)\/[a-z][a-z0-9_]*/g, canonicalPath);

for (const [family, names] of Object.entries(renamedIds)) {
    const targets = new Set();
    for (const [oldId, id] of Object.entries(names)) {
        assert.ok(validId(oldId) && validId(id), 'Invalid ID: ' + family + '/' + id);
        assert.ok(!Object.hasOwn(names, id), 'Renames must go directly to the final ID: ' + id);
        assert.ok(!targets.has(id), 'A naming-only change cannot merge varieties: ' + id);
        targets.add(id);
    }
}
