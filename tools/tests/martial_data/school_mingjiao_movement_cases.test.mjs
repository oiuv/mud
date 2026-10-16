import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mingjiaoMovementConditions, mingjiaoMovementSourcePaths, mingjiaoMovementReviewedSourceHash,
    validateMingjiaoMovementRecord, mingjiaoMovementEffects } from './school_mingjiao_movement_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = p => readFileSync(join(root, p));
const sha = x => createHash('sha256').update(typeof x === 'string' || Buffer.isBuffer(x) ? x : JSON.stringify(x)).digest('hex');
const skills = ['shenghuo-bu', 'qingfu-shenfa', 'lingxu-bu'], qingfu = skills[1];
const catalog = { skills: skills.map(id => ({ id, path: 'kungfu/skill/' + id + '.c', sha256: sha(read('kungfu/skill/' + id + '.c')) })) };
const cases = mingjiaoMovementConditions(catalog, read), smoke = mingjiaoMovementConditions(catalog, read, { smoke: true });
const pick = variant => { const c = cases.find(c => c.parameters.variant === variant); assert.ok(c, variant); return c; };
const HIG = '\x1b[1;32m', HIY = '\x1b[1;33m', NOR = '\x1b[0m';
const cancelMsg = HIG + '只见$n' + HIG + '长啸一声犹如一只蝙蝠一样纵身而起，于半空倒立，$N' + HIG + '这招却扑了个空。\n' + NOR;
const bhMsg = HIY + '但见$n' + HIY + '身法轻盈无比，忽然跃高忽而落下，$N' + HIY + '不假思索，飞身出招，更是巧妙无方。\n' + NOR;
const msgs = { 'shenghuo-bu': '$n身形急转，避过了$N的攻势。\n', 'qingfu-shenfa': '只见$n一招「福满乾坤」，身形陡然纵起，躲过了$N这一招。\n',
    'lingxu-bu': '$n一式「雪地莲花」，身子掣忽一转，$N只觉的眼前一花，失去了目标。\n' };
