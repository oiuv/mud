import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { emeiNpcBoutConditions, emeiNpcBoutSources, validateEmeiNpcBoutRecord, zhouPath, zhouReviewed } from './school_emei_npc_bout_cases.mjs';
import { npcEntries, zhouCallbacks } from './school_emei_npc_cases.mjs';
import { validateQualificationSources } from './execution.mjs';
import { emeiNpcBoutReport, emeiNpcBoutMarkdown } from './school_emei_npc_bout_report.mjs';
import { summarizeSamples, statisticsMarkdown } from './statistics.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const [c] = emeiNpcBoutConditions(catalog, read);

test('原周芷若一个条件20场；独立两场烟雾，不轮流执行八闭包', () => {
    assert.equal(c.samples, 20); assert.equal(c.parameters.observe_seconds, 30);
    const [smoke] = emeiNpcBoutConditions(catalog, read, { smoke: true });
    assert.equal(smoke.samples, 2); assert.equal(smoke.parameters.observe_seconds, 3);
    assert.equal(c.parameters.npc.callback_index, -1); assert.equal(c.parameters.npc.path, '/kungfu/class/emei/zhou');
    assert.equal(c.parameters.npc.original.skills.unarmed, undefined);
    assert.equal(c.parameters.npc.original.mappings.parry, 'yinlong-bian');
    assert.deepEqual(c.parameters.npc.original.preparations, { strike: 'cuixin-zhang', claw: 'jiuyin-baiguzhao' });
    assert.deepEqual(c.parameters.actor.mappings, {}); assert.equal(c.parameters.actor.properties.jiali, 0);
    assert.equal(sha256(read(zhouPath)), zhouReviewed); assert.equal(npcEntries([c]).length, 1);
    for (const path of emeiNpcBoutSources) assert.equal(typeof read(path), 'string');
});
test('执行前绑定原工厂和来源，拒绝增加兵器/改变随机策略/任意闭包', () => {
    const files = Object.fromEntries(c.parameters.source_evidence.map(e => [e.path, e.sha256]));
    const context = { catalog, readSource: read };
    validateQualificationSources([c], files, context);
    for (const mutate of [p => { p.npc.callback_index = 0; }, p => { p.npc.path = '/kungfu/class/emei/miejue'; },
        p => { p.npc.original.skills.unarmed = 260; }, p => { p.strategy = 'round_robin'; },
        p => { p.npc.original.equipment = 'sword'; }, p => { p.actor.properties.jiali = 50; }]) {
        const wrong = structuredClone(c); mutate(wrong.parameters);
        assert.throws(() => validateQualificationSources([wrong], files, context));
    }
});

