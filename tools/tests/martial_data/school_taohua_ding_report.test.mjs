import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaDingConditions } from './school_taohua_ding_cases.mjs';
import { taohuaDingReport, taohuaDingMarkdown } from './school_taohua_ding_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const skill = 'tanzhi-shentong';
const skills = [skill, skill + '/ding'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', source = read(path), parsed = scanSource(source);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: parsed.functions.filter(fn => fn.name === 'perform')
        .map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'perform' })) };
});
const cases = taohuaDingConditions({ skills }, read);
const pick = (tag = 'baseline', level = 200) => {
    const condition = cases.find(c => c.id === `school-taohua-ding-l${level}-${tag}`);
    assert.ok(condition, tag); return condition;
};

// Synthetic report inputs, not driver observations. No source or raw evidence is written.
function snapshot(cfg, side, fighting) {
    const equipped = !!cfg.equipment, apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    const cultivationKey = key => key.includes('/') || key === 'character';
    const fields = Object.entries(cfg.properties);
    const unarmed = Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0));
    return { ...Object.fromEntries(fields.filter(([key]) => !cultivationKey(key))),
        cultivation: Object.fromEntries(fields.filter(([key]) => cultivationKey(key))),
        object: '/tests/actor#' + (side + 100), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: Number(fighting), busy: cfg.busy ?? null, no_perform: cfg.temp?.no_perform ?? null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), learned: {}, temp: { apply, ...cfg.temp },
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_str: cfg.properties.str + Math.trunc(unarmed / 10),
        effective_con: cfg.properties.con + Math.trunc(cfg.skills.force / 10),
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0, weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { program: '/tests/sword', object: '/tests/sword#' + (side + 200),
            skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100, material: null } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

function trace(condition, index = 0, { hit, cost = 37, release = 2.001 } = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 });
        preparation.after = structuredClone(before[1]);
    }
    const raw = { kind: 'sample', condition_id: condition.id, index, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        command_accepted: accepted ? cost : 0, launches: [], refusals: [], directs: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [], callbacks: [],
        elapsed: p.observe_seconds ? 6.01 : 0.01, reason: '', ...(preparation ? { preparation } : {}) };
    if (accepted) {
        hit ??= p.gate_expectation !== 'miss';
        raw.launches.push({ actor: before[0].object, skill, argument: 'ding right' });
        raw.metrics[0].ability_launched = 1;
        raw.immediate[0].busy = hit ? 2 : 1;
        const neili = hit ? 200 + before[0].jiali : 150;
        raw.metrics[0].neili_cost = neili; raw.immediate[0].neili -= neili;
        if (hit) {
            const damage = Math.trunc(before[0].effective_skills.finger / 4);
            raw.directs.push({ actor: 0, target: 1, type: 2, damage, percent: 0, weapon: 'none', weapon_object: '' });
            raw.metrics[0].direct = 1;
            let loss = damage + Math.trunc(before[0].jiali * damage / 200);
            const strength = before[0].str * 2 + before[0].effective_str;
            loss += Math.trunc(loss * (Math.trunc((strength - 60) / 4) + 30) / 50);
            loss = loss > 1500 ? Math.trunc((loss - 1500) / 4) + 1000
                : loss > 500 ? Math.trunc((loss - 500) / 2) + 500 : loss;
            raw.metrics[1].qi_cost = loss; raw.immediate[1].qi -= loss;
            raw.immediate[1].no_perform = 1; raw.immediate[1].temp.no_perform = 1;
        }
        raw.immediate[0].learned[skill] = 1;
    } else {
        const refusal = p.refusal === 'unmapped-finger-command' ? '你现在的(finger)中并没有这种外功。\n' : p.refusal;
        raw.reason = '\x1b[256D\x1b[K' + refusal;
        raw.refusals.push({ actor: before[0].object, reason: raw.reason });
        raw.immediate[0].temp.notify_fail = raw.reason;
    }
    raw.after = structuredClone(raw.immediate);
    if (p.observe_seconds) {
        raw.after[1].no_perform = null; delete raw.after[1].temp.no_perform;
        raw.callbacks = ['before', 'after'].map((phase, i) => ({
            owner: '/kungfu/skill/tanzhi-shentong/ding', function: 'ding_end', side: 1, phase,
            elapsed: release - (1 - i) / 1000, state: structuredClone(i ? raw.after[1] : raw.immediate[1]) }));
    }
    return { condition_id: condition.id, index, outcome: raw.outcome, reason: raw.reason, raw };
}

