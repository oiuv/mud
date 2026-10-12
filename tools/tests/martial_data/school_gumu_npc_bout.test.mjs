import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { validateExpectedOutcomes, validateRecord } from './execution.mjs';
import { gumuNpcCallbacks, gumuNpcConditions } from './school_gumu_npc_cases.mjs';
import { gumuBoutConditions } from './school_gumu_bout_cases.mjs';
import { gumuNpcBoutGroup, gumuNpcBoutSources, gumuNpcBoutConditions, gumuNpcBoutEntries,
    validateGumuNpcBoutPlan, validateGumuNpcBoutRecord, gumuNpcBoutEffects } from './school_gumu_npc_bout_cases.mjs';

const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const readSource = path => readFileSync(join(root, path), 'utf8');
const cases = gumuNpcBoutConditions(catalog, readSource), smoke = gumuNpcBoutConditions(catalog, readSource, { smoke: true });
const copy = structuredClone, hash = value => sha256(JSON.stringify(value));
const choose = (id, state = id === 'longnv' ? 'free' : 'original') => cases.find(c => c.parameters.npc.id === id && c.parameters.npc.silver_state === state);
const silver = '/clone/lonely/yinsuo';
const resourceNames = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];

// Synthetic contract data only: no claim these damage/selection sequences came from FluffOS.
function npcState(cfg, suffix = 700) {
    const object = cfg.path + '#' + suffix;
    const inventory = cfg.original.gear.map((program, i) => ({
        object: program === silver ? silver : program + '#' + (suffix + 1 + i), program, name: program,
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
        weapon_object: inventory.find(i => i.program === cfg.original.wield)?.object ?? '', secondary_weapon_object: '',
        combat_callbacks: gumuNpcCallbacks[cfg.id].map(([entry, arg]) => entry === 'command'
            ? '(: <code>() :)' : `(: ${entry}, "${arg}" :)`),
        combat_callback_owners: gumuNpcCallbacks[cfg.id].map(() => object),
        temp: { apply: { attack: 150, defense: 150, damage: 100, unarmed_damage: 100,
            armor: 200, dodge: cfg.id === 'lin' ? -1 : 0 } },
    };
}
function userState(config, right = false) {
    const properties = Object.fromEntries(Object.entries(config.properties).filter(([k]) => !k.includes('/') && k !== 'character'));
    const cultivation = Object.fromEntries(Object.entries(config.properties).filter(([k]) => k.includes('/') || k === 'character'));
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
    const p = condition.parameters, cfg = p.npc, before = npcState(cfg), after = copy(before);
    const left = userState(p.actor), bystander = userState(p.target, true);
    const raw = { kind: 'sample', method: 'bout', condition_id: condition.id, index, outcome: 'observed',
        elapsed: p.observe_seconds, before: [left, bystander], after: [copy(left), copy(bystander)],
        metrics: [{ heartbeats: 1, parry: 1, rounds: 1 }, {}], attacks: [], npc_direct: [], attack_rounds: [], actions: [], passives: [],
    };
    const n = raw.npc_observation = { before, after, target_object: left.object, room: '/tests/arena', silver: null, destroyed: 1,
        preparation: { entry_player: left.object, returned_player: left.object, initializer_actor: 'not_observed',
            npc_heartbeat_before: 1, npc_heartbeat_paused: 0, blueprint_heartbeat: 0,
            constructor_callbacks: [], loaded_before: [], loaded_after: ['/kungfu/skill/sad-strike'], created_npcs: [before.object] },
        cleanup: { enemies_removed: 1, objects: [before.object, ...before.inventory.map(i => i.object)]
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
            heartbeat_index: b.heartbeats.findIndex(h => h.actor === actor),
            return_observation: 'observed', terminal_event_index: -1 });
    }
    if (cfg.id === 'longnv') {
        const companion = cfg.silver_state === 'occupied' ? npcState({ ...cfg, original: { ...cfg.original,
            gear: [silver, '/clone/cloth/baipao'], wield: silver } }, 900) : null;
        n.silver = { object: silver, clone: 0, state: cfg.silver_state,
            initial_environment: companion?.object ?? '', before_environment: companion?.object ?? before.object,
            after_environment: companion?.object ?? before.object, companion_before: companion, companion_after: copy(companion),
            companion_room: companion ? '/tests/preparation' : '', companion_heartbeat: 0 };
        if (companion) {
            n.preparation.created_npcs.push(companion.object);
            n.cleanup.objects.push(...[companion.object, ...companion.inventory.map(i => i.object)]
                .map(object => ({ object, existed_before_cleanup: 1, destroyed: 1 })));
        }
    }
    return raw;
}
function check(raw, c) { validateRecord(raw, c); validateGumuNpcBoutRecord(raw, c); }
function dies(raw, c, actor = -1, corpse = true) {
    const b = raw.npc_bout, n = raw.npc_observation;
    b.terminal = 'death'; b.winner = actor === -1 ? 'user' : 'npc'; raw.elapsed = 1.5;
    const state = actor === -1 ? copy(n.before) : copy(raw.before[0]);
    (actor === -1 ? state.properties : state).qi = -1;
    b.terminal_events = [{ actor, actor_object: state.object, kind: 'death', elapsed: 1.1, state_before: state,
        heartbeat_index: b.heartbeats.findIndex(h => h.actor === actor), pending_choice_index: -1, pending_round_index: -1 }];
    if (actor === -1) {
        n.after = null; n.cleanup.objects.find(o => o.object === n.before.object).existed_before_cleanup = 0;
    } else { raw.after[0].living = 0; raw.after[0].ghost = 1; }
    const object = corpse ? '/clone/misc/corpse#990' : 0;
    b.corpse_returns = [{ victim_object: state.object, result: object }];
    if (corpse) {
        const items = actor === -1 ? n.before.inventory.map(i => i.object) : [raw.before[0].weapon_details.object];
        b.corpses = [{ object, program: '/clone/misc/corpse', victim_object: state.object,
            origin: 'original_make_corpse_return', environment: n.room, inventory_objects: items }];
        n.cleanup.objects.push({ object, existed_before_cleanup: 1, destroyed: 1 });
        if (actor === -1 && c.parameters.npc.silver_state === 'free') n.silver.after_environment = object;
    }
}
function pendingDeath(raw, c, kind) {
    dies(raw, c);
    const b = raw.npc_bout;
    const call = kind === 'choice' ? b.chat_choices[0] : raw.attack_rounds[0];
    if (kind === 'choice') {
        call.index = gumuNpcCallbacks[c.parameters.npc.id].findIndex(([entry]) => entry !== 'exert_function');
        call.repr = raw.npc_observation.before.combat_callbacks[call.index];
    } else {
        // Destruction inside the original attack precedes scan/chat in this heartbeat.
        b.chat_choices = []; b.npc_metrics.choices = b.npc_metrics.chats = b.npc_metrics.scans = 0;
        call.after = 'not_observed';
    }
    call.return_observation = 'not_observed'; call.result = 'not_observed'; call.terminal_event_index = 0;
    b.terminal_events[0].heartbeat_index = call.heartbeat_index;
    b.terminal_events[0]['pending_' + kind + '_index'] = 0;
    return call;
}

test('5原NPC状态/100正式/10烟雾固定；不复制或重配原NPC', () => {
    validateGumuNpcBoutPlan(cases, catalog, readSource);
    validateGumuNpcBoutPlan(smoke, catalog, readSource, { smoke: true });
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    assert.equal(cases.reduce((s, c) => s + c.samples, 0), 100);
    assert.equal(smoke.reduce((s, c) => s + c.samples, 0), 10);
    assert.equal(hash(cases), '6b03296cc5bb01c17e3d4f281c68de2aa20ccbae1081ecacf0168972f70f7502');
    assert.equal(hash(smoke), 'b015dd53587252d8c609ddeb4e6a128ee48685c6a034ce0c3bcfd7a9030cc1e4');
    assert.equal(gumuNpcBoutSources.length, 62);
    assert.equal(hash(cases[0].parameters.source_evidence), '5d51a7b8f10196c12a1d3f70d74d52d208d425b9ffaf97d4bb030b6ec3389e54');
    const originals = gumuNpcConditions(catalog, readSource).filter(c => c.parameters.npc.callback_index === -1);
    for (const [i, c] of cases.entries()) {
        assert.deepEqual(c.parameters.npc, originals[i].parameters.npc);
        assert.deepEqual(c.parameters.actor, gumuBoutConditions(catalog)[0].parameters.target);
        assert.equal(c.parameters.observe_seconds, 30); assert.equal(smoke[i].parameters.observe_seconds, 3);
    }
});

test('实际create/open建档四NPC白名单与固定5条件，不声称已全局注册或驱动通过', () => {
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-npc-bout-unit-'));
    try {
        const input = { inventory, catalog, conditions: cases, npcEntries: gumuNpcBoutEntries(cases),
            execution: { synthetic: true, driver_started: false } };
        assert.equal(input.npcEntries.length, 4);
        const manifest = createSeries(directory, input);
        assert.deepEqual(openSeries(directory).identity.conditions, cases);
        assert.equal(openSeries(directory).fingerprint, manifest.fingerprint);
        createSeries(join(directory, 'smoke'), { ...input, conditions: smoke });
        assert.deepEqual(openSeries(join(directory, 'smoke')).identity.conditions, smoke);
        for (const [name, change] of [
            ['id', i => i.conditions[0].id += '中文'], ['entry', i => i.conditions[0].entry_id += '-missing'],
            ['source', i => i.npcEntries[0].sha256 = '0'.repeat(64)],
            ['path', i => i.npcEntries[0].path = 'kungfu/class/shaolin/xuanci.c'],
            ['parameter', i => i.conditions[0].parameters = null],
        ]) {
            const changed = copy(input); change(changed); assert.throws(() => createSeries(join(directory, name), changed));
        }
    } finally {
        assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + 'mud-gumu-npc-bout-unit-'));
        rmSync(directory, { recursive: true, force: true });
    }
    assert.throws(() => gumuNpcBoutConditions(catalog, readSource, { smoke: 'yes' }));
    assert.throws(() => gumuNpcBoutConditions({ ...catalog, teachers: [] }, readSource));
    assert.throws(() => gumuNpcBoutConditions(catalog, p => p.endsWith('/lin.c') ? readSource(p) + '\n' : readSource(p)));
});

