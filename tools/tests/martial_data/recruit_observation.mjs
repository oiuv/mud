import assert from 'node:assert/strict';

// Read original command results. Initial quest qualifications may be configured;
// pending apprentice/recruit objects may only originate in the original commands.
export function validateRecruitObservation(steps, condition) {
    const p = condition.parameters;
    assert.equal(p.teaching_kind, 'apprenticeship');
    assert.equal(steps.length, p.teaching_expectations.length);
    const out = [], initial = p.actor.properties;
    let previous;
    for (const [i, step] of steps.entries()) {
        const e = p.teaching_expectations[i], b = step.before, a = step.after;
        assert.equal(e.command_kind, 'apprentice');
        assert.equal(step.teacher_program, p.teacher.path);
        assert.ok(step.teacher.startsWith(p.teacher.path + '#'));
        assert.equal(step.command, e.action ?? p.action);
        assert.equal(step.command_accepted, e.command_accepted);
        assert.ok(Number.isFinite(step.elapsed) && step.elapsed >= 0);
        assert.ok(Number.isSafeInteger(step.wall_time) && step.wall_time > 0);
        assert.deepEqual(step.teacher_family, p.teacher_family);
        for (const s of [b, a]) {
            assert.ok(s.recruitment && typeof s.recruitment === 'object');
            assert.ok(typeof s.recruitment.family === 'object' && !Array.isArray(s.recruitment.family));
            for (const key of ['name', 'class', 'title', 'pending_apprentice', 'pending_betrayer'])
                assert.equal(typeof s.recruitment[key], 'string', key);
        }
        if (previous) {
            assert.deepEqual(b, previous.after, '拜师步骤之间不得改写角色状态');
            assert.equal(step.student, previous.student);
            assert.equal(step.teacher, previous.teacher);
        } else {
            assert.deepEqual(b.recruitment.family, initial.family || {});
            assert.equal(b.recruitment.name, initial.name);
            assert.equal(b.recruitment.class, initial.class);
            assert.equal(b.recruitment.pending_apprentice, '');
            assert.equal(b.recruitment.pending_betrayer, '');
            assert.deepEqual(b.recruitment.flags, Object.fromEntries(
                ['have_letter', 'apprentice_ok', 'valid_in_fumoquan'].map(k => [k, p.actor.temp?.[k] ?? 0])));
            for (const [key, value] of Object.entries(p.actor.skills)) assert.equal(b.skills[key], value, key);
            assert.deepEqual(b.mappings, p.actor.mappings);
            for (const key of ['shen', 'str', 'con', 'dex', 'int', 'jing', 'neili', 'max_neili',
                'combat_exp', 'potential', 'learned_points']) assert.equal(b[key], initial[key], key);
            assert.equal(b.contribution, initial.gongxian);
            assert.equal(b.effective_int, initial.int, '本组无识字或转世悟性加成');
            assert.equal(b.effective_force, Math.trunc(p.actor.skills.force / 2));
        }
        const actualFamily = { ...a.recruitment.family };
        if (e.recruited || actualFamily.enter_time) {
            assert.ok(actualFamily.enter_time > 0 && actualFamily.enter_time <= step.wall_time + 1,
                '拜师必须写真实时间');
            delete actualFamily.enter_time;
        }
        assert.deepEqual(actualFamily, e.family_after, '实际师承与原招收规则不符');
        assert.equal(a.recruitment.name, e.name_after);
        assert.equal(a.recruitment.class, e.class_after ?? b.recruitment.class, '身份须符合原收徒逻辑，不冒充已剃度');
        assert.deepEqual(a.recruitment.flags, e.flags_after);
        assert.equal(a.recruitment.pending_apprentice, e.pending_apprentice ? step.teacher : '');
        assert.equal(a.recruitment.pending_betrayer, e.pending_betrayer ? step.teacher : '');
        assert.equal(step.teacher_pending_recruit, '', 'NPC不得留下未记录的招收意向');
        const recruited = a.recruitment.family.master_id === p.teacher.id
            && (b.recruitment.family.master_id !== a.recruitment.family.master_id
                || b.recruitment.family.master_name !== a.recruitment.family.master_name);
        assert.equal(recruited, e.recruited, '受理或请安不等于新拜师');
        if (!recruited) assert.equal(a.recruitment.title, b.recruitment.title);
        else assert.ok(a.recruitment.title.startsWith(p.teacher_family.family_name)
            && a.recruitment.title.endsWith(e.family_after.title));
        assert.equal(b.contribution - a.contribution, e.contribution_spent);
        for (const key of ['skills', 'learned', 'mappings', 'jing', 'neili', 'max_neili', 'max_jingli',
            'potential', 'learned_points', 'shen', 'str', 'con', 'dex', 'int', 'effective_int',
            'combat_exp', 'weiwang', 'reborn_family', 'shaolin_flags', 'grants'])
            assert.deepEqual(a[key], b[key], '拜师改变未声明状态：' + key);
        for (const [key, property] of [['family', 'family_name'], ['master_id', 'master_id'], ['master_name', 'master_name']])
            assert.equal(a[key] || 0, a.recruitment.family[property] || 0, '公共与完整师承快照不一致');
        assert.equal(step.message_scope, 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(step.messages));
        for (const m of step.messages) { assert.equal(typeof m.category, 'string'); assert.equal(typeof m.text, 'string'); }
        out.push({ command_kind: 'apprentice', recruited, advanced: recruited, acquired: recruited,
            already_known: b.recruitment.family.master_id === p.teacher.id, contribution_spent: e.contribution_spent,
            jing_spent: b.jing - a.jing, known_issue: p.known_issue });
        previous = step;
    }
    return out;
}
