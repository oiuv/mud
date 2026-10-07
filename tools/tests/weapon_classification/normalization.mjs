// Explicit approved deltas, separate from immutable migration snapshots.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
export const normalization = JSON.parse(readFileSync(join(here, 'normalization.json'), 'utf8'));
export const canonicalWeaponPath = path => normalization.merges[path] || normalization.moves[path] || path;

export function normalizeWeaponReferences(source) {
    for (const [before, after] of Object.entries({ ...normalization.moves, ...normalization.merges }))
        for (const suffix of ['', '.c', '.lpc'])
            source = source.replaceAll(JSON.stringify(before + suffix), JSON.stringify(after + suffix));
    return source;
}

export function definitionEntries(source) {
    return new Map([...source.matchAll(/^        "([^"]+)": \(\[([\s\S]*?)^        \]\),\r?\n/gm)]
        .map(match => [match[1], match[0]]));
}

export function mergeWeaponTable(family, source) {
    const pairs = Object.entries(normalization.merges).filter(([old]) => old.startsWith('/d/items/' + family + '/'))
        .map(([old, target]) => [old.split('/').at(-1), target.split('/').at(-1)]);
    const entries = definitionEntries(source);
    for (const target of new Set(pairs.map(pair => pair[1]))) {
        const from = pairs.filter(pair => pair[1] === target).map(pair => pair[0]);
        const ids = [];
        for (const id of [target, ...from]) {
            const block = entries.get(id);
            assert.ok(block, family + '/' + id + ': reviewed original entry');
            const aliases = [...block.match(/"ids": \(\{([^}]+)\}\)/)[1].matchAll(/"([^"]+)"/g)]
                .map(match => match[1]);
            ids.push(...aliases);
            if (aliases[0][0] !== ids[0][0]) ids.push(aliases[0][0]);
        }
        let block = entries.get(target).replace(/"ids": \(\{[^}]+\}\)/,
            '"ids": ({ ' + [...new Set(ids)].map(JSON.stringify).join(', ') + ' })');
        if (target === 'tiechui') block = block.replaceAll('沈重', '沉重').replaceAll('然後', '然后');
        source = source.replace(entries.get(target), block);
        for (const id of from) source = source.replace(entries.get(id), '');
    }
    return source;
}

// Read-only one-off patch preview. Applying remains an explicit editor operation.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes('--preview')) {
    const edits = [];
    const families = new Set(Object.keys(normalization.merges).map(path => path.split('/')[3]));
    for (const family of families) {
        const file = 'd/items/' + family + '_data.h';
        const before = readFileSync(join(root, file), 'utf8');
        edits.push({ file, before, after: mergeWeaponTable(family, before) });
    }
    const patterns = Object.keys({ ...normalization.moves, ...normalization.merges }).flatMap(path => ['-e', path]);
    let matching = '';
    try {
        matching = execFileSync('git', ['grep', '-l', '-z', '-F', ...patterns, '--', '*.c', '*.lpc', '*.h',
            ':!tools', ':!fluffos', ':!mudcore'], { cwd: root, encoding: 'utf8', maxBuffer: 16e6 });
    } catch (error) { if (error.status !== 1) throw error; }
    const files = matching.split('\0').filter(Boolean);
    for (const file of files) {
        let before;
        try { before = readFileSync(join(root, file), 'utf8'); } catch { continue; }
        const after = normalizeWeaponReferences(before);
        if (before !== after) edits.push({ file, before, after });
    }
    console.log(JSON.stringify(edits));
}
