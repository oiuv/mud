// Pure preparation tests: no native driver, sandbox, callbacks or claimed observations.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import * as fusion from './school_mingjiao_jiuyang_fusion_cases.mjs';
import { mingjiaoJiuyangExertSourcePaths } from './school_mingjiao_jiuyang_exert_cases.mjs';

const { mingjiaoJiuyangFusionConditions: generate, mingjiaoJiuyangFusionSourcePaths: paths,
    mingjiaoJiuyangFusionReviewedSourceHash: sourceHash,
    validateMingjiaoJiuyangFusionCondition: validate } = fusion;
const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(resolve(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const mainPath = 'kungfu/skill/jiuyang-shengong.c';
const catalog = { skills: [{ path: mainPath, sha256: hash(read(mainPath)) }] };
const formal = generate(catalog, read), smoke = generate(catalog, read, { smoke: true });
const selected = variant => formal.find(c => c.parameters.variant === variant);
const childNames = ['wudang-jiuyang', 'shaolin-jiuyang', 'emei-jiuyang'];
function deny(variant, edits) {
    for (const edit of edits) {
        const changed = structuredClone(selected(variant)); edit(changed);
        assert.notDeepEqual(changed, selected(variant), 'the negative fixture must actually change');
        assert.throws(() => validate(changed));
    }
}

test('22 ordered candidates are 2 queries, 2 random completions and 18 deterministic paths; 240/44', () => {
    assert.deepEqual(formal.map(c => c.parameters.variant), [
        'query-sub-skills', 'get-ready', 'complete180', 'complete200',
        'missing-wudang-jiuyang', 'missing-shaolin-jiuyang', 'missing-emei-jiuyang',
        'below180-wudang-jiuyang', 'below180-shaolin-jiuyang', 'below180-emei-jiuyang',
        'gender-wuxing', 'character-jiaoxia', 'character-yinxian', 'raw-int33', 'raw-con37',
        'raw-force199', 'cognize99', 'max-neili3499', 'already-known', 'busy2', 'no-fight',
        'halt-after-first-step',
    ]);
    assert.equal(formal.length, 22); assert.equal(new Set(formal.map(c => c.id)).size, 22);
    assert.equal(formal.reduce((n, c) => n + c.samples, 0), 240);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 44);
    assert.equal(formal.filter(c => c.method === 'interface').length, 2);
    assert.equal(formal.filter(c => c.method === 'yanlian').length, 20);
    assert.equal(formal.filter(c => c.parameters.random_effects).length, 2);
    for (const [i, c] of formal.entries()) {
        validate(c); validate(smoke[i]);
        assert.equal(c.parameters.run_mode, 'formal'); assert.equal(smoke[i].parameters.run_mode, 'smoke');
        assert.deepEqual(smoke[i], { ...c, samples: 2, parameters: { ...c.parameters, run_mode: 'smoke' } });
        assert.equal(c.status, 'prepared_not_sampled');
    }
});

test('explicit mode prevents formal100 to2; deterministic2 still declares mode, not inferred from count', () => {
    for (const variant of ['complete180', 'complete200']) {
        const c = selected(variant), s = smoke.find(row => row.id === c.id);
        assert.equal(c.samples, 100); assert.equal(s.samples, 2);
        deny(variant, [row => { row.samples = 2; }, row => { row.parameters.run_mode = 'smoke'; },
            row => { row.samples = 2; row.parameters.formal_samples = 2; }]);
        const wrongFormal = structuredClone(s); wrongFormal.parameters.run_mode = 'formal';
        assert.throws(() => validate(wrongFormal));
        const wrongSmoke = structuredClone(s); wrongSmoke.samples = 100;
        assert.throws(() => validate(wrongSmoke));
    }
    for (const c of [...formal, ...smoke]) {
        const missing = structuredClone(c); delete missing.parameters.run_mode;
        assert.throws(() => validate(missing), c.id + ' missing mode');
        for (const value of [undefined, null, 0, 1, true, false, '', 'FORMAL', 'formal ', [], {}]) {
            const bad = structuredClone(c); bad.parameters.run_mode = value;
            assert.throws(() => validate(bad), c.id + ' invalid mode');
        }
    }
    for (const c of formal.filter(c => c.parameters.formal_samples === 2)) {
        const s = smoke.find(row => row.id === c.id);
        assert.equal(c.samples, s.samples); assert.notDeepEqual(c, s);
        const declaredSmoke = structuredClone(c); declaredSmoke.parameters.run_mode = 'smoke';
        assert.deepEqual(declaredSmoke, s); validate(declaredSmoke);
    }
    // This factory/Condition has no manifest argument. A later registered entry must bind its trusted mode.
});

test('removing only run_mode reproduces the complete old22 formal/smoke JSON bytes and all143source pins', () => {
    for (const [conditions, oldHash] of [[formal, '8c5c56c6af83fe7644808613b2dd4beddfc6339d205018c778d6f331d27b2aee'],
        [smoke, '7a1e825f523728610c0c86b6d1d8910c0160325a696cf90e66962aea0aaf08d6']]) {
        const withoutMode = structuredClone(conditions);
        for (const c of withoutMode) delete c.parameters.run_mode;
        assert.equal(hash(JSON.stringify(withoutMode)), oldHash);
        for (const c of conditions) {
            assert.equal(c.parameters.reviewed_source_hash, sourceHash);
            assert.deepEqual(c.parameters.qualification_sources, paths);
        }
    }
});

test('baseline raw attributes and empty associations are explicit inputs, not legal acquisition claims', () => {
    const p = selected('complete180').parameters, a = p.actor;
    assert.deepEqual(a.skills, { force: 300, 'martial-cognize': 100,
        'wudang-jiuyang': 180, 'shaolin-jiuyang': 180, 'emei-jiuyang': 180 });
    for (const [key, value] of Object.entries({ int: 34, con: 38, max_neili: 3500,
        neili: 3500, reborn: 0, gender: '男性', character: '光明磊落' }))
        assert.equal(a.properties[key], value);
    assert.deepEqual(a.mappings, {}); assert.deepEqual(a.preparations, {});
    for (const c of formal) {
        assert.equal(Object.hasOwn(c.parameters.actor, 'learned'), false);
        assert.equal(Object.hasOwn(c.parameters.actor, 'temp'), false);
        assert.equal(Object.hasOwn(c.parameters.actor, 'equipment'), false);
        assert.equal(c.parameters.fighting, false);
        assert.match(c.parameters.qualification_note, /不证明自然学得或师承、兼修合法/);
        assert.match(c.parameters.qualification_note, /不预写pending、许可或learned/);
    }
});

test('queries only declare original returns and never masquerade as natural get_finish or full eligibility', () => {
    const sub = selected('query-sub-skills'), ready = selected('get-ready');
    assert.deepEqual(sub.parameters.source_expectation.result,
        { 'wudang-jiuyang': 180, 'shaolin-jiuyang': 180, 'emei-jiuyang': 180 });
    assert.equal(ready.parameters.source_expectation.result, 1);
    assert.equal(ready.parameters.source_expectation.qualification, 'not_full_fusion_eligibility');
    for (const c of [sub, ready]) {
        assert.equal(c.parameters.action, 'test_interface');
        assert.equal(c.parameters.interface.object, '/kungfu/skill/jiuyang-shengong');
        assert.equal(c.parameters.source_expectation.natural_callbacks, 0);
        assert.equal(c.parameters.source_expectation.mutation, 'none');
        assert.equal(c.parameters.observe_seconds, 0);
    }
    deny('get-ready', [c => { c.parameters.interface.function = 'get_finish'; },
        c => { c.parameters.source_expectation.qualification = 'full_fusion_eligibility'; },
        c => { c.method = 'yanlian'; }]);
});

test('two complete paths use arithmetic mean only after original random support, not forced outcomes', () => {
    for (const [variant, levels, mean] of [
        ['complete180', [180, 180, 180], 180], ['complete200', [180, 200, 220], 200],
    ]) {
        const c = selected(variant), p = c.parameters, e = p.source_expectation;
        assert.deepEqual(childNames.map(name => p.actor.skills[name]), levels);
        assert.equal(e.success.merged_level, mean);
        assert.equal(e.success.merged_level, Math.trunc(levels.reduce((a, b) => a + b, 0) / 3));
        assert.equal(e.natural_callbacks, 4); assert.equal(e.child_actions, 3);
        assert.equal(e.get_finish_calls, 1); assert.deepEqual(e.get_finish_return_support, [0, 1]);
        assert.deepEqual(e.random_failure, { source_expression: 'random(10) > 8',
            numerator: 1, denominator: 10, forced_sample_count: null });
        assert.equal(e.command_cost, 'positive_safe_integer'); assert.equal(e.main_return, 1);
        assert.equal(e.success.auto_map_new_skill, false);
        assert.equal(e.failure.preserve_child_skills_learned_mappings_preparations, true);
        assert.deepEqual(p.expected, ['observed', 'refused']);
    }
    deny('complete200', [c => { c.parameters.source_expectation.success.merged_level = 220; },
        c => { c.parameters.source_expectation.random_failure.forced_sample_count = 10; },
        c => { c.parameters.source_expectation.command_cost = 1; },
        c => { c.parameters.actor.skills['jiuyang-shengong'] = 200; }]);
});

test('missing versus 179 children retain runtime keys order, distinct action counts and no get_finish', () => {
    for (const child of childNames) for (const mode of ['missing', 'below180']) {
        const p = selected(`${mode}-${child}`).parameters, e = p.source_expectation;
        assert.equal(Object.hasOwn(p.actor.skills, child), mode !== 'missing');
        if (mode === 'below180') assert.equal(p.actor.skills[child], 179);
        assert.equal(e.natural_callbacks, 'k'); assert.equal(e.child_position, 'actual_runtime_keys_position');
        assert.equal(e.child_actions, mode === 'missing' ? 'k-1' : 'k');
        assert.equal(e.get_finish_calls, 0); assert.equal(e.failing_child, child);
        assert.equal(e.final_state.pending_practice, 'actual_failing_child_position_1_to_3');
        assert.equal(e.final_state.pending_practicing_skill, 'jiuyang-shengong');
        assert.equal(e.final_state.busy_after_original_caller, 0);
        assert.equal(e.final_state.busy_zero_source, 'original_continue_action_after_practicing_return0');
    }
    deny('missing-emei-jiuyang', [c => { c.parameters.source_expectation.natural_callbacks = 3; },
        c => { c.parameters.source_expectation.child_position = 'source_declaration_order'; },
        c => { c.parameters.source_expectation.final_state.pending_practice = 0; }]);
});

test('eight finish gates change only the stated input and fail after three actions before final random', () => {
    const baseline = selected('complete180').parameters.actor;
    const expectedActors = [
        ['gender-wuxing', a => { a.properties.gender = '无性'; }],
        ['character-jiaoxia', a => { a.properties.character = '狡黠多变'; }],
        ['character-yinxian', a => { a.properties.character = '阴险奸诈'; }],
        ['raw-int33', a => { a.properties.int = 33; }],
        ['raw-con37', a => { a.properties.con = 37; }],
        ['raw-force199', a => { a.skills.force = 199; }],
        ['cognize99', a => { a.skills['martial-cognize'] = 99; }],
        ['max-neili3499', a => { a.properties.neili = 3499; a.properties.max_neili = 3499; }],
    ];
    for (const [variant, edit] of expectedActors) {
        const p = selected(variant).parameters, expected = structuredClone(baseline); edit(expected);
        assert.deepEqual(p.actor, expected);
        assert.equal(p.random_effects, false); assert.equal(p.formal_samples, 2);
        assert.equal(p.source_expectation.failure_stage, 'get_finish_before_final_random');
        assert.equal(p.source_expectation.natural_callbacks, 4);
        assert.equal(p.source_expectation.child_actions, 3);
        assert.deepEqual(p.source_expectation.get_finish_return_support, [0]);
        assert.equal(p.source_expectation.final_state.pending_practice, 0);
        assert.equal(p.source_expectation.final_state.pending_practicing_skill, 'jiuyang-shengong');
    }
});

test('three startup refusals do not invent callbacks or busy0; original notify_fail text stays separate', () => {
    for (const variant of ['already-known', 'busy2', 'no-fight']) {
        const p = selected(variant).parameters, e = p.source_expectation;
        assert.equal(p.expected, 'refused'); assert.equal(e.command_cost, 'zero');
        assert.equal(e.main_return, 0); assert.equal(e.natural_callbacks, 0);
        assert.equal(e.child_actions, 0); assert.equal(e.get_finish_calls, 0);
        assert.equal(e.final_state.busy, 'unchanged_by_command_not_assumed_zero');
        assert.equal(e.final_state.pending, 'unchanged_from_command_before');
        assert.match(p.refusal, /\n$/);
    }
    assert.equal(selected('already-known').parameters.actor.skills['jiuyang-shengong'], 180);
    assert.equal(selected('busy2').parameters.actor.busy, 2);
    assert.deepEqual(selected('no-fight').parameters.room, { no_fight: 1 });
    deny('busy2', [c => { c.parameters.source_expectation.final_state.busy = 0; },
        c => { c.parameters.actor.busy = 0; }, c => { c.parameters.refusal = ''; }]);
});

test('halt is only a deferred command plan after the first real return; missed phase is not success', () => {
    const p = selected('halt-after-first-step').parameters, e = p.source_expectation;
    assert.equal(p.method, undefined); assert.equal(p.action, 'yanlian jiuyang-shengong');
    assert.equal(p.interrupt.action, 'halt'); assert.equal(p.interrupt.command_path, 'cmds/std/halt.c');
    assert.equal(p.interrupt.trigger,
        'after_observed_first_practicing_return1_and_original_USER_stack_unwound');
    assert.equal(p.interrupt.required_pending_practice, 2);
    assert.equal(p.interrupt.required_busy, 'original_function');
    assert.equal(p.interrupt.scheduled_seconds, null);
    assert.equal(p.interrupt.missed_phase, 'condition_not_met_not_successful_halt');
    assert.equal(e.natural_callbacks, 1); assert.equal(e.halt_practice_return, 1);
    assert.equal(e.final_state.pending_practice, 0); assert.equal(e.final_state.pending_practicing_skill, 0);
    assert.equal(e.final_state.busy_zero_source, 'original_interrupt_me_accepts_halt_practice_return1');
    assert.equal(e.final_state.pending_write_is_not_delete, true);
    deny('halt-after-first-step', [c => { c.parameters.interrupt.scheduled_seconds = 1; },
        c => { c.parameters.interrupt.required_busy = 0; },
        c => { c.parameters.interrupt.trigger = 'manual_halt_practice'; },
        c => { c.parameters.source_expectation.final_state.pending_write_is_not_delete = false; }]);
});

test('source action and color support is independent of the generator and does not fake gross measurements', () => {
    for (const child of childNames) {
        const text = read(`kungfu/skill/${child}.c`).toString('utf8');
        const actions = text.slice(text.indexOf('mapping *action'), text.indexOf('string main_skill'));
        assert.equal((actions.match(/\(\[/g) ?? []).length, 2);
        const keys = [...actions.matchAll(/"([a-z_]+)"\s*:/g)].map(m => m[1]);
        assert.deepEqual(keys, ['action', 'lvl', 'damage_type', 'action', 'lvl', 'damage_type']);
        assert.match(text, /return action\[random\(i\)\]/);
    }
    const original = read('cmds/skill/yanlian.c').toString('utf8');
    assert.match(original, /color_msg = \(\{ HIY, HIG, HIW, HIM, HIC \}\)/);
    assert.match(original, /color_msg\[random\(sizeof\(color_msg\)\)\]/);
    assert.match(original, /skill_names = keys\(sub_skills\)/);
    assert.match(original, /start_busy\(\(: practicing :\), \(: halt_practice :\)\)/);
    const p = selected('complete180').parameters, contract = p.observation_contract;
    assert.equal(contract.registered, false); assert.equal(p.observe_seconds, null);
    assert.deepEqual(contract.color_support, ['HIY', 'HIG', 'HIW', 'HIM', 'HIC']);
    assert.deepEqual(contract.fee_support.per_child, { neili: 0, qi: 0, jing: 0 });
    assert.equal(contract.fee_support.actual_gross_costs, 'not_observed_requires_native_accounting');
    assert.match(contract.deadline_result, /unfinished.*not_original_random_failure/);
    assert.match(contract.empty_value_policy, /not_a_missing_observation_key/);
    deny('complete180', [c => { c.parameters.observation_contract.color_support.push('HIR'); },
        c => { c.parameters.observation_contract.fee_support.actual_gross_costs = 0; },
        c => { c.parameters.observe_seconds = 4; },
        c => { c.parameters.observation_contract.empty_value_policy = 'missing_is_zero'; }]);
});

test('143 exact sources include the real command, children, halt and inherited busy/skill chain', () => {
    assert.equal(paths.length, 143); assert.equal(new Set(paths).size, 143);
    assert.deepEqual(paths.slice(0, 137), mingjiaoJiuyangExertSourcePaths);
    assert.deepEqual(paths.slice(137), ['cmds/skill/yanlian.c', 'kungfu/skill/wudang-jiuyang.c',
        'kungfu/skill/shaolin-jiuyang.c', 'kungfu/skill/emei-jiuyang.c', 'cmds/std/halt.c', 'feature/alias.c']);
    for (const path of ['feature/action.c', 'mudcore/inherit/action.c', 'inherit/char/char.c',
        'feature/skill.c', 'mudcore/inherit/dbase.c', 'inherit/skill/force.c', 'inherit/skill/skill.c',
        'feature/command.c', 'include/skill.h', 'mudcore/include/ansi.h']) assert.ok(paths.includes(path));
    assert.equal(sourceHash, 'e218966245824e3c74ae9f460094883467d66cd4283a6abc4853a0eae76f6f0c');
    assert.equal(hash(JSON.stringify(paths.map(path => [path, hash(read(path))]))), sourceHash);
    for (const changedPath of [mainPath, ...paths.slice(137), 'mudcore/inherit/action.c']) {
        assert.throws(() => generate(catalog,
            path => path === changedPath ? Buffer.concat([read(path), Buffer.from('\n// drift')]) : read(path)));
    }
    for (const bad of [undefined, null, '', Buffer.alloc(0), 1, {}])
        assert.throws(() => generate(catalog, path => path === 'cmds/skill/yanlian.c' ? bad : read(path)));
    assert.throws(() => generate({ skills: [] }, read));
    assert.throws(() => generate({ skills: [...catalog.skills, ...catalog.skills] }, read));
    assert.throws(() => generate({ skills: [{ path: mainPath, sha256: '0'.repeat(64) }] }, read));
    assert.throws(() => generate(catalog, read, { smoke: 1 }));
});

test('condition identity, planned status, source bindings and unknown fields reject rather than normalizing', () => {
    for (const bad of [undefined, null, 0, 'condition', []]) assert.throws(() => validate(bad));
    deny('complete180', [c => { c.id += '-new'; }, c => { c.stage = 'combat'; },
        c => { c.method = 'interface'; }, c => { c.status = 'complete'; },
        c => { c.samples = 99; }, c => { c.samples = '100'; },
        c => { c.raw = {}; }, c => { delete c.parameters; }, c => { c.parameters = []; },
        c => { c.parameters.extra = 1; }, c => { c.parameters.actor.temp = { 'pending/practice': 1 }; },
        c => { c.entry_id = mainPath; }, c => { c.parameters.source_entry.function = 'get_finish'; },
        c => { c.parameters.source_entry.sha256 = '0'.repeat(64); },
        c => { c.parameters.source_base.path = 'kungfu/skill/wudang-jiuyang.c'; },
        c => { c.parameters.reviewed_source_hash = '0'.repeat(64); },
        c => { delete c.parameters.source_evidence['cmds/skill/yanlian.c']; },
        c => { c.parameters.source_evidence['cmds/skill/yanlian.c'] = 'f'.repeat(64); },
        c => { c.parameters.source_evidence.extra = '0'.repeat(64); },
        c => { c.parameters.qualification_evidence.reverse(); },
        c => { c.parameters.qualification_sources.reverse(); }]);
    for (const [variant, id] of [['complete180', 'cmds/skill/yanlian.c:12:main'],
        ['query-sub-skills', mainPath + ':181:query_sub_skills'], ['get-ready', mainPath + ':109:get_ready']])
        assert.equal(selected(variant).entry_id, id);
});

test('outputs are independent and exports contain no execution, Record or Effects implementation', () => {
    const changed = generate(catalog, read);
    changed[0].parameters.actor.skills.force = 1;
    changed[0].parameters.source_evidence[mainPath] = '0'.repeat(64);
    changed[0].parameters.observation_contract.color_support.push('HIR');
    assert.deepEqual(changed.slice(1), formal.slice(1));
    assert.deepEqual(generate(catalog, read), formal);
    assert.deepEqual(Object.keys(fusion).sort(), ['mingjiaoJiuyangFusionConditions',
        'mingjiaoJiuyangFusionReviewedSourceHash', 'mingjiaoJiuyangFusionSourcePaths',
        'validateMingjiaoJiuyangFusionCondition']);
});
