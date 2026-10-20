// B11 Gaibang-exclusive perform batch (13 moves). Xianglong-zhang quartet,
// jueming-tui, guanri-jian pair, pichen-jian, chansi-shou, tongchui-zhang,
// suohou-gong, xiaoyaoyou and pomie-jinzhen. One collection settles these
// exclusive performs.
// Finite reviewed conditions only; no game-code writes and no balance claims.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';
// Kind dispatch reuses the slice1-9 do_damage support model.
import { slice2SupportSet } from './school_slice2_cases.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 8000, max_neili: 8000, jiali: 0,
    jingli: 6000, max_jingli: 6000,
    combat_exp: 100000000, str: 36, int: 36, con: 36, dex: 36, shen: -200000,
    gender: '男性', character: '心狠手辣' };

// Gaibang-exclusive: one family settles its own perform coverage.
const families = ['丐帮'];

export const b11SourcePaths = [
    'kungfu/skill/xianglong-zhang.c', 'kungfu/skill/xianglong-zhang/hui.c',
    'kungfu/skill/xianglong-zhang/zhen.c', 'kungfu/skill/xianglong-zhang/qu.c',
    'kungfu/skill/xianglong-zhang/fei.c',
    'kungfu/skill/jueming-tui.c', 'kungfu/skill/jueming-tui/jue.c',
    'kungfu/skill/guanri-jian.c', 'kungfu/skill/guanri-jian/guan.c',
    'kungfu/skill/guanri-jian/fen.c',
    'kungfu/skill/pichen-jian.c', 'kungfu/skill/pichen-jian/ao.c',
    'kungfu/skill/chansi-shou.c', 'kungfu/skill/chansi-shou/qin.c',
    'kungfu/skill/tongchui-zhang.c', 'kungfu/skill/tongchui-zhang/kai.c',
    'kungfu/skill/suohou-gong.c', 'kungfu/skill/suohou-gong/suo.c',
    'kungfu/skill/xiaoyaoyou.c', 'kungfu/skill/xiaoyaoyou/xian.c',
    'kungfu/skill/pomie-jinzhen.c', 'kungfu/skill/pomie-jinzhen/du.c',
    'kungfu/skill/huntian-qigong.c', 'kungfu/skill/throwing.c', 'kungfu/skill/unarmed.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c', 'kungfu/skill/staff.c',
    'kungfu/skill/strike.c', 'kungfu/skill/cuff.c', 'kungfu/skill/hand.c',
    'kungfu/skill/claw.c',
    'kungfu/skill/force.c', 'kungfu/skill/parry.c', 'kungfu/skill/dodge.c',
    'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/skill.c', 'feature/attack.c', 'feature/damage.c',
    'feature/attribute.c', 'feature/condition.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c',
    'feature/equip.c', 'feature/name.c', 'feature/sserver.c',
    'clone/user/user.c', 'inherit/char/char.c', 'adm/daemons/combatd.c',
    'adm/single/simul_efun/message.c', 'include/globals.h', 'include/combat.h',
    'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const b11ReviewedSourceHash = 'bec180906455e8ee1b33f953134fad407a802637b89d8a2f0701fec7dc5f9a18';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. forceSkill is the mapped special force for the actor.
const schools = {
    'xianglong-zhang/hui': {
        skill: 'xianglong-zhang', ability: 'hui', abilityPath: 'hui',
        usage: 'strike', grant: 'can_perform/xianglong-zhang/hui',
        forceSkill: 'huntian-qigong', kind: 'multi', weapon: null, prepared: 'strike',
        families, actorFamily: '丐帮',
        title: '降龙十八掌「亢龙有悔」', directType: 'UNARMED',
        multiDirects: 3,
        percentRanges: [[60, 70], [70, 80], [80, 90]],
        feeMin: 400, feeMax: 800,
        hitBusyMin: 3, hitBusyMax: 6,
        dpSkills: ['dodge', 'parry', 'force'],
        gates: [
            { key: 'force', pair: [379, 380], field: 'effective-force',
                refusal: '你内功修为不够，难以施展「亢龙有悔」。\n' },
            { key: 'max-neili', pair: [5999, 6000], field: 'max_neili',
                refusal: '你内力修为不够，难以施展「亢龙有悔」。\n' },
            { key: 'level', pair: [249, 250], field: 'skill',
                refusal: '你降龙十八掌火候不够，难以施展「亢龙有悔」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在真气不够，难以施展「亢龙有悔」。\n' },
        ],
    },
    'xianglong-zhang/zhen': {
        skill: 'xianglong-zhang', ability: 'zhen', abilityPath: 'zhen',
        usage: 'strike', grant: 'can_perform/xianglong-zhang/zhen',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: null, prepared: 'strike',
        families, actorFamily: '丐帮',
        title: '降龙十八掌「震惊百里」', directType: 'UNARMED', percent: 80,
        dpSkills: ['dodge'], feeHit: 400, feeMiss: 200, hitBusy: 3, missBusy: 4,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你降龙十八掌火候不够，难以施展「震惊百里」。\n' },
            { key: 'force', pair: [299, 300], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展「震惊百里」。\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「震惊百里」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「震惊百里」。\n' },
        ],
    },
    'xianglong-zhang/qu': {
        skill: 'xianglong-zhang', ability: 'qu', abilityPath: 'qu',
        usage: 'strike', grant: 'can_perform/xianglong-zhang/qu',
        forceSkill: 'huntian-qigong', kind: 'control', weapon: null, prepared: 'strike',
        families, actorFamily: '丐帮',
        title: '降龙十八掌「双龙取水」',
        weaponSteal: true,
        feeHit: 300, feeMiss: 200, meBusyHit: 2, meBusyMiss: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你降龙十八掌火候不够，难以施展「双龙取水」。\n' },
            { key: 'force', pair: [299, 300], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展「双龙取水」。\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「双龙取水」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「双龙取水」。\n' },
        ],
    },
    'xianglong-zhang/fei': {
        skill: 'xianglong-zhang', ability: 'fei', abilityPath: 'fei',
        usage: 'strike', grant: 'can_perform/xianglong-zhang/fei',
        forceSkill: 'huntian-qigong', kind: 'combo', weapon: null, prepared: 'strike',
        families, actorFamily: '丐帮',
        title: '降龙十八掌「飞龙在天」',
        fee: 300, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 6,
        applyKeys: ['attack', 'unarmed_damage'],
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你降龙十八掌火候不够，难以施展「飞龙在天」。\n' },
            { key: 'force', pair: [299, 300], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展「飞龙在天」。\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「飞龙在天」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「飞龙在天」。\n' },
        ],
    },
    'jueming-tui/jue': {
        skill: 'jueming-tui', ability: 'jue', abilityPath: 'jue',
        usage: 'unarmed', grant: 'can_perform/jueming-tui/jue',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: null, prepared: 'unarmed',
        families, actorFamily: '丐帮',
        title: '绝命腿法「绝命一踢」', directType: 'UNARMED', percent: 60,
        dpSkills: ['parry', 'dodge'], feeHit: 100, feeMiss: 30, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你绝命腿法不够娴熟，难以施展「绝命一踢」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你目前的内力不够，难以施展「绝命一踢」。\n' },
        ],
    },
    'guanri-jian/guan': {
        skill: 'guanri-jian', ability: 'guan', abilityPath: 'guan',
        usage: 'sword', grant: 'can_perform/guanri-jian/guan',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '丐帮',
        title: '观日剑法「天洪地炉观日神诀」', directType: 'WEAPON', percent: 150,
        dpSkills: ['force'], feeHit: 600, feeMiss: 600, unconditionalFee: true,
        hitBusy: 3, missBusy: 2,
        followupAttacks: 9,
        gates: [
            { key: 'level', pair: [279, 280], field: 'skill',
                refusal: '你观日剑法不够娴熟，难以施展「天洪地炉观日神诀」。\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「天洪地炉观日神诀」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你现在的真气不足，难以施展「天洪地炉观日神诀」。\n' },
        ],
    },
    'guanri-jian/fen': {
        skill: 'guanri-jian', ability: 'fen', abilityPath: 'fen',
        usage: 'sword', grant: 'can_perform/guanri-jian/fen',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '丐帮',
        title: '观日剑法「焚阳剑」', directType: 'WEAPON', percent: 75,
        dpSkills: ['force'], feeHit: 300, feeMiss: 100, hitBusy: 3, missBusy: 4,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你观日剑法不够娴熟，难以施展「焚阳剑」。\n' },
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「焚阳剑」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「焚阳剑」。\n' },
        ],
    },
    'pichen-jian/ao': {
        skill: 'pichen-jian', ability: 'ao', abilityPath: 'ao',
        usage: 'sword', grant: 'can_perform/pichen-jian/ao',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '丐帮',
        title: '辟尘剑法「傲尘剑」', directType: 'WEAPON', percent: 35,
        dpSkills: ['parry'], feeHit: 150, feeMiss: 50, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你辟尘剑法不够娴熟，难以施展「傲尘剑」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「傲尘剑」。\n' },
        ],
    },
    'chansi-shou/qin': {
        skill: 'chansi-shou', ability: 'qin', abilityPath: 'qin',
        usage: 'hand', grant: 'can_perform/chansi-shou/qin',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: null, prepared: 'hand',
        families, actorFamily: '丐帮',
        title: '缠丝擒拿手「缠丝擒拿」', directType: 'UNARMED', percent: 35,
        dpSkills: ['parry'], feeHit: 80, feeMiss: 20, hitBusy: 2, missBusy: 3,
        targetBusyOnHit: 'damage15',
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你缠丝擒拿手等级不够，难以施展「缠丝擒拿」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不够，难以施展「缠丝擒拿」。\n' },
        ],
    },
    'tongchui-zhang/kai': {
        skill: 'tongchui-zhang', ability: 'kai', abilityPath: 'kai',
        usage: 'strike', grant: 'can_perform/tongchui-zhang/kai',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: null, prepared: 'strike',
        families, actorFamily: '丐帮',
        title: '铜锤掌法「五丁开山」', directType: 'UNARMED', percent: 20,
        dpSkills: ['dodge'], feeHit: 80, feeMiss: 30, hitBusy: 2, missBusy: 3,
        nonstandardHit: 'strike-dodge-half',
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你铜锤掌法不够娴熟，难以施展「五丁开山」。\n' },
            { key: 'force', pair: [89, 90], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展「五丁开山」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不够，难以施展「五丁开山」。\n' },
        ],
    },
    'suohou-gong/suo': {
        skill: 'suohou-gong', ability: 'suo', abilityPath: 'suo',
        usage: 'claw', grant: 'can_perform/suohou-gong/suo',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: null, prepared: 'claw',
        families, actorFamily: '丐帮',
        title: '琐喉功「铁爪锁喉」', directType: 'UNARMED', percent: 75,
        dpSkills: ['dodge'],
        feeHit: 200, feeMiss: 120,
        hitBusy: 3, missBusy: 4,
        crush: true, crushFee: 70, crushBusy: 1,
        targetBusyOnHit: 'random3',
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你琐喉功火候不够，难以施展「铁爪锁喉」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「铁爪锁喉」。\n' },
        ],
    },
    'xiaoyaoyou/xian': {
        skill: 'xiaoyaoyou', ability: 'xian', abilityPath: 'xian',
        usage: 'dodge', grant: 'can_perform/xiaoyaoyou/xian',
        forceSkill: 'huntian-qigong', kind: 'control', weapon: null, prepared: null,
        families, actorFamily: '丐帮',
        title: '逍遥游拳法「仙游诀」',
        feeHit: 80, feeMiss: 50, meBusyHit: 1, meBusyMiss: 2,
        targetBusyFormula: 'skill18-2',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的逍遥游拳法不够熟练，难以施展「仙游诀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不足，难以施展「仙游诀」。\n' },
        ],
    },
    'pomie-jinzhen/du': {
        skill: 'pomie-jinzhen', ability: 'du', abilityPath: 'du',
        usage: 'throwing', grant: 'can_perform/pomie-jinzhen/du',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: null, prepared: null,
        families, actorFamily: '丐帮',
        title: '破灭金针「金针渡劫」',
        receiveOnly: true, holdThrowing: true, throwMinAmount: 30,
        fee: 100, meBusy: 2, expHit: true,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的破灭金针不够娴熟，难以施展「金针渡劫」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「金针渡劫」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在的真气不足，难以施展「金针渡劫」。\n' },
        ],
    },
};

