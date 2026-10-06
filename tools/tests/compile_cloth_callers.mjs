// Compile all changed game programs without booting the game or running create().
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { root, readBaseline, tracked } from './cloth_inventory.mjs';
import { supplementalCallers } from './cloth_canonical.mjs';
import { readBaseline as bootsBaseline, dynamicCallers } from './boots_inventory.mjs';
import { readBaseline as headwearBaseline, dynamicCallers as headwearDynamicCallers } from './headwear_inventory.mjs';
import { readBaseline as handsBaseline, dynamicCallers as handsDynamicCallers } from './hands_inventory.mjs';
import { readBaseline as neckBaseline, dynamicCallers as neckDynamicCallers } from './neck_inventory.mjs';

import { readBaseline as wristsBaseline, dynamicCallers as wristsDynamicCallers, excluded as wristsExcluded } from './wrists_inventory.mjs';
import { readBaseline as foodBaseline } from './food_inventory.mjs';
import { readBaseline as swordBaseline } from './sword_inventory.mjs';
import { readBaseline as liquidBaseline } from './liquid_inventory.mjs';
import { readBaseline as bladeBaseline } from './blade_inventory.mjs';
import { readBaseline as equipBaseline } from './equip_inventory.mjs';

import { readBaseline as hammerBaseline } from './hammer_inventory.mjs';

const compiler = resolve(process.argv[2] || join(root, 'bin/lpcc.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-cloth-compile-'));
console.log('Compile-only cloth migration: ' + sandbox);
const core = execFileSync('git', ['-C', join(root, 'mudcore'), 'ls-files', '-z'], { encoding: 'utf8' })
    .split('\0').filter(Boolean).map(path => 'mudcore/' + path);
