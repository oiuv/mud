// B13 Huashan-exclusive 11 + Duan-exclusive tail 2 perform batch (13 moves).
// Huashan: shunv-jian ning, fanliangyi-dao san/makearray, hunyuan-zhang wuji,
// poyu-quan feng/lei/po, huashan-quan song, huashan-zhang piao,
// kuangfeng-jian sao/yong. Duan tail: duanjia-jian jing/lian. One collection
// settles these exclusive performs.
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

// Huashan-exclusive moves settle 华山派; the Duan tail settles 大理段家.
const huashanFamilies = ['华山派'];
const duanFamilies = ['大理段家'];

export const b13SourcePaths = [
    'kungfu/skill/shunv-jian.c', 'kungfu/skill/shunv-jian/ning.c',
    'kungfu/skill/fanliangyi-dao.c', 'kungfu/skill/fanliangyi-dao/san.c',
    'kungfu/skill/fanliangyi-dao/makearray.c',
    'kungfu/skill/hunyuan-zhang.c', 'kungfu/skill/hunyuan-zhang/wuji.c',
    'kungfu/skill/poyu-quan.c', 'kungfu/skill/poyu-quan/feng.c',
    'kungfu/skill/poyu-quan/lei.c', 'kungfu/skill/poyu-quan/po.c',
    'kungfu/skill/huashan-quan.c', 'kungfu/skill/huashan-quan/song.c',
    'kungfu/skill/huashan-zhang.c', 'kungfu/skill/huashan-zhang/piao.c',
    'kungfu/skill/kuangfeng-jian.c', 'kungfu/skill/kuangfeng-jian/sao.c',
    'kungfu/skill/kuangfeng-jian/yong.c',
    'kungfu/skill/duanjia-jian.c', 'kungfu/skill/duanjia-jian/jing.c',
    'kungfu/skill/duanjia-jian/lian.c',
    'kungfu/skill/huashan-xinfa.c', 'kungfu/skill/duanshi-xinfa.c',
    'kungfu/skill/throwing.c', 'kungfu/skill/unarmed.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c', 'kungfu/skill/staff.c',
    'kungfu/skill/strike.c', 'kungfu/skill/cuff.c', 'kungfu/skill/hand.c',
    'kungfu/skill/claw.c', 'kungfu/skill/whip.c',
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
export const b13ReviewedSourceHash = '86ede164a4cd83e67ab6d877aa8179bd1308e874ed660b345e501e2a8e2c3064';

// Query skill gates use raw (field 'skill') values exactly as each perform
// reads them. These Huashan/Duan moves gate on basic force, not a mapped force.
const schools = {
    'shunv-jian/ning': {
        skill: 'shunv-jian', ability: 'ning', abilityPath: 'ning',
        usage: 'sword', grant: 'can_perform/shunv-jian/ning',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: huashanFamilies, actorFamily: '华山派',
        title: '淑女剑法「宁氏一剑」', directType: 'WEAPON', percent: 65,
        dpSkills: ['parry', 'dodge'], feeHit: 220, feeMiss: 120,
        hitBusyMin: 1, hitBusyMax: 3, missBusy: 2,
        gates: [
            { key: 'dodge', pair: [99, 100], field: 'skill', skillName: 'dodge',
                refusal: '你的基本轻功的修为不够，难以施展「宁氏一剑」。\n' },
            { key: 'force', pair: [99, 100], field: 'skill', skillName: 'force',
                refusal: '你的基本内功的修为不够，难以施展「宁氏一剑」。\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的淑女剑法修为不够，难以施展「宁氏一剑」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你现在真气不够，难以施展「宁氏一剑」。\n' },
        ],
    },
    'fanliangyi-dao/san': {
        skill: 'fanliangyi-dao', ability: 'san', abilityPath: 'san',
        usage: 'blade', grant: 'can_perform/fanliangyi-dao/san',
        forceSkill: 'force', kind: 'multi', weapon: 'blade', prepared: 'blade',
        families: huashanFamilies, actorFamily: '华山派',
        title: '反两仪刀法「华岳三神峰」', directType: 'WEAPON',
        multiDirects: 3,
        percentRanges: [[50, 50], [60, 60], [70, 70]],
        // Source only checks the neili threshold; it does not deduct cost.
        fee: 0, hitBusyMin: 3, hitBusyMax: 3,
        dpSkills: ['parry'],
        gates: [
            { key: 'max-neili', pair: [1799, 1800], field: 'max_neili',
                refusal: '你的内力修为不够，无法施展「华岳三神峰」！\n' },
            { key: 'neili', pair: [319, 320], field: 'neili',
                refusal: '你的真气不够！\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你反两仪刀法火候不足，无法施展「华岳三神峰」\n' },
            { key: 'force', pair: [139, 140], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不足，无法施展「华岳三神峰」\n' },
        ],
    },
    'fanliangyi-dao/makearray': {
        skill: 'fanliangyi-dao', ability: 'makearray', abilityPath: 'makearray',
        usage: 'blade', grant: null,
        forceSkill: 'force', kind: 'array', weapon: 'blade', prepared: 'blade',
        families: huashanFamilies, actorFamily: '华山派',
        title: '反两仪刀法「双剑和壁」',
        // Success path needs a two-person team and is settled by school_team.
        // This batch only records the original no-team refusal so the perform
        // entry and 大理/华山销账仍被触达。
        nonCombat: true,
        gates: [],
    },
    'hunyuan-zhang/wuji': {
        skill: 'hunyuan-zhang', ability: 'wuji', abilityPath: 'wuji',
        usage: 'strike', grant: 'can_perform/hunyuan-zhang/wuji',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'strike',
        families: huashanFamilies, actorFamily: '华山派',
        title: '混元掌「混元无极」', directType: 'UNARMED', percent: 80,
        dpSkills: ['force'], feeHit: 220, feeMiss: 120,
        hitBusyMin: 1, hitBusyMax: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的混元掌等级不够, 不能施展「混元无极」！\n' },
            { key: 'force', pair: [119, 120], field: 'skill', skillName: 'force',
                refusal: '你内功修为不够，无法施展「混元无极」！\n' },
            { key: 'max-neili', pair: [1399, 1400], field: 'max_neili',
                refusal: '你内力修为不足，无法施展「混元无极」！\n' },
            { key: 'neili', pair: [239, 240], field: 'neili',
                refusal: '你的内力不够，无法施展「混元无极」！\n' },
        ],
    },
    'poyu-quan/feng': {
        skill: 'poyu-quan', ability: 'feng', abilityPath: 'feng',
        usage: 'cuff', grant: 'can_perform/poyu-quan/feng',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'cuff',
        families: huashanFamilies, actorFamily: '华山派',
        title: '劈石破玉拳「封闭手」',
        feeHit: 40, feeMiss: 40, unconditionalFee: true,
        meBusyHit: 0, meBusyMiss: 1,
        targetBusyFormula: 'cuff20-2', dpSkills: ['force'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的劈石破玉拳不够娴熟，不会使用「封闭手」。\n' },
            { key: 'neili', pair: [79, 80], field: 'neili',
                refusal: '你现在真气不够，无法施展「封闭手」。\n' },
        ],
    },
    'poyu-quan/lei': {
        skill: 'poyu-quan', ability: 'lei', abilityPath: 'lei',
        usage: 'cuff', grant: 'can_perform/poyu-quan/lei',
        forceSkill: 'force', kind: 'buff', weapon: null, prepared: 'cuff',
        families: huashanFamilies, actorFamily: '华山派',
        title: '劈石破玉拳「雷动九天」',
        fee: 400, meBusy: 2, buff: 'lei', tempStats: true,
        gates: [
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不够。\n' },
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的劈石破玉拳修为不够，无法施展「雷动九天」\n' },
        ],
    },
    'poyu-quan/po': {
        skill: 'poyu-quan', ability: 'po', abilityPath: 'po',
        usage: 'cuff', grant: 'can_perform/poyu-quan/po',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'cuff',
        families: huashanFamilies, actorFamily: '华山派',
        title: '劈石破玉拳「破石一击」', directType: 'UNARMED', percent: 80,
        dpSkills: ['force'], feeHit: 220, feeMiss: 120, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的劈石破玉拳不够娴熟，无法施展「破石一击」。\n' },
            { key: 'force', pair: [119, 120], field: 'skill', skillName: 'force',
                refusal: '你的内功修为还不够，无法施展「破石一击」\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，无法施展「破石一击」。\n' },
        ],
    },
    'huashan-quan/song': {
        skill: 'huashan-quan', ability: 'song', abilityPath: 'song',
        usage: 'cuff', grant: 'can_perform/huashan-quan/song',
        forceSkill: 'force', kind: 'direct', weapon: null, prepared: 'cuff',
        families: huashanFamilies, actorFamily: '华山派',
        title: '华山拳法「苍松式」', directType: 'UNARMED', percent: 30,
        dpSkills: ['force'], feeHit: 60, feeMiss: 50, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [39, 40], field: 'skill',
                refusal: '你的华山拳法不够娴熟，无法施展「苍松式」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，无法施展「苍松式」。\n' },
        ],
    },
    'huashan-zhang/piao': {
        skill: 'huashan-zhang', ability: 'piao', abilityPath: 'piao',
        usage: 'strike', grant: 'can_perform/huashan-zhang/piao',
        forceSkill: 'force', kind: 'control', weapon: null, prepared: 'strike',
        families: huashanFamilies, actorFamily: '华山派',
        title: '华山掌法「飞絮飘渺」',
        feeHit: 30, feeMiss: 30, unconditionalFee: true,
        meBusyHit: 0, meBusyMiss: 1,
        // Source rolls attacker cuff against target force, and the target-busy
        // window is strike/25+2. Keep both original expressions.
        targetBusyFormula: 'strike25-2', dpSkills: ['force'],
        targetBusyRefusal: true,
        gates: [
            { key: 'level', pair: [29, 30], field: 'skill',
                refusal: '你的华山掌法不够娴熟，不会使用「飞絮飘渺」。\n' },
            { key: 'neili', pair: [59, 60], field: 'neili',
                refusal: '你现在真气不够，无法施展「飞絮飘渺」。\n' },
        ],
    },
    'kuangfeng-jian/sao': {
        skill: 'kuangfeng-jian', ability: 'sao', abilityPath: 'sao',
        usage: 'sword', grant: 'can_perform/kuangfeng-jian/sao',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: huashanFamilies, actorFamily: '华山派',
        title: '狂风剑法「风扫落叶」',
        fee: 150, comboAttacks: 6, comboBusyMin: 1, comboBusyMax: 6,
        applyKeys: ['attack'],
        gates: [
            { key: 'neili', pair: [179, 180], field: 'neili',
                refusal: '你的真气不够，无法施展「风扫落叶」！\n' },
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的狂风剑法还不到家，无法施展「风扫落叶」！\n' },
            { key: 'dodge', pair: [99, 100], field: 'skill', skillName: 'dodge',
                refusal: '你的轻功修为不足，无法施展「风扫落叶」！\n' },
        ],
    },
    'kuangfeng-jian/yong': {
        skill: 'kuangfeng-jian', ability: 'yong', abilityPath: 'yong',
        usage: 'sword', grant: 'can_perform/kuangfeng-jian/yong',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: huashanFamilies, actorFamily: '华山派',
        title: '狂风快剑「风起云涌」', directType: 'WEAPON',
        percentRange: [65, 70],
        dpSkills: ['parry', 'dodge'], feeHit: 230, feeMiss: 120,
        hitBusy: 2, missBusy: 2,
        gates: [
            { key: 'dodge', pair: [139, 140], field: 'skill', skillName: 'dodge',
                refusal: '你的基本轻功的修为不够，难以施展「风起云涌」。\n' },
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的狂风快剑修为不够，难以施展「风起云涌」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你现在真气不够，难以施展「风起云涌」。\n' },
        ],
    },
    'duanjia-jian/jing': {
        skill: 'duanjia-jian', ability: 'jing', abilityPath: 'jing',
        usage: 'sword', grant: 'can_perform/duanjia-jian/jing',
        forceSkill: 'force', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: duanFamilies, actorFamily: '大理段家',
        title: '段家剑法「惊天一剑」', directType: 'WEAPON', percent: 50,
        dpSkills: ['force'],
        // Hit branch spends exactly the do_damage input; miss spends 100.
        feeEqualsInput: true, feeHit: 0, feeMiss: 100, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的段家剑法不够娴熟，难以施展「惊天一剑」。\n' },
            { key: 'force', pair: [119, 120], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「惊天一剑」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，难以施展「惊天一剑」。\n' },
        ],
    },
    'duanjia-jian/lian': {
        skill: 'duanjia-jian', ability: 'lian', abilityPath: 'lian',
        usage: 'sword', grant: 'can_perform/duanjia-jian/lian',
        forceSkill: 'force', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: duanFamilies, actorFamily: '大理段家',
        title: '段家剑法「五绝连环」',
        fee: 100, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 5,
        applyKeys: [],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的段家剑法不够娴熟，难以施展「五绝连环」。\n' },
            { key: 'force', pair: [149, 150], field: 'skill', skillName: 'force',
                refusal: '你的内功修为不够，难以施展「五绝连环」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，难以施展「五绝连环」。\n' },
        ],
    },
};

