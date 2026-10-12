import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateExpectedOutcomes } from './execution.mjs';
import { gumuForces, gumuForceCapacity } from './school_gumu_cultivation_cases.mjs';
import { gumuRecoveryConditions, gumuRecoveryFields, gumuRecoveryFixtureRequirements,
    validateGumuRecoveryRecord } from './school_gumu_recovery_cases.mjs';
import { recoveryExpected } from './school_quanzhen_recovery_cases.mjs';
import { schoolRecoveryEffects } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuRecoveryConditions(catalog);
const pick = (skill, ability, level = 200, suffix = '') => {
    const c = cases.find(c => c.id === `school-gumu-recovery-${skill}-${ability}-l${level}${suffix ? '-' + suffix : ''}`);
    assert.ok(c, [skill, ability, level, suffix].join('/')); return c;
};

// Synthetic validation traces only; no driver is launched and no game result is claimed.
function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, side) => ({
        object: '/tests/actor#' + side, qi: 10000, eff_qi: 10000, max_qi: 10000,
        jing: 10000, eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000,
        potential: 10000, learned_points: null,
        ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !gumuRecoveryFields.includes(k))),
        cultivation: Object.fromEntries(gumuRecoveryFields.map(k => [k, cfg.properties[k] ?? 0])),
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {},
        effective_skills: { force: Math.trunc((cfg.skills.force ?? 0) / 2) + (cfg.mappings.force ? cfg.skills[cfg.mappings.force] : 0) },
        weapon: 'none', temp: {}, busy: cfg.busy ?? 0, userp: 1, interactive: 1, playerp: 1, wizardp: 0,
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原命令拒绝',
        method: c.method, launches: [], attacks: [], interfaces: [], callbacks: [],
        metrics: [{}, {}], command_accepted: Number(p.expected === 'observed') };
    if (c.method === 'exert') {
        const e = recoveryExpected(p, before[0]);
        r.immediate[0][e.key] += e.heal; r.immediate[0].neili -= e.cost; r.immediate[0].busy = e.busy;
        r.metrics[0].neili_cost = e.cost;
        if (e.heal) r.metrics[0][e.key + '_recovery'] = e.heal;
        if (r.command_accepted) { r.launches.push({ skill: 'force' }); r.immediate[0].learned.force = 1; }
    }
    r.after = structuredClone(r.immediate);
    if (c.method === 'exercise') r.exercise_steps = [];
    if (c.method !== 'exercise' || p.expected === 'refused') return r;
    r.immediate[0].temp = { pending: { exercise: 1 }, exercise_cost: p.exercise_cost };
    r.immediate[0].busy = '<function>';
    let state = structuredClone(r.immediate[0]), elapsed = 0, converted = 0;
    r.exercise_steps = [];
    do {
        const x = structuredClone(state), base = Math.trunc(x.effective_skills.force / 5);
        // Choose an allowed random value; this is not a replacement for live random().
        const gain = Math.min(x.temp.exercise_cost, x.qi, 1 + Math.trunc(base / 2) + (p.room.exercise_improve ?? 0));
        const limit = gumuForceCapacity(p.actor, true); elapsed++;
        r.exercise_steps.push({ phase: 'before', elapsed, state: x, limit });
        state.qi -= gain; state.neili += gain; converted += gain;
        state.temp.exercise_cost -= gain;
        if (!state.temp.exercise_cost) {
            state.temp.pending.exercise = 0; state.busy = 0;
            if (state.neili >= state.max_neili * 2) {
                if (state.max_neili < limit) state.max_neili++;
                state.neili = state.max_neili;
            }
        }
        r.exercise_steps.push({ phase: 'after', elapsed, state: structuredClone(state), limit });
        if (p.halt_after) {
            state.neili = Math.min(state.neili, state.max_neili * 2);
            state.temp.pending.exercise = 0; state.busy = 0; r.halt_accepted = 1;
        }
    } while (state.temp.pending.exercise);
    r.metrics[0] = { qi_cost: converted, neili_recovery: converted,
        neili_cost: Math.max(0, before[0].neili + converted - state.neili) };
    r.after = [state, structuredClone(before[1])]; r.elapsed = elapsed;
    r.exercise_terminal = p.halt_after ? 'halted' : 'completed';
    return r;
}

