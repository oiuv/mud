import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { publicExertConditions, validatePublicExertRecord } from './school_public_exert_cases.mjs';
import { bahuangPowerupRecord, pointRecord } from './observed_effects_test_fixture.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const formal = publicExertConditions(catalog);
const smoke = publicExertConditions(catalog, { smoke: true });
const powerup = formal.find(c => c.parameters.skill === 'bahuang-gong' && c.parameters.ability === 'powerup');
const tan = formal.find(c => c.parameters.skill === 'hamagong' && c.parameters.ability === 'tan');

// Synthetic branch observations for validator tests, not native collection data.
function tanRecord(condition = tan, branch = 'hit') {
    const raw = pointRecord(condition);
    raw.before[0].handing_details = { object: '/tests/poison_item#3', program: '/tests/poison_item' };
    raw.before[0].handing = 'throwing';
    raw.after[0].handing = 'none'; raw.after[0].busy = 2;
    raw.metrics[0].neili_cost = 200; raw.after[0].neili -= 200;
    raw.tan_result = { owner: '/kungfu/skill/hamagong/exert/tan', actor: raw.before[0].object,
        target: raw.before[1].object, item: '/tests/poison_item#3', branch, poison_type: 'poison',
        poison: { id: 'hamagong-tan', level: 100, duration: 10 } };
    if (branch === 'hit') raw.after[1].conditions = { poison: { id: 'hamagong-tan', level: 100, remain: 1000 } };
    return raw;
}

test('弹毒保留真实中毒证据，加载失败或无分支证据不得伪装成未命中', () => {
    validatePublicExertRecord(tanRecord(), tan);
    const legacyHit = tanRecord(); delete legacyHit.tan_result;
    validatePublicExertRecord(legacyHit, tan);
    for (const mutate of [
        raw => { delete raw.after[1].conditions; },
        raw => { delete raw.tan_result; delete raw.after[1].conditions; },
        raw => { raw.tan_result.poison_type = null; },
        raw => { delete raw.tan_result.poison.id; },
        raw => { raw.tan_result.poison.level = 1; },
        raw => { raw.tan_result.poison.duration = 1; },
        raw => { raw.after[1].conditions.poison.id = 'wrong'; },
        raw => { raw.after[1].conditions.poison.level = 1; },
        raw => { raw.after[1].conditions.poison.remain = 0; },
        raw => { raw.before[1].conditions = structuredClone(raw.after[1].conditions); },
        raw => { raw.tan_result.owner = '/tests/fake'; },
        raw => { raw.tan_result.actor = raw.before[1].object; },
        raw => { raw.tan_result.target = raw.before[0].object; },
        raw => { raw.tan_result.item = '/tests/poison_item#99'; },
        raw => { raw.tan_result.branch = 'unknown'; },
    ]) {
        const raw = tanRecord(); mutate(raw);
        assert.throws(() => validatePublicExertRecord(raw, tan));
    }
    const poisonedActor = tanRecord(); poisonedActor.before[0].conditions = { poison: { id: 'unrelated' } };
    validatePublicExertRecord(poisonedActor, tan);
});

test('弹毒允许有原分支证据的被挡和闪避，但拒绝不可能分支及失手附毒', () => {
    validatePublicExertRecord(tanRecord(tan, 'blocked'), tan);
    const dodged = structuredClone(tan); dodged.parameters.target.skills.dodge = 1000;
    validatePublicExertRecord(tanRecord(dodged, 'dodged'), dodged);
    assert.throws(() => validatePublicExertRecord(tanRecord(tan, 'dodged'), tan), /impossible tan dodge/);
    const noBlock = structuredClone(tan); noBlock.parameters.target.properties.neili = 2800;
    assert.throws(() => validatePublicExertRecord(tanRecord(noBlock, 'blocked'), noBlock), /impossible tan block/);
    const noHit = structuredClone(tan); noHit.parameters.target.properties.neili = 9000;
    assert.throws(() => validatePublicExertRecord(tanRecord(noHit), noHit), /force gate/);
    const missWithPoison = tanRecord(); missWithPoison.tan_result.branch = 'blocked';
    assert.throws(() => validatePublicExertRecord(missWithPoison, tan), /must not apply poison/);
});

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