test('五个原身份、两个真实USER、交替首个原心跳、原青衣/银索回退合成正例', () => {
    for (const c of [...cases, ...smoke]) for (const index of [0, 1]) check(record(c, index), c);
    for (const c of [choose('li'), choose('lin'), choose('yang')]) {
        const r = record(c); r.npc_observation.silver = 0; check(r, c);
    }
});

test('actor=-1必须同时等于确切被测NPC，占有者、外部NPC、旁观者都拒绝', () => {
    const c = choose('longnv', 'occupied');
    for (const change of [
        r => r.attacks[0].actor_object = r.npc_observation.silver.companion_before.object,
        r => r.attacks[0].actor_object = '/kungfu/class/gumu/longnv#123456',
        r => delete r.attacks[0].actor_object,
        r => { delete r.attacks[0].target; delete r.attacks[0].target_object; },
        r => r.npc_direct.push({ actor: 1, actor_object: r.before[1].object, target: -1, target_object: r.npc_bout.npc_object }),
        r => r.attacks[1].target_object = r.npc_observation.silver.companion_before.object,
        r => r.npc_bout.heartbeats[0].actor_object = r.before[1].object,
        r => r.npc_observation.before.playerp = 1,
        r => r.before[0].interactive = 0,
    ]) { const r = record(c); change(r); assert.throws(() => check(r, c)); }
});

