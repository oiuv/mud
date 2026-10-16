import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { scanSource } from './inventory.mjs';
import { mingjiaoQishangConditions, mingjiaoQishangSourcePaths,
    validateMingjiaoQishangRecord, validateMingjiaoQishangLoads, mingjiaoQishangEffects } from './school_mingjiao_qishang_cases.mjs';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const sha = v => createHash('sha256').update(typeof v === 'string' || Buffer.isBuffer(v) ? v : JSON.stringify(v)).digest('hex');
const catalog = { skills: ['qishang-quan', 'qishang-quan/fei', 'qishang-quan/shang'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', bytes = read(path), parsed = scanSource(bytes.toString('utf8'));
    return { id, path, sha256: sha(bytes), entries: parsed.functions.map(fn =>
        ({ id: `${path}:${fn.line}:${fn.name}`, role: fn.name })) };
}) };
const cases = mingjiaoQishangConditions(catalog, read), smoke = mingjiaoQishangConditions(catalog, read, { smoke: true });
const main = cases.filter(c => c.parameters.suite === 'main');
const choose = (ability, variant = 'baseline', level = ability === 'shang' ? 400 : 200) => {
    const c = main.find(c => c.parameters.ability === ability && c.parameters.variant === variant && c.parameters.level === level);
    assert.ok(c); return c;
};
const copy = structuredClone;
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];

// All traces below are source-reachable synthetic contracts, never driver samples or ledger records.
function state(config, side) {
    const props = Object.entries(config.properties);
    return { ...Object.fromEntries(props.filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: Object.fromEntries(props.filter(([k]) => k.includes('/') || k === 'character')),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        fighting_opponent: 1, killing_opponent: 1, busy: null, craze: 0, max_craze: 5000,
        skills: copy(config.skills), mappings: copy(config.mappings), preparations: copy(config.preparations),
        preparation_order: Object.keys(config.preparations), learned: {}, temp: { apply: { armor: 100 } },
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (config.skills[config.mappings[k]] ?? 0)])),
        effective_str: config.properties.str + Math.trunc((config.skills.cuff ?? 0) / 10),
        effective_con: config.properties.con + Math.trunc(config.skills.force / 10),
        weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {},
        handing: 'none', handing_details: {}, secondary_weapon: 'none', secondary_weapon_details: {}, conditions: null };
}
function load(c) {
    const cfg = copy(main[0].parameters.actor), level = c.parameters.cache_loader_level;
    for (const k of Object.keys(cfg.skills)) cfg.skills[k] = level;
    cfg.mappings = {}; cfg.preparations = {};
    const run_id = 'synthetic-' + c.parameters.suite, path = c.parameters.base_source.path;
    return { skill: 'qishang-quan', path, sha256: c.parameters.base_source.sha256,
        run_id, load_id: run_id + ':qishang-quan', state: state(cfg, 0), command: 'enable parry qishang-quan' };
}
const fixed = { action: '$N长啸一声，向前踏出一步，双拳中宫直进，一式「七者皆伤」，骤然击向$n的前胸',
    force: 390, dodge: 20, damage: 100, lvl: 160, skill_name: '七者皆伤', damage_type: '内伤' };
