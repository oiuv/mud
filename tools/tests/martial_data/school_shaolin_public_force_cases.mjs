// Public-force entries are exercised with Shaolin mappings, not credited as school-exclusive skills.
import assert from 'node:assert/strict';
import { publicForceConditions, validateWudangPublicForceRecord } from './school_wudang_public_force_cases.mjs';
import { shaolinForces } from './school_shaolin_cultivation_cases.mjs';
import { distribution, probability } from './statistics.mjs';

export function shaolinPublicForceConditions(catalog, options = {}) {
    const sources = ['kungfu/class/shaolin/da-mo.c', 'kungfu/class/shaolin/du-e.c', 'kungfu/class/shaolin/du-yuan.c',
        'inherit/skill/force.c', 'kungfu/skill/buddhism.c'];
    const result = publicForceConditions(catalog, options, {
        school: 'shaolin', family: '少林派', forces: shaolinForces, sword: 'damo-jian', sources,
        skills: { buddhism: 800 }, refusedAbilities: ['shot'],
        note: '真实非巫师USER经原exert回退公共force；四门少林内功各自采集，佛学800用于避开已另测的少林反噬。等级、门派、邪气和资源是实验赋值，不证明从师或自然养成；天魔为门槛合格的邪气实验，不称常规少林培养。lifeheal为存活受伤目标；dispel仅无异常起手和不作用分支，毒伤另测；power/tianmo仅即时效果，未据此声明生命周期。shot只观察白名单拒绝；roar另有群体及保护边界条件。',
    });
    const entry = catalog.skills.find(s => s.id === 'force/roar')?.entries.find(e => e.role === 'exert')?.id;
    assert.ok(entry);
    const resources = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
        max_jing: 10000, neili: 6000, max_neili: 6000, con: 36 };
    function target(extra = {}) {
        return { skills: { force: 200, dodge: 200, parry: 200 }, mappings: {}, preparations: {},
            properties: { ...resources, ...extra.properties }, ...(extra.conditions ? { conditions: extra.conditions } : {}) };
    }
    function add(tag, level = 200, extra = {}) {
        const force = extra.force ?? 'yijinjing';
        const actor = { skills: { force: level, [force]: level, buddhism: 800, ...extra.skills },
            mappings: extra.noForceMap ? {} : { force }, preparations: {},
            properties: { ...resources, str: 36, int: 36, dex: 36, jiali: 0, combat_exp: 100000000,
                shen: 200000, 'family/family_name': '少林派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}) };
        result.push({ id: `school-shaolin-public-force-${force}-roar-l${level}-${tag}`,
            stage: 'school', entry_id: entry, method: 'exert',
            samples: options.smoke ? 2 : extra.checks ?? options.samples ?? 100,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-public-force',
                skill: force, usage: 'force', ability: 'roar', level, combination: tag,
                actor, target: target(extra.target),
                // Always re-create the third connected USER; never leave a previous AOE target in the room.
                extra_target: target(extra.third ?? { conditions: { die_guard: 100 } }),
                named_participants: true, observation: 'single_action_immediate', observe_seconds: 0,
                action: `exert roar${extra.other ? ' right' : ''}`, other: extra.other ?? false, fighting: false,
                room: extra.room ?? {}, target_state: extra.targetState ?? '',
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...sources, `kungfu/skill/${force}.c`, 'kungfu/skill/force/roar.c',
                    'kungfu/skill/force.c', 'cmds/skill/exert.c', 'inherit/skill/skill.c',
                    'feature/skill.c', 'feature/damage.c', 'feature/attack.c', 'feature/condition.c',
                    'kungfu/condition/die_guard.c'],
                qualification_note: '真实三名非巫师USER，仅执行一次原exert roar，记录两个房内旁观者及施术者；原随机、伤害、昏迷和敌对接口不替换。佛学800隔离运功反噬；被保护的第三人也单独留证。混元一气不是白名单中的混元功。高资源组不推定致死率；低精神组只观察即时昏迷，不宣称后续复苏或死亡。',
            } });
    }
    for (const level of [200, 400, 800]) {
        const skill = level * 3 / 2;
        add('normal-resistance', level);
        add('low-resistance', level, { target: { properties: { max_neili: 0, neili: 0 } } });
        add('wound-below', level, { target: { properties: { max_neili: 0, neili: skill * 2 - 1 } } });
        add('wound-equal', level, { target: { properties: { max_neili: 0, neili: skill * 2 } } });
    }
    for (const force of shaolinForces.filter(f => f !== 'yijinjing'))
        add('whitelist-refused', 800, { force, expected: 'refused', checks: 2 });
    for (const [tag, extra] of [
        ['effective179', { skills: { force: 158, yijinjing: 100 } }],
        ['neili799', { properties: { neili: 799 } }], ['busy', { busy: true }],
        ['no-force-map', { noForceMap: true }], ['no-fight', { room: { no_fight: 1 } }],
        ['skybook', { room: { skybook: 1 } }],
    ]) add(tag, 200, { ...extra, expected: 'refused', checks: 2 });
    add('minimum', 200, { skills: { force: 160, yijinjing: 100 }, properties: { neili: 800 }, checks: 2 });
    add('con-always-pass', 200, { target: { properties: { con: 75, max_neili: 0, neili: 0 } } });
    add('con-always-block', 200, { target: { properties: { con: 150, max_neili: 0, neili: 0 } } });
    add('con-random', 200, { target: { properties: { con: 100, max_neili: 0, neili: 0 } } });
    add('die-guard', 200, { target: { conditions: { die_guard: 100 }, properties: { max_neili: 0, neili: 0 } }, checks: 2 });
    add('already-unconscious', 200, { targetState: 'unconscious', checks: 2 });
    add('unconscious-on-hit', 200, { target: { properties: { jing: 1, max_neili: 0, neili: 0 } }, checks: 2 });
    add('wound-unconscious', 200, { target: { properties: { jing: 100, eff_jing: 100, max_neili: 0, neili: 0 } }, checks: 2 });
    for (const [tag, third] of [
        ['both-hit', { properties: { max_neili: 0, neili: 0 } }],
        ['third-no-damage', { properties: { max_neili: 10000 } }],
        ['third-con-block', { properties: { con: 150, max_neili: 0 } }],
    ]) add(tag, 200, { other: true, target: { properties: { max_neili: 0, neili: 0 } }, third });
    return result;
}

