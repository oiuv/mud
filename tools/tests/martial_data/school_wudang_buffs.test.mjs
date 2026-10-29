import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangBuffConditions, validateWudangBuffRecord } from './school_wudang_buffs_cases.mjs';
import { buffSequenceEffects } from './school_public_force_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = wudangBuffConditions(catalog);
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

// Synthetic observations test validators/reporting only, never represent driver evidence.
function row(c) {
    const p = c.parameters, before = [p.actor, p.target].map((cfg, side) => ({
        ...cfg.properties, skills: { ...cfg.skills }, mappings: { ...cfg.mappings },
        object: '/tests/actor#' + side, interactive: 1, busy: null,
        effective_skills: Object.fromEntries(Object.keys(cfg.skills).map(k =>
            [k, Math.trunc(cfg.skills[k] / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)])),
        temp: { apply: { armor: 100 } }, conditions: null,
    }));
    const state = structuredClone(before[0]), steps = [], launches = [], metrics = {};
    let refusals = 0;
    for (const plan of p.buff_steps) {
        const step = { operation: structuredClone(plan), before: structuredClone(state) };
        if (plan.refill_neili !== undefined) {
            metrics.neili_recovery = (metrics.neili_recovery ?? 0) + plan.refill_neili - state.neili;
            state.neili = plan.refill_neili;
        } else {
            const ability = plan.command.split(' ')[1], success = !state.temp[ability] && p.expected === 'observed';
            step.accepted = Number(success); step.launches_before = launches.length; step.refusals_before = refusals;
            if (!success) {
                step.reason = p.expected === 'refused' ? '你还没有入魔'
                    : ability === 'power' && state.neili < 100 ? '你的内力不够' : '你已经在运功中了';
                refusals++;
            }
            else {
                launches.push({ skill: 'force' }); step.reason = '';
                metrics.neili_cost = (metrics.neili_cost ?? 0) + state.neili; state.neili = 0;
                const apply = state.temp.apply;
                if (ability === 'power') apply[p.power_selected] = (apply[p.power_selected] ?? 0) + Math.trunc(state.skills['martial-cognize'] / 5);
                else {
                    const low = state.skills.force + Math.trunc(Math.cbrt(-state.shen)), count = Math.trunc(low / 4);
                    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) {
                        state[key] -= low + 500; metrics[key + '_cost'] = low + 500;
                    }
                    for (const key of ['str', 'int', 'con', 'dex']) apply[key] = (apply[key] ?? 0) + state[key];
                    apply.attack = (apply.attack ?? 0) + count;
                    for (const key of ['damage', 'unarmed_damage']) apply[key] = (apply[key] ?? 0) + state.str * 3;
                    for (const key of Object.keys(state.mappings)) apply[key] = (apply[key] ?? 0) + Math.trunc(count / 2);
                }
                state.temp[ability] = 1;
            }
            step.launches_after = launches.length; step.refusals_after = refusals;
        }
        step.after = structuredClone(state); steps.push(step);
    }
    const raw = { before, immediate: [state, structuredClone(before[1])], after: [structuredClone(state), structuredClone(before[1])],
        outcome: p.expected, command_accepted: Number(p.expected === 'observed'), launches,
        callbacks: [], attacks: [], buff_steps: steps, metrics: [metrics, {}] };
    if (p.persistence_probe) raw.persistence = { characters: 100, sha256: 'a'.repeat(64), restored: 1,
        before: { temp: {} }, after: { ...structuredClone(state), object: '/tests/actor#3', interactive: 0, temp: {} } };
    return raw;
}

test('追加51条件1278样本，不更改旧4071条件104112样本', () => {
    const all = preOctober29SchoolConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(cases.length, 51); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1278);
    assert.equal(old.length, 4071); assert.equal(old.reduce((n, c) => n + c.samples, 0), 104112);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'wudang-buffs'), cases);
    assert.ok(wudangBuffConditions(catalog, { smoke: true }).every(c => c.samples === 2));
    for (const c of cases) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        validateSchoolCombatRecord(row(c), c);
    }
});

