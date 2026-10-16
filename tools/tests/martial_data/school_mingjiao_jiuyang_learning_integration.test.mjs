// Wiring checks only; real USER observations are separate immutable evidence series.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { mingjiaoJiuyangLearningConditions, mingjiaoJiuyangLearningSourcePaths } from './school_mingjiao_jiuyang_learning_cases.mjs';
import { mingjiaoJiuyangLearningReport } from './school_mingjiao_jiuyang_learning_report.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root)), cases = mingjiaoJiuyangLearningConditions(catalog, read);
const group = 'mingjiao-jiuyang-learning';

test('九阳学习资格仅尾追加37确定条件，74记录／82原命令与烟雾分别闭合', () => {
    const all = schoolCombatConditions(catalog).filter(c => c.parameters.collection_group !== 'mingjiao-jiuyang-direct' && c.parameters.collection_group !== 'mingjiao-jiuyang-remaining' && c.parameters.collection_group !== 'mingjiao-jiuyang-exert' && c.parameters.collection_group !== 'mingjiao-jiuyang-capacity' && c.parameters.collection_group !== 'mingjiao-jiuyang-research' && c.parameters.collection_group !== 'mingjiao-jiuyang-fusion' && c.parameters.collection_group !== 'mingjiao-remaining-perform' && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout'].includes(c.parameters.collection_group) && c.parameters.collection_group !== 'mingjiao-remaining-base'),
        added = all.filter(c => c.parameters.collection_group === group);
    assert.deepEqual(added, cases); assert.deepEqual(all.slice(-37), cases);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 74);
    assert.equal(cases.reduce((n, c) => n + c.samples * (c.parameters.interface_repetitions ?? 1), 0), 82);
    assert.equal(mingjiaoJiuyangLearningConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 74);
    assert.equal(cases.filter(c => c.parameters.interface_repetitions === 2).length, 4);
    const old = all.filter(c => c.parameters.collection_group !== group);
    assert.equal(old.length, 17163); assert.equal(old.reduce((n, c) => n + c.samples, 0), 454250);
    assert.equal(sha256(JSON.stringify(old)), '9f56357df688180505888bbe41a776ca8978f1b832329a42ba32547ce67bb627');
    assert.equal(all.filter(c => c.id.startsWith('school-mingjiao-jiuyang-')).length, 67);
});

test('125来源与五新工具逐文件冻结，缺源／篡改资格拒绝', () => {
    const s = createSandbox(root); validateQualificationSources(cases, s.files);
    assert.equal(mingjiaoJiuyangLearningSourcePaths.length, 125);
    for (const path of mingjiaoJiuyangLearningSourcePaths) assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    for (const name of ['cases.mjs', 'cases.test.mjs', 'integration.test.mjs', 'report.mjs', 'report.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_jiuyang_learning_' + name;
        assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    }
    const path = mingjiaoJiuyangLearningSourcePaths[0];
    assert.throws(() => validateQualificationSources(cases, { ...s.files, [path]: '0'.repeat(64) }));
    const bad = structuredClone(cases[0]); bad.parameters.interface_repetitions = 10;
    assert.throws(() => validateQualificationSources([bad], s.files));
});

test('原USER分步调用与前后快照观察，不调用模拟学习或写兵器许可', () => {
    const src = read('tools/tests/martial_data/runner.lpc');
    assert.match(src, /finite original Jiuyang learning USER context/);
    assert.match(src, /interface_step = \(\[ "command": "test_interface", "entry_actor": file_name\(this_player\(\)\),\s*"before": snapshot\(players\[0\]\) \]\);/);
    assert.match(src, /interface_step\["after"\] = snapshot\(players\[0\]\);/);
    assert.match(src, /current\["interface_steps"\] \+= \(\{ interface_step \}\);/);
    assert.match(src, /one original Jiuyang interface per USER command/);
    assert.match(src, /member_array\(parameters\["interface_repetitions"\], \(\{ 1, 2 \}\)\)/);
    const exertBefore = '    if (parameters["collection_group"] == "mingjiao-jiuyang-exert") {\n'
        + '        current["skill_messages"] = ({});\n'
        + '        current["exert_room"] = ([ "no_fight": query("no_fight"), "skybook": query("skybook") ]);\n'
        + '        current["relation_context"] = ([ "before": jiuyang_exert_relations() ]);\n'
        + '        if (mapp(parameters["extra_target"])) current["extra_target_before"] = snapshot(players[2]);\n    }\n';
    const remainingBefore = '    if (is_mingjiao_remaining_perform()) {\n'
        + '        current["skill_messages"] = ({});\n'
        + '        current["enemy_context"] = ([ "before": map(players[0]->query_enemy(),\n'
        + '            (: member_array($1, players) :)) ]);\n'
        + '        observe_remaining_perform_flower("before");\n    }\n';
    const baseBefore = '    if (is_mingjiao_remaining_base()) current["skill_messages"] = ({});\n';
    assert.equal(src.split(baseBefore).length, 2, 'one exact remaining-base-only before observation');
    assert.equal(src.split(remainingBefore).length, 2, 'one exact remaining-perform-only before observation');
    assert.equal(src.split(exertBefore).length, 2, 'one exact exert-only before observation');
    assert.match(src.replace(baseBefore, '').replace(remainingBefore, '').replace(exertBefore, ''), /current\["before"\] = \(\{ snapshot\(players\[0\]\), snapshot\(players\[1\]\) \}\);\s*if \(member_array\(parameters\["collection_group"\],\s*\(\{ "mingjiao-jiuyang-learning", "mingjiao-jiuyang-capacity",\s*"mingjiao-jiuyang-research" \}\)\) != -1\)\s*current\["skill_messages"\] = \(\{\}\);/);
    assert.doesNotMatch(src, /set\("can_learn\/jiuyang-shengong\/enable_weapon"/);
    assert.match(src, /!side && current\["parameters"\]\["collection_group"\] == "mingjiao-jiuyang-learning" &&\s*current\["parameters"\]\["variant"\] == "raw-con-effective-high" &&\s*key == "apply\/con" && value == 5/);
    assert.doesNotMatch(src, /random\([^\n]*mingjiao-jiuyang-learning/);
});

test('统一校验入口拒绝无效身份，错误不冒资格成功', () => {
    const raw = { kind: 'sample', condition_id: cases[0].id, method: cases[0].method,
        index: 0, elapsed: 0, outcome: 'error', reason: 'synthetic diagnostic only' };
    assert.equal(validateSchoolCombatRecord(raw, cases[0]), null);
    assert.throws(() => validateSchoolCombatRecord({ ...raw, index: null }, cases[0]));
    assert.throws(() => validateSchoolCombatRecord({ ...raw, reason: '' }, cases[0]));
});

test('专报未知与资格状态分账，不进入公共伤害表', () => {
    const c = cases[0], summary = mingjiaoJiuyangLearningReport([], c);
    const md = schoolCombatMarkdown({ fingerprint: 'synthetic-only', evidence_sha256: 'synthetic-only',
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 },
        conditions: [{ ...c, counts: { observed: 0, refused: 0 }, effects: null, sides: null,
            mingjiao_jiuyang_learning: summary }] });
    assert.match(md, /九阳/); assert.match(md, /未知|未观测/);
    assert.ok(md.includes(c.id)); assert.equal(summary.effects, null);
});
