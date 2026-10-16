// Pure source-backed examples and mutations only; these are not real driver samples.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mingjiaoLingLearningConditions, mingjiaoLingLearningSourcePaths,
    mingjiaoLingLearningReviewedSourceHash, mingjiaoLingLearningAbsentPaths,
    validateMingjiaoLingLearningRecord, mingjiaoLingLearningEffects } from './school_mingjiao_ling_learning_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = p => readFileSync(join(root, p));
const sha = x => createHash('sha256').update(x).digest('hex');
const skill = 'shenghuo-ling', god = 'shenghuo-shengong';
const catalog = { skills: [{ id: skill, path: 'kungfu/skill/' + skill + '.c', sha256: sha(read('kungfu/skill/' + skill + '.c')) }] };
const conditions = mingjiaoLingLearningConditions(catalog, read);
const pick = v => { const c = conditions.find(x => x.parameters.variant === v); assert.ok(c, v); return c; };
const cultivation = ['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
    'special_skill/guimai', 'special_skill/wuxing', 'class', 'family/family_name', 'wudang-jiuyang',
    'immune/poison', 'character', 'env/no_learn', 'env/auto_regenerate', 'doing', 'tattoo/tattoo_str',
    'reborn/str', 'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex'];
function snapshot(cfg, side, p) {
    const s = { ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: { ...Object.fromEntries(cultivation.map(k => [k, null])),
            ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')) },
        object: '/tests/actor#' + (500 + side), id: side ? 'right' : 'left', age: 25,
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        busy: cfg.busy ?? null, conditions: null, fighting_opponent: Number(p.fighting),
        skills: structuredClone(cfg.skills), learned: {}, mappings: structuredClone(cfg.mappings), preparations: {},
        effective_str: cfg.properties.str + Math.trunc(cfg.skills.unarmed / 10),
        effective_int: cfg.properties.int + Math.trunc((cfg.skills.literate ?? 0) / 10),
        effective_dex: cfg.properties.dex + Math.trunc(cfg.skills.dodge / 10),
        effective_con: cfg.properties.con + Math.trunc(cfg.skills.force / 10),
        temp: { user_setup: 1, apply: { armor: 100 } },
        weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {},
        handing: 'none', handing_details: {}, secondary_weapon: 'none', secondary_weapon_details: {}, ammunition: 0 };
    if (cfg.equipment) {
        const e = cfg.equipment;
        s.weapon = e.type; s.weapon_damage = 25; s.weapon_flag = 4;
        s.weapon_details = { object: e.program + '#888', program: e.program, skill_type: e.type,
            flag: 4, weight: e.type === 'sword' ? 6000 : 7000, material: 'steel', rigidity: null,
            consistence: 100, damage: 25, no_wield: null };
        s.temp.weapon = s.weapon_details.object;
        s.temp.apply.damage = 25; s.temp.apply.dodge = -2;
    }
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, n]) =>
        [k, Math.trunc(n / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (s.temp.apply[k] ?? 0)]));
    return s;
}
export function syntheticLingLearningTrace(c, { index = 0, loaded = 1, prefix = '' } = {}) {
    const p = c.parameters, before = [snapshot(p.actor, 0, p), snapshot(p.target, 1, p)];
    const raw = { kind: 'sample', condition_id: c.id, index, method: c.method, outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}], elapsed: 0.01,
        command_accepted: p.command_return, reason: '', actions: [], directs: [], attacks: [],
        passives: [], defenses: [], dodge_checks: [], interfaces: [], launches: [], refusals: [],
        callbacks: [], dropped: [], terminals: [], movement_room: { no_fight: null, practice_improve: null, research_improve: null } };
    const a = raw.immediate[0];
    if (c.method === 'interface') {
        raw.interfaces = [{ ...p.interface, result: p.interface_result,
            implemented_by: ['type', 'valid_learn_level'].includes(p.ability) ? '/inherit/skill/skill' : '/kungfu/skill/' + skill }];
        raw.interface_context = { entry_actor: before[0].object, return_actor: before[0].object, loaded_before: loaded };
        if (p.refusal) a.temp.notify_fail = p.refusal;
    } else {
        if (p.practice_started) a.temp.time = { practice: 1791990000 };
        a.temp.notify_fail = p.refusal || '你试着练习圣火令法，但是并没有任何进步。\n';
        a.qi -= p.completed * 50; a.neili -= p.completed * 70;
        // Independent literal reference results for these four raw levels; no helper-under-test.
        if (p.completed) a.learned[skill] = p.completed * ({ 180: 12, 200: 11, 400: 7, 800: 3 }[p.level]);
        raw.metrics[0] = { qi_cost: p.completed * 50, neili_cost: p.completed * 70 };
    }
    if (p.expected === 'refused') raw.reason = prefix + p.refusal;
    raw.after = structuredClone(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
const alter = (raw, side, f) => { f(raw.immediate[side]); raw.after = structuredClone(raw.immediate); };
function reject(v, f, options) { const c = pick(v), raw = syntheticLingLearningTrace(c, options);
    f(raw); assert.throws(() => validateMingjiaoLingLearningRecord(raw, c)); }

test('40有限条件各2：24接口/19学习/16练习；烟雾同80不冒随机样本', () => {
    assert.equal(conditions.length, 40); assert.equal(new Set(conditions.map(c => c.id)).size, 40);
    assert.equal(conditions.filter(c => c.method === 'interface').length, 24);
    assert.equal(conditions.filter(c => c.parameters.ability === 'valid_learn').length, 19);
    assert.equal(conditions.filter(c => c.method === 'practice').length, 16);
    assert.equal(conditions.filter(c => c.parameters.expected === 'observed').length, 21);
    assert.equal(conditions.filter(c => c.parameters.expected === 'refused').length, 19);
    assert.equal(conditions.reduce((n, c) => n + c.samples, 0), 80);
    assert.deepEqual(mingjiaoLingLearningConditions(catalog, read, { smoke: true, samples: 3 }), conditions);
    for (const c of conditions) {
        assert.equal(c.samples, 2); assert.equal(c.parameters.collection_group, 'mingjiao-ling-learning');
        assert.equal(Object.hasOwn(c.parameters, 'capture_skill_loads'), false);
        if (c.method === 'interface') { assert.deepEqual(c.parameters.actor.mappings, {}); assert.equal(c.parameters.actor.equipment, undefined); }
    }
});
test('45真实来源固定摘要、空缺席、文件/catalognames/hash漂移均拒', () => {
    assert.equal(mingjiaoLingLearningSourcePaths.length, 45); assert.deepEqual(mingjiaoLingLearningAbsentPaths, []);
    const pairs = mingjiaoLingLearningSourcePaths.map(p => [p, sha(read(p))]);
    assert.equal(sha(JSON.stringify(pairs)), mingjiaoLingLearningReviewedSourceHash);
    for (const p of ['cmds/skill/practice.c', 'cmds/skill/learn.c', 'feature/attribute.c', 'feature/skill.c',
        'clone/weapon/gangjian.c', 'clone/weapon/gangdao.c', 'include/weapon.h']) assert.ok(mingjiaoLingLearningSourcePaths.includes(p));
    assert.throws(() => mingjiaoLingLearningConditions(catalog, p => p === 'cmds/skill/practice.c' ? Buffer.from('drift') : read(p)));
    assert.throws(() => mingjiaoLingLearningConditions({ skills: [{ ...catalog.skills[0], sha256: '0'.repeat(64) }] }, read));
    assert.throws(() => mingjiaoLingLearningConditions({ skills: [{ ...catalog.skills[0], path: 'other.c' }] }, read));
    const c = structuredClone(conditions[0]); c.parameters.source_evidence['feature/skill.c'] = '0'.repeat(64);
    assert.throws(() => validateMingjiaoLingLearningRecord(syntheticLingLearningTrace(c), c));
});
test('全部40纯示例过原契约，明确不是实采', () => {
    for (const c of conditions) for (const index of [0, 1])
        validateMingjiaoLingLearningRecord(syntheticLingLearningTrace(c, { index }), c);
});
test('先天32与有效40分开，膂力/身法有效35，原神功相对门槛只在令>200', () => {
    for (const [v, int] of [['learn-int31-literate90', 40], ['learn-int32-literate80', 40]]) {
        const c = pick(v), raw = syntheticLingLearningTrace(c); assert.equal(raw.before[0].effective_int, int);
        validateMingjiaoLingLearningRecord(raw, c);
    }
    for (const v of ['learn-str34', 'learn-str35', 'learn-dex34', 'learn-dex35']) validateMingjiaoLingLearningRecord(syntheticLingLearningTrace(pick(v)), pick(v));
    const c = pick('learn-ling200-god0'); assert.equal(c.parameters.actor.skills[god], 0);
    assert.equal(validateMingjiaoLingLearningRecord(syntheticLingLearningTrace(c), c).interface_result, 1);
    reject('learn-str35', r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].effective_str = 34; });
    reject('learn-dex35', r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].effective_dex = 34; });
    reject('learn-int32-literate80', r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].effective_int = 32; });
    reject('learn-relative-god201', r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].skills[god] = 200; });
});
test('实际接口上下文与继承owner，0激发返回正常观察，不允许缺接口/伪巫师', () => {
    const c = pick('enable-force'), raw = syntheticLingLearningTrace(c, { loaded: 0 });
    assert.equal(raw.outcome, 'observed'); assert.equal(validateMingjiaoLingLearningRecord(raw, c).interface_result, 0);
    raw.interfaces[0].result = null; validateMingjiaoLingLearningRecord(raw, c);
    for (const v of ['type', 'learn-level']) {
        assert.equal(validateMingjiaoLingLearningRecord(syntheticLingLearningTrace(pick(v)), pick(v)).implemented_by, '/inherit/skill/skill');
        reject(v, r => { r.interfaces[0].implemented_by = '/kungfu/skill/' + skill; });
    }
    for (const f of [r => { delete r.interfaces[0].result; }, r => { delete r.interfaces[0].implemented_by; },
        r => { r.interfaces[0].result = 1; }, r => { r.interfaces[0].implemented_by = 0; },
        r => { delete r.interface_context; }, r => { delete r.interface_context.loaded_before; },
        r => { r.interface_context.loaded_before = 2; }, r => { r.interface_context.return_actor = r.before[1].object; },
        r => { r.interface_context.entry_actor = r.before[1].object; },
        r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].wizardp = 1; }]) reject('enable-force', f);
});
test('原命令门槛及原拒绝文本固定；CSI仅展示比较不吞异文', () => {
    for (const v of ['learn-int31-literate90', 'practice-busy', 'practice-unmapped', 'practice-fighting']) {
        const c = pick(v), raw = syntheticLingLearningTrace(c, { prefix: '\x1b[256D\x1b[K' });
        validateMingjiaoLingLearningRecord(raw, c);
        reject(v, r => { r.reason += '伪'; }); reject(v, r => alter(r, 0, a => { a.temp.notify_fail = '错误提示\n'; }));
    }
    reject('practice-busy', r => { r.reason = '\x1b[999D' + r.reason; });
    reject('practice-busy', r => alter(r, 0, a => { a.busy = 0; }));
    reject('practice-fighting', r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].fighting_opponent = 0; });
    reject('practice-basic-equal', r => { r.outcome = 'observed'; });
    reject('practice-unmapped', r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].mappings.parry = skill; });
});
test('四档原进度12/11/7/3、正常非弱模式：不套基本轻功或有效悟性公式', () => {
    for (const [level, gain] of [[180, 12], [200, 11], [400, 7], [800, 3]]) {
        const c = pick('practice-' + level), v = validateMingjiaoLingLearningRecord(syntheticLingLearningTrace(c), c);
        assert.equal(v.learned_gain, gain); assert.equal(v.qi_cost, 50); assert.equal(v.neili_cost, 70);
        assert.ok(c.parameters.actor.skills.sword > level); assert.ok(c.parameters.actor.properties.combat_exp >= Math.trunc(level ** 3 / 10));
        reject('practice-' + level, r => alter(r, 0, a => { a.learned[skill] = gain + 1; }));
    }
    reject('practice-200', r => alter(r, 0, a => { a.skills[skill]++; }));
    reject('practice-200', r => alter(r, 0, a => { a.learned.force = 1; }));
});
test('每次最低气血/内力80，原费用50/70；边界资源不交叉替代', () => {
    const c = pick('practice-minimum'), raw = syntheticLingLearningTrace(c);
    assert.equal(raw.immediate[0].qi, 30); assert.equal(raw.immediate[0].neili, 10);
    validateMingjiaoLingLearningRecord(raw, c);
    for (const v of ['practice-qi79', 'practice-neili79', 'practice-level179']) {
        const r = syntheticLingLearningTrace(pick(v)); assert.equal(r.metrics[0].qi_cost, 0);
        validateMingjiaoLingLearningRecord(r, pick(v));
        reject(v, r => { r.metrics[0].qi_cost = 50; alter(r, 0, a => { a.qi -= 50; }); });
    }
    reject('practice-minimum', r => { delete r.metrics; });
    reject('practice-minimum', r => { delete r.metrics[0].neili_cost; });
    reject('practice-minimum', r => { r.metrics[0].qi_recovery = 50; });
    reject('practice-minimum', r => { r.metrics[0].qi_cost = null; });
    reject('practice-minimum', r => alter(r, 0, a => { a.eff_qi -= 50; }));
});
test('部分3次仅2次：真实命令0仍observed/熟练22/费100与140/体力拒绝', () => {
    const c = pick('practice-partial3'), raw = syntheticLingLearningTrace(c);
    const v = validateMingjiaoLingLearningRecord(raw, c);
    assert.equal(v.command_accepted, 0); assert.equal(v.completed, 2); assert.equal(v.learned_gain, 22);
    assert.equal(raw.reason, ''); assert.equal(raw.immediate[0].qi, 30); assert.equal(raw.immediate[0].neili, 10);
    assert.equal(v.notice, '你的体力不够练圣火令法。\n');
    for (const f of [r => { r.command_accepted = 1; }, r => { r.outcome = 'refused'; },
        r => { r.reason = c.parameters.refusal; }, r => alter(r, 0, a => { a.learned[skill] = 33; }),
        r => { r.metrics[0].neili_cost = 210; alter(r, 0, a => { a.neili -= 70; }); },
        r => alter(r, 0, a => { a.temp.notify_fail = '你的内力不够练圣火令法。\n'; })]) reject('practice-partial3', f);
    const complete = validateMingjiaoLingLearningRecord(syntheticLingLearningTrace(pick('practice-complete3')), pick('practice-complete3'));
    assert.equal(complete.command_accepted, 1); assert.equal(complete.completed, 3); assert.equal(complete.learned_gain, 33);
});
test('真实钢剑/钢刀属性、装备空缺与有效技能原负载，禁止假装备或属性漂移', () => {
    for (const v of ['practice-200', 'practice-blade', 'practice-no-weapon']) validateMingjiaoLingLearningRecord(syntheticLingLearningTrace(pick(v)), pick(v));
    for (const f of [r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].weapon_details.program = '/tests/sword'; },
        r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].weapon_details.weight = 1; },
        r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].effective_dex -= 2; },
        r => { for (const phase of ['before', 'immediate', 'after']) delete r[phase][0].secondary_weapon; },
        r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].temp.apply.str = 99; },
        r => alter(r, 0, a => { a.weapon_details.consistence = 99; })]) reject('practice-200', f);
});
test('三时点/实际空观察数组/零自主HB/准确练习开始时间：缺字段均非零', () => {
    for (const k of ['actions', 'directs', 'attacks', 'passives', 'defenses', 'dodge_checks', 'launches', 'refusals', 'callbacks', 'dropped', 'terminals'])
        reject('practice-200', r => { delete r[k]; });
    for (const f of [r => { r.after[0].qi++; }, r => { r.metrics[0].heartbeats = 1; },
        r => { r.metrics[1].jing_cost = 1; }, r => { r.movement_room.practice_improve = 1; },
        r => { delete r.movement_room.no_fight; }, r => { r.skill_loads = []; },
        r => alter(r, 0, a => { delete a.temp.time; }), r => alter(r, 0, a => { a.temp.time.practice = 0; }),
        r => alter(r, 0, a => { a.temp.some_buff = 1; }),
        r => { for (const phase of ['before', 'immediate', 'after']) delete r[phase][0].cultivation['reborn/int']; }]) reject('practice-200', f);
    reject('practice-busy', r => alter(r, 0, a => { a.temp.time = { practice: 1 }; }));
});
test('统计实际返回0与拒绝分列，部分完成不补受理，错误/不适用独立未知', () => {
    const enable = pick('enable-force'), e = mingjiaoLingLearningEffects([row(syntheticLingLearningTrace(enable))], enable);
    assert.equal(e.counts.observed, 1); assert.equal(e.interface.result.mean, 0); assert.equal(e.practice.completed.mean, null);
    const refused = pick('learn-int31-literate90'), f = mingjiaoLingLearningEffects([row(syntheticLingLearningTrace(refused))], refused);
    assert.equal(f.counts.refused, 1); assert.equal(f.interface.result.mean, 0); assert.equal(f.interface.implemented_by['/kungfu/skill/' + skill], 1);
    const partial = pick('practice-partial3'), r = row(syntheticLingLearningTrace(partial));
    const unknown = outcome => ({ condition_id: partial.id, outcome, raw: { kind: 'sample', index: 1,
        condition_id: partial.id, method: partial.method, outcome, elapsed: 0.01, reason: '诊断结果未完成' } });
    const p = mingjiaoLingLearningEffects([r, unknown('error'), unknown('not_applicable')], partial);
    assert.deepEqual(p.counts, { observed: 1, refused: 0, error: 1, not_applicable: 1 });
    assert.equal(p.validated, 1); assert.equal(p.unknown, 2); assert.equal(p.practice.command_accepted.mean, 0);
    assert.equal(p.practice.completed.mean, 2); assert.equal(p.practice.learned_gain.mean, 22); assert.equal(p.practice.qi_cost.mean, 100);
    assert.equal(p.practice.qi_cost.unknown, 2); assert.equal(p.interface.result.n, 0); assert.equal(p.interface.result.mean, null);
    const empty = mingjiaoLingLearningEffects([], partial); assert.equal(empty.practice.learned_gain.mean, null);
    const type = pick('type'); assert.deepEqual(mingjiaoLingLearningEffects([row(syntheticLingLearningTrace(type))], type).interface.texts, { martial: 1 });
    assert.throws(() => mingjiaoLingLearningEffects([{ ...r, outcome: 'refused' }], partial));
});

