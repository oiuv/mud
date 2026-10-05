// Only synthetic backups in an OS temporary directory. No live records or game service.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs, { cpSync, mkdirSync, mkdtempSync, writeFileSync, readFileSync, existsSync, symlinkSync, unlinkSync } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { discoverBackup, writeBackupManifest, migrateBackupRecords, migrateItemRecords } from '../migrate_item_records.mjs';
import { renamedPaths } from './item_ids.mjs';
import { migrationPaths as handsPaths, canonicalGroups as handsGroups } from './hands_inventory.mjs';

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
const oldHead = '/d/beijing/npc/obj/head', oldHead2 = '/d/beijing/npc/obj/helmet';
const head = '/d/items/headwear/gangkui', specialHead = '/d/luoyang/npc/obj/head1';
const records = {
    item0: { file: oldBoot, amount: 2, id: 'sandals', name: '草鞋' },
    item1: { file: oldCloth, amount: 3, id: 'cloth', name: '布衣' },
    item2: { file: boot, amount: 1, id: 'sandals', name: '旧草鞋' },
    item3: { file: oldHead, amount: 2, id: 'helmet', name: '钢盔' },
    item4: { file: specialHead, amount: 1, id: 'kui', name: '琉金盔' },
};
const shop = { vendor_goods: { [oldBoot]: 100, [oldBoot2]: 100, [boot]: 100, [oldCloth]: 200, [cloth]: 200,
    [oldHead]: 1234, [oldHead2]: 1234, [head]: 1234 },
    vendor_goods_num: { [oldBoot]: 2, [oldBoot2]: 3, [boot]: 4, [oldCloth]: 5, [cloth]: 6,
        [oldHead]: 2, [oldHead2]: 3, [head]: 4 },
    all_vendor_goods: 29, balance: 999, long: '不要替换玩家文本 ' + oldBoot + ' ' + oldHead };
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
    assert.equal(preview.changes, 13); assert.equal(preview.conclusion, 'changes_required');
    assert.deepEqual(preview.files.map(f => f.changes), [10, 3, 0]);
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
    assert.ok(changedShop.includes('"' + head + '":9,'));
    assert.ok(changedShop.includes('"' + head + '":1234,'));
    assert.ok(changedShop.includes('"all_vendor_goods":29,'));
    assert.ok(changedShop.includes('"balance":999,'));
    assert.ok(changedShop.includes(shop.long));
    const changedPlayer = readFileSync(join(output, 'converted/user/a/tester.o'), 'utf8');
    assert.ok(changedPlayer.startsWith('# synthetic\r\nmy_depot '));
    assert.ok(changedPlayer.endsWith('\r\ndbase ' + lpc({ note: oldBoot }) + '\r\n'));
    assert.ok(changedPlayer.includes('"file":"' + head + '"'));
    assert.ok(changedPlayer.includes('"file":"' + specialHead + '"'));
    const again = await migrateBackupRecords(join(output, 'converted'), driver);
    assert.equal(again.changes, 0); assert.equal(again.conclusion, 'no_changes_in_checked_scope');
    assert.ok(again.files.every(f => f.before_sha256 === f.after_sha256));
    await assert.rejects(migrateBackupRecords(backup, driver, output), /new directory/);
    await assert.rejects(migrateBackupRecords(backup, driver, join(backup, 'output')), /new directory/);
});
test('boots and headwear price conflicts each reject the whole batch before publishing output', async () => {
    const file = join(backup, 'shop/conflict.o');
    for (const path of [oldBoot2, oldHead2]) {
        writeFileSync(file, 'dbase ' + lpc({ ...shop, vendor_goods: { ...shop.vendor_goods, [path]: 101 } }) + '\n');
        const before = readFileSync(file);
        try {
            await assert.rejects(migrateBackupRecords(backup, driver, join(sandbox, 'failed-copy')), /Shop price conflict: shop\/conflict.o/);
            assert.equal(existsSync(join(sandbox, 'failed-copy')), false);
            assert.deepEqual(readFileSync(file), before);
        } finally { unlinkSync(file); }
    }
});

