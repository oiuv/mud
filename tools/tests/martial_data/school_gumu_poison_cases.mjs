// Original command and condition-heartbeat observations, separate from ordinary combat.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';
import { poisonDamageBounds } from './school_emei_jiuyin_passive_cases.mjs';

const skill = 'wudu-shenzhang', name = 'wudu_shenzhang';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const common = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
    jiali: 0, combat_exp: 10000000, 'immune/poison': 0, 'special_skill/piyi': 0 };

export const gumuPoisonFixtureRequirements = [
    'Load the original five-poisons skill in the actual attacker context before mapping validation (actor 1 for lifecycle, actor 0 otherwise); record and validate first-load identity without replacing its global action table.',
    'Snapshot character, grant, immunity, piyi and initial conditions; initialize condition observation arrays for immediate cases too, and record immediate and final cumulative resource metrics.',
    'For seeded lifecycle cases actor 1 performs the original strike.shi against actor 0; observe its launch and immediate effect.',
    'After the seed action explicitly stop both combat relationships, then enable only the victim original USER heartbeat; this is not a bout.',
    'If the seed is blocked by piyi, finish without enabling poison heartbeat or fabricating a tick; otherwise use existing before/after condition probes and original heartbeat timing.',
    'Verify the temporary combat probe records direct-attack jiali as well as explicit perform costs; no inferred net-only accounting.',
];

