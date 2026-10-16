// Finite original Jiuyang buffs, natural expiry and room-wide roar; no gameplay mutation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';
import { mingjiaoJiuyangRemainingSourcePaths } from './school_mingjiao_jiuyang_remaining_cases.mjs';
const copy = v => structuredClone(v), hash = b => createHash('sha256').update(b).digest('hex');
const skill = 'jiuyang-shengong', group = 'mingjiao-jiuyang-exert', prefix = 'school-mingjiao-exert-jiuyang-';
const abilities = ['powerup', 'shield', 'roar'];
export const mingjiaoJiuyangExertSourcePaths = [...new Set([...mingjiaoJiuyangRemainingSourcePaths,
    ...abilities.map(a => `kungfu/skill/${skill}/exert/${a}.c`), 'kungfu/skill/force.c', 'kungfu/skill/force/roar.c', 'cmds/skill/exert.c'])];
export const mingjiaoJiuyangExertReviewedSourceHash = '2b25e7e41899f6432deef87f3631e3fc9840a02967c933e5b8ef9c714a5d500c';
export const mingjiaoJiuyangExertAbsentPaths = ['powerup', 'shield'].flatMap(a => ['c', 'lpc'].map(ext => `kungfu/skill/force/${a}.${ext}`));
const evidenceHash = e => hash(JSON.stringify(mingjiaoJiuyangExertSourcePaths.map(p => [p, e[p]])));
const pool = { name: '试侠', gender: '男性', race: '人类', class: '', character: '光明磊落', str: 36, int: 40, con: 36, dex: 36,
    shen: 90000, combat_exp: 100000000, qi: 1000000, eff_qi: 1000000, max_qi: 1000000,
    jing: 1000000, eff_jing: 1000000, max_jing: 1000000, neili: 9000, max_neili: 9000,
    jingli: 1000, max_jingli: 1000, jiali: 0, potential: 10000, learned_points: 0, reborn: 1, breakup: 0,
    'family/family_name': '明教', 'env/no_learn': 0, 'env/auto_regenerate': 0, doing: 0,
    'tattoo/tattoo_str': 0, 'tattoo/tattoo_int': 0, 'tattoo/tattoo_con': 0, 'tattoo/tattoo_dex': 0,
    'special_skill/wuxing': 0, 'can_learn/jiuyang-shengong/enable_weapon': 1 };
function actor(l, basic = l) { return { skills: { force: basic, unarmed: 200, parry: 200, dodge: 600, 'martial-cognize': 100, [skill]: l },
    mappings: { force: skill }, preparations: {}, properties: copy(pool),
    temp: { 'apply/attack': 7, 'apply/parry': 11, 'apply/dodge': 13, 'apply/armor': 107 } }; }
function target(a, roar = false) { const s = Math.trunc(a.skills.force / 2) + a.skills[skill];
    return { skills: { force: 200, unarmed: 200, parry: 200, dodge: 600, 'martial-cognize': 100 }, mappings: {}, preparations: {},
        properties: { ...copy(pool), name: '试客', max_neili: 1000, neili: 1000, con: roar ? Math.trunc(3 * s / 8) : 36 } }; }
