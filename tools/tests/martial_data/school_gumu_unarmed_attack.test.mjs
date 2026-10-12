import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { digest } from './ledger.mjs';
import { gumuUnarmedAttacks, gumuUnarmedAttackConditions, gumuUnarmedAttackFixtureRequirements,
    validateGumuUnarmedAttackRecord, validateGumuUnarmedAttackLoads, gumuUnarmedAttackEffects } from './school_gumu_unarmed_attack_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuUnarmedAttackConditions(catalog), copy = structuredClone;
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
function pick(skill, suffix) {
    const c = cases.find(c => c.id === `school-gumu-unarmed-attack-${skill}-${suffix}`); assert.ok(c, suffix); return c;
}
function snapshot(cfg) {
    const s = { userp: 1, interactive: 1, wizardp: 0, living: 1, busy: 0,
        ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/'))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')),
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations),
        weapon: cfg.equipment?.type ?? 'none', temp: { apply: {} }, conditions: {}, effective_con: cfg.properties.con,
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, n]) =>
            [k, Math.trunc(n / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)])) };
    for (const [k, v] of Object.entries(cfg.temp ?? {})) {
        if (k.startsWith('apply/')) s.temp.apply[k.slice(6)] = v; else s.temp[k] = v;
    }
    s.effective_str = s.str + (s.cultivation['tattoo/tattoo_str'] ?? 0) + (s.cultivation['reborn/str'] ?? 0)
        + Math.trunc(Math.max(0, ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0)) / 10)
        + (s.temp.apply.str ?? 0);
    return s;
}
function settle(r) {
    if (r.passives.length) r.immediate = copy(r.passives.at(-1).after);
    r.after = copy(r.immediate);
    r.metrics = [0, 1].map(side => Object.fromEntries(health.map(k => [k + '_cost', r.before[side][k] - r.immediate[side][k]])));
    if (r.interfaces.length) r.interfaces[0].result = r.passives[0].result;
    return r;
}
function event(states, skill, incoming, route, factor = 0, trigger = false) {
    const before = copy(states), after = copy(states), [b, t] = before;
    let result = 0, wound = 0;
    if (skill === 'wudu-shenzhang') {
        const gate = t.living && b.neili >= 200 && b.skills[skill] >= 120;
        if (trigger) { result = '原五毒附伤'; wound = incoming; after[0].neili -= 30; }
        else result = gate ? 1 : 0;
    } else if (skill === 'sad-strike' && incoming >= 150 && Math.trunc(incoming / 5) > t.effective_str) {
        result = '原黯然附伤'; wound = Math.trunc((incoming - 100) / 2);
    } else if (skill === 'surge-force') { after[0].neili -= factor; result = 30; }
    after[1].eff_qi -= wound; after[1].qi = Math.min(after[1].qi, after[1].eff_qi);
    return { actor: 0, target: 1, skill, incoming, route, factor, result, before, after };
}
// Synthetic contract inputs only: no RNG sampling or real-driver evidence.
function trace(c, trigger = false) {
    const p = c.parameters, before = [p.actor, p.target].map(snapshot);
    const r = { parameters: copy(p), method: c.method, outcome: 'observed', before, immediate: copy(before), after: copy(before),
        metrics: [{}, {}], passives: [], interfaces: [], actions: [], attacks: [], launches: [], dropped: [],
        skill_loads: p.capture_skill_loads.map(s => ({ ...s, load_id: 'load-' + s.skill, run_id: 'synthetic-run',
            state: { userp: 1, wizardp: 0, skills: { force: 220, unarmed: 200, strike: 200, parry: 200, dodge: 200 },
                effective_skills: { force: 330, unarmed: 300, strike: 300, parry: 300, dodge: 300 } } })) };
    if (c.method === 'ordinary') {
        r.actions.push({ actor: 0, target: 1, skill: p.skill, action: { action: '原动作', lvl: 0 } });
        r.attacks.push({ actor: 0, target: 1, type: 0, result: -1 });
    } else {
        r.passives.push(event(before, p.skill, p.interface.damage, 'interface', 0, trigger));
        r.interfaces.push({ object: p.interface.object, function: 'hit_ob', result: r.passives[0].result });
    }
    return settle(r);
}

