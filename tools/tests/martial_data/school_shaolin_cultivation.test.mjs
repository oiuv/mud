import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinForces, shaolinCultivationFields, shaolinForceBonus, shaolinForceCapacity,
    shaolinResearchBound, shaolinCultivationInterface } from './school_shaolin_cultivation_cases.mjs';
import { schoolCultivationEffects, schoolAuxiliaryEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = preOctober29SchoolConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'shaolin-cultivation');
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('少林修养305条件6784样本；旧6050条件140120计划样本不变', () => {
    assert.equal(cases.length, 305); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 6784);
    assert.equal(cases.filter(c => c.method === 'research').length, 109);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 81);
    const old = all.filter(c => !['shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 6050); assert.equal(old.reduce((n, c) => n + c.samples, 0), 140120);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.equal(preOctober29SchoolConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'shaolin-cultivation').reduce((n, c) => n + c.samples, 0), 368);
    for (const c of cases) for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
});

function row(c) {
    const p = c.parameters, before = [p.actor, p.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        learned: {}, weapon: 'none', temp: {}, busy: config.busy ?? 0, userp: 1, wizardp: 0,
        cultivation: Object.fromEntries(shaolinCultivationFields.map(k => [k, config.properties[k] ?? null])),
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原接口提示',
        attacks: [], launches: [], interfaces: [], command_accepted: p.command_return, metrics: [{}, {}] };
    if (c.method === 'research') {
        const a = r.immediate[0]; a.learned_points += p.completed;
        a.jing = p.clear_jing ? 0 : a.jing - p.completed * Math.trunc(1000 / a.int);
        if (p.completed) a.learned[p.skill] = p.completed;
    } else r.interfaces.push({ ...p.interface, result: shaolinCultivationInterface(p) });
    return r;
}

test('所有配置独立验证、非巫师身份、原技能映射与状态守恒', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    const c = find('hunyuan-yiqi-valid_learn-l400-buddhism299'), r = row(c);
    r.immediate[0].temp.notify_fail = '禅宗不足'; validateSchoolCombatRecord(r, c);
    r.immediate[0].max_neili++; assert.throws(() => validateSchoolCombatRecord(r, c));
    const other = row(c); other.before[0].wizardp = 1; assert.throws(() => validateSchoolCombatRecord(other, c));
});

test('四内功上限与sex的区别：查询不扣除当前最大内力', () => {
    for (const skill of ['hunyuan-yiqi', 'yijinjing']) assert.deepEqual([200, 400, 800].map(l => shaolinForceBonus(skill, l)), [630, 2520, 10080]);
    assert.deepEqual([200, 400, 800].map(l => shaolinForceBonus('shaolin-jiuyang', l)), [450, 1800, 7200]);
    assert.equal(shaolinForceBonus('hunyuan-yiqi', 800, { sex: 1 }), 0);
    for (const [mapping, expected] of [['shaolin-xinfa', 6000], ['hunyuan-yiqi', 8520], ['yijinjing', 8520], ['shaolin-jiuyang', 7800], ['unmapped', 2000]]) {
        const actor = find('yijinjing-query_current_neili_limit-l400-all-' + mapping).parameters.actor;
        assert.equal(shaolinForceCapacity(actor, true), expected); assert.equal(shaolinForceCapacity(actor, false), 8520);
    }
    assert.equal(shaolinForceCapacity(find('yijinjing-query_neili_limit-l400-combined').parameters.actor, false), 16209);
    assert.equal(shaolinForceCapacity(find('yijinjing-query_neili_limit-l400-bonze').parameters.actor, false), 9020);
    assert.equal(shaolinForceCapacity(find('yijinjing-query_neili_limit-l400-bonze-other-family').parameters.actor, false), 8520);
    assert.equal(shaolinForceCapacity(find('shaolin-xinfa-query_neili_limit-l201').parameters.actor, false), 3010);
});

