import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compositeTeaching, incrementalGrantCalls, learningPermissionCalls, mappingFields, schoolRelations, schoolMarkdown } from './school_relations.mjs';
import { buildInventory, scanSource, sha256 } from './inventory.mjs';
import { buildCatalog, collectCatalog } from './catalog.mjs';
import { root } from '../../collect_martial_data.mjs';

test('教学字段只提取字面量，复杂表达式保留，注释不变成字段', () => {
    const fields = mappingFields('(["perform":"can_perform/demo/one", "shen":-20, "lv1":level + 5, "msg":"甲,乙:丙", /* "false":1, */ "data":(["a":({1,2})]),])');
    assert.equal(fields.perform.value, 'can_perform/demo/one');
    assert.equal(fields.shen.value, -20);
    assert.equal(fields.lv1.kind, 'expression');
    assert.equal(fields.lv1.raw, 'level + 5');
    assert.equal(fields.msg.value, '甲,乙:丙');
    assert.equal(fields.data.raw, '(["a":({1,2})])');
    assert.ok(!fields.false);
    assert.equal(mappingFields('query("lesson")'), null);
    assert.throws(() => mappingFields('(["a":1,"a":2])'), /重复键/);
});

test('NPC 自用领悟、玩家候选和共享武学分开，不自动授予教学资格', () => {
    const file = (path, scope, text) => ({ path, scope, sha256: sha256(text), ...scanSource(text) });
    const inventory = { source_fingerprint: 'fixed', files: [
        file('include/weapon.h', 'header_dependency', '#define SWORD "/inherit/weapon/sword"\n'),
        file('kungfu/skill/demo.c', 'skill', 'int valid_enable(string s) { return s == "sword"; }'),
        file('kungfu/skill/demo/one.c', 'skill', 'int perform(object me, object target) { return 1; }'),
        file('kungfu/class/misc/a.c', 'class', `void create() { set_skill("demo", 300); create_family("甲派", 1, "弟子");
            set("can_perform/demo/one", 1); set("no_teach/demo", 1); }
            mixed ask() { object me = this_player(); me->set("can_perform/demo/one", 1); return 1; }`),
        file('kungfu/class/test/b.c', 'class', `void create() { set_skill("demo", LEVEL); create_family("乙派", 1, "弟子"); }
            mixed accept_ask(object me) { return MASTER_D->teach_pfm(me, this_object(), (["perform":"can_perform/demo/one","sk1":"demo","lv1":180])); }`),
    ] };
    const catalog = buildCatalog(inventory, 'dict (["demo":"示例武学"])');
    const report = schoolRelations(inventory, catalog);
    assert.equal(report.totals.class_objects, 2);
    assert.equal(report.totals.npc_initial_grants, 1);
    assert.equal(report.totals.player_grant_candidates, 2);
    assert.equal(report.objects[0].no_teach_declarations[0].skill, 'demo');
    assert.deepEqual(report.objects[0].grants[1].entries, ['kungfu/skill/demo/one.c']);
    assert.equal(report.objects[1].grants[0].fields.lv1.value, 180);
    assert.equal(report.objects[1].skill_assignments[0].level.kind, 'expression');
    assert.equal(report.objects[0].grants[1].eligibility, 'not_verified');
    assert.deepEqual(report.overlaps[0].groups, ['misc', 'test']);
    assert.match(schoolMarkdown(report), /不是正式|不等于正式/);
    catalog.teachers[0].npc_skills[0].evidence.text = 'changed';
    assert.throws(() => schoolRelations(inventory, catalog), /原文\/位置/);
});

test('递增领悟保留原函数位置、表达式和零值，不修改固定调用清单', () => {
    const text = `void ask() {
        // me->add("can_perform/demo/fake", 9);
        string hint = "add(\\\"can_perform/demo/fake\\\", 3)";
        if (me->add("can_perform/demo/tu", 1) < 10) return;
        me->add("can_exert/demo/hup", choose(1, 2));
        add("can_perform/demo/zero", 0);
        me->add("gongxian", -3000);
    }`;
    const source = { path: 'kungfu/class/test/a.c', sha256: sha256(text), ...scanSource(text) };
    const before = structuredClone(source);
    const calls = incrementalGrantCalls(source);
    assert.deepEqual(source, before);
    assert.deepEqual(calls.map(c => c.values[0]),
        ['can_perform/demo/tu', 'can_exert/demo/hup', 'can_perform/demo/zero']);
    assert.equal(calls[0].args[1].value, 1);
    assert.equal(calls[1].args[1].kind, 'expression');
    assert.equal(calls[1].args[1].raw, 'choose(1, 2)');
    assert.equal(calls[2].args[1].value, 0);
    assert.equal(calls[2].receiver, null);
    for (const call of calls) {
        assert.equal(call.function, 'ask');
        assert.equal(text.slice(call.evidence.start, call.evidence.end), call.evidence.text);
        assert.equal(text.slice(0, call.evidence.start).split('\n').length, call.evidence.line);
    }
});

