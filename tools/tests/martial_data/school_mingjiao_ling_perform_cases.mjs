// Original USER commands: finite HUA/LIAN/XI slice; no game edits or RNG replacement.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const skill = 'shenghuo-ling', god = 'shenghuo-shengong';
const abilities = ['hua', 'lian', 'xi'], resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const sha = x => createHash('sha256').update(x).digest('hex');
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jingli: 1000, str: 36, con: 36,
    dex: 36, int: 40, gender: '男性', character: '光明磊落', combat_exp: 100000000,
    jiali: 0, potential: 10000, learned_points: 0, 'family/family_name': '明教', 'env/auto_regenerate': 0 };
export const mingjiaoLingPerformSourcePaths = [
    'kungfu/skill/shenghuo-ling.c', 'kungfu/skill/shenghuo-shengong.c',
    ...abilities.map(a => `kungfu/skill/${skill}/${a}.c`),
    'kungfu/skill/force.c', 'kungfu/skill/sword.c', 'kungfu/skill/blade.c', 'kungfu/skill/unarmed.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/parry.c', 'cmds/skill/perform.c', 'cmds/skill/enable.c',
    'inherit/skill/skill.c', 'inherit/skill/force.c', 'feature/sserver.c', 'clone/user/user.c',
    'inherit/char/char.c', 'feature/skill.c', 'feature/attribute.c', 'feature/attack.c',
    'feature/damage.c', 'feature/action.c', 'mudcore/inherit/action.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'feature/move.c', 'feature/equip.c', 'feature/name.c', 'feature/condition.c',
    'clone/weapon/gangjian.c', 'clone/weapon/gangdao.c', 'inherit/weapon/sword.c', 'inherit/weapon/blade.c',
    'inherit/misc/equip.c', 'inherit/item/item.c', 'adm/daemons/itemd.c', 'adm/daemons/chard.c',
    'adm/daemons/combatd.c', 'adm/daemons/race/human.c', 'adm/single/simul_efun/message.c',
    'adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c', 'data/e2c_dict.o',
    'include/globals.h', 'include/command.h', 'include/skill.h', 'include/combat.h', 'include/weapon.h',
    'include/dbase.h', 'include/move.h', 'include/name.h', 'mudcore/include/ansi.h',
];
export const mingjiaoLingPerformReviewedSourceHash = '6e90de9e106631b744dcaa2d426eebf943771ab6b28c4e8eabe2852c9c85676b';
// Original basic sword inherits SKILL only: no invented fallback action file.
export const mingjiaoLingPerformAbsentPaths = [];
const evidenceHash = e => sha(JSON.stringify(mingjiaoLingPerformSourcePaths.map(p => [p, e[p]])));
const equip = type => ({ type, program: '/clone/weapon/' + (type === 'sword' ? 'gangjian' : 'gangdao') });
function actor(level, ability, extra = {}) {
    return { skills: { sword: level, [skill]: level, force: level, [god]: level,
        unarmed: 200, dodge: 200, parry: 200, ...(extra.skills ?? {}) },
    mappings: { sword: skill, force: god }, preparations: {},
    properties: { ...pool, ...Object.fromEntries(abilities.map(a => ['can_perform/' + skill + '/' + a, Number(a === ability)])),
        ...(extra.properties ?? {}) },
    ...(extra.weapon === false ? {} : { equipment: equip(extra.weapon ?? 'sword') }),
    ...(extra.busy ? { busy: extra.busy } : {}) };
}
function target(level, ability, weapon = 'sword') {
    return { skills: { force: level * 3, parry: ability === 'xi' ? Math.trunc(15 * level / 4) : level * 3,
        unarmed: 200, dodge: 200 }, mappings: {}, preparations: {}, properties: { ...pool },
    ...(ability === 'xi' && weapon ? { equipment: equip(weapon) } : {}) };
}
const names = { hua: '光华令', lian: '敛心令', xi: '吸焰令' };
const minimum = { hua: [140, 1500, 340], lian: [150, 1600, 350], xi: [140, 1500, 300] };
function plans() {
    const out = [];
    const add = (ability, level, variant, cfg = actor(level, ability), extra = {}) => out.push({
        id: `school-mingjiao-ling-perform-${ability}-${variant}`, stage: 'school', method: 'perform', parameters: {
            school: 'mingjiao', family: '明教', collection_group: 'mingjiao-ling-perform', skill,
            usage: 'sword', ability, variant, level, actor: cfg, target: target(level, ability),
            named_participants: true, fighting: true, room: {}, observation: 'single_action_immediate',
            observe_seconds: 0, expected: 'observed', not_applicable: '', random_effects: true,
            action: `perform sword.${ability} right`,
            qualification_note: '有限真实非巫师USER配功与领悟，不冒自然传招。沿原判定、费用及弱熟练；敛心令final同步，不造延迟回调。吸焰令追同一对象卸装/负重/落点，原39项不变另追加独立超重条件。',
            ...extra } });
    for (const ability of abilities) {
        for (const l of [200, 400, 800]) add(ability, l, String(l));
        const [low, maximum, current] = minimum[ability];
        add(ability, low, 'minimum', actor(low, ability, { properties: { max_neili: maximum, neili: current } }));
    }
    add('xi', 400, 'target-blade', actor(400, 'xi'), { target: target(400, 'xi', 'blade') });
    for (const ability of abilities) {
        const [low, maximum, current] = minimum[ability], name = '「' + names[ability] + '」';
        const list = [
            ['grant0', actor(400, ability, { properties: { ['can_perform/' + skill + '/' + ability]: 0 } }), '你所使用的外功中没有这种功能。\n'],
            ['not-fighting', actor(400, ability), name + '只能对战斗中的对手使用。\n', { fighting: false }],
            ['no-weapon', actor(400, ability, { weapon: false }), '你使用的兵器不对，不能使用圣火令法之' + name + '。\n'],
            ['blade', actor(400, ability, { weapon: 'blade' }), '你使用的兵器不对，不能使用圣火令法之' + name + '。\n'],
            ['level-low', actor(400, ability, { skills: { [skill]: low - 1 } }), '你的圣火令法等级不够, 不能使用圣火令法之' + name + '。\n'],
            ['max-low', actor(400, ability, { properties: { max_neili: maximum - 1, neili: 1000 } }), '你的内力修为不足，不能使用圣火令法之' + name + '。\n'],
            ['current-low', actor(400, ability, { properties: { neili: current - 1 } }),
                (ability === 'xi' ? '你的真气不够' : '你的内力不够') + '，不能使用圣火令法之' + name + '。\n'],
            ['unconscious', actor(400, ability), '对方都已经这样了，用不着这么费力吧？\n', { target_state: 'unconscious' }],
        ];
        for (const [v, cfg, refusal, extra] of list) add(ability, 400, v, cfg,
            { expected: 'refused', random_effects: false, refusal, refusal_scope: 'ability', ...extra });
    }
    add('hua', 400, 'busy1', actor(400, 'hua', { busy: 1 }), { expected: 'refused', random_effects: false,
        refusal: '( 你上一个动作还没有完成，不能施用外功。)\n', refusal_scope: 'command' });
    add('xi', 400, 'target-no-weapon', actor(400, 'xi'), { target: target(400, 'xi', false),
        expected: 'refused', random_effects: false, refusal_scope: 'ability',
        refusal: '对方没有使用武器，不能使用圣火令法之「吸焰令」。\n' });
    assert.equal(out.length, 39);
    // Explicit append, never substitute any of the already reviewed 39 rows.
    add('xi', 400, 'overweight', actor(400, 'xi'), { actor_free_capacity: 5999 });
    return out;
}
export function mingjiaoLingPerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const evidence = Object.fromEntries(mingjiaoLingPerformSourcePaths.map(p => [p, sha(readSource(p))]));
    assert.equal(evidenceHash(evidence), mingjiaoLingPerformReviewedSourceHash, '复审变动来源后另建系列');
    const sources = Object.fromEntries([skill, ...abilities.map(a => skill + '/' + a)].map(id => {
        const s = catalog.skills.find(s => s.id === id); assert.equal(s?.path, 'kungfu/skill/' + id + '.c');
        assert.equal(s.sha256, evidence[s.path]); return [id, s]; }));
    return plans().map(c => {
        const s = sources[skill + '/' + c.parameters.ability], entry = s.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry?.startsWith(s.path));
        return { ...c, entry_id: entry, samples: smoke ? 2 : c.parameters.random_effects ? samples : 2,
            parameters: { ...c.parameters, source_evidence: evidence,
                qualification_sources: mingjiaoLingPerformSourcePaths, absent_sources: [],
                ability_source: { path: s.path, sha256: s.sha256, entry_id: entry },
                base_source: { path: sources[skill].path, sha256: sources[skill].sha256 } } };
    });
}

