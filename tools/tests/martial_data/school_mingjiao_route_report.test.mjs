// Synthetic evidence archives only. No driver, live server, model, or real sample is created here.
import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createSeries, digest, recordSample } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { createSandbox } from './execution.mjs';
import { mingjiaoRouteConditions, mingjiaoRouteSourcePaths } from './school_mingjiao_route_cases.mjs';
import { readMingjiaoRoute, mingjiaoRouteMarkdown } from './school_mingjiao_route_report.mjs';
import { readScenes, sceneMarkdown } from './school_scene_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const readSource = path => readFileSync(join(root, path));
const source = Object.fromEntries(mingjiaoRouteSourcePaths.map(path => [path, readSource(path)]));
const catalog = { source_fingerprint: 'a'.repeat(64), dictionary_sha256: 'b'.repeat(64),
    skills: ['force', 'parry', 'unarmed', 'dodge'].map(id => ({ id, path: 'kungfu/skill/' + id + '.c',
        sha256: sha256(source['kungfu/skill/' + id + '.c']), entries: [] })) };
const cases = mingjiaoRouteConditions(catalog, readSource, { smoke: true });
let snapshot;
const put = (path, bytes) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes); };
const save = (path, value) => put(path, JSON.stringify(value, null, 2) + '\n');

function applyProbe(original, probe) {
    for (const site of probe.sites) {
        const anchor = Array.isArray(site) ? site[0] : site.anchor;
        const insert = Array.isArray(site) ? site[1] : site.insert;
        assert.equal(original.split(anchor).length, 2);
        original = original.replace(anchor, site.replacement ?? (Array.isArray(site) || site.position === 'before'
            ? insert + anchor : anchor + insert));
    }
    return original;
}

// An error envelope exercises unknown reporting and the immutable archive checks.
// It is explicitly not a successful gameplay fixture or evidence of any door effect.
function archive(condition = cases[0], { legacy = false } = {}) {
    snapshot ??= createSandbox(root);
    const directory = mkdtempSync(join(tmpdir(), 'mud-route-report-synthetic-'));
    const run = join(directory, 'runs', 'attempt-synthetic');
    const driver = { path: 'synthetic-only-driver.exe', sha256: 'c'.repeat(64), version: 'fluffos synthetic-only' };
    const sourceFiles = { ...snapshot.files }, fusionPath = 'cmds/skill/yanlian.c';
    const fusion = snapshot.probes.filter(p => p.path === fusionPath);
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    // Historical 15/48 shape only: still an explicitly synthetic diagnostic archive,
    // not an executable historical MUDLIB or evidence of a completed route.
    if (legacy) delete sourceFiles['tools/tests/martial_data/jiuyang_fusion_receivers.h'];
    const execution = { collection: 'school-scene', driver, node: process.version,
        source_files: sourceFiles, probes: legacy ? snapshot.probes.filter(p => p.path !== fusionPath) : snapshot.probes, gametick_ms: 1000,
        heartbeat_ms: 1000, smoke: true, injected_fault: null };
    const manifest = createSeries(directory, {
        inventory: { source_fingerprint: catalog.source_fingerprint, versions: { driver } }, catalog,
        conditions: [condition], execution, sceneEntries: [condition.parameters.source_entry],
    });
    save(join(directory, 'catalog.json'), catalog);
    for (const path of new Set([...mingjiaoRouteSourcePaths, ...execution.probes.map(p => p.path)])) {
        const probe = execution.probes.find(p => p.path === path);
        put(join(run, 'mudlib', path), probe ? applyProbe(readSource(path).toString('utf8'), probe) : readSource(path));
    }
    for (const name of ['runner', 'route_observer', 'teaching_actor', 'actor', 'master'])
        put(join(run, 'mudlib/tests', name + '.lpc'), readSource('tools/tests/martial_data/' + name + '.lpc'));
    for (const name of ['actor', 'master'])
        put(join(run, 'mudlib/tests/base_' + name + '.lpc'), readSource('tools/tests/weapon_balance/' + name + '.lpc'));
    if (!legacy) put(join(run, 'mudlib/tests/jiuyang_fusion_receivers.h'),
        readSource('tools/tests/martial_data/jiuyang_fusion_receivers.h'));
    const raw = { kind: 'sample', condition_id: condition.id, index: 0, method: 'scene',
        outcome: 'error', reason: 'synthetic diagnostic, not a gameplay sample', elapsed: 0.01 };
    recordSample(directory, manifest, { condition_id: condition.id, index: 0,
        outcome: raw.outcome, reason: raw.reason, raw });
    const jobs = [{ condition_id: condition.id, index: 0 }];
    save(join(run, 'request.json'), { fingerprint: manifest.fingerprint, created: '2026-10-14T00:00:00.000Z',
        jobs, interrupt_after: null });
    save(join(run, 'mudlib/tests/options.json'), { jobs: [{ ...jobs[0], method: condition.method,
        parameters: condition.parameters }], fault: null });
    put(join(run, 'mudlib/log/events.jsonl'), JSON.stringify(raw) + '\n');
    const output = 'Version: fluffos synthetic-only\nDATA COMPLETE\n';
    put(join(run, 'driver-output.txt'), output);
    save(join(run, 'process.json'), { pid: 12345, driver: driver.path, started: '2026-10-14T00:00:00.000Z' });
    save(join(run, 'result.json'), { elapsed_seconds: 0.01, process: { pid: 12345, code: 0, signal: null },
        interrupted: false, validation_errors: [], incomplete_bytes: 0, imported: 1,
        driver_output_sha256: sha256(output) });
    return { directory, run, manifest, raw, condition };
}

