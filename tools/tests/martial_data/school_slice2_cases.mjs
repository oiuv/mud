// School representative slice batch 2 (wudu/tiezhang/shenlong/xuanming). Finite
// reviewed conditions only; no game-code writes and no balance claims.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const noFunction = '你所使用的外功中没有这种功能。\n';
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 40, con: 36, dex: 34, shen: 0, gender: '男性', character: '光明磊落' };

const schools = {
    wudu: {
        skill: 'wudu-shenzhang', ability: 'shi', usage: 'strike',
        grant: 'can_perform/wudu-shenzhang/shi', forceSkill: 'wudu-xinfa',
        kind: 'direct', weapon: null, prepared: 'strike', family: '五毒教',
        title: '五毒神掌「万毒噬体」', directType: 'REMOTE',
        gates: [
            { key: 'force', pair: [199, 200], field: 'effective-force',
                refusal: '你的内功不够火候，难以施展「万毒噬体」。\n' },
            { key: 'level', pair: [149, 150], field: 'skill',
                refusal: '你的五毒神掌不够娴熟，难以施展「万毒噬体」。\n' },
            { key: 'neili', pair: [119, 120], field: 'neili',
                refusal: '你的真气不够，难以施展「万毒噬体」。\n' },
        ],
        // hit: ap/2 + random(ap) > target force; damage = ap+random(ap) then
        // +damage*count/100; do_damage percent 70+count; fee count (jiali 0);
        // me busy 1+random(3); final applies wudu_shenzhang and jing wound
        // 8+random(4). miss: fee 0, me busy 2, target busy 1.
        // count = 20 (target shen>0) + 30 (target gender!=女性); fixed target
        // profile (shen 0, 男性) keeps count at 30.
        character: '心狠手辣',
        learnGate: { field: 'effective-force', pair: [149, 150],
            refusal: '你的内功火候不够，无法练五毒神掌。\n' },
    },
    tiezhang: {
        skill: 'tie-zhang', ability: 'lei', usage: 'strike',
        grant: 'can_perform/tie-zhang/lei', forceSkill: 'tiezhang-xinfa',
        kind: 'direct', weapon: null, prepared: 'strike', family: '铁掌帮',
        title: '铁掌掌法「掌心雷」', directType: 'UNARMED', percent: 65,
        gates: [
            { key: 'level', pair: [159, 160], field: 'skill',
                refusal: '你铁掌掌法火候不够，难以施展「掌心雷」。\n' },
            { key: 'force', pair: [219, 220], field: 'effective-force',
                refusal: '你的内功修为不够，难以施展「掌心雷」。\n' },
            { key: 'max_neili', pair: [2199, 2200], field: 'max_neili',
                refusal: '你的内力修为不够，难以施展「掌心雷」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你现在的真气不足，难以施展「掌心雷」。\n' },
        ],
        // hit: ap/2 + random(ap) > dp (parry+con*8); damage = ap+random(ap/2),
        // percent 65, fee 250, me busy 3. miss: fee 100, me busy 4.
        feeHit: 250, feeMiss: 100, baseLevel: 250,
        learnGate: { field: 'str', pair: [31, 32],
            refusal: '你的先天臂力孱弱，难以修炼铁掌掌法。\n' },
    },
    shenlong: {
        skill: 'shedao-qigong', ability: 'xian', usage: 'staff',
        grant: 'can_perform/shedao-qigong/xian', forceSkill: 'shenlong-xinfa',
        kind: 'direct', weapon: 'staff', prepared: 'staff', family: '神龙教',
        title: '蛇岛奇功「神龙再现」', directType: 'REMOTE',
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的蛇岛奇功修为有限，不能使用「神龙再现」！\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你的真气不够，无法运用「神龙再现」！\n' },
        ],
        // Three branches: parry hit (ap/2+random(ap) > parry) fee 150 busy 2
        // percent 50; dodge hit (ap/3+random(ap) > dodge) fee 180 busy 3
        // percent 55; miss fee 100 busy 3. damage = ap/2+random(ap/2).
        feeParryHit: 150, feeDodgeHit: 180, feeMiss: 100,
        learnGate: { field: 'shenlong-bashi', pair: [99, 100], sameLevel: true,
            refusal: '你的神龙八式火候不够，无法学蛇岛奇功。\n' },
    },
    xuanming: {
        skill: 'xuanming-zhang', ability: 'xing', usage: 'strike',
        grant: 'can_perform/xuanming-zhang/xing', forceSkill: 'xuanming-shengong',
        kind: 'direct', weapon: null, prepared: 'strike', family: '玄冥谷',
        title: '玄冥神掌「玄冥双行」', directType: 'UNARMED',
        gates: [
            { key: 'shengong', pair: [219, 220], field: 'xuanming-shengong',
                refusal: '你的玄冥神功火候不够，无法施展「玄冥双行」。\n' },
            { key: 'level', pair: [219, 220], field: 'skill',
                refusal: '你的玄冥神掌不够熟练，无法施展「玄冥双行」。\n' },
            { key: 'max_neili', pair: [3999, 4000], field: 'max_neili',
                refusal: '你的内力修为不足，无法施展「玄冥双行」。\n' },
            { key: 'neili', pair: [799, 800], field: 'neili',
                refusal: '你的真气不够，无法施展「玄冥双行」。\n' },
        ],
        // Two palms, me busy 4 always. palm1: ap*3/5+random(ap) > dp
        // (dodge+force), damage ap/2+random(ap), percent 60, fee 200/miss 100.
        // palm2: ap/2+random(ap) > dp, damage ap*3/5+random(ap), percent 80,
        // fee 300/miss 150. Both hit finals apply xuanming_poison.
        feePalm1: [200, 100], feePalm2: [300, 150], meBusy: 4, baseLevel: 250,
        character: '心狠手辣',
        learnGate: { field: 'con', pair: [33, 34],
            refusal: '你先天根骨不足，无法修炼玄冥神掌。\n' },
    },
};

