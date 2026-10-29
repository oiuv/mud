// One original Zhou NPC versus a neutral connected USER; not a new combat strategy.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';
import { zhouCallbacks } from './school_emei_npc_cases.mjs';

export const emeiNpcBoutGroup = 'emei-npc-bout';
export const zhouPath = 'kungfu/class/emei/zhou.c';
export const zhouReviewed = '39871dcbf606fe2e00549f73180d8d0024ac77a87a8f2fd3d618923afb341a8d';
const skills = { force: 260, 'emei-xinfa': 180, 'yijin-duangu': 260, 'linji-zhuang': 200,
    dodge: 260, 'shexing-lifan': 260, 'zhutian-bu': 180, finger: 180, 'tiangang-zhi': 180,
    hand: 180, 'jieshou-jiushi': 180, strike: 260, 'jinding-zhang': 180, 'sixiang-zhang': 180,
    'cuixin-zhang': 260, claw: 260, 'jiuyin-baiguzhao': 260, whip: 260, 'yinlong-bian': 260,
    sword: 180, 'emei-jian': 180, 'yitian-jian': 180, blade: 180, 'yanxing-dao': 180,
    parry: 260, 'martial-cognize': 200, literate: 200, mahayana: 100, buddhism: 100 };
const mappings = { force: 'yijin-duangu', dodge: 'shexing-lifan', finger: 'tiangang-zhi',
    hand: 'jieshou-jiushi', strike: 'cuixin-zhang', claw: 'jiuyin-baiguzhao', whip: 'yinlong-bian',
    sword: 'yitian-jian', blade: 'yanxing-dao', parry: 'yinlong-bian' };
const props = { str: 22, int: 32, con: 26, dex: 24, max_qi: 5000, max_jing: 3000,
    max_neili: 6000, jiali: 200, combat_exp: 2500000, gender: '女性', chat_chance_combat: 120 };
export const emeiNpcBoutSources = [...new Set([zhouPath, 'kungfu/class/emei/emei.h',
    ...Object.keys(skills).map(s => `kungfu/skill/${s}.c`),
    'kungfu/skill/jiuyin-baiguzhao/duo.c', 'kungfu/skill/shexing-lifan/guiyuan.c',
    'kungfu/skill/yijin-duangu/powerup.c', 'kungfu/skill/yijin-duangu/shield.c',
    'kungfu/skill/force/recover.c', 'kungfu/condition/cuixin_zhang.c',
    'inherit/char/char.c', 'inherit/char/npc.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'inherit/condition/poison.c', 'feature/skill.c', 'feature/attack.c', 'feature/attribute.c',
    'feature/damage.c', 'feature/condition.c', 'feature/action.c', 'feature/equip.c', 'feature/command.c',
    'feature/move.c', 'adm/daemons/combatd.c', 'adm/daemons/chard.c', 'adm/daemons/itemd.c',
    'clone/user/user.c', 'clone/misc/corpse.c', 'cmds/skill/perform.c',
    'd/items/equip.lpc', 'd/items/equip_data.h', 'include/combat.h', 'include/weapon.h',
])].sort();

