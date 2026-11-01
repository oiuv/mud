import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { zuixianBuConditions, validateZuixianBuRecord, zuixianBuDodgeMsgs, zuixianBuId } from './zuixian_bu_cases.mjs';
import { abilityConditions } from './ability_cases.mjs';

const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = zuixianBuConditions(catalog, read);

function record(c) {
    const p = c.parameters, iface = p.interface;
    const result = p.expected_result === 'dodge_msg_member'
        ? '醉仙望月步，' + zuixianBuDodgeMsgs[0] + '闪过。' : p.expected_result;
    const snapshot = () => ({
        skills: { 'zuixian-bu': 200 }, mappings: {}, preparations: {},
        temp: {}, qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
        max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    });
    return {
        condition_id: c.id, method: 'interface', outcome: 'observed',
        interfaces: [{ object: iface.object, function: iface.function,
            ...(iface.argument ? { argument: iface.argument } : {}), result }],
        metrics: [{}, {}],
        before: [snapshot(), snapshot()], immediate: [snapshot(), snapshot()], after: [snapshot(), snapshot()],
    };
}

test('醉仙步接口级 7 条件：本地三接口+继承默认+五式原句，纯查询无副作用', () => {
    assert.equal(cases.length, 7);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 14);
    assert.ok(cases.every(c => c.parameters.collection_group === 'public-local-interfaces'));
    assert.ok(cases.every(c => c.parameters.skill === zuixianBuId));
    const smoke = zuixianBuConditions(catalog, read, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 7);
    const all = abilityConditions(catalog);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'public-local-interfaces'), cases);
    assert.ok(all.filter(c => c.id.startsWith('zuixian-bu-')).length === 7);
});

test('严格校验原返回值、五式原句成员与纯查询零副作用', () => {
    for (const c of cases) validateZuixianBuRecord(record(c), c);
    const first = cases.find(c => c.parameters.interface.function === 'valid_learn');
    const wrong = structuredClone(record(first));
    wrong.interfaces[0].result = 0;
    assert.throws(() => validateZuixianBuRecord(wrong, first));
    const msgCase = cases.find(c => c.parameters.interface.function === 'query_dodge_msg');
    const badMsg = structuredClone(record(msgCase));
    badMsg.interfaces[0].result = '随便一句';
    assert.throws(() => validateZuixianBuRecord(badMsg, msgCase));
    const mutated = structuredClone(record(first));
    mutated.immediate[0].qi = 9999;
    assert.throws(() => validateZuixianBuRecord(mutated, first), /纯查询/);
    const enableCase = cases.find(c => c.parameters.interface.argument === 'sword');
    assert.equal(record(enableCase).interfaces[0].result, 0);
});
