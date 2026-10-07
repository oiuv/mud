// Real-driver classification checks. Only source is copied; no live saves or services are used.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { normalization, definitionEntries } from './weapon_classification/normalization.mjs';
import { prepareBusiness } from './weapon_classification/business.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const driver = resolve(process.argv[2] || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-weapon-classification-'));
console.log('Isolated weapon classification: ' + sandbox);
const put = (file, text) => {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    writeFileSync(join(sandbox, file), text, 'utf8');
};
const source = file => readFileSync(join(root, file), 'utf8');
const panguBaseline = JSON.parse(source('tools/tests/weapon_classification/pangu-baseline.json'));
for (const file of ['kungfu/skill/pangu-qishi.c', 'kungfu/skill/hanshan-chuifa.lpc']) {
    const stats = [...source(file).matchAll(/"force":\s*(\d+),\s*"attack":\s*(\d+),\s*"dodge":\s*(-?\d+),\s*"parry":\s*(-?\d+),\s*"lvl":\s*(\d+),\s*"damage":\s*(\d+)/g)]
        .map(m => Object.fromEntries(['force', 'attack', 'dodge', 'parry', 'lvl', 'damage'].map((k, i) => [k, Number(m[i + 1])])));
    assert.deepEqual(stats, panguBaseline.actions, file + ': original seven numeric actions retained');
}
const copy = file => put(file, source(file));
const normalizedCases = Object.entries({ ...normalization.moves, ...normalization.merges }).map(([old, target]) => {
    // A moved variety keeps its own values; a merged variety uses the reviewed target's old values.
    const representative = normalization.moves[old] ? old : target;
    const [, , , family, id] = representative.split('/');
    const text = execFileSync('git', ['show', normalization.baseline + ':d/items/' + family + '_data.h'],
        { cwd: root, encoding: 'utf8', maxBuffer: 16e6 });
    const entry = definitionEntries(text).get(id);
    assert.ok(entry, representative);
    const number = key => Number(entry.match(new RegExp('"' + key + '"(?:,|:)\\s*(\\d+)'))?.[1] || 0);
    return { old, target, weight: number('weight'), damage: number('damage'), value: number('value') };
});
put('tests/normalized-items.json', JSON.stringify(normalizedCases));
for (const [id, name] of [['spear', '基本枪法'], ['hanshan-chuifa', '撼山锤法']])
    assert.match(source('data/e2c_dict.o'), new RegExp('"' + id + '"\\s*:\\s*"' + name + '"'));
const method = (file, signature) => {
    const text = source(file), start = text.indexOf(signature + ' {');
    assert.ok(start >= 0, `Missing production method ${file}: ${signature}`);
    return text.slice(start, text.indexOf('\n}', start) + 2) + '\n';
};
for (const dir of ['include', 'feature', 'inherit', 'mudcore/include', 'mudcore/inherit', 'kungfu/skill', 'd/items'])
    cpSync(join(root, dir), join(sandbox, dir), { recursive: true });
for (const dir of ['tests', 'log', 'data']) mkdirSync(join(sandbox, dir), { recursive: true });
for (const file of ['adm/daemons/virtuald.c', 'adm/daemons/weapond.c', 'clone/misc/cloth.c',
    'cmds/skill/learn.c', 'cmds/skill/enable.c', 'cmds/skill/perform.c', 'clone/weapon/changqiang.c',
    'b/yitian/npc/obj/spear.c', 'clone/weapon/qishiji.c', 'clone/cloth/yinjia.c',
    ...[1, 2, 3, 4].map(n => 'clone/fam/etc/prize' + n + '.c')]) copy(file);
for (const file of ['b/tulong/npc/obj/hammer.c', 'b/tulong/npc/obj/jiaofu.c',
    'kungfu/class/riyue/riyue.h', 'clone/lonely/poyangfu.c', 'clone/lonely/huangjinfu.c',
    'clone/lonely/book/zhujian1.c', 'kungfu/class/duan/duan.h']) copy(file);
