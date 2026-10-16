// Explicitly synthetic observation-contract tests, not native capacity samples.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { mingjiaoJiuyangCapacityConditions } from './school_mingjiao_jiuyang_capacity_cases.mjs';
import { validateMingjiaoJiuyangCapacityRecord } from './school_mingjiao_jiuyang_capacity_observation.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const source = path => readFileSync(resolve(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const main = 'kungfu/skill/jiuyang-shengong.c';
const catalog = { skills: [{ path: main, sha256: hash(source(main)) }] };
const conditions = mingjiaoJiuyangCapacityConditions(catalog, source);
const copy = value => structuredClone(value);
const selected = (variant, ability = 'query_neili_limit') => conditions.find(c =>
    c.parameters.variant === variant && c.parameters.ability === ability);

function snapshot(config, side) {
    const { properties: p, skills: s } = config;
    const state = {
        object: '/tests/actor#' + (side + 21), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        busy: null, fighting_opponent: 0, conditions: null,
        skills: copy(s), mappings: copy(config.mappings), preparations: {}, learned: {},
        temp: { user_setup: 1, apply: { armor: 100 } }, cultivation: {
            sex: null, 'immune/poison': null, 'wudang-jiuyang': null, 'special_skill/divine': null,
        },
        effective_skills: Object.fromEntries(Object.entries(s).map(([key, value]) =>
            [key, Math.floor(value / 2) + (key === 'force' ? s['jiuyang-shengong'] : 0)])),
        effective_str: p.str + s.unarmed / 10, effective_con: p.con + s.force / 10,
        effective_int: p.int, effective_dex: p.dex + s.dodge / 10,
        craze: 0, max_craze: 5000, force_attribute: null, age: 25,
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {},
        weapon_damage: 0, weapon_flag: 0, ammunition: 0,
        nothing: null, dugu_grants: { qi: null, po: null },
    };
    for (const [key, value] of Object.entries(p)) {
        if (['name', 'race'].includes(key)) continue;
        if (key.includes('/') || ['class', 'character', 'reborn', 'doing', 'breakup'].includes(key))
            state.cultivation[key] = value;
        else state[key] = value;
    }
    return state;
}

function synthetic(condition, cost = 1) {
    const p = condition.parameters, before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const owner = p.ability === 'query_neili_improve' ? '/kungfu/skill/jiuyang-shengong' : '/clone/user/user';
    return {
        kind: 'sample', condition_id: condition.id, method: 'interface', index: 0,
        outcome: 'observed', reason: '', elapsed: 0.01, command_accepted: cost,
        before, immediate: copy(before), after: copy(before), metrics: [{}, {}],
        actions: [], attacks: [], directs: [], passives: [], defenses: [], dodge_checks: [],
        launches: [], refusals: [], callbacks: [], dropped: [], terminals: [],
        background_stopped: [], skill_messages: [],
        interfaces: [{ object: p.interface.object, function: p.ability,
            result: p.expected_return, implemented_by: owner }],
        interface_steps: [{ command: 'test_interface', entry_actor: before[0].object,
            return_actor: before[0].object, before: copy(before[0]), after: copy(before[0]),
            result: p.expected_return, implemented_by: owner, reason: '', messages: [] }],
    };
}
function deny(mutate, condition = conditions[0]) {
    const raw = synthetic(condition), original = copy(raw);
    mutate(raw); assert.notDeepEqual(raw, original, 'negative edit must not be a no-op');
    assert.throws(() => validateMingjiaoJiuyangCapacityRecord(raw, condition));
}
function everyActorState(raw, edit) {
    for (const phase of ['before', 'immediate', 'after']) edit(raw[phase][0]);
    edit(raw.interface_steps[0].before); edit(raw.interface_steps[0].after);
}

