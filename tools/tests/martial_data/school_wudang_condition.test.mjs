import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { conditionTickProbes } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangConditionCases, conditionTickExpected, validateWudangConditionRecord, conditionEffects } from './school_wudang_condition_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = wudangConditionCases(catalog);
const pick = (name, variant) => cases.find(c => c.parameters.condition_name === name && c.parameters.combination === variant);

// Artificial validator records. Real heartbeat timing/damage is collected separately.
function row(c) {
    const p = c.parameters, before = [p.actor, p.target].map(cfg => ({
        ...cfg.properties, skills: cfg.skills, mappings: cfg.mappings,
        conditions: structuredClone(cfg.conditions || {}),
        effective_skills: { force: Math.trunc(cfg.skills.force / 2) + (cfg.skills[cfg.mappings.force] ?? 0) },
    }));
    let state = structuredClone(before[0]);
    const events = [], heartbeats = [];
    for (let i = 0; i < p.ticks; i++) {
        const e = conditionTickExpected(state, p), common = { name: p.condition_name,
            daemon: '/kungfu/condition/' + p.condition_name, elapsed: 5 + i * 5 };
        events.push({ ...common, phase: 'before', flag: 0, state: structuredClone(state) });
        for (const [k, range] of Object.entries(e.damage)) state[k] -= range[0];
        // Daemon return is captured before host-owned condition clearing.
        if (e.flag) state.conditions = structuredClone(e.conditions);
        events.push({ ...common, phase: 'after', flag: e.flag, state: structuredClone(state) });
        state.conditions = e.conditions;
        heartbeats.push({ elapsed: common.elapsed, state: structuredClone(state) });
    }
    return { outcome: 'observed', before, immediate: structuredClone(before), after: [state, structuredClone(before[1])],
        launches: [], attacks: [], interfaces: [], condition_events: events, condition_heartbeats: heartbeats,
        metrics: [{ heartbeats: p.ticks * 5 }, {}], elapsed: p.ticks * 5 };
}

test('17条件132记录保留旧4164条件105474样本，不假称自然施毒或exert', () => {
    assert.equal(cases.length, 17); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 132);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 4164); assert.equal(old.reduce((n, c) => n + c.samples, 0), 105474);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'wudang-condition'), cases);
    assert.ok(wudangConditionCases(catalog, { smoke: true }).every(c => c.samples === 2));
    for (const c of cases) {
        assert.equal(c.method, 'condition'); assert.ok(catalog.skills.some(s => s.path === c.entry_id));
        for (const source of c.parameters.qualification_sources) assert.ok(existsSync(join(root, source)), source);
        validateWudangConditionRecord(row(c), c); validateSchoolCombatRecord(row(c), c);
    }
});

test('探针只包围原调用，可完整移除，不额外调用更新、随机或清理', () => {
    const source = readFileSync(join(root, 'feature/condition.c'), 'utf8'), result = conditionTickProbes(source);
    assert.equal(result.sites.length, 1);
    assert.equal(result.changed.replace(result.sites[0].replacement, result.sites[0].anchor), source);
    assert.equal(result.changed.split('flag = call_other(cnd_d, "update_condition"').length, 2);
    assert.throws(() => conditionTickProbes(source + source));
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.doesNotMatch(runner, /->update_condition\(/);
    assert.doesNotMatch(runner, /next_beat\s*=/);
});

test('现有错误保留：非法id继续造成损伤，乱气只扣气血不扣有效气血', () => {
    const p = pick('freezing', 'bad-id'), r = row(p);
    assert.equal(r.condition_events[1].flag, 3);
    assert.equal(r.condition_events[0].state.qi - r.condition_events[1].state.qi, 33);
    const d = row(pick('damo_luanqi', 'normal'));
    assert.equal(d.condition_events[1].flag, 1);
    assert.equal(d.condition_events[0].state.eff_qi, d.condition_events[1].state.eff_qi);
    assert.deepEqual(conditionTickExpected(r.before[0], p.parameters).damage.eff_qi, [16, 16]);
});

test('缺观察、不完整工具状态、绕过宿主清除和NO_HEAL_UP回血均不能通过', () => {
    const c = pick('freezing', 'normal');
    for (const mutate of [
        r => r.condition_events.pop(), r => r.condition_events[0].phase = 'after',
        r => r.condition_events[1].state.eff_qi++, r => r.condition_heartbeats[0].state.qi++,
        r => r.condition_events[0].state.qi++, r => r.after[1].qi--,
        r => r.condition_heartbeats[0].state.conditions.freezing.remain++,
    ]) { const r = row(c); mutate(r); assert.throws(() => validateWudangConditionRecord(r, c)); }
    const two = pick('freezing', 'two-ticks'), r = row(two);
    r.condition_events[2].elapsed = 5;
    assert.throws(() => validateWudangConditionRecord(r, two));
});

test('统计分离实际伤害、恢复与清除，错误样本不填零', () => {
    const c = pick('freezing', 'two-ticks'), raw = row(c);
    const e = conditionEffects([{ outcome: 'observed', raw }, { outcome: 'error', raw: {} }]);
    assert.equal(e.samples, 1); assert.equal(e.unknown, 1); assert.equal(e.ticks, 2); assert.equal(e.cleared, 1);
    assert.equal(e.damage.qi.mean, 33); assert.equal(e.damage.eff_qi.mean, 16);
    assert.equal(e.recovery_after_update.qi.mean, 0); assert.equal(e.tick_intervals.mean, 5);
    assert.equal(conditionEffects([]).damage.qi.mean, null);
});
