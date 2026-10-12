import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { learningConditions, validateLearningRecord } from './learning_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = learningConditions(catalog);

test('学习用例固定真实入口与前置条件，配置不冒充运行结果', () => {
    assert.equal(cases.length, 12);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        assert.equal(c.samples, 2);
        assert.equal(c.method, 'interface');
        assert.equal(c.parameters.fighting, false);
        assert.equal(c.parameters.interface.function, 'valid_learn');
        assert.ok(catalog.skills.some(s => s.entries.some(e => e.id === c.entry_id)));
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)));
        assert.equal(c.parameters.actor.equipment, undefined);
        assert.deepEqual(c.parameters.actor.mappings, {});
        assert.ok(!Object.hasOwn(c, 'result'));
    }
    const cold = cases.find(c => c.id === 'learning-lengyue-force-10');
    assert.equal(cold.parameters.actor.properties.gender, '无性');
    assert.ok(cold.parameters.qualification_sources.includes('inherit/skill/force.c'));
    const beginner = cases.find(c => c.id === 'learning-diancanghai-level-0');
    assert.equal(beginner.parameters.actor.skills['dian-canghai'], undefined);
    assert.equal(beginner.parameters.actor.skills['xuan-huntun'], undefined);
    assert.equal(beginner.parameters.actor.properties.con, 35);
    assert.throws(() => learningConditions({ skills: [] }), /学习入口未收录/);
});

test('当前错误行为与合法前置拒绝分别观察，不为通过而补错误 ID', () => {
    const outcomes = Object.fromEntries(cases.map(c => [c.id, c.parameters.expected]));
    assert.equal(outcomes['learning-chousui-strike-80'], 'observed');
    assert.equal(outcomes['learning-chousui-strike-79'], 'refused');
    assert.equal(outcomes['learning-lengyue-force-10'], 'observed');
    assert.equal(outcomes['learning-lengyue-force-9'], 'refused');
    assert.equal(outcomes['learning-xiaoao-flute'], 'refused');
    assert.equal(outcomes['learning-xiaoao-qin'], 'observed');
    assert.equal(outcomes['learning-diancanghai-level-0'], 'refused');
    assert.equal(outcomes['learning-diancanghai-level-200'], 'refused');
    for (const c of cases) for (const skill of Object.keys(c.parameters.actor.skills)) {
        assert.ok(catalog.skills.some(s => s.id === skill));
    }
});

test('学习观察核对真实接口、技能与资源，不接受只报一个通过状态', () => {
    // Synthetic observations exercise the validator only, not the game behavior.
    const c = cases.find(item => item.id === 'learning-xiaoao-flute');
    const actor = { weapon: 'none', skills: c.parameters.actor.skills, ...c.parameters.actor.properties };
    const before = [actor, { weapon: 'none', skills: {} }];
    const raw = { condition_id: c.id, method: 'interface', outcome: 'refused',
        interfaces: [{ ...c.parameters.interface, result: 0 }], metrics: [{}, {}],
        before, immediate: structuredClone(before), after: structuredClone(before),
        reason: c.parameters.expected_reason };
    validateLearningRecord(raw, c);
    const wrongKey = structuredClone(raw); wrongKey.before[0].skills['cuhixiao-jifa'] = 100;
    assert.throws(() => validateLearningRecord(wrongKey, c));
    const paid = structuredClone(raw); paid.metrics[0].neili_cost = 100;
    assert.throws(() => validateLearningRecord(paid, c));
    const otherReason = structuredClone(raw); otherReason.reason = '前置条件不足';
    assert.throws(() => validateLearningRecord(otherReason, c));
    const wrongCall = structuredClone(raw); wrongCall.interfaces[0].function = 'practice_skill';
    assert.throws(() => validateLearningRecord(wrongCall, c));
});
