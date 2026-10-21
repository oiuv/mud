// Offline integration only. Synthetic records/series below are NOT native evidence.
import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { digest, createSeries, openSeries, readSamples, recordSample } from './ledger.mjs';
import { collectionInput, createSandbox, validateQualificationSources, validateRecord } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { readSchoolCombat, schoolCombatMarkdown } from './school_combat_report.mjs';
import { mingjiaoJiuyangFusionConditions, mingjiaoJiuyangFusionSourcePaths,
    mingjiaoJiuyangFusionReviewedSourceHash, validateMingjiaoJiuyangFusionCondition,
} from './school_mingjiao_jiuyang_fusion_cases.mjs';
import { validateMingjiaoJiuyangFusionRecord } from './school_mingjiao_jiuyang_fusion_record.mjs';
import { mingjiaoJiuyangFusionReport, mingjiaoJiuyangFusionMarkdown } from './school_mingjiao_jiuyang_fusion_report.mjs';
import { mingjiaoJiuyangFusionProbes, restoreMingjiaoJiuyangFusionProbes } from './school_mingjiao_jiuyang_fusion_probes.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => fs.readFileSync(join(root, path), 'utf8');
const group = 'mingjiao-jiuyang-fusion', prefix = 'school-mingjiao-fusion-jiuyang-';
const clone = value => structuredClone(value), total = plans => plans.reduce((n, c) => n + c.samples, 0);
const inventory = { ...buildInventory(root), versions: { fixture: 'explicitly_synthetic' } };
const catalog = collectCatalog(root, inventory);
const conditions = mingjiaoJiuyangFusionConditions(catalog, read);
const smokeConditions = mingjiaoJiuyangFusionConditions(catalog, read, { smoke: true });
const pick = variant => { const c = conditions.find(c => c.parameters.variant === variant); assert.ok(c); return c; };
const commandEntries = plans => [...new Map(plans.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.method === 'yanlian')
    .map(c => [c.entry_id, c.parameters.source_entry])).values()];
const execution = smoke => ({ collection: 'school-combat', smoke, fusion_watchdog_seconds: 30,
    source_files: clone(conditions[0].parameters.source_evidence), explicitly_synthetic: true });
const temporary = [];
let frozen, fixture;
const snapshot = () => frozen ??= createSandbox(root);
function temporaryDirectory() {
    const directory = resolve(fs.mkdtempSync(join(tmpdir(), 'mud-fusion-integration-')));
    temporary.push(directory); return directory;
}
after(() => {
    for (const path of temporary) {
        assert.equal(dirname(path), resolve(tmpdir()));
        assert.ok(basename(path).startsWith('mud-fusion-integration-'));
        assert.equal(fs.lstatSync(path).isSymbolicLink(), false);
        fs.rmSync(path, { recursive: true });
    }
});

// Reuse the separately frozen, handwritten source-action fixtures, not prediction helpers.
// Only its declarations are evaluated: node:test registrations are never imported/executed.
const fixturePath = 'tools/tests/martial_data/school_mingjiao_jiuyang_fusion_record.test.mjs';
let fixtureSource = read(fixturePath).split('\ntest(')[0];
assert.ok(fixtureSource.includes('function trace('));
fixtureSource = fixtureSource.replace(/^import .*;\r?$/gm, '')
    .replace("new URL('../../../', import.meta.url)", JSON.stringify(new URL('../../../', import.meta.url).href));
const { trace } = new Function('assert', 'fs', 'createHash', 'mingjiaoJiuyangFusionConditions', 'check',
    fixtureSource + '\nreturn { trace };')(assert, fs, createHash, mingjiaoJiuyangFusionConditions,
    validateMingjiaoJiuyangFusionRecord);
