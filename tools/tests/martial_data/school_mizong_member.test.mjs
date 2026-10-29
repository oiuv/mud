import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { mizongMemberConditions, mizongMembers, validateMizongMemberRecord, validateMizongLoads } from './school_mizong_member_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root)), cases = mizongMemberConditions(catalog, read);
const find = suffix => cases.find(c => c.id.endsWith(suffix));
function state(cfg, side) {
    const effective = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k,
        Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)]));
    return { ...structuredClone(cfg.properties), object: '/tests/actor#' + side, userp: 1, playerp: 1,
        interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null,
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations),
        temp: { apply: { armor: 100 } }, learned: {}, effective_skills: effective,
        effective_con: cfg.properties.con + Math.trunc(cfg.skills.force / 10),
        weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'none' : cfg.equipment?.type ?? 'none',
        secondary_weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none',
        secondary_weapon_details: cfg.equipment?.slot === 'secondary_weapon' ? { program: '/tests/sword' } : {} };
}
function passive(before, skill, incoming, route) {
    const after = structuredClone(before), [b, t] = before, [a, v] = after;
    let result = null;
    if (skill === 'huoyan-dao' && incoming >= 150 && b.skills[skill] >= 150
        && b.skills[skill] + Math.trunc(incoming / 10) > Math.trunc(t.effective_skills.force / 2) + t.effective_con) {
        const wound = Math.trunc((incoming - 80) / 3);
        v.eff_qi -= wound; v.qi = Math.min(v.qi, v.eff_qi); result = '咔嚓';
    }
    return { actor: 0, target: 1, skill, factor: 0, route, incoming, result, before: structuredClone(before), after };
}
function row(c) {
    const p = c.parameters, d = mizongMembers[p.skill], before = [state(p.actor, 0), state(p.target, 1)];
    const first = cases.find(x => x.parameters.skill === 'huoyan-dao').parameters.actor;
    const loader = state({ ...first, mappings: {}, preparations: {} }, 0);
    const r = { method: c.method, outcome: p.expected, before, immediate: structuredClone(before),
        skill_loads: p.capture_skill_loads.map(desc => ({ ...desc, load_id: 'run:huoyan', run_id: 'run',
            command: 'enable parry huoyan-dao', state: loader })),
        launches: [], directs: [], interfaces: [], actions: [], attacks: [], passives: [], metrics: [{}, {}], reason: p.refusal };
    let [a, v] = r.immediate;
    if (p.ability === 'ordinary') {
        const item = d.actions.filter(a => a[0] < p.level).at(-1), action = { action: '原动作', lvl: item[0], skill_name: item[1], damage_type: '瘀伤' };
        if (p.skill === 'huoyan-dao' && item[0] === 250)
            Object.assign(action, { force: 133, attack: 50, dodge: 33, parry: 33, damage: 100, damage_type: '内伤' });
        else for (const [i, key] of ['force', 'attack', 'dodge', 'parry', 'damage'].entries()) if (item[i + 2] != null) action[key] = item[i + 2];
        r.actions.push({ actor: 0, target: 1, skill: p.skill, action });
        const e = passive(before, p.skill, 300, 'martial'); r.passives.push(e); r.immediate = structuredClone(e.after);
        [a, v] = r.immediate; v.qi -= 10;
        r.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 10, attack_skill: p.skill, attack_usage: d.usage });
    } else if (p.ability === 'hit_ob') {
        const e = passive(before, p.skill, p.interface.damage, 'interface'); r.passives.push(e);
        r.immediate = structuredClone(e.after); r.interfaces.push({ ...p.interface, result: e.result });
    } else {
        r.interfaces.push({ ...p.interface, result: p.expected_result });
        if (p.ability === 'practice_skill' && p.expected_result) {
            a.qi -= d.qiCost; a.neili -= p.skill === 'huoyan-dao' ? Math.trunc(p.level / 5) + 60 : 61;
        }
    }
    for (const side of [0, 1]) for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        r.metrics[side][key + '_cost'] = before[side][key] - r.immediate[side][key];
    r.after = structuredClone(r.immediate); return r;
}
test('三成员141条件2928正式/282烟雾，目录与实际家族分开，完整注册原接口', () => {
    assert.equal(cases.length, 141); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 2928);
    assert.equal(mizongMemberConditions(catalog, read, { smoke: true }).reduce((s, c) => s + c.samples, 0), 282);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 's1-mizong'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    assert.throws(() => mizongMemberConditions(catalog, p => read(p) + ' '), /重新审阅/);
});
test('大手印心法20最低/200封顶和基本功、火焰先天根骨与杀气按原边界', () => {
    for (const [suffix, expected] of [['dashou-yin-valid_learn-lamaism-min19', 'refused'],
        ['dashou-yin-valid_learn-lamaism-min20', 'observed'], ['dashou-yin-valid_learn-lamaism199-l400', 'refused'],
        ['dashou-yin-valid_learn-lamaism200-l400', 'observed'], ['huoyan-dao-valid_learn-con31', 'refused'],
        ['huoyan-dao-valid_learn-con32', 'observed'], ['huoyan-dao-valid_learn-shen-199999', 'refused'],
        ['huoyan-dao-valid_learn-shen-200000', 'observed']]) assert.equal(find(suffix).parameters.expected, expected);
    const c = find('dashou-yin-valid_learn-force50'), r = row(c); r.before[0].effective_skills.force = 49;
    assert.throws(() => validateMizongMemberRecord(r, c));
});
test('练习费用不偷换门槛：火焰70内力原接口通过后变-30，三档费用100/140/220', () => {
    for (const [suffix, expected] of [['neili70', -30], ['baseline', 5900], ['cost-l400', 5860], ['cost-l800', 5780]]) {
        const c = find('huoyan-dao-practice_skill-' + suffix), r = row(c);
        assert.equal(r.immediate[0].neili, expected); validateMizongMemberRecord(r, c);
        r.immediate[0].neili++; r.after = structuredClone(r.immediate);
        assert.throws(() => validateMizongMemberRecord(r, c));
    }
    for (const skill of Object.keys(mizongMembers)) for (const slot of ['weapon', 'secondary_weapon'])
        assert.equal(find(skill + '-practice_skill-' + slot).parameters.expected, 'refused');
});
test('附伤不是直伤：原创伤压低当前气血、等号不触发，负立方等号不额外随机', () => {
    const equal = row(find('huoyan-dao-hit_ob-force-gate388'));
    assert.equal(equal.before[1].effective_con, 68); assert.equal(equal.before[1].effective_skills.force, 194);
    assert.equal(equal.immediate[1].eff_qi, 10000);
    const below = row(find('huoyan-dao-hit_ob-force-gate384'));
    assert.equal(below.immediate[1].eff_qi, 9977); assert.equal(below.immediate[1].qi, 9977);
    const c = find('huoyan-dao-hit_ob-shen-8000000'), r = row(c);
    r.passives[0].after[1].eff_qi--; assert.throws(() => validateMizongMemberRecord(r, c));
});
test('火焰极意混合原始/有效首次加载、跨记录常量固定，禁止套三阴公式', () => {
    const c = find('huoyan-dao-ordinary-l400-jiali0'), r = row(c); validateMizongMemberRecord(r, c);
    const bad = row(c); bad.actions[0].action.force = 100; assert.throws(() => validateMizongMemberRecord(bad, c));
    const changed = row(c); changed.actions[0].action.force++;
    assert.throws(() => validateMizongLoads([r, changed]), /不得逐样本/);
    assert.deepEqual(validateMizongLoads([r, row(find('huoyan-dao-ordinary-l800-jiali0'))]), { loads: 1, dynamic_actions: 1 });
    for (const mutate of [r => { r.attacks[0].attack_usage = 'blade'; }, r => { r.passives[0].route = 'force'; },
        r => { r.before[0].wizardp = 1; }, r => { delete r.directs; }]) {
        const bad = row(c); mutate(bad); assert.throws(() => validateMizongMemberRecord(bad, c));
    }
});
