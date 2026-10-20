// School representative slice batch 1 (gaibang/xiaoyao/kunlun/duan). Finite
// reviewed conditions only; no game-code writes and no balance claims.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const terminalPrefix = '\x1b[256D\x1b[K';
const noFunction = '你所使用的外功中没有这种功能。\n';
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 40, con: 36, dex: 34, shen: 0, gender: '男性', character: '光明磊落' };

const schools = {
    gaibang: {
        skill: 'dagou-bang', ability: 'chan', usage: 'staff', grant: 'can_perform/dagou-bang/chan',
        forceSkill: 'huntian-qigong',
        kind: 'control', weapon: 'staff', prepared: 'staff', family: '丐帮',
        title: '打狗棒法「缠字诀」',
        gates: [
            { key: 'level', pair: [59, 60], field: 'skill',
                refusal: '你打狗棒法不够娴熟，难以施展「缠字诀」。\n' },
            { key: 'force', pair: [99, 100], field: 'effective-force',
                refusal: '你的内功火候不足，难以施展「缠字诀」。\n' },
            { key: 'neili', pair: [99, 100], field: 'neili',
                refusal: '你现在的真气不够，难以施展「缠字诀」。\n' },
        ],
        // hit: level/2 + random(level) > target dodge; busy = level/18 + 2, me busy 1; miss: me busy 2.
        // neili fee 50 paid on both branches.
        fee: 50, hitBusy: level => Math.trunc(level / 18) + 2,
    },
    xiaoyao: {
        skill: 'lingbo-weibu', ability: 'ling', usage: 'dodge', grant: 'can_perform/lingbo-weibu/ling',
        forceSkill: 'xiaowuxiang',
        kind: 'buff', weapon: null, prepared: null, family: '逍遥派',
        title: '凌波微步「洛神凌波」',
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你的凌波微步还不够熟练，难以施展「洛神凌波」。\n' },
            { key: 'neili', pair: [599, 600], field: 'neili',
                refusal: '你现在真气不足，难以施展「洛神凌波」。\n' },
        ],
        // count = level/30 temp dex; temp lingbo 1; fee 400; busy 2 only when fighting.
        fee: 400, dexGain: level => Math.trunc(level / 30),
    },
    kunlun: {
        skill: 'qiankun-jian', ability: 'qian', usage: 'sword', grant: 'can_perform/qiankun-jian/qian',
        forceSkill: 'liangyi-shengong',
        kind: 'direct', weapon: 'sword', prepared: 'sword', family: '昆仑派',
        title: '乾坤剑「乾坤劲」', directType: 'WEAPON', percent: 60,
        gates: [
            { key: 'level', pair: [99, 100], field: 'skill',
                refusal: '你的乾坤神剑修为不够，难以施展「乾坤劲」。\n' },
            { key: 'force', pair: [149, 150], field: 'effective-force',
                refusal: '你的内功的修为不够，难以施展「乾坤劲」。\n' },
            { key: 'neili', pair: [299, 300], field: 'neili',
                refusal: '你的真气不够，难以施展「乾坤劲」。\n' },
        ],
        // hit: ap/2 + random(ap) > dp; input = ap/2 + random(ap/2), fee 150, me busy 2;
        // miss: fee 50, me busy 3.
        feeHit: 150, feeMiss: 50, hitInput: ap => [Math.trunc(ap / 2), ap - 1 + Math.trunc(ap / 2 - (ap / 2 - 1))],
    },
    duan: {
        skill: 'yiyang-zhi', ability: 'dian', usage: 'finger', grant: 'can_perform/yiyang-zhi/dian',
        forceSkill: 'duanshi-xinfa',
        kind: 'direct', weapon: null, prepared: 'finger', family: '段氏皇族',
        title: '一阳指「神指点穴」', directType: 'REMOTE', percent: 0,
        gates: [
            { key: 'level', pair: [119, 120], field: 'skill',
                refusal: '你一阳指诀不够娴熟，难以施展「神指点穴」。\n' },
            { key: 'jingluo', pair: [119, 120], field: 'jingluo-xue',
                refusal: '你对经络学了解不够，难以施展「神指点穴」。\n' },
            { key: 'neili', pair: [199, 200], field: 'neili',
                refusal: '你现在的真气不够，难以施展「神指点穴」。\n' },
        ],
        // hit: ap/2 + random(ap) > dp; input = ap/4 + random(ap/2), fee 200, me busy 2,
        // final callback sets target temp no_perform=1; miss: fee 100, me busy 1.
        feeHit: 200, feeMiss: 100,
    },
};

