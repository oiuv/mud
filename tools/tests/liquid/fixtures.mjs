// Execute current and frozen consumer methods, with unrelated services omitted.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { original } from '../liquid_inventory.mjs';

export function prepareLiquid(root, sandbox, copy) {
    const put = (file, source) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), source);
    };
    const method = (source, signature) => {
        const start = source.indexOf(signature);
        assert.ok(start >= 0, signature);
        const end = source.indexOf('\n}', start);
        assert.ok(end > start, signature);
        return source.slice(start, end + 2) + '\n';
    };
    const banquets = ['d/city/furong.c', 'd/city/meigui.c', 'd/city/mudan.c', 'd/hangzhou/loveroom.c'];
    const kitchen = 'd/huashan/chufang.c', maid = 'd/yanziwu/npc/susu.c', search = 'cmds/std/search.c';
    for (const old of [false, true]) for (const file of [...banquets, kitchen, maid, search]) {
        const source = old ? original(file) : readFileSync(join(root, file), 'utf8');
        let shell;
        if (banquets.includes(file)) {
            shell = '#include <ansi.h>\ninherit "/tests/room";\n'
                + method(source, 'varargs protected void create_water(')
                + method(source, 'varargs protected void create_wine(')
                + 'void serve_fixture(int wine, string description) {\n'
                + '    if (wine) create_wine("桂花酒", ({ "fixture cup" }), "琉璃杯", description);\n'
                + '    else create_water("龙井茶", ({ "fixture cup" }), "青瓷盏", description);\n}\n';
        } else if (file === kitchen) {
            shell = 'inherit "/tests/room";\n' + method(source, 'int do_serve() {')
                + method(source, 'int valid_leave(') + method(source, 'void reset() {');
        } else if (file === maid) {
            shell = 'inherit ITEM;\n' + method(source, 'void serve_tea(object who) {') + method(source, 'void reset() {');
        } else shell = method(source, 'mapping query_default_objects(');
        shell = shell.replaceAll('__DIR__', JSON.stringify('/' + posix.dirname(file) + '/'));
        put((old ? 'tests/old/' : '') + file, shell);
    }
    copy('d/shaolin/fanting1.c');
    put('tests/liquid_business.lpc', readFileSync(join(root, 'tools/tests/liquid/business.lpc'), 'utf8'));
    put('tests/liquid-consumers.json', JSON.stringify({ banquets, kitchen, maid, search }));
}
