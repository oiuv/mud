// Offline integration only: all event/ledger fixtures below are explicitly synthetic.
import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, lstatSync } from 'node:fs';
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
import { mingjiaoJiuyangCapacityConditions, mingjiaoJiuyangCapacitySourcePaths,
    mingjiaoJiuyangCapacityReviewedSourceHash, validateMingjiaoJiuyangCapacityCondition,
} from './school_mingjiao_jiuyang_capacity_cases.mjs';
import { validateMingjiaoJiuyangCapacityRecord } from './school_mingjiao_jiuyang_capacity_observation.mjs';
import { mingjiaoJiuyangCapacityReport, mingjiaoJiuyangCapacityMarkdown } from './school_mingjiao_jiuyang_capacity_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const group = 'mingjiao-jiuyang-capacity', prefix = 'school-mingjiao-capacity-jiuyang-';
const clone = value => structuredClone(value);
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const conditions = mingjiaoJiuyangCapacityConditions(catalog, read);
const total = rows => rows.reduce((sum, row) => sum + row.samples, 0);
let frozen, fixture;
const snapshot = () => frozen ??= createSandbox(root);
const temporary = [];
after(() => {
    for (const path of temporary) {
        assert.equal(dirname(path), resolve(tmpdir()));
        assert.ok(basename(path).startsWith('mud-capacity-integration-'));
        assert.equal(lstatSync(path).isSymbolicLink(), false);
        rmSync(path, { recursive: true });
    }
});

