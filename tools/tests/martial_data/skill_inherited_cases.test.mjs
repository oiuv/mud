import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { skillInheritedIds, skillInheritedSourcePaths, skillInheritedReviewed,
    skillInheritedInterfaces, skillInheritedConditions, validateSkillInheritedRecord } from './skill_inherited_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const readSource = path => readFileSync(join(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
// Finite source-derived test catalog; no directory scan, game process or file writes.
const catalog = { skills: skillInheritedIds.map(id => {
    const path = `kungfu/skill/${id}.${id === 'spear' ? 'lpc' : 'c'}`;
    return { id, top_level: true, path, sha256: hash(readSource(path)), entries: [],
        inherits: [{ literal: null, evidence: { text: 'inherit SKILL;' } }] };
}) };
const cases = skillInheritedConditions(catalog, readSource);

function fixture(condition) {
    const p = condition.parameters;
    const before = [p.actor, p.target].map((config, side) => ({
        object: `/tests/combatant#${side + 1}`, userp: 1, playerp: 1, interactive: 1, living: 1,
        wizardp: 0, ghost: 0, busy: 0, weapon: 'none', handing: 'none',
        skills: structuredClone(config.skills), mappings: {}, preparations: {},
        temp: { apply: { armor: 100 } }, ...config.properties,
    }));
    return { kind: 'sample', condition_id: condition.id, method: 'interface', outcome: 'observed',
        command_accepted: 1,
        interfaces: [{ ...p.interface, result: p.expected_result, implemented_by: '/inherit/skill/skill' }],
        before, immediate: structuredClone(before), after: structuredClone(before), metrics: [{}, {}],
        launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [], dropped: [] };
}

test('20个真实纯继承文件，三种公共接口分母固定且配置不冒充采样', () => {
    assert.equal(skillInheritedIds.length, 20);
    assert.equal(skillInheritedSourcePaths.length, 39);
    assert.equal(cases.length, 60);
    assert.equal(new Set(cases.map(c => c.id)).size, 60);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 120);
    for (const c of cases) {
        assert.equal(c.status, 'prepared_not_sampled');
        assert.equal(c.method, 'interface');
        assert.equal(c.parameters.action, 'test_interface');
        assert.equal(c.entry_id, `kungfu/skill/${c.parameters.skill}.${c.parameters.skill === 'spear' ? 'lpc' : 'c'}`);
        assert.equal(c.parameters.actor.equipment, undefined);
        assert.deepEqual(c.parameters.interface, { object: `/kungfu/skill/${c.parameters.skill}`,
            function: c.parameters.interface.function });
        assert.ok(!Object.hasOwn(c, 'result'));
        assert.deepEqual(c.parameters.qualification_sources, [...skillInheritedSourcePaths]);
    }
    const smoke = skillInheritedConditions(catalog, readSource, { smoke: true });
    assert.equal(smoke.length, 60);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 60);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.throws(() => skillInheritedConditions(catalog, readSource, { smoke: 1 }));
});

test('来源变更、文件未收录、本地函数或非精确分母均须重新核对', () => {
    const badCatalog = structuredClone(catalog);
    badCatalog.skills[0].entries.push({ function: 'valid_learn' });
    assert.throws(() => skillInheritedConditions(badCatalog, readSource));
    const missing = structuredClone(catalog); missing.skills.pop();
    assert.throws(() => skillInheritedConditions(missing, readSource));
    const duplicate = structuredClone(catalog); duplicate.skills.push(structuredClone(duplicate.skills[0]));
    assert.throws(() => skillInheritedConditions(duplicate, readSource));
    const changed = path => path === 'inherit/skill/skill.c' ? Buffer.from('inherit SKILL;') : readSource(path);
    assert.throws(() => skillInheritedConditions(catalog, changed), /来源改变/);
    const macros = path => path === 'include/globals.h'
        ? Buffer.from(readSource(path).toString().replace('"/inherit/skill/skill"', '"/inherit/skill/force"')) : readSource(path);
    assert.throws(() => skillInheritedConditions(catalog, macros), /来源改变/);
    const stale = structuredClone(catalog); stale.skills[0].sha256 = '0'.repeat(64);
    assert.throws(() => skillInheritedConditions(stale, readSource), /目录快照/);
    assert.equal(hash(JSON.stringify(skillInheritedSourcePaths.map(path => [path, hash(readSource(path))]))),
        skillInheritedReviewed);
});

test('合成自检只证明校验器：逐对象实际返回类型与继承来源不可混淆', () => {
    for (const c of cases) {
        const raw = fixture(c), result = validateSkillInheritedRecord(raw, c);
        assert.equal(result.result, skillInheritedInterfaces[c.parameters.interface.function]);
        assert.equal(result.scope, 'inherited_defaults_only');
        const wrong = structuredClone(raw); wrong.interfaces[0].result = 0;
        assert.throws(() => validateSkillInheritedRecord(wrong, c));
        const missing = structuredClone(raw); delete missing.interfaces[0].implemented_by;
        assert.throws(() => validateSkillInheritedRecord(missing, c));
        const otherOwner = structuredClone(raw); otherOwner.interfaces[0].implemented_by = '/inherit/skill/force';
        assert.throws(() => validateSkillInheritedRecord(otherOwner, c));
    }
    const c = cases.find(c => c.parameters.interface.function === 'valid_learn_level');
    const bool = fixture(c); bool.interfaces[0].result = true;
    assert.throws(() => validateSkillInheritedRecord(bool, c));
    const missingFn = structuredClone(c); missingFn.parameters.interface.function = 'query_action';
    assert.throws(() => validateSkillInheritedRecord(fixture(missingFn), missingFn));
});

test('无真实USER命令、NPC替代、伪受理或观察窗口漂移不能通过', () => {
    const c = cases[0];
    for (const modify of [raw => { raw.command_accepted = 0; },
        raw => { delete raw.command_accepted; }, raw => { raw.before[0].userp = 0; },
        raw => { raw.before[0].wizardp = 1; }, raw => { raw.before[1].interactive = 0; },
        raw => { raw.before[0].skills.blade = 200; },
        raw => { raw.after[0].object = '/tests/other#3'; },
        raw => { raw.interfaces[0].object = '/inherit/skill/skill'; }]) {
        const raw = fixture(c); modify(raw);
        assert.throws(() => validateSkillInheritedRecord(raw, c));
    }
});

test('全可见状态、双方资源毛账及无效果观察分别核对', () => {
    const c = cases[0];
    for (const modify of [raw => { raw.after[0].neili--; },
        raw => { raw.immediate[0].temp.apply.armor++; },
        raw => { raw.after[1].jing--; }, raw => { raw.metrics[0].neili_cost = 1; },
        raw => { raw.metrics[1].qi_recovery = 1; }, raw => { raw.metrics[0].heartbeats = 1; },
        raw => { raw.callbacks.push({ phase: 'after' }); },
        raw => { raw.attacks.push({ damage: 0 }); }]) {
        const raw = fixture(c); modify(raw);
        assert.throws(() => validateSkillInheritedRecord(raw, c));
    }
    const rewrite = structuredClone(c); rewrite.parameters.source_evidence['feature/skill.c'] = '0'.repeat(64);
    assert.throws(() => validateSkillInheritedRecord(fixture(rewrite), rewrite), /来源被改写/);
});
