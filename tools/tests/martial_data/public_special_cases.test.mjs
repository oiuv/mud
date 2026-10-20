import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import {
    publicSpecialSourcePaths, publicSpecialConditions,
    validatePublicSpecialRecord, publicSpecialEffects,
} from './public_special_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = publicSpecialConditions(catalog, read);
const smoke = publicSpecialConditions(catalog, read, { smoke: true });

function state(cfg, side) {
    const src = side ? cfg.target : cfg.actor;
    return {
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        skills: { ...src.skills }, learned: {}, mappings: { ...src.mappings },
        preparations: { ...src.preparations }, temp: {}, busy: null,
        qi: src.properties.qi, eff_qi: src.properties.eff_qi, jing: src.properties.jing,
        eff_jing: src.properties.eff_jing, neili: src.properties.neili,
        max_neili: src.properties.max_neili,
        str: src.properties.str, int: src.properties.int, con: src.properties.con,
        dex: src.properties.dex, shen: src.properties.shen, gender: src.properties.gender,
        character: src.properties.character, weapon: 'none', handing: 'none',
    };
}

function trace(c) {
    const p = c.parameters;
    const before = [state(p, 0), state(p, 1)];
    const raw = {
        kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        outcome: p.expected, elapsed: 0.01, before,
        immediate: structuredClone(before), after: structuredClone(before),
        metrics: [{}, {}], interfaces: [], passives: [], reason: '',
    };
    const b = raw.immediate[0], v = raw.immediate[1];
    if (p.kind === 'learn') {
        const accepted = p.expected === 'observed';
        raw.interfaces = [{ object: p.interface.object, function: 'valid_learn', result: accepted ? 1 : 0 }];
        if (!accepted) raw.reason = p.refusal;
    } else {
        const e = p.effect;
        raw.interfaces = [{ object: p.interface.object, function: 'hit_ob', result: null }];
        const passive = {
            actor: 0, target: 1, skill: 'qixian-wuxingjian', incoming: e.damage,
            factor: 0, route: 'interface', result: null,
            before: structuredClone(raw.before), after: null,
            neili_after: null, target_eff_qi_after: null, target_busy_after: null,
        };
        if (e.trigger) {
            raw.interfaces[0].result = 'hit message';
            passive.result = 'hit message';
            b.neili -= 100;
            v.qi -= e.qi_damage;
            v.eff_qi -= e.qi_wound;
            v.busy = 1;
        } else {
            raw.interfaces[0].result = 0;
            passive.result = 0;
        }
        passive.after = structuredClone(raw.immediate);
        passive.neili_after = b.neili;
        passive.target_eff_qi_after = v.eff_qi;
        passive.target_busy_after = v.busy;
        raw.passives = [passive];
    }
    // The real runner records immediate-only: after matches immediate.
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('generates 6 learn + 8 hit_ob conditions in formal and smoke', () => {
    assert.equal(cases.length, 14);
    assert.equal(cases.filter(c => c.parameters.kind === 'learn').length, 6);
    assert.equal(cases.filter(c => c.parameters.kind === 'hit_ob').length, 8);
    assert.equal(smoke.length, 14);
    for (const c of cases) assert.equal(c.samples, 2);
    for (const c of smoke) assert.equal(c.samples, 1);
    for (const c of cases) assert.deepEqual(Object.keys(c.parameters.source_evidence), [...publicSpecialSourcePaths]);
});

test('learn boundary pairs hold fixed prerequisite gates', () => {
    const learn = cases.filter(c => c.parameters.kind === 'learn');
    const ids = learn.map(c => c.id);
    assert.deepEqual(ids, [
        'public-special-learn-unarmed-179', 'public-special-learn-unarmed-180',
        'public-special-learn-sword-179', 'public-special-learn-sword-180',
        'public-special-learn-tanqin-99', 'public-special-learn-tanqin-100',
    ]);
    for (const c of learn) {
        const p = c.parameters;
        assert.equal(p.interface.function, 'valid_learn');
        const s = p.actor.skills;
        assert.equal(s.force, 540, 'fixed force gate');
        assert.equal(s['qixian-wuxingjian'], 0, 'fixed qixian so relative gate passes');
        assert.equal(p.actor.properties.max_neili, 3000, 'fixed max_neili gate');
    }
    // Each pair: low refused with matching text, high observed.
    const un179 = learn.find(c => c.id.endsWith('unarmed-179'));
    assert.equal(un179.parameters.expected, 'refused');
    assert.match(un179.parameters.refusal, /基本拳脚火候不够/);
    assert.equal(un179.parameters.actor.skills.unarmed, 179);
    const un180 = learn.find(c => c.id.endsWith('unarmed-180'));
    assert.equal(un180.parameters.expected, 'observed');
    assert.equal(un180.parameters.actor.skills.unarmed, 180);
    const tanqin99 = learn.find(c => c.id.endsWith('tanqin-99'));
    assert.equal(tanqin99.parameters.expected, 'refused');
    assert.match(tanqin99.parameters.refusal, /弹琴技法水平有限/);
});

test('validates learn records: refused and observed', () => {
    for (const c of cases.filter(c => c.parameters.kind === 'learn')) {
        const raw = trace(c);
        const result = validatePublicSpecialRecord(raw, c);
        assert.equal(result.kind, 'learn');
        assert.equal(result.accepted, c.parameters.expected === 'observed');
    }
});

test('hit_ob boundary pairs cover four gates with computed effect', () => {
    const hit = cases.filter(c => c.parameters.kind === 'hit_ob');
    assert.equal(hit.length, 8);
    for (const c of hit) {
        const p = c.parameters;
        assert.equal(p.interface.function, 'hit_ob');
        assert.equal(p.expected, 'observed', 'hit_ob always observed');
        assert.equal(p.interface.damage, p.effect.damage);
    }
    const raw179 = hit.find(c => c.id.endsWith('hit-raw-179'));
    assert.equal(raw179.parameters.effect.trigger, false);
    assert.equal(raw179.parameters.effect.gate, 'skill');
    const raw180 = hit.find(c => c.id.endsWith('hit-raw-180'));
    assert.equal(raw180.parameters.effect.trigger, true);
    assert.equal(raw180.parameters.effect.qi_damage, Math.trunc(180 / 5) + Math.trunc(200 / 3));
    assert.equal(raw180.parameters.effect.qi_wound, Math.trunc(180 / 8) + Math.trunc(200 / 5));
    const dmg150 = hit.find(c => c.id.endsWith('hit-damage-150'));
    assert.equal(dmg150.parameters.effect.trigger, true);
    assert.equal(dmg150.parameters.effect.qi_damage, Math.trunc(200 / 5) + Math.trunc(150 / 3));
    const victim9 = hit.find(c => c.id.endsWith('hit-victim-maxneili-9'));
    assert.equal(victim9.parameters.effect.trigger, false);
    assert.equal(victim9.parameters.effect.gate, 'victim_max_neili');
});

test('validates hit_ob records: no-trigger and trigger with effect', () => {
    for (const c of cases.filter(c => c.parameters.kind === 'hit_ob')) {
        const raw = trace(c);
        const result = validatePublicSpecialRecord(raw, c);
        assert.equal(result.kind, 'hit_ob');
        assert.equal(result.triggered, c.parameters.effect.trigger);
        if (result.triggered) {
            assert.equal(result.qi_damage, c.parameters.effect.qi_damage);
            assert.equal(result.qi_wound, c.parameters.effect.qi_wound);
        }
    }
});

test('effects summary aggregates observed records', () => {
    const c = cases.find(x => x.id.endsWith('hit-raw-180'));
    const rows = [0, 1].map(index => {
        const raw = trace(c); raw.index = index; return raw;
    });
    const summary = publicSpecialEffects(rows, c);
    assert.equal(summary.counts.observed, 2);
    assert.equal(summary.kind, 'hit_ob');
    assert.equal(summary.gate, 'skill');
});
