// Offline wiring checks only: no driver, live service, or native evidence is created.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { digest } from './ledger.mjs';
import { collectionInput, createSandbox, validateQualificationSources, validateRecord } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';
import { mingjiaoRemainingPerformConditions, mingjiaoRemainingPerformSourcePaths,
    mingjiaoRemainingPerformAbsentPaths, validateMingjiaoRemainingPerformCondition,
} from './school_mingjiao_remaining_perform_cases.mjs';
import { validateMingjiaoRemainingPerformRecord } from './school_mingjiao_remaining_perform_record.mjs';
import { mingjiaoRemainingPerformReport, mingjiaoRemainingPerformMarkdown } from './school_mingjiao_remaining_perform_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const clone = value => structuredClone(value), total = cases => cases.reduce((n, c) => n + c.samples, 0);
const group = 'mingjiao-remaining-perform';
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const formal = mingjiaoRemainingPerformConditions(catalog, read);
const smoke = mingjiaoRemainingPerformConditions(catalog, read, { smoke: true });
let memorySnapshot;
// Without output, createSandbox reads hashes/probe descriptors into memory; it writes no MUDLIB.
const snapshot = () => memorySnapshot ??= createSandbox(root);
const source = read('tools/tests/martial_data/runner.lpc');
function section(from, to) {
    const start = source.indexOf(from), end = source.indexOf(to, start + from.length);
    assert.ok(start >= 0 && end > start, 'unique source window ' + from);
    assert.equal(source.indexOf(from, start + from.length), -1, 'ambiguous source window ' + from);
    return source.slice(start, end);
}
function originalManifest(conditions = formal, smokeMode = false) {
    const entries = catalog.skills.flatMap(s => [{ id: s.path, path: s.path, role: 'file', sha256: s.sha256 },
        ...s.entries.map(e => ({ id: e.id, path: s.path, role: e.role, sha256: s.sha256 }))]);
    const identity = { source_fingerprint: inventory.source_fingerprint,
        dictionary_sha256: catalog.dictionary_sha256, entries_sha256: digest(entries), conditions,
        execution: { collection: 'school-combat', smoke: smokeMode,
            source_files: formal[0].parameters.source_evidence, explicitly_synthetic: true } };
    return { format: 1, kind: 'martial_data_series', identity, fingerprint: digest(identity), entries };
}
// Reuse only the hand-written synthetic fixture declarations; no test module is executed,
// no observation is generated from native data, and nothing is persisted as collection evidence.
function syntheticFixtures() {
    const text = read('tools/tests/martial_data/school_mingjiao_remaining_perform_record.test.mjs');
    const start = text.indexOf('const copy = '), end = text.indexOf('const bad = ', start);
    assert.ok(start >= 0 && end > start && end < text.indexOf('\ntest('));
    return new Function('assert', 'factory', 'read', 'sha', text.slice(start, end)
        + '\nreturn { formal, smoke, selected, trace };')(assert, mingjiaoRemainingPerformConditions,
        path => Buffer.from(read(path)), sha256);
}
function row(raw, condition, manifest) {
    return { format: 1, fingerprint: manifest.fingerprint, condition_id: condition.id,
        condition_sha256: digest(condition), index: raw.index, outcome: raw.outcome, reason: raw.reason,
        raw_sha256: digest(raw), raw };
}

test('原17438条件完整F/S顺序与全部字段不变，仅尾追加原328准备条件', () => {
    for (const [smokeMode, tail] of [[false, formal], [true, smoke]]) {
        const current = schoolCombatConditions(catalog, { smoke: smokeMode }).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
        const all = current.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-remaining-base', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
        assert.equal(current.length, 18104);
        assert.equal(total(current), smokeMode ? 30492 : 493470);
        assert.deepEqual(current.slice(0, 17766), all);
        assert.equal(all.length, 17766);
        assert.equal(total(all), smokeMode ? 29816 : 477800);
        assert.equal(sha256(JSON.stringify(all.slice(0, 17438))), smokeMode
            ? '563eb822eb787f00ff0bab5c07b9a4e0fea34e4880997fa6babdfa996de041ab'
            : '5662085f6c6e8fba0522b8379afdeaefe08b6b96bba5aa3a9f013f725639568e');
        assert.deepEqual(all.slice(17438), tail);
        assert.equal(tail.length, 328); assert.equal(total(tail), smokeMode ? 656 : 16532);
        assert.equal(sha256(JSON.stringify(tail)), smokeMode
            ? '05fd84560881a7be996eed9bdba6a4d670442528314c3fc74eaf343f2432432d'
            : '79dc43dd74c7a9f377a447f6954209868b6a1364066ada9b257da75b845acaab');
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        for (const c of tail) validateMingjiaoRemainingPerformCondition(c);
    }
});

