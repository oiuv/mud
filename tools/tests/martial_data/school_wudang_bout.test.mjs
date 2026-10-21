import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangBoutConditions } from './school_wudang_bout_cases.mjs';
import { wudangBoutEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-bout');

test('武当组合交锋6条件120场，旧3456条件93366样本不改；烟雾独立12场', () => {
    assert.equal(cases.length, 6); assert.equal(cases.reduce((n,c) => n + c.samples, 0), 120);
    const old = all.filter(c => !['wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 3456); assert.equal(old.reduce((n,c) => n + c.samples, 0), 93366);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        assert.equal(c.method, 'bout'); assert.equal(c.parameters.observe_seconds, 30);
        assert.equal(c.parameters.actor.temp, undefined); assert.equal(c.parameters.strategy, 'ordinary');
        assert.equal(c.parameters.first, 'alternating_index'); assert.equal(c.parameters.prepare_commands, undefined);
        for (const source of c.parameters.qualification_sources) assert.ok(existsSync(join(root, source)), source);
    }
    for (const c of wudangBoutConditions(catalog, { smoke: true })) {
        assert.equal(c.samples, 2); assert.equal(c.parameters.observe_seconds, 3);
    }
});

// Synthetic data verifies evidence validation, not actual game outcomes.
function row(c, index = 0) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations), weapon: config.equipment?.type ?? 'none',
        weapon_damage: config.equipment ? 50 : 0, temp: {} }));
    return { outcome: 'observed', index, first: index % 2, first_actor: index % 2, method: 'bout',
        before, immediate: structuredClone(before), after: structuredClone(before),
        attacks: [], attack_rounds: [], taiji_events: [], interfaces: [], launches: [], passives: [], defenses: [],
        terminal: 'time_limit', elapsed: 30.1, winner: -1, busy_seconds: [0, 0],
        metrics: [{ heartbeats: 15 }, { heartbeats: 15 }] };
}

test('组合保持原内功/轻功/招架映射与准备，初态差异不能混入', () => {
    for (const c of cases) {
        for (const index of [0, 1]) validateSchoolCombatRecord(row(c, index), c);
        const wrong = row(c); wrong.before[0].mappings.force = 'force';
        assert.throws(() => validateSchoolCombatRecord(wrong, c));
        const setup = row(c); setup.before[0].dex = 30;
        assert.throws(() => validateSchoolCombatRecord(setup, c));
        const prep = row(c); prep.before[0].preparations.claw = 'huzhua-shou';
        assert.throws(() => validateSchoolCombatRecord(prep, c));
    }
});

test('内力按实际内功回调对账，不按总攻击数或加力设置值虚构消耗', () => {
    const c = cases.find(c => c.parameters.actor.properties.jiali === 50), r = row(c);
    r.passives.push({ actor: 0, target: 1, route: 'force', skill: 'taiji-shengong', factor: 50 });
    r.metrics[0].neili_cost = 50; r.metrics[0].neili_recovery = 30; r.after[0].neili -= 20;
    validateSchoolCombatRecord(r, c);
    const s = wudangBoutEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(s.sides[0].force_calls.mean, 1); assert.equal(s.sides[0].net_neili_loss.mean, 20);
    const missing = structuredClone(r); missing.metrics[0].neili_cost = 0;
    assert.throws(() => validateSchoolCombatRecord(missing, c));
    const zero = cases.find(c => !c.parameters.actor.properties.jiali), z = row(zero);
    z.passives = r.passives; assert.throws(() => validateSchoolCombatRecord(z, zero));
});

test('原计数与先手须有证据，持剑不得伪造太极拳被动，未决不能算赢', () => {
    const c = cases.find(c => c.parameters.combination === 'taiji-jian'), r = row(c);
    r.attack_rounds = [{ actor: 0, before: null, after: 1, result: 1 }];
    r.after[0].temp.combat_time = 1; validateSchoolCombatRecord(r, c);
    const missing = structuredClone(r); missing.attack_rounds = [];
    assert.throws(() => validateSchoolCombatRecord(missing, c));
    const passive = structuredClone(r); passive.taiji_events.push({ phase: 'boosted' });
    assert.throws(() => validateSchoolCombatRecord(passive, c));
    const winner = structuredClone(r); winner.winner = 0;
    assert.throws(() => validateSchoolCombatRecord(winner, c));
    const first = structuredClone(r); first.first_actor = 1;
    assert.throws(() => validateSchoolCombatRecord(first, c));
});

test('报告使用终态净下降，防御属于被攻击者；无样本不报零效果', () => {
    const r = row(cases[0]); r.after[1].qi -= 80;
    r.defenses = [{ actor: 1, target: 0, incoming: 100, result: { damage: -100 } }];
    const s = wudangBoutEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(s.sides[1].net_qi_loss.mean, 80); assert.equal(s.sides[0].damage_negated.mean, 1);
    assert.equal(s.sides[1].damage_negated.mean, 0); assert.equal(s.terminals.time_limit, 1);
    assert.equal(wudangBoutEffects([]).sides[0].net_qi_loss.mean, null);
});

test('冻结输入包含新配置，独立观察器包含组合交锋且不注入计数或随机', () => {
    assert.match(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8'), /school_wudang_bout_cases\.mjs/);
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    for (const name of ['observe_taiji', 'observe_attack_round']) {
        const body = runner.slice(runner.indexOf('void ' + name + '(')).split('\n}\n')[0];
        assert.match(body, /wudang-bout/); assert.doesNotMatch(body, /->(?:set_temp|add_temp)\(|random\(/);
    }
});
