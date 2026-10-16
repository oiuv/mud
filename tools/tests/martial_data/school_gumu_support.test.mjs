import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateExpectedOutcomes, validateRecord } from './execution.mjs';
import { schoolCombatEffects, schoolCombatMarkdown } from './school_combat_report.mjs';
import { gumuSupportConditions, validateGumuSupportRecord, gumuSupportFixtureRequirements,
    gumuSupportEffects } from './school_gumu_support_cases.mjs';
import { healingStepExpected } from './school_wudang_healing_cases.mjs';
import { dispelExpected } from './school_wudang_dispel_cases.mjs';
import { dispelEffects, buffSequenceEffects } from './school_public_force_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuSupportConditions(catalog);
const group = name => cases.filter(c => c.parameters.collection_group === 'gumu-' + name);
const pick = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

// Synthetic observation-contract tests only; not driver samples, no ledger writes.
function row(c) {
    const p = c.parameters, ok = p.expected === 'observed';
    const before = [p.actor, p.target].map((cfg, i) => ({
        qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
        neili: 6000, max_neili: 6000, str: 30, int: 30, con: 30, dex: 30, ...cfg.properties,
        object: '/tests/' + (i ? 'right' : 'left'), id: i ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1, wizardp: 0,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {},
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)])),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || ['breakup', 'character'].includes(k))),
        conditions: structuredClone(cfg.conditions ?? {}), effective_con: cfg.properties.con + Math.trunc((cfg.skills.force ?? 0) / 10),
        weapon: 'none', busy: cfg.busy ?? 0, temp: { apply: { armor: 100 }, ...cfg.temp } }));
    const r = { method: c.method, elapsed: 0, before, immediate: structuredClone(before), outcome: p.expected,
        command_accepted: Number(ok), reason: ok ? '' : '原入口拒绝',
        attacks: [], interfaces: [], callbacks: [], launches: ok ? [{ skill: 'force', actor: before[0].object,
            argument: p.action.slice(6) }] : [], metrics: [{}, {}] };
    if (p.collection_group === 'gumu-dispel') {
        const e = dispelExpected(before, p), [a, t] = r.immediate;
        a.neili -= e.cost; a.busy = e.actorBusy[0]; t.busy = e.targetBusy[0];
        r.immediate[p.other ? 1 : 0].conditions = e.conditions; r.metrics[0].neili_cost = e.cost;
        r.after = structuredClone(r.immediate); return finishRow(r);
    }
    if (p.collection_group === 'gumu-buffs') return finishRow(buffRow(r, p));
    r.healing_steps = []; r.after = structuredClone(r.immediate);
    if (!ok) return finishRow(r);
    const flag = p.ability === 'heal' ? 'healing' : 'inspiring';
    r.immediate[0].temp.pending = { [flag]: 1 }; r.immediate[0].busy = '<function>';
    let current = structuredClone(r.immediate[0]), elapsed = 0, cost = 0;
    for (let i = 0; i < 100; i++) {
        const b = structuredClone(current), e = healingStepExpected(p.ability, b), a = structuredClone(b);
        a['eff_' + e.key] += e.gain; a.neili -= e.cost; a.busy = e.stop ? 0 : '<function>'; cost += e.cost;
        a.temp.pending[flag] = Number(!e.stop || (p.ability === 'inspire' && e.stop !== 'unmapped'));
        elapsed += 2;
        r.healing_steps.push({ phase: 'before', elapsed, state: b }, { phase: 'after', elapsed, state: a });
        current = a;
        if (p.halt_after) {
            const end = structuredClone(a), fee = p.ability === 'heal' ? Math.min(a.neili, 100) : 0;
            end.neili -= fee; end.busy = 0; end.temp.pending[flag] = 0; cost += fee;
            r.healing_halt = { before: a, after: end }; r.halt_accepted = 1; r.healing_terminal = 'halted'; current = end; break;
        }
        if (e.stop) { r.healing_terminal = 'busy_ended'; break; }
    }
    assert.ok(r.healing_terminal); r.after[0] = current; r.metrics[0].neili_cost = cost; r.elapsed = elapsed;
    r.metrics[0].heartbeats = r.healing_steps.length / 2;
    return finishRow(r);
}

