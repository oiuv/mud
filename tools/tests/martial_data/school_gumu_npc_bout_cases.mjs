// Independent preparation only. No registration, driver, NPC rewrite or extra random draw.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';
import { distribution } from './statistics.mjs';
import { gumuNpcCallbacks, gumuNpcConditions, gumuNpcSources } from './school_gumu_npc_cases.mjs';
import { gumuBoutConditions } from './school_gumu_bout_cases.mjs';

export const gumuNpcBoutGroup = 'gumu-npc-bout';
export const gumuNpcBoutSources = [...new Set([...gumuNpcSources,
    'clone/misc/corpse.c', 'clone/user/user.c', 'feature/move.c',
    'kungfu/skill/qixing-bu.c', 'kungfu/skill/yunv-shenfa.c',
    'kungfu/skill/sword.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'include/weapon.h', 'adm/daemons/itemd.c',
])].sort();
export const gumuNpcBoutRequirements = [
    'Append five original NPC contexts only. Preserve original skills, maps, preparation, weapons, health, jiali and the original twenty combat closures.',
    'Retain two real USER records: side 0 is the neutral opponent, side 1 is an unchanged noncombat bystander. Actor -1 is valid only together with the exact owned NPC reference.',
    'Prepare original NPCs in the existing command context, pause only before observation, then release original heartbeats in alternating order. Do not call attack/chat or evaluate a chosen closure from a new strategy.',
    'Reuse combat attack/direct/action/passive observations. Add narrowly gated read-only observations of the original NPC heartbeat, scan/chat selection and original death/corpse path in the temporary copy, with unique reversible anchors.',
    'Keep original global action tables and first-load evidence; initializer identity not actually observed remains not_observed. No reload or synthesized action table for a sample.',
    'Keep NPC gross resources not_observed, endpoint net loss separate from preterminal net loss, and existing USER gross ledgers separate from both. Observe natural timers without fast-forwarding.',
    'Stop at the original terminal outcome, not before an NPC override reaches die. Preserve the last preterminal snapshot; a destructed NPC has an explicit absent endpoint, never zero-filled fields.',
    'A pending NPC choice or round may lack its return only when the exact NPC disappears after a linked original death entry in the same heartbeat and synchronous call. Preserve the attempt; mark the return and round after count not_observed instead of fabricating null/zero. Surviving NPC and all USER calls must return.',
    'Clean only exact sample-owned NPCs, items, original returned corpses and callbacks. Preserve the occupied silver companion unchanged outside the arena; never seize external ownership.',
];

export function gumuNpcBoutConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean');
    const originals = gumuNpcConditions(catalog, readSource).filter(c => c.parameters.npc.callback_index === -1);
    assert.equal(originals.length, 5);
    const neutral = gumuBoutConditions(catalog)[0].parameters.target;
    const evidence = gumuNpcBoutSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    return originals.map(c => ({ id: `school-gumu-npc-bout-${c.parameters.combination}`,
        stage: 'school', entry_id: c.entry_id, method: 'bout', samples: smoke ? 2 : 20,
        status: 'configured_not_executed', parameters: {
            school: 'gumu', family: '古墓派', collection_group: gumuNpcBoutGroup,
            skill: c.parameters.skill, usage: 'original', ability: 'bout', level: 0,
            combination: c.parameters.combination, npc: structuredClone(c.parameters.npc),
            actor: structuredClone(neutral), target: structuredClone(neutral),
            actor_role: 'neutral_user_opponent', target_role: 'outside_arena_bystander',
            observation: 'original_npc_heartbeat_bout', strategy: 'original_npc_chat',
            first: 'alternating_index', action: 'ordinary', fighting: true,
            observe_seconds: smoke ? 3 : 30, expected: 'observed', not_applicable: '',
            qualification_sources: [...gumuNpcBoutSources], source_evidence: structuredClone(evidence),
            qualification_note: '四位原NPC、五种原配装状态；真实中性USER作对手，另一USER只旁观。正式各20场30秒，烟雾各2场3秒，交替放行首个原心跳；原scan/chat随机选一个闭包，不轮流代施招。李原内部双备、林错误剑招分发、龙女唯一银索及原长鞭回退、林杨未穿青衣均保留（MA-113/MA-119）。NPC毛费用未观察，净差与终态前净差分列；不把短烟雾、原NPC和标准USER组合混成平衡排名。',
        } }));
}

