// B7 Shaolin-exclusive perform batch (21 moves). Finger/palm/hand/claw and
// weapon specials unique to Shaolin (jingang-zhi, rulai-zhang, ranmu-daofa
// and kin). One collection settles Shaolin's exclusive perform coverage.
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
    combat_exp: 100000000, str: 36, int: 36, con: 36, dex: 36, shen: 200000,
    gender: '男性', character: '光明磊落' };

// Shaolin-exclusive: one family settles its own perform coverage.
const families = ['少林派'];

export const b7SourcePaths = [
    'kungfu/skill/jingang-zhi.c', 'kungfu/skill/jingang-zhi/fumo.c',
    'kungfu/skill/jingang-zhi/san.c',
    'kungfu/skill/rulai-zhang.c', 'kungfu/skill/rulai-zhang/zong.c',
    'kungfu/skill/ranmu-daofa.c', 'kungfu/skill/ranmu-daofa/huo.c',
    'kungfu/skill/ranmu-daofa/zhenyan.c',
    'kungfu/skill/nianhua-zhi.c', 'kungfu/skill/nianhua-zhi/fuxue.c',
    'kungfu/skill/xiuluo-zhi.c', 'kungfu/skill/xiuluo-zhi/jueming.c',
    'kungfu/skill/duoluoye-zhi.c', 'kungfu/skill/duoluoye-zhi/jimie.c',
    'kungfu/skill/wuxiang-zhi.c', 'kungfu/skill/wuxiang-zhi/wuse.c',
    'kungfu/skill/qufannao-zhi.c', 'kungfu/skill/qufannao-zhi/lingkong.c',
    'kungfu/skill/dacidabei-shou.c', 'kungfu/skill/dacidabei-shou/yin.c',
    'kungfu/skill/yintuoluo-zhua.c', 'kungfu/skill/yintuoluo-zhua/chixue.c',
    'kungfu/skill/longzhua-gong.c', 'kungfu/skill/longzhua-gong/zhua.c',
    'kungfu/skill/jimie-zhua.c', 'kungfu/skill/jimie-zhua/wuwo.c',
    'kungfu/skill/fengyun-shou.c', 'kungfu/skill/fengyun-shou/qinna.c',
    'kungfu/skill/sanhua-zhang.c', 'kungfu/skill/sanhua-zhang/san.c',
    'kungfu/skill/woshi-zhang.c', 'kungfu/skill/woshi-zhang/po.c',
    'kungfu/skill/xumishan-zhang.c', 'kungfu/skill/xumishan-zhang/ying.c',
    'kungfu/skill/shenzhang-bada.c', 'kungfu/skill/shenzhang-bada/bafang.c',
    'kungfu/skill/luohan-quan.c', 'kungfu/skill/luohan-quan/xiangmo.c',
    'kungfu/skill/qingliang-jian.c', 'kungfu/skill/qingliang-jian/ming.c',
    'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/jingluo-xue.c',
    'kungfu/skill/buddhism.c',
    'kungfu/skill/finger.c', 'kungfu/skill/hand.c', 'kungfu/skill/claw.c',
    'kungfu/skill/cuff.c', 'kungfu/skill/strike.c', 'kungfu/skill/sword.c',
    'kungfu/skill/blade.c',
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
export const b7ReviewedSourceHash = 'aaec4b09003b4ad73ee57a94f8253a77d5140345593d363c98aa4f57fe836224';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. forceSkill is the mapped special force for the actor.
const schools = {
    'jingang-zhi/fumo': {
        skill: 'jingang-zhi', ability: 'fumo', abilityPath: 'fumo',
        usage: 'finger', grant: 'can_perform/jingang-zhi/fumo',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'finger',
        families, actorFamily: '少林派',
        title: '大力金刚指「金刚伏魔诀」', directType: 'REMOTE', percent: 100,
        dpSkills: ['dodge', 'parry'], feeHit: 300, feeMiss: 100, hitBusy: 2, missBusy: 3,
        shaolinForce: true,
        gates: [
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用这一绝技！\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的大力金刚指修为不够，目前不能使用「金刚伏魔诀」！\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的真气不够，无法使用「金刚伏魔诀」！\n' },
        ],
    },
    'jingang-zhi/san': {
        skill: 'jingang-zhi', ability: 'san', abilityPath: 'san',
        usage: 'finger', grant: 'can_perform/jingang-zhi/san',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'finger',
        families, actorFamily: '少林派',
        title: '大力金刚指「一指点三脉」', directType: 'UNARMED', percent: 150,
        dpSkills: ['parry'], feeHit: 800, feeMiss: 800, hitBusyMin: 3, hitBusyMax: 5,
        missBusyMin: 3, missBusyMax: 5, unconditionalFee: true,
        targetBusyOnHit: 'skill30', extraSkills: { 'jingluo-xue': 300 },
        shaolinForce: true,
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你大力金刚指不够娴熟，难以施展「一指点三脉」。\n' },
            { key: 'jingluo', pair: [199, 200], field: 'skill', skillName: 'jingluo-xue',
                refusal: '你对经络学了解不够，难以施展「一指点三脉」。\n' },
            { key: 'force', pair: [299, 300], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「一指点三脉」。\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「一指点三脉」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在的真气不够，难以施展「一指点三脉」。\n' },
        ],
    },
    'rulai-zhang/zong': {
        skill: 'rulai-zhang', ability: 'zong', abilityPath: 'zong',
        usage: 'strike', grant: 'can_perform/rulai-zhang/zong',
        forceSkill: 'hunyuan-yiqi', kind: 'combo', weapon: null, prepared: 'strike',
        families, actorFamily: '少林派',
        title: '千手如来掌「万佛朝宗」',
        fee: 300, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 6,
        applyKeys: ['attack'], crush: true,
        gates: [
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「万佛朝宗」。\n' },
            { key: 'force', pair: [279, 280], field: 'effective-force',
                refusal: '你的内功火候不足，难以施展「万佛朝宗」。\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你千手如来掌火候不够，难以施展「万佛朝宗」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「万佛朝宗」。\n' },
        ],
    },
    'ranmu-daofa/huo': {
        skill: 'ranmu-daofa', ability: 'huo', abilityPath: 'huo',
        usage: 'blade', grant: 'can_perform/ranmu-daofa/huo',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families, actorFamily: '少林派',
        title: '燃木刀法「火麒蚀月」', directType: 'WEAPON', percent: 130,
        dpSkills: ['force'], feeHit: 400, feeMiss: 200,
        hitBusyMin: 2, hitBusyMax: 3, missBusyMin: 2, missBusyMax: 3, targetBusyOnHit: 2,
        shaolinForce: true,
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的燃木刀法不够娴熟，不能使用火麒蚀月。\n' },
            { key: 'force', pair: [249, 250], field: 'effective-force',
                refusal: '你的内功火候不够，不能使用火麒蚀月。\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为太弱，不能使用火麒蚀月。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你现在内力太弱，不能使用火麒蚀月。\n' },
        ],
    },
    'ranmu-daofa/zhenyan': {
        skill: 'ranmu-daofa', ability: 'zhenyan', abilityPath: 'zhenyan',
        usage: 'blade', grant: 'can_perform/ranmu-daofa/zhenyan',
        forceSkill: 'hunyuan-yiqi', kind: 'buff', weapon: 'blade', prepared: 'blade',
        families, actorFamily: '少林派',
        title: '燃木刀法「燃木真焰」',
        fee: 400, meBusy: 2, buff: 'zhen_yan',
        applyKeys: ['attack', 'defense', 'damage'], shaolinForce: true,
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的燃木刀法修为不够，难以施展「燃木真焰」。\n' },
            { key: 'max-neili', pair: [2499, 2500], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「燃木真焰」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「燃木真焰」。\n' },
        ],
    },
    'nianhua-zhi/fuxue': {
        skill: 'nianhua-zhi', ability: 'fuxue', abilityPath: 'fuxue',
        usage: 'finger', grant: 'can_perform/nianhua-zhi/fuxue',
        forceSkill: 'hunyuan-yiqi', kind: 'control', weapon: null, prepared: 'finger',
        families, actorFamily: '少林派',
        title: '拈花指「拈花拂穴」',
        dpSkills: [], feeHit: 100, feeMiss: 30, meBusyMiss: 3,
        controlByExp: true,
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-force',
                refusal: '你内功火候不够，不能使用拈花拂穴！\n' },
            { key: 'finger', pair: [149, 150], field: 'effective-finger',
                refusal: '你的指法修为不够，目前还不能使用拈花拂穴绝技！\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，不能使用拈花拂穴！\n' },
        ],
    },
    'xiuluo-zhi/jueming': {
        skill: 'xiuluo-zhi', ability: 'jueming', abilityPath: 'jueming',
        usage: 'finger', grant: 'can_perform/xiuluo-zhi/jueming',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'finger',
        families, actorFamily: '少林派',
        title: '修罗指「修罗绝命指」', directType: 'UNARMED', percent: 80,
        dpSkills: ['dodge', 'parry'], feeHit: 350, feeMiss: 150, hitBusy: 1, missBusy: 3,
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用「修罗绝命指」！\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的修罗指修为不够，目前不能使用「修罗绝命指」！\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，无法使用「修罗绝命指」！\n' },
        ],
    },
    'duoluoye-zhi/jimie': {
        skill: 'duoluoye-zhi', ability: 'jimie', abilityPath: 'jimie',
        usage: 'finger', grant: 'can_perform/duoluoye-zhi/jimie',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'finger',
        families, actorFamily: '少林派',
        title: '多罗叶指「菩提寂灭」', directType: 'UNARMED', percent: 70,
        dpSkills: ['dodge', 'force'], feeHit: 500, feeMiss: 200, hitBusy: 2, missBusy: 3,
        selfWound: 'quarter',
        gates: [
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用这一绝技！\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的多罗叶指修为不够，目前不能使用「菩提寂灭」！\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你的真气不够，无法使用「菩提寂灭」！\n' },
            { key: 'max-neili', pair: [2499, 2500], field: 'max_neili',
                refusal: '你的真气不够，无法使用「菩提寂灭」！\n' },
        ],
    },
    'wuxiang-zhi/wuse': {
        skill: 'wuxiang-zhi', ability: 'wuse', abilityPath: 'wuse',
        usage: 'finger', grant: 'can_perform/wuxiang-zhi/wuse',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'finger',
        families, actorFamily: '少林派',
        title: '无相指「无色无相」', directType: 'REMOTE', percent: 60,
        dpSkills: ['dodge', 'parry'], feeHit: 200, feeMiss: 100, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的无相指修为不够，目前不能使用「无色无相」！\n' },
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用这一绝技！\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的真气不够，无法使用「无色无相」！\n' },
        ],
    },
    'qufannao-zhi/lingkong': {
        skill: 'qufannao-zhi', ability: 'lingkong', abilityPath: 'lingkong',
        usage: 'finger', grant: 'can_perform/qufannao-zhi/lingkong',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'finger',
        families, actorFamily: '少林派',
        title: '去烦恼指「凌空指穴」', receiveOnly: true,
        dpSkills: ['force', 'dodge', 'parry'], fee: 0, meBusy: 3,
        remoteWound: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的去烦恼指不够娴熟，不会使用「凌空指穴」。\n' },
            { key: 'hunyuan', pair: [99, 100], field: 'skill', skillName: 'hunyuan-yiqi',
                refusal: '你的心意气混元功不够高，不能用内力催动指力伤敌。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在内力太弱，不能使用「凌空指穴」。\n' },
        ],
    },
    'dacidabei-shou/yin': {
        skill: 'dacidabei-shou', ability: 'yin', abilityPath: 'yin',
        usage: 'hand', grant: 'can_perform/dacidabei-shou/yin',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'hand',
        families, actorFamily: '少林派',
        title: '大慈大悲手「大手印」', receiveOnly: true,
        dpSkills: [], fee: 200, meBusyMin: 2, meBusyMax: 3,
        extraSkills: { buddhism: 300 },
        gates: [
            { key: 'buddhism', pair: [199, 200], field: 'skill', skillName: 'buddhism',
                refusal: '你的佛法修为不足，无法施展该绝招！\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的大慈大悲手不够娴熟，不会使用「大手印」！\n' },
            { key: 'hand', pair: [179, 180], field: 'effective-hand',
                refusal: '你的基本手法不够娴熟，不会使用「大手印」！\n' },
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你的内力太弱，不能使用「大手印」！\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你的内力太少了，无法使用出「大手印」！\n' },
        ],
    },
    'yintuoluo-zhua/chixue': {
        skill: 'yintuoluo-zhua', ability: 'chixue', abilityPath: 'chixue',
        usage: 'claw', grant: 'can_perform/yintuoluo-zhua/chixue',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'claw',
        families, actorFamily: '少林派',
        title: '因陀罗爪「赤血连环爪」', directType: 'UNARMED', percent: 120,
        dpSkills: ['dodge', 'parry'], feeHit: 400, feeMiss: 100,
        hitBusy: 3, missBusy: 4, instantDeath: true, crush: true,
        followupAttacks: 4,
        shaolinForce: true,
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你因陀罗爪不够娴熟，难以施展「赤血连环爪」。\n' },
            { key: 'force', pair: [299, 300], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展「赤血连环爪」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不够，难以施展「赤血连环爪」。\n' },
        ],
    },
    'longzhua-gong/zhua': {
        skill: 'longzhua-gong', ability: 'zhua', abilityPath: 'zhua',
        usage: 'claw', grant: 'can_perform/longzhua-gong/zhua',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'claw',
        families, actorFamily: '少林派',
        title: '龙爪功「神龙抓」', directType: 'UNARMED', percent: 45,
        dpSkills: ['dodge', 'parry'], feeHit: 180, feeMiss: 60, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [134, 135], field: 'skill',
                refusal: '你的龙爪功等级不够，不会使用「神龙抓」！\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，无法运用「神龙抓」！\n' },
        ],
    },
    'jimie-zhua/wuwo': {
        skill: 'jimie-zhua', ability: 'wuwo', abilityPath: 'wuwo',
        usage: 'claw', grant: 'can_perform/jimie-zhua/wuwo',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'claw',
        families, actorFamily: '少林派',
        title: '寂灭爪「众生无我」', directType: 'UNARMED', percent: 55,
        dpSkills: ['dodge', 'parry'], feeHit: 200, feeMiss: 20, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的寂灭爪等级不够，不会使用「众生无我」！\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够！\n' },
        ],
    },
    'fengyun-shou/qinna': {
        skill: 'fengyun-shou', ability: 'qinna', abilityPath: 'qinna',
        usage: 'hand', grant: 'can_perform/fengyun-shou/qinna',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'hand',
        families, actorFamily: '少林派',
        title: '风云手「擒拿」', directType: 'UNARMED', percent: 30,
        dpSkills: ['dodge', 'parry'], feeHit: 80, feeMiss: 20, hitBusy: 1, missBusy: 3,
        targetBusyOnHit: 'ap25',
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的风云手等级不够，不会使用「擒拿」！\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够，无法运用「擒拿」！\n' },
        ],
    },
    'sanhua-zhang/san': {
        skill: 'sanhua-zhang', ability: 'san', abilityPath: 'san',
        usage: 'strike', grant: 'can_perform/sanhua-zhang/san',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'strike',
        families, actorFamily: '少林派',
        title: '散花掌「天女散花」', directType: 'UNARMED', percent: 40,
        dpSkills: ['dodge'], feeHit: 150, feeMiss: 50, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [134, 135], field: 'skill',
                refusal: '你的散花掌法不够娴熟，不会使用天女散花。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展天女散花。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，无法使用天女散花。\n' },
        ],
    },
    'woshi-zhang/po': {
        skill: 'woshi-zhang', ability: 'po', abilityPath: 'po',
        usage: 'strike', grant: 'can_perform/woshi-zhang/po',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'strike',
        families, actorFamily: '少林派',
        title: '握石掌「碎石破玉」', directType: 'UNARMED', percent: 50,
        dpSkills: ['parry'], feeHit: 250, feeMiss: 120, hitBusy: 2, missBusy: 2,
        gates: [
            { key: 'force', pair: [139, 140], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用这一绝技！\n' },
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的握石掌修为不够，目前不能使用「碎石破玉」！\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在真气不够，难以施展「碎石破玉」。\n' },
        ],
    },
    'xumishan-zhang/ying': {
        skill: 'xumishan-zhang', ability: 'ying', abilityPath: 'ying',
        usage: 'strike', grant: 'can_perform/xumishan-zhang/ying',
        forceSkill: 'hunyuan-yiqi', kind: 'combo', weapon: null, prepared: 'strike',
        families, actorFamily: '少林派',
        title: '须弥山掌「群山叠影」',
        fee: 150, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: ['attack'],
        gates: [
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在真气太弱，不能使用「群山叠影」。\n' },
        ],
    },
    'shenzhang-bada/bafang': {
        skill: 'shenzhang-bada', ability: 'bafang', abilityPath: 'bafang',
        usage: 'strike', grant: 'can_perform/shenzhang-bada/bafang',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'strike',
        families, actorFamily: '少林派',
        title: '神掌八打「威镇八方」', directType: 'REMOTE', percent: 70,
        dpSkills: ['dodge'], feeHit: 350, feeMiss: 100, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'force', pair: [299, 300], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用这一绝技！\n' },
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你的神掌八打修为不够，目前不能使用「威镇八方」！\n' },
            { key: 'neili', pair: [699, 700], field: 'neili',
                refusal: '你的真气不够，无法使用「威镇八方」！\n' },
        ],
    },
    'luohan-quan/xiangmo': {
        skill: 'luohan-quan', ability: 'xiangmo', abilityPath: 'xiangmo',
        usage: 'cuff', grant: 'can_perform/luohan-quan/xiangmo',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: null, prepared: 'cuff',
        families, actorFamily: '少林派',
        title: '罗汉拳「罗汉降魔」', directType: 'UNARMED', percent: 20,
        dpSkills: ['dodge', 'parry'], feeHit: 30, feeMiss: 10, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [19, 20], field: 'skill',
                refusal: '你的罗汉拳法不够娴熟，现在还无法使用「罗汉降魔」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你现在真气不够，无法运用「罗汉降魔」。\n' },
        ],
    },
    'qingliang-jian/ming': {
        skill: 'qingliang-jian', ability: 'ming', abilityPath: 'ming',
        usage: 'sword', grant: 'can_perform/qingliang-jian/ming',
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '少林派',
        title: '清凉剑法「禅心自明」', directType: 'WEAPON', percent: 20,
        dpSkills: ['parry'], feeHit: 40, feeMiss: 20, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'force', pair: [99, 100], field: 'effective-force',
                refusal: '你的内功的修为不够，难以施展「禅心自明」。\n' },
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的清凉剑法修为不够，难以施展「禅心自明」。\n' },
            { key: 'neili', pair: [79, 80], field: 'neili',
                refusal: '你现在真气不够，难以施展「禅心自明」。\n' },
        ],
    },
};