for (const file of ['clone/lonely/poyangfu.c', 'clone/lonely/huangjinfu.c'])
    put(file, '#define random(n) test_roll(n)\nint test_roll(int limit) { return 0; }\n' + source(file));
// Select each research outcome explicitly; production probabilities stay unchanged.
put('clone/lonely/book/zhongping.c', '#define random(n) test_roll(n)\n'
    + 'int test_roll(int limit);\n' + source('clone/lonely/book/zhongping.c')
    + '\nint test_roll(int limit) { return query("test/success") ? limit - 1 : 0; }\n');
put('adm/daemons/itemd.c', method('adm/daemons/itemd.c', 'void equip_setup(object item)'));
// Public skill dictionary only; no other production data files enter the fixture.
put('adm/daemons/chinesed.c', '#define E2C_DICTIONARY "/data/e2c_dict"\ninherit F_SAVE;\nmapping dict = ([]);\n'
    + method('adm/daemons/chinesed.c', 'void create()')
    + method('adm/daemons/chinesed.c', 'string query_save_file()')
    + method('adm/daemons/chinesed.c', 'string chinese(string str)'));
copy('data/e2c_dict.o');
copy('adm/daemons/masterd.c');
copy('cmds/skill/skills.c');
put('cmds/skill/enable.c', 'void fixture_write(string text);\n#define write fixture_write\n'
    + source('cmds/skill/enable.c') + '\nvoid fixture_write(string text) { this_player()->start_more(text); }\n');
put('tests/json.c', source('mudcore/system/kernel/simul_efun/json.c'));
put('tests/destruct.c', method('adm/single/simul_efun/object.c', 'void destruct(object ob)'));
put('tests/carry_object.c', method('inherit/char/npc.c', 'object carry_object(string file)'));
put('tests/create_family.c', method('feature/apprentice.c', 'void assign_apprentice(string title, int privs)')
    + method('feature/apprentice.c', 'void create_family(string family_name, int generation, string title)'));
put('tests/actions.c', 'private mixed next_action, default_object;\nprivate string default_function;\n'
    + method('feature/attack.c', 'mixed query_action(int flag)')
    + method('feature/attack.c', 'int set_action(mixed action, string fun)')
    + method('feature/attack.c', 'void reset_action()'));
const fileHelpers = source('mudcore/system/kernel/simul_efun/file.c');
let pathHelpers = '';
// Keep exact helper signatures independent of local parameter spelling.
for (const name of ['lpc_object_path', 'lpc_file']) {
    const match = fileHelpers.match(new RegExp('(?:string|mixed) ' + name + '\\([^\\n]+\\) \\{'));
    assert.ok(match, name);
    pathHelpers += method('mudcore/system/kernel/simul_efun/file.c', match[0].slice(0, -2));
}
put('tests/sefun.lpc', source('tools/tests/cloth/sefun.lpc')
    .replace('string to_chinese(string value) { return value; }',
        'string to_chinese(string value) { return CHINESE_D->chinese(value); }') + '\n'
    + 'int userp(object ob) { return !!ob->query("test/player"); }\n'
    + 'int playerp(object ob) { return !!ob->query("test/player"); }\n'
    + 'varargs void message_combatd(string text, object actor, object target) {}\n'
    + 'int is_sub(string text, string list) { return stringp(list) && strsrch(list, text) >= 0; }\n'
    + 'int file_exists(string path) { return file_size(path) >= 0; }\n' + pathHelpers);
put('include/globals.h', source('include/globals.h')
    + '\n#undef SIMUL_EFUN_OB\n#define SIMUL_EFUN_OB "/tests/sefun"\n');
put('tests/master.lpc', source('tools/tests/cloth/master.lpc').replaceAll('CLOTH', 'WEAPON_CLASSIFICATION')
    .replace('name == "destruct"', '(name == "destruct" || name == "userp")')
    .replace('if (!caught) {', 'if (caught && strsrch(details["error"], "Value being indexed") >= 0) debug_message(sprintf("TEST TRACE: %O", details["trace"]));\n    if (!caught) {'));
