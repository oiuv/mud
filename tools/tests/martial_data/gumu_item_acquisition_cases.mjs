// Finite, source-reviewed item acquisition inputs. Not registered or executed.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';
import { distribution } from './statistics.mjs';

export const gumuItemAcquisitionSources = [...new Set([
    'cmds/std/ask.c', 'adm/daemons/masterd.c', 'adm/daemons/itemd.c',
    'adm/single/simul_efun/message.c', 'feature/skill.c', 'feature/attribute.c',
    'feature/dbase.c', 'mudcore/inherit/dbase.c', 'feature/move.c', 'feature/equip.c',
    'inherit/item/combined.c', 'inherit/item/item.c', 'inherit/misc/equip.c',
    'inherit/weapon/throwing.c', 'inherit/weapon/whip.c',
    'inherit/char/char.c', 'inherit/char/npc.c', 'kungfu/class/gumu/gumu.h',
    'kungfu/class/gumu/longnv.c', 'kungfu/class/gumu/li.c',
    'd/gumu/obj/yufeng-zhen.c', 'd/gumu/obj/bingpo-zhen.c',
    'clone/lonely/yinsuo.c', 'clone/weapon/changbian.c',
    'kungfu/skill/yufeng-zhen.c', 'kungfu/skill/bingpo-shenzhen.c',
    'kungfu/skill/yinsuo-jinling.c',
])].sort();
export const gumuItemAcquisitionReviewed = '398f2fb81e5528dd409d54f1dda312188f8d9f51625d9d0866cfac7bce974bff';
export const gumuItemAcquisitionFixtureRequirements = [
    'Register only the item-acquisition teaching profile; use original ask and original NPC inquiry/accept_ask, not direct give_item or an invented item grant.',
    'Reuse exact-reference Gumu teacher preparation, real USER command context, heartbeat suspension and callback audit; retain constructor entry/return identities without claiming the unobserved internal initializer identity.',
    'Prepare only the finite stock/capacity/holder inputs once. Direct original reset is preparation evidence, never natural refresh. No refill or teacher/item cleanup between asks.',
    'Read stock, full direct inventories, encumbrance/max_encumbrance, equipment slots/apply, tracked item properties/poison and complete environment chain without loading or moving an item in the observer.',
    'Use the actual singleton yinsuo, including original constructor fallback changbian and a separately retained first original teacher where configured. Containers/other holders are explicit preparation, not rewards.',
    'Keep original merged-stack destruction evidence and the surviving new clone; keep all item/teacher identities through error cleanup. Extend only this profile; do not pretend the existing letter observer already covers items.',
    'Report with the frozen condition; separate command acceptance, stock charges, 50-root grants, player receipts, floor receipts, already-owned and refusals. Never treat missing observations as zero.',
];

const singleton = '/clone/lonely/yinsuo';
const lessons = {
    yufeng: { npc: 'longnv', id: 'xiao longnv', name: '小龙女', topic: '玉蜂针',
        skill: 'yufeng-zhen', stock: 'yfzhen_count', item: '/d/gumu/obj/yufeng-zhen', fn: 'ask_zhen' },
    bingpo: { npc: 'li', id: 'li mochou', name: '李莫愁', topic: '冰魄银针',
        skill: 'bingpo-shenzhen', stock: 'bingpo-zhen', item: '/d/gumu/obj/bingpo-zhen', fn: 'ask_zhen' },
    yinsuo: { npc: 'longnv', id: 'xiao longnv', name: '小龙女', topic: '银索金铃',
        skill: 'yinsuo-jinling', stock: null, item: singleton, fn: 'accept_ask' },
};
const map = (v, label) => assert.ok(v && typeof v === 'object' && !Array.isArray(v), label);
const integer = (v, label) => assert.ok(Number.isSafeInteger(v), label);
const falseValue = (o, k) => {
    assert.ok(Object.hasOwn(o, k), 'missing ' + k);
    assert.ok(o[k] === null || o[k] === 0, 'not an observed false value: ' + k);
};
const cloneId = (id, program) => assert.match(id, new RegExp('^' + program.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '#\\d+$'));
const sorted = values => [...values].sort();