test('explicit legacy bags migrate three families, keep other bags and special headwear, and remain idempotent', async () => {
    const legacy = join(sandbox, 'legacy'); mkdirSync(legacy);
    const source = 'save_dbase ' + lpc({ '/test/bag': records, '/test/unselected': { item0: records.item3 } }) + '\n';
    writeFileSync(join(legacy, 'dbased.o'), source);
    const manifest = { files: [{ file: 'dbased.o', kind: 'legacy_bags', bag_objects: ['/test/bag'] }] };
    writeFileSync(join(legacy, 'manifest.json'), JSON.stringify(manifest));
    const preview = await migrateItemRecords(join(legacy, 'manifest.json'), driver);
    assert.equal(preview.changes, 3);
    const target = join(sandbox, 'legacy-copy');
    await migrateItemRecords(join(legacy, 'manifest.json'), driver, target);
    const changed = readFileSync(join(target, 'converted/dbased.o'), 'utf8');
    for (const path of [cloth, boot, head, oldHead, specialHead]) assert.ok(changed.includes('"file":"' + path + '"'));
    for (const name of ['布衣', '草鞋', '旧草鞋', '钢盔', '琉金盔']) assert.ok(changed.includes(name));
    assert.equal(readFileSync(join(legacy, 'dbased.o'), 'utf8'), source);
    assert.equal(readFileSync(join(target, 'backup/dbased.o'), 'utf8'), source);
    writeFileSync(join(target, 'converted/manifest.json'), JSON.stringify(manifest));
    assert.equal((await migrateItemRecords(join(target, 'converted/manifest.json'), driver)).changes, 0);
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
    assert.equal(run(['--manifest', join(backup, 'cli.json'), '--driver', driver]).changes, 13);
    assert.equal(run(['--backup-root', backup, '--driver', driver, '--output', join(sandbox, 'cli-copy')]).mode, 'copy');
    for (const args of [['--backup-root', backup, '--manifest', join(backup, 'cli.json')],
        ['--backup-root', backup, '--write-manifest', join(backup, 'bad.json'), '--output', join(sandbox, 'bad')]])
        assert.throws(() => execFileSync(process.execPath, [cli, ...args], { stdio: 'pipe', windowsHide: true }));
    for (const file of selected) assert.deepEqual(readFileSync(join(backup, file)), original.get(file));
});

