// School representative slice batch 6 (meizhuang/miao/ouyang/zhenyuan). Finite
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
    meizhuang: {
        skill: 'qixian-wuxingjian', ability: 'shan', usage: 'sword',
        grant: 'can_perform/qixian-wuxingjian/shan', forceSkill: 'xuantian-wujigong',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '梅庄',
        title: '七弦无形剑「七弦黄龙闪」', directType: 'REMOTE', percent: 100, baseLevel: 280,
        // Dual immunity (before the hit predicate): target max_neili<10, or userp
        // target with max_neili+500 > actor max_neili => no direct, fee 100, busy 2.
        // Keep actor max_neili >= target max_neili + 500 on hit-capable samples.
        actorProperties: { max_neili: 6500 },
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你的七弦无形剑修为有限，难以施展「七弦黄龙闪」。\n' },
            { key: 'force', pair: [249, 250], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展「七弦黄龙闪」。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你现在的真气不够，难以施展「七弦黄龙闪」。\n' },
        ],
        // hit: ap/2+random(ap) >= dp (ap = force_eff, dp = target force);
        // damage = ap+skill+random((ap+skill)/2); do_damage REMOTE percent 100;
        // fee 300, me busy 2. miss/immune: fee 100, me busy 2.
        feeHit: 300, feeMiss: 100, hitBusy: 2, missBusy: 2,
        // valid_learn also needs unarmed/sword >= skill and tanqin-jifa >= skill/3;
        // sword follows usage level, so only the extra two are listed here.
        learnSkills: { unarmed: 280, 'tanqin-jifa': 280 },
        learnGate: { field: 'max_neili', pair: [2999, 3000], property: true,
            refusal: '你的内力太弱，无法修炼七弦无形剑。\n' },
    },
    miao: {
        skill: 'miaojia-jian', ability: 'gan', usage: 'sword',
        grant: 'can_perform/miaojia-jian/gan', forceSkill: 'miaojia-neigong',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '中原苗家',
        title: '苗家剑法「流星赶月」', directType: 'WEAPON', percent: 80, baseLevel: 300,
        gates: [
            { key: 'level', pair: [199, 200], field: 'skill',
                refusal: '你苗家剑法不够娴熟，难以施展「流星赶月」。\n' },
            { key: 'force', pair: [279, 280], field: 'effective-force',
                refusal: '你的内功火候不够，难以施展「流星赶月」。\n' },
            { key: 'max_neili', pair: [2999, 3000], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「流星赶月」。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你现在真气不够，难以施展「流星赶月」。\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = sword_eff, dp = target dodge);
        // damage = ap/2+random(ap)+random(that); do_damage WEAPON percent 80;
        // fee 500, me busy 3. miss: fee 500, me busy 4. userp skill<260 then
        // weapon->move(environment) after either branch (dropped sword).
        feeHit: 500, feeMiss: 500, hitBusy: 3, missBusy: 4, dropWeaponBelow: 260,
        // valid_learn first gate is daojian-guizhen (fixture has none); learnGate
        // samples the max_neili boundary.
        learnGate: { field: 'max_neili', pair: [1299, 1300], property: true,
            refusal: '你的内力不够。\n' },
    },
    ouyang: {
        skill: 'lingshe-zhangfa', ability: 'wuji', usage: 'staff',
        grant: 'can_perform/lingshe-zhangfa/wuji', forceSkill: 'hamagong',
        kind: 'direct', weapon: 'staff', prepared: 'staff', family: '欧阳世家',
        title: '灵蛇杖法「横行无忌」', directType: 'WEAPON', percent: 55, baseLevel: 250,
        gates: [
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功火候不够，难以运用使用「横行无忌」！\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不够，无法使用「横行无忌」！\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的灵蛇杖法还不到家，无法使用「横行无忌」！\n' },
        ],
        // hit: ap/2+random(ap) > dp (ap = staff_eff, dp = target parry);
        // damage = ap+random(ap); do_damage WEAPON percent 55;
        // fee 200, me busy 3. miss: fee 80, me busy 4.
        // target->start_busy(1) on BOTH branches.
        feeHit: 200, feeMiss: 80, hitBusy: 3, missBusy: 4, targetBusy: 1,
        learnGate: { field: 'max_neili', pair: [999, 1000], property: true,
            refusal: '你的内力不够。\n' },
    },
    zhenyuan: {
        skill: 'bagua-zhang', ability: 'ding', usage: 'strike',
        grant: 'can_perform/bagua-zhang/ding', forceSkill: 'nei-bagua',
        kind: 'direct', weapon: null, prepared: 'strike', family: '八卦门',
        title: '八卦掌「背心钉」', directType: 'UNARMED', percent: 20, baseLevel: 250,
        gates: [
            { key: 'force', pair: [119, 120], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展「背心钉」。\n' },
            { key: 'level', pair: [79, 80], field: 'skill',
                refusal: '你的八卦掌不够娴熟，难以施展「背心钉」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在真气不够，难以施展「背心钉」。\n' },
        ],
        // hit: random(strike_eff) > target dodge_eff/2 (non-standard predicate);
        // damage = strike_eff/2+random(strike_eff/2); do_damage UNARMED percent 20;
        // fee 150, me busy 2. miss: fee 50, me busy 3.
        feeHit: 150, feeMiss: 50, hitBusy: 2, missBusy: 3,
        // valid_learn first gate is baihua-cuoquan (fixture has none) and requires
        // empty hands; learnGate samples the max_neili boundary.
        learnGate: { field: 'max_neili', pair: [149, 150], property: true,
            refusal: '你的内力不够，无法练习八卦掌。\n' },
    },
};

export const slice6SourcePaths = [
    'kungfu/class/meizhuang/meizhuang.h', 'kungfu/class/miao/miao.h',
    'kungfu/class/ouyang/ouyang.h', 'kungfu/class/zhenyuan/zhenyuan.h',
    'kungfu/skill/qixian-wuxingjian.c', 'kungfu/skill/qixian-wuxingjian/shan.c',
    'kungfu/skill/miaojia-jian.c', 'kungfu/skill/miaojia-jian/gan.c',
    'kungfu/skill/lingshe-zhangfa.c', 'kungfu/skill/lingshe-zhangfa/wuji.c',
    'kungfu/skill/bagua-zhang.c', 'kungfu/skill/bagua-zhang/ding.c',
    'kungfu/skill/xuantian-wujigong.c', 'kungfu/skill/miaojia-neigong.c',
    'kungfu/skill/hamagong.c', 'kungfu/skill/nei-bagua.c',
    'kungfu/skill/tanqin-jifa.c',
    'kungfu/skill/sword.c', 'kungfu/skill/staff.c', 'kungfu/skill/strike.c',
    'kungfu/skill/force.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/martial-cognize.c',
    'cmds/skill/perform.c', 'cmds/skill/learn.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attack.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'feature/equip.c', 'feature/name.c', 'feature/condition.c',
    'clone/user/user.c', 'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/weapon/staff.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const slice6ReviewedSourceHash = '4c117e7f2d9db0a6fe12571a8d59f17c5af239070bf013b75cd0be2bde63e39b';

export function slice6SupportSet(input, percent, actor, target, directType = 'WEAPON') {
    // Reuse the slice-2 combatd do_damage support model (WEAPON/UNARMED/REMOTE).
    return slice2SupportSet(input, percent, actor, target, directType);
}

export function slice6Conditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(slice6SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (slice6ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), slice6ReviewedSourceHash,
            'Reviewed slice-6 sources changed; re-review before sampling');
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
        const group = `slice6-${dir}`;
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
                    qualification_sources: [...slice6SourcePaths],
                    ability_source: { path: method === 'interface' ? base.path : method === 'ordinary' ? base.path : ability.path,
                        sha256: source_evidence[method === 'interface' || method === 'ordinary' ? base.path : ability.path],
                        entry_id },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}代表切片：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。即时窗口，不采自然心跳/到期。'
                        + '目标为固定高资源靶；直伤类按 combatd 原支持集校验。'
                        + (dir === 'meizhuang' ? '七弦黄龙闪双免疫支以 actor max_neili≥target+500 保证命中样本不被免疫短路。' : '')
                        + (dir === 'miao' ? '苗家剑法 skill<260 时原代码将剑掷出落地，掉剑为样本次数。' : '')
                        + (dir === 'ouyang' ? '横行无忌命中与落空均对目标施加忙乱1。' : '')
                        + (dir === 'zhenyuan' ? '背心钉命中为 random(基本掌法)>目标轻功/2 非标准判定。' : '')
                        + '只收集数据，不比较强弱、不作平衡结论。',
                } });
        }
        // Ordinary + perform baselines: random outcomes need 100 samples.
        const baseLevel = cfg.baseLevel ?? 200;
        add('ordinary', `baseline-l${baseLevel}`, { samples: smoke ? 1 : samples });
        add('perform', `baseline-l${baseLevel}`, { samples: smoke ? 1 : samples });
        // Branch-bias pairs. Each school steers its own hit/miss predicate:
        // meizhuang dp = target force (bias via force); miao dp = target dodge;
        // ouyang dp = target parry; zhenyuan random(strike) > target dodge/2.
        if (dir === 'meizhuang') {
            add('perform', 'hit', { targetForce: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetForce: 100000, samples: smoke ? 1 : 4 });
            // Dual immunity branches: userp near-equal max_neili, and max_neili<10.
            add('perform', 'immune-userp', { properties: { max_neili: 6000 }, samples: smoke ? 1 : 4 });
            add('perform', 'immune-low', { targetProperties: { max_neili: 5 }, samples: smoke ? 1 : 4 });
        } else if (dir === 'zhenyuan') {
            add('perform', 'hit', { targetDodge: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetDodge: 100000, samples: smoke ? 1 : 4 });
        } else if (dir === 'ouyang') {
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

export function validateSlice6Record(raw, condition) {
    const p = condition.parameters, cfg = schools[p.school];
    assert.ok(cfg, 'known school slice');
    assert.equal(p.collection_group, 'slice6-' + p.school);
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
    return validateSlice6Direct(raw, condition, cfg, p, b, t, a, v);
}

function assertBusy(cfg, busyAfter, miss) {
    const want = miss ? cfg.missBusy : cfg.hitBusy;
    if (Array.isArray(want))
        assert.ok(busyAfter >= want[0] && busyAfter <= want[1], `busy in ${want[0]}..${want[1]}`);
    else assert.equal(busyAfter, want, miss ? 'miss busy' : 'hit busy');
}

function validateSlice6Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= 1, 'at most one do_damage per perform');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    assertLearnGain(a, p.skill);
    const miss = directs.length === 0;
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    assert.equal(b.neili - a.neili, fee, `${p.school} branch fee`);
    assertBusy(cfg, num(a.busy), miss);
    // miao: userp skill<260 drops the sword to the room after either branch.
    const skillLevel = sparse(b.skills, cfg.skill);
    const dropped = Boolean(cfg.dropWeaponBelow) && skillLevel < cfg.dropWeaponBelow;
    if (dropped) {
        assert.equal(raw.dropped.length, 1, 'skill below drop threshold leaves the weapon');
        assert.equal(raw.dropped[0].type, 'sword');
        assert.ok(typeof raw.dropped[0].object === 'string' && raw.dropped[0].object);
        assert.ok(typeof raw.dropped[0].name === 'string' && raw.dropped[0].name);
    } else {
        assert.equal(raw.dropped.length, 0, 'weapon retained');
    }
    // ouyang: target->start_busy(1) on both branches.
    const targetBusy = cfg.targetBusy ?? null;
    if (targetBusy !== null) assert.equal(num(v.busy), targetBusy, `${p.school} target busy`);
    const actorSide = e => {
        e.neili -= fee; e.busy = a.busy; e.learned = a.learned;
        if (dropped) {
            // move() unequips: identity, temp.weapon and weapon-provided apply leave
            // with it; apply.dodge also feeds effective_skills.dodge.
            e.weapon = 'none';
            e.weapon_damage = 0;
            e.weapon_flag = 0;
            e.weapon_details = {};
            if (e.temp) {
                delete e.temp.weapon;
                if (a.temp?.apply) e.temp.apply = { ...a.temp.apply };
            }
            if (e.effective_skills && a.effective_skills)
                e.effective_skills.dodge = a.effective_skills.dodge;
        }
    };
    const targetSide = e => {
        if (targetBusy !== null) e.busy = targetBusy;
    };
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, actorSide);
        stableState(t, v, targetSide);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'single direct');
    const input = num(directs[0].damage);
    const support = slice6SupportSet(input, cfg.percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    assertLearnGain(a, p.skill);
    stableState(b, a, actorSide);
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi;
        if (targetBusy !== null) e.busy = targetBusy;
    });
    return { accepted: true, kind: 'direct', hit: true, input };
}

export function slice6Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateSlice6Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return { counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
