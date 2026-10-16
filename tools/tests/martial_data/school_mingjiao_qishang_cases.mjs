// Finite original USER slice. This module does not execute a driver or modify game files.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
const skill = 'qishang-quan', health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const noFunction = '你所使用的外功中没有这种功能。\n';
const defaults = { qi: 8000, eff_qi: 9000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 34, shen: 0, gender: '男性', character: '光明磊落' };

export const mingjiaoQishangSourcePaths = [
    'kungfu/class/mingjiao/xiexun.c', 'kungfu/class/mingjiao/mingjiao.h',
    'kungfu/skill/qishang-quan.c', 'kungfu/skill/qishang-quan/fei.c', 'kungfu/skill/qishang-quan/shang.c',
    'kungfu/skill/shenghuo-xinfa.c', 'kungfu/skill/shenghuo-bu.c', 'kungfu/skill/jiuyang-shengong.c',
    'kungfu/skill/buddhism.c', 'kungfu/skill/cuff.c', 'kungfu/skill/parry.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/force.c', 'cmds/skill/perform.c', 'cmds/skill/enable.c',
    'inherit/skill/skill.c', 'inherit/skill/force.c', 'feature/sserver.c', 'feature/skill.c',
    'feature/attack.c', 'feature/action.c', 'mudcore/inherit/action.c', 'feature/damage.c',
    'feature/attribute.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c', 'feature/equip.c',
    'feature/name.c', 'feature/condition.c', 'clone/user/user.c', 'inherit/char/char.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/daemons/masterd.c',
    'adm/single/simul_efun/message.c', 'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
export const mingjiaoQishangReviewedSourceHash = '9e935abd79d7c677e9da91e83a62e1b79a41f09dd41215d6c95a77c8e34f81c3';
const fixedActions = [
    [0, 180, 5, 10, '金戈铁马', '$N气凝如山，一式「金戈铁马」，双拳蓄势而发，击向$n的$l'],
    [40, 220, 5, 15, '木已成舟', '$N身形凝重，劲发腰背，一式「木已成舟」，缓缓向$n推出'],
    [70, 250, 15, 20, '水中捞月', '$N步伐轻灵，两臂伸舒如鞭，一式「水中捞月」，令$n无可躲闪'],
    [100, 290, 5, 30, '火海刀山', '$N身形跃起，一式「火海刀山」，双拳当空击下，势不可挡'],
    [120, 330, 10, 45, '土载万物', '$N身形一矮，一式「土载万物」，两拳自下而上，攻向$n'],
    [140, 350, 25, 60, '阴风惨惨', '$N身形一转，一式「阴风惨惨」，攻向$n的身前身后'],
    [150, 370, 15, 75, '阳光普照', '$N移形换位，步到拳到，一式「阳光普照」，四面八方都是拳影'],
    [160, 390, 20, 100, '七者皆伤', '$N长啸一声，向前踏出一步，双拳中宫直进，一式「七者皆伤」，骤然击向$n的前胸'],
].map(([lvl, force, dodge, damage, skill_name, action]) =>
    ({ action, force, dodge, damage, lvl, skill_name, damage_type: '内伤' }));
const dynamicText = '$N凝神静气，使出极招\x1b[31m 七伤拳之极意 \x1b[0m';

export function mingjiaoQishangConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const evidence = Object.fromEntries(mingjiaoQishangSourcePaths.map(path => {
        const bytes = readSource(path); assert.ok(bytes?.length, path); return [path, sha(bytes)];
    }));
    assert.equal(sha(JSON.stringify(Object.entries(evidence))), mingjiaoQishangReviewedSourceHash,
        'Qishang sources changed: re-review before collecting');
    const sources = Object.fromEntries(['ordinary', 'fei', 'shang'].map(name => {
        const id = name === 'ordinary' ? skill : skill + '/' + name;
        const source = catalog.skills.find(s => s.id === id);
        assert.equal(source?.path, 'kungfu/skill/' + id + '.c');
        assert.equal(source.sha256, evidence[source.path]); return [name, source];
    }));
    const conditions = [];
    function add(ability, level, variant, extra = {}, suite = 'main') {
        const source = sources[ability], method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry && entry.startsWith(source.path));
        const actor = { skills: { cuff: level, [skill]: level, force: level, 'shenghuo-xinfa': level,
            dodge: level, 'shenghuo-bu': level, parry: level, ...extra.skills },
            mappings: { cuff: skill, parry: skill, force: 'shenghuo-xinfa', dodge: 'shenghuo-bu' },
            preparations: extra.noPrepare ? {} : { cuff: skill }, properties: { ...defaults,
                'family/family_name': '明教', 'can_perform/qishang-quan/fei': 1,
                'can_perform/qishang-quan/shang': 1, ...extra.properties } };
        const target = { skills: { force: level * 3, parry: level * 3, dodge: level }, mappings: {},
            preparations: {}, properties: { ...defaults, qi: 10000, eff_qi: 10000 } };
        const label = ability === 'ordinary' ? '七伤拳普通攻击' : ability === 'fei' ? '魂魄飞扬' : '伤字诀';
        const refusal = extra.refusal ?? '';
        conditions.push({ id: `school-mingjiao-qishang-${suite}-${ability}-l${level}-${variant}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? 2 : refusal ? 2 : samples,
            parameters: { school: 'mingjiao', collection_group: 'mingjiao-qishang', skill, usage: 'cuff',
                ability, level, variant, suite, cache_loader_level: suite === 'main' ? 200 : level,
                actor, target, fighting: true, target_state: 'living', named_participants: true,
                action: method === 'ordinary' ? 'ordinary' : `perform cuff.${ability} right`,
                expected: refusal ? 'refused' : 'observed', refusal, refusal_scope: refusal ? 'ability' : '',
                label, not_applicable: '', observation: 'single_action_immediate', observe_seconds: 0,
                capture_skill_loads: [{ skill, path: sources.ordinary.path, sha256: sources.ordinary.sha256 }],
                source_evidence: { ...evidence }, qualification_sources: [...mingjiaoQishangSourcePaths],
                ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                base_source: { path: sources.ordinary.path, sha256: sources.ordinary.sha256 },
                qualification_note: '谢逊原七伤拳路线；真实非巫师USER、空手单备、原命令，加力0。修为及领悟为显式实验初态，不宣称完成教学。'
                    + '靶基础内功/招架均3L、无映射，默认DP=3L与攻击方AP=3L匹配，不是旧中性或同成本公平对照。'
                    + '主系列首载200、后续引用同load_id原缓存；cold400/cold800必须独立驱动，禁止销毁重载或混合缓存均值。'
                    + '反噬、当前气血夹制、随机恢复、目标最终损失分账；返回1不保证造成伤害，不重抽随机或补定时效果。' } });
    }
    // First main job is an ordinary200 cold load, before any performer or altered gate input.
    for (const ability of ['ordinary', 'fei', 'shang']) for (const level of [200, 400, 800])
        add(ability, level, 'baseline', ability === 'shang' && level === 200
            ? { refusal: '你的七伤拳不够娴熟，无法施展「伤字诀」。\n' } : {});
    for (const level of [199, 201]) add('ordinary', level, 'strict-action-boundary');
    for (const max_neili of [7999, 8000]) add('shang', 400, 'max-neili-' + max_neili, { properties: { max_neili } });
    add('shang', 400, 'jiuyang1', { skills: { 'jiuyang-shengong': 1 } });
    for (const buddhism of [399, 400]) add('shang', 400, 'buddhism' + buddhism, { skills: { buddhism } });
    add('shang', 400, 'healing-cap', { properties: { max_neili: 8000, qi: 9998, eff_qi: 9999 } });
    for (const [variant, skills, properties, refusal] of [
        ['skill159', { [skill]: 159 }, {}, '你的七伤拳不够娴熟，无法施展「魂魄飞扬」。\n'],
        ['skill160', { [skill]: 160 }, {}, ''],
        ['force159', { force: 159 }, {}, '你的内功修为还不够，无法施展「魂魄飞扬」\n'],
        ['force160', { force: 160 }, {}, ''],
        ['max2199', {}, { max_neili: 2199, neili: 1000 }, '你内力修为不足，无法施展「魂魄飞扬」\n'],
        ['max2200', {}, { max_neili: 2200, neili: 1000 }, ''],
        ['neili349', {}, { neili: 349 }, '你现在真气不够，无法施展「魂魄飞扬」。\n'],
        ['neili350', {}, { neili: 350 }, ''],
    ]) add('fei', 200, variant, { skills, properties, refusal });
    add('fei', 200, 'no-grant', { properties: { 'can_perform/qishang-quan/fei': 0 }, refusal: noFunction });
    add('fei', 200, 'no-preparation', { noPrepare: true, refusal: '你没有准备使用七伤拳，无法施展「魂魄飞扬」。\n' });
    for (const [variant, skills, properties, refusal] of [
        ['skill219', { [skill]: 219 }, {}, '你的七伤拳不够娴熟，无法施展「伤字诀」。\n'],
        ['skill220', { [skill]: 220 }, {}, ''],
        ['force219', { force: 219 }, {}, '你的内功修为还不够，无法施展「伤字诀」\n'],
        ['force220', { force: 220 }, {}, ''],
        ['neili299', {}, { neili: 299 }, '你现在真气不够，无法施展「伤字诀」。\n'],
        ['neili300', {}, { neili: 300 }, ''],
    ]) add('shang', 400, variant, { skills, properties, refusal });
    add('shang', 400, 'no-grant', { properties: { 'can_perform/qishang-quan/shang': 0 }, refusal: noFunction });
    add('shang', 400, 'no-preparation', { noPrepare: true, refusal: '你没有准备使用七伤拳，无法施展「伤字诀」。\n' });
    for (const level of [400, 800]) add('ordinary', level, 'loader-control', {}, 'cold' + level);
    return conditions;
}

const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v)); return v; };
const field = (v, key) => { assert.ok(Object.hasOwn(map(v), key), 'missing ' + key); return v[key]; };
const integer = v => { assert.ok(Number.isSafeInteger(v)); return v; };
const zero = v => { assert.ok(v === 0 || v === null); return 0; };
const number = v => v === null ? 0 : integer(v);
const count = (m, k) => { const v = Object.hasOwn(map(m), k) ? integer(m[k]) : 0; assert.ok(v >= 0, k); return v; };
const busy = s => { const n = number(field(s, 'busy')); assert.ok(n >= 0); return n; };
const protectedBy = s => s.max_neili >= 8000 || (s.skills['jiuyang-shengong'] ?? 0) > 0 || (s.skills.buddhism ?? 0) >= 400;
const plain = s => s.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');

function initial(s, cfg, side) {
    assert.match(field(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(s.id, side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive', 'living', 'fighting_opponent', 'killing_opponent']) assert.equal(field(s, k), 1);
    for (const k of ['wizardp', 'ghost']) zero(field(s, k));
    assert.equal(busy(s), 0); assert.deepEqual(s.learned, {});
    assert.equal(field(s, 'craze'), 0); assert.equal(field(s, 'max_craze'), 5000);
    for (const k of ['skills', 'mappings', 'preparations']) assert.deepEqual(field(s, k), cfg[k]);
    assert.deepEqual(s.preparation_order, Object.keys(cfg.preparations));
    for (const [k, v] of Object.entries(cfg.properties)) {
        const actual = field(k.includes('/') || k === 'character' ? s.cultivation : s, k);
        if (v === 0) zero(actual); else assert.equal(actual, v, k);
    }
    for (const [k, v] of Object.entries(cfg.skills)) assert.equal(field(s.effective_skills, k),
        Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0));
    assert.equal(s.effective_str, cfg.properties.str + Math.trunc((cfg.skills.cuff ?? 0) / 10));
    assert.equal(s.effective_con, cfg.properties.con + Math.trunc(cfg.skills.force / 10));
    assert.deepEqual(s.temp.apply, { armor: 100 });
    for (const k of ['weapon', 'secondary_weapon', 'handing']) assert.equal(field(s, k), 'none');
    for (const k of ['weapon_details', 'secondary_weapon_details', 'handing_details']) assert.deepEqual(field(s, k), {});
    zero(field(s, 'weapon_damage')); zero(field(s, 'weapon_flag')); assert.deepEqual(field(s, 'conditions') ?? {}, {});
}

function stable(s, before) {
    const a = structuredClone(s), b = structuredClone(before);
    for (const obj of [a, b]) {
        for (const k of [...health, 'busy', 'learned', 'craze']) delete obj[k];
        delete obj.temp.notify_fail; delete obj.temp.fight;
    }
    assert.deepEqual(a, b, 'unrelated observed state must remain unchanged');
}

function loadRecord(raw, c) {
    assert.equal(raw.skill_loads.length, 1, 'one preserved original first load');
    const load = raw.skill_loads[0], p = c.parameters;
    assert.equal(load.skill, skill); assert.equal(load.path, p.base_source.path);
    assert.equal(load.sha256, p.base_source.sha256); assert.equal(load.command, 'enable parry ' + skill);
    assert.equal(typeof load.run_id, 'string'); assert.ok(load.run_id.length);
    assert.equal(load.load_id, load.run_id + ':' + skill);
    const s = load.state, level = p.cache_loader_level;
    assert.match(s.object, /^\/tests\/actor#\d+$/); assert.equal(s.id, 'left');
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(s[k], 1);
    zero(s.wizardp); assert.deepEqual(s.mappings, {}); assert.deepEqual(s.preparations, {});
    for (const k of ['force', 'dodge', 'cuff', skill]) {
        assert.equal(s.skills[k], level); assert.equal(s.effective_skills[k], Math.trunc(level / 2));
    }
    return load;
}

function selectedAction(action, currentLevel, load) {
    assert.ok(integer(action.lvl) < currentLevel, 'strict original action-level gate');
    const support = [...fixedActions.map(a => a.lvl), 200].filter(level => level < currentLevel).slice(-6);
    assert.ok(support.includes(action.lvl), 'original NewRandom keeps the final at most six eligible actions');
    if (action.lvl !== 200) {
        assert.deepEqual(action, fixedActions.find(a => a.lvl === action.lvl), 'original fixed action'); return;
    }
    assert.equal(action.action, dynamicText); assert.equal(action.skill_name, '极意'); assert.equal(action.damage_type, '内伤');
    assert.deepEqual(Object.keys(action).sort(), ['action', 'damage', 'damage_type', 'dodge', 'force', 'lvl', 'skill_name']);
    const s = load.state, f = s.skills.force, d = s.skills.dodge, cuff = s.skills.cuff, effective = s.effective_skills.force;
    for (const [key, low, high] of [['force', Math.trunc(f / 3), Math.trunc(f / 3) + effective - 1],
        ['dodge', Math.trunc(d / 6), Math.trunc(d / 6) + Math.trunc(f / 3) - 1],
        ['damage', Math.trunc(f / 4), Math.trunc(f / 4) + Math.trunc(cuff / 2) - 1]])
        assert.ok(integer(action[key]) >= low && action[key] <= high, 'first-loader range ' + key);
}

function restoreLedger(raw) {
    for (let side = 0; side < 2; side++) for (const key of health) {
        assert.equal(raw.immediate[side][key], raw.before[side][key] - count(raw.metrics[side], key + '_cost')
            + count(raw.metrics[side], key + '_recovery'), 'gross ledger ' + side + ':' + key);
        assert.ok(raw.immediate[side][key] > 0, 'high-resource living experiment');
    }
}

function checkSelfEffect(before, after, incoming, guaranteed) {
    const enabled = guaranteed || incoming >= 150;
    const protectedActor = protectedBy(before), wound = before.eff_qi - after.eff_qi;
    const heal = after.qi - before.qi;
    if (!enabled) {
        assert.equal(wound, 0); assert.equal(heal, 0);
    } else if (!protectedActor) {
        const expected = Math.trunc(before.skills[skill] * 8000 / before.max_neili);
        assert.ok(guaranteed ? wound === expected : [0, expected].includes(wound));
        assert.equal(after.qi, Math.min(before.qi, after.eff_qi), 'original current-qi clipping, not equal to wound fee');
    } else {
        assert.equal(wound, 0, 'receive_heal is not receive_curing');
        assert.ok(heal >= 0 && heal <= Math.min(Math.trunc(before.skills[skill] / 3) - 1,
            before.eff_qi - before.qi), 'original zero-inclusive qi healing support');
    }
    for (const k of ['jing', 'eff_jing']) assert.equal(after[k], before[k]);
    // Both paths call receive_wound(qi, D, me): F_DAMAGE adds D/3 over150.
    // Only ordinary hit_ob explicitly adds D first, independently capped.
    const added = wound > 0 ? (!guaranteed ? wound : 0) + (wound > 150 ? Math.trunc(wound / 3) : 0) : 0;
    assert.equal(after.craze, Math.min(before.max_craze, before.craze + added), 'explicit and receive_wound craze');
    return { eligible: enabled, protected: protectedActor, backlash: wound > 0,
        recovery: heal > 0, recovery_eligible: enabled && protectedActor && before.qi < before.eff_qi };
}

function targetOutcome(damage, wound, t) {
    const eff = Math.max(-1, t.eff_qi - wound), afterDamage = Math.max(-1, t.qi - damage);
    const qi = wound > 0 ? Math.min(afterDamage, eff) : afterDamage;
    return { qi, eff_qi: eff, qi_cost: t.qi - qi, eff_qi_cost: t.eff_qi - eff,
        craze: Math.min(t.max_craze, t.craze + (damage > 150 ? Math.trunc(damage / 5) : 0)
            + (wound > 150 ? Math.trunc(wound / 3) : 0)) };
}
const compressOrdinary = d => d > 400 ? Math.trunc((d - 400) / 4) + 300
    : d > 200 ? Math.trunc((d - 200) / 2) + 200 : Math.max(0, d);
function targetSupport(input, percent, b, t, ordinary = false) {
    const strength = b.str * 2 + b.effective_str;
    const k = strength < 40 ? strength : strength < 70 ? Math.trunc((strength - 30) / 2) + 20
        : Math.trunc((strength - 60) / 4) + 30;
    const base = input + (ordinary ? Math.trunc(input * strength / 300) : Math.trunc(input * k / 50));
    const values = [];
    // Only two original int36 branches and 100 already-observed armor possibilities.
    // Never enumerate the unknown first damage-input roll or call game RNG.
    for (const pre of new Set([base, base + Math.trunc(base * 7 / b.int)])) {
        const damage = ordinary ? compressOrdinary(pre) : pre > 1500 ? Math.trunc((pre - 1500) / 4) + 1000
            : pre > 500 ? Math.trunc((pre - 500) / 2) + 500 : pre;
        // Ordinary receive_wound has a separate random gate after receive_damage.
        // A positive landed hit may legitimately damage qi without any wound.
        if (ordinary) values.push({ damage, ...targetOutcome(damage, 0, t) });
        for (let roll = 0; roll < Math.max(1, t.temp.apply.armor); roll++) {
            let wound = ordinary ? compressOrdinary(pre - roll) : Math.trunc((damage - roll) * percent / 100);
            if (t.cultivation.character === '光明磊落') wound -= Math.trunc(wound * 20 / 100);
            wound -= Math.trunc(wound * (t.con - 10) / 100); wound = Math.max(0, wound);
            values.push({ damage, ...targetOutcome(damage, wound, t) });
        }
    }
    if (ordinary) values.push({ damage: 0, ...targetOutcome(0, 0, t) });
    return values;
}
function targetLedgerSupport(options, raw) {
    const t = raw.immediate[1], m = raw.metrics[1];
    assert.ok(options.some(v => v.qi === t.qi && v.eff_qi === t.eff_qi && v.craze === t.craze
        && v.qi_cost === count(m, 'qi_cost') && v.eff_qi_cost === count(m, 'eff_qi_cost')),
    'target gross losses, wound clipping and craze must share one reachable integer outcome');
}

export function validateMingjiaoQishangRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'mingjiao-qishang'); assert.equal(p.skill, skill); assert.equal(p.usage, 'cuff');
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, condition.method);
    if (raw.outcome === 'error') { assert.ok(typeof raw.reason === 'string' && raw.reason.trim()); return null; }
    assert.equal(raw.outcome, p.expected);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2);
    for (const k of ['actions', 'attacks', 'passives', 'dodge_checks', 'launches', 'refusals', 'defenses',
        'interfaces', 'dropped', 'terminals', 'callbacks', 'skill_loads', 'directs']) assert.ok(Array.isArray(field(raw, k)), k);
    for (const k of ['defenses', 'interfaces', 'dropped', 'terminals', 'callbacks']) assert.deepEqual(raw[k], []);
    assert.deepEqual(raw.after, raw.immediate, 'single immediate window');
    for (const side of [0, 1]) { initial(raw.before[side], side ? p.target : p.actor, side); stable(raw.immediate[side], raw.before[side]); }
    const load = loadRecord(raw, condition); restoreLedger(raw);
    const [a, t] = raw.before, [end, target] = raw.immediate, method = condition.method;
    const accepted = p.expected === 'observed', perf = method === 'perform';
    for (const side of [0, 1]) {
        for (const k of ['heartbeats', 'quick', 'riposte']) assert.equal(count(raw.metrics[side], k), 0);
        for (const k of ['jing', 'eff_jing']) {
            assert.equal(count(raw.metrics[side], k + '_cost'), 0); assert.equal(count(raw.metrics[side], k + '_recovery'), 0);
        }
        assert.equal(count(raw.metrics[side], 'eff_qi_recovery'), 0, 'no invented curing');
        assert.equal(count(raw.metrics[side], 'neili_recovery'), 0);
    }
    assert.equal(count(raw.metrics[1], 'neili_cost'), 0); assert.equal(count(raw.metrics[1], 'qi_recovery'), 0);
    assert.equal(count(raw.metrics[0], 'ability_launched'), Number(perf && accepted));
    assert.equal(count(raw.metrics[1], 'ability_launched'), 0);
    for (const k of ['hit', 'dodge', 'parry', 'direct']) assert.equal(count(raw.metrics[1], k), 0);
    let branch = 'ordinary', self = { eligible: false, protected: protectedBy(a), backlash: false, recovery: false, recovery_eligible: false };
    if (perf) {
        const command = integer(field(raw, 'command_accepted')); assert.ok(command >= 0); assert.equal(command > 0, accepted);
        assert.deepEqual(raw.actions, []); assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.passives, []);
        assert.deepEqual(raw.dodge_checks, []);
        for (const k of ['hit', 'dodge', 'parry']) assert.equal(count(raw.metrics[0], k), 0);
        if (!accepted) {
            assert.deepEqual(raw.launches, []); assert.deepEqual(raw.directs, []);
            assert.equal(plain(raw.reason), p.refusal);
            assert.deepEqual(raw.refusals, [{ actor: a.object, reason: raw.reason }]);
            assert.equal(plain(end.temp.notify_fail), p.refusal);
            for (const side of [0, 1]) for (const k of health) {
                assert.equal(count(raw.metrics[side], k + '_cost'), 0); assert.equal(count(raw.metrics[side], k + '_recovery'), 0);
            }
            assert.equal(busy(end), 0); assert.equal(busy(target), 0); assert.deepEqual(end.learned, a.learned);
            branch = 'refused';
            assert.equal(end.craze, a.craze);
        } else {
            assert.deepEqual(raw.launches, [{ actor: a.object, skill, argument: p.ability + ' right' }]);
            assert.deepEqual(raw.refusals, []); assert.ok(raw.reason === '' || raw.reason === null);
            assert.ok([2, 3].includes(busy(end))); assert.equal(busy(target), 0);
            const hit = busy(end) === 2, protectedActor = protectedBy(a), harmful = hit && p.ability === 'shang' && !protectedActor;
            branch = !hit ? 'gate-miss' : harmful ? 'backlash' : 'direct';
            const ap = a.effective_skills.cuff + a.effective_skills.force;
            const dp = t.effective_skills.force + t.effective_skills.parry;
            const base = p.ability === 'fei' ? Math.trunc(ap / 2) : Math.trunc(ap * 2 / 3);
            if (base > dp) assert.equal(hit, true);
            if (base + ap - 1 <= dp) assert.equal(hit, false);
            assert.equal(raw.directs.length, hit && !harmful ? 1 : 0);
            assert.equal(count(raw.metrics[0], 'direct'), raw.directs.length);
            const fee = p.ability === 'fei' ? hit ? 320 : 180 : !hit ? 120 : harmful ? 0 : 260;
            assert.equal(count(raw.metrics[0], 'neili_cost'), fee); assert.equal(a.neili - end.neili, fee);
            if (p.ability === 'shang' && hit) self = checkSelfEffect(a, end, 0, true);
            else for (const k of ['qi', 'eff_qi']) {
                assert.equal(end[k], a[k]); assert.equal(count(raw.metrics[0], k + '_cost'), 0);
                assert.equal(count(raw.metrics[0], k + '_recovery'), 0);
            }
            if (!(p.ability === 'shang' && hit)) assert.equal(end.craze, a.craze);
            if (raw.directs.length) {
                const d = raw.directs[0]; assert.equal(d.actor, 0); assert.equal(d.target, 1); assert.equal(d.type, 0);
                assert.equal(d.weapon, 'none'); assert.equal(d.weapon_object, '');
                const high = p.ability === 'fei' ? ap + Math.trunc(ap / 2) - 1
                    : ap + Math.trunc(ap / 3) - 1 + a.skills[skill] * 3 - 1;
                assert.ok(integer(d.damage) >= ap && d.damage <= high);
                if (p.ability === 'fei') assert.equal(d.percent, 80);
                else assert.ok(integer(d.percent) >= 70 && d.percent <= 70 + Math.trunc((a.skills[skill] - 1) / 5));
                assert.ok(count(raw.metrics[1], 'qi_cost') > 0, 'direct high-resource target really damaged');
                targetLedgerSupport(targetSupport(d.damage, d.percent, a, t), raw);
            } else for (const k of ['qi', 'eff_qi']) assert.equal(count(raw.metrics[1], k + '_cost'), 0);
            assert.ok(Object.keys(end.learned).every(k => k === skill));
            const progress = count(end.learned, skill);
            if (a.effective_skills[skill] >= 120) assert.equal(progress, 1); else assert.ok([0, 1].includes(progress));
        }
    } else {
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.refusals, []); assert.deepEqual(raw.directs, []);
        assert.deepEqual(end.learned, a.learned); assert.equal(busy(end), 0); assert.equal(busy(target), 0);
        assert.equal(raw.actions.length, 1); assert.equal(raw.attacks.length, 1); assert.equal(raw.dodge_checks.length, 2);
        const action = raw.actions[0], attack = raw.attacks[0];
        for (const e of [action, attack]) { assert.equal(e.actor, 0); assert.equal(e.target, 1); }
        assert.equal(action.skill, skill); selectedAction(action.action, a.skills[skill], load);
        assert.equal(attack.attack_usage, 'cuff'); assert.equal(attack.attack_skill, skill); zero(attack.type); zero(attack.action_flag);
        assert.ok([0, -1, -2].includes(attack.result));
        for (const k of ['apply_attack', 'apply_damage', 'apply_unarmed_damage']) zero(field(attack, k));
        assert.equal(field(attack, 'neili'), a.neili); assert.ok(integer(attack.damage) >= 0);
        for (const [k, result] of [['hit', 0], ['dodge', -1], ['parry', -2]]) assert.equal(count(raw.metrics[0], k), Number(attack.result === result));
        assert.equal(count(raw.metrics[0], 'direct'), 0); assert.equal(count(raw.metrics[0], 'neili_cost'), 0);
        assert.equal(count(raw.metrics[1], 'qi_cost'), attack.damage);
        if (attack.result !== 0) assert.equal(attack.damage, 0);
        assert.equal(raw.passives.length, attack.result === 0 ? 1 : 0);
        for (const [i, d] of raw.dodge_checks.entries()) {
            assert.equal(d.actor, 0); assert.equal(d.target, 1); zero(d.type); zero(d.skill);
            assert.equal(d.phase, i ? 'settled' : 'base'); assert.ok(integer(d.ap) >= 1); assert.ok(integer(d.dp) >= 0); zero(d.busy);
        }
        assert.equal(raw.dodge_checks[0].ap, raw.dodge_checks[1].ap);
        assert.equal(raw.dodge_checks[1].dp, Math.max(1, raw.dodge_checks[0].dp));
        if (raw.passives.length) {
            const event = raw.passives[0];
            assert.equal(event.actor, 0); assert.equal(event.target, 1); assert.equal(event.skill, skill);
            assert.equal(event.route, 'martial'); zero(event.factor); zero(event.result);
            assert.equal(event.before.length, 2); assert.equal(event.after.length, 2);
            assert.equal(event.before[0].object, a.object); assert.equal(event.after[0].object, a.object);
            for (const side of [0, 1]) {
                stable(event.before[side], raw.before[side]);
                for (const k of health) assert.equal(event.before[side][k], raw.before[side][k]);
                assert.equal(event.before[side].craze, raw.before[side].craze);
                assert.deepEqual(event.before[side].learned, raw.before[side].learned);
            }
            stable(event.after[0], event.before[0]);
            assert.equal(event.before[0].qi, a.qi); assert.equal(event.before[0].eff_qi, a.eff_qi);
            assert.deepEqual(event.after[1], event.before[1]);
            const actionForce = a.effective_str + Math.trunc(action.action.force * a.effective_str / 100);
            assert.ok(integer(event.incoming) >= Math.trunc(actionForce / 3)
                && event.incoming <= Math.trunc((actionForce * 2 - 1) / 3), 'original incoming support');
            self = checkSelfEffect(event.before[0], event.after[0], integer(event.incoming), false);
            assert.equal(event.after[0].qi, end.qi); assert.equal(event.after[0].eff_qi, end.eff_qi);
            assert.equal(event.after[0].craze, end.craze);
            assert.equal(event.neili_after, a.neili); assert.equal(event.target_eff_qi_after, event.after[1].eff_qi);
            zero(event.target_busy_after);
            targetLedgerSupport(targetSupport(event.incoming, 100, a, t, true)
                .filter(v => v.damage === attack.damage), raw);
        } else {
            assert.equal(end.qi, a.qi); assert.equal(end.eff_qi, a.eff_qi);
            assert.equal(end.craze, a.craze);
            assert.equal(count(raw.metrics[1], 'eff_qi_cost'), 0);
        }
        assert.deepEqual(end.temp.fight, { attack: action.action.attack ?? null,
            dodge: action.action.dodge, parry: action.action.parry ?? null });
    }
    assert.deepEqual(target.learned, t.learned);
    const wound = t.eff_qi - target.eff_qi;
    // do_damage may wound harder than the immediate damage when percent>100;
    // retain current-qi clipping as a separate observed loss.
    let directDamage = count(raw.metrics[1], 'qi_cost');
    if (raw.directs.length && target.qi === target.eff_qi) {
        // The exact direct input support is checked separately below/at the original consumer.
        // A clamped qi delta cannot identify the pre-clipping damage by itself.
        assert.ok(wound >= 0);
        directDamage = null;
    }
    if (directDamage !== null) assert.equal(target.craze, Math.min(t.max_craze,
        t.craze + (directDamage > 150 ? Math.trunc(directDamage / 5) : 0)
        + (wound > 150 ? Math.trunc(wound / 3) : 0)), 'original target damage/wound craze');
    for (const k of ['qi', 'eff_qi']) {
        assert.equal(count(raw.metrics[0], k + '_cost'), Math.max(0, a[k] - end[k]));
        assert.equal(count(raw.metrics[0], k + '_recovery'), Math.max(0, end[k] - a[k]));
    }
    return { accepted, branch, self, gate_hit: perf && accepted ? busy(end) === 2 : null,
        ordinary_hit: !perf ? raw.attacks[0].result === 0 : null, load_id: load.load_id,
        eligible_passive_calls: !perf && self.eligible ? 1 : 0 };
}

export function validateMingjiaoQishangLoads(records) {
    const runs = new Map();
    for (const row of records) {
        const raw = row.raw ?? row;
        if (!raw.condition_id?.startsWith('school-mingjiao-qishang-') || raw.outcome === 'error') continue;
        assert.equal(raw.skill_loads?.length, 1);
        const load = raw.skill_loads[0], suite = raw.condition_id.match(/^school-mingjiao-qishang-(main|cold400|cold800)-/)?.[1];
        assert.ok(suite); assert.equal(load.load_id, load.run_id + ':' + skill);
        const level = suite === 'main' ? 200 : Number(suite.slice(4));
        const s = load.state;
        assert.equal(s.id, 'left'); assert.equal(s.userp, 1); assert.equal(s.interactive, 1); zero(s.wizardp);
        assert.deepEqual(s.mappings, {}); assert.deepEqual(s.preparations, {});
        for (const k of ['force', 'dodge', 'cuff', skill]) {
            assert.equal(s.skills[k], level); assert.equal(s.effective_skills[k], Math.trunc(level / 2));
        }
        const prior = runs.get(load.run_id);
        if (prior) { assert.equal(prior.suite, suite, 'different cold-load suites require separate drivers'); assert.deepEqual(load, prior.load); }
        else runs.set(load.run_id, { suite, load: structuredClone(load), cached: null });
        const run = runs.get(load.run_id);
        for (const selected of raw.actions ?? []) if (selected.skill === skill && selected.action.lvl === 200) {
            selectedAction(selected.action, 201, load);
            if (run.cached) assert.deepEqual(selected.action, run.cached, 'shared initialized action must not vary between users/levels');
            else run.cached = structuredClone(selected.action);
        }
    }
    return { runs: runs.size, observed_caches: [...runs.values()].filter(x => x.cached).length,
        scope: 'run-local original first-loader cache; no cross-run pooled coefficients' };
}

export function mingjiaoQishangEffects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) {
        const raw = row.raw ?? row; assert.equal(raw.condition_id, condition.id);
        if (row.raw) { assert.equal(row.condition_id, condition.id); assert.equal(row.outcome, raw.outcome); }
        assert.ok(Object.hasOwn(counts, raw.outcome)); counts[raw.outcome]++;
        const obs = validateMingjiaoQishangRecord(raw, condition);
        if (obs) known.push({ raw, obs });
    }
    validateMingjiaoQishangLoads(rows);
    const accepted = known.filter(x => x.obs.accepted), gates = accepted.filter(x => x.obs.gate_hit !== null);
    const ordinary = accepted.filter(x => x.obs.ordinary_hit !== null);
    const harmful = accepted.filter(x => x.obs.self.eligible && !x.obs.self.protected);
    const healing = accepted.filter(x => x.obs.self.recovery_eligible);
    const resources = (side, suffix) => Object.fromEntries(health.filter(k => k !== 'neili')
        .map(k => [k, distribution(known.map(x => count(x.raw.metrics[side], k + suffix)))]));
    return { samples: rows.length, counts, acceptance: probability(accepted.length, known.length),
        gate_hit: probability(gates.filter(x => x.obs.gate_hit).length, gates.length),
        ordinary_hits: probability(ordinary.filter(x => x.obs.ordinary_hit).length, ordinary.length),
        backlash: probability(harmful.filter(x => x.obs.self.backlash).length, harmful.length),
        recovery: probability(healing.filter(x => x.obs.self.recovery).length, healing.length),
        eligible_passive_calls: accepted.reduce((n, x) => n + x.obs.eligible_passive_calls, 0),
        actor_cost: resources(0, '_cost'), actor_recovery: resources(0, '_recovery'), target_cost: resources(1, '_cost'),
        neili_cost: distribution(known.map(x => count(x.raw.metrics[0], 'neili_cost'))),
        busy: distribution(known.map(x => busy(x.raw.immediate[0]))),
        branches: distribution(accepted.map(x => x.obs.branch === 'direct' ? 1 : x.obs.branch === 'backlash' ? 2 : 0)),
        cache_scope: condition.parameters.suite === 'main' ? 'shared first-loader200 original cache' : 'independent ' + condition.parameters.suite,
        craze_gain: distribution(known.map(x => x.raw.immediate[0].craze - x.raw.before[0].craze)),
        unknown_scopes: ['hidden RNG values', 'zero healing does not distinguish zero draw/non-trigger',
            'natural heartbeats and bouts not sampled', 'teaching/cultivation cost not measured'] };
}
