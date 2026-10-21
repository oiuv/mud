import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolBoutEffects, validateSchoolCombatPlan } from './school_combat_report.mjs';
import { emeiBoutConditions, emeiBoutProfiles, emeiBoutGroup } from './school_emei_bout_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = emeiBoutConditions(catalog);

test('峨嵋16组合32条件640场；原11580条件指纹不变', () => {
    const all = schoolCombatConditions(catalog);
    const historical = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school)
        && !['quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    const old = historical.filter(c => c.parameters.collection_group !== emeiBoutGroup);
    assert.equal(old.length, 11580); assert.equal(old.reduce((n, c) => n + c.samples, 0), 289524);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '8f3f52177cf6bef53e62e59d2e03ba87340114f25c7255b37351a85c61d3dea3');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === emeiBoutGroup), cases);
    assert.equal(emeiBoutProfiles.length, 16); assert.equal(cases.length, 32);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 640);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    validateSchoolCombatPlan(cases, catalog);
    for (const c of cases) {
        assert.equal(c.method, 'bout'); assert.equal(c.parameters.observe_seconds, 30);
        assert.equal(c.parameters.strategy, 'ordinary'); assert.equal(c.parameters.first, 'alternating_index');
        assert.equal(c.parameters.actor.temp, undefined);
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    }
    assert.throws(() => emeiBoutConditions({ skills: [] }));
});

test('四门内功、两种身法和四组互备有独立条件；九阴仅实验配技不称可授', () => {
    const countForce = force => cases.filter(c => c.parameters.actor.mappings.force === force).length;
    assert.deepEqual(['emei-xinfa', 'linji-zhuang', 'emei-jiuyang', 'yijin-duangu'].map(countForce), [4, 18, 2, 8]);
    assert.equal(cases.filter(c => c.parameters.paired).length, 8);
    assert.equal(cases.filter(c => c.parameters.actor.equipment).length, 10);
    for (const c of cases) {
        assert.equal(c.parameters.actor.properties.gender, '女性');
        assert.equal(c.parameters.target.properties.jiali, 0);
        assert.equal(Object.values(c.parameters.actor.skills).every(x => x === 400), true);
        assert.match(c.parameters.qualification_note, /拒教/);
        assert.match(c.parameters.qualification_note, /不冒充其原配装/);
    }
    const smoke = emeiBoutConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 64);
    for (const c of smoke) { assert.equal(c.samples, 2); assert.equal(c.parameters.observe_seconds, 3); }
});

// Synthetic records verify collectors only, never stand in for combat observations.
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

test('逐项核验非巫师玩家、映射、属性、装备及准备初态', () => {
    for (const c of cases) {
        for (const i of [0, 1]) validateSchoolCombatRecord(row(c, i), c);
        for (const modify of [r => r.before[0].wizardp = 1, r => r.before[0].skills.force = 600,
            r => r.before[0].mappings.force = 'hunyuan-yiqi', r => r.before[0].neili = 5000,
            r => r.before[0].preparations = { cuff: 'luohan-quan' },
            r => r.before[0].temp.combat_time = 1, r => r.before[0].weapon = 'staff']) {
            const r = row(c); modify(r); assert.throws(() => validateSchoolCombatRecord(r, c));
        }
    }
});

test('实际互备选技与公共内功扣费分账，不把恢复或附加调用计成额外攻击', () => {
    for (const force of ['emei-xinfa', 'linji-zhuang', 'emei-jiuyang', 'yijin-duangu']) {
        const c = cases.find(c => c.parameters.actor.mappings.force === force && c.parameters.actor.properties.jiali === 50);
        const r = row(c), usage = c.parameters.usage;
        r.attacks = [{ actor: 0, target: 1, attack_usage: usage, attack_skill: c.parameters.skill },
            { actor: 1, target: 0, attack_usage: 'sword', attack_skill: 0 }];
        r.passives = [{ actor: 0, target: 1, route: 'force', skill: force, factor: 50 },
            { actor: 0, target: 1, route: 'martial', skill: c.parameters.skill, result: 0 }];
        r.metrics[0].neili_cost = 50; r.metrics[0].neili_recovery = 30; r.after[0].neili -= 20;
        validateSchoolCombatRecord(r, c);
        const stats = schoolBoutEffects([{ outcome: 'observed', raw: r }]);
        assert.equal(stats.sides[0].force_calls.mean, 1); assert.equal(stats.sides[0].attacks.mean, 1);
        assert.equal(stats.sides[0].net_neili_loss.mean, 20);
        for (const modify of [x => x.metrics[0].neili_cost = 20, x => x.passives[0].factor = 0,
            x => x.passives[0].skill = 'taiji-shengong', x => x.attacks[1].attack_skill = null]) {
            const x = structuredClone(r); modify(x); assert.throws(() => validateSchoolCombatRecord(x, c));
        }
    }
    for (const c of cases.filter(c => c.parameters.paired)) {
        const r = row(c);
        r.attacks = Object.entries(c.parameters.actor.preparations).map(([usage, skill]) =>
            ({ actor: 0, target: 1, attack_usage: usage, attack_skill: skill }));
        validateSchoolCombatRecord(r, c);
        r.attacks[0].attack_skill = 'luohan-quan'; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('原心跳、交替先手、计数及终态不可省略，未决不记胜', () => {
    const c = cases[0], r = row(c);
    r.attack_rounds = [{ actor: 0, before: null, after: 1, result: 1 }];
    r.after[0].temp.combat_time = 1; validateSchoolCombatRecord(r, c);
    for (const modify of [x => x.attack_rounds = [], x => x.first_actor = 1,
        x => x.metrics[0].heartbeats = 0, x => x.elapsed = 29.9, x => x.winner = 0,
        x => x.launches = [{ skill: 'emei-jian' }], x => x.outcome = 'error']) {
        const x = structuredClone(r); modify(x); assert.throws(() => validateSchoolCombatRecord(x, c));
    }
    assert.equal(schoolBoutEffects([]).sides[0].net_qi_loss.mean, null);
});

test('隔离观察器、执行指纹、报告接入同一组合，不新增探针或篡改随机', () => {
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    for (const name of ['observe_attack', 'observe_attack_round']) {
        const body = runner.slice(runner.indexOf('void ' + name + '(')).split('\n}\n')[0];
        assert.match(body, /emei-bout/); assert.doesNotMatch(body, /->(?:set_temp|add_temp)\(|random\(/);
    }
    assert.match(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8'), /school_emei_bout_cases\.mjs/);
    assert.match(readFileSync(join(root, 'tools/tests/martial_data/school_combat_report.mjs'), 'utf8'), /'emei-bout'\]\.includes/);
});
