// B8 Shaolin tail/buff perform batch (15 moves). Luohan/Yecha weapon tails,
// longxing/qujing/ruying specials and the Shaolin buff family (jingang,
// jiasha, weituo-chu, yiwei). One collection settles these exclusive performs.
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

export const b8SourcePaths = [
    'kungfu/skill/luohan-gun.c', 'kungfu/skill/luohan-gun/xiangmo.c',
    'kungfu/skill/luohan-jian.c', 'kungfu/skill/luohan-jian/wuxing.c',
    'kungfu/skill/yecha-gun.c', 'kungfu/skill/yecha-gun/hongxia.c',
    'kungfu/skill/jiechen-dao.c', 'kungfu/skill/jiechen-dao/xiuluo.c',
    'kungfu/skill/leiming-bian.c', 'kungfu/skill/leiming-bian/cibei.c',
    'kungfu/skill/qingyun-bian.c', 'kungfu/skill/qingyun-bian/duan.c',
    'kungfu/skill/longxing-jian.c', 'kungfu/skill/longxing-jian/kong.c',
    'kungfu/skill/longxing-jian/xian.c',
    'kungfu/skill/qujing-gunfa.c', 'kungfu/skill/qujing-gunfa/zhen.c',
    'kungfu/skill/ruying-suixingtui.c', 'kungfu/skill/ruying-suixingtui/ruying.c',
    'kungfu/skill/jingang-buhuaiti.c', 'kungfu/skill/jingang-buhuaiti/jingang.c',
    'kungfu/skill/jiasha-fumogong.c', 'kungfu/skill/jiasha-fumogong/zhe.c',
    'kungfu/skill/weituo-chu.c', 'kungfu/skill/weituo-chu/jishi.c',
    'kungfu/skill/yiwei-dujiang.c', 'kungfu/skill/yiwei-dujiang/dujiang.c',
    'kungfu/skill/dacheng-fosuo.c', 'kungfu/skill/dacheng-fosuo/chanrao.c',
    'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/yijinjing.c',
    'kungfu/skill/luohan-fumogong.c', 'kungfu/skill/buddhism.c',
    'kungfu/skill/club.c', 'kungfu/skill/sword.c', 'kungfu/skill/blade.c',
    'kungfu/skill/whip.c', 'kungfu/skill/staff.c', 'kungfu/skill/unarmed.c',
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
export const b8ReviewedSourceHash = '72d5a51fb06b691f7a7d89444a940ffd7b48c9454e08b56d4bd4b729e0ff3bbf';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. forceSkill is the mapped special force for the actor.
const schools = {
    'luohan-gun/xiangmo': {
        skill: 'luohan-gun', ability: 'xiangmo', abilityPath: 'xiangmo',
        usage: 'club', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: 'club', prepared: 'club',
        families, actorFamily: '少林派',
        title: '十八罗汉棍「罗汉降魔」', directType: 'WEAPON', percent: 30,
        dpSkills: ['parry'], feeHit: 50, feeMiss: 50, unconditionalFee: true,
        hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的罗汉棍法不够娴熟，现在还无法使用「罗汉降魔」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不够，无法运用「罗汉降魔」。\n' },
        ],
    },
    'luohan-jian/wuxing': {
        skill: 'luohan-jian', ability: 'wuxing', abilityPath: 'wuxing',
        usage: 'sword', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '少林派',
        title: '罗汉剑法「来去若无形」', directType: 'WEAPON', percent: 80,
        dpSkills: ['parry'], feeHit: 200, feeMiss: 200, unconditionalFee: true,
        hitBusy: 3, missBusy: 3, followupAttacks: 5,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的「罗汉剑法」不够娴熟，不会使用「来去若无形」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的内力不够。\n' },
        ],
    },
    'yecha-gun/hongxia': {
        skill: 'yecha-gun', ability: 'hongxia', abilityPath: 'hongxia',
        usage: 'club', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: 'club', prepared: 'club',
        families, actorFamily: '少林派',
        title: '夜叉棍法「红霞贯日」', directType: 'WEAPON', percent: 30,
        dpSkills: ['parry'], feeHit: 200, feeMiss: 130,
        hitBusy: 1, missBusy: 3, targetBusyOnHit: 'ap30',
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的夜叉棍法等级不够，难以施展「红霞贯日」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「红霞贯日」。\n' },
        ],
    },
    'jiechen-dao/xiuluo': {
        skill: 'jiechen-dao', ability: 'xiuluo', abilityPath: 'xiuluo',
        usage: 'blade', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'combo', weapon: 'blade', prepared: 'blade',
        families, actorFamily: '少林派',
        title: '戒尘刀「修罗焰」',
        fee: 300, comboAttacks: 7, comboBusyMin: 1, comboBusyMax: 3,
        applyKeys: ['attack'],
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的戒尘刀火候还嫌不够，这「修罗焰」绝技不用也罢。\n' },
            { key: 'blade', pair: [179, 180], field: 'skill', skillName: 'blade',
                refusal: '你的基本刀法还不够娴熟，使不出「修罗焰」绝技。\n' },
            { key: 'hunyuan', pair: [139, 140], field: 'skill', skillName: 'hunyuan-yiqi',
                refusal: '你的心意气混元功等级不够，使不出「修罗焰」绝技。\n' },
            { key: 'con', pair: [33, 34], field: 'con',
                refusal: '你的身体还不够强壮，强使「修罗焰」绝技是引火自焚！\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为不够，这「修罗焰」绝技不用也罢。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '以你目前的内力来看，这「修罗焰」绝技不用也罢。\n' },
        ],
    },
    'leiming-bian/cibei': {
        skill: 'leiming-bian', ability: 'cibei', abilityPath: 'cibei',
        usage: 'whip', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'direct', weapon: 'whip', prepared: 'whip',
        families, actorFamily: '少林派',
        title: '雷鸣鞭法「慈悲字诀」', receiveOnly: true,
        dpSkills: [], fee: 300, meBusyMin: 2, meBusyMax: 3,
        followupAttacks: 6, extraSkills: { buddhism: 300 },
        expHit: true,
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的雷鸣鞭法修为太差,还不能使用慈悲字诀！\n' },
            { key: 'buddhism', pair: [149, 150], field: 'skill', skillName: 'buddhism',
                refusal: '你的禅宗心法等级不够，怎能支持慈悲字诀？ \n' },
            { key: 'shen', pair: [199999, 200000], field: 'shen',
                refusal: '慈悲字诀需以无边正气为辅,大师还是多行善事吧! \n' },
            { key: 'neili', pair: [1499, 1500], field: 'neili',
                refusal: '你的内力修为不够辅助慈悲字诀。\n' },
        ],
    },
    'qingyun-bian/duan': {
        skill: 'qingyun-bian', ability: 'duan', abilityPath: 'duan',
        usage: 'whip', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'combo', weapon: 'whip', prepared: 'whip',
        families, actorFamily: '少林派',
        title: '青云鞭法「断云决」',
        fee: 150, comboAttacks: 7, comboBusyMin: 2, comboBusyMax: 3,
        applyKeys: ['attack', 'damage'],
        gates: [
            { key: 'force', pair: [99, 100], field: 'skill', skillName: 'force',
                refusal: '你的基本内功火候未到，无法施展断云决！\n' },
            { key: 'whip', pair: [99, 100], field: 'skill', skillName: 'whip',
                refusal: '断云决需要精湛的青云鞭法方能有效施展！\n' },
            { key: 'neili', pair: [200, 201], field: 'neili',
                refusal: '你的内力不够使用断云决！\n' },
        ],
    },
    'longxing-jian/kong': {
        skill: 'longxing-jian', ability: 'kong', abilityPath: 'kong',
        usage: 'sword', grant: 'can_perform/longxing-jian/kong',
        forceSkill: 'hunyuan-yiqi', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families, actorFamily: '少林派',
        title: '龙形剑法「金龙疾空」',
        fee: 140, comboAttacks: 10, comboBusyMin: 1, comboBusyMax: 10,
        applyKeys: ['attack'],
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的龙形剑法不够娴熟，难以施展「金龙疾空」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够，难以施展「金龙疾空」。\n' },
        ],
    },
    'longxing-jian/xian': {
        skill: 'longxing-jian', ability: 'xian', abilityPath: 'xian',
        usage: 'sword', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'buff', weapon: null, prepared: null,
        families, actorFamily: '少林派',
        title: '龙形剑法「神龙再现」',
        fee: 100, meBusy: 1, buff: 'xian', stackBuff: true,
        applyKeys: ['attack', 'dodge', 'parry'],
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的龙形剑法不够娴熟，不会使用神龙再现。\n' },
            { key: 'buddhism', pair: [149, 150], field: 'skill', skillName: 'buddhism',
                refusal: '你的佛法修为不够娴熟，不会使用神龙再现。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你已经精疲力竭，内力不够了。\n' },
        ],
    },
    'qujing-gunfa/zhen': {
        skill: 'qujing-gunfa', ability: 'zhen', abilityPath: 'zhen',
        usage: 'club', grant: 'can_perform/qujing-gunfa/zhen',
        forceSkill: 'hunyuan-yiqi', kind: 'combo', weapon: 'club', prepared: 'club',
        families, actorFamily: '少林派',
        title: '取经棍法「震雷乾坤」',
        fee: 200, comboAttacks: 10, comboBusyMin: 1, comboBusyMax: 9,
        applyKeys: ['attack', 'damage'], shaolinForce: true,
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你取经棍法不够娴熟，难以施展「震雷乾坤」。\n' },
            { key: 'force', pair: [349, 350], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「震雷乾坤」。\n' },
            { key: 'max-neili', pair: [3999, 4000], field: 'max_neili',
                refusal: '你的内力修为太弱，难以施展「震雷乾坤」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气太弱，难以施展「震雷乾坤」。\n' },
        ],
    },
    'ruying-suixingtui/ruying': {
        skill: 'ruying-suixingtui', ability: 'ruying', abilityPath: 'ruying',
        usage: 'unarmed', grant: 'can_perform/ruying-suixingtui/ruying',
        forceSkill: 'hunyuan-yiqi', kind: 'combo', weapon: null, prepared: 'unarmed',
        families, actorFamily: '少林派',
        title: '如影随形腿「如影随形」',
        fee: 500, comboAttacks: 5, comboBusyMin: 2, comboBusyMax: 3,
        applyKeys: ['attack', 'damage'], extraSkills: { force: 300 },
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的如影随形腿不够娴熟，不会使用「如影随形」。\n' },
            { key: 'force', pair: [159, 160], field: 'skill', skillName: 'force',
                refusal: '你的内功等级不够，不能使用「如影随形」。\n' },
            { key: 'dex', pair: [29, 30], field: 'dex',
                refusal: '你的身法不够强，不能使用「如影随形」。\n' },
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你的内力修为太弱，不能使用「如影随形」！\n' },
            { key: 'neili', pair: [699, 700], field: 'neili',
                refusal: '你现在内力太少，不能使用「如影随形」。\n' },
        ],
    },
    'jingang-buhuaiti/jingang': {
        skill: 'jingang-buhuaiti', ability: 'jingang', abilityPath: 'jingang',
        usage: 'parry', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'buff', weapon: null, prepared: null,
        families, actorFamily: '少林派',
        title: '金刚不坏护体神功',
        fee: 200, meBusy: 2, buff: 'jingangbuhuai',
        applyKeys: ['armor', 'force'],
        gates: [
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的内力不够。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的金刚不坏护体神功修为不够。\n' },
        ],
    },
    'jiasha-fumogong/zhe': {
        skill: 'jiasha-fumogong', ability: 'zhe', abilityPath: 'zhe',
        usage: 'unarmed', grant: 'can_perform/jiasha-fumogong/zhe',
        forceSkill: 'hunyuan-yiqi', kind: 'combo', weapon: null, prepared: 'unarmed',
        families, actorFamily: '少林派',
        title: '袈裟伏魔功「避云遮日」',
        fee: 300, comboAttacks: 9, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: ['attack'], crush: true,
        gates: [
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你的内力的修为不够，现在无法使用「避云遮日」。\n' },
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的袈裟伏魔功还不够娴熟，难以施展「避云遮日」。\n' },
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的真气不够，无法运用「避云遮日」。\n' },
        ],
    },
    'weituo-chu/jishi': {
        skill: 'weituo-chu', ability: 'jishi', abilityPath: 'jishi',
        usage: 'staff', grant: 'can_perform/weituo-chu/jishi',
        forceSkill: 'hunyuan-yiqi', kind: 'buff', weapon: 'staff', prepared: 'staff',
        families, actorFamily: '少林派',
        title: '韦陀杵「即世即空」',
        fee: 300, meBusy: 1, buff: 'sl_leidong',
        applyKeys: ['attack', 'damage'], extraSkills: { buddhism: 300 },
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你韦陀杵修为还不够，还未能使用「即世即空」！\n' },
            { key: 'force', pair: [119, 120], field: 'skill', skillName: 'force',
                refusal: '你的内功修为火候未到，施展只会伤及自身！\n' },
            { key: 'max-neili', pair: [1500, 1501], field: 'max_neili',
                refusal: '你的内力修为不足，劲力不足以施展「即世即空」！\n' },
            { key: 'neili', pair: [600, 601], field: 'neili',
                refusal: '你的内力不够，劲力不足以施展「即世即空」！\n' },
        ],
    },
    'yiwei-dujiang/dujiang': {
        skill: 'yiwei-dujiang', ability: 'dujiang', abilityPath: 'dujiang',
        usage: 'dodge', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'buff', weapon: null, prepared: null,
        families, actorFamily: '少林派',
        title: '一苇渡江',
        fee: 200, meBusy: 2, buff: 'dujiang', shaolinForce: true,
        applyKeys: [],
        tempDex: true,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的一苇渡江等级不够，难以施展此项绝技！\n' },
            { key: 'dex', pair: [29, 30], field: 'dex',
                refusal: '你的身法不够使用「一苇渡江」绝技！\n' },
            { key: 'force', pair: [149, 150], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展此项绝技！\n' },
            { key: 'dodge', pair: [149, 150], field: 'skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，不会使用此项绝技！\n' },
            { key: 'max-neili', pair: [999, 1000], field: 'max_neili',
                refusal: '你的内力修为不够使用「一苇渡江」！\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你此时的内力不足！\n' },
        ],
    },
    'dacheng-fosuo/chanrao': {
        skill: 'dacheng-fosuo', ability: 'chanrao', abilityPath: 'chanrao',
        usage: 'whip', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'control', weapon: 'whip', prepared: 'whip',
        families, actorFamily: '少林派',
        title: '大乘佛索「缠绕诀」',
        dpSkills: [], fee: 200, meBusyMin: 0, meBusyMax: 1,
        controlByExp: true,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的大乘佛索还不够娴熟，不会使用缠绕诀。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的内力不够。\n' },
        ],
    },
};