function original(c, index = 0, settings) {
    const raw = trace(c, settings); raw.index = index;
    if (raw.outcome === 'refused') {
        raw.reason = raw.fusion.commands[0].cost === 0 ? raw.immediate[0].temp.notify_fail
            : raw.fusion.window_messages.flatMap(window => window.messages)
                .findLast(m => m.side === 0 && ['write', 'tell_object'].includes(m.type)
                    && typeof m.text === 'string' && m.text.length)?.text;
        assert.ok(typeof raw.reason === 'string' && raw.reason.length, 'synthetic refusal needs original observed text');
    }
    return raw;
}
function consumers(raw, c) {
    validateRecord(raw, c); validateSchoolCombatRecord(raw, c);
    return validateMingjiaoJiuyangFusionRecord(raw, c);
}
function rowFor(raw, c, manifest) {
    return { format: 1, fingerprint: manifest.fingerprint, condition_id: c.id, condition_sha256: digest(c),
        index: raw.index, outcome: raw.outcome, reason: raw.reason, raw_sha256: digest(raw), raw };
}
function syntheticSeries() {
    if (fixture) return fixture;
    const directory = temporaryDirectory();
    createSeries(directory, { inventory: { ...inventory, versions: { fixture: 'explicitly_synthetic' } }, catalog,
        conditions, execution: execution(false), commandEntries: commandEntries(conditions) });
    const manifest = openSeries(directory), run = join(directory, 'runs', 'attempt-synthetic');
    fs.mkdirSync(join(run, 'mudlib', 'log'), { recursive: true });
    const records = conditions.flatMap(c => Array.from({ length: c.samples }, (_, index) =>
        original(c, index, c.parameters.random_effects && index % 2 ? { finish: 0 } : undefined)));
    const put = (path, value) => fs.writeFileSync(path, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    put(join(directory, 'catalog.json'), catalog);
    put(join(run, 'request.json'), { fingerprint: manifest.fingerprint,
        jobs: records.map(r => ({ condition_id: r.condition_id, index: r.index })) });
    const output = 'Explicitly synthetic offline reader fixture; no driver process\nDATA COMPLETE\n';
    fs.writeFileSync(join(run, 'driver-output.txt'), output, { flag: 'wx' });
    fs.writeFileSync(join(run, 'mudlib', 'log', 'events.jsonl'), records.map(r => JSON.stringify(r)).join('\n') + '\n', { flag: 'wx' });
    put(join(run, 'result.json'), { interrupted: false, process: { code: 0, signal: null },
        validation_errors: [], incomplete_bytes: 0, imported: records.length, driver_output_sha256: sha256(output) });
    for (const raw of records) recordSample(directory, manifest,
        { condition_id: raw.condition_id, index: raw.index, outcome: raw.outcome, reason: raw.reason, raw });
    fixture = { directory, manifest, records, rows: readSamples(directory, manifest), report: readSchoolCombat(directory) };
    return fixture;
}

test('融合原17438窗口保留；旧17416完整F/S有序指纹及原22融合不变', () => {
    for (const smoke of [false, true]) {
        const current = schoolCombatConditions(catalog, { smoke }).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
        const all = current.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-remaining-base', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
        const tail = smoke ? smokeConditions : conditions;
        assert.equal(current.length, 18104);
        assert.equal(total(current), smoke ? 30492 : 493470);
        assert.deepEqual(current.filter(c => !['mingjiao-remaining-base', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group)), all);
        assert.equal(all.length, 17766); assert.equal(total(all), smoke ? 29816 : 477800);
        assert.equal(total(all.slice(0, 17438)), smoke ? 29160 : 461268);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(total(all.slice(0, 17416)), smoke ? 29116 : 461028);
        assert.equal(sha256(JSON.stringify(all.slice(0, 17416))), smoke
            ? 'cbe410962f752b830ec66948910b4457d8e0acbddae8ab195349f6b3e59d641d'
            : '230b0304962d2d587e6245bffdc221b53f9e6c48dd493dc78448eb05bb9c52cc');
        assert.deepEqual(all.slice(17416, 17438), tail); assert.equal(tail.length, 22);
        assert.equal(total(tail), smoke ? 44 : 240);
        assert.equal(sha256(JSON.stringify(tail)), smoke
            ? '6e080153bab33bf1c9d5f728102ca04b6313bb8ba077659277adc6530c91acee'
            : 'd9188fa0f0744ce56fac3b8502e3a3a348b261a8296793e279ea36a7ba597a10');
        for (const c of tail) {
            assert.ok(c.id.startsWith(prefix)); assert.equal(c.parameters.collection_group, group);
            assert.equal(c.parameters.run_mode, smoke ? 'smoke' : 'formal');
            assert.equal(c.status, 'prepared_not_sampled'); validateMingjiaoJiuyangFusionCondition(c);
        }
    }
});

test('143来源与真实yanlian入口逐SHA；错误计划/缺源/漂移/同mode缩样本拒绝', () => {
    const files = snapshot().files, c = pick('complete180');
    assert.equal(mingjiaoJiuyangFusionSourcePaths.length, 143);
    assert.equal(mingjiaoJiuyangFusionReviewedSourceHash,
        'e218966245824e3c74ae9f460094883467d66cd4283a6abc4853a0eae76f6f0c');
    validateQualificationSources(conditions, files);
    for (const path of mingjiaoJiuyangFusionSourcePaths) {
        assert.equal(files[path], c.parameters.source_evidence[path]);
        for (const missing of [false, true]) {
            const bad = { ...files }; if (missing) delete bad[path]; else bad[path] = '0'.repeat(64);
            assert.throws(() => validateQualificationSources([c], bad), path);
        }
    }
    for (const edit of [
        x => { x.samples = 2; }, x => { delete x.parameters.run_mode; }, x => { x.parameters.run_mode = 'smoke'; },
        x => { x.entry_id = x.entry_id.replace(':12:', ':13:'); }, x => { x.method = 'interface'; },
        x => { x.parameters.source_entry.role = 'teaching'; }, x => { x.parameters.source_entry.function = 'practicing'; },
        x => { x.parameters.qualification_sources.pop(); }, x => { x.parameters.reviewed_source_hash = '0'.repeat(64); },
        x => { x.parameters.action = 'yanlian force'; }, x => { x.parameters.observe_seconds = 0; },
        x => { x.parameters.actor.skills.force++; }, x => { x.parameters.actor.temp = { pending: { practice: 1 } }; },
    ]) {
        const bad = clone(c); edit(bad); assert.notDeepEqual(bad, c);
        assert.throws(() => validateMingjiaoJiuyangFusionCondition(bad));
        assert.throws(() => validateQualificationSources([bad], files));
    }
});

test('ledger仅显式增加原command12入口；旧entries同序，查询保留实际catalog两种role', () => {
    const args = { inventory, catalog, conditions, execution: execution(false), commandEntries: commandEntries(conditions) };
    const directory = temporaryDirectory(), manifest = createSeries(directory, args);
    assert.deepEqual(openSeries(directory), manifest);
    const originalEntries = catalog.skills.flatMap(s => [{ id: s.path, path: s.path, role: 'file', sha256: s.sha256 },
        ...s.entries.map(e => ({ id: e.id, path: s.path, role: e.role, sha256: s.sha256 }))]);
    assert.deepEqual(manifest.entries.slice(0, -1), originalEntries);
    assert.deepEqual(manifest.entries.at(-1), pick('complete180').parameters.source_entry);
    assert.equal(manifest.entries.find(e => e.id === 'kungfu/skill/jiuyang-shengong.c:109:get_ready').role, 'other_function');
    assert.equal(manifest.entries.find(e => e.id === 'kungfu/skill/jiuyang-shengong.c:181:query_sub_skills').role, 'query_or_gate');
    for (const edit of [
        a => { a.commandEntries = []; }, a => { a.commandEntries.push(clone(a.commandEntries[0])); },
        a => { a.commandEntries[0].role = 'teaching'; }, a => { a.commandEntries[0].line = 13; },
        a => { a.commandEntries[0].function = 'practicing'; }, a => { a.commandEntries[0].path = 'cmds/std/halt.c'; },
        a => { a.commandEntries[0].sha256 = '0'.repeat(64); },
        a => { delete a.execution.source_files['cmds/skill/yanlian.c']; },
        a => { delete a.execution.fusion_watchdog_seconds; }, a => { a.execution.smoke = true; },
        a => { a.conditions = [pick('get-ready')]; },
    ]) {
        const bad = clone(args); edit(bad); assert.notDeepEqual(bad, args);
        assert.throws(() => createSeries(join(directory, 'invalid-unused'), bad));
    }
    for (const id of ['kungfu/skill/jiuyang-shengong.c:109:get_ready', 'kungfu/skill/jiuyang-shengong.c:181:query_sub_skills']) {
        const bad = clone(manifest); bad.entries.find(e => e.id === id).role = 'interface';
        bad.identity.entries_sha256 = digest(bad.entries); bad.fingerprint = digest(bad.identity);
        const c = conditions.find(x => x.entry_id === id);
        assert.throws(() => mingjiaoJiuyangFusionReport([], c, bad));
    }
});

test('可信30秒watchdog独立于null观察窗口；options保原job/两参紧凑JSON，mode不可自推', () => {
    const jobs = conditions.map(c => ({ condition_id: c.id, index: 0, method: c.method, parameters: c.parameters }));
    const originalJobs = clone(jobs), input = collectionInput(jobs, undefined, execution(false));
    assert.equal(input.connections, 2); assert.equal(input.bytes, Buffer.byteLength(input.text, 'utf8'));
    assert.deepEqual(JSON.parse(input.text), { jobs, fusion_watchdog_seconds: 30 });
    assert.deepEqual(jobs, originalJobs);
    assert.ok(jobs.filter(j => j.method === 'yanlian').every(j => j.parameters.observe_seconds === null));
    for (const value of [undefined, null, 0, 3, 29, 31, '30', 30.5]) {
        const e = execution(false); e.fusion_watchdog_seconds = value;
        assert.throws(() => collectionInput(jobs, null, e));
    }
    assert.throws(() => collectionInput(jobs));
    assert.throws(() => collectionInput(jobs, null, execution(true)));
    const old = [{ condition_id: 'old', index: 0, method: 'interface', parameters: { observe_seconds: 0 } }];
    assert.equal(collectionInput(old, null).text, JSON.stringify({ jobs: old, fault: null }) + '\n');
    assert.deepEqual(JSON.parse(collectionInput(old, null).text),
        JSON.parse(JSON.stringify({ jobs: old, fault: null }, null, 2)));
    assert.equal(collectionInput(old, null, execution(false)).text, collectionInput(old, null).text);
});

test('十一融合JS与真实H冻结，原15/48不变且新yanlian17逐点可逆而不写原文件', () => {
    const { files, probes } = snapshot();
    for (const suffix of ['cases.mjs', 'cases.test.mjs', 'observation.mjs', 'observation.test.mjs',
        'probes.mjs', 'probes.test.mjs', 'record.mjs', 'record.test.mjs', 'report.mjs', 'report.test.mjs', 'integration.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_jiuyang_fusion_' + suffix;
        assert.equal(files[path], sha256(read(path)), path);
    }
    const header = 'tools/tests/martial_data/jiuyang_fusion_receivers.h'; assert.equal(files[header], sha256(read(header)));
    assert.equal(probes.length, 16); assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 65);
    assert.equal(sha256(JSON.stringify(probes.slice(0, 15))), 'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    for (const probe of probes) {
        const source = read(probe.path); assert.equal(sha256(source), probe.before); assert.equal(files[probe.path], probe.before);
        const replacements = probe.sites.map(site => Array.isArray(site) ? [site[0], site[1] + site[0]]
            : Object.hasOwn(site, 'replacement') ? [site.anchor, site.replacement]
                : [site.anchor, site.position === 'before' ? site.insert + site.anchor : site.anchor + site.insert]);
        let changed = source;
        for (const [before, after] of replacements) { assert.equal(changed.split(before).length, 2); changed = changed.replace(before, after); }
        assert.equal(sha256(changed), probe.after);
        for (const [before, after] of replacements.toReversed()) { assert.equal(changed.split(after).length, 2); changed = changed.replace(after, before); }
        assert.equal(changed, source);
    }
    const source = read('cmds/skill/yanlian.c'), probe = mingjiaoJiuyangFusionProbes(source, { collectionGroup: group });
    assert.equal(probe.sites.length, 17); assert.equal(restoreMingjiaoJiuyangFusionProbes(probe.changed), source);
    assert.equal(read('cmds/skill/yanlian.c'), source); assert.match(probe.changed, /is_jiuyang_fusion_observation\(me\)/);
    assert.throws(() => mingjiaoJiuyangFusionProbes(source, { collectionGroup: 'other' }));
});

test('22手写synthetic原件完整三消费者；实际成本/parent/pending/learned/一次finish不得伪造', () => {
    for (const c of conditions) {
        const raw = original(c), before = clone(raw);
        assert.equal(consumers(raw, c).complete, true, c.id); assert.deepEqual(raw, before);
    }
    const c = pick('complete180'), normal = original(c), result = consumers(normal, c);
    assert.equal(result.command_cost, 23); assert.equal(result.commands_accepted, 1);
    assert.equal(result.natural_callbacks, 4); assert.equal(result.child_actions, 3); assert.equal(result.get_finish_calls, 1);
    for (const cost of [1, 23, 476]) {
        const raw = clone(normal); raw.fusion.commands[0].cost = cost;
        assert.equal(consumers(raw, c).command_cost, cost);
    }
    for (const edit of [
        r => { r.fusion.commands[0].cost = 1.5; }, r => { r.fusion.commands[0].return_actor = r.before[1].object; },
        r => { r.fusion.windows[0].events[0].caller = r.before[0].object; },
        r => { r.fusion.windows[0].events[0].stack = []; },
        r => { delete r.fusion.before.state.learned_raw; }, r => { delete r.fusion.before.state.pending.parent_present; },
        r => { r.fusion.immediate.state.pending.practice_raw = 2; },
        r => { r.fusion.windows[3].events.splice(2, 1); }, r => { r.after[1].neili--; },
    ]) {
        const bad = clone(normal); edit(bad); assert.notDeepEqual(bad, normal);
        assert.throws(() => validateSchoolCombatRecord(bad, c));
        assert.throws(() => validateMingjiaoJiuyangFusionRecord(bad, c));
    }
    const error = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        outcome: 'error', elapsed: 30, reason: 'synthetic timeout diagnostic, no measured success' };
    assert.equal(consumers(error, c), null);
});

