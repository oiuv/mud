// Only synthetic backups in an OS temporary directory. No live records or game service.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs, { mkdirSync, mkdtempSync, writeFileSync, readFileSync, existsSync, symlinkSync, unlinkSync } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { discoverBackup, writeBackupManifest, migrateBackupRecords, migrateItemRecords } from '../migrate_item_records.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const driver = join(root, 'bin/driver.exe');
const sandbox = mkdtempSync(join(tmpdir(), 'mud-record-tests-'));
const backup = join(sandbox, 'backup');
for (const path of ['user/a', 'user/z/nested', 'shop', 'private']) mkdirSync(join(backup, path), { recursive: true });
// Fixture serialization only, NOT a second migration/parser implementation.
const lpc = value => typeof value === 'string' ? JSON.stringify(value)
    : typeof value === 'number' ? String(value)
    : '([' + Object.entries(value).map(([key, item]) => `${lpc(key)}:${lpc(item)},`).join('') + '])';
const oldBoot = '/d/city/npc/obj/caoxie', oldBoot2 = '/d/jingzhou/obj/caoxie';
const boot = '/d/items/boots/caoxie', oldCloth = '/d/changan/npc/obj/cloth', cloth = '/d/items/cloth/buyi';
const records = {
    item0: { file: oldBoot, amount: 2, id: 'sandals', name: '草鞋' },
    item1: { file: oldCloth, amount: 3, id: 'cloth', name: '布衣' },
    item2: { file: boot, amount: 1, id: 'sandals', name: '旧草鞋' },
};
const shop = { vendor_goods: { [oldBoot]: 100, [oldBoot2]: 100, [boot]: 100, [oldCloth]: 200, [cloth]: 200 },
    vendor_goods_num: { [oldBoot]: 2, [oldBoot2]: 3, [boot]: 4, [oldCloth]: 5, [cloth]: 6 },
    all_vendor_goods: 20, balance: 999, long: '不要替换玩家文本 ' + oldBoot };
writeFileSync(join(backup, 'user/a/tester.o'), '# synthetic\r\nmy_depot ' + lpc(records) + '\r\ndbase ' + lpc({ note: oldBoot }) + '\r\n');
writeFileSync(join(backup, 'shop/test_shop.o'), 'dbase ' + lpc(shop) + '\n');
writeFileSync(join(backup, 'user/z/nested/empty.o'), 'dbase (["name":"临时角色",])\n');
writeFileSync(join(backup, 'private/unrelated.o'), 'not a save file');
writeFileSync(join(backup, 'dbased.o'), 'not automatically selected');
writeFileSync(join(backup, 'user/ignored.txt'), 'not a save file');
const selected = ['shop/test_shop.o', 'user/a/tester.o', 'user/z/nested/empty.o'];
const original = new Map(selected.map(file => [file, readFileSync(join(backup, file))]));
let output;
console.log('Synthetic record tests: ' + sandbox);

