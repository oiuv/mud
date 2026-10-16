// Independent preparation only: original Taohua loadouts/closures, not heartbeat bouts.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';
import { distribution } from './statistics.mjs';

export const taohuaNpcGroup = 'taohua-npc';
const perform = argument => ['perform_action', argument];
const exert = argument => ['exert_function', argument];
const disciples = ['sword.sui', 'finger.tao', 'strike.dai', 'unarmed.kuang'].map(perform);
export const taohuaNpcCallbacks = {
    chen: [...['claw.duo', 'claw.zhua', 'strike.cui'].map(perform), exert('recover')],
    feng: [...disciples, exert('powerup'), exert('recover')],
    huang: [...['sword.bihai', 'sword.qing', 'sword.tian', 'finger.ding', 'finger.xiao',
        'finger.po', 'finger.zhuan'].map(perform), exert('powerup'), exert('recover')],
    lu: [...disciples, exert('powerup'), exert('recover')],
    mei: [...['claw.duo', 'claw.sha', 'strike.cui', 'whip.chan', 'whip.jiao'].map(perform), exert('recover')],
    qu: [...disciples, exert('powerup'), exert('recover')],
    rong: [...['hand.fu', 'hand.fei', 'strike.zhuan'].map(perform), exert('powerup'), exert('recover')],
};
const jade = '/clone/lonely/yuxiao', book = '/clone/lonely/book/zhenjing2';
const flower = '/d/items/throwing/taohua_ban', sword = '/clone/weapon/changjian';
const robe = '/clone/cloth/bupao', cloth = '/clone/misc/cloth';
const identities = {
    chen: { name: '陈玄风', id: 'chen xuanfeng', props: { str: 28, int: 25, con: 30, dex: 25,
        max_qi: 35000, max_jing: 23500, max_neili: 16000, jiali: 420, combat_exp: 2000000, gender: '男性' },
    gear: [book, robe], handing: '', apply: { damage: 100, unarmed_damage: 100, armor: 201, dodge: -1 } },
    feng: { name: '冯默风', id: 'feng mofeng', props: { str: 30, int: 24, con: 27, dex: 23,
        max_qi: 4200, max_jing: 2100, max_neili: 4500, jiali: 100, combat_exp: 800000, gender: '男性' },
    gear: [cloth, sword], handing: '', apply: { damage: 0, unarmed_damage: 0, armor: 1, dodge: -1 } },
    huang: { name: '黄药师', id: 'huang yaoshi', props: { str: 40, int: 40, con: 40, dex: 40,
        max_qi: 7000, max_jing: 5000, max_neili: 7000, jiali: 200, combat_exp: 4000000, gender: '男性' },
    gear: [jade, '/d/items/cloth/qing_bupao'], handing: jade,
    apply: { damage: 100, unarmed_damage: 100, armor: 201, dodge: 1 } },
    lu: { name: '陆乘风', id: 'lu chengfeng', props: { str: 24, int: 30, con: 25, dex: 21,
        max_qi: 4500, max_jing: 2500, max_neili: 5000, jiali: 120, combat_exp: 1000000, gender: '男性' },
    gear: [cloth, sword], handing: '', apply: { damage: 0, unarmed_damage: 0, armor: 1, dodge: -1 } },
    mei: { name: '梅超风', id: 'mei chaofeng', props: { str: 29, int: 32, con: 35, dex: 31,
        max_qi: 4500, max_jing: 3000, max_neili: 5000, jiali: 200, combat_exp: 1800000, gender: '女性' },
    gear: [robe], handing: '', apply: { damage: 100, unarmed_damage: 100, armor: 201, dodge: -1 } },
    qu: { name: '曲灵风', id: 'qu lingfeng', props: { str: 30, int: 24, con: 27, dex: 23,
        max_qi: 4500, max_jing: 2500, max_neili: 5000, jiali: 120, combat_exp: 1000000, gender: '男性' },
    gear: [cloth, sword], handing: '', apply: { damage: 0, unarmed_damage: 0, armor: 1, dodge: -1 } },
    rong: { name: '黄蓉', id: 'huang rong', props: { str: 28, int: 40, con: 30, dex: 30,
        max_qi: 4800, max_jing: 3500, max_neili: 5500, jiali: 200, combat_exp: 3000000, gender: '女性' },
    gear: ['/d/items/armor/ruanwei_jia', '/d/items/headwear/jindai2'], handing: '',
    apply: { damage: 100, unarmed_damage: 100, armor: 276, dodge: -5 } },
};
const skillNames = ['anying-fuxiang', 'bibo-shengong', 'bihai-chaosheng', 'calligraphy', 'canglang-zhi',
    'chess', 'chuixiao-jifa', 'claw', 'cooking', 'count', 'cuixin-zhang', 'dagou-bang', 'dodge',
    'drawing', 'finger', 'force', 'hand', 'jingluo-xue', 'jiuyin-baiguzhao', 'lanhua-shou', 'literate',
    'luoying-shenjian', 'luoying-shenzhang', 'luoying-xinfa', 'mantianhuayu-zhen', 'martial-cognize',
    'mathematics', 'medical', 'parry', 'pikong-zhang', 'qimen-wuxing', 'staff', 'strike', 'sword',
    'tanzhi-shentong', 'taohua-yaoli', 'taohua-yuan', 'throwing', 'unarmed', 'whip', 'xiaoyaoyou',
    'xuanfeng-tui', 'yinlong-bian', 'yuxiao-jian'];