export const b8Schools = schools;

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
        case 'con': return { properties: { con: value } };
        case 'dex': return { properties: { dex: value - 20 } };
        case 'effective-force': return { skills: { force: 0, [cfg.forceSkill]: value } };
        case 'effective-finger': return { skills: { finger: 0, [cfg.skill]: value } };
        case 'effective-hand': return { skills: { hand: 0, [cfg.skill]: value } };
        default: return { skills: { [gate.field]: value } };
    }
};

export function b8PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b8SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b8ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b8ReviewedSourceHash,
            'Reviewed B8 sources changed; re-review before sampling');
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
            for (const u of ['sword', 'unarmed', 'dodge', 'hand', 'cuff', 'strike', 'staff', 'finger', 'blade', 'throwing', 'parry', 'club', 'whip'])
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
                id: `b8-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b8', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b8-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b8SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}少林独有尾批：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '罗汉降魔与红霞贯日直伤、来去若无形连击、修罗焰多段、慈悲字诀直接伤血与后续连击、'
                        + '断云决与金龙疾空与震雷乾坤连击、避云遮日内力碾压、神龙再现与金刚不坏与即世即空与一苇渡江临时增益、'
                        + '缠绕诀按经验判定均按原分支记账。只收集数据，不比较强弱。',
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
            add('already-active', { actorTemp: { [cfg.buff]: cfg.stackBuff ? 50 : 1 },
                refusal: cfg.buff === 'xian'
                    ? '你已经念佛念得太久了，神龙已经厌倦了。\n'
                    : cfg.buff === 'jingangbuhuai'
                        ? '你已经运起金刚不坏护体神功了。\n'
                        : cfg.buff === 'sl_leidong'
                            ? '你刚使完「即世即空」，目前气血翻涌，无法再次运用！\n'
                            : '你已经运起「一苇渡江」了。\n' });
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
                refusal: cfg.ability === 'zhen'
                    ? '你现在没有激发少林内功为内功，难以施展「震雷乾坤」。\n'
                    : '你现在没有激发少林内功为内功，难以施展。\n' });
        if (cfg.crush)
            add('instant-death', {
                targetProperties: { max_neili: 1000 },
                targetSkills: { dodge: 0, parry: 0, force: 0 }, samples: 2 });
        if (cfg.ability === 'chanrao')
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

export function validateB8Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B8 entry');
    assert.equal(p.collection_group, 'b8-perform');
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
        // cibei followups use TYPE_RIPOSTE(1); ruying mixes TYPE_QUICK(2) and 1.
        // Correlate typed counters with the attack log instead of demanding zero.
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
    if (cfg.kind === 'buff') return validateB8Buff(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct' && cfg.receiveOnly) return validateB8Receive(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB8Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB8Control(raw, condition, cfg, p, b, t, a, v);
    return validateB8Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB8Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
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
            allowDerived(e, a);
        });
        if (cfg.followupAttacks) stableState(t, v, e => { e.busy = v.busy; e.qi = v.qi; e.eff_qi = v.eff_qi; });
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

function validateB8Receive(raw, condition, cfg, p, b, t, a, v) {
    // cibei: receive_damage/receive_wound plus followup do_attack, not do_damage.
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'receive not do_damage');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    const spent = b.neili - a.neili;
    const miss = v.qi === t.qi && v.eff_qi === t.eff_qi;
    assertLearnGain(a, p.skill);
    if (miss) {
        assert.equal(spent, 200, 'miss fee');
        stableState(b, a, e => { e.neili -= 200; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.ok(v.qi < t.qi, 'receive damage applied');
    assert.ok(v.eff_qi <= t.eff_qi, 'receive wound applied');
    // Source deducts 300 on hit; followup do_attack combat can add jiali cost.
    assert.ok(spent >= 300, 'hit fee');
    stableState(b, a, e => { e.neili -= spent; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
    // Followup do_attack can disarm the target (weapon drop) and reset weapon temp.
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        for (const k of ['weapon', 'weapon_damage', 'weapon_flag'])
            if (k in v) e[k] = v[k]; else delete e[k];
        if ('weapon_details' in v) {
            e.weapon_details = copy(v.weapon_details);
            if (e.weapon_details) e.weapon_details.consistence = 0;
        } else delete e.weapon_details;
        e.temp = copy(v.temp);
        if (e.temp) {
            delete e.temp.notify_fail;
            delete e.temp.fight;
            delete e.temp.block_msg;
            if (e.temp.apply) {
                for (const k of Object.keys(e.temp.apply))
                    if (e.temp.apply[k] === 0) delete e.temp.apply[k];
            }
        }
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'direct', hit: true };
}

function validateB8Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const hit = num(v.busy) > 0;
    assert.equal(cost, 200, 'chanrao fee');
    assert.equal(b.neili - a.neili, 200, 'fee deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    if (hit) {
        const level = num(sparse(b.skills, cfg.skill));
        assert.equal(tBusy, Math.trunc(level / 20) + 2, 'chanrao target busy');
        assert.ok(busyAfter >= 0 && busyAfter <= 1, 'me busy on hit');
    } else {
        assert.equal(tBusy, 0, 'no target busy on miss');
        assert.equal(busyAfter, 2, 'me busy on miss');
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= 200; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
    stableState(t, v, e => { e.busy = v.busy; });
    return { accepted: true, kind: 'control', hit };
}

function validateB8Buff(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'buff has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'buff fee');
    assert.equal(b.neili - a.neili, cfg.fee, 'buff fee deduction');
    assert.equal(num(a.busy ?? 0), p.fighting ? cfg.meBusy : 0);
    if (cfg.stackBuff) {
        assert.equal(temp(a, cfg.buff), temp(b, cfg.buff) + 1, 'stacking buff flag');
    } else {
        assert.equal(temp(a, cfg.buff), 1, 'buff flag set');
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    if (cfg.tempDex) {
        const skill = num(sparse(b.skills, cfg.skill));
        assert.equal(temp(a, 'dex') - temp(b, 'dex'), Math.trunc(skill / 50));
    } else if (cfg.buff === 'jingangbuhuai') {
        const force = num(sparse(b.skills, 'force'));
        assert.equal(temp(a, 'apply/armor') - temp(b, 'apply/armor'), Math.trunc(force / 2));
        assert.equal(temp(a, 'apply/force') - temp(b, 'apply/force'), Math.trunc(force / 3));
    } else if (cfg.stackBuff) {
        assert.equal(temp(a, 'apply/attack') - temp(b, 'apply/attack'), 2);
        assert.equal(temp(a, 'apply/dodge') - temp(b, 'apply/dodge'), 1);
        assert.equal(temp(a, 'apply/parry') - temp(b, 'apply/parry'), 1);
    } else if (cfg.buff === 'sl_leidong') {
        const skill = num(sparse(b.skills, cfg.skill));
        const buddhism = num(sparse(b.skills, 'buddhism'));
        assert.equal(temp(a, 'apply/damage') - temp(b, 'apply/damage'), Math.trunc((skill + buddhism) / 6));
        assert.equal(temp(a, 'apply/attack') - temp(b, 'apply/attack'), Math.trunc((skill + buddhism) / 6));
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        if (cfg.tempDex) e.temp.dex = a.temp.dex;
        e.temp[cfg.buff] = a.temp[cfg.buff];
        // jishi.c: weapon->add("rigidity", 1) when damage is not capped.
        if (cfg.buff === 'sl_leidong' && e.weapon_details && a.weapon_details)
            e.weapon_details.rigidity = a.weapon_details.rigidity;
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'buff' };
}

function validateB8Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    if (cfg.crush && p.variant === 'instant-death') {
        // zhe.c crush branch deducts 500 then the shared 300 for the 9-attack loop.
        assert.equal(fee, 800, 'crush fee');
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
    assert.ok(attacks.length >= 1 && attacks.length <= (cfg.comboAttacks ?? 10),
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

export function b8Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB8Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
