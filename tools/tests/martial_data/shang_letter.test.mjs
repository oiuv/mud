import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_kind === 'letter_teaching');
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-shang-letter-' + suffix));

// These fabricated rows verify the evidence reader, not the game's behavior.
function observation(c) {
    const p = c.parameters, student = '/tests/teaching_actor#1';
    let before = { contribution: p.actor.properties.gongxian, jing: 10000, neili: 6000,
        max_neili: p.actor.properties.max_neili, max_jingli: 1000, potential: 1200, learned_points: 200,
        effective_force: 0, effective_dodge: 0, shen: 0, str: 30,
        grants: Object.fromEntries(p.monitored_grants.map(k => [k, 0])),
        skills: { ...p.actor.skills }, learned: {}, mappings: {}, family: p.actor.properties['family/family_name'] };
    const item = (holder, teacher) => holder !== 'absent'
        ? { exists: 1, object: p.tracked_item.path, program: p.tracked_item.path,
            holder: holder === 'student' ? student : teacher.path + '#2', clone: 0 }
        : { exists: 0, object: '', program: '', holder: '', clone: 0 };
    return p.teaching_expectations.map(e => {
        const after = structuredClone(before), teacher = e.teacher ?? p.teacher;
        after.grants[e.grant] = e.value; after.contribution -= e.contribution_spent;
        after.jing -= e.command_kind === 'give' ? 0 : 12;
        if (e.reward_skill) after.learned[e.reward_skill] = 10;
        const row = { student, teacher: teacher.path + '#2', teacher_program: teacher.path,
            command: e.action ?? p.action, command_accepted: e.command_accepted ?? 1, elapsed: 0.01,
            before: structuredClone(before), after, item_before: item(e.item_before, teacher), item_after: item(e.item_after, teacher),
            message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: e.response_contains ? [{ category: 'vision', text: e.response_contains }] : [] };
        before = structuredClone(after); return row;
    });
}

test('书信追加16条件和2入口，旧3159条件与未注入领悟保留', () => {
    const prior = all.filter(c => !['feng', 'quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers'].includes(c.parameters.teaching_profile));
    assert.equal(prior.length, 3175); assert.equal(cases.length, 16);
    assert.equal(teachingEntries(prior).length, 320); assert.equal(teachingEntries(cases).length, 2);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        assert.equal(c.samples, 2);
        assert.ok(!Object.keys(c.parameters.actor.properties).some(k => k.startsWith('can_')));
        assert.ok(c.parameters.teaching_expectations.every(e => !e.offer));
        const result = validateTeachingObservation(observation(c), c);
        assert.equal(result.some(s => s.advanced) ? 'observed' : 'refused', c.parameters.expected);
    }
});

test('领信进展与最终领悟分开，原物品留在教师，重复交信不发新信', () => {
    const c = get('repeat-give'), result = validateTeachingObservation(observation(c), c);
    assert.deepEqual(result.map(s => s.item_acquired), [true, false, false]);
    assert.deepEqual(result.map(s => s.acquired), [false, true, false]);
    assert.deepEqual(result.map(s => s.contribution_spent), [2200, 0, 0]);
    assert.deepEqual(result.map(s => s.advanced), [true, true, false]);
    assert.equal(get('without-letter').parameters.expected, 'refused');
});

test('持信时原贡献检查先于重复提示，三个技能及最大内力保留独立门槛', () => {
    assert.equal(get('repeat-held').parameters.actor.properties.gongxian, 4400);
    assert.match(get('repeat-held').parameters.teaching_expectations[1].response_contains, /镇远镖局/);
    assert.match(get('repeat-exact-cost').parameters.teaching_expectations[1].response_contains, /碌碌无为/);
    for (const skill of ['bagua-dao', 'wai-bagua', 'nei-bagua']) for (const level of [0, 199])
        assert.equal(get(skill + '-' + level).parameters.actor.skills[skill], level);
    assert.equal(get('max-neili-low').parameters.actor.properties.max_neili, 3199);
    assert.equal(get('contribution-low').parameters.actor.properties.gongxian, 2199);
});

test('拒绝假书信、错误持有者、预写领悟、重置资源和变更教师版本', () => {
    const c = get('complete');
    for (const [mutate, pattern] of [
        [s => { s[0].item_after.clone = 1; }, /书信身份/],
        [s => { s[1].item_before.holder = '/tests/other#3'; }, /书信身份/],
        [s => { s[0].before.grants[c.parameters.monitored_grants[0]] = 1; }, /预写领悟/],
        [s => { s[1].before.contribution = 2200; }, /重置或注入/],
        [s => { s[1].item_after = s[1].item_before; }, /书信身份/],
    ]) {
        const rows = observation(c); mutate(rows);
        assert.throws(() => validateTeachingObservation(rows, c), pattern);
    }
    const wrong = structuredClone(c); wrong.parameters.teaching_expectations[1].teacher.sha256 = 'wrong';
    assert.throws(() => validateTeachingObservation(observation(wrong), wrong), /教师版本/);
});

test('书信源码必须固定版本，且原文不能被夹具替代', () => {
    assert.throws(() => teachingConditions(relations, catalog, path =>
        readFileSync(join(root, path), 'utf8') + (path === 'clone/special/sjmletter.c' ? '\n' : '')),
    /书信源码变化/);
    const source = readFileSync(join(root, 'tools/tests/martial_data/teaching_observer.lpc'), 'utf8');
    const observer = source.split('private mapping teaching_item')[1].split('mapping observe_command')[0];
    assert.match(observer, /find_object/); assert.doesNotMatch(observer, /load_object|clone_object|->move/);
});
