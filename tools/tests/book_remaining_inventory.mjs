// Read-only source inventory, including local header bodies and static inherited books.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, tokens } from './cloth_inventory.mjs';
const files = execFileSync('git', ['ls-files', '*.c', '*.lpc', '*.h'], { cwd: root, encoding: 'utf8', maxBuffer: 8e6 })
    .trim().split('\n').filter(file => /^(d|clone|b|u|world|kungfu)\//.test(file) && !file.startsWith('d/items/') && existsSync(resolve(root, file)));
function expand(file, seen = new Set()) {
    if (seen.has(file)) return '';
    seen.add(file);
    const source = readFileSync(resolve(root, file), 'utf8');
    return source.replace(/^\s*#include\s+"([^"]+)"[^\n]*$/gm, (line, name) => {
        const target = name.startsWith('/') ? resolve(root, name.slice(1)) : resolve(root, dirname(file), name);
        const local = relative(root, target).replaceAll('\\', '/');
        if (local.startsWith('../') || !existsSync(target)) return line;
        return '\n' + expand(local, seen) + '\n';
    });
}
const all = files.filter(f => !f.endsWith('.h')).map(file => {
    const source = expand(file), syntax = tokens(source);
    const parents = syntax.flatMap((t, i) => t.text === 'inherit' ? [syntax[i + 1]?.text] : []);
    const skill = syntax.some((t, i) => t.text === 'set' && /^"skill(?:\/[^" ]+)?"$/.test(syntax[i + 2]?.text));
    const item = parents.some(p => ['ITEM', 'BOOK', 'MEDICAL_BOOK', 'CLOTH', 'HANDS', 'COMBINED_ITEM',
        'ARMOR', 'HEAD', 'NECK', 'BOOTS', 'WRISTS', 'EQUIP', 'SWORD', 'BLADE', 'STAFF', 'CLUB', 'HAMMER', 'WHIP', 'DAGGER', 'THROWING'].includes(p));
    const custom = /\b(?:int|void|mixed)\s+do_(?:read|du|study)\s*\(/.test(source);
    const book = parents.includes('BOOK') || parents.includes('MEDICAL_BOOK') || item && (skill || custom);
    return { file, source, syntax, parents, book };
});
const selected = new Set(all.filter(r => r.book).map(r => r.file));
let changed;
do {
    changed = false;
    for (const row of all) if (!selected.has(row.file)) for (const parent of row.parents) if (parent?.startsWith('"')) {
        const name = JSON.parse(parent);
        const target = name.startsWith('/') ? resolve(root, name.slice(1)) : resolve(root, dirname(row.file), name);
        const path = relative(root, target).replaceAll('\\', '/');
        if (['', '.c', '.lpc'].some(suffix => selected.has(path + suffix))) { selected.add(row.file); changed = true; }
    }
} while (changed);
function describe(row) {
    const { file, source, syntax, parents } = row;
    const nameAt = syntax.findIndex(t => t.text === 'set_name');
    let name = '';
    if (nameAt >= 0) {
        let depth = 0;
        for (let i = nameAt + 2; i < syntax.length; i++) {
            const t = syntax[i];
            if (t.text === ',' && depth === 0) break;
            if (['(', '[', '{'].includes(t.text)) depth++;
            if ([')', ']', '}'].includes(t.text)) depth--;
            if (t.kind === 'string') { const text = JSON.parse(t.text); if (/[\u3400-\u9fff]/.test(text)) name += text; }
        }
        if (!name) {
            const pool = source.match(/string\s*\*\w+\s*=\s*\(\{([\s\S]*?)\}\)/);
            if (pool) name = [...pool[1].matchAll(/"([^"\n]*[\u3400-\u9fff][^"\n]*)"/g)].map(m => m[1]).join(' / ');
        }
    }
    const callbacks = [...new Set([...source.matchAll(/\b(?:void|int|string|mixed|object|mapping)\s+(\w+)\s*\([^;{}]*\)\s*\{/g)].map(m => m[1]).filter(n => n !== 'create'))];
    const headers = [...readFileSync(resolve(root, file), 'utf8').matchAll(/^\s*#include\s+"([^"]+)"/gm)].map(m => m[1]);
    const notes = [];
    if (parents.includes('CLOTH')) notes.push('CLOTH 复合身份');
    if (parents.includes('HANDS')) notes.push('HANDS 复合身份');
    if (parents.includes('BOOK')) notes.push('BOOK 父类显示/研读能力');
    if (parents.includes('MEDICAL_BOOK')) notes.push('MEDICAL_BOOK 医书行为');
    for (const parent of parents) if (['SWORD', 'ARMOR', 'F_UNIQUE', 'F_DBSAVE', 'F_NOCLONE'].includes(parent)) notes.push('`' + parent + '`');
    if (/\bdestruct\s*\(this_object\(\)\)/.test(source)) notes.push('含自毁路径');
    if (callbacks.length) notes.push('`' + callbacks.join(' / ') + '`');
    if (headers.length) notes.push('含头文件 `' + headers.join('`, `') + '`');
    if (!notes.length) notes.push('初始化候选，尚未评估调用/恢复');
    return { file, name: name || basename(file), unresolved_name: !name, parents, callbacks, headers, notes: notes.join('；') };
}
export const remainingBooks = all.filter(row => selected.has(row.file)).map(describe).sort((a, b) => a.file.localeCompare(b.file));
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--json')) console.log(JSON.stringify(remainingBooks));
  else {
    console.log(JSON.stringify({ count: remainingBooks.length, byRoot: Object.fromEntries([...new Set(remainingBooks.map(r => r.file.split('/')[0]))].map(key => [key, remainingBooks.filter(r => r.file.startsWith(key + '/')).length])), unresolved: remainingBooks.filter(r => r.unresolved_name).map(r => r.file) }));
    if (process.argv.includes('--table')) for (const row of remainingBooks)
        console.log(`| ${row.name.replaceAll('|', '\\|')} | [${row.file}](../../${row.file}) | ${row.notes}。 |`);
  }
}
