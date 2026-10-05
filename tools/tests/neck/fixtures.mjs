// Run original/current business methods in disposable NPC shells, never live NPCs.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { original, dynamicCallers, excluded } from '../neck_inventory.mjs';

export function prepareNeck(root, sandbox, copy) {
    const put = (file, source) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), source);
    };
    const method = (source, signature) => {
        const start = source.indexOf(signature);
        assert.ok(start >= 0, signature);
        return source.slice(start, source.indexOf('\n}', start) + 2);
    };
    const parent = 'inherit "/tests/quest_actor";\n';
    for (const old of [false, true]) {
        const prefix = old ? 'tests/old/' : '';
        for (const file of dynamicCallers) {
            const source = old ? original(file) : readFileSync(join(root, file), 'utf8');
            put(prefix + file, 'inherit ITEM;\n' + method(source, 'string ask_me_1(string name) {')
                + '\n' + method(source, 'string ask_me_2(string name) {'));
        }
        const file = 'd/changan/npc/yuanwai.c';
        const source = old ? original(file) : readFileSync(join(root, file), 'utf8');
        const signatures = ['void send_to_fight(object me, object who) {', 'void check_daughter(object me) {',
            'void cry_daughter(object me, object xiangxiang, object who, object yupei) {'];
        // Command dispatch is recorded, not simulated as successful delivery/follow.
        put(prefix + file, parent + signatures.map(s => method(source, s).replace(/\bcommand\(/g, 'record_command(')).join('\n'));
        const xiang = 'd/changan/npc/xiangxiang.c';
        const xiangSource = old ? original(xiang) : readFileSync(join(root, xiang), 'utf8');
        put(prefix + xiang, parent + method(xiangSource, 'int check_rescure(object who) {')
            .replace(/\bcommand\(/g, 'record_command('));
        put(prefix + 'd/changan/npc/obj/book.c', readFileSync(join(root, 'd/changan/npc/obj/book.c'), 'utf8'));
        if (old) put(prefix + 'd/changan/npc/obj/yupei.c', original('d/changan/npc/obj/yupei.c'));
    }
    for (const file of [...excluded, 'd/shaolin/obj/huyao.c']) copy(file);
    put('tests/quest_actor.lpc', readFileSync(join(root, 'tools/tests/neck/quest_actor.lpc'), 'utf8'));
}
