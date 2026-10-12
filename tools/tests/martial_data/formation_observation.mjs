import assert from 'node:assert/strict';

export function validateFormationObservation(steps, condition) {
    const p = condition.parameters, initial = p.actor.properties;
    assert.equal(p.teaching_kind, 'formation_invitation');
    assert.equal(p.actor.temp, undefined, '不得注入询问或过阵标记');
    assert.equal(steps.length, 1);
    const s = steps[0], b = s.before, a = s.after, allowed = p.teaching_expectations[0].allowed;
    assert.equal(s.command, p.action); assert.equal(s.command_accepted, 1);
    assert.equal(s.teacher_program, p.teacher.path);
    assert.ok(s.teacher.startsWith(p.teacher.path + '#'));
    assert.ok(Number.isFinite(s.elapsed) && s.elapsed >= 0);
    assert.equal(s.offered_item, undefined);
    for (const v of [b, a]) {
        const f = v.formation;
        assert.ok(f && typeof f.student_id === 'string' && f.student_id.length > 0);
        assert.equal(f.student_room, '/tests/runner');
        for (const k of ['requested', 'other_requested', 'fighting', 'beat_count', 'winner', 'guilty'])
            assert.ok(Number.isSafeInteger(f[k]), k);
        assert.deepEqual(f.family, initial.family || {});
        assert.equal(f.guilty, initial.guilty); assert.equal(f.winner, initial.luohan_winner);
        for (const k of ['other_requested', 'fighting', 'beat_count']) assert.equal(f[k], 0);
        assert.equal(typeof f.assigned, 'string');
    }
    assert.equal(b.formation.requested, 0); assert.equal(b.formation.assigned, '');
    assert.equal(b.formation.teacher_room, '/tests/runner');
    assert.deepEqual(b.formation.roster, {});
    const emptyTimers = { waiting: 0, preparing: 0, fighting: 0, do_back: 0, do_recruit: 0 };
    assert.deepEqual(b.formation.timers, emptyTimers);
    assert.equal(a.formation.requested, allowed ? 1 : 0);
    assert.equal(a.formation.assigned, allowed ? a.formation.student_id : '');
    assert.equal(a.formation.student_id, b.formation.student_id);
    assert.equal(a.formation.teacher_room, allowed ? '/d/shaolin/wuchang' : '/tests/runner');
    assert.deepEqual(a.formation.timers, { ...emptyTimers, waiting: allowed ? 1 : 0 });
    assert.deepEqual(Object.keys(a.formation.roster).sort(), allowed ? [...p.formation.roster].sort() : []);
    for (const [program, found] of Object.entries(a.formation.roster)) {
        assert.equal(found.length, 1, '每个原罗汉只应召集一次');
        const r = found[0]; assert.equal(r.program, program);
        assert.ok(r.object.startsWith(program + '#')); assert.equal(r.clone, 1);
        assert.equal(r.living, 1); assert.equal(r.room, p.formation.field);
    }
    assert.deepEqual(b.skills, p.actor.skills); assert.deepEqual(b.mappings, p.actor.mappings);
    for (const k of ['jing', 'neili', 'max_neili', 'shen', 'str', 'con', 'int', 'dex', 'potential', 'learned_points', 'combat_exp'])
        assert.equal(b[k], initial[k], k);
    assert.equal(b.contribution, initial.gongxian);
    for (const k of ['skills', 'learned', 'mappings', 'contribution', 'balance', 'neili', 'max_neili',
        'max_jingli', 'potential', 'learned_points', 'str', 'con', 'int', 'dex', 'combat_exp', 'grants',
        'family', 'master_id', 'master_name', 'reborn_family', 'shen']) assert.deepEqual(a[k], b[k], k);
    const jing = b.jing - a.jing;
    assert.ok(jing >= 10 && jing <= 19);
    assert.equal(s.message_scope, 'receive_message_apply_input_not_full_transcript');
    assert.ok(Array.isArray(s.messages));
    for (const m of s.messages) { assert.equal(typeof m.category, 'string'); assert.equal(typeof m.text, 'string'); }
    if (p.observe_seconds) {
        assert.equal(p.known_issue, 'MA-103'); assert.equal(p.observe_seconds, 306);
        assert.ok(Number.isFinite(s.wait_elapsed) && s.wait_elapsed >= 305, '不得缩短原300秒等待');
        assert.deepEqual(s.wait_after, a.formation, 'MA-103须真实保留占用、九名罗汉及等待回调');
    } else { assert.equal(s.wait_after, undefined); assert.equal(s.wait_elapsed, undefined); }
    return [{ command_kind: 'ask', advanced: allowed, acquired: false, summoned: allowed,
        monks_summoned: Object.keys(a.formation.roster).length,
        wait_still_reserved: !!p.observe_seconds, wait_elapsed: s.wait_elapsed,
        contribution_spent: b.contribution - a.contribution, jing_spent: jing }];
}