// Only the original source branch. Item movement/ownership is checked separately.
export function gumuItemAcquisitionDecision(p, stock, owner) {
    const q = p.actor.properties, s = p.actor.skills;
    if (p.lesson === 'yufeng') {
        if (q['family/family_name'] !== '古墓派')
            return { result: 'refused', text: '与本派毫无瓜葛' };
        if ((s['yufeng-zhen'] ?? 0) < 100)
            return { result: 'refused', text: '的玉蜂针手法火候还不到家' };
        if (stock < 1) return { result: 'refused', text: '我手头的玉蜂针已经发完了' };
        return { result: 'granted', text: '这根玉蜂针你先拿去用吧' };
    }
    if (p.lesson === 'bingpo') {
        assert.ok(!Object.hasOwn(s, 'bingpo-zhen'), '不得为原错键注入虚构武学');
        return q['family/master_name'] !== '李莫愁'
            ? { result: 'refused', text: '与我毫无瓜葛' }
            : { result: 'refused', text: '的冰魄神针手法火候还不到家' };
    }
    assert.equal(p.lesson, 'yinsuo');
    if (q['family/family_name'] !== '古墓派') return { result: 'refused', text: '素无渊源' };
    if (q['family/master_id'] !== 'xiao longnv') return { result: 'refused', text: '只有我的弟子才配使用' };
    if ((s['yinsuo-jinling'] ?? 0) <= 0) return { result: 'refused', text: '都未曾学过' };
    if (s['yinsuo-jinling'] < 150) return { result: 'refused', text: '火候未到' };
    if (owner === 'student') return { result: 'already_owned', text: '不就是你拿着在用么' };
    if (owner === 'room') return { result: 'refused', text: '我已经借出去了' };
    if (owner === 'peer' || owner === 'previous_teacher') return { result: 'refused', text: '现在是我派的' };
    if (owner === 'outsider') return { result: 'refused', text: '现在落在了' };
    assert.equal(owner, 'teacher');
    return { result: 'granted', text: '你就暂时拿去吧' };
}