test('研究按原相关内功、500级分段和随机上界，四门兼修不叠加内力容量', () => {
    for (const skill of shaolinForces) {
        assert.deepEqual([200, 400, 800].map(l => shaolinResearchBound(find(`${skill}-research-l${l}`).parameters)), [11, 12, 11]);
        assert.deepEqual([200, 400, 800].map(l => shaolinResearchBound(find(`${skill}-research-l${l}-all-forces`).parameters)), [21, 23, 17]);
    }
    assert.equal(shaolinResearchBound(find('shaolin-jiuyang-research-l200-huashan-known').parameters), 17);
});

test('少林九阳无性限制错读普通属性，配置和实测快照必须能区分', () => {
    for (const level of [9, 10, 200, 800]) assert.equal(find(`shaolin-jiuyang-valid_learn-l${level}-eunuch-no-attribute`).parameters.expected, 'observed');
    for (const ability of ['valid_learn', 'research']) {
        assert.equal(find(`shaolin-jiuyang-${ability}-l200-eunuch-attribute9`).parameters.expected, 'observed');
        assert.equal(find(`shaolin-jiuyang-${ability}-l200-eunuch-attribute10`).parameters.expected, 'refused');
    }
    const c = find('shaolin-jiuyang-valid_learn-l200-eunuch-attribute10'), r = row(c);
    r.before[0].cultivation['shaolin-jiuyang'] = 0; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('混元300禅宗豁免、婚配与sex、易筋经基本功和禅宗犯戒分别保留', () => {
    assert.equal(find('hunyuan-yiqi-valid_learn-l400-buddhism299').parameters.expected, 'refused');
    assert.equal(find('hunyuan-yiqi-valid_learn-l800-buddhism300').parameters.expected, 'observed');
    assert.equal(find('hunyuan-yiqi-research-l200-married').parameters.expected, 'refused');
    assert.equal(find('hunyuan-yiqi-research-l200-sex').parameters.expected, 'observed');
    assert.equal(find('yijinjing-research-l200-force199').parameters.expected, 'refused');
    assert.equal(find('buddhism-valid_learn-l200-guilty1').parameters.expected, 'refused');
    for (const l of [200, 400, 800]) assert.equal(find(`buddhism-research-l${l}`).parameters.expected, 'refused');
    for (const c of cases.filter(c => c.parameters.ability === 'practice_skill')) assert.equal(c.parameters.expected, 'refused');
});

test('研究受理但零进度、部分完成清精神、完整完成账本不混淆', () => {
    const cs = ['shaolin-xinfa-research-l200', 'shaolin-xinfa-research-l200-jing26', 'shaolin-xinfa-research-l200-partial'].map(find);
    const s = schoolCultivationEffects(cs.map(c => ({ outcome: c.parameters.expected, raw: row(c) })), 'shaolin-xinfa');
    assert.equal(s.attempts, 3); assert.equal(s.command_accepted, 3); assert.equal(s.potential_used.mean, 1);
    assert.equal(s.jing_cost.mean, 113 / 3); assert.equal(s.neili_cost.mean, 0);
    const c = cs[2], r = row(c); r.immediate[0].learned_points = 3; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('查询返回文本保留，缺字段、越界增长和错误技能初态都不能通过', () => {
    const c = find('buddhism-type-l200'), r = row(c);
    assert.deepEqual(schoolAuxiliaryEffects([{ outcome: 'observed', raw: r }]).interface_texts, { knowledge: 1 });
    delete r.interfaces[0].result; assert.throws(() => validateSchoolCombatRecord(r, c));
    const research = find('yijinjing-research-l200'), rr = row(research);
    rr.immediate[0].learned.yijinjing = 999; assert.throws(() => validateSchoolCombatRecord(rr, research));
    const bad = row(research); bad.before[0].skills.force--; assert.throws(() => validateSchoolCombatRecord(bad, research));
});
