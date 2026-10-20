// B16 Miao-exclusive 9 + Wudu-exclusive 9 perform batch (18 moves).
// Miao: miaojia-zhang dan, pobei-tui kai, chongtian-zhang zhan,
// suqin-beijian can, baxian-jian dian, tianlong-jian zhui,
// miaojia-jian zhai/zhu/qian. Wudu: ruanhong-zhusuo pan/bohu/suo/teng,
// jinwu-goufa duo, hansha-sheying zhen, xiewei-bian teng,
// tianchan-zhang chan, wusheng-zhao lian.
// One collection settles these exclusive performs.
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

// Miao-exclusive moves settle 中原苗家; Wudu-exclusive settle 五毒教.
const miaoFamilies = ['中原苗家'];
const wuduFamilies = ['五毒教'];

export const b16SourcePaths = [
    'kungfu/skill/miaojia-zhang.c', 'kungfu/skill/miaojia-zhang/dan.c',
    'kungfu/skill/pobei-tui.c', 'kungfu/skill/pobei-tui/kai.c',
    'kungfu/skill/chongtian-zhang.c', 'kungfu/skill/chongtian-zhang/zhan.c',
    'kungfu/skill/suqin-beijian.c', 'kungfu/skill/suqin-beijian/can.c',
    'kungfu/skill/baxian-jian.c', 'kungfu/skill/baxian-jian/dian.c',
    'kungfu/skill/tianlong-jian.c', 'kungfu/skill/tianlong-jian/zhui.c',
    'kungfu/skill/miaojia-jian.c', 'kungfu/skill/miaojia-jian/zhai.c',
    'kungfu/skill/miaojia-jian/zhu.c', 'kungfu/skill/miaojia-jian/qian.c',
    'kungfu/skill/ruanhong-zhusuo.c', 'kungfu/skill/ruanhong-zhusuo/pan.c',
    'kungfu/skill/ruanhong-zhusuo/bohu.c', 'kungfu/skill/ruanhong-zhusuo/suo.c',
    'kungfu/skill/ruanhong-zhusuo/teng.c',
    'kungfu/skill/jinwu-goufa.c', 'kungfu/skill/jinwu-goufa/duo.c',
    'kungfu/skill/hansha-sheying.c', 'kungfu/skill/hansha-sheying/zhen.c',
    'kungfu/skill/xiewei-bian.c', 'kungfu/skill/xiewei-bian/teng.c',
    'kungfu/skill/tianchan-zhang.c', 'kungfu/skill/tianchan-zhang/chan.c',
    'kungfu/skill/wusheng-zhao.c', 'kungfu/skill/wusheng-zhao/lian.c',
    'kungfu/skill/miaojia-neigong.c', 'kungfu/skill/wudu-xinfa.c',
    'kungfu/skill/sword.c', 'kungfu/skill/strike.c',
    'kungfu/skill/claw.c', 'kungfu/skill/whip.c',
    'kungfu/skill/throwing.c', 'kungfu/skill/unarmed.c',
    'kungfu/skill/force.c', 'kungfu/skill/parry.c', 'kungfu/skill/dodge.c',
    'kungfu/skill/martial-cognize.c', 'kungfu/skill/poison.c',
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
export const b16ReviewedSourceHash = '06880f10dc366f9119fae6e0e85561352d12ceaf756472a22cf8f6b5a69ab025';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. All B16 moves gate on basic force except none that remap force.
const schools = {
    'miaojia-zhang/dan': {
        skill: 'miaojia-zhang', ability: 'dan', abilityPath: 'dan',
        usage: 'strike', grant: 'can_perform/miaojia-zhang/dan',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: miaoFamilies, actorFamily: '中原苗家',
        title: '苗家掌法「丹阳劲」', directType: 'UNARMED', percent: 30,
        // Unconditional -30 before the hit check; hit check random(force)>force/2.
        nonstandardHit: 'force-half',
        feeHit: 30, feeMiss: 30, unconditionalFee: true,
        hitBusy: 3, missBusy: 3,
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [39, 40], field: 'skill',
                refusal: '你的苗家掌法不够娴熟，难以施展「丹阳劲」。\n' },
            { key: 'max-neili', pair: [199, 200], field: 'max_neili',
                refusal: '你的内功修为不足，难以施展「丹阳劲」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你现在真气太弱，难以施展「丹阳劲」。\n' },
        ],
    },
    'pobei-tui/kai': {
        skill: 'pobei-tui', ability: 'kai', abilityPath: 'kai',
        usage: 'unarmed', grant: 'can_perform/pobei-tui/kai',
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'unarmed',
        families: miaoFamilies, actorFamily: '中原苗家',
        title: '破碑腿「五岳为开」',
        // Unconditional -100; 4 fixed attacks; hit check random(force+unarmed)>force
        // arms temporary apply/attack += skill/5.
        fee: 100, comboAttacks: 4, comboBusyMin: 0, comboBusyMax: 3,
        applyKeys: ['attack'], comboHitBonus: null, comboHitAttackFromSkill: true,
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候太浅，难以施展「五岳为开」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的破碑腿不够娴熟，难以施展「五岳为开」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气太弱，难以施展「五岳为开」。\n' },
        ],
    },
    'chongtian-zhang/zhan': {
        skill: 'chongtian-zhang', ability: 'zhan', abilityPath: 'zhan',
        usage: 'strike', grant: 'can_perform/chongtian-zhang/zhan',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: miaoFamilies, actorFamily: '中原苗家',
        title: '白鹤冲天掌「翅展九州」', directType: 'UNARMED', percent: 30,
        // -50 always, -100 more on hit; hit check ap/2+random(strike)>force.
        feeHit: 150, feeMiss: 50,
        hitBusy: 3, missBusy: 4,
        dpSkills: ['force'],
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「翅展九州」。\n' },
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的白鹤冲天掌不够娴熟，难以施展「翅展九州」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，难以施展「翅展九州」。\n' },
        ],
    },
    'suqin-beijian/can': {
        skill: 'suqin-beijian', ability: 'can', abilityPath: 'can',
        usage: 'sword', grant: 'can_perform/suqin-beijian/can',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: null,
        families: miaoFamilies, actorFamily: '中原苗家',
        title: '苏秦背剑「残阳劲」', directType: 'WEAPON', percent: 10,
        feeHit: 30, feeMiss: 20,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [79, 80], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「残阳劲」。\n' },
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的苏秦背剑修为不够，难以施展「残阳劲」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你现在真气不够，难以施展「残阳劲」。\n' },
        ],
    },
    'baxian-jian/dian': {
        skill: 'baxian-jian', ability: 'dian', abilityPath: 'dian',
        usage: 'sword', grant: 'can_perform/baxian-jian/dian',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: null,
        families: miaoFamilies, actorFamily: '中原苗家',
        title: '八仙剑法「魁星点元」', directType: 'WEAPON', percent: 30,
        // final callback drains target neili by the damage input.
        finalNeiliDrain: true,
        feeHit: 150, feeMiss: 60,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「魁星点元」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的八仙剑法修为不够，难以施展「魁星点元」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你现在真气不够，难以施展「魁星点元」。\n' },
        ],
    },
    'tianlong-jian/zhui': {
        skill: 'tianlong-jian', ability: 'zhui', abilityPath: 'zhui',
        usage: 'sword', grant: 'can_perform/tianlong-jian/zhui',
        forceSkill: 'force', kind: 'multi', weapon: 'sword', prepared: null,
        families: miaoFamilies, actorFamily: '中原苗家',
        title: '天龙剑法「毒龙双锥」', directType: 'WEAPON',
        multiDirects: 2,
        percentRanges: [[30, 30], [40, 40]],
        // Unconditional -350; each strike has its own hit check.
        fee: 350, hitBusyMin: 2, hitBusyMax: 4,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的天龙剑法火候太浅，难以施展「毒龙双锥」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为太浅，难以施展「毒龙双锥」。\n' },
            { key: 'max-neili', pair: [1499, 1500], field: 'max_neili',
                refusal: '你的内力修为太浅，难以施展「毒龙双锥」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，，难以施展「毒龙双锥」。\n' },
        ],
    },
    'miaojia-jian/zhai': {
        skill: 'miaojia-jian', ability: 'zhai', abilityPath: 'zhai',
        usage: 'sword', grant: 'can_perform/miaojia-jian/zhai',
        forceSkill: 'force', kind: 'control', weapon: 'sword', prepared: null,
        families: miaoFamilies, actorFamily: '中原苗家',
        title: '苗家剑法「云边摘月」',
        feeHit: 30, feeMiss: 30, unconditionalFee: true,
        meBusyHit: 0, meBusyMiss: 2,
        // hit check random(level) > parry/2; target busy level/18+2.
        targetBusyFormula: 'skill18-2', dpSkills: ['parry'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你苗家剑法不够娴熟，难以施展「云边摘月」。\n' },
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「云边摘月」。\n' },
            { key: 'max-neili', pair: [799, 800], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「云边摘月」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，难以施展「云边摘月」。\n' },
        ],
    },
    'miaojia-jian/zhu': {
        skill: 'miaojia-jian', ability: 'zhu', abilityPath: 'zhu',
        usage: 'sword', grant: 'can_perform/miaojia-jian/zhu',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: null,
        families: miaoFamilies, actorFamily: '中原苗家',
        title: '苗家剑法「黄龙吐珠」', directType: 'WEAPON', percent: 60,
        feeHit: 150, feeMiss: 50,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你苗家剑法不够娴熟，难以施展「黄龙吐珠」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「黄龙吐珠」。\n' },
            { key: 'max-neili', pair: [1199, 1200], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「黄龙吐珠」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，难以施展「黄龙吐珠」。\n' },
        ],
    },
    'miaojia-jian/qian': {
        skill: 'miaojia-jian', ability: 'qian', abilityPath: 'qian',
        usage: 'sword', grant: 'can_perform/miaojia-jian/qian',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: null,
        families: miaoFamilies, actorFamily: '中原苗家',
        title: '苗家剑法「剑舞千秋」',
        // attack_time = 5+random(ap/45) capped 8; fee = attack_time*25.
        feePerAttack: 25, comboAttacksMin: 5, comboAttacksMax: 8,
        comboBusyMin: 1, comboBusyMax: 8, applyKeys: ['attack'],
        // Hit check ap/2+random(ap*2) > parry; hit arms apply/attack += ap/10.
        comboHitAttackFromSkill: true,
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你苗家剑法不够娴熟，难以施展「剑舞千秋」。\n' },
            { key: 'force', pair: [219, 220], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「剑舞千秋」。\n' },
            { key: 'max-neili', pair: [1799, 1800], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「剑舞千秋」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，难以施展「剑舞千秋」。\n' },
        ],
    },
    'ruanhong-zhusuo/pan': {
        skill: 'ruanhong-zhusuo', ability: 'pan', abilityPath: 'pan',
        usage: 'whip', grant: 'can_perform/ruanhong-zhusuo/panying',
        forceSkill: 'force', kind: 'control', weapon: 'whip', prepared: null,
        families: wuduFamilies, actorFamily: '五毒教',
        title: '软红蛛索「盘鹰诀」',
        // No fee at all; me busy 1 both branches.
        feeHit: 0, feeMiss: 0,
        meBusyHit: 1, meBusyMiss: 1,
        // Hit check random(combat_exp) > combat_exp/2; target busy skill/20+2.
        expHitCheck: true,
        targetBusyFormula: 'skill20-2', dpSkills: [],
        targetBusyRefusal: true,
        targetBusyRefusalText: '右试弟子目前正自顾不暇，放胆攻击吧！\n',
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的软红蛛索不够娴熟，无法施展「盘鹰诀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够，无法施展「盘鹰诀」。\n' },
        ],
    },
    'ruanhong-zhusuo/bohu': {
        skill: 'ruanhong-zhusuo', ability: 'bohu', abilityPath: 'bohu',
        usage: 'whip', grant: 'can_perform/ruanhong-zhusuo/bohu',
        forceSkill: 'force', kind: 'direct', weapon: 'whip', prepared: null,
        families: wuduFamilies, actorFamily: '五毒教',
        title: '软红蛛索「搏虎诀」', directType: 'WEAPON', percent: 55,
        feeHit: 300, feeMiss: 100,
        hitBusy: 1, missBusy: 3,
        dpSkills: ['force', 'parry'],
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的软红蛛索不够娴熟，无法施展「搏虎诀」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，无法施展「搏虎诀」。\n' },
        ],
    },
    'ruanhong-zhusuo/suo': {
        skill: 'ruanhong-zhusuo', ability: 'suo', abilityPath: 'suo',
        usage: 'whip', grant: 'can_perform/ruanhong-zhusuo/suolong',
        forceSkill: 'force', kind: 'combo', weapon: 'whip', prepared: null,
        families: wuduFamilies, actorFamily: '五毒教',
        title: '软红蛛索「锁龙诀」',
        // attack_time = 4+random(ap/45) capped 8; fee = attack_time*20.
        feePerAttack: 20, comboAttacksMin: 4, comboAttacksMax: 8,
        comboBusyMin: 1, comboBusyMax: 8, applyKeys: ['attack'],
        comboHitAttackFromSkill: true,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的软红蛛索不够娴熟，无法施展「锁龙诀」。\n' },
            { key: 'neili', pair: [349, 350], field: 'neili',
                refusal: '你的真气不够，无法施展「锁龙诀」。\n' },
        ],
    },
    'ruanhong-zhusuo/teng': {
        skill: 'ruanhong-zhusuo', ability: 'teng', abilityPath: 'teng',
        usage: 'whip', grant: 'can_perform/xiewei-bian/tengshe',
        forceSkill: 'force', kind: 'direct', weapon: 'whip', prepared: null,
        families: wuduFamilies, actorFamily: '五毒教',
        title: '软红蛛索「腾蛇诀」', directType: 'WEAPON', percent: 30,
        feeHit: 150, feeMiss: 100,
        hitBusy: 1, missBusy: 3,
        dpSkills: ['force', 'parry'],
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的软红蛛索不够娴熟，无法施展「腾蛇诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，无法施展「腾蛇诀」。\n' },
        ],
    },
    'jinwu-goufa/duo': {
        skill: 'jinwu-goufa', ability: 'duo', abilityPath: 'duo',
        usage: 'sword', grant: 'can_perform/jinwu-goufa/duo',
        forceSkill: 'force', kind: 'duo', weapon: 'sword', prepared: null,
        families: wuduFamilies, actorFamily: '五毒教',
        title: '金蜈钩法「金钩夺魄」', directType: 'WEAPON', percent: 40,
        // -50 always; on hit -200 more. Three hit branches:
        // instant-kill (max_neili>target*2), disarm (target holds weapon and
        // sword>parry), or plain do_damage.
        feeHit: 250, feeMiss: 50,
        hitBusyMin: 2, hitBusyMax: 3, missBusy: 4,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的金蜈钩法还不够娴熟，无法施展「金钩夺魄」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，无法施展「金钩夺魄」。\n' },
        ],
    },
    'hansha-sheying/zhen': {
        skill: 'hansha-sheying', ability: 'zhen', abilityPath: 'zhen',
        usage: 'throwing', grant: 'can_perform/hansha-sheying/zhen',
        forceSkill: 'force', kind: 'throwing', weapon: null, prepared: null,
        families: wuduFamilies, actorFamily: '五毒教',
        title: '含沙射影「无影针」',
        // Consumes 10 throwing; fee 100; always busy 2; hit by combat_exp.
        // Throwing weapon goes in handing slot (hold:true), not weapon slot.
        handing: 'throwing',
        fee: 100, meBusy: 2,
        dpSkills: [],
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的含沙射影不够娴熟，难以施展「无影针」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「无影针」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在的真气不足，难以施展「无影针」。\n' },
        ],
    },
    'xiewei-bian/teng': {
        skill: 'xiewei-bian', ability: 'teng', abilityPath: 'teng',
        usage: 'whip', grant: 'can_perform/xiewei-bian/tengshe',
        forceSkill: 'force', kind: 'direct', weapon: 'whip', prepared: null,
        families: wuduFamilies, actorFamily: '五毒教',
        title: '蝎尾鞭「腾蛇诀」', directType: 'WEAPON', percent: 50,
        feeHit: 150, feeMiss: 100,
        hitBusy: 1, missBusy: 3,
        dpSkills: ['force', 'parry'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                // Original text reuses the weapon mismatch sentence for the level gate.
                refusal: '你使用的武器不对，无法施展「腾蛇诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，无法施展「腾蛇诀」。\n' },
        ],
    },
    'tianchan-zhang/chan': {
        skill: 'tianchan-zhang', ability: 'chan', abilityPath: 'chan',
        usage: 'strike', grant: 'can_perform/tianchan-zhang/chan',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: wuduFamilies, actorFamily: '五毒教',
        title: '天蟾掌法「毒蟾掌」', directType: 'REMOTE', percent: 70,
        // Applies tianchan_zhang condition on hit.
        poisonCondition: 'tianchan_zhang',
        feeHit: 150, feeMiss: 100,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你天蟾掌法不够纯熟，难以施展「毒蟾掌」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候太低，，难以施展「毒蟾掌」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的内力不够，，难以施展「毒蟾掌」。\n' },
        ],
    },
    'wusheng-zhao/lian': {
        skill: 'wusheng-zhao', ability: 'lian', abilityPath: 'lian',
        usage: 'claw', grant: 'can_perform/wusheng-zhao/lian',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'claw',
        families: wuduFamilies, actorFamily: '五毒教',
        title: '五圣毒爪「夺命连环」', directType: 'UNARMED', percent: 30,
        // Secondary hit check may also busy the target.
        secondaryTargetBusy: 'claw25-2',
        feeHit: 150, feeMiss: 50,
        hitBusy: 1, missBusy: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的五圣毒爪等级不够，难以施展「夺命连环」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「夺命连环」。\n' },
        ],
    },
};

