import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { publicExertConditions, validatePublicExertRecord } from './school_public_exert_cases.mjs';
import { bahuangPowerupRecord } from './observed_effects_test_fixture.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const formal = publicExertConditions(catalog);
const smoke = publicExertConditions(catalog, { smoke: true });
const powerup = formal.find(c => c.parameters.skill === 'bahuang-gong' && c.parameters.ability === 'powerup');

test('公共运功绑定真实 exert 入口而非武学主文件，烟雾不计正式数量', () => {
    assert.equal(formal.length, 45);
    for (const c of formal) {
        const source = catalog.skills.find(s => s.path === c.parameters.ability_source.path);
        assert.equal(source.sha256, c.parameters.ability_source.sha256);
        assert.equal(c.entry_id, source.entries.find(e => e.role === 'exert').id);
        assert.ok([2, 100].includes(c.samples));
    }
    assert.ok(smoke.every(c => c.samples === 2));
});

test('公共增益必须同时观察源码费用和属性增量，空效果不得通过', () => {
    validatePublicExertRecord(bahuangPowerupRecord(powerup), powerup);
    for (const mutate of [
        raw => { raw.metrics[0].neili_cost = 0; raw.after[0].neili = raw.before[0].neili; },
        raw => { raw.after[0].temp = structuredClone(raw.before[0].temp); },
        raw => { raw.after[0].temp.apply.attack--; },
        raw => { raw.after[0].temp.powerup = 0; },
        raw => { raw.launches[0].skill = 'wrong'; },
        raw => { raw.launches[0].argument = 'shield'; },
    ]) {
        const raw = bahuangPowerupRecord(powerup);
        mutate(raw);
        assert.throws(() => validatePublicExertRecord(raw, powerup));
    }
});

test('旧运功记录只能使用冻结 catalog 证明源码版本，不能回读当前仓库', () => {
    const legacy = structuredClone(powerup);
    delete legacy.parameters.ability_source;
    assert.throws(() => validatePublicExertRecord(bahuangPowerupRecord(powerup), legacy), /frozen ability/);
    validatePublicExertRecord(bahuangPowerupRecord(powerup), legacy, { catalog });
    const changed = { catalog: { skills: catalog.skills.map(s => ({ ...s, sha256: '0'.repeat(64) })) } };
    assert.throws(() => validatePublicExertRecord(bahuangPowerupRecord(powerup), legacy, changed), /frozen ability/);
});
