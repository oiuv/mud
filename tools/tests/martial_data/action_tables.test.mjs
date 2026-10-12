import assert from 'node:assert/strict';
import test from 'node:test';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, scanSource } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { actionTables, actionMarkdown, verifyActionSources } from './action_tables.mjs';

function synthetic(source) {
    const file = { path: 'kungfu/skill/example.lpc', sha256: 'test', scope: 'skill', ...scanSource(source) };
    return actionTables({ source_fingerprint: 'test', files: [file] }, {
        source_fingerprint: 'test', skills: [{ path: file.path, sha256: file.sha256, id: 'example' }],
    });
}

test('保留动作行原文和嵌套表达式，不执行宏或把缺失值写成零', () => {
    const source = `mapping *action = ({
        (["action": "random(9), [this_player()]", "force": 0, "dodge": -4,
          "damage": SCALE * foo((["nested": ({1, 2})])), "extra": "literal"]),
        // comma, random(1), mapping ([ ]) inside a comment are not code
        (["action": "second", "force": 12, "dmage": 9]),
    });
    mapping query_action(object me) { return action[0]; }`;
    const report = synthetic(source), table = report.files[0].tables[0];
    assert.equal(table.rows.length, 2);
    assert.equal(table.numeric.force.min, 0);
    assert.equal(table.numeric.force.max, 12);
    assert.equal(table.numeric.damage.literal_count, 0);
    assert.equal(table.numeric.damage.expression_count, 1);
    assert.equal(table.numeric.damage.absent_count, 1);
    assert.equal(table.numeric.damage.min, null);
    assert.equal(table.rows[1].fields.dmage.value, 9);
    assert.deepEqual(table.initialization_calls, []);
    for (const row of table.rows) assert.equal(source.slice(row.start, row.end), row.raw);
    assert.equal(report.files[0].query_action.length, 1);
    assert.match(actionMarkdown(report), /表达式 1/);
});

test('动态键、重复键及非 mapping 行保留为未解析，不消失或误算有效系数', () => {
    const report = synthetic('mapping *actions = ({ ([KEY: 2]), (["force": 1, "force": 2]), get_action() });');
    assert.equal(report.totals.unresolved_rows, 3);
    assert.equal(report.files[0].tables[0].numeric.force.unresolved_rows, 3);
    assert.ok(report.files[0].tables[0].rows[0].unresolved);
    assert.match(report.files[0].tables[0].rows[1].unresolved, /重复键/);
});

test('局部动态动作和字符串列表不冒充全局动作表', () => {
    const report = synthetic('string *usage_skills = ({ "sword", "parry" });\n'
        + 'mapping query_action(object me) { mapping *action = ({ (["force": 1]) }); return action[0]; }');
    assert.equal(report.totals.tables, 0);
    assert.equal(report.totals.files_without_global_table, 1);
    assert.equal(report.totals.query_action_declarations, 1);
});

test('数值字段的字符串字面量不当作已求值数字或动态表达式', () => {
    const table = synthetic('mapping *action = ({ (["force": "100"]) });').files[0].tables[0];
    assert.equal(table.numeric.force.literal_count, 0);
    assert.equal(table.numeric.force.expression_count, 0);
    assert.equal(table.numeric.force.other_literal_count, 1);
    assert.equal(table.rows[0].fields.force.value, '100');
});

test('初始化上下文与随机数只标为依赖，不伪造求值结果', () => {
    const report = synthetic('mapping *actions = ({ (["damage": this_player()->query_skill("force") + random(50),'
        + '"owner": this_object()]) });');
    assert.equal(report.totals.rows_with_this_player, 1);
    assert.deepEqual(report.files[0].tables[0].initialization_calls, ['random', 'this_object', 'this_player']);
    assert.equal(report.files[0].tables[0].numeric.damage.expression_count, 1);
    assert.equal(report.files[0].tables[0].numeric.damage.max, null);
});

test('真实全量动作表与来源一致，保留已知拼写错误及华山动态极意', () => {
    const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
    verifyActionSources(root, inventory);
    const report = actionTables(inventory, catalog);
    assert.equal(report.totals.skill_files, 1451);
    const table = id => report.files.find(f => f.id === id).tables[0];
    const axe = table('pangu-qishi'), hammer = table('hanshan-chuifa');
    assert.deepEqual(axe.numeric, hammer.numeric);
    assert.equal(axe.rows.length, 7);
    assert.equal(axe.numeric.damage.min, 62);
    assert.equal(axe.numeric.damage.max, 104);
    assert.equal(table('bingcan-duzhang').numeric.damage.absent_count, 5);
    assert.equal(table('chousui-zhang').numeric.damage.absent_count, 5);
    const huashan = table('huashan-jian');
    for (const key of ['force', 'attack', 'dodge', 'parry', 'damage']) {
        assert.equal(huashan.numeric[key].expression_count, 1);
    }
    assert.equal(huashan.rows.at(-1).fields.lvl.value, 200);
    assert.ok(huashan.initialization_calls.includes('this_player'));
    assert.throws(() => actionTables(inventory, { ...catalog, source_fingerprint: 'changed' }), /来源版本不同/);
    const changed = structuredClone(inventory);
    changed.files.find(f => f.scope === 'skill' && f.path.endsWith('.c')).sha256 = 'changed';
    assert.throws(() => verifyActionSources(root, changed), /源码已变化/);
});