export const slice1SourcePaths = [
    'kungfu/class/gaibang/gaibang.h', 'kungfu/class/xiaoyao/xiaoyao.h',
    'kungfu/class/kunlun/kunlun.h', 'kungfu/class/duan/duan.h',
    'kungfu/skill/dagou-bang.c', 'kungfu/skill/dagou-bang/chan.c',
    'kungfu/skill/lingbo-weibu.c', 'kungfu/skill/lingbo-weibu/ling.c',
    'kungfu/skill/huntian-qigong.c', 'kungfu/skill/xiaowuxiang.c',
    'kungfu/skill/liangyi-shengong.c', 'kungfu/skill/duanshi-xinfa.c',
    'kungfu/skill/qiankun-jian.c', 'kungfu/skill/qiankun-jian/qian.c',
    'kungfu/skill/yiyang-zhi.c', 'kungfu/skill/yiyang-zhi/dian.c',
    'kungfu/skill/staff.c', 'kungfu/skill/sword.c', 'kungfu/skill/finger.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/parry.c', 'kungfu/skill/force.c',
    'cmds/skill/perform.c', 'cmds/skill/learn.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attack.c', 'feature/action.c',
    'mudcore/inherit/action.c', 'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'feature/equip.c', 'feature/name.c', 'feature/condition.c',
    'clone/user/user.c', 'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/weapon/staff.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
// Reviewed original source bytes; drift requires renewed review.
export const slice1ReviewedSourceHash = '1e0ec32ec204ff33f499bd149adb8b0a329a327a5caaf8d29309b3ceb8154b6f';

const baseSkills = { gaibang: 'staff', xiaoyao: 'dodge', kunlun: 'sword', duan: 'finger' };

export function slice1SupportSet(input, percent, actor, target, directType = 'WEAPON') {
    // Faithful port of combatd do_damage support outcomes for the fixed
    // experimental profiles (jiali 0, no count skill, no temp str):
    // damage starts from the perform input plus the original apply bonus
    // (WEAPON uses apply/damage; REMOTE/other get none), then the strength
    // and random int tiers, then the caps. The 光明磊落 20% wound cut is
    // read from the real character (user default), not only the top level.
    // query_str() includes max(hand-skill)/10 on top of raw str
    // (feature/attribute.c), so use effective_str when present.
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
        // combatd clamps armor to 1 after the count-skill reduction.
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

export function slice1Conditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(slice1SourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    if (slice1ReviewedSourceHash !== 'PENDING')
        assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), slice1ReviewedSourceHash,
            'Reviewed slice-1 sources changed; re-review before sampling');
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
        const group = `slice1-${dir}`;
        const usage = cfg.usage, grant = cfg.grant;
        const actorSkills = level => ({ [usage]: level, [cfg.skill]: level, force: level,
            [cfg.forceSkill]: level, dodge: level, parry: level,
            ...(cfg.gates.some(g => g.field === 'jingluo-xue') ? { 'jingluo-xue': level } : {}) });
        function add(method, variant, extra = {}) {
            const level = extra.level ?? 200;
            const skills = { ...actorSkills(level), ...extra.skills };
            for (const [k, v] of Object.entries(skills)) if (v === undefined) delete skills[k];
            const properties = { ...defaults, 'family/family_name': cfg.family, [grant]: 1,
                ...extra.properties };
            const actor = { skills, mappings: { force: cfg.forceSkill, [usage]: cfg.skill },
                preparations: cfg.prepared ? { [cfg.prepared]: cfg.skill } : {},
                properties, ...(cfg.weapon ? { equipment: { type: cfg.weapon, hold: false } } : {}) };
            const target = { skills: { force: level, dodge: extra.targetDodge ?? level,
                parry: extra.targetParry ?? level }, mappings: {}, preparations: {},
                properties: { ...defaults, ...(extra.targetProperties ?? {}) }, ...(extra.targetEquipment ? { equipment: extra.targetEquipment } : {}) };
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
                    qualification_sources: [...slice1SourcePaths],
                    ability_source: { path: method === 'interface' ? base.path : method === 'ordinary' ? base.path : ability.path,
                        sha256: source_evidence[method === 'interface' || method === 'ordinary' ? base.path : ability.path],
                        entry_id },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: `${cfg.title}代表切片：原公开命令、单备、加力0、真实非巫师USER。`
                        + '修为与领悟为显式实验初态，不代表拜师或自然养成。即时窗口，不采自然心跳/到期。'
                        + '目标为固定高资源靶；直伤类按 combatd 原支持集校验，控制/增益类按原字段记账。'
                        + '只收集数据，不比较强弱、不作平衡结论。',
                } });
        }
        // Ordinary + perform baselines: random outcomes need 100 samples.
        add('ordinary', 'baseline-l200', { samples: smoke ? 1 : samples });
        add('perform', 'baseline-l200', { samples: smoke ? 1 : samples });
        // Branch-certainty pairs: force hit / force miss by target parry extremes.
        add('perform', 'hit', { targetParry: 0, samples: smoke ? 1 : 4 });
        add('perform', 'miss', { targetParry: 100000, samples: smoke ? 1 : 4 });
        // Qualification boundary pairs (低/高一档).
        for (const gate of cfg.gates) {
            const [low, high] = gate.pair;
            // chan.c checks query_skill("force") (effective = raw/2 + mapped);
            // crossing the gate value needs the mapped force skill at the
            // boundary with raw force 0.
            const edit = value => gate.field === 'skill' ? { skills: { [cfg.skill]: value } }
                : gate.field === 'neili' ? { properties: { neili: value } }
                : gate.field === 'max_neili' ? { properties: { max_neili: value } }
                : gate.field === 'effective-force' ? { skills: { force: 0, [cfg.forceSkill]: value } }
                : { skills: { [gate.field]: value } };
            add('perform', `gate-${gate.key}-${low}`, { ...edit(low), level: 200,
                refusal: gate.refusal, samples: 2 });
            add('perform', `gate-${gate.key}-${high}`, { ...edit(high), level: 200, samples: 2 });
        }
        // valid_learn boundary pair: one low refusal + one acceptance at high.
        const learnGate = cfg.skill === 'dagou-bang' ? { field: 'staff', pair: [99, 100], refusal: '你的基本杖法不够，无法学习打狗棒法。\n' }
            : cfg.skill === 'qiankun-jian' ? { field: 'effective-force', pair: [179, 180], refusal: '你的内功火候不到，无法学习乾坤神剑。\n' }
            : cfg.skill === 'yiyang-zhi' ? { field: 'con', pair: [33, 34], refusal: '你的先天根骨欠佳，无法修炼一阳指。\n' }
            : { field: 'dex', pair: [29, 30], refusal: '你先天身法太差，无法学习凌波微步。\n' };
        // dagou-bang valid_learn also requires staff >= its own level; the
        // boundary pair keeps both at the same value so only the tested
        // absolute gate differs.
        const learnEdit = value => ['con', 'int', 'dex'].includes(learnGate.field)
            ? { properties: { [learnGate.field]: value } }
            : learnGate.field === 'effective-force'
                ? { skills: { force: 0, [cfg.forceSkill]: value } }
                : cfg.skill === 'dagou-bang'
                    ? { skills: { staff: value, [cfg.skill]: value } }
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
    // Command prompt traces and the original in-window fight-bonus mapping are
    // window artifacts (roll values are random); compare around them but keep
    // their shape honest.
    delete expected.temp.notify_fail; delete actual.temp.notify_fail;
    for (const side of [expected, actual]) {
        if (side.temp && side.temp.fight) {
            const fight = side.temp.fight;
            for (const k of ['attack', 'dodge', 'parry'])
                assert.ok(fight[k] === null || Number.isSafeInteger(fight[k]), 'fight temp shape');
            delete side.temp.fight;
        }
        // Weapon wear from combat use reduces consistence by design.
        if (side.weapon_details) side.weapon_details.consistence = 0;
    }
    if (mutate) mutate(expected);
    assert.deepEqual(actual, expected, 'unexplained state mutation');
}

