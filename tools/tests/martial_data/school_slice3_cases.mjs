// School representative slice batch 3 (lingjiu/murong/xingxiu/honghua). Finite
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
    lingjiu: {
        skill: 'tianyu-qijian', ability: 'ju', usage: 'sword',
        grant: 'can_perform/tianyu-qijian/ju', forceSkill: 'bahuang-gong',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '灵鹫宫',
        title: '天羽奇剑「聚剑诀」', directType: 'WEAPON', percent: 50,
        gates: [
            { key: 'level', pair: [129, 130], field: 'skill',
                refusal: '你的天羽奇剑不够娴熟，难以施展「聚剑诀」。\n' },
            { key: 'force', pair: [179, 180], field: 'effective-force',
                refusal: '你的内功火候不足，难以施展「聚剑诀」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不足，难以施展「聚剑诀」。\n' },
        ],
        // hit: ap/2+random(ap) > dp (both effective force); damage =
        // sword_eff + random(sword_eff); do_damage WEAPON percent 50;
        // fee 160, me busy 2. miss: fee 80, me busy 4.
        feeHit: 160, feeMiss: 80, hitBusy: 2, missBusy: 4,
        learnGate: { field: 'effective-force', pair: [39, 40],
            refusal: '你的内功火候不够，不能学习天羽奇剑。\n' },
    },
    murong: {
        skill: 'murong-jian', ability: 'xing', usage: 'sword',
        grant: 'can_perform/murong-jian/xing', forceSkill: 'murong-xinfa',
        kind: 'combo', weapon: 'sword', prepared: 'sword', family: '慕容世家',
        title: '慕容剑法「剑转七星」', baseLevel: 250,
        gates: [
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的慕容剑法不够娴熟，难以施展「剑转七星」。\n' },
            // query_skill("dodge") = apply/dodge + raw/2 when unmapped; the
            // test sword contributes apply/dodge -1, so pair folds to 119/120.
            { key: 'dodge', pair: [241, 242], field: 'dodge', effective: true, threshold: 120,
                refusal: '你的轻功修为不够，无法施展「剑转七星」！\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你目前的真气不够，难以施展「剑转七星」。\n' },
        ],
        // 7×do_attack(type 13); fee 210 paid once; me busy 3+random(5);
        // target may start_busy(1) before each attack when not already busy.
        fee: 210, comboHits: 7, attackType: 13,
        learnGate: { field: 'max_neili', pair: [149, 150], property: true,
            refusal: '你的内力不够。\n' },
    },
    xingxiu: {
        skill: 'chousui-zhang', ability: 'shi', usage: 'strike',
        grant: 'can_perform/chousui-zhang/shi', forceSkill: 'huagong-dafa',
        kind: 'direct', weapon: null, prepared: 'strike', family: '星宿派',
        title: '抽髓掌「腐尸毒」', directType: 'REMOTE', percent: 75, baseLevel: 250,
        gates: [
            // Level gate at 140 is below the corpse threshold (lvl<200 needs
            // CORPSE_OB), so it is not sampled here; baseline 250 avoids it.
            { key: 'poison', pair: [199, 200], field: 'poison',
                refusal: '你对毒技的了解不够，难以施展「腐尸毒」。\n' },
            // query_skill("throwing") = raw/2 when unmapped; pair folds to 179/180.
            { key: 'throwing', pair: [359, 360], field: 'throwing', effective: true, threshold: 180,
                refusal: '你暗器手法火候不够，难以施展「腐尸毒」。\n' },
            { key: 'max_neili', pair: [1199, 1200], field: 'max_neili',
                refusal: '你的内力修为不足，难以施展「腐尸毒」。\n' },
            { key: 'neili', pair: [499, 500], field: 'neili',
                refusal: '你现在的内息不足，难以施展「腐尸毒」。\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = strike_eff + poison raw);
        // damage = ap+random(ap/2); do_damage REMOTE percent 75;
        // fee 300, me busy 3. miss: fee 200, me busy 4. final applies
        // corpse_poison (level = poison+random(poison)) and jing
        // receive_damage damage/4 + receive_wound damage/8. Baseline level
        // ≥ 200 avoids the corpse gate (lvl < 200 requires CORPSE_OB).
        feeHit: 300, feeMiss: 200, hitBusy: 3, missBusy: 4,
        learnGate: { field: 'poison', pair: [49, 50],
            refusal: '你的基本毒技不足，无法练抽髓掌。\n' },
    },
    honghua: {
        skill: 'zhuihun-jian', ability: 'zhui', usage: 'sword',
        grant: 'can_perform/zhuihun-jian/zhui', forceSkill: 'honghua-xinfa',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '红花会',
        title: '追魂夺命剑「追魂夺命」', directType: 'WEAPON', percent: 60,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的追魂夺命剑还不够娴熟，难以施展「追魂夺命」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，难以施展「追魂夺命」。\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = sword_eff, dp = dodge_eff);
        // damage = ap/2+random(ap/2); do_damage WEAPON percent 60;
        // fee 150, me busy 3 on both branches. final is message-only.
        fee: 150, meBusy: 3,
        character: '心狠手辣',
        learnGate: { field: 'dex', pair: [23, 24],
            refusal: '你的先天身法太差，无法学习追魂夺命剑。\n' },
    },
};

