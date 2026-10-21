import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan } from './school_combat_report.mjs';
import { emeiJiuyinPassiveConditions, jiuyinPassiveGroup, palmProbability, poisonDamageBounds,
    jiuyinPassiveEffects } from './school_emei_jiuyin_passive_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = emeiJiuyinPassiveConditions(catalog);
const pick = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('新附伤批不改变旧11499条件与286670样本计划', () => {
    const all = schoolCombatConditions(catalog);
    const historical = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school));
    const old = historical.filter(c => ![jiuyinPassiveGroup, 'emei-npc', 'emei-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 11499); assert.equal(old.reduce((n, c) => n + c.samples, 0), 286670);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'), '168f9744f0adecc3c9087818eebd60afc5b99f104b1eeb1822b6453d70c0d880');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === jiuyinPassiveGroup), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length); validateSchoolCombatPlan(cases, catalog);
    for (const c of cases) for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
    assert.throws(() => emeiJiuyinPassiveConditions({ skills: [] }));
    assert.throws(() => emeiJiuyinPassiveConditions(catalog, { samples: 0 }));
});

test('烟雾与正式随机样本分开，生命周期保留原时钟且角色反向', () => {
    const smoke = emeiJiuyinPassiveConditions(catalog, { smoke: true });
    for (let i = 0; i < cases.length; i++) assert.equal(smoke[i].samples, cases[i].samples === 100 ? 2 : 1);
    for (const c of cases.filter(c => c.method === 'condition')) {
        assert.equal(c.samples, 2); assert.equal(c.parameters.observe_seconds, 45);
        assert.ok(c.parameters.target.skills['cuixin-zhang'] >= 80);
        assert.equal(!!c.parameters.actor.conditions, !c.parameters.seed_by_hit);
    }
});

test('催心触发概率保留整数严格比较与非零伤害语义', () => {
    for (const [force, expected] of [[19, 1], [20, 199 / 200], [119, .5], [218, .005], [219, 0]])
        assert.equal(palmProbability(200, 10, force, 1), expected);
    assert.equal(palmProbability(79, 10, 0, 1), 0);
    assert.equal(palmProbability(80, 9, 0, 1), 0);
    assert.equal(palmProbability(80, 10, 0, 0), 0);
    assert.equal(palmProbability(80, 10, 0, -1), 1);
    assert.equal(palmProbability(80, 10, 0, 1, 1), 0);
});

test('公共毒伤分段含严格300边界，不将强度作为直接气伤', () => {
    assert.deepEqual(poisonDamageBounds(10, 'jing'), [5, 14]);
    assert.deepEqual(poisonDamageBounds(200, 'jing'), [20, 60]);
    assert.deepEqual(poisonDamageBounds(200, 'qi'), [41, 123]);
    assert.deepEqual(poisonDamageBounds(300, 'qi'), [50, 149]);
    assert.deepEqual(poisonDamageBounds(312, 'qi'), [50, 150]);
});

// Synthetic records exercise the validator only, never enter the evidence series.
function clawRecord(c) {
    const p = c.parameters, before = [p.actor, p.target].map((cfg, i) => ({
        userp: 1, interactive: 1, wizardp: 0, ...cfg.properties, skills: cfg.skills,
        mappings: cfg.mappings, conditions: null, cultivation: cfg.properties,
        effective_str: cfg.properties.str, id: i ? 'right' : 'left' }));
    const r = { outcome: 'observed', before, immediate: structuredClone(before), launches: [], attacks: [],
        interfaces: [{}], passives: [{ skill: p.skill, route: 'interface', incoming: p.interface.damage,
            factor: p.interface.factor, result: 0 }] };
    const d = p.interface.damage, trigger = d >= 100 && Math.trunc(d / 5) > before[1].effective_str;
    if (trigger) { r.passives[0].result = '原附伤文字'; r.immediate[1].eff_qi -= Math.trunc((d - 100) / 2); }
    r.immediate[1].qi = r.immediate[1].eff_qi; return r;
}

test('白骨爪附伤为100门槛，触发文字并不一定伤血', () => {
    for (const c of cases.filter(c => c.parameters.skill === 'jiuyin-baiguzhao' && c.method === 'interface'))
        validateSchoolCombatRecord(clawRecord(c), c);
    const c = pick('damage100-str19'), r = clawRecord(c);
    assert.ok(r.passives[0].result); assert.equal(r.before[1].eff_qi, r.immediate[1].eff_qi);
    assert.equal(jiuyinPassiveEffects([{ raw: r }]).triggered, 1);
});

test('伪造伤势、身份、调用次数或将接口标成普攻均拒绝', () => {
    const c = pick('damage105-str20');
    for (const mutate of [r => r.immediate[1].eff_qi++, r => r.before[0].wizardp = 1,
        r => r.passives.push(r.passives[0]), r => r.passives[0].route = 'martial',
        r => r.passives[0].incoming++, r => r.immediate[0].neili--]) {
        const r = clawRecord(c); mutate(r); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

function palmRecord(c) {
    const p = c.parameters, r = clawRecord(c);
    for (const [state, cfg] of [[r.before[0], p.actor], [r.before[1], p.target]]) {
        state.effective_skills = { force: Math.trunc(cfg.skills.force / 2) };
        state.conditions = cfg.conditions ? structuredClone(cfg.conditions) : null;
    }
    r.immediate = structuredClone(r.before);
    const b = r.before[1], attacker = r.before[0], event = r.passives[0]; event.result = 0;
    if (palmProbability(p.level, attacker.jiali, b.effective_skills.force, p.interface.damage,
        b.cultivation['special_skill/piyi']) > 0) {
        const previous = b.conditions?.cuixin_zhang, n = attacker.jiali;
        event.result = '原催心触发文字';
        r.immediate[1].conditions = { cuixin_zhang: { name: '催心掌掌力',
            id: previous && previous.id !== attacker.id ? '...' : attacker.id,
            level: Math.max(previous?.level ?? 0, n), remain: (previous?.remain ?? 0) + n * Math.trunc(p.level / 100) } };
    }
    return r;
}

test('催心所有接口和叠加边界核对原状态，不将免疫当作拒绝施加', () => {
    for (const c of cases.filter(c => c.method === 'interface' && c.parameters.skill === 'cuixin-zhang'))
        validateSchoolCombatRecord(palmRecord(c), c);
    assert.ok(palmRecord(pick('cuixin-zhang-full-immunity')).immediate[1].conditions);
    assert.equal(palmRecord(pick('cuixin-zhang-piyi')).immediate[1].conditions, null);
    const merged = palmRecord(pick('merge-foreign-300')).immediate[1].conditions.cuixin_zhang;
    assert.equal(merged.level, 300); assert.equal(merged.remain, 620); assert.equal(merged.id, '...');
});

test('催心结果不得伪造归属、强度、持续、即时伤害或无条件成功', () => {
    const c = pick('cuixin-zhang-level200');
    for (const mutate of [r => r.immediate[1].conditions.cuixin_zhang.id = 'wrong',
        r => r.immediate[1].conditions.cuixin_zhang.level = 20,
        r => r.immediate[1].conditions.cuixin_zhang.remain = 1,
        r => r.immediate[1].qi--, r => r.passives[0].result = 0]) {
        const r = palmRecord(c); mutate(r); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const blocked = pick('cuixin-zhang-force219'), r = palmRecord(blocked);
    r.passives[0].result = '伪成功'; assert.throws(() => validateSchoolCombatRecord(r, blocked));
});