const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const zero = v => v ?? 0;
export function validateShaolinPublicForceRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'shaolin'); assert.equal(raw.outcome, p.expected);
    assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    for (const [i, cfg] of [[0, p.actor], [1, p.target]]) {
        assert.equal(raw.before[i].userp, 1); assert.equal(raw.before[i].wizardp, 0);
        assert.deepEqual(raw.before[i].skills, cfg.skills);
    }
    if (p.ability !== 'roar') return validateWudangPublicForceRecord(raw, condition);
    assert.equal(p.observe_seconds, 0); assert.equal(condition.method, 'exert');
    assert.deepEqual(raw.after, raw.immediate); assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 0);
    const [b, bt] = raw.before, [a, at] = raw.after;
    const targets = [[bt, at, p.target, raw.metrics[1]],
        [raw.extra_target_before, raw.extra_target_after, p.extra_target, raw.extra_target_metrics]];
    assert.deepEqual(raw.extra_target_immediate, raw.extra_target_after);
    assert.equal(new Set([b.object, bt.object, targets[1][0]?.object]).size, 3);
    assert.deepEqual(b.mappings, p.actor.mappings);
    for (const k of resources) assert.equal(b[k], p.actor.properties[k]);
    const success = p.expected === 'observed', skill = b.effective_skills.force;
    assert.equal(raw.launches.length, Number(success));
    if (success) assert.equal(raw.launches[0].skill, 'force'); else assert.ok(raw.reason);
    assert.equal(a.neili, b.neili - (success ? 800 : 0));
    assert.equal(zero(raw.metrics[0].neili_cost), success ? 800 : 0);
    assert.equal(zero(a.busy), success ? 5 : zero(b.busy));
    for (const k of resources.filter(k => k !== 'neili')) assert.equal(a[k], b[k], '施术者 ' + k);
    const expectedEnemies = [], expectedWants = [];
    for (const [t, after, config, metrics] of targets) {
        assert.equal(t.userp, 1); assert.equal(t.wizardp, 0); assert.equal(t.ghost ?? 0, 0);
        assert.deepEqual(t.skills, config.skills); assert.deepEqual(t.mappings, config.mappings);
        assert.deepEqual(t.conditions || {}, config.conditions ?? {});
        for (const k of resources) {
            if (t === bt && p.target_state === 'unconscious' && ['qi', 'jing'].includes(k)) assert.equal(t[k], 0);
            else assert.equal(t[k], config.properties[k], '初始目标 ' + k);
        }
        assert.deepEqual(t.hostility, { enemies: [], killers: [], wants: [] });
        // An unconscious victim cannot execute kill_ob; the caster still records want_kill.
        const hit = a.hostility.wants.includes(t.id);
        const skipped = !success || !t.living || t.conditions?.die_guard;
        const minimum = Math.trunc(skill / 2), maximum = minimum * 2 - 1;
        if (skipped || maximum < t.con * 2) assert.equal(hit, false);
        else if (minimum >= t.con * 2) assert.equal(hit, true);
        const damage = hit ? Math.max(0, skill - Math.trunc(t.max_neili / 10)) : 0;
        const wound = damage && t.neili < skill * 2 ? damage : 0;
        const jing = Math.min(Math.max(-1, t.jing - 2 * damage), Math.max(-1, t.eff_jing - wound));
        const faint = Boolean(damage && (jing < 1 || t.eff_jing - wound < 1));
        assert.equal(after.jing, faint ? 10 : jing);
        assert.equal(after.eff_jing, Math.max(-1, t.eff_jing - wound) + (faint ? 10 : 0));
        assert.equal(after.qi, faint ? 0 : t.qi);
        assert.equal(Boolean(after.living), Boolean(t.living && !faint));
        assert.equal(zero(after.ghost), 0);
        for (const k of resources.filter(k => !['qi', 'jing', 'eff_jing'].includes(k))) assert.equal(after[k], t[k], k);
        assert.deepEqual(after.conditions, t.conditions);
        for (const k of ['qi', 'jing', 'eff_jing', 'neili'])
            assert.equal(after[k], t[k] - zero(metrics[k + '_cost']) + zero(metrics[k + '_recovery']), k + '原始资源账');
        assert.deepEqual(after.hostility.killers, hit && after.living ? ['left'] : []);
        assert.deepEqual(after.hostility.wants, []);
        assert.deepEqual(after.hostility.enemies, hit && after.living ? ['left'] : []);
        if (hit) { expectedEnemies.push(t.id); expectedWants.push(t.id); }
    }
    assert.deepEqual([...a.hostility.enemies].sort(), expectedEnemies.sort());
    assert.deepEqual([...a.hostility.wants].sort(), expectedWants.sort());
    assert.deepEqual(a.hostility.killers, []);
}

export function shaolinRoarEffects(rows) {
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
    return [1, 2].map(side => {
        const samples = raw.map(r => side === 1 ? [r.before[1], r.after[1], r.after[0]]
            : [r.extra_target_before, r.extra_target_after, r.after[0]]);
        return { targets: samples.length,
            hostile: probability(samples.filter(([b, , caster]) => caster.hostility.wants.includes(b.id)).length, samples.length),
            fainted: samples.filter(([b, a]) => b.living && !a.living).length,
            jing_net: distribution(samples.map(([b, a]) => a.jing - b.jing)),
            eff_jing_net: distribution(samples.map(([b, a]) => a.eff_jing - b.eff_jing)) };
    });
}
