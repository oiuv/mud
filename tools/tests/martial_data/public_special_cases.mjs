// Public special-effect series: precise qixian-wuxingjian learn gates and its
// independent hit_ob. A new series for the gaps skill-music-results declared it
// did not cover (accurate 180/180/100 learn boundaries and independent hit_ob).
// Slice-style learnGate and hit_ob interface only; no balance claims.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const strip = text => String(text ?? '').replace(/\[[0-?]*[ -/]*[@-~]/g, '');
const num = v => (v === null || v === undefined ? 0 : v);
const integer = (v, label = 'integer') => {
    assert.ok(Number.isSafeInteger(v) && v >= 0, label);
    return v;
};

export const publicSpecialSourcePaths = Object.freeze([
    'kungfu/skill/qixian-wuxingjian.c',
    'feature/skill.c', 'feature/damage.c', 'feature/dbase.c', 'feature/attack.c',
    'inherit/skill/skill.c', 'inherit/char/char.c',
    'include/skill.h', 'include/globals.h',
]);

const learnDefaults = {
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 34, shen: 0, gender: '男性', character: '光明磊落',
};

// Three raw-skill learn boundaries hold every other gate at a passing value.
const learnBaseSkills = {
    force: 540, unarmed: 540, sword: 540, 'tanqin-jifa': 180, 'qixian-wuxingjian': 0,
};

function learnActor(overrides) {
    return {
        skills: { ...learnBaseSkills, ...overrides },
        mappings: {}, preparations: {},
        properties: { ...learnDefaults, max_neili: 3000, neili: 3000 },
    };
}

const learnPairs = [
    { key: 'unarmed', field: 'unarmed', pair: [179, 180],
        refusal: '你的基本拳脚火候不够，无法修炼七弦无形剑。\n' },
    { key: 'sword', field: 'sword', pair: [179, 180],
        refusal: '你的基本剑法火候不够，无法修炼七弦无形剑。\n' },
    { key: 'tanqin', field: 'tanqin-jifa', pair: [99, 100],
        refusal: '弹琴技法水平有限，无法修炼七弦无形剑。\n' },
];

// hit_ob qualification gates (qixian-wuxingjian.c): raw >= 180, max_neili >= 2500,
// neili >= 500, my max_neili >= victim max_neili, victim max_neili >= 10,
// victim not busy, damage_bonus >= 150. Effect: victim busy(1), me neili-100,
// victim qi damage raw/5+dmg/3, victim qi wound raw/8+dmg/5.
const hitDefaults = {
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 34, shen: 0, gender: '男性', character: '光明磊落',
};

function hitActor(qixian, maxNeili) {
    return {
        skills: { 'qixian-wuxingjian': qixian },
        mappings: {}, preparations: {},
        properties: { ...hitDefaults, max_neili: maxNeili, neili: maxNeili },
    };
}

function hitTarget(maxNeili) {
    return {
        skills: {}, mappings: {}, preparations: {},
        properties: { ...hitDefaults, max_neili: maxNeili },
    };
}

// Each boundary pair: low side refuses (returns 0), high side triggers (returns a
// message and applies the effect). The 8 cases are 4 pairs (16 formal samples).
const hitPairs = [
    { key: 'raw', actor: v => hitActor(v, 6000), target: () => hitTarget(100), damage: 200,
        pair: [179, 180], gate: 'skill' },
    { key: 'maxneili', actor: v => hitActor(200, v), target: () => hitTarget(100), damage: 200,
        pair: [2499, 2500], gate: 'max_neili' },
    { key: 'damage', actor: () => hitActor(200, 6000), target: () => hitTarget(100),
        pair: [149, 150], gate: 'damage' },
    { key: 'victim-maxneili', actor: () => hitActor(200, 6000), target: v => hitTarget(v),
        damage: 200, pair: [9, 10], gate: 'victim_max_neili' },
];

