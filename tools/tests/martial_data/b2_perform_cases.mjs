// B2 shared Honghua x Mingjiao x Shenlong x Wudang perform batch (10 taiji
// moves). One collection settles four families' perform coverage. Finite
// reviewed conditions only; no game-code writes and no balance claims.
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

const families = ['红花会', '明教', '神龙教', '武当'];

export const b2SourcePaths = [
    'kungfu/skill/taiji-jian.c', 'kungfu/skill/taiji-jian/chan.c',
    'kungfu/skill/taiji-jian/jia.c', 'kungfu/skill/taiji-jian/sui.c',
    'kungfu/skill/taiji-jian/zhenwu.c', 'kungfu/skill/taiji-jian/zhuan.c',
    'kungfu/skill/taiji-quan.c', 'kungfu/skill/taiji-quan/ji.c',
    'kungfu/skill/taiji-quan/tu.c', 'kungfu/skill/taiji-quan/yin.c',
    'kungfu/skill/taiji-quan/zhan.c', 'kungfu/skill/taiji-quan/zhen.c',
    'kungfu/skill/taiji-shengong.c', 'kungfu/skill/taoism.c',
    'kungfu/skill/tiyunzong.c',
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
export const b2ReviewedSourceHash = '45efd476ad978d6079cf518c2b885963b1aafa05658039a0c0549caafbddb9bb';

// Query skill gates use raw (field 'skill') or effective (field 'effective-*')
// values exactly as each perform reads them.
const schools = {
    'taiji-jian/chan': {
        skill: 'taiji-jian', ability: 'chan', usage: 'sword',
        grant: 'can_perform/taiji-jian/chan', forceSkill: 'taiji-shengong',
        kind: 'control', weapon: 'sword', prepared: 'sword',
        title: '太极剑「缠字诀」', fee: 30,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的太极剑法不够娴熟，难以施展「缠字诀」。\n' },
            { key: 'neili', pair: [59, 60], field: 'neili',
                refusal: '你现在真气不够，难以施展「缠字诀」。\n' },
        ],
    },
    'taiji-jian/jia': {
        skill: 'taiji-jian', ability: 'jia', usage: 'sword',
        grant: 'can_perform/taiji-jian/jia', forceSkill: 'taiji-shengong',
        kind: 'direct', weapon: 'sword', prepared: 'sword',
        title: '太极剑「驾字诀」', directType: 'WEAPON', percent: 10,
        dpSkills: ['parry'], feeHit: 80, feeMiss: 60, hitBusy: 1, missBusy: 3,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的太极剑法等级不够，难以施展「驾字诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「驾字诀」。\n' },
        ],
    },
    'taiji-jian/sui': {
        skill: 'taiji-jian', ability: 'sui', usage: 'sword',
        grant: 'can_perform/taiji-jian/sui', forceSkill: 'taiji-shengong',
        kind: 'buff', weapon: 'sword', prepared: 'sword',
        title: '太极剑「随字诀」', fee: 100, meBusy: 3, buff: 'tjj_sui',
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的太极剑法不够娴熟，难以施展「随字诀」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「随字诀」。\n' },
        ],
    },
    'taiji-jian/zhenwu': {
        skill: 'taiji-jian', ability: 'zhenwu', usage: 'sword',
        grant: 'can_perform/taiji-jian/zhenwu', forceSkill: 'taiji-shengong',
        kind: 'direct', weapon: 'sword', prepared: 'sword',
        title: '太极剑「真武除邪」', directType: 'WEAPON', percent: 85,
        dpSkills: ['parry'], feeHit: 50, feeMiss: 50, hitBusy: 2, missBusy: 2,
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的太极剑法不够娴熟，难以施展「真武除邪」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，难以施展「真武除邪」。\n' },
        ],
    },
    'taiji-jian/zhuan': {
        skill: 'taiji-jian', ability: 'zhuan', usage: 'sword',
        grant: 'can_perform/taiji-jian/zhuan', forceSkill: 'taiji-shengong',
        kind: 'combo', weapon: 'sword', prepared: 'sword',
        title: '太极剑「剑轮岚转」', comboAttacks: 5,
        dpSkills: ['parry'],
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的太极剑法不够娴熟，难以施展「剑轮岚转」。\n' },
            { key: 'neili', pair: [249, 250], field: 'neili',
                refusal: '你的真气不够，难以施展「剑轮岚转」。\n' },
        ],
    },
    'taiji-quan/ji': {
        skill: 'taiji-quan', ability: 'ji', usage: 'unarmed',
        grant: 'can_perform/taiji-quan/ji', forceSkill: 'taiji-shengong',
        kind: 'direct', weapon: null, prepared: 'unarmed',
        title: '太极拳「挤字诀」', directType: 'REMOTE', percent: 0,
        dpSkills: ['parry'], feeHit: 30, feeMiss: 10, hitBusy: 2, missBusy: 4,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的太极拳等级不够，难以施展「挤字诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「挤字诀」。\n' },
        ],
    },
    'taiji-quan/tu': {
        skill: 'taiji-quan', ability: 'tu', usage: 'unarmed',
        grant: 'can_perform/taiji-quan/tu', grantValue: 10,
        forceSkill: 'taiji-shengong',
        kind: 'direct', weapon: null, prepared: 'unarmed',
        title: '太极拳「太极图」', receiveOnly: true,
        dpSkills: ['force', 'taoism'],
        feeNeili: 1000, feeJingli: 1000, meBusy: 4,
        gates: [
            { key: 'level', pair: [249, 250], field: 'skill',
                refusal: '你的太极拳不够娴熟，难以施展「太极图」。\n' },
            { key: 'shengong', pair: [299, 300], field: 'skill', skillName: 'taiji-shengong',
                refusal: '你的太极神功修为还不够高，难以施展「太极图」。\n' },
            { key: 'taoism', pair: [299, 300], field: 'skill', skillName: 'taoism',
                refusal: '你的道学心法修为还不够高，难以施展「太极图」。\n' },
            { key: 'jingli', pair: [999, 1000], field: 'jingli',
                refusal: '你现在精力不够，难以施展「太极图」。\n' },
            { key: 'neili', pair: [999, 1000], field: 'neili',
                refusal: '你现在真气不够，难以施展「太极图」。\n' },
        ],
    },
    'taiji-quan/yin': {
        skill: 'taiji-quan', ability: 'yin', usage: 'unarmed',
        grant: 'can_perform/taiji-quan/yin', forceSkill: 'taiji-shengong',
        kind: 'direct', weapon: null, prepared: 'unarmed',
        title: '太极拳「引字诀」', directType: 'UNARMED', percent: 0,
        dpSkills: ['parry'], feeHit: 80, feeMiss: 60, hitBusy: 1, missBusy: 3,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的太极拳等级不够，难以施展「引字诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「引字诀」。\n' },
        ],
    },
    'taiji-quan/zhan': {
        skill: 'taiji-quan', ability: 'zhan', usage: 'unarmed',
        grant: 'can_perform/taiji-quan/zhan', forceSkill: 'taiji-shengong',
        kind: 'direct', weapon: null, prepared: 'unarmed',
        title: '太极拳「粘字诀」', directType: 'UNARMED', percent: 20,
        dpSkills: ['parry'], feeHit: 30, feeMiss: 10, hitBusy: 2, missBusy: 3,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的太极拳等级不够，难以施展「粘字诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「粘字诀」。\n' },
        ],
    },
    'taiji-quan/zhen': {
        skill: 'taiji-quan', ability: 'zhen', usage: 'unarmed',
        grant: 'can_perform/taiji-quan/zhen', forceSkill: 'taiji-shengong',
        kind: 'direct', weapon: null, prepared: 'unarmed',
        title: '太极拳「震字诀」', directType: 'UNARMED', percent: 50,
        dpSkills: ['force'], feeHit: 50, feeMiss: 50, hitBusy: 3, missBusy: 3,
        gates: [
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的太极拳等级不够，难以施展「震字诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「震字诀」。\n' },
        ],
    },
};

