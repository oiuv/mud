// B3 shared Dali x Xuedao x Xueshan perform batch (10 moves). One collection
// settles three families' perform coverage. Finite reviewed conditions only;
// no game-code writes and no balance claims.
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

const families = ['大理段家', '血刀门', '大轮寺'];

export const b3SourcePaths = [
    'kungfu/skill/longxiang-gong.c',
    'kungfu/skill/longxiang-gong/perform/die.c',
    'kungfu/skill/longxiang-gong/perform/ji.c',
    'kungfu/skill/longxiang-gong/perform/tun.c',
    'kungfu/skill/longxiang-gong/perform/zhen.c',
    'kungfu/skill/dashou-yin.c', 'kungfu/skill/dashou-yin/yin.c',
    'kungfu/skill/mingwang-jian.c', 'kungfu/skill/mingwang-jian/ruo.c',
    'kungfu/skill/mingwang-jian/xiang.c',
    'kungfu/skill/yujiamu-quan.c', 'kungfu/skill/yujiamu-quan/jiang.c',
    'kungfu/skill/xiangmo-chu.c', 'kungfu/skill/xiangmo-chu/zhen.c',
    'kungfu/skill/dali-chu.c', 'kungfu/skill/dali-chu/hong.c',
    'kungfu/skill/mizong-neigong.c', 'kungfu/skill/lamaism.c',
    'kungfu/skill/sword.c', 'kungfu/skill/hand.c', 'kungfu/skill/cuff.c',
    'kungfu/skill/hammer.c', 'kungfu/skill/unarmed.c',
    'kungfu/skill/force.c', 'kungfu/skill/parry.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/martial-cognize.c',
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
export const b3ReviewedSourceHash = '71cee64b69cf2f73dfd6f4a118a786cbbc3ef3337bbdcbf6b4b9a11d785d5166';

// Query skill gates use raw (field 'skill') or effective (field 'effective-*')
// values exactly as each perform reads them. longxiang-gong abilities live
// under a perform/ subdirectory (abilityPath).
const schools = {
    'longxiang-gong/die': {
        skill: 'longxiang-gong', ability: 'die', abilityPath: 'perform/die',
        usage: 'unarmed', grant: 'can_perform/longxiang-gong/die',
        forceSkill: 'longxiang-gong', kind: 'combo', weapon: null, prepared: 'unarmed',
        title: '龙象般若功「象跌势」',
        fee: 300, instantFee: 50, comboAttacks: 5, comboBusyMax: 5,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [239, 240], field: 'skill',
                refusal: '你的龙象般若功修为不够，难以施展「象跌势」。\n' },
            { key: 'max-neili', pair: [3999, 4000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「象跌势」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「象跌势」。\n' },
        ],
    },
    'longxiang-gong/ji': {
        skill: 'longxiang-gong', ability: 'ji', abilityPath: 'perform/ji',
        usage: 'unarmed', grant: 'can_perform/longxiang-gong/ji',
        forceSkill: 'longxiang-gong', kind: 'direct', weapon: null, prepared: 'unarmed',
        title: '龙象般若功「般若极」', directType: 'UNARMED', percent: 80,
        dpSkills: ['parry', 'force'], feeHit: 600, feeMiss: 400, hitBusy: 4, missBusy: 4,
        gates: [
            { key: 'level', pair: [299, 300], field: 'skill',
                refusal: '你的龙象般若功修为不够，难以施展「般若极」。\n' },
            { key: 'max-neili', pair: [4999, 5000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「般若极」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你现在的真气不足，难以施展「般若极」。\n' },
        ],
    },
    'longxiang-gong/tun': {
        skill: 'longxiang-gong', ability: 'tun', abilityPath: 'perform/tun',
        usage: 'unarmed', grant: 'can_perform/longxiang-gong/tun',
        forceSkill: 'longxiang-gong', kind: 'direct', weapon: null, prepared: 'unarmed',
        title: '龙象般若功「龙吞势」', directType: 'UNARMED', percent: 80,
        dpSkills: ['parry', 'force'], feeHit: 300, feeMiss: 200, hitBusy: 3, missBusy: 4,
        buff: 'long_tun',
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的龙象般若功修为不够，难以施展「龙吞势」。\n' },
            { key: 'max-neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「龙吞势」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的真气不足，难以施展「龙吞势」。\n' },
        ],
    },
    'longxiang-gong/zhen': {
        skill: 'longxiang-gong', ability: 'zhen', abilityPath: 'perform/zhen',
        usage: 'unarmed', grant: 'can_perform/longxiang-gong/zhen',
        forceSkill: 'longxiang-gong', kind: 'combo', weapon: null, prepared: 'unarmed',
        title: '龙象般若功「真·般若极」',
        fee: 600, instantFee: 100, comboAttacks: 8, comboBusyMax: 6,
        comboDirect: true, directType: 'UNARMED', percent: 90,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [389, 390], field: 'skill',
                refusal: '你的龙象般若功修为不够，难以施展「真·般若极」。\n' },
            { key: 'max-neili', pair: [6999, 7000], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「真·般若极」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在的真气不足，难以施展「真·般若极」。\n' },
        ],
    },
    'dashou-yin/yin': {
        skill: 'dashou-yin', ability: 'yin',
        usage: 'hand', grant: 'can_perform/dashou-yin/yin',
        forceSkill: 'mizong-neigong', kind: 'direct', weapon: null, prepared: 'hand',
        title: '大手印「金刚印」', directType: 'UNARMED', percent: 40,
        dpSkills: ['parry'], feeHit: 100, feeMiss: 40, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的大手印修为不够，难以施展「金刚印」。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你的真气不够，难以施展「金刚印」。\n' },
        ],
    },
    'mingwang-jian/ruo': {
        skill: 'mingwang-jian', ability: 'ruo',
        usage: 'sword', grant: 'can_perform/mingwang-jian/ruo',
        forceSkill: 'mizong-neigong', kind: 'control', weapon: 'sword', prepared: 'sword',
        title: '不动明王剑「若悲」',
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你不动明王剑不够娴熟，难以施展「若悲」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不足，难以施展「若悲」。\n' },
        ],
    },
    'mingwang-jian/xiang': {
        skill: 'mingwang-jian', ability: 'xiang',
        usage: 'sword', grant: 'can_perform/mingwang-jian/xiang',
        forceSkill: 'mizong-neigong', kind: 'direct', weapon: 'sword', prepared: 'sword',
        title: '不动明王剑「降魔」', directType: 'WEAPON', percent: 45,
        dpSkills: ['parry'], feeHit: 150, feeMiss: 50, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你不动明王剑不够娴熟，难以施展「降魔」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「降魔」。\n' },
        ],
    },
    'yujiamu-quan/jiang': {
        skill: 'yujiamu-quan', ability: 'jiang',
        usage: 'cuff', grant: 'can_perform/yujiamu-quan/jiang',
        forceSkill: 'mizong-neigong', kind: 'direct', weapon: null, prepared: 'cuff',
        title: '金刚瑜迦母拳「修罗降世」', directType: 'UNARMED', percent: 35,
        dpSkills: ['dodge'], feeHit: 100, feeMiss: 40, hitBusy: 1, missBusy: 3,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你金刚瑜迦母拳修为不够，难以施展「修罗降世」。\n' },
            { key: 'neili', pair: [179, 180], field: 'neili',
                refusal: '你目前的真气不足，难以施展「修罗降世」。\n' },
        ],
    },
    'xiangmo-chu/zhen': {
        skill: 'xiangmo-chu', ability: 'zhen',
        usage: 'hammer', grant: 'can_perform/xiangmo-chu/zhen',
        forceSkill: 'mizong-neigong', kind: 'combo', weapon: 'hammer', prepared: 'hammer',
        title: '金刚降魔杵「镇魂舞」',
        fee: 150, comboAttacks: 5, comboBusyMax: 5,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你金刚降魔杵火候不足，难以施展「镇魂舞」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-force',
                refusal: '你的内功火候不足，难以施展「镇魂舞」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「镇魂舞」。\n' },
        ],
    },
    'dali-chu/hong': {
        skill: 'dali-chu', ability: 'hong',
        usage: 'hammer', grant: 'can_perform/dali-chu/hong',
        forceSkill: 'mizong-neigong', kind: 'direct', weapon: 'hammer', prepared: 'hammer',
        title: '无上大力杵「轰雷万钧」', directType: 'WEAPON', percent: 55,
        dpSkills: ['force'], feeHit: 150, feeMiss: 100, hitBusy: 3, missBusy: 3,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你无上大力杵火候不足，难以施展「轰雷万钧」。\n' },
            { key: 'force', pair: [119, 120], field: 'effective-force',
                refusal: '你的内功火候不足，难以施展「轰雷万钧」。\n' },
            { key: 'max-neili', pair: [799, 800], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「轰雷万钧」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「轰雷万钧」。\n' },
        ],
    },
};

