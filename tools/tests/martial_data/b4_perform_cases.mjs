// B4 shared Huashan perform batch (8 moves: pixie-jian duo/gui/pi/po and
// huashan-jian jie/lian/long/xian). One collection settles multiple families'
// perform coverage. Finite reviewed conditions only; no game-code writes and
// no balance claims.
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

// pixie-jian is shared by Huashan/Riyue/Shaolin NPCs; huashan-jian by
// Huashan/Riyue/Murong/Shenlong. Per-skill families: 4×3 + 4×4 = 28 派次.
const pixieFamilies = ['华山派', '日月神教', '少林派'];
const huashanFamilies = ['华山派', '日月神教', '慕容世家', '神龙教'];

export const b4SourcePaths = [
    'kungfu/skill/pixie-jian.c', 'kungfu/skill/pixie-jian/duo.c',
    'kungfu/skill/pixie-jian/gui.c', 'kungfu/skill/pixie-jian/pi.c',
    'kungfu/skill/pixie-jian/po.c',
    'kungfu/skill/huashan-jian.c', 'kungfu/skill/huashan-jian/jie.c',
    'kungfu/skill/huashan-jian/lian.c', 'kungfu/skill/huashan-jian/long.c',
    'kungfu/skill/huashan-jian/xian.c',
    'kungfu/skill/huashan-xinfa.c',
    'kungfu/skill/sword.c', 'kungfu/skill/unarmed.c',
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
export const b4ReviewedSourceHash = 'd21e75ed7ab2b705b6c110d61344d9e9e7406e7be4f7a7a9b53a099a44ea5648';

// Query skill gates use raw (field 'skill') or effective (field 'effective-*')
// values exactly as each perform reads them.
const schools = {
    'pixie-jian/duo': {
        skill: 'pixie-jian', ability: 'duo',
        usage: 'sword', grant: 'can_perform/pixie-jian/duo',
        forceSkill: 'huashan-xinfa', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: pixieFamilies,
        title: '辟邪剑法「鬼影夺目」', directType: 'REMOTE', percent: 30,
        dpSkills: ['parry', 'dodge'], feeHit: 80, feeMiss: 50, hitBusy: 2, missBusy: 3,
        hitBuff: 'block_msg/all',
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的辟邪剑法不够娴熟，难以施展「鬼影夺目」。\n' },
            { key: 'max-neili', pair: [799, 800], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「鬼影夺目」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不足，难以施展「鬼影夺目」。\n' },
        ],
    },
    'pixie-jian/gui': {
        skill: 'pixie-jian', ability: 'gui',
        usage: 'dodge', grant: 'can_perform/pixie-jian/gui',
        forceSkill: 'huashan-xinfa', kind: 'control', weapon: null, prepared: null,
        families: pixieFamilies,
        title: '辟邪剑法「鬼魅身法」',
        dpSkills: ['parry'], fee: 50, hitMeBusy: 1, missMeBusy: 2,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的辟邪剑法不够娴熟，难以施展「鬼魅身法」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不足，难以施展「鬼魅身法」。\n' },
        ],
    },
    'pixie-jian/pi': {
        skill: 'pixie-jian', ability: 'pi',
        usage: 'sword', grant: 'can_perform/pixie-jian/pi',
        forceSkill: 'huashan-xinfa', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: pixieFamilies,
        title: '辟邪剑法「群邪辟易」',
        fee: 100, comboAttacks: 9, comboBusyMin: 1, comboBusyMax: 7,
        dpSkills: ['dodge'], applyKeys: ['attack', 'damage', 'unarmed_damage'],
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的辟邪剑法不够娴熟，难以施展「群邪辟易」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「群邪辟易」。\n' },
        ],
    },
    'pixie-jian/po': {
        skill: 'pixie-jian', ability: 'po',
        usage: 'sword', grant: 'can_perform/pixie-jian/po',
        forceSkill: 'huashan-xinfa', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: pixieFamilies,
        title: '辟邪剑法「破元剑闪」', directType: 'REMOTE',
        percentRange: [80, 94],
        dpSkills: ['parry', 'dodge'], feeHit: 200, feeMiss: 150, hitBusy: 2, missBusy: 3,
        hitBuff: 'no_perform',
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的辟邪剑法不够娴熟，难以施展「破元剑闪」。\n' },
            { key: 'max-neili', pair: [2599, 2600], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「破元剑闪」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「破元剑闪」。\n' },
        ],
    },
    'huashan-jian/jie': {
        skill: 'huashan-jian', ability: 'jie',
        usage: 'sword', grant: 'can_perform/huashan-jian/jie',
        forceSkill: 'huashan-xinfa', kind: 'control', weapon: 'sword', prepared: 'sword',
        families: huashanFamilies,
        title: '华山剑法「截手式」',
        dpSkills: ['parry'], fee: 50, missMeBusy: 1,
        gates: [
            { key: 'level', pair: [29, 30], field: 'skill',
                refusal: '你的华山剑法不够娴熟，无法施展「截手式」 。\n' },
            { key: 'neili', pair: [59, 60], field: 'neili',
                refusal: '你现在真气不够，无法使用「截手式」。\n' },
        ],
    },
    'huashan-jian/lian': {
        skill: 'huashan-jian', ability: 'lian',
        usage: 'sword', grant: 'can_perform/huashan-jian/lian',
        forceSkill: 'huashan-xinfa', kind: 'combo', weapon: 'sword', prepared: 'sword',
        families: huashanFamilies,
        title: '华山剑法「剑掌五连环」',
        fee: 120, comboAttacks: 5, comboBusyMin: 1, comboBusyMax: 3,
        applyKeys: ['attack'],
        gates: [
            { key: 'level', pair: [49, 50], field: 'skill',
                refusal: '你的华山剑法还不到家，无法施展「剑掌五连环」！\n' },
            { key: 'force', pair: [99, 100], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「剑掌五连环」！\n' },
            { key: 'neili', pair: [159, 160], field: 'neili',
                refusal: '你的真气不够，无法施展「剑掌五连环」！\n' },
        ],
    },
    'huashan-jian/long': {
        skill: 'huashan-jian', ability: 'long',
        usage: 'sword', grant: 'can_perform/huashan-jian/long',
        forceSkill: 'huashan-xinfa', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: huashanFamilies,
        title: '华山剑法「天外飞龙」', directType: 'WEAPON', percent: 55,
        dpSkills: ['dodge'], feeHit: 200, feeMiss: 120, hitBusy: 3, missBusy: 3,
        weaponDrop: true,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你华山剑法不够娴熟，无法施展「天外飞龙」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-force',
                refusal: '你内功火候不够，无法施展「天外飞龙」。\n' },
            { key: 'neili', pair: [219, 220], field: 'neili',
                refusal: '你现在真气不够，无法施展「天外飞龙」！\n' },
        ],
    },
    'huashan-jian/xian': {
        skill: 'huashan-jian', ability: 'xian',
        usage: 'sword', grant: 'can_perform/huashan-jian/xian',
        forceSkill: 'huashan-xinfa', kind: 'direct', weapon: 'sword', prepared: 'sword',
        families: huashanFamilies,
        title: '华山剑法「夺命连环三仙剑」', directType: 'WEAPON',
        maxDirects: 3,
        stages: [
            { dpField: 'dodge', percentRange: [40, 49], damageSpan: 3 },
            { dpField: 'force', percentRange: [50, 59], damageSpan: 3 },
            { dpField: 'parry', percentRange: [60, 69], damageSpan: 2 },
        ],
        dpSkills: ['dodge', 'force', 'parry'], fee: 280, meBusy: 3,
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你华山剑法不够娴熟，无法施展「夺命连环三仙剑」。\n' },
            { key: 'dodge', pair: [159, 160], field: 'skill', skillName: 'dodge',
                refusal: '你轻功修为不够，无法施展「夺命连环三仙剑」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，无法施展「夺命连环三仙剑」！\n' },
        ],
    },
};