const dpEffect = l => l < 50 ? 0 : l < 100 ? 10 : l < 150 ? 20 : l < 200 ? 30 : l < 250 ? 40 : l < 300 ? 50 : l < 350 ? 60 : 80;
// Fixed source formulas, independent of the production helpers. Pure examples are not samples.
function power(s, kind) {
    const l = s.effective_skills[kind === 'attack' ? 'unarmed' : kind], p = l > 500 ? Math.trunc(l / 10) * l * l : Math.trunc(l ** 3 / 10);
    return Math.trunc((p + 6950000) / 30) * (kind === 'attack' ? s.str : s.dex);
}
function snapshot(cfg, side, p) {
    const props = Object.entries(cfg.properties);
    const s = { ...Object.fromEntries(props.filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: { ...Object.fromEntries(['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
            'special_skill/guimai', 'special_skill/wuxing', 'class', 'wudang-jiuyang', 'immune/poison', 'env/no_learn'].map(k => [k, null])),
            ...Object.fromEntries(props.filter(([k]) => k.includes('/') || k === 'character')) },
        object: '/tests/actor#' + (500 + side), id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: cfg.busy ?? null, conditions: null,
        fighting_opponent: Number(p.fighting), skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: {}, learned: {}, effective_int: 36, effective_str: 36 + Math.trunc(cfg.skills.unarmed / 10),
        weapon: 'none', handing: 'none', secondary_weapon: 'none', weapon_details: {}, handing_details: {}, secondary_weapon_details: {},
        weapon_damage: 0, weapon_flag: 0, ammunition: 0, craze: 0, max_craze: 5000, temp: { user_setup: 1, apply: { armor: 100 } } };
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, n]) => [k, Math.trunc(n / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)]));
    if (side && p.target_state === 'unconscious') { s.living = 0; s.qi = 0; s.jing = 0; s.temp.block_msg = { all: 1 }; }
    return s;
}
export function syntheticMovementTrace(c, { cancel = false, bh = false, result = -1, wound = 0 } = {}) {
    const p = c.parameters, before = [snapshot(p.actor, 0, p), snapshot(p.target, 1, p)];
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, outcome: p.expected, before,
        immediate: structuredClone(before), after: [], metrics: [{}, {}], elapsed: 0.01, reason: '',
        actions: [], directs: [], attacks: [], passives: [], defenses: [], defense_messages: [], dodge_checks: [],
        interfaces: [], launches: [], refusals: [], callbacks: [], dropped: [], terminals: [],
        movement_room: { no_fight: null, practice_improve: null, research_improve: null }, bhinfo: { before: null, after: null, cleared: null } };
    const [a, t] = raw.immediate;
    if (p.target_state === 'unconscious') {
        const awake = snapshot(p.target, 1, { ...p, target_state: undefined });
        raw.preparation = { before: awake, after: structuredClone(before[1]) };
        raw.terminals = [{ side: 1, state: 'unconscious' }];
    }
    if (c.method === 'practice') {
        raw.command_accepted = p.command_return;
        if (!p.early_practice) a.temp.time = { practice: 1791900000 };
        if (p.refusal) a.temp.notify_fail = p.refusal;
        if (p.expected === 'refused') raw.reason = p.refusal;
        const fee = p.skill === qingfu ? [50, 55] : [40, 0], n = p.completed;
        a.qi -= fee[0] * n; a.neili -= fee[1] * n;
        if (n) { const l = p.actor.skills[p.skill], improve = l >= 500 ? Math.trunc((l + 1) / 36)
            : l >= 300 ? Math.trunc((l + 1) / 12) : Math.trunc(((l + 1) * 6 + 30) / 36);
            a.learned[p.skill] = n * (1 + Math.trunc(improve * 100 / (l + 100))); }
        raw.metrics[0] = { qi_cost: fee[0] * n, neili_cost: fee[1] * n };
    } else if (c.method === 'ordinary') {
        a.temp.fight = { attack: null, dodge: null, parry: null };
        raw.actions = [{ actor: 0, target: 1, skill: null, action: { action: '$N挥拳攻击$n的$l', damage_type: '瘀伤' } }];
        const original = power(before[1], 'dodge'), amount = p.target.mappings.dodge === qingfu ? dpEffect(p.target.skills[qingfu]) : 0;
        const adjusted = original + Math.trunc(original / 100) * amount, settled = p.target.busy ? Math.trunc(adjusted / 3) : adjusted;
        raw.dodge_checks = [['base', original], ['settled', settled]].map(([phase, dp]) => ({ actor: 0, target: 1, type: 0,
            ap: power(before[0], 'attack'), dp, phase, busy: p.target.busy ?? null, skill: p.target.mappings.dodge ?? 0 }));
        const damage = result === 0 && !cancel ? 49 : 0;
        raw.attacks = [{ actor: 0, target: 1, type: 0, result, damage }];
        raw.metrics[0][result === -1 ? 'dodge' : result === -2 ? 'parry' : 'hit'] = 1;
        if (result === 0 && p.target.mappings.dodge) raw.defenses = [{ actor: 0, target: 1, skill: p.skill,
            incoming: 32, route: 'ordinary-dodge', result: cancel ? { damage: -32, msg: cancelMsg } : null }];
        t.qi -= damage; t.eff_qi -= wound; raw.metrics[1] = { qi_cost: damage, eff_qi_cost: wound };
        if (damage > 0 && p.target.busy) t.busy = null;
    } else {
        let value = null;
        if (p.ability === 'valid_enable') value = ['dodge', 'move'].includes(p.interface.argument) ? 1 : null;
        if (p.ability === 'valid_learn') { value = p.expected === 'observed' ? 1 : null;
            if (!value) { a.temp.notify_fail = p.refusal; raw.reason = p.refusal; } }
        if (p.ability === 'query_effect_dodge' && p.skill === qingfu) value = dpEffect(p.target.skills[qingfu]) || null;
        if (p.ability === 'query_dodge_msg') value = msgs[p.skill];
        if (p.ability === 'valid_damage') {
            value = cancel ? { damage: -1000, msg: cancelMsg } : null;
            raw.defenses = [{ actor: 0, target: 1, skill: p.skill, incoming: 1000, result: value, route: 'interface' }];
            if (bh) raw.bhinfo.after = bhMsg;
        }
        if (p.ability === 'do_damage') {
            value = '结果一击命中。'; raw.directs = [{ actor: 0, target: 1, type: 0, damage: 1000, percent: 50, weapon: 'none', weapon_object: '' }];
            // Raw STR36, effectiveSTR96 -> strength168 -> k57; int branch absent.
            const damage = 1160, injury = 344;
            t.qi -= damage; t.eff_qi -= injury; t.craze = 232 + 114;
            raw.metrics[0].direct = 1; raw.metrics[1] = { qi_cost: damage, eff_qi_cost: injury };
        }
        raw.interfaces = [{ object: p.interface.object, function: p.interface.function,
            ...(p.interface.argument ? { argument: p.interface.argument } : {}), result: value,
            implemented_by: p.variant.startsWith('missing-') ? 0 : p.ability === 'do_damage' ? '/adm/daemons/combatd' : '/kungfu/skill/' + p.skill }];
    }
    raw.after = structuredClone(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
function reject(c, f, options) { const raw = syntheticMovementTrace(c, options); f(raw); assert.throws(() => validateMingjiaoMovementRecord(raw, c)); }
function mutate(raw, f) { f(raw.immediate); raw.after = structuredClone(raw.immediate); }

test('冻结86条件：2622正式/172烟雾，25个随机条件100而61条件2', () => {
    assert.equal(cases.length, 86); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 2622);
    assert.equal(smoke.reduce((s, c) => s + c.samples, 0), 172);
    assert.equal(cases.filter(c => c.samples === 100).length, 25);
    assert.equal(sha(mingjiaoMovementSourcePaths.map(p => [p, sha(read(p))])), mingjiaoMovementReviewedSourceHash);
    for (const c of cases) validateMingjiaoMovementRecord(syntheticMovementTrace(c), c);
});
test('来源、catalog、参数或缺失原字段均failclosed，不伪造接口缺席默认实现', () => {
    assert.throws(() => mingjiaoMovementConditions(catalog, p => p === 'kungfu/skill/shenghuo-bu.c' ? Buffer.concat([read(p), Buffer.from('\n')]) : read(p)));
    const altered = structuredClone(catalog); altered.skills[0].sha256 = '0'.repeat(64); assert.throws(() => mingjiaoMovementConditions(altered, read));
    const c = structuredClone(cases[0]); c.parameters.actor.properties.int = 35; assert.throws(() => validateMingjiaoMovementRecord(syntheticMovementTrace(c), c));
    for (const k of ['bhinfo', 'defense_messages', 'directs', 'actions', 'metrics', 'movement_room']) reject(cases[0], r => delete r[k]);
    reject(pick('missing-shenghuo-bu-query_effect_dodge'), r => r.interfaces[0].implemented_by = '/inherit/skill/skill');
    reject(pick('extra-qingfu-49'), r => r.interfaces[0].implemented_by = null);
});
test('资格原dex25/26与basic99/100；valid_enable零返回是observed', () => {
    for (const c of cases.filter(c => c.parameters.variant.startsWith('learn-'))) {
        validateMingjiaoMovementRecord(syntheticMovementTrace(c), c);
        reject(c, r => r.interfaces[0].result = c.parameters.expected === 'observed' ? null : 1);
    }
    for (const s of skills) { const c = pick('enable-' + s + '-parry'); assert.equal(c.parameters.expected, 'observed');
        reject(c, r => r.interfaces[0].argument = 'dodge'); }
});
test('20练习核12/7/3熟练和原费用；部分完成return0仍observed，不刷新基础等级', () => {
    for (const s of skills) for (const [l, gain] of [[200, 12], [400, 7], [800, 3]]) {
        const c = pick('practice-' + s + '-' + l); assert.equal(validateMingjiaoMovementRecord(syntheticMovementTrace(c), c).learned_gain, gain);
        reject(c, r => mutate(r, a => a[0].learned[s]++)); reject(c, r => r.metrics[0].qi_cost--);
    }
    const c = pick('practice-qingfu-shenfa-partial-neili'), r = syntheticMovementTrace(c);
    assert.equal(r.command_accepted, 0); assert.equal(validateMingjiaoMovementRecord(r, c).completed_repetitions, 2);
    assert.equal(r.immediate[0].neili, 5); assert.equal(r.immediate[0].learned[qingfu], 24);
    reject(c, r => r.outcome = 'refused'); reject(c, r => mutate(r, a => a[0].skills[qingfu]++));
    reject(pick('practice-lingxu-bu-basic-equal'), r => mutate(r, a => a[0].temp.time = { practice: 1 }));
});
test('青蝠16台阶严格，两门missing接口必须保留actual function_exists=0', () => {
    for (const c of cases.filter(c => c.parameters.variant.startsWith('extra-'))) {
        const r = syntheticMovementTrace(c); assert.equal(r.interfaces[0].result ?? 0, dpEffect(c.parameters.target.skills[qingfu]));
        reject(c, x => x.interfaces[0].result = (x.interfaces[0].result ?? 0) + 1);
    }
    for (const c of cases.filter(c => c.parameters.variant.startsWith('missing-'))) reject(c, r => r.interfaces[0].result = 1);
});
test('actual缺席owner只接受0而非null/缺项；归类missing不改原件', () => {
    for (const c of cases.filter(c => c.parameters.variant.startsWith('missing-'))) {
        const raw = syntheticMovementTrace(c); assert.equal(raw.interfaces[0].implemented_by, 0);
        const f = mingjiaoMovementEffects([row(raw)], c); assert.deepEqual(f.implemented_by, { missing: 1 });
        assert.equal(raw.interfaces[0].implemented_by, 0);
        for (const value of [null, false, '0', '/inherit/skill/skill']) reject(c, r => r.interfaces[0].implemented_by = value);
        reject(c, r => delete r.interfaces[0].implemented_by);
    }
    reject(pick('extra-qingfu-49'), r => r.interfaces[0].implemented_by = 0);
});
test('原预置昏迷终态只在精确条件出现一次；preparation闭合到施用前快照且不混费用', () => {
    const c = pick('damage-qingfu-unconscious100'), raw = syntheticMovementTrace(c);
    validateMingjiaoMovementRecord(raw, c);
    assert.equal(raw.preparation.before.living, 1); assert.equal(raw.before[1].living, 0);
    for (const terminals of [[], [{ side: 0, state: 'unconscious' }], [{ side: 1, state: 'death' }],
        [{ side: 1, state: 'unconscious' }, { side: 1, state: 'unconscious' }]]) reject(c, r => r.terminals = terminals);
    reject(c, r => delete r.preparation); reject(c, r => r.preparation.before.qi = 0);
    reject(c, r => r.preparation.after.neili--); reject(c, r => r.before[1].living = 1);
    reject(c, r => r.metrics[1].qi_cost = 10000);
    for (const v of ['damage-qingfu-guard99', 'ordinary-qingfu-shenfa-400', 'direct-qingfu-shenfa']) {
        reject(pick(v), r => r.terminals = [{ side: 1, state: 'unconscious' }]);
        reject(pick(v), r => r.preparation = raw.preparation);
    }
});
test('青蝠coin内层失败零返回不可辨；count100才原BH，数学100不替代count', () => {
    for (const v of ['base100', 'growth200', 'growth400', 'growth800', 'inner-always100']) {
        const c = pick('damage-qingfu-' + v); validateMingjiaoMovementRecord(syntheticMovementTrace(c, { cancel: true }), c);
        reject(c, r => r.interfaces[0].result.damage++, { cancel: true });
    }
    const c = pick('damage-qingfu-count100fail'); validateMingjiaoMovementRecord(syntheticMovementTrace(c, { bh: true }), c);
    reject(c, r => r.bhinfo.after = HIY + '只见$n长啸一声犹如一只蝙蝠一样纵身而起，于半空倒立，可是$N精通易理，将其中虚实辨得清清楚楚。\n' + NOR);
    for (const v of ['guard99', 'unconscious100', 'count99fail', 'math100control']) {
        const c = pick('damage-qingfu-' + v); reject(c, r => r.bhinfo.after = bhMsg);
        reject(c, r => { r.interfaces[0].result = { damage: -1000, msg: cancelMsg }; r.defenses[0].result = r.interfaces[0].result; });
    }
});
test('青蝠实际三条文案，缺逗号双句是一条，不擅自修正冻结展示', () => {
    const c = pick('msg-qingfu-shenfa'), r = syntheticMovementTrace(c);
    r.interfaces[0].result = '$n一式「五蝠献寿」，身形晃动，向一旁飘出，避开了$N这一招。。\n$n使出「洞天福地」，一个空心筋斗向后翻出，避开了$N的凌厉攻势。\n';
    validateMingjiaoMovementRecord(r, c);
    reject(c, x => x.interfaces[0].result = '$n使出「洞天福地」，一个空心筋斗向后翻出，避开了$N的凌厉攻势。\n');
});
test('普通两DP探针闭合原阶梯/忙除3；取消与正扣血零创伤合法但不得假伤', () => {
    const c = pick('ordinary-qingfu-shenfa-400');
    validateMingjiaoMovementRecord(syntheticMovementTrace(c, { result: 0, cancel: true }), c);
    validateMingjiaoMovementRecord(syntheticMovementTrace(c, { result: 0 }), c);
    reject(c, r => r.dodge_checks[0].dp++); reject(c, r => r.dodge_checks[1].ap++);
    reject(c, r => r.dodge_checks[0].dp = r.dodge_checks[1].dp);
    reject(c, r => r.defenses[0].incoming = 64, { result: 0 });
    reject(c, r => mutate(r, a => { a[1].qi--; r.metrics[1].qi_cost++; }), { result: 0, cancel: true });
    reject(c, r => mutate(r, a => { a[1].eff_qi -= 99; r.metrics[1].eff_qi_cost += 99; }), { result: 0 });
    const busy = pick('ordinary-qingfu-busy2'); validateMingjiaoMovementRecord(syntheticMovementTrace(busy), busy);
    validateMingjiaoMovementRecord(syntheticMovementTrace(busy, { result: 0 }), busy);
    reject(busy, r => mutate(r, a => a[1].busy = 2), { result: 0 });
    reject(busy, r => r.dodge_checks[1].dp *= 3);
    const unmapped = pick('ordinary-qingfu-shenfa-unmapped400'); reject(unmapped, r => r.defenses.push({}));
});
test('公共direct原UNARMED type0/50%与气血创伤怒气同一整数支持，不能套mapped dodge取消', () => {
    for (const s of skills) {
        const c = pick('direct-' + s); validateMingjiaoMovementRecord(syntheticMovementTrace(c), c);
        assert.equal(c.parameters.interface.attack_type, 0);
        reject(c, r => r.directs[0].type = 1); reject(c, r => r.directs[0].percent = 100);
        reject(c, r => r.defenses.push({ actor: 0, target: 1, skill: s, incoming: 1000, result: null, route: 'interface' }));
        reject(c, r => mutate(r, a => a[1].craze++)); reject(c, r => mutate(r, a => { a[1].qi++; r.metrics[1].qi_cost--; }));
    }
});
test('原dodge探针未映射严格数字0，不把缺字段/null等同0或改变已映射名称', () => {
    for (const s of skills) {
        const c = pick('ordinary-' + s + '-unmapped400');
        validateMingjiaoMovementRecord(syntheticMovementTrace(c), c);
        for (const value of [null, false, '0', s]) for (const index of [0, 1])
            reject(c, r => r.dodge_checks[index].skill = value);
        for (const index of [0, 1]) reject(c, r => delete r.dodge_checks[index].skill);
        const mapped = pick('ordinary-' + s + '-400');
        for (const value of [0, null, 'dodge']) reject(mapped, r => r.dodge_checks[0].skill = value);
    }
});
test('报告分母按真实入口；error/NA独立未知，不对零接口求成功施展率', () => {
    const c = pick('damage-qingfu-count100fail'), zero = syntheticMovementTrace(c), bh = syntheticMovementTrace(c, { bh: true });
    const error = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        elapsed: 0.01, outcome: 'error', reason: 'synthetic error' };
    const f = mingjiaoMovementEffects([row(zero), row(bh), row(error)], c);
    assert.equal(f.validated_samples, 2); assert.equal(f.unknown_samples, 1);
    assert.equal(f.bhinfo_side_effect.trials, 2); assert.equal(f.bhinfo_side_effect.successes, 1);
    assert.equal(f.dodge.trials, 0); assert.equal(f.cancel.trials, 0); assert.equal(f.interface_result.unknown, 1);
    assert.equal(f.costs.qi.n, 2); assert.equal(f.costs.qi.unknown, 1);
    reject(c, r => delete r.interfaces[0].result);
    const ordinary = pick('ordinary-lingxu-bu-200'), o = mingjiaoMovementEffects([row(syntheticMovementTrace(ordinary))], ordinary);
    assert.equal(o.primary_attacks, 1); assert.equal(o.dodge.trials, 1); assert.equal(o.interface_cancel.trials, 0);
});
test('错误/NA原留痕身份与编号严格，缺测防御和资源不填零', () => {
    const c = pick('ordinary-lingxu-bu-200');
    const trace = outcome => ({ kind: 'sample', condition_id: c.id, method: c.method,
        index: 0, elapsed: 0.01, outcome, reason: 'Synthetic runtime failure, not a real sample.' });
    for (const outcome of ['error', 'not_applicable']) {
        assert.equal(validateMingjiaoMovementRecord(trace(outcome), c), null);
        for (const edit of [r => { delete r.kind; }, r => { r.condition_id += '-other'; },
            r => { r.method = 'exert'; }, r => { delete r.index; }, r => { r.index = null; },
            r => { r.index = -1; }, r => { r.index = 0.5; }, r => { r.index = c.samples; },
            r => { r.index = '0'; }, r => { delete r.elapsed; }, r => { r.elapsed = -1; },
            r => { r.elapsed = Infinity; }, r => { delete r.reason; }, r => { r.reason = '  '; }]) {
            const bad = trace(outcome); edit(bad);
            assert.throws(() => validateMingjiaoMovementRecord(bad, c));
            assert.throws(() => mingjiaoMovementEffects([row(bad)], c));
        }
    }
    const effects = mingjiaoMovementEffects(['error', 'not_applicable'].map(o => row(trace(o))), c);
    assert.equal(effects.validated_samples, 0); assert.equal(effects.unknown_samples, 2);
    assert.equal(effects.costs.qi.n, 0); assert.equal(effects.costs.qi.mean, null);
    assert.equal(effects.costs.qi.unknown, 2); assert.equal(effects.dodge.trials, 0);
});
