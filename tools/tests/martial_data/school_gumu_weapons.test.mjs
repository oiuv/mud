import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { combatActionProbes, combatExtraDodgeProbes } from './execution.mjs';
import { gumuWeapons, gumuWeaponConditions, gumuWeaponFixtureRequirements,
    validateGumuWeaponRecord, validateGumuWeaponLoads, gumuWeaponEffects } from './school_gumu_weapons_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = gumuWeaponConditions(catalog), copy = structuredClone;
const pick = (skill, suffix) => {
    const c = cases.find(x => x.id === `school-gumu-weapons-${skill}-${suffix}`); assert.ok(c); return c;
};
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
function snapshot(cfg) {
    return { userp: 1, interactive: 1, wizardp: 0, living: 1, busy: 0,
        ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/'))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')),
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations),
        weapon: cfg.equipment?.type ?? 'none', temp: { apply: {} }, effective_con: cfg.properties.con,
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)])) };
}
// Synthetic traces test the collector contract only; none are driver samples.
function trace(c) {
    const p = c.parameters, before = [p.actor, p.target].map(snapshot);
    const raw = { method: c.method, outcome: 'observed', before, immediate: copy(before), after: copy(before),
        metrics: [{}, {}], passives: [], interfaces: [], actions: [], attacks: [], launches: [], dropped: [],
        skill_loads: p.capture_skill_loads.map(s => ({ ...s, load_id: 'load-' + s.skill, run_id: 'synthetic-run',
            state: { userp: 1, wizardp: 0, skills: { force: 200, sword: 200, whip: 200, parry: 200, dodge: 200 },
                effective_skills: { force: 300, sword: 300, whip: 300, parry: 300, dodge: 300 } } })) };
    if (c.method === 'ordinary') {
        raw.attacks = [{ actor: 0, target: 1, type: 0, result: -1, damage: 0 }];
        raw.actions = [{ actor: 0, target: 1, skill: p.skill, action: { action: '原招式', lvl: 0 } }];
    } else {
        const skill = p.interface.object.split('/').at(-1), b = before[0], bt = before[1];
        let result = 0;
        if (skill === 'xuantie-jian') result = Math.trunc(p.interface.damage / 4);
        if (skill === 'sanwu-shou' && b.skills[skill] >= 120 && b.neili >= 200 && bt.living) result = 1;
        raw.passives = [{ actor: 0, target: 1, route: 'interface', skill,
            incoming: p.interface.damage, factor: p.interface.factor, result, before: copy(before), after: copy(before) }];
        raw.interfaces = [{ object: p.interface.object, function: 'hit_ob', result }];
    }
    return raw;
}
function settle(raw) {
    if (raw.passives.length) raw.immediate = copy(raw.passives.at(-1).after);
    raw.after = copy(raw.immediate);
    raw.metrics = [0, 1].map(side => Object.fromEntries(health.map(k =>
        [k + '_cost', raw.before[side][k] - raw.immediate[side][k]])));
    if (raw.interfaces.length) raw.interfaces[0].result = raw.passives[0].result;
    return raw;
}
function applyHit(raw, damage = null) {
    const e = raw.passives.at(-1), [b, bt] = e.before, [a, t] = e.after;
    e.result = '原附加效果';
    if (e.skill === 'xuantie-jian') { a.neili -= 120; t.eff_qi -= Math.trunc(e.incoming * 4 / 5); }
    else if (e.skill === 'sanwu-shou') { a.neili -= 30; t.eff_qi -= e.incoming; }
    else {
        a.neili -= 50;
        const n = damage ?? Math.trunc(b.skills[e.skill] / (b.weapon === 'sword' ? 5 : 4));
        t.qi -= n; t.eff_qi -= Math.trunc(n * 2 / 3);
    }
    t.qi = Math.min(t.qi, t.eff_qi); assert.ok(t.qi <= bt.qi); return settle(raw);
}

test('六门兵器、两类武学附伤与心经联动：114条件9734计划记录', () => {
    assert.equal(gumuWeapons.length, 6); assert.equal(gumuWeaponFixtureRequirements.length, 5);
    assert.equal(cases.length, 114); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 9734);
    assert.equal(cases.filter(c => c.method === 'ordinary').length, 63);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        assert.ok(catalog.skills.some(s => s.path === c.entry_id));
        for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
        validateGumuWeaponRecord(trace(c), c);
    }
    const smoke = gumuWeaponConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 228);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.throws(() => gumuWeaponConditions({ skills: [] }));
    for (const samples of [0, -1, 1.5, NaN]) assert.throws(() => gumuWeaponConditions(catalog, { samples }));
});

