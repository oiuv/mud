// Hand-anchored synthetic observations, NOT native samples or an expected-distribution generator.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { mingjiaoRemainingPerformConditions as factory } from './school_mingjiao_remaining_perform_cases.mjs';
import { validateMingjiaoRemainingPerformRecord as check } from './school_mingjiao_remaining_perform_record.mjs';

const root = new URL('../../../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const sha = value => createHash('sha256').update(value).digest('hex');
const copy = value => structuredClone(value);
const anchors = [['pili-quan', 'jin', 10], ['pili-shou', 'hun', 10], ['tougu-zhen', 'feng', 10],
    ['yinfeng-dao', 'jue', 10], ['yinhu-zhang', 'lao', 8], ['sougu-yingzhua', 'xue', 8],
    ['sougu-yingzhua', 'ying', 7], ['duoming-jinhua', 'hua', 9], ['xiaoyao-jian', 'fei', 8],
    ['xiaoyao-jian', 'kuai', 8], ['xiaoyao-jian', 'qi', 8], ['nianhua-zhi', 'fuxue', 7],
    ['sanhua-zhang', 'san', 8], ['longzhua-gong', 'zhua', 8], ['fengyun-shou', 'qinna', 8],
    ['pomopima-jian', 'zui', 8], ['qiankun-danuoyi', 'nuoyi', 7]];
const catalog = { skills: [
    ...[...new Set(anchors.map(x => x[0]))].map(skill => ({ id: skill, base_skill: skill, top_level: true,
        path: `kungfu/skill/${skill}.c`, sha256: sha(read(`kungfu/skill/${skill}.c`)), entries: [] })),
    ...anchors.map(([skill, ability, line]) => {
        const path = `kungfu/skill/${skill}/${ability}.c`, hash = sha(read(path));
        return { id: `${skill}/${ability}`, base_skill: skill, top_level: false, path, sha256: hash,
            entries: [{ id: `${path}:${line}:perform`, function: 'perform', role: 'perform', evidence: { path, line, sha256: hash } }] };
    }),
] };
const formal = factory(catalog, read), smoke = factory(catalog, read, { smoke: true });
const selected = (ability, variant = 'level400') => {
    const c = formal.find(c => c.parameters.ability === ability && c.parameters.variant === variant);
    assert.ok(c, ability + '/' + variant); return c;
};
function item(cfg, side) {
    if (!cfg) return {};
    const program = cfg.program ?? '/tests/' + cfg.type, petal = program === '/clone/weapon/flower_leaf';
    return { object: program + '#' + (800 + side), program, skill_type: cfg.type,
        flag: petal ? 8 : 4, weight: petal ? cfg.amount : 3000, material: null, rigidity: null,
        consistence: 100, damage: petal ? 2 : 50, no_wield: petal ? '暗器不是用来装备的。\n' : null,
        amount: petal ? cfg.amount : null, daub: {} };
}
function state(cfg, side, p, awake = false) {
    const s = { ...copy(cfg.properties), object: '/tests/actor#' + (100 + side), id: ['left', 'right', 'third'][side],
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, ghost: 0, living: 1, not_living: null,
        busy: cfg.busy ?? null, fighting_opponent: Number(p.fighting), killing_opponent: Number(p.fighting),
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations),
        learned: {}, learned_raw: null, learned_kind: 'undefined', conditions: null, cultivation: copy(cfg.properties),
        temp: copy(cfg.temp ?? {}), effective_skills: {},
        effective_int: cfg.properties.int + Math.trunc((cfg.skills.literate ?? 0) / 10),
        effective_dex: cfg.properties.dex + Math.trunc((cfg.skills.dodge ?? 0) / 10),
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {}, secondary_weapon: 'none',
        secondary_weapon_details: {}, ammunition: 0, weapon_flag: 0, weapon_damage: 0 };
    s.cultivation[`can_perform/${p.skill}/${p.ability}`] ??= null;
    for (const [key, value] of Object.entries(cfg.skills)) s.effective_skills[key] = Math.trunc(value / 2)
        + (cfg.skills[cfg.mappings[key]] ?? 0) - (key === 'dodge' && cfg.equipment && !cfg.equipment.hold ? 1 : 0);
    if (cfg.equipment) {
        const slot = cfg.equipment.hold ? 'handing' : 'weapon';
        s[slot] = cfg.equipment.type; s[slot + '_details'] = item(cfg.equipment, side);
        if (cfg.equipment.hold) s.ammunition = s.handing_details.amount;
        else { s.weapon_flag = s.weapon_details.flag; s.weapon_damage = s.weapon_details.damage; }
    }
    if (side === 1 && p.target_state === 'unconscious' && !awake) {
        s.living = 0; s.qi = 0; s.jing = 0; s.temp.block_msg = { all: 1 };
    }
    return s;
}
function trace(c, options = {}) {
    const p = c.parameters, accepted = options.accepted ?? p.expected === 'observed';
    const before = [state(p.actor, 0, p), state(p.target, 1, p)];
    if (p.extra_target) before.push(state(p.extra_target, 2, p));
    const end = copy(before), metrics = before.map(() => ({}));
    const raw = { kind: 'sample', condition_id: c.id, method: 'perform', index: 0, elapsed: 0.012,
        outcome: accepted ? 'observed' : 'refused', reason: accepted ? '' : '合成原拒绝正文\n',
        command_accepted: accepted ? options.cost ?? 23 : 0,
        command_context: { action: p.action, actor: before[0].object, force_me_source: '/feature/command' },
        before: before.slice(0, 2), launches: [], refusals: [], perform_steps: [], actions: [], attacks: [], directs: [],
        passives: [], busy_calls: [], skill_messages: [], needle_hits: [], terminals: [],
        enemy_context: { before: p.fighting ? (p.extra_target ? [1, 2] : [1]) : [] } };
    const decrease = (side, key, amount) => { end[side][key] -= amount; metrics[side][key + '_cost'] = (metrics[side][key + '_cost'] ?? 0) + amount; };
    const busy = (side, amount) => {
        raw.busy_calls.push({ side, caller_side: 0, requested: amount, before: end[side].busy,
            after: amount === 0 ? end[side].busy : amount, ...(amount === 0 ? { zero_return: 1 } : {}) });
        if (amount) end[side].busy = amount;
    };
    const attack = (actor, target, type = 0) => {
        raw.actions.push({ actor, target, skill: actor === 0 ? p.skill : null, action: { action: '合成招式；非实测', force: 1 } });
        raw.attacks.push({ actor, target, type, result: -1, damage: 0, neili: end[actor].neili, apply_attack: null });
        metrics[actor].dodge = (metrics[actor].dodge ?? 0) + 1;
    };
    if (accepted) {
        raw.launches.push({ actor: before[0].object, skill: p.skill, argument: p.action.slice(('perform ' + p.usage + '.').length) });
        metrics[0].ability_launched = 1;
        const direct = options.direct || options.poison;
        const fee = direct ? { jin: 120, hun: 300, feng: 280, jue: 350, lao: 180, xue: 200,
            qi: 300, san: 150, zhua: 180, qinna: 80, zui: 200 }[p.ability] : { jin: 80, hun: 200, feng: 50, jue: 150, lao: 100, xue: 100, ying: 0,
            hua: 100, fei: 120, kuai: 120, qi: 200, fuxue: 30, san: 50, zhua: 60, qinna: 20, zui: 100, nuoyi: 350 }[p.ability];
        if (fee) decrease(0, 'neili', fee);
        if (p.ability === 'hua') {
            end[0].ammunition -= 10; end[0].handing_details.amount -= 10;
            if (end[0].handing_details.amount) end[0].handing_details.weight = end[0].handing_details.amount;
            busy(0, 2); // Original set_amount(0) queues destruction without changing the old weight.
        } else if (p.ability === 'nuoyi') {
            busy(0, 2);
            if (options.self) { decrease(1, 'qi', 500000); decrease(1, 'eff_qi', 500000); }
            if (options.redirect) { attack(1, 2, null); attack(1, 2, null); busy(2, 1); }
        } else if (p.ability === 'kuai') {
            for (let i = 0; i < 4; i++) attack(0, 1);
            busy(0, 1);
            if (options.passive) {
                const passiveBefore = copy(end.slice(0, 2)); decrease(0, 'neili', 80); busy(1, 2);
                raw.passives.push({ actor: 0, target: 1, skill: 'xiaoyao-jian', incoming: 1, factor: 0, result: 1,
                    route: 'martial', neili_after: end[0].neili, target_eff_qi_after: end[1].eff_qi,
                    target_busy_after: end[1].busy, before: passiveBefore, after: copy(end.slice(0, 2)) });
            }
        } else busy(0, ['ying', 'fuxue', 'jin', 'feng'].includes(p.ability) ? p.ability === 'ying' ? 4 : 3 : 2);
        if (direct) {
            raw.directs.push({ actor: 0, target: 1, type: p.mechanics.direct_type === 'WEAPON_ATTACK' ? 1 : 0,
                percent: p.mechanics.direct_percent, damage: 123, weapon: before[0].weapon,
                weapon_object: before[0].weapon_details.object ?? '' });
            metrics[0].direct = 1; decrease(1, 'qi', 70); decrease(1, 'eff_qi', 30);
            if (before[0].jiali) decrease(0, 'neili', before[0].jiali); // Existing COMBAT resource probe.
        }
        if (options.poison) end[1].conditions = { [p.mechanics.poison.name]: { id: 'left', level: p.actor.properties.jiali,
            remain: p.actor.properties.jiali * Math.trunc(p.actor.skills[p.skill] / 50) } };
        if (options.weak) { end[0].learned_kind = 'mapping'; end[0].learned_raw = { [p.skill]: 1 }; end[0].learned = { [p.skill]: 1 }; }
    } else {
        raw.refusals.push({ actor: before[0].object, reason: raw.reason }); end[0].temp.notify_fail = raw.reason;
    }
    raw.immediate = copy(end.slice(0, 2));
    if (!p.actor.busy && !p.actor.temp?.no_perform) raw.perform_steps.push({ argument: p.action.slice(8),
        caller_side: 0, owner: '/cmds/skill/perform', before: copy(before), after: copy(end), accepted: Number(accepted), reason: accepted ? '' : raw.reason });
    if (p.ability === 'hua') {
        const point = s => ({ exists: Number(!!s.handing_details.object), item: copy(s.handing_details),
            handing: copy(s.handing_details), same_held: Number(!!s.handing_details.object) });
        raw.flower = { original_object: before[0].handing_details.object ?? '', before: point(before[0]), immediate: point(end[0]) };
        if (accepted && end[0].ammunition === 0) { end[0].handing = 'none'; end[0].handing_details = {}; }
        raw.flower.after = point(end[0]);
    }
    raw.after = copy(end.slice(0, 2)); raw.metrics = metrics.slice(0, 2);
    raw.enemy_context.immediate = copy(raw.enemy_context.before); raw.enemy_context.after = copy(raw.enemy_context.before);
    if (p.extra_target) {
        raw.extra_target_before = before[2]; raw.extra_target_immediate = copy(end[2]);
        raw.extra_target_after = copy(end[2]); raw.extra_target_metrics = metrics[2];
    }
    if (p.target_state === 'unconscious') raw.preparation = { before: state(p.target, 1, p, true), after: copy(before[1]),
        terminals: [{ side: 1, kind: 'unconcious' }] };
    return raw;
}
const bad = (c, edit, options) => { const raw = trace(c, options); edit(raw); assert.throws(() => check(raw, c)); };