export function gumuItemAcquisitionConditions(relations, catalog, readSource, { smoke = false } = {}) {
    assert.equal(relations.source_fingerprint, catalog.source_fingerprint);
    const evidence = gumuItemAcquisitionSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), gumuItemAcquisitionReviewed,
        '针具/银索领取源码变化，须重核');
    const result = [];
    const add = (lesson, variant, edit = () => {}) => {
        const l = lessons[lesson], path = `kungfu/class/gumu/${l.npc}.c`;
        const teacher = relations.objects.find(t => t.path === path);
        assert.equal(teacher?.sha256, evidence.find(e => e.path === path).sha256);
        const text = readSource(path), matches = [...text.matchAll(new RegExp(`^\\s*(?:int|mixed|string) ${l.fn}\\([^\\n]*\\) \\{`, 'gm'))];
        assert.equal(matches.length, 1, '原询问入口不唯一');
        const offset = matches[0].index + matches[0][0].search(/(?:int|mixed|string) /);
        const line = text.slice(0, offset).split('\n').length;
        const entry = { id: `${path}:${line}:${l.fn}`, path, line, function: l.fn, sha256: teacher.sha256, role: 'teaching' };
        const p = { teaching_profile: 'gumu-item-acquisition', teaching_kind: 'item_acquisition',
            lesson, variant, teacher: { path: '/' + path.slice(0, -2), id: l.id, sha256: teacher.sha256 },
            topic: l.topic, skill: l.skill, action: `ask ${l.id} about ${l.topic}`,
            teaching_entry: entry, teaching_evidence: { path, line, sha256: teacher.sha256 },
            qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
            actor: { skills: { force: 200, literate: 100, dodge: 100, [l.skill]: lesson === 'yinsuo' ? 150 : 100 },
                mappings: {}, properties: { 'family/family_name': '古墓派', 'family/master_id': l.id,
                    'family/master_name': l.name, gender: '男性', character: '国士无双',
                    str: 30, int: 30, con: 30, dex: 30, shen: 0, combat_exp: 1000000,
                    gongxian: 0, jing: 10000, neili: 3000, max_neili: 3000, potential: 1000, learned_points: 0 } },
            target: { skills: { force: 1 }, mappings: {}, properties: {} },
            item_setup: { item: l.item, stock_key: l.stock, stock: lesson === 'yinsuo' ? null : 1,
                stock_source: lesson === 'yinsuo' ? 'not_applicable' : 'explicit_boundary',
                free_capacity: lesson === 'yinsuo' ? 1300 : 25000,
                holder: 'cold', initial_room_amount: 0, asks: 1 },
            monitored_grants: [], fighting: false, observe_seconds: 0, not_applicable: '',
            known_issue: lesson === 'bingpo' ? 'ask_zhen checks nonexistent bingpo-zhen, not bingpo-shenzhen' : null,
            note: '仅物品领取机制；不拜师、不战斗、不改毒性，不将显式初态或直接reset记为自然养成/补货；两次不估随机分布。',
        };
        edit(p);
        for (const skill of Object.keys(p.actor.skills)) assert.ok(catalog.skills.some(s => s.id === skill), skill);
        assert.ok(!Object.hasOwn(p.actor.skills, 'bingpo-zhen'));
        const owner = p.item_setup.holder === 'cold' ? 'teacher' : p.item_setup.holder.replace('-container', '');
        const decision = gumuItemAcquisitionDecision(p, p.item_setup.stock_source === 'direct_reset' ? 4 : p.item_setup.stock, owner);
        p.expected = decision.result === 'granted' ? 'observed' : 'refused';
        p.teaching_expectations = Array.from({ length: p.item_setup.asks }, () => ({ action: p.action, command_accepted: 1 }));
        result.push({ id: `teaching-gumu-items-${lesson}-${variant}`, stage: 'school', method: 'teaching',
            entry_id: entry.id, samples: smoke ? 1 : 2, status: 'configured_not_executed', parameters: p });
    };
    add('yufeng', 'exact-fit-repeat', p => { p.item_setup.asks = 2; });
    add('yufeng', 'skill99', p => { p.actor.skills['yufeng-zhen'] = 99; });
    add('yufeng', 'other-family', p => { p.actor.properties['family/family_name'] = '武当派'; });
    add('yufeng', 'empty-stock', p => { p.item_setup.stock = 0; });
    add('yufeng', 'exhaust-merge', p => { p.item_setup.stock = 3; p.item_setup.asks = 4; p.item_setup.free_capacity = 75000; });
    add('yufeng', 'direct-reset', p => { p.item_setup.stock_source = 'direct_reset'; p.item_setup.stock = null; });
    add('yufeng', 'overflow', p => { p.item_setup.free_capacity = 24999; });
    add('yufeng', 'overflow-floor-merge', p => { p.item_setup.free_capacity = 24999; p.item_setup.initial_room_amount = 50; });
    for (const level of [99, 100, 400]) add('bingpo', 'legal-skill' + level, p => { p.actor.skills['bingpo-shenzhen'] = level; });
    add('bingpo', 'other-master', p => { p.actor.properties['family/master_name'] = '小龙女'; });
    add('bingpo', 'direct-reset', p => { p.item_setup.stock_source = 'direct_reset'; p.item_setup.stock = null; });
    add('yinsuo', 'exact-fit-repeat', p => { p.item_setup.asks = 2; });
    add('yinsuo', 'skill149', p => { p.actor.skills['yinsuo-jinling'] = 149; });
    add('yinsuo', 'unlearned', p => { delete p.actor.skills['yinsuo-jinling']; });
    add('yinsuo', 'other-family', p => { p.actor.properties['family/family_name'] = '武当派'; });
    add('yinsuo', 'other-master', p => { p.actor.properties['family/master_id'] = 'yang guo'; });
    for (const holder of ['student', 'student-container', 'peer', 'peer-container', 'outsider',
        'room', 'room-container', 'previous_teacher']) add('yinsuo', holder.replace('_', '-'), p => { p.item_setup.holder = holder; });
    add('yinsuo', 'overflow', p => { p.item_setup.free_capacity = 1299; });
    assert.equal(result.length, 27);
    return result;
}

