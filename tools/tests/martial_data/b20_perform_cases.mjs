// B20 Xingxiu 5 + Tiezhang 5 + Xuedao 5 + Xiaoyao 5 perform batch (20 moves).
// Xingxiu: chousui-zhang dan/tao/shi, tianshan-zhang fugu/xue.
// Tiezhang: tie-zhang lei, tianlei-dao zha/shan, tongbi-zhang chu, tiexue-dao xue.
// Xuedao: xuedao-dafa ying/chi/xue/shi, honglian-dao huo.
// Xiaoyao: qingyun-shou zhuo, panyang-zhang pan, ruyi-dao ruyi, liuyue-jian liu,
// lingbo-weibu ling.
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

const xingxiuFamilies = ['星宿派'];
const tiezhangFamilies = ['铁掌帮'];
const xuedaoFamilies = ['血刀门'];
const xiaoyaoFamilies = ['逍遥派'];

export const b20SourcePaths = [
    'kungfu/skill/chanhun-suo.c', 'kungfu/skill/chanhun-suo/duo.c',
    'kungfu/skill/sanyin-wugongzhao.c', 'kungfu/skill/sanyin-wugongzhao/zhua.c',
    'kungfu/skill/chousui-zhang.c', 'kungfu/skill/chousui-zhang/shi.c',
    'kungfu/skill/tianshan-zhang.c', 'kungfu/skill/tianshan-zhang/fugu.c',
    'kungfu/skill/tianshan-zhang/xue.c',
    'kungfu/skill/tie-zhang.c', 'kungfu/skill/tie-zhang/lei.c',
    'kungfu/skill/tianlei-dao.c', 'kungfu/skill/tianlei-dao/zha.c',
    'kungfu/skill/tianlei-dao/shan.c',
    'kungfu/skill/tongbi-zhang.c', 'kungfu/skill/tongbi-zhang/chu.c',
    'kungfu/skill/tiexue-dao.c', 'kungfu/skill/tiexue-dao/xue.c',
    'kungfu/skill/xuedao-dafa.c',
    'kungfu/skill/xuedao-dafa/perform/ying.c',
    'kungfu/skill/xuedao-dafa/perform/chi.c',
    'kungfu/skill/xuedao-dafa/perform/xue.c',
    'kungfu/skill/xuedao-dafa/perform/shi.c',
    'kungfu/skill/honglian-dao.c', 'kungfu/skill/honglian-dao/huo.c',
    'kungfu/skill/qingyun-shou.c', 'kungfu/skill/qingyun-shou/zhuo.c',
    'kungfu/skill/panyang-zhang.c', 'kungfu/skill/panyang-zhang/pan.c',
    'kungfu/skill/ruyi-dao.c', 'kungfu/skill/ruyi-dao/ruyi.c',
    'kungfu/skill/liuyue-jian.c', 'kungfu/skill/liuyue-jian/liu.c',
    'kungfu/skill/lingbo-weibu.c', 'kungfu/skill/lingbo-weibu/ling.c',
    'kungfu/skill/huagong-dafa.c', 'kungfu/skill/tiezhang-xinfa.c',
    'kungfu/skill/poison.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c',
    'kungfu/skill/strike.c', 'kungfu/skill/hand.c',
    'kungfu/skill/cuff.c', 'kungfu/skill/staff.c',
    'kungfu/skill/throwing.c',
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
export const b20ReviewedSourceHash = 'PENDING';

const schools = {
    // ---- Xingxiu 5 ----
    'chanhun-suo/duo': {
        skill: 'chanhun-suo', ability: 'duo', abilityPath: 'duo',
        usage: 'whip', grant: 'can_perform/chanhun-suo/duo',
        forceSkill: 'force', kind: 'direct', weapon: 'whip', prepared: 'whip',
        families: xingxiuFamilies, actorFamily: '星宿派',
        title: '夺魂势',
        feeHit: 180, feeMiss: 100,
        hitBusy: 2, missBusy: 3,
        percent: 75, directType: 'WEAPON',
        extraSkills: { poison: 200 },
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [129, 130], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，使不了「夺魂势」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的缠魂索功力太浅，使不了「夺魂势」。\n' },
            { key: 'neili', pair: [219, 220], field: 'neili',
                refusal: '你的真气不够，无法使用「夺魂势」。\n' },
        ],
    },
    'sanyin-wugongzhao/zhua': {
        skill: 'sanyin-wugongzhao', ability: 'zhua', abilityPath: 'zhua',
        usage: 'claw', grant: 'can_perform/sanyin-wugongzhao/zhua',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'claw',
        families: xingxiuFamilies, actorFamily: '星宿派',
        title: '三阴毒爪',
        feeHit: 0, feeMiss: 0, unconditionalFee: true,
        hitBusy: 2, missBusy: 2,
        percent: 45, directType: 'UNARMED',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的三阴蜈蚣爪不够娴熟，无法使用「三阴毒爪」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你真气不足，无法施展「三阴毒爪」。\n' },
        ],
    },
    'chousui-zhang/shi': {
        skill: 'chousui-zhang', ability: 'shi', abilityPath: 'shi',
        usage: 'strike', grant: 'can_perform/chousui-zhang/shi',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: xingxiuFamilies, actorFamily: '星宿派',
        title: '腐尸毒',
        feeHit: 300, feeMiss: 200,
        hitBusy: 3, missBusy: 4,
        percent: 75, directType: 'REMOTE',
        extraSkills: { poison: 300, throwing: 360 },
        dpSkills: ['dodge'],
        gates: [
            { key: 'poison', pair: [199, 200], field: 'skill', skillName: 'poison',
                refusal: '你对毒技的了解不够，难以施展「腐尸毒」。\n' },
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的抽髓掌不够娴熟，难以施展「腐尸毒」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的内息不足，难以施展「腐尸毒」。\n' },
        ],
    },
    'tianshan-zhang/fugu': {
        skill: 'tianshan-zhang', ability: 'fugu', abilityPath: 'fugu',
        usage: 'staff', grant: 'can_perform/tianshan-zhang/fugu',
        forceSkill: 'force', kind: 'control', weapon: 'staff', prepared: null,
        families: xingxiuFamilies, actorFamily: '星宿派',
        title: '如蛆附骨',
        fee: 0,
        hitBusy: 0, missBusy: 1,
        targetBusyFormula: 'staff25-2', targetBusyRefusal: true,
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的天山杖法不够娴熟，不会使用「如蛆附骨」。\n' },
        ],
    },
    'tianshan-zhang/xue': {
        skill: 'tianshan-zhang', ability: 'xue', abilityPath: 'xue',
        usage: 'staff', grant: 'can_perform/tianshan-zhang/fugu',
        forceSkill: 'force', kind: 'combo', weapon: 'staff', prepared: null,
        families: xingxiuFamilies, actorFamily: '星宿派',
        title: '冰雪纷飞',
        fee: 120, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 3,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的天山杖法还不到家，无法使用「冰雪纷飞」！\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够！\n' },
        ],
    },
    // ---- Tiezhang 5 ----
    'tie-zhang/lei': {
        skill: 'tie-zhang', ability: 'lei', abilityPath: 'lei',
        usage: 'strike', grant: 'can_perform/tie-zhang/lei',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: tiezhangFamilies, actorFamily: '铁掌帮',
        title: '掌心雷',
        feeHit: 250, feeMiss: 100,
        hitBusy: 3, missBusy: 4,
        percent: 65, directType: 'UNARMED',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你铁掌掌法火候不够，难以施展「掌心雷」。\n' },
            { key: 'force', pair: [219, 220], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「掌心雷」。\n' },
            { key: 'max-neili', pair: [2199, 2200], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「掌心雷」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「掌心雷」。\n' },
        ],
    },
    'tianlei-dao/zha': {
        skill: 'tianlei-dao', ability: 'zha', abilityPath: 'zha',
        usage: 'blade', grant: 'can_perform/tianlei-dao/zha',
        forceSkill: 'force', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families: tiezhangFamilies, actorFamily: '铁掌帮',
        title: '春雷炸空',
        feeHit: 240, feeMiss: 180,
        hitBusyMin: 2, hitBusyMax: 5, missBusy: 2,
        percent: 65, directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你天雷绝刀不够娴熟，难以施展「春雷炸空」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「春雷炸空」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，难以施展「春雷炸空」。\n' },
        ],
    },
    'tianlei-dao/shan': {
        skill: 'tianlei-dao', ability: 'shan', abilityPath: 'shan',
        usage: 'blade', grant: 'can_perform/tianlei-dao/shan',
        forceSkill: 'force', kind: 'combo', weapon: 'blade', prepared: 'blade',
        families: tiezhangFamilies, actorFamily: '铁掌帮',
        title: '五雷连闪',
        fee: 180, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: [],
        targetBusyRefusal: true,
        targetBusyRefusalText: '右试弟子目前正自顾不暇，放胆攻击吧。\n',
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你天雷绝刀不够娴熟，难以施展「五雷连闪」。\n' },
            { key: 'dodge', pair: [179, 180], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，难以施展「五雷连闪」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，难以施展「五雷连闪」。\n' },
        ],
    },
    'tongbi-zhang/chu': {
        skill: 'tongbi-zhang', ability: 'chu', abilityPath: 'chu',
        usage: 'strike', grant: 'can_perform/tongbi-zhang/chu',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: tiezhangFamilies, actorFamily: '铁掌帮',
        title: '孤雁出群',
        feeHit: 80, feeMiss: 100,
        hitBusyMin: 1, hitBusyMax: 2, missBusy: 4,
        percent: 25, directType: 'UNARMED',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你通臂六合掌不够娴熟，难以施展「孤雁出群」。\n' },
            { key: 'neili', pair: [119, 120], field: 'neili',
                refusal: '你现在的真气不够，难以施展「孤雁出群」。\n' },
        ],
    },
    'tiexue-dao/xue': {
        skill: 'tiexue-dao', ability: 'xue', abilityPath: 'xue',
        usage: 'blade', grant: 'can_perform/tiexue-dao/xue',
        forceSkill: 'force', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families: tiezhangFamilies, actorFamily: '铁掌帮',
        title: '血浪滔天',
        feeHit: 120, feeMiss: 80,
        hitBusy: 2, missBusy: 3,
        percent: 35, directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你铁血刀法等级不够，难以施展「血浪滔天」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你目前的真气不足，难以施展「血浪滔天」。\n' },
        ],
    },
    // ---- Xuedao 5 ----
    'xuedao-dafa/ying': {
        skill: 'xuedao-dafa', ability: 'ying', abilityPath: 'perform/ying',
        usage: 'blade', grant: 'can_perform/xuedao-dafa/ying',
        forceSkill: 'xuedao-dafa', kind: 'control', weapon: 'blade', prepared: null,
        families: xuedaoFamilies, actorFamily: '血刀门',
        title: '无影神刀',
        fee: 80,
        hitBusy: 0, missBusy: 1,
        targetBusyFormula: 'blade27-2', targetBusyRefusal: true,
        targetBusyRefusalText: '右试弟子目前正自顾不暇，放胆攻击吧。\n',
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [159, 160], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「无影神刀」。\n' },
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的血刀大法还不到家，难以施展「无影神刀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够，难以施展「无影神刀」。\n' },
        ],
    },
    'xuedao-dafa/chi': {
        skill: 'xuedao-dafa', ability: 'chi', abilityPath: 'perform/chi',
        usage: 'blade', grant: 'can_perform/xuedao-dafa/chi',
        forceSkill: 'xuedao-dafa', kind: 'combo', weapon: 'blade', prepared: null,
        families: xuedaoFamilies, actorFamily: '血刀门',
        title: '赤炼神刀',
        fee: 150, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 6,
        applyKeys: ['attack'], comboHitAttackFromSkill: true,
        gates: [
            { key: 'force', pair: [219, 220], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「赤炼神刀」。\n' },
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的血刀大法还不到家，难以施展「赤炼神刀」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，难以施展「赤炼神刀」。\n' },
        ],
    },
    'xuedao-dafa/xue': {
        skill: 'xuedao-dafa', ability: 'xue', abilityPath: 'perform/xue',
        usage: 'blade', grant: 'can_perform/xuedao-dafa/xue',
        forceSkill: 'xuedao-dafa', kind: 'direct', weapon: 'blade', prepared: null,
        families: xuedaoFamilies, actorFamily: '血刀门',
        title: '祭血神刀',
        feeHit: 150, feeMiss: 100,
        hitBusy: 2, missBusy: 2,
        percent: 80, directType: 'WEAPON',
        selfWound: 50,
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [219, 220], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「祭血神刀」。\n' },
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的血刀大法还不到家，难以施展「祭血神刀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你目前真气不足，难以施展「祭血神刀」。\n' },
        ],
    },
    'xuedao-dafa/shi': {
        skill: 'xuedao-dafa', ability: 'shi', abilityPath: 'perform/shi',
        usage: 'blade', grant: 'can_perform/xuedao-dafa/shi',
        forceSkill: 'xuedao-dafa', kind: 'special', weapon: 'blade', prepared: null,
        families: xuedaoFamilies, actorFamily: '血刀门',
        title: '噬血穹苍',
        specialBusy: 'shi',
        feeMin: 200, feeMax: 400,
        selfWound: 80,
        meBusyMin: 2, meBusyMax: 7,
        percent: 75, directType: 'WEAPON',
        gates: [
            { key: 'force', pair: [249, 250], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「噬血穹苍」。\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的血刀大法还不到家，难以施展「噬血穹苍」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你目前真气不足，难以施展「噬血穹苍」。\n' },
        ],
    },
    'honglian-dao/huo': {
        skill: 'honglian-dao', ability: 'huo', abilityPath: 'huo',
        usage: 'blade', grant: 'can_perform/honglian-dao/huo',
        forceSkill: 'force', kind: 'combo', weapon: 'blade', prepared: 'blade',
        families: xuedaoFamilies, actorFamily: '血刀门',
        title: '流星火雨',
        fee: 80, comboAttacks: 4, comboBusyMin: 1, comboBusyMax: 4,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你红莲刀法不够娴熟，难以施展「流星火雨」。\n' },
            { key: 'max-neili', pair: [799, 800], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「流星火雨」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，难以施展「流星火雨」。\n' },
        ],
    },
    // ---- Xiaoyao 5 ----
    'qingyun-shou/zhuo': {
        skill: 'qingyun-shou', ability: 'zhuo', abilityPath: 'zhuo',
        usage: 'hand', grant: 'can_perform/qingyun-shou/zhuo',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'hand',
        families: xiaoyaoFamilies, actorFamily: '逍遥派',
        title: '捕风捉影',
        feeHit: 50, feeMiss: 30,
        hitBusy: 2, missBusy: 3,
        percent: 35, directType: 'UNARMED',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [49, 50], field: 'skill',
                refusal: '你的青云手不够娴熟，难以施展「捕风捉影」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，难以施展「捕风捉影」。\n' },
        ],
    },
    'panyang-zhang/pan': {
        skill: 'panyang-zhang', ability: 'pan', abilityPath: 'pan',
        usage: 'strike', grant: 'can_perform/panyang-zhang/pan',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: xiaoyaoFamilies, actorFamily: '逍遥派',
        title: '攀阳邀月',
        feeHit: 50, feeMiss: 30,
        hitBusy: 2, missBusy: 3,
        percent: 10, directType: 'UNARMED',
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的攀阳掌不够娴熟，难以施展「攀阳邀月」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，难以施展「攀阳邀月」。\n' },
        ],
    },
    'ruyi-dao/ruyi': {
        skill: 'ruyi-dao', ability: 'ruyi', abilityPath: 'ruyi',
        usage: 'blade', grant: 'can_perform/ruyi-dao/ruyi',
        forceSkill: 'force', kind: 'combo', weapon: 'blade', prepared: 'blade',
        families: xiaoyaoFamilies, actorFamily: '逍遥派',
        title: '如意六刀',
        fee: 120, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 6,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的如意刀法还不到家，难以施展「如意六刀」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够，难以施展「如意六刀」。\n' },
        ],
    },
    'liuyue-jian/liu': {
        skill: 'liuyue-jian', ability: 'liu', abilityPath: 'liu',
        usage: 'sword', grant: 'can_perform/liuyue-jian/liu',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: xiaoyaoFamilies, actorFamily: '逍遥派',
        title: '流月剑诀',
        feeHit: 150, feeMiss: 60,
        hitBusy: 2, missBusy: 3,
        percent: 45, directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「流月剑诀」。\n' },
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的流月剑舞修为不够，难以施展「流月剑诀」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够，难以施展「流月剑诀」。\n' },
        ],
    },
    'lingbo-weibu/ling': {
        skill: 'lingbo-weibu', ability: 'ling', abilityPath: 'ling',
        usage: 'dodge', grant: 'can_perform/lingbo-weibu/ling',
        forceSkill: 'force', kind: 'buff', weapon: null, prepared: null,
        families: xiaoyaoFamilies, actorFamily: '逍遥派',
        title: '洛神凌波',
        fee: 400, meBusy: 2,
        buff: 'lingbo', buffApply: true, buffApplyKeys: ['dex'],
        alreadyActiveCap: 1,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的凌波微步还不够熟练，难以施展「洛神凌波」。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你现在真气不足，难以施展「洛神凌波」。\n' },
        ],
    },
};

