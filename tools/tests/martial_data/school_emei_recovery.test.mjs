import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { emeiRecoveryConditions, emeiRecoveryFields } from './school_emei_recovery_cases.mjs';
import { emeiForces, emeiForceCapacity } from './school_emei_cultivation_cases.mjs';
import { recoveryExpected } from './school_quanzhen_recovery_cases.mjs';
import { schoolRecoveryEffects, schoolCombatMarkdown } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog);
const cases = all.filter(c => c.parameters.collection_group === 'emei-recovery');
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('峨嵋恢复153条件2070样本，不改变历史10329条件及参数', () => {
    assert.equal(cases.length, 153); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2070);
    assert.equal(cases.filter(c => c.method === 'exercise').length, 63);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 45);
    assert.equal(emeiRecoveryConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 153);
    const historical = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school));
    const old = historical.filter(c => c.parameters.collection_group !== 'emei-recovery'
        && !c.id.startsWith('school-emei-support-') && !['emei-jiuyin', 'emei-jiuyin-buff', 'emei-yijin', 'emei-shexing', 'emei-jiuyin-learning', 'emei-jiuyin-passive', 'emei-npc', 'emei-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 10329); assert.equal(old.reduce((n, c) => n + c.samples, 0), 261496);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '29be61c68fc9ccbbf36a93e703596598953386557c2d2184513936a0a987a465');
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        const a = c.parameters.actor;
        assert.equal(a.properties['family/family_name'], '峨嵋派'); assert.equal(a.properties.gender, '女性');
        assert.ok(a.skills.mahayana >= 200);
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        assert.ok(!c.parameters.qualification_sources.some(p => p.includes('/quanzhen/') || p.includes('/shaolin/')));
    }
});

function states(p) {
    return [p.actor, p.target].map(config => ({ ...config.properties,
        cultivation: Object.fromEntries(emeiRecoveryFields.map(k => [k, config.properties[k] ?? 0])),
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings), learned: {},
        effective_skills: { force: Math.trunc((config.skills.force ?? 0) / 2)
            + (config.mappings.force ? config.skills[config.mappings.force] : 0) },
        weapon: 'none', temp: {}, busy: config.busy ?? 0, userp: 1, interactive: 1, playerp: 1, wizardp: 0 }));
}

function row(c) {
    const p = c.parameters, before = states(p);
    const r = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原命令拒绝',
        launches: [], attacks: [], interfaces: [], command_accepted: Number(p.expected === 'observed'), metrics: [{}, {}] };
    if (c.method === 'exert') {
        const e = recoveryExpected(p, before[0]);
        r.immediate[0][e.key] += e.heal; r.immediate[0].neili -= e.cost; r.immediate[0].busy = e.busy;
        r.metrics[0].neili_cost = e.cost;
        if (r.command_accepted) r.launches.push({ skill: 'force' });
    }
    r.after = structuredClone(r.immediate);
    return r;
}