function validateItems(point, p) {
    map(point, 'item observation'); map(point.carriers, 'actual carriers');
    for (const role of ['student', 'teacher', 'room']) assert.ok(Object.hasOwn(point.carriers, role), role);
    assert.ok(Array.isArray(point.items));
    const carriers = Object.values(point.carriers), ids = carriers.map(c => c.object);
    assert.equal(new Set(ids).size, ids.length, 'carrier identity collision');
    for (const [role, c] of Object.entries(point.carriers)) {
        assert.ok(['student', 'teacher', 'room', 'container', 'peer', 'outsider', 'previous_teacher'].includes(role));
        assert.equal(typeof c.object, 'string'); assert.equal(typeof c.program, 'string');
        assert.ok(Object.hasOwn(c, 'environment') &&
            (c.environment === null || c.environment === 0 || ids.includes(c.environment)), 'complete carrier environment chain');
        assert.ok(c.is_character === 1 || c.is_character === 0 || c.is_character === null);
        assert.ok(Object.hasOwn(c, 'family') && (typeof c.family === 'string' || c.family === null || c.family === 0));
        integer(c.max_encumbrance, 'max_encumbrance'); assert.ok(c.max_encumbrance >= 0);
        if (role === 'room') {
            // ROOM has a capacity interface but does not inherit F_MOVE's weight ledger.
            assert.equal(c.object, '/tests/runner'); assert.equal(c.program, '/tests/runner');
            falseValue(c, 'encumbrance'); assert.equal(c.max_encumbrance, 100000000000);
        } else {
            integer(c.encumbrance, 'encumbrance'); assert.ok(c.encumbrance >= 0);
        }
        assert.equal(typeof c.weapon, 'string'); assert.equal(typeof c.secondary_weapon, 'string'); map(c.apply, 'actual apply');
        assert.ok(Array.isArray(c.inventory) && c.inventory.every(id => typeof id === 'string'));
        assert.equal(new Set(c.inventory).size, c.inventory.length, 'duplicate inventory object');
    }
    const byId = new Map(carriers.map(c => [c.object, c]));
    assert.equal(point.carriers.student.is_character, 1); assert.equal(point.carriers.teacher.is_character, 1);
    assert.equal(point.carriers.teacher.program, p.teacher.path); assert.equal(point.carriers.teacher.family, '古墓派');
    assert.equal(point.carriers.student.family, p.actor.properties['family/family_name']);
    falseValue(point.carriers.room, 'is_character'); falseValue(point.carriers.room, 'environment');
    for (const role of ['student', 'teacher', 'peer', 'outsider', 'previous_teacher']) if (point.carriers[role])
        assert.equal(point.carriers[role].environment, point.carriers.room.object);
    assert.equal(new Set(point.items.map(i => i.object)).size, point.items.length, 'duplicate tracked item');
    for (const i of point.items) {
        assert.equal(i.program, p.item_setup.item); assert.ok(byId.has(i.environment));
        assert.ok(Array.isArray(i.owner_chain) && i.owner_chain.length > 0);
        const chain = []; let cursor = i.environment;
        while (cursor !== null && cursor !== 0) {
            assert.ok(!chain.includes(cursor), 'ownership cycle'); assert.ok(byId.has(cursor));
            chain.push(cursor); cursor = byId.get(cursor).environment;
        }
        assert.deepEqual(i.owner_chain, chain, 'actual environment chain');
        for (const c of carriers) assert.equal(c.inventory.includes(i.object), c.object === i.environment, 'direct item inventory');
        assert.equal(i.consistence, 100); assert.equal(i.material, p.lesson === 'yinsuo' ? 'steel' : 'iron');
        if (p.lesson === 'yinsuo') {
            assert.equal(i.object, singleton); assert.equal(i.clonep, 0); assert.equal(i.weight, 1300);
            assert.equal(i.skill_type, 'whip'); assert.deepEqual(i.weapon_prop, { damage: 150 }); falseValue(i, 'flag');
            if (i.equipped === 'wielded') assert.equal(byId.get(i.environment).weapon, i.object);
            else falseValue(i, 'equipped');
        } else {
            cloneId(i.object, i.program); assert.equal(i.clonep, 1); integer(i.amount, 'actual amount'); assert.ok(i.amount > 0);
            assert.equal(i.base_weight, 500); assert.equal(i.weight, i.amount * 500); assert.equal(i.skill_type, 'throwing');
            assert.equal(i.flag, 8); falseValue(i, 'equipped');
            const bee = p.lesson === 'yufeng'; assert.deepEqual(i.weapon_prop, { damage: bee ? 50 : 80 });
            assert.deepEqual(i.daub, { poison: { id: 'xiao longnv', remain: bee ? 1000 : 1200,
                level: bee ? 80 : 100, name: bee ? '玉蜂毒' : '寒冰毒' },
                poison_type: bee ? 'yufengdu' : 'hanbingdu', who_name: bee ? '小龙女' : '李莫愁',
                who_id: bee ? 'xiao longnv' : 'li mochou' });
        }
    }
    if (p.lesson === 'yinsuo') { assert.equal(point.items.length, 1); falseValue(point, 'stock'); }
    else { integer(point.stock, 'actual stock'); assert.ok(point.stock >= 0); }
}

