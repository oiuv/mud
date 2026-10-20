// B26 non-damage control / disarm perform batch (uncovered set, batch 1).
// Control 5 (target busy, no do_damage): quanzhen-jian chan, dagou-bang chan,
// wushen-jian hui, tianluo-diwang wang, tiangang-zhi ling.
// Disarm 1 (steal target weapon): dragon-strike qin.
// These are pure control/disarm not already settled in b1-b25 (school batches).
// Finite reviewed conditions only; no game-code writes and no balance claims.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const defaults = {
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 8000, max_neili: 8000, jiali: 0,
    jingli: 6000, max_jingli: 6000,
    combat_exp: 100000000, str: 36, int: 36, con: 36, dex: 36, shen: -200000,
    gender: '男性', character: '心狠手辣'
};

const quanzhenFamilies = ['全真教'];
const gaibangFamilies = ['丐帮'];
const henshanFamilies = ['衡山派'];
const gumuFamilies = ['古墓派'];

export const b26SourcePaths = [
    'kungfu/skill/quanzhen-jian.c', 'kungfu/skill/quanzhen-jian/chan.c',
    'kungfu/skill/dagou-bang.c', 'kungfu/skill/dagou-bang/chan.c',
    'kungfu/skill/wushen-jian.c', 'kungfu/skill/wushen-jian/hui.c',
    'kungfu/skill/tianluo-diwang.c', 'kungfu/skill/tianluo-diwang/wang.c',
    'kungfu/skill/tiangang-zhi.c', 'kungfu/skill/tiangang-zhi/ling.c',
    'kungfu/skill/dragon-strike.c', 'kungfu/skill/dragon-strike/qin.c',
    'kungfu/skill/sword.c', 'kungfu/skill/staff.c', 'kungfu/skill/strike.c',
    'kungfu/skill/finger.c', 'kungfu/skill/whip.c', 'kungfu/skill/hand.c',
    'kungfu/skill/cuff.c', 'kungfu/skill/throwing.c', 'kungfu/skill/club.c',
    'kungfu/skill/axe.c', 'kungfu/skill/dagger.c', 'kungfu/skill/blade.c',
    'kungfu/skill/hammer.c', 'kungfu/skill/claw.c', 'kungfu/skill/unarmed.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/force.c', 'kungfu/skill/parry.c',
    'kungfu/skill/shaolin-shenfa.c', 'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/skill.c', 'feature/attack.c', 'feature/damage.c',
    'feature/attribute.c', 'feature/condition.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c',
    'feature/equip.c', 'feature/name.c', 'feature/sserver.c', 'feature/team.c',
    'clone/user/user.c', 'inherit/char/char.c', 'adm/daemons/combatd.c',
    'adm/single/simul_efun/message.c', 'include/globals.h', 'include/combat.h',
    'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const b26ReviewedSourceHash = 'PENDING';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them (query_skill(x, 1)). forceSkill is the special force mapped to
// force so query_skill("force") resolves to it (effective-force gate).
const schools = {
    'quanzhen-jian/chan': {
        skill: 'quanzhen-jian', ability: 'chan', abilityPath: 'chan',
        usage: 'sword', grant: 'can_perform/quanzhen-jian/chan',
        forceSkill: 'hunyuan-yiqi', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '全真剑法「缠字诀」',
        fee: 50, meBusyHit: 0, meBusyMiss: 1,
        targetBusy: { skill: 'quanzhen-jian', div: 28, add: 2 },
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你全真剑法不够娴熟，难以施展「缠字诀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，难以施展「缠字诀」。\n' },
        ],
    },
    'dagou-bang/chan': {
        skill: 'dagou-bang', ability: 'chan', abilityPath: 'chan',
        usage: 'staff', grant: 'can_perform/dagou-bang/chan',
        forceSkill: 'hunyuan-yiqi', kind: 'control', weapon: 'staff', prepared: 'staff',
        families: gaibangFamilies, actorFamily: '丐帮',
        title: '打狗棒法「缠字诀」',
        fee: 50, meBusyHit: 1, meBusyMiss: 2,
        targetBusy: { skill: 'dagou-bang', div: 18, add: 2 },
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你打狗棒法不够娴熟，难以施展「缠字诀」。\n' },
            { key: 'force', pair: [99, 100], field: 'effective-force',
                refusal: '你的内功火候不足，难以施展「缠字诀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不够，难以施展「缠字诀」。\n' },
        ],
    },
    'wushen-jian/hui': {
        skill: 'wushen-jian', ability: 'hui', abilityPath: 'hui',
        usage: 'sword', grant: 'can_perform/wushen-jian/hui',
        forceSkill: 'hunyuan-yiqi', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '衡山五神剑「回峰蜿蜒势」',
        fee: 100, meBusyHit: 1, meBusyMiss: 2,
        targetBusy: { skill: 'wushen-jian', div: 18, add: 2 },
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你衡山五神剑不够娴熟，难以施展「回峰蜿蜒势」。\n' },
            { key: 'force', pair: [249, 250], field: 'effective-force',
                refusal: '你的内功火候不足，难以施展「回峰蜿蜒势」。\n' },
            { key: 'neili', pair: [159, 160], field: 'neili',
                refusal: '你现在的真气不够，难以施展「回峰蜿蜒势」。\n' },
        ],
    },
    'tiangang-zhi/ling': {
        skill: 'tiangang-zhi', ability: 'ling', abilityPath: 'ling',
        usage: 'finger', grant: 'can_perform/tiangang-zhi/ling',
        forceSkill: 'hunyuan-yiqi', kind: 'control', weapon: null, prepared: 'finger',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '天罡指穴法「凌空指穴」',
        feeHit: 100, feeMiss: 30, meBusyHit: 0, meBusyMiss: 3,
        targetBusy: { skill: 'tiangang-zhi', div: 22, add: 2 },
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-force',
                refusal: '你内功火候不够，难以施展「凌空指穴」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的天罡指穴法修为不够，难以施展「凌空指穴」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气现在不够，难以施展「凌空指穴」。\n' },
        ],
    },
    'dragon-strike/qin': {
        skill: 'dragon-strike', ability: 'qin', abilityPath: 'qin',
        usage: 'strike', grant: 'can_perform/dragon-strike/qin',
        forceSkill: 'hunyuan-yiqi', kind: 'disarm', weapon: null, prepared: 'strike',
        families: gaibangFamilies, actorFamily: '丐帮',
        title: '降龙十八掌「擒龙手」',
        feeHit: 300, feeMiss: 200, meBusyHit: 2, meBusyMiss: 3,
        requireTargetWeapon: true,
        gates: [
            { key: 'force', pair: [259, 260], field: 'effective-force',
                refusal: '你内功修为不够，难以施展「擒龙手」。\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你内力修为不够，难以施展「擒龙手」。\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你降龙十八掌火候不够，难以施展「擒龙手」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在真气不够，难以施展「擒龙手」。\n' },
        ],
    },
};

