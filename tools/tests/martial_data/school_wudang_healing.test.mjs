import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { wudangForces } from './school_wudang_cultivation_cases.mjs';
import { wudangHealingConditions, healingStepExpected, validateWudangHealingRecord } from './school_wudang_healing_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = wudangHealingConditions(catalog);
const find = suffix => { const c = cases.find(x => x.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('疗伤登记原心跳方法与冻结输入，旧3645条件96204条计划不变', () => {
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
    const old = all.filter(c => !['wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 3645); assert.equal(old.reduce((n, c) => n + c.samples, 0), 96204);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'wudang-healing'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.match(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8'),
        /'tools\/tests\/martial_data\/school_wudang_healing_cases\.mjs'/);
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.match(runner, /void observe_healing/);
    assert.match(runner, /"busy_ended"/);
    assert.match(runner, /original heartbeat action watchdog expired without completion/);
    assert.match(runner, /"healing_halt"\]\["after"\] = snapshot/);
    const c = find('heal-l200'); validateSchoolCombatRecord(row(c), c);
});

// Synthetic traces exercise the validator; they are not measured game evidence.
function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => ({
        qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
        neili: 6000, max_neili: 6000, ...cfg.properties, skills: structuredClone(cfg.skills),
        effective_skills: { force: Math.trunc((cfg.skills.force ?? 0) / 2) + (cfg.skills[cfg.mappings.force] ?? 0) },
        effective_con: cfg.properties.con ?? 36, cultivation: { breakup: cfg.properties.breakup ?? 0,
            'special_skill/divine': cfg.properties['special_skill/divine'] ?? 0 },
        mappings: structuredClone(cfg.mappings), busy: cfg.busy ?? 0, weapon: 'none', temp: { ...cfg.temp },
    }));
    const raw = { before, immediate: structuredClone(before), after: null, attacks: [], interfaces: [],
        outcome: p.expected, reason: '原资格拒绝', launches: [], command_accepted: Number(p.expected === 'observed'),
        metrics: [{ neili_cost: 0 }, {}], healing_steps: [] };
    if (p.expected === 'refused') { raw.after = structuredClone(raw.immediate); return raw; }
    const flag = p.ability === 'heal' ? 'healing' : 'inspiring';
    const first = raw.immediate[0]; first.busy = '<function>'; first.temp.pending = { [flag]: 1 };
    raw.launches.push({ skill: 'force' }); raw.after = structuredClone(raw.immediate);
    const state = raw.after[0];
    for (let tick = 1; tick < 100; tick++) {
        raw.healing_steps.push({ phase: 'before', elapsed: tick, state: structuredClone(state) });
        const e = healingStepExpected(p.ability, state);
        state['eff_' + e.key] += e.gain; state.neili -= e.cost; raw.metrics[0].neili_cost += e.cost;
        if (e.stop) {
            state.busy = 0;
            if (p.ability === 'heal' || e.stop === 'unmapped') state.temp.pending[flag] = 0;
            else state.temp.pending[e.stop === 'completed' ? 'exercise' : 'healing'] = 0;
        }
        raw.healing_steps.push({ phase: 'after', elapsed: tick + 0.001, state: structuredClone(state) });
        if (e.stop) { raw.healing_terminal = 'busy_ended'; break; }
        if (p.halt_after) {
            raw.healing_halt = { before: structuredClone(state) };
            const fee = p.ability === 'heal' ? Math.min(state.neili, 100) : 0;
            state.neili -= fee; raw.metrics[0].neili_cost += fee;
            state.busy = 0; state.temp.pending[flag] = 0;
            raw.healing_halt.after = structuredClone(state);
            raw.halt_accepted = 1; raw.healing_terminal = 'halted'; break;
        }
    }
    assert.ok(raw.healing_terminal, '合成轨迹必须终止');
    return raw;
}

test('三门武当内功的原疗伤条件有独立身份和源码，不借用NPC豁免', () => {
    assert.equal(cases.length, 114); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 228);
    assert.equal(new Set(cases.map(c => c.id)).size, 114);
    assert.deepEqual([...new Set(cases.map(c => c.parameters.skill))], wudangForces);
    assert.ok(wudangHealingConditions(catalog, { smoke: true }).every(c => c.samples === 1));
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 48);
    for (const c of cases) {
        assert.equal(c.method, 'healing'); assert.equal(c.parameters.observe_seconds, 90);
        assert.ok(c.parameters.action.startsWith('exert '));
        for (const source of c.parameters.qualification_sources) assert.ok(existsSync(join(root, source)), source);
    }
});

