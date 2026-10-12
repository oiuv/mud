import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { gumuNpcCallbacks } from './school_gumu_npc_cases.mjs';
import { gumuNpcBoutConditions, gumuNpcBoutEffects } from './school_gumu_npc_bout_cases.mjs';
import { gumuNpcBoutReport, gumuNpcBoutMarkdown } from './school_gumu_npc_bout_report.mjs';

const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const catalog = collectCatalog(root, buildInventory(root));
const cases = gumuNpcBoutConditions(catalog, path => readFileSync(join(root, path), 'utf8'));
const choose = id => cases.find(c => c.parameters.npc.id === id
    && (id !== 'longnv' || c.parameters.npc.silver_state === 'free'));
const copy = structuredClone, silver = '/clone/lonely/yinsuo';

// A few synthetic report examples, not FluffOS executions, combat balance evidence or a new matrix.
function npcState(cfg) {
    const object = cfg.path + '#700';
    const inventory = cfg.original.gear.map((program, index) => ({
        object: program === silver ? silver : program + '#' + (701 + index), program, name: program,
        clone: program === silver ? 0 : 1, environment: object,
        skill_type: program === cfg.original.wield ? cfg.id === 'lin' ? 'sword' : 'whip'
            : program.endsWith('/fuchen2') ? 'whip' : null,
        equipped: program === cfg.original.wield ? 'wielded'
            : program.endsWith('/fuchen2') || program === '/clone/cloth/qingyi' ? null : 'worn',
        consistence: program === '/clone/cloth/qingyi' ? null : 100,
        weapon_prop: program === cfg.original.wield ? { damage: program === silver ? 150 : 25 } : {}, armor_prop: {},
    }));
    return { object, program: cfg.path, name: cfg.original.name, clone: 1, userp: 0, playerp: null,
        interactive: 0, wizardp: 0, living: 1, ghost: null, conditions: null, busy: null,
        properties: { ...copy(cfg.original.props), qi: cfg.original.props.max_qi, eff_qi: cfg.original.props.max_qi,
            jing: cfg.original.props.max_jing, eff_jing: cfg.original.props.max_jing,
            neili: cfg.original.props.max_neili, chat_chance_combat: 120, potential: null },
        skills: copy(cfg.original.skills), mappings: copy(cfg.original.mappings), preparations: copy(cfg.original.preparations),
        learned: {}, inventory, callouts: [],
        weapon: cfg.original.wield ? cfg.id === 'lin' ? 'sword' : 'whip' : 'none',
        weapon_object: inventory.find(item => item.program === cfg.original.wield)?.object ?? '', secondary_weapon_object: '',
        combat_callbacks: gumuNpcCallbacks[cfg.id].map(([entry, arg]) => entry === 'command'
            ? '(: <code>() :)' : `(: ${entry}, "${arg}" :)`),
        combat_callback_owners: gumuNpcCallbacks[cfg.id].map(() => object),
        temp: { apply: { attack: 150, defense: 150, damage: 100, unarmed_damage: 100,
            armor: 200, dodge: cfg.id === 'lin' ? -1 : 0 } },
    };
}
function userState(config, right = false) {
    const properties = Object.fromEntries(Object.entries(config.properties).filter(([key]) => !key.includes('/') && key !== 'character'));
    const cultivation = Object.fromEntries(Object.entries(config.properties).filter(([key]) => key.includes('/') || key === 'character'));
    return { object: `/tests/${right ? 'right' : 'left'}#${right ? 501 : 500}`,
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, busy: null, ghost: null, conditions: null,
        ...copy(properties), cultivation, skills: copy(config.skills), mappings: copy(config.mappings), preparations: copy(config.preparations),
        effective_con: 96, temp: { apply: { armor: 100, dodge: -1, damage: 50 } },
        weapon: 'sword', weapon_damage: 50, weapon_flag: 4, handing: 'none', handing_details: {}, secondary_weapon_details: {},
        weapon_details: { object: '/tests/sword#' + (right ? 601 : 600), program: '/tests/sword', damage: 50,
            weight: 3000, flag: 4, consistence: 100 },
    };
}
function record(condition, index = 0) {
    const p = condition.parameters, cfg = p.npc, before = npcState(cfg);
    const left = userState(p.actor), bystander = userState(p.target, true);
    const raw = { kind: 'sample', method: 'bout', condition_id: condition.id, index, outcome: 'observed',
        elapsed: p.observe_seconds, before: [left, bystander], after: [copy(left), copy(bystander)],
        metrics: [{ heartbeats: 1, parry: 1, rounds: 1 }, {}], attacks: [], npc_direct: [], attack_rounds: [], actions: [], passives: [],
    };
    const n = raw.npc_observation = { before, after: copy(before), target_object: left.object, room: '/tests/arena', silver: null, destroyed: 1,
        preparation: { entry_player: left.object, returned_player: left.object, initializer_actor: 'not_observed',
            npc_heartbeat_before: 1, npc_heartbeat_paused: 0, blueprint_heartbeat: 0,
            constructor_callbacks: [], loaded_before: [], loaded_after: ['/kungfu/skill/sad-strike'], created_npcs: [before.object] },
        cleanup: { enemies_removed: 1, objects: [before.object, ...before.inventory.map(item => item.object)]
            .map(object => ({ object, existed_before_cleanup: 1, destroyed: 1 })), remaining_callbacks: [] },
    };
    const b = raw.npc_bout = { npc_object: before.object, user_object: left.object, bystander_object: bystander.object,
        bystander_room: '/tests/elsewhere', npc_gross_resources: 'not_observed',
        first_actor: index % 2 ? 0 : -1, duration_limit_seconds: p.observe_seconds,
        terminal: 'time_limit', winner: 'none', terminal_events: [], corpse_returns: [], corpses: [],
        busy_seconds: { npc: 0, user: 0 },
        npc_metrics: { heartbeats: 1, scans: 1, chats: 1, choices: 1, hit: 0, dodge: 1, parry: 0,
            quick: 0, riposte: 0, direct: 0, rounds: 1, force: 0, martial: 0 },
        heartbeats: (index % 2 ? [0, -1] : [-1, 0]).map((actor, i) => ({ actor,
            actor_object: actor === -1 ? before.object : left.object, elapsed: 0.25 + i / 2, busy: null })), chat_choices: [],
    };
    const recover = gumuNpcCallbacks[cfg.id].findIndex(([entry, arg]) => entry === 'exert_function' && arg === 'recover');
    b.chat_choices.push({ actor: -1, actor_object: before.object, target: 0, target_object: left.object,
        heartbeat_index: index % 2 ? 1 : 0, elapsed: 0.9, busy: null, fighting: 1, index: recover,
        owner: before.object, repr: before.combat_callbacks[recover], result: 0,
        return_observation: 'observed', terminal_event_index: -1 });
    for (const actor of [-1, 0]) {
        const event = { actor, actor_object: actor === -1 ? before.object : left.object,
            target: actor === -1 ? 0 : -1, target_object: actor === -1 ? left.object : before.object };
        raw.attacks.push({ ...event, type: 0, result: actor === -1 ? -1 : -2, damage: 0 });
        raw.actions.push({ ...event, action: { action: '$N发动一次原动作', damage: 10 } });
        raw.attack_rounds.push({ actor, actor_object: event.actor_object, before: 0, after: 1, result: 1, elapsed: 0.95,
            heartbeat_index: b.heartbeats.findIndex(heartbeat => heartbeat.actor === actor),
            return_observation: 'observed', terminal_event_index: -1 });
    }
    if (cfg.id === 'longnv') n.silver = { object: silver, clone: 0, state: 'free',
        initial_environment: '', before_environment: before.object, after_environment: before.object,
        companion_before: null, companion_after: null, companion_room: '', companion_heartbeat: 0 };
    return raw;
}
function row(raw) { return { condition_id: raw.condition_id, index: raw.index, outcome: raw.outcome, reason: '', raw }; }
function failure(condition, index = 0) {
    return { condition_id: condition.id, index, outcome: 'error', reason: 'synthetic original error | <not success>\nnext line',
        raw: { kind: 'sample', method: 'bout', condition_id: condition.id, index, outcome: 'error', error: 'synthetic original error' } };
}
function dies(raw, actor = -1) {
    const b = raw.npc_bout, n = raw.npc_observation;
    b.terminal = 'death'; b.winner = actor === -1 ? 'user' : 'npc'; raw.elapsed = 1.5;
    const state = copy(actor === -1 ? n.before : raw.before[0]);
    (actor === -1 ? state.properties : state).qi = -1;
    b.terminal_events = [{ actor, actor_object: state.object, kind: 'death', elapsed: 1.1, state_before: state,
        heartbeat_index: b.heartbeats.findIndex(heartbeat => heartbeat.actor === actor), pending_choice_index: -1, pending_round_index: -1 }];
    if (actor === -1) {
        n.after = null; n.cleanup.objects.find(item => item.object === n.before.object).existed_before_cleanup = 0;
    } else { raw.after[0].living = 0; raw.after[0].ghost = 1; }
    const object = '/clone/misc/corpse#990';
    b.corpse_returns = [{ victim_object: state.object, result: object }];
    b.corpses = [{ object, program: '/clone/misc/corpse', victim_object: state.object,
        origin: 'original_make_corpse_return', environment: n.room,
        inventory_objects: actor === -1 ? n.before.inventory.map(item => item.object) : [raw.before[0].weapon_details.object] }];
    n.cleanup.objects.push({ object, existed_before_cleanup: 1, destroyed: 1 });
    if (actor === -1 && n.silver) n.silver.after_environment = object;
}
function pending(raw, kind) {
    dies(raw);
    const b = raw.npc_bout, call = kind === 'choice' ? b.chat_choices[0] : raw.attack_rounds[0];
    if (kind === 'round') {
        b.chat_choices = []; b.npc_metrics.choices = b.npc_metrics.chats = b.npc_metrics.scans = 0;
        call.after = 'not_observed';
    }
    call.return_observation = 'not_observed'; call.result = 'not_observed'; call.terminal_event_index = 0;
    b.terminal_events[0].heartbeat_index = call.heartbeat_index;
    b.terminal_events[0]['pending_' + kind + '_index'] = 0;
}
function commandChoice(raw, condition, result) {
    const choice = raw.npc_bout.chat_choices[0];
    choice.index = gumuNpcCallbacks[condition.parameters.npc.id].findIndex(([entry]) => entry === 'command');
    assert.ok(choice.index >= 0);
    choice.repr = raw.npc_observation.before.combat_callbacks[choice.index]; choice.result = result;
}

