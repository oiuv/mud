// Registered collection group: preserve the frozen matrix and original exert/callback behavior.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const gumuExertFixtureRequirements = [
    'Register after the frozen batch; reuse original exert, repeat steps and bound callbacks without shortening their clocks.',
    'Observe original COMBAT_D skill_power for unarmed attack, dodge and parry before/after buffs; do not turn apply/defense into a fabricated dodge mapping.',
    'Reuse three connected USERs for roar, preserving original is_character, hostility, condition and resource snapshots; do not import public roar living/instant-faint behavior.',
    'Record mapped-force learning, cultivation.character, explicit idle null and all initial temporary values; classify reports from frozen conditions, never stripped raw.parameters.',
];
const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 6000, max_neili: 6000, con: 36 };
const forces = ['yunv-xinjing', 'surge-force'];
const bonus = (s, k) => s.temp.apply?.[k] ?? 0;
const costs = skill => skill === 'yunv-xinjing' ? 100 : 200;
const threshold = skill => skill === 'yunv-xinjing' ? 150 : 500;

export function gumuExertConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const rows = [];
    const target = (extra = {}) => ({ skills: { force: 200, dodge: 200, parry: 200 }, mappings: {}, preparations: {},
        properties: { ...pool, ...extra.properties }, ...(extra.conditions ? { conditions: extra.conditions } : {}) });
    function add(skill, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === `${skill}/${ability}`);
        assert.ok(source?.entries.some(e => e.role === 'exert'), `${skill}/${ability}`);
        const actor = { skills: { force: level, [skill]: level, unarmed: 200, dodge: 200, parry: 200, ...extra.skills },
            mappings: extra.unmapped ? {} : { force: skill }, preparations: {},
            properties: { ...pool, str: 45, int: 36, dex: 36, jiali: 0, gender: '男性', combat_exp: 100000000,
                character: '光明磊落', 'family/family_name': '古墓派', ...extra.properties },
            ...(extra.temp ? { temp: extra.temp } : {}), ...(extra.busy ? { busy: 2 } : {}),
            ...(extra.conditions ? { conditions: extra.conditions } : {}) };
        const expected = extra.expected ?? 'observed';
        const random = expected === 'observed' && (ability === 'roar' || extra.fighting);
        rows.push({ id: `school-gumu-exert-${skill}-${ability}-l${level}${extra.tag ? '-' + extra.tag : ''}`,
            stage: 'school', entry_id: source.entries.find(e => e.role === 'exert').id, method: 'exert',
            samples: smoke ? random ? 2 : 1 : random ? samples : 2,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-exert', skill, usage: 'force', ability,
                level, actor, target: target(extra.target), ...(ability === 'roar'
                    ? { extra_target: target(extra.third ?? { conditions: { die_guard: 100 } }) } : {}),
                named_participants: true, action: `exert ${ability}${extra.other ? ' right' : ''}`,
                fighting: extra.fighting ?? false, room: extra.room ?? {}, target_state: extra.targetState ?? '',
                expected, not_applicable: '', observation: extra.expiry ? 'timed_effect' : 'single_action_immediate',
                observe_seconds: extra.expiry ? level + 2 : 0,
                ...(extra.repeat ? { repeat_actions: [`exert ${ability}`, `exert ${ability}`] } : {}),
                qualification_sources: [source.path, `kungfu/skill/${skill}.c`, 'inherit/skill/force.c', 'inherit/skill/skill.c',
                    'kungfu/skill/force.c', 'kungfu/skill/force/roar.c', 'cmds/skill/exert.c', 'feature/skill.c',
                    'feature/action.c', 'feature/attack.c', 'feature/damage.c', 'feature/condition.c',
                    'adm/daemons/combatd.c', 'kungfu/condition/die_guard.c', 'kungfu/condition/exert_drug.c',
                    'kungfu/class/gumu/lin.c', 'kungfu/class/gumu/yang.c'],
                qualification_note: '真实非巫师USER经原exert，已掌握技能为实验输入，不证明学习资格或教师可授。'
                    + '三档即时量、原时间解除、公共战斗判定值分开；重复不补资源。黯然吟用三个原USER，'
                    + '原is_character不等同living，先建立敌对再伤害，没有公共狮子吼的立即昏迷/十点回补。'
                    + '即时负精神只记录现状，后续自然心跳及完整交锋另采，不修改随机或原伤害。',
            } });
    }
    for (const skill of forces) {
        for (const level of [200, 400, 800]) {
            add(skill, 'powerup', level);
            add(skill, 'powerup', level, { tag: 'fighting', fighting: true });
        }
        for (const [tag, extra] of [
            ['low-neili', { properties: { neili: threshold(skill) - 1 } }], ['other', { other: true }],
            ['busy', { busy: true }], ['unmapped', { unmapped: true }], ['no-exert', { temp: { no_exert: 1 } }],
            ['exert-drug', { conditions: { exert_drug: 10 } }], ['already', { temp: { powerup: 1 } }],
        ]) add(skill, 'powerup', 200, { tag, ...extra, expected: 'refused' });
        add(skill, 'powerup', 200, { tag: 'minimum-neili', properties: { neili: threshold(skill) } });
        add(skill, 'powerup', 200, { tag: 'repeat', repeat: true });
        add(skill, 'powerup', 200, { tag: 'no-fight', room: { no_fight: 1 } });
        add(skill, 'powerup', 200, { tag: 'other-family', properties: { 'family/family_name': '华山派' } });
        add(skill, 'powerup', 200, { tag: 'female', properties: { gender: '女性' } });
        add(skill, 'powerup', 200, { tag: 'basic-force0', skills: { force: 0 } });
        for (const level of [1, 199, 201]) add(skill, 'powerup', level);
        for (const level of [50, 200]) add(skill, 'powerup', level, { tag: 'expiry', expiry: true,
            temp: { 'apply/attack': 7, 'apply/defense': 11, 'apply/unarmed_damage': 13 } });
    }
    const roar = (tag, level = 200, extra = {}) => add('surge-force', 'roar', level, { tag, ...extra });
    for (const level of [200, 400, 800]) {
        const force = Math.trunc(level / 2) + level;
        roar('base', level);
        roar('low-resistance', level, { target: { properties: { max_neili: 0, neili: 0 } } });
        for (const offset of [-1, 0]) roar('wound-' + (offset ? 'below' : 'equal'), level,
            { target: { properties: { max_neili: 0, neili: force * 2 + offset } } });
    }
    for (const [tag, extra] of [
        ['skill99', { skills: { 'surge-force': 99 } }], ['neili99', { properties: { neili: 99 } }],
        ['busy', { busy: true }], ['unmapped', { unmapped: true }], ['no-exert', { temp: { no_exert: 1 } }],
        ['exert-drug', { conditions: { exert_drug: 10 } }], ['no-fight', { room: { no_fight: 1 } }],
    ]) roar(tag, 200, { ...extra, expected: 'refused' });
    roar('minimum', 100, { skills: { force: 0 }, properties: { neili: 100 } });
    roar('skybook', 200, { room: { skybook: 1 } });
    roar('low-actor-qi', 200, { properties: { qi: 10 } });
    for (const con of [75, 100, 150]) roar('con' + con, 200, { target: { properties: { con, neili: 0, max_neili: 0 } } });
    roar('third-low-resistance', 200, { target: { properties: { con: 150 } },
        third: { properties: { con: 36, neili: 0, max_neili: 0 } } });
    roar('die-guard', 200, { target: { conditions: { die_guard: 100 }, properties: { neili: 0, max_neili: 0 } } });
    roar('low-jing', 200, { target: { properties: { jing: 1, neili: 0, max_neili: 0 } } });
    roar('low-eff-jing', 200, { target: { properties: { jing: 100, eff_jing: 100, neili: 0, max_neili: 0 } } });
    roar('unconscious', 200, { targetState: 'unconscious', target: { properties: { neili: 0, max_neili: 0 } } });
    for (const [tag, third] of [['both-hit', { properties: { neili: 0, max_neili: 0 } }],
        ['third-zero-damage', { properties: { max_neili: 10000 } }],
        ['third-con-block', { properties: { con: 150, neili: 0, max_neili: 0 } }]])
        roar(tag, 200, { other: true, target: { properties: { neili: 0, max_neili: 0 } }, third });
    return rows;
}

