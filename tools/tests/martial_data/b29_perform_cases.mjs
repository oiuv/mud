// B29 no-grant public/quest perform batch (55).
// 55 declarations: 47 generated entries, 6 pending fixtures and 2 unreachable dispatch paths.
// Public/quest skills with no formal school assignment (侠客盟 ledger).
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

const publicFamilies = ['侠客盟'];

export const b29SourcePaths = [
    'kungfu/skill/bluesea-force.c',
    'kungfu/skill/lonely-sword.c',
    'kungfu/skill/six-finger.c',
    'kungfu/skill/jinshe-jian.c',
    'kungfu/skill/jinshe-zhang.c',
    'kungfu/skill/jinshe-zhui.c',
    'kungfu/skill/yunu-sword.c',
    'kungfu/skill/yunv-jian.c',
    'kungfu/skill/yujian-shu.c',
    'kungfu/skill/xuanyuan-arrow.c',
    'kungfu/skill/shenzhaojing.c',
    'kungfu/skill/zhongping-qiang.c',
    'kungfu/skill/dugu-jiujian.c',
    'kungfu/skill/kuihua-mogong.c',
    'kungfu/skill/jiuyang-shengong.c',
    'kungfu/skill/taixuan-gong.c',
    'kungfu/skill/hamagong.c',
    'kungfu/skill/qiankun-danuoyi.c',
    'kungfu/skill/xiaoli-feidao.c',
    'kungfu/skill/five-avoid.c',
    'kungfu/skill/jingang-buhuaiti.c',
    'kungfu/skill/ningxue-shenzhao.c',
    'kungfu/skill/qiankun-jian.c',
    'kungfu/skill/bluesea-force/perform/bo.c',
    'kungfu/skill/bluesea-force/perform/jue.c',
    'kungfu/skill/bluesea-force/perform/lu.c',
    'kungfu/skill/bluesea-force/perform/mie.c',
    'kungfu/skill/bluesea-force/perform/xuan.c',
    'kungfu/skill/bluesea-force/perform/zhan.c',
    'kungfu/skill/bluesea-force/perform/zhu.c',
    'kungfu/skill/lonely-sword/jue.c',
    'kungfu/skill/lonely-sword/po.c',
    'kungfu/skill/lonely-sword/yi.c',
    'kungfu/skill/six-finger/qi.c',
    'kungfu/skill/six-finger/six.c',
    'kungfu/skill/six-finger/zong.c',
    'kungfu/skill/six-finger/zongheng.c',
    'kungfu/skill/jinshe-jian/kun.c',
    'kungfu/skill/jinshe-jian/shi.c',
    'kungfu/skill/jinshe-jian/wan.c',
    'kungfu/skill/jinshe-zhang/fugu.c',
    'kungfu/skill/jinshe-zhui/feng.c',
    'kungfu/skill/jinshe-zhui/tuwu.c',
    'kungfu/skill/yunu-sword/wushuang.c',
    'kungfu/skill/yunv-jian/mei.c',
    'kungfu/skill/yujian-shu/yujian.c',
    'kungfu/skill/xuanyuan-arrow/baibu.c',
    'kungfu/skill/shenzhaojing/perform/wu.c',
    'kungfu/skill/shenzhaojing/perform/ying.c',
    'kungfu/skill/zhongping-qiang/ding.c',
    'kungfu/skill/dugu-jiujian/jue.c',
    'kungfu/skill/dugu-jiujian/po.c',
    'kungfu/skill/dugu-jiujian/qi.c',
    'kungfu/skill/dugu-jiujian/yi.c',
    'kungfu/skill/kuihua-mogong/perform/bian.c',
    'kungfu/skill/kuihua-mogong/perform/qiong.c',
    'kungfu/skill/kuihua-mogong/perform/sheng.c',
    'kungfu/skill/kuihua-mogong/perform/tian.c',
    'kungfu/skill/kuihua-mogong/perform/wswd.c',
    'kungfu/skill/jiuyang-shengong/perform/hun.c',
    'kungfu/skill/jiuyang-shengong/perform/jiu.c',
    'kungfu/skill/jiuyang-shengong/perform/pi.c',
    'kungfu/skill/jiuyang-shengong/perform/po.c',
    'kungfu/skill/jiuyang-shengong/perform/ri.c',
    'kungfu/skill/taixuan-gong/perform/hun.c',
    'kungfu/skill/taixuan-gong/perform/jing.c',
    'kungfu/skill/taixuan-gong/perform/po.c',
    'kungfu/skill/taixuan-gong/perform/xuan.c',
    'kungfu/skill/taixuan-gong/xuan.c',
    'kungfu/skill/hamagong/perform/zhen.c',
    'kungfu/skill/qiankun-danuoyi/nuoyi.c',
    'kungfu/skill/xiaoli-feidao/fei.c',
    'kungfu/skill/five-avoid/break.c',
    'kungfu/skill/jingang-buhuaiti/jingang.c',
    'kungfu/skill/ningxue-shenzhao/ji.c',
    'kungfu/skill/qiankun-jian/ni.c',
    'kungfu/skill/qiankun-jian/qian.c',
    'kungfu/skill/qiankun-jian/riyue.c',
    'kungfu/skill/sword.c',
    'kungfu/skill/blade.c',
    'kungfu/skill/strike.c',
    'kungfu/skill/hand.c',
    'kungfu/skill/cuff.c',
    'kungfu/skill/staff.c',
    'kungfu/skill/whip.c',
    'kungfu/skill/claw.c',
    'kungfu/skill/finger.c',
    'kungfu/skill/unarmed.c',
    'kungfu/skill/throwing.c',
    'kungfu/skill/dodge.c',
    'kungfu/skill/force.c',
    'kungfu/skill/parry.c',
    'kungfu/skill/club.c',
    'kungfu/skill/axe.c',
    'kungfu/skill/dagger.c',
    'kungfu/skill/spear.lpc',
    'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c',
    'inherit/skill/skill.c',
    'inherit/skill/force.c',
    'feature/skill.c',
    'feature/attack.c',
    'feature/damage.c',
    'feature/attribute.c',
    'feature/condition.c',
    'feature/action.c',
    'mudcore/inherit/action.c',
    'feature/dbase.c',
    'mudcore/inherit/dbase.c',
    'feature/equip.c',
    'feature/name.c',
    'feature/sserver.c',
    'feature/team.c',
    'clone/user/user.c',
    'inherit/char/char.c',
    'adm/daemons/combatd.c',
    'adm/single/simul_efun/message.c',
    'include/globals.h',
    'include/combat.h',
    'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const b29ReviewedSourceHash = 'PENDING';

const schools = {
    'bluesea-force/bo': {
        skill: "bluesea-force",
        ability: "bo",
        abilityPath: "perform/bo",
        usage: "strike",
        grant: null,
        forceSkill: "force",
        kind: "control",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "南海玄功「碧海清波」",
        fee: 0,
        hitBusy: 0,
        missBusy: 1,
        targetBusy: {"div":45,"add":2,"useAp":true},
        apSkills: [["bluesea-force",1.5],["martial-cognize",1]],
        dpSkills: [["parry",1],["martial-cognize",1]],
        gates: [
            { key: "level", pair: [99,100], field: "skill", refusal: "你的南海玄功不够深厚，不会使用碧海清波。\n" },
        ],
    },
    'bluesea-force/jue': {
        skill: "bluesea-force",
        ability: "jue",
        abilityPath: "perform/jue",
        usage: "strike",
        grant: null,
        forceSkill: "force",
        kind: "direct",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "南海玄功「绝仙决」",
        feeHit: 125,
        feeMiss: 50,
        hitBusy: 2,
        missBusy: 2,
        hitFormula: "ap-dp",
        apSkills: [["bluesea-force",1.5],["con",20],["martial-cognize",1]],
        dpSkills: [["parry",1],["dex",20],["martial-cognize",1]],
        directType: "UNARMED",
        gates: [
            { key: "level", pair: [119,120], field: "skill", refusal: "你的南海玄功还不够娴熟，不能使用绝仙决！\n" },
            { key: "neili", pair: [199,200], field: "neili", refusal: "你的内力不够，不能使用绝仙决！\n" },
        ],
    },
    'bluesea-force/lu': {
        skill: "bluesea-force",
        ability: "lu",
        abilityPath: "perform/lu",
        usage: "strike",
        grant: null,
        forceSkill: "force",
        kind: "direct",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "南海玄功「戮仙决」",
        feeHit: 125,
        feeMiss: 50,
        hitBusy: 2,
        missBusy: 2,
        hitFormula: "ap-dp",
        apSkills: [["bluesea-force",1.5],["con",20],["martial-cognize",1]],
        dpSkills: [["parry",1],["con",20],["martial-cognize",1]],
        directType: "UNARMED",
        gates: [
            { key: "level", pair: [119,120], field: "skill", refusal: "你的南海玄功还不够娴熟，不能使用戮仙决！\n" },
            { key: "neili", pair: [199,200], field: "neili", refusal: "你的内力不够，不能使用戮仙决！\n" },
        ],
    },
    'bluesea-force/mie': {
        skill: "bluesea-force",
        ability: "mie",
        abilityPath: "perform/mie",
        usage: "strike",
        grant: null,
        forceSkill: "force",
        kind: "instant_death",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "南海玄功「五阴焚灭」",
        fee: 60,
        hitBusyMin: 1,
        hitBusyMax: 2,
        missBusyMin: 1,
        missBusyMax: 2,
        instantDeathFormula: "exp",
        expDiv: 10000,
        gates: [
            { key: "level", pair: [149,150], field: "skill", refusal: "你的南海玄功还不够娴熟，不能使用五阴焚灭！\n" },
            { key: "neili", pair: [299,300], field: "neili", refusal: "你的真气不够！\n" },
        ],
    },
    'bluesea-force/xuan': {
        skill: "bluesea-force",
        ability: "xuan",
        abilityPath: "perform/xuan",
        usage: "strike",
        grant: null,
        forceSkill: "force",
        kind: "combo",
        weapon: null,
        prepared: "strike",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "南海玄功「玄黄连环掌」",
        feePerAttack: 20,
        comboAttacksMin: 5,
        comboAttacksMax: 9,
        comboBusyMin: 1,
        comboBusyMax: 7,
        gates: [
            { key: "neili", pair: [199,200], field: "neili", refusal: "你的真气不够，无法施展玄黄连环掌！\n" },
            { key: "level", pair: [149,150], field: "skill", refusal: "你的南海玄功火候不够，无法施展玄黄连环掌！\n" },
        ],
    },
    'bluesea-force/zhan': {
        skill: "bluesea-force",
        ability: "zhan",
        abilityPath: "perform/zhan",
        usage: "strike",
        grant: null,
        forceSkill: "force",
        kind: "direct",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "南海玄功「斩仙决」",
        feeHit: 125,
        feeMiss: 50,
        hitBusy: 2,
        missBusy: 2,
        hitFormula: "ap-dp",
        apSkills: [["bluesea-force",1.5],["con",20],["martial-cognize",1]],
        dpSkills: [["parry",1],["str",20],["martial-cognize",1]],
        directType: "UNARMED",
        gates: [
            { key: "level", pair: [119,120], field: "skill", refusal: "你的南海玄功还不够娴熟，不能使用斩仙决！\n" },
            { key: "neili", pair: [199,200], field: "neili", refusal: "你的内力不够，不能使用斩仙决！\n" },
        ],
    },
    'bluesea-force/zhu': {
        skill: "bluesea-force",
        ability: "zhu",
        abilityPath: "perform/zhu",
        usage: "strike",
        grant: null,
        forceSkill: "force",
        kind: "direct",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "南海玄功「诛仙决」",
        feeHit: 125,
        feeMiss: 50,
        hitBusy: 2,
        missBusy: 2,
        hitFormula: "ap-dp",
        apSkills: [["bluesea-force",1.5],["con",20],["martial-cognize",1]],
        dpSkills: [["parry",1],["int",20],["martial-cognize",1]],
        directType: "UNARMED",
        gates: [
            { key: "level", pair: [119,120], field: "skill", refusal: "你的南海玄功还不够娴熟，不能使用诛仙决！\n" },
            { key: "neili", pair: [199,200], field: "neili", refusal: "你的内力不够，不能使用诛仙决！\n" },
        ],
    },
    'lonely-sword/po': {
        skill: "lonely-sword",
        ability: "po",
        abilityPath: "po",
        usage: "sword",
        grant: "can_perform/lonely-sword/po",
        forceSkill: "force",
        kind: "special",
        weapon: "sword",
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "独孤九剑「破字诀」",
        fee: 0,
        specialKind: "combo_disarm",
        comboAttacksMin: 3,
        comboAttacksMax: 7,
        comboBusyMin: 1,
        comboBusyMax: 8,
        noComboBusyMin: 1,
        noComboBusyMax: 4,
        gates: [
            { key: "level", pair: [49,50], field: "skill", refusal: "你的独孤九剑等级不够，练好了再来！\n" },
        ],
    },
    'lonely-sword/yi': {
        skill: "lonely-sword",
        ability: "yi",
        abilityPath: "yi",
        usage: "sword",
        grant: null,
        forceSkill: "force",
        kind: "direct",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "独孤九剑「剑意」",
        feeHit: 180,
        feeMiss: 60,
        hitBusy: 2,
        missBusy: 3,
        hitFormula: "ap-dp",
        apSkills: [["sword",1]],
        dpSkills: [["parry",1],["martial-cognize",1],["lonely-sword",1]],
        directType: "WEAPON",
        gates: [
            { key: "neili", pair: [199,200], field: "neili", refusal: "你现在的真气不够，无法使用剑意！\n" },
            { key: "level", pair: [119,120], field: "skill", refusal: "你的独孤九剑还不到家，无法使用剑意！\n" },
        ],
    },
    'six-finger/qi': {
        skill: "six-finger",
        ability: "qi",
        abilityPath: "qi",
        usage: "finger",
        grant: "can_perform/liumai-shenjian/qi",
        forceSkill: "force",
        kind: "special",
        weapon: null,
        prepared: "finger",
        preparedSkill: "liumai-shenjian",
        extraSkills: { "liumai-shenjian": 300 },
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "六脉神剑「无形剑气」",
        feeHit: 400,
        feeMiss: 0,
        hitBusy: 3,
        missBusy: 3,
        specialKind: "weapon_break",
        hitFormula: "ap-dp",
        apSkills: [["finger",1]],
        dpSkills: [["force",1]],
        directType: "UNARMED",
        gates: [
            { key: "force", pair: [419,420], field: "effective-skill", skillName: "force", refusal: "你的内功火候不够，使不出「无形剑气」。\n" },
            { key: "max-neili", pair: [4999,5000], field: "max_neili", refusal: "你的内力修为还不足以使出如此犀利的「无形剑气」。\n" },
            { key: "neili", pair: [499,500], field: "neili", refusal: "你的真气不够，无法使用「无形剑气」。\n" },
            { key: "level", pair: [199,200], field: "skill", skillName: "liumai-shenjian", refusal: "你的六脉神剑修为有限，无法使用「无形剑气」！\n" },
        ],
    },
    'six-finger/six': {
        skill: "six-finger",
        ability: "six",
        abilityPath: "six",
        usage: "finger",
        grant: "can_perform/liumai-shenjian/six",
        forceSkill: "force",
        kind: "multi_stage",
        weapon: null,
        prepared: "finger",
        preparedSkill: "liumai-shenjian",
        extraSkills: { "liumai-shenjian": 300 },
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "六脉神剑「六脉剑气」",
        fee: 400,
        stages: 6,
        stageFee: 0,
        busyMin: 1,
        busyMax: 5,
        hitFormula: "ap-dp",
        apSkills: [["finger",1]],
        dpSkills: [["force",1]],
        directType: "UNARMED",
        gates: [
            { key: "level", pair: [219,220], field: "skill", skillName: "liumai-shenjian", refusal: "你的六脉神剑修为有限，无法使用「六脉剑气」！\n" },
            { key: "force", pair: [399,400], field: "effective-skill", skillName: "force", refusal: "你的内功火候不够，难以施展「六脉剑气」！\n" },
            { key: "max-neili", pair: [6999,7000], field: "max_neili", refusal: "你的内力修为没有达到那个境界，无法运转内力形成「六脉剑气」！\n" },
            { key: "neili", pair: [499,500], field: "neili", refusal: "你的真气不够，现在无法施展「六脉剑气」！\n" },
        ],
    },
    'six-finger/zong': {
        skill: "six-finger",
        ability: "zong",
        abilityPath: "zong",
        usage: "finger",
        grant: "can_perform/liumai-shenjian/zong",
        forceSkill: "force",
        kind: "multi_stage",
        weapon: null,
        prepared: "finger",
        preparedSkill: "liumai-shenjian",
        extraSkills: { "liumai-shenjian": 300 },
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "六脉神剑「万剑纵横」",
        fee: 800,
        stages: 6,
        stageFee: 0,
        busyMin: 3,
        busyMax: 6,
        hitFormula: "ap-dp",
        apSkills: [["liumai-shenjian",1],["martial-cognize",1]],
        dpSkills: [["parry",1],["martial-cognize",1]],
        directType: "UNARMED",
        gates: [
            { key: "level", pair: [259,260], field: "skill", skillName: "liumai-shenjian", refusal: "你的六脉神剑修为有限，无法使用「万剑纵横」！\n" },
            { key: "force", pair: [479,480], field: "effective-skill", skillName: "force", refusal: "你的内功火候不够，难以施展「万剑纵横」！\n" },
            { key: "max-neili", pair: [8499,8500], field: "max_neili", refusal: "你的内力修为不够,无法施展「万剑纵横」！\n" },
            { key: "neili", pair: [999,1000], field: "neili", refusal: "你的真气不够，现在无法施展「万剑纵横」！\n" },
        ],
    },
    'jinshe-jian/kun': {
        skill: "jinshe-jian",
        ability: "kun",
        abilityPath: "kun",
        usage: "sword",
        grant: "can_perform/jinshe-jian/kun",
        forceSkill: "force",
        kind: "control",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "金蛇剑法「蛇困愁城」", targetBusyRefusal: "右试弟子目前正自顾不暇，放胆攻击吧。\n",
        fee: 140,
        hitBusy: 1,
        missBusy: 2,
        targetBusy: {"randomBase":1,"randomDiv":13,"useSkill":"jinshe-jian"},
        gates: [
            { key: "level", pair: [139,140], field: "skill", refusal: "你金蛇剑法不够娴熟，难以施展「蛇困愁城」。\n" },
            { key: "neili", pair: [199,200], field: "neili", refusal: "你现在的真气不够，难以施展「蛇困愁城」。\n" },
        ],
    },
    'jinshe-jian/shi': {
        skill: "jinshe-jian",
        ability: "shi",
        abilityPath: "shi",
        usage: "sword",
        grant: "can_perform/jinshe-jian/shi",
        forceSkill: "force",
        kind: "direct",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "金蛇剑法「金蛇噬天」",
        feeHit: 300,
        feeMiss: 150,
        hitBusyMin: 2,
        hitBusyMax: 4,
        missBusy: 2,
        hitFormula: "ap-dp",
        apSkills: [["jinshe-jian",1],["martial-cognize",1]],
        dpSkills: [["dodge",1],["martial-cognize",1]],
        directType: "WEAPON",
        gates: [
            { key: "level", pair: [199,200], field: "skill", refusal: "你金蛇剑法不够娴熟，难以施展「金蛇噬天」。\n" },
            { key: "force", pair: [239,240], field: "effective-skill", skillName: "force", refusal: "你的内功火候不够，难以施展「金蛇噬天」。\n" },
            { key: "dodge", pair: [239,240], field: "dodge", refusal: "你的轻功火候不够，难以施展「金蛇噬天」。\n" },
            { key: "max-neili", pair: [4499,4500], field: "max_neili", refusal: "你的内力修为不足，难以施展「金蛇噬天」。\n" },
            { key: "neili", pair: [399,400], field: "neili", refusal: "你现在的真气不够，难以施展「金蛇噬天」。\n" },
        ],
    },
    'jinshe-jian/wan': {
        skill: "jinshe-jian",
        ability: "wan",
        abilityPath: "wan",
        usage: "sword",
        grant: "can_perform/jinshe-jian/wan",
        forceSkill: "force",
        kind: "multi_stage",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "金蛇剑法「蛇影万道」",
        fee: 120,
        stages: 4,
        stageFee: 0,
        busyMin: 1,
        busyMax: 4,
        hitFormula: "ap-dp",
        apSkills: [["sword",1]],
        dpSkills: [["dodge",1]],
        directType: "WEAPON",
        gates: [
            { key: "level", pair: [179,180], field: "skill", refusal: "你的金蛇剑法不够娴熟，难以施展「蛇影万道」。\n" },
            { key: "neili", pair: [259,260], field: "neili", refusal: "你现在的真气不够，难以施展「蛇影万道」。\n" },
        ],
    },
    'jinshe-zhang/fugu': {
        skill: "jinshe-zhang",
        ability: "fugu",
        abilityPath: "fugu",
        usage: "strike",
        grant: null,
        forceSkill: "force",
        kind: "special",
        weapon: null,
        prepared: "strike",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "金蛇掌「附骨缠身」",
        feeHit: 150,
        feeMiss: 0,
        specialKind: "combo_disarm",
        comboAttacksMin: 3,
        comboAttacksMax: 3,
        comboBusyMin: 2,
        comboBusyMax: 2,
        noComboBusyMin: 2,
        noComboBusyMax: 2,
        gates: [
            { key: "level", pair: [99,100], field: "skill", refusal: "你的金蛇掌不够娴熟，不会使用附骨缠身。\n" },
            { key: "neili", pair: [299,300], field: "neili", refusal: "你现在内力太弱，不能使用附骨缠身。\n" },
        ],
    },
    'jinshe-zhui/feng': {
        skill: "jinshe-zhui",
        ability: "feng",
        abilityPath: "feng",
        usage: "throwing",
        grant: null,
        forceSkill: "force",
        kind: "special",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "金蛇锥法「截脉封穴」",
        feeHit: 200,
        feeMiss: 50,
        hitBusy: 1,
        missBusy: 3,
        specialKind: "debuff",
        hitFormula: "ap-dp",
        apSkills: [["throwing",1]],
        dpSkills: [["force",1]],
        gates: [
            { key: "force", pair: [149,150], field: "effective-skill", skillName: "force", refusal: "你的内功的修为不够，难以施展「截脉封穴」。\n" },
            { key: "level", pair: [99,100], field: "skill", refusal: "你的金蛇锥法修为有限，难以施展「截脉封穴」。\n" },
            { key: "neili", pair: [499,500], field: "neili", refusal: "你现在的真气不足，难以施展「截脉封穴」。\n" },
        ],
    },
    'yunu-sword/wushuang': {
        skill: "yunu-sword",
        ability: "wushuang",
        abilityPath: "wushuang",
        usage: "sword",
        grant: null,
        forceSkill: "force",
        kind: "direct",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "玉女金针十三剑「无双无对」",
        feeHit: 250,
        feeMiss: 0,
        hitBusy: 2,
        missBusy: 3,
        hitFormula: "ap-dp",
        apSkills: [["sword",1]],
        dpSkills: [["parry",1]],
        directType: "WEAPON",
        gates: [
            { key: "level", pair: [79,80], field: "skill", refusal: "你的玉女金针十三剑不够娴熟，不会使用「无双无对」。\n" },
            { key: "force", pair: [119,120], field: "effective-skill", skillName: "force", refusal: "你的内功不够娴熟，不会使用「无双无对」。\n" },
            { key: "neili", pair: [299,300], field: "neili", refusal: "你的内力不够。\n" },
        ],
    },
    'yunv-jian/mei': {
        skill: "yunv-jian",
        ability: "mei",
        abilityPath: "mei",
        usage: "sword",
        grant: "can_perform/yunv-jian/mei",
        forceSkill: "force",
        kind: "control",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "玉女剑法「千姿百媚」", skipTargetBusy: true,
        fee: 50,
        hitBusyMin: 0,
        hitBusyMax: 1,
        missBusy: 2,
        targetBusy: {"randomBase":2,"randomDiv":24,"useSkill":"yunv-jian"},
        gates: [
            { key: "level", pair: [39,40], field: "skill", refusal: "你玉女剑法不够娴熟，难以施展「千姿百媚」。\n" },
            { key: "dodge", pair: [59,60], field: "dodge", refusal: "你的轻功修为不够，难以施展「千姿百媚」。\n" },
            { key: "neili", pair: [59,60], field: "neili", refusal: "你现在的真气不够，难以施展「千姿百媚」。\n" },
        ],
    },
    'shenzhaojing/wu': {
        skill: "shenzhaojing",
        ability: "wu",
        abilityPath: "perform/wu",
        // shenzhaojing valid_enable() only accepts "force", so the perform's
        // query_skill_mapped("unarmed") == "shenzhaojing" precondition can never
        // hold. Dispatch through the force slot (the only effective mapping) and
        // record the perform's own permanent refusal; gates stay documented below
        // but are unreachable behind that earlier check.
        usage: "force",
        grant: null,
        forceSkill: "force",
        kind: "multi_stage",
        weapon: null,
        prepared: "unarmed",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "神照经「无影拳舞」",
        fee: 200,
        stages: 6,
        stageFee: 0,
        busyMin: 1,
        busyMax: 5,
        hitFormula: "ap-dp",
        apSkills: [["force",1],["con",10]],
        dpSkills: [["dodge",1],["dex",10]],
        directType: "UNARMED",
        alwaysRefusal: "你没有激发神照经神功为拳脚，无法施展「无影拳舞」。\n",
        gates: [
            { key: "level", pair: [199,200], field: "skill", refusal: "你的神照经神功火候不够，无法施展「无影拳舞」。\n" },
            { key: "unarmed", pair: [199,200], field: "skill", skillName: "unarmed", refusal: "你的基本拳脚火候不够，无法施展「无影拳舞」。\n" },
            { key: "max-neili", pair: [4999,5000], field: "max_neili", refusal: "你的内力修为不足，无法施展「无影拳舞」。\n" },
            { key: "neili", pair: [499,500], field: "neili", refusal: "你的真气不够，无法施展「无影拳舞」。\n" },
        ],
    },
    'shenzhaojing/ying': {
        skill: "shenzhaojing",
        ability: "ying",
        abilityPath: "perform/ying",
        // Same unreachable unarmed-mapping precondition as shenzhaojing/wu.
        usage: "force",
        grant: null,
        forceSkill: "force",
        kind: "direct",
        weapon: null,
        prepared: "unarmed",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "神照经「无影神拳」",
        feeHit: 400,
        feeMiss: 0,
        hitBusy: 3,
        missBusy: 3,
        hitFormula: "ap-dp",
        apSkills: [["force",1],["con",5]],
        dpSkills: [["force",1],["con",5]],
        directType: "UNARMED",
        alwaysRefusal: "你没有激发神照经神功为拳脚，无法施展「无影神拳」。\n",
        gates: [
            { key: "level", pair: [199,200], field: "skill", refusal: "你的神照经神功火候不够，无法施展「无影神拳」。\n" },
            { key: "unarmed", pair: [199,200], field: "skill", skillName: "unarmed", refusal: "你的基本拳脚火候不够，无法施展「无影神拳」。\n" },
            { key: "max-neili", pair: [4999,5000], field: "max_neili", refusal: "你的内力修为不足，无法施展「无影神拳」。\n" },
            { key: "neili", pair: [499,500], field: "neili", refusal: "你的真气不够，无法施展「无影神拳」。\n" },
        ],
    },
    'zhongping-qiang/ding': {
        skill: "zhongping-qiang",
        ability: "ding",
        abilityPath: "ding",
        usage: "spear",
        grant: "can_perform/zhongping-qiang/ding",
        forceSkill: "force",
        kind: "multi_stage",
        weapon: "spear",
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "中平枪法「定岳七方」",
        fee: 140,
        stages: 7,
        stageFee: 0,
        busyMin: 1,
        busyMax: 7,
        hitFormula: "ap-dp",
        apSkills: [["spear",1]],
        dpSkills: [["parry",1]],
        directType: "WEAPON",
        gates: [
            { key: "level", pair: [119,120], field: "skill", refusal: "你中平枪法不够娴熟，难以施展「定岳七方」。\n" },
            { key: "force", pair: [179,180], field: "effective-skill", skillName: "force", refusal: "你的内功火候不够，难以施展「定岳七方」。\n" },
            { key: "max-neili", pair: [1999,2000], field: "max_neili", refusal: "你的内力修为不够，难以施展「定岳七方」。\n" },
            { key: "neili", pair: [199,200], field: "neili", refusal: "你现在的真气不够，难以施展「定岳七方」。\n" },
        ],
    },
    'dugu-jiujian/po': {
        skill: "dugu-jiujian",
        ability: "po",
        abilityPath: "po",
        usage: "sword",
        grant: "can_perform/dugu/po",
        grantValue: 100,
        forceSkill: "force",
        kind: "special",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "独孤九剑「总破式」",
        fee: 0,
        specialKind: "combo_disarm",
        comboAttacksMin: 7,
        comboAttacksMax: 13,
        comboBusyMin: 1,
        comboBusyMax: 14,
        noComboBusyMin: 1,
        noComboBusyMax: 4,
        gates: [
            { key: "level", pair: [149,150], field: "skill", refusal: "你的独孤九剑等级不够，无法施展「总破式」。\n" },
        ],
    },
    'dugu-jiujian/qi': {
        skill: "dugu-jiujian",
        ability: "qi",
        abilityPath: "qi",
        usage: "sword",
        grant: "can_perform/dugu/qi",
        grantValue: 100,
        forceSkill: "force",
        kind: "direct",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "独孤九剑「破气式」",
        feeHit: 0,
        feeMiss: 0,
        hitBusy: 3,
        missBusy: 4,
        hitFormula: "ap-dp",
        apSkills: [["sword",1],["parry",1]],
        dpSkills: [["force",1],["parry",1]],
        directType: "WEAPON",
        targetMarker: "no_exert",
        gates: [
            { key: "level", pair: [119,120], field: "skill", refusal: "你独孤九剑等级不够，无法施展「破气式」。\n" },
        ],
    },
    'dugu-jiujian/yi': {
        skill: "dugu-jiujian",
        ability: "yi",
        abilityPath: "yi",
        usage: "sword",
        grant: null,
        forceSkill: "force",
        kind: "direct",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "独孤九剑「弘意式」",
        feeHit: 0,
        feeMiss: 0,
        hitBusy: 2,
        missBusy: 3,
        hitFormula: "ap-dp",
        apSkills: [["sword",1],["martial-cognize",1]],
        dpSkills: [["parry",1],["martial-cognize",1],["dugu-jiujian",1]],
        directType: "WEAPON",
        gates: [
            { key: "level", pair: [89,90], field: "skill", refusal: "你所使用的外功中没有这种功能。\n" },
        ],
    },
    'kuihua-mogong/bian': {
        skill: "kuihua-mogong",
        ability: "bian",
        abilityPath: "perform/bian",
        usage: "sword",
        grant: "can_perform/pixie-jian/po",
        forceSkill: "force",
        kind: "direct",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "葵花魔功「无边无际」",
        feeHit: 200,
        feeMiss: 150,
        hitBusy: 2,
        missBusy: 3,
        hitFormula: "ap-dp",
        apSkills: [["kuihua-mogong",1],["dodge",1]],
        dpSkills: [["martial-cognize",1],["dodge",1]],
        directType: "REMOTE",
        targetMarker: "no_perform",
        gates: [
            { key: "level", pair: [259,260], field: "skill", refusal: "你的葵花魔功不够娴熟，难以施展「无边无际」。\n" },
            { key: "max-neili", pair: [3699,3700], field: "max_neili", refusal: "你的内力修为不足，难以施展「无边无际」。\n" },
            { key: "neili", pair: [299,300], field: "neili", refusal: "你现在的真气不足，难以施展「无边无际」。\n" },
        ],
    },
    'kuihua-mogong/qiong': {
        skill: "kuihua-mogong",
        ability: "qiong",
        abilityPath: "perform/qiong",
        usage: "sword",
        grant: "can_perform/kuihua-mogong/qiong",
        forceSkill: "force",
        kind: "instant_death",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "葵花魔功「无穷无尽」",
        fee: 60,
        // exp>=1M branch: base -60, then a further -80 on the inner hit.
        feeHit: 140,
        feeMiss: 60,
        hitBusyMin: 1,
        hitBusyMax: 2,
        missBusyMin: 1,
        missBusyMax: 2,
        instantDeathFormula: "exp",
        expDiv: 10000,
        gates: [
            { key: "level", pair: [249,250], field: "skill", refusal: "你的葵花魔功还不够娴熟，不能使用「无穷无尽」！\n" },
            { key: "max-neili", pair: [3799,3800], field: "max_neili", refusal: "你的内力修为不足，难以施展「无穷无尽」。\n" },
            { key: "neili", pair: [199,200], field: "neili", refusal: "你的真气不够，无法施展「无穷无尽」\n" },
        ],
    },
    'kuihua-mogong/sheng': {
        skill: "kuihua-mogong",
        ability: "sheng",
        abilityPath: "perform/sheng",
        usage: "dodge",
        grant: "can_perform/kuihua-mogong/sheng",
        forceSkill: "force",
        kind: "control",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "葵花魔功「无声无息」",
        feeHit: 120,
        feeMiss: 80,
        hitBusy: 1,
        missBusy: 1,
        targetBusy: {"div":30,"add":2,"useAp":true},
        apSkills: [["kuihua-mogong",1.5],["martial-cognize",1]],
        dpSkills: [["dodge",1],["martial-cognize",1]],
        gates: [
            { key: "level", pair: [199,200], field: "skill", refusal: "你的葵花魔功不够深厚，不会使用「无声无息」。\n" },
            { key: "max-neili", pair: [2999,3000], field: "max_neili", refusal: "你的内力修为不足，难以施展「无声无息」。\n" },
            { key: "neili", pair: [199,200], field: "neili", refusal: "你的真气不够，无法施展「无声无息」！\n" },
        ],
    },
    'kuihua-mogong/tian': {
        skill: "kuihua-mogong",
        ability: "tian",
        abilityPath: "perform/tian",
        usage: "sword",
        grant: "can_perform/kuihua-mogong/tian",
        forceSkill: "kuihua-mogong",
        kind: "multi_stage",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "葵花魔功「无法无天」",
        fee: 180,
        stages: 6,
        stageFee: 30,
        busyMin: 1,
        busyMax: 4,
        hitFormula: "ap-dp",
        apSkills: [["kuihua-mogong",1]],
        dpSkills: [["dodge",1]],
        directType: "WEAPON",
        gates: [
            { key: "neili", pair: [339,340], field: "neili", refusal: "你的真气不够，无法施展「无法无天」！\n" },
            { key: "max-neili", pair: [3399,3400], field: "max_neili", refusal: "你的内力修为不足，难以施展「无法无天」。\n" },
        ],
    },
    'kuihua-mogong/wswd': {
        skill: "kuihua-mogong",
        ability: "wswd",
        abilityPath: "perform/wswd",
        usage: "sword",
        grant: "can_perform/kuihua-mogong/ws",
        forceSkill: "force",
        kind: "special",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "葵花魔功「无双无对」",
        feeHit: 500,
        feeMiss: 300,
        hitBusy: 1,
        missBusy: 2,
        specialKind: "two_stage",
        gates: [
            { key: "level", pair: [399,400], field: "skill", refusal: "以你目前的修为来看，还不足以运用「无双」\n" },
            { key: "max-neili", pair: [6999,7000], field: "max_neili", refusal: "你的内力修为不够运用「无双无对」所需！\n" },
            { key: "neili", pair: [999,1000], field: "neili", refusal: "你的内力不够运用「无双」所需！\n" },
        ],
    },
    'jiuyang-shengong/hun': {
        skill: "jiuyang-shengong",
        ability: "hun",
        abilityPath: "perform/hun",
        usage: "unarmed",
        grant: "can_perform/jiuyang-shengong/hun",
        forceSkill: "jiuyang-shengong",
        kind: "direct",
        weapon: null,
        prepared: "unarmed",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "九阳神功「混沌一阳」",
        feeHit: 250,
        feeMiss: 50,
        hitBusy: 1,
        missBusy: 3,
        hitFormula: "ap-dp",
        apSkills: [["jiuyang-shengong",2],["con",10],["martial-cognize",1]],
        dpSkills: [["force",1],["con",10],["martial-cognize",1]],
        directType: "UNARMED",
        // jiuyang-shengong valid_enable() only opens unarmed/parry once reborn.
        extraProperties: { reborn: 1 },
        gates: [
            { key: "level", pair: [179,180], field: "skill", refusal: "你的九阳神功还不够娴熟，难以施展「混沌一阳」。\n" },
            { key: "neili", pair: [299,300], field: "neili", refusal: "你的内力不够，难以施展「混沌一阳」。\n" },
        ],
    },
    'jiuyang-shengong/jiu': {
        skill: "jiuyang-shengong",
        ability: "jiu",
        abilityPath: "perform/jiu",
        usage: "unarmed",
        grant: "can_perform/jiuyang-shengong/jiu",
        forceSkill: "jiuyang-shengong",
        kind: "multi_stage",
        weapon: null,
        prepared: "unarmed",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "九阳神功「九曦混阳」",
        fee: 300,
        stages: 9,
        stageFee: 0,
        busyMin: 1,
        busyMax: 8,
        hitFormula: "ap-dp",
        apSkills: [["unarmed",1],["con",20]],
        dpSkills: [["parry",1],["con",20]],
        directType: "UNARMED",
        extraProperties: { reborn: 1 },
        gates: [
            { key: "level", pair: [199,200], field: "skill", refusal: "你的九阳神功还不够娴熟，难以施展「九曦混阳」。\n" },
            { key: "max-neili", pair: [3999,4000], field: "max_neili", refusal: "你的内力的修为不够，现在无法使用「九曦混阳」。\n" },
            { key: "neili", pair: [499,500], field: "neili", refusal: "你的真气不够，无法运用「九曦混阳」。\n" },
        ],
    },
    'jiuyang-shengong/pi': {
        skill: "jiuyang-shengong",
        ability: "pi",
        abilityPath: "perform/pi",
        usage: "blade",
        grant: "can_perform/jiuyang-shengong/pi",
        forceSkill: "jiuyang-shengong",
        kind: "direct",
        weapon: "blade",
        prepared: "blade",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "九阳神功「骄阳劈天」",
        feeHit: 350,
        feeMiss: 150,
        hitBusyMin: 2,
        hitBusyMax: 3,
        missBusyMin: 2,
        missBusyMax: 3,
        hitFormula: "ap-dp",
        apSkills: [["blade",1],["force",1]],
        dpSkills: [["parry",1],["force",1]],
        directType: "WEAPON",
        // sword/blade additionally need the enable_weapon grant once reborn.
        extraProperties: { reborn: 1, 'can_learn/jiuyang-shengong/enable_weapon': 1 },
        gates: [
            { key: "level", pair: [219,220], field: "skill", refusal: "你的九阳神功不够娴熟，难以施展「骄阳劈天」。\n" },
            { key: "force", pair: [239,240], field: "effective-skill", skillName: "force", refusal: "你的内功根基不够，难以施展「骄阳劈天」。\n" },
            { key: "blade", pair: [239,240], field: "skill", skillName: "blade", refusal: "你的基本刀法火候不够，难以施展「骄阳劈天」。\n" },
            { key: "max-neili", pair: [5499,5500], field: "max_neili", refusal: "你的内力修为不足，难以施展「骄阳劈天」。\n" },
            { key: "neili", pair: [399,400], field: "neili", refusal: "你现在真气不够，难以施展「骄阳劈天」。\n" },
        ],
    },
    'jiuyang-shengong/po': {
        skill: "jiuyang-shengong",
        ability: "po",
        abilityPath: "perform/po",
        usage: "sword",
        grant: "can_perform/jiuyang-shengong/po",
        forceSkill: "jiuyang-shengong",
        kind: "direct",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "九阳神功「金阳破岭」",
        feeHit: 350,
        feeMiss: 150,
        hitBusyMin: 2,
        hitBusyMax: 3,
        missBusyMin: 2,
        missBusyMax: 3,
        hitFormula: "ap-dp",
        apSkills: [["sword",1],["force",1]],
        dpSkills: [["parry",1],["force",1]],
        directType: "WEAPON",
        extraProperties: { reborn: 1, 'can_learn/jiuyang-shengong/enable_weapon': 1 },
        gates: [
            { key: "level", pair: [219,220], field: "skill", refusal: "你的九阳神功不够娴熟，难以施展「金阳破岭」。\n" },
            { key: "force", pair: [239,240], field: "effective-skill", skillName: "force", refusal: "你的内功根基不够，难以施展「金阳破岭」。\n" },
            { key: "sword", pair: [239,240], field: "skill", skillName: "sword", refusal: "你的基本剑法火候不够，难以施展「金阳破岭」。\n" },
            { key: "max-neili", pair: [5499,5500], field: "max_neili", refusal: "你的内力修为不足，难以施展「金阳破岭」。\n" },
            { key: "neili", pair: [399,400], field: "neili", refusal: "你现在真气不够，难以施展「金阳破岭」。\n" },
        ],
    },
    'jiuyang-shengong/ri': {
        skill: "jiuyang-shengong",
        ability: "ri",
        abilityPath: "perform/ri",
        usage: "unarmed",
        grant: "can_perform/jiuyang-shengong/ri",
        forceSkill: "jiuyang-shengong",
        kind: "multi_stage",
        weapon: null,
        prepared: "unarmed",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "九阳神功「魔光日无极」",
        fee: 1000,
        stages: 1,
        stageFee: 0,
        busyMin: 5,
        busyMax: 5,
        hitFormula: "ap-dp",
        apSkills: [["force",1],["unarmed",1],["martial-cognize",1],["jiuyang-shengong",1],["con",10]],
        dpSkills: [["force",2],["martial-cognize",1],["con",10]],
        directType: "UNARMED",
        extraProperties: { reborn: 1 },
        gates: [
            { key: "level", pair: [249,250], field: "skill", refusal: "你的九阳神功还不够娴熟，难以施展「魔光日无极」。\n" },
            { key: "max-neili", pair: [7999,8000], field: "max_neili", refusal: "你的内力的修为不够，现在无法使用「魔光日无极」。\n" },
            { key: "neili", pair: [1999,2000], field: "neili", refusal: "你的真气不够，无法运用「魔光日无极」。\n" },
        ],
    },
    'taixuan-gong/hun': {
        skill: "taixuan-gong",
        ability: "hun",
        abilityPath: "perform/hun",
        usage: "unarmed",
        grant: "can_perform/taixuan-gong/hun",
        forceSkill: "taixuan-gong",
        kind: "direct",
        weapon: null,
        prepared: "unarmed",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "太玄功「混天一气」",
        feeHit: 600,
        feeMiss: 300,
        hitBusy: 3,
        missBusy: 2,
        hitFormula: "ap-dp",
        apSkills: [["taixuan-gong",2],["con",10],["martial-cognize",1]],
        dpSkills: [["force",1],["con",10],["martial-cognize",1]],
        directType: "UNARMED",
        gates: [
            { key: "level", pair: [199,200], field: "skill", refusal: "你的太玄功还不够娴熟，难以施展「混天一气」。\n" },
            { key: "neili", pair: [599,600], field: "neili", refusal: "你的内力不够，难以施展「混天一气」。\n" },
        ],
    },
    'taixuan-gong/jing': {
        skill: "taixuan-gong",
        ability: "jing",
        abilityPath: "perform/jing",
        usage: "sword",
        grant: "can_perform/taixuan-gong/jing",
        forceSkill: "taixuan-gong",
        kind: "multi_stage",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "太玄功「白首太玄经」",
        fee: 400,
        stages: 4,
        stageFee: 0,
        busyMin: 2,
        busyMax: 4,
        hitFormula: "ap-dp",
        apSkills: [["taixuan-gong",1],["sword",1]],
        dpSkills: [["str",2],["unarmed",1],["parry",1]],
        directType: "WEAPON",
        // taixuan-gong valid_enable() withholds sword/blade until the
        // enable_weapon grant is present (and then only past skill parity).
        extraProperties: { 'can_learned/taixuan-gong/enable_weapon': 1 },
        gates: [
            // All six checks below read raw skill levels (query_skill(..., 1)).
            { key: "force", pair: [339,340], field: "skill", skillName: "force", refusal: "你内功修为不够，难以施展「白首太玄经」。\n" },
            { key: "max-neili", pair: [9999,10000], field: "max_neili", refusal: "你内力修为不够，难以施展「白首太玄经」。\n" },
            { key: "level", pair: [339,340], field: "skill", refusal: "你太玄功火候不够，难以施展「白首太玄经」。\n" },
            { key: "sword", pair: [339,340], field: "skill", skillName: "sword", refusal: "你的基本剑法火候不足，难以施展「白首太玄经」。\n" },
            { key: "neili", pair: [849,850], field: "neili", refusal: "你现在真气不够，难以施展「白首太玄经」。\n" },
            { key: "martial-cognize", pair: [259,260], field: "skill", skillName: "martial-cognize", refusal: "你武学修养不足，难以施展「白首太玄经」。\n" },
        ],
    },
    'taixuan-gong/po': {
        skill: "taixuan-gong",
        ability: "po",
        abilityPath: "perform/po",
        usage: "unarmed",
        grant: "can_perform/taixuan-gong/po",
        forceSkill: "taixuan-gong",
        kind: "multi_stage",
        weapon: null,
        prepared: "unarmed",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "太玄功「乘风破浪」",
        fee: 220,
        stages: 1,
        stageFee: 0,
        busyMin: 5,
        busyMax: 5,
        hitFormula: "ap-dp",
        apSkills: [["force",1],["unarmed",1],["martial-cognize",1],["taixuan-gong",1],["con",10]],
        dpSkills: [["force",2],["martial-cognize",1],["con",10]],
        directType: "UNARMED",
        gates: [
            { key: "max-neili", pair: [8499,8500], field: "max_neili", refusal: "你的内力的修为不够，现在无法使用「乘风破浪」。\n" },
            { key: "level", pair: [259,260], field: "skill", refusal: "你的太玄功还不够娴熟，难以施展「乘风破浪」。\n" },
        ],
    },
    'taixuan-gong/xuan': {
        skill: "taixuan-gong",
        ability: "xuan",
        abilityPath: "perform/xuan",
        usage: "unarmed",
        grant: "can_perform/taixuan-gong/xuan",
        forceSkill: "taixuan-gong",
        kind: "multi_stage",
        weapon: null,
        prepared: "unarmed",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "太玄功「太玄激劲」",
        fee: 600,
        stages: 15,
        stageFee: 0,
        busyMin: 1,
        busyMax: 5,
        hitFormula: "ap-dp",
        apSkills: [["taixuan-gong",1]],
        dpSkills: [["dodge",1]],
        directType: "UNARMED",
        gates: [
            { key: "neili", pair: [799,800], field: "neili", refusal: "你的真气不够，无法施展「太玄激劲」！\n" },
            { key: "max-neili", pair: [4999,5000], field: "max_neili", refusal: "你的内力修为还不足以使出「太玄激劲」。\n" },
            { key: "force", pair: [299,300], field: "effective-skill", skillName: "force", refusal: "你的内功火候不够，难以施展「太玄激劲」！\n" },
            { key: "level", pair: [239,240], field: "skill", refusal: "你的太玄功还不够熟练，无法使用「太玄激劲」！\n" },
        ],
    },
    'hamagong/zhen': {
        skill: "hamagong",
        ability: "zhen",
        abilityPath: "perform/zhen",
        usage: "strike",
        grant: null,
        forceSkill: "force",
        kind: "multi_stage",
        weapon: null,
        prepared: "strike",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "蛤蟆功「蟾震九天」",
        fee: 400,
        stages: 3,
        stageFee: 0,
        busyMin: 3,
        busyMax: 6,
        hitFormula: "ap-dp",
        apSkills: [["force",1],["poison",1]],
        dpSkills: [["force",1],["parry",1],["dodge",1]],
        directType: "UNARMED",
        gates: [
            { key: "level", pair: [239,240], field: "skill", refusal: "你的蛤蟆功修为不够精深，不能使用「蟾震九天」！\n" },
            { key: "max-neili", pair: [3999,4000], field: "max_neili", refusal: "你的内力修为不够深厚，无法施展「蟾震九天」！\n" },
            { key: "neili", pair: [799,800], field: "neili", refusal: "你的真气不够，无法运用「蟾震九天」！\n" },
            { key: "strike", pair: [199,200], field: "skill", skillName: "strike", refusal: "你的掌法不够娴熟，无法施展「蟾震九天」！\n" },
        ],
    },
    'qiankun-danuoyi/nuoyi': {
        skill: "qiankun-danuoyi",
        ability: "nuoyi",
        abilityPath: "nuoyi",
        // qiankun-danuoyi valid_enable() only accepts "parry"; enable/map the
        // parry slot and dispatch as perform parry.nuoyi (the perform itself has
        // no mapping precondition).
        usage: "parry",
        grant: null,
        forceSkill: "force",
        kind: "special",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "乾坤大挪移「大挪移」",
        fee: 350,
        specialKind: "redirect",
        hitBusy: 2,
        missBusy: 2,
        gates: [
            { key: "level", pair: [49,50], field: "skill", refusal: "你的乾坤大挪移还没有修炼到第二层，无法施展大挪移。\n" },
            { key: "neili", pair: [399,400], field: "neili", refusal: "你现在真气不够，无法使用「大挪移」。\n" },
        ],
    },
    'xiaoli-feidao/fei': {
        skill: "xiaoli-feidao",
        ability: "fei",
        abilityPath: "fei",
        usage: "throwing",
        grant: null,
        forceSkill: "force",
        kind: "instant_death",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "小李飞刀「飞刀」",
        fee: 50,
        handing: "throwing",
        hitBusyMin: 0,
        hitBusyMax: 4,
        missBusyMin: 0,
        missBusyMax: 4,
        instantDeathFormula: "always",
        gates: [
            { key: "level", pair: [99,100], field: "skill", refusal: "你的小李飞刀不够娴熟。\n" },
            { key: "neili", pair: [99,100], field: "neili", refusal: "你内力不够了。\n" },
        ],
    },
    'jingang-buhuaiti/jingang': {
        skill: "jingang-buhuaiti",
        ability: "jingang",
        abilityPath: "jingang",
        // jingang-buhuaiti valid_enable() only accepts "parry"; enable/map the
        // parry slot and dispatch as perform parry.jingang.
        usage: "parry",
        grant: null,
        forceSkill: "force",
        kind: "buff",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "金刚不坏护体神功「护体」",
        fee: 200,
        marker: "jingangbuhuai",
        gates: [
            { key: "neili", pair: [299,300], field: "neili", refusal: "你的内力不够。\n" },
            { key: "level", pair: [99,100], field: "skill", refusal: "你的金刚不坏护体神功修为不够。\n" },
        ],
    },
    'ningxue-shenzhao/ji': {
        skill: "ningxue-shenzhao",
        ability: "ji",
        abilityPath: "ji",
        usage: "claw",
        grant: "can_perform/ningxue-shenzhao/ji",
        forceSkill: "force",
        kind: "multi_stage",
        weapon: null,
        prepared: "claw",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "凝血神爪「疾电」",
        fee: 300,
        stages: 7,
        stageFee: 0,
        busyMin: 1,
        busyMax: 5,
        hitFormula: "ap-dp",
        apSkills: [["claw",1]],
        dpSkills: [["parry",1],["dodge",1]],
        directType: "UNARMED",
        gates: [
            { key: "level", pair: [249,250], field: "skill", refusal: "你的凝血神爪修为有限，无法使用「疾电」！\n" },
            { key: "force", pair: [349,350], field: "effective-skill", skillName: "force", refusal: "你的内功火候不够，难以施展「疾电」！\n" },
            { key: "max-neili", pair: [4999,5000], field: "max_neili", refusal: "你的内力修为没有达到那个境界，无法运转内力形成「疾电」！\n" },
            { key: "neili", pair: [499,500], field: "neili", refusal: "你的真气不够，现在无法施展「疾电」！\n" },
        ],
    },
    'qiankun-jian/ni': {
        skill: "qiankun-jian",
        ability: "ni",
        abilityPath: "ni",
        usage: "sword",
        grant: "can_perform/qiankun-jian/ni",
        forceSkill: "force",
        kind: "direct",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "乾坤神剑「逆转乾坤」",
        feeHit: 200,
        feeMiss: 80,
        hitBusy: 2,
        missBusy: 4,
        hitFormula: "ap-dp",
        apSkills: [["sword",1],["force",1]],
        dpSkills: [["dodge",1],["parry",1]],
        directType: "WEAPON",
        gates: [
            { key: "force", pair: [299,300], field: "effective-skill", skillName: "force", refusal: "你的内功的修为不够，难以施展「逆转乾坤」。\n" },
            { key: "level", pair: [179,180], field: "skill", refusal: "你的乾坤神剑修为不够，难以施展「逆转乾坤」。\n" },
            { key: "neili", pair: [399,400], field: "neili", refusal: "你的真气不够，难以施展「逆转乾坤」。\n" },
        ],
    },
    'qiankun-jian/qian': {
        skill: "qiankun-jian",
        ability: "qian",
        abilityPath: "qian",
        usage: "sword",
        grant: "can_perform/qiankun-jian/qian",
        forceSkill: "force",
        kind: "direct",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "乾坤神剑「乾坤劲」",
        feeHit: 150,
        feeMiss: 50,
        hitBusy: 2,
        missBusy: 3,
        hitFormula: "ap-dp",
        apSkills: [["sword",1]],
        dpSkills: [["parry",1]],
        directType: "WEAPON",
        gates: [
            { key: "force", pair: [149,150], field: "effective-skill", skillName: "force", refusal: "你的内功的修为不够，难以施展「乾坤劲」。\n" },
            { key: "level", pair: [99,100], field: "skill", refusal: "你的乾坤神剑修为不够，难以施展「乾坤劲」。\n" },
            { key: "neili", pair: [299,300], field: "neili", refusal: "你的真气不够，难以施展「乾坤劲」。\n" },
        ],
    },
    'qiankun-jian/riyue': {
        skill: "qiankun-jian",
        ability: "riyue",
        abilityPath: "riyue",
        usage: "sword",
        grant: "can_perform/qiankun-jian/riyue",
        forceSkill: "force",
        kind: "multi_stage",
        weapon: "sword",
        prepared: "sword",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "乾坤神剑「日月乾坤」",
        fee: 80,
        stages: 4,
        stageFee: 20,
        busyMin: 1,
        busyMax: 6,
        hitFormula: "ap-dp",
        apSkills: [["sword",1]],
        dpSkills: [["parry",1]],
        directType: "WEAPON",
        gates: [
            { key: "force", pair: [219,220], field: "effective-skill", skillName: "force", refusal: "你的内功的修为不够，难以施展「日月乾坤」。\n" },
            { key: "level", pair: [149,150], field: "skill", refusal: "你的乾坤神剑修为不够，难以施展「日月乾坤」。\n" },
            { key: "neili", pair: [399,400], field: "neili", refusal: "你的真气不够，难以施展「日月乾坤」。\n" },
        ],
    },
    'lonely-sword/jue': {
        skill: "lonely-sword",
        ability: "jue",
        abilityPath: "jue",
        usage: "sword",
        grant: null,
        forceSkill: "force",
        kind: "special",
        weapon: "sword",
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "独孤九剑「总诀式」（演练）",
        gates: [],
    },
    'six-finger/zongheng': {
        skill: "six-finger",
        ability: "zongheng",
        abilityPath: "zongheng",
        usage: "finger",
        grant: null,
        forceSkill: "force",
        kind: "control",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "六脉神剑「纵横」",
        gates: [],
    },
    'dugu-jiujian/jue': {
        skill: "dugu-jiujian",
        ability: "jue",
        abilityPath: "jue",
        usage: "sword",
        grant: null,
        forceSkill: "force",
        kind: "special",
        weapon: "sword",
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "独孤九剑「总诀式」（演练）",
        gates: [],
    },
    'yujian-shu/yujian': {
        skill: "yujian-shu",
        ability: "yujian",
        abilityPath: "yujian",
        usage: "sword",
        grant: null,
        forceSkill: "force",
        kind: "multi_stage",
        weapon: "sword",
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "御剑术「御剑飞升」",
        gates: [],
    },
    'jinshe-zhui/tuwu': {
        skill: "jinshe-zhui",
        ability: "tuwu",
        abilityPath: "tuwu",
        usage: "throwing",
        grant: null,
        forceSkill: "force",
        kind: "special",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "金蛇锥法「金蛇吐雾」",
        gates: [],
    },
    'xuanyuan-arrow/baibu': {
        skill: "xuanyuan-arrow",
        ability: "baibu",
        abilityPath: "baibu",
        usage: "throwing",
        grant: null,
        forceSkill: "force",
        kind: "special",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "轩辕箭法「百步穿杨」",
        gates: [],
    },
    'taixuan-gong/xuan-top': {
        skill: "taixuan-gong",
        ability: "xuan-top",
        abilityPath: "xuan",
        usage: "unarmed",
        grant: "can_perform/taixuan-gong/xuan",
        forceSkill: "taixuan-gong",
        kind: "multi_stage",
        weapon: null,
        prepared: "unarmed",
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "太玄功「太玄激劲」（顶层）",
        gates: [],
    },
    'five-avoid/break': {
        skill: "five-avoid",
        ability: "break",
        abilityPath: "break",
        usage: "unarmed",
        grant: null,
        forceSkill: "force",
        kind: "multi_stage",
        weapon: null,
        prepared: null,
        families: ["侠客盟"],
        actorFamily: "侠客盟",
        title: "五遁绝杀",
        gates: [],
    },
};

export const b29Schools = schools;

// Deferred dispositions: a missing fixture is not a whole-project N/A.
// These generate no samples in this batch; the collection obligation remains.
// 演练型: non-combat practice performs (perform(object me), refuse while fighting).
// 分发不可达: perform_action_file dispatches elsewhere; this file is not reachable.
// 缺专用道具: requires a unique item id / is_arrow(); generic ammo cannot match.
// 多段窗口: call_out loop or COMBAT_D->fight() multi-round exceeds single-action window.
export const b29Dispositions = {
    'lonely-sword/jue': {
        disposition: 'pending_fixture',
        category: '演练型',
        reason: '演练型绝招（非战斗）：perform(object me) 无目标，战斗中拒绝「总诀式」不能在战斗中演练，'
            + '提高剑法与独孤九剑；不进战斗夹具',
        evidence: 'kungfu/skill/lonely-sword/jue.c:5 perform(object me)、:19 is_fighting() 拒绝',
    },
    'six-finger/zongheng': {
        disposition: 'unreachable_dispatch',
        category: '分发不可达',
        reason: 'six-finger 分发到 liumai-shenjian/ 目录，zongheng.c 不在该目录，运行期不可达；'
            + '顶层 six-finger/zongheng.c 不经 perform_action_file 路径',
        evidence: 'kungfu/skill/six-finger.c:517-518 perform_action_file → liumai-shenjian/；'
            + 'kungfu/skill/liumai-shenjian/ 无 zongheng.c',
    },
    'dugu-jiujian/jue': {
        disposition: 'pending_fixture',
        category: '演练型',
        reason: '演练型绝招（非战斗）：perform(object me) 无目标，战斗中拒绝「总诀式」不能在战斗中演练，'
            + '提高剑法与独孤九剑；不进战斗夹具',
        evidence: 'kungfu/skill/dugu-jiujian/jue.c:7 perform(object me)、:24 is_fighting() 拒绝',
    },
    'yujian-shu/yujian': {
        disposition: 'pending_fixture',
        category: '多段窗口',
        reason: '御剑飞升含 call_out 循环多段（perform2 反复 call_out），即时窗口无法覆盖重复段',
        evidence: 'kungfu/skill/yujian-shu/yujian.c:61/68/124/131 call_out("perform2") 循环',
    },
    'jinshe-zhui/tuwu': {
        disposition: 'pending_fixture',
        category: '缺专用道具',
        reason: '需专用金蛇锥道具（id jinshe zhui），通用投射弹药不匹配',
        evidence: 'kungfu/skill/jinshe-zhui/tuwu.c:22 weapon->query("id") != "jinshe zhui"',
    },
    'xuanyuan-arrow/baibu': {
        disposition: 'pending_fixture',
        category: '缺专用道具',
        reason: '需 is_arrow() 箭矢道具，通用投射弹药不匹配',
        evidence: 'kungfu/skill/xuanyuan-arrow/baibu.c:21 !weapon->is_arrow()',
    },
    'five-avoid/break': {
        disposition: 'pending_fixture',
        category: '多段窗口',
        reason: '五遁绝杀经 COMBAT_D->fight() 多轮循环（while count--），超出单动作即时窗口',
        evidence: 'kungfu/skill/five-avoid/break.c:35/47 while (count--) COMBAT_D->fight',
    },
    'taixuan-gong/xuan-top': {
        disposition: 'unreachable_dispatch',
        category: '分发不可达',
        reason: 'taixuan-gong 分发到 perform/ 目录，顶层 xuan.c 不经 perform_action_file 可达；'
            + '实际入口为 taixuan-gong/perform/xuan.c（另计覆盖）',
        evidence: 'kungfu/skill/taixuan-gong.c:333-339 perform_action_file → taixuan-gong/perform/；'
            + '顶层 taixuan-gong/xuan.c 不在分发路径',
    },
};

// Skip map for condition generation: keys that produce no combat samples.
export const b29Pending = Object.fromEntries(
    Object.entries(b29Dispositions).map(([key, v]) => [key, v.reason])
);


// Every gate except the one being probed must pass, so the baseline is raised
// to each gate's high value. Otherwise an earlier gate masks the intended one
// and the refusal text no longer matches.
const gateFloor = cfg => {
    const skills = {}, properties = {};
    const raise = (bag, key, value) => { bag[key] = bag[key] === undefined ? value : Math.max(bag[key], value); };
    for (const gate of cfg.gates) {
        const high = gate.pair[1];
        switch (gate.field) {
            case 'skill': raise(skills, gate.skillName ?? cfg.skill, high); break;
            case 'neili': raise(properties, 'neili', high); break;
            case 'qi': raise(properties, 'qi', high); break;
            case 'max_neili': raise(properties, 'max_neili', high); break;
            case 'jingli': raise(properties, 'jingli', high); break;
            case 'jing': raise(properties, 'jing', high); break;
            case 'shen': raise(properties, 'shen', high); break;
            case 'str': raise(properties, 'str', high); break;
            case 'con': raise(properties, 'con', high); break;
            case 'dex': raise(properties, 'dex', high + 20); break;
            case 'dodge': raise(skills, 'dodge', high); break;
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
        case 'qi': return { properties: { qi: value } };
        case 'max_neili': return { properties: { max_neili: value } };
        case 'jingli': return { properties: { jingli: value } };
        case 'jing': return { properties: { jing: value } };
        case 'shen': return { properties: { shen: value } };
        case 'str': return { properties: { str: value } };
        case 'con': return { properties: { con: value } };
        case 'dex': return { properties: { dex: value - 20 } };
        case 'dodge': return { skills: { dodge: value } };
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

export function b29PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b29SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b29ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b29ReviewedSourceHash,
            'Reviewed B29 sources changed; re-review before sampling');
    const result = [];
    for (const [key, cfg] of Object.entries(schools)) {
        if (b29Pending[key]) continue;
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
            for (const u of ['sword', 'unarmed', 'dodge', 'hand', 'cuff', 'strike', 'staff', 'finger', 'blade', 'throwing', 'parry', 'club', 'whip', 'claw', 'dagger', 'axe', 'hammer', 'spear'])
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
                ...(cfg.handing ? { equipment: { type: cfg.handing, hold: true, amount: 10 } } : {}),
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
                equipment: extra.targetWeapon
                    ? { type: extra.targetWeaponType ?? 'sword', hold: false }
                    : { type: 'sword', hold: false },
                ...(extra.targetBusy ? { busy: 2 } : {}),
            };
            if (extra.actorTemp) actor.temp = { ...(actor.temp ?? {}), ...extra.actorTemp };
            result.push({
                id: `b29-${key.replace(/\//g, '-')}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b29', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b29-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b29SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}公共/任务：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '公共/任务武学无正式派归属，按原分支记账。'
                        + '只收集数据，不比较强弱。',
                },
            });
        }
        const primary = cfg.gates[0];
        // alwaysRefusal: an earlier precondition can never be satisfied, so every
        // invocation refuses before any gate below is reachable. Record only the
        // permanent refusal; the gates stay on cfg as reviewed source facts.
        add(`baseline-l${level}`, {
            samples: smoke ? 2 : samples,
            ...(cfg.alwaysRefusal ? { refusal: cfg.alwaysRefusal } : {}),
        });
        if (!cfg.alwaysRefusal) {
            for (const gate of cfg.gates.filter(g => g.key === primary.key)) {
                const [low, high] = gate.pair;
                add(`gate-${gate.key}-${low}`, {
                    ...gateEdit(cfg, gate, low, true),
                    refusal: gate.refusal, samples: 2
                });
                add(`gate-${gate.key}-${high}`, { ...gateEdit(cfg, gate, high, false), samples: 2 });
            }
            if (cfg.kind === 'control' && cfg.targetBusy && !cfg.skipTargetBusy) {
                add('target-busy', {
                    targetBusy: true,
                    refusal: cfg.targetBusyRefusal ?? '右试弟子目前正自顾不暇，放胆攻击吧！\n',
                });
            }
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
        if (side.temp) delete side.temp.guarding;
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

function effectiveSkill(b, name) {
    const raw = sparse(b.skills, name);
    const mapped = b.mappings?.[name];
    return mapped ? Math.trunc(raw / 2) + sparse(b.skills, mapped) : Math.trunc(raw / 2);
}

function computeAp(cfg, b) {
    let ap = 0;
    for (const [name, coef] of cfg.apSkills ?? []) {
        const v = cfg.useEffectiveAp ? effectiveSkill(b, name) : sparse(b.skills, name);
        ap += v * coef;
    }
    return ap;
}

function expectedTargetBusy(cfg, b) {
    const t = cfg.targetBusy;
    if (t.useAp) {
        const ap = computeAp(cfg, b);
        return Math.trunc(ap / t.div) + (t.add ?? 0);
    }
    const name = t.skill ?? t.useSkill ?? cfg.skill;
    const level = t.useEffective ? effectiveSkill(b, name) : sparse(b.skills, name);
    return Math.trunc(level / t.div) + (t.add ?? 0);
}

function targetBusyRange(cfg, b) {
    const t = cfg.targetBusy;
    if (t.randomBase !== undefined) {
        const name = t.useSkill ?? t.skill ?? cfg.skill;
        const level = t.useEffective ? effectiveSkill(b, name) : sparse(b.skills, name);
        const n = Math.trunc(level / t.randomDiv);
        return [t.randomBase, t.randomBase + Math.max(n, 1) - 1];
    }
    if (t.randomN !== undefined) {
        const base = expectedTargetBusy(cfg, b);
        return [base, base + t.randomN - 1];
    }
    const base = expectedTargetBusy(cfg, b);
    return [base, base];
}

export function validateB29Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B29 entry');
    assert.equal(p.collection_group, 'b29-perform');
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
        // Skills with double_attack() (taixuan-gong, jiuyang-shengong, ...) do
        // emit TYPE_QUICK swings; account them against the attack log instead of
        // requiring zero.
        for (const [name, type] of [['quick', 2], ['riposte', 1]])
            assert.equal(sparse(raw.metrics[side], name),
                raw.attacks.filter(x => x.actor === side && x.type === type).length, name);
        assert.equal(sparse(raw.metrics[side], 'heartbeats'), 0, 'heartbeats');
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
    if (cfg.kind === 'combo') return validateB29Combo(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB29Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB29Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'instant_death') return validateB29InstantDeath(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi_stage') return validateB29MultiStage(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'buff') return validateB29Buff(raw, condition, cfg, p, b, t, a, v);
    return validateB29Special(raw, condition, cfg, p, b, t, a, v);
}

function validateB29Combo(raw, condition, cfg, p, b, t, a, v) {
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    const qiCost = b.qi - a.qi;
    if (cfg.feePerAttack !== undefined) {
        assert.ok(fee > 0, 'combo fee positive');
    } else {
        assert.ok(fee >= (cfg.feeHit ?? cfg.fee ?? 0), 'combo fee floor');
    }
    const maxAttacks = cfg.comboAttacks ?? cfg.comboAttacksMax ?? 8;
    const minAttacks = cfg.comboAttacksMin ?? 1;
    assert.ok(attacks.length >= minAttacks && attacks.length <= maxAttacks, 'combo attack count');
    assert.ok(num(a.busy) >= (cfg.comboBusyMin ?? 0) && num(a.busy) <= (cfg.comboBusyMax ?? 6), 'combo busy range');
    for (const at of attacks) assert.ok([0, -1, -2].includes(at.result));
    assert.equal(raw.directs?.length ?? 0, 0, 'combo has no directs');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.qi -= qiCost; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        if (a.temp) { for (const k of Object.keys(a.temp)) { if (k !== 'apply' && k !== 'notify_fail' && k !== 'fight' && k !== 'block_msg' && k !== 'action_flag' && k !== 'die_reason' && k !== 'guarding') { if (!e.temp) e.temp = {}; e.temp[k] = copy(a.temp[k]); } } }
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return {
        accepted: true, kind: 'combo',
        hit: attacks.some(x => x.result === 0),
        hits: attacks.filter(x => x.result === 0).length,
    };
}

function validateB29Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const miss = directs.length === 0 && sparse(raw.metrics[0], 'direct') === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    const paid = b.neili - a.neili;
    let fee;
    if (miss) fee = cfg.feeMiss ?? 0;
    else fee = cfg.feeHit ?? 0;
    assert.equal(paid, fee, 'branch fee');
    const busyAfter = num(a.busy);
    const busyMin = miss ? (cfg.missBusyMin ?? cfg.missBusy ?? cfg.hitBusy ?? 0)
        : (cfg.hitBusyMin ?? cfg.hitBusy ?? 0);
    const busyMax = miss ? (cfg.missBusyMax ?? cfg.missBusy ?? cfg.hitBusy ?? 0)
        : (cfg.hitBusyMax ?? cfg.hitBusy ?? 0);
    assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'busy range');
    if (cfg.selfWound) {
        assert.ok(b.qi - a.qi >= cfg.selfWound, 'self wound applied');
    }
    if (miss) {
        assertLearnGain(a, p.skill);
        const spent = b.neili - a.neili;
        stableState(b, a, e => {
            e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
            if (cfg.selfWound) { e.qi = a.qi; e.eff_qi = a.eff_qi; }
            allowDerived(e, a);
        });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    let input;
    if (directs.length === 1) {
        assert.equal(directs[0].actor, 0); assert.equal(directs[0].target, 1);
        input = num(directs[0].damage);
        assert.ok(input > 0, 'positive damage input');
    } else {
        input = num(t.qi) - num(v.qi);
        assert.ok(input > 0, 'qi drop without directs');
    }
    assertLearnGain(a, p.skill);
    const spent = b.neili - a.neili;
    if (cfg.targetMarker)
        assert.equal(temp(v, cfg.targetMarker), 1, cfg.targetMarker + ' set on hit');
    stableState(b, a, e => {
        e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
        if (cfg.selfWound) { e.qi = a.qi; e.eff_qi = a.eff_qi; }
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        // Perform finals like dugu-jiujian/qi and kuihua-mogong/bian mark the
        // target until a later call_out; keep that marker in the comparison.
        if (cfg.targetMarker) e.temp = copy(v.temp ?? {});
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB29Control(raw, condition, cfg, p, b, t, a, v) {
    const fee = b.neili - a.neili;
    const busyAfter = num(a.busy);
    const hit = num(v.busy) > 0;
    const busyMin = hit ? (cfg.hitBusyMin ?? cfg.hitBusy ?? 0) : (cfg.missBusyMin ?? cfg.missBusy ?? 0);
    const busyMax = hit ? (cfg.hitBusyMax ?? cfg.hitBusy ?? 0) : (cfg.missBusyMax ?? cfg.missBusy ?? 0);
    assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'control busy range');
    if (cfg.targetBusy && hit) {
        const [lo, hi] = targetBusyRange(cfg, b);
        assert.ok(num(v.busy) >= lo && num(v.busy) <= hi, 'target busy formula');
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

function validateB29InstantDeath(raw, condition, cfg, p, b, t, a, v) {
    const fee = b.neili - a.neili;
    const directs = raw.directs ?? [];
    const death = raw.terminals.length > 0 || num(v.living) === 0 || num(v.ghost) === 1;
    // exp-threshold formulas (bluesea mie, kuihua qiong) fall back to a damage or
    // dodge branch when the target is too experienced to be killed outright; the
    // follow-up swing then costs a second neili charge (kuihua qiong).
    const hit = death || directs.length > 0 || num(v.qi) !== num(t.qi);
    assert.equal(fee, hit ? (cfg.feeHit ?? cfg.fee) : (cfg.feeMiss ?? cfg.fee), 'instant death fee');
    const busyAfter = num(a.busy);
    assert.ok(busyAfter >= (cfg.hitBusyMin ?? 0) && busyAfter <= (cfg.hitBusyMax ?? 4), 'busy range');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        if (a.ammunition !== undefined) e.ammunition = a.ammunition;
        if (e.handing_details && a.handing_details?.weight !== undefined) e.handing_details.weight = a.handing_details.weight;
        allowDerived(e, a);
    });
    if (!death) stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.busy = v.busy;
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'instant_death', hit };
}

function validateB29MultiStage(raw, condition, cfg, p, b, t, a, v) {
    const fee = b.neili - a.neili;
    assert.ok(fee >= (cfg.fee ?? 0), 'multi_stage fee floor');
    const busyAfter = num(a.busy);
    assert.ok(busyAfter >= (cfg.busyMin ?? 1) && busyAfter <= (cfg.busyMax ?? 8), 'multi_stage busy range');
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const directs = raw.directs ?? [];
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        if (a.temp) { for (const k of Object.keys(a.temp)) { if (k !== 'apply' && k !== 'notify_fail' && k !== 'fight' && k !== 'block_msg' && k !== 'action_flag' && k !== 'die_reason' && k !== 'guarding') { if (!e.temp) e.temp = {}; e.temp[k] = copy(a.temp[k]); } } }
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return {
        accepted: true, kind: 'multi_stage',
        hit: attacks.some(x => x.result === 0) || directs.length > 0,
    };
}

function validateB29Buff(raw, condition, cfg, p, b, t, a, v) {
    const fee = b.neili - a.neili;
    assert.equal(fee, cfg.fee, 'buff fee');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        if (a.temp) { for (const k of Object.keys(a.temp)) { if (k !== 'apply' && k !== 'notify_fail' && k !== 'fight' && k !== 'block_msg' && k !== 'action_flag' && k !== 'die_reason' && k !== 'guarding') { if (!e.temp) e.temp = {}; e.temp[k] = copy(a.temp[k]); } } }
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'buff', hit: true };
}

function validateB29Special(raw, condition, cfg, p, b, t, a, v) {
    const fee = b.neili - a.neili;
    assert.ok(fee >= (cfg.feeMiss ?? 0) && fee <= (cfg.feeHit ?? cfg.fee ?? 0), 'special fee');
    if (cfg.specialKind === 'weapon_break' || cfg.specialKind === 'debuff'
        || cfg.specialKind === 'two_stage' || cfg.specialKind === 'redirect') {
        const directs = raw.directs ?? [];
        const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            e.temp.apply = copy(a.temp.apply ?? {});
            if (a.temp) { for (const k of Object.keys(a.temp)) { if (k !== 'apply' && k !== 'notify_fail' && k !== 'fight' && k !== 'block_msg' && k !== 'action_flag' && k !== 'die_reason' && k !== 'guarding') { if (!e.temp) e.temp = {}; e.temp[k] = copy(a.temp[k]); } } }
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili;
            e.conditions = copy(v.conditions ?? null);
            e.temp.apply = copy(v.temp.apply ?? {});
            allowDerived(e, v);
        }, { weaponSteal: cfg.specialKind === 'weapon_break' });
        return { accepted: true, kind: 'special', hit: directs.length > 0 || attacks.some(x => x.result === 0) };
    }
    // combo_disarm
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const busyAfter = num(a.busy);
    if (attacks.length === 0) {
        assert.ok(busyAfter >= (cfg.noComboBusyMin ?? 0) && busyAfter <= (cfg.noComboBusyMax ?? 4),
            'special no-combo busy range');
    } else {
        assert.ok(attacks.length >= (cfg.comboAttacksMin ?? 1)
            && attacks.length <= (cfg.comboAttacksMax ?? 8), 'special combo attack count');
        assert.ok(busyAfter >= (cfg.comboBusyMin ?? 0) && busyAfter <= (cfg.comboBusyMax ?? 6),
            'special busy range');
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        if (a.temp) { for (const k of Object.keys(a.temp)) { if (k !== 'apply' && k !== 'notify_fail' && k !== 'fight' && k !== 'block_msg' && k !== 'action_flag' && k !== 'die_reason' && k !== 'guarding') { if (!e.temp) e.temp = {}; e.temp[k] = copy(a.temp[k]); } } }
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    }, { weaponSteal: true });
    return {
        accepted: true, kind: 'special',
        hit: attacks.some(x => x.result === 0) || (attacks.length === 0 && num(v.busy) > num(t.busy)),
        specialKind: 'combo_disarm',
    };
}

export function b29Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB29Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
