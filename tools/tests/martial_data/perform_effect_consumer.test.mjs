import test from 'node:test';
import assert from 'node:assert/strict';
import {
    extractEffectFields, validatePerformEffectRecord, runEffectConsumerCounterExamples,
} from './perform_effect_consumer.mjs';

test('extractEffectFields strips comments and ignores me->receive_damage as target effect', () => {
    const source = `
        // target->receive_damage("qi", 999) in a comment must not count
        /* me->set_temp("fake", 1); */
        me->set_temp("powerup", 1);
        target->receive_damage("qi", 300);
        target->start_busy(2);
    `;
    const r = extractEffectFields(source);
    assert.ok(r.actorFields.includes('temp/powerup'));
    assert.ok(!r.actorFields.includes('temp/fake'));
    assert.ok(r.targetFields.includes('target/qi'));
    assert.ok(r.targetFields.includes('target/busy'));
    assert.equal(r.effectValues['target/qi'].min, 300);
    assert.equal(r.effectValues['temp/powerup'].exact, 1);
});

test('me->receive_damage("qi") self-cost is not a target effect', () => {
    const r = extractEffectFields('me->receive_damage("qi", 50);');
    assert.ok(!r.targetFields.includes('target/qi'));
});

test('all synthetic counterexamples behave principled (accept real, reject wrong)', () => {
    const results = runEffectConsumerCounterExamples();
    for (const r of results) assert.ok(r.pass, `${r.name}: ${r.error ?? ''}`);
    assert.ok(results.length >= 29, 'A7 principle coverage');
});

test('multi-field contract rejects partial effects (flag without bonuses)', () => {
    const cond = { id: 't', parameters: { kind: 'exert', usage: 'force', skill: 's',
        effect_contract: { actorFields: ['temp/apply/attack', 'temp/powerup'], targetFields: [],
            effectValues: { 'temp/apply/attack': { exact: 66 }, 'temp/powerup': { exact: 1 } } } } };
    const raw = { condition_id: 't', outcome: 'observed', index: 0,
        raw: {
            before: [{ qi: 10000, neili: 5000, temp: {}, mappings: { force: 's' } }, { qi: 10000, jing: 10000 }],
            after: [{ qi: 10000, neili: 4900, temp: { powerup: 1 }, mappings: { force: 's' } }, { qi: 10000, jing: 10000 }],
            immediate: [{ mappings: { force: 's' } }], metrics: [{}],
        } };
    assert.throws(() => validatePerformEffectRecord(raw, cond), /缺少源码预期效果/);
    raw.raw.after[0].temp = { powerup: 1, apply: { attack: 66 } };
    assert.doesNotThrow(() => validatePerformEffectRecord(raw, cond));
    raw.raw.after[0].temp.apply.attack = 10; // wrong value
    assert.throws(() => validatePerformEffectRecord(raw, cond), /缺少源码预期效果/);
});