export function gumuBuffDelta(skill, level) {
    assert.ok(forces.includes(skill));
    return skill === 'yunv-xinjing' ? { attack: Math.trunc(level / 3), defense: Math.trunc(level / 3) }
        : { attack: Math.trunc(level * 2 / 5), defense: Math.trunc(level * 2 / 5), unarmed_damage: Math.trunc(level / 5) };
}

// Oracle for observed public skill_power, not a replacement for its runtime call.
export function gumuBuffPower(s, kind) {
    const usage = kind === 'attack' ? 'unarmed' : kind, attr = kind === 'attack' ? 'str' : 'dex';
    const level = s.effective_skills[usage] + bonus(s, kind === 'attack' ? 'attack' : 'defense');
    let exp = s.combat_exp;
    if (exp >= 3000000) exp = 2100000 + Math.trunc((exp - 3000000) / 20);
    else if (exp >= 2000000) exp = 2000000 + Math.trunc((exp - 2000000) / 10);
    const power = level > 500 ? Math.trunc(level / 10) * level * level : Math.trunc(level ** 3 / 10);
    assert.ok(level > 0, '本组固定基础徒手/轻功/招架均为200');
    return Math.trunc((power + exp) / 30) * (s[attr] + (s.temp[attr] ?? 0));
}