export const slice3SourcePaths = [
    'kungfu/class/lingjiu/lingjiu.h', 'kungfu/class/murong/murong.h',
    'kungfu/class/xingxiu/xingxiu.h', 'kungfu/class/honghua/honghua.h',
    'kungfu/skill/tianyu-qijian.c', 'kungfu/skill/tianyu-qijian/ju.c',
    'kungfu/skill/murong-jian.c', 'kungfu/skill/murong-jian/xing.c',
    'kungfu/skill/chousui-zhang.c', 'kungfu/skill/chousui-zhang/shi.c',
    'kungfu/skill/zhuihun-jian.c', 'kungfu/skill/zhuihun-jian/zhui.c',
    'kungfu/skill/bahuang-gong.c', 'kungfu/skill/murong-xinfa.c',
    'kungfu/skill/huagong-dafa.c', 'kungfu/skill/honghua-xinfa.c',
    'kungfu/skill/sword.c', 'kungfu/skill/strike.c', 'kungfu/skill/force.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/parry.c', 'kungfu/skill/poison.c',
    'kungfu/skill/throwing.c', 'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c', 'cmds/skill/learn.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attack.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'feature/equip.c', 'feature/name.c', 'feature/condition.c',
    'clone/user/user.c', 'inherit/char/char.c', 'inherit/weapon/sword.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const slice3ReviewedSourceHash = '401ebc6e4c49c47cd05f84347536ee435068c62688d05a10b81e2e07b414a751';

export function slice3SupportSet(input, percent, actor, target, directType = 'WEAPON') {
    // Reuse the slice-2 combatd do_damage support model (WEAPON/UNARMED/REMOTE).
    return slice2SupportSet(input, percent, actor, target, directType);
}

export function slice3Conditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(slice3SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (slice3ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), slice3ReviewedSourceHash,
            'Reviewed slice-3 sources changed; re-review before sampling');
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
        const group = `slice3-${dir}`;
        const usage = cfg.usage, grant = cfg.grant;
        const actorSkills = level => {
            const skills = { [usage]: level, [cfg.skill]: level, force: level,
                [cfg.forceSkill]: level, dodge: level, parry: level };
            // xingxiu perform gates use raw poison and effective throwing
            // (raw/2); keep raw values high enough for the baseline to pass.
            if (dir === 'xingxiu') {
                skills.poison = level;
                skills.throwing = Math.max(level, 360);
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
                    qualification_sources: [...slice3SourcePaths],
                    ability_source: { path: method === 'interface' ? base.path : method === 'ordinary' ? base.path : ability.path,
                        sha256: source_evidence[method === 'interface' || method === 'ordinary' ? base.path : ability.path],
                        entry_id },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}代表切片：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。即时窗口，不采自然心跳/到期。'
                        + '目标为固定高资源靶；直伤类按 combatd 原支持集校验，连击类按原攻击序列记账。'
                        + '只收集数据，不比较强弱、不作平衡结论。',
                } });
        }
        // Ordinary + perform baselines: random outcomes need 100 samples.
        const baseLevel = cfg.baseLevel ?? 200;
        add('ordinary', `baseline-l${baseLevel}`, { samples: smoke ? 1 : samples });
        add('perform', `baseline-l${baseLevel}`, { samples: smoke ? 1 : samples });
        // Branch-bias pairs. Each school steers its own hit/miss predicate:
        // lingjiu dp=target force; murong 7 independent do_attack rolls;
        // xingxiu dp=target dodge+martial-cognize; honghua dp=target dodge.
        if (dir === 'lingjiu') {
            add('perform', 'hit', { targetForce: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetForce: 100000, samples: smoke ? 1 : 4 });
        } else if (dir === 'murong') {
            add('perform', 'hit-bias', { targetDodge: 0, targetParry: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss-bias', { targetDodge: 100000, targetParry: 100000, samples: smoke ? 1 : 4 });
        } else if (dir === 'xingxiu') {
            add('perform', 'hit', { targetDodge: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetDodge: 100000, samples: smoke ? 1 : 4 });
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

export function validateSlice3Record(raw, condition) {
    const p = condition.parameters, cfg = schools[p.school];
    assert.ok(cfg, 'known school slice');
    assert.equal(p.collection_group, 'slice3-' + p.school);
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
    // Character coverage: honghua requires 心狠手辣/国士无双 (valid_learn gate).
    if (cfg.character) {
        const actorCharacter = b.character ?? b.cultivation?.character ?? cfg.character;
        if (p.school === 'honghua')
            assert.ok(['心狠手辣', '国士无双'].includes(actorCharacter), 'honghua character gate');
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
        // Target-side: allow qi/eff_qi combat changes but check everything else.
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
    if (cfg.kind === 'combo') return validateMurongCombo(raw, cfg, p, b, t, a, v);
    return validateSlice3Direct(raw, condition, cfg, p, b, t, a, v);
}

function validateSlice3Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    assertLearnGain(a, p.skill);
    if (p.school === 'xingxiu') return validateXingxiuDirect(raw, cfg, p, b, t, a, v, directs);
    if (p.school === 'honghua') return validateHonghuaDirect(raw, cfg, p, b, t, a, v, directs);
    return validateLingjiuDirect(raw, cfg, p, b, t, a, v, directs);
}

function xingxiuFinalSideEffects(v, poisonLevel) {
    const cnd = v.conditions?.corpse_poison;
    assert.ok(cnd, 'corpse_poison applied');
    const level = num(cnd.level);
    assert.ok(level >= poisonLevel && level < poisonLevel * 2,
        'poison level = raw_poison + random(raw_poison)');
    assert.ok(num(v.eff_jing) >= -1 && num(v.jing) >= -1, 'jing wound applied');
}

function validateLingjiuDirect(raw, cfg, p, b, t, a, v, directs) {
    const miss = directs.length === 0;
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    assert.equal(b.neili - a.neili, fee, 'lingjiu branch fee');
    const busyAfter = num(a.busy);
    assert.equal(busyAfter, miss ? cfg.missBusy : cfg.hitBusy, 'lingjiu busy');
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'lingjiu single direct');
    const input = num(directs[0].damage);
    const support = slice3SupportSet(input, cfg.percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
    stableState(t, v, e => { e.qi = v.qi; e.eff_qi = v.eff_qi; e.busy = v.busy; e.neili = v.neili; assert.ok(v.busy === null || (Number.isSafeInteger(v.busy) && v.busy >= 0 && v.busy <= 100), 'target busy range'); });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateXingxiuDirect(raw, cfg, p, b, t, a, v, directs) {
    const miss = directs.length === 0;
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    assert.equal(b.neili - a.neili, fee, 'xingxiu branch fee');
    const busyAfter = num(a.busy);
    assert.equal(busyAfter, miss ? cfg.missBusy : cfg.hitBusy, 'xingxiu busy');
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'xingxiu single direct');
    const input = num(directs[0].damage);
    const support = slice3SupportSet(input, cfg.percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    const poisonLevel = num(sparse(b.skills, 'poison'));
    xingxiuFinalSideEffects(v, poisonLevel);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
    // Only corpse_poison is a valid condition change.
    const expectedXingxiuConditions = { ...t.conditions, corpse_poison: v.conditions?.corpse_poison ?? {} };
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
        e.conditions = expectedXingxiuConditions;
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateHonghuaDirect(raw, cfg, p, b, t, a, v, directs) {
    const miss = directs.length === 0;
    assert.equal(b.neili - a.neili, cfg.fee, 'honghua flat fee');
    assert.equal(num(a.busy), cfg.meBusy, 'honghua me busy 3');
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'honghua single direct');
    const input = num(directs[0].damage);
    const support = slice3SupportSet(input, cfg.percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; });
    stableState(t, v, e => { e.qi = v.qi; e.eff_qi = v.eff_qi; e.busy = v.busy; e.neili = v.neili; assert.ok(v.busy === null || (Number.isSafeInteger(v.busy) && v.busy >= 0 && v.busy <= 100), 'target busy range'); });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateMurongCombo(raw, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.equal(directs.length, 0, 'murong combo has no directs');
    assert.equal(sparse(raw.metrics[0], 'direct'), 0, 'no direct metric');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'no direct metric');
    const attacks = raw.attacks;
    assert.ok(attacks.length >= 1 && attacks.length <= cfg.comboHits,
        'murong issues up to 7 combo attacks');
    for (const at of attacks) {
        assert.equal(at.actor, 0); assert.equal(at.target, 1);
        assert.equal(at.type, cfg.attackType, 'murong combo attack type 13');
        assert.ok([0, -1, -2].includes(at.result));
        assert.ok(num(at.damage) >= 0);
    }
    assert.equal(b.neili - a.neili, cfg.fee, 'murong flat combo fee 210');
    const busyAfter = num(a.busy);
    assert.ok(busyAfter >= 3 && busyAfter <= 7, 'murong me busy 3+random(5)');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; });
    stableState(t, v, e => { e.qi = v.qi; e.eff_qi = v.eff_qi; e.busy = v.busy; });
    return { accepted: true, kind: 'combo', hit: attacks.some(x => x.result === 0), hits: attacks.filter(x => x.result === 0).length };
}

export function slice3Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateSlice3Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return { counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
