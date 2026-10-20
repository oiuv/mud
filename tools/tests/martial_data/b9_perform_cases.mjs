// B9 RiYue exclusive perform batch (16 moves). Canghong/danding weapon tails,
// guzhuo-zhang trio, panlong-suo pair, yuanshi-jian pair and the shangguan/sang
// leftovers. One collection settles these exclusive performs.
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

// RiYue-exclusive: one family settles its own perform coverage.
const families = ['日月神教'];

export const b9SourcePaths = [
    'kungfu/skill/canghong-bifa.c', 'kungfu/skill/canghong-bifa/jing.c',
    'kungfu/skill/danding-dao.c', 'kungfu/skill/danding-dao/kou.c',
    'kungfu/skill/guzhuo-zhang.c', 'kungfu/skill/guzhuo-zhang/zhuo.c',
    'kungfu/skill/guzhuo-zhang/yu.c', 'kungfu/skill/guzhuo-zhang/zhen.c',
    'kungfu/skill/heixue-shenzhen.c', 'kungfu/skill/heixue-shenzhen/luo.c',
    'kungfu/skill/jifeng-cixuefa.c', 'kungfu/skill/jifeng-cixuefa/cang.c',
    'kungfu/skill/jinyuan-gun.c', 'kungfu/skill/jinyuan-gun/qian.c',
    'kungfu/skill/pangu-qishi.c', 'kungfu/skill/pangu-qishi/kai.c',
    'kungfu/skill/panlong-suo.c', 'kungfu/skill/panlong-suo/chan.c',
    'kungfu/skill/panlong-suo/sha.c',
    'kungfu/skill/poyue-zhao.c', 'kungfu/skill/poyue-zhao/duan.c',
    'kungfu/skill/shiying-lianhuan.c', 'kungfu/skill/shiying-lianhuan/sha.c',
    'kungfu/skill/yuanshi-jian.c', 'kungfu/skill/yuanshi-jian/gui.c',
    'kungfu/skill/yuanshi-jian/xuan.c',
    'kungfu/skill/zhenyu-quan.c', 'kungfu/skill/zhenyu-quan/tong.c',
    'kungfu/skill/xixing-dafa.c',
    'kungfu/skill/dagger.c', 'kungfu/skill/blade.c', 'kungfu/skill/club.c',
    'kungfu/skill/axe.c', 'kungfu/skill/whip.c', 'kungfu/skill/sword.c',
    'kungfu/skill/claw.c', 'kungfu/skill/cuff.c', 'kungfu/skill/strike.c',
    'kungfu/skill/throwing.c', 'kungfu/skill/unarmed.c',
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
export const b9ReviewedSourceHash = '6d957f360d02257a1ec7b368e77ee8b5b80aa9c4e16ae6c4895293c6c44f355d';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. forceSkill is the mapped special force for the actor.
const schools = {
    'canghong-bifa/jing': {
        skill: 'canghong-bifa', ability: 'jing', abilityPath: 'jing',
        usage: 'dagger', grant: 'can_perform/canghong-bifa/jing',
        forceSkill: 'xixing-dafa', kind: 'direct', weapon: 'dagger', prepared: 'dagger',
        families, actorFamily: '日月神教',
        title: '苍虹笔法「惊虹一笔」', directType: 'WEAPON', percent: 50,
        dpSkills: ['parry'], feeHit: 200, feeMiss: 50, hitBusy: 1, missBusy: 3,
        targetBusyOnHit: 'ap25',
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你苍虹笔法修为有限，难以施展「惊虹一笔」。\n' },
            { key: 'force', pair: [149, 150], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「惊虹一笔」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「惊虹一笔」。\n' },
        ],
    },
    'danding-dao/kou': {
        skill: 'danding-dao', ability: 'kou', abilityPath: 'kou',
        usage: 'blade', grant: 'can_perform/danding-dao/kou',
        forceSkill: 'xixing-dafa', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families, actorFamily: '日月神教',
        title: '丹碇刀法「环环相扣」', directType: 'WEAPON', percent: 35,
        dpSkills: ['parry'], feeHit: 100, feeMiss: 50, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的丹碇刀法还不到家，难以施展「环环相扣」。\n' },
            { key: 'force', pair: [99, 100], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「环环相扣」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你的真气不够，难以施展「环环相扣」。\n' },
        ],
    },
    'guzhuo-zhang/zhuo': {
        skill: 'guzhuo-zhang', ability: 'zhuo', abilityPath: 'zhuo',
        usage: 'strike', grant: 'can_perform/guzhuo-zhang/zhuo',
        forceSkill: 'xixing-dafa', kind: 'control', weapon: null, prepared: 'strike',
        families, actorFamily: '日月神教',
        title: '古拙掌法「大巧若拙」',
        feeHit: 150, feeMiss: 150, unconditionalFee: true,
        meBusyHit: 1, meBusyMiss: 2, targetBusyFormula: 'guzhuo22',
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你古拙掌法火候不够，难以施展「大巧若拙」。\n' },
            { key: 'force', pair: [219, 220], field: 'skill', skillName: 'force',
                refusal: '你内功修为不够，难以施展「大巧若拙」。\n' },
            { key: 'max-neili', pair: [1799, 1800], field: 'max_neili',
                refusal: '你内力修为不够，难以施展「大巧若拙」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，难以施展「大巧若拙」。\n' },
        ],
    },
    'guzhuo-zhang/yu': {
        skill: 'guzhuo-zhang', ability: 'yu', abilityPath: 'yu',
        usage: 'strike', grant: 'can_perform/guzhuo-zhang/yu',
        forceSkill: 'xixing-dafa', kind: 'direct', weapon: null, prepared: 'strike',
        families, actorFamily: '日月神教',
        title: '古拙掌法「大智若愚」', directType: 'UNARMED', percent: 70,
        dpSkills: ['force'], feeHit: 300, feeMiss: 0,
        hitBusy: 3, missBusy: 3, unconditionalBusy: true,
        apBoost: { skill: 'strike', stat: 'str', factor: 10 },
        dpBoost: { skill: 'force', stat: 'int', factor: 10 },
        hitTargetProperties: { int: 0 },
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你古拙掌法火候不够，难以施展「大智若愚」。\n' },
            { key: 'force', pair: [259, 260], field: 'skill', skillName: 'force',
                refusal: '你内功修为不够，难以施展「大智若愚」。\n' },
            { key: 'max-neili', pair: [2799, 2800], field: 'max_neili',
                refusal: '你内力修为不够，难以施展「大智若愚」。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你现在真气不够，难以施展「大智若愚」。\n' },
        ],
    },
    'guzhuo-zhang/zhen': {
        skill: 'guzhuo-zhang', ability: 'zhen', abilityPath: 'zhen',
        usage: 'strike', grant: 'can_perform/guzhuo-zhang/zhen',
        forceSkill: 'xixing-dafa', kind: 'direct', weapon: null, prepared: 'strike',
        families, actorFamily: '日月神教',
        title: '古拙掌法「反璞归真」', directType: 'UNARMED', percent: 70,
        dpSkills: ['force'], unconditionalFee: true, feeHit: 400, feeMiss: 400,
        hitBusyMin: 2, hitBusyMax: 5, missBusyMin: 2, missBusyMax: 5,
        followupAttacks: 4,
        apBoost: { skill: 'strike', stat: 'str', factor: 8 },
        dpBoost: { skill: 'force', stat: 'int', factor: 8 },
        hitTargetProperties: { int: 0 },
        gates: [
            { key: 'level', pair: [219, 220], field: 'skill',
                refusal: '你古拙掌法火候不够，难以施展「反璞归真」。\n' },
            { key: 'force', pair: [299, 300], field: 'skill', skillName: 'force',
                refusal: '你内功修为不够，难以施展「反璞归真」。\n' },
            { key: 'max-neili', pair: [3599, 3600], field: 'max_neili',
                refusal: '你内力修为不够，难以施展「反璞归真」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在真气不够，难以施展「反璞归真」。\n' },
        ],
    },
    'heixue-shenzhen/luo': {
        skill: 'heixue-shenzhen', ability: 'luo', abilityPath: 'luo',
        usage: 'throwing', grant: 'can_perform/heixue-shenzhen/luo',
        forceSkill: 'xixing-dafa', kind: 'direct', weapon: null, prepared: null,
        families, actorFamily: '日月神教',
        title: '黑血神针「星罗棋布」',
        receiveOnly: true, holdThrowing: true, throwMinAmount: 20,
        fee: 100, meBusy: 2, expHit: true,
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的黑血神针不够娴熟，难以施展「星罗棋布」。\n' },
            { key: 'force', pair: [199, 200], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「星罗棋布」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不足，难以施展「星罗棋布」。\n' },
        ],
    },
    'jifeng-cixuefa/cang': {
        skill: 'jifeng-cixuefa', ability: 'cang', abilityPath: 'cang',
        usage: 'dagger', grant: 'can_perform/jifeng-cixuefa/cang',
        forceSkill: 'xixing-dafa', kind: 'combo', weapon: 'dagger', prepared: 'dagger',
        families, actorFamily: '日月神教',
        title: '疾风刺穴法「天蝎藏针」',
        fee: 80, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 4,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的疾风刺穴法修为有限，难以施展「天蝎藏针」。\n' },
            { key: 'force', pair: [119, 120], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「天蝎藏针」。\n' },
            { key: 'dodge', pair: [119, 120], field: 'effective-dodge',
                refusal: '你的轻功修为不够，难以施展「天蝎藏针」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「天蝎藏针」。\n' },
        ],
    },
    'jinyuan-gun/qian': {
        skill: 'jinyuan-gun', ability: 'qian', abilityPath: 'qian',
        usage: 'club', grant: 'can_perform/jinyuan-gun/qian',
        forceSkill: 'xixing-dafa', kind: 'direct', weapon: 'club', prepared: 'club',
        families, actorFamily: '日月神教',
        title: '金猿棍法「乾坤一击」', directType: 'WEAPON', percent: 35,
        dpSkills: ['dodge'], feeHit: 150, feeMiss: 100, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的金猿棍法修为不够，难以施展「乾坤一击」。\n' },
            { key: 'force', pair: [179, 180], field: 'skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「乾坤一击」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「乾坤一击」。\n' },
        ],
    },
    'pangu-qishi/kai': {
        skill: 'pangu-qishi', ability: 'kai', abilityPath: 'kai',
        usage: 'axe', grant: 'can_perform/pangu-qishi/kai',
        forceSkill: 'xixing-dafa', kind: 'direct', weapon: 'axe', prepared: 'axe',
        families, actorFamily: '日月神教',
        title: '盘古七势「开天辟地」', directType: 'WEAPON', percent: 80,
        dpSkills: ['force'], feeHit: 500, feeMiss: 300, hitBusy: 3, missBusy: 4,
        apBoost: { skill: 'axe', stat: 'str', factor: 10 },
        dpBoost: { skill: 'force', stat: 'con', factor: 10 },
        hitTargetProperties: { con: 0 },
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的盘古七势修为不够，难以施展「开天辟地」。\n' },
            { key: 'force', pair: [299, 300], field: 'skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「开天辟地」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，难以施展「开天辟地」。\n' },
        ],
    },
    'panlong-suo/chan': {
        skill: 'panlong-suo', ability: 'chan', abilityPath: 'chan',
        usage: 'whip', grant: 'can_perform/panlong-suo/chan',
        forceSkill: 'xixing-dafa', kind: 'control', weapon: 'whip', prepared: 'whip',
        families, actorFamily: '日月神教',
        title: '霹雳盘龙索「跗骨缠魂」',
        feeHit: 80, feeMiss: 30,
        meBusyHit: 1, meBusyMiss: 2, targetBusyFormula: 'panlong20',
        nonstandardHit: 'random-skill-half',
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的霹雳盘龙索还不到家，难以施展「跗骨缠魂」。\n' },
            { key: 'force', pair: [179, 180], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「跗骨缠魂」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够，难以施展「跗骨缠魂」。\n' },
        ],
    },
    'panlong-suo/sha': {
        skill: 'panlong-suo', ability: 'sha', abilityPath: 'sha',
        usage: 'whip', grant: 'can_perform/panlong-suo/sha',
        forceSkill: 'xixing-dafa', kind: 'combo', weapon: 'whip', prepared: 'whip',
        families, actorFamily: '日月神教',
        title: '霹雳盘龙索「绝命七杀」',
        fee: 180, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 6,
        applyKeys: ['attack'], nonstandardHit: 'random-skill-half',
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的霹雳盘龙索还不到家，难以施展「绝命七杀」。\n' },
            { key: 'force', pair: [219, 220], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「绝命七杀」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，难以施展「绝命七杀」。\n' },
        ],
    },
    'poyue-zhao/duan': {
        skill: 'poyue-zhao', ability: 'duan', abilityPath: 'duan',
        usage: 'claw', grant: 'can_perform/poyue-zhao/duan',
        forceSkill: 'xixing-dafa', kind: 'combo', weapon: null, prepared: 'claw',
        families, actorFamily: '日月神教',
        title: '破岳神爪「断脉破岳」',
        fee: 50, comboAttacks: 4, comboBusyMin: 1, comboBusyMax: 4,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你破岳神爪不够娴熟，难以施展「断脉破岳」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不足，难以施展「断脉破岳」。\n' },
        ],
    },
    'shiying-lianhuan/sha': {
        skill: 'shiying-lianhuan', ability: 'sha', abilityPath: 'sha',
        usage: 'blade', grant: 'can_perform/shiying-lianhuan/sha',
        forceSkill: 'xixing-dafa', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families, actorFamily: '日月神教',
        title: '弑鹰九连环「无痕杀」', directType: 'WEAPON', percent: 70,
        dpSkills: ['dodge'], feeHit: 250, feeMiss: 100, hitBusy: 2, missBusy: 4,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你弑鹰九连环修为不够，难以施展「无痕杀」。\n' },
            { key: 'force', pair: [199, 200], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「无痕杀」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「无痕杀」。\n' },
        ],
    },
    'yuanshi-jian/gui': {
        skill: 'yuanshi-jian', ability: 'gui', abilityPath: 'gui',
        usage: 'sword', grant: 'can_perform/yuanshi-jian/gui',
        forceSkill: 'xixing-dafa', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '日月神教',
        title: '原始剑法「天地归元」', directType: 'WEAPON', percent: 65,
        dpSkills: ['force'], feeHit: 250, feeMiss: 100, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的原始剑法不够娴熟，难以施展「天地归元」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的真气不够，难以施展「天地归元」。\n' },
        ],
    },
    'yuanshi-jian/xuan': {
        skill: 'yuanshi-jian', ability: 'xuan', abilityPath: 'xuan',
        usage: 'sword', grant: 'can_perform/yuanshi-jian/xuan',
        forceSkill: 'xixing-dafa', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '日月神教',
        title: '原始剑法「天旋地转」',
        feePerAttack: 30, comboAttacksMin: 5, comboAttacksMax: 7,
        comboBusyMin: 1, comboBusyMax: 7, applyKeys: ['attack'],
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的原始剑法不够娴熟，难以施展「天旋地转」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的真气不够，难以施展「天旋地转」。\n' },
        ],
    },
    'zhenyu-quan/tong': {
        skill: 'zhenyu-quan', ability: 'tong', abilityPath: 'tong',
        usage: 'cuff', grant: 'can_perform/zhenyu-quan/tong',
        forceSkill: 'xixing-dafa', kind: 'direct', weapon: null, prepared: 'cuff',
        families, actorFamily: '日月神教',
        title: '镇狱拳法「百鬼恸哭」', directType: 'UNARMED', percent: 35,
        dpSkills: ['dodge'], feeHit: 50, feeMiss: 30, hitBusy: 2, missBusy: 3,
        nonstandardHit: 'random-skill-half',
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你镇狱拳法不够娴熟，难以施展「百鬼恸哭」。\n' },
            { key: 'force', pair: [119, 120], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「百鬼恸哭」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在的真气不够，难以施展「百鬼恸哭」。\n' },
        ],
    },
};

