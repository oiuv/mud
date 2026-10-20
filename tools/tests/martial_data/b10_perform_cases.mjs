// B10 JueQing-exclusive perform batch (15 moves). Zilei-jian pair,
// poguang-dao pair, jueqing-zhang pair, yinyang-ren trio and the
// tianjue/pokong/guxing/luoyun/guhong/poshui singles. One collection
// settles these exclusive performs.
// Finite reviewed conditions only; no game-code writes and no balance claims.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';
// Kind dispatch reuses the slice1-8 do_damage support model.
import { slice2SupportSet } from './school_slice2_cases.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    jingli: 6000, max_jingli: 6000,
    combat_exp: 100000000, str: 36, int: 36, con: 36, dex: 36, shen: -200000,
    gender: '男性', character: '心狠手辣' };

// JueQing-exclusive: one family settles its own perform coverage.
const families = ['绝情谷'];

export const b10SourcePaths = [
    'kungfu/skill/zilei-jian.c', 'kungfu/skill/zilei-jian/luo.c',
    'kungfu/skill/zilei-jian/feng.c',
    'kungfu/skill/poguang-dao.c', 'kungfu/skill/poguang-dao/yang.c',
    'kungfu/skill/poguang-dao/bing.c',
    'kungfu/skill/jueqing-zhang.c', 'kungfu/skill/jueqing-zhang/hun.c',
    'kungfu/skill/jueqing-zhang/wan.c',
    'kungfu/skill/yinyang-ren.c', 'kungfu/skill/yinyang-ren/hua.c',
    'kungfu/skill/yinyang-ren/heng.c', 'kungfu/skill/yinyang-ren/huan.c',
    'kungfu/skill/tianjue-dao.c', 'kungfu/skill/tianjue-dao/suo.c',
    'kungfu/skill/pokong-quan.c', 'kungfu/skill/pokong-quan/kong.c',
    'kungfu/skill/guxing-jian.c', 'kungfu/skill/guxing-jian/lian.c',
    'kungfu/skill/luoyun-dao.c', 'kungfu/skill/luoyun-dao/tian.c',
    'kungfu/skill/guhong-zhang.c', 'kungfu/skill/guhong-zhang/qian.c',
    'kungfu/skill/poshui-zhang.c', 'kungfu/skill/poshui-zhang/tai.c',
    'kungfu/skill/jueqing-xinfa.c', 'kungfu/skill/henshan-quan.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c', 'kungfu/skill/staff.c',
    'kungfu/skill/strike.c', 'kungfu/skill/cuff.c',
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
export const b10ReviewedSourceHash = '7df3623d18553422ae4430efa70bf5bd05a7fe7def7e3b8cd8c0e6fb56024d59';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. forceSkill is the mapped special force for the actor.
const schools = {
    'zilei-jian/luo': {
        skill: 'zilei-jian', ability: 'luo', abilityPath: 'luo',
        usage: 'sword', grant: 'can_perform/zilei-jian/luo',
        forceSkill: 'jueqing-xinfa', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '绝情谷',
        title: '紫雷剑法「落雷式」', directType: 'WEAPON', percent: 40,
        dpSkills: ['parry'], feeHit: 200, feeMiss: 180,
        hitBusy: 2, hitBusyMax: 5, missBusy: 2,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你紫雷剑法不够娴熟，难以施展「落雷式」。\n' },
            { key: 'force', pair: [149, 150], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「落雷式」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在的真气不够，难以施展「落雷式」。\n' },
        ],
    },
    'zilei-jian/feng': {
        skill: 'zilei-jian', ability: 'feng', abilityPath: 'feng',
        usage: 'sword', grant: 'can_perform/zilei-jian/feng',
        forceSkill: 'jueqing-xinfa', kind: 'control', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '绝情谷',
        title: '紫雷剑法「狂风式」',
        unconditionalFee: true, feeHit: 120, feeMiss: 120,
        meBusyHit: 0, meBusyHitMax: 1, meBusyMiss: 2,
        targetBusyFormula: 'sword-random-24',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你紫雷剑法不够娴熟，难以施展「狂风式」。\n' },
            { key: 'dodge', pair: [149, 150], field: 'effective-dodge',
                refusal: '你的轻功修为不够，难以施展「狂风式」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「狂风式」。\n' },
        ],
    },
    'poguang-dao/yang': {
        skill: 'poguang-dao', ability: 'yang', abilityPath: 'yang',
        usage: 'blade', grant: 'can_perform/poguang-dao/yang',
        forceSkill: 'jueqing-xinfa', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families, actorFamily: '绝情谷',
        title: '破光刀法「破阳刀」', directType: 'WEAPON', percent: 40,
        dpSkills: ['parry'], feeHit: 200, feeMiss: 180,
        hitBusy: 2, hitBusyMax: 5, missBusy: 2,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你破光刀法不够娴熟，难以施展「破阳刀」。\n' },
            { key: 'force', pair: [149, 150], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「破阳刀」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在的真气不够，难以施展「破阳刀」。\n' },
        ],
    },
    'poguang-dao/bing': {
        skill: 'poguang-dao', ability: 'bing', abilityPath: 'bing',
        usage: 'blade', grant: 'can_perform/poguang-dao/bing',
        forceSkill: 'jueqing-xinfa', kind: 'control', weapon: 'blade', prepared: 'blade',
        families, actorFamily: '绝情谷',
        title: '破光刀法「寒冰环」',
        extraSkills: { sword: 300 },
        unconditionalFee: true, feeHit: 120, feeMiss: 120,
        meBusyHit: 0, meBusyHitMax: 1, meBusyMiss: 2,
        targetBusyFormula: 'sword-random-24',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你破光刀法不够娴熟，难以施展「寒冰环」。\n' },
            { key: 'dodge', pair: [149, 150], field: 'effective-dodge',
                refusal: '你的轻功修为不够，难以施展「寒冰环」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「寒冰环」。\n' },
        ],
    },
    'jueqing-zhang/hun': {
        skill: 'jueqing-zhang', ability: 'hun', abilityPath: 'hun',
        usage: 'strike', grant: 'can_perform/jueqing-zhang/hun',
        forceSkill: 'jueqing-xinfa', kind: 'direct', weapon: null, prepared: 'strike',
        families, actorFamily: '绝情谷',
        title: '绝情掌「魂飞魄散」', directType: 'UNARMED', percent: 60,
        dpSkills: ['parry'], feeHit: 200, feeMiss: 100, hitBusy: 3, missBusy: 4,
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你绝情掌不够娴熟，难以施展「魂飞魄散」。\n' },
            { key: 'force', pair: [179, 180], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「魂飞魄散」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，难以施展「魂飞魄散」。\n' },
        ],
    },
    'jueqing-zhang/wan': {
        skill: 'jueqing-zhang', ability: 'wan', abilityPath: 'wan',
        usage: 'strike', grant: 'can_perform/jueqing-zhang/wan',
        forceSkill: 'jueqing-xinfa', kind: 'control', weapon: null, prepared: 'strike',
        families, actorFamily: '绝情谷',
        title: '绝情掌「万念俱灰」',
        feeHit: 80, feeMiss: 30,
        meBusyHit: 1, meBusyMiss: 2,
        targetBusyFormula: 'ap40',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你绝情掌不够娴熟，难以施展「万念俱灰」。\n' },
            { key: 'dodge', pair: [149, 150], field: 'effective-dodge',
                refusal: '你的轻功修为不够，难以施展「万念俱灰」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「万念俱灰」。\n' },
        ],
    },
    'yinyang-ren/hua': {
        skill: 'yinyang-ren', ability: 'hua', abilityPath: 'hua',
        usage: 'sword', grant: 'can_perform/yinyang-ren/hua',
        forceSkill: 'jueqing-xinfa', kind: 'control', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '绝情谷',
        title: '阴阳刃法「日月无华」',
        unconditionalFee: true, feeHit: 120, feeMiss: 120,
        meBusyHit: 1, meBusyMiss: 2,
        targetBusyFormula: 'skill24-2',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你阴阳刃法不够娴熟，难以施展「日月无华」。\n' },
            { key: 'force', pair: [199, 200], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「日月无华」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在的真气不够，难以施展「日月无华」。\n' },
        ],
    },
    'yinyang-ren/heng': {
        skill: 'yinyang-ren', ability: 'heng', abilityPath: 'heng',
        usage: 'sword', grant: 'can_perform/yinyang-ren/heng',
        forceSkill: 'jueqing-xinfa', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '绝情谷',
        title: '阴阳刃法「横空出世」', directType: 'WEAPON', percent: 75,
        dpSkills: ['parry'], feeHit: 240, feeMiss: 150,
        hitBusy: 2, hitBusyMax: 3, missBusy: 1, missBusyMax: 2,
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的阴阳刃法修为不够，难以施展「横空出世」。\n' },
            { key: 'force', pair: [199, 200], field: 'skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「横空出世」。\n' },
            { key: 'dodge', pair: [199, 200], field: 'effective-dodge',
                refusal: '你的轻功火候不够，难以施展「横空出世」。\n' },
            { key: 'max-neili', pair: [2699, 2700], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「横空出世」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，难以施展「横空出世」。\n' },
        ],
    },
    'yinyang-ren/huan': {
        skill: 'yinyang-ren', ability: 'huan', abilityPath: 'huan',
        usage: 'sword', grant: 'can_perform/yinyang-ren/huan',
        forceSkill: 'jueqing-xinfa', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '绝情谷',
        title: '阴阳刃法「阴阳环」',
        feePerAttack: 20, comboAttacksMin: 4, comboAttacksMax: 8,
        comboBusyMin: 1, comboBusyMax: 8, applyKeys: ['attack'],
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的阴阳刃法修为不够，难以施展「阴阳环」。\n' },
            { key: 'dodge', pair: [219, 220], field: 'effective-dodge',
                refusal: '你的阴阳刃法修为不够，难以施展「阴阳环」。\n' },
            { key: 'neili', pair: [269, 270], field: 'neili',
                refusal: '你的真气不够，难以施展「阴阳环」。\n' },
        ],
    },
    'tianjue-dao/suo': {
        skill: 'tianjue-dao', ability: 'suo', abilityPath: 'suo',
        usage: 'blade', grant: 'can_perform/tianjue-dao/suo',
        forceSkill: 'jueqing-xinfa', kind: 'control', weapon: 'blade', prepared: 'blade',
        families, actorFamily: '绝情谷',
        title: '天绝刀法「天绝锁」',
        unconditionalFee: true, feeHit: 120, feeMiss: 120,
        meBusyHit: 0, meBusyHitMax: 1, meBusyMiss: 2,
        targetBusyFormula: 'skill-random-26',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [49, 50], field: 'skill',
                refusal: '你天绝刀法不够娴熟，难以施展「天绝锁」。\n' },
            { key: 'neili', pair: [119, 120], field: 'neili',
                refusal: '你现在的真气不够，难以施展「天绝锁」。\n' },
        ],
    },
    'pokong-quan/kong': {
        skill: 'pokong-quan', ability: 'kong', abilityPath: 'kong',
        usage: 'cuff', grant: 'can_perform/pokong-quan/kong',
        forceSkill: 'jueqing-xinfa', kind: 'direct', weapon: null, prepared: 'cuff',
        families, actorFamily: '绝情谷',
        title: '破空拳法「破碎虚空」', directType: 'UNARMED', percent: 40,
        dpSkills: ['parry'], feeHit: 100, feeMiss: 30,
        hitBusy: 2, hitBusyMax: 3, missBusy: 2, missBusyMax: 4,
        extraSkills: { 'henshan-quan': 300 },
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你破空拳法不够娴熟，难以施展「破碎虚空」。\n' },
            { key: 'force', pair: [79, 80], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「破碎虚空」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「破碎虚空」。\n' },
        ],
    },
    'guxing-jian/lian': {
        skill: 'guxing-jian', ability: 'lian', abilityPath: 'lian',
        usage: 'sword', grant: 'can_perform/guxing-jian/lian',
        forceSkill: 'jueqing-xinfa', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '绝情谷',
        title: '孤星剑法「九星连珠」',
        feePerAttack: 20, comboAttacksMin: 4, comboAttacksMax: 8,
        comboBusyMin: 1, comboBusyMax: 8, applyKeys: [],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的孤星剑法不够娴熟，难以施展「九星连珠」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你目前的真气不够，难以施展「九星连珠」。\n' },
        ],
    },
    'luoyun-dao/tian': {
        skill: 'luoyun-dao', ability: 'tian', abilityPath: 'tian',
        usage: 'blade', grant: 'can_perform/luoyun-dao/tian',
        forceSkill: 'jueqing-xinfa', kind: 'combo', weapon: 'blade', prepared: 'blade',
        families, actorFamily: '绝情谷',
        title: '落云刀法「天刀落云式」',
        feePerAttack: 20, comboAttacksMin: 4, comboAttacksMax: 8,
        comboBusyMin: 1, comboBusyMax: 8, applyKeys: [],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的落云刀法不够娴熟，难以施展「天刀落云式」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你目前的真气不够，难以施展「天刀落云式」。\n' },
        ],
    },
    'guhong-zhang/qian': {
        skill: 'guhong-zhang', ability: 'qian', abilityPath: 'qian',
        usage: 'strike', grant: 'can_perform/guhong-zhang/qian',
        forceSkill: 'jueqing-xinfa', kind: 'combo', weapon: null, prepared: 'strike',
        families, actorFamily: '绝情谷',
        title: '孤鸿掌法「千山孤鸿影」',
        feePerAttack: 20, comboAttacksMin: 3, comboAttacksMax: 6,
        comboBusyMin: 1, comboBusyMax: 6, applyKeys: ['attack'],
        // Source applies -10 unconditionally; on judgment miss the temp
        // drifts by -10 instead of being restored to zero.
        tempDrift: { attack: -10 },
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你孤鸿掌法不够娴熟，难以施展「千山孤鸿影」。\n' },
            { key: 'force', pair: [99, 100], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「千山孤鸿影」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「千山孤鸿影」。\n' },
        ],
    },
    'poshui-zhang/tai': {
        skill: 'poshui-zhang', ability: 'tai', abilityPath: 'tai',
        usage: 'staff', grant: 'can_perform/poshui-zhang/tai',
        forceSkill: 'jueqing-xinfa', kind: 'direct', weapon: 'staff', prepared: 'staff',
        families, actorFamily: '绝情谷',
        title: '八十一路泼水杖「泰山压顶」', directType: 'WEAPON', percent: 45,
        dpSkills: ['parry'], feeHit: 180, feeMiss: 100, hitBusy: 3, missBusy: 4,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你八十一路泼水杖火候不够，难以施展「泰山压顶」。\n' },
            { key: 'force', pair: [179, 180], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「泰山压顶」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，难以施展「泰山压顶」。\n' },
        ],
    },
};

