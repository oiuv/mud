import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinBoutConditions } from './school_shaolin_bout_cases.mjs';
import { schoolBoutEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = shaolinBoutConditions(catalog);

test('少林六组合12条件240场；旧8928条件完整指纹不变，烟雾独立24场', () => {
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 8928); assert.equal(old.reduce((n, c) => n + c.samples, 0), 228098);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '8b8b3ab51c91e5ae821d8301d4a5bd5475eb1a05da25ff11b896ec4a002246e0');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'shaolin-bout'), cases);
    assert.equal(cases.length, 12); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 240);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        assert.equal(c.method, 'bout'); assert.equal(c.parameters.observe_seconds, 30);
        assert.equal(c.parameters.actor.temp, undefined); assert.equal(c.parameters.strategy, 'ordinary');
        assert.equal(c.parameters.first, 'alternating_index');
        for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
    }
    for (const c of shaolinBoutConditions(catalog, { smoke: true })) {
        assert.equal(c.samples, 2); assert.equal(c.parameters.observe_seconds, 3);
    }
});

// Synthetic rows test validation only; actual player effects require the driver.
function row(c, index = 0) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({ ...config.properties,
        userp: 1, interactive: 1, wizardp: 0, skills: structuredClone(config.skills),
        mappings: structuredClone(config.mappings), preparations: structuredClone(config.preparations),
        weapon: config.equipment?.type ?? 'none', weapon_damage: config.equipment ? 50 : 0, temp: {} }));
    return { outcome: 'observed', index, first: index % 2, first_actor: index % 2, method: 'bout',
        before, immediate: structuredClone(before), after: structuredClone(before),
        attacks: [], attack_rounds: [], interfaces: [], launches: [], passives: [], defenses: [],
        terminal: 'time_limit', elapsed: 30.1, winner: -1, busy_seconds: [0, 0],
        metrics: [{ heartbeats: 15 }, { heartbeats: 15 }] };
}

test('原玩家资格、棍杖类别与互备分别核对，不因都是普通交锋而跳过初态', () => {
    for (const c of cases) {
        for (const i of [0, 1]) validateSchoolCombatRecord(row(c, i), c);
        for (const modify of [r => r.before[0].mappings.force = 'shaolin-xinfa',
            r => r.before[0].wizardp = 1, r => r.before[0].neili = 5000,
            r => r.before[0].preparations = { strike: 'banruo-zhang' },
            r => r.before[0].weapon = 'spear', r => r.before[0].temp.combat_time = 12]) {
            const r = row(c); modify(r); assert.throws(() => validateSchoolCombatRecord(r, c));
        }
    }
    assert.equal(cases.filter(c => c.parameters.usage === 'club').length, 2);
    assert.equal(cases.filter(c => c.parameters.usage === 'staff').length, 2);
    assert.equal(cases.filter(c => c.parameters.paired).length, 2);
});

test('原实际选技、内功支付及恢复分账，不以攻击次数推算内力消耗', () => {
    const c = cases.find(c => c.parameters.paired && c.parameters.actor.properties.jiali === 50), r = row(c);
    r.attacks = [{ actor: 0, target: 1, attack_usage: 'unarmed', attack_skill: 'qinna-shibada' }];
    r.attacks.push({ actor: 1, target: 0, attack_usage: 'sword', attack_skill: 0 });
    r.passives = [{ actor: 0, target: 1, route: 'force', skill: 'hunyuan-yiqi', factor: 50 }];
    r.metrics[0].neili_cost = 50; r.metrics[0].neili_recovery = 30; r.after[0].neili -= 20;
    validateSchoolCombatRecord(r, c);
    const stats = schoolBoutEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(stats.sides[0].force_calls.mean, 1); assert.equal(stats.sides[0].net_neili_loss.mean, 20);
    assert.equal(stats.taiji, undefined);
    for (const modify of [x => x.metrics[0].neili_cost = 0,
        x => x.attacks[0].attack_skill = 'taiji-quan', x => x.passives[0].skill = 'yijinjing',
        x => x.attacks[1].attack_skill = null, x => delete x.attacks[1].attack_skill,
        x => x.attacks[1].attack_skill = 'damo-jian']) {
        const x = structuredClone(r); modify(x); assert.throws(() => validateSchoolCombatRecord(x, c));
    }
});

test('交替先手、原心跳和计数必须有证据，时限未决不算胜利', () => {
    const c = cases[0], r = row(c);
    r.attack_rounds = [{ actor: 0, before: null, after: 1, result: 1 }];
    r.after[0].temp.combat_time = 1; validateSchoolCombatRecord(r, c);
    for (const modify of [x => x.attack_rounds = [], x => x.first_actor = 1,
        x => x.metrics[0].heartbeats = 0, x => x.elapsed = 29.9,
        x => x.winner = 0, x => x.launches = [{ skill: 'damo-jian' }]]) {
        const x = structuredClone(r); modify(x); assert.throws(() => validateSchoolCombatRecord(x, c));
    }
    assert.equal(schoolBoutEffects([]).sides[0].net_qi_loss.mean, null);
});

test('隔离观察器只采原选技与计数；新条件进入冻结输入而不新增游戏探针', () => {
    assert.match(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8'), /school_shaolin_bout_cases\.mjs/);
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    for (const name of ['observe_attack', 'observe_attack_round']) {
        const body = runner.slice(runner.indexOf('void ' + name + '(')).split('\n}\n')[0];
        assert.match(body, /shaolin-bout/); assert.doesNotMatch(body, /->(?:set_temp|add_temp)\(|random\(/);
    }
});
