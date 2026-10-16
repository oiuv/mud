// Finite source-reviewed preparation. No registration, driver or recorded samples here.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';
import { gumuBuffPower } from './school_gumu_exert_cases.mjs';

const xinfa = 'shenghuo-xinfa', shengong = 'shenghuo-shengong';
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const fields = ['character', 'family/family_name', 'env/auto_regenerate', 'env/no_learn',
    'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/guimai', 'special_skill/wuxing',
    'special_skill/self', 'class', 'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int'];
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jingli: 1000,
    str: 36, int: 36, con: 36, dex: 36, gender: '男性', character: '光明磊落',
    combat_exp: 100000000, jiali: 0, potential: 10000, learned_points: 0,
    'family/family_name': '明教', 'env/auto_regenerate': 0 };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const mingjiaoXinfaSourcePaths = [
    'kungfu/skill/shenghuo-xinfa.c', 'kungfu/skill/shenghuo-xinfa/powerup.c',
    'kungfu/skill/shenghuo-shengong.c', 'kungfu/skill/force/recover.c', 'kungfu/skill/force.c',
    'kungfu/skill/huashan-xinfa.c', 'kungfu/skill/unarmed.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'kungfu/class/mingjiao/weiyixiao.c', 'kungfu/class/mingjiao/xiexun.c', 'kungfu/class/mingjiao/mingjiao.h',
    'cmds/skill/exert.c', 'cmds/skill/practice.c', 'cmds/skill/learn.c',
    'inherit/skill/force.c', 'inherit/skill/skill.c', 'clone/user/user.c', 'inherit/char/char.c',
    'feature/skill.c', 'feature/attribute.c', 'feature/damage.c', 'feature/action.c', 'feature/attack.c',
    'feature/dbase.c', 'feature/equip.c', 'feature/condition.c', 'mudcore/inherit/action.c',
    'mudcore/inherit/dbase.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c', 'data/e2c_dict.o',
    'include/globals.h', 'include/skill.h', 'include/command.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
export const mingjiaoXinfaReviewedSourceHash = 'c520f956a08ba21b7e5fe036aed33d24bb1ddab5e067cbf6d08de3e82930ed12';
export const mingjiaoXinfaAbsentPaths = ['shenghuo-xinfa/recover', 'force/powerup']
    .flatMap(id => ['c', 'lpc'].map(ext => `kungfu/skill/${id}.${ext}`));

function actor(skills, mappings = {}, properties = {}, temp) {
    return { skills, mappings, preparations: {}, properties: { ...pool, ...properties }, ...(temp ? { temp } : {}) };
}
function plans() {
    const out = [], target = actor({ force: 200, unarmed: 200, dodge: 200, parry: 200 });
    const add = (variant, method, skill, ability, config, extra = {}) => {
        const expected = extra.expected ?? 'observed';
        out.push({ id: 'school-mingjiao-xinfa-' + variant, stage: 'school', method,
            parameters: { school: 'mingjiao', family: '明教', collection_group: 'mingjiao-xinfa', variant,
                skill, usage: 'force', ability, level: config.skills[skill] ?? 200,
                actor: config, target: structuredClone(target), named_participants: true,
                fighting: false, room: {}, expected, not_applicable: '',
                observation: 'single_action_immediate', observe_seconds: 0,
                action: method === 'interface' ? 'test_interface' : `${method} ${ability}`,
                command_return: method === 'interface' ? 1 : Number(expected === 'observed'),
                qualification_sources: mingjiaoXinfaSourcePaths,
                qualification_note: '真实普通USER的有限实验配功，不冒充自然拜师或完整明教。独有强化、公共恢复、资格、兼修与容量分列；不以既有寒冰/七伤映射出现代替本能力。原时钟、命令、随机熟练、费用与回调不变；低功力即时100采随机，实际到期2仅作生命周期旁证。',
                ...extra } });
    };
    const powerActor = (level = 200, properties = {}, temp) => actor(
        { force: level, [xinfa]: level, unarmed: 200, dodge: 200, parry: 200 }, { force: xinfa }, properties, temp);
    for (const level of [200, 400, 800]) add('a-powerup' + level, 'exert', xinfa, 'powerup', powerActor(level));
    add('a-fighting', 'exert', xinfa, 'powerup', powerActor(), { fighting: true });
    add('a-neili149', 'exert', xinfa, 'powerup', powerActor(200, { neili: 149 }),
        { expected: 'refused', refusal: '你的内力不够。\n' });
    add('a-neili150', 'exert', xinfa, 'powerup', powerActor(200, { neili: 150 }));
    add('a-other', 'exert', xinfa, 'powerup', powerActor(), { action: 'exert powerup right',
        expected: 'refused', refusal: '你只能用圣火心法来提升自己的战斗力。\n' });
    add('a-repeat', 'exert', xinfa, 'powerup', powerActor(), { repeat_actions: ['exert powerup', 'exert powerup'] });
    add('a-expiry', 'exert', xinfa, 'powerup', powerActor(20, {},
        { 'apply/attack': 7, 'apply/dodge': 11, 'apply/parry': 13 }),
    { observation: 'timed_effect', observe_seconds: 32, probability_scope: 'lifecycle_only' });
    add('a-low30', 'exert', xinfa, 'powerup', powerActor(20), { probability_scope: 'random_weak_progress' });
    const qualification = (force = 10, main = 0, gender = '男性') => actor(
        { force, [xinfa]: 50, ...(main ? { [shengong]: main } : {}) }, { force: xinfa }, { gender });
    const iface = (variant, skill, ability, config, expected = 'observed', refusal) =>
        add(variant, 'interface', skill, ability, config, { expected, ...(refusal ? { refusal } : {}),
            interface: { object: ability === 'can_learn' ? '/cmds/skill/learn' : ability.startsWith('query_')
                ? 'player' : '/kungfu/skill/' + skill, function: ability,
            ...(ability === 'can_learn' ? { argument: skill } : {}) } });
    iface('b-force9', xinfa, 'valid_learn', qualification(9), 'refused', '你的基本内功火候还不够，还不能学习圣火心法。\n');
    iface('b-force10', xinfa, 'valid_learn', qualification());
    iface('b-eunuch100', xinfa, 'valid_learn', qualification(10, 100, '无性'));
    iface('b-eunuch101', xinfa, 'valid_learn', qualification(10, 101, '无性'), 'refused',
        '你无根无性，阴阳不调，难以领会高深的圣火心法。\n');
    iface('b-male101', xinfa, 'valid_learn', qualification(10, 101));
    add('c-practice', 'practice', xinfa, 'practice', actor(
        { force: 201, [xinfa]: 200 }, { force: xinfa }), { action: 'practice force 1',
        repetitions: 1, completed: 0, expected: 'refused', refusal: '圣火心法只能用学(learn)的来增加熟练度。\n' });
    iface('d-known-shengong', xinfa, 'can_learn', actor({ force: 200, [shengong]: 200 }, { force: shengong }));
    iface('d-known-xinfa', shengong, 'can_learn', actor({ force: 200, [xinfa]: 200 }, { force: xinfa }));
    iface('d-known-huashan', xinfa, 'can_learn', actor({ force: 200, 'huashan-xinfa': 200 }, { force: 'huashan-xinfa' }),
        'refused', '你发现自身所学的华山心法和圣火心法冲突不已，根本没办法并存。\n');
    const capacity = mapping => actor({ force: 200, [xinfa]: 200, [shengong]: 300 }, { force: mapping });
    iface('e-total', xinfa, 'query_neili_limit', capacity(xinfa));
    iface('e-current-xinfa', xinfa, 'query_current_neili_limit', capacity(xinfa));
    iface('e-current-shengong', shengong, 'query_current_neili_limit', capacity(shengong));
    add('f-recover', 'exert', xinfa, 'recover', powerActor(200, { qi: 9900 }));
    add('f-unmapped', 'exert', xinfa, 'recover', actor(
        { force: 200, [xinfa]: 200, unarmed: 200, dodge: 200, parry: 200 }, {}, { qi: 9900 }),
    { expected: 'refused', refusal: '你请先用 enable 指令选择你要使用的内功。\n' });
    return out;
}
function evidenceHash(evidence) { return hash(JSON.stringify(mingjiaoXinfaSourcePaths.map(path => [path, evidence[path]]))); }
export function mingjiaoXinfaConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0); assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(mingjiaoXinfaSourcePaths.map(path => [path, hash(readSource(path))]));
    assert.equal(evidenceHash(evidence), mingjiaoXinfaReviewedSourceHash, '来源变动须重审，不能自动接受新源码');
    for (const path of mingjiaoXinfaAbsentPaths) {
        let missing = false;
        try { readSource(path); } catch (error) { if (error.code === 'ENOENT') missing = true; else throw error; }
        assert.ok(missing, '缺席回退入口必须仍缺席：' + path);
    }
    for (const id of [xinfa, shengong, xinfa + '/powerup', 'force/recover']) {
        const source = catalog.skills.find(s => s.id === id);
        assert.equal(source?.path, `kungfu/skill/${id}.c`); assert.equal(source.sha256, evidence[source.path]);
    }
    return plans().map(c => {
        const p = c.parameters, entry = p.ability === 'recover' ? 'force/recover'
            : p.ability === 'powerup' ? xinfa + '/powerup' : p.skill;
        const source = catalog.skills.find(s => s.id === entry);
        const entry_id = entry.includes('/') ? source.entries.find(e => e.role === 'exert')?.id : source.path;
        assert.ok(entry_id, '缺少实际exert入口');
        return { ...c, entry_id, samples: smoke || p.variant !== 'a-low30' ? 2 : samples,
            parameters: { ...p, source_evidence: evidence, absent_sources: mingjiaoXinfaAbsentPaths } };
    });
}
function map(v, label) { assert.ok(v && typeof v === 'object' && !Array.isArray(v), label); return v; }
function int(v, label) { assert.ok(Number.isSafeInteger(v), label); return v; }
function idle(v, key) { assert.ok(Object.hasOwn(v, key), '缺少字段：' + key); return v[key] === null ? 0 : int(v[key], key); }
function sparse(v, key) { map(v); return Object.hasOwn(v, key) ? int(v[key], key) : 0; }
function metric(v, key) { const n = sparse(v, key); assert.ok(n >= 0, key); return n; }
function parameters(c) {
    const p = map(c.parameters), plan = plans().find(x => x.id === c.id); assert.ok(plan, '未审核条件');
    assert.equal(c.stage, plan.stage); assert.equal(c.method, plan.method);
    const { source_evidence: evidence, absent_sources: absent, ...rest } = p;
    assert.deepEqual(rest, plan.parameters, '有限条件不得漂移');
    assert.deepEqual(Object.keys(map(evidence)), mingjiaoXinfaSourcePaths);
    for (const h of Object.values(evidence)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(evidenceHash(evidence), mingjiaoXinfaReviewedSourceHash); assert.deepEqual(absent, mingjiaoXinfaAbsentPaths);
    assert.ok(Number.isSafeInteger(c.samples) && c.samples > 0);
    const path = c.method === 'exert' ? p.ability === 'powerup' ? 'kungfu/skill/shenghuo-xinfa/powerup.c'
        : 'kungfu/skill/force/recover.c' : `kungfu/skill/${p.skill}.c`;
    if (c.method === 'exert') assert.match(c.entry_id, new RegExp(`^${path}:\\d+:exert$`));
    else assert.equal(c.entry_id, path);
    return p;
}
function identity(s) {
    map(s); assert.match(s.object, /^\/tests\/actor#\d+$/);
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(s[k], 1, k);
    for (const k of ['wizardp', 'ghost']) assert.equal(s[k], 0, k);
    assert.ok(idle(s, 'busy') >= 0); assert.ok([0, 1].includes(s.fighting_opponent));
    for (const k of ['temp', 'skills', 'mappings', 'preparations', 'effective_skills', 'cultivation', 'learned']) map(s[k], k);
    for (const k of ['skills', 'effective_skills', 'learned']) for (const v of Object.values(s[k])) assert.ok(int(v, k) >= 0);
    for (const k of [...resources, 'max_qi', 'max_jing', 'max_neili', 'potential', 'learned_points']) int(s[k], k);
    assert.equal(idle(s, 'conditions'), 0);
    for (const k of ['weapon', 'handing', 'secondary_weapon']) { assert.equal(s[k], 'none'); assert.deepEqual(s[k + '_details'], {}); }
    for (const k of ['weapon_damage', 'weapon_flag', 'ammunition']) assert.equal(s[k], 0);
    for (const v of Object.values(map(s.temp.apply))) int(v, 'apply');
}
function stable(b, a) {
    const exclude = new Set([...resources, 'learned', 'busy', 'temp', 'powers', 'effective_skills']);
    const keep = s => Object.fromEntries(Object.entries(s).filter(([k]) => !exclude.has(k)));
    assert.deepEqual(keep(a), keep(b), '身份/基础属性/技能/映射不能漂移');
    assert.deepEqual(a.effective_skills, Object.fromEntries(Object.entries(a.skills).map(([k, lvl]) =>
        [k, Math.trunc(lvl / 2) + (a.skills[a.mappings[k]] ?? 0) + sparse(a.temp.apply, k)])), '有效等级包含真实apply');
}
function cleanTemp(s) { const t = structuredClone(s.temp); delete t.notify_fail; return t; }
function normalize(t) { const x = structuredClone(t); for (const k of Object.keys(x.apply)) if (x.apply[k] === 0) delete x.apply[k]; return x; }
function strip(s) { return s.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''); }
function refusal(event, expected) { assert.equal(typeof event.reason, 'string'); assert.equal(strip(event.reason), expected); }
function ifaceValue(p) {
    if (p.ability === 'valid_learn' || p.ability === 'can_learn') return Number(p.expected === 'observed');
    return p.variant === 'e-current-xinfa' ? 3000 : 5080;
}
export function validateMingjiaoXinfaRecord(raw, c) {
    const p = parameters(c), ok = p.expected === 'observed', exert = c.method === 'exert', practice = c.method === 'practice';
    const buff = exert && ok && p.ability === 'powerup', recover = exert && ok && p.ability === 'recover';
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, c.id); assert.equal(raw.method, c.method);
    assert.ok(Number.isSafeInteger(raw.index) && raw.index >= 0 && raw.index < c.samples);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(raw.outcome)) {
        assert.ok(typeof raw.reason === 'string' && raw.reason.trim());
        return null;
    }
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2, k);
    for (const k of ['attacks', 'passives', 'defenses', 'dodge_checks', 'dropped', 'terminals']) assert.deepEqual(raw[k], [], k);
    for (const k of ['actions', 'directs']) assert.deepEqual(raw[k], [], k);
    for (const k of ['interfaces', 'launches', 'refusals', 'callbacks']) assert.ok(Array.isArray(raw[k]), k);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0); assert.equal(Object.hasOwn(raw, 'preparation'), false);
    const [b, t] = raw.before, a = raw.immediate[0], end = raw.after[0]; assert.notEqual(b.object, t.object);
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted >= 0);
    assert.equal(p.repeat_actions ? raw.command_accepted : Number(raw.command_accepted > 0), p.command_return);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const s = raw.before[side];
        for (const phase of ['before', 'immediate', 'after']) { identity(raw[phase][side]); stable(s, raw[phase][side]); }
        assert.equal(s.id, side ? 'right' : 'left'); assert.equal(idle(s, 'busy'), 0);
        assert.equal(s.fighting_opponent, Number(p.fighting));
        assert.deepEqual(s.skills, cfg.skills); assert.deepEqual(s.mappings, cfg.mappings); assert.deepEqual(s.preparations, {});
        assert.deepEqual(s.learned, {});
        for (const [k, v] of Object.entries(cfg.properties)) assert.equal(k.includes('/') || k === 'character'
            ? v === 0 ? idle(s.cultivation, k) : s.cultivation[k] : s[k], v, k);
        for (const k of fields.filter(k => !Object.hasOwn(cfg.properties, k))) assert.equal(idle(s.cultivation, k), 0, k);
        assert.equal(s.effective_int, cfg.properties.int);
        assert.equal(s.effective_str, cfg.properties.str + Math.trunc(Math.max(0,
            ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0)) / 10));
        const apply = { armor: 100 }; for (const [k, v] of Object.entries(cfg.temp ?? {})) apply[k.slice(6)] = v;
        assert.deepEqual(s.temp.apply, apply); assert.equal(sparse(s.temp, 'powerup'), 0); assert.equal(sparse(s.temp, 'no_exert'), 0);
        for (const v of Object.values(map(raw.metrics[side]))) assert.ok(int(v) >= 0, '未知计数不能补0');
        for (const k of ['hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats']) assert.equal(metric(raw.metrics[side], k), 0);
    }
    assert.deepEqual(raw.immediate[1], t); assert.deepEqual(raw.after[1], t);
    const costs = { neili: buff ? 150 : recover ? 33 : 0 }, heals = { qi: recover ? 100 : 0 };
    for (const side of [0, 1]) for (const k of resources) {
        const cost = side ? 0 : costs[k] ?? 0, heal = side ? 0 : heals[k] ?? 0;
        assert.equal(metric(raw.metrics[side], k + '_cost'), cost); assert.equal(metric(raw.metrics[side], k + '_recovery'), heal);
        for (const phase of ['immediate', 'after']) assert.equal(raw[phase][side][k], raw.before[side][k] - cost + heal);
    }
    assert.ok(Object.values(raw.metrics[1]).every(v => v === 0)); assert.equal(metric(raw.metrics[0], 'ability_launched'), Number(exert && ok));
    const learnedSkill = recover ? 'force' : p.skill, gain = sparse(a.learned, learnedSkill);
    for (const [k, v] of Object.entries(a.learned)) if (k !== learnedSkill) assert.equal(v, 0);
    if (exert && ok) assert.ok((recover ? b.skills.force : b.effective_skills.force) >= 120 ? gain === 1 : [0, 1].includes(gain));
    else assert.equal(gain, 0);
    assert.deepEqual(end.learned, a.learned); assert.equal(a.learned_points, b.learned_points);
    if (exert) {
        assert.deepEqual(raw.interfaces, []);
        assert.deepEqual(raw.launches, ok ? [{ actor: b.object, skill: recover ? 'force' : xinfa, argument: p.action.slice(6) }] : []);
        const outerRefusal = p.variant === 'f-unmapped';
        // No force mapping: the original command returns before SKILL.exert_function,
        // so there is no skill-refusal probe event to invent or require.
        assert.equal(raw.refusals.length, outerRefusal ? 0 : !ok || p.repeat_actions ? 1 : 0);
        if (raw.refusals.length) {
            assert.equal(raw.refusals[0].actor, b.object);
            refusal(raw.refusals[0], p.repeat_actions ? '你已经在运功中了。\n' : p.refusal);
            assert.equal(strip(raw.refusals[0].reason), a.temp.notify_fail);
        }
        if (outerRefusal) {
            assert.equal(raw.command_accepted, 0);
            assert.equal(raw.reason, '技能入口未返回成功');
            assert.equal(a.temp.notify_fail, p.refusal, '外层命令原notify_fail必须完整保留');
        } else if (!ok) { refusal(raw, p.refusal); assert.equal(raw.reason, raw.refusals[0].reason); }
        else assert.equal(raw.reason, '');
    } else {
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.refusals, []);
        if (c.method === 'interface') {
            assert.equal(raw.interfaces.length, 1); const e = raw.interfaces[0];
            for (const [k, v] of Object.entries(p.interface)) assert.equal(e[k], v);
            assert.equal(idle(e, 'result'), ifaceValue(p));
            assert.equal(e.implemented_by, p.ability === 'can_learn' ? '/cmds/skill/learn'
                : p.ability.startsWith('query_') ? '/clone/user/user' : '/kungfu/skill/' + p.skill);
        } else assert.deepEqual(raw.interfaces, []);
        if (!ok) { refusal(raw, p.refusal); assert.equal(strip(raw.reason), strip(a.temp.notify_fail)); } else assert.equal(raw.reason, '');
    }
    assert.equal(idle(a, 'busy'), p.fighting && buff ? 3 : 0); assert.equal(idle(end, 'busy'), idle(a, 'busy'));
    const expectedTemp = cleanTemp(b), actualTemp = cleanTemp(a), amount = Math.trunc(b.effective_skills.force / 6);
    if (practice) {
        const time = map(actualTemp.time); assert.ok(Number.isSafeInteger(time.practice) && time.practice > 0);
        assert.equal(sparse(expectedTemp.time ?? {}, 'practice'), 0); delete time.practice; if (!Object.keys(time).length) delete actualTemp.time;
        for (const k of ['no_fight', 'practice_improve', 'research_improve']) assert.equal(idle(map(raw.movement_room), k), 0);
    }
    if (buff) { for (const k of ['attack', 'dodge', 'parry']) expectedTemp.apply[k] = sparse(expectedTemp.apply, k) + amount; expectedTemp.powerup = 1; }
    assert.deepEqual(normalize(actualTemp), normalize(expectedTemp), '仅允许原命令的临时变化');
    if (exert) for (const s of [b, a, end]) {
        assert.deepEqual(Object.keys(map(s.powers)).sort(), ['attack', 'dodge', 'parry']);
        for (const k of ['attack', 'dodge', 'parry']) assert.equal(s.powers[k], gumuBuffPower(s, k), '真实公共能力值');
    }
    if (p.repeat_actions) {
        assert.equal(raw.repeat_steps?.length, 2); const [first, second] = raw.repeat_steps;
        assert.deepEqual(first.before, b); assert.deepEqual(second.before, first.after); assert.deepEqual(second.after, a);
        for (const [i, step] of raw.repeat_steps.entries()) {
            assert.equal(step.action, p.repeat_actions[i]); assert.ok(Number.isSafeInteger(step.accepted) && step.accepted >= 0);
            assert.equal(Number(step.accepted > 0), 1 - i); assert.equal(step.launches_before, i); assert.equal(step.launches_after, 1);
            assert.equal(step.refusals_before, 0); assert.equal(step.refusals_after, i); assert.deepEqual(step.metrics, raw.metrics[0]);
        }
        assert.equal(first.reason, ''); assert.equal(second.reason, raw.refusals[0].reason);
        assert.deepEqual({ ...first.after, temp: cleanTemp(first.after) }, { ...a, temp: cleanTemp(a) });
    } else assert.equal(Object.hasOwn(raw, 'repeat_steps'), false);
    if (!p.observe_seconds) { assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.callbacks, []); }
    else {
        assert.deepEqual(raw.callbacks.map(e => [e.side, e.phase]), [[0, 'before'], [0, 'after']]);
        const [x, y] = raw.callbacks;
        for (const e of [x, y]) { identity(e.state); stable(a, e.state); assert.equal(e.state.object, b.object); assert.ok(Number.isFinite(e.elapsed)); }
        // Integer call_out is tick-aligned; preserve the measured high-resolution elapsed value.
        assert.ok(x.elapsed >= b.effective_skills.force - 1 && y.elapsed >= x.elapsed && y.elapsed <= raw.elapsed);
        assert.ok(raw.elapsed >= p.observe_seconds - 1); assert.deepEqual(x.state, a); assert.deepEqual(y.state, end);
        assert.deepEqual(normalize(cleanTemp(end)), normalize(cleanTemp(b)), '原自然到期恢复三项加成与标志');
    }
    return { method: c.method, interface_result: c.method === 'interface' ? ifaceValue(p) : null,
        command_attempts: c.method === 'interface' ? 0 : p.repeat_actions?.length ?? 1,
        commands_accepted: c.method === 'interface' ? 0 : Number(raw.command_accepted > 0), launches: raw.launches.length,
        learned_skill: learnedSkill, learned_gain: gain, busy: idle(a, 'busy'),
        costs: Object.fromEntries(resources.map(k => [k, metric(raw.metrics[0], k + '_cost')])),
        recovery: Object.fromEntries(resources.map(k => [k, metric(raw.metrics[0], k + '_recovery')])),
        net: Object.fromEntries(resources.map(k => [k, a[k] - b[k]])),
        powers_delta: exert ? Object.fromEntries(['attack', 'dodge', 'parry'].map(k => [k, a.powers[k] - b.powers[k]])) : null,
        callback_pairs: raw.callbacks.length / 2, expiry_seconds: raw.callbacks[0]?.elapsed ?? null };
}
export function mingjiaoXinfaEffects(rows, c) {
    const p = parameters(c), counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, c.id); assert.equal(row.raw?.condition_id, c.id);
        assert.equal(row.raw.method, c.method); assert.equal(row.raw.outcome, row.outcome);
        const observation = validateMingjiaoXinfaRecord(row.raw, c);
        assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        if (['error', 'not_applicable'].includes(row.outcome)) continue;
        known.push(observation);
    }
    const unknown = counts.error + counts.not_applicable, sum = k => known.reduce((n, o) => n + o[k], 0);
    const values = getter => distribution([...known.map(getter), ...Array(unknown).fill(null)]);
    const progressed = known.filter(o => o.learned_gain > 0).length;
    return { samples: rows.length, counts, validated_samples: known.length, unknown_samples: unknown,
        interface_samples: known.filter(o => o.method === 'interface').length,
        interface_result: values(o => o.interface_result), command_attempts: sum('command_attempts'),
        commands_accepted: sum('commands_accepted'), launches: sum('launches'), progressed_samples: progressed,
        progression: p.probability_scope === 'lifecycle_only' ? null : probability(progressed, known.length),
        probability_scope: p.probability_scope ?? 'deterministic', learned_gain: values(o => o.learned_gain),
        costs: Object.fromEntries(resources.map(k => [k, values(o => o.costs[k])])),
        recovery: Object.fromEntries(resources.map(k => [k, values(o => o.recovery[k])])),
        net: Object.fromEntries(resources.map(k => [k, values(o => o.net[k])])),
        busy_histogram: Object.fromEntries([0, 1, 2, 3].map(v => [v, known.filter(o => o.busy === v).length])),
        powers_delta: Object.fromEntries(['attack', 'dodge', 'parry'].map(k => [k, values(o => o.powers_delta?.[k])])),
        callback_pairs: sum('callback_pairs'), expiry_seconds: values(o => o.expiry_seconds),
        unknown_scopes: ['实验资格不是自然师承或完整门派', '不采研究/打坐/继承加力/轻功防御',
            ...(p.probability_scope === 'lifecycle_only' ? ['两条自然到期仅核生命周期，随机熟练率由独立即时条件统计'] : [])] };
}