test('真实 class 全分组进入来源表，非 NPC 物品仍保留而不冒充教学', () => {
    const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
    const report = schoolRelations(inventory, catalog);
    assert.equal(report.totals.directory_groups, 42);
    assert.equal(report.totals.class_objects, 418);
    assert.equal(new Set(report.groups.flatMap(g => g.objects)).size, 418);
    const zhao = report.objects.find(o => o.path.endsWith('/riyue/zhao.c'));
    assert.ok(zhao.grants.some(g => g.grant === 'can_perform/hanshan-chuifa/zhen'
        && g.entries.includes('kungfu/skill/hanshan-chuifa/zhen.lpc')));
    assert.ok(zhao.gates.some(g => g.function === 'recognize_apprentice'));
    const pin = report.objects.find(o => o.path.endsWith('/riyue/dongfang/zhen.c'));
    assert.equal(pin.grants.length, 0);
    assert.equal(pin.skill_assignments.length, 0);
    assert.ok(pin.inherits.some(i => i.evidence.text === 'inherit PIN;'));
    assert.equal(report.groups.find(g => g.group === 'generate').families.length, 0);
    assert.ok(report.groups.find(g => g.group === 'misc').families.length > 1);
    const yin = report.objects.find(o => o.path.endsWith('/wudang/yin.c'));
    const chuan = yin.grants.find(g => g.grant === 'can_perform/raozhi-roujian/chuankong');
    assert.equal(chuan.resolution, 'authorization_read');
    assert.deepEqual(chuan.entries, ['kungfu/skill/raozhi-roujian/chuan.c']);
    assert.equal(chuan.unresolved.length, 0);
    const wang = report.objects.find(o => o.path.endsWith('/quanzhen/wang.c'));
    assert.ok(wang.grants.some(g => g.entries.includes('kungfu/skill/xiantian-gong/exert/hup.c')));
    assert.equal(report.totals.composite_teaching_paths, 2);
    assert.equal(report.totals.composite_student_skill_candidates, 31);
    const hong = report.composites.find(c => c.skill === 'xianglong-zhang');
    const chen = report.composites.find(c => c.skill === 'baihua-cuoquan');
    assert.equal(hong.children.length, 18);
    assert.equal(chen.children.length, 13);
    assert.ok(hong.children.every(c => c.granted_level === 10 && c.composition_level === 150));
    assert.ok(chen.children.every(c => c.granted_level === 10 && c.composition_level === 100));
    assert.ok(chen.children.every(c => c.sha256 && c.path.startsWith('kungfu/skill/')));
    const expanded = report.objects.find(o => o.path === hong.teacher).skill_assignments
        .find(s => s.dynamic_resolution);
    assert.equal(expanded.role, 'external_object_assignment');
    assert.equal(expanded.dynamic_resolution.eligibility, 'not_verified');
    assert.ok(!report.unresolved.some(r => r.reason === 'dynamic_skill_id'));
    assert.equal(report.totals.unresolved_records, 11);
    assert.equal(report.totals.missing_mapping_targets, 9);
    assert.equal(report.totals.learning_permission_declarations, 33);
    assert.equal(report.totals.player_grant_candidates, 463, '许可不扩大绝招领悟分母');
    const he = report.objects.find(o => o.path.endsWith('/wudu/hetieshou.c'));
    const permission = he.learning_permissions.find(p => p.permission === 'can_learn/qianzhu-wandushou');
    assert.equal(permission.function, 'ask_skill6');
    assert.equal(permission.value.value, 1);
    assert.equal(permission.skill_source.path, 'kungfu/skill/qianzhu-wandushou.c');
    assert.equal(permission.status, 'permission_only_consumer_and_eligibility_not_verified');
    assert.ok(!he.grants.some(g => g.grant.startsWith('can_learn/')));
    const zhang = report.objects.find(o => o.path.endsWith('/wudang/zhang.c'));
    const diagram = zhang.grants.find(g => g.grant === 'can_perform/taiji-quan/tu');
    assert.equal(diagram.operation, 'add');
    assert.equal(diagram.function, 'ask_skill6');
    assert.equal(diagram.increment.value, 1);
    assert.equal(diagram.role, 'player_grant_candidate');
    assert.equal(diagram.eligibility, 'not_verified');
    assert.match(diagram.enclosing_function.text, /learned_points/);
    assert.ok(diagram.entries.includes('kungfu/skill/taiji-quan/tu.c'));
    const wuwang = report.objects.find(o => o.path.endsWith('/xuanming/wuwang.c'));
    assert.equal(wuwang.mappings.filter(m => m.source_status === 'target_source_missing').length, 2);
    assert.ok(wuwang.mappings.some(m => m.values[0] === 'cuff'
        && m.target_source.path === 'kungfu/skill/piaofeng-quan.c'));
    assert.throws(() => compositeTeaching(inventory, catalog,
        path => readFileSync(join(root, path), 'utf8') + '\n'), /源码与固定清单不同/);
});

