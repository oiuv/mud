// B6 shared perform batch (19 moves). Shang x Zhenyuan bagua cluster (7),
// Gaibang x Taohua dagou-bang cluster (4), Hu x Miao hujia-daofa cluster (2),
// plus six multi-family leftovers (liuhe dao/zhang, liuyang-zhang/zhemei-shou,
// pomopima-jian). One collection settles each cluster's families' perform
// coverage. Finite reviewed conditions only; no game-code writes and no
// balance claims.
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

// Four shared clusters. Each move settles both families' perform coverage.
const shangZhenyuan = ['商家堡', '八卦门'];
const gaibangTaohua = ['丐帮', '桃花岛'];
const huMiao = ['关外胡家', '中原苗家'];
const gaibangHu = ['丐帮', '关外胡家'];
const lingjiuXiaoyao = ['灵鹫宫', '逍遥派'];
const meizhuangMingjiao = ['梅庄', '明教'];

export const b6SourcePaths = [
    'kungfu/skill/bagua-dao.c', 'kungfu/skill/bagua-dao/mang.c',
    'kungfu/skill/bagua-dao/sha.c', 'kungfu/skill/bagua-dao/tian.c',
    'kungfu/skill/bagua-quan.c', 'kungfu/skill/bagua-quan/gua.c',
    'kungfu/skill/bagua-zhang.c', 'kungfu/skill/bagua-zhang/jia.c',
    'kungfu/skill/bagua-biao.c',
    'kungfu/skill/bazhen-zhang.c', 'kungfu/skill/bazhen-zhang/yin.c',
    'kungfu/skill/wai-bagua.c', 'kungfu/skill/wai-bagua/zhen.c',
    'kungfu/skill/nei-bagua.c',
    'kungfu/skill/dagou-bang.c', 'kungfu/skill/dagou-bang/ban.c',
    'kungfu/skill/dagou-bang/chuo.c', 'kungfu/skill/dagou-bang/feng.c',
    'kungfu/skill/dagou-bang/tian.c',
    'kungfu/skill/hujia-daofa.c', 'kungfu/skill/hujia-daofa/cang.c',
    'kungfu/skill/hujia-daofa/xian.c',
    'kungfu/skill/liuhe-dao.c', 'kungfu/skill/liuhe-dao/shan.c',
    'kungfu/skill/liuhe-zhang.c', 'kungfu/skill/liuhe-zhang/tan.c',
    'kungfu/skill/liuyang-zhang.c', 'kungfu/skill/liuyang-zhang/huan.c',
    'kungfu/skill/liuyang-zhang/zhong.c',
    'kungfu/skill/zhemei-shou.c', 'kungfu/skill/zhemei-shou/zhe.c',
    'kungfu/skill/pomopima-jian.c', 'kungfu/skill/pomopima-jian/zui.c',
    'kungfu/skill/begging.c', 'kungfu/skill/medical.c',
    'kungfu/skill/blade.c', 'kungfu/skill/cuff.c', 'kungfu/skill/hand.c',
    'kungfu/skill/staff.c', 'kungfu/skill/strike.c', 'kungfu/skill/sword.c',
    'kungfu/skill/throwing.c', 'kungfu/skill/unarmed.c',
    'kungfu/skill/force.c', 'kungfu/skill/parry.c', 'kungfu/skill/dodge.c',
    'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'feature/attribute.c',
    'feature/condition.c', 'feature/action.c', 'mudcore/inherit/action.c',
    'feature/dbase.c', 'mudcore/inherit/dbase.c', 'feature/equip.c', 'feature/name.c',
    'feature/sserver.c', 'clone/user/user.c', 'inherit/char/char.c', 'adm/daemons/combatd.c',
    'adm/single/simul_efun/message.c', 'include/globals.h', 'include/combat.h',
    'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const b6ReviewedSourceHash = '10283536668ca899b4fa0c4b8117bb744401414adefd397c57fcc905739f6b26';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. forceSkill is the mapped special force for the actor cluster.
const schools = {
    'bagua-dao/mang': {
        skill: 'bagua-dao', ability: 'mang', abilityPath: 'mang',
        usage: 'blade', grant: 'can_perform/bagua-dao/mang',
        forceSkill: 'nei-bagua', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families: shangZhenyuan, actorFamily: '八卦门',
        title: '八卦刀法「劈天神芒」', directType: 'WEAPON', percent: 75,
        dpSkills: ['parry'], feeHit: 150, feeMiss: 60, hitBusy: 2, missBusy: 3,
        extraSkills: { 'wai-bagua': 200 },
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的八卦刀法修为不够，难以施展「劈天神芒」。\n' },
            { key: 'wai-bagua', pair: [139, 140], field: 'skill', skillName: 'wai-bagua',
                refusal: '你的外八卦神功修为不够，难以施展「劈天神芒」。\n' },
            { key: 'force', pair: [199, 200], field: 'skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「劈天神芒」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「劈天神芒」。\n' },
        ],
    },
    'bagua-dao/sha': {
        skill: 'bagua-dao', ability: 'sha', abilityPath: 'sha',
        usage: 'blade', grant: 'can_perform/bagua-dao/sha',
        forceSkill: 'nei-bagua', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families: shangZhenyuan, actorFamily: '八卦门',
        title: '八卦刀法「杀龙无悔」', directType: 'WEAPON', percent: 85,
        dpSkills: ['force'], feeHit: 200, feeMiss: 100, hitBusy: 3, missBusy: 4,
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的八卦刀法修为不够，难以施展「杀龙无悔」。\n' },
            { key: 'force', pair: [249, 250], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「杀龙无悔」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，难以施展「杀龙无悔」。\n' },
        ],
    },
    'bagua-dao/tian': {
        skill: 'bagua-dao', ability: 'tian', abilityPath: 'tian',
        usage: 'blade', grant: 'can_perform/bagua-dao/tian',
        forceSkill: 'nei-bagua', kind: 'combo', weapon: 'blade', prepared: 'blade',
        families: shangZhenyuan, actorFamily: '八卦门',
        title: '八卦刀法「天刀八势」',
        fee: 250, comboAttacks: 8, comboBusyMin: 1, comboBusyMax: 8,
        applyKeys: ['attack'], extraSkills: { 'wai-bagua': 300, 'nei-bagua': 300 },
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你的八卦刀法不够娴熟，难以施展「天刀八势」。\n' },
            { key: 'wai-bagua', pair: [199, 200], field: 'skill', skillName: 'wai-bagua',
                refusal: '你的外八卦神功不够娴熟，难以施展「天刀八势」。\n' },
            { key: 'nei-bagua', pair: [199, 200], field: 'skill', skillName: 'nei-bagua',
                refusal: '你的内八卦神功不够娴熟，难以施展「天刀八势」。\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内功修为不足，难以施展「天刀八势」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在真气不够，难以施展「天刀八势」。\n' },
        ],
    },
    'bagua-quan/gua': {
        skill: 'bagua-quan', ability: 'gua', abilityPath: 'gua',
        usage: 'cuff', grant: 'can_perform/bagua-quan/gua',
        forceSkill: 'nei-bagua', kind: 'direct', weapon: null, prepared: 'cuff',
        families: shangZhenyuan, actorFamily: '商家堡',
        title: '八卦拳法「劈卦八卦拳」', directType: 'UNARMED', percent: 20,
        dpSkills: ['parry'], feeHit: 100, feeMiss: 50, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [69, 70], field: 'skill',
                refusal: '你的八卦拳法不够娴熟，难以施展「劈卦八卦拳」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，难以施展「劈卦八卦拳」。\n' },
        ],
    },
    'bagua-zhang/jia': {
        skill: 'bagua-zhang', ability: 'jia', abilityPath: 'jia',
        usage: 'strike', grant: 'can_perform/bagua-zhang/jia',
        forceSkill: 'nei-bagua', kind: 'direct', weapon: null, prepared: 'strike',
        families: shangZhenyuan, actorFamily: '八卦门',
        title: '八卦掌「掌中夹镖」', receiveOnly: true,
        dpSkills: ['dodge', 'parry'], fee: 100, meBusy: 2,
        holdThrowing: true, extraSkills: { 'bagua-biao': 200 },
        extraMappings: { throwing: 'bagua-biao' },
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的八卦掌不够娴熟，难以施展「掌中夹镖」。\n' },
            { key: 'biao', pair: [119, 120], field: 'skill', skillName: 'bagua-biao',
                refusal: '你的八卦镖诀不够娴熟，难以施展「掌中夹镖」。\n' },
            { key: 'force', pair: [149, 150], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「掌中夹镖」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不足，难以施展「掌中夹镖」。\n' },
        ],
    },
    'bazhen-zhang/yin': {
        skill: 'bazhen-zhang', ability: 'yin', abilityPath: 'yin',
        usage: 'strike', grant: 'can_perform/bazhen-zhang/yin',
        forceSkill: 'nei-bagua', kind: 'direct', weapon: null, prepared: 'strike',
        families: shangZhenyuan, actorFamily: '八卦门',
        title: '八阵八卦掌「神卦天印」', directType: 'UNARMED', percent: 45,
        nonStandardHit: true, dpSkills: ['parry'], feeHit: 250, feeMiss: 100,
        hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [129, 130], field: 'skill',
                refusal: '你的八阵八卦掌不够娴熟，难以施展「神卦天印」。\n' },
            { key: 'force', pair: [179, 180], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「神卦天印」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，难以施展「神卦天印」。\n' },
        ],
    },
    'wai-bagua/zhen': {
        skill: 'wai-bagua', ability: 'zhen', abilityPath: 'zhen',
        usage: 'parry', grant: 'can_perform/wai-bagua/zhen',
        forceSkill: 'nei-bagua', kind: 'direct', weapon: null, prepared: null,
        families: shangZhenyuan, actorFamily: '八卦门',
        title: '外八卦「八卦震」', directType: 'UNARMED', percent: 30,
        nonStandardHit: true, dpSkills: ['force'], feeHit: 50, feeMiss: 50,
        hitBusy: 3, missBusy: 3, targetBusyOnHit: [0, 2],
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的外八卦不够娴熟，难以施展「八卦震」。\n' },
            { key: 'force', pair: [99, 100], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「八卦震」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不足，难以施展「八卦震」。\n' },
        ],
    },
    'dagou-bang/ban': {
        skill: 'dagou-bang', ability: 'ban', abilityPath: 'ban',
        usage: 'staff', grant: 'can_perform/dagou-bang/ban',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: 'staff', prepared: 'staff',
        families: gaibangTaohua, actorFamily: '丐帮',
        title: '打狗棒法「绊字诀」', directType: 'WEAPON', percent: 70,
        dpSkills: ['dodge'], feeHit: 200, feeMiss: 100,
        hitBusyMin: 1, hitBusyMax: 3, missBusy: 3,
        instantDeath: true, extraSkills: { 'martial-cognize': 200 },
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你打狗棒法不够娴熟，难以施展「绊字诀」。\n' },
            { key: 'force', pair: [239, 240], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「绊字诀」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，难以施展「绊字诀」。\n' },
        ],
    },
    'dagou-bang/chuo': {
        skill: 'dagou-bang', ability: 'chuo', abilityPath: 'chuo',
        usage: 'staff', grant: 'can_perform/dagou-bang/chuo',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: 'staff', prepared: 'staff',
        families: gaibangTaohua, actorFamily: '丐帮',
        title: '打狗棒法「戳字诀」', directType: 'WEAPON', percent: 50,
        dpSkills: ['dodge'], feeHit: 100, feeMiss: 50, hitBusy: 2, missBusy: 3,
        extraSkills: { 'martial-cognize': 200 },
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你打狗棒法不够娴熟，难以施展「戳字诀」。\n' },
            { key: 'force', pair: [159, 160], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「戳字诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「戳字诀」。\n' },
        ],
    },
    'dagou-bang/feng': {
        skill: 'dagou-bang', ability: 'feng', abilityPath: 'feng',
        usage: 'staff', grant: 'can_perform/dagou-bang/feng',
        forceSkill: 'huntian-qigong', kind: 'buff', weapon: 'staff', prepared: 'staff',
        families: gaibangTaohua, actorFamily: '丐帮',
        title: '打狗棒法「封字诀」',
        fee: 150, meBusy: 2, buff: 'feng_zijue', applyKeys: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你打狗棒法不够娴熟，难以施展「封字诀」。\n' },
            { key: 'force', pair: [179, 180], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「封字诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「封字诀」。\n' },
        ],
    },
    'dagou-bang/tian': {
        skill: 'dagou-bang', ability: 'tian', abilityPath: 'tian',
        usage: 'staff', grant: 'can_perform/dagou-bang/tian',
        forceSkill: 'huntian-qigong', kind: 'combo', weapon: 'staff', prepared: 'staff',
        families: gaibangTaohua, actorFamily: '丐帮',
        title: '打狗棒法「天下无狗」',
        feePerAttack: 30, comboAttacksMin: 5, comboAttacksMax: 9,
        comboBusyMin: 1, comboBusyMax: 9,
        applyKeys: ['attack', 'damage'],
        extraSkills: { begging: 200, 'martial-cognize': 200 },
        gates: [
            { key: 'level', pair: [219, 220], field: 'skill',
                refusal: '你打狗棒法不够娴熟，难以施展「天下无狗」。\n' },
            { key: 'force', pair: [299, 300], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「天下无狗」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不够，难以施展「天下无狗」。\n' },
        ],
    },
    'hujia-daofa/cang': {
        skill: 'hujia-daofa', ability: 'cang', abilityPath: 'cang',
        usage: 'blade', grant: 'can_perform/hujia-daofa/cang',
        forceSkill: 'lengyue-shengong', kind: 'combo', weapon: 'blade', prepared: 'blade',
        families: huMiao, actorFamily: '关外胡家',
        title: '胡家刀法「八方藏刀势」',
        fee: 220, comboAttacks: 8, comboBusyMin: 1, comboBusyMax: 8,
        applyKeys: ['attack'],
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的胡家刀法还不到家，难以施展「八方藏刀势」。\n' },
            { key: 'force', pair: [249, 250], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「八方藏刀势」。\n' },
            { key: 'neili', pair: [219, 220], field: 'neili',
                refusal: '你的真气不够，难以施展「八方藏刀势」。\n' },
        ],
    },
    'hujia-daofa/xian': {
        skill: 'hujia-daofa', ability: 'xian', abilityPath: 'xian',
        usage: 'blade', grant: 'can_perform/hujia-daofa/xian',
        forceSkill: 'lengyue-shengong', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families: huMiao, actorFamily: '关外胡家',
        title: '胡家刀法「推天献印势」', directType: 'WEAPON', percent: 25,
        nonStandardHit: true, dpSkills: ['force'], feeHit: 150, feeMiss: 50,
        hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的胡家刀法还不到家，难以施展「推天献印势」。\n' },
            { key: 'force', pair: [159, 160], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「推天献印势」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「推天献印势」。\n' },
        ],
    },
    'liuhe-dao/shan': {
        skill: 'liuhe-dao', ability: 'shan', abilityPath: 'shan',
        usage: 'blade', grant: 'can_perform/liuhe-dao/shan',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: 'blade', prepared: 'blade',
        families: gaibangHu, actorFamily: '丐帮',
        title: '六合刀法「闪刀诀」', directType: 'WEAPON', percent: 35,
        dpSkills: ['parry'], feeHit: 100, feeMiss: 50, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的六合刀法还不到家，难以施展「闪刀诀」。\n' },
            { key: 'force', pair: [99, 100], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「闪刀诀」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你的真气不够，难以施展「闪刀诀」。\n' },
        ],
    },
    'liuhe-zhang/tan': {
        skill: 'liuhe-zhang', ability: 'tan', abilityPath: 'tan',
        usage: 'strike', grant: 'can_perform/liuhe-zhang/tan',
        forceSkill: 'huntian-qigong', kind: 'direct', weapon: null, prepared: 'strike',
        families: gaibangHu, actorFamily: '丐帮',
        title: '六合掌法「乌龙探海」', directType: 'UNARMED', percent: 20,
        nonStandardHit: true, dpSkills: ['dodge'], feeHit: 50, feeMiss: 30,
        hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的六合掌法不够娴熟，难以施展「乌龙探海」。\n' },
            { key: 'force', pair: [99, 100], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「乌龙探海」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，难以施展「乌龙探海」。\n' },
        ],
    },
    'liuyang-zhang/huan': {
        skill: 'liuyang-zhang', ability: 'huan', abilityPath: 'huan',
        usage: 'strike', grant: 'can_perform/liuyang-zhang/huan',
        forceSkill: 'beiming-shengong', kind: 'direct', weapon: null, prepared: 'strike',
        families: lingjiuXiaoyao, actorFamily: '逍遥派',
        title: '天山六阳掌「寰阳式」', directType: 'UNARMED', percent: 40,
        dpSkills: ['force'], feeHit: 150, feeMiss: 50, hitBusy: 3, missBusy: 3,
        gates: [
            { key: 'level', pair: [129, 130], field: 'skill',
                refusal: '你的天山六阳掌不够娴熟，难以施展「寰阳式」。\n' },
            { key: 'force', pair: [199, 200], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「寰阳式」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，难以施展「寰阳式」。\n' },
        ],
    },
    'liuyang-zhang/zhong': {
        skill: 'liuyang-zhang', ability: 'zhong', abilityPath: 'zhong',
        usage: 'strike', grant: 'can_perform/liuyang-zhang/zhong',
        forceSkill: 'beiming-shengong', kind: 'direct', weapon: null, prepared: 'strike',
        families: lingjiuXiaoyao, actorFamily: '逍遥派',
        title: '天山六阳掌「生死符」', directType: 'REMOTE', percent: 50,
        nonStandardHit: true, dpSkills: ['force', 'medical'],
        feeHit: 0, feeMiss: 0, hitBusyMin: 1, hitBusyMax: 4, missBusy: 3,
        jingWound: [10, 14], poison: 'ss_poison', targetBusyOnMiss: 1,
        extraSkills: { medical: 200, throwing: 200 },
        extraMappings: { throwing: 'liuyang-zhang' },
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的天山六阳掌不够娴熟，难以施展「生死符」。\n' },
            { key: 'force', pair: [199, 200], field: 'skill', skillName: 'force',
                refusal: '你的内功不够火候，难以施展「生死符」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够，难以施展「生死符」。\n' },
        ],
    },
    'zhemei-shou/zhe': {
        skill: 'zhemei-shou', ability: 'zhe', abilityPath: 'zhe',
        usage: 'hand', grant: 'can_perform/zhemei-shou/zhe',
        forceSkill: 'beiming-shengong', kind: 'control', weapon: null, prepared: 'hand',
        families: lingjiuXiaoyao, actorFamily: '逍遥派',
        title: '逍遥折梅手「折梅式」',
        dpSkills: ['parry'], feeHit: 110, feeMiss: 80, meBusyMiss: 1,
        extraSkills: {},
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的逍遥折梅手等级不够，难以施展「折梅式」。\n' },
            { key: 'force', pair: [119, 120], field: 'skill', skillName: 'force',
                refusal: '你内功火候不够，难以施展「折梅式」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不足，难以施展「折梅式」。\n' },
        ],
    },
    'pomopima-jian/zui': {
        skill: 'pomopima-jian', ability: 'zui', abilityPath: 'zui',
        usage: 'sword', grant: 'can_perform/pomopima-jian/zui',
        forceSkill: 'xuantian-wujigong', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: meizhuangMingjiao, actorFamily: '梅庄',
        title: '泼墨披麻剑「醉里乾坤」', directType: 'WEAPON', percent: 70,
        dpSkills: ['parry'], feeHit: 200, feeMiss: 100, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的泼墨披麻剑修为不够，无法施展「醉里乾坤」。\n' },
            { key: 'force', pair: [149, 150], field: 'skill', skillName: 'force',
                refusal: '你的内功的修为不够，无法施展「醉里乾坤」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够，无法施展「醉里乾坤」。\n' },
        ],
    },
};

