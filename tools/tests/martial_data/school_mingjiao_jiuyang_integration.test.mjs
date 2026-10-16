// Wiring tests only; genuine samples are stored in independent external series.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { mingjiaoJiuyangConditions, mingjiaoJiuyangSourcePaths } from './school_mingjiao_jiuyang_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoJiuyangConditions(catalog, read);

test('九阳有限窗口独立尾追加67条件，2094正式/134烟雾，不替代全明教', () => {
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'mingjiao-jiuyang'), cases);
    assert.equal(cases.length, 67);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2094);
    assert.equal(mingjiaoJiuyangConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 134);
    assert.ok(cases.every(c => c.parameters.observe_seconds === 0));
    assert.ok(cases.every(c => !c.parameters.callback_if_queued));
});

test('九阳124来源包含真实公共战斗；五文件工具与来源完整冻结，漂移拒绝', () => {
    const s = createSandbox(root);
    validateQualificationSources(cases, s.files);
    assert.equal(mingjiaoJiuyangSourcePaths.length, 124);
    assert.ok(mingjiaoJiuyangSourcePaths.includes('adm/daemons/combatd.c'));
    for (const path of mingjiaoJiuyangSourcePaths) assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    for (const name of ['cases.mjs', 'cases.test.mjs', 'integration.test.mjs', 'report.mjs', 'report.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_jiuyang_' + name;
        assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    }
    assert.throws(() => validateQualificationSources(cases, { ...s.files, 'kungfu/skill/jiuyang-shengong.c': '0'.repeat(64) }));
    const wrong = structuredClone(cases[0]); wrong.parameters.interface.object = '/kungfu/skill/force';
    assert.throws(() => validateQualificationSources([wrong], s.files));
});

test('九阳使用原USER身份及原被动/防御，不伪造转世、随机和计时回调', () => {
    const src = read('tools/tests/martial_data/runner.lpc');
    assert.match(src, /"finite original Jiuyang USER usage query"/);
    assert.match(src, /"valid_enable", spec\["argument"\], players\[0\]/);
    assert.match(src, /\{ "reborn", "can_learn\/jiuyang-shengong\/enable_weapon" \}/);
    assert.match(src, /"mingjiao-jiuyang" &&\s*spec\["object"\] == "\/kungfu\/skill\/jiuyang-shengong"/);
    assert.match(src, /"configured original passive interface"/);
    assert.match(src, /current\["parameters"\]\["collection_group"\] == "mingjiao-qkd" && mapp/);
    assert.doesNotMatch(src, /random\([^\n]*mingjiao-jiuyang/);
    assert.doesNotMatch(src, /set\("reborn\//);
    assert.match(src, /value == "jiuyang-shengong" && !ob->query\("reborn"\)/);
    assert.match(src, /ob->query_skill_map\(\)\[key\] == value && !ob->query_skill_mapped\(key\)/);
});

test('九阳原接口落专用报告，不混DPS或把未知填零', () => {
    const src = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(src, /mingjiaoJiuyangReport/);
    assert.match(src, /mingjiaoJiuyangMarkdown/);
    assert.match(src, /!c\.mingjiao_jiuyang/);
    assert.match(read('tools/collect_martial_data.mjs'), /school-mingjiao-jiuyang-/);
    assert.match(read('tools/tests/martial_data/execution.mjs'), /\['mingjiao-qkd', 'mingjiao-jiuyang'\]\.includes\(condition\.parameters\.collection_group\)/);
});