function dynamic(c) {
    const level = c.parameters.cache_loader_level;
    return { action: '$N凝神静气，使出极招\x1b[31m 七伤拳之极意 \x1b[0m', force: Math.trunc(level / 3),
        dodge: Math.trunc(level / 6), damage: Math.trunc(level / 4), lvl: 200, skill_name: '极意', damage_type: '内伤' };
}
const compress = n => n > 400 ? Math.trunc((n - 400) / 4) + 300 : n > 200 ? Math.trunc((n - 200) / 2) + 200 : Math.max(0, n);
function trace(c, { hit = true, trigger = true, selectedDynamic = false, healing = 10,
    inputOffset = 0, woundPercent = null, intBoost = false, ordinaryWound = true } = {}) {
    const p = c.parameters, before = [state(p.actor, 0), state(p.target, 1)], after = copy(before);
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, outcome: p.expected, elapsed: 0.01,
        before, immediate: after, after: [], metrics: [{}, {}], actions: [], attacks: [], passives: [], dodge_checks: [],
        launches: [], refusals: [], defenses: [], interfaces: [], dropped: [], terminals: [], callbacks: [],
        directs: [], skill_loads: [load(c)], reason: '' };
    const a = before[0], t = before[1], end = after[0], target = after[1];
    const protectedActor = a.max_neili >= 8000 || (a.skills['jiuyang-shengong'] ?? 0) > 0 || (a.skills.buddhism ?? 0) >= 400;
    function selfEffect(guaranteed) {
        if (!trigger && !guaranteed) return;
        if (protectedActor) end.qi += Math.min(healing, end.eff_qi - end.qi);
        else {
            const wound = Math.trunc(a.skills['qishang-quan'] * 8000 / a.max_neili);
            end.eff_qi -= wound; end.qi = Math.min(end.qi, end.eff_qi);
            end.craze = Math.min(5000, (!guaranteed ? wound : 0) + (wound > 150 ? Math.trunc(wound / 3) : 0));
        }
    }
    function damageTarget(damage, wound) {
        target.qi -= damage; target.eff_qi -= wound; target.qi = Math.min(target.qi, target.eff_qi);
        target.craze = Math.min(5000, (damage > 150 ? Math.trunc(damage / 5) : 0) + (wound > 150 ? Math.trunc(wound / 3) : 0));
    }
    if (c.method === 'perform') {
        raw.command_accepted = p.expected === 'observed' ? 23 : 0;
        if (p.expected === 'refused') {
            raw.reason = p.refusal; end.temp.notify_fail = p.refusal;
            raw.refusals.push({ actor: a.object, reason: p.refusal });
        } else {
            raw.metrics[0].ability_launched = 1;
            raw.launches.push({ actor: a.object, skill: 'qishang-quan', argument: p.ability + ' right' });
            end.busy = hit ? 2 : 3;
            const harmful = p.ability === 'shang' && hit && !protectedActor;
            end.neili -= p.ability === 'fei' ? hit ? 320 : 180 : !hit ? 120 : harmful ? 0 : 260;
            if (p.ability === 'shang' && hit) selfEffect(true);
            if (hit && !harmful) {
                const input = a.effective_skills.cuff + a.effective_skills.force + inputOffset;
                const percent = woundPercent ?? (p.ability === 'fei' ? 80 : 70);
                raw.directs.push({ actor: 0, target: 1, type: 0, damage: input, percent, weapon: 'none', weapon_object: '' });
                raw.metrics[0].direct = 1;
                const strength = a.str * 2 + a.effective_str;
                let boosted = input + Math.trunc(input * (Math.trunc((strength - 60) / 4) + 30) / 50);
                if (intBoost) boosted += Math.trunc(boosted * 7 / a.int);
                const damage = boosted > 1500 ? Math.trunc((boosted - 1500) / 4) + 1000
                    : boosted > 500 ? Math.trunc((boosted - 500) / 2) + 500 : boosted;
                let wound = Math.trunc(damage * percent / 100);
                wound -= Math.trunc(wound * 20 / 100); wound -= Math.trunc(wound * (t.con - 10) / 100);
                damageTarget(damage, wound);
            }
            if (a.effective_skills['qishang-quan'] >= 120) end.learned['qishang-quan'] = 1;
        }
    } else {
        const action = selectedDynamic ? dynamic(c) : fixed;
        raw.actions.push({ actor: 0, target: 1, skill: 'qishang-quan', action: copy(action) });
        end.temp.fight = { attack: null, dodge: action.dodge, parry: null };
        const f = a.effective_str + Math.trunc(action.force * a.effective_str / 100);
        const incoming = Math.trunc((f * 2 - 1) / 3);
        let damage = 0;
        if (hit) {
            const passiveBefore = copy(after);
            if (incoming >= 150) selfEffect(false);
            raw.passives.push({ actor: 0, target: 1, skill: 'qishang-quan', route: 'martial',
                incoming, factor: 0, result: null, before: passiveBefore, after: copy(after),
                neili_after: a.neili, target_eff_qi_after: t.eff_qi, target_busy_after: null });
            const strength = incoming + Math.trunc(incoming * (a.str * 2 + a.effective_str) / 300);
            damage = compress(strength); let wound = compress(strength);
            wound -= Math.trunc(wound * 20 / 100); wound -= Math.trunc(wound * (t.con - 10) / 100);
            if (!ordinaryWound) wound = 0;
            damageTarget(damage, wound);
        }
        const result = hit ? 0 : -1; raw.metrics[0][hit ? 'hit' : 'dodge'] = 1;
        raw.attacks.push({ actor: 0, target: 1, result, type: 0, damage, action_flag: null,
            attack_usage: 'cuff', attack_skill: 'qishang-quan', apply_attack: 0, apply_damage: 0,
            apply_unarmed_damage: 0, neili: a.neili });
        for (const phase of ['base', 'settled']) raw.dodge_checks.push({ actor: 0, target: 1, phase,
            type: 0, skill: null, ap: 1000, dp: 300, busy: null });
    }
    for (const side of [0, 1]) for (const key of resources) {
        const delta = after[side][key] - before[side][key];
        if (delta) raw.metrics[side][key + (delta > 0 ? '_recovery' : '_cost')] = Math.abs(delta);
    }
    raw.after = copy(after); return raw;
}

