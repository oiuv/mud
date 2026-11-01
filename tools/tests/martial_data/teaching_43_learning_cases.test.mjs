import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scanSource, sha256 } from './inventory.mjs';
import { teaching43Teachers, teaching43LearningConditions, validateTeaching43LearningRecord } from './teaching_43_learning_cases.mjs';

const read = path => readFileSync(new URL('../../../' + path, import.meta.url), 'utf8');
function conditions() {
    const objects = teaching43Teachers.map(t => {
        const fn = scanSource(read(t.path)).functions.find(f => f.name === 'recognize_apprentice');
        assert.ok(fn);
        return { path: t.path, gates: [{ function: fn.name,
            evidence: { path: t.path, sha256: sha256(read(t.path)), line: fn.line,
                start: fn.start, end: fn.end } }] };
    });
    const skills = [...new Set(teaching43Teachers.map(t => t.skill))]
        .map(s => ({ path: `kungfu/skill/${s}.c` }));
    return teaching43LearningConditions({ objects }, { skills }, read);
}

function sample(c) {
    const p = c.parameters, props = p.actor.properties;
    const before = { ...props, object: '/tests/teaching_actor#2',
        skills: { ...p.actor.skills }, learned: {}, mappings: {}, contribution: 0,
        effective_int: props.int, family: props.family?.family_name ?? null,
        master_id: props.family?.master_id ?? null };
    const after = structuredClone(before);
    after.learned[p.skill] = 4;
    after.jing -= Math.trunc(200 / props.int);
    after.learned_points++;
    return { kind: 'sample', condition_id: c.id, method: 'teaching', outcome: 'observed',
        before: [before], after: [after], teaching: [{ command: p.action,
            teacher_program: p.teacher.path, teacher: p.teacher.path + '#3', student: before.object,
            command_accepted: 1, teacher_skills: { [p.skill]: p.teacher_level },
            teacher_no_teach: { kind: 'none' }, before: structuredClone(before), after: structuredClone(after) }] };
}

test('22 source-pinned teachers have complete learn commands and distinct original masters', () => {
    const cs = conditions();
    assert.equal(cs.length, 22);
    assert.equal(new Set(cs.map(c => c.id)).size, 22);
    for (const c of cs) {
        assert.equal(c.samples, 100);
        assert.equal(c.parameters.actor.skills[c.parameters.skill], 50);
        assert.notEqual(c.parameters.actor.properties.family?.master_id, c.parameters.teacher.id);
        assert.ok(c.parameters.qualification_evidence.every(e => /^[a-f0-9]{64}$/.test(e.sha256)));
        validateTeaching43LearningRecord(sample(c), c);
    }
});

test('source drift and missing teacher declaration cannot become a configured case', () => {
    const c = conditions()[0];
    assert.throws(() => teaching43LearningConditions({ objects: [] }, { skills: [] }, read));
    assert.throws(() => teaching43LearningConditions({ objects: [] }, { skills: [] },
        path => path === c.parameters.teaching_entry.path ? read(path) + '\n' : read(path)), /changed teacher/);
});

test('proficiency includes the original improve_skill level conversion, not just the learn random roll', () => {
    const c = conditions().find(c => c.parameters.teacher.id === 'zhuo bufan');
    for (const amount of [3, 17]) {
        const r = sample(c); r.teaching[0].after.learned.sword = amount; r.after[0].learned.sword = amount;
        validateTeaching43LearningRecord(r, c);
    }
    for (const amount of [2, 18, 25]) {
        const r = sample(c); r.teaching[0].after.learned.sword = amount; r.after[0].learned.sword = amount;
        assert.throws(() => validateTeaching43LearningRecord(r, c), /proficiency range/);
    }
});

test('specialized recognition reader rejects wrong route, actor, skill, state and costs', () => {
    const c = conditions().find(c => c.parameters.teacher.id === 'fan song');
    for (const mutate of [
        r => { r.teaching[0].command = 'learn fan song 1'; },
        r => { r.teaching[0].teacher = '/kungfu/class/riyue/zhao#3'; },
        r => { r.teaching[0].teacher_program = '/kungfu/class/riyue/zhao'; },
        r => { r.teaching[0].student = '/tests/actor#4'; },
        r => { r.teaching[0].before.master_id = c.parameters.teacher.id; },
        r => { r.teaching[0].teacher_skills.axe--; },
        r => { r.teaching[0].teacher_no_teach.kind = 'expression'; },
        r => { r.teaching[0].after.learned.axe = 0; r.after[0].learned.axe = 0; },
        r => { r.teaching[0].after.jing++; r.after[0].jing++; },
        r => { r.teaching[0].after.learned_points = 0; },
        r => { r.teaching[0].after.master_id = 'fan song'; },
        r => { r.after[0].skills.axe++; },
        r => { r.teaching[0].before.effective_int++; },
        r => { r.teaching[0].before.shen = 0; r.before[0].shen = 0; },
        r => { r.teaching[0].before.character = '光明磊落'; },
        r => { r.teaching[0].before.potential = 0; r.before[0].potential = 0; },
        r => { r.before[0].learned_points++; },
        r => { r.before[0].gender = '无性'; },
        r => { r.outcome = 'refused'; },
    ]) {
        const r = sample(c); mutate(r);
        assert.throws(() => validateTeaching43LearningRecord(r, c));
    }
});
