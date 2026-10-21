import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangRecoveryConditions } from './school_wudang_recovery_cases.mjs';
import { wudangForces, wudangForceCapacity } from './school_wudang_cultivation_cases.mjs';
import { recoveryExpected } from './school_quanzhen_recovery_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-recovery');
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('武当恢复153条件2070样本，原3176条件86534样本保持', () => {
    assert.equal(cases.length, 153); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2070);
    assert.equal(cases.filter(c => c.method === 'exercise').length, 63);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 45);
    assert.equal(wudangRecoveryConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 153);
    const old = all.filter(c => !['wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 3176); assert.equal(old.reduce((n, c) => n + c.samples, 0), 86534);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        assert.equal(c.parameters.actor.properties['family/family_name'], '武当派');
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        assert.ok(!c.parameters.qualification_sources.some(p => p.includes('/quanzhen/')));
    }
});

function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties, skills: structuredClone(config.skills),
        mappings: structuredClone(config.mappings), learned: {}, weapon: 'none', temp: {}, busy: config.busy ?? 0 }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原命令拒绝',
        launches: [], attacks: [], interfaces: [], command_accepted: Number(p.expected === 'observed'), metrics: [{}, {}] };
    const e = recoveryExpected(p, before[0]);
    r.immediate[0][e.key] += e.heal; r.immediate[0].neili -= e.cost; r.immediate[0].busy = e.busy;
    r.metrics[0].neili_cost = e.cost;
    if (r.command_accepted) r.launches.push({ skill: 'force' });
    r.after = structuredClone(r.immediate);
    return r;
}

test('三门内功同等有效等级共享恢复费用，不能虚构专属收益', () => {
    for (const c of cases.filter(c => c.method === 'exert')) validateSchoolCombatRecord(row(c), c);
    for (const skill of wudangForces) for (const [level, cost, jingCost] of [[200, 1666, 1000], [400, 833, 500], [800, 416, 250]]) {
        assert.equal(recoveryExpected(find(`${skill}-recover-l${level}`).parameters, find(`${skill}-recover-l${level}`).parameters.actor.properties).cost, cost);
        assert.equal(recoveryExpected(find(`${skill}-regenerate-l${level}`).parameters, find(`${skill}-regenerate-l${level}`).parameters.actor.properties).cost, jingCost);
    }
    const c = find('recover-l200'), r = row(c); r.launches[0].skill = c.parameters.skill;
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('费用、部分恢复与战斗忙乱仍按两个原函数分别验证', () => {
    for (const [suffix, cost, heal, busy] of [
        ['recover-l200-partial', 100, 300, 0], ['regenerate-l200-partial', 100, 500, 0],
        ['recover-l200-both', 816, 5000, 0], ['regenerate-l200-both', 700, 5000, 0],
        ['recover-l200-fighting-self', 1166, 5000, 0], ['regenerate-l200-fighting-self', 1000, 5000, 1],
    ]) {
        const c = find(suffix), e = recoveryExpected(c.parameters, c.parameters.actor.properties);
        assert.deepEqual([e.cost, e.heal, e.busy], [cost, heal, busy]);
        const bad = row(c); bad.after[0].neili++; assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
});

function exerciseRow(c) {
    const p = c.parameters, r = row(find(`${p.skill}-recover-l200-gap9`));
    r.before = [p.actor, p.target].map(config => ({ ...config.properties, skills: structuredClone(config.skills),
        mappings: structuredClone(config.mappings), weapon: 'none', temp: {}, busy: 0 }));
    r.outcome = 'observed'; r.command_accepted = 1; r.reason = ''; r.launches = [];
    r.immediate = structuredClone(r.before);
    r.immediate[0].temp = { pending: { exercise: 1 }, exercise_cost: p.exercise_cost };
    r.immediate[0].busy = '<function>';
    const x = structuredClone(r.immediate[0]); x.effective_skills = { force: p.level * 1.5 };
    const limit = wudangForceCapacity(p.actor, true), y = structuredClone(x);
    y.qi -= p.exercise_cost; y.neili += p.exercise_cost;
    if (y.neili >= y.max_neili * 2) { if (y.max_neili < limit) y.max_neili++; y.neili = y.max_neili; }
    y.temp = { pending: { exercise: 0 }, exercise_cost: 0 }; y.busy = 0;
    r.exercise_steps = [{ phase: 'before', elapsed: 1, state: x, limit }, { phase: 'after', elapsed: 1, state: y, limit }];
    r.after = [y, structuredClone(r.before[1])]; r.exercise_terminal = 'completed';
    return r;
}

test('三门内功按各自原上限选临界值，不能误套全真上限', () => {
    for (const [skill, cap] of [['wudang-xinfa', 3000], ['wudang-jiuyang', 3450], ['taiji-shengong', 3540]]) {
        for (const [suffix, offset] of [['below-cap', -1], ['at-cap', 0], ['above-cap', 1]]) {
            const c = find(`${skill}-exercise-l200-${suffix}`), r = exerciseRow(c);
            assert.equal(c.parameters.actor.properties.max_neili, cap + offset);
            assert.equal(c.parameters.actor.properties.neili, (cap + offset) * 2 - 10);
            validateSchoolCombatRecord(r, c);
            assert.equal(r.after[0].max_neili - r.before[0].max_neili, offset < 0 ? 1 : 0);
            r.exercise_steps[0].limit++; assert.throws(() => validateSchoolCombatRecord(r, c));
        }
    }
});

test('打坐只受理、缺失心跳或虚报终态不能通过，拒绝保持原状态', () => {
    const c = find('exercise-l200-minimum10'), r = exerciseRow(c);
    validateSchoolCombatRecord(r, c);
    for (const mutate of [s => s.exercise_steps = [], s => s.exercise_terminal = 'halted', s => s.after[0].temp.pending.exercise = 1]) {
        const bad = structuredClone(r); mutate(bad); assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
    for (const refused of cases.filter(c => c.method === 'exercise' && c.parameters.expected === 'refused'))
        validateSchoolCombatRecord(row(refused), refused);
});

test('原路径无专属recover/regenerate，缺少jiuyang-sub不凭空生成或映射成九阳神功', () => {
    for (const dir of ['wudang-xinfa', 'jiuyang-sub', 'taiji-shengong']) for (const ability of ['recover', 'regenerate'])
        assert.ok(!['c', 'lpc'].some(ext => existsSync(join(root, `kungfu/skill/${dir}/${ability}.${ext}`))));
    assert.match(readFileSync(join(root, 'kungfu/skill/wudang-jiuyang.c'), 'utf8'), /__DIR__ "jiuyang-sub\/" \+ func/);
    for (const c of cases) assert.ok(!Object.hasOwn(c.parameters.actor.skills, 'jiuyang-shengong'));
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.match(runner, /players\[0\]->force_me\(action\)/);
    assert.doesNotMatch(runner, /->(?:exercising|halt_exercise)\s*\(/);
});
