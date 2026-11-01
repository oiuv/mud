// Synthetic checks only; a real original round is still required for acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { huashanSchoolDefenseConditions, validateHuashanSchoolDefenseRecord } from './school_huashan_school_defense_cases.mjs';

const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = huashanSchoolDefenseConditions(catalog, read);
const find = suffix => cases.find(c => c.id.endsWith(suffix));

function trace(c) {
    const p = c.parameters, buff = Math.floor(p.level / 3);
    const defenderApply = { armor: 100 };
    const before = [
        { ...p.actor.properties, skills: structuredClone(p.actor.skills), mappings: {},
            weapon: p.attack_type, weapon_details: p.attack_type === 'none' ? {} : { program: '/tests/' + p.attack_type },
            temp: { apply: {} }, busy: 0, effective_skills: structuredClone(p.actor.skills) },
        { ...p.target.properties, skills: structuredClone(p.target.skills), mappings: structuredClone(p.target.mappings),
            weapon: 'sword', weapon_details: { program: '/tests/sword' }, temp: { apply: defenderApply },
            busy: 0, effective_skills: structuredClone(p.target.skills) },
    ];
    const preBefore = structuredClone(before);
    const preAfter = structuredClone(before);
    preAfter[1].neili -= 100;
    preAfter[1].temp.powerup = 1;
    preAfter[1].temp.apply.attack = buff;
    preAfter[1].temp.apply.defense = buff;
    const immediate = structuredClone(preAfter);
    return {
        kind: 'sample', condition_id: c.id, index: 0, method: 'ordinary', outcome: 'observed', reason: '',
        before, immediate, after: structuredClone(immediate),
        launches: [{ skill: 'zixia-shengong', argument: 'powerup' }],
        interfaces: [], metrics: [{}, {}], elapsed: 0.2,
        powerup: { action: 'exert powerup', actor_side: 1, accepted: 1, before: preBefore, after: preAfter },
        attacks: [{ actor: 0, target: 1, type: 0, result: 1 }],
        defenses: [], passives: [], refusals: [], dropped: [],
        dodge_checks: [
            { actor: 0, target: 1, type: 0, phase: 'base', skill: 'huashan-shenfa', ap: 1, dp: 1, busy: null },
            { actor: 0, target: 1, type: 0, phase: 'settled', skill: 'huashan-shenfa', ap: 1, dp: 1, busy: null },
        ],
    };
}

test('门派级防御12条件：四攻击类型×三档，正式100/烟雾2，原增益前置', () => {
    assert.equal(cases.length, 12);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1200);
    assert.equal(new Set(cases.map(c => c.id)).size, 12);
    assert.deepEqual([...new Set(cases.map(c => c.parameters.attack_type))], ['sword', 'blade', 'pin', 'none']);
    const smoke = huashanSchoolDefenseConditions(catalog, read, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 24);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(p.collection_group, 'huashan-school-defense');
        assert.equal(p.school_defense_prelude, 1);
        assert.equal(p.action, 'ordinary');
        assert.equal(p.fighting, true);
        assert.equal(p.observe_seconds, 0);
        assert.equal(p.target.mappings.dodge, 'huashan-shenfa');
        assert.equal(p.expected, 'observed');
        assert.ok(c.parameters.qualification_sources.includes('adm/daemons/combatd.c'));
    }
    assert.equal(find('school-defense-none-l200').parameters.actor.equipment, undefined);
    assert.equal(find('school-defense-blade-l400').parameters.actor.equipment.type, 'blade');
    const all = schoolCombatConditions(catalog);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'huashan-school-defense'), cases);
});

test('严格消费者接受完整原语义记录', () => {
    for (const c of cases) validateHuashanSchoolDefenseRecord(trace(c), c);
});

test('缺前置、假受理、增益被轮次撤回或攻击类型不符均拒绝', () => {
    for (const suffix of ['school-defense-sword-l200', 'school-defense-none-l800']) {
        const c = find(suffix), r = trace(c);
        validateSchoolCombatRecord(r, c);
        for (const mutate of [r => { delete r.powerup; },
            r => { r.powerup.accepted = 0; },
            r => { r.powerup.actor_side = 0; },
            r => { r.powerup.after[1].neili++; },
            r => { r.powerup.after[1].temp.apply.attack++; },
            r => { r.powerup.after[0].temp.powerup = 1; },
            r => { r.immediate[1].temp.apply.attack--; },
            r => { r.after[1].temp.powerup = 0; },
            r => { r.attacks = []; },
            r => { r.dodge_checks = []; },
            r => { r.dodge_checks[0].skill = 'other-shenfa'; },
            r => { r.launches.pop(); },
            r => { r.before[0].weapon = c.parameters.attack_type === 'none' ? 'sword' : 'none'; }]) {
            const wrong = structuredClone(r); mutate(wrong);
            assert.throws(() => validateHuashanSchoolDefenseRecord(wrong, c));
        }
    }
});
