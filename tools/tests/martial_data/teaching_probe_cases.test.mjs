import test from 'node:test';
import assert from 'node:assert/strict';
import { teachingProbeConditions, buildTeachingProbePlan } from './teaching_probe_cases.mjs';
import { sha256 } from './inventory.mjs';

const samplePlan = {
    batches: [
        {
            group: 'test-school',
            declarations: 2,
            formal_samples: 4,
            smoke_samples: 4,
            entry_kind: 'mixed',
            rows: [
                {
                    declaration: 'gate:kungfu/class/test/a.c:kungfu/class/test/a.c:100',
                    kind: 'gate',
                    function: 'attempt_apprentice',
                    grant: null,
                    coverage: 'targeted_collection_candidate',
                    samples: 2,
                    plan_condition: 'recruit-flow observation on kungfu/class/test/a.c',
                    disposition_hint: 'test',
                },
                {
                    declaration: 'grant:kungfu/class/test/b.c:kungfu/class/test/b.c:200',
                    kind: 'grant',
                    function: 'ask_skill1',
                    grant: 'can_perform/test-skill/hit',
                    coverage: 'targeted_collection_candidate',
                    samples: 100,
                    plan_condition: 'ask-topic lesson on kungfu/class/test/b.c (ask_skill1)',
                    disposition_hint: 'test',
                },
            ],
        },
    ],
};

const sampleCrosswalk = {
    items: [
        {
            id: 'gate:kungfu/class/test/a.c:kungfu/class/test/a.c:100',
            kind: 'gate', teacher: 'kungfu/class/test/a.c', group: 'test-school',
            function: 'attempt_apprentice', grant: null,
            source: { path: 'kungfu/class/test/a.c', sha256: 'a'.repeat(64), line: 100, start: 500, end: 600 },
            teaching: [], effect: [], status: 'no_verified_formal_teaching_link',
        },
        {
            id: 'grant:kungfu/class/test/b.c:kungfu/class/test/b.c:200',
            kind: 'grant', teacher: 'kungfu/class/test/b.c', group: 'test-school',
            function: 'ask_skill1', grant: 'can_perform/test-skill/hit',
            source: { path: 'kungfu/class/test/b.c', sha256: 'b'.repeat(64), line: 200, start: 800, end: 900 },
            teaching: [], effect: [], status: 'no_verified_formal_teaching_link',
        },
    ],
};

const sources = {
    'kungfu/class/test/a.c': `void create() {
    set_name("测试甲", ({ "test a" }));
    set_skill("finger", 200);
    create_family("测试派", 1, "掌门");
}
void attempt_apprentice(object ob) {
    if (!permit_recruit(ob)) return;
    command("say 欢迎。");
}`,
    'kungfu/class/test/b.c': `void create() {
    set_name("测试乙", ({ "test b" }));
    set("inquiry", ([ "真传": (: ask_skill1 :) ]));
    create_family("测试派", 2, "长老");
}
int ask_skill1(object ob) {
    command("say 你想学什么？");
    return 1;
}`,
};

const readSource = path => {
    assert.ok(sources[path], 'unexpected source: ' + path);
    return sources[path];
};
for (const item of sampleCrosswalk.items) item.source.sha256 = sha256(readSource(item.source.path));

test('probe conditions generate correct structure for gate and grant items', () => {
    const conditions = teachingProbeConditions(samplePlan, sampleCrosswalk, readSource);
    assert.equal(conditions.length, 2);
    // Gate condition
    const gate = conditions[0];
    assert.match(gate.id, /^probe-test-school-/);
    assert.equal(gate.method, 'teaching');
    assert.equal(gate.parameters.teaching_profile, 'probe');
    assert.equal(gate.parameters.teacher.id, 'test a');
    assert.equal(gate.parameters.action, 'apprentice test a');
    assert.equal(gate.parameters.topic, '拜师');
    assert.equal(gate.samples, 2);
    assert.ok(gate.parameters.teaching_entry.path === 'kungfu/class/test/a.c');
    assert.ok(Array.isArray(gate.parameters.teaching_expectations));
    assert.deepEqual(gate.parameters.expected, ['observed', 'refused']);
    assert.equal(gate.parameters.actor.properties.family, undefined);
    // Grant condition
    const grant = conditions[1];
    assert.equal(grant.parameters.teacher.id, 'test b');
    assert.equal(grant.parameters.action, 'ask test b about 真传');
    assert.deepEqual(grant.parameters.monitored_grants, ['can_perform/test-skill/hit']);
    assert.equal(grant.samples, 100);
});