test('合成报告复用严格 effects；NPC 净差与 USER 毛账分列，不读 raw.parameters', () => {
    const condition = choose('li'), raw = record(condition);
    raw.npc_observation.after.properties.neili -= 13;
    raw.after[0].neili -= 6; Object.assign(raw.metrics[0], { neili_cost: 10, neili_recovery: 4 });
    raw.after[0].qi += 5; Object.assign(raw.metrics[0], { qi_cost: 7, qi_recovery: 12 });
    Object.defineProperty(raw, 'parameters', { get() { throw new Error('raw has no frozen parameters'); } });
    const rows = [row(raw)], summary = gumuNpcBoutReport(rows, condition), e = summary.effects;
    assert.deepEqual(e, gumuNpcBoutEffects(rows, condition));
    assert.equal(e.npc_endpoint_net_loss.neili.mean, 13);
    assert.equal(e.npc_preterminal_net_loss.neili.n, 0); assert.equal(e.npc_preterminal_net_loss.neili.unknown, 1);
    assert.equal(e.npc_gross_resources, 'not_observed');
    assert.equal(e.user_net_loss.neili.mean, 6); assert.equal(e.user_gross.neili.cost.mean, 10);
    assert.equal(e.user_gross.neili.recovery.mean, 4); assert.equal(e.user_net_loss.qi.mean, -5);
    assert.equal(e.user_gross.qi.cost.mean, 7); assert.equal(e.user_gross.qi.recovery.mean, 12);
    const md = gumuNpcBoutMarkdown(summary);
    for (const phrase of ['NPC 末态净损失', 'NPC 终态入口前净损失', 'USER 毛消耗', 'USER 毛恢复', 'USER1 只在场外旁观', 'NPC 毛消耗与毛恢复未观察']) assert.ok(md.includes(phrase));
    assert.doesNotMatch(md, /每点内力伤害|胜率|DPS|成功率\s*[：|]/);
});

