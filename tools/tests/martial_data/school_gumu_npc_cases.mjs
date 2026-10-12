// Original Gumu NPCs only. These immediate closures are not natural heartbeat bouts.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';
import { distribution } from './statistics.mjs';

export const gumuNpcGroup = 'gumu-npc';
export const gumuNpcCallbacks = {
    li: [['perform_action', 'strike.huan'], ['perform_action', 'strike.shi'],
        ['exert_function', 'recover'], ['exert_function', 'powerup']],
    lin: [['perform_action', 'sword.lian'], ['perform_action', 'sword.feng'],
        ['perform_action', 'sword.kai'], ['perform_action', 'unarmed.you'],
        ['perform_action', 'strike.wang'], ['exert_function', 'recover'], ['exert_function', 'powerup']],
    longnv: [['command', 'perform strike.wang and unarmed.you'], ['exert_function', 'recover'],
        ['exert_function', 'powerup'], ['perform_action', 'whip.feng twice']],
    yang: [['perform_action', 'strike.wang'], ['perform_action', 'unarmed.xiao'],
        ['perform_action', 'unarmed.tuo'], ['exert_function', 'recover'], ['exert_function', 'powerup']],
};
const identities = {
    li: { name: '李莫愁', props: { str: 30, int: 25, con: 17, dex: 35, max_qi: 6900,
        max_jing: 1400, max_neili: 5000, jiali: 150, combat_exp: 400000, gender: '女性' },
    gear: ['/d/items/whip/fuchen2', '/d/items/cloth/qing_daopao3'], wield: '' },
    lin: { name: '林朝英', props: { str: 30, int: 38, con: 34, dex: 34, max_qi: 6500,
        max_jing: 3400, max_neili: 8000, jiali: 120, combat_exp: 4000000, gender: '女性' },
    gear: ['/clone/weapon/changjian', '/clone/cloth/qingyi'], wield: '/clone/weapon/changjian' },
    longnv: { name: '小龙女', props: { str: 21, int: 30, con: 25, dex: 26, max_qi: 5000,
        max_jing: 2000, max_neili: 5000, jiali: 100, combat_exp: 3000000, gender: '女性' },
    gear: ['/clone/lonely/yinsuo', '/clone/cloth/baipao'], wield: '/clone/lonely/yinsuo' },
    yang: { name: '杨过', props: { str: 35, int: 36, con: 34, dex: 32, max_qi: 7800,
        max_jing: 6900, max_neili: 8500, jiali: 120, combat_exp: 5750000, gender: '男性' },
    gear: ['/clone/cloth/qingyi'], wield: '' },
};
const silverPath = '/clone/lonely/yinsuo';
const randomCallbacks = { li: [0, 1, 3], lin: [6], longnv: [0, 2], yang: [1, 2, 4] };
export const gumuNpcSources = [...new Set([
    ...Object.keys(identities).map(id => `kungfu/class/gumu/${id}.c`), 'kungfu/class/gumu/gumu.h',
    'inherit/char/char.c', 'inherit/char/npc.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'adm/daemons/chard.c', 'adm/daemons/combatd.c', 'feature/action.c', 'feature/attack.c',
    'feature/skill.c', 'feature/equip.c', 'feature/command.c', 'feature/attribute.c', 'feature/damage.c',
    'feature/condition.c', 'inherit/condition/poison.c', 'kungfu/condition/wudu_shenzhang.c',
    'cmds/skill/perform.c', 'include/combat.h', 'kungfu/skill/force.c', 'kungfu/skill/force/recover.c',
    ...['yunv-xinjing', 'surge-force', 'wudu-shenzhang', 'meinv-quan', 'tianluo-diwang',
        'yunv-jian', 'suxin-jian', 'quanzhen-jian', 'sad-strike', 'yinsuo-jinling'].map(s => `kungfu/skill/${s}.c`),
    ...['wudu-shenzhang/huan', 'wudu-shenzhang/shi', 'meinv-quan/you', 'tianluo-diwang/wang',
        'sad-strike/xiao', 'sad-strike/tuo', 'yunv-xinjing/powerup', 'surge-force/powerup']
        .map(s => `kungfu/skill/${s}.c`),
    'clone/lonely/yinsuo.c', 'clone/weapon/changjian.c', 'clone/weapon/changbian.c',
    'clone/cloth/qingyi.c', 'clone/cloth/baipao.c', 'd/items/whip.lpc', 'd/items/whip_data.h',
    'd/items/cloth.lpc', 'd/items/cloth_data.h',
])].sort();
export const gumuNpcReviewed = '2de5926ec8e8a296fdde2946f0ce493bd347af26fef9aaf50717e326b9475f60';
export const gumuNpcFixtureRequirements = [
    'Register only the four original NPC paths, twenty original closures and free/occupied Longnv gear contexts; no NPC qualification or equipment edits.',
    'Create original NPCs in the existing real-player command context; retain exact references, original first-load state, heartbeat/callout preparation and cleanup evidence.',
    'Observe the real non-cloned silver singleton and original companion ownership without seizing an external object; keep the companion outside the combat room.',
    'Record original closure owner/index/repr separately: expression closures render as <code>(), not source. Separate command evaluation cost from original do_perform steps; capture exact NPC attack/direct identities, apply_attack and unchanged bystanders.',
    'Use NPC before/after net resources and player gross ledgers separately; stop before natural heartbeats, and clean all sample-owned NPCs/items/callouts on every exit.',
];

