// B5 shared Duan x Quanzhen + Jueqing x Tiezhang perform batch (15 moves).
// Dali Duan / Quanzhen cluster: xiantian-gong dang/fen/hun/jian + yiyang-zhi
// die/heal/jian/qian. Jueqing / Tiezhang cluster: tie-zhang dao/juesha/long/yin
// + chuanxin-zhang zhui + feilong-zhang fei + tiexian-quan tui. One collection
// settles two families' perform coverage per cluster. Finite reviewed conditions
// only; no game-code writes and no balance claims.
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

// Two shared clusters. Each move settles both families' perform coverage.
const duanQuanzhen = ['大理段家', '全真教'];
const jueqingTiezhang = ['绝情谷', '铁掌帮'];

export const b5SourcePaths = [
    'kungfu/skill/xiantian-gong.c',
    'kungfu/skill/xiantian-gong/perform/dang.c', 'kungfu/skill/xiantian-gong/perform/fen.c',
    'kungfu/skill/xiantian-gong/perform/hun.c', 'kungfu/skill/xiantian-gong/perform/jian.c',
    'kungfu/skill/yiyang-zhi.c', 'kungfu/skill/yiyang-zhi/die.c', 'kungfu/skill/yiyang-zhi/heal.c',
    'kungfu/skill/yiyang-zhi/jian.c', 'kungfu/skill/yiyang-zhi/qian.c', 'kungfu/skill/yiyang-zhi/dian.c',
    'kungfu/skill/jingluo-xue.c',
    'kungfu/skill/tie-zhang.c', 'kungfu/skill/tie-zhang/dao.c', 'kungfu/skill/tie-zhang/juesha.c',
    'kungfu/skill/tie-zhang/long.c', 'kungfu/skill/tie-zhang/yin.c',
    'kungfu/skill/chuanxin-zhang.c', 'kungfu/skill/chuanxin-zhang/zhui.c',
    'kungfu/skill/feilong-zhang.c', 'kungfu/skill/feilong-zhang/fei.c',
    'kungfu/skill/tiexian-quan.c', 'kungfu/skill/tiexian-quan/tui.c',
    'kungfu/skill/tianlei-shengong.c',
    'kungfu/skill/finger.c', 'kungfu/skill/strike.c', 'kungfu/skill/cuff.c',
    'kungfu/skill/staff.c', 'kungfu/skill/unarmed.c',
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
export const b5ReviewedSourceHash = '4bee591fbc4c94afb7d02f046fbe204b1d524ad45396d5fcc7e546acc196c58a';

// Query skill gates use raw (field 'skill') or effective (field 'effective-*')
// values exactly as each perform reads them. xiantian-gong abilities live under
// a perform/ subdirectory (abilityPath).
const schools = {
    'xiantian-gong/dang': {
        skill: 'xiantian-gong', ability: 'dang', abilityPath: 'perform/dang',
        usage: 'unarmed', grant: 'can_perform/xiantian-gong/dang',
        forceSkill: 'xiantian-gong', kind: 'direct', weapon: null, prepared: 'unarmed',
        families: duanQuanzhen, actorFamily: '全真教',
        title: '先天功「神威浩荡」', directType: 'UNARMED', percent: 90,
        dpSkills: ['parry', 'force'], feeHit: 400, feeMiss: 120, hitBusy: 3, missBusy: 4,
        instantDeath: true, equipDestroy: true,
        gates: [
            { key: 'level', pair: [239, 240], field: 'skill',
                refusal: '你的先天功修为不够，难以施展「神威浩荡」。\n' },
            { key: 'max-neili', pair: [3999, 4000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「神威浩荡」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你现在的真气不足，难以施展「神威浩荡」。\n' },
        ],
    },
    'xiantian-gong/fen': {
        skill: 'xiantian-gong', ability: 'fen', abilityPath: 'perform/fen',
        usage: 'unarmed', grant: 'can_perform/xiantian-gong/fen',
        forceSkill: 'xiantian-gong', kind: 'direct', weapon: null, prepared: 'unarmed',
        families: duanQuanzhen, actorFamily: '全真教',
        title: '先天功「五阴焚灭」', directType: 'UNARMED', percent: 90,
        dpSkills: ['parry', 'force'], feeHit: 500, feeMiss: 120, hitBusy: 3, missBusy: 4,
        instantDeath: true,
        gates: [
            { key: 'level', pair: [239, 240], field: 'skill',
                refusal: '你的先天功修为不够，难以施展「五阴焚灭」。\n' },
            { key: 'max-neili', pair: [3999, 4000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「五阴焚灭」。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你现在的真气不足，难以施展「五阴焚灭」。\n' },
        ],
    },
    'xiantian-gong/hun': {
        skill: 'xiantian-gong', ability: 'hun', abilityPath: 'perform/hun',
        usage: 'unarmed', grant: 'can_perform/xiantian-gong/hun',
        forceSkill: 'xiantian-gong', kind: 'combo', weapon: null, prepared: 'unarmed',
        families: duanQuanzhen, actorFamily: '全真教',
        title: '先天功「天地混元」',
        fee: 280, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: ['attack'],
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你的先天功修为不够，难以施展「天地混元」。\n' },
            { key: 'max-neili', pair: [3999, 4000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「天地混元」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「天地混元」。\n' },
        ],
    },
    'xiantian-gong/jian': {
        skill: 'xiantian-gong', ability: 'jian', abilityPath: 'perform/jian',
        usage: 'unarmed', grant: 'can_perform/xiantian-gong/jian',
        forceSkill: 'xiantian-gong', kind: 'combo', weapon: null, prepared: 'unarmed',
        families: duanQuanzhen, actorFamily: '全真教',
        title: '先天功「乾阳剑气」',
        fee: 600, comboAttacks: 5, comboBusyMin: 3, comboBusyMax: 5,
        comboDirect: true, directType: 'UNARMED', applyKeys: ['attack'],
        extraMappings: { finger: 'yiyang-zhi' }, extraSkills: { 'yiyang-zhi': 280, 'jingluo-xue': 200 },
        gates: [
            { key: 'level', pair: [279, 280], field: 'skill',
                refusal: '你的先天功修为不够，难以施展「先天功乾阳剑气」。\n' },
            { key: 'yiyang', pair: [279, 280], field: 'skill', skillName: 'yiyang-zhi',
                refusal: '你一阳指诀不够娴熟，难以施展「先天功乾阳剑气」。\n' },
            { key: 'jingluo', pair: [199, 200], field: 'skill', skillName: 'jingluo-xue',
                refusal: '你对经络学了解不够，难以施展「先天功乾阳剑气」。\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「先天功乾阳剑气」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在的真气不足，难以施展「先天功乾阳剑气」。\n' },
        ],
    },
    'yiyang-zhi/die': {
        skill: 'yiyang-zhi', ability: 'die', abilityPath: 'die',
        usage: 'finger', grant: 'can_perform/yiyang-zhi/die',
        forceSkill: 'xiantian-gong', kind: 'direct', weapon: null, prepared: 'finger',
        families: duanQuanzhen, actorFamily: '大理段家',
        title: '一阳指「阳关三叠」', directType: 'UNARMED',
        maxDirects: 3,
        stages: [
            { dpField: 'parry', percentRange: [70, 70], damageSpan: 0 },
            { dpField: 'dodge', percentRange: [80, 80], damageSpan: 0 },
            { dpField: 'force', percentRange: [90, 90], damageSpan: 0 },
        ],
        dpSkills: ['parry', 'dodge', 'force'], fee: 400, meBusyMin: 3, meBusyMax: 5,
        disarm: true, extraSkills: { 'jingluo-xue': 200, force: 300 }, forceGate: 300,
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你一阳指诀不够娴熟，难以施展「阳关三叠」。\n' },
            { key: 'jingluo', pair: [199, 200], field: 'skill', skillName: 'jingluo-xue',
                refusal: '你对经络学了解不够，难以施展「阳关三叠」。\n' },
            { key: 'force', pair: [299, 300], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「阳关三叠」。\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「阳关三叠」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在的真气不够，难以施展「阳关三叠」。\n' },
        ],
    },
    'yiyang-zhi/heal': {
        skill: 'yiyang-zhi', ability: 'heal', abilityPath: 'heal',
        usage: 'finger', grant: 'can_perform/yiyang-zhi/heal',
        forceSkill: 'xiantian-gong', kind: 'heal', weapon: null, prepared: 'finger',
        families: duanQuanzhen, actorFamily: '大理段家',
        title: '一阳指「起死回生」',
        fee: 800, selfQi: 100, selfJing: 50, meBusy: 10,
        extraSkills: { 'jingluo-xue': 100 }, nonCombat: true,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的一阳指诀不够娴熟，难以施展「起死回生」。\n' },
            { key: 'jingluo', pair: [99, 100], field: 'skill', skillName: 'jingluo-xue',
                refusal: '你对经络学的了解不够，难以施展「起死回生」。\n' },
            { key: 'max-neili', pair: [1499, 1500], field: 'max_neili',
                refusal: '你的内力修为太浅，难以施展「起死回生」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在的真气不足，难以施展「起死回生」。\n' },
        ],
    },
    'yiyang-zhi/jian': {
        skill: 'yiyang-zhi', ability: 'jian', abilityPath: 'jian',
        usage: 'finger', grant: 'can_perform/xiantian-gong/jian',
        forceSkill: 'xiantian-gong', kind: 'combo', weapon: null, prepared: 'finger',
        families: duanQuanzhen, actorFamily: '大理段家',
        title: '先天功「乾阳剑气」',
        fee: 600, comboAttacks: 5, comboBusyMin: 3, comboBusyMax: 5,
        comboDirect: true, directType: 'UNARMED', applyKeys: ['attack'],
        extraMappings: { unarmed: 'xiantian-gong' }, extraSkills: { 'xiantian-gong': 280, 'jingluo-xue': 200 },
        gates: [
            { key: 'level', pair: [279, 280], field: 'skill',
                refusal: '你一阳指诀不够娴熟，难以施展「先天功乾阳剑气」。\n' },
            { key: 'xiantian', pair: [279, 280], field: 'skill', skillName: 'xiantian-gong',
                refusal: '你的先天功修为不够，难以施展「先天功乾阳剑气」。\n' },
            { key: 'jingluo', pair: [199, 200], field: 'skill', skillName: 'jingluo-xue',
                refusal: '你对经络学了解不够，难以施展「先天功乾阳剑气」。\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「先天功乾阳剑气」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在的真气不足，难以施展「先天功乾阳剑气」。\n' },
        ],
    },
    'yiyang-zhi/qian': {
        skill: 'yiyang-zhi', ability: 'qian', abilityPath: 'qian',
        usage: 'finger', grant: 'can_perform/yiyang-zhi/qian',
        forceSkill: 'xiantian-gong', kind: 'direct', weapon: null, prepared: 'finger',
        families: duanQuanzhen, actorFamily: '大理段家',
        title: '一阳指「一指乾坤」', directType: 'UNARMED', percent: 75,
        dpSkills: ['parry', 'force'], feeHit: 200, feeMiss: 150, hitBusy: 2, missBusy: 4,
        extraSkills: { 'jingluo-xue': 160, force: 220 }, forceGate: 220,
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你一阳指诀不够娴熟，难以施展「一指乾坤」。\n' },
            { key: 'jingluo', pair: [159, 160], field: 'skill', skillName: 'jingluo-xue',
                refusal: '你对经络学了解不够，难以施展「一指乾坤」。\n' },
            { key: 'force', pair: [219, 220], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「一指乾坤」。\n' },
            { key: 'max-neili', pair: [2399, 2400], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「一指乾坤」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不够，难以施展「一指乾坤」。\n' },
        ],
    },
    'tie-zhang/dao': {
        skill: 'tie-zhang', ability: 'dao', abilityPath: 'dao',
        usage: 'strike', grant: 'can_perform/tie-zhang/dao',
        forceSkill: 'tianlei-shengong', kind: 'combo', weapon: null, prepared: 'strike',
        families: jueqingTiezhang, actorFamily: '铁掌帮',
        title: '铁掌掌法「五指刀」',
        fee: 250, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: ['attack', 'unarmed_damage'],
        extraSkills: { force: 260 }, forceGate: 260,
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你铁掌掌法火候不够，难以施展「五指刀」。\n' },
            { key: 'force', pair: [259, 260], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「五指刀」。\n' },
            { key: 'max-neili', pair: [2499, 2500], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「五指刀」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你现在的真气不足，难以施展「五指刀」。\n' },
        ],
    },
    'tie-zhang/juesha': {
        skill: 'tie-zhang', ability: 'juesha', abilityPath: 'juesha',
        usage: 'strike', grant: 'can_perform/tie-zhang/juesha',
        forceSkill: 'tianlei-shengong', kind: 'combo', weapon: null, prepared: 'strike',
        families: jueqingTiezhang, actorFamily: '铁掌帮',
        title: '铁掌掌法「九穹绝刹掌」',
        fee: 300, selfQi: 100, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: ['attack'],
        extraSkills: { force: 300 }, forceGate: 300,
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你的铁掌火候不够，无法使用「九穹绝刹掌」！\n' },
            { key: 'force', pair: [299, 300], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，无法使用「九穹绝刹掌」！\n' },
            { key: 'max-neili', pair: [2199, 2200], field: 'max_neili',
                refusal: '你的内力修为还不够，无法施展「九穹绝刹掌」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够！\n' },
        ],
    },
    'tie-zhang/long': {
        skill: 'tie-zhang', ability: 'long', abilityPath: 'long',
        usage: 'strike', grant: 'can_perform/tie-zhang/long',
        forceSkill: 'tianlei-shengong', kind: 'control', weapon: null, prepared: 'strike',
        families: jueqingTiezhang, actorFamily: '铁掌帮',
        title: '铁掌掌法「龙影掌」',
        dpSkills: ['parry'], feeHit: 100, feeMiss: 80, meBusy: 2,
        extraSkills: { force: 150 }, forceGate: 150,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你铁掌掌法火候不够，难以施展「龙影掌」。\n' },
            { key: 'force', pair: [149, 150], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「龙影掌」。\n' },
            { key: 'max-neili', pair: [1499, 1500], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「龙影掌」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「龙影掌」。\n' },
        ],
    },
    'tie-zhang/yin': {
        skill: 'tie-zhang', ability: 'yin', abilityPath: 'yin',
        usage: 'strike', grant: 'can_perform/tie-zhang/yin',
        forceSkill: 'tianlei-shengong', kind: 'direct', weapon: null, prepared: 'strike',
        families: jueqingTiezhang, actorFamily: '铁掌帮',
        title: '铁掌掌法「阴阳磨」', directType: 'UNARMED',
        maxDirects: 2,
        stages: [
            { dpField: 'parry', percentRange: [55, 55], damageSpan: 0 },
            { dpField: 'dodge', percentRange: [70, 70], damageSpan: 0 },
        ],
        dpSkills: ['parry', 'dodge'], fee: 400, meBusyMin: 3, meBusyMax: 5,
        extraSkills: { force: 300 }, forceGate: 300,
        gates: [
            { key: 'level', pair: [219, 220], field: 'skill',
                refusal: '你铁掌掌法火候不够，难以施展「阴阳磨」。\n' },
            { key: 'force', pair: [299, 300], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「阴阳磨」。\n' },
            { key: 'max-neili', pair: [3499, 3500], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「阴阳磨」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「阴阳磨」。\n' },
        ],
    },
    'chuanxin-zhang/zhui': {
        skill: 'chuanxin-zhang', ability: 'zhui', abilityPath: 'zhui',
        usage: 'strike', grant: 'can_perform/chuanxin-zhang/zhui',
        forceSkill: 'tianlei-shengong', kind: 'direct', weapon: null, prepared: 'strike',
        families: jueqingTiezhang, actorFamily: '绝情谷',
        title: '穿心掌「穿心锥」', directType: 'UNARMED', percent: 45,
        nonStandardHit: true, dpSkills: ['dodge'], feeHit: 150, feeMiss: 50,
        hitBusy: 2, missBusy: 3, extraSkills: { force: 150 }, forceGate: 150,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的穿心掌不够娴熟，不会使用「穿心锥」。\n' },
            { key: 'force', pair: [149, 150], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「穿心锥」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，无法使用「穿心锥」。\n' },
        ],
    },
    'feilong-zhang/fei': {
        skill: 'feilong-zhang', ability: 'fei', abilityPath: 'fei',
        usage: 'staff', grant: 'can_perform/feilong-zhang/fei',
        forceSkill: 'tianlei-shengong', kind: 'direct', weapon: 'staff', prepared: 'staff',
        families: jueqingTiezhang, actorFamily: '绝情谷',
        title: '飞龙杖法「龙飞势」', directType: 'WEAPON', percent: 55,
        dpSkills: ['dodge'], feeHit: 300, feeMiss: 200, hitBusy: 3, missBusy: 4,
        weaponDrop: true, extraSkills: { force: 240 }, forceGate: 240,
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你飞龙杖法不够娴熟，难以施展「龙飞势」。\n' },
            { key: 'force', pair: [239, 240], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「龙飞势」。\n' },
            { key: 'max-neili', pair: [2499, 2500], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「龙飞势」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「龙飞势」。\n' },
        ],
    },
    'tiexian-quan/tui': {
        skill: 'tiexian-quan', ability: 'tui', abilityPath: 'tui',
        usage: 'cuff', grant: 'can_perform/tiexian-quan/tui',
        forceSkill: 'tianlei-shengong', kind: 'direct', weapon: null, prepared: 'cuff',
        families: jueqingTiezhang, actorFamily: '绝情谷',
        title: '铁线拳法「破甲推山」', directType: 'UNARMED', percent: 40,
        dpSkills: ['parry'], feeHit: 100, feeMiss: 30, hitBusyMin: 2, hitBusyMax: 3,
        missBusyMin: 2, missBusyMax: 4, extraSkills: { force: 80 }, forceGate: 80,
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你铁线拳法不够娴熟，难以施展「破甲推山」。\n' },
            { key: 'force', pair: [79, 80], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「破甲推山」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「破甲推山」。\n' },
        ],
    },
};

export const b5Schools = schools;

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
        case 'shen': return { properties: { shen: value } };
        case 'str': return { properties: { str: value } };
        case 'dex': return { properties: { dex: value - 20 } };
        case 'effective-force': return { skills: { force: 0, [cfg.forceSkill]: value } };
        default: return { skills: { [gate.field]: value } };
    }
};

export function b5PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b5SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b5ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b5ReviewedSourceHash,
            'Reviewed B5 sources changed; re-review before sampling');
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
                [cfg.usage]: level, [cfg.skill]: level, force: 0,
                [cfg.forceSkill]: level, dodge: 200, parry: 200,
                'martial-cognize': 200, ...(cfg.extraSkills ?? {}),
            };
            for (const u of ['sword', 'unarmed', 'dodge', 'hand', 'cuff', 'strike', 'staff', 'finger'])
                if (cfg.usage === u) skills[u] = Math.max(skills[u] ?? 0, 200);
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
                skills: { force: 200, dodge: 200, parry: 200, sword: 200,
                    ...extra.targetSkills },
                mappings: {}, preparations: {},
                properties: { ...defaults, shen: 0,
                    // heal only fires on a wounded target (eff_qi/eff_jing below max).
                    ...(cfg.kind === 'heal' ? { eff_qi: 5000, eff_jing: 5000 } : {}),
                    ...extra.targetProperties },
                ...(targetEquipment ? { equipment: targetEquipment } : {}),
                ...(targetTemp ? { temp: targetTemp } : {}),
                ...(extra.targetBusy ? { busy: 2 } : {}),
            };
            if (extra.actorTemp) actor.temp = extra.actorTemp;
            if (extra.conditions) actor.conditions = extra.conditions;
            if (extra.targetConditions) target.conditions = extra.targetConditions;
            result.push({
                id: `b5-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b5', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b5-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b5SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}共享批量：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}等派perform销账，`
                        + '同一样本同时计入各派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '神威浩荡与五阴焚灭的内力碾压即倒、神威浩荡碎甲、阳关三叠三段与三中封内、'
                        + '阴阳磨寒热掌劲、龙飞势掷杖落场、九穹绝刹掌自伤气血、'
                        + '起死回生非战斗疗伤均按原分支记账。只收集数据，不比较强弱。',
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
        if (cfg.kind === 'heal') {
            add('hit', { targetProperties: { eff_qi: 5000, eff_jing: 5000 }, samples: 4 });
            add('miss', { targetProperties: { eff_qi: 5000, eff_jing: 5000 }, samples: 4 });
        } else if (cfg.dpSkills && cfg.kind !== 'combo') {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        // Special constraints: explicit boundary variants only.
        if (cfg.ability === 'dang' || cfg.ability === 'fen')
            add('instant-death', {
                targetProperties: { max_neili: 1000 }, targetSkills: { parry: 0, force: 0 },
                samples: 2 });
        if (cfg.ability === 'dang')
            add('destroy-weapon', {
                targetSkills: { parry: 0, force: 0 }, samples: 2,
                targetEquipment: { type: 'sword', hold: false } });
        if (cfg.ability === 'die')
            add('three-hits', { targetSkills: { parry: 0, dodge: 0, force: 0 },
                targetProperties: { neili: 1000 }, samples: 2 });
        if (cfg.ability === 'heal')
            add('self-target', { action: 'perform finger.heal left',
                refusal: '「起死回生」只能对别人施展。\n' });
        if (cfg.ability === 'long')
            add('target-busy', { targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧。\n' });
        if (cfg.ability === 'juesha') {
            add('wrong-force', { skills: { 'xiantian-gong': 200 },
                mappings: { force: 'xiantian-gong' },
                refusal: '你必须激发天雷神功才能施展出「九穹绝刹掌」！\n' });
            add('tiexian-mutex', {
                skills: { 'tiexian-quan': 200 },
                mappings: { cuff: 'tiexian-quan' },
                preparations: { strike: 'tie-zhang', cuff: 'tiexian-quan' },
                refusal: '施展「九穹绝刹掌」时铁掌掌法不宜和铁线拳互背！\n' });
        }
        if (cfg.weaponDrop)
            add('no-weapon', { actorEquipment: null,
                refusal: '你所使用的武器不对，难以施展「龙飞势」。\n' });
        if (cfg.kind === 'direct' && cfg.stages)
            add('one-direct', { targetSkills: { [cfg.stages[0].dpField]: 0,
                ...Object.fromEntries(cfg.stages.slice(1).map(s => [s.dpField, 100000])) }, samples: 4 });
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

function stableState(before, after, mutate, { weaponDrop = false, equipDestroy = false } = {}) {
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
        // die's add_temp("yiyang-zhi/die") + delete_temp leaves an empty map.
        if (side.temp && side.temp['yiyang-zhi'] && !Object.keys(side.temp['yiyang-zhi']).length)
            delete side.temp['yiyang-zhi'];
        if (side.weapon_details) side.weapon_details.consistence = 0;
        if (weaponDrop) {
            if (side.temp?.apply) { delete side.temp.apply.damage; delete side.temp.apply.dodge; }
            if (side.temp) delete side.temp.weapon;
            delete side.weapon; delete side.weapon_damage; delete side.weapon_flag;
            delete side.weapon_details;
        }
        // equip-destroy (dang) may break a target weapon or cloth; ignore those
        // equipment-derived fields on both sides so the comparison is stable.
        if (equipDestroy) {
            delete side.weapon; delete side.weapon_damage; delete side.weapon_flag;
            delete side.weapon_details;
            if (side.temp) {
                delete side.temp.weapon; delete side.temp.armor; delete side.temp.cloth;
                if (side.temp.apply) { delete side.temp.apply.damage; delete side.temp.apply.dodge; }
            }
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

function composeSupportStages(stages, actor, target, directType) {
    let states = [{ ...target }];
    for (const stage of stages) {
        const next = [];
        for (const mid of states) {
            const support = supportRange(stage.input, stage.percentRange, actor, mid, directType);
            for (const s of support) next.push({ ...mid, qi: s.qi, eff_qi: s.eff_qi });
        }
        states = next;
    }
    return states;
}

export function validateB5Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B5 entry');
    assert.equal(p.collection_group, 'b5-perform');
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
        // heal's whole effect is eff_qi/eff_jing recovery on the target.
        if (cfg.kind !== 'heal')
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
    if (cfg.kind === 'heal') return validateB5Heal(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct' && cfg.stages) return validateB5MultiDirect(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB5Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB5Control(raw, condition, cfg, p, b, t, a, v);
    return validateB5Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB5Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    // dang/fen instant-death: max_neili crush branch — no do_damage, no fee,
    // target disabled (die), me busy 2. Distinct from the normal direct hit.
    if (cfg.instantDeath && p.variant === 'instant-death') {
        assert.equal(directs.length, 0, 'instant-death has no direct');
        assert.deepEqual(raw.directs ?? [], []);
        assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
        assert.equal(b.neili - a.neili, 0, 'instant-death has no fee');
        assert.equal(num(a.busy), 2, 'instant-death busy');
        assert.ok(v.eff_qi <= 1 || num(v.living) === 0 || num(v.ghost) === 1, 'target disabled');
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); },
            { weaponDrop: cfg.weaponDrop, equipDestroy: cfg.equipDestroy });
        // target->die() runs the generic death path (ghost, skill/potential penalty,
        // my_killer, die_guard). Those are death side effects shared by every kill,
        // not dang/fen-specific, so only the kill outcome is asserted here.
        return { accepted: true, kind: 'direct', hit: true };
    }
    const miss = directs.length === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), miss ? 0 : 1, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    // equip-destroy (dang) deducts an extra 150 on the destroy sub-branch.
    if (cfg.equipDestroy && !miss) {
        const spent = b.neili - a.neili;
        assert.ok(spent === fee || spent === fee + 150, 'branch fee with optional equip destroy');
    } else assert.equal(b.neili - a.neili, fee, 'branch fee');
    const busyAfter = num(a.busy);
    const busyMin = miss ? (cfg.missBusyMin ?? cfg.missBusy) : (cfg.hitBusyMin ?? cfg.hitBusy);
    const busyMax = miss ? (cfg.missBusyMax ?? cfg.missBusy) : (cfg.hitBusyMax ?? cfg.hitBusy);
    assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'busy range');
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        }, { weaponDrop: cfg.weaponDrop });
        stableState(t, v);
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
    }, { weaponDrop: cfg.weaponDrop, equipDestroy: cfg.equipDestroy });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        allowDerived(e, v);
    }, { equipDestroy: cfg.equipDestroy });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB5MultiDirect(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const n = directs.length;
    assert.ok(n <= cfg.maxDirects, 'at most maxDirects do_damage');
    assert.equal(sparse(raw.metrics[0], 'direct'), n, 'direct count');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const spent = b.neili - a.neili;
    // die's optional weapon-disarm sub-branch adds 50 (fail) or 80 (success).
    if (cfg.disarm) assert.ok(spent >= cfg.fee && spent <= cfg.fee + 80, 'fee with optional disarm');
    else assert.equal(spent, cfg.fee, 'fixed fee');
    const busyAfter = num(a.busy);
    assert.ok(busyAfter >= cfg.meBusyMin && busyAfter <= cfg.meBusyMax, 'me busy');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
        assert.ok(num(d.damage) > 0, 'positive damage input');
    }
    assertLearnGain(a, p.skill);
    const opts = { equipDestroy: cfg.equipDestroy, weaponDrop: !!cfg.disarm };
    if (n === 0) {
        stableState(b, a, e => { e.neili -= spent; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); }, opts);
        stableState(t, v, null, opts);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.ok(v.qi <= t.qi && v.eff_qi <= t.eff_qi, 'target qi reduced');
    stableState(b, a, e => { e.neili -= spent; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); }, opts);
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        // yin's affect_by("tiezhang_yin"/"tiezhang_yang") applies target conditions.
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    }, opts);
    return { accepted: true, kind: 'direct', hit: true, directs: n };
}