test('运行错误可导入错误台账；未知结果不伪造效果，身份/编号/理由仍严核', async () => {
    const c = pick('practice-partial3'), raw = { kind: 'sample', condition_id: c.id, index: 0,
        method: c.method, outcome: 'error', elapsed: 0.01, reason: '原调用执行错误' };
    const { validateRecord } = await import('./execution.mjs');
    const { validateSchoolCombatRecord } = await import('./school_combat_cases.mjs');
    validateRecord(raw, c);
    assert.equal(validateSchoolCombatRecord(raw, c), null);
    const effects = mingjiaoLingLearningEffects([row(raw)], c);
    assert.equal(effects.counts.error, 1); assert.equal(effects.validated, 0); assert.equal(effects.unknown, 1);
    assert.equal(effects.practice.qi_cost.mean, null); assert.equal(effects.practice.qi_cost.unknown, 1);
    for (const change of [{ reason: '' }, { reason: ' \n' }, { reason: null },
        { kind: 'other' }, { condition_id: 'other' }, { method: 'other' }, { index: null },
        { index: -1 }, { index: 2 }, { index: 0.5 }, { elapsed: null }, { elapsed: -1 },
        { outcome: 'observed' }]) {
        const bad = { ...raw, ...change };
        assert.throws(() => validateMingjiaoLingLearningRecord(bad, c));
        assert.throws(() => mingjiaoLingLearningEffects([row(bad)], c));
    }
    const missing = { ...raw }; delete missing.index;
    assert.throws(() => validateMingjiaoLingLearningRecord(missing, c));
});
