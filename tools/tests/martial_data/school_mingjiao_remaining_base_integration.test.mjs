// Offline wiring/contract checks. Synthetic fixtures are not native collection evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { digest } from './ledger.mjs';
import { collectionInput, createSandbox, selectConditions, validateQualificationSources, validateRecord } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';
import { mingjiaoRemainingBaseConditions, mingjiaoRemainingBaseProfiles,
    mingjiaoRemainingBaseSourcePaths, mingjiaoRemainingBaseReviewedSourceHash,
    validateMingjiaoRemainingBaseCondition } from './school_mingjiao_remaining_base_cases.mjs';
import { validateMingjiaoRemainingBaseRecord } from './school_mingjiao_remaining_base_record.mjs';
import { mingjiaoRemainingBaseReport, mingjiaoRemainingBaseMarkdown } from './school_mingjiao_remaining_base_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const clone = value => structuredClone(value), total = cases => cases.reduce((n, c) => n + c.samples, 0);
const group = 'mingjiao-remaining-base';
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const formal = mingjiaoRemainingBaseConditions(catalog, read);
const smoke = mingjiaoRemainingBaseConditions(catalog, read, { smoke: true });
let memorySnapshot;
// With no output path this only reads sources and reconstructs probe edits in memory.
const snapshot = () => memorySnapshot ??= createSandbox(root);
const source = read('tools/tests/martial_data/runner.lpc');
function section(from, to) {
    const start = source.indexOf(from), end = source.indexOf(to, start + from.length);
    assert.ok(start >= 0 && end > start, 'source window ' + from);
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
function syntheticFixtures() {
    const text = read('tools/tests/martial_data/school_mingjiao_remaining_base_record.test.mjs');
    const start = text.indexOf('const copy = '), end = text.indexOf('const bad = ', start);
    assert.ok(start >= 0 && end > start && end < text.indexOf('\ntest('));
    return new Function('assert', 'mingjiaoRemainingBaseProfiles', 'mingjiaoRemainingBaseConditions', 'read', 'sha',
        text.slice(start, end) + '\nreturn { formal, smoke, select, trace };')(assert,
        mingjiaoRemainingBaseProfiles, mingjiaoRemainingBaseConditions, path => Buffer.from(read(path)), sha256);
}
function row(raw, condition, manifest) {
    return { format: 1, fingerprint: manifest.fingerprint, condition_id: condition.id,
        condition_sha256: digest(condition), index: raw.index, outcome: raw.outcome, reason: raw.reason,
        raw_sha256: digest(raw), raw };
}

test('完整17766条件F/S原样保留，尾部仅追加原338条件/15670正式/676烟雾', () => {
    for (const [smokeMode, tail] of [[false, formal], [true, smoke]]) {
        const all = schoolCombatConditions(catalog, { smoke: smokeMode }).filter(c => !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout'].includes(c.parameters.collection_group));
        assert.equal(all.length, 18104); assert.equal(total(all), smokeMode ? 30492 : 493470);
        assert.equal(sha256(JSON.stringify(all.slice(0, 17766))), smokeMode
            ? '209bc416a95a808030a915793b2c08b62a1c105400b740b38da0773c66e72a44'
            : '008b464747314a55018a5b13261cc5b0f1f348677d84c15132e9745c1b03cb93');
        assert.deepEqual(all.slice(17766), tail);
        assert.equal(tail.length, 338); assert.equal(total(tail), smokeMode ? 676 : 15670);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        for (const c of tail) validateMingjiaoRemainingBaseCondition(c);
    }
    assert.equal(mingjiaoRemainingBaseProfiles.length, 13);
    assert.equal(mingjiaoRemainingBaseProfiles.filter(p => p.action_line).length, 12);
    assert.ok(formal.filter(c => c.parameters.skill === 'duoming-jinhua').every(c => c.method !== 'ordinary'));
});

test('全局精确组选择只取原338条件；旧18104窗口的前缀仍719项，未知组为空', () => {
    for (const [smokeMode, expected] of [[false, formal], [true, smoke]]) {
        const current = schoolCombatConditions(catalog, { smoke: smokeMode });
        assert.strictEqual(selectConditions(current, {}), current);
        assert.deepEqual(selectConditions(current, { caseGroup: group }), expected);
        const all = current.filter(c => !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout'].includes(c.parameters.collection_group));
        assert.strictEqual(selectConditions(all, {}), all); assert.equal(all.length, 18104);
        const selected = selectConditions(all, { caseGroup: group });
        assert.deepEqual(selected, expected); assert.equal(selected.length, 338);
        assert.equal(total(selected), smokeMode ? 676 : 15670);
        assert.ok(selected.every(c => c.parameters.collection_group === group && all.includes(c)));
        const oldPrefix = selectConditions(all, { casePrefix: 'school-mingjiao-remaining-' });
        assert.equal(oldPrefix.length, 719);
        assert.deepEqual(oldPrefix, all.filter(c => c.id.startsWith('school-mingjiao-remaining-')));
        assert.deepEqual(selectConditions(all, { case: expected[0].id }), [expected[0]]);
        assert.deepEqual(selectConditions(all, { caseGroup: group + '-unknown' }), []);
        assert.deepEqual(selectConditions(all, { casePrefix: 'school-mingjiao-remaining-base-' }), []);
    }
});

test('原81源码与入口严格绑定；漂移、缺源、缩样本及换mode均不能绕准入', () => {
    const { files } = snapshot(), evidence = formal[0].parameters.source_evidence;
    assert.equal(mingjiaoRemainingBaseSourcePaths.length, 81);
    assert.equal(sha256(JSON.stringify(mingjiaoRemainingBaseSourcePaths.map(p => [p, evidence[p]]))),
        mingjiaoRemainingBaseReviewedSourceHash);
    validateQualificationSources(formal, files);
    for (const path of mingjiaoRemainingBaseSourcePaths) {
        assert.equal(files[path], evidence[path]); assert.equal(files[path], sha256(read(path)));
        const missing = { ...files }; delete missing[path];
        assert.throws(() => validateQualificationSources([formal[0]], missing), path);
        assert.throws(() => validateQualificationSources([formal[0]], { ...files, [path]: '0'.repeat(64) }), path);
    }
    const c = formal.find(c => c.samples === 100);
    for (const edit of [c => { c.samples = 2; }, c => { c.parameters.run_mode = 'smoke'; },
        c => { delete c.parameters.run_mode; }, c => { c.entry_id += 'x'; },
        c => { c.parameters.actor.properties.jiali = 999; }]) {
        const changed = clone(c); edit(changed);
        assert.throws(() => validateMingjiaoRemainingBaseCondition(changed));
        assert.throws(() => validateQualificationSources([changed], files));
    }
});

test('七文件声明与原16/65探针原样；没有新角色或改写jobs/原时钟参数', () => {
    const { files, probes } = snapshot();
    // The frozen legacy declaration count excludes only the twelve newly registered files.
    const appended = ['force_remaining', 'combination'].flatMap(group =>
        ['cases.mjs', 'cases.test.mjs', 'record.mjs', 'record.test.mjs', 'report.mjs', 'report.test.mjs']
            .map(suffix => 'tools/tests/martial_data/school_mingjiao_' + group + '_' + suffix));
    assert.equal(appended.length, 12);
    for (const path of appended) assert.equal(files[path], sha256(read(path)), path);
    assert.equal(files['help/notice'], sha256(read('help/notice')), 'new public notice outside legacy snapshot');
    const legacyFiles = Object.keys(files).filter(path => path !== 'help/notice' && !appended.includes(path));
    assert.equal(legacyFiles.length, 10531);
    assert.equal(legacyFiles.filter(path => path.startsWith('tools/')).length, 376);
    for (const suffix of ['cases.mjs', 'cases.test.mjs', 'record.mjs', 'record.test.mjs',
        'report.mjs', 'report.test.mjs', 'integration.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_remaining_base_' + suffix;
        assert.equal(files[path], sha256(read(path)));
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
    const jobs = smoke.map(c => ({ condition_id: c.id, index: 0, method: c.method, parameters: c.parameters }));
    const before = clone(jobs), input = collectionInput(jobs);
    assert.equal(input.connections, 2); assert.deepEqual(JSON.parse(input.text), { jobs });
    assert.deepEqual(jobs, before);
});

test('producer记录原USER接口身份、原返回类型、真实practice与learned，不造命令受理', () => {
    const snap = section('mapping snapshot(object ob) {', 'void prepare_actor(');
    assert.match(snap, /is_mingjiao_remaining_perform\(\) \|\| is_mingjiao_remaining_base\(\)/);
    assert.match(snap, /learned = ob->query_learned\(\);/);
    assert.match(snap, /result\["learned_raw"\] = serializable\(learned\);/);
    assert.match(snap, /"special_skill\/piyi"/);
    const interfaces = section('int do_interface() {', 'void init()');
    assert.match(interfaces, /finite original remaining base USER interface/);
    assert.match(interfaces, /"entry_actor": file_name\(this_player\(\)\)/);
    assert.match(interfaces, /interface_step\["return_actor"\] = file_name\(this_player\(\)\)/);
    assert.match(interfaces, /interface_step\["implemented_by"\]/);
    assert.match(interfaces, /"result": serializable\(result\)/);
    assert.match(interfaces, /"factor"\] = serializable\(spec\["factor"\]\)/);
    const command = section('    if (action == "ordinary") {', 'void finish_needle_seed()');
    assert.match(command, /current\["ordinary_step"\]\["result"\] = serializable\(result\)/);
    assert.match(command, /"caller_side": member_array\(this_player\(\), players\)/);
    assert.match(command, /current\["command_accepted"\] = result;/);
    assert.match(command, /current\["practice_step"\]\["accepted"\] = result;/);
    assert.match(command, /players\[0\]->find_command\("practice"\)/);
    assert.doesNotMatch(command, /command_accepted"\] = 1;/);
});

test('单次普通种毒后停双方战斗，仅受害者原HB；原清除完成再零延迟结算', () => {
    const seed = section('    if (is_mingjiao_remaining_base() && current["method"] == "condition") {\n        expectation = parameters["requirements"];',
        '    if (current["method"] == "condition") {');
    assert.equal((seed.match(/COMBAT_D->do_attack\(/g) ?? []).length, 1);
    assert.match(seed, /expectation\["seed_attempts"\] == 1/);
    assert.match(seed, /remove_all_killer\(\);[\s\S]*remove_all_enemy\(1\);/);
    assert.match(seed, /"state": serializable\(reason\), "seeded": mapp\(reason\)/);
    assert.match(seed, /mapp\(reason\) \? "waiting" : "no_seed"/);
    assert.doesNotMatch(seed, /apply_condition|clear_condition|update_condition|random\(/);
    const hb = section('int strategy(object ob, int side) {', 'void terminal(');
    assert.match(hb, /side != 1 \|\| ob != players\[1\]/);
    for (const field of ['event_count_before', 'event_count_after', 'wall_time_before', 'wall_time_after', 'elapsed_before'])
        assert.ok(hb.includes('"' + field + '"'));
    assert.match(hb, /current\["condition_terminal"\] = "removed";[\s\S]*?call_out\("finish_sample", 0\)/);
    const advance = section('void advance() {', 'void start() {');
    assert.match(advance, /is_mingjiao_remaining_base\(\)[\s\S]*?current\["immediate_metrics"\]/);
    assert.match(advance, /current\["condition_seed"\]\["seeded"\][\s\S]*?players\[1\]->observation_heartbeat\(1\)/);
    const poll = section('void poll() {', 'void perform_sample()');
    assert.match(poll, /current\["condition_terminal"\] != "waiting"/);
    assert.match(poll, /watchdog_seconds[\s\S]*?current\["outcome"\] = "error"/);
    const error = section('int record_failure(mapping details) {', 'void injected_callback_error()');
    assert.match(error, /is_mingjiao_remaining_base\(\)[\s\S]*?call_out\("finish_sample", 0\)/);
});

test('诊断不冒完成；原清单模式和原rows严格绑定，缩样本/重签不能变成正式', () => {
    const c = formal.find(c => c.samples === 100), manifest = originalManifest();
    const diagnostic = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        elapsed: 0, outcome: 'error', reason: 'explicit synthetic failure; not native' };
    for (const check of [validateRecord, validateSchoolCombatRecord, validateMingjiaoRemainingBaseRecord]) {
        check(diagnostic, c);
        assert.throws(() => check({ ...diagnostic, outcome: 'observed', reason: '' }, c));
    }
    const absent = mingjiaoRemainingBaseReport([], c, manifest);
    assert.equal(absent.coverage.complete, false);
    assert.equal(absent.coverage.missing.length, c.samples);
    assert.ok(mingjiaoRemainingBaseMarkdown(absent, manifest, []).length > 0);
    const changed = clone(manifest); changed.identity.execution.smoke = true; changed.fingerprint = digest(changed.identity);
    assert.throws(() => mingjiaoRemainingBaseReport([], c, changed));
    const smaller = clone(c); smaller.samples = 2; smaller.parameters.run_mode = 'smoke';
    validateMingjiaoRemainingBaseCondition(smaller);
    assert.throws(() => mingjiaoRemainingBaseReport([], smaller, manifest));
    const tampered = clone(absent); tampered.coverage.complete = true;
    assert.throws(() => mingjiaoRemainingBaseMarkdown(tampered, manifest, []));
});

test('共享正文只传原condition/manifest/rows，本组不混通用零伤害统计', () => {
    const text = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(text, /condition\.mingjiao_remaining_base = mingjiaoRemainingBaseReport\(\s*rows\.filter\(r => r\.condition_id === condition\.id\), conditions\.find\(c => c\.id === condition\.id\), manifest\)/);
    assert.match(text, /filter\(c => !c\.mingjiao_force_remaining && !c\.mingjiao_remaining_base && !c\.mingjiao_remaining_perform/);
    const c = formal[0], manifest = originalManifest(), summary = mingjiaoRemainingBaseReport([], c, manifest);
    const shell = { fingerprint: manifest.fingerprint, evidence_sha256: digest([]),
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 },
        conditions: [{ id: c.id, parameters: c.parameters, effects: null, sides: null, mingjiao_remaining_base: summary }] };
    assert.ok(schoolCombatMarkdown(shell, manifest, []).includes(mingjiaoRemainingBaseMarkdown(summary, manifest, [])));
    assert.throws(() => schoolCombatMarkdown(shell, manifest));
    const changed = clone(shell); changed.conditions[0].mingjiao_remaining_base.coverage.complete = true;
    assert.throws(() => schoolCombatMarkdown(changed, manifest, []));
});

test('明确合成的普通/公共招架/接口/公开练习/毒/忙乱贯穿三消费者，缺原观察拒绝', () => {
    const fixture = syntheticFixtures(), manifest = originalManifest();
    const paths = [
        ['pili-quan', 'ordinary', 'baseline', {}],
        ['xiaoyao-jian', 'parry', 'mapped', {}],
        ['pili-shou', 'practice_skill', 'minimum', { qi: 6, neili: 64 }],
        ['pili-quan', 'public_practice', 'basic-plus-one', { qi: 55, neili: 45, gain: 13, cost: 476 }],
        ['pili-quan', 'public_practice', 'basic-equal-refusal', { cost: 0 }],
        ['pili-quan', 'valid_learn', 'minimum', { result: 1 }],
        ['pili-quan', 'valid_learn', 'force-below', { result: 0 }],
        ['tougu-zhen', 'poison', 'legal-level200', { result: 1 }],
        ['yinfeng-dao', 'poison', 'zero-incoming', { result: null }],
        ['xiaoyao-jian', 'busy_passive', 'zero-incoming', { result: 1 }],
        ['hanbing-mianzhang', 'poison_lifecycle', 'normal', {}],
        ['hanbing-mianzhang', 'poison_lifecycle', 'normal', { seed: true, recovery: true }],
        ['tougu-zhen', 'poison_lifecycle', 'immune', { seed: true }],
        ['yinfeng-dao', 'poison_lifecycle', 'nopoison', { seed: true }],
        ['hanbing-mianzhang', 'poison_lifecycle', 'piyi', {}],
    ];
    for (const [skill, ability, variant, options] of paths) {
        const c = fixture.select(skill, ability, variant), raw = fixture.trace(c, options);
        assert.deepEqual(c, formal.find(v => v.id === c.id));
        validateRecord(raw, c); validateSchoolCombatRecord(raw, c); validateMingjiaoRemainingBaseRecord(raw, c);
        const rows = [row(raw, c, manifest)], summary = mingjiaoRemainingBaseReport(rows, c, manifest);
        assert.equal(summary.coverage.supplied, 1); assert.equal(summary.coverage.complete, false);
        assert.ok(mingjiaoRemainingBaseMarkdown(summary, manifest, rows).length > 0);
        const changed = clone(raw); delete changed.immediate_metrics;
        assert.throws(() => validateSchoolCombatRecord(changed, c));
        assert.throws(() => validateMingjiaoRemainingBaseRecord(changed, c));
        assert.throws(() => mingjiaoRemainingBaseReport([row(changed, c, manifest)], c, manifest));
        assert.throws(() => mingjiaoRemainingBaseMarkdown(summary, manifest, []));
    }
});