export function gumuPoisonConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source = catalog.skills.find(s => s.id === skill + '/shi');
    const entry = source?.entries.find(e => e.role === 'perform')?.id;
    assert.ok(entry, '缺少万毒噬体原入口');
    const result = [];
    function add(suffix, extra = {}) {
        const level = extra.level ?? 200, lifecycle = !!extra.lifecycle;
        const attacker = { skills: { strike: level, [skill]: level, force: 200, 'yunv-xinjing': 200,
            dodge: level, 'qixing-bu': level, parry: level, ...extra.skills },
            mappings: { strike: skill, parry: skill, force: 'yunv-xinjing', dodge: 'qixing-bu' },
            preparations: extra.noPrepare ? {} : { strike: skill },
            properties: { ...common, gender: '女性', character: '国士无双', 'family/family_name': '古墓派',
                'can_perform/wudu-shenzhang/shi': 1, ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: extra.busy } : {}) };
        if (extra.noMap) delete attacker.mappings.strike;
        const victim = { skills: { force: extra.force === undefined ? 600 : extra.force * 2, parry: 600, dodge: 600 },
            mappings: {}, preparations: {}, properties: { ...common, gender: '男性', shen: 0,
                character: '光明磊落', ...extra.victimProperties },
            ...(extra.prior ? { conditions: { [name]: extra.prior } } : {}),
            ...(extra.targetBusy ? { busy: extra.targetBusy } : {}),
            ...(extra.nopoison ? { temp: { nopoison: 1 } } : {}) };
        const seed = lifecycle && !!extra.seed;
        if (lifecycle && !seed) victim.conditions = { [name]: {
            level: extra.poisonLevel ?? 30, remain: extra.remain ?? (extra.poisonLevel ?? 30),
            id: 'foreign', name: '噬心毒' } };
        const expected = extra.expected ?? 'observed';
        const random = !lifecycle && !extra.checks && expected === 'observed';
        result.push({ id: 'school-gumu-poison-' + suffix, stage: 'school', entry_id: entry,
            method: lifecycle ? 'condition' : 'perform', samples: smoke ? 2 : random ? samples : 2,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-poison', skill, ability: 'shi',
                usage: 'strike', level, combination: 'wudu-shenzhang+yunv-xinjing+qixing-bu',
                actor: lifecycle ? victim : attacker, target: lifecycle ? attacker : victim,
                named_participants: true, fighting: lifecycle ? seed : extra.fighting ?? true,
                action: lifecycle ? 'original_condition_heartbeat' : 'perform strike.shi',
                ...(lifecycle ? { seed_mode: seed ? 'original_perform' : 'preset_condition', seed_side: 1,
                    seed_action: seed ? 'perform strike.shi' : '', stop_combat_after_seed: seed,
                    condition_name: name, ticks: extra.ticks ?? 1 } : {}),
                observation: lifecycle ? 'original_condition_heartbeat' : 'single_action_immediate',
                observe_seconds: lifecycle ? 45 : 0, expected, not_applicable: '',
                sampling: random ? 'random_distribution' : 'boundary_or_lifecycle_checks',
                qualification_sources: [source.path, 'kungfu/skill/wudu-shenzhang.c', 'kungfu/skill/yunv-xinjing.c',
                    'kungfu/skill/qixing-bu.c', 'kungfu/class/gumu/li.c', 'kungfu/class/gumu/gumu.h',
                    'feature/skill.c', 'feature/damage.c', 'feature/condition.c', 'feature/action.c',
                    'inherit/skill/skill.c', 'inherit/char/char.c', 'inherit/condition/poison.c',
                    'kungfu/condition/wudu_shenzhang.c', 'include/condition.h', 'cmds/skill/perform.c', 'adm/daemons/combatd.c'],
                qualification_note: '真实非巫师USER；门槛内力120不是费用。目标正神／非女性增加20／30计数，直伤另可能扣公共加力。原final产生毒与8至11精神创伤，piyi只阻施毒不阻该创伤。毒强度和剩余量由原参数组合及合并规则核对，零强度不直接假定无效。生命周期actor0是受毒者；原施展与显式预置异常分开，种毒后主动解除战斗关系以隔离毒发。沿原心跳，仅两次检查机制，不估毒伤概率分布，也不代替完整战斗或自然养成。',
            } });
    }
    for (const level of [200, 400, 800]) for (const jiali of [0, 50])
        add(`l${level}-jiali${jiali}`, { level, properties: { jiali } });
    for (const gender of ['女性', '男性']) for (const shen of [0, 1])
        add(`gender${gender === '女性' ? 'f' : 'm'}-shen${shen}`, { victimProperties: { gender, shen } });
    for (const force of [1, 100000]) add('force' + force, { force });
    for (const jiali of [1, 100, 119, 120, 121, 200]) add('low-neili-jiali' + jiali,
        { properties: { neili: 120, jiali } });
    for (const [id, label] of [['left', 'same'], ['foreign', 'other']]) for (const level of [5, 300])
        add(`merge-${label}-${level}`, { prior: { id, level, remain: 600, name: '噬心毒' } });
    add('merge-other-name', { prior: { id: 'foreign', level: 300, remain: 600, name: '旧毒' } });
    add('piyi', { victimProperties: { 'special_skill/piyi': 1 } });
    add('full-immunity', { victimProperties: { 'immune/poison': -1 } });
    add('nopoison', { nopoison: true });
    add('target-busy', { targetBusy: 50 });
    add('weapon', { weapon: true });
    const check = (suffix, extra = {}) => add(suffix, { checks: true, ...extra });
    check('no-grant', { properties: { 'can_perform/wudu-shenzhang/shi': 0 }, expected: 'refused' });
    for (const low of [false, true]) {
        const prefix = low ? 'low' : 'minimum', expected = low ? 'refused' : 'observed';
        check(prefix + '-skill', { skills: { [skill]: 150 - Number(low) }, expected });
        check(prefix + '-force', { skills: { force: 2, 'yunv-xinjing': 199 - Number(low) }, expected });
        check(prefix + '-neili', { properties: { neili: 120 - Number(low) }, expected });
    }
    check('no-map', { noMap: true, expected: 'refused' });
    check('no-prepare', { noPrepare: true, expected: 'refused' });
    check('busy', { busy: 2, expected: 'refused' });
    check('no-fight', { fighting: false, expected: 'refused' });
    for (const level of [0, 20, 30, 50, 100]) add('preset-expire-' + level,
        { lifecycle: true, poisonLevel: level, force: 300 });
    add('preset-two-ticks', { lifecycle: true, poisonLevel: 30, remain: 60, ticks: 2, force: 300 });
    add('preset-no-force', { lifecycle: true, poisonLevel: 30, remain: 60, ticks: 2, force: 0 });
    add('preset-zero-no-force', { lifecycle: true, poisonLevel: 0, remain: 0, ticks: 2, force: 0 });
    for (const [suffix, extra] of [
        ['zero', { force: 10, victimProperties: { gender: '女性' } }],
        ['two-ticks', { force: 100, ticks: 2 }], ['persist', { force: 0, ticks: 2 }],
        ['immune', { force: 100, victimProperties: { 'immune/poison': -1 } }],
        ['partial-immune', { force: 100, victimProperties: { 'immune/poison': 20 } }],
        ['piyi', { force: 100, victimProperties: { 'special_skill/piyi': 1 }, ticks: 0 }],
        ['nopoison', { force: 100, nopoison: true }],
    ]) add('seed-' + suffix, { lifecycle: true, seed: true, ...extra });
    return result;
}

