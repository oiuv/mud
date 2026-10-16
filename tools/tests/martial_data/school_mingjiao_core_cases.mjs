// Prepared finite slice; no driver, model, game-code or shared registration writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const skill = 'hanbing-mianzhang', grant = `can_perform/${skill}/jue`;
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 34, shen: 0, gender: '男性', character: '光明磊落' };
const noFunction = '你所使用的外功中没有这种功能。\n';
const terminalPrefix = '\x1b[256D\x1b[K';

export const mingjiaoCoreSourcePaths = [
    'kungfu/class/mingjiao/weiyixiao.c', 'kungfu/class/mingjiao/mingjiao.h',
    'kungfu/skill/hanbing-mianzhang.c', 'kungfu/skill/hanbing-mianzhang/jue.c',
    'kungfu/skill/shenghuo-xinfa.c', 'kungfu/skill/qingfu-shenfa.c',
    'kungfu/skill/strike.c', 'kungfu/skill/parry.c', 'kungfu/skill/dodge.c', 'kungfu/skill/force.c',
    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'inherit/skill/force.c', 'feature/sserver.c',
    'feature/skill.c', 'feature/attack.c', 'feature/action.c', 'mudcore/inherit/action.c',
    'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c',
    'feature/equip.c', 'feature/name.c', 'feature/condition.c', 'clone/user/user.c',
    'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/misc/equip.c',
    'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
// Reviewed original source bytes. Source drift requires renewed review, not new automatic acceptance.
export const mingjiaoCoreReviewedSourceHash = '28f2f9d0e408247b0fd7b867ebc76c45188901d2072b34d68db81acdbb07894f';
export const mingjiaoCoreActions = [
    [0, 100, 15, 20, 10, '大江东去', '$N一式「大江东去」，双掌大开大合，直向$n的$l击去'],
    [30, 130, 10, 15, 20, '黄河九曲', '$N身形一变，一式「黄河九曲」，双掌似曲似直，拍向$n的$l'],
    [60, 160, 20, 20, 25, '湖光山色', '$N使一式「湖光山色」，左掌如微风拂面，右掌似细雨缠身，直取$n的$l'],
    [80, 180, 20, 30, 30, '曾经沧海', '$N两掌一分，一式「曾经沧海」，隐隐发出潮声，向$n横击过去'],
    [100, 210, 25, 20, 35, '水光潋滟', '$N身形一转，使出一式「水光潋滟」，只见漫天掌影罩住了$n的全身'],
    [120, 250, 25, 25, 40, '小雨初晴', '$N突然身形一缓，使出一式「小雨初晴」，左掌凝重，右掌轻盈，击往$n的$l'],
    [140, 280, 30, 30, 50, '风雪江山', '$N使一式「风雪江山」，双掌挟狂风暴雪之势，猛地劈向$n的$l'],
    [150, 300, 30, 35, 60, '霜华满地', '$N一招「霜华满地」，双掌带着萧瑟的秋气，拍向$n的$l'],
    [160, 320, 40, 45, 80, '仙乡冰舸', '$N身法陡然一变，使出一式「仙乡冰舸」，掌影千变万幻，令$n无法躲闪'],
    [180, 330, 45, 50, 100, '冰霜雪雨', '$N清啸一声，一式「冰霜雪雨」，双掌挥舞，如同雪花随风而转，击向$n的$l'],
].map(([lvl, force, dodge, parry, damage, skill_name, action]) =>
    ({ action, force, dodge, parry, damage, lvl, skill_name, damage_type: '瘀伤' }));

export function mingjiaoCoreConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source_evidence = Object.fromEntries(mingjiaoCoreSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    assert.equal(hash(JSON.stringify(Object.entries(source_evidence))), mingjiaoCoreReviewedSourceHash,
        'Reviewed Mingjiao sources changed; re-review before sampling');
    const base = catalog.skills.find(s => s.id === skill), ability = catalog.skills.find(s => s.id === `${skill}/jue`);
    for (const [s, path] of [[base, `kungfu/skill/${skill}.c`], [ability, `kungfu/skill/${skill}/jue.c`]]) {
        assert.equal(s?.path, path); assert.equal(s.sha256, source_evidence[path]);
    }
    function entry(source, role) {
        const e = source.entries.find(e => e.role === role)?.id;
        assert.match(e ?? '', new RegExp('^' + source.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\d+:' + role + '$'));
        return e;
    }
    // Catalog inventories effect entries, not ordinary query_action; the real file is its entry.
    const ordinaryEntry = base.path, performEntry = entry(ability, 'perform');
    const result = [];
    function add(method, variant, level = 200, extra = {}) {
        const actor = { skills: { strike: level, [skill]: level, parry: level, dodge: level,
            force: level, 'shenghuo-xinfa': level, 'qingfu-shenfa': level, ...extra.skills },
            mappings: { force: 'shenghuo-xinfa', strike: skill, parry: skill, dodge: 'qingfu-shenfa' },
            preparations: extra.noPrepare ? {} : { strike: skill }, properties: {
                ...defaults, 'family/family_name': '明教', [grant]: 1, ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}) };
        if (extra.noMap) delete actor.mappings.strike;
        const target = { skills: { force: level, dodge: level, parry: 3 * level }, mappings: {},
            preparations: {}, properties: { ...defaults } };
        const source = method === 'ordinary' ? base : ability;
        const entry_id = method === 'ordinary' ? ordinaryEntry : performEntry;
        result.push({ id: `school-mingjiao-core-${method}-l${level}-${variant}`, stage: 'school', entry_id,
            method, samples: smoke ? 2 : extra.refusal ? 2 : samples,
            parameters: { school: 'mingjiao', collection_group: 'mingjiao-core', skill, usage: 'strike',
                ability: method === 'perform' ? 'jue' : 'ordinary', level, variant, actor, target,
                named_participants: true, fighting: !extra.noFight, target_state: 'living',
                action: method === 'perform' ? 'perform strike.jue right' : 'ordinary',
                observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                refusal_scope: extra.noMap ? 'command' : extra.refusal ? 'ability' : '', not_applicable: '',
                source_evidence: { ...source_evidence }, qualification_sources: [...mingjiaoCoreSourcePaths],
                ability_source: { path: source.path, sha256: source.sha256, entry_id },
                base_source: { path: base.path, sha256: base.sha256 },
                qualification_note: '韦一笑原寒冰绵掌路线；非巫师原USER、原公开命令、单备、加力0。'
                    + '修为及领悟为显式实验初态，不代表拜师或自然养成完成。'
                    + '对手基本招架为3倍等级且无映射（有效招架=攻击方有效掌法），用于观察原判定两分支，'
                    + '不是同级公平对照，不混旧中性对手数据。仅即时窗口；原随机3–7击和30/击费用保留。'
                    + 'apply/damage与apply/unarmed_damage分别观察，不把徒手路径未读的属性当成实际增伤。',
            } });
    }
    for (const method of ['ordinary', 'perform']) for (const level of [200, 400, 800]) add(method, 'baseline', level);
    const refused = (variant, reason, extra = {}) => add('perform', variant, 200, { ...extra, refusal: reason });
    refused('skill99', '你寒冰绵掌不够娴熟，难以施展「连绵不绝」。\n', { skills: { [skill]: 99 } });
    add('perform', 'skill100', 200, { skills: { [skill]: 100 } });
    refused('neili249', '你现在的真气不够，难以施展「连绵不绝」。\n', { properties: { neili: 249 } });
    add('perform', 'neili250', 200, { properties: { neili: 250 } });
    refused('no-grant', noFunction, { properties: { [grant]: 0 } });
    refused('no-fighting', '「连绵不绝」只能对战斗中的对手使用。\n', { noFight: true });
    // Exact public command sentence depends on original to_chinese(...)[4..7] UTF-8 behavior.
    // Freeze the original distinguishing suffix; all state/calls still require full refusal closure.
    refused('no-mapping', '中并没有这种外功。\n', { noMap: true });
    refused('no-preparation', '你没有准备寒冰绵掌，难以施展「连绵不绝」。\n', { noPrepare: true });
    refused('weapon', '「连绵不绝」只能空手施展。\n', { weapon: true });
    return result;
}

function map(v, name = 'mapping') { assert.ok(v && typeof v === 'object' && !Array.isArray(v), name); return v; }
function field(v, key) { assert.ok(Object.hasOwn(v, key), 'missing ' + key); return v[key]; }
function int(v, name) { assert.ok(Number.isSafeInteger(v), name); return v; }
function sparse(v, key) { map(v); return int(Object.hasOwn(v, key) ? v[key] : 0, key); }
function count(v, key) { const n = sparse(v, key); assert.ok(n >= 0, key); return n; }
function zero(v, key) { const n = field(v, key); assert.ok(n === null || n === 0, key); return 0; }
function observed(v, key) { const n = field(v, key); return n === null ? 0 : int(n, key); }
function busy(v) { const n = field(v, 'busy'); assert.ok(n === null || Number.isSafeInteger(n) && n >= 0); return n ?? 0; }
function initial(s, cfg, side, p) {
    assert.match(s?.object ?? '', /^\/tests\/actor#\d+$/); assert.equal(s.id, side ? 'right' : 'left');
    for (const key of ['userp', 'interactive', 'playerp', 'living']) assert.equal(field(s, key), 1);
    for (const key of ['wizardp', 'ghost']) assert.equal(field(s, key), 0);
    assert.equal(field(s, 'fighting_opponent'), Number(p.fighting));
    assert.equal(field(s, 'killing_opponent'), Number(p.fighting));
    assert.equal(busy(s), 0); assert.deepEqual(s.learned, {});
    assert.deepEqual(s.skills, cfg.skills); assert.deepEqual(s.mappings, cfg.mappings);
    assert.deepEqual(s.preparations, cfg.preparations); assert.deepEqual(s.preparation_order, Object.keys(cfg.preparations));
    const apply = map(map(s.temp).apply), expected = { armor: 100, ...(cfg.equipment ? { damage: 50, dodge: -1 } : {}) };
    for (const k of new Set([...Object.keys(apply), ...Object.keys(expected)])) assert.equal(sparse(apply, k), expected[k] ?? 0);
    for (const key of ['action_flag', 'guarding', 'no_perform', 'str', 'debuff']) if (Object.hasOwn(s.temp, key)) zero(s.temp, key);
    for (const [key, value] of Object.entries(cfg.skills)) assert.equal(field(map(s.effective_skills), key),
        Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + sparse(apply, key));
    const strongest = Math.max(0, ...['unarmed', 'hand', 'finger', 'strike', 'claw', 'cuff'].map(k => cfg.skills[k] ?? 0));
    assert.equal(s.effective_str, cfg.properties.str + Math.trunc(strongest / 10));
    assert.equal(s.effective_con, cfg.properties.con + Math.trunc(cfg.skills.force / 10));
    for (const [key, value] of Object.entries(cfg.properties)) {
        const from = key.includes('/') || key === 'character' ? map(s.cultivation) : s;
        if (key === grant && value === 0) zero(from, key); else assert.equal(field(from, key), value, key);
    }
    assert.equal(s.weapon, cfg.equipment ? 'sword' : 'none'); assert.equal(s.weapon_damage, cfg.equipment ? 50 : 0);
    assert.equal(s.weapon_flag, cfg.equipment ? 4 : 0);
    for (const key of ['secondary_weapon', 'handing']) assert.equal(field(s, key), 'none');
    for (const key of ['secondary_weapon_details', 'handing_details']) assert.deepEqual(field(s, key), {});
    if (!cfg.equipment) assert.deepEqual(s.weapon_details, {});
    else {
        assert.match(s.weapon_details?.object ?? '', /^\/tests\/sword#\d+$/);
        for (const [key, value] of Object.entries({ program: '/tests/sword', skill_type: 'sword', weight: 3000,
            damage: 50, flag: 4, consistence: 100 })) assert.equal(s.weapon_details[key], value);
    }
    assert.deepEqual(field(s, 'conditions') ?? {}, {});
}
function stable(s, b) {
    for (const key of ['object', 'id', 'userp', 'interactive', 'playerp', 'wizardp', 'living', 'ghost',
        'skills', 'effective_skills', 'mappings', 'preparations', 'preparation_order', 'cultivation',
        'effective_str', 'effective_con', 'fighting_opponent', 'killing_opponent', 'weapon', 'weapon_damage',
        'weapon_flag', 'weapon_details', 'secondary_weapon', 'secondary_weapon_details', 'handing',
        'handing_details', 'conditions', ...Object.keys(defaults).filter(k => !health.includes(k) && k !== 'character')])
        assert.deepEqual(field(s, key), field(b, key), key);
    for (const k of new Set([...Object.keys(map(s.temp?.apply)), ...Object.keys(map(b.temp?.apply))]))
        assert.equal(sparse(s.temp.apply, k), sparse(b.temp.apply, k), 'unrestored apply/' + k);
    // Do not mask additional observational fields (e.g. raw affected state) added by the runner.
    const known = new Set(['temp', 'busy', 'learned', ...health]);
    for (const k of new Set([...Object.keys(s), ...Object.keys(b)])) if (!known.has(k)) assert.deepEqual(s[k], b[k], k);
}
function incomingBounds(action, b) {
    const force = b.effective_str + Math.trunc(action.force * b.effective_str / 100);
    return [Math.trunc(force / 3), Math.trunc((force * 2 - 1) / 3)];
}
function damageOptions(incoming, b) {
    const strength = incoming + Math.trunc(incoming * (b.str * 2 + b.effective_str) / 300);
    const compress = v => v > 400 ? Math.trunc((v - 400) / 4) + 300 : v > 200 ? Math.trunc((v - 200) / 2) + 200 : v;
    return [0, compress(strength), compress(strength + Math.trunc(strength * 7 / b.int))];
}

// Match each already-observed hit to the original finite armor/character/con support.
// No additional skill call, RNG, or sampler action is performed here.
function woundOptions(incoming, b, t, dealt) {
    if (dealt === 0) return new Set([0]);
    const compress = v => v > 400 ? Math.trunc((v - 400) / 4) + 300
        : v > 200 ? Math.trunc((v - 200) / 2) + 200 : Math.max(0, v);
    const strength = incoming + Math.trunc(incoming * (b.str * 2 + b.effective_str) / 300);
    const values = new Set([0]), armor = sparse(t.temp.apply, 'armor');
    for (const damage of [strength, strength + Math.trunc(strength * 7 / b.int)]) {
        if (compress(damage) !== dealt) continue;
        for (let roll = 0; roll < Math.max(1, armor); roll++) {
            let wound = compress(damage - roll);
            if (t.cultivation.character === '光明磊落') wound -= Math.trunc(wound * 20 / 100);
            wound -= Math.trunc(wound * (t.con - 10) / 100);
            values.add(wound);
        }
    }
    return values;
}

export function validateMingjiaoCoreRecord(raw, condition) {
    const p = condition.parameters, perform = condition.method === 'perform', accepted = p.expected === 'observed';
    assert.equal(p.collection_group, 'mingjiao-core'); assert.equal(p.skill, skill); assert.equal(p.usage, 'strike');
    assert.equal(p.action, perform ? 'perform strike.jue right' : 'ordinary');
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, condition.method);
    assert.equal(raw.outcome, p.expected); assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['actions', 'attacks', 'passives', 'dodge_checks', 'launches', 'refusals', 'defenses',
        'interfaces', 'dropped', 'terminals', 'callbacks', 'skill_loads']) assert.ok(Array.isArray(raw[key]), key);
    for (const key of ['defenses', 'interfaces', 'dropped', 'terminals', 'callbacks', 'skill_loads']) assert.deepEqual(raw[key], []);
    if (Object.hasOwn(raw, 'directs')) assert.deepEqual(raw.directs, []);
    assert.deepEqual(raw.after, raw.immediate, 'immediate-only, no natural heartbeat');
    if (perform) {
        assert.ok(int(field(raw, 'command_accepted'), 'command cost') >= 0);
        assert.equal(raw.command_accepted > 0, accepted);
    }
    const [b, t] = raw.before, [a, end] = raw.immediate;
    for (const side of [0, 1]) {
        initial(raw.before[side], side ? p.target : p.actor, side, p); stable(raw.immediate[side], raw.before[side]);
        for (const key of ['direct', 'quick', 'riposte', 'heartbeats']) assert.equal(count(raw.metrics[side], key), 0);
        for (const key of health) {
            assert.equal(count(raw.metrics[side], key + '_recovery'), 0);
            assert.equal(int(raw.immediate[side][key], key), raw.before[side][key] - count(raw.metrics[side], key + '_cost'));
        }
        assert.equal(count(raw.metrics[side], 'ability_launched'), !side && perform && accepted ? 1 : 0);
    }
    for (const key of ['hit', 'dodge', 'parry']) assert.equal(count(raw.metrics[1], key), 0);
    if (perform && accepted) {
        assert.deepEqual(raw.launches, [{ actor: b.object, skill, argument: 'jue right' }]);
        assert.deepEqual(raw.refusals, []); assert.ok(raw.reason === '' || raw.reason === null); assert.equal(a.temp.notify_fail, noFunction);
    } else if (!accepted) {
        assert.deepEqual(raw.launches, []); assert.equal(typeof raw.reason, 'string');
        const plain = raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
        if (p.refusal_scope === 'command') { assert.ok(plain.startsWith('你现在的')); assert.ok(plain.endsWith(p.refusal)); }
        else assert.equal(plain, p.refusal);
        assert.deepEqual(raw.refusals, [{ actor: b.object, reason: raw.reason }]);
        assert.equal(a.temp.notify_fail, raw.reason.startsWith(terminalPrefix) ? raw.reason.slice(terminalPrefix.length) : raw.reason);
    } else {
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.refusals, []); assert.ok(raw.reason === '' || raw.reason === null);
        assert.deepEqual(a.temp.notify_fail, b.temp.notify_fail);
    }
    assert.deepEqual(end.temp.notify_fail, t.temp.notify_fail); assert.deepEqual(end.learned, t.learned);
    const progress = sparse(map(a.learned), skill);
    assert.ok(Object.keys(a.learned).every(k => k === skill));
    if (!perform || !accepted) assert.deepEqual(a.learned, b.learned);
    else if (b.effective_skills[skill] >= 120) assert.equal(progress, 1); else assert.ok([0, 1].includes(progress));
    const n = raw.attacks.length, ap = b.effective_skills.strike, gateBonus = Math.trunc(ap / 2);
    const allowedCounts = new Set(Array.from({ length: Math.trunc(ap / 40) }, (_, i) => Math.min(7, 3 + i)));
    assert.ok(accepted ? perform ? allowedCounts.has(n) : n === 1 : n === 0, 'original attack-time support');
    assert.equal(raw.actions.length, n); assert.equal(raw.dodge_checks.length, n * 2);
    const fee = accepted && perform ? n * 30 : 0, neili = b.neili - fee;
    let qi = t.qi, effQi = t.eff_qi, targetBusy = busy(t), passiveIndex = 0, bonus = null,
        damageTotal = 0, woundTotal = 0, busyOpportunities = 0, busyStarts = 0;
    for (let i = 0; i < n; i++) {
        const hit = raw.attacks[i], selected = raw.actions[i];
        for (const e of [hit, selected]) { assert.equal(e.actor, 0); assert.equal(e.target, 1); }
        zero(hit, 'type'); zero(hit, 'action_flag'); assert.ok([0, -1, -2].includes(hit.result));
        assert.equal(hit.attack_usage, 'strike'); assert.equal(hit.attack_skill, skill); assert.equal(selected.skill, skill);
        const delta = observed(hit, 'apply_attack') - sparse(b.temp.apply, 'attack');
        assert.ok(perform ? delta === 0 || delta === gateBonus : delta === 0);
        // Preserve original strict AP/2+random(AP)>DP support, not an assumed 50% gate.
        const dp = t.effective_skills.parry;
        if (Math.trunc(ap / 2) + ap - 1 <= dp) assert.equal(delta, 0);
        if (Math.trunc(ap / 2) > dp) assert.equal(delta, gateBonus);
        if (bonus === null) bonus = delta; else assert.equal(delta, bonus, 'one gate decision per command');
        assert.equal(observed(hit, 'apply_damage'), sparse(b.temp.apply, 'damage') + (perform ? Math.trunc(delta / 2) : 0));
        assert.equal(observed(hit, 'apply_unarmed_damage'), 0, 'original jue does NOT add unarmed_damage');
        assert.equal(field(hit, 'neili'), neili, 'entire planned hit fee paid before loop');
        const action = map(selected.action), available = mingjiaoCoreActions.filter(x => b.skills[skill] > x.lvl).slice(-6);
        const original = available.find(x => x.lvl === action.lvl); assert.ok(original); assert.deepEqual(action, original);
        const [base, settled] = raw.dodge_checks.slice(i * 2, i * 2 + 2);
        for (const [e, phase] of [[base, 'base'], [settled, 'settled']]) {
            assert.equal(e.actor, 0); assert.equal(e.target, 1); zero(e, 'type'); zero(e, 'skill'); assert.equal(e.phase, phase);
            assert.ok(int(e.ap, 'AP') >= 1); assert.ok(int(e.dp, 'DP') >= 0);
        }
        assert.equal(base.ap, settled.ap); assert.equal(busy(base), busy(settled));
        const hitBusy = busy(base);
        if (perform && targetBusy === 0) { assert.ok([0, 1].includes(hitBusy)); busyOpportunities++; if (hitBusy) busyStarts++; }
        else assert.equal(hitBusy, targetBusy);
        assert.equal(settled.dp, hitBusy ? Math.trunc(Math.max(1, base.dp) / 3) : Math.max(1, base.dp));
        const dealt = int(hit.damage, 'damage'); assert.ok(dealt >= 0);
        if (hit.result !== 0) assert.equal(dealt, 0);
        else {
            const event = raw.passives[passiveIndex++]; assert.ok(event, 'missing real martial hit_ob');
            assert.equal(event.actor, 0); assert.equal(event.target, 1); assert.equal(event.route, 'martial'); assert.equal(event.skill, skill);
            zero(event, 'result'); zero(event, 'factor');
            const [low, high] = incomingBounds(action, b); assert.ok(int(event.incoming, 'incoming') >= low && event.incoming <= high);
            assert.ok(damageOptions(event.incoming, b).includes(dealt));
            assert.equal(event.before?.length, 2); assert.equal(event.after?.length, 2);
            assert.deepEqual(event.after, event.before, 'jiali0 returns before ice_poison; no invented poison effect');
            for (const side of [0, 1]) {
                const snapshot = structuredClone(event.before[side]), first = raw.before[side];
                if (side === 0) {
                    snapshot.temp.apply.attack = sparse(snapshot.temp.apply, 'attack') - delta;
                    snapshot.temp.apply.damage = sparse(snapshot.temp.apply, 'damage') - (perform ? Math.trunc(delta / 2) : 0);
                }
                stable(snapshot, first);
                assert.deepEqual(snapshot.learned, first.learned, 'no learning before public command returns');
                for (const key of ['jing', 'eff_jing', 'neili'])
                    assert.equal(snapshot[key], key === 'neili' && side === 0 ? neili : first[key]);
                if (side === 0) for (const key of ['qi', 'eff_qi']) assert.equal(snapshot[key], first[key]);
                else assert.ok(int(snapshot.eff_qi, 'passive eff_qi') <= first.eff_qi && snapshot.eff_qi >= end.eff_qi);
                if (side === 0) assert.equal(busy(snapshot), 0);
            }
            assert.equal(event.before[0].jiali, 0); assert.equal(event.before[0].neili, neili); assert.equal(event.before[1].qi, qi);
            assert.equal(event.before[1].eff_qi, effQi, 'previous hit wound matches next original passive snapshot');
            const nextEffQi = passiveIndex < raw.passives.length ? raw.passives[passiveIndex].before[1].eff_qi : end.eff_qi;
            const wounded = effQi - int(nextEffQi, 'next observed eff_qi');
            assert.ok(woundOptions(event.incoming, b, t, dealt).has(wounded), 'original per-hit wound support');
            effQi = nextEffQi; woundTotal += wounded;
            assert.equal(sparse(event.before[0].temp.apply, 'attack'), delta);
            assert.equal(sparse(event.before[0].temp.apply, 'damage'), perform ? Math.trunc(delta / 2) : 0);
            assert.equal(sparse(event.before[0].temp.apply, 'unarmed_damage'), 0);
            assert.equal(busy(event.before[1]), hitBusy); assert.equal(event.neili_after, neili);
            assert.equal(event.target_eff_qi_after, event.after[1].eff_qi); assert.equal(busy({ busy: field(event, 'target_busy_after') }), hitBusy);
        }
        damageTotal += dealt; qi -= dealt; targetBusy = dealt > 0 ? 0 : hitBusy;
    }
    assert.equal(passiveIndex, raw.passives.length);
    for (const [key, result] of [['hit', 0], ['dodge', -1], ['parry', -2]])
        assert.equal(count(raw.metrics[0], key), raw.attacks.filter(x => x.result === result).length);
    assert.equal(a.neili, neili); assert.equal(end.qi, qi); assert.ok(end.qi > 0, 'frozen health ensures no loop interruption');
    assert.equal(count(raw.metrics[0], 'neili_cost'), fee); assert.equal(count(raw.metrics[1], 'qi_cost'), damageTotal);
    assert.equal(count(raw.metrics[1], 'eff_qi_cost'), woundTotal, 'per-hit wounds close the gross resource account');
    assert.equal(end.eff_qi, effQi);
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(count(raw.metrics[0], key + '_cost'), 0);
    for (const key of ['jing', 'eff_jing', 'neili']) assert.equal(count(raw.metrics[1], key + '_cost'), 0);
    assert.equal(busy(end), targetBusy);
    if (accepted && perform) assert.ok(busy(a) >= 1 && busy(a) <= n); else assert.equal(busy(a), 0);
    for (const side of [0, 1]) {
        const before = structuredClone(raw.before[side].temp), after = structuredClone(raw.immediate[side].temp);
        delete before.apply; delete after.apply;
        if (side === 0 && perform) { delete before.notify_fail; delete after.notify_fail; }
        if (side === 0 && accepted) {
            const action = raw.actions.at(-1).action, fight = map(after.fight);
            assert.deepEqual(Object.keys(fight).sort(), ['attack', 'dodge', 'parry']);
            zero(fight, 'attack'); assert.equal(fight.dodge, action.dodge); assert.equal(fight.parry, action.parry);
            delete before.fight; delete after.fight;
        }
        assert.deepEqual(after, before, 'other raw temporary state changed');
    }
    return { accepted, attacks: n, hits: count(raw.metrics[0], 'hit'), damage: damageTotal,
        wound: count(raw.metrics[1], 'eff_qi_cost'), attack_bonus: bonus,
        gate_bonus: accepted && perform ? bonus > 0 : null, apply_damage_bonus: perform ? Math.trunc((bonus ?? 0) / 2) : 0,
        neili_cost: fee, actor_busy: busy(a), target_busy_final: busy(end), busy_opportunities: busyOpportunities,
        busy_starts: busyStarts, learned_delta: progress, poison_effects: 0 };
}

export function mingjiaoCoreEffects(rows, condition) {
    assert.equal(condition?.parameters?.collection_group, 'mingjiao-core');
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); const raw = row.raw ?? row;
        assert.equal(raw.condition_id, condition.id); if (row.raw) assert.equal(row.outcome, raw.outcome);
        assert.ok(Object.hasOwn(counts, raw.outcome)); counts[raw.outcome]++;
        if (['observed', 'refused'].includes(raw.outcome)) known.push(validateMingjiaoCoreRecord(raw, condition));
    }
    const accepted = known.filter(x => x.accepted), gates = accepted.filter(x => x.gate_bonus !== null);
    const sum = key => accepted.reduce((n, x) => n + x[key], 0);
    return { counts, unknown_effect_samples: counts.error + counts.not_applicable,
        acceptance: probability(accepted.length, known.length), refusal: probability(counts.refused, known.length),
        bonus_given_accepted: probability(gates.filter(x => x.gate_bonus).length, gates.length),
        hit_given_attack: probability(sum('hits'), sum('attacks')),
        busy_given_available_attack: probability(sum('busy_starts'), sum('busy_opportunities')),
        attacks_per_accepted: distribution(accepted.map(x => x.attacks)), damage_per_accepted: distribution(accepted.map(x => x.damage)),
        wound_per_accepted: distribution(accepted.map(x => x.wound)), attack_bonus: distribution(accepted.map(x => x.attack_bonus)),
        apply_damage_bonus: distribution(accepted.map(x => x.apply_damage_bonus)),
        actor_neili_cost: distribution(known.map(x => x.neili_cost)), actor_busy: distribution(known.map(x => x.actor_busy)),
        target_busy_final: distribution(known.map(x => x.target_busy_final)), learned_delta: distribution(known.map(x => x.learned_delta)),
        poison_effect_samples: sum('poison_effects') };
}
