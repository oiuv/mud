// Real game inheritance in a source-only, disposable MUDLIB. Never connect to the game.
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
const groups = args.filter(arg => arg.startsWith('--')).map(arg => arg.slice(2));
const allGroups = ['equipment', 'callbacks', 'attributes', 'audit', 'skills'];
assert.ok(groups.every(group => allGroups.includes(group)));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-weapon-combat-'));
console.log('Isolated weapon regression: ' + sandbox);
const git = (directory, arguments_) => execFileSync('git', ['-C', directory, ...arguments_], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
const excluded = /^(?:backup|bin|binaries|data|doc|docs|dump|fluffos|grant|help|log|ai|openspec|temp|version|www|tools)\//;
const files = new Set([...git(root, ['ls-files', '-z']), ...git(root, ['ls-files', '--others', '--exclude-standard', '-z']),
    ...git(join(root, 'mudcore'), ['ls-files', '-z']).map(file => 'mudcore/' + file)]);
const put = (file, text) => {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    writeFileSync(join(sandbox, file), text, 'utf8');
};
for (const file of files) {
    if (!/\.(?:c|lpc|h)$/.test(file) || excluded.test(file) || !existsSync(join(root, file))
        || file.split('/').some(part => part === 'tests' || part.startsWith('.'))) continue;
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    cpSync(join(root, file), join(sandbox, file));
}
for (const directory of ['tests', 'log', 'data']) mkdirSync(join(sandbox, directory), { recursive: true });
cpSync(join(root, 'data/e2c_dict.o'), join(sandbox, 'data/e2c_dict.o'));
put('tests/master.lpc', readFileSync(join(root, 'tools/tests/weapon_classification/startup_master.lpc'), 'utf8')
    .replaceAll('WEAPON_STARTUP', 'WEAPON_COMBAT')
    .replace('if (err) check(0, err);\n    finish();',
        'if (err) check(0, err);\n    if (err || !"/tests/regression"->query_pending()) finish();'));
put('tests/actor.lpc', readFileSync(join(root, 'tools/tests/weapon_classification/startup_actor.lpc'), 'utf8')
    + '\n// Fixture-only death state, without NPC corpse/reward side effects.\nvoid mark_ghost() { ghost = 1; }\n');
for (const file of ['regression', 'control', 'armor', 'crafted', 'throwing', 'audit', 'audit_weapon'])
    put('tests/' + file + '.lpc', readFileSync(join(root, 'tools/tests/weapon_combat', file + '.lpc'), 'utf8'));
put('kungfu/skill/audit_skill.lpc', readFileSync(join(root, 'tools/tests/weapon_combat/audit_skill.lpc'), 'utf8'));
// Deterministic random choices only in the disposable copies. Keep real do_attack,
// callbacks, damage calculation, item lifecycle and character inheritance intact.
const patches = {
    'adm/daemons/combatd.c': [
        ['random(ap + dp)', '"/tests/control"->roll("dodge", ap + dp)'],
        ['random(ap + pp)', '"/tests/control"->roll("parry", ap + pp)'],
        ['> random(100))\n                    damage = 0;', '> "/tests/control"->roll("dex", 100))\n                    damage = 0;'],
        // Remaining draws keep native randomness except while testing attribute ownership.
        ['random(', '"/tests/control"->random_value('],
    ],
    'adm/daemons/weapond.c': [['wap = random(wap);', 'wap = "/tests/control"->roll("collision", wap);']],
    'feature/action.c': [['random(', '"/tests/control"->random_value(']],
    'cmds/skill/perform.c': [['random(', '"/tests/control"->random_value(']],
};
for (const [file, replacements] of Object.entries(patches)) {
    let text = readFileSync(join(root, file), 'utf8');
    for (const [before, after] of replacements) {
        if (before === 'random(') {
            assert.ok(text.includes(before), 'Combat random draws found');
            text = text.replaceAll(before, after);
        } else {
            assert.equal(text.split(before).length, 2, 'Unique random patch site: ' + file + ': ' + before);
            text = text.replace(before, after);
        }
    }
    put(file, text);
}
put('tests/random-patches.json', JSON.stringify(patches, null, 2));
put('tests/groups.json', JSON.stringify(groups.length ? groups : allGroups));
const listener = createServer();
await new Promise((done, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', done); });
const port = listener.address().port;
await new Promise(done => listener.close(done));
put('driver.cfg', ['name : Weapon Combat Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
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
const log = join(sandbox, 'log/debug.log');
const diagnostics = result.output + (existsSync(log) ? readFileSync(log, 'utf8') : '');
console.log(result.output.split(/\r?\n/).filter(line => /WEAPON_COMBAT|FAIL:|error:|warning:/i.test(line)).join('\n'));
assert.equal(result.code, 0, 'Regression failed; see ' + sandbox);
assert.ok(result.output.includes('WEAPON_COMBAT PASS'), 'Incomplete regression');
assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line)
    && !/^WARNING: Platform doesn't support eval limit!$/.test(line)), 'LPC diagnostics; see ' + sandbox);