export const b26Schools = schools;

// Every gate except the one being probed must pass, so the baseline is raised
// to each gate's high value. Otherwise an earlier gate masks the intended one
// and the refusal text no longer matches.
const gateFloor = cfg => {
    const skills = {}, properties = {};
    const raise = (bag, key, value) => { bag[key] = Math.max(bag[key] ?? 0, value); };
    for (const gate of cfg.gates) {
        const high = gate.pair[1];
        switch (gate.field) {
            case 'skill': raise(skills, gate.skillName ?? cfg.skill, high); break;
            case 'neili': raise(properties, 'neili', high); break;
            case 'max_neili': raise(properties, 'max_neili', high); break;
            case 'jingli': raise(properties, 'jingli', high); break;
            case 'jing': raise(properties, 'jing', high); break;
            case 'shen': raise(properties, 'shen', high); break;
            case 'str': raise(properties, 'str', high); break;
            case 'con': raise(properties, 'con', high); break;
            case 'dex': raise(properties, 'dex', high + 20); break;
            case 'effective-force': raise(skills, cfg.forceSkill, high); break;
            case 'effective-dodge': raise(skills, 'shaolin-shenfa', high + 1); break;
            case 'effective-skill': {
                const name = gate.skillName ?? cfg.skill;
                raise(skills, name, (high + 1) * 2);
                break;
            }
        }
    }
    return { skills, properties };
};