function finishRow(r) {
    const states = ['before', 'immediate', 'after'].flatMap(key => r[key]);
    states.push(...(r.healing_steps ?? []).map(step => step.state));
    if (r.healing_halt) states.push(r.healing_halt.before, r.healing_halt.after);
    for (const step of r.buff_steps ?? []) states.push(step.before, step.after);
    for (const state of new Set(states)) {
        if (state.busy === 0) state.busy = null;
        if (!Object.keys(state.conditions).length) state.conditions = null;
        state.effective_con = state.con + Math.trunc((state.skills.force ?? 0) / 10) + (state.temp.apply.con ?? 0);
        state.effective_skills = Object.fromEntries(Object.entries(state.skills).map(([key, value]) => [key,
            Math.trunc(value / 2) + (state.skills[state.mappings[key]] ?? 0) + (state.temp.apply[key] ?? 0)]));
    }
    for (const side of [0, 1]) for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
        const delta = r.after[side][key] - r.before[side][key];
        const metric = key + (delta < 0 ? '_cost' : '_recovery');
        if (delta && !Object.hasOwn(r.metrics[side], metric)) r.metrics[side][metric] = Math.abs(delta);
    }
    if (r.launches.length) r.metrics[0].ability_launched = r.launches.length;
    return r;
}

function buffRow(r, p) {
    let current = structuredClone(r.before[0]), cost = 0, refills = 0, launches = 0, refusals = 0;
    r.buff_steps = []; r.launches = [];
    for (const operation of p.buff_steps) {
        const b = structuredClone(current), a = structuredClone(b), step = { operation, before: b, after: a,
            launches_before: launches, refusals_before: refusals };
        if (operation.refill_neili !== undefined) { a.neili = operation.refill_neili; refills += a.neili - b.neili; }
        else {
            const ability = operation.command.split(' ')[1], success = p.expected === 'observed' && !b.temp[ability];
            step.accepted = Number(success);
            if (success) {
                launches++; r.launches.push({ skill: 'force', actor: b.object, argument: ability }); cost += b.neili; a.neili = 0;
                if (ability === 'power') a.temp.apply[p.power_selected] = (a.temp.apply[p.power_selected] ?? 0) + Math.trunc(b.skills['martial-cognize'] / 5);
                else {
                    const base = b.skills.force + 215, count = Math.trunc(base / 4);
                    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) a[key] -= base;
                    for (const key of ['str', 'int', 'con', 'dex']) a.temp.apply[key] = (a.temp.apply[key] ?? 0) + b[key];
                    a.temp.apply.attack = (a.temp.apply.attack ?? 0) + count;
                    for (const key of ['damage', 'unarmed_damage']) a.temp.apply[key] = (a.temp.apply[key] ?? 0) + b.str * 3;
                    for (const key of Object.keys(b.mappings)) a.temp.apply[key] = (a.temp.apply[key] ?? 0) + Math.trunc(count / 2);
                }
                a.temp[ability] = 1;
            } else {
                refusals++; step.reason = p.expected === 'refused' ? '你还没有入魔' : ability === 'power' && b.neili < 100 ? '内力不够' : '已经在运功中';
            }
        }
        step.launches_after = launches; step.refusals_after = refusals; r.buff_steps.push(step); current = a;
    }
    r.immediate[0] = current; r.after = structuredClone(r.immediate);
    Object.assign(r.metrics[0], { neili_cost: cost, neili_recovery: refills });
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) r.metrics[0][key + '_cost'] = r.before[0][key] - current[key];
    if (p.persistence_probe) {
        const restored = structuredClone(current); restored.object = '/tests/restored'; restored.interactive = 0; restored.temp = {};
        r.persistence = { restored: 1, characters: 100, sha256: 'a'.repeat(64), before: { temp: {} }, after: restored };
    }
    return r;
}