test('追加153条件2070计划、153烟雾，旧13662条件377662计划完整内容不变', () => {
    assert.equal(cases.length, 153); assert.equal(new Set(cases.map(c => c.id)).size, 153);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2070);
    assert.equal(cases.filter(c => c.method === 'exercise').length, 63);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 45);
    assert.equal(createHash('sha256').update(JSON.stringify(cases)).digest('hex'),
        '4869d96a6e487d8c2a63df5b5b6c6822aab7444b04132e6f853eb1b43327822b');
    const registered = schoolCombatConditions(catalog).slice(0, 13815);
    const old = registered.filter(c => c.parameters.collection_group !== 'gumu-recovery');
    assert.equal(old.length, 13662); assert.equal(old.reduce((n, c) => n + c.samples, 0), 377662);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        'a61f48d21b7ec3e0e7c8f2db10328b3b51f998515cc13e0fa96c1a14469ed7bb');
    assert.deepEqual(registered.filter(c => c.parameters.collection_group === 'gumu-recovery'), cases);
    assert.equal(registered.length, 13815); assert.equal(new Set(registered.map(c => c.id)).size, registered.length);
    assert.equal(registered.reduce((n, c) => n + c.samples, 0), 379732);
    validateExpectedOutcomes(cases);
    const smoke = gumuRecoveryConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 153);
    validateExpectedOutcomes(smoke);
    assert.equal(gumuRecoveryFixtureRequirements.length, 3);
    for (const [i, c] of cases.entries()) {
        assert.deepEqual(c.parameters, smoke[i].parameters);
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        assert.ok(!c.parameters.qualification_sources.some(p => p.includes('/quanzhen/') || p.includes('/emei/')));
        validateSchoolCombatRecord(row(c), c);
    }
    assert.throws(() => gumuRecoveryConditions(catalog, { samples: 0 }));
    assert.throws(() => gumuRecoveryConditions({ skills: [] }));
});

test('共享入口仅扩展自固与性格观察、冻结模块和原恢复报告，不增加执行探针', () => {
    const text = path => readFileSync(join(root, path), 'utf8');
    assert.match(text('tools/tests/martial_data/runner.lpc'),
        /\(\{ "emei-recovery", "gumu-recovery" \}\)\) != -1\)\s+foreach \(key in \(\{ "special_skill\/self", "character" \}\)\)/);
    assert.match(text('tools/tests/martial_data/execution.mjs'),
        /'tools\/tests\/martial_data\/school_gumu_recovery_cases\.mjs'/);
    assert.match(text('tools/tests/martial_data/school_combat_report.mjs'),
        /'emei-recovery', 'gumu-recovery'\]\.includes\(condition\.parameters\.collection_group\)\)\s+condition\.recovery = schoolRecoveryEffects/);
});

test('同有效内功的三门恢复量一致；公共回退增加基本内功熟练度，不是特殊内功', () => {
    for (const skill of gumuForces) for (const [level, qiCost, jingCost] of [[200, 1666, 1000], [400, 833, 500], [800, 416, 250]]) {
        for (const [ability, cost] of [['recover', qiCost], ['regenerate', jingCost]]) {
            const c = pick(skill, ability, level), r = row(c);
            assert.equal(r.metrics[0].neili_cost, cost); assert.equal(r.immediate[0].learned.force, 1);
            assert.equal(r.immediate[0].learned[skill], undefined); assert.equal(r.launches[0].skill, 'force');
            validateGumuRecoveryRecord(r, c);
        }
    }
});