const gateEdit = (cfg, gate, value, isLow) => {
    switch (gate.field) {
        case 'skill': return { skills: { [gate.skillName ?? cfg.skill]: value } };
        case 'neili': return { properties: { neili: value } };
        case 'max_neili': return { properties: { max_neili: value } };
        case 'jingli': return { properties: { jingli: value } };
        case 'jing': return { properties: { jing: value } };
        case 'shen': return { properties: { shen: value } };
        case 'str': return { properties: { str: value } };
        case 'con': return { properties: { con: value } };
        case 'dex': return { properties: { dex: value - 20 } };
        case 'effective-force': return { skills: { force: 0, [cfg.forceSkill]: value } };
        case 'effective-dodge': return { skills: { dodge: 0, 'shaolin-shenfa': value + 1 } };
        case 'effective-skill': {
            const name = gate.skillName ?? cfg.skill;
            if (name === 'force' && cfg.forceSkill && cfg.forceSkill !== 'force')
                return { skills: { force: 0, [cfg.forceSkill]: value } };
            return { skills: { [name]: isLow ? value * 2 : (value + 1) * 2 } };
        }
        default: return { skills: { [gate.field]: value } };
    }
};

export function b26PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b26SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b26ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b26ReviewedSourceHash,
            'Reviewed B26 sources changed; re-review before sampling');
    const result = [];
    for (const [key, cfg] of Object.entries(schools)) {
        const abilityKey = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${abilityKey}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`);
        assert.equal(ability?.path, `kungfu/skill/${cfg.skill}/${abilityKey}.c`);
        assert.equal(base.sha256, source_evidence[base.path]);
        assert.equal(ability.sha256, source_evidence[ability.path]);
        const performEntry = ability.entries.find(e => e.role === 'perform')?.id;
        assert.ok(performEntry?.startsWith(ability.path + ':'), key);
        const level = 300;
        const floor = gateFloor(cfg);
        function add(variant, extra = {}) {
            const skills = {
                dodge: 200, parry: 200, force: 0, 'shaolin-shenfa': 200,
                [cfg.usage]: level, [cfg.skill]: level,
                [cfg.forceSkill]: level,
                'martial-cognize': 200, poison: 200,
                ...(cfg.extraSkills ?? {}),
            };
            for (const u of ['sword', 'unarmed', 'dodge', 'hand', 'cuff', 'strike', 'staff', 'finger', 'blade', 'throwing', 'parry', 'club', 'whip', 'claw', 'dagger', 'axe', 'hammer'])
                if (cfg.usage === u) skills[u] = Math.max(skills[u] ?? 0, level);
            for (const [k, v] of Object.entries(floor.skills))
                skills[k] = Math.max(skills[k] ?? 0, v);
            Object.assign(skills, extra.skills);
            for (const [k, v] of Object.entries(skills)) if (v === undefined) delete skills[k];
            const properties = {
                ...defaults, 'family/family_name': cfg.actorFamily ?? cfg.families[0],
                ...(cfg.grant ? { [cfg.grant]: cfg.grantValue ?? 1 } : {}),
                ...(cfg.extraProperties ?? {}),
            };
            for (const [k, v] of Object.entries(floor.properties))
                properties[k] = Math.max(properties[k] ?? 0, v);
            Object.assign(properties, extra.properties);
            const actor = {
                skills,
                mappings: {
                    dodge: 'shaolin-shenfa',
                    ...(cfg.forceSkill && cfg.forceSkill !== 'force'
                        ? { force: cfg.forceSkill } : {}),
                    [cfg.usage]: cfg.skill,
                    ...(cfg.extraMappings ?? {}), ...extra.mappings
                },
                preparations: extra.preparations ?? (cfg.prepared
                    ? { [cfg.prepared]: cfg.preparedSkill ?? cfg.skill } : {}),
                properties,
                ...(cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}),
            };
            if ('actorEquipment' in extra) {
                if (extra.actorEquipment) actor.equipment = extra.actorEquipment;
                else delete actor.equipment;
            }
            const target = {
                skills: { force: 200, dodge: 200, parry: 200, sword: 200, medical: 200,
                    ...extra.targetSkills },
                mappings: {}, preparations: {},
                properties: { ...defaults, shen: 0, ...extra.targetProperties },
                equipment: cfg.requireTargetWeapon || extra.targetWeapon
                    ? { type: extra.targetWeaponType ?? 'sword', hold: false }
                    : { type: 'sword', hold: false },
                ...(extra.targetBusy ? { busy: 2 } : {}),
            };
            if (extra.actorTemp) actor.temp = { ...(actor.temp ?? {}), ...extra.actorTemp };
            result.push({
                id: `b26-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b26', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b26-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b26SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}控制缴械：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '控制与缴械均按原分支记账。'
                        + '只收集数据，不比较强弱。',
                },
            });
        }
        const primary = cfg.gates[0];
        add(`baseline-l${level}`, { samples: smoke ? 2 : samples });
        for (const gate of cfg.gates.filter(g => g.key === primary.key)) {
            const [low, high] = gate.pair;
            add(`gate-${gate.key}-${low}`, {
                ...gateEdit(cfg, gate, low, true),
                refusal: gate.refusal, samples: 2
            });
            add(`gate-${gate.key}-${high}`, { ...gateEdit(cfg, gate, high, false), samples: 2 });
        }
        if (cfg.kind === 'control') {
            const mark = cfg.targetBusyRefusalMark ?? '。';
            add('target-busy', {
                targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧' + mark + '\n',
            });
        }
    }
    return result;
}