function counter(metrics, side, key) {
    assert.ok(metrics?.[side] && typeof metrics[side] === 'object' && !Array.isArray(metrics[side]));
    const value = Object.hasOwn(metrics[side], key) ? metrics[side][key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '未知或无效计数：' + key);
    return value;
}

function busy(state) {
    assert.ok(Object.hasOwn(state, 'busy'), '缺少忙乱观察');
    const value = state.busy === null ? 0 : state.busy;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '未知忙乱值');
    return value;
}

export function gumuPoisonFactors(attacker, victim) {
    let ap = attacker.effective_skills.strike, count = 0;
    if (victim.shen > 0) { count += 20; ap += Math.trunc(ap * 10 / 100); }
    if (victim.gender !== '女性') { count += 30; ap += Math.trunc(ap * 15 / 100); }
    return { ap, count };
}

function validateImmediate(raw, c, side) {
    const p = c.parameters, other = 1 - side, [b, t] = [raw.before[side], raw.before[other]],
        [a, v] = [raw.immediate[side], raw.immediate[other]], m = raw.immediate_metrics;
    const direct = counter(m, side, 'direct');
    const unchanged = () => { for (const i of [0, 1]) {
        for (const key of health) assert.equal(raw.immediate[i][key], raw.before[i][key]);
        assert.equal(busy(raw.immediate[i]), busy(raw.before[i]));
        assert.deepEqual(raw.immediate[i].conditions, raw.before[i].conditions);
    } };
    const preset = c.method === 'condition' && p.seed_mode === 'preset_condition';
    if (preset || p.expected === 'refused') {
        assert.equal(raw.launches.length, 0); assert.equal(direct, 0); unchanged();
        for (const i of [0, 1]) for (const key of health) assert.equal(counter(m, i, key + '_cost'), 0);
        if (!preset) assert.ok(raw.reason?.length > 0);
        return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, skill);
    assert.equal(raw.launches[0].argument, 'shi'); assert.ok([0, 1].includes(direct));
    const { ap, count } = gumuPoisonFactors(b, t), dp = t.effective_skills.force;
    if (Math.trunc(ap / 2) > dp) assert.equal(direct, 1);
    if (Math.trunc(ap / 2) + ap - 1 <= dp) assert.equal(direct, 0);
    const jialiCost = direct && b.jiali > 0 && b.neili >= b.jiali ? b.jiali : 0;
    assert.equal(counter(m, side, 'neili_cost'), direct ? count + jialiCost : 0);
    assert.ok(direct ? busy(a) >= 1 && busy(a) <= 3 : busy(a) === 2);
    assert.equal(busy(v), direct ? busy(t) : 1);
    if (!direct) {
        for (const key of health) assert.equal(v[key], t[key]);
        assert.deepEqual(v.conditions, t.conditions); return;
    }
    assert.ok(v.qi < t.qi, '本组正伤害直伤应实际扣血');
    const wound = t.eff_jing - v.eff_jing;
    assert.ok(Number.isInteger(wound) && wound >= 8 && wound <= 11);
    assert.equal(v.jing, Math.min(t.jing, v.eff_jing));
    const prior = t.conditions?.[name], actual = v.conditions?.[name];
    if (t.cultivation['special_skill/piyi']) { assert.deepEqual(actual, prior); return; }
    assert.ok(actual && typeof actual === 'object');
    assert.equal(actual.id, !prior || prior.id === b.id ? b.id : '...');
    const durations = Array.from({ length: Math.max(1, Math.trunc(ap / 30)) }, (_, i) => Math.trunc(ap / 70) + i);
    assert.ok(Array.from({ length: Math.max(1, b.jiali) }, (_, i) => b.jiali + i + count).some(level =>
        Math.max(prior?.level ?? 0, level) === actual.level
        && durations.some(duration => (prior?.remain ?? 0) + level * duration === actual.remain)),
    '毒强度／剩余量必须来自原随机参数和合并规则');
    assert.equal(actual.name, !prior || prior.name === '噬心毒' ? '噬心毒' : actual.level >= 100 ? '剧毒' : '毒');
    assert.equal(Object.hasOwn(actual, 'duration'), false, '原存储为remain，不保留duration字段');
}