test('原105来源/65缺席与17入口逐一绑定；缺源、漂移、缩样本均拒绝', () => {
    const { files } = snapshot(), evidence = formal[0].parameters.source_evidence;
    assert.equal(mingjiaoRemainingPerformSourcePaths.length, 105);
    assert.equal(mingjiaoRemainingPerformAbsentPaths.length, 65);
    assert.equal(new Set(formal.map(c => c.entry_id)).size, 17);
    validateQualificationSources(formal, files);
    for (const path of mingjiaoRemainingPerformSourcePaths) {
        assert.equal(files[path], evidence[path]); assert.equal(files[path], sha256(read(path)));
        for (const missing of [true, false]) {
            const bad = { ...files }; if (missing) delete bad[path]; else bad[path] = '0'.repeat(64);
            assert.throws(() => validateQualificationSources([formal[0]], bad), path);
        }
    }
    for (const path of mingjiaoRemainingPerformAbsentPaths) assert.equal(files[path], undefined);
    for (const edit of [c => { c.samples = 2; }, c => { c.parameters.run_mode = 'smoke'; },
        c => { delete c.parameters.run_mode; }, c => { c.entry_id += 'x'; },
        c => { c.parameters.source_entry.role = 'other_function'; },
        c => { c.parameters.actor.properties.jiali = 999; }]) {
        const bad = clone(formal[0]); edit(bad);
        assert.throws(() => validateMingjiaoRemainingPerformCondition(bad));
        assert.throws(() => validateQualificationSources([bad], files));
    }
});

