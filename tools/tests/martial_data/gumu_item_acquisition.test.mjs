import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { validateExpectedOutcomes } from './execution.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { validateTeachingPlan, summarizeTeachingRows } from './teaching_report.mjs';
import { gumuItemAcquisitionSources, gumuItemAcquisitionReviewed, gumuItemAcquisitionFixtureRequirements,
    gumuItemAcquisitionConditions, gumuItemAcquisitionDecision, validateGumuItemAcquisitionRecord,
    gumuItemAcquisitionEffects } from './gumu_item_acquisition_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog);
const cases = gumuItemAcquisitionConditions(relations, catalog, read);
const smoke = gumuItemAcquisitionConditions(relations, catalog, read, { smoke: true });
const pick = id => { const c = cases.find(c => c.id === 'teaching-gumu-items-' + id); assert.ok(c, id); return c; };
const entries = list => [...new Map(list.map(c => [c.entry_id, c.parameters.teaching_entry])).values()];
const silver = '/clone/lonely/yinsuo';

// Fabricated observations test the reader only, not original NPC/runtime behavior.
// They must never be imported as samples or used as evidence of a successful ask.
function fixture(condition, cost = 12, resetStock = 4) {
    const p = condition.parameters, setup = p.item_setup, a = p.actor, q = a.properties;
    const room = '/tests/runner', student = '/tests/teaching_actor#2', teacher = p.teacher.path + '#3';
    const carrier = (object, program, character, family, environment = room) => ({ object, program,
        is_character: character, family, environment, encumbrance: 0, max_encumbrance: 1000000,
        inventory: [], weapon: 'none', secondary_weapon: 'none', apply: { damage: 0, defense: 0 } });
    const carriers = {
        student: carrier(student, '/tests/teaching_actor', 1, q['family/family_name']),
        teacher: carrier(teacher, p.teacher.path, 1, '古墓派'),
        room: { ...carrier(room, room, null, null, null), encumbrance: null, max_encumbrance: 100000000000 },
    };
    carriers.room.inventory.push(student, teacher);
    const held = setup.holder === 'cold' ? 'teacher' : setup.holder.replace('-container', '');
    if (!carriers[held]) {
        const path = held === 'previous_teacher' ? p.teacher.path : '/tests/teaching_actor';
        carriers[held] = carrier(path + '#4', path, 1, held === 'outsider' ? '武当派' : '古墓派');
        carriers.room.inventory.push(carriers[held].object);
    }
    if (setup.holder.endsWith('-container')) {
        carriers.container = carrier('/inherit/item/item#5', '/inherit/item/item', 0, null, carriers[held].object);
        carriers[held].inventory.push(carriers.container.object);
    }
    const chain = env => {
        const result = [];
        while (env !== null) { result.push(env); env = Object.values(carriers).find(c => c.object === env).environment; }
        return result;
    };
    let serial = 10;
    const needle = (environment, amount) => ({ object: setup.item + '#' + serial++, program: setup.item,
        clonep: 1, environment, owner_chain: chain(environment), weight: amount * 500, amount,
        base_weight: 500, skill_type: 'throwing', flag: 8, consistence: 100, material: 'iron', equipped: null,
        weapon_prop: { damage: p.lesson === 'yufeng' ? 50 : 80 },
        daub: { poison: { id: 'xiao longnv', remain: p.lesson === 'yufeng' ? 1000 : 1200,
            level: p.lesson === 'yufeng' ? 80 : 100, name: p.lesson === 'yufeng' ? '玉蜂毒' : '寒冰毒' },
            poison_type: p.lesson === 'yufeng' ? 'yufengdu' : 'hanbingdu',
            who_name: p.lesson === 'yufeng' ? '小龙女' : '李莫愁', who_id: p.lesson === 'yufeng' ? 'xiao longnv' : 'li mochou' } });
    let items = [];
    if (p.lesson === 'yinsuo') {
        const env = carriers[setup.holder.endsWith('-container') ? 'container' : held].object;
        items = [{ object: silver, program: silver, clonep: 0, environment: env, owner_chain: chain(env),
            weight: 1300, skill_type: 'whip', flag: 0, consistence: 100, material: 'steel',
            weapon_prop: { damage: 150 }, equipped: ['teacher', 'previous_teacher'].includes(held) ? 'wielded' : null }];
        if (['teacher', 'previous_teacher'].includes(held)) {
            carriers[held].weapon = silver; carriers[held].apply.damage = 250;
        }
    } else if (setup.initial_room_amount) items = [needle(room, setup.initial_room_amount)];
    if (p.lesson === 'yufeng') {
        carriers.teacher.weapon = silver; carriers.teacher.inventory.push(silver); carriers.teacher.apply.damage = 250;
    } else if (p.lesson === 'bingpo') {
        carriers.teacher.inventory.push('/d/items/whip/fuchen2#6'); carriers.teacher.apply.damage = 100;
    } else if (setup.holder !== 'cold') {
        carriers.teacher.weapon = '/clone/weapon/changbian#6'; carriers.teacher.apply.damage = 125;
        carriers.teacher.inventory.push(carriers.teacher.weapon);
    }
    // Untracked original clothing is retained verbatim through every transition.
    carriers.teacher.inventory.push(p.lesson === 'bingpo' ? '/d/items/cloth/qing_daopao3#7' : '/clone/cloth/baipao#7');
    for (const i of items) {
        Object.values(carriers).find(c => c.object === i.environment).inventory.push(i.object);
        for (const id of i.owner_chain) if (id !== room)
            Object.values(carriers).find(c => c.object === id).encumbrance += i.weight;
    }
    carriers.student.max_encumbrance = carriers.student.encumbrance + setup.free_capacity;
    let itemState = { stock: p.lesson === 'yinsuo' ? null : setup.stock_source === 'direct_reset' ? resetStock : setup.stock,
        carriers, items };
    const teachingState = { jing: q.jing, neili: q.neili, max_neili: q.max_neili,
        potential: q.potential, learned_points: q.learned_points, str: q.str, int: q.int, con: q.con, dex: q.dex,
        shen: q.shen, combat_exp: q.combat_exp, contribution: q.gongxian,
        skills: { ...a.skills }, mappings: { ...a.mappings }, learned: {}, grants: {},
        family: q['family/family_name'], master_id: q['family/master_id'], master_name: q['family/master_name'] };
    const snapshot = state => ({ object: student, id: 'left', userp: 1, playerp: 1, interactive: 1, living: 1,
        wizardp: 0, ghost: 0, busy: null, qi: 10000, eff_qi: 10000, max_qi: 10000,
        jing: state.jing, eff_jing: 10000, max_jing: 10000, neili: state.neili, max_neili: state.max_neili,
        str: state.str, skills: state.skills, learned: state.learned, mappings: state.mappings,
        weapon: 'none', weapon_details: {}, handing: 'none', temp: { apply: { damage: 0, armor: 100 } } });
    let state = structuredClone(teachingState), point = structuredClone(itemState);
    const prepSingleton = p.lesson === 'yinsuo' ? { object: silver, clonep: 0,
        before_create: setup.holder === 'cold' ? null : items[0].environment,
        after_create: items[0].environment, fallback: setup.holder === 'cold' ? 0 : 1 } : null;
    const steps = [];
    for (let n = 0; n < setup.asks; n++) {
        const before = structuredClone(state), itemBefore = structuredClone(point);
        let actualOwner = null;
        if (p.lesson === 'yinsuo') for (const id of point.items[0].owner_chain) {
            const pair = Object.entries(point.carriers).find(([, c]) => c.object === id);
            if (pair[1].is_character || pair[1].environment === null) { actualOwner = pair[0]; break; }
        }
        const decision = gumuItemAcquisitionDecision(p, point.stock, actualOwner), destroyed = [];
        let floor = false;
        if (decision.result === 'granted') {
            const weight = p.lesson === 'yinsuo' ? 1300 : 25000, who = point.carriers.student;
            floor = who.encumbrance + weight > who.max_encumbrance;
            const dest = floor ? room : student;
            if (p.lesson === 'yinsuo') {
                point.items[0].environment = dest; point.items[0].owner_chain = chain(dest); point.items[0].equipped = null;
                point.carriers.teacher.weapon = 'none'; point.carriers.teacher.apply.damage -= 150;
            } else {
                point.stock--;
                const old = point.items.filter(i => i.environment === dest);
                old.forEach(i => destroyed.push({ object: i.object, exists: 0 }));
                const combined = needle(dest, 50 + old.reduce((sum, i) => sum + i.amount, 0));
                point.items = [...point.items.filter(i => i.environment !== dest), combined];
            }
            for (const c of Object.values(point.carriers)) {
                const old = Object.values(itemBefore.carriers).find(o => o.object === c.object);
                const total = list => list.filter(i => i.owner_chain.includes(c.object)).reduce((sum, i) => sum + i.weight, 0);
                if (c.object !== room) c.encumbrance += total(point.items) - total(itemBefore.items);
                c.inventory = old.inventory.filter(id => !itemBefore.items.some(i => i.object === id));
                c.inventory.push(...point.items.filter(i => i.environment === c.object).map(i => i.object));
            }
        }
        state.jing -= cost;
        steps.push({ student, teacher, teacher_program: p.teacher.path, command: p.action, command_accepted: 1, elapsed: 0.001,
            before, after: structuredClone(state), item_before: itemBefore, item_after: structuredClone(point), destroyed_items: destroyed,
            message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: [{ category: 'say', text: '\u001b[36m' + decision.text + '\n' },
                ...(floor ? [{ category: 'vision', text: '只好先扔在一旁。\n' }] : [])] });
    }
    const initial = snapshot(teachingState), bystander = { ...structuredClone(initial), object: '/tests/teaching_actor#8', id: 'right' };
    const autonomy = heartbeat => ({ heartbeat, blueprint: p.teacher.path, blueprint_heartbeat: 0, callbacks: [] });
    return { kind: 'sample', condition_id: condition.id, method: 'teaching', outcome: p.expected, elapsed: 0.01,
        before: [initial, bystander], after: [snapshot(state), structuredClone(bystander)], teaching: steps,
        teacher_preparation: { command: 'test_interface', teacher, teacher_program: p.teacher.path,
            entry_actor: student, return_actor: student, initializer_actor: 'not_observed',
            before: structuredClone(initial), after: structuredClone(initial), autonomy_before: autonomy(1), autonomy_after: autonomy(0) },
        item_preparation: { scope: 'explicit_preparation_not_natural_acquisition', teacher, teacher_program: p.teacher.path,
            stock_key: setup.stock_key, stock_source: setup.stock_source, constructor_stock: p.lesson === 'yinsuo' ? null : 3,
            reset: setup.stock_source === 'direct_reset' ? { calls: 1, function: 'reset', owner: p.teacher.path,
                object: teacher, before: 3, after: resetStock, scope: 'direct_interface_not_natural_refresh' } : null,
            previous_teacher: setup.holder === 'previous_teacher' ? { command: 'test_interface',
                teacher: carriers.previous_teacher.object, teacher_program: p.teacher.path,
                entry_actor: student, return_actor: student, initializer_actor: 'not_observed',
                before: structuredClone(initial), after: structuredClone(initial),
                autonomy_before: autonomy(1), autonomy_after: autonomy(0),
                singleton_before_create: null, singleton_after_create: carriers.previous_teacher.object } : null,
            singleton: prepSingleton },
        metrics: [{ jing_cost: cost * setup.asks }, {}], launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [] };
}