test('实际秒数只合计观察场；原错误和缺样本不计成零值或未决', () => {
    const c = choose('li'), first = record(c, 0), last = record(c, 2); last.elapsed = 32;
    const rows = [row(first), failure(c, 1), row(last)], saved = copy(rows);
    const summary = gumuNpcBoutReport(rows, c);
    assert.deepEqual(summary.coverage, { planned: 20, recorded: 3, observed: 2, errors: 1, missing: 17 });
    assert.deepEqual(summary.clock, { observed_samples: 2, total_seconds: 62 });
    assert.equal(summary.effects.elapsed.mean, 31); assert.equal(summary.effects.elapsed.n, 2);
    assert.equal(summary.effects.undecided, 2); assert.deepEqual(summary.terminals, { death: 0, unconscious: 0, time_limit: 2 });
    assert.deepEqual(summary.errors, [{ index: 1, reason: rows[1].reason }]);
    const md = gumuNpcBoutMarkdown(summary);
    assert.match(md, /合计 62 秒/); assert.match(md, /错误 1；缺样本 17/);
    assert.ok(md.includes('synthetic original error \\| &lt;not success&gt;<br>next line'));
    assert.deepEqual(rows, saved);
});

test('空或只有错误时保留未知时钟/资源，不能声称测得零费用', () => {
    const c = choose('lin');
    for (const rows of [[], [failure(c)]]) {
        const summary = gumuNpcBoutReport(rows, c);
        assert.equal(summary.clock.total_seconds, null); assert.equal(summary.effects.elapsed.mean, null);
        assert.equal(summary.effects.user_gross.neili.cost.mean, null);
        assert.equal(summary.effects.npc_endpoint_net_loss.qi.mean, null);
        assert.equal(summary.coverage.missing, c.samples - rows.length);
        assert.equal(summary.effects.undecided, 0);
        assert.match(gumuNpcBoutMarkdown(summary), /合计 未知 秒/);
    }
});