function unknown(condition, index, outcome = 'error', reason = '原观察错误') {
    return { condition_id: condition.id, index, outcome, reason,
        raw: { condition_id: condition.id, index, outcome, reason } };
}
const rejected = (condition, row, mutate) => {
    const changed = structuredClone(row); mutate(changed);
    assert.throws(() => taohuaDingReport([changed], condition));
};

test('报告复用全部22冻结条件，计划与原矩阵完整指纹不变', () => {
    assert.equal(cases.length, 22); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 730);
    assert.equal(hash(cases), '0fc7550bd2d034e5557e9eaba77d1d7e87de9e3c6baaedfd53363b8246950c11');
    const smoke = taohuaDingConditions({ skills }, read, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 44);
    assert.equal(hash(smoke), '60b1984b8a1c996afb99ee0d7594b3a0b9b4aa23e88df5f2ff06e26cb5cdf624');
    for (const condition of cases) {
        const report = taohuaDingReport([trace(condition)], condition);
        assert.equal(report.coverage.recorded, 1);
        assert.match(taohuaDingMarkdown(report), /桃花岛·弹指神通「定昆仑」/);
    }
});

test('正命令成本不是布尔受理，命中以受理样本为分母且保留未知', () => {
    const c = pick(), rows = [trace(c, 0, { hit: true, cost: 23 }), trace(c, 1, { hit: false, cost: 476 }),
        unknown(c, 2), unknown(c, 3, 'not_applicable', '原能力未观察')];
    const saved = structuredClone(rows), report = taohuaDingReport(rows, c);
    assert.deepEqual(report.coverage, { planned: 100, recorded: 4, accepted: 2, refused: 0,
        errors: 1, not_applicable: 1, missing: 96 });
    assert.equal(report.commands.execution_cost.mean, 249.5);
    assert.equal(report.commands.execution_cost.n, 2); assert.equal(report.commands.accepted, 2);
    assert.equal(report.commands.unknown, 2); assert.equal(report.effects.hit.trials, 2);
    assert.equal(report.effects.hit.successes, 1); assert.equal(report.effects.hit.rate, 0.5);
    assert.equal(report.effects.ability_neili.mean, 175); assert.equal(report.effects.ability_neili.n, 2);
    assert.deepEqual(report.control, { applied: 1, missed: 1, release_observed: 0,
        release_unobserved: 1, not_triggered: 1, unknown: 2 });
    assert.deepEqual(rows, saved);
    const markdown = taohuaDingMarkdown(report);
    assert.match(markdown, /\| 正成本／受理 \| 2 \| 249\.5 \[68\.3, 430\.7\]；n=2，未知=0 \|/);
    assert.match(markdown, /\| 2 \| 1 \| 1 \| 50%（Wilson 95%/);
    assert.match(markdown, /\| 100 \| 4 \| 2 \| 0 \| 1 \| 1 \| 96 \|/);
});

test('公共命令拒绝与招式内部拒绝分开，拒绝不成为零效果样本', () => {
    for (const [tag, scope] of [['no-map', 'command'], ['actor-busy2', 'command'], ['target-no-perform', 'ability']]) {
        const c = pick(tag), row = trace(c), report = taohuaDingReport([row], c);
        assert.equal(report.effects[scope + '_refused'], 1); assert.equal(report.commands.refused, 1);
        assert.equal(report.commands.execution_cost.mean, 0); assert.equal(report.commands.execution_cost.n, 1);
        assert.equal(report.commands.accepted_execution_cost.mean, null);
        assert.equal(report.effects.hit.trials, 0); assert.equal(report.effects.hit.rate, null);
        assert.equal(report.effects.total_neili.n, 0); assert.equal(report.effects.total_neili.mean, null);
        assert.equal(report.control.applied, 0); assert.equal(report.control.not_triggered, 1);
        assert.match(taohuaDingMarkdown(report), /未知（受理分母为0）/);
    }
});

