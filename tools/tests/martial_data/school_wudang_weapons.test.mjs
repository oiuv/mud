import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { validateWudangWeaponRecord, wudangWeaponMoves } from './school_wudang_weapons_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-weapons');
const by = (skill, ability, suffix = '') => cases.find(c => c.id === `school-wudang-weapons-${skill}-${ability}-l200${suffix}`);

test('武当其他兵器120条件4356样本；旧1794条件62700样本保持', () => {
    assert.equal(cases.length, 120); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4356);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 49);
    const old = all.filter(c => !['wudang-weapons', 'wudang-shenmen', 'wudang-unarmed', 'wudang-learning', 'wudang-cultivation', 'wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 1794); assert.equal(old.reduce((n, c) => n + c.samples, 0), 62700);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id), c.entry_id);
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    }
    assert.equal(schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'wudang-weapons')
        .reduce((n, c) => n + c.samples, 0), 240);
});

test('两仪无授招门槛，绕指柔剑沿用chuankong而非文件名', () => {
    assert.equal(by('liangyi-jian', 'ren', '-no-grant').parameters.expected, 'observed');
    assert.equal(by('liangyi-jian', 'ren').parameters.actor.properties['can_perform/liangyi-jian/ren'], undefined);
    assert.equal(by('raozhi-roujian', 'chuan').parameters.actor.properties['can_perform/raozhi-roujian/chuankong'], 1);
    const wrong = by('raozhi-roujian', 'chuan', '-wrong-grant-key').parameters;
    assert.equal(wrong.actor.properties['can_perform/raozhi-roujian/chuankong'], 0);
    assert.equal(wrong.actor.properties['can_perform/raozhi-roujian/chuan'], 1);
    assert.equal(wrong.expected, 'refused');
});

test('有效内功轻功与原始特殊武学门槛分别赋值，不把等级混算', () => {
    for (const m of wudangWeaponMoves) {
        assert.equal(by(m.skill, m.ability, '-low-skill').parameters.actor.skills[m.skill], m.minimum - 1);
        assert.equal(by(m.skill, m.ability, '-minimum-neili').parameters.actor.properties.neili, m.neili);
        for (const field of ['force', 'dodge']) if (m[field]) for (const [suffix, offset] of [['low', -1], ['minimum', 0]]) {
            const p = by(m.skill, m.ability, `-${suffix}-${field}`).parameters.actor;
            assert.equal(Math.trunc(p.skills[field] / 2) + p.skills[p.mappings[field]] - (field === 'dodge' ? 1 : 0), m[field] + offset);
        }
    }
    assert.equal(by('liangyi-jian', 'ren', '-low-max-neili').parameters.actor.properties.max_neili, 1499);
    assert.equal(by('shenmen-jian', 'ci', '-unarmed-target').parameters.target.equipment, undefined);
    assert.deepEqual(by('wudang-zhang', 'ordinary').parameters.actor.preparations, { strike: 'wudang-zhang' });
});

function raw(c) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        neili: 6000, max_neili: 6000, ...config.properties,
        preparations: config.preparations, weapon: config.equipment?.type ?? 'none', temp: {}, busy: config.busy ?? 0,
    }));
    return { outcome: c.parameters.expected, before, immediate: structuredClone(before),
        launches: c.parameters.expected === 'refused' || c.method === 'ordinary' ? [] : [{ skill: c.parameters.skill }],
        metrics: [{}, {}], attacks: [], dropped: [], reason: '原规则拒绝' };
}
function charge(r, amount) { r.metrics[0].neili_cost = amount; r.immediate[0].neili -= amount; }

test('四门直伤按原成功失败费用及忙乱核验，不以零伤害当未发动', () => {
    for (const [skill, ability, fail, success] of [
        ['wudang-jian', 'sheng', 20, 30], ['liangyi-jian', 'ren', 100, 180],
        ['raozhi-roujian', 'chuan', 60, 150], ['xuanxu-dao', 'huan', 60, 180],
    ]) for (const direct of [0, 1]) {
        const c = by(skill, ability), r = raw(c);
        r.metrics[0].direct = direct; charge(r, direct ? success : fail); r.immediate[0].busy = direct ? 2 : 3;
        validateWudangWeaponRecord(r, c);
        r.metrics[0].neili_cost++; assert.throws(() => validateWudangWeaponRecord(r, c));
    }
});

test('神门缴械与气血伤害分开，目标装备、地面物品和双方忙乱均核验', () => {
    const c = by('shenmen-jian', 'ci');
    for (const success of [false, true]) {
        const r = raw(c); charge(r, success ? 120 : 40); r.immediate[0].busy = 3;
        if (success) { r.immediate[1].weapon = 'none'; r.immediate[1].busy = 2; r.dropped = [{}]; }
        validateWudangWeaponRecord(r, c);
        r.metrics[1].qi_cost = 1; assert.throws(() => validateWudangWeaponRecord(r, c));
    }
});

test('柔云三次普攻与最终属性归还，拒绝路径不可残留费用或攻击', () => {
    const c = by('rouyun-jian', 'tao'), r = raw(c);
    charge(r, 150); r.immediate[0].busy = 2;
    r.attacks = Array.from({ length: 3 }, () => ({ actor: 0, target: 1, type: 0 }));
    validateWudangWeaponRecord(r, c);
    r.immediate[0].temp.apply = { attack: 1 }; assert.throws(() => validateWudangWeaponRecord(r, c));
    const refused = by('rouyun-jian', 'tao', '-low-neili'), rr = raw(refused);
    validateWudangWeaponRecord(rr, refused); rr.attacks = [{}];
    assert.throws(() => validateWudangWeaponRecord(rr, refused));
});
