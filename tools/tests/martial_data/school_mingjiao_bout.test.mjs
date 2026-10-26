import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { mingjiaoBoutConditions, validateMingjiaoBoutRecord } from './school_mingjiao_bout_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoBoutConditions(catalog);

test('明教三组合18条件（普通+绝招×加力0/50/210）；烟雾独立', () => {
    assert.equal(cases.length, 18);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 360);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        assert.equal(c.method, 'bout');
        assert.equal(c.parameters.school, 'mingjiao');
        assert.equal(c.parameters.collection_group, 'mingjiao-bout');
        assert.equal(c.parameters.observe_seconds, 30);
        for (const p of c.parameters.qualification_sources)
            assert.ok(existsSync(join(root, p)), p);
    }
    const ordinary = cases.filter(c => c.parameters.strategy === 'ordinary');
    const perform = cases.filter(c => c.parameters.strategy === 'perform');
    assert.equal(ordinary.length, 9);
    assert.equal(perform.length, 9);
});

test('烟雾条件2样本3秒', () => {
    for (const c of mingjiaoBoutConditions(catalog, { smoke: true })) {
        assert.equal(c.samples, 2);
        assert.equal(c.parameters.observe_seconds, 3);
    }
});

function row(c, index = 0) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        ...config.properties, userp: 1, interactive: 1, wizardp: 0,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations),
        weapon: config.equipment?.type ?? 'none', weapon_damage: config.equipment ? 50 : 0, temp: {},
    }));
    return { outcome: 'observed', index, first: index % 2, first_actor: index % 2,
        method: 'bout', before, immediate: structuredClone(before), after: structuredClone(before),
        attacks: [], attack_rounds: [], interfaces: [], launches: [], passives: [], defenses: [],
        terminal: 'time_limit', elapsed: 30.1, winner: -1, busy_seconds: [0, 0],
        metrics: [{ heartbeats: 15 }, { heartbeats: 15 }] };
}

test('明教组合初态与绝招策略分别核对', () => {
    for (const c of cases) {
        const r = row(c);
        if (c.parameters.strategy === 'perform')
            r.launches = [{ actor: r.before[0].object, perform: c.parameters.action }];
        validateMingjiaoBoutRecord(r, c);
        const bad = row(c); bad.before[0].mappings.force = 'shaolin-xinfa';
        if (c.parameters.strategy === 'perform')
            bad.launches = [{ actor: bad.before[0].object, perform: c.parameters.action }];
        assert.throws(() => validateMingjiaoBoutRecord(bad, c));
    }
});