const copy = value => value === undefined ? undefined : structuredClone(value);
const num = value => typeof value === 'number' && Number.isFinite(value) ? value : 0;
const sparse = (bag, key) => num(bag?.[key]);

function assertActorShape(side) {
    for (const k of ['object', 'id']) assert.equal(typeof side[k], 'string', k);
    for (const k of health) assert.ok(num(side[k]) >= 0, k);
}

function temp(side, key) {
    let node = side.temp ?? {};
    for (const part of key.split('/')) node = node?.[part];
    return node;
}

function allowDerived(expected, actual) {
    expected.effective_skills = copy(actual.effective_skills ?? {});
    for (const key of ['effective_str', 'effective_con', 'effective_int', 'effective_dex'])
        if (Object.hasOwn(actual, key)) expected[key] = actual[key];
        else delete expected[key];
}

function stableState(before, after, mutate, { weaponSteal = false } = {}) {
    const expected = copy(before), actual = copy(after);
    delete expected.temp.notify_fail; delete actual.temp.notify_fail;
    for (const side of [expected, actual]) {
        if (side.temp && side.temp.fight) {
            const fight = side.temp.fight;
            for (const k of ['attack', 'dodge', 'parry'])
                assert.ok(fight[k] === null || Number.isSafeInteger(fight[k]), 'fight temp shape');
            delete side.temp.fight;
        }
        if (side.temp) delete side.temp.block_msg;
        if (side.temp) delete side.temp.action_flag;
        if (side.temp) delete side.temp.die_reason;
        if (side.temp && side.temp.apply) {
            for (const k of Object.keys(side.temp.apply))
                if (side.temp.apply[k] === 0) delete side.temp.apply[k];
        }
        if (side.weapon_details) side.weapon_details.consistence = 0;
        if (side.handing_details && Object.keys(side.handing_details).length)
            side.handing_details.consistence = 0;
        if (weaponSteal) {
            if (side.temp?.apply) { delete side.temp.apply.damage; delete side.temp.apply.dodge; }
            if (side.temp) delete side.temp.weapon;
            delete side.weapon; delete side.weapon_damage; delete side.weapon_flag;
            delete side.weapon_details; delete side.equipment;
        }
    }
    if (mutate) mutate(expected);
    for (const side of [expected, actual]) {
        if (side.temp && side.temp.apply) {
            for (const k of Object.keys(side.temp.apply))
                if (side.temp.apply[k] === 0) delete side.temp.apply[k];
        }
    }
    assert.deepEqual(actual, expected, 'unexplained state mutation');
}

function assertLearnGain(after, skill) {
    const learned = after.learned ?? {};
    for (const k of Object.keys(learned)) assert.equal(k, skill, 'unexpected learned key');
    assert.ok([0, 1].includes(learned[skill] ?? 0), 'original single-use learn gain');
}

function expectedTargetBusy(cfg, b) {
    const level = sparse(b.skills, cfg.targetBusy.skill);
    return Math.trunc(level / cfg.targetBusy.div) + cfg.targetBusy.add;
}

