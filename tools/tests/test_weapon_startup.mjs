// Cold-start current game objects with their real inheritance and constructors.
// Only source and the public skill-name dictionary enter an isolated temporary mudlib.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const driver = resolve(process.argv[2] || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-weapon-startup-'));
console.log('Isolated full-object startup: ' + sandbox);
const git = (directory, args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
const excluded = /^(?:backup|bin|binaries|data|doc|docs|dump|fluffos|grant|help|log|ai|openspec|temp|version|www|tools)\//;
const isSource = file => /\.(?:c|lpc|h)$/.test(file) && !excluded.test(file)
    && !file.split('/').some(part => part === 'tests' || part.startsWith('.'))
    && existsSync(join(root, file));
const untracked = git(root, ['ls-files', '--others', '--exclude-standard', '-z']);
const sources = [...new Set([...git(root, ['ls-files', '-z']), ...untracked,
    ...git(join(root, 'mudcore'), ['ls-files', '-z']).map(file => 'mudcore/' + file)])].filter(isSource);
const put = (file, text) => {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    writeFileSync(join(sandbox, file), text, 'utf8');
};
for (const file of sources) {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    cpSync(join(root, file), join(sandbox, file));
}
for (const directory of ['tests', 'log', 'data']) mkdirSync(join(sandbox, directory), { recursive: true });
cpSync(join(root, 'data/e2c_dict.o'), join(sandbox, 'data/e2c_dict.o'));
for (const [file, target] of [['startup_master.lpc', 'master.lpc'], ['startup.lpc', 'regression.lpc'],
    ['startup_actor.lpc', 'actor.lpc'], ['xuedao_action.lpc', 'xuedao_action.lpc']])
    put('tests/' + target, readFileSync(join(root, 'tools/tests/weapon_classification', file), 'utf8'));
const changed = [...new Set([...git(root, ['diff', '--name-only', '--diff-filter=ACMR', '-z', '97858beb']),
    ...untracked])].filter(file => isSource(file) && /\.(?:c|lpc)$/.test(file));
assert.ok(changed.length > 0, 'No changed game programs');
put('tests/programs.json', JSON.stringify(changed.map(file => '/' + file.replace(/\.(c|lpc)$/, ''))));

const listener = createServer();
await new Promise((done, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', done); });
const port = listener.address().port;
await new Promise(done => listener.close(done));
put('driver.cfg', [
    'name : Weapon Full Object Startup', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'),
    'log directory : /log', 'debug log file : debug.log',
    'master file : /tests/master', 'simulated efun file : /adm/single/simul_efun',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>',
    'gametick msec : 100',
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
const log = join(sandbox, 'log/debug.log');
const diagnostics = result.output + (existsSync(log) ? readFileSync(log, 'utf8') : '');
console.log(result.output.split(/\r?\n/).filter(line => /WEAPON_STARTUP|FAIL:|error:|warning:/i.test(line)).join('\n'));
assert.equal(result.code, 0, 'Cold startup failed; see ' + sandbox);
assert.ok(result.output.includes('WEAPON_STARTUP PASS'), 'Incomplete cold startup');
assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line)
    && !/^WARNING: Platform doesn't support eval limit!$/.test(line)), 'LPC diagnostics; see ' + sandbox);
