// B1 shared Murong x Shaolin perform batch (20 moves). One collection settles
// both families' perform coverage. Finite reviewed conditions only; no
// game-code writes and no balance claims.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';
// Kind dispatch reuses the slice1-8 do_damage support model.
import { slice2SupportSet } from './school_slice2_cases.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    combat_exp: 100000000, str: 36, int: 36, con: 36, dex: 36, shen: 200000,
    gender: '男性', character: '光明磊落' };

// MA-017: da-mo.c ask_qingxin writes can_perform/damo-jian/luan while
// ask_luan writes can_perform/damo-jian/qingxin. Recorded as-is; every grant
// below is the key the perform file itself checks.
const families = ['慕容世家', '少林派'];

export const b1SourcePaths = [
    'kungfu/skill/damo-jian.c', 'kungfu/skill/damo-jian/luan.c',
    'kungfu/skill/damo-jian/shang.c', 'kungfu/skill/damo-jian/zhe.c',
    'kungfu/skill/damo-jian/qingxin.c', 'kungfu/skill/damo-jian/sanjue.c',
    'kungfu/skill/riyue-bian.c', 'kungfu/skill/riyue-bian/shang.c',
    'kungfu/skill/riyue-bian/chan.c', 'kungfu/skill/riyue-bian/he.c',
    'kungfu/skill/banruo-zhang.c', 'kungfu/skill/banruo-zhang/feng.c',
    'kungfu/skill/cibei-dao.c', 'kungfu/skill/cibei-dao/sheshen.c',
    'kungfu/skill/fumo-jian.c', 'kungfu/skill/fumo-jian/foxin.c',
    'kungfu/skill/jingang-quan.c', 'kungfu/skill/jingang-quan/jingang.c',
    'kungfu/skill/qianye-shou.c', 'kungfu/skill/qianye-shou/qianye.c',
    'kungfu/skill/pudu-zhang.c', 'kungfu/skill/pudu-zhang/zhao.c',
    'kungfu/skill/weituo-gun.c', 'kungfu/skill/weituo-gun/fumo.c',
    'kungfu/skill/wuchang-zhang.c', 'kungfu/skill/wuchang-zhang/wuchang.c',
    'kungfu/skill/xiuluo-dao.c', 'kungfu/skill/xiuluo-dao/suoming.c',
    'kungfu/skill/yizhi-chan.c', 'kungfu/skill/yizhi-chan/jingmo.c',
    'kungfu/skill/yingzhua-gong.c', 'kungfu/skill/yingzhua-gong/chumo.c',
    'kungfu/skill/zui-gun.c', 'kungfu/skill/zui-gun/zuida.c',
    'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/yijinjing.c',
    'kungfu/skill/luohan-fumogong.c', 'kungfu/skill/shaolin-shenfa.c',
    'kungfu/skill/sword.c', 'kungfu/skill/whip.c', 'kungfu/skill/club.c',
    'kungfu/skill/blade.c', 'kungfu/skill/staff.c', 'kungfu/skill/hand.c',
    'kungfu/skill/finger.c', 'kungfu/skill/claw.c', 'kungfu/skill/cuff.c',
    'kungfu/skill/strike.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'kungfu/skill/force.c', 'kungfu/skill/martial-cognize.c',
    'kungfu/condition/damo_luanqi.c', 'kungfu/condition/damo_shangshen.c',
    'kungfu/condition/damo_zheyuan.c', 'inherit/condition/damo.c',
    'kungfu/class/shaolin/da-mo.c',
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
export const b1ReviewedSourceHash = '2b72240dcde4d13970fb89e82133526e5efcc5e927920611386ac44cca3868aa';

// Query skill gates use raw (field 'skill') or effective (field 'effective-*')
// values exactly as each perform reads them.
const schools = {
    'damo-jian/luan': {
        skill: 'damo-jian', ability: 'luan', usage: 'sword',
        grant: 'can_perform/damo-jian/luan', forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: 'sword', prepared: 'sword',
        title: '达摩剑「达摩乱气剑」', directType: 'WEAPON', percent: 70,
        dpSkills: ['force'], feeHit: 200, feeMiss: 100, hitBusy: 2, missBusy: 4,
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你达摩剑法不够娴熟，难以施展「达摩乱气剑」。\n' },
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「达摩乱气剑」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「达摩乱气剑」。\n' },
        ],
    },
    'damo-jian/shang': {
        skill: 'damo-jian', ability: 'shang', usage: 'sword',
        grant: 'can_perform/damo-jian/shang', forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: 'sword', prepared: 'sword',
        title: '达摩剑「达摩伤神剑」', directType: 'WEAPON', percent: 30,
        dpSkills: ['force'], feeHit: 200, feeMiss: 100, hitBusy: 2, missBusy: 4,
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你达摩剑法不够娴熟，难以施展「达摩伤神剑」。\n' },
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「达摩伤神剑」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「达摩伤神剑」。\n' },
        ],
    },
    'damo-jian/zhe': {
        skill: 'damo-jian', ability: 'zhe', usage: 'sword',
        grant: 'can_perform/damo-jian/zhe', forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: 'sword', prepared: 'sword',
        title: '达摩剑「达摩折元剑」', directType: 'WEAPON', percent: 50,
        dpSkills: ['force'], feeHit: 200, feeMiss: 100, hitBusy: 2, missBusy: 4,
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你达摩剑法不够娴熟，难以施展「达摩折元剑」。\n' },
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「达摩折元剑」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「达摩折元剑」。\n' },
        ],
    },
    'riyue-bian/shang': {
        skill: 'riyue-bian', ability: 'shang', usage: 'whip',
        grant: 'can_perform/riyue-bian/shang', forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: 'whip', prepared: 'whip',
        title: '日月鞭「伤字诀」', directType: 'WEAPON', percent: 100,
        dpSkills: ['force', 'parry'], feeHit: 300, feeMiss: 100, hitBusy: 1, missBusy: 3,
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的日月鞭法修为不够，目前不能使用伤字诀！\n' },
            { key: 'force', pair: [299, 300], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用这一绝技！\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的真气不够，无法使用伤字诀！\n' },
        ],
    },
    'fumo-jian/foxin': {
        skill: 'fumo-jian', ability: 'foxin', usage: 'sword',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: 'sword', prepared: 'sword',
        title: '伏魔剑「佛心剑」', directType: 'WEAPON', percent: 30,
        dpSkills: ['parry'], feeHit: 150, feeMiss: 60, hitBusy: 1, missBusy: 3,
        gates: [
            { key: 'level', pair: [134, 135], field: 'skill',
                refusal: '你的伏魔剑法修为不够，目前不能使用佛心剑！\n' },
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用这一绝技！\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够，不能使用佛心剑！\n' },
        ],
    },
    'qianye-shou/qianye': {
        skill: 'qianye-shou', ability: 'qianye', usage: 'hand',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: null, prepared: 'hand',
        title: '如来千叶手「千叶佛手」', directType: 'UNARMED', percent: 35,
        dpSkills: ['parry', 'dodge'], feeHit: 100, feeMiss: 30, hitBusy: 1, missBusy: 3,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的千叶手等级不够，不会使用「千叶佛手」！\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够，无法运用「千叶佛手」！\n' },
        ],
    },
    'pudu-zhang/zhao': {
        skill: 'pudu-zhang', ability: 'zhao', usage: 'staff',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: 'staff', prepared: 'staff',
        title: '普渡杖「佛光普照」', directType: 'WEAPON', percent: 50,
        dpSkills: ['force'], feeHit: 250, feeMiss: 60, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [134, 135], field: 'skill',
                refusal: '你的普渡杖法修为不够，目前不能使用佛光普照！\n' },
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用这一绝技！\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你的真气不够，不能使用佛光普照！\n' },
        ],
    },
    'weituo-gun/fumo': {
        skill: 'weituo-gun', ability: 'fumo', usage: 'club',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: 'club', prepared: 'club',
        title: '韦陀棍「韦陀伏魔」', directType: 'WEAPON', percent: 60,
        dpSkills: ['force'], feeHit: 300, feeMiss: 100, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的韦陀棍法修为不够，目前不能使用韦陀伏魔！\n' },
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功的修为不够，难以使用这一绝技！\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你的真气不够，不能使用韦陀伏魔！\n' },
        ],
    },
    'xiuluo-dao/suoming': {
        skill: 'xiuluo-dao', ability: 'suoming', usage: 'blade',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: 'blade', prepared: 'blade',
        title: '修罗刀「修罗索命」', directType: 'WEAPON', percent: 60,
        dpSkills: ['parry'], feeHit: 180, feeMiss: 60, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [134, 135], field: 'skill',
                refusal: '你的修罗刀法修为不够，目前不能使用修罗索命！\n' },
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用这一绝技！\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够，不能使用修罗索命！\n' },
        ],
    },
    'yizhi-chan/jingmo': {
        skill: 'yizhi-chan', ability: 'jingmo', usage: 'finger',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: null, prepared: 'finger',
        title: '一指禅「惊魔一指」', directType: 'UNARMED', percent: 50,
        dpSkills: ['dodge'], feeHit: 100, feeMiss: 60, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的一指禅还不够娴熟，现在还无法使用「惊魔一指」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「惊魔一指」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，无法运用「惊魔一指」。\n' },
        ],
    },
    'yingzhua-gong/chumo': {
        skill: 'yingzhua-gong', ability: 'chumo', usage: 'claw',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'direct', weapon: null, prepared: 'claw',
        title: '鹰爪功「荡妖除魔」', directType: 'UNARMED', percent: 45,
        dpSkills: ['parry', 'dodge'], feeHit: 200, feeMiss: 40, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [134, 135], field: 'skill',
                refusal: '你的鹰爪功等级不够，不会使用「荡妖除魔」！\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够，无法运用「荡妖除魔」！\n' },
        ],
    },
    'damo-jian/qingxin': {
        skill: 'damo-jian', ability: 'qingxin', usage: 'sword',
        grant: 'can_perform/damo-jian/qingxin', forceSkill: 'hunyuan-yiqi',
        kind: 'control', weapon: 'sword', prepared: 'sword',
        title: '达摩剑「清心剑」', dpSkills: ['force'], fee: 200, meBusy: 1,
        // Effect only fires on a powered target; baseline therefore arms powerup.
        targetTemp: { powerup: 1, 'apply/attack': 150, 'apply/defense': 90 },
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你的达摩剑法不够娴熟，不会使用「清心剑」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，无法使用「清心剑」。\n' },
        ],
    },
    'riyue-bian/chan': {
        skill: 'riyue-bian', ability: 'chan', usage: 'whip',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'control', weapon: 'whip', prepared: 'whip',
        title: '日月鞭「缠绕」诀', dpSkills: ['parry'], fee: 0, meBusy: 1,
        gates: [
            { key: 'neili', pair: [79, 80], field: 'neili',
                refusal: '你现在真气不够，无法施展「缠绕」诀！\n' },
        ],
    },
    'banruo-zhang/feng': {
        skill: 'banruo-zhang', ability: 'feng', usage: 'strike',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'buff', weapon: null, prepared: 'strike',
        title: '般若掌「封魔」', fee: 100, meBusy: 2, buff: 'brz_feng',
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的般若掌法不够娴熟，不会使用「封魔」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，无法使用「封魔」。\n' },
        ],
    },
    'cibei-dao/sheshen': {
        skill: 'cibei-dao', ability: 'sheshen', usage: 'blade',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'buff', weapon: 'blade', prepared: 'blade',
        title: '慈悲刀「舍身喂鹰」', fee: 100, meBusy: 2, buff: 'cbd_sheshen',
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的慈悲刀法不够娴熟，不会使用「舍身喂鹰」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，无法使用「舍身喂鹰」。\n' },
        ],
    },
    'jingang-quan/jingang': {
        skill: 'jingang-quan', ability: 'jingang', usage: 'cuff',
        grant: 'can_perform/jingang-quan/jingang', forceSkill: 'hunyuan-yiqi',
        kind: 'buff', weapon: null, prepared: 'cuff',
        title: '大金刚拳「大金刚神通」', fee: 150, meBusy: 0, buff: 'jingang',
        shaolinForce: true,
        gates: [
            { key: 'force', pair: [149, 150], field: 'effective-force',
                refusal: '你的内功修为不够，不能使用「大金刚神通」！\n' },
            { key: 'cuff', pair: [149, 150], field: 'effective-cuff',
                refusal: '你的拳法还不到家，无法使用「大金刚神通」！\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，无法施展「大金刚神通」！\n' },
        ],
    },
    'zui-gun/zuida': {
        skill: 'zui-gun', ability: 'zuida', usage: 'club',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'buff', weapon: 'club', prepared: 'club',
        title: '少林醉棍「八仙醉打」', fee: 150, meBusy: 2, buff: 'zg_zuida',
        shaolinForce: true, powerupMutex: true,
        gates: [
            { key: 'club', pair: [99, 100], field: 'effective-club',
                refusal: '你的棍法修为不够，不会使用「八仙醉打」！\n' },
            { key: 'force', pair: [149, 150], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「八仙醉打」！\n' },
            { key: 'str', pair: [24, 25], field: 'str',
                refusal: '你现在的臂力不够，目前不能使用「八仙醉打」！\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不足！\n' },
        ],
    },
    'damo-jian/sanjue': {
        skill: 'damo-jian', ability: 'sanjue', usage: 'sword',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'combo', weapon: 'sword', prepared: 'sword',
        title: '达摩剑「达摩三绝剑」', fee: 75, comboAttacks: 3,
        gates: [
            // query_dex() crosses the source's 30 threshold at 29/30.
            { key: 'dex', pair: [29, 30], field: 'dex',
                refusal: '你的身法不够，目前还不能使用这项绝技！\n' },
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功的修为不够，不能使用这一绝技！\n' },
            { key: 'dodge', pair: [199, 200], field: 'effective-dodge',
                refusal: '你的轻功修为不够，不能使用达摩三绝剑！\n' },
            { key: 'sword', pair: [199, 200], field: 'effective-sword',
                refusal: '你的剑法修为不够，目前不能使用达摩三绝剑！\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你的真气不够，不能使用达摩三绝剑！\n' },
        ],
    },
    'riyue-bian/he': {
        skill: 'riyue-bian', ability: 'he', usage: 'whip',
        grant: 'can_perform/riyue-bian/he', forceSkill: 'hunyuan-yiqi',
        kind: 'combo', weapon: 'whip', prepared: 'whip',
        title: '日月鞭「合」字诀', dpSkills: ['parry'], comboAttacks: 5,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的日月鞭法不够娴熟，不会使用「合」字诀。\n' },
            { key: 'neili', pair: [349, 350], field: 'neili',
                refusal: '你的真气不够，无法使用「合」字诀。\n' },
        ],
    },
    'wuchang-zhang/wuchang': {
        skill: 'wuchang-zhang', ability: 'wuchang', usage: 'staff',
        grant: null, forceSkill: 'hunyuan-yiqi',
        kind: 'combo', weapon: 'staff', prepared: 'staff',
        title: '无常杖「无常五化」', fee: 100, comboAttacks: 5,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的无常杖法还不到家，无法使用「无常五化」！\n' },
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「无常五化」！\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够，无法施展「无常五化」！\n' },
        ],
    },
};

