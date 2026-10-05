// Runs actual commands in a disposable MUDLIB. Never connects to the live game.
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const driver = resolve(process.argv[2] || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-commands-'));
const put = (path, text) => {
    mkdirSync(dirname(join(sandbox, path)), { recursive: true });
    writeFileSync(join(sandbox, path), text, 'utf8');
};
const copy = (source, target = source) => {
    mkdirSync(dirname(join(sandbox, target)), { recursive: true });
    cpSync(join(root, source), join(sandbox, target), { recursive: true });
};
console.log('Isolated command regression: ' + sandbox);
for (const directory of ['include', 'mudcore/include', 'cmds']) copy(directory);
copy('tools/tests/command_compatibility', 'tests');
copy('adm/daemons/virtuald.c');
copy('mudcore/system/kernel/simul_efun/file.c', 'tests/file.h');
copy('mudcore/system/kernel/simul_efun/path.c', 'tests/path.h');
// The LIB overrides only user_cwd; retain the actual core resolver unchanged.
const corePath = readFileSync(join(sandbox, 'tests/path.h'), 'utf8');
const libPath = readFileSync(join(root, 'adm/single/simul_efun/path.c'), 'utf8');
const cwdBody = libPath.slice(libPath.indexOf('string user_cwd('), libPath.indexOf('\n}') + 2);
put('tests/path.h', corePath.replace(/string user_cwd\(string name\) \{[^}]+\}/, cwdBody));
const globals = readFileSync(join(sandbox, 'include/globals.h'), 'utf8');
put('include/globals.h', globals + '\n' + [
    '#undef F_CLEAN_UP', '#define F_CLEAN_UP "/tests/cleanup"',
    '#undef SECURITY_D', '#define SECURITY_D "/tests/security"',
    '#undef VOID_OB', '#define VOID_OB "/tests/void"',
    '#undef TEMP_OB', '#define TEMP_OB "/tests/temp"',
    '#undef ROOM', '#define ROOM "/tests/object"',
    '#undef NPC', '#define NPC "/tests/object"',
    '#undef F_DBASE', '#define F_DBASE "/tests/object"',
].join('\n') + '\n');
put('tests/cleanup.lpc', 'void create() {}\n');
put('tests/void.lpc', 'inherit "/tests/object";\n');
put('tests/temp.lpc', 'inherit "/tests/object";\n');
put('cases/old.c', 'inherit "/tests/object";\n');
put('cases/modern.lpc', 'inherit "/tests/object";\n');
put('cases/failing.lpc', 'void create() { error("fixture constructor failure\\n"); }\n');
put('adm/daemons/network/messaged.lpc', 'object find_user(string name) { return 0; }\n');
put('d/wizard/hall.lpc', 'inherit "/tests/object";\n');
put('u/Root/workroom.lpc', 'inherit "/tests/object";\n');
put('clone/medicine/.keep', '');
put('clone/herb/.keep', '');
put('log/.keep', '');
put('log/static/.keep', '');
put('adm/daemons/masterd.lpc', 'string *query_valid_types() { return ({ "force" }); }\n');
put('adm/daemons/chinesed.lpc', 'string chinese(string value) { return value; }\nstring find_skill(string value) { return value == "新功" ? "modernforce" : 0; }\n');
for (const [name, extension] of [['modernforce', 'lpc'], ['oldforce', 'c'], ['fusion', 'lpc'], ['sub', 'lpc']]) {
    put(`kungfu/skill/${name}.${extension}`, 'inherit "/tests/skill_fixture";\n');
}
for (const name of ['fusion_old', 'sub_old']) put(`kungfu/skill/${name}.c`, 'inherit "/tests/skill_fixture";\n');
for (const [name, extension] of [['alpha', 'c'], ['beta', 'lpc'], ['both', 'c'], ['both', 'lpc'], ['ignored', 'h']]) {
    for (const dir of ['perform', 'exert']) put(`kungfu/skill/modernforce/${dir}/${name}.${extension}`, 'int marker() { return 1; }\n');
}
for (const extension of ['c', 'lpc']) {
    put(`kungfu/special/fixture_${extension}.${extension}`, 'int perform(object me, string skill, string arg) { me->set("performed", skill); return 1; }\n');
    put(`cmds/std/team/fixture_${extension}.${extension}`, 'int main(object me, string arg) { me->set("team_result", arg); return 1; }\n');
    put(`cmds/std/vote/fixture_${extension}.${extension}`, 'int vote(object me, object victim) { me->set("vote_result", victim); return 1; }\n');
}
// Exercise the actual version stamping function, without starting the network daemon.
const versionSource = readFileSync(join(root, 'adm/daemons/versiond.c'), 'utf8');
const utilSource = readFileSync(join(root, 'adm/single/simul_efun/util.c'), 'utf8');
const functionSource = (source, signature) => {
    const start = source.indexOf(signature);
    assert.ok(start >= 0, signature);
    return source.slice(start, source.indexOf('\n}', start) + 2) + '\n';
};
put('adm/daemons/versiond.lpc', functionSource(utilSource, 'string file_crypt(') +
    functionSource(utilSource, 'int file_valid(') + functionSource(versionSource, 'int append_sn(string file) {'));