export const b13Schools = schools;

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
        }
    }
    return { skills, properties };
};

// Each gate pair is the value the source compares. The edits below map that
// value onto the one input that reproduces it.
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
        case 'effective-dodge': return { skills: { dodge: value * 2 + 2 } };
        default: return { skills: { [gate.field]: value } };
    }
};

export function b13PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b13SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b13ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b13ReviewedSourceHash,
            'Reviewed B13 sources changed; re-review before sampling');
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
                id: `b13-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b13', family: cfg.actorFamily ?? cfg.families[0],
                    families: [...cfg.families],
                    collection_group: 'b13-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: cfg.nonCombat ? false : true,
                    target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b13SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}${cfg.families.join('、')}独有：原公开命令、`
                        + (cfg.nonCombat ? '非战斗、' : '单备、') + '加力0、真实非巫师USER。'
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}派perform销账，`
                        + '同一样本计入该派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + (cfg.kind === 'array'
                            ? '双剑和壁须两人组队，本批只记原无队伍拒绝；成功刀阵由 school_team 批次覆盖。'
                            : '宁氏一剑与风起云涌与惊天一剑与破石一击与混元无极与苍松式直伤、'
                              + '华岳三神峰三段连斩、封闭手与飞絮飘渺目标忙乱、'
                              + '雷动九天临时力道身法增益、风扫落叶与五绝连环连击'
                              + '均按原分支记账。')
                        + '只收集数据，不比较强弱。',
                },
            });
        }
        if (cfg.kind === 'array') {
            add('no-team', {
                refusal: '反两仪刀共需两人，少一个多一个都不行。\n', samples: 2 });
            continue;
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
                refusal: '你已经在运功中了。\n' });
        } else if (cfg.dpSkills && cfg.dpSkills.length && cfg.kind !== 'combo') {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        if (cfg.targetBusyFormula || cfg.targetBusyRefusal)
            add('target-busy', { targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧！\n' });
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

export function validateB13Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B13 entry');
    assert.equal(p.collection_group, 'b13-perform');
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
    if (cfg.kind === 'control') return validateB13Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'multi') return validateB13Multi(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'buff') return validateB13Buff(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB13Direct(raw, condition, cfg, p, b, t, a, v);
    return validateB13Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB13Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const miss = directs.length === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), miss ? 0 : 1, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const fee = cfg.feeEqualsInput
        ? (miss ? (cfg.feeMiss ?? 0) : num(directs[0]?.damage))
        : cfg.unconditionalFee ? (cfg.feeHit ?? 0)
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
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        e.conditions = copy(v.conditions ?? null);
        allowDerived(e, v);
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB13Control(raw, condition, cfg, p, b, t, a, v) {
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
        if (cfg.targetBusyFormula === 'cuff20-2') {
            const level = num(sparse(b.effective_skills ?? {}, 'cuff'))
                || num(sparse(b.skills, 'cuff'));
            assert.equal(tBusy, Math.trunc(level / 20) + 2, 'cuff20-2 target busy');
        } else if (cfg.targetBusyFormula === 'strike25-2') {
            const level = num(sparse(b.effective_skills ?? {}, 'strike'))
                || num(sparse(b.skills, 'strike'));
            assert.equal(tBusy, Math.trunc(level / 25) + 2, 'strike25-2 target busy');
        }
        assert.equal(busyAfter, cfg.meBusyHit ?? 0, 'me busy on hit');
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

function validateB13Multi(raw, condition, cfg, p, b, t, a, v) {
    // fanliangyi san: up to 3 sequential do_damage segments, no unit fee.
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= cfg.multiDirects, 'multi direct bound');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
    }
    const fee = b.neili - a.neili;
    assert.equal(fee, cfg.fee, 'multi fee');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length, 'direct count');
    const busyAfter = num(a.busy);
    assert.ok(busyAfter >= cfg.hitBusyMin && busyAfter <= cfg.hitBusyMax, 'multi busy range');
    for (let i = 0; i < directs.length; i++) {
        const input = num(directs[i].damage);
        const support = supportRange(input, cfg.percentRanges[i], b, t, cfg.directType);
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

function validateB13Buff(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'buff has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'buff fee');
    assert.equal(b.neili - a.neili, cfg.fee, 'buff fee deduction');
    assert.equal(num(a.busy ?? 0), p.fighting ? cfg.meBusy : 0);
    assert.equal(temp(a, cfg.buff), 1, 'buff flag set');
    if (cfg.tempStats) {
        const skill = num(sparse(b.skills, cfg.skill));
        const gain = Math.trunc(skill / 6);
        assert.equal(temp(a, 'str') - temp(b, 'str'), gain, 'temp str gain');
        assert.equal(temp(a, 'dex') - temp(b, 'dex'), gain, 'temp dex gain');
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        if (cfg.tempStats) { e.temp.str = a.temp.str; e.temp.dex = a.temp.dex; }
        e.temp[cfg.buff] = a.temp[cfg.buff];
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'buff' };
}

function validateB13Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    assert.ok(fee >= cfg.fee, 'combo fee floor');
    assert.ok(attacks.length >= 1 && attacks.length <= (cfg.comboAttacks ?? 8),
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

export function b13Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB13Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
