// Unregistered finite preparation only: no runner, raw records, driver or native completion.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const copy = value => structuredClone(value);
const sha = value => createHash('sha256').update(value).digest('hex');
const xinfa = 'shenghuo-xinfa', shengong = 'shenghuo-shengong';
const forces = [xinfa, shengong], group = 'mingjiao-force-remaining';
const skillPath = skill => `kungfu/skill/${skill}.c`;
export const mingjiaoForceRemainingSourcePaths = Object.freeze([
    ...[xinfa, shengong, 'huashan-xinfa', 'force', 'unarmed', 'sword', 'dodge', 'parry', 'martial-cognize'].map(skillPath),
    ...[xinfa + '/powerup', shengong + '/powerup', shengong + '/shield',
        ...['recover', 'regenerate', 'heal', 'inspire', 'dispel', 'power', 'tianmo'].map(a => 'force/' + a)].map(skillPath),
    'inherit/skill/force.c', 'inherit/skill/skill.c', 'inherit/condition/poison.c',
    'kungfu/condition/freezing.c', 'kungfu/condition/bandaged.c',
    ...['weiyixiao', 'xiexun', 'zhangwuji', 'fanyao', 'yangxiao'].map(n => `kungfu/class/mingjiao/${n}.c`),
    'kungfu/class/mingjiao/mingjiao.h',
    'cmds/skill/research.c', 'cmds/skill/exercise.c', 'cmds/skill/exert.c', 'cmds/skill/learn.c', 'cmds/std/halt.c',
    'clone/user/user.c', 'inherit/char/char.c', 'feature/skill.c', 'feature/attribute.c',
    'feature/damage.c', 'feature/action.c', 'feature/attack.c', 'feature/condition.c',
    'feature/dbase.c', 'feature/equip.c', 'feature/command.c', 'feature/message.c',
    'feature/move.c', 'feature/name.c', 'feature/clean_up.c',
    'mudcore/inherit/action.c', 'mudcore/inherit/dbase.c',
    'inherit/weapon/sword.c', 'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/daemons/weapond.c',
    'adm/daemons/race/human.c', 'adm/single/simul_efun/message.c', 'adm/single/simul_efun/chinese.c',
    'adm/daemons/chinesed.c', 'data/e2c_dict.o',
    ...['globals', 'skill', 'command', 'combat', 'condition', 'weapon', 'user', 'action', 'dbase', 'move', 'name', 'team'].map(n => `include/${n}.h`),
    'mudcore/include/ansi.h',
]);
export const mingjiaoForceRemainingReviewedSourceHash = '55e059783bc4c4fc79f75863695a5ddd5b16596ee128e0957b825b5c9d40ff12';
export const mingjiaoForceRemainingAbsentPaths = Object.freeze(forces.flatMap(f =>
    ['recover', 'regenerate', 'heal', 'inspire', 'dispel', 'power', 'tianmo'].flatMap(a =>
        ['c', 'lpc'].map(ext => `kungfu/skill/${f}/${a}.${ext}`))));
const sourceHash = evidence => sha(JSON.stringify(mingjiaoForceRemainingSourcePaths.map(p => [p, evidence[p]])));

// These are actual owners, not synthetic catalog entries. Non-skill commands/USER/parents
// are pinned to source definitions; catalog=true requires the real lexical catalog role.
const binding = (path, line, fn, role, catalog = false) => ({ path, line, function: fn, role,
    catalog, entry_id: `${path}:${line}:${fn}` });
