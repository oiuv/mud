// Completion of an observation is not proof that the game's challenge succeeded.
import assert from 'node:assert/strict';

export function validateChallengeObservation(steps, condition) {
    const p = condition.parameters;
    assert.equal(p.teaching_kind, 'formation_challenge');
    assert.equal(p.actor.temp, undefined, '不允许注入阵法状态');
    assert.equal(steps.length, 2);
    return steps.map((s, i) => {
        const expected = p.teaching_expectations[i], end = s.immediate_after ?? s.after;
        assert.equal(s.teacher_program, expected.teacher.path);
        assert.match(s.teacher, new RegExp('^' + expected.teacher.path + '#\\d+$'));
        assert.equal(s.command, expected.action); assert.equal(s.command_accepted, 1);
        assert.equal(s.student, steps[0].student);
        assert.deepEqual(s.before.skills, p.actor.skills);
        assert.deepEqual(end.skills, s.before.skills);
        assert.deepEqual(end.mappings, p.actor.mappings);
        assert.equal(s.before.formation.requested, 0);
        const f = end.formation;
        assert.equal(f.requested, 1); assert.equal(f.assigned, 'left');
        assert.equal(f.teacher_room, '/d/shaolin/wuchang');
        assert.equal(f.winner, 0); assert.equal(f.fighting, 0);
        assert.equal(f.timers.waiting, 1);
        assert.deepEqual(Object.keys(f.roster).sort(), [...expected.formation.roster].sort());
        for (const [program, rows] of Object.entries(f.roster)) {
            assert.equal(rows.length, 1); assert.equal(rows[0].program, program);
            assert.equal(rows[0].room, expected.formation.field);
            assert.equal(rows[0].clone, 1); assert.equal(rows[0].living, 1);
        }
        const askCost = s.before.jing - end.jing;
        assert.ok(askCost >= 10 && askCost <= 19);
        assert.equal(s.after.contribution, s.before.contribution);
        assert.equal(s.message_scope, 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(s.messages));
        if (!i) assert.equal(s.before.combat_exp, p.actor.properties.combat_exp);
        else {
            for (const k of ['jing', 'neili', 'skills', 'mappings', 'combat_exp', 'family'])
                assert.deepEqual(s.before[k], steps[i-1].after[k], '命令间不得重置状态');
        }
        return { command_kind: 'ask', advanced: true, acquired: false,
            contribution_spent: 0, jing_spent: s.before.jing - s.after.jing, ask_jing_spent: askCost };
    });
}

export function validateChallengeRecord(raw, condition) {
    const p = condition.parameters, frames = raw.challenge_timeline;
    assert.ok(Array.isArray(frames) && frames.length > 1, '缺少原回调时间序列');
    const final = frames.at(-1);
    assert.equal(frames[0].find_player_same, 1, '挑战开始前必须登记真实角色');
    for (const f of Object.values(frames[0].hosts)) {
        assert.equal(f.requested, 1); assert.equal(f.fighting, 0);
        assert.equal(f.beat_count, 0); assert.equal(f.winner, 0);
        assert.equal(f.student_room, '/d/shaolin/wuchang');
    }
    assert.ok(final.elapsed >= p.observe_seconds, '不得缩短挑战观察窗口');
    let elapsed = -1;
    for (const frame of frames) {
        assert.ok(Number.isFinite(frame.elapsed) && frame.elapsed > elapsed);
        elapsed = frame.elapsed;
        assert.deepEqual(Object.keys(frame.hosts).sort(), ['xuan-ku', 'xuan-nan']);
        if (p.challenge_scenario === 'low-health') {
            for (const key of ['living', 'ghost', 'find_player_same'])
                assert.ok([0, 1].includes(frame[key]), '缺少角色状态：' + key);
            // Original unconsciousness disables commands. The isolated host
            // uses Root UID, so the game's account-UID fallback may not find
            // this disabled actor. Record it; do not replace find_player.
            if (!frame.find_player_same) {
                assert.equal(frame.living, 0, '清醒角色丢失不能当作昏迷');
                assert.ok(raw.terminals.some(t => t.side === 0
                    && ['unconscious', 'death'].includes(t.state)), '缺少原昏迷或死亡回调');
            }
        } else assert.equal(frame.find_player_same, 1, '原find_player必须找到真实角色');
        for (const [name, f] of Object.entries(frame.hosts)) {
            assert.ok(['', 'left'].includes(f.assigned));
            assert.ok([0,1].includes(f.winner)); assert.ok([0,1].includes(f.fighting));
            assert.ok(Number.isSafeInteger(f.beat_count) && f.beat_count >= 0);
            assert.deepEqual(f.family, p.actor.properties.family);
            assert.deepEqual(Object.keys(f.roster).sort(), [...p.challenge_rosters[name]].sort());
            for (const [program, rows] of Object.entries(f.roster)) {
                assert.equal(rows.length, 1); assert.equal(rows[0].program, program);
                assert.equal(rows[0].clone, 1);
                assert.match(rows[0].room, /^\/d\/shaolin\/(wuchang[12]?|luohan[1-9]|banruo[1-9])$/);
            }
            for (const k of ['waiting', 'preparing', 'fighting', 'do_back', 'do_recruit'])
                assert.ok([0,1].includes(f.timers[k]), '主持原回调计数缺失');
        }
        assert.equal(frame.hosts['xuan-ku'].beat_count, frame.hosts['xuan-nan'].beat_count);
        assert.equal(frame.hosts['xuan-ku'].winner, frame.hosts['xuan-nan'].winner);
    }
    assert.equal(raw.challenge_walks.length, 6);
    const firstKu = p.challenge_order[0] === 'xuan-ku';
    const route = firstKu ? ['luohan5', 'wuchang2', 'wuchang', 'wuchang1', 'banruo5', 'wuchang1', 'wuchang']
        : ['banruo5', 'wuchang1', 'wuchang', 'wuchang2', 'luohan5', 'wuchang2', 'wuchang'];
    raw.challenge_walks.forEach((s,i) => {
        assert.equal(s.before, '/d/shaolin/' + route[i]); assert.equal(s.after, '/d/shaolin/' + route[i+1]);
        assert.equal(s.command, 'go ' + ((i < 4) === firstKu ? 'west' : 'east'));
        assert.equal(s.accepted, 1);
    });
    assert.equal(final.qi, raw.after[0].qi);
    assert.equal(final.combat_exp, raw.teaching.at(-1).after.combat_exp);
    assert.ok(Array.isArray(raw.challenge_messages));
    for (const a of raw.attacks) {
        assert.equal(a.target, 0); assert.equal(a.actor, -1);
        assert.ok(Object.values(p.challenge_rosters).flat().includes(a.actor_program));
        assert.equal(a.target_program, '/tests/teaching_actor');
        assert.ok(Number.isFinite(a.elapsed) && a.elapsed <= final.elapsed);
    }
    const reward = final.combat_exp - p.actor.properties.combat_exp;
    assert.ok(Number.isSafeInteger(reward) && reward >= 0 && reward % 7500 === 0);
    return { winner: final.hosts['xuan-ku'].winner, experience_reward: reward,
        attacks: raw.attacks.length, unique_attackers: new Set(raw.attacks.map(a => a.actor_program)).size,
        max_beat_count: Math.max(...frames.map(f => f.hosts['xuan-ku'].beat_count)),
        final_fighting: final.hosts['xuan-ku'].fighting,
        assigned_hosts: Object.values(final.hosts).filter(f => f.assigned).length,
        final_exits: Object.keys(final.exits).sort(), elapsed: final.elapsed };
}