test('deterministic discovery, relative paths and only user/shop', () => {
    const found = discoverBackup(backup);
    assert.deepEqual(found.manifest.files.map(f => f.file), selected);
    assert.deepEqual(found.manifest.files.map(f => f.kind), ['shop', 'backpack', 'backpack']);
    assert.deepEqual(discoverBackup(backup), found);
});
test('manifest-only does not read record bodies or start the driver; no overwrite', () => {
    const saved = fs.readFileSync;
    fs.readFileSync = () => { throw new Error('record body must not be read'); };
    syncBuiltinESMExports();
    try {
        const result = writeBackupManifest(backup, join(backup, 'manifest.json'));
        assert.equal(result.status, 'paths_only'); assert.equal(result.checked_files, 0);
        assert.equal(result.discovered_files, 3);
    } finally { fs.readFileSync = saved; syncBuiltinESMExports(); }
    assert.throws(() => writeBackupManifest(backup, join(backup, 'manifest.json')), /EEXIST/);
    assert.throws(() => writeBackupManifest(backup, join(sandbox, 'manifest.json')), /backup root/);
});
test('preview and copy preserve mixed data, quantities, prices, unrelated bytes and original backup', async () => {
    const preview = await migrateBackupRecords(backup, driver);
    assert.equal(preview.mode, 'preview'); assert.equal(preview.input_mode, 'backup_root');
    assert.equal(preview.checked_files, 3); assert.equal(preview.affected_files, 2);
    assert.equal(preview.changes, 8); assert.equal(preview.conclusion, 'changes_required');
    assert.deepEqual(preview.files.map(f => f.changes), [6, 2, 0]);
    const manual = await migrateItemRecords(join(backup, 'manifest.json'), driver);
    assert.equal(manual.coverage, 'listed_files_only'); assert.deepEqual(manual.files, preview.files);
    output = join(sandbox, 'converted-copy');
    const copied = await migrateBackupRecords(backup, driver, output);
    assert.deepEqual(copied.files, preview.files);
    for (const file of selected) {
        assert.deepEqual(readFileSync(join(backup, file)), original.get(file));
        assert.deepEqual(readFileSync(join(output, 'backup', file)), original.get(file));
    }
    const changedShop = readFileSync(join(output, 'converted/shop/test_shop.o'), 'utf8');
    assert.ok(changedShop.includes('"' + boot + '":9,'));
    assert.ok(changedShop.includes('"' + cloth + '":11,'));
    assert.ok(changedShop.includes('"' + boot + '":100,'));
    assert.ok(changedShop.includes('"' + cloth + '":200,'));
    assert.ok(changedShop.includes('"balance":999,'));
    assert.ok(changedShop.includes(shop.long));
    const changedPlayer = readFileSync(join(output, 'converted/user/a/tester.o'), 'utf8');
    assert.ok(changedPlayer.startsWith('# synthetic\r\nmy_depot '));
    assert.ok(changedPlayer.endsWith('\r\ndbase ' + lpc({ note: oldBoot }) + '\r\n'));
    const again = await migrateBackupRecords(join(output, 'converted'), driver);
    assert.equal(again.changes, 0); assert.equal(again.conclusion, 'no_changes_in_checked_scope');
    assert.ok(again.files.every(f => f.before_sha256 === f.after_sha256));
    await assert.rejects(migrateBackupRecords(backup, driver, output), /new directory/);
    await assert.rejects(migrateBackupRecords(backup, driver, join(backup, 'output')), /new directory/);
});
test('price conflict rejects the whole batch before publishing output', async () => {
    const file = join(backup, 'shop/conflict.o');
    writeFileSync(file, 'dbase ' + lpc({ ...shop, vendor_goods: { ...shop.vendor_goods, [oldBoot2]: 101 } }) + '\n');
    const before = readFileSync(file);
    try {
        await assert.rejects(migrateBackupRecords(backup, driver, join(sandbox, 'failed-copy')), /Shop price conflict: shop\/conflict.o/);
        assert.equal(existsSync(join(sandbox, 'failed-copy')), false);
        assert.deepEqual(readFileSync(file), before);
    } finally { unlinkSync(file); }
});
test('empty scope and a partial manual manifest never claim complete backup coverage', async () => {
    const empty = join(sandbox, 'empty');
    mkdirSync(join(empty, 'user'), { recursive: true }); mkdirSync(join(empty, 'shop'));
    const result = await migrateBackupRecords(empty, driver);
    assert.equal(result.conclusion, 'empty_scope'); assert.equal(result.checked_files, 0);
    const emptyOutput = join(sandbox, 'empty-copy');
    assert.equal((await migrateBackupRecords(empty, driver, emptyOutput)).conclusion, 'empty_scope');
    assert.ok(existsSync(join(emptyOutput, 'backup')) && existsSync(join(emptyOutput, 'converted')));
    writeFileSync(join(empty, 'user/zero.o'), 'my_depot 0\n');
    const zero = await migrateBackupRecords(empty, driver);
    assert.equal(zero.conclusion, 'no_changes_in_checked_scope'); assert.equal(zero.checked_files, 1);
    const path = join(backup, 'partial.json');
    writeFileSync(path, JSON.stringify({ files: [{ file: selected[2], kind: 'backpack' }] }));
    const partial = await migrateItemRecords(path, driver);
    assert.equal(partial.coverage, 'listed_files_only'); assert.equal(partial.checked_files, 1);
    assert.equal(partial.conclusion, 'no_changes_in_checked_scope');
});
test('missing directory, linked directory and unreadable input fail explicitly', () => {
    assert.throws(() => discoverBackup(join(backup, 'user')), /ENOENT/);
    const link = join(backup, 'user/outside');
    symlinkSync(join(backup, 'private'), link, process.platform === 'win32' ? 'junction' : 'dir');
    try { assert.throws(() => discoverBackup(backup), /Incomplete backup scope/); }
    finally { unlinkSync(link); }
    // Portable EACCES fault injection; Windows ACL changes are not needed for this test.
    const saved = fs.accessSync;
    fs.accessSync = () => { const error = new Error('EACCES: synthetic unreadable record'); error.code = 'EACCES'; throw error; };
    syncBuiltinESMExports();
    try { assert.throws(() => discoverBackup(backup), /EACCES/); }
    finally { fs.accessSync = saved; syncBuiltinESMExports(); }
});
test('manual bounds, duplicate files and malformed records do not yield zero-impact reports', async () => {
    const file = join(backup, 'bad.json');
    for (const files of [[{ file: '../outside.o', kind: 'backpack' }],
        [{ file: selected[0], kind: 'shop' }, { file: selected[0], kind: 'shop' }],
        [{ file: 'dbased.o', kind: 'legacy_bags' }], [null]]) {
        writeFileSync(file, JSON.stringify({ files }));
        await assert.rejects(migrateItemRecords(file, driver));
    }
    const badRecord = join(backup, 'user/bad.o');
    writeFileSync(badRecord, 'my_depot this_is_invalid\n');
    try { await assert.rejects(migrateBackupRecords(backup, driver), /Conversion failed/); }
    finally { unlinkSync(badRecord); }
});
test('documented CLI manifest, preview and copy modes and mutually exclusive arguments', () => {
    const cli = join(root, 'tools/migrate_item_records.mjs');
    const run = args => JSON.parse(execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8', windowsHide: true }));
    assert.equal(run(['--backup-root', backup, '--write-manifest', join(backup, 'cli.json')]).checked_files, 0);
    assert.equal(run(['--manifest', join(backup, 'cli.json'), '--driver', driver]).changes, 8);
    assert.equal(run(['--backup-root', backup, '--driver', driver, '--output', join(sandbox, 'cli-copy')]).mode, 'copy');
    for (const args of [['--backup-root', backup, '--manifest', join(backup, 'cli.json')],
        ['--backup-root', backup, '--write-manifest', join(backup, 'bad.json'), '--output', join(sandbox, 'bad')]])
        assert.throws(() => execFileSync(process.execPath, [cli, ...args], { stdio: 'pipe', windowsHide: true }));
    for (const file of selected) assert.deepEqual(readFileSync(join(backup, file)), original.get(file));
});
