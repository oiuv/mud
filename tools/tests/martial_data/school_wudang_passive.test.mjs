import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangPassiveEffects } from './school_combat_report.mjs';
import { taijiPassiveProbes } from './execution.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-passive');
const by = (ability = 'hit_ob', counter = 20, suffix = '') => cases.find(c =>
    c.id === `school-wudang-passive-${ability}-l400-c${counter}${suffix}`);

test('太极蓄力38条件2348样本；旧1726条件59998样本不变，来源与标识闭合', () => {
    assert.equal(cases.length, 38); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2348);
    const old = all.filter(c => !['wudang-passive', 'wudang-special', 'wudang-weapons', 'wudang-shenmen', 'wudang-unarmed', 'wudang-learning', 'wudang-cultivation', 'wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 1726); assert.equal(old.reduce((n, c) => n + c.samples, 0), 59998);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) for (const source of c.parameters.qualification_sources) assert.ok(existsSync(join(root, source)), source);
    assert.equal(schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'wudang-passive')
        .reduce((n, c) => n + c.samples, 0), 76);
});

test('原心跳交锋与预置计数点测分开；保留30秒20场与交替先手', () => {
    const bout = by('bout', 0);
    assert.equal(bout.method, 'bout'); assert.equal(bout.samples, 20);
    assert.equal(bout.parameters.observe_seconds, 30);
    assert.equal(bout.parameters.first, 'alternating_index');
    assert.equal(bout.parameters.actor.temp, undefined);
    const smoke = schoolCombatConditions(catalog, { smoke: true }).find(c => c.id === bout.id);
    assert.equal(smoke.parameters.observe_seconds, 3);
    for (const c of cases.filter(c => c.method !== 'bout')) assert.equal(c.parameters.observe_seconds, 0);
});

function row(c = by(), triggered = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        weapon: config.equipment?.type ?? 'none', temp: { combat_time: config.temp?.combat_time ?? 0,
            action_flag: config.temp?.action_flag ?? 0,
            apply: Object.fromEntries(['attack', 'parry', 'unarmed_damage'].map(k => [k, config.temp?.['apply/' + k] ?? 0])) } }));
    const raw = { outcome: 'observed', before, immediate: structuredClone(before), after: structuredClone(before),
        launches: [], interfaces: p.interface ? [{ function: p.interface.function, result: 0 }] : [],
        attacks: [], attack_rounds: [], taiji_events: [] };
    if (p.ability.startsWith('remove_')) { raw.immediate[0].temp.combat_time = 0; raw.after[0].temp.combat_time = 0; return raw; }
    const enter = { actor: 0, target: 1, phase: 'enter', combat_time: before[0].temp.combat_time,
        action_flag: before[0].temp.action_flag, apply: structuredClone(before[0].temp.apply), attack_index: 0 };
    raw.taiji_events.push(enter);
    if (triggered) {
        const boosted = structuredClone(enter); boosted.phase = 'boosted'; boosted.action_flag = 1;
        for (const k of Object.keys(boosted.apply)) boosted.apply[k] += enter.combat_time * (k === 'unarmed_damage' ? 3 : 10);
        raw.taiji_events.push(boosted, { ...structuredClone(boosted), phase: 'enter' },
            { ...structuredClone(enter), phase: 'restored', action_flag: 0, attack_index: 1 });
        raw.attacks.push({ actor: 0, target: 1, type: 10, result: 0 });
    }
    if (c.method === 'ordinary') raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0 });
    return raw;
}

test('空返回不等于未触发；必须有原追加攻击及加成恢复证据', () => {
    const c = by(), raw = row(c, true);
    validateSchoolCombatRecord(raw, c);
    const missing = structuredClone(raw); missing.attacks = [];
    assert.throws(() => validateSchoolCombatRecord(missing, c));
    const dirty = structuredClone(raw); dirty.after[0].temp.apply.attack = 1;
    assert.throws(() => validateSchoolCombatRecord(dirty, c));
    const noRestore = structuredClone(raw); noRestore.taiji_events.pop();
    assert.throws(() => validateSchoolCombatRecord(noRestore, c));
});

test('原query_temp未定义序列化为null，删除标记不误判恢复失败', () => {
    const c = by(), raw = row(c, true);
    raw.taiji_events[3].action_flag = null;
    raw.taiji_events[0].apply = { attack: null, parry: null, unarmed_damage: null };
    validateSchoolCombatRecord(raw, c);
    raw.taiji_events[3].apply.attack = 1;
    assert.throws(() => validateSchoolCombatRecord(raw, c));
});

test('counter=10及已有action_flag均不可触发；counter=11不强制随机结果', () => {
    for (const c of [by('hit_ob', 10), by('hit_ob', 20, '-guarded')]) {
        validateSchoolCombatRecord(row(c), c);
        assert.throws(() => validateSchoolCombatRecord(row(c, true), c));
    }
    const c = by('hit_ob', 11);
    validateSchoolCombatRecord(row(c), c); validateSchoolCombatRecord(row(c, true), c);
});