const cleanTemp = s => { const t = structuredClone(s.temp); delete t.notify_fail; return t; };
const idle = value => value === null ? 0 : value;
function metrics(m) {
    assert.ok(m && typeof m === 'object' && !Array.isArray(m));
    for (const value of Object.values(m)) assert.ok(Number.isSafeInteger(value) && value >= 0, '未知计量不能当零');
    assert.equal(m.heartbeats ?? 0, 0, '即时/绑定回调组不混入原攻击心跳');
}
function identity(s) {
    assert.equal(s.userp, 1); assert.equal(s.playerp, 1); assert.equal(s.interactive, 1); assert.equal(s.wizardp, 0);
    assert.equal(s.is_character, 1);
    assert.ok(Object.hasOwn(s, 'busy') && Number.isSafeInteger(idle(s.busy)) && idle(s.busy) >= 0,
        '显式 null 空闲和缺失快照不能混同');
    assert.ok(Object.hasOwn(s, 'conditions') && (s.conditions === null || s.conditions && typeof s.conditions === 'object' && !Array.isArray(s.conditions)));
    for (const k of ['temp', 'skills', 'mappings', 'effective_skills', 'learned', 'cultivation'])
        assert.ok(s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]), k);
    for (const k of ['skills', 'effective_skills', 'learned']) for (const value of Object.values(s[k]))
        assert.ok(Number.isSafeInteger(value) && value >= 0, k + ' 已有键必须是已知非负整数');
    for (const k of resources) assert.ok(Number.isSafeInteger(s[k]), k + ' 不得缺失或未知');
}
function sameResources(b, a, except = []) {
    for (const k of resources.filter(k => !except.includes(k))) assert.equal(a[k], b[k], k);
}
function unchangedAbilities(b, a) {
    for (const k of ['skills', 'mappings', 'effective_skills', 'cultivation', 'conditions']) assert.deepEqual(a[k], b[k], k);
}
function resourceCounters(b, a, m) {
    metrics(m);
    for (const k of resources) {
        assert.equal(m[k + '_cost'] ?? 0, Math.max(0, b[k] - a[k]), k + ' 实际扣除');
        assert.equal(m[k + '_recovery'] ?? 0, 0, k + ' 无恢复分支');
    }
}

