import assert from 'node:assert/strict';

export function validateTonsureObservation(steps, condition) {
    const p = condition.parameters, initial = p.actor.properties, out = [];
    const emei = p.teaching_profile === 'emei-tonsure';
    assert.equal(p.teaching_kind, 'ordination');
    assert.equal(p.actor.temp, undefined, '剃度许可须来自原询问');
    assert.equal(p.tonsure_name, initial.name);
    assert.equal(steps.length, p.teaching_expectations.length);
    let previous;
    for (const [i, s] of steps.entries()) {
        const e = p.teaching_expectations[i], b = s.before, a = s.after;
        assert.equal(s.command, e.action); assert.equal(s.command_accepted, e.command_accepted);
        assert.equal(s.teacher_program, p.teacher.path);
        assert.ok(s.teacher.startsWith(p.teacher.path + '#'));
        assert.ok(Number.isFinite(s.elapsed) && s.elapsed >= 0);
        assert.equal(s.offered_item, undefined);
        for (const v of [b, a]) {
            assert.ok(v.tonsure && v.tonsure.recruitment);
            for (const k of ['PKS', 'MKS', 'K_record', 'shen_record', 'pending'])
                assert.ok(Number.isSafeInteger(v.tonsure[k]), k);
            assert.equal(v.tonsure.gender, initial.gender);
            assert.equal(typeof v.tonsure.id, 'string');
            assert.ok(v.tonsure.id.length > 0);
            for (const k of ['name_ids', 'original_name_ids']) assert.equal(typeof v.tonsure[k], 'string');
            assert.equal(v.tonsure.name_ids, v.tonsure.id, '当前姓名必须登记给实际角色');
        }
        if (previous) {
            assert.deepEqual(b, previous.after, '剃度步骤之间不能更改身份或许可');
            assert.equal(s.student, previous.student); assert.equal(s.teacher, previous.teacher);
        } else {
            assert.equal(b.tonsure.pending, 0);
            for (const k of ['PKS', 'MKS', 'K_record', 'shen_record']) assert.equal(b.tonsure[k], initial[k]);
            assert.equal(b.tonsure.original_name_ids, b.tonsure.id);
            assert.equal(b.tonsure.recruitment.name, initial.name);
            assert.equal(b.tonsure.recruitment.class, initial.class);
            assert.equal(b.tonsure.recruitment.title, initial.title);
            assert.deepEqual(b.tonsure.recruitment.family, initial.family || {});
            assert.deepEqual(b.skills, p.actor.skills); assert.deepEqual(b.mappings, p.actor.mappings);
            for (const k of ['jing', 'neili', 'max_neili', 'shen', 'str', 'con', 'int', 'dex', 'potential', 'learned_points', 'combat_exp'])
                assert.equal(b[k], initial[k], k);
            assert.equal(b.contribution, initial.gongxian);
        }
        assert.equal(a.tonsure.pending, e.pending);
        if (emei) {
            for (const v of [b, a]) {
                assert.equal(v.tonsure.purename, initial.purename || '');
                assert.equal(typeof v.tonsure.old_name, 'string');
                assert.ok(Number.isSafeInteger(v.tonsure.quit_pending));
                assert.equal(v.tonsure.secularize_pending, 0, '峨嵋还俗不能获得公共确认标记');
            }
            if (!previous) {
                assert.equal(b.tonsure.old_name, initial['marks/old_name']);
                assert.equal(b.tonsure.quit_pending, 0);
            }
            assert.equal(a.tonsure.quit_pending, e.quit_pending ?? 0);
            assert.equal(a.tonsure.old_name, e.tonsured
                ? initial.purename || b.tonsure.recruitment.name : b.tonsure.old_name);
        }
        const beforeRecruit = b.tonsure.recruitment, afterRecruit = a.tonsure.recruitment;
        const tonsured = beforeRecruit.class !== 'bonze' && afterRecruit.class === 'bonze';
        assert.equal(tonsured, !!e.tonsured, '不能以跪拜受理或更名提示冒充剃度');
        if (tonsured) {
            assert.equal(b.tonsure.pending, 1);
            const wanted = (emei ? ['灵', '文', '心', '妙'] : ['虚', '空', '明', '净'])
                .map(prefix => prefix + [...(emei && initial.purename || beforeRecruit.name)][0]);
            assert.ok(wanted.includes(afterRecruit.name), '法名来自原随机前缀和旧名首字');
            assert.equal(a.tonsure.original_name_ids, '', '旧姓名映射必须删除');
            assert.equal(a.tonsure.K_record, b.tonsure.PKS + b.tonsure.MKS);
            assert.equal(a.tonsure.shen_record, b.shen); assert.equal(a.shen, 0);
        } else {
            for (const k of ['name', 'class']) assert.equal(afterRecruit[k], beforeRecruit[k]);
            for (const k of ['K_record', 'shen_record', 'original_name_ids']) assert.equal(a.tonsure[k], b.tonsure[k]);
            assert.equal(a.shen, b.shen);
        }
        for (const k of ['family', 'title', 'pending_apprentice', 'pending_betrayer', 'flags'])
            assert.deepEqual(afterRecruit[k], beforeRecruit[k], '剃度不自动拜师：' + k);
        for (const k of ['PKS', 'MKS', 'id']) assert.equal(a.tonsure[k], b.tonsure[k]);
        for (const k of ['skills', 'learned', 'mappings', 'contribution', 'balance', 'neili', 'max_neili',
            'max_jingli', 'potential', 'learned_points', 'str', 'con', 'int', 'dex', 'combat_exp', 'grants',
            'family', 'master_id', 'master_name', 'reborn_family']) assert.deepEqual(a[k], b[k], k);
        const jing = b.jing - a.jing;
        if (e.command_kind === 'ask') assert.ok(jing >= 10 && jing <= 19);
        else { assert.ok((emei ? ['kneel', 'secularize'] : ['kneel']).includes(e.command_kind)); assert.equal(jing, 0); }
        assert.equal(s.message_scope, 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(s.messages));
        for (const m of s.messages) { assert.equal(typeof m.category, 'string'); assert.equal(typeof m.text, 'string'); }
        const permission = a.tonsure.pending > b.tonsure.pending;
        out.push({ command_kind: e.command_kind, advanced: permission || tonsured, acquired: tonsured,
            tonsured, permission_acquired: permission, new_name: tonsured ? afterRecruit.name : '',
            contribution_spent: b.contribution - a.contribution, jing_spent: jing });
        previous = s;
    }
    return out;
}