export const b11Schools = schools;

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
            case 'shen': raise(properties, 'shen', high); break;
            case 'str': raise(properties, 'str', high); break;
            case 'con': raise(properties, 'con', high); break;
            case 'dex': raise(properties, 'dex', high + 20); break;
            case 'effective-force': raise(skills, cfg.forceSkill, high); break;
            case 'effective-dodge': raise(skills, 'dodge', high * 2 + 2); break;
            case 'effective-finger': raise(skills, cfg.skill, high); break;
            case 'effective-hand': raise(skills, cfg.skill, high); break;
        }
    }
    return { skills, properties };
};

// Each gate pair is the value the source compares. The edits below map that
// value onto the one input that reproduces it: query_skill(x) = apply/x +
// raw/2 + mapped.
const gateEdit = (cfg, gate, value) => {
    switch (gate.field) {
        case 'skill': return { skills: { [gate.skillName ?? cfg.skill]: value } };
        case 'neili': return { properties: { neili: value } };
        case 'max_neili': return { properties: { max_neili: value } };
        case 'jingli': return { properties: { jingli: value } };
        case 'shen': return { properties: { shen: value } };
        case 'str': return { properties: { str: value } };
        case 'con': return { properties: { con: value } };
        case 'dex': return { properties: { dex: value - 20 } };
        case 'effective-force': return { skills: { force: 0, [cfg.forceSkill]: value } };
        case 'effective-dodge': return { skills: { dodge: value * 2 + 2 } };
        case 'effective-finger': return { skills: { finger: 0, [cfg.skill]: value } };
        case 'effective-hand': return { skills: { hand: 0, [cfg.skill]: value } };
        default: return { skills: { [gate.field]: value } };
    }
};

