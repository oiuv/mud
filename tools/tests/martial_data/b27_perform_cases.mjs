// B27 misc pure-message / marker / leftover perform batch (15).
// Message 0 / marker-buff 2 / multi 1 / non-standard control 12.
// These are pure message, marker-setting, multi-round or non-standard-formula
// control performs not already settled in b1-b26 school batches.
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

const noneFamilies = ['侠客盟'];
const mingjiaoFamilies = ['明教'];
const murongFamilies = ['慕容世家'];
const xingxiuFamilies = ['星宿派'];
const duanFamilies = ['大理段家'];
const gumuFamilies = ['古墓派'];
const xuedaoFamilies = ['血刀门'];
const lingxiaoFamilies = ['凌霄城'];

export const b27SourcePaths = [
    'kungfu/skill/bluesea-force.c', 'kungfu/skill/bluesea-force/perform/bo.c',
    'kungfu/skill/five-avoid.c', 'kungfu/skill/five-avoid/break.c',
    'kungfu/skill/qiufeng-chenfa.c', 'kungfu/skill/qiufeng-chenfa/chan.c',
    'kungfu/skill/sougu.c', 'kungfu/skill/sougu/muyeyingyang.c',
    'kungfu/skill/canhe-zhi.c', 'kungfu/skill/canhe-zhi/zhi.c',
    'kungfu/skill/chanhun-suo.c', 'kungfu/skill/chanhun-suo/suo.c',
    'kungfu/skill/yunzhou-fufa.c', 'kungfu/skill/yunzhou-fufa/feng.c',
    'kungfu/skill/xiaoyao-jian.c', 'kungfu/skill/xiaoyao-jian/fei.c',
    'kungfu/skill/jinshe-jian.c', 'kungfu/skill/jinshe-jian/kun.c',
    'kungfu/skill/xuantie-jian.c', 'kungfu/skill/xuantie-jian/juan.c',
    'kungfu/skill/xue-dao.c', 'kungfu/skill/xue-dao/huan.c',
    'kungfu/skill/xueshan-jian.c', 'kungfu/skill/xueshan-jian/hui.c',
    'kungfu/skill/shenxing-baibian.c', 'kungfu/skill/shenxing-baibian/piao.c',
    'kungfu/skill/jinzhong-zhao.c', 'kungfu/skill/jinzhong-zhao/zhao.c',
    'kungfu/skill/yunv-jian.c', 'kungfu/skill/yunv-jian/mei.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c',
    'kungfu/skill/strike.c', 'kungfu/skill/hand.c',
    'kungfu/skill/cuff.c', 'kungfu/skill/staff.c',
    'kungfu/skill/whip.c', 'kungfu/skill/hammer.c',
    'kungfu/skill/claw.c', 'kungfu/skill/finger.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/throwing.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/force.c', 'kungfu/skill/parry.c',
    'kungfu/skill/shaolin-shenfa.c', 'kungfu/skill/martial-cognize.c',
    'kungfu/skill/club.c', 'kungfu/skill/axe.c', 'kungfu/skill/dagger.c',
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
export const b27ReviewedSourceHash = 'PENDING';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them (query_skill(x, 1)). forceSkill is the special force mapped to
// force so query_skill("force") resolves to it (effective-force gate).
const schools = {
    // ---- multi 1 ----
    'five-avoid/break': {
        skill: 'five-avoid', ability: 'break', abilityPath: 'break',
        usage: 'dodge', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'multi', weapon: null, prepared: null,
        families: noneFamilies, actorFamily: '侠客盟',
        title: '五行遁术「五遁绝杀」',
        feePerRound: 10, qiPerRound: 10, rounds: 5,
        gates: [
            { key: 'qi', pair: [69, 70], field: 'qi',
                refusal: '你的气不够，无法施展「五遁绝杀」！\n' },
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「五遁绝杀」！\n' },
        ],
    },
    // ---- marker-buff 2 ----
    'shenxing-baibian/piao': {
        skill: 'shenxing-baibian', ability: 'piao', abilityPath: 'piao',
        usage: 'dodge', grant: null,
        forceSkill: 'force', kind: 'buff', weapon: null, prepared: null,
        families: noneFamilies, actorFamily: '侠客盟',
        title: '神行百变「虚无缥缈」',
        fee: 100, marker: 'shenxing',
        applyBuffs: { dodge: 300 },
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的神行百变不够娴熟，不会使用「虚无缥缈」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，无法施展「虚无缥缈」。\n' },
        ],
    },
    'jinzhong-zhao/zhao': {
        skill: 'jinzhong-zhao', ability: 'zhao', abilityPath: 'zhao',
        usage: 'parry', grant: 'can_perform/jinzhong-zhao/zhao',
        forceSkill: 'force', kind: 'buff', weapon: null, prepared: null,
        families: noneFamilies, actorFamily: '侠客盟',
        title: '金钟罩「护体」',
        fee: 300, marker: 'jinzhongzhao',
        applyBuffs: { armor: 750, force: 375 },
        alreadyActiveRefusal: '你已经运起[金钟罩]作为护体神功了。\n',
        gates: [
            { key: 'neili', pair: [399, 400], field: 'neili',
                refusal: '你的内力不够。\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的[金钟罩]修为不够。\n' },
        ],
    },
    // ---- non-standard control 12 ----
    'bluesea-force/bo': {
        skill: 'bluesea-force', ability: 'bo', abilityPath: 'perform/bo',
        usage: 'strike', grant: null,
        forceSkill: 'bluesea-force', kind: 'control', weapon: null, prepared: null,
        families: noneFamilies, actorFamily: '侠客盟',
        title: '南海玄功「碧海清波」',
        targetBusyRefusalMark: '！',
        fee: 0, meBusyHit: 0, meBusyMiss: 1,
        hitFormula: 'ap-dp',
        apSkills: [['bluesea-force', 1.5], ['martial-cognize', 1]],
        dpSkills: [['parry', 1], ['martial-cognize', 1]],
        targetBusy: { div: 45, add: 2, useAp: true },
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的南海玄功不够深厚，不会使用碧海清波。\n' },
        ],
    },
    'qiufeng-chenfa/chan': {
        skill: 'qiufeng-chenfa', ability: 'chan', abilityPath: 'chan',
        usage: 'whip', grant: null,
        forceSkill: 'force', kind: 'control', weapon: 'whip', prepared: 'whip',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '秋风尘法「缠字诀」',
        fee: 100, meBusyHitMin: 0, meBusyHitMax: 0, meBusyMiss: 4,
        hitFormula: 'exp',
        targetBusy: { skill: 'whip', div: 28, add: 2, useEffective: true },
        gates: [
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够！\n' },
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你秋风尘法的修为不够，不能使用缠字诀！\n' },
        ],
    },
    'sougu/muyeyingyang': {
        skill: 'sougu', ability: 'muyeyingyang', abilityPath: 'muyeyingyang',
        usage: 'claw', grant: null,
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'claw',
        families: mingjiaoFamilies, actorFamily: '明教',
        title: '搜骨鹰爪功「牧野鹰扬」',
        targetBusyRefusalMark: '！',
        feeHit: 150, feeMiss: 0, meBusyHit: 0, meBusyMiss: 4,
        hitFormula: 'exp',
        targetBusy: { skill: 'sougu', div: 22, add: 1 },
        gates: [
            { key: 'str', pair: [-1, 0], field: 'str',
                refusal: '你臂力不够,不能使用牧野鹰扬！\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的搜骨鹰爪功修为不够,目前还不能使用牧野鹰扬！\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你内力现在不够, 不能使用牧野鹰扬！\n' },
        ],
    },
    'canhe-zhi/zhi': {
        skill: 'canhe-zhi', ability: 'zhi', abilityPath: 'zhi',
        usage: 'finger', grant: 'can_perform/canhe-zhi/zhi',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'finger',
        families: murongFamilies, actorFamily: '慕容世家',
        title: '参合指「七星指穴」',
        fee: 120, meBusyHit: 1, meBusyMiss: 2,
        hitFormula: 'ap23-dp',
        apSkills: [['finger', 1]],
        dpSkills: [['parry', 1]],
        useEffectiveAp: true,
        targetBusy: { div: 20, randomN: 4, useAp: true },
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的参合指修为有限，难以施展「七星指穴」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你的真气不够，难以施展「七星指穴」。\n' },
        ],
    },
    'chanhun-suo/suo': {
        skill: 'chanhun-suo', ability: 'suo', abilityPath: 'suo',
        usage: 'whip', grant: 'can_perform/chanhun-suo/suo',
        forceSkill: 'force', kind: 'control', weapon: 'whip', prepared: 'whip',
        families: xingxiuFamilies, actorFamily: '星宿派',
        title: '缠魂索「锁魂势」',
        targetBusyRefusalMark: '！',
        fee: 0, meBusyHitMin: 1, meBusyHitMax: 2, meBusyMiss: 4,
        hitFormula: 'exp',
        targetBusy: { skill: 'whip', div: 22, add: 1, useEffective: true },
        gates: [
            { key: 'level', pair: [69, 70], field: 'skill',
                refusal: '你的缠魂索功力太浅，使不了「锁魂势」。\n' },
            { key: 'force', pair: [99, 100], field: 'effective-force',
                refusal: '你的内功火候不够，使不了「锁魂势」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你内力不足，无法施展「锁魂势」。\n' },
        ],
    },
    'yunzhou-fufa/feng': {
        skill: 'yunzhou-fufa', ability: 'feng', abilityPath: 'feng',
        usage: 'whip', grant: null,
        forceSkill: 'force', kind: 'control', weapon: 'whip', prepared: 'whip',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '云帚拂法「风魔舞」',
        fee: 80, meBusyHit: 1, meBusyMiss: 1,
        hitFormula: 'exp',
        targetBusy: { skill: 'yunzhou-fufa', div: 25, add: 2, useEffective: true },
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的云帚拂法级别不够，无法施展「风魔舞」！\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，无法施展「风魔舞」！\n' },
        ],
    },
    'xiaoyao-jian/fei': {
        skill: 'xiaoyao-jian', ability: 'fei', abilityPath: 'fei',
        usage: 'sword', grant: 'can_perform/xiaoyao-jian/fei',
        forceSkill: 'force', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: mingjiaoFamilies, actorFamily: '明教',
        title: '逍遥剑法「飞剑诀」',
        fee: 120, meBusyHitMin: 0, meBusyHitMax: 1, meBusyMiss: 2,
        hitFormula: 'ap23-dp',
        apSkills: [['sword', 1]],
        dpSkills: [['dodge', 1]],
        targetBusy: { randomBase: 4, randomDiv: 25, useSkill: 'sword', useEffective: true },
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你逍遥剑法不够娴熟，难以施展「飞剑诀」。\n' },
            { key: 'dodge', pair: [149, 150], field: 'dodge',
                refusal: '你的轻功修为不够，难以施展「飞剑诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「飞剑诀」。\n' },
        ],
    },
    'jinshe-jian/kun': {
        skill: 'jinshe-jian', ability: 'kun', abilityPath: 'kun',
        usage: 'sword', grant: 'can_perform/jinshe-jian/kun',
        forceSkill: 'force', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '金蛇剑法「蛇困愁城」',
        fee: 140, meBusyHit: 1, meBusyMiss: 2,
        hitFormula: 'level2-random',
        targetBusy: { randomBase: 1, randomDiv: 13, useSkill: 'jinshe-jian' },
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你金蛇剑法不够娴熟，难以施展「蛇困愁城」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「蛇困愁城」。\n' },
        ],
    },
    'xuantie-jian/juan': {
        skill: 'xuantie-jian', ability: 'juan', abilityPath: 'juan',
        usage: 'sword', grant: 'can_perform/xuantie-jian/juan',
        forceSkill: 'hunyuan-yiqi', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: gumuFamilies, actorFamily: '古墓派',
        title: '玄铁剑法「卷字诀」',
        feeHit: 50, feeMiss: 25, meBusyHit: 0, meBusyMiss: 2,
        hitFormula: 'random-dp2',
        apSkills: [['sword', 1]],
        dpSkills: [['dodge', 1]],
        useEffectiveAp: true,
        targetBusy: { div: 20, add: 2, useAp: true },
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的玄铁剑法不够娴熟，不能使用「卷字诀」。\n' },
            { key: 'force', pair: [399, 400], field: 'effective-force',
                refusal: '你的内功火候不够，不能使用「卷字诀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在内力太弱，不能使用「卷字诀」。\n' },
        ],
    },
    'xue-dao/huan': {
        skill: 'xue-dao', ability: 'huan', abilityPath: 'huan',
        usage: 'blade', grant: null,
        forceSkill: 'force', kind: 'control', weapon: 'blade', prepared: 'blade',
        families: xuedaoFamilies, actorFamily: '血刀门',
        title: '血刀刀法「幻影」',
        targetBusyRefusalMark: '！',
        fee: 50, meBusyHit: 0, meBusyMiss: 1,
        hitFormula: 'exp',
        targetBusy: { skill: 'blade', div: 27, add: 2, useEffective: true },
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的血刀刀法不够娴熟，不会使用「幻影」。\n' },
            { key: 'neili', pair: [59, 60], field: 'neili',
                refusal: '你现在真气不够，无法使用「幻影」。\n' },
        ],
    },
    'xueshan-jian/hui': {
        skill: 'xueshan-jian', ability: 'hui', abilityPath: 'hui',
        usage: 'sword', grant: 'can_perform/xueshan-jian/hui',
        forceSkill: 'hunyuan-yiqi', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: lingxiaoFamilies, actorFamily: '凌霄城',
        title: '雪山剑法「风回雪舞」',
        fee: 30, meBusyHit: 0, meBusyMiss: 2,
        hitFormula: 'random-dp2',
        apSkills: [['xueshan-jian', 1]],
        dpSkills: [['parry', 1]],
        targetBusy: { div: 16, add: 2, useAp: true },
        gates: [
            { key: 'force', pair: [49, 50], field: 'effective-force',
                refusal: '你的内功的修为不够，难以施展「风回雪舞」。\n' },
            { key: 'level', pair: [29, 30], field: 'skill',
                refusal: '你的雪山剑法修为不够，难以施展「风回雪舞」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你的真气不够，难以施展「风回雪舞」。\n' },
        ],
    },
    'yunv-jian/mei': {
        skill: 'yunv-jian', ability: 'mei', abilityPath: 'mei',
        usage: 'sword', grant: 'can_perform/yunv-jian/mei',
        forceSkill: 'force', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: gumuFamilies, actorFamily: '古墓派',
        title: '玉女剑法「千姿百媚」',
        skipTargetBusy: true,
        fee: 50, meBusyHitMin: 0, meBusyHitMax: 1, meBusyMiss: 2,
        hitFormula: 'level2-random',
        targetBusy: { randomBase: 2, randomDiv: 24, useSkill: 'yunv-jian' },
        gates: [
            { key: 'level', pair: [39, 40], field: 'skill',
                refusal: '你玉女剑法不够娴熟，难以施展「千姿百媚」。\n' },
            { key: 'dodge', pair: [59, 60], field: 'dodge',
                refusal: '你的轻功修为不够，难以施展「千姿百媚」。\n' },
            { key: 'neili', pair: [59, 60], field: 'neili',
                refusal: '你现在的真气不够，难以施展「千姿百媚」。\n' },
        ],
    },
};

