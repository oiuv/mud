import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { npcBoutHeartbeatProbes, npcBoutChatProbes, npcBoutTerminalProbes,
    npcBoutCorpseProbes } from './npc_bout_probes.mjs';

const read = path => readFileSync(new URL('../../../' + path, import.meta.url), 'utf8');
const cases = [
    ['inherit/char/char.c', npcBoutHeartbeatProbes],
    ['inherit/char/npc.c', npcBoutChatProbes],
    ['feature/damage.c', npcBoutTerminalProbes],
    ['adm/daemons/chard.c', npcBoutCorpseProbes],
];

for (const [path, build] of cases) test(path + '：唯一锚点、逆变换及漂移拒绝，不写游戏文件', () => {
    const source = read(path), probe = build(source);
    assert.notEqual(probe.changed, source);
    assert.equal(probe.sites.reduceRight((text, site) => text.replace(site.replacement, site.anchor), probe.changed), source);
    for (const site of probe.sites) {
        assert.throws(() => build(source.replace(site.anchor, '')));
        assert.throws(() => build(source + '\n' + site.anchor));
    }
    assert.throws(() => build(probe.changed), '不得重复注入');
    const randoms = text => [...text.matchAll(/\brandom\([^\n]*?\)/g)].map(m => m[0]);
    assert.deepEqual(randoms(probe.changed), randoms(source), '随机调用及顺序原样保留');
});

test('原攻击与闭包仅求值一次；原分支和返回保留，无手工调度', () => {
    const heartbeat = npcBoutHeartbeatProbes(read(cases[0][0])).changed;
    assert.equal((heartbeat.match(/npc_observed_attack_result = attack\(\);/g) ?? []).length, 1);
    const source = read(cases[1][0]), chat = npcBoutChatProbes(source).changed;
    assert.equal((chat.match(/evaluate\(msg\[rnd\]\)/g) ?? []).length, 1);
    assert.ok(chat.includes('return npc_observed_choice_result;'));
    for (const expression of ['if (is_busy())', 'random(100) < chance', 'rnd = random(sizeof(msg));'])
        assert.equal(chat.split(expression).length, source.split(expression).length);
    for (const [, build] of cases) assert.equal(typeof build, 'function');
    assert.equal(heartbeat.split('set_heart_beat').length, read(cases[0][0]).split('set_heart_beat').length);
    assert.doesNotMatch(heartbeat, /call_out\("observe_npc/);
});

test('原尸体三条返回分别观察；不从房间搜索同名对象、不额外创建尸体', () => {
    const source = read(cases[3][0]), changed = npcBoutCorpseProbes(source).changed;
    assert.equal((changed.match(/observe_npc_corpse\(/g) ?? []).length, 3);
    assert.equal((changed.match(/new\(CORPSE_OB\)/g) ?? []).length, 1);
    assert.equal((changed.match(/corpse->make_corpse\(victim, killer\)/g) ?? []).length, 1);
    assert.equal((changed.match(/return 0;/g) ?? []).length, (source.match(/return 0;/g) ?? []).length);
    assert.doesNotMatch(changed, /present\(|all_inventory\(environment/);
});