test('原武学/资源/配装初态不可标准化；后续正常磨损与成长不被误判初态改变', () => {
    const c = choose('lin');
    for (const change of [
        r => r.npc_observation.before.skills['yunv-xinjing'] = 400,
        r => r.npc_observation.before.properties.jiali = 0,
        r => r.npc_observation.before.inventory[1].equipped = 'worn',
        r => r.npc_observation.before.inventory[1].consistence = 100,
        r => delete r.npc_observation.before.inventory[1].consistence,
        r => r.npc_observation.before.temp.apply.armor = 201,
        r => r.npc_observation.before.combat_callbacks[0] = '(: perform_action, "sword.corrected" :)',
        r => r.before[0].temp.apply.dodge = 0,
    ]) { const r = record(c); change(r); assert.throws(() => check(r, c)); }
    const r = record(c); r.npc_observation.after.inventory[0].consistence = 99;
    r.npc_observation.after.learned.sword = 1; r.npc_observation.after.properties.potential = 1;
    check(r, c);
});

test('自然scan/chat选中原索引；不手工替代闭包、重复选招或将command成本当布尔', () => {
    const c = choose('longnv', 'occupied'), r = record(c), choice = r.npc_bout.chat_choices[0];
    choice.index = 0; choice.repr = r.npc_observation.before.combat_callbacks[0]; choice.result = 476;
    check(r, c);
    const effects = gumuNpcBoutEffects([{ condition_id: c.id, outcome: 'observed', raw: r }], c);
    assert.equal(effects.choices[0].command_evaluation_cost.mean, 476); assert.equal(effects.choices[0].method_one, null);
    for (const change of [
        x => x.npc_bout.chat_choices[0].owner = x.npc_observation.silver.companion_before.object,
        x => x.npc_bout.chat_choices[0].index = 100,
        x => x.npc_bout.chat_choices[0].result = true,
        x => x.npc_bout.chat_choices[0].busy = 1,
        x => x.npc_bout.chat_choices[0].fighting = 0,
        x => delete x.npc_bout.chat_choices[0].result,
        x => x.npc_bout.chat_choices[0].heartbeat_index = 1,
        x => x.npc_bout.npc_metrics.choices = 0,
        x => { x.npc_bout.chat_choices.push(copy(x.npc_bout.chat_choices[0])); x.npc_bout.npc_metrics.choices = 2; },
    ]) { const x = copy(r); change(x); assert.throws(() => check(x, c)); }
});

