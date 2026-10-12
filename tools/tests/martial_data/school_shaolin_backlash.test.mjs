import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinBacklashConditions, shaolinBacklashExpected, shaolinBacklashEffects, backlashMessages } from './school_shaolin_backlash_cases.mjs';
import { recoveryExpected } from './school_quanzhen_recovery_cases.mjs';
import { shaolinForceCapacity } from './school_shaolin_cultivation_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'shaolin-backlash');
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('少林反噬272条件10344样本，原6623条件150380样本不变', () => {
    assert.equal(cases.length, 272); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 10344);
    assert.equal(shaolinBacklashConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 272);
    const old = all.filter(c => !['shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 6623); assert.equal(old.reduce((n, c) => n + c.samples, 0), 150380);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
});

test('负担逐项整数运算，佛学不是直接整体除25，已掌握不等于已映射', () => {
    const e = suffix => shaolinBacklashExpected(find(suffix).parameters.actor);
    assert.equal(e('interface-martial99').burden, 9702);
    assert.equal(e('interface-martial99').branch, 'below-threshold');
    assert.equal(e('interface-martial100').burden, 10000);
    assert.equal(e('interface-two99').burden, 19404);
    assert.equal(e('interface-m200-b107').capacity, 73348);
    assert.deepEqual(e('interface-mapped'), e('interface-m200-b106'));
    assert.deepEqual(e('interface-unrelated-high'), e('interface-m200-b121'));
    for (const [b, branch] of [[106,'severe'],[107,'mild'],[110,'mild'],[111,'hot'],[113,'hot'],[114,'uneasy'],[120,'uneasy'],[121,'clear']])
        assert.equal(e('interface-m200-b' + b).branch, branch);
});

test('转世和门派阈值逐边界核验，breakup不代替reborn', () => {
    for (const [tag, exempt] of [['reborn-shaolin199',false],['reborn-shaolin200',true],['reborn-other299',false],['reborn-other300',true],
        ['shaolin399',false],['shaolin400',true],['other499',false],['other500',true],['breakup-not-reborn',false]]) {
        const e = find('interface-' + tag).parameters.backlash;
        assert.equal(e.exempt, exempt); assert.equal(e.blocks, !exempt);
    }
});

function row(c) {
    const p = c.parameters, e = p.backlash;
    const before = [p.actor, p.target].map(config => ({ ...config.properties,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings), weapon: 'none',
        temp: structuredClone(config.temp ?? {}), busy: config.busy ?? 0, userp: 1, wizardp: 0,
        cultivation: { reborn: config.properties.reborn ?? 0, 'family/family_name': config.properties['family/family_name'] } }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected, reason: '',
        launches: [], attacks: [], interfaces: [], command_accepted: Number(p.expected === 'observed'), metrics: [{}, {}],
        backlash_messages: !p.precheck && backlashMessages[e.branch] ? [backlashMessages[e.branch]] : [] };
    if (c.method === 'interface') r.interfaces.push({ ...p.interface, implemented_by: '/inherit/skill/force', result: Number(e.blocks) });
    if (p.expected === 'refused') r.immediate[0].temp.notify_fail = '原命令拒绝提示';
    if (!p.precheck && e.blocks) {
        for (const [k, value] of Object.entries(e.branch === 'severe' ? { qi: 500, jing: 250 } : { qi: 300, jing: 150 })) {
            r.immediate[0][k] -= value; r.metrics[0][k + '_cost'] = value;
        }
    } else if (c.method === 'exert' && p.expected === 'observed') {
        const recovery = recoveryExpected(p, before[0]);
        r.immediate[0][recovery.key] += recovery.heal; r.immediate[0].neili -= recovery.cost;
        r.immediate[0].busy = recovery.busy; r.metrics[0].neili_cost = recovery.cost;
        r.metrics[0][recovery.key + '_recovery'] = recovery.heal; r.launches.push({ skill: 'force' });
    }
    r.after = structuredClone(r.immediate); return r;
}

test('接口原返回1仍为正常观察，命令拒绝允许且必须记录既成自伤', () => {
    for (const c of cases.filter(c => c.method !== 'exercise' || c.parameters.expected === 'refused'))
        validateSchoolCombatRecord(row(c), c);
    const c = find('recover-b106'), r = row(c);
    assert.equal(r.outcome, 'refused'); assert.equal(r.metrics[0].qi_cost, 500);
    r.immediate[0].qi = r.before[0].qi; r.after = structuredClone(r.immediate);
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('原命令前置拒绝不调用反噬，无内力却在反噬检查之后拒绝', () => {
    for (const c of cases.filter(c => c.parameters.precheck)) {
        const r = row(c); validateSchoolCombatRecord(r, c);
        const after = structuredClone(r.after); delete after[0].temp.notify_fail; assert.deepEqual(after, r.before);
    }
    const c = find('recover-neili0-before-backlash'), r = row(c);
    validateSchoolCombatRecord(r, c); assert.equal(r.after[0].neili, 0); assert.ok(r.after[0].qi < r.before[0].qi);
    const noExert = find('recover-no-exert'), noExertRow = row(noExert);
    noExertRow.backlash_messages.push('你此时内息一阵紊乱，不能运功。');
    validateSchoolCombatRecord(noExertRow, noExert);
});

function exerciseRow(c) {
    const r = row(c), p = c.parameters;
    r.immediate[0].temp = { pending: { exercise: 1 }, exercise_cost: 10 }; r.immediate[0].busy = '<function>';
    const x = structuredClone(r.immediate[0]), y = structuredClone(x), limit = shaolinForceCapacity(p.actor, true);
    x.effective_skills = { force: 300 }; y.effective_skills = { force: 300 };
    y.qi -= 10; y.neili += 10; y.temp = { pending: { exercise: 0 }, exercise_cost: 0 }; y.busy = 0;
    r.metrics[0] = { qi_cost: 10, neili_recovery: 10 };
    r.exercise_steps = [{ phase: 'before', elapsed: 1, state: x, limit }, { phase: 'after', elapsed: 1, state: y, limit }];
    r.after = [y, structuredClone(r.before[1])]; r.exercise_terminal = 'completed'; return r;
}

test('不阻止分支仍须完成原心跳，打坐转换不能记为走火伤害', () => {
    for (const c of cases.filter(c => c.method === 'exercise' && c.parameters.expected === 'observed')) {
        const r = exerciseRow(c); validateSchoolCombatRecord(r, c);
        const e = shaolinBacklashEffects([{ outcome: r.outcome, raw: r }]);
        assert.equal(e.damaged, 0); assert.equal(e.damage.qi.mean, null);
        r.exercise_steps = []; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('身份、映射、实际提示和继承实现不能被预期公式替代', () => {
    const c = find('interface-m200-b107');
    for (const mutate of [r => r.before[0].userp = 0, r => r.before[0].wizardp = 1,
        r => r.after[0].mappings.force = 'other', r => r.backlash_messages = [],
        r => r.interfaces[0].result = 0, r => r.interfaces[0].implemented_by = '/tests/fake.c',
        r => r.after[0].eff_qi--]) {
        const r = row(c); mutate(r); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.match(runner, /call_other\(spec\["object"\], "do_effect", players\[0\]\)/);
    assert.match(runner, /players\[0\]->force_me\(action\)/);
});

test('拒绝样本保留自伤分布与提示，报告不把返回1列作恢复成功', () => {
    const c = find('recover-b107'), r = row(c), e = shaolinBacklashEffects([{ outcome: r.outcome, raw: r }]);
    assert.equal(e.damaged, 1); assert.equal(e.damage.qi.mean, 300); assert.equal(e.messages.mild, 1);
    const md = schoolCombatMarkdown({ fingerprint: 'test', evidence_sha256: 'test',
        totals: { conditions: 1, samples: 1, observed: 0, refused: 1 },
        conditions: [{ ...c, counts: { observed: 0, refused: 1 }, shaolin_backlash: e,
            effects: { callback_start_seconds: { mean: null }, target_callback_start_seconds: { mean: null } } }] });
    assert.match(md, /少林佛学与运功反噬/); assert.match(md, /不是恢复成功/); assert.match(md, /300\.00\/150\.00/);
});
