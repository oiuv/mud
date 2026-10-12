import assert from 'node:assert/strict';
import test from 'node:test';
import { boutMarkdown, completeJsonl, summarizeBouts } from './bout_report.mjs';

const cleanRun = { complete: true, validation_errors: 0, incomplete_bytes: 0 };

function fixture(samples = 20) {
    const manifest = { fingerprint: 'fixed', versions: {}, identity: { execution: { smoke: false },
        conditions: [{ id: 'example', entry_id: 'skill:perform', method: 'bout', samples, parameters: {} }] } };
    const rows = Array.from({ length: samples }, (_, index) => ({ condition_id: 'example', index,
        outcome: 'observed', raw_sha256: 'hash-' + index, raw: {
            method: 'bout', winner: -1, first_actor: index % 2, elapsed: 30,
            before: [{ object: '/actor#1', qi: 100 }, { object: '/actor#2', qi: 100 }],
            after: [{ qi: 90, neili: 90 }, { qi: 70, neili: 100 }], busy_seconds: [0, 2],
            metrics: [{ qi_cost: 10, neili_cost: 20, neili_recovery: 10, perform_attempts: 3 },
                { qi_cost: 50, qi_recovery: 20 }],
            launches: [{ actor: '/actor#1' }, { actor: '/actor#2' }], refusals: [{ actor: '/actor#1' }],
        } }));
    return { manifest, rows };
}

test('只解析原始日志完整行，保留半行和截断 UTF-8，不吞完整坏行', () => {
    const first = Buffer.from('{"文字":"完整"}\n'), next = Buffer.from('{"文字":"下一条"}');
    const bytes = Buffer.concat([first, next.subarray(0, next.length - 4)]);
    const result = completeJsonl(bytes);
    assert.deepEqual(result.rows, [{ 文字: '完整' }]);
    assert.equal(result.incomplete_bytes, next.length - 4);
    assert.deepEqual(completeJsonl(Buffer.from('unfinished')), { rows: [], incomplete_bytes: 10 });
    assert.throws(() => completeJsonl(Buffer.from('{bad}\n')), SyntaxError);
});

test('未采满条件只列进度，不发布中途均值；记录满但未退出仍是快照', () => {
    const { manifest, rows } = fixture();
    const partial = summarizeBouts(manifest, rows.slice(0, 19), []);
    assert.equal(partial.state, 'partial_snapshot');
    assert.equal(partial.totals.sampled_conditions, 0);
    assert.equal(partial.conditions[0].state, 'incomplete');
    assert.match(boutMarkdown(partial), /\| example \| 19 \/ 20 \| incomplete \|/);
    assert.doesNotMatch(boutMarkdown(partial), /50\.00 \/ 20\.00 \/ 30\.00/);
    const pending = summarizeBouts(manifest, rows, []);
    assert.equal(pending.totals.sampled_conditions, 1);
    assert.equal(pending.state, 'partial_snapshot');
    assert.equal(summarizeBouts(manifest, rows, [cleanRun]).state, 'complete');
    assert.equal(summarizeBouts(manifest, rows, [{ ...cleanRun, incomplete_bytes: 2 }]).state, 'partial_snapshot');
    assert.equal(summarizeBouts(manifest, rows, [{ ...cleanRun, validation_errors: 1 }]).state, 'partial_snapshot');
});

test('未决不按血量判胜，支出、恢复、净下降及实际发动分别统计', () => {
    const { manifest, rows } = fixture();
    const report = summarizeBouts(manifest, rows, [cleanRun]), c = report.conditions[0];
    assert.equal(c.bouts.left_wins.successes, 0);
    assert.equal(c.bouts.right_wins.successes, 0);
    assert.equal(c.bouts.undecided, 20);
    assert.deepEqual(c.actual_first, { left: 10, right: 10 });
    assert.equal(c.net_qi_loss[1].mean, 30);
    assert.equal(c.sides[1].metrics.qi_cost.mean, 50);
    assert.equal(c.sides[1].metrics.qi_recovery.mean, 20);
    assert.equal(c.performer.attempts.mean, 3);
    assert.equal(c.performer.launches.mean, 1);
    assert.equal(c.performer.refusals.mean, 1);
    assert.match(boutMarkdown(report), /0 \/ 0 \/ 20 \| 10 \/ 10 \| 50\.00 \/ 20\.00 \/ 30\.00/);
});

test('缺失观察不填零，有观察器的稀疏计数才按零解释', () => {
    const { manifest, rows } = fixture(2);
    delete rows[0].raw.metrics; delete rows[0].raw.launches; delete rows[0].raw.before;
    rows[1].raw.metrics = [{}, {}]; rows[1].raw.launches = [];
    const c = summarizeBouts(manifest, rows, [cleanRun]).conditions[0];
    assert.equal(c.performer.attempts.n, 1);
    assert.equal(c.performer.attempts.unknown, 1);
    assert.equal(c.performer.attempts.mean, 0);
    assert.equal(c.performer.launches.n, 1);
    assert.equal(c.performer.launches.unknown, 1);
    assert.equal(c.net_qi_loss[1].unknown, 1);
});

test('拒绝、错误和混合不适用不计完整效果，未知条件状态不美化', () => {
    for (const outcome of ['refused', 'error', 'not_applicable']) {
        const { manifest, rows } = fixture(2);
        rows[0].outcome = outcome;
        const report = summarizeBouts(manifest, rows, [cleanRun]);
        assert.equal(report.state, 'partial_snapshot');
        assert.equal(report.totals.sampled_conditions, 0);
        assert.equal(report.conditions[0].state, 'requires_review');
    }
    const { manifest, rows } = fixture(2);
    for (const row of rows) row.outcome = 'not_applicable';
    const report = summarizeBouts(manifest, rows, [cleanRun]);
    assert.equal(report.totals.not_applicable_conditions, 1);
    assert.equal(report.conditions[0].normal_effect_denominator, 0);
    assert.equal(report.state, 'complete');
});

test('快照证据摘要不依赖文件枚举顺序，样本变化可识别', () => {
    const { manifest, rows } = fixture(2);
    const first = summarizeBouts(manifest, rows, [cleanRun]);
    assert.equal(summarizeBouts(manifest, [...rows].reverse(), [cleanRun]).evidence_snapshot_sha256,
        first.evidence_snapshot_sha256);
    rows[0].raw_sha256 = 'changed';
    assert.notEqual(summarizeBouts(manifest, rows, [cleanRun]).evidence_snapshot_sha256, first.evidence_snapshot_sha256);
});