export function validateGumuExertRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-exert'); assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2);
    for (const k of ['launches', 'attacks', 'interfaces', 'callbacks', 'terminals']) assert.ok(Array.isArray(raw[k]));
    assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 0); assert.equal(raw.terminals.length, 0);
    const b = raw.before[0], a = raw.immediate[0], end = raw.after[0], ok = p.expected === 'observed';
    if (p.target_state === 'unconscious') {
        const prep = raw.preparation, target = raw.before[1];
        assert.ok(prep && typeof prep === 'object' && !Array.isArray(prep), '原昏迷准备证据不得丢弃');
        assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }], '准备昏迷不混入施术终态');
        for (const state of [prep.before, prep.after]) {
            identity(state);
            assert.equal(state.object, target.object, '准备状态必须属于原目标');
            assert.equal(state.id, target.id);
            assert.equal(state.ghost, 0);
        }
        assert.equal(prep.before.living, 1); assert.equal(prep.after.living, 0);
        for (const key of ['qi', 'jing']) assert.equal(prep.before[key], p.target.properties[key]);
        assert.deepEqual(prep.after, target, '正式窗口从原昏迷完成状态开始');
    } else assert.equal(Object.hasOwn(raw, 'preparation'), false);
    assert.equal(raw.command_accepted, Number(ok)); assert.equal(raw.launches.length, Number(ok));
    if (ok) {
        assert.equal(raw.launches[0].skill, p.skill);
        assert.equal(raw.launches[0].argument, p.action.slice('exert '.length));
    } else assert.ok(raw.reason);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const s = raw.before[side];
        for (const phase of ['before', 'immediate', 'after']) identity(raw[phase][side]);
        assert.deepEqual(s.skills, cfg.skills); assert.deepEqual(s.mappings, cfg.mappings);
        assert.deepEqual(s.conditions ?? {}, cfg.conditions ?? {});
        const effective = Object.fromEntries(Object.entries(cfg.skills).map(([k, value]) =>
            [k, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + bonus(s, k)]));
        assert.deepEqual(s.effective_skills, effective, '原 query_skill 有效值');
        for (const phase of ['immediate', 'after']) unchangedAbilities(s, raw[phase][side]);
        for (const [k, v] of Object.entries(cfg.properties)) {
            if (side === 1 && p.target_state === 'unconscious' && ['qi', 'jing'].includes(k)) assert.equal(s[k], 0);
            else assert.equal(k.includes('/') || k === 'character' ? s.cultivation[k] : s[k], v, k);
        }
        for (const [k, v] of Object.entries(cfg.temp ?? {})) assert.equal(k.startsWith('apply/') ? bonus(s, k.slice(6)) : s.temp[k], v);
        resourceCounters(s, raw.after[side], raw.metrics[side]);
    }
    assert.equal(idle(b.busy), p.actor.busy ?? 0);
    assert.equal(b.effective_skills.force, Math.trunc(p.actor.skills.force / 2)
        + (p.actor.mappings.force ? p.actor.skills[p.actor.mappings.force] : 0));
    assert.deepEqual(a.cultivation, b.cultivation); assert.deepEqual(b.learned, {});
    const gain = a.learned[p.skill] ?? 0;
    assert.ok(ok ? b.effective_skills.force >= 120 ? gain === 1 : gain === 0 || gain === 1 : gain === 0);
    for (const k of Object.keys(a.learned)) if (k !== p.skill) assert.equal(a.learned[k], 0);
    const cost = ok ? p.ability === 'roar' ? 100 : costs(p.skill) : 0;
    assert.equal(b.neili - a.neili, cost); assert.equal(raw.metrics[0].neili_cost ?? 0, cost);
    assert.equal(raw.metrics[0].neili_recovery ?? 0, 0);
    if (p.ability === 'roar') return validateRoar(raw, p, ok);
    sameResources(b, a, ['neili']); assert.deepEqual(raw.before[1], raw.immediate[1]); assert.deepEqual(raw.before[1], raw.after[1]);
    for (const m of raw.metrics) for (const k of resources.filter(k => k !== 'neili'))
        for (const suffix of ['cost', 'recovery']) assert.equal(m[k + '_' + suffix] ?? 0, 0);
    const delta = ok ? gumuBuffDelta(p.skill, b.skills[p.skill]) : {};
    for (const k of new Set([...Object.keys(b.temp.apply ?? {}), ...Object.keys(a.temp.apply ?? {}), ...Object.keys(delta)]))
        assert.equal(bonus(a, k) - bonus(b, k), delta[k] ?? 0, k);
    assert.equal(a.temp.powerup ?? 0, ok ? 1 : b.temp.powerup ?? 0);
    if (!ok) assert.equal(a.busy, b.busy);
    else if (p.fighting) assert.ok(Number.isInteger(a.busy) && a.busy >= 1 && a.busy <= 3);
    else assert.equal(idle(a.busy), 0);
    for (const s of [b, a, end]) for (const k of ['attack', 'dodge', 'parry']) assert.equal(s.powers?.[k], gumuBuffPower(s, k));
    if (p.repeat_actions) {
        assert.equal(raw.repeat_steps?.length, 2);
        const [first, second] = raw.repeat_steps;
        assert.deepEqual(first.before, b); assert.deepEqual(second.before, first.after); assert.deepEqual(second.after, a);
        for (const [i, step] of raw.repeat_steps.entries()) {
            assert.equal(step.action, p.repeat_actions[i]); assert.equal(step.accepted, i ? 0 : 1);
            assert.equal(step.launches_after - step.launches_before, i ? 0 : 1);
        }
        assert.ok(second.reason); sameResources(second.before, second.after);
        assert.deepEqual(cleanTemp(second.after), cleanTemp(second.before));
    }
    if (!p.observe_seconds) { assert.deepEqual(end, a); assert.equal(raw.callbacks.length, 0); return; }
    assert.deepEqual(raw.callbacks.map(c => [c.side, c.phase]), [[0, 'before'], [0, 'after']]);
    const [x, y] = raw.callbacks;
    assert.ok([raw.elapsed, x.elapsed, y.elapsed].every(v => Number.isFinite(v) && v >= 0));
    assert.ok(x.elapsed >= b.skills[p.skill] - 1 && y.elapsed >= x.elapsed && y.elapsed <= raw.elapsed);
    assert.ok(raw.elapsed >= p.observe_seconds - 1); assert.equal(x.state.temp.powerup, 1);
    for (const s of [x.state, y.state, end]) {
        assert.equal(s.object, b.object, '自然解除状态必须属于原施术者');
        identity(s); sameResources(a, s); unchangedAbilities(a, s);
        assert.deepEqual(s.learned, a.learned); assert.equal(idle(s.busy), idle(a.busy));
        for (const k of ['attack', 'dodge', 'parry']) assert.equal(s.powers?.[k], gumuBuffPower(s, k));
    }
    assert.deepEqual(cleanTemp(x.state), cleanTemp(a));
    for (const s of [y.state, end]) {
        sameResources(a, s); assert.equal(s.temp.powerup ?? 0, 0);
        for (const k of new Set([...Object.keys(b.temp.apply ?? {}), ...Object.keys(s.temp.apply ?? {})])) assert.equal(bonus(s, k), bonus(b, k));
    }
}