export const b1Schools = schools;

// Every gate except the one being probed must pass, so the baseline is raised
// to each gate's high value. Otherwise an earlier gate masks the intended one
// and the refusal text no longer matches.
const gateFloor = cfg => {
    const skills = {}, properties = {};
    const raise = (bag, key, value) => { bag[key] = Math.max(bag[key] ?? 0, value); };
    for (const gate of cfg.gates) {
        const high = gate.pair[1];
        switch (gate.field) {
            case 'skill': raise(skills, cfg.skill, high); break;
            case 'neili': raise(properties, 'neili', high); break;
            case 'max_neili': raise(properties, 'max_neili', high); break;
            case 'shen': raise(properties, 'shen', high); break;
            case 'str': raise(properties, 'str', high); break;
            case 'dex': raise(properties, 'dex', high); break;
            case 'effective-force': raise(skills, cfg.forceSkill, high); break;
            case 'effective-cuff':
            case 'effective-club':
            case 'effective-sword': raise(skills, cfg.skill, high); break;
            case 'effective-dodge': raise(skills, 'shaolin-shenfa', high); break;
        }
    }
    return { skills, properties };
};

// Each gate pair is the value the source compares. The edits below map that
// value onto the one input that reproduces it: query_skill(x) = apply/x +
// raw/2 + mapped, and the test sword contributes apply/dodge -1.
const gateEdit = (cfg, gate, value) => {
    switch (gate.field) {
        case 'skill': return { skills: { [cfg.skill]: value } };
        case 'neili': return { properties: { neili: value } };
        case 'max_neili': return { properties: { max_neili: value } };
        case 'shen': return { properties: { shen: value } };
        case 'str': return { properties: { str: value } };
        // query_dex() = dex + dodge_raw/10; baseline dodge 200 contributes 20.
        case 'dex': return { properties: { dex: value - 20 } };
        case 'effective-force': return { skills: { force: 0, [cfg.forceSkill]: value } };
        case 'effective-cuff': return { skills: { cuff: 0, [cfg.skill]: value } };
        case 'effective-club': return { skills: { club: 0, [cfg.skill]: value } };
        case 'effective-sword': return { skills: { sword: 0, [cfg.skill]: value } };
        // apply/dodge -1 is subtracted from the mapped skill.
        case 'effective-dodge': return { skills: { dodge: 0, 'shaolin-shenfa': value + 1 } };
        default: return { skills: { [gate.field]: value } };
    }
};

