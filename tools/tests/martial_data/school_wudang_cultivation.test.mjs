import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangForces, wudangForceBonus, wudangForceCapacity, wudangResearchBound, wudangCultivationInterface } from './school_wudang_cultivation_cases.mjs';
import { schoolCultivationEffects, schoolAuxiliaryEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = preOctober29SchoolConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-cultivation');
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('武当修养241条件4892样本，既有2465条件75312样本不变', () => {
    assert.equal(cases.length, 241); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4892);
    assert.equal(cases.filter(c => c.method === 'research').length, 79);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 65);
    const old = all.filter(c => !['wudang-cultivation', 'wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 2465); assert.equal(old.reduce((n, c) => n + c.samples, 0), 75312);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.equal(preOctober29SchoolConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'wudang-cultivation').reduce((n, c) => n + c.samples, 0), 482);
    for (const c of cases) for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
});

function row(c) {
    const p = c.parameters, before = [p.actor, p.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        learned: {}, weapon: 'none', temp: {}, busy: config.busy ?? 0,
        cultivation: Object.fromEntries(['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/guimai',
            'special_skill/wuxing', 'class', 'family/family_name', 'wudang-jiuyang'].map(k => [k, config.properties[k] ?? null])),
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原接口提示',
        attacks: [], launches: [], interfaces: [], command_accepted: p.command_return, metrics: [{}, {}] };
    if (c.method === 'research') {
        const a = r.immediate[0]; a.learned_points += p.completed;
        a.jing = p.clear_jing ? 0 : a.jing - p.completed * Math.trunc(1000 / a.int);
        if (p.completed) a.learned[p.skill] = p.completed;
    } else r.interfaces.push({ ...p.interface, result: wudangCultivationInterface(p) });
    return r;
}

test('全部条件校验状态守恒，原查询值与研究增长分开', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    const c = find('taiji-shengong-valid_learn-l100-taoism99'), r = row(c);
    r.immediate[0].temp.notify_fail = '道学不足'; validateSchoolCombatRecord(r, c);
    r.immediate[0].max_neili++; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('内力额外增量与总上限，兼修取最大而非求和', () => {
    assert.deepEqual([200, 400, 800].map(l => wudangForceBonus('wudang-jiuyang', l)), [450, 1800, 7200]);
    assert.deepEqual([200, 400, 800].map(l => wudangForceBonus('taiji-shengong', l)), [540, 2160, 8640]);
    for (const [mapping, expected] of [['wudang-xinfa', 6000], ['wudang-jiuyang', 7800], ['taiji-shengong', 8160], ['unmapped', 2000]]) {
        const actor = find('taiji-shengong-query_current_neili_limit-l400-all-' + mapping).parameters.actor;
        assert.equal(wudangForceCapacity(actor, true), expected); assert.equal(wudangForceCapacity(actor, false), 8160);
    }
    assert.equal(wudangForceCapacity(find('wudang-xinfa-query_neili_limit-l201').parameters.actor, false), 3010);
});

test('同级研究500分段、兼修与随机上界，不按固定结果模拟游戏', () => {
    for (const skill of wudangForces) {
        assert.deepEqual([200, 400, 800].map(l => wudangResearchBound(find(`${skill}-research-l${l}`).parameters)), [11, 12, 11]);
        assert.deepEqual([200, 400, 800].map(l => wudangResearchBound(find(`${skill}-research-l${l}-all-forces`).parameters)), [19, 21, 16]);
    }
    assert.equal(wudangResearchBound(find('wudang-jiuyang-research-l200-huashan-known').parameters), 17);
});

test('武当九阳无性条件保留真实错误：技能与同名属性分别留证', () => {
    for (const level of [9, 10, 200, 800]) assert.equal(find(`wudang-jiuyang-valid_learn-l${level}-eunuch-no-attribute`).parameters.expected, 'observed');
    for (const ability of ['valid_learn', 'research']) {
        assert.equal(find(`wudang-jiuyang-${ability}-l200-eunuch-attribute9`).parameters.expected, 'observed');
        assert.equal(find(`wudang-jiuyang-${ability}-l200-eunuch-attribute10`).parameters.expected, 'refused');
    }
    const c = find('wudang-jiuyang-valid_learn-l200-eunuch-attribute10'), r = row(c);
    r.before[0].cultivation['wudang-jiuyang'] = 0; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('知识不可研究、药理无320豁免，与道学门槛分开', () => {
    for (const skill of ['taoism', 'wudang-yaoli']) for (const l of [200, 400, 800]) {
        assert.equal(find(`${skill}-research-l${l}`).parameters.expected, 'refused');
        assert.equal(wudangCultivationInterface(find(`${skill}-valid_learn_level-l${l}`).parameters), 999);
    }
    assert.equal(find('taiji-shengong-valid_learn-l800-taoism320').parameters.expected, 'observed');
    assert.equal(find('wudang-yaoli-valid_learn-l400-medical320').parameters.expected, 'refused');
    for (const skill of ['taiji-shengong', 'taoism']) assert.equal(find(`${skill}-valid_learn-l20-eunuch`).parameters.expected, 'refused');
});

test('研究返回1但零进度，以及部分进度时真实资源消耗', () => {
    const cs = ['wudang-xinfa-research-l200', 'wudang-xinfa-research-l200-jing26', 'wudang-xinfa-research-l200-partial'].map(find);
    const s = schoolCultivationEffects(cs.map(c => ({ outcome: c.parameters.expected, raw: row(c) })), 'wudang-xinfa');
    assert.equal(s.attempts, 3); assert.equal(s.command_accepted, 3); assert.equal(s.potential_used.mean, 1);
    assert.equal(s.jing_cost.mean, 113 / 3); assert.equal(s.neili_cost.mean, 0);
    const c = cs[2], r = row(c); r.immediate[0].learned_points = 3; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('文本类型保留原文；缺失返回不是已证实零值', () => {
    const c = find('taoism-type-l200'), r = row(c);
    const s = schoolAuxiliaryEffects([{ outcome: 'observed', raw: r }]);
    assert.deepEqual(s.interface_texts, { knowledge: 1 }); assert.equal(s.interface_numbers.n, 0);
    delete r.interfaces[0].result; assert.throws(() => validateSchoolCombatRecord(r, c));
});