function declaration(t, key) {
    return Object.fromEntries(t[key].filter(r => r.function === 'create' && r.evidence.path === t.path)
        .map(r => r.values.slice(0, 2)));
}
export function emeiNpcBoutConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean');
    const teacher = catalog.teachers.find(t => t.path === zhouPath);
    assert.ok(teacher); assert.equal(teacher.sha256, zhouReviewed);
    assert.equal(sha256(readSource(zhouPath)), zhouReviewed, '周芷若源码变化，须重新审查');
    assert.deepEqual(declaration(teacher, 'npc_skills'), skills);
    assert.deepEqual(declaration(teacher, 'mappings'), mappings);
    assert.deepEqual(declaration(teacher, 'preparations'), { strike: 'cuixin-zhang', claw: 'jiuyin-baiguzhao' });
    const neutral = { skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
        mappings: {}, preparations: {}, equipment: { type: 'sword', hold: false },
        properties: { str: 36, int: 36, con: 36, dex: 36, per: 36, combat_exp: 10000000,
            qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
            neili: 6000, max_neili: 6000, jiali: 0, gender: '男性', shen: 0 } };
    return [{ id: 'school-emei-npc-bout-zhou-original', entry_id: zhouPath, stage: 'school',
        method: 'bout', samples: smoke ? 2 : 20, status: 'configured_not_executed', parameters: {
            school: 'emei', family: '峨嵋派', collection_group: emeiNpcBoutGroup,
            skill: 'npc-zhou', usage: 'original', ability: 'bout', level: 0, combination: 'zhou-original',
            npc: { id: 'zhou', path: '/' + zhouPath.slice(0, -2), callback_index: -1,
                source: { id: zhouPath, path: zhouPath, role: 'npc', sha256: teacher.sha256 },
                original: structuredClone({ skills, mappings, props, preparations: { strike: 'cuixin-zhang', claw: 'jiuyin-baiguzhao' } }) },
            actor: structuredClone(neutral), target: structuredClone(neutral),
            actor_role: 'neutral_user_opponent', target_role: 'outside_arena_bystander',
            observation: 'original_npc_heartbeat_bout', strategy: 'original_npc_chat',
            first: 'alternating_index', action: 'ordinary', fighting: true, observe_seconds: smoke ? 3 : 30,
            expected: 'observed', not_applicable: '', qualification_sources: [...emeiNpcBoutSources],
            source_evidence: emeiNpcBoutSources.map(path => ({ path, sha256: sha256(readSource(path)) })),
            qualification_note: '原周芷若空手/淡烟纱，原催心掌与白骨爪双准备及银龙招架；不补兵器、基本拳脚或领悟。真实USER中性持剑对手，另USER场外不变。原心跳随机闭包，不指定或轮流代施。记录原入口返回、攻击/被动、终态和清理；NPC毛支出未知，净差不作费用，未选闭包不算覆盖。' } }];
}