export function gumuNpcBoutEntries(conditions) {
    return [...new Map(conditions.filter(c => c.parameters.collection_group === gumuNpcBoutGroup)
        .map(c => [c.entry_id, c.parameters.npc.source])).values()];
}

export function validateGumuNpcBoutPlan(conditions, catalog, readSource, options = {}) {
    assert.equal(conditions.length, 5);
    assert.equal(new Set(conditions.map(c => c.id)).size, 5);
    for (const c of conditions) assert.match(c.id, /^[a-z][a-z0-9_-]*$/);
    assert.deepEqual(conditions, gumuNpcBoutConditions(catalog, readSource, options));
}

const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const silver = '/clone/lonely/yinsuo';
const dynamicPaths = ['suxin-jian', 'quanzhen-jian', 'yinsuo-jinling', 'sanwu-shou', 'wudu-shenzhang', 'sad-strike']
    .map(id => '/kungfu/skill/' + id);
const own = (o, k) => Object.hasOwn(o, k);
const map = (v, label) => assert.ok(v && typeof v === 'object' && !Array.isArray(v), label);
const integer = (v, label) => assert.ok(Number.isSafeInteger(v), label);
const absent = v => v === 0 || v === null;
function required(o, key) { assert.ok(own(o, key), '缺少实际观察：' + key); return o[key]; }
function busy(v) { assert.ok(v === null || Number.isSafeInteger(v) && v >= 0, '忙乱不是实际值'); }
function conditions(v) { if (!absent(v)) map(v, '异常状态须为原映射或显式缺省值'); }
function cloneName(name, program) {
    assert.ok(typeof name === 'string' && name.startsWith(program + '#') && /^\d+$/.test(name.slice(program.length + 1)));
}
function clock(value, elapsed) { assert.ok(Number.isFinite(value) && value >= 0 && value <= elapsed, '原时钟观察越界'); }
function count(mapping, key) {
    map(mapping, '缺少实际计数器');
    // Existing USER/counter mappings are sparse; an absent mapping is never a zero observation.
    const value = own(mapping, key) ? mapping[key] : 0;
    integer(value, key); assert.ok(value >= 0, key); return value;
}
function point(state, expected) {
    map(state, '缺少实际资源点'); assert.equal(state.object, expected);
    const values = state.userp === 0 ? state.properties : state;
    map(values, '缺少原资源映射');
    for (const k of resources) integer(required(values, k), k);
    return values;
}
function npc(state, cfg, initial = false) {
    map(state, '缺少原NPC快照'); cloneName(state.object, cfg.path); assert.equal(state.program, cfg.path);
    for (const [k, v] of Object.entries({ clone: 1, userp: 0, interactive: 0, wizardp: 0 })) assert.equal(state[k], v);
    assert.ok(absent(required(state, 'playerp')), '原NPC不能伪装玩家');
    assert.ok([0, 1].includes(state.living)); busy(required(state, 'busy'));
    conditions(required(state, 'conditions')); assert.ok(absent(required(state, 'ghost')) || state.ghost === 1);
    point(state, state.object);
    for (const k of ['skills', 'mappings', 'preparations', 'learned', 'temp']) map(state[k], k);
    for (const k of ['inventory', 'callouts', 'combat_callbacks', 'combat_callback_owners']) assert.ok(Array.isArray(state[k]), k);
    assert.equal(state.combat_callbacks.length, gumuNpcCallbacks[cfg.id].length);
    assert.deepEqual(state.combat_callback_owners, gumuNpcCallbacks[cfg.id].map(() => state.object));
    assert.ok(state.combat_callbacks.every(s => typeof s === 'string' && s.length));
    for (const [i, [entry, argument]] of gumuNpcCallbacks[cfg.id].entries())
        if (entry !== 'command') assert.ok(state.combat_callbacks[i].includes(entry)
            && state.combat_callbacks[i].includes(JSON.stringify(argument)), '闭包描述与原索引不符');
    for (const item of state.inventory) {
        assert.equal(item.environment, state.object); map(item.weapon_prop); map(item.armor_prop);
        required(item, 'equipped'); required(item, 'consistence'); required(item, 'skill_type');
        assert.ok(absent(item.consistence) || Number.isSafeInteger(item.consistence), '耐久须保留原实际数值');
        if (item.program === silver) { assert.equal(item.object, silver); assert.equal(item.clone, 0); }
        else { cloneName(item.object, item.program); assert.equal(item.clone, 1); }
    }
    if (!initial) return;
    assert.equal(state.living, 1); assert.ok(absent(state.ghost) && absent(state.busy));
    assert.ok(absent(state.conditions) || JSON.stringify(state.conditions) === '{}');
    assert.deepEqual(state.skills, cfg.original.skills); assert.deepEqual(state.mappings, cfg.original.mappings);
    assert.deepEqual(state.preparations, cfg.original.preparations); assert.deepEqual(state.learned, {});
    assert.deepEqual(state.callouts, []); assert.equal(state.properties.chat_chance_combat, 120);
    for (const [k, v] of Object.entries(cfg.original.props)) assert.equal(state.properties[k], v, '原构造：' + k);
    for (const k of resources) assert.equal(state.properties[k], state.properties[k.includes('jing') ? 'max_jing' : k === 'neili' ? 'max_neili' : 'max_qi']);
    assert.ok(absent(required(state.properties, 'potential')));
    assert.equal(state.temp.powerup ?? 0, 0);
    assert.deepEqual(state.inventory.map(i => i.program).sort(), [...cfg.original.gear].sort());
    assert.equal(state.secondary_weapon_object, '');
    assert.equal(state.weapon, cfg.original.wield ? cfg.id === 'lin' ? 'sword' : 'whip' : 'none');
    if (!cfg.original.wield) assert.equal(state.weapon_object, '');
    for (const item of state.inventory) {
        if (item.program === '/clone/cloth/qingyi' && ['lin', 'yang'].includes(cfg.id)) {
            assert.ok(absent(item.consistence) && absent(item.equipped), '原青衣不得补耐久或强穿');
            assert.ok(absent(state.temp.armor?.cloth ?? 0), '未穿青衣不得占衣服槽');
            assert.equal(state.temp.apply?.armor, 200);
            assert.equal(state.temp.apply?.dodge ?? 0, cfg.id === 'lin' ? -1 : 0);
        } else {
            assert.equal(item.consistence, 100);
            if (item.program === cfg.original.wield) {
                assert.equal(item.equipped, 'wielded'); assert.equal(state.weapon_object, item.object);
                assert.equal(item.skill_type, state.weapon); assert.equal(item.weapon_prop.damage, item.program === silver ? 150 : 25);
            } else if (item.program === '/d/items/whip/fuchen2') assert.ok(absent(item.equipped));
            else assert.equal(item.equipped, 'worn');
        }
    }
}
function user(state, config, initial = false) {
    map(state); assert.match(state.object, /^\/tests\/[a-z_]+#\d+$/);
    for (const [k, v] of Object.entries({ userp: 1, playerp: 1, interactive: 1, wizardp: 0 })) assert.equal(state[k], v);
    point(state, state.object); busy(required(state, 'busy')); conditions(required(state, 'conditions'));
    assert.ok(absent(required(state, 'ghost')) || state.ghost === 1);
    if (!initial) return;
    assert.equal(state.living, 1); assert.ok(absent(state.busy) && absent(state.ghost));
    for (const [k, v] of Object.entries(config.properties))
        assert.equal(k.includes('/') || k === 'character' ? state.cultivation?.[k] : state[k], v, k);
    assert.deepEqual(state.skills, config.skills); assert.deepEqual(state.mappings, config.mappings);
    assert.deepEqual(state.preparations, config.preparations);
    assert.equal(state.effective_con, 96); assert.equal(state.temp?.apply?.armor, 100);
    assert.equal(state.temp?.apply?.dodge, -1); assert.equal(state.weapon, 'sword');
    assert.equal(state.weapon_details?.program, '/tests/sword'); assert.equal(state.weapon_details?.weight, 3000);
    assert.equal(state.weapon_details?.damage, 50); assert.equal(state.weapon_damage, 50);
    assert.equal(state.weapon_details?.consistence, 100); assert.equal(state.weapon_flag, 4);
    assert.equal(state.weapon_details?.flag, 4); assert.equal(state.handing, 'none');
    assert.deepEqual(state.handing_details, {}); assert.deepEqual(state.secondary_weapon_details, {});
}
function combatIdentity(event, n, raw) {
    assert.ok([-1, 0].includes(event.actor), '旁观者/外部NPC不得成为参战者');
    assert.equal(event.actor_object, event.actor === -1 ? n.before.object : raw.before[0].object,
        '-1不能替代确切原NPC身份');
    if (own(event, 'target')) {
        assert.equal(event.target, event.actor === -1 ? 0 : -1);
        assert.equal(event.target_object, event.target === -1 ? n.before.object : raw.before[0].object);
    }
}

function pendingReturn(event, kind, index, raw) {
    const n = raw.npc_observation, b = raw.npc_bout;
    const observation = required(event, 'return_observation');
    integer(required(event, 'terminal_event_index'));
    if (observation === 'observed') {
        assert.equal(event.terminal_event_index, -1, '实返不能附会到稍后的死亡');
        return false;
    }
    assert.equal(observation, 'not_observed');
    assert.equal(event.actor, -1, '仅同栈销毁的确切NPC允许缺少后置观察');
    assert.equal(event.actor_object, n.before.object);
    assert.equal(required(event, 'result'), 'not_observed', '未知返回不能用实际null/0代替');
    assert.ok(event.terminal_event_index >= 0);
    const death = b.terminal_events[event.terminal_event_index];
    map(death, '缺少同栈原死亡入口');
    assert.equal(death.kind, 'death'); assert.equal(death.actor, -1);
    assert.equal(death.actor_object, event.actor_object);
    assert.equal(required(death, 'pending_' + kind + '_index'), index, '死亡入口必须反向指向原pending调用');
    assert.equal(required(death, 'heartbeat_index'), event.heartbeat_index, '稍后心跳的死亡不能豁免早期漏采');
    assert.ok(death.elapsed >= event.elapsed, '原前置观察必须先于同栈死亡入口');
    assert.equal(b.terminal, 'death');
    assert.ok(absent(required(n, 'after')), '进入die但未销毁不能豁免后置观察');
    return true;
}

export function validateGumuNpcBoutRecord(raw, condition) {
    const p = condition.parameters, cfg = p.npc;
    assert.equal(p.collection_group, gumuNpcBoutGroup); assert.equal(condition.method, 'bout');
    assert.equal(raw.kind, 'sample'); assert.equal(raw.method, 'bout'); assert.equal(raw.condition_id, condition.id);
    integer(raw.index); assert.ok(raw.index >= 0 && raw.index < condition.samples);
    if (raw.outcome === 'error') return;
    assert.equal(raw.outcome, 'observed'); assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed > 0);
    assert.equal(raw.before?.length, 2); assert.equal(raw.after?.length, 2); assert.equal(raw.metrics?.length, 2);
    for (const side of [0, 1]) {
        user(raw.before[side], side ? p.target : p.actor, true); user(raw.after[side]);
        assert.equal(raw.before[side].object, raw.after[side].object); map(raw.metrics[side]);
        for (const k of resources) assert.equal(raw.after[side][k], raw.before[side][k]
            - count(raw.metrics[side], k + '_cost') + count(raw.metrics[side], k + '_recovery'), 'USER原资源账：' + k);
    }
    assert.notEqual(raw.before[0].object, raw.before[1].object);
    assert.deepEqual(raw.after[1], raw.before[1], '旁观USER保持原样');
    assert.ok(Object.values(raw.metrics[1]).every(v => v === 0), '旁观者不运行心跳/战斗/资源变化');
    const n = raw.npc_observation, b = raw.npc_bout;
    map(n); map(b); npc(n.before, cfg, true);
    assert.equal(n.target_object, raw.before[0].object); assert.match(n.room, /^\/tests\//);
    assert.equal(b.npc_object, n.before.object); assert.equal(b.user_object, raw.before[0].object);
    assert.equal(b.bystander_object, raw.before[1].object);
    assert.match(b.bystander_room, /^\/tests\//); assert.notEqual(b.bystander_room, n.room);
    assert.equal(b.npc_gross_resources, 'not_observed');
    assert.equal(b.first_actor, raw.index % 2 === 0 ? -1 : 0);
    assert.equal(b.duration_limit_seconds, p.observe_seconds);
    for (const key of ['heartbeats', 'chat_choices', 'terminal_events', 'corpse_returns', 'corpses']) assert.ok(Array.isArray(b[key]), key);
    assert.ok(b.heartbeats.length > 0, '必须观察原心跳'); assert.equal(b.heartbeats[0].actor, b.first_actor);
    let previous = 0;
    for (const h of b.heartbeats) {
        combatIdentity(h, n, raw); clock(h.elapsed, raw.elapsed); assert.ok(h.elapsed >= previous); previous = h.elapsed;
        busy(required(h, 'busy'));
    }
    map(b.npc_metrics); map(b.busy_seconds);
    for (const key of ['heartbeats', 'scans', 'chats', 'choices', 'hit', 'dodge', 'parry',
        'quick', 'riposte', 'direct', 'rounds', 'force', 'martial']) {
        integer(required(b.npc_metrics, key), key); assert.ok(b.npc_metrics[key] >= 0);
    }
    for (const key of ['npc', 'user']) assert.ok(Number.isFinite(b.busy_seconds[key]) && b.busy_seconds[key] >= 0 && b.busy_seconds[key] <= raw.elapsed);
    const npcBeats = b.heartbeats.filter(h => h.actor === -1).length;
    assert.equal(count(b.npc_metrics, 'heartbeats'), npcBeats);
    assert.equal(count(raw.metrics[0], 'heartbeats'), b.heartbeats.length - npcBeats);
    assert.ok(count(b.npc_metrics, 'chats') <= count(b.npc_metrics, 'scans') && count(b.npc_metrics, 'scans') <= npcBeats);
    assert.ok(b.chat_choices.length <= count(b.npc_metrics, 'chats'));
    assert.equal(count(b.npc_metrics, 'choices'), b.chat_choices.length);
    const chosenBeats = new Set();
    for (const [index, c] of b.chat_choices.entries()) {
        assert.equal(c.actor, -1); combatIdentity(c, n, raw); clock(c.elapsed, raw.elapsed);
        integer(c.heartbeat_index); const beat = b.heartbeats[c.heartbeat_index];
        assert.ok(beat && beat.actor === -1 && beat.elapsed <= c.elapsed && !chosenBeats.has(c.heartbeat_index));
        chosenBeats.add(c.heartbeat_index); assert.ok(absent(required(c, 'busy'))); assert.equal(c.fighting, 1);
        integer(c.index); assert.ok(c.index >= 0 && c.index < gumuNpcCallbacks[cfg.id].length);
        assert.equal(c.owner, n.before.object); assert.equal(c.repr, n.before.combat_callbacks[c.index]);
        if (pendingReturn(c, 'choice', index, raw)) continue;
        assert.ok(own(c, 'result'), '原闭包返回不可缺失');
        if (gumuNpcCallbacks[cfg.id][c.index][0] === 'command') {
            integer(c.result); assert.ok(c.result >= 0, 'command返回是执行成本，不是布尔成功');
        } else assert.ok(c.result === null || c.result === 0 || c.result === 1);
    }
    for (const key of ['attacks', 'npc_direct', 'attack_rounds', 'passives', 'actions']) assert.ok(Array.isArray(raw[key]), key);
    for (const event of [...raw.attacks, ...raw.npc_direct, ...raw.passives, ...raw.actions]) {
        required(event, 'target'); required(event, 'target_object'); combatIdentity(event, n, raw);
    }
    for (const event of raw.attack_rounds) combatIdentity(event, n, raw);
    assert.ok(raw.attacks.length + raw.npc_direct.length > 0, '有心跳不等于发生交锋');
    for (const event of raw.attacks) {
        assert.ok([0, 1, 2].includes(event.type), '原普攻/反击/快速攻击均保留');
        assert.ok([0, -1, -2].includes(event.result)); integer(event.damage);
    }
    for (const event of raw.npc_direct) {
        assert.equal(event.actor, -1, '中性USER无主动绝招，不应产生直接伤害调用');
        integer(event.type); integer(event.damage); integer(event.percent);
    }
    for (const [index, round] of raw.attack_rounds.entries()) {
        clock(round.elapsed, raw.elapsed); integer(required(round, 'before')); assert.ok(round.before >= 0);
        integer(required(round, 'heartbeat_index'));
        const beat = b.heartbeats[round.heartbeat_index];
        assert.ok(beat && beat.actor === round.actor && beat.actor_object === round.actor_object && beat.elapsed <= round.elapsed,
            '原攻击轮前置必须属于确切施术者心跳');
        if (pendingReturn(round, 'round', index, raw)) assert.equal(required(round, 'after'), 'not_observed');
        else { integer(required(round, 'after')); integer(required(round, 'result')); }
    }
    for (const action of raw.actions) { map(action.action); assert.equal(typeof action.action.action, 'string'); }
    assert.ok(raw.actions.length >= raw.attacks.length, '每次完整攻击必须保存原动作，反击不遗漏');
    for (const event of raw.passives) {
        assert.ok(['force', 'martial'].includes(event.route)); assert.equal(event.before?.length, 2); assert.equal(event.after?.length, 2);
        for (const phase of ['before', 'after']) {
            point(event[phase][0], event.actor_object); point(event[phase][1], event.target_object);
        }
        integer(event.incoming); integer(event.factor); required(event, 'result');
        assert.equal(event.actor, -1, '中性USER无特殊映射，不能产生特殊内功/武学回调');
        assert.ok(Object.values(cfg.original.mappings).includes(event.skill));
        if (event.route === 'force') assert.equal(event.skill, cfg.original.mappings.force);
    }
    for (const actor of [-1, 0]) {
        const metrics = actor === -1 ? b.npc_metrics : raw.metrics[0], attacks = raw.attacks.filter(e => e.actor === actor);
        for (const [key, result] of [['hit', 0], ['dodge', -1], ['parry', -2]])
            assert.equal(count(metrics, key), attacks.filter(e => e.result === result).length);
        for (const [key, type] of [['riposte', 1], ['quick', 2]]) assert.equal(count(metrics, key), attacks.filter(e => e.type === type).length);
        assert.equal(count(metrics, 'direct'), raw.npc_direct.filter(e => e.actor === actor).length);
        assert.equal(count(metrics, 'rounds'), raw.attack_rounds.filter(e => e.actor === actor).length);
        for (const route of ['force', 'martial']) assert.equal(count(metrics, route), raw.passives.filter(e => e.actor === actor && e.route === route).length);
    }
    if (!absent(required(n, 'after'))) { npc(n.after, cfg); assert.equal(n.after.object, n.before.object); }
    assert.ok(['time_limit', 'unconscious', 'death'].includes(b.terminal));
    if (b.terminal === 'time_limit') {
        assert.equal(b.winner, 'none'); assert.deepEqual(b.terminal_events, []);
        assert.ok(raw.elapsed >= p.observe_seconds && npcBeats > 0 && count(raw.metrics[0], 'heartbeats') > 0);
        assert.equal(n.after?.living, 1); assert.equal(raw.after[0].living, 1);
    } else {
        assert.ok(b.terminal_events.length > 0);
        for (const [index, event] of b.terminal_events.entries()) {
            combatIdentity(event, n, raw); clock(event.elapsed, raw.elapsed);
            assert.ok(['unconscious', 'death'].includes(event.kind));
            if (event.actor === -1) npc(event.state_before, cfg); else user(event.state_before);
            point(event.state_before, event.actor_object);
            integer(required(event, 'heartbeat_index'));
            const beat = b.heartbeats[event.heartbeat_index];
            assert.ok(beat && beat.elapsed <= event.elapsed);
            for (const [kind, calls] of [['choice', b.chat_choices], ['round', raw.attack_rounds]]) {
                const pending = required(event, 'pending_' + kind + '_index');
                integer(pending); assert.ok(pending >= -1);
                if (pending === -1) continue;
                assert.equal(event.kind, 'death'); assert.equal(event.actor, -1);
                const call = calls[pending]; map(call, '死亡入口指向不存在的pending调用');
                assert.equal(call.return_observation, 'not_observed');
                assert.equal(call.terminal_event_index, index, 'pending调用必须反向指向同一死亡入口');
                assert.equal(call.heartbeat_index, event.heartbeat_index);
                assert.equal(call.actor, -1); assert.equal(call.actor_object, event.actor_object);
            }
        }
        const last = b.terminal_events.at(-1);
        assert.equal(last.kind, b.terminal); assert.equal(b.winner, last.actor === -1 ? 'user' : 'npc');
        if (last.actor === -1) {
            if (last.kind === 'death') assert.ok(absent(n.after), '原NPC销毁后不可补造终态');
            else { assert.equal(cfg.id, 'li', '林/龙/杨原昏迷入口直接die'); assert.equal(n.after?.living, 0); }
        } else assert.ok(raw.after[0].living === 0 || raw.after[0].ghost === 1);
    }
    const deadNpc = b.terminal_events.some(e => e.actor === -1 && e.kind === 'death');
    assert.equal(absent(n.after), deadNpc, '缺席终态必须有原NPC死亡证据');
    const deaths = b.terminal_events.filter(e => e.kind === 'death');
    assert.deepEqual(b.corpse_returns.map(c => c.victim_object).sort(), deaths.map(e => e.actor_object).sort(),
        '须观察原make_corpse实际返回，不能用空数组代替缺失');
    for (const result of b.corpse_returns) {
        required(result, 'result');
        if (!absent(result.result)) cloneName(result.result, '/clone/misc/corpse');
    }
    assert.deepEqual(b.corpses.map(c => c.object).sort(), b.corpse_returns.filter(c => !absent(c.result)).map(c => c.result).sort());
    validatePreparationAndCleanup(n, b, cfg, raw);
}

function validatePreparationAndCleanup(n, b, cfg, raw) {
    const p = n.preparation; map(p);
    assert.equal(p.entry_player, raw.before[0].object);
    assert.ok([raw.before[0].object, n.before.object].includes(p.returned_player));
    assert.equal(p.initializer_actor, 'not_observed', '不得把入口this_player冒充每门全局表加载者');
    assert.ok([0, 1].includes(p.npc_heartbeat_before)); assert.equal(p.npc_heartbeat_paused, 0);
    assert.equal(p.blueprint_heartbeat, 0); assert.deepEqual(p.constructor_callbacks, []);
    for (const key of ['loaded_before', 'loaded_after']) {
        assert.ok(Array.isArray(p[key]) && new Set(p[key]).size === p[key].length);
        assert.ok(p[key].every(path => dynamicPaths.includes(path)));
    }
    assert.ok(p.loaded_before.every(path => p.loaded_after.includes(path)), '不为下一样本重载动态动作表');
    const owners = [n.before.object], owned = [n.before.object, ...n.before.inventory.map(i => i.object)];
    if (cfg.id !== 'longnv') assert.ok(absent(required(n, 'silver')));
    else {
        const s = n.silver; map(s); assert.equal(s.object, silver); assert.equal(s.clone, 0); assert.equal(s.state, cfg.silver_state);
        if (cfg.silver_state === 'free') {
            assert.equal(s.initial_environment, ''); assert.equal(s.before_environment, n.before.object);
            for (const k of ['companion_before', 'companion_after']) assert.ok(absent(required(s, k)));
            assert.ok([n.before.object, n.room, '', ...b.corpses.filter(c => c.victim_object === n.before.object).map(c => c.object)]
                .includes(s.after_environment), '原单例去向必须是确切NPC/原尸体/本场房间或实际销毁');
        } else {
            const free = { ...cfg, silver_state: 'free', original: { ...cfg.original,
                gear: [silver, '/clone/cloth/baipao'], wield: silver } };
            npc(s.companion_before, free, true); assert.deepEqual(s.companion_after, s.companion_before);
            assert.notEqual(s.companion_before.object, n.before.object);
            assert.equal(s.initial_environment, s.companion_before.object);
            assert.equal(s.before_environment, s.companion_before.object); assert.equal(s.after_environment, s.companion_before.object);
            assert.match(s.companion_room, /^\/tests\//); assert.notEqual(s.companion_room, n.room);
            assert.equal(s.companion_heartbeat, 0);
            owners.push(s.companion_before.object); owned.push(s.companion_before.object, ...s.companion_before.inventory.map(i => i.object));
        }
    }
    assert.deepEqual([...p.created_npcs].sort(), owners.sort());
    for (const corpse of b.corpses) {
        assert.ok(b.terminal_events.some(e => e.kind === 'death' && e.actor_object === corpse.victim_object));
        cloneName(corpse.object, '/clone/misc/corpse'); assert.equal(corpse.program, '/clone/misc/corpse');
        assert.equal(corpse.origin, 'original_make_corpse_return'); assert.match(corpse.environment, /^\/tests\//);
        assert.ok(Array.isArray(corpse.inventory_objects)); owned.push(corpse.object);
        for (const object of corpse.inventory_objects) assert.ok(owned.includes(object)
            || object === raw.before[0].weapon_details.object, '尸体不得接管场外物品');
    }
    const unique = [...new Set(owned)].sort(); map(n.cleanup);
    assert.equal(n.destroyed, 1); assert.equal(n.cleanup.enemies_removed, 1);
    assert.deepEqual(n.cleanup.objects.map(o => o.object).sort(), unique, '确切自有对象清理不能漏尸体或包含外部对象');
    for (const item of n.cleanup.objects) {
        assert.ok([0, 1].includes(item.existed_before_cleanup)); assert.equal(item.destroyed, 1);
        if (item.object === n.before.object) assert.equal(item.existed_before_cleanup, absent(n.after) ? 0 : 1);
    }
    assert.deepEqual(n.cleanup.remaining_callbacks, []);
}

export function gumuNpcBoutEffects(rows, condition) {
    assert.equal(condition?.parameters?.collection_group, gumuNpcBoutGroup);
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.outcome, row.raw.outcome);
        validateGumuNpcBoutRecord(row.raw, condition);
    }
    const data = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const net = (r, key, terminal) => {
        const n = r.npc_observation;
        const end = terminal ? r.npc_bout.terminal_events.filter(e => e.actor === -1).at(-1)?.state_before : n.after;
        return end && typeof end === 'object' ? n.before.properties[key] - end.properties[key] : null;
    };
    return { samples: rows.length, observed: data.length, combination: condition.parameters.combination,
        duration_limit_seconds: condition.parameters.observe_seconds,
        npc_wins: data.filter(r => r.npc_bout.winner === 'npc').length,
        user_wins: data.filter(r => r.npc_bout.winner === 'user').length,
        undecided: data.filter(r => r.npc_bout.winner === 'none').length,
        elapsed: distribution(data.map(r => r.elapsed)), npc_gross_resources: 'not_observed',
        npc_endpoint_net_loss: Object.fromEntries(resources.map(k => [k, distribution(data.map(r => net(r, k, false)))])),
        npc_preterminal_net_loss: Object.fromEntries(resources.map(k => [k, distribution(data.map(r => net(r, k, true)))])),
        user_net_loss: Object.fromEntries(resources.map(k => [k, distribution(data.map(r => r.before[0][k] - r.after[0][k]))])),
        user_gross: Object.fromEntries(resources.map(k => [k, {
            cost: distribution(data.map(r => count(r.metrics[0], k + '_cost'))),
            recovery: distribution(data.map(r => count(r.metrics[0], k + '_recovery'))),
        }])),
        sides: Object.fromEntries([['npc', -1], ['user', 0]].map(([role, actor]) => [role, {
            attacks: data.flatMap(r => r.attacks).filter(a => a.actor === actor).length,
            direct_calls: data.flatMap(r => r.npc_direct).filter(a => a.actor === actor).length,
            rounds: (() => {
                const rounds = data.flatMap(r => r.attack_rounds).filter(a => a.actor === actor);
                return { attempts: rounds.length,
                    returns_observed: rounds.filter(r => r.return_observation === 'observed').length,
                    returns_not_observed: rounds.filter(r => r.return_observation === 'not_observed').length,
                    result: distribution(rounds.map(r => r.result)), after_count: distribution(rounds.map(r => r.after)) };
            })(),
            attack_results: Object.fromEntries([0, -1, -2].map(result => [result,
                data.flatMap(r => r.attacks).filter(a => a.actor === actor && a.result === result).length])),
            busy_seconds: distribution(data.map(r => r.npc_bout.busy_seconds[role])),
        }])),
        choices: gumuNpcCallbacks[condition.parameters.npc.id].map(([entry, argument], index) => {
            const selected = data.flatMap(r => r.npc_bout.chat_choices).filter(c => c.index === index);
            const returned = selected.filter(c => c.return_observation === 'observed');
            const unknown = selected.length - returned.length;
            return { index, entry, argument, calls: selected.length,
                returns_observed: returned.length, returns_not_observed: unknown,
                command_evaluation_cost: distribution(entry === 'command' ? selected.map(c => c.result) : []),
                command_evaluation_cost_not_observed: entry === 'command' ? unknown : null,
                method_zero: entry === 'command' ? null : returned.filter(c => c.result === 0).length,
                method_null: entry === 'command' ? null : returned.filter(c => c.result === null).length,
                method_one: entry === 'command' ? null : returned.filter(c => c.result === 1).length };
        }),
        passives: ['force', 'martial'].map(route => {
            const events = data.flatMap(r => r.passives).filter(e => e.route === route);
            return { route, calls: events.length, immediate_neili_net_loss: distribution(events.map(e =>
                point(e.before[0], e.actor_object).neili - point(e.after[0], e.actor_object).neili)) };
        }),
        limitation: '仅原NPC有限自然交锋；闭包返回/command成本不等于成功率，同栈销毁后的返回未知不作null/0或成功；NPC毛费用及首次全局表内部加载者未观察；终态前快照不是销毁后剩余资源。',
    };
}