test('玄铁的数字四分之一、未通过招架时0、实际创伤三种结果分别验收', () => {
    for (const suffix of ['hit-damage0', 'hit-damage119', 'hit-level159', 'hit-neili499', 'hit-no-map']) {
        const c = pick('xuantie-jian', suffix); validateGumuWeaponRecord(trace(c), c);
        assert.throws(() => validateGumuWeaponRecord(applyHit(trace(c)), c));
    }
    const low = pick('xuantie-jian', 'hit-parry99');
    validateGumuWeaponRecord(applyHit(trace(low)), low);
    let r = trace(low); r.passives[0].result = 0; settle(r);
    assert.throws(() => validateGumuWeaponRecord(r, low));
    for (const n of [100, 299, 300]) {
        const c = pick('xuantie-jian', 'hit-parry' + n); r = trace(c);
        r.passives[0].result = 0; settle(r); validateGumuWeaponRecord(r, c);
        if (n >= 299) assert.throws(() => validateGumuWeaponRecord(applyHit(trace(c)), c));
    }
    r = applyHit(trace(low)); r.passives[0].after[0].neili++; settle(r);
    assert.throws(() => validateGumuWeaponRecord(r, low));
});

test('三无正邪与最低门槛：无触发仍返回数值1，零伤输入也可扣30', () => {
    for (const suffix of ['hit-level119', 'hit-neili199', 'hit-shen-1', 'hit-shen0']) {
        const c = pick('sanwu-shou', suffix); validateGumuWeaponRecord(trace(c), c);
        assert.throws(() => validateGumuWeaponRecord(applyHit(trace(c)), c));
    }
    for (const suffix of ['hit-level120', 'hit-neili200', 'hit-damage0', 'hit-damage1', 'hit-damage201']) {
        const c = pick('sanwu-shou', suffix); validateGumuWeaponRecord(applyHit(trace(c)), c);
        const r = trace(c); r.passives[0].result = 0; settle(r);
        assert.throws(() => validateGumuWeaponRecord(r, c));
    }
});

test('心经口诀、有效内功随机上界、资源和持器映射门槛；factor与输入伤害不决定扣费', () => {
    for (const suffix of ['force-level149', 'force-no-wall', 'force-no-weapon', 'force-no-map',
        'force-high-con', 'force-low-effective-force', 'force-neili299']) {
        const c = pick('suxin-jian', suffix); validateGumuWeaponRecord(trace(c), c);
        assert.throws(() => validateGumuWeaponRecord(applyHit(trace(c)), c));
    }
    for (const skill of ['suxin-jian', 'yinsuo-jinling']) {
        const c = pick(skill, 'force-level400'), base = skill === 'suxin-jian' ? 80 : 100;
        for (const n of [base, base * 2 - 1]) validateGumuWeaponRecord(applyHit(trace(c), n), c);
        for (const n of [base - 1, base * 2]) assert.throws(() => validateGumuWeaponRecord(applyHit(trace(c), n), c));
    }
    for (const suffix of ['force-neili300', 'force-factor0', 'force-factor100000', 'force-damage0', 'force-damage100000', 'force-con0']) {
        const c = pick('suxin-jian', suffix), r = applyHit(trace(c));
        validateGumuWeaponRecord(r, c); assert.equal(r.metrics[0].neili_cost, 50);
    }
});

