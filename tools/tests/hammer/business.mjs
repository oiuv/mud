import { readBaseline as clubBaseline, migrationPaths as clubPaths } from '../club_inventory.mjs';
import { readBaseline as daggerBaseline, migrationPaths as daggerPaths } from '../dagger_inventory.mjs';
import { readBaseline as throwingBaseline, migrationPaths as throwingPaths } from '../throwing_inventory.mjs';
import { readBaseline as whipBaseline, migrationPaths as whipPaths } from '../whip_inventory.mjs';
// Disposable adapters execute the selected game methods; no live server or saves.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { original, readBaseline } from '../hammer_inventory.mjs';
import { readBaseline as staffBaseline, migrationPaths as staffPaths } from '../staff_inventory.mjs';
import { tokens } from '../cloth_inventory.mjs';
import { normalizeWeaponReferences } from '../weapon_classification/normalization.mjs';

export function prepareBusiness(root, sandbox) {
    const put = (file, source) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        // Original physical objects remain frozen; previously migrated external
        // goods and the current side use the reviewed canonical identities.
        writeFileSync(join(sandbox, file), normalizeWeaponReferences(source));
    };
    const method = (source, signature) => {
        const start = source.indexOf(signature), end = source.indexOf('\n}', start) + 2;
        assert.ok(start >= 0 && end > start, signature);
        return source.slice(start, end);
    };
    const read = file => [...clubBaseline().varieties, ...throwingBaseline().varieties].find(row => row.old_path + '.c' === '/' + file)?.source ?? readFileSync(join(root, file), 'utf8');
    put('tests/staff-migration-paths.json', JSON.stringify({ ...staffPaths(), ...whipPaths(), ...daggerPaths(), ...throwingPaths(), ...clubPaths() }));
    const actor = join(sandbox, 'tests/actor.lpc');
    writeFileSync(actor, readFileSync(actor, 'utf8') + '\n'
        + 'int return_tool(string id) { return selected_npc->accept_object(this_object(), present(id, this_object())); }\n'
        + 'int is_busy() { return query_temp("fixture_busy"); }\n'
        + 'int is_fighting() { return query_temp("fixture_fight"); }\n'
        + 'int visible(object other) { return 1; }\n'
        + 'int query_condition(string name) { return query_temp("fixture_condition"); }\n'
        + 'varargs int query_skill(string name, int raw) { return query("fixture_skills/" + name); }\n'
        + 'int can_improve_skill(string name) { return 1; }\n'
        + 'void improve_skill(string name, int amount) { add_temp("improved/" + name, amount); }\n'
        + 'void receive_damage(string key, int amount) { add(key, -amount); }\n'
        + 'void unconcious() { set_temp("fixture_fainted", 1); }\n');
    writeFileSync(actor, readFileSync(actor, 'utf8').replace('add_action("call_npc", "testnpc");',
        'add_action("call_npc", "testnpc"); add_action("return_tool", "testreturn");'));
    for (const old of [true, false]) {
        const prefix = old ? 'tests/old/' : '';
        const source = old ? original('d/wuguan/npc/wuxiuwen.c') : read('d/wuguan/npc/wuxiuwen.c');
        put(prefix + 'tests/wuxiuwen.lpc', '#include <ansi.h>\ninherit ITEM;\n'
            + method(source, 'string give_tools() {') + '\n'
            + method(source, 'int accept_object(object me, object obj) {') + '\n');
        for (const [file, name] of [['d/village/npc/smith.c', 'smith'], ['d/death/npc/wangfangping.c', 'wang']]) {
            const text = old ? original(file) : read(file);
            put(prefix + 'tests/' + name + '.lpc', '#include <ansi.h>\ninherit "/tests/village_npc";\ninherit F_DEALER;\n'
                + 'string ask_me() { return ""; }\nvoid add_money(string unit, int count) { MONEY_D->pay_player(this_object(), count); }\n'
                + method(text, 'void create() {').replaceAll('__DIR__', JSON.stringify('/' + dirname(file).replaceAll('\\', '/') + '/')) + '\n');
        }
        for (const [file, name, unique, macro, ask] of [
            ['kungfu/class/meizhuang/heibai.c', 'heibai', '/clone/lonely/qipan', 'QIPAN', 'ask_qipan'],
            ['kungfu/class/riyue/fan.c', 'fan', '/clone/lonely/poyangfu', 'POYANG', 'ask_fu'],
        ]) {
            const text = old ? original(file) : read(file);
            put(prefix + 'tests/' + name + '.lpc', '#include <ansi.h>\n#define ' + macro + ' "' + unique + '"\n'
                + 'inherit "/tests/village_npc";\n'
                + 'void map_skill(string a, string b) {}\nvoid prepare_skill(string a, string b) {}\n'
                + 'void create_family(string a, int b, string c) {}\nvoid perform_action(string a) {}\nvoid exert_function(string a) {}\n'
                + 'mixed ask_skill1() { return 0; }\nmixed ask_skill2() { return 0; }\nmixed ask_skill3() { return 0; }\nmixed ask_riyue() { return 0; }\n'
                // Only the command engine is doubled: the actual request checks and replacement creation remain intact.
                + 'int fixture_command(string line) { object item; string id, who; if (sscanf(line, "give %s to %s", id, who) == 2) { item = present(id, this_object()); if (item) { item->unequip(); item->move(this_player(), 1); } } return 1; }\n'
                + '#define command fixture_command\n'
                + method(text, 'mixed ' + ask + '() {') + '\n'
                + method(text, 'void create() {') + '\n');
        }
    }
    for (const [name, id] of [['qipan', 'xuantie qipan'], ['poyangfu', 'poyang fu']])
        put('clone/lonely/' + name + '.c', '#include <weapon.h>\ninherit HAMMER;\nvoid create() { set_name("独特兵器夹具", ({ "' + id + '" })); set("unit", "件"); set_weight(1000); init_hammer(10); setup(); }\n');
    put('d/meizhuang/obj/qizi.c', read('d/meizhuang/obj/qizi.c'));
    for (let i = 1; i <= 39; i++) {
        if ([6, 7, 8, 9, 11, 12].includes(i)) continue;
        const file = 'd/death/obj/weapon' + i;
        const frozen = [...staffBaseline().varieties, ...whipBaseline().varieties, ...daggerBaseline().varieties, ...throwingBaseline().varieties].find(row => row.old_path === '/' + file);
        put(file + '.c', frozen ? frozen.source : read(file + '.c'));
    }
    for (const [name, action] of [['guofu_caidi1', 'chu'], ['guofu_caidi2', 'jiao'], ['guofu_mafang', 'sao']])
        put('tests/' + action + '.lpc', '#include <ansi.h>\ninherit ITEM;\n#define random(n) 0\n'
            + method(read('d/wuguan/' + name + '.c'), 'int do_' + action + '(string arg) {') + '\n');
    // Extract unchanged real room stock statements, then test only this migration's entries.
    const data = readBaseline(), rooms = [];
    for (const [file, frozen] of Object.entries(data.callers)) {
        if (!/inherit ROOM;/.test(frozen)) continue;
        const syntax = tokens(frozen);
        const ranges = syntax.flatMap((t, i) => t.text === 'set' && syntax[i + 2]?.text === '"objects"' ? [i] : []).map(start => {
            let end = start; while (syntax[end].text !== ';') end++;
            return [syntax[start].start, syntax[end].end];
        });
        const statement = ranges.map(([start, end]) => frozen.slice(start, end)).join('\n');
        const hits = data.hits.filter(h => h.file === file && ranges.some(([start, end]) => h.start >= start && h.end <= end));
        if (!hits.length) continue;
        const name = 'tests/hammer_room_' + rooms.length;
        rooms.push({ file, fixture: '/' + name });
        for (const old of [true, false]) {
            let body = statement;
            if (!old) for (const hit of hits) body = body.replaceAll(hit.expression, JSON.stringify(hit.new_path));
            put((old ? 'tests/old/' : '') + name + '.lpc', 'inherit "/tests/room";\n#define random(n) (n - 1)\nvoid create() { ::create();\n'
                + body.replaceAll('__DIR__', JSON.stringify('/' + dirname(file).replaceAll('\\', '/') + '/')) + '\n}\n');
        }
    }
    assert.equal(rooms.length, 19);
    put('tests/hammer-rooms.json', JSON.stringify(rooms));
    put('tests/hammer_business.h', readFileSync(join(root, 'tools/tests/hammer/business.lpc'), 'utf8'));
}
