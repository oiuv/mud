// Disposable shells execute the real supplier methods and constructor.
import assert from 'node:assert/strict';
import { normalizeWeaponReferences } from '../weapon_classification/normalization.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { original, dynamicCallers } from '../club_inventory.mjs';
import { original as clothOriginal } from '../cloth_inventory.mjs';
import { original as liquidOriginal } from '../liquid_inventory.mjs';
import { prepareBusiness } from './business.mjs';

export function prepareClub(root, sandbox, copy) {
    const put = (file, text) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), text);
    };
    const method = (source, signature) => {
        const start = source.indexOf(signature);
        assert.ok(start >= 0, signature);
        return source.slice(start, source.indexOf('\n}', start) + 2);
    };
    for (const old of [false, true]) for (const file of [...dynamicCallers, 'd/beijing/npc/qianzhenglun.c']) {
        // Earlier migrated stock outside this CLUB batch uses today's canonical IDs.
        const source = old ? normalizeWeaponReferences(original(file)) : readFileSync(join(root, file), 'utf8');
        const qian = file.includes('qianzhenglun'), dao = file.includes('dao-chen');
        let shell = qian ? '#include <ansi.h>\ninherit ITEM;\nint total = 2;\nmapping my_count = ([]);\nint issued(string key) { return my_count[key]; }\n'
            : 'inherit ITEM;\nvoid create() { set("' + (dao ? 'wuqi_count' : 'huju_count') + '", 2); }\n';
        shell += method(source, qian ? 'int do_yao(string arg) {' : dao ? 'string ask_me(string name) {' : 'string ask_me_1(string name) {');
        put((old ? 'tests/old/' : '') + file, shell);
    }
    put('adm/daemons/rankd.c', 'string query_respect(object who) { return "这位朋友"; }\n');
    // Old supplier branches still reference the physical drink in this disposable fixture.
    put('d/shaolin/obj/qingshui-hulu.c', liquidOriginal('d/shaolin/obj/qingshui-hulu.c'));
    for (const file of ['cmds/std/wield.c', 'cmds/std/unwield.c', 'cmds/std/give.c']) copy(file);
    put('tests/club_actor.lpc', readFileSync(join(root, 'tools/tests/club/actor.lpc'), 'utf8'));
    const actor = join(sandbox, 'tests/actor.lpc');
    writeFileSync(actor, readFileSync(actor, 'utf8').replace('void create() {',
        'private object selected_npc;\nprivate string selected_method;\n'
        + 'void select_npc(object npc, string method) { selected_npc = npc; selected_method = method; }\n'
        + 'int call_npc(string arg) { set_temp("last_reply", call_other(selected_npc, selected_method, arg)); return 1; }\n'
        + 'void reset_action() { add_temp("action_resets", 1); }\nvoid create() {')
        .replace('enable_commands();', 'enable_commands();\n    add_action("call_npc", "testnpc");'));
    const sefun = join(sandbox, 'tests/sefun.lpc');
    writeFileSync(sefun, readFileSync(sefun, 'utf8').replace(
        'varargs void message_vision(string message, object actor, object target) {}',
        'varargs void message_vision(string message, object actor, object target) { master()->record_message(message); }'));
    writeFileSync(sefun, readFileSync(sefun, 'utf8') + '\nint playerp(object ob) { return 0; }\n'
        + 'int is_sub(string text, string list) { return stringp(list) && strsrch(list, text) >= 0; }\n'
        + 'string log_time() { return ctime(time()); }\nstring log_id(object ob) { return base_name(ob); }\n');
    const master = join(sandbox, 'tests/master.lpc');
    writeFileSync(master, readFileSync(master, 'utf8') + '\nprivate mapping setup_counts = ([]);\n'
        + 'void record_setup(object ob) { setup_counts[ob]++; }\nint setup_count(object ob) { return setup_counts[ob]; }\n'
        + 'private string last_message;\nvoid record_message(string text) { last_message = text; }\n'
        + 'string query_message() { return last_message; }\n');
    if (!process.argv.includes('--bench')) {
        const parent = join(sandbox, 'inherit/misc/equip.c');
        writeFileSync(parent, readFileSync(parent, 'utf8').replace('void setup() {',
            'void setup() {\n    master()->record_setup(this_object());'));
    }
    const itemd = readFileSync(join(root, 'adm/daemons/itemd.c'), 'utf8');
    const dealer = readFileSync(join(root, 'feature/dealer.c'), 'utf8');
    put('tests/club_vendor.lpc', '#include <ansi.h>\ninherit "/tests/vendor";\n'
        + 'private string displayed;\nvoid fixture_printf(string format, string text) { displayed = sprintf(format, text); }\n'
        + 'string query_display() { return displayed; }\n#define printf fixture_printf\n'
        + method(dealer, 'int do_list(string arg) {') + '\n');
    put('tests/unknown_club.lpc', '#include <weapon.h>\ninherit CLUB;\n'
        + 'void create() { set_name("未登记棍", ({ "unknown club" })); set("unit", "把"); init_club(5); setup(); }\n'
        + 'object create_virtual_object(string key) { return new("/tests/unknown_club"); }\n');
    put('tests/club_durability.c', '#include <ansi.h>\n#define random(n) 0\n'
        + method(itemd, 'void reduce_consistence(object item) {') + '\n');
    const mengzhu = readFileSync(join(root, 'clone/npc/meng-zhu.c'), 'utf8');
    put('tests/mengzhu.lpc', '#include <ansi.h>\n#define MENGZHU "/data/npc/meng-zhu"\n'
        + 'inherit "/tests/village_npc";\ninherit F_SAVE;\n'
        + method(mengzhu, 'string query_save_file() {') + '\n'
        + method(mengzhu, 'void create() {') + '\n');
    put('d/changan/npc/obj/cloth.c', clothOriginal('d/changan/npc/obj/cloth.c'));
    mkdirSync(join(sandbox, 'data/npc'), { recursive: true });
    if (!process.argv.includes('--baseline-only') && !process.argv.includes('--bench')) prepareBusiness(root, sandbox);
    else put('tests/club_business.h', 'void check_qian() {}\nvoid check_dynamic() {}\nvoid check_actual_shops() {}\nvoid check_npc_equipment() {}\nvoid check_feng() {}\n');
}