export const taohuaNpcSources = [...new Set([
    ...Object.keys(identities).map(id => `kungfu/class/taohua/${id}.c`),
    ...skillNames.map(name => `kungfu/skill/${name}.c`),
    ...['jiuyin-baiguzhao/duo', 'jiuyin-baiguzhao/zhua', 'cuixin-zhang/cui', 'canglang-zhi/tao',
        'pikong-zhang/dai', 'xuanfeng-tui/kuang', 'lanhua-shou/fu', 'lanhua-shou/fei',
        'luoying-shenzhang/zhuan', 'luoying-shenjian/sui', 'yuxiao-jian/bihai', 'yuxiao-jian/qing',
        'yuxiao-jian/tian', 'tanzhi-shentong/ding', 'tanzhi-shentong/xiao', 'tanzhi-shentong/po',
        'tanzhi-shentong/zhuan', 'bibo-shengong/powerup', 'force/recover'].map(s => `kungfu/skill/${s}.c`),
    'inherit/char/char.c', 'inherit/char/npc.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'adm/daemons/chard.c', 'adm/daemons/combatd.c', 'adm/daemons/itemd.c',
    ...['action', 'attack', 'skill', 'equip', 'command', 'attribute', 'damage', 'condition', 'dBase',
        'move'].map(s => `feature/${s}.c`),
    'inherit/condition/poison.c', 'kungfu/condition/cuixin_zhang.c', 'include/combat.h',
    'inherit/misc/equip.c', 'inherit/weapon/xsword.c', 'inherit/weapon/sword.c',
    'inherit/weapon/throwing.c', 'inherit/armor/cloth.c', 'inherit/armor/armor.c', 'inherit/armor/head.c',
    'inherit/item/combined.c', 'clone/lonely/yuxiao.c', 'clone/lonely/book/zhenjing2.c',
    'clone/weapon/changjian.c', 'clone/cloth/bupao.c', 'clone/misc/cloth.c',
    ...['cloth', 'armor', 'headwear', 'throwing'].flatMap(s => [`d/items/${s}.lpc`, `d/items/${s}_data.h`]),
])].sort();
export const taohuaNpcAbsentSources = ['luoying-xinfa/powerup', 'force/powerup',
    'jiuyin-baiguzhao/sha', 'yinlong-bian/chan', 'yinlong-bian/jiao']
    .flatMap(path => ['c', 'lpc'].map(ext => `kungfu/skill/${path}.${ext}`));
export const taohuaNpcReviewed = 'be52a72ad6ed70fcd7c1b99366b57ae4f3acfae599a6e4ad73bbb5f959894a71';
export const taohuaNpcFixtureRequirements = [
    'Append seven exact original NPC paths; evaluate the original closure by index/owner. Do not wield carried swords, replace missing methods, add powers or run player perform in place of NPC methods.',
    'Reuse real USER target and original create/first-load evidence; pause only autonomous heartbeats and retain exact sample-owned references. Keep Chen/Mei separate so original kill_ob does not enlist the other.',
    'Observe original non-cloned zhenjing2 and yuxiao; the occupied jade state uses an original Huang companion outside the room. Record exact ownership and destroy only sample-owned references on every exit.',
    'Extend this group inventory snapshot by actual query_amount()/weight and handing_object. Original flower count is 50; one po consumes one, not a last-ammunition or natural-destruction experiment.',
    'Reuse NPC actor=-1 attack/direct observation with exact actor/target identity. NPC net resources are not a gross ledger; keep target USER ledgers separate.',
    'For ding_end/cuixin_end retain the original call_out return handle, actor/target, function, and original delay evaluated once. Remove that handle only; do not guess target arguments from call_out_info (this driver returns 3 columns). Preserve callback state before cleanup and report removal separately.',
    'Report method acceptance, direct inputs, ordinary attack outcomes, control, poison, learning and net costs separately. No natural expiry, heartbeat choice, teaching, full bout or cross-school ranking.',
];

function declaration(teacher, key) {
    const rows = teacher[key].filter(r => r.function === 'create' && r.evidence.path === teacher.path);
    assert.ok(rows.length, '缺少原构造声明：' + key);
    assert.ok(rows.every(r => typeof r.values[0] === 'string'
        && (typeof r.values[1] === 'string' || Number.isSafeInteger(r.values[1]))));
    return Object.fromEntries(rows.map(r => r.values.slice(0, 2)));
}

function effect(id, index, state) {
    if (index < 0) return 'loadout';
    const key = taohuaNpcCallbacks[id][index][1];
    if (key === 'recover') return 'refused';
    if (key === 'powerup') return ['huang', 'rong'].includes(id) ? 'powerup' : 'refused';
    if (['chen', 'mei'].includes(id)) return ({ 'claw.duo': 'duo', 'claw.zhua': 'zhua', 'strike.cui': 'cui' })[key] ?? 'refused';
    if (id === 'huang') return ({ 'sword.bihai': state === 'free' ? 'bihai' : 'refused',
        'finger.ding': 'ding', 'finger.xiao': 'xiao', 'finger.po': state === 'occupied' ? 'po' : 'refused',
        'finger.zhuan': 'zhuan' })[key] ?? 'refused';
    if (id === 'rong') return ({ 'hand.fu': 'fu', 'hand.fei': 'fei', 'strike.zhuan': 'qimen' })[key];
    if (id === 'qu') return key === 'finger.tao' ? 'tao' : 'refused';
    return ({ 'strike.dai': 'dai', 'unarmed.kuang': 'kuang' })[key] ?? 'refused';
}

