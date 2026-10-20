// B18 Tangmen-exclusive 7 + Lingjiu-exclusive 7 + Meizhuang-exclusive 7 +
// Shenlong-exclusive 7 perform batch (28 moves).
// Tangmen: tangmen-throwing biao/qian/san, boyun-suowu dian/meng,
// qiulin-shiye wu, wuzhan-mei liu.
// Lingjiu: tianyu-qijian huan/shan, wudoumi-shengong gui, lansha-shou po,
// pidi-shenzhen huan, zhemei-shou hai, liuyang-zhang po.
// Meizhuang: qixian-wuxingjian yin/zhu, shigu-bifa feng/shiyi,
// jidian-jian dian, xuantian-zhi bing, fenglei-zifa she.
// Shenlong: shedao-qigong cui/fei/chang1/chang2/chang3, huagu-mianzhang hua,
// shenlong-bashi xian.
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

// Tangmen-exclusive settle 唐门世家; Lingjiu settle 灵鹫宫;
// Meizhuang settle 梅庄; Shenlong settle 神龙教.
const tangmenFamilies = ['唐门世家'];
const lingjiuFamilies = ['灵鹫宫'];
const meizhuangFamilies = ['梅庄'];
const shenlongFamilies = ['神龙教'];

export const b18SourcePaths = [
    'kungfu/skill/tangmen-throwing.c', 'kungfu/skill/tangmen-throwing/biao.c',
    'kungfu/skill/tangmen-throwing/qian.c', 'kungfu/skill/tangmen-throwing/san.c',
    'kungfu/skill/boyun-suowu.c', 'kungfu/skill/boyun-suowu/dian.c',
    'kungfu/skill/boyun-suowu/meng.c',
    'kungfu/skill/qiulin-shiye.c', 'kungfu/skill/qiulin-shiye/wu.c',
    'kungfu/skill/wuzhan-mei.c', 'kungfu/skill/wuzhan-mei/liu.c',
    'kungfu/skill/tianyu-qijian.c', 'kungfu/skill/tianyu-qijian/huan.c',
    'kungfu/skill/tianyu-qijian/shan.c',
    'kungfu/skill/wudoumi-shengong.c',
    'kungfu/skill/wudoumi-shengong/perform/gui.c',
    'kungfu/skill/lansha-shou.c', 'kungfu/skill/lansha-shou/po.c',
    'kungfu/skill/pidi-shenzhen.c', 'kungfu/skill/pidi-shenzhen/huan.c',
    'kungfu/skill/zhemei-shou.c', 'kungfu/skill/zhemei-shou/hai.c',
    'kungfu/skill/liuyang-zhang.c', 'kungfu/skill/liuyang-zhang/po.c',
    'kungfu/skill/qixian-wuxingjian.c', 'kungfu/skill/qixian-wuxingjian/yin.c',
    'kungfu/skill/qixian-wuxingjian/zhu.c',
    'kungfu/skill/shigu-bifa.c', 'kungfu/skill/shigu-bifa/feng.c',
    'kungfu/skill/shigu-bifa/shiyi.c',
    'kungfu/skill/jidian-jian.c', 'kungfu/skill/jidian-jian/dian.c',
    'kungfu/skill/xuantian-zhi.c', 'kungfu/skill/xuantian-zhi/bing.c',
    'kungfu/skill/xuantian-wujigong.c',
    'kungfu/skill/fenglei-zifa.c', 'kungfu/skill/fenglei-zifa/she.c',
    'kungfu/skill/shedao-qigong.c', 'kungfu/skill/shedao-qigong/cui.c',
    'kungfu/skill/shedao-qigong/fei.c', 'kungfu/skill/shedao-qigong/chang1.c',
    'kungfu/skill/shedao-qigong/chang2.c', 'kungfu/skill/shedao-qigong/chang3.c',
    'kungfu/skill/huagu-mianzhang.c', 'kungfu/skill/huagu-mianzhang/hua.c',
    'kungfu/skill/shenlong-bashi.c', 'kungfu/skill/shenlong-bashi/xian.c',
    'kungfu/skill/bahuang-gong.c', 'kungfu/skill/biyun-xinfa.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c', 'kungfu/skill/staff.c',
    'kungfu/skill/strike.c', 'kungfu/skill/cuff.c', 'kungfu/skill/hand.c',
    'kungfu/skill/finger.c', 'kungfu/skill/dagger.c',
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
export const b18ReviewedSourceHash = 'PENDING';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. Force gates follow each source: generic force, named force, or
// raw skill name when the perform reads query_skill(name, 1).
const schools = {
    // ---- Tangmen exclusive 7 ----
    'tangmen-throwing/biao': {
        skill: 'tangmen-throwing', ability: 'biao', abilityPath: 'biao',
        usage: 'throwing', grant: null,
        forceSkill: 'force', kind: 'throwing', weapon: null, prepared: null,
        families: tangmenFamilies, actorFamily: '唐门世家',
        title: '七子刚镖',
        // Handing throwing min 7; fee 100; hit consumes 7; busy 2/3.
        handing: 'throwing', consumeAmount: 7,
        fee: 100, hitBusy: 2, missBusy: 3,
        extraSkills: { 'boyun-suowu': 300 },
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的唐门暗器不够娴熟，难以施展七子刚镖。\n' },
            { key: 'boyun', pair: [119, 120], field: 'skill', skillName: 'boyun-suowu',
                refusal: '你的拨云锁雾不够娴熟，无法施展七子刚镖。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不足，难以施展七子刚镖。\n' },
            { key: 'max-neili', pair: [1199, 1200], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展七子刚镖。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不足，难以施展七子刚镖。\n' },
        ],
    },
    'tangmen-throwing/qian': {
        skill: 'tangmen-throwing', ability: 'qian', abilityPath: 'qian',
        usage: 'throwing', grant: null,
        forceSkill: 'force', kind: 'throwing', weapon: null, prepared: null,
        families: tangmenFamilies, actorFamily: '唐门世家',
        title: '心有千千结',
        handing: 'throwing', consumeAmount: 1,
        fee: 100, feeHit: 100, feeMiss: 100, unconditionalFee: true,
        hitBusy: 0, missBusy: 3,
        extraSkills: { 'boyun-suowu': 300 },
        dpSkills: ['dodge'],
        targetBusyFormula: 'throwing80-2', targetBusyRefusal: true,
        targetBusyRefusalText: '对方都已经这样了，用不着这么费力吧？\n',
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的唐门暗器不够娴熟，难以施展心有千千结。\n' },
            { key: 'boyun', pair: [139, 140], field: 'skill', skillName: 'boyun-suowu',
                refusal: '你的拨云锁雾不够娴熟，无法施展心有千千结。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不足，难以施展心有千千结。\n' },
            { key: 'max-neili', pair: [1199, 1200], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展心有千千结。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不足，难以施展心有千千结。\n' },
        ],
    },
    'tangmen-throwing/san': {
        skill: 'tangmen-throwing', ability: 'san', abilityPath: 'san',
        usage: 'throwing', grant: null,
        forceSkill: 'force', kind: 'throwing', weapon: null, prepared: null,
        families: tangmenFamilies, actorFamily: '唐门世家',
        title: '散花天女',
        handing: 'throwing', consumeAmount: 10,
        fee: 100, hitBusy: 2, missBusy: 3,
        extraSkills: { 'boyun-suowu': 300 },
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的唐门暗器不够娴熟，难以施展散花天女。\n' },
            { key: 'boyun', pair: [159, 160], field: 'skill', skillName: 'boyun-suowu',
                refusal: '你的拨云锁雾不够娴熟，无法施展散花天女。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不足，难以施展散花天女。\n' },
            { key: 'max-neili', pair: [1199, 1200], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展散花天女。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不足，难以施展散花天女。\n' },
        ],
    },
    'boyun-suowu/dian': {
        skill: 'boyun-suowu', ability: 'dian', abilityPath: 'dian',
        usage: 'hand', grant: null,
        forceSkill: 'biyun-xinfa', kind: 'control', weapon: null, prepared: 'hand',
        families: tangmenFamilies, actorFamily: '唐门世家',
        title: '拨云锁雾「云雾暗点」',
        feeHit: 500, feeMiss: 500, unconditionalFee: true,
        meBusyHit: 0, meBusyMiss: 0,
        extraSkills: { 'biyun-xinfa': 300 },
        dpSkills: ['dodge'],
        targetBusyFormula: 'hand100-2',
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的「拨云锁雾」不够娴熟，不能使用「云雾暗点」。\n' },
            { key: 'xinfa', pair: [99, 100], field: 'skill', skillName: 'biyun-xinfa',
                refusal: '你的碧云心法不够熟练！\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你的内力不够。\n' },
        ],
    },
    'boyun-suowu/meng': {
        skill: 'boyun-suowu', ability: 'meng', abilityPath: 'meng',
        usage: 'hand', grant: null,
        forceSkill: 'biyun-xinfa', kind: 'direct', weapon: null, prepared: 'hand',
        families: tangmenFamilies, actorFamily: '唐门世家',
        title: '拨云锁雾「回梦」',
        // receive_damage qi + receive_wound qi/2; hit pays 300, miss pays 0.
        receiveOnly: true, percent: 100,
        feeHit: 300, feeMiss: 0,
        hitBusy: 2, missBusy: 3,
        extraSkills: { 'biyun-xinfa': 300 },
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的拨云锁雾不够娴熟，不会使用「回梦」。\n' },
            { key: 'xinfa', pair: [129, 130], field: 'skill', skillName: 'biyun-xinfa',
                refusal: '你的碧云心法不够高，不能用来反震伤敌。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在内力太弱，不能使用「回梦」。\n' },
        ],
    },
    'qiulin-shiye/wu': {
        skill: 'qiulin-shiye', ability: 'wu', abilityPath: 'wu',
        usage: 'dodge', grant: null,
        forceSkill: 'force', kind: 'special', weapon: null, prepared: null,
        families: tangmenFamilies, actorFamily: '唐门世家',
        title: '秋林拾叶「随风而舞」',
        // exp-based hit; target busy 4-7 and self qi/jing damage on hit; flee.
        fee: 200, meBusy: 1,
        selfDamage: true,
        dpSkills: [],
        expHitCheck: true, specialBusy: 'wu',
        gates: [
            { key: 'level', pair: [89, 90], field: 'skill',
                refusal: '你目前功力还使不出「随风而舞」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的内力不够。\n' },
        ],
    },
    'wuzhan-mei/liu': {
        skill: 'wuzhan-mei', ability: 'liu', abilityPath: 'liu',
        usage: 'sword', grant: null,
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: tangmenFamilies, actorFamily: '唐门世家',
        title: '五展梅「流花掠影」',
        fee: 300, comboAttacks: 5, comboBusyMin: 2, comboBusyMax: 2,
        applyKeys: ['attack'], comboHitAttackFromSkill: true,
        gates: [
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你目前的内力不足，无法施展『流花掠影』。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的五展梅剑法不够纯熟，无法使用『流花掠影』。\n' },
        ],
    },
    // ---- Lingjiu exclusive 7 ----
    'tianyu-qijian/huan': {
        skill: 'tianyu-qijian', ability: 'huan', abilityPath: 'huan',
        usage: 'sword', grant: 'can_perform/tianyu-qijian/huan',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: lingjiuFamilies, actorFamily: '灵鹫宫',
        title: '天羽奇剑「幻剑诀」',
        fee: 100, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的天羽奇剑不够娴熟，难以施展「幻剑诀」。\n' },
            { key: 'force', pair: [159, 160], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「幻剑诀」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「幻剑诀」。\n' },
        ],
    },
    'tianyu-qijian/shan': {
        skill: 'tianyu-qijian', ability: 'shan', abilityPath: 'shan',
        usage: 'sword', grant: 'can_perform/tianyu-qijian/shan',
        forceSkill: 'force', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: lingjiuFamilies, actorFamily: '灵鹫宫',
        title: '天羽奇剑「闪剑诀」',
        feeHit: 80, feeMiss: 180,
        meBusyHit: 0, meBusyMiss: 1,
        dpSkills: ['parry'],
        targetBusyFormula: 'tianyu23-1', targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的天羽奇剑不够娴熟，难以施展「闪剑诀」。\n' },
            { key: 'force', pair: [99, 100], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「闪剑诀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不足，难以施展「闪剑诀」。\n' },
        ],
    },
    'wudoumi-shengong/gui': {
        skill: 'wudoumi-shengong', ability: 'gui', abilityPath: 'perform/gui',
        usage: 'unarmed', grant: 'can_perform/wudoumi-shengong/gui',
        forceSkill: 'wudoumi-shengong', kind: 'multi', weapon: null,
        prepared: 'unarmed',
        families: lingjiuFamilies, actorFamily: '灵鹫宫',
        title: '五斗米神功「归去来兮」',
        // Two independent do_damage swings (percent 60 then 70).
        fee: 500, multiDirects: 2,
        percentRanges: [[60, 60], [70, 70]],
        hitBusyMin: 2, hitBusyMax: 4,
        requirePowerup: true,
        dpSkills: ['dodge'],
        gates: [
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「归去来兮」。\n' },
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的五斗米神功不够娴熟，难以施展「归去来兮」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你现在真气不够，难以施展「归去来兮」。\n' },
        ],
    },
    'lansha-shou/po': {
        skill: 'lansha-shou', ability: 'po', abilityPath: 'po',
        usage: 'hand', grant: 'can_perform/lansha-shou/po',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'hand',
        families: lingjiuFamilies, actorFamily: '灵鹫宫',
        title: '蓝砂手「破靛神砂」',
        // Hit-only fee 100; busy 3 always; poison sha_poison on hit.
        feeHit: 100, feeMiss: 0,
        meBusy: 3, percent: 20, directType: 'UNARMED',
        poison: 'sha_poison',
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你蓝砂手不够熟练，难以施展「破靛神砂」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内力修为不足，难以施展「破靛神砂」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「破靛神砂」。\n' },
        ],
    },
    'pidi-shenzhen/huan': {
        skill: 'pidi-shenzhen', ability: 'huan', abilityPath: 'huan',
        usage: 'throwing', grant: 'can_perform/pidi-shenzhen/huan',
        forceSkill: 'force', kind: 'throwing', weapon: null, prepared: null,
        families: lingjiuFamilies, actorFamily: '灵鹫宫',
        title: '辟地神针「幻遁寒星」',
        handing: 'throwing', consumeAll: true,
        fee: 100, meBusy: 2,
        dpSkills: [],
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的辟地神针不够娴熟，难以施展「幻遁寒星」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「幻遁寒星」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不足，难以施展「幻遁寒星」。\n' },
        ],
    },
    'zhemei-shou/hai': {
        skill: 'zhemei-shou', ability: 'hai', abilityPath: 'hai',
        usage: 'hand', grant: 'can_perform/zhemei-shou/hai',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'hand',
        families: lingjiuFamilies, actorFamily: '灵鹫宫',
        title: '逍遥折梅手「海渊式」',
        // Unconditional -50 then -100 more on hit; percent 65; busy 3 both.
        feeHit: 150, feeMiss: 50,
        meBusy: 3, percent: 65, directType: 'UNARMED',
        dpSkills: ['dodge'],
        gates: [
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「海渊式」。\n' },
            { key: 'level', pair: [129, 130], field: 'skill',
                refusal: '你的逍遥折梅手等级不够，难以施展「海渊式」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不足，难以施展「海渊式」。\n' },
        ],
    },
    'liuyang-zhang/po': {
        skill: 'liuyang-zhang', ability: 'po', abilityPath: 'po',
        usage: 'strike', grant: 'can_perform/liuyang-zhang/po',
        forceSkill: 'bahuang-gong', kind: 'special', weapon: null, prepared: 'strike',
        families: lingjiuFamilies, actorFamily: '灵鹫宫',
        title: '天山六阳掌「破神诀」',
        // Unconditional -380; crush when max_neili > target*2 else do_damage 90.
        fee: 380, crush: true, percent: 90, directType: 'UNARMED',
        hitBusyMin: 1, hitBusyMax: 3, missBusyMin: 1, missBusyMax: 4,
        dpSkills: ['force'],
        gates: [
            { key: 'bahuang', pair: [219, 220], field: 'skill', skillName: 'bahuang-gong',
                refusal: '你八荒六合唯我独尊功火候不够，难以施展「破神诀」。\n' },
            { key: 'level', pair: [219, 220], field: 'skill',
                refusal: '你的天山六阳掌不够娴熟，难以施展「破神诀」。\n' },
            { key: 'max-neili', pair: [3499, 3500], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「破神诀」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你现在真气不足，难以施展「破神诀」。\n' },
        ],
    },
    // ---- Meizhuang exclusive 7 ----
    'qixian-wuxingjian/yin': {
        skill: 'qixian-wuxingjian', ability: 'yin', abilityPath: 'yin',
        usage: 'sword', grant: 'can_perform/qixian-wuxingjian/yin',
        forceSkill: 'force', kind: 'special', weapon: 'sword', prepared: 'sword',
        families: meizhuangFamilies, actorFamily: '梅庄',
        title: '七弦无形剑「七弦无形音」',
        // jing receive_damage; immunity branches pay 100; hit pays 400.
        jingDamage: true, specialBusy: 'yin',
        feeHit: 400, feeMiss: 100,
        meBusy: 2,
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你七弦无形剑修为有限，难以施展「七弦无形音」。\n' },
            { key: 'force', pair: [249, 250], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「七弦无形音」。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你现在的真气不够，难以施展「七弦无形音」。\n' },
        ],
    },
    'qixian-wuxingjian/zhu': {
        skill: 'qixian-wuxingjian', ability: 'zhu', abilityPath: 'zhu',
        usage: 'sword', grant: 'can_perform/qixian-wuxingjian/zhu',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: meizhuangFamilies, actorFamily: '梅庄',
        title: '七弦无形剑「七弦连环诛」',
        fee: 250, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 6,
        applyKeys: ['attack'], comboHitAttackFromForce: true,
        gates: [
            { key: 'force', pair: [299, 300], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，现在无法使用「七弦连环诛」。\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的七弦无形剑修为有限，现在无法使用「七弦连环诛」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，无法运用「七弦连环诛」。\n' },
        ],
    },
    'shigu-bifa/feng': {
        skill: 'shigu-bifa', ability: 'feng', abilityPath: 'feng',
        usage: 'dagger', grant: 'can_perform/shigu-bifa/feng',
        forceSkill: 'force', kind: 'direct', weapon: 'dagger', prepared: 'dagger',
        families: meizhuangFamilies, actorFamily: '梅庄',
        title: '石鼓打穴笔法「神笔封穴」',
        feeHit: 200, feeMiss: 50,
        hitBusy: 1, missBusy: 3,
        percent: 50, directType: 'WEAPON',
        dpSkills: ['parry'],
        targetBusyOnHit: 'dagger25-2', targetBusyFormula: 'dagger25-2',
        targetBusyOptional: true, targetBusyRefusal: true,
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「神笔封穴」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的石鼓打穴笔法修为有限，难以施展「神笔封穴」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「神笔封穴」。\n' },
        ],
    },
    'shigu-bifa/shiyi': {
        skill: 'shigu-bifa', ability: 'shiyi', abilityPath: 'shiyi',
        usage: 'dagger', grant: 'can_perform/shigu-bifa/shiyi',
        forceSkill: 'force', kind: 'combo', weapon: 'dagger', prepared: 'dagger',
        families: meizhuangFamilies, actorFamily: '梅庄',
        title: '石鼓打穴笔法「诗意纵横」',
        fee: 80, comboAttacks: 4, comboBusyMin: 1, comboBusyMax: 4,
        applyKeys: [],
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「诗意纵横」。\n' },
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的石鼓打穴笔法修为有限，难以施展「诗意纵横」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「诗意纵横」。\n' },
        ],
    },
    'jidian-jian/dian': {
        skill: 'jidian-jian', ability: 'dian', abilityPath: 'dian',
        usage: 'sword', grant: 'can_perform/jidian-jian/dian',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: null,
        families: meizhuangFamilies, actorFamily: '梅庄',
        title: '疾电剑法「电光四射」',
        feeHit: 180, feeMiss: 60,
        hitBusy: 2, missBusy: 3,
        percent: 40, directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，无法施展「电光四射」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的疾电剑法修为不够，无法施展「电光四射」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够，无法施展「电光四射」。\n' },
        ],
    },
    'xuantian-zhi/bing': {
        skill: 'xuantian-zhi', ability: 'bing', abilityPath: 'bing',
        usage: 'finger', grant: 'can_perform/xuantian-zhi/bing',
        forceSkill: 'xuantian-wujigong', kind: 'direct', weapon: null,
        prepared: 'finger',
        families: meizhuangFamilies, actorFamily: '梅庄',
        title: '玄天指「冰坚地狱」',
        // Hit-only fee 400; busy 4 always; poison xuantian_zhi on hit.
        feeHit: 400, feeMiss: 0,
        meBusy: 4, percent: 70, directType: 'UNARMED',
        poison: 'xuantian_zhi',
        extraSkills: { 'xuantian-wujigong': 300 },
        dpSkills: ['force'],
        gates: [
            { key: 'xinfa', pair: [179, 180], field: 'skill', skillName: 'xuantian-wujigong',
                refusal: '你的玄天无极功火候不够，使不出「冰坚地狱」。\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的玄天指不够熟练，不会使用「冰坚地狱」。\n' },
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你的内力修为不足，无法使用「冰坚地狱」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，无法使用「冰坚地狱」。\n' },
        ],
    },
    'fenglei-zifa/she': {
        skill: 'fenglei-zifa', ability: 'she', abilityPath: 'she',
        usage: 'throwing', grant: 'can_perform/fenglei-zifa/she',
        forceSkill: 'force', kind: 'throwing', weapon: null, prepared: null,
        families: meizhuangFamilies, actorFamily: '梅庄',
        title: '风雷子法「射日诀」',
        handing: 'throwing', consumeAmount: 1,
        fee: 80, meBusy: 2,
        dpSkills: [],
        expHitCheck: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的风雷子法不够娴熟，无法施展「射日诀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你内力不足，无法施展「射日诀」。\n' },
        ],
    },
    // ---- Shenlong exclusive 7 ----
    'shedao-qigong/cui': {
        skill: 'shedao-qigong', ability: 'cui', abilityPath: 'cui',
        usage: 'staff', grant: 'can_perform/shedao-qigong/xian',
        forceSkill: 'force', kind: 'direct', weapon: 'staff', prepared: 'staff',
        families: shenlongFamilies, actorFamily: '神龙教',
        title: '蛇岛奇功「摧心断肠」',
        // Three-branch: force-block -200, dodge miss -50, hit -220.
        feeHit: 220, feeMiss: 50, feeForceBlock: 200,
        hitBusy: 2, missBusy: 3, missBusyMin: 2, missBusyMax: 3,
        percent: 60, directType: 'REMOTE',
        dpSkills: ['force', 'dodge'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的蛇岛奇功修为有限，不能使用「摧心断肠」！\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够，无法运用「摧心断肠」！\n' },
        ],
    },
    'shedao-qigong/fei': {
        skill: 'shedao-qigong', ability: 'fei', abilityPath: 'fei',
        usage: 'staff', grant: 'can_perform/shedao-qigong/fei',
        forceSkill: 'force', kind: 'combo', weapon: 'staff', prepared: null,
        families: shenlongFamilies, actorFamily: '神龙教',
        title: '蛇岛奇功「飞仙术」',
        fee: 100, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: ['attack'], comboHitAttackFromSkill: true, comboHitAttackDiv: 6,
        gates: [
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你的真气不够！\n' },
            { key: 'force', pair: [99, 100], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够！\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的蛇岛奇功的修为法还不到家，无法使用飞仙术！\n' },
        ],
    },
    'shedao-qigong/chang1': {
        skill: 'shedao-qigong', ability: 'chang1', abilityPath: 'chang1',
        usage: 'unarmed', grant: null,
        forceSkill: 'force', kind: 'buff', weapon: null, prepared: null,
        families: shenlongFamilies, actorFamily: '神龙教',
        title: '蛇岛奇功「唱仙法」',
        fee: 200, meBusy: 0,
        buff: 'chang', buffApply: true, buffApplyKeys: ['attack', 'dodge', 'defense'],
        buffApplyDelta: 1, alreadyActiveCap: 30,
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的蛇岛奇功不够娴熟，不会使用唱仙法。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你已经唱得精疲力竭，内力不够了。\n' },
        ],
    },
    'shedao-qigong/chang2': {
        skill: 'shedao-qigong', ability: 'chang2', abilityPath: 'chang2',
        usage: 'unarmed', grant: null,
        forceSkill: 'force', kind: 'buff', weapon: null, prepared: null,
        families: shenlongFamilies, actorFamily: '神龙教',
        title: '蛇岛奇功「唱仙法」',
        // Reverse stack: refunds 100 neili, decrements chang.
        fee: -100, meBusy: 0,
        buff: 'chang', buffApply: true, buffApplyKeys: ['attack', 'dodge', 'defense'],
        buffApplyDelta: -1, alreadyActiveCap: -20, reverseBuff: true,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的蛇岛奇功不够娴熟，不会使用唱仙法。\n' },
        ],
    },
    'shedao-qigong/chang3': {
        skill: 'shedao-qigong', ability: 'chang3', abilityPath: 'chang3',
        usage: 'unarmed', grant: null,
        forceSkill: 'force', kind: 'special', weapon: null, prepared: null,
        families: shenlongFamilies, actorFamily: '神龙教',
        title: '蛇岛奇功「唱仙法吼字决」',
        // Fee 300+random(200) and qi 10 before the max_neili roll; late refusal.
        feeMin: 300, feeMax: 499, selfQiCost: 10,
        meBusyMin: 1, meBusyMax: 5,
        specialBusy: 'chang3',
        targetMaxNeili: 100,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的蛇岛奇功不够娴熟，不会使用唱仙法吼字决。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你已经精疲力竭，真气不够了。\n' },
        ],
    },
    'huagu-mianzhang/hua': {
        skill: 'huagu-mianzhang', ability: 'hua', abilityPath: 'hua',
        usage: 'strike', grant: null,
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: shenlongFamilies, actorFamily: '神龙教',
        title: '化骨绵掌「辣手化骨」',
        fee: 100, feeHit: 100, feeMiss: 100, unconditionalFee: true,
        hitBusy: 2, missBusy: 3,
        percent: 40, directType: 'UNARMED', poison: 'huagu',
        dpSkills: ['force'],
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，无法施展化骨掌。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的化骨绵掌还不够娴熟，不会化骨掌。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，不能化骨。\n' },
        ],
    },
    'shenlong-bashi/xian': {
        skill: 'shenlong-bashi', ability: 'xian', abilityPath: 'xian',
        usage: 'hand', grant: null,
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'hand',
        families: shenlongFamilies, actorFamily: '神龙教',
        title: '神龙八式「神龙初现」',
        feeHit: 125, feeMiss: 30,
        meBusy: 2, percent: 35, directType: 'UNARMED',
        dpSkills: ['parry'],
        targetBusyOnHit: 1,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的神龙八式手法还不够娴熟，不能使用神龙初现。\n' },
            { key: 'force', pair: [79, 80], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，不能使用神龙初现。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不够，不能使用神龙初现。\n' },
        ],
    },
};