export const b10Schools = schools;

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

export function b10PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b10SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b10ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b10ReviewedSourceHash,
            'Reviewed B10 sources changed; re-review before sampling');
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
                ...(cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}),
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
                id: `b10-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b10', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b10-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b10SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}绝情独有：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '落雷式与破阳刀与魂飞魄散与破碎虚空与泰山压顶直伤、'
                        + '狂风式与寒冰环与万念俱灰与日月无华与天绝锁目标忙乱、'
                        + '横空出世直伤高百分比、阴阳环与九星连珠与天刀落云式与千山孤鸿影连击'
                        + '（阴阳环与千山孤鸿影命中带攻击加成）均按原分支记账。只收集数据，不比较强弱。',
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
        if (cfg.dpSkills && cfg.dpSkills.length && cfg.kind !== 'combo') {
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

function stableState(before, after, mutate) {
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

export function validateB10Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B10 entry');
    assert.equal(p.collection_group, 'b10-perform');
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
    if (cfg.kind === 'control') return validateB10Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB10Direct(raw, condition, cfg, p, b, t, a, v);
    return validateB10Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB10Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const miss = directs.length === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), miss ? 0 : 1, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const fee = miss ? (cfg.feeMiss ?? 0) : (cfg.feeHit ?? 0);
    assert.equal(b.neili - a.neili, fee, 'branch fee');
    const busyAfter = num(a.busy);
    const busyMin = miss ? (cfg.missBusyMin ?? cfg.missBusy) : (cfg.hitBusyMin ?? cfg.hitBusy);
    const busyMax = miss ? (cfg.missBusyMax ?? cfg.missBusy) : (cfg.hitBusyMax ?? cfg.hitBusy);
    assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'busy range');
    if (miss) {
        assertLearnGain(a, p.skill);
        const spent = b.neili - a.neili;
        stableState(b, a, e => {
            e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'single direct');
    assert.equal(directs[0].actor, 0); assert.equal(directs[0].target, 1);
    const input = num(directs[0].damage);
    const support = cfg.percentRange
        ? supportRange(input, cfg.percentRange, b, t, cfg.directType)
        : slice2SupportSet(input, cfg.percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
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

function validateB10Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const hit = num(v.busy) > 0;
    const fee = cfg.unconditionalFee ? (cfg.feeHit ?? 0) : hit ? cfg.feeHit : cfg.feeMiss;
    assert.equal(cost, fee, 'control fee');
    assert.equal(b.neili - a.neili, fee, 'fee deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    if (hit) {
        assert.ok(tBusy >= 1, 'target busy on hit');
        // query_skill(x) = raw/2 + mapped (feature/skill.c).
        const effSkill = name => {
            const raw = num(sparse(b.skills, name));
            const mapped = b.mappings?.[name];
            return Math.trunc(raw / 2) + (mapped ? num(sparse(b.skills, mapped)) : 0);
        };
        switch (cfg.targetBusyFormula) {
            case 'sword-random-24': {
                // feng/bing: 2 + random(query_skill("sword") / 24)
                const sword = effSkill('sword');
                const n = Math.floor(sword / 24);
                const max = n > 0 ? 2 + n - 1 : 2;
                assert.ok(tBusy >= 2 && tBusy <= max, 'sword-random-24 target busy range');
                break;
            }
            case 'ap40': {
                // wan: ap/40 + 1, ap = skill + dodge/2
                const skill = num(sparse(b.skills, cfg.skill));
                const dodge = num(sparse(b.skills, 'dodge'));
                const ap = skill + Math.floor(dodge / 2);
                assert.equal(tBusy, Math.floor(ap / 40) + 1, 'ap40 target busy');
                break;
            }
            case 'skill24-2': {
                // hua: level/24 + 2
                const level = num(sparse(b.skills, cfg.skill));
                assert.equal(tBusy, Math.floor(level / 24) + 2, 'skill24-2 target busy');
                break;
            }
            case 'skill-random-26': {
                // suo: 2 + random(level / 26)
                const level = num(sparse(b.skills, cfg.skill));
                const n = Math.floor(level / 26);
                const max = n > 0 ? 2 + n - 1 : 2;
                assert.ok(tBusy >= 2 && tBusy <= max, 'skill-random-26 target busy range');
                break;
            }
            default: assert.fail('unknown targetBusyFormula ' + cfg.targetBusyFormula);
        }
        const meMin = cfg.meBusyHitMin ?? cfg.meBusyHit ?? 0;
        const meMax = cfg.meBusyHitMax ?? cfg.meBusyHit ?? 0;
        assert.ok(busyAfter >= meMin && busyAfter <= meMax, 'me busy on hit');
    } else {
        assert.equal(tBusy, 0, 'no target busy on miss');
        assert.equal(busyAfter, cfg.meBusyMiss ?? 0, 'me busy on miss');
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
    stableState(t, v, e => { e.busy = v.busy; });
    return { accepted: true, kind: 'control', hit };
}

function validateB10Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    if (cfg.feePerAttack) {
        // huan/lian/tian/qian: fee = planned attack_time * 20.
        const planned = fee / cfg.feePerAttack;
        assert.equal(fee % cfg.feePerAttack, 0, 'fee tracks per-attack cost');
        assert.ok(planned >= cfg.comboAttacksMin && planned <= cfg.comboAttacksMax,
            'planned attack window');
        assert.ok(attacks.length >= 1 && attacks.length <= planned,
            'actual attacks bounded by plan');
    } else {
        assert.ok(fee >= (cfg.fee ?? 0), 'combo fee floor');
        assert.ok(attacks.length >= 1 && attacks.length <= (cfg.comboAttacks ?? 10),
            'combo attack count');
    }
    assert.ok(num(a.busy) >= cfg.comboBusyMin && num(a.busy) <= cfg.comboBusyMax,
        'combo busy range');
    for (const at of attacks) assert.ok([0, -1, -2].includes(at.result));
    assert.equal(directs.length, 0, 'combo has no directs');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    const keys = cfg.applyKeys ?? ['attack'];
    for (const key of keys) {
        const drift = cfg.tempDrift?.[key] ?? 0;
        const actual = temp(a, 'apply/' + key);
        const base = temp(b, 'apply/' + key);
        assert.ok(actual === base || actual === base + drift,
            'temp ' + key + ' restored or drifted');
    }
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

export function b10Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB10Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