for (const [name, extension] of [['old', 'c'], ['modern', 'lpc'], ['both', 'lpc'], ['nested/item', 'lpc']])
    put(`batch/${name}.${extension}`, 'inherit "/tests/object";\n');
put('batch/both.c', 'void create() { error("wrong duplicate loaded\\n"); }\n');
put('batch/failing.lpc', 'void create() { error("expected load failure\\n"); }\n');
put('batch/ignored.h', '#define NOT_A_PROGRAM 1\n');
for (const directory of ['batch/tests/deep', 'batch/.hidden/deep', 'batch/event', 'batch/simul_efun',
    'data/fixture', 'ai/fixture', 'fluffos/fixture', 'u/fixture', 'tools/fixture', 'openspec/fixture', 'docs/fixture'])
    put(`${directory}/blocked.lpc`, 'void create() { write_file("/blocked_marker", "executed"); }\n');
for (const extension of ['c', 'lpc', 'h', 'txt']) put(`stamp/file.${extension}`, '// fixture\n');
put('stamp/child/nested.lpc', '// nested fixture\n');
put('catalog/room.lpc', 'inherit ROOM;\nvoid create() { ::create(); set("short", "测试房间"); set("objects", (["/tests/provider/room_item": 1, "/cases/modern": 1])); }\n');
put('catalog/npc.lpc', 'inherit NPC;\nvoid create() { object item; ::create(); if (!clonep()) return; item = new("/tests/provider/equipment"); item->move(this_object()); set("vendor_goods", (["/tests/provider/sold": 1])); }\n');
put('catalog/no_vendor.c', 'inherit NPC;\nvoid create() { object item; ::create(); if (!clonep()) return; item = new("/tests/provider/equipment"); item->move(this_object()); }\n');
put('catalog/bad_vendor.lpc', 'inherit NPC;\nvoid create() { object item; ::create(); if (!clonep()) return; item = new("/tests/provider/equipment"); item->move(this_object()); set("vendor_goods", (["/tests/provider/bad": 1])); }\n');
put('catalog/item.c', 'inherit "/tests/object";\n');
put('catalog/item.lpc', 'inherit "/tests/object";\n');
put('catalog/provider.lpc', 'inherit "/tests/provider";\nvoid create() { if (clonep()) error("provider must not be cloned\\n"); }\n');
put('catalog/failure.lpc', 'inherit "/tests/object";\nstring query(string key) { error("expected record failure\\n"); }\n');
put('catalog/constructor.lpc', 'inherit NPC;\nvoid create() { ::create(); if (clonep()) error("expected constructor failure\\n"); }\n');
const listener = createServer();
await new Promise((ready, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', ready); });
const port = listener.address().port;
await new Promise(done => listener.close(done));
put('driver.cfg', [
    'name : Command Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'),
    'log directory : /log', 'debug log file : debug.log',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>',
    'master file : /tests/master', 'simulated efun file : /tests/sefun',
    'maximum evaluation cost : 100000000', 'gametick msec : 100',
].join('\n') + '\n');
const result = await new Promise((done, reject) => {
    const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
    let output = '';
    const timer = setTimeout(() => child.kill(), 60000);
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => { clearTimeout(timer); done({ code, output }); });
});
put('driver-output.txt', result.output);
console.log(result.output.split('\n').filter(line => /COMMAND|FAIL:|error:|Error|Undefined|syntax/.test(line)).join('\n'));
assert.equal(result.code, 0, 'Driver failed: ' + join(sandbox, 'driver-output.txt'));
assert.ok(result.output.includes('COMMAND PASS'), 'Missing test completion: ' + sandbox);
