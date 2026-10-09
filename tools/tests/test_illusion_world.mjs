// Run the real LPC implementation in a temporary MUDLIB. Never touch player data.
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir, cpus, release, totalmem } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer, createConnection } from 'node:net';
import { runRollback } from './illusion_rollback.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2).filter(arg => !['--release', '--bench', '--rollback'].includes(arg));
const driver = resolve(args[0] || join(root, 'bin/driver.exe'));
const python = args[1] || join(root, process.platform === 'win32' ? 'ai/.venv/Scripts/python.exe' : 'ai/.venv/bin/python');
const sandbox = mkdtempSync(join(tmpdir(), 'mud-illusion-'));
console.log('Isolated illusion regression: ' + sandbox);
for (const dir of ['tests', 'include', 'log', 'data', 'adm/daemons', 'inherit/illusion', 'inherit/room', 'd/illusion', 'u/mudren', 'cmds/adm', 'cmds/test', 'cmds/std'])
    mkdirSync(join(sandbox, dir), { recursive: true });
cpSync(join(root, 'tools/tests/illusion'), join(sandbox, 'tests'), { recursive: true });
cpSync(join(root, 'inherit/illusion'), join(sandbox, 'inherit/illusion'), { recursive: true });
cpSync(join(root, 'adm/daemons/illusion_world_d.lpc'), join(sandbox, 'adm/daemons/illusion_world_d.lpc'));
cpSync(join(root, 'adm/daemons/illusion_content_d.lpc'), join(sandbox, 'adm/daemons/illusion_content_d.lpc'));
cpSync(join(root, 'adm/daemons/ai_client_d.c'), join(sandbox, 'adm/daemons/ai_client_d.c'));
cpSync(join(root, 'mudcore/include/socket.h'), join(sandbox, 'include/socket.h'));
cpSync(join(root, 'd/illusion'), join(sandbox, 'd/illusion'), { recursive: true });
cpSync(join(root, 'inherit/room/illusion_base.lpc'), join(sandbox, 'inherit/room/illusion_base.lpc'));
cpSync(join(root, 'adm/daemons/virtuald.c'), join(sandbox, 'adm/daemons/virtuald.c'));
for (const file of ['adm/daemons/commandd.c', 'cmds/adm/illusion.lpc', 'cmds/adm/updateall.c', 'cmds/test/illusion_world.lpc', 'cmds/test/illusion_content.lpc', 'cmds/std/go.c'])
    cpSync(join(root, file), join(sandbox, file));
cpSync(join(root, 'u/mudren/maze.c'), join(sandbox, 'u/mudren/maze.c'));
cpSync(join(root, 'u/mudren/workroom.c'), join(sandbox, 'u/mudren/workroom.c'));
cpSync(join(root, 'inherit/room/vrm.c'), join(sandbox, 'inherit/room/vrm.c'));
cpSync(join(root, 'mudcore/inherit/vrm.c'), join(sandbox, 'tests/core_vrm.c'));
cpSync(join(root, 'mudcore/include/ansi.h'), join(sandbox, 'include/ansi.h'));
cpSync(join(root, 'mudcore/include/type.h'), join(sandbox, 'include/type.h'));
for (const [name, body] of Object.entries({ 'legacy.c': '', 'prefer.c': '', 'prefer.lpc': '', 'iw.alias': 'illusion_world.lpc', 'old.alias': 'legacy.c', 'invalid.alias': 'does-not-exist' }))
    writeFileSync(join(sandbox, 'cmds/test', name), body + '\n', 'utf8');
cpSync(join(root, 'tools/tests/illusion/room_stub.lpc'), join(sandbox, 'tests/demon.c'));
// Run the existing game quest contract and framework accounting without player saves.
mkdirSync(join(sandbox, 'adm/daemons/quest'), { recursive: true });
mkdirSync(join(sandbox, 'adm/daemons/task/npc'), { recursive: true });
cpSync(join(root, 'adm/daemons/quest/_2_demon.c'), join(sandbox, 'adm/daemons/quest/_2_demon.c'));
cpSync(join(root, 'tools/tests/illusion/room_stub.lpc'), join(sandbox, 'adm/daemons/task/npc/zixu.c'));
cpSync(join(root, 'mudcore/system/daemons/quest_d.c'), join(sandbox, 'tests/quest_daemon.c'));
cpSync(join(root, 'mudcore/inherit/user_quest.c'), join(sandbox, 'tests/user_quest.c'));
cpSync(join(root, 'mudcore/include/function_compat.h'), join(sandbox, 'include/function_compat.h'));
const fileSource = readFileSync(join(root, 'mudcore/system/kernel/simul_efun/file.c'), 'utf8');
const fileStart = fileSource.indexOf('int file_exists(string file) {');
const fileEnd = fileSource.indexOf('string *read_lines(');
const lpcStart = fileSource.indexOf('string lpc_object_path(string path) {');
if (fileStart < 0 || fileEnd < fileStart || lpcStart < fileEnd)
    throw new Error('Cannot locate quest source-file identity helpers');
