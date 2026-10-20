// B14 Songshan-exclusive 11 + Xuanming-exclusive 11 perform batch (22 moves).
// Songshan: hanbing-zhang hen/han, poyang-jian xian/long, yinyang-zhang qian,
// jiuqu-jian wan, songshan-zhang po, songshan-jian meng, songyang-zhang ying,
// lingyun-jian xiao, chuanyue-jian hao. Xuanming: ningxue-zhang xue,
// lutou-zhang tong, xuanming-zhang zhe/lang/ying, dulong-shenzhua bao/ju,
// feihua-zhang fei, piaofeng-quan juan, jingyue-bifa ci, hexing-bifa dian.
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

// Songshan-exclusive moves settle 嵩山派; Xuanming-exclusive settle 玄冥谷.
const songshanFamilies = ['嵩山派'];
const xuanmingFamilies = ['玄冥谷'];

export const b14SourcePaths = [
    'kungfu/skill/hanbing-zhang.c', 'kungfu/skill/hanbing-zhang/hen.c',
    'kungfu/skill/hanbing-zhang/han.c',
    'kungfu/skill/poyang-jian.c', 'kungfu/skill/poyang-jian/xian.c',
    'kungfu/skill/poyang-jian/long.c',
    'kungfu/skill/yinyang-zhang.c', 'kungfu/skill/yinyang-zhang/qian.c',
    'kungfu/skill/jiuqu-jian.c', 'kungfu/skill/jiuqu-jian/wan.c',
    'kungfu/skill/songshan-zhang.c', 'kungfu/skill/songshan-zhang/po.c',
    'kungfu/skill/songshan-jian.c', 'kungfu/skill/songshan-jian/meng.c',
    'kungfu/skill/songyang-zhang.c', 'kungfu/skill/songyang-zhang/ying.c',
    'kungfu/skill/lingyun-jian.c', 'kungfu/skill/lingyun-jian/xiao.c',
    'kungfu/skill/chuanyue-jian.c', 'kungfu/skill/chuanyue-jian/hao.c',
    'kungfu/skill/ningxue-zhang.c', 'kungfu/skill/ningxue-zhang/xue.c',
    'kungfu/skill/lutou-zhang.c', 'kungfu/skill/lutou-zhang/tong.c',
    'kungfu/skill/xuanming-zhang.c', 'kungfu/skill/xuanming-zhang/zhe.c',
    'kungfu/skill/xuanming-zhang/lang.c', 'kungfu/skill/xuanming-zhang/ying.c',
    'kungfu/skill/dulong-shenzhua.c', 'kungfu/skill/dulong-shenzhua/bao.c',
    'kungfu/skill/dulong-shenzhua/ju.c',
    'kungfu/skill/feihua-zhang.c', 'kungfu/skill/feihua-zhang/fei.c',
    'kungfu/skill/piaofeng-quan.c', 'kungfu/skill/piaofeng-quan/juan.c',
    'kungfu/skill/jingyue-bifa.c', 'kungfu/skill/jingyue-bifa/ci.c',
    'kungfu/skill/hexing-bifa.c', 'kungfu/skill/hexing-bifa/dian.c',
    'kungfu/skill/songshan-xinfa.c', 'kungfu/skill/xuanming-shengong.c',
    'kungfu/skill/dagger.c', 'kungfu/skill/claw.c',
    'kungfu/skill/sword.c', 'kungfu/skill/staff.c',
    'kungfu/skill/strike.c', 'kungfu/skill/cuff.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/blade.c',
    'kungfu/skill/throwing.c', 'kungfu/skill/hand.c',
    'kungfu/skill/whip.c',
    'kungfu/skill/force.c', 'kungfu/skill/parry.c', 'kungfu/skill/dodge.c',
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
export const b14ReviewedSourceHash = '8e1969cf73e2c66c45d9c76550f42462463b3052a2cbaa1e5df20bd514447897';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. Songshan moves gate on basic force; zhe/lang gate on
// xuanming-shengong and require it mapped as force.
const schools = {
    'hanbing-zhang/hen': {
        skill: 'hanbing-zhang', ability: 'hen', abilityPath: 'hen',
        usage: 'strike', grant: 'can_perform/hanbing-zhang/hen',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'strike',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '寒冰掌「踏雪无痕」',
        feeHit: 100, feeMiss: 30,
        meBusyHit: 1, meBusyMiss: 2,
        targetBusyFormula: 'ap40-2', dpSkills: ['dodge'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你寒冰掌不够娴熟，难以施展「踏雪无痕」。\n' },
            { key: 'dodge', pair: [149, 150], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，难以施展「踏雪无痕」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在的真气不够，难以施展「踏雪无痕」。\n' },
        ],
    },
    'hanbing-zhang/han': {
        skill: 'hanbing-zhang', ability: 'han', abilityPath: 'han',
        usage: 'strike', grant: 'can_perform/hanbing-zhang/han',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '寒冰掌「极天寒掌」', directType: 'UNARMED', percent: 60,
        dpSkills: ['parry'], feeHit: 220, feeMiss: 120,
        hitBusy: 3, missBusy: 4,
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你寒冰掌不够娴熟，难以施展「极天寒掌」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「极天寒掌」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不够，难以施展「极天寒掌」。\n' },
        ],
    },
    'poyang-jian/xian': {
        skill: 'poyang-jian', ability: 'xian', abilityPath: 'xian',
        usage: 'sword', grant: 'can_perform/poyang-jian/xian',
        forceSkill: 'force', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '破阳冷光剑「神光再现」',
        feeHit: 120, feeMiss: 120, unconditionalFee: true,
        meBusyHit: 1, meBusyMiss: 2,
        targetBusyFormula: 'skill26-2', dpSkills: ['dodge'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你破阳冷光剑不够娴熟，难以施展「神光再现」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「神光再现」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在的真气不够，难以施展「神光再现」。\n' },
        ],
    },
    'poyang-jian/long': {
        skill: 'poyang-jian', ability: 'long', abilityPath: 'long',
        usage: 'sword', grant: 'can_perform/poyang-jian/long',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '破阳冷光剑「天外玉龙」', directType: 'WEAPON', percent: 55,
        // real_perform raises percent to 80 and fee/busy windows.
        realPerform: true, percentReal: 80,
        feeHit: 220, feeMiss: 150, feeHitReal: 300,
        hitBusyMin: 2, hitBusyMax: 3, hitBusyMinReal: 3, hitBusyMaxReal: 6,
        missBusyMin: 1, missBusyMax: 2,
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「天外玉龙」。\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的破阳冷光剑修为不够，难以施展「天外玉龙」。\n' },
            { key: 'dodge', pair: [199, 200], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功火候不够，难以施展「天外玉龙」。\n' },
            { key: 'max-neili', pair: [2699, 2700], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「天外玉龙」。\n' },
            { key: 'neili', pair: [349, 350], field: 'neili',
                refusal: '你的真气不够，难以施展「天外玉龙」。\n' },
        ],
    },
    'yinyang-zhang/qian': {
        skill: 'yinyang-zhang', ability: 'qian', abilityPath: 'qian',
        usage: 'strike', grant: 'can_perform/yinyang-zhang/qian',
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'strike',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '阴阳掌「千掌环」',
        feePerAttack: 20, comboAttacksMin: 3, comboAttacksMax: 6,
        comboBusyMin: 1, comboBusyMax: 6, applyKeys: ['attack'],
        // Hit check random(ap) > dp/2 only arms a temporary +100 attack.
        comboHitBonus: 100,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你阴阳掌不够娴熟，难以施展「千掌环」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「千掌环」。\n' },
        ],
    },
    'jiuqu-jian/wan': {
        skill: 'jiuqu-jian', ability: 'wan', abilityPath: 'wan',
        usage: 'sword', grant: 'can_perform/jiuqu-jian/wan',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '九曲剑法「九曲十八弯」',
        feePerAttack: 20, comboAttacksMin: 4, comboAttacksMax: 8,
        comboBusyMin: 1, comboBusyMax: 8, applyKeys: [],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的九曲剑法不够娴熟，难以施展「九曲十八弯」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你目前的真气不够，难以施展「九曲十八弯」。\n' },
        ],
    },
    'songshan-zhang/po': {
        skill: 'songshan-zhang', ability: 'po', abilityPath: 'po',
        usage: 'strike', grant: 'can_perform/songshan-zhang/po',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '嵩山掌法「破山斧」', directType: 'UNARMED', percent: 30,
        dpSkills: ['parry'], feeHit: 100, feeMiss: 30,
        hitBusyMin: 2, hitBusyMax: 3, missBusyMin: 2, missBusyMax: 4,
        gates: [
            { key: 'level', pair: [29, 30], field: 'skill',
                refusal: '你嵩山掌法不够娴熟，难以施展「破山斧」。\n' },
            { key: 'force', pair: [39, 40], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「破山斧」。\n' },
            { key: 'neili', pair: [119, 120], field: 'neili',
                refusal: '你现在的真气不够，难以施展「破山斧」。\n' },
        ],
    },
    'songshan-jian/meng': {
        skill: 'songshan-jian', ability: 'meng', abilityPath: 'meng',
        usage: 'sword', grant: 'can_perform/songshan-jian/meng',
        forceSkill: 'force', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '嵩山剑法「如梦如幻」',
        feeHit: 80, feeMiss: 80, unconditionalFee: true,
        meBusyHitMin: 0, meBusyHitMax: 1, meBusyMiss: 2,
        targetBusyFormula: 'skill-random-26', dpSkills: ['dodge'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [39, 40], field: 'skill',
                refusal: '你嵩山剑法不够娴熟，难以施展「如梦如幻」。\n' },
            { key: 'neili', pair: [119, 120], field: 'neili',
                refusal: '你现在的真气不够，难以施展「如梦如幻」。\n' },
        ],
    },
    'songyang-zhang/ying': {
        skill: 'songyang-zhang', ability: 'ying', abilityPath: 'ying',
        usage: 'strike', grant: 'can_perform/songyang-zhang/ying',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'strike',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '嵩阳掌「无影掌」',
        feeHit: 80, feeMiss: 30,
        meBusyHit: 1, meBusyMiss: 2,
        targetBusyFormula: 'ap40-1', dpSkills: ['dodge'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你嵩阳掌不够娴熟，难以施展「无影掌」。\n' },
            { key: 'dodge', pair: [149, 150], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，难以施展「无影掌」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「无影掌」。\n' },
        ],
    },
    'lingyun-jian/xiao': {
        skill: 'lingyun-jian', ability: 'xiao', abilityPath: 'xiao',
        usage: 'sword', grant: 'can_perform/lingyun-jian/xiao',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '凌云剑法「剑气冲霄」', directType: 'WEAPON', percent: 40,
        dpSkills: ['parry'], feeHit: 200, feeMiss: 180,
        hitBusyMin: 2, hitBusyMax: 5, missBusy: 2,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你凌云剑法不够娴熟，难以施展「剑气冲霄」。\n' },
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「剑气冲霄」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，难以施展「剑气冲霄」。\n' },
        ],
    },
    'chuanyue-jian/hao': {
        skill: 'chuanyue-jian', ability: 'hao', abilityPath: 'hao',
        usage: 'sword',
        // Original perform checks can_perform/chuanyue/hao (missing -jian).
        grant: 'can_perform/chuanyue/hao',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: songshanFamilies, actorFamily: '嵩山派',
        title: '紫雷剑法「皓月穿空」', directType: 'WEAPON', percent: 48,
        dpSkills: ['parry'], feeHit: 200, feeMiss: 180,
        hitBusyMin: 2, hitBusyMax: 5, missBusy: 2,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你紫雷剑法不够娴熟，难以施展「皓月穿空」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「皓月穿空」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在的真气不够，难以施展「皓月穿空」。\n' },
        ],
    },
    'ningxue-zhang/xue': {
        skill: 'ningxue-zhang', ability: 'xue', abilityPath: 'xue',
        usage: 'staff', grant: 'can_perform/ningxue-zhang/xue',
        forceSkill: 'force', kind: 'combo', weapon: 'staff', prepared: 'staff',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '凝雪杖法「缤纷雪舞」',
        feePerAttack: 20, comboAttacksMin: 4, comboAttacksMax: 6,
        comboBusyMin: 1, comboBusyMax: 6, applyKeys: [],
        // Original ap reads query_skill("sword") even though the weapon is staff.
        comboApSkill: 'sword',
        gates: [
            { key: 'level', pair: [49, 50], field: 'skill',
                refusal: '你的凝雪杖法不够娴熟，难以施展「缤纷雪舞」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你目前的真气不够，难以施展「缤纷雪舞」。\n' },
        ],
    },
    'lutou-zhang/tong': {
        skill: 'lutou-zhang', ability: 'tong', abilityPath: 'tong',
        usage: 'staff', grant: 'can_perform/lutou-zhang/tong',
        forceSkill: 'force', kind: 'direct', weapon: 'staff', prepared: 'staff',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '鹿头杖法「通天彻地」', directType: 'WEAPON', percent: 55,
        // ap = staff + con*10; dp = parry + dex*10.
        apWithCon: true, dpWithDex: true,
        dpSkills: ['parry'], feeHit: 180, feeMiss: 100,
        hitBusy: 3, missBusy: 4,
        gates: [
            { key: 'force', pair: [139, 140], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「通天彻地」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你鹿头杖法火候不够，难以施展「通天彻地」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「通天彻地」。\n' },
        ],
    },
    'xuanming-zhang/zhe': {
        skill: 'xuanming-zhang', ability: 'zhe', abilityPath: 'zhe',
        usage: 'strike', grant: 'can_perform/xuanming-zhang/zhe',
        forceSkill: 'xuanming-shengong', kind: 'direct', weapon: null,
        prepared: 'strike',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '玄冥神掌「只手遮天」', directType: 'UNARMED', percent: 70,
        dpSkills: ['dodge', 'force'], feeHit: 300, feeMiss: 180,
        meBusy: 4,
        poison: true,
        // target max_neili * 3/5 > me max_neili branches to self-wound + self
        // poison and skips do_damage entirely.
        backlash: true,
        gates: [
            { key: 'shengong', pair: [149, 150], field: 'skill',
                skillName: 'xuanming-shengong',
                refusal: '你的玄冥神功火候不够，无法施展「只手遮天」。\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的玄冥神掌不够熟练，无法施展「只手遮天」。\n' },
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你的内力修为不足，无法施展「只手遮天」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，无法施展「只手遮天」。\n' },
        ],
    },
    'xuanming-zhang/lang': {
        skill: 'xuanming-zhang', ability: 'lang', abilityPath: 'lang',
        usage: 'strike', grant: 'can_perform/xuanming-zhang/lang',
        forceSkill: 'xuanming-shengong', kind: 'multi', weapon: null,
        prepared: 'strike',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '玄冥神掌「惊涛骇浪」', directType: 'UNARMED',
        multiDirects: 2,
        percentRanges: [[60, 60], [70, 70]],
        // Each palm bills independently: palm1 150/75, palm2 200/100.
        feePalm1: [150, 75], feePalm2: [200, 100],
        meBusy: 4,
        poison: true,
        dpSkills: ['dodge', 'force'],
        gates: [
            { key: 'shengong', pair: [179, 180], field: 'skill',
                skillName: 'xuanming-shengong',
                refusal: '你的玄冥神功火候不够，无法施展「惊涛骇浪」。\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的玄冥神掌不够熟练，无法施展「惊涛骇浪」。\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为不足，无法施展「惊涛骇浪」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你的真气不够，无法施展「惊涛骇浪」。\n' },
        ],
    },
    'xuanming-zhang/ying': {
        skill: 'xuanming-zhang', ability: 'ying', abilityPath: 'ying',
        usage: 'strike', grant: 'can_perform/xuanming-zhang/ying',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'strike',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '玄冥神掌「如影相随」',
        feeHit: 180, feeMiss: 100,
        meBusyHit: 1, meBusyMiss: 2,
        targetBusyFormula: 'strike18-1', dpSkills: ['dodge'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你玄冥神掌不够娴熟，难以施展「如影相随」。\n' },
            { key: 'dodge', pair: [179, 180], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，难以施展「如影相随」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「如影相随」。\n' },
        ],
    },
    'dulong-shenzhua/bao': {
        skill: 'dulong-shenzhua', ability: 'bao', abilityPath: 'bao',
        usage: 'claw', grant: 'can_perform/dulong-shenzhua/bao',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'claw',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '毒龙神爪功「蛟龙抱」',
        feeHit: 160, feeMiss: 60,
        meBusyHit: 1, meBusyMiss: 2,
        targetBusyFormula: 'ap36-1', dpSkills: ['dodge'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你毒龙神爪功不够娴熟，难以施展「蛟龙抱」。\n' },
            { key: 'dodge', pair: [149, 150], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，难以施展「蛟龙抱」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「蛟龙抱」。\n' },
        ],
    },
    'dulong-shenzhua/ju': {
        skill: 'dulong-shenzhua', ability: 'ju', abilityPath: 'ju',
        usage: 'claw', grant: 'can_perform/dulong-shenzhua/ju',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'claw',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '毒龙神爪功「真龙聚」', directType: 'UNARMED', percent: 65,
        // ap = claw + force; dp = parry + force.
        apWithForce: true, dpWithForce: true,
        dpSkills: ['parry', 'force'], feeHit: 220, feeMiss: 100,
        hitBusy: 3, missBusy: 4,
        gates: [
            { key: 'level', pair: [129, 130], field: 'skill',
                refusal: '你毒龙神爪功不够娴熟，难以施展「真龙聚」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「真龙聚」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，难以施展「真龙聚」。\n' },
        ],
    },
    'feihua-zhang/fei': {
        skill: 'feihua-zhang', ability: 'fei', abilityPath: 'fei',
        usage: 'strike', grant: 'can_perform/feihua-zhang/fei',
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'strike',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '飞花掌法「掌打飞花」',
        feePerAttack: 20, comboAttacksMin: 3, comboAttacksMax: 6,
        comboBusyMin: 1, comboBusyMax: 6, applyKeys: ['attack'],
        comboHitBonus: 10,
        // During the combo each attack may randomly start_busy(1) the target.
        comboRandomTargetBusy: true,
        gates: [
            { key: 'level', pair: [39, 40], field: 'skill',
                refusal: '你飞花掌法不够娴熟，难以施展「掌打飞花」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在的真气不够，难以施展「掌打飞花」。\n' },
        ],
    },
    'piaofeng-quan/juan': {
        skill: 'piaofeng-quan', ability: 'juan', abilityPath: 'juan',
        usage: 'cuff', grant: 'can_perform/piaofeng-quan/juan',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'cuff',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '飘风拳法「卷字决」',
        feeHit: 40, feeMiss: 40, unconditionalFee: true,
        meBusyHit: 0, meBusyMiss: 1,
        targetBusyFormula: 'cuff22', dpSkills: ['force'],
        targetBusyRefusal: true,
        targetBusyRefusalText: '右试弟子目前正自顾不暇，放胆攻击吧！\n',
        gates: [
            { key: 'level', pair: [29, 30], field: 'skill',
                refusal: '你的飘风拳法不够娴熟，不会使用「卷字决」。\n' },
            { key: 'neili', pair: [79, 80], field: 'neili',
                refusal: '你现在真气不够，无法施展「卷字决」。\n' },
        ],
    },
    'jingyue-bifa/ci': {
        skill: 'jingyue-bifa', ability: 'ci', abilityPath: 'ci',
        usage: 'dagger', grant: 'can_perform/jingyue-bifa/ci',
        forceSkill: 'force', kind: 'control', weapon: 'dagger', prepared: 'dagger',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '惊月笔法「残月刺」',
        feeHit: 80, feeMiss: 80, unconditionalFee: true,
        meBusyHitMin: 0, meBusyHitMax: 1, meBusyMiss: 2,
        targetBusyFormula: 'skill-random-24', dpSkills: ['dodge'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [29, 30], field: 'skill',
                refusal: '你惊月笔法不够娴熟，难以施展「残月刺」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不够，难以施展「残月刺」。\n' },
        ],
    },
    'hexing-bifa/dian': {
        skill: 'hexing-bifa', ability: 'dian', abilityPath: 'dian',
        usage: 'dagger', grant: 'can_perform/hexing-bifa/dian',
        forceSkill: 'force', kind: 'combo', weapon: 'dagger', prepared: 'dagger',
        families: xuanmingFamilies, actorFamily: '玄冥谷',
        title: '鹤形笔法「内点乾坤」',
        feePerAttack: 30, comboAttacksMin: 4, comboAttacksMax: 8,
        comboBusyMin: 1, comboBusyMax: 8, applyKeys: [],
        // Extra random(ap/40) attacks only when ap/2+random(ap) > dodge.
        comboHitExtra: true,
        comboRandomTargetBusy: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的鹤形笔法不够娴熟，难以施展「内点乾坤」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你目前的真气不够，难以施展「内点乾坤」。\n' },
        ],
    },
};