export const b4Schools = schools;

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

export function b4PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b4SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b4ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b4ReviewedSourceHash,
            'Reviewed B4 sources changed; re-review before sampling');
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
        const level = 200;
        const floor = gateFloor(cfg);
        function add(variant, extra = {}) {
            const skills = {
                [cfg.usage]: level, [cfg.skill]: level, force: 0,
                [cfg.forceSkill]: level, dodge: 200, parry: 200,
                'martial-cognize': 200,
            };
            if (cfg.usage === 'sword') skills.sword = 200;
            if (cfg.usage === 'unarmed') skills.unarmed = 200;
            if (cfg.usage === 'dodge') skills.dodge = 200;
            for (const [k, v] of Object.entries(floor.skills))
                skills[k] = Math.max(skills[k] ?? 0, v);
            Object.assign(skills, extra.skills);
            for (const [k, v] of Object.entries(skills)) if (v === undefined) delete skills[k];
            const properties = {
                ...defaults, 'family/family_name': cfg.families[0],
                ...(cfg.grant ? { [cfg.grant]: cfg.grantValue ?? 1 } : {}),
            };
            for (const [k, v] of Object.entries(floor.properties))
                properties[k] = Math.max(properties[k] ?? 0, v);
            Object.assign(properties, extra.properties);
            const actor = {
                skills,
                mappings: { force: cfg.forceSkill, [cfg.usage]: cfg.skill,
                    ...extra.mappings },
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
                skills: { force: 600, dodge: 600, parry: 600, sword: 200,
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
                id: `b4-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b4', family: cfg.families[0], families: [...cfg.families],
                    collection_group: 'b4-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true, target_state: 'living',
                    action: extra.action ?? `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b4SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}共享批量：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。'
                        + `families为${cfg.families.join('、')}等派perform销账，`
                        + '同一样本同时计入各派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '鬼影夺目致盲、破元剑闪封招、天外飞龙掷剑落场、'
                        + '群邪辟易与剑掌五连环临时加成均按原分支记账。只收集数据，不比较强弱。',
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
        if (cfg.ability === 'duo')
            add('already-blind', { targetTemp: { 'block_msg/all': 1 },
                refusal: '对方现在什么也看不见，放胆攻击吧。\n' });
        if (cfg.ability === 'gui')
            add('target-busy', { targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧。\n' });
        if (cfg.ability === 'po')
            add('target-no-perform', { targetTemp: { no_perform: 1 },
                refusal: '对方现在已经无法控制真气，放胆攻击吧。\n' });
        if (cfg.ability === 'jie')
            add('target-busy', { targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧！\n' });
        if (cfg.ability === 'duo')
            add('unarmed', { actorEquipment: null,
                mappings: { sword: 0, unarmed: 'pixie-jian' },
                preparations: { unarmed: 'pixie-jian' },
                skills: { sword: 200, unarmed: 200 },
                action: 'perform unarmed.duo right', samples: 4 });
        if (cfg.ability === 'xian') {
            add('one-direct', { targetSkills: { dodge: 0, force: 100000, parry: 100000 }, samples: 4 });
            add('two-direct', { targetSkills: { dodge: 0, force: 0, parry: 100000 }, samples: 4 });
        }
        if (cfg.weaponDrop)
            add('no-weapon', { actorEquipment: null,
                refusal: '你使用的武器不对！\n' });
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

function stableState(before, after, mutate, { weaponDrop = false } = {}) {
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
        // pi's add_temp("pixie-jian/hit_msg") + delete_temp leaves an empty map.
        if (side.temp && side.temp['pixie-jian'] && !Object.keys(side.temp['pixie-jian']).length)
            delete side.temp['pixie-jian'];
        if (side.weapon_details) side.weapon_details.consistence = 0;
        // long throws the weapon to the room: strip weapon-derived fields
        // from both sides so the comparison ignores the drop.
        if (weaponDrop) {
            if (side.temp?.apply) { delete side.temp.apply.damage; delete side.temp.apply.dodge; }
            if (side.temp) delete side.temp.weapon;
            delete side.weapon; delete side.weapon_damage; delete side.weapon_flag;
            delete side.weapon_details;
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

// Support set union across a percent range (po uses random(15)+80).
function supportRange(input, percentRange, actor, target, directType) {
    const out = [];
    const [lo, hi] = Array.isArray(percentRange) ? percentRange : [percentRange, percentRange];
    for (let p = lo; p <= hi; p++)
        out.push(...slice2SupportSet(input, p, actor, target, directType));
    return out;
}

// Compose sequential do_damage support sets across stages with percent ranges
// (xian three independent strikes). Each stage's outcomes become the next
// stage's starting qi/eff_qi.
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

export function validateB4Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B4 entry');
    assert.equal(p.collection_group, 'b4-perform');
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
    if (cfg.kind === 'direct' && cfg.stages) return validateB4MultiDirect(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'direct') return validateB4Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB4Control(raw, condition, cfg, p, b, t, a, v);
    return validateB4Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB4Direct(raw, condition, cfg, p, b, t, a, v) {
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
    // duo sets block_msg/all; po sets no_perform via the final callback.
    if (cfg.hitBuff) assert.equal(temp(v, cfg.hitBuff), 1, cfg.hitBuff + ' applied');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        allowDerived(e, a);
    }, { weaponDrop: cfg.weaponDrop });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
        if (cfg.hitBuff) {
            e.temp = copy(v.temp ?? {});
            // stableState strips block_msg as a transient flag from both sides.
            delete e.temp.block_msg;
        }
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB4MultiDirect(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const n = directs.length;
    assert.ok(n <= cfg.maxDirects, 'at most maxDirects do_damage');
    assert.equal(sparse(raw.metrics[0], 'direct'), n, 'direct count');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    assert.equal(b.neili - a.neili, cfg.fee, 'fixed fee');
    assert.equal(num(a.busy), cfg.meBusy, 'me busy');
    for (const d of directs) {
        assert.equal(d.actor, 0); assert.equal(d.target, 1);
        assert.ok(num(d.damage) > 0, 'positive damage input');
    }
    assertLearnGain(a, p.skill);
    if (n === 0) {
        stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    // Each stage damages qi/eff_qi; the final state must show net damage.
    assert.ok(v.qi <= t.qi && v.eff_qi <= t.eff_qi, 'target qi reduced');
    stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
    });
    return { accepted: true, kind: 'direct', hit: true, directs: n };
}

function validateB4Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'fixed fee');
    assert.equal(b.neili - a.neili, cfg.fee, 'no extra deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    const hit = tBusy > 0;
    if (hit) {
        if (cfg.ability === 'gui') {
            // ap = raw pixie-jian level * 2; target busy = ap/45 + 2.
            const ap = num(sparse(b.skills, cfg.skill)) * 2;
            assert.equal(tBusy, Math.trunc(ap / 45) + 2, 'gui target busy');
            assert.equal(busyAfter, cfg.hitMeBusy, 'gui me busy on hit');
        } else if (cfg.ability === 'jie') {
            // random(level) > parry/2 hit; target busy = level/22 + 2.
            const level = num(sparse(b.skills, cfg.skill));
            assert.equal(tBusy, Math.trunc(level / 22) + 2, 'jie target busy');
            assert.equal(busyAfter, 0, 'jie no me busy on hit');
        } else assert.fail('unknown control ability');
    } else {
        assert.equal(tBusy, 0, 'no target busy on miss');
        assert.equal(busyAfter, cfg.missMeBusy, 'me busy on miss');
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; allowDerived(e, a); });
    stableState(t, v, e => { e.busy = v.busy; });
    return { accepted: true, kind: 'control', hit };
}

function validateB4Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    const fee = b.neili - a.neili;
    assert.equal(directs.length, 0, 'combo has no directs');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    assert.equal(fee, cfg.fee, 'combo fee');
    assert.equal(attacks.length, cfg.comboAttacks, 'combo attack count');
    assert.ok(num(a.busy) >= cfg.comboBusyMin && num(a.busy) <= cfg.comboBusyMax,
        'combo busy range');
    for (const at of attacks) assert.ok([0, -1, -2].includes(at.result));
    // pi adds temp apply/{attack,damage,unarmed_damage}; lian adds apply/attack.
    // add_temp(+count) then add_temp(-count) restores the prior value.
    const keys = cfg.applyKeys ?? ['attack'];
    for (const key of keys)
        assert.equal(temp(a, 'apply/' + key), temp(b, 'apply/' + key),
            'temp ' + key + ' restored to prior value');
    assertLearnGain(a, p.skill);
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

export function b4Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB4Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