export function validateGumuPoisonTick(pre, post, settled, conditionName = name) {
    const b = pre.state, a = post.state, cnd = b.conditions?.[conditionName];
    assert.ok(cnd && Number.isSafeInteger(cnd.level) && cnd.level >= 0);
    const immune = b.cultivation['immune/poison'], blocked = !!b.cultivation['special_skill/piyi'] || !!b.temp.nopoison;
    for (const kind of ['qi', 'jing']) {
        const damage = b[kind] - a[kind], [min, max] = poisonDamageBounds(cnd.level, kind);
        if (blocked || immune === -1) assert.equal(damage, 0);
        else assert.ok(Number.isInteger(damage) && damage >= min && damage <= max);
        assert.equal(b['eff_' + kind] - a['eff_' + kind], Math.min(Math.trunc(damage / 2), b['eff_' + kind]));
    }
    assert.equal(a.neili, b.neili);
    const threshold = b.effective_skills.force + immune, lo = Math.trunc(cnd.level / 2),
        hi = lo + Math.max(1, cnd.level) - 1;
    const forced = blocked || immune === -1 || cnd.id === 'nature poison';
    const possibilities = [];
    if (!forced && hi >= threshold) possibilities.push({ flag: 3, conditions: { [conditionName]: cnd } });
    if (forced || lo < threshold) {
        const clear = blocked || immune === -1 || cnd.remain - immune <= cnd.level;
        possibilities.push({ flag: clear ? 0 : 3,
            conditions: clear ? {} : { [conditionName]: { ...cnd, remain: cnd.remain - immune - cnd.level } } });
    }
    assert.ok(possibilities.some(x => {
        try { assert.equal(post.flag, x.flag); assert.deepEqual(settled.state.conditions || {}, x.conditions); return true; }
        catch { return false; }
    }), '原心跳去毒／保留状态不匹配');
    for (const key of health) {
        assert.ok(settled.state[key] >= a[key], '毒发后自然恢复不可混为伤害');
        if (post.flag & 2) assert.equal(settled.state[key], a[key]);
    }
}

