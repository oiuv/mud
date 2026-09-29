// Optional real-driver rollback phase. Called only with the harness's fresh temp MUDLIB.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { createConnection, createServer } from 'node:net';

const baseline = '43c040408d8ed8bbc66a8cba6108be129439d598';

export async function runRollback({ root, sandbox, driver }) {
    const temporaryRoot = realpathSync(tmpdir());
    const target = realpathSync(sandbox);
    if (!basename(target).startsWith('mud-illusion-') ||
        dirname(target) !== temporaryRoot || target === realpathSync(root))
        throw new Error('Rollback requires the harness-created immediate temp directory');
    const inside = path => {
        const suffix = relative(target, resolve(path));
        if (!suffix || suffix === '..' || suffix.startsWith('..' + sep) || isAbsolute(suffix))
            throw new Error('Rollback path is outside the exact temporary MUDLIB');
        return path;
    };
    const local = path => inside(join(target, path));
    const hashes = (directory, prefix = '') => {
        const result = {};
        for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
            const path = inside(join(directory, entry.name));
            const key = prefix + entry.name;
            if (entry.isDirectory()) Object.assign(result, hashes(path, key + '/'));
            else if (entry.isFile()) result[key] = createHash('sha256').update(readFileSync(path)).digest('hex');
            else throw new Error('Unexpected link or special file in rollback fixture');
        }
        return result;
    };
    const snapshot = () => ({
        world: hashes(local('data/illusion_world')),
        database: hashes(local('ai-data')),
    });
    const same = (expected, actual, label) => {
        if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error(label);
    };
    const run = async name => {
        const listener = createServer();
        await new Promise(ready => listener.listen(0, '127.0.0.1', ready));
        const port = listener.address().port;
        await new Promise(done => listener.close(done));
        writeFileSync(local(name + '.cfg'), readFileSync(local('driver.cfg'), 'utf8')
            .replace('master file : /tests/master', 'master file : /tests/' + name)
            .replace(/port number : \d+/, 'port number : ' + port));
        const result = await new Promise((done, reject) => {
            const child = spawn(driver, [name + '.cfg'], { cwd: target, windowsHide: true });
            let output = '', connected = false;
            const clients = [];
            const timer = setTimeout(() => child.kill(), 30000);
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
            child.on('close', code => {
                clearTimeout(timer);
                for (const client of clients) client.destroy();
                done({ code, output });
            });
        });
        writeFileSync(local(name + '-output.txt'), result.output);
        const marker = 'ILLUSION ' + name.toUpperCase().replaceAll('_', ' ') + ' PASS';
        if (result.code !== 0 || !result.output.includes(marker))
            throw new Error(name + ' failed: ' + result.output.slice(-4000));
        console.log(result.output.split('\n').filter(line => /ILLUSION|FAIL:/.test(line)).join('\n'));
        return JSON.parse(readFileSync(local('data/' + name.replaceAll('_', '-') + '.json'), 'utf8'));
    };

    // The parent awaits fixture shutdown before calling us: SQLite and publisher are quiescent.
    const beforeDrain = snapshot();
    if (!Object.keys(beforeDrain.world).some(name => name.startsWith('content/')) ||
        !beforeDrain.database['world_content.db']) throw new Error('Rollback needs persisted prose and SQLite');
    // City behavior is outside this fixture; provide the real exit's destination object.
    mkdirSync(local('d/city'), { recursive: true });
    cpSync(local('tests/room_stub.lpc'), local('d/city/wumiao2.c'));
    const drain = await run('rollback_drain');
    const saved = snapshot();
    // Entry/AI switches intentionally change; every other persisted asset must remain identical.
    const { 'runtime.json': oldSettings, ...oldWorld } = beforeDrain.world;
    const { 'runtime.json': newSettings, ...newWorld } = saved.world;
    if (!oldSettings || !newSettings) throw new Error('Missing persistent switches');
    same(oldWorld, newWorld, 'Drain changed saved world content');
    same(beforeDrain.database, saved.database, 'Drain changed stopped AI database');
    mkdirSync(local('rollback-backup'));
    cpSync(local('data/illusion_world'), local('rollback-backup/world'), { recursive: true });
    cpSync(local('ai-data'), local('rollback-backup/database'), { recursive: true });
    same(saved, {
        world: hashes(local('rollback-backup/world')),
        database: hashes(local('rollback-backup/database')),
    }, 'Rollback backup differs from quiescent originals');

    // Keep retired code recoverable; never delete or move anything in the checkout.
    const retired = [
        'd/illusion', 'inherit/illusion', 'inherit/room/illusion_base.lpc',
        'adm/daemons/illusion_world_d.lpc', 'adm/daemons/illusion_content_d.lpc',
        'cmds/adm/illusion.lpc', 'cmds/test/illusion_world.lpc', 'cmds/test/illusion_content.lpc',
        'adm/daemons/virtuald.c', 'u/mudren/maze.c', 'cmds/std/go.c',
        'tests/mover.lpc', 'tests/zixu_entrance.lpc',
    ];
    for (const path of retired) {
        const source = local(path), destination = local('rollback-retired/' + path);
        inside(realpathSync(source));
        mkdirSync(dirname(destination), { recursive: true });
        inside(realpathSync(dirname(destination)));
        if (existsSync(destination)) throw new Error('Refusing to overwrite retired fixture');
        renameSync(source, destination);
    }
    const historical = path => execFileSync('git', ['-C', root, 'show', baseline + ':' + path],
        { windowsHide: true, encoding: 'utf8', maxBuffer: 1024 * 1024 });
    const restored = {};
    for (const path of ['adm/daemons/virtuald.c', 'u/mudren/maze.c', 'cmds/std/go.c',
        'feature/move.c', 'adm/daemons/task/npc/zixu.c']) {
        const source = historical(path);
        restored[path] = createHash('sha256').update(source).digest('hex');
        mkdirSync(dirname(local(path)), { recursive: true });
        writeFileSync(local(path), source);
    }
    const entrance = readFileSync(local('adm/daemons/task/npc/zixu.c'), 'utf8');
    const start = entrance.indexOf('int ask_maze() {'), end = entrance.indexOf('int ask_mirror() {');
    if (start < 0 || end <= start) throw new Error('Historical NPC entrance boundaries changed');
    writeFileSync(local('tests/zixu_entrance.lpc'),
        'inherit "/tests/room_stub";\n#include <ansi.h>\n#define MAZE "/u/mudren/maze"\n' +
        entrance.slice(start, end) + '\nvoid init() { add_action("ask_maze", "rollback_enter"); }\n');
    writeFileSync(local('tests/mover.lpc'), 'inherit "/tests/room_stub";\n' +
        readFileSync(local('feature/move.c'), 'utf8') +
        '\nvoid run_legacy_entry() { command("rollback_enter"); }\n' +
        '\nint logon() { enable_commands(); master()->register_connection(this_object()); return 1; }\n');
    const legacy = await run('rollback_legacy');
    same(saved, snapshot(), 'Historical driver changed persisted new-world content');
    same(saved, {
        world: hashes(local('rollback-backup/world')),
        database: hashes(local('rollback-backup/database')),
    }, 'Rollback altered the backup');
    const report = { baseline, driver, sandbox: target, scope: 'isolated minimal host; no production rollback',
        drain, legacy, saved, restored, retired, preserved: true };
    writeFileSync(local('rollback-report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log('ILLUSION ROLLBACK PASS: ' + local('rollback-report.json'));
}
