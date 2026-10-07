// Isolated, native-randomness benchmark. Never connects to the running game.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { createConnection, createServer } from 'node:net';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarize, validateRun, fingerprint } from './tests/weapon_balance/statistics.mjs';

export const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const fixtures = join(root, 'tools/tests/weapon_balance');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (directory, args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8', windowsHide: true }).trim();
const help = `隔离兵器平衡评测（不修改正式游戏，不调用 AI）
用法：node tools/bench_weapon_balance.mjs [选项]
  --help              仅显示帮助，不创建目录或启动驱动
  --driver PATH       FluffOS 驱动；默认 bin/driver.exe
  --smoke             每条件 2 次单测、2 场交锋、每场 3 秒，仅验证工具
  --samples N         每条件独立单次样本；默认 100
  --bouts N           每对照交锋次数；默认 20（交替先手，建议偶数）
  --duration N        每场最多真实秒数；默认 30
  --output PATH       新建的仓库外证据目录；默认系统临时目录
完整运行有 12 组交锋条件，默认最长约两小时；须独立运行两批后比较。
例：node tools/bench_weapon_balance.mjs --smoke
例：node tools/bench_weapon_balance.mjs --output C:/Temp/weapon-balance-A
仅启动临时 MUDLIB、两个本地交互角色及随机回环端口；日志和副本保留供复核。
`;

export function parseArgs(args) {
    const result = { driver: join(root, 'bin/driver.exe'), smoke: false };
    const values = new Set(['driver', 'samples', 'bouts', 'duration', 'output']);
    for (let i = 0; i < args.length; i++) {
        const key = args[i].replace(/^--/, '');
        assert.ok(args[i].startsWith('--'), `未知参数：${args[i]}`);
        if (key === 'help' || key === 'smoke') { result[key] = true; continue; }
        assert.ok(values.has(key) && args[i + 1] && !args[i + 1].startsWith('--'), `参数无效：${args[i]}`);
        assert.equal(result[`seen_${key}`], undefined, `重复参数：${key}`);
        result[`seen_${key}`] = true;
        const value = args[++i];
        if (['samples', 'bouts', 'duration'].includes(key)) {
            assert.ok(/^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0, `${key} 必须为正整数`);
            result[key] = Number(value);
        } else result[key] = resolve(value);
    }
    for (const [key, value] of Object.entries(result)) if (key.startsWith('seen_')) delete result[key];
    return { samples: result.smoke ? 2 : 100, bouts: result.smoke ? 2 : 20, duration: result.smoke ? 3 : 30, ...result };
}

// Resolve every existing ancestor, including junctions; lexical prefix checks are insufficient.
export function canonicalFuture(path) {
    path = resolve(path);
    if (existsSync(path)) return realpathSync(path);
    const parent = dirname(path);
    assert.notEqual(parent, path, '无法解析输出目录');
    return join(canonicalFuture(parent), relative(parent, path));
}
export function outsideRepository(path) {
    const actual = canonicalFuture(path);
    const rel = relative(root, actual);
    assert.ok(rel && (rel === '..' || rel.startsWith('..\\') || rel.startsWith('../') || isAbsolute(rel)), '输出必须在仓库及其子模块之外');
    assert.ok(!existsSync(path), '不覆盖已有输出目录');
    return actual;
}

export function applyProbes(text) {
    // Observation only: all original branches, expressions and random draws remain verbatim.
    const sites = [
        ['    message_combatd(result, me, victim, damage_info);', '    "/tests/runner"->observe_attack(me, victim, attack_type, attack_result, damage);\n'],
        ['            my["neili"] -= jiali;', '            me->observe_resource("neili", -jiali);\n'],
        ['    // Am I use weapon\n', '    "/tests/runner"->observe_direct(me, target);\n'],
    ];
    let changed = text;
    for (const [anchor, insert] of sites) {
        assert.equal(changed.split(anchor).length, 2, `探针锚点不唯一：${anchor}`);
        changed = changed.replace(anchor, insert + anchor);
    }
    let restored = changed;
    for (const [, insert] of sites) restored = restored.replace(insert, '');
    assert.equal(restored, text, '探针必须可完全还原，不能修改结算语句');
    return { changed, sites };
}

async function freePort() {
    const server = createServer();
    await new Promise((ok, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', ok); });
    const port = server.address().port;
    await new Promise(ok => server.close(ok));
    return port;
}

export async function runBatch(options, { probes = true } = {}) {
    const driver = realpathSync(options.driver);
    assert.ok(statSync(driver).isFile(), '驱动不是文件');
    const output = options.output ? outsideRepository(options.output) : mkdtempSync(join(tmpdir(), 'mud-weapon-balance-'));
    if (options.output) mkdirSync(output, { recursive: true });
    const sandbox = join(output, 'mudlib');
    const put = (path, text) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text, 'utf8'); };
    const json = (path, data) => put(join(output, path), JSON.stringify(data, null, 2) + '\n');
    console.log('隔离兵器评测：' + output);
    const manifest = {
        format: 1, started: new Date().toISOString(), root, driver,
        commit: git(root, ['rev-parse', 'HEAD']), mudcore: git(join(root, 'mudcore'), ['rev-parse', 'HEAD']),
        driver_sha256: hash(readFileSync(driver)), parameters: {
            samples: options.samples, bouts: options.bouts, duration: options.duration, smoke: options.smoke,
            gametick_ms: 1000, heartbeat_ms: 1000, busy_observation_ms: 1000, probes,
        }, files: {}, probes: [],
    };
    // Deliberately exclude private wizard areas, deployed config, accounts and generated data.
    const excluded = /^(?:u|backup|bin|binaries|data|doc|docs|dump|fluffos|grant|help|log|ai|openspec|temp|version|www|tools)\//;
    const files = new Set([...git(root, ['ls-files', '-z']).split('\0'),
        ...git(root, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0'),
        ...git(join(root, 'mudcore'), ['ls-files', '-z']).split('\0').map(path => 'mudcore/' + path)]);
    for (const file of [...files].sort()) {
        if (!/\.(c|lpc|h)$/.test(file) || excluded.test(file) || !existsSync(join(root, file))
            || file.split('/').some(part => part === 'tests' || part.startsWith('.'))) continue;
        const source = readFileSync(join(root, file));
        manifest.files[file] = hash(source);
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        cpSync(join(root, file), join(sandbox, file));
    }
    const dictionary = readFileSync(join(root, 'data/e2c_dict.o'));
    manifest.files['data/e2c_dict.o'] = hash(dictionary);
    put(join(sandbox, 'data/e2c_dict.o'), dictionary);
    put(join(sandbox, 'adm/etc/wizlist'), '# Disposable players have no wizard privileges.\n');
    for (const name of ['master', 'actor', 'runner']) {
        const source = readFileSync(join(fixtures, name + '.lpc'), 'utf8');
        manifest.files['tools/tests/weapon_balance/' + name + '.lpc'] = hash(source);
        put(join(sandbox, 'tests', name + '.lpc'), source);
    }
    const template = readFileSync(join(fixtures, 'weapon.lpc'), 'utf8');
    manifest.files['tools/tests/weapon_balance/weapon.lpc'] = hash(template);
    for (const type of ['axe', 'hammer', 'spear', 'blade', 'staff', 'whip']) {
        put(join(sandbox, `tests/${type}.lpc`), template.replaceAll('AXE', type.toUpperCase()).replaceAll('init_axe', 'init_' + type));
    }
    const combatPath = join(sandbox, 'adm/daemons/combatd.c');
    const original = readFileSync(combatPath, 'utf8');
    if (probes) {
        const { changed, sites } = applyProbes(original);
        put(combatPath, changed);
        manifest.probes.push({ file: 'adm/daemons/combatd.c', before: hash(original), after: hash(changed), sites });
    }
    for (const file of ['tools/bench_weapon_balance.mjs', 'tools/tests/weapon_balance/statistics.mjs']) {
        manifest.files[file] = hash(readFileSync(join(root, file)));
    }
    manifest.source_changes = [...new Set([
        ...git(root, ['diff', 'HEAD', '--name-only', '-z']).split('\0'),
        ...git(root, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0'),
        ...git(join(root, 'mudcore'), ['diff', 'HEAD', '--name-only', '-z']).split('\0').map(file => 'mudcore/' + file),
    ])].filter(file => file in manifest.files).sort();
    mkdirSync(join(sandbox, 'log'), { recursive: true });
    put(join(sandbox, 'tests/options.json'), JSON.stringify(manifest.parameters));
    const port = await freePort();
    const config = ['name : Weapon Balance Benchmark', 'mud ip : 127.0.0.1', `port number : ${port}`,
        'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log', 'debug log file : debug.log',
        'master file : /tests/master', 'simulated efun file : /adm/single/simul_efun',
        'include directories : /include:/mudcore/include', 'global include file : <globals.h>',
        'gametick msec : 1000', 'heartbeat interval msec : 1000',
    ].join('\n') + '\n';
    put(join(sandbox, 'driver.cfg'), config);
    manifest.config = config;
    manifest.fingerprint = fingerprint(manifest);
    json('manifest.json', manifest);
    const began = Date.now();
    let result;
    try {
        result = await new Promise((done, reject) => {
            const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
            let text = '', pending = '', clients = [], connected = false;
            // Safety watchdog for an unresponsive isolated process, not a combat result.
            const timeout = (120 + options.samples * 2 + options.bouts * 12 * (options.duration + 3)) * 1000;
            const timer = setTimeout(() => { text += '\nBENCH WATCHDOG\n'; child.kill(); }, timeout);
            const cancel = () => { text += '\nBENCH CANCELLED\n'; child.kill(); };
            process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
            const receive = data => {
                const chunk = data.toString('utf8');
                text += chunk; pending += chunk;
                const lines = pending.split(/\r?\n/); pending = lines.pop();
                for (const line of lines) if (/BALANCE|FAIL:|error:|warning:/i.test(line)) console.log(line);
                if (!connected && text.includes('BALANCE WAITING') && text.includes('Initializations complete.')) {
                    connected = true;
                    clients = [0, 1].map(() => {
                        const client = createConnection({ host: '127.0.0.1', port });
                        client.on('data', () => {});
                        client.on('error', error => {
                            if (error.code === 'ECONNRESET' && /BALANCE (PASS|FAIL)/.test(text)) return;
                            text += '\nConnection error: ' + error.code; child.kill();
                        });
                        return client;
                    });
                }
            };
            child.stdout.on('data', receive); child.stderr.on('data', receive);
            const cleanup = () => {
                clearTimeout(timer); clients.forEach(client => client.destroy());
                process.removeListener('SIGINT', cancel); process.removeListener('SIGTERM', cancel);
            };
            child.once('error', error => { cleanup(); reject(error); });
            child.once('close', (code, signal) => { cleanup(); done({ code, signal, text, pid: child.pid }); });
        });
        put(join(output, 'driver-output.txt'), result.text);
        manifest.driver_version = result.text.match(/Version: (fluffos[^\r\n]*)/i)?.[1] ?? 'unknown';
        const rawPath = join(sandbox, 'log/events.jsonl');
        const records = existsSync(rawPath) ? readFileSync(rawPath, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
        json('records.json', records);
        const diagnostics = result.text + (existsSync(join(sandbox, 'log/debug.log')) ? readFileSync(join(sandbox, 'log/debug.log'), 'utf8') : '');
        validateRun({ result, diagnostics, records, parameters: manifest.parameters });
        json('summary.json', summarize(records));
        manifest.status = 'passed';
    } catch (error) {
        manifest.status = 'failed';
        manifest.error = String(error.message);
        throw error;
    } finally {
        manifest.finished = new Date().toISOString(); manifest.elapsed_seconds = (Date.now() - began) / 1000;
        manifest.process = result && { pid: result.pid, exit_code: result.code, signal: result.signal };
        json('manifest.json', manifest);
    }
    console.log(`完成：${manifest.elapsed_seconds.toFixed(2)} 秒；${options.smoke ? '烟雾（不用于平衡结论）' : '完整采样'}；${output}`);
    return output;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const options = parseArgs(process.argv.slice(2));
        if (options.help) console.log(help);
        else await runBatch(options);
    } catch (error) { console.error('兵器评测失败：' + error.message); process.exitCode = 1; }
}