test('非command的0/null/1原返回完整分账，command成本不混入方法返回分母', () => {
    const c = choose('lin'), index = gumuNpcCallbacks.lin.findIndex(([entry]) => entry !== 'command');
    assert.ok(index >= 0);
    const rows = [0, null, 1].map((result, sample) => {
        const raw = record(c, sample), choice = raw.npc_bout.chat_choices[0];
        choice.index = index; choice.repr = raw.npc_observation.before.combat_callbacks[index]; choice.result = result;
        check(raw, c);
        return { condition_id: c.id, outcome: 'observed', raw };
    });
    const unchanged = copy(rows), effect = gumuNpcBoutEffects(rows, c), methods = effect.choices[index];
    assert.equal(methods.calls, 3);
    assert.equal(methods.method_zero, 1); assert.equal(methods.method_null, 1); assert.equal(methods.method_one, 1);
    assert.equal(methods.method_zero + methods.method_null + methods.method_one, methods.calls);
    assert.equal(methods.command_evaluation_cost.n, 0);
    assert.equal(effect.choices.reduce((sum, choice) => sum + choice.calls, 0), rows.length);
    assert.deepEqual(rows, unchanged, '统计不得归一化或回写原返回');
    for (const result of [undefined, false, true, -1, 2, '0']) {
        const raw = copy(rows[0].raw); raw.npc_bout.chat_choices[0].result = result;
        assert.throws(() => gumuNpcBoutEffects([{ condition_id: c.id, outcome: 'observed', raw }], c));
    }
    const missing = copy(rows[0].raw); delete missing.npc_bout.chat_choices[0].result;
    assert.throws(() => check(missing, c));

    const commandCase = choose('longnv', 'occupied');
    const commands = [0, 1, 476].map((result, sample) => {
        const raw = record(commandCase, sample), choice = raw.npc_bout.chat_choices[0];
        choice.index = 0; choice.repr = raw.npc_observation.before.combat_callbacks[0]; choice.result = result;
        check(raw, commandCase);
        return { condition_id: commandCase.id, outcome: 'observed', raw };
    });
    const command = gumuNpcBoutEffects(commands, commandCase).choices[0];
    assert.equal(command.entry, 'command'); assert.equal(command.calls, 3);
    assert.equal(command.command_evaluation_cost.n, command.calls);
    assert.equal(command.command_evaluation_cost.mean, 159);
    for (const key of ['method_zero', 'method_null', 'method_one']) assert.equal(command[key], null);
    const invalidCommand = copy(commands[0].raw); invalidCommand.npc_bout.chat_choices[0].result = null;
    assert.throws(() => check(invalidCommand, commandCase));
});

