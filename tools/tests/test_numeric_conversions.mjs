// Compare the old implicit conversions with expressions read from current source.
// Warnings in the deliberately old /tests/before.lpc fixture are expected.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const driver = resolve(process.argv[2] || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-numeric-check-'));
const source = file => readFileSync(join(root, file), 'utf8');
const put = (file, text) => writeFileSync(join(sandbox, file), text, 'utf8');
for (const dir of ['tests', 'log', 'include']) mkdirSync(join(sandbox, dir), { recursive: true });
console.log('Isolated numeric regression: ' + sandbox);
const skills = [
    'baihua-cuoquan/hong', 'canhe-zhi/canhe', 'liuyang-zhang/po', 'poyang-jian/long',
    'qiankun-jian/ni', 'qianzhu-wandushou/zhugu', 'quanzhen-jian/hua', 'riyue-lun/po',
    'ruanhong-zhusuo/bohu', 'taiji-jian/zhenwu', 'taiji-quan/tu', 'tanzhi-shentong/zhuan',
    'tie-zhang/yin', 'xianglong-zhang/hui', 'xuanming-zhang/xing', 'xuedao-dafa/perform/shi',
    'yinsuo-jinling/feng', 'yiyang-zhi/die', 'yuenv-jian/xin', 'zhemei-shou/hua',
];
const before = [];
const after = [];
const cases = [];
let gains = 0;
for (const skill of skills) {
    const text = source('kungfu/skill/' + skill + '.c');
    const matches = [...text.matchAll(/\b(ap|lvl)\s*\+=\s*to_int\(\1\s*\*\s*improve\);/g)];
    assert.equal(matches.length, skill === 'yiyang-zhi/die' ? 4 : skill === 'xianglong-zhang/hui' ? 3 : 1, skill);
    for (const [statement, variable] of matches) {
        const name = 'gain_' + gains++;
        before.push(`int ${name}(int ${variable}, float improve) { ${variable} += ${variable} * improve; return ${variable}; }`);
        after.push(`int ${name}(int ${variable}, float improve) { ${statement} return ${variable}; }`);
        for (const value of [-101, -7, 0, 1, 7, 101, 123456789])
            for (const factor of [-1.15, -0.15, 0.01, 0.15, 0.85, 1.01])
                cases.push([name, [value, factor]]);
    }
}
assert.equal(gains, 25);
const npcExpressions = [...source('adm/daemons/npcd.c').matchAll(/sk_lvl\s*=\s*(to_int\(to_int\(pow[\s\S]*?);/g)]
    .map(match => match[1].trim());
assert.equal(npcExpressions.length, 3);
const oldNpc = [
    'to_int(pow(to_float(exp * 10), 1.0 / 3)) * 0.6 + 10',
    'to_int(pow(to_float(exp * 10), 1.0 / 3)) * (0.6 + to_float(exp) / 10000000)',
    'to_int(pow(to_float(exp * 10), 1.0 / 3)) * 0.8',
];
for (let i = 0; i < 3; i++) {
    const name = 'npc_' + i;
    before.push(`int ${name}(int exp) { int sk_lvl; sk_lvl = ${oldNpc[i]}; return sk_lvl; }`);
    after.push(`int ${name}(int exp) { int sk_lvl; sk_lvl = ${npcExpressions[i]}; return sk_lvl; }`);
    for (const exp of [0, 1, 100, 599999, 600000, 600001, 1999999, 2000000, 2000001, 1000000000])
        cases.push([name, [exp]]);
}
const quest = source('adm/daemons/ultra_questd.c').match(/lvl\s*=\s*(to_int\(pow\(exp,[\s\S]*?);/);
assert.ok(quest, 'quest expression');
before.push('int quest(int exp) { int lvl; lvl = pow(exp, 1.0 / 3) - 50; return lvl; }');
after.push(`int quest(int exp) { int lvl; lvl = ${quest[1]}; return lvl; }`);
for (const exp of [0, 1, 7, 8, 9, 124999, 125000, 125001, 1000000000]) cases.push(['quest', [exp]]);
const damage = source('feature/itemmake.c').match(/d\s*=\s*(to_int\(1\.0[\s\S]*?);/);
assert.ok(damage, 'damage expression');
before.push('int damage(int lvl, int p, int bless) { int d; d = 1.0 * (lvl * lvl) / (9 * 9) * p + bless * 2; return d + p; }');
after.push(`int damage(int lvl, int p, int bless) { int d; d = ${damage[1].replace('query("bless")', 'bless')}; return d + p; }`);
for (const lvl of [1, 2, 8, 9, 10, 20])
    for (const point of [-101, -1, 0, 1, 79, 100, 1234567])
        for (const bless of [0, 1, 7]) cases.push(['damage', [lvl, point, bless]]);
const percent = source('u/mudren/misc/percent.c');
after.push(percent);
// Freeze the historical integer return contract, including float-argument calls.
before.push('int percent(int num, int den) { if (floatp(num) || floatp(den)) return num * 100.0 / den; else return num * 100 / den; }');
before.push('int percent_of(int percent, int base) { if (floatp(percent) || floatp(base)) return percent * base / 100.0; else return percent * base / 100; }');
for (const name of ['percent', 'percent_of'])
    for (const a of [-25.5, -25, -1, 0, 1, 25, 25.5])
        for (const b of [-8.5, -8, 1, 8, 8.5, 101]) cases.push([name, [a, b]]);
put('tests/before.lpc', before.join('\n') + '\n');
put('tests/after.lpc', after.join('\n') + '\n');
const saved = value => Array.isArray(value) ? '({' + value.map(saved).join(',') + ',})' : JSON.stringify(value);
put('tests/cases.o', saved(cases));
put('tests/master.lpc', source('tools/tests/numeric_conversions.lpc'));
put('include/globals.h', '// No game dependencies.\n');
put('tests/sefun.lpc', 'int numeric_test_host() { return 1; }\n');
put('driver.cfg', [
    'name : Numeric Regression', 'mud ip : 127.0.0.1',
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'),
    'log directory : /log', 'debug log file : debug.log', 'master file : /tests/master',
    'include directories : /include', 'global include file : <globals.h>',
    'simulated efun file : /tests/sefun',
    'maximum evaluation cost : 100000000',
].join('\n') + '\n');
const result = await new Promise((done, reject) => {
    const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
    let output = '';
    const timer = setTimeout(() => child.kill(), 30000);
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); done({ code, output }); });
});
put('driver-output.txt', result.output);
const warnings = result.output.split(/\r?\n/).filter(line => /:\d+:.*\bwarning:/i.test(line));
console.log(result.output.split(/\r?\n/).filter(line => /NUMERIC |FAIL:|error:|\*Error/.test(line)).join('\n'));
assert.equal(result.code, 0, 'Driver failed; see ' + sandbox);
assert.ok(warnings.length > 0, 'Driver must reproduce the historical truncation warnings');
assert.ok(warnings.every(line => line.startsWith('/tests/before.lpc:') && line.includes('Float value truncated to int')),
    'Unexpected warnings; see ' + sandbox);
assert.ok(result.output.includes(`NUMERIC PASS: ${cases.length}`), 'Incomplete regression; see ' + sandbox);