// Literal source-derived anchors, independent of parameters.expected_return.
function valueFor(p) {
    if (p.ability === 'query_neili_improve') return { level200: 750, level400: 3000, level800: 12000 }[p.variant];
    if (p.variant === 'owned-force1000') return p.ability === 'query_neili_limit' ? 23000 : 3750;
    return { level200: 3750, level400: 9000, level800: 24000, improve10: 4125, breakup: 5250,
        mystery: 4350, guimai: 4312, 'bonze-shaolin': 4250, 'bonze-mingjiao': 3750 }[p.variant];
}
function state(config, side) {
    const p = config.properties, skills = config.skills;
    const s = { object: '/tests/actor#' + (side + 31), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        busy: null, conditions: null, fighting_opponent: 0, skills: clone(skills),
        mappings: clone(config.mappings), preparations: {}, learned: {},
        temp: { user_setup: 1, apply: { armor: 100 } },
        cultivation: { sex: null, 'immune/poison': null, 'wudang-jiuyang': null, 'special_skill/divine': null },
        effective_skills: Object.fromEntries(Object.entries(skills).map(([key, value]) =>
            [key, Math.floor(value / 2) + (key === 'force' ? skills['jiuyang-shengong'] : 0)])),
        effective_str: p.str + skills.unarmed / 10, effective_con: p.con + skills.force / 10,
        effective_int: p.int, effective_dex: p.dex + skills.dodge / 10,
        craze: 0, max_craze: 5000, force_attribute: null, age: 25,
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {},
        weapon_damage: 0, weapon_flag: 0, ammunition: 0 };
    for (const [key, value] of Object.entries(p)) {
        if (['name', 'race'].includes(key)) continue;
        if (key.includes('/') || ['class', 'character', 'reborn', 'doing', 'breakup'].includes(key))
            s.cultivation[key] = value;
        else s[key] = value;
    }
    return s;
}
function original(condition, index = 0, cost = 23) {
    const p = condition.parameters, before = [state(p.actor, 0), state(p.target, 1)];
    const value = valueFor(p), owner = p.ability === 'query_neili_improve'
        ? '/kungfu/skill/jiuyang-shengong' : '/clone/user/user';
    return { kind: 'sample', condition_id: condition.id, method: 'interface', index,
        outcome: 'observed', reason: '', elapsed: 0.01, command_accepted: cost,
        before, immediate: clone(before), after: clone(before), metrics: [{}, {}],
        actions: [], attacks: [], directs: [], passives: [], defenses: [], dodge_checks: [],
        launches: [], refusals: [], callbacks: [], dropped: [], terminals: [], background_stopped: [], skill_messages: [],
        interfaces: [{ object: p.interface.object, function: p.ability, result: value, implemented_by: owner }],
        interface_steps: [{ command: 'test_interface', entry_actor: before[0].object, return_actor: before[0].object,
            before: clone(before[0]), after: clone(before[0]), result: value, implemented_by: owner, reason: '', messages: [] }] };
}
function consumers(raw, c) {
    validateRecord(raw, c); validateSchoolCombatRecord(raw, c);
    return validateMingjiaoJiuyangCapacityRecord(raw, c);
}
function denyCondition(c, edit) {
    const bad = clone(c); edit(bad);
    assert.notDeepEqual(bad, c, 'negative fixture must actually change a condition');
    assert.throws(() => validateMingjiaoJiuyangCapacityCondition(bad));
    assert.throws(() => validateQualificationSources([bad], snapshot().files));
}
function lpcFunction(source, name) {
    const match = source.match(new RegExp(`^[\\w* ]+\\b${name}\\([^;]*?\\)\\s*\\{[\\s\\S]*?^\\}`, 'm'));
    assert.ok(match, name); return match[0];
}
function syntheticSeries() {
    if (fixture) return fixture;
    const directory = resolve(mkdtempSync(join(tmpdir(), 'mud-capacity-integration-')));
    temporary.push(directory);
    createSeries(directory, { inventory: { ...inventory, versions: { fixture: 'explicitly_synthetic' } }, catalog, conditions,
        execution: { collection: 'school-combat', smoke: false, explicitly_synthetic: true } });
    const manifest = openSeries(directory);
    const run = join(directory, 'runs', 'attempt-synthetic');
    mkdirSync(join(run, 'mudlib', 'log'), { recursive: true });
    const records = conditions.flatMap(c => [original(c, 0, 23), original(c, 1, 476)]);
    const put = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    put(join(directory, 'catalog.json'), catalog);
    put(join(run, 'request.json'), { fingerprint: manifest.fingerprint,
        jobs: records.map(r => ({ condition_id: r.condition_id, index: r.index })) });
    const output = 'Explicitly synthetic offline reader fixture\nDATA COMPLETE\n';
    writeFileSync(join(run, 'driver-output.txt'), output, { flag: 'wx' });
    writeFileSync(join(run, 'mudlib', 'log', 'events.jsonl'), records.map(r => JSON.stringify(r)).join('\n') + '\n', { flag: 'wx' });
    put(join(run, 'result.json'), { interrupted: false, process: { code: 0, signal: null },
        validation_errors: [], incomplete_bytes: 0, imported: records.length, driver_output_sha256: sha256(output) });
    for (const raw of records) recordSample(directory, manifest,
        { condition_id: raw.condition_id, index: raw.index, outcome: raw.outcome, reason: raw.reason, raw });
    fixture = { directory, manifest, records, rows: readSamples(directory, manifest), report: readSchoolCombat(directory) };
    return fixture;
}

test('容量仅尾追加23；旧17368完整有序正式/烟雾指纹与计划分母不变', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke }).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-jiuyang-research', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-fusion', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-perform', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-base', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
        const tail = mingjiaoJiuyangCapacityConditions(catalog, read, { smoke });
        assert.equal(all.length, 17391); assert.equal(total(all), smoke ? 29066 : 459900);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(sha256(JSON.stringify(all.slice(0, 17368))), smoke
            ? 'c036ca51ca78d1e0b0702db0f85d2a2730e1a9690e028255fbe81c6663749bf6'
            : '6b5fc7146b7412458b41fbedbac3cb8e11bb59b441b1501f1ae9d1a303e0db72');
        assert.deepEqual(all.slice(17368, 17368 + tail.length), tail);
        assert.equal(tail.length, 23); assert.equal(total(tail), 46);
        assert.equal(sha256(JSON.stringify(tail)), 'c63b87553793c1f53973f277c3213299ecf26ed6e221c378029aba32ad523cdc');
        for (const c of tail) {
            assert.ok(c.id.startsWith(prefix)); assert.equal(c.parameters.collection_group, group);
            assert.equal(c.entry_id, 'kungfu/skill/jiuyang-shengong.c');
            assert.equal(c.method, 'interface'); assert.equal(c.parameters.observe_seconds, 0);
            assert.equal(c.status, 'prepared_not_sampled'); validateMingjiaoJiuyangCapacityCondition(c);
        }
    }
});