test('攻击/反击/快攻和原回调数组计数相符；空观测、缺计数映射及错先手拒绝', () => {
    const c = choose('yang');
    for (const type of [1, 2]) {
        const r = record(c); r.attacks[0].type = type; r.npc_bout.npc_metrics[type === 1 ? 'riposte' : 'quick'] = 1;
        check(r, c);
    }
    for (const change of [
        r => r.npc_bout.heartbeats = [], r => r.npc_bout.first_actor = 0,
        r => r.npc_bout.npc_metrics = null, r => r.metrics[0] = null,
        r => delete r.npc_bout.npc_metrics.force,
        r => r.attacks = [], r => r.actions = [], r => r.attack_rounds = [],
        r => r.npc_bout.npc_metrics.scans = 3, r => r.npc_bout.busy_seconds.npc = 31,
        r => delete r.npc_observation.after, r => r.elapsed = 2,
    ]) { const r = record(c); change(r); assert.throws(() => check(r, c)); }
});

test('同栈原NPC死亡的pending选择/攻击轮保留尝试与未知，实返null/0/1不混入未知', () => {
    for (const kind of ['choice', 'round']) for (const c of cases) {
        const raw = record(c), call = pendingDeath(raw, c, kind), unchanged = copy(raw);
        check(raw, c);
        const effect = gumuNpcBoutEffects([{ condition_id: c.id, outcome: 'observed', raw }], c);
        if (kind === 'choice') {
            const choice = effect.choices[call.index];
            assert.equal(choice.calls, 1); assert.equal(choice.returns_observed, 0); assert.equal(choice.returns_not_observed, 1);
            if (choice.entry === 'command') {
                assert.equal(choice.command_evaluation_cost.n, 0); assert.equal(choice.command_evaluation_cost.unknown, 1);
                assert.equal(choice.command_evaluation_cost_not_observed, 1);
            } else {
                assert.equal(choice.method_zero + choice.method_null + choice.method_one, 0);
                assert.equal(choice.command_evaluation_cost_not_observed, null);
            }
        } else {
            const rounds = effect.sides.npc.rounds;
            assert.equal(rounds.attempts, 1); assert.equal(rounds.returns_observed, 0); assert.equal(rounds.returns_not_observed, 1);
            assert.equal(rounds.result.n, 0); assert.equal(rounds.result.unknown, 1);
            assert.equal(rounds.after_count.n, 0); assert.equal(rounds.after_count.unknown, 1);
            assert.equal(effect.sides.user.rounds.returns_observed, 1);
        }
        assert.deepEqual(raw, unchanged, '不得为统计回填实际返回或后态');
    }
    const c = choose('li'), raw = record(c), call = pendingDeath(raw, c, 'choice');
    const rows = [0, null, 1].map((result, i) => {
        const r = record(c, i), choice = r.npc_bout.chat_choices[0];
        choice.index = call.index; choice.repr = call.repr; choice.result = result;
        return { condition_id: c.id, outcome: 'observed', raw: r };
    });
    rows.push({ condition_id: c.id, outcome: 'observed', raw });
    const choice = gumuNpcBoutEffects(rows, c).choices[call.index];
    assert.equal(choice.calls, 4); assert.equal(choice.returns_observed, 3); assert.equal(choice.returns_not_observed, 1);
    assert.equal(choice.method_zero, 1); assert.equal(choice.method_null, 1); assert.equal(choice.method_one, 1);
    assert.equal(choice.method_zero + choice.method_null + choice.method_one, choice.returns_observed);
    const commandCase = choose('longnv', 'occupied'), commands = [0, 1, 476].map((result, i) => {
        const r = record(commandCase, i), selected = r.npc_bout.chat_choices[0];
        selected.index = 0; selected.repr = r.npc_observation.before.combat_callbacks[0]; selected.result = result;
        return { condition_id: commandCase.id, outcome: 'observed', raw: r };
    });
    const missing = record(commandCase); pendingDeath(missing, commandCase, 'choice');
    commands.push({ condition_id: commandCase.id, outcome: 'observed', raw: missing });
    const command = gumuNpcBoutEffects(commands, commandCase).choices[0];
    assert.equal(command.calls, 4); assert.equal(command.returns_observed, 3); assert.equal(command.returns_not_observed, 1);
    assert.equal(command.command_evaluation_cost.n, 3); assert.equal(command.command_evaluation_cost.unknown, 1);
    assert.equal(command.command_evaluation_cost_not_observed, 1); assert.equal(command.command_evaluation_cost.mean, 159);
    for (const key of ['method_zero', 'method_null', 'method_one']) assert.equal(command[key], null);
});

