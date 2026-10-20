// School representative slice batch 5 (henshan/songshan/lingxiao/tianlongsi).
// Finite reviewed conditions only; no game-code writes and no balance claims.
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
    henshan: {
        skill: 'henshan-jian', ability: 'huan', usage: 'sword',
        grant: 'can_perform/henshan-jian/huan', forceSkill: 'henshan-xinfa',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '衡山派',
        title: '衡山剑法「幻剑式」', directType: 'WEAPON', percent: 10, baseLevel: 250,
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你衡山剑法不够娴熟，难以施展「幻剑式」。\n' },
            // query_skill("force") is the mapped effective force (no raw flag).
            { key: 'force', pair: [79, 80], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「幻剑式」。\n' },
            { key: 'neili', pair: [49, 50], field: 'neili',
                refusal: '你现在的真气不够，难以施展「幻剑式」。\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = sword_eff, dp = target parry);
        // damage = ap/3+random(ap/2); do_damage WEAPON percent 10;
        // fee 50, me busy 2. miss: fee 30, me busy 2.
        feeHit: 50, feeMiss: 30, hitBusy: 2, missBusy: 2,
        learnGate: { field: 'max_neili', pair: [79, 80], property: true,
            refusal: '你目前的内力修为不够，没有办法练衡山剑法。\n' },
    },
    songshan: {
        skill: 'songshan-quan', ability: 'chui', usage: 'cuff',
        grant: 'can_perform/songshan-quan/chui', forceSkill: 'songshan-xinfa',
        kind: 'direct', weapon: null, prepared: 'cuff', family: '嵩山派',
        title: '嵩山拳法「千斤锤」', directType: 'UNARMED', percent: 35, baseLevel: 250,
        gates: [
            { key: 'level', pair: [29, 30], field: 'skill',
                refusal: '你嵩山拳法不够娴熟，难以施展「千斤锤」。\n' },
            { key: 'force', pair: [39, 40], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展「千斤锤」。\n' },
            { key: 'neili', pair: [119, 120], field: 'neili',
                refusal: '你现在的真气不够，难以施展「千斤锤」。\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = cuff_eff, dp = target parry);
        // damage = skill_raw+random(skill_raw/2); do_damage UNARMED percent 35;
        // fee 100, me busy 2+random(2)=[2,3]. miss: fee 30, me busy 2+random(3)=[2,4].
        feeHit: 100, feeMiss: 30, hitBusy: [2, 3], missBusy: [2, 4],
        learnGate: { field: 'max_neili', pair: [199, 200], property: true,
            refusal: '你的内力修为太弱，无法练嵩山拳法。\n' },
    },
    lingxiao: {
        skill: 'lingxiao-quan', ability: 'jue', usage: 'cuff',
        grant: 'can_perform/lingxiao-quan/jue', forceSkill: 'xueshan-neigong',
        kind: 'direct', weapon: null, prepared: 'cuff', family: '凌霄城',
        title: '凌霄拳法「凌宵总诀」', directType: 'UNARMED', percent: 20, baseLevel: 250,
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你的凌霄拳法不够娴熟，难以施展「凌宵总诀」。\n' },
            { key: 'force', pair: [99, 100], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展「凌宵总诀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在真气不够，难以施展「凌宵总诀」。\n' },
        ],
        // hit: random(cuff_eff) > target dodge_eff/2 (non-standard predicate);
        // damage = cuff_eff/2+random(cuff_eff/2); do_damage UNARMED percent 20;
        // fee 50, me busy 2. miss: fee 30, me busy 3. Only checks main-hand
        // weapon (not secondary_weapon).
        feeHit: 50, feeMiss: 30, hitBusy: 2, missBusy: 3,
        learnGate: { field: 'effective-force', pair: [29, 30],
            refusal: '你的内功火候不够，无法学凌霄拳法。\n' },
    },
    tianlongsi: {
        skill: 'sun-finger', ability: 'qiankun', usage: 'finger',
        // No can_perform authorization gate (qiankun.c has no userp grant check).
        grant: null, forceSkill: 'duanshi-xinfa',
        kind: 'direct', weapon: null, prepared: 'finger', family: '大理段家',
        title: '一阳指「一指乾坤」', directType: 'UNARMED', percent: 66, baseLevel: 250,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的一阳指修为不够，目前还不能施展一指乾坤绝技！\n' },
            { key: 'force', pair: [159, 160], field: 'effective-force',
                refusal: '你内功火候不够，难以施展一指乾坤！\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你的真气不够，无法施展「一指乾坤」！\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = finger_eff+force_eff,
        // dp = target parry+target force); damage = ap/3+random(ap/4);
        // do_damage UNARMED percent 66; fee 200, me busy 1.
        // miss: fee 50, me busy 3.
        feeHit: 200, feeMiss: 50, hitBusy: 1, missBusy: 3,
        // valid_learn first gate is gender=男性 (fixture must be male);
        // str>=34 and dex>=30 also required. learnGate samples str boundary.
        gender: '男性',
        learnGate: { field: 'str', pair: [33, 34], property: true,
            refusal: '你的先天膂力孱弱，无法领会一阳指。\n' },
    },
};

export const slice5SourcePaths = [
    'kungfu/class/henshan/henshan.h', 'kungfu/class/songshan/songshan.h',
    'kungfu/class/lingxiao/lingxiao.h', 'kungfu/class/tianlongsi/ben.h',
    'kungfu/skill/henshan-jian.c', 'kungfu/skill/henshan-jian/huan.c',
    'kungfu/skill/songshan-quan.c', 'kungfu/skill/songshan-quan/chui.c',
    'kungfu/skill/lingxiao-quan.c', 'kungfu/skill/lingxiao-quan/jue.c',
    'kungfu/skill/sun-finger.c', 'kungfu/skill/sun-finger/qiankun.c',
    'kungfu/skill/henshan-xinfa.c', 'kungfu/skill/songshan-xinfa.c',
    'kungfu/skill/xueshan-neigong.c', 'kungfu/skill/duanshi-xinfa.c',
    'kungfu/skill/sword.c', 'kungfu/skill/cuff.c', 'kungfu/skill/finger.c',
    'kungfu/skill/force.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c', 'cmds/skill/learn.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attack.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'feature/equip.c', 'feature/name.c', 'feature/condition.c',
    'clone/user/user.c', 'inherit/char/char.c', 'inherit/weapon/sword.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const slice5ReviewedSourceHash = '1761fd33d8dfba37635cc6ef9e04a7a191ff53d93e6833063f184eddb3f49b7b';

export function slice5SupportSet(input, percent, actor, target, directType = 'WEAPON') {
    // Reuse the slice-2 combatd do_damage support model (WEAPON/UNARMED/REMOTE).
    return slice2SupportSet(input, percent, actor, target, directType);
}

export function slice5Conditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(slice5SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (slice5ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), slice5ReviewedSourceHash,
            'Reviewed slice-5 sources changed; re-review before sampling');
    const result = [];
    for (const [dir, cfg] of Object.entries(schools)) {
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${cfg.ability}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`);
        assert.equal(ability?.path, `kungfu/skill/${cfg.skill}/${cfg.ability}.c`);
        assert.equal(base.sha256, source_evidence[base.path]);
        assert.equal(ability.sha256, source_evidence[ability.path]);
        const performEntry = ability.entries.find(e => e.role === 'perform')?.id;
        assert.ok(performEntry?.startsWith(ability.path + ':'), dir);
        const learnEntry = base.entries.find(e => e.function === 'valid_learn')?.id;
        assert.ok(learnEntry?.startsWith(base.path + ':'), dir);
        const group = `slice5-${dir}`;
        const usage = cfg.usage, grant = cfg.grant;
        const actorSkills = level => {
            const skills = { [usage]: level, [cfg.skill]: level, force: level,
                [cfg.forceSkill]: level, dodge: level, parry: level };
            return skills;
        };
        function add(method, variant, extra = {}) {
            const level = extra.level ?? cfg.baseLevel ?? 200;
            const skills = { ...actorSkills(level), ...extra.skills };
            for (const [k, v] of Object.entries(skills)) if (v === undefined) delete skills[k];
            const properties = { ...defaults, 'family/family_name': cfg.family,
                ...(grant ? { [grant]: 1 } : {}),
                ...(cfg.gender ? { gender: cfg.gender } : {}),
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
                    qualification_sources: [...slice5SourcePaths],
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
        // henshan dp = target parry; songshan dp = target parry;
        // lingxiao random(cuff) > target dodge/2 (bias via dodge);
        // tianlongsi dp = target parry+target force.
        if (dir === 'lingxiao') {
            add('perform', 'hit', { targetDodge: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetDodge: 100000, samples: smoke ? 1 : 4 });
        } else if (dir === 'tianlongsi') {
            add('perform', 'hit', { targetParry: 0, targetForce: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetParry: 100000, samples: smoke ? 1 : 4 });
        } else {
            add('perform', 'hit', { targetParry: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetParry: 100000, samples: smoke ? 1 : 4 });
        }
        // Qualification boundary pairs (低/高一档).
        for (const gate of cfg.gates) {
            const [low, high] = gate.pair;
            const edit = value => gate.field === 'skill' ? { skills: { [cfg.skill]: value } }
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

export function validateSlice5Record(raw, condition) {
    const p = condition.parameters, cfg = schools[p.school];
    assert.ok(cfg, 'known school slice');
    assert.equal(p.collection_group, 'slice5-' + p.school);
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
    // Gender coverage: tianlongsi valid_learn requires 男性.
    if (cfg.gender) {
        const actorGender = b.gender ?? cfg.gender;
        assert.equal(actorGender, cfg.gender, `${p.school} gender gate`);
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
    return validateSlice5Direct(raw, condition, cfg, p, b, t, a, v);
}

function assertBusy(cfg, busyAfter, miss) {
    if (miss) {
        const want = cfg.missBusy;
        if (Array.isArray(want))
            assert.ok(busyAfter >= want[0] && busyAfter <= want[1], `miss busy in ${want[0]}..${want[1]}`);
        else assert.equal(busyAfter, want, 'miss busy');
        return;
    }
    const want = cfg.hitBusy;
    if (Array.isArray(want))
        assert.ok(busyAfter >= want[0] && busyAfter <= want[1], `hit busy in ${want[0]}..${want[1]}`);
    else assert.equal(busyAfter, want, 'hit busy');
}

function validateSlice5Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    assertLearnGain(a, p.skill);
    const miss = directs.length === 0;
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    assert.equal(b.neili - a.neili, fee, `${p.school} branch fee`);
    assertBusy(cfg, num(a.busy), miss);
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'single direct');
    const input = num(directs[0].damage);
    const support = slice5SupportSet(input, cfg.percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
    });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi;
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

export function slice5Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateSlice5Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return { counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