export function validateGumuPoisonRecord(raw, c) {
    const p = c.parameters, lifecycle = c.method === 'condition', side = lifecycle ? 1 : 0;
    assert.equal(p.collection_group, 'gumu-poison'); assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'after', 'immediate_metrics', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'attacks', 'dropped', 'condition_events', 'condition_heartbeats']) assert.ok(Array.isArray(raw[key]), key);
    const load = raw.skill_load_context, attacker = raw.before[side];
    assert.equal(load?.actor, attacker.object, '五毒须记录实际施毒者的加载上下文');
    assert.ok(typeof load?.actor === 'string' && load.actor.length);
    assert.equal(load.command, 'enable parry wudu-shenzhang');
    assert.deepEqual(load.skills, attacker.skills);
    assert.ok([0, 1].includes(load.already_loaded));
    for (const [i, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[i];
        assert.equal(b.userp, 1); assert.equal(b.interactive, 1); assert.equal(b.wizardp, 0);
        assert.equal(b.weapon, cfg.equipment?.type ?? 'none'); assert.equal(busy(b), cfg.busy ?? 0);
        assert.ok(typeof b.id === 'string' && b.id.length); assert.equal(b.temp.nopoison ?? 0, cfg.temp?.nopoison ?? 0);
        assert.deepEqual(b.mappings, cfg.mappings); assert.deepEqual(b.preparations, cfg.preparations);
        assert.deepEqual(b.conditions || {}, cfg.conditions || {});
        for (const [key, value] of Object.entries(cfg.skills)) {
            assert.equal(b.skills[key] ?? 0, value);
            assert.ok(b.temp.apply && typeof b.temp.apply === 'object');
            assert.equal(b.effective_skills[key], Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0)
                + (b.temp.apply[key] ?? 0));
        }
        for (const [key, value] of Object.entries(cfg.properties))
            assert.equal(key.includes('/') || key === 'character' ? b.cultivation[key] : b[key], value, key);
        for (const [states, metrics] of [[raw.immediate, raw.immediate_metrics], [raw.after, raw.metrics]]) {
            busy(states[i]);
            for (const key of health) {
                assert.ok(Number.isFinite(states[i][key]));
                assert.equal(b[key] - states[i][key], counter(metrics, i, key + '_cost') - counter(metrics, i, key + '_recovery'));
                if (i === side && key !== 'neili' || i !== side && key === 'neili') assert.equal(counter(metrics, i, key + '_cost'), 0);
            }
            assert.equal(states[i].max_neili, b.max_neili); assert.equal(states[i].weapon, b.weapon);
            assert.deepEqual(states[i].temp.apply, b.temp.apply);
        }
    }
    for (const i of [0, 1]) for (const key of [...health.flatMap(k => [k + '_cost', k + '_recovery']), 'direct', 'heartbeats'])
        assert.ok(counter(raw.metrics, i, key) >= counter(raw.immediate_metrics, i, key));
    for (const i of [0, 1]) {
        assert.equal(counter(raw.immediate_metrics, i, 'heartbeats'), 0);
        for (const key of health) assert.equal(counter(raw.immediate_metrics, i, key + '_recovery'), 0);
    }
    assert.equal(raw.attacks.length, 0); assert.equal(raw.dropped.length, 0);
    assert.equal(counter(raw.metrics, 1 - side, 'direct'), 0);
    validateImmediate(raw, c, side);
    if (!lifecycle) {
        assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.metrics, raw.immediate_metrics);
        assert.equal(raw.condition_events.length, 0); assert.equal(raw.condition_heartbeats.length, 0);
        for (const i of [0, 1]) assert.equal(counter(raw.metrics, i, 'heartbeats'), 0);
        return;
    }
    assert.equal(raw.condition_events.length, p.ticks * 2); assert.equal(raw.condition_heartbeats.length, p.ticks);
    assert.equal(counter(raw.metrics, 1, 'heartbeats'), 0);
    assert.equal(counter(raw.metrics, 1, 'direct'), counter(raw.immediate_metrics, 1, 'direct'));
    assert.ok(counter(raw.metrics, 0, 'heartbeats') >= p.ticks);
    if (p.seed_mode === 'original_perform') assert.deepEqual(raw.combat_stopped_after_seed, [1, 1]);
    for (let i = 0; i < p.ticks; i++) {
        const [pre, post] = raw.condition_events.slice(i * 2, i * 2 + 2), settled = raw.condition_heartbeats[i];
        assert.equal(pre.phase, 'before'); assert.equal(post.phase, 'after');
        for (const e of [pre, post]) {
            assert.equal(e.name, name); assert.equal(e.daemon, '/kungfu/condition/' + name);
            assert.ok(Number.isFinite(e.elapsed) && e.elapsed >= 0 && e.elapsed <= raw.elapsed);
        }
        const previous = i ? raw.condition_heartbeats[i - 1].state : raw.immediate[0];
        for (const key of health) assert.equal(pre.state[key], previous[key]);
        assert.deepEqual(pre.state.conditions, previous.conditions);
        validateGumuPoisonTick(pre, post, settled);
        assert.ok(settled.elapsed >= post.elapsed && post.elapsed >= pre.elapsed);
        if (i) assert.ok(pre.elapsed > raw.condition_heartbeats[i - 1].elapsed);
    }
    if (p.ticks) {
        const end = raw.condition_heartbeats.at(-1).state;
        for (const key of health) assert.equal(raw.after[0][key], end[key]);
        assert.deepEqual(raw.after[0].conditions, end.conditions);
        assert.ok(raw.elapsed > 0 && raw.elapsed < p.observe_seconds);
    } else {
        assert.deepEqual(raw.after[0], raw.immediate[0]); assert.ok(!raw.after[0].conditions?.[name]);
    }
    assert.deepEqual(raw.after[1], raw.immediate[1]);
}