test('三门动态动作保留加载时有效／原始等级，不用当前800级重新计算', () => {
    for (const d of gumuWeapons.filter(d => d.dynamic)) {
        const c = pick(d.skill, 'ordinary-l800-j0'), r = trace(c), suxin = d.skill === 'suxin-jian';
        const s = r.skill_loads[0].state[suxin ? 'effective_skills' : 'skills'];
        r.actions[0].action = { action: '原极意', lvl: d.dynamic, force: Math.trunc(s.force / 2),
            attack: Math.trunc(s[d.usage] / 4), dodge: Math.trunc(s.dodge / (suxin ? 4 : 6)),
            parry: Math.trunc(s.parry / (suxin ? 4 : 6)), damage: Math.trunc(s.force / (suxin ? 3 : 4)) };
        validateGumuWeaponRecord(r, c);
        const repeated = copy(r); repeated.actions[0].action.force++;
        assert.throws(() => validateGumuWeaponLoads([r, repeated]));
        const reloaded = copy(r); reloaded.skill_loads[0].load_id += '-reloaded';
        assert.throws(() => validateGumuWeaponLoads([r, reloaded]));
        assert.deepEqual(validateGumuWeaponLoads([r, copy(r)]), { loads: 1, observed_dynamic_actions: 1 });
        r.actions[0].action.force = 1200; assert.throws(() => validateGumuWeaponRecord(r, c));
        const boundary = pick(d.skill, `ordinary-l${d.dynamic}-j0-action-boundary`), b = trace(boundary);
        b.actions[0].action.lvl = d.dynamic; assert.throws(() => validateGumuWeaponRecord(b, boundary));
    }
});

test('普通攻击按原force再martial记账，不能用两次接口调用冒充一击', () => {
    const c = pick('xuantie-jian', 'ordinary-l800-j50'), r = trace(c);
    r.attacks[0].result = 0;
    const forceAfter = copy(r.before); forceAfter[0].neili -= 50;
    r.passives.push({ actor: 0, target: 1, route: 'force', skill: 'surge-force', factor: 50,
        incoming: 100, result: 30, before: copy(r.before), after: forceAfter });
    r.passives.push({ actor: 0, target: 1, route: 'martial', skill: 'xuantie-jian', factor: 0,
        incoming: 200, result: 50, before: copy(forceAfter), after: copy(forceAfter) });
    applyHit(r); validateGumuWeaponRecord(r, c); assert.equal(r.metrics[0].neili_cost, 170);
    const swapped = copy(r); swapped.passives.reverse(); assert.throws(() => validateGumuWeaponRecord(swapped, c));
    const j0 = pick('xuantie-jian', 'ordinary-l800-j0'); assert.throws(() => validateGumuWeaponRecord(r, j0));
    const plain = pick('yunv-jian', 'ordinary-l200-j50'), p = trace(plain);
    p.attacks[0].result = 0;
    for (const [skill, route, factor] of [['yunv-xinjing', 'force', 50], ['yunv-jian', 'martial', 0]])
        p.passives.push({ actor: 0, target: 1, route, skill, factor, incoming: 200, result: 0,
            before: copy(p.before), after: copy(p.before) });
    settle(p); validateGumuWeaponRecord(p, plain); assert.equal(p.metrics[0].neili_cost, 0);
});

test('素心表格100／99倒序按原结果记录；正常阈值不被笼统放宽', () => {
    for (const level of [99, 100, 101]) {
        const c = pick('suxin-jian', `ordinary-l${level}-j0-action-order`), r = trace(c);
        r.actions[0].action = { action: '原茶花满路', lvl: 100 };
        if (level === 99) assert.throws(() => validateGumuWeaponRecord(r, c));
        else validateGumuWeaponRecord(r, c);
        r.actions[0].action.lvl = 106; assert.throws(() => validateGumuWeaponRecord(r, c));
    }
});

test('缺观测、身份错、资源账不闭合、偷加直伤和额外选招均不能通过', () => {
    const c = pick('suxin-jian', 'ordinary-l400-j0');
    for (const mutate of [
        r => { delete r.skill_loads; }, r => { r.skill_loads[0].sha256 = 'wrong'; },
        r => { r.skill_loads[0].state.userp = 0; }, r => { delete r.skill_loads[0].run_id; },
        r => { r.before[0].wizardp = 1; }, r => { r.metrics[0] = null; },
        r => { r.metrics[0].neili_cost = null; }, r => { r.metrics[0].direct = 1; },
        r => { r.immediate[0].neili--; }, r => { r.immediate[0].temp.apply.attack = 70; },
        r => { r.actions.push(copy(r.actions[0])); }, r => { r.attacks.push(copy(r.attacks[0])); },
    ]) { const r = trace(c); mutate(r); assert.throws(() => validateGumuWeaponRecord(r, c)); }
});

