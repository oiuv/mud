import { preOctober29Conditions } from './historical_school_conditions.mjs';
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

test('全真原136条件664样本保留，新增三档金锁自然解除6条', () => {
    const oldCases = cases.filter(c => !c.parameters.target_busy_lifecycle);
    assert.equal(oldCases.length, 136); assert.equal(oldCases.reduce((n, c) => n + c.samples, 0), 664);
    assert.equal(cases.length, 139); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 670);
    assert.equal(cases.filter(c => c.method === 'practice').length, 125);
    const old = preOctober29Conditions(all).filter(c => !['quanzhen-practice', 'quanzhen-cultivation', 'quanzhen-auxiliary', 'quanzhen-study', 'quanzhen-recovery', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    const legacy = old.filter(c => !c.id.startsWith('school-quanzhen-boundary-'));
    assert.equal(legacy.length, 608); assert.equal(legacy.reduce((n, c) => n + c.samples, 0), 35516);
    assert.equal(new Set(cases.map(c => c.id)).size, 139);
    assert.equal(quanzhenPracticeProfiles.length, 15);
    assert.ok(cases.every(c => c.parameters.qualification_sources.every(path => catalog.skills.some(s => s.path === path)
        || /^(cmds|feature|kungfu\/class|inherit\/char|mudcore\/inherit)\//.test(path))));
});

function lifecycleRow(c, success = true) {
    const r = row(c), p = c.parameters;
    r.elapsed = success ? Math.trunc(p.level / 16) * 2 : 0.01;
    r.launches.push({ skill: 'jinguan-yusuo', argument: 'suo' });
    r.immediate[0].busy = success ? 1 : 2;
    r.immediate[0].neili -= success ? 100 : 50;
    r.immediate[1].busy = success ? Math.trunc(p.level / 16) : 0;
    r.busy_terminal = success ? 'released' : 'not_applied';
    r.busy_heartbeats = [];
    r.after = structuredClone(r.immediate);
    for (let i = 0; i < r.immediate[1].busy; i++) {
        const before = structuredClone(r.after[1]), after = structuredClone(before);
        after.busy--;
        r.busy_heartbeats.push({ side: 1, driver_heartbeat: 1, before, after,
            elapsed_before: i * 2 + 1.9, elapsed: (i + 1) * 2 });
        r.after[1] = after;
    }
    r.metrics[1].heartbeats = r.busy_heartbeats.length;
    return r;
}

test('金锁自然解除只计真实逐跳链，落空不冒充解除', () => {
    const lifecycle = cases.filter(c => c.parameters.target_busy_lifecycle);
    assert.deepEqual(lifecycle.map(c => c.parameters.level), [200, 400, 800]);
    for (const c of lifecycle) {
        assert.equal(c.samples, 2); assert.equal(c.parameters.target.skills.parry, 0);
        validateSchoolCombatRecord(lifecycleRow(c), c);
        validateSchoolCombatRecord(lifecycleRow(c, false), c);
    }
    const c = lifecycle[0], valid = lifecycleRow(c);
    for (const mutate of [
        r => r.busy_heartbeats.pop(),
        r => { r.busy_heartbeats[0].after.busy = 0; },
        r => { r.busy_heartbeats[1].before.busy--; },
        r => { r.busy_heartbeats[0].driver_heartbeat = 0; },
        r => { r.metrics[0].heartbeats = 1; },
        r => { r.launches[0].argument = 'other'; },
        r => { r.busy_terminal = 'watchdog'; },
        r => { r.after[0].neili++; },
        r => { r.after[1].busy = 1; },
    ]) {
        const bad = structuredClone(valid); mutate(bad);
        assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
    const missed = lifecycleRow(c, false); missed.busy_terminal = 'released';
    assert.throws(() => validateSchoolCombatRecord(missed, c));
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
