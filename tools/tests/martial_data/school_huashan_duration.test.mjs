// Synthetic checks only; a real original timer is still required for acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const catalog = collectCatalog(root, buildInventory(root));
const all = schoolCombatConditions(catalog), cases = all.filter(c => c.parameters.collection_group === 'huashan-duration');
test('S6六条件12正式，原200/400/800秒；旧111/9336与完整指纹不变', () => {
    const old = all.filter(c => c.parameters.school === 'huashan' && !c.parameters.collection_group);
    assert.equal(old.length, 111); assert.equal(old.reduce((n, c) => n + c.samples, 0), 9336);
    assert.equal(sha256(JSON.stringify(old)), '28bda639d393b5dfce95f4c6f9f0d5067487ad079d50b2e2e32976a61b916eb9');
    assert.equal(cases.length, 6); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 12);
    assert.equal(cases.reduce((n, c) => n + c.parameters.level * c.samples, 0), 5600);
    assert.deepEqual(all.slice(-6), cases);
    for (const c of cases) {
        assert.equal(c.parameters.observe_seconds, c.parameters.level + 2);
        assert.equal(c.parameters.actor.skills['zixia-shengong'], c.parameters.level);
        assert.equal(c.parameters.actor.mappings.force, 'zixia-shengong');
        assert.equal(c.parameters.observation, 'timed_effect'); assert.equal(c.samples, 2);
        assert.equal(c.parameters.actor.properties.neili, 6000); assert.equal(c.parameters.actor.equipment.type, 'sword');
        assert.ok(!c.parameters.strategy); assert.equal(c.parameters.expected, 'observed');
    }
});
test('烟雾仅200级两个原回调各一次，不缩时，也不冒充高档正式', () => {
    const smoke = schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'huashan-duration');
    assert.equal(smoke.length, 2); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 2);
    assert.ok(smoke.every(c => c.parameters.level === 200 && c.parameters.observe_seconds === 202 && c.samples === 1));
    for (const c of smoke) { const formal = cases.find(x => x.id === c.id); assert.deepEqual(c.parameters, formal.parameters); }
});
function trace(c) {
    const p = c.parameters, cost = p.ability === 'powerup' ? 100 : 200;
    const before = [p.actor, p.target].map(config => ({ ...config.properties,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings), temp: { apply: { damage: 50 } } }));
    const immediate = structuredClone(before), fields = p.ability === 'powerup' ? ['attack', 'defense'] : ['damage', 'sword'];
    immediate[0].busy = 3; immediate[0].neili -= cost; immediate[0].temp[p.ability] = 1;
    for (const key of fields) immediate[0].temp.apply[key] = (before[0].temp.apply[key] ?? 0) + Math.floor(p.level / (p.ability === 'powerup' ? 3 : 10));
    const after = structuredClone(immediate); delete after[0].temp[p.ability];
    for (const key of fields) after[0].temp.apply[key] = before[0].temp.apply[key] ?? 0;
    return { kind: 'sample', condition_id: c.id, index: 0, method: 'exert', outcome: 'observed', before, immediate, after,
        launches: [{ skill: 'zixia-shengong' }], metrics: [{ neili_cost: cost }, {}], elapsed: p.level + 2.1,
        callbacks: [{ side: 0, phase: 'before', elapsed: p.level + 0.1, state: structuredClone(immediate[0]) },
            { side: 0, phase: 'after', elapsed: p.level + 0.11, state: structuredClone(after[0]) }] };
}
test('三档均检查真实等待、原增量、原费用及完整前后撤回；不能仅返回成功', () => {
    for (const c of cases) {
        const r = trace(c), field = c.parameters.ability === 'powerup' ? 'attack' : 'damage';
        validateSchoolCombatRecord(r, c);
        for (const mutate of [r => { r.callbacks = []; }, r => { r.callbacks[0].elapsed = 10; },
            r => { r.callbacks[1].phase = 'before'; }, r => { r.callbacks[0].side = 1; },
            r => { r.after[0].temp.apply[field]++; }, r => { r.callbacks[1].state.temp[c.parameters.ability] = 1; },
            r => { r.after[0].neili++; }, r => { r.immediate[0].temp.apply[field]++; },
            r => { r.metrics[0].neili_cost = 0; }, r => { r.elapsed = c.parameters.level; }]) {
            const wrong = structuredClone(r); mutate(wrong); assert.throws(() => validateSchoolCombatRecord(wrong, c));
        }
    }
});
test('原定时源未改；不得通过自定义时长、能力或等级绕过S6契约', () => {
    for (const [ability, hash] of [['powerup', '0dd7e762f7ac9fca0c6e3b00e117789b0dd2ce4ee0bba96fa5c9eac52701cf06'],
        ['ziqi', 'eb0208d34600b734620ca360a8826b3e6628f147a2a5df94a76eeba37abdeccb']])
        assert.equal(sha256(readFileSync(join(root, 'kungfu/skill/zixia-shengong/' + ability + '.c'))), hash);
    for (const mutate of [p => { p.level = 150; }, p => { p.observe_seconds = 3; },
        p => { p.action = 'test_interface'; }, p => { p.actor.skills['zixia-shengong'] = 150; },
        p => { p.actor.properties.neili = 99999; }]) {
        const wrong = structuredClone(cases[0]); mutate(wrong.parameters);
        assert.throws(() => validateSchoolCombatRecord(trace(cases[0]), wrong));
    }
});