test('synthetic anchors: command costs 1/23/476 are not acceptance counts; actual refusal does not read p.expected', () => {
    const c = selected('jin');
    for (const cost of [1, 23, 476]) {
        const r = check(trace(c, { cost }), c); assert.equal(r.command_cost, cost); assert.equal(r.commands_accepted, 1);
    }
    const refused = check(trace(c, { accepted: false }), c);
    assert.equal(refused.outcome, 'refused'); assert.equal(refused.matched, false); assert.equal(refused.command_cost, 0);
    for (const cost of [-1, 1.5, null, '1', undefined, Number.MAX_SAFE_INTEGER + 1, 0]) bad(c, r => { r.command_accepted = cost; });
});
test('actual direct arguments remain separate from 70 qi / 30 eff_qi state deltas and unknown requested gross', () => {
    const c = selected('jin'), r = check(trace(c, { direct: true, weak: true }), c);
    assert.equal(r.direct_inputs[0].damage, 123); assert.equal(r.resources[1].qi.decrease, 70);
    assert.equal(r.resources[1].eff_qi.decrease, 30); assert.equal(r.learned_net[0]['pili-quan'], 1);
    assert.equal(r.unknown.requested_gross_damage, null); assert.equal(r.actual_calls.direct_inputs, 1);
    bad(c, r => { r.metrics[0].direct = 0; }, { direct: true });
    bad(c, r => { r.metrics[1].qi_cost++; }, { direct: true });
});
test('raw learned null/int0/mapping{} remain typed; absence and contradictory normalized views reject', () => {
    const c = selected('jin');
    for (const [kind, value] of [['undefined', null], ['undefined', 0], ['int', 0], ['mapping', {}]]) {
        const r = trace(c);
        for (const s of [...r.before, ...r.immediate, ...r.after, ...r.perform_steps.flatMap(s => [...s.before, ...s.after])]) {
            s.learned_kind = kind; s.learned_raw = copy(value);
        }
        check(r, c);
    }
    bad(c, r => { delete r.before[0].learned_raw; });
    bad(c, r => { r.before[0].learned_kind = 'mapping'; });
    bad(c, r => { r.after[0].learned = { fake: 1 }; });
});
test('early original busy and no_perform refusals have no fabricated do_perform step', () => {
    for (const variant of ['actor-busy1', 'no-perform']) {
        const c = selected('jin', variant), r = trace(c); assert.equal(r.perform_steps.length, 0);
        assert.equal(check(r, c).commands_accepted, 0);
        bad(c, x => { x.refusals = []; }); bad(c, x => { x.reason = 'different'; });
    }
});
test('flower actual amount10 destruction and amount11 same object remainder are separate phases', () => {
    for (const amount of [10, 11]) {
        const c = selected('hua', 'petals' + amount), raw = trace(c), r = check(raw, c);
        assert.equal(r.flower.consumed, 10); assert.equal(r.flower.destroyed_after_return, Number(amount === 10));
        assert.equal(raw.flower.immediate.item.weight, amount === 10 ? 10 : 1);
        bad(c, x => { x.flower.immediate.item.amount = 10; });
        bad(c, x => { x.flower.original_object = '/tests/throwing#800'; });
    }
});
test('flower preserves original no_wield reason and consistence100 without accepting malformed equipment', () => {
    const c = selected('hua'), raw = trace(c), original = JSON.stringify(raw);
    const editItems = (value, edit) => {
        if (!value || typeof value !== 'object') return;
        if (value.program === '/clone/weapon/flower_leaf') edit(value);
        Object.values(value).forEach(child => editItems(child, edit));
    };
    check(raw, c); assert.equal(JSON.stringify(raw), original);
    for (const phase of ['before', 'immediate', 'after']) {
        assert.equal(raw.flower[phase].item.no_wield, '暗器不是用来装备的。\n');
        assert.equal(raw.flower[phase].item.consistence, 100);
    }
    for (const value of [undefined, null, 0, 1, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, true, [], {}, '',
        '暗器不是用来装备的。', 'different reason\n']) {
        bad(c, r => editItems(r, item => { item.no_wield = value; }));
    }
    bad(c, r => editItems(r, item => { delete item.no_wield; }));
    for (const value of [undefined, null, 0, 99, 101, '100', {}, []])
        bad(c, r => editItems(r, item => { item.consistence = value; }));
    for (const [key, value] of [['damage', '2'], ['flag', '8'], ['weight', '50'], ['amount', '50'], ['rigidity', 'none']])
        bad(c, r => editItems(r, item => { item[key] = value; }));
});
test('standard sword and staff keep explicit empty no_wield; flower reason is not a generic equipment escape', () => {
    for (const c of [selected('hua', 'wrong-held-item'), selected('fei', 'wrong-primary')]) {
        const editItems = (value, edit) => {
            if (!value || typeof value !== 'object') return;
            if (value.program === '/tests/sword' || value.program === '/tests/staff') edit(value);
            Object.values(value).forEach(child => editItems(child, edit));
        };
        for (const noWield of [null, 0]) {
            const raw = trace(c); editItems(raw, item => { item.no_wield = noWield; }); check(raw, c);
        }
        for (const noWield of [undefined, 1, -1, 1.5, true, [], {}, '', '暗器不是用来装备的。\n'])
            bad(c, raw => editItems(raw, item => { item.no_wield = noWield; }));
        bad(c, raw => editItems(raw, item => { delete item.no_wield; }));
    }
});
test('flower raw hit_ob records preserve exact original object and recipient', () => {
    const c = selected('hua'), raw = trace(c);
    raw.needle_hits.push({ actor: 0, target: 1, program: '/clone/weapon/flower_leaf', object: raw.flower.original_object, damage_bonus: 100 });
    assert.equal(check(raw, c).actual_calls.equipment_hit_ob, 1);
    raw.needle_hits[0].object += '0'; assert.throws(() => check(raw, c));
});
test('NUOYI real self damage or side1->2 redirect is not mislabeled actor0 direct damage', () => {
    for (const self of [false, true]) {
        const c = selected('nuoyi', self ? 'weak-target' : 'middle-with-third'), raw = trace(c, { self, redirect: !self });
        const r = check(raw, c); assert.equal(r.actual_calls.attacks, self ? 0 : 2); assert.equal(r.actual_calls.direct_inputs, 0);
        if (self) { assert.equal(r.resources[1].qi.decrease, 500000); assert.equal(r.resources[1].eff_qi.decrease, 500000); }
        else {
            assert.equal(raw.attacks[0].actor, 1); assert.equal(raw.actions[0].skill, null);
            bad(c, x => { x.attacks[0].actor = 3; }, { redirect: true });
        }
    }
});
test('NUOYI ordinary roles exclude self and the caster even with consistent counters', () => {
    const c = selected('nuoyi', 'middle-with-third');
    for (const fields of [['actions'], ['attacks'], ['actions', 'attacks']]) {
        for (const [actor, target] of [[1, 1], [2, 2], [0, 1], [0, 2], [1, 0], [2, 0]]) {
            const raw = trace(c, { redirect: true });
            for (const name of fields) Object.assign(raw[name][0], { actor, target });
            if (fields.includes('actions')) raw.actions[0].skill = actor === 0 ? c.parameters.skill : null;
            if (fields.includes('attacks')) {
                const metrics = [...raw.metrics, raw.extra_target_metrics];
                metrics[1].dodge--; metrics[actor].dodge = (metrics[actor].dodge ?? 0) + 1;
                raw.attacks[0].neili = actor === 2 ? raw.extra_target_after.neili : raw.after[actor].neili;
            }
            assert.throws(() => check(raw, c), /foreign combat role|exact right\/third pair/);
        }
    }
    const noThird = selected('nuoyi', 'weak-target'), raw = trace(noThird, { self: true });
    raw.actions.push({ actor: 1, target: 0, skill: null, action: { action: 'synthetic forbidden pair', force: 1 } });
    raw.attacks.push({ actor: 1, target: 0, type: 0, result: -1, damage: 0, neili: raw.after[1].neili, apply_attack: null });
    raw.metrics[1].dodge = 1;
    assert.throws(() => check(raw, noThird), /exact right\/third pair/);
});
test('NUOYI role gate retains original COMBAT quick and riposte reverse directions', () => {
    const c = selected('nuoyi', 'middle-with-third');
    for (const [type, metric] of [[1, 'riposte'], [2, 'quick']]) {
        const raw = trace(c, { redirect: true });
        raw.actions.splice(1, 0, { actor: 2, target: 1, skill: null,
            action: { action: 'synthetic COMBAT reverse role anchor; not native', force: 1 } });
        raw.attacks.splice(1, 0, { actor: 2, target: 1, type, result: -1, damage: 0,
            neili: raw.extra_target_after.neili, apply_attack: null });
        raw.extra_target_metrics.dodge = 1; raw.extra_target_metrics[metric] = 1;
        const result = check(raw, c);
        assert.equal(result.actual_calls.attacks, 3); assert.equal(result.actual_calls.direct_inputs, 0);
    }
});
test('KUAI only actual four calls plus an independently recorded passive; planned N stays unknown', () => {
    const c = selected('kuai'), r = check(trace(c, { passive: true }), c);
    assert.equal(r.actual_calls.attacks, 4); assert.equal(r.actual_calls.passives, 1);
    assert.equal(r.resources[0].neili.decrease, 200); assert.equal(r.unknown.planned_kuai_attacks, null);
    bad(c, x => { x.attacks[0].target = 0; });
    bad(c, x => { x.actions[0].skill = 'made-up'; });
    bad(c, x => { x.passives[0].result = 0; }, { passive: true });
    bad(c, x => { x.passives[0].target_busy_after = 0; }, { passive: true });
    bad(c, x => { x.passives[0].neili_after++; }, { passive: true });
});
test('feng/jue jiali0 real poison seed is not poison-free; original id is mandatory', () => {
    for (const ability of ['feng', 'jue']) {
        const c = selected(ability), r = check(trace(c, { poison: true }), c), name = c.parameters.mechanics.poison.name;
        assert.deepEqual(r.poison_seed[1][name], { id: 'left', level: 0, remain: 0 });
        assert.equal(r.unknown.poison_natural_lifecycle, null);
        bad(c, x => { delete x.after[1].conditions[name].id; }, { poison: true });
        bad(c, x => { x.after[1].conditions[name].id = 'right'; }, { poison: true });
        bad(c, x => { x.after[1].conditions[name].remain = 1; }, { poison: true });
    }
});
test('positive poison seed duration and public jiali cost use real source support and strict resource closure', () => {
    for (const ability of ['feng', 'jue']) {
        const c = selected(ability, 'jiali50-poison-seed'), raw = trace(c, { poison: true });
        const r = check(raw, c), name = c.parameters.mechanics.poison.name;
        assert.equal(r.resources[0].neili.decrease, (ability === 'feng' ? 280 : 350) + 50);
        assert.equal(r.poison_seed[1][name].remain, 400);
        bad(c, x => { x.metrics[0].neili_cost -= 50; }, { poison: true });
        bad(c, x => { x.after[1].conditions[name].remain = 1; }, { poison: true });
    }
});
test('consistent but forged accepted fees and changed equipped object are rejected', () => {
    for (const ability of ['hua', 'nuoyi']) {
        const c = selected(ability);
        bad(c, r => {
            r.metrics[0].neili_cost = 0;
            for (const s of [r.immediate[0], r.after[0], r.perform_steps[0].after[0]]) s.neili = r.before[0].neili;
        });
    }
    bad(selected('kuai'), r => { r.after[0].weapon_details.object += '0'; });
});
test('busy zero-return is a real before observation, not an invented callback', () => {
    const c = selected('ying'), raw = trace(c);
    raw.busy_calls.push({ side: 1, caller_side: 0, requested: 0, before: null, after: null, zero_return: 1 });
    check(raw, c); delete raw.busy_calls.at(-1).zero_return; assert.throws(() => check(raw, c));
});
test('unconscious preparation remains outside sample resource metrics and terminal events', () => {
    for (const ability of ['jin', 'hua']) {
        const c = selected(ability, 'unconscious-target'), raw = trace(c);
        assert.equal(check(raw, c).resources[1].qi.decrease, 0);
        bad(c, x => { delete x.preparation; }); bad(c, x => { x.terminals = [{ side: 1, kind: 'unconcious' }]; });
    }
});
test('identity, original method owner, fixed preparation, counters, array closure and source pins reject mutations', () => {
    const c = selected('qi');
    for (const edit of [r => { r.after[0].object = '/tests/actor#999'; }, r => { r.before[0].interactive = 0; },
        r => { r.command_context.force_me_source += '.c'; }, r => { r.perform_steps[0].owner = '/tests/runner'; },
        r => { r.before[0].cultivation.reborn = 1; }, r => { delete r.before[0].secondary_weapon; },
        r => { r.before[0].weapon_details.damage = 51; }, r => { r.before[0].effective_skills.dodge++; },
        r => { r.metrics[0].heartbeats = 1; }, r => { r.metrics[0].hit = null; }, r => { delete r.metrics; },
        r => { delete r.actions; }, r => { r.condition_id += '-wrong'; }, r => { r.index = c.samples; }]) bad(c, edit);
    const drift = copy(c); drift.parameters.source_evidence['cmds/skill/perform.c'] = '0'.repeat(64);
    assert.throws(() => check(trace(c), drift));
});
test('diagnostics are unknown and require identity/index/elapsed/reason, without fake state snapshots', () => {
    const c = selected('jin'), raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        elapsed: 0, outcome: 'error', reason: 'explicit synthetic failure; not native' };
    assert.equal(check(raw, c), null);
    for (const key of ['condition_id', 'index', 'elapsed', 'reason']) { const bad = copy(raw); delete bad[key]; assert.throws(() => check(bad, c)); }
    raw.outcome = 'not_applicable'; assert.equal(check(raw, c), null);
});