export const b3Schools = schools;

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

export function b3PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b3SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b3ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b3ReviewedSourceHash,
            'Reviewed B3 sources changed; re-review before sampling');
    const result = [];
    for (const [key, cfg] of Object.entries(schools)) {
        // longxiang-gong abilities live under a perform/ subdirectory.
        const abilityKey = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${abilityKey}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`);
        assert.equal(ability?.path, `kungfu/skill/${cfg.skill}/${abilityKey}.c`);
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
                'martial-cognize': 200, lamaism: level,
            };
            if (cfg.usage === 'sword') skills.sword = 200;
            if (cfg.usage === 'hand') skills.hand = 200;
            if (cfg.usage === 'cuff') skills.cuff = 200;
            if (cfg.usage === 'hammer') skills.hammer = 200;
            if (cfg.usage === 'unarmed') skills.unarmed = 200;
            for (const [k, v] of Object.entries(floor.skills))
                skills[k] = Math.max(skills[k] ?? 0, v);
            Object.assign(skills, extra.skills);
            for (const [k, v] of Object.entries(skills)) if (v === undefined) delete skills[k];
            const properties = {
                ...defaults, 'family/family_name': '大轮寺',
                ...(cfg.grant ? { [cfg.grant]: cfg.grantValue ?? 1 } : {}),
            };
            for (const [k, v] of Object.entries(floor.properties))
                properties[k] = Math.max(properties[k] ?? 0, v);
            Object.assign(properties, extra.properties);
            const actor = {
                skills,
                mappings: { force: cfg.forceSkill, [cfg.usage]: cfg.skill,
                    ...extra.mappings },
                preparations: { [cfg.usage]: cfg.skill }, properties,
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
                skills: { force: level, dodge: level, parry: level, sword: 200,
                    ...extra.targetSkills },
                mappings: {}, preparations: {},
                properties: { ...defaults, shen: 0, ...extra.targetProperties },
                ...(targetEquipment ? { equipment: targetEquipment } : {}),
                ...(targetTemp ? { temp: targetTemp } : {}),
                ...(extra.targetBusy ? { busy: 2 } : {}),
            };
            if (extra.actorTemp) actor.temp = extra.actorTemp;
            if (extra.conditions) actor.conditions = extra.conditions;
            result.push({
                id: `b3-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b3', family: '大轮寺', families: [...families],
                    collection_group: 'b3-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true, target_state: 'living',
                    action: `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b3SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}共享批量：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。families为大理段家、血刀门与大轮寺三派perform销账，'
                        + '同一样本同时计入三派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '象跌势与真·般若极的内力碾压即倒分支、龙吞势临时标记、若悲按战斗经验判定、'
                        + '修罗降世残血爆发均按原分支记账。只收集数据，不比较强弱。',
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
        if (cfg.ability === 'ruo') {
            // ruo hits on random(combat_exp) > target combat_exp/3.
            add('hit', { targetProperties: { combat_exp: 0 }, samples: 4 });
            add('miss', { targetProperties: { combat_exp: 1000000000 }, samples: 4 });
        } else if (cfg.dpSkills) {
            const defend = value => Object.fromEntries(cfg.dpSkills.map(skill => [skill, value]));
            add('hit', { targetSkills: defend(0), samples: 4 });
            add('miss', { targetSkills: defend(100000), samples: 4 });
        }
        // Special constraints: explicit boundary variants only.
        if (cfg.buff)
            add('already-active', { actorTemp: { [cfg.buff]: 1 },
                refusal: '「龙吞势」无法连续施展。\n' });
        if (cfg.ability === 'ruo')
            add('target-busy', { targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧。\n' });
        if (cfg.ability === 'die')
            add('instant-kill', { targetProperties: { max_neili: 1000 }, samples: 2 });
        if (cfg.ability === 'zhen' && cfg.skill === 'longxiang-gong')
            add('instant-kill', {
                targetProperties: { max_neili: 1000 }, targetSkills: { parry: 0 }, samples: 2 });
        if (cfg.ability === 'die')
            add('wrong-force', { skills: { 'mizong-neigong': 200 },
                mappings: { force: 'mizong-neigong' },
                refusal: '你没有激发龙象般若功为内功，难以施展「象跌势」。\n' });
        if (cfg.ability === 'jiang')
            add('angry', { properties: { qi: 4000 }, samples: 2 });
        if (cfg.ability === 'xiang')
            add('no-weapon', { actorEquipment: null,
                refusal: '你使用的武器不对，难以施展「降魔」。\n' });
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
        // unconcious() sets block_msg/all; it is a transient message flag.
        if (side.temp) delete side.temp.block_msg;
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

export function validateB3Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B3 entry');
    assert.equal(p.collection_group, 'b3-perform');
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
    if (cfg.kind === 'direct') return validateB3Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB3Control(raw, condition, cfg, p, b, t, a, v);
    return validateB3Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB3Direct(raw, condition, cfg, p, b, t, a, v) {
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
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            if (cfg.buff) e.temp[cfg.buff] = 1;
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
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        if (cfg.buff) e.temp[cfg.buff] = 1;
    });
    // do_damage wounds qi; jiang's angry branch only widens damage input.
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB3Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    // ruo deducts no neili at all.
    assert.equal(cost, 0, 'ruo has no fee');
    assert.equal(b.neili - a.neili, 0, 'no neili deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    const hit = tBusy > 0;
    if (hit) {
        assert.equal(busyAfter, 0, 'no me busy on hit');
        // query_skill("sword") = raw_sword/2 + effective mapped skill.
        const swordEff = Math.trunc(num(sparse(b.skills, 'sword')) / 2)
            + num(sparse(b.skills, cfg.skill));
        assert.equal(tBusy, Math.trunc(swordEff / 26) + 2, 'target busy');
    } else {
        assert.equal(busyAfter, 1, 'me busy on miss');
        assert.equal(tBusy, 0, 'no target busy on miss');
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.busy = a.busy; e.learned = a.learned; });
    stableState(t, v, e => { e.busy = v.busy; });
    return { accepted: true, kind: 'control', hit };
}

function validateB3Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    if (p.variant === 'instant-kill') {
        // max_neili crush: no attacks, small fee, target disabled.
        assert.equal(attacks.length, 0, 'instant-kill has no attacks');
        assert.deepEqual(directs, [], 'instant-kill has no directs');
        assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
        assert.equal(fee, cfg.instantFee, 'instant-kill fee');
        assert.equal(num(a.busy), 1, 'instant-kill busy');
        assert.ok(v.eff_qi <= 1 || num(v.living) === 0, 'target disabled');
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            e.temp.apply = copy(a.temp.apply ?? {});
            allowDerived(e, a);
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.living = v.living;
        });
        return { accepted: true, kind: 'combo', hit: true };
    }
    assert.equal(fee, cfg.fee, 'combo fee');
    assert.equal(attacks.length, cfg.comboAttacks, 'combo attack count');
    assert.ok(num(a.busy) >= 1 && num(a.busy) <= cfg.comboBusyMax, 'combo busy range');
    for (const at of attacks) assert.ok([0, -1, -2].includes(at.result));
    if (cfg.comboDirect) {
        // zhen: do_damage inside the hit branch, then the attack loop further
        // reduces qi, so the final state is outside the do_damage support set.
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
    assertLearnGain(a, p.skill);
    // add_temp("apply/attack", count) then -count leaves an explicit 0.
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        allowDerived(e, a);
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
    });
    return { accepted: true, kind: 'combo', hit: attacks.some(x => x.result === 0), hits: attacks.filter(x => x.result === 0).length };
}

export function b3Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB3Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
