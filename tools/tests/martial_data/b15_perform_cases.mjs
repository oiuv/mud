// B15 Quanzhen-exclusive 10 + Hengshan-exclusive 9 perform batch (19 moves).
// Quanzhen: jinguan-yusuo suo, qixing-shou po, chongyang-shenzhang lian,
// tonggui-jian fen, tiangang-chenfa bai, haotian-zhang ju, zhongnan-zhi zhi,
// qixing-jian xing, kongming-quan ruo/kong. Hengshan: biluo-zhang lian,
// zigai-jian hui, shilin-jian luo, liuyun-zhang die/pai, henshan-quan lan,
// tianzhu-jian suo, furong-jian luan, luoyan-jian luo.
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

// Quanzhen-exclusive moves settle 全真教; Hengshan-exclusive settle 衡山派.
const quanzhenFamilies = ['全真教'];
const henshanFamilies = ['衡山派'];

export const b15SourcePaths = [
    'kungfu/skill/jinguan-yusuo.c', 'kungfu/skill/jinguan-yusuo/suo.c',
    'kungfu/skill/qixing-shou.c', 'kungfu/skill/qixing-shou/po.c',
    'kungfu/skill/chongyang-shenzhang.c', 'kungfu/skill/chongyang-shenzhang/lian.c',
    'kungfu/skill/tonggui-jian.c', 'kungfu/skill/tonggui-jian/fen.c',
    'kungfu/skill/tiangang-chenfa.c', 'kungfu/skill/tiangang-chenfa/bai.c',
    'kungfu/skill/haotian-zhang.c', 'kungfu/skill/haotian-zhang/ju.c',
    'kungfu/skill/zhongnan-zhi.c', 'kungfu/skill/zhongnan-zhi/zhi.c',
    'kungfu/skill/qixing-jian.c', 'kungfu/skill/qixing-jian/xing.c',
    'kungfu/skill/kongming-quan.c', 'kungfu/skill/kongming-quan/ruo.c',
    'kungfu/skill/kongming-quan/kong.c',
    'kungfu/skill/biluo-zhang.c', 'kungfu/skill/biluo-zhang/lian.c',
    'kungfu/skill/zigai-jian.c', 'kungfu/skill/zigai-jian/hui.c',
    'kungfu/skill/shilin-jian.c', 'kungfu/skill/shilin-jian/luo.c',
    'kungfu/skill/liuyun-zhang.c', 'kungfu/skill/liuyun-zhang/die.c',
    'kungfu/skill/liuyun-zhang/pai.c',
    'kungfu/skill/henshan-quan.c', 'kungfu/skill/henshan-quan/lan.c',
    'kungfu/skill/tianzhu-jian.c', 'kungfu/skill/tianzhu-jian/suo.c',
    'kungfu/skill/furong-jian.c', 'kungfu/skill/furong-jian/luan.c',
    'kungfu/skill/luoyan-jian.c', 'kungfu/skill/luoyan-jian/luo.c',
    'kungfu/skill/henshan-xinfa.c', 'kungfu/skill/xuanmen-neigong.c',
    'kungfu/skill/sword.c', 'kungfu/skill/cuff.c',
    'kungfu/skill/strike.c', 'kungfu/skill/finger.c',
    'kungfu/skill/hand.c', 'kungfu/skill/unarmed.c',
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
export const b15ReviewedSourceHash = '35ace044888f9b69fb62d965f7b1e50c21c8a75db070a8c456a50d102ff9f387';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. All B15 moves gate on basic force except none that remap force.
const schools = {
    'jinguan-yusuo/suo': {
        skill: 'jinguan-yusuo', ability: 'suo', abilityPath: 'suo',
        usage: 'parry', grant: 'can_perform/jinguan-yusuo/suo',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: null,
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '金关玉锁「玄门金锁」',
        feeHit: 100, feeMiss: 50,
        meBusyHit: 1, meBusyMiss: 2,
        targetBusyFormula: 'skill16', dpSkills: ['parry'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的金关玉锁不够熟练，难以施展「玄门金锁」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「玄门金锁」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「玄门金锁」。\n' },
        ],
    },
    'qixing-shou/po': {
        skill: 'qixing-shou', ability: 'po', abilityPath: 'po',
        usage: 'hand', grant: 'can_perform/qixing-shou/po',
        forceSkill: 'force', kind: 'multi', weapon: null, prepared: 'hand',
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '七星分天手「破穹云蛟」', directType: 'UNARMED',
        multiDirects: 3,
        percentRanges: [[20, 20], [25, 25], [30, 30]],
        // Unconditional fee; each palm has its own hit check and may miss.
        fee: 200, hitBusyMin: 2, hitBusyMax: 4,
        dpSkills: ['parry', 'dodge', 'force'],
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你七星分天手不够娴熟，难以施展「破穹云蛟」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「破穹云蛟」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「破穹云蛟」。\n' },
        ],
    },
    'chongyang-shenzhang/lian': {
        skill: 'chongyang-shenzhang', ability: 'lian', abilityPath: 'lian',
        usage: 'strike', grant: 'can_perform/chongyang-shenzhang/lian',
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'strike',
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '重阳神掌「重阳连环掌」',
        fee: 80, comboAttacks: 4, comboBusyMin: 1, comboBusyMax: 4,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你重阳神掌不够娴熟，难以施展「重阳连环掌」。\n' },
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「重阳连环掌」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你目前的真气不足，难以施展「重阳连环掌」。\n' },
        ],
    },
    'tonggui-jian/fen': {
        skill: 'tonggui-jian', ability: 'fen', abilityPath: 'fen',
        usage: 'sword', grant: 'can_perform/tonggui-jian/fen',
        forceSkill: 'force', kind: 'sacrifice', weapon: 'sword', prepared: 'sword',
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '同归剑法「玉石俱焚」', directType: 'WEAPON', percent: 90,
        // Always -50 max_neili before the hit check; hit zeroes neili and
        // further reduces max_neili by random(50), then enters death branches.
        feeHit: 0, feeMiss: 0, sacrifice: true,
        hitBusyMin: 6, hitBusyMax: 6, missBusy: 8,
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的同归剑法不够娴熟，难以施展「玉石俱焚」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不足，难以施展「玉石俱焚」。\n' },
            { key: 'max-neili', pair: [1499, 1500], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「玉石俱焚」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「玉石俱焚」。\n' },
        ],
    },
    'tiangang-chenfa/bai': {
        skill: 'tiangang-chenfa', ability: 'bai', abilityPath: 'bai',
        usage: 'whip', grant: 'can_perform/tiangang-chenfa/bai',
        forceSkill: 'force', kind: 'direct', weapon: 'whip', prepared: 'whip',
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '天罡尘法「朝拜天罡」', directType: 'WEAPON', percent: 50,
        // Miss branch deducts no neili.
        feeHit: 180, feeMiss: 0,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你天罡尘法不够娴熟，难以施展「朝拜天罡」。\n' },
            { key: 'max-neili', pair: [1499, 1500], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「朝拜天罡」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，难以施展「朝拜天罡」。\n' },
        ],
    },
    'haotian-zhang/ju': {
        skill: 'haotian-zhang', ability: 'ju', abilityPath: 'ju',
        usage: 'strike', grant: 'can_perform/haotian-zhang/ju',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '昊天掌「三花聚顶」', directType: 'UNARMED', percent: 50,
        // Hit check random(force) > target force/2.
        nonstandardHit: 'force-half',
        feeHit: 200, feeMiss: 60,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['force'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的昊天掌不够娴熟，难以施展「三花聚顶」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「三花聚顶」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「三花聚顶」。\n' },
        ],
    },
    'zhongnan-zhi/zhi': {
        skill: 'zhongnan-zhi', ability: 'zhi', abilityPath: 'zhi',
        usage: 'finger', grant: 'can_perform/zhongnan-zhi/zhi',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'finger',
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '终南指法「剑指南山」', directType: 'UNARMED', percent: 20,
        // Hit check random(finger) > target parry/2.
        nonstandardHit: 'finger-parry-half',
        feeHit: 60, feeMiss: 20,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你终南指法不够娴熟，难以施展「剑指南山」。\n' },
            { key: 'force', pair: [79, 80], field: 'effective-skill', skillName: 'force',
                refusal: '你内功修为不够，难以施展「剑指南山」。\n' },
            { key: 'neili', pair: [59, 60], field: 'neili',
                refusal: '你现在的真气不够，难以施展「剑指南山」。\n' },
        ],
    },
    'qixing-jian/xing': {
        skill: 'qixing-jian', ability: 'xing', abilityPath: 'xing',
        usage: 'sword', grant: 'can_perform/qixing-jian/xing',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '七星剑法「群星璀璨」', directType: 'WEAPON', percent: 10,
        feeHit: 30, feeMiss: 20,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你七星剑法修为不够，难以施展「群星璀璨」。\n' },
            { key: 'force', pair: [79, 80], field: 'effective-skill', skillName: 'force',
                refusal: '你内功的修为不够，难以施展「群星璀璨」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你现在的真气不足，难以施展「群星璀璨」。\n' },
        ],
    },
    'kongming-quan/ruo': {
        skill: 'kongming-quan', ability: 'ruo', abilityPath: 'ruo',
        usage: 'unarmed', grant: 'can_perform/kongming-quan/ruo',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'unarmed',
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '空明拳「空明若玄」',
        feeHit: 50, feeMiss: 50, unconditionalFee: true,
        meBusyHit: 0, meBusyMiss: 2,
        targetBusyFormula: 'skill16-2', dpSkills: ['parry'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的空明拳不够娴熟，难以施展「空明若玄」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气太弱，难以施展「空明若玄」。\n' },
        ],
    },
    'kongming-quan/kong': {
        skill: 'kongming-quan', ability: 'kong', abilityPath: 'kong',
        usage: 'unarmed', grant: 'can_perform/kongming-quan/kong',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'unarmed',
        families: quanzhenFamilies, actorFamily: '全真教',
        title: '空明拳「空空如也」', directType: 'UNARMED', percent: 80,
        feeHit: 80, feeMiss: 80, unconditionalFee: true,
        hitBusy: 3, missBusy: 2,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的空明拳不够娴熟，难以施展「空空如也」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在的真气太弱，难以施展「空空如也」。\n' },
        ],
    },
    'biluo-zhang/lian': {
        skill: 'biluo-zhang', ability: 'lian', abilityPath: 'lian',
        usage: 'strike', grant: 'can_perform/biluo-zhang/lian',
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'strike',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '碧罗掌法「峰连碧罗」',
        // attack_time = 3+random(ap/40) capped 6; fee = attack_time*20.
        feePerAttack: 20, comboAttacksMin: 3, comboAttacksMax: 6,
        comboBusyMin: 1, comboBusyMax: 6, applyKeys: ['attack'],
        // Hit check random(strike) > parry/2 arms a temporary +50 attack.
        comboHitBonus: 50,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你碧罗掌法不够娴熟，难以施展「峰连碧罗」。\n' },
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「峰连碧罗」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「峰连碧罗」。\n' },
        ],
    },
    'zigai-jian/hui': {
        skill: 'zigai-jian', ability: 'hui', abilityPath: 'hui',
        usage: 'sword', grant: 'can_perform/zigai-jian/hui',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '紫盖剑法「紫盖回翔」', directType: 'WEAPON', percent: 45,
        feeHit: 100, feeMiss: 50,
        hitBusy: 2, missBusy: 3,
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你紫盖剑法不够娴熟，难以施展「紫盖回翔」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「紫盖回翔」。\n' },
            { key: 'dodge', pair: [119, 120], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功火候不够，难以施展「紫盖回翔」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在的真气不够，难以施展「紫盖回翔」。\n' },
        ],
    },
    'shilin-jian/luo': {
        skill: 'shilin-jian', ability: 'luo', abilityPath: 'luo',
        usage: 'sword', grant: 'can_perform/shilin-jian/luo',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '石廪剑法「落英纷飞」',
        // Base 4 attacks; hit adds random(ap/45) capped so total <= 7.
        feePerAttack: 20, comboAttacksMin: 4, comboAttacksMax: 7,
        comboBusyMin: 1, comboBusyMax: 7, applyKeys: ['attack'],
        // Hit check ap/2+random(ap*2) > dodge; hit arms apply/attack += ap/8.
        comboHitAttackFromSkill: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你石廪剑法不够娴熟，难以施展「落英纷飞」。\n' },
            { key: 'neili', pair: [139, 140], field: 'neili',
                refusal: '你现在的真气不够，难以施展「落英纷飞」。\n' },
        ],
    },
    'liuyun-zhang/die': {
        skill: 'liuyun-zhang', ability: 'die', abilityPath: 'die',
        usage: 'strike', grant: 'can_perform/liuyun-zhang/die',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'strike',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '流云掌「流云叠影」',
        feeHit: 80, feeMiss: 30,
        meBusyHit: 1, meBusyMiss: 2,
        // ap = skill + dodge/2; busy = ap/45+1.
        targetBusyFormula: 'ap45-1', dpSkills: ['dodge'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你流云掌不够娴熟，难以施展「流云叠影」。\n' },
            { key: 'dodge', pair: [149, 150], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，难以施展「流云叠影」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「流云叠影」。\n' },
        ],
    },
    'liuyun-zhang/pai': {
        skill: 'liuyun-zhang', ability: 'pai', abilityPath: 'pai',
        usage: 'strike', grant: 'can_perform/liuyun-zhang/pai',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '流云掌「排山倒海」', directType: 'UNARMED', percent: 60,
        feeHit: 200, feeMiss: 100,
        hitBusy: 3, missBusy: 4,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你流云掌不够娴熟，难以施展「排山倒海」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「排山倒海」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，难以施展「排山倒海」。\n' },
        ],
    },
    'henshan-quan/lan': {
        skill: 'henshan-quan', ability: 'lan', abilityPath: 'lan',
        usage: 'cuff', grant: 'can_perform/henshan-quan/lan',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'cuff',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '衡山拳法「青天揽日月」', directType: 'UNARMED', percent: 40,
        feeHit: 100, feeMiss: 30,
        hitBusyMin: 2, hitBusyMax: 3, missBusyMin: 2, missBusyMax: 4,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你衡山拳法不够娴熟，难以施展「青天揽日月」。\n' },
            { key: 'force', pair: [79, 80], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「青天揽日月」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「青天揽日月」。\n' },
        ],
    },
    'tianzhu-jian/suo': {
        skill: 'tianzhu-jian', ability: 'suo', abilityPath: 'suo',
        usage: 'sword', grant: 'can_perform/tianzhu-jian/suo',
        forceSkill: 'force', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '天柱剑法「烟云锁身」',
        // Normal branch fee 100 / me busy 1; disarm branch fee 200 / me busy 2.
        feeHit: 100, feeMiss: 100, unconditionalFee: true,
        meBusyHit: 1, meBusyMiss: 1,
        targetBusyFormula: 'skill25-1', dpSkills: ['parry'],
        targetBusyRefusal: true,
        disarm: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你天柱剑法不够娴熟，难以施展「烟云锁身」。\n' },
            { key: 'dodge', pair: [149, 150], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，难以施展「烟云锁身」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「烟云锁身」。\n' },
        ],
    },
    'furong-jian/luan': {
        skill: 'furong-jian', ability: 'luan', abilityPath: 'luan',
        usage: 'sword', grant: 'can_perform/furong-jian/luan',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '芙蓉剑法「乱剑覆花」', directType: 'WEAPON', percent: 60,
        // Hit check random(ap) >= random(dp/3); fee and busy identical both ways.
        nonstandardHit: 'random-ge-third',
        feeHit: 100, feeMiss: 100, unconditionalFee: true,
        hitBusy: 3, missBusy: 3,
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你芙蓉剑法不够娴熟，难以施展「乱剑覆花」。\n' },
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「乱剑覆花」。\n' },
            { key: 'dodge', pair: [119, 120], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功火候不够，难以施展「乱剑覆花」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不够，难以施展「乱剑覆花」。\n' },
        ],
    },
    'luoyan-jian/luo': {
        skill: 'luoyan-jian', ability: 'luo', abilityPath: 'luo',
        usage: 'sword', grant: 'can_perform/luoyan-jian/luo',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: henshanFamilies, actorFamily: '衡山派',
        title: '回风落雁剑「一剑落九雁」',
        fee: 200, comboAttacks: 9, comboBusyMin: 1, comboBusyMax: 9,
        applyKeys: ['attack'],
        // Hit check arms apply/attack += skill/40; random target busy during loop.
        comboHitAttackFromSkill: true, comboRandomTargetBusy: true,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的回风落雁剑不够娴熟，难以施展「一剑落九雁」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你目前的真气不够，难以施展「一剑落九雁」。\n' },
        ],
    },
};

