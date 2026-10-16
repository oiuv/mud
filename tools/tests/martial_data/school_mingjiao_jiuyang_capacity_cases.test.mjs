// Offline preparation tests. No native driver, observation or collection registration.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { mingjiaoJiuyangCapacityConditions, mingjiaoJiuyangCapacitySourcePaths,
    validateMingjiaoJiuyangCapacityCondition } from './school_mingjiao_jiuyang_capacity_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const readSource = path => readFileSync(resolve(root, path));
const mainPath = 'kungfu/skill/jiuyang-shengong.c';
const catalog = { skills: [{ path: mainPath,
    sha256: createHash('sha256').update(readSource(mainPath)).digest('hex') }] };
const conditions = mingjiaoJiuyangCapacityConditions(catalog, readSource);
const selected = (variant, ability) => conditions.find(c => c.parameters.variant === variant
    && c.parameters.ability === ability);

test('23 deterministic conditions, 46 formal/46 smoke; generation is not sampling', () => {
    assert.equal(conditions.length, 23); assert.equal(conditions.reduce((n, c) => n + c.samples, 0), 46);
    assert.deepEqual(mingjiaoJiuyangCapacityConditions(catalog, readSource, { smoke: true }), conditions);
    for (const c of conditions) {
        const p = validateMingjiaoJiuyangCapacityCondition(c);
        assert.equal(c.status, 'prepared_not_sampled'); assert.equal(p.random_effects, false);
        assert.equal(p.action, 'test_interface'); assert.equal(p.observe_seconds, 0);
        assert.ok(['query_neili_improve', 'query_current_neili_limit', 'query_neili_limit']
            .includes(p.interface.function));
    }
});
test('source-derived three levels distinguish original addition from the two USER limits', () => {
    for (const [level, additional, limit] of [[200, 750, 3750], [400, 3000, 9000], [800, 12000, 24000]]) {
        assert.equal(selected('level' + level, 'query_neili_improve').parameters.expected_return, additional);
        for (const ability of ['query_current_neili_limit', 'query_neili_limit'])
            assert.equal(selected('level' + level, ability).parameters.expected_return, limit);
    }
});
test('individual modifier and bonze expectations use raw con40 and exact original truncation', () => {
    for (const [variant, value] of [['improve10', 4125], ['breakup', 5250], ['mystery', 4350],
        ['guimai', 4312], ['bonze-shaolin', 4250], ['bonze-mingjiao', 3750]]) {
        for (const ability of ['query_current_neili_limit', 'query_neili_limit'])
            assert.equal(selected(variant, ability).parameters.expected_return, value);
    }
});
test('pre-owned force does not silently change mapped capacity or claim legitimate acquisition', () => {
    const current = selected('owned-force1000', 'query_current_neili_limit').parameters;
    const all = selected('owned-force1000', 'query_neili_limit').parameters;
    assert.equal(current.expected_return, 3750); assert.equal(all.expected_return, 23000);
    assert.equal(current.actor.mappings.force, 'jiuyang-shengong');
    assert.deepEqual(current.actor, all.actor);
    assert.match(current.qualification_note, /不证明.*兼修合法/);
});
test('fixed identities, values, costs, state and query-only interfaces reject drift', () => {
    for (const mutate of [c => { c.id += '-extra'; }, c => { c.samples = 100; },
        c => { c.parameters.expected_return++; }, c => { c.parameters.actor.properties.con = 41; },
        c => { c.parameters.interface.function = 'improve_neili'; },
        c => { c.parameters.actor.properties.max_neili++; }, c => { c.parameters.fighting = true; },
        c => { c.parameters.room.no_fight = 1; }, c => { c.parameters.arbitrary = 1; },
        c => { c.entry_id = 'clone/user/user.c'; }, c => { c.status = 'complete'; },
        c => { c.raw = {}; }]) {
        const changed = structuredClone(conditions[0]); mutate(changed);
        assert.throws(() => validateMingjiaoJiuyangCapacityCondition(changed));
    }
});
test('137 source hashes and catalog binding fail closed for missing, changed or substituted sources', () => {
    assert.equal(mingjiaoJiuyangCapacitySourcePaths.length, 137);
    assert.throws(() => mingjiaoJiuyangCapacityConditions(catalog,
        path => path === 'clone/user/user.c' ? Buffer.from('replacement') : readSource(path)));
    assert.throws(() => mingjiaoJiuyangCapacityConditions(catalog, () => undefined));
    assert.throws(() => mingjiaoJiuyangCapacityConditions({ skills: [] }, readSource));
    assert.throws(() => mingjiaoJiuyangCapacityConditions(catalog, readSource, { smoke: 1 }));
    for (const mutate of [c => { delete c.parameters.source_evidence['clone/user/user.c']; },
        c => { c.parameters.reviewed_source_hash = '0'.repeat(64); },
        c => { c.parameters.qualification_evidence.reverse(); }]) {
        const changed = structuredClone(conditions[0]); mutate(changed);
        assert.throws(() => validateMingjiaoJiuyangCapacityCondition(changed));
    }
});
test('condition output is independent across configs and source metadata', () => {
    const altered = mingjiaoJiuyangCapacityConditions(catalog, readSource);
    altered[0].parameters.actor.skills.force = 1;
    altered[0].parameters.source_evidence[mainPath] = '0'.repeat(64);
    assert.deepEqual(altered.slice(1), conditions.slice(1));
});
