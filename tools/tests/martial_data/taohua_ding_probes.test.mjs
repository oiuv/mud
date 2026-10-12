import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { scanSource } from './inventory.mjs';
import { taohuaDingTimerProbes } from './taohua_ding_probes.mjs';

const path = new URL('../../../kungfu/skill/tanzhi-shentong/ding.c', import.meta.url);
const source = readFileSync(path, 'utf8');
const sha256 = text => createHash('sha256').update(text).digest('hex');
const originalSha = '8708ac8606e10111eea5c7c971d704be3fafdf71320904ac916a344a732a4423';
const entryCall = '    "/tests/runner"->observe_callback(target, "before");\n';
const exitCall = '    "/tests/runner"->observe_callback(target, "after");\n';

test('原定昆仑单文件两锚点逐字节逆还原，不写源文件', () => {
    assert.equal(sha256(source), originalSha);
    const { changed, sites } = taohuaDingTimerProbes(source);
    assert.equal(sites.length, 2);
    assert.notEqual(changed, source);
    const restored = sites.reduceRight((text, site) => {
        assert.equal(text.split(site.replacement).length, 2);
        return text.replace(site.replacement, site.anchor);
    }, changed);
    assert.equal(restored, source);
    assert.equal(sha256(restored), originalSha);
    assert.equal(readFileSync(path, 'utf8'), source);
});

test('只插入原ding_end入口与无条件return前观察，不改perform/final', () => {
    const { changed } = taohuaDingTimerProbes(source);
    const entry = 'void ding_end(object me, object target) {';
    assert.equal(changed.slice(0, changed.indexOf(entry)), source.slice(0, source.indexOf(entry)));
    assert.equal(changed.split(entryCall).length, 2);
    assert.equal(changed.split(exitCall).length, 2);
    assert.equal(changed.replace(entryCall, '').replace(exitCall, ''), source);
    assert.ok(changed.includes(entry + '\n' + entryCall + '    if (target && target->query_temp("no_perform")) {'));
    assert.ok(changed.includes('        target->delete_temp("no_perform");\n    }\n' + exitCall + '    return;\n}'));
    assert.ok(changed.indexOf(entryCall) < changed.indexOf('    if (target && target->query_temp("no_perform"))'));
    assert.ok(changed.indexOf(exitCall) > changed.indexOf('target->delete_temp("no_perform");'));
});

test('原call_out及全部RNG、返回、消息和删除表达式不增不减', () => {
    const { changed } = taohuaDingTimerProbes(source);
    for (const pattern of [/\bcall_out\([^\n]*\);/g, /\brandom\([^\n]*?\)/g,
        /\breturn\b[^\n]*/g, /\b(?:message_combatd|tell_object)\(/g,
        /target->(?:query_temp|delete_temp)\("no_perform"\)/g]) {
        assert.deepEqual([...changed.matchAll(pattern)].map(match => match[0]),
            [...source.matchAll(pattern)].map(match => match[0]));
    }
    assert.ok(changed.includes('call_out("ding_end", 1 + random(5), me, target);'));
    for (const call of [entryCall, exitCall]) {
        assert.doesNotMatch(call, /\b(?:if|random|call_out|remove_call_out|set_temp|delete_temp)\b/);
        assert.doesNotMatch(call, /"owner"|"function"|"side"|"elapsed"|snapshot/);
    }
});

test('任一原锚点缺失、重复或关键尾部漂移都拒绝', () => {
    const { sites } = taohuaDingTimerProbes(source);
    for (const { anchor } of sites) {
        assert.throws(() => taohuaDingTimerProbes(source.replace(anchor, '')));
        assert.throws(() => taohuaDingTimerProbes(source + '\n' + anchor));
    }
    assert.throws(() => taohuaDingTimerProbes(source.replace('void ding_end(', 'void other_end(')));
    assert.throws(() => taohuaDingTimerProbes(source.replace('target->delete_temp("no_perform");', 'target->delete_temp("other");')));
    assert.throws(() => taohuaDingTimerProbes(source.replace('    return;\n}', '    return 1;\n}')));
});

test('完整或单点已注入拒绝，不叠加第二份回调计数', () => {
    const { changed, sites } = taohuaDingTimerProbes(source);
    assert.throws(() => taohuaDingTimerProbes(changed));
    for (const { anchor, replacement } of sites)
        assert.throws(() => taohuaDingTimerProbes(source.replace(anchor, replacement)));
});

test('源码入参不接受缺省、对象或二进制缓冲，不自动转文本', () => {
    for (const invalid of [undefined, null, 0, 1, false, {}, [], Buffer.from(source)])
        assert.throws(() => taohuaDingTimerProbes(invalid));
    assert.throws(() => taohuaDingTimerProbes(''));
});

test('隔离输出保留原词法与函数集合；离线检查不冒充LPC执行', () => {
    const { changed } = taohuaDingTimerProbes(source);
    const before = scanSource(source), after = scanSource(changed);
    assert.deepEqual(before.lexical_issues, []);
    assert.deepEqual(after.lexical_issues, []);
    assert.deepEqual(after.functions.map(fn => fn.name), before.functions.map(fn => fn.name));
    assert.equal((changed.match(/"\/tests\/runner"->observe_callback\(/g) ?? []).length, 2);
    assert.equal(readFileSync(path, 'utf8'), source);
});