test('wrong-held standard sword keeps its explicit empty amount and ammunition without normalization', () => {
    const c = selected('hua', 'wrong-held-item'), raw = trace(c), bytes = JSON.stringify(raw);
    for (const phase of ['before', 'immediate', 'after']) {
        assert.equal(raw[phase][0].handing_details.amount, null);
        assert.equal(raw[phase][0].ammunition, null);
        assert.equal(raw[phase][1].ammunition, 0);
    }
    assert.equal(check(raw, c).commands_accepted, 0); assert.equal(JSON.stringify(raw), bytes);
    const editEmpty = (value, replacement) => {
        if (!value || typeof value !== 'object') return;
        if (value.id === 'left' && Object.hasOwn(value, 'ammunition')) value.ammunition = replacement;
        if (value.program === '/tests/sword') value.amount = replacement;
        Object.values(value).forEach(child => editEmpty(child, replacement));
    };
    const explicitZero = copy(raw); editEmpty(explicitZero, 0);
    const zeroBytes = JSON.stringify(explicitZero);
    assert.equal(check(explicitZero, c).commands_accepted, 0);
    assert.equal(JSON.stringify(explicitZero), zeroBytes); // Supported empty LPC representation, not an observed S2 value.
    for (const value of [-1, 1, 0.5, Number.MAX_SAFE_INTEGER + 1, '0', true, false, undefined, {}, []])
        bad(c, r => editEmpty(r, value));
    for (const edit of [r => { delete r.before[0].ammunition; }, r => { delete r.before[0].handing_details.amount; },
        r => { r.before[0].ammunition = 0; }, r => { r.before[0].handing_details.amount = 0; },
        r => {
            r.after[0].ammunition = 0; r.after[0].handing_details.amount = 0;
            r.flower.after.item.amount = 0; r.flower.after.handing.amount = 0;
        }]) bad(c, edit);
});