test('存活NPC或USER必须实返；无死亡/仅进入入口/错误角色不得借未知放行', () => {
    const c = choose('li');
    for (const chooseCall of [r => r.npc_bout.chat_choices[0], r => r.attack_rounds[0], r => r.attack_rounds[1]]) {
        for (const change of [
            call => delete call.return_observation,
            call => call.return_observation = null,
            call => call.return_observation = 0,
            call => delete call.result,
            call => call.result = 'not_observed',
            call => delete call.terminal_event_index,
            call => call.terminal_event_index = 0,
            call => { call.return_observation = 'not_observed'; call.result = 'not_observed'; call.terminal_event_index = 0; },
        ]) { const r = record(c); change(chooseCall(r)); assert.throws(() => check(r, c)); }
    }
    for (const after of [undefined, null, 'not_observed']) {
        const r = record(c); r.attack_rounds[0].after = after; assert.throws(() => check(r, c));
    }
    const npcDead = record(c); dies(npcDead, c);
    const userRound = npcDead.attack_rounds[1];
    userRound.return_observation = 'not_observed'; userRound.result = userRound.after = 'not_observed';
    userRound.terminal_event_index = 0; npcDead.npc_bout.terminal_events[0].pending_round_index = 1;
    assert.throws(() => check(npcDead, c), /仅同栈销毁/);
    const userDead = record(c); dies(userDead, c, 0);
    Object.assign(userDead.attack_rounds[1], { return_observation: 'not_observed', result: 'not_observed',
        after: 'not_observed', terminal_event_index: 0 });
    userDead.npc_bout.terminal_events[0].pending_round_index = 1;
    assert.throws(() => check(userDead, c), /仅同栈销毁/);
});

test('pending双向索引/同一心跳/精确NPC/前置时间/尸体归属必须完整，未知不是晚死亡的豁免', () => {
    const c = choose('longnv', 'occupied');
    for (const kind of ['choice', 'round']) {
        const base = record(c); pendingDeath(base, c, kind);
        const get = r => kind === 'choice' ? r.npc_bout.chat_choices[0] : r.attack_rounds[0];
        for (const change of [
            r => get(r).actor_object = r.npc_observation.silver.companion_before.object,
            r => get(r).actor = 0,
            r => get(r).heartbeat_index = 1,
            r => delete get(r).heartbeat_index,
            r => delete get(r).terminal_event_index,
            r => get(r).terminal_event_index = -1,
            r => get(r).terminal_event_index = 1,
            r => get(r).elapsed = 1.2,
            r => get(r).result = null,
            r => get(r).result = 0,
            r => delete get(r).result,
            r => r.npc_bout.terminal_events = [],
            r => r.npc_bout.terminal_events[0].kind = 'unconscious',
            r => r.npc_bout.terminal_events[0].actor_object = r.npc_observation.silver.companion_before.object,
            r => r.npc_bout.terminal_events[0].heartbeat_index = 1,
            r => delete r.npc_bout.terminal_events[0].heartbeat_index,
            r => r.npc_bout.terminal_events[0]['pending_' + kind + '_index'] = -1,
            r => r.npc_bout.terminal_events[0]['pending_' + kind + '_index'] = 1,
            r => delete r.npc_bout.terminal_events[0]['pending_' + kind + '_index'],
            r => r.npc_bout.terminal_events[0]['pending_' + (kind === 'choice' ? 'round' : 'choice') + '_index'] = 1,
            r => r.npc_observation.after = copy(r.npc_observation.before),
            r => delete r.npc_observation.after,
            r => r.npc_bout.corpse_returns = [],
            r => r.npc_bout.corpse_returns[0].victim_object = r.npc_observation.silver.companion_before.object,
            r => r.npc_observation.cleanup.objects[0].existed_before_cleanup = 1,
        ]) { const r = copy(base); change(r); assert.throws(() => check(r, c)); }
        if (kind === 'round') for (const value of [null, 0, undefined]) {
            const r = copy(base); r.attack_rounds[0].after = value; assert.throws(() => check(r, c));
        }
        for (const key of kind === 'round' ? ['before'] : ['busy', 'fighting', 'owner', 'repr']) {
            const r = copy(base); delete get(r)[key]; assert.throws(() => check(r, c), 'pending不能掩盖缺少原前置字段：' + key);
        }
        const earlier = copy(base);
        earlier.npc_bout.heartbeats.push({ ...copy(earlier.npc_bout.heartbeats[0]), elapsed: 1 });
        earlier.npc_bout.npc_metrics.heartbeats++;
        earlier.npc_bout.terminal_events[0].heartbeat_index = 2;
        assert.throws(() => check(earlier, c), /稍后心跳/);
    }
});

