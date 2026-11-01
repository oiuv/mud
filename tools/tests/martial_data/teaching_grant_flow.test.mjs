import test from 'node:test';
import assert from 'node:assert/strict';
import { scanSource, sha256 } from './inventory.mjs';
import { digest } from './ledger.mjs';
import { verifyTeachingGrantFlow } from './teaching_crosswalk.mjs';

function fixture({ array = false, multi = false, duplicate = false } = {}) {
    const grant = array ? 'can_perform/dugu-jiujian' : 'can_perform/skill/hit';
    const fn = multi ? 'accept_object' : array ? 'accept_ask' : 'ask_riyue';
    const statement = `me->set("${grant}", ${array ? 'learned' : '1'});`;
    const source = `int ${fn}(object me) { ${statement} ${duplicate ? statement : ''} return 1; }`;
    const call = scanSource(source).calls.find(c => c.name === 'set');
    const path = 'kungfu/class/a/target.c', hash = sha256(source);
    const item = { kind: 'grant', role: 'player_grant_candidate', teacher: path, function: fn, grant,
        source: { path, sha256: hash, start: call.start, end: call.end } };
    const target = { path: '/kungfu/class/a/target', id: 'target', sha256: hash };
    const targetEntry = { path, sha256: hash, function: fn, role: 'teaching' };
    const primary = { path: '/kungfu/class/a/sender', id: 'sender', sha256: 'b'.repeat(64) };
    const primaryEntry = { path: 'kungfu/class/a/sender.c', sha256: primary.sha256,
        function: 'give_letter', role: 'teaching' };
    const action = multi ? 'ask sender about letter' : array ? 'ask target about 破剑式' : 'ask target about lesson';
    const targetCommand = multi ? 'give letter to target' : action;
    const expectations = multi ? [{ action }, { action: targetCommand, teacher: target, teaching_entry: targetEntry }]
        : [{ action }];
    const condition = { id: 'grant-flow', method: 'teaching', samples: 2, parameters: {
        teacher: multi ? primary : target, teaching_entry: multi ? primaryEntry : targetEntry,
        ...(array ? { teaching_profile: 'feng' } : {}), teaching_kind: array ? 'weapon_knowledge' : 'lesson',
        ...(array ? { topic: '破剑式', knowledge_types: ['sword'] } : {}),
        action, teaching_expectations: expectations, monitored_grants: [grant],
        qualification_evidence: [{ path, sha256: hash }],
    } };
    const reference = { condition: condition.id, condition_sha256: digest(condition),
        smoke: false, process_complete: true, complete: true, passed: 2 };
    const step = (teacher, command, before, after) => ({ command, command_accepted: 1,
        teacher_program: teacher.path, teacher: teacher.path + '#3', student: '/tests/actor#2',
        before: { grants: { [grant]: before } }, after: { grants: { [grant]: after } } });
    const rows = [0,1].map(index => ({ condition_id: condition.id, index, raw_sha256: String(index), raw: {
        outcome: 'observed', before: [{ object: '/tests/actor#2' }], after: [{ object: '/tests/actor#2' }],
        teaching: [...(multi ? [step(primary, action, 0, 0)] : []),
            step(target, targetCommand, 0, array ? ['sword'] : 1)],
    } }));
    return { item, condition, reference, rows, source, entries: multi ? [primaryEntry, targetEntry] : [targetEntry] };
}
const verify = f => verifyTeachingGrantFlow(f.item, f.condition, f.reference, f.rows, f.source, f.entries);

test('unique setter plus actual acquisition links a side reward without widening the ordinary span join', () => {
    const f = fixture();
    const r = verify(f);
    assert.equal(r.link_type, 'unique_grant_write_in_verified_flow');
    assert.equal(r.matching_records.length, 2);
    assert.ok(r.matching_records.every(r => r.before === 0 && r.after === 1));
});

test('multi-teacher handoff uses the frozen receiving step, never the initial teacher name', () => {
    const f = fixture({ multi: true });
    const r = verify(f);
    assert.ok(r.matching_records.every(r => r.step === 1 && r.command === 'give letter to target'));
    for (const mutate of [
        f => { delete f.condition.parameters.teaching_expectations[1].teacher; },
        f => { delete f.condition.parameters.teaching_expectations[1].teaching_entry; },
        f => { f.entries = f.entries.slice(0,1); },
        f => { f.rows[0].raw.teaching[1].teacher_program = '/other'; },
        f => { f.rows[0].raw.teaching[1].student = '/tests/other#4'; },
    ]) {
        const bad = structuredClone(f); mutate(bad);
        bad.reference.condition_sha256 = digest(bad.condition);
        assert.throws(() => verify(bad));
    }
});

test('Dugu array acquisition preserves the reviewed topic membership, not a boolean permission', () => {
    const f = fixture({ array: true });
    assert.deepEqual(verify(f).matching_records[0].after, ['sword']);
    for (const mutate of [
        f => { f.rows[0].raw.teaching[0].after.grants[f.item.grant] = ['blade']; },
        f => { f.condition.parameters.knowledge_types = ['blade']; },
        f => { f.condition.parameters.topic = 'unreviewed'; },
        f => { f.condition.parameters.teaching_profile = 'ordinary'; },
    ]) {
        const bad = structuredClone(f); mutate(bad);
        bad.reference.condition_sha256 = digest(bad.condition);
        assert.throws(() => verify(bad));
    }
});

test('no transition, missing state, wrong route, source and formal identity cannot prove the declaration', () => {
    for (const mutate of [
        f => { f.reference.smoke = true; },
        f => { f.reference.process_complete = false; },
        f => { f.reference.complete = false; },
        f => { f.reference.passed = 1; },
        f => { f.reference.condition = 'other'; },
        f => { f.reference.condition_sha256 = 'bad'; },
        f => { f.rows.pop(); },
        f => { f.rows[1].index = 0; },
        f => { f.rows[0].raw.outcome = 'refused'; },
        f => { f.rows[0].raw.teaching[0].command = 'ask target about other'; },
        f => { f.rows[0].raw.teaching[0].teacher = '/kungfu/class/a/target#fake'; },
        f => { f.rows[0].raw.teaching[0].command_accepted = 0; },
        f => { delete f.rows[0].raw.teaching[0].before.grants[f.item.grant]; },
        f => { for (const r of f.rows) r.raw.teaching[0].before.grants[f.item.grant] = 1; },
        f => { for (const r of f.rows) r.raw.teaching[0].after.grants[f.item.grant] = 0; },
        f => { f.source += ' '; },
        f => { f.item.source.start++; },
        f => { f.item.function = 'another_function'; },
        f => { f.item.role = 'npc_initial_grant'; },
        f => { f.condition.parameters.qualification_evidence = []; },
        f => { f.condition.parameters.monitored_grants = []; },
        f => { f.condition.parameters.teaching_profile = 'probe'; },
    ]) {
        const f = fixture(); mutate(f);
        if (!['other', 'bad'].includes(f.reference.condition) && f.reference.condition_sha256 !== 'bad')
            f.reference.condition_sha256 = digest(f.condition);
        assert.throws(() => verify(f));
    }
    assert.throws(() => verify(fixture({ duplicate: true })), /not unique/);
});
