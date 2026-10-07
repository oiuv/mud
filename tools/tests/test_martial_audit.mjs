// Source-only isolated driver regression; no production saves, sockets or model calls.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const driver = resolve(args.find(arg => !arg.startsWith('--')) || join(root, 'bin/driver.exe'));
const before = args.find(arg => arg.startsWith('--before='))?.slice('--before='.length);
// Freeze the audited revision so --before remains a useful negative control after commit.
const auditBaseline = 'd43c418f';
const baselineGroups = {
    freeze: ['kungfu/skill/bingxin-jue/freeze.c'],
    canhe: ['kungfu/skill/canhe-zhi.c', 'kungfu/skill/canhe-zhi/canhe.c'],
    taixuan: ['kungfu/skill/taixuan-gong/perform/xuan.c'],
    tao: ['kungfu/skill/chousui-zhang/tao.c', 'kungfu/skill/ruying-suixingtui/ruying.c'],
    energy: ['kungfu/skill/shenxing-baibian.c', 'kungfu/skill/qixing-bu.c',
        'kungfu/skill/shenxing-baibian/piao.c', 'kungfu/skill/biyun-xinfa/powerup.c',
        'kungfu/skill/jiasha-fumogong/zhe.c'],
    recovery: ['kungfu/condition/drunk.c', 'kungfu/skill/xiantian-gong/exert/hup.c',
        'kungfu/skill/xuedao-dafa/exert/resurrect.c', 'kungfu/skill/force/heal.c'],
    timing: ['kungfu/skill/jiuyin-shengong/perform/xin.c', 'kungfu/skill/chousui-zhang/tao.c'],
};
assert.ok(!before || baselineGroups[before], 'Unknown baseline group');
const sandbox = mkdtempSync(join(tmpdir(), 'mud-martial-audit-'));
console.log('Isolated martial audit: ' + sandbox);
const source = file => readFileSync(join(root, file), 'utf8');
const production = file => before && baselineGroups[before].includes(file)
    ? execFileSync('git', ['show', auditBaseline + ':' + file], { cwd: root, encoding: 'utf8' }) : source(file);
const put = (file, text) => {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    writeFileSync(join(sandbox, file), text, 'utf8');
};
const git = (directory, args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
const included = /^(?:adm|feature|include|inherit|kungfu|mudcore|std)\//;
const files = new Set([...git(root, ['ls-files', '-z']), ...git(root, ['ls-files', '--others', '--exclude-standard', '-z']),
    ...git(join(root, 'mudcore'), ['ls-files', '-z']).map(file => 'mudcore/' + file)]);
for (const file of files) {
    if (!/\.(?:c|lpc|h)$/.test(file) || !included.test(file) || !existsSync(join(root, file))
        || file.split('/').some(part => part === 'tests' || part.startsWith('.'))) continue;
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    cpSync(join(root, file), join(sandbox, file));
}
for (const dir of ['tests', 'data', 'log']) mkdirSync(join(sandbox, dir), { recursive: true });
put('data/e2c_dict.o', source('data/e2c_dict.o')); // Only the public display dictionary.
put('tests/before.txt', before || '');
if (before) for (const file of baselineGroups[before]) put(file, production(file));
put('tests/master.lpc', source('tools/tests/weapon_classification/startup_master.lpc')
    .replaceAll('WEAPON_STARTUP', 'MARTIAL_AUDIT')
    .replace('if (!caught) {', 'debug_message(sprintf("TEST TRACE: %O", details));\n    if (!caught) {')
    .replace('if (err) check(0, err);\n    finish();', 'if (err) { check(0, err); finish(); }'));
for (const file of ['actor', 'control', 'combat', 'regression'])
    put('tests/' + file + '.lpc', source('tools/tests/martial_audit/' + file + '.lpc'));
// Boundary spy only: effects execute actual skill/character/attribute/damage code.
// Common combat resolution has its own real-driver suite; here record the exact
// arguments and in-effect attributes without additional combat energy consumption.
put('adm/daemons/combatd.c', 'inherit "/tests/combat";\n');
// Synthetic ordinary actors only; never load deployment wizard/account records.
put('adm/daemons/securityd.c', 'int get_wiz_level(mixed ob) { return 0; }\n'
    + 'string get_status(mixed ob) { return "(player)"; }\n');
const randomFiles = ['canhe-zhi.c', 'canhe-zhi/canhe.c', 'bingxin-jue/freeze.c',
    'taixuan-gong/perform/xuan.c', 'taixuan-gong/xuan.c', 'chousui-zhang/tao.c',
    'ruying-suixingtui/ruying.c', 'jiasha-fumogong/zhe.c', 'jiuyin-shengong/perform/xin.c',
    'xuedao-dafa/exert/resurrect.c'];
for (const relative of randomFiles) {
    const file = 'kungfu/skill/' + relative;
    let text = production(file);
    assert.ok(text.includes('random('), 'RNG site: ' + file);
    text = text.replaceAll('random(', '"/tests/control"->roll(');
    if (relative === 'jiuyin-shengong/perform/xin.c') {
        const site = 'call_out("remove_effs", times, target';
        assert.equal(text.split(site).length, 2, 'Unique asynchronous timing input');
        text = text.replace(site, 'call_out("remove_effs", "/tests/control"->effect_delay(target), target');
    }
    put(file, text);
}
put('tests/controlled-inputs.json', JSON.stringify({ randomFiles,
    timing: 'Only the xin remove_effs delay is supplied by each synthetic target; callback body and effect IDs are production code.' }, null, 2));
const listener = createServer();
await new Promise((done, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', done); });
const port = listener.address().port;
await new Promise(done => listener.close(done));
put('driver.cfg', ['name : Martial Audit Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log', 'debug log file : debug.log',
    'master file : /tests/master', 'simulated efun file : /adm/single/simul_efun',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>', 'gametick msec : 100',
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
console.log(result.output.split(/\r?\n/).filter(line => /MARTIAL_AUDIT|FAIL:|error:|warning:|TEST TRACE/i.test(line)).join('\n'));
if (before) {
    assert.equal(result.code, 1, 'Old production code must fail this isolated regression');
    assert.ok(result.output.includes('MARTIAL_AUDIT FAIL') && result.output.includes('FAIL:'), 'Missing negative-control failure');
    console.log('MARTIAL_AUDIT BEFORE ' + before + ': expected defect detected');
} else {
    assert.equal(result.code, 0, 'Driver failed; inspect ' + sandbox);
    assert.ok(result.output.includes('MARTIAL_AUDIT PASS'), 'Incomplete regression');
    assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line)
        && !/^WARNING: Platform doesn't support eval limit!$/.test(line)), 'Compiler diagnostics; inspect ' + sandbox);
}
