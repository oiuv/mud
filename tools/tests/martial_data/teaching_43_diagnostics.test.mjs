import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { teaching43DiagnosticConditions, validateTeaching43DiagnosticRecord } from './teaching_43_diagnostics.mjs';

const read = path => readFileSync(new URL('../../../' + path, import.meta.url), 'utf8');
const conditions = teaching43DiagnosticConditions(read);
function record(c) {
    const p = c.parameters;
    const r = { condition_id: c.id, method: 'teaching' };
    if (p.diagnostic_mode === 'original') return { ...r, outcome: 'error',
        reason: 'Bad argument 1 to ' + p.diagnostic_error,
        caught_error: { trace: [{ file: p.diagnostic_setup === 'singleton'
            ? '/tests/runner.lpc' : '/' + p.teaching_entry.path, function: p.teaching_entry.function }] } };
    const before = { object: '/tests/teaching_actor#2', skills: { force: 100 }, learned: {},
        jing: 10000, neili: 3000, learned_points: 0 };
    const after = { ...structuredClone(before), jing: 9985 };
    const teacher = p.teacher.path + (p.diagnostic_setup === 'singleton' ? '' : '#3');
    return { ...r, outcome: 'refused', before: [before], after: [after],
        teaching_context: { mode: 'prepared', setup: p.diagnostic_setup, teacher,
            owner: before.object, startroom: '/tests/runner', singleton: p.diagnostic_setup === 'singleton' ? 1 : 0 },
        teaching: [{ command: p.action, teacher_program: p.teacher.path, teacher,
            student: before.object, command_accepted: 1, before: structuredClone(before),
            after: structuredClone(after), messages: [{ text: p.diagnostic_response }] }] };
}

test('seven distinct old error routes have separate reproduction/prepared diagnostic pairs', () => {
    assert.equal(conditions.length, 14);
    assert.equal(new Set(conditions.map(c => c.id)).size, 14);
    assert.equal(conditions.filter(c => c.parameters.diagnostic_mode === 'original').length, 7);
    for (const c of conditions) validateTeaching43DiagnosticRecord(record(c), c);
    const girls = conditions.filter(c => c.parameters.teacher.id === 'ya huan');
    assert.equal(girls[0].parameters.topic, 'accept_ask');
    assert.equal(girls[1].parameters.topic, 'name');
});

test('diagnostic cannot silently accept success, an absent caught stack or invented initialization', () => {
    for (const c of conditions) {
        const r = record(c);
        if (c.parameters.diagnostic_mode === 'original') {
            delete r.caught_error;
            assert.throws(() => validateTeaching43DiagnosticRecord(r, c));
        } else {
            r.outcome = 'observed';
            assert.throws(() => validateTeaching43DiagnosticRecord(r, c));
            r.outcome = 'refused'; r.teaching_context.teacher = 'other';
            assert.throws(() => validateTeaching43DiagnosticRecord(r, c));
        }
    }
});