export const b18Schools = schools;

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

export function b18PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b18SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b18ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b18ReviewedSourceHash,
            'Reviewed B18 sources changed; re-review before sampling');
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
                id: `b18-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b18', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b18-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b18SourcePaths],
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
                    ?? '右试弟子目前正自顾不暇，放胆攻击吧。\n',
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
        case 'throwing80-2': return Math.trunc(effSkill('throwing') / 80) + 2;
        case 'hand100-2': return Math.trunc((effSkill('hand') + (num(b.dex) + Math.trunc(num(sparse(b.skills, 'dodge')) / 10) + (b.temp?.apply?.dex ?? 0)) * 10) / 100) + 2;
        case 'tianyu23-1': return Math.trunc(num(sparse(b.skills, 'tianyu-qijian')) / 23) + 1;
        case 'dagger25-2': return Math.trunc(effSkill('dagger') / 25) + 2;
        default: return 0;
    }
}

export function validateB18Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B18 entry');
    assert.equal(p.collection_group, 'b18-perform');
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
    if (cfg.kind === 'buff') return validateB18Buff(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB18Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB18Multi(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'throwing') return validateB18Throwing(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'special') return validateB18Special(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB18Direct(raw, condition, cfg, p, b, t, a, v);
    return validateB18Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB18Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    // receive_damage paths (meng) report no do_damage rows; hit is a qi drop.
    const miss = cfg.receiveOnly
        ? num(v.qi) === num(t.qi) && num(v.eff_qi) === num(t.eff_qi)
        : directs.length === 0;
    if (!cfg.receiveOnly) assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length === 1 ? 1 : 0, 'direct');
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
        assert.equal(directs.length, 1, 'single direct');
        assert.equal(directs[0].actor, 0); assert.equal(directs[0].target, 1);
        input = num(directs[0].damage);
        const support = slice2SupportSet(input, cfg.percent, b, t, cfg.directType);
        assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
            'target resulting state must lie in modeled do_damage support');
    }
    if (cfg.poison) assert.ok(v.conditions?.[cfg.poison], 'poison applied on hit');
    if (cfg.targetBusyOnHit !== undefined) {
        // Secondary busy rolls (feng) may skip; accept 0 or the formula value.
        const want = typeof cfg.targetBusyOnHit === 'number'
            ? cfg.targetBusyOnHit
            : targetBusyFor({ ...cfg, targetBusyFormula: cfg.targetBusyOnHit }, b, true);
        const got = num(v.busy);
        if (cfg.targetBusyOptional) assert.ok(got === 0 || got === want, 'optional target busy on hit');
        else assert.equal(got, want, 'target busy on hit');
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

function validateB18Control(raw, condition, cfg, p, b, t, a, v) {
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
    }, { consumeThrowing: Boolean(cfg.handing) });
    stableState(t, v, e => {
        e.busy = v.busy;
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'control', hit };
}

function validateB18Multi(raw, condition, cfg, p, b, t, a, v) {
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

function validateB18Throwing(raw, condition, cfg, p, b, t, a, v) {
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

function validateB18Buff(raw, condition, cfg, p, b, t, a, v) {
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

function validateB18Special(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const fee = b.neili - a.neili;
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

function validateB18Combo(raw, condition, cfg, p, b, t, a, v) {
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

export function b18Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB18Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