test('突破/自疗顺序、部分恢复、战斗忙乱保留原差异', () => {
    for (const skill of gumuForces) for (const [ability, suffix, cost, heal, busy] of [
        ['recover', 'partial', 100, 300, 0], ['regenerate', 'partial', 100, 500, 0],
        ['recover', 'both', 816, 5000, 0], ['regenerate', 'both', 700, 5000, 0],
        ['recover', 'fighting-self', 1166, 5000, 0], ['regenerate', 'fighting-self', 1000, 5000, 1],
        ['recover', 'gap10', 20, 10, 0], ['regenerate', 'gap10', 20, 10, 0],
    ]) {
        const p = pick(skill, ability, 200, suffix).parameters;
        const e = recoveryExpected(p, p.actor.properties); assert.deepEqual([e.cost, e.heal, e.busy], [cost, heal, busy]);
    }
    for (const ability of ['recover', 'regenerate']) for (const suffix of ['gap9', 'neili19', 'busy', 'unmapped'])
        assert.equal(pick('suxin-jue', ability, 200, suffix).parameters.expected, 'refused');
});

test('三种容量分别核验，达到两倍当前上限只可能收功增长1，并非加满容量', () => {
    for (const [skill, limit] of [['suxin-jue', 3000], ['yunv-xinjing', 3480], ['surge-force', 3570]])
        for (const [suffix, offset] of [['below-cap', -1], ['at-cap', 0], ['above-cap', 1]]) {
            const c = pick(skill, 'exercise', 200, suffix), r = row(c);
            assert.equal(c.parameters.actor.properties.max_neili, limit + offset);
            assert.equal(r.after[0].max_neili - r.before[0].max_neili, offset < 0 ? 1 : 0);
            assert.equal(r.after[0].neili, r.after[0].max_neili);
            validateGumuRecoveryRecord(r, c);
            r.exercise_steps[0].limit++; assert.throws(() => validateGumuRecoveryRecord(r, c));
        }
});

test('自然逐跳转换与halt分开，受理/闭包忙乱不代替终态', () => {
    for (const skill of gumuForces) for (const suffix of ['', 'minimum10', 'room-bonus', 'halt', 'halt-overcharge']) {
        const c = pick(skill, 'exercise', 200, suffix), r = row(c);
        validateGumuRecoveryRecord(r, c);
        assert.equal(r.exercise_steps.length % 2, 0);
        if (suffix.startsWith('halt')) {
            assert.equal(r.exercise_terminal, 'halted'); assert.equal(r.exercise_steps.length, 2);
            assert.equal(r.after[0].max_neili, r.before[0].max_neili);
        } else assert.equal(r.exercise_terminal, 'completed');
        const bad = structuredClone(r); bad.exercise_steps = []; assert.throws(() => validateGumuRecoveryRecord(bad, c));
    }
    assert.equal(pick('suxin-jue', 'exercise', 200, 'jing6999').parameters.expected, 'refused');
    assert.equal(pick('suxin-jue', 'exercise', 200, 'jing7000').parameters.expected, 'observed');
    assert.equal(pick('suxin-jue', 'exercise', 200, 'no-fight').parameters.expected, 'refused');
    assert.equal(pick('suxin-jue', 'exercise', 200, 'allowed-room').parameters.expected, 'observed');
});