export function validateB26Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B26 entry');
    assert.equal(p.collection_group, 'b26-perform');
    assert.deepEqual(p.families, cfg.families);
    assert.equal(p.kind, cfg.kind);
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, 'perform');
    assert.ok(Number.isSafeInteger(raw.index) && raw.index >= 0 && raw.index < condition.samples);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(raw.outcome)) {
        assert.ok(typeof raw.reason === 'string' && raw.reason.trim());
        return null;
    }
    const accepted = p.expected === 'observed';
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2, k);
    for (const k of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces',
        'callbacks', 'dropped', 'terminals', 'launches', 'refusals'])
        assert.ok(Array.isArray(raw[k]), k);
    for (const k of ['actions', 'directs']) if (Object.hasOwn(raw, k)) assert.ok(Array.isArray(raw[k]), k);
    assert.deepEqual(raw.after, raw.immediate, 'immediate-only window');
    const b = raw.before[0], t = raw.before[1], a = raw.immediate[0], v = raw.immediate[1];
    assertActorShape(b); assertActorShape(t);
    for (const side of [0, 1]) {
        for (const k of ['quick', 'riposte', 'heartbeats'])
            assert.equal(sparse(raw.metrics[side], k), 0, k);
        for (const k of health)
            if (side === 0) assert.equal(sparse(raw.metrics[side], k + '_recovery'), 0, k);
            else assert.ok(sparse(raw.metrics[side], k + '_recovery') >= 0, k);
    }
    for (const [k, want] of Object.entries(p.actor.skills ?? {})) assert.equal(sparse(b.skills, k), want, k);
    for (const [k, want] of Object.entries(p.target.skills ?? {})) assert.equal(sparse(t.skills, k), want, k);
    if (!accepted) {
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.attacks, []);
        assert.deepEqual(raw.directs ?? [], []);
        assert.equal(typeof raw.reason, 'string');
        assert.equal(raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''), p.refusal);
        assert.deepEqual(raw.refusals, [{ actor: b.object, reason: raw.reason }]);
        stableState(b, a);
        return { accepted: false, kind: cfg.kind };
    }
    assert.deepEqual(raw.refusals, []);
    assert.ok(raw.reason === '' || raw.reason === null);
    assert.equal(raw.launches.length, 1);
    assert.equal(raw.launches[0].skill, cfg.skill);
    if (cfg.kind === 'disarm') return validateB26Disarm(raw, condition, cfg, p, b, t, a, v);
    return validateB26Control(raw, condition, cfg, p, b, t, a, v);
}

function validateB26Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const tBusy = num(v.busy), hit = tBusy > 0;
    const fee = hit ? (cfg.feeHit ?? cfg.fee) : (cfg.feeMiss ?? cfg.fee);
    assert.equal(cost, fee, 'control fee');
    assert.equal(b.neili - a.neili, fee, 'fee deduction');
    const busyAfter = num(a.busy);
    if (hit) {
        assert.equal(tBusy, expectedTargetBusy(cfg, b), 'target busy formula');
        const lo = cfg.meBusyHitMin ?? cfg.meBusyHit ?? 0;
        const hi = cfg.meBusyHitMax ?? cfg.meBusyHit ?? 0;
        assert.ok(busyAfter >= lo && busyAfter <= hi, 'me busy on hit');
    } else {
        assert.equal(tBusy, 0, 'no target busy on miss');
        assert.equal(busyAfter, cfg.meBusyMiss, 'me busy on miss');
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    });
    stableState(t, v, e => { e.busy = v.busy; allowDerived(e, v); });
    return { accepted: true, kind: 'control', hit };
}

function validateB26Disarm(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'disarm has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const spent = b.neili - a.neili;
    // The steal and miss branches charge distinct fees, so the fee selects the
    // branch without relying on the transferred weapon's snapshot fields.
    const hit = spent === cfg.feeHit;
    assert.equal(spent, hit ? cfg.feeHit : cfg.feeMiss, 'disarm fee');
    assert.equal(cost, spent, 'disarm fee metric');
    const busyAfter = num(a.busy);
    assert.equal(busyAfter, hit ? cfg.meBusyHit : cfg.meBusyMiss, 'me busy');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    }, { weaponSteal: true });
    stableState(t, v, e => { e.busy = v.busy; allowDerived(e, v); }, { weaponSteal: true });
    return { accepted: true, kind: 'disarm', hit, stole: hit };
}

export function b26Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB26Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