test('137资格来源、原file入口/三个receiver与固定初态严格绑定，缺源漂移不执行', () => {
    const files = snapshot().files;
    assert.equal(mingjiaoJiuyangCapacitySourcePaths.length, 137);
    assert.equal(mingjiaoJiuyangCapacityReviewedSourceHash,
        '2b25e7e41899f6432deef87f3631e3fc9840a02967c933e5b8ef9c714a5d500c');
    validateQualificationSources(conditions, files);
    for (const path of mingjiaoJiuyangCapacitySourcePaths) {
        assert.equal(files[path], conditions[0].parameters.source_evidence[path], path);
        for (const missing of [false, true]) {
            const changed = { ...files };
            if (missing) delete changed[path]; else changed[path] = '0'.repeat(64);
            assert.throws(() => validateQualificationSources([conditions[0]], changed), path);
        }
    }
    for (const edit of [
        c => { c.entry_id += ':1:query_neili_limit'; }, c => { c.method = 'perform'; },
        c => { c.parameters.qualification_sources.pop(); }, c => { c.parameters.reviewed_source_hash = '0'.repeat(64); },
        c => { c.parameters.interface.object = '/clone/user/user'; },
        c => { c.parameters.interface.function = 'valid_learn'; }, c => { c.parameters.action = 'exert powerup'; },
        c => { c.parameters.actor.skills.force++; }, c => { c.parameters.actor.properties.reborn = { test: 1 }; },
        c => { c.parameters.actor.equipment = { type: 'sword' }; }, c => { c.parameters.actor.temp = { powerup: 1 }; },
        c => { c.parameters.target_state = 'unconscious'; }, c => { c.parameters.actor.busy = 1; },
        c => { c.parameters.extra_target = clone(c.parameters.target); }, c => { c.parameters.fighting = true; },
        c => { c.parameters.observe_seconds = 1; }, c => { c.parameters.expected_return++; },
    ]) denyCondition(conditions[0], edit);
    assert.equal(collectionInput(conditions).connections, 2);
});

test('六容量模块及本集成实际字节冻结；原15文件48点探针逐项正反替换不变', () => {
    const { files, probes: allProbes } = snapshot();
    const fusion = allProbes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = allProbes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    for (const suffix of ['cases.mjs', 'cases.test.mjs', 'observation.mjs', 'observation.test.mjs',
        'report.mjs', 'report.test.mjs', 'integration.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_jiuyang_capacity_' + suffix;
        assert.equal(files[path], sha256(readFileSync(join(root, path))), path);
    }
    assert.equal(probes.length, 15); assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(probes)), 'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    for (const probe of probes) {
        const original = read(probe.path);
        assert.equal(sha256(original), probe.before); assert.equal(files[probe.path], probe.before);
        const replacements = probe.sites.map(site => Array.isArray(site) ? [site[0], site[1] + site[0]]
            : Object.hasOwn(site, 'replacement') ? [site.anchor, site.replacement]
                : [site.anchor, site.position === 'before' ? site.insert + site.anchor : site.anchor + site.insert]);
        let instrumented = original;
        for (const [before, after] of replacements) {
            assert.equal(instrumented.split(before).length, 2); instrumented = instrumented.replace(before, after);
        }
        assert.equal(sha256(instrumented), probe.after);
        for (const [before, after] of replacements.toReversed()) {
            assert.equal(instrumented.split(after).length, 2); instrumented = instrumented.replace(after, before);
        }
        assert.equal(instrumented, original);
    }
});