test('finite main35/2324 and independent cold2/200; smoke70+4, no sources or input drift', () => {
    assert.equal(main.length, 35); assert.equal(main.filter(c => c.parameters.expected === 'observed').length, 23);
    assert.equal(main.reduce((n, c) => n + c.samples, 0), 2324);
    assert.equal(cases.length, 37); assert.equal(smoke.filter(c => c.parameters.suite === 'main').reduce((n, c) => n + c.samples, 0), 70);
    assert.equal(cases.filter(c => c.parameters.suite !== 'main').reduce((n, c) => n + c.samples, 0), 200);
    assert.equal(smoke.filter(c => c.parameters.suite !== 'main').reduce((n, c) => n + c.samples, 0), 4);
    assert.equal(main[0].parameters.level, 200); assert.equal(main[0].method, 'ordinary');
    assert.equal(mingjiaoQishangSourcePaths.length, 38);
    assert.throws(() => mingjiaoQishangConditions(catalog, p => p.endsWith('/shang.c') ? Buffer.concat([read(p), Buffer.from(' ')]) : read(p)));
    for (const c of cases) { assert.ok(c.parameters.actor.properties.neili <= c.parameters.actor.properties.max_neili); }
});

test('all37 source-reachable synthetic traces, including shang200 refusal and exact gates', () => {
    for (const c of cases) for (const hit of [true, false]) validateMingjiaoQishangRecord(trace(c, { hit }), c);
    assert.equal(choose('fei', 'skill160').parameters.actor.skills['qishang-quan'], 160);
    assert.equal(choose('shang', 'skill220').parameters.actor.skills['qishang-quan'], 220);
    for (const [variant, boundary] of [['max2199', 2199], ['max2200', 2200]]) {
        const p = choose('fei', variant).parameters; assert.equal(p.actor.properties.max_neili, boundary); assert.equal(p.actor.properties.neili, 1000);
    }
});

test('original shared first-loader caches do not follow later users; cold drivers remain separate', () => {
    const ordinary = cases.filter(c => c.method === 'ordinary');
    const rows = ordinary.map(c => trace(c, { selectedDynamic: c.parameters.level > 200 }));
    assert.equal(validateMingjiaoQishangLoads(rows).runs, 3);
    for (const c of ordinary) {
        const raw = trace(c, { selectedDynamic: c.parameters.level > 200 });
        raw.skill_loads[0].state.effective_skills.force++;
        assert.throws(() => validateMingjiaoQishangRecord(raw, c));
    }
    const drift = copy(rows), mainDynamic = drift.find(r => r.condition_id.includes('-main-') && r.actions[0].action.lvl === 200);
    mainDynamic.actions[0].action.force++;
    assert.throws(() => validateMingjiaoQishangLoads(drift));
    const mixed = copy(rows), cold = mixed.find(r => r.condition_id.includes('-cold400-'));
    cold.skill_loads[0].run_id = 'synthetic-main'; cold.skill_loads[0].load_id = 'synthetic-main:qishang-quan';
    assert.throws(() => validateMingjiaoQishangLoads(mixed));
});

test('strict200/201 and final-six action support cannot accept excluded original entries', () => {
    for (const level of [199, 200]) {
        const c = level === 199 ? choose('ordinary', 'strict-action-boundary', 199) : choose('ordinary');
        assert.throws(() => validateMingjiaoQishangRecord(trace(c, { selectedDynamic: true }), c));
    }
    const c = choose('ordinary', 'strict-action-boundary', 201), raw = trace(c, { selectedDynamic: true });
    validateMingjiaoQishangRecord(raw, c);
    raw.actions[0].action = { action: '$N气凝如山，一式「金戈铁马」，双拳蓄势而发，击向$n的$l',
        force: 180, dodge: 5, damage: 10, lvl: 0, skill_name: '金戈铁马', damage_type: '内伤' };
    assert.throws(() => validateMingjiaoQishangRecord(raw, c));
});

test('self wounds, current qi clipping, receive_heal and explicit/automatic craze are not interchangeable', () => {
    for (const c of [choose('ordinary'), choose('shang'), choose('shang', 'max-neili-8000')]) {
        for (const key of ['qi', 'eff_qi', 'craze']) {
            const raw = trace(c); raw.immediate[0][key]++; raw.after = copy(raw.immediate);
            assert.throws(() => validateMingjiaoQishangRecord(raw, c), key);
        }
    }
    const cap = choose('shang', 'healing-cap'), raw = trace(cap, { healing: 100 });
    validateMingjiaoQishangRecord(raw, cap); assert.equal(raw.immediate[0].qi, 9999);
    assert.equal(raw.immediate[0].eff_qi, 9999);
    assert.equal(trace(choose('shang')).directs.length, 0, 'accepted self-backlash is not target damage');
});

