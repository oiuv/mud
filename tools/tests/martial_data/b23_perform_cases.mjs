// B23 multi-stage direct 21 perform batch (new multi_stage kind).
// Shaolin 3: lunhui-jian hui, liuhe-bian lianhuan; Duan 2: six-finger qi/zong.
// Murong 1: canhe-zhi canhe. Gaibang 1: dragon-strike hui. Lingxiao 1: shangqing-jian qing.
// Meizhuang 1: fenglei-panfa fenglei. Hengshan 1: wushen-jian shen. Emei 1: yuenv-jian xin.
// Xuanming 1: xuanming-zhang xing. Shenlong 1: shedao-qigong xian. None 8: leiting-fu sanda,
// daojian-guizhen daojian, jinshe-jian shi, jiuyin-baiguzhao duo, kuihua-mogong wswd,
// sanfen-jianshu haishi, yinsuo-jinling feng, yujian-shu yujian, zhougong-jian mang.
// One collection settles these multi-stage direct performs.
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

const shaolinFamilies = ['少林寺'];
const duanFamilies = ['大理段家'];
const murongFamilies = ['慕容世家'];
const gaibangFamilies = ['丐帮'];
const lingxiaoFamilies = ['凌霄城'];
const meizhuangFamilies = ['梅庄'];
const hengshanFamilies = ['衡山派'];
const emeiFamilies = ['峨嵋派'];
const xuanmingFamilies = ['玄冥教'];
const shenlongFamilies = ['神龙教'];
const noneFamilies = ['侠客盟'];

