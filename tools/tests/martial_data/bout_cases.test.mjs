import assert from 'node:assert/strict';
import test from 'node:test';
import { root, parseArgs } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { boutConditions, validateBoutRecord } from './bout_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));

test('十二类交锋独立于单次统计；原时钟、交替先手、中性对手及暗器限制明确', () => {
    const full = boutConditions(catalog), smoke = boutConditions(catalog, { smoke: true });
    assert.equal(full.length, 48); assert.equal(smoke.length, 24);
    assert.ok(full.every(c => c.samples === 20 && c.parameters.observe_seconds === 30));
    assert.ok(smoke.every(c => c.samples === 2 && c.parameters.observe_seconds === 3));
    assert.equal(full.filter(c => c.parameters.not_applicable).length, 2);
    for (const c of full) {
        assert.equal(c.method, 'bout'); assert.equal(c.parameters.first, 'alternating_index');
        assert.equal(c.parameters.actor.properties.jiali, c.parameters.target.properties.jiali);
        assert.deepEqual(c.parameters.target.mappings, {});
    }
    assert.equal(parseArgs(['bouts', '--bouts', '5', '--level', '800']).bouts, 5);
    assert.throws(() => parseArgs(['bouts', '--samples', '5']), /无效/);
    assert.throws(() => parseArgs(['bouts', '--bouts', '0']), /正整数/);
});

test('先手、未决和绝招发动须有运行证据，不能把普攻或超时当胜利', () => {
    const condition = { parameters: { strategy: 'perform', observe_seconds: 30 } };
    const sample = { outcome: 'observed', index: 1, first: 1, first_actor: 1, terminal: 'time_limit',
        winner: -1, elapsed: 30.1, busy_seconds: [5, 2], metrics: [{ heartbeats: 20 }, { heartbeats: 21 }],
        before: [{ object: 'left' }, { object: 'right' }], launches: [{ actor: 'left' }] };
    validateBoutRecord(sample, condition);
    assert.throws(() => validateBoutRecord({ ...sample, winner: 0 }, condition), /未决/);
    assert.throws(() => validateBoutRecord({ ...sample, first_actor: 0 }, condition), /先手/);
    assert.throws(() => validateBoutRecord({ ...sample, launches: [] }, condition), /发动/);
    assert.throws(() => validateBoutRecord({ ...sample, elapsed: 29 }, condition));
    const terminal = { ...sample, terminal: 'unconscious', winner: 0,
        terminals: [{ side: 1, state: 'unconscious' }], after: [{ living: 1 }, { living: 0 }] };
    validateBoutRecord(terminal, condition);
    assert.throws(() => validateBoutRecord({ ...terminal, after: [{ living: 1 }, { living: 1 }] }, condition), /状态/);
});