writeFileSync(join(sandbox, 'tests/quest_files.c'),
    fileSource.slice(fileStart, fileEnd) + fileSource.slice(lpcStart), 'utf8');
const preloadSource = readFileSync(join(root, 'adm/single/master/preload.c'), 'utf8');
writeFileSync(join(sandbox, 'tests/preload.lpc'), preloadSource.slice(
    preloadSource.indexOf('void preload(string file)'), preloadSource.indexOf('// 调试')), 'utf8');
writeFileSync(join(sandbox, 'tests/preload_lpc.lpc'), 'int loaded() { return 1; }\n', 'utf8');
writeFileSync(join(sandbox, 'tests/preload_c.c'), 'int loaded() { return 1; }\n', 'utf8');
// Compile the actual host movement implementation against a minimal data/room layer.
writeFileSync(join(sandbox, 'tests/mover.lpc'), 'inherit "/tests/room_stub";\ninherit "/tests/user_quest";\n' + readFileSync(join(root, 'feature/move.c'), 'utf8') +
    '\nvoid save() { add_temp("quest_saves", 1); }\n' +
    '\nint logon() { enable_commands(); master()->register_connection(this_object()); return 1; }\n', 'utf8');
// Verify the real host's room-info composition, not a hand-written expected payload.
const gmcpSource = readFileSync(join(root, 'feature/user_gmcp.c'), 'utf8');
const gmcpStart = gmcpSource.indexOf('void gmcp(string req) {');
if (gmcpStart < 0) throw new Error('Cannot locate host GMCP implementation');
writeFileSync(join(sandbox, 'tests/gmcp_user.lpc'),
    readFileSync(join(sandbox, 'tests/gmcp_user.lpc'), 'utf8') + '\n' + gmcpSource.slice(gmcpStart), 'utf8');
for (const header of ['config.h', 'dbase.h', 'command.h']) writeFileSync(join(sandbox, 'include', header), '// test header\n', 'utf8');
// A deliberate temporary collision tests driver priority; do not duplicate source stems in the LIB.
writeFileSync(join(sandbox, 'tests/numeric.c'), readFileSync(join(sandbox, 'tests/numeric.lpc'), 'utf8')
    .replace('set("preferred", "lpc")', 'set("preferred", "c")'), 'utf8');
cpSync(join(sandbox, 'tests/numeric.c'), join(sandbox, 'tests/legacy_numeric.c'));
writeFileSync(join(sandbox, 'tests/legacy_provider.lpc'),
    'varargs void create(int x, int y, int z) {}\nobject query_maze_room(string key) { return new("/tests/room_stub"); }\n', 'utf8');
// Compile the exact edited entrance function without emulating the whole NPC/combat stack.
const zixuSource = readFileSync(join(root, 'adm/daemons/task/npc/zixu.c'), 'utf8');
writeFileSync(join(sandbox, 'tests/zixu_entrance.lpc'), '#include <ansi.h>\n#define MAZE "/u/mudren/maze"\n' +
    zixuSource.slice(zixuSource.indexOf('int ask_maze() {'), zixuSource.indexOf('int ask_mirror() {')), 'utf8');