export const b6Schools = schools;

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
        default: return { skills: { [gate.field]: value } };
    }
};

export function b6PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b6SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b6ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b6ReviewedSourceHash,
            'Reviewed B6 sources changed; re-review before sampling');
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
            if (cfg.holdThrowing) skills.throwing = Math.max(skills.throwing ?? 0, 200);
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
                ...(cfg.holdThrowing
                    ? { equipment: { type: 'throwing', hold: true } }
                    : cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}),
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
                id: `b6-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b6', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b6-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b6SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}共享批量：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}等派perform销账，`
                        + '同一样本同时计入各派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '绊字诀内力碾压即倒、天下无狗袋数加成、掌中夹镖暗器消耗、'
                        + '八卦震与神卦天印非标准命中、生死符寒毒与精神创伤、'
                        + '封字诀临时招架增益均按原分支记账。只收集数据，不比较强弱。',
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
                refusal: '你现在正在施展「封字诀」。\n' });
        } else if (cfg.receiveOnly) {
            add('hit', { targetSkills: { dodge: 0, parry: 0 }, samples: 4 });
            add('miss', { targetSkills: { dodge: 100000, parry: 100000 }, samples: 4 });
        } else if (cfg.dpSkills && cfg.kind !== 'combo') {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        // Special constraints: explicit boundary variants only.
        if (cfg.instantDeath)
            add('instant-death', {
                targetProperties: { max_neili: 1000 }, samples: 2 });
        if (cfg.holdThrowing)
            add('no-throwing', { actorEquipment: null,
                refusal: '你现在手中并没有拿着暗器。\n' });
        if (cfg.ability === 'zhe')
            add('target-busy', { targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧。\n' });
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

export function validateB6Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B6 entry');
    assert.equal(p.collection_group, 'b6-perform');
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
    if (cfg.kind === 'buff') return validateB6Buff(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct' && cfg.receiveOnly) return validateB6Receive(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB6Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB6Control(raw, condition, cfg, p, b, t, a, v);
    return validateB6Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB6Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    // ban's max_neili crush branch: no do_damage, target disabled, fee 50, me busy 1.
    if (cfg.instantDeath && p.variant === 'instant-death') {
        assert.equal(directs.length, 0, 'instant-death has no direct');
        assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
        assert.equal(b.neili - a.neili, 50, 'crush fee');
        assert.equal(num(a.busy), 1, 'crush busy');
        assert.ok(v.eff_qi <= 1 || num(v.living) === 0 || num(v.ghost) === 1, 'target disabled');
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.neili -= 50; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
        return { accepted: true, kind: 'direct', hit: true };
    }
    const miss = directs.length === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), miss ? 0 : 1, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const fee = miss ? (cfg.feeMiss ?? 0) : (cfg.feeHit ?? 0);
    if (cfg.ability === 'zhen') assert.equal(b.neili - a.neili, 50, 'zhen unconditional fee');
    else assert.equal(b.neili - a.neili, fee, 'branch fee');
    const busyAfter = num(a.busy);
    const busyMin = miss ? (cfg.missBusyMin ?? cfg.missBusy) : (cfg.hitBusyMin ?? cfg.hitBusy);
    const busyMax = miss ? (cfg.missBusyMax ?? cfg.missBusy) : (cfg.hitBusyMax ?? cfg.hitBusy);
    assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'busy range');
    if (miss) {
        assertLearnGain(a, p.skill);
        const spent = b.neili - a.neili;
        stableState(b, a, e => {
            e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        if (cfg.targetBusyOnMiss) stableState(t, v, e => { e.busy = v.busy; });
        else stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'single direct');
    assert.equal(directs[0].actor, 0); assert.equal(directs[0].target, 1);
    const input = num(directs[0].damage);
    const support = cfg.percentRange
        ? supportRange(input, cfg.percentRange, b, t, cfg.directType)
        : slice2SupportSet(input, cfg.percent, b, t, cfg.directType);
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

function validateB6Receive(raw, condition, cfg, p, b, t, a, v) {
    // jia: receive_damage/receive_wound + weapon->hit_ob, not do_damage.
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'jia uses receive not do_damage');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    assert.equal(b.neili - a.neili, cfg.fee, 'jia fee');
    assert.equal(num(a.busy), cfg.meBusy, 'me busy');
    const miss = v.qi === t.qi && v.eff_qi === t.eff_qi;
    assertLearnGain(a, p.skill);
    const opts = { consumeThrowing: true };
    if (miss) {
        stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); }, opts);
        stableState(t, v, null, opts);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.ok(v.qi < t.qi, 'receive damage applied');
    assert.ok(v.eff_qi <= t.eff_qi, 'receive wound applied');
    stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); }, opts);
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        allowDerived(e, v);
    }, opts);
    return { accepted: true, kind: 'direct', hit: true };
}

