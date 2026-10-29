import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { dushaMemberConditions, validateDushaMemberRecord } from './school_dusha_member_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root)), cases = dushaMemberConditions(catalog, read);
const find = suffix => cases.find(c => c.id.endsWith(suffix));
function row(c, poisoned = false) {
    const p = c.parameters, before = [p.actor, p.target].map((cfg, i) => ({
        ...structuredClone(cfg.properties), object: '/tests/actor#' + i, id: i ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null,
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations),
        temp: { apply: { armor: 100 } }, learned: {}, conditions: null,
        weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'none' : cfg.equipment?.type ?? 'none',
        secondary_weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none',
        secondary_weapon_details: cfg.equipment?.slot === 'secondary_weapon' ? { program: '/tests/sword' } : {},
        effective_skills: { force: Math.trunc(cfg.skills.force / 2) + (cfg.skills['shennong-xinjing'] ?? 0) },
    }));
    const r = { method: c.method, outcome: p.expected, before, immediate: structuredClone(before),
        launches: [], directs: [], interfaces: [], attacks: [], passives: [], metrics: [{}, {}], reason: p.refusal };
    const [b] = before, [a, v] = r.immediate;
    if (p.ability === 'ordinary') {
        r.attacks.push({ actor: 0, target: 1, type: 0, attack_skill: p.skill,
            attack_usage: 'strike', result: 0, damage: 10 });
        if (b.jiali) {
            a.neili -= b.jiali;
            r.passives.push({ route: 'force', actor: 0, target: 1, skill: 'shennong-xinjing', factor: b.jiali, result: 10 });
        }
        r.passives.push({ route: 'martial', actor: 0, target: 1, skill: p.skill, factor: 0, incoming: 10,
            result: poisoned ? '$n忽然感到一股莫名的恶心，全身瘫软，嘴皮乌紫。\n' : null });
        if (poisoned) v.conditions = { sha_poison: { id: 'left', name: '砂毒', level: b.jiali,
            remain: b.jiali * Math.trunc(b.skills['dusha-zhang'] / 50) } };
        v.qi -= 10; v.eff_qi -= 2;
        r.metrics[0].neili_cost = b.jiali; r.metrics[1].qi_cost = 10; r.metrics[1].eff_qi_cost = 2;
    } else {
        r.interfaces.push({ ...p.interface, result: p.expected_result });
        if (p.ability === 'practice_skill' && p.expected_result) {
            const fee = b.skills['dusha-zhang'] < 50 ? 30 : 40;
            a.qi -= fee; a.neili -= 60; r.metrics[0].qi_cost = fee; r.metrics[0].neili_cost = 60;
        }
    }
    r.after = structuredClone(r.immediate); return r;
}
test('毒砂掌39条件1646正式/78烟雾；单项/毒种不冒原NPC教学或毒发', () => {
    assert.equal(cases.length, 39); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 1646);
    assert.equal(dushaMemberConditions(catalog, read, { smoke: true }).reduce((s, c) => s + c.samples, 0), 78);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 's1-dusha'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c, c.id.endsWith('target-force0') || c.id.includes('gate-l80-')), c);
    assert.throws(() => dushaMemberConditions(catalog, p => read(p) + ' '), /重新审阅/);
});
test('学习有效内功100/最大450/基本功比较及双手拒绝；练习不强加空手规则', () => {
    for (const slot of ['weapon', 'secondary_weapon']) {
        assert.equal(find('valid_learn-' + slot).parameters.expected, 'refused');
        assert.equal(find('practice_skill-' + slot).parameters.expected, 'observed');
    }
    assert.equal(find('valid_learn-force99').parameters.actor.skills.force, 198);
    assert.equal(find('valid_learn-force100').parameters.actor.skills.force, 200);
    for (const suffix of ['force99', 'max-neili449', 'basic199']) assert.equal(find('valid_learn-' + suffix).parameters.expected, 'refused');
    assert.equal(find('valid_combine-lansha-shou').parameters.expected_result, 1);
});
test('练习49/50分界的30/40气血与60内力、60/70门槛独立', () => {
    for (const level of [49, 50]) {
        const c = find('practice_skill-level' + level), r = row(c);
        validateDushaMemberRecord(r, c); r.immediate[0].qi++; r.after = structuredClone(r.immediate);
        assert.throws(() => validateDushaMemberRecord(r, c));
    }
    assert.equal(find('practice_skill-qi59').parameters.expected, 'refused');
    assert.equal(find('practice_skill-neili69').parameters.expected, 'refused');
});
test('砂毒等级80/加力10/正伤/对手内功支持集及剂量时长不可泛判', () => {
    for (const suffix of ['gate-l79-jiali10', 'l200-jiali9', 'target-force2000']) {
        const c = find(suffix); validateDushaMemberRecord(row(c), c);
        assert.throws(() => validateDushaMemberRecord(row(c, true), c));
    }
    const c = find('target-force0'); assert.throws(() => validateDushaMemberRecord(row(c), c));
    for (const mutate of [r => { r.immediate[1].conditions.sha_poison.level = 100; },
        r => { r.immediate[1].conditions.sha_poison.id = 'right'; },
        r => { r.immediate[1].conditions.sha_poison.remain++; },
        r => { r.passives.at(-1).incoming = 0; }, r => { r.metrics[1].heartbeats = 1; }]) {
        const r = row(c, true); mutate(r); r.after = structuredClone(r.immediate);
        assert.throws(() => validateDushaMemberRecord(r, c));
    }
});
test('缺被动、错用途、额外直伤/费用/状态或初态身份不计通过', () => {
    const c = find('l400-jiali50');
    for (const mutate of [r => r.passives.shift(), r => { r.attacks[0].attack_usage = 'claw'; },
        r => { r.before[0].wizardp = 1; }, r => { r.before[0].mappings.force = 'other'; },
        r => { delete r.directs; }, r => { r.immediate[0].qi--; },
        r => { r.immediate[1].jing--; }, r => { r.passives.at(-1).skill = 'other'; }]) {
        const r = row(c); mutate(r); r.after = structuredClone(r.immediate);
        assert.throws(() => validateDushaMemberRecord(r, c));
    }
});