export function publicSpecialConditions(catalog, readSource, { smoke = false, samples = 2 } = {}) {
    assert.equal(typeof readSource, 'function');
    assert.ok(Array.isArray(catalog?.skills));
    const evidence = Object.fromEntries(publicSpecialSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length > 0, path);
        return [path, hash(bytes)];
    }));
    const source = catalog.skills.find(s => s.id === 'qixian-wuxingjian');
    assert.equal(source?.path, 'kungfu/skill/qixian-wuxingjian.c');
    assert.equal(source.sha256, evidence[source.path], 'qixian source snapshot mismatch');
    const learnEntry = source.entries.find(e => e.function === 'valid_learn')?.id;
    assert.ok(learnEntry?.startsWith(source.path + ':'), 'valid_learn entry');
    const hitEntry = source.entries.find(e => e.function === 'hit_ob')?.id;
    assert.ok(hitEntry?.startsWith(source.path + ':'), 'hit_ob entry');
    const rows = [];

    // Item 1: three raw-skill valid_learn boundary pairs (slice-style learnGate).
    for (const gate of learnPairs) {
        for (const value of gate.pair) {
            const refused = value === gate.pair[0];
            rows.push({
                id: `public-special-learn-${gate.key}-${value}`, stage: 'skill', entry_id: learnEntry,
                method: 'interface', samples: smoke ? 1 : samples,
                parameters: {
                    collection_group: 'public-special', skill: 'qixian-wuxingjian',
                    variant: `learn-${gate.key}-${value}`, kind: 'learn',
                    actor: learnActor({ [gate.field]: value }),
                    target: learnActor({}),
                    interface: { object: '/kungfu/skill/qixian-wuxingjian', function: 'valid_learn' },
                    action: 'test_interface', fighting: false, observe_seconds: 0,
                    observation: 'single_action_immediate', expected: refused ? 'refused' : 'observed',
                    refusal: refused ? gate.refusal : '', not_applicable: '',
                    effect: { kind: 'learn' },
                    qualification_sources: [...publicSpecialSourcePaths],
                    source_evidence: { ...evidence },
                    qualification_note: 'Direct original valid_learn observation with fixed prerequisite gates;'
                        + ' the varied raw skill is the sole boundary. Experimental skills, not natural learning.'
                        + ' Positive side is the accurate threshold that passes.',
                },
            });
        }
    }

    // Item 2: independent hit_ob qualification boundary pairs + effect.
    for (const gate of hitPairs) {
        for (const value of gate.pair) {
            const triggers = value === gate.pair[1];
            // The damage gate varies damage_bonus itself; other gates hold it at 200.
            const damage = gate.key === 'damage' ? value : gate.damage;
            const actor = gate.actor(value), target = gate.target(value);
            const raw = actor.skills['qixian-wuxingjian'];
            rows.push({
                id: `public-special-hit-${gate.key}-${value}`, stage: 'skill', entry_id: hitEntry,
                method: 'interface', samples: smoke ? 1 : samples,
                parameters: {
                    collection_group: 'public-special', skill: 'qixian-wuxingjian',
                    variant: `hit-${gate.key}-${value}`, kind: 'hit_ob',
                    actor, target,
                    interface: { object: '/kungfu/skill/qixian-wuxingjian', function: 'hit_ob', damage, factor: 0 },
                    action: 'test_interface', fighting: false, observe_seconds: 0,
                    observation: 'single_action_immediate', expected: 'observed', refusal: '',
                    not_applicable: '',
                    effect: {
                        kind: 'hit_ob', trigger: triggers, gate: gate.gate,
                        raw, damage,
                        qi_damage: Math.trunc(raw / 5) + Math.trunc(damage / 3),
                        qi_wound: Math.trunc(raw / 8) + Math.trunc(damage / 5),
                    },
                    qualification_sources: [...publicSpecialSourcePaths],
                    source_evidence: { ...evidence },
                    qualification_note: 'Original hit_ob interface with one varied qualification gate; other gates'
                        + ' held at passing values. No-trigger numeric return is an observation, not a refusal.'
                        + ' Effect formulas are the original integer divisions; damage_bonus is the interface input,'
                        + ' not final hp loss. Experimental resources, not natural combat.',
                },
            });
        }
    }
    assert.equal(rows.filter(r => r.parameters.kind === 'learn').length, 6);
    assert.equal(rows.filter(r => r.parameters.kind === 'hit_ob').length, 8);
    return rows;
}

