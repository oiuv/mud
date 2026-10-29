// B22 Lingxiao 2 + Taohua-exclusive 2 + Lingjiu/Xiaoyao tail 3 + none 3 perform batch (10 moves).
// Lingxiao: lingxiao-quan san, hanmei-jian leng.
// Taohua: yinlong-bian zhu, cuixin-zhang cui.
// Lingjiu/Xiaoyao tail: caiyan-gong huan, liuyue-jian sheng, zhemei-shou hua.
// none: dugu-jiujian jue/po/qi.
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

const lingxiaoFamilies = ['凌霄城'];
const taohuaFamilies = ['桃花岛'];
const lingjiuFamilies = ['灵鹫宫'];
const xiaoyaoFamilies = ['逍遥派'];
const noneFamilies = ['侠客盟'];

export const b22SourcePaths = [
    'kungfu/skill/lingxiao-quan.c', 'kungfu/skill/lingxiao-quan/san.c',
    'kungfu/skill/hanmei-jian.c', 'kungfu/skill/hanmei-jian/leng.c',
    'kungfu/skill/yinlong-bian.c', 'kungfu/skill/yinlong-bian/zhu.c',
    'kungfu/skill/cuixin-zhang.c', 'kungfu/skill/cuixin-zhang/cui.c',
    'kungfu/skill/caiyan-gong.c', 'kungfu/skill/caiyan-gong/huan.c',
    'kungfu/skill/liuyue-jian.c', 'kungfu/skill/liuyue-jian/sheng.c',
    'kungfu/skill/zhemei-shou.c', 'kungfu/skill/zhemei-shou/hua.c',
    'kungfu/skill/dugu-jiujian.c', 'kungfu/skill/dugu-jiujian/jue.c',
    'kungfu/skill/dugu-jiujian/po.c', 'kungfu/skill/dugu-jiujian/qi.c',
    'kungfu/skill/lonely-sword.c', 'kungfu/skill/lonely-sword/jue.c',
    'kungfu/skill/beiming-shengong.c', 'kungfu/skill/xiaowuxiang.c',
    'kungfu/skill/bingxin-jue.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c',
    'kungfu/skill/strike.c', 'kungfu/skill/hand.c',
    'kungfu/skill/cuff.c', 'kungfu/skill/staff.c',
    'kungfu/skill/whip.c', 'kungfu/skill/hammer.c',
    'kungfu/skill/claw.c', 'kungfu/skill/finger.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/throwing.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/force.c', 'kungfu/skill/parry.c',
    'kungfu/skill/club.c', 'kungfu/skill/martial-cognize.c',
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
export const b22ReviewedSourceHash = 'PENDING';

const schools = {
    // ---- Lingxiao 2 ----
    'lingxiao-quan/san': {
        skill: 'lingxiao-quan', ability: 'san', abilityPath: 'san',
        usage: 'cuff', grant: 'can_perform/lingxiao-quan/san',
        forceSkill: 'force', kind: 'multi', weapon: null, prepared: 'cuff',
        families: lingxiaoFamilies, actorFamily: '凌霄城',
        title: '神倒鬼跌三连环',
        fee: 200,
        multiDirects: 3,
        percentRanges: [[20, 20], [25, 25], [30, 30]],
        hitBusyMin: 2, hitBusyMax: 4,
        dpSkills: ['parry', 'dodge', 'force'],
        gates: [
            { key: 'force', pair: [249, 250], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「神倒鬼跌三连环」。\n' },
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的凌霄拳法不够娴熟，难以施展「神倒鬼跌三连环」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，难以施展「神倒鬼跌三连环」。\n' },
        ],
    },
    'hanmei-jian/leng': {
        skill: 'hanmei-jian', ability: 'leng', abilityPath: 'leng',
        usage: 'sword', grant: 'can_perform/hanmei-jian/leng',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: lingxiaoFamilies, actorFamily: '凌霄城',
        title: '冷剑决',
        feeHit: 30, feeMiss: 10,
        hitBusy: 2, missBusy: 3,
        percent: 20, directType: 'WEAPON',
        dpSkills: ['force'],
        gates: [
            { key: 'force', pair: [49, 50], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「冷剑决」。\n' },
            { key: 'level', pair: [39, 40], field: 'skill',
                refusal: '你的寒梅剑法修为不够，难以施展「冷剑决」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你的真气不够，难以施展「冷剑决」。\n' },
        ],
    },
    // ---- Taohua exclusive 2 ----
    'yinlong-bian/zhu': {
        skill: 'yinlong-bian', ability: 'zhu', abilityPath: 'zhu',
        usage: 'whip', grant: 'can_perform/yinlong-bian/zhu',
        forceSkill: 'force', kind: 'direct', weapon: 'whip', prepared: null,
        families: taohuaFamilies, actorFamily: '桃花岛',
        title: '天诛龙蛟诀',
        feeHit: 200, feeMiss: 100,
        hitBusy: 2, missBusy: 3,
        percent: 85, directType: 'WEAPON',
        dpSkills: ['force'],
        gates: [
            { key: 'force', pair: [129, 130], field: 'skill', skillName: 'force',
                refusal: '你的内功火候不够，使不了「天诛龙蛟诀」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的银龙鞭法功力太浅，使不了「天诛龙蛟诀」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，无法使用「天诛龙蛟诀」。\n' },
        ],
    },
    'cuixin-zhang/cui': {
        skill: 'cuixin-zhang', ability: 'cui', abilityPath: 'cui',
        usage: 'strike', grant: 'can_perform/cuixin-zhang/cui',
        forceSkill: 'force', kind: 'special', specialBusy: 'cui',
        weapon: null, prepared: 'strike',
        families: taohuaFamilies, actorFamily: '桃花岛',
        title: '夺命催心',
        feeHit: 260, feeMiss: 120,
        hitBusy: 2, missBusy: 3,
        percent: 40, percentMax: 55, directType: 'REMOTE',
        dpSkills: ['parry'],
        targetCuixinRefusal: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的催心掌还不够纯熟，无法施展「夺命催心」\n' },
            { key: 'force', pair: [119, 120], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功火候太低，无法使出「夺命催心」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的内力不够，无法使出「夺命催心」。\n' },
        ],
    },
    // ---- Lingjiu/Xiaoyao tail 3 ----
    'caiyan-gong/huan': {
        skill: 'caiyan-gong', ability: 'huan', abilityPath: 'huan',
        usage: 'club', grant: 'can_perform/caiyan-gong/huan',
        forceSkill: 'force', kind: 'direct', weapon: 'club', prepared: null,
        families: lingjiuFamilies, actorFamily: '灵鹫宫',
        title: '云霞幻生',
        feeHit: 80, feeMiss: 50,
        hitBusy: 2, missBusy: 3,
        percent: 45, directType: 'WEAPON',
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你采燕功等级不够，难以施展「云霞幻生」。\n' },
            { key: 'dodge', pair: [179, 180], field: 'effective-skill', skillName: 'dodge',
                refusal: '你的轻功火候不够，难以施展「云霞幻生」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「云霞幻生」。\n' },
        ],
    },
    'liuyue-jian/sheng': {
        skill: 'liuyue-jian', ability: 'sheng', abilityPath: 'sheng',
        usage: 'sword', grant: 'can_perform/liuyue-jian/sheng',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: xiaoyaoFamilies, actorFamily: '逍遥派',
        title: '天升剑诀',
        fee: 100, comboAttacks: 6, comboAttacksMin: 1, comboBusyMin: 1, comboBusyMax: 6,
        applyKeys: [],
        gates: [
            { key: 'force', pair: [199, 200], field: 'effective-skill', skillName: 'force',
                refusal: '你的内功的修为不够，难以施展「天升剑诀」。\n' },
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的流月剑舞修为不够，难以施展「天升剑诀」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，难以施展「天升剑诀」。\n' },
        ],
    },
    'zhemei-shou/hua': {
        skill: 'zhemei-shou', ability: 'hua', abilityPath: 'hua',
        usage: 'hand', grant: 'can_perform/zhemei-shou/hua',
        forceSkill: 'beiming-shengong', kind: 'special', specialBusy: 'hua',
        weapon: null, prepared: 'hand',
        families: xiaoyaoFamilies, actorFamily: '逍遥派',
        title: '化妖功',
        feeHit: 360, feeMiss: 200,
        hitBusy: 2, missBusy: 3, instantBusy: 1,
        percent: 100, directType: 'REMOTE',
        extraSkills: { 'beiming-shengong': 300 },
        extraMappings: { force: 'beiming-shengong' },
        dpSkills: [],
        targetInstantDeath: true,
        gates: [
            { key: 'force', pair: [219, 220], field: 'skill', skillName: 'beiming-shengong',
                refusal: '你的逍遥内功火候不够，难以施展「化妖功」。\n' },
            { key: 'level', pair: [219, 220], field: 'skill',
                refusal: '你逍遥折梅手等级不够，难以施展「化妖功」。\n' },
            { key: 'max-neili', pair: [3999, 4000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「化妖功」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你现在真气不足，难以施展「化妖功」。\n' },
        ],
    },
    // ---- none 3 ----
    'dugu-jiujian/jue': {
        skill: 'dugu-jiujian', ability: 'jue', abilityPath: 'jue',
        usage: 'sword', grant: null,
        forceSkill: 'bingxin-jue', kind: 'practice', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '总诀式',
        nonCombat: true,
        feeMin: 50, feeMax: 79, meBusyMax: 2,
        extraSkills: { 'bingxin-jue': 300, sword: 300 },
        extraMappings: { force: 'bingxin-jue', sword: 'dugu-jiujian', parry: 'dugu-jiujian' },
        noNothingGate: true,
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你所使用的外功中没有这种功能。\n' },
            { key: 'neili', pair: [84, 85], field: 'neili',
                refusal: '你现在真气不足，难以演练「总诀式」。\n' },
        ],
    },
    'lonely-sword/jue': {
        skill: 'lonely-sword', ability: 'jue', abilityPath: 'jue',
        usage: 'sword', grant: null,
        forceSkill: 'bingxin-jue', kind: 'practice', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '总诀式',
        nonCombat: true,
        feeMin: 30, feeMax: 79, meBusyMax: 2,
        extraSkills: { 'bingxin-jue': 300, sword: 300 },
        extraMappings: { force: 'bingxin-jue', sword: 'lonely-sword', parry: 'lonely-sword' },
        noNothingGate: true,
        gates: [
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你的内力不够，没有力气演练「总诀式」！\n' },
        ],
    },
    'dugu-jiujian/po': {
        skill: 'dugu-jiujian', ability: 'po', abilityPath: 'po',
        usage: 'sword', grant: 'can_perform/dugu/po', grantValue: 100,
        forceSkill: 'bingxin-jue', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '总破式',
        fee: 0, comboAttacks: 13, comboAttacksMin: 0, comboBusyMin: 1, comboBusyMax: 13,
        applyKeys: [],
        extraSkills: { 'bingxin-jue': 300, sword: 300 },
        extraMappings: { force: 'bingxin-jue', sword: 'dugu-jiujian', parry: 'dugu-jiujian' },
        noNothingGate: true,
        disarmPossible: true,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的独孤九剑等级不够，无法施展「总破式」。\n' },
        ],
    },
    'dugu-jiujian/qi': {
        skill: 'dugu-jiujian', ability: 'qi', abilityPath: 'qi',
        usage: 'sword', grant: 'can_perform/dugu/qi', grantValue: 100,
        forceSkill: 'bingxin-jue', kind: 'special', specialBusy: 'qi',
        weapon: 'sword', prepared: 'sword',
        families: noneFamilies, actorFamily: '侠客盟',
        title: '破气式',
        feeHit: 0, feeMiss: 0, unconditionalFee: true,
        hitBusy: 3, missBusy: 4,
        percent: 85, directType: 'WEAPON',
        extraSkills: { 'bingxin-jue': 300, sword: 300 },
        extraMappings: { force: 'bingxin-jue', sword: 'dugu-jiujian', parry: 'dugu-jiujian' },
        noNothingGate: true,
        dpSkills: ['force'],
        targetNoExertRefusal: true,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你独孤九剑等级不够，无法施展「破气式」。\n' },
        ],
    },
};

export const b22Schools = schools;

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

export function b22PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b22SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b22ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b22ReviewedSourceHash,
            'Reviewed B22 sources changed; re-review before sampling');
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
                preparations: extra.preparations ?? (cfg.prepared
                    ? { [cfg.prepared]: cfg.preparedSkill ?? cfg.skill } : {}),
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
                id: `b22-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b22', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b22-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b22SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}独有：原公开命令、`
                        + '单备、加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + (cfg.kind === 'practice'
                            ? '演练分支按原逻辑记账，不冒充战斗绝招。'
                            : cfg.kind === 'special'
                                ? '特殊分支按原逻辑记账。'
                                : cfg.kind === 'multi'
                                    ? '多段直伤按原分支记账。'
                                    : '目标忙乱与直伤与连击均按原分支记账。')
                        + '只收集数据，不比较强弱。',
                },
            });
        }
        const primary = cfg.gates[0];
        add(`baseline-l${level}`, {
            ...(cfg.kind === 'special' && cfg.specialBusy === 'cui' ? {} : {}),
            samples: smoke ? 2 : samples });
        for (const gate of cfg.gates.filter(g => g.key === primary.key)) {
            const [low, high] = gate.pair;
            add(`gate-${gate.key}-${low}`, { ...gateEdit(cfg, gate, low, true),
                refusal: gate.refusal, samples: 2 });
            add(`gate-${gate.key}-${high}`, { ...gateEdit(cfg, gate, high, false), samples: 2 });
        }
        if (cfg.kind === 'practice') {
            add('self-practice', {
                action: `perform ${cfg.usage}.${cfg.ability} left`,
                samples: smoke ? 2 : 4,
            });
        } else if (cfg.expHitCheck) {
            add('hit', { targetProperties: { combat_exp: 1 }, samples: 4 });
            add('miss', { targetProperties: { combat_exp: 100000000000 }, samples: 4 });
        } else if (cfg.dpSkills && cfg.dpSkills.length && cfg.kind !== 'combo'
            && cfg.kind !== 'buff') {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        } else if (cfg.kind === 'special' && cfg.dpSkills && cfg.dpSkills.length) {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        if (cfg.targetCuixinRefusal)
            add('target-cuixin', {
                actorTemp: {},
                targetTemp: { cuixin: 1 },
                refusal: '对方已经招架涣散，放胆攻击吧。\n',
            });
        if (cfg.targetNoExertRefusal)
            add('target-no-exert', {
                targetTemp: { no_exert: 1 },
                refusal: '对方现在已经无法控制真气，放胆攻击吧。\n',
            });
        if (cfg.targetInstantDeath) {
            add('instant-death', {
                targetProperties: { max_neili: 2000 },
                samples: smoke ? 2 : 4,
            });
        }
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

export function validateB22Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B22 entry');
    assert.equal(p.collection_group, 'b22-perform');
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
    if (cfg.kind === 'practice') return validateB22Practice(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'special') return validateB22Special(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB22Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB22Multi(raw, condition, cfg, p, b, t, a, v);
    return validateB22Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB22Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const miss = directs.length === 0 && sparse(raw.metrics[0], 'direct') === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    const directCount = sparse(raw.metrics[0], 'direct');
    assert.ok(directCount >= 0, 'direct count');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const paid = b.neili - a.neili;
    let fee;
    if (cfg.unconditionalFee) fee = cfg.feeHit ?? 0;
    else if (miss) fee = (cfg.feeAlways ?? 0) + (cfg.feeMiss ?? 0);
    else fee = (cfg.feeAlways ?? 0) + (cfg.feeHit ?? 0);
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
        }, { consumeThrowing: Boolean(cfg.handing) });
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
        allowDerived(e, a);
    }, { consumeThrowing: Boolean(cfg.handing) });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB22Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    if (cfg.feeMin !== undefined)
        assert.ok(fee >= cfg.feeMin && fee <= (cfg.feeMax ?? cfg.feeMin), 'combo fee range');
    else assert.ok(fee >= (cfg.fee ?? 0), 'combo fee floor');
    const maxAttacks = cfg.comboAttacksMax ?? cfg.comboAttacks ?? 13;
    const minAttacks = cfg.comboAttacksMin ?? 1;
    assert.ok(attacks.length >= minAttacks && attacks.length <= maxAttacks, 'combo attack count');
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
    // 总破式可缴械目标：dropped 记录目标武器脱手，目标武器相关状态随实际同步。
    const disarmed = Boolean(cfg.disarmPossible) && (raw.dropped ?? []).length > 0;
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
        if (disarmed) {
            for (const k of ['weapon', 'weapon_damage', 'weapon_flag', 'handing', 'ammunition',
                'weapon_details', 'handing_details', 'secondary_weapon'])
                if (v[k] !== undefined) e[k] = copy(v[k]);
                else delete e[k];
            if (e.weapon_details) e.weapon_details.consistence = 0;
            if (e.handing_details && Object.keys(e.handing_details).length)
                e.handing_details.consistence = 0;
            if (v.temp) {
                e.temp = copy(v.temp);
                delete e.temp.notify_fail;
            }
        }
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'combo', hit: attacks.some(x => x.result === 0), hits: attacks.filter(x => x.result === 0).length };
}

