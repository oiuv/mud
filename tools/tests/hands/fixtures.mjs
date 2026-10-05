// Disposable fixtures run the working tree's real business methods. No live NPCs.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { excluded } from '../hands_inventory.mjs';

export function prepareHands(root, sandbox, method, copy) {
    const put = (file, source) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), source);
    };
    for (const file of ['d/xiangyang/npc/wuxiuwen.c', 'kungfu/class/shaolin/dao-xiang.c'])
        put(file, 'inherit ITEM;\n' + method(file, 'string ask_me_1(string name) {') + '\n'
            + method(file, 'string ask_me_2(string name) {'));
    const monk = 'd/shaolin/npc/datie-seng.c';
    const source = readFileSync(join(root, monk), 'utf8');
    const pool = source.match(/string \*armors = \(\{[\s\S]*?\}\);/)[0];
    const entries = [...pool.matchAll(/"([^"]+)"/g)].map(m => m[1]);
    assert.equal(entries.length, 10);
    assert.equal(entries.filter(p => p === '/d/items/hands/shaolin_tieshou').length, 9);
    assert.equal(entries[0], '/clone/book/book-iron');
    const reward = method(monk, 'mixed ask_armor() {');
    assert.equal(reward.split('random(sizeof(armors))').length, 2);
    // Pin only the RNG in the copied method, exercising every actual pool entry.
    put(monk, 'inherit ITEM;\n' + pool + '\nint choice;\n'
        + 'void choose(int n) { choice = n; }\nstring *pool() { return armors; }\n'
        + reward.replace('random(sizeof(armors))', 'choice') + '\n' + method(monk, 'void reset() {'));
    const cave = 'd/xiyu/houdong.c';
    put(cave, '#include <ansi.h>\ninherit ITEM;\n'
        + readFileSync(join(root, cave), 'utf8').match(/^#define MUDING .+$/m)[0] + '\n'
        + method(cave, 'int do_move(string arg) {') + '\n' + method(cave, 'int do_pick(string arg) {'));
    // The quest artifact itself is outside this migration; use a movable blueprint.
    put('clone/misc/swmuding.c', 'inherit ITEM;\nvoid create() { set_name("神木王鼎", ({ "mu ding" })); }\n');
    const actor = join(sandbox, 'tests/actor.lpc');
    writeFileSync(actor, readFileSync(actor, 'utf8') + '\nint deaths;\nvoid die() { deaths++; }\nint death_count() { return deaths; }\n');
    for (const file of [...excluded, 'clone/book/book-iron.c', 'd/shaolin/obj/huyao.c']) copy(file);
}
