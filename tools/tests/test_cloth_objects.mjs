// Real-driver regression in a disposable mudlib; never boots the live game.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { root, original as clothOriginal } from './cloth_inventory.mjs';
import * as clothMetadata from './cloth_canonical.mjs';
import * as bootsMetadata from './boots_inventory.mjs';
import * as headwearMetadata from './headwear_inventory.mjs';
import * as handsMetadata from './hands_inventory.mjs';
import * as neckMetadata from './neck_inventory.mjs';
import * as wristsMetadata from './wrists_inventory.mjs';
import * as foodMetadata from './food_inventory.mjs';
import * as swordMetadata from './sword_inventory.mjs';
import * as liquidMetadata from './liquid_inventory.mjs';
import * as bladeMetadata from './blade_inventory.mjs';
import * as whipMetadata from './whip_inventory.mjs';
import { prepareWhip } from './whip/fixtures.mjs';
import * as staffMetadata from './staff_inventory.mjs';
import { prepareStaff } from './staff/fixtures.mjs';
import * as hammerMetadata from './hammer_inventory.mjs';
import { prepareHammer } from './hammer/fixtures.mjs';
import * as equipMetadata from './equip_inventory.mjs';
import { prepareHands } from './hands/fixtures.mjs';
import { prepareNeck } from './neck/fixtures.mjs';
import { prepareWrists } from './wrists/fixtures.mjs';
import { prepareSword } from './sword/fixtures.mjs';
import { prepareLiquid } from './liquid/fixtures.mjs';
import { prepareBlade } from './blade/fixtures.mjs';
import { prepareEquip } from './equip/fixtures.mjs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { migrateItemRecords } from '../migrate_item_records.mjs';

const boots = process.argv.includes('--boots');
const headwear = process.argv.includes('--headwear');
const hands = process.argv.includes('--hands');
const neck = process.argv.includes('--neck');
const wrists = process.argv.includes('--wrists');
const food = process.argv.includes('--food');
const sword = process.argv.includes('--sword');
const liquid = process.argv.includes('--liquid');
const blade = process.argv.includes('--blade');
const whip = process.argv.includes('--whip');
const staff = process.argv.includes('--staff');
const hammer = process.argv.includes('--hammer');
const equip = process.argv.includes('--equip');
const villageStartup = process.argv.includes('--village-startup');
const cloneCommand = process.argv.includes('--clone-command');
assert.ok(!cloneCommand || !['--whip', '--staff', '--hammer', '--equip', '--blade', '--liquid', '--sword', '--food', '--boots', '--headwear', '--hands', '--neck', '--wrists', '--bench', '--baseline-only', '--village-startup']
    .some(flag => process.argv.includes(flag)), '--clone-command is a separate command regression');
assert.ok(!villageStartup || !['--whip', '--staff', '--hammer', '--equip', '--blade', '--liquid', '--sword', '--food', '--boots', '--headwear', '--hands', '--neck', '--wrists', '--bench', '--baseline-only']
    .some(flag => process.argv.includes(flag)), '--village-startup is a separate startup regression');