function validateRoar(raw, p, ok) {
    const [b, t] = raw.before, [a] = raw.immediate;
    assert.equal(b.living, 1); assert.equal(a.living, 1);
    assert.equal(t.living, p.target_state === 'unconscious' ? 0 : 1);
    assert.equal(raw.extra_target_before?.living, 1);
    identity(raw.extra_target_immediate);
    assert.deepEqual(raw.after, raw.immediate); assert.equal(raw.callbacks.length, 0);
    assert.equal(raw.extra_target_before?.object === t.object, false);
    assert.equal(new Set([b.object, t.object, raw.extra_target_before?.object]).size, 3);
    sameResources(b, a, ['qi', 'neili']); assert.equal(a.qi, b.qi - (ok ? 10 : 0));
    assert.equal(raw.metrics[0].qi_cost ?? 0, ok ? 10 : 0); assert.equal(a.busy, ok ? 5 : b.busy);
    assert.deepEqual(cleanTemp(a), cleanTemp(b));
    const force = b.effective_skills.force, minimum = Math.trunc(force / 2), maximum = minimum * 2 - 1;
    const enemies = [], wants = [];
    assert.deepEqual(b.hostility, { enemies: [], killers: [], wants: [] });
    for (const [before, after, cfg, m] of [[t, raw.immediate[1], p.target, raw.metrics[1]],
        [raw.extra_target_before, raw.extra_target_after, p.extra_target, raw.extra_target_metrics]]) {
        identity(before); identity(after); resourceCounters(before, after, m);
        assert.deepEqual(before.skills, cfg.skills); assert.deepEqual(before.mappings, cfg.mappings);
        assert.deepEqual(before.conditions ?? {}, cfg.conditions ?? {}); unchangedAbilities(before, after);
        assert.deepEqual(after.learned, before.learned);
        assert.equal(idle(after.busy), idle(before.busy));
        if (before !== t) for (const [k, v] of Object.entries(cfg.properties)) assert.equal(before[k], v);
        assert.deepEqual(before.hostility, { enemies: [], killers: [], wants: [] });
        const hit = a.hostility.wants.includes(before.id);
        // Unlike public force/roar, the original Gumu entry does not test living().
        if (!ok || before.conditions?.die_guard || maximum < before.con * 2) assert.equal(hit, false);
        else if (minimum >= before.con * 2) assert.equal(hit, true);
        const damage = hit ? Math.max(0, force - Math.trunc(before.max_neili / 10)) : 0;
        const wound = damage && before.neili < force * 2 ? damage : 0;
        assert.equal(after.eff_jing, Math.max(-1, before.eff_jing - wound));
        assert.equal(after.jing, Math.min(Math.max(-1, before.jing - damage * 2), after.eff_jing));
        sameResources(before, after, ['jing', 'eff_jing']); assert.equal(after.living, before.living); assert.equal(after.ghost, before.ghost);
        for (const k of resources) assert.equal(after[k], before[k] - (m[k + '_cost'] ?? 0) + (m[k + '_recovery'] ?? 0));
        for (const k of ['enemies', 'killers']) assert.deepEqual(after.hostility[k], hit && before.living ? ['left'] : []);
        assert.deepEqual(after.hostility.wants, []);
        if (hit) { enemies.push(before.id); wants.push(before.id); }
    }
    assert.deepEqual(raw.extra_target_after, raw.extra_target_immediate);
    assert.deepEqual([...a.hostility.enemies].sort(), enemies.sort()); assert.deepEqual([...a.hostility.wants].sort(), wants.sort());
    assert.deepEqual(a.hostility.killers, []);
}

