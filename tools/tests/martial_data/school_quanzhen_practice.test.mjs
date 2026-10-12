import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { practiceGain, quanzhenPracticeProfiles } from './school_quanzhen_practice_cases.mjs';
import { schoolPracticeEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog)
    .filter(c => ['huashan', 'quanzhen'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'quanzhen-practice');
const find = suffix => cases.find(c => c.id.endsWith(suffix));

test('全真练习及金锁136条件664样本，保留旧608条件35516样本', () => {
    assert.equal(cases.length, 136); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 664);
    assert.equal(cases.filter(c => c.method === 'practice').length, 125);
    const old = all.filter(c => !['quanzhen-practice', 'quanzhen-cultivation', 'quanzhen-auxiliary', 'quanzhen-study', 'quanzhen-recovery'].includes(c.parameters.collection_group));
    assert.equal(old.length, 608); assert.equal(old.reduce((n, c) => n + c.samples, 0), 35516);
    assert.equal(new Set(cases.map(c => c.id)).size, 136);
    assert.equal(quanzhenPracticeProfiles.length, 15);
    assert.ok(cases.every(c => c.parameters.qualification_sources.every(path => catalog.skills.some(s => s.path === path)
        || /^(cmds|feature|kungfu\/class)\//.test(path))));
});

test('三档进度及300/500断点按原整数算式，不解释为每秒养成速度', () => {
    assert.deepEqual([200, 400, 800].map(n => practiceGain(n, n + 1)), [12, 7, 3]);
    assert.deepEqual([299, 300, 499, 500].map(n => practiceGain(n, n + 1)), [13, 7, 7, 3]);
});

function row(c) {
    const p = c.parameters, profile = quanzhenPracticeProfiles.find(([s]) => s === p.skill);
    const before = [p.actor, p.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        learned: {}, learned_points: 0, force_attribute: 0, busy: config.busy ?? 0,
        weapon: config.equipment?.type ?? 'none', temp: {},
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        reason: p.expected === 'refused' ? '原命令拒绝' : '', launches: [], interfaces: [], attacks: [], metrics: [{}, {}] };
    if (c.method !== 'practice') return r;
    const after = r.immediate[0], completed = p.completed;
    after.learned[p.skill] = completed * practiceGain(p.level, before[0].skills[p.usage]);
    r.command_accepted = Number(completed === p.repetitions);
    after.qi -= completed * profile[4]; after.neili -= completed * profile[5];
    r.metrics[0].qi_cost = completed * profile[4]; r.metrics[0].neili_cost = completed * profile[5];
    if (p.skill === 'chongyang-shenzhang') after.force_attribute -= 55 * completed;
    return r;
}

test('练习包括中途资源不足，命令0仍保存实际进度与消耗', () => {
    for (const c of cases.filter(c => c.method === 'practice')) validateSchoolCombatRecord(row(c), c);
    const c = find('qixing-jian-practice-l200-partial'), r = row(c);
    assert.equal(r.command_accepted, 0); assert.equal(r.outcome, 'observed');
    assert.equal(r.immediate[0].learned['qixing-jian'], 24);
    r.immediate[0].learned['qixing-jian'] = 0;
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('原内功拒绝练习，飞渡无内力消耗，重阳错字段照实记录', () => {
    for (const skill of ['xiantian-gong', 'xuanmen-neigong', 'quanzhen-xinfa']) {
        const selected = cases.filter(c => c.parameters.skill === skill);
        assert.equal(selected.length, 3); assert.ok(selected.every(c => c.parameters.expected === 'refused'));
    }
    const c = find('chongyang-shenzhang-practice-l200-neili65-times50'), r = row(c);
    assert.equal(r.immediate[0].neili, 65); assert.equal(r.immediate[0].force_attribute, -2750);
    validateSchoolCombatRecord(r, c);
    r.immediate[0].neili--; assert.throws(() => validateSchoolCombatRecord(r, c));
    assert.equal(row(find('tianshan-feidu-practice-l200-neili0')).metrics[0].neili_cost, 0);
});

test('主动金锁随机失败不是资格拒绝；成功忙乱、失败忙乱及扣费分别核验', () => {
    for (const success of [false, true]) {
        const c = find('jinguan-yusuo-suo-l400'), r = row(c);
        r.launches.push({ skill: 'jinguan-yusuo' });
        r.immediate[0].busy = success ? 1 : 2; r.immediate[1].busy = success ? 25 : 0;
        r.immediate[0].neili -= success ? 100 : 50;
        validateSchoolCombatRecord(r, c);
        r.immediate[1].busy = 24; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const c = find('jinguan-yusuo-suo-l200'), r = row(c);
    r.launches.push({ skill: 'jinguan-yusuo' }); r.immediate[1].busy = 12;
    assert.throws(() => validateSchoolCombatRecord(r, c), '目标600基本招架，L200不可能锁住');
});

test('练习报告保留拒绝样本分母及部分完成，不用命令成功率替代进度', () => {
    const cs = ['qixing-jian-practice-l200', 'qixing-jian-practice-l200-low-qi', 'qixing-jian-practice-l200-partial'].map(find);
    const summary = schoolPracticeEffects(cs.map(c => ({ outcome: c.parameters.expected, raw: row(c) })), 'qixing-jian');
    assert.equal(summary.attempts, 3); assert.equal(summary.command_accepted, 1);
    assert.equal(summary.partial_progress, 1); assert.equal(summary.progress.mean, 12);
    assert.equal(summary.qi_cost.mean, 35);
});