test('empty ammunition is not allowed for petals, no held item, other roles or KUAI passive snapshots', () => {
    const editRole = (value, id) => {
        if (!value || typeof value !== 'object') return;
        if (value.id === id && Object.hasOwn(value, 'ammunition')) value.ammunition = null;
        Object.values(value).forEach(child => editRole(child, id));
    };
    for (const c of [selected('hua'), selected('hua', 'no-held-item'), selected('hua', 'petals10'), selected('fei')])
        bad(c, r => editRole(r, 'left'));
    const wrong = selected('hua', 'wrong-held-item'); bad(wrong, r => editRole(r, 'right'));
    const three = selected('nuoyi', 'middle-with-third');
    for (const id of ['right', 'third']) bad(three, r => editRole(r, id), { redirect: true });
    const kuai = selected('kuai');
    for (const phase of ['before', 'after']) for (const side of [0, 1])
        bad(kuai, r => { r.passives[0][phase][side].ammunition = null; }, { passive: true });
});

test('all 328 planned equipment initializers preserve non-ammunition null amounts without inventing ammo', () => {
    assert.equal(formal.length, 328);
    const counts = { none: 0, sword: 0, staff: 0, flower: 0, held_sword: 0 };
    for (const c of formal) for (const [side, cfg] of [c.parameters.actor, c.parameters.target, c.parameters.extra_target].entries()) {
        if (!cfg) continue;
        const s = state(cfg, side, c.parameters), e = cfg.equipment;
        if (!e) { counts.none++; assert.equal(s.ammunition, 0); continue; }
        const detail = s[e.hold ? 'handing_details' : 'weapon_details'];
        assert.ok(Object.hasOwn(detail, 'amount'));
        if (e.type === 'throwing') {
            counts.flower++; assert.equal(detail.program, '/clone/weapon/flower_leaf');
            assert.equal(detail.amount, e.amount); assert.equal(s.ammunition, e.amount);
        } else {
            assert.ok(['sword', 'staff'].includes(e.type)); assert.equal(detail.amount, null);
            counts[e.hold ? 'held_sword' : e.type]++; assert.equal(s.ammunition, e.hold ? null : 0);
            if (e.hold) { assert.equal(side, 0); assert.equal(c.parameters.variant, 'wrong-held-item'); }
        }
    }
    assert.deepEqual(counts, { none: 539, sword: 79, staff: 21, flower: 20, held_sword: 1 });
});

