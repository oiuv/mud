// B21 Zhenyuan 4 + Shang 4 + Yunlong 4 + Emei 4 + Xueshan 4 perform batch (20 moves).
// Zhenyuan: bagua-biao xian/zhi, bagua-zhang ding, youshen-zhang fan.
// Shang: baisheng-quan kai, jinbiao-jue huan, quemen-jian can, tan-tui wang.
// Yunlong: yunlong-bian chan, yunlong-jian xian, ningxue-shenzhao ji, ningxue-zhang xue.
// Emei: emei-jian xian, huifeng-jian jue/mie, jieshou-jiushi jie.
// Xueshan: poxu-daxuefa tong, riyue-lun lian/po/yuan.
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

const zhenyuanFamilies = ['八卦门'];
const shangFamilies = ['商家堡'];
const yunlongFamilies = ['云龙门'];
const emeiFamilies = ['峨嵋派'];
const xueshanFamilies = ['大轮寺'];

export const b21SourcePaths = [
    'kungfu/skill/bagua-biao.c', 'kungfu/skill/bagua-biao/xian.c',
    'kungfu/skill/bagua-biao/zhi.c',
    'kungfu/skill/bagua-zhang.c', 'kungfu/skill/bagua-zhang/ding.c',
    'kungfu/skill/youshen-zhang.c', 'kungfu/skill/youshen-zhang/fan.c',
    'kungfu/skill/baisheng-quan.c', 'kungfu/skill/baisheng-quan/kai.c',
    'kungfu/skill/jinbiao-jue.c', 'kungfu/skill/jinbiao-jue/huan.c',
    'kungfu/skill/quemen-jian.c', 'kungfu/skill/quemen-jian/can.c',
    'kungfu/skill/tan-tui.c', 'kungfu/skill/tan-tui/wang.c',
    'kungfu/skill/yunlong-bian.c', 'kungfu/skill/yunlong-bian/chan.c',
    'kungfu/skill/yunlong-jian.c', 'kungfu/skill/yunlong-jian/xian.c',
    'kungfu/skill/ningxue-shenzhao.c', 'kungfu/skill/ningxue-shenzhao/ji.c',
    'kungfu/skill/ningxue-zhang.c', 'kungfu/skill/ningxue-zhang/xue.c',
    'kungfu/skill/emei-jian.c', 'kungfu/skill/emei-jian/xian.c',
    'kungfu/skill/huifeng-jian.c', 'kungfu/skill/huifeng-jian/jue.c',
    'kungfu/skill/huifeng-jian/mie.c',
    'kungfu/skill/jieshou-jiushi.c', 'kungfu/skill/jieshou-jiushi/jie.c',
    'kungfu/skill/poxu-daxuefa.c', 'kungfu/skill/poxu-daxuefa/tong.c',
    'kungfu/skill/riyue-lun.c', 'kungfu/skill/riyue-lun/lian.c',
    'kungfu/skill/riyue-lun/po.c', 'kungfu/skill/riyue-lun/yuan.c',
    'kungfu/skill/nei-bagua.c', 'kungfu/skill/wai-bagua.c',
    'kungfu/skill/shangjia-neigong.c',
    'kungfu/skill/yunlong-shengong.c', 'kungfu/skill/yunlong-xinfa.c',
    'kungfu/skill/emei-xinfa.c', 'kungfu/skill/mahayana.c',
    'kungfu/skill/longxiang-gong.c', 'kungfu/skill/xueshan-neigong.c',
    'kungfu/skill/poison.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c',
    'kungfu/skill/strike.c', 'kungfu/skill/hand.c',
    'kungfu/skill/cuff.c', 'kungfu/skill/staff.c',
    'kungfu/skill/whip.c', 'kungfu/skill/hammer.c',
    'kungfu/skill/claw.c', 'kungfu/skill/finger.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/throwing.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/force.c', 'kungfu/skill/parry.c',
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
export const b21ReviewedSourceHash = 'PENDING';

const schools = {
    // ---- Zhenyuan 4 ----
    'bagua-biao/xian': {
        skill: 'bagua-biao', ability: 'xian', abilityPath: 'xian',
        usage: 'throwing', grant: 'can_perform/bagua-biao/xian',
        forceSkill: 'nei-bagua', kind: 'direct', weapon: null,
        prepared: 'strike', preparedSkill: 'bagua-zhang',
        handing: 'throwing', consumeAmount: 1,
        families: zhenyuanFamilies, actorFamily: '八卦门',
        title: '镖中现掌',
        feeHit: 100, feeMiss: 0,
        hitBusy: 3, missBusy: 3, meBusy: 3,
        percent: 30, directType: 'UNARMED',
        extraSkills: { 'bagua-zhang': 300, 'bagua-biao': 300 },
        extraMappings: { strike: 'bagua-zhang', throwing: 'bagua-biao' },
        dpSkills: ['dodge', 'parry'],
        gates: [
            { key: 'zhang-level', pair: [119, 120], field: 'skill', skillName: 'bagua-zhang',
                refusal: '你的八卦掌不够娴熟，难以施展「镖中现掌」。\n' },
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的八卦镖诀不够娴熟，难以施展「镖中现掌」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「镖中现掌」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不足，难以施展「镖中现掌」。\n' },
        ],
    },
    'bagua-biao/zhi': {
        skill: 'bagua-biao', ability: 'zhi', abilityPath: 'zhi',
        usage: 'throwing', grant: 'can_perform/bagua-biao/zhi',
        forceSkill: 'nei-bagua', kind: 'throwing', weapon: null, prepared: null,
        handing: 'throwing', consumeAmount: 30, consumeAll: true,
        families: zhenyuanFamilies, actorFamily: '八卦门',
        title: '乾坤一掷',
        fee: 100, meBusy: 2,
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的八卦镖诀不够娴熟，难以施展「乾坤一掷」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「乾坤一掷」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不足，难以施展「乾坤一掷」。\n' },
        ],
    },
    'bagua-zhang/ding': {
        skill: 'bagua-zhang', ability: 'ding', abilityPath: 'ding',
        usage: 'strike', grant: 'can_perform/bagua-zhang/ding',
        forceSkill: 'nei-bagua', kind: 'direct', weapon: null, prepared: 'strike',
        families: zhenyuanFamilies, actorFamily: '八卦门',
        title: '背心钉',
        feeHit: 150, feeMiss: 50,
        hitBusy: 2, missBusy: 3,
        percent: 20, directType: 'UNARMED',
        dpSkills: ['dodge'],
        gates: [
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「背心钉」。\n' },
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的八卦掌不够娴熟，难以施展「背心钉」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，难以施展「背心钉」。\n' },
        ],
    },
    'youshen-zhang/fan': {
        skill: 'youshen-zhang', ability: 'fan', abilityPath: 'fan',
        usage: 'unarmed', grant: 'can_perform/youshen-zhang/fan',
        forceSkill: 'nei-bagua', kind: 'combo', weapon: null, prepared: 'unarmed',
        families: zhenyuanFamilies, actorFamily: '八卦门',
        title: '翻卦连环掌',
        fee: 150, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 6,
        applyKeys: [],
        gates: [
            { key: 'force', pair: [159, 160], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「翻卦连环掌」。\n' },
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的游身八卦掌不够娴熟，难以施展「翻卦连环掌」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，难以施展「翻卦连环掌」。\n' },
        ],
    },
    // ---- Shang 4 ----
    'baisheng-quan/kai': {
        skill: 'baisheng-quan', ability: 'kai', abilityPath: 'kai',
        usage: 'cuff', grant: 'can_perform/baisheng-quan/kai',
        forceSkill: 'shangjia-neigong', kind: 'direct', weapon: null, prepared: 'cuff',
        families: shangFamilies, actorFamily: '商家堡',
        title: '混沌初开',
        feeHit: 100, feeMiss: 60,
        hitBusy: 2, missBusy: 3,
        percent: 50, directType: 'UNARMED',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的百胜神拳不够娴熟，难以施展「混沌初开」。\n' },
            { key: 'force', pair: [139, 140], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「混沌初开」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「混沌初开」。\n' },
        ],
    },
    'jinbiao-jue/huan': {
        skill: 'jinbiao-jue', ability: 'huan', abilityPath: 'huan',
        usage: 'throwing', grant: 'can_perform/jinbiao-jue/huan',
        forceSkill: 'shangjia-neigong', kind: 'throwing', weapon: null, prepared: null,
        handing: 'throwing', consumeAmount: 1,
        families: shangFamilies, actorFamily: '商家堡',
        title: '金莲幻生',
        fee: 80, meBusy: 2,
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的金镖诀不够娴熟，难以施展「金莲幻生」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不足，难以施展「金莲幻生」。\n' },
        ],
    },
    'quemen-jian/can': {
        skill: 'quemen-jian', ability: 'can', abilityPath: 'can',
        usage: 'sword', grant: 'can_perform/quemen-jian/can',
        forceSkill: 'shangjia-neigong', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: shangFamilies, actorFamily: '商家堡',
        title: '天残剑诀',
        fee: 80, comboAttacks: 4, comboBusyMin: 1, comboBusyMax: 4,
        applyKeys: [],
        gates: [
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「天残剑诀」。\n' },
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你缺门剑法不够娴熟，难以施展「天残剑诀」。\n' },
            { key: 'max-neili', pair: [799, 800], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「天残剑诀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，难以施展「天残剑诀」。\n' },
        ],
    },
    'tan-tui/wang': {
        skill: 'tan-tui', ability: 'wang', abilityPath: 'wang',
        usage: 'unarmed', grant: 'can_perform/tan-tui/wang',
        forceSkill: 'shangjia-neigong', kind: 'direct', weapon: null, prepared: 'unarmed',
        families: shangFamilies, actorFamily: '商家堡',
        title: '犀牛望月转回还',
        feeHit: 150, feeMiss: 50,
        hitBusy: 3, missBusy: 4,
        percent: 35, directType: 'UNARMED',
        dpSkills: ['force'],
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「犀牛望月转回还」。\n' },
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的十二路潭腿不够娴熟，难以施展「犀牛望月转回还」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，难以施展「犀牛望月转回还」。\n' },
        ],
    },
    // ---- Yunlong 4 ----
    'yunlong-bian/chan': {
        skill: 'yunlong-bian', ability: 'chan', abilityPath: 'chan',
        usage: 'whip', grant: 'can_perform/yunlong-bian/chan',
        forceSkill: 'yunlong-shengong', kind: 'control', weapon: 'whip', prepared: null,
        families: yunlongFamilies, actorFamily: '云龙门',
        title: '缠字诀',
        fee: 30,
        hitBusy: 2, missBusy: 2, meBusy: 2,
        targetBusyFormula: 'whip22-1', targetBusyRefusal: true,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [49, 50], field: 'skill',
                refusal: '你云龙鞭法火候太浅，难以施展「缠字诀」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你现在的真气不足，难以施展「缠字诀」。\n' },
        ],
    },
    'yunlong-jian/xian': {
        skill: 'yunlong-jian', ability: 'xian', abilityPath: 'xian',
        usage: 'sword', grant: null, forceSkill: 'yunlong-shengong',
        kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: yunlongFamilies, actorFamily: '云龙门',
        title: '云龙三现',
        feeHit: 180, feeMiss: 100,
        hitBusy: 2, missBusy: 4,
        percent: 30, directType: 'WEAPON',
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [49, 50], field: 'skill',
                refusal: '你的云龙剑法不够娴熟，不会使用「云龙三现」！\n' },
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，不能使用「云龙三现」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，不能使用「云龙三现」！\n' },
        ],
    },
    'ningxue-shenzhao/ji': {
        skill: 'ningxue-shenzhao', ability: 'ji', abilityPath: 'ji',
        usage: 'claw', grant: 'can_perform/ningxue-shenzhao/ji',
        forceSkill: 'yunlong-shengong', kind: 'combo', weapon: null, prepared: 'claw',
        families: yunlongFamilies, actorFamily: '云龙门',
        title: '疾电',
        fee: 300, comboAttacks: 7, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [249, 250], field: 'skill',
                refusal: '你的凝血神爪修为有限，无法使用「疾电」！\n' },
            { key: 'force', pair: [349, 350], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「疾电」！\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为没有达到那个境界，无法运转内力形成「疾电」！\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，现在无法施展「疾电」！\n' },
        ],
    },
    'ningxue-zhang/xue': {
        skill: 'ningxue-zhang', ability: 'xue', abilityPath: 'xue',
        usage: 'staff', grant: 'can_perform/ningxue-zhang/xue',
        forceSkill: 'yunlong-shengong', kind: 'combo', weapon: 'staff', prepared: null,
        families: yunlongFamilies, actorFamily: '云龙门',
        title: '缤纷雪舞',
        feeMin: 80, feeMax: 120, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 6,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [49, 50], field: 'skill',
                refusal: '你的凝雪杖法不够娴熟，难以施展「缤纷雪舞」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你目前的真气不够，难以施展「缤纷雪舞」。\n' },
        ],
    },
    // ---- Emei 4 ----
    'emei-jian/xian': {
        skill: 'emei-jian', ability: 'xian', abilityPath: 'xian',
        usage: 'sword', grant: 'can_perform/emei-jian/xian',
        forceSkill: 'emei-xinfa', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: emeiFamilies, actorFamily: '峨嵋派',
        title: '佛光初现',
        feeHit: 75, feeMiss: 75, unconditionalFee: true,
        hitBusy: 3, missBusy: 3, meBusy: 3,
        percent: 40, directType: 'WEAPON',
        extraSkills: { mahayana: 200 },
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的峨嵋剑法不够娴熟，无法施展「佛光初现」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，无法施展「佛光初现」。\n' },
        ],
    },
    'huifeng-jian/jue': {
        skill: 'huifeng-jian', ability: 'jue', abilityPath: 'jue',
        usage: 'sword', grant: 'can_perform/huifeng-jian/jue',
        forceSkill: 'emei-xinfa', kind: 'multi', weapon: 'sword', prepared: 'sword',
        families: emeiFamilies, actorFamily: '峨嵋派',
        title: '绝剑',
        feeMin: 400, feeMax: 499,
        multiDirects: 5,
        percentRanges: [[10, 10], [10, 10], [15, 15], [20, 20], [20, 20]],
        hitBusyMin: 2, hitBusyMax: 6,
        dpSkills: ['parry', 'dodge', 'force'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你回风拂柳剑法不够娴熟，无法施展「绝剑」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你内功火候不够，无法施展「绝剑」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在真气不够，无法施展「绝剑」。\n' },
        ],
    },
    'huifeng-jian/mie': {
        skill: 'huifeng-jian', ability: 'mie', abilityPath: 'mie',
        usage: 'sword', grant: 'can_perform/huifeng-jian/mie',
        forceSkill: 'emei-xinfa', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: emeiFamilies, actorFamily: '峨嵋派',
        title: '灭剑',
        feeHit: 150, feeMiss: 60,
        hitBusy: 2, missBusy: 3,
        percent: 80, directType: 'WEAPON',
        dualHitCheck: true,
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的回风拂柳剑法不够娴熟，无法施展「灭剑」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，无法施展「灭剑」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在真气不够，无法施展「灭剑」。\n' },
        ],
    },
    'jieshou-jiushi/jie': {
        skill: 'jieshou-jiushi', ability: 'jie', abilityPath: 'jie',
        usage: 'hand', grant: 'can_perform/jieshou-jiushi/jie',
        forceSkill: 'emei-xinfa', kind: 'special', specialBusy: 'jie',
        weapon: null, prepared: 'hand',
        families: emeiFamilies, actorFamily: '峨嵋派',
        title: '截筋断脉',
        feeHit: 200, feeMiss: 100,
        hitBusy: 3, missBusy: 4,
        percent: 10, directType: 'REMOTE',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的截手九式等级不够，难以施展「截筋断脉」。\n' },
            { key: 'max-neili', pair: [799, 800], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「截筋断脉」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的内力不够，难以施展「截筋断脉」。\n' },
        ],
    },
    // ---- Xueshan 4 ----
    'poxu-daxuefa/tong': {
        skill: 'poxu-daxuefa', ability: 'tong', abilityPath: 'tong',
        usage: 'finger', grant: 'can_perform/poxu-daxuefa/tong',
        forceSkill: 'longxiang-gong', kind: 'special', specialBusy: 'tong',
        weapon: null, prepared: 'finger',
        families: xueshanFamilies, actorFamily: '大轮寺',
        title: '破元通虚',
        feeHit: 100, feeMiss: 50,
        hitBusy: 3, missBusy: 4,
        percent: 50, directType: 'REMOTE',
        dpSkills: ['force'],
        targetNoExertRefusal: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你破虚打穴法等级不够，无法施展「破元通虚」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，无法施展「破元通虚」。\n' },
        ],
    },
    'riyue-lun/lian': {
        skill: 'riyue-lun', ability: 'lian', abilityPath: 'lian',
        usage: 'hammer', grant: 'can_perform/riyue-lun/lian',
        forceSkill: 'longxiang-gong', kind: 'combo', weapon: 'hammer', prepared: null,
        families: xueshanFamilies, actorFamily: '大轮寺',
        title: '五轮连转',
        fee: 250, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: ['attack', 'damage'],
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你日月轮法火候不足，难以施展「五轮连转」。\n' },
            { key: 'force', pair: [249, 250], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「五轮连转」。\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「五轮连转」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「五轮连转」。\n' },
        ],
    },
    'riyue-lun/po': {
        skill: 'riyue-lun', ability: 'po', abilityPath: 'po',
        usage: 'hammer', grant: 'can_perform/riyue-lun/po',
        forceSkill: 'longxiang-gong', kind: 'direct', weapon: 'hammer', prepared: null,
        families: xueshanFamilies, actorFamily: '大轮寺',
        title: '破立势',
        feeHit: 300, feeMiss: 150,
        hitBusy: 3, missBusy: 2,
        percent: 50, directType: 'WEAPON',
        extraSkills: { 'longxiang-gong': 300 },
        dpSkills: ['force'],
        targetYuanManRefusal: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的日月轮法火候不足，难以施展「破立势」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「破立势」。\n' },
            { key: 'max-neili', pair: [1499, 1500], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「破立势」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「破立势」。\n' },
        ],
    },
    'riyue-lun/yuan': {
        skill: 'riyue-lun', ability: 'yuan', abilityPath: 'yuan',
        usage: 'hammer', grant: 'can_perform/riyue-lun/yuan',
        forceSkill: 'longxiang-gong', kind: 'buff', weapon: 'hammer', prepared: null,
        families: xueshanFamilies, actorFamily: '大轮寺',
        title: '圆满势',
        fee: 200, meBusy: 2,
        buff: 'yuan_man', buffApply: true, buffApplyKeys: ['apply/parry'],
        buffApplyDivisor: 3,
        alreadyActiveCap: 1,
        extraSkills: { 'longxiang-gong': 300 },
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的日月轮法火候不足，难以施展「圆满势」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「圆满势」。\n' },
            { key: 'max-neili', pair: [1499, 1500], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「圆满势」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「圆满势」。\n' },
        ],
    },
};