test('方法实返 0/null/1 与同栈销毁未知分母独立', () => {
    const c = choose('li'), raws = [0, null, 1].map((result, index) => {
        const raw = record(c, index); raw.npc_bout.chat_choices[0].result = result; return raw;
    });
    const dead = record(c, 3); pending(dead, 'choice'); raws.push(dead);
    const summary = gumuNpcBoutReport(raws.map(row), c);
    const choice = summary.effects.choices.find(item => item.calls);
    assert.equal(choice.calls, 4); assert.equal(choice.returns_observed, 3); assert.equal(choice.returns_not_observed, 1);
    assert.deepEqual([choice.method_zero, choice.method_null, choice.method_one], [1, 1, 1]);
    assert.equal(choice.method_zero + choice.method_null + choice.method_one, choice.returns_observed);
    assert.equal(summary.effects.npc_endpoint_net_loss.qi.n, 3); assert.equal(summary.effects.npc_endpoint_net_loss.qi.unknown, 1);
    assert.equal(summary.effects.npc_preterminal_net_loss.qi.n, 1); assert.equal(summary.effects.npc_preterminal_net_loss.qi.unknown, 3);
    assert.equal(summary.effects.npc_preterminal_net_loss.qi.mean, dead.npc_observation.before.properties.qi + 1);
    assert.equal(summary.effects.user_wins, 1); assert.equal(summary.effects.undecided, 3);
    const md = gumuNpcBoutMarkdown(summary);
    assert.ok(md.includes('| 4 | 3 | 1 | 1 / 1 / 1 | 不适用 |'));
    assert.ok(md.includes('死亡入口终止')); assert.ok(md.includes('不等价于死亡处理全部完成'));
});

test('原 command 执行成本 249/0 与未知分开，不缩成布尔或方法 null', () => {
    const c = choose('longnv'), raws = [249, 0, 0].map((cost, index) => {
        const raw = record(c, index); commandChoice(raw, c, cost); return raw;
    });
    pending(raws[2], 'choice');
    const summary = gumuNpcBoutReport(raws.map(row), c), command = summary.effects.choices.find(choice => choice.entry === 'command');
    assert.equal(command.calls, 3); assert.equal(command.returns_observed, 2); assert.equal(command.returns_not_observed, 1);
    assert.equal(command.command_evaluation_cost.mean, 124.5); assert.equal(command.command_evaluation_cost.max, 249);
    assert.equal(command.command_evaluation_cost.n, 2); assert.equal(command.command_evaluation_cost.unknown, 1);
    assert.equal(command.command_evaluation_cost_not_observed, 1);
    assert.deepEqual([command.method_zero, command.method_null, command.method_one], [null, null, null]);
    const md = gumuNpcBoutMarkdown(summary);
    assert.match(md, /124\.5/); assert.match(md, /成本未知=1/); assert.match(md, /不是布尔值/);
});

