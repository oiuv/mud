// School representative slice batch 8 (tangmen/xiakedao/yunlong). Finite
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
    tangmen: {
        skill: 'tangmen-throwing', ability: 'hua', usage: 'throwing',
        grant: null, forceSkill: 'biyun-xinfa',
        kind: 'receive', weapon: null, prepared: null, family: '唐门世家',
        title: '唐门暗器「唐花」', directType: null, percent: null, baseLevel: 250,
        hold: true,
        learnSkills: { 'boyun-suowu': 250 },
        gates: [
            { key: 'level', pair: [179, 180], field: 'skill',
                refusal: '你的唐门暗器不够娴熟，难以施展唐花。\n' },
            { key: 'boyun', pair: [179, 180], field: 'boyun-suowu',
                refusal: '你的拨云锁雾不够娴熟，无法施展唐花。\n' },
            // query_skill("force") is the mapped effective force (no raw flag).
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功修为不足，难以施展唐花。\n' },
            { key: 'max_neili', pair: [1199, 1200], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展唐花。\n' },
            { key: 'neili', pair: [149, 150], field: 'neili',
                refusal: '你现在真气不足，难以施展唐花。\n' },
        ],
        // kind=receive: no do_damage. Hit (generic throwing, not "tang hua"):
        // add_amount(-1), damage = throwing*2/3+jiali, weapon hit_ob, then
        // receive_damage qi + receive_wound qi both = damage (wound 100%);
        // busy 2. Miss: target neili -1000 or 0, weapon->move(environment)
        // (dropped), busy 3. Fee 100 on both branches (paid before hit check).
        feeHit: 100, feeMiss: 100, hitBusy: 2, missBusy: 3,
        learnGate: { field: 'dex', pair: [29, 30], property: true,
            refusal: '你的身法不够灵巧，无法学习唐门暗器。\n' },
    },
    xiakedao: {
        skill: 'taixuan-gong', ability: 'hun', abilityPath: 'perform/hun', usage: 'unarmed',
        grant: 'can_perform/taixuan-gong/hun', forceSkill: 'taixuan-gong',
        kind: 'direct', weapon: null, prepared: 'unarmed', family: '侠客岛',
        title: '太玄功「混天一气」', directType: 'UNARMED', percent: 80, baseLevel: 250,
        percentRange: [80, 84],
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你的太玄功还不够娴熟，难以施展「混天一气」。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你的内力不够，难以施展「混天一气」。\n' },
        ],
        // Reverse hit predicate: miss when ap/2+random(ap) < dp, so equality
        // lands on the hit branch. ap = skill_raw*2+con*10+martial-cognize raw;
        // dp = target force + target con*10 + target martial-cognize.
        // percent 80+random(5). Fee 300 then +300 on hit (total 600);
        // start_busy(3) on hit, (2) on miss. Hit also drains target neili by
        // skill+random(skill) and the final callback wounds jing (damage/2 qi
        // damage + damage/3 wound) and busy(1) the target. valid_enable and
        // perform_action_file reject literate. valid_learn int gate 38.
        feeHit: 600, feeMiss: 300, hitBusy: 3, missBusy: 2,
        learnGate: { field: 'int', pair: [37, 38], property: true,
            refusal: '你若有所悟，然而总是有点不明白。\n' },
    },
    yunlong: {
        skill: 'yunlong-jian', ability: 'xian', usage: 'sword',
        grant: null, forceSkill: 'yunlong-shengong',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '云龙门',
        title: '云龙剑法「云龙三现」', directType: 'WEAPON', percent: 30, baseLevel: 250,
        gates: [
            { key: 'level', pair: [49, 50], field: 'skill',
                refusal: '你的云龙剑法不够娴熟，不会使用「云龙三现」！\n' },
            { key: 'force', pair: [119, 120], field: 'effective-force',
                refusal: '你的内功火候不够，不能使用「云龙三现」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在真气不够，不能使用「云龙三现」！\n' },
        ],
        // Non-standard hit: random(me force_eff) > target force_eff/2.
        // Hit steering (target force 0) flakes 1/250 when random() returns 0;
        // validation accepts both branches on steered pairs. damage =
        // force_eff/2+random(force_eff/2); do_damage WEAPON percent 30;
        // fee 180, me busy 2. miss: fee 100, me busy 4.
        feeHit: 180, feeMiss: 100, hitBusy: 2, missBusy: 4,
        learnGate: { field: 'max_neili', pair: [899, 900], property: true,
            refusal: '你的内力不够。\n' },
    },
};