test('六门徒手98条件6272计划记录，所有来源及烟雾闭合', () => {
    assert.equal(gumuUnarmedAttacks.length, 6); assert.equal(gumuUnarmedAttackFixtureRequirements.length, 5);
    assert.equal(cases.length, 98); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 6272);
    assert.equal(cases.filter(c => c.method === 'ordinary').length, 48);
    assert.equal(new Set(cases.map(c => c.id)).size, 98);
    for (const c of cases) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        assert.ok(catalog.skills.some(s => s.path === c.entry_id)); validateGumuUnarmedAttackRecord(trace(c), c);
    }
    const smoke = gumuUnarmedAttackConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 196);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    for (const samples of [0, -1, NaN, 1.5]) assert.throws(() => gumuUnarmedAttackConditions(catalog, { samples }));
    assert.throws(() => gumuUnarmedAttackConditions({ skills: [] }));
});

test('统一入口只追加98徒手普攻条件，旧12225条件完整指纹不变', () => {
    const all = schoolCombatConditions(catalog), old = all.slice(0, 12225);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-unarmed-attack'), cases);
    assert.equal(old.length, 12225); assert.equal(old.reduce((n, c) => n + c.samples, 0), 320496);
    assert.equal(digest(old), '264d965a9d9a6e3fa23be3d8a26b6cd6d31cf003f0d5e6dbe6236aad9273dbf0');
    for (const c of cases) validateSchoolCombatRecord(trace(c), c);
});

test('原无异常的明确null与空mapping都可观察，缺测不能当无异常', () => {
    const c = pick('wudu-shenzhang', 'hit-gender-male'), r = trace(c, true);
    for (const states of [r.before, r.immediate, r.after, r.passives[0].before, r.passives[0].after])
        for (const state of states) state.conditions = null;
    validateGumuUnarmedAttackRecord(r, c);
    delete r.passives[0].before[1].conditions;
    assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
});

test('临时免毒必须真实设置，不能用无异常结果冒充已有免毒初态', () => {
    const c = pick('wudu-shenzhang', 'hit-nopoison'), r = trace(c, true);
    validateGumuUnarmedAttackRecord(r, c);
    delete r.before[1].temp.nopoison;
    assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
});

test('五毒附伤低等级低内力返回0，正常随机未触发返回数值1，不是条件失败', () => {
    for (const suffix of ['hit-level119', 'hit-neili199', 'hit-gender-female']) {
        const c = pick('wudu-shenzhang', suffix); validateGumuUnarmedAttackRecord(trace(c), c);
        assert.throws(() => validateGumuUnarmedAttackRecord(trace(c, true), c));
    }
    for (const suffix of ['hit-level120', 'hit-neili200', 'hit-gender-male', 'hit-gender-none',
        'hit-damage0', 'hit-damage1', 'hit-damage201', 'hit-no-map', 'hit-no-prepare']) {
        const c = pick('wudu-shenzhang', suffix);
        validateGumuUnarmedAttackRecord(trace(c), c); validateGumuUnarmedAttackRecord(trace(c, true), c);
        const r = trace(c); r.passives[0].result = 0; settle(r);
        assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
    }
});

test('五毒普通附伤没有持续毒；辟易与nopoison不免除其创伤，零伤输入仍可扣30', () => {
    for (const suffix of ['hit-piyi', 'hit-nopoison', 'hit-damage0']) {
        const c = pick('wudu-shenzhang', suffix), r = trace(c, true);
        validateGumuUnarmedAttackRecord(r, c); assert.equal(r.metrics[0].neili_cost, 30);
        assert.deepEqual(r.immediate[1].conditions, {});
        r.immediate[1].conditions.wudu_shenzhang = { level: 1, remain: 1 };
        assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
    }
});

test('黯然附伤150门槛与伤害整除5严格比较，无等级／映射／准备／费用的附加检查', () => {
    for (const [suffix, wound] of [['damage149', 0], ['damage150', 0], ['damage154', 0], ['damage155', 27],
        ['str39', 50], ['str40', 0], ['str41', 0], ['target-unarmed90', 50], ['target-unarmed100', 0], ['target-unarmed110', 0]]) {
        const c = pick('sad-strike', 'hit-' + suffix), r = trace(c); validateGumuUnarmedAttackRecord(r, c);
        assert.equal(r.metrics[1].eff_qi_cost, wound, suffix); assert.equal(r.metrics[0].neili_cost, 0);
    }
    for (const suffix of ['level1', 'zero-skill', 'neili0', 'no-map', 'no-prepare']) {
        const c = pick('sad-strike', 'hit-' + suffix), r = trace(c); validateGumuUnarmedAttackRecord(r, c);
        assert.equal(r.metrics[1].eff_qi_cost, 50); r.passives[0].after[0].neili--; settle(r);
        assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
    }
});

test('膂力采用原query_str包含基本徒手加成，不能用先天值冒充有效值', () => {
    const c = pick('sad-strike', 'hit-target-unarmed100'), r = trace(c); validateGumuUnarmedAttackRecord(r, c);
    assert.equal(r.before[1].str, 30); assert.equal(r.before[1].effective_str, 40);
    r.before[1].effective_str = 30; assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
});

