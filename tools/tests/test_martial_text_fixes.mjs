// Static display-only guard. This does not claim live client rendering coverage.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenSequence } from '../../fluffos/tools/lpc-syntax/format.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixes = JSON.parse(readFileSync(resolve(root, 'tools/tests/martial_audit/text_fixes.json'), 'utf8'))
    .map(([id, file, before, after, mixed]) => ({ id, file, before, after, mixed }));
for (const name of ['text_extra_fixes', 'npc_text_fixes'])
    fixes.push(...JSON.parse(readFileSync(resolve(root, `tools/tests/martial_audit/${name}.json`), 'utf8')));
const baseline = 'e54a7cd8847206c4e33581251c7dbaf4dda9bf3e';
const files = [...new Set(fixes.map(row => row.file))];
let mixedFiles = 0;
for (const file of files) {
    let expected = execFileSync('git', ['show', `${baseline}:${file}`], { cwd: root, encoding: 'utf8' });
    const current = readFileSync(resolve(root, file), 'utf8');
    const rows = fixes.filter(row => row.file === file);
    for (const { id, before, after } of rows) {
        assert.ok(expected.includes(before), `MA-${id} missing original display text: ${file}: ${before}`);
        expected = expected.replaceAll(before, after);
        assert.ok(current.includes(after), `MA-${id} missing corrected text: ${file}: ${after}`);
        assert.ok(!current.includes(before), `MA-${id} old typo remains: ${file}: ${before}`);
    }
    if (rows.some(row => row.mixed)) mixedFiles++;
    else assert.deepEqual(tokenSequence(current), tokenSequence(expected),
        `Non-display or undeclared changes in text-only file ${file}`);
}
console.log(`MARTIAL_TEXT PASS: ${fixes.length} corrections in ${files.length} files; ${files.length - mixedFiles} pure files checked for exact token differences; ${mixedFiles} mixed files checked for declared text only (functional tests required)`);