test('27条件/54正式/27烟雾；源SHA完整且不注入李莫愁错技能', () => {
    assert.equal(cases.length, 27); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 54);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 27);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.equal(gumuItemAcquisitionSources.length, 27); assert.equal(gumuItemAcquisitionFixtureRequirements.length, 7);
    assert.equal(sha256(JSON.stringify(cases)), 'acfaeffca2c61b7313828fe8172cf34c4782ac59251252429e03299dcd40b2da');
    assert.equal(sha256(JSON.stringify(smoke)), 'f63270f7d0bf69c90bbb0d90e5a26e7a83c139385362689424aabed2a27be882');
    assert.equal(sha256(JSON.stringify(gumuItemAcquisitionSources.map(path => [path, sha256(read(path))]))), gumuItemAcquisitionReviewed);
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    for (const c of cases) {
        assert.equal(c.status, 'configured_not_executed'); assert.equal(c.method, 'teaching');
        assert.equal(c.parameters.fighting, false); assert.equal(c.parameters.observe_seconds, 0);
        assert.equal(c.parameters.actor.skills['bingpo-zhen'], undefined); assert.deepEqual(c.parameters.monitored_grants, []);
    }
    assert.equal(cases.filter(c => c.parameters.lesson === 'yufeng').length, 8);
    assert.equal(cases.filter(c => c.parameters.lesson === 'bingpo').length, 5);
    assert.equal(cases.filter(c => c.parameters.lesson === 'yinsuo').length, 14);
    const changed = path => read(path) + (path === 'feature/move.c' ? '\n' : '');
    assert.throws(() => gumuItemAcquisitionConditions(relations, catalog, changed), /源码变化/);
});