test('477条件9186计划注册，旧14078条件完整指纹不变，三类方法和烟雾分开', () => {
    const all = schoolCombatConditions(catalog).slice(0, 14555),
        registered = new Set(all.map(c => c.id));
    const smoke = gumuSupportConditions(catalog, { smoke: true });
    const old = all.filter(c => !c.id.startsWith('school-gumu-support-'));
    const allSmoke = schoolCombatConditions(catalog, { smoke: true }).slice(0, 14555);
    const oldSmoke = allSmoke.filter(c => !c.id.startsWith('school-gumu-support-'));
    assert.equal(cases.length, 477); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 9186);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 840); assert.equal(gumuSupportFixtureRequirements.length, 3);
    const hash = rows => createHash('sha256').update(JSON.stringify(rows)).digest('hex');
    assert.equal(hash(cases), '6b3fbe17f4d4a28a1704515e4d833a62e2521a0ff3ce6eb13cf5fe71bd7091ee');
    assert.equal(hash(smoke), 'e2b827d90ed93b4c5eb1bf759ab2e9b8f3968c1f037027a22016641f44f179b5');
    assert.equal(old.length, 14078); assert.equal(old.reduce((n, c) => n + c.samples, 0), 385746);
    assert.equal(hash(old), '29b1a518c5ce97c0867a489f719346b546b30d6e76fffd2f01b2312904319b95');
    assert.equal(oldSmoke.length, 14078); assert.equal(oldSmoke.reduce((n, c) => n + c.samples, 0), 23876);
    assert.equal(hash(oldSmoke), 'b6caa48f17d0db65ed9b68f3ca2bfe3d8de0836d372ae5531edddaa5fdb6339a');
    assert.deepEqual(all.filter(c => c.id.startsWith('school-gumu-support-')), cases);
    assert.deepEqual(allSmoke.filter(c => c.id.startsWith('school-gumu-support-')), smoke);
    assert.equal(all.length, 14555); assert.equal(all.reduce((n, c) => n + c.samples, 0), 394932);
    assert.equal(registered.size, all.length); validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const [name, count, n] of [['healing', 114, 228], ['dispel', 312, 7680], ['buffs', 51, 1278]]) {
        assert.equal(group(name).length, count); assert.equal(group(name).reduce((sum, c) => sum + c.samples, 0), n);
    }
    for (const [i, c] of cases.entries()) {
        assert.ok(registered.has(c.id)); assert.deepEqual(c.parameters, smoke[i].parameters);
        for (const source of c.parameters.qualification_sources) assert.ok(existsSync(join(root, source)), source);
        const raw = { kind: 'sample', condition_id: c.id, ...row(c) };
        validateGumuSupportRecord(raw, c); validateSchoolCombatRecord(raw, c); validateRecord(raw, c);
        assert.equal(gumuSupportEffects([{ outcome: raw.outcome, raw }], c.parameters).attempts, 1);
    }
});

