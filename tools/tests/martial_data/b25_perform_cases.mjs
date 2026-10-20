// B25 instant-death 5 + heal 2 perform batch (new instant_death / heal kinds).
// Instant death 5: zhemei-shou hua, bluesea-force mie, xiaoli-feidao fei,
// wudoumi-shengong gui, never-defeated lei.
// Heal 2: yiyang-zhi heal, sun-finger heal.
// One collection settles these special-kind performs.
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

const xiaoyaoFamilies = ['逍遥派'];
const lingjiuFamilies = ['灵鹫宫'];
const duanFamilies = ['大理段家'];
const noneFamilies = ['侠客盟'];

export const b25SourcePaths = [
    'kungfu/skill/zhemei-shou.c', 'kungfu/skill/zhemei-shou/hua.c',
    'kungfu/skill/bluesea-force.c', 'kungfu/skill/bluesea-force/perform/mie.c',
    'kungfu/skill/xiaoli-feidao.c', 'kungfu/skill/xiaoli-feidao/fei.c',
    'kungfu/skill/wudoumi-shengong.c', 'kungfu/skill/wudoumi-shengong/perform/gui.c',
    'kungfu/skill/never-defeated.c', 'kungfu/skill/never-defeated/perform/lei.c',
    'kungfu/skill/yiyang-zhi.c', 'kungfu/skill/yiyang-zhi/heal.c',
    'kungfu/skill/sun-finger.c', 'kungfu/skill/sun-finger/heal.c',
    'kungfu/skill/jingluo-xue.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c',
    'kungfu/skill/strike.c', 'kungfu/skill/hand.c',
    'kungfu/skill/cuff.c', 'kungfu/skill/staff.c',
    'kungfu/skill/whip.c', 'kungfu/skill/hammer.c',
    'kungfu/skill/claw.c', 'kungfu/skill/finger.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/throwing.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/force.c', 'kungfu/skill/parry.c',
    'kungfu/skill/shaolin-shenfa.c',
    'kungfu/skill/club.c', 'kungfu/skill/axe.c', 'kungfu/skill/dagger.c',
    'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/skill.c', 'feature/attack.c', 'feature/damage.c',
    'feature/attribute.c', 'feature/condition.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c',
    'feature/equip.c', 'feature/name.c', 'feature/sserver.c',
    'feature/team.c',
    'clone/user/user.c', 'inherit/char/char.c', 'adm/daemons/combatd.c',
    'adm/single/simul_efun/message.c', 'include/globals.h', 'include/combat.h',
    'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const b25ReviewedSourceHash = 'PENDING';

const schools = {
    // ---- instant_death 5 ----
    'zhemei-shou/hua': {
        skill: 'zhemei-shou', ability: 'hua', abilityPath: 'hua',
        usage: 'hand', grant: 'can_perform/zhemei-shou/hua',
        forceSkill: 'beiming-shengong', kind: 'instant_death', weapon: null, prepared: 'hand',
        families: xiaoyaoFamilies, actorFamily: '逍遥派',
        title: '化妖功',
        feeHit: 360, feeMiss: 200,
        hitBusy: 2, missBusy: 3, instantBusy: 1,
        extraSkills: { 'beiming-shengong': 300 },
        extraMappings: { force: 'beiming-shengong' },
        targetInstantDeath: true,
        gates: [
            { key: 'force', pair: [219, 220], field: 'skill', skillName: 'beiming-shengong',
                refusal: '你的逍遥内功火候不够，难以施展「化妖功」。\n' },
            { key: 'level', pair: [219, 220], field: 'skill',
                refusal: '你逍遥折梅手等级不够，难以施展「化妖功」。\n' },
            { key: 'max-neili', pair: [3999, 4000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「化妖功」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你现在真气不足，难以施展「化妖功」。\n' },
        ],
    },
    'bluesea-force/mie': {
        skill: 'bluesea-force', ability: 'mie', abilityPath: 'perform/mie',
        usage: 'strike', grant: null,
        forceSkill: 'bluesea-force', kind: 'instant_death', weapon: null, prepared: null,
        families: noneFamilies, actorFamily: '侠客盟',
        title: '南海玄功「五阴焚灭」',
        fee: 60, meBusyMin: 1, meBusyMax: 2,
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的南海玄功还不够娴熟，不能使用五阴焚灭！\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够！\n' },
        ],
    },
    'xiaoli-feidao/fei': {
        skill: 'xiaoli-feidao', ability: 'fei', abilityPath: 'fei',
        usage: 'throwing', grant: null,
        forceSkill: 'force', kind: 'instant_death', weapon: null, prepared: null,
        families: noneFamilies, actorFamily: '侠客盟',
        title: '小李飞刀',
        fee: 50, meBusyMax: 4, consumeThrowing: 1,
        handing: 'throwing',
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的小李飞刀不够娴熟。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你内力不够了。\n' },
        ],
    },
    'wudoumi-shengong/gui': {
        skill: 'wudoumi-shengong', ability: 'gui', abilityPath: 'perform/gui',
        usage: 'unarmed', grant: 'can_perform/wudoumi-shengong/gui',
        forceSkill: 'wudoumi-shengong', kind: 'instant_death', weapon: null, prepared: 'unarmed',
        families: lingjiuFamilies, actorFamily: '灵鹫宫',
        title: '五斗米神功「归去来兮」',
        fee: 500, multiDirects: 2,
        percentRanges: [[60, 60], [70, 70]],
        hitBusyMin: 2, hitBusyMax: 4,
        requirePowerup: true,
        dpSkills: ['dodge'],
        gates: [
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「归去来兮」。\n' },
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的五斗米神功不够娴熟，难以施展「归去来兮」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你现在真气不够，难以施展「归去来兮」。\n' },
        ],
    },
    'never-defeated/lei': {
        skill: 'never-defeated', ability: 'lei', abilityPath: 'perform/lei',
        usage: 'sword', grant: null,
        forceSkill: 'never-defeated', kind: 'instant_death', weapon: 'sword', prepared: null,
        families: noneFamilies, actorFamily: '侠客盟',
        title: '不败神功「天打雷劈」',
        fee: 60, meBusyMin: 1, meBusyMax: 2,
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的不败神功还不够娴熟，不能使用天打雷劈！\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够！\n' },
        ],
    },
    // ---- heal 2 ----
    'yiyang-zhi/heal': {
        skill: 'yiyang-zhi', ability: 'heal', abilityPath: 'heal',
        usage: 'finger', grant: 'can_perform/yiyang-zhi/heal',
        forceSkill: 'xiantian-gong', kind: 'heal', weapon: null, prepared: 'finger',
        families: duanFamilies, actorFamily: '大理段家',
        title: '一阳指「起死回生」',
        fee: 800, selfQi: 100, selfJing: 50, meBusy: 10,
        extraSkills: { 'jingluo-xue': 100 }, nonCombat: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的一阳指诀不够娴熟，难以施展「起死回生」。\n' },
            { key: 'jingluo', pair: [99, 100], field: 'skill', skillName: 'jingluo-xue',
                refusal: '你对经络学的了解不够，难以施展「起死回生」。\n' },
            { key: 'max-neili', pair: [1499, 1500], field: 'max_neili',
                refusal: '你的内力修为太浅，难以施展「起死回生」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在的真气不足，难以施展「起死回生」。\n' },
        ],
    },
    'sun-finger/heal': {
        skill: 'sun-finger', ability: 'heal', abilityPath: 'heal',
        usage: 'finger', grant: null,
        forceSkill: 'xiantian-gong', kind: 'heal', weapon: null, prepared: null,
        families: duanFamilies, actorFamily: '大理段家',
        title: '一阳指法运功疗伤',
        fee: 1000, selfQi: 150, selfJing: 80, meBusy: 10,
        nonCombat: true,
        gates: [
            { key: 'max-neili', pair: [1499, 1500], field: 'max_neili',
                refusal: '你的内力还浅，不是运功疗伤。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你的真气现在不够，不能贸然行功。\n' },
            { key: 'jing', pair: [99, 100], field: 'jing',
                refusal: '你的精现在不够，不要贸然行功。\n' },
        ],
    },
};

