// School representative slice batch 7 (shang/hu/none+ultra merged mini-slice).
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
    shang: {
        skill: 'shangjia-dao', ability: 'juan', usage: 'blade',
        grant: 'can_perform/shangjia-dao/juan', forceSkill: 'shangjia-neigong',
        kind: 'direct', weapon: 'blade', prepared: 'blade', family: '商家堡',
        title: '商家刀法「寒芒暴卷」', directType: 'WEAPON', percent: 35, baseLevel: 250,
        gates: [
            { key: 'level', pair: [49, 50], field: 'skill',
                refusal: '你的商家刀法还不到家，难以施展「寒芒暴卷」。\n' },
            // query_skill("force") is the mapped effective force (no raw flag).
            { key: 'force', pair: [79, 80], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「寒芒暴卷」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你的真气不够，难以施展「寒芒暴卷」。\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = blade_eff, dp = target parry);
        // damage = ap/3+random(ap/2); do_damage WEAPON percent 35;
        // fee 80, me busy 2. miss: fee 30, me busy 3.
        feeHit: 80, feeMiss: 30, hitBusy: 2, missBusy: 3,
        learnGate: { field: 'max_neili', pair: [349, 350], property: true,
            refusal: '你的内力不够。\n' },
    },
    hu: {
        skill: 'hujia-daofa', ability: 'zhui', usage: 'blade',
        grant: 'can_perform/hujia-daofa/zhui', forceSkill: 'lengyue-shengong',
        kind: 'direct', weapon: 'blade', prepared: 'blade', family: '关外胡家',
        title: '胡家刀法「卸甲锥心势」', directType: 'WEAPON', percent: 65, baseLevel: 250,
        gates: [
            { key: 'level', pair: [139, 140], field: 'skill',
                refusal: '你的胡家刀法还不到家，难以施展「卸甲锥心势」。\n' },
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「卸甲锥心势」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，难以施展「卸甲锥心势」。\n' },
        ],
        // hit: ap/4+random(ap/2) > dp (ap = blade_eff+force_eff, dp = target
        // force) — the tightest quartile predicate in this batch;
        // damage = ap/3+random(ap/2); do_damage WEAPON percent 65;
        // fee 150, me busy 2. miss: fee 50, me busy 3.
        feeHit: 150, feeMiss: 50, hitBusy: 2, missBusy: 3,
        // valid_learn first gate is daojian-guizhen (fixture has none); learnGate
        // samples the max_neili boundary.
        learnGate: { field: 'max_neili', pair: [1399, 1400], property: true,
            refusal: '你的内力不够。\n' },
    },
    none: {
        skill: 'dugu-jiujian', ability: 'yi', usage: 'sword',
        // No can_perform authorization: skill<90 and the no-learn marker share
        // the generic grant wording. Fixture must not set can_learn/dugu-jiujian/nothing.
        grant: null, forceSkill: 'bingxin-jue',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '侠客盟',
        title: '独孤九剑「弘意式」', directType: 'WEAPON', percent: 50, baseLevel: 200,
        actorProperties: { character: '狡黠多变' },
        learnSkills: { 'martial-cognize': 200 },
        gates: [
            { key: 'level', pair: [89, 90], field: 'skill',
                refusal: '你所使用的外功中没有这种功能。\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = sword_eff+martial-cognize raw,
        // dp = target parry + target martial-cognize + target dugu-jiujian);
        // damage = ap+random(ap); do_damage WEAPON percent 50;
        // no neili fee on either branch. start_busy(2)/start_busy(3), but the
        // 狡黠多变 trait in feature/action.c may decrement busy by 1 when the
        // raw value is >1 (40%); observed busy is therefore a range.
        feeHit: 0, feeMiss: 0, hitBusy: [1, 2], missBusy: [2, 3],
        learnGate: { field: 'int', pair: [38, 39], property: true,
            refusal: '你的天资不足，无法理解独孤九剑的剑意。\n' },
    },
    ultra: {
        skill: 'never-defeated', ability: 'juemie', abilityPath: 'perform/juemie',
        usage: 'sword',
        grant: null, forceSkill: 'never-defeated',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '侠客盟',
        title: '不败神功「天地绝灭」', directType: 'WEAPON', percent: 40, baseLevel: 250,
        actorProperties: { character: '狡黠多变' },
        // valid_learn folds the seven basics plus martial-cognize at the raw
        // skill level; sword/force/dodge/parry already follow usage/level.
        learnSkills: { blade: 250, whip: 250, throwing: 250, 'martial-cognize': 250 },
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的不败神功还不够娴熟，不能使用天地绝灭！\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的内力不够，不能使用天地绝灭！\n' },
        ],
        // Reverse hit predicate: miss when ap/2+random(ap) < dp, so equality
        // lands on the hit branch. ap = skill_raw*3/2+int*20+martial-cognize
        // raw; dp = target dodge + target dex*20 + target martial-cognize.
        // damage = ap/2+random(ap/3); do_damage WEAPON percent 40;
        // fee 50 then +70 on hit (total 120). start_busy(2) on both branches;
        // the 狡黠多变 trait may decrement it to 1 (40%).
        feeHit: 120, feeMiss: 50, hitBusy: [1, 2], missBusy: [1, 2],
        learnGate: { field: 'int', pair: [21, 22], property: true,
            refusal: '你觉得不败神功过于深奥，绝非自己的智力所能理解。\n' },
    },
};

export const slice7SourcePaths = [
    'kungfu/class/shang/shang.h', 'kungfu/class/hu/hu.h', 'kungfu/class/none/none.h',
    'kungfu/skill/shangjia-dao.c', 'kungfu/skill/shangjia-dao/juan.c',
    'kungfu/skill/hujia-daofa.c', 'kungfu/skill/hujia-daofa/zhui.c',
    'kungfu/skill/dugu-jiujian.c', 'kungfu/skill/dugu-jiujian/yi.c',
    'kungfu/skill/never-defeated.c', 'kungfu/skill/never-defeated/perform/juemie.c',
    'kungfu/skill/shangjia-neigong.c', 'kungfu/skill/lengyue-shengong.c',
    'kungfu/skill/bingxin-jue.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c', 'kungfu/skill/whip.c',
    'kungfu/skill/throwing.c', 'kungfu/skill/force.c', 'kungfu/skill/dodge.c',
    'kungfu/skill/parry.c', 'kungfu/skill/unarmed.c', 'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c', 'cmds/skill/learn.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attack.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'feature/equip.c', 'feature/name.c', 'feature/condition.c',
    'clone/user/user.c', 'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/weapon/blade.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const slice7ReviewedSourceHash = '1ac8564b346567d525351f8fe328d4653774ff17bc214216c6f110bf772468b1';

export function slice7SupportSet(input, percent, actor, target, directType = 'WEAPON') {
    // Reuse the slice-2 combatd do_damage support model (WEAPON/UNARMED/REMOTE).
    return slice2SupportSet(input, percent, actor, target, directType);
}

export function slice7Conditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(slice7SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (slice7ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), slice7ReviewedSourceHash,
            'Reviewed slice-7 sources changed; re-review before sampling');
    const result = [];
    for (const [dir, cfg] of Object.entries(schools)) {
        // ultra ability lives under a perform/ subdirectory.
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
        const group = `slice7-${dir}`;
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
                properties, ...(cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}) };
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
                    qualification_sources: [...slice7SourcePaths],
                    ability_source: { path: method === 'interface' ? base.path : method === 'ordinary' ? base.path : ability.path,
                        sha256: source_evidence[method === 'interface' || method === 'ordinary' ? base.path : ability.path],
                        entry_id },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}代表切片：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。即时窗口，不采自然心跳/到期。'
                        + '目标为固定高资源靶；直伤类按 combatd 原支持集校验。'
                        + (dir === 'hu' ? '卸甲锥心势命中为四分位判定 ap/4+random(ap/2)>dp，为本批最紧命中。' : '')
                        + (dir === 'none' ? '弘意式无 can_perform 授权，skill<90 与无招标记同文案，且两分支均不扣内力。' : '')
                        + (dir === 'ultra' ? '天地绝灭为反向命中判定（等号算命中），绝招在 perform 子目录，'
                            + 'valid_learn 折叠七项基本技与武学修养。' : '')
                        + (dir === 'none' || dir === 'ultra'
                            ? '角色狡黠多变会按原 start_busy 特效随机减 1 忙乱，实测忙乱为区间。' : '')
                        + '只收集数据，不比较强弱、不作平衡结论。',
                } });
        }
        // Ordinary + perform baselines: random outcomes need 100 samples.
        const baseLevel = cfg.baseLevel ?? 200;
        add('ordinary', `baseline-l${baseLevel}`, { samples: smoke ? 1 : samples });
        add('perform', `baseline-l${baseLevel}`, { samples: smoke ? 1 : samples });
        // Branch-bias pairs. Each school steers its own hit/miss predicate:
        // shang dp = target parry; hu dp = target force (quartile);
        // none dp = target parry+mc+dugu (target extras stay 0);
        // ultra reverse predicate dp = target dodge + dex*20 + mc.
        if (dir === 'shang') {
            add('perform', 'hit', { targetParry: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetParry: 100000, samples: smoke ? 1 : 4 });
        } else if (dir === 'hu') {
            add('perform', 'hit', { targetForce: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetForce: 100000, samples: smoke ? 1 : 4 });
        } else if (dir === 'none') {
            add('perform', 'hit', { targetParry: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetParry: 100000, samples: smoke ? 1 : 4 });
        } else {
            add('perform', 'hit', { targetDodge: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetDodge: 100000, samples: smoke ? 1 : 4 });
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
    }
    if (mutate) mutate(expected);
    assert.deepEqual(actual, expected, 'unexplained state mutation');
}

function assertLearnGain(after, skill) {
    const learned = after.learned ?? {};
    for (const k of Object.keys(learned)) assert.equal(k, skill, 'unexpected learned key');
    assert.ok([0, 1].includes(learned[skill] ?? 0), 'original single-use learn gain');
}

export function validateSlice7Record(raw, condition) {
    const p = condition.parameters, cfg = schools[p.school];
    assert.ok(cfg, 'known school slice');
    assert.equal(p.collection_group, 'slice7-' + p.school);
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
    return validateSlice7Direct(raw, condition, cfg, p, b, t, a, v);
}

function assertBusy(cfg, busyAfter, miss) {
    const want = miss ? cfg.missBusy : cfg.hitBusy;
    if (Array.isArray(want))
        assert.ok(busyAfter >= want[0] && busyAfter <= want[1], `busy in ${want[0]}..${want[1]}`);
    else assert.equal(busyAfter, want, miss ? 'miss busy' : 'hit busy');
}

function validateSlice7Direct(raw, condition, cfg, p, b, t, a, v) {
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
    const support = slice7SupportSet(input, cfg.percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    assertLearnGain(a, p.skill);
    stableState(b, a, actorSide);
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi;
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

export function slice7Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateSlice7Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return { counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