export const b23SourcePaths = [
    'kungfu/skill/lunhui-jian.c', 'kungfu/skill/lunhui-jian/hui.c',
    'kungfu/skill/six-finger.c', 'kungfu/skill/six-finger/qi.c', 'kungfu/skill/six-finger/zong.c',
    'kungfu/skill/liumai-shenjian.c', 'kungfu/skill/liumai-shenjian/qi.c',
    'kungfu/skill/liumai-shenjian/zong.c',
    'kungfu/skill/liuhe-bian.c', 'kungfu/skill/liuhe-bian/lianhuan.c',
    'kungfu/skill/fenglei-panfa.c', 'kungfu/skill/fenglei-panfa/fenglei.c',
    'kungfu/skill/canhe-zhi.c', 'kungfu/skill/canhe-zhi/canhe.c',
    'kungfu/skill/dragon-strike.c', 'kungfu/skill/dragon-strike/hui.c',
    'kungfu/skill/leiting-fu.c', 'kungfu/skill/leiting-fu/sanda.c',
    'kungfu/skill/shangqing-jian.c', 'kungfu/skill/shangqing-jian/qing.c',
    'kungfu/skill/daojian-guizhen.c', 'kungfu/skill/daojian-guizhen/daojian.c',
    'kungfu/skill/jinshe-jian.c', 'kungfu/skill/jinshe-jian/shi.c',
    'kungfu/skill/jiuyin-baiguzhao.c', 'kungfu/skill/jiuyin-baiguzhao/duo.c',
    'kungfu/skill/kuihua-mogong.c', 'kungfu/skill/kuihua-mogong/perform/wswd.c',
    'kungfu/skill/sanfen-jianshu.c', 'kungfu/skill/sanfen-jianshu/haishi.c',
    'kungfu/skill/shedao-qigong.c', 'kungfu/skill/shedao-qigong/xian.c',
    'kungfu/skill/wushen-jian.c', 'kungfu/skill/wushen-jian/shen.c',
    'kungfu/skill/xuanming-zhang.c', 'kungfu/skill/xuanming-zhang/xing.c',
    'kungfu/skill/yinsuo-jinling.c', 'kungfu/skill/yinsuo-jinling/feng.c',
    'kungfu/skill/yuenv-jian.c', 'kungfu/skill/yuenv-jian/xin.c',
    'kungfu/skill/yujian-shu.c', 'kungfu/skill/yujian-shu/yujian.c',
    'kungfu/skill/zhougong-jian.c', 'kungfu/skill/zhougong-jian/mang.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c',
    'kungfu/skill/strike.c', 'kungfu/skill/hand.c',
    'kungfu/skill/cuff.c', 'kungfu/skill/staff.c',
    'kungfu/skill/whip.c', 'kungfu/skill/hammer.c',
    'kungfu/skill/claw.c', 'kungfu/skill/finger.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/throwing.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/force.c', 'kungfu/skill/parry.c',
    'kungfu/skill/club.c', 'kungfu/skill/axe.c', 'kungfu/skill/dagger.c',
    'kungfu/skill/martial-cognize.c', 'kungfu/skill/jingluo-xue.c',
    'kungfu/skill/buddhism.c',
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
export const b23ReviewedSourceHash = 'PENDING';

const schools = {
    // ---- Shaolin 2 ----
    'lunhui-jian/hui': {
        skill: 'lunhui-jian', ability: 'hui', abilityPath: 'hui',
        usage: 'sword', grant: 'can_perform/lunhui-jian/hui',
        forceSkill: 'force', kind: 'multi_stage', weapon: 'sword', prepared: 'sword',
        families: shaolinFamilies, actorFamily: '少林寺',
        title: '真·六道轮回',
        feeMin: 500, feeMax: 999,
        hitBusyMin: 3, hitBusyMax: 5, missBusyMin: 3, missBusyMax: 5,
        maxDirects: 7,
        stages: [
            { dpField: 'parry', percentRange: [300, 300] },
        ],
        percentRange: [300, 300], directType: 'WEAPON',
        extraSkills: { buddhism: 500 },
        extraMappings: {},
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [749, 750], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「真·六道轮回」。\n' },
            { key: 'max-neili', pair: [7499, 7500], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「真·六道轮回」。\n' },
            { key: 'buddhism', pair: [499, 500], field: 'skill', skillName: 'buddhism',
                refusal: '你对禅宗心法参悟不够，难以施展「真·六道轮回」。\n' },
            { key: 'level', pair: [499, 500], field: 'skill',
                refusal: '你释迦轮回剑火候不够，难以施展「真·六道轮回」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在真气不够，难以施展「真·六道轮回」。\n' },
        ],
    },
    'liuhe-bian/lianhuan': {
        skill: 'liuhe-bian', ability: 'lianhuan', abilityPath: 'lianhuan',
        usage: 'whip', grant: null,
        forceSkill: 'force', kind: 'multi_stage', weapon: 'whip', prepared: null,
        families: shaolinFamilies, actorFamily: '少林寺',
        title: '六合连环诀',
        feeHit: 300, feeMiss: 200,
        hitBusy: 2, missBusyMin: 2, missBusyMax: 4,
        maxDirects: 6,
        stages: [
            { dpField: 'parry', percentRange: [50, 50] },
        ],
        percentRange: [50, 50], directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [269, 270], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候未到，无法配合鞭法施展连环诀！\n' },
            { key: 'whip', pair: [179, 180], field: 'skill', skillName: 'whip',
                refusal: '你鞭法修为不足，还不能使用连环诀！\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你六合鞭法修为不足，还不能使用连环诀！\n' },
            { key: 'neili', pair: [300, 301], field: 'neili',
                refusal: '你的内力不够，无法施展！\n' },
            { key: 'dodge', pair: [179, 180], field: 'skill', skillName: 'dodge',
                refusal: '你轻功修为不足，无法快速攻击！\n' },
        ],
    },
    // ---- Duan 2 ----
    // six-finger perform_action_file routes to liumai-shenjian/; runtime body
    // is the liumai implementation. Dispatch maps finger to six-finger so the
    // launch skill matches, while prepared/level gates read liumai-shenjian.
    'six-finger/qi': {
        sourceSkill: 'liumai-shenjian',
        skill: 'six-finger', ability: 'qi', abilityPath: 'qi',
        usage: 'finger', grant: 'can_perform/liumai-shenjian/qi',
        forceSkill: 'force', kind: 'multi_stage', weapon: null, prepared: 'finger',
        preparedSkill: 'liumai-shenjian', families: duanFamilies, actorFamily: '大理段家',
        title: '无形剑气',
        feeHit: 400, feeMiss: 0,
        meBusy: 3,
        maxDirects: 1,
        stages: [
            { dpField: 'force', percentRange: [55, 86] },
        ],
        percentRange: [55, 86], directType: 'UNARMED',
        extraSkills: { 'liumai-shenjian': 300 },
        dpSkills: ['force'],
        gates: [
            { key: 'force', pair: [419, 420], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，使不出「无形剑气」。\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为还不足以使出如此犀利的「无形剑气」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，无法使用「无形剑气」。\n' },
            { key: 'level', pair: [199, 200], field: 'skill', skillName: 'liumai-shenjian',
                refusal: '你的六脉神剑修为有限，无法使用「无形剑气」！\n' },
        ],
    },
    'six-finger/zong': {
        sourceSkill: 'liumai-shenjian',
        skill: 'six-finger', ability: 'zong', abilityPath: 'zong',
        usage: 'finger', grant: 'can_perform/liumai-shenjian/zong',
        forceSkill: 'force', kind: 'multi_stage', weapon: null, prepared: 'finger',
        preparedSkill: 'liumai-shenjian', families: duanFamilies, actorFamily: '大理段家',
        title: '万剑纵横',
        fee: 800,
        hitBusyMin: 3, hitBusyMax: 6, missBusyMin: 3, missBusyMax: 6,
        maxDirects: 6,
        stages: [
            { dpField: 'parry', percentRange: [30, 30] },
            { dpField: 'dodge', percentRange: [40, 40] },
            { dpField: 'force', percentRange: [60, 60] },
        ],
        percentRange: [30, 60], directType: 'UNARMED',
        extraSkills: { 'liumai-shenjian': 300, 'jingluo-xue': 200 },
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [259, 260], field: 'skill', skillName: 'liumai-shenjian',
                refusal: '你的六脉神剑修为有限，无法使用「万剑纵横」！\n' },
            { key: 'force', pair: [479, 480], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「万剑纵横」！\n' },
            { key: 'max-neili', pair: [8499, 8500], field: 'max_neili',
                refusal: '你的内力修为不够,无法施展「万剑纵横」！\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你的真气不够，现在无法施展「万剑纵横」！\n' },
        ],
    },
    // ---- Murong 1 ----
    'canhe-zhi/canhe': {
        skill: 'canhe-zhi', ability: 'canhe', abilityPath: 'canhe',
        usage: 'finger', grant: 'can_perform/canhe-zhi/canhe',
        forceSkill: 'force', kind: 'multi_stage', weapon: null, prepared: 'finger',
        families: murongFamilies, actorFamily: '慕容世家',
        title: '参合剑气',
        feeMin: 400, feeMax: 499,
        hitBusyMin: 3, hitBusyMax: 5, missBusyMin: 3, missBusyMax: 5,
        maxDirects: 3,
        stages: [
            { dpField: 'dodge', percentRange: [64, 64] },
            { dpField: 'force', percentRange: [75, 75] },
            { dpField: 'parry', percentRange: [100, 100] },
        ],
        percentRange: [64, 100], directType: 'UNARMED',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [219, 220], field: 'skill',
                refusal: '你的参合指修为有限，难以施展「参合剑气」。\n' },
            { key: 'force', pair: [319, 320], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为太差，难以施展「参合剑气」。\n' },
            { key: 'max-neili', pair: [5999, 6000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「参合剑气」。\n' },
            { key: 'neili', pair: [899, 900], field: 'neili',
                refusal: '你的真气不够，难以施展「参合剑气」。\n' },
        ],
    },
    // ---- Gaibang 1 ----
    'dragon-strike/hui': {
        skill: 'dragon-strike', ability: 'hui', abilityPath: 'hui',
        usage: 'strike', grant: 'can_perform/dragon-strike/hui',
        forceSkill: 'force', kind: 'multi_stage', weapon: null, prepared: 'strike',
        families: gaibangFamilies, actorFamily: '丐帮',
        title: '亢龙有悔',
        feeMin: 400, feeMax: 999,
        hitBusyMin: 3, hitBusyMax: 6, missBusyMin: 3, missBusyMax: 6,
        maxDirects: 3,
        stages: [
            { dpField: 'dodge', percentRange: [40, 40] },
            { dpField: 'parry', percentRange: [50, 50] },
            { dpField: 'force', percentRange: [60, 60] },
        ],
        percentRange: [40, 60], directType: 'UNARMED',
        dpSkills: ['dodge'],
        gates: [
            { key: 'force', pair: [359, 360], field: 'effective-skill', skillName: 'force',
                refusal: '你内功修为不够，难以施展「亢龙有悔」。\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你内力修为不够，难以施展「亢龙有悔」。\n' },
            { key: 'level', pair: [239, 240], field: 'skill',
                refusal: '你降龙十八掌火候不够，难以施展「亢龙有悔」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在真气不够，难以施展「亢龙有悔」。\n' },
        ],
    },
    // ---- Lingxiao 1 ----
    'shangqing-jian/qing': {
        skill: 'shangqing-jian', ability: 'qing', abilityPath: 'qing',
        usage: 'sword', grant: 'can_perform/shangqing-jian/qing',
        forceSkill: 'force', kind: 'multi_stage', weapon: 'sword', prepared: 'sword',
        families: lingxiaoFamilies, actorFamily: '凌霄城',
        title: '清流剑',
        fee: 300,
        hitBusyMin: 2, hitBusyMax: 4, missBusyMin: 2, missBusyMax: 4,
        maxDirects: 3,
        stages: [
            { dpField: 'parry', percentRange: [10, 10] },
            { dpField: 'dodge', percentRange: [20, 20] },
            { dpField: 'force', percentRange: [30, 30] },
        ],
        percentRange: [10, 30], directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [219, 220], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「清流剑」。\n' },
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的上清剑法修为不够，难以施展「清流剑」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的真气不够，难以施展「清流剑」。\n' },
        ],
    },
    // ---- Meizhuang 1 ----
    'fenglei-panfa/fenglei': {
        skill: 'fenglei-panfa', ability: 'fenglei', abilityPath: 'fenglei',
        usage: 'hammer', grant: 'can_perform/fenglei-panfa/fenglei',
        forceSkill: 'force', kind: 'multi_stage', weapon: 'hammer', prepared: null,
        families: meizhuangFamilies, actorFamily: '梅庄',
        title: '风雷四击',
        feeMin: 400, feeMax: 499,
        hitBusyMin: 2, hitBusyMax: 6, missBusyMin: 2, missBusyMax: 6,
        maxDirects: 4,
        stages: [
            { dpField: 'dodge', percentRange: [30, 30] },
            { dpField: 'dodge', percentRange: [32, 32] },
            { dpField: 'force', percentRange: [33, 33] },
            { dpField: 'parry', percentRange: [35, 35] },
        ],
        percentRange: [30, 35], directType: 'WEAPON',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的风雷盘法不够娴熟，还使不出「风雷四击」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「风雷四击」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在真气不够，难以施展「风雷四击」。\n' },
        ],
    },
    // ---- Hengshan 1 ----
    'wushen-jian/shen': {
        skill: 'wushen-jian', ability: 'shen', abilityPath: 'shen',
        usage: 'sword', grant: 'can_perform/wushen-jian/shen',
        forceSkill: 'force', kind: 'multi_stage', weapon: 'sword', prepared: 'sword',
        families: hengshanFamilies, actorFamily: '衡山派',
        title: '五神朝元势',
        feeHit: 300, feeMiss: 150,
        hitBusyMin: 3, hitBusyMax: 5, missBusy: 3,
        maxDirects: 1,
        stages: [
            { dpField: 'dodge', percentRange: [80, 109] },
        ],
        percentRange: [80, 109], directType: 'WEAPON',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [239, 240], field: 'skill',
                refusal: '你衡山五神剑不够娴熟，难以施展「五神朝元势」。\n' },
            { key: 'force', pair: [219, 220], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「五神朝元势」。\n' },
            { key: 'dodge', pair: [199, 200], field: 'skill', skillName: 'dodge',
                refusal: '你的轻功火候不够，难以施展「五神朝元势」。\n' },
            { key: 'max-neili', pair: [5499, 5500], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「五神朝元势」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不够，难以施展「五神朝元势」。\n' },
        ],
    },
    // ---- Emei 1 ----
    'yuenv-jian/xin': {
        skill: 'yuenv-jian', ability: 'xin', abilityPath: 'xin',
        usage: 'sword', grant: 'can_perform/yuenv-jian/xin',
        forceSkill: 'force', kind: 'multi_stage', weapon: 'sword', prepared: 'sword',
        families: emeiFamilies, actorFamily: '峨嵋派',
        title: '西子捧心',
        fee: 180,
        meBusy: 1,
        maxDirects: 2,
        stages: [
            { dpField: 'dodge', percentRange: [50, 50] },
            { dpField: 'dodge', percentRange: [60, 60] },
        ],
        percentRange: [50, 60], directType: 'WEAPON',
        dpSkills: ['dodge'],
        gates: [
            { key: 'sword', pair: [199, 200], field: 'skill', skillName: 'sword',
                refusal: '你的剑术修为不够，不能施展「西子捧心」！\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的越女剑术的修为不够，不能施展「西子捧心」！\n' },
            { key: 'dodge', pair: [149, 150], field: 'skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，不能施展「西子捧心」！\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够！\n' },
        ],
    },
    // ---- Xuanming 1 ----
    'xuanming-zhang/xing': {
        skill: 'xuanming-zhang', ability: 'xing', abilityPath: 'xing',
        usage: 'strike', grant: 'can_perform/xuanming-zhang/xing',
        forceSkill: 'xuanming-shengong', kind: 'multi_stage', weapon: null, prepared: 'strike',
        families: xuanmingFamilies, actorFamily: '玄冥教',
        title: '玄冥双行',
        feeHitMin: 500, feeHitMax: 500, feeMissMin: 250, feeMissMax: 250,
        meBusy: 4,
        maxDirects: 2,
        stages: [
            { dpField: 'dodge', percentRange: [60, 60] },
            { dpField: 'dodge', percentRange: [80, 80] },
        ],
        percentRange: [60, 80], directType: 'UNARMED',
        extraSkills: { 'xuanming-shengong': 300 },
        extraMappings: { force: 'xuanming-shengong' },
        dpSkills: ['dodge'],
        gates: [
            { key: 'force', pair: [219, 220], field: 'skill', skillName: 'xuanming-shengong',
                refusal: '你的玄冥神功火候不够，无法施展「玄冥双行」。\n' },
            { key: 'level', pair: [219, 220], field: 'skill',
                refusal: '你的玄冥神掌不够熟练，无法施展「玄冥双行」。\n' },
            { key: 'max-neili', pair: [3999, 4000], field: 'max_neili',
                refusal: '你的内力修为不足，无法施展「玄冥双行」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你的真气不够，无法施展「玄冥双行」。\n' },
        ],
    },
    // ---- Shenlong 1 ----
    'shedao-qigong/xian': {
        skill: 'shedao-qigong', ability: 'xian', abilityPath: 'xian',
        usage: 'unarmed', grant: 'can_perform/shedao-qigong/xian',
        forceSkill: 'force', kind: 'multi_stage', weapon: null, prepared: 'unarmed',
        families: shenlongFamilies, actorFamily: '神龙教',
        title: '神龙再现',
        feeHitMin: 150, feeHitMax: 180, feeMiss: 100,
        hitBusyMin: 2, hitBusyMax: 3, missBusy: 3,
        maxDirects: 1,
        stages: [
            { dpField: 'parry', percentRange: [50, 55] },
        ],
        percentRange: [50, 55], directType: 'REMOTE',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的蛇岛奇功修为有限，不能使用「神龙再现」！\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，无法运用「神龙再现」！\n' },
        ],
    },
    // ---- None 8 ----
    'leiting-fu/sanda': {
        skill: 'leiting-fu', ability: 'sanda', abilityPath: 'sanda',
        usage: 'axe', grant: null,
        forceSkill: 'force', kind: 'multi_stage', weapon: 'axe', prepared: null,
        families: noneFamilies, actorFamily: '侠客盟',
        title: '三板斧',
        feeMin: 165, feeMax: 330,
        hitBusyMin: 3, hitBusyMax: 5, missBusyMin: 3, missBusyMax: 5,
        maxDirects: 3,
        stages: [
            // Baseline only; validation derives count from the actual actor.
            { dpField: 'force', percentRange: [40, 40] },
            { dpField: 'parry', percentRange: [76, 76] },
            { dpField: 'dodge', percentRange: [112, 112] },
        ],
        percentRange: [40, 112], directType: 'WEAPON',
        dpSkills: ['force'],
        strGate: 40,
        gates: [
            { key: 'str', pair: [39, 40], field: 'str',
                refusal: '你现在的臂力不够，目前不能使用「三板斧」！\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「三板斧」！\n' },
            { key: 'axe', pair: [179, 180], field: 'skill', skillName: 'axe',
                refusal: '你的斧法修为不够，不会使用「三板斧」！\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不足！\n' },
        ],
    },
    'daojian-guizhen/daojian': {
        skill: 'daojian-guizhen', ability: 'daojian', abilityPath: 'daojian',
        usage: 'sword', grant: null,
        forceSkill: 'force', kind: 'multi_stage', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '刀剑七重天',
        fee: 300,
        hitBusyMin: 3, hitBusyMax: 5, missBusyMin: 3, missBusyMax: 5,
        maxDirects: 2,
        stages: [
            { dpField: 'force', percentRange: [80, 80] },
        ],
        percentRange: [80, 80], directType: 'WEAPON',
        extraMappings: { blade: 'daojian-guizhen' },
        extraSkills: { blade: 300 },
        dualWeapon: true,
        dpSkills: ['force'],
        noNothingGate: true,
        gates: [
            { key: 'level', pair: [249, 250], field: 'skill',
                refusal: '你的刀剑归真等级不够，难以施展「刀剑七重天」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不够，难以施展「刀剑七重天」。\n' },
        ],
    },
    'jinshe-jian/shi': {
        skill: 'jinshe-jian', ability: 'shi', abilityPath: 'shi',
        usage: 'sword', grant: 'can_perform/jinshe-jian/shi',
        forceSkill: 'force', kind: 'multi_stage', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '金蛇噬天',
        feeHit: 300, feeMiss: 150,
        hitBusyMin: 2, hitBusyMax: 5, missBusy: 2,
        maxDirects: 1,
        stages: [
            { dpField: 'dodge', percentRange: [50, 85] },
        ],
        percentRange: [50, 85], directType: 'WEAPON',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你金蛇剑法不够娴熟，难以施展「金蛇噬天」。\n' },
            { key: 'force', pair: [239, 240], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「金蛇噬天」。\n' },
            { key: 'dodge', pair: [239, 240], field: 'skill', skillName: 'dodge',
                refusal: '你的轻功火候不够，难以施展「金蛇噬天」。\n' },
            { key: 'max-neili', pair: [4499, 4500], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「金蛇噬天」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在的真气不够，难以施展「金蛇噬天」。\n' },
        ],
    },
    'jiuyin-baiguzhao/duo': {
        skill: 'jiuyin-baiguzhao', ability: 'duo', abilityPath: 'duo',
        usage: 'claw', grant: 'can_perform/jiuyin-baiguzhao/duo',
        forceSkill: 'force', kind: 'multi_stage', weapon: null, prepared: 'claw',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '夺命连环爪',
        feeMin: 100, feeMax: 250,
        hitBusyMin: 2, hitBusyMax: 3, missBusyMin: 2, missBusyMax: 3,
        maxDirects: 2,
        stages: [
            { dpField: 'parry', percentRange: [55, 55] },
            { dpField: 'dodge', percentRange: [65, 65] },
        ],
        percentRange: [55, 65], directType: 'UNARMED',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的九阴白骨爪还不够娴熟，不能使用「夺命连环爪」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在内力太弱，不能使用夺命连环爪。\n' },
        ],
    },
    'kuihua-mogong/wswd': {
        skill: 'kuihua-mogong', ability: 'wswd', abilityPath: 'perform/wswd',
        usage: 'sword', grant: 'can_perform/kuihua-mogong/ws',
        forceSkill: 'kuihua-mogong', kind: 'multi_stage', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '无双无对',
        feeMin: 300, feeMax: 500,
        hitBusyMin: 0, hitBusyMax: 2, missBusyMin: 0, missBusyMax: 2,
        maxDirects: 2,
        stages: [
            { dpField: 'parry', percentRange: [80, 80] },
            { dpField: 'parry', percentRange: [100, 100] },
        ],
        percentRange: [80, 100], directType: 'WEAPON',
        extraSkills: { 'kuihua-mogong': 400 },
        extraMappings: { force: 'kuihua-mogong', sword: 'kuihua-mogong' },
        noNothingGate: true,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [399, 400], field: 'skill',
                refusal: '以你目前的修为来看，还不足以运用「无双」\n' },
            { key: 'max-neili', pair: [6999, 7000], field: 'max_neili',
                refusal: '你的内力修为不够运用「无双无对」所需！\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你的内力不够运用「无双」所需！\n' },
        ],
    },
    'sanfen-jianshu/haishi': {
        skill: 'sanfen-jianshu', ability: 'haishi', abilityPath: 'haishi',
        usage: 'sword', grant: 'can_perform/sanfen-jianshu/haishi',
        forceSkill: 'force', kind: 'multi_stage', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '海市蜃楼',
        fee: 150,
        meBusyMin: 1, meBusyMax: 2,
        maxDirects: 2,
        stages: [
            { dpField: 'dodge', percentRange: [70, 70] },
            { dpField: 'dodge', percentRange: [80, 80] },
        ],
        percentRange: [70, 80], directType: 'REMOTE',
        dpSkills: ['dodge'],
        gates: [
            { key: 'sword', pair: [149, 150], field: 'skill', skillName: 'sword',
                refusal: '你的剑术修为不够，目前不能使用「海市蜃楼」！\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的三分剑术的修为不够，不能使用这一绝技！\n' },
            { key: 'dodge', pair: [149, 150], field: 'skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，无法使用「海市蜃楼」！\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够！\n' },
        ],
    },
    'yinsuo-jinling/feng': {
        skill: 'yinsuo-jinling', ability: 'feng', abilityPath: 'feng',
        usage: 'whip', grant: 'can_perform/yinsuo-jinling/feng',
        forceSkill: 'force', kind: 'multi_stage', weapon: 'whip', prepared: null,
        families: noneFamilies, actorFamily: '侠客盟',
        title: '风神诀',
        feeMin: 300, feeMax: 350,
        hitBusyMin: 2, hitBusyMax: 5, missBusyMin: 2, missBusyMax: 5,
        maxDirects: 2,
        stages: [
            { dpField: 'parry', percentRange: [35, 35] },
            { dpField: 'dodge', percentRange: [42, 42] },
        ],
        percentRange: [35, 42], directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的银索金铃不够娴熟，还使不出「风神诀」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「风神诀」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在真气不够，难以施展「风神诀」。\n' },
        ],
    },
    'yujian-shu/yujian': {
        skill: 'yujian-shu', ability: 'yujian', abilityPath: 'yujian',
        usage: 'sword', grant: null,
        forceSkill: 'force', kind: 'multi_stage', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '御剑飞升',
        feeHitMin: 1000, feeHitMax: 1100, feeMissMin: 100, feeMissMax: 200,
        hitBusyMin: 2, hitBusyMax: 5, missBusyMin: 2, missBusyMax: 5,
        maxDirects: 2,
        stages: [
            { dpField: 'force', percentRange: [20, 20] },
        ],
        percentRange: [20, 20], directType: 'WEAPON',
        cooldown: 'jueji/sword/feisheng',
        noNothingGate: true,
        dpSkills: ['force'],
        gates: [
            { key: 'sword', pair: [399, 400], field: 'skill', skillName: 'sword',
                refusal: '你的剑法尚达不到「御剑飞升」的境界。\n' },
            { key: 'force', pair: [399, 400], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候尚达不到「御剑飞升」的境界。\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为太弱，无法灵活的御驾内力。\n' },
            { key: 'neili', pair: [1499, 1500], field: 'neili',
                refusal: '你现在内力不够。\n' },
        ],
    },
    'zhougong-jian/mang': {
        skill: 'zhougong-jian', ability: 'mang', abilityPath: 'mang',
        usage: 'sword', grant: 'can_perform/zhougong-jian/mang',
        forceSkill: 'force', kind: 'multi_stage', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '剑芒',
        fee: 400,
        hitBusyMin: 2, hitBusyMax: 4, missBusyMin: 2, missBusyMax: 4,
        maxDirects: 2,
        stages: [
            { dpField: 'parry', percentRange: [65, 65] },
            { dpField: 'parry', percentRange: [70, 70] },
        ],
        percentRange: [65, 70], directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的周公剑火候太浅，难以施展「剑芒」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为太浅，难以施展「剑芒」。\n' },
            { key: 'max-neili', pair: [2199, 2200], field: 'max_neili',
                refusal: '你的内力修为太浅，难以施展「剑芒」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，，难以施展「剑芒」。\n' },
        ],
    },
};

