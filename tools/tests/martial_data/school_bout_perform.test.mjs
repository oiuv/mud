import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { boutPerformConditions, boutPerformProfiles } from './school_bout_perform_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = boutPerformConditions(catalog);

test('G5 perform扩展：7配置14条件（仅绝招策略×加力0/50）', () => {
    assert.equal(cases.length, 14);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 280);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        assert.equal(c.method, 'bout');
        assert.equal(c.parameters.strategy, 'perform');
        assert.equal(c.parameters.observe_seconds, 30);
        assert.ok(c.parameters.action.startsWith('perform '), c.id);
        for (const p of c.parameters.qualification_sources)
            assert.ok(existsSync(join(root, p)), p);
    }
    const schools = new Set(cases.map(c => c.parameters.school));
    assert.equal(schools.size, 4);  // wudang/shaolin/emei/gumu
});

test('烟雾条件2样本3秒', () => {
    for (const c of boutPerformConditions(catalog, { smoke: true })) {
        assert.equal(c.samples, 2);
        assert.equal(c.parameters.observe_seconds, 3);
    }
});

function row(c, index = 0) {
    const before = [c.parameters.actor, c.parameters.target].map((config, side) => ({
        ...config.properties, userp: 1, interactive: 1, wizardp: 0,
        object: '/test/player#' + side,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations),
        weapon: config.equipment?.type ?? 'none', weapon_damage: config.equipment ? 50 : 0, temp: {},
    }));
    return { outcome: 'observed', index, first: index % 2, first_actor: index % 2,
        method: 'bout', before, immediate: structuredClone(before), after: structuredClone(before),
        attacks: [], attack_rounds: [], interfaces: [], launches: [{ actor: before[0].object }],
        passives: [], defenses: [],
        terminal: 'time_limit', elapsed: 30.1, winner: -1, busy_seconds: [0, 0],
        metrics: [{ heartbeats: 15 }, { heartbeats: 15 }] };
}

test('G5 绝招策略校验：需有实际发动', async () => {
    const { validateBoutPerformRecord } = await import('./school_bout_perform_cases.mjs');
    for (const c of cases) {
        const r = row(c);
        r.launches = [{ actor: r.before[0].object, skill: c.parameters.skill, argument: c.parameters.action.split('.')[1] }];
        validateBoutPerformRecord(r, c);
        const bad = edit => { const copy = structuredClone(r); edit(copy);
            assert.throws(() => validateBoutPerformRecord(copy, c)); };
        bad(copy => { copy.launches = []; });
        bad(copy => { delete copy.before[0].object; delete copy.launches[0].actor; });
        bad(copy => { copy.launches[0].actor = copy.before[1].object; });
        bad(copy => { copy.launches[0].skill = 'other-skill'; });
        bad(copy => { copy.launches[0].argument = 'other_move'; });
        bad(copy => { delete copy.launches[0].skill; });
        bad(copy => { delete copy.launches[0].argument; });
        bad(copy => { copy.launches.push({ actor: copy.before[0].object,
            skill: c.parameters.skill, argument: 'other_move' }); });
        bad(copy => { copy.before[0].weapon = 'wrong'; });
        bad(copy => { copy.before[0].skills = {}; });
        bad(copy => { copy.before[0].mappings = {}; });
        bad(copy => { copy.before[0].neili = 0; });
        bad(copy => { copy.metrics[0].heartbeats = 0; });
    }
});
