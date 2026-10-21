import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { validateWudangUnarmedRecord, wudangUnarmedMoves } from './school_wudang_unarmed_cases.mjs';
import { wudangUnarmedEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-unarmed');
const by = (skill, ability, suffix = '') => cases.find(c => c.id === `school-wudang-unarmed-${skill}-${ability}-l200${suffix}`);

test('武当徒手暗器109条件4922样本，旧1947条件69572样本保持', () => {
    assert.equal(cases.length, 109); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4922);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 43);
    const old = all.filter(c => !['wudang-unarmed', 'wudang-learning', 'wudang-cultivation', 'wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 1947); assert.equal(old.reduce((n, c) => n + c.samples, 0), 69572);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    assert.equal(schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'wudang-unarmed')
        .reduce((n, c) => n + c.samples, 0), 218);
});

test('虎爪用claw，芙蓉只手持不冒充普攻，全部绝招保留真实授招键及门槛', () => {
    for (const m of wudangUnarmedMoves) {
        const p = by(m.skill, m.ability).parameters;
        assert.equal(p.actor.properties[`can_perform/${m.skill}/${m.ability}`], 1);
        assert.equal(by(m.skill, m.ability, '-low-skill').parameters.actor.skills[m.skill], m.minimum - 1);
        assert.equal(by(m.skill, m.ability, '-minimum-neili').parameters.actor.properties.neili, m.neili);
        assert.equal(p.action, `perform ${m.usage}.${m.ability}`);
    }
    assert.deepEqual(by('huzhua-shou', 'juehu').parameters.actor.preparations, { claw: 'huzhua-shou' });
    assert.deepEqual(by('furong-jinzhen', 'xian').parameters.actor.equipment, { type: 'throwing', hold: true });
    assert.ok(!cases.some(c => c.method === 'ordinary' && c.parameters.usage === 'throwing'));
    assert.ok(!cases.some(c => c.method === 'perform' && c.parameters.skill === 'paiyun-shou'));
});

function raw(c) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        neili: 6000, shen: 0, qi: 10000, eff_qi: 10000, ...config.properties,
        preparations: config.preparations, weapon: config.equipment && !config.equipment.hold ? config.equipment.type : 'none',
        ammunition: config.equipment?.hold ? 10 : 0, temp: {}, busy: config.busy ?? 0,
        effective_skills: { force: 300, throwing: 300 },
    }));
    return { outcome: c.parameters.expected, before, immediate: structuredClone(before),
        launches: c.parameters.expected === 'refused' || c.method === 'ordinary' ? [] : [{ skill: c.parameters.skill }],
        metrics: [{}, {}], attacks: [], reason: '原规则拒绝' };
}
function charge(r, amount) { r.metrics[0].neili_cost = amount; r.immediate[0].neili -= amount; }

test('绝户神抓成功与失败都扣正气3000，费用/忙乱分别核验', () => {
    const c = by('huzhua-shou', 'juehu');
    for (const direct of [0, 1]) {
        const r = raw(c); r.metrics[0].direct = direct;
        charge(r, direct ? 200 : 100); r.immediate[0].busy = direct ? 2 : 3; r.immediate[0].shen -= 3000;
        validateWudangUnarmedRecord(r, c);
        r.immediate[0].shen++; assert.throws(() => validateWudangUnarmedRecord(r, c));
    }
});

test('震山/玄功固定消耗且成功控制可为零，不误作拒绝', () => {
    for (const [skill, ability, fee] of [['zhenshan-zhang', 'da', 30], ['xuangong-quan', 'xuan', 100]]) {
        const c = by(skill, ability), r = raw(c); charge(r, fee); r.immediate[0].busy = 3;
        r.metrics[0].direct = 1; r.immediate[1].busy = 0;
        validateWudangUnarmedRecord(r, c);
        r.immediate[1].busy = 3; assert.throws(() => validateWudangUnarmedRecord(r, c));
    }
});

test('倚天四连击后归还增益；拒绝没有费用、弹药或正气损失', () => {
    const c = by('yitian-zhang', 'zheng'), r = raw(c); charge(r, 150); r.immediate[0].busy = 4;
    r.attacks = Array.from({ length: 4 }, () => ({ actor: 0, target: 1, type: 0 }));
    validateWudangUnarmedRecord(r, c); r.immediate[0].temp.apply = { attack: 1 };
    assert.throws(() => validateWudangUnarmedRecord(r, c));
    const blocked = by('furong-jinzhen', 'xian', '-low-neili'), rr = raw(blocked);
    validateWudangUnarmedRecord(rr, blocked); rr.immediate[0].ammunition--;
    assert.throws(() => validateWudangUnarmedRecord(rr, blocked));
});

test('芙蓉是一次创伤同步压低满气血，不是两次攻击；未命中也耗弹药', () => {
    for (const wound of [0, 120, 239]) {
        const c = by('furong-jinzhen', 'xian'), r = raw(c); charge(r, 100);
        r.immediate[0].busy = 2; r.immediate[0].ammunition = 9;
        r.metrics[1].qi_cost = r.metrics[1].eff_qi_cost = wound;
        r.immediate[1].qi -= wound; r.immediate[1].eff_qi -= wound;
        validateWudangUnarmedRecord(r, c);
        const e = wudangUnarmedEffects([{ outcome: 'observed', raw: r }]);
        assert.equal(e.ammunition_cost.mean, 1); assert.equal(e.shen_cost.mean, 0);
        assert.equal(e.wounded.successes, wound ? 1 : 0);
        r.immediate[0].ammunition = 10; assert.throws(() => validateWudangUnarmedRecord(r, c));
    }
});

test('未记录的正气和弹药保持未知，不把缺字段视为零费用', () => {
    const e = wudangUnarmedEffects([{ outcome: 'observed', raw: { before: [{}, {}], immediate: [{}, {}], metrics: [{}, {}], attacks: [] } }]);
    assert.equal(e.shen_cost.mean, null); assert.equal(e.shen_cost.unknown, 1);
    assert.equal(e.ammunition_cost.mean, null); assert.equal(e.ammunition_cost.unknown, 1);
});
