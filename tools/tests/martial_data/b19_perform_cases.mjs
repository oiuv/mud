// B19 Wudang-exclusive 7 + Tianlongsi 6 + Xiake-exclusive 5 + ultra 5
// perform batch (23 moves).
// Wudang: zhenshan-zhang da, wudang-jian sheng, yitian-zhang zheng,
// shenmen-jian ci, xuanxu-dao huan, raozhi-roujian chuan (grant chuankong),
// huzhua-shou juehu.
// Tianlongsi: huoyan-dao fen/yan, sun-finger dian, liumai-shenjian qi/six/zong.
// Xiake: taixuan-gong perform hun/jing/po/xuan, jinwu-daofa chi.
// Ultra: never-defeated perform lei/po/tianhua/wanli/yuce.
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

const wudangFamilies = ['武当派'];
const tianlongFamilies = ['大理段家'];
const xiakeFamilies = ['侠客岛'];
const ultraFamilies = ['侠客盟'];

export const b19SourcePaths = [
    'kungfu/skill/zhenshan-zhang.c', 'kungfu/skill/zhenshan-zhang/da.c',
    'kungfu/skill/wudang-jian.c', 'kungfu/skill/wudang-jian/sheng.c',
    'kungfu/skill/yitian-zhang.c', 'kungfu/skill/yitian-zhang/zheng.c',
    'kungfu/skill/shenmen-jian.c', 'kungfu/skill/shenmen-jian/ci.c',
    'kungfu/skill/xuanxu-dao.c', 'kungfu/skill/xuanxu-dao/huan.c',
    'kungfu/skill/raozhi-roujian.c', 'kungfu/skill/raozhi-roujian/chuan.c',
    'kungfu/skill/huzhua-shou.c', 'kungfu/skill/huzhua-shou/juehu.c',
    'kungfu/skill/huoyan-dao.c', 'kungfu/skill/huoyan-dao/fen.c',
    'kungfu/skill/huoyan-dao/yan.c',
    'kungfu/skill/sun-finger.c', 'kungfu/skill/sun-finger/dian.c',
    'kungfu/skill/liumai-shenjian.c', 'kungfu/skill/liumai-shenjian/qi.c',
    'kungfu/skill/liumai-shenjian/six.c', 'kungfu/skill/liumai-shenjian/zong.c',
    'kungfu/skill/taixuan-gong.c',
    'kungfu/skill/taixuan-gong/perform/hun.c',
    'kungfu/skill/taixuan-gong/perform/jing.c',
    'kungfu/skill/taixuan-gong/perform/po.c',
    'kungfu/skill/taixuan-gong/perform/xuan.c',
    'kungfu/skill/jinwu-daofa.c', 'kungfu/skill/jinwu-daofa/chi.c',
    'kungfu/skill/never-defeated.c',
    'kungfu/skill/never-defeated/perform/lei.c',
    'kungfu/skill/never-defeated/perform/po.c',
    'kungfu/skill/never-defeated/perform/tianhua.c',
    'kungfu/skill/never-defeated/perform/wanli.c',
    'kungfu/skill/never-defeated/perform/yuce.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c',
    'kungfu/skill/strike.c', 'kungfu/skill/claw.c',
    'kungfu/skill/finger.c', 'kungfu/skill/throwing.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/force.c', 'kungfu/skill/parry.c',
    'kungfu/skill/martial-cognize.c', 'kungfu/skill/jingluo-xue.c',
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
export const b19ReviewedSourceHash = 'PENDING';

const schools = {
    // ---- Wudang exclusive 7 ----
    'zhenshan-zhang/da': {
        skill: 'zhenshan-zhang', ability: 'da', abilityPath: 'da',
        usage: 'strike', grant: 'can_perform/zhenshan-zhang/da',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: wudangFamilies, actorFamily: '武当派',
        title: '隔山打牛',
        fee: 30, feeHit: 30, feeMiss: 30, unconditionalFee: true,
        meBusy: 3, percent: 30, directType: 'UNARMED',
        targetBusyOnHit: 'random3', targetBusyOptional: true,
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [39, 40], field: 'skill',
                refusal: '你的震山掌不够娴熟，难以施展「隔山打牛」。\n' },
            { key: 'max-neili', pair: [199, 200], field: 'max_neili',
                refusal: '你的内功修为不足，难以施展「隔山打牛」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你现在真气太弱，难以施展「隔山打牛」。\n' },
        ],
    },
    'wudang-jian/sheng': {
        skill: 'wudang-jian', ability: 'sheng', abilityPath: 'sheng',
        usage: 'sword', grant: 'can_perform/wudang-jian/sheng',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: wudangFamilies, actorFamily: '武当派',
        title: '太极初升',
        feeHit: 30, feeMiss: 20,
        hitBusy: 2, missBusy: 3,
        percent: 10, directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [79, 80], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「太极初升」。\n' },
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的武当剑法修为不够，难以施展「太极初升」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你现在真气不够，难以施展「太极初升」。\n' },
        ],
    },
    'yitian-zhang/zheng': {
        skill: 'yitian-zhang', ability: 'zheng', abilityPath: 'zheng',
        usage: 'strike', grant: 'can_perform/yitian-zhang/zheng',
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'strike',
        families: wudangFamilies, actorFamily: '武当派',
        title: '谁与争锋',
        fee: 150, comboAttacks: 4, comboBusyMin: 1, comboBusyMax: 4,
        applyKeys: ['attack'], comboHitAttackFromSkill: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的倚天屠龙掌不够娴熟，难以施展「谁与争锋」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在真气太弱，难以施展「谁与争锋」。\n' },
        ],
    },
    'shenmen-jian/ci': {
        skill: 'shenmen-jian', ability: 'ci', abilityPath: 'ci',
        usage: 'sword', grant: 'can_perform/shenmen-jian/ci',
        forceSkill: 'force', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: wudangFamilies, actorFamily: '武当派',
        title: '神门刺',
        feeHit: 120, feeMiss: 40,
        meBusyHitMin: 2, meBusyHitMax: 3, meBusyMiss: 3,
        dpSkills: ['parry'],
        targetBusyOnHit: 2, disarmOnHit: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的神门十三剑等级不够，难以施展「神门刺」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不足，难以施展「神门刺」。\n' },
        ],
    },
    'xuanxu-dao/huan': {
        skill: 'xuanxu-dao', ability: 'huan', abilityPath: 'huan',
        usage: 'blade', grant: 'can_perform/xuanxu-dao/huan',
        forceSkill: 'force', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families: wudangFamilies, actorFamily: '武当派',
        title: '乱环诀',
        feeHit: 180, feeMiss: 60,
        hitBusy: 2, missBusy: 3,
        percent: 60, directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「乱环诀」。\n' },
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的玄虚刀法修为不够，难以施展「乱环诀」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你现在真气不够，难以施展「乱环诀」。\n' },
        ],
    },
    'raozhi-roujian/chuan': {
        skill: 'raozhi-roujian', ability: 'chuan', abilityPath: 'chuan',
        usage: 'sword', grant: 'can_perform/raozhi-roujian/chuankong',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: wudangFamilies, actorFamily: '武当派',
        title: '柔月穿空',
        feeHit: 150, feeMiss: 60,
        hitBusy: 2, missBusy: 3,
        percent: 30, directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「柔月穿空」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的绕指柔剑修为不够，难以施展「柔月穿空」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你现在真气不够，难以施展「柔月穿空」。\n' },
        ],
    },
    'huzhua-shou/juehu': {
        skill: 'huzhua-shou', ability: 'juehu', abilityPath: 'juehu',
        usage: 'claw', grant: 'can_perform/huzhua-shou/juehu',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'claw',
        families: wudangFamilies, actorFamily: '武当派',
        title: '绝户神抓',
        feeHit: 200, feeMiss: 100,
        hitBusy: 2, missBusy: 3,
        percent: 40, directType: 'UNARMED',
        shenCost: 3000, shenGate: 10000,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的虎爪绝户手不够娴熟，难以施展「绝户神抓」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，难以施展「绝户神抓」。\n' },
        ],
    },

    // ---- Tianlongsi 6 ----
    'huoyan-dao/fen': {
        skill: 'huoyan-dao', ability: 'fen', abilityPath: 'fen',
        usage: 'strike', grant: 'can_perform/huoyan-dao/fen',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: null,
        families: tianlongFamilies, actorFamily: '大理段家',
        title: '焚身',
        feeHit: 300, feeMiss: 150,
        hitBusy: 2, missBusy: 3,
        percent: 70, directType: 'REMOTE',
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的火焰刀等级不够，还不能使出「焚身」！\n' },
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，不能使用这样绝技。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的内力不够，无法运功。\n' },
        ],
    },
    'huoyan-dao/yan': {
        skill: 'huoyan-dao', ability: 'yan', abilityPath: 'yan',
        usage: 'strike', grant: 'can_perform/huoyan-dao/yan',
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'strike',
        families: tianlongFamilies, actorFamily: '大理段家',
        title: '天寰神炎',
        fee: 500, comboAttacks: 5, comboBusyMin: 3, comboBusyMax: 4,
        applyKeys: ['attack'], comboHitAttackFromForce: true, comboHitAttackDiv: 10,
        gates: [
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，无法施展「天寰神炎」。\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的火焰刀修为不够，无法施展「天寰神炎」。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你的真气不够，无法施展「天寰神炎」。\n' },
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你的真气不够，无法施展「天寰神炎」。\n' },
        ],
    },
    'sun-finger/dian': {
        skill: 'sun-finger', ability: 'dian', abilityPath: 'dian',
        usage: 'finger', grant: null,
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'finger',
        families: tianlongFamilies, actorFamily: '大理段家',
        title: '神指点穴',
        feeHit: 0, feeMiss: 0,
        meBusyHit: 0, meBusyMiss: 1,
        dpSkills: ['parry'],
        targetBusyFormula: 'finger20-2', targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的一阳指法不够娴熟，不会使用「神指点穴」。\n' },
        ],
    },
    'liumai-shenjian/qi': {
        skill: 'liumai-shenjian', ability: 'qi', abilityPath: 'qi',
        usage: 'finger', grant: 'can_perform/liumai-shenjian/qi',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'finger',
        families: tianlongFamilies, actorFamily: '大理段家',
        title: '无形剑气',
        feeHit: 400, feeMiss: 0,
        meBusy: 3,
        percent: 74, directType: 'UNARMED',
        dpSkills: ['force'],
        gates: [
            { key: 'force', pair: [419, 420], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，使不出「无形剑气」。\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为还不足以使出如此犀利的「无形剑气」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，无法使用「无形剑气」。\n' },
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你的六脉神剑修为有限，无法使用「无形剑气」！\n' },
        ],
    },
    'liumai-shenjian/six': {
        skill: 'liumai-shenjian', ability: 'six', abilityPath: 'six',
        usage: 'finger', grant: 'can_perform/liumai-shenjian/six',
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'finger',
        families: tianlongFamilies, actorFamily: '大理段家',
        title: '六脉剑气',
        fee: 400, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [219, 220], field: 'skill',
                refusal: '你的六脉神剑修为有限，无法使用「六脉剑气」！\n' },
            { key: 'force', pair: [399, 400], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「六脉剑气」。\n' },
            { key: 'max-neili', pair: [6999, 7000], field: 'max_neili',
                refusal: '你的内力修为没有达到那个境界，无法运转内力形成「六脉剑气」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，现在无法施展「六脉剑气」。\n' },
        ],
    },
    'liumai-shenjian/zong': {
        skill: 'liumai-shenjian', ability: 'zong', abilityPath: 'zong',
        usage: 'finger', grant: 'can_perform/liumai-shenjian/zong',
        forceSkill: 'force', kind: 'multi', weapon: null, prepared: 'finger',
        families: tianlongFamilies, actorFamily: '大理段家',
        title: '万剑纵横',
        fee: 800, multiDirects: 6,
        percentRanges: [[30, 30], [30, 30], [40, 40], [40, 40], [60, 60], [60, 60]],
        hitBusyMin: 3, hitBusyMax: 6,
        dpSkills: ['parry', 'dodge', 'force'],
        gates: [
            { key: 'level', pair: [259, 260], field: 'skill',
                refusal: '你的六脉神剑修为有限，无法使用「万剑纵横」！\n' },
            { key: 'force', pair: [479, 480], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「万剑纵横」。\n' },
            { key: 'max-neili', pair: [8499, 8500], field: 'max_neili',
                refusal: '你的内力修为不够,无法施展「万剑纵横」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你的真气不够，现在无法施展「万剑纵横」。\n' },
        ],
    },

    // ---- Xiake exclusive 5 ----
    'taixuan-gong/hun': {
        skill: 'taixuan-gong', ability: 'hun', abilityPath: 'perform/hun',
        usage: 'unarmed', grant: 'can_perform/taixuan-gong/hun',
        forceSkill: 'taixuan-gong', kind: 'direct', weapon: null,
        prepared: 'unarmed',
        families: xiakeFamilies, actorFamily: '侠客岛',
        title: '混天一气',
        feeHit: 600, feeMiss: 300,
        hitBusy: 3, missBusy: 2,
        percent: 80, directType: 'UNARMED',
        reverseHit: true,
        extraSkills: { 'taixuan-gong': 300, 'martial-cognize': 200 },
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你的太玄功还不够娴熟，难以施展「混天一气」。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你的内力不够，难以施展「混天一气」。\n' },
        ],
    },
    'taixuan-gong/jing': {
        skill: 'taixuan-gong', ability: 'jing', abilityPath: 'perform/jing',
        usage: 'sword', grant: 'can_perform/taixuan-gong/jing',
        forceSkill: 'taixuan-gong', kind: 'multi', weapon: 'sword',
        prepared: 'sword',
        families: xiakeFamilies, actorFamily: '侠客岛',
        title: '白首太玄经',
        feeMin: 400, feeMax: 799,
        multiDirects: 4,
        percentRanges: [[80, 89], [95, 104], [80, 89], [80, 89]],
        hitBusyMin: 2, hitBusyMax: 4,
        extraSkills: { 'taixuan-gong': 300, 'martial-cognize': 200, sword: 340 },
        extraProperties: { 'can_learned/taixuan-gong/enable_weapon': 1 },
        dpSkills: ['force', 'dodge', 'parry'],
        gates: [
            { key: 'force', pair: [339, 340], field: 'skill', skillName: 'force',
                refusal: '你内功修为不够，难以施展「白首太玄经」。\n' },
            { key: 'max-neili', pair: [9999, 10000], field: 'max_neili',
                refusal: '你内力修为不够，难以施展「白首太玄经」。\n' },
            { key: 'level', pair: [339, 340], field: 'skill',
                refusal: '你太玄功火候不够，难以施展「白首太玄经」。\n' },
            { key: 'neili', pair: [849, 850], field: 'neili',
                refusal: '你现在真气不够，难以施展「白首太玄经」。\n' },
            { key: 'mc', pair: [259, 260], field: 'skill', skillName: 'martial-cognize',
                refusal: '你武学修养不足，难以施展「白首太玄经」。\n' },
        ],
    },
    'taixuan-gong/po': {
        skill: 'taixuan-gong', ability: 'po', abilityPath: 'perform/po',
        usage: 'unarmed', grant: 'can_perform/taixuan-gong/po',
        forceSkill: 'taixuan-gong', kind: 'receive', weapon: null,
        prepared: 'unarmed',
        families: xiakeFamilies, actorFamily: '侠客岛',
        title: '乘风破浪',
        receiveOnly: true,
        fee: 220, meBusy: 5,
        targetNeiliCost: 500,
        extraSkills: { 'taixuan-gong': 300, 'martial-cognize': 200 },
        dpSkills: ['force'],
        gates: [
            { key: 'max-neili', pair: [8499, 8500], field: 'max_neili',
                refusal: '你的内力的修为不够，现在无法使用「乘风破浪」。\n' },
            { key: 'level', pair: [259, 260], field: 'skill',
                refusal: '你的太玄功还不够娴熟，难以施展「乘风破浪」。\n' },
            { key: 'neili', pair: [219, 220], field: 'neili',
                refusal: '你的真气不够，无法运用「乘风破浪」。\n' },
        ],
    },
    'taixuan-gong/xuan': {
        skill: 'taixuan-gong', ability: 'xuan', abilityPath: 'perform/xuan',
        usage: 'unarmed', grant: 'can_perform/taixuan-gong/xuan',
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'unarmed',
        families: xiakeFamilies, actorFamily: '侠客岛',
        title: '太玄激劲',
        fee: 600, comboAttacks: 15, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: ['attack'], comboHitAttackFromSkill: true, comboHitAttackDiv: 8,
        extraSkills: { 'taixuan-gong': 300, 'martial-cognize': 200 },
        dpSkills: ['dodge'],
        gates: [
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你的真气不够，无法施展「太玄激劲」！\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为还不足以使出「太玄激劲」。\n' },
            { key: 'force', pair: [299, 300], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「太玄激劲」！\n' },
            { key: 'level', pair: [239, 240], field: 'skill',
                refusal: '你的太玄功还不够熟练，无法使用「太玄激劲」！\n' },
        ],
    },
    'jinwu-daofa/chi': {
        skill: 'jinwu-daofa', ability: 'chi', abilityPath: 'chi',
        usage: 'blade', grant: 'can_perform/jinwu-daofa/chi',
        forceSkill: 'force', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families: xiakeFamilies, actorFamily: '侠客岛',
        title: '赤焰暴长',
        fee: 150, feeHit: 150, feeMiss: 150, unconditionalFee: true,
        meBusy: 3, percent: 40, directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的金乌刀法不够娴熟，无法施展「赤焰暴长」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，无法施展「赤焰暴长」。\n' },
        ],
    },

    // ---- Ultra exclusive 5 ----
    'never-defeated/lei': {
        skill: 'never-defeated', ability: 'lei', abilityPath: 'perform/lei',
        usage: 'sword', grant: null,
        forceSkill: 'never-defeated', kind: 'special', weapon: 'sword',
        prepared: null,
        families: ultraFamilies, actorFamily: '侠客盟',
        title: '天打雷劈',
        fee: 60, meBusyMin: 1, meBusyMax: 2,
        specialBusy: 'lei',
        dpSkills: [],
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的不败神功还不够娴熟，不能使用天打雷劈！\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够！\n' },
        ],
    },
    'never-defeated/po': {
        skill: 'never-defeated', ability: 'po', abilityPath: 'perform/po',
        usage: 'sword', grant: null,
        forceSkill: 'never-defeated', kind: 'combo', weapon: 'sword',
        prepared: null,
        families: ultraFamilies, actorFamily: '侠客盟',
        title: '破字诀',
        fee: 100, comboAttacks: 4, comboAttacksMax: 7,
        comboBusyMin: 1, comboBusyMax: 7,
        applyKeys: [],
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的不败神功等级不够，无法施展破字诀！\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不够！\n' },
        ],
    },
    'never-defeated/tianhua': {
        skill: 'never-defeated', ability: 'tianhua', abilityPath: 'perform/tianhua',
        usage: 'sword', grant: null,
        forceSkill: 'never-defeated', kind: 'control', weapon: 'sword',
        prepared: null,
        families: ultraFamilies, actorFamily: '侠客盟',
        title: '天花乱坠',
        feeHit: 0, feeMiss: 0,
        meBusyHit: 0, meBusyMiss: 1,
        dpSkills: ['parry'],
        targetBusyFormula: 'never45-2', targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的不败神功不够深厚，不会使用天花乱坠。\n' },
        ],
    },
    'never-defeated/wanli': {
        skill: 'never-defeated', ability: 'wanli', abilityPath: 'perform/wanli',
        usage: 'sword', grant: null,
        forceSkill: 'never-defeated', kind: 'direct', weapon: 'sword',
        prepared: null,
        families: ultraFamilies, actorFamily: '侠客盟',
        title: '晴空万里',
        fee: 200, feeHit: 200, feeMiss: 20,
        hitBusy: 2, missBusy: 2,
        percent: 50, directType: 'WEAPON',
        targetBusyOnHit: 'random13', targetBusyOptional: true,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的不败神功还不够娴熟，不能使用晴空万里。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在内力太弱，不能使用晴空万里。\n' },
        ],
    },
    'never-defeated/yuce': {
        skill: 'never-defeated', ability: 'yuce', abilityPath: 'perform/yuce',
        usage: 'throwing', grant: null,
        forceSkill: 'never-defeated', kind: 'throwing', weapon: null,
        prepared: null,
        families: ultraFamilies, actorFamily: '侠客盟',
        title: '御策诀',
        handing: 'throwing', consumeAmount: 1,
        fee: 120, meBusy: 1,
        dpSkills: [],
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的不败神功火候不够，不会施展御策诀。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你内力不够了。\n' },
        ],
    },
};

