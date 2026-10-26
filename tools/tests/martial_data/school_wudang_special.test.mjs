import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { validateWudangSpecialRecord } from './school_wudang_special_cases.mjs';
import { collectionInput } from './execution.mjs';
import { wudangSpecialEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-special');
const by = tail => cases.find(c => c.id === 'school-wudang-special-' + tail);

test('太极特殊状态30条件354样本，旧1764条件62346样本不改', () => {
    assert.equal(cases.length, 30); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 354);
    const old = all.filter(c => !['wudang-special', 'wudang-weapons', 'wudang-shenmen', 'wudang-unarmed', 'wudang-learning', 'wudang-cultivation', 'wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 1764); assert.equal(old.reduce((n, c) => n + c.samples, 0), 62346);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    assert.equal(schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'wudang-special')
        .reduce((n, c) => n + c.samples, 0), 30);
});

test('仅含额外目标的批次增加第三个回环连接，旧输入保持双玩家', () => {
    const single = collectionInput([by('dian-l200-unconscious')], null);
    assert.equal(single.connections, 2); assert.equal(JSON.parse(single.text).connections, undefined);
    const multiple = collectionInput([by('tu-l400-two-mixed')], null);
    assert.equal(multiple.connections, 3); assert.equal(JSON.parse(multiple.text).connections, 3);
    assert.ok(multiple.limits['maximum read file size'] > multiple.bytes);
});

test('配对重复增益保持52秒观察和50秒原技能，不缩短烟雾时钟', () => {
    for (const c of cases.filter(c => c.parameters.observe_seconds)) {
        assert.equal(c.samples, 2); assert.equal(c.parameters.observe_seconds, 52);
        assert.equal(c.parameters.actor.skills['taiji-shengong'], 50);
        assert.equal(c.parameters.repeat_actions.length, 4); assert.equal(c.parameters.fighting, false);
        const smoke = schoolCombatConditions(catalog, { smoke: true }).find(s => s.id === c.id);
        assert.equal(smoke.parameters.observe_seconds, 52); assert.equal(smoke.samples, 1);
    }
});

function healing(c) {
    const p = c.parameters;
    const b = { qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000, neili: 6000, busy: null, living: 1,
        skills: p.actor.skills, effective_skills: { force: p.level * 1.5 } };
    const bt = { ...p.target.properties, busy: null, max_qi: 10000, max_jing: 10000, living: p.target_state === 'unconscious' ? 0 : 1, ghost: 0, neili: 6000 };
    const a = { ...b }, t = { ...bt };
    const raw = { outcome: p.expected, before: [b, bt], immediate: [a, t], after: [a, t], metrics: [{}, {}], launches: [], callbacks: [], reason: '原规则拒绝' };
    if (p.target_state === 'unconscious') raw.preparation = { before: { ...bt, living: 1 }, after: { ...bt } };
    if (p.expected === 'observed') {
        raw.launches = [{}]; raw.metrics[0] = { neili_cost: 800, qi_cost: 100, jing_cost: 50 };
        Object.assign(a, { qi: b.qi - 100, jing: b.jing - 50, neili: b.neili - 800, busy: 10 });
        Object.assign(t, { living: 1, qi: 1, jing: 1, eff_qi: Math.min(bt.max_qi, bt.eff_qi + 100 + b.effective_skills.force + p.level * 3),
            eff_jing: Math.min(bt.max_jing, bt.eff_jing + 100 + Math.trunc(b.effective_skills.force / 3) + p.level) });
    }
    return raw;
}

test('昏迷、非生物和有效值未伤分别验收，唤醒不等于补满当前气血', () => {
    for (const c of cases.filter(c => c.parameters.ability === 'dian')) validateWudangSpecialRecord(healing(c), c);
    const c = by('dian-l200-unconscious'), raw = healing(c);
    raw.immediate[1].living = 0; assert.throws(() => validateWudangSpecialRecord(raw, c));
    raw.immediate[1].living = 1; raw.immediate[1].qi = raw.immediate[1].eff_qi;
    assert.throws(() => validateWudangSpecialRecord(raw, c));
});

test('保留已知stary_busy缺陷，不在验证器把目标忙乱误认已生效', () => {
    const c = by('dian-l400-unconscious'), raw = healing(c);
    raw.immediate[1].busy = 2; assert.throws(() => validateWudangSpecialRecord(raw, c));
});

test('多目标条件含独立抗性及零内力下限，不把两目标克隆为同一配置', () => {
    const c = by('tu-l400-two-mixed'), p = c.parameters;
    assert.equal(p.target.skills.force, 10000); assert.equal(p.extra_target.skills.force, 2);
    p.extra_target.properties.probe = 1; assert.equal(p.target.properties.probe, undefined);
    delete p.extra_target.properties.probe;
    const low = by('tu-l400-two-low-neili').parameters;
    assert.equal(low.target.properties.neili, 100); assert.equal(low.extra_target.properties.neili, 0);
});

test('报告区分唤醒、当前与有效恢复，不将拒绝样本算疗伤成功', () => {
    const success = healing(by('dian-l200-unconscious')), refusal = healing(by('dian-l200-unconscious-healthy'));
    const report = wudangSpecialEffects([{ raw: success }, { raw: refusal }]);
    assert.equal(report.initially_unconscious, 2); assert.equal(report.awakened, 1);
    assert.equal(report.target_health_delta.qi.mean, 0.5);
    assert.equal(report.target_health_delta.eff_qi.mean, 500);
    assert.equal(report.targets[1].samples, 0); assert.equal(report.targets[1].metrics.qi_cost.mean, null);
});

function repeated(c) {
    const p = c.parameters, b = { skills: p.actor.skills, neili: 6000, busy: 0,
        temp: { apply: { attack: 17, defense: 23, armor: 131 } } };
    const raw = { outcome: 'observed', before: [b, {}], immediate: [], after: [], metrics: [{}, {}],
        repeat_steps: [], launches: [], callbacks: [], elapsed: p.observe_seconds };
    let state = structuredClone(b), refusals = 0;
    for (const action of p.repeat_actions) {
        const ability = action.split(' ')[1], repeat = !!state.temp[ability];
        const step = { action, before: structuredClone(state), launches_before: raw.launches.length, refusals_before: refusals };
        if (!repeat) {
            state.neili -= 100; state.temp[ability] = 1; raw.launches.push({ skill: 'taiji-shengong' });
            for (const key of ability === 'powerup' ? ['attack', 'defense'] : ['armor'])
                state.temp.apply[key] += Math.trunc(p.level / (ability === 'powerup' ? 3 : 2));
        } else refusals++;
        Object.assign(step, { accepted: repeat ? 0 : 1, after: structuredClone(state),
            launches_after: raw.launches.length, refusals_after: refusals, reason: repeat ? '原运功保护' : '' });
        raw.repeat_steps.push(step);
    }
    raw.immediate = [structuredClone(state), {}]; raw.metrics[0].neili_cost = b.neili - state.neili;
    if (p.observe_seconds) {
        for (const ability of [...new Set(p.repeat_actions.map(a => a.split(' ')[1]))]) {
            raw.callbacks.push({ side: 0, phase: 'before', elapsed: 50, state: structuredClone(state) });
            for (const key of ability === 'powerup' ? ['attack', 'defense'] : ['armor'])
                state.temp.apply[key] -= Math.trunc(p.level / (ability === 'powerup' ? 3 : 2));
            delete state.temp[ability];
            raw.callbacks.push({ side: 0, phase: 'after', elapsed: 50, state: structuredClone(state) });
        }
    }
    raw.after = [state, {}]; return raw;
}

test('重复运功按每步原拒绝提示验收，不复用早先提示或重复扣费', () => {
    for (const c of cases.filter(c => c.parameters.repeat_actions)) validateWudangSpecialRecord(repeated(c), c);
    const c = by('powerup-l400-repeat'), raw = repeated(c);
    raw.repeat_steps[1].refusals_after = raw.repeat_steps[1].refusals_before;
    assert.throws(() => validateWudangSpecialRecord(raw, c));
    raw.repeat_steps[1].refusals_after++; raw.repeat_steps[1].after.neili--;
    assert.throws(() => validateWudangSpecialRecord(raw, c));
});

test('组合增益自然解除不能缺少回调、提前伪造或清除原有属性', () => {
    const c = by('shield-l50-paired-expiry'), raw = repeated(c);
    raw.after[0].temp.apply.attack = 0; assert.throws(() => validateWudangSpecialRecord(raw, c));
    raw.after[0].temp.apply.attack = 17; raw.callbacks.pop();
    assert.throws(() => validateWudangSpecialRecord(raw, c));
    const early = repeated(c); early.callbacks[0].elapsed = 1;
    assert.throws(() => validateWudangSpecialRecord(early, c));
});

function multiple(c) {
    const p = c.parameters, b = { jingli: 6000 }, a = { jingli: 5000, busy: 4 };
    const make = (config, object) => {
        const before = { qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000, neili: 6000,
            ...config.properties, skills: config.skills, mappings: config.mappings,
            object, userp: 1, interactive: 1, playerp: 1, wizardp: 0 };
        const damage = config.skills.force === 10000 ? 0 : 600;
        const metrics = { qi_cost: damage, eff_qi_cost: damage / 2, jing_cost: damage / 3,
            eff_jing_cost: damage / 6, neili_cost: Math.min(before.neili, damage ? 500 : 200) };
        const after = { ...before, busy: damage ? 3 : 0 };
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) after[key] -= metrics[key + '_cost'];
        return { before, after, metrics };
    };
    const right = make(p.target, 'right'), third = make(p.extra_target, 'third');
    return { outcome: 'observed', before: [b, right.before], immediate: [a, right.after], after: [a, right.after],
        metrics: [{ neili_cost: 1000 }, right.metrics], launches: [{}], callbacks: [],
        extra_target_before: third.before, extra_target_immediate: third.after, extra_target_after: third.after,
        extra_target_metrics: third.metrics };
}