test('REMOTE输入、实际气血、创伤、招式费和加力费分列', () => {
    const c = pick('jiali50'), report = taohuaDingReport([trace(c)], c), e = report.effects;
    // 75 + trunc(50 * 75 / 200) = 93; 93 + trunc(93 * 47 / 50) = 180.
    assert.equal(e.input_damage_on_hit.mean, 75); assert.equal(e.qi_loss.mean, 180);
    assert.equal(e.wound.mean, 0); assert.equal(e.ability_neili.mean, 200);
    assert.equal(e.jiali_neili.mean, 50); assert.equal(e.total_neili.mean, 250);
    assert.equal(e.actor_busy.mean, 2); assert.equal(e.target_busy.mean, 0);
    assert.match(taohuaDingMarkdown(report), /输入伤害不是最终掉血/);
    assert.match(taohuaDingMarkdown(report), /percent=0在本组无创伤，不代表所有目标状态都无创伤/);
});

test('两次六秒自然观察保留成对原回调实际测时，不借忙乱估时', () => {
    const c = pick('natural-release'), rows = [trace(c, 0, { release: 1.201 }), trace(c, 1, { release: 4.901 })];
    const report = taohuaDingReport(rows, c);
    assert.equal(report.coverage.missing, 0); assert.equal(report.control.release_observed, 2);
    assert.equal(report.control.release_unobserved, 0); assert.equal(report.effects.release_elapsed.n, 2);
    assert.equal(report.effects.release_elapsed.min, 1.201); assert.equal(report.effects.release_elapsed.max, 4.901);
    assert.ok(Math.abs(report.effects.release_elapsed.mean - 3.051) < 1e-10);
    assert.equal(report.effects.actor_busy.mean, 2); assert.equal(rows[1].raw.after[0].busy, 2);
    assert.match(taohuaDingMarkdown(report), /\| 2 \| 0 \| 0 \| 0 \| 3\.051 \[1\.571, 4\.531\]；n=2，未知=0 \|/);
    assert.match(taohuaDingMarkdown(report), /两次六秒自然窗口只验机制，不估计1至5秒随机延迟分布/);
});

test('即时命中未观察解除；目标50忙乱保留，失手仍是有效费用样本', () => {
    const c = pick('target-busy50'), report = taohuaDingReport([trace(c)], c);
    assert.equal(report.effects.target_busy.mean, 50); assert.equal(report.control.release_unobserved, 1);
    assert.equal(report.effects.release_elapsed.n, 0); assert.equal(report.effects.release_elapsed.mean, null);
    assert.match(taohuaDingMarkdown(report), /这里的忙乱值不是自然解除时长/);
    const missed = pick('parry898'), miss = taohuaDingReport([trace(missed)], missed);
    assert.equal(miss.effects.hit.rate, 0); assert.equal(miss.effects.hit.trials, 1);
    assert.equal(miss.effects.input_damage_on_hit.n, 0); assert.equal(miss.effects.qi_loss.mean, 0);
    assert.equal(miss.effects.total_neili.mean, 150); assert.equal(miss.control.release_unobserved, 0);
});

test('空计划结果和全错误/不适用保留缺样本、原理由及未知分母', () => {
    const c = pick();
    for (const rows of [[], [unknown(c, 0)], [unknown(c, 0, 'not_applicable', '未观察原回调')]]) {
        const report = taohuaDingReport(rows, c);
        assert.equal(report.coverage.missing, c.samples - rows.length);
        assert.equal(report.commands.execution_cost.n, 0); assert.equal(report.commands.execution_cost.mean, null);
        assert.equal(report.effects.qi_loss.mean, null); assert.equal(report.effects.total_neili.mean, null);
        assert.equal(report.effects.hit.rate, null); assert.equal(report.effects.hit.trials, 0);
        assert.equal(report.commands.unknown, rows.length);
        if (rows.length) assert.equal(report.exceptional[0].reason, rows[0].raw.reason);
        assert.match(taohuaDingMarkdown(report), /未观察（n=0，未知=0）/);
    }
});

