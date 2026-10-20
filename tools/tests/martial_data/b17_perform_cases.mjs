// B17 Hu-exclusive 8 + Ouyang-exclusive 8 + Kunlun-exclusive 8 perform batch (24 moves).
// Hu: hua-quan juan, hujia-quan kuai, chuncan-zhang jian, sixiang-bufa fei,
// mantian-xing shan/xing, chuangwang-dao xiong, baisheng-daofa heng.
// Ouyang: lingshe-zhangfa qianshe/wanshi/chan, lingshe-quan rou,
// shedu-qiqiao da/liandu, baibian-daxue dian, hamagong zhen.
// Kunlun: zhentian-quan shi, kunlun-qifa liu, zhengliangyi-jian sui/wu,
// sanyin-shou sun, qiankun-jian riyue/ni, kunlun-zhang kong.
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

// Hu-exclusive moves settle 关外胡家; Ouyang settle 欧阳世家; Kunlun settle 昆仑派.
const huFamilies = ['关外胡家'];
const ouyangFamilies = ['欧阳世家'];
const kunlunFamilies = ['昆仑派'];

export const b17SourcePaths = [
    'kungfu/skill/hua-quan.c', 'kungfu/skill/hua-quan/juan.c',
    'kungfu/skill/hujia-quan.c', 'kungfu/skill/hujia-quan/kuai.c',
    'kungfu/skill/chuncan-zhang.c', 'kungfu/skill/chuncan-zhang/jian.c',
    'kungfu/skill/sixiang-bufa.c', 'kungfu/skill/sixiang-bufa/fei.c',
    'kungfu/skill/mantian-xing.c', 'kungfu/skill/mantian-xing/shan.c',
    'kungfu/skill/mantian-xing/xing.c',
    'kungfu/skill/chuangwang-dao.c', 'kungfu/skill/chuangwang-dao/xiong.c',
    'kungfu/skill/baisheng-daofa.c', 'kungfu/skill/baisheng-daofa/heng.c',
    'kungfu/skill/lingshe-zhangfa.c', 'kungfu/skill/lingshe-zhangfa/qianshe.c',
    'kungfu/skill/lingshe-zhangfa/wanshi.c', 'kungfu/skill/lingshe-zhangfa/chan.c',
    'kungfu/skill/lingshe-quan.c', 'kungfu/skill/lingshe-quan/rou.c',
    'kungfu/skill/shedu-qiqiao.c', 'kungfu/skill/shedu-qiqiao/da.c',
    'kungfu/skill/shedu-qiqiao/liandu.c',
    'kungfu/skill/baibian-daxue.c', 'kungfu/skill/baibian-daxue/dian.c',
    'kungfu/skill/hamagong.c', 'kungfu/skill/hamagong/perform/zhen.c',
    'kungfu/skill/zhentian-quan.c', 'kungfu/skill/zhentian-quan/shi.c',
    'kungfu/skill/kunlun-qifa.c', 'kungfu/skill/kunlun-qifa/liu.c',
    'kungfu/skill/zhengliangyi-jian.c', 'kungfu/skill/zhengliangyi-jian/sui.c',
    'kungfu/skill/zhengliangyi-jian/wu.c',
    'kungfu/skill/sanyin-shou.c', 'kungfu/skill/sanyin-shou/sun.c',
    'kungfu/skill/qiankun-jian.c', 'kungfu/skill/qiankun-jian/riyue.c',
    'kungfu/skill/qiankun-jian/ni.c',
    'kungfu/skill/kunlun-zhang.c', 'kungfu/skill/kunlun-zhang/kong.c',
    'kungfu/skill/lengyue-shengong.c', 'kungfu/skill/hamagong.c',
    'kungfu/skill/baituo-xinfa.c', 'kungfu/skill/kunlun-xinfa.c',
    'kungfu/skill/liangyi-shengong.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c', 'kungfu/skill/staff.c',
    'kungfu/skill/strike.c', 'kungfu/skill/cuff.c', 'kungfu/skill/hand.c',
    'kungfu/skill/throwing.c', 'kungfu/skill/dodge.c',
    'kungfu/skill/force.c', 'kungfu/skill/parry.c',
    'kungfu/skill/training.c', 'kungfu/skill/poison.c',
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
export const b17ReviewedSourceHash = 'PENDING';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. All B17 moves gate on basic force except none that remap force.
const schools = {
    // ---- Hu exclusive 8 ----
    'hua-quan/juan': {
        skill: 'hua-quan', ability: 'juan', abilityPath: 'juan',
        usage: 'cuff', grant: 'can_perform/hua-quan/juan',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'cuff',
        families: huFamilies, actorFamily: '关外胡家',
        title: '西岳华拳「风卷霹雳上九天」', directType: 'UNARMED', percent: 45,
        // Hit check random(cuff) > dodge/2; hit -250, miss -80.
        feeHit: 250, feeMiss: 80,
        hitBusy: 2, missBusy: 3,
        targetBusyFormula: 'staff19-2', dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的西岳华拳不够娴熟，难以施展「风卷霹雳上九天」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「风卷霹雳上九天」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在真气不够，难以施展「风卷霹雳上九天」。\n' },
        ],
    },
    'hujia-quan/kuai': {
        skill: 'hujia-quan', ability: 'kuai', abilityPath: 'kuai',
        usage: 'cuff', grant: 'can_perform/hujia-quan/kuai',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'cuff',
        families: huFamilies, actorFamily: '关外胡家',
        title: '胡家拳法「奔拳快打」',
        // Unconditional -40; hit check random(combat_exp) > combat_exp/3.
        feeHit: 40, feeMiss: 40, unconditionalFee: true,
        meBusyHit: 0, meBusyMiss: 2,
        expHitCheck: true,
        targetBusyFormula: 'cuff25-2', dpSkills: [],
        targetBusyRefusal: true,
        gates: [
            { key: 'force', pair: [99, 100], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「奔拳快打」。\n' },
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的胡家拳法不够娴熟，难以施展「奔拳快打」。\n' },
            { key: 'neili', pair: [79, 80], field: 'neili',
                refusal: '你现在真气不够，难以施展「奔拳快打」。\n' },
        ],
    },
    'chuncan-zhang/jian': {
        skill: 'chuncan-zhang', ability: 'jian', abilityPath: 'jian',
        usage: 'strike', grant: 'can_perform/chuncan-zhang/jian',
        forceSkill: 'force', kind: 'buff', weapon: null, prepared: 'strike',
        families: huFamilies, actorFamily: '关外胡家',
        title: '春蚕掌法「作茧自缚」',
        // Unconditional -150; apply/attack -skill/4, apply/dodge +skill/3.
        fee: 150, buff: 'ccz_jian', buffApply: true,
        meBusy: 2,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的春蚕掌法不够娴熟，难以施展「作茧自缚」。\n' },
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「作茧自缚」。\n' },
            { key: 'max-neili', pair: [799, 800], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「作茧自缚」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「作茧自缚」。\n' },
        ],
    },
    'sixiang-bufa/fei': {
        skill: 'sixiang-bufa', ability: 'fei', abilityPath: 'fei',
        usage: 'dodge', grant: 'can_perform/sixiang-bufa/fei',
        forceSkill: 'force', kind: 'buff', weapon: null, prepared: null,
        families: huFamilies, actorFamily: '关外胡家',
        title: '四象步法「飞天神行」',
        // Unconditional -200; temp dex +skill/50.
        fee: 200, buff: 'fei_tian', tempStats: true,
        meBusy: 2,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的四象步法等级不够，难以施展「飞天神行」。\n' },
            { key: 'dex', pair: [32, 33], field: 'dex',
                refusal: '你的身法不够，难以施展「飞天神行」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「飞天神行」。\n' },
            { key: 'dodge', pair: [149, 150], field: 'skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，难以施展「飞天神行」。\n' },
            { key: 'max-neili', pair: [999, 1000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「飞天神行」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你此时的内力不足，难以施展「飞天神行」。\n' },
        ],
    },
    'mantian-xing/shan': {
        skill: 'mantian-xing', ability: 'shan', abilityPath: 'shan',
        usage: 'throwing', grant: 'can_perform/mantian-xing/shan',
        forceSkill: 'force', kind: 'throwing', weapon: null, prepared: null,
        families: huFamilies, actorFamily: '关外胡家',
        title: '满天星「星光闪烁」',
        // Consumes 3 throwing; fee 80; always busy 2; hit by exp+skill^3.
        handing: 'throwing', consumeAmount: 3,
        fee: 80, meBusy: 2,
        dpSkills: [],
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的满天星不够娴熟，难以施展「星光闪烁」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不足，难以施展「星光闪烁」。\n' },
        ],
    },
    'mantian-xing/xing': {
        skill: 'mantian-xing', ability: 'xing', abilityPath: 'xing',
        usage: 'throwing', grant: 'can_perform/mantian-xing/xing',
        forceSkill: 'force', kind: 'throwing', weapon: null, prepared: null,
        families: huFamilies, actorFamily: '关外胡家',
        title: '满天星「穹外飞星」',
        // Consumes 15 throwing; fee 100; busy 1-3 on hit, 3 on miss.
        handing: 'throwing', consumeAmount: 15,
        fee: 100, meBusy: 2, meBusyMin: 0, meBusyMax: 3,
        targetDebuff: true,
        dpSkills: [],
        targetBusyRefusal: true,
        targetBusyRefusalText: '对方已经中了你的绝招，现在是废人一个，赶快进攻吧！\n',
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的满天星不够娴熟，难以施展「穹外飞星」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不足，难以施展「穹外飞星」。\n' },
            { key: 'max-neili', pair: [1199, 1200], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「穹外飞星」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不足，难以施展「穹外飞星」。\n' },
        ],
    },
    'chuangwang-dao/xiong': {
        skill: 'chuangwang-dao', ability: 'xiong', abilityPath: 'xiong',
        usage: 'blade', grant: 'can_perform/chuangwang-dao/xiong',
        forceSkill: 'force', kind: 'direct', weapon: 'blade', prepared: null,
        families: huFamilies, actorFamily: '关外胡家',
        title: '闯王刀法「雄霸群山」', directType: 'WEAPON', percent: 25,
        // Hit check ap/2+random(ap)>dp where ap=blade+martial-cognize.
        feeHit: 30, feeMiss: 10,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [59, 60], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「雄霸群山」。\n' },
            { key: 'level', pair: [39, 40], field: 'skill',
                refusal: '你的闯王刀法还不到家，难以施展「雄霸群山」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你的真气不够，难以施展「雄霸群山」。\n' },
        ],
    },
    'baisheng-daofa/heng': {
        skill: 'baisheng-daofa', ability: 'heng', abilityPath: 'heng',
        usage: 'blade', grant: 'can_perform/baisheng-daofa/heng',
        forceSkill: 'force', kind: 'direct', weapon: 'blade', prepared: null,
        families: huFamilies, actorFamily: '关外胡家',
        title: '百胜刀法「横扫千军」', directType: 'WEAPON', percent: 50,
        // final callback may kill (ap/3>dp) or disarm (ap/2>dp).
        finalKillDisarm: true,
        feeHit: 350, feeMiss: 150,
        hitBusy: 3, missBusy: 4,
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你百胜刀法还不到家，难以施展「横扫千军」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「横扫千军」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不够，难以施展「横扫千军」。\n' },
        ],
    },
    // ---- Ouyang exclusive 8 ----
    'lingshe-zhangfa/qianshe': {
        skill: 'lingshe-zhangfa', ability: 'qianshe', abilityPath: 'qianshe',
        usage: 'staff', grant: 'can_perform/lingshe-zhangfa/qianshe',
        forceSkill: 'force', kind: 'combo', weapon: 'staff', prepared: null,
        families: ouyangFamilies, actorFamily: '欧阳世家',
        title: '灵蛇杖法「千蛇出洞」',
        // Unconditional -100; 5 do_attack; hit check lvl/2+random(lvl)>parry*2/3.
        fee: 100, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: ['attack'], comboHitAttackFromSkill: true,
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「千蛇出洞」！\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够，无法施展「千蛇出洞」！\n' },
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的灵蛇杖法还不到家，无法使用千蛇出洞！\n' },
        ],
    },
    'lingshe-zhangfa/wanshi': {
        skill: 'lingshe-zhangfa', ability: 'wanshi', abilityPath: 'wanshi',
        usage: 'staff', grant: 'can_perform/lingshe-zhangfa/wanshi',
        forceSkill: 'force', kind: 'direct', weapon: 'staff', prepared: null,
        families: ouyangFamilies, actorFamily: '欧阳世家',
        title: '灵蛇杖法「千蛇万噬」', directType: 'WEAPON', percent: 50,
        // final callback jing damage; snake_poison if lingshezhang.
        finalJingDrain: true,
        feeHit: 350, feeMiss: 100,
        hitBusy: 2, hitBusyMax: 5, missBusy: 2, missBusyMax: 5,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的灵蛇杖法不够娴熟，不会使用「千蛇万噬」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在真气不够，无法使用「千蛇万噬」。\n' },
        ],
    },
    'lingshe-zhangfa/chan': {
        skill: 'lingshe-zhangfa', ability: 'chan', abilityPath: 'chan',
        usage: 'staff', grant: null,
        forceSkill: 'force', kind: 'control', weapon: 'staff', prepared: null,
        families: ouyangFamilies, actorFamily: '欧阳世家',
        title: '灵蛇杖法「灵蛇缠身」',
        // No fee; hit check ap/2+random(ap)>dp where ap=staff, dp=dodge.
        // Hit gives target busy = staff_eff/19+2; miss gives self busy 2.
        feeHit: 0, feeMiss: 0,
        meBusyHit: 0, meBusyMiss: 2,
        targetBusyFormula: 'staff19-2', dpSkills: ['dodge'],
        gates: [
            { key: 'force', pair: [79, 80], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够！\n' },
            { key: 'staff-skill', pair: [79, 80], field: 'effective-skill', skillName: 'staff',
                refusal: '你的杖法还不到家，无法使用「灵蛇缠身」！\n' },
        ],
    },
    'lingshe-quan/rou': {
        skill: 'lingshe-quan', ability: 'rou', abilityPath: 'rou',
        usage: 'cuff', grant: null,
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: null,
        families: ouyangFamilies, actorFamily: '欧阳世家',
        title: '灵蛇拳法「柔字诀」', directType: 'UNARMED', percent: 50,
        // Hit check ap/2+random(ap)>dp where ap=cuff+training, dp=dodge.
        // Target busy 1 on hit before damage.
        secondaryTargetBusyFixed: 1,
        feeHit: 100, feeMiss: 50,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的灵蛇拳法不够娴熟，现在还无法使用「柔字诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，无法运用「柔字诀」。\n' },
        ],
    },
    'shedu-qiqiao/da': {
        skill: 'shedu-qiqiao', ability: 'da', abilityPath: 'da',
        usage: 'finger', grant: null,
        forceSkill: 'force', kind: 'special', weapon: null, prepared: null,
        families: ouyangFamilies, actorFamily: '欧阳世家',
        title: '蛇毒奇巧「打蛇七寸」',
        // Snake-only perform; non-snake target refused.
        snakeOnly: true,
        fee: 50, meBusy: 2,
        gates: [
            { key: 'level', pair: [19, 20], field: 'skill',
                refusal: '你的蛇毒奇巧还不够娴熟，不能打蛇。\n' },
            { key: 'force', pair: [29, 30], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，不能打蛇。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的内力不够了。\n' },
        ],
    },
    'shedu-qiqiao/liandu': {
        skill: 'shedu-qiqiao', ability: 'liandu', abilityPath: 'liandu',
        usage: 'finger', grant: null,
        forceSkill: 'force', kind: 'special', weapon: null, prepared: null,
        families: ouyangFamilies, actorFamily: '欧阳世家',
        title: '蛇毒奇巧「毒液练药」',
        // Non-combat utility; dead-snake-only.
        snakeOnly: true, nonCombat: true,
        fee: 50, meBusy: 2,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的蛇毒奇巧还不够娴熟，不能炼制毒药。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的内力不够！\n' },
        ],
    },
    'baibian-daxue/dian': {
        skill: 'baibian-daxue', ability: 'dian', abilityPath: 'dian',
        usage: 'staff', grant: null,
        forceSkill: 'force', kind: 'control', weapon: 'staff', prepared: null,
        families: ouyangFamilies, actorFamily: '欧阳世家',
        title: '百变打穴「点字诀」',
        // No fee; hit check ap/2+random(ap)>dp where ap=staff, dp=dodge.
        feeHit: 0, feeMiss: 0,
        meBusyHit: 0, meBusyMiss: 2,
        targetBusyFormula: 'staff27-2', dpSkills: ['dodge'],
        gates: [
            { key: 'force', pair: [99, 100], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够！\n' },
            { key: 'staff-skill', pair: [149, 150], field: 'effective-skill', skillName: 'staff',
                refusal: '你的杖法还不到家，无法使用「点字诀」！\n' },
        ],
    },
    'hamagong/zhen': {
        skill: 'hamagong', ability: 'zhen', abilityPath: 'perform/zhen',
        usage: 'strike', grant: null,
        forceSkill: 'force', kind: 'multi', weapon: null, prepared: 'strike',
        families: ouyangFamilies, actorFamily: '欧阳世家',
        title: '蛤蟆功「蟾震九天」', directType: 'UNARMED',
        multiDirects: 3,
        percentRanges: [[50, 55], [60, 65], [70, 80]],
        // Unconditional -400-random(400); three hit checks with rising threshold.
        fee: 400, feeMax: 799,
        hitBusyMin: 3, hitBusyMax: 6,
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [239, 240], field: 'skill',
                refusal: '你的蛤蟆功修为不够精深，不能使用「蟾震九天」！\n' },
            { key: 'max-neili', pair: [3999, 4000], field: 'max_neili',
                refusal: '你的内力修为不够深厚，无法施展「蟾震九天」！\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你的真气不够，无法运用「蟾震九天」！\n' },
            { key: 'strike-skill', pair: [199, 200], field: 'effective-skill', skillName: 'strike',
                refusal: '你的掌法不够娴熟，无法施展「蟾震九天」！\n' },
        ],
    },
    // ---- Kunlun exclusive 8 ----
    'zhentian-quan/shi': {
        skill: 'zhentian-quan', ability: 'shi', abilityPath: 'shi',
        usage: 'cuff', grant: 'can_perform/zhentian-quan/shi',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'cuff',
        families: kunlunFamilies, actorFamily: '昆仑派',
        title: '震天拳法「石破天惊」', directType: 'UNARMED', percent: 45,
        // Hit check random(cuff) > dodge/2; hit -150, miss -50.
        feeHit: 150, feeMiss: 50,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的震天拳法不够娴熟，难以施展「石破天惊」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「石破天惊」。\n' },
        ],
    },
    'kunlun-qifa/liu': {
        skill: 'kunlun-qifa', ability: 'liu', abilityPath: 'liu',
        usage: 'throwing', grant: 'can_perform/kunlun-qifa/liu',
        forceSkill: 'force', kind: 'throwing', weapon: null, prepared: null,
        families: kunlunFamilies, actorFamily: '昆仑派',
        title: '昆仑器法「流星电闪」',
        // Consumes all throwing (min 20); fee 100; always busy 2.
        handing: 'throwing', consumeAll: true,
        fee: 100, meBusy: 2,
        dpSkills: [],
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的昆仑器法尚不娴熟，难以施展「流星电闪」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「流星电闪」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你内力不够，难以施展「流星电闪」。\n' },
        ],
    },
    'zhengliangyi-jian/sui': {
        skill: 'zhengliangyi-jian', ability: 'sui', abilityPath: 'sui',
        usage: 'sword', grant: 'can_perform/zhengliangyi-jian/sui',
        forceSkill: 'force', kind: 'sacrifice', weapon: 'sword', prepared: null,
        families: kunlunFamilies, actorFamily: '昆仑派',
        title: '正两仪剑法「玉碎昆冈」', directType: 'WEAPON', percent: 150,
        // Always -50 max_neili; hit zeroes neili and may enter death branches.
        fee: 0,
        hitBusyMin: 6, missBusy: 8,
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的正两仪剑法不够娴熟，难以施展「玉碎昆冈」。\n' },
            { key: 'force', pair: [249, 250], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「玉碎昆冈」。\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「玉碎昆冈」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「玉碎昆冈」。\n' },
        ],
    },
    'zhengliangyi-jian/wu': {
        skill: 'zhengliangyi-jian', ability: 'wu', abilityPath: 'wu',
        usage: 'sword', grant: 'can_perform/zhengliangyi-jian/wu',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: null,
        families: kunlunFamilies, actorFamily: '昆仑派',
        title: '正两仪剑法「无声无色」', directType: 'WEAPON', percent: 30,
        // Unconditional -200; hit check ap/2+random(ap)>dp where ap=sword, dp=parry.
        feeHit: 200, feeMiss: 200, unconditionalFee: true,
        meBusy: 2,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的正两仪剑法不够娴熟，难以施展「无声无色」。\n' },
            { key: 'dodge', pair: [219, 220], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功火候不足，难以施展「无声无色」。\n' },
            { key: 'dex', pair: [44, 45], field: 'dex',
                refusal: '你现在身法太差，难以施展「无声无色」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，难以施展「无声无色」。\n' },
        ],
    },
    'sanyin-shou/sun': {
        skill: 'sanyin-shou', ability: 'sun', abilityPath: 'sun',
        usage: 'hand', grant: 'can_perform/sanyin-shou/sun',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'hand',
        families: kunlunFamilies, actorFamily: '昆仑派',
        title: '三阴手「损筋诀」', directType: 'REMOTE', percent: 0,
        // jing damage on hit; hit check ap/2+random(ap)>dp where ap=hand, dp=parry.
        jingDrain: true,
        feeHit: 200, feeMiss: 100,
        hitBusy: 2, missBusy: 4,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的三阴手等级不够，难以施展「损筋诀」。\n' },
            { key: 'max-neili', pair: [1599, 1600], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「损筋诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的内力不够，难以施展「损筋诀」。\n' },
        ],
    },
    'qiankun-jian/riyue': {
        skill: 'qiankun-jian', ability: 'riyue', abilityPath: 'riyue',
        usage: 'sword', grant: 'can_perform/qiankun-jian/riyue',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: null,
        families: kunlunFamilies, actorFamily: '昆仑派',
        title: '乾坤神剑「日月乾坤」',
        // attack_time = 4+random(ap/45) capped 6; fee = attack_time*20.
        feePerAttack: 20, comboAttacksMin: 4, comboAttacksMax: 6,
        comboBusyMin: 1, comboBusyMax: 6, applyKeys: ['attack'],
        comboHitAttackFromSkill: true,
        gates: [
            { key: 'force', pair: [219, 220], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「日月乾坤」。\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的乾坤神剑修为不够，难以施展「日月乾坤」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的真气不够，难以施展「日月乾坤」。\n' },
        ],
    },
    'qiankun-jian/ni': {
        skill: 'qiankun-jian', ability: 'ni', abilityPath: 'ni',
        usage: 'sword', grant: 'can_perform/qiankun-jian/ni',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: null,
        families: kunlunFamilies, actorFamily: '昆仑派',
        title: '乾坤神剑「逆转乾坤」', directType: 'WEAPON', percent: 120,
        // Hit check ap/2+random(ap)>dp where ap=sword+force+improve, dp=dodge+parry.
        feeHit: 200, feeMiss: 80,
        hitBusy: 2, missBusy: 4,
        dpSkills: ['dodge'],
        gates: [
            { key: 'force', pair: [299, 300], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「逆转乾坤」。\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的乾坤神剑修为不够，难以施展「逆转乾坤」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的真气不够，难以施展「逆转乾坤」。\n' },
        ],
    },
    'kunlun-zhang/kong': {
        skill: 'kunlun-zhang', ability: 'kong', abilityPath: 'kong',
        usage: 'strike', grant: 'can_perform/kunlun-zhang/kong',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: kunlunFamilies, actorFamily: '昆仑派',
        title: '昆仑掌法「日入空山」', directType: 'UNARMED', percent: 20,
        // Hit check ap/2+random(ap)>dp where ap=strike, dp=parry.
        // On hit: target busy ap/30+2, me busy 1.
        targetBusyFormula: 'strike30-2',
        feeHit: 150, feeMiss: 80,
        hitBusy: 1, missBusy: 3,
        dpSkills: ['parry'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你昆仑掌法等级不够，难以施展「日入空山」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「日入空山」。\n' },
        ],
    },
};

export const b17Schools = schools;

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

export function b17PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b17SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b17ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b17ReviewedSourceHash,
            'Reviewed B17 sources changed; re-review before sampling');
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
                ...(cfg.handing ? { equipment: { type: cfg.handing, hold: true, ...(cfg.consumeAmount ? { amount: Math.max(cfg.consumeAmount, 20) } : cfg.consumeAll ? { amount: 25 } : { amount: 10 }) } } : {}),
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
                id: `b17-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b17', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b17-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b17SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}独有：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + (cfg.kind === 'sacrifice'
                            ? '玉碎昆冈含内力碾压同归分支（先扣最大内力50，命中后清空真气并再损最大内力，死亡分支按原逻辑记账）。'
                            : cfg.snakeOnly
                                ? '蛇毒奇巧仅对蛇类目标生效，非蛇目标按原拒绝记账。'
                                : cfg.kind === 'multi'
                                    ? '蟾震九天三掌各自判定并分段记账，费用无条件扣除。'
                                    : cfg.kind === 'buff'
                                        ? '临时增益按原分支记账，已激活时拒绝。'
                                        : '目标忙乱与直伤与连击均按原分支记账。')
                        + '只收集数据，不比较强弱。',
                },
            });
        }
        // Snake-only performs only test refusal against non-snake targets.
        if (cfg.snakeOnly) {
            add('non-snake-refusal', {
                refusal: cfg.ability === 'da'
                    ? '看清楚些，那不是蛇，你瞎打什么？\n'
                    : '看清楚些，那不是蛇，你瞎搞什么？\n',
            });
            continue;
        }
        const primary = cfg.gates[0];
        add(`baseline-l${level}`, {
            ...(cfg.kind === 'throwing' ? { targetProperties: { combat_exp: 1 } } : {}),
            samples: smoke ? 2 : samples });
        for (const gate of cfg.gates.filter(g => g.key === primary.key)) {
            const [low, high] = gate.pair;
            add(`gate-${gate.key}-${low}`, { ...gateEdit(cfg, gate, low, true),
                refusal: gate.refusal, samples: 2 });
            add(`gate-${gate.key}-${high}`, { ...gateEdit(cfg, gate, high, false), samples: 2 });
        }
        if (cfg.kind === 'throwing') {
            add('hit', { targetProperties: { combat_exp: 1 }, samples: 4 });
            add('miss', { targetProperties: { combat_exp: 100000000000 }, samples: 4 });
        } else if (cfg.expHitCheck) {
            add('hit', { targetProperties: { combat_exp: 1 }, samples: 4 });
            add('miss', { targetProperties: { combat_exp: 100000000000 }, samples: 4 });
        } else if (cfg.dpSkills && cfg.dpSkills.length && cfg.kind !== 'combo'
            && cfg.kind !== 'buff' && cfg.kind !== 'sacrifice') {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        if (cfg.targetBusyRefusal)
            add('target-busy', cfg.targetDebuff
                ? { targetTemp: { feixing: 1 },
                    refusal: cfg.targetBusyRefusalText
                        ?? '右试弟子目前正自顾不暇，放胆攻击吧。\n' }
                : { targetBusy: true,
                    refusal: cfg.targetBusyRefusalText
                        ?? '右试弟子目前正自顾不暇，放胆攻击吧。\n' });
        if (cfg.buff) add('already-active', {
            actorTemp: { [cfg.buff]: 1 },
            refusal: cfg.ability === 'jian'
                ? '你已经运起「作茧自缚」了。\n'
                : '你已经运起「飞天神行」了。\n',
        });
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
    const effSkill = name => {
        const raw = num(sparse(b.skills, name));
        const mapped = b.mappings?.[name];
        return Math.trunc(raw / 2) + (mapped ? num(sparse(b.skills, mapped)) : 0);
    };
    switch (cfg.targetBusyFormula) {
        case 'cuff25-2': return Math.trunc(effSkill('cuff') / 25) + 2;
        case 'staff19-2': return Math.trunc(effSkill('staff') / 19) + 2;
        case 'staff27-2': return Math.trunc(effSkill('staff') / 27) + 2;
        case 'strike30-2': return Math.trunc(effSkill('strike') / 30) + 2;
        default: return 0;
    }
}

export function validateB17Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B17 entry');
    assert.equal(p.collection_group, 'b17-perform');
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
    if (cfg.kind === 'buff') return validateB17Buff(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB17Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB17Multi(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'throwing') return validateB17Throwing(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'sacrifice') return validateB17Sacrifice(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'special') return validateB17Special(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB17Direct(raw, condition, cfg, p, b, t, a, v);
    return validateB17Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB17Direct(raw, condition, cfg, p, b, t, a, v) {
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
        if (cfg.finalKillDisarm && (v.weapon === 'none' || v.weapon === undefined)) {
            // Disarm branch: target weapon removed.
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
        }
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB17Control(raw, condition, cfg, p, b, t, a, v) {
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

function validateB17Multi(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= cfg.multiDirects, 'multi direct bound');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
    }
    const fee = b.neili - a.neili;
    assert.ok(fee >= cfg.fee && fee <= (cfg.feeMax ?? cfg.fee), 'multi fee range');
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

function validateB17Throwing(raw, condition, cfg, p, b, t, a, v) {
    const fee = b.neili - a.neili;
    assert.equal(fee, cfg.fee, 'throwing fee');
    const busyAfter = num(a.busy);
    if (cfg.meBusyMin !== undefined) {
        assert.ok(busyAfter >= cfg.meBusyMin && busyAfter <= cfg.meBusyMax,
            'throwing busy range');
    } else {
        assert.equal(busyAfter, cfg.meBusy, 'fixed busy');
    }
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
        if (cfg.targetDebuff && v.temp) {
            e.temp = copy(v.temp);
            delete e.temp.notify_fail;
            if (e.temp.apply) {
                for (const k of Object.keys(e.temp.apply))
                    if (e.temp.apply[k] === 0) delete e.temp.apply[k];
            }
        }
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'throwing', hit };
}

function validateB17Buff(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'buff has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'buff fee');
    assert.equal(b.neili - a.neili, cfg.fee, 'buff fee deduction');
    assert.equal(num(a.busy ?? 0), p.fighting ? cfg.meBusy : 0);
    assert.equal(temp(a, cfg.buff), 1, 'buff flag set');
    if (cfg.tempStats) {
        const skill = num(sparse(b.skills, cfg.skill));
        const gain = Math.trunc(skill / 50);
        assert.equal(temp(a, 'dex') - temp(b, 'dex'), gain, 'temp dex gain');
    }
    if (cfg.buffApply) {
        const skill = num(sparse(b.skills, cfg.skill));
        const atkDelta = temp(a, 'apply/attack') - temp(b, 'apply/attack');
        const dodgeDelta = temp(a, 'apply/dodge') - temp(b, 'apply/dodge');
        assert.equal(atkDelta, -Math.trunc(skill / 4), 'apply/attack decrease');
        assert.equal(dodgeDelta, Math.trunc(skill / 3), 'apply/dodge increase');
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        if (cfg.tempStats) { e.temp.dex = a.temp.dex; }
        e.temp[cfg.buff] = a.temp[cfg.buff];
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'buff' };
}

function validateB17Sacrifice(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const death = raw.terminals.length > 0 || num(a.ghost) === 1 || num(v.ghost) === 1
        || num(v.living) === 0 || num(a.living) === 0;
    const ghostLoss = (num(a.ghost) ? 20 : 0);
    const maxLoss = num(b.max_neili) - num(a.max_neili) - ghostLoss;
    assert.ok(maxLoss >= 50 && maxLoss <= 99, 'sacrifice max_neili loss 50+random(50)');
    const miss = num(a.neili) === num(b.neili) && !death;
    if (miss) {
        assert.equal(maxLoss, 50, 'miss only pays the opening 50');
        assert.equal(num(a.busy), cfg.missBusy, 'miss busy');
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.max_neili = a.max_neili; e.busy = a.busy;
            e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v);
        return { accepted: true, kind: 'sacrifice', hit: false };
    }
    if (!death) assert.equal(num(a.busy), cfg.hitBusyMin, 'hit busy');
    assertLearnGain(a, p.skill);
    if (directs.length === 1) {
        assert.equal(directs[0].actor, 0); assert.equal(directs[0].target, 1);
        const input = num(directs[0].damage);
        const support = slice2SupportSet(input, cfg.percent, b, t, cfg.directType);
        assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
            'target resulting state must lie in modeled do_damage support');
    } else {
        assert.ok(death, 'zero directs on hit means a death branch');
    }
    stableState(b, a, e => {
        e.max_neili = a.max_neili; e.neili = a.neili; e.busy = a.busy;
        e.learned = a.learned; e.qi = a.qi; e.eff_qi = a.eff_qi;
        e.jing = a.jing; e.eff_jing = a.eff_jing;
        e.living = a.living; e.ghost = a.ghost;
        e.combat_exp = a.combat_exp;
        if (a.potential !== undefined) e.potential = a.potential;
        if (a.shen !== undefined) e.shen = a.shen;
        e.conditions = copy(a.conditions ?? null);
        e.mappings = copy(a.mappings ?? {});
        e.preparations = copy(a.preparations ?? {});
        e.skills = copy(a.skills ?? {});
        if (a.equipment === undefined) delete e.equipment;
        else e.equipment = copy(a.equipment);
        for (const k of ['weapon', 'weapon_damage', 'weapon_flag', 'handing', 'ammunition',
            'weapon_details', 'handing_details', 'secondary_weapon'])
            if (a[k] !== undefined) e[k] = copy(a[k]);
            else delete e[k];
        if (a.temp) {
            e.temp = copy(a.temp);
            delete e.temp.notify_fail;
            if (e.temp.apply) {
                for (const k of Object.keys(e.temp.apply))
                    if (e.temp.apply[k] === 0) delete e.temp.apply[k];
            }
        }
        if (e.weapon_details) e.weapon_details.consistence = 0;
        if (e.handing_details && Object.keys(e.handing_details).length)
            e.handing_details.consistence = 0;
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
    return { accepted: true, kind: 'sacrifice', hit: true, death };
}

function validateB17Special(raw, condition, cfg, p, b, t, a, v) {
    // snake-only and complex throwing are recorded as special; observed only
    // for non-snake refusal paths in this batch.
    assert.deepEqual(raw.launches, []);
    assert.equal(typeof raw.reason, 'string');
    assert.deepEqual(raw.refusals, [{ actor: b.object, reason: raw.reason }]);
    stableState(b, a);
    return { accepted: false, kind: 'special' };
}

function validateB17Combo(raw, condition, cfg, p, b, t, a, v) {
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

export function b17Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB17Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