test('双目标各自结算且只扣一次施法费用，禁止冒用同一目标或伪造资源', () => {
    for (const c of cases.filter(c => c.parameters.extra_target)) validateWudangSpecialRecord(multiple(c), c);
    const c = by('tu-l400-two-mixed'), raw = multiple(c);
    raw.extra_target_after.qi++; assert.throws(() => validateWudangSpecialRecord(raw, c));
    raw.extra_target_after.qi--; raw.extra_target_before.object = 'right';
    assert.throws(() => validateWudangSpecialRecord(raw, c));
    const charged = multiple(c); charged.metrics[0].neili_cost = 2000;
    assert.throws(() => validateWudangSpecialRecord(charged, c));
});

test('多目标报告保留成功与未受伤削内目标，分母是各自样本数', () => {
    const c = by('tu-l400-two-mixed'), raw = multiple(c), report = wudangSpecialEffects([{ raw }]);
    assert.equal(report.targets[0].damaged, 0); assert.equal(report.targets[0].metrics.neili_cost.mean, 200);
    assert.equal(report.targets[1].damaged, 1); assert.equal(report.targets[1].metrics.neili_cost.mean, 500);
    assert.equal(report.targets[1].samples, 1);
});

test('负值归零属于原修正而非自然恢复，报告净内力损失不能超过原余额', () => {
    const c = by('tu-l400-two-low-neili'), raw = multiple(c);
    raw.metrics[1].neili_cost = 500; raw.metrics[1].neili_recovery = 400;
    raw.extra_target_metrics.neili_cost = 500; raw.extra_target_metrics.neili_recovery = 500;
    validateWudangSpecialRecord(raw, c);
    const report = wudangSpecialEffects([{ raw }]);
    assert.equal(report.targets[0].metrics.neili_cost.mean, 500);
    assert.equal(report.targets[0].neili_net_loss.mean, 100);
    assert.equal(report.targets[1].metrics.neili_recovery.mean, 500);
    assert.equal(report.targets[1].neili_net_loss.mean, 0);
});