export const b7Schools = schools;

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
            case 'dex': raise(properties, 'dex', high); break;
            case 'effective-force': raise(skills, cfg.forceSkill, high); break;
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
        case 'dex': return { properties: { dex: value - 20 } };
        case 'effective-force': return { skills: { force: 0, [cfg.forceSkill]: value } };
        case 'effective-finger': return { skills: { finger: 0, [cfg.skill]: value } };
        case 'effective-hand': return { skills: { hand: 0, [cfg.skill]: value } };
        default: return { skills: { [gate.field]: value } };
    }
};

export function b7PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b7SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b7ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b7ReviewedSourceHash,
            'Reviewed B7 sources changed; re-review before sampling');
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
            for (const u of ['sword', 'unarmed', 'dodge', 'hand', 'cuff', 'strike', 'staff', 'finger', 'blade', 'throwing', 'parry'])
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
                id: `b7-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b7', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b7-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b7SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}少林独有批量：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '万佛朝宗与赤血连环爪的内力碾压分支、燃木真焰临时增益、'
                        + '拈花拂穴按经验判定、菩提寂灭自伤、凌空指穴与大手印直接伤血、'
                        + '擒拿目标忙乱均按原分支记账。只收集数据，不比较强弱。',
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
        if (cfg.kind === 'buff') {
            add('already-active', { actorTemp: { [cfg.buff]: 1 },
                refusal: '「燃木真焰」无法连续施展。\n' });
        } else if (cfg.receiveOnly) {
            add('hit', { targetSkills: { dodge: 0, parry: 0, force: 0 }, samples: 4 });
            add('miss', { targetSkills: { dodge: 100000, parry: 100000, force: 100000 }, samples: 4 });
        } else if (cfg.dpSkills && cfg.dpSkills.length && cfg.kind !== 'combo') {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        // Special constraints: explicit boundary variants only.
        if (cfg.shaolinForce)
            add('wrong-force', { skills: { 'taiji-shengong': 200 },
                mappings: { force: 'taiji-shengong' },
                refusal: cfg.ability === 'san'
                    ? '你现在没有激发少林内功为内功，难以施展「一指点三脉」。\n'
                    : cfg.ability === 'huo'
                        ? '你现在没有激发少林内功为内功，难以施展「火麒蚀月」。\n'
                        : cfg.ability === 'zhenyan'
                            ? '你现在没有激发少林内功为内功，难以施展「燃木真焰」。\n'
                            : cfg.ability === 'wuse'
                                ? '你现在没有激发少林内功为内功，难以施展「无色无相」。\n'
                                : cfg.ability === 'chixue'
                                    ? '你现在没有激发少林内功为内功，难以施展「赤血连环爪」。\n'
                                    : '你现在没有激发少林内功为内功，难以施展「金刚伏魔诀」。\n' });
        if (cfg.crush)
            add('instant-death', {
                targetProperties: { max_neili: 1000 },
                targetSkills: { dodge: 0, parry: 0, force: 0 }, samples: 2 });
        if (cfg.ability === 'fuxue')
            add('target-busy', { targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧！\n' });
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
        if (side.temp && side.temp["rulai-zhang"] && Object.keys(side.temp["rulai-zhang"]).length === 0)
            delete side.temp["rulai-zhang"];
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

export function validateB7Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B7 entry');
    assert.equal(p.collection_group, 'b7-perform');
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
    if (cfg.kind === 'buff') return validateB7Buff(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct' && cfg.receiveOnly) return validateB7Receive(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB7Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB7Control(raw, condition, cfg, p, b, t, a, v);
    return validateB7Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB7Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    // Crush branch: max_neili > target*2 disables target without do_damage.
    if (cfg.crush && p.variant === 'instant-death') {
        assert.equal(directs.length, 0, 'crush has no direct');
        assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
        const spent = b.neili - a.neili;
        assert.ok(spent === 500 || spent === 300, 'crush fee');
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
        stableState(b, a, e => {
            e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
            if (cfg.selfWound === 'quarter') {
                e.qi = a.qi; e.eff_qi = a.eff_qi;
            }
            allowDerived(e, a);
        });
        if (cfg.targetBusyOnMiss || cfg.followupAttacks) stableState(t, v, e => { e.busy = v.busy; e.qi = v.qi; e.eff_qi = v.eff_qi; });
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
        if (cfg.selfWound === 'quarter') {
            e.qi = a.qi; e.eff_qi = a.eff_qi;
        }
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

function validateB7Receive(raw, condition, cfg, p, b, t, a, v) {
    // lingkong/yin: receive_damage/receive_wound, not do_damage.
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'receive not do_damage');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    const spent = b.neili - a.neili;
    const miss = v.qi === t.qi && v.eff_qi === t.eff_qi;
    assertLearnGain(a, p.skill);
    if (miss) {
        assert.equal(spent, cfg.fee, 'fee');
        stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.ok(v.qi < t.qi, 'receive damage applied');
    assert.ok(v.eff_qi <= t.eff_qi, 'receive wound applied');
    stableState(b, a, e => { e.neili -= spent; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy;
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'direct', hit: true };
}

function validateB7Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const hit = num(v.busy) > 0;
    const fee = hit ? cfg.feeHit : cfg.feeMiss;
    assert.equal(cost, fee, 'branch fee');
    assert.equal(b.neili - a.neili, fee, 'no extra deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    if (hit) {
        // fuxue: target busy = query_skill(nianhua-zhi)/19 + 2 (effective).
        const level = num(sparse(b.skills, cfg.skill));
        assert.equal(tBusy, Math.trunc(level / 19) + 2, 'fuxue target busy');
        assert.equal(busyAfter, 0, 'no me busy on hit');
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

function validateB7Buff(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'buff has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'buff fee');
    assert.equal(b.neili - a.neili, cfg.fee, 'buff fee deduction');
    assert.equal(num(a.busy ?? 0), p.fighting ? cfg.meBusy : 0);
    assert.equal(temp(a, cfg.buff), 1, 'buff flag set');
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    // zhenyan: apply/attack+defense += skill*2/5, apply/damage += skill/4.
    const skill = num(sparse(b.skills, cfg.skill));
    assert.equal(temp(a, 'apply/attack') - temp(b, 'apply/attack'), Math.trunc(skill * 2 / 5));
    assert.equal(temp(a, 'apply/defense') - temp(b, 'apply/defense'), Math.trunc(skill * 2 / 5));
    assert.equal(temp(a, 'apply/damage') - temp(b, 'apply/damage'), Math.trunc(skill / 4));
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        e.temp[cfg.buff] = 1;
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'buff' };
}

function validateB7Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    if (cfg.crush && p.variant === 'instant-death') {
        assert.ok(fee === 500 || fee === 300, 'crush fee');
        assert.ok(v.eff_qi <= 1 || num(v.living) === 0, 'crush disables target');
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            e.qi = a.qi; e.temp.apply = copy(a.temp.apply ?? {});
            allowDerived(e, a);
        });
        return { accepted: true, kind: 'combo', hit: attacks.some(x => x.result === 0), hits: attacks.length };
    }
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

export function b7Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB7Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
