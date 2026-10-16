// Finite source-reviewed preparation only. Registration and real sampling belong to the caller.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';
import { gumuBuffPower } from './school_gumu_exert_cases.mjs';

const skill = 'shenghuo-shengong', xinfa = 'shenghuo-xinfa';
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const cultivation = ['character', 'family/family_name', 'env/auto_regenerate', 'env/no_learn',
    'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/guimai', 'special_skill/wuxing',
    'special_skill/self', 'class', 'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int'];
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 1000, max_neili: 1000, jingli: 1000,
    str: 36, int: 36, con: 36, dex: 36, gender: '男性', character: '光明磊落',
    combat_exp: 100000000, jiali: 0, potential: 10000, learned_points: 0,
    'family/family_name': '明教', 'env/auto_regenerate': 0 };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const mingjiaoShengongSourcePaths = [
    'kungfu/skill/shenghuo-shengong.c', 'kungfu/skill/shenghuo-shengong/powerup.c',
    'kungfu/skill/shenghuo-shengong/shield.c', 'kungfu/skill/shenghuo-xinfa.c',
    'kungfu/skill/force/recover.c', 'kungfu/skill/force/regenerate.c', 'kungfu/skill/force.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'kungfu/class/mingjiao/zhangwuji.c', 'kungfu/class/mingjiao/fanyao.c', 'kungfu/class/mingjiao/mingjiao.h',
    'cmds/skill/exert.c', 'cmds/skill/practice.c', 'cmds/skill/research.c', 'cmds/skill/learn.c',
    'inherit/skill/force.c', 'inherit/skill/skill.c', 'clone/user/user.c', 'inherit/char/char.c',
    'feature/skill.c', 'feature/attribute.c', 'feature/damage.c', 'feature/action.c', 'feature/attack.c',
    'feature/dbase.c', 'feature/equip.c', 'feature/condition.c', 'mudcore/inherit/action.c',
    'mudcore/inherit/dbase.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c', 'data/e2c_dict.o',
    'include/globals.h', 'include/skill.h', 'include/command.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
export const mingjiaoShengongReviewedSourceHash = '5ecc5721c3db4f83b8e33a5606a72549add9ff76cb68b2d12fb79b5528c421c7';
export const mingjiaoShengongAbsentPaths = [skill + '/recover', skill + '/regenerate', 'force/powerup', 'force/shield']
    .flatMap(id => ['c', 'lpc'].map(ext => `kungfu/skill/${id}.${ext}`));

function actor(level = 200, properties = {}, temp, extraSkills = {}, force = level) {
    return { skills: { force, [skill]: level, unarmed: 200, dodge: 200, parry: 200, ...extraSkills },
        mappings: { force: skill }, preparations: {}, properties: { ...pool, ...properties }, ...(temp ? { temp } : {}) };
}
function plans() {
    const out = [], target = { skills: { force: 200, unarmed: 200, dodge: 200, parry: 200 },
        mappings: {}, preparations: {}, properties: { ...pool } };
    const add = (variant, method, ability, config = actor(), extra = {}) => {
        const expected = extra.expected ?? 'observed';
        out.push({ id: 'school-mingjiao-shengong-' + variant, stage: 'school', method,
            parameters: { school: 'mingjiao', family: '明教', collection_group: 'mingjiao-shengong', variant,
                skill, usage: 'force', ability, level: config.skills[skill], actor: config,
                target: structuredClone(target), named_participants: true, fighting: false, room: {},
                expected, not_applicable: '', observation: 'single_action_immediate', observe_seconds: 0,
                action: method === 'interface' ? 'test_interface' : `${method} ${ability}`,
                command_return: method === 'interface' ? 1 : Number(expected === 'observed'),
                qualification_sources: mingjiaoShengongSourcePaths,
                qualification_note: '真实普通USER的有限实验配功，不等同自然拜师或完整明教。资格、继承接口、容量、研究、独有强化及公共恢复分列；研究按原随机与次数收费，低精神直接清零另账。保留原时钟/回调和既有apply，不采圣火令联动连击或完整NPC教学。',
                ...extra } });
    };
    const iface = (v, ability, cfg = actor(), extra = {}) => add(v, 'interface', ability, cfg,
        { interface: { object: ability === 'query_current_neili_limit' ? 'player' : '/kungfu/skill/' + skill,
            function: ability, ...(extra.argument !== undefined ? { argument: extra.argument } : {}) }, ...extra });
    iface('a-enable-force', 'valid_enable', actor(), { argument: 'force', interface_result: 1 });
    iface('a-enable-dodge', 'valid_enable', actor(), { argument: 'dodge', interface_result: 0 });
    for (const [v, cfg, refusal] of [
        ['a-int31', actor(200, { int: 31 }), '你先天悟性不够，无法领悟圣火神功。\n'],
        ['a-int32', actor(200, { int: 32 })],
        ['a-force179', actor(200, {}, undefined, {}, 179), '你的基本内功火候还不够，还不能学习圣火神功。\n'],
        ['a-force180', actor(200, {}, undefined, {}, 180)],
        ['a-eunuch49', actor(49, { gender: '无性' }, undefined, {}, 200)],
        ['a-eunuch50', actor(50, { gender: '无性' }, undefined, {}, 200), '你无根无性，阴阳不调，难以领会高深的圣火神功。\n'],
        ['a-male50', actor(50, {}, undefined, {}, 200)],
    ]) iface(v, 'valid_learn', cfg, { expected: refusal ? 'refused' : 'observed', interface_result: Number(!refusal), ...(refusal ? { refusal } : {}) });
    iface('a-valid-research', 'valid_research', actor(), { interface_result: 1 });
    iface('a-type', 'type', actor(), { interface_result: 'martial' });
    iface('a-learn-level', 'valid_learn_level', actor(), { interface_result: 200 });
    add('a-practice', 'practice', 'practice', actor(200, {}, undefined, {}, 201),
        { action: 'practice force 1', repetitions: 1, completed: 0, expected: 'refused',
            refusal: '圣火神功只能用学(learn)的来增加熟练度。\n' });
    const research = (v, cfg, completed = 1, extra = {}) => add(v, 'research', 'research', cfg,
        { action: `research ${skill} ${extra.repetitions ?? 1}`, repetitions: 1, completed,
            expected: completed ? 'observed' : 'refused', ...extra });
    research('a-research179', actor(179), 0, { refusal: '你对圣火神功的掌握程度还未到研究的程度。\n' });
    for (const level of [180, 200, 400, 800]) research('a-research' + level, actor(level), 1, { random_effects: true });
    research('a-research-pair', actor(200, {}, undefined, { [xinfa]: 200 }), 1, { random_effects: true });
    research('a-potential0', actor(200, { potential: 0 }), 0, { refusal: '你的潜能不够研究这么多次了。\n' });
    research('a-jing26', actor(200, { jing: 26 }), 0, { command_return: 1,
        refusal: '依你目前的能力，没有办法研究这种技能。\n', jing_writeoff: 26, research_started: true });
    research('a-effjing26', actor(200, { jing: 26, eff_jing: 26 }), 0,
        { refusal: '你觉得你精力不济，实在没有办法进行研究。\n' });
    research('a-partial', actor(200, { jing: 54 }), 2,
        { action: `research ${skill} 3`, repetitions: 3, random_effects: true });
    for (const level of [200, 400, 800]) {
        iface('b-improve' + level, 'query_neili_improve', actor(level), { interface_result: level * level * 12 / 1000 });
        iface('b-current' + level, 'query_current_neili_limit', actor(level),
            { interface_result: level * 15 + level * level * 12 / 1000 });
    }
    for (const level of [200, 400, 800]) add('c-powerup' + level, 'exert', 'powerup', actor(level));
    add('c-powerup149', 'exert', 'powerup', actor(200, { neili: 149 }),
        { expected: 'refused', refusal: '你的内力不够。\n' });
    add('c-powerup150', 'exert', 'powerup', actor(200, { neili: 150 }));
    add('c-powerup-other', 'exert', 'powerup', actor(), { action: 'exert powerup right', expected: 'refused',
        refusal: '你只能用圣火神功来提升自己的战斗力。\n' });
    add('c-powerup-repeat', 'exert', 'powerup', actor(), { repeat_actions: ['exert powerup', 'exert powerup'] });
    add('c-powerup-fighting', 'exert', 'powerup', actor(), { fighting: true, random_effects: true });
    add('c-powerup-expiry', 'exert', 'powerup', actor(20, {},
        { 'apply/attack': 7, 'apply/dodge': 11, 'apply/parry': 13 }, {}, 200),
    { observation: 'timed_effect', observe_seconds: 22, probability_scope: 'lifecycle_only' });
    for (const level of [200, 400, 800]) add('c-shield' + level, 'exert', 'shield', actor(level));
    add('c-shield99', 'exert', 'shield', actor(200, { neili: 99 }), { expected: 'refused', refusal: '你的真气不够。\n' });
    add('c-shield100', 'exert', 'shield', actor(200, { neili: 100 }));
    add('c-shield39', 'exert', 'shield', actor(39, {}, undefined, {}, 200),
        { expected: 'refused', refusal: '你的圣火神功等级不够。\n' });
    add('c-shield40', 'exert', 'shield', actor(40, {}, undefined, {}, 200));
    add('c-shield-other', 'exert', 'shield', actor(), { action: 'exert shield right', expected: 'refused',
        refusal: '你只能用圣火神功来提升自己的防御力。\n' });
    add('c-shield-repeat', 'exert', 'shield', actor(), { repeat_actions: ['exert shield', 'exert shield'] });
    add('c-shield-fighting', 'exert', 'shield', actor(), { fighting: true });
    add('c-shield-expiry', 'exert', 'shield', actor(40, {},
        { 'apply/armor': 107 }, {}, 200),
    { observation: 'timed_effect', observe_seconds: 42, probability_scope: 'lifecycle_only' });
    add('d-recover', 'exert', 'recover', actor(200, { qi: 9900 }));
    add('d-regenerate', 'exert', 'regenerate', actor(200, { jing: 9900 }));
    return out;
}
function evidenceHash(e) { return hash(JSON.stringify(mingjiaoShengongSourcePaths.map(p => [p, e[p]]))); }
function entryPath(p, method) {
    return method === 'exert' ? `kungfu/skill/${['recover', 'regenerate'].includes(p.ability) ? 'force' : skill}/${p.ability}.c`
        : `kungfu/skill/${skill}.c`;
}
export function mingjiaoShengongConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0); assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(mingjiaoShengongSourcePaths.map(path => {
        const bytes = readSource(path); assert.ok((Buffer.isBuffer(bytes) || typeof bytes === 'string') && bytes.length > 0, path);
        return [path, hash(bytes)];
    }));
    assert.equal(evidenceHash(evidence), mingjiaoShengongReviewedSourceHash, '来源变动须重新审查');
    for (const path of mingjiaoShengongAbsentPaths) {
        let absent = false;
        try { readSource(path); } catch (e) { if (e.code === 'ENOENT') absent = true; else throw e; }
        assert.ok(absent, '原缺席入口不可静默变为新功能：' + path);
    }
    for (const id of [skill, xinfa, skill + '/powerup', skill + '/shield', 'force/recover', 'force/regenerate']) {
        const s = catalog.skills.find(s => s.id === id);
        assert.equal(s?.path, `kungfu/skill/${id}.c`); assert.equal(s.sha256, evidence[s.path]);
    }
    return plans().map(c => {
        const path = entryPath(c.parameters, c.method), s = catalog.skills.find(s => s.path === path);
        const entry_id = c.method === 'exert' ? s.entries.find(e => e.role === 'exert')?.id : path;
        assert.ok(entry_id, path);
        return { ...c, entry_id, samples: smoke || !c.parameters.random_effects ? 2 : samples,
            parameters: { ...c.parameters, source_evidence: evidence, absent_sources: mingjiaoShengongAbsentPaths } };
    });
}
function map(v, label) { assert.ok(v && typeof v === 'object' && !Array.isArray(v), label); return v; }
function int(v, label) { assert.ok(Number.isSafeInteger(v), label); return v; }
function idle(v, k) { assert.ok(Object.hasOwn(v, k), '缺少明确空值：' + k); return v[k] === null ? 0 : int(v[k], k); }
function sparse(v, k) { map(v); return Object.hasOwn(v, k) ? int(v[k], k) : 0; }
function metric(v, k) { const n = sparse(v, k); assert.ok(n >= 0, k); return n; }
function parameters(c) {
    const p = map(c.parameters), plan = plans().find(x => x.id === c.id); assert.ok(plan, '未审核条件');
    assert.equal(c.stage, plan.stage); assert.equal(c.method, plan.method);
    const { source_evidence: evidence, absent_sources: absent, ...rest } = p;
    assert.deepEqual(rest, plan.parameters, '有限矩阵不得漂移');
    assert.deepEqual(Object.keys(map(evidence)), mingjiaoShengongSourcePaths);
    for (const h of Object.values(evidence)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(evidenceHash(evidence), mingjiaoShengongReviewedSourceHash); assert.deepEqual(absent, mingjiaoShengongAbsentPaths);
    assert.ok(Number.isSafeInteger(c.samples) && c.samples > 0);
    if (c.method === 'exert') assert.match(c.entry_id, new RegExp(`^${entryPath(p, c.method)}:\\d+:exert$`));
    else assert.equal(c.entry_id, entryPath(p, c.method));
    return p;
}
// Original query_scale(force), integer evaluation order, missing difficult_level=0,
// and strong improve_skill. This enumerates support, not the actual hidden RNG draw.
export function mingjiaoShengongResearchSupport(p) {
    const lvl = p.actor.skills[skill], related = [p.actor.skills.force,
        ...(p.actor.skills[xinfa] ? [p.actor.skills[xinfa]] : [])].sort((a, b) => b - a);
    const scaled = related.reduce((n, l, i) => n + Math.trunc(l * [150, 120][i] / (lvl >= 500 ? 2 : 1)), 0);
    const bound = Math.trunc(Math.trunc(scaled / 15) / 100) + Math.trunc(lvl / 50)
        + Math.trunc((p.actor.properties.int / (lvl >= 500 ? 6 : 12)) ** 2);
    const single = [...new Set(Array.from({ length: bound }, (_, r) => 1 + Math.trunc(r * 100 / (lvl + 100))))];
    let gains = [0];
    for (let i = 0; i < p.completed; i++) gains = [...new Set(gains.flatMap(a => single.map(b => a + b)))];
    return { random_bound: bound, single_gains: single, gains };
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
    const skip = new Set([...resources, 'learned', 'learned_points', 'busy', 'temp', 'powers', 'effective_skills']);
    const keep = s => Object.fromEntries(Object.entries(s).filter(([k]) => !skip.has(k)));
    assert.deepEqual(keep(a), keep(b), '身份/属性/原技能/映射不得漂移');
    assert.deepEqual(a.effective_skills, Object.fromEntries(Object.entries(a.skills).map(([k, l]) =>
        [k, Math.trunc(l / 2) + (a.skills[a.mappings[k]] ?? 0) + sparse(a.temp.apply, k)])));
}
function cleanTemp(s) { const t = structuredClone(s.temp); delete t.notify_fail; return t; }
function normalized(t) { const x = structuredClone(t); for (const k of Object.keys(x.apply)) if (x.apply[k] === 0) delete x.apply[k]; return x; }
function strip(s) { assert.equal(typeof s, 'string'); return s.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''); }
function refusal(e, text) { assert.equal(strip(e.reason), text); }
function owner(p) {
    if (p.ability === 'query_current_neili_limit') return '/clone/user/user';
    if (['type', 'valid_research', 'valid_learn_level'].includes(p.ability)) return '/inherit/skill/skill';
    return '/kungfu/skill/' + skill;
}
export function validateMingjiaoShengongRecord(raw, c) {
    const p = parameters(c), ok = p.expected === 'observed', exert = c.method === 'exert', research = c.method === 'research';
    const practice = c.method === 'practice', buff = exert && ok && ['powerup', 'shield'].includes(p.ability);
    const shared = exert && ok && ['recover', 'regenerate'].includes(p.ability);
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, c.id); assert.equal(raw.method, c.method);
    assert.ok(Number.isSafeInteger(raw.index) && raw.index >= 0 && raw.index < c.samples);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(raw.outcome)) {
        assert.ok(typeof raw.reason === 'string' && raw.reason.trim());
        return null;
    }
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2, k);
    for (const k of ['attacks', 'actions', 'directs', 'passives', 'defenses', 'dodge_checks', 'dropped', 'terminals']) assert.deepEqual(raw[k], [], k);
    for (const k of ['interfaces', 'launches', 'refusals', 'callbacks']) assert.ok(Array.isArray(raw[k]), k);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0); assert.equal(Object.hasOwn(raw, 'preparation'), false);
    const [b, t] = raw.before, a = raw.immediate[0], end = raw.after[0]; assert.notEqual(b.object, t.object);
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted >= 0);
    assert.equal(p.repeat_actions ? raw.command_accepted : Number(raw.command_accepted > 0), p.command_return);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const s = raw.before[side];
        for (const phase of ['before', 'immediate', 'after']) { identity(raw[phase][side]); stable(s, raw[phase][side]); }
        assert.equal(s.id, side ? 'right' : 'left'); assert.equal(idle(s, 'busy'), 0); assert.equal(s.fighting_opponent, Number(p.fighting));
        assert.deepEqual(s.skills, cfg.skills); assert.deepEqual(s.mappings, cfg.mappings); assert.deepEqual(s.preparations, {}); assert.deepEqual(s.learned, {});
        for (const [k, v] of Object.entries(cfg.properties)) assert.equal(k.includes('/') || k === 'character'
            ? v === 0 ? idle(s.cultivation, k) : s.cultivation[k] : s[k], v, k);
        for (const k of cultivation.filter(k => !Object.hasOwn(cfg.properties, k))) assert.equal(idle(s.cultivation, k), 0, k);
        assert.equal(s.effective_int, cfg.properties.int);
        assert.equal(s.effective_str, cfg.properties.str + Math.trunc(Math.max(0,
            ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0)) / 10));
        const apply = { armor: 100 }; for (const [k, v] of Object.entries(cfg.temp ?? {})) apply[k.slice(6)] = v;
        assert.deepEqual(s.temp.apply, apply);
        for (const k of ['powerup', 'shield', 'no_exert']) assert.equal(sparse(s.temp, k), 0);
        for (const v of Object.values(map(raw.metrics[side]))) assert.ok(int(v) >= 0, '未知计数不可补0');
        for (const k of ['hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats']) assert.equal(metric(raw.metrics[side], k), 0);
    }
    assert.deepEqual(raw.immediate[1], t); assert.deepEqual(raw.after[1], t); assert.ok(Object.values(raw.metrics[1]).every(v => v === 0));
    const completed = research || practice ? p.completed : null, fee = research ? Math.trunc(1000 / b.int) * completed : 0;
    const writeoff = research ? p.jing_writeoff ?? 0 : 0;
    const costs = { jing: fee + writeoff, neili: buff ? p.ability === 'powerup' ? 150 : 100
        : shared ? p.ability === 'recover' ? 33 : 20 : 0 };
    const heals = shared ? { [p.ability === 'recover' ? 'qi' : 'jing']: 100 } : {};
    for (const side of [0, 1]) for (const k of resources) {
        const cost = side ? 0 : costs[k] ?? 0, heal = side ? 0 : heals[k] ?? 0;
        assert.equal(metric(raw.metrics[side], k + '_cost'), cost, k + '原毛扣账');
        assert.equal(metric(raw.metrics[side], k + '_recovery'), heal);
        for (const phase of ['immediate', 'after']) assert.equal(raw[phase][side][k], raw.before[side][k] - cost + heal);
    }
    assert.equal(metric(raw.metrics[0], 'ability_launched'), Number(exert && ok));
    assert.equal(a.learned_points - b.learned_points, research ? completed : 0); assert.equal(end.learned_points, a.learned_points);
    const learnedSkill = shared ? 'force' : skill, gain = sparse(a.learned, learnedSkill);
    for (const [k, v] of Object.entries(a.learned)) if (k !== learnedSkill) assert.equal(v, 0);
    if (research) assert.ok(mingjiaoShengongResearchSupport(p).gains.includes(gain), '原随机研究支持');
    else assert.equal(gain, exert && ok ? 1 : 0, '有效force或基本force均>=120，原弱熟练必增1');
    assert.deepEqual(end.learned, a.learned);
    if (exert) {
        assert.deepEqual(raw.interfaces, []);
        assert.deepEqual(raw.launches, ok ? [{ actor: b.object, skill: shared ? 'force' : skill, argument: p.action.slice(6) }] : []);
        assert.equal(raw.refusals.length, !ok || p.repeat_actions ? 1 : 0);
        if (raw.refusals.length) {
            assert.equal(raw.refusals[0].actor, b.object);
            refusal(raw.refusals[0], p.repeat_actions ? '你已经在运功中了。\n' : p.refusal);
            assert.equal(strip(raw.refusals[0].reason), a.temp.notify_fail);
        }
        if (!ok) { refusal(raw, p.refusal); assert.equal(raw.reason, raw.refusals[0].reason); } else assert.equal(raw.reason, '');
    } else {
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.refusals, []);
        if (c.method === 'interface') {
            assert.equal(raw.interfaces.length, 1); const e = raw.interfaces[0];
            for (const [k, v] of Object.entries(p.interface)) assert.equal(e[k], v);
            assert.ok(Object.hasOwn(e, 'result')); assert.deepEqual(e.result, p.interface_result);
            assert.equal(e.implemented_by, owner(p), '继承/本体/USER实现来源必须实录');
        } else assert.deepEqual(raw.interfaces, []);
        if (!ok) { refusal(raw, p.refusal); assert.equal(strip(raw.reason), strip(a.temp.notify_fail)); } else assert.equal(raw.reason, '');
    }
    const busy = idle(a, 'busy');
    if (p.fighting && buff && p.ability === 'powerup') assert.ok([1, 2, 3].includes(busy));
    else assert.equal(busy, p.fighting && buff && p.ability === 'shield' ? 2 : 0);
    assert.equal(idle(end, 'busy'), busy);
    const expectedTemp = cleanTemp(b), actualTemp = cleanTemp(a);
    if (practice || research) {
        const started = practice || completed > 0 || p.research_started;
        if (started) {
            const time = map(actualTemp.time); assert.ok(Number.isSafeInteger(time[c.method]) && time[c.method] > 0);
            assert.equal(sparse(expectedTemp.time ?? {}, c.method), 0); delete time[c.method]; if (!Object.keys(time).length) delete actualTemp.time;
        }
        for (const k of ['no_fight', 'practice_improve', 'research_improve']) assert.equal(idle(map(raw.movement_room), k), 0);
    }
    if (buff) {
        const keys = p.ability === 'powerup' ? ['attack', 'dodge', 'parry'] : ['armor'];
        const amount = Math.trunc(b.skills[skill] / (p.ability === 'powerup' ? 3 : 2));
        for (const k of keys) expectedTemp.apply[k] = sparse(expectedTemp.apply, k) + amount;
        expectedTemp[p.ability === 'powerup' ? 'powerup' : 'shield'] = 1;
    }
    assert.deepEqual(normalized(actualTemp), normalized(expectedTemp), '只允许原命令的临时变化');
    if (exert) for (const s of [b, a, end]) {
        assert.deepEqual(Object.keys(map(s.powers)).sort(), ['attack', 'dodge', 'parry']);
        for (const k of ['attack', 'dodge', 'parry']) assert.equal(s.powers[k], gumuBuffPower(s, k));
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
        assert.ok(x.elapsed >= b.skills[skill] - 1 && y.elapsed >= x.elapsed && y.elapsed <= raw.elapsed);
        assert.ok(raw.elapsed >= p.observe_seconds - 1); assert.deepEqual(x.state, a); assert.deepEqual(y.state, end);
        assert.deepEqual(normalized(cleanTemp(end)), normalized(cleanTemp(b)), '原自然到期只收还本次加成');
    }
    return { method: c.method, interface_result: c.method === 'interface' ? p.interface_result : null,
        implemented_by: c.method === 'interface' ? raw.interfaces[0].implemented_by : null,
        command_attempts: c.method === 'interface' ? 0 : p.repeat_actions?.length ?? 1,
        commands_accepted: c.method === 'interface' ? 0 : Number(raw.command_accepted > 0), launches: raw.launches.length,
        completed, learned_skill: learnedSkill, learned_gain: gain, research_fee: research ? fee : null,
        jing_writeoff: research ? metric(raw.metrics[0], 'jing_cost') - fee : null, busy,
        costs: Object.fromEntries(resources.map(k => [k, metric(raw.metrics[0], k + '_cost')])),
        recovery: Object.fromEntries(resources.map(k => [k, metric(raw.metrics[0], k + '_recovery')])),
        net: Object.fromEntries(resources.map(k => [k, a[k] - b[k]])),
        apply_delta: Object.fromEntries(['attack', 'dodge', 'parry', 'armor'].map(k => [k, sparse(a.temp.apply, k) - sparse(b.temp.apply, k)])),
        powers_delta: exert ? Object.fromEntries(['attack', 'dodge', 'parry'].map(k => [k, a.powers[k] - b.powers[k]])) : null,
        callback_pairs: raw.callbacks.length / 2, expiry_seconds: raw.callbacks[0]?.elapsed ?? null };
}
export function mingjiaoShengongEffects(rows, c) {
    const p = parameters(c), counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, c.id); assert.equal(row.raw?.condition_id, c.id);
        assert.equal(row.raw.method, c.method); assert.equal(row.raw.outcome, row.outcome);
        const observation = validateMingjiaoShengongRecord(row.raw, c);
        assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        if (!['error', 'not_applicable'].includes(row.outcome)) known.push(observation);
    }
    const unknown = counts.error + counts.not_applicable, sum = k => known.reduce((n, o) => n + o[k], 0);
    const values = getter => distribution([...known.map(getter), ...Array(unknown).fill(null)]);
    const progressed = known.filter(o => o.learned_gain > 0).length;
    return { samples: rows.length, counts, validated_samples: known.length, unknown_samples: unknown,
        interface_samples: known.filter(o => o.method === 'interface').length,
        interface_result: c.method === 'interface' && p.ability === 'type' ? null : values(o => o.interface_result),
        interface_values: Object.fromEntries(known.filter(o => o.method === 'interface').map(o => [String(o.interface_result), known.filter(v => v.interface_result === o.interface_result).length])),
        implemented_by: [...new Set(known.map(o => o.implemented_by).filter(v => v !== null))],
        command_attempts: sum('command_attempts'), commands_accepted: sum('commands_accepted'), launches: sum('launches'),
        progressed_samples: progressed, progression: p.probability_scope === 'lifecycle_only' ? null : probability(progressed, known.length),
        probability_scope: p.probability_scope ?? (p.random_effects ? 'random_effects' : 'deterministic'),
        learned_gain: values(o => o.learned_gain), completed: values(o => o.completed),
        research_fee: values(o => o.research_fee), jing_writeoff: values(o => o.jing_writeoff),
        costs: Object.fromEntries(resources.map(k => [k, values(o => o.costs[k])])),
        recovery: Object.fromEntries(resources.map(k => [k, values(o => o.recovery[k])])),
        net: Object.fromEntries(resources.map(k => [k, values(o => o.net[k])])),
        apply_delta: Object.fromEntries(['attack', 'dodge', 'parry', 'armor'].map(k => [k, values(o => o.apply_delta[k])])),
        busy_histogram: Object.fromEntries([0, 1, 2, 3].map(v => [v, known.filter(o => o.busy === v).length])),
        powers_delta: Object.fromEntries(['attack', 'dodge', 'parry'].map(k => [k, values(o => o.powers_delta?.[k])])),
        callback_pairs: sum('callback_pairs'), expiry_seconds: values(o => o.expiry_seconds),
        unknown_scopes: ['实验配功不是自然拜师/完整NPC教学', '不采圣火令联动hit_ob或完整公共内功',
            ...(p.probability_scope === 'lifecycle_only' ? ['两条到期记录只核原生命周期，不估计随机概率'] : [])] };
}
