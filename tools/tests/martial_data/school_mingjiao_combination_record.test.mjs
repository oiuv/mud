// Hand-written structural traces, not driver samples or empirical distributions.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { scanSource, sha256 } from './inventory.mjs';
import { buildCatalog } from './catalog.mjs';
import { mingjiaoCombinationConditions as make, mingjiaoCombinationSourcePaths as paths } from './school_mingjiao_combination_cases.mjs';
import { createMingjiaoCombinationRecordValidator } from './school_mingjiao_combination_record.mjs';

// Report tests extract only this explicitly authored fixture function, never tests/imports.
export function syntheticMingjiaoCombinationFixtures() {
    const copy = x => structuredClone(x), read = p => fs.readFileSync(process.env.MUD_COMBINATION_SOURCE_ROOT
        ? process.env.MUD_COMBINATION_SOURCE_ROOT + '/' + p : new URL('../../../' + p, import.meta.url));
    const files = paths.filter(p => /^(?:kungfu\/(?:skill|class)\/|include\/weapon\.h$)/.test(p)).map(path => ({
        path, sha256: sha256(read(path)), scope: path.startsWith('kungfu/skill/') ? 'skill'
            : path.startsWith('kungfu/class/') ? 'class' : 'header_dependency', ...scanSource(read(path).toString()),
    }));
    const catalog = buildCatalog({ files, source_fingerprint: 'synthetic-test-scoped-catalog' }, read('data/e2c_dict.o').toString());
    const sourceContext = { catalog, readSource: read }, formal = make(catalog, read), smoke = make(catalog, read, { smoke: true });
    const checks = { formal: createMingjiaoCombinationRecordValidator(catalog, read),
        smoke: createMingjiaoCombinationRecordValidator(catalog, read, { smoke: true }) };
    const state = (cfg, side) => ({ ...copy(cfg.properties), object: '/tests/actor#' + (100 + side),
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0, busy: null,
        conditions: null, skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: {}, preparation_order: [],
        temp: {}, cultivation: copy(cfg.properties), effective_skills: { force: 300 },
        effective_str: cfg.properties.str + Math.trunc(Math.max(0,
            ...['unarmed', 'cuff', 'finger', 'hand', 'claw', 'strike'].map(k => cfg.skills[k] ?? 0)) / 10),
        effective_dex: cfg.properties.dex + Math.trunc(cfg.skills.dodge / 10),
        weapon: cfg.equipment?.type ?? 'none', weapon_details: cfg.equipment ? { object: '/tests/sword#' + (300 + side),
            program: '/tests/sword', skill_type: 'sword', damage: 50, consistence: 100 } : {},
    });
    const npcState = cfg => {
        const o = cfg.original, object = cfg.path + '#900', mappings = copy(o.mappings);
        const effective = { ...mappings }; if (cfg.id === 'zhangwuji') { effective.dodge = null; effective.unarmed = null; }
        const wield = o.wield, inventory = o.gear.map((program, i) => ({ object: program + '#' + (901 + i),
            program, clone: 1, environment: object, equipped: program === wield ? 'wielded' : 'worn',
            skill_type: program === wield ? cfg.id === 'daijisi' ? 'staff' : 'sword' : null,
            consistence: 100, weapon_prop: program === wield ? { damage: 25 } : {}, armor_prop: program === wield ? {} : { armor: 1 } }));
        return { object, program: cfg.path, clone: 1, name: o.name, userp: 0, playerp: 0,
            interactive: 0, wizardp: 0, living: 1, ghost: 0, busy: null, conditions: null,
            properties: { ...copy(o.props), qi: o.props.max_qi, eff_qi: o.props.max_qi,
                jing: o.props.max_jing, eff_jing: o.props.max_jing, neili: o.props.neili ?? 0,
                chat_chance_combat: o.props.chat_chance_combat ?? null,
                ...(cfg.id === 'xiaozhao' ? { combat_exp: 54321 } : {}) },
            skills: copy(o.skills), mappings, effective_mappings: effective,
            effective_skills: Object.fromEntries([...new Set([...Object.keys(o.skills), ...Object.keys(mappings)])]
                .map(k => [k, Math.trunc((o.skills[k] ?? 0) / 2) + (typeof effective[k] === 'string' ? o.skills[effective[k]] : 0)])),
            preparations: copy(o.preparations), preparation_order: Object.keys(o.preparations), temp: {}, learned: {},
            inventory, weapon: wield ? cfg.id === 'daijisi' ? 'staff' : 'sword' : 'none',
            weapon_object: inventory.find(i => i.program === wield)?.object ?? '', secondary_weapon_object: '',
            combat_callbacks: o.callbacks.map((x, i) => x[0] === 'command' ? '<code>() ' + i : `${x[0]}(${x.slice(1).map(a => JSON.stringify(a)).join(', ')})`),
            combat_callback_owners: o.callbacks.map(() => object), callouts: [] };
    };
    const trace = (c, options = {}) => {
        const p = c.parameters, raw = { kind: 'sample', condition_id: c.id, method: c.method, index: options.index ?? 0,
            outcome: p.expected, reason: p.expected === 'refused' ? '原准备命令均未受理' : '', elapsed: 0.02,
            before: [state(p.actor, 0), state(p.target, 1)], metrics: [{}, {}],
            interfaces: [], launches: [], prepare_steps: [], attacks: [], callbacks: [], terminals: [], dropped: [],
            npc_direct: [], attack_rounds: [], passives: [], actions: [] };
        raw.immediate = copy(raw.before); raw.after = copy(raw.before);
        if (c.method === 'interface') raw.interfaces = [{ ...copy(p.interface), result: p.combine_result }];
        else if (c.method !== 'bout') {
            let s = copy(raw.before[0]);
            for (const e of p.prepare_commands) {
                const next = copy(s); next.preparations = copy(e.preparations); next.preparation_order = Object.keys(e.preparations);
                raw.prepare_steps.push({ action: e.action, accepted: e.accepted ? 313 : 0,
                    reason: e.accepted ? '' : '原准备被拒绝', before: copy(s), after: copy(next) }); s = next;
            }
            raw.immediate[0] = s;
            if (c.method === 'round') {
                const count = options.attacks ?? 1;
                for (let i = 0; i < count; i++) {
                    const usage = s.preparation_order[i], skill = p.actor.mappings[usage];
                    raw.attacks.push({ actor: 0, target: 1, type: 0, result: -1, damage: 0,
                        attack_usage: usage, attack_skill: skill, action_flag: i });
                }
                raw.metrics[0].dodge = count; raw.immediate[0].temp.guarding = Number(count === 0);
                if (count === 2) raw.immediate[0].temp.action_flag = 0;
            }
            raw.after = copy(raw.immediate);
        } else {
            raw.elapsed = p.observe_seconds + 0.1;
            raw.skill_load_contexts = ['shenghuo-ling', 'qishang-quan'].map(skill => ({ skill,
                actor: raw.before[0].object, already_loaded: 0, skills: copy(raw.before[0].skills),
                command: 'test_interface', function: 'valid_enable',
                argument: skill === 'shenghuo-ling' ? 'sword' : 'cuff', result: 1 }));
            const initial = npcState(p.npc), npcObject = initial.object, userObject = raw.before[0].object;
            const h = (actor, elapsed) => ({ actor, actor_object: actor === -1 ? npcObject : userObject, elapsed, busy: null });
            const first = raw.index % 2 ? 0 : -1;
            const beats = [h(first, 1), h(first === -1 ? 0 : -1, 2)];
            const npcBeat = beats.findIndex(x => x.actor === -1);
            const metrics = Object.fromEntries(['heartbeats', 'scans', 'chats', 'choices', 'hit', 'dodge', 'parry',
                'quick', 'riposte', 'direct', 'rounds', 'force', 'martial'].map(k => [k, 0]));
            metrics.heartbeats = 1; metrics.dodge = 1; metrics.rounds = 1; raw.metrics[0].heartbeats = 1;
            raw.attacks = [{ actor: -1, actor_object: npcObject, target: 0, target_object: userObject,
                type: 0, result: -1, damage: 0 }];
            raw.actions = [{ actor: -1, actor_object: npcObject, target: 0, target_object: userObject, action: { action: '原普通动作' } }];
            raw.attack_rounds = [{ actor: -1, actor_object: npcObject, elapsed: beats[npcBeat].elapsed + 0.01,
                heartbeat_index: npcBeat, before: 0, after: 1, result: 1, return_observation: 'observed', terminal_event_index: -1 }];
            raw.npc_bout = { npc_object: npcObject, user_object: userObject, bystander_object: raw.before[1].object,
                bystander_room: '/tests/outside', npc_gross_resources: 'not_observed', first_actor: first,
                duration_limit_seconds: p.observe_seconds, terminal: 'time_limit', winner: 'none', heartbeats: beats,
                chat_choices: [], terminal_events: [], corpse_returns: [], corpses: [], npc_metrics: metrics,
                busy_seconds: { npc: 0, user: 0 } };
            raw.npc_observation = { before: initial, after: copy(initial), target_object: userObject, room: '/tests/arena',
                preparation: { entry_player: userObject, returned_player: userObject, initializer_actor: 'not_observed',
                    npc_heartbeat_before: 1, npc_heartbeat_paused: 0, blueprint_heartbeat: 0, constructor_callbacks: [],
                    created_npcs: [npcObject], loaded_before: [], loaded_after: [],
                    skill_load_contexts: copy(raw.skill_load_contexts) }, destroyed: 1,
                cleanup: { enemies_removed: 1, remaining_callbacks: [], objects: [npcObject, ...initial.inventory.map(i => i.object)]
                    .map(object => ({ object, existed_before_cleanup: 1, destroyed: 1 })) } };
            if (options.fanyaoChoice) {
                assert.equal(p.npc.id, 'fanyao');
                const before = copy(initial), after = copy(initial); after.preparations = { finger: 'nianhua-zhi' }; after.preparation_order = ['finger'];
                raw.npc_bout.chat_choices = [{ actor: -1, actor_object: npcObject, target: 0, target_object: userObject,
                    elapsed: beats[npcBeat].elapsed + 0.02, heartbeat_index: npcBeat, busy: null, fighting: 1,
                    index: 0, owner: npcObject, repr: initial.combat_callbacks[0], return_observation: 'observed',
                    terminal_event_index: -1, result: null, before_state: before, after_state: after }];
                Object.assign(metrics, { scans: 1, chats: 1, choices: 1 }); raw.npc_observation.after = copy(after);
            }
            if (options.death) {
                raw.npc_bout.terminal = 'death'; raw.npc_bout.winner = 'user'; raw.elapsed = 2.1;
                const event = { actor: -1, actor_object: npcObject, elapsed: 2.01, kind: 'death',
                    state_before: copy(initial), heartbeat_index: 1, pending_choice_index: -1, pending_round_index: -1 };
                event.state_before.properties.qi = -1;
                raw.npc_bout.terminal_events = [event]; raw.npc_observation.after = null;
                raw.npc_bout.corpse_returns = [{ victim_object: npcObject, killer_object: userObject, result: null }];
                raw.npc_observation.cleanup.objects[0].existed_before_cleanup = 0;
                if (options.pendingRound) {
                    const round = raw.attack_rounds[0]; round.heartbeat_index = 1;
                    round.elapsed = 2; round.return_observation = 'not_observed'; round.result = 'not_observed';
                    round.after = 'not_observed'; round.terminal_event_index = 0; event.pending_round_index = 0;
                }
            }
        }
        return raw;
    };
    return { formal, smoke, checks, trace, sourceContext, copy };
}
// END_SYNTHETIC_FIXTURES
const fixture = syntheticMingjiaoCombinationFixtures();
const { formal, smoke, checks, trace, copy } = fixture;
const bad = (raw, c, edit) => { const r = copy(raw); edit(r); assert.throws(() => checks[c.parameters.run_mode](r, c)); };

