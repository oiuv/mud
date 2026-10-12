import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { shaolinChallengeConditions } from './shaolin_challenge_cases.mjs';
import { validateChallengeRecord, validateChallengeObservation } from './challenge_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_profile === 'shaolin-challenge'
    && !c.parameters.challenge_scenario);

// Synthetic reader contract only; not evidence of an actual game outcome.
function fixture(c) {
    const p = c.parameters, firstKu = p.challenge_order[0] === 'xuan-ku';
    const hosts = Object.fromEntries(Object.entries(p.challenge_rosters).map(([name, roster]) => [name, {
        assigned: 'left', requested: 1, fighting: 0, beat_count: 0, winner: 0,
        teacher_room: '/d/shaolin/wuchang', student_room: '/d/shaolin/wuchang', family: p.actor.properties.family,
        timers: { waiting: 1, preparing: 0, fighting: 0, do_back: 0, do_recruit: 0 },
        roster: Object.fromEntries(roster.map(program => [program, [{ program, object: program + '#99',
            clone: 1, living: 1, room: '/d/shaolin/wuchang' + (name === 'xuan-ku' ? '2' : '1') }]])),
    }]));
    const state = { skills: p.actor.skills, mappings: {}, jing: 10000, neili: 6000,
        family: '少林派', contribution: 100, combat_exp: 1000000 };
    const steps = p.teaching_expectations.map((e,i) => {
        const before = { ...structuredClone(state), jing: 10000-i*10,
            formation: { ...structuredClone(hosts[p.challenge_order[i]]), requested: 0 } };
        const after = { ...structuredClone(before), jing: before.jing-10,
            formation: structuredClone(hosts[p.challenge_order[i]]) };
        return { teacher_program: e.teacher.path, teacher: e.teacher.path + '#1', student: '/tests/teaching_actor#2',
            command: e.action, command_accepted: 1, before, after,
            messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' };
    });
    const f = { elapsed: 0.5, find_player_same: 1, qi: 1000000, combat_exp: 1000000, hosts, exits: {} };
    const final = structuredClone(f); final.elapsed = p.observe_seconds;
    const route = firstKu ? ['luohan5','wuchang2','wuchang','wuchang1','banruo5','wuchang1','wuchang']
        : ['banruo5','wuchang1','wuchang','wuchang2','luohan5','wuchang2','wuchang'];
    return { teaching: steps, challenge_timeline: [f, final], attacks: [], after: [{ qi: 1000000 }],
        challenge_messages: [], challenge_walks: route.slice(0,-1).map((room,i) => ({ accepted: 1,
            command: 'go ' + ((i<4) === firstKu ? 'west' : 'east'),
            before: '/d/shaolin/'+room, after: '/d/shaolin/'+route[i+1] })) };
}

test('4条双主持条件共6样本，旧9361条件完整指纹不变', () => {
    assert.equal(cases.length, 4); assert.equal(cases.reduce((n,c)=>n+c.samples,0),6);
    const prior = all.filter(c=>!['shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers'].includes(c.parameters.teaching_profile));
    assert.equal(prior.length,9361);
    assert.equal(sha256(JSON.stringify(prior)), '3cf07d46657c6f234917fecc0fa12c209028a3f778dce4c1f931c34c60b647a0');
    for (const c of cases) {
        assert.equal(c.parameters.actor.temp, undefined);
        assert.equal(c.parameters.actor.properties.luohan_winner,0);
        assert.equal(c.parameters.teaching_expectations.length,2);
    }
});
test('读取器可保留未过阵和占用状态，不将观察完成等同胜利', () => {
    for (const c of cases) {
        const r=fixture(c), s=validateChallengeObservation(r.teaching,c);
        assert.equal(s.length,2);
        assert.ok(s.every(s=>s.advanced && !s.acquired));
        const v=validateChallengeRecord(r,c);
        assert.equal(v.winner,0); assert.equal(v.experience_reward,0); assert.equal(v.assigned_hosts,2);
    }
});
test('登记、行走、时钟、真实罗汉或最终资源缺失时不接受记录', () => {
    const c=cases[0];
    for (const mutate of [
        r=>r.challenge_timeline[0].find_player_same=0,
        r=>r.challenge_timeline.at(-1).elapsed=10,
        r=>r.challenge_walks[0].after='/tests/runner',
        r=>r.challenge_timeline.at(-1).hosts['xuan-ku'].roster={},
        r=>r.challenge_timeline[0].hosts['xuan-ku'].winner=1,
        r=>r.after[0].qi--,
        r=>r.attacks.push({ actor: -1, target: 0, actor_program: '/tests/fake', target_program: '/tests/teaching_actor', elapsed: 1 }),
        r=>r.challenge_timeline.at(-1).hosts['xuan-ku'].timers.waiting=undefined,
    ]) { const r=fixture(c); mutate(r); assert.throws(()=>validateChallengeRecord(r,c)); }
});
test('询问必须产生九名原罗汉；不可预写请求或替换学生', () => {
    for (const mutate of [
        r=>r.teaching[0].before.formation.requested=1,
        r=>r.teaching[0].after.formation.roster={},
        r=>r.teaching[1].student='/tests/teaching_actor#3',
        r=>r.teaching[1].before.jing++,
    ]) { const c=cases[0],r=fixture(c); mutate(r); assert.throws(()=>validateChallengeObservation(r.teaching,c)); }
});
test('流程文件漂移须重审，夹具不调用原准备战斗奖励与复位函数', () => {
    assert.throws(()=>shaolinChallengeConditions(relations,
        p=>readFileSync(p,'utf8')+(p==='cmds/std/go.c'?'\n// changed':'')),/源码变化/);
    for (const file of ['runner','challenge_observer']) {
        const source=readFileSync(`tools/tests/martial_data/${file}.lpc`,'utf8');
        assert.doesNotMatch(source,/->(?:waiting|preparing|fighting|do_recruit|do_back)\s*\(/);
    }
    const source=readFileSync('tools/tests/martial_data/runner.lpc','utf8');
    assert.match(source,/players\[0\]->enable_player\(\)/);
    const execution=readFileSync('tools/tests/martial_data/execution.mjs','utf8');
    assert.match(execution,/\['spring', 'summer', 'autumn', 'winter'\]/);
    assert.match(execution,/\['rain', 'sun', 'wind'\]/);
});
