import assert from 'node:assert/strict';

const flagNames = ['have_letter', 'apprentice_ok', 'valid_in_fumoquan'];
const questItems = ['/d/shaolin/obj/damo-ling', ...[1,2,3,4].map(n => `/d/shaolin/obj/tuijianxin-${n}`)];
const itemIds = ['damo ling', ...[1,2,3,4].map(n => `tuijian xin${n}`)];
const count = (s, n) => s.promotion.items.filter(i => i.program === questItems[n]).length;
const comparable = s => {
    const copy = structuredClone(s);
    // Different NPCs have different HP and callbacks, but the student cannot reset.
    for (const key of Object.keys(copy.promotion)) if (key.startsWith('teacher_') || key === 'checking_pending')
        delete copy.promotion[key];
    return copy;
};

export function validatePromotionObservation(steps, condition) {
    const p = condition.parameters, initial = p.actor.properties, summaries = [];
    assert.equal(p.teaching_kind, 'promotion_quest');
    assert.equal(steps.length, p.teaching_expectations.length);
    assert.equal(p.actor.temp, undefined, '自然任务不允许预置许可');
    let previous;
    for (const [index, s] of steps.entries()) {
        const e = p.teaching_expectations[index], b = s.before, a = s.after;
        assert.equal(s.teacher_program, e.teacher.path);
        assert.ok(s.teacher.startsWith(e.teacher.path + '#'));
        assert.ok(p.qualification_evidence.some(f => f.path === e.teacher.path.slice(1) + '.c' && f.sha256 === e.teacher.sha256));
        assert.equal(s.command, e.action); assert.equal(s.command_accepted, e.command_accepted);
        assert.ok(Number.isFinite(s.elapsed) && s.elapsed >= 0);
        for (const state of [b, a]) {
            assert.ok(state.promotion && Array.isArray(state.promotion.items));
            assert.ok(state.promotion.recruitment && typeof state.promotion.recruitment.family === 'object');
            for (const key of ['student_qi', 'student_max_qi', 'teacher_qi', 'teacher_max_qi', 'checking_pending'])
                assert.ok(Number.isSafeInteger(state.promotion[key]), key);
            assert.equal(new Set(state.promotion.items.map(i => i.object)).size, state.promotion.items.length);
            for (const item of state.promotion.items) {
                const n = questItems.indexOf(item.program); assert.ok(n >= 0, '未知信物');
                assert.equal(item.id, itemIds[n]); assert.equal(item.clone, 1);
                assert.ok(item.object.startsWith(item.program + '#')); assert.equal(item.holder, s.student);
            }
        }
        assert.equal(b.promotion.teacher_name, e.teacher.name);
        assert.equal(b.promotion.teacher_family.generation, e.teacher.generation);
        if (previous) {
            assert.equal(s.student, previous.student);
            assert.deepEqual(comparable(b), comparable(previous.after), '任务步骤之间不能改写学生或信物');
            if (previous.teacher_program === s.teacher_program) assert.equal(previous.teacher, s.teacher);
        } else {
            assert.deepEqual(b.promotion.items, []); assert.equal(b.promotion.fight_ok, 0);
            assert.deepEqual(b.promotion.recruitment.flags, Object.fromEntries(flagNames.map(k => [k,0])));
            assert.deepEqual(b.promotion.recruitment.family, initial.family || {});
            assert.deepEqual(b.skills, p.actor.skills); assert.deepEqual(b.mappings, p.actor.mappings);
            for (const k of ['str', 'int', 'con', 'dex', 'jing', 'neili', 'max_neili', 'combat_exp', 'shen'])
                assert.equal(b[k], initial[k], k);
        }
        assert.equal(count(a, 0), e.tokens, '实际令牌数量');
        for (let n = 1; n <= 4; n++) assert.equal(count(a, n), e.letter === n ? 1 : 0, '实际推荐信');
        assert.equal(a.promotion.fight_ok, e.fight_ok);
        assert.deepEqual(a.promotion.recruitment.flags,
            { have_letter: e.have_letter, apprentice_ok: e.apprentice_ok, valid_in_fumoquan: 0 });
        for (const k of ['skills', 'mappings', 'str', 'con', 'dex', 'int', 'contribution', 'learned_points', 'potential'])
            assert.deepEqual(a[k], b[k], '流程改变未声明属性：' + k);
        const recruited = a.master_id !== b.master_id;
        assert.equal(recruited, !!e.recruited);
        if (recruited) {
            assert.equal(a.master_id, e.teacher.id); assert.equal(a.master_name, e.teacher.name);
            assert.equal(a.promotion.recruitment.name, e.name);
            assert.equal(a.promotion.recruitment.family.generation, e.generation);
            assert.equal(a.promotion.recruitment.family.family_name, '少林派');
            assert.ok(a.promotion.recruitment.family.enter_time > 0);
        } else assert.deepEqual(a.promotion.recruitment.family, b.promotion.recruitment.family);
        if (e.wait_fight) {
            assert.ok(s.wait_elapsed >= 1 && s.wait_elapsed < p.observe_seconds, '必须等待原切磋及回调');
            assert.equal(s.immediate_after.promotion.checking_pending, 1);
            assert.equal(s.immediate_after.promotion.fight_ok, 0);
            assert.equal(count(s.immediate_after, e.letter), 0, '回调前不能已有推荐信');
            assert.equal(a.promotion.checking_pending, 0);
            assert.equal(a.promotion.teacher_fighting, 0); assert.equal(a.promotion.student_fighting, 0);
            assert.ok(a.promotion.teacher_qi * 100 / a.promotion.teacher_max_qi <= 50, '需原战斗击败NPC');
            assert.ok(Array.isArray(s.wait_messages));
        } else {
            assert.equal(s.wait_elapsed, undefined);
            for (const k of ['neili', 'max_neili', 'combat_exp', 'shen']) assert.equal(a[k], b[k]);
            const jing = b.jing - a.jing;
            if (e.command_kind === 'ask') assert.ok(jing >= 10 && jing <= 19, '原询问消耗10至19精神');
            else assert.equal(jing, 0);
        }
        assert.equal(s.message_scope, 'receive_message_apply_input_not_full_transcript');
        for (const m of [...s.messages, ...(s.wait_messages ?? [])]) {
            assert.equal(typeof m.category, 'string'); assert.equal(typeof m.text, 'string');
        }
        const acquired = a.promotion.items.length > b.promotion.items.length;
        summaries.push({ command_kind: e.command_kind, advanced: acquired || recruited, acquired, recruited,
            contribution_spent: b.contribution - a.contribution, jing_spent: b.jing - a.jing,
            token_acquired: Math.max(0, count(a,0)-count(b,0)), letter_acquired: e.wait_fight ? 1 : 0,
            fight_completed: !!e.wait_fight, wait_elapsed: s.wait_elapsed ?? 0 });
        previous = s;
    }
    return summaries;
}