export const b23Schools = schools;

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

export function b23PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b23SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b23ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b23ReviewedSourceHash,
            'Reviewed B23 sources changed; re-review before sampling');
    const result = [];
    for (const [key, cfg] of Object.entries(schools)) {
        const abilityKey = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const sourceSkill = cfg.sourceSkill ?? cfg.skill;
        const ability = catalog.skills.find(s => s.id === `${sourceSkill}/${abilityKey}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`);
        assert.equal(ability?.path, `kungfu/skill/${sourceSkill}/${abilityKey}.c`);
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
            if (cfg.strGate !== undefined) properties.str = Math.max(properties.str, cfg.strGate);
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
            if (cfg.dualWeapon) {
                actor.equipment = { type: 'sword', hold: false };
                actor.secondary_equipment = { type: 'blade', hold: true };
            }
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
                id: `b23-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b23', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b23-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b23SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}多段直伤：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '多段直伤按原分支记账，各段独立判定。'
                        + '只收集数据，不比较强弱。',
                },
            });
        }
        const primary = cfg.gates[0];
        add(`baseline-l${level}`, { samples: smoke ? 2 : samples });
        for (const gate of cfg.gates.filter(g => g.key === primary.key)) {
            const [low, high] = gate.pair;
            add(`gate-${gate.key}-${low}`, { ...gateEdit(cfg, gate, low, true),
                refusal: gate.refusal, samples: 2 });
            add(`gate-${gate.key}-${high}`, { ...gateEdit(cfg, gate, high, false), samples: 2 });
        }
        if (cfg.dpSkills && cfg.dpSkills.length) {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
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

export function validateB23Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B23 entry');
    assert.equal(p.collection_group, 'b23-perform');
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
    return validateB23MultiStage(raw, condition, cfg, p, b, t, a, v);
}

function validateB23MultiStage(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const n = directs.length;
    assert.ok(n <= cfg.maxDirects, 'multi_stage direct bound');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
        assert.ok(Number.isSafeInteger(d.damage) && d.damage > 0, 'positive damage input');
    }
    const fee = b.neili - a.neili;
    if (cfg.feeMin !== undefined)
        assert.ok(fee >= cfg.feeMin && fee <= (cfg.feeMax ?? cfg.feeMin), 'multi_stage fee range');
    else if (cfg.feeHitMin !== undefined) {
        const hit = n > 0;
        if (hit) assert.ok(fee >= cfg.feeHitMin && fee <= (cfg.feeHitMax ?? cfg.feeHitMin),
            'multi_stage hit fee range');
        else if (cfg.feeMissMin !== undefined)
            assert.ok(fee >= cfg.feeMissMin && fee <= (cfg.feeMissMax ?? cfg.feeMissMin),
                'multi_stage miss fee range');
        else assert.equal(fee, cfg.feeMiss ?? 0, 'multi_stage miss fee');
    } else if (cfg.fee !== undefined)
        assert.equal(fee, cfg.fee, 'multi_stage fixed fee');
    else {
        const hit = n > 0;
        const expected = hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        assert.equal(fee, expected, 'multi_stage branch fee');
    }
    assert.equal(sparse(raw.metrics[0], 'direct'), n, 'direct count');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const busyAfter = num(a.busy);
    if (cfg.meBusy !== undefined) assert.equal(busyAfter, cfg.meBusy, 'fixed me busy');
    else if (cfg.meBusyMin !== undefined) {
        assert.ok(busyAfter >= cfg.meBusyMin && busyAfter <= (cfg.meBusyMax ?? cfg.meBusyMin),
            'multi_stage me busy range');
    } else {
        const hit = n > 0;
        const busyMin = hit ? (cfg.hitBusyMin ?? cfg.hitBusy ?? 0)
            : (cfg.missBusyMin ?? cfg.missBusy ?? cfg.hitBusyMin ?? 0);
        const busyMax = hit ? (cfg.hitBusyMax ?? cfg.hitBusy ?? 0)
            : (cfg.missBusyMax ?? cfg.missBusy ?? cfg.hitBusyMax ?? 0);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'multi_stage busy range');
    }
    // Compose each actually recorded do_damage call, rather than merely
    // checking that its formula has a nonempty support set. A missed earlier
    // stage need not occupy a directs slot, so validate percent against the
    // configured overall range instead of assuming slot == stage number.
    let states = [{ qi: t.qi, eff_qi: t.eff_qi }];
    let [lo, hi] = cfg.percentRange;
    const damageActor = copy(b);
    if (cfg.skill === 'liuhe-bian' && n > 0) {
        damageActor.temp.apply.damage = (damageActor.temp.apply.damage ?? 0)
            + Math.trunc(b.skills['liuhe-bian'] / 3);
    }
    const typeNames = ['UNARMED', 'WEAPON', 'REMOTE'];
    let stageRanges = cfg.skill === 'six-finger' && cfg.ability === 'zong'
        ? [[30, 30], [30, 30], [40, 40], [40, 40], [60, 60], [60, 60]]
        : cfg.stages.length === 1
            ? Array.from({ length: cfg.maxDirects }, () => cfg.stages[0].percentRange)
            : cfg.stages.map(s => s.percentRange);
    if (cfg.skill === 'leiting-fu') {
        const reborn = p.actor.properties['reborn/count'] ?? 0;
        const first = b.effective_str - reborn * 20;
        const second = first + b.dex - reborn * 20;
        const third = second + b.con - reborn * 20;
        stageRanges = [[first, first], [second, second], [third, third]];
        lo = Math.min(first, second, third); hi = Math.max(first, second, third);
    }
    let nextStage = 0;
    for (const [i, d] of directs.entries()) {
        const type = cfg.skill === 'sanfen-jianshu'
            ? ['REMOTE', 'WEAPON'][i] : cfg.directType;
        assert.equal(typeNames[d.type], type, 'actual direct attack type');
        assert.ok(Number.isSafeInteger(d.percent) && d.percent >= lo && d.percent <= hi,
            'recorded damage percent support');
        while (nextStage < stageRanges.length && !(d.percent >= stageRanges[nextStage][0]
            && d.percent <= stageRanges[nextStage][1])) nextStage++;
        assert.ok(nextStage < stageRanges.length, 'recorded percent must follow possible source stages');
        nextStage++;
        const next = new Map();
        for (const state of states) {
            for (const out of slice2SupportSet(d.damage, d.percent, damageActor,
                { ...t, ...state }, type)) {
                next.set(`${out.qi}/${out.eff_qi}`, { qi: out.qi, eff_qi: out.eff_qi });
            }
        }
        states = [...next.values()];
    }
    const qiRecovery = sparse(raw.metrics[1], 'qi_recovery');
    const woundRecovery = sparse(raw.metrics[1], 'eff_qi_recovery');
    assert.ok(states.some(s => s.qi + qiRecovery === v.qi
        && s.eff_qi + woundRecovery === v.eff_qi),
    'multi_stage resulting health must lie in sequential do_damage support');
    assertLearnGain(a, p.skill);
    const spent = b.neili - a.neili;
    stableState(b, a, e => {
        e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
        e.temp = copy(a.temp ?? {});
        delete e.temp.notify_fail;
        for (const k of ['weapon', 'weapon_damage', 'weapon_flag', 'handing', 'ammunition',
            'weapon_details', 'handing_details', 'secondary_weapon', 'secondary_weapon_details'])
            if (a[k] !== undefined) e[k] = copy(a[k]);
            else delete e[k];
        if (e.weapon_details) e.weapon_details.consistence = 0;
        if (e.handing_details && Object.keys(e.handing_details).length)
            e.handing_details.consistence = 0;
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        e.temp = copy(v.temp ?? {});
        delete e.temp.notify_fail;
        for (const k of ['weapon', 'weapon_damage', 'weapon_flag', 'handing', 'ammunition',
            'weapon_details', 'handing_details', 'secondary_weapon', 'secondary_weapon_details'])
            if (v[k] !== undefined) e[k] = copy(v[k]);
            else delete e[k];
        if (e.weapon_details) e.weapon_details.consistence = 0;
        if (e.handing_details && Object.keys(e.handing_details).length)
            e.handing_details.consistence = 0;
        if (num(v.ghost) === 1 || num(v.living) === 0) {
            for (const k of Object.keys(v)) {
                if (k === 'temp') continue;
                e[k] = copy(v[k]);
            }
            if (e.weapon_details) e.weapon_details.consistence = 0;
            if (e.handing_details && Object.keys(e.handing_details).length)
                e.handing_details.consistence = 0;
        }
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'multi_stage', hit: n > 0, hits: n };
}

export function b23Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB23Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