// Full shared-boundary fixture; still synthetic, never runtime evidence.
function integratedFixture(c) {
    const raw = fixture(c), p = c.parameters, a = p.actor, q = a.properties;
    const flags = ['character', 'family/family_name', 'family/master_id', 'family/master_name',
        'special_skill/tiandao', 'special_skill/qinzong', 'special_skill/wuxing', 'betrayer/times', 'env/no_learn'];
    for (const step of raw.teaching) for (const point of [step.before, step.after]) {
        point.effective_int = q.int + Math.trunc(a.skills.literate / 10);
        point.effective_dex = q.dex + Math.trunc(a.skills.dodge / 10);
    }
    for (const boundary of [raw.before[0], raw.after[0]]) Object.assign(boundary, {
        jingli: 10000, potential: q.potential, learned_points: q.learned_points,
        gender: q.gender, int: q.int, con: q.con, dex: q.dex, shen: q.shen, combat_exp: q.combat_exp,
        cultivation: Object.fromEntries(flags.map(k => [k, q[k] ?? null])), preparations: {},
        effective_skills: Object.fromEntries(Object.entries(a.skills).map(([k, v]) => [k, Math.trunc(v / 2)])),
        effective_str: q.str, effective_con: q.con + Math.trunc(a.skills.force / 20),
        effective_int: q.int + Math.trunc(a.skills.literate / 10),
        effective_dex: q.dex + Math.trunc(a.skills.dodge / 10), weapon_damage: 0, weapon_flag: 0, handing_details: {},
    });
    const prep = raw.teacher_preparation, first = raw.teaching[0].item_before.carriers.teacher;
    prep.before = structuredClone(raw.before[0]); prep.after = structuredClone(raw.before[0]);
    prep.loaded_before = Object.fromEntries(['suxin-jian', 'quanzhen-jian', 'yinsuo-jinling',
        'sanwu-shou', 'wudu-shenzhang', 'sad-strike'].map(k => [k, 1]));
    prep.loaded_after = { ...prep.loaded_before };
    prep.teacher_state = { object: prep.teacher, id: p.teacher.id, playerp: null, living: 1, skills: { force: 200 },
        weapon: first.weapon === 'none' ? 'none' : 'whip', weapon_damage: first.weapon === 'none' ? 0 : first.apply.damage - 100,
        weapon_flag: first.weapon === 'none' ? 0 : null,
        weapon_details: first.weapon === 'none' ? {} : { object: first.weapon },
        temp: { apply: structuredClone(first.apply), ...(first.weapon === 'none' ? {} : { weapon: first.weapon }) } };
    for (const step of raw.teaching) {
        step.resolved_teacher = prep.teacher; step.teacher_skills = structuredClone(prep.teacher_state.skills);
    }
    if (raw.item_preparation.previous_teacher) {
        raw.item_preparation.previous_teacher.before = structuredClone(raw.before[0]);
        raw.item_preparation.previous_teacher.after = structuredClone(raw.before[0]);
    }
    const final = structuredClone(prep.teacher_state), last = raw.teaching.at(-1).item_after.carriers.teacher;
    if (last.weapon !== first.weapon) {
        Object.assign(final, { weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {} });
        delete final.temp.weapon; final.temp.apply = structuredClone(last.apply);
    }
    raw.teacher_final = { state: final, autonomy: structuredClone(prep.autonomy_after) };
    raw.teacher_cleanup = { pending: 0, object_exists: 0 };
    raw.item_cleanup = { previous_teacher_exists: 0, owned_remaining: 0, singleton_exists: 0 };
    return raw;
}