test('真实古墓配置不借少林/峨嵋资格，额外映射和辅助技能不冒充师承', () => {
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(p.actor.properties['family/family_name'], '古墓派'); assert.equal(p.actor.properties.gender, '男性');
        assert.ok(!p.actor.skills.mahayana && !p.actor.skills.buddhism && !p.actor.skills['taiji-jian']);
        assert.ok(!p.qualification_sources.some(s => /class\/(wudang|shaolin|emei)\//.test(s)));
        assert.ok(p.qualification_note.includes('实验赋值'));
    }
    for (const force of ['suxin-jue', 'yunv-xinjing', 'surge-force'])
        for (const ability of ['heal', 'inspire', 'dispel', 'power', 'tianmo'])
            for (const ext of ['c', 'lpc']) assert.equal(existsSync(join(root, `kungfu/skill/${force}/${ability}.${ext}`)), false);
    assert.throws(() => gumuSupportConditions(catalog, { samples: 0 }));
});

test('原心跳每跳治疗量和原费用，任督/天佑只按heal公式参与', () => {
    for (const level of [200, 400, 800]) {
        const c = pick(`healing-suxin-jue-heal-l${level}`), r = row(c);
        const first = r.healing_steps[1].state.eff_qi - r.healing_steps[0].state.eff_qi;
        assert.equal(first, Math.min(300, 10 + level / 2));
    }
    const state = { mappings: { force: 'surge-force' }, eff_qi: 1000, max_qi: 10000, eff_jing: 1000, max_jing: 10000,
        neili: 6000, effective_skills: { force: 300 }, effective_con: 56, cultivation: { breakup: 1, 'special_skill/divine': 1 } };
    assert.equal(healingStepExpected('heal', state).gain, 666); assert.equal(healingStepExpected('heal', state).cost, 50);
    assert.equal(healingStepExpected('inspire', state).gain, 55); assert.equal(healingStepExpected('inspire', state).cost, 100);
});

test('原耗尽和halt分开，振奋完成残留MA-080不由采集器纠正', () => {
    const done = row(pick('healing-suxin-jue-inspire-l200')), depleted = row(pick('healing-suxin-jue-inspire-l200-neili299'));
    for (const r of [done, depleted]) assert.equal(r.after[0].temp.pending.inspiring, 1);
    const halt = row(pick('healing-suxin-jue-inspire-l200-halt')); assert.equal(halt.after[0].temp.pending.inspiring, 0);
    assert.equal(halt.healing_halt.before.neili, halt.healing_halt.after.neili);
    const q = row(pick('healing-suxin-jue-heal-l200-halt')); assert.equal(q.healing_halt.before.neili - q.healing_halt.after.neili, 100);
    const stats = [done, depleted, halt].map((raw, i) => gumuSupportEffects([{ outcome: raw.outcome, raw }],
        pick('healing-suxin-jue-inspire-l200' + ['', '-neili299', '-halt'][i]).parameters));
    assert.deepEqual(Object.fromEntries(['completed', 'depleted', 'halted', 'unmapped', 'unknown'].map(key =>
        [key, stats.reduce((n, entry) => n + entry.terminals[key], 0)])),
    { completed: 1, depleted: 1, halted: 1, unmapped: 0, unknown: 0 });
    assert.equal(stats.reduce((n, entry) => n + entry.pending_residual, 0), 2);
    done.after[0].temp.pending.inspiring = 0; assert.throws(() => validateGumuSupportRecord(done, pick('healing-suxin-jue-inspire-l200')));
});

test('驱除起手费之后才查异常资源，清除/部分/不变不混为成功', () => {
    for (const [suffix, outcome] of [['drunk-self-l200-neili299', 'unchanged'], ['freezing-self-l200-partial', 'partial'],
        ['bandaged-self-l200-not-dispellable', 'unchanged'], ['ill_kesou-self-l200-neili-exact', 'cleared']]) {
        const c = pick('dispel-suxin-jue-' + suffix), r = row(c);
        assert.equal(dispelEffects([{ outcome: r.outcome, raw: r }], c.parameters).outcomes[outcome], 1);
        delete r.after[0].conditions;
        assert.equal(dispelEffects([{ outcome: r.outcome, raw: r }], c.parameters).outcomes.unknown, 1);
    }
    const full = row(pick('dispel-suxin-jue-ill_kesou-self-l200-neili-exact'));
    assert.equal(full.metrics[0].neili_cost, 400); assert.equal(full.after[0].neili, 0);
});

test('实际条件内容、身份、费用、入口和时序缺失不能伪作有效观察', () => {
    const c = group('dispel')[0];
    for (const mutate of [r => r.before[0].wizardp = 1, r => r.after[1].interactive = 0,
        r => r.before[0].cultivation.character = '狡黠多变', r => r.metrics[0].neili_cost = null,
        r => r.metrics[0].heartbeats = 1, r => r.launches = [], r => r.before[0].effective_skills.force++]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuSupportRecord(r, c));
    }
    const healing = pick('healing-suxin-jue-heal-l200'), r = row(healing); r.healing_steps = [];
    assert.throws(() => validateGumuSupportRecord(r, healing));
});

