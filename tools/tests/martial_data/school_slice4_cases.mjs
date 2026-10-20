// School representative slice batch 4 (xueshan/xuedao/riyue/jueqing). Finite
// reviewed conditions only; no game-code writes and no balance claims.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 40, con: 36, dex: 34, shen: 0, gender: '男性', character: '光明磊落' };

const schools = {
    xueshan: {
        skill: 'xueshan-jian', ability: 'feng', usage: 'sword',
        grant: 'can_perform/xueshan-jian/feng', forceSkill: 'xueshan-neigong',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '凌霄城',
        title: '雪山剑法「剑气封喉」', directType: 'WEAPON', percent: 90, baseLevel: 250,
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的雪山剑法修为不够，难以施展「剑气封喉」。\n' },
            // query_skill("force") is the mapped effective force (no raw flag).
            { key: 'force', pair: [239, 240], field: 'effective-force',
                refusal: '你的内功的修为不够，难以施展「剑气封喉」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「剑气封喉」。\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = sword_eff+force_eff, dp = target
        // dodge_eff+parry_eff); damage = ap/3+random(ap/3); do_damage WEAPON
        // percent 90; fee 100, me busy 2. miss: fee 50, me busy 3.
        feeHit: 100, feeMiss: 50, hitBusy: 2, missBusy: 3,
        learnGate: { field: 'effective-force', pair: [149, 150],
            refusal: '你的内功火候不到，无法学习雪山剑法。\n' },
    },
    xuedao: {
        skill: 'xuedao-dafa', ability: 'xue', usage: 'blade',
        abilityPath: 'perform/xue', grant: 'can_perform/xuedao-dafa/xue', forceSkill: 'xuedao-dafa',
        kind: 'direct', weapon: 'blade', prepared: 'blade', family: '血刀门',
        title: '血刀大法「祭血神刀」', directType: 'WEAPON', percent: 80, baseLevel: 250,
        gates: [
            // Self-mapping fold: force+blade both map to xuedao-dafa, so the
            // raw-skill refusal is unreachable (force check runs first and the
            // folded effective force tracks the skill level). The level pair
            // therefore straddles the force threshold and uses the force text.
            { key: 'level', pair: [219, 220], field: 'skill', fold: true,
                refusal: '你的内功火候不够，难以施展「祭血神刀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你目前真气不足，难以施展「祭血神刀」。\n' },
        ],
        // hit: ap/2+random(ap) > target parry_eff (ap = blade_eff);
        // damage = ap+random(ap/2); do_damage WEAPON percent 80;
        // fee 150, me busy 2. miss: fee 100, me busy 2. Both branches end with
        // receive_wound("qi", 50) on the actor (eff_qi then qi clamp).
        feeHit: 150, feeMiss: 100, hitBusy: 2, missBusy: 2, selfWound: 50,
        character: '心狠手辣',
        learnGate: { field: 'str', pair: [27, 28],
            refusal: '你先天膂力孱弱，无法修炼血刀大法。\n' },
    },
    riyue: {
        skill: 'kuihua-mogong', ability: 'bian', usage: 'sword',
        abilityPath: 'perform/bian',
        // Cross-skill authorization: the grant lives on pixie-jian, not on
        // kuihua-mogong itself.
        grant: 'can_perform/pixie-jian/po', forceSkill: 'kuihua-mogong',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '日月神教',
        title: '葵花魔功「无边无际」', directType: 'REMOTE', percent: 90, baseLevel: 300,
        gates: [
            { key: 'level', pair: [259, 260], field: 'skill',
                refusal: '你的葵花魔功不够娴熟，难以施展「无边无际」。\n' },
            { key: 'max_neili', pair: [3699, 3700], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「无边无际」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「无边无际」。\n' },
        ],
        // hit: ap*3/5+random(ap) > dp (ap = skill_raw+dodge_eff, dp = target
        // martial-cognize raw + dodge_eff); damage = ap+random(ap); do_damage
        // REMOTE percent 90 with final that sets target temp no_perform;
        // fee 200, me busy 2. miss: fee 150, me busy 3.
        feeHit: 200, feeMiss: 150, hitBusy: 2, missBusy: 3,
        character: '心狠手辣',
        learnGate: { field: 'dex', pair: [37, 38],
            refusal: '你觉得自己的身法不够灵动，不可能掌握这么飘缈玄奇的葵花魔功。\n' },
    },
    jueqing: {
        skill: 'jueqing-jian', ability: 'liu', usage: 'sword',
        grant: 'can_perform/jueqing-jian/liu', forceSkill: 'jueqing-xinfa',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '绝情谷',
        title: '绝情剑法「流水无情」', directType: 'WEAPON', percent: 24, baseLevel: 250,
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你绝情剑法不够娴熟，难以施展「流水无情」。\n' },
            { key: 'force', pair: [79, 80], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「流水无情」。\n' },
            { key: 'neili', pair: [59, 60], field: 'neili',
                refusal: '你现在的真气不够，难以施展「流水无情」。\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = skill raw, dp = target parry raw);
        // damage = ap+random(ap/4); do_damage WEAPON percent 24;
        // fee 60, me busy 1+random(2). miss: fee 30, me busy 2.
        feeHit: 60, feeMiss: 30, hitBusy: [1, 2], missBusy: 2,
        learnGate: { field: 'max_neili', pair: [99, 100], property: true,
            refusal: '你目前的内力修为不够，没有办法练绝情剑法。\n' },
    },
};

export const slice4SourcePaths = [
    'kungfu/class/xueshan/xueshan.h', 'kungfu/class/xuedao/xuedao.h',
    'kungfu/class/riyue/riyue.h', 'kungfu/class/jueqing/jueqing.h',
    'kungfu/skill/xueshan-jian.c', 'kungfu/skill/xueshan-jian/feng.c',
    'kungfu/skill/xuedao-dafa.c', 'kungfu/skill/xuedao-dafa/perform/xue.c',
    'kungfu/skill/kuihua-mogong.c', 'kungfu/skill/kuihua-mogong/perform/bian.c',
    'kungfu/skill/jueqing-jian.c', 'kungfu/skill/jueqing-jian/liu.c',
    // xuedao-dafa and kuihua-mogong double as their own force skill.
    'kungfu/skill/xueshan-neigong.c', 'kungfu/skill/jueqing-xinfa.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c', 'kungfu/skill/force.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/parry.c', 'kungfu/skill/unarmed.c',
    'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c', 'cmds/skill/learn.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attack.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'feature/equip.c', 'feature/name.c', 'feature/condition.c',
    'clone/user/user.c', 'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/weapon/blade.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const slice4ReviewedSourceHash = '938ab04234711c65fc78b42020e34531cdc618f420ad9645dc957587922e0d6e';

export function slice4SupportSet(input, percent, actor, target, directType = 'WEAPON') {
    // Reuse the slice-2 combatd do_damage support model (WEAPON/UNARMED/REMOTE).
    return slice2SupportSet(input, percent, actor, target, directType);
}

export function slice4Conditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(slice4SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (slice4ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), slice4ReviewedSourceHash,
            'Reviewed slice-4 sources changed; re-review before sampling');
    const result = [];
    for (const [dir, cfg] of Object.entries(schools)) {
        // xuedao/riyue abilities live under a perform/ subdirectory.
        const abilityKey = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${abilityKey}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`);
        assert.equal(ability?.path, `kungfu/skill/${cfg.skill}/${abilityKey}.c`);
        assert.equal(base.sha256, source_evidence[base.path]);
        assert.equal(ability.sha256, source_evidence[ability.path]);
        const performEntry = ability.entries.find(e => e.role === 'perform')?.id;
        assert.ok(performEntry?.startsWith(ability.path + ':'), dir);
        const learnEntry = base.entries.find(e => e.function === 'valid_learn')?.id;
        assert.ok(learnEntry?.startsWith(base.path + ':'), dir);
        const group = `slice4-${dir}`;
        const usage = cfg.usage, grant = cfg.grant;
        const actorSkills = level => {
            const skills = { [usage]: level, [cfg.skill]: level, force: level,
                [cfg.forceSkill]: level, dodge: level, parry: level };
            // riyue valid_learn needs martial-cognize and the five basics
            // (unarmed/sword/dodge/parry/force) at least at the skill level.
            if (dir === 'riyue') {
                skills.unarmed = level;
                skills['martial-cognize'] = level;
            }
            return skills;
        };
        function add(method, variant, extra = {}) {
            const level = extra.level ?? cfg.baseLevel ?? 200;
            const skills = { ...actorSkills(level), ...extra.skills };
            for (const [k, v] of Object.entries(skills)) if (v === undefined) delete skills[k];
            const properties = { ...defaults, 'family/family_name': cfg.family, [grant]: 1,
                ...(cfg.character ? { character: cfg.character } : {}),
                ...extra.properties };
            const actor = { skills, mappings: { force: cfg.forceSkill, [usage]: cfg.skill },
                preparations: cfg.prepared ? { [cfg.prepared]: cfg.skill } : {},
                properties, ...(cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}) };
            const target = {
                skills: {
                    force: extra.targetForce ?? level,
                    dodge: extra.targetDodge ?? level,
                    parry: extra.targetParry ?? level,
                },
                mappings: {}, preparations: {},
                properties: { ...defaults, ...(extra.targetProperties ?? {}) },
                ...(extra.targetEquipment ? { equipment: extra.targetEquipment } : {}) };
            const entry_id = method === 'interface' ? learnEntry : method === 'ordinary' ? base.path : performEntry;
            result.push({ id: `school-${group}-${method}-${variant}`, stage: 'school', entry_id,
                method, samples: smoke ? (extra.refusal ? 1 : 2) : (extra.refusal ? 2 : extra.samples ?? samples),
                parameters: { school: dir, collection_group: group, skill: cfg.skill, usage,
                    ability: method === 'perform' ? cfg.ability : method === 'ordinary' ? 'ordinary' : 'valid_learn',
                    level, variant, actor, target, named_participants: true,
                    fighting: extra.noFight ? false : method === 'interface' ? false : true,
                    target_state: 'living',
                    action: method === 'perform' ? `perform ${usage}.${cfg.ability} right`
                        : method === 'interface' ? 'test_interface' : 'ordinary',
                    ...(method === 'interface' ? { interface: { object: `/kungfu/skill/${cfg.skill}`, function: 'valid_learn' } } : {}),
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                    refusal_scope: extra.refusal ? (extra.commandScope ? 'command' : 'ability') : '',
                    not_applicable: '', source_evidence: { ...source_evidence },
                    qualification_sources: [...slice4SourcePaths],
                    ability_source: { path: method === 'interface' ? base.path : method === 'ordinary' ? base.path : ability.path,
                        sha256: source_evidence[method === 'interface' || method === 'ordinary' ? base.path : ability.path],
                        entry_id },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}代表切片：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。即时窗口，不采自然心跳/到期。'
                        + '目标为固定高资源靶；直伤类按 combatd 原支持集校验。'
                        + '只收集数据，不比较强弱、不作平衡结论。',
                } });
        }
        // Ordinary + perform baselines: random outcomes need 100 samples.
        const baseLevel = cfg.baseLevel ?? 200;
        add('ordinary', `baseline-l${baseLevel}`, { samples: smoke ? 1 : samples });
        add('perform', `baseline-l${baseLevel}`, { samples: smoke ? 1 : samples });
        // Branch-bias pairs. Each school steers its own hit/miss predicate:
        // xueshan dp = target dodge+parry; xuedao dp = target parry;
        // riyue dp = target martial-cognize raw + dodge (bias via dodge);
        // jueqing dp = target parry raw.
        if (dir === 'xuedao') {
            add('perform', 'hit', { targetParry: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetParry: 100000, samples: smoke ? 1 : 4 });
        } else if (dir === 'jueqing') {
            add('perform', 'hit', { targetParry: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetParry: 100000, samples: smoke ? 1 : 4 });
        } else {
            add('perform', 'hit', { targetDodge: 0, targetParry: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetDodge: 100000, samples: smoke ? 1 : 4 });
        }
        // Qualification boundary pairs (低/高一档).
        for (const gate of cfg.gates) {
            const [low, high] = gate.pair;
            // xuedao force+blade self-map onto xuedao-dafa: zero raw force so
            // query_skill("force") folds onto the skill level. Under that fold
            // the raw-skill refusal is unreachable (the 220 force check runs
            // first), so the level pair straddles the force threshold and uses
            // the force text.
            const edit = value => gate.field === 'skill'
                ? { skills: { [cfg.skill]: value, ...(gate.fold ? { force: 0 } : {}) } }
                : gate.field === 'neili' ? { properties: { neili: value } }
                : gate.field === 'max_neili' ? { properties: { max_neili: value } }
                : gate.field === 'effective-force' ? { skills: { force: 0, [cfg.forceSkill]: value } }
                : { skills: { [gate.field]: value } };
            add('perform', `gate-${gate.key}-${low}`, { ...edit(low),
                refusal: gate.refusal, samples: 2 });
            add('perform', `gate-${gate.key}-${high}`, { ...edit(high), samples: 2 });
        }
        // valid_learn boundary pair: one low refusal + one acceptance at high.
        const learnGate = cfg.learnGate;
        const learnEdit = value => ['con', 'int', 'dex', 'str'].includes(learnGate.field)
            ? { properties: { [learnGate.field]: value } }
            : learnGate.field === 'effective-force'
                ? { skills: { force: 0, [cfg.forceSkill]: value } }
                : learnGate.property
                    ? { properties: { [learnGate.field]: value } }
                    : learnGate.sameLevel
                        ? { skills: { [learnGate.field]: value, [cfg.skill]: value } }
                        : { skills: { [learnGate.field]: value } };
        add('interface', `learn-${learnGate.field}-${learnGate.pair[0]}`, { ...learnEdit(learnGate.pair[0]),
            refusal: learnGate.refusal, samples: 2 });
        add('interface', `learn-${learnGate.field}-${learnGate.pair[1]}`, { ...learnEdit(learnGate.pair[1]), samples: 2 });
    }
    return result;
}

const copy = v => structuredClone(v);
const num = v => { assert.ok(v === null || (Number.isFinite(v) && Number.isSafeInteger(v)), 'numeric'); return v === null ? 0 : v; };
const sparse = (o, k) => Object.hasOwn(o ?? {}, k) ? num(o[k]) : 0;

function assertActorShape(s) {
    assert.match(s.object ?? '', /^\/tests\/actor#\d+$/);
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(s[k], 1, k);
    for (const k of ['wizardp', 'ghost']) assert.equal(s[k], 0, k);
    assert.ok(['skills', 'mappings', 'preparations', 'learned', 'temp'].every(k => s[k] && typeof s[k] === 'object'));
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

function assertLearnGain(after, skill) {
    const learned = after.learned ?? {};
    for (const k of Object.keys(learned)) assert.equal(k, skill, 'unexpected learned key');
    assert.ok([0, 1].includes(learned[skill] ?? 0), 'original single-use learn gain');
}

export function validateSlice4Record(raw, condition) {
    const p = condition.parameters, cfg = schools[p.school];
    assert.ok(cfg, 'known school slice');
    assert.equal(p.collection_group, 'slice4-' + p.school);
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, condition.method);
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
    // Character coverage: xuedao/riyue require 心狠手辣 (valid_learn gate).
    if (cfg.character) {
        const actorCharacter = b.character ?? b.cultivation?.character ?? cfg.character;
        assert.equal(actorCharacter, cfg.character, `${p.school} character gate`);
    }
    if (condition.method === 'interface') {
        assert.deepEqual(raw.interfaces, [{ ...p.interface, result: accepted ? 1 : 0 }]);
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.attacks, []);
        if (accepted) { assert.ok(raw.reason === '' || raw.reason === null); stableState(b, a); }
        else {
            assert.equal(typeof raw.reason, 'string');
            assert.equal(raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''), p.refusal);
            assert.deepEqual(raw.refusals, []);
            stableState(b, a);
        }
        return { accepted, kind: 'interface' };
    }
    if (condition.method === 'ordinary') {
        assert.equal(raw.attacks.length, 1);
        const at = raw.attacks[0];
        assert.equal(at.actor, 0); assert.equal(at.target, 1); assert.ok([0, -1, -2].includes(at.result));
        assert.ok(num(at.damage) >= 0);
        assertLearnGain(a, p.skill);
        const neiliCost = num(sparse(raw.metrics[0], 'neili_cost'));
        stableState(b, a, e => { e.learned = a.learned; e.neili -= neiliCost; });
        stableState(t, v, e => { e.qi = v.qi; e.eff_qi = v.eff_qi; e.busy = v.busy; e.neili = v.neili; assert.ok(v.busy === null || (Number.isSafeInteger(v.busy) && v.busy >= 0 && v.busy <= 100), 'target busy range'); });
        return { accepted: true, kind: 'ordinary', hit: at.result === 0 };
    }
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
    return validateSlice4Direct(raw, condition, cfg, p, b, t, a, v);
}

function assertBusy(cfg, busyAfter, miss) {
    if (miss) return assert.equal(busyAfter, cfg.missBusy, 'miss busy');
    const want = cfg.hitBusy;
    if (Array.isArray(want))
        assert.ok(busyAfter >= want[0] && busyAfter <= want[1], `hit busy in ${want[0]}..${want[1]}`);
    else assert.equal(busyAfter, want, 'hit busy');
}

function validateSlice4Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    assertLearnGain(a, p.skill);
    const miss = directs.length === 0;
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    assert.equal(b.neili - a.neili, fee, `${p.school} branch fee`);
    assertBusy(cfg, num(a.busy), miss);
    if (p.school === 'xuedao') {
        // receive_wound("qi", 50) on both branches: eff_qi drops, qi clamped.
        const wound = cfg.selfWound;
        assert.equal(b.eff_qi - a.eff_qi, wound, 'xuedao self wound eff_qi');
        assert.equal(a.qi, Math.min(b.qi, a.eff_qi), 'xuedao self wound qi clamp');
    }
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
            if (p.school === 'xuedao') { e.eff_qi -= cfg.selfWound; e.qi = Math.min(e.qi, e.eff_qi); }
        });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'single direct');
    const input = num(directs[0].damage);
    const support = slice4SupportSet(input, cfg.percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    if (p.school === 'riyue') {
        // final() sets target temp no_perform on hit only.
        assert.equal(sparse(v.temp, 'no_perform'), 1, 'riyue final no_perform');
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        if (p.school === 'xuedao') { e.eff_qi -= cfg.selfWound; e.qi = Math.min(e.qi, e.eff_qi); }
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi;
        if (p.school === 'riyue') e.temp = { ...e.temp, no_perform: 1 };
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

export function slice4Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateSlice4Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return { counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
