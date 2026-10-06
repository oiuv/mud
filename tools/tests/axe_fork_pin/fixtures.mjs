// Disposable shells execute the real supplier methods and constructor.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { original } from '../axe_fork_pin_inventory.mjs';
import { original as clothOriginal } from '../cloth_inventory.mjs';
import { original as liquidOriginal } from '../liquid_inventory.mjs';
import { prepareBusiness } from './business.mjs';

export function prepareWeapons(root, sandbox, copy) {
    const put = (file, text) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), text);
    };
    const method = (source, signature) => {
        const start = source.indexOf(signature);
        assert.ok(start >= 0, signature);
        return source.slice(start, source.indexOf('\n}', start) + 2);
    };
    for (const old of [false, true]) for (const file of ['d/beijing/npc/qianzhenglun.c']) {
        const source = old ? original(file) : readFileSync(join(root, file), 'utf8');
        let shell = '#include <ansi.h>\ninherit ITEM;\nint total = 2;\nmapping my_count = ([]);\nint issued(string key) { return my_count[key]; }\n';
        shell += method(source, 'int do_yao(string arg) {');
        put((old ? 'tests/old/' : '') + file, shell);
    }
    put('adm/daemons/rankd.c', 'string query_respect(object who) { return "这位朋友"; }\n');
    // Keep the old liquid refusal as a negative storage control.
    put('d/shaolin/obj/qingshui-hulu.c', liquidOriginal('d/shaolin/obj/qingshui-hulu.c'));
    for (const file of ['cmds/std/wield.c', 'cmds/std/unwield.c', 'cmds/std/give.c']) copy(file);
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
    put('tests/axe_fork_pin_vendor.lpc', '#include <ansi.h>\ninherit "/tests/vendor";\n'
        + 'private string displayed;\nvoid fixture_printf(string format, string text) { displayed = sprintf(format, text); }\n'
        + 'string query_display() { return displayed; }\n#define printf fixture_printf\n'
        + method(dealer, 'int do_list(string arg) {') + '\n');
    put('tests/unknown_axe_fork_pin.lpc', '#include <weapon.h>\ninherit AXE;\n'
        + 'void create() { set_name("未登记斧", ({ "unknown axe_fork_pin" })); set("unit", "把"); init_axe(5); setup(); }\n'
        + 'object create_virtual_object(string key) { return new("/tests/unknown_axe_fork_pin"); }\n');
    put('tests/axe_fork_pin_durability.c', '#include <ansi.h>\n#define random(n) 0\n'
        + method(itemd, 'void reduce_consistence(object item) {') + '\n');
    const mengzhu = readFileSync(join(root, 'clone/npc/meng-zhu.c'), 'utf8');
    put('tests/mengzhu.lpc', '#include <ansi.h>\n#define MENGZHU "/data/npc/meng-zhu"\n'
        + 'inherit "/tests/village_npc";\ninherit F_SAVE;\n'
        + method(mengzhu, 'string query_save_file() {') + '\n'
        + method(mengzhu, 'void create() {') + '\n');
    put('d/changan/npc/obj/cloth.c', clothOriginal('d/changan/npc/obj/cloth.c'));
    mkdirSync(join(sandbox, 'data/npc'), { recursive: true });
    if (process.argv.includes('--bench')) {
        // Windows time_expression can round this small sample to zero.
        // Measure the same old/new workload with the driver's high-resolution clock.
        const bench = join(sandbox, 'tests/benchmark.lpc');
        writeFileSync(bench, readFileSync(bench, 'utf8')
            .replace('int before, loaded, created, compile_us, clone_us;', 'int before, loaded, created, compile_us, clone_us, started;')
            .replace('compile_us = time_expression (load_blueprints(cases, config["version"]));',
                'started = perf_counter_ns(); load_blueprints(cases, config["version"]); compile_us = (perf_counter_ns() - started) / 1000;')
            .replace('clone_us = time_expression (populate(objects, cases, config["version"]));',
                'started = perf_counter_ns(); populate(objects, cases, config["version"]); clone_us = (perf_counter_ns() - started) / 1000;'));
    }
    if (!process.argv.includes('--baseline-only') && !process.argv.includes('--bench')) prepareBusiness(root, sandbox);
    else put('tests/axe_fork_pin_business.h', 'void check_qian() {}\nvoid check_dynamic() {}\nvoid check_actual_shops() {}\nvoid check_npc_equipment() {}\nvoid check_famu() {}\n');
}