function ownerRole(point) {
    const item = point.items[0], roles = Object.entries(point.carriers);
    for (const id of item.owner_chain) {
        const [role, holder] = roles.find(([, c]) => c.object === id);
        if (holder.is_character || holder.environment === null || holder.environment === 0) return role;
    }
    assert.fail('original owner walk has no terminal holder');
}

function canonical(point) {
    const copy = structuredClone(point);
    copy.items.sort((a, b) => a.object.localeCompare(b.object));
    for (const c of Object.values(copy.carriers)) c.inventory.sort();
    return copy;
}

// F_MOVE carriers include indirect contents. Propagation reaches the root room,
// but ROOM has no weight ledger: its observed null/0 is not zero carried weight.
function trackedWeight(point, id) {
    return point.items.filter(i => i.owner_chain.includes(id)).reduce((sum, i) => sum + i.weight, 0);
}

export function validateGumuItemTransition(before, after, p, destroyed) {
    validateItems(before, p); validateItems(after, p);
    assert.deepEqual(Object.keys(after.carriers).sort(), Object.keys(before.carriers).sort());
    const decision = gumuItemAcquisitionDecision(p, before.stock, p.lesson === 'yinsuo' ? ownerRole(before) : null);
    assert.ok(Array.isArray(destroyed));
    if (decision.result !== 'granted') {
        assert.deepEqual(canonical(after), canonical(before), 'refusal/ownership repeat must not mutate items');
        assert.deepEqual(destroyed, []); return { ...decision, destination: null, units: 0, stock_spent: 0, merged: 0 };
    }
    const student = before.carriers.student, weight = p.lesson === 'yinsuo' ? 1300 : 25000;
    const destination = student.encumbrance + weight <= student.max_encumbrance ? 'student' : 'room';
    const dest = before.carriers[destination].object, expected = structuredClone(before);
    let removed = [], merged = 0;
    if (p.lesson === 'yinsuo') {
        const old = before.items[0], next = after.items[0];
        assert.equal(ownerRole(before), 'teacher'); assert.equal(old.environment, before.carriers.teacher.object);
        assert.equal(old.equipped, 'wielded'); falseValue(next, 'equipped');
        assert.deepEqual({ ...next, environment: old.environment, owner_chain: old.owner_chain, equipped: old.equipped }, old,
            'singleton identity and every non-location property must survive');
        const teacher = expected.carriers.teacher;
        assert.equal(teacher.weapon, old.object); assert.equal(teacher.secondary_weapon, 'none');
        teacher.weapon = 'none';
        for (const [key, value] of Object.entries(old.weapon_prop)) {
            integer(teacher.apply[key], 'actual wield property'); teacher.apply[key] -= value;
        }
        expected.items = structuredClone(after.items);
    } else {
        expected.stock -= 1;
        const oldAtDest = before.items.filter(i => i.environment === dest);
        const fresh = after.items.filter(i => !before.items.some(old => old.object === i.object));
        assert.equal(fresh.length, 1, 'original newly cloned stack must survive');
        assert.equal(fresh[0].amount, 50 + oldAtDest.reduce((sum, i) => sum + i.amount, 0));
        assert.equal(fresh[0].environment, dest); removed = oldAtDest.map(i => i.object); merged = removed.length;
        expected.items = [...before.items.filter(i => !removed.includes(i.object)), fresh[0]];
        assert.deepEqual(sorted(after.items.map(i => i.object)), sorted(expected.items.map(i => i.object)));
    }
    assert.deepEqual(destroyed.map(d => d.object).sort(), sorted(removed), 'destroyed old combined stacks');
    for (const d of destroyed) assert.deepEqual(d, { object: d.object, exists: 0 });
    const moved = p.lesson === 'yinsuo' ? after.items[0] : after.items.find(i => !before.items.some(old => old.object === i.object));
    assert.equal(moved.environment, dest);
    assert.deepEqual(moved.owner_chain, destination === 'student' ? [student.object, before.carriers.room.object] : [before.carriers.room.object]);
    for (const [role, c] of Object.entries(expected.carriers)) {
        const old = before.carriers[role];
        if (role !== 'room') c.encumbrance += trackedWeight(after, old.object) - trackedWeight(before, old.object);
        c.inventory = old.inventory.filter(id => !before.items.some(i => i.object === id));
        c.inventory.push(...after.items.filter(i => i.environment === c.object).map(i => i.object));
    }
    assert.deepEqual(canonical(after), canonical(expected), 'only original transfer/merge/unequip may mutate item state');
    return { ...decision, destination, units: p.lesson === 'yinsuo' ? 1 : 50,
        stock_spent: p.lesson === 'yinsuo' ? 0 : 1, merged };
}