test('重复施放与显式补给分账；不能把补给计为技能恢复或重复增益', () => {
    for (const ability of ['power', 'tianmo']) {
        const c = find(`${ability}-l400-repeat`), raw = row(c), e = buffSequenceEffects([{ outcome: raw.outcome, raw }]);
        assert.equal(e.accepted_steps, 1); assert.equal(e.refused_steps, 2); assert.equal(e.experimental_refills, 1);
        assert.equal(e.sides[0].cost.neili.mean, c.parameters.actor.properties.neili);
        assert.equal(e.sides[0].net.neili.mean, 0);
        raw.metrics[0].neili_cost = 0;
        assert.throws(() => validateWudangBuffRecord(raw, c));
    }
});

test('两种先后顺序可分别核验强化累加而不是重复覆盖', () => {
    for (const ability of ['power', 'tianmo']) {
        const c = find(`${ability}-l400-paired`), r = row(c);
        assert.equal(r.launches.length, 2); assert.equal(r.after[0].temp.apply.force, 156);
        assert.equal(r.metrics[0].neili_cost, 16000); assert.equal(r.metrics[0].neili_recovery, 16000);
        assert.equal(r.after[0].temp.power, 1); assert.equal(r.after[0].temp.tianmo, 1);
        const e = buffSequenceEffects([{ outcome: 'observed', raw: r }]);
        assert.equal(e.command_steps, 4); assert.equal(e.accepted_steps, 2); assert.equal(e.refused_steps, 2);
    }
});

test('枪斧与剑锤选择单独对照，不从分类名称推定power支持', () => {
    for (const usage of ['spear', 'axe', 'sword', 'hammer']) {
        const c = find(`power-l200-${usage}-highest`), r = row(c);
        const key = ['spear', 'axe'].includes(usage) ? 'force' : usage;
        assert.equal(r.after[0].temp.apply[key], 40); validateWudangBuffRecord(r, c);
        r.before[0].effective_skills[usage] = 0;
        assert.throws(() => validateWudangBuffRecord(r, c));
    }
});

test('存储探针保留真实持久值，不把新对象当在线重连', () => {
    const c = find('power-l400-persistence'), raw = row(c);
    assert.equal(buffSequenceEffects([{ outcome: 'observed', raw }]).restored_without_buff, 1);
    for (const mutate of [
        r => r.persistence.after.temp.power = 1, r => r.persistence.after.neili = 6000,
        r => r.persistence.after.interactive = 1, r => r.persistence.after.object = r.immediate[0].object,
        r => delete r.persistence.after.temp,
    ]) { const r = row(c); mutate(r); assert.throws(() => validateWudangBuffRecord(r, c)); }
    const actor = readFileSync(join(root, 'tools/tests/martial_data/actor.lpc'), 'utf8');
    assert.match(actor, /save_object\("\/data\/buff_snapshot"\)/);
    assert.match(actor, /restore_object\("\/data\/buff_snapshot"\)/);
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.doesNotMatch(runner, /delete_temp\("(?:power|tianmo)"\)/);
});

test('状态与资源不连续、错误成功和未取得的拒绝理由均不能通过', () => {
    const c = find('tianmo-l400-repeat');
    for (const mutate of [
        r => r.buff_steps[1].before.neili = 8000, r => r.buff_steps[1].reason = '',
        r => r.buff_steps[1].accepted = 1, r => r.buff_steps[3].refusals_after = 0,
        r => r.before[0].shen = 1, r => r.after[1].qi--,
        r => r.launches[0].skill = c.parameters.skill,
    ]) { const r = row(c); mutate(r); assert.throws(() => validateWudangBuffRecord(r, c)); }
});

test('统计缺失探针状态为未知，不将没有观察到的数据当清理成功', () => {
    const raw = row(find('power-l400-persistence'));
    delete raw.persistence.after.temp;
    const result = buffSequenceEffects([{ outcome: 'observed', raw }, { outcome: 'error', raw: {} }]);
    assert.equal(result.persistence_probes, 1); assert.equal(result.restored_without_buff, 0);
    assert.equal(result.attempts, 1);
});
