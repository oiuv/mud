// Compile tracked game sources in a disposable mudlib; never boot the live game.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const compiler = resolve(process.argv[2] || join(root, 'bin/lpcc.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-warning-check-'));
const tracked = directory => execFileSync('git', ['-C', directory, 'ls-files', '-z'], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
// Match updateall's non-game exclusions; also omit development tools and fixtures.
const excluded = /^(?:backup|bin|binaries|data|doc|docs|dump|fluffos|grant|help|log|ai|openspec|temp|version|www|tools)\//;
const sources = [...tracked(root), ...tracked(join(root, 'mudcore')).map(file => 'mudcore/' + file)]
    .filter(file => /\.(?:c|lpc|h)$/.test(file) && !excluded.test(file)
        && !file.split('/').some(part => part === 'tests' || part.startsWith('.'))
        && existsSync(join(root, file)));
const put = (file, content) => {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    writeFileSync(join(sandbox, file), content, 'utf8');
};
console.log('Isolated warning check: ' + sandbox);
for (const file of sources) {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    cpSync(join(root, file), join(sandbox, file));
}
for (const directory of ['log', 'data']) mkdirSync(join(sandbox, directory), { recursive: true });
// Compile constructor bodies without invoking them. Same method as compile_cloth_callers.mjs.
put('include/globals.h', readFileSync(join(sandbox, 'include/globals.h'), 'utf8')
    + '\n#define create warning_check_create\n');
// Some legacy skills evaluate this_player()->query_skill() in global initializers.
// Supply a synthetic caller only in this compile host; no real player is loaded.
put('tests/actor.lpc', 'varargs int query_skill(string name, int raw) { return 100; }\n');
put('tests/sefun.lpc', 'varargs object this_player(int flag);\n'
    + '#include "/adm/single/simul_efun.c"\n'
    + 'varargs object this_player(int flag) { return load_object("/tests/actor"); }\n');
put('tests/master.lpc', [
    'string get_root_uid() { return "Root"; }',
    'string get_bb_uid() { return "Backbone"; }',
    'string creator_file(string file) { return "Root"; }',
    'string author_file(string file) { return "Root"; }',
    'string domain_file(string file) { return "Backbone"; }',
    'int valid_read(string file, mixed user, string func) { return 1; }',
    'int valid_write(string file, mixed user, string func) { return 0; }',
    'int valid_seteuid(object ob, string uid) { return 1; }',
    'int valid_override(string file, string name, string main_file) { return 1; }',
    'int valid_socket(object ob, string func, mixed *info) { return 0; }',
    'int valid_database(object ob, string func, mixed *info) { return 0; }',
    'int valid_external(string command) { return 0; }',
    'void log_error(string file, string text) { debug_message(text); }',
    'void error_handler(mapping details, int caught) { debug_message(details["error"]); }',
    'string *epilog(int flag) { return ({}); }',
].join('\n') + '\n');
put('driver.cfg', [
    'name : LPC Warning Check', 'mud ip : 127.0.0.1',
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'),
    'log directory : /log', 'debug log file : debug.log',
    'master file : /tests/master', 'simulated efun file : /tests/sefun',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>',
].join('\n') + '\n');
const requested = process.argv.slice(3).map(file => file.replaceAll('\\', '/').replace(/^\//, ''));
const programs = sources.filter(file => /\.(?:c|lpc)$/.test(file));
const files = requested.length ? requested : programs;
assert.ok(files.length > 0, 'No programs selected');
for (const file of files) assert.ok(programs.includes(file), 'Not a tracked game program: ' + file);
const result = await new Promise((done, reject) => {
    const child = spawn(compiler, ['--batch', 'driver.cfg'], { cwd: sandbox, windowsHide: true });
    let output = '';
    const timer = setTimeout(() => child.kill(), 300000);
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); done({ code, output }); });
    child.stdin.on('error', () => {});
    child.stdin.end(files.map(file => '/' + file).join('\n') + '\n');
});
put('compiler-output.txt', result.output);
const debugPath = join(sandbox, 'log/debug.log');
const diagnostics = result.output + '\n' + (existsSync(debugPath) ? readFileSync(debugPath, 'utf8') : '');
const notices = [...new Set(diagnostics.split(/\r?\n/).filter(line => /^WARNING: Platform doesn't support eval limit!$/.test(line)))];
const warnings = [...new Set(diagnostics.split(/\r?\n/).filter(line => /\bwarning:/i.test(line) && !notices.includes(line)))];
const errors = [...new Set(diagnostics.split(/\r?\n/).filter(line => /\berror:|^FAIL |Fail to load/.test(line)))];
const passed = result.output.split(/\r?\n/).filter(line => line.startsWith('PASS /')).length;
console.log([...warnings, ...errors].join('\n'));
for (const notice of notices) console.log('Driver platform notice (not an LPC diagnostic): ' + notice);
console.log(`LPC COMPILE: ${passed}/${files.length}; warnings: ${warnings.length}; errors: ${errors.length}`);
assert.equal(result.code, 0, 'Compiler exit code; see ' + sandbox);
assert.equal(passed, files.length, 'Incomplete compile; see ' + sandbox);
assert.equal(errors.length, 0, 'Compiler errors; see ' + sandbox);
assert.equal(warnings.length, 0, 'Compiler warnings; see ' + sandbox);