const metadata = whip ? whipMetadata : staff ? staffMetadata : hammer ? hammerMetadata : equip ? equipMetadata : blade ? bladeMetadata : liquid ? liquidMetadata : sword ? swordMetadata : food ? foodMetadata : wrists ? wristsMetadata : neck ? neckMetadata : hands ? handsMetadata : headwear ? headwearMetadata : boots ? bootsMetadata : clothMetadata;
const label = whip ? 'WHIP' : staff ? 'STAFF' : hammer ? 'HAMMER' : equip ? 'EQUIP' : blade ? 'BLADE' : liquid ? 'LIQUID' : sword ? 'SWORD' : food ? 'FOOD' : wrists ? 'WRISTS' : neck ? 'NECK' : hands ? 'HANDS' : headwear ? 'HEADWEAR' : boots ? 'BOOTS' : 'CLOTH';
const { canonicalGroups, migrationPaths } = metadata;
const original = whip || staff || hammer || equip || blade || liquid || sword || food || wrists || neck || hands || headwear || boots ? metadata.original : clothOriginal;
const canonicalBaseline = whip || staff || hammer || equip || blade || liquid || sword || food || wrists || neck || hands || headwear || boots ? metadata.readBaseline : clothMetadata.canonicalBaseline;
const driver = resolve(process.argv[2] || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-cloth-'));
console.log('Isolated cloth regression: ' + sandbox);
const copy = file => { mkdirSync(dirname(join(sandbox, file)), { recursive: true }); cpSync(join(root, file), join(sandbox, file)); };
for (const dir of ['include', 'feature', 'inherit', 'mudcore/include', 'mudcore/inherit', 'clone/money'])
    cpSync(join(root, dir), join(sandbox, dir), { recursive: true });
for (const dir of ['tests', 'log', 'data', 'adm/daemons', 'd/items'])
    mkdirSync(join(sandbox, dir), { recursive: true });
for (const file of ['adm/daemons/virtuald.c', 'adm/daemons/moneyd.c', 'adm/daemons/weapond.c', 'd/items/cloth.lpc', 'd/items/cloth_data.h', 'clone/misc/bandage.c', 'clone/misc/cloth.c', 'clone/cloth/qingyi.c', 'cmds/std/wear.c']) copy(file);
for (const file of ['d/items/boots.lpc', 'd/items/boots_data.h']) copy(file);
for (const file of ['d/items/headwear.lpc', 'd/items/headwear_data.h']) copy(file);
for (const file of ['d/items/hands.lpc', 'd/items/hands_data.h']) copy(file);
for (const file of ['d/items/neck.lpc', 'd/items/neck_data.h', 'd/items/wrists.lpc', 'd/items/wrists_data.h']) copy(file);
for (const file of ['d/items/food.lpc', 'd/items/food_data.h']) if (existsSync(join(root, file))) copy(file);
for (const file of ['d/items/sword.lpc', 'd/items/sword_data.h']) copy(file);
for (const file of ['d/items/liquid.lpc', 'd/items/liquid_data.h']) if (existsSync(join(root, file))) copy(file);
for (const file of ['d/items/blade.lpc', 'd/items/blade_data.h']) if (existsSync(join(root, file))) copy(file);
for (const file of ['d/items/equip.lpc', 'd/items/equip_data.h']) if (existsSync(join(root, file))) copy(file);
for (const file of ['d/items/hammer.lpc', 'd/items/hammer_data.h']) if (existsSync(join(root, file))) copy(file);
for (const file of ['d/items/whip.lpc', 'd/items/whip_data.h']) if (existsSync(join(root, file))) copy(file);
for (const file of ['d/items/staff.lpc', 'd/items/staff_data.h']) if (existsSync(join(root, file))) copy(file);
cpSync(join(root, 'tools/tests/cloth'), join(sandbox, 'tests'), { recursive: true });
if (equip) {
    cpSync(join(sandbox, 'tests/regression.lpc'), join(sandbox, 'tests/cloth_regression.lpc'));
    cpSync(join(root, 'tools/tests/equip/regression.lpc'), join(sandbox, 'tests/regression.lpc'));
    const parent = join(sandbox, 'inherit/misc/equip.c');
    if (!process.argv.includes('--bench'))
        writeFileSync(parent, readFileSync(parent, 'utf8').replace('void setup() {',
            'void setup() {\n    master()->record_setup(this_object());'));
    const master = join(sandbox, 'tests/master.lpc');
    writeFileSync(master, readFileSync(master, 'utf8').replaceAll('CLOTH', label) +
        '\nprivate mapping setup_counts = ([]);\nvoid record_setup(object ob) { setup_counts[ob]++; }\nint setup_count(object ob) { return setup_counts[ob]; }\n');
    const bench = join(sandbox, 'tests/benchmark.lpc');
    writeFileSync(bench, readFileSync(bench, 'utf8').replaceAll('CLOTH', label));
    if (!process.argv.includes('--baseline-only') && !process.argv.includes('--bench'))
        prepareEquip(root, sandbox);
}
if (liquid) {
    cpSync(join(sandbox, 'tests/regression.lpc'), join(sandbox, 'tests/cloth_regression.lpc'));
    cpSync(join(root, 'tools/tests/liquid/regression.lpc'), join(sandbox, 'tests/regression.lpc'));
    cpSync(join(root, 'tools/tests/liquid/actor.lpc'), join(sandbox, 'tests/liquid_actor.lpc'));
    cpSync(join(root, 'tools/tests/liquid/poison.lpc'), join(sandbox, 'tests/liquid_poison.lpc'));
    for (const file of ['cmds/std/drink.c', 'cmds/std/fill.c', 'cmds/std/pour.c']) copy(file);
    const parent = join(sandbox, 'inherit/item/item.c');
    if (!process.argv.includes('--bench'))
        writeFileSync(parent, readFileSync(parent, 'utf8').replace('void setup() {',
            'void setup() {\n    master()->record_setup(this_object());'));
    const master = join(sandbox, 'tests/master.lpc');
    writeFileSync(master, readFileSync(master, 'utf8').replaceAll('CLOTH', label) +
        '\nint valid_bind(object binder, object old_owner, object new_owner) { return base_name(binder) == "/cmds/std/pour" && new_owner->is_liquid(); }\n' +
        '\nprivate mapping setup_counts = ([]);\nvoid record_setup(object ob) { setup_counts[ob]++; }\nint setup_count(object ob) { return setup_counts[ob]; }\n');
    const bench = join(sandbox, 'tests/benchmark.lpc');
    writeFileSync(bench, readFileSync(bench, 'utf8').replaceAll('CLOTH', label));
    if (!process.argv.includes('--baseline-only') && !process.argv.includes('--bench'))
        prepareLiquid(root, sandbox, copy);
}
if (sword || blade || hammer || staff || whip) {
    cpSync(join(sandbox, 'tests/regression.lpc'), join(sandbox, 'tests/cloth_regression.lpc'));
    cpSync(join(root, `tools/tests/${whip ? 'whip' : staff ? 'staff' : hammer ? 'hammer' : blade ? 'blade' : 'sword'}/regression.lpc`), join(sandbox, 'tests/regression.lpc'));
    for (const file of ['master.lpc', 'benchmark.lpc']) {
        const target = join(sandbox, 'tests', file);
        writeFileSync(target, readFileSync(target, 'utf8').replaceAll('CLOTH', label));
    }
    (whip ? prepareWhip : staff ? prepareStaff : hammer ? prepareHammer : blade ? prepareBlade : prepareSword)(root, sandbox, copy);
}
if (food) {
    cpSync(join(sandbox, 'tests/regression.lpc'), join(sandbox, 'tests/cloth_regression.lpc'));
    cpSync(join(root, 'tools/tests/food/regression.lpc'), join(sandbox, 'tests/regression.lpc'));
    cpSync(join(root, 'tools/tests/food/actor.lpc'), join(sandbox, 'tests/food_actor.lpc'));
    copy('cmds/std/eat.c');
    copy('d/shaolin/fanting1.c');
    for (const file of ['master.lpc', 'benchmark.lpc']) {
        const target = join(sandbox, 'tests', file);
        writeFileSync(target, readFileSync(target, 'utf8').replaceAll('CLOTH', label));
    }
}
if (cloneCommand) {
    copy('cmds/wiz/clone.c');
    mkdirSync(join(sandbox, 'log/static'), { recursive: true });
    cpSync(join(sandbox, 'tests/clone_command.lpc'), join(sandbox, 'tests/regression.lpc'));
    cpSync(join(sandbox, 'tests/clone_security.lpc'), join(sandbox, 'adm/daemons/securityd.lpc'));
    // Exercise the real path helpers; only security policy and announcements are test doubles.
    const helpers = readFileSync(join(root, 'mudcore/system/kernel/simul_efun/file.c'), 'utf8');
    let extra = '\nint file_exists(string file) { return file_size(file) >= 0; }\n';
    for (const signature of ['string lpc_object_path(', 'mixed lpc_file(']) {
        const start = helpers.indexOf(signature);
        assert.ok(start >= 0, 'Missing actual helper: ' + signature);
        extra += helpers.slice(start, helpers.indexOf('\n}', start) + 2) + '\n';
    }
    extra += readFileSync(join(root, 'mudcore/system/kernel/simul_efun/path.c'), 'utf8');
    extra += '\nstring log_time() { return ctime(time()); }\nvoid message_system(string text) {}\n';
    extra += 'int area_move(object room, object ob, int x, int y) { error("Area movement is outside this fixture.\\n"); }\n';
    const sefun = join(sandbox, 'tests/sefun.lpc');
    writeFileSync(sefun, readFileSync(sefun, 'utf8') + extra);
}
if (villageStartup) {
    for (const file of ['d/village/shop.c', 'd/village/npc/xiejian.c']) copy(file);
    // Execute the current room and NPC constructor unchanged. Only unrelated NPC
    // skill/heartbeat infrastructure is replaced; carry/move/equip use real code.
    const file = join(sandbox, 'd/village/npc/xiejian.c');
    writeFileSync(file, readFileSync(file, 'utf8').replace('inherit NPC;', 'inherit "/tests/village_npc";'));
    cpSync(join(sandbox, 'tests/village_startup.lpc'), join(sandbox, 'tests/regression.lpc'));
}
if (boots || headwear || hands || neck || wrists) {
    cpSync(join(sandbox, 'tests/regression.lpc'), join(sandbox, 'tests/cloth_regression.lpc'));
    cpSync(join(root, `tools/tests/${wrists ? 'wrists' : neck ? 'neck' : hands ? 'hands' : headwear ? 'headwear' : 'boots'}/regression.lpc`), join(sandbox, 'tests/regression.lpc'));
    // Count the selected family's setup only in the disposable copy.
    const parent = join(sandbox, `inherit/armor/${wrists ? 'wrists' : neck ? 'neck' : hands ? 'hands' : headwear ? 'head' : 'boots'}.c`);
    if (!process.argv.includes('--bench'))
        writeFileSync(parent, readFileSync(parent, 'utf8').replace('void setup() {',
            'void setup() {\n    master()->record_setup(this_object());'));
    const master = join(sandbox, 'tests/master.lpc');
    writeFileSync(master, readFileSync(master, 'utf8').replaceAll('CLOTH', label) +
        '\nprivate mapping setup_counts = ([]);\nvoid record_setup(object ob) { setup_counts[ob]++; }\nint setup_count(object ob) { return setup_counts[ob]; }\n');
    const bench = join(sandbox, 'tests/benchmark.lpc');
    writeFileSync(bench, readFileSync(bench, 'utf8').replaceAll('CLOTH', label));
    if (boots) cpSync(join(root, 'tools/tests/boots/business.lpc'), join(sandbox, 'tests/boots_business.lpc'));
    if (headwear && process.argv.includes('--all') && !process.argv.includes('--baseline-only'))
        cpSync(join(root, 'tools/tests/headwear/business.lpc'), join(sandbox, 'tests/headwear_business.lpc'));
    if (hands && process.argv.includes('--all') && !process.argv.includes('--baseline-only'))
        cpSync(join(root, 'tools/tests/hands/business.lpc'), join(sandbox, 'tests/hands_business.lpc'));
    if (neck && process.argv.includes('--all') && !process.argv.includes('--baseline-only'))
        cpSync(join(root, 'tools/tests/neck/business.lpc'), join(sandbox, 'tests/neck_business.lpc'));
    if (wrists && process.argv.includes('--all') && !process.argv.includes('--baseline-only'))
        cpSync(join(root, 'tools/tests/wrists/business.lpc'), join(sandbox, 'tests/wrists_business.lpc'));
    const method = (file, signature) => {
        const source = readFileSync(join(root, file), 'utf8'), start = source.indexOf(signature);
        if (start < 0) throw new Error('Missing business function: ' + file);
        return source.slice(start, source.indexOf('\n}', start) + 2);
    };
    const qianFile = 'd/beijing/npc/qianzhenglun.c';
    mkdirSync(dirname(join(sandbox, qianFile)), { recursive: true });
    writeFileSync(join(sandbox, qianFile), '#include <ansi.h>\ninherit ITEM;\nint total = 2;\nmapping my_count = ([]);\n'
        + 'int issued(string key) { return my_count[key]; }\n' + method(qianFile, 'int do_yao(string arg) {'));
    const daoFile = 'kungfu/class/shaolin/dao-xiang.c';
    mkdirSync(dirname(join(sandbox, daoFile)), { recursive: true });
    writeFileSync(join(sandbox, daoFile), 'inherit ITEM;\n' + method(daoFile, 'string ask_me_1(string name) {'));
    const dizangFile = 'd/death/npc/dizangwang.c';
    mkdirSync(dirname(join(sandbox, dizangFile)), { recursive: true });
    writeFileSync(join(sandbox, dizangFile), 'inherit ITEM;\n'
        + 'void create() { set_max_encumbrance(100000); }\n' + method(dizangFile, 'mixed ask_xue() {'));
    writeFileSync(join(sandbox, 'adm/daemons/rankd.c'), 'string query_respect(object who) { return "这位朋友"; }\n');
    const actorFile = join(sandbox, 'tests/actor.lpc');
    writeFileSync(actorFile, readFileSync(actorFile, 'utf8').replace('void create() {',
        'private object selected_npc;\nprivate string selected_method;\n'
        + 'void select_npc(object npc, string method) { selected_npc = npc; selected_method = method; }\n'
        + 'int call_npc(string arg) { call_other(selected_npc, selected_method, arg); return 1; }\nvoid create() {')
        .replace('enable_commands();', 'enable_commands();\n    add_action("call_npc", "testnpc");'));
    // Old NPC methods still need their historical object, only in this disposable fixture.
    mkdirSync(join(sandbox, 'd/shaolin/obj'), { recursive: true });
    writeFileSync(join(sandbox, 'd/shaolin/obj/huwan.c'), wristsMetadata.original('d/shaolin/obj/huwan.c'));
    mkdirSync(join(sandbox, 'd/city/npc/cloth'), { recursive: true });
    writeFileSync(join(sandbox, 'd/city/npc/cloth/shoes.c'), equipMetadata.original('d/city/npc/cloth/shoes.c'));
    for (const file of ['d/lanzhou/npc/obj/shoes.c', 'd/lanzhou/obj/shoes.c', 'd/village/npc/obj/shoes.c']) copy(file);
    if (headwear) for (const file of headwearMetadata.excluded) copy(file);
    if (hands) prepareHands(root, sandbox, method, copy);
    if (neck) prepareNeck(root, sandbox, copy);
    if (wrists) prepareWrists(root, sandbox, copy);
    for (const [file, extra] of [['unknown', ''], ['unique', 'inherit F_UNIQUE;'], ['noclone', 'inherit F_NOCLONE;']])
        writeFileSync(join(sandbox, 'tests', file + '.c'), '#include <armor.h>\ninherit ' + (wrists ? 'WRISTS' : neck ? 'NECK' : hands ? 'HANDS' : headwear ? 'HEAD' : 'BOOTS') + ';\n' + extra
            + '\nvoid create() { set_name("旧鞋", ({ "test shoes" })); set("unit", "双"); setup(); }\n'
            + 'object create_virtual_object(string key) { return new("/tests/' + file + '"); }\n');
}
cpSync(join(root, 'tools/tests/cloth_migration/cloth_records.lpc'), join(sandbox, 'tests/cloth_records.lpc'));
cpSync(join(sandbox, 'tests/shopd.lpc'), join(sandbox, 'adm/daemons/shopd.lpc'));
cpSync(join(root, 'mudcore/system/kernel/simul_efun/json.c'), join(sandbox, 'tests/json.c'));
const npc = readFileSync(join(root, 'inherit/char/npc.c'), 'utf8');
const carryStart = npc.indexOf('object carry_object(string file) {');
if (carryStart < 0) throw new Error('Cannot locate actual NPC carry_object');
writeFileSync(join(sandbox, 'tests/carry_object.c'), npc.slice(carryStart,
    npc.indexOf('\n}', carryStart) + 2) + '\n');
const objectHelpers = readFileSync(join(root, 'adm/single/simul_efun/object.c'), 'utf8');
const destructStart = objectHelpers.indexOf('void destruct(object ob) {');
if (destructStart < 0) throw new Error('Cannot locate actual destruct sefun');
writeFileSync(join(sandbox, 'tests/destruct.c'), objectHelpers.slice(destructStart,
    objectHelpers.indexOf('\n}', destructStart) + 2) + '\n');
const globals = join(sandbox, 'include/globals.h');
writeFileSync(globals, readFileSync(globals, 'utf8') + '\n#undef SIMUL_EFUN_OB\n#define SIMUL_EFUN_OB "/tests/sefun"\n');
const itemd = readFileSync(join(root, 'adm/daemons/itemd.c'), 'utf8');
const start = itemd.indexOf('void equip_setup(object item) {');
const end = itemd.indexOf('\n}', start) + 2;
if (start < 0 || end < start) throw new Error('Cannot locate actual equip_setup');
writeFileSync(join(sandbox, 'adm/daemons/itemd.c'), itemd.slice(start, end) + '\n');
const shopd = readFileSync(join(root, 'adm/daemons/shopd.c'), 'utf8');
let transactions = '#include <ansi.h>\n#include <config.h>\nprivate int player_pay(object who, object target, int amount);\nprivate void destruct_it(object ob);\n';
for (const signature of ['public string do_stock(', 'public string do_unstock(', 'public int do_buy(', 'private int player_pay(object who, object target, int amount) {', 'private void destruct_it(object ob) {']) {
    const begin = shopd.lastIndexOf(signature);
    if (begin < 0) throw new Error('Missing actual shop method: ' + signature);
    transactions += shopd.slice(begin, shopd.indexOf('\n}', begin) + 2) + '\n';
}
writeFileSync(join(sandbox, 'tests/shop_transactions.c'), transactions);
const sample = new Set(['baituo_obj_baipao', 'baituo_obj_qingpao', 'baituo_obj_shepi', 'city_npc_obj_junfu', 'shaolin_obj_beixin', 'beijing_npc_obj_cloth', 'changan_npc_obj_linen']);
const rows = villageStartup || cloneCommand ? [] : canonicalBaseline().varieties.filter(row => process.argv.includes('--all') || process.argv.includes('--bench') ||
    (whip || staff || hammer || equip || blade || liquid || sword || food || wrists ? true : neck ? ['jinxianglian', 'jinxianglian2', 'shaolin_weibo', 'yupei'].includes(row.id) :
        hands ? ['jinjie', 'jinjie2', 'shaolin_shoutao', 'jinsi_shoutao'].includes(row.id) :
        headwear ? ['gangkui', 'chahua1', 'hei_mudan', 'shaolin_toukui'].includes(row.id) :
        boots ? ['beijing_npc_obj_feet', 'city_npc_obj_caoxie', 'city_npc_obj_flower_shoe'].includes(row.key) : sample.has(row.key)));
for (const row of rows) {
    const path = row.old_path.slice(1) + '.c';
    const source = row.source ?? original(path);
    if (createHash('sha256').update(source).digest('hex') !== row.source_hash)
        throw new Error('Historical baseline changed: ' + path);
    mkdirSync(dirname(join(sandbox, path)), { recursive: true });
    writeFileSync(join(sandbox, path), source);
}
writeFileSync(join(sandbox, 'tests/cases.json'), JSON.stringify(rows.map(row => whip || staff || hammer || equip || blade || liquid || sword || food || headwear || hands || neck || wrists
    ? [row.old_path, row.new_path, Number(row.weight), row.weight_scope === 'blueprint' ? 0 : Number(row.weight),
        ...(equip || liquid ? [Number(!!row.setup)] : [])]
    : [row.old_path, row.new_path])));
if (process.argv.includes('--baseline-only')) writeFileSync(join(sandbox, 'tests/baseline-only'), '1');
writeFileSync(join(sandbox, 'tests/migration_paths.json'), JSON.stringify(migrationPaths()));
writeFileSync(join(sandbox, 'tests/canonical.json'), JSON.stringify(canonicalGroups().filter(g => !(headwear || hands || neck || wrists) || rows.some(r => r.new_path === g.path)).map(g => ({
    path: g.path, ids: g.ids, historical: g.rows.map(r => r.new_path),
}))));
const socket = createServer();
await new Promise(done => socket.listen(0, '127.0.0.1', done));
const port = socket.address().port;
await new Promise(done => socket.close(done));
writeFileSync(join(sandbox, 'driver.cfg'), [
    'name : Cloth Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'),
    'log directory : /log', 'debug log file : debug.log',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>',
    'master file : /tests/master', 'simulated efun file : /tests/sefun',
    'gametick msec : 100',
].join('\n') + '\n');
const runDriver = () => new Promise((done, reject) => {
    const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
    let output = '';
    const timer = setTimeout(() => child.kill(), 60000);
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); done({ code, output }); });
});
if (process.argv.includes('--bench')) {
    const measurements = [];
    for (let round = 1; round <= 3; round++) {
        for (const version of round % 2 ? [0, 1] : [1, 0]) {
            writeFileSync(join(sandbox, 'tests/benchmark.json'), JSON.stringify({ version, round }));
            const result = await runDriver();
            writeFileSync(join(sandbox, `benchmark-${round}-${version}.txt`), result.output);
            const line = result.output.split('\n').find(line => line.startsWith(label + ' BENCH '));
            if (result.code !== 0 || !line) throw new Error('Benchmark failed: ' + sandbox);
            const measurement = JSON.parse(line.slice((label + ' BENCH ').length));
            measurements.push(measurement);
            console.log(JSON.stringify(measurement));
        }
    }
    writeFileSync(join(sandbox, 'benchmark.json'), JSON.stringify(measurements, null, 2) + '\n');
    console.log(label + ' BENCH PASS: old/new are independent driver processes; memory_info is not OS RSS');
    process.exit(0);
}
const result = await runDriver();
writeFileSync(join(sandbox, 'driver-output.txt'), result.output);
console.log(result.output.split('\n').filter(line => /WHIP|STAFF|HAMMER|EQUIP|BLADE|LIQUID|SWORD|FOOD|WRISTS|NECK|HANDS|HEADWEAR|BOOTS|CLOTH|FAIL:|error:|Error|Undefined|syntax/.test(line)).join('\n'));
if (result.code !== 0 || !result.output.includes(label + ' PASS'))
    throw new Error('Driver regression failed; see ' + join(sandbox, 'driver-output.txt'));