const object = x => { assert.ok(x && typeof x === 'object' && !Array.isArray(x)); return x; };
const field = (o, k) => { assert.ok(Object.hasOwn(object(o), k), 'missing ' + k); return o[k]; };
const integer = n => { assert.ok(Number.isSafeInteger(n)); return n; };
const num = n => n === null ? 0 : integer(n);
const sparse = (o, k) => Object.hasOwn(object(o), k) ? num(o[k]) : 0;
const metric = (o, k) => { const n = Object.hasOwn(object(o), k) ? integer(o[k]) : 0; assert.ok(n >= 0); return n; };
const plain = s => { assert.equal(typeof s, 'string'); return s.replace(/\x1b\[(?:[0-9;]*m|256D|K)/g, ''); };
function parameters(c) {
    const plan = plans().find(x => x.id === c.id); assert.ok(plan); assert.equal(c.method, 'perform'); assert.equal(c.stage, 'school');
    assert.ok(integer(c.samples) > 0); if (!plan.parameters.random_effects) assert.equal(c.samples, 2);
    const { source_evidence: e, qualification_sources, absent_sources, ability_source, base_source, ...rest } = object(c.parameters);
    assert.deepEqual(rest, plan.parameters); assert.deepEqual(qualification_sources, mingjiaoLingPerformSourcePaths);
    assert.deepEqual(absent_sources, []); assert.deepEqual(Object.keys(object(e)), mingjiaoLingPerformSourcePaths);
    for (const v of Object.values(e)) assert.match(v, /^[0-9a-f]{64}$/);
    assert.equal(evidenceHash(e), mingjiaoLingPerformReviewedSourceHash);
    const path = `kungfu/skill/${skill}/${rest.ability}.c`, line = { hua: 8, lian: 10, xi: 9 }[rest.ability];
    assert.equal(c.entry_id, `${path}:${line}:perform`);
    assert.deepEqual(ability_source, { path, sha256: e[path], entry_id: c.entry_id });
    assert.deepEqual(base_source, { path: 'kungfu/skill/' + skill + '.c', sha256: e['kungfu/skill/' + skill + '.c'] });
    return c.parameters;
}
const cultivation = ['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
    'special_skill/guimai', 'special_skill/wuxing', 'class', 'family/family_name', 'wudang-jiuyang', 'immune/poison',
    'character', 'env/no_learn', 'env/auto_regenerate', 'tattoo/tattoo_str', 'reborn/str',
    'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex',
    ...abilities.map(a => 'can_perform/' + skill + '/' + a)];
function item(d, cfg) {
    assert.match(field(d, 'object'), new RegExp('^' + cfg.program + '#\\d+$'));
    for (const [k, v] of Object.entries({ program: cfg.program, skill_type: cfg.type, flag: 4,
        weight: cfg.type === 'sword' ? 6000 : 7000, material: 'steel', damage: 25, stable: 37 })) assert.equal(field(d, k), v, k);
    for (const k of ['rigidity', 'no_wield', 'is_item_make']) assert.equal(num(field(d, k)), 0);
    assert.ok([99, 100].includes(integer(field(d, 'consistence'))));
}
function initial(s, cfg, side, p, awake = false) {
    assert.match(field(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(s.id, side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive']) assert.equal(field(s, k), 1);
    for (const k of ['wizardp', 'ghost']) assert.equal(num(field(s, k)), 0);
    const asleep = side && p.target_state === 'unconscious' && !awake;
    assert.equal(field(s, 'living'), asleep ? 0 : 1);
    assert.equal(num(field(s, 'busy')), cfg.busy ?? 0); assert.equal(field(s, 'fighting_opponent'), Number(p.fighting));
    assert.equal(field(s, 'killing_opponent'), Number(p.fighting)); assert.equal(s.craze, 0); assert.equal(s.max_craze, 5000);
    for (const k of ['skills', 'mappings', 'preparations']) assert.deepEqual(field(s, k), cfg[k]);
    assert.deepEqual(field(s, 'learned'), {});
    const cond = field(s, 'conditions'); assert.ok(cond === null || cond === 0 || (typeof cond === 'object' && !Array.isArray(cond) && Object.keys(cond).length === 0));
    for (const [k, v] of Object.entries(cfg.properties)) {
        const actual = field(k.includes('/') || k === 'character' ? s.cultivation : s, k);
        assert.equal(asleep && ['qi', 'jing'].includes(k) ? actual : v === 0 ? num(actual) : actual,
            asleep && ['qi', 'jing'].includes(k) ? 0 : v, k);
    }
    for (const k of cultivation.filter(k => !Object.hasOwn(cfg.properties, k))) assert.equal(num(field(s.cultivation, k)), 0, k);
    assert.equal(field(s, 'effective_str'), 56); assert.equal(field(s, 'effective_int'), 40);
    assert.equal(field(s, 'effective_dex'), 56); assert.equal(field(s, 'effective_con'), 36 + Math.trunc(cfg.skills.force / 10));
    const gear = cfg.equipment, apply = gear ? { armor: 100, damage: 25, dodge: -2 } : { armor: 100 };
    assert.deepEqual(field(s.temp, 'apply'), apply);
    for (const k of ['str', 'dex', 'powerup', 'shield', 'guarding']) assert.equal(sparse(s.temp, k), 0);
    assert.equal(sparse(s.temp[skill] ?? {}, 'hit'), 0); assert.equal(sparse(s.temp[skill] ?? {}, 'max_hit'), 0);
    for (const k of ['handing', 'secondary_weapon']) { assert.equal(field(s, k), 'none'); assert.deepEqual(field(s, k + '_details'), {}); }
    assert.equal(s.ammunition, 0); assert.equal(s.weapon, gear?.type ?? 'none'); assert.equal(s.weapon_damage, gear ? 25 : 0); assert.equal(s.weapon_flag, gear ? 4 : 0);
    if (gear) { item(field(s, 'weapon_details'), gear); assert.equal(s.weapon_details.consistence, 100);
        assert.equal(field(s.temp, 'weapon'), s.weapon_details.object); }
    else { assert.deepEqual(field(s, 'weapon_details'), {}); assert.equal(sparse(s.temp, 'weapon'), 0); }
    assert.deepEqual(field(s, 'effective_skills'), Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
        [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + sparse(apply, k)])));
    assert.equal(field(s, 'environment'), '/tests/runner');
    assert.deepEqual([...field(s, 'inventory')].sort(), gear ? [s.weapon_details.object] : []);
    assert.equal(field(s, 'encumbrance'), gear ? s.weapon_details.weight : 0);
    // base_actor sets STR30 before original USER setup; CHARD fixes this capacity before experiment STR36.
    assert.equal(field(s, 'max_encumbrance'), !side && p.actor_free_capacity !== undefined
        ? s.encumbrance + p.actor_free_capacity : 89000);
}
const cleanTemp = s => { const t = structuredClone(s.temp); delete t.notify_fail; return t; };
function unchanged(b, a, ignored = []) {
    const omit = new Set([...resources, 'craze', 'busy', 'learned', 'temp', ...ignored]);
    const keep = s => Object.fromEntries(Object.entries(s).filter(([k]) => !omit.has(k)));
    assert.deepEqual(keep(a), keep(b), '无关状态/装备不得漂移');
}
function directSupport(input, before, targetBefore, remote) {
    const baseInput = input + (remote ? 0 : before.temp.apply.damage), base = baseInput + Math.trunc(baseInput * 47 / 50);
    const out = [];
    for (let d of new Set([base, base + Math.trunc(base * 4 / 40)])) {
        d = d > 1500 ? Math.trunc((d - 1500) / 4) + 1000 : d > 500 ? Math.trunc((d - 500) / 2) + 500 : d;
        for (let r = 0; r < 100; r++) {
            let w = Math.trunc((d - r) * (remote ? 0 : 80) / 100);
            w -= Math.trunc(w * 20 / 100); w -= Math.trunc(w * 26 / 100); w = Math.max(0, w);
            const eff = Math.max(-1, targetBefore.eff_qi - w), qi0 = Math.max(-1, targetBefore.qi - d);
            const qi = w ? Math.min(qi0, eff) : qi0;
            out.push({ qi, eff_qi: eff, qi_cost: targetBefore.qi - qi, eff_qi_cost: targetBefore.eff_qi - eff,
                craze: Math.min(targetBefore.max_craze, targetBefore.craze + (d > 150 ? Math.trunc(d / 5) : 0)
                    + (w > 150 ? Math.trunc(w / 3) : 0)) });
        }
    }
    return out;
}
function transfer(raw, p, success) {
    const [b, t] = raw.before, [a, end] = raw.immediate;
    const phases = object(field(raw.ling_equipment, 'target_weapon'));
    assert.deepEqual(Object.keys(phases).sort(), ['after', 'before', 'immediate']);
    if (!p.target.equipment) {
        for (const value of Object.values(phases)) assert.deepEqual(value, {});
        assert.deepEqual(end, t); assert.deepEqual(a.inventory, b.inventory); assert.equal(a.encumbrance, b.encumbrance);
        return null;
    }
    const old = phases.before; item(old, p.target.equipment); assert.equal(old.consistence, 100);
    for (const [k, value] of Object.entries(t.weapon_details)) assert.deepEqual(field(old, k), value);
    assert.equal(old.environment, t.object); assert.equal(old.equipped, 'wielded');
    assert.deepEqual(phases.after, phases.immediate);
    const now = phases.immediate, expected = structuredClone(old);
    const heavy = b.encumbrance + old.weight > b.max_encumbrance;
    const holder = success ? heavy ? b.environment : b.object : t.object;
    expected.environment = holder; if (success) expected.equipped = now.equipped;
    if (success) assert.equal(num(field(now, 'equipped')), 0);
    assert.deepEqual(now, expected, '同一兵器只能原卸装及转移，不复制/销毁/换ID');
    assert.equal(a.weapon_details.object, b.weapon_details.object); assert.deepEqual(a.weapon_details, b.weapon_details);
    if (success) {
        assert.equal(end.weapon, 'none'); assert.deepEqual(end.weapon_details, {}); assert.equal(end.weapon_flag, 0); assert.equal(end.weapon_damage, 0);
        assert.equal(sparse(end.temp, 'weapon'), 0); assert.equal(sparse(end.temp, 'secondary_weapon'), 0);
        const expectedTemp = cleanTemp(t); delete expectedTemp.weapon; delete expectedTemp.secondary_weapon;
        expectedTemp.apply.damage -= 25; expectedTemp.apply.dodge += 2;
        assert.deepEqual(cleanTemp(end), expectedTemp);
        const effective = structuredClone(t.effective_skills); effective.dodge += 2;
        assert.deepEqual(end.effective_skills, effective);
    } else { assert.deepEqual(cleanTemp(end), cleanTemp(t)); assert.deepEqual(end.weapon_details, t.weapon_details); assert.deepEqual(end.effective_skills, t.effective_skills); }
    const lists = [success && !heavy ? [...b.inventory, old.object] : b.inventory, success ? [] : t.inventory];
    for (const [side, n] of [[0, success && !heavy ? old.weight : 0], [1, success ? -old.weight : 0]]) {
        assert.equal(raw.immediate[side].encumbrance, raw.before[side].encumbrance + n);
        assert.deepEqual([...raw.immediate[side].inventory].sort(), [...lists[side]].sort());
        assert.equal(raw.immediate[side].max_encumbrance, raw.before[side].max_encumbrance);
        assert.equal(raw.immediate[side].environment, raw.before[side].environment);
    }
    return holder === b.object ? 'actor' : holder === b.environment ? 'room' : 'target';
}
export function validateMingjiaoLingPerformRecord(raw, c) {
    const p = parameters(c), accepted = p.expected === 'observed', xi = p.ability === 'xi', lian = p.ability === 'lian';
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, c.id); assert.equal(raw.method, 'perform');
    assert.ok(integer(field(raw, 'index')) >= 0 && raw.index < c.samples);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(raw.outcome)) {
        assert.ok(typeof raw.reason === 'string' && raw.reason.trim());
        return null;
    }
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(field(raw, k)?.length, 2);
    for (const k of ['actions', 'attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'callbacks', 'terminals']) assert.deepEqual(field(raw, k), []);
    for (const k of ['directs', 'launches', 'refusals', 'busy_calls', 'dropped', 'skill_messages']) assert.ok(Array.isArray(field(raw, k)));
    for (const message of raw.skill_messages) {
        assert.ok([0, 1].includes(field(message, 'side')));
        assert.equal(typeof field(message, 'type'), 'string'); assert.equal(typeof field(message, 'text'), 'string');
    }
    assert.equal(Object.hasOwn(raw, 'skill_loads'), false); assert.deepEqual(raw.after, raw.immediate);
    const [b, t] = raw.before, [a, end] = raw.immediate; assert.notEqual(b.object, t.object);
    initial(b, p.actor, 0, p); initial(t, p.target, 1, p);
    const load = object(field(raw, 'skill_load_context'));
    assert.deepEqual(Object.keys(load).sort(), ['actor', 'already_loaded', 'command', 'skills']);
    assert.equal(load.actor, b.object); assert.ok([0, 1].includes(num(field(load, 'already_loaded'))));
    assert.equal(load.command, 'enable sword ' + skill); assert.deepEqual(load.skills, p.actor.skills);
    if (p.target_state === 'unconscious') {
        const prep = object(field(raw, 'preparation')); initial(prep.before, p.target, 1, p, true);
        const expected = structuredClone(prep.before); expected.living = 0; expected.qi = 0; expected.jing = 0;
        expected.temp.block_msg = { all: 1 };
        assert.deepEqual(prep.after, expected); assert.deepEqual(prep.after, t);
        assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }]);
    } else assert.equal(Object.hasOwn(raw, 'preparation'), false);
    assert.equal(field(raw, 'command_accepted'), Number(accepted));
    assert.deepEqual(raw.launches, accepted ? [{ actor: b.object, skill, argument: p.ability + ' right' }] : []);
    if (accepted) {
        assert.deepEqual(raw.refusals, []); assert.equal(raw.reason, '');
        assert.equal(field(a.temp, 'notify_fail'), '你所使用的外功中没有这种功能。\n');
    }
    else {
        assert.equal(raw.refusals.length, 1); assert.equal(raw.refusals[0].actor, b.object);
        assert.equal(plain(field(raw.refusals[0], 'reason')), p.refusal);
        assert.equal(raw.reason, raw.refusals[0].reason); assert.equal(plain(raw.reason), p.refusal);
        assert.equal(plain(field(a.temp, 'notify_fail')), p.refusal);
    }
    // With jiali0/no other force side effects, the original distinct fee identifies the gate branch.
    const fee = metric(raw.metrics[0], 'neili_cost'), successFee = xi ? 240 : 300;
    const missFee = p.ability === 'hua' ? 150 : 100;
    assert.ok(accepted ? [successFee, missFee].includes(fee) : fee === 0);
    const success = accepted && fee === successFee;
    const actorBusy = accepted ? success ? lian ? 3 : 2 : 4 : p.actor.busy ?? 0;
    assert.equal(num(field(a, 'busy')), actorBusy); assert.equal(num(field(end, 'busy')), lian && success ? 1 : 0);
    const calls = accepted ? [{ side: 0, requested: actorBusy }] : [];
    if (lian && success) calls.push({ side: 1, requested: 1 });
    assert.equal(raw.busy_calls.length, calls.length);
    for (const [i, cfg] of calls.entries()) { const e = raw.busy_calls[i]; assert.equal(e.side, cfg.side);
        assert.equal(e.caller_side, 0); assert.equal(e.requested, cfg.requested); assert.equal(num(field(e, 'before')), 0);
        assert.equal(num(field(e, 'after')), cfg.requested); }
    const gain = sparse(field(a, 'learned'), skill), effective = b.effective_skills[skill];
    assert.ok(accepted ? effective >= 120 ? gain === 1 : [0, 1].includes(gain) : gain === 0);
    assert.deepEqual(a.learned, gain ? { [skill]: gain } : {}); assert.deepEqual(end.learned, {});
    assert.equal(a.craze, b.craze);
    let input = null;
    if (!xi && success) {
        assert.equal(raw.directs.length, 1); const d = raw.directs[0];
        assert.equal(d.actor, 0); assert.equal(d.target, 1); assert.equal(d.type, lian ? 2 : 1); assert.equal(d.percent, lian ? 0 : 80);
        assert.equal(d.weapon, 'sword'); assert.equal(d.weapon_object, b.weapon_details.object);
        input = integer(field(d, 'damage'));
        const ap = b.effective_skills.sword + (lian ? 0 : b.effective_skills.force), dp = t.effective_skills.parry + (lian ? 0 : t.effective_skills.force);
        assert.ok(Math.trunc(ap / 2) + ap - 1 > dp && Math.trunc(ap / 2) <= dp, '原gate两分支支持');
        const low = lian ? Math.trunc(b.skills[skill] / 2) : ap, high = low + (lian ? b.skills[skill] : Math.trunc(ap / 2)) - 1;
        assert.ok(input >= low && input <= high, '原直伤输入支持');
        assert.ok(directSupport(input, b, t, lian).some(o => o.qi === end.qi && o.eff_qi === end.eff_qi && o.craze === end.craze
            && o.qi_cost === metric(raw.metrics[1], 'qi_cost') && o.eff_qi_cost === metric(raw.metrics[1], 'eff_qi_cost')), '公共D/W/当前Qi夹制/怒气必须同一有限支持');
    } else { assert.deepEqual(raw.directs, []); assert.equal(end.qi, t.qi); assert.equal(end.eff_qi, t.eff_qi); assert.equal(end.craze, t.craze); }
    const jing = lian && success ? Math.trunc(input / 2) : 0, effJing = lian && success ? Math.trunc(input / 4) : 0;
    assert.equal(metric(raw.metrics[1], 'jing_cost'), jing); assert.equal(metric(raw.metrics[1], 'eff_jing_cost'), effJing);
    assert.equal(end.jing, t.jing - jing); assert.equal(end.eff_jing, t.eff_jing - effJing);
    for (const side of [0, 1]) {
        const m = object(raw.metrics[side]); for (const [k, v] of Object.entries(m)) { integer(v); assert.ok(v >= 0);
            const allowed = side ? ['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost'] : ['neili_cost', 'ability_launched', 'direct'];
            if (!allowed.includes(k)) assert.equal(v, 0, k); }
        for (const k of resources) { assert.equal(metric(m, k + '_recovery'), 0);
            assert.equal(raw.immediate[side][k], raw.before[side][k] - metric(m, k + '_cost')); }
        assert.equal(metric(m, 'ability_launched'), side ? 0 : Number(accepted));
        assert.equal(metric(m, 'direct'), side ? 0 : Number(!xi && success));
    }
    assert.equal(metric(raw.metrics[1], 'neili_cost'), 0);
    unchanged(b, a, ['weapon_details', 'inventory', 'encumbrance']);
    const own = structuredClone(b.weapon_details); if (p.ability === 'hua' && success) {
        assert.ok([99, 100].includes(a.weapon_details.consistence)); own.consistence = a.weapon_details.consistence;
    }
    assert.deepEqual(a.weapon_details, own); assert.deepEqual(cleanTemp(a), cleanTemp(b));
    let location = null;
    if (xi) {
        unchanged(t, end, ['weapon', 'weapon_details', 'weapon_flag', 'weapon_damage', 'effective_skills', 'inventory', 'encumbrance']);
        location = transfer(raw, p, success);
    } else {
        assert.equal(Object.hasOwn(raw, 'ling_equipment'), false);
        unchanged(t, end); assert.deepEqual(cleanTemp(end), cleanTemp(t));
        for (const side of [0, 1]) { assert.deepEqual(raw.immediate[side].inventory, raw.before[side].inventory);
            assert.equal(raw.immediate[side].encumbrance, raw.before[side].encumbrance); }
    }
    if (location === 'room') {
        assert.equal(raw.dropped.length, 1); const d = raw.dropped[0];
        assert.equal(d.object, t.weapon_details.object); assert.equal(d.name, '钢剑'); assert.equal(d.type, 'sword');
        assert.equal(num(field(d, 'no_wield')), 0);
    } else assert.deepEqual(raw.dropped, []);
    return { accepted, gate_success: accepted ? success : null, input_damage: input, weak_gain: gain,
        actor_neili_cost: fee, actor_busy: actorBusy, target_busy: num(end.busy),
        target_costs: Object.fromEntries(resources.map(k => [k, metric(raw.metrics[1], k + '_cost')])),
        wear: p.ability === 'hua' && success ? a.weapon_details.consistence < b.weapon_details.consistence : null,
        transfer_location: location };
}
export function mingjiaoLingPerformEffects(rows, c) {
    parameters(c); const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) { assert.equal(row.condition_id, c.id); assert.equal(row.raw?.condition_id, c.id);
        assert.equal(row.raw.method, c.method); assert.equal(row.raw.outcome, row.outcome); assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        const observation = validateMingjiaoLingPerformRecord(row.raw, c);
        if (!['error', 'not_applicable'].includes(row.outcome)) known.push(observation); }
    const unknown = counts.error + counts.not_applicable, values = f => distribution([...known.map(f), ...Array(unknown).fill(null)]);
    const chance = (a, f) => probability(a.filter(f).length, a.length), gated = known.filter(o => o.gate_success !== null), worn = known.filter(o => o.wear !== null);
    return { samples: rows.length, counts, validated: known.length, unknown,
        accepted: chance(known, o => o.accepted), gate: chance(gated, o => o.gate_success), input_damage: values(o => o.input_damage),
        actor_neili_cost: values(o => o.actor_neili_cost), actor_busy: values(o => o.actor_busy), target_busy: values(o => o.target_busy),
        target_costs: Object.fromEntries(resources.map(k => [k, values(o => o.target_costs[k])])), weak_gain: values(o => o.weak_gain),
        wear: chance(worn, o => o.wear), transfer: Object.fromEntries(['actor', 'room', 'target'].map(k => [k, known.filter(o => o.transfer_location === k).length])),
        unknown_scopes: ['仅三绝招40有限条件，不冒完整师承、其他绝招或全部明教。',
            '公共直伤、精神损伤/创伤、弱熟练及装备落点分列，不相加排名；lian final同步无timer。',
            '超重独立条件追加，不改39原草案；显示纳入怀中不等于实际取得或自动装备。',
            '首载原USER enable上下文实录但不统计全局动作随机系数，隐藏随机值不反推为观测。',
            '未知/错误/不适用不补零；磨损仅hua成功分母，未抽到磨损不代表不会磨损。'] };
}
