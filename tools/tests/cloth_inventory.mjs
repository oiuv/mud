// Read-only inventory for the ordinary CLOTH migration. No player data is read.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { dirname, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { createHash } from 'node:crypto';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const baseline = 'ed10c535';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32e6 });
export const tracked = () => git('ls-files', '-z').split('\0').filter(Boolean);
export const original = path => git('show', `${baseline}:${path}`);
export const readBaseline = () => JSON.parse(readFileSync(resolve(root,
    'tools/tests/cloth/baseline.json'), 'utf8'));
export const tokens = source => tokenize(source).filter(t => !['whitespace', 'comment', 'directive'].includes(t.kind));

// These sources have a deliberately small, verified grammar. Reject new behavior
// instead of silently flattening arbitrary LPC into a property table.
export function parseCloth(source, path) {
    const t = tokens(source);
    const spell = list => source.slice(list[0].start, list.at(-1).end);
    let i = 0;
    const take = expected => {
        if (t[i]?.text !== expected) throw new Error(`${path}: expected ${expected}, found ${t[i]?.text}`);
        i++;
    };
    const call = name => {
        take(name); take('(');
        let depth = 0, start = i;
        const args = [];
        while (i < t.length) {
            const text = t[i].text;
            if (text === ')' && depth === 0) {
                if (i > start) args.push(spell(t.slice(start, i)));
                i++; take(';'); return args;
            }
            if (text === ',' && depth === 0) { args.push(spell(t.slice(start, i))); start = i + 1; }
            if (['(', '({', '([', '{', '['].includes(text)) depth++;
            if ([')', '})', '])', '}', ']'].includes(text)) depth--;
            i++;
        }
        throw new Error(`${path}: unterminated ${name}`);
    };
    const setters = () => {
        const result = [];
        while (t[i]?.text === 'set') {
            const args = call('set');
            if (args.length !== 2) throw new Error(`${path}: unsupported setter`);
            result.push(args);
        }
        return result;
    };
    take('inherit'); take('CLOTH'); take(';');
    take('void'); take('create'); take('('); take(')'); take('{');
    const name = call('set_name');
    const beforeWeight = setters();
    const weight = call('set_weight');
    const beforeBranch = setters();
    take('if'); take('('); take('clonep'); take('('); take(')'); take(')');
    const defaultObject = call('set_default_object');
    if (defaultObject.join() !== '__FILE__') throw new Error(`${path}: nonstandard default`);
    take('else'); take('{');
    const properties = setters();
    take('}');
    const afterBranch = setters();
    call('setup'); take('}');
    if (i !== t.length || name.length !== 2 || weight.length !== 1)
        throw new Error(`${path}: unsupported extra behavior`);
    const key = path.replace(/^d\//, '').replace(/\.(c|lpc)$/, '').replaceAll('/', '_');
    return { old_path: '/' + path.replace(/\.(c|lpc)$/, ''), key,
        source_hash: createHash('sha256').update(source).digest('hex'), name, weight: weight[0],
        before_weight: beforeWeight, before_branch: beforeBranch, properties, after_branch: afterBranch };
}

export function references(rows) {
    const paths = new Map(rows.map(row => [row.old_path, row]));
    const hits = [], dynamic = [];
    const targets = [...paths.keys()];
    for (const file of new Set([...tracked(), 'd/items/cloth.lpc', 'd/items/cloth_data.h'].filter(
        file => /\.(c|lpc|h)$/.test(file) && !/^(mudcore|fluffos|tools)\//.test(file)))) {
        if (!existsSync(resolve(root, file))) continue;
        const source = readFileSync(resolve(root, file), 'utf8');
        const all = tokenize(source);
        const code = all.filter(t => !['whitespace', 'comment'].includes(t.kind));
        const macros = { __DIR__: '/' + posix.dirname(file) + '/' };
        for (const token of all.filter(t => t.kind === 'directive')) {
            const match = token.text.match(/^#\s*define\s+(\w+)\s+"([^"\n]+)"\s*$/);
            if (match) macros[match[1]] = match[2];
        }
        for (let i = 0; i < code.length; i++) {
            const atom = t => t?.kind === 'string' && /^"[^"\\\n]+"$/.test(t.text)
                ? t.text.slice(1, -1) : macros[t?.text];
            let value = atom(code[i]);
            if (value === undefined) continue;
            const start = i;
            while (true) {
                if (code[i + 1]?.text === '+' && atom(code[i + 2]) !== undefined) {
                    value += atom(code[i + 2]); i += 2;
                } else if (atom(code[i + 1]) !== undefined) {
                    value += atom(code[i + 1]); i++;
                } else break;
            }
            const path = posix.resolve('/' + posix.dirname(file), value).replace(/\.(c|lpc)$/, '');
            const pathUse = value.includes('/') || (code[start - 1]?.text === '(' &&
                ['new', 'clone_object', 'load_object', 'find_object', 'carry_object', 'file_size'].includes(code[start - 2]?.text));
            const row = pathUse && paths.get(path);
            if (row) {
                hits.push({ file, line: code[start].line, start: code[start].start, end: code[i].end,
                    expression: source.slice(code[start].start, code[i].end), old_path: path, new_path: row.new_path });
            } else if (value.length >= 4 && (value.includes('/') || code[i + 1]?.text === '+') &&
                targets.some(p => p.startsWith(path + '/') || p.startsWith(path))) {
                dynamic.push({ file, line: code[start].line, expression: source.split(/\r?\n/)[code[start].line - 1].trim() });
            }
        }
    }
    return { hits, dynamic };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const saved = readBaseline();
    if (process.argv.includes('--check-references')) {
        for (const row of saved.varieties)
            assert.equal(existsSync(resolve(root, row.old_path.slice(1) + '.c')), false, row.old_path + ' must be removed');
        const result = references(saved.varieties);
        if (result.hits.length) throw new Error('Old runtime references: ' + JSON.stringify(result.hits));
        console.log('No remaining literal/relative ordinary CLOTH references; dynamic clues: ' + result.dynamic.length);
        console.log(JSON.stringify(result.dynamic, null, 2));
        process.exit(0);
    }
    if (process.argv.includes('--audit-baseline')) {
        for (const row of saved.varieties) {
            const file = row.old_path.slice(1) + '.c';
            const parsed = parseCloth(original(file), file);
            for (const key of Object.keys(parsed)) assert.deepEqual(parsed[key], row[key], file + ': ' + key);
        }
        console.log(`Historical source audit passed: ${saved.varieties.length} varieties at ${baseline}`);
        process.exit(0);
    }
    if (process.argv.length > 2) throw new Error('Use --check-references or --audit-baseline; this tool is read-only');
    console.log(JSON.stringify({ baseline, varieties: saved.count, migrated_references: saved.hits.length,
        baseline_file: 'tools/tests/cloth/baseline.json' }, null, 2));
}
