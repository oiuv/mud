import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangSwordMoves } from './school_wudang_sword_cases.mjs';
import { wudangSwordEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const all = schoolCombatConditions(catalog), cases = all.filter(c => c.parameters.collection_group === 'wudang-sword');
const by = (move, suffix = '', level = 200) => cases.find(c => c.id === `school-wudang-sword-${move}-l${level}${suffix}`);
function raw(c, direct = 0) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        effective_skills: { sword: Math.trunc(config.skills.sword / 2) + (config.skills['taiji-jian'] ?? 0) },
        weapon: config.equipment?.type ?? 'none', temp: {}, busy: config.busy ?? 0,
    }));
    return { outcome: c.parameters.expected, before, immediate: structuredClone(before),
        launches: [{ skill: 'taiji-jian' }], metrics: [{ direct }, {}], attacks: [], callbacks: [] };
}

test('武当太极剑71条件2200样本，历史1431条件保持原样', () => {
    assert.equal(cases.length, 71); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2200);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 37);
    const old = all.filter(c => ['huashan', 'quanzhen'].includes(c.parameters.school)
        && !['quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 1431); assert.equal(old.reduce((n, c) => n + c.samples, 0), 48138);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    assert.ok(cases.every(c => entries.has(c.entry_id)));
    assert.equal(schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'wudang-sword')
        .reduce((n, c) => n + c.samples, 0), 140);
});

test('实际施展门槛与教学不同；真假邪气对照只改目标shen', () => {
    for (const [move, minimum, neili] of wudangSwordMoves) {
        assert.equal(by(move, '-low-skill').parameters.actor.skills['taiji-jian'], minimum - 1);
        assert.equal(by(move, '-minimum-skill').parameters.actor.skills['taiji-jian'], minimum);
        assert.equal(by(move, '-low-neili').parameters.actor.properties.neili, neili - 1);
        assert.equal(by(move, '-minimum-neili').parameters.actor.properties.neili, neili);
    }
    const bad = structuredClone(by('zhenwu', '-bad-target').parameters.target);
    bad.properties.shen = 0; assert.deepEqual(bad, by('zhenwu').parameters.target);
    assert.equal(by('sui', '-peace').parameters.fighting, false);
});

test('缠忙判定与伤害分开；驾字诀费用按直伤分支核验', () => {
    const c = by('chan'), r = raw(c); r.metrics[0].neili_cost = 30; r.immediate[0].busy = 2;
    validateSchoolCombatRecord(r, c);
    r.immediate[0].busy = 0; r.immediate[1].busy = 14; validateSchoolCombatRecord(r, c);
    r.immediate[1].busy++; assert.throws(() => validateSchoolCombatRecord(r, c));
    for (const direct of [0, 1]) {
        const j = by('jia'), jr = raw(j, direct); jr.metrics[0].neili_cost = direct ? 80 : 60;
        jr.immediate[0].busy = direct ? 1 : 3; validateSchoolCombatRecord(jr, j);
        jr.metrics[0].neili_cost++; assert.throws(() => validateSchoolCombatRecord(jr, j));
    }
});

test('剑轮岚转按原普通攻击5至10次核验并撤回攻击加成', () => {
    const c = by('zhuan'), r = raw(c);
    r.attacks = Array.from({ length: 7 }, () => ({ actor: 0, target: 1, type: 0 }));
    r.metrics[0].neili_cost = 140; r.immediate[0].busy = 7; validateSchoolCombatRecord(r, c);
    r.immediate[0].temp.apply = { attack: 30 }; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('随字诀原秒数到期；缺回调、提前或未撤属性均不能报完成', () => {
    const c = by('sui', '-expiry'), r = raw(c);
    r.metrics[0].neili_cost = 100; r.immediate[0].busy = 3; r.immediate[0].neili -= 100;
    r.immediate[0].temp = { tjj_sui: 1, apply: { attack: -33, defense: 66 } };
    r.after = structuredClone(r.immediate); r.after[0].temp = { apply: { attack: 0, defense: 0 } };
    r.elapsed = 68.1;
    r.callbacks = [{ side: 0, phase: 'before', elapsed: 66.1, state: r.immediate[0] },
        { side: 0, phase: 'after', elapsed: 66.2, state: r.after[0] }];
    validateSchoolCombatRecord(r, c);
    const tickAligned = structuredClone(r);
    tickAligned.elapsed = 67.841619;
    tickAligned.callbacks[0].elapsed = 65.822798;
    tickAligned.callbacks[1].elapsed = 65.822985;
    validateSchoolCombatRecord(tickAligned, c);
    for (const mutate of [x => { x.callbacks = []; }, x => { x.callbacks[0].elapsed = 1; },
        x => { x.callbacks[0].elapsed = 64.99; }, x => { x.elapsed = 66.99; },
        x => { x.callbacks[1].elapsed = 65; }, x => { x.callbacks[1].elapsed = 69; },
        x => { x.after[0].temp.apply.defense = 1; }, x => { x.after[0].neili++; }]) {
        const bad = structuredClone(r); mutate(bad); assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
    const report = wudangSwordEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(report.apply.attack.mean, -33); assert.equal(report.after_apply.defense.mean, 0);
    assert.equal(report.sui_active, 0);
});

test('拒绝不扣费；精神创伤与气血、普攻调用与命中不混算', () => {
    const c = by('zhenwu', '-low-neili'), r = raw(c); r.launches = []; r.reason = '真气不够';
    r.immediate[0].temp.notify_fail = '真气不够';
    validateSchoolCombatRecord(r, c); r.metrics[0].neili_cost = 50;
    assert.throws(() => validateSchoolCombatRecord(r, c));
    const hit = raw(by('zhenwu'), 1); hit.metrics[1] = { jing_cost: 80, eff_jing_cost: 40, qi_cost: 300 };
    hit.after = structuredClone(hit.immediate);
    const report = wudangSwordEffects([{ outcome: 'observed', raw: hit }, { outcome: 'refused', raw: r }]);
    assert.equal(report.jing_cost.mean, 80); assert.equal(report.eff_jing_cost.mean, 40);
    assert.equal(report.regular_attacks.mean, 0);
});