export const slice2SourcePaths = [
    'kungfu/class/wudu/wudu.h', 'kungfu/class/tiezhang/tiezhang.h',
    'kungfu/class/shenlong/shenlong.h', 'kungfu/class/xuanming/xuanming.h',
    'kungfu/skill/wudu-shenzhang.c', 'kungfu/skill/wudu-shenzhang/shi.c',
    'kungfu/skill/tie-zhang.c', 'kungfu/skill/tie-zhang/lei.c',
    'kungfu/skill/shedao-qigong.c', 'kungfu/skill/shedao-qigong/xian.c',
    'kungfu/skill/xuanming-zhang.c', 'kungfu/skill/xuanming-zhang/xing.c',
    'kungfu/skill/wudu-xinfa.c', 'kungfu/skill/tiezhang-xinfa.c',
    'kungfu/skill/shenlong-xinfa.c', 'kungfu/skill/xuanming-shengong.c',
    'kungfu/skill/shenlong-bashi.c',
    'kungfu/skill/strike.c', 'kungfu/skill/staff.c', 'kungfu/skill/force.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'cmds/skill/perform.c', 'cmds/skill/learn.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attack.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'feature/equip.c', 'feature/name.c', 'feature/condition.c',
    'clone/user/user.c', 'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/weapon/staff.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const slice2ReviewedSourceHash = '70d1ddfeee601e0cd72037ee2bb1003293bac38d82dd824ca4a7e41cc1f15b38';

const baseSkills = { wudu: 'strike', tiezhang: 'strike', shenlong: 'staff', xuanming: 'strike' };

export function slice2SupportSet(input, percent, actor, target, directType = 'WEAPON') {
    // Faithful port of combatd do_damage support outcomes for the fixed
    // experimental profiles (jiali 0, no count skill, no temp str). Same
    // contract as slice1SupportSet: WEAPON applies temp apply/damage, REMOTE
    // and UNARMED get none. Strength and random int tiers then caps.
    const out = [];
    const apply = directType === 'WEAPON'
        ? sparse(actor.temp?.apply ?? {}, 'damage') : 0;
    const strength = actor.str * 2 + (actor.effective_str ?? actor.str);
    const scale = strength < 40 ? strength : strength < 70 ? Math.trunc((strength - 30) / 2) + 20 : Math.trunc((strength - 60) / 4) + 30;
    const intTier = actor.int < 16 ? 10 : actor.int < 40 ? 7 : 4;
    for (const intBonus of actor.int > 8 ? [0, 1] : [0]) {
        let damage = input + apply;
        damage += Math.trunc(damage * scale / 50);
        if (intBonus) damage += Math.trunc(damage * intTier / actor.int);
        damage = damage > 1500 ? Math.trunc((damage - 1500) / 4) + 1000 : damage > 500 ? Math.trunc((damage - 500) / 2) + 500 : damage;
        const armor = Math.max(1, sparse(target.temp?.apply ?? {}, 'armor'));
        for (let roll = 0; roll < armor; roll++) {
            let wound = Math.trunc((damage - roll) * percent / 100);
            const character = target.cultivation?.character ?? target.character;
            if (character === '光明磊落') wound -= Math.trunc(wound * 20 / 100);
            wound -= Math.trunc(wound * (target.con - 10) / 100);
            wound = Math.max(0, wound);
            const eff_qi = Math.max(-1, target.eff_qi - wound);
            const qi0 = Math.max(-1, target.qi - damage);
            out.push({ damage, wound, qi: wound ? Math.min(qi0, eff_qi) : qi0, eff_qi });
        }
    }
    return out;
}

// Compose two sequential do_damage support sets (xuanming dual palms). The
// first palm's outcomes become the second palm's starting qi/eff_qi.
export function slice2ComposeSupport(input1, percent1, input2, percent2, actor, target, directType) {
    const out = [];
    for (const s1 of slice2SupportSet(input1, percent1, actor, target, directType)) {
        const mid = { ...target, qi: s1.qi, eff_qi: s1.eff_qi };
        for (const s2 of slice2SupportSet(input2, percent2, actor, mid, directType))
            out.push(s2);
    }
    return out;
}

// Fixed experimental target keeps wudu count at 30 (shen 0, gender 男性).
export function slice2WuduCount(target) {
    return (num(target?.shen) > 0 ? 20 : 0) + ((target?.gender ?? '男性') !== '女性' ? 30 : 0);
}

export function slice2Conditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(slice2SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (slice2ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), slice2ReviewedSourceHash,
            'Reviewed slice-2 sources changed; re-review before sampling');
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
        const group = `slice2-${dir}`;
        const usage = cfg.usage, grant = cfg.grant;
        const actorSkills = level => ({ [usage]: level, [cfg.skill]: level, force: level,
            [cfg.forceSkill]: level, dodge: level, parry: level,
            ...(cfg.learnGate.field === 'shenlong-bashi' ? { 'shenlong-bashi': level } : {}) });
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
                    qualification_sources: [...slice2SourcePaths],
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
        // wudu dp=target force; tiezhang dp=parry+con*8; shenlong two-stage
        // parry then dodge; xuanming dp=dodge+force over two palms.
        if (dir === 'wudu') {
            add('perform', 'hit', { targetForce: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetForce: 100000, samples: smoke ? 1 : 4 });
        } else if (dir === 'tiezhang') {
            add('perform', 'hit', { targetParry: 0, targetProperties: { con: 10 }, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetParry: 100000, samples: smoke ? 1 : 4 });
        } else if (dir === 'shenlong') {
            add('perform', 'hit-parry', { targetParry: 0, samples: smoke ? 1 : 4 });
            add('perform', 'hit-dodge', { targetParry: 100000, targetDodge: 0, samples: smoke ? 1 : 4 });
            add('perform', 'miss', { targetParry: 100000, targetDodge: 100000, samples: smoke ? 1 : 4 });
        } else {
            add('perform', 'hit', { targetDodge: 0, targetForce: 0, samples: smoke ? 1 : 4 });
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

export function validateSlice2Record(raw, condition) {
    const p = condition.parameters, cfg = schools[p.school];
    assert.ok(cfg, 'known school slice');
    assert.equal(p.collection_group, 'slice2-' + p.school);
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
    // Character coverage: wudu requires 心狠手辣/国士无双; xuanming forbids 光明磊落.
    if (cfg.character) {
        const character = t.cultivation?.character ?? t.character ?? b.character ?? b.cultivation?.character;
        const actorCharacter = b.character ?? b.cultivation?.character ?? cfg.character;
        if (p.school === 'wudu')
            assert.ok(['心狠手辣', '国士无双'].includes(actorCharacter), 'wudu character gate');
        if (p.school === 'xuanming')
            assert.notEqual(actorCharacter, '光明磊落', 'xuanming character gate');
        assert.ok(character !== undefined || actorCharacter !== undefined, 'character coverage');
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
        const expectedConditions = copy(t.conditions);
        const poison = v.conditions?.xuanming_poison;
        if (poison && !t.conditions?.xuanming_poison) {
            assert.equal(p.school, 'xuanming', 'only xuanming ordinary can add this poison');
            assert.equal(at.result, 0, 'poison requires a successful ordinary hit');
            const lvl = b.effective_skills.strike;
            assert.ok(lvl >= 300 && b.neili >= 300, 'xuanming hit_ob gates');
            assert.equal(b.mappings.force, 'xuanming-shengong');
            assert.equal(neiliCost, 100, 'xuanming hit_ob fee');
            const level = b.jiali * 3;
            assert.equal(poison.level, level, 'xuanming poison level');
            assert.equal(poison.id, b.id, 'xuanming poison owner');
            assert.equal(poison.name, '玄冥寒毒');
            const duration = level === 0 ? 0 : poison.remain / level;
            assert.ok(Number.isSafeInteger(duration) && (level === 0
                ? poison.remain === 0
                : duration >= Math.trunc(lvl / 60)
                    && duration <= Math.trunc(lvl / 60) + Math.max(0, Math.trunc(lvl / 30) - 1)),
            'xuanming poison duration support');
            assert.deepEqual(Object.keys(poison).sort(), ['id', 'level', 'name', 'remain']);
        }
        stableState(b, a, e => { e.learned = a.learned; e.neili -= neiliCost; });
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.busy = v.busy; e.neili = v.neili;
            if (poison && !t.conditions?.xuanming_poison)
                e.conditions = { ...expectedConditions, xuanming_poison: poison };
            assert.ok(v.busy === null || (Number.isSafeInteger(v.busy) && v.busy >= 0 && v.busy <= 100), 'target busy range');
        });
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
    return validateSlice2Direct(raw, condition, cfg, p, b, t, a, v);
}

function validateSlice2Direct(raw, condition, cfg, p, b, t, a, v) {
    const directs = raw.directs ?? [];
    assert.ok(directs.length <= 2, 'at most two do_damage palms');
    assert.equal(sparse(raw.metrics[0], 'direct'), directs.length, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    assertLearnGain(a, p.skill);
    if (p.school === 'wudu') return validateWuduDirect(raw, cfg, p, b, t, a, v, directs);
    if (p.school === 'tiezhang') return validateTiezhangDirect(raw, cfg, p, b, t, a, v, directs);
    if (p.school === 'shenlong') return validateShenlongDirect(raw, cfg, p, b, t, a, v, directs);
    return validateXuanmingDirect(raw, cfg, p, b, t, a, v, directs);
}

function wuduFinalSideEffects(v, count) {
    // final(): affect_by wudu_shenzhang (level = jiali+random(jiali)+count = count
    // at jiali 0) and receive_wound jing 8+random(4).
    const cnd = v.conditions?.wudu_shenzhang;
    assert.ok(cnd, 'wudu poison applied');
    assert.equal(num(cnd.level), count, 'poison level equals count');
    const jingWound = num(v.eff_jing) === -1 || num(v.jing) === -1 ? null : 1;
    assert.ok(jingWound === null || num(v.eff_jing) >= -1, 'jing wound applied');
}

function validateWuduDirect(raw, cfg, p, b, t, a, v, directs) {
    const count = slice2WuduCount(t);
    const percent = 70 + count;
    const miss = directs.length === 0;
    const fee = miss ? 0 : count;
    assert.equal(b.neili - a.neili, fee, 'wudu branch fee');
    const busyAfter = num(a.busy);
    if (miss) {
        assert.equal(busyAfter, 2, 'miss me busy 2');
        assert.equal(num(v.busy), 1, 'miss target busy 1');
    } else {
        assert.ok([1, 2, 3].includes(busyAfter), 'hit me busy 1+random(3)');
        assert.equal(directs.length, 1, 'wudu single direct');
    }
    if (!miss) {
        const input = num(directs[0].damage);
        const support = slice2SupportSet(input, percent, b, t, cfg.directType);
        assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
            'target resulting state must lie in modeled do_damage support');
        wuduFinalSideEffects(v, count);
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
        // Only wudu_shenzhang is a valid condition change.
        const expectedWuduConditions = { ...t.conditions, wudu_shenzhang: v.conditions?.wudu_shenzhang ?? {} };
        stableState(t, v, e => {
            e.qi = v.qi; e.eff_qi = v.eff_qi; e.jing = v.jing; e.eff_jing = v.eff_jing;
            e.conditions = expectedWuduConditions;
        });
        return { accepted: true, kind: 'direct', hit: true, input, count, percent };
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
    stableState(t, v, e => { e.busy = v.busy; });
    return { accepted: true, kind: 'direct', hit: false, count, percent };
}

function validateTiezhangDirect(raw, cfg, p, b, t, a, v, directs) {
    const miss = directs.length === 0;
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    assert.equal(b.neili - a.neili, fee, 'tiezhang branch fee');
    const busyAfter = num(a.busy);
    assert.equal(busyAfter, miss ? 4 : 3, 'tiezhang busy');
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    assert.equal(directs.length, 1, 'tiezhang single direct');
    const input = num(directs[0].damage);
    const support = slice2SupportSet(input, cfg.percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
    stableState(t, v, e => { e.qi = v.qi; e.eff_qi = v.eff_qi; e.busy = v.busy; e.neili = v.neili; assert.ok(v.busy === null || (Number.isSafeInteger(v.busy) && v.busy >= 0 && v.busy <= 100), 'target busy range'); });
    return { accepted: true, kind: 'direct', hit: true, input };
}

function validateShenlongDirect(raw, cfg, p, b, t, a, v, directs) {
    const miss = directs.length === 0;
    let fee, percent, busyAfter;
    if (miss) {
        fee = cfg.feeMiss; busyAfter = 3;
    } else {
        assert.equal(directs.length, 1, 'shenlong single direct');
        const paid = b.neili - a.neili;
        if (paid === cfg.feeParryHit) { fee = cfg.feeParryHit; percent = 50; busyAfter = 2; }
        else if (paid === cfg.feeDodgeHit) { fee = cfg.feeDodgeHit; percent = 55; busyAfter = 3; }
        else assert.fail(`unknown shenlong fee ${paid}`);
    }
    assert.equal(b.neili - a.neili, fee, 'shenlong branch fee');
    assert.equal(num(a.busy), busyAfter, 'shenlong busy');
    if (miss) {
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    const input = num(directs[0].damage);
    const support = slice2SupportSet(input, percent, b, t, cfg.directType);
    assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
        'target resulting state must lie in modeled do_damage support');
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
    stableState(t, v, e => { e.qi = v.qi; e.eff_qi = v.eff_qi; e.busy = v.busy; e.neili = v.neili; assert.ok(v.busy === null || (Number.isSafeInteger(v.busy) && v.busy >= 0 && v.busy <= 100), 'target busy range'); });
    return { accepted: true, kind: 'direct', hit: true, input, percent };
}

function validateXuanmingDirect(raw, cfg, p, b, t, a, v, directs) {
    // me busy 4 regardless of branch. Fee uniquely identifies which palms hit:
    // both 500, palm1 only 350, palm2 only 400, neither 250.
    assert.equal(num(a.busy), cfg.meBusy, 'xuanming me busy 4');
    const paid = b.neili - a.neili;
    const [hit1, miss1] = cfg.feePalm1, [hit2, miss2] = cfg.feePalm2;
    let palm1, palm2;
    if (paid === hit1 + hit2) { palm1 = true; palm2 = true; }
    else if (paid === hit1 + miss2) { palm1 = true; palm2 = false; }
    else if (paid === miss1 + hit2) { palm1 = false; palm2 = true; }
    else if (paid === miss1 + miss2) { palm1 = false; palm2 = false; }
    else assert.fail(`unknown xuanming fee ${paid}`);
    assert.equal(directs.length, (palm1 ? 1 : 0) + (palm2 ? 1 : 0), 'directs match palm hits');
    if (palm1 || palm2) {
        const cnd = v.conditions?.xuanming_poison;
        assert.ok(cnd, 'xuanming poison applied');
    }
    if (!palm1 && !palm2) {
        stableState(b, a, e => { e.neili -= paid; e.busy = a.busy; e.learned = a.learned; });
        stableState(t, v);
        return { accepted: true, kind: 'direct', hit: false };
    }
    let input1, input2;
    if (palm1 && palm2) {
        input1 = num(directs[0].damage); input2 = num(directs[1].damage);
        const support = slice2ComposeSupport(input1, 60, input2, 80, b, t, cfg.directType);
        assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
            'target resulting state must lie in composed two-palm support');
    } else if (palm1) {
        input1 = num(directs[0].damage);
        const support = slice2SupportSet(input1, 60, b, t, cfg.directType);
        assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
            'target resulting state must lie in modeled palm1 support');
    } else {
        input2 = num(directs[0].damage);
        const support = slice2SupportSet(input2, 80, b, t, cfg.directType);
        assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
            'target resulting state must lie in modeled palm2 support');
    }
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= paid; e.busy = a.busy; e.learned = a.learned; });
    // Only xuanming_poison is a valid condition change; reject any other condition mutation.
    const expectedConditions = { ...t.conditions };
    if (palm1 || palm2) expectedConditions.xuanming_poison = v.conditions?.xuanming_poison ?? {};
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi;
        e.conditions = expectedConditions;
    });
    return { accepted: true, kind: 'direct', hit: palm1 || palm2, input1, input2, palm1, palm2 };
}

export function slice2Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateSlice2Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return { counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