for (const file of ['actor.lpc', 'regression.lpc']) put('tests/' + file, source('tools/tests/weapon_classification/' + file));
// Keep the complete NPC constructor and real F_MASTER. Replace only generic character
// services; F_SKILL, carrying, virtual items, wielding and skill methods remain real.
for (const file of ['d/guiyun/npc/quanjinfa.c', 'b/tulong/npc/chang.c',
    'kungfu/class/riyue/tong.c', 'kungfu/class/riyue/zhao.c',
    'kungfu/class/riyue/fan.c', 'kungfu/class/duan/gu.c',
    'b/yitian/npc/bing1.c', 'd/huanghe/npc/wu.c'])
    put(file, source(file).replace('inherit NPC;', 'inherit "/tests/actor";'));
put('inherit/char/challenger.c', source('inherit/char/challenger.c').replace('inherit NPC;', 'inherit "/tests/actor";'));
copy('kungfu/class/generate/english.c');
const npcSource = source('adm/daemons/npcd.c');
const levelsStart = npcSource.lastIndexOf('mapping levels = ([');
put('adm/daemons/npcd.c', npcSource.slice(levelsStart, npcSource.indexOf(']);', levelsStart) + 3) + '\n'
    + method('adm/daemons/npcd.c', 'int check_level(object ob)')
    + method('adm/daemons/npcd.c', 'void init_npc_skill(object ob, int lvl)')
    + method('adm/daemons/npcd.c', 'void set_from_me(object tob, object fob, int scale)'));
put('adm/daemons/storyd.lpc', 'inherit ITEM;\nobject query_running_story() { return this_object(); }\n'
    + 'void stop_story() { add("test/stops", 1); }\n');
put('adm/daemons/channeld.lpc', 'void do_channel(object who, string channel, string text) {}\n');
put('adm/daemons/combatd.lpc', 'string do_damage(object me, object target, int type, int damage, int percent, string text) { '
    + 'target->set_temp("test/damage", ({ type, damage, percent })); target->add_temp("test/damage_count", 1); return text; }\n'
    + 'void do_attack(object me, object target, object weapon, int flags) { me->reset_action(); '
    + 'target->add_temp("test/attacks", 1); target->set_temp("test/last_action", me->query_action()); }\n');
put('adm/daemons/rankd.lpc', 'string query_respect(object who) { return "这位朋友"; }\n');
put('tests/feature_spear.lpc', '#include <weapon.h>\ninherit EQUIP;\ninherit F_SPEAR;\n'
    + 'void create() { set_name("练功枪", ({ "spear" })); if (clonep()) set_default_object(__FILE__); '
    + 'else { set("unit", "杆"); init_spear(12, TWO_HANDED); } setup(); }\n');
prepareBusiness(root, sandbox, put, method);

const listener = createServer();
await new Promise((done, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', done); });
const port = listener.address().port;
await new Promise(done => listener.close(done));
put('driver.cfg', [
    'name : Weapon Classification Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'),
    'log directory : /log', 'debug log file : debug.log',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>',
    'master file : /tests/master', 'simulated efun file : /tests/sefun', 'gametick msec : 100',
].join('\n') + '\n');
const result = await new Promise((done, reject) => {
    const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
    let output = '';
    const timer = setTimeout(() => child.kill(), 60000);
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); done({ code, output }); });
});
put('driver-output.txt', result.output);
const debug = join(sandbox, 'log/debug.log');
const diagnostics = result.output + (existsSync(debug) ? readFileSync(debug, 'utf8') : '');
console.log(result.output.split(/\r?\n/).filter(line => /WEAPON_CLASSIFICATION|FAIL:|error:|warning:|TEST TRACE/i.test(line)).join('\n'));
assert.equal(result.code, 0, 'Driver failed; see ' + sandbox);
assert.ok(result.output.includes('WEAPON_CLASSIFICATION PASS'), 'Incomplete regression');
assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line)
    && !/^WARNING: Platform doesn't support eval limit!$/.test(line)), 'Compiler diagnostics; see ' + sandbox);