test('all 37 authored structural conditions accept complete mode-bound shapes; no native claim', () => {
    for (const plans of [formal, smoke]) for (const c of plans) {
        const r = trace(c); assert.equal(checks[c.parameters.run_mode](r, c).matched, true, c.id);
        assert.throws(() => checks[c.parameters.run_mode === 'formal' ? 'smoke' : 'formal'](r, c));
    }
});
test('prepare cost is an integer, each rejection preserves earlier success and real keys', () => {
    const c = formal.find(c => c.id.endsWith('pili-quan-feihua-zhang-sequential')), r = trace(c);
    const v = checks.formal(r, c); assert.deepEqual(v.commands.map(x => x.command_cost), [313, 0]);
    assert.deepEqual(v.commands.map(x => x.accepted), [1, 0]);
    bad(r, c, x => x.prepare_steps[0].accepted = true);
    bad(r, c, x => x.prepare_steps[1].accepted = 313);
    bad(r, c, x => x.prepare_steps[1].after.preparations = {});
    bad(r, c, x => x.prepare_steps[1].after.preparation_order = []);
    bad(r, c, x => x.prepare_steps[1].before.neili--);
});
test('original round admits 0/1/2 primary attacks without forcing the random second branch', () => {
    const c = formal.find(c => c.method === 'round' && c.id.endsWith('-pair'));
    for (const attacks of [0, 1, 2]) assert.equal(checks.formal(trace(c, { attacks }), c).attacks.length, attacks);
    const r = trace(c, { attacks: 2 }); bad(r, c, x => x.attacks[1].actor = 1);
    bad(r, c, x => x.attacks[1].attack_usage = x.attacks[0].attack_usage);
    bad(r, c, x => x.attacks[1].action_flag = 0);
    bad(r, c, x => x.metrics[0].dodge = 1);
    bad(r, c, x => x.metrics[0].neili_cost = 1);
    bad(r, c, x => { x.after[1].qi -= 10; x.immediate[1].qi -= 10; x.metrics[1].qi_cost = 10; });
    const hit = trace(c); hit.attacks[0].result = 0; hit.attacks[0].damage = 10;
    hit.metrics[0] = { hit: 1 }; hit.metrics[1] = { qi_cost: 10 };
    hit.after[1].qi -= 10; hit.immediate[1].qi -= 10;
    assert.equal(checks.formal(hit, c).resources[1].qi.decrease, 10);
});
test('NPC original constructor, effective maps and original random range cannot be replaced', () => {
    for (const c of smoke.filter(c => c.method === 'bout')) {
        const r = trace(c);
        bad(r, c, x => x.npc_observation.before.properties.jiali++);
        bad(r, c, x => x.npc_observation.before.skills.force++);
        bad(r, c, x => delete x.npc_observation.before.effective_mappings);
        bad(r, c, x => x.npc_observation.before.preparation_order = ['invented']);
        bad(r, c, x => x.npc_observation.cleanup.remaining_callbacks = [{ owner: 'external' }]);
    }
    const f = smoke.find(c => c.parameters.npc?.id === 'fanyao'), r = trace(f);
    bad(r, f, x => x.npc_observation.before.mappings.force = 'shenghuo-shengong');
    bad(r, f, x => x.npc_observation.before.preparations = { finger: 'nianhua-zhi', strike: 'sanhua-zhang' });
    const z = smoke.find(c => c.parameters.npc?.id === 'zhangwuji');
    bad(trace(z), z, x => x.npc_observation.before.effective_mappings.dodge = 'qiankun-danuoyi');
    const small = smoke.find(c => c.parameters.npc?.id === 'xiaozhao');
    for (const combat_exp of [49999, 60000]) bad(trace(small), small, x => x.npc_observation.before.properties.combat_exp = combat_exp);
    const missingNeili = trace(small);
    missingNeili.npc_observation.before.properties.neili = null;
    missingNeili.npc_observation.after.properties.neili = null;
    assert.equal(checks.smoke(missingNeili, small).npc.endpoint_net_loss.neili, null);
    bad(trace(small), small, x => x.npc_observation.before.properties.neili = 500);
    bad(r, f, x => x.npc_observation.before.properties.neili = null);
});
test('Fanyao natural prepare closure is observed at exact identity/index before and after, not command success', () => {
    const c = smoke.find(c => c.parameters.npc?.id === 'fanyao'), r = trace(c, { fanyaoChoice: true });
    assert.equal(checks.smoke(r, c).npc.choices.length, 1);
    bad(r, c, x => x.npc_bout.chat_choices[0].owner = '/external#1');
    bad(r, c, x => delete x.npc_bout.chat_choices[0].after_state);
    bad(r, c, x => x.npc_bout.chat_choices[0].after_state.preparations = {});
    bad(r, c, x => x.npc_bout.chat_choices[0].result = 313);
    bad(r, c, x => x.npc_observation.after.preparations = {});
    const untouched = trace(c);
    bad(untouched, c, x => { x.npc_observation.after.preparations = { finger: 'nianhua-zhi' };
        x.npc_observation.after.preparation_order = ['finger']; });
});