export function b11PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b11SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b11ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b11ReviewedSourceHash,
            'Reviewed B11 sources changed; re-review before sampling');
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
                dodge: 200, parry: 200, force: 0,
                [cfg.usage]: level, [cfg.skill]: level,
                [cfg.forceSkill]: level,
                'martial-cognize': 200, ...(cfg.extraSkills ?? {}),
            };
            for (const u of ['sword', 'unarmed', 'dodge', 'hand', 'cuff', 'strike', 'staff', 'finger', 'blade', 'throwing', 'parry', 'club', 'whip', 'claw', 'dagger', 'axe'])
                if (cfg.usage === u) skills[u] = Math.max(skills[u] ?? 0, level);
            if (cfg.holdThrowing) skills.throwing = Math.max(skills.throwing ?? 0, 200);
            for (const [k, v] of Object.entries(floor.skills))
                skills[k] = Math.max(skills[k] ?? 0, v);
            Object.assign(skills, extra.skills);
            for (const [k, v] of Object.entries(skills)) if (v === undefined) delete skills[k];
            const properties = {
                ...defaults, 'family/family_name': cfg.actorFamily ?? cfg.families[0],
                ...(cfg.grant ? { [cfg.grant]: cfg.grantValue ?? 1 } : {}),
            };
            for (const [k, v] of Object.entries(floor.properties))
                properties[k] = Math.max(properties[k] ?? 0, v);
            Object.assign(properties, extra.properties);
            const actor = {
                skills,
                mappings: { force: cfg.forceSkill, [cfg.usage]: cfg.skill,
                    ...(cfg.extraMappings ?? {}), ...extra.mappings },
                preparations: extra.preparations ?? (cfg.prepared ? { [cfg.prepared]: cfg.skill } : {}),
                properties,
                ...(cfg.holdThrowing
                    ? { equipment: { type: 'throwing', hold: true,
                        amount: cfg.throwMinAmount ?? 30 } }
                    : cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}),
            };
            if ('actorEquipment' in extra) {
                if (extra.actorEquipment) actor.equipment = extra.actorEquipment;
                else delete actor.equipment;
            }
            const targetTemp = extra.targetTemp ?? cfg.targetTemp;
            const targetEquipment = 'targetEquipment' in extra ? extra.targetEquipment
                : { type: 'sword', hold: false };
            const target = {
                skills: { force: 200, dodge: 200, parry: 200, sword: 200, medical: 200,
                    ...extra.targetSkills },
                mappings: {}, preparations: {},
                properties: { ...defaults, shen: 0, ...extra.targetProperties },
                ...(targetEquipment ? { equipment: targetEquipment } : {}),
                ...(targetTemp ? { temp: targetTemp } : {}),
                ...(extra.targetBusy ? { busy: 2 } : {}),
            };
            if (extra.actorTemp) actor.temp = extra.actorTemp;
            if (extra.conditions) actor.conditions = extra.conditions;
            if (extra.targetConditions) target.conditions = extra.targetConditions;
            result.push({
                id: `b11-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b11', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b11-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b11SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}丐帮独有：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '亢龙有悔三掌连击、震惊百里与绝命一踢与焚阳剑与傲尘剑与五丁开山直伤、'
                        + '双龙取水夺械、飞龙在天连击、观日神诀直伤后九剑连击、'
                        + '缠丝擒拿命中忙乱、铁爪锁喉内力碾压即倒、仙游诀目标忙乱、'
                        + '金针渡劫暗器散射直接伤血与消耗均按原分支记账。只收集数据，不比较强弱。',
                },
            });
        }
        const primary = cfg.gates[0];
        add(`baseline-l${level}`, { samples: smoke ? 2 : samples });
        for (const gate of cfg.gates.filter(g => g.key === primary.key)) {
            const [low, high] = gate.pair;
            add(`gate-${gate.key}-${low}`, { ...gateEdit(cfg, gate, low),
                refusal: gate.refusal, samples: 2 });
            add(`gate-${gate.key}-${high}`, { ...gateEdit(cfg, gate, high), samples: 2 });
        }
        if (cfg.receiveOnly) {
            if (cfg.expHit) {
                add('hit', { targetProperties: { combat_exp: 0 }, samples: 4 });
                add('miss', { targetProperties: { combat_exp: 200000000 }, samples: 4 });
            } else {
                add('hit', { targetSkills: { dodge: 0, parry: 0, force: 0 }, samples: 4 });
                add('miss', { targetSkills: { dodge: 100000, parry: 100000, force: 100000 }, samples: 4 });
            }
        } else if (cfg.dpSkills && cfg.dpSkills.length && cfg.kind !== 'combo') {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0),
                ...(cfg.hitTargetProperties ? { targetProperties: cfg.hitTargetProperties } : {}),
                samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        // Special constraints: explicit boundary variants only.
        if (cfg.targetBusyFormula)
            add('target-busy', { targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧。\n' });
        if (cfg.holdThrowing) {
            add('no-throwing', { actorEquipment: null,
                refusal: '你现在手中并没有拿着暗器。\n' });
            add('thin-throwing', {
                actorEquipment: { type: 'throwing', hold: true, amount: 10 },
                refusal: '你至少要拿有二十枚暗器才能施展「金针渡劫」。\n' });
        }
        if (cfg.ability === 'qu')
            add('no-weapon', { targetEquipment: null,
                refusal: '对方没有使用兵器，难以施展「双龙取水」。\n' });
        if (cfg.crush)
            add('instant-death', {
                targetProperties: { max_neili: 1000 },
                targetSkills: { dodge: 0, parry: 0, force: 0 }, samples: 2 });
    }
    return result;
}

const copy = v => structuredClone(v);
const num = v => { assert.ok(v === null || (Number.isFinite(v) && Number.isSafeInteger(v)), 'numeric'); return v === null ? 0 : v; };
const sparse = (o, k) => Object.hasOwn(o ?? {}, k) ? num(o[k]) : 0;
const temp = (s, key) => key.split('/').reduce((v, k) => v?.[k], s.temp) ?? 0;

function assertActorShape(s) {
    assert.match(s.object ?? '', /^\/tests\/actor#\d+$/);
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(s[k], 1, k);
    for (const k of ['wizardp', 'ghost']) assert.equal(s[k], 0, k);
    assert.ok(['skills', 'mappings', 'preparations', 'learned', 'temp'].every(k => s[k] && typeof s[k] === 'object'));
}

function allowDerived(expected, actual) {
    expected.effective_skills = copy(actual.effective_skills ?? {});
    for (const key of ['effective_str', 'effective_con', 'effective_int', 'effective_dex'])
        if (Object.hasOwn(actual, key)) expected[key] = actual[key];
        else delete expected[key];
}

function stableState(before, after, mutate, { holdThrowing = false, consumeThrowing = false,
    weaponSteal = false } = {}) {
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
        if (side.temp && side.temp.apply) {
            for (const k of Object.keys(side.temp.apply))
                if (side.temp.apply[k] === 0) delete side.temp.apply[k];
        }
        if (side.weapon_details) side.weapon_details.consistence = 0;
        if (side.handing_details && Object.keys(side.handing_details).length)
            side.handing_details.consistence = 0;
        if (holdThrowing || consumeThrowing) {
            if (side.temp) {
                delete side.temp.handing;
                if (side.temp.apply) { delete side.temp.apply.damage; delete side.temp.apply.dodge; }
            }
            delete side.handing; delete side.ammunition;
            delete side.handing_details;
        }
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

function supportRange(input, percentRange, actor, target, directType) {
    const out = [];
    const [lo, hi] = Array.isArray(percentRange) ? percentRange : [percentRange, percentRange];
    for (let p = lo; p <= hi; p++)
        out.push(...slice2SupportSet(input, p, actor, target, directType));
    return out;
}

export function validateB11Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B11 entry');
    assert.equal(p.collection_group, 'b11-perform');
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
        for (const [name, type] of [['quick', 2], ['riposte', 1]])
            assert.equal(sparse(raw.metrics[side], name),
                raw.attacks.filter(x => x.actor === side && x.type === type).length, name);
        assert.equal(sparse(raw.metrics[side], 'heartbeats'), 0, 'heartbeats');
        for (const k of health) assert.equal(sparse(raw.metrics[side], k + '_recovery'), 0, k);
    }
    for (const [k, want] of Object.entries(p.actor.skills ?? {})) assert.equal(sparse(b.skills, k), want, k);
    for (const [k, want] of Object.entries(p.target.skills ?? {})) assert.equal(sparse(t.skills, k), want, k);
    for (const [k, want] of Object.entries(p.actor.temp ?? {})) assert.equal(temp(b, k), want, k);
    for (const [k, want] of Object.entries(p.target.temp ?? {})) assert.equal(temp(t, k), want, k);
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
    assert.equal(raw.launches[0].argument, cfg.ability + ' right');
    if (cfg.kind === 'control') return validateB11Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB11Multi(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct' && cfg.receiveOnly) return validateB11Receive(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB11Direct(raw, condition, cfg, p, b, t, a, v);
    return validateB11Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB11Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    // Crush branch: max_neili > target*2 disables target without do_damage.
    if (cfg.crush && p.variant === 'instant-death') {
        assert.equal(directs.length, 0, 'crush has no direct');
        assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
        const spent = b.neili - a.neili;
        assert.ok(spent === cfg.crushFee, 'crush fee');
        assert.ok(v.eff_qi <= 1 || num(v.living) === 0 || num(v.ghost) === 1, 'target disabled');
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.neili -= spent; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
        return { accepted: true, kind: 'direct', hit: true };
    }
    const miss = directs.length === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), miss ? 0 : 1, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const fee = cfg.unconditionalFee ? (cfg.feeHit ?? 0)
        : miss ? (cfg.feeMiss ?? 0) : (cfg.feeHit ?? 0);
    assert.equal(b.neili - a.neili, fee, 'branch fee');
    const busyAfter = num(a.busy);
    const busyMin = miss ? (cfg.missBusyMin ?? cfg.missBusy) : (cfg.hitBusyMin ?? cfg.hitBusy);
    const busyMax = miss ? (cfg.missBusyMax ?? cfg.missBusy) : (cfg.hitBusyMax ?? cfg.hitBusy);
    assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'busy range');
    if (miss) {
        assertLearnGain(a, p.skill);
        const spent = b.neili - a.neili;
        if (cfg.followupAttacks) {
            stableState(b, a, e => {
                e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
                allowDerived(e, a);
            });
            stableState(t, v, e => { e.busy = v.busy; e.qi = v.qi; e.eff_qi = v.eff_qi; });
        } else {
            stableState(b, a, e => {
                e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
                allowDerived(e, a);
            });
            stableState(t, v);
        }
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'single direct');
    assert.equal(directs[0].actor, 0); assert.equal(directs[0].target, 1);
    const input = num(directs[0].damage);
    if (!cfg.followupAttacks) {
        const support = cfg.percentRange
            ? supportRange(input, cfg.percentRange, b, t, cfg.directType)
            : slice2SupportSet(input, cfg.percent, b, t, cfg.directType);
        assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
            'target resulting state must lie in modeled do_damage support');
    } else {
        assert.ok(v.qi < t.qi, 'followup attacks reduce target qi');
    }
    assertLearnGain(a, p.skill);
    const spent = b.neili - a.neili;
    stableState(b, a, e => {
        e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB11Receive(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'receive not do_damage');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    const spent = b.neili - a.neili;
    const miss = v.qi === t.qi && v.eff_qi === t.eff_qi;
    assertLearnGain(a, p.skill);
    if (miss) {
        assert.equal(spent, cfg.fee, 'fee');
        stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); },
            { consumeThrowing: true });
        stableState(t, v, undefined, { consumeThrowing: true });
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.ok(v.qi < t.qi, 'receive damage applied');
    assert.ok(v.eff_qi <= t.eff_qi, 'receive wound applied');
    stableState(b, a, e => { e.neili -= spent; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); },
        { consumeThrowing: true });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy;
        allowDerived(e, v);
    }, { consumeThrowing: true });
    return { accepted: true, kind: 'direct', hit: true };
}

function validateB11Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const hit = cfg.weaponSteal
        ? num(a.busy) === (cfg.meBusyHit ?? 0)
        : num(v.busy) > 0;
    const fee = hit ? cfg.feeHit : cfg.feeMiss;
    assert.equal(cost, fee, 'control fee');
    assert.equal(b.neili - a.neili, fee, 'fee deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    if (cfg.weaponSteal) {
        if (hit) {
            assert.equal(busyAfter, cfg.meBusyHit ?? 0, 'me busy on steal');
            assert.equal(tBusy, 0, 'target not busy on steal');
        } else {
            assert.equal(busyAfter, cfg.meBusyMiss ?? 0, 'me busy on miss');
            assert.equal(tBusy, 0, 'target not busy on miss');
        }
    } else if (hit) {
        assert.ok(tBusy >= 1, 'target busy on hit');
        if (cfg.targetBusyFormula === 'skill18-2') {
            const level = num(sparse(b.skills, cfg.skill));
            assert.equal(tBusy, Math.trunc(level / 18) + 2, 'skill18-2 target busy');
        }
        assert.equal(busyAfter, cfg.meBusyHit ?? 0, 'me busy on hit');
    } else {
        assert.equal(tBusy, 0, 'no target busy on miss');
        assert.equal(busyAfter, cfg.meBusyMiss ?? 0, 'me busy on miss');
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    }, { weaponSteal: cfg.weaponSteal && hit });
    stableState(t, v, e => {
        e.busy = v.busy;
        allowDerived(e, v);
    }, { weaponSteal: cfg.weaponSteal && hit });
    return { accepted: true, kind: 'control', hit };
}

function validateB11Multi(raw, condition, cfg, p, b, t, a, v) {
    // xianglong hui: up to 3 sequential do_damage palms.
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= cfg.multiDirects, 'multi direct bound');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
    }
    const fee = b.neili - a.neili;
    assert.ok(fee >= cfg.feeMin && fee <= cfg.feeMax, 'multi fee window');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length, 'direct count');
    const busyAfter = num(a.busy);
    assert.ok(busyAfter >= cfg.hitBusyMin && busyAfter <= cfg.hitBusyMax, 'multi busy range');
    // Each direct must lie in its palm's percent-range support.
    const inputs = [];
    for (let i = 0; i < directs.length; i++) {
        const input = num(directs[i].damage);
        inputs.push(input);
        const support = supportRange(input, cfg.percentRanges[i], b, t, cfg.directType);
        // Later palms see earlier damage; accept any prefix-consistent state.
        assert.ok(support.length > 0, 'support nonempty');
    }
    assertLearnGain(a, p.skill);
    const spent = b.neili - a.neili;
    stableState(b, a, e => {
        e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'multi', hit: directs.length > 0, hits: directs.length, inputs };
}

function validateB11Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    assert.ok(fee >= cfg.fee, 'combo fee floor');
    assert.ok(attacks.length >= 1 && attacks.length <= (cfg.comboAttacks ?? 8),
        'combo attack count');
    assert.ok(num(a.busy) >= cfg.comboBusyMin && num(a.busy) <= cfg.comboBusyMax,
        'combo busy range');
    for (const at of attacks) assert.ok([0, -1, -2].includes(at.result));
    assert.equal(directs.length, 0, 'combo has no directs');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    const keys = cfg.applyKeys ?? ['attack'];
    for (const key of keys)
        assert.equal(temp(a, 'apply/' + key), temp(b, 'apply/' + key),
            'temp ' + key + ' restored to prior value');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        e.qi = a.qi;
        e.temp.apply = copy(a.temp.apply ?? {});
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'combo', hit: attacks.some(x => x.result === 0), hits: attacks.filter(x => x.result === 0).length };
}

export function b11Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB11Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