test('NUOYI forward omitted attack_type remains explicit null, not zero or a reverse-call exception', () => {
    const c = selected('nuoyi', 'third-enemy-level200'), raw = trace(c, { redirect: true });
    const bytes = JSON.stringify(raw);
    assert.deepEqual(raw.attacks.map(x => [x.actor, x.target, x.type]), [[1, 2, null], [1, 2, null]]);
    assert.equal(check(raw, c).actual_calls.attacks, 2); assert.equal(JSON.stringify(raw), bytes);
    const explicitRegular = copy(raw); explicitRegular.attacks.forEach(x => { x.type = 0; });
    check(explicitRegular, c); assert.ok(explicitRegular.attacks.every(x => x.type === 0));
    const reverse = (r, type) => {
        for (const x of [...r.attacks, ...r.actions]) { x.actor = 2; x.target = 1; }
        r.attacks.forEach(x => { x.type = type; });
        delete r.metrics[1].dodge; r.extra_target_metrics.dodge = 2;
        if (type === 1) r.extra_target_metrics.riposte = 2;
        if (type === 2) r.extra_target_metrics.quick = 2;
    };
    // Explicit reverse types are role/type positive controls, not native reachability claims.
    for (const type of [1, 2]) { const r = copy(raw); reverse(r, type); check(r, c); }
    bad(c, r => reverse(r, null), { redirect: true });
    for (const [actor, target] of [[0, 1], [1, 0], [0, 2], [1, 1], [2, 2]]) bad(c, r => {
        for (const x of [...r.attacks, ...r.actions]) { x.actor = actor; x.target = target; }
        delete r.metrics[1].dodge;
        (actor === 2 ? r.extra_target_metrics : r.metrics[actor]).dodge = 2;
    }, { redirect: true });
    for (const value of [undefined, -1, 3, 0.5, Number.MAX_SAFE_INTEGER + 1, '0', true, false, {}, []])
        bad(c, r => { r.attacks[0].type = value; }, { redirect: true });
    bad(c, r => { delete r.attacks[0].type; }, { redirect: true });
    bad(c, r => { r.metrics[1].dodge = 1; }, { redirect: true });
    bad(c, r => { r.attacks[0].result = 1; }, { redirect: true });
    bad(c, r => { r.attacks[0].damage = -1; }, { redirect: true });
    bad(selected('kuai'), r => { r.attacks[0].type = null; });
    const two = selected('nuoyi');
    bad(two, r => {
        r.attacks = [copy(raw.attacks[0])]; r.actions = [copy(raw.actions[0])]; r.metrics[1].dodge = 1;
    });
});
