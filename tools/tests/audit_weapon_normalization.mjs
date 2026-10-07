// Current definitions against a pinned pre-normalization commit, with only listed deltas.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { normalization, definitionEntries, mergeWeaponTable, normalizeWeaponReferences } from './weapon_classification/normalization.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16e6 });
const semantic = text => tokenize(text.replaceAll('\r\n', '\n')).filter(t => t.kind !== 'whitespace')
    .map(t => [t.kind, t.text]);
const families = ['axe', 'blade', 'club', 'dagger', 'fork', 'hammer', 'pin', 'staff', 'sword', 'throwing', 'whip'];
const tables = new Map();
let oldCount = 0;
for (const family of families) {
    const text = git('show', normalization.baseline + ':d/items/' + family + '_data.h');
    oldCount += definitionEntries(text).size;
    tables.set(family, definitionEntries(mergeWeaponTable(family, text)));
}
tables.set('spear', new Map());
for (const [old, target] of Object.entries(normalization.moves)) {
    const [, , , oldFamily, oldId] = old.split('/');
    const [, , , newFamily, newId] = target.split('/');
    assert.equal(oldId, newId, 'Category correction does not rename variety');
    const entry = tables.get(oldFamily).get(oldId);
    assert.ok(entry, old);
    assert.ok(!tables.get(newFamily).has(newId), 'No overwritten destination: ' + target);
    tables.get(oldFamily).delete(oldId);
    tables.get(newFamily).set(newId, entry);
}
let currentCount = 0;
for (const [family, expected] of tables) {
    const file = join(root, 'd/items/' + family + '_data.h');
    if (!expected.size) {
        assert.ok(!existsSync(file) && !existsSync(join(root, 'd/items/' + family + '.lpc')), 'Removed empty provider: ' + family);
        continue;
    }
    const actual = definitionEntries(readFileSync(file, 'utf8'));
    assert.deepEqual([...actual.keys()].sort(), [...expected.keys()].sort(), family + ': exact current varieties');
    for (const [id, entry] of expected)
        assert.deepEqual(semantic(actual.get(id)), semantic(entry), family + '/' + id + ': only approved definition changes');
    currentCount += actual.size;
}
assert.equal(currentCount, oldCount - Object.keys(normalization.merges).length);
let stale = '';
try {
    stale = git('grep', '-n', '-F', ...Object.keys({ ...normalization.moves, ...normalization.merges })
        .flatMap(path => ['-e', '"' + path + '"', '-e', '"' + path + '.c"', '-e', '"' + path + '.lpc"']),
        '--', '*.c', '*.lpc', '*.h', ':!tools', ':!fluffos', ':!mudcore');
} catch (error) { if (error.status !== 1) throw error; }
assert.equal(stale, '', 'No deleted runtime paths');
assert.equal(git('diff', '--name-only', '--', 'tools/tests/*/baseline.json').trim(), '', 'Historical snapshots remain unchanged');
// Check complete affected literals, not just the renamed strings: quantities,
// explicit prices, array order and repeated entries (probability weights) remain.
const paths = new Set(Object.entries({ ...normalization.moves, ...normalization.merges }).flat());
const runtimeTokens = text => tokenize(text).filter(t => !['whitespace', 'comment'].includes(t.kind));
const itemStrings = text => runtimeTokens(text).filter(t => t.kind === 'string' && /^"\/d\/items\//.test(t.text))
    .map(t => t.text);
function containers(text) {
    const syntax = runtimeTokens(text), result = [];
    for (let i = 0; i < syntax.length - 1; i++) {
        if (syntax[i].text !== '(' || !['[', '{'].includes(syntax[i + 1].text)) continue;
        let depth = 1, end = i + 1;
        for (; end < syntax.length; end++) {
            if (syntax[end].text === '(') depth++;
            if (syntax[end].text === ')' && !--depth) break;
        }
        assert.ok(end < syntax.length, 'Closed LPC literal');
        const body = syntax.slice(i, end + 1);
        if (!body.some(t => t.kind === 'string' && paths.has(JSON.parse(t.text)))) continue;
        // Only literal keys at this mapping's own depth, not nested mappings.
        const keys = [], nesting = [];
        if (syntax[i + 1].text === '[') for (let j = 2; j < body.length - 2; j++) {
            const t = body[j];
            if (!nesting.length && t.kind === 'string' && body[j + 1]?.text === ':') keys.push(JSON.parse(t.text));
            if (['(', '[', '{'].includes(t.text)) nesting.push(t.text);
            if ([')', ']', '}'].includes(t.text)) nesting.pop();
        }
        result.push({ tokens: body.map(t => [t.kind, t.text]), keys });
    }
    return result;
}
let affected = '';
try {
    affected = git('grep', '-l', '-z', '-F', ...Object.keys({ ...normalization.moves, ...normalization.merges })
        .flatMap(path => ['-e', '"' + path + '"']), normalization.baseline,
        '--', '*.c', '*.lpc', '*.h', ':!tools', ':!fluffos', ':!mudcore');
} catch (error) { if (error.status !== 1) throw error; }
let callers = 0, literals = 0;
for (const name of affected.split('\0').filter(Boolean)) {
    const file = name.slice(name.indexOf(':') + 1);
    const frozen = git('show', normalization.baseline + ':' + file);
    const actual = readFileSync(join(root, file), 'utf8');
    const expected = normalizeWeaponReferences(frozen);
    assert.deepEqual(itemStrings(actual), itemStrings(expected), file + ': all item references retain ordering and multiplicity');
    const before = containers(expected), after = containers(actual);
    assert.deepEqual(after.map(c => c.tokens), before.map(c => c.tokens), file + ': complete stock/random literals retain prices, quantities and weights');
    for (const { keys } of after) for (const path of new Set(keys.filter(k => paths.has(k))))
        assert.equal(keys.filter(k => k === path).length, 1, file + ': normalization must not overwrite mapping stock/price for ' + path);
    callers++;
    literals += after.length;
}
console.log(`WEAPON NORMALIZATION TABLE AUDIT PASS: ${oldCount} -> ${currentCount} definitions, ${Object.keys(normalization.moves).length} moves, ${Object.keys(normalization.merges).length} merges`);
console.log(`WEAPON NORMALIZATION CALLER AUDIT PASS: ${callers} files, ${literals} complete stock/random literals; no renamed-key collisions`);
