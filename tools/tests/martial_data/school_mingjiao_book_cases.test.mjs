import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { mingjiaoBookConditions as conditions, mingjiaoBookSourcePaths as sources,
    validateMingjiaoBookCondition as validateCondition, validateMingjiaoBookRecord as validate,
    mingjiaoBookEffects as effects, mingjiaoBookProgress as progress } from './school_mingjiao_book_cases.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = p => fs.readFileSync(path.join(root, p)), hash = v => createHash('sha256').update(v).digest('hex');
const copy = v => structuredClone(v), skill = 'qiankun-danuoyi', book = '/clone/book/qiankun_book';
const catalog = { skills: ['force', 'parry', 'unarmed', 'dodge', 'literate', 'sanscrit', skill].map(id =>
    ({ id, sha256: hash(read('kungfu/skill/' + id + '.c')) })) };
const cases = conditions(catalog, read), get = variant => cases.find(c => c.parameters.variant === variant);
const ids = { student: '/tests/teaching_actor#1', right: '/tests/actor#2' };
const qualifications = ['env/no_learn', 'env/auto_regenerate', 'special_skill/wuxing',
    'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex', 'special_skill/clever'];
const room = (p, stock, initial = false) => ({ object: p.book_setup.room, program: p.book_setup.room,
    no_fight: initial ? 0 : p.room_setup.no_fight, pigging: initial ? 0 : p.room_setup.pigging, xin_count: stock ?? 0 });
