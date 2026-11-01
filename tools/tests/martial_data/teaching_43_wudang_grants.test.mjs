import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scanSource, sha256 } from './inventory.mjs';
import { wudangGrantLessons, wudangGrantConditions } from './teaching_43_wudang_grants.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { validatorFor } from './collection_review.mjs';

const read = path => readFileSync(new URL('../../../' + path, import.meta.url), 'utf8');
function relations() {
    return { objects: [...new Set(wudangGrantLessons.map(d => d.file))].map(file => {
        const path = `kungfu/class/wudang/${file}.c`, source = read(path), hash = sha256(source);
        return { path, grants: scanSource(source).calls.filter(c => c.name === 'set'
            && c.args[0]?.value?.startsWith('can_perform/')).map(c => ({
                function: c.function, grant: c.args[0].value, role: 'player_grant_candidate',
                evidence: { path, sha256: hash, start: c.start, end: c.end, line: c.line } })) };
    }) };
}
const conditions = () => wudangGrantConditions(relations(), read);
const rewardSkills = {
    'mo-da': ['strike', 'zhenshan-zhang', 'martial-cognize'],
    'mo-sheng': ['sword', 'wudang-jian', 'martial-cognize'],
    'shan-zheng': ['strike', 'zhenshan-zhang', 'martial-cognize'],
    'song-ci': ['sword', 'shenmen-jian', 'martial-cognize'],
    'xi-huan': ['blade', 'xuanxu-dao', 'martial-cognize'],
    'yin-chuankong': ['sword', 'raozhi-roujian', 'martial-cognize'],
    'yu-juehu': ['claw', 'huzhua-shou', 'martial-cognize'],
};
function sample(c) {
    const p = c.parameters, props = p.actor.properties, key = p.monitored_grants[0];
    const before = { ...props, object: '/tests/teaching_actor#1',
        contribution: props.gongxian, family: props['family/family_name'], master_id: null, master_name: null,
        max_jingli: 1000, effective_force: Math.trunc(p.actor.skills.force / 2), effective_dodge: 0,
        effective_dex: props.dex,
        skills: structuredClone(p.actor.skills), learned: {}, mappings: {}, grants: { [key]: 0 } };
    const steps = [];
    for (const [i, expectation] of p.teaching_expectations.entries()) {
        const a = structuredClone(i ? steps.at(-1).after : before), b = structuredClone(a);
        b.jing -= 12; b.contribution -= expectation.contribution_spent;
        b.grants[key] = expectation.value;
        if (i === 0 && p.expected === 'observed') {
            for (const skill of rewardSkills[p.lesson]) {
                b.skills[skill] = (b.skills[skill] ?? 0) + 1;
                b.learned[skill] = 0;
            }
        }
        steps.push({ student: before.object, teacher: p.teacher.path + '#2', teacher_program: p.teacher.path,
            command: p.action, command_accepted: 1, elapsed: 0.01, before: a, after: b,
            message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: expectation.response_contains ? [{ category: 'say', text: expectation.response_contains }] : [] });
    }
    return { kind: 'sample', method: 'teaching', condition_id: c.id, outcome: p.expected,
        before: [before], after: [structuredClone(steps.at(-1).after)], teaching: steps,
        metrics: [{ jing_cost: steps.length * 12 }] };
}

test('seven source-pinned grants produce 56 conditions including exact thresholds and real repeat flows', async () => {
    const cs = conditions();
    assert.equal(cs.length, 56);
    assert.equal(new Set(cs.map(c => c.id)).size, 56);
    assert.equal(cs.reduce((n,c) => n+c.samples,0), 112);
    assert.equal(cs.filter(c => c.parameters.variant === 'grant').length, 7);
    for (const c of cs) {
        validateTeachingRecord(sample(c), c);
        (await validatorFor(c))(sample(c), c);
        assert.ok(c.parameters.qualification_sources.includes('feature/skill.c'));
    }
});

test('qualification/source drift and missing actual declaration cannot generate a lesson', () => {
    assert.throws(() => wudangGrantConditions({ objects: [] }, read), /declaration/);
    assert.throws(() => wudangGrantConditions(relations(), path => read(path) + '\n'), /changed Wudang/);
    const c = conditions()[0];
    for (const change of [
        p => { p.actor.properties['can_perform/zhenshan-zhang/da'] = 1; },
        p => { p.actor.skills['zhenshan-zhang'] = 200; },
        p => { p.teacher.sha256 = 'changed'; },
        p => { p.teaching_entry.function = 'other'; },
        p => { p.qualification_evidence = []; },
        p => { p.action = 'ask mo shenggu about wrong'; },
        p => { p.teaching_expectations[0].contribution_spent = 0; },
    ]) {
        const bad = structuredClone(c); change(bad.parameters);
        assert.throws(() => validateTeachingRecord(sample(bad), bad));
    }
});

test('actual reward is one level plus cleared proficiency, including Zhang Cuishan original wrong-skill write', () => {
    const c = conditions().find(c => c.parameters.lesson === 'shan-zheng' && c.parameters.variant === 'grant');
    const r = sample(c);
    validateTeachingRecord(r,c);
    assert.equal(r.after[0].skills['yitian-zhang'], 120);
    assert.equal(r.after[0].skills['zhenshan-zhang'], 1);
    for (const change of [
        s => { s.after.skills['zhenshan-zhang'] = 2; },
        s => { delete s.after.skills['zhenshan-zhang']; },
        s => { s.after.skills['yitian-zhang']++; },
        s => { s.after.learned['zhenshan-zhang'] = 1500000; },
        s => { s.after.skills.unrelated = 1; },
    ]) {
        const bad = structuredClone(r); change(bad.teaching[0]);
        bad.after[0] = structuredClone(bad.teaching[0].after);
        assert.throws(() => validateTeachingRecord(bad,c), /reward|proficiency|extra skill/);
    }
});

test('repeat cannot recharge or reward, and wrong actors/messages/outcomes/resources are rejected', () => {
    const c = conditions().find(c => c.parameters.lesson === 'mo-da' && c.parameters.variant === 'repeat');
    const r = sample(c);
    for (const change of [
        r => { r.teaching[1].after.skills.strike++; },
        r => { r.teaching[1].after.contribution--; },
        r => { r.teaching[1].before.grants[c.parameters.monitored_grants[0]] = 0; },
        r => { r.teaching[0].student = '/wrong'; },
        r => { r.teaching[0].command = 'ask other about lesson'; },
        r => { r.outcome = 'refused'; },
        r => { r.metrics[0].jing_cost = 0; },
        r => { r.teaching[1].after.neili--; },
    ]) {
        const bad = structuredClone(r); change(bad); assert.throws(() => validateTeachingRecord(bad,c));
    }
    const refused = conditions().find(c => c.parameters.variant === 'shen-low');
    const bad = sample(refused); bad.teaching[0].messages = [];
    assert.throws(() => validateTeachingRecord(bad, refused), /拒绝原因/);
});
