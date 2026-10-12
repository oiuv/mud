import assert from 'node:assert/strict';

// Not registered yet. Apply only to the isolated copy of tanzhi-shentong/ding.c.
// The receiver must bind the real daemon/function and exact current target;
// these observations neither schedule the callback nor remove no_perform.
export function taohuaDingTimerProbes(source) {
    assert.equal(typeof source, 'string', '定昆仑探针需要原源码文本');
    assert.equal(source.includes('"/tests/runner"->observe_callback('), false, '不得重复注入定昆仑观察');
    const entry = 'void ding_end(object me, object target) {';
    const tail = '        target->delete_temp("no_perform");\n    }\n    return;\n}';
    const sites = [
        { anchor: entry, replacement: entry + '\n    "/tests/runner"->observe_callback(target, "before");' },
        { anchor: tail, replacement: '        target->delete_temp("no_perform");\n    }\n'
            + '    "/tests/runner"->observe_callback(target, "after");\n    return;\n}' },
    ];
    let changed = source;
    for (const site of sites) {
        assert.equal(source.split(site.anchor).length, 2, '定昆仑观察锚点必须唯一');
        assert.equal(changed.split(site.anchor).length, 2, '定昆仑替换锚点必须唯一');
        changed = changed.replace(site.anchor, site.replacement);
    }
    let restored = changed;
    for (const site of [...sites].reverse()) {
        assert.equal(restored.split(site.replacement).length, 2, '定昆仑观察逆变换必须唯一');
        restored = restored.replace(site.replacement, site.anchor);
    }
    assert.equal(restored, source, '定昆仑观察必须逐字节还原原源码');
    return { changed, sites };
}