export const slice8SourcePaths = [
    'kungfu/class/tangmen/tangmen.h', 'kungfu/class/yunlong/yunlong.h',
    'kungfu/skill/tangmen-throwing.c', 'kungfu/skill/tangmen-throwing/hua.c',
    'kungfu/skill/taixuan-gong.c', 'kungfu/skill/taixuan-gong/perform/hun.c',
    'kungfu/skill/yunlong-jian.c', 'kungfu/skill/yunlong-jian/xian.c',
    'kungfu/skill/biyun-xinfa.c', 'kungfu/skill/boyun-suowu.c',
    'kungfu/skill/yunlong-shengong.c',
    'kungfu/skill/throwing.c', 'kungfu/skill/unarmed.c', 'kungfu/skill/sword.c',
    'kungfu/skill/force.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c', 'cmds/skill/learn.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attack.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'feature/equip.c', 'feature/name.c', 'feature/condition.c',
    'clone/user/user.c', 'inherit/char/char.c', 'inherit/weapon/sword.c',
    'inherit/weapon/throwing.c', 'inherit/misc/equip.c',
    'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const slice8ReviewedSourceHash = '99c7a753afc624cfaeee5f887061f897fb86077514b76661112e0ff635629b9d';

export function slice8SupportSet(input, percent, actor, target, directType = 'WEAPON',
    percentRange = null) {
    // Reuse the slice-2 combatd do_damage support model (WEAPON/UNARMED/REMOTE).
    // percentRange unions the support sets for each percent in [lo, hi] so
    // xiakedao 80+random(5) accepts any observed tier.
    if (!percentRange) return slice2SupportSet(input, percent, actor, target, directType);
    const out = [];
    for (let p = percentRange[0]; p <= percentRange[1]; p++)
        out.push(...slice2SupportSet(input, p, actor, target, directType));
    return out;
}

export function slice8Conditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(slice8SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (slice8ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), slice8ReviewedSourceHash,
            'Reviewed slice-8 sources changed; re-review before sampling');
    const result = [];
    for (const [dir, cfg] of Object.entries(schools)) {
        // xiakedao ability lives under a perform/ subdirectory.
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
        const group = `slice8-${dir}`;
        const usage = cfg.usage, grant = cfg.grant;
        const actorSkills = level => {
            const skills = { [usage]: level, [cfg.skill]: level, force: level,
                [cfg.forceSkill]: level, dodge: level, parry: level, ...cfg.learnSkills };
            return skills;
        };
        function add(method, variant, extra = {}) {
            const level = extra.level ?? cfg.baseLevel ?? 200;
            const skills = { ...actorSkills(level), ...extra.skills };
            for (const [k, v] of Object.entries(skills)) if (v === undefined) delete skills[k];
            const properties = { ...defaults, ...cfg.actorProperties, 'family/family_name': cfg.family,
                ...(grant ? { [grant]: 1 } : {}),
                ...(cfg.gender ? { gender: cfg.gender } : {}),
                ...extra.properties };
            const actor = { skills, mappings: { force: cfg.forceSkill, [usage]: cfg.skill },
                preparations: cfg.prepared ? { [cfg.prepared]: cfg.skill } : {},
                properties, ...(cfg.hold ? { equipment: { type: 'throwing', hold: true } }
                    : cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}) };
            const target = {
                skills: {
                    force: extra.targetForce ?? level,
                    dodge: extra.targetDodge ?? level,
                    parry: extra.targetParry ?? level,
                },
                mappings: {}, preparations: {},
                properties: { ...defaults, ...cfg.targetProperties, ...(extra.targetProperties ?? {}) },
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
                    qualification_sources: [...slice8SourcePaths],
                    ability_source: { path: method === 'interface' ? base.path : method === 'ordinary' ? base.path : ability.path,
                        sha256: source_evidence[method === 'interface' || method === 'ordinary' ? base.path : ability.path],
                        entry_id },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}代表切片：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。即时窗口，不采自然心跳/到期。'
                        + '目标为固定高资源靶；直伤类按 combatd 原支持集校验。'
                        + (dir === 'tangmen' ? '唐花为 receive 类（无 do_damage，wound=100%伤害+hit_ob），'
                            + '夹具为通用暗器（hold:true），落空分支掉暗器。' : '')
                        + (dir === 'xiakedao' ? '混天一气 percent 为 80+random(5)（percentRange 80-84），'
                            + '反向命中等号成立；valid_enable/perform_action_file 严禁 literate，命中附 final 精神伤创与目标忙乱。' : '')
                        + (dir === 'yunlong' ? '云龙三现为非标准命中 random(force)>目标force/2，'
                            + 'hit 转向有 1/250 失手率（random 上界为 force 有效值，得 0 失手），steered 对容错双分支。' : '')
                        + '只收集数据，不比较强弱、不作平衡结论。',
                } });
        }
        // Ordinary + perform baselines: random outcomes need 100 samples.
        const baseLevel = cfg.baseLevel ?? 200;
        add('ordinary', `baseline-l${baseLevel}`, { samples: smoke ? 1 : samples });
        add('perform', `baseline-l${baseLevel}`, { samples: smoke ? 1 : samples });
        // Branch-bias pairs. Each school steers its own hit/miss predicate:
        // tangmen dp = target parry+dodge+dugu*10; xiakedao reverse predicate
        // dp = target force+con*10+mc; yunlong dp = target force/2.
        if (dir === 'tangmen') {
            add('perform', 'hit', { targetParry: 0, targetDodge: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetParry: 100000, targetDodge: 100000, samples: smoke ? 1 : 4 });
        } else if (dir === 'xiakedao') {
            add('perform', 'hit', { targetForce: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetForce: 100000, samples: smoke ? 1 : 4 });
        } else {
            add('perform', 'hit', { targetForce: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetForce: 100000, samples: smoke ? 1 : 4 });
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
        if (side.weapon_details && Object.keys(side.weapon_details).length)
            side.weapon_details.consistence = 0;
        if (side.handing_details && Object.keys(side.handing_details).length)
            side.handing_details.consistence = 0;
    }
    if (mutate) mutate(expected);
    assert.deepEqual(actual, expected, 'unexplained state mutation');
}