test('资源净值、逐跳转换及宿主自然恢复独立，不把收功回落当负恢复', () => {
    const c = pick('yunv-xinjing', 'exercise', 200, 'below-cap'), r = row(c);
    const stats = schoolRecoveryEffects([{ outcome: r.outcome, raw: r }]);
    assert.equal(stats.exercise_converted.mean, 10); assert.equal(stats.max_neili_net.mean, 1);
    assert.equal(stats.neili_net.mean, -3468); assert.equal(stats.neili_cost.mean, 3478);
    const heal = row(pick('suxin-jue', 'recover'));
    const h = schoolRecoveryEffects([{ outcome: 'observed', raw: heal }]);
    assert.equal(h.qi_net.mean, 5000); assert.equal(h.exercise_converted.mean, null);
    // Mimic a separately observed USER regeneration between callbacks, not a fabricated conversion gain.
    r.after[0].qi += 5; r.metrics[0].qi_recovery = 5; validateGumuRecoveryRecord(r, c);
    const natural = schoolRecoveryEffects([{ outcome: r.outcome, raw: r }]);
    assert.equal(natural.exercise_converted.mean, 10); assert.equal(natural.qi_net.mean, -5);
    assert.equal(natural.qi_regeneration.mean, 5);
});

test('未知身份/资源/字段与伪造专属发动、熟练度、终态均不能通过', () => {
    const c = pick('surge-force', 'recover');
    for (const mutate of [r => r.before[0].wizardp = 1, r => delete r.before[0].cultivation['special_skill/self'],
        r => r.before[0].effective_skills.force++, r => r.launches[0].skill = 'surge-force',
        r => r.after[0].learned['surge-force'] = 1, r => delete r.after[0].learned.force,
        r => r.after[1].qi = 1, r => r.metrics[0] = null, r => r.metrics[0].neili_cost = null]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuRecoveryRecord(r, c));
    }
    const e = pick('surge-force', 'exercise', 200, 'minimum10');
    for (const mutate of [r => r.exercise_terminal = 'halted', r => r.after[0].temp.pending.exercise = 1,
        r => r.after[0].max_neili++, r => r.exercise_steps[1].state.neili++]) {
        const r = row(e); mutate(r); assert.throws(() => validateGumuRecoveryRecord(r, e));
    }
});

test('未设置字段null与缺字段不同，拒绝没有转换和新增熟练度', () => {
    const c = pick('yunv-xinjing', 'recover'), r = row(c);
    for (const phase of ['before', 'immediate', 'after']) for (const key of gumuRecoveryFields)
        if (!Object.hasOwn(c.parameters.actor.properties, key)) r[phase][0].cultivation[key] = null;
    validateGumuRecoveryRecord(r, c);
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) validateGumuRecoveryRecord(row(c), c);
    const reject = pick('suxin-jue', 'exercise', 200, 'cost9'), bad = row(reject);
    bad.exercise_steps = [{}]; assert.throws(() => validateGumuRecoveryRecord(bad, reject));
});

test('原空闲忙乱和未用潜能可为null，但所有阶段均须明确观察', () => {
    for (const c of cases) {
        const r = row(c);
        const states = ['before', 'immediate', 'after'].flatMap(k => r[k])
            .concat((r.exercise_steps ?? []).map(s => s.state));
        for (const state of states) if (state.busy === 0) state.busy = null;
        const unchanged = structuredClone(r); validateGumuRecoveryRecord(r, c); assert.deepEqual(r, unchanged);
    }
    const c = pick('suxin-jue', 'recover');
    for (const phase of ['before', 'immediate', 'after']) for (const key of ['busy', 'learned_points']) {
        const r = row(c); delete r[phase][0][key]; assert.throws(() => validateGumuRecoveryRecord(r, c));
    }
});

test('未知资源或缺账不得当作免费恢复，稀疏的明确空事件账保留', () => {
    const c = pick('surge-force', 'regenerate');
    for (const phase of ['before', 'immediate', 'after']) for (const key of ['qi', 'jing', 'neili', 'max_neili', 'potential']) {
        for (const value of [undefined, null, NaN]) {
            const r = row(c); r[phase][0][key] = value;
            assert.throws(() => validateGumuRecoveryRecord(r, c), phase + '/' + key);
        }
    }
    for (const mutate of [r => r.metrics[0] = {}, r => delete r.metrics[0].jing_recovery,
        r => delete r.metrics[0].neili_cost, r => r.metrics[1] = [], r => delete r.callbacks]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuRecoveryRecord(r, c));
    }
    const refused = pick('suxin-jue', 'recover', 200, 'gap9'), r = row(refused);
    r.metrics = [{}, {}]; validateGumuRecoveryRecord(r, refused);
});