export function gumuExertEffects(rows, condition) {
    const valid = rows.filter(r => r.outcome === 'observed' && r.raw), p = condition?.parameters;
    const ability = p?.collection_group === 'gumu-exert' && ['powerup', 'roar'].includes(p.ability) ? p.ability : null;
    const buffs = ability === 'powerup' ? valid : [], roars = ability === 'roar' ? valid : [];
    const delta = (a, b, k) => Number.isFinite(a?.[k]) && Number.isFinite(b?.[k]) ? a[k] - b[k] : null;
    return { observed: valid.length, other_or_unknown: rows.length - valid.length, unknown_ability: ability ? 0 : valid.length,
        buff: { samples: buffs.length,
            powers: Object.fromEntries(['attack', 'dodge', 'parry'].map(k => [k, distribution(buffs.map(({raw:r}) => delta(r.immediate?.[0]?.powers, r.before?.[0]?.powers, k)))])),
            expiry_seconds: distribution(buffs.map(({raw:r}) => r.callbacks?.find(c => c.phase === 'before')?.elapsed)),
        },
        roar: [1, 2].map(side => {
            const values = roars.map(({raw:r}) => ({ b: side === 1 ? r.before?.[1] : r.extra_target_before,
                a: side === 1 ? r.immediate?.[1] : r.extra_target_immediate, caster: r.immediate?.[0] }));
            const known = values.filter(v => typeof v.b?.id === 'string' && Array.isArray(v.caster?.hostility?.wants));
            return { samples: values.length, unknown_hostility: values.length - known.length,
                affected: probability(known.filter(v => v.caster.hostility.wants.includes(v.b.id)).length, known.length),
                jing_net: distribution(values.map(v => delta(v.a, v.b, 'jing'))),
                eff_jing_net: distribution(values.map(v => delta(v.a, v.b, 'eff_jing'))) };
        }) };
}