export const b20Schools = schools;

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

export function b20PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b20SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b20ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b20ReviewedSourceHash,
            'Reviewed B20 sources changed; re-review before sampling');
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
                id: `b20-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b20', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b20-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b20SourcePaths],
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
                refusal: '你已经运起「洛神凌波」了。\n',
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
        case 'staff25-2': return Math.trunc(effSkill('staff') / 25) + 2;
        case 'blade27-2': return Math.trunc(effSkill('blade') / 27) + 2;
        case 'random3': return 0;
        case 'random13': return 0;
        default: return 0;
    }
}

export function validateB20Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B20 entry');
    assert.equal(p.collection_group, 'b20-perform');
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
    if (cfg.kind === 'control') return validateB20Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'special') return validateB20Special(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB20Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'buff') return validateB20Buff(raw, condition, cfg, p, b, t, a, v);
    return validateB20Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB20Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const miss = directs.length === 0 && sparse(raw.metrics[0], 'direct') === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    const directCount = sparse(raw.metrics[0], 'direct');
    assert.ok(directCount >= 0, 'direct count');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const paid = b.neili - a.neili;
    let fee;
    if (cfg.unconditionalFee) fee = cfg.feeHit ?? 0;
    else if (miss) fee = cfg.feeMiss ?? 0;
    else fee = cfg.feeHit ?? 0;
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
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB20Control(raw, condition, cfg, p, b, t, a, v) {
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

function validateB20Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    assert.ok(fee >= (cfg.fee ?? 0), 'combo fee floor');
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

function validateB20Buff(raw, condition, cfg, p, b, t, a, v) {
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
        const delta = cfg.buffApplyDelta ?? Math.trunc(level / 30);
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

function validateB20Special(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const fee = b.neili - a.neili;
    if (cfg.specialBusy === 'tao') {
        // Self-sacrifice nuke: neili zeroed, max_neili drained, busy lands.
        assert.equal(num(a.neili), 0, 'tao zeroes neili');
        const maxDrop = num(b.max_neili) - num(a.max_neili);
        assert.ok(maxDrop >= 50 && maxDrop <= 100, 'tao max_neili drain');
        const busyAfter = num(a.busy);
        assert.ok(busyAfter >= cfg.meBusyMin && busyAfter <= cfg.meBusyMax, 'tao busy');
        assertLearnGain(a, p.skill);
        const hit = num(v.qi) !== num(t.qi) || num(v.jing) !== num(t.jing);
        stableState(b, a, e => {
            e.neili = 0; e.max_neili = a.max_neili; e.busy = a.busy; e.learned = a.learned;
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
    if (cfg.specialBusy === 'shi') {
        // Direct + combo hybrid: first strike with skill bonus, then 6 attacks.
        const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
        assert.ok(fee >= cfg.feeMin && fee <= cfg.feeMax, 'shi fee range');
        assert.equal(num(b.qi) - num(a.qi), cfg.selfWound, 'shi self wound');
        const busyAfter = num(a.busy);
        assert.ok(busyAfter >= cfg.meBusyMin && busyAfter <= cfg.meBusyMax, 'shi busy');
        assertLearnGain(a, p.skill);
        const hit = directs.length === 1 || num(v.qi) !== num(t.qi);
        if (directs.length === 1) {
            const input = num(directs[0].damage);
            const support = supportRange(input, cfg.percent, b, t, cfg.directType);
            assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
                'shi direct must match do_damage support');
        }
        assert.ok(attacks.length >= 0 && attacks.length <= 6, 'shi combo attacks');
        stableState(b, a, e => {
            e.neili -= fee; e.qi = a.qi; e.eff_qi = a.eff_qi; e.busy = a.busy; e.learned = a.learned;
            e.temp.apply = copy(a.temp.apply ?? {});
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

export function b20Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB20Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