test('强化重复/先后顺序记录实验补给，不虚构自动恢复；nosave不代表完整重连', () => {
    const c = pick('buffs-suxin-jue-power-l400-paired'), r = row(c);
    assert.deepEqual(r.buff_steps.filter(s => s.operation.command).map(s => s.accepted), [1, 1, 0, 0]);
    assert.equal(r.metrics[0].neili_cost, 16000); assert.equal(r.metrics[0].neili_recovery, 16000);
    const stats = buffSequenceEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(stats.experimental_refills, 2); assert.equal(stats.accepted_steps, 2); assert.equal(stats.refused_steps, 2);
    const probe = row(pick('buffs-suxin-jue-power-l400-persistence')); assert.equal(probe.persistence.after.interactive, 0);
    assert.equal(buffSequenceEffects([{ outcome: 'observed', raw: probe }]).restored_without_buff, 1);
    for (const usage of ['axe', 'spear']) assert.equal(pick(`buffs-suxin-jue-power-l200-${usage}-highest`).parameters.power_selected, 'force');
    assert.equal(pick('buffs-suxin-jue-power-l200-sword-highest').parameters.actor.mappings.sword, 'yunv-jian');
    r.metrics[0].neili_recovery = 0; assert.throws(() => validateGumuSupportRecord(r, c));
});

test('静态依据保留原振奋错键，辅助异常不暗中转成毒伤或已修复行为', () => {
    const inspire = readFileSync(join(root, 'kungfu/skill/force/inspire.c'), 'utf8');
    assert.match(inspire, /set_temp\("pending\/exercise", 0\)/); assert.match(inspire, /set_temp\("pending\/healing", 0\)/);
    for (const c of group('healing')) assert.equal(c.parameters.observe_seconds, 90);
    for (const c of [...group('dispel'), ...group('buffs')]) assert.equal(c.parameters.observe_seconds, 0);
});

test('原null忙乱和空异常只在已存在字段内适配，raw记录与旧helper不改写', () => {
    const c = pick('healing-suxin-jue-heal-l200'), r = row(c), frozen = structuredClone(r);
    assert.equal(r.before[0].busy, null); assert.equal(r.after[0].busy, null); assert.equal(r.after[0].conditions, null);
    validateGumuSupportRecord(r, c);
    assert.equal(gumuSupportEffects([{ outcome: r.outcome, raw: r }], c.parameters).terminals.completed, 1);
    assert.deepEqual(r, frozen);
    for (const mutate of [r => delete r.after[0].busy, r => delete r.after[1].conditions,
        r => delete r.healing_steps.at(-1).state.busy, r => delete r.after[0].temp.pending.healing,
        r => r.healing_steps.at(-1).state.temp.pending.healing = null,
        r => r.after[0].conditions = [], r => r.after[0].conditions = 'unknown']) {
        const broken = row(c); mutate(broken);
        assert.throws(() => validateGumuSupportRecord(broken, c));
        assert.throws(() => gumuSupportEffects([{ outcome: broken.outcome, raw: broken }], c.parameters));
    }
});

test('技能、有效根骨、原始资源和稀疏计量必须可核验，缺项不免费', () => {
    const c = pick('healing-suxin-jue-heal-l200');
    assert.equal(row(c).before[0].effective_con, 56);
    for (const mutate of [r => delete r.before[0].qi, r => r.after[0].neili = null,
        r => r.before[0].effective_con = 36, r => r.healing_steps[0].state.effective_con++,
        r => r.before[0].temp.apply = null, r => r.after[0].learned = [], r => r.after[0].learned.force = null,
        r => r.after[0].learned.force = -1, r => delete r.before[0].effective_skills.force,
        r => r.metrics[0] = null, r => r.metrics[0].neili_cost = null,
        r => r.metrics[0].eff_qi_recovery--, r => r.metrics[0].neili_recovery = -1]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuSupportRecord(r, c));
    }
    const refused = pick('healing-suxin-jue-heal-l200-neili49'), r = row(refused);
    assert.deepEqual(r.metrics, [{}, {}]); validateGumuSupportRecord(r, refused);
});