function declaration(teacher, key) {
    const rows = teacher[key].filter(r => r.function === 'create' && r.evidence.path === teacher.path);
    assert.ok(rows.length, '缺少原构造声明：' + key);
    assert.ok(rows.every(r => typeof r.values[0] === 'string'
        && (typeof r.values[1] === 'string' || Number.isSafeInteger(r.values[1]))));
    return Object.fromEntries(rows.map(r => r.values.slice(0, 2)));
}

export function gumuNpcConditions(catalog, readSource, { smoke = false } = {}) {
    const teachers = catalog.teachers.filter(t => t.directory_group === 'gumu');
    assert.deepEqual(teachers.map(t => t.path).sort(), Object.keys(identities).map(id => `kungfu/class/gumu/${id}.c`).sort(),
        '四位古墓原 NPC 范围改变，须重新核对');
    const evidence = gumuNpcSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), gumuNpcReviewed,
        '古墓原 NPC 依据变化，须重新核对');
    const actor = { skills: { force: 600, dodge: 600, parry: 600 }, mappings: {}, preparations: {},
        properties: { str: 36, int: 36, con: 36, dex: 36, combat_exp: 10000000, gender: '男性', shen: 0,
            qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
            neili: 6000, max_neili: 6000, jiali: 0 } };
    const conditions = [];
    for (const id of Object.keys(identities)) {
        const teacher = teachers.find(t => t.path === `kungfu/class/gumu/${id}.c`);
        assert.equal(teacher.sha256, evidence.find(e => e.path === teacher.path).sha256, 'NPC 来源不属于当前源码');
        const original = { ...structuredClone(identities[id]), skills: declaration(teacher, 'npc_skills'),
            mappings: declaration(teacher, 'mappings'), preparations: declaration(teacher, 'preparations') };
        for (const state of id === 'longnv' ? ['free', 'occupied'] : ['original']) {
            const expected = structuredClone(original);
            if (state === 'occupied') {
                expected.gear[0] = '/clone/weapon/changbian'; expected.wield = '/clone/weapon/changbian';
            }
            for (let index = -1; index < gumuNpcCallbacks[id].length; index++) {
                const callback = index < 0 ? null : gumuNpcCallbacks[id][index];
                conditions.push({ id: `school-gumu-npc-${id}-${state}-${index < 0 ? 'loadout' : 'callback' + index}`,
                    stage: 'school', entry_id: teacher.path, method: 'npc',
                    samples: smoke ? 1 : randomCallbacks[id].includes(index) ? 100 : 2,
                    status: 'configured_not_executed', parameters: {
                        school: 'gumu', family: '古墓派', collection_group: gumuNpcGroup,
                        skill: 'npc-' + id, usage: 'original', ability: callback?.[1] ?? 'loadout',
                        level: 0, combination: `${id}-${state}`, observation: 'original_npc_immediate',
                        npc: { id, path: '/' + teacher.path.replace(/\.c$/, ''), callback_index: index,
                            callback: callback ? { entry: callback[0], argument: callback[1] } : null,
                            silver_state: state, original: expected,
                            source: { id: teacher.path, path: teacher.path, role: 'npc', sha256: teacher.sha256 } },
                        actor: structuredClone(actor), target: structuredClone(actor), action: 'observe_npc',
                        fighting: false, observe_seconds: 0, expected: 'observed', not_applicable: '',
                        qualification_sources: [...gumuNpcSources], source_evidence: structuredClone(evidence),
                        qualification_note: '原NPC构造、装备和闭包不改；固定真实USER只作防御靶。观察完整不等于绝招发动，command成本不作布尔返回；NPC净值与玩家毛账分开。原银索与原回退分账，不采自然心跳/交锋或长期撤销。MA-113只记录原表现，未修复。',
                    } });
            }
        }
    }
    return conditions;
}