export const b9Schools = schools;

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

export function b9PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b9SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b9ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b9ReviewedSourceHash,
            'Reviewed B9 sources changed; re-review before sampling');
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
                        amount: cfg.throwMinAmount ?? 25 } }
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
                id: `b9-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b9', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b9-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b9SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}日月独有：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '惊虹一笔与环环相扣与乾坤一击与开天辟地与无痕杀与天地归元直伤、'
                        + '大智若愚与反璞归真掌力直伤（反璞归真另有后续连击）、'
                        + '天蝎藏针与断脉破岳连击、绝命七杀与天旋地转连击带攻击加成、'
                        + '大巧若拙与跗骨缠魂目标忙乱、星罗棋布暗器散射直接伤血与消耗、'
                        + '百鬼恸哭非标准命中均按原分支记账。只收集数据，不比较强弱。',
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
                refusal: cfg.ability === 'zhuo' || cfg.ability === 'chan'
                    ? (cfg.ability === 'zhuo'
                        ? '右试弟子目前正自顾不暇，放胆攻击吧。\n'
                        : '右试弟子目前正自顾不暇，放胆攻击吧。\n')
                    : '右试弟子目前正自顾不暇，放胆攻击吧。\n' });
        if (cfg.holdThrowing) {
            add('no-throwing', { actorEquipment: null,
                refusal: '你现在手中并没有拿着暗器。\n' });
            add('thin-throwing', {
                actorEquipment: { type: 'throwing', hold: true, amount: 10 },
                refusal: '至少要有二十枚暗器才能施展「星罗棋布」。\n' });
        }
        if (cfg.ability === 'duan')
            add('mutual-prepare', {
                preparations: { claw: 'poyue-zhao', cuff: 'zhenyu-quan' },
                skills: { 'zhenyu-quan': 300, cuff: 300 },
                refusal: '施展「断脉破岳」时破岳神爪不谊和镇狱拳法互背。\n' });
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

function stableState(before, after, mutate, { holdThrowing = false, consumeThrowing = false } = {}) {
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

export function validateB9Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B9 entry');
    assert.equal(p.collection_group, 'b9-perform');
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
    if (cfg.kind === 'control') return validateB9Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct' && cfg.receiveOnly) return validateB9Receive(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB9Direct(raw, condition, cfg, p, b, t, a, v);
    return validateB9Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB9Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const miss = directs.length === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), miss ? 0 : 1, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const fee = cfg.unconditionalFee ? (cfg.feeHit ?? 0)
        : miss ? (cfg.feeMiss ?? 0) : (cfg.feeHit ?? 0);
    if (cfg.followupAttacks) {
        // zhen: followup do_attack can add jiali cost beyond the flat fee.
        assert.ok(b.neili - a.neili >= fee, 'branch fee floor');
    } else {
        assert.equal(b.neili - a.neili, fee, 'branch fee');
    }
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
        if (cfg.followupAttacks) stableState(t, v, e => { e.busy = v.busy; e.qi = v.qi; e.eff_qi = v.eff_qi; });
        else stableState(t, v);
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

function validateB9Receive(raw, condition, cfg, p, b, t, a, v) {
    // luo: receive_damage/receive_wound plus weapon->hit_ob, not do_damage.
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'receive not do_damage');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    const spent = b.neili - a.neili;
    const miss = v.qi === t.qi && v.eff_qi === t.eff_qi;
    assertLearnGain(a, p.skill);
    assert.equal(spent, cfg.fee, 'luo fee');
    assert.equal(num(a.busy), cfg.meBusy, 'luo busy');
    const opts = { consumeThrowing: true };
    if (miss) {
        stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); }, opts);
        stableState(t, v, null, opts);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.ok(v.qi < t.qi, 'receive damage applied');
    assert.ok(v.eff_qi <= t.eff_qi, 'receive wound applied');
    stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); }, opts);
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        allowDerived(e, v);
    }, opts);
    return { accepted: true, kind: 'direct', hit: true };
}

function validateB9Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const hit = num(v.busy) > 0;
    const fee = cfg.unconditionalFee ? (cfg.feeHit ?? 0) : hit ? cfg.feeHit : cfg.feeMiss;
    assert.equal(cost, fee, 'control fee');
    assert.equal(b.neili - a.neili, fee, 'fee deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    if (hit) {
        // zhuo reads raw skill; chan reads effective (non-raw).
        const level = num(sparse(b.skills, cfg.skill));
        const effective = num(sparse(b.effective_skills ?? b.skills, cfg.skill));
        if (cfg.targetBusyFormula === 'guzhuo22')
            assert.equal(tBusy, Math.trunc(level / 22) + 2, 'zhuo target busy');
        else if (cfg.targetBusyFormula === 'panlong20')
            assert.equal(tBusy, Math.trunc(effective / 20) + 1, 'chan target busy');
        assert.equal(busyAfter, cfg.meBusyHit, 'me busy on hit');
    } else {
        assert.equal(tBusy, 0, 'no target busy on miss');
        assert.equal(busyAfter, cfg.meBusyMiss, 'me busy on miss');
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
    stableState(t, v, e => { e.busy = v.busy; });
    return { accepted: true, kind: 'control', hit };
}

function validateB9Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    if (cfg.feePerAttack) {
        // xuan: fee = planned attack_time * 30, planned 5-7.
        const planned = fee / cfg.feePerAttack;
        assert.equal(fee % cfg.feePerAttack, 0, 'fee tracks per-attack cost');
        assert.ok(planned >= cfg.comboAttacksMin && planned <= cfg.comboAttacksMax,
            'planned attack window');
        assert.ok(attacks.length >= 1 && attacks.length <= planned,
            'actual attacks bounded by plan');
    } else {
        assert.ok(fee >= cfg.fee, 'combo fee floor');
        assert.ok(attacks.length >= 1 && attacks.length <= (cfg.comboAttacks ?? 10),
            'combo attack count');
    }
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

export function b9Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB9Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
