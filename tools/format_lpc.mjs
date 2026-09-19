#!/usr/bin/env node
// Project defaults and safety checks around the FluffOS LPC formatter.
import { readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const options = { indentSize: 4, printWidth: 100 };
const literalKinds = new Set(['string', 'template', 'textblock', 'char', 'comment', 'directive']);
const usage = 'Usage: node tools/format_lpc.mjs [--check] <file.c|file.lpc|file.h> ...';

async function main() {
    let checkOnly = false;
    let positionalOnly = false;
    const inputs = [];
    for (const argument of process.argv.slice(2)) {
        if (!positionalOnly && argument === '--') {
            positionalOnly = true;
        } else if (!positionalOnly && argument === '--check') {
            checkOnly = true;
        } else if (!positionalOnly && (argument === '--help' || argument === '-h')) {
            console.log(usage);
            console.log('Formats only the listed LPC files; --check does not write files.');
            console.log('Requires Node.js 18+ and fluffos/tools/lpc-syntax/. Uses 4 spaces and 100 columns.');
            return;
        } else if (!positionalOnly && argument.startsWith('-')) {
            throw new Error(`Unknown option: ${argument}`);
        } else {
            inputs.push(argument);
        }
    }
    if (!inputs.length) throw new Error(usage);

    const engine = resolve(root, 'fluffos/tools/lpc-syntax');
    let formatLPC, tokenSequence, tokenize;
    try {
        ({ formatLPC, tokenSequence } = await import(pathToFileURL(resolve(engine, 'format.mjs'))));
        ({ tokenize } = await import(pathToFileURL(resolve(engine, 'tokenizer.mjs'))));
    } catch (error) {
        throw new Error(`Cannot load FluffOS formatter from ${engine}: ${error.message}`);
    }

    const literals = source => tokenize(source).filter(token => literalKinds.has(token.kind))
        .map(token => [token.kind, token.kind === 'directive'
            ? token.text.replace(/[ \t]+$/g, '') : token.text]);
    const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
    const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
    const files = [...new Set(inputs.map(file => realpathSync(resolve(file))))];
    const pending = [];

    // Validate every input before writing any file.
    for (const file of files) {
        const name = relative(root, file);
        if (isAbsolute(name) || name === '..' || name.startsWith(`..${sep}`)) {
            throw new Error(`File is outside the repository: ${file}`);
        }
        if (!statSync(file).isFile() || !['.c', '.lpc', '.h'].includes(extname(file).toLowerCase())) {
            throw new Error(`Expected an LPC source or header file: ${name}`);
        }
        const before = readFileSync(file);
        const source = decoder.decode(before);
        let formatted;
        try {
            formatted = formatLPC(source, options);
            if (!same(tokenSequence(source), tokenSequence(formatted))) {
                throw new Error('token sequence changed');
            }
            if (!same(literals(source), literals(formatted))) {
                throw new Error('literal or comment content changed');
            }
            if (formatLPC(formatted, options) !== formatted) {
                throw new Error('formatting is not idempotent');
            }
        } catch (error) {
            throw new Error(`${name}: ${error.message}`);
        }
        if (formatted !== source) pending.push({ file, name, before, formatted });
    }

    if (!checkOnly) {
        for (const item of pending) {
            if (!readFileSync(item.file).equals(item.before)) {
                throw new Error(`File changed while formatting: ${item.name}`);
            }
        }
    }
    for (const item of pending) {
        if (!checkOnly) writeFileSync(item.file, item.formatted, 'utf8');
        console.log(`${checkOnly ? 'would format' : 'formatted'}: ${item.name}`);
    }
    console.log(`${files.length} files checked; ${pending.length} ${checkOnly ? 'need formatting' : 'formatted'}.`);
    if (checkOnly && pending.length) process.exitCode = 1;
}

try {
    await main();
} catch (error) {
    console.error(`LPC formatter: ${error.message}`);
    process.exitCode = 1;
}