test('23手写容量锚经过通用/门派/专用三消费者，正成本不作次数、两USER无变更', () => {
    for (const c of conditions) for (const cost of [1, 23, 476]) {
        const raw = original(c, 0, cost), saved = clone(raw), result = consumers(raw, c);
        assert.equal(result.command_cost, cost); assert.equal(result.commands_accepted, 1);
        assert.equal(result.interface_value, valueFor(c.parameters)); assert.deepEqual(raw, saved);
    }
    const c = conditions[0];
    for (const edit of [
        r => { r.command_accepted = 0; }, r => { r.command_accepted = 1.5; }, r => { delete r.command_accepted; },
        r => { r.interfaces[0].result++; }, r => { r.interfaces[0].implemented_by = '/clone/user/user'; },
        r => { r.interface_steps[0].return_actor = r.before[1].object; }, r => { delete r.interface_steps; },
        r => { r.after[1].skills.force++; }, r => { r.immediate[0].neili--; },
        r => { delete r.before[0].conditions; }, r => { r.metrics[0].neili_cost = 1; },
        r => { r.callbacks.push({ side: 0 }); }, r => { r.before[0].wizardp = 1; },
    ]) {
        const bad = original(c); edit(bad);
        assert.throws(() => validateSchoolCombatRecord(bad, c));
        assert.throws(() => validateMingjiaoJiuyangCapacityRecord(bad, c));
    }
    const error = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        outcome: 'error', elapsed: 0.1, reason: 'synthetic diagnostic, not an observed zero' };
    assert.equal(consumers(error, c), null);
    for (const edit of [r => { r.reason = ''; }, r => { r.elapsed = -1; }, r => { delete r.index; }]) {
        const bad = clone(error); edit(bad); assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
});

test('显式合成46原件/request/ledger经真实readSchoolCombat，传原condition和manifest生成完整专用报告', () => {
    const { manifest, report, rows, directory } = syntheticSeries();
    assert.deepEqual(openSeries(directory), manifest); assert.equal(rows.length, 46);
    assert.equal(report.conditions.length, 23); assert.equal(report.smoke, false);
    for (const c of conditions) {
        const actual = report.conditions.find(item => item.id === c.id);
        const expected = mingjiaoJiuyangCapacityReport(rows.filter(r => r.condition_id === c.id), c, manifest);
        assert.equal(actual.effects, null); assert.equal(actual.sides, null);
        assert.deepEqual(actual.mingjiao_jiuyang_capacity, expected);
        assert.equal(expected.effects.known.commands_accepted, 2);
        assert.equal(expected.effects.known.command_cost, 499);
    }
    const markdown = schoolCombatMarkdown(report, manifest);
    for (const c of report.conditions) assert.ok(markdown.includes(
        mingjiaoJiuyangCapacityMarkdown(c.mingjiao_jiuyang_capacity, manifest)));
    // The shared legacy header is retained, but no capacity row enters its damage table.
    assert.ok(!markdown.slice(0, markdown.indexOf('### 九阳容量查询')).includes(prefix));
    assert.throws(() => schoolCombatMarkdown(report));
    const altered = clone(report); altered.conditions[0].mingjiao_jiuyang_capacity.series.smoke = true;
    assert.throws(() => schoolCombatMarkdown(altered, manifest));
    const ambiguous = clone(manifest), entry = ambiguous.entries.find(e => e.id === conditions[0].entry_id);
    ambiguous.entries.push({ ...entry, sha256: '0'.repeat(64) });
    ambiguous.identity.entries_sha256 = digest(ambiguous.entries); ambiguous.fingerprint = digest(ambiguous.identity);
    assert.throws(() => schoolCombatMarkdown(report, ambiguous));
    const legacy = { ...report, conditions: [] };
    assert.equal(schoolCombatMarkdown(legacy), schoolCombatMarkdown(legacy, manifest));
});

