// Pure preparation tests: no record acceptance, sandbox construction or native driver.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as module from './school_mingjiao_jiuyang_research_cases.mjs';
const { mingjiaoJiuyangResearchConditions: conditions, mingjiaoJiuyangResearchSourcePaths: sources,
    mingjiaoJiuyangResearchReviewedSourceHash: reviewed, validateMingjiaoJiuyangResearchCondition: validate } = module;
const root = fileURLToPath(new URL('../../../', import.meta.url)), read = p => readFileSync(root + p), copy = v => structuredClone(v);
const hash = b => createHash('sha256').update(b).digest('hex'), path = 'kungfu/skill/jiuyang-shengong.c';
const catalog = { skills: [{ id: 'jiuyang-shengong', path, sha256: hash(read(path)), entries: [] }] };
const cases = conditions(catalog, read), pick = variant => { const c = cases.find(c => c.parameters.variant === variant); assert.ok(c); return c; };
const reject = (c, edit) => { const bad = copy(c); edit(bad); assert.throws(() => validate(bad)); };
test('purepreparation25/1128/50;11sourceRNG100+14det2;preparedonly—notnative/notregistered', () => {
    assert.equal(cases.length, 25); assert.equal(new Set(cases.map(c => c.id)).size, 25);
    assert.equal(cases.filter(c => c.parameters.random_effects).length, 11); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1128);
    const smoke = conditions(catalog, read, { smoke: true }); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 50);
    for (const c of [...cases, ...smoke]) { assert.equal(c.status, 'prepared_not_sampled'); assert.equal(c.method, 'research'); validate(c); }
    assert.ok(!Object.hasOwn(module, 'validateMingjiaoJiuyangResearchRecord')); assert.ok(!Object.hasOwn(module, 'mingjiaoJiuyangResearchEffects'));
    assert.ok(cases.every(c => c.id.startsWith('school-mingjiao-research-jiuyang-') && !c.id.startsWith('school-mingjiao-jiuyang-')));
});
test('139realpublicsourceaggregate and original research/learn/skill/relatedsource drifts reject—no frozenfile writes', () => {
    assert.equal(sources.length, 139); assert.equal(new Set(sources).size, 139); assert.ok(Object.isFrozen(sources));
    assert.equal(hash(JSON.stringify(sources.map(p => [p, hash(read(p))]))), reviewed);
    for (const drift of ['cmds/skill/research.c', 'cmds/skill/learn.c', 'cmds/skill/exert.c', 'feature/skill.c', path,
        'kungfu/skill/liumai-shenjian.c', 'kungfu/skill/shenghuo-xinfa.c']) {
        assert.ok(sources.includes(drift)); assert.throws(() => conditions(catalog, p => p === drift ? Buffer.from('changed') : read(p)));
    }
    assert.throws(() => conditions(catalog, p => p === 'cmds/skill/research.c' ? Buffer.from('') : read(p)));
    assert.throws(() => conditions(catalog, p => { if (p === 'cmds/skill/research.c') throw Object.assign(new Error('missing source'), { code: 'ENOENT' }); return read(p); }));
});
test('run mode fixes exact formal/smoke counts; equal2 deterministic cases still require an explicit mode', () => {
    const smoke = conditions(catalog, read, { smoke: true });
    for (const [list, mode] of [[cases, 'formal'], [smoke, 'smoke']]) {
        for (const c of list) {
            assert.equal(c.parameters.run_mode, mode);
            assert.equal(c.samples, mode === 'smoke' ? 2 : c.parameters.formal_samples);
            validate(c);
            reject(c, b => { delete b.parameters.run_mode; });
            for (const invalid of [null, false, 0, 'FORMAL', 'unknown']) reject(c, b => { b.parameters.run_mode = invalid; });
        }
    }
    const formalRandom = pick('level200'), smokeRandom = smoke.find(c => c.id === formalRandom.id);
    reject(formalRandom, b => { b.samples = 2; });
    reject(smokeRandom, b => { b.samples = 100; });
    reject(formalRandom, b => { b.parameters.run_mode = 'smoke'; });
    reject(smokeRandom, b => { b.parameters.run_mode = 'formal'; });
    const relabeled = copy(formalRandom); relabeled.parameters.run_mode = 'smoke'; relabeled.samples = 2;
    assert.deepEqual(validate(relabeled), smokeRandom.parameters, 'a valid smoke declaration still needs the original manifest at report time');
});
test('catalog exactJiuyangpath/SHA and immutablecommandentry13main;missing/wrongqualification metadatafailclosed', () => {
    const wrong = copy(catalog); wrong.skills[0].path = 'kungfu/skill/force.c'; assert.throws(() => conditions(wrong, read));
    wrong.skills[0].path = path; wrong.skills[0].sha256 = '0'.repeat(64); assert.throws(() => conditions(wrong, read));
    assert.throws(() => conditions({ skills: [] }, read)); assert.throws(() => conditions(catalog, read, { smoke: 1 }));
    const c = pick('level200');
    assert.equal(c.parameters.research_source_entry.path, 'cmds/skill/research.c'); assert.equal(c.parameters.research_source_entry.line, 13);
    for (const key of ['source_evidence', 'qualification_evidence', 'reviewed_source_hash', 'research_source_entry']) reject(c, b => { delete b.parameters[key]; });
    reject(c, b => { b.parameters.research_source_entry.line = 14; }); reject(c, b => { b.parameters.source_evidence['cmds/skill/research.c'] = '0'.repeat(64); });
    reject(c, b => { b.parameters.qualification_evidence.reverse(); });
});
test('fixedconditionkeys/status/count/skillqualification180force200/swordandunarmedL—noprogressisnotinvalidschema', () => {
    const c = pick('level180'), p = c.parameters;
    assert.equal(p.actor.skills.force, 200); assert.equal(p.actor.skills.sword, 180); assert.equal(p.actor.skills.unarmed, 180);
    assert.equal(p.actor.properties['can_learn/jiuyang-shengong/enable_weapon'], 1);
    for (const samples of [null, -1, 0, 1, 3, 101]) reject(c, b => { b.samples = samples; });
    reject(c, b => { b.status = 'completed'; }); reject(c, b => { b.entry_id = 'cmds/skill/research.c:13:main'; });
    reject(c, b => { b.id = 'unreviewed'; }); reject(c, b => { b.method = 'interface'; }); reject(c, b => { b.extra = 1; });
    reject(c, b => { b.parameters.actor.skills.force = 180; }); reject(c, b => { b.parameters.actor.skills.sword = 179; });
    assert.equal(pick('level800').parameters.actor.properties.combat_exp, 100000000);
    assert.equal(pick('no-learn-string').parameters.actor.properties['env/no_learn'], 'jiuyang-shengong');
    reject(pick('no-learn-string'), b => { b.parameters.actor.properties['env/no_learn'] = 1; });
});
test('source-onlyfiniteRNGsupport15/16/22/63;liumai1400relatedXinfa/guimai/wuxing/roomordering—notobserveddraw', () => {
    for (const [variant, bound, max] of [['level180', 15, 6], ['level200', 16, 7], ['level400', 22, 6], ['level800', 63, 9],
        ['liumai201-nonreborn', 21, 5], ['guimai', 20, 8], ['wuxing', 19, 8], ['room50', 24, 10], ['related-xinfa400', 20, 8]]) {
        const p = pick(variant).parameters.research_prediction;
        assert.equal(p.rng_bound, bound); assert.deepEqual(p.possible_single_gain, Array.from({ length: max }, (_, i) => i + 1));
        assert.equal(p.hidden_random_input, 'unobserved'); assert.equal(p.derivation, 'original_source_support_not_observed_draw');
    }
    assert.equal(pick('liumai201-nonreborn').parameters.research_prediction.difficulty, 1400);
    assert.deepEqual(pick('related-xinfa400').parameters.research_prediction.related_levels, [400, 200]);
    assert.deepEqual(pick('related-xinfa400').parameters.research_prediction.related_scales, [150, 120]);
    assert.equal(pick('level200').parameters.research_prediction.possible_single_gain[0], 1, 'original random0 stillimproves1');
    reject(pick('level200'), b => { b.parameters.research_prediction.hidden_random_input = 0; });
});
test('predictedonly1200iterations normaljing30000+SETwriteoff196;potentialfieldnotspent andpartial51needs2completions', () => {
    const formal = key => cases.reduce((n, c) => n + c.samples * c.parameters.research_prediction[key], 0);
    assert.equal(formal('completed'), 1200); assert.equal(formal('learned_points_used'), 1200); assert.equal(formal('normal_jing_fee'), 30000);
    assert.equal(formal('jing_writeoff'), 196); assert.equal(formal('potential_field_cost'), 0);
    const p = pick('jing51-times3').parameters; assert.equal(p.actor.properties.jing, 51); assert.equal(p.research_prediction.requested_times, 3);
    assert.equal(p.research_prediction.completed, 2); assert.equal(p.research_prediction.normal_jing_fee, 50); assert.equal(p.research_prediction.jing_writeoff, 1);
    assert.deepEqual(p.research_prediction.possible_total_gain, Array.from({ length: 13 }, (_, i) => i + 2));
    const low = pick('jing24').parameters; assert.equal(low.expected, 'refused'); assert.equal(low.research_steps[0].expected_command_accepted, true);
    assert.equal(low.research_prediction.hidden_random_input, 'not_called'); assert.equal(low.research_steps[0].expected_timestamp, 'written');
    const exp = pick('exp-minus1').parameters; assert.equal(exp.expected, 'refused'); assert.equal(exp.research_steps[0].expected_command_accepted, true);
    assert.equal(exp.research_steps[0].expected_timestamp, 'unchanged'); assert.equal(exp.research_prediction.normal_jing_fee, 0);
    assert.equal(pick('eff-jing24').parameters.research_steps[0].expected_command_accepted, false);
});
test('same-second2realcommands firstjing24naturalwrite thenoriginalnotice;nofakeclock/oracleRecord;1130/52 plannedcommands', () => {
    const c = pick('same-second-jing24'), p = c.parameters;
    assert.equal(c.samples, 2); assert.equal(p.random_effects, false); assert.equal(p.actor.properties.jing, 24);
    assert.ok(!Object.hasOwn(p.actor, 'temp')); assert.deepEqual(p.actions, ['research jiuyang-shengong 1', 'research jiuyang-shengong 1']);
    assert.deepEqual(p.research_steps.map(s => [s.expected_command_accepted, s.expected_completed, s.expected_timestamp]),
        [[true, 0, 'written'], [false, 0, 'preserved']]); assert.equal(p.research_steps[1].source_location, 'cmds/skill/research.c:32');
    assert.equal(cases.reduce((n, c) => n + c.samples * c.parameters.actions.length, 0), 1130);
    assert.equal(conditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples * c.parameters.actions.length, 0), 52);
    reject(c, b => { b.parameters.actor.temp = { 'time/research': 1 }; }); reject(c, b => { b.parameters.research_steps.pop(); });
    reject(c, b => { b.parameters.research_steps[0].expected_completed = 1; });
});
