import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mingjiaoTeachers, mingjiaoTeachersSourcePaths } from './school_mingjiao_teachers_cases.mjs';

const copy = v => structuredClone(v), sha = v => createHash('sha256').update(v).digest('hex');
const group = 'mingjiao-gift', prefix = 'school-mingjiao-gift-', item = '/clone/lonely/huanlingjian';
const teacher = mingjiaoTeachers.find(t => t.key === 'yangxiao');
export const mingjiaoGiftProfile = group;
export const mingjiaoGiftSourcePaths = [...new Set([...mingjiaoTeachersSourcePaths,
    'adm/daemons/masterd.c', 'cmds/std/ask.c', 'adm/daemons/inquiryd.c', 'clone/lonely/huanlingjian.c',
    'inherit/weapon/sword.c', 'inherit/misc/equip.c', 'inherit/item/item.c', 'adm/daemons/itemd.c',
    'clone/misc/bag.c', 'adm/daemons/rankd.c'])];
export const mingjiaoGiftReviewedSourceHash = '2587eebe9bd7722793aec9f1fd564878f6bdd391b84a15a430759da84e850cd5';
export const mingjiaoGiftAbsentPaths = [];
const hashSources = e => sha(JSON.stringify(mingjiaoGiftSourcePaths.map(p => [p, e[p]])));
const history = ['detach/明教', 'betrayer/明教', 'betrayer/times'];
const qualifications = ['env/no_learn', 'env/auto_regenerate', 'special_skill/wuxing',
    'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex'];
const family = (master = 'yang xiao') => ({ family_name: '明教', generation: 37, master_id: master,
    master_name: master === 'yang xiao' ? '杨逍' : '别位师父' });
const pool = { name: '试侠', gender: '男性', class: '', title: '普通百姓', character: '光明磊落',
    str: 36, int: 40, dex: 36, con: 36, shen: 80000, combat_exp: 800000,
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 1000, max_neili: 2400, jingli: 1000, max_jingli: 1000,
    potential: 10000, learned_points: 0, gongxian: 4321, weiwang: 123, jiali: 0,
    quest: { name: '实验旧任务', count: 7 }, 'reborn/family_name': 0,
    ...Object.fromEntries([...history, ...qualifications].map(k => [k, 0])) };