export const b27Schools = schools;

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

export function b27PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b27SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b27ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b27ReviewedSourceHash,
            'Reviewed B27 sources changed; re-review before sampling');
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
                dodge: 200, parry: 200, force: 0, 'shaolin-shenfa': 200,
                [cfg.usage]: level, [cfg.skill]: level,
                [cfg.forceSkill]: level,
                'martial-cognize': 200, poison: 200,
                ...(cfg.extraSkills ?? {}),
            };
            for (const u of ['sword', 'unarmed', 'dodge', 'hand', 'cuff', 'strike', 'staff', 'finger', 'blade', 'throwing', 'parry', 'club', 'whip', 'claw', 'dagger', 'axe', 'hammer'])
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
                id: `b27-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b27', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b27-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b27SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}杂项：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '纯消息、标记增益与非标准控制均按原分支记账。'
                        + '只收集数据，不比较强弱。',
                },
            });
        }
        const primary = cfg.gates[0];
        add(`baseline-l${level}`, { samples: smoke ? 2 : samples });
        for (const gate of cfg.gates.filter(g => g.key === primary.key)) {
            const [low, high] = gate.pair;
            add(`gate-${gate.key}-${low}`, {
                ...gateEdit(cfg, gate, low, true),
                refusal: gate.refusal, samples: 2
            });
            add(`gate-${gate.key}-${high}`, { ...gateEdit(cfg, gate, high, false), samples: 2 });
        }
        if (cfg.kind === 'control' && !cfg.skipTargetBusy) {
            const mark = cfg.targetBusyRefusalMark ?? '。';
            add('target-busy', {
                targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧' + mark + '\n',
            });
        }
        if (cfg.kind === 'buff' && cfg.marker) {
            add('already-active', {
                actorTemp: { [cfg.marker]: 1 },
                refusal: cfg.alreadyActiveRefusal
                    ?? '你已经运起「虚无缥缈」了。\n',
            });
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

export function validateB27Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B27 entry');
    assert.equal(p.collection_group, 'b27-perform');
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
    if (cfg.kind === 'buff') return validateB27Buff(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB27Multi(raw, condition, cfg, p, b, t, a, v);
    return validateB27Control(raw, condition, cfg, p, b, t, a, v);
}

function validateB27Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    const tBusy = num(v.busy), hit = tBusy > 0;
    const fee = hit ? (cfg.feeHit ?? cfg.fee) : (cfg.feeMiss ?? cfg.fee);
    assert.equal(cost, fee, 'control fee');
    assert.equal(b.neili - a.neili, fee, 'fee deduction');
    const busyAfter = num(a.busy);
    if (hit) {
        const [lo, hi] = targetBusyRange(cfg, b);
        assert.ok(tBusy >= lo && tBusy <= hi, `target busy formula ${tBusy} not in [${lo},${hi}]`);
        const loMe = cfg.meBusyHitMin ?? cfg.meBusyHit ?? 0;
        const hiMe = cfg.meBusyHitMax ?? cfg.meBusyHit ?? 0;
        assert.ok(busyAfter >= loMe && busyAfter <= hiMe, 'me busy on hit');
    } else {
        assert.equal(tBusy, 0, 'no target busy on miss');
        assert.equal(busyAfter, cfg.meBusyMiss, 'me busy on miss');
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    });
    stableState(t, v, e => { e.busy = v.busy; allowDerived(e, v); });
    return { accepted: true, kind: 'control', hit };
}

function validateB27Buff(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(cost, cfg.fee, 'buff fee');
    assert.equal(b.neili - a.neili, cfg.fee, 'fee deduction');
    assert.equal(num(v.busy), 0, 'buff no target busy');
    // marker set
    assert.ok(temp(a, cfg.marker) || a.temp?.[cfg.marker], 'marker set');
    // apply buffs: values depend on skill level; require positive delta
    const applyBefore = b.temp?.apply ?? {};
    const applyAfter = a.temp?.apply ?? {};
    for (const key of Object.keys(cfg.applyBuffs ?? {})) {
        const delta = (applyAfter[key] ?? 0) - (applyBefore[key] ?? 0);
        assert.ok(delta > 0, 'apply buff ' + key + ' increased');
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cfg.fee;
        e.learned = a.learned;
        // set only the marker and apply delta, not the whole temp
        if (!e.temp) e.temp = {};
        e.temp[cfg.marker] = a.temp?.[cfg.marker];
        const applyBefore = b.temp?.apply ?? {};
        const applyAfter = a.temp?.apply ?? {};
        e.temp.apply = { ...(e.temp.apply ?? {}) };
        for (const key of Object.keys(cfg.applyBuffs ?? {}))
            e.temp.apply[key] = applyAfter[key];
        for (const k of Object.keys(e.temp.apply))
            if (e.temp.apply[k] === 0) delete e.temp.apply[k];
        e.busy = a.busy;
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'buff', hit: true };
}

function validateB27Multi(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    const qiCost = sparse(raw.metrics[0], 'qi_cost');
    assert.ok(cost > 0 && cost % cfg.feePerRound === 0, 'multi fee per round');
    assert.ok(qiCost >= 0 && qiCost % cfg.qiPerRound === 0, 'multi qi per round');
    const rounds = cost / cfg.feePerRound;
    assert.ok(rounds >= 1 && rounds <= cfg.rounds, 'rounds in range');
    assert.equal(b.neili - a.neili, cost, 'neili deduction');
    assert.equal(b.qi - a.qi, qiCost, 'qi deduction');
    assert.equal(num(a.busy), 1, 'multi me busy');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cost; e.qi -= qiCost; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    }, {});
    // target may take damage from fight rounds; allow qi/eff_qi changes
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi;
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'multi', hit: true, rounds };
}

export function b27Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB27Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