export const b19Schools = schools;

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
            // When force is remapped, query_skill(name) = raw/2 + skills[mapped].
            // Pin raw to 0 and place the threshold on the mapped skill instead.
            if (name === 'force' && cfg.forceSkill && cfg.forceSkill !== 'force')
                return { skills: { force: 0, [cfg.forceSkill]: value } };
            return { skills: { [name]: isLow ? value * 2 : (value + 1) * 2 } };
        }
        default: return { skills: { [gate.field]: value } };
    }
};

export function b19PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b19SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b19ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b19ReviewedSourceHash,
            'Reviewed B19 sources changed; re-review before sampling');
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
                preparations: extra.preparations ?? (cfg.prepared ? { [cfg.prepared]: cfg.skill } : {}),
                properties,
                ...(cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}),
                ...(cfg.handing ? { equipment: { type: cfg.handing, hold: true, ...(cfg.consumeAmount ? { amount: Math.max(cfg.consumeAmount, 20) } : cfg.consumeAll ? { amount: 25 } : { amount: 10 }) } } : {}),
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
                id: `b19-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b19', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b19-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b19SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}独有：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + (cfg.kind === 'buff'
                            ? '临时增益按原分支记账，已激活时拒绝。'
                            : cfg.kind === 'multi'
                                ? '归去来兮两段掌劲各自判定并分段记账，费用无条件扣除。'
                                : cfg.kind === 'special'
                                    ? '特殊分支按原逻辑记账。'
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
        if (cfg.kind === 'throwing' && cfg.expHitCheck) {
            add('hit', { targetProperties: { combat_exp: 1 }, samples: 4 });
            add('miss', { targetProperties: { combat_exp: 100000000000 }, samples: 4 });
        } else if (cfg.kind === 'throwing' && cfg.dpSkills && cfg.dpSkills.length) {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        } else if (cfg.expHitCheck) {
            add('hit', { targetProperties: { combat_exp: 1 }, samples: 4 });
            add('miss', { targetProperties: { combat_exp: 100000000000 }, samples: 4 });
        } else if (cfg.dpSkills && cfg.dpSkills.length && cfg.kind !== 'combo'
            && cfg.kind !== 'buff') {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        if (cfg.targetBusyRefusal)
            add('target-busy', {
                targetBusy: true,
                refusal: cfg.targetBusyRefusalText
                    ?? '右试弟子目前正自顾不暇，放胆攻击吧！\n',
            });
        if (cfg.kind === 'buff' && cfg.alreadyActiveCap !== undefined && cfg.alreadyActiveCap > 0)
            add('already-active', {
                actorTemp: { [cfg.buff]: cfg.alreadyActiveCap },
                refusal: '你已经唱得太久了，不能再唱了。\n',
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
        if (side.temp) delete side.temp['liumai-shenjian'];
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
    // Weapon disarm (shenmen-jian/ci) drops the target weapon.
    if (actual.weapon === 'none' && expected.weapon !== 'none') {
        expected.weapon = 'none';
        expected.weapon_damage = 0;
        expected.weapon_flag = 0;
        expected.weapon_details = copy(actual.weapon_details ?? {});
        if (expected.temp) {
            delete expected.temp.weapon;
            if (expected.temp.apply) {
                delete expected.temp.apply.damage;
                delete expected.temp.apply.dodge;
            }
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
        case 'finger20-2': return Math.trunc(effSkill('finger') / 20) + 2;
        case 'never45-2': return Math.trunc((Math.trunc(num(sparse(b.skills, 'never-defeated')) * 3 / 2) + num(sparse(b.skills, 'martial-cognize'))) / 45) + 2;
        case 'random3': return 0;
        case 'random13': return 0;
        case 'throwing80-2': return Math.trunc(effSkill('throwing') / 80) + 2;
        case 'hand100-2': return Math.trunc((effSkill('hand') + (num(b.dex) + Math.trunc(num(sparse(b.skills, 'dodge')) / 10) + (b.temp?.apply?.dex ?? 0)) * 10) / 100) + 2;
        case 'tianyu23-1': return Math.trunc(num(sparse(b.skills, 'tianyu-qijian')) / 23) + 1;
        case 'dagger25-2': return Math.trunc(effSkill('dagger') / 25) + 2;
        default: return 0;
    }
}

export function validateB19Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B19 entry');
    assert.equal(p.collection_group, 'b19-perform');
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
        for (const k of health) {
            // chang2 refunds neili as neili_recovery.
            if (k === 'neili' && cfg && cfg.fee < 0 && side === 0) continue;
            assert.equal(sparse(raw.metrics[side], k + '_recovery'), 0, k);
        }
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
    if (cfg.kind === 'receive') return validateB19Receive(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB19Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB19Multi(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'throwing') return validateB19Throwing(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'special') return validateB19Special(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB19Direct(raw, condition, cfg, p, b, t, a, v);
    return validateB19Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB19Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    // receive_damage paths (meng) report no do_damage rows; hit is a qi drop.
    const miss = cfg.receiveOnly
        ? num(v.qi) === num(t.qi) && num(v.eff_qi) === num(t.eff_qi)
        : directs.length === 0 && sparse(raw.metrics[0], 'direct') === 0;
    if (!cfg.receiveOnly) assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    const directCount = sparse(raw.metrics[0], 'direct');
    assert.ok(directCount >= 0, 'direct count');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const paid = b.neili - a.neili;
    let fee;
    if (cfg.unconditionalFee) fee = cfg.feeHit ?? 0;
    else if (miss) fee = cfg.feeMiss ?? 0;
    else fee = cfg.feeHit ?? 0;
    // Three-branch directs (cui): force-block pays a third fee and is still a miss.
    if (cfg.feeForceBlock !== undefined && miss && paid === cfg.feeForceBlock)
        fee = cfg.feeForceBlock;
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
            if (cfg.shenCost) e.shen = a.shen;
            allowDerived(e, a);
        });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    let input;
    if (cfg.receiveOnly) {
        assert.equal(directs.length, 0, 'receive path has no do_damage rows');
        assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'receive has no direct metric');
        input = num(t.qi) - num(v.qi);
        assert.ok(input > 0, 'receive qi drop');
    } else {
        assert.ok(directs.length <= 1, 'at most one direct');
        if (directs.length === 1) {
            assert.equal(directs[0].actor, 0); assert.equal(directs[0].target, 1);
        }
        input = directs.length === 1 ? num(directs[0].damage) : 0;
        if (directs.length === 1) {
            const support = slice2SupportSet(input, cfg.percent, b, t, cfg.directType);
            assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
                'target resulting state must lie in modeled do_damage support');
        }
    }
    if (cfg.poison) assert.ok(v.conditions?.[cfg.poison], 'poison applied on hit');
    if (cfg.shenCost) assert.equal(num(b.shen) - num(a.shen), cfg.shenCost, 'shen cost');
    if (cfg.targetBusyOnHit !== undefined) {
        const want = typeof cfg.targetBusyOnHit === 'number'
            ? cfg.targetBusyOnHit
            : targetBusyFor({ ...cfg, targetBusyFormula: cfg.targetBusyOnHit }, b, true);
        const got = num(v.busy);
        if (cfg.targetBusyOptional) {
            if (cfg.targetBusyOnHit === 'random3') assert.ok(got >= 0 && got <= 2, 'optional target busy range');
            else if (cfg.targetBusyOnHit === 'random13') assert.ok(got >= 1 && got <= 3, 'optional target busy range');
            else assert.ok(got === 0 || got === want, 'optional target busy on hit');
        }
        else assert.equal(got, want, 'target busy on hit');
    }
    assertLearnGain(a, p.skill);
    const spent = b.neili - a.neili;
    stableState(b, a, e => {
        e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
        if (cfg.shenCost) e.shen = a.shen;
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

function validateB19Control(raw, condition, cfg, p, b, t, a, v) {
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
        if (cfg.targetBusyOnHit !== undefined && typeof cfg.targetBusyOnHit === 'number')
            assert.equal(tBusy, cfg.targetBusyOnHit, 'target busy fixed on hit');
        else {
            const expected = targetBusyFor(cfg, b, hit);
            if (expected) assert.equal(tBusy, expected, 'target busy formula');
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
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    }, { consumeThrowing: Boolean(cfg.handing) });
    stableState(t, v, e => {
        e.busy = v.busy;
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'control', hit };
}

function validateB19Multi(raw, condition, cfg, p, b, t, a, v) {
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


function validateB19Receive(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'receive path has no do_damage rows');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'receive has no direct metric');
    const fee = b.neili - a.neili;
    assert.equal(fee, cfg.fee, 'receive fee');
    const busyAfter = num(a.busy);
    assert.equal(busyAfter, cfg.meBusy, 'receive me busy');
    const hit = num(v.qi) !== num(t.qi) || num(v.eff_qi) !== num(t.eff_qi);
    assertLearnGain(a, p.skill);
    const spent = b.neili - a.neili;
    stableState(b, a, e => {
        e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'receive', hit };
}

function validateB19Throwing(raw, condition, cfg, p, b, t, a, v) {
    const fee = b.neili - a.neili;
    assert.equal(fee, cfg.fee, 'throwing fee');
    const hit = num(v.qi) !== num(t.qi) || num(v.eff_qi) !== num(t.eff_qi)
        || (cfg.targetBusyFormula ? num(v.busy) > num(t.busy) : false);
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
    }, { consumeThrowing: true });
    if (hit && cfg.targetBusyFormula) {
        assert.equal(num(v.busy), targetBusyFor(cfg, b, hit), 'throwing target busy formula');
    }
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

function validateB19Buff(raw, condition, cfg, p, b, t, a, v) {
    // Refund buffs (chang2) record neili_recovery instead of neili_cost.
    const cost = cfg.fee < 0
        ? -sparse(raw.metrics[0], 'neili_recovery')
        : sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'buff has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'buff fee');
    assert.equal(b.neili - a.neili, cfg.fee, 'buff fee deduction');
    assert.equal(num(a.busy ?? 0), p.fighting ? cfg.meBusy : 0);
    if (cfg.reverseBuff) {
        assert.equal(temp(a, cfg.buff), temp(b, cfg.buff) - 1, 'chang decremented');
    } else {
        assert.equal(temp(a, cfg.buff), temp(b, cfg.buff) + 1, 'chang incremented');
    }
    if (cfg.buffApply) {
        const delta = cfg.buffApplyDelta ?? 1;
        for (const key of cfg.buffApplyKeys ?? ['attack']) {
            const before = temp(b, 'apply/' + key);
            const after = temp(a, 'apply/' + key);
            assert.equal(after - before, delta, 'apply/' + key + ' delta');
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
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'buff' };
}

function validateB19Special(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const fee = b.neili - a.neili;
    if (cfg.specialBusy === 'lei') {
        assert.equal(fee, cfg.fee, 'lei fee');
        const busyAfter = num(a.busy);
        assert.ok(busyAfter >= cfg.meBusyMin && busyAfter <= cfg.meBusyMax, 'lei busy');
        assertLearnGain(a, p.skill);
        const death = raw.terminals.length > 0 || num(v.living) === 0 || num(v.ghost) === 1;
        const hit = death || num(v.qi) !== num(t.qi);
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        // target->die() runs the generic death path (ghost, skill/potential penalty,
        // my_killer, die_guard). Those are death side effects shared by every kill,
        // not lei-specific, so only the kill outcome is asserted here.
        if (!death) stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili; e.living = v.living; e.ghost = v.ghost;
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'special', hit };
    }
    if (cfg.specialBusy === 'chang3') {
        // Late-refusal nuke: fees and busy land even when the max_neili roll fails.
        assert.ok(fee >= cfg.feeMin && fee <= cfg.feeMax, 'chang3 fee range');
        assert.equal(num(b.qi) - num(a.qi), cfg.selfQiCost, 'self qi cost');
        const busyAfter = num(a.busy);
        assert.ok(busyAfter >= cfg.meBusyMin && busyAfter <= cfg.meBusyMax, 'chang3 busy');
        assertLearnGain(a, p.skill);
        const hit = num(v.qi) !== num(t.qi) || num(v.jing) !== num(t.jing);
        stableState(b, a, e => {
            e.neili -= fee; e.qi = a.qi; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili;
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'special', hit };
    }
    if (cfg.crush) {
        assert.equal(fee, cfg.fee, 'crush fee');
        const busyAfter = num(a.busy);
        assert.ok(busyAfter >= cfg.hitBusyMin && busyAfter <= cfg.missBusyMax, 'crush busy');
        assertLearnGain(a, p.skill);
        const death = raw.terminals.length > 0 || num(v.living) === 0;
        const hit = directs.length === 1 || death;
        if (directs.length === 1) {
            const input = num(directs[0].damage);
            const support = slice2SupportSet(input, cfg.percent, b, t, cfg.directType);
            assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
                'crush normal path must match do_damage support');
        }
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili; e.living = v.living; e.ghost = v.ghost;
            e.conditions = copy(v.conditions ?? null);
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'special', hit };
    }
    if (cfg.specialBusy === 'wu') {
        assert.equal(fee, cfg.fee, 'wu fee');
        assert.equal(num(a.busy), cfg.meBusy, 'wu me busy');
        assertLearnGain(a, p.skill);
        const hit = num(v.busy) > 0;
        if (hit) {
            assert.ok(num(v.busy) >= 4 && num(v.busy) <= 7, 'wu target busy window');
            assert.ok(num(b.qi) - num(a.qi) >= 180, 'wu self qi cost');
        }
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            e.qi = a.qi; e.jing = a.jing;
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.busy = v.busy;
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'special', hit };
    }
    if (cfg.specialBusy === 'yin') {
        // jing damage path; immunity branches pay the miss fee and skip jing.
        const busyAfter = num(a.busy);
        assert.equal(busyAfter, cfg.meBusy, 'yin me busy');
        assertLearnGain(a, p.skill);
        const hit = num(v.jing) !== num(t.jing) || num(v.eff_jing) !== num(t.eff_jing);
        const feeWant = hit ? cfg.feeHit : cfg.feeMiss;
        assert.equal(fee, feeWant, 'yin branch fee');
        if (hit) {
            assert.ok(directs.length <= 1, 'yin may report a direct-like row');
        }
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili;
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'special', hit };
    }
    assert.fail('unknown special branch ' + cfg.specialBusy);
}

function validateB19Combo(raw, condition, cfg, p, b, t, a, v) {
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
        const maxAttacks = cfg.comboAttacksMax ?? cfg.comboAttacks ?? 8;
        assert.ok(attacks.length >= 1 && attacks.length <= maxAttacks,
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

export function b19Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB19Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
