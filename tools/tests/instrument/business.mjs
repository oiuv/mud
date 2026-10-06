// Execute original room constructors and exact vendor/carrier statements in an isolated host.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { readBaseline } from '../instrument_inventory.mjs';
import { tokens } from '../cloth_inventory.mjs';

export function prepareInstrumentBusiness(root, sandbox, copy) {
    const read = file => readFileSync(join(root, file), 'utf8');
    const put = (file, text) => { mkdirSync(dirname(join(sandbox, file)), { recursive: true }); writeFileSync(join(sandbox, file), text); };
    const method = (source, signature) => {
        const a = source.indexOf(signature), b = source.indexOf('\n}', a);
        assert.ok(a >= 0 && b > a, signature);
        return source.slice(a, b + 2);
    };
    const absolute = (source, file) => source.replaceAll('__DIR__', JSON.stringify('/' + dirname(file).replaceAll('\\', '/') + '/'));
    const goods = source => {
        const t = tokens(source), start = t.findIndex((v, i) => v.text === 'set' && t[i + 2]?.text === '"vendor_goods"');
        assert.ok(start >= 0);
        let end = start; while(t[end].text !== ';') end++;
        return source.slice(t[start].start, t[end].end);
    };
    const data = readBaseline(), rooms = [], vendors = [], carriers = [];
    const roomBase = '#include <config.h>\ninherit ITEM;\n'
        + method(read('mudcore/inherit/room.c'), 'object make_inventory(string file) {') + '\n'
        + method(read('inherit/room/room.c'), 'void reset() {') + '\n'
        + method(read('inherit/room/room.c'), 'void setup() {') + '\n';
    put('tests/instrument_room.lpc', roomBase);
    const dealer = read('feature/dealer.c');
    put('tests/instrument_vendor.lpc', '#include <ansi.h>\ninherit "/tests/vendor";\n'
        + 'private string displayed;\nvoid fixture_printf(string format, string text) { displayed = sprintf(format, text); }\n'
        + 'string query_display() { return displayed; }\n#define printf fixture_printf\n'
        + method(dealer, 'int do_list(string arg) {') + '\n');
    const roomFiles = ['d/baituo/wuqiku.c', 'd/taohua/daojufang.c'];
    const vendorFiles = ['d/changan/npc/liu.c', 'd/hengyang/npc/feiyan.c'];
    for (const [file, frozen] of Object.entries(data.callers)) {
        const roomIndex = roomFiles.indexOf(file), vendorIndex = vendorFiles.indexOf(file), carrierIndex = carriers.length;
        if (roomIndex >= 0) rooms.push('/tests/instrument_room' + roomIndex);
        else if (vendorIndex >= 0) vendors.push('/tests/instrument_vendor' + vendorIndex);
        else carriers.push({ fixture: '/tests/instrument_carrier' + carrierIndex, file,
            handing: frozen.includes('set_temp("handing", carry_object(') });
        for (const old of [true, false]) {
            const source = old ? frozen : read(file), prefix = old ? 'tests/old/' : '';
            if (roomIndex >= 0) {
                // Preserve complete branching and setup; replace_program has its actual replacement base.
                const body = absolute(method(source, 'void create() {'), file)
                    .replace(/\brandom\(/g, 'instrument_room_random(')
                    .replace('void create() {', 'void create() { set_max_encumbrance(100000000);');
                put(prefix + 'tests/instrument_room' + roomIndex + '.lpc',
                    '#undef ROOM\n#define ROOM "/tests/instrument_room"\ninherit ROOM;\n' + body + '\n');
            } else if (vendorIndex >= 0) {
                put(prefix + 'tests/instrument_vendor' + vendorIndex + '.lpc',
                    'inherit "/tests/instrument_vendor";\nvoid create() { ::create();\n'
                    + absolute(goods(source), file) + '\n}\n');
            } else {
                const hit = data.hits.find(h => h.file === file);
                assert.ok(hit);
                const start = frozen.lastIndexOf('\n', hit.start) + 1;
                let line = frozen.slice(start, frozen.indexOf(';', hit.end) + 1);
                if (!old) line = line.replace(hit.expression, JSON.stringify(hit.new_path));
                put(prefix + 'tests/instrument_carrier' + carrierIndex + '.lpc',
                    'inherit "/tests/instrument_actor";\nvoid create() { ::create();\n'
                    + absolute(line, file) + '\n}\n');
            }
        }
    }
    assert.equal(rooms.length, 2); assert.equal(vendors.length, 2); assert.equal(carriers.length, 7);
    put('tests/instrument_business.json', JSON.stringify({ rooms, vendors, carriers }));
    // Unrelated room NPCs are inert; actual item and merchant goods programs remain real.
    for (const file of ['d/baituo/npc/shiwei', 'd/taohua/npc/yapu'])
        put(file + '.lpc', 'inherit ITEM;\nvoid create() { set_name("刷新夹具", ({ "fixture" })); }\n');
    for (const file of ['clone/weapon/gangzhang.c', 'd/taohua/obj/bagua.c', 'd/taohua/obj/xiang.c',
        'd/changan/npc/obj/shield.c', 'd/xiyu/obj/fire.c', 'd/item/obj/chanhs.c',
        'clone/misc/wood.c', 'clone/misc/diaogan.c', 'clone/misc/yuer.c', 'clone/misc/yanwu.c', 'clone/misc/shexiang.c',
        'd/hengyang/yueqi/yuepu-book.c', 'd/hengyang/yueqi/yueqi-book.c', 'd/hengyang/yueqi/huxian-book.c']) copy(file);
    cpSync(join(root, 'tools/tests/instrument/business.h'), join(sandbox, 'tests/instrument_business.h'));
    const sefun = join(sandbox, 'tests/sefun.lpc'), master = join(sandbox, 'tests/master.lpc');
    writeFileSync(sefun, readFileSync(sefun, 'utf8') + '\nint instrument_room_random(int size) { return master()->instrument_room_random(size); }\n');
    writeFileSync(master, readFileSync(master, 'utf8') + `
private int room_mode;
void set_room_mode(int mode) { room_mode = mode; }
int instrument_room_random(int size) {
    if (room_mode == 0) return size - 1;
    if (room_mode == 1) return size == 5 ? 0 : size - 1;
    return 0;
}
`);
}