cpSync(join(root, 'mudcore/system/kernel/simul_efun/json.c'), join(sandbox, 'tests/json.c'));
cpSync(join(root, 'adm/single/simul_efun/fluffos.c'), join(sandbox, 'tests/fluffos.c'));
let backendOutput = '';
const backend = spawn(python, [join(root, 'ai/tests/world_fixture.py'), sandbox], { cwd: root, windowsHide: true });
backend.stdout.on('data', data => { backendOutput += data; });
backend.stderr.on('data', data => { backendOutput += data; });
const backendDone = new Promise((done, reject) => { backend.on('error', reject); backend.on('close', done); });
let result;
try {
const readyDeadline = Date.now() + 10000;
while (!existsSync(join(sandbox, 'world-ready.json')) && Date.now() < readyDeadline && backend.exitCode === null)
    await new Promise(done => setTimeout(done, 20));
if (!existsSync(join(sandbox, 'world-ready.json'))) throw new Error('World fixture failed: ' + backendOutput);
const backendPort = JSON.parse(readFileSync(join(sandbox, 'world-ready.json'), 'utf8')).port;
writeFileSync(join(sandbox, 'include/globals.h'), [
    '#define AI_SERVER_PORT ' + backendPort, '#define AI_NPC_D "/tests/npc"',
    '#define ROOM "/tests/room_stub"', '#define NPC_D "/tests/npc"',
    '#define CORE_VRM "/tests/core_vrm"',
    '#define CLASS_D(name) "/tests"',
    '#define ROOT_UID "Root"', '#define SIMUL_EFUN_OB "/tests/sefun"',
    '#define LOOK_CMD "/tests/room_stub"', '#define VOID_OB "/tests/room_stub"',
    '#define F_CLEAN_UP "/tests/room_stub"', '#define SECURITY_D "/tests/security"',
    '#define CORE_SAVE "/tests/quest_support"', '#define QUEST_DIR "/adm/daemons/quest/"',
    '#define DATA_DIR "/data/"', '#define QUEST_SIZE 20', '#define GIFT_D "/tests/quest_support"',
].join('\n') + '\n', 'utf8');
const socket = createServer();
await new Promise(ready => socket.listen(0, '127.0.0.1', ready));
const port = socket.address().port;
await new Promise(done => socket.close(done));
writeFileSync(join(sandbox, 'driver.cfg'), [
    'name : Illusion Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'),
    'log directory : /log', 'debug log file : debug.log',
    'include directories : /include', 'global include file : <globals.h>',
    'master file : /tests/master', 'simulated efun file : /tests/sefun',
    'gametick msec : 100',
].join('\n') + '\n', 'utf8');
result = await new Promise((done, reject) => {
    const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
    let output = '';
    let connected = false;
    const clients = [];
    const timer = setTimeout(() => child.kill(), 120000);
    child.stdout.on('data', data => {
        output += data;
        if (!connected && output.includes('ILLUSION READY')) {
            connected = true;
            for (let i = 0; i < 2; i++) {
                const client = createConnection({ host: '127.0.0.1', port });
                client.on('data', () => {});
                client.on('error', error => {
                    if (error.code !== 'ECONNRESET') output += '\nClient error: ' + error.message;
                });
                clients.push(client);
            }
        }
    });
    child.stderr.on('data', data => { output += data; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); for (const client of clients) client.destroy(); done({ code, output }); });
});
if (result.code === 0 && result.output.includes('ILLUSION PASS')) {
    writeFileSync(join(sandbox, 'restart.cfg'), readFileSync(join(sandbox, 'driver.cfg'), 'utf8')
        .replace('master file : /tests/master', 'master file : /tests/restart'), 'utf8');
    const restart = await new Promise((done, reject) => {
        const child = spawn(driver, ['restart.cfg'], { cwd: sandbox, windowsHide: true });
        let output = '';
        const timer = setTimeout(() => child.kill(), 20000);
        child.stdout.on('data', data => { output += data; });
        child.stderr.on('data', data => { output += data; });
        child.on('error', error => { clearTimeout(timer); reject(error); });
        child.on('close', code => { clearTimeout(timer); done({ code, output }); });
    });
    writeFileSync(join(sandbox, 'driver-restart-output.txt'), restart.output, 'utf8');
    if (restart.code !== 0 || !restart.output.includes('ILLUSION RESTART PASS'))
        throw new Error('Cold driver restart failed: ' + restart.output.slice(-2000));
    console.log('ILLUSION RESTART PASS');
}
} finally {
    writeFileSync(join(sandbox, 'world-stop'), 'stop', 'utf8');
    const stopTimer = setTimeout(() => backend.kill(), 5000);
    const code = await backendDone;
    clearTimeout(stopTimer);
    writeFileSync(join(sandbox, 'world-output.txt'), backendOutput, 'utf8');
    console.log(backendOutput.split('\n').filter(line => /ILLUSION|Error|Traceback/.test(line)).join('\n'));
    if (code !== 0) process.exitCode = 1;
}
writeFileSync(join(sandbox, 'driver-output.txt'), result.output, 'utf8');
console.log(result.output.split('\n').filter(line => /ILLUSION|FAIL:|error:/.test(line)).join('\n'));
if (result.code !== 0 || !result.output.includes('ILLUSION PASS'))
    throw new Error('Driver regression failed; see ' + join(sandbox, 'driver-output.txt'));
