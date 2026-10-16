// Standalone preparation only: no registration, Record/Effects, native execution or callback driving.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mingjiaoJiuyangExertSourcePaths } from './school_mingjiao_jiuyang_exert_cases.mjs';

const skill = 'jiuyang-shengong', group = 'mingjiao-jiuyang-fusion';
const mainPath = `kungfu/skill/${skill}.c`, commandPath = 'cmds/skill/yanlian.c';
const children = ['wudang-jiuyang', 'shaolin-jiuyang', 'emei-jiuyang'];
const copy = value => structuredClone(value);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const map = value => {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value));
    return value;
};
export const mingjiaoJiuyangFusionSourcePaths = Object.freeze([...new Set([
    ...mingjiaoJiuyangExertSourcePaths, commandPath,
    ...children.map(name => `kungfu/skill/${name}.c`), 'cmds/std/halt.c', 'feature/alias.c',
])]);
export const mingjiaoJiuyangFusionReviewedSourceHash =
    'e218966245824e3c74ae9f460094883467d66cd4283a6abc4853a0eae76f6f0c';
const evidenceHash = evidence => hash(JSON.stringify(
    mingjiaoJiuyangFusionSourcePaths.map(path => [path, evidence[path]])));

const pool = {
    name: '试侠', gender: '男性', race: '人类', class: '', character: '光明磊落',
    str: 36, int: 34, con: 38, dex: 36, combat_exp: 100000000,
    qi: 1000000, eff_qi: 1000000, max_qi: 1000000,
    jing: 1000000, eff_jing: 1000000, max_jing: 1000000,
    neili: 3500, max_neili: 3500, jingli: 1000, max_jingli: 1000,
    shen: 90000, jiali: 0, potential: 10000, learned_points: 0,
    reborn: 0, breakup: 0, doing: 0, 'family/family_name': '明教',
    'env/no_learn': 0, 'env/auto_regenerate': 0, 'special_skill/wuxing': 0,
    'tattoo/tattoo_str': 0, 'tattoo/tattoo_int': 0,
    'tattoo/tattoo_con': 0, 'tattoo/tattoo_dex': 0,
};
function actor(levels = [180, 180, 180]) {
    return {
        skills: { force: 300, 'martial-cognize': 100,
            ...Object.fromEntries(children.map((name, i) => [name, levels[i]])) },
        mappings: {}, preparations: {}, properties: copy(pool),
    };
}

// This is a future observation contract, not generated observations or a new executor.
const contract = {
    registered: false,
    clock: 'original_USER_heart_beat_to_continue_action_busy_closure',
    natural_callback: { path: commandPath, function: 'practicing', line: 45 },
    interrupt_callback: { path: commandPath, function: 'halt_practice', line: 131 },
    child_order: 'actual_runtime_keys_query_sub_skills_not_sorted_or_assumed',
    child_actions_per_skill: 2,
    child_action_keys: ['action', 'lvl', 'damage_type'],
    child_action_force_present: false,
    color_support: ['HIY', 'HIG', 'HIW', 'HIM', 'HIC'],
    distribution: 'observe_only_no_forced_frequency_no_resampling_until_success',
    fee_support: {
        basis: 'source_only_missing_action_force_is_zero_in_original_arithmetic',
        per_child: { neili: 0, qi: 0, jing: 0 }, potential: 0, learned_points: 0,
        actual_gross_costs: 'not_observed_requires_native_accounting',
        recovery_and_net_change: 'observe_separately_not_inferred_from_zero_source_cost',
    },
    state_observation: [
        'exact_USER_identity_and_original_command_integer_cost',
        'each_callback_before_after_return_owner_time_and_original_message',
        'skills_and_actual_query_sub_skills_keys_order',
        'learned_mappingp_and_raw_value_no_null_to_empty_rewrite',
        'mappings_and_preparations_without_manual_cleanup',
        'pending_parent_and_both_member_presence_raw_values',
        'busy_type_owner_and_value_after_original_caller_returns',
        'gross_resources_recovery_net_change_potential_learned_points',
    ],
    empty_value_policy: 'explicit_null_or_zero_is_not_a_missing_observation_key',
    deadline_result: 'unfinished_or_missing_evidence_is_not_original_random_failure',
    teardown: 'after_original_USER_and_interrupt_stacks_return',
    excluded_claims: ['legal_teacher_acquisition_or_compatibility',
        'deletion_of_preexisting_nonzero_learned_points', 'cancellation_of_nonempty_mappings'],
};
const note = '只准备原接口及原yanlian/halt自然流程，当前共享执行器尚不支持method yanlian。'
    + '预存三子技能和资源是实验输入，不证明自然学得或师承、兼修合法。'
    + '不预写pending、许可或learned，不调用get_finish/practicing/continue_action推进，不添加RNG探针。'
    + '条件中的结果和零费用仅为源码支持，仍须真实毛费用、回调、消息和终态证据。'
    + '空映射及未预存熟练不证明删除了非空关联或非零进度。';