function validateB6Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const hit = num(v.busy) > 0;
    const fee = hit ? cfg.feeHit : cfg.feeMiss;
    assert.equal(cost, fee, 'branch fee');
    assert.equal(b.neili - a.neili, fee, 'no extra deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    if (hit) {
        // zhe: target busy = query_skill(hand)/30 + 2 (effective, not raw).
        const level = num(sparse(b.effective_skills ?? b.skills, 'hand'));
        assert.equal(tBusy, Math.trunc(level / 30) + 2, 'zhe target busy');
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

function validateB6Buff(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'buff has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'buff fee');
    assert.equal(b.neili - a.neili, cfg.fee, 'buff fee deduction');
    assert.equal(num(a.busy ?? 0), p.fighting ? cfg.meBusy : 0);
    assert.equal(temp(a, cfg.buff), 1, 'buff flag set');
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    // feng: apply/parry += skill/3.
    const skill = num(sparse(b.skills, cfg.skill));
    assert.equal(temp(a, 'apply/parry') - temp(b, 'apply/parry'), Math.trunc(skill / 3));
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

function validateB6Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    if (cfg.feePerAttack) {
        // dagou-bang/tian: fee = planned attack_time * 30, planned 5-9.
        const planned = fee / cfg.feePerAttack;
        assert.equal(fee % cfg.feePerAttack, 0, 'fee tracks per-attack cost');
        assert.ok(planned >= cfg.comboAttacksMin && planned <= cfg.comboAttacksMax,
            'planned attack window');
        assert.ok(attacks.length >= 1 && attacks.length <= planned,
            'actual attacks bounded by plan');
    } else {
        assert.ok(fee >= cfg.fee, 'combo fee floor');
        assert.equal(attacks.length, cfg.comboAttacks, 'combo attack count');
    }
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

export function b6Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB6Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