const bindings = {
    research: binding('cmds/skill/research.c', 13, 'main', 'command'),
    exercise: binding('cmds/skill/exercise.c', 12, 'main', 'command'),
    exercising: binding('cmds/skill/exercise.c', 62, 'exercising', 'source_function'),
    halt_exercise: binding('cmds/skill/exercise.c', 108, 'halt_exercise', 'source_function'),
    exert_command: binding('cmds/skill/exert.c', 4, 'main', 'command'),
    halt_command: binding('cmds/std/halt.c', 6, 'main', 'command'),
    can_learn: binding('cmds/skill/learn.c', 190, 'can_learn', 'source_function'),
    total_capacity: binding('clone/user/user.c', 355, 'query_neili_limit', 'source_function'),
    current_capacity: binding('clone/user/user.c', 407, 'query_current_neili_limit', 'source_function'),
    parent_hit_ob: binding('inherit/skill/force.c', 15, 'hit_ob', 'source_function'),
    poison_dispel: binding('inherit/condition/poison.c', 130, 'dispel', 'source_function'),
    freezing_dispel: binding('kungfu/condition/freezing.c', 37, 'dispel', 'source_function'),
    bandaged_dispel: binding('kungfu/condition/bandaged.c', 7, 'dispel', 'source_function'),
    xinfa_learn: binding(skillPath(xinfa), 5, 'valid_learn', 'query_or_gate', true),
    xinfa_compatibility: binding(skillPath(xinfa), 17, 'valid_force', 'query_or_gate', true),
    shengong_compatibility: binding(skillPath(shengong), 15, 'valid_force', 'query_or_gate', true),
    huashan_compatibility: binding(skillPath('huashan-xinfa'), 7, 'valid_force', 'query_or_gate', true),
    shengong_capacity: binding(skillPath(shengong), 8, 'query_neili_improve', 'query_or_gate', true),
    xinfa_powerup: binding(skillPath(xinfa + '/powerup'), 7, 'exert', 'exert', true),
    xinfa_remove: binding(skillPath(xinfa + '/powerup'), 32, 'remove_effect', 'other_function', true),
    shengong_powerup: binding(skillPath(shengong + '/powerup'), 7, 'exert', 'exert', true),
    shengong_remove: binding(skillPath(shengong + '/powerup'), 33, 'remove_effect', 'other_function', true),
    shengong_shield: binding(skillPath(shengong + '/shield'), 7, 'exert', 'exert', true),
    shield_remove: binding(skillPath(shengong + '/shield'), 38, 'remove_effect', 'other_function', true),
    ...Object.fromEntries([['recover', 3], ['regenerate', 5], ['heal', 5], ['inspire', 5],
        ['dispel', 5], ['power', 35], ['tianmo', 9]].map(([a, line]) =>
        [a, binding(skillPath('force/' + a), line, 'exert', 'exert', true)])),
    healing: binding(skillPath('force/heal'), 45, 'healing', 'other_function', true),
    halt_healing: binding(skillPath('force/heal'), 108, 'halt_healing', 'other_function', true),
    inspiring: binding(skillPath('force/inspire'), 42, 'inspiring', 'other_function', true),
    halt_inspiring: binding(skillPath('force/inspire'), 96, 'halt_inspiring', 'other_function', true),
};
const pool = {
    name: '试侠', gender: '男性', race: '人类', character: '光明磊落', class: '',
    str: 36, int: 36, con: 36, dex: 36, combat_exp: 100000000, shen: 0,
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 6000, max_neili: 6000, jingli: 1000, max_jingli: 1000, jiali: 0,
    potential: 10000, learned_points: 0, reborn: 0, breakup: 0, doing: 0,
    'family/family_name': '明教', 'env/auto_regenerate': 0, 'env/no_learn': 0, 'improve/neili': 0,
    'special_skill/mystery': 0, 'special_skill/guimai': 0, 'special_skill/wuxing': 0,
    'special_skill/self': 0, 'special_skill/divine': 0, 'immune/poison': 0,
    'tattoo/tattoo_str': 0, 'tattoo/tattoo_int': 0, 'tattoo/tattoo_con': 0, 'tattoo/tattoo_dex': 0,
};
const actor = (skill, level = 200) => ({ skills: { force: level, [skill]: level,
    unarmed: 200, dodge: 200, parry: 200 }, mappings: { force: skill }, preparations: {}, properties: copy(pool) });
// Fixed no-bonus source prediction; not a measured capacity or a general oracle.
const capacity = (skill, level) => Math.trunc(level / 2) * 10 + level * 10
    + (skill === shengong ? Math.trunc(Math.trunc(level * level * 15 * 16 / 100) / 200) : 0);