test('NPC 死亡 pending 轮的返回和 after 仍未知，USER 轮必须有实返', () => {
    const c = choose('lin'), alive = record(c), dead = record(c, 1); pending(dead, 'round');
    const summary = gumuNpcBoutReport([row(alive), row(dead)], c);
    assert.deepEqual(summary.effects.sides.npc.rounds, {
        attempts: 2, returns_observed: 1, returns_not_observed: 1,
        result: { n: 1, unknown: 1, mean: 1, median: 1, p10: 1, p90: 1, p95: 1, min: 1, max: 1 },
        after_count: { n: 1, unknown: 1, mean: 1, median: 1, p10: 1, p90: 1, p95: 1, min: 1, max: 1 },
    });
    assert.equal(summary.effects.sides.user.rounds.returns_observed, 2);
    assert.equal(summary.effects.sides.user.rounds.returns_not_observed, 0);
    assert.ok(gumuNpcBoutMarkdown(summary).includes('| 原 NPC | 2 / 1 / 1 |'));
    const bad = copy(dead); bad.attack_rounds[1].return_observation = 'not_observed';
    bad.attack_rounds[1].result = bad.attack_rounds[1].after = 'not_observed';
    assert.throws(() => gumuNpcBoutReport([row(bad)], c));
});

test('NPC/USER 的原攻击类型与胜负分别记数，不以 actor -1 代替精确身份', () => {
    const c = choose('li'), raws = [0, 1, 2].map(index => record(c, index));
    raws[1].attacks[0].type = 1; raws[1].npc_bout.npc_metrics.riposte = 1;
    raws[2].attacks[1].type = 2; raws[2].metrics[0].quick = 1; dies(raws[2], 0);
    const summary = gumuNpcBoutReport(raws.map(row), c);
    assert.deepEqual(summary.attack_types, { npc: { 0: 2, 1: 1, 2: 0 }, user: { 0: 2, 1: 0, 2: 1 } });
    assert.equal(summary.effects.npc_wins, 1); assert.equal(summary.effects.undecided, 2);
    const bad = copy(raws[0]); bad.attacks[0].actor_object = '/kungfu/class/gumu/li#999';
    assert.throws(() => gumuNpcBoutReport([row(bad)], c));
});

test('任何结果均核外层/原件归属、编号及唯一性；错误不能藏过这些检查', () => {
    const c = choose('li');
    for (const seed of [row(record(c)), failure(c)]) {
        for (const mutate of [value => { delete value.condition_id; }, value => { value.condition_id = 'foreign'; },
            value => { value.raw.condition_id = 'foreign'; }, value => { value.outcome = 'not_applicable'; },
            value => { delete value.index; }, value => { value.index = 1; },
            value => { value.raw.index = 20; value.index = 20; }, value => { value.index = value.raw.index = -1; }]) {
            const bad = copy(seed); mutate(bad); assert.throws(() => gumuNpcBoutReport([bad], c));
        }
        assert.throws(() => gumuNpcBoutReport([seed, copy(seed)], c));
    }
    for (const reason of [undefined, null, '', '   ']) {
        const bad = failure(c); bad.reason = reason; assert.throws(() => gumuNpcBoutReport([bad], c));
    }
});

test('缺资源/计量、伪造费用、旁观者变化或无死亡的未知返回均不能伪零通过', () => {
    const c = choose('li');
    for (const mutate of [raw => { delete raw.metrics; }, raw => { raw.metrics[0] = null; },
        raw => { delete raw.npc_observation.after.properties.neili; }, raw => { raw.metrics[0].neili_cost = 3; },
        raw => { raw.metrics[0].neili_cost = null; }, raw => { raw.after[1].qi -= 1; raw.metrics[1].qi_cost = 1; },
        raw => { raw.npc_bout.chat_choices[0].return_observation = 'not_observed'; raw.npc_bout.chat_choices[0].result = 'not_observed'; }]) {
        const bad = record(c); mutate(bad); assert.throws(() => gumuNpcBoutReport([row(bad)], c));
    }
});

test('Markdown 缺未知字段时拒绝，不用 0/undefined 生成似真结果', () => {
    const c = choose('li'), source = gumuNpcBoutReport([row(record(c))], c);
    for (const mutate of [value => { delete value.clock.total_seconds; },
        value => { delete value.effects.user_gross.neili.cost; }, value => { value.effects.user_gross.neili.cost.mean = null; },
        value => { delete value.effects.choices[0].returns_not_observed; },
        value => { delete value.attack_types.npc[1]; }, value => { value.coverage.errors = undefined; }]) {
        const bad = copy(source); mutate(bad); assert.throws(() => gumuNpcBoutMarkdown(bad));
    }
    const saved = copy(source); gumuNpcBoutMarkdown(source); assert.deepEqual(source, saved);
});
