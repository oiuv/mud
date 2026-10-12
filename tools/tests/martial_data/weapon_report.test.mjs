import assert from 'node:assert/strict';
import test from 'node:test';
import { compareWeaponLevels, remainingBusy, weaponMarkdown } from './weapon_report.mjs';
import { profiles } from './weapon_cases.mjs';
import { summarizeSamples } from './statistics.mjs';

function sample(level) {
    const conditions = profiles.flatMap(p => ['ordinary', 'perform'].flatMap(method => [0, 50].map(jiali => ({
        id: `${p.type}-${method}-l${level}-j${jiali}`, method, samples: 100, entry_id: `${p.skill}:${method}`,
        parameters: { profile: p, actor: { skills: { [p.basic]: level, [p.skill]: level, 'martial-cognize': level },
            properties: { jiali } }, target: { skills: { dodge: 600 } } },
    }))));
    const manifest = { fingerprint: `series-${level}`, versions: { commit: 'fixed' }, identity: {
        source_fingerprint: 'fixed', dictionary_sha256: 'fixed', execution: { collection: 'weapons', smoke: false }, conditions } };
    const records = conditions.map(c => ({ condition_id: c.id, index: 0,
        outcome: c.parameters.profile.type === 'throwing' && c.method === 'ordinary' ? 'not_applicable' : 'observed',
        raw_sha256: c.id, raw: { after: [{ busy: 0 }, { busy: 1 }],
            metrics: [{ neili_cost: 5 }, { qi_cost: 10, neili_cost: 0 }] } }));
    return { directory: `series-${level}`, level, manifest, records, summary: summarizeSamples(manifest, records) };
}

test('成长报告只允许等级相关三项变化，不混用装备、目标或版本', () => {
    const series = [800, 200, 400].map(sample);
    assert.deepEqual(compareWeaponLevels(series).map(s => s.level), [200, 400, 800]);
    const target = structuredClone(series); target[0].manifest.identity.conditions[0].parameters.target.skills.dodge = 100;
    assert.throws(() => compareWeaponLevels(target), /其他条件/);
    const driver = structuredClone(series); driver[0].manifest.identity.execution.driver = 'different';
    assert.throws(() => compareWeaponLevels(driver), /驱动/);
    const duplicate = structuredClone(series); duplicate[0].directory = duplicate[1].directory;
    assert.throws(() => compareWeaponLevels(duplicate), /同一系列/);
    assert.throws(() => compareWeaponLevels(series.slice(1)));
});

test('报告保留十二类、暗器不适用和控制口径，不合并零值与未知', () => {
    const text = weaponMarkdown([200, 400, 800].map(sample));
    assert.match(text, /棍／金猿棍法/);
    assert.match(text, /暗器／金蛇锥法 \| 不适用/);
    assert.match(text, /针／辟邪剑法/);
    assert.match(text, /箫／玉箫剑法/);
    assert.match(text, /末尾忙乱不是控制触发率/);
    assert.match(text, /1\.00／0\.00/);
    assert.match(text, /不是所有同类武学/);
});

test('只有当前 busy 字段的已知 undefined 编码按零处理，缺失和函数仍未知', () => {
    assert.equal(remainingBusy({ busy: null }), 0);
    assert.equal(remainingBusy({ busy: 0 }), 0);
    assert.equal(remainingBusy({ busy: 3 }), 3);
    assert.equal(remainingBusy({}), null);
    assert.equal(remainingBusy(undefined), null);
    assert.equal(remainingBusy({ busy: '<function>' }), null);
});