export function gumuNpcEntries(conditions) {
    return [...new Map(conditions.filter(c => c.parameters.collection_group === gumuNpcGroup)
        .map(c => [c.entry_id, c.parameters.npc.source])).values()];
}

export function validateGumuNpcPlan(conditions, catalog, readSource, { smoke = false } = {}) {
    assert.equal(conditions.length, 29);
    assert.equal(new Set(conditions.map(c => c.id)).size, 29, '条件ID重复');
    for (const c of conditions) assert.match(c.id, /^[a-z][a-z0-9_-]*$/, '条件ID非法');
    assert.deepEqual(conditions, gumuNpcConditions(catalog, readSource, { smoke }), '入口、来源或既定条件被更改');
}

const own = (o, k) => Object.hasOwn(o, k);
function object(o, message) { assert.ok(o && typeof o === 'object' && !Array.isArray(o), message); }
function integer(n, message) { assert.ok(Number.isSafeInteger(n), message); }
function zero(n, message) { assert.ok(n === 0 || n === null, message); }
function busy(n) { zero(n, '原忙乱须为空或零'); }
function emptyConditions(value) {
    if (value === null || value === 0) return;
    object(value, '必须保留显式原异常状态'); assert.deepEqual(value, {});
}
function same(a, b, fields) { for (const k of fields) { assert.ok(own(a, k) && own(b, k), '缺少字段：' + k); assert.deepEqual(a[k], b[k], k); } }
function cloneName(value, program) {
    assert.ok(typeof value === 'string' && value.startsWith(program + '#')
        && /^\d+$/.test(value.slice(program.length + 1)), '必须是确切原克隆身份');
}
function numericProperty(state, key) {
    assert.ok(own(state.properties, key), '缺少原NPC属性：' + key);
    integer(state.properties[key], '属性不是实际整数：' + key);
    return state.properties[key];
}
function numericTemp(state, path) {
    let value = state.temp;
    for (const key of path.split('/')) {
        if (value === null || !own(value, key)) return 0;
        value = value[key];
    }
    if (value === null) return 0;
    integer(value, '临时属性类型错误：' + path); return value;
}
const stableFields = ['object', 'program', 'name', 'clone', 'userp', 'playerp', 'interactive', 'wizardp',
    'skills', 'mappings', 'preparations', 'inventory', 'weapon', 'weapon_object', 'secondary_weapon_object',
    'combat_callbacks', 'combat_callback_owners', 'effective_str', 'effective_dex'];