function assertActorShape(s, label) {
    assert.match(s?.object ?? '', /^\/tests\/actor#\d+$/, label);
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(s[k], 1, label + ' ' + k);
    for (const k of ['wizardp', 'ghost']) assert.equal(s[k], 0, label + ' ' + k);
}

function stableState(before, after, mutate) {
    const expected = structuredClone(before), actual = structuredClone(after);
    delete expected.temp?.notify_fail; delete actual.temp?.notify_fail;
    if (mutate) mutate(expected);
    assert.deepEqual(actual, expected, 'unexplained state mutation');
}

export function validatePublicSpecialRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'public-special');
    assert.equal(raw.kind, 'sample');
    assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, condition.method);
    assert.ok(Number.isSafeInteger(raw.index) && raw.index >= 0 && raw.index < condition.samples);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    if (raw.outcome === 'error' || raw.outcome === 'not_applicable') {
        assert.ok(typeof raw.reason === 'string' && raw.reason.trim());
        return null;
    }
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after']) assert.equal(raw[k]?.length, 2, k);
    assert.deepEqual(raw.after, raw.immediate, 'immediate-only window');
    for (const side of [0, 1]) assertActorShape(raw.before[side], 'before' + side);

    if (p.kind === 'learn') {
        // valid_learn interface: refused returns 0, observed returns 1; no state change.
        assert.equal(raw.interfaces?.length, 1);
        assert.deepEqual(raw.interfaces[0], {
            object: p.interface.object, function: 'valid_learn',
            result: p.expected === 'observed' ? 1 : 0,
        });
        assert.deepEqual(raw.metrics, [{}, {}], 'learn query has zero net cost');
        stableState(raw.before[0], raw.immediate[0]);
        stableState(raw.before[1], raw.immediate[1]);
        if (p.expected === 'refused') {
            assert.equal(typeof raw.reason, 'string');
            assert.ok(strip(raw.reason).includes(strip(p.refusal).trim()), 'refusal must match branch text');
        } else {
            assert.ok(raw.reason === '' || raw.reason === null);
        }
        return { kind: 'learn', accepted: p.expected === 'observed' };
    }

    // hit_ob interface: always observed; result 0 (no-trigger) or message string (trigger).
    assert.equal(raw.interfaces?.length, 1);
    assert.equal(raw.interfaces[0].object, p.interface.object);
    assert.equal(raw.interfaces[0].function, 'hit_ob');
    assert.equal(raw.passives?.length, 1, 'single hit_ob passive');
    const e = raw.passives[0];
    assert.equal(e.route, 'interface');
    assert.equal(e.skill, 'qixian-wuxingjian');
    assert.equal(e.incoming, p.interface.damage);
    assert.equal(e.factor, p.interface.factor);
    assert.deepEqual(e.before, raw.before);
    assert.deepEqual(e.after, raw.immediate);
    assert.deepEqual(raw.interfaces[0].result, e.result, 'interface result matches passive result');

    const b = raw.before[0], v = raw.before[1], a = raw.immediate[0], w = raw.immediate[1];
    if (!p.effect.trigger) {
        assert.ok(e.result === 0 || e.result === null, 'no-trigger hit_ob returns 0/null');
        stableState(b, a);
        stableState(v, w);
        return { kind: 'hit_ob', triggered: false, gate: p.effect.gate };
    }
    assert.ok(typeof e.result === 'string' && e.result.trim().length > 0, 'trigger returns message');
    // Effect: victim busy(1), me neili-100, victim qi damage, victim qi wound.
    assert.equal(num(w.busy), 1, 'victim busy(1)');
    assert.equal(a.neili - b.neili, -100, 'me neili cost 100');
    assert.equal(w.qi - v.qi, -p.effect.qi_damage, 'victim qi damage');
    assert.equal(w.eff_qi - v.eff_qi, -p.effect.qi_wound, 'victim qi wound');
    assert.equal(num(e.target_busy_after), 1, 'passive records victim busy');
    return { kind: 'hit_ob', triggered: true, gate: p.effect.gate, qi_damage: p.effect.qi_damage, qi_wound: p.effect.qi_wound };
}

export function publicSpecialEffects(rows, condition) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        const raw = row.raw ?? row;
        assert.equal(raw.condition_id, condition.id);
        if (row.raw) assert.equal(row.outcome, raw.outcome);
        assert.ok(Object.hasOwn(counts, raw.outcome));
        counts[raw.outcome]++;
        if (['observed', 'refused'].includes(raw.outcome)) known.push(validatePublicSpecialRecord(raw, condition));
    }
    return {
        counts, samples: rows.length,
        kind: condition.parameters.kind,
        effect_kind: condition.parameters.effect.kind,
        gate: condition.parameters.effect.gate ?? null,
    };
}