test('fees, exact USER/source identity and unknown effects remain independent', () => {
    const c = choose('fei'), raw = trace(c), row = { condition_id: c.id, outcome: raw.outcome, raw };
    const error = { condition_id: c.id, outcome: 'error', raw: { kind: 'sample', method: 'perform', condition_id: c.id, outcome: 'error', reason: 'synthetic execution failure' } };
    const e = mingjiaoQishangEffects([row, error], c);
    assert.equal(e.acceptance.trials, 1); assert.equal(e.counts.error, 1);
    assert.equal(e.neili_cost.mean, 320); assert.equal(e.gate_hit.successes, 1);
    assert.equal(mingjiaoQishangEffects([error], c).neili_cost.mean, null);
    for (const mutate of [r => { r.before[0].wizardp = 1; }, r => { r.skill_loads = []; },
        r => { r.metrics[0].neili_cost--; }, r => { r.directs[0].percent = 100; }]) {
        const bad = copy(raw); mutate(bad); assert.throws(() => validateMingjiaoQishangRecord(bad, c));
    }
});

test('direct integer joint support rejects forged target damage/craze, while original800 wound may exceed damage', () => {
    for (const c of [choose('fei'), choose('shang', 'max-neili-8000')]) {
        for (const key of ['qi', 'eff_qi', 'craze']) {
            const raw = trace(c);
            if (key === 'craze') raw.immediate[1].craze++;
            else {
                raw.immediate[1][key]--;
                raw.metrics[1][key + '_cost']++;
            }
            raw.after = copy(raw.immediate);
            assert.throws(() => validateMingjiaoQishangRecord(raw, c), key);
        }
    }
    // An additional source-reachable synthetic diagnostic, not a condition added to the frozen35 matrix.
    const c = copy(choose('shang', 'baseline', 800));
    c.parameters.actor.properties.max_neili = 8000;
    const raw = trace(c, { inputOffset: 799 + 2399, woundPercent: 229, intBoost: true });
    validateMingjiaoQishangRecord(raw, c);
    assert.equal(raw.metrics[1].eff_qi_cost, 5923);
    assert.equal(raw.metrics[1].qi_cost, 5923, 'current qi is also clipped by wound');
    assert.equal(raw.immediate[1].qi, raw.immediate[1].eff_qi);
});

test('passive snapshots cannot invent qualifications, original incoming, resources or identities', () => {
    const c = choose('ordinary'), raw = trace(c);
    for (const mutate of [r => { r.passives[0].before[0].skills['qishang-quan']++; },
        r => { r.passives[0].before[0].max_neili = 1; },
        r => { r.passives[0].before[0].craze++; },
        r => { r.passives[0].before[1].object = '/tests/actor#999'; },
        r => { r.passives[0].incoming = 9999; },
        r => { r.passives[0].after[0].temp.apply.armor++; },
        r => { r.immediate[0].craze++; r.after = copy(r.immediate); },
        r => { r.before[0].max_craze = 1; }]) {
        const bad = copy(raw); mutate(bad); assert.throws(() => validateMingjiaoQishangRecord(bad, c));
    }
});

test('ordinary positive damage may have zero wound when the original wound gate does not trigger; direct remains strict', () => {
    const c = choose('ordinary', 'baseline', 800), raw = trace(c, { ordinaryWound: false });
    assert.ok(raw.metrics[1].qi_cost > 200);
    assert.equal(raw.immediate[1].eff_qi, raw.before[1].eff_qi);
    validateMingjiaoQishangRecord(raw, c);
    const forged = copy(raw);
    forged.immediate[1].eff_qi--; forged.metrics[1].eff_qi_cost = 1;
    forged.after = copy(forged.immediate);
    assert.throws(() => validateMingjiaoQishangRecord(forged, c), 'one-point invented wound is not a reachable positive-wound support');
    const directCase = choose('fei'), direct = trace(directCase);
    direct.immediate[1].eff_qi = direct.before[1].eff_qi;
    direct.metrics[1].eff_qi_cost = 0;
    direct.after = copy(direct.immediate);
    assert.throws(() => validateMingjiaoQishangRecord(direct, directCase), 'ordinary-only wound gate must not weaken direct damage');
});