test('unresolved NPC is a visible pending item and prevents accidental collection', () => {
    const badCrosswalk = {
        items: [{
            id: 'gate:kungfu/class/test/none.c:kungfu/class/test/none.c:1',
            kind: 'gate', teacher: 'kungfu/class/test/none.c', group: 'test',
            function: 'attempt_apprentice', grant: null,
            source: { path: 'kungfu/class/test/none.c', sha256: 'c'.repeat(64), line: 1, start: 0, end: 50 },
            teaching: [], effect: [], status: 'x',
        }],
    };
    const badPlan = {
        batches: [{ group: 'test', rows: [{
            declaration: 'gate:kungfu/class/test/none.c:kungfu/class/test/none.c:1',
            kind: 'gate', function: 'attempt_apprentice', grant: null,
            coverage: 'targeted_collection_candidate', samples: 2,
            plan_condition: 'test', disposition_hint: 'test',
        }] }],
    };
    const badSource = { 'kungfu/class/test/none.c': 'void create() { set_name("无ID"); }' };
    badCrosswalk.items[0].source.sha256 = sha256(badSource['kungfu/class/test/none.c']);
    const plan = buildTeachingProbePlan(badPlan, badCrosswalk, p => badSource[p]);
    assert.equal(plan.conditions.length, 0);
    assert.match(plan.pending[0].reason, /NPC ID/);
    assert.throws(() => teachingProbeConditions(badPlan, badCrosswalk, p => badSource[p]), /待核实/);
});

test('recognition route requires a real skill and preserves formal sample counts', () => {
    const plan = structuredClone(samplePlan), crosswalk = structuredClone(sampleCrosswalk);
    crosswalk.items[0].function = 'recognize_apprentice';
    plan.batches[0].rows[0].samples = 100;
    let r = buildTeachingProbePlan(plan, crosswalk, readSource);
    assert.match(r.pending[0].reason, /真实技能/);
    plan.batches[0].rows[0].skill = 'finger';
    r = buildTeachingProbePlan(plan, crosswalk, readSource);
    assert.equal(r.pending.length, 0);
    assert.equal(r.conditions[0].parameters.action, 'learn test a finger 1');
    assert.equal(r.conditions[0].samples, 100);
    plan.batches[0].rows[0].skill = '1';
    assert.equal(buildTeachingProbePlan(plan, crosswalk, readSource).pending.length, 1);
});

test('missing inquiry route is not guessed from a function name or a quoted example', () => {
    const source = sources['kungfu/class/test/b.c'].replace('set("inquiry", ([ "真传": (: ask_skill1 :) ]));',
        '// "伪造": (: ask_skill1 :)\n    string example = "\\"假话题\\": (: ask_skill1 :)";');
    const crosswalk = structuredClone(sampleCrosswalk);
    crosswalk.items[1].source.sha256 = sha256(source);
    const r = buildTeachingProbePlan(samplePlan, crosswalk,
        path => path.endsWith('/b.c') ? source : readSource(path));
    assert.equal(r.pending.length, 1);
    assert.match(r.pending[0].reason, /话题路由/);
});

test('probe validation accepts raw observations without strict expectations', async () => {
    const { validateTeachingRecord } = await import('./teaching_observation.mjs');
    const condition = teachingProbeConditions(samplePlan, sampleCrosswalk, readSource)[0];
    const raw = {
        kind: 'sample', condition_id: condition.id, method: 'teaching', outcome: 'refused',
        teaching: [{
            command: 'apprentice test a', student: 'player#1',
            teacher_program: '/kungfu/class/test/a', teacher: '/kungfu/class/test/a#1',
            command_accepted: 1, elapsed: 0.01,
            before: { jing: 1000, neili: 100, skills: {}, mappings: {} },
            after: { jing: 1000, neili: 100, skills: {}, mappings: {} },
        }],
        before: [{ object: 'player#1', jing: 1000, neili: 100, max_neili: 100, str: 30, skills: {}, mappings: {} }],
        after: [{ object: 'player#1', jing: 1000, neili: 100, max_neili: 100, str: 30, skills: {}, mappings: {} }],
        metrics: [{}],
    };
    // Should not throw
    const result = validateTeachingRecord(raw, condition);
    assert.ok(Array.isArray(result));
    assert.equal(result[0].probe, true);
    assert.equal(result[0].advanced, false);
});