export function taohuaNpcConditions(catalog, readSource, { smoke = false } = {}) {
    const teachers = catalog.teachers.filter(t => t.directory_group === 'taohua');
    assert.deepEqual(teachers.map(t => t.path).sort(), Object.keys(identities).map(id => `kungfu/class/taohua/${id}.c`).sort());
    const evidence = taohuaNpcSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), taohuaNpcReviewed,
        '原桃花NPC依据已变，须重新核对');
    for (const path of taohuaNpcAbsentSources) assert.throws(() => readSource(path),
        error => error?.code === 'ENOENT', '原缺失入口现在存在或不可核验：' + path);
    const actor = { skills: { force: 600, dodge: 600, parry: 600 }, mappings: {}, preparations: {},
        properties: { str: 36, int: 36, con: 36, dex: 36, combat_exp: 10000000, gender: '男性', shen: 0,
            qi: 100000, eff_qi: 100000, max_qi: 100000, jing: 100000, eff_jing: 100000, max_jing: 100000,
            neili: 10000, max_neili: 10000, jiali: 0 } };
    const conditions = [];
    for (const id of Object.keys(identities)) {
        const teacher = teachers.find(t => t.path === `kungfu/class/taohua/${id}.c`);
        assert.equal(teacher.sha256, evidence.find(e => e.path === teacher.path).sha256);
        const original = { ...structuredClone(identities[id]), skills: declaration(teacher, 'npc_skills'),
            mappings: declaration(teacher, 'mappings'), preparations: declaration(teacher, 'preparations') };
        for (const state of id === 'huang' ? ['free', 'occupied'] : ['original']) {
            const expected = structuredClone(original);
            if (state === 'occupied') { expected.gear[0] = flower; expected.handing = flower; }
            const indices = state === 'occupied' ? [-1, 0, 5] : [-1, ...taohuaNpcCallbacks[id].map((_, i) => i)];
            for (const index of indices) {
                const callback = index < 0 ? null : taohuaNpcCallbacks[id][index], kind = effect(id, index, state);
                const repeated = !['chen', 'mei'].includes(id) && !['loadout', 'refused', 'fu'].includes(kind);
                conditions.push({ id: `school-taohua-npc-${id}-${state}-${index < 0 ? 'loadout' : 'callback' + index}`,
                    stage: 'school', entry_id: teacher.path, method: 'npc', samples: smoke ? 1 : repeated ? 100 : 2,
                    status: 'configured_not_executed', parameters: {
                        school: 'taohua', family: '桃花岛', collection_group: taohuaNpcGroup,
                        skill: 'npc-' + id, usage: 'original', ability: callback?.[1] ?? 'loadout', level: 0,
                        combination: `${id}-${state}`, observation: 'original_npc_immediate',
                        npc: { id, path: '/' + teacher.path.replace(/\.c$/, ''), callback_index: index,
                            callback: callback ? { entry: callback[0], argument: callback[1] } : null,
                            singleton_state: state, effect: kind, original: expected,
                            source: { id: teacher.path, path: teacher.path, role: 'npc', sha256: teacher.sha256 } },
                        actor: structuredClone(actor), target: structuredClone(actor), action: 'observe_npc',
                        fighting: false, observe_seconds: 0, expected: 'observed', not_applicable: '',
                        qualification_sources: [...taohuaNpcSources], source_evidence: structuredClone(evidence),
                        absent_sources: [...taohuaNpcAbsentSources],
                        qualification_note: '原NPC配装与42闭包不改；仅新增黄药师玉箫占用后的原回退三条件。观察成功不等于方法受理/命中，NPC净资源不是毛费。陈梅九阴只核原配置，缺失原入口与未持器照原返回；无交锋/教学/自然心跳及解除。',
                    } });
            }
        }
    }
    return conditions;
}

export function taohuaNpcEntries(conditions) {
    return [...new Map(conditions.filter(c => c.parameters.collection_group === taohuaNpcGroup)
        .map(c => [c.entry_id, c.parameters.npc.source])).values()];
}
export function validateTaohuaNpcPlan(conditions, catalog, readSource, { smoke = false } = {}) {
    assert.equal(conditions.length, 52); assert.equal(new Set(conditions.map(c => c.id)).size, 52);
    for (const c of conditions) assert.match(c.id, /^[a-z][a-z0-9_-]*$/);
    assert.deepEqual(conditions, taohuaNpcConditions(catalog, readSource, { smoke }));
}