test('实际passive回调只核同源身份/读数与计数；单次净差不冒称整场毛费用', () => {
    const c = choose('yang'), r = record(c), before = copy(r.npc_observation.before), after = copy(before);
    after.properties.neili -= 120; r.npc_observation.after.properties.neili -= 100;
    r.passives.push({ actor: -1, actor_object: before.object, target: 0, target_object: r.before[0].object,
        route: 'force', skill: 'surge-force', factor: 120, incoming: 60, result: 8,
        before: [before, copy(r.before[0])], after: [after, copy(r.after[0])] });
    r.npc_bout.npc_metrics.force = 1; check(r, c);
    const effect = gumuNpcBoutEffects([{ condition_id: c.id, outcome: 'observed', raw: r }], c);
    assert.equal(effect.passives[0].immediate_neili_net_loss.mean, 120);
    assert.equal(effect.npc_endpoint_net_loss.neili.mean, 100); assert.equal(effect.npc_gross_resources, 'not_observed');
    for (const change of [
        x => x.passives[0].before[0].object = '/kungfu/class/gumu/yang#666',
        x => delete x.passives[0].after[0].properties.neili,
        x => x.passives[0].skill = 'foreign-force',
        x => x.npc_bout.npc_metrics.force = 0,
        x => x.npc_bout.npc_gross_resources = { neili_cost: 100 },
    ]) { const x = copy(r); change(x); assert.throws(() => check(x, c)); }
});

test('李可原昏迷；林/龙/杨必须让原die完成，不把USER昏迷规则套在NPC', () => {
    const li = choose('li'), r = record(li); r.elapsed = 1.5;
    r.npc_bout.terminal = 'unconscious'; r.npc_bout.winner = 'user'; r.npc_observation.after.living = 0;
    r.npc_bout.terminal_events.push({ actor: -1, actor_object: r.npc_observation.before.object,
        kind: 'unconscious', elapsed: 1.2, state_before: copy(r.npc_observation.before),
        heartbeat_index: 0, pending_choice_index: -1, pending_round_index: -1 });
    check(r, li);
    for (const id of ['lin', 'longnv', 'yang']) {
        const c = choose(id), x = record(c); x.elapsed = 1.5;
        x.npc_bout.terminal = 'unconscious'; x.npc_bout.winner = 'user'; x.npc_observation.after.living = 0;
        x.npc_bout.terminal_events.push({ actor: -1, actor_object: x.npc_observation.before.object,
            kind: 'unconscious', elapsed: 1.2, state_before: copy(x.npc_observation.before),
            heartbeat_index: 0, pending_choice_index: -1, pending_round_index: -1 });
        assert.throws(() => check(x, c), /直接die/);
    }
});