test('逐跳归属、容量、时钟及终态字段不能缺失或由其它观察代替', () => {
    const c = pick('yunv-xinjing', 'exercise', 200, 'minimum10');
    for (const mutate of [r => r.after[0].object = '/tests/other#3',
        r => delete r.exercise_steps[0].state.busy,
        r => r.exercise_steps[1].state.object = '/tests/other#3',
        r => r.exercise_steps[0].state.effective_skills.force++,
        r => delete r.exercise_steps[1].state.temp.exercise_cost,
        r => delete r.exercise_steps[1].state.temp.pending.exercise,
        r => delete r.after[0].temp.pending.exercise,
        r => r.immediate[0].temp.exercise_cost++, r => r.immediate[0].qi--,
        r => r.after[0].learned['yunv-xinjing'] = 1,
        r => r.exercise_steps[1].elapsed = r.exercise_steps[0].elapsed - 1,
        r => r.exercise_steps[0].elapsed = NaN, r => delete r.elapsed,
        r => delete r.metrics[0].qi_cost, r => r.metrics[0].neili_recovery = 0]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuRecoveryRecord(r, c));
    }
    const c2 = pick('suxin-jue', 'exercise', 200, 'cost9'), r = row(c2);
    delete r.exercise_steps; assert.throws(() => validateGumuRecoveryRecord(r, c2));
});

test('原日志没有parameters也可报告，自然恢复只进入对应资源账', () => {
    const c = pick('yunv-xinjing', 'exercise', 200, 'below-cap'), r = row(c);
    assert.ok(!Object.hasOwn(r, 'parameters')); validateGumuRecoveryRecord(r, c);
    const stats = schoolRecoveryEffects([{ outcome: r.outcome, raw: r }]);
    assert.equal(stats.exercise_converted.mean, 10); assert.equal(stats.neili_net.mean, -3468);
    r.after[0].qi += 5; r.metrics[0].qi_recovery = 5;
    r.after[0].neili += 7; r.metrics[0].neili_recovery += 7;
    validateGumuRecoveryRecord(r, c);
    const natural = schoolRecoveryEffects([{ outcome: r.outcome, raw: r }]);
    assert.equal(natural.exercise_converted.mean, 10); assert.equal(natural.qi_regeneration.mean, 5);
    assert.equal(natural.neili_net.mean, -3461);
    r.metrics[0].neili_recovery -= 7; assert.throws(() => validateGumuRecoveryRecord(r, c));
});

test('真实文件无专属恢复，公共分发与心跳不被采集器重写', () => {
    for (const skill of gumuForces) for (const ability of ['recover', 'regenerate'])
        assert.ok(!['c', 'lpc'].some(ext => existsSync(join(root, `kungfu/skill/${skill}/${ability}.${ext}`))));
    const text = path => readFileSync(join(root, path), 'utf8');
    for (const skill of gumuForces) assert.match(text(`kungfu/skill/${skill}.c`), new RegExp('__DIR__ "' + skill + '/" \\+ func'));
    assert.match(text('cmds/skill/exert.c'), /SKILL_D\("force"\)->exert_function\(me, arg\)/);
    assert.match(text('cmds/skill/exert.c'), /me->improve_skill\("force", 1, 1\)/);
    const actor = text('tools/tests/martial_data/actor.lpc'), runner = text('tools/tests/martial_data/runner.lpc');
    assert.match(actor, /::continue_action\(\)/); assert.match(runner, /players\[0\]->force_me\("halt"\)/);
    assert.doesNotMatch(actor + runner, /->(?:exercising|halt_exercise)\s*\(/);
});
