import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { buildInventory, isInside, scanSource, sha256 } from './inventory.mjs';
import { parseArgs, root } from '../../collect_martial_data.mjs';

test('只识别真实函数与调用；字符串、注释、heredoc、宏文本不伪造调用', () => {
    const source = `// set_skill("fake-comment", 999);
#define NOISE set_skill("fake-macro", 999)
string noise = "void fake() { set_skill(\\"fake-string\\", 999); }";
string block = @END
int fake() { set_skill("fake-heredoc", 999); }
END;
void prototype();
void create() {
    /* create_family("假门派", 1, "弟子"); */
    set_skill("spear", 200);
    map_skill("spear", "zhongping-qiang");
    set("description", "set_skill(fake)");
}
int valid_enable(string usage) { return usage == "spear"; }
`;
    const result = scanSource(source);
    assert.deepEqual(result.functions.map(f => f.name), ['create', 'valid_enable']);
    assert.deepEqual(result.calls.map(c => c.name), ['set_skill', 'map_skill']);
    assert.deepEqual(result.calls[0].args.map(a => a.value), ['spear', 200]);
    for (const item of [...result.functions, ...result.calls, ...result.directives]) {
        assert.equal(source.slice(item.start, item.end), item.text);
        assert.equal(source.slice(0, item.start).split('\n').length, item.line);
    }
    assert.deepEqual(result.lexical_issues, []);
});

test('静态保留嵌套参数、动态宏、负数和条件分支，不擅自求值', () => {
    const source = `inherit NPC;
void create() {
    if (flag) create_family(FAMILY_NAME, 3, "弟子");
    else create_family("另一派", 5, "长老");
    set_skill("force", base + 10);
    MASTER_D->teach_pfm(me, this_object(), (["skill": "foo", "lvl": 200]));
    call_out("later", -1, ({ 2, 3 }));
}`;
    const result = scanSource(source);
    assert.equal(result.inherits[0].kind, 'expression');
    assert.equal(result.calls.filter(c => c.name === 'create_family').length, 2);
    assert.equal(result.calls[0].args[0].kind, 'expression');
    assert.equal(result.calls[2].args[1].raw, 'base + 10');
    assert.equal(result.calls[3].args.length, 3);
    assert.equal(result.calls[3].dispatch, '->');
    assert.equal(result.calls[4].args[1].value, -1);
});

test('闭包调用引用与普通调用分开；跨行 functional 分隔符保持完整', () => {
    const result = scanSource(`void f() {
        set("combat", ({ (: perform_action, "spear.ding" :) }));
        start_call_out((\n : call_other, __FILE__, "remove_effect", me : ), 20);
    }
    void remove_effect(object me) { map_skill("parry", "foo"); }`);
    assert.deepEqual(result.lexical_issues, []);
    assert.deepEqual(result.functions.map(f => f.name), ['f', 'remove_effect']);
    const reference = result.calls.find(c => c.name === 'perform_action');
    assert.equal(reference.form, 'functional_reference');
    assert.equal(reference.args[0].value, 'spear.ding');
    assert.equal(result.calls.find(c => c.name === 'call_other').form, 'functional_reference');
});

test('未闭合词法内容显式标记；模板静态文本不变成调用', () => {
    assert.ok(scanSource('void f() { /* unfinished').lexical_issues.length);
    assert.ok(scanSource('void f() { set_skill("unfinished').lexical_issues.length);
    assert.deepEqual(scanSource('void f() { string x = `set_skill("fake", 8)`; }').calls, []);
});

test('清单包含实际新增文件、共享头文件及循环 include，私密 include 不读取', () => {
    const temp = mkdtempSync(join(tmpdir(), 'mud-martial-inventory-test-'));
    const put = (path, source) => { mkdirSync(dirname(join(temp, path)), { recursive: true }); writeFileSync(join(temp, path), source); };
    put('kungfu/skill/foo.lpc', '#include <shared.h>\ninherit SKILL;\nint perform() { return 1; }');
    put('kungfu/skill/foo/act.c', '#include "../../../data/private.h"\nint perform() { return 1; }');
    put('kungfu/class/misc/teacher.c', '#include "teacher.h"\nvoid create() { create_family("测试派", 1, "师父"); }');
    put('kungfu/class/misc/teacher.h', '#include <shared.h>\n');
    put('include/globals.h', '#include <shared.h>\n');
    put('include/weapon.h', '#define AXE "/inherit/weapon/axe"\n');
    put('include/shared.h', '#include <globals.h>\n');
    put('data/private.h', 'SECRET_DO_NOT_READ');
    const inventory = buildInventory(temp);
    assert.deepEqual(inventory.totals, { skill_top_level: 1, skill_nested: 1, skill_headers: 0,
        class_lpc: 1, class_headers: 1, class_directory_groups: 1, related_headers: 3 });
    assert.ok(!inventory.files.some(f => f.path.startsWith('data/')));
    assert.equal(inventory.files.find(f => f.path.endsWith('act.c')).directives[0].status, 'unresolved');
    assert.equal(inventory.files.find(f => f.path.endsWith('foo.lpc')).directives[0].resolved, 'include/shared.h');
    for (const file of inventory.files) assert.equal(file.sha256, sha256(readFileSync(join(temp, file.path))));
});

test('当前库真实清单逐项覆盖；包含只有继承的基本功，未误当作零伤害', () => {
    const inventory = buildInventory(root);
    function actual(directory) {
        return readdirSync(join(root, directory), { withFileTypes: true }).flatMap(item => item.isDirectory()
            ? actual(directory + '/' + item.name) : /\.(c|lpc|h)$/.test(item.name) ? [directory + '/' + item.name] : []).sort();
    }
    assert.deepEqual(inventory.files.filter(f => f.scope !== 'header_dependency').map(f => f.path),
        [...actual('kungfu/class'), ...actual('kungfu/skill')].sort());
    assert.equal(inventory.files.find(f => f.path === 'kungfu/skill/spear.lpc').functions.length, 0);
    assert.ok(inventory.files.find(f => f.path === 'kungfu/skill/spear.lpc').inherits.length);
    assert.equal(inventory.files.find(f => f.path === 'kungfu/skill/jiuyin-shengong/exert/powerup.c').lexical_issues.length, 0);
    assert.equal(inventory.files.find(f => f.path === 'kungfu/class/riyue/zhao.c').calls.filter(c => c.name === 'perform_action').length, 3);
});

test('CLI 参数及仓库边界不接受隐含操作', () => {
    assert.equal(parseArgs(['--help']).help, true);
    assert.equal(parseArgs(['inventory']).command, 'inventory');
    assert.throws(() => parseArgs(['run']), /子命令/);
    assert.throws(() => parseArgs(['inventory', '--output']), /无效参数/);
    assert.throws(() => parseArgs(['inventory', '--output', 'a', '--output', 'b']), /重复/);
    assert.equal(isInside(root, join(root, 'tools')), true);
    assert.equal(isInside(root, root + '-other'), false);
    assert.equal(isInside(root, dirname(root)), false);
});