test('all 23 frozen conditions and both indices are synthetic only; no raw rewriting', () => {
    assert.equal(conditions.length, 23);
    assert.equal(hash(JSON.stringify(conditions)), 'c63b87553793c1f53973f277c3213299ecf26ed6e221c378029aba32ad523cdc');
    assert.equal(conditions.reduce((sum, c) => sum + c.samples, 0), 46);
    assert.deepEqual(mingjiaoJiuyangCapacityConditions(catalog, source, { smoke: true }), conditions);
    for (const c of conditions) for (const index of [0, 1]) {
        const raw = synthetic(c); raw.index = index; const original = copy(raw), frozen = copy(c);
        const result = validateMingjiaoJiuyangCapacityRecord(raw, c);
        assert.equal(result.interface_value, c.parameters.expected_return);
        assert.equal(result.commands_accepted, 1); assert.equal(result.interface_calls, 1);
        assert.deepEqual(raw, original); assert.deepEqual(c, frozen);
        assert.equal(c.status, 'prepared_not_sampled'); assert.ok(!Object.hasOwn(raw, 'parameters'));
    }
});

test('source-derived independent numeric anchors distinguish bonus/current/all and raw con modifiers', () => {
    for (const [level, bonus, limit] of [[200, 750, 3750], [400, 3000, 9000], [800, 12000, 24000]])
        for (const [ability, value] of [['query_neili_improve', bonus], ['query_current_neili_limit', limit], ['query_neili_limit', limit]]) {
            const c = selected('level' + level, ability);
            assert.equal(validateMingjiaoJiuyangCapacityRecord(synthetic(c), c).interface_value, value);
        }
    for (const [variant, value] of [['improve10', 4125], ['breakup', 5250], ['mystery', 4350],
        ['guimai', 4312], ['bonze-shaolin', 4250], ['bonze-mingjiao', 3750]]) {
        const c = selected(variant);
        assert.equal(validateMingjiaoJiuyangCapacityRecord(synthetic(c), c).interface_value, value);
    }
    for (const [ability, value] of [['query_current_neili_limit', 3750], ['query_neili_limit', 23000]]) {
        const c = selected('owned-force1000', ability);
        assert.equal(validateMingjiaoJiuyangCapacityRecord(synthetic(c), c).interface_value, value);
    }
});