test('学习许可从原函数派生，注释和字符串不算写入，不改旧调用清单', () => {
    const text = `void ask() {
        // me->set("can_learn/fake", 1);
        string hint = "set(\\\"can_learn/fake\\\", 1)";
        me->set("can_learn/demo", 1);
        me->set("can_learn/dynamic", choose(1, 2));
        set("can_learn/zero", 0);
        me->set("can_perform/demo/one", 1);
    }`;
    const source = { path: 'kungfu/class/test/a.c', sha256: sha256(text), ...scanSource(text) };
    const before = structuredClone(source), calls = learningPermissionCalls(source);
    assert.deepEqual(source, before);
    assert.deepEqual(calls.map(c => c.values[0]), ['can_learn/demo', 'can_learn/dynamic', 'can_learn/zero']);
    assert.equal(calls[0].receiver, 'me');
    assert.equal(calls[1].args[1].raw, 'choose(1, 2)');
    assert.equal(calls[2].values[1], 0);
    for (const call of calls) {
        assert.equal(call.name, 'set');
        assert.equal(text.slice(call.evidence.start, call.evidence.end), call.evidence.text);
        assert.equal(text.slice(0, call.evidence.start).split('\n').length, call.evidence.line);
    }
});

test('组合传授保持明确数据流；旧清单与变动后的入口不能拼成确定关系', () => {
    const file = (path, scope, text) => ({ path, scope, sha256: sha256(text), ...scanSource(text) });
    const source = 'mapping sub_skills = (["child":150]); mapping query_sub_skills() { return sub_skills; }';
    const teacher = `void try_to_learn_ds() { sob = load_object(SKILL_D("xianglong-zhang"));
        sub_skills = keys(sob->query_sub_skills()); me->set_skill(sub_skills[i], 10); }`;
    const inventory = { source_fingerprint: 'fixed', files: [
        file('include/weapon.h', 'header_dependency', '#define SWORD "/inherit/weapon/sword"\n'),
        file('kungfu/skill/xianglong-zhang.c', 'skill', source),
        file('kungfu/skill/child.c', 'skill', 'int valid_enable(string s) { return s == "strike"; }'),
        file('kungfu/class/gaibang/hong.c', 'class', teacher),
    ] };
    const catalog = buildCatalog(inventory, 'dict (["child":"子技能"])');
    const [relation] = compositeTeaching(inventory, catalog, () => source);
    assert.equal(relation.children[0].name, '子技能');
    assert.equal(relation.children[0].granted_level, 10);
    assert.equal(relation.children[0].composition_level, 150);
    assert.match(relation.declaration.text, /mapping sub_skills/);
    assert.match(relation.query.text, /return sub_skills/);
    const changed = source.replace('return sub_skills;', 'return another_table;');
    inventory.files[1] = file('kungfu/skill/xianglong-zhang.c', 'skill', changed);
    assert.throws(() => compositeTeaching(inventory, buildCatalog(inventory, 'dict ([])'), () => changed),
        /接口已改变/);
});

test('缺失映射、取消映射与动态目标分开；不把目标文件存在当映射有效', () => {
    const file = (path, scope, text) => ({ path, scope, sha256: sha256(text), ...scanSource(text) });
    const inventory = { source_fingerprint: 'fixed', files: [
        file('include/weapon.h', 'header_dependency', '#define SWORD "/inherit/weapon/sword"\n'),
        file('kungfu/skill/demo.c', 'skill', 'int valid_enable(string s) { return s == "sword"; }'),
        file('kungfu/class/test/a.c', 'class', `void create() {
            map_skill("sword", "missing"); map_skill("force", 0); map_skill("parry");
            map_skill("dodge", choose_skill()); prepare_skill("sword", "demo"); }`),
    ] };
    const report = schoolRelations(inventory, buildCatalog(inventory, 'dict ([])'));
    assert.deepEqual(report.objects[0].mappings.map(m => m.source_status),
        ['target_source_missing', 'cancel_mapping', 'cancel_mapping', 'dynamic_target']);
    assert.equal(report.objects[0].preparations[0].source_status, 'located_not_executed');
    assert.equal(report.totals.missing_mapping_targets, 1);
    assert.deepEqual(report.unresolved.map(m => m.reason), ['target_source_missing', 'dynamic_target']);
});
