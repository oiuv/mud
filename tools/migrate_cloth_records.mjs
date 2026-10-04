// Offline, explicit-file migration. Inputs are never overwritten.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { migrationPaths } from './tests/cloth_canonical.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fields = { backpack: 'my_depot', shop: 'dbase', legacy_bags: 'save_dbase' };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (base, file) => { const path = relative(base, file); return path && !isAbsolute(path) && path !== '..' && !path.startsWith('..' + sep); };

export async function migrateClothRecords(manifestPath, driver, output) {
    manifestPath = realpathSync(manifestPath);
    const input = dirname(manifestPath);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (!Array.isArray(manifest.files) || !manifest.files.length) throw new Error('manifest.files must list backup records');
    if (output) {
        output = resolve(output);
        output = join(realpathSync(dirname(output)), basename(output));
        if (existsSync(output) || output === input || inside(input, output) || inside(output, input))
            throw new Error('Output must be a new directory outside the input tree');
    }
    const seen = new Set();
    const files = manifest.files.map(entry => {
        if (!Object.hasOwn(fields, entry.kind) || typeof entry.file !== 'string' || !entry.file.endsWith('.o'))
            throw new Error('Each entry needs kind=backpack/shop/legacy_bags and a relative .o file');
        if (isAbsolute(entry.file) || entry.file.includes('\\') || entry.file.split('/').includes('..'))
            throw new Error('Use relative forward-slash paths within the backup directory');
        const path = realpathSync(resolve(input, entry.file));
        if (!inside(input, path) || seen.has(path)) throw new Error('Outside backup tree or duplicate file: ' + entry.file);
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
    const paths = migrationPaths();
    // No game config, sockets, player objects, or runtime data are loaded here.
    const sandbox = mkdtempSync(join(tmpdir(), 'mud-cloth-migration-'));
    mkdirSync(join(sandbox, 'log'));
    mkdirSync(join(sandbox, 'include'));
    for (const file of ['cloth_records.lpc', 'cloth_master.lpc'])
        cpSync(join(root, 'tools/tests/cloth_migration', file), join(sandbox, file));
    cpSync(join(root, 'mudcore/system/kernel/simul_efun/json.c'), join(sandbox, 'sefun.c'));
    writeFileSync(join(sandbox, 'include/globals.h'), '// Isolated converter: no game globals.\n');
    writeFileSync(join(sandbox, 'request.json'), JSON.stringify({ paths, entries: files.map(file => ({
        kind: file.entry.kind, value: file.value, bag_objects: file.entry.bag_objects || [],
    })) }), { mode: 0o600 });
    const socket = createServer();
    await new Promise(done => socket.listen(0, '127.0.0.1', done));
    const port = socket.address().port;
    await new Promise(done => socket.close(done));
    writeFileSync(join(sandbox, 'driver.cfg'), [
        'name : Offline Cloth Migration', 'mud ip : 127.0.0.1', 'port number : ' + port,
        'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log',
        'debug log file : debug.log', 'master file : /cloth_master', 'simulated efun file : /sefun',
        'include directories : /include', 'global include file : <globals.h>',
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
    const report = { mode: output ? 'copy' : 'preview', baseline: baseline.baseline, sandbox, files: [] };
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
    // Detect input changes before publishing any output. Backups are byte-exact.
    for (const file of files)
        if (hash(readFileSync(file.path)) !== hash(file.bytes)) throw new Error('Input changed during conversion');
    if (output) {
        mkdirSync(output, { mode: 0o700 });
        for (let i = 0; i < files.length; i++) {
            for (const [directory, bytes] of [['backup', files[i].bytes], ['converted', converted[i]]]) {
                const path = join(output, directory, files[i].entry.file);
                mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
                writeFileSync(path, bytes, { flag: 'wx', mode: 0o600 });
            }
        }
        writeFileSync(join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
        writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    }
    return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    if (!args.length || args.includes('--help')) {
        console.log('node tools/migrate_cloth_records.mjs --manifest <backup/manifest.json> [--driver bin/driver.exe] [--output <new-directory>]');
        console.log('默认只预览。显式 --output 才产生 backup/ 与 converted/，从不覆盖输入或操作正式服。');
    } else {
        const options = new Map();
        for (let i = 0; i < args.length; i += 2) {
            if (!['--manifest', '--driver', '--output'].includes(args[i]) ||
                !args[i + 1] || args[i + 1].startsWith('--') || options.has(args[i]))
                throw new Error('Unknown, duplicate, or missing option; use --help');
            options.set(args[i], args[i + 1]);
        }
        if (!options.has('--manifest')) throw new Error('--manifest is required');
        console.log(JSON.stringify(await migrateClothRecords(options.get('--manifest'),
            options.get('--driver') || join(root, 'bin/driver.exe'), options.get('--output')), null, 2));
    }
}