function endState(kind) {
    if (kind === 'unchanged') return { pending: 'unchanged_from_command_before',
        busy: 'unchanged_by_command_not_assumed_zero', source: 'no_fusion_closure_started' };
    return {
        pending_practice: kind === 'child_failure' ? 'actual_failing_child_position_1_to_3' : 0,
        pending_practicing_skill: kind === 'halt' ? 0 : skill,
        busy_after_original_caller: 0,
        busy_zero_source: kind === 'halt'
            ? 'original_interrupt_me_accepts_halt_practice_return1'
            : 'original_continue_action_after_practicing_return0',
        pending_write_is_not_delete: true,
    };
}
function plans() {
    const out = [];
    const add = (variant, config, expectation, extra = {}) => {
        const query = Object.hasOwn(extra, 'interface');
        out.push({ id: `school-mingjiao-fusion-jiuyang-${variant}`, stage: 'school',
            method: query ? 'interface' : 'yanlian', parameters: {
                school: 'mingjiao', family: '明教', collection_group: group,
                skill, usage: 'force', ability: query ? extra.interface.function : 'yanlian', variant,
                actor: copy(config), target: actor(), named_participants: true,
                fighting: false, room: {}, action: query ? 'test_interface' : `yanlian ${skill}`,
                observation: query ? 'single_action_immediate' : 'original_heartbeat_busy_completion',
                // No fabricated waiting window: a future executor must define a bounded deadline.
                observe_seconds: query ? 0 : null,
                random_effects: false, formal_samples: 2, expected: 'observed', not_applicable: '',
                source_expectation: copy(expectation), observation_contract: copy(contract),
                qualification_sources: [...mingjiaoJiuyangFusionSourcePaths], qualification_note: note,
                ...copy(extra),
            } });
    };
    add('query-sub-skills', actor(), { result: Object.fromEntries(children.map(name => [name, 180])),
        mutation: 'none', natural_callbacks: 0, final_state: endState('unchanged') },
    { interface: { object: '/kungfu/skill/' + skill, function: 'query_sub_skills' } });
    add('get-ready', actor(), { result: 1, mutation: 'none', natural_callbacks: 0,
        qualification: 'not_full_fusion_eligibility', final_state: endState('unchanged') },
    { interface: { object: '/kungfu/skill/' + skill, function: 'get_ready' } });

    for (const [variant, levels, merged] of [
        ['complete180', [180, 180, 180], 180], ['complete200', [180, 200, 220], 200],
    ]) add(variant, actor(levels), {
        command_cost: 'positive_safe_integer', main_return: 1, natural_callbacks: 4, child_actions: 3,
        get_finish_calls: 1, get_finish_return_support: [0, 1],
        random_failure: { source_expression: 'random(10) > 8', numerator: 1, denominator: 10,
            forced_sample_count: null },
        success: { merged_level: merged, delete_original_children: true,
            learned_cleanup: 'original_delete_skill_only_if_mapping_exists',
            mapping_cleanup: 'original_delete_skill_map_skill_for_actual_mapped_usages_only',
            auto_map_new_skill: false },
        failure: { preserve_child_skills_learned_mappings_preparations: true, new_main_skill: false },
        final_state: endState('finished'),
    }, { random_effects: true, formal_samples: 100, expected: ['observed', 'refused'] });

    for (const mode of ['missing', 'below180']) for (const child of children) {
        const config = actor();
        if (mode === 'missing') delete config.skills[child]; else config.skills[child] = 179;
        add(`${mode}-${child}`, config, {
            command_cost: 'positive_safe_integer', main_return: 1,
            failure_stage: mode === 'missing' ? 'child_before_query_action' : 'child_after_action_and_fees',
            failing_child: child, child_position: 'actual_runtime_keys_position',
            natural_callbacks: 'k', child_actions: mode === 'missing' ? 'k-1' : 'k',
            get_finish_calls: 0, preserve_skills_learned_mappings_preparations: true,
            final_state: endState('child_failure'),
        }, { expected: 'refused' });
    }
    const finishFailures = [
        ['gender-wuxing', a => { a.properties.gender = '无性'; }, 'gender'],
        ['character-jiaoxia', a => { a.properties.character = '狡黠多变'; }, 'character_jiaoxia'],
        ['character-yinxian', a => { a.properties.character = '阴险奸诈'; }, 'character_yinxian'],
        ['raw-int33', a => { a.properties.int = 33; }, 'raw_int'],
        ['raw-con37', a => { a.properties.con = 37; }, 'raw_con'],
        ['raw-force199', a => { a.skills.force = 199; }, 'raw_force'],
        ['cognize99', a => { a.skills['martial-cognize'] = 99; }, 'raw_martial_cognize'],
        ['max-neili3499', a => { a.properties.neili = a.properties.max_neili = 3499; }, 'max_neili'],
    ];
    for (const [variant, edit, gate] of finishFailures) {
        const config = actor(); edit(config);
        add(variant, config, { command_cost: 'positive_safe_integer', main_return: 1,
            natural_callbacks: 4, child_actions: 3, get_finish_calls: 1, get_finish_return_support: [0],
            failure_stage: 'get_finish_before_final_random', failed_gate: gate,
            preserve_skills_learned_mappings_preparations: true, final_state: endState('finished'),
        }, { expected: 'refused' });
    }
    for (const [variant, edit, room, refusal] of [
        ['already-known', a => { a.skills[skill] = 180; }, {}, '你已经会九阳神功了，不必再演练了，还是多练习吧。\n'],
        ['busy2', a => { a.busy = 2; }, {}, '你现在正忙着呢。\n'],
        ['no-fight', () => {}, { no_fight: 1 }, '你在这里演练也不怕吵到别人？\n'],
    ]) {
        const config = actor(); edit(config);
        add(variant, config, { command_cost: 'zero', main_return: 0, natural_callbacks: 0,
            child_actions: 0, get_finish_calls: 0, failure_stage: 'yanlian_main',
            final_state: endState('unchanged'),
        }, { expected: 'refused', room, refusal });
    }
    add('halt-after-first-step', actor(), { command_cost: 'positive_safe_integer', main_return: 1,
        natural_callbacks: 1, child_actions: 1, get_finish_calls: 0,
        halt_command_cost: 'positive_safe_integer', halt_practice_return: 1,
        preserve_skills_learned_mappings_preparations: true, final_state: endState('halt'),
    }, { interrupt: { action: 'halt', command_path: 'cmds/std/halt.c', function: 'main', line: 6,
        trigger: 'after_observed_first_practicing_return1_and_original_USER_stack_unwound',
        required_pending_practice: 2, required_busy: 'original_function',
        scheduled_seconds: null, missed_phase: 'condition_not_met_not_successful_halt' } });
    assert.equal(out.length, 22); assert.equal(new Set(out.map(c => c.id)).size, 22);
    assert.equal(out.filter(c => c.parameters.random_effects).length, 2);
    return out;
}