test('review witness: post NPC force cannot claim 99999 without actual apply', () => {
    const c = smoke.find(c => c.parameters.npc?.id === 'fanyao'), r = trace(c);
    assert.equal(r.npc_observation.after.skills.force, 340);
    assert.equal(r.npc_observation.after.effective_skills.force, 170);
    bad(r, c, x => x.npc_observation.after.effective_skills.force = 99999);
    const death = trace(c, { index: 1, death: true, pendingRound: true });
    bad(death, c, x => x.npc_bout.terminal_events[0].state_before.effective_skills.force = 99999);
});

test('review witness: choice and post cannot discard the original valid finger mapping', () => {
    const c = smoke.find(c => c.parameters.npc?.id === 'fanyao'), r = trace(c, { fanyaoChoice: true });
    for (const s of [r.npc_bout.chat_choices[0].before_state, r.npc_bout.chat_choices[0].after_state,
        r.npc_observation.after]) {
        assert.equal(s.skills.finger, 340); assert.equal(s.skills['nianhua-zhi'], 340);
        assert.equal(s.effective_mappings.finger, 'nianhua-zhi'); assert.equal(s.effective_skills.finger, 510);
    }
    for (const select of [x => x.npc_bout.chat_choices[0].before_state,
        x => x.npc_bout.chat_choices[0].after_state, x => x.npc_observation.after])
        bad(r, c, x => { const s = select(x); s.effective_mappings.finger = null; s.effective_skills.finger = 170; });
});