export function b1PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b1SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b1ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b1ReviewedSourceHash,
            'Reviewed B1 sources changed; re-review before sampling');
    const result = [];
    for (const [key, cfg] of Object.entries(schools)) {
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${cfg.ability}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`);
        assert.equal(ability?.path, `kungfu/skill/${cfg.skill}/${cfg.ability}.c`);
        assert.equal(base.sha256, source_evidence[base.path]);
        assert.equal(ability.sha256, source_evidence[ability.path]);
        const performEntry = ability.entries.find(e => e.role === 'perform')?.id;
        assert.ok(performEntry?.startsWith(ability.path + ':'), key);
        const level = 200;
        const floor = gateFloor(cfg);
        function add(variant, extra = {}) {
            const skills = {
                [cfg.usage]: level, [cfg.skill]: level, force: 0,
                [cfg.forceSkill]: level, dodge: 200, parry: 200,
                'shaolin-shenfa': 200, 'martial-cognize': 200,
            };
            if (cfg.usage === 'cuff') skills.cuff = 200;
            if (cfg.usage === 'club') skills.club = 200;
            if (cfg.usage === 'sword') skills.sword = 200;
            for (const [k, v] of Object.entries(floor.skills))
                skills[k] = Math.max(skills[k] ?? 0, v);
            Object.assign(skills, extra.skills);
            for (const [k, v] of Object.entries(skills)) if (v === undefined) delete skills[k];
            const properties = {
                ...defaults, 'family/family_name': '少林派',
                ...(cfg.grant ? { [cfg.grant]: 1 } : {}),
            };
            for (const [k, v] of Object.entries(floor.properties))
                properties[k] = Math.max(properties[k] ?? 0, v);
            Object.assign(properties, extra.properties);
            const actor = {
                skills,
                mappings: { force: cfg.forceSkill, dodge: 'shaolin-shenfa', [cfg.usage]: cfg.skill,
                    ...extra.mappings },
                preparations: { [cfg.usage]: cfg.skill }, properties,
                ...(cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}),
            };
            const targetTemp = extra.targetTemp ?? cfg.targetTemp;
            const target = {
                skills: { force: level, dodge: level, parry: level, sword: 200,
                    ...extra.targetSkills },
                mappings: {}, preparations: {},
                properties: { ...defaults, shen: 0, ...extra.targetProperties },
                ...(extra.targetEquipment ? { equipment: extra.targetEquipment }
                    : { equipment: { type: 'sword', hold: false } }),
                ...(targetTemp ? { temp: targetTemp } : {}),
                ...(extra.targetBusy ? { busy: 2 } : {}),
            };
            if (extra.actorTemp) actor.temp = extra.actorTemp;
            if (extra.conditions) actor.conditions = extra.conditions;
            result.push({
                id: `b1-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b1', family: '少林派', families: [...families],
                    collection_group: 'b1-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true, target_state: 'living',
                    action: `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b1SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}共享批量：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。families为慕容世家与少林派两派perform销账，'
                        + '同一样本同时计入两派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '达摩清心/乱气的教师键互换（MA-017）按源码原样记录，实验只授予各绝招自身检查的领悟键。'
                        + '大金刚神通与八仙醉打的少林内功硬约束、清心剑的目标powerup前置与清零apply、'
                        + '八仙醉打与powerup互斥、缠绕诀零费用均按原分支记账。只收集数据，不比较强弱。',
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
        if (cfg.dpSkills) {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        // Special constraints: explicit boundary variants only.
        if (cfg.ability === 'qingxin') {
            add('no-powerup', { targetTemp: { powerup: 0, 'apply/attack': 150, 'apply/defense': 90 },
                samples: 2 });
            add('already-suppressed', { targetTemp: { powerup: 1, damo_qingxin: 1,
                'apply/attack': 150, 'apply/defense': 90 }, refusal: '对方刚刚才中过达摩清心剑，你不必再用一次了。\n' });
        }
        if (cfg.ability === 'chan')
            add('target-busy', { targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧！\n' });
        if (cfg.buff)
            add('already-active', { actorTemp: { [cfg.buff]: 1 },
                refusal: '你已经在运功中了。\n' });
        if (cfg.shaolinForce)
            add('wrong-force', { skills: { 'taiji-shengong': 200 },
                mappings: { force: 'taiji-shengong' },
                refusal: cfg.ability === 'jingang'
                    ? '你现在没有激发少林内功为内功，难以施展「大金刚神通」。\n'
                    : '你现在没有激发少林内功为内功，难以施展「八仙醉打」。\n' });
        if (cfg.powerupMutex)
            add('powerup-mutex', { actorTemp: { powerup: 1 },
                refusal: '你已经运起内功提升战力了，不能再使用「八仙醉打」。\n' });
        if (cfg.ability === 'zuida')
            for (const drunk of [9, 30]) add(`drunk-${drunk}`, { conditions: { drunk }, samples: 2 });
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

// effective_* and effective_skills are derived from skills/temp; when a buff
// moves apply/* or temp/str they legitimately re-derive.
function allowDerived(expected, actual) {
    expected.effective_skills = copy(actual.effective_skills ?? {});
    for (const key of ['effective_str', 'effective_con', 'effective_int', 'effective_dex'])
        if (Object.hasOwn(actual, key)) expected[key] = actual[key];
        else delete expected[key];
}

function stableState(before, after, mutate) {
    const expected = copy(before), actual = copy(after);
    delete expected.temp.notify_fail; delete actual.temp.notify_fail;
    for (const side of [expected, actual]) {
        if (side.temp && side.temp.fight) {
            const fight = side.temp.fight;
            for (const k of ['attack', 'dodge', 'parry'])
                assert.ok(fight[k] === null || Number.isSafeInteger(fight[k]), 'fight temp shape');
            delete side.temp.fight;
        }
        if (side.weapon_details) side.weapon_details.consistence = 0;
    }
    if (mutate) mutate(expected);
    assert.deepEqual(actual, expected, 'unexplained state mutation');
}

// perform.c improves the launched skill once. combatd's do_attack learn gains
// are guarded by "!userp(me) || !userp(victim)" and both sides are real USERs,
// so learned holds at most the launched skill with a 0/1 gain.
function assertLearnGain(after, skill) {
    const learned = after.learned ?? {};
    for (const k of Object.keys(learned)) assert.equal(k, skill, 'unexpected learned key');
    assert.ok([0, 1].includes(learned[skill] ?? 0), 'original single-use learn gain');
}

export function validateB1Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B1 entry');
    assert.equal(p.collection_group, 'b1-perform');
    assert.deepEqual(p.families, families);
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
    if (cfg.kind === 'direct') return validateB1Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB1Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'buff') return validateB1Buff(raw, condition, cfg, p, b, t, a, v);
    return validateB1Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB1Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const miss = directs.length === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), miss ? 0 : 1, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    assert.equal(b.neili - a.neili, fee, 'branch fee');
    const busyAfter = num(a.busy);
    assert.equal(busyAfter, miss ? cfg.missBusy : cfg.hitBusy, 'busy');
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
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
    stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
    // final() adds only the condition belonging to this move, with a bounded
    // level and level*duration remaining amount (inherit/condition/damo.c).
    let expectedB1Conditions = copy(t.conditions);
    const conditionNames = {
        luan: ['damo_luanqi', '乱气之扰'],
        shang: ['damo_shangshen', '伤神之扰'],
        zhe: ['damo_zheyuan', '折元之扰'],
    };
    if (p.skill === 'damo-jian') {
        const [key, name] = conditionNames[p.ability];
        const cnd = v.conditions?.[key];
        assert.ok(cnd, 'damo final condition required');
        const lvl = b.skills['damo-jian'];
        assert.ok(Number.isSafeInteger(cnd.level) && cnd.level >= lvl && cnd.level < 2 * lvl,
            'damo condition level support');
        assert.equal(cnd.id, b.id, 'damo condition owner');
        assert.equal(cnd.name, name);
        assert.ok(!t.conditions?.[key], 'B1 fixture starts without the damo condition');
        const duration = cnd.remain / cnd.level;
        assert.ok(Number.isSafeInteger(duration) && duration >= 5
            && duration <= 5 + Math.max(0, Math.trunc(lvl / 20) - 1), 'damo duration support');
        assert.deepEqual(Object.keys(cnd).sort(), ['id', 'level', 'name', 'remain']);
        expectedB1Conditions = { ...t.conditions, [key]: cnd };
    }
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili; e.conditions = expectedB1Conditions;
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB1Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    if (cfg.ability === 'chan') {
        assert.equal(cost, 0, '缠绕诀零费用');
        assert.equal(b.neili, a.neili, 'no neili deduction');
        const busyAfter = num(a.busy), tBusy = num(v.busy);
        const hit = busyAfter === 1;
        assert.ok([1, 2].includes(busyAfter), 'me busy 1 hit / 2 miss');
        assert.equal(tBusy, hit ? Math.trunc(num(sparse(b.skills, 'riyue-bian')) / 20) + 2 : 0);
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.busy = a.busy; e.learned = a.learned; });
        stableState(t, v, e => { e.busy = v.busy; });
        return { accepted: true, kind: 'control', hit };
    }
    assert.equal(cost, cfg.fee, '清心剑固定扣费');
    assert.equal(num(a.busy), cfg.meBusy);
    const suppressed = Boolean(v.temp.damo_qingxin);
    const powered = Boolean(t.temp.powerup);
    assert.equal(Boolean(a.temp.damo_qingxin), false);
    if (!powered) {
        assert.ok(!suppressed, 'no powerup means no suppression');
        for (const key of ['attack', 'defense'])
            assert.equal(temp(v, 'apply/' + key), temp(t, 'apply/' + key));
    } else if (suppressed) {
        for (const key of ['attack', 'defense'])
            assert.equal(temp(v, 'apply/' + key), 0, '清零 apply/' + key);
    } else {
        for (const key of ['attack', 'defense'])
            assert.equal(temp(v, 'apply/' + key), temp(t, 'apply/' + key));
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; });
    stableState(t, v, e => {
        for (const key of ['attack', 'defense']) e.temp.apply[key] = v.temp.apply[key];
        if (suppressed) e.temp.damo_qingxin = 1;
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'control', hit: suppressed };
}

function validateB1Buff(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'buff has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'buff fee');
    assert.equal(num(a.busy ?? 0), p.fighting ? cfg.meBusy : 0);
    assert.equal(temp(a, cfg.buff), 1, 'buff flag set');
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    if (cfg.ability === 'feng') {
        assert.equal(temp(a, 'apply/attack') - temp(b, 'apply/attack'), -Math.trunc(num(sparse(b.skills, cfg.skill)) / 4));
        assert.equal(temp(a, 'apply/dodge') - temp(b, 'apply/dodge'), Math.trunc(num(sparse(b.skills, cfg.skill)) / 3));
    } else if (cfg.ability === 'sheshen') {
        assert.equal(temp(a, 'apply/attack') - temp(b, 'apply/attack'), Math.trunc(num(sparse(b.skills, cfg.skill)) / 3));
        assert.equal(temp(a, 'apply/dodge') - temp(b, 'apply/dodge'), -Math.trunc(num(sparse(b.skills, cfg.skill)) / 5));
    } else if (cfg.ability === 'jingang') {
        const skill = Math.trunc(num(sparse(b.skills, cfg.skill)) / 3);
        const count = Math.trunc(skill / 2);
        assert.equal(temp(a, 'str') - temp(b, 'str'), count * 2);
        assert.equal(temp(a, 'dex') - temp(b, 'dex'), -Math.trunc(num(b.effective_dex) / 10));
    } else if (cfg.ability === 'zuida') {
        for (const key of ['str', 'dex']) {
            const delta = temp(a, key) - temp(b, key);
            assert.equal(delta % num(b[key]), 0);
            assert.ok(delta >= 0 && delta / num(b[key]) < Math.trunc((b.conditions?.drunk ?? 0) / 3) + 2,
                'gain bounded by drunk tier');
        }
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        e.temp[cfg.buff] = 1;
        if (cfg.ability === 'jingang' || cfg.ability === 'zuida') {
            e.temp.str = a.temp.str; e.temp.dex = a.temp.dex;
        }
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'buff' };
}

function validateB1Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'combo has no directs');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    if (cfg.ability === 'sanjue') {
        assert.equal(attacks.length, 3, 'three fixed attacks');
        assert.ok(attacks.every(x => x.type === 0));
        assert.equal(b.neili - a.neili, cfg.fee);
        assert.ok([1, 2, 3].includes(num(a.busy)), 'busy 1+random(3)');
    } else if (cfg.ability === 'wuchang') {
        assert.equal(attacks.length, 5, 'five fixed attacks');
        assert.equal(b.neili - a.neili, cfg.fee);
        assert.ok([1, 2, 3, 4, 5].includes(num(a.busy)), 'busy 1+random(5)');
    } else {
        // he: 5-10 attacks; fee = attack_time*20 and the loop may stop early
        // when the fight ends, so the fee may exceed attacks.length*20.
        const fee = b.neili - a.neili;
        assert.ok(attacks.length >= 1 && attacks.length <= 10, 'he attack window');
        assert.equal(fee % 20, 0, 'he fee tracks 20 per planned attack');
        assert.ok(fee / 20 >= attacks.length && fee / 20 >= 5 && fee / 20 <= 10,
            'he planned attack count bounds the fee');
        assert.ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(num(a.busy)));
    }
    for (const at of attacks) assert.ok([0, -1, -2].includes(at.result));
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili = a.neili; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        allowDerived(e, a);
    });
    stableState(t, v, e => { e.qi = v.qi; e.eff_qi = v.eff_qi; e.busy = v.busy; });
    return { accepted: true, kind: 'combo', hit: attacks.some(x => x.result === 0), hits: attacks.filter(x => x.result === 0).length };
}

export function b1Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB1Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