test('合成起手、逐跳和结束轨迹全部通过；起手成功不能冒充完整疗伤', () => {
    for (const c of cases) validateWudangHealingRecord(row(c), c);
    const c = find('heal-l200'), raw = row(c); raw.healing_steps = [];
    assert.throws(() => validateWudangHealingRecord(raw, c));
    const spoofed = row(c); spoofed.launches[0].skill = c.parameters.skill;
    assert.throws(() => validateWudangHealingRecord(spoofed, c));
});

test('原heal考虑有效根骨及转世，inspire不套用这些疗伤倍数', () => {
    const state = row(find('heal-l200')).before[0]; state.eff_qi = 5000;
    assert.deepEqual(healingStepExpected('heal', state), { key: 'qi', cost: 50, gain: 110, stop: '' });
    state.cultivation['special_skill/divine'] = 1;
    assert.equal(healingStepExpected('heal', state).gain, 182);
    state.cultivation.breakup = 1;
    assert.equal(healingStepExpected('heal', state).gain, 546);
    state.eff_qi = 9999; assert.equal(healingStepExpected('heal', state).gain, 1);
    state.eff_jing = 5000; assert.equal(healingStepExpected('inspire', state).gain, 55);
    state.neili = 99; assert.equal(healingStepExpected('inspire', state).stop, 'depleted');
    state.eff_jing = 10000; assert.equal(healingStepExpected('inspire', state).stop, 'completed');
});

test('inspire结束仍保留原pending残留，不把MA-080在测试数据中修好', () => {
    for (const suffix of ['inspire-l200', 'inspire-l200-neili299']) {
        const c = find(suffix), raw = row(c);
        assert.equal(raw.after[0].busy, 0); assert.equal(raw.after[0].temp.pending.inspiring, 1);
        validateWudangHealingRecord(raw, c);
        raw.after[0].temp.pending.inspiring = 0;
        assert.throws(() => validateWudangHealingRecord(raw, c));
    }
    assert.equal(row(find('inspire-l200-halt')).after[0].temp.pending.inspiring, 0);
    assert.equal(row(find('heal-l200-neili50')).after[0].temp.pending.healing, 0);
});

test('halt通过独立前后状态核对附加扣费，低内力不扣成负数', () => {
    for (const [suffix, total] of [['heal-l200-halt', 150], ['heal-l200-halt-low-neili', 100], ['inspire-l200-halt', 100]]) {
        const c = find(suffix), raw = row(c);
        assert.equal(raw.healing_steps.length, 2); assert.equal(raw.metrics[0].neili_cost, total);
        validateWudangHealingRecord(raw, c);
        raw.healing_halt.before.neili++;
        assert.throws(() => validateWudangHealingRecord(raw, c));
    }
});

test('拒绝不能混入逐跳治疗或费用；严重伤势与神躯例外分开', () => {
    const refused = find('heal-l200-severe'), raw = row(refused);
    assert.equal(refused.parameters.expected, 'refused');
    assert.equal(find('heal-l200-divine-severe').parameters.expected, 'observed');
    raw.metrics[0].neili_cost = 50; assert.throws(() => validateWudangHealingRecord(raw, refused));
    const fake = row(refused); fake.healing_steps = [{ phase: 'before' }];
    assert.throws(() => validateWudangHealingRecord(fake, refused));
});

test('费用、单跳有效治疗量、原回调配对和终态都不可少', () => {
    const c = find('heal-l200');
    for (const mutate of [
        r => r.healing_steps[1].state.eff_qi++,
        r => r.healing_steps[1].state.neili++,
        r => r.healing_steps.pop(),
        r => r.healing_terminal = 'timeout',
        r => r.metrics[0].neili_cost--,
        r => r.after[0].busy = '<function>',
    ]) {
        const raw = row(c); mutate(raw); assert.throws(() => validateWudangHealingRecord(raw, c));
    }
});

test('宿主恢复另行入账，不能把最终内力净降当作技能费用', () => {
    const c = find('heal-l200'), raw = row(c);
    // A host recovery after the last original callback, before final snapshot.
    raw.after[0].neili += 10; raw.metrics[0].neili_recovery = 10;
    validateWudangHealingRecord(raw, c);
    assert.notEqual(raw.before[0].neili - raw.after[0].neili, raw.metrics[0].neili_cost);
    raw.metrics[0].neili_recovery = 0;
    assert.throws(() => validateWudangHealingRecord(raw, c));
});
