import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mingjiaoBookConditions, mingjiaoBookEffects } from './school_mingjiao_book_cases.mjs';
import { readSchoolCombat, schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const catalog = { skills: ['force', 'parry', 'unarmed', 'dodge', 'literate', 'sanscrit', 'qiankun-danuoyi'].map(id =>
    ({ id, sha256: hash(read('kungfu/skill/' + id + '.c')) })) };
const cases = mingjiaoBookConditions(catalog, read);
const pick = variant => {
    const c = cases.find(v => v.parameters.variant === variant);
    assert.ok(c, variant); return c;
};
const counts = (observed = 0, refused = 0, error = 0, not_applicable = 0) =>
    ({ observed, refused, error, not_applicable });

// These are renderer summary fixtures, not raw samples or evidence of gameplay.
function condition(c, effects, tally = counts(), recorded = 0) {
    return { id: c.id, entry_id: c.entry_id, method: c.method, parameters: c.parameters,
        planned: c.samples, recorded, missing: c.samples - recorded, counts: tally,
        effects: null, sides: null, mingjiao_book: effects };
}
function report(conditions) {
    return { fingerprint: 'pure-renderer-fixture-not-a-series', evidence_sha256: 'no-original-evidence',
        runtime_errors: [], conditions, totals: { conditions: conditions.length,
            samples: conditions.reduce((n, c) => n + c.recorded, 0),
            observed: conditions.reduce((n, c) => n + c.counts.observed, 0),
            refused: conditions.reduce((n, c) => n + c.counts.refused, 0),
            errors: conditions.reduce((n, c) => n + c.counts.error, 0) } };
}
const line = (md, id) => md.split('\n').find(s => s.startsWith('| ' + id + ' |'));
function effects(c, extra) {
    return { ...mingjiaoBookEffects([], c), samples: 2, validated: 2, unknown: 0,
        commands: 2, commands_accepted: 2, command_execution_cost: 123,
        ketou_calls: 0, get_calls: 0, study_calls: 0, study_accepted: 0,
        stock_consumed: 0, books_created: 0, letters_created: 0, player_receipts: 0,
        study_requested: 0, study_invalid_times_commands: 0, study_completed: 0,
        study_fee: 0, jing_writeoff: 0, jing_cost: 0, source_derived_gross: 0, upgrades: 0,
        learned_net: 0, potential_cost: 0, learned_points_added: 0, results: {}, ...extra };
}

test('新组仅专用Effects且排除通用伤害，保留完整证据与正式样本验收', () => {
    const reader = readSchoolCombat.toString(), renderer = schoolCombatMarkdown.toString();
    assert.match(reader, /collection_group === 'mingjiao-book'[\s\S]*?condition\.effects = null;[\s\S]*?condition\.sides = null;[\s\S]*?condition\.mingjiao_book = mingjiaoBookEffects\(/);
    assert.match(reader, /manifest\.identity\.execution\.smoke, false/);
    assert.match(reader, /condition\.missing, 0, '门派条件尚未采满'/);
    assert.match(reader, /原始日志与台账不符/);
    assert.match(renderer, /!c\.mingjiao_gift && !c\.mingjiao_book/);
    assert.equal(cases.length, 26);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 52);
    assert.equal(cases.reduce((n, c) => n + c.samples * c.parameters.teaching_expectations.length, 0), 56);
    assert.equal(pick('study-jing200').parameters.expected, 'observed');
});

test('原磕头库存、遗信、出书与拾取到USER分列，不把受理当取得', () => {
    const first = pick('ketou-available-repeat'), light = pick('get599'), exact = pick('get600');
    const r = report([
        condition(first, effects(first, { commands: 6, commands_accepted: 6, command_execution_cost: 369,
            ketou_calls: 4, get_calls: 2, stock_consumed: 2, books_created: 2, letters_created: 2, player_receipts: 2,
            results: { appeared: 2, picked: 2, 'stock-empty': 2 } }), counts(2), 2),
        condition(light, effects(light, { commands_accepted: 0, command_execution_cost: 0,
            get_calls: 2, results: { 'get-heavy': 2 } }), counts(0, 2), 2),
        condition(exact, effects(exact, { get_calls: 2, player_receipts: 2, results: { picked: 2 } }), counts(2), 2),
    ]);
    const saved = JSON.stringify(r), md = schoolCombatMarkdown(r);
    assert.match(md, /## 明教乾坤秘籍：原磕头、拾取与有限研读/);
    assert.match(md, /未采数据不计完成/);
    assert.match(md, /密道开门、五秒关闭及三个首载顺序另属后续独立范围/);
    assert.match(md, /书籍使用原单例取得路径，不把羊皮可以克隆的实现写成禁止克隆/);
    assert.ok(line(md, first.id).includes(' | 6；6/369 | 4/2 | 2/2/2 | 2 |'));
    assert.ok(line(md, light.id).includes(' | 2；0/0 | 0/2 | 0/0/0 | 0 |'));
    assert.ok(line(md, exact.id).includes(' | 2；2/123 | 0/2 | 0/0/0 | 2 |'));
    assert.doesNotMatch(md.split('## 明教乾坤秘籍：原磕头、拾取与有限研读')[0], new RegExp(first.id));
    for (const c of r.conditions) assert.equal(md.split('\n').filter(s => s.startsWith('| ' + c.id + ' |')).length, 1);
    assert.equal(JSON.stringify(r), saved);
});

test('零级升级、部分三读、clever及精神200分列毛进度/净熟练与正常费/清零', () => {
    const zero = pick('study0'), partial = pick('study-partial399'), clever = pick('study-clever'), jing200 = pick('study-jing200');
    const row = (c, extra) => condition(c, effects(c, { study_calls: 2, study_accepted: 2,
        study_requested: 2, study_completed: 2, study_fee: 398, jing_cost: 398,
        source_derived_gross: 16, learned_net: 16, results: { studied: 2 }, ...extra }), counts(2), 2);
    const md = schoolCombatMarkdown(report([
        row(zero, { source_derived_gross: 44, learned_net: 0, upgrades: 2 }),
        row(partial, { study_requested: 6, study_completed: 4, study_fee: 796,
            jing_writeoff: 2, jing_cost: 798, source_derived_gross: 32, learned_net: 32 }),
        row(clever, { source_derived_gross: 28, learned_net: 28 }), row(jing200, {}),
    ]));
    assert.ok(line(md, zero.id).includes(' | 2/0 | 2/2 | 44/0 | 398/398/0 | 0/0 |'));
    assert.ok(line(md, partial.id).includes(' | 6/0 | 4/0 | 32/32 | 798/796/2 | 0/0 |'));
    assert.ok(line(md, clever.id).includes(' | 28/28 | 398/398/0 |'));
    assert.ok(line(md, jing200.id).includes(' | 2/0 | 2/0 | 16/16 | 398/398/0 |'));
    assert.match(md, /源码推导毛进度只按已核原循环和成长公式计算，不冒直接观测的improve参数/);
    assert.match(md, /零级原强成长升一级并将净熟练归零，不能据此判作没有读成/);
    assert.match(md, /精神399三读只完成两次，正常研读费398加直接清零1/);
    assert.match(md, /310级、经验100万通过书籍经验门但仍被技能成长经验门拒绝/);
});

test('实际error/NA需Effects核身份，空数据及混合未知不补零收费或成长', () => {
    const c = pick('study0');
    const rows = ['error', 'not_applicable'].map((outcome, index) => ({ condition_id: c.id, outcome,
        raw: { kind: 'sample', condition_id: c.id, method: c.method, index, elapsed: 0.01,
            outcome, reason: 'Synthetic diagnostic boundary, not original evidence.' } }));
    const unknown = mingjiaoBookEffects(rows, c);
    assert.equal(unknown.validated, 0); assert.equal(unknown.unknown, 2);
    assert.equal(unknown.study_completed, null); assert.equal(unknown.jing_cost, null);
    const missing = condition(pick('study200'), mingjiaoBookEffects([], pick('study200')));
    const mixed = condition(pick('study310'), { ...unknown, validated: 1, unknown: 1,
        results: { studied: 1 } }, counts(1, 0, 1), 2);
    const md = schoolCombatMarkdown(report([condition(c, unknown, counts(0, 0, 1, 1), 2), missing, mixed]));
    assert.ok(line(md, c.id).includes(' | 0/0/1/1/0 | 未观测 | 未观测 | 未观测 | 未观测 | 未观测 | 未观测 | 未观测 | 未观测 | 0/2 |'));
    assert.ok(line(md, missing.id).includes(' | 0/2 | 0/0/0/0/2 | 未观测'));
    assert.ok(line(md, mixed.id).includes(' | 未观测 | studied:1 | 1/1 |'));
    assert.match(md, /含未知样本时合计未观测，原已核结果频数仍独立保留/);
    const bad = structuredClone(rows); bad[0].raw.condition_id += '-wrong';
    assert.throws(() => mingjiaoBookEffects(bad, c));
});

test('新增秘籍专表不改旧幻灵剑报告行，原JSON与旧归属分母保持', () => {
    const old = { id: 'legacy-gift-summary-fixture', recorded: 2, planned: 2, missing: 0,
        parameters: { variant: 'capacity3999' }, counts: counts(2), effects: null, sides: null,
        mingjiao_gift: { validated: 2, unknown: 0, commands: 2, commands_accepted: 2,
            command_execution_cost: 500, jing_cost: 30, contribution_cost: 0,
            qualification_passed: 2, grants_attempted: 2, player_receipts: 0,
            floor_receipts: 2, already_owned: 0, results: { 'floor-receipt': 2 } } };
    const c = pick('study0'), added = condition(c, mingjiaoBookEffects([], c));
    const previous = schoolCombatMarkdown(report([old])), r = report([old, added]), saved = JSON.stringify(r);
    const md = schoolCombatMarkdown(r);
    assert.equal(line(md, old.id), line(previous, old.id));
    assert.equal(md.split('\n').filter(s => s.startsWith('| ' + old.id + ' |')).length, 1);
    assert.equal(md.split('\n').filter(s => s.startsWith('| ' + c.id + ' |')).length, 1);
    assert.equal(JSON.stringify(r), saved);
});
