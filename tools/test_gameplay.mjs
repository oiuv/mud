// Fixed, source-only regression suites. No production service, saves or model calls.
import { execFileSync, spawn } from 'node:child_process';
import { statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const suites = [
    { name: '交易与背包', script: 'tools/tests/test_commerce_audit.mjs', prefix: 'COMMERCE_AUDIT' },
    { name: '公共战斗', script: 'tools/tests/test_weapon_combat.mjs', prefix: 'WEAPON_COMBAT' },
    { name: '具体武学', script: 'tools/tests/test_martial_audit.mjs', prefix: 'MARTIAL_AUDIT' },
    { name: 'AI LPC 通信', script: 'ai/scripts/verify_lpc.mjs', prefix: 'AI LPC', python: true },
    { name: 'NPC 重连', script: 'ai/scripts/verify_npc_reconnect.mjs', prefix: 'AI NPC RECONNECT', reconnect: true },
];

const help = `用法：node tools/test_gameplay.mjs [--driver <path>] [--python <path>] [--help]

顺序运行交易与背包、公共战斗、具体武学、AI LPC 通信和 NPC 重连五组隔离回归。
默认驱动：Windows 为 bin/driver.exe，其他平台为 bin/driver。
默认 Python：ai/.venv/Scripts/python.exe（Windows）或 ai/.venv/bin/python。
显式相对路径以当前目录为准；含空格的路径请加引号。

需要 Node.js 18+、Git、已初始化的 mudcore、已编译的 FluffOS 和已安装依赖的 AI Python 环境。
只创建临时 MUDLIB、随机本机端口和日志，不连接正式服、不读写玩家存档、不调用模型。
各组日志留在其输出的系统临时目录，不自动删除。此入口不是全库覆盖或全量编译。
普通失败继续其他组，任一失败或结果不完整返回非零；中断后不启动下一组，等待当前组退出。
原测试命令仍可单独使用；本入口不运行旧代码负对照或性能测试。
`;

export function parseArgs(args, cwd = process.cwd(), platform = process.platform) {
    const options = {
        driver: join(root, 'bin', platform === 'win32' ? 'driver.exe' : 'driver'),
        python: join(root, 'ai/.venv', platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'),
        help: false,
    };
    const seen = new Set();
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!['--driver', '--python', '--help'].includes(arg)) throw new Error('未知参数：' + arg);
        if (seen.has(arg)) throw new Error('重复参数：' + arg);
        seen.add(arg);
        if (arg === '--help') options.help = true;
        else {
            const value = args[++i];
            if (!value || value.startsWith('--')) throw new Error(arg + ' 需要文件路径');
            options[arg.slice(2)] = resolve(cwd, value);
        }
    }
    return options;
}

