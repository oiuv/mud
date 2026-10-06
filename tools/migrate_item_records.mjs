import { migrationPaths as instrumentPaths, baseline as instrumentBaseline } from './tests/instrument_inventory.mjs';
import { migrationPaths as clubPaths, baseline as clubBaseline } from './tests/club_inventory.mjs';
import { migrationPaths as bookPaths, baseline as bookBaseline } from './tests/book_inventory.mjs';
import { migrationPaths as throwingPaths, baseline as throwingBaseline } from './tests/throwing_inventory.mjs';
import { migrationPaths as daggerPaths, baseline as daggerBaseline } from './tests/dagger_inventory.mjs';
import { migrationPaths as whipPaths, baseline as whipBaseline } from './tests/whip_inventory.mjs';
// Offline, explicit-file migration. Inputs are never overwritten.
import { accessSync, constants, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync,
    readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { migrationPaths as clothPaths } from './tests/cloth_canonical.mjs';
import { migrationPaths as bootsPaths, baseline as bootsBaseline } from './tests/boots_inventory.mjs';
import { migrationPaths as headwearPaths, baseline as headwearBaseline } from './tests/headwear_inventory.mjs';
import { migrationPaths as handsPaths, baseline as handsBaseline } from './tests/hands_inventory.mjs';
import { migrationPaths as neckPaths, baseline as neckBaseline } from './tests/neck_inventory.mjs';
import { migrationPaths as wristsPaths, baseline as wristsBaseline } from './tests/wrists_inventory.mjs';
import { migrationPaths as foodPaths, baseline as foodBaseline } from './tests/food_inventory.mjs';
import { migrationPaths as swordPaths, baseline as swordBaseline } from './tests/sword_inventory.mjs';
import { migrationPaths as liquidPaths, baseline as liquidBaseline } from './tests/liquid_inventory.mjs';
import { migrationPaths as bladePaths, baseline as bladeBaseline } from './tests/blade_inventory.mjs';
import { migrationPaths as equipPaths, baseline as equipBaseline } from './tests/equip_inventory.mjs';

import { migrationPaths as staffPaths, baseline as staffBaseline } from './tests/staff_inventory.mjs';
import { migrationPaths as hammerPaths, baseline as hammerBaseline } from './tests/hammer_inventory.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fields = { backpack: 'my_depot', shop: 'dbase', legacy_bags: 'save_dbase', mengzhu_equipment: 'dbase' };
const mengzhuFile = 'npc/meng-zhu.o';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (base, file) => { const path = relative(base, file); return path && !isAbsolute(path) && path !== '..' && !path.startsWith('..' + sep); };

export function discoverBackup(backupRoot) {
    const input = realpathSync(backupRoot);
    const files = [];
    const visit = (directory, kind) => {
        const info = lstatSync(directory);
        if (info.isSymbolicLink() || !info.isDirectory()) throw new Error('Expected an ordinary backup directory: ' + directory);
        for (const name of readdirSync(directory).sort()) {
            const path = join(directory, name), stat = lstatSync(path);
            if (stat.isSymbolicLink()) throw new Error('Incomplete backup scope: link at ' + path);
            if (stat.isDirectory()) visit(path, kind);
            else if (name.endsWith('.o')) {
                if (!stat.isFile()) throw new Error('Expected a regular record: ' + path);
                accessSync(path, constants.R_OK);
                files.push({ file: relative(input, path).split(sep).join('/'), kind });
            }
        }
    };
    // No default root, no traversal of other data, no record body reads here.
    visit(join(input, 'user'), 'backpack');
    visit(join(input, 'shop'), 'shop');
    // This one confirmed NPC record is optional; never enumerate other NPC files.
    const npc = join(input, 'npc'), npcInfo = lstatSync(npc, { throwIfNoEntry: false });
    if (npcInfo) {
        if (npcInfo.isSymbolicLink() || !npcInfo.isDirectory())
            throw new Error('Expected an ordinary backup directory: ' + npc);
        const path = join(input, mengzhuFile), info = lstatSync(path, { throwIfNoEntry: false });
        if (info) {
            if (info.isSymbolicLink() || !info.isFile()) throw new Error('Expected a regular record: ' + path);
            accessSync(path, constants.R_OK);
            files.push({ file: mengzhuFile, kind: 'mengzhu_equipment' });
        }
    }
    files.sort((a, b) => a.file < b.file ? -1 : a.file > b.file ? 1 : 0);
    return { input, manifest: { files } };
}

export function writeBackupManifest(backupRoot, target) {
    const { input, manifest } = discoverBackup(backupRoot);
    target = resolve(target);
    if (realpathSync(dirname(target)) !== input)
        throw new Error('Save the manifest directly in the backup root; entries are relative to that directory');
    writeFileSync(target, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    return { mode: 'manifest', status: 'paths_only', input_mode: 'backup_root', input,
        manifest: target, discovered_files: manifest.files.length, checked_files: 0 };
}

export async function migrateItemRecords(manifestPath, driver, output) {
    manifestPath = realpathSync(manifestPath);
    const input = dirname(manifestPath);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    return convertRecords(manifest, input, driver, output, 'manifest');
}

export async function migrateBackupRecords(backupRoot, driver, output) {
    const { input, manifest } = discoverBackup(backupRoot);
    return convertRecords(manifest, input, driver, output, 'backup_root');
}

async function convertRecords(manifest, input, driver, output, inputMode) {
    if (!manifest || !Array.isArray(manifest.files)) throw new Error('manifest.files must list backup records');
    if (output) {
        output = resolve(output);
        output = join(realpathSync(dirname(output)), basename(output));
        if (existsSync(output) || output === input || inside(input, output) || inside(output, input))
            throw new Error('Output must be a new directory outside the input tree');
    }
    const seen = new Set();
    const files = manifest.files.map(entry => {
        if (!entry || !Object.hasOwn(fields, entry.kind) || typeof entry.file !== 'string' || !entry.file.endsWith('.o'))
            throw new Error('Each entry needs kind=backpack/shop/legacy_bags/mengzhu_equipment and a relative .o file');
        if (isAbsolute(entry.file) || entry.file.includes('\\') || entry.file.split('/').includes('..'))
            throw new Error('Use relative forward-slash paths within the backup directory');
        if (entry.kind === 'mengzhu_equipment' && (entry.file !== mengzhuFile ||
            lstatSync(join(input, 'npc')).isSymbolicLink() || lstatSync(join(input, mengzhuFile)).isSymbolicLink()))
            throw new Error('mengzhu_equipment requires the exact ordinary npc/meng-zhu.o backup');
        const path = realpathSync(resolve(input, entry.file));
        if (!inside(input, path) || seen.has(path)) throw new Error('Outside backup tree or duplicate file: ' + entry.file);
        if (!lstatSync(path).isFile()) throw new Error('Expected a regular record: ' + entry.file);
        seen.add(path);
        if (entry.kind === 'legacy_bags' && (!Array.isArray(entry.bag_objects) || !entry.bag_objects.length ||
            entry.bag_objects.some(key => typeof key !== 'string' || !key.startsWith('/'))))
            throw new Error('legacy_bags requires explicit bag_objects keys verified by the administrator');
        const bytes = readFileSync(path);
        const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
        const matches = [...text.matchAll(new RegExp('^' + fields[entry.kind] + ' ([^\\r\\n]*)(?:\\r?$)', 'gm'))];
        if (matches.length > 1) throw new Error('Duplicate saved variable: ' + entry.file);
        const match = matches[0];
        return { entry, path, bytes, text, match, value: match?.[1] ?? '0' };
    });
    const baseline = JSON.parse(readFileSync(join(root, 'tools/tests/cloth/baseline.json'), 'utf8'));
    const paths = { ...clothPaths(), ...bootsPaths(), ...headwearPaths(), ...handsPaths(), ...neckPaths(), ...wristsPaths(), ...foodPaths(), ...swordPaths(), ...liquidPaths(), ...bladePaths(), ...equipPaths(), ...hammerPaths(), ...staffPaths(), ...whipPaths(), ...daggerPaths(), ...throwingPaths(), ...clubPaths(), ...bookPaths(), ...instrumentPaths() };
    // No game config, sockets, player objects, or runtime data are loaded here.
    const sandbox = mkdtempSync(join(tmpdir(), 'mud-item-migration-'));
    mkdirSync(join(sandbox, 'log'));
    mkdirSync(join(sandbox, 'include'));
    for (const file of ['cloth_records.lpc', 'cloth_master.lpc'])
        cpSync(join(root, 'tools/tests/cloth_migration', file), join(sandbox, file));
    cpSync(join(root, 'mudcore/system/kernel/simul_efun/json.c'), join(sandbox, 'sefun.c'));
    writeFileSync(join(sandbox, 'include/globals.h'), '// Isolated converter: no game globals.\n');
    const request = JSON.stringify({ paths, entries: files.map(file => ({
        kind: file.entry.kind, value: file.value, bag_objects: file.entry.bag_objects || [],
    })) });
    writeFileSync(join(sandbox, 'request.json'), request, { mode: 0o600 });
    // The shared LPC JSON decoder tokenizes the request into arrays. Size this
    // isolated driver's limits to the explicit backup batch, not a live config.
    const requestBytes = Buffer.byteLength(request);
    const socket = createServer();
    await new Promise(done => socket.listen(0, '127.0.0.1', done));
    const port = socket.address().port;
    await new Promise(done => socket.close(done));
    writeFileSync(join(sandbox, 'driver.cfg'), [
        'name : Offline Item Migration', 'mud ip : 127.0.0.1', 'port number : ' + port,
        'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log',
        'debug log file : debug.log', 'master file : /cloth_master', 'simulated efun file : /sefun',
        'include directories : /include', 'global include file : <globals.h>',
        'maximum array size : ' + Math.max(15000, requestBytes),
        'maximum read file size : ' + Math.max(262144, requestBytes),
        'maximum string length : ' + Math.max(1048576, requestBytes * 4),
    ].join('\n') + '\n');
    const result = await new Promise((done, reject) => {
        const child = spawn(resolve(driver), ['driver.cfg'], { cwd: sandbox, windowsHide: true });
        let text = '';
        const timer = setTimeout(() => child.kill(), 60000);
        child.stdout.on('data', data => { text += data; });
        child.stderr.on('data', data => { text += data; });
        child.on('error', error => { clearTimeout(timer); reject(error); });
        child.on('close', code => { clearTimeout(timer); done({ code, text }); });
    });
    writeFileSync(join(sandbox, 'driver-output.txt'), result.text, { mode: 0o600 });
    if (result.code !== 0 || !result.text.includes('CLOTH MIGRATION PASS')) {
        const failure = existsSync(join(sandbox, 'failure.json'))
            ? JSON.parse(readFileSync(join(sandbox, 'failure.json'), 'utf8')) : null;
        const detail = failure && Number.isInteger(failure.entry) && files[failure.entry]
            ? ` ${failure.reason}: ${files[failure.entry].entry.file}.` : '';
        throw new Error('Conversion failed;' + detail + ' input untouched. Restricted temporary directory: ' + sandbox);
    }
    const results = JSON.parse(readFileSync(join(sandbox, 'result.json'), 'utf8'));
    if (results.length !== files.length) throw new Error('Incomplete conversion result');
    const report = { mode: output ? 'copy' : 'preview', status: 'checked',
        input_mode: inputMode, input, coverage: inputMode === 'backup_root' ? ['user/**/*.o', 'shop/**/*.o', mengzhuFile] : 'listed_files_only',
        baseline: baseline.baseline, boots_baseline: bootsBaseline, headwear_baseline: headwearBaseline,
        hands_baseline: handsBaseline, neck_baseline: neckBaseline, wrists_baseline: wristsBaseline, food_baseline: foodBaseline, sword_baseline: swordBaseline, liquid_baseline: liquidBaseline, blade_baseline: bladeBaseline, equip_baseline: equipBaseline, hammer_baseline: hammerBaseline, staff_baseline: staffBaseline, whip_baseline: whipBaseline, dagger_baseline: daggerBaseline, throwing_baseline: throwingBaseline, club_baseline: clubBaseline, book_baseline: bookBaseline, instrument_baseline: instrumentBaseline, sandbox, files: [] };
    const converted = files.map((file, i) => {
        const value = results[i];
        if (!Number.isSafeInteger(value.changes) || value.changes < 0 || typeof value.value !== 'string')
            throw new Error('Invalid driver conversion result');
        let bytes = file.bytes;
        if (value.changes) {
            if (!file.match) throw new Error('Missing target variable');
            const start = file.match.index + fields[file.entry.kind].length + 1;
            bytes = Buffer.from(file.text.slice(0, start) + value.value.replace(/\n$/, '') +
                file.text.slice(start + file.value.length), 'utf8');
        }
        report.files.push({ file: file.entry.file, kind: file.entry.kind, changes: value.changes,
            before_sha256: hash(file.bytes), after_sha256: hash(bytes) });
        return bytes;
    });
    report.checked_files = files.length;
    report.affected_files = report.files.filter(file => file.changes > 0).length;
    report.changes = report.files.reduce((count, file) => count + file.changes, 0);
    report.conclusion = !files.length ? 'empty_scope' : report.changes ? 'changes_required' : 'no_changes_in_checked_scope';
    // Detect input changes before publishing any output. Backups are byte-exact.
    for (const file of files)
        if (hash(readFileSync(file.path)) !== hash(file.bytes)) throw new Error('Input changed during conversion');
    if (output) {
        // Publish only the complete copy. An I/O failure leaves a non-published staging directory.
        const staging = mkdtempSync(join(dirname(output), '.item-migration-'));
        mkdirSync(join(staging, 'backup'), { mode: 0o700 });
        mkdirSync(join(staging, 'converted'), { mode: 0o700 });
        for (let i = 0; i < files.length; i++) {
            for (const [directory, bytes] of [['backup', files[i].bytes], ['converted', converted[i]]]) {
                const path = join(staging, directory, files[i].entry.file);
                mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
                writeFileSync(path, bytes, { flag: 'wx', mode: 0o600 });
            }
        }
        writeFileSync(join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
        writeFileSync(join(staging, 'report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
        if (existsSync(output)) throw new Error('Output appeared during conversion; not overwritten');
        renameSync(staging, output);
    }
    return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    if (!args.length || args.includes('--help')) {
        console.log('node tools/migrate_item_records.mjs (--backup-root <backup> | --manifest <backup/manifest.json>) [--driver bin/driver.exe] [--output <new-directory>]');
        console.log('node tools/migrate_item_records.mjs --backup-root <backup> --write-manifest <backup/manifest.json>');
        console.log('备份根目录须含 user/ 和 shop/；若有 npc/meng-zhu.o，仅额外检查该文件，不扫描其他 NPC。默认预览，显式 --output 才产生全新副本。');
        console.log('一次处理已迁移服装、鞋靴、头饰、手部装备、颈饰、护腕、食物及剑器；仅转换明确的物品路径字段，不替换玩家文本，也不改变存放资格。');
        console.log('盟主备份使用 kind=mengzhu_equipment，仅转换 dbase/weapon、dbase/armor，其他字段不变。');
        console.log('--write-manifest 仅枚举路径，清单须放备份根目录：不读正文、不启动驱动，不代表内容检查。');
        console.log('checked_files/affected_files/changes 分别表示检查数、受影响文件数、路径字段变更数。');
        console.log('manifest 只覆盖所列文件；empty_scope 是空范围，不代表全库无影响。输入永不覆盖。');
    } else {
        const options = new Map();
        for (let i = 0; i < args.length; i += 2) {
            if (!['--manifest', '--backup-root', '--write-manifest', '--driver', '--output'].includes(args[i]) ||
                !args[i + 1] || args[i + 1].startsWith('--') || options.has(args[i]))
                throw new Error('Unknown, duplicate, or missing option; use --help');
            options.set(args[i], args[i + 1]);
        }
        if (options.has('--manifest') === options.has('--backup-root')) throw new Error('Choose --manifest OR --backup-root');
        let report;
        if (options.has('--write-manifest')) {
            if (!options.has('--backup-root') || options.has('--output') || options.has('--driver'))
                throw new Error('--write-manifest requires --backup-root and cannot convert or run a driver');
            report = writeBackupManifest(options.get('--backup-root'), options.get('--write-manifest'));
        } else {
            const convert = options.has('--backup-root') ? migrateBackupRecords : migrateItemRecords;
            report = await convert(options.get('--backup-root') || options.get('--manifest'),
                options.get('--driver') || join(root, 'bin/driver.exe'), options.get('--output'));
        }
        console.log(JSON.stringify(report, null, 2));
    }
}