const family = { family_name: '明教' };
function point(p, state) {
    const q = p.actor.properties, sk = state.skills;
    return { contribution: q.gongxian, jing: state.jing, neili: q.neili, max_neili: q.max_neili, max_jingli: q.max_jingli,
        potential: q.potential, learned_points: q.learned_points, combat_exp: q.combat_exp, shen: q.shen, weiwang: q.weiwang,
        str: q.str, int: q.int, dex: q.dex, con: q.con, gender: q.gender, character: q.character,
        busy: p.actor.busy ?? 0, fighting: Number(p.fighting), born_family: 0, doing: 0, study_time: state.studyTime,
        room: room(p, state.stock), conditions: {}, skills: copy(sk), learned: copy(state.learned), mappings: {}, preparations: {},
        grants: {}, temp_apply: { armor: 100 }, effective_skills: Object.fromEntries(Object.entries(sk).map(([k, v]) => [k, Math.trunc(v / 2)])),
        effective_str: q.str + Math.trunc(sk.unarmed / 10), effective_int: q.int + Math.trunc(sk.literate / 10),
        effective_dex: q.dex + Math.trunc(sk.dodge / 10), effective_force: 500, effective_dodge: 100,
        reborn_family: 0, family: '明教', master_id: 0, master_name: 0,
        qualification: Object.fromEntries(qualifications.map(k => [k, q[k]])), recruitment: { family: copy(family), family_present: 1,
            name: q.name, class: q.class, title: q.title, history: { 'detach/明教': 0, 'betrayer/明教': 0, 'betrayer/times': 0 },
            quest: copy(q.quest), temp_quest: copy(p.actor.temp.quest), pending_apprentice: '', pending_betrayer: '' } };
}
function snapshot(p, side, state, carrier, roomValue = room(p, state.stock)) {
    const config = side ? p.target : p.actor, q = config.properties, sk = side ? config.skills : state.skills;
    return { object: ids[side ? 'right' : 'student'], id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1,
        living: 1, wizardp: 0, ghost: 0, busy: side ? 0 : p.actor.busy ?? 0, fighting: Number(p.fighting),
        ...Object.fromEntries(['qi', 'eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'neili', 'max_neili', 'jingli', 'max_jingli',
            'potential', 'learned_points', 'str', 'int', 'dex', 'con', 'combat_exp', 'gender'].map(k => [k, q[k]])),
        jing: side ? q.jing : state.jing, skills: copy(sk), learned: side ? {} : copy(state.learned),
        effective_skills: Object.fromEntries(Object.entries(sk).map(([k, v]) => [k, Math.trunc(v / 2)])), mappings: {}, preparations: {},
        effective_int: q.int + Math.trunc((sk.literate ?? 0) / 10), effective_str: q.str + Math.trunc((sk.unarmed ?? 0) / 10),
        effective_dex: q.dex + Math.trunc((sk.dodge ?? 0) / 10), weapon: 'none', secondary_weapon: 'none', handing: 'none',
        weapon_details: {}, secondary_weapon_details: {}, handing_details: {}, temp: { apply: { armor: 100 } },
        cultivation: { class: '', 'family/family_name': '明教', born_family: 0, doing: 0, 'env/no_learn': 0,
            'env/auto_regenerate': 0, 'special_skill/clever': q['special_skill/clever'] },
        conditions: {}, study_time: side ? 0 : state.studyTime,
        inventory: copy(carrier.inventory), encumbrance: carrier.encumbrance, max_encumbrance: carrier.max_encumbrance,
        environment: carrier.environment, room: copy(roomValue) };
}
function itemPoint(p, exists, stock, initial = false) {
    const roomId = p.book_setup.room;
    const carriers = {
        student: { object: ids.student, program: '/tests/teaching_actor', environment: roomId, is_character: 1,
            family: '明教', encumbrance: 0, max_encumbrance: 89000, inventory: [] },
        right: { object: ids.right, program: '/tests/actor', environment: roomId, is_character: 1,
            family: '明教', encumbrance: 0, max_encumbrance: 89000, inventory: [] },
        room: { object: roomId, program: roomId, environment: 0, family: 0, is_character: 0, encumbrance: 0,
            max_encumbrance: 100000000000, inventory: [ids.student, ids.right,
                ...(roomId === '/d/mingjiao/mishi' ? ['/d/mingjiao/obj/yangdt#3', '/d/mingjiao/obj/yangfr#4'] : [])] },
    };
    return { carriers, room: room(p, stock, initial), letters: [], items: [exists ? {
        key: 'qiankun_book', exists: 1, object: book, program: book, clonep: 0, id: 'qiankunbook', environment: 0,
        owner_chain: [], weight: 600, amount: 0, skill: { name: skill, exp_required: 1000000, jing_cost: 200,
            difficulty: 45, max_skill: 310, need: { sanscrit: 200 } },
    } : { key: 'qiankun_book', exists: 0, object: '', program: '' }] };
}
function relocate(v, holder) {
    const i = v.items[0]; for (const [role, c] of Object.entries(v.carriers)) {
        c.inventory = c.inventory.filter(id => id !== book);
        if (role === 'student') c.encumbrance = holder === 'student' ? 600 : 0;
    }
    i.environment = holder === 'unowned' ? 0 : v.carriers[holder].object;
    i.owner_chain = holder === 'unowned' ? [] : holder === 'student' ? [ids.student, v.carriers.room.object] : [v.carriers.room.object];
    if (holder !== 'unowned') v.carriers[holder].inventory.push(book);
}
// Independent finite fake consumer traces. They test contracts, not actual MUD success.
function fixture(c, fee = 199) {
    const p = c.parameters, initial = itemPoint(p, p.book_setup.holder !== 'cold', p.book_setup.room === '/d/mingjiao/mishi' ? 1 : 0, true);
    const state = { skills: copy(p.actor.skills), learned: {}, jing: p.actor.properties.jing, studyTime: 0,
        stock: p.book_setup.stock, holder: p.book_setup.holder === 'cold' ? 'absent' : p.book_setup.holder };
    let current = copy(initial); current.room = room(p, state.stock);
    if (state.holder !== 'absent') relocate(current, state.holder);
    current.carriers.student.max_encumbrance = current.carriers.student.encumbrance + p.book_setup.free_capacity;
    const stageRoom = { object: '/tests/runner', program: '/tests/runner', no_fight: 0, pigging: 0, xin_count: 0 };
    const playersBefore = [0, 1].map(side => snapshot(p, side, state, { environment: '/tests/runner', inventory: [],
        encumbrance: 0, max_encumbrance: 89000 }, stageRoom));
    const playersAfter = [0, 1].map(side => snapshot(p, side, state, current.carriers[side ? 'right' : 'student']));
    const prepAfter = copy(current), teaching = []; let totalCost = 0, notifyFail;
    const failures = {
        'study-pigging': '你还是专心拱猪吧！', 'study-busy': '你现在正忙着呢。',
        'study-fighting': '你无法在战斗中专心下来研读新知！',
        'study-times-1': '读书次数最少一次，最多也不能超过一百次。',
        'study-times101': '读书次数最少一次，最多也不能超过一百次。',
        'study-unheld': '没这本书可读啊？', 'study-literate0': '你是个文盲，先学点文化(literate)吧。',
        'study-no-fight': '你无法在这个地方安心读书。',
        'study-exp999999': '你的实战经验不足，再怎么读也没用。',
        'study-sanscrit199': '你研读了一会儿，发现如果不通晓梵文的话，恐怕难以领会上面的含义。',
        'study311': '你研读了一会儿，但是发现上面所说的对你而言都太浅了，没有学到任何东西。',
        'study310-exp1m': '也许是缺乏实战经验，你对羊皮上面所说的东西总是无法领会。',
    };
    for (const command of p.teaching_expectations) {
        const before = point(p, state), itemBefore = copy(current); let accepted = 7, text = '', wall = 1791999999;
        if (command.command_kind === 'ketou') {
            if (!state.stock || ['student', 'room'].includes(state.holder))
                text = '你忽然发现遗骨似乎被别人翻弄过，莫非被人取走了什么东西？';
            else {
                state.stock = 0; state.holder = 'room'; current.items = itemPoint(p, true, 0).items; relocate(current, 'room');
                const letter = { object: '/d/mingjiao/obj/yixin#5', program: '/d/mingjiao/obj/yixin', clonep: 1,
                    id: 'yi xin', environment: p.book_setup.room, weight: 100 };
                current.letters.push(letter); current.carriers.room.inventory.push(letter.object);
                text = '突然你抬眼看到遗骨下面，有一些东西，你看了看，原来是一封信和一张羊皮。';
            }
        } else if (command.command_kind === 'get') {
            if (p.book_setup.free_capacity < 600) { accepted = 0; text = '羊皮对你而言太重了。'; }
            else { state.holder = 'student'; relocate(current, 'student'); text = '你捡起一张羊皮。'; }
        } else if (Object.hasOwn(failures, p.variant)) {
            text = failures[p.variant]; if (p.variant !== 'study-exp999999') accepted = 0;
        } else {
            const times = Number(command.action.split(' ').at(-1)); let completed = 0;
            for (let n = 0; n < times; n++) { if (state.jing <= fee) { totalCost += state.jing; state.jing = 0; break; }
                totalCost += fee; state.jing -= fee; completed++; }
            const oldLevel = state.skills[skill], input = Math.trunc(p.actor.skills.literate / (p.actor.properties['special_skill/clever'] ? 5 : 10)) + 1;
            for (let n = 0; n < completed; n++) {
                state.learned[skill] = (state.learned[skill] ?? 0) + 1 + Math.trunc(input * 100 / (state.skills[skill] + 100));
                if (state.learned[skill] > (state.skills[skill] + 1) ** 2) { state.skills[skill]++; state.learned[skill] = 0; }
            }
            state.studyTime = wall;
            text = completed ? '你研读了有关乾坤大挪移的技巧，似乎有点心得。' : '你现在太累了，结果一行也没有看下去。';
            if (completed && completed < times) text += '你现在已经过于疲倦，无法继续研读新知。';
            if (state.skills[skill] > oldLevel) text += '你的「乾坤大挪移」进步了！你潜心修炼乾坤大挪移心法，若有所悟。';
        }
        current.room = room(p, state.stock);
        if (!accepted) notifyFail = text + '\n';
        teaching.push({ student: ids.student, teacher: 'none', resolved_teacher: 'none', teacher_program: 'none', teacher_skills: {},
            command: command.action, command_accepted: accepted, elapsed: 0.001, wall_time: wall, before, after: point(p, state),
            item_before: itemBefore, item_after: copy(current), message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: accepted ? [{ category: 'tell_object', text }] : [], ...(command.command_kind === 'study'
                ? { resolved_book: itemBefore.items[0].environment === ids.student ? book : '' } : {}) });
    }
    const after = [0, 1].map(side => snapshot(p, side, state, current.carriers[side ? 'right' : 'student']));
    if (notifyFail !== undefined) after[0].temp.notify_fail = notifyFail;
    const cleanupSnapshots = after.map(s => { s = copy(s); s.environment = '/tests/runner'; s.room = { ...stageRoom,
        no_fight: p.room_setup.no_fight, pigging: p.room_setup.pigging };
        s.encumbrance -= Number(s.inventory.includes(book)) * 600; s.inventory = s.inventory.filter(id => id !== book); return s; });
    return { kind: 'sample', condition_id: c.id, method: 'teaching', index: 0, elapsed: 0.01, outcome: p.expected,
        before: playersAfter, after, teaching, teacher_preparations: [], teacher_cleanups: [], callbacks: [], terminals: [],
        metrics: [totalCost ? { jing_cost: totalCost } : {}, {}],
        book_preparation: { command: 'test_interface', entry_actor: ids.student, return_actor: ids.student,
            book_loaded_before: 0, room_loaded_before: Number(p.book_setup.room === '/tests/runner'),
            room_constructor_stock: p.book_setup.room === '/d/mingjiao/mishi' ? 1 : 0,
            setup: { ...copy(p.book_setup), stock: p.book_setup.stock === null ? 0 : p.book_setup.stock },
            players_before: playersBefore, players_after: copy(playersAfter), initial_state: initial, item_after: prepAfter },
        book_cleanup: { singleton: { object: book, exists_after: 0 }, room: { object: p.book_setup.room, program: p.book_setup.room,
            exists_after: Number(p.book_setup.room === '/tests/runner') },
            letters: current.letters.map(l => ({ object: l.object, program: l.program, exists_after: 0 })), players_after_move: cleanupSnapshots } };
}
const bad = (c, edit) => { const raw = fixture(c); edit(raw); assert.throws(() => validate(raw, c)); };