test('240合成原件走原request/ledger/strict reader/CLI；Report和MD用原manifest+rows，诊断不算成功', () => {
    const { directory, manifest, rows, report } = syntheticSeries();
    assert.equal(rows.length, 240); assert.equal(report.conditions.length, 22); assert.equal(report.smoke, false);
    let commands = 0, successes = 0, randomFailures = 0;
    for (const c of conditions) {
        const actual = report.conditions.find(r => r.id === c.id), selected = rows.filter(r => r.condition_id === c.id);
        assert.equal(actual.effects, null); assert.equal(actual.sides, null);
        assert.deepEqual(actual.mingjiao_jiuyang_fusion, mingjiaoJiuyangFusionReport(selected, c, manifest));
        const summary = actual.mingjiao_jiuyang_fusion; assert.equal(summary.coverage.complete, true);
        commands += summary.effects.known.commands; successes += summary.effects.known.outcomes.fusion_success;
        randomFailures += summary.effects.known.outcomes.source_random_failure;
    }
    assert.equal(commands, 242); assert.equal(successes, 100); assert.equal(randomFailures, 100);
    const markdown = schoolCombatMarkdown(report, manifest, rows);
    assert.ok(!markdown.slice(0, markdown.indexOf('### 九阳融合')).includes(prefix));
    assert.throws(() => schoolCombatMarkdown(report)); assert.throws(() => schoolCombatMarkdown(report, manifest));
    const altered = clone(report); altered.conditions[0].mingjiao_jiuyang_fusion.coverage.complete = false;
    assert.throws(() => schoolCombatMarkdown(altered, manifest, rows));
    const c = pick('complete180');
    assert.equal(mingjiaoJiuyangFusionReport([], c, manifest).effects.known, null);
    const halt = pick('halt-after-first-step'), lateRaw = original(halt, 0, { haltAt: 5 });
    const late = mingjiaoJiuyangFusionReport([rowFor(lateRaw, halt, manifest)], halt, manifest);
    assert.equal(late.effects.known, null); assert.equal(late.coverage.complete, false);
    assert.equal(late.records[0].observation.success, true);
    const wrongMode = clone(manifest); wrongMode.identity.execution.smoke = true; wrongMode.fingerprint = digest(wrongMode.identity);
    assert.throws(() => mingjiaoJiuyangFusionReport([], c, wrongMode));
    assert.throws(() => mingjiaoJiuyangFusionMarkdown(report.conditions[0].mingjiao_jiuyang_fusion, wrongMode, rows));
    const output = join(directory, 'synthetic-report');
    const child = spawnSync(process.execPath, [join(root, 'tools/tests/martial_data/school_combat_report.mjs'), directory, output],
        { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.equal(child.error, undefined); assert.equal(child.signal, null); assert.equal(child.status, 0, child.stderr + child.stdout);
    assert.deepEqual(JSON.parse(fs.readFileSync(join(output, 'school-combat.json'), 'utf8')), report);
    assert.equal(fs.readFileSync(join(output, 'school-combat.md'), 'utf8'), markdown);
    const smokeDirectory = join(directory, 'synthetic-smoke');
    createSeries(smokeDirectory, { inventory, catalog, conditions: smokeConditions,
        execution: execution(true), commandEntries: commandEntries(smokeConditions) });
    assert.throws(() => readSchoolCombat(smokeDirectory), /烟雾不是完整统计/);
});

test('producer限定新组/原USER和命令；真实自然caller观测与watchdog不改原回调时钟', () => {
    const runner = read('tools/tests/martial_data/runner.lpc'), actor = read('tools/tests/martial_data/actor.lpc');
    const header = read('tools/tests/martial_data/jiuyang_fusion_receivers.h');
    const source = read('tools/tests/martial_data/execution.mjs');
    assert.match(runner, /#include "\/tests\/jiuyang_fusion_receivers\.h"/);
    assert.match(runner, /options\["fusion_watchdog_seconds"\]/);
    assert.match(header, /current\["parameters"\]\["collection_group"\] == "mingjiao-jiuyang-fusion"/);
    assert.match(header, /me == players\[0\]/); assert.match(header, /previous_object\(\) == me/);
    assert.match(header, /base_name\(caller\) == "\/cmds\/skill\/yanlian"/);
    assert.match(header, /find_command\("yanlian"\) == "\/cmds\/skill\/yanlian\.c"/);
    assert.match(header, /cost = players\[0\]->force_me\(action\)/);
    assert.match(header, /function_exists\(spec\["function"\], skill\)/);
    assert.match(header, /learned = me->query_learned\(\)/);
    assert.match(header, /call_stack\(1\)/); assert.match(header, /call_stack\(2\)/);
    assert.match(header, /query_heart_beat\(players\[0\]\)/);
    assert.match(header, /call_out\("jiuyang_fusion_watchdog", jiuyang_fusion_watchdog_seconds\)/);
    const finish = header.slice(header.indexOf('private void finish_jiuyang_fusion()'),
        header.indexOf('void settle_jiuyang_fusion_window()'));
    assert.match(finish, /current\["outcome"\] == "refused"/);
    assert.match(finish, /command\["action"\] == "halt" && command\["cost"\] > 0/);
    assert.match(finish, /window\["kind"\] == "halt" && window\["status"\] == "closed"/);
    assert.match(finish, /players\[0\]->query_busy\(\) == 0/);
    assert.match(finish, /players\[0\]->query_temp\("pending\/practice"\) == 0/);
    assert.match(finish, /players\[0\]->query_temp\("pending\/practicing_skill"\) == 0/);
    assert.match(finish, /for \(i = sizeof\(current\["fusion"\]\["window_messages"\]\) - 1; i >= 0; i--\)/);
    assert.match(finish, /for \(j = sizeof\(received\["messages"\]\) - 1; j >= 0; j--\)/);
    assert.match(finish, /message\["side"\] == 0 &&\s*member_array\(message\["type"\], \(\{ "write", "tell_object" \}\)\) != -1 &&\s*stringp\(message\["text"\]\) && message\["text"\] != ""/);
    assert.match(finish, /reason = message\["text"\]/);
    assert.match(finish, /if \(!stringp\(reason\) \|\| reason == ""\) \{\s*current\["outcome"\] = "error"/);
    assert.match(finish, /current\["fusion"\]\["status"\] = "truncated"/);
    assert.match(finish, /else current\["reason"\] = reason/);
    assert.doesNotMatch(finish, /\["parameters"\]|\["skill_messages"\]|p\.refusal/);
    assert.match(header, /close_jiuyang_fusion_window\(\);\s*command\["after"\] = copy\(current\["fusion"\]\["windows"\]\[<1\]\["settled"\]\)/);
    assert.match(actor, /::continue_action\(\)/); assert.match(actor, /observe_jiuyang_fusion_caller/);
    assert.doesNotMatch(header, /->(?:practicing|query_action|get_finish)\s*\(|\brandom\s*\(|set_heart_beat\s*\(/);
    assert.match(source, /collectionInput\(jobs, fault, execution\)/);
    assert.match(source, /job\.parameters\.collection_group === 'mingjiao-jiuyang-fusion'\s*\? execution\.fusion_watchdog_seconds : job\.parameters\.observe_seconds/);
    assert.match(source, /commandEntries: \[\.\.\.new Map\(conditions\.filter/);
});