const sources = [...tracked(), ...core, 'd/items/cloth.lpc', 'd/items/cloth_data.h', 'd/items/boots.lpc', 'd/items/boots_data.h',
    'd/items/headwear.lpc', 'd/items/headwear_data.h', 'd/items/hands.lpc', 'd/items/hands_data.h',
    'd/items/neck.lpc', 'd/items/neck_data.h', 'd/items/wrists.lpc', 'd/items/wrists_data.h',
    'd/items/food.lpc', 'd/items/food_data.h', 'd/items/sword.lpc', 'd/items/sword_data.h', 'd/items/liquid.lpc', 'd/items/liquid_data.h',
    'd/items/blade.lpc', 'd/items/blade_data.h', 'd/items/equip.lpc', 'd/items/equip_data.h', 'd/items/hammer.lpc', 'd/items/hammer_data.h']
    .filter(path => /\.(c|lpc|h)$/.test(path) && !/^(fluffos|tools|data|ai)\//.test(path));
for (const file of new Set(sources)) {
    if (!existsSync(join(root, file))) continue;
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    cpSync(join(root, file), join(sandbox, file));
}
for (const dir of ['tests', 'log', 'data']) mkdirSync(join(sandbox, dir), { recursive: true });
// Only the method name changes in this compile-only copy; its body is compiled.
// Actual constructors/lifecycles are tested separately by test_cloth_objects.mjs.
const globals = join(sandbox, 'include/globals.h');
writeFileSync(globals, readFileSync(globals, 'utf8') + '\n#define create cloth_compile_only_create\n');
writeFileSync(join(sandbox, 'tests/master.lpc'), [
    'string get_root_uid() { return "Root"; }', 'string get_bb_uid() { return "Backbone"; }',
    'string creator_file(string file) { return "Root"; }',
    'int valid_read(string file, mixed user, string func) { return 1; }',
    'int valid_write(string file, mixed user, string func) { return 0; }',
    'int valid_seteuid(object ob, string uid) { return 1; }',
    'int valid_override(string file, string name, string main_file) { return 1; }',
    'int valid_socket(object ob, string func, mixed *info) { return 0; }',
    'void log_error(string file, string text) { debug_message(text); }',
    'void error_handler(mapping details, int caught) { debug_message(details["error"]); }',
    'string *epilog(int flag) { return ({}); }',
].join('\n') + '\n');
const socket = createServer();
await new Promise(done => socket.listen(0, '127.0.0.1', done));
const port = socket.address().port;
await new Promise(done => socket.close(done));
writeFileSync(join(sandbox, 'driver.cfg'), [
    'name : Cloth Compile Check', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log',
    'debug log file : debug.log', 'master file : /tests/master',
    'simulated efun file : /adm/single/simul_efun',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>',
].join('\n') + '\n');
const boots = process.argv.includes('--boots');
const headwear = process.argv.includes('--headwear');
const hands = process.argv.includes('--hands');
const neck = process.argv.includes('--neck');
const wrists = process.argv.includes('--wrists');
const food = process.argv.includes('--food');
const sword = process.argv.includes('--sword');
const liquid = process.argv.includes('--liquid');
const blade = process.argv.includes('--blade');
const hammer = process.argv.includes('--hammer');
const equip = process.argv.includes('--equip');
const files = hammer ? [...new Set([...Object.keys(hammerBaseline().callers), ...hammerBaseline().dynamic.map(h => h.file),
    ...hammerBaseline().excluded.map(e => e.file), 'feature/user_storage.c',
    ...['cloth', 'boots', 'headwear', 'hands', 'neck', 'wrists', 'food', 'sword', 'liquid', 'blade', 'equip', 'hammer'].map(f => `d/items/${f}.lpc`)])] : equip ? [...new Set([...Object.keys(equipBaseline().callers), 'feature/user_storage.c',
    ...['cloth', 'boots', 'headwear', 'hands', 'neck', 'wrists', 'food', 'sword', 'liquid', 'blade', 'equip'].map(f => `d/items/${f}.lpc`)])] : blade ? [...new Set([...Object.keys(bladeBaseline().callers), ...bladeBaseline().dynamic.map(h => h.file),
    ...bladeBaseline().excluded.map(e => e.file), 'feature/user_storage.c',
    ...['cloth', 'boots', 'headwear', 'hands', 'neck', 'wrists', 'food', 'sword', 'liquid', 'blade'].map(f => `d/items/${f}.lpc`)])] : liquid ? [...new Set([...Object.keys(liquidBaseline().callers), ...liquidBaseline().dynamic.map(h => h.file),
    ...liquidBaseline().excluded.map(e => e.file), 'feature/user_storage.c',
    ...['cloth', 'boots', 'headwear', 'hands', 'neck', 'wrists', 'food', 'sword', 'liquid'].map(f => `d/items/${f}.lpc`)])] : sword ? [...new Set([...Object.keys(swordBaseline().callers), ...swordBaseline().dynamic.map(h => h.file),
    ...swordBaseline().excluded.map(e => e.file), 'feature/user_storage.c', 'd/items/sword.lpc',
    ...['cloth', 'boots', 'headwear', 'hands', 'neck', 'wrists', 'food'].map(f => `d/items/${f}.lpc`)])] : food ? [...new Set([...Object.keys(foodBaseline().callers), ...foodBaseline().dynamic.map(h => h.file),
    ...foodBaseline().excluded.map(e => e.file), 'feature/user_storage.c', 'd/items/food.lpc',
    ...['cloth', 'boots', 'headwear', 'hands', 'neck', 'wrists'].map(f => `d/items/${f}.lpc`)])] : wrists ? [...new Set([...wristsBaseline().hits.map(hit => hit.file), ...wristsDynamicCallers,
    ...wristsExcluded, 'feature/user_storage.c', 'd/items/wrists.lpc', 'd/items/neck.lpc',
    'd/items/hands.lpc', 'd/items/headwear.lpc', 'd/items/boots.lpc', 'd/items/cloth.lpc'])] : neck ? [...new Set([...neckBaseline().hits.map(hit => hit.file), ...neckDynamicCallers,
    'd/changan/npc/xiangxiang.c', 'feature/user_storage.c', 'd/items/neck.lpc', 'd/items/hands.lpc',
    'd/items/headwear.lpc', 'd/items/boots.lpc', 'd/items/cloth.lpc'])] : hands ? [...new Set([...handsBaseline().hits.map(hit => hit.file), ...handsDynamicCallers,
    'd/xiyu/houdong.c', 'feature/user_storage.c', 'd/items/hands.lpc', 'd/items/headwear.lpc', 'd/items/boots.lpc', 'd/items/cloth.lpc'])] :
    headwear ? [...new Set([...headwearBaseline().hits.map(hit => hit.file), ...headwearDynamicCallers,
    'feature/user_storage.c', 'd/items/headwear.lpc', 'd/items/boots.lpc', 'd/items/cloth.lpc'])] :
    boots ? [...new Set([...bootsBaseline().hits.map(hit => hit.file), ...dynamicCallers,
    'feature/user_storage.c', 'd/items/boots.lpc', 'd/items/cloth.lpc'])] : [...new Set([...readBaseline().hits.map(hit => hit.file),
    ...supplementalCallers, 'd/village/shop.c',
    'd/xiangyang/npc/wuxiuwen.c', 'kungfu/class/shaolin/dao-xiang.c',
    'feature/user_storage.c', 'd/items/cloth.lpc'])].filter(path => /\.(c|lpc)$/.test(path));
const result = await new Promise((done, reject) => {
    const child = spawn(compiler, ['--batch', 'driver.cfg'], { cwd: sandbox, windowsHide: true });
    let output = '';
    const timer = setTimeout(() => child.kill(), 300000);
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); done({ code, output }); });
    child.stdin.on('error', () => {});
    child.stdin.end(files.map(file => '/' + file).join('\n') + '\n');
});
writeFileSync(join(sandbox, 'compiler-output.txt'), result.output);
const passed = result.output.split('\n').filter(line => line.startsWith('PASS /')).length;
console.log(result.output.split('\n').filter(line => /error:|^FAIL |Fail to load/.test(line)).join('\n'));
console.log(`${hammer ? 'HAMMER' : equip ? 'EQUIP' : blade ? 'BLADE' : liquid ? 'LIQUID' : sword ? 'SWORD' : food ? 'FOOD' : wrists ? 'WRISTS' : neck ? 'NECK' : hands ? 'HANDS' : headwear ? 'HEADWEAR' : boots ? 'BOOTS' : 'CLOTH'} COMPILE: ${passed}/${files.length} programs; create bodies compiled but not executed`);
if (result.code !== 0 || passed !== files.length) throw new Error('Compile failed; see ' + sandbox);
