import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPerformProbePlan, performProbeConditions } from './perform_probe_cases.mjs';
import { sha256 } from './inventory.mjs';

const parent = 'kungfu/skill/demo.c', path = 'kungfu/skill/demo/perform/hit.lpc';
const source = 'int perform(object me, object target) { return 1; }';
const files = { [parent]: 'int valid_enable(string usage) { return usage == "finger" || usage == "parry"; }',
    [path]: source };
const entry = { id: path + ':1:perform', path, kind: 'perform', sha256: sha256(source), line: 1, coverage: 'none' };
const report = { entries: [entry] };
const readSource = p => { assert.ok(Object.hasOwn(files, p), 'missing ' + p); return files[p]; };
const profile = () => ({ usage: 'finger', qualification_note: 'explicit test qualification',
    deterministic: true, samples: 2, observe_seconds: 0, expected: 'observed' });
const options = p => ({ profiles: { [entry.id]: p } });

test('unreviewed configurations remain pending, never silently become unarmed', () => {
    const r = buildPerformProbePlan(report, readSource);
    assert.equal(r.conditions.length, 0);
    assert.equal(r.pending.length, 1);
    assert.throws(() => performProbeConditions(report, readSource), /待配置/);
});

test('explicit usage avoids greedy parry matching and resolves nested .lpc parent correctly', () => {
    const c = performProbeConditions(report, readSource, options(profile()))[0];
    assert.equal(c.parameters.action, 'perform finger.hit');
    assert.deepEqual(c.parameters.actor.mappings, { finger: 'demo' });
    assert.equal(c.parameters.actor.skills.finger, 200);
    assert.equal(c.parameters.actor.skills.demo, 200);
    assert.equal(c.parameters.actor.equipment, undefined);
    assert.ok(c.parameters.qualification_sources.includes(parent));
    assert.ok(!c.parameters.qualification_sources.includes('kungfu/skill/demo/perform.c'));
    assert.equal(c.parameters.actor.properties['can_perform/demo/hit'], undefined);
});

test('source drift, defense-only usage, absent equipment and guessed aliases cannot launch a batch', () => {
    assert.equal(buildPerformProbePlan({ entries: [{ ...entry, sha256: 'bad' }] },
        readSource, options(profile())).pending.length, 1);
    assert.match(buildPerformProbePlan(report, readSource,
        options({ ...profile(), usage: 'parry' })).pending[0].reason, /攻击用法/);
    const swordReader = p => p === parent
        ? 'int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }' : readSource(p);
    assert.match(buildPerformProbePlan(report, swordReader,
        options({ ...profile(), usage: 'sword' })).pending[0].reason, /对应兵器/);
    const c = performProbeConditions(report, swordReader,
        options({ ...profile(), usage: 'sword', actor: { equipment: { type: 'sword', hold: false } } }))[0];
    assert.equal(c.parameters.actor.skills.sword, 200);
    assert.equal(c.parameters.action, 'perform sword.hit');
    assert.match(buildPerformProbePlan(report, p => {
        if (p === path) return source;
        throw new Error('missing parent');
    }, options(profile())).pending[0].reason, /主技能缺失/);
});

test('random sampling is not reduced to two and deterministic sampling is explicit', () => {
    assert.match(buildPerformProbePlan(report, readSource,
        options({ ...profile(), deterministic: false })).pending[0].reason, /不少于100/);
    const c = performProbeConditions(report, readSource,
        options({ ...profile(), deterministic: false, samples: 100 }))[0];
    assert.equal(c.samples, 100);
});