test('each choice, post and terminal accepts its own actual temporary apply without freezing the NPC', () => {
    const c = smoke.find(c => c.parameters.npc?.id === 'fanyao'), r = trace(c, { fanyaoChoice: true });
    const states = [r.npc_bout.chat_choices[0].before_state, r.npc_bout.chat_choices[0].after_state,
        r.npc_observation.after];
    for (const [i, s] of states.entries()) {
        s.temp.apply = { force: 20 + i, finger: 15 + i };
        s.effective_skills.force = 190 + i; s.effective_skills.finger = 525 + i;
    }
    assert.equal(checks.smoke(r, c).npc.choices.length, 1);
    bad(r, c, x => x.npc_bout.chat_choices[0].after_state.effective_skills.finger++);
    const death = trace(c, { index: 1, death: true, pendingRound: true });
    const terminal = death.npc_bout.terminal_events[0].state_before;
    terminal.temp.apply = { force: -20 }; terminal.effective_skills.force = 150;
    assert.equal(checks.smoke(death, c).npc.terminal, 'death');
});
test('original same-stack death pending return stays unknown, never fake result or endpoint', () => {
    const c = smoke.find(c => c.parameters.npc?.id === 'fanyao');
    const r = trace(c, { index: 1, death: true, pendingRound: true });
    const v = checks.smoke(r, c); assert.equal(v.npc.endpoint_net_loss.qi, null);
    assert.equal(v.npc.preterminal_net_loss.qi, 6501); assert.equal(v.npc.npc_gross_resources, 'not_observed');
    bad(r, c, x => x.attack_rounds[0].result = 0);
    bad(r, c, x => x.npc_bout.terminal_events[0].pending_round_index = -1);
    bad(r, c, x => x.npc_observation.after = copy(x.npc_observation.before));
    bad(r, c, x => x.npc_bout.corpse_returns = []);
    bad(r, c, x => x.npc_bout.terminal_events[0].state_before.properties.qi = 6500);
});
test('missing, duplicate and foreign evidence is rejected; errors remain explicit incomplete observations', () => {
    const c = smoke.find(c => c.method === 'bout'), r = trace(c);
    for (const k of ['npc_observation', 'npc_bout', 'attacks', 'actions']) bad(r, c, x => delete x[k]);
    bad(r, c, x => x.npc_bout.first_actor = 0);
    bad(r, c, x => x.npc_bout.npc_gross_resources = 0);
    bad(r, c, x => x.npc_bout.heartbeats[0].actor_object = '/external#7');
    bad(r, c, x => x.npc_observation.preparation.initializer_actor = r.before[0].object);
    const error = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: 0,
        outcome: 'error', reason: 'explicit observer failure' };
    assert.equal(checks.smoke(error, c), null); assert.throws(() => checks.smoke({ ...error, reason: '' }, c));
});