function validateInitial(raw, p) {
    const point = raw.teaching[0].item_before, prep = raw.item_preparation, setup = p.item_setup;
    const teacher = raw.teacher_preparation;
    validateItems(point, p); map(prep, 'item preparation evidence');
    map(teacher, 'original teacher preparation');
    assert.equal(prep.scope, 'explicit_preparation_not_natural_acquisition');
    assert.equal(prep.teacher, point.carriers.teacher.object); assert.equal(prep.teacher_program, p.teacher.path);
    assert.equal(teacher.command, 'test_interface'); assert.equal(teacher.teacher, prep.teacher);
    assert.equal(teacher.teacher_program, p.teacher.path);
    assert.equal(teacher.entry_actor, point.carriers.student.object); assert.equal(teacher.return_actor, teacher.entry_actor);
    assert.equal(teacher.initializer_actor, 'not_observed');
    assert.deepEqual(teacher.after, teacher.before, 'constructor must not grant or modify student qualifications');
    assert.deepEqual(teacher.after, raw.before[0], 'preparation and measured student must match');
    for (const [state, heartbeat] of [[teacher.autonomy_before, 1], [teacher.autonomy_after, 0]]) {
        assert.equal(state.heartbeat, heartbeat); assert.equal(state.blueprint, p.teacher.path);
        assert.equal(state.blueprint_heartbeat, 0); assert.deepEqual(state.callbacks, []);
    }
    assert.equal(point.carriers.student.max_encumbrance - point.carriers.student.encumbrance, setup.free_capacity);
    assert.equal(point.carriers.student.weapon, 'none'); assert.equal(point.carriers.student.secondary_weapon, 'none');
    assert.equal(point.carriers.teacher.secondary_weapon, 'none');
    const roles = ['student', 'teacher', 'room'];
    const initialOwner = setup.holder.replace('-container', '');
    if (!['cold', 'student', 'room'].includes(initialOwner)) roles.push(initialOwner);
    if (setup.holder.endsWith('-container')) roles.push('container');
    assert.deepEqual(Object.keys(point.carriers).sort(), roles.sort(), 'only frozen finite holders may be prepared');
    if (setup.stock_key === null) falseValue(prep, 'stock_key');
    else assert.equal(prep.stock_key, setup.stock_key);
    assert.equal(prep.stock_source, setup.stock_source);
    if (p.lesson !== 'yinsuo') {
        integer(prep.constructor_stock, 'actual constructor stock'); assert.ok(prep.constructor_stock >= 0);
        if (setup.stock_source === 'direct_reset') {
            assert.deepEqual(prep.reset, { calls: 1, function: 'reset', owner: p.teacher.path,
                object: prep.teacher, before: prep.constructor_stock, after: point.stock,
                scope: 'direct_interface_not_natural_refresh' });
            assert.ok(point.stock === 4 || point.stock === 5);
        } else { falseValue(prep, 'reset'); assert.equal(point.stock, setup.stock); }
        assert.equal(point.items.reduce((sum, i) => sum + i.amount, 0), setup.initial_room_amount);
        for (const i of point.items) assert.equal(i.environment, point.carriers.room.object);
        falseValue(prep, 'singleton');
    } else {
        falseValue(prep, 'constructor_stock'); falseValue(prep, 'reset');
        const holder = setup.holder, observed = prep.singleton; map(observed, 'original singleton constructor evidence');
        assert.equal(observed.object, singleton); assert.equal(observed.clonep, 0);
        assert.equal(observed.after_create, point.items[0].environment);
        const expectedOwner = holder === 'cold' ? 'teacher' : holder.replace('-container', '');
        assert.equal(ownerRole(point), expectedOwner);
        if (holder === 'cold') {
            falseValue(observed, 'before_create'); assert.equal(observed.fallback, 0);
            assert.equal(point.items[0].equipped, 'wielded'); assert.equal(point.carriers.teacher.weapon, singleton);
            assert.equal(point.carriers.teacher.apply.damage, 250, '原基础100加银索150');
        } else {
            assert.equal(observed.before_create, observed.after_create); assert.equal(observed.fallback, 1);
            cloneId(point.carriers.teacher.weapon, '/clone/weapon/changbian');
            assert.equal(point.carriers.teacher.apply.damage, 125, '原基础100加长鞭25');
            if (holder.endsWith('-container')) {
                assert.equal(point.items[0].environment, point.carriers.container.object);
                falseValue(point.carriers.container, 'is_character');
                assert.equal(point.carriers.container.program, '/inherit/item/item');
                cloneId(point.carriers.container.object, '/inherit/item/item');
            } else assert.equal(point.items[0].environment, point.carriers[holder].object);
        }
        for (const role of ['peer', 'previous_teacher']) if (point.carriers[role]) {
            assert.equal(point.carriers[role].is_character, 1); assert.equal(point.carriers[role].family, '古墓派');
        }
        if (point.carriers.outsider) {
            assert.equal(point.carriers.outsider.is_character, 1); assert.notEqual(point.carriers.outsider.family, '古墓派');
        }
        if (point.carriers.previous_teacher) {
            assert.equal(point.carriers.previous_teacher.program, p.teacher.path);
            cloneId(point.carriers.previous_teacher.object, p.teacher.path);
            assert.equal(point.carriers.previous_teacher.weapon, singleton);
            assert.notEqual(point.carriers.previous_teacher.object, prep.teacher);
            const first = prep.previous_teacher; map(first, 'first original teacher preparation');
            assert.equal(first.teacher, point.carriers.previous_teacher.object); assert.equal(first.teacher_program, p.teacher.path);
            assert.equal(first.command, 'test_interface'); assert.equal(first.entry_actor, teacher.entry_actor);
            assert.equal(first.return_actor, teacher.return_actor); assert.equal(first.initializer_actor, 'not_observed');
            assert.deepEqual(first.before, raw.before[0]); assert.deepEqual(first.after, first.before);
            for (const [state, heartbeat] of [[first.autonomy_before, 1], [first.autonomy_after, 0]]) {
                assert.equal(state.heartbeat, heartbeat); assert.equal(state.blueprint, p.teacher.path);
                assert.equal(state.blueprint_heartbeat, 0); assert.deepEqual(state.callbacks, []);
            }
            falseValue(first, 'singleton_before_create');
            assert.equal(first.singleton_after_create, first.teacher);
        }
    }
    if (setup.holder !== 'previous_teacher') falseValue(prep, 'previous_teacher');
}

export function validateGumuItemAcquisitionRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.teaching_profile, 'gumu-item-acquisition'); assert.equal(raw.kind, 'sample');
    assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, 'teaching');
    if (raw.outcome === 'error') return;
    assert.equal(raw.outcome, p.expected); assert.equal(raw.before.length, 2); assert.equal(raw.after.length, 2);
    assert.ok(Array.isArray(raw.teaching)); assert.equal(raw.teaching.length, p.item_setup.asks);
    validateInitial(raw, p);
    let previous, previousItems, total = 0, anyGrant = false;
    const results = [];
    for (const step of raw.teaching) {
        assert.equal(step.student, raw.before[0].object); cloneId(step.teacher, p.teacher.path);
        assert.equal(step.teacher, raw.item_preparation.teacher); assert.equal(step.teacher_program, p.teacher.path);
        assert.equal(step.command, p.action); assert.equal(step.command_accepted, 1);
        assert.ok(Number.isFinite(step.elapsed) && step.elapsed >= 0);
        for (const point of [step.before, step.after]) {
            map(point, 'original teaching state'); assert.deepEqual(point.skills, p.actor.skills);
            assert.deepEqual(point.learned, {}); assert.deepEqual(point.mappings, p.actor.mappings);
            assert.deepEqual(point.grants, {}); assert.equal(point.family, p.actor.properties['family/family_name']);
            assert.equal(point.master_id, p.actor.properties['family/master_id']);
            assert.equal(point.master_name, p.actor.properties['family/master_name']);
            for (const key of ['neili', 'max_neili', 'potential', 'learned_points', 'str', 'int', 'con', 'dex', 'shen', 'combat_exp'])
                assert.equal(point[key], p.actor.properties[key], 'frozen qualification/resource: ' + key);
            assert.equal(point.contribution, p.actor.properties.gongxian); integer(point.jing, 'actual jing');
        }
        if (previous) { assert.deepEqual(step.before, previous); assert.deepEqual(step.item_before, previousItems); }
        else assert.equal(step.before.jing, p.actor.properties.jing);
        const cost = step.before.jing - step.after.jing; assert.ok(Number.isInteger(cost) && cost >= 10 && cost <= 19);
        assert.deepEqual({ ...step.after, jing: step.before.jing }, step.before, 'ask must only spend original jing');
        assert.equal(step.item_before.carriers.student.object, step.student);
        assert.equal(step.item_before.carriers.teacher.object, step.teacher);
        const result = validateGumuItemTransition(step.item_before, step.item_after, p, step.destroyed_items);
        assert.equal(step.message_scope, 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(step.messages));
        for (const m of step.messages) { assert.equal(typeof m.category, 'string'); assert.equal(typeof m.text, 'string'); }
        assert.ok(step.messages.some(m => m.text.includes(result.text)), 'actual branch response missing');
        if (result.destination === 'room') assert.ok(step.messages.some(m => m.text.includes('只好先扔在一旁')));
        results.push({ ...result, jing_spent: cost }); anyGrant ||= result.result === 'granted';
        total += cost; previous = step.after; previousItems = step.item_after;
    }
    assert.equal(raw.outcome, anyGrant ? 'observed' : 'refused', 'accepted ask is not an item award');
    for (const [snapshot, point] of [[raw.before[0], raw.teaching[0].before], [raw.after[0], previous]]) {
        for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(snapshot[key], 1);
        assert.equal(snapshot.wizardp, 0); assert.equal(snapshot.ghost, 0); falseValue(snapshot, 'busy');
        for (const key of ['jing', 'neili', 'max_neili', 'str', 'skills', 'learned', 'mappings']) assert.deepEqual(snapshot[key], point[key]);
    }
    assert.equal(raw.after[0].object, raw.before[0].object); assert.deepEqual(raw.after[1], raw.before[1]);
    assert.deepEqual({ ...raw.after[0], jing: raw.before[0].jing }, raw.before[0],
        '领取不自动装备学生或改变其余战斗/资格/资源快照');
    assert.equal(raw.metrics.length, 2);
    for (let side = 0; side < 2; side++) {
        map(raw.metrics[side], 'observed metric mapping');
        for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) for (const direction of ['cost', 'recovery']) {
            const key = `${resource}_${direction}`, metric = raw.metrics[side];
            if (Object.hasOwn(metric, key)) { integer(metric[key], key); assert.ok(metric[key] >= 0); }
            assert.equal(Object.hasOwn(metric, key) ? metric[key] : 0, side === 0 && key === 'jing_cost' ? total : 0);
        }
    }
    for (const key of ['launches', 'attacks', 'defenses', 'passives', 'callbacks', 'terminals']) assert.deepEqual(raw[key], []);
    return results;
}

export function gumuItemAcquisitionEffects(rows, condition) {
    assert.equal(condition.parameters.teaching_profile, 'gumu-item-acquisition');
    const steps = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.notEqual(row.raw.outcome, 'error');
        steps.push(...validateGumuItemAcquisitionRecord(row.raw, condition));
    }
    const sum = key => steps.reduce((n, s) => n + s[key], 0);
    return { samples: rows.length, asks: steps.length, accepted: steps.length,
        granted: steps.filter(s => s.result === 'granted').length,
        already_owned: steps.filter(s => s.result === 'already_owned').length,
        refused: steps.filter(s => s.result === 'refused').length,
        stock_spent: sum('stock_spent'), granted_units: sum('units'), merged_old_stacks: sum('merged'),
        player_units: steps.filter(s => s.destination === 'student').reduce((n, s) => n + s.units, 0),
        floor_units: steps.filter(s => s.destination === 'room').reduce((n, s) => n + s.units, 0),
        direct_resets: condition.parameters.item_setup.stock_source === 'direct_reset' ? rows.length : 0,
        natural_resets: 'not_observed', jing_spent: distribution(steps.map(s => s.jing_spent)) };
}