test('先核外层/原件条件编号结果理由同源，未知结果也不能越过归属', () => {
    const mutations = [r => { r.condition_id = 'foreign'; }, r => { r.raw.condition_id = 'foreign'; },
        r => { delete r.condition_id; }, r => { delete r.raw.condition_id; },
        r => { r.index++; }, r => { r.raw.index++; }, r => { delete r.index; }, r => { delete r.raw.index; },
        r => { r.outcome = 'foreign'; }, r => { r.raw.outcome = 'foreign'; },
        r => { r.reason += 'wrong'; }, r => { delete r.reason; }, r => { delete r.raw.reason; },
        r => { r.reason = r.raw.reason = null; }];
    for (const [c, row] of [[pick(), trace(pick())], [pick('no-map'), trace(pick('no-map'))],
        [pick(), unknown(pick(), 0)], [pick(), unknown(pick(), 0, 'not_applicable')]])
        for (const mutate of mutations) rejected(c, row, mutate);
    for (const outcome of ['error', 'not_applicable'])
        rejected(pick(), unknown(pick(), 0, outcome), r => { r.reason = r.raw.reason = '  '; });
});

test('重复、越界及非法编号不能膨胀分母', () => {
    const c = pick(), row = trace(c);
    assert.throws(() => taohuaDingReport([row, structuredClone(row)], c));
    for (const value of [-1, 0.5, 100, null, '0', Number.NaN])
        rejected(c, row, r => { r.index = r.raw.index = value; });
});

test('严格委托现有原记录校验，缺字段、伪费用/状态/回调不能统计', () => {
    const c = pick(), row = trace(c);
    for (const mutate of [r => { delete r.raw.command_accepted; }, r => { r.raw.command_accepted = 0; },
        r => { r.raw.command_accepted = true; }, r => { r.raw.metrics[0].neili_cost++; },
        r => { r.raw.after[1].no_perform = null; }, r => { r.raw.immediate[1].qi++; }]) rejected(c, row, mutate);
    const natural = pick('natural-release');
    for (const mutate of [r => { r.raw.callbacks = []; }, r => { r.raw.callbacks[1].side = 0; },
        r => { r.raw.callbacks[1].elapsed = 7; }]) rejected(natural, trace(natural), mutate);
    assert.throws(() => taohuaDingReport([trace(pick('no-map'))], c));
});

test('报告只读取冻结条件，不依赖或改写已删除raw.parameters', () => {
    const c = pick(), row = trace(c), before = structuredClone(row);
    const expected = taohuaDingReport([row], c);
    assert.equal(Object.hasOwn(row.raw, 'parameters'), false); assert.deepEqual(row, before);
    row.raw.parameters = { collection_group: 'foreign', level: 1, observe_seconds: 99 };
    assert.deepEqual(taohuaDingReport([row], c), expected);
    for (const mutate of [p => { p.collection_group = 'foreign'; }, p => { p.skill = 'foreign'; },
        p => { p.ability = 'foreign'; }, p => { p.action = 'perform finger.ding'; }, p => { p.observe_seconds = 1; }]) {
        const wrong = structuredClone(c); mutate(wrong.parameters);
        assert.throws(() => taohuaDingReport([], wrong));
    }
});

test('Markdown保留实际数字及安全展示原诊断，JSON理由不丢字节', () => {
    const c = pick(), reason = '原错误 | `<driver>`\n下一行 & 证据', row = unknown(c, 0, 'error', reason);
    const saved = structuredClone(row), report = taohuaDingReport([row], c), markdown = taohuaDingMarkdown(report);
    assert.equal(report.exceptional[0].reason, reason); assert.deepEqual(row, saved);
    assert.match(markdown, /原错误 \\\| &#96;&lt;driver&gt;&#96;<br>下一行 &amp; 证据/);
    assert.match(markdown, /\| 100 \| 1 \| 0 \| 0 \| 1 \| 0 \| 99 \|/);
    assert.match(markdown, /错误、不适用和缺样本不计作拒绝、失手、零费用或零效果/);
    assert.ok(markdown.endsWith('\n')); assert.equal(markdown.includes('\r'), false);
});

test('渲染端不能把不闭合计数或未知统计值伪造为零', () => {
    const c = pick(), baseline = taohuaDingReport([trace(c)], c);
    for (const mutate of [r => { r.coverage.accepted++; }, r => { r.commands.execution_cost.n++; },
        r => { r.effects.hit.trials++; }, r => { r.control.release_observed++; },
        r => { r.effects.release_elapsed.mean = 0; }, r => { r.effects.total_neili.mean = null; }]) {
        const changed = structuredClone(baseline); mutate(changed);
        assert.throws(() => taohuaDingMarkdown(changed));
    }
});