const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const absent = v => v === null || v === 0;
const own = (o, k) => Object.hasOwn(o, k);
const map = v => assert.ok(v && typeof v === 'object' && !Array.isArray(v));
const integer = v => assert.ok(Number.isSafeInteger(v));
const field = (o, k) => { assert.ok(own(o, k), '缺少原观察：' + k); return o[k]; };
const count = (o, k) => { map(o); const v = o[k] ?? 0; integer(v); assert.ok(v >= 0); return v; };
const clock = (t, raw) => assert.ok(Number.isFinite(t) && t >= 0 && t <= raw.elapsed);
const clone = (name, path) => assert.ok(typeof name === 'string' && name.startsWith(path + '#') && /^\d+$/.test(name.slice(path.length + 1)));
function point(s, expected) {
    map(s); assert.equal(s.object, expected);
    const p = s.userp === 0 ? s.properties : s;
    map(p); for (const k of resources) integer(field(p, k)); return p;
}
function npc(s, c, initial = false) {
    const cfg = c.parameters.npc; map(s); clone(s.object, cfg.path); assert.equal(s.program, cfg.path);
    for (const [k, v] of Object.entries({ clone: 1, userp: 0, interactive: 0, wizardp: 0 })) assert.equal(s[k], v);
    assert.ok(absent(field(s, 'playerp'))); assert.ok([0, 1].includes(s.living));
    point(s, s.object); field(s, 'busy'); field(s, 'conditions'); field(s, 'ghost');
    assert.ok(absent(s.busy) || Number.isSafeInteger(s.busy) && s.busy >= 0);
    if (!absent(s.conditions)) map(s.conditions);
    for (const k of ['skills', 'mappings', 'preparations', 'learned', 'temp', 'effective_mappings', 'effective_skills']) map(s[k]);
    assert.deepEqual(s.skills, cfg.original.skills); assert.deepEqual(s.mappings, cfg.original.mappings);
    assert.deepEqual(s.preparations, cfg.original.preparations);
    assert.deepEqual(s.effective_mappings, s.mappings);
    assert.deepEqual(Object.keys(s.effective_skills).sort(), Object.keys(s.skills).sort());
    for (const key of Object.keys(s.skills)) assert.equal(s.effective_skills[key],
        Math.floor(s.skills[key] / 2) + (s.skills[s.effective_mappings[key]] ?? 0) + (s.temp.apply?.[key] ?? 0), key);
    assert.deepEqual(s.preparation_order, ['strike', 'claw']);
    assert.deepEqual(s.combat_callback_owners, zhouCallbacks.map(() => s.object));
    assert.equal(s.combat_callbacks.length, 8);
    for (const [i, argument] of zhouCallbacks.entries()) assert.ok(s.combat_callbacks[i].includes(JSON.stringify(argument))
        && s.combat_callbacks[i].includes(i < 5 ? 'perform_action' : 'exert_function'));
    if (!initial) return;
    assert.equal(s.living, 1); assert.ok(absent(s.busy) && absent(s.ghost));
    assert.ok(absent(s.conditions) || JSON.stringify(s.conditions) === '{}');
    assert.deepEqual(s.learned, {}); assert.deepEqual(s.callouts, []);
    for (const [k, v] of Object.entries(cfg.original.props)) assert.equal(s.properties[k], v, k);
    for (const k of resources) assert.equal(s.properties[k], s.properties[k.includes('jing') ? 'max_jing' : k === 'neili' ? 'max_neili' : 'max_qi']);
    assert.equal(s.weapon, 'none'); assert.equal(s.weapon_object, ''); assert.equal(s.secondary_weapon_object, '');
    assert.equal(s.inventory.length, 1); const item = s.inventory[0];
    assert.equal(item.program, '/d/items/equip/danyan_sha'); clone(item.object, item.program);
    assert.equal(item.clone, 1); assert.equal(item.environment, s.object); assert.equal(item.equipped, 'worn');
    assert.equal(item.consistence, 100); assert.deepEqual(item.armor_prop, { armor: 3 });
    assert.deepEqual(item.weapon_prop, {}); assert.equal(s.temp.armor.cloth, item.object);
    assert.equal(s.temp.apply.armor, 3); assert.equal(s.effective_str, 48); assert.equal(s.effective_dex, 50);
    assert.equal(s.temp.powerup ?? 0, 0);
}
function identity(e, raw) {
    assert.ok([-1, 0].includes(e.actor));
    const names = { '-1': raw.npc_observation.before.object, 0: raw.before[0].object };
    assert.equal(e.actor_object, names[e.actor]);
    if (own(e, 'target')) { assert.equal(e.target, e.actor === -1 ? 0 : -1); assert.equal(e.target_object, names[e.target]); }
}
function pending(e, kind, index, raw) {
    integer(field(e, 'terminal_event_index'));
    if (field(e, 'return_observation') === 'observed') { assert.equal(e.terminal_event_index, -1); return false; }
    assert.equal(e.return_observation, 'not_observed'); assert.equal(e.actor, -1);
    assert.equal(e.result, 'not_observed'); assert.ok(e.terminal_event_index >= 0);
    const d = raw.npc_bout.terminal_events[e.terminal_event_index]; map(d);
    assert.equal(d.kind, 'death'); assert.equal(d.actor_object, e.actor_object);
    assert.equal(d['pending_' + kind + '_index'], index); assert.equal(d.heartbeat_index, e.heartbeat_index);
    assert.ok(d.elapsed >= e.elapsed); assert.ok(absent(raw.npc_observation.after)); return true;
}

