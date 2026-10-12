import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scanSource } from './inventory.mjs';

const path = new URL('./taohua_ding_receivers.h', import.meta.url);
const source = readFileSync(path, 'utf8');
const parsed = scanSource(source);
const body = name => {
    const marker = new RegExp('private (?:int|mapping) ' + name + '\\(');
    const start = source.search(marker);
    assert.ok(start >= 0, name);
    return source.slice(start).split('\n}\n')[0];
};

test('接收头仅三项有限辅助并进入隔离副本；词法检查不冒充驱动编译', () => {
    assert.deepEqual(parsed.lexical_issues, []);
    assert.deepEqual(parsed.functions.map(f => f.name),
        ['is_taohua_ding', 'taohua_ding_snapshot', 'taohua_ding_callback']);
    const execution = readFileSync(new URL('./execution.mjs', import.meta.url), 'utf8');
    const runner = readFileSync(new URL('./runner.lpc', import.meta.url), 'utf8');
    assert.match(execution, /copy\('tools\/tests\/martial_data\/taohua_ding_receivers\.h'/);
    assert.match(runner, /#include "\/tests\/taohua_ding_receivers\.h"/);
});

test('snapshot只读确切USER与实际资格/副手/对手；不把未知禁招补零', () => {
    const fn = body('taohua_ding_snapshot');
    assert.match(fn, /member_array\(ob, players\)/);
    assert.match(fn, /side == 0 \|\| side == 1/);
    assert.match(fn, /ob->query\(key\)/);
    assert.match(fn, /ob->is_fighting\(opponent\)/);
    assert.match(fn, /result\["no_perform"\] = ob->query_temp\("no_perform"\)/);
    assert.match(fn, /equipment_snapshot\(secondary\)/);
    assert.doesNotMatch(fn, /->(?:set|add|delete|set_temp|start_busy|force_me)\(/);
});

test('callback必须精确target及真正caller读数；旧目标不认领，不额外调度解除', () => {
    const fn = body('taohua_ding_callback');
    assert.match(fn, /!active/);
    assert.match(fn, /!objectp\(target\) \|\| target != players\[1\]/);
    assert.match(fn, /owner == previous_object\(\)/);
    assert.match(fn, /base_name\(owner\) == "\/kungfu\/skill\/tanzhi-shentong\/ding"/);
    assert.match(fn, /function_name == "ding_end"/);
    assert.match(fn, /"owner": base_name\(owner\)/);
    assert.match(fn, /"function": function_name/);
    assert.match(fn, /"state": snapshot\(target\)/);
    assert.doesNotMatch(fn, /(?:call_out|remove_call_out|delete_temp|force_me|->die|->unconcious)\(/);
    assert.equal(readFileSync(path, 'utf8'), source);
});