test('原入口参数来自冻结条件，疗伤指定他人也不变成他疗', () => {
    const c = pick('healing-suxin-jue-heal-l200-other'), r = row(c);
    assert.ok(!Object.hasOwn(r, 'parameters')); assert.equal(r.launches[0].argument, 'heal right');
    assert.deepEqual(r.before[1], r.after[1]);
    assert.equal(gumuSupportEffects([{ outcome: r.outcome, raw: r }], c.parameters).command_accepted, 1);
    r.parameters = { skill: 'invented', ability: 'inspire', other: false };
    validateGumuSupportRecord(r, c);
    for (const mutate of [r => r.launches[0].argument = 'heal', r => r.launches[0].skill = 'suxin-jue',
        r => r.launches[0].actor = r.before[1].object, r => r.method = 'exert',
        r => r.metrics[0].ability_launched = 0]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuSupportRecord(r, c));
    }
});

test('原心跳耗时与看门狗分开，回调外自然恢复不冒充治疗或少扣费', () => {
    const c = pick('healing-suxin-jue-heal-l200-halt'), r = row(c);
    r.healing_halt = structuredClone(r.healing_halt); r.after[0] = structuredClone(r.after[0]);
    for (const state of [r.healing_halt.before, r.healing_halt.after, r.after[0]]) {
        // Synthetic natural gains between the callback and the original halt.
        state.eff_qi += 5; state.qi += 7; state.neili += 7;
    }
    r.metrics[0].eff_qi_recovery += 5; r.metrics[0].qi_recovery = 7; r.metrics[0].neili_recovery = 7;
    validateGumuSupportRecord(r, c);
    const stats = gumuSupportEffects([{ outcome: r.outcome, raw: r }], c.parameters);
    assert.equal(stats.effective_gain_outside_callbacks.mean, 5); assert.equal(stats.callback_curing.mean, 110);
    assert.equal(stats.callback_neili_cost.mean, 50); assert.equal(stats.halt_neili_cost.mean, 100);
    assert.equal(stats.elapsed.mean, r.elapsed); assert.notEqual(stats.elapsed.mean, c.parameters.observe_seconds);
    for (const mutate of [r => delete r.elapsed, r => r.healing_steps[1].elapsed = Infinity,
        r => r.healing_steps[0].elapsed = -1, r => r.healing_steps[1].elapsed = r.elapsed + 1,
        r => r.metrics[0].heartbeats = 0]) {
        const bad = row(c); mutate(bad); assert.throws(() => validateGumuSupportRecord(bad, c));
    }
});

test('驱除受理但未生效分母和强化步骤分母保持独立', () => {
    const c = pick('dispel-suxin-jue-drunk-self-l200-neili299'), r = row(c);
    const stats = gumuSupportEffects([{ outcome: r.outcome, raw: r }], c.parameters);
    assert.equal(stats.command_accepted, 1); assert.equal(stats.outcomes.unchanged, 1);
    assert.equal(stats.sides[0].cost.neili.mean, 0);
    const buffs = pick('buffs-suxin-jue-tianmo-l400-paired'), raw = row(buffs);
    const sequence = gumuSupportEffects([{ outcome: raw.outcome, raw }], buffs.parameters);
    assert.equal(sequence.attempts, 1); assert.equal(sequence.command_steps, 4);
    assert.equal(sequence.accepted_steps, 2); assert.equal(sequence.refused_steps, 2);
    assert.equal(sequence.experimental_refills, 2); assert.equal(sequence.command_accepted, 1);
    raw.buff_steps[2].after.neili = null;
    assert.throws(() => gumuSupportEffects([{ outcome: raw.outcome, raw }], buffs.parameters));
});