test('房间无负重接口的显式null/0不冒充零重量，其余人物及容器账目仍严格', () => {
    for (const c of cases) for (const observed of [null, 0]) {
        const raw = integratedFixture(c);
        for (const step of raw.teaching) for (const point of [step.item_before, step.item_after])
            point.carriers.room.encumbrance = observed;
        assert.doesNotThrow(() => validateTeachingRecord(raw, c), c.id);
    }
    const c = pick('yufeng-exact-fit-repeat');
    for (const bad of [undefined, 1, -1, 0.5, '0', false, [], {}]) {
        const raw = integratedFixture(c);
        for (const step of raw.teaching) for (const point of [step.item_before, step.item_after]) {
            if (bad === undefined) delete point.carriers.room.encumbrance;
            else point.carriers.room.encumbrance = bad;
        }
        assert.throws(() => validateTeachingRecord(raw, c));
    }
    for (const [field, value] of [['object', '/tests/other'], ['program', '/tests/other'],
        ['max_encumbrance', null], ['max_encumbrance', 0], ['max_encumbrance', 99999999999]]) {
        const raw = integratedFixture(c);
        raw.teaching[0].item_before.carriers.room[field] = value;
        assert.throws(() => validateTeachingRecord(raw, c));
    }
    for (const [condition, role] of [[c, 'student'], [c, 'teacher'], [pick('yinsuo-student-container'), 'container']]) {
        for (const bad of [undefined, null, -1, 0.5, '0', false, [], {}]) {
            const raw = integratedFixture(condition);
            const carrier = raw.teaching[0].item_before.carriers[role];
            if (bad === undefined) delete carrier.encumbrance;
            else carrier.encumbrance = bad;
            assert.throws(() => validateTeachingRecord(raw, condition));
        }
        const changed = integratedFixture(condition);
        changed.teaching[0].item_after.carriers[role].encumbrance++;
        assert.throws(() => validateTeachingRecord(changed, condition));
    }
    const moved = integratedFixture(c);
    moved.teaching[0].item_after.carriers.room.encumbrance = 25000;
    assert.throws(() => validateTeachingRecord(moved, c), '不得用传播数量伪造不存在的房间计数');
});

test('共享真实入口注册尾部84条件，旧11940完整有序JSON不变；计划校验不放宽', () => {
    const registered = teachingConditions(relations, catalog)
        .filter(c => c.parameters.teaching_profile !== 'taohua-learning');
    assert.equal(registered.length, 12024); assert.equal(registered.reduce((n, c) => n + c.samples, 0), 54522);
    assert.equal(sha256(JSON.stringify(registered.slice(0, 11940))), 'e15ac7811b6322dc11c06b6669032b6d3bed869ccc041c0e7b030f540f94386e');
    assert.deepEqual(registered.filter(c => c.parameters.teaching_profile === 'gumu-item-acquisition'), cases);
    validateTeachingPlan(cases, registered);
    const bad = structuredClone(cases); bad[0].parameters.item_setup.stock++;
    assert.throws(() => validateTeachingPlan(bad, registered), /条件与核对版本不同/);
});