function assertLearnGain(after, skill) {
    const learned = after.learned ?? {};
    for (const k of Object.keys(learned)) assert.equal(k, skill, 'unexpected learned key');
    assert.ok([0, 1].includes(learned[skill] ?? 0), 'original single-use learn gain');
}

export function validateSlice8Record(raw, condition) {
    const p = condition.parameters, cfg = schools[p.school];
    assert.ok(cfg, 'known school slice');
    assert.equal(p.collection_group, 'slice8-' + p.school);
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
    // xiakedao valid_enable/perform_action_file reject literate entirely.
    if (p.school === 'xiakedao') {
        assert.equal(sparse(b.skills, 'literate'), 0, 'xiakedao forbids literate');
        assert.ok(!b.learned_literate, 'xiakedao forbids learned_literate');
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
        stableState(t, v, e => { e.qi = v.qi; e.eff_qi = v.eff_qi; e.busy = v.busy; e.neili = v.neili; });
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
    return cfg.kind === 'receive'
        ? validateSlice8Receive(raw, condition, cfg, p, b, t, a, v)
        : validateSlice8Direct(raw, condition, cfg, p, b, t, a, v);
}

function assertBusy(cfg, busyAfter, miss) {
    const want = miss ? cfg.missBusy : cfg.hitBusy;
    if (Array.isArray(want))
        assert.ok(busyAfter >= want[0] && busyAfter <= want[1], `busy in ${want[0]}..${want[1]}`);
    else assert.equal(busyAfter, want, miss ? 'miss busy' : 'hit busy');
}

function validateSlice8Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    assertLearnGain(a, p.skill);
    const miss = directs.length === 0;
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    assert.equal(b.neili - a.neili, fee, `${p.school} branch fee`);
    assertBusy(cfg, num(a.busy), miss);
    assert.equal(raw.dropped.length, 0, 'weapon retained');
    const actorSide = e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
    };
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, actorSide);
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'single direct');
    const input = num(directs[0].damage);
    const support = slice8SupportSet(input, cfg.percent, b, t, cfg.directType, cfg.percentRange);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    assertLearnGain(a, p.skill);
    // xiakedao hit extras: final jing wound, target neili drain. The final
    // callback calls target->busy(1) but busy() is not a defined function in
    // this codebase (only start_busy()), so it is a no-op; target busy is
    // unchanged on the hit branch.
    const xiakedao = p.school === 'xiakedao';
    if (xiakedao) {
        assert.equal(t.jing - v.jing, Math.trunc(input / 2), 'final jing damage');
        assert.equal(t.eff_jing - v.eff_jing, Math.trunc(input / 3), 'final jing wound');
        const skillRaw = sparse(b.skills, cfg.skill);
        const neiliDrop = t.neili - v.neili;
        assert.ok(neiliDrop >= skillRaw && neiliDrop <= 2 * skillRaw - 1,
            'target neili drain in skill+random(skill)');
    }
    stableState(b, a, actorSide);
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi;
        if (xiakedao) { e.jing = v.jing; e.eff_jing = v.eff_jing; e.neili = v.neili; }
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateSlice8Receive(raw, condition, cfg, p, b, t, a, v) {
    // tangmen kind=receive: no do_damage. Hit consumes one ammo and applies
    // receive_damage+receive_wound both = damage (wound 100%); miss drops the
    // held throwing weapon to the room and drains target neili.
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'receive kind has no do_damage');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    assertLearnGain(a, p.skill);
    const miss = raw.dropped.length > 0;
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    assert.equal(b.neili - a.neili, fee, `${p.school} branch fee`);
    assertBusy(cfg, num(a.busy), miss);
    const actorSide = e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        e.ammunition = a.ammunition;
        if (a.handing !== undefined) e.handing = a.handing;
        if (a.handing_details !== undefined) {
            e.handing_details = copy(a.handing_details);
            if (Object.keys(e.handing_details).length) e.handing_details.consistence = 0;
        }
        // temp.handing tracks the held weapon object; drop clears it.
        if (e.temp && a.temp) {
            if ('handing' in a.temp) e.temp.handing = a.temp.handing;
            else delete e.temp.handing;
        }
    };
    if (miss) {
        assert.equal(raw.dropped.length, 1, 'miss drops the held weapon');
        assert.equal(raw.dropped[0].type, 'throwing');
        assert.ok(typeof raw.dropped[0].object === 'string' && raw.dropped[0].object);
        assert.ok(typeof raw.dropped[0].name === 'string' && raw.dropped[0].name);
        assert.equal(sparse(a, 'ammunition'), 0, 'ammo gone after drop');
        // Target neili drained by 1000 or floored at 0.
        const neiliDrop = t.neili - v.neili;
        assert.ok(v.neili === 0 || neiliDrop === 1000, 'miss drains target neili');
        assertLearnGain(a, p.skill);
        stableState(b, a, actorSide);
        stableState(t, v, e => { e.neili = v.neili; });
        return { accepted: true, kind: 'receive', hit: false };
    }
    assert.equal(raw.dropped.length, 0, 'hit retains the held weapon');
    assert.equal(sparse(a, 'ammunition'), sparse(b, 'ammunition') - 1, 'hit consumes one ammo');
    // wound = 100% of damage: eff_qi drops by the same amount as qi.
    const damage = b.qi - v.qi;
    assert.ok(damage > 0, 'positive receive damage');
    assert.equal(b.eff_qi - v.eff_qi, damage, 'wound = 100% of damage');
    assertLearnGain(a, p.skill);
    stableState(b, a, actorSide);
    stableState(t, v, e => { e.qi = v.qi; e.eff_qi = v.eff_qi; });
    return { accepted: true, kind: 'receive', hit: true, input: damage };
}

export function slice8Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateSlice8Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return { counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