export const b16Schools = schools;

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
            case 'effective-skill': {
                const name = gate.skillName ?? cfg.skill;
                raise(skills, name, (high + 1) * 2);
                break;
            }
        }
    }
    return { skills, properties };
};

// Each gate pair is the value the source compares. The edits below map that
// value onto the one input that reproduces it. For effective-skill gates the
// pair values are the source thresholds; raw = value*2 hits the boundary
// exactly when there is no apply offset.
const gateEdit = (cfg, gate, value, isLow) => {
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
        case 'effective-skill': {
            const name = gate.skillName ?? cfg.skill;
            return { skills: { [name]: isLow ? value * 2 : (value + 1) * 2 } };
        }
        default: return { skills: { [gate.field]: value } };
    }
};

export function b16PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b16SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b16ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b16ReviewedSourceHash,
            'Reviewed B16 sources changed; re-review before sampling');
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
                'martial-cognize': 200, poison: 200,
                ...(cfg.extraSkills ?? {}),
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
                mappings: { ...(cfg.forceSkill && cfg.forceSkill !== 'force'
                    ? { force: cfg.forceSkill } : {}),
                [cfg.usage]: cfg.skill,
                    ...(cfg.extraMappings ?? {}), ...extra.mappings },
                preparations: extra.preparations ?? (cfg.prepared ? { [cfg.prepared]: cfg.skill } : {}),
                properties,
                ...(cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}),
                ...(cfg.handing ? { equipment: { type: cfg.handing, hold: true } } : {}),
            };
            if ('actorEquipment' in extra) {
                if (extra.actorEquipment) actor.equipment = extra.actorEquipment;
                else delete actor.equipment;
            }
            const targetTemp = extra.targetTemp ?? cfg.targetTemp;
            const targetEquipment = 'targetEquipment' in extra ? extra.targetEquipment
                : cfg.targetUnarmed ? null : { type: 'sword', hold: false };
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
                id: `b16-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b16', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b16-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b16SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}独有：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + (cfg.kind === 'duo'
                            ? '金钩夺魄含内力碾压即死与夺械分支，先扣50再按命中分支记账。'
                            : cfg.kind === 'throwing'
                                ? '无影针消耗十枚暗器并按战斗经验判定，命中走暗器附加效果。'
                                : cfg.poisonCondition
                                    ? '毒蟾掌命中施加天蟾掌毒状态，直伤按REMOTE记账。'
                                    : cfg.kind === 'multi'
                                        ? '毒龙双锥两剑各自判定并分段记账，费用无条件扣除。'
                                        : '目标忙乱与直伤与连击均按原分支记账。')
                        + '只收集数据，不比较强弱。',
                },
            });
        }
        const primary = cfg.gates[0];
        add(`baseline-l${level}`, {
            ...(cfg.kind === 'duo' ? { targetSkills: { parry: 0 } } : {}),
            samples: smoke ? 2 : samples });
        for (const gate of cfg.gates.filter(g => g.key === primary.key)) {
            const [low, high] = gate.pair;
            add(`gate-${gate.key}-${low}`, { ...gateEdit(cfg, gate, low, true),
                refusal: gate.refusal, samples: 2 });
            add(`gate-${gate.key}-${high}`, { ...gateEdit(cfg, gate, high, false), samples: 2 });
        }
        if (cfg.kind === 'duo') {
            add('hit', { targetSkills: { parry: 0 }, samples: 4 });
            add('miss', { targetSkills: { parry: 100000 }, samples: 4 });
            add('instant-kill', { targetSkills: { parry: 0 },
                targetProperties: { max_neili: 3000 },
                properties: { max_neili: 8000 }, samples: smoke ? 2 : 4 });
            add('disarm', { targetSkills: { parry: 0 },
                targetProperties: { max_neili: 8000 },
                targetEquipment: { type: 'sword', hold: false }, samples: smoke ? 2 : 4 });
        } else if (cfg.kind === 'throwing') {
            add('hit', { targetProperties: { combat_exp: 1 }, samples: 4 });
            add('miss', { targetProperties: { combat_exp: 100000000000 }, samples: 4 });
        } else if (cfg.expHitCheck) {
            add('hit', { targetProperties: { combat_exp: 1 }, samples: 4 });
            add('miss', { targetProperties: { combat_exp: 100000000000 }, samples: 4 });
        } else if (cfg.dpSkills && cfg.dpSkills.length && cfg.kind !== 'combo') {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        if (cfg.targetBusyFormula || cfg.targetBusyRefusal)
            add('target-busy', { targetBusy: true,
                refusal: cfg.targetBusyRefusalText
                    ?? '右试弟子目前正自顾不暇，放胆攻击吧。\n' });
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

function targetBusyFor(cfg, b, hit) {
    if (!hit) return 0;
    const rawSkill = num(sparse(b.skills, cfg.skill));
    const effSkill = name => {
        const raw = num(sparse(b.skills, name));
        const mapped = b.mappings?.[name];
        return Math.trunc(raw / 2) + (mapped ? num(sparse(b.skills, mapped)) : 0);
    };
    switch (cfg.targetBusyFormula) {
        // zhai miaojia: level = query_skill(skill,1); busy = level/18+2
        case 'skill18-2': return Math.trunc(rawSkill / 18) + 2;
        // pan ruanhong: level = query_skill(skill); busy = level/20+2
        case 'skill20-2': return Math.trunc(effSkill(cfg.skill) / 20) + 2;
        // lian wusheng secondary: busy = claw/25+2
        case 'claw25-2': {
            const rawClaw = num(sparse(b.skills, 'claw'));
            return Math.trunc(rawClaw / 25) + 2;
        }
        default: return 0;
    }
}

export function validateB16Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B16 entry');
    assert.equal(p.collection_group, 'b16-perform');
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
    if (cfg.kind === 'control') return validateB16Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB16Multi(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'duo') return validateB16Duo(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'throwing') return validateB16Throwing(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB16Direct(raw, condition, cfg, p, b, t, a, v);
    return validateB16Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB16Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const miss = directs.length === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length === 1 ? 1 : 0, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    let fee;
    if (cfg.unconditionalFee) fee = cfg.feeHit ?? 0;
    else if (miss) fee = cfg.feeMiss ?? 0;
    else fee = cfg.feeHit ?? 0;
    assert.equal(b.neili - a.neili, fee, 'branch fee');
    const busyAfter = num(a.busy);
    if (cfg.meBusy !== undefined) assert.equal(busyAfter, cfg.meBusy, 'fixed me busy');
    else {
        const busyMin = miss ? (cfg.missBusyMin ?? cfg.missBusy)
            : (cfg.hitBusyMin ?? cfg.hitBusy);
        const busyMax = miss ? (cfg.missBusyMax ?? cfg.missBusy)
            : (cfg.hitBusyMax ?? cfg.hitBusy);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'busy range');
    }
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
    const support = slice2SupportSet(input, cfg.percent, b, t, cfg.directType);
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

function validateB16Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const hit = num(v.busy) > 0;
    const fee = hit ? cfg.feeHit : cfg.feeMiss;
    assert.equal(cost, fee, 'control fee');
    assert.equal(b.neili - a.neili, fee, 'fee deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    if (hit) {
        assert.ok(tBusy >= 1, 'target busy on hit');
        const expected = targetBusyFor(cfg, b, hit);
        assert.equal(tBusy, expected, 'target busy formula');
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
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.busy = v.busy;
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'control', hit };
}

function validateB16Multi(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= cfg.multiDirects, 'multi direct bound');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
    }
    const fee = b.neili - a.neili;
    assert.equal(fee, cfg.fee, 'unconditional multi fee');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length, 'direct count');
    const busyAfter = num(a.busy);
    assert.ok(busyAfter >= (cfg.hitBusyMin ?? 0) && busyAfter <= (cfg.hitBusyMax ?? 0),
        'multi busy range');
    for (let i = 0; i < directs.length; i++) {
        const input = num(directs[i].damage);
        const support = supportRange(input, cfg.percentRanges[i] ?? cfg.percentRanges[0],
            b, t, cfg.directType);
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
    return { accepted: true, kind: 'multi', hit: directs.length > 0, hits: directs.length };
}

function validateB16Duo(raw, condition, cfg, p, b, t, a, v) {
    // jinwu-goufa duo: -50 always; on hit -200 more then one of three branches.
    const directs = raw.directs ?? [];
    const death = raw.terminals.length > 0 || num(v.ghost) === 1 || num(v.living) === 0;
    const variant = p.variant;
    const isDisarmVariant = variant.startsWith('disarm');
    const isKillVariant = variant.startsWith('instant-kill');
    // Detect actual branch from sample: death > disarm (weapon dropped) > hit > miss.
    const weaponDropped = (raw.dropped ?? []).length > 0
        || (b.equipment !== undefined && v.equipment === undefined);
    const isDeath = death;
    const fee = b.neili - a.neili;
    const isHitBranch = fee === cfg.feeHit;
    const isDisarm = !death && (weaponDropped || (isDisarmVariant && directs.length === 0 && isHitBranch));
    if (isDeath) assert.equal(fee, cfg.feeHit, 'death branch pays 50+200');
    else if (isDisarm) assert.equal(fee, cfg.feeHit, 'disarm branch pays 50+200');
    else if (isHitBranch) assert.equal(fee, cfg.feeHit, 'hit pays 50+200');
    else assert.equal(fee, cfg.feeMiss, 'miss pays only the opening 50');
    const busyAfter = num(a.busy);
    if (!isHitBranch) {
        assert.equal(busyAfter, cfg.missBusy, 'miss busy 4');
    } else {
        assert.ok(busyAfter >= cfg.hitBusyMin && busyAfter <= cfg.hitBusyMax + 2, 'hit busy range');
    }
    assertLearnGain(a, p.skill);
    if (isDeath) {
        if (isKillVariant) assert.ok(true, 'instant-kill variant confirms death');
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili; e.living = v.living; e.ghost = v.ghost;
            e.max_neili = v.max_neili; e.combat_exp = v.combat_exp;
            if (v.potential !== undefined) e.potential = v.potential;
            if (v.shen !== undefined) e.shen = v.shen;
            e.conditions = copy(v.conditions ?? null);
            e.mappings = copy(v.mappings ?? {});
            e.preparations = copy(v.preparations ?? {});
            e.skills = copy(v.skills ?? {});
            if (v.equipment === undefined) delete e.equipment;
            else e.equipment = copy(v.equipment);
            for (const k of ['weapon', 'weapon_damage', 'weapon_flag', 'handing', 'ammunition',
                'weapon_details', 'handing_details', 'secondary_weapon'])
                if (v[k] !== undefined) e[k] = copy(v[k]);
                else delete e[k];
            if (v.temp) {
                e.temp = copy(v.temp);
                delete e.temp.notify_fail;
                if (e.temp.apply) {
                    for (const k of Object.keys(e.temp.apply))
                        if (e.temp.apply[k] === 0) delete e.temp.apply[k];
                }
            }
            if (e.weapon_details) e.weapon_details.consistence = 0;
            if (e.handing_details && Object.keys(e.handing_details).length)
                e.handing_details.consistence = 0;
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'duo', hit: true, death: true };
    }
    if (isDisarm) {
        assert.equal(directs.length, 0, 'disarm branch has no direct');
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.busy = v.busy;
            if (v.equipment === undefined) delete e.equipment;
            else e.equipment = copy(v.equipment);
            for (const k of ['weapon', 'weapon_damage', 'weapon_flag', 'handing', 'ammunition',
                'weapon_details', 'handing_details', 'secondary_weapon'])
                if (v[k] !== undefined) e[k] = copy(v[k]);
                else delete e[k];
            if (v.temp) {
                e.temp = copy(v.temp);
                delete e.temp.notify_fail;
                if (e.temp.apply) {
                    for (const k of Object.keys(e.temp.apply))
                        if (e.temp.apply[k] === 0) delete e.temp.apply[k];
                }
            }
            if (e.weapon_details) e.weapon_details.consistence = 0;
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'duo', hit: true, disarm: true };
    }
    if (!isHitBranch) {
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v);
        return { accepted: true, kind: 'duo', hit: false };
    }
    // Plain hit branch with do_damage.
    assert.equal(directs.length, 1, 'plain hit has one direct');
    const input = num(directs[0].damage);
    const support = slice2SupportSet(input, cfg.percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'duo', hit: true, input };
}

function validateB16Throwing(raw, condition, cfg, p, b, t, a, v) {
    // hansha-sheying zhen: consumes 10 throwing, fee 100, busy 2 always.
    const fee = b.neili - a.neili;
    assert.equal(fee, cfg.fee, 'throwing fee');
    assert.equal(num(a.busy), cfg.meBusy, 'fixed busy 2');
    assertLearnGain(a, p.skill);
    const hit = num(v.qi) !== num(t.qi) || num(v.eff_qi) !== num(t.eff_qi);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    }, { consumeThrowing: true });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'throwing', hit };
}

function validateB16Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    if (cfg.feePerAttack) {
        const planned = fee / cfg.feePerAttack;
        assert.equal(fee % cfg.feePerAttack, 0, 'fee tracks per-attack cost');
        assert.ok(planned >= cfg.comboAttacksMin && planned <= cfg.comboAttacksMax,
            'planned attack window');
        assert.ok(attacks.length >= 1 && attacks.length <= planned,
            'actual attacks bounded by plan');
    } else {
        assert.ok(fee >= (cfg.fee ?? 0), 'combo fee floor');
        assert.ok(attacks.length >= 1 && attacks.length <= (cfg.comboAttacks ?? 8),
            'combo attack count');
    }
    assert.ok(num(a.busy) >= cfg.comboBusyMin && num(a.busy) <= cfg.comboBusyMax,
        'combo busy range');
    for (const at of attacks) assert.ok([0, -1, -2].includes(at.result));
    assert.equal(directs.length, 0, 'combo has no directs');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    const keys = cfg.applyKeys ?? ['attack'];
    for (const key of keys) {
        const before = temp(b, 'apply/' + key);
        const after = temp(a, 'apply/' + key);
        if (cfg.comboHitBonus) {
            assert.ok(after === before || after === before - cfg.comboHitBonus,
                'temp ' + key + ' restored or left at -bonus on miss');
        } else {
            assert.equal(after, before, 'temp ' + key + ' restored to prior value');
        }
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

export function b16Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB16Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
