import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { classDependencies, macroDeclarations, sourceExpression } from './school_dependencies.mjs';
import { buildInventory, scanSource, sha256 } from './inventory.mjs';
import { root } from '../../collect_martial_data.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';

const parsed = (path, scope, text) => ({ path, scope, sha256: sha256(text), ...scanSource(text) });

test('继承表达式只解析字符串/宏，保留定义来源，不执行任意 LPC', () => {
    const header = parsed('include/globals.h', 'header_dependency', `#define BASE "/inherit/"
#define NPC BASE "char/npc"
#define CLASS_D(x) ("/kungfu/class/" + x)
#define CYCLE OTHER
#define OTHER CYCLE
`);
    const macros = macroDeclarations(header);
    const npc = sourceExpression('NPC', macros);
    assert.equal(npc.value, '/inherit/char/npc');
    assert.equal(npc.status, 'located_not_preprocessed');
    assert.equal(npc.evidence.length, 2);
    assert.equal(sourceExpression('CLASS_D("generate") + "/chinese"', macros).value, '/kungfu/class/generate/chinese');
    assert.equal(sourceExpression('load_object("/private")', macros).value, null);
    assert.match(sourceExpression('CYCLE', macros).reason, /宏循环/);
    const conflict = [...macros, { name: 'NPC', parameters: null, body: '"/other"', evidence: {} }];
    assert.match(sourceExpression('NPC', conflict).reason, /不同路径/);
});

test('祖先和公共头文件闭合，私密路径不读取；旧清单与新源码不能混用', () => {
    const temp = mkdtempSync(join(tmpdir(), 'mud-school-dependency-test-'));
    const originals = [];
    function put(path, text, scope) {
        mkdirSync(dirname(join(temp, path)), { recursive: true });
        writeFileSync(join(temp, path), text);
        if (scope) originals.push(parsed(path, scope, text));
    }
    put('include/globals.h', '#define NPC "/inherit/char/npc"\n', 'header_dependency');
    put('inherit/char/npc.lpc', 'void setup() {}');
    put('feature/master.c', 'int recognize_apprentice(object ob) { return 0; }');
    put('kungfu/class/demo/gates.h', '#define LOCAL_MASTER "/feature/master.c"\nint permit_recruit(object me) { return 0; }', 'class');
    put('kungfu/class/demo/a.lpc', '#include "gates.h"\ninherit NPC; inherit LOCAL_MASTER;', 'class');
    put('kungfu/class/demo/b.c', '#include "../../../data/private.h"\ninherit "/data/private";', 'class');
    put('data/private.h', 'PRIVATE_NOT_READ');
    put('data/private.lpc', 'PRIVATE_NOT_READ');
    const inventory = { source_fingerprint: 'fixture', files: originals };
    const report = classDependencies(temp, inventory);
    const a = report.objects.find(o => o.path.endsWith('/a.lpc'));
    assert.equal(a.source_role, 'npc');
    assert.equal(a.has_master_feature, true);
    assert.ok(a.ancestors.includes('inherit/char/npc.lpc'));
    assert.equal(report.totals.unresolved, 2);
    assert.ok(report.files.some(f => f.path.endsWith('gates.h')));
    assert.ok(!report.files.some(f => f.path.startsWith('data/')));
    assert.ok(!JSON.stringify(report).includes('PRIVATE_NOT_READ'));
    for (const file of report.files) assert.equal(file.sha256, sha256(readFileSync(join(temp, file.path))));
    put('kungfu/class/demo/a.lpc', 'inherit NPC;');
    assert.throws(() => classDependencies(temp, inventory), /与原清单版本不符/);
});

test('继承循环被明确记录，不用递归失败冒充分析完成', () => {
    const temp = mkdtempSync(join(tmpdir(), 'mud-school-cycle-test-'));
    const files = [];
    for (const [path, source, scope] of [
        ['include/globals.h', '// none\n', 'header_dependency'],
        ['kungfu/class/demo/a.c', 'inherit "b";', 'class'],
        ['kungfu/class/demo/b.c', 'inherit "a";', 'class'],
    ]) {
        mkdirSync(dirname(join(temp, path)), { recursive: true }); writeFileSync(join(temp, path), source);
        files.push(parsed(path, scope, source));
    }
    const report = classDependencies(temp, { source_fingerprint: 'fixture', files });
    assert.ok(report.unresolved.some(u => u.reason === 'inheritance_cycle'));
    assert.equal(report.objects[0].ancestors.length, 2);
});

test('真实库 class 含七个物品、随机生成者和惩罚者，不把 F_MASTER 当作收徒证明', () => {
    const inventory = buildInventory(root), report = classDependencies(root, inventory);
    assert.equal(report.totals.class_objects, 418);
    assert.equal(report.totals.inherit_edges, report.totals.located_inherit_edges);
    assert.equal(report.totals.unresolved, 0);
    assert.deepEqual(report.totals.roles, { item: 7, npc: 377, punisher_npc: 19, random_generated_npc: 15 });
    assert.equal(report.totals.master_feature_objects, 299);
    const huihun = report.objects.find(o => o.path.endsWith('/obj/huihun.c'));
    assert.equal(huihun.source_role, 'item');
    assert.ok(huihun.ancestors.includes('inherit/item/combined.c'));
    const laodao = report.objects.find(o => o.path.endsWith('/misc/laodao.c'));
    assert.equal(laodao.source_role, 'punisher_npc');
    assert.ok(report.files.find(f => f.path === 'inherit/char/punisher.c').functions.some(f => f.name === 'receive_damage'));
    const captured = report.objects.find(o => o.path.endsWith('/generate/capturenpc1.c'));
    assert.equal(captured.source_role, 'random_generated_npc');
    const cong = report.objects.find(o => o.path.endsWith('/huashan/cong-buqi.c'));
    assert.equal(cong.has_master_feature, true);
    assert.equal(cong.status, 'source_relationship_not_runtime_curriculum');
    const relations = schoolRelations(inventory, collectCatalog(root, inventory), undefined, report);
    assert.equal(relations.dependency_fingerprint, report.dependency_fingerprint);
    assert.ok(relations.objects.every(o => o.inheritance && o.inherited_sources.length > 0));
    const inherited = relations.objects.find(o => o.path.endsWith('/huashan/cong-buqi.c'));
    assert.ok(inherited.inherited_sources.some(s => s.path === 'feature/master.c'));
    assert.throws(() => schoolRelations(inventory, collectCatalog(root, inventory), undefined,
        { ...report, source_fingerprint: 'other' }), /版本不同/);
});
