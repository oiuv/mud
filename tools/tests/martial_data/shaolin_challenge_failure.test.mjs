import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { validateChallengeRecord } from './challenge_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const all = teachingConditions(schoolRelations(inventory, catalog), catalog);
const cases = all.filter(c => c.parameters.challenge_scenario === 'low-health');

test('新增4个低气血条件、8条样本；旧9365条件完整定义不变', () => {
    assert.equal(cases.length, 4);
    assert.equal(cases.reduce((n,c) => n+c.samples, 0), 8);
    const old = all.filter(c => !c.parameters.challenge_scenario
        && !['emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile));
    assert.equal(old.length, 9365);
    assert.equal(sha256(JSON.stringify(old)), 'e0874390c46cb1fed862780b8af029f54d86ab1d427eff8850117246d8309cb3');
});

test('失败条件只调整明确初态，沿用原询问移动及30秒观察，不预写失败或胜利', () => {
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(p.teaching_profile, 'shaolin-challenge');
        assert.equal(p.teaching_expectations.length, 2);
        assert.equal(p.observe_seconds, 30);
        assert.equal(p.actor.temp, undefined);
        assert.equal(p.actor.properties.luohan_winner, 0);
        assert.deepEqual(['qi','eff_qi','max_qi','water'].map(k=>p.actor.properties[k]), [1,1,10000,0]);
        assert.equal(Object.values(p.actor.skills).every(n=>n===80), true);
    }
    const source = readFileSync('feature/damage.c','utf8');
    assert.match(source,/if \(my\["water"\] < 1 && is_user\)\s*return update_flag/);
    const runner = readFileSync('tools/tests/martial_data/runner.lpc','utf8');
    assert.doesNotMatch(runner, /->(?:waiting|preparing|fighting|do_recruit|do_back)\s*\(/);
});

// Synthetic observation tests the reader only, not the game's failure path.
function observation(c) {
    const p = c.parameters, firstKu = p.challenge_order[0] === 'xuan-ku';
    const hosts = Object.fromEntries(Object.entries(p.challenge_rosters).map(([name, roster]) => [name, {
        requested: 1, fighting: 0, beat_count: 0, winner: 0, assigned: 'left',
        student_room: '/d/shaolin/wuchang', family: p.actor.properties.family,
        timers: { waiting: 1, preparing: 0, fighting: 0, do_back: 0, do_recruit: 0 },
        roster: Object.fromEntries(roster.map(program => [program, [{ program, clone: 1,
            room: '/d/shaolin/wuchang' + (name === 'xuan-ku' ? '2' : '1') }]])),
    }]));
    const first = { elapsed: 0.5, living: 1, ghost: 0, find_player_same: 1,
        qi: 1, combat_exp: 1000000, hosts, exits: {} };
    const final = { ...structuredClone(first), elapsed: 30, qi: 0, living: 0, find_player_same: 0 };
    const route = firstKu ? ['luohan5','wuchang2','wuchang','wuchang1','banruo5','wuchang1','wuchang']
        : ['banruo5','wuchang1','wuchang','wuchang2','luohan5','wuchang2','wuchang'];
    return { challenge_timeline: [first, final], terminals: [{ side: 0, state: 'unconscious' }],
        teaching: [{ after: { combat_exp: 1000000 } }], after: [{ qi: 0 }], attacks: [],
        challenge_messages: [], challenge_walks: route.slice(0, -1).map((room, i) => ({
            before: '/d/shaolin/' + room, after: '/d/shaolin/' + route[i+1], accepted: 1,
            command: 'go ' + ((i < 4) === firstKu ? 'west' : 'east'),
        })) };
}

test('保留原昏迷后查找不到隔离角色的观察，不将采集成功改写为过阵', () => {
    for (const c of cases) {
        const raw = observation(c), result = validateChallengeRecord(raw, c);
        assert.equal(result.winner, 0);
        assert.equal(result.experience_reward, 0);
        // A deployment with an account UID may still find an unconscious player.
        raw.challenge_timeline.at(-1).find_player_same = 1;
        validateChallengeRecord(raw, c);
    }
});

test('仍拒绝未登记、清醒失联、遗漏终态或状态缺失，旧成功条件校验不放宽', () => {
    const c = cases[0];
    for (const mutate of [
        r => r.challenge_timeline[0].find_player_same = 0,
        r => r.challenge_timeline.at(-1).living = 1,
        r => r.terminals = [],
        r => r.terminals[0].side = 1,
        r => delete r.challenge_timeline.at(-1).living,
    ]) {
        const raw = observation(c); mutate(raw);
        assert.throws(() => validateChallengeRecord(raw, c));
    }
    const old = structuredClone(c); delete old.parameters.challenge_scenario;
    assert.throws(() => validateChallengeRecord(observation(c), old));
});