test('route archive reader preserves diagnostic unknown instead of inventing zero resources or passage', () => {
    const f = archive(), report = readMingjiaoRoute(f.directory);
    assert.equal(report.collection_group, 'mingjiao-route'); assert.equal(report.smoke, true);
    assert.equal(report.conditions.length, 1); assert.equal(report.conditions[0].effects.unknown, 1);
    assert.equal(report.conditions[0].effects.validated, 0);
    assert.equal(report.runs[0].process.code, 0); assert.equal(report.runs[0].process.signal, null);
    assert.equal(report.evidence_digest, digest([[f.condition.id, 0, digest(f.raw)]]));
    const md = mingjiaoRouteMarkdown(report);
    assert.equal(readScenes(f.directory).kind, 'mingjiao-route');
    assert.equal(sceneMarkdown(report), md, '共享场景入口必须委派同一专用渲染器');
    assert.match(md, /仅烟雾/); assert.match(md, /observed 只表示/);
    assert.match(md, /go out在0号甬道拒绝/); assert.match(md, /不计算DPS/);
    assert.doesNotMatch(md, /0DPS|全量覆盖/);
    assert.match(md, /不表示已逃离密道/);
});

test('route reader supports the original 15/48 and exact fusion 16/65 archive shapes without inventing native results', () => {
    for (const legacy of [true, false]) {
        const f = archive(cases[0], { legacy }), execution = f.manifest.identity.execution;
        assert.equal(execution.probes.length, legacy ? 15 : 16);
        assert.equal(execution.probes.reduce((n, p) => n + p.sites.length, 0), legacy ? 48 : 65);
        const header = 'tools/tests/martial_data/jiuyang_fusion_receivers.h';
        assert.equal(Object.hasOwn(execution.source_files, header), !legacy);
        assert.equal(existsSync(join(f.run, 'mudlib/tests/jiuyang_fusion_receivers.h')), !legacy);
        if (!legacy) assert.equal(sha256(readFileSync(join(f.run, 'mudlib/tests/jiuyang_fusion_receivers.h'))),
            execution.source_files[header]);
        const report = readMingjiaoRoute(f.directory);
        assert.equal(report.conditions[0].effects.unknown, 1);
        assert.equal(report.conditions[0].effects.validated, 0);
    }
});

test('route reader rejects resealed wrong fusion paths, sites, anchors, descriptors and extra probes', () => {
    const f = archive(), manifestPath = join(f.directory, 'series.json');
    const original = JSON.parse(readFileSync(manifestPath));
    const changed = edit => {
        const m = structuredClone(original); edit(m.identity.execution);
        m.fingerprint = digest(m.identity); save(manifestPath, m);
    };
    const fusion = e => e.probes.find(p => p.path === 'cmds/skill/yanlian.c');
    for (const [edit, error] of [
        [e => fusion(e).path = 'cmds/skill/not-yanlian.c', /原观察器数量/],
        [e => e.probes.push(structuredClone(fusion(e))), /融合观察器重复/],
        [e => e.probes.push({ ...structuredClone(fusion(e)), path: 'cmds/skill/extra.c' }), /原观察器数量/],
        [e => fusion(e).sites.pop(), /融合观察点数量/],
        [e => fusion(e).sites[0].anchor += 'changed', /不能逆还原|原源码摘要/],
        [e => fusion(e).sites[0].replacement += 'changed', /探针锚点不唯一/],
        [e => fusion(e).sites[0].original_line++, /融合探针完整声明/],
        [e => fusion(e).sites[0].removal.anchor_sha256 = '0'.repeat(64), /融合探针完整声明/],
        [e => fusion(e).unexpected = true, /融合探针完整声明/],
        [e => e.probes[0].path = 'adm/daemons/unknown.c', /原观察器路径/],
    ]) {
        changed(edit); assert.throws(() => readMingjiaoRoute(f.directory), error);
    }
    save(manifestPath, original);
    assert.equal(readMingjiaoRoute(f.directory).conditions[0].effects.unknown, 1);
});