const note = '未注册有限准备，不是已采样或当前runtime可执行。真实非巫师USER，实验资格/初始异常/显式补给不证明自然养成、原NPC自用或自然染毒。'
    + '原命令、返回、状态与资源独立取证；expected只声明计划，不能灌入原件。时钟/回调/随机保持原路，未知、拒绝、错误及看门狗终止不冒完成。'
    + '原2746记录与54份低级解除/空异常原件不改不重采；本组只收剩余差量，非全门派平衡结论。';

function plans() {
    const out = [];
    function add(panel, skill, ability, variant, a, options = {}) {
        const method = options.method ?? 'exert';
        const operation = options.operation ?? ability;
        const b = bindings[operation]; assert.ok(b, operation);
        const formal = options.random ? 100 : 2;
        out.push({ id: `school-mingjiao-force-remaining-${panel}-${skill}-${variant}`, stage: 'school',
            method, entry_id: b.catalog && b.role === 'exert' ? b.entry_id : skillPath(skill),
            status: 'prepared_not_sampled', parameters: {
                school: 'mingjiao', family: '明教', collection_group: group, panel, variant, skill, usage: 'force', ability,
                level: a.skills[skill] ?? 200, actor: copy(a), target: copy(options.target ?? actor(xinfa)),
                named_participants: true, fighting: false, room: {},
                action: method === 'interface' ? 'test_interface' : method === 'ordinary' ? 'ordinary' : `exert ${ability}`,
                expected: options.expected ?? 'observed', not_applicable: '',
                observation: 'single_action_immediate', observe_seconds: 0,
                formal_samples: formal, smoke_samples: options.long_expiry ? 1 : 2,
                sample_scope: options.random ? 'independent_random_distribution' : 'mechanism_repetition_not_distribution',
                operation_keys: [operation, ...(options.dependencies ?? [])],
                qualification_sources: [...mingjiaoForceRemainingSourcePaths], qualification_note: note,
                producer_status: 'unregistered_preparation', ...copy(options.parameters ?? {}),
            } });
    }
    // A: six random research-progress windows and five independent original refusals/no-progress.
    const research = (variant, a, times = 1, completed = 1, extra = {}) => add('research', xinfa, 'research', variant, a,
        { method: 'research', operation: 'research', dependencies: ['can_learn', 'xinfa_learn'], random: completed > 0,
            expected: completed > 0 ? 'observed' : 'refused', parameters: {
                action: `research ${xinfa} ${times}`, repetitions: times, completed,
                observation: 'original_research_immediate', ...extra,
                research_scope: { requested_times: times, planned_completed: completed,
                    source_jing_fee_per_completed: Math.trunc(1000 / a.properties.int),
                    actual_command_return: 'observe', actual_begin_end_time: 'observe_original_clock',
                    learned_raw_kind_and_progress: 'observe', expected_is_not_raw: true },
            } });
    for (const l of [180, 200, 400, 800]) research('level' + l, actor(xinfa, l));
    const related = actor(xinfa); related.skills[shengong] = 200; research('related-shengong200', related);
    const partial = actor(xinfa); partial.properties.jing = 54; research('jing54-times3', partial, 3, 2);
    research('level179', actor(xinfa, 179), 1, 0);
    for (const [variant, change] of [['potential0', { potential: 0 }], ['effjing26', { eff_jing: 26, jing: 26 }],
        ['jing26', { jing: 26 }], ['experience-minus1', { combat_exp: 799999 }]]) {
        const a = actor(xinfa); Object.assign(a.properties, change); research(variant, a, 1, 0);
    }
    // B: original exercise 3 levels + 18 Xinfa edges; only 5 nonduplicate Shengong windows.
    const exercise = (skill, variant, l = 200, options = {}) => {
        const a = actor(skill, l), cost = options.cost ?? 100;
        Object.assign(a.properties, options.properties);
        if (options.busy) a.busy = 2;
        if (options.unmapped) a.mappings = {};
        if (options.capacity !== undefined) {
            a.properties.max_neili = capacity(skill, l) + options.capacity;
            a.properties.neili = 2 * a.properties.max_neili - 10;
        }
        add('exercise', skill, 'exercise', variant, a, { method: 'exercise', operation: 'exercise',
            dependencies: ['exercising', 'halt_exercise', 'halt_command', 'current_capacity'], expected: options.expected,
            parameters: { action: `exercise ${cost}`, exercise_cost: cost, halt_after: options.halt ? 1 : 0,
                fighting: options.fighting ?? false, room: options.room ?? {},
                observation: 'original_heartbeat_until_terminal', observe_seconds: 30, watchdog_seconds: 90,
                timing_scope: 'original_heartbeat_and_halt_not_accelerated; watchdog_is_error_only' } });
    };
    for (const skill of forces) for (const l of [200, 400, 800]) exercise(skill, 'level' + l, l);
    for (const [variant, options] of [
        ['minimum10', { cost: 10 }], ['cost9', { cost: 9, expected: 'refused' }],
        ['qi9', { cost: 10, properties: { qi: 9 }, expected: 'refused' }],
        ['jing6999', { properties: { jing: 6999 }, expected: 'refused' }],
        ['jing7000', { cost: 10, properties: { jing: 7000 } }],
        ['busy', { busy: true, expected: 'refused' }], ['fighting', { fighting: true, expected: 'refused' }],
        ['unmapped', { unmapped: true, expected: 'refused' }], ['no-fight', { room: { no_fight: 1 }, expected: 'refused' }],
        ['allowed-room', { cost: 10, room: { no_fight: 1, can_dazuo: 1 } }],
        ['below-cap', { cost: 10, capacity: -1 }], ['at-cap', { cost: 10, capacity: 0 }], ['above-cap', { cost: 10, capacity: 1 }],
        ['below-threshold', { cost: 10, properties: { max_neili: 1000, neili: 1989 } }],
        ['at-threshold', { cost: 10, properties: { max_neili: 1000, neili: 1990 } }],
        ['room-bonus', { room: { exercise_improve: 100 } }], ['halt', { cost: 1000, halt: true }],
        ['halt-overcharge', { cost: 1000, halt: true, properties: { neili: 12001 } }],
    ]) exercise(xinfa, variant, 200, options);
    for (const [variant, delta] of [['below-cap', -1], ['at-cap', 0]])
        exercise(shengong, variant, 200, { cost: 10, capacity: delta });
    // C: one actual normal attack, not a direct call or guaranteed parent-force reflection.
    for (const [variant, l, mode] of [[ 'defender200', 200, '' ], [ 'defender400', 400, '' ],
        [ 'defender800', 800, '' ], [ 'jiali0', 200, 'zero' ], [ 'held-sword', 200, 'weapon' ], [ 'equal-force', 200, 'equal' ]]) {
        const a = actor(xinfa, mode === 'equal' ? 200 : 100), target = actor(xinfa, l);
        Object.assign(a.properties, { neili: 1000, max_neili: 1000, jiali: mode === 'zero' ? 0 : 50 });
        Object.assign(target.properties, { neili: 3000, max_neili: 3000 });
        if (mode === 'weapon') { a.skills.sword = 200; a.equipment = { type: 'sword', hold: false }; }
        add('inherited-hit', xinfa, 'inherited_hit_ob', variant, a, { method: 'ordinary', operation: 'parent_hit_ob',
            target, random: true, parameters: { fighting: true, observation: 'single_original_regular_attack',
                passive_scope: 'attacker_mapped_force_parent; miss/parry/no_hook remain separate; mixed return preserved',
                attack_attempts: 1, source_derived_local_factor: null, actual_reflection: 'unobserved_until_native' } });
    }
    // D: two compatibility refusals and five capacities, not skill-state migration.
    for (const [known, requested] of [['huashan-xinfa', shengong], [shengong, 'huashan-xinfa']])
        add('capacity', requested, 'can_learn', 'known-' + known, actor(known), { method: 'interface', operation: 'can_learn',
            dependencies: ['shengong_compatibility', 'huashan_compatibility'], expected: 'refused',
            parameters: { interface: { object: '/cmds/skill/learn', function: 'can_learn', argument: requested } } });
    for (const l of [200, 400, 800]) add('capacity', shengong, 'query_neili_limit', 'total' + l, actor(shengong, l),
        { method: 'interface', operation: 'total_capacity', dependencies: ['shengong_capacity'], parameters: {
            interface: { object: 'player', function: 'query_neili_limit' },
            source_derived_capacity: capacity(shengong, l), prediction_scope: 'source_derived_not_observed' } });
    const mixed = actor(shengong, 400); mixed.skills[xinfa] = 800;
    for (const [fn, op, prediction] of [['query_neili_limit', 'total_capacity', 10000],
        ['query_current_neili_limit', 'current_capacity', 7920]])
        add('capacity', shengong, fn, 'mixed-' + op, mixed, { method: 'interface', operation: op,
            dependencies: ['shengong_capacity'], parameters: { interface: { object: 'player', function: fn },
                source_derived_capacity: prediction, prediction_scope: 'source_derived_not_observed' } });
    // E: long original timers; only these nine smoke conditions have one repetition.
    for (const [skill, ability, op, remove] of [[xinfa, 'powerup', 'xinfa_powerup', 'xinfa_remove'],
        [shengong, 'powerup', 'shengong_powerup', 'shengong_remove'], [shengong, 'shield', 'shengong_shield', 'shield_remove']])
        for (const l of [200, 400, 800]) {
            const a = actor(skill, l), delay = skill === xinfa ? Math.trunc(l / 2) + l : l;
            a.temp = ability === 'shield' ? { 'apply/armor': 107 }
                : { 'apply/attack': 7, 'apply/dodge': 11, 'apply/parry': 13 };
            add('expiry', skill, ability, ability + l, a, { operation: op, dependencies: ['exert_command', remove],
                long_expiry: true, parameters: { observation: 'original_callback_until_terminal', observe_seconds: delay + 2,
                    original_delay_seconds: delay, watchdog_seconds: delay + 60,
                    timing_scope: 'original_start_call_out; natural callback and final state required; watchdog_is_error_only' } });
        }
    // F: healing lifecycle; original MA-080 pending residue is observed, never repaired.
    const healing = (skill, ability, variant, l = 200, options = {}) => {
        const a = actor(skill, l), key = ability === 'heal' ? 'qi' : 'jing';
        a.properties[key] = a.properties['eff_' + key] = 9700;
        a.properties.breakup = ability === 'inspire' ? 1 : 0;
        Object.assign(a.properties, options.properties);
        add('healing', skill, ability, ability + '-' + variant, a, { method: 'healing',
            dependencies: ['exert_command', ability === 'heal' ? 'healing' : 'inspiring',
                ability === 'heal' ? 'halt_healing' : 'halt_inspiring', 'halt_command'], expected: options.expected,
            parameters: { observation: 'original_heartbeat_until_terminal', observe_seconds: 90, watchdog_seconds: 90,
                halt_after: options.halt ? 1 : 0, expected_end: options.end ?? 'completed',
                known_source_issue: ability === 'inspire' ? 'MA-080; preserve original pending-field residue' : '',
                timing_scope: 'original callback/HB/halt; natural heal_up is separate; no manual terminal' } });
    };
    for (const skill of forces) {
        for (const l of [200, 400, 800]) for (const ability of ['heal', 'inspire']) healing(skill, ability, 'level' + l, l);
        healing(skill, 'heal', 'neili50', 200, { properties: { neili: 50 }, end: 'depleted' });
        healing(skill, 'heal', 'halt', 200, { halt: true, end: 'halted' });
        healing(skill, 'inspire', 'neili299', 200, { properties: { neili: 299 }, end: 'depleted' });
        healing(skill, 'inspire', 'halt', 200, { halt: true, end: 'halted' });
        healing(skill, 'inspire', 'no-breakup', 200, { properties: { breakup: 0 }, expected: 'refused', end: 'refused' });
        healing(skill, 'inspire', 'raw199', 199, { expected: 'refused', end: 'refused' });
    }
    // G: actual initial condition, not the old empty-condition dispel samples or natural infection.
    for (const skill of forces) for (const other of [false, true]) for (const variant of ['clear', 'partial', 'insufficient', 'undispellable']) {
        const a = actor(skill), target = actor(xinfa), victim = other ? target : a;
        const name = variant === 'undispellable' ? 'bandaged' : 'freezing';
        victim.conditions = { [name]: name === 'bandaged' ? 20 : {
            level: variant === 'insufficient' ? other ? 241 : 291 : 200,
            remain: variant === 'partial' ? 20000 : 100, id: 'foreign', name: '寒冰真气' } };
        add('dispel', skill, 'dispel', (other ? 'other-' : 'self-') + variant, a, { target, random: name !== 'bandaged',
            dependencies: ['exert_command', name === 'bandaged' ? 'bandaged_dispel' : 'freezing_dispel',
                ...(name === 'freezing' ? ['poison_dispel'] : [])], parameters: {
                action: `exert dispel${other ? ' right' : ''}`, other, condition_name: name,
                condition_origin: 'explicit_original_apply_condition_not_natural_poison',
                planned_condition_change: variant === 'clear' ? 'cleared' : variant === 'partial' ? 'reduced' : 'retained',
                condition_scope: 'immediate only; no manual tick/clear or expiry evidence' } });
    }
    // H: only original repeat/refill sequences, with minimum additional actual public-force qualifications.
    for (const skill of forces) for (const ability of ['power', 'tianmo']) {
        const a = actor(skill, 400), refill = ability === 'power' ? 6000 : 8000;
        a.skills['martial-cognize'] = ability === 'power' ? 120 : 300;
        if (ability === 'tianmo') Object.assign(a.properties, { neili: 8000, max_neili: 8000, shen: -10000000 });
        add('repeat', skill, ability, ability, a, { random: ability === 'tianmo', dependencies: ['exert_command'], parameters: {
            buff_steps: [{ command: 'exert ' + ability }, { command: 'exert ' + ability },
                { refill_neili: refill }, { command: 'exert ' + ability }],
            sequence_scope: 'same USER; original flag/attribute/refusals; explicit refill separate; no expiry/storage claim' } });
    }
    // I: nine immediate deterministic deltas, excluding the three already recorded level200 cases.
    const recovery = (skill, ability, l) => {
        const a = actor(skill, l); a.properties[ability === 'recover' ? 'qi' : 'jing'] = 9900;
        add('recovery', skill, ability, ability + l, a, { dependencies: ['exert_command'] });
    };
    recovery(xinfa, 'regenerate', 200);
    for (const skill of forces) for (const l of [400, 800]) for (const ability of ['recover', 'regenerate']) recovery(skill, ability, l);
    assert.equal(out.length, 112); assert.equal(new Set(out.map(c => c.id)).size, 112);
    assert.equal(out.reduce((n, c) => n + c.parameters.formal_samples, 0), 2772);
    assert.equal(out.reduce((n, c) => n + c.parameters.smoke_samples, 0), 215);
    return out;
}

