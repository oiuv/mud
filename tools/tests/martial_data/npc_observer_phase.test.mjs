import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';

const source = readFileSync(new URL('./npc_observer.lpc', import.meta.url), 'utf8');
const body = name => {
    const marker = `mapping ${name}(`;
    assert.equal(source.split(marker).length, 2, name);
    return source.slice(source.indexOf(marker)).split('\n}\n')[0];
};
const fingerprint = text => createHash('sha256').update(JSON.stringify(tokenize(text)
    .filter(t => !['comment', 'whitespace'].includes(t.kind)).map(t => t.text))).digest('hex');
const inOrder = (fragment, markers) => {
    const indices = markers.map(marker => {
        assert.equal(fragment.split(marker).length, 2, '挂点必须存在且唯一：' + marker);
        return fragment.indexOf(marker);
    });
    for (let i = 1; i < indices.length; i++) assert.ok(indices[i - 1] < indices[i]);
};

// These two hashes came from the original fixture actually used by gbout-f2,
// not from this refactor's output. Whitespace/comments are not behavior tokens.
test('原构造门槛、单例归属及初始化token不漂移', () => {
    const prepared = body('prepare_gumu');
    assert.equal(fingerprint(prepared.slice(prepared.indexOf('    if (base_name'),
        prepared.lastIndexOf('    return gumu_result;'))),
    '39ae0590e857571e33c0b569d370e112327ef398ecf0695afcfc792910eb2a25');
    assert.doesNotMatch(prepared, /evaluate\(callbacks\[/);
});

test('旧单闭包只求值一次、原索引/归属/返回token和执行顺序保持', () => {
    const observed = body('observe_gumu');
    assert.equal(fingerprint(observed.slice(observed.indexOf('    index = config['),
        observed.indexOf('    capture_gumu(index);'))),
    '7c8d18c2bca57e5731591dade6c3bb3f0f0ae47d0ab16b2bf288eb7809a6b712');
    inOrder(observed, ['prepare_gumu(config, target)', 'evaluate(callbacks[index])',
        'capture_gumu(index)', 'clear_gumu()']);
});

test('新阶段禁选择闭包；准备中途异常先精确回收再重抛', () => {
    const prepared = body('prepare_gumu_bout');
    assert.match(prepared, /config\["callback_index"\] != -1/);
    const prior = prepared.indexOf('error("Prior original NPC observation not cleaned.');
    const attempt = prepared.indexOf('failure = catch');
    const cleanup = prepared.indexOf('clear_gumu();');
    assert.ok(prior >= 0 && prior < attempt && attempt < cleanup);
    assert.ok(cleanup < prepared.indexOf('error(stringp(failure)'));
    assert.doesNotMatch(prepared, /evaluate\(callbacks|->heart_beat\(|->force_me\(/);
});

test('死亡后捕获显式缺席；新字段不扩展旧NPC快照', () => {
    assert.match(body('capture_gumu'), /objectp\(gumu_npc\) \? gumu_state\(gumu_npc\) : absent/);
    assert.match(body('capture_gumu_bout'), /gumu_bout_state\(gumu_npc\)/);
    assert.doesNotMatch(body('gumu_state'), /result\["ghost"\]|result\["conditions"\]/);
    assert.match(body('gumu_bout_state'), /result\["ghost"\] = ob->is_ghost\(\)/);
});

test('幂等清理保留原件、存在性先冻结、叶物和确切尸体先于NPC', () => {
    const cleared = body('clear_gumu_bout');
    assert.match(cleared, /if \(!mapp\(gumu_bout_owned\)\) return gumu_result/);
    inOrder(cleared, ['existence[name] = objectp', 'destruct(ob)']);
    assert.match(cleared, /gumu_bout_items \+ gumu_bout_corpses \+\s*gumu_result\["preparation"\]\["created_npcs"\]/);
    assert.match(cleared, /existed = existence\[name\]/);
    assert.doesNotMatch(cleared, /all_inventory\(|deep_inventory\(|present\(/);
    assert.match(source, /base_name\(corpse\) != "\/clone\/misc\/corpse"/);
});

test('删除准备调用或清理前存在性挂点不能因indexOf=-1伪通过', () => {
    const observed = body('observe_gumu'), cleared = body('clear_gumu_bout');
    assert.throws(() => inOrder(observed.replace('prepare_gumu(config, target)', 'missing_prepare()'),
        ['prepare_gumu(config, target)', 'evaluate(callbacks[index])']));
    assert.throws(() => inOrder(cleared.replace('existence[name] = objectp', 'missing_existence = objectp'),
        ['existence[name] = objectp', 'destruct(ob)']));
});