function entry(parameters, evidence) {
    const query = Object.hasOwn(parameters, 'interface');
    const path = query ? mainPath : commandPath;
    const func = query ? parameters.interface.function : 'main';
    const line = query ? (func === 'get_ready' ? 109 : 181) : 12;
    return { id: `${path}:${line}:${func}`, path, line, function: func,
        role: query ? 'interface' : 'command', sha256: evidence[path] };
}
export function mingjiaoJiuyangFusionConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(mingjiaoJiuyangFusionSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length > 0,
            'missing original fusion source ' + path);
        return [path, hash(bytes)];
    }));
    assert.equal(evidenceHash(evidence), mingjiaoJiuyangFusionReviewedSourceHash,
        'fusion source changed: review required');
    const sources = catalog.skills.filter(s => s.path === mainPath);
    assert.equal(sources.length, 1); assert.equal(sources[0].sha256, evidence[mainPath]);
    return plans().map(c => ({ ...c, status: 'prepared_not_sampled',
        samples: smoke ? 2 : c.parameters.formal_samples, entry_id: entry(c.parameters, evidence).id,
        parameters: { ...c.parameters, run_mode: smoke ? 'smoke' : 'formal', source_entry: entry(c.parameters, evidence),
            source_base: { path: mainPath, sha256: evidence[mainPath] }, source_evidence: copy(evidence),
            reviewed_source_hash: mingjiaoJiuyangFusionReviewedSourceHash,
            qualification_evidence: mingjiaoJiuyangFusionSourcePaths.map(path => ({ path, sha256: evidence[path] })) },
    }));
}
export function validateMingjiaoJiuyangFusionCondition(condition) {
    map(condition);
    assert.deepEqual(Object.keys(condition).sort(),
        ['entry_id', 'id', 'method', 'parameters', 'samples', 'stage', 'status']);
    const plan = plans().find(c => c.id === condition.id); assert.ok(plan, 'unreviewed fusion condition');
    assert.equal(condition.stage, plan.stage); assert.equal(condition.method, plan.method);
    assert.equal(condition.status, 'prepared_not_sampled');
    const { run_mode, source_entry, source_base, source_evidence, reviewed_source_hash, qualification_evidence,
        ...parameters } = map(condition.parameters);
    assert.ok(['formal', 'smoke'].includes(run_mode), 'explicit fusion run mode required');
    assert.equal(condition.samples, run_mode === 'smoke' ? 2 : plan.parameters.formal_samples,
        'fusion sample count must match declared run mode');
    assert.deepEqual(parameters, plan.parameters, 'fusion parameters drifted');
    assert.deepEqual(Object.keys(map(source_evidence)), [...mingjiaoJiuyangFusionSourcePaths]);
    for (const digest of Object.values(source_evidence)) assert.match(digest, /^[a-f0-9]{64}$/);
    assert.equal(evidenceHash(source_evidence), mingjiaoJiuyangFusionReviewedSourceHash);
    assert.equal(reviewed_source_hash, mingjiaoJiuyangFusionReviewedSourceHash);
    assert.deepEqual(source_entry, entry(parameters, source_evidence));
    assert.equal(condition.entry_id, source_entry.id);
    assert.deepEqual(source_base, { path: mainPath, sha256: source_evidence[mainPath] });
    assert.deepEqual(qualification_evidence,
        mingjiaoJiuyangFusionSourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    return condition.parameters;
}