export function preflight(options, repository = root, runGit = execFileSync) {
    const required = [
        [options.driver, '请先编译驱动，或使用 --driver 指定可执行文件'],
        [options.python, '请准备 AI Python 环境，或使用 --python 指定解释器'],
        ...suites.map(suite => [join(repository, suite.script), '请检查仓库测试文件是否完整']),
        ...['include/socket.h', 'include/ansi.h', 'system/kernel/simul_efun/json.c'].map(file =>
            [join(repository, 'mudcore', file), '请执行 git submodule update --init']),
    ];
    for (const [file, hint] of required) {
        let isFile = false;
        try { isFile = statSync(file).isFile(); } catch { /* Report a useful prerequisite error below. */ }
        if (!isFile) throw new Error(`缺少文件：${file}\n${hint}`);
    }
    try {
        runGit('git', ['--version'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
    } catch {
        throw new Error('Git 不可用；请安装 Git 并确认 PATH。');
    }
}

export function suiteArgs(suite, options) {
    return [resolve(root, suite.script), options.driver, ...(suite.python ? [options.python] : [])];
}

export function parseResult(suite, output, code, signal = null, error = null) {
    const lines = output.split(/\r?\n/).map(line => line.trim());
    const prefix = suite.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = suite.reconnect
        ? new RegExp(`^${prefix} PASS: (\\d+) checks$`)
        : new RegExp(`^${prefix} CHECKS: (\\d+) FAILURES: (\\d+)$`);
    const matches = lines.map(line => line.match(pattern)).filter(Boolean);
    const counts = matches.map(match => [Number(match[1]), suite.reconnect ? 0 : Number(match[2])]);
    const valid = counts.length > 0 && counts.every(([checks, failures]) =>
        Number.isSafeInteger(checks) && checks > 0 && Number.isSafeInteger(failures)
        && failures >= 0 && failures <= checks
        && checks === counts[0][0] && failures === counts[0][1]);
    const checks = valid ? counts[0][0] : null;
    const failures = valid ? counts[0][1] : null;
    const passed = suite.reconnect ? matches.length > 0 : lines.includes(suite.prefix + ' PASS');
    const failed = lines.includes(suite.prefix + ' FAIL');
    const evidence = lines.find(line => /^Isolated .+: /.test(line))?.replace(/^Isolated .+: /, '') ?? null;
    const reasons = [];
    if (error) reasons.push('启动失败：' + error);
    if (signal) reasons.push('信号终止：' + signal);
    if (code !== 0) reasons.push('退出码：' + (code ?? '未知'));
    if (!valid) reasons.push('检查数量摘要缺失或冲突');
    if (!passed || failed) reasons.push('缺少成功标记或存在失败标记');
    if (failures > 0) reasons.push(`${failures} 项检查失败`);
    return { ok: reasons.length === 0, checks, failures, evidence, reason: reasons.join('；') };
}

export function executeSuite(suite, options, write) {
    return new Promise(resolveDone => {
        const child = spawn(process.execPath, suiteArgs(suite, options), { cwd: root, windowsHide: true });
        let output = '', error = null;
        for (const stream of [child.stdout, child.stderr]) {
            stream.setEncoding('utf8');
            stream.on('data', text => { output += text; write(text); });
        }
        child.on('error', failure => { error = failure.message; });
        child.on('close', (code, signal) => resolveDone({ output, code, signal, error }));
    });
}

// Injectable execution is for Node unit tests only; the CLI always uses the fixed suites above.
export async function runSuites(options, {
    selected = suites, execute = executeSuite, write = text => process.stdout.write(text), signal,
} = {}) {
    const started = performance.now();
    const results = [];
    for (const suite of selected) {
        if (signal?.aborted) break;
        write(`\n[${results.length + 1}/${selected.length}] ${suite.name}\n`);
        write([process.execPath, ...suiteArgs(suite, options)].map(arg => JSON.stringify(arg)).join(' ') + '\n');
        const start = performance.now();
        let result;
        try {
            const child = await execute(suite, options, write);
            result = parseResult(suite, child.output, child.code, child.signal, child.error);
        } catch (error) {
            result = parseResult(suite, '', null, null, error.message);
        }
        results.push({ ...result, name: suite.name, milliseconds: performance.now() - start });
        if (!result.ok) write(`\n${suite.name}：${result.reason}\n`);
    }
    const cancelled = Boolean(signal?.aborted);
    write('\n回归汇总（检查数 / 失败数 / 耗时）\n');
    for (const result of results) {
        write(`${result.ok ? '通过' : '失败'} | ${result.name} | ${result.checks ?? '未知'} / `
            + `${result.failures ?? '未知'} / ${(result.milliseconds / 1000).toFixed(2)}s\n`);
        if (result.evidence) write(`  证据目录：${result.evidence}\n`);
    }
    for (const suite of selected.slice(results.length)) write(`未运行 | ${suite.name}\n`);
    const checks = results.reduce((sum, result) => sum + (result.checks ?? 0), 0);
    const failures = results.reduce((sum, result) => sum + (result.failures ?? 0), 0);
    const unknown = results.filter(result => result.checks === null).length;
    const ok = !cancelled && results.length === selected.length && results.every(result => result.ok);
    const exitCode = cancelled ? (signal.reason === 'SIGTERM' ? 143 : 130) : ok ? 0 : 1;
    write(`总结果：${cancelled ? '已中断' : ok ? '通过' : '失败'}；`
        + `${results.filter(result => result.ok).length}/${selected.length} 组通过；`
        + `已知检查 ${checks} 项，已知失败 ${failures} 项，未知计数组 ${unknown}；`
        + `总耗时 ${((performance.now() - started) / 1000).toFixed(2)}s\n`);
    return { exitCode, results, checks, failures, unknown };
}

export async function main(args = process.argv.slice(2)) {
    let options;
    try {
        options = parseArgs(args);
        if (options.help) { process.stdout.write(help); return 0; }
        preflight(options);
    } catch (error) {
        console.error(error.message + '\n使用 --help 查看用法。');
        return 1;
    }
    const controller = new AbortController();
    const cancel = name => {
        if (!controller.signal.aborted) {
            controller.abort(name);
            console.error('\n已收到中断；不启动后续组，等待当前隔离测试退出并清理。');
        }
    };
    const interrupt = () => cancel('SIGINT');
    const terminate = () => cancel('SIGTERM');
    process.on('SIGINT', interrupt);
    process.on('SIGTERM', terminate);
    try {
        return (await runSuites(options, { signal: controller.signal })).exitCode;
    } finally {
        process.off('SIGINT', interrupt);
        process.off('SIGTERM', terminate);
    }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    process.exitCode = await main();
}