function npcState(s, p) {
    object(s, '缺少原NPC快照');
    cloneName(s.object, p.path); assert.equal(s.program, p.path);
    assert.equal(s.clone, 1); assert.equal(s.userp, 0); assert.equal(s.interactive, 0); assert.equal(s.wizardp, 0);
    assert.ok(own(s, 'playerp')); zero(s.playerp, '原NPC不能冒充玩家');
    assert.equal(s.living, 1); assert.ok(s.name.includes(p.original.name));
    object(s.properties); object(s.temp); object(s.learned);
    assert.deepEqual(s.skills, p.original.skills); assert.deepEqual(s.mappings, p.original.mappings);
    assert.deepEqual(s.preparations, p.original.preparations);
    assert.ok(own(s, 'busy')); integer(s.effective_str); integer(s.effective_dex);
    assert.ok(Array.isArray(s.callouts));
    assert.equal(s.combat_callbacks.length, gumuNpcCallbacks[p.id].length);
    assert.deepEqual(s.combat_callback_owners, gumuNpcCallbacks[p.id].map(() => s.object), '原闭包必须属于确切NPC');
    for (const [i, [entry, arg]] of gumuNpcCallbacks[p.id].entries()) {
        assert.equal(typeof s.combat_callbacks[i], 'string');
        if (entry === 'command') assert.match(s.combat_callbacks[i], /^\(:\s*<code>\(\)\s*:\)$/,
            '原表达式闭包只有不透明repr，不得伪造命令源码');
        else assert.ok(s.combat_callbacks[i].includes(entry) && s.combat_callbacks[i].includes('"' + arg + '"'),
            '原闭包被替换或索引错误');
    }
    assert.deepEqual(s.inventory.map(item => item.program).sort(), [...p.original.gear].sort(), '原配装被更改');
    assert.equal(new Set(s.inventory.map(item => item.object)).size, s.inventory.length);
    for (const item of s.inventory) {
        assert.equal(item.environment, s.object, '物品必须属于当前原NPC');
        assert.ok(typeof item.name === 'string' && item.name);
        object(item.weapon_prop); object(item.armor_prop);
        assert.ok(own(item, 'equipped') && own(item, 'skill_type'));
        assert.ok(own(item, 'consistence'), '缺少原物品耐久观察');
        const uninitializedCloth = item.program === '/clone/cloth/qingyi' && ['lin', 'yang'].includes(p.id);
        if (uninitializedCloth) {
            zero(item.consistence, '原青衣未调用setup，耐久缺省不能补为100');
        } else assert.equal(item.consistence, 100, '原正常物品setup后的耐久必须保留');
        if (item.program === silverPath) { assert.equal(item.object, silverPath); assert.equal(item.clone, 0); }
        else { cloneName(item.object, item.program); assert.equal(item.clone, 1); }
        if (item.program === p.original.wield) {
            assert.equal(item.equipped, 'wielded'); assert.equal(s.weapon_object, item.object);
            assert.equal(item.skill_type, p.id === 'lin' ? 'sword' : 'whip');
            assert.equal(item.weapon_prop.damage, item.program === silverPath ? 150 : 25);
        } else if (uninitializedCloth) {
            zero(item.equipped, '林朝英和杨过的原青衣因耐久缺省未穿戴');
            if (s.temp.armor !== undefined && s.temp.armor !== null && s.temp.armor !== 0) {
                object(s.temp.armor);
                if (own(s.temp.armor, 'cloth')) zero(s.temp.armor.cloth, '未穿青衣不能占据衣服槽');
            }
            assert.equal(numericTemp(s, 'apply/armor'), 200, '不能应用未穿青衣的护甲');
            assert.equal(numericTemp(s, 'apply/dodge'), p.id === 'lin' ? -1 : 0,
                '不能应用未穿青衣的闪躲；林朝英只保留长剑负担');
        } else if (item.program === '/d/items/whip/fuchen2') zero(item.equipped, '拂尘原来只携带');
        else assert.equal(item.equipped, 'worn');
    }
    assert.equal(s.weapon, p.original.wield ? p.id === 'lin' ? 'sword' : 'whip' : 'none');
    if (!p.original.wield) assert.equal(s.weapon_object, '');
    assert.equal(s.secondary_weapon_object, '');
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) numericProperty(s, key);
}