// Real combat use may improve the used skill by at most one point in-window.
function assertLearnGain(after, skill) {
    const learned = after.learned ?? {};
    for (const k of Object.keys(learned)) assert.equal(k, skill, 'unexpected learned key');
    assert.ok([0, 1].includes(learned[skill] ?? 0), 'original single-use learn gain');
}

export function validateSlice1Record(raw, condition) {
    const p = condition.parameters, cfg = schools[p.school];
    assert.ok(cfg, 'known school slice');
    assert.equal(p.collection_group, 'slice1-' + p.school);
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
        // Ordinary attacks may drain neili via mapped force auto-exertion;
        // trust the observed metric for the resource delta.
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
    if (cfg.kind === 'control') {
        assert.equal(b.neili - a.neili, cfg.fee, 'fixed control fee');
        const busyAfter = num(a.busy), tBusy = num(v.busy);
        const hit = busyAfter === 1;
        assert.ok([1, 2].includes(busyAfter), 'original me busy 1 hit / 2 miss');
        assert.equal(tBusy, hit ? cfg.hitBusy(num(sparse(a.skills, cfg.skill))) : 0);
        assertLearnGain(a, p.skill);
        stableState(b, a, e => { e.neili -= cfg.fee; e.busy = a.busy; e.learned = a.learned; });
        stableState(t, v, e => { e.busy = v.busy; });
        return { accepted: true, kind: 'control', hit };
    }
    if (cfg.kind === 'buff') {
        const gain = cfg.dexGain(num(sparse(a.skills, cfg.skill)));
        assert.equal(b.neili - a.neili, cfg.fee);
        assert.equal(sparse(a.temp, 'lingbo'), 1);
        assert.equal(sparse(a.temp, 'dex'), sparse(b.temp, 'dex') + gain, 'original dex gain');
        assert.equal(num(a.busy), p.fighting ? 2 : 0);
        assertLearnGain(a, p.skill);
        stableState(b, a, e => {
            e.learned = a.learned;
            e.neili -= cfg.fee; e.busy = a.busy; if (a.temp.dex === null) { delete e.temp.dex; } else e.temp.dex = a.temp.dex; e.temp.lingbo = 1;
        });
        stableState(t, v);
        return { accepted: true, kind: 'buff', gain };
    }
    const directs = raw.directs ?? [];
    const miss = directs.length === 0;
    assert.equal(directs.length, miss ? 0 : 1, 'do_damage only on hit branch');
    // The original do_damage path counts one direct metric on the hit branch.
    assert.equal(sparse(raw.metrics[0], 'direct'), miss ? 0 : 1, 'direct');
    assert.equal(sparse(raw.metrics[1], 'direct'), 0, 'direct');
    const input = miss ? 0 : num(directs[0].damage);
    const fee = miss ? cfg.feeMiss : cfg.feeHit;
    assert.equal(b.neili - a.neili, fee, 'branch fee');
    const busyAfter = num(a.busy);
    assert.equal(busyAfter, miss ? (cfg.skill === 'qiankun-jian' ? 3 : 1) : 2);
    if (!miss) {
        const support = slice1SupportSet(input, cfg.percent, b, t, cfg.directType);
        assert.ok(support.some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
            'target resulting state must lie in modeled do_damage support');
    }
    const noPerform = cfg.skill === 'yiyang-zhi' && !miss;
    if (noPerform) assert.equal(sparse(v.temp, 'no_perform'), 1);
    assertLearnGain(a, p.skill);
    stableState(b, a, e => { e.neili -= fee; e.busy = a.busy; e.learned = a.learned; });
    stableState(t, v, e => {
        e.qi = v.qi; e.eff_qi = v.eff_qi;
        if (noPerform) e.temp.no_perform = 1;
    });
    return { accepted: true, kind: 'direct', hit: !miss, input };
}

export function slice1Effects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome));
        counts[row.outcome]++;
        if (['observed', 'refused'].includes(row.outcome)) known.push(validateSlice1Record(row.raw, condition));
    }
    const accepted = known.filter(k => k && k.accepted);
    return { counts, samples: rows.length,
        accepted: probability(accepted.length, known.length),
        hits: probability(accepted.filter(k => k && k.hit).length, accepted.length),
        inputs: distribution(known.filter(k => k && k.input !== undefined).map(k => k.input)),
    };
}
