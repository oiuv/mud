// Execute frozen/current business statements in disposable adapters, never a live NPC.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
import { readBaseline } from '../throwing_inventory.mjs';
import { tokens } from '../cloth_inventory.mjs';

export function prepareBusiness(root, sandbox) {
    const put = (file, source) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), source);
    };
    const read = file => readFileSync(join(root, file), 'utf8');
    const data = readBaseline(), shops = [], rooms = [], equipment = [];
    const method = (source, signature) => {
        const start = source.indexOf(signature), end = source.indexOf('\n}', start);
        assert.ok(start >= 0 && end > start, signature);
        return source.slice(start, end + 2);
    };
    const resolveDir = (source, file) => source.replaceAll('__DIR__', JSON.stringify('/' + posix.dirname(file) + '/'));
    for (const [file, source] of Object.entries(data.callers)) {
        const syntax = tokens(source);
        const statements = key => syntax.flatMap((t, i) => t.text === 'set' && syntax[i + 2]?.text === JSON.stringify(key) ? [i] : []).map(start => {
            let end = start; while (syntax[end].text !== ';') end++;
            return [syntax[start].start, syntax[end].end];
        });
        const constructorEnd = source.indexOf('\n}', source.indexOf('void create()'));
        const equips = /\/(?:honghua\/zhao|taohua\/huang)\.c$/.test(file) ? [] : data.hits.filter(h => h.file === file && h.end < constructorEnd && /carry_object\s*\(\s*$/.test(source.slice(Math.max(0, h.start - 30), h.start))).map(h => {
            let begin = source.lastIndexOf('carry_object', h.start);
            const hand = source.lastIndexOf('set_temp("handing"', begin);
            if (hand > source.lastIndexOf('\n', begin)) begin = hand;
            return [begin, source.indexOf(';', h.end) + 1];
        });
        for (const [ranges, list, type] of [[statements('vendor_goods'), shops, 'shop'], [statements('objects'), rooms, 'room'], [equips, equipment, 'npc']]) {
            const hits = data.hits.filter(h => h.file === file && ranges.some(([a, b]) => h.start >= a && h.end <= b));
            if (!hits.length) continue;
            const fixture = 'tests/throwing_' + type + '_' + list.length;
            list.push({ file, fixture: '/' + fixture, count: hits.length });
            for (const old of [true, false]) {
                let body = ranges.map(([a, b]) => source.slice(a, b)).join('\n');
                if (!old) for (const hit of hits) body = body.replaceAll(hit.expression, JSON.stringify(hit.new_path));
                const parent = type === 'room' ? '/tests/room' : '/tests/village_npc';
                put((old ? 'tests/old/' : '') + fixture + '.lpc', 'inherit "' + parent + '";\n'
                    + (type === 'shop' ? 'inherit F_DEALER;\n' : '')
                    + '#define random(n) (n - 1)\nvoid create() { ' + (type === 'room' ? '::create();' : 'setup();') + '\n'
                    + resolveDir(body, file) + '\n}\n');
            }
        }
    }
    assert.equal(shops.length, 2); assert.equal(rooms.length, 7); assert.equal(equipment.length, 17); // Plus Zhao/Huang conditional constructors below.
    for (const [kind, records] of Object.entries({ shops, rooms, equipment }))
        put('tests/throwing-' + kind + '.json', JSON.stringify(records));
    // Complete stock is retained. Copy unrelated physical stock only into the disposable mudlib.
    for (const record of shops) for (const token of tokens(resolveDir(data.callers[record.file], record.file))) {
        if (token.kind !== 'string') continue;
        let path = JSON.parse(token.text);
        if (path.startsWith('obj/')) path = '/' + posix.dirname(record.file) + '/' + path;
        if (path.startsWith('/d/') && !path.startsWith('/d/items/') && existsSync(join(root, path.slice(1) + '.c')))
            put(path.slice(1) + '.c', read(path.slice(1) + '.c'));
    }
    const qianFile = 'd/beijing/npc/qianzhenglun.c';
    for (const old of [true, false]) put((old ? 'tests/old/' : '') + qianFile,
        '#include <ansi.h>\ninherit ITEM;\nint total = 2;\nmapping my_count = ([]);\n'
        + 'int issued(string key) { return my_count[key]; }\n'
        + resolveDir(method(old ? data.callers[qianFile] : read(qianFile), 'int do_yao(string arg) {'), qianFile));
    put('d/beijing/npc/obj/body.c', read('d/beijing/npc/obj/body.c'));
    put('adm/daemons/rankd.c', 'string query_respect(object who) { return "这位朋友"; }\n');
    for (const [file, signature, family, id, macro, uniqueId] of [
        ['kungfu/class/honghua/lu.c', 'mixed ask_zhen()', '红花会', 'lu feiqing'],
        ['kungfu/class/lingjiu/sang.c', 'mixed ask_me()', '灵鹫宫', 'sang tugong'],
        ['kungfu/class/riyue/sang.c', 'mixed ask_me()', '日月神教', 'sang sanniang'],
        ['kungfu/class/honghua/zhao.c', 'mixed ask_bi()', '红花会', 'zhao banshan', 'HUILONGBI', 'huilong bi'],
        ['kungfu/class/taohua/huang.c', 'mixed ask_yuxiao()', '桃花岛', 'huang yaoshi', 'YUXIAO', 'yu xiao']]) {
        for (const old of [true, false]) {
            const source = old ? data.callers[file] : read(file);
            let define = '', branch = '';
            const stock = macro ? '' : source.match(/set\("zhen_count", \d+\);/)?.[0];
            assert.ok(macro || stock, 'original supplier stock');
            if (macro) {
                const unique = source.match(new RegExp('^#define ' + macro + '\\s+("[^"]+")', 'm'))?.[1];
                assert.ok(unique, macro); define = '#define ' + macro + ' ' + unique + '\n';
                // A named movable object stands in for unique combat abilities, not ownership decisions.
                put(JSON.parse(unique).slice(1) + '.lpc', 'inherit ITEM;\nvoid create() { set_name("独门兵器", ({ '
                    + JSON.stringify(uniqueId) + ' })); set("unit", "件"); set_weight(100); }\n');
                const start = source.indexOf('    if (clonep()) {'), end = source.indexOf('    carry_object(', start);
                assert.ok(start >= 0 && end > start, 'bounded unique acquisition');
                branch = source.slice(start, end);
            }
            put((old ? 'tests/old/' : '') + file,
                '#include <ansi.h>\ninherit "/tests/throwing_actor";\n' + define
                // The full NPC command dispatcher is outside this fixture. Give still runs its complete production body.
                + 'int command(string line) { string arg; if (sscanf(line, "give %s", arg) == 1) return "/cmds/std/give"->main(this_object(), arg); return 1; }\n'
                + 'void create() { object ob; ::create(); set_name("领物师父", ({ ' + JSON.stringify(id) + ' })); '
                + 'set("family/family_name", ' + JSON.stringify(family) + '); ' + stock + '\n' + branch + '\n}\n'
                + method(source, signature + ' {') + '\n');
        }
    }
    put('tests/throwing_business.h', read('tools/tests/throwing/business.lpc'));
}