const scan = JSON.parse(readFileSync(join(sandbox, 'data/map-scan.json'), 'utf8'));
if (scan.chunks !== 76 || scan.reverse_chunks !== 76 || Object.keys(scan.digests).length !== 76)
    throw new Error('Missing reproducible map scan artifacts');
const previews = readdirSync(join(sandbox, 'data')).filter(name => /^preview-.*\.json$/.test(name));
for (const name of previews) {
    const report = JSON.parse(readFileSync(join(sandbox, 'data', name), 'utf8'));
    if (!report.connectivity.ok || report.connectivity.rooms !== Object.keys(report.cells).length ||
        report.ascii !== readFileSync(join(sandbox, 'data', name.replace(/\.json$/, '.txt')), 'utf8'))
        throw new Error('Invalid preview artifact: ' + name);
}
console.log('ILLUSION artifacts: ' + join(sandbox, 'data') + ' (' + previews.length + ' map previews)');
if (process.argv.includes('--bench')) {
    // A fresh process isolates measurements from the regression and real game.
    writeFileSync(join(sandbox, 'bench.cfg'), readFileSync(join(sandbox, 'driver.cfg'), 'utf8')
        .replace('master file : /tests/master', 'master file : /tests/benchmark'), 'utf8');
    const bench = await new Promise((done, reject) => {
        const child = spawn(driver, ['bench.cfg'], { cwd: sandbox, windowsHide: true });
        let output = '';
        const timer = setTimeout(() => child.kill(), 120000);
        child.stdout.on('data', data => { output += data; });
        child.stderr.on('data', data => { output += data; });
        child.on('error', error => { clearTimeout(timer); reject(error); });
        child.on('close', code => { clearTimeout(timer); done({ code, output }); });
    });
    writeFileSync(join(sandbox, 'driver-bench-output.txt'), bench.output, 'utf8');
    if (bench.code !== 0 || !bench.output.includes('ILLUSION PASS'))
        throw new Error('Performance regression failed: ' + bench.output.slice(-3000));
    const report = JSON.parse(readFileSync(join(sandbox, 'data/benchmark.json'), 'utf8'));
    report.machine = { platform: process.platform, release: release(), arch: process.arch,
        cpu: cpus()[0]?.model, logicalCpus: cpus().length, totalMemoryBytes: totalmem(), driver };
    writeFileSync(join(sandbox, 'data/benchmark.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log('BENCHMARK ' + JSON.stringify(report));
    console.log('BENCHMARK artifacts: ' + join(sandbox, 'data/benchmark.json'));
}
if (process.argv.includes('--release')) {
    writeFileSync(join(sandbox, 'release.cfg'), readFileSync(join(sandbox, 'driver.cfg'), 'utf8')
        .replace('master file : /tests/master', 'master file : /tests/release_scan')
        .replace('gametick msec : 100', 'gametick msec : 10'), 'utf8');
    const release = await new Promise((done, reject) => {
        const child = spawn(driver, ['release.cfg'], { cwd: sandbox, windowsHide: true });
        let output = '';
        // Fail on a stuck sweep, not merely on a healthy long-running batch.
        let timer = setTimeout(() => child.kill(), 180000);
        child.stdout.on('data', data => {
            output += data;
            if (data.toString().includes('RELEASE SEED')) {
                clearTimeout(timer);
                timer = setTimeout(() => child.kill(), 180000);
            }
            for (const line of data.toString().split('\n'))
                if (/RELEASE|FAIL:|error:/.test(line)) console.log(line);
        });
        child.stderr.on('data', data => { output += data; });
        child.on('error', error => { clearTimeout(timer); reject(error); });
        child.on('close', code => { clearTimeout(timer); done({ code, output }); });
    });
    writeFileSync(join(sandbox, 'driver-release-output.txt'), release.output, 'utf8');
    if (release.code !== 0 || !release.output.includes('ILLUSION PASS'))
        throw new Error('Release geography regression failed: ' + release.output.slice(-3000));
    const report = JSON.parse(readFileSync(join(sandbox, 'data/release-scan.json'), 'utf8'));
    if (Object.keys(report.seeds).length !== 20 || report.failures ||
        Object.values(report.seeds).some(seed => seed.chunks !== 262 || seed.shuffled_chunks !== 262))
        throw new Error('Incomplete release sweep');
    console.log('RELEASE artifacts: ' + join(sandbox, 'data/release-scan.json'));
}
if (process.argv.includes('--rollback')) await runRollback({ root, sandbox, driver });