function preparation(n, p, raw) {
    const prep = n.preparation;
    object(prep, '缺少原构造/自主动作证据');
    assert.equal(prep.entry_player, raw.before[0].object);
    assert.ok([prep.entry_player, n.before.object].includes(prep.returned_player), '构造返回身份未经登记');
    assert.equal(prep.initializer_actor, 'not_observed', '入口身份不能假称全局动作初始化主体');
    assert.ok([0, 1].includes(prep.npc_heartbeat_before)); assert.equal(prep.npc_heartbeat_paused, 0);
    assert.equal(prep.blueprint_heartbeat, 0); assert.deepEqual(prep.constructor_callbacks, []);
    for (const key of ['loaded_before', 'loaded_after']) {
        assert.ok(Array.isArray(prep[key])); assert.equal(new Set(prep[key]).size, prep[key].length);
        for (const path of prep[key]) assert.match(path, /^\/kungfu\/skill\/[a-z0-9_/-]+$/);
    }
    assert.ok(prep.loaded_before.every(path => prep.loaded_after.includes(path)), '不得销毁重建全局动作表');
    let owners = [n.before.object], owned = [n.before.object, ...n.before.inventory.map(i => i.object)];
    if (p.id !== 'longnv') {
        assert.ok(own(n, 'silver'), '缺少显式银索缺席值'); zero(n.silver);
    }
    else {
        const s = n.silver; object(s, '缺少原银索归属');
        assert.equal(s.object, silverPath); assert.equal(s.clone, 0); assert.equal(s.state, p.silver_state);
        assert.equal(s.after_environment, s.before_environment);
        if (p.silver_state === 'free') {
            assert.equal(s.initial_environment, ''); assert.equal(s.before_environment, n.before.object);
            for (const key of ['companion_before', 'companion_after']) {
                assert.ok(own(s, key), '缺少显式占有者缺席值：' + key); zero(s[key]);
            }
        } else {
            const companion = { ...p, silver_state: 'free', original: { ...p.original,
                gear: [silverPath, '/clone/cloth/baipao'], wield: silverPath } };
            npcState(s.companion_before, companion); npcState(s.companion_after, companion);
            assert.notEqual(s.companion_before.object, n.before.object);
            assert.deepEqual(s.companion_after, s.companion_before, '原占有者不得参与战斗或被取走银索');
            assert.equal(s.initial_environment, s.companion_before.object);
            assert.equal(s.before_environment, s.companion_before.object);
            assert.notEqual(s.companion_room, n.room); assert.match(s.companion_room, /^\/tests\//);
            owners.push(s.companion_before.object);
            owned.push(s.companion_before.object, ...s.companion_before.inventory.map(i => i.object));
        }
    }
    assert.deepEqual([...prep.created_npcs].sort(), owners.sort(), '不得接管本样本外的原NPC/银索');
    assert.equal(new Set(owned).size, owned.length);
    assert.equal(n.destroyed, 1); assert.equal(n.cleanup.enemies_removed, 1);
    assert.deepEqual(n.cleanup.objects.map(o => o.object).sort(), owned.sort(), '清理必须覆盖本样本原NPC及原物品');
    for (const o of n.cleanup.objects) assert.equal(o.destroyed, 1);
    assert.deepEqual(n.cleanup.remaining_callbacks, []);
}

// Complement the common raw/player validator; never replace its provenance checks.
export function validateGumuNpcRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, gumuNpcGroup); assert.equal(condition.method, 'npc');
    assert.equal(raw.kind, 'sample'); assert.equal(raw.method, 'npc'); assert.equal(raw.condition_id, condition.id);
    if (raw.outcome === 'error') return;
    assert.equal(raw.outcome, 'observed');
    const n = raw.npc_observation, cfg = p.npc;
    object(n, '缺少原NPC观察');
    npcState(n.before, cfg); npcState(n.after, cfg); same(n.before, n.after, stableFields);
    assert.ok(raw.before?.[0]?.object && raw.after?.[0]?.object && raw.before?.[1]?.object && raw.after?.[1]?.object);
    assert.equal(raw.before[0].object, raw.after[0].object); assert.equal(n.target_object, raw.before[0].object);
    for (const [key, value] of Object.entries({ interactive: 1, userp: 1, playerp: 1, wizardp: 0, living: 1 }))
        assert.equal(raw.before[0][key], value, '必须记录真实已连接的非管理员防御靶：' + key);
    for (const [key, value] of Object.entries(p.actor.properties)) assert.equal(raw.before[0][key], value, '固定防御靶：' + key);
    assert.deepEqual(raw.before[0].skills, p.actor.skills);
    for (const skill of ['force', 'dodge', 'parry']) assert.equal(raw.before[0].effective_skills?.[skill], 300);
    busy(raw.before[0].busy); emptyConditions(raw.before[0].conditions);
    assert.equal(raw.before[0].weapon, 'none'); assert.equal(raw.before[0].temp?.apply?.armor, 100);
    assert.ok(own(raw.after[0], 'busy') && own(raw.after[0], 'conditions'));
    for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) integer(raw.after[0][resource]);
    assert.match(n.room, /^\/tests\//); preparation(n, cfg, raw);
    for (const [key, value] of Object.entries(cfg.original.props)) assert.equal(n.before.properties[key], value, key);
    assert.equal(n.before.properties.chat_chance_combat, 120);
    for (const [key, maximum] of [['qi', 'max_qi'], ['eff_qi', 'max_qi'], ['jing', 'max_jing'],
        ['eff_jing', 'max_jing'], ['neili', 'max_neili']]) assert.equal(n.before.properties[key], n.before.properties[maximum]);
    busy(n.before.busy); assert.deepEqual(n.before.learned, {}); assert.deepEqual(n.before.callouts, []);
    assert.equal(numericTemp(n.before, 'powerup'), 0); assert.equal(numericTemp(n.before, 'last_perform/sad-strike/tuo'), 0);
    assert.ok(own(n.before.properties, 'potential') && own(n.after.properties, 'potential'));
    zero(n.before.properties.potential, '原NPC潜能不得预置');
    assert.ok(own(n.before.properties, 'couple/id') && own(n.before.properties, 'static/marry'));
    if (cfg.id === 'yang') { assert.equal(n.before.properties['couple/id'], 'xiao longnv'); zero(n.before.properties['static/marry']); }
    assert.ok(typeof n.before.properties.id === 'string' && n.before.properties.id);
    same(n.before.properties, n.after.properties, ['id', 'couple/id', 'static/marry', 'chat_chance_combat']);
    assert.deepEqual(raw.after[1], raw.before[1], '旁观实验玩家不得改变');
    assert.deepEqual(raw.callbacks, [], '本组不运行自然回调');
    assert.ok(Array.isArray(raw.attacks) && Array.isArray(raw.npc_direct) && Array.isArray(n.steps));
    object(n.execution, '缺少原执行终态');
    assert.ok([0, 1].includes(n.execution.target_active_after));
    for (const event of [...raw.attacks, ...raw.npc_direct]) {
        assert.equal(event.actor, -1); assert.equal(event.actor_object, n.before.object);
        assert.equal(event.actor_program, cfg.path); assert.equal(event.target, 0);
        assert.equal(event.target_object, raw.before[0].object, '事件必须指向同一真实靶');
    }
    for (const event of raw.npc_direct) {
        integer(event.type); integer(event.damage); integer(event.percent); assert.ok(event.damage > 0);
        assert.equal(event.type, cfg.id === 'li' ? 2 : 0); assert.equal(event.percent, cfg.id === 'li' ? 100 : 120);
    }
    const index = cfg.callback_index, key = cfg.callback?.argument, command = cfg.callback?.entry === 'command';
    assert.equal(n.called, index < 0 ? 0 : 1); assert.equal(n.callback_index, index);
    assert.equal(n.callback_owner, index < 0 ? '' : n.before.object);
    assert.equal(n.callback_repr, index < 0 ? '' : n.before.combat_callbacks[index]);
    const cost = n.before.properties.neili - n.after.properties.neili;
    const directs = raw.npc_direct.length, attacks = raw.attacks.length;
    if (index < 0) {
        assert.ok(own(n, 'result'), '缺少显式未调用结果'); zero(n.result);
        assert.deepEqual(n.after, n.before); assert.equal(attacks + directs, 0);
    } else if (command) {
        integer(n.result, 'command成本必须是原整数'); assert.ok(n.result > 0, '原组合命令应被处理');
        assert.ok([0, 2].includes(n.steps.length));
        for (const [i, step] of n.steps.entries()) {
            assert.equal(step.argument, ['strike.wang', 'unarmed.you'][i]); assert.equal(step.accepted, 0);
            assert.equal(step.actor_object, n.before.object); assert.equal(step.target_object, n.target_object);
            npcState(step.before, cfg); npcState(step.after, cfg);
            // The sefun stores the NPC message, but the driver stores notify_fail only for interactives.
            // Keep the raw snapshots intact; no other state is excluded from equivalence.
            const beforeTemp = { ...step.before.temp }, afterTemp = { ...step.after.temp };
            const notice = step.after.temp.notify_fail;
            assert.ok(own(step.after.temp, 'notify_fail') && typeof notice === 'string' && notice.length > 0,
                '原拒绝必须保留实际非空 notify_fail');
            assert.equal(notice, '你必须空手才能施展「' + ['\x1b[1;37m天罗地网', '\x1b[1;32m古墓幽居'][i]
                + '\x1b[0m」。\n', '拒绝提示必须对应原子招');
            assert.ok(own(step, 'reason'), '缺少原驱动拒绝观察');
            assert.equal(step.reason, '', '非交互NPC没有驱动notify_fail文本，不能伪造终端前缀');
            if (i > 0) assert.equal(step.before.temp.notify_fail, n.steps[i - 1].after.temp.notify_fail,
                '第二招必须保留第一招实际提示后再更新');
            delete beforeTemp.notify_fail; delete afterTemp.notify_fail;
            assert.deepEqual({ ...step.after, temp: afterTemp }, { ...step.before, temp: beforeTemp });
            assert.equal(step.before.object, n.before.object);
        }
        if (n.steps.length) assert.equal(n.after.temp.notify_fail, n.steps.at(-1).after.temp.notify_fail,
            '闭包结束必须保留最后原提示');
        if (n.steps.length === 0) assert.equal(n.after.busy, 1); else busy(n.after.busy);
        assert.equal(cost, 0); assert.equal(attacks + directs, 0);
    } else {
        assert.ok([0, 1].includes(n.result)); assert.deepEqual(n.steps, []);
        const eligible = randomCallbacks[cfg.id].includes(index);
        assert.equal(n.result, eligible ? 1 : 0, '原配置可达性与分发不符');
        if (!eligible) { assert.equal(cost, 0); assert.equal(attacks + directs, 0); busy(n.after.busy); }
    }
    if (!command) assert.deepEqual(n.steps, []);
    if (key === 'powerup') {
        const level = n.before.skills[n.before.mappings.force], surge = cfg.id === 'yang';
        assert.equal(cost, surge ? 200 : 100); assert.equal(attacks + directs, 0);
        assert.equal(numericTemp(n.after, 'powerup'), 1);
        for (const stat of ['attack', 'defense']) assert.equal(numericTemp(n.after, 'apply/' + stat)
            - numericTemp(n.before, 'apply/' + stat), Math.trunc(level * (surge ? 2 / 5 : 1 / 3)));
        assert.equal(numericTemp(n.after, 'apply/unarmed_damage') - numericTemp(n.before, 'apply/unarmed_damage'),
            surge ? Math.trunc(level / 5) : 0);
        assert.ok([1, 2, 3].includes(n.after.busy)); assert.equal(n.after.callouts.length, 1);
        const timer = n.after.callouts[0]; assert.equal(timer.owner, n.before.object); assert.equal(timer.function, 'eval_function');
        integer(timer.remaining); assert.ok(timer.remaining >= 0 && timer.remaining <= level);
    } else {
        assert.deepEqual(n.after.callouts, []); assert.equal(numericTemp(n.after, 'powerup'), 0);
        for (const stat of ['attack', 'defense', 'unarmed_damage']) assert.equal(numericTemp(n.after, 'apply/' + stat), numericTemp(n.before, 'apply/' + stat));
    }
    if (cfg.id === 'li' && key === 'strike.huan') {
        assert.equal(attacks + directs, 0); assert.ok([30, 80].includes(cost));
        assert.equal(n.after.busy, cost === 80 ? 1 : 2);
        if (cost === 80) assert.equal(raw.after[0].busy, 9); else busy(raw.after[0].busy);
        for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
            assert.equal(raw.after[0][resource], raw.before[0][resource]);
    }
    if (cfg.id === 'li' && key === 'strike.shi') {
        assert.equal(attacks, 0); assert.ok(directs <= 1); assert.equal(cost, directs ? 180 : 0);
        assert.ok(directs ? [1, 2, 3].includes(n.after.busy) : n.after.busy === 2);
        if (directs) {
            object(raw.after[0].conditions);
            assert.deepEqual(Object.keys(raw.after[0].conditions), ['wudu_shenzhang']);
            const poison = raw.after[0].conditions.wudu_shenzhang;
            object(poison); integer(poison.level); integer(poison.remain);
            assert.ok(poison.level >= 180 && poison.level <= 329);
            assert.equal(poison.id, n.before.properties.id); assert.equal(poison.name, '噬心毒');
            assert.equal(poison.remain % poison.level, 0);
            assert.ok(poison.remain / poison.level >= 5 && poison.remain / poison.level <= 16);
            const wound = raw.before[0].eff_jing - raw.after[0].eff_jing;
            assert.ok(wound >= 8 && wound <= 11);
            assert.equal(raw.before[0].jing - raw.after[0].jing, wound);
            busy(raw.after[0].busy);
        } else {
            assert.equal(raw.after[0].busy, 1);
            for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(raw.after[0][resource], raw.before[0][resource]);
            emptyConditions(raw.after[0].conditions);
        }
    }
    if (!(cfg.id === 'li' && key === 'strike.shi')) {
        emptyConditions(raw.after[0].conditions);
        for (const resource of ['jing', 'eff_jing']) assert.equal(raw.after[0][resource], raw.before[0][resource]);
    }
    assert.equal(raw.after[0].neili, raw.before[0].neili);
    if (cfg.id === 'yang' && key === 'unarmed.tuo') {
        // Original AP=1157 and fixed target DP=600: even floor(AP*3/5)>DP.
        assert.equal(attacks, 0); assert.equal(directs, 1); assert.equal(cost, 520);
        assert.ok([2, 3].includes(n.after.busy)); assert.ok(numericTemp(n.after, 'last_perform/sad-strike/tuo') > 0);
    }
    if (cfg.id === 'yang' && key === 'unarmed.xiao') {
        assert.equal(directs, 0); assert.ok(attacks >= 1 && attacks <= 6);
        if (attacks < 6) assert.equal(n.execution.target_active_after, 0, '部分连击须有实际终止证据');
        assert.equal(cost, 420 + raw.attacks.filter(a => a.result === 0).length * 120);
        assert.ok([2, 3, 4, 5].includes(n.after.busy));
        for (const a of raw.attacks) {
            assert.equal(a.type, 0); assert.ok([0, -1, -2].includes(a.result));
            integer(a.damage); integer(a.apply_attack);
            assert.ok([0, 115].includes(a.apply_attack - numericTemp(n.before, 'apply/attack')));
        }
        if (attacks > 1) assert.ok(raw.attacks.every(a => a.apply_attack === raw.attacks[0].apply_attack));
        assert.ok(Object.keys(n.after.learned).every(s => s === 'unarmed'));
        const gain = n.after.learned.unarmed ?? 0; integer(gain); assert.ok(gain >= 0 && gain <= attacks);
        const potential = n.after.properties.potential ?? 0; integer(potential); assert.ok(potential >= 0 && potential <= attacks);
    } else {
        assert.deepEqual(n.after.learned, n.before.learned);
        assert.deepEqual(n.after.properties.potential, n.before.properties.potential);
    }
    for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing'])
        assert.equal(n.after.properties[resource], n.before.properties[resource], '原NPC不得被人为消耗或补足：' + resource);
    if (index < 0 || command || key === 'recover' || key === 'powerup' || !randomCallbacks[cfg.id].includes(index))
        for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            assert.ok(own(raw.before[0], resource) && own(raw.after[0], resource), '缺少真实靶资源');
            assert.equal(raw.after[0][resource], raw.before[0][resource], '未发动不得损伤或恢复真实靶');
        }
    for (const key of Object.keys(cfg.original.props).filter(k => k !== 'neili'))
        assert.equal(n.after.properties[key], n.before.properties[key], '未声明原属性变化：' + key);
}

