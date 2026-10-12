import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseArgs, root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolTeamConditions, arrayBonus, validateSchoolTeamRecord, teamEffects } from './school_team_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const conditions = schoolTeamConditions(catalog);

test('双玩家阵法独立条件，确定性重复与烟雾分开', () => {
    assert.equal(parseArgs(['school-team', '--smoke']).smoke, true);
    assert.throws(() => parseArgs(['school-team', '--samples', '100']), /无效参数/);
    assert.throws(() => parseArgs(['school-team', '--level', '100']), /无效参数/);
    assert.equal(conditions.length, 21);
    assert.equal(new Set(conditions.map(c => c.id)).size, 21);
    assert.ok(conditions.every(c => c.samples === 2 && c.method === 'team' && !c.parameters.fighting));
    assert.ok(schoolTeamConditions(catalog, { smoke: true }).every(c => c.samples === 1));
    assert.equal(conditions.filter(c => c.parameters.expected === 'refused').length, 7);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of conditions) {
        assert.ok(entries.has(c.entry_id));
        assert.ok(c.parameters.qualification_sources.includes('mudcore/inherit/team.c'));
    }
});

test('刀阵公式保留整数平均、等级差与施展方权重', () => {
    for (const [left, right, expected] of [[30, 30, 180], [200, 200, 1200], [400, 400, 2400],
        [800, 800, 4800], [200, 201, 600], [200, 400, 6], [400, 200, 11]])
        assert.equal(arrayBonus(left, right), expected);
});

function fakeRow(condition) {
    const p = condition.parameters;
    const states = [p.actor, p.target].map((config, side) => ({ object: '/tests/actor#' + side,
        userp: 1, interactive: 1, playerp: 1, wizardp: 0,
        mappings: structuredClone(config.mappings), skills: structuredClone(config.skills),
        neili: config.properties.neili, max_neili: config.properties.max_neili,
        qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
        temp: { apply: { armor: 100 } }, team: [], environment: '/tests/runner' }));
    const raw = { outcome: p.expected, before: structuredClone(states), metrics: [{}, {}],
        launches: [], team_steps: [] };
    for (const step of p.steps) {
        const before = structuredClone(states), launches = raw.launches.length;
        states.forEach((state, side) => {
            state.team = states.slice(0, step.team_sizes[side]).map(s => s.object);
            state.environment = '/tests/' + step.rooms[side];
        });
        let accepted = 1;
        if (step.action === 'perform blade.makearray') {
            if (p.expected === 'observed' && !raw.launches.length) {
                const bonus = arrayBonus(p.actor.skills['fanliangyi-dao'], p.target.skills['fanliangyi-dao']);
                raw.launches.push({ skill: 'fanliangyi-dao' });
                for (const state of states) {
                    state.temp.array = { name: 'fanliangyi-dao', level: bonus }; state.temp.no_quit = 1;
                    for (const field of ['attack', 'defense', 'damage', 'armor'])
                        state.temp.apply[field] = (state.temp.apply[field] ?? 0) + bonus;
                }
            } else accepted = 0;
        }
        raw.team_steps.push({ side: step.side, action: step.action, accepted,
            launches_before: launches, launches_after: raw.launches.length, before, after: structuredClone(states) });
    }
    raw.after = structuredClone(states);
    return raw;
}

test('逐步观察完整，资格/状态链/收支/真实增量任何一项失真即拒绝', () => {
    for (const condition of conditions) validateSchoolTeamRecord(fakeRow(condition), condition);
    const condition = conditions.find(c => c.id.endsWith('-leader-dismiss'));
    for (const corrupt of [
        r => { r.team_steps[0].after[0].wizardp = 1; },
        r => { r.team_steps[1].before[0].neili = 5000; },
        r => { r.team_steps.at(-1).after[0].team = ['unexpected']; },
        r => { r.metrics[1].neili_cost = 1; },
        r => { r.team_steps[2].after[0].temp.apply.damage--; },
        r => { r.launches.push({}); },
    ]) {
        const raw = fakeRow(condition); corrupt(raw);
        assert.throws(() => validateSchoolTeamRecord(raw, condition));
    }
});

test('报告保留未解除与正常解除两种数据，不把已知游戏缺陷写成工具合格断言', () => {
    const condition = conditions.find(c => c.id.endsWith('-leader-dismiss'));
    const raw = fakeRow(condition);
    validateSchoolTeamRecord(raw, condition);
    assert.equal(teamEffects(raw).at(-1).actors[0].apply_delta.attack, 1200);
    for (const side of [0, 1]) {
        for (const state of [raw.team_steps.at(-1).after[side], raw.after[side]]) {
            state.temp = structuredClone(raw.before[side].temp);
        }
    }
    validateSchoolTeamRecord(raw, condition);
    assert.equal(teamEffects(raw).at(-1).actors[0].apply_delta.attack, 0);
    const observer = readFileSync(new URL('./team_observer.lpc', import.meta.url), 'utf8');
    assert.ok(observer.includes('->force_me(step["action"])'));
    assert.ok(!/->(?:dismiss_array|add_temp|set_temp|delete_temp)\(/.test(observer));
});