function validateB22Multi(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= cfg.multiDirects, 'multi direct bound');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
    }
    const fee = b.neili - a.neili;
    if (cfg.feeMin !== undefined)
        assert.ok(fee >= cfg.feeMin && fee <= (cfg.feeMax ?? cfg.feeMin), 'multi fee range');
    else assert.ok(fee >= cfg.fee && fee <= (cfg.feeMax ?? cfg.fee), 'multi fee range');
    assert.ok(sparse(raw.metrics[0], 'direct') >= 0, 'direct count');
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

function validateB22Practice(raw, condition, cfg, p, b, t, a, v) {
    // Non-combat practice: skill/xp improve, jing/neili cost, no target change.
    const fee = b.neili - a.neili;
    if (cfg.feeMin !== undefined)
        assert.ok(fee >= cfg.feeMin && fee <= (cfg.feeMax ?? cfg.feeMin), 'practice neili fee range');
    else assert.equal(fee, cfg.fee, 'practice neili fee');
    assert.ok(num(a.busy) >= 0 && num(a.busy) <= (cfg.meBusyMax ?? 2), 'practice busy');
    const learned = a.learned ?? {};
    for (const k of Object.keys(learned))
        assert.ok([p.skill, 'sword'].includes(k), 'practice learns skill and sword');
    assert.ok(num(learned[p.skill]) >= 0, 'practice learn gain non-negative');
    stableState(b, a, e => {
        e.neili -= fee; e.jing = a.jing; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'practice', hit: true };
}

function validateB22Special(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const fee = b.neili - a.neili;
    if (cfg.specialBusy === 'qi') {
        // Direct + no_exert final: hit applies do_damage then sets no_exert on target.
        const hit = directs.length === 1 || num(v.qi) !== num(t.qi);
        const expectedFee = hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        assert.equal(fee, expectedFee, 'qi fee');
        const busyAfter = num(a.busy);
        const busyMin = hit ? (cfg.hitBusyMin ?? cfg.hitBusy ?? 0) : (cfg.missBusyMin ?? cfg.missBusy ?? 0);
        const busyMax = hit ? (cfg.hitBusyMax ?? cfg.hitBusy ?? 0) : (cfg.missBusyMax ?? cfg.missBusy ?? 0);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'qi busy');
        assertLearnGain(a, p.skill);
        if (directs.length === 1) {
            const input = num(directs[0].damage);
            const support = supportRange(input, cfg.percent, b, t, cfg.directType);
            assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
                'qi direct must match do_damage support');
        }
        if (hit) assert.equal(temp(v, 'no_exert'), 1, 'no_exert set on hit');
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili;
            e.temp = copy(v.temp ?? {});
            e.conditions = copy(v.conditions ?? null);
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'special', hit };
    }
    if (cfg.specialBusy === 'cui') {
        // Direct + condition + parry debuff on hit; target cuixin refusal handled outside.
        const hit = directs.length === 1 || num(v.qi) !== num(t.qi);
        const expectedFee = hit ? (cfg.feeHit ?? 260) : (cfg.feeMiss ?? 120);
        assert.equal(fee, expectedFee, 'cui fee');
        const busyAfter = num(a.busy);
        const busyMin = hit ? (cfg.hitBusyMin ?? 2) : (cfg.missBusyMin ?? 3);
        const busyMax = hit ? (cfg.hitBusyMax ?? 2) : (cfg.missBusyMax ?? 3);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'cui busy');
        assertLearnGain(a, p.skill);
        if (directs.length === 1) {
            const input = num(directs[0].damage);
            const support = supportRange(input, [cfg.percent, cfg.percentMax ?? cfg.percent],
                b, t, cfg.directType);
            assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
                'cui direct must match do_damage support');
        }
        if (hit) assert.equal(temp(v, 'cuixin'), 1, 'cuixin set on hit');
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili;
            e.temp = copy(v.temp ?? {});
            e.conditions = copy(v.conditions ?? null);
            allowDerived(e, v);
        });
        return { accepted: true, kind: 'special', hit };
    }
    if (cfg.specialBusy === 'hua') {
        // Receive-type + optional instant death when actor max_neili > target*2.
        const instant = num(b.max_neili) > num(t.max_neili) * 2;
        const hit = instant || num(v.qi) !== num(t.qi) || num(v.jing) !== num(t.jing);
        const expectedFee = hit ? (cfg.feeHit ?? 360) : (cfg.feeMiss ?? 200);
        assert.equal(fee, expectedFee, 'hua fee');
        const busyAfter = num(a.busy);
        const busyMin = instant ? (cfg.instantBusy ?? 1) : hit ? (cfg.hitBusyMin ?? 2) : (cfg.missBusyMin ?? 3);
        const busyMax = instant ? (cfg.instantBusy ?? 1) : hit ? (cfg.hitBusyMax ?? 2) : (cfg.missBusyMax ?? 3);
        assert.ok(busyAfter >= busyMin && busyAfter <= busyMax, 'hua busy');
        assertLearnGain(a, p.skill);
        if (instant) {
            const death = (raw.terminals?.length ?? 0) > 0 || num(v.ghost) === 1 || num(v.living) === 0;
            assert.ok(death || num(v.qi) <= 1, 'instant death kills or nearly zeroes qi');
            stableState(b, a, e => {
                e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
                allowDerived(e, a);
            });
            return { accepted: true, kind: 'special', hit: true };
        }
        else if (hit) {
            assert.ok(num(v.qi) < num(t.qi), 'hua qi drop');
            assert.ok(num(v.jing) <= num(t.jing), 'hua jing drop');
        }
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
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

export function b22Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB22Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