test('原NPC死亡后保留前态与不可观察终态；原尸体返回/清理必须完整', () => {
    for (const c of cases) {
        const r = record(c); dies(r, c); check(r, c);
        const effect = gumuNpcBoutEffects([{ condition_id: c.id, outcome: 'observed', raw: r }], c);
        assert.equal(effect.npc_endpoint_net_loss.qi.n, 0); assert.equal(effect.npc_endpoint_net_loss.qi.unknown, 1);
        assert.equal(effect.npc_preterminal_net_loss.qi.mean, c.parameters.npc.original.props.max_qi + 1);
    }
    const c = choose('lin'), r = record(c); dies(r, c, -1, false); check(r, c);
    for (const change of [
        x => x.npc_observation.after = copy(x.npc_observation.before),
        x => delete x.npc_bout.terminal_events[0].state_before.properties.qi,
        x => x.npc_bout.terminal_events[0].actor_object = '/kungfu/class/gumu/lin#666',
        x => x.npc_bout.corpse_returns = [],
        x => x.npc_bout.winner = 'npc',
        x => x.npc_observation.cleanup.objects[0].existed_before_cleanup = 1,
    ]) { const x = copy(r); change(x); assert.throws(() => check(x, c)); }
});

test('USER失活仍是真实USER终态；USER原毛账与NPC净差分开', () => {
    const c = choose('yang'), r = record(c); dies(r, c, 0); check(r, c);
    const other = record(c); other.npc_observation.after.properties.neili -= 12;
    other.after[0].qi -= 2; other.metrics[0].qi_cost = 20; other.metrics[0].qi_recovery = 18;
    check(other, c);
    const effect = gumuNpcBoutEffects([{ condition_id: c.id, outcome: 'observed', raw: other }], c);
    assert.equal(effect.npc_endpoint_net_loss.neili.mean, 12);
    assert.equal(effect.user_net_loss.qi.mean, 2); assert.equal(effect.user_gross.qi.cost.mean, 20);
    other.metrics[0].qi_cost = 2; assert.throws(() => check(other, c));
});

test('银索占有者/旁观USER不可改变或带入战斗；清理不得漏对象、假清理或抹记录', () => {
    const c = choose('longnv', 'occupied');
    for (const change of [
        r => r.npc_observation.silver.after_environment = r.npc_observation.before.object,
        r => r.npc_observation.silver.companion_after.properties.neili--,
        r => r.npc_observation.silver.companion_heartbeat = 1,
        r => r.npc_observation.silver.companion_room = r.npc_observation.room,
        r => r.after[1].qi--,
        r => r.metrics[1].heartbeats = 1,
        r => r.npc_observation.cleanup.objects = [],
        r => r.npc_observation.cleanup.objects.push({ object: '/outside#1', existed_before_cleanup: 1, destroyed: 1 }),
        r => r.npc_observation.cleanup.remaining_callbacks = [{ owner: r.npc_bout.npc_object }],
    ]) { const r = record(c); change(r); assert.throws(() => check(r, c)); }
    const free = choose('longnv');
    for (const key of ['companion_before', 'companion_after']) {
        const r = record(free); delete r.npc_observation.silver[key]; assert.throws(() => check(r, free));
    }
});

test('统计只读冻结condition，原返回/净值/毛账/终态未知分开，不套通用USER伤害表', () => {
    const c = choose('li'), r = record(c), row = { condition_id: c.id, outcome: 'observed', raw: r };
    const effect = gumuNpcBoutEffects([row], c);
    assert.equal(effect.observed, 1); assert.equal(effect.undecided, 1); assert.equal(effect.combination, c.parameters.combination);
    assert.equal(effect.sides.npc.attacks, 1); assert.equal(effect.sides.user.attacks, 1);
    assert.equal(effect.npc_preterminal_net_loss.qi.unknown, 1);
    assert.equal(resourceNames.length, Object.keys(effect.npc_endpoint_net_loss).length);
    assert.throws(() => gumuNpcBoutEffects([row], choose('lin')));
    assert.throws(() => gumuNpcBoutEffects([row], undefined));
    assert.throws(() => gumuNpcBoutEffects([{ ...row, outcome: 'refused' }], c));
    assert.equal(gumuNpcBoutEntries([{ ...c, parameters: { ...c.parameters, collection_group: 'other' } }]).length, 0);
    assert.equal(gumuNpcBoutGroup, 'gumu-npc-bout');
});