// Call with original event order from a single isolated poison run, never sorted ledger files.
export function validateGumuPoisonLoads(records) {
    const loads = records.filter(r => r.condition_id?.startsWith('school-gumu-poison-'));
    for (const [index, row] of loads.entries()) {
        assert.ok(['condition', 'perform'].includes(row.method), '未知施毒观察入口');
        const side = row.method === 'condition' ? 1 : 0, load = row.skill_load_context;
        assert.equal(load?.already_loaded, Number(index > 0), '五毒实际首次加载证据缺失');
        assert.ok(typeof load.actor === 'string' && load.actor.length);
        assert.equal(load.actor, row.before[side].object);
        assert.equal(load.command, 'enable parry wudu-shenzhang');
        assert.deepEqual(load.skills, row.before[side].skills);
    }
}

export function gumuPoisonEffects(records, condition) {
    const rows = records.filter(r => r.outcome === 'observed').map(r => r.raw);
    // Runner removes repeated parameters from raw samples; the frozen condition owns this classification.
    const observation = condition?.parameters?.observation;
    const immediate = observation === 'single_action_immediate' ? rows : [];
    const known = immediate.filter(r => r.before?.[1] && r.immediate?.[1] && Object.hasOwn(r.immediate[1], 'conditions'));
    const lifecycle = observation === 'original_condition_heartbeat' ? rows : [];
    const ticks = lifecycle.flatMap(r => (r.condition_heartbeats ?? []).map((settled, i) => ({
        before: r.condition_events?.[2 * i], after: r.condition_events?.[2 * i + 1], settled })));
    return { immediate_samples: immediate.length,
        poison_present_after: probability(known.filter(r => !!r.immediate[1].conditions?.[name]).length, known.length),
        immediate_spirit_wound: distribution(immediate.map(r => r.before?.[1]?.eff_jing - r.immediate?.[1]?.eff_jing)),
        lifecycle_samples: lifecycle.length, ticks: ticks.length,
        tick_damage: Object.fromEntries(health.map(k => [k, distribution(ticks.map(t => t.before?.state?.[k] - t.after?.state?.[k]))])),
        // Presence after a cast is not a new-application probability when prior poison was configured.
        unknown_immediate: immediate.length - known.length,
        unclassified: rows.length - immediate.length - lifecycle.length, unobserved: records.length - rows.length };
}