test('all renamed canonical IDs convert once across players, shops and selected legacy bags', async () => {
    const input = join(sandbox, 'renamed-input');
    mkdirSync(input);
    const pairs = Object.entries({ ...renamedPaths('cloth'), ...renamedPaths('boots'), ...renamedPaths('headwear') });
    assert.equal(pairs.length, 79);
    const items = {}, goods = {}, amounts = {};
    for (const [i, [oldPath, path]] of pairs.entries()) {
        items['item' + i * 2] = { file: oldPath, amount: 2, name: '旧物' + i };
        items['item' + (i * 2 + 1)] = { file: path, amount: 3, name: '新物' + i };
        goods[oldPath] = goods[path] = 1000 + i;
        amounts[oldPath] = 2; amounts[path] = 3;
    }
    const note = '不要改写无关文本 ' + pairs[0][0];
    const sources = {
        'player.o': 'my_depot ' + lpc(items) + '\ndbase ' + lpc({ note }) + '\n',
        'shop.o': 'dbase ' + lpc({ vendor_goods: goods, vendor_goods_num: amounts, balance: 789, note }) + '\n',
        'bags.o': 'save_dbase ' + lpc({ '/test/bag': items, '/test/unselected': items }) + '\n',
    };
    for (const [file, source] of Object.entries(sources)) writeFileSync(join(input, file), source);
    const manifest = { files: [
        { file: 'player.o', kind: 'backpack' }, { file: 'shop.o', kind: 'shop' },
        { file: 'bags.o', kind: 'legacy_bags', bag_objects: ['/test/bag'] },
    ] };
    writeFileSync(join(input, 'manifest.json'), JSON.stringify(manifest));
    const target = join(sandbox, 'renamed-copy');
    const preview = await migrateItemRecords(join(input, 'manifest.json'), driver);
    assert.equal(preview.changes, pairs.length * 4);
    const result = await migrateItemRecords(join(input, 'manifest.json'), driver, target);
    assert.deepEqual(result.files, preview.files);
    const player = readFileSync(join(target, 'converted/player.o'), 'utf8');
    const changedShop = readFileSync(join(target, 'converted/shop.o'), 'utf8');
    const bags = readFileSync(join(target, 'converted/bags.o'), 'utf8');
    for (const [i, [oldPath, path]] of pairs.entries()) {
        assert.equal(player.split('"file":"' + path + '"').length - 1, 2);
        assert.ok(!player.includes('"file":"' + oldPath + '"'));
        for (const name of ['旧物' + i, '新物' + i]) assert.ok(player.includes('"name":"' + name + '"'));
        assert.ok(changedShop.includes('"' + path + '":5,'));
        assert.ok(changedShop.includes('"' + path + '":' + (1000 + i) + ','));
        assert.ok(!changedShop.includes('"' + oldPath + '":'));
        assert.equal(bags.split('"file":"' + oldPath + '"').length - 1, 1, 'Unselected bag retained');
        assert.equal(bags.split('"file":"' + path + '"').length - 1, 3);
    }
    assert.ok(player.endsWith('dbase ' + lpc({ note }) + '\n'));
    assert.ok(changedShop.includes('"balance":789,'));
    assert.ok(changedShop.includes(note));
    for (const [file, source] of Object.entries(sources)) {
        assert.equal(readFileSync(join(input, file), 'utf8'), source);
        assert.equal(readFileSync(join(target, 'backup', file), 'utf8'), source);
    }
    writeFileSync(join(target, 'converted/manifest.json'), JSON.stringify(manifest));
    assert.equal((await migrateItemRecords(join(target, 'converted/manifest.json'), driver)).changes, 0);
    for (const family of ['cloth', 'boots', 'headwear']) {
        const [oldPath, path] = Object.entries(renamedPaths(family))[0];
        writeFileSync(join(input, 'shop.o'), 'dbase ' + lpc({
            vendor_goods: { [oldPath]: 1, [path]: 2 }, vendor_goods_num: { [oldPath]: 2, [path]: 3 },
        }) + '\n');
        const failed = join(sandbox, 'renamed-conflict-' + family);
        await assert.rejects(migrateItemRecords(join(input, 'manifest.json'), driver, failed), /Shop price conflict/);
        assert.equal(existsSync(failed), false);
    }
});