test('shared CLI确实传opened manifest，完整JSON/MD不回填原件且烟雾模式仍被严格拒绝', () => {
    const { directory, report, manifest } = syntheticSeries();
    const before = readSamples(directory, manifest), output = join(directory, 'synthetic-report');
    const child = spawnSync(process.execPath, [join(root, 'tools/tests/martial_data/school_combat_report.mjs'),
        directory, output], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.equal(child.error, undefined); assert.equal(child.signal, null);
    assert.equal(child.status, 0, child.stderr + child.stdout);
    assert.deepEqual(JSON.parse(readFileSync(join(output, 'school-combat.json'), 'utf8')), report);
    assert.equal(readFileSync(join(output, 'school-combat.md'), 'utf8'), schoolCombatMarkdown(report, manifest));
    assert.deepEqual(readSamples(directory, manifest), before);
    const smokeDirectory = join(directory, 'synthetic-smoke');
    createSeries(smokeDirectory, { inventory, catalog, conditions,
        execution: { collection: 'school-combat', smoke: true, explicitly_synthetic: true } });
    assert.throws(() => readSchoolCombat(smokeDirectory), /烟雾不是完整统计/);
});

test('runner沿真实USER命令和原receiver单次查询，owner/消息/两侧状态取实值且无新RNG或回调', () => {
    const source = read('tools/tests/martial_data/runner.lpc');
    const method = lpcFunction(source, 'do_interface');
    const capacity = method.slice(method.indexOf('if (current["parameters"]["collection_group"] == "mingjiao-jiuyang-capacity")'),
        method.indexOf('if (current["parameters"]["collection_group"] == "mingjiao-jiuyang-learning")'));
    assert.match(capacity, /spec\["object"\] == "\/kungfu\/skill\/jiuyang-shengong"/);
    assert.match(capacity, /spec\["object"\] == "player"/);
    for (const name of ['query_neili_improve', 'query_neili_limit', 'query_current_neili_limit']) assert.ok(capacity.includes(name));
    assert.match(capacity, /userp\(this_player\(\)\) && playerp\(this_player\(\)\) && interactive\(this_player\(\)\)/);
    assert.match(capacity, /"entry_actor": file_name\(this_player\(\)\)/);
    assert.match(capacity, /"before": snapshot\(players\[0\]\)/);
    assert.match(method, /result = call_other\(spec\["object"\], "query_neili_improve", players\[0\]\)/);
    assert.match(method, /result = call_other\(players\[0\], spec\["function"\]\)/);
    assert.match(method, /function_exists\(spec\["function"\],\s*spec\["object"\] == "player" \? players\[0\] : load_object\(spec\["object"\]\)\)/);
    assert.match(method, /require\(this_player\(\) == players\[0\]/);
    assert.match(method, /interface_step\["messages"\] = copy\(current\["skill_messages"\]\[message_start\.\.\]\)/);
    assert.match(method, /interface_step\["after"\] = snapshot\(players\[0\]\)/);
    assert.doesNotMatch(capacity, /random\(|call_out\(|query_action\(|set\(|set_temp\(/);
    const snap = lpcFunction(source, 'snapshot');
    assert.match(snap, /\(\{ "mingjiao-jiuyang-learning", "mingjiao-jiuyang-capacity",\s*"mingjiao-jiuyang-research" \}\)/);
    for (const key of ['effective_int', 'effective_dex', 'fighting_opponent', 'cultivation', 'breakup', 'reborn'])
        assert.ok(snap.includes('"' + key + '"'));
    assert.match(source, /players\[0\]->force_me\(action\)/);
});
