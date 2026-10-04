// Real-driver regression in a disposable mudlib; never boots the live game.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { root, original } from './cloth_inventory.mjs';
import { canonicalBaseline, canonicalGroups, migrationPaths } from './cloth_canonical.mjs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { migrateClothRecords } from '../migrate_cloth_records.mjs';

const driver = resolve(process.argv[2] || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-cloth-'));
console.log('Isolated cloth regression: ' + sandbox);
const copy = file => { mkdirSync(dirname(join(sandbox, file)), { recursive: true }); cpSync(join(root, file), join(sandbox, file)); };
for (const dir of ['include', 'feature', 'inherit', 'mudcore/include', 'mudcore/inherit', 'clone/money'])
    cpSync(join(root, dir), join(sandbox, dir), { recursive: true });
for (const dir of ['tests', 'log', 'data', 'adm/daemons', 'd/items'])
    mkdirSync(join(sandbox, dir), { recursive: true });
for (const file of ['adm/daemons/virtuald.c', 'adm/daemons/moneyd.c', 'd/items/cloth.lpc', 'd/items/cloth_data.h', 'clone/misc/bandage.c', 'clone/misc/cloth.c', 'clone/cloth/qingyi.c', 'cmds/std/wear.c']) copy(file);
cpSync(join(root, 'tools/tests/cloth'), join(sandbox, 'tests'), { recursive: true });
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
const rows = canonicalBaseline().varieties.filter(row => process.argv.includes('--all') || process.argv.includes('--bench') || sample.has(row.key));
for (const row of rows) {
    const path = row.old_path.slice(1) + '.c';
    const source = original(path);
    if (createHash('sha256').update(source).digest('hex') !== row.source_hash)
        throw new Error('Historical baseline changed: ' + path);
    mkdirSync(dirname(join(sandbox, path)), { recursive: true });
    writeFileSync(join(sandbox, path), source);
}
writeFileSync(join(sandbox, 'tests/cases.json'), JSON.stringify(rows.map(row => [row.old_path, row.new_path])));
writeFileSync(join(sandbox, 'tests/migration_paths.json'), JSON.stringify(migrationPaths()));
writeFileSync(join(sandbox, 'tests/canonical.json'), JSON.stringify(canonicalGroups().map(g => ({
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
            const line = result.output.split('\n').find(line => line.startsWith('CLOTH BENCH '));
            if (result.code !== 0 || !line) throw new Error('Benchmark failed: ' + sandbox);
            const measurement = JSON.parse(line.slice('CLOTH BENCH '.length));
            measurements.push(measurement);
            console.log(JSON.stringify(measurement));
        }
    }
    writeFileSync(join(sandbox, 'benchmark.json'), JSON.stringify(measurements, null, 2) + '\n');
    console.log('CLOTH BENCH PASS: old/new are independent driver processes; memory_info is not OS RSS');
    process.exit(0);
}
const result = await runDriver();
writeFileSync(join(sandbox, 'driver-output.txt'), result.output);
console.log(result.output.split('\n').filter(line => /CLOTH|FAIL:|error:|Error|Undefined|syntax/.test(line)).join('\n'));
if (result.code !== 0 || !result.output.includes('CLOTH PASS'))
    throw new Error('Driver regression failed; see ' + join(sandbox, 'driver-output.txt'));
const manifest = { files: [
    { file: 'backpack.o', kind: 'backpack' }, { file: 'shop.o', kind: 'shop' },
    { file: 'dbased.o', kind: 'legacy_bags', bag_objects: ['/test/legacy_bag'] },
    { file: 'mixed-shop.o', kind: 'shop' }, { file: 'mixed-backpack.o', kind: 'backpack' },
] };
const manifestPath = join(sandbox, 'data/migration/manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest));
const preview = await migrateClothRecords(manifestPath, driver);
assert.equal(preview.mode, 'preview');
assert.deepEqual(preview.files.map(file => file.changes), [1, 2, 1, 4, 2]);
const output = join(sandbox, 'conversion');
const migrated = await migrateClothRecords(manifestPath, driver, output);
assert.deepEqual(migrated.files, preview.files);
for (const entry of manifest.files) {
    const original = readFileSync(join(sandbox, 'data/migration', entry.file));
    assert.deepEqual(readFileSync(join(output, 'backup', entry.file)), original);
    assert.equal(createHash('sha256').update(original).digest('hex'),
        migrated.files.find(file => file.file === entry.file).before_sha256);
}
// A second conversion is a no-op; restoring backup/ is a byte-exact rollback.
writeFileSync(join(output, 'converted/manifest.json'), JSON.stringify(manifest));
const again = await migrateClothRecords(join(output, 'converted/manifest.json'), driver);
assert.deepEqual(again.files.map(file => file.changes), [0, 0, 0, 0, 0]);
assert.ok(again.files.every(file => file.before_sha256 === file.after_sha256));
await assert.rejects(migrateClothRecords(manifestPath, driver, output), /new directory/);
const conflictPath = join(sandbox, 'data/migration/conflict-manifest.json');
writeFileSync(conflictPath, JSON.stringify({ files: [...manifest.files, { file: 'conflict-shop.o', kind: 'shop' }] }));
const conflictBytes = readFileSync(join(sandbox, 'data/migration/conflict-shop.o'));
await assert.rejects(migrateClothRecords(conflictPath, driver, join(sandbox, 'conflict-output')),
    /Shop price conflict: conflict-shop\.o/);
assert.equal(existsSync(join(sandbox, 'conflict-output')), false, 'Failed batch publishes no output');
assert.deepEqual(readFileSync(join(sandbox, 'data/migration/conflict-shop.o')), conflictBytes);
console.log('CLOTH MIGRATION WRAPPER PASS: both legacy identities, merged stock, price conflict, preview, backup, conversion, idempotence, rollback bytes, no overwrite');
