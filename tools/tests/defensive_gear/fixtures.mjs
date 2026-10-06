// Disposable test adapters only; never boots NPC infrastructure or live saves.
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { families, dynamicCallers, original } from '../defensive_gear_inventory.mjs';
import { prepareBusiness } from './business.mjs';

export function prepareDefensive(root, sandbox) {
    const put = (file, source) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), source);
    };
    const method = (source, signature) => {
        const start = source.indexOf(signature), end = source.indexOf('\n}', start);
        assert.ok(start >= 0 && end > start, signature);
        return source.slice(start, end + 2);
    };
    cpSync(join(sandbox, 'tests/regression.lpc'), join(sandbox, 'tests/cloth_regression.lpc'));
    cpSync(join(root, 'tools/tests/defensive_gear/regression.lpc'), join(sandbox, 'tests/regression.lpc'));
    for (const file of ['master.lpc', 'benchmark.lpc']) {
        const target = join(sandbox, 'tests', file);
        writeFileSync(target, readFileSync(target, 'utf8').replaceAll('CLOTH', 'DEFENSIVE_GEAR'));
    }
    const master = join(sandbox, 'tests/master.lpc');
    writeFileSync(master, readFileSync(master, 'utf8') + '\nprivate mapping setup_counts = ([]);\n'
        + 'void record_setup(object ob) { setup_counts[ob]++; }\nint setup_count(object ob) { return setup_counts[ob]; }\n');
    if (!process.argv.includes('--bench')) for (const family of families) {
        const file = join(sandbox, 'inherit/armor/' + family + '.c');
        writeFileSync(file, readFileSync(file, 'utf8').replace('void setup() {', 'void setup() {\n    master()->record_setup(this_object());'));
    }
    if (process.argv.includes('--bench')) {
        const file = join(sandbox, 'tests/benchmark.lpc');
        writeFileSync(file, readFileSync(file, 'utf8')
            .replace('int before, loaded, created, compile_us, clone_us;', 'int before, loaded, created, compile_us, clone_us, started;')
            .replace('compile_us = time_expression (load_blueprints(cases, config["version"]));',
                'started = perf_counter_ns(); load_blueprints(cases, config["version"]); compile_us = (perf_counter_ns() - started) / 1000;')
            .replace('clone_us = time_expression (populate(objects, cases, config["version"]));',
                'started = perf_counter_ns(); populate(objects, cases, config["version"]); clone_us = (perf_counter_ns() - started) / 1000;'));
    }
    cpSync(join(root, 'tools/tests/defensive_gear/business.lpc'), join(sandbox, 'tests/defensive_gear_business.h'));
    if (process.argv.includes('--bench') || process.argv.includes('--baseline-only')) return;
    prepareBusiness(root, sandbox);
    const sefun = join(sandbox, 'tests/sefun.lpc');
    writeFileSync(sefun, readFileSync(sefun, 'utf8') + '\nint playerp(object ob) { return 0; }\n');
    for (const old of [true, false]) for (const file of dynamicCallers) {
        const source = old ? original(file) : readFileSync(join(root, file), 'utf8');
        const qian = file === dynamicCallers[0], chen = file === dynamicCallers[3];
        put((old ? 'tests/old/' : '') + file, '#include <ansi.h>\ninherit ITEM;\n'
            + (qian ? 'int total = 2;\nmapping my_count = ([]);\nint issued(string key) { return my_count[key]; }\n' : '')
            + method(source, qian ? 'int do_yao(string arg) {' : chen ? 'string ask_me(string name) {' : 'string ask_me_1(string name) {')
                .replaceAll('__DIR__', JSON.stringify('/' + dirname(file).replaceAll('\\', '/') + '/')));
    }
    put('adm/daemons/rankd.c', 'string query_respect(object who) { return "这位朋友"; }\n');
    const actor = join(sandbox, 'tests/actor.lpc');
    writeFileSync(actor, readFileSync(actor, 'utf8').replace('void create() {',
        'private object selected_npc;\nprivate string selected_method;\n'
        + 'void select_npc(object npc, string method) { selected_npc = npc; selected_method = method; }\n'
        + 'int call_npc(string arg) { set_temp("last_reply", call_other(selected_npc, selected_method, arg)); return 1; }\n'
        + 'void reset_action() {}\nvoid create() {').replace('enable_commands();', 'enable_commands();\n    add_action("call_npc", "testnpc");'));
    const dealer = readFileSync(join(root, 'feature/dealer.c'), 'utf8');
    put('tests/defensive_gear_vendor.lpc', '#include <ansi.h>\ninherit "/tests/vendor";\n'
        + 'private string displayed;\nvoid fixture_printf(string format, string text) { displayed = sprintf(format, text); }\n'
        + 'string query_display() { return displayed; }\n#define printf fixture_printf\n' + method(dealer, 'int do_list(string arg) {'));
    const itemd = readFileSync(join(root, 'adm/daemons/itemd.c'), 'utf8');
    put('tests/defensive_durability.lpc', '#include <ansi.h>\n#define random(n) 0\n' + method(itemd, 'void reduce_consistence(object item) {'));
    put('tests/unknown_defensive.lpc', '#include <armor.h>\ninherit ARMOR;\n'
        + 'void create() { set_name("旧甲", ({ "test armor" })); set("unit", "件"); setup(); }\n'
        + 'object create_virtual_object(string key) { return new("/tests/unknown_defensive"); }\n');
}
