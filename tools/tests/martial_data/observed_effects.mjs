import assert from 'node:assert/strict';
import { observedEffectSources } from './observed_effect_sources.mjs';

export const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];

export function counter(raw, side, key) {
    assert.ok(raw.metrics?.[side] && typeof raw.metrics[side] === 'object', 'missing resource ledger');
    const value = raw.metrics[side][key] ?? 0;
    assert.ok(Number.isFinite(value) && value >= 0, `invalid counter ${side}/${key}`);
    return value;
}

export function busy(state) {
    assert.ok(Object.hasOwn(state, 'busy'), 'missing busy observation');
    const value = state.busy === null ? 0 : state.busy;
    assert.ok(Number.isSafeInteger(value) && value >= 0, 'busy must be an observed integer');
    return value;
}

export function temp(state, path) {
    assert.ok(state.temp && typeof state.temp === 'object', 'missing temp observation');
    const value = path.split('/').reduce((v, key) => v?.[key], state.temp);
    return value ?? 0;
}

export function tempDelta(raw, side, path, expected) {
    assert.equal(temp(raw.after[side], path) - temp(raw.before[side], path), expected, path);
}

export function cost(raw, side, resource, expected) {
    assert.equal(counter(raw, side, resource + '_cost'), expected, `${resource} cost`);
    assert.equal(counter(raw, side, resource + '_recovery'), 0, `${resource} recovery`);
}

export function range(value, min, max, label) {
    assert.ok(Number.isSafeInteger(value) && value >= min && value <= max,
        `${label}: ${value} not in [${min}, ${max}]`);
}

export function validateEffectPair(raw, condition, role, sourceContext) {
    const p = condition.parameters;
    const source = observedEffectSources[`${role}:${p.skill}/${p.ability}`];
    assert.ok(source, 'unreviewed effect contract');
    // Legacy exert series did not bind the actual exert file in entry_id. Their frozen
    // catalog may supply the version; never substitute the current checkout silently.
    if (p.ability_source) {
        assert.equal(p.ability_source.path, source.path, 'ability source path');
        assert.equal(p.ability_source.sha256, source.sha256, 'reviewed ability source version');
    } else {
        assert.equal(sourceContext?.catalog?.skills?.find(s => s.path === source.path)?.sha256,
            source.sha256, 'missing frozen ability source version');
    }
    for (const dep of source.dependencies ?? []) {
        const actual = p.effect_dependencies?.find(s => s.path === dep.path)
            ?? sourceContext?.catalog?.skills?.find(s => s.path === dep.path);
        assert.equal(actual?.sha256, dep.sha256, 'missing frozen passive source version');
    }
    assert.equal(raw.before?.length, 2); assert.equal(raw.after?.length, 2);
    assert.equal(raw.metrics?.length, 2);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side], after = raw.after[side];
        assert.equal(before.userp, 1); assert.equal(before.playerp, 1);
        assert.equal(before.interactive, 1); assert.equal(before.wizardp, 0);
        assert.equal(after.object, before.object, 'actor identity changed');
        assert.deepEqual(before.mappings, cfg.mappings);
        assert.deepEqual(before.preparations, cfg.preparations);
        for (const [key, value] of Object.entries(cfg.skills)) {
            assert.equal(before.skills?.[key], value, `initial skill ${key}`);
            assert.equal(before.effective_skills?.[key], Math.trunc(value / 2)
                + (cfg.skills[cfg.mappings[key]] ?? 0) + temp(before, 'apply/' + key), `effective skill ${key}`);
        }
        for (const key of ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing',
            'neili', 'max_neili', 'str', 'int', 'con', 'dex', 'combat_exp', 'jiali'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(before[key], cfg.properties[key], `initial ${key}`);
        for (const key of resources) {
            assert.ok(Number.isFinite(before[key]) && Number.isFinite(after[key]), `missing resource ${key}`);
            assert.equal(after[key], before[key] - counter(raw, side, key + '_cost')
                + counter(raw, side, key + '_recovery'), `resource ledger ${side}/${key}`);
        }
    }
    assert.ok(Array.isArray(raw.attacks), 'missing attack records');
    assert.ok(Array.isArray(raw.launches), 'missing launch records');
    if (raw.outcome === 'observed') {
        assert.equal(raw.command_accepted, 1, 'command not accepted');
        assert.equal(raw.launches.length, 1);
        assert.equal(raw.launches[0].actor, raw.before[0].object);
        assert.equal(raw.launches[0].skill, p.skill);
        assert.equal(String(raw.launches[0].argument).split(/\s+/)[0], p.ability);
    }
    return source;
}