test('all 28 HANDS paths and four-family backups: CLI, stock merging, state, bags, rollback and conflicts', async () => {
    const input = join(sandbox, 'hands-input');
    mkdirSync(join(input, 'user'), { recursive: true }); mkdirSync(join(input, 'shop'));
    const pairs = Object.entries({ ...handsPaths(), [oldCloth]: cloth, [oldBoot]: boot, [oldHead]: head });
    assert.equal(Object.keys(handsPaths()).length, 28);
    assert.equal(handsGroups().length, 20);
    const items = {}, goods = {}, amounts = {}, expectedCounts = {};
    for (const [i, [oldPath, path]] of pairs.entries()) {
        items['item' + i * 2] = { file: oldPath, amount: 2, name: '旧物' + i, unknown_field: 'state-' + i };
        items['item' + (i * 2 + 1)] = { file: path, amount: 3, name: '独立物品' + i };
        goods[oldPath] = goods[path] = 100;
        amounts[oldPath] = 2; amounts[path] = 3;
        expectedCounts[path] = (expectedCounts[path] ?? 3) + 2;
    }
    items.item62 = { file: '/d/lingxiao/obj/book-iron', amount: 1, name: '未选研读物品' };
    const total = Object.values(amounts).reduce((a, b) => a + b, 0);
    const note = '正文保留旧路径 ' + pairs[0][0];
    const sources = {
        'user/player.o': 'my_depot ' + lpc(items) + '\ndbase ' + lpc({ note }) + '\n',
        'shop/shop.o': 'dbase ' + lpc({ vendor_goods: goods, vendor_goods_num: amounts, all_vendor_goods: total, balance: 789, note }) + '\n',
        'dbased.o': 'save_dbase ' + lpc({ '/test/bag': items, '/test/unselected': items }) + '\n',
    };
    for (const [file, source] of Object.entries(sources)) writeFileSync(join(input, file), source);
    const cli = args => JSON.parse(execFileSync(process.execPath, [join(root, 'tools/migrate_item_records.mjs'), ...args],
        { encoding: 'utf8', windowsHide: true }));
    const manifestFile = join(input, 'manifest.json');
    assert.equal(cli(['--backup-root', input, '--write-manifest', manifestFile]).discovered_files, 2);
    const preview = cli(['--backup-root', input, '--driver', driver]);
    assert.equal(preview.checked_files, 2); assert.equal(preview.changes, pairs.length * 3);
    const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
    manifest.files.push({ file: 'dbased.o', kind: 'legacy_bags', bag_objects: ['/test/bag'] });
    writeFileSync(manifestFile, JSON.stringify(manifest));
    const target = join(sandbox, 'hands-copy');
    const result = cli(['--manifest', manifestFile, '--driver', driver, '--output', target]);
    assert.equal(result.changes, pairs.length * 4); assert.equal(result.checked_files, 3);
    const player = readFileSync(join(target, 'converted/user/player.o'), 'utf8');
    const changedShop = readFileSync(join(target, 'converted/shop/shop.o'), 'utf8');
    const bags = readFileSync(join(target, 'converted/dbased.o'), 'utf8');
    for (const [i, [oldPath, path]] of pairs.entries()) {
        assert.ok(!player.includes('"file":"' + oldPath + '"'));
        assert.ok(player.includes('"unknown_field":"state-' + i + '"'));
        assert.ok(player.includes('"name":"旧物' + i + '"'));
        assert.ok(player.includes('"name":"独立物品' + i + '"'));
        assert.ok(!changedShop.includes('"' + oldPath + '":'));
        assert.equal(bags.split('"file":"' + oldPath + '"').length - 1, 1, 'unselected bag unchanged');
        const groupSize = pairs.filter(p => p[1] === path).length;
        assert.equal(player.split('"file":"' + path + '"').length - 1, 2 * groupSize, 'player entries not coalesced');
    }
    for (const [path, count] of Object.entries(expectedCounts)) {
        assert.ok(changedShop.includes('"' + path + '":' + count + ','));
        assert.ok(changedShop.includes('"' + path + '":100,'));
    }
    assert.ok(changedShop.includes('"all_vendor_goods":' + total + ','));
    assert.ok(changedShop.includes('"balance":789,')); assert.ok(changedShop.includes(note));
    assert.ok(player.includes('"file":"/d/lingxiao/obj/book-iron"'));
    assert.equal(player.split('"amount":2,').length - 1, pairs.length);
    assert.equal(player.split('"amount":3,').length - 1, pairs.length);
    assert.ok(player.endsWith('dbase ' + lpc({ note }) + '\n'));
    for (const [file, source] of Object.entries(sources)) {
        assert.equal(readFileSync(join(input, file), 'utf8'), source);
        assert.equal(readFileSync(join(target, 'backup', file), 'utf8'), source, 'byte-exact rollback copy');
    }
    const rollback = join(sandbox, 'hands-rollback');
    cpSync(join(target, 'backup'), rollback, { recursive: true });
    for (const [file, source] of Object.entries(sources))
        assert.deepEqual(readFileSync(join(rollback, file)), Buffer.from(source), 'restored backup bytes');
    const replay = join(target, 'converted/manifest.json'); writeFileSync(replay, JSON.stringify(manifest));
    assert.equal((await migrateItemRecords(replay, driver)).changes, 0);
    await assert.rejects(migrateItemRecords(manifestFile, driver, target), /new directory/);
    // All old/new HANDS identities are mapped; differing prices must not silently win.
    for (const [index, [oldPath, path]] of Object.entries(handsPaths()).entries()) {
        writeFileSync(join(input, 'shop/shop.o'), 'dbase ' + lpc({
            vendor_goods: { [oldPath]: 1, [path]: 2 }, vendor_goods_num: { [oldPath]: 2, [path]: 3 },
        }) + '\n');
        const failed = join(sandbox, 'hands-conflict-' + index);
        await assert.rejects(migrateItemRecords(manifestFile, driver, failed), /Shop price conflict/);
        assert.equal(existsSync(failed), false);
    }
});