test('三门相同有效等级走公共恢复，不虚构峨嵋专属加成', () => {
    for (const c of cases.filter(c => c.method === 'exert')) validateSchoolCombatRecord(row(c), c);
    for (const skill of emeiForces) for (const [level, qiCost, jingCost] of [[200, 1666, 1000], [400, 833, 500], [800, 416, 250]]) {
        const qi = find(`${skill}-recover-l${level}`), jing = find(`${skill}-regenerate-l${level}`);
        assert.equal(recoveryExpected(qi.parameters, qi.parameters.actor.properties).cost, qiCost);
        assert.equal(recoveryExpected(jing.parameters, jing.parameters.actor.properties).cost, jingCost);
    }
    const c = find('recover-l200'), r = row(c); r.launches[0].skill = c.parameters.skill;
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('突破与自疗、部分恢复、战斗忙乱分别服从原入口', () => {
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
    const p = c.parameters, r = row(c);
    r.immediate[0].temp = { pending: { exercise: 1 }, exercise_cost: p.exercise_cost };
    r.immediate[0].busy = '<function>';
    const x = structuredClone(r.immediate[0]), y = structuredClone(x), limit = emeiForceCapacity(p.actor, true);
    y.qi -= p.exercise_cost; y.neili += p.exercise_cost;
    if (y.neili >= y.max_neili * 2) { if (y.max_neili < limit) y.max_neili++; y.neili = y.max_neili; }
    r.metrics[0] = { qi_cost: p.exercise_cost, neili_recovery: p.exercise_cost,
        neili_cost: Math.max(0, x.neili + p.exercise_cost - y.neili) };
    y.temp = { pending: { exercise: 0 }, exercise_cost: 0 }; y.busy = 0;
    r.exercise_steps = [{ phase: 'before', elapsed: 1, state: x, limit }, { phase: 'after', elapsed: 1, state: y, limit }];
    r.after = [structuredClone(y), structuredClone(r.before[1])]; r.exercise_terminal = 'completed';
    return r;
}

test('峨嵋三种容量分别核验，临济固有500不丢失', () => {
    for (const [skill, cap] of [['emei-xinfa', 3000], ['linji-zhuang', 4130], ['emei-jiuyang', 3450]])
        for (const [suffix, offset] of [['below-cap', -1], ['at-cap', 0], ['above-cap', 1]]) {
            const c = find(`${skill}-exercise-l200-${suffix}`), r = exerciseRow(c);
            assert.equal(c.parameters.actor.properties.max_neili, cap + offset);
            assert.equal(c.parameters.actor.properties.neili, (cap + offset) * 2 - 10);
            validateSchoolCombatRecord(r, c);
            assert.equal(r.after[0].max_neili - r.before[0].max_neili, offset < 0 ? 1 : 0);
            r.exercise_steps[0].limit++; assert.throws(() => validateSchoolCombatRecord(r, c));
        }
});

test('受理不等于完成，缺心跳、错误终态、虚构上限与未完成不能通过', () => {
    const c = find('exercise-l200-minimum10'), r = exerciseRow(c);
    validateSchoolCombatRecord(r, c);
    for (const mutate of [s => s.exercise_steps = [], s => s.exercise_terminal = 'halted',
        s => s.after[0].temp.pending.exercise = 1, s => s.after[0].max_neili++]) {
        const bad = structuredClone(r); mutate(bad); assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
    for (const refused of cases.filter(c => c.method === 'exercise' && c.parameters.expected === 'refused'))
        validateSchoolCombatRecord(row(refused), refused);
});

test('真实身份、女性配置、自疗标志及有效内功不能伪造', () => {
    const c = find('linji-zhuang-recover-l200-self');
    for (const change of [r => r.before[0].wizardp = 1, r => r.before[0].interactive = 0,
        r => r.before[0].gender = '男性', r => r.before[0].cultivation['special_skill/self'] = 0,
        r => r.before[0].effective_skills.force++, r => r.after[0].mappings.force = 'emei-xinfa',
        r => r.outcome = 'refused']) {
        const r = row(c); change(r); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('LPC未设置属性的null允许，但缺失观测和错误初态不能填零', () => {
    const c = find('linji-zhuang-recover-l200'), r = row(c);
    for (const phase of ['before', 'immediate', 'after'])
        for (const key of emeiRecoveryFields)
            if (!Object.hasOwn(c.parameters.actor.properties, key)) r[phase][0].cultivation[key] = null;
    validateSchoolCombatRecord(r, c);
    const missing = structuredClone(r); delete missing.before[0].cultivation.sex;
    assert.throws(() => validateSchoolCombatRecord(missing, c));
    const wrong = structuredClone(r); wrong.before[0].cultivation.sex = 1;
    assert.throws(() => validateSchoolCombatRecord(wrong, c));
});

test('净值与逐跳转换分开，报告识别峨嵋恢复组', () => {
    const c = find('linji-zhuang-exercise-l200-below-cap'), r = exerciseRow(c);
    const e = schoolRecoveryEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(e.max_neili_net.mean, 1); assert.equal(e.exercise_converted.mean, 10);
    assert.equal(e.neili_net.mean, -4118); assert.equal(e.neili_cost.mean, 4128);
    const md = schoolCombatMarkdown({ fingerprint: 'test', evidence_sha256: 'test',
        totals: { conditions: 1, samples: 1, observed: 1, refused: 0, errors: 0 },
        conditions: [{ ...c, counts: { observed: 1, refused: 0 }, recovery: e,
            effects: { callback_start_seconds: { mean: null }, target_callback_start_seconds: { mean: null } } }] });
    assert.match(md, /恢复与原心跳打坐/); assert.match(md, /原USER自然恢复保留/);
    assert.match(md, /-4118\.00\/1\.00/);
    assert.match(readFileSync(join(root, 'tools/tests/martial_data/school_combat_report.mjs'), 'utf8'),
        /'shaolin-recovery', 'emei-recovery', 'gumu-recovery'\]\.includes/);
});

test('专属恢复不存在即回退公共入口，不补造九阳文件或替换心跳', () => {
    for (const dir of ['emei-xinfa', 'linji-zhuang', 'jiuyang-sub']) for (const ability of ['recover', 'regenerate'])
        assert.ok(!['c', 'lpc'].some(ext => existsSync(join(root, `kungfu/skill/${dir}/${ability}.${ext}`))));
    assert.match(readFileSync(join(root, 'kungfu/skill/emei-jiuyang.c'), 'utf8'), /__DIR__ "jiuyang-sub\/" \+ func/);
    for (const c of cases) assert.ok(!Object.hasOwn(c.parameters.actor.skills, 'jiuyang-shengong'));
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.match(runner, /players\[0\]->force_me\(action\)/);
    assert.doesNotMatch(runner, /->(?:exercising|halt_exercise)\s*\(/);
    assert.match(runner, /\(\{ "special_skill\/self", "character" \}\)/);
    assert.match(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8'), /school_emei_recovery_cases\.mjs/);
});