test('new route archives require frozen actual fusion header and actual inverse source bytes', () => {
    const f = archive(), manifestPath = join(f.directory, 'series.json');
    const original = JSON.parse(readFileSync(manifestPath));
    const headerPath = join(f.run, 'mudlib/tests/jiuyang_fusion_receivers.h');
    const header = readFileSync(headerPath), sourcePath = join(f.run, 'mudlib/cmds/skill/yanlian.c');
    const sourceBytes = readFileSync(sourcePath), sourceKey = 'tools/tests/martial_data/jiuyang_fusion_receivers.h';
    for (const edit of [e => delete e.source_files[sourceKey], e => e.source_files[sourceKey] = '0'.repeat(64),
        e => e.source_files['cmds/skill/yanlian.c'] = '0'.repeat(64)]) {
        const m = structuredClone(original); edit(m.identity.execution);
        m.fingerprint = digest(m.identity); save(manifestPath, m);
        assert.throws(() => readMingjiaoRoute(f.directory), /接收头未冻结|夹具副本改变|原源码摘要/);
    }
    save(manifestPath, original);
    put(headerPath, Buffer.concat([header, Buffer.from('// changed synthetic header\n')]));
    assert.throws(() => readMingjiaoRoute(f.directory), /夹具副本改变/);
    unlinkSync(headerPath);
    assert.throws(() => readMingjiaoRoute(f.directory), /ENOENT/);
    put(headerPath, header);
    put(sourcePath, Buffer.concat([sourceBytes, Buffer.from('// changed synthetic source\n')]));
    assert.throws(() => readMingjiaoRoute(f.directory), /冻结副本改变/);
    put(sourcePath, sourceBytes);
    assert.equal(readMingjiaoRoute(f.directory).conditions[0].effects.unknown, 1);
});

test('route reader fails closed on changed driver output, signals, incomplete bytes and PID', () => {
    const f = archive(), resultPath = join(f.run, 'result.json'), original = JSON.parse(readFileSync(resultPath));
    for (const edit of [r => r.process.signal = 'SIGTERM', r => r.process.code = 1,
        r => r.incomplete_bytes = 1, r => r.process.pid++, r => r.imported = 0,
        r => r.validation_errors.push({ line: 1, error: 'synthetic' })]) {
        const r = structuredClone(original); edit(r); save(resultPath, r);
        assert.throws(() => readMingjiaoRoute(f.directory));
    }
    save(resultPath, original); put(join(f.run, 'driver-output.txt'), 'Version: fluffos synthetic-only\nDATA COMPLETE\nchanged');
    assert.throws(() => readMingjiaoRoute(f.directory), /日志摘要/);
});

test('COMPLETE accepts only a full line or the exact reset-warning interleave, never arbitrary text', () => {
    const f = archive(), resultPath = join(f.run, 'result.json');
    const result = JSON.parse(readFileSync(resultPath));
    const output = ending => {
        const text = 'Version: fluffos synthetic-only\r\n' + ending;
        put(join(f.run, 'driver-output.txt'), text);
        save(resultPath, { ...result, driver_output_sha256: sha256(text) });
    };
    for (const accepted of ['DATA COMPLETE\r\n', 'Client error: ECONNRESETDATA COMPLETE\r\n']) {
        output(accepted); assert.equal(readMingjiaoRoute(f.directory).conditions[0].effects.unknown, 1);
    }
    for (const refused of ['arbitraryDATA COMPLETE\r\n', 'Client error: EOTHERDATA COMPLETE\r\n',
        'other Client error: ECONNRESETDATA COMPLETE\r\n', 'Client error: ECONNRESET DATA COMPLETE\r\n',
        'Client error: ECONNRESETDATA COMPLETE forged\r\n', 'DATA COMPLETE forged\r\n']) {
        output(refused); assert.throws(() => readMingjiaoRoute(f.directory));
    }
    output('DATA SAMPLE ERROR\r\nClient error: ECONNRESETDATA COMPLETE\r\n');
    assert.throws(() => readMingjiaoRoute(f.directory));
});

