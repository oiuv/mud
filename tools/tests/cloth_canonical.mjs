// Offline migration/audit metadata only. The game reads cloth_data.h, never this module.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, readBaseline, tokens } from './cloth_inventory.mjs';

const names = JSON.parse(readFileSync(join(root, 'tools/tests/cloth/canonical_ids.json'), 'utf8'));
const expression = source => tokens(source).map(token => token.text);
// Only value=0 is normalized: the reviewed CLOTH/dealer paths use its numeric value,
// not undefinedp(). Other zero values remain significant.
const setters = values => values.filter(([key, value]) => !(key === '"value"' && value === '0'))
    .map(pair => pair.map(expression)).sort((a, b) => JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0])));
function blueprintProperties(row) {
    assert.equal(row.before_branch.length + row.after_branch.length, 0);
    for (const [key, value] of row.before_weight) {
        // The reviewed early setters are fixed descriptions, including ANSI literals.
        // They need no per-instance initialization or dependency on set_weight().
        assert.equal(key, '"long"');
        assert.ok(tokens(value).every(t => t.kind === 'string' ||
            (t.kind === 'identifier' && ['HIW', 'NOR'].includes(t.text))));
    }
    return [...row.before_weight, ...row.properties];
}
export const definitionSignature = row => JSON.stringify([
    expression(row.name[0]), expression(row.weight), setters(blueprintProperties(row)),
]);

export function canonicalGroups() {
    const grouped = new Map();
    for (const row of readBaseline().varieties) {
        const signature = definitionSignature(row);
        if (!grouped.has(signature)) grouped.set(signature, []);
        grouped.get(signature).push(row);
    }
    const used = new Set();
    const groups = [...grouped.values()].map(rows => {
        const representative = rows[0];
        const id = names[representative.key];
        assert.match(id || '', /^[a-z]+(?:_[a-z]+)*$/, 'Missing semantic ID: ' + representative.key);
        assert.ok(!used.has(id), 'Duplicate canonical ID: ' + id);
        used.add(id);
        const aliases = row => tokens(row.name[1]).filter(t => t.kind === 'string').map(t => JSON.parse(t.text));
        const ids = [...new Set(rows.flatMap(aliases))];
        // set_name adds only the first alias's initial. Keep former shorthand inputs too.
        for (const row of rows) {
            const initial = aliases(row)[0][0].toLowerCase();
            if (initial !== ids[0][0].toLowerCase() && !ids.includes(initial)) ids.push(initial);
        }
        return { id, path: '/d/items/cloth/' + id, representative, rows, ids };
    });
    assert.equal(groups.length, Object.keys(names).length, 'Stale canonical naming entries');
    return groups;
}

export function canonicalBaseline() {
    const baseline = readBaseline();
    const paths = new Map(canonicalGroups().flatMap(g => g.rows.map(r => [r.old_path, g.path])));
    return { ...baseline,
        varieties: baseline.varieties.map(r => ({ ...r, new_path: paths.get(r.old_path) })),
        hits: baseline.hits.map(h => ({ ...h, new_path: paths.get(h.old_path) })),
    };
}

export function migrationPaths() {
    return Object.fromEntries(canonicalGroups().flatMap(g => g.rows.flatMap(r =>
        [[r.old_path, g.path], [r.new_path, g.path]])));
}

export function renderDefinitions() {
    const pairs = values => values.length
        ? '({\n' + values.map(([key, value]) => '                ({ ' + key + ', ' + value + ' })').join(',\n') + '\n            })'
        : '({})';
    return '// 普通 CLOTH 共用资产；ID 描述物品本身，不包含历史目录来源。\n'
        + '// 相同物品只维护一条定义。历史对应表仅用于离线迁移，不是运行期入口。\n'
        + '// properties 统一保存品种蓝图默认值，实例通过默认对象读取并可独立覆盖。\n'
        + 'private mapping cloth_definitions() {\n    return ([\n'
        + canonicalGroups().sort((a, b) => a.id.localeCompare(b.id)).map(g => {
            const r = g.representative;
            assert.equal(r.before_branch.length + r.after_branch.length, 0);
            return `        "${g.id}": ([\n            "name": ${r.name[0]},\n`
                + `            "ids": ({ ${g.ids.map(id => JSON.stringify(id)).join(', ')} }),\n`
                + `            "weight": ${r.weight},\n`
                + `            "properties": ${pairs(blueprintProperties(r))},\n        ])`;
        }).join(',\n') + '\n    ]);\n}\n';
}

// Inspection only: print the complete offline map, without writing or loading the game.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const groups = canonicalGroups();
    console.log(JSON.stringify({
        historical_definitions: readBaseline().varieties.length,
        canonical_varieties: groups.length,
        varieties: groups.map(g => ({ id: g.id, path: g.path, name: g.representative.name[0],
            aliases: g.ids, old_paths: g.rows.map(r => r.old_path),
            intermediate_paths: g.rows.map(r => r.new_path) })),
        paths: migrationPaths(),
    }, null, 2));
}