test('original positive integer command cost is preserved but one command stays one accepted query', () => {
    for (const c of conditions) for (const cost of [1, 23, 476, Number.MAX_SAFE_INTEGER]) {
        const raw = synthetic(c, cost), result = validateMingjiaoJiuyangCapacityRecord(raw, c);
        assert.equal(result.command_cost, cost); assert.equal(raw.command_accepted, cost);
        assert.equal(result.commands, 1); assert.equal(result.commands_accepted, 1);
    }
    for (const value of [0, -1, 1.5, undefined, null, false, '23', {}, [], NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
        deny(r => { r.command_accepted = value; });
    deny(r => { delete r.command_accepted; });
});

test('original receiver owner, method, USER entry/return and exactly one call are required', () => {
    for (const c of [conditions[0], selected('level200')]) {
        for (const change of [
            r => { r.interfaces[0].implemented_by = '/tests/actor'; },
            r => { r.interface_steps[0].implemented_by = null; },
            r => { r.interfaces[0].function = 'improve_neili'; },
            r => { r.interfaces[0].object = '/clone/user/user'; },
            r => { r.interface_steps[0].command = 'improve_neili'; },
            r => { r.interface_steps[0].entry_actor = r.before[1].object; },
            r => { r.interface_steps[0].return_actor = '/tests/actor#999'; },
            r => { r.interfaces.push(copy(r.interfaces[0])); },
            r => { r.interface_steps.push(copy(r.interface_steps[0])); },
            r => { r.interface_steps[0].accepted = 1; },
            r => { r.interface_steps[0].before.neili--; },
            r => { r.interface_steps[0].after.max_neili++; },
        ]) deny(change, c);
        for (const key of ['implemented_by', 'object', 'function', 'result'])
            deny(r => { delete r.interfaces[0][key]; }, c);
        for (const key of Object.keys(synthetic(c).interface_steps[0]))
            deny(r => { delete r.interface_steps[0][key]; }, c);
    }
});

test('missing capacity context is rejected instead of fabricating the future runner wiring', () => {
    for (const key of Object.keys(synthetic(conditions[0]))) deny(r => { delete r[key]; });
    for (const key of ['before', 'after', 'immediate', 'metrics', 'interfaces', 'interface_steps'])
        for (const value of [null, 0, {}, []]) deny(r => { r[key] = value; });
    for (const key of ['extra_target_before', 'extra_target_immediate', 'extra_target_after',
        'extra_target_metrics', 'preparation']) deny(r => { r[key] = {}; });
});

test('initial identities/configs/effective values reject coherent but incorrect fabricated state', () => {
    for (const edit of [
        s => { s.object = '/tests/teaching_actor#21'; }, s => { s.id = 'right'; },
        s => { s.userp = 0; }, s => { s.playerp = 0; }, s => { s.interactive = 0; },
        s => { s.wizardp = 1; }, s => { s.ghost = 1; }, s => { s.busy = 1; },
        s => { s.fighting_opponent = 1; }, s => { s.skills.force++; },
        s => { s.mappings.force = 'shenghuo-shengong'; }, s => { s.preparations.force = 'jiuyang-shengong'; },
        s => { s.learned.force = 1; }, s => { s.max_neili++; }, s => { s.con = 60; },
        s => { s.effective_con++; }, s => { s.effective_int++; }, s => { s.effective_str++; },
        s => { s.effective_dex++; }, s => { s.effective_skills.force++; },
        s => { s.cultivation.breakup = 1; }, s => { s.cultivation['special_skill/mystery'] = 1; },
        s => { s.cultivation.class = 'bonze'; }, s => { s.cultivation['family/family_name'] = '少林派'; },
        s => { s.cultivation.reborn = {}; }, s => { s.temp.apply.force = 1; },
        s => { s.temp.unobserved_buff = 1; }, s => { s.weapon = 'sword'; },
        s => { s.handing_details = { object: '/tests/sword#1' }; },
    ]) deny(r => everyActorState(r, edit));
    deny(r => { r.before[1].object = r.before[0].object; });
    deny(r => { r.before[1].interactive = 0; });
});

test('explicit LPC false/empty representations are allowed only for observed zero fields', () => {
    for (const value of [0, null, {}]) {
        const c = conditions[0], raw = synthetic(c);
        everyActorState(raw, s => { s.conditions = copy(value); });
        assert.equal(validateMingjiaoJiuyangCapacityRecord(raw, c).interface_calls, 1);
    }
    const zeroFields = [s => s, s => s.cultivation];
    for (const [container, keys] of [[zeroFields[0], ['busy', 'ghost', 'wizardp', 'fighting_opponent', 'force_attribute']],
        [zeroFields[1], ['reborn', 'breakup', 'doing', 'special_skill/mystery', 'immune/poison']]]) {
        for (const key of keys) {
            for (const value of [0, null]) {
                const c = conditions[0], raw = synthetic(c);
                everyActorState(raw, s => { container(s)[key] = value; });
                assert.ok(validateMingjiaoJiuyangCapacityRecord(raw, c));
            }
            for (const value of [undefined, false, '', '0', [], {}])
                deny(r => everyActorState(r, s => { container(s)[key] = value; }));
            deny(r => everyActorState(r, s => { delete container(s)[key]; }));
        }
    }
    for (const value of [undefined, false, '', [], { poison: 1 }])
        deny(r => everyActorState(r, s => { s.conditions = value; }));
    for (const key of ['skills', 'mappings', 'preparations', 'learned', 'temp', 'cultivation']) {
        deny(r => everyActorState(r, s => { delete s[key]; }));
        deny(r => everyActorState(r, s => { s[key] = null; }));
    }
});

test('read-only query rejects skill/resource/permission/temp changes on either USER at every boundary', () => {
    for (const phase of ['immediate', 'after']) for (const side of [0, 1]) for (const key of
        ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili',
            'jingli', 'max_jingli', 'potential', 'learned_points', 'combat_exp'])
        deny(r => { r[phase][side][key]--; });
    for (const edit of [s => { s.skills.force++; }, s => { s.learned.force = 1; },
        s => { s.cultivation['can_learn/jiuyang-shengong/enable_weapon'] = 0; },
        s => { s.temp.notify_fail = 'unexpected'; }, s => { s.unobserved_extra = 1; }])
        for (const phase of ['immediate', 'after']) for (const side of [0, 1]) deny(r => edit(r[phase][side]));
});

test('sparse zero metrics require a mapping; counters and messages never conceal an event', () => {
    const c = conditions[0], raw = synthetic(c); raw.metrics = [{ qi_cost: 0, jing_cost: 0 }, { neili_cost: 0, heartbeats: 0 }];
    assert.ok(validateMingjiaoJiuyangCapacityRecord(raw, c));
    for (const side of [0, 1]) {
        for (const value of [null, 0, [], undefined]) deny(r => { r.metrics[side] = value; });
        for (const value of [1, -1, null, '0', false, 0.5, undefined])
            deny(r => { r.metrics[side].neili_cost = value; });
    }
    for (const key of ['actions', 'attacks', 'directs', 'passives', 'defenses', 'dodge_checks', 'launches',
        'refusals', 'callbacks', 'dropped', 'terminals', 'background_stopped', 'skill_messages'])
        deny(r => { r[key].push({ side: 0 }); });
    deny(r => { r.interface_steps[0].messages = [{ side: 0, type: 'write', text: 'unexpected' }]; });
    deny(r => { r.busy_calls = [{ side: 0, value: 1 }]; });
    deny(r => { r.busy_calls = null; });
});

test('capacity result is the original safe integer, never null/zero/rounded or another formula', () => {
    for (const c of conditions) for (const value of [null, 0, false, '3750', undefined, -1, 1.5,
        Number.MAX_SAFE_INTEGER + 1, c.parameters.expected_return + 1])
        deny(r => { r.interfaces[0].result = value; r.interface_steps[0].result = value; }, c);
    deny(r => { r.interfaces[0].result = 23000; r.interface_steps[0].result = 23000; },
        selected('owned-force1000', 'query_current_neili_limit'));
    deny(r => { r.interfaces[0].result = 3750; r.interface_steps[0].result = 3750; }, selected('owned-force1000'));
});

test('diagnostics stay unknown, with strict original identity/index/elapsed/reason', () => {
    const c = conditions[0];
    for (const outcome of ['error', 'not_applicable']) {
        const raw = { kind: 'sample', condition_id: c.id, method: 'interface', index: 0,
            elapsed: 0.2, outcome, reason: 'original failure' };
        assert.equal(validateMingjiaoJiuyangCapacityRecord(raw, c), null);
        for (const edit of [r => { delete r.reason; }, r => { r.reason = ' '; },
            r => { r.elapsed = -1; }, r => { r.elapsed = null; }, r => { r.elapsed = NaN; },
            r => { r.index = 2; }, r => { r.index = 0.5; }, r => { r.index = undefined; },
            r => { r.condition_id += '-wrong'; }, r => { r.method = 'yanlian'; }, r => { r.kind = 'event'; }]) {
            const changed = copy(raw); edit(changed);
            assert.throws(() => validateMingjiaoJiuyangCapacityRecord(changed, c));
        }
    }
    for (const outcome of ['unknown', 'refused', '', null, undefined]) deny(r => { r.outcome = outcome; });
    deny(r => { r.reason = 'unexplained'; });
});

test('record consumer revalidates the fixed condition, source pin and catalog entry', () => {
    const c = conditions[0], raw = synthetic(c);
    for (const edit of [x => { x.parameters.source_evidence['clone/user/user.c'] = '0'.repeat(64); },
        x => { delete x.parameters.source_evidence['kungfu/skill/jiuyang-shengong.c']; },
        x => { x.parameters.reviewed_source_hash = '0'.repeat(64); },
        x => { x.parameters.qualification_sources.reverse(); },
        x => { x.parameters.qualification_evidence.reverse(); },
        x => { x.parameters.interface.function = 'improve_neili'; },
        x => { x.parameters.expected_return++; }, x => { x.parameters.actor.properties.con++; },
        x => { x.entry_id = 'clone/user/user.c'; }, x => { x.samples = 3; },
        x => { x.status = 'complete'; }, x => { x.id += '-unknown'; }, x => { x.method = 'yanlian'; }]) {
        const altered = copy(c); edit(altered); assert.notDeepEqual(altered, c);
        assert.throws(() => validateMingjiaoJiuyangCapacityRecord(raw, altered));
    }
});
