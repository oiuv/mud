// Special targets and sequential original commands, isolated from prior samples.
import assert from 'node:assert/strict';
import { wudangCoreConditions } from './school_wudang_core_cases.mjs';

export function wudangSpecialConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const base = wudangCoreConditions(catalog), result = [];
    function add(ability, level, suffix, configure, count = 2) {
        const original = base.find(c => c.id === `school-wudang-core-${ability}-l${level}${level === 50 ? '-expiry' : ''}`);
        assert.ok(original, '缺少已核对太极基本配置');
        const c = structuredClone(original), p = c.parameters;
        c.id = `school-wudang-special-${ability}-l${level}-${suffix}`;
        c.samples = smoke ? 1 : count;
        p.collection_group = 'wudang-special'; p.combination = suffix;
        p.observation = 'single_action_immediate'; p.observe_seconds = 0;
        p.fighting = ability === 'tu';
        p.qualification_note = '原命令与非巫师真实USER；显式实验资格。昏迷经原unconcious准备，当前值与有效值分别保存；重复增益不手工清标记或忙乱，组合解除保持50秒原回调。多敌太极图另有第三个连接玩家，逐目标记录状态、消耗和判定；不是完整门派配装或同养成成本。';
        configure(p); result.push(c);
    }
    for (const level of [200, 400, 800]) {
        for (const state of ['unconscious', 'unconscious-healthy', 'unconscious-not-living', 'awake-zero', 'awake-negative']) {
            add('dian', level, state, p => {
                p.target_state = state.startsWith('unconscious') ? 'unconscious' : 'awake';
                Object.assign(p.target.properties, { qi: state === 'awake-negative' ? -1 : 0,
                    jing: state === 'awake-negative' ? -1 : 0 });
                if (state === 'unconscious-healthy') Object.assign(p.target.properties, { eff_qi: 10000, eff_jing: 10000 });
                if (state === 'unconscious-not-living') p.target.properties.not_living = 1;
                if (state === 'unconscious-healthy' || state === 'unconscious-not-living') p.expected = 'refused';
            });
        }
        for (const ability of ['powerup', 'shield']) add(ability, level, 'repeat', p => {
            p.repeat_actions = [`exert ${ability}`, `exert ${ability}`];
        });
    }
    for (const ability of ['powerup', 'shield']) add(ability, 50, 'paired-expiry', p => {
        const other = ability === 'powerup' ? 'shield' : 'powerup';
        p.repeat_actions = [ability, ability, other, other].map(a => 'exert ' + a);
        p.actor.temp = { 'apply/attack': 17, 'apply/defense': 23, 'apply/armor': 131 };
        p.observe_seconds = 52; p.observation = 'timed_effect';
    });
    for (const level of [400, 800]) for (const variant of ['neutral', 'resistant', 'mixed']) {
        add('tu', level, 'two-' + variant, p => {
            p.target.skills.force = variant === 'neutral' ? level * 3 : 10000;
            p.extra_target = structuredClone(p.target);
            p.extra_target.skills.force = variant === 'resistant' ? 10000 : 2;
        }, variant === 'neutral' ? samples : 2);
    }
    add('tu', 400, 'two-low-neili', p => {
        p.target.skills.force = 1200; p.target.properties.neili = 100;
        p.extra_target = structuredClone(p.target);
        p.extra_target.skills.force = 2; p.extra_target.properties.neili = 0;
    }, samples);
    return result;
}