test('黯然70级倒序按原候选前缀接受，但不能任意放宽所有动作门槛', () => {
    for (const level of [70, 71, 160, 161]) {
        const c = pick('sad-strike', 'ordinary-boundary' + level), r = trace(c); r.actions[0].action.lvl = 160;
        if (level === 70) assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
        else validateGumuUnarmedAttackRecord(r, c);
        r.actions[0].action.lvl = 200; assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
    }
});

test('五毒与黯然极意保留首次加载等级及不同公式，不重载或重抽原随机', () => {
    for (const d of gumuUnarmedAttacks.filter(d => d.dynamic)) {
        const c = pick(d.skill, 'ordinary-l800-j0'), r = trace(c), s = r.skill_loads[0].state.skills;
        r.actions[0].action = { action: '原极意', lvl: d.dynamic, force: Math.trunc(s.force / (d.skill === 'sad-strike' ? 3 : 2)),
            attack: Math.trunc(s[d.usage] / 4), dodge: Math.trunc(s.dodge / 6), damage: Math.trunc(s.force / 4),
            ...(d.skill === 'sad-strike' ? {} : { parry: Math.trunc(s.parry / 6) }) };
        validateGumuUnarmedAttackRecord(r, c); validateGumuUnarmedAttackLoads([r, copy(r)]);
        const changed = copy(r); changed.actions[0].action.force++;
        assert.throws(() => validateGumuUnarmedAttackLoads([r, changed]));
        const reloaded = copy(r); reloaded.skill_loads[0].load_id += '-again';
        assert.throws(() => validateGumuUnarmedAttackLoads([r, reloaded]));
        r.actions[0].action.force = 2000; assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
    }
});

test('原force与martial顺序分别记账，空手心经即使有口诀也不触发持器联动', () => {
    for (const [skill, force] of [['wudu-shenzhang', 'yunv-xinjing'], ['sad-strike', 'surge-force']]) {
        const c = pick(skill, 'ordinary-l400-j50'), r = trace(c); r.attacks[0].result = 0;
        const f = event(r.before, force, 100, 'force', 50); r.passives.push(f);
        r.passives.push(event(f.after, skill, 200, 'martial')); settle(r);
        validateGumuUnarmedAttackRecord(r, c); assert.equal(r.metrics[0].neili_cost, force === 'surge-force' ? 50 : 0);
        r.passives.reverse(); assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
    }
    const c = pick('meinv-quan', 'ordinary-wall'), r = trace(c); r.attacks[0].result = 0;
    const f = event(r.before, 'yunv-xinjing', 200, 'force', 50); r.passives.push(f); settle(r);
    validateGumuUnarmedAttackRecord(r, c); f.result = '伪造联动'; f.after[0].neili -= 50; settle(r);
    assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
});

test('缺计量／心跳污染／错身份／额外施招与缺原动作均不能假称有效样本', () => {
    const c = pick('wudu-shenzhang', 'ordinary-l400-j50');
    for (const mutate of [r => { r.before[0].wizardp = 1; }, r => { r.metrics[0] = null; },
        r => { r.metrics[1].heartbeats = 1; }, r => { r.metrics[1].heartbeats = null; },
        r => { r.metrics[0].neili_cost = null; }, r => { r.launches.push({}); },
        r => { r.actions = []; }, r => { r.before[0].preparations = {}; },
        r => { r.after[1].conditions.fake = 1; }, r => { r.skill_loads[0].sha256 = 'fake'; }]) {
        const r = trace(c); mutate(r); assert.throws(() => validateGumuUnarmedAttackRecord(r, c));
    }
});

test('普通攻击与接口分母独立，缺附伤轨迹保留未知而非零触发', () => {
    const a = pick('sad-strike', 'hit-damage201'), b = pick('meinv-quan', 'ordinary-l200-j0');
    const e = gumuUnarmedAttackEffects([{ outcome: 'observed', raw: trace(a) }, { outcome: 'observed', raw: trace(b) },
        { outcome: 'observed', raw: { method: 'ordinary' } }, { outcome: 'error' }]);
    assert.equal(e.samples, 3); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(e.methods.ordinary.samples, 2); assert.equal(e.methods.ordinary.unknown_passive_samples, 1);
    assert.equal(e.methods.interface.groups['interface:sad-strike'].triggered.rate, 1);
    assert.equal(e.methods.interface.groups['interface:sad-strike'].neili_cost.mean, 0);
});
