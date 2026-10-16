import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mingjiaoRecruitConditions, mingjiaoRecruitEffects } from './school_mingjiao_recruit_cases.mjs';
import { readSchoolCombat, schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const catalog = { skills: [{ id: 'shenghuo-ling', sha256: hash(read('kungfu/skill/shenghuo-ling.c')) }] };
const cases = mingjiaoRecruitConditions(catalog, read);
const pick = variant => {
    const c = cases.find(v => v.parameters.teacher.key === 'lengqian' && v.parameters.variant === variant);
    assert.ok(c, variant); return c;
};

// Renderer fixtures are effect summaries, never original samples or evidence of gameplay.
function condition(c, effects, counts, recorded) {
    return { id: c.id, entry_id: c.entry_id, method: c.method, parameters: c.parameters,
        planned: c.samples, recorded, missing: c.samples - recorded, counts,
        effects: null, sides: null, mingjiao_recruit: effects };
}
function report(conditions) {
    return { fingerprint: 'pure-renderer-fixture-not-a-series', evidence_sha256: 'no-original-evidence',
        runtime_errors: [], conditions, totals: { conditions: conditions.length,
            samples: conditions.reduce((n, c) => n + c.recorded, 0),
            observed: conditions.reduce((n, c) => n + c.counts.observed, 0),
            refused: conditions.reduce((n, c) => n + c.counts.refused, 0),
            errors: conditions.reduce((n, c) => n + c.counts.error, 0) } };
}
const counts = (observed = 0, refused = 0, error = 0, not_applicable = 0) =>
    ({ observed, refused, error, not_applicable });
const line = (markdown, id) => markdown.split('\n').find(s => s.startsWith('| ' + id + ' |'));

test('接线只调用本组Effects，JSON不附通用零伤害，原报告入口仍核实完整证据', () => {
    const source = readSchoolCombat.toString();
    assert.match(source, /collection_group === 'mingjiao-recruit'[\s\S]*?condition\.effects = null;[\s\S]*?condition\.sides = null;[\s\S]*?condition\.mingjiao_recruit = mingjiaoRecruitEffects\(/);
    assert.match(source, /assert\.equal\(manifest\.identity\.execution\.smoke, false, '烟雾不是完整统计'\)/);
    assert.match(source, /assert\.equal\(condition\.missing, 0, '门派条件尚未采满'\)/);
    assert.match(source, /原始日志与台账不符/);
    const renderer = schoolCombatMarkdown.toString();
    assert.match(renderer, /!c\.shaolin_backlash && !c\.mingjiao_recruit/);
    assert.match(renderer, /report\.conditions\.filter\(c => c\.mingjiao_recruit\)/);
});

test('拜师专表分开命令成本、新师承、请安、取消和确认，不进入伤害表且不修改JSON', () => {
    const c = pick('new-repeat'), e = { ...mingjiaoRecruitEffects([], c), validated: 2, unknown: 0,
        samples: 2, commands: 4, commands_accepted: 4, command_execution_cost: 987,
        formal_apprenticeships: 2, first_joins: 2, repeated_greetings: 2, cancellations: 0,
        betrayer_confirmations: 0, results: { greeted: 2, recruited: 2 } };
    const r = report([condition(c, e, counts(2), 2)]), saved = JSON.stringify(r), md = schoolCombatMarkdown(r);
    assert.match(md, /## 明教各教师：原拜师、请安与取消/);
    assert.match(md, /亲传请安和转世认可不计新师承/);
    assert.match(md, /命令受理与实际执行成本分列/);
    assert.match(md, /张无忌既有拜师／普通授课另列/);
    assert.match(md, /不把教师构造入口当作隐藏随机缓存已验证/);
    assert.equal(md.split('\n').filter(s => s.startsWith('| ' + c.id + ' |')).length, 1);
    assert.doesNotMatch(md.split('## 明教各教师：原拜师、请安与取消')[0], new RegExp(c.id));
    assert.ok(line(md, c.id).includes(' | 4；4/987 | 2/2 | 2/0/0 | greeted:2, recruited:2 | 2/0 |'));
    assert.equal(JSON.stringify(r), saved);
});

test('只有错误/NA时真实身份仍经Effects核验，缺效果显示未观测而不是零次拜师', () => {
    const c = pick('new-repeat');
    const rows = ['error', 'not_applicable'].map((outcome, index) => ({ condition_id: c.id, outcome,
        raw: { kind: 'sample', condition_id: c.id, method: c.method, index, elapsed: 0.02,
            outcome, reason: 'Synthetic diagnostic boundary, not an original sample.' } }));
    const e = mingjiaoRecruitEffects(rows, c);
    assert.equal(e.validated, 0); assert.equal(e.unknown, 2); assert.equal(e.formal_apprenticeships, null);
    const md = schoolCombatMarkdown(report([condition(c, e, counts(0, 0, 1, 1), 2)]));
    assert.ok(line(md, c.id).includes(' | 0/0/1/1/0 | 未观测 | 未观测 | 未观测 | 未观测 | 0/2 |'));
    assert.match(md, /错误、不适用与缺样不补成零次拜师/);
    const bad = structuredClone(rows); bad[0].raw.condition_id += '-other';
    assert.throws(() => mingjiaoRecruitEffects(bad, c));
});

test('空数据明确0/计划及缺样；转世请安/取消/外派确认不冒收徒', () => {
    const empty = pick('bare-cancel'), e0 = mingjiaoRecruitEffects([], empty);
    const emptyRow = condition(empty, e0, counts(), 0);
    const reborn = pick('reborn-recognition'), e1 = { ...mingjiaoRecruitEffects([], reborn),
        samples: 2, validated: 2, unknown: 0, commands: 2, commands_accepted: 2, command_execution_cost: 501,
        formal_apprenticeships: 0, first_joins: 0, repeated_greetings: 2, cancellations: 0,
        betrayer_confirmations: 0, results: { greeted: 2 } };
    const foreign = pick('foreign-confirm-cancel'), e2 = { ...mingjiaoRecruitEffects([], foreign),
        samples: 2, validated: 2, unknown: 0, commands: 10, commands_accepted: 6, command_execution_cost: 1001,
        formal_apprenticeships: 0, first_joins: 0, repeated_greetings: 0, cancellations: 2,
        betrayer_confirmations: 2, results: { 'betrayer-confirmation': 2, cancelled: 2, refused: 6 } };
    const md = schoolCombatMarkdown(report([emptyRow, condition(reborn, e1, counts(0, 2), 2),
        condition(foreign, e2, counts(0, 2), 2)]));
    assert.ok(line(md, empty.id).includes(' | 0/2 | 0/0/0/0/2 | 未观测 | 未观测 | 未观测 | 未观测 | 0/0 |'));
    assert.ok(line(md, reborn.id).includes(' | 2；2/501 | 0/0 | 2/0/0 |'));
    assert.ok(line(md, foreign.id).includes(' | 10；6/1001 | 0/0 | 0/2/2 |'));
    assert.match(md, /销毁教师的清理结果不代替原命令结束时的待拜师状态/);
});

test('新增专表不改既有张无忌教学行，旧组仍独立统计且各ID仅出现一行', () => {
    const legacy = { id: 'legacy-zhangwuji-renderer-fixture', planned: 2, recorded: 2, missing: 0,
        counts: counts(2), effects: null, sides: null, mingjiao_apprentice_learning: {
            validated: 2, unknown: 0, formal_apprenticeships: 2, setup_apprenticeships: 1,
            learned_iterations: 3, jing_cost: 27, jing_writeoff: 0, learned_net: { mean: 5 } } };
    const c = pick('bare-cancel'), added = condition(c, mingjiaoRecruitEffects([], c), counts(), 0);
    const prior = schoolCombatMarkdown(report([legacy])), next = schoolCombatMarkdown(report([legacy, added]));
    assert.equal(line(next, legacy.id), line(prior, legacy.id));
    assert.equal(next.split('\n').filter(s => s.startsWith('| ' + legacy.id + ' |')).length, 1);
    assert.equal(next.split('\n').filter(s => s.startsWith('| ' + c.id + ' |')).length, 1);
});
