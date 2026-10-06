// Disposable adapters: production commands and skill body, no live MUD or records.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { prepareBusiness } from './business.mjs';

export function prepareThrowing(root, sandbox, copy) {
    const put = (file, source) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), source);
    };
    const read = file => readFileSync(join(root, file), 'utf8');
    const method = (source, signature) => {
        const start = source.indexOf(signature), end = source.indexOf('\n}', start);
        assert.ok(start >= 0 && end > start, signature);
        return source.slice(start, end + 2);
    };
    for (const name of ['get', 'drop', 'give', 'put', 'hand', 'wield']) copy('cmds/std/' + name + '.c');
    copy('kungfu/skill/eff_msg.h');
    const skill = read('kungfu/skill/tangmen-throwing/hua.c');
    assert.ok(skill.includes('inherit F_SSERVER;'));
    // Only combat infrastructure/random choice are doubles; execute the entire original perform.
    put('tests/throwing_skill.lpc', skill.replace('inherit F_SSERVER;',
        '#define random(n) 0\nobject offensive_target(object me) { return 0; }\n'));
    put('adm/daemons/combatd.lpc', 'void clear_ahinfo() {}\nstring query_ahinfo() { return 0; }\n');
    put('tests/throwing_actor.lpc', read('tools/tests/throwing/actor.lpc'));
    const mengzhu = read('clone/npc/meng-zhu.c');
    put('tests/mengzhu.lpc', '#include <ansi.h>\n#define MENGZHU "/data/npc/meng-zhu"\n'
        + 'inherit "/tests/village_npc";\ninherit F_SAVE;\n'
        + method(mengzhu, 'string query_save_file() {') + '\n'
        + method(mengzhu, 'void create() {') + '\n');
    mkdirSync(join(sandbox, 'data/npc'), { recursive: true });
    put('tests/unknown_throwing.lpc', '#include <weapon.h>\ninherit THROWING;\n'
        + 'void create() { set_name("未登记暗器", ({ "unknown throwing" })); set("base_unit", "枚"); set("unit", "些"); set("base_weight", 1); set_amount(5); init_throwing(5); setup(); }\n'
        + 'object create_virtual_object(string key) { return new("/tests/unknown_throwing"); }\n');
    put('tests/throwing_container.lpc', 'inherit ITEM;\nint is_container() { return 1; }\n'
        + 'void create() { set_name("布袋", ({ "fixture bag" })); set("unit", "只"); set_max_encumbrance(1000000); }\n');
    const sefun = join(sandbox, 'tests/sefun.lpc');
    writeFileSync(sefun, readFileSync(sefun, 'utf8') +
        '\nint playerp(object ob) { return 0; } // Fixture actors are NPCs, not logged-in players.\n' +
        '\nint is_sub(string text, string list) { return stringp(list) && strsrch(list, text) >= 0; }\n'
        + 'string log_time() { return ctime(time()); }\nstring log_id(object ob) { return base_name(ob); }\n'
        + 'int area_move_side(object item, object actor) { error("Area movement outside fixture.\\n"); }\n'
        + 'varargs void tell_area(object room, int x, int y, string text, mixed exclude) { error("Area output outside fixture.\\n"); }\n'
        + 'varargs void message_combatd(string text, object actor, object target) {}\n');
    const master = join(sandbox, 'tests/master.lpc');
    writeFileSync(master, readFileSync(master, 'utf8') + '\nprivate mapping setups = ([]);\n'
        + 'void record_setup(object ob) { setups[ob]++; }\nint setup_count(object ob) { return setups[ob]; }\n');
    if (!process.argv.includes('--bench')) {
        const parent = join(sandbox, 'inherit/weapon/throwing.c');
        writeFileSync(parent, readFileSync(parent, 'utf8').replace('void setup() {',
            'void setup() {\n    master()->record_setup(this_object());'));
    }
    if (!process.argv.includes('--baseline-only') && !process.argv.includes('--bench')) prepareBusiness(root, sandbox);
    else put('tests/throwing_business.h', 'void check_actual_shops() {}\nvoid check_actual_rooms() {}\nvoid check_npc_equipment() {}\nvoid check_needle_suppliers() {}\nvoid check_unique_suppliers() {}\nvoid check_qian() {}\n');
}
