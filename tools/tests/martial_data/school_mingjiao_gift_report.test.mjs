import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mingjiaoGiftConditions, mingjiaoGiftEffects } from './school_mingjiao_gift_cases.mjs';
import { readSchoolCombat, schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const catalog = { skills: ['force', 'sword', 'unarmed', 'dodge', 'parry', 'xiaoyao-jian'].map(id =>
    ({ id, sha256: hash(read('kungfu/skill/' + id + '.c')) })) };
const cases = mingjiaoGiftConditions(catalog, read);
const pick = variant => {
    const c = cases.find(v => v.parameters.variant === variant);
    assert.ok(c, variant); return c;
};
const counts = (observed = 0, refused = 0, error = 0, not_applicable = 0) =>
    ({ observed, refused, error, not_applicable });

// Summary fixtures exercise the renderer only; they are not raw gameplay samples.
function condition(c, effects, tally = counts(), recorded = 0) {
    return { id: c.id, entry_id: c.entry_id, method: c.method, parameters: c.parameters,
        planned: c.samples, recorded, missing: c.samples - recorded, counts: tally,
        effects: null, sides: null, mingjiao_gift: effects };
}
function effects(c, extra) {
    return { ...mingjiaoGiftEffects([], c), samples: 2, validated: 2, unknown: 0,
        commands: 2, commands_accepted: 2, command_execution_cost: 123,
        jing_cost: 25, contribution_cost: 0, qualification_passed: 0, grants_attempted: 0,
        player_receipts: 0, floor_receipts: 0, already_owned: 0, ...extra };
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

test('专用接线保留完整证据检查，物品组不进入通用伤害表', () => {
    const source = readSchoolCombat.toString(), renderer = schoolCombatMarkdown.toString();
    assert.match(source, /collection_group === 'mingjiao-gift'[\s\S]*?condition\.effects = null;[\s\S]*?condition\.sides = null;[\s\S]*?condition\.mingjiao_gift = mingjiaoGiftEffects\(/);
    assert.match(source, /manifest\.identity\.execution\.smoke, false/);
    assert.match(source, /condition\.missing, 0, '门派条件尚未采满'/);
    assert.match(source, /原始日志与台账不符/);
    assert.match(renderer, /!c\.mingjiao_recruit && !c\.mingjiao_gift/);
    assert.match(renderer, /report\.conditions\.filter\(c => c\.mingjiao_gift\)/);
    assert.equal(cases.length, 16);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 32);
    assert.equal(cases.reduce((n, c) => n + c.samples * c.parameters.teaching_expectations.length, 0), 34);
});

test('3999落地与4000背包分别统计，交付尝试不冒玩家收剑或资格失败', () => {
    const low = pick('capacity3999'), exact = pick('capacity4000');
    const r = report([
        condition(low, effects(low, { qualification_passed: 2, grants_attempted: 2, floor_receipts: 2, results: { 'floor-receipt': 2 } }), counts(2), 2),
        condition(exact, effects(exact, { qualification_passed: 2, grants_attempted: 2, player_receipts: 2, results: { 'player-receipt': 2 } }), counts(2), 2),
    ]);
    const saved = JSON.stringify(r), md = schoolCombatMarkdown(r);
    assert.match(md, /## 明教杨逍：幻灵剑原询问与单例交付/);
    assert.match(md, /超重落地不是玩家收剑或资格失败/);
    assert.match(md, /不自动装备、不出招、不作兵器强弱排名/);
    assert.ok(line(md, low.id).includes(' | 2；2/123 | 25/0 | 2/2 | 0/2 | 0 | 超重落地:2 | 2/0 |'));
    assert.ok(line(md, exact.id).includes(' | 2/2 | 2/0 | 0 | 进入玩家背包:2 |'));
    assert.doesNotMatch(md.split('## 明教杨逍：幻灵剑原询问与单例交付')[0], new RegExp(low.id));
    for (const c of r.conditions) assert.equal(md.split('\n').filter(s => s.startsWith('| ' + c.id + ' |')).length, 1);
    assert.equal(JSON.stringify(r), saved);
});

test('重复问话、本人容器、其他归属和资格拒绝不混分母或交付次数', () => {
    const repeat = pick('gift-repeat'), bag = pick('player0-container'), peer = pick('peer-holder');
    const outsider = pick('outsider-holder'), remote = pick('remote-holder'), gate = pick('shen79999');
    const rows = [
        condition(repeat, effects(repeat, { commands: 4, commands_accepted: 4, command_execution_cost: 246,
            jing_cost: 60, qualification_passed: 4, grants_attempted: 2, player_receipts: 2, already_owned: 2,
            results: { 'already-owned': 2, 'player-receipt': 2 } }), counts(2), 2),
        condition(bag, effects(bag, { qualification_passed: 2, already_owned: 2, results: { 'already-owned': 2 } }), counts(0, 2), 2),
        condition(peer, effects(peer, { qualification_passed: 2, results: { 'peer-owned': 2 } }), counts(0, 2), 2),
        condition(outsider, effects(outsider, { qualification_passed: 2, results: { 'outsider-owned': 2 } }), counts(0, 2), 2),
        condition(remote, effects(remote, { qualification_passed: 2, results: { 'room-owned': 2 } }), counts(0, 2), 2),
        condition(gate, effects(gate, { results: { shen: 2 } }), counts(0, 2), 2),
    ];
    const md = schoolCombatMarkdown(report(rows));
    assert.ok(line(md, repeat.id).includes(' | 4；4/246 | 60/0 | 4/2 | 2/0 | 2 |'));
    assert.ok(line(md, bag.id).includes(' | player0-container |'));
    assert.ok(line(md, bag.id).includes(' | 2/0 | 0/0 | 2 | 本人已持有:2 |'));
    assert.ok(line(md, peer.id).includes(' | 2/0 | 0/0 | 0 | 同门他人持有:2 |'));
    assert.ok(line(md, outsider.id).includes('异门他人持有:2'));
    assert.ok(line(md, remote.id).includes('远处地面:2'));
    assert.ok(line(md, gate.id).includes(' | 0/0 | 0/0 | 0 | 正气不足:2 |'));
    assert.match(md, /资格通过数按已核原返回分支推导，不是额外函数探针/);
});

test('精神29零问话費且未检查资格；空样本或错误不伪造零费用/零收剑', () => {
    const c = pick('jing29'), missing = pick('gift-repeat');
    const e = effects(c, { jing_cost: 0, results: { 'jing-low': 2 } });
    const diagnostics = ['error', 'not_applicable'].map((outcome, index) => ({ condition_id: c.id, outcome,
        raw: { kind: 'sample', condition_id: c.id, method: c.method, index, elapsed: 0.02,
            outcome, reason: 'Synthetic diagnostic boundary, not original evidence.' } }));
    const unknown = mingjiaoGiftEffects(diagnostics, c);
    assert.equal(unknown.validated, 0); assert.equal(unknown.unknown, 2);
    assert.equal(unknown.player_receipts, null); assert.equal(unknown.jing_cost, null);
    const md = schoolCombatMarkdown(report([condition(c, e, counts(0, 2), 2),
        condition(missing, mingjiaoGiftEffects([], missing))]));
    assert.ok(line(md, c.id).includes(' | 0/0 | 0/0 | 0 | 精神不足:2 |'));
    assert.ok(line(md, missing.id).includes(' | 0/2 | 0/0/0/0/2 | 未观测 | 未观测 | 未观测 | 未观测 | 未观测 | 未观测 | 0/0 |'));
    const umd = schoolCombatMarkdown(report([condition(c, unknown, counts(0, 0, 1, 1), 2)]));
    assert.ok(line(umd, c.id).includes(' | 0/0/1/1/0 | 未观测 | 未观测 | 未观测 | 未观测 | 未观测 | 未观测 | 0/2 |'));
    const bad = structuredClone(diagnostics); bad[0].raw.condition_id += '-wrong';
    assert.throws(() => mingjiaoGiftEffects(bad, c));
    assert.match(umd, /错误、不适用与缺样不补零/);
});

test('新物品专表与原拜师并排，不改变旧拜师行且不污染JSON', () => {
    const old = { id: 'legacy-recruit-summary-fixture', recorded: 2, planned: 2, missing: 0,
        counts: counts(2), effects: null, sides: null, mingjiao_recruit: { validated: 2, unknown: 0,
            commands: 4, commands_accepted: 4, command_execution_cost: 500,
            formal_apprenticeships: 2, first_joins: 2, repeated_greetings: 2, cancellations: 0,
            betrayer_confirmations: 0, results: { recruited: 2, greeted: 2 } } };
    const c = pick('capacity3999'), added = condition(c, mingjiaoGiftEffects([], c));
    const previous = schoolCombatMarkdown(report([old])), r = report([old, added]), saved = JSON.stringify(r);
    const next = schoolCombatMarkdown(r);
    assert.equal(line(next, old.id), line(previous, old.id));
    assert.equal(next.split('\n').filter(s => s.startsWith('| ' + old.id + ' |')).length, 1);
    assert.equal(next.split('\n').filter(s => s.startsWith('| ' + c.id + ' |')).length, 1);
    assert.equal(JSON.stringify(r), saved);
});