test('route request/options/raw/ledger must describe exactly the same frozen job', () => {
    const f = archive(), optionsPath = join(f.run, 'mudlib/tests/options.json');
    const original = JSON.parse(readFileSync(optionsPath));
    for (const edit of [o => o.jobs[0].parameters.actor.properties.neili++, o => o.jobs[0].index = 1,
        o => o.jobs[0].method = 'interface', o => o.jobs.push(structuredClone(o.jobs[0])), o => o.fault = 'synthetic']) {
        const o = structuredClone(original); edit(o); save(optionsPath, o);
        assert.throws(() => readMingjiaoRoute(f.directory));
    }
    save(optionsPath, original);
    put(join(f.run, 'mudlib/log/events.jsonl'), JSON.stringify({ ...f.raw, reason: 'changed original' }) + '\n');
    assert.throws(() => readMingjiaoRoute(f.directory), /台账与原件/);
});

test('route source and registered probe/fixture bytes are verified rather than replaced by checkout', () => {
    const f = archive(), sourcePath = join(f.run, 'mudlib/d/mingjiao/shandong.c');
    const original = readFileSync(sourcePath); put(sourcePath, Buffer.concat([original, Buffer.from('// synthetic mutation\n')]));
    assert.throws(() => readMingjiaoRoute(f.directory), /冻结副本/);
    put(sourcePath, original); put(join(f.run, 'mudlib/tests/route_observer.lpc'), '// changed synthetic observer\n');
    assert.throws(() => readMingjiaoRoute(f.directory), /夹具副本/);
});

test('cold route archive requires an independent one-job driver and is labelled preparation, not walking', () => {
    const condition = cases.find(c => c.parameters.route_mode === 'cold'), f = archive(condition);
    const report = readMingjiaoRoute(f.directory);
    assert.equal(report.route_mode, 'cold'); assert.deepEqual(report.conditions[0].load_order, condition.parameters.load_order);
    assert.match(mingjiaoRouteMarkdown(report), /实验准备的原 load_object 调用，不是玩家行走/);
    const requestPath = join(f.run, 'request.json'), request = JSON.parse(readFileSync(requestPath));
    request.jobs.push({ condition_id: condition.id, index: 0 }); save(requestPath, request);
    assert.throws(() => readMingjiaoRoute(f.directory), /重复/);
});

test('route report rejects mixed groups and mixed main/cold even if manifest is re-digested', () => {
    const f = archive(), path = join(f.directory, 'series.json'), original = JSON.parse(readFileSync(path));
    for (const edit of [m => m.identity.conditions[0].parameters.collection_group = 'other-group',
        m => m.identity.conditions.push(cases.find(c => c.parameters.route_mode === 'cold'))]) {
        const manifest = structuredClone(original); edit(manifest); manifest.fingerprint = digest(manifest.identity);
        save(path, manifest); assert.throws(() => readMingjiaoRoute(f.directory), /混合/);
    }
});

test('renderer separates synthetic known command costs, moves, same-book transfer, letters and real waits', () => {
    // A display-only summary, not a raw command fixture or a real collection result.
    const report = { kind: 'mingjiao-route', collection_group: 'mingjiao-route', smoke: false,
        route_mode: 'main', evidence_digest: 'd'.repeat(64), conditions: [{ id: 'synthetic-display-only',
            samples: 2, command_execution_cost: 72, letters_created: 2,
            resources_net_cost: { qi: 0, eff_qi: 0, jing: 0, eff_jing: 0, neili: 4800 },
            final_environments: { '/d/mingjiao/midao0': 2 },
            effects: { samples: 2, validated: 2, unknown: 0, commands: 26, commands_accepted: 24,
                command_refusals: 2, neili_cost: 4800, door_openings: 8, door_closings: 0, moves: 12,
                waits: 2, wait_elapsed: 12.2, callbacks_closed: 2, books_created: 2, books_received: 2,
                results: { 'go out:refused': 2 } } }] };
    const original = structuredClone(report), md = mingjiaoRouteMarkdown(report);
    assert.match(md, /\| synthetic-display-only \| 2\/2\/0 \| 26\/24\/2 \| 72 \| 4800 \| 8\/0 \| 12 \|/);
    assert.match(md, /\| synthetic-display-only \| 2\/12\.2 \| 2 \| 2\/2 \| 2 \|/);
    assert.match(md, /go out:refused/); assert.match(md, /0\/0\/0\/0\/4800/);
    assert.match(md, /同对象从密室到USER的转移不算又生成一本/);
    assert.deepEqual(report, original, '渲染不改写结果');
    const bad = structuredClone(report); delete bad.conditions[0].effects.neili_cost;
    assert.throws(() => mingjiaoRouteMarkdown(bad), /缺资料/);
});