test('共享接线只向本组增加既有初态白名单、性格快照和冻结模块', () => {
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8').replace(/\s+/g, ' ');
    assert.match(runner, /\(\{ "emei-healing", "emei-dispel", "emei-buffs", "gumu-public-force", "mingjiao-public-force", "gumu-healing", "gumu-dispel", "gumu-buffs" \}\)\) != -1\) result\["cultivation"\]\["character"\] = ob->query\("character"\);/);
    assert.match(runner, /\(\{ "wudang-healing", "shaolin-healing", "emei-healing", "gumu-healing" \}\) \) != -1 && key == "tianmo" && value == 1/);
    assert.match(runner, /\(\{ "wudang-dispel", "wudang-condition", "shaolin-dispel", "emei-dispel", "gumu-dispel" \}\)\) != -1 && member_array\( key, \(\{ "drunk", "ill_kesou", "freezing", "damo_luanqi", "bandaged" \}\) \) != -1/);
    assert.match(runner, /if \(arrayp\(parameters\["buff_steps"\]\)\) \{ require\(member_array\( parameters\["collection_group"\], \(\{ "wudang-buffs", "shaolin-buffs", "emei-buffs", "gumu-buffs" \}\) \) != -1 && !parameters\["fighting"\] && sizeof\(parameters\["buff_steps"\]\) <= 6/);
    const sequence = runner.slice(runner.indexOf('if (arrayp(parameters["buff_steps"]))'), runner.indexOf('if (arrayp(parameters["repeat_actions"]))'));
    assert.match(sequence, /\(\{ 6000, 8000 \}\)/);
    assert.match(sequence, /\(\{ "exert power", "exert tianmo" \}\)/);
    assert.match(sequence, /if \(parameters\["persistence_probe"\]\) \{ require\(players\[0\]->observation_save_state\(\)/);
    assert.match(sequence, /restored_actor->observation_restore_state\(\)/);
    const execution = readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8');
    for (const name of ['school_gumu_support_cases', 'school_wudang_healing_cases', 'school_wudang_dispel_cases',
        'school_wudang_buffs_cases', 'school_public_force_report']) assert.ok(execution.includes(name), name);
    const report = readFileSync(join(root, 'tools/tests/martial_data/school_combat_report.mjs'), 'utf8');
    for (const name of ['healing', 'dispel', 'buffs']) assert.ok(report.includes(
        `if (condition.parameters.collection_group === 'gumu-${name}')\n            condition.${name} = gumuSupportEffects(rows.filter(r => r.condition_id === condition.id), condition.parameters);`));
});

test('共享报告按冻结条件展示三类效果，raw无parameters且不混入交锋分母', () => {
    const selected = [pick('healing-suxin-jue-heal-l200'), pick('healing-suxin-jue-heal-l200-neili49'),
        pick('dispel-suxin-jue-drunk-self-l200-neili299'), pick('dispel-suxin-jue-freezing-self-l200-partial'),
        pick('buffs-suxin-jue-power-l400-paired'), pick('buffs-suxin-jue-power-l400-persistence')];
    const rows = selected.map(c => ({ condition_id: c.id, outcome: c.parameters.expected, raw: row(c) }));
    for (const entry of rows) assert.equal(Object.hasOwn(entry.raw, 'parameters'), false);
    const conditions = selected.map(c => ({ ...c,
        counts: { observed: Number(c.parameters.expected === 'observed'), refused: Number(c.parameters.expected === 'refused'), error: 0 },
        effects: schoolCombatEffects(rows.filter(r => r.condition_id === c.id)),
        [c.parameters.collection_group.slice(5)]: gumuSupportEffects(rows.filter(r => r.condition_id === c.id), c.parameters) }));
    assert.equal(conditions[0].healing.terminals.completed, 1); assert.equal(conditions[1].healing.command_accepted, 0);
    assert.equal(conditions[2].dispel.command_accepted, 1); assert.equal(conditions[2].dispel.outcomes.unchanged, 1);
    assert.equal(conditions[3].dispel.outcomes.partial, 1);
    assert.equal(conditions[4].buffs.command_steps, 4); assert.equal(conditions[4].buffs.refused_steps, 2);
    assert.equal(conditions[5].buffs.restored_without_buff, 1);
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-not-a-series', evidence_sha256: 'synthetic',
        totals: { conditions: 6, samples: 6, observed: 5, refused: 1, errors: 0 }, conditions });
    const start = markdown.indexOf('## 公共强化序列与存储语义'); assert.ok(start > 0);
    assert.ok(!markdown.slice(0, start).includes('school-gumu-support-'));
    assert.ok(markdown.includes('## 异常状态驱除')); assert.ok(markdown.includes('## 原心跳疗伤与振奋'));
    assert.ok(!markdown.includes('## 门派组合：原心跳普通交锋'));
    for (const c of selected) assert.equal(markdown.split(`| ${c.id} |`).length - 1, 1);
});