test('不清空已有加成；无内力本身不禁止原接口；递归标记须生效', () => {
    for (const suffix of ['-existing-bonus', '-neili0']) {
        const c = by('hit_ob', 20, suffix), raw = row(c, true);
        validateSchoolCombatRecord(raw, c);
        const nested = structuredClone(raw); nested.taiji_events[2].action_flag = 0;
        assert.throws(() => validateSchoolCombatRecord(nested, c));
    }
    const c = by('hit_ob', 20, '-existing-bonus'), raw = row(c, true);
    raw.taiji_events[3].apply.attack = 0;
    assert.throws(() => validateSchoolCombatRecord(raw, c));
});

test('原结束战斗接口清除计数；不能由空返回或零伤害推断成功', () => {
    for (const ability of ['remove_enemy', 'remove_all_enemy']) {
        const c = by(ability), raw = row(c); validateSchoolCombatRecord(raw, c);
        raw.immediate[0].temp.combat_time = 20; assert.throws(() => validateSchoolCombatRecord(raw, c));
    }
    const c = by('ordinary'), raw = row(c); raw.taiji_events = [];
    validateSchoolCombatRecord(raw, c);
    const report = wudangPassiveEffects([{ outcome: 'observed', raw }]);
    assert.equal(report.eligible_entries, 0); assert.equal(report.trigger_per_eligible_call.rate, null);
    assert.equal(report.extra_hits.rate, null);
});

test('心跳交锋保留原attack计数、交替先手和未决终态，不能把追加攻击再算一轮', () => {
    const c = by('bout', 0), raw = row(c);
    raw.taiji_events = [];
    raw.index = 0; raw.first = 0; raw.first_actor = 0; raw.terminal = 'time_limit';
    raw.winner = -1; raw.elapsed = 30.1; raw.busy_seconds = [0, 0];
    raw.metrics = [{ heartbeats: 30 }, { heartbeats: 29 }];
    raw.attack_rounds = [{ actor: 0, before: null, after: 1, result: 1 },
        { actor: 1, before: null, after: 1, result: 1 }];
    raw.after[0].temp.combat_time = raw.after[1].temp.combat_time = 1;
    validateSchoolCombatRecord(raw, c);
    const twice = structuredClone(raw); twice.attack_rounds[0].after = 2;
    assert.throws(() => validateSchoolCombatRecord(twice, c));
    const missing = structuredClone(raw); missing.attack_rounds = [];
    assert.throws(() => validateSchoolCombatRecord(missing, c));
    const winner = structuredClone(raw); winner.winner = 0;
    assert.throws(() => validateSchoolCombatRecord(winner, c));
});

test('报告分开入口、可触发入口、递归受阻、触发、追加攻击和命中', () => {
    const raw = row(by(), true), report = wudangPassiveEffects([{ outcome: 'observed', raw }]);
    assert.equal(report.entries, 2); assert.equal(report.eligible_entries, 1);
    assert.equal(report.guarded_entries, 1); assert.equal(report.triggers, 1); assert.equal(report.restored, 1);
    assert.equal(report.extra_hits.successes, 1); assert.equal(report.extra_types[10], 1);
    raw.attacks[0].result = -1;
    const miss = wudangPassiveEffects([{ outcome: 'observed', raw }]);
    assert.equal(miss.triggers, 1); assert.equal(miss.extra_hits.successes, 0);
});

test('临时副本探针逐字可还原，不增加随机、原攻击或计数写入', () => {
    const source = readFileSync(join(root, 'kungfu/skill/taiji-quan.c'), 'utf8');
    const { changed, sites } = taijiPassiveProbes(source);
    assert.equal(sites.length, 3);
    for (const needle of ['random(', '->do_attack(', '->add_temp(', '->delete_temp('])
        assert.equal(changed.split(needle).length, source.split(needle).length);
    let restored = changed;
    for (const { anchor, insert } of [...sites].reverse()) restored = restored.replace(anchor + insert, anchor);
    assert.equal(restored, source);
    assert.throws(() => taijiPassiveProbes(source + source), /不唯一/);
});

test('同场回调与追加攻击只报告观察比率，不伪造独立样本置信区间', () => {
    const raw = row(by(), true);
    raw.taiji_events.push(...structuredClone(raw.taiji_events));
    raw.attacks.push(...structuredClone(raw.attacks));
    const report = wudangPassiveEffects([{ outcome: 'observed', raw }]);
    assert.deepEqual(report.trigger_per_eligible_call, { successes: 2, trials: 2, rate: 1 });
    assert.deepEqual(report.extra_hits, { successes: 2, trials: 2, rate: 1 });
    assert.equal(report.samples_with_trigger.trials, 1);
    assert.equal(typeof report.samples_with_trigger.low95, 'number');
});