export function validateEmeiNpcBoutRecord(raw, c) {
    const p = c.parameters;
    assert.equal(p.collection_group, emeiNpcBoutGroup); assert.equal(c.method, 'bout');
    assert.equal(p.npc.path, '/kungfu/class/emei/zhou'); assert.equal(p.npc.callback_index, -1);
    assert.equal(raw.kind, 'sample'); assert.equal(raw.method, 'bout'); assert.equal(raw.condition_id, c.id);
    integer(raw.index); assert.ok(raw.index >= 0 && raw.index < c.samples);
    assert.equal(raw.outcome, 'observed'); assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed > 0);
    for (const k of ['before', 'after', 'metrics']) assert.equal(raw[k]?.length, 2);
    const n = raw.npc_observation, b = raw.npc_bout; map(n); map(b); npc(n.before, c, true);
    for (const side of [0, 1]) {
        const before = raw.before[side], after = raw.after[side], cfg = side ? p.target : p.actor;
        for (const [k, v] of Object.entries({ userp: 1, playerp: 1, interactive: 1, wizardp: 0 })) {
            assert.equal(before[k], v); assert.equal(after[k], v);
        }
        point(before, before.object); point(after, before.object);
        clone(before.object, '/tests/actor'); assert.equal(before.weapon, 'sword');
        clone(before.weapon_details.object, '/tests/sword');
        assert.deepEqual(before.skills, cfg.skills); assert.deepEqual(before.mappings, cfg.mappings);
        assert.deepEqual(before.preparations, cfg.preparations);
        for (const [k, v] of Object.entries(cfg.properties)) assert.equal(before[k], v, k);
        for (const k of resources) assert.equal(after[k], before[k] - count(raw.metrics[side], k + '_cost') + count(raw.metrics[side], k + '_recovery'));
    }
    assert.notEqual(raw.before[0].object, raw.before[1].object);
    assert.deepEqual(raw.before[1], raw.after[1]); assert.ok(Object.values(raw.metrics[1]).every(v => v === 0));
    assert.equal(n.target_object, raw.before[0].object); assert.equal(b.npc_object, n.before.object);
    assert.equal(b.user_object, raw.before[0].object); assert.equal(b.bystander_object, raw.before[1].object);
    assert.match(n.room, /^\/tests\//); assert.match(b.bystander_room, /^\/tests\//); assert.notEqual(n.room, b.bystander_room);
    assert.equal(b.npc_gross_resources, 'not_observed'); assert.equal(b.duration_limit_seconds, p.observe_seconds);
    assert.equal(b.first_actor, raw.index % 2 === 0 ? -1 : 0);
    for (const k of ['heartbeats', 'chat_choices', 'terminal_events', 'corpse_returns', 'corpses']) assert.ok(Array.isArray(b[k]));
    assert.ok(b.heartbeats.length); assert.equal(b.heartbeats[0].actor, b.first_actor);
    let previous = 0;
    for (const h of b.heartbeats) { identity(h, raw); clock(h.elapsed, raw); assert.ok(h.elapsed >= previous); previous = h.elapsed; field(h, 'busy'); }
    for (const key of ['heartbeats', 'scans', 'chats', 'choices', 'hit', 'dodge', 'parry', 'quick', 'riposte', 'direct', 'rounds', 'force', 'martial']) {
        integer(field(b.npc_metrics, key)); assert.ok(b.npc_metrics[key] >= 0);
    }
    for (const key of ['npc', 'user']) clock(field(b.busy_seconds, key), raw);
    const npcBeats = b.heartbeats.filter(h => h.actor === -1).length;
    assert.equal(count(b.npc_metrics, 'heartbeats'), npcBeats);
    assert.equal(count(raw.metrics[0], 'heartbeats'), b.heartbeats.length - npcBeats);
    assert.ok(count(b.npc_metrics, 'chats') <= count(b.npc_metrics, 'scans') && count(b.npc_metrics, 'scans') <= npcBeats);
    assert.equal(count(b.npc_metrics, 'choices'), b.chat_choices.length);
    assert.ok(b.chat_choices.length <= count(b.npc_metrics, 'chats'));
    const beats = new Set();
    for (const [i, e] of b.chat_choices.entries()) {
        identity(e, raw); assert.equal(e.actor, -1); clock(e.elapsed, raw); integer(e.index); integer(e.heartbeat_index);
        assert.ok(e.index >= 0 && e.index < 8 && !beats.has(e.heartbeat_index)); beats.add(e.heartbeat_index);
        const h = b.heartbeats[e.heartbeat_index]; assert.ok(h && h.actor === -1 && h.elapsed <= e.elapsed);
        assert.ok(absent(field(e, 'busy'))); assert.equal(e.fighting, 1);
        assert.equal(e.owner, n.before.object); assert.equal(e.repr, n.before.combat_callbacks[e.index]);
        npc(e.before_state, c); assert.equal(e.before_state.object, n.before.object);
        if (pending(e, 'choice', i, raw)) { assert.ok(absent(e.after_state)); continue; }
        assert.ok(absent(field(e, 'result')) || e.result === 1); npc(e.after_state, c);
        const before = e.before_state, after = e.after_state;
        const fee = before.properties.neili - after.properties.neili;
        if (e.index === 7) {
            assert.ok(absent(e.result)); assert.equal(fee, 0);
            assert.ok(absent(after.temp.shield ?? 0), '原NPC缺大伏魔拳，不应出现护体');
        }
        if ([4, 6].includes(e.index) && e.result === 1) {
            assert.equal(fee, e.index === 4 ? 200 : 100);
            assert.equal(after.busy, e.index === 4 ? 2 : 3);
            if (e.index === 4) {
                assert.ok(absent(before.temp.gui_yuan ?? 0)); assert.equal(after.temp.gui_yuan, 1);
                for (const key of ['str', 'dex']) assert.equal(after.temp[key], (before.temp[key] ?? 0) + 5);
                // Original temp str/dex are not query_str/query_dex bonuses (MA-111).
                assert.equal(after.effective_str, before.effective_str); assert.equal(after.effective_dex, before.effective_dex);
            } else {
                assert.ok(absent(before.temp.powerup ?? 0)); assert.equal(after.temp.powerup, 1);
                assert.equal(after.temp.apply.attack, (before.temp.apply.attack ?? 0) + Math.trunc(before.effective_skills.force / 3));
            }
            assert.ok(after.callouts.some(timer => timer.owner === before.object && timer.function === 'eval_function' && timer.remaining > 0),
                '成功增益必须有原NPC拥有的自然回调');
        }
        if (e.index === 5 && e.result === 1) {
            assert.ok(fee >= 20 && before.properties.eff_qi - before.properties.qi >= 10);
            assert.ok(after.properties.qi > before.properties.qi && after.properties.qi <= after.properties.eff_qi);
            assert.equal(after.busy, 1);
        }
        // These original wrong entry names cannot succeed even in natural combat.
        if ([1, 2, 3].includes(e.index)) { assert.ok(absent(e.result)); assert.equal(e.before_state.properties.neili, e.after_state.properties.neili); }
    }
    for (const key of ['attacks', 'npc_direct', 'passives', 'actions', 'attack_rounds']) assert.ok(Array.isArray(raw[key]));
    for (const e of [...raw.attacks, ...raw.npc_direct, ...raw.passives, ...raw.actions, ...raw.attack_rounds]) identity(e, raw);
    assert.ok(raw.attacks.length + raw.npc_direct.length > 0);
    for (const e of raw.attacks) { assert.ok([0, 1, 2].includes(e.type)); assert.ok([0, -1, -2].includes(e.result)); integer(e.damage); }
    assert.ok(raw.actions.length >= raw.attacks.length);
    for (const e of raw.actions) { map(e.action); assert.equal(typeof e.action.action, 'string'); }
    for (const e of raw.npc_direct) { assert.equal(e.actor, -1); for (const k of ['type', 'damage', 'percent']) integer(e[k]); }
    for (const [i, e] of raw.attack_rounds.entries()) {
        clock(e.elapsed, raw); integer(e.before); integer(e.heartbeat_index);
        const h = b.heartbeats[e.heartbeat_index]; assert.ok(h && h.actor === e.actor && h.elapsed <= e.elapsed);
        if (pending(e, 'round', i, raw)) assert.equal(e.after, 'not_observed'); else { integer(e.after); integer(e.result); }
    }
    for (const e of raw.passives) {
        assert.equal(e.actor, -1); assert.ok(['force', 'martial'].includes(e.route));
        assert.ok(Object.values(p.npc.original.mappings).includes(e.skill));
        for (const phase of ['before', 'after']) { assert.equal(e[phase]?.length, 2); point(e[phase][0], e.actor_object); point(e[phase][1], e.target_object); }
        integer(e.incoming); integer(e.factor); field(e, 'result');
    }
    for (const actor of [-1, 0]) {
        const metrics = actor === -1 ? b.npc_metrics : raw.metrics[0], attacks = raw.attacks.filter(e => e.actor === actor);
        for (const [key, result] of [['hit', 0], ['dodge', -1], ['parry', -2]]) assert.equal(count(metrics, key), attacks.filter(e => e.result === result).length);
        for (const [key, type] of [['riposte', 1], ['quick', 2]]) assert.equal(count(metrics, key), attacks.filter(e => e.type === type).length);
        for (const [key, list] of [['direct', raw.npc_direct], ['rounds', raw.attack_rounds]]) assert.equal(count(metrics, key), list.filter(e => e.actor === actor).length);
        for (const route of ['force', 'martial']) assert.equal(count(metrics, route), raw.passives.filter(e => e.actor === actor && e.route === route).length);
    }
    assert.ok(['time_limit', 'death', 'unconscious'].includes(b.terminal));
    if (b.terminal === 'time_limit') { assert.equal(b.winner, 'none'); assert.deepEqual(b.terminal_events, []); assert.ok(raw.elapsed >= p.observe_seconds && npcBeats && count(raw.metrics[0], 'heartbeats')); assert.equal(n.after?.living, 1); assert.equal(raw.after[0].living, 1); }
    else { assert.ok(b.terminal_events.length); const last = b.terminal_events.at(-1); assert.equal(last.kind, b.terminal); assert.equal(b.winner, last.actor === -1 ? 'user' : 'npc'); }
    for (const [i, e] of b.terminal_events.entries()) {
        identity(e, raw); clock(e.elapsed, raw); assert.ok(['death', 'unconscious'].includes(e.kind)); point(e.state_before, e.actor_object);
        integer(e.heartbeat_index); const h = b.heartbeats[e.heartbeat_index]; assert.ok(h && h.elapsed <= e.elapsed);
        for (const [kind, calls] of [['choice', b.chat_choices], ['round', raw.attack_rounds]]) {
            const index = field(e, 'pending_' + kind + '_index'); integer(index); assert.ok(index >= -1);
            if (index === -1) continue;
            assert.equal(e.actor, -1); assert.equal(e.kind, 'death');
            const call = calls[index]; map(call); assert.equal(call.terminal_event_index, i);
            assert.equal(call.return_observation, 'not_observed'); assert.equal(call.actor_object, e.actor_object);
        }
    }
    const dead = b.terminal_events.some(e => e.actor === -1 && e.kind === 'death');
    assert.equal(absent(field(n, 'after')), dead);
    if (!dead) { npc(n.after, c); assert.equal(n.after.object, n.before.object); }
    assert.deepEqual(b.corpse_returns.map(e => e.victim_object).sort(), b.terminal_events.filter(e => e.kind === 'death').map(e => e.actor_object).sort());
    assert.deepEqual(b.corpses.map(e => e.object).sort(), b.corpse_returns.filter(e => !absent(e.result)).map(e => e.result).sort());
    const prep = n.preparation; map(prep); assert.equal(prep.entry_player, raw.before[0].object);
    assert.ok([n.before.object, raw.before[0].object].includes(prep.returned_player));
    assert.equal(prep.initializer_actor, 'not_observed'); assert.equal(prep.npc_heartbeat_paused, 0);
    assert.ok([0, 1].includes(prep.npc_heartbeat_before));
    const loadPaths = ['jiuyin-baiguzhao', 'cuixin-zhang', 'shexing-lifan', 'yijin-duangu', 'yinlong-bian'].map(s => '/kungfu/skill/' + s);
    for (const key of ['loaded_before', 'loaded_after']) { assert.ok(Array.isArray(prep[key])); assert.equal(new Set(prep[key]).size, prep[key].length); assert.ok(prep[key].every(p => loadPaths.includes(p))); }
    assert.ok(prep.loaded_before.every(p => prep.loaded_after.includes(p)));
    assert.equal(prep.blueprint_heartbeat, 0); assert.deepEqual(prep.constructor_callbacks, []);
    assert.deepEqual(prep.created_npcs, [n.before.object]);
    const owned = [n.before.object, ...n.before.inventory.map(e => e.object)];
    for (const e of b.corpses) { clone(e.object, '/clone/misc/corpse'); assert.equal(e.origin, 'original_make_corpse_return'); for (const item of e.inventory_objects) assert.ok(owned.includes(item) || item === raw.before[0].weapon_details.object); owned.push(e.object); }
    assert.equal(n.destroyed, 1); assert.equal(n.cleanup.enemies_removed, 1);
    assert.deepEqual(n.cleanup.objects.map(e => e.object).sort(), [...new Set(owned)].sort());
    for (const e of n.cleanup.objects) { assert.equal(e.destroyed, 1); assert.ok([0, 1].includes(e.existed_before_cleanup)); if (e.object === n.before.object) assert.equal(e.existed_before_cleanup, dead ? 0 : 1); }
    assert.deepEqual(n.cleanup.remaining_callbacks, []);
}