export const b2Schools = schools;

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
        case 'jingli': return { properties: { jingli: value } };
        case 'shen': return { properties: { shen: value } };
        case 'str': return { properties: { str: value } };
        case 'dex': return { properties: { dex: value - 20 } };
        case 'effective-force': return { skills: { force: 0, [cfg.forceSkill]: value } };
        default: return { skills: { [gate.field]: value } };
    }
};

export function b2PerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(b2SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (b2ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), b2ReviewedSourceHash,
            'Reviewed B2 sources changed; re-review before sampling');
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
                'tiyunzong': 200, 'martial-cognize': 200, taoism: level,
            };
            if (cfg.usage === 'sword') skills.sword = 200;
            if (cfg.usage === 'unarmed') skills.unarmed = 200;
            for (const [k, v] of Object.entries(floor.skills))
                skills[k] = Math.max(skills[k] ?? 0, v);
            Object.assign(skills, extra.skills);
            for (const [k, v] of Object.entries(skills)) if (v === undefined) delete skills[k];
            const properties = {
                ...defaults, 'family/family_name': '武当',
                ...(cfg.grant ? { [cfg.grant]: cfg.grantValue ?? 1 } : {}),
            };
            for (const [k, v] of Object.entries(floor.properties))
                properties[k] = Math.max(properties[k] ?? 0, v);
            Object.assign(properties, extra.properties);
            const actor = {
                skills,
                mappings: { force: cfg.forceSkill, dodge: 'tiyunzong', [cfg.usage]: cfg.skill,
                    ...extra.mappings },
                preparations: { [cfg.usage]: cfg.skill }, properties,
                ...(cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}),
            };
            const targetTemp = extra.targetTemp ?? cfg.targetTemp;
            const targetEquipment = 'targetEquipment' in extra ? extra.targetEquipment
                : { type: 'sword', hold: false };
            const target = {
                skills: { force: level, dodge: level, parry: level, sword: 200, taoism: level,
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
                id: `b2-${cfg.skill}-${cfg.ability}-${variant}`, stage: 'school',
                entry_id: performEntry, method: 'perform',
                samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: {
                    school: 'b2', family: '武当', families: [...families],
                    collection_group: 'b2-perform', skill: cfg.skill, usage: cfg.usage,
                    ability: cfg.ability, kind: cfg.kind, level, variant, actor, target,
                    named_participants: true, fighting: true, target_state: 'living',
                    action: `perform ${cfg.usage}.${cfg.ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...b2SourcePaths],
                    ability_source: { path: ability.path, sha256: ability.sha256, entry_id: performEntry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}共享批量：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。families为红花会、明教、神龙教与武当四派perform销账，'
                        + '同一样本同时计入四派入口覆盖。即时窗口，不采自然心跳/到期。'
                        + '太极图can_perform≥10且需太极神功/道学双300门槛，随字诀buff有到期回调，'
                        + '驾字诀需目标持器、驾/引需目标非忙，震字诀命中判定为force对force，均按原分支记账。只收集数据，不比较强弱。',
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
        if (cfg.buff)
            add('already-active', { actorTemp: { [cfg.buff]: 1 },
                refusal: '你现在正在施展「随字诀」。\n' });
        if (['chan', 'jia', 'yin'].includes(cfg.ability))
            add('target-busy', { targetBusy: true,
                refusal: '右试弟子目前正自顾不暇，放胆攻击吧。\n' });
        if (cfg.ability === 'jia')
            add('no-weapon', { targetEquipment: null,
                refusal: '对方没有使用兵器，难以施展「驾字诀」。\n' });
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

export function validateB2Record(raw, condition) {
    const p = condition.parameters, cfg = schools[`${p.skill}/${p.ability}`];
    assert.ok(cfg, 'known B2 entry');
    assert.equal(p.collection_group, 'b2-perform');
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
    if (cfg.kind === 'direct') return validateB2Direct(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'control') return validateB2Control(raw, condition, cfg, p, b, t, a, v);
    if (cfg.kind === 'buff') return validateB2Buff(raw, condition, cfg, p, b, t, a, v);
    return validateB2Combo(raw, condition, cfg, p, b, t, a, v);
}

function validateB2Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.equal(sparse(raw.metrics[0], 'direct'), cfg.receiveOnly ? 0 : (directs.length ? 1 : 0), 'direct');
    if (cfg.receiveOnly) {
        assert.deepEqual(directs, [], 'tu uses receive_damage not do_damage');
        const miss = v.qi === t.qi && v.eff_qi === t.eff_qi;
        const fee = cfg.feeNeili;
        assert.equal(b.neili - a.neili, fee, 'neili fee');
        assert.equal(b.jingli - a.jingli, cfg.feeJingli, 'jingli fee');
        assert.equal(num(a.busy), cfg.meBusy, 'busy');
        if (miss) {
            assert.equal(t.neili - v.neili, 200, 'miss neili drain');
            assertLearnGain(a, p.skill);
            stableState(b, a, e => {
                e.neili -= fee; e.jingli -= cfg.feeJingli;
                e.busy = a.busy; e.learned = a.learned;
            });
            stableState(t, v, e => { e.neili = v.neili; });
            return { accepted: true, kind: 'direct', hit: false };
        }
        assert.equal(v.busy, 3, 'hit target busy');
        assert.equal(t.neili - v.neili, 500, 'hit neili drain');
        assert.ok(v.qi <= t.qi && v.jing <= t.jing, 'receive damage applied');
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.neili -= fee; e.jingli -= cfg.feeJingli;
            e.busy = a.busy; e.learned = a.learned;
        });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.busy = v.busy; e.neili = v.neili;
        });
        return { accepted: true, kind: 'direct', hit: true };
    }
    const miss = directs.length === 0;
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
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
    // Taiji performs don't add conditions; qi/eff_qi/jing/eff_jing/busy/neili changes only.
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.busy = v.busy; e.neili = v.neili;
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateB2Control(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'control has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'chan fixed fee');
    assert.equal(b.neili - a.neili, cfg.fee, 'no extra deduction');
    const busyAfter = num(a.busy), tBusy = num(v.busy);
    const hit = tBusy > 0;
    if (hit) {
        assert.equal(busyAfter, 0, 'no me busy on hit');
        assert.equal(tBusy, Math.trunc(num(sparse(b.skills, cfg.skill)) / 16) + 2, 'target busy');
    } else {
        assert.equal(busyAfter, 2, 'me busy on miss');
        assert.equal(tBusy, 0, 'no target busy on miss');
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; });
    stableState(t, v, e => { e.busy = v.busy; });
    return { accepted: true, kind: 'control', hit };
}

function validateB2Buff(raw, condition, cfg, p, b, t, a, v) {
    const cost = sparse(raw.metrics[0], 'neili_cost');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'buff has no direct');
    assert.deepEqual(raw.directs ?? [], []);
    assert.equal(cost, cfg.fee, 'buff fee');
    assert.equal(num(a.busy ?? 0), p.fighting ? cfg.meBusy : 0);
    assert.equal(temp(a, cfg.buff), 1, 'buff flag set');
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
        assert.equal(v[key], t[key], key);
    if (cfg.ability === 'sui') {
        const skill = num(sparse(b.skills, cfg.skill));
        assert.equal(temp(a, 'apply/defense') - temp(b, 'apply/defense'), Math.trunc(skill / 3));
        assert.equal(temp(a, 'apply/attack') - temp(b, 'apply/attack'), -Math.trunc(skill / 6));
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned;
        e.temp.apply = copy(a.temp.apply ?? {});
        e.temp[cfg.buff] = 1;
        allowDerived(e, a);
    });
    stableState(t, v);
    return { accepted: true, kind: 'buff' };
}

function validateB2Combo(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'combo has no directs');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    // zhuan: 5-10 attacks; fee = attack_time*20 and the loop may stop early
    // when the fight ends, so the fee may exceed attacks.length*20.
    const fee = b.neili - a.neili;
    assert.ok(attacks.length >= 1 && attacks.length <= 10, 'zhuan attack window');
    assert.equal(fee % 20, 0, 'zhuan fee tracks 20 per planned attack');
    assert.ok(fee / 20 >= attacks.length && fee / 20 >= 5 && fee / 20 <= 10,
        'zhuan planned attack count bounds the fee');
    assert.ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(num(a.busy)));
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

export function b2Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateB2Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return {
        counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
