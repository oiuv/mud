// Run frozen/current NPC methods in disposable shells; no live game state.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { original, dynamicCallers, excluded } from '../wrists_inventory.mjs';

export function prepareWrists(root, sandbox, copy) {
    for (const old of [false, true]) {
        for (const file of dynamicCallers) {
            const source = old ? original(file) : readFileSync(join(root, file), 'utf8');
            const path = join(sandbox, (old ? 'tests/old/' : '') + file);
            let methods = 'inherit ITEM;\n';
            for (const signature of ['string ask_me_1(string name) {', 'string ask_me_2(string name) {']) {
                const start = source.indexOf(signature);
                assert.ok(start >= 0, signature);
                methods += source.slice(start, source.indexOf('\n}', start) + 2) + '\n';
            }
            mkdirSync(dirname(path), { recursive: true });
            writeFileSync(path, methods);
        }
    }
    for (const file of [...excluded, 'd/shaolin/obj/huyao.c']) copy(file);
}