export const b21Schools = schools;

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
            if (name === 'force' && cfg.forceSkill && cfg.forceSkill !== 'force')
                return { skills: { force: 0, [cfg.forceSkill]: value } };
            return { skills: { [name]: isLow ? value * 2 : (value + 1) * 2 } };
        }
        default: return { skills: { [gate.field]: value } };
    }
};

export function b21PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b21SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b21ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b21ReviewedSourceHash,
            'Reviewed B21 sources changed; re-review before sampling');
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
            if (cfg.shenGate !== undefined) properties.shen = Math.max(properties.shen, cfg.shenGate + 1);
            for (const [k, v] of Object.entries(floor.properties))
                properties[k] = Math.max(properties[k] ?? 0, v);
            Object.assign(properties, extra.properties);
            const actor = {
                skills,
                mappings: { ...(cfg.forceSkill && cfg.forceSkill !== 'force'
                    ? { force: cfg.forceSkill } : {}),
                [cfg.usage]: cfg.skill,
                    ...(cfg.extraMappings ?? {}), ...extra.mappings },
                preparations: extra.preparations ?? (cfg.prepared
                    ? { [cfg.prepared]: cfg.preparedSkill ?? cfg.skill } : {}),
                properties,
                ...(cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}),
                ...(cfg.handing ? { equipment: { type: cfg.handing, hold: true, ...(cfg.consumeAmount ? { amount: Math.max(cfg.consumeAmount, 20) } : cfg.consumeAll ? { amount: 25 } : { amount: 10 }), ...(cfg.handingPoison ? { poison: {} } : {}) } } : {}),
            };
            if ('actorEquipment' in extra) {
                if (extra.actorEquipment) actor.equipment = extra.actorEquipment;
                else delete actor.equipment;
            }
            if (cfg.requirePowerup) actor.temp = { ...(actor.temp ?? {}), powerup: 1 };
            const targetTemp = extra.targetTemp ?? cfg.targetTemp;
            const targetEquipment = 'targetEquipment' in extra ? extra.targetEquipment
                : cfg.targetUnarmed ? null : { type: 'sword', hold: false };
            const target = {
                skills: { force: 200, dodge: 200, parry: 200, sword: 200, medical: 200,
                    ...extra.targetSkills },
                mappings: {}, preparations: {},
                properties: { ...defaults, shen: 0,
                    ...(cfg.targetMaxNeili ? { max_neili: cfg.targetMaxNeili } : {}),
                    ...extra.targetProperties },
                ...(targetEquipment ? { equipment: targetEquipment } : {}),
                ...(targetTemp ? { temp: targetTemp } : {}),
                ...(extra.targetBusy ? { busy: 2 } : {}),
            };
            if (extra.actorTemp) actor.temp = { ...(actor.temp ?? {}), ...extra.actorTemp };
            if (extra.conditions) actor.conditions = extra.conditions;
            if (extra.targetConditions) target.conditions = extra.targetConditions;
            result.push({
                id: `b21-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b21', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b21-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b21SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}独有：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + (cfg.kind === 'buff'
                            ? '临时增益按原分支记账，已激活时拒绝。'
                            : cfg.kind === 'special'
                                ? '特殊分支按原逻辑记账。'
                                : cfg.kind === 'throwing'
                                    ? '暗器消耗按原分支记账。'
                                    : cfg.kind === 'multi'
                                        ? '多段直伤按原分支记账。'
                                        : '目标忙乱与直伤与连击均按原分支记账。')
                        + '只收集数据，不比较强弱。',
                },
            });
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
        if (cfg.expHitCheck) {
            add('hit', { targetProperties: { combat_exp: 1 }, samples: 4 });
            add('miss', { targetProperties: { combat_exp: 100000000000 }, samples: 4 });
        } else if (cfg.dpSkills && cfg.dpSkills.length && cfg.kind !== 'combo'
            && cfg.kind !== 'buff' && cfg.kind !== 'special') {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        } else if (cfg.kind === 'special' && cfg.dpSkills && cfg.dpSkills.length) {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        if (cfg.targetBusyRefusal)
            add('target-busy', {
                targetBusy: true,
                refusal: cfg.targetBusyRefusalText
                    ?? '右试弟子目前正自顾不暇，放胆攻击吧。\n',
            });
        if (cfg.targetNoExertRefusal)
            add('target-no-exert', {
                targetTemp: { no_exert: 1 },
                refusal: '对方现在已经无法控制真气，放胆攻击吧。\n',
            });
        if (cfg.targetYuanManRefusal)
            add('yuan-man-active', {
                actorTemp: { yuan_man: 1 },
                refusal: '你现在无暇施展「破立势」。\n',
            });
        if (cfg.kind === 'buff' && cfg.alreadyActiveCap !== undefined && cfg.alreadyActiveCap > 0)
            add('already-active', {
                actorTemp: { [cfg.buff]: cfg.alreadyActiveCap },
                refusal: '你现在正在施展「圆满势」。\n',
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
        case 'whip22-1': return Math.trunc(effSkill('whip') / 22) + 1;
        case 'staff25-2': return Math.trunc(effSkill('staff') / 25) + 2;
        case 'blade27-2': return Math.trunc(effSkill('blade') / 27) + 2;
        default: return 0;
    }
}

export function validateB21Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B21 entry');
    assert.equal(p.collection_group, 'b21-perform');
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
        for (const k of health)
            assert.equal(sparse(raw.metrics[side], k + '_recovery'), 0, k);
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
    if (cfg.kind === 'control') return validateB21Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'special') return validateB21Special(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB21Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'buff') return validateB21Buff(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'throwing') return validateB21Throwing(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB21Multi(raw, condition, cfg, p, b, t, a, v);
    return validateB21Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB21Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const miss = directs.length === 0 && sparse(raw.metrics[0], 'direct') === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    const directCount = sparse(raw.metrics[0], 'direct');
    assert.ok(directCount >= 0, 'direct count');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const paid = b.neili - a.neili;
    let fee;
    if (cfg.unconditionalFee) fee = cfg.feeHit ?? 0;
    else if (miss) fee = (cfg.feeAlways ?? 0) + (cfg.feeMiss ?? 0);
    else fee = (cfg.feeAlways ?? 0) + (cfg.feeHit ?? 0);
    assert.equal(paid, fee, 'branch fee');
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
            if (cfg.selfWound) { e.qi = a.qi; e.eff_qi = a.eff_qi; }
            allowDerived(e, a);
        }, { consumeThrowing: Boolean(cfg.handing) });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    let input;
    if (directs.length === 1) {
        assert.equal(directs[0].actor, 0); assert.equal(directs[0].target, 1);
        input = num(directs[0].damage);
        assert.ok(input > 0, 'positive damage input');
        const support = cfg.percent
            ? supportRange(input, cfg.percent, b, t, cfg.directType)
            : slice2SupportSet(input, 100, b, t, cfg.directType);
        assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
            'hit must match do_damage support');
    } else {
        input = num(t.qi) - num(v.qi);
        assert.ok(input > 0, 'qi drop without directs');
    }
    assertLearnGain(a, p.skill);
    const spent = b.neili - a.neili;
    stableState(b, a, e => {
        e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
        if (cfg.selfWound) { e.qi = a.qi; e.eff_qi = a.eff_qi; }
        allowDerived(e, a);
    }, { consumeThrowing: Boolean(cfg.handing) });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB21Control(raw, condition, cfg, p, b, t, a, v) {
    const fee = b.neili - a.neili;
    const busyAfter = num(a.busy);
    const hit = num(v.busy) > 0;
    if (cfg.meBusy !== undefined) assert.equal(busyAfter, cfg.meBusy, 'control me busy');
    else {
        const busyMin = hit ? (cfg.hitBusyMin ?? cfg.hitBusy ?? 0) : (cfg.missBusyMin ?? cfg.missBusy ?? 0);
        const busyMax = hit ? (cfg.hitBusyMax ?? cfg.hitBusy ?? 0) : (cfg.missBusyMax ?? cfg.missBusy ?? 0);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'control busy range');
    }
    if (cfg.targetBusyFormula && hit) {
        assert.equal(num(v.busy), targetBusyFor(cfg, b, hit), 'target busy formula');
    }
    assert.equal(fee, hit ? (cfg.feeHit ?? cfg.fee ?? 0) : (cfg.feeMiss ?? cfg.fee ?? 0), 'control fee');
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

function validateB21Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    if (cfg.feeMin !== undefined)
        assert.ok(fee >= cfg.feeMin && fee <= (cfg.feeMax ?? cfg.feeMin), 'combo fee range');
    else assert.ok(fee >= (cfg.fee ?? 0), 'combo fee floor');
    const maxAttacks = cfg.comboAttacksMax ?? cfg.comboAttacks ?? 8;
    assert.ok(attacks.length >= 1 && attacks.length <= maxAttacks, 'combo attack count');
    assert.ok(num(a.busy) >= cfg.comboBusyMin && num(a.busy) <= cfg.comboBusyMax, 'combo busy range');
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

function validateB21Buff(raw, condition, cfg, p, b, t, a, v) {
    const cost = cfg.fee < 0
        ? -sparse(raw.metrics[0], 'neili_recovery')
        : sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'buff has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'buff fee');
    assert.equal(b.neili - a.neili, cfg.fee, 'buff fee deduction');
    assert.equal(num(a.busy ?? 0), p.fighting ? cfg.meBusy : 0);
    assert.equal(temp(a, cfg.buff), temp(b, cfg.buff) + 1, 'buff incremented');
    if (cfg.buffApply) {
        const level = sparse(b.skills, cfg.skill);
        const delta = cfg.buffApplyDelta ?? Math.trunc(level / (cfg.buffApplyDivisor ?? 30));
        for (const key of cfg.buffApplyKeys ?? ['attack']) {
            const before = temp(b, key);
            const after = temp(a, key);
            assert.equal(after - before, delta, key + ' delta');
        }
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        if (cfg.fee < 0 && key === 'neili') continue;
        else assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        e.temp[cfg.buff] = a.temp[cfg.buff];
        if (cfg.buffApply) {
            for (const key of cfg.buffApplyKeys ?? ['attack']) {
                if (key.includes('/')) {
                    const parts = key.split('/');
                    let node = e.temp;
                    for (const p2 of parts.slice(0, -1)) node = node[p2] ??= {};
                    node[parts.at(-1)] = a.temp?.[parts[0]]?.[parts.at(-1)];
                } else {
                    e.temp[key] = a.temp?.[key];
                }
            }
        }
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'buff' };
}

function validateB21Throwing(raw, condition, cfg, p, b, t, a, v) {
    const fee = b.neili - a.neili;
    assert.equal(fee, cfg.fee, 'throwing fee');
    const hit = num(v.qi) !== num(t.qi) || num(v.eff_qi) !== num(t.eff_qi);
    const busyAfter = num(a.busy);
    if (cfg.meBusyMin !== undefined) {
        assert.ok(busyAfter >= cfg.meBusyMin && busyAfter <= cfg.meBusyMax,
            'throwing busy range');
    } else if (cfg.meBusy !== undefined) {
        assert.equal(busyAfter, cfg.meBusy, 'fixed busy');
    } else {
        const busyMin = hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
        const busyMax = hit ? (cfg.hitBusyMax ?? cfg.hitBusy) : (cfg.missBusyMax ?? cfg.missBusy);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'throwing busy branch range');
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    }, { consumeThrowing: Boolean(cfg.handing) });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'throwing', hit };
}

function validateB21Multi(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= cfg.multiDirects, 'multi direct bound');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
    }
    const fee = b.neili - a.neili;
    if (cfg.feeMin !== undefined)
        assert.ok(fee >= cfg.feeMin && fee <= (cfg.feeMax ?? cfg.feeMin), 'multi fee range');
    else assert.ok(fee >= cfg.fee && fee <= (cfg.feeMax ?? cfg.fee), 'multi fee range');
    assert.ok(sparse(raw.metrics[0], 'direct') >= 0, 'direct count');
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

function validateB21Special(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const fee = b.neili - a.neili;
    if (cfg.specialBusy === 'tong') {
        // Direct + no_exert final: hit applies do_damage then sets no_exert on target.
        const hit = directs.length === 1 || num(v.qi) !== num(t.qi);
        const expectedFee = hit ? (cfg.feeHit ?? 100) : (cfg.feeMiss ?? 50);
        assert.equal(fee, expectedFee, 'tong fee');
        const busyAfter = num(a.busy);
        const busyMin = hit ? (cfg.hitBusyMin ?? cfg.hitBusy ?? 0) : (cfg.missBusyMin ?? cfg.missBusy ?? 0);
        const busyMax = hit ? (cfg.hitBusyMax ?? cfg.hitBusy ?? 0) : (cfg.missBusyMax ?? cfg.missBusy ?? 0);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'tong busy');
        assertLearnGain(a, p.skill);
        if (directs.length === 1) {
            const input = num(directs[0].damage);
            const support = supportRange(input, cfg.percent, b, t, cfg.directType);
            assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
                'tong direct must match do_damage support');
        }
        if (hit) assert.equal(temp(v, 'no_exert'), 1, 'no_exert set on hit');
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili;
            e.temp = copy(v.temp ?? {});
            e.conditions = copy(v.conditions ?? null);
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'special', hit };
    }
    if (cfg.specialBusy === 'jie') {
        // Hybrid: do_damage REMOTE + receive jing/qi + target busy 1 on hit.
        const hit = directs.length === 1 || num(v.qi) !== num(t.qi);
        const expectedFee = hit ? (cfg.feeHit ?? 200) : (cfg.feeMiss ?? 100);
        assert.equal(fee, expectedFee, 'jie fee');
        const busyAfter = num(a.busy);
        const busyMin = hit ? (cfg.hitBusyMin ?? cfg.hitBusy ?? 0) : (cfg.missBusyMin ?? cfg.missBusy ?? 0);
        const busyMax = hit ? (cfg.hitBusyMax ?? cfg.hitBusy ?? 0) : (cfg.missBusyMax ?? cfg.missBusy ?? 0);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'jie busy');
        assertLearnGain(a, p.skill);
        if (directs.length === 1) {
            const input = num(directs[0].damage);
            const support = supportRange(input, cfg.percent, b, t, cfg.directType);
            assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
                'jie direct must match do_damage support');
        }
        if (hit) {
            assert.ok(num(v.jing) <= num(t.jing), 'jing damaged on hit');
            assert.equal(num(v.busy), 1, 'target busy 1 on hit');
        }
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
        return { accepted: true, kind: 'special', hit };
    }
    assert.fail('unknown special branch ' + cfg.specialBusy);
}

export function b21Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB21Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