test('接口与实战结果分列；缺失观测保持未知，不报告零成功率', () => {
    const c = pick('sanwu-shou', 'hit-damage0'), hit = applyHit(trace(c)), miss = trace(c);
    const o = pick('yunv-jian', 'ordinary-l200-j0');
    const records = [hit, miss, trace(o), { method: 'ordinary', outcome: 'observed' }]
        .map(raw => ({ outcome: 'observed', raw }));
    records.push({ outcome: 'error', raw: {} });
    const e = gumuWeaponEffects(records);
    assert.equal(e.samples, 4); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(e.methods.ordinary.samples, 2); assert.equal(e.methods.ordinary.unknown_passive_samples, 1);
    assert.equal(e.methods.ordinary.target_loss.qi.unknown, 1);
    const g = e.methods.interface.groups['interface:sanwu-shou'];
    assert.equal(g.calls, 2); assert.equal(g.triggered.rate, 0.5); assert.equal(g.neili_cost.mean, 15);
    assert.equal(g.numeric_returns.n, 1); assert.equal(g.numeric_returns.mean, 1);
});

test('真实快照的性格与装备技能修正，不混用顶层合成字段', () => {
    const c = pick('yunv-jian', 'ordinary-l200-j0'), r = trace(c);
    for (const phase of ['before', 'immediate', 'after']) for (const state of r[phase]) {
        delete state.character;
        state.temp.apply.dodge = -1;
        state.effective_skills.dodge--;
    }
    validateGumuWeaponRecord(r, c);
    const missing = copy(r); delete missing.before[0].cultivation.character;
    assert.throws(() => validateGumuWeaponRecord(missing, c));
    const wrong = copy(r); wrong.before[0].effective_skills.dodge++;
    assert.throws(() => validateGumuWeaponRecord(wrong, c));
});

test('未实现hit_ob的明确null不冒充缺测，也不要求驱动替换成数字0', () => {
    const c = pick('yunv-jian', 'ordinary-l400-j0'), r = trace(c);
    r.attacks[0].result = 0;
    r.passives = [{ actor: 0, target: 1, route: 'martial', skill: 'yunv-jian', incoming: 200,
        factor: 0, result: null, before: copy(r.before), after: copy(r.before) }];
    validateGumuWeaponRecord(r, c);
    delete r.passives[0].result;
    assert.throws(() => validateGumuWeaponRecord(r, c));
});

test('统一入口只追加剑鞭条件，旧12111条件完整指纹不变', () => {
    const all = schoolCombatConditions(catalog);
    assert.deepEqual(all.filter(c => c.id.startsWith('school-gumu-weapons-')), cases);
    // Keep the historical cohort before slicing; later Quanzhen/S1 windows are not old records.
    const historical = all.filter(c => !c.parameters.collection_group?.startsWith('s1-')
        && !c.id.startsWith('school-quanzhen-boundary-') && !c.parameters.target_busy_lifecycle);
    const old = historical.slice(0, 12111);
    assert.equal(old.length, 12111); assert.equal(old.reduce((n,c)=>n+c.samples,0), 310762);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '996ba9d106c496fee8632d9dfc00d2bbd2278c4de05f8fbb81fb39efa2042501');
    for (const c of cases) validateSchoolCombatRecord(trace(c), c);
});

test('临时探针只读原选招结果并包围原附伤调用，可逆还原且不再调用query_action', () => {
    const source = readFileSync(join(root, 'adm/daemons/combatd.c'), 'utf8');
    const base = combatExtraDodgeProbes(source), changed = combatActionProbes(source);
    assert.equal(changed.sites.length, base.sites.length + 3);
    let restored = changed.changed;
    for (const site of changed.sites.slice(base.sites.length).reverse()) {
        assert.equal(site.position, 'before');
        assert.ok(!site.insert.includes('query_action('));
        assert.equal(restored.split(site.insert + site.anchor).length, 2);
        restored = restored.replace(site.insert + site.anchor, site.anchor);
    }
    assert.equal(restored.split('->observe_direct(').length - 1, 1);
    restored = restored.replace('->observe_direct(me, target, type, damage, percent);',
        '->observe_direct(me, target);');
    assert.equal(restored, base.changed);
    assert.throws(() => combatActionProbes(source.replace('action = me->query_action();',
        'if (me->query_temp("action_flag") == 0)\n    action = me->query_action();')));
});