test('27条完整共享校验与frozen-condition报告，原raw不带parameters且保持不变', () => {
    const rows = cases.flatMap(c => Array.from({ length: c.samples }, (_, index) => ({
        condition_id: c.id, index, outcome: c.parameters.expected, raw: integratedFixture(c), raw_sha256: 'synthetic' })));
    const bytes = JSON.stringify(rows);
    for (const c of cases) validateTeachingRecord(rows.find(r => r.condition_id === c.id).raw, c);
    const report = summarizeTeachingRows({ identity: { conditions: cases } }, rows);
    assert.equal(report.conditions.length, 27);
    assert.equal(report.conditions.find(r => r.id.endsWith('yufeng-exhaust-merge')).gumu_items.granted_units, 300);
    assert.equal(JSON.stringify(rows), bytes);
});

test('共享负例：缺/错教师解析、清理、原卸下以外属性、资源与资格记录仍拒绝', () => {
    const c = pick('yinsuo-exact-fit-repeat');
    for (const change of [
        r => { delete r.teaching[0].resolved_teacher; }, r => { r.teaching[0].resolved_teacher += '9'; },
        r => { delete r.item_cleanup; }, r => { r.item_cleanup.owned_remaining = 1; },
        r => { r.item_cleanup.singleton_exists = 1; }, r => { r.teacher_cleanup.object_exists = 1; },
        r => { r.teacher_final.state.living = 0; }, r => { r.teacher_final.state.temp.apply.attack = 1; },
        r => { r.teacher_final.state.temp.foreign = 1; }, r => { delete r.before[0].cultivation.character; },
        r => { r.teacher_preparation.after.str++; }, r => { r.metrics[0].jing_cost--; },
        r => { r.teacher_final.state.weapon_flag = null; },
    ]) { const raw = integratedFixture(c); change(raw); assert.throws(() => validateTeachingRecord(raw, c)); }
});

test('明确无对象/不适用键保留实际null或整数0，缺键和未知类型不能当0', () => {
    for (const c of cases) for (const zero of [null, 0]) {
        const raw = fixture(c);
        for (const key of ['reset', 'singleton', 'previous_teacher', 'constructor_stock', 'stock_key'])
            if (raw.item_preparation[key] === null) raw.item_preparation[key] = zero;
        if (raw.item_preparation.singleton?.before_create === null) raw.item_preparation.singleton.before_create = zero;
        if (raw.item_preparation.previous_teacher) raw.item_preparation.previous_teacher.singleton_before_create = zero;
        for (const step of raw.teaching) for (const point of [step.item_before, step.item_after]) {
            point.carriers.room.environment = zero;
            if (point.stock === null) point.stock = zero;
        }
        validateGumuItemAcquisitionRecord(raw, c);
    }
    for (const [suffix, path] of [
        ['yufeng-skill99', ['item_preparation', 'reset']],
        ['yufeng-skill99', ['item_preparation', 'singleton']],
        ['yufeng-skill99', ['item_preparation', 'previous_teacher']],
        ['yinsuo-skill149', ['item_preparation', 'constructor_stock']],
        ['yinsuo-skill149', ['item_preparation', 'stock_key']],
        ['yinsuo-skill149', ['item_preparation', 'singleton', 'before_create']],
        ['yinsuo-skill149', ['teaching', 0, 'item_before', 'stock']],
        ['yinsuo-skill149', ['teaching', 0, 'item_before', 'carriers', 'room', 'environment']],
        ['yinsuo-previous-teacher', ['item_preparation', 'previous_teacher', 'singleton_before_create']],
    ]) for (const value of [undefined, 1, -1, '0', false, [], {}]) {
        const c = pick(suffix), raw = fixture(c); let parent = raw;
        for (const k of path.slice(0, -1)) parent = parent[k];
        if (value === undefined) delete parent[path.at(-1)]; else parent[path.at(-1)] = value;
        assert.throws(() => validateGumuItemAcquisitionRecord(raw, c), suffix + '/' + path.join('/'));
    }
});