if (whip || staff || hammer || equip || blade || liquid || sword || food || boots || headwear || hands || neck || wrists || villageStartup || cloneCommand) process.exit(0);
const manifest = { files: [
    { file: 'backpack.o', kind: 'backpack' }, { file: 'shop.o', kind: 'shop' },
    { file: 'dbased.o', kind: 'legacy_bags', bag_objects: ['/test/legacy_bag'] },
    { file: 'mixed-shop.o', kind: 'shop' }, { file: 'mixed-backpack.o', kind: 'backpack' },
] };
const manifestPath = join(sandbox, 'data/migration/manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest));
const preview = await migrateItemRecords(manifestPath, driver);
assert.equal(preview.mode, 'preview');
assert.deepEqual(preview.files.map(file => file.changes), [1, 2, 1, 4, 2]);
const output = join(sandbox, 'conversion');
const migrated = await migrateItemRecords(manifestPath, driver, output);
assert.deepEqual(migrated.files, preview.files);
for (const entry of manifest.files) {
    const original = readFileSync(join(sandbox, 'data/migration', entry.file));
    assert.deepEqual(readFileSync(join(output, 'backup', entry.file)), original);
    assert.equal(createHash('sha256').update(original).digest('hex'),
        migrated.files.find(file => file.file === entry.file).before_sha256);
}
// A second conversion is a no-op; restoring backup/ is a byte-exact rollback.
writeFileSync(join(output, 'converted/manifest.json'), JSON.stringify(manifest));
const again = await migrateItemRecords(join(output, 'converted/manifest.json'), driver);
assert.deepEqual(again.files.map(file => file.changes), [0, 0, 0, 0, 0]);
assert.ok(again.files.every(file => file.before_sha256 === file.after_sha256));
await assert.rejects(migrateItemRecords(manifestPath, driver, output), /new directory/);
const conflictPath = join(sandbox, 'data/migration/conflict-manifest.json');
writeFileSync(conflictPath, JSON.stringify({ files: [...manifest.files, { file: 'conflict-shop.o', kind: 'shop' }] }));
const conflictBytes = readFileSync(join(sandbox, 'data/migration/conflict-shop.o'));
await assert.rejects(migrateItemRecords(conflictPath, driver, join(sandbox, 'conflict-output')),
    /Shop price conflict: conflict-shop\.o/);
assert.equal(existsSync(join(sandbox, 'conflict-output')), false, 'Failed batch publishes no output');
assert.deepEqual(readFileSync(join(sandbox, 'data/migration/conflict-shop.o')), conflictBytes);
console.log('CLOTH MIGRATION WRAPPER PASS: both legacy identities, merged stock, price conflict, preview, backup, conversion, idempotence, rollback bytes, no overwrite');