test('七个工具完整声明；原15/48与唯一yanlian17探针保持原字节可逆', () => {
    const { files, probes } = snapshot();
    // The frozen legacy declaration count excludes only the twelve newly registered files.
    const appended = ['force_remaining', 'combination'].flatMap(group =>
        ['cases.mjs', 'cases.test.mjs', 'record.mjs', 'record.test.mjs', 'report.mjs', 'report.test.mjs']
            .map(suffix => 'tools/tests/martial_data/school_mingjiao_' + group + '_' + suffix));
    assert.equal(appended.length, 12);
    for (const path of appended) assert.equal(files[path], sha256(read(path)), path);
    assert.equal(files['help/notice'], sha256(read('help/notice')), 'new public notice outside legacy snapshot');
    const legacyFiles = Object.keys(files).filter(path => path !== 'help/notice' && !(appended.includes(path) || ['tools/tests/martial_data/school_slice1_cases.mjs', 'tools/tests/martial_data/school_slice1_cases.test.mjs', 'tools/tests/martial_data/school_slice1_preparation.test.mjs', 'tools/tests/martial_data/school_slice2_cases.mjs', 'tools/tests/martial_data/school_slice2_cases.test.mjs', 'tools/tests/martial_data/school_slice2_preparation.test.mjs', 'tools/tests/martial_data/school_slice3_cases.mjs', 'tools/tests/martial_data/school_slice3_cases.test.mjs', 'tools/tests/martial_data/school_slice3_preparation.test.mjs', 'tools/tests/martial_data/school_slice4_cases.mjs', 'tools/tests/martial_data/school_slice4_cases.test.mjs', 'tools/tests/martial_data/school_slice4_preparation.test.mjs', 'tools/tests/martial_data/school_slice5_cases.mjs', 'tools/tests/martial_data/school_slice5_cases.test.mjs', 'tools/tests/martial_data/school_slice5_preparation.test.mjs', 'tools/tests/martial_data/school_slice6_cases.mjs', 'tools/tests/martial_data/school_slice6_cases.test.mjs', 'tools/tests/martial_data/school_slice6_preparation.test.mjs', 'tools/tests/martial_data/school_slice7_cases.mjs', 'tools/tests/martial_data/school_slice7_cases.test.mjs', 'tools/tests/martial_data/school_slice7_preparation.test.mjs', 'tools/tests/martial_data/school_slice8_cases.mjs', 'tools/tests/martial_data/school_slice8_cases.test.mjs', 'tools/tests/martial_data/school_slice8_preparation.test.mjs', 'tools/tests/martial_data/public_special_cases.mjs', 'tools/tests/martial_data/public_special_cases.test.mjs', 'tools/tests/martial_data/b1_perform_cases.mjs', 'tools/tests/martial_data/b1_perform_cases.test.mjs', 'tools/tests/martial_data/b2_perform_cases.mjs', 'tools/tests/martial_data/b2_perform_cases.test.mjs', 'tools/tests/martial_data/b3_perform_cases.mjs', 'tools/tests/martial_data/b3_perform_cases.test.mjs', 'tools/tests/martial_data/b4_perform_cases.mjs', 'tools/tests/martial_data/b4_perform_cases.test.mjs', 'tools/tests/martial_data/b5_perform_cases.mjs', 'tools/tests/martial_data/b5_perform_cases.test.mjs', 'tools/tests/martial_data/b6_perform_cases.mjs', 'tools/tests/martial_data/b6_perform_cases.test.mjs', 'tools/tests/martial_data/b7_perform_cases.mjs', 'tools/tests/martial_data/b7_perform_cases.test.mjs', 'tools/tests/martial_data/b8_perform_cases.mjs', 'tools/tests/martial_data/b8_perform_cases.test.mjs', 'tools/tests/martial_data/b9_perform_cases.mjs', 'tools/tests/martial_data/b9_perform_cases.test.mjs', 'tools/tests/martial_data/b10_perform_cases.mjs', 'tools/tests/martial_data/b10_perform_cases.test.mjs', 'tools/tests/martial_data/b11_perform_cases.mjs', 'tools/tests/martial_data/b11_perform_cases.test.mjs', 'tools/tests/martial_data/b12_perform_cases.mjs', 'tools/tests/martial_data/b12_perform_cases.test.mjs', 'tools/tests/martial_data/b13_perform_cases.mjs', 'tools/tests/martial_data/b13_perform_cases.test.mjs', 'tools/tests/martial_data/b14_perform_cases.mjs', 'tools/tests/martial_data/b14_perform_cases.test.mjs', 'tools/tests/martial_data/b15_perform_cases.mjs', 'tools/tests/martial_data/b15_perform_cases.test.mjs', 'tools/tests/martial_data/b16_perform_cases.mjs', 'tools/tests/martial_data/b16_perform_cases.test.mjs', 'tools/tests/martial_data/b17_perform_cases.mjs', 'tools/tests/martial_data/b17_perform_cases.test.mjs', 'tools/tests/martial_data/b18_perform_cases.mjs', 'tools/tests/martial_data/b18_perform_cases.test.mjs', 'tools/tests/martial_data/b19_perform_cases.mjs', 'tools/tests/martial_data/b19_perform_cases.test.mjs', 'tools/tests/martial_data/b20_perform_cases.mjs', 'tools/tests/martial_data/b20_perform_cases.test.mjs', 'tools/tests/martial_data/b21_perform_cases.mjs', 'tools/tests/martial_data/b21_perform_cases.test.mjs', 'tools/tests/martial_data/b20_perform_cases.mjs', 'tools/tests/martial_data/b20_perform_cases.test.mjs', 'tools/tests/martial_data/b19_perform_cases.mjs', 'tools/tests/martial_data/b19_perform_cases.test.mjs', 'tools/tests/martial_data/b22_perform_cases.mjs', 'tools/tests/martial_data/b22_perform_cases.test.mjs', 'tools/tests/martial_data/b23_perform_cases.mjs', 'tools/tests/martial_data/b23_perform_cases.test.mjs', 'tools/tests/martial_data/b24_perform_cases.mjs', 'tools/tests/martial_data/b24_perform_cases.test.mjs', 'tools/tests/martial_data/b25_perform_cases.mjs', 'tools/tests/martial_data/b25_perform_cases.test.mjs', 'tools/tests/martial_data/b26_perform_cases.mjs', 'tools/tests/martial_data/b26_perform_cases.test.mjs', 'tools/tests/martial_data/b27_perform_cases.mjs', 'tools/tests/martial_data/b27_perform_cases.test.mjs', 'tools/tests/martial_data/b28_perform_cases.mjs', 'tools/tests/martial_data/b28_perform_cases.test.mjs', 'tools/tests/martial_data/b29_perform_cases.mjs', 'tools/tests/martial_data/b29_perform_cases.test.mjs', 'tools/tests/martial_data/school_quanzhen_combination_cases.mjs', 'tools/tests/martial_data/school_huashan_combination_cases.mjs', 'tools/tests/martial_data/school_slice_combination.test.mjs', 'tools/tests/martial_data/school_slice_combination_cases.mjs', 'tools/tests/martial_data/school_bout_perform.test.mjs', 'tools/tests/martial_data/school_bout_perform_cases.mjs', 'tools/tests/martial_data/school_taohua_bout.test.mjs', 'tools/tests/martial_data/school_taohua_bout_cases.mjs', 'tools/tests/martial_data/school_mingjiao_bout.test.mjs', 'tools/tests/martial_data/school_mingjiao_bout_cases.mjs', 'tools/tests/martial_data/school_huashan_bout.test.mjs', 'tools/tests/martial_data/school_huashan_bout_cases.mjs', 'tools/tests/martial_data/school_quanzhen_bout.test.mjs', 'tools/tests/martial_data/school_quanzhen_bout_cases.mjs', 'tools/tests/martial_data/school_npc_grant_cases.mjs', 'tools/tests/martial_data/school_public_exert_cases.mjs'].includes(path)));
    assert.equal(legacyFiles.length, 10536 + 5, 'five appended effect/consumer test inputs; legacy baseline unchanged');
    assert.equal(legacyFiles.filter(path => path.startsWith('tools/')).length, 381 + 5);
    for (const suffix of ['cases.mjs', 'cases.test.mjs', 'record.mjs', 'record.test.mjs',
        'report.mjs', 'report.test.mjs', 'integration.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_remaining_perform_' + suffix;
        assert.equal(files[path], sha256(read(path)), path);
    }
    assert.equal(probes.length, 16); assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 65);
    assert.equal(sha256(JSON.stringify(probes.slice(0, 15))),
        'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    assert.equal(probes[15].path, 'cmds/skill/yanlian.c'); assert.equal(probes[15].sites.length, 17);
    for (const probe of probes) {
        const original = read(probe.path); assert.equal(sha256(original), probe.before);
        let changed = original;
        const edits = probe.sites.map(s => Array.isArray(s) ? [s[0], s[1] + s[0]] :
            [s.anchor, s.replacement ?? (s.position === 'before' ? s.insert + s.anchor : s.anchor + s.insert)]);
        for (const [from, to] of edits) { assert.equal(changed.split(from).length, 2); changed = changed.replace(from, to); }
        assert.equal(sha256(changed), probe.after);
        for (const [from, to] of edits.toReversed()) { assert.equal(changed.split(to).length, 2); changed = changed.replace(to, from); }
        assert.equal(changed, original);
    }
});

test('真实第三USER只由原四个NUOYI条件要求；原jobs/动作字符串不重写', () => {
    const jobs = smoke.map(c => ({ condition_id: c.id, index: 0, method: c.method, parameters: c.parameters }));
    const before = clone(jobs), input = collectionInput(jobs);
    assert.equal(input.connections, 3); assert.equal(input.bytes, Buffer.byteLength(input.text));
    assert.deepEqual(JSON.parse(input.text), { jobs, connections: 3 }); assert.deepEqual(jobs, before);
    const third = jobs.filter(j => j.parameters.extra_target);
    assert.equal(third.length, 4);
    assert.ok(third.every(j => j.parameters.ability === 'nuoyi' && j.parameters.extra_target_fighting === true));
    assert.equal(collectionInput(jobs.filter(j => !j.parameters.extra_target)).connections, 2);
    assert.ok(jobs.every(j => j.parameters.action.startsWith('perform ') && j.parameters.observe_seconds === 0));
});

test('producer只增加新组观察，原USER命令返回/早拒绝/熟练原类型不填预测', () => {
    const guard = section('private int is_mingjiao_remaining_perform()', 'void emit(');
    assert.match(guard, /collection_group"\] == "mingjiao-remaining-perform"/);
    const state = section('mapping snapshot(object ob) {', '// Keep the actual pre-command object');
    assert.match(state, /learned = ob->query_learned\(\);/);
    assert.match(state, /result\["learned_raw"\] = serializable\(learned\)/);
    assert.match(state, /undefinedp\(learned\) \? "undefined"/);
    for (const key of ['effective_dex', 'effective_int', 'character', 'not_living',
        'secondary_weapon_details', 'fighting_opponent', 'killing_opponent', 'conditions'])
        assert.ok(state.includes('result["' + key + '"]'));
    const steps = section('void observe_hubo_step(', 'void observe_hubo_busy(');
    assert.match(steps, /active && is_mingjiao_remaining_perform\(\)/);
    assert.match(steps, /base_name\(previous_object\(\)\) == "\/cmds\/skill\/perform"/);
    assert.match(steps, /"caller_side": member_array\(this_player\(\), players\)/);
    assert.match(steps, /step\["accepted"\] = result/); assert.match(steps, /step\["after"\] = states/);
    const perform = section('void perform_sample() {', 'void observe_needle_hit(');
    assert.match(perform, /"force_me_source": function_exists\("force_me", players\[0\]\)/);
    assert.match(perform, /result = players\[0\]->force_me\(action\);\s*current\["command_accepted"\] = result/);
    assert.match(perform, /is_mingjiao_remaining_perform\(\)\) &&\s*!result && !sizeof\(current\["refusals"\]\)/);
    assert.match(perform, /reason = players\[0\]->query_temp\("notify_fail"\)/);
});

test('HUA真flower_leaf同物三时点，沿原零延迟析构；不直接调用或伪造命中', () => {
    const setup = section('void prepare_actor(', 'void observe_attack(');
    assert.match(setup, /is_mingjiao_remaining_perform\(\) &&\s*current\["parameters"\]\["ability"\] == "hua"/);
    assert.match(setup, /config\["equipment"\]\["program"\] == "\/clone\/weapon\/flower_leaf"/);
    const flower = section('private void observe_remaining_perform_flower(', 'mixed *practice_material_snapshot(');
    assert.match(flower, /remaining_perform_flower = held/);
    assert.match(flower, /equipment_snapshot\(remaining_perform_flower\)/);
    assert.match(flower, /"exists": objectp\(remaining_perform_flower\)/);
    assert.match(flower, /held == remaining_perform_flower/);
    for (const phase of ['before', 'immediate', 'after'])
        assert.equal(source.split(`observe_remaining_perform_flower("${phase}");`).length, 2);
    const advance = section('void advance() {', 'void start() {');
    assert.match(advance, /ability"\] == "hua"\) \{[\s\S]*?call_out\("finish_sample", 0\);/);
    assert.doesNotMatch(flower, /destruct\(|destruct_me|->hit_ob\(|random\(/);
    const hit = section('void observe_needle_hit(', '// Read the original skill timer');
    assert.match(hit, /weapon == remaining_perform_flower/);
    assert.match(hit, /"object": file_name\(weapon\), "damage_bonus": damage_bonus/);
});

test('NUOYI真实敌对和三侧观察；KUAI实际调用与被动，不增随机或planned_N', () => {
    const perform = section('void perform_sample() {', 'void observe_needle_hit(');
    assert.match(perform, /is_mingjiao_remaining_perform\(\)\) &&\s*parameters\["extra_target_fighting"\]/);
    assert.match(perform, /players\[0\]->kill_ob\(players\[2\]\)/);
    assert.match(perform, /players\[2\]->kill_ob\(players\[0\]\)/);
    assert.match(perform, /"enemy_context"\] = \(\[ "before": map\(players\[0\]->query_enemy\(\)/);
    for (const [from, to] of [['void begin_passive(', 'void observe_passive('],
        ['void observe_passive(', 'void observe_dodge('], ['void observe_direct(', 'void observe_scene_lifecycle(']])
        assert.ok(section(from, to).includes('"mingjiao-remaining-perform"'));
    const busy = section('void observe_hubo_busy(', 'void observe_condition_tick(');
    assert.match(busy, /\(is_mingjiao_remaining_perform\(\) \|\| is_mingjiao_remaining_base\(\)\) && !requested/);
    assert.match(busy, /call\["zero_return"\] = 1/);
    assert.match(busy, /call\["after"\] = serializable\(me->query_busy\(\)\)/);
    assert.doesNotMatch(busy, /random\(|start_busy\(|restore_busy\(/);
    assert.doesNotMatch(source, /current\["(?:planned_N|planned_attacks)"\]\s*=/);
});

test('诊断三消费者不冒正常样本，空报告不冒完整16532；原manifest模式不能重签偷换', () => {
    const c = formal[0], manifest = originalManifest();
    const diagnostic = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        elapsed: 0, outcome: 'error', reason: 'explicit synthetic observation failure; not native' };
    validateRecord(diagnostic, c); validateSchoolCombatRecord(diagnostic, c);
    validateMingjiaoRemainingPerformRecord(diagnostic, c);
    const absent = mingjiaoRemainingPerformReport([], c, manifest);
    assert.equal(absent.coverage.complete, false); assert.equal(absent.coverage.missing.length, c.samples);
    assert.equal(absent.effects.known, false); assert.equal(absent.effects.commands_accepted, null);
    const md = mingjiaoRemainingPerformMarkdown(absent, manifest, []);
    assert.equal(typeof md, 'string'); assert.ok(md.length > 0);
    const bad = clone(manifest); bad.identity.execution.smoke = true; bad.fingerprint = digest(bad.identity);
    assert.throws(() => mingjiaoRemainingPerformReport([], c, bad));
    assert.throws(() => mingjiaoRemainingPerformMarkdown(absent, bad, []));
    const smaller = clone(c); smaller.parameters.run_mode = 'smoke'; smaller.samples = 2;
    validateMingjiaoRemainingPerformCondition(smaller);
    assert.throws(() => mingjiaoRemainingPerformReport([], smaller, manifest));
    const altered = clone(absent); altered.coverage.complete = true;
    assert.throws(() => mingjiaoRemainingPerformMarkdown(altered, manifest, []));
    const incomplete = { ...diagnostic, outcome: 'observed', reason: '' };
    for (const check of [validateRecord, validateSchoolCombatRecord, validateMingjiaoRemainingPerformRecord])
        assert.throws(() => check(incomplete, c));
});

test('共享报告准确传原condition/manifest/rows，正文不把本组塞入通用零伤害表', () => {
    // The disk-backed readSchoolCombat reader is inspected here, not exercised with invented driver logs.
    const text = read('tools/tests/martial_data/school_combat_report.mjs');
    const start = text.indexOf("if (condition.parameters.collection_group === 'mingjiao-remaining-perform')"),
        end = text.indexOf("} else if (condition.parameters.collection_group === 'mingjiao-jiuyang-fusion')", start);
    assert.ok(start >= 0 && end > start);
    assert.match(text.slice(start, end), /condition\.effects = null;\s*condition\.sides = null;/);
    assert.match(text.slice(start, end), /mingjiaoRemainingPerformReport\(\s*rows\.filter\(r => r\.condition_id === condition\.id\), conditions\.find\(c => c\.id === condition\.id\), manifest\)/);
    const c = formal[0], manifest = originalManifest(), summary = mingjiaoRemainingPerformReport([], c, manifest);
    const shell = { fingerprint: manifest.fingerprint, evidence_sha256: digest([]),
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 },
        conditions: [{ id: c.id, parameters: c.parameters, effects: null, sides: null,
            mingjiao_remaining_perform: summary }] };
    const markdown = schoolCombatMarkdown(shell, manifest, []), heading = '### pili-quan/jin';
    assert.ok(markdown.includes(heading));
    assert.ok(!markdown.slice(0, markdown.indexOf(heading)).includes(c.id));
    assert.throws(() => schoolCombatMarkdown(shell, manifest));
    assert.throws(() => schoolCombatMarkdown(shell, undefined, []));
    const changed = clone(shell); changed.conditions[0].mingjiao_remaining_perform.coverage.complete = true;
    assert.throws(() => schoolCombatMarkdown(changed, manifest, []));
});

test('明确合成的HUA/NUOYI/KUAI/毒种子/早拒绝贯穿三消费者；缺观察即使重签仍拒绝', () => {
    const fixtures = syntheticFixtures(), manifest = originalManifest();
    assert.deepEqual(fixtures.formal, formal); assert.deepEqual(fixtures.smoke, smoke);
    const cases = [['hua', 'petals10', {}], ['hua', 'petals11', {}], ['hua', 'petals9', {}],
        ['hua', 'wrong-held-item', {}], ['hua', 'no-held-item', {}],
        ['nuoyi', 'middle-with-third', { redirect: true }], ['kuai', 'level400', { passive: true }],
        ['feng', 'level400', { poison: true }], ['jue', 'level400', { poison: true }],
        ['jin', 'actor-busy1', {}], ['jin', 'no-perform', {}]];
    for (const [ability, variant, options] of cases) {
        const c = fixtures.selected(ability, variant), raw = fixtures.trace(c, options);
        validateRecord(raw, c); validateSchoolCombatRecord(raw, c);
        const evidence = validateMingjiaoRemainingPerformRecord(raw, c), rows = [row(raw, c, manifest)];
        const report = mingjiaoRemainingPerformReport(rows, c, manifest);
        assert.deepEqual(report.records[0].evidence, evidence);
        assert.equal(report.coverage.supplied, 1); assert.equal(report.coverage.complete, false);
        assert.equal(report.effects.measured_records, 1);
        assert.equal(report.effects.command_cost, raw.command_accepted);
        assert.equal(report.effects.unknown.requested_gross_damage, null);
        assert.equal(report.effects.unknown.planned_kuai_attacks, null);
        assert.equal(report.effects.unknown.poison_natural_lifecycle, null);
        assert.ok(mingjiaoRemainingPerformMarkdown(report, manifest, rows).includes('未知'));
        if (ability === 'hua') assert.equal(report.effects.flower.consumed, raw.command_accepted ? 10 : 0);
        if (ability === 'nuoyi') assert.equal(report.effects.resources.length, 3);
        if (options.passive) assert.equal(report.effects.actual_calls.passives, 1);
        if (options.poison) assert.equal(report.effects.poison_seed_records, 1);
        const missing = clone(raw); delete missing.before[0].learned_raw;
        // execution's importer runs generic validation followed by the school dispatch;
        // the generic validator alone deliberately has no group-specific learned contract.
        for (const check of [(r, condition) => { validateRecord(r, condition); validateSchoolCombatRecord(r, condition); },
            validateSchoolCombatRecord, validateMingjiaoRemainingPerformRecord])
            assert.throws(() => check(missing, c), ability + '/' + variant);
        assert.throws(() => mingjiaoRemainingPerformReport([row(missing, c, manifest)], c, manifest));
        const changed = clone(report); changed.effects.commands_accepted = 999;
        assert.throws(() => mingjiaoRemainingPerformMarkdown(changed, manifest, rows));
    }
});
