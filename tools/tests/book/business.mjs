// Real affected statements/methods; unrelated NPC combat and world scheduling are not booted.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { readBaseline, dynamicSuppliers } from '../book_inventory.mjs';
import { tokens } from '../cloth_inventory.mjs';

export function prepareBookBusiness(root, sandbox, copy) {
    const read = file => readFileSync(join(root, file), 'utf8');
    const put = (file, source) => { mkdirSync(dirname(join(sandbox, file)), { recursive: true }); writeFileSync(join(sandbox, file), source); };
    const method = (source, signature) => {
        const a = source.indexOf(signature), b = source.indexOf('\n}', a);
        assert.ok(a >= 0 && b > a, signature);
        return source.slice(a, b + 2);
    };
    const statement = (source, key) => {
        const syntax = tokens(source), start = syntax.findIndex((t, i) => t.text === 'set' && syntax[i + 2]?.text === JSON.stringify(key));
        assert.ok(start >= 0, key);
        let end = start; while (syntax[end].text !== ';') end++;
        return source.slice(syntax[start].start, syntax[end].end);
    };
    const absolute = (source, file) => source.replaceAll('__DIR__', JSON.stringify('/' + dirname(file).replaceAll('\\', '/') + '/'));
    const data = readBaseline(), rooms = [], carriers = [];
    const roomBase = '#include <config.h>\ninherit ITEM;\n'
        + method(read('mudcore/inherit/room.c'), 'object make_inventory(string file) {') + '\n'
        + method(read('inherit/room/room.c'), 'void reset() {') + '\n'
        + method(read('inherit/room/room.c'), 'void setup() {') + '\n';
    put('tests/book_room.lpc', roomBase);
    put('adm/daemons/rankd.c', 'string query_respect(object who) { return "这位朋友"; }\n');
    copy('cmds/std/give.c');
    put('tests/book_npc.lpc', `inherit "/tests/book_actor";
int command(string line) {
    string arg;
    if (sscanf(line, "give %s", arg) == 1) return "/cmds/std/give"->main(this_object(), arg);
    return 1;
}
`);
    const dealer = read('feature/dealer.c');
    put('tests/book_vendor.lpc', '#include <ansi.h>\ninherit "/tests/vendor";\n'
        + 'private string displayed;\nvoid fixture_printf(string format, string text) { displayed = sprintf(format, text); }\n'
        + 'string query_display() { return displayed; }\n#define printf fixture_printf\n'
        + method(dealer, 'int do_list(string arg) {') + '\n');
    for (const [file, frozen] of Object.entries(data.callers)) {
        const isRoom = tokens(frozen).some((t, i, a) => t.text === 'inherit' && a[i + 1]?.text === 'ROOM');
        const roomId = rooms.length, carrierId = carriers.length;
        if (isRoom) rooms.push('/tests/book_room' + roomId);
        if (file.startsWith('d/sky/npc/')) carriers.push('/tests/book_carrier' + carrierId);
        for (const old of [true, false]) {
            const source = old ? frozen : read(file), prefix = old ? 'tests/old/' : '';
            if (isRoom) {
                let body = statement(source, 'objects');
                const global = source.match(/string \*books\s*=\s*\(\{[\s\S]*?\}\);/);
                if (global) body = global[0] + '\nvoid create() {\n' + body;
                else body = 'void create() {\n' + body;
                body = absolute(body, file).replace(/\brandom\(/g, 'room_random(')
                    .replace('void create() {', 'void create() { set_max_encumbrance(100000000);');
                put(prefix + 'tests/book_room' + roomId + '.lpc', 'inherit "/tests/book_room";\n' + body + '\nsetup();\n}\n');
                // Stand-ins only for the unrelated NPCs carried in the exact room mapping.
                for (const m of body.matchAll(/CLASS_D\("([^"]+)"\)\s*\+\s*"([^"]+)"/g))
                    put('kungfu/class/' + m[1] + m[2] + '.lpc', 'inherit ITEM;\nvoid create() { set_name("刷新夹具", ({ "fixture" })); }\n');
                for (const m of body.matchAll(/"(\/d\/[^"\n]+\/)"\s*"(npc\/[^"\n]+)"/g)) {
                    const path = m[1] + m[2];
                    if (!data.varieties.some(row => row.old_path === path))
                        put(path.slice(1) + '.lpc', 'inherit ITEM;\nvoid create() { set_name("刷新夹具", ({ "fixture" })); }\n');
                }
            }
            if (file.startsWith('d/sky/npc/')) {
                const hit = data.hits.find(h => h.file === file);
                let body = frozen.slice(frozen.lastIndexOf('carry_object', hit.start), frozen.indexOf(';', hit.end) + 1);
                if (!old) body = body.replace(hit.expression, JSON.stringify(hit.new_path));
                put(prefix + 'tests/book_carrier' + carrierId + '.lpc', 'inherit "/tests/book_npc";\nvoid create() { ::create();\n' + absolute(body, file) + '\n}\n');
            }
            if (file === 'd/changan/npc/shuchi.c') put(prefix + 'tests/book_shop.lpc',
                'inherit "/tests/book_vendor";\nvoid create() { ::create();\n' + absolute(statement(source, 'vendor_goods'), file) + '\n}\n');
            if (file === 'd/mingjiao/obj/bag.c') put(prefix + file, source);
            if (file === 'd/changan/npc/yuanwai.c') put(prefix + file,
                'inherit "/tests/book_npc";\n' + absolute(method(source, 'void cry_daughter(object me, object xiangxiang, object who, object yupei) {'), file) + '\n');
            if (file.startsWith('d/quanzhen/npc/zhang')) put(prefix + file,
                'inherit ITEM;\nvoid create() { set("book_count", 1); }\n' + absolute(method(source, 'string ask_me() {'), file) + '\n');
            if (dynamicSuppliers.includes(file)) put(prefix + file,
                'inherit ITEM;\nvoid create() { set("' + (file.includes('dao-chen') ? 'wuqi_count' : 'huju_count') + '", 2); }\n'
                + method(source, file.includes('dao-chen') ? 'string ask_me(string name) {' : 'string ask_me_1(string name) {') + '\n');
        }
    }
    assert.equal(rooms.length, 7); assert.equal(carriers.length, 5);
    put('tests/book_business.json', JSON.stringify({ rooms, carriers }));
    cpSync(join(root, 'tools/tests/book/business.h'), join(sandbox, 'tests/book_business.h'));
    const sefun = join(sandbox, 'tests/sefun.lpc');
    writeFileSync(sefun, readFileSync(sefun, 'utf8') + '\nint room_random(int size) { return master()->room_random(size); }\n'
        + 'int playerp(object ob) { return ob->query("test/player"); }\nint is_sub(string text, string list) { return stringp(list) && strsrch(list, text) >= 0; }\n'
        + 'string log_time() { return ctime(time()); }\nstring log_id(object ob) { return base_name(ob); }\n');
    const master = join(sandbox, 'tests/master.lpc');
    writeFileSync(master, readFileSync(master, 'utf8') + `
private int room_mode, room_draws;
void set_room_mode(int mode) { room_mode = mode; room_draws = 0; }
int room_random(int size) { room_draws++; return room_mode == 2 ? (room_draws - 1) % size : room_mode ? size - 1 : 0; }
`);
}