const own = (o, k) => Object.hasOwn(o, k);
function map(value, message) { assert.ok(value && typeof value === 'object' && !Array.isArray(value), message); }
function integer(value, message) { assert.ok(Number.isSafeInteger(value), message); return value; }
function range(value, low, high, message) { integer(value, message); assert.ok(value >= low && value <= high, message); }
function zero(value, message) { assert.ok(value === 0 || value === null, message); }
function absent(o, key) { assert.ok(own(o, key), '缺少显式空值：' + key); zero(o[key], key); }
function number(value) { if (value === null) return 0; return integer(value); }
function temp(s, path) {
    let value = s.temp;
    for (const key of path.split('/')) { if (value === null || !own(value, key)) return 0; value = value[key]; }
    return number(value);
}
function empty(value) { if (value === null || value === 0) return; map(value); assert.deepEqual(value, {}); }
function same(a, b, fields) { for (const key of fields) { assert.ok(own(a, key) && own(b, key), key); assert.deepEqual(a[key], b[key], key); } }
function cloneName(value, program) { assert.match(value, new RegExp('^' + program + '#[0-9]+$')); }
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const effective = (s, skill) => Math.trunc((s.skills[skill] ?? 0) / 2)
    + (s.skills[s.mappings[skill]] ?? 0) + temp(s, 'apply/' + skill);

function npcState(s, p, after = false) {
    map(s); cloneName(s.object, p.path); assert.equal(s.program, p.path);
    for (const [key, expected] of Object.entries({ clone: 1, userp: 0, interactive: 0, wizardp: 0, living: 1 })) assert.equal(s[key], expected);
    absent(s, 'playerp'); assert.ok(s.name.includes(p.original.name));
    map(s.properties); map(s.temp); map(s.temp.apply); map(s.learned);
    for (const [key, expected] of Object.entries(p.original.props)) assert.equal(s.properties[key], expected, '原属性：' + key);
    assert.equal(s.properties.id, p.original.id); assert.equal(s.properties.chat_chance_combat, 120);
    map(s.properties.family); assert.equal(s.properties.family.family_name, '桃花岛');
    assert.equal(s.properties.family.generation, p.id === 'huang' ? 1 : 2);
    assert.equal(s.properties.family.title, p.id === 'huang' ? '岛主' : p.id === 'rong' ? '爱女'
        : ['chen', 'mei'].includes(p.id) ? '被逐弟子' : '弟子');
    assert.deepEqual(s.skills, p.original.skills); assert.deepEqual(s.mappings, p.original.mappings);
    assert.deepEqual(s.preparations, p.original.preparations);
    for (const key of resources) integer(s.properties[key]);
    assert.ok(own(s, 'busy')); range(number(s.busy), 0, 20);
    assert.ok(Array.isArray(s.callouts));
    const handLevel = Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => s.skills[k] ?? 0));
    assert.equal(s.effective_str, s.properties.str + Math.trunc(handLevel / 10) + temp(s, 'str'));
    assert.equal(s.effective_dex, s.properties.dex + Math.trunc(s.skills.dodge / 10) + temp(s, 'dex'));
    assert.equal(s.combat_callbacks.length, taohuaNpcCallbacks[p.id].length);
    assert.deepEqual(s.combat_callback_owners, s.combat_callbacks.map(() => s.object));
    for (const [i, [entry, arg]] of taohuaNpcCallbacks[p.id].entries()) {
        assert.equal(typeof s.combat_callbacks[i], 'string');
        assert.match(s.combat_callbacks[i], new RegExp('^\\(:\\s*' + entry + ',\\s*"' + arg.replace('.', '\\.') + '"\\s*:\\)$'));
    }
    assert.equal(s.weapon, 'none'); assert.equal(s.weapon_object, ''); assert.equal(s.secondary_weapon_object, '');
    assert.ok(own(s, 'handing_object'));
    assert.deepEqual(s.inventory.map(i => i.program).sort(), [...p.original.gear].sort());
    assert.equal(new Set(s.inventory.map(i => i.object)).size, s.inventory.length);
    for (const item of s.inventory) {
        assert.equal(item.environment, s.object); assert.ok(typeof item.name === 'string' && item.name);
        map(item.weapon_prop); map(item.armor_prop);
        if ([jade, book].includes(item.program)) { assert.equal(item.clone, 0); assert.equal(item.object, item.program); }
        else { assert.equal(item.clone, 1); cloneName(item.object, item.program); }
        const isWeapon = [jade, flower, sword].includes(item.program);
        if (isWeapon) assert.equal(item.skill_type, item.program === flower ? 'throwing' : 'sword');
        else absent(item, 'skill_type');
        if (isWeapon || item.program === book) absent(item, 'equipped'); else assert.equal(item.equipped, 'worn');
        if (item.program === book) absent(item, 'consistence'); else assert.equal(item.consistence, 100);
        if (item.program === flower) {
            assert.equal(item.amount, after && p.effect === 'po' ? 49 : 50); assert.equal(item.weight, item.amount);
            assert.equal(item.weapon_prop.damage, 2);
        } else {
            absent(item, 'amount');
            const weights = { [jade]: 500, [book]: 500, [sword]: 5000, [robe]: 3000, [cloth]: 3000,
                '/d/items/cloth/qing_bupao': 1000, '/d/items/armor/ruanwei_jia': 1000, '/d/items/headwear/jindai2': 50 };
            assert.equal(item.weight, weights[item.program]);
        }
        if (item.program === jade || item.program === sword) assert.equal(item.weapon_prop.damage, item.program === jade ? 81 : 25);
    }
    assert.equal(s.handing_object, s.inventory.find(i => i.program === p.original.handing)?.object ?? '');
    for (const [key, value] of Object.entries(p.original.apply)) assert.equal(temp(s, 'apply/' + key), value);
}

