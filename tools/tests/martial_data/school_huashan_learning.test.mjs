import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { learnedGain } from './school_huashan_learning_cases.mjs';
import { schoolLearningEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const all = schoolCombatConditions(catalog).filter(c => c.parameters.school === 'huashan');
const cases = all.filter(c => c.parameters.collection_group === 'huashan-learning');
const find = suffix => cases.find(c => c.id.endsWith(suffix));

test('学习条件独立前缀，三档命令采样与边界/查询检查分开', () => {
    assert.equal(cases.length, 39);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 960);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 18);
    assert.equal(cases.filter(c => c.samples === 100).length, 9);
    const previous = all.filter(c => !['huashan-learning', 'huashan-defense', 'huashan-upgrade'].includes(c.parameters.collection_group));
    assert.equal(previous.length, 144);
    assert.equal(previous.reduce((n, c) => n + c.samples, 0), 11460);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    assert.ok(cases.every(c => entries.has(c.entry_id)));
    assert.ok(cases.every(c => c.parameters.observe_seconds === 0));
});

test('无招研究只改变玩家许可；学习根骨和身法保留任一达标即可的原条件', () => {
    for (const level of [200, 400, 800]) {
        const base = find(`research-l${level}`), nothing = find(`research-l${level}-nothing`);
        const actor = structuredClone(nothing.parameters.actor);
        actor.properties['can_learn/dugu-jiujian/nothing'] = 0;
        assert.deepEqual(actor, base.parameters.actor);
    }
    for (const [suffix, expected] of [['nothing-con35-dex35', 'refused'],
        ['nothing-con36-dex35', 'observed'], ['nothing-con35-dex36', 'observed']])
        assert.equal(find(suffix).parameters.expected, expected);
});

function row(c) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        learned: {}, effective_skills: { 'dugu-jiujian': (config.skills['dugu-jiujian'] ?? 0) / 2 },
        nothing: config.properties['can_learn/dugu-jiujian/nothing'] ?? 0,
        weapon: config.equipment?.type ?? 'none', temp: {}, busy: 0,
    }));
    return { outcome: c.parameters.expected, before, immediate: structuredClone(before),
        launches: [], interfaces: [], reason: '', metrics: [{}, {}] };
}

test('不足精神仍学到进度的观察保留，不用夹具修复游戏判定', () => {
    for (const suffix of ['jue-l200', 'jue-l200-jing40', 'jue-l200-jing0', 'jue-l200-jing41']) {
        const c = find(suffix), raw = row(c), actor = raw.immediate[0];
        const gain = learnedGain(10, 200, 200);
        actor.neili -= 50;
        actor.jing = actor.jing >= 41 ? actor.jing - 41 : -1;
        actor.learned = { sword: gain, 'dugu-jiujian': gain + learnedGain(1, 200, 200) };
        raw.launches = [{ skill: 'dugu-jiujian' }];
        validateSchoolCombatRecord(raw, c);
        const noBonus = structuredClone(raw); noBonus.immediate[0].learned['dugu-jiujian'] = gain;
        validateSchoolCombatRecord(noBonus, c);
        const noProgress = structuredClone(raw); noProgress.immediate[0].learned = {};
        assert.throws(() => validateSchoolCombatRecord(noProgress, c));
        const wrong = structuredClone(raw); wrong.immediate[0].jing--;
        assert.throws(() => validateSchoolCombatRecord(wrong, c));
    }
});

test('研究须有潜能和进度证据，命令受理不代替效果；不将每次学习进度当整级', () => {
    const c = find('research-l200'), raw = row(c), actor = raw.immediate[0];
    actor.jing -= 25; actor.learned_points = 1; actor.learned = { 'dugu-jiujian': 1 };
    validateSchoolCombatRecord(raw, c);
    for (const mutate of [r => { r.immediate[0].learned_points = 0; },
        r => { r.immediate[0].learned = {}; }, r => { r.immediate[0].skills['dugu-jiujian']++; }]) {
        const bad = structuredClone(raw); mutate(bad);
        assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
    const denied = find('research-l200-jing24'), refusal = row(denied);
    refusal.immediate[0].jing = 0; refusal.command_accepted = 1; refusal.reason = '研究未完成';
    validateSchoolCombatRecord(refusal, denied);
    refusal.immediate[0].learned['dugu-jiujian'] = 1;
    assert.throws(() => validateSchoolCombatRecord(refusal, denied));
});

test('难度查询实际返回600，区别于修正后可能的1000；查询不得变更角色', () => {
    for (const suffix of ['difficult_level-l200-normal', 'difficult_level-l200-nothing']) {
        const c = find(suffix), raw = row(c);
        raw.interfaces = [{ object: '/kungfu/skill/dugu-jiujian', function: 'difficult_level', result: 600 }];
        validateSchoolCombatRecord(raw, c);
        raw.interfaces[0].result = 1000;
        assert.throws(() => validateSchoolCombatRecord(raw, c));
    }
});

test('原notify_fail只允许改变拒绝提示，不掩盖资源或进度变化', () => {
    const c = find('valid_learn-l200-int38'), raw = row(c);
    raw.interfaces = [{ object: '/kungfu/skill/dugu-jiujian', function: 'valid_learn', result: 0 }];
    raw.reason = '天资不足'; raw.immediate[0].temp.notify_fail = '天资不足';
    validateSchoolCombatRecord(raw, c);
    raw.immediate[0].neili--;
    assert.throws(() => validateSchoolCombatRecord(raw, c));
});

test('学习统计保留拒绝和实际进度，未查询难度不填零', () => {
    const c = find('research-l200-jing24'), raw = row(c);
    raw.immediate[0].jing = 0;
    const stats = schoolLearningEffects([{ outcome: 'refused', raw }]);
    assert.equal(stats.attempts, 1);
    assert.equal(stats.remaining_jing.mean, 0);
    assert.equal(stats.skill_progress.mean, 0);
    assert.equal(stats.difficulty.mean, null);
});
