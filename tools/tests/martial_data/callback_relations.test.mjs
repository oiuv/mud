import assert from 'node:assert/strict';
import test from 'node:test';
import { buildInventory, scanSource } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { root } from '../../collect_martial_data.mjs';
import { callbackMarkdown, callbackRelations } from './callback_relations.mjs';

function report(source, extra = []) {
    const files = [{ path: 'kungfu/skill/sample.lpc', sha256: 'sample', scope: 'skill',
        ...scanSource(source) }, ...extra];
    return callbackRelations({ source_fingerprint: 'same', files }, { source_fingerprint: 'same',
        skills: files.filter(f => f.scope === 'skill').map(f => ({ path: f.path, sha256: f.sha256, id: f.path })) });
}

test('直接字符串回调保留来源、零延迟及重复调用位置', () => {
    const source = 'void run() { call_out("done", 0); call_out("done", level / 2); }\nvoid done() {}';
    const result = report(source), calls = result.files[0].schedules;
    assert.equal(calls.length, 2);
    assert.notEqual(calls[0].id, calls[1].id);
    assert.equal(calls[0].delay.value, 0);
    assert.equal(calls[1].delay.raw, 'level / 2');
    assert.ok(calls.every(c => c.status === 'local_declaration_candidate' && c.runtime === 'not_observed'));
    for (const call of calls) {
        assert.equal(source.slice(call.evidence.start, call.evidence.end), call.evidence.text);
        assert.equal(call.declarations[0].text, 'done() {}');
    }
    assert.equal(result.totals.dynamic_delays, 1);
    assert.match(callbackMarkdown(result), /level \/ 2/);
});

test('玩家调度的 call_other 闭包定位原文件，但不声称执行或推算时长', () => {
    const result = report('void exert(object me) { me->start_call_out((: call_other, __FILE__, "remove_effect", me, 2 :), skill); }\nvoid remove_effect(object me, int n) {}');
    const call = result.files[0].schedules[0];
    assert.equal(call.receiver, 'me');
    assert.equal(call.reference.form, 'call_other_function_binding');
    assert.equal(call.reference.name, 'remove_effect');
    assert.equal(call.status, 'local_declaration_candidate');
    assert.equal(call.delay.raw, 'skill');
    assert.equal(result.totals.schedules, 1);
});

test('普通函数闭包可定位，表达式闭包和动态字符串不猜测', () => {
    const result = report('void run(object me) { call_out((: done, me :), 1); call_out((: me->done() :), 2); call_out(variable, 3); }\nvoid done(object me) {}');
    assert.deepEqual(result.files[0].schedules.map(c => c.status), [
        'local_declaration_candidate', 'dynamic_or_unrecognized_binding', 'dynamic_or_unrecognized_binding']);
});

test('清单外、继承未知、条件编译重复声明均不假报代码错误', () => {
    const result = report('void run() { call_out("missing", 1); call_out("dup", 2); call_out((: call_other, "/outside", "f" :), 3); }\n'
        + '#ifdef FIRST\nvoid dup() {}\n#else\nvoid dup() {}\n#endif');
    assert.deepEqual(result.files[0].schedules.map(c => c.status), [
        'no_local_declaration_inheritance_unchecked', 'multiple_declarations_preprocessor_unchecked',
        'destination_outside_inventory_or_ambiguous']);
});

test('绝对对象路径定位 .lpc；注释和字符串不成为调度', () => {
    const source = 'void run() { /* call_out("fake", 1); */ string text = "call_out(fake)"; '
        + 'call_out((: call_other, "/kungfu/skill/other", "done" :), 5); }';
    const other = { path: 'kungfu/skill/other.lpc', sha256: 'other', scope: 'skill', ...scanSource('void done() {}') };
    const result = report(source, [other]);
    assert.equal(result.totals.schedules, 1);
    assert.equal(result.files[0].schedules[0].declarations[0].path, other.path);
    assert.throws(() => callbackRelations({ source_fingerprint: 'a' }, { source_fingerprint: 'b' }), /来源不一致/);
});

test('真实全量清单闭合；被注释的龙象解除函数不伪装成有效声明', () => {
    const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
    const result = callbackRelations(inventory, catalog);
    assert.equal(result.files.length, catalog.skills.length);
    const expected = inventory.files.filter(f => f.scope === 'skill' && /\.(c|lpc)$/.test(f.path))
        .flatMap(f => f.calls.filter(c => ['call_out', 'start_call_out'].includes(c.name) && c.form === 'call'));
    assert.equal(result.totals.schedules, expected.length);
    const legacy = result.files.find(f => f.id === 'longxiang/powerup');
    assert.equal(legacy.schedules.length, 1);
    assert.equal(legacy.schedules[0].status, 'no_local_declaration_inheritance_unchecked');
    assert.equal(legacy.schedules[0].reference.name, 'remove_effect');
    const current = result.files.find(f => f.id === 'longxiang-gong/exert/powerup');
    assert.equal(current.schedules[0].status, 'local_declaration_candidate');
    assert.equal(current.schedules[0].runtime, 'not_observed');
});