function preparation(n, p, raw) {
    const prep = n.preparation; map(prep);
    assert.equal(prep.entry_player, raw.before[0].object);
    assert.ok([prep.entry_player, n.before.object].includes(prep.returned_player));
    assert.equal(prep.initializer_actor, 'not_observed'); range(prep.npc_heartbeat_before, 0, 1);
    assert.equal(prep.npc_heartbeat_paused, 0); assert.equal(prep.blueprint_heartbeat, 0);
    assert.deepEqual(prep.constructor_callbacks, []);
    for (const key of ['loaded_before', 'loaded_after']) {
        assert.ok(Array.isArray(prep[key])); assert.equal(new Set(prep[key]).size, prep[key].length);
        for (const path of prep[key]) assert.match(path, /^\/kungfu\/skill\/[a-z0-9_/-]+$/);
    }
    assert.ok(prep.loaded_before.every(path => prep.loaded_after.includes(path)));
    const owners = [n.before.object], owned = [n.before.object, ...n.before.inventory.map(i => i.object)];
    assert.ok(Array.isArray(n.singletons)); assert.equal(n.singletons.length, ['huang', 'chen'].includes(p.id) ? 1 : 0);
    if (n.singletons.length) {
        const s = n.singletons[0], path = p.id === 'huang' ? jade : book;
        assert.equal(s.object, path); assert.equal(s.clone, 0);
        const occupied = p.singleton_state === 'occupied'; assert.equal(s.state, occupied ? 'occupied' : 'free');
        assert.equal(s.before_environment, s.after_environment);
        if (!occupied) {
            assert.equal(s.initial_environment, ''); assert.equal(s.before_environment, n.before.object);
            absent(s, 'companion_before'); absent(s, 'companion_after'); assert.equal(s.companion_room, '');
        } else {
            const companion = { ...p, singleton_state: 'free', effect: 'loadout',
                original: { ...p.original, gear: [jade, '/d/items/cloth/qing_bupao'], handing: jade } };
            npcState(s.companion_before, companion); npcState(s.companion_after, companion);
            assert.notEqual(s.companion_before.object, n.before.object);
            assert.deepEqual(s.companion_after, s.companion_before);
            assert.equal(s.initial_environment, s.companion_before.object); assert.equal(s.before_environment, s.companion_before.object);
            assert.match(s.companion_room, /^\/tests\//); assert.notEqual(s.companion_room, n.room);
            owners.push(s.companion_before.object); owned.push(s.companion_before.object, ...s.companion_before.inventory.map(i => i.object));
        }
    }
    assert.deepEqual([...prep.created_npcs].sort(), owners.sort()); assert.equal(new Set(owned).size, owned.length);
    assert.equal(n.destroyed, 1); assert.equal(n.cleanup.enemies_removed, 1);
    assert.deepEqual(n.cleanup.objects.map(o => o.object).sort(), owned.sort());
    for (const o of n.cleanup.objects) assert.equal(o.destroyed, 1);
    assert.deepEqual(n.cleanup.remaining_callbacks, []);
}

function timers(n, target, kind, hit, level) {
    assert.ok(Array.isArray(n.effect_callouts), '缺少技能所有者回调及精确清理证据');
    const delayed = hit && ['ding', 'cui'].includes(kind);
    assert.equal(n.effect_callouts.length, delayed ? 1 : 0);
    if (!delayed) return;
    const timer = n.effect_callouts[0];
    assert.equal(timer.owner, kind === 'ding' ? '/kungfu/skill/tanzhi-shentong/ding' : '/kungfu/skill/cuixin-zhang/cui');
    assert.equal(timer.function, kind === 'ding' ? 'ding_end' : 'cuixin_end');
    assert.equal(timer.actor_object, n.before.object); assert.equal(timer.target_object, target.object);
    range(timer.handle, 1, Number.MAX_SAFE_INTEGER, '必须记录原call_out返回句柄');
    range(timer.delay, kind === 'ding' ? 1 : 5, kind === 'ding' ? 5 : 4 + Math.trunc(Math.trunc(level / 8) / 5));
    assert.equal(timer.fired, 0); range(timer.removed_remaining, 0, timer.delay); assert.deepEqual(timer.remaining_after, []);
}

// Complements common provenance/USER damage-ledger validation. No raw.parameters dependency.
export function validateTaohuaNpcRecord(raw, condition) {
    const p = condition.parameters, cfg = p.npc, kind = cfg.effect;
    assert.equal(p.collection_group, taohuaNpcGroup); assert.equal(condition.method, 'npc');
    assert.equal(raw.kind, 'sample'); assert.equal(raw.method, 'npc'); assert.equal(raw.condition_id, condition.id);
    if (raw.outcome === 'error') return;
    assert.equal(raw.outcome, 'observed'); const n = raw.npc_observation; map(n);
    npcState(n.before, cfg); npcState(n.after, cfg, true);
    same(n.before, n.after, ['object', 'program', 'name', 'clone', 'userp', 'playerp', 'interactive', 'wizardp',
        'skills', 'mappings', 'preparations', 'weapon', 'weapon_object', 'secondary_weapon_object', 'handing_object',
        'combat_callbacks', 'combat_callback_owners', 'effective_str', 'effective_dex']);
    const oldGear = structuredClone(n.before.inventory), newGear = structuredClone(n.after.inventory);
    if (kind === 'po') for (const item of newGear) if (item.program === flower) { item.amount++; item.weight++; }
    assert.deepEqual(newGear, oldGear, '原物品身份/属性只允许单枚花瓣消耗');
    assert.equal(raw.before.length, 2); assert.equal(raw.after.length, 2);
    const target = raw.before[0], final = raw.after[0];
    assert.equal(target.object, final.object); assert.equal(n.target_object, target.object);
    for (const [key, value] of Object.entries({ userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1 })) {
        assert.equal(target[key], value); assert.equal(final[key], value);
    }
    for (const [key, value] of Object.entries(p.actor.properties)) assert.equal(target[key], value);
    assert.deepEqual(target.skills, p.actor.skills); assert.deepEqual(final.skills, target.skills);
    for (const key of ['force', 'dodge', 'parry']) assert.equal(target.effective_skills[key], 300);
    assert.equal(target.weapon, 'none'); assert.equal(final.weapon, 'none');
    map(target.temp); map(target.temp.apply); map(final.temp); map(final.temp.apply);
    assert.equal(temp(target, 'apply/armor'), 100);
    assert.equal(temp(target, 'guarding'), 0); absent(target, 'busy'); assert.ok(own(target, 'conditions')); empty(target.conditions);
    assert.ok(own(final, 'busy') && own(final, 'conditions')); range(number(final.busy), 0, 14);
    for (const key of resources) range(final[key], 1, target[key], '固定高资源靶不应死亡或被额外恢复：' + key);
    assert.ok(final.qi <= final.eff_qi && final.jing <= final.eff_jing);
    assert.deepEqual(raw.after[1], raw.before[1], '另一USER只旁观'); assert.deepEqual(raw.callbacks, []);
    assert.match(n.room, /^\/tests\//); preparation(n, cfg, raw);
    for (const [key, maximum] of [['qi', 'max_qi'], ['eff_qi', 'max_qi'], ['jing', 'max_jing'],
        ['eff_jing', 'max_jing'], ['neili', 'max_neili']]) assert.equal(n.before.properties[key], n.before.properties[maximum]);
    absent(n.before, 'busy'); assert.deepEqual(n.before.learned, {}); assert.deepEqual(n.before.callouts, []);
    absent(n.before.properties, 'potential'); assert.ok(own(n.after.properties, 'potential'));
    for (const key of ['powerup', 'no_perform', 'no_exert', 'cuixin']) assert.equal(temp(n.before, key), 0);
    assert.deepEqual(n.steps, []); assert.equal(n.execution.target_active_after, 1);
    assert.ok(Array.isArray(raw.attacks) && Array.isArray(raw.npc_direct));
    for (const e of [...raw.attacks, ...raw.npc_direct]) {
        assert.equal(e.actor, -1); assert.equal(e.actor_object, n.before.object); assert.equal(e.actor_program, cfg.path);
        assert.equal(e.target, 0); assert.equal(e.target_object, target.object);
    }
    for (const e of raw.attacks) {
        assert.equal(e.type, 0); assert.ok([0, -1, -2].includes(e.result)); range(e.damage, 0, 100000); integer(e.apply_attack);
    }
    assert.equal(n.called, cfg.callback_index < 0 ? 0 : 1); assert.equal(n.callback_index, cfg.callback_index);
    assert.equal(n.callback_owner, n.called ? n.before.object : '');
    assert.equal(n.callback_repr, n.called ? n.before.combat_callbacks[cfg.callback_index] : '');
    if (n.called) assert.equal(n.result, kind === 'refused' ? 0 : 1, '原闭包受理不等于命中'); else absent(n, 'result');
    if (n.called && ['chen', 'mei'].includes(cfg.id))
        assert.equal(n.after.temp.my_killer, target.object, '保留原kill_ob登记但不召入另一原NPC');
    const cost = n.before.properties.neili - n.after.properties.neili;
    const attacks = raw.attacks.length, hit = raw.npc_direct.length === 1, direct = raw.npc_direct[0];
    assert.ok(raw.npc_direct.length <= 1);
    const loss = key => target[key] - final[key];
    const jiali = n.before.properties.jiali, level = n.before.skills[n.before.mappings.force];
    let expectedCost = 0, expectedBusy = [0], targetBusy = [0], damageRange = null, percents = null, damageType = 0;
    if (['loadout', 'refused'].includes(kind)) assert.equal(attacks + raw.npc_direct.length, 0);
    if (kind === 'loadout') assert.deepEqual(n.after, n.before);
    if (kind === 'powerup') {
        expectedCost = 100; expectedBusy = [1, 2, 3]; assert.equal(attacks + raw.npc_direct.length, 0);
        assert.equal(temp(n.after, 'powerup'), 1); assert.equal(n.after.callouts.length, 1);
        const timer = n.after.callouts[0]; assert.equal(timer.owner, n.before.object); assert.equal(timer.function, 'eval_function');
        range(timer.remaining, 0, level);
    } else { assert.equal(temp(n.after, 'powerup'), 0); assert.deepEqual(n.after.callouts, []); }
    for (const key of ['attack', 'defense']) assert.equal(temp(n.after, 'apply/' + key) - temp(n.before, 'apply/' + key),
        kind === 'powerup' ? Math.trunc(level / 3) : 0, '临时加成必须恢复或准确保留');
    if (kind === 'fu') { expectedCost = 100; expectedBusy = [1]; targetBusy = [14]; }
    if (['kuang', 'fei'].includes(kind)) {
        assert.equal(attacks, 6, '高资源正常靶的原六击必须完整'); assert.equal(raw.npc_direct.length, 0);
        const landed = raw.attacks.filter(e => e.result === 0).length;
        expectedCost = (kind === 'kuang' ? 100 : 150) + landed * jiali;
        const bonus = kind === 'kuang' ? Math.trunc(n.before.skills['xuanfeng-tui'] / 4) : Math.trunc(n.before.skills['lanhua-shou'] / 5);
        const delta = raw.attacks[0].apply_attack - temp(n.before, 'apply/attack');
        assert.ok((kind === 'kuang' ? [bonus] : [0, bonus]).includes(delta));
        assert.ok(raw.attacks.every(e => e.apply_attack === raw.attacks[0].apply_attack));
        if (kind === 'fei') {
            const extra = cost - expectedCost; range(extra, 0, attacks * 300); assert.equal(extra % 300, 0);
            // Original query_action may spend 300 even on a subsequently dodged/parried attack.
            expectedCost += extra; expectedBusy = [0, 1, 2];
        } else { expectedBusy = [1, 2, 3, 4, 5, 6]; targetBusy = [0, 1]; }
        const allowed = kind === 'fei' ? ['hand'] : ['unarmed', 'strike'];
        assert.ok(Object.keys(n.after.learned).every(key => allowed.includes(key)));
        for (const value of Object.values(n.after.learned)) range(value, 0, attacks);
        assert.ok(Object.values(n.after.learned).reduce((sum, value) => sum + value, 0) <= attacks);
        range(number(n.after.properties.potential), 0, attacks);
    } else {
        assert.equal(attacks, 0); assert.deepEqual(n.after.learned, n.before.learned);
        assert.deepEqual(n.after.properties.potential, n.before.properties.potential);
    }
    if (kind === 'tao') { damageRange = [140, 239]; percents = [30]; expectedCost = hit ? 80 + jiali : 50; expectedBusy = [hit ? 2 : 3]; }
    if (kind === 'dai') {
        const base = Math.trunc(effective(n.before, 'strike') / 2); damageRange = [base, base * 2 - 1]; percents = [20];
        expectedCost = hit ? 50 + jiali : 30; expectedBusy = [hit ? 2 : 3];
    }
    if (kind === 'qimen') {
        damageRange = [180, 359]; percents = [30]; expectedCost = 150 + (hit ? jiali : 0);
        expectedBusy = [hit ? 2 : 3]; targetBusy = hit ? [2, 3, 4] : [0];
    }
    if (kind === 'duo') {
        const base = Math.trunc((effective(n.before, 'claw') + n.before.effective_str * 5 + effective(n.before, 'force')) / 3);
        damageRange = [base, base * 2 - 1]; percents = [55, 65];
        expectedCost = hit ? (direct.percent === 55 ? 100 : 250) + jiali : 250;
        expectedBusy = [hit && direct.percent === 55 ? 2 : 3];
    }
    if (kind === 'zhua') {
        damageRange = [495, 989]; percents = [70]; expectedCost = hit ? 230 + jiali : 50;
        expectedBusy = [2]; targetBusy = hit ? [1, 2, 3] : [0];
    }
    if (kind === 'cui') {
        const ap = effective(n.before, 'strike') + effective(n.before, 'force');
        damageRange = [Math.trunc(ap / 2), Math.trunc(ap / 2) + ap - 1]; percents = Array.from({ length: 15 }, (_, i) => i + 40);
        damageType = 2; expectedCost = hit ? 260 + jiali : 120; expectedBusy = [hit ? 2 : 3];
        if (hit) {
            map(final.conditions); assert.deepEqual(Object.keys(final.conditions), ['cuixin_zhang']);
            const poison = final.conditions.cuixin_zhang, lvl = n.before.skills['cuixin-zhang']; map(poison);
            range(poison.level, jiali, jiali * 2 - 1); integer(poison.remain); assert.equal(poison.remain % poison.level, 0);
            range(poison.remain / poison.level, Math.trunc(lvl / 50), Math.trunc(lvl / 50) + Math.trunc(lvl / 20) - 1);
            assert.equal(poison.id, n.before.properties.id); assert.equal(poison.name, '催心掌掌力');
            assert.equal(temp(final, 'cuixin'), 1); assert.equal(temp(final, 'apply/parry') - temp(target, 'apply/parry'), -Math.trunc(lvl / 8));
        }
    }
    if (kind === 'ding') {
        damageRange = [127, 381]; percents = [0]; damageType = 2;
        expectedCost = hit ? 200 + jiali : 150; expectedBusy = [hit ? 2 : 1];
        assert.equal(temp(final, 'no_perform'), hit ? 1 : 0); assert.equal(loss('eff_qi'), 0);
    }
    if (kind === 'zhuan') {
        damageRange = [1345, 2689]; percents = Array.from({ length: 35 }, (_, i) => i + 100);
        if (hit) range(cost, 200 + jiali, 549 + jiali); else assert.equal(cost, 200);
        expectedCost = cost; expectedBusy = [hit ? 3 : 2];
    }
    if (damageRange) {
        if (hit) { range(direct.damage, ...damageRange); assert.ok(percents.includes(direct.percent)); assert.equal(direct.type, damageType); }
    } else assert.equal(raw.npc_direct.length, 0);
    if (kind === 'bihai') {
        expectedCost = 200; expectedBusy = [1, 2, 3]; range(loss('jing'), 1617, 3230);
        assert.equal(loss('eff_jing'), Math.trunc(loss('jing') * 2 / 3));
    }
    if (kind === 'xiao') {
        expectedBusy = [loss('neili') ? 3 : 4];
        if (loss('neili')) {
            assert.equal(loss('neili') % 3, 0); const damage = loss('neili') / 3; range(damage, 510, 1019);
            assert.equal(loss('jing'), Math.trunc(damage * 4 / 3)); assert.equal(loss('eff_jing'), Math.trunc(damage / 3));
        } else { assert.equal(loss('jing'), 0); assert.equal(loss('eff_jing'), 0); }
    } else assert.equal(loss('neili'), 0);
    if (kind === 'po') {
        expectedCost = 300; expectedBusy = [loss('eff_qi') ? 2 : 3];
        if (loss('eff_qi')) range(loss('eff_qi'), 510, 1019);
        assert.equal(loss('qi'), loss('eff_qi'));
    }
    assert.equal(cost, expectedCost, 'NPC即时内力净差与原可达路径不符');
    assert.ok(expectedBusy.includes(number(n.after.busy))); assert.ok(targetBusy.includes(number(final.busy)));
    if (!['bihai', 'xiao'].includes(kind)) { assert.equal(loss('jing'), 0); assert.equal(loss('eff_jing'), 0); }
    if (!(kind === 'cui' && hit)) { empty(final.conditions); assert.equal(temp(final, 'cuixin'), 0); assert.equal(temp(final, 'apply/parry'), temp(target, 'apply/parry')); }
    if (kind !== 'ding') assert.equal(temp(final, 'no_perform'), 0);
    if (!attacks && !hit && kind !== 'po') { assert.equal(loss('qi'), 0); assert.equal(loss('eff_qi'), 0); }
    // 修订（2026-10-13 契约复核）：kuang/fei 六击窗口观测到NPC自身资源净损
    // （见 school-taohua-npc-f1 证据：损失出现在多击样本），但没有逐击证据归因。
    // 不据此宣称反震机制已证明；此处只要求不得额外恢复，其余种类严格不变。
    // 强化/载入/拒绝等无窗口攻击种类的等式仍由本行与 loadout 全等、
    // 无攻击零损规则共同保证，单测反例（powerup 的 after.qi-- 必拒）继续有效。
    for (const key of resources.filter(k => k !== 'neili')) {
        if (kind === 'kuang' || kind === 'fei')
            assert.ok(n.before.properties[key] - n.after.properties[key] >= 0,
                'NPC即时资源不得额外恢复：' + key);
        else assert.equal(n.after.properties[key], n.before.properties[key]);
    }
    same(n.before.properties, n.after.properties, Object.keys(cfg.original.props));
    same(n.before.properties, n.after.properties, ['family']);
    timers(n, target, kind, hit, n.before.skills['cuixin-zhang'] ?? 0);
}

export function taohuaNpcEffects(rows, condition) {
    assert.equal(condition.parameters.collection_group, taohuaNpcGroup);
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.outcome, row.raw.outcome);
        validateTaohuaNpcRecord(row.raw, condition);
    }
    const observed = rows.filter(r => r.raw.outcome === 'observed'), data = observed.map(r => r.raw.npc_observation);
    const attacks = observed.flatMap(r => r.raw.attacks), directs = observed.flatMap(r => r.raw.npc_direct);
    return { samples: rows.length, observed: observed.length, errors: rows.filter(r => r.raw.outcome === 'error').length,
        callbacks: data.filter(n => n.called).length, loadouts: data.filter(n => !n.called).length,
        method_returned_zero: data.filter(n => n.called && n.result === 0).length,
        method_returned_one: data.filter(n => n.called && n.result === 1).length,
        ordinary_attacks: attacks.length, direct_calls: directs.length,
        attack_results: Object.fromEntries([0, -1, -2].map(result => [result, attacks.filter(a => a.result === result).length])),
        direct_damage_input: distribution(directs.map(d => d.damage)), direct_wound_percent: distribution(directs.map(d => d.percent)),
        npc_busy: distribution(data.map(n => number(n.after.busy))),
        target_busy: distribution(observed.map(r => number(r.raw.after[0].busy))),
        target_net_resource_loss: Object.fromEntries(resources.map(key => [key,
            distribution(observed.map(r => r.raw.before[0][key] - r.raw.after[0][key]))])),
        npc_net_neili_spent: distribution(data.map(n => n.before.properties.neili - n.after.properties.neili)),
        npc_learned_points: distribution(data.map(n => Object.values(n.after.learned).reduce((sum, value) => sum + value, 0))),
        target_poison: observed.map(r => r.raw.after[0].conditions),
        original_loadouts: data.map(n => n.before), singletons: data.map(n => n.singletons),
        skill_callouts_created_and_removed: data.reduce((sum, n) => sum + n.effect_callouts.length, 0),
        npc_gross_resource_accounting: 'not_observed', command_evaluation_cost: 'not_applicable',
        natural_heartbeats: 'not_sampled', natural_control_poison_or_powerup_expiry: 'not_sampled',
        scope: 'Exact original NPC closures only; observed/accepted/hit are distinct denominators. No bouts or strength ranking.',
    };
}