export const b25Schools = schools;

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
            case 'effective-dodge': raise(skills, 'shaolin-shenfa', high); break;
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

export function b25PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b25SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b25ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b25ReviewedSourceHash,
            'Reviewed B25 sources changed; re-review before sampling');
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
                ...(cfg.handing ? { equipment: { type: cfg.handing, hold: true, amount: 10, skill_type: cfg.handing } } : {}),
            };
            if ('actorEquipment' in extra) {
                if (extra.actorEquipment) actor.equipment = extra.actorEquipment;
                else delete actor.equipment;
            }
            const target = {
                skills: { force: 200, dodge: 200, parry: 200, sword: 200, medical: 200,
                    ...extra.targetSkills },
                mappings: {}, preparations: {},
                properties: { ...defaults, shen: 0,
                    // heal only fires on a wounded target (eff_qi/eff_jing below max).
                    ...(cfg.kind === 'heal' ? { eff_qi: 5000, eff_jing: 5000 } : {}),
                    ...extra.targetProperties },
                equipment: { type: 'sword', hold: false },
                ...(extra.targetBusy ? { busy: 2 } : {}),
            };
            if (extra.actorTemp) actor.temp = { ...(actor.temp ?? {}), ...extra.actorTemp };
            if (cfg.requirePowerup && !extra.refusal?.includes('未将全身功力'))
                actor.temp = { ...(actor.temp ?? {}), powerup: 1 };
            result.push({
                id: `b25-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b25', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b25-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b25SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}即死疗伤：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '即死与疗伤均按原分支记账。'
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
        if (cfg.kind === 'heal') {
            add('hit', { targetProperties: { eff_qi: 5000, eff_jing: 5000 }, samples: 4 });
            add('miss', { targetProperties: { eff_qi: 5000, eff_jing: 5000 }, samples: 4 });
            add('self-target', {
                action: `perform ${cfg.usage}.heal left`,
                refusal: cfg.skill === 'yiyang-zhi'
                    ? '「起死回生」只能对别人施展。\n' : '你只能替别人疗伤。\n',
            });
        } else if (cfg.targetInstantDeath) {
            add('instant-death', {
                targetProperties: { max_neili: 2000 },
                samples: smoke ? 2 : 4,
            });
        } else if (cfg.expHitCheck) {
            add('high-exp-target', {
                targetProperties: { combat_exp: 2000000000 },
                samples: smoke ? 2 : 4,
            });
        }
        if (cfg.requirePowerup) {
            add('no-powerup', {
                actorTemp: {},
                refusal: '你未将全身功力尽数提起，难以施展「归去来兮」。\n',
            });
        }
        if (cfg.handing) {
            add('no-throwing', {
                actorEquipment: null,
                refusal: '你现在手中并没有拿着飞刀。\n',
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

function stableState(before, after, mutate, { consumeThrowing = false } = {}) {
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
        if (consumeThrowing) {
            if (side.temp) {
                delete side.temp.handing;
                if (side.temp.apply) { delete side.temp.apply.damage; delete side.temp.apply.dodge; }
            }
            delete side.handing; delete side.ammunition;
            delete side.handing_details;
            if (side.weapon_details) { delete side.weapon_details.weight; delete side.weapon_details.amount; }
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

export function validateB25Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B25 entry');
    assert.equal(p.collection_group, 'b25-perform');
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
    if (cfg.kind === 'heal') return validateB25Heal(raw, condition, cfg, p, b, t, a, v);
    return validateB25InstantDeath(raw, condition, cfg, p, b, t, a, v);
}

function validateB25Heal(raw, condition, cfg, p, b, t, a, v) {
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'heal has no direct');
    assert.equal(b.neili - a.neili, cfg.fee, 'heal fee');
    assert.equal(b.qi - a.qi, cfg.selfQi, 'self qi cost');
    assert.equal(b.jing - a.jing, cfg.selfJing, 'self jing cost');
    assert.equal(num(a.busy), cfg.meBusy, 'me busy');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cfg.fee; e.qi -= cfg.selfQi; e.jing -= cfg.selfJing;
        e.busy = a.busy; e.learned = a.learned; allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.eff_qi = v.eff_qi; e.eff_jing = v.eff_jing; e.qi = v.qi; e.jing = v.jing;
        e.busy = v.busy;
    });
    return { accepted: true, kind: 'heal', hit: true };
}

function validateB25InstantDeath(raw, condition, cfg, p, b, t, a, v) {
    const fee = b.neili - a.neili;
    const death = raw.terminals.length > 0 || num(v.living) === 0 || num(v.ghost) === 1;
    if (cfg.skill === 'xiaoli-feidao') {
        assert.equal(fee, cfg.fee, 'fei fee');
        assert.ok(death, 'xiaoli always kills');
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        }, { consumeThrowing: true });
        return { accepted: true, kind: 'instant_death', hit: true };
    }
    if (cfg.targetInstantDeath) {
        // zhemei-shou hua: receive-type + optional instant death on max_neili crush.
        const instant = num(b.max_neili) > num(t.max_neili) * 2;
        const hit = instant || num(v.qi) !== num(t.qi) || num(v.jing) !== num(t.jing);
        const expectedFee = hit ? (cfg.feeHit ?? 360) : (cfg.feeMiss ?? 200);
        assert.equal(fee, expectedFee, 'hua fee');
        const busyAfter = num(a.busy);
        const busyMin = instant ? (cfg.instantBusy ?? 1) : hit ? (cfg.hitBusyMin ?? 2) : (cfg.missBusyMin ?? 3);
        const busyMax = instant ? (cfg.instantBusy ?? 1) : hit ? (cfg.hitBusyMax ?? 2) : (cfg.missBusyMax ?? 3);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'hua busy');
        assertLearnGain(a, p.skill);
        if (instant) {
            assert.ok(death || num(v.qi) <= 1, 'instant death kills or nearly zeroes qi');
            stableState(b, a, e => {
                e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
                allowDerived(e, a);
            });
            return { accepted: true, kind: 'instant_death', hit: true };
        }
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili;
        });
        return { accepted: true, kind: 'instant_death', hit };
    }
    if (cfg.expHitCheck) {
        // bluesea mie / never-defeated lei: exp-threshold kill or safe branch.
        assert.equal(fee, cfg.fee, 'exp-kill fee');
        const busyAfter = num(a.busy);
        assert.ok(busyAfter >= cfg.meBusyMin && busyAfter <= cfg.meBusyMax, 'exp-kill busy');
        assertLearnGain(a, p.skill);
        const hit = death || num(v.qi) !== num(t.qi);
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        if (!death) stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili; e.living = v.living; e.ghost = v.ghost;
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'instant_death', hit };
    }
    // wudoumi gui: two independent do_damage swings (high-damage, can kill).
    const directs = raw.directs ?? [];
    assert.equal(fee, cfg.fee, 'gui fee');
    const busyAfter = num(a.busy);
    assert.ok(busyAfter >= cfg.hitBusyMin && busyAfter <= cfg.hitBusyMax, 'gui busy');
    assertLearnGain(a, p.skill);
    const hit = death || num(v.qi) !== num(t.qi);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    });
    if (!death) stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
    });
    return { accepted: true, kind: 'instant_death', hit, directs: directs.length };
}

export function b25Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB25Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
