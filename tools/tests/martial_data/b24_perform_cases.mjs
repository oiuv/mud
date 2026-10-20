// B24 combo multi-hit 13 perform batch (existing combo kind).
// Shaolin 2: damo-jian sanjue, hongye-daofa kuang. Wudang 1: rouyun-jian tao.
// Murong 1: murong-sword qixing. Gumu 2: xuantie-jian xunlei, suxin-jian lian.
// Yunlong 1: wuhu-duanmendao duan. Taohua 1: xuanfeng-tui kuang.
// None 5: jinshe-zhang fugu, jinshe-jian wan, biyan-dao luo, xiyang-jian lian,
// baihua-quan cuo.
// One collection settles these pure combo performs (N x do_attack, no do_damage).
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

const shaolinFamilies = ['少林派'];
const wudangFamilies = ['武当派'];
const murongFamilies = ['慕容世家'];
const gumuFamilies = ['古墓派'];
const yunlongFamilies = ['云龙门'];
const taohuaFamilies = ['桃花岛'];
const noneFamilies = ['侠客盟'];

export const b24SourcePaths = [
    'kungfu/skill/damo-jian.c', 'kungfu/skill/damo-jian/sanjue.c',
    'kungfu/skill/hongye-daofa.c', 'kungfu/skill/hongye-daofa/kuang.c',
    'kungfu/skill/rouyun-jian.c', 'kungfu/skill/rouyun-jian/tao.c',
    'kungfu/skill/murong-sword.c', 'kungfu/skill/murong-sword/qixing.c',
    'kungfu/skill/xuantie-jian.c', 'kungfu/skill/xuantie-jian/xunlei.c',
    'kungfu/skill/suxin-jian.c', 'kungfu/skill/suxin-jian/lian.c',
    'kungfu/skill/wuhu-duanmendao.c', 'kungfu/skill/wuhu-duanmendao/duan.c',
    'kungfu/skill/xuanfeng-tui.c', 'kungfu/skill/xuanfeng-tui/kuang.c',
    'kungfu/skill/jinshe-zhang.c', 'kungfu/skill/jinshe-zhang/fugu.c',
    'kungfu/skill/jinshe-jian.c', 'kungfu/skill/jinshe-jian/wan.c',
    'kungfu/skill/biyan-dao.c', 'kungfu/skill/biyan-dao/luo.c',
    'kungfu/skill/xiyang-jian.c', 'kungfu/skill/xiyang-jian/lian.c',
    'kungfu/skill/baihua-quan.c', 'kungfu/skill/baihua-quan/cuo.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c',
    'kungfu/skill/strike.c', 'kungfu/skill/hand.c',
    'kungfu/skill/cuff.c', 'kungfu/skill/staff.c',
    'kungfu/skill/whip.c', 'kungfu/skill/hammer.c',
    'kungfu/skill/claw.c', 'kungfu/skill/finger.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/throwing.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/force.c', 'kungfu/skill/parry.c',
    'kungfu/skill/shaolin-shenfa.c',
    'kungfu/skill/club.c', 'kungfu/skill/axe.c', 'kungfu/skill/dagger.c',
    'kungfu/skill/martial-cognize.c', 'kungfu/skill/jingluo-xue.c',
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
export const b24ReviewedSourceHash = 'PENDING';

const schools = {
    // ---- Shaolin 2 ----
    'damo-jian/sanjue': {
        skill: 'damo-jian', ability: 'sanjue', abilityPath: 'sanjue',
        usage: 'sword', grant: null,
        forceSkill: 'hunyuan-yiqi', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: shaolinFamilies, actorFamily: '少林派',
        title: '达摩剑「达摩三绝剑」',
        fee: 75, comboAttacks: 3,
        meBusyMin: 1, meBusyMax: 3,
        gates: [
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
    'hongye-daofa/kuang': {
        skill: 'hongye-daofa', ability: 'kuang', abilityPath: 'kuang',
        usage: 'blade', grant: null,
        forceSkill: 'force', kind: 'combo', weapon: 'blade', prepared: null,
        families: shaolinFamilies, actorFamily: '少林派',
        title: '红叶刀法「狂风落叶」',
        fee: 300, comboAttacks: 6,
        meBusyMin: 2, meBusyMax: 3,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你目前功力还使不出「狂风落叶」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你的内力不够。\n' },
        ],
    },
    // ---- Wudang 1 ----
    'rouyun-jian/tao': {
        skill: 'rouyun-jian', ability: 'tao', abilityPath: 'tao',
        usage: 'sword', grant: 'can_perform/rouyun-jian/tao',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: wudangFamilies, actorFamily: '武当派',
        title: '柔云剑法「三环套月」',
        fee: 150, comboAttacks: 3,
        meBusyMin: 1, meBusyMax: 3,
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的柔云剑法修为不够，难以施展「三环套月」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「三环套月」。\n' },
            { key: 'dodge', pair: [179, 180], field: 'effective-dodge',
                refusal: '你的轻功修为不够，难以施展「三环套月」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「三环套月」。\n' },
        ],
    },
    // ---- Murong 1 ----
    'murong-sword/qixing': {
        skill: 'murong-sword', ability: 'qixing', abilityPath: 'qixing',
        usage: 'sword', grant: null,
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: murongFamilies, actorFamily: '慕容世家',
        title: '慕容剑法「北斗七星剑」',
        fee: 140, comboAttacks: 7,
        meBusyMin: 1, meBusyMax: 7,
        gates: [
            { key: 'neili', pair: [219, 220], field: 'neili',
                refusal: '你的真气不够，无法施展「北斗七星剑」！\n' },
            { key: 'force', pair: [149, 150], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，无法施展「北斗七星剑」！\n' },
            { key: 'sword', pair: [149, 150], field: 'effective-sword',
                refusal: '你的慕容剑法还不到家，无法使用绝技「北斗七星剑」！\n' },
        ],
    },
    // ---- Gumu 2 ----
    'xuantie-jian/xunlei': {
        skill: 'xuantie-jian', ability: 'xunlei', abilityPath: 'xunlei',
        usage: 'sword', grant: null,
        forceSkill: 'surge-force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: gumuFamilies, actorFamily: '古墓派',
        title: '玄铁剑法「迅雷击」',
        // xunlei.c charges a fixed 350; xuantie-jian.c hit_ob adds 120 per
        // successful trigger. Three do_attack calls can each trigger once, so
        // the observed net cost is 350 + 120 * {0..3} = 350..710.
        feeMin: 350, feeMax: 710, comboAttacks: 3,
        meBusy: 3, targetBusy: 1,
        extraSkills: { 'surge-force': 300 },
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的玄铁剑法还不够娴熟，使不出「迅雷击」。\n' },
            { key: 'surge-force', pair: [159, 160], field: 'skill', skillName: 'surge-force',
                refusal: '你的怒海狂涛修为不够，使不出「迅雷击」。\n' },
            { key: 'force', pair: [199, 200], field: 'skill', skillName: 'force',
                refusal: '你的内功等级不够，使不出「迅雷击」。\n' },
            { key: 'str', pair: [44, 45], field: 'str',
                refusal: '你的膂力还不够，使不出「迅雷击」。\n' },
            { key: 'dex', pair: [29, 30], field: 'dex',
                refusal: '你的身法还不够，使不出「迅雷击」。\n' },
            { key: 'max-neili', pair: [1999, 2000], field: 'max_neili',
                refusal: '你现在内力太弱，使不出「迅雷击」。\n' },
            { key: 'neili', pair: [899, 900], field: 'neili',
                refusal: '你现在真气太弱，使不出「迅雷击」。\n' },
        ],
    },
    'suxin-jian/lian': {
        skill: 'suxin-jian', ability: 'lian', abilityPath: 'lian',
        usage: 'sword', grant: 'can_perform/suxin-jian/lian',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: gumuFamilies, actorFamily: '古墓派',
        title: '玉女素心剑「连环剑术」',
        comboMin: 4, comboMax: 8,
        feePerAttack: 20,
        meBusyMin: 1, meBusyMax: 8,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你玉女素心剑不够娴熟，难以施展「连环剑术」。\n' },
            { key: 'dodge', pair: [99, 100], field: 'skill', skillName: 'dodge',
                refusal: '你的轻功修为不够，难以施展「连环剑术」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「连环剑术」。\n' },
        ],
    },
    // ---- Yunlong 1 ----
    'wuhu-duanmendao/duan': {
        skill: 'wuhu-duanmendao', ability: 'duan', abilityPath: 'duan',
        usage: 'blade', grant: 'can_perform/wuhu-duanmendao/duan',
        forceSkill: 'force', kind: 'combo', weapon: 'blade', prepared: null,
        families: yunlongFamilies, actorFamily: '云龙门',
        title: '五虎断门刀「断字诀」',
        fee: 100, comboMin: 2, comboMax: 8,
        meBusyMin: 1, meBusyMax: 3,
        gates: [
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「断字诀」。\n' },
            { key: 'level', pair: [49, 50], field: 'skill',
                refusal: '你的五虎断门刀还不到家，难以施展「断字诀」。\n' },
        ],
    },
    // ---- Taohua 1 ----
    'xuanfeng-tui/kuang': {
        skill: 'xuanfeng-tui', ability: 'kuang', abilityPath: 'kuang',
        usage: 'unarmed', grant: 'can_perform/xuanfeng-tui/kuang',
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'unarmed',
        preparedSkill: 'xuanfeng-tui', families: taohuaFamilies, actorFamily: '桃花岛',
        title: '旋风扫叶腿「狂风绝技」',
        fee: 100, comboAttacks: 6,
        meBusyMin: 1, meBusyMax: 6,
        gates: [
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，难以施展「狂风绝技」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你旋风扫叶腿不够娴熟，难以施展「狂风绝技」。\n' },
        ],
    },
    // ---- None 5 ----
    'jinshe-zhang/fugu': {
        skill: 'jinshe-zhang', ability: 'fugu', abilityPath: 'fugu',
        usage: 'strike', grant: null,
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'strike',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '金蛇游身掌「附骨缠身」',
        feeHit: 150, feeMiss: 0,
        comboAttacks: 3,
        meBusy: 2,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的金蛇掌不够娴熟，不会使用附骨缠身。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在内力太弱，不能使用附骨缠身。\n' },
        ],
    },
    'jinshe-jian/wan': {
        skill: 'jinshe-jian', ability: 'wan', abilityPath: 'wan',
        usage: 'sword', grant: 'can_perform/jinshe-jian/wan',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '金蛇剑法「蛇影万道」',
        comboMin: 4, comboMax: 9,
        feePerAttack: 30,
        meBusyMin: 1, meBusyMax: 4,
        dpSkills: ['dodge'],
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的金蛇剑法不够娴熟，难以施展「蛇影万道」。\n' },
            { key: 'neili', pair: [259, 260], field: 'neili',
                refusal: '你的真气不够，难以施展「蛇影万道」。\n' },
        ],
    },
    'biyan-dao/luo': {
        skill: 'biyan-dao', ability: 'luo', abilityPath: 'luo',
        usage: 'blade', grant: 'can_perform/biyan-dao/luo',
        forceSkill: 'force', kind: 'combo', weapon: 'blade', prepared: null,
        families: noneFamilies, actorFamily: '侠客盟',
        title: '碧烟刀法「瀑落九霄」',
        fee: 80, comboAttacks: 5,
        meBusyMin: 1, meBusyMax: 3,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你碧烟刀法不够娴熟，难以施展「瀑落九霄」。\n' },
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你内功火候不够，难以施展「瀑落九霄」。\n' },
            { key: 'neili', pair: [79, 80], field: 'neili',
                refusal: '你现在真气不够，难以施展「瀑落九霄」。\n' },
        ],
    },
    'xiyang-jian/lian': {
        skill: 'xiyang-jian', ability: 'lian', abilityPath: 'lian',
        usage: 'sword', grant: null,
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '西洋剑术「连环剑」',
        fee: 100, comboAttacks: 5,
        meBusyMin: 1, meBusyMax: 5,
        gates: [
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够，无法施展「连环剑」！\n' },
            { key: 'force', pair: [99, 100], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候不够，难以施展「连环剑」！\n' },
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的西洋剑术还不到家，无法使用连环剑！\n' },
        ],
    },
    'baihua-quan/cuo': {
        skill: 'baihua-quan', ability: 'cuo', abilityPath: 'cuo',
        usage: 'cuff', grant: null,
        forceSkill: 'force', kind: 'combo', weapon: null, prepared: 'cuff',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '百花错拳「百花错乱」',
        fee: 300, comboMin: 10, comboMax: 14,
        meBusyMin: 1, meBusyMax: 6,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的百花错拳还不够纯熟！\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，无法施展百花错乱。\n' },
        ],
    },
};