function plans() {
    const out = [], add = (ability, variant, a = actor(400), extra = {}, phase = 'immediate') => {
        const p = { school: 'mingjiao', family: '明教', collection_group: group, skill, ability, variant, phase,
            usage: 'force', level: a.skills[skill], actor: a, target: target(a, ability === 'roar'), named_participants: true,
            fighting: ability !== 'roar', room: {}, actions: ['exert ' + ability], action: 'exert ' + ability,
            expected: 'observed', not_applicable: '', observation: phase === 'lifecycle' ? 'natural_call_out' : 'single_action_immediate',
            observe_seconds: 0, random_effects: false, formal_samples: 2, qualification_sources: [...mingjiaoJiuyangExertSourcePaths],
            qualification_note: '原真实USER的有限运功/群体声波实验；技能、转世、配功、储存池及原map_skill是明示实验，不冒自然养成。低有效内功即时弱熟练随机与自然到期分开；高档按原整数call_out时钟，未缩时或直调解除。固定apply7/11/13、armor107证明精确返还。roar遍历实际房间角色，不以伤害是否非零代替gate/敌意关系；本体无同门、die_guard、skybook、living过滤。public回退最终拒绝及本体no_fight先扣100/qi10如实保留。其它修养/组合/全门派未在本窗。', ...extra };
        if (p.actions.length === 1) p.action = p.actions[0];
        const highExpiry = phase === 'lifecycle' && a.skills[skill] >= 200;
        out.push({ id: prefix + (highExpiry ? 'lifecycle' : 'immediate') + '-' + ability + '-' + variant
            + (phase === 'lifecycle' && !highExpiry ? '-expiry' : ''), stage: 'school', method: 'exert', parameters: p });
    };
    const lifecycle = (ability, variant, a) => { const s = Math.trunc(a.skills.force / 2) + a.skills[skill];
        add(ability, variant, a, { observe_seconds: (ability === 'powerup' ? Math.trunc(s / 2) : s) + 2 }, 'lifecycle'); };
    for (const breakup of [0, 1]) for (const l of [200, 400, 800]) { const a = actor(l); a.properties.breakup = breakup;
        add('powerup', l + '-breakup' + breakup, a); }
    for (const breakup of [0, 1]) { const a = actor(20); a.properties.breakup = breakup;
        add('powerup', 'low30-breakup' + breakup, a, { random_effects: true, formal_samples: 100 }); lifecycle('powerup', 'low30-breakup' + breakup, copy(a)); }
    for (const ability of ['powerup', 'shield']) {
        const reject = (variant, edit, refusal, outer = false, extra = {}) => { const a = actor(400); edit(a);
            add(ability, variant, a, { expected: 'refused', refusal, outer_refusal: outer, ...extra }); };
        reject('neili99', a => { a.properties.neili = 99; }, ability === 'powerup' ? '你的内力不够。\n' : '你的真气不够。\n');
        reject('nonself', () => {}, ability === 'powerup' ? '你只能用九阳神功来提升自己的战斗力。\n' : '你只能用九阳神功来提升自己的防御力。\n', false,
            { actions: ['exert ' + ability + ' right'] });
        add(ability, 'repeat', actor(400), { fighting: false, actions: ['exert ' + ability, 'exert ' + ability], repeat_refusal: '你已经在运功中了。\n' });
        reject('busy1', a => { a.busy = 1; }, '( 你上一个动作还没有完成，不能施用内功。)\n', true);
        reject('no-exert', a => { a.temp.no_exert = 1; }, '你只觉得内息一阵紊乱，根本无法控制内息。\n', true);
        reject('exert-drug', a => { a.conditions = { exert_drug: 1 }; }, '你只觉得内息一阵紊乱，根本无法控制内息。\n', true);
        reject('unmapped', a => { a.mappings = {}; }, '你请先用 enable 指令选择你要使用的内功。\n', true);
        if (ability === 'shield') reject('raw39', a => { a.skills[skill] = 39; }, '你的九阳神功等级不够。\n');
    }
    for (const l of [200, 400, 800]) add('shield', String(l), actor(l));
    const lowShield = actor(40, 1); add('shield', 'low40', lowShield, { random_effects: true, formal_samples: 100 }); lifecycle('shield', 'low40', copy(lowShield));
    for (const order of [['powerup', 'shield'], ['shield', 'powerup']]) add(order[0], 'then-' + order[1], actor(400), { fighting: false, actions: order.map(a => 'exert ' + a) });
    for (const breakup of [0, 1]) for (const l of [200, 400, 800]) { const a = actor(l); a.properties.breakup = breakup; lifecycle('powerup', l + '-breakup' + breakup, a); }
    for (const l of [200, 400, 800]) lifecycle('shield', String(l), actor(l));
    const roar = (variant, a = actor(400), extra = {}) => add('roar', variant, a, { random_effects: true, formal_samples: 100, ...extra });
    for (const l of [200, 400, 800]) roar(String(l), actor(l));
    const low = actor(400); low.properties.neili = 100; roar('neili100', low);
    for (const n of [1199, 1200]) { const t = target(actor(400), true); t.properties.neili = n; t.properties.max_neili = 2000; roar('target-neili' + n, actor(400), { target: t }); }
    for (const delta of [-1, 0, 1]) { const t = target(actor(400), true); t.properties.max_neili = (600 - delta) * 10; t.properties.neili = 1200; roar('damage' + delta, actor(400), { target: t }); }
    const outside = target(actor(400), true); outside.properties['family/family_name'] = '少林派'; roar('outside-family', actor(400), { target: outside });
    const guard = target(actor(400), true); guard.conditions = { die_guard: 1 }; roar('die-guard', actor(400), { target: guard });
    roar('unconscious', actor(400), { target_state: 'unconscious' }); roar('skybook', actor(400), { room: { skybook: 1 } });
    roar('three-users', actor(400), { extra_target: { ...target(actor(400), true), properties: { ...target(actor(400), true).properties, name: '试伴' } } });
    const rejectRoar = (variant, edit, refusal, outer = false, extra = {}) => { const a = actor(400); edit(a);
        add('roar', variant, a, { expected: 'refused', refusal, outer_refusal: outer, ...extra }); };
    rejectRoar('neili99', a => { a.properties.neili = 99; }, '你的真气不够。\n'); // Original public fallback overrides the body's first notice.
    rejectRoar('no-fight', () => {}, '在这里不能攻击他人。\n', false, { room: { no_fight: 1 } });
    rejectRoar('busy1', a => { a.busy = 1; }, '( 你上一个动作还没有完成，不能施用内功。)\n', true);
    rejectRoar('no-exert', a => { a.temp.no_exert = 1; }, '你只觉得内息一阵紊乱，根本无法控制内息。\n', true);
    rejectRoar('exert-drug', a => { a.conditions = { exert_drug: 1 }; }, '你只觉得内息一阵紊乱，根本无法控制内息。\n', true);
    rejectRoar('unmapped', a => { a.mappings = {}; }, '你请先用 enable 指令选择你要使用的内功。\n', true);
    assert.equal(out.length, 61); assert.equal(out.filter(c => c.parameters.random_effects).length, 17); return out;
}
const entry = (p, e) => { const path = `kungfu/skill/${skill}/exert/${p.ability}.c`, line = p.ability === 'roar' ? 7 : 9;
    return { id: `${path}:${line}:exert`, path, line, function: 'exert', role: 'exert', sha256: e[path] }; };
export function mingjiaoJiuyangExertConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.equal(typeof readSource, 'function');
    const e = Object.fromEntries(mingjiaoJiuyangExertSourcePaths.map(p => { const b = readSource(p); assert.ok(b.length); return [p, hash(b)]; }));
    assert.equal(evidenceHash(e), mingjiaoJiuyangExertReviewedSourceHash, 'source changed: review required');
    for (const p of mingjiaoJiuyangExertAbsentPaths) { let missing = false; try { readSource(p); } catch (error) { if (error.code === 'ENOENT') missing = true; else throw error; } assert.ok(missing, 'public fallback appeared ' + p); }
    for (const a of abilities) { const x = entry({ ability: a }, e), s = catalog.skills.find(s => s.path === x.path); assert.equal(s?.sha256, x.sha256); assert.ok(s.entries.some(v => v.id === x.id)); }
    return plans().map(c => ({ ...c, status: 'prepared_not_sampled', samples: smoke ? 2 : c.parameters.formal_samples, entry_id: entry(c.parameters, e).id,
        parameters: { ...c.parameters, source_entry: entry(c.parameters, e), source_evidence: copy(e), reviewed_source_hash: mingjiaoJiuyangExertReviewedSourceHash,
            qualification_evidence: mingjiaoJiuyangExertSourcePaths.map(path => ({ path, sha256: e[path] })), absent_sources: [...mingjiaoJiuyangExertAbsentPaths] } }));
}
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v)); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing ' + k); return v[k]; };
const int = v => { assert.ok(Number.isSafeInteger(v)); return v; }, num = v => v === null ? 0 : int(v);
const sparse = (v, k) => Object.hasOwn(map(v), k) ? num(v[k]) : 0;
const metric = (v, k) => { const n = Object.hasOwn(map(v), k) ? int(v[k]) : 0; assert.ok(n >= 0); return n; };
const plain = v => { assert.equal(typeof v, 'string'); return v.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[256D\x1b\[K/g, ''); };
const empty = v => { if (v && typeof v === 'object') assert.deepEqual(v, {}); else assert.equal(num(v), 0); };
let fixed;
export function validateMingjiaoJiuyangExertCondition(c) {
    fixed ??= new Map(plans().map(c => [c.id, c])); const plan = fixed.get(own(c, 'id')); assert.ok(plan);
    assert.equal(c.stage, 'school'); assert.equal(c.method, 'exert'); assert.ok([2, plan.parameters.formal_samples].includes(c.samples));
    const { source_entry, source_evidence, reviewed_source_hash, qualification_evidence, absent_sources, ...p } = map(own(c, 'parameters'));
    assert.deepEqual(p, plan.parameters); assert.deepEqual(Object.keys(map(source_evidence)), mingjiaoJiuyangExertSourcePaths);
    for (const h of Object.values(source_evidence)) assert.match(h, /^[a-f0-9]{64}$/); assert.equal(evidenceHash(source_evidence), mingjiaoJiuyangExertReviewedSourceHash);
    assert.equal(reviewed_source_hash, mingjiaoJiuyangExertReviewedSourceHash); assert.deepEqual(source_entry, entry(p, source_evidence)); assert.equal(c.entry_id, source_entry.id);
    assert.deepEqual(qualification_evidence, mingjiaoJiuyangExertSourcePaths.map(path => ({ path, sha256: source_evidence[path] }))); assert.deepEqual(absent_sources, mingjiaoJiuyangExertAbsentPaths);
    return c.parameters;
}
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'], buffKeys = ['attack', 'parry', 'dodge', 'armor'];
const effective = s => Object.fromEntries(Object.entries(s.skills).map(([k, v]) => [k,
    Math.trunc(v / 2) + (s.mappings[k] === skill ? s.skills[skill] : 0) + sparse(s.temp.apply, k)]));
function initial(s, cfg, side, p, awake = false) {
    assert.match(own(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(own(s, 'id'), ['left', 'right', 'third'][side]);
    for (const k of ['userp', 'playerp', 'interactive']) assert.equal(own(s, k), 1);
    for (const k of ['wizardp', 'ghost', 'not_living', 'last_damage_from']) assert.equal(num(own(s, k)), 0);
    const unconscious = side === 1 && p.target_state === 'unconscious' && !awake;
    assert.equal(own(s, 'living'), unconscious ? 0 : 1); assert.equal(num(own(s, 'busy')), cfg.busy ?? 0);
    for (const k of ['skills', 'mappings', 'preparations']) assert.deepEqual(own(s, k), cfg[k]);
    if (cfg.conditions) assert.deepEqual(own(s, 'conditions'), cfg.conditions); else empty(own(s, 'conditions'));
    assert.deepEqual(own(s, 'learned'), {}); assert.equal(own(s, 'craze'), 0); assert.equal(own(s, 'max_craze'), 5000);
    for (const [k, v] of Object.entries(cfg.properties)) {
        if (['name', 'race'].includes(k)) continue;
        const actual = k.includes('/') || ['character', 'class', 'reborn', 'doing', 'breakup'].includes(k) ? own(s.cultivation, k) : own(s, k);
        const expected = unconscious && ['qi', 'jing'].includes(k) ? 0 : v;
        if (expected === 0) assert.equal(num(actual), 0, k); else assert.equal(actual, expected, k);
    }
    for (const k of ['improve/neili', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai']) assert.equal(num(own(s.cultivation, k)), 0);
    const apply = side ? { armor: 100 } : { armor: 107, attack: 7, parry: 11, dodge: 13 };
    assert.deepEqual(own(s.temp, 'apply'), apply); assert.equal(num(own(s, 'no_exert')), cfg.temp?.no_exert ?? 0);
    assert.equal(sparse(s.temp, 'no_exert'), cfg.temp?.no_exert ?? 0); assert.equal(num(own(s, 'die_guard')), cfg.temp?.die_guard ?? 0);
    for (const k of ['powerup', 'shield', 'fight', 'guarding', 'daub', 'debuff', 'str', 'dex']) if (Object.hasOwn(s.temp, k)) empty(s.temp[k]);
    for (const k of ['weapon', 'handing', 'secondary_weapon']) { assert.equal(own(s, k), 'none'); assert.deepEqual(own(s, k + '_details'), {}); }
    for (const k of ['weapon_damage', 'weapon_flag', 'ammunition']) assert.equal(own(s, k), 0);
    assert.equal(own(s, 'effective_str'), s.str + Math.trunc(cfg.skills.unarmed / 10)); assert.equal(own(s, 'effective_con'), s.con + Math.trunc(cfg.skills.force / 10));
    assert.equal(own(s, 'effective_int'), s.int); assert.equal(own(s, 'effective_dex'), s.dex + Math.trunc(cfg.skills.dodge / 10));
    assert.deepEqual(own(s, 'effective_skills'), effective(s));
}
function stable(before, after, changes = {}) {
    const b = copy(before), a = copy(after); for (const [k, v] of Object.entries(changes)) b[k] = copy(v);
    b.effective_skills = effective(b); delete b.temp.notify_fail; delete a.temp.notify_fail;
    assert.deepEqual(a, b, 'unexplained state/resource/buff/relationship mutation');
}
function relate(snapshots, contexts) {
    assert.ok(Array.isArray(contexts)); assert.equal(contexts.length, snapshots.length);
    contexts.forEach((r, side) => {
        assert.equal(own(r, 'side'), side); const ids = snapshots.map(s => s.id), h = map(own(snapshots[side], 'hostility'));
        for (const [key, hs] of [['enemies', 'enemies'], ['want', 'wants'], ['killers', 'killers']]) {
            const v = own(r, key); assert.ok(Array.isArray(v)); assert.equal(new Set(v).size, v.length);
            if (key === 'enemies') { v.forEach(i => { assert.ok(Number.isSafeInteger(i) && snapshots[i] && i !== side); }); assert.deepEqual(v.map(i => ids[i]), own(h, hs)); }
            else { v.forEach(id => assert.ok(ids.includes(id) && id !== ids[side])); assert.deepEqual(v, own(h, hs)); }
        }
        const pairs = own(r, 'pairs'); assert.ok(Array.isArray(pairs)); assert.equal(pairs.length, snapshots.length - 1);
        assert.deepEqual(pairs.map(e => own(e, 'side')), snapshots.map((_, i) => i).filter(i => i !== side));
        for (const e of pairs) for (const [k, values] of [['fighting', h.enemies], ['want', h.wants], ['killing', h.killers]])
            assert.equal(own(e, k), Number(values.includes(ids[e.side])));
    });
}
const membership = (actual, expected) => { assert.ok(Array.isArray(actual)); assert.deepEqual([...actual].sort(), [...expected].sort()); };
function initialRelations(states, p) {
    states.forEach((s, side) => { const h = map(own(s, 'hostility')), peer = states[side ? 0 : 1].id;
        assert.deepEqual(h, { enemies: p.fighting ? [peer] : [], killers: p.fighting ? [peer] : [], wants: [] }); });
}
function resourceLedger(m, b, a, costs, launches = 0) {
    map(m); for (const k of resources) {
        assert.equal(metric(m, k + '_cost'), costs[k] ?? 0, k + ' gross cost'); assert.equal(metric(m, k + '_recovery'), 0);
        assert.equal(b[k] - a[k], costs[k] ?? 0, k + ' closed');
    }
    assert.equal(metric(m, 'ability_launched'), launches);
    const allowed = new Set([...resources.map(k => k + '_cost'), 'ability_launched']);
    for (const [k, v] of Object.entries(m)) { assert.ok(int(v) >= 0); if (!allowed.has(k)) assert.equal(v, 0, 'unexpected event ' + k); }
}
function addedBuff(s, ability) {
    const amount = s.effective_skills.force, breakup = num(s.cultivation.breakup);
    return ability === 'shield' ? { armor: Math.trunc(amount / 2) }
        : breakup ? { attack: Math.trunc(amount * 2 / 3), parry: Math.trunc(amount * 2 / 5), dodge: Math.trunc(amount * 2 / 5) }
            : { attack: Math.trunc(amount / 3), parry: Math.trunc(amount / 3), dodge: Math.trunc(amount / 3) };
}
function roarChanges(b, actor, passed) {
    const d = actor.effective_skills.force - Math.trunc(b.max_neili / 10), qi = passed && d > 0 ? d * 3 : 0;
    const wound = qi && b.neili < actor.effective_skills.force * 2 ? d * 2 : 0;
    const eff_jing = Math.max(-1, b.eff_jing - wound), jing = wound ? Math.min(b.jing, eff_jing) : b.jing;
    return { d, qi_input: qi, jing_wound_input: wound, qi: Math.max(-1, b.qi - qi), eff_jing, jing,
        craze: Math.min(b.max_craze, b.craze + (qi > 150 ? Math.trunc(qi / 5) : 0) + (wound > 150 ? Math.trunc(wound / 3) : 0)) };
}
export function validateMingjiaoJiuyangExertRecord(raw, c) {
    const p = validateMingjiaoJiuyangExertCondition(c), roar = p.ability === 'roar';
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), c.id); assert.equal(own(raw, 'method'), 'exert');
    assert.ok(Number.isSafeInteger(own(raw, 'index')) && raw.index >= 0 && raw.index < c.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(own(raw, 'outcome'))) { assert.ok(typeof own(raw, 'reason') === 'string' && raw.reason.trim()); return null; }
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) { assert.ok(Array.isArray(own(raw, k))); assert.equal(raw[k].length, 2); raw[k].forEach(map); }
    for (const k of ['attacks', 'actions', 'directs', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'dropped', 'terminals']) assert.deepEqual(own(raw, k), []);
    for (const k of ['launches', 'refusals', 'callbacks', 'busy_calls', 'skill_messages', 'exert_steps']) assert.ok(Array.isArray(own(raw, k)));
    assert.equal(raw.exert_steps.length, p.actions.length);
    const phaseStates = phase => [...raw[phase], ...(p.extra_target ? [own(raw, 'extra_target_' + phase)] : [])];
    const before = phaseStates('before'), immediate = phaseStates('immediate'), after = phaseStates('after'), metrics = [...raw.metrics];
    if (p.extra_target) metrics.push(map(own(raw, 'extra_target_metrics')));
    else for (const k of ['before', 'immediate', 'after', 'metrics']) assert.ok(!Object.hasOwn(raw, 'extra_target_' + k));
    const configs = [p.actor, p.target, ...(p.extra_target ? [p.extra_target] : [])]; before.forEach((s, i) => initial(s, configs[i], i, p));
    assert.equal(new Set(before.map(s => s.object)).size, before.length); initialRelations(before, p);
    if (p.target_state) { const prep = map(own(raw, 'preparation')); initial(own(prep, 'before'), p.target, 1, p, true);
        const e = copy(prep.before); e.living = 0; e.qi = e.jing = 0; e.temp.block_msg = { all: 1 };
        assert.deepEqual(own(prep, 'after'), e); assert.deepEqual(before[1], e); assert.deepEqual(own(prep, 'terminals'), [{ side: 1, state: 'unconscious' }]);
    } else assert.ok(!Object.hasOwn(raw, 'preparation'));
    const room = map(own(raw, 'exert_room')); for (const k of ['no_fight', 'skybook']) assert.equal(num(own(room, k)), p.room[k] ?? 0);
    const contexts = map(own(raw, 'relation_context')); for (const phase of ['before', 'immediate', 'after']) relate(phaseStates(phase), own(contexts, phase));
    const out = { commands_attempted: p.actions.length, commands_accepted: 0, commands_refused: 0, command_cost: 0, launches: 0,
        actor_neili_cost: 0, actor_qi_cost: 0, weak_gain: 0, actor_busy: num(own(immediate[0], 'busy')),
        buff_added: Object.fromEntries(buffKeys.map(k => [k, 0])), buff_returned: Object.fromEntries(buffKeys.map(k => [k, 0])),
        callback_pairs: 0, callback_elapsed: [], elapsed_wait: p.observe_seconds ? raw.elapsed : 0,
        roar_targets: {}, qi_cost: 0, eff_qi_cost: 0, jing_cost: 0, eff_jing_cost: 0 };
    let prior = before, launches = 0, refusals = 0, busyCalls = 0;
    const texts = raw.skill_messages.map(e => { assert.ok(before[own(e, 'side')]); assert.equal(typeof own(e, 'type'), 'string'); return plain(own(e, 'text')); });
    for (let index = 0; index < p.actions.length; index++) {
        const e = map(raw.exert_steps[index]), action = p.actions[index], ability = action.split(' ')[1];
        assert.equal(own(e, 'action'), action); assert.deepEqual(own(e, 'before'), prior.slice(0, 2));
        const end = own(e, 'after'); assert.ok(Array.isArray(end) && end.length === 2); const states = [...end];
        if (p.extra_target) { assert.deepEqual(own(e, 'extra_before'), prior[2]); states.push(map(own(e, 'extra_after'))); }
        else for (const k of ['extra_before', 'extra_after']) assert.ok(!Object.hasOwn(e, k));
        const cost = int(own(e, 'accepted')); assert.ok(cost >= 0);
        const accepted = p.expected === 'observed' && !(p.repeat_refusal && index === 1); assert.equal(cost > 0, accepted);
        out.command_cost += cost; out[accepted ? 'commands_accepted' : 'commands_refused']++;
        assert.equal(own(e, 'launch_start'), launches); assert.equal(own(e, 'refusal_start'), refusals);
        if (accepted) { assert.deepEqual(raw.launches[launches++], { actor: before[0].object, skill, argument: action.slice(6) }); assert.equal(own(e, 'reason'), ''); }
        else {
            const notice = p.repeat_refusal ?? p.refusal; assert.equal(plain(own(e, 'reason')), notice);
            assert.equal(plain(own(states[0].temp, 'notify_fail')), notice);
            if (!p.outer_refusal) { const r = map(raw.refusals[refusals++]); assert.equal(own(r, 'actor'), before[0].object); assert.equal(plain(own(r, 'reason')), notice); }
        }
        assert.equal(own(e, 'launch_end'), launches); assert.equal(own(e, 'refusal_end'), refusals);
        const actorBefore = prior[0], actorAfter = states[0], gainBefore = sparse(actorBefore.learned, skill), gainAfter = sparse(actorAfter.learned, skill), gain = gainAfter - gainBefore;
        assert.ok(accepted ? actorBefore.effective_skills.force >= 120 ? gain === 1 : [0, 1].includes(gain) : gain === 0);
        assert.deepEqual(actorAfter.learned, gainAfter ? { [skill]: gainAfter } : {}); out.weak_gain += gain;
        const fee = accepted || roar && p.variant === 'no-fight' ? 100 : 0, qiFee = roar && fee ? 10 : 0;
        out.actor_neili_cost += fee; out.actor_qi_cost += qiFee;
        const aChanges = { neili: actorBefore.neili - fee, qi: actorBefore.qi - qiFee, learned: actorAfter.learned };
        if (accepted && !roar) {
            const added = addedBuff(actorBefore, ability), temp = copy(actorBefore.temp); temp[ability] = 1;
            for (const [k, v] of Object.entries(added)) { temp.apply[k] += v; out.buff_added[k] += v; }
            aChanges.temp = temp; aChanges.busy = p.fighting ? ability === 'powerup' ? 3 : 2 : actorBefore.busy;
        } else if (accepted && roar) aChanges.busy = 5;
        const expectedBusy = num(aChanges.busy ?? actorBefore.busy);
        if (accepted && (roar || p.fighting)) {
            const call = map(raw.busy_calls[busyCalls++]); for (const [k, v] of Object.entries({ side: 0, caller_side: 0, requested: expectedBusy })) assert.equal(own(call, k), v);
            assert.equal(num(own(call, 'before')), num(actorBefore.busy)); assert.equal(num(own(call, 'after')), expectedBusy);
        }
        if (roar && accepted) {
            const passedSides = [], s = actorBefore.effective_skills.force;
            for (let side = 1; side < states.length; side++) {
                const b = prior[side], a = states[side], passed = own(actorAfter.hostility, 'wants').includes(b.id), lower = Math.trunc(s / 2);
                if (lower >= b.con * 2) assert.ok(passed); if (lower + lower - 1 < b.con * 2) assert.ok(!passed);
                if (passed) passedSides.push(side);
                const r = roarChanges(b, actorBefore, passed), h = map(own(a, 'hostility'));
                membership(h.enemies, passed && b.living ? [before[0].id] : []); membership(h.killers, passed && b.living ? [before[0].id] : []); membership(h.wants, []);
                const changes = { qi: r.qi, eff_jing: r.eff_jing, jing: r.jing, craze: r.craze, hostility: h };
                if (r.qi_input) changes.last_damage_from = before[0].object;
                stable(b, a, changes);
                out.roar_targets[String(side)] = { gate_trials: 1, gate_passed: Number(passed), damaging: Number(r.qi_input > 0),
                    qi_input: r.qi_input, jing_wound_input: r.jing_wound_input, source_damage: r.d,
                    qi_cost: b.qi - a.qi, eff_qi_cost: 0, jing_cost: b.jing - a.jing, eff_jing_cost: b.eff_jing - a.eff_jing,
                    craze_gain: a.craze - b.craze, actor_want: Number(passed), actor_fighting: Number(passed), actor_killing: 0,
                    target_fighting: Number(passed && b.living), target_killing: Number(passed && b.living), target_want: 0 };
            }
            membership(actorAfter.hostility.enemies, passedSides.map(side => before[side].id)); membership(actorAfter.hostility.wants, passedSides.map(side => before[side].id));
            membership(actorAfter.hostility.killers, []); aChanges.hostility = actorAfter.hostility;
        } else for (let side = 1; side < states.length; side++) stable(prior[side], states[side]);
        stable(actorBefore, actorAfter, aChanges); prior = states;
    }
    assert.deepEqual(prior, immediate); assert.equal(raw.launches.length, launches); assert.equal(raw.refusals.length, refusals); assert.equal(raw.busy_calls.length, busyCalls);
    out.launches = launches; assert.equal(int(own(raw, 'command_accepted')), out.command_cost);
    assert.equal(own(raw, 'reason'), p.expected === 'observed' ? '' : raw.exert_steps.at(-1).reason);
    if (out.commands_accepted) assert.ok(texts.length, 'original success messages');
    if (!p.observe_seconds) { assert.deepEqual(after, immediate); assert.deepEqual(raw.callbacks, []); }
    else {
        const delay = p.ability === 'powerup' ? Math.trunc(before[0].effective_skills.force / 2) : before[0].effective_skills.force;
        assert.deepEqual(raw.callbacks.map(e => [own(e, 'side'), own(e, 'phase')]), [[0, 'before'], [0, 'after']]);
        const [x, y] = raw.callbacks;
        for (const e of raw.callbacks) { assert.ok(Number.isFinite(own(e, 'elapsed'))); assert.equal(own(e, 'owner'), before[0].object); assert.equal(own(e, 'function'), 'eval_function'); }
        assert.ok(x.elapsed >= delay - 1 && y.elapsed >= x.elapsed && y.elapsed <= raw.elapsed); assert.ok(raw.elapsed >= p.observe_seconds - 1);
        assert.deepEqual(own(x, 'state'), immediate[0]); assert.deepEqual(own(y, 'state'), after[0]);
        const temp = copy(immediate[0].temp), added = addedBuff(before[0], p.ability);
        for (const [k, v] of Object.entries(added)) { temp.apply[k] -= v; out.buff_returned[k] += v; }
        delete temp[p.ability]; stable(immediate[0], after[0], { temp });
        for (let side = 1; side < after.length; side++) assert.deepEqual(after[side], immediate[side]);
        out.callback_pairs = 1; out.callback_elapsed.push(y.elapsed);
        assert.ok(texts.some(s => s.includes('你的九阳神功运行完毕，将内力收回丹田。')), 'natural expiry original notice');
    }
    resourceLedger(metrics[0], before[0], after[0], { neili: out.actor_neili_cost, qi: out.actor_qi_cost }, launches);
    for (let side = 1; side < before.length; side++) {
        const r = out.roar_targets[String(side)], costs = { qi: r?.qi_cost ?? 0, eff_qi: r?.eff_qi_cost ?? 0, jing: r?.jing_cost ?? 0, eff_jing: r?.eff_jing_cost ?? 0 };
        resourceLedger(metrics[side], before[side], after[side], costs); for (const [k, v] of Object.entries(costs)) out[k + '_cost'] += v;
    }
    return out;
}
const frequency = values => { const out = {}; for (const v of values) out[String(v)] = (out[String(v)] ?? 0) + 1; return out; };
export function mingjiaoJiuyangExertEffects(rows, c) {
    validateMingjiaoJiuyangExertCondition(c); assert.ok(Array.isArray(rows));
    const values = rows.map(r => validateMingjiaoJiuyangExertRecord(own(r, 'raw'), c)), known = values.filter(Boolean), unknown = rows.length - known.length;
    const sums = keys => Object.fromEntries(keys.map(k => [k, unknown ? null : known.reduce((n, v) => n + v[k], 0)]));
    const keys = ['commands_attempted', 'commands_accepted', 'commands_refused', 'command_cost', 'launches', 'actor_neili_cost', 'actor_qi_cost',
        'weak_gain', 'callback_pairs', 'qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost'];
    const roar_targets = {};
    for (const side of new Set(known.flatMap(v => Object.keys(v.roar_targets)))) {
        const vv = known.flatMap(v => v.roar_targets[side] ? [v.roar_targets[side]] : []);
        const fields = ['gate_trials', 'gate_passed', 'damaging', 'qi_input', 'jing_wound_input', 'qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost',
            'craze_gain', 'actor_want', 'actor_fighting', 'actor_killing', 'target_fighting', 'target_killing', 'target_want'];
        roar_targets[side] = { recorded: vv.length, ...Object.fromEntries(fields.map(k => [k, unknown ? null : vv.reduce((n, v) => n + v[k], 0)])),
            gate_probability: probability(vv.reduce((n, v) => n + v.gate_passed, 0), vv.length), source_damage: frequency(vv.map(v => v.source_damage)) };
    }
    const buffs = key => Object.fromEntries(buffKeys.map(k => [k, unknown ? null : known.reduce((n, v) => n + v[key][k], 0)]));
    return { validated: known.length, unknown, ...sums(keys), buff_added: buffs('buff_added'), buff_returned: buffs('buff_returned'),
        actor_busy: frequency(known.map(v => v.actor_busy)), elapsed_wait: distribution(known.filter(v => v.callback_pairs).map(v => v.elapsed_wait)),
        callback_elapsed: distribution(known.flatMap(v => v.callback_elapsed)), roar_targets, qualification_note: c.parameters.qualification_note };
}