test('真实create/openSeries接受全部纯ASCII入口，非法ID及缺源码入口仍拒绝', () => {
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-items-test-'));
    try {
        for (const [label, conditions] of [['formal', cases], ['smoke', smoke]]) {
            const path = join(directory, label), manifest = createSeries(path, { inventory, catalog, conditions,
                teachingEntries: entries(conditions), execution: { synthetic: true, driver_started: false } });
            assert.deepEqual(openSeries(path, manifest.identity), JSON.parse(JSON.stringify(manifest)));
            assert.deepEqual(manifest.identity.conditions, conditions);
        }
        const bad = structuredClone(cases[0]); bad.id += '-非法';
        assert.throws(() => createSeries(join(directory, 'invalid-id'), { inventory, catalog, conditions: [bad],
            teachingEntries: entries([bad]), execution: { synthetic: true } }), /条件 ID/);
        bad.id = cases[0].id; bad.entry_id += '-missing';
        assert.throws(() => createSeries(join(directory, 'missing-entry'), { inventory, catalog, conditions: [bad],
            teachingEntries: entries([bad]), execution: { synthetic: true } }), /源码清单/);
    } finally {
        assert.ok(basename(directory).startsWith('mud-gumu-items-test-')); assert.equal(resolve(directory, '..'), resolve(tmpdir()));
        rmSync(directory, { recursive: true, force: true });
    }
});

test('完整27条件合成记录兼容10/19精神、原4/5reset；原资料无parameters且不被修改', () => {
    for (const c of cases) for (const cost of [10, 19]) for (const stock of [4, 5]) {
        const raw = fixture(c, cost, stock), bytes = JSON.stringify(raw);
        assert.equal(raw.parameters, undefined); validateGumuItemAcquisitionRecord(raw, c);
        assert.equal(JSON.stringify(raw), bytes);
    }
});

test('领针100级每份50根；连续4问耗3份合150根，旧两堆被销毁且最后拒绝仍扣精神', () => {
    const c = pick('yufeng-exhaust-merge'), raw = fixture(c), result = validateGumuItemAcquisitionRecord(raw, c);
    assert.deepEqual(result.map(s => s.result), ['granted', 'granted', 'granted', 'refused']);
    assert.deepEqual(raw.teaching.map(s => s.item_after.stock), [2, 1, 0, 0]);
    assert.deepEqual(raw.teaching.map(s => s.item_after.items[0].amount), [50, 100, 150, 150]);
    assert.deepEqual(raw.teaching.map(s => s.destroyed_items.length), [0, 1, 1, 0]);
    const effects = gumuItemAcquisitionEffects([{ condition_id: c.id, raw }], c);
    assert.equal(effects.stock_spent, 3); assert.equal(effects.granted_units, 150); assert.equal(effects.player_units, 150);
    assert.equal(effects.asks, 4); assert.equal(effects.refused, 1); assert.equal(effects.merged_old_stacks, 2);
});

test('容量精确25000入手，24999落地；落地同路径旧50根合100且扣库存不等于入手', () => {
    const exact = pick('yufeng-exact-fit-repeat'), exactRaw = fixture(exact);
    assert.equal(validateGumuItemAcquisitionRecord(exactRaw, exact)[0].destination, 'student');
    const c = pick('yufeng-overflow-floor-merge'), raw = fixture(c);
    const effects = gumuItemAcquisitionEffects([{ condition_id: c.id, raw }], c);
    assert.equal(effects.player_units, 0); assert.equal(effects.floor_units, 50); assert.equal(effects.stock_spent, 1);
    assert.equal(raw.teaching[0].item_after.items[0].amount, 100);
});

test('李莫愁合法冰魄神针99/100/400及reset后都只受理/扣精神，不授物品也不扣库存', () => {
    for (const c of cases.filter(c => c.parameters.lesson === 'bingpo')) {
        const raw = fixture(c), e = gumuItemAcquisitionEffects([{ condition_id: c.id, raw }], c);
        assert.equal(raw.outcome, 'refused'); assert.equal(e.granted, 0); assert.equal(e.granted_units, 0); assert.equal(e.stock_spent, 0);
        assert.equal(e.accepted, 1); assert.equal(e.refused, 1); assert.equal(raw.metrics[0].jing_cost, 12);
        const injected = structuredClone(c); injected.parameters.actor.skills['bingpo-zhen'] = 100;
        assert.throws(() => gumuItemAcquisitionDecision(injected.parameters, 3, null), /错键/);
    }
});

test('银索150级从原老师取得同一非克隆对象，再问已持有；没有自动wield学生', () => {
    const c = pick('yinsuo-exact-fit-repeat'), raw = fixture(c), results = validateGumuItemAcquisitionRecord(raw, c);
    assert.deepEqual(results.map(r => r.result), ['granted', 'already_owned']);
    assert.equal(raw.teaching[0].item_after.items[0].object, silver); assert.equal(raw.teaching[0].item_after.items[0].clonep, 0);
    assert.equal(raw.teaching[0].item_after.carriers.teacher.weapon, 'none');
    assert.equal(raw.teaching[0].item_before.carriers.teacher.apply.damage - raw.teaching[0].item_after.carriers.teacher.apply.damage, 150);
    assert.equal(raw.teaching[0].item_after.carriers.student.weapon, 'none');
    assert.equal(gumuItemAcquisitionEffects([{ condition_id: c.id, raw }], c).already_owned, 1);
});

