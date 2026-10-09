// Temporary MUDLIB only: no game service, player saves or external model calls.
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const driver = resolve(process.argv[2] || join(root, process.platform === 'win32' ? 'bin/driver.exe' : 'bin/driver'));
const python = resolve(process.argv[3] || join(root, process.platform === 'win32' ? 'ai/.venv/Scripts/python.exe' : 'ai/.venv/bin/python'));
const source = readFileSync(join(root, 'adm/single/simul_efun/fluffos.c'), 'utf8');
const guard = '#if !efun_defined(hash)';
if (source.split(guard).length !== 2) throw new Error('Expected one native availability guard');
const strings = ['', 'a', 'abc', 'message digest', 'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', '1234567890'.repeat(8),
    'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
    '中文心魔幻境🙂', 'a\0b\0中文', '/d/city/liaotian',
    ...[55, 56, 63, 64, 65, 119, 120, 127, 128, 129, 1024, 8192, 65536].map(n => 'a'.repeat(n)),
    ...[18, 19, 21, 22, 41, 42, 43].map(n => '界'.repeat(n)),
    readFileSync(join(root, 'd/illusion/catalog-wuxia-v1.json'), 'utf8')];
const vectors = ['md5', 'sha256'].flatMap(algorithm => strings.map((text, i) => ({
    label: `${algorithm}-${i}-bytes-${Buffer.byteLength(text)}`, algorithm, text,
    expected: createHash(algorithm).update(text, 'utf8').digest('hex'),
})));
for (const mode of ['automatic', 'forced-fallback']) {
    const sandbox = mkdtempSync(join(tmpdir(), `mud-hash-${mode}-`));
    console.log('Isolated hash regression: ' + sandbox);
    for (const name of ['tests', 'include', 'log', 'inherit/illusion']) mkdirSync(join(sandbox, name), { recursive: true });
    cpSync(join(root, 'tools/tests/hash'), join(sandbox, 'tests'), { recursive: true });
    for (const name of ['identity.lpc', 'content.lpc'])
        cpSync(join(root, 'inherit/illusion', name), join(sandbox, 'inherit/illusion', name));
    cpSync(join(root, 'd/illusion/catalog-wuxia-v1.json'), join(sandbox, 'tests/catalog.json'));
    cpSync(join(root, 'mudcore/system/kernel/simul_efun/json.c'), join(sandbox, 'tests/json.c'));
    // Change only the temporary preprocessor guard, never the implementation or driver.
    writeFileSync(join(sandbox, 'tests/sefun.lpc'), '#include "json.c"\n' +
        (mode === 'automatic' ? source : source.replace(guard, '#if 1')));
    writeFileSync(join(sandbox, 'tests/vectors.json'), JSON.stringify(vectors));
    writeFileSync(join(sandbox, 'include/globals.h'), '// isolated hash test\n');
    const server = createServer();
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    const port = server.address().port;
    await new Promise(done => server.close(done));
    writeFileSync(join(sandbox, 'driver.cfg'), [
        'name : Hash regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
        'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : log',
        'debug log file : debug.log', 'include directories : /include', 'global include file : <globals.h>',
        'master file : /tests/master', 'simulated efun file : /tests/sefun', 'gametick msec : 10',
        // Only the generated vector fixture exceeds the default file read size.
        'maximum read file size : 1048576',
    ].join('\n') + '\n');
    const result = await new Promise((done, reject) => {
        const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
        let output = '';
        const timer = setTimeout(() => child.kill(), 60000);
        child.stdout.on('data', data => { output += data; });
        child.stderr.on('data', data => { output += data; });
        child.on('error', error => { clearTimeout(timer); reject(error); });
        child.on('close', (code, signal) => { clearTimeout(timer); done({ code, signal, output }); });
    });
    writeFileSync(join(sandbox, 'output.txt'), result.output);
    console.log(result.output.split(/\r?\n/).filter(line => /HASH|error:/.test(line)).join('\n'));
    if (result.code !== 0 || result.signal || !result.output.includes('HASH PASS') || result.output.includes('HASH FAIL'))
        throw new Error(`Hash regression failed (${mode}): ${result.output.slice(-5000)}`);
    const report = JSON.parse(readFileSync(join(sandbox, 'results.json'), 'utf8'));
    const native = result.output.includes('HASH DRIVER: native available');
    if (report.fallback !== Number(mode === 'forced-fallback' || !native)) throw new Error('Wrong availability branch');
    if (report.checks < vectors.length + 6) throw new Error('Incomplete checks');
    execFileSync(python, ['-c', [
        'import json, sys',
        'from pathlib import Path',
        'sys.path.insert(0, str(Path(sys.argv[1]) / "ai"))',
        'from src.world.protocol import manifest_digest, validate_payload',
        'r = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))',
        'assert manifest_digest(r["world"]) == r["world"]["manifest_digest"]',
        'assert validate_payload(r["payload"]) == r["payload"]',
    ].join('\n'), root, join(sandbox, 'results.json')], { windowsHide: true, stdio: 'pipe' });
    console.log(`HASH ${mode}: Python world protocol matches`);
}