const apply = (state, key) => state.temp.apply?.[key] ?? 0;
export function validateWudangSpecialRecord(raw, condition) {
    const p = condition.parameters, b = raw.before[0], a = raw.immediate[0], bt = raw.before[1], t = raw.immediate[1];
    assert.equal(raw.outcome, p.expected);
    if (p.ability === 'dian') {
        if (p.target_state === 'unconscious') {
            assert.equal(raw.preparation.before.living, 1); assert.equal(raw.preparation.after.living, 0);
            assert.equal(bt.living, 0); assert.equal(bt.ghost, 0);
        } else { assert.equal(bt.living, 1); assert.equal(raw.preparation, undefined); }
        if (p.expected === 'refused') {
            assert.equal(raw.launches.length, 0); assert.ok(raw.reason);
            for (const [before, after] of [[b, a], [bt, t]])
                for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili', 'living', 'busy']) assert.equal(after[k], before[k]);
            return;
        }
        assert.equal(raw.launches.length, 1); assert.equal(raw.metrics[0].neili_cost, 800);
        assert.equal(raw.metrics[0].qi_cost, 100); assert.equal(raw.metrics[0].jing_cost, 50);
        assert.equal(a.busy, 10); assert.equal(t.busy ?? 0, 0); // Existing MA-007, never fix in the fixture.
        assert.equal(t.living, 1); assert.equal(t.ghost, 0); assert.equal(t.qi, 1); assert.equal(t.jing, 1);
        assert.equal(t.eff_qi, Math.min(bt.max_qi, bt.eff_qi + 100 + b.effective_skills.force + b.skills['taiji-shengong'] * 3));
        assert.equal(t.eff_jing, Math.min(bt.max_jing, bt.eff_jing + 100 + Math.trunc(b.effective_skills.force / 3) + b.skills['taiji-shengong']));
        return;
    }
    if (p.repeat_actions) {
        assert.equal(raw.repeat_steps.length, p.repeat_actions.length);
        const seen = new Set();
        for (const [i, step] of raw.repeat_steps.entries()) {
            const ability = p.repeat_actions[i].split(' ')[1], repeat = seen.has(ability);
            assert.equal(step.action, p.repeat_actions[i]); assert.equal(step.accepted, repeat ? 0 : 1);
            assert.equal(step.launches_after - step.launches_before, repeat ? 0 : 1);
            assert.equal(step.before.neili - step.after.neili, repeat ? 0 : 100);
            if (repeat) {
                assert.ok(step.reason.length > 0);
                assert.ok(step.refusals_after > step.refusals_before, '必须是本步骤原拒绝提示');
            }
            const bonus = repeat ? 0 : Math.trunc(b.skills['taiji-shengong'] / (ability === 'powerup' ? 3 : 2));
            for (const key of ['attack', 'defense', 'armor'])
                assert.equal(apply(step.after, key) - apply(step.before, key),
                    (ability === 'powerup' ? key !== 'armor' : key === 'armor') ? bonus : 0);
            assert.equal(step.after.temp[ability], 1); assert.ok(!step.after.busy);
            if (i) assert.equal(step.before.neili, raw.repeat_steps[i - 1].after.neili);
            seen.add(ability);
        }
        assert.equal(raw.launches.length, seen.size); assert.equal(raw.metrics[0].neili_cost, 100 * seen.size);
        if (p.observation === 'timed_effect') {
            const cb = raw.callbacks.filter(c => c.side === 0);
            assert.equal(cb.length, 4); assert.ok(raw.elapsed >= 51);
            for (const c of cb) assert.ok(c.elapsed >= 49 && c.elapsed <= raw.elapsed);
            assert.deepEqual(cb.map(c => c.phase), ['before', 'after', 'before', 'after']);
            for (const key of ['attack', 'defense', 'armor']) assert.equal(apply(raw.after[0], key), apply(b, key));
            assert.ok(!raw.after[0].temp.powerup && !raw.after[0].temp.shield);
        }
        return;
    }
    assert.equal(p.ability, 'tu'); assert.equal(raw.launches.length, 1);
    assert.equal(raw.metrics[0].neili_cost, 1000); assert.equal(b.jingli - a.jingli, 1000);
    assert.equal(a.busy, 4); assert.equal(raw.metrics[0].direct ?? 0, 0);
    const et = raw.extra_target_before, ea = raw.extra_target_after, em = raw.extra_target_metrics;
    assert.ok(et.userp && et.interactive && et.playerp && !et.wizardp);
    assert.equal(et.object, ea.object); assert.notEqual(et.object, bt.object);
    for (const [key, value] of Object.entries(p.extra_target.skills)) assert.equal(et.skills[key], value);
    for (const [key, value] of Object.entries(p.extra_target.properties)) assert.equal(et[key], value);
    assert.deepEqual(et.mappings, p.extra_target.mappings);
    for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(ea[k], et[k] - (em[k + '_cost'] ?? 0) + (em[k + '_recovery'] ?? 0));
    for (const [before, after, metrics] of [[bt, t, raw.metrics[1]], [et, ea, em]]) {
        const damage = metrics.qi_cost ?? 0;
        assert.equal(after.busy ?? 0, damage ? 3 : 0);
        assert.equal(after.neili, Math.max(0, before.neili - (damage ? 500 : 200)));
        assert.equal(metrics.eff_qi_cost ?? 0, Math.trunc(damage / 2));
        assert.equal(metrics.jing_cost ?? 0, Math.trunc(damage / 3));
        assert.equal(metrics.eff_jing_cost ?? 0, Math.trunc(damage / 6));
        if (before.skills.force === 10000) assert.equal(damage, 0);
        if (before.skills.force === 2) assert.ok(damage > 0);
    }
}