test('银索容量1299仍撤教师装备加成后落地；原成功话语不算玩家收到', () => {
    const c = pick('yinsuo-overflow'), raw = fixture(c), e = gumuItemAcquisitionEffects([{ condition_id: c.id, raw }], c);
    assert.equal(e.granted, 1); assert.equal(e.floor_units, 1); assert.equal(e.player_units, 0);
    assert.equal(raw.teaching[0].item_after.carriers.teacher.weapon, 'none');
    assert.equal(raw.teaching[0].item_after.carriers.teacher.encumbrance - raw.teaching[0].item_before.carriers.teacher.encumbrance, -1300);
});

test('银索自己/同门/外人/容器/地面按真正owner链拒绝，第二原教师以长鞭回退', () => {
    for (const suffix of ['student', 'student-container', 'peer', 'peer-container', 'outsider', 'room', 'room-container', 'previous-teacher']) {
        const c = pick('yinsuo-' + suffix), raw = fixture(c), result = validateGumuItemAcquisitionRecord(raw, c)[0];
        assert.equal(result.result, suffix.startsWith('student') ? 'already_owned' : 'refused');
        assert.equal(raw.item_preparation.singleton.fallback, 1);
        assert.match(raw.teaching[0].item_before.carriers.teacher.weapon, /^\/clone\/weapon\/changbian#/);
    }
});

test('直接reset只验证原4/5范围和同一对象一次调用；未观测自然补货不报0', () => {
    for (const kind of ['yufeng', 'bingpo']) {
        const c = pick(kind + '-direct-reset'), raw = fixture(c, 12, 5);
        const e = gumuItemAcquisitionEffects([{ condition_id: c.id, raw }], c);
        assert.equal(e.direct_resets, 1); assert.equal(e.natural_resets, 'not_observed');
        for (const mutate of [r => { r.item_preparation.reset.calls = 2; }, r => { r.item_preparation.reset.scope = 'natural'; },
            r => { r.item_preparation.reset.object = '/other#1'; }, r => { delete r.item_preparation.constructor_stock; }]) {
            const bad = structuredClone(raw); mutate(bad); assert.throws(() => validateGumuItemAcquisitionRecord(bad, c));
        }
        assert.throws(() => validateGumuItemAcquisitionRecord(fixture(c, 12, 3), c));
        assert.throws(() => validateGumuItemAcquisitionRecord(fixture(c, 12, 6), c));
    }
});

test('第二原教师构造不得清走第一位及银索；两次真实命令准备和心跳暂停分别留证', () => {
    const c = pick('yinsuo-previous-teacher'), raw = fixture(c);
    validateGumuItemAcquisitionRecord(raw, c);
    for (const mutate of [
        r => { r.item_preparation.previous_teacher = null; },
        r => { r.item_preparation.previous_teacher.teacher = r.item_preparation.teacher; },
        r => { r.item_preparation.previous_teacher.autonomy_after.heartbeat = 1; },
        r => { r.item_preparation.previous_teacher.autonomy_before.callbacks.push({ function: 'chat' }); },
        r => { r.item_preparation.previous_teacher.singleton_before_create = '/other#1'; },
        r => { r.item_preparation.previous_teacher.singleton_after_create = '/other#1'; },
        r => { r.teaching[0].item_before.carriers.teacher.apply.damage = 250; },
        r => { r.teaching[0].item_before.carriers.previous_teacher.weapon = 'none'; },
    ]) { const bad = structuredClone(raw); mutate(bad); assert.throws(() => validateGumuItemAcquisitionRecord(bad, c)); }
});

test('负例：错误数量/重量/毒源/换对象/旧堆未销毁/丢库存/容量/陌生物品/装备变化不能伪造通过', () => {
    const c = pick('yufeng-overflow-floor-merge'), raw = fixture(c);
    const mutations = [
        r => { r.teaching[0].item_after.items[0].amount = 50; },
        r => { r.teaching[0].item_after.items[0].weight--; },
        r => { r.teaching[0].item_after.items[0].daub.poison.id = 'other'; },
        r => { delete r.teaching[0].item_after.items[0].daub; },
        r => { r.teaching[0].item_after.items[0].clonep = 0; },
        r => { r.teaching[0].item_after.items[0].program = '/other'; },
        r => { r.teaching[0].destroyed_items = []; },
        r => { r.teaching[0].destroyed_items[0].exists = 1; },
        r => { r.teaching[0].item_after.stock++; },
        r => { delete r.teaching[0].item_after.stock; },
        r => { r.teaching[0].item_after.stock = null; },
        r => { r.teaching[0].item_after.carriers.student.encumbrance += 25000; },
        r => { r.teaching[0].item_after.carriers.student.max_encumbrance++; },
        r => { r.teaching[0].item_after.carriers.room.encumbrance--; },
        r => { r.teaching[0].item_after.carriers.room.inventory.push('/unexpected#1'); },
        r => { r.teaching[0].item_after.carriers.teacher.apply.damage++; },
        r => { r.teaching[0].item_after.carriers.teacher.weapon = 'none'; },
        r => { r.teaching[0].item_after.items[0].owner_chain = []; },
        r => { r.teaching[0].item_after.items[0].environment = r.teaching[0].student; },
        r => { r.teaching[0].item_after.items[0].equipped = 'wielded'; },
        r => { delete r.teaching[0].item_before.carriers.student.max_encumbrance; },
        r => { r.teaching[0].messages.pop(); },
    ];
    for (const [i, mutate] of mutations.entries()) { const bad = structuredClone(raw); mutate(bad); assert.throws(() => validateGumuItemAcquisitionRecord(bad, c), `negative ${i}`); }
});

test('负例：银索克隆/被换/复制两件/未撤加成/自动装备/错误owner容器和冷态证据均拒绝', () => {
    const c = pick('yinsuo-overflow'), raw = fixture(c);
    for (const mutate of [
        r => { r.teaching[0].item_after.items[0].object += '#22'; },
        r => { r.teaching[0].item_after.items[0].clonep = 1; },
        r => { r.teaching[0].item_after.items.push(structuredClone(r.teaching[0].item_after.items[0])); },
        r => { r.teaching[0].item_after.carriers.teacher.apply.damage += 150; },
        r => { r.teaching[0].item_after.carriers.teacher.weapon = silver; },
        r => { r.teaching[0].item_after.carriers.student.weapon = silver; },
        r => { r.teaching[0].item_after.items[0].consistence = 99; },
        r => { r.teaching[0].item_after.items[0].weapon_prop.damage++; },
        r => { r.item_preparation.singleton.before_create = '/somebody#1'; },
        r => { r.item_preparation.singleton.fallback = 1; },
    ]) { const bad = structuredClone(raw); mutate(bad); assert.throws(() => validateGumuItemAcquisitionRecord(bad, c)); }
    const bagCase = pick('yinsuo-student-container'), bag = fixture(bagCase);
    bag.teaching[0].item_before.carriers.container.environment = bag.teaching[0].item_before.carriers.room.object;
    assert.throws(() => validateGumuItemAcquisitionRecord(bag, bagCase));
});

test('负例：非USER/忙乱/换教师/prepare改资格/精神回填/额外资源/受理替代授予/缺观测拒绝', () => {
    const c = pick('yufeng-exact-fit-repeat'), raw = fixture(c);
    for (const mutate of [
        r => { r.before[0].userp = 0; }, r => { r.after[0].busy = 1; }, r => { delete r.after[0].busy; },
        r => { r.teaching[1].teacher += '0'; }, r => { r.teaching[0].teacher_program = '/other'; },
        r => { r.teacher_preparation.after.skills.force++; }, r => { r.teacher_preparation.autonomy_after.heartbeat = 1; },
        r => { r.teacher_preparation.autonomy_before.callbacks.push({ function: 'unexpected' }); },
        r => { r.teaching[1].before.jing = 10000; }, r => { r.teaching[0].after.neili--; },
        r => { r.after[0].qi--; }, r => { r.after[0].temp.apply.damage++; },
        r => { r.metrics[0].jing_recovery = 1; }, r => { r.metrics[1].qi_cost = 1; },
        r => { r.metrics[0] = null; }, r => { r.teaching[0].command_accepted = 0; },
        r => { r.teaching[0].messages = []; }, r => { r.outcome = 'refused'; },
        r => { r.after[1].jing--; }, r => { r.callbacks.push({}); },
    ]) { const bad = structuredClone(raw); mutate(bad); assert.throws(() => validateGumuItemAcquisitionRecord(bad, c)); }
    const denied = pick('yinsuo-skill149'), wrong = fixture(denied); wrong.outcome = 'observed';
    assert.throws(() => validateGumuItemAcquisitionRecord(wrong, denied));
});

test('显式null/0仅未设置flag/equipped/busy合法；缺键、未知类型不当零', () => {
    const c = pick('yinsuo-overflow');
    for (const zero of [null, 0]) {
        const raw = fixture(c);
        for (const point of [raw.teaching[0].item_before, raw.teaching[0].item_after]) point.items[0].flag = zero;
        raw.teaching[0].item_after.items[0].equipped = zero;
        validateGumuItemAcquisitionRecord(raw, c);
    }
    for (const value of [undefined, '0', false, [], {}]) {
        const raw = fixture(c); raw.teaching[0].item_after.items[0].flag = value;
        assert.throws(() => validateGumuItemAcquisitionRecord(raw, c));
    }
    const missing = fixture(c); delete missing.teaching[0].item_after.items[0].flag;
    assert.throws(() => validateGumuItemAcquisitionRecord(missing, c));
});