function sourceEntries(p, evidence) {
    return p.operation_keys.map(key => ({ ...copy(bindings[key]), sha256: evidence[bindings[key].path] }));
}
export function mingjiaoForceRemainingConditions(catalog, readSource, options = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(options && typeof options === 'object' && !Array.isArray(options));
    assert.ok(Object.keys(options).every(k => k === 'smoke'), 'only explicit smoke mode; fixed samples');
    const smoke = Object.hasOwn(options, 'smoke') ? options.smoke : false; assert.equal(typeof smoke, 'boolean');
    const text = {}, evidence = {};
    for (const path of mingjiaoForceRemainingSourcePaths) {
        const bytes = readSource(path); assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        evidence[path] = sha(bytes); text[path] = Buffer.isBuffer(bytes) ? bytes.toString('utf8') : bytes;
    }
    assert.equal(sourceHash(evidence), mingjiaoForceRemainingReviewedSourceHash, 'reviewed source changed');
    for (const path of mingjiaoForceRemainingAbsentPaths) {
        let absent = false;
        try { const bytes = readSource(path); absent = bytes === null || bytes === undefined; }
        catch (error) { if (error.code === 'ENOENT') absent = true; else throw error; }
        assert.ok(absent, 'native fallback appeared: ' + path);
    }
    assert.ok(Array.isArray(catalog?.skills));
    for (const path of mingjiaoForceRemainingSourcePaths.filter(p => p.startsWith('kungfu/skill/'))) {
        const sources = catalog.skills.filter(s => s.path === path);
        assert.equal(sources.length, 1, 'unique catalog file: ' + path);
        assert.equal(sources[0].id, path.slice('kungfu/skill/'.length, -2));
        assert.equal(sources[0].sha256, evidence[path], 'catalog source pin: ' + path);
    }
    for (const b of Object.values(bindings)) {
        const line = text[b.path].split('\n')[b.line - 1];
        assert.match(line, new RegExp('\\b' + b.function + '\\([^;]*\\)\\s*\\{'), 'actual source definition: ' + b.entry_id);
        if (!b.catalog) continue;
        const s = catalog.skills.find(s => s.path === b.path), entries = s.entries.filter(e => e.id === b.entry_id);
        assert.equal(entries.length, 1, 'unique catalog entry: ' + b.entry_id);
        const e = entries[0]; assert.equal(e.function, b.function); assert.equal(e.role, b.role);
        assert.equal(e.evidence.path, b.path); assert.equal(e.evidence.line, b.line); assert.equal(e.evidence.sha256, evidence[b.path]);
    }
    return plans().map(c => ({ ...c, samples: smoke ? c.parameters.smoke_samples : c.parameters.formal_samples,
        parameters: { ...c.parameters, run_mode: smoke ? 'smoke' : 'formal',
            source_evidence: copy(evidence), reviewed_source_hash: mingjiaoForceRemainingReviewedSourceHash,
            source_entries: sourceEntries(c.parameters, evidence), absent_sources: [...mingjiaoForceRemainingAbsentPaths],
            qualification_evidence: mingjiaoForceRemainingSourcePaths.map(path => ({ path, sha256: evidence[path] })) } }));
}
export function validateMingjiaoForceRemainingCondition(c) {
    assert.ok(c && typeof c === 'object' && !Array.isArray(c));
    assert.deepEqual(Object.keys(c).sort(), ['entry_id', 'id', 'method', 'parameters', 'samples', 'stage', 'status']);
    const plan = plans().find(v => v.id === c.id); assert.ok(plan, 'unknown finite force condition');
    for (const key of ['entry_id', 'stage', 'method', 'status']) assert.equal(c[key], plan[key], key);
    const { run_mode, source_evidence: evidence, reviewed_source_hash, source_entries,
        absent_sources, qualification_evidence, ...p } = c.parameters;
    assert.ok(['formal', 'smoke'].includes(run_mode), 'explicit run mode required');
    assert.equal(c.samples, run_mode === 'smoke' ? plan.parameters.smoke_samples : plan.parameters.formal_samples,
        'samples must match declared run mode; future report must bind original manifest');
    assert.deepEqual(p, plan.parameters, 'fixed finite plan drifted');
    assert.deepEqual(Object.keys(evidence), [...mingjiaoForceRemainingSourcePaths]);
    for (const value of Object.values(evidence)) assert.match(value, /^[a-f0-9]{64}$/);
    assert.equal(sourceHash(evidence), mingjiaoForceRemainingReviewedSourceHash);
    assert.equal(reviewed_source_hash, mingjiaoForceRemainingReviewedSourceHash);
    assert.deepEqual(source_entries, sourceEntries(p, evidence));
    assert.deepEqual(absent_sources, [...mingjiaoForceRemainingAbsentPaths]);
    assert.deepEqual(qualification_evidence, mingjiaoForceRemainingSourcePaths.map(path => ({ path, sha256: evidence[path] })));
    return c.parameters;
}