test('26/52/56 fixed ketou/get/study conditions and exact original command entries', () => {
    assert.equal(cases.length, 26); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 52);
    assert.equal(cases.reduce((n, c) => n + c.samples * c.parameters.teaching_expectations.length, 0), 56);
    assert.equal(cases.filter(c => c.parameters.teaching_kind === 'study').length, 20);
    assert.deepEqual(conditions(catalog, read, { smoke: true }), cases); assert.equal(sources.length, 50);
    const missingGet = copy(get('ketou-available-repeat')); missingGet.parameters.teaching_expectations.splice(1, 1);
    assert.throws(() => validateCondition(missingGet));
    assert.throws(() => conditions(catalog, p => p === 'cmds/skill/study.c' ? Buffer.concat([read(p), Buffer.from('\n')]) : read(p)));
    const wrongEntry = copy(get('study200')); wrongEntry.entry_id = 'cmds/skill/study.c:11:main'; assert.throws(() => validateCondition(wrongEntry));
});
test('all 26 independent synthetic consumers satisfy the frozen contracts', () => {
    for (const c of cases) assert.equal(validate(fixture(c), c).length, c.parameters.teaching_expectations.length);
});
test('cold ketou stock, original floor book and one cloned letter, then get and repeat are distinct', () => {
    const c = get('ketou-available-repeat'), r = fixture(c), v = validate(r, c);
    assert.deepEqual(v.map(v => v.result), ['obtained-floor', 'received', 'refused']);
    assert.equal(v[0].stock_consumed, 1); assert.equal(v[2].stock_consumed, 0);
    assert.equal(r.teaching[2].item_after.letters.length, 1);
    bad(c, r => { r.teaching.splice(1, 1); }); bad(c, r => { r.teaching[0].after.room.xin_count = 1; });
    bad(c, r => { r.teaching[2].item_after.letters.push(copy(r.teaching[2].item_after.letters[0])); });
    for (const variant of ['ketou-stock0', 'ketou-self', 'ketou-room']) {
        const x = get(variant); assert.equal(validate(fixture(x), x)[0].book_created, 0);
        bad(x, r => { const wrong = variant === 'ketou-stock0' ? 1 : 0;
            r.teaching[0].item_after.room.xin_count = wrong; r.teaching[0].after.room.xin_count = wrong; });
    }
});
test('raw get capacity uses exact remaining599/600 and never raw-drop transfer', () => {
    assert.equal(validate(fixture(get('get599')), get('get599'))[0].accepted, 0);
    assert.equal(validate(fixture(get('get600')), get('get600'))[0].book_received, 1);
    bad(get('get599'), r => { r.teaching[0].command_accepted = 1; });
    bad(get('get599'), r => { r.teaching[0].item_after.items[0].environment = ids.student; });
    bad(get('get600'), r => { r.book_preparation.item_after.carriers.student.max_encumbrance = 599; });
});
test('book0 natural upgrade is gross22/net0; raw200/310 and clever gains remain independent', () => {
    assert.deepEqual(progress(0, 1), { level: 1, learned: 0, gross: 22, upgrades: 1 });
    assert.deepEqual(progress(200, 1), { level: 200, learned: 8, gross: 8, upgrades: 0 });
    assert.deepEqual(progress(310, 1), { level: 310, learned: 6, gross: 6, upgrades: 0 });
    assert.equal(progress(200, 1, true).gross, 14);
    bad(get('study0'), r => { r.teaching[0].messages[0].text = '你研读了技巧，似乎有点心得。'; });
    bad(get('study0'), r => { r.after[0].skills[skill] = 0; });
    bad(get('study200'), r => { r.teaching[0].after.learned[skill] = 22; });
});
test('study199 clears199; study200 completes1 for199 leaving1; partial399 pays398 plus writeoff1', () => {
    const tired = validate(fixture(get('study-jing199')), get('study-jing199'))[0];
    assert.equal(tired.completed, 0); assert.equal(tired.study_fee, 0); assert.equal(tired.jing_writeoff, 199);
    const fits = validate(fixture(get('study-jing200')), get('study-jing200'))[0];
    assert.equal(fits.completed, 1); assert.equal(fits.study_fee, 199); assert.equal(fits.jing_writeoff, 0);
    assert.equal(fixture(get('study-jing200')).after[0].jing, 1); assert.equal(get('study-jing200').parameters.expected, 'observed');
    const partial = validate(fixture(get('study-partial399')), get('study-partial399'))[0];
    assert.equal(partial.completed, 2); assert.equal(partial.study_fee, 398); assert.equal(partial.jing_writeoff, 1);
    assert.equal(partial.source_derived_gross, 16); assert.equal(partial.accepted, 1);
    assert.throws(() => validate(fixture(get('study200'), 200), get('study200')));
    bad(get('study-partial399'), r => { r.metrics[0].jing_cost = 398; });
    bad(get('study-jing199'), r => { delete r.metrics[0].jing_cost; });
});
test('311 reaches book maximum with parry400; exp1m raw310 separately fails can-improve', () => {
    assert.equal(get('study311').parameters.actor.skills.parry, 400);
    assert.equal(validate(fixture(get('study311')), get('study311'))[0].completed, 0);
    bad(get('study311'), r => { r.after[0].temp.notify_fail = '你的基本招架火候有限。\n'; });
    bad(get('study310-exp1m'), r => { r.teaching[0].command_accepted = 7; });
    bad(get('study-exp999999'), r => { r.teaching[0].command_accepted = 0; });
});
test('early room, busy, fighting, missing-book and reading gates cannot gain or charge', () => {
    for (const variant of ['study-pigging', 'study-busy', 'study-fighting', 'study-no-fight', 'study-unheld',
        'study-literate0', 'study-sanscrit199', 'study-times-1', 'study-times101']) {
        const c = get(variant); const r = fixture(c); validate(r, c);
        bad(c, r => { r.teaching[0].command_accepted = 7; }); bad(c, r => { r.teaching[0].after.learned[skill] = 1; });
        bad(c, r => { r.metrics[0].jing_cost = 199; }); bad(c, r => { delete r.after[0].temp.notify_fail; });
    }
});
test('real USER slots, original book provenance, full carrier chain and cleanup are required', () => {
    const c = get('study200');
    bad(c, r => { r.book_preparation.item_after.carriers.right.program = '/tests/teaching_actor'; });
    bad(c, r => { r.before[0].wizardp = 1; }); bad(c, r => { r.book_preparation.return_actor = '/tests/runner'; });
    bad(c, r => { r.teaching[0].teacher = '/kungfu/class/mingjiao/zhangwuji#9'; });
    bad(c, r => { r.teaching[0].resolved_book = ''; }); bad(c, r => { r.skill_load_context = {}; });
    bad(c, r => { r.teaching[0].item_after.items[0].skill.max_skill = 311; });
    bad(c, r => { r.teaching[0].item_after.items[0].owner_chain.pop(); });
    bad(c, r => { r.teaching[0].item_after.items[0].clonep = 1; });
    bad(c, r => { r.book_cleanup.singleton.exists_after = 1; });
    bad(c, r => { r.book_cleanup.players_after_move[0].inventory.push(book); });
    bad(get('ketou-available-repeat'), r => { r.book_cleanup.letters = []; });
    // A selected original blueprint is not evidence that this BOOK forbids cloning.
    assert.ok(read('clone/book/qiankun_book.c').toString().includes('set_default_object(__FILE__)'));
});
test('metadata/unknown envelopes/index/sparse resource events remain fail closed', () => {
    const c = get('study200');
    for (const index of [null, -1, 2, false, '0']) bad(c, r => { r.index = index; });
    for (const elapsed of [null, -1, Infinity, NaN, false, '0']) bad(c, r => { r.elapsed = elapsed; });
    bad(c, r => { delete r.elapsed; }); bad(c, r => { delete r.metrics; }); bad(c, r => { r.metrics[1] = null; });
    bad(c, r => { r.metrics[1].jing_cost = 1; }); bad(c, r => { r.callbacks = ['fake']; });
    for (const outcome of ['error', 'not_applicable']) {
        const raw = { kind: 'sample', condition_id: c.id, method: 'teaching', index: 0, elapsed: 0, outcome, reason: 'real diagnostic' };
        assert.deepEqual(validate(raw, c), []);
        for (const reason of [null, '', ' ', 0]) { const r = copy(raw); r.reason = reason; assert.throws(() => validate(r, c)); }
        const missing = copy(raw); delete missing.reason; assert.throws(() => validate(missing, c));
    }
});
test('original unset stage fields allow observed null zeros but never missing keys or nonzero flags', () => {
    const c = get('ketou-available-repeat'), raw = fixture(c);
    for (const phase of [raw.book_preparation.players_before, raw.book_cleanup.players_after_move])
        for (const s of phase) for (const k of ['no_fight', 'pigging', 'xin_count']) s.room[k] = null;
    validate(raw, c);
    bad(c, r => { r.book_preparation.players_before[0].room.no_fight = 1; });
    bad(c, r => { r.book_cleanup.players_after_move[0].room.xin_count = 1; });
    bad(c, r => { delete r.book_cleanup.players_after_move[0].room.pigging; });
    bad(get('study-no-fight'), r => { r.book_cleanup.players_after_move[0].room.no_fight = null; });
});
test('raw snapshots permit own null/zero/empty conditions; point normalization remains strict', () => {
    const c = get('ketou-available-repeat');
    const snapshots = r => [r.before, r.after, r.book_preparation.players_before,
        r.book_preparation.players_after, r.book_cleanup.players_after_move].flat();
    for (const observed of [null, 0, {}]) {
        const raw = fixture(c); for (const s of snapshots(raw)) s.conditions = copy(observed); validate(raw, c);
    }
    const mixed = fixture(c); snapshots(mixed).forEach((s, i) => { s.conditions = [null, 0, {}][i % 3]; }); validate(mixed, c);
    for (const invalid of [{ 'qiankun-except': 1 }, [], '0', false]) {
        const raw = fixture(c); for (const s of snapshots(raw)) s.conditions = copy(invalid);
        assert.throws(() => validate(raw, c));
    }
    bad(c, r => { delete r.before[0].conditions; });
    bad(c, r => { delete r.book_cleanup.players_after_move[0].conditions; });
    for (const value of [null, 0, [], { 'qiankun-except': 1 }])
        bad(c, r => { r.teaching[0].before.conditions = copy(value); });
});
test('12 original notify_fail refusals require actual full temp literal, never a substitute transcript', () => {
    const variants = ['get599', 'study-pigging', 'study-busy', 'study-fighting', 'study-times-1', 'study-times101',
        'study-unheld', 'study-literate0', 'study-no-fight', 'study-sanscrit199', 'study311', 'study310-exp1m'];
    assert.equal(variants.length, 12);
    for (const variant of variants) {
        const c = get(variant), raw = fixture(c); assert.deepEqual(raw.teaching[0].messages, []); validate(raw, c);
        const literal = raw.after[0].temp.notify_fail;
        bad(c, r => { r.teaching[0].messages = [{ category: 'vision', text: literal }]; delete r.after[0].temp.notify_fail; });
        bad(c, r => { r.after[0].temp.notify_fail = literal.trimEnd(); });
        for (const value of [null, 0, '别的拒绝。\n']) bad(c, r => { r.after[0].temp.notify_fail = value; });
        bad(c, r => { delete r.teaching[0].messages; });
        bad(c, r => { r.teaching[0].messages = [{ category: 'vision' }]; });
    }
    for (const variant of ['ketou-stock0', 'get600', 'study-exp999999', 'study-jing199', 'study200', 'study0']) {
        const c = get(variant); bad(c, r => { r.after[0].temp.notify_fail = r.teaching[0].messages.map(m => m.text).join('') + '\n';
            r.teaching[0].messages = []; });
    }
});
test('study null input decodes to exact integer0 setup; all four runtime setup fields remain mandatory', () => {
    const c = get('study0'), raw = fixture(c);
    assert.equal(c.parameters.book_setup.stock, null); assert.equal(raw.book_preparation.setup.stock, 0); validate(raw, c);
    for (const invalid of [null, 1, '0', false, {}, []]) bad(c, r => { r.book_preparation.setup.stock = invalid; });
    for (const field of ['room', 'holder', 'stock', 'free_capacity']) bad(c, r => { delete r.book_preparation.setup[field]; });
    bad(c, r => { r.book_preparation.setup.extra = 0; });
    bad(c, r => { r.book_preparation.setup.room = '/d/mingjiao/mishi'; });
    bad(c, r => { r.book_preparation.setup.free_capacity = 599; });
    for (const variant of ['ketou-stock0', 'ketou-available-repeat']) {
        const a = get(variant); validate(fixture(a), a);
        for (const invalid of [null, '0', false]) bad(a, r => { r.book_preparation.setup.stock = invalid; });
        bad(a, r => { r.book_preparation.setup.stock = variant === 'ketou-stock0' ? 1 : 0; });
    }
});
test('Effects separate stock/book/letter/receipt/fees/writeoff/upgrades and valid requested counts', () => {
    const all = cases.map(c => effects([0, 1].map(index => { const raw = fixture(c); raw.index = index;
        return { condition_id: c.id, outcome: raw.outcome, raw }; }), c));
    const sum = key => all.reduce((n, v) => n + v[key], 0);
    assert.equal(sum('commands'), 56); assert.equal(sum('ketou_calls'), 10); assert.equal(sum('get_calls'), 6);
    assert.equal(sum('study_calls'), 40); assert.equal(sum('study_invalid_times_commands'), 4);
    assert.equal(sum('stock_consumed'), 2); assert.equal(sum('books_created'), 2); assert.equal(sum('letters_created'), 2);
    assert.equal(sum('player_receipts'), 4); assert.equal(sum('study_completed'), 20);
    assert.equal(sum('study_fee'), 3980); assert.equal(sum('jing_writeoff'), 400); assert.equal(sum('jing_cost'), 4380);
    assert.equal(sum('source_derived_gross'), 196); assert.equal(sum('learned_net'), 152); assert.equal(sum('upgrades'), 2);
    assert.equal(sum('potential_cost'), 0); assert.equal(sum('learned_points_added'), 0);
    const c = get('study200'), raw = { kind: 'sample', condition_id: c.id, method: 'teaching', index: 0,
        elapsed: 0, outcome: 'error', reason: 'unobserved real error' };
    const e = effects([{ condition_id: c.id, outcome: 'error', raw }], c);
    assert.equal(e.unknown, 1); assert.equal(e.study_completed, null); assert.equal(e.source_derived_gross, null);
    assert.throws(() => effects([{ condition_id: c.id, outcome: 'observed', raw }], c));
});