export const b24Schools = schools;

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
            case 'effective-dodge': raise(skills, 'shaolin-shenfa', high); break;
            case 'effective-skill': {
                const name = gate.skillName ?? cfg.skill;
                raise(skills, name, (high + 1) * 2);
                break;
            }
            case 'effective-sword': raise(skills, cfg.skill, high); break;
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
        case 'effective-dodge': return { skills: { dodge: 0, 'shaolin-shenfa': value + 1 } };
        case 'effective-sword': return { skills: { sword: 0, [cfg.skill]: value } };
        case 'effective-skill': {
            const name = gate.skillName ?? cfg.skill;
            if (name === 'force' && cfg.forceSkill && cfg.forceSkill !== 'force')
                return { skills: { force: 0, [cfg.forceSkill]: value } };
            return { skills: { [name]: isLow ? value * 2 : (value + 1) * 2 } };
        }
        default: return { skills: { [gate.field]: value } };
    }
};

export function b24PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b24SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b24ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b24ReviewedSourceHash,
            'Reviewed B24 sources changed; re-review before sampling');
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
            const target = {
                skills: { force: 200, dodge: 200, parry: 200, sword: 200, medical: 200,
                    ...extra.targetSkills },
                mappings: {}, preparations: {},
                properties: { ...defaults, shen: 0, ...extra.targetProperties },
                equipment: { type: 'sword', hold: false },
                ...(extra.targetBusy ? { busy: 2 } : {}),
            };
            if (extra.actorTemp) actor.temp = { ...(actor.temp ?? {}), ...extra.actorTemp };
            result.push({
                id: `b24-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b24', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b24-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b24SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}连击：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '连击按原分支记账，逐击经原普通攻击结算。'
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
        if (cfg.dpSkills && cfg.dpSkills.length) {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
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

export function validateB24Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B24 entry');
    assert.equal(p.collection_group, 'b24-perform');
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
    return validateB24Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB24Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'combo has no directs');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    if (cfg.feePerAttack !== undefined) {
        assert.equal(fee, attacks.length * cfg.feePerAttack, 'fee tracks per-attack');
    } else if (cfg.feeMin !== undefined) {
        assert.ok(fee >= cfg.feeMin && fee <= (cfg.feeMax ?? cfg.feeMin), 'combo fee range');
    } else if (cfg.feeHit !== undefined || cfg.feeMiss !== undefined) {
        const hit = attacks.some(x => x.result === 0);
        if (hit) assert.equal(fee, cfg.feeHit ?? 0, 'combo hit fee');
        else assert.equal(fee, cfg.feeMiss ?? 0, 'combo miss fee');
    } else {
        assert.equal(fee, cfg.fee, 'combo fixed fee');
    }
    if (cfg.comboAttacks !== undefined) {
        const hit = attacks.some(x => x.result === 0);
        if (cfg.feeMiss !== undefined && !hit) {
            assert.equal(attacks.length, 0, 'miss branch has no attacks');
        } else {
            assert.equal(attacks.length, cfg.comboAttacks, 'fixed combo attacks');
        }
    } else {
        assert.ok(attacks.length >= cfg.comboMin, 'combo attack lower bound');
        assert.ok(attacks.length <= cfg.comboMax, 'combo attack upper bound');
    }
    for (const at of attacks) assert.ok([0, -1, -2].includes(at.result), 'attack result tag');
    const busyAfter = num(a.busy);
    if (cfg.meBusy !== undefined) assert.equal(busyAfter, cfg.meBusy, 'fixed me busy');
    else {
        assert.ok(busyAfter >= cfg.meBusyMin, 'me busy lower bound');
        assert.ok(busyAfter <= cfg.meBusyMax, 'me busy upper bound');
    }
    if (cfg.targetBusy !== undefined)
        assert.ok(num(v.busy) >= 1, 'target busy applied');
    assertLearnGain(a, p.skill);
    const spent = b.neili - a.neili;
    stableState(b, a, e => {
        e.neili -= spent; e.busy = a.busy; e.learned = a.learned;
        e.temp = copy(a.temp ?? {});
        delete e.temp.notify_fail;
        delete e.temp.fight;
        for (const k of ['weapon', 'weapon_damage', 'weapon_flag', 'handing', 'ammunition',
            'weapon_details', 'handing_details', 'secondary_weapon', 'secondary_weapon_details'])
            if (a[k] !== undefined) e[k] = copy(a[k]);
            else delete e[k];
        if (e.weapon_details) e.weapon_details.consistence = 0;
        if (e.handing_details && Object.keys(e.handing_details).length)
            e.handing_details.consistence = 0;
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        e.temp = copy(v.temp ?? {});
        delete e.temp.notify_fail;
        delete e.temp.fight;
        for (const k of ['weapon', 'weapon_damage', 'weapon_flag', 'handing', 'ammunition',
            'weapon_details', 'handing_details', 'secondary_weapon', 'secondary_weapon_details'])
            if (v[k] !== undefined) e[k] = copy(v[k]);
            else delete e[k];
        if (e.weapon_details) e.weapon_details.consistence = 0;
        if (e.handing_details && Object.keys(e.handing_details).length)
            e.handing_details.consistence = 0;
        allowDerived(e, v);
    });
    return {
        accepted: true, kind: 'combo',
        hit: attacks.some(x => x.result === 0),
        hits: attacks.filter(x => x.result === 0).length,
    };
}

export function b24Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB24Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
