import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { shaolinFormationConditions } from './shaolin_formation_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_profile === 'shaolin-formation');
const get = id => structuredClone(cases.find(c => c.id === 'teaching-shaolin-formation-' + id));

// Fabricated contract records only; the real timer must be tested by the driver.
function fixture(c) {
    const p = c.parameters, v = p.actor.properties, allowed = p.teaching_expectations[0].allowed;
    const before = { ...v, contribution: v.gongxian, skills: p.actor.skills, mappings: {}, learned: {}, grants: {},
        formation: { assigned: '', requested: 0, other_requested: 0, fighting: 0, beat_count: 0,
            winner: v.luohan_winner, guilty: v.guilty, family: v.family || {}, student_id: 'left',
            student_room: '/tests/runner', teacher_room: '/tests/runner', roster: {},
            timers: { waiting: 0, preparing: 0, fighting: 0, do_back: 0, do_recruit: 0 } } };
    const after = structuredClone(before); after.jing -= 10;
    if (allowed) {
        Object.assign(after.formation, { assigned: 'left', requested: 1, teacher_room: '/d/shaolin/wuchang' });
        after.formation.timers.waiting = 1;
        for (const program of p.formation.roster) after.formation.roster[program] = [{ program,
            object: program + '#10', room: p.formation.field, clone: 1, living: 1 }];
    }
    return [{ student: '/tests/teaching_actor#1', teacher: p.teacher.path + '#2', teacher_program: p.teacher.path,
        command: p.action, command_accepted: 1, elapsed: 0.01, before, after,
        messages: [], message_scope: 'receive_message_apply_input_not_full_transcript',
        ...(p.observe_seconds ? { wait_elapsed: 306, wait_after: structuredClone(after.formation) } : {}) }];
}

test('60条资格条件重复两次、两条自然等待单采，旧9299条件指纹不变', () => {
    assert.equal(cases.length, 62); assert.equal(cases.reduce((n,c) => n+c.samples, 0), 122);
    const old = all.filter(c => !['shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile));
    assert.equal(old.length, 9299);
    assert.equal(sha256(JSON.stringify(old)), '1c1e2724c70aaa6988c61d3b5ebd878f2cedd1952ca9f7535a8d721c6578d4a3');
    for (const c of cases) assert.equal(c.parameters.actor.temp, undefined);
});
test('资格成功要求真实九名罗汉与等待回调，不能当成过阵成功', () => {
    for (const c of cases) {
        const [s] = validateTeachingObservation(fixture(c), c);
        assert.equal(s.advanced, c.parameters.expected === 'observed', c.id);
        assert.equal(s.acquired, false);
        assert.equal(s.monks_summoned, s.advanced ? 9 : 0);
    }
});
test('等待缺陷要求超过300秒仍占用的真实状态，缺字段或假获胜不能通过', () => {
    for (const mutate of [
        r => r[0].wait_elapsed = 299,
        r => delete r[0].wait_after,
        r => r[0].wait_after.assigned = '',
        r => r[0].wait_after.timers.waiting = 0,
        r => r[0].after.formation.roster = {},
        r => Object.values(r[0].after.formation.roster)[0].push({}),
        r => r[0].after.formation.requested = null,
        r => r[0].after.formation.winner = 1,
        r => r[0].after.formation.fighting = 1,
        r => r[0].after.formation.student_room = '/d/shaolin/wuchang',
        r => r[0].after.skills.force++,
        r => r[0].after.jing = r[0].before.jing,
    ]) {
        const c = get('wait-xuan-ku-absent-challenger'), rows = fixture(c); mutate(rows);
        assert.throws(() => validateTeachingObservation(rows, c));
    }
});
test('门槛观察保留缺项可过与无门派可过的原行为，不强行补足基本功', () => {
    for (const teacher of ['xuan-ku', 'xuan-nan']) {
        assert.equal(get(`gate-${teacher}-no-family`).parameters.expected, 'observed');
        assert.equal(get(`gate-${teacher}-generation39`).parameters.expected, 'refused');
        assert.deepEqual(get(`gate-${teacher}-two-unchecked-skills`).parameters.actor.skills, { literate: 1, buddhism: 1 });
        assert.equal(get(`gate-${teacher}-force-missing`).parameters.expected, 'observed');
        assert.equal(get(`gate-${teacher}-force-79`).parameters.expected, 'refused');
    }
});
test('源文件变化必须重新核对；观察器不提前制造许可或调用原等待函数', () => {
    assert.throws(() => shaolinFormationConditions(relations,
        p => readFileSync(p, 'utf8') + (p.endsWith('xuan-ku.h') ? '\n// changed' : '')), /源码变化/);
    const observer = readFileSync('tools/tests/martial_data/formation_observer.lpc', 'utf8');
    assert.doesNotMatch(observer, /->(?:set|set_temp|waiting|do_back|do_recruit)\s*\(/);
});