// Synthetic validator fixtures never count as native samples.
function record(index = 0) {
    const cfg = c.parameters.npc.original, object = '/kungfu/class/emei/zhou#100';
    const before = { object, program: c.parameters.npc.path, clone: 1, userp: 0, playerp: null,
        interactive: 0, wizardp: 0, living: 1, ghost: null, conditions: null, busy: null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations),
        properties: { ...cfg.props, qi: 5000, eff_qi: 5000, jing: 3000, eff_jing: 3000, neili: 6000 },
        learned: {}, temp: { armor: { cloth: '/d/items/equip/danyan_sha#101' }, apply: { armor: 3 } },
        effective_mappings: structuredClone(cfg.mappings),
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.floor(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)])),
        preparation_order: ['strike', 'claw'], effective_str: 48, effective_dex: 50,
        combat_callbacks: zhouCallbacks.map((arg, i) => `(: ${i < 5 ? 'perform_action' : 'exert_function'}, "${arg}" :)`),
        combat_callback_owners: zhouCallbacks.map(() => object), callouts: [], weapon: 'none', weapon_object: '', secondary_weapon_object: '',
        inventory: [{ program: '/d/items/equip/danyan_sha', object: '/d/items/equip/danyan_sha#101', clone: 1, environment: object,
            equipped: 'worn', consistence: 100, armor_prop: { armor: 3 }, weapon_prop: {} }] };
    const user = i => ({ object: '/tests/actor#' + (200 + i), ...c.parameters.actor.properties,
        skills: structuredClone(c.parameters.actor.skills), mappings: {}, preparations: {},
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, weapon: 'sword', weapon_details: { object: '/tests/sword#' + i } });
    const users = [user(0), user(1)], raw = { kind: 'sample', method: 'bout', condition_id: c.id, index,
        outcome: 'observed', elapsed: 30, before: users, after: structuredClone(users),
        metrics: [{ heartbeats: 1 }, {}], attacks: [], actions: [], npc_direct: [], attack_rounds: [], passives: [] };
    raw.npc_observation = { before, after: structuredClone(before), target_object: users[0].object, room: '/tests/runner', destroyed: 1,
        preparation: { entry_player: users[0].object, returned_player: users[0].object, initializer_actor: 'not_observed', npc_heartbeat_paused: 0,
            npc_heartbeat_before: 1, loaded_before: [], loaded_after: [],
            blueprint_heartbeat: 0, constructor_callbacks: [], created_npcs: [object] },
        cleanup: { enemies_removed: 1, objects: [object, before.inventory[0].object].map(object => ({ object, destroyed: 1, existed_before_cleanup: 1 })), remaining_callbacks: [] } };
    raw.npc_bout = { npc_object: object, user_object: users[0].object, bystander_object: users[1].object, bystander_room: '/tests/bystander',
        npc_gross_resources: 'not_observed', duration_limit_seconds: 30, first_actor: index % 2 ? 0 : -1, terminal: 'time_limit', winner: 'none',
        terminal_events: [], corpse_returns: [], corpses: [], chat_choices: [], busy_seconds: { npc: 0, user: 0 },
        npc_metrics: { heartbeats: 1, scans: 1, chats: 0, choices: 0, dodge: 1, hit: 0, parry: 0, quick: 0, riposte: 0, direct: 0, rounds: 0, force: 0, martial: 0 },
        heartbeats: (index % 2 ? [0, -1] : [-1, 0]).map((actor, i) => ({ actor, actor_object: actor === -1 ? object : users[0].object, elapsed: 1 + i / 2, busy: 0 })) };
    raw.attacks = [{ actor: -1, actor_object: object, target: 0, target_object: users[0].object, type: 0, result: -1, damage: 0 }];
    raw.actions = [{ ...raw.attacks[0], action: { action: '$N测试原动作' } }];
    return raw;
}
test('两种首心跳实际身份均可验收；错组/旁观参战/净差冒费用/无交锋拒绝', () => {
    validateEmeiNpcBoutRecord(record(0), c); validateEmeiNpcBoutRecord(record(1), c);
    for (const mutate of [r => { r.outcome = 'error'; }, r => { r.npc_bout.npc_gross_resources = 0; },
        r => { r.npc_bout.first_actor = 0; }, r => { r.attacks[0].actor_object = '/tests/fake#1'; },
        r => { r.attacks[0].actor = 1; }, r => { r.attacks = []; }, r => { r.npc_bout.heartbeats = []; },
        r => { r.after[1].qi--; }, r => { r.after[0].qi--; }, r => { r.npc_observation.before.skills.unarmed = 260; },
        r => { r.npc_observation.before.weapon = 'whip'; }, r => { r.npc_observation.cleanup.objects.pop(); },
        r => { r.npc_observation.destroyed = 0; }, r => { r.npc_observation.after = null; }]) {
        const r = record(); mutate(r); assert.throws(() => validateEmeiNpcBoutRecord(r, c));
    }
});
test('自然选中原错误入口拒绝保留，但不能伪造成功、跳过返回或失去状态', () => {
    const r = record(), b = r.npc_bout, n = r.npc_observation;
    Object.assign(b.npc_metrics, { chats: 1, choices: 1 });
    b.chat_choices.push({ ...r.attacks[0], index: 1, heartbeat_index: 0, elapsed: 1.1,
        owner: n.before.object, repr: n.before.combat_callbacks[1], busy: null, fighting: 1,
        return_observation: 'observed', terminal_event_index: -1, result: 0,
        before_state: structuredClone(n.before), after_state: structuredClone(n.before) });
    validateEmeiNpcBoutRecord(r, c);
    for (const mutate of [e => { e.result = 1; }, e => { delete e.result; }, e => { delete e.before_state; },
        e => { e.owner = '/tests/fake#1'; }, e => { e.heartbeat_index = 1; },
        e => { e.return_observation = 'not_observed'; e.result = 'not_observed'; }]) {
        const wrong = structuredClone(r); mutate(wrong.npc_bout.chat_choices[0]); assert.throws(() => validateEmeiNpcBoutRecord(wrong, c));
    }
});
test('入口复用原观察器，不写NPC属性或添加执行策略；原目标与旁观分离', () => {
    const observer = read('tools/tests/martial_data/npc_observer.lpc');
    const body = observer.slice(observer.indexOf('private mapping prepare_original_bout'), observer.indexOf('mapping prepare_gumu_bout'));
    assert.ok(body.includes('"/kungfu/class/emei/zhou"')); assert.ok(body.includes('new(config["path"])'));
    assert.doesNotMatch(body, /->(?:set|set_skill|map_skill|prepare_skill|set_busy)\(/);
    const runner = read('tools/tests/martial_data/runner.lpc'), receiver = read('tools/tests/martial_data/npc_bout_receivers.h');
    assert.ok(runner.includes('->prepare_emei_bout(')); assert.ok(receiver.includes('"emei-npc-bout"'));
    assert.ok(receiver.includes('npc_bout_pending_choice')); assert.ok(receiver.includes('"before_state"'));
});

test('工厂输出不能修改后续原NPC预期；后续调用仍绑定原声明', () => {
    const [wrong] = emeiNpcBoutConditions(catalog, read);
    wrong.parameters.npc.original.skills.force = 999;
    wrong.parameters.npc.original.mappings.force = 'fake';
    assert.equal(emeiNpcBoutConditions(catalog, read)[0].parameters.npc.original.skills.force, 260);
    assert.equal(emeiNpcBoutConditions(catalog, read)[0].parameters.npc.original.mappings.force, 'yijin-duangu');
});
test('成功增益须有原费用、忙乱、实际属性和自有回调，不仅返回1', () => {
    const r = record(), n = r.npc_observation, b = r.npc_bout;
    Object.assign(b.npc_metrics, { chats: 1, choices: 1 });
    const before = structuredClone(n.before), after = structuredClone(n.before);
    after.properties.neili -= 200; after.busy = 2;
    Object.assign(after.temp, { gui_yuan: 1, str: 5, dex: 5 });
    after.callouts = [{ owner: before.object, function: 'eval_function', remaining: 130 }];
    b.chat_choices = [{ actor: -1, actor_object: before.object, target: 0, target_object: r.before[0].object,
        index: 4, heartbeat_index: 0, elapsed: 1.1, owner: before.object, repr: before.combat_callbacks[4],
        busy: null, fighting: 1, result: 1, return_observation: 'observed', terminal_event_index: -1,
        before_state: before, after_state: after }];
    validateEmeiNpcBoutRecord(r, c);
    for (const mutate of [s => { s.properties.neili++; }, s => { s.busy = 0; }, s => { s.temp.str = 0; },
        s => { s.effective_str += 5; }, s => { s.callouts = []; }, s => { s.callouts[0].owner = '/tests/fake#1'; }]) {
        const wrong = structuredClone(r); mutate(wrong.npc_bout.chat_choices[0].after_state);
        assert.throws(() => validateEmeiNpcBoutRecord(wrong, c));
    }
});
test('专用统计不以场外旁观者计损，净差/毛账/未决和空报告独立', () => {
    const raw = record(), row = { condition_id: c.id, index: 0, outcome: 'observed', raw, raw_sha256: 'synthetic-not-native' };
    const report = emeiNpcBoutReport([row], c), empty = emeiNpcBoutReport([], c);
    assert.equal(report.npc_gross_resources, 'not_observed'); assert.equal(report.winners.none, 1);
    assert.equal(empty.coverage.observed, 0); assert.equal(empty.coverage.missing, 20);
    assert.equal(empty.user_net_loss.qi.mean, null); assert.equal(empty.npc_endpoint_net_loss.qi.mean, null);
    assert.equal(report.npc_preterminal_net_loss.qi.unknown, 1);
    assert.match(emeiNpcBoutMarkdown(report), /NPC毛支出与毛恢复未观察/);
    const manifest = { identity: { conditions: [c], execution: { smoke: false } }, fingerprint: 'synthetic-not-native' };
    assert.throws(() => summarizeSamples(manifest, [row]), /专用报告/);
    const stats = summarizeSamples(manifest, [row], { emeiNpcBoutReport });
    assert.equal(stats.conditions[0].sides, null); assert.equal(stats.conditions[0].bouts, null);
    assert.throws(() => statisticsMarkdown(stats), /通用对方/);
    const markdown = statisticsMarkdown(stats, { emeiNpcBoutMarkdown });
    assert.ok(markdown.includes('原周芷若自然心跳交锋')); assert.ok(!markdown.includes('对方气血支出'));
    assert.throws(() => emeiNpcBoutReport([row, row], c));
    const wrong = structuredClone(row); wrong.outcome = 'refused';
    assert.throws(() => emeiNpcBoutReport([wrong], c));
});