export const b15Schools = schools;

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
            return { skills: { [name]: isLow ? value * 2 : (value + 1) * 2 } };
        }
        default: return { skills: { [gate.field]: value } };
    }
};

export function b15PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b15SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b15ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b15ReviewedSourceHash,
            'Reviewed B15 sources changed; re-review before sampling');
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
                id: `b15-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b15', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b15-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b15SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}独有：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + (cfg.kind === 'sacrifice'
                            ? '玉石俱焚含内力碾压同归分支，先扣最大内力50，命中后清空真气并再损最大内力，死亡分支按原逻辑记账。'
                            : cfg.disarm
                                ? '烟云锁身含夺械分支，内力碾压且目标持械时走夺械，否则目标忙乱。'
                                : cfg.kind === 'multi'
                                    ? '破穹云蛟三掌各自判定并分段记账，费用无条件扣除。'
                                    : '目标忙乱与直伤与连击均按原分支记账。')
                        + '只收集数据，不比较强弱。',
                },
            });
        }
        const primary = cfg.gates[0];
        add(`baseline-l${level}`, {
            ...(cfg.kind === 'sacrifice' ? { targetSkills: { force: 0 } } : {}),
            samples: smoke ? 2 : samples });
        for (const gate of cfg.gates.filter(g => g.key === primary.key)) {
            const [low, high] = gate.pair;
            add(`gate-${gate.key}-${low}`, { ...gateEdit(cfg, gate, low, true),
                refusal: gate.refusal, samples: 2 });
            add(`gate-${gate.key}-${high}`, { ...gateEdit(cfg, gate, high, false), samples: 2 });
        }
        if (cfg.kind === 'sacrifice') {
            // Baseline already forces the outer hit; miss and death branches follow.
            add('miss', { targetSkills: { force: 100000 }, samples: 4 });
            add('self-death', { targetSkills: { force: 0 },
                properties: { max_neili: 1500 }, targetProperties: { max_neili: 8000 },
                samples: smoke ? 2 : 4 });
            add('target-death', { targetSkills: { force: 0 },
                properties: { max_neili: 8000 }, targetProperties: { max_neili: 2000 },
                samples: smoke ? 2 : 4 });
        } else if (cfg.disarm) {
            add('disarm', { targetProperties: { max_neili: 4000 },
                targetEquipment: { type: 'sword', hold: false }, samples: smoke ? 2 : 4 });
            add('disarm-miss', { targetProperties: { max_neili: 4000 },
                targetEquipment: { type: 'sword', hold: false },
                targetSkills: Object.fromEntries(cfg.dpSkills.map(skill => [skill, 100000])),
                samples: 4 });
        } else if (cfg.kind === 'buff') {
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
        // chongyang-shenzhang/lian sets action_flag before each do_attack.
        if (side.temp) delete side.temp.action_flag;
        // tonggui-jian/fen death branches set die_reason on the dying side.
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
    const rawSkill = num(sparse(b.skills, cfg.skill));
    const rawDodge = num(sparse(b.skills, 'dodge'));
    const effSkill = name => {
        const raw = num(sparse(b.skills, name));
        const mapped = b.mappings?.[name];
        return Math.trunc(raw / 2) + (mapped ? num(sparse(b.skills, mapped)) : 0);
    };
    switch (cfg.targetBusyFormula) {
        // suo jinguan: level = query_skill(skill,1); busy = level/16
        case 'skill16': return Math.trunc(rawSkill / 16);
        // ruo kongming: level = query_skill(skill,1); busy = level/16+2
        case 'skill16-2': return Math.trunc(rawSkill / 16) + 2;
        // die liuyun: ap = skill + dodge/2; busy = ap/45+1
        case 'ap45-1': {
            const ap = rawSkill + Math.trunc(rawDodge / 2);
            return Math.trunc(ap / 45) + 1;
        }
        // suo tianzhu: ap = skill; busy = ap/25+1
        case 'skill25-1': return Math.trunc(rawSkill / 25) + 1;
        default: return 0;
    }
}

export function validateB15Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B15 entry');
    assert.equal(p.collection_group, 'b15-perform');
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
    if (cfg.kind === 'control') return validateB15Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB15Multi(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'sacrifice') return validateB15Sacrifice(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB15Direct(raw, condition, cfg, p, b, t, a, v);
    return validateB15Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB15Direct(raw, condition, cfg, p, b, t, a, v) {
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
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB15Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const hit = num(v.busy) > 0;
    const disarmBranch = cfg.disarm && p.variant.startsWith('disarm');
    const fee = disarmBranch ? 200 : hit ? cfg.feeHit : cfg.feeMiss;
    assert.equal(cost, fee, 'control fee');
    assert.equal(b.neili - a.neili, fee, 'fee deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    if (hit) {
        assert.ok(tBusy >= 1, 'target busy on hit');
        if (disarmBranch) assert.equal(tBusy, 3, 'disarm branch target busy 3');
        else {
            const expected = targetBusyFor(cfg, b, hit);
            assert.equal(tBusy, expected, 'target busy formula');
        }
        const meMin = disarmBranch ? 2 : (cfg.meBusyHitMin ?? cfg.meBusyHit ?? 0);
        const meMax = disarmBranch ? 2 : (cfg.meBusyHitMax ?? cfg.meBusyHit ?? 0);
        assert.ok(busyAfter >= meMin && busyAfter <= meMax, 'me busy on hit');
    } else {
        assert.equal(tBusy, 0, 'no target busy on miss');
        assert.equal(busyAfter, disarmBranch ? 2 : (cfg.meBusyMiss ?? 0), 'me busy on miss');
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    const disarm = cfg.disarm && (p.variant === 'disarm' || p.variant === 'disarm-miss');
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.busy = v.busy;
        if (disarm) {
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
    return { accepted: true, kind: 'control', hit };
}

function validateB15Multi(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= cfg.multiDirects, 'multi direct bound');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
    }
    const fee = b.neili - a.neili;
    assert.equal(fee, cfg.fee, 'unconditional multi fee');
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

function validateB15Sacrifice(raw, condition, cfg, p, b, t, a, v) {
    // tonggui-jian fen: always -50 max_neili first; hit zeroes neili and
    // further cuts max_neili, then may enter self/target/mutual death.
    // Full death processing can clear busy, change combat_exp and add die_guard.
    const directs = raw.directs ?? [];
    const death = raw.terminals.length > 0 || num(a.ghost) === 1 || num(v.ghost) === 1
        || num(v.living) === 0 || num(a.living) === 0;
    // killer_reward also deducts 20 on this unprotected player's actual death.
    const ghostLoss = (num(a.ghost) ? 20 : 0);
    const maxLoss = num(b.max_neili) - num(a.max_neili) - ghostLoss;
    assert.ok(maxLoss >= 50 && maxLoss <= 99, 'sacrifice max_neili loss 50+random(50)');
    // Outer miss pays only the opening 50 and leaves neili alone.
    const miss = num(a.neili) === num(b.neili) && !death;
    if (miss) {
        assert.equal(maxLoss, 50, 'miss only pays the opening 50');
        assert.equal(num(a.busy), cfg.missBusy, 'miss busy 8');
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.max_neili = a.max_neili; e.busy = a.busy;
            e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v);
        return { accepted: true, kind: 'sacrifice', hit: false };
    }
    // Hit path: neili zeroed (unless death revived it), busy 6 (unless death).
    if (!death) assert.equal(num(a.busy), cfg.hitBusyMin, 'hit busy 6');
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

function validateB15Combo(raw, condition, cfg, p, b, t, a, v) {
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

export function b15Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB15Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