function validateB5Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const fee = num(v.busy) > 0 ? cfg.feeHit : cfg.feeMiss;
    assert.equal(cost, fee, 'branch fee');
    assert.equal(b.neili - a.neili, fee, 'no extra deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    const hit = tBusy > 0;
    assert.equal(busyAfter, cfg.meBusy, 'me busy');
    if (hit) {
        // long: target busy = level/18 + 2.
        const level = num(sparse(b.skills, cfg.skill));
        assert.equal(tBusy, Math.trunc(level / 18) + 2, 'long target busy');
    } else assert.equal(tBusy, 0, 'no target busy on miss');
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
    stableState(t, v, e => { e.busy = v.busy; });
    return { accepted: true, kind: 'control', hit };
}

function validateB5Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    // The explicit -cfg.fee is the floor; the do_attack loop / leading do_damage
    // may spend more (jiali / force costs) depending on hit counts.
    assert.ok(fee >= cfg.fee, 'combo fee floor');
    if (cfg.selfQi) assert.equal(b.qi - a.qi, cfg.selfQi, 'self qi cost');
    assert.equal(attacks.length, cfg.comboAttacks, 'combo attack count');
    assert.ok(num(a.busy) >= cfg.comboBusyMin && num(a.busy) <= cfg.comboBusyMax,
        'combo busy range');
    for (const at of attacks) assert.ok([0, -1, -2].includes(at.result));
    if (cfg.comboDirect) {
        assert.ok(directs.length <= 1, 'at most one do_damage');
        assert.equal(sparse(raw.metrics[0], 'direct'), directs.length ? 1 : 0, 'direct');
        if (directs.length === 1) {
            assert.equal(directs[0].actor, 0); assert.equal(directs[0].target, 1);
            assert.ok(num(directs[0].damage) > 0, 'positive damage input');
            assert.ok(v.qi < t.qi, 'target qi reduced');
        }
    } else {
        assert.equal(directs.length, 0, 'combo has no directs');
        assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    }
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
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'combo', hit: attacks.some(x => x.result === 0), hits: attacks.filter(x => x.result === 0).length };
}

function validateB5Heal(raw, condition, cfg, p, b, t, a, v) {
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'heal has no direct');
    assert.equal(b.neili - a.neili, cfg.fee, 'heal fee');
    assert.equal(b.qi - a.qi, cfg.selfQi, 'self qi cost');
    assert.equal(b.jing - a.jing, cfg.selfJing, 'self jing cost');
    assert.equal(num(a.busy), cfg.meBusy, 'me busy');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cfg.fee; e.qi -= cfg.selfQi; e.jing -= cfg.selfJing;
        e.busy = a.busy; e.learned = a.learned; allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.eff_qi = v.eff_qi; e.eff_jing = v.eff_jing; e.qi = v.qi; e.jing = v.jing;
        e.busy = v.busy;
    });
    return { accepted: true, kind: 'heal', hit: true };
}

export function b5Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB5Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