export const b14Schools = schools;

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
            // effective-skill: pair values are what query_skill() returns.
            // Raise to (high+1)*2 so the effective value clears the source
            // threshold even with a small negative apply offset.
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
// exactly when there is no apply offset, and the +2 margin in gateFloor
// clears small equipment apply offsets (e.g. apply/dodge -1 from a sword).
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
            // Low must fall under the threshold; high must clear it even with
            // a small negative apply offset from equipment.
            return { skills: { [name]: isLow ? value * 2 : (value + 1) * 2 } };
        }
        default: return { skills: { [gate.field]: value } };
    }
};

export function b14PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b14SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b14ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b14ReviewedSourceHash,
            'Reviewed B14 sources changed; re-review before sampling');
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
            if (extra.realPerform) properties['real_perform/poyang-jian/long'] = 1;
            Object.assign(properties, extra.properties);
            const actor = {
                skills,
                // Basic force is the gated skill itself; only map a distinct
                // special force. A force->force self-map is rejected by the
                // original map_skill round-trip check.
                mappings: { ...(cfg.forceSkill && cfg.forceSkill !== 'force'
                    ? { force: cfg.forceSkill } : {}),
                [cfg.usage]: cfg.skill,
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
                id: `b14-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b14', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b14-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b14SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}独有：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + (cfg.realPerform
                            ? '天外玉龙含 real_perform 精髓分支，费用/百分比/忙乱窗口按原两模式记账。'
                            : cfg.backlash
                                ? '只手遮天含内力碾压反噬分支，反噬时自伤并自中寒毒、跳过直伤。'
                                : cfg.kind === 'multi'
                                    ? '惊涛骇浪两掌连击分段扣费并各自施加玄冥寒毒。'
                                    : '踏雪无痕与神光再现与如梦如幻与无影掌与蛟龙抱与卷字决与残月刺目标忙乱、'
                                      + '极天寒掌与破山斧与剑气冲霄与皓月穿空与通天彻地与只手遮天与真龙聚直伤、'
                                      + '千掌环与九曲十八弯与缤纷雪舞与掌打飞花与内点乾坤连击'
                                      + '均按原分支记账。')
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
        if (cfg.realPerform) {
            add('real-perform', { realPerform: true, samples: smoke ? 2 : samples });
            add('real-perform-hit', { realPerform: true, targetSkills: Object.fromEntries(
                cfg.dpSkills.map(skill => [skill, 0])), samples: 4 });
            add('real-perform-miss', { realPerform: true, targetSkills: Object.fromEntries(
                cfg.dpSkills.map(skill => [skill, 100000])), samples: 4 });
        }
        if (cfg.backlash) {
            // target max_neili * 3/5 > me max_neili (8000): need target
            // max_neili > 8000*5/3 ≈ 13333. Use 14000 to trigger backlash.
            add('backlash', { targetProperties: { max_neili: 14000, neili: 8000 },
                samples: smoke ? 2 : 4 });
        }
        if (cfg.kind === 'multi') {
            // Partial-hit variants settle each palm's own fee window.
            add('palm1-only', { directs: 1, samples: smoke ? 2 : 4 });
            add('palm2-only', { directs: 2, palm2Only: true, samples: smoke ? 2 : 4 });
            add('both-miss', { hit: false, samples: smoke ? 2 : 4 });
        }
        if (cfg.kind === 'buff') {
            add('already-active', { actorTemp: { [cfg.buff]: 1 },
                refusal: '你已经在运功中了。\n' });
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
    // Raw values as query_skill("X", 1) returns them.
    const rawSkill = num(sparse(b.skills, cfg.skill));
    const rawDodge = num(sparse(b.skills, 'dodge'));
    // Effective values as query_skill("X") returns them (skills/2 + mapped).
    const effSkill = name => {
        const raw = num(sparse(b.skills, name));
        const mapped = b.mappings?.[name];
        return Math.trunc(raw / 2) + (mapped ? num(sparse(b.skills, mapped)) : 0);
    };
    switch (cfg.targetBusyFormula) {
        // hen: ap = query_skill(skill,1) + query_skill("dodge",1)/2; busy = ap/40+2
        case 'ap40-2': {
            const ap = rawSkill + Math.trunc(rawDodge / 2);
            return Math.trunc(ap / 40) + 2;
        }
        // ying songyang: same ap shape; busy = ap/40+1
        case 'ap40-1': {
            const ap = rawSkill + Math.trunc(rawDodge / 2);
            return Math.trunc(ap / 40) + 1;
        }
        // bao: ap = query_skill(skill,1) + query_skill("dodge",1)/2; busy = ap/36+1
        case 'ap36-1': {
            const ap = rawSkill + Math.trunc(rawDodge / 2);
            return Math.trunc(ap / 36) + 1;
        }
        // xian: level = query_skill(skill,1); busy = level/26+2
        case 'skill26-2': return Math.trunc(rawSkill / 26) + 2;
        // meng: level = query_skill(skill,1); busy = 2+random(level/26)
        case 'skill-random-26': return 2 + Math.trunc(rawSkill / 26) - 1;
        // ci: level = query_skill(skill,1); busy = 2+random(level/24)
        case 'skill-random-24': return 2 + Math.trunc(rawSkill / 24) - 1;
        // ying xuanming: ap = query_skill("strike"); busy = 1+ap/18
        case 'strike18-1': return 1 + Math.trunc(effSkill('strike') / 18);
        // juan: busy = query_skill("cuff")/22
        case 'cuff22': return Math.trunc(effSkill('cuff') / 22);
        default: return 0;
    }
}

export function validateB14Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B14 entry');
    assert.equal(p.collection_group, 'b14-perform');
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
    if (cfg.kind === 'control') return validateB14Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB14Multi(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB14Direct(raw, condition, cfg, p, b, t, a, v);
    return validateB14Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB14Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const real = !!p.actor.properties?.['real_perform/poyang-jian/long'];
    const backlashHit = p.variant === 'backlash';
    const miss = directs.length === 0 && !backlashHit;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    // Backlash returns before do_damage, so its direct metric stays 0.
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length === 1 ? 1 : 0, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    let fee;
    if (backlashHit) fee = cfg.feeHit;
    else if (cfg.unconditionalFee) fee = cfg.feeHit ?? 0;
    else if (miss) fee = cfg.feeMiss ?? 0;
    else fee = (real && cfg.feeHitReal) ? cfg.feeHitReal : cfg.feeHit ?? 0;
    assert.equal(b.neili - a.neili, fee, 'branch fee');
    const busyAfter = num(a.busy);
    if (cfg.meBusy !== undefined) assert.equal(busyAfter, cfg.meBusy, 'fixed me busy');
    else {
        const useReal = real && !miss;
        const busyMin = miss ? (cfg.missBusyMin ?? cfg.missBusy)
            : useReal ? (cfg.hitBusyMinReal ?? cfg.hitBusyMin ?? cfg.hitBusy)
                : (cfg.hitBusyMin ?? cfg.hitBusy);
        const busyMax = miss ? (cfg.missBusyMax ?? cfg.missBusy)
            : useReal ? (cfg.hitBusyMaxReal ?? cfg.hitBusyMax ?? cfg.hitBusy)
                : (cfg.hitBusyMax ?? cfg.hitBusy);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'busy range');
    }
    if (backlashHit) {
        // Self-wound + self poison; no do_damage against the target.
        assert.equal(directs.length, 0, 'backlash has no direct');
        assertLearnGain(a, p.skill);
        const spent = b.neili - a.neili;
        assert.ok(a.conditions?.xuanming_poison, 'self poison on backlash');
        stableState(b, a, e => {
            e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
            e.qi = a.qi; e.eff_qi = a.eff_qi;
            e.conditions = copy(a.conditions ?? null);
            allowDerived(e, a);
        });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: true, backlash: true };
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
    const percent = real && cfg.percentReal ? cfg.percentReal : cfg.percent;
    const support = cfg.percentRange
        ? supportRange(input, cfg.percentRange, b, t, cfg.directType)
        : slice2SupportSet(input, percent, b, t, cfg.directType);
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

function validateB14Control(raw, condition, cfg, p, b, t, a, v) {
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
        if (cfg.targetBusyFormula === 'skill-random-26' || cfg.targetBusyFormula === 'skill-random-24') {
            assert.ok(tBusy >= 2 && tBusy <= expected + 1, 'random target busy range');
        } else if (cfg.targetBusyFormula === 'cuff22') {
            assert.ok(tBusy === expected || tBusy === expected + 1 || tBusy === 0
                || tBusy === expected, 'cuff/22 target busy');
            assert.ok(tBusy >= 1, 'cuff22 positive on hit');
        } else {
            assert.equal(tBusy, expected, 'target busy formula');
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
    });
    stableState(t, v, e => {
        e.busy = v.busy;
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'control', hit };
}

function validateB14Multi(raw, condition, cfg, p, b, t, a, v) {
    // xuanming lang: up to 2 sequential do_damage palms, each with its own fee.
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= cfg.multiDirects, 'multi direct bound');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
    }
    const [hit1, miss1] = cfg.feePalm1, [hit2, miss2] = cfg.feePalm2;
    const paid = b.neili - a.neili;
    // Derive which palms landed from the recorded fee.
    let palm1 = false, palm2 = false;
    if (paid === hit1 + hit2) { palm1 = true; palm2 = true; }
    else if (paid === hit1 + miss2) { palm1 = true; palm2 = false; }
    else if (paid === miss1 + hit2) { palm1 = false; palm2 = true; }
    else if (paid === miss1 + miss2) { palm1 = false; palm2 = false; }
    else assert.fail(`unknown lang fee ${paid}`);
    assert.equal(directs.length, (palm1 ? 1 : 0) + (palm2 ? 1 : 0), 'direct count tracks palms');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length, 'direct count');
    assert.equal(num(a.busy), cfg.meBusy, 'lang me busy 4');
    for (let i = 0; i < directs.length; i++) {
        const input = num(directs[i].damage);
        const support = supportRange(input, cfg.percentRanges[palm1 && i === 0 ? 0 : 1],
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

function validateB14Combo(raw, condition, cfg, p, b, t, a, v) {
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
            // Source adds +bonus only on hit but subtracts bonus unconditionally.
            // Hit nets zero; miss leaves -bonus.
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

export function b14Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB14Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
