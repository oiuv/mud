// Run the real LPC implementation in a temporary MUDLIB. Never touch player data.
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer, createConnection } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const driver = resolve(process.argv[2] || join(root, 'bin/driver.exe'));
const sandbox = mkdtempSync(join(tmpdir(), 'mud-illusion-'));
console.log('Isolated illusion regression: ' + sandbox);
for (const dir of ['tests', 'include', 'log', 'data', 'adm/daemons', 'inherit/illusion', 'inherit/room', 'd/illusion', 'u/mudren', 'cmds/adm', 'cmds/test', 'cmds/std'])
    mkdirSync(join(sandbox, dir), { recursive: true });
cpSync(join(root, 'tools/tests/illusion'), join(sandbox, 'tests'), { recursive: true });
cpSync(join(root, 'inherit/illusion'), join(sandbox, 'inherit/illusion'), { recursive: true });
cpSync(join(root, 'adm/daemons/illusion_world_d.lpc'), join(sandbox, 'adm/daemons/illusion_world_d.lpc'));
cpSync(join(root, 'd/illusion'), join(sandbox, 'd/illusion'), { recursive: true });
cpSync(join(root, 'inherit/room/illusion_base.lpc'), join(sandbox, 'inherit/room/illusion_base.lpc'));
cpSync(join(root, 'adm/daemons/virtuald.c'), join(sandbox, 'adm/daemons/virtuald.c'));
for (const file of ['adm/daemons/commandd.c', 'cmds/adm/illusion.lpc', 'cmds/test/illusion_world.lpc', 'cmds/std/go.c'])
    cpSync(join(root, file), join(sandbox, file));
cpSync(join(root, 'u/mudren/maze.c'), join(sandbox, 'u/mudren/maze.c'));
cpSync(join(root, 'mudcore/include/ansi.h'), join(sandbox, 'include/ansi.h'));
cpSync(join(root, 'mudcore/include/type.h'), join(sandbox, 'include/type.h'));
for (const [name, body] of Object.entries({ 'legacy.c': '', 'prefer.c': '', 'prefer.lpc': '', 'iw.alias': 'illusion_world.lpc', 'old.alias': 'legacy.c', 'invalid.alias': 'does-not-exist' }))
    writeFileSync(join(sandbox, 'cmds/test', name), body + '\n', 'utf8');
cpSync(join(root, 'tools/tests/illusion/room_stub.lpc'), join(sandbox, 'tests/demon.c'));
// Compile the actual host movement implementation against a minimal data/room layer.
writeFileSync(join(sandbox, 'tests/mover.lpc'), 'inherit "/tests/room_stub";\n' + readFileSync(join(root, 'feature/move.c'), 'utf8') +
    '\nint logon() { enable_commands(); "/tests/master"->register_connection(this_object()); return 1; }\n', 'utf8');
for (const header of ['config.h', 'dbase.h', 'command.h']) writeFileSync(join(sandbox, 'include', header), '// test header\n', 'utf8');
// A deliberate temporary collision tests driver priority; do not duplicate source stems in the LIB.
writeFileSync(join(sandbox, 'tests/numeric.c'), 'inherit "/tests/room_stub";\nvarargs void create(int x, int y, int z) { setArea("test", x, y, z); set("preferred", "c"); }\n', 'utf8');
cpSync(join(sandbox, 'tests/numeric.c'), join(sandbox, 'tests/legacy_numeric.c'));
// Compile the exact edited entrance function without emulating the whole NPC/combat stack.
const zixuSource = readFileSync(join(root, 'adm/daemons/task/npc/zixu.c'), 'utf8');
writeFileSync(join(sandbox, 'tests/zixu_entrance.lpc'), '#include <ansi.h>\n#define MAZE "/u/mudren/maze"\n' +
    zixuSource.slice(zixuSource.indexOf('int ask_maze() {'), zixuSource.indexOf('int ask_mirror() {')), 'utf8');
cpSync(join(root, 'mudcore/system/kernel/simul_efun/json.c'), join(sandbox, 'tests/json.c'));
writeFileSync(join(sandbox, 'include/globals.h'), [
    '#define ROOM "/tests/room_stub"', '#define NPC_D "/tests/npc"',
    '#define CLASS_D(name) "/tests"',
    '#define ROOT_UID "Root"', '#define SIMUL_EFUN_OB "/tests/sefun"',
    '#define LOOK_CMD "/tests/room_stub"', '#define VOID_OB "/tests/room_stub"',
    '#define F_CLEAN_UP "/tests/room_stub"', '#define SECURITY_D "/tests/security"',
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
const result = await new Promise((done, reject) => {
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