const action = 'ask yang xiao about 幻灵剑';
function plans() {
    const result = [];
    const add = (variant, holder = 'unowned', edit = () => {}, asks = 1) => {
        const p = { school: 'mingjiao', family: '明教', collection_group: group, teaching_profile: group,
            teaching_kind: 'item-acquisition', variant, skill: 'xiaoyao-jian', topic: '幻灵剑', action,
            teacher: { key: teacher.key, id: teacher.id, name: teacher.name, path: teacher.path, generation: teacher.generation },
            actor: { skills: { force: 180, sword: 200, unarmed: 200, dodge: 200, parry: 200, 'xiaoyao-jian': 120 },
                mappings: {}, preparations: {}, properties: { ...copy(pool), family: family() },
                temp: { quest: { name: '实验临时任务', count: 3 } } },
            target: { skills: { force: 1 }, mappings: {}, preparations: {}, properties: {
                ...copy(pool), name: '试客', family: family('other master') } },
            item_setup: { item, holder, free_capacity: 4000, container_program: '/clone/misc/bag', container_capacity: 4000 },
            teaching_expectations: Array.from({ length: asks }, () => ({ command_kind: 'ask', teacher_key: 'yangxiao', action })),
            monitored_grants: [], qualification_sources: mingjiaoGiftSourcePaths, named_participants: true,
            fighting: false, observe_seconds: 0, not_applicable: '', random_observation: false,
            note: '原非巫师USER ask与原杨逍give_item；师承、修为、原单例位置和容量为实验初态，不冒自然取得前置。只观察领取/落地/拒绝与原问话费，不装备幻灵剑、不战斗、不估随机费用概率或内部构造缓存。' };
        edit(p);
        const decision = mingjiaoGiftDecision(p, holder, p.actor.properties.jing);
        p.expected = decision.granted ? 'observed' : 'refused';
        result.push({ id: prefix + variant, stage: 'school', method: 'teaching', parameters: p });
    };
    add('other-family', 'unowned', p => { p.actor.properties.family.family_name = '武当派'; });
    add('other-master', 'unowned', p => { p.actor.properties.family = family('other master'); });
    add('shen79999', 'unowned', p => { p.actor.properties.shen = 79999; });
    add('skill0', 'unowned', p => { p.actor.skills['xiaoyao-jian'] = 0; });
    add('skill119', 'unowned', p => { p.actor.skills['xiaoyao-jian'] = 119; });
    add('gift-repeat', 'unowned', () => {}, 2);
    add('teacher-holder', 'teacher'); add('player0-holder', 'player0'); add('peer-holder', 'player1');
    add('outsider-holder', 'player1', p => { p.target.properties.family.family_name = '武当派'; });
    add('remote-holder', 'remote'); add('player0-container', 'player0-container');
    add('capacity3999', 'unowned', p => { p.item_setup.free_capacity = 3999; });
    add('capacity4000'); add('jing29', 'unowned', p => { p.actor.properties.jing = 29; });
    add('jing30', 'unowned', p => { p.actor.properties.jing = 30; });
    assert.equal(result.length, 16); assert.equal(result.reduce((n, c) => n + c.parameters.teaching_expectations.length * 2, 0), 34);
    return result;
}
// Original eligibility and owner walk outcome; not a fake command executor.
export function mingjiaoGiftDecision(p, owner, jing) {
    const q = p.actor.properties;
    if (jing < 30) return { result: 'jing-low', granted: 0, notice: '你现在的精神不太好，没法和别人套瓷。' };
    if (q.family.family_name !== '明教') return { result: 'other-family', granted: 0, notice: '与我明教素无渊源，不知此话从何说起。' };
    if (q.family.master_id !== teacher.id) return { result: 'other-master', granted: 0, notice: '只有我的弟子才配使用幻灵剑，你还是走吧。' };
    if (q.shen < 80000) return { result: 'shen', granted: 0, notice: '你目前所做的侠义正事不够，这幻灵剑暂时还不能交给你。' };
    if (p.actor.skills['xiaoyao-jian'] <= 0) return { result: 'unlearned', granted: 0, notice: '都未曾学过，拿幻灵剑又有何用？' };
    if (p.actor.skills['xiaoyao-jian'] < 120) return { result: 'skill-low', granted: 0, notice: '火候未到，就算拿着幻灵剑也没用。' };
    if (['player0', 'player0-container'].includes(owner)) return { result: 'already-owned', granted: 0, notice: '不就是你拿着在用么，怎么反倒找我来了？' };
    if (owner === 'player1') return { result: p.target.properties.family.family_name === '明教' ? 'peer-owned' : 'outsider-owned', granted: 0,
        notice: p.target.properties.family.family_name === '明教' ? '在用，你若需要就去找他吧。' : '手中，你去把它取回来吧。' };
    if (['stage', 'remote'].includes(owner)) return { result: 'room-owned', granted: 0, notice: '我已经借出去了，你还是隔段时间再来吧。' };
    assert.ok(['unowned', 'teacher'].includes(owner));
    return { result: p.item_setup.free_capacity < 4000 ? 'floor-receipt' : 'player-receipt', granted: 1,
        notice: '既然这样，那这柄幻灵剑你就暂时拿去吧。' };
}
export function mingjiaoGiftConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function'); assert.equal(typeof smoke, 'boolean'); assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const e = Object.fromEntries(mingjiaoGiftSourcePaths.map(p => [p, sha(readSource(p))]));
    assert.equal(hashSources(e), mingjiaoGiftReviewedSourceHash, 'gift public source closure changed; review required');
    const path = 'kungfu/class/mingjiao/yangxiao.c';
    assert.equal(readSource(path).toString().split('\n').findIndex(s => /^int accept_ask\(/.test(s)) + 1, 118);
    for (const c of plans()) for (const id of [...Object.keys(c.parameters.actor.skills), 'force']) {
        assert.equal(catalog.skills.find(s => s.id === id)?.sha256, e['kungfu/skill/' + id + '.c']);
    }
    const entry = { id: path + ':118:accept_ask', path, line: 118, function: 'accept_ask', role: 'teaching', sha256: e[path] };
    return plans().map(c => ({ ...c, entry_id: entry.id, samples: 2, status: 'prepared_not_sampled', parameters: {
        ...c.parameters, teacher: { ...c.parameters.teacher, sha256: e[path] }, teacher_levels: copy(teacher.levels),
        teaching_entry: copy(entry), source_evidence: copy(e), reviewed_source_hash: mingjiaoGiftReviewedSourceHash,
        qualification_evidence: mingjiaoGiftSourcePaths.map(path => ({ path, sha256: e[path] })), absent_sources: [] } }));
}
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v), 'mapping required'); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing ' + k); return v[k]; };
const integer = v => { assert.ok(Number.isSafeInteger(v)); return v; };
const zero = v => { assert.ok(v === 0 || v === null, 'observed LPC zero required'); };
const equal = (v, e) => e === 0 ? zero(v) : assert.deepEqual(v, e);
const plain = v => { assert.equal(typeof v, 'string'); return v.replace(/\x1b\[(?:[0-9;]*m|256D|K)/g, ''); };
const keys = (v, expected) => assert.deepEqual(Object.keys(map(v)).sort(), [...expected].sort());
let planIndex;
export function validateMingjiaoGiftCondition(c) {
    planIndex ??= new Map(plans().map(c => [c.id, c.parameters])); const plan = planIndex.get(c.id); assert.ok(plan);
    assert.equal(c.stage, 'school'); assert.equal(c.method, 'teaching'); assert.equal(c.samples, 2);
    const { teacher: actual, teacher_levels, teaching_entry, source_evidence: e, qualification_evidence,
        reviewed_source_hash, absent_sources, ...rest } = map(c.parameters);
    const { teacher: expected, ...planned } = plan; assert.deepEqual(rest, planned);
    assert.deepEqual(Object.keys(map(e)), mingjiaoGiftSourcePaths); for (const h of Object.values(e)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(hashSources(e), mingjiaoGiftReviewedSourceHash); assert.equal(reviewed_source_hash, mingjiaoGiftReviewedSourceHash);
    assert.deepEqual(qualification_evidence, mingjiaoGiftSourcePaths.map(path => ({ path, sha256: e[path] })));
    assert.deepEqual(absent_sources, []); const path = 'kungfu/class/mingjiao/yangxiao.c';
    assert.deepEqual(actual, { ...expected, sha256: e[path] }); assert.deepEqual(teacher_levels, teacher.levels);
    assert.deepEqual(teaching_entry, { id: path + ':118:accept_ask', path, line: 118, function: 'accept_ask', role: 'teaching', sha256: e[path] });
    assert.equal(c.entry_id, teaching_entry.id); return c.parameters;
}
function point(v, p, jing) {
    const q = p.actor.properties, skills = p.actor.skills;
    for (const [field, k] of [['contribution', 'gongxian'], ['neili', 'neili'], ['max_neili', 'max_neili'],
        ['max_jingli', 'max_jingli'], ['potential', 'potential'], ['learned_points', 'learned_points'],
        ['combat_exp', 'combat_exp'], ['shen', 'shen'], ['weiwang', 'weiwang'], ['str', 'str'], ['int', 'int'],
        ['dex', 'dex'], ['con', 'con'], ['character', 'character'], ['gender', 'gender']]) equal(own(v, field), q[k]);
    assert.equal(own(v, 'jing'), jing); zero(own(v, 'busy')); zero(own(v, 'born_family'));
    assert.equal(own(v, 'effective_str'), q.str + Math.trunc(skills.unarmed / 10)); assert.equal(own(v, 'effective_int'), q.int);
    assert.equal(own(v, 'effective_dex'), q.dex + Math.trunc(skills.dodge / 10)); assert.equal(own(v, 'effective_force'), Math.trunc(skills.force / 2));
    assert.equal(own(v, 'effective_dodge'), Math.trunc(skills.dodge / 2));
    assert.deepEqual(own(v, 'skills'), skills); for (const k of ['learned', 'mappings', 'grants']) assert.deepEqual(own(v, k), {});
    zero(own(v, 'reborn_family'));
    for (const [field, k] of [['family', 'family_name'], ['master_id', 'master_id'], ['master_name', 'master_name']]) assert.equal(own(v, field), q.family[k]);
    keys(own(v, 'qualification'), qualifications); for (const k of qualifications) zero(own(v.qualification, k));
    const r = own(v, 'recruitment'); assert.deepEqual(own(r, 'family'), q.family); assert.equal(own(r, 'family_present'), 1);
    for (const k of ['name', 'class', 'title']) assert.equal(own(r, k), q[k]);
    keys(own(r, 'history'), history); for (const k of history) zero(own(r.history, k));
    assert.deepEqual(own(r, 'quest'), q.quest); assert.deepEqual(own(r, 'temp_quest'), p.actor.temp.quest);
    for (const k of ['pending_apprentice', 'pending_betrayer']) assert.equal(own(r, k), '');
}
function boundary(v, p, side, carrier, jing) {
    const config = side ? p.target : p.actor, q = config.properties;
    assert.equal(own(v, 'object'), carrier.object);
    assert.match(v.object, side ? /^\/tests\/actor#[0-9]+$/ : /^\/tests\/teaching_actor#[0-9]+$/);
    assert.equal(own(v, 'id'), side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(v, k), 1);
    for (const k of ['wizardp', 'ghost', 'busy']) zero(own(v, k));
    for (const k of ['qi', 'eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'neili', 'max_neili', 'jingli', 'max_jingli',
        'potential', 'learned_points', 'str', 'int', 'dex', 'con', 'combat_exp']) assert.equal(own(v, k), q[k]);
    assert.equal(own(v, 'jing'), jing);
    assert.deepEqual(own(v, 'skills'), config.skills);
    assert.deepEqual(own(v, 'effective_skills'), Object.fromEntries(Object.entries(config.skills).map(([k, n]) => [k, Math.trunc(n / 2)])));
    for (const k of ['learned', 'mappings', 'preparations']) assert.deepEqual(own(v, k), {});
    assert.equal(own(v, 'effective_int'), q.int); assert.equal(own(v, 'effective_str'), q.str + Math.trunc((config.skills.unarmed ?? 0) / 10));
    assert.equal(own(v, 'effective_dex'), q.dex + Math.trunc((config.skills.dodge ?? 0) / 10));
    for (const k of ['weapon', 'secondary_weapon', 'handing']) assert.equal(own(v, k), 'none');
    for (const k of ['weapon_details', 'secondary_weapon_details', 'handing_details']) assert.deepEqual(own(v, k), {});
    zero(own(v, 'weapon_damage')); zero(own(v, 'weapon_flag')); assert.deepEqual(own(own(v, 'temp'), 'apply'), { armor: 100 });
    equal(own(own(v, 'cultivation'), 'class'), q.class); zero(own(v.cultivation, 'born_family'));
    assert.equal(own(v.cultivation, 'family/family_name'), q.family.family_name);
    assert.deepEqual([...own(v, 'inventory')].sort(), [...carrier.inventory].sort());
    assert.equal(own(v, 'encumbrance'), carrier.encumbrance); assert.equal(own(v, 'max_encumbrance'), carrier.max_encumbrance);
    assert.equal(own(v, 'environment'), carrier.environment);
}
function itemPoint(v, p, identities) {
    const cs = own(v, 'carriers'), expected = ['player0', 'player1', 'teacher', 'stage', 'remote',
        ...(p.item_setup.holder === 'player0-container' ? ['container'] : [])]; keys(cs, expected);
    const ids = Object.values(cs).map(c => own(c, 'object')); assert.equal(new Set(ids).size, ids.length);
    const byId = new Map(Object.values(cs).map(c => [c.object, c]));
    for (const [role, c] of Object.entries(cs)) {
        assert.equal(typeof own(c, 'program'), 'string');
        const name = own(c, 'name');
        if (['stage', 'remote'].includes(role)) assert.ok(name === 0 || name === null || typeof name === 'string');
        else assert.equal(plain(name), role === 'player0' ? p.actor.properties.name : role === 'player1'
            ? p.target.properties.name : role === 'teacher' ? '杨逍' : '包裹');
        assert.equal(typeof c.object, 'string'); assert.ok(c.object.length > 0);
        const env = own(c, 'environment'); assert.ok(env === 0 || env === null || byId.has(env));
        if (['stage', 'remote'].includes(role)) {
            zero(own(c, 'is_character')); zero(env); zero(own(c, 'encumbrance')); assert.equal(own(c, 'max_encumbrance'), 100000000000);
            assert.equal(c.program, role === 'stage' ? '/tests/runner' : '/inherit/room/room');
            if (role === 'stage') assert.equal(c.object, '/tests/runner');
            else assert.match(c.object, /^\/inherit\/room\/room#[0-9]+$/);
        } else {
            assert.ok(integer(own(c, 'encumbrance')) >= 0); assert.ok(integer(own(c, 'max_encumbrance')) >= 0);
            equal(own(c, 'is_character'), role === 'container' ? 0 : 1);
        }
        for (const k of ['weapon', 'secondary_weapon']) assert.equal(typeof own(c, k), 'string'); map(own(c, 'apply'));
        const inv = own(c, 'inventory'); assert.ok(Array.isArray(inv) && inv.every(id => typeof id === 'string'));
        assert.equal(new Set(inv).size, inv.length);
        if (['player0', 'player1', 'teacher'].includes(role)) assert.equal(env, cs.stage.object);
        if (role === 'player0') {
            assert.equal(own(c, 'family'), p.actor.properties.family.family_name);
            assert.equal(c.program, '/tests/teaching_actor'); assert.match(c.object, /^\/tests\/teaching_actor#[0-9]+$/);
        }
        if (role === 'player1') {
            assert.equal(own(c, 'family'), p.target.properties.family.family_name);
            assert.equal(c.program, '/tests/actor'); assert.match(c.object, /^\/tests\/actor#[0-9]+$/);
        }
        if (role === 'teacher') { assert.equal(own(c, 'family'), '明教'); assert.equal(c.program, teacher.path); }
        if (role === 'container') { assert.equal(c.program, '/clone/misc/bag'); assert.match(c.object, /^\/clone\/misc\/bag#[0-9]+$/); zero(own(c, 'family')); }
        if (identities) assert.equal(c.object, identities[role]);
    }
    const items = own(v, 'items'); assert.ok(Array.isArray(items) && items.length === 1);
    const i = items[0]; assert.equal(own(i, 'object'), item); assert.equal(own(i, 'program'), item); zero(own(i, 'clonep'));
    assert.equal(own(i, 'id'), 'huanling jian');
    assert.equal(own(i, 'weight'), 4000); assert.equal(own(i, 'stable'), 100); assert.equal(own(i, 'consistence'), 100);
    assert.equal(own(i, 'material'), 'steel'); assert.equal(own(i, 'skill_type'), 'sword'); assert.equal(own(i, 'flag'), 4);
    assert.deepEqual(own(i, 'weapon_prop'), { damage: 100, dodge: -1 }); assert.deepEqual(own(i, 'armor_prop'), { dodge: -1 });
    zero(own(i, 'equipped')); assert.equal(own(i, 'is_weapon'), 1);
    const chain = [], env = own(i, 'environment'); let cursor = env;
    while (cursor !== null && cursor !== 0) {
        assert.ok(byId.has(cursor) && !chain.includes(cursor)); chain.push(cursor); cursor = byId.get(cursor).environment;
    }
    assert.deepEqual(own(i, 'owner_chain'), chain);
    for (const c of Object.values(cs)) assert.equal(c.inventory.includes(item), c.object === env);
    return env === 0 || env === null ? 'unowned' : Object.entries(cs).find(([, c]) => c.object === env)[0] === 'container'
        ? 'player0-container' : Object.entries(cs).find(([, c]) => c.object === env)[0];
}
const canonical = v => { const r = copy(v); for (const c of Object.values(r.carriers)) c.inventory.sort(); return r; };
function transition(before, after, p, expectedRole, identities) {
    const oldRole = itemPoint(before, p, identities), newRole = itemPoint(after, p, identities); assert.equal(newRole, expectedRole);
    const a = canonical(before), b = canonical(after), i = a.items[0], j = b.items[0];
    for (const k of ['environment', 'owner_chain']) { delete i[k]; delete j[k]; } assert.deepEqual(i, j);
    for (const [role, c] of Object.entries(a.carriers)) {
        const d = b.carriers[role];
        const oldTracked = before.items[0].owner_chain.includes(c.object) ? 4000 : 0;
        const newTracked = after.items[0].owner_chain.includes(d.object) ? 4000 : 0;
        if (!['stage', 'remote'].includes(role)) assert.equal(d.encumbrance - c.encumbrance, newTracked - oldTracked);
        assert.deepEqual(c.inventory.filter(id => id !== item), d.inventory.filter(id => id !== item));
        delete c.inventory; delete d.inventory; delete c.encumbrance; delete d.encumbrance; assert.deepEqual(c, d);
    }
    return { oldRole, newRole };
}
function prepare(raw, p) {
    assert.ok(!Object.hasOwn(raw, 'skill_load_context'), 'no invented Ling prime');
    const preps = own(raw, 'teacher_preparations'), cleanups = own(raw, 'teacher_cleanups');
    assert.ok(Array.isArray(preps) && preps.length === 1); assert.ok(Array.isArray(cleanups) && cleanups.length === 1);
    const prep = preps[0], student = raw.before[0].object;
    for (const k of ['entry_actor', 'return_actor']) assert.equal(own(prep, k), student);
    assert.equal(own(prep, 'key'), 'yangxiao'); assert.equal(own(prep, 'command'), 'test_interface');
    assert.equal(own(prep, 'initializer_actor'), 'not_observed'); assert.equal(own(prep, 'teacher_program'), teacher.path);
    const id = own(prep, 'teacher'); assert.match(id, /^\/kungfu\/class\/mingjiao\/yangxiao#[0-9]+$/);
    const npc = own(prep, 'teacher_state'); assert.equal(own(npc, 'object'), id); assert.equal(own(npc, 'id'), teacher.id);
    assert.equal(own(npc, 'living'), 1); zero(own(npc, 'playerp')); assert.deepEqual(own(npc, 'skills'), teacher.levels);
    assert.deepEqual(own(npc, 'mappings'), { force: 'shenghuo-xinfa', dodge: 'shenghuo-bu', cuff: 'pili-quan', parry: 'xiaoyao-jian', sword: 'xiaoyao-jian' });
    assert.deepEqual(own(npc, 'preparations'), { cuff: 'pili-quan' }); assert.deepEqual(own(npc, 'no_teach'), {});
    zero(own(npc, 'env_no_teach')); zero(own(npc, 'recognize_source'));
    assert.equal(own(npc, 'class'), ''); assert.equal(plain(own(npc, 'title')), '明教光明左使');
    for (const k of ['born_family', 'inherit_title']) zero(own(npc, k)); assert.equal(own(npc, 'attempt_source'), teacher.path);
    assert.deepEqual(own(npc, 'family'), { family_name: '明教', generation: 36, title: '弟子', privs: -1 }); assert.equal(own(npc, 'family_present'), 1);
    assert.deepEqual(own(prep, 'before'), own(prep, 'after'));
    for (const [k, hb] of [['autonomy_before', 1], ['autonomy_after', 0]]) {
        const v = own(prep, k); assert.equal(own(v, 'heartbeat'), hb); assert.equal(own(v, 'blueprint'), teacher.path);
        zero(own(v, 'blueprint_heartbeat')); assert.deepEqual(own(v, 'callbacks'), []);
    }
    assert.equal(own(cleanups[0], 'object'), id); zero(own(cleanups[0], 'pending')); zero(own(cleanups[0], 'object_exists'));
    const g = own(raw, 'gift_preparation'); keys(g, ['item', 'holder', 'command', 'entry_actor', 'return_actor', 'singleton_loaded_before',
        'players_before', 'players_after', 'initial_state', 'item_after']);
    assert.equal(g.item, item); assert.equal(g.holder, p.item_setup.holder); assert.equal(g.command, 'test_interface');
    for (const k of ['entry_actor', 'return_actor']) assert.equal(g[k], student); assert.equal(g.singleton_loaded_before, 0);
    for (const k of ['players_before', 'players_after']) assert.ok(Array.isArray(g[k]) && g[k].length === 2);
    const identities = Object.fromEntries(Object.entries(g.item_after.carriers).map(([k, c]) => [k, c.object]));
    assert.equal(identities.player0, student); assert.equal(identities.player1, raw.before[1].object); assert.equal(identities.teacher, id);
    assert.equal(itemPoint(g.initial_state, p, identities), 'unowned'); assert.equal(itemPoint(g.item_after, p, identities), p.item_setup.holder);
    assert.deepEqual(g.players_after, raw.before);
    for (const side of [0, 1]) {
        boundary(g.players_before[side], p, side, g.initial_state.carriers['player' + side], p[side ? 'target' : 'actor'].properties.jing);
        boundary(g.players_after[side], p, side, g.item_after.carriers['player' + side], p[side ? 'target' : 'actor'].properties.jing);
        const a = copy(g.players_before[side]), b = copy(g.players_after[side]);
        for (const k of ['inventory', 'encumbrance', 'max_encumbrance']) { delete a[k]; delete b[k]; }
        const at = own(a, 'temp'), bt = own(b, 'temp'); delete at.notify_fail; delete bt.notify_fail; assert.deepEqual(a, b);
    }
    assert.deepEqual(prep.after, g.players_before[0]);
    assert.equal(g.item_after.carriers.player0.max_encumbrance, g.item_after.carriers.player0.encumbrance + p.item_setup.free_capacity);
    if (identities.container) {
        assert.equal(g.item_after.carriers.container.environment, student); assert.equal(g.item_after.carriers.container.max_encumbrance, 4000);
        assert.ok(g.item_after.carriers.player0.inventory.includes(identities.container));
    }
    const positioned = copy(g.initial_state);
    positioned.carriers.player0.max_encumbrance = g.item_after.carriers.player0.max_encumbrance;
    if (identities.container) {
        assert.equal(positioned.carriers.container.environment, 0);
        assert.equal(positioned.carriers.container.max_encumbrance, 4000);
        positioned.carriers.container.environment = student;
        positioned.carriers.player0.inventory.push(identities.container);
    }
    transition(positioned, g.item_after, p, p.item_setup.holder, identities);
    const cleanup = own(raw, 'gift_cleanup'); keys(cleanup, ['singleton', 'owned']); keys(cleanup.singleton, ['object', 'exists_after']);
    assert.equal(cleanup.singleton.object, item); zero(cleanup.singleton.exists_after);
    assert.ok(Array.isArray(cleanup.owned)); assert.equal(cleanup.owned.length, identities.container ? 2 : 1);
    for (const [i, role] of ['remote', ...(identities.container ? ['container'] : [])].entries()) {
        const c = cleanup.owned[i]; keys(c, ['object', 'program', 'exists_after']); assert.equal(c.object, identities[role]);
        assert.equal(c.program, g.item_after.carriers[role].program); zero(c.exists_after);
    }
    return { identities, npc, initial: g.item_after };
}
export function validateMingjiaoGiftRecord(raw, condition) {
    const p = validateMingjiaoGiftCondition(condition); assert.equal(own(raw, 'kind'), 'sample');
    assert.equal(own(raw, 'condition_id'), condition.id); assert.equal(own(raw, 'method'), 'teaching');
    const index = own(raw, 'index'); assert.ok(Number.isSafeInteger(index) && index >= 0 && index < 2);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    const outcome = own(raw, 'outcome'); if (['error', 'not_applicable'].includes(outcome)) {
        assert.ok(typeof own(raw, 'reason') === 'string' && raw.reason.trim()); return [];
    }
    assert.equal(outcome, p.expected);
    for (const k of ['before', 'after']) assert.ok(Array.isArray(own(raw, k)) && raw[k].length === 2);
    const prepared = prepare(raw, p), steps = own(raw, 'teaching'); assert.ok(Array.isArray(steps));
    assert.equal(steps.length, p.teaching_expectations.length); let jing = p.actor.properties.jing, previous, priorItems = prepared.initial;
    const values = [];
    for (const [i, step] of steps.entries()) {
        assert.equal(own(step, 'student'), prepared.identities.player0); assert.equal(own(step, 'command'), action);
        for (const k of ['teacher', 'resolved_teacher']) assert.equal(own(step, k), prepared.identities.teacher);
        assert.equal(own(step, 'teacher_program'), teacher.path); assert.deepEqual(own(step, 'teacher_skills'), teacher.levels);
        assert.deepEqual(own(step, 'teacher_before'), prepared.npc); assert.deepEqual(own(step, 'teacher_after'), prepared.npc);
        assert.ok(integer(own(step, 'command_accepted')) > 0); assert.ok(Number.isFinite(own(step, 'elapsed')) && step.elapsed >= 0);
        const before = own(step, 'before'), after = own(step, 'after'); point(before, p, jing);
        if (previous) assert.deepEqual(before, previous); assert.deepEqual(own(step, 'item_before'), priorItems);
        const owner = itemPoint(step.item_before, p, prepared.identities), decision = mingjiaoGiftDecision(p, owner, jing);
        const fee = jing - integer(own(after, 'jing'));
        if (jing < 30) assert.equal(fee, 0); else assert.ok(fee >= 10 && fee <= 19, 'original ask integer fee support');
        jing -= fee; point(after, p, jing);
        const a = copy(before), b = copy(after); delete a.jing; delete b.jing; assert.deepEqual(a, b);
        const expectedRole = decision.granted ? decision.result === 'floor-receipt' ? 'stage' : 'player0' : owner;
        transition(step.item_before, own(step, 'item_after'), p, expectedRole, prepared.identities);
        assert.equal(own(step, 'message_scope'), 'receive_message_apply_input_not_full_transcript'); assert.ok(Array.isArray(own(step, 'messages')));
        const text = step.messages.map(m => { assert.equal(typeof own(m, 'category'), 'string'); return plain(own(m, 'text')); }).join('');
        assert.ok(text.includes(decision.notice), 'original gift response absent');
        if (decision.result === 'floor-receipt') assert.ok(text.includes('只好先扔在一旁。'));
        values.push({ result: decision.result, accepted: 1, execution_cost: step.command_accepted, jing_cost: fee,
            qualification_passed: Number(!['jing-low', 'other-family', 'other-master', 'shen', 'unlearned', 'skill-low'].includes(decision.result)),
            grants_attempted: decision.granted, player_receipts: Number(decision.result === 'player-receipt'),
            floor_receipts: Number(decision.result === 'floor-receipt'), already_owned: Number(decision.result === 'already-owned') });
        previous = after; priorItems = step.item_after;
    }
    boundary(raw.before[0], p, 0, prepared.initial.carriers.player0, p.actor.properties.jing);
    boundary(raw.after[0], p, 0, priorItems.carriers.player0, jing);
    boundary(raw.before[1], p, 1, prepared.initial.carriers.player1, p.target.properties.jing); assert.deepEqual(raw.before[1], raw.after[1]);
    const a = copy(raw.before[0]), b = copy(raw.after[0]);
    for (const k of ['jing', 'inventory', 'encumbrance']) { delete a[k]; delete b[k]; }
    delete a.temp.notify_fail; delete b.temp.notify_fail; assert.deepEqual(a, b);
    const metrics = own(raw, 'metrics'); assert.ok(Array.isArray(metrics) && metrics.length === 2);
    const cost = values.reduce((n, v) => n + v.jing_cost, 0);
    for (const [side, m] of metrics.entries()) {
        for (const [k, n] of Object.entries(map(m))) { assert.ok(integer(n) >= 0); assert.equal(n, side === 0 && k === 'jing_cost' ? cost : 0); }
        const expectedCost = side === 0 ? cost : 0;
        if (expectedCost > 0) assert.equal(integer(own(m, 'jing_cost')), expectedCost);
        else if (Object.hasOwn(m, 'jing_cost')) assert.equal(integer(m.jing_cost), 0);
    }
    for (const k of ['launches', 'attacks', 'defenses', 'passives', 'callbacks', 'terminals']) assert.deepEqual(own(raw, k), []);
    assert.equal(outcome, values.some(v => v.grants_attempted) ? 'observed' : 'refused'); return values;
}
export function mingjiaoGiftEffects(rows, condition) {
    const values = []; let unknown = 0;
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw.method, condition.method); assert.equal(row.outcome, row.raw.outcome);
        const v = validateMingjiaoGiftRecord(row.raw, condition);
        if (['error', 'not_applicable'].includes(row.outcome)) { unknown++; continue; } values.push(...v);
    }
    const sum = k => values.length ? values.reduce((n, v) => n + v[k], 0) : null;
    return { samples: rows.length, validated: rows.length - unknown, unknown, commands: values.length,
        commands_accepted: sum('accepted'), command_execution_cost: sum('execution_cost'), jing_cost: sum('jing_cost'),
        contribution_cost: values.length ? 0 : null, grants_attempted: sum('grants_attempted'), player_receipts: sum('player_receipts'),
        qualification_passed: sum('qualification_passed'),
        floor_receipts: sum('floor_receipts'), already_owned: sum('already_owned'),
        results: Object.fromEntries([...new Set(values.map(v => v.result))].sort().map(k => [k, values.filter(v => v.result === k).length])),
        unknown_scopes: ['explicit prerequisite/master/holder/capacity inputs are not natural acquisition cultivation',
            'ask fees retain finite support, not sampled probability claims', 'no wield, weapon combat or passive effects',
            'floor transfer is not player receipt or qualification refusal', 'teacher initializer/cache identity remains unobserved'] };
}