export function gumuNpcEffects(rows, condition) {
    assert.equal(condition.parameters.collection_group, gumuNpcGroup);
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.outcome, row.raw.outcome);
        validateGumuNpcRecord(row.raw, condition);
    }
    const observed = rows.filter(row => row.raw.outcome === 'observed'), data = observed.map(row => row.raw.npc_observation);
    const command = condition.parameters.npc.callback?.entry === 'command';
    return { samples: rows.length, observed: observed.length, callbacks: data.filter(n => n.called).length,
        command_evaluation_cost: distribution(command ? data.map(n => n.result) : []),
        npc_method_returned_zero: command ? 0 : data.filter(n => n.called && n.result === 0).length,
        npc_method_returned_one: command ? 0 : data.filter(n => n.called && n.result === 1).length,
        command_steps: data.reduce((sum, n) => sum + n.steps.length, 0),
        command_steps_accepted: data.flatMap(n => n.steps).filter(s => s.accepted).length,
        attacks: observed.reduce((sum, r) => sum + r.raw.attacks.length, 0),
        direct_calls: observed.reduce((sum, r) => sum + r.raw.npc_direct.length, 0),
        direct_damage_input: distribution(observed.flatMap(r => r.raw.npc_direct.map(d => d.damage))),
        attack_results: Object.fromEntries([0, -1, -2].map(result => [result,
            observed.flatMap(r => r.raw.attacks).filter(a => a.result === result).length])),
        npc_busy: distribution(data.map(n => n.after.busy === null ? 0 : n.after.busy)),
        target_busy: distribution(observed.map(r => r.raw.after[0].busy === null ? 0 : r.raw.after[0].busy)),
        target_net_resource_loss: Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']
            .map(key => [key, distribution(observed.map(r => r.raw.before[0][key] - r.raw.after[0][key]))])),
        target_poison_observations: observed.map(r => r.raw.after[0].conditions),
        npc_net_neili_spent: distribution(data.map(n => n.before.properties.neili - n.after.properties.neili)),
        planned_xiao_attacks: condition.parameters.npc.callback?.argument === 'unarmed.xiao' ? data.length * 6 : 0,
        loadouts: data.map(n => n.before), npc_gross_resource_accounting: 'not_observed',
        natural_heartbeats: 'not_sampled', natural_powerup_expiry: 'not_sampled',
        finding: (condition.parameters.npc.id === 'lin' && [0, 1, 2].includes(condition.parameters.npc.callback_index))
            || (condition.parameters.npc.id === 'longnv' && condition.parameters.npc.callback_index === 3)
            ? 'MA-113 (original source, not repaired)' : '',
    };
}
