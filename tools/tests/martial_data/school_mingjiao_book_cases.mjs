// Finite original ketou/get/study commands, not a complete secret-passage route.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const copy = v => structuredClone(v), sha = v => createHash('sha256').update(v).digest('hex');
const group = 'mingjiao-book', prefix = 'school-mingjiao-book-', book = '/clone/book/qiankun_book';
const skill = 'qiankun-danuoyi', mishi = '/d/mingjiao/mishi';
export const mingjiaoBookProfile = group;
export const mingjiaoBookSourcePaths = [
    'd/mingjiao/mishi.c', 'd/mingjiao/obj/yangdt.c', 'd/mingjiao/obj/yangfr.c', 'd/mingjiao/obj/yixin.c',
    'clone/book/qiankun_book.c', 'kungfu/skill/qiankun-danuoyi.c', 'kungfu/skill/force.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'kungfu/skill/literate.c', 'kungfu/skill/sanscrit.c', 'cmds/skill/study.c', 'cmds/skill/learn.c',
    'cmds/std/get.c', 'clone/user/user.c', 'inherit/char/char.c', 'inherit/skill/skill.c',
    'inherit/skill/force.c', 'inherit/item/book.c', 'inherit/item/item.c', 'inherit/room/room.c',
    'feature/skill.c', 'feature/attribute.c', 'feature/equip.c', 'feature/dbase.c', 'feature/damage.c',
    'feature/action.c', 'feature/attack.c', 'feature/condition.c', 'feature/name.c', 'feature/command.c',
    'feature/move.c', 'mudcore/inherit/dbase.c', 'mudcore/inherit/action.c', 'mudcore/inherit/room.c',
    'adm/daemons/commandd.c', 'adm/daemons/itemd.c', 'adm/single/simul_efun/message.c',
    'adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c', 'data/e2c_dict.o',
    'include/globals.h', 'include/command.h', 'include/skill.h', 'include/dbase.h', 'include/room.h',
    'include/move.h', 'include/name.h', 'mudcore/include/ansi.h',
];
export const mingjiaoBookReviewedSourceHash = '91f3061355f085dadf27249233536eda69b69f9ef8a0c233083d88bb502ae69f';
export const mingjiaoBookAbsentPaths = [];
const hashSources = e => sha(JSON.stringify(mingjiaoBookSourcePaths.map(p => [p, e[p]])));
const entries = {
    ketou: { path: 'd/mingjiao/mishi.c', line: 35, function: 'do_ketou' },
    get: { path: 'cmds/std/get.c', line: 12, function: 'main' },
    study: { path: 'cmds/skill/study.c', line: 10, function: 'main' },
};
const history = ['detach/明教', 'betrayer/明教', 'betrayer/times'];
const qualifications = ['env/no_learn', 'env/auto_regenerate', 'special_skill/wuxing',
    'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int',
    'tattoo/tattoo_dex', 'reborn/dex', 'special_skill/clever'];
const pool = { name: '试侠', gender: '男性', class: '', title: '普通百姓', character: '光明磊落',
    str: 36, int: 40, dex: 36, con: 36, shen: 80000, combat_exp: 10000000,
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 9000, max_neili: 9000, jingli: 1000, max_jingli: 1000,
    potential: 10000, learned_points: 0, gongxian: 4321, weiwang: 123, jiali: 0,
    'family/family_name': '明教', quest: { name: '实验旧任务', count: 7 }, 'reborn/family_name': 0,
    ...Object.fromEntries([...history, ...qualifications].map(k => [k, 0])) };
function plans() {
    const rows = [];
    const step = (kind, action) => ({ command_kind: kind, action, ...(kind === 'study' ? { book: 'qiankun_book' } : {}) });
    const add = (variant, kind, edit = () => {}) => {
        const p = { school: 'mingjiao', family: '明教', collection_group: group, teaching_profile: group,
            teaching_kind: kind === 'study' ? 'study' : 'item-acquisition', variant, skill,
            actor: { skills: { force: 1000, parry: 400, unarmed: 200, dodge: 200,
                literate: 200, sanscrit: 200, [skill]: 200 }, mappings: {}, preparations: {},
                properties: copy(pool), temp: { quest: { name: '实验临时任务', count: 3 } } },
            target: { skills: { force: 1 }, mappings: {}, preparations: {},
                properties: { ...copy(pool), name: '试客' } },
            book_setup: { room: kind === 'study' ? '/tests/runner' : mishi,
                holder: kind === 'ketou' ? 'cold' : kind === 'get' ? 'room' : 'student',
                stock: kind === 'study' ? null : 1, free_capacity: 600 },
            teaching_expectations: [step(kind, kind === 'study' ? 'study qiankunbook 1'
                : kind === 'get' ? 'get qiankunbook' : 'ketou')],
            room_setup: { no_fight: 0, pigging: 0 },
            monitored_grants: [], qualification_sources: mingjiaoBookSourcePaths, named_participants: true,
            fighting: false, observe_seconds: 0, not_applicable: '', random_observation: false,
            note: '原普通USER ketou/get/study；书、库存、修为与场所为实验初态。只核原密室取书和有限研读，不冒完整密道路线、教师授课或自然培养；书此次用原blueprint，不宣称不能clone。' };
        edit(p); p.action = p.teaching_expectations[0].action;
        p.expected = ['ketou-available-repeat', 'get600', 'study0', 'study200', 'study310',
            'study-jing200', 'study-partial399', 'study-clever', 'study-full3'].includes(variant) ? 'observed' : 'refused';
        rows.push({ id: prefix + variant, stage: 'school', method: 'teaching', parameters: p });
    };
    add('ketou-available-repeat', 'ketou', p => { p.teaching_expectations = [
        step('ketou', 'ketou'), step('get', 'get qiankunbook'), step('ketou', 'ketou')]; });
    add('ketou-stock0', 'ketou', p => { p.book_setup.stock = 0; });
    add('ketou-self', 'ketou', p => { p.book_setup.holder = 'student'; });
    add('ketou-room', 'ketou', p => { p.book_setup.holder = 'room'; });
    add('get599', 'get', p => { p.book_setup.free_capacity = 599; }); add('get600', 'get');
    add('study0', 'study', p => { p.actor.skills[skill] = 0; }); add('study200', 'study');
    add('study310', 'study', p => { p.actor.skills[skill] = 310; });
    add('study311', 'study', p => { p.actor.skills[skill] = 311; });
    add('study-exp999999', 'study', p => { p.actor.properties.combat_exp = 999999; });
    add('study-sanscrit199', 'study', p => { p.actor.skills.sanscrit = 199; });
    add('study-literate0', 'study', p => { p.actor.skills.literate = 0; });
    add('study-unheld', 'study', p => { p.book_setup.holder = 'room'; });
    add('study-no-fight', 'study', p => { p.room_setup.no_fight = 1; });
    add('study-busy', 'study', p => { p.actor.busy = 2; });
    add('study-fighting', 'study', p => { p.fighting = true; });
    add('study-pigging', 'study', p => { p.room_setup.pigging = 1; });
    for (const jing of [199, 200]) add('study-jing' + jing, 'study', p => { p.actor.properties.jing = jing; });
    add('study-partial399', 'study', p => { p.actor.properties.jing = 399;
        p.teaching_expectations[0].action = 'study qiankunbook 3'; });
    for (const times of [-1, 101]) add('study-times' + times, 'study', p => {
        p.teaching_expectations[0].action = 'study qiankunbook ' + times; });
    add('study-clever', 'study', p => { p.actor.properties['special_skill/clever'] = 1; });
    add('study-full3', 'study', p => { p.teaching_expectations[0].action = 'study qiankunbook 3'; });
    add('study310-exp1m', 'study', p => { p.actor.skills[skill] = 310; p.actor.properties.combat_exp = 1000000; });
    assert.equal(rows.length, 26); assert.equal(rows.reduce((n, c) => n + c.parameters.teaching_expectations.length * 2, 0), 56);
    return rows;
}
export function mingjiaoBookConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function'); assert.equal(typeof smoke, 'boolean'); assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const e = Object.fromEntries(mingjiaoBookSourcePaths.map(p => [p, sha(readSource(p))]));
    assert.equal(hashSources(e), mingjiaoBookReviewedSourceHash, 'book source closure changed; review required');
    for (const entry of Object.values(entries)) assert.equal(readSource(entry.path).toString().split('\n')
        .findIndex(s => new RegExp('^int ' + entry.function + '\\(').test(s)) + 1, entry.line);
    for (const id of Object.keys(plans()[0].parameters.actor.skills))
        assert.equal(catalog.skills.find(s => s.id === id)?.sha256, e['kungfu/skill/' + id + '.c']);
    return plans().map(c => {
        const commands = c.parameters.teaching_expectations.map(s => ({ ...s, command_entry: {
            ...entries[s.command_kind], id: entries[s.command_kind].path + ':' + entries[s.command_kind].line + ':' + entries[s.command_kind].function,
            role: 'teaching', sha256: e[entries[s.command_kind].path] } }));
        return { ...c, entry_id: commands[0].command_entry.id, samples: 2, status: 'prepared_not_sampled', parameters: {
            ...c.parameters, teaching_expectations: commands, teaching_entry: copy(commands[0].command_entry),
            source_evidence: copy(e), reviewed_source_hash: mingjiaoBookReviewedSourceHash,
            qualification_evidence: mingjiaoBookSourcePaths.map(path => ({ path, sha256: e[path] })), absent_sources: [] } };
    });
}

const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v), 'mapping required'); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing ' + k); return v[k]; };
const integer = v => { assert.ok(Number.isSafeInteger(v), 'observed integer required'); return v; };
const zero = v => assert.ok(v === 0 || v === null, 'observed LPC zero required');
const emptyConditions = v => {
    if (v === null || v === 0) return;
    assert.deepEqual(map(v), {}, 'only observed empty conditions are allowed');
};
const equal = (v, e) => e === 0 ? zero(v) : assert.deepEqual(v, e);
const keys = (v, expected) => assert.deepEqual(Object.keys(map(v)).sort(), [...expected].sort());
const plain = v => { assert.equal(typeof v, 'string'); return v.replace(/\x1b\[(?:[0-9;]*m|256D|K)/g, ''); };
let planIndex;
export function validateMingjiaoBookCondition(c) {
    planIndex ??= new Map(plans().map(c => [c.id, c.parameters])); const planned = planIndex.get(c.id); assert.ok(planned);
    assert.equal(c.method, 'teaching'); assert.equal(c.stage, 'school'); assert.equal(c.samples, 2);
    const { teaching_entry, source_evidence: e, qualification_evidence, reviewed_source_hash, absent_sources,
        teaching_expectations, ...rest } = map(c.parameters);
    const { teaching_expectations: commands, ...expected } = planned; assert.deepEqual(rest, expected);
    assert.deepEqual(Object.keys(map(e)), mingjiaoBookSourcePaths); for (const h of Object.values(e)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(hashSources(e), mingjiaoBookReviewedSourceHash); assert.equal(reviewed_source_hash, mingjiaoBookReviewedSourceHash);
    assert.deepEqual(qualification_evidence, mingjiaoBookSourcePaths.map(path => ({ path, sha256: e[path] })));
    assert.deepEqual(absent_sources, []);
    assert.deepEqual(teaching_expectations, commands.map(s => ({ ...s, command_entry: {
        ...entries[s.command_kind], id: entries[s.command_kind].path + ':' + entries[s.command_kind].line + ':' + entries[s.command_kind].function,
        role: 'teaching', sha256: e[entries[s.command_kind].path] } })));
    assert.deepEqual(teaching_entry, teaching_expectations[0].command_entry); assert.equal(c.entry_id, teaching_entry.id);
    return c.parameters;
}
const bookSkill = { name: skill, exp_required: 1000000, jing_cost: 200, difficulty: 45,
    max_skill: 310, need: { sanscrit: 200 } };
function roomState(v, p, stock) {
    keys(v, ['object', 'program', 'no_fight', 'pigging', 'xin_count']);
    assert.equal(own(v, 'object'), p.book_setup.room); assert.equal(own(v, 'program'), p.book_setup.room);
    equal(own(v, 'no_fight'), p.room_setup.no_fight); equal(own(v, 'pigging'), p.room_setup.pigging);
    equal(own(v, 'xin_count'), stock ?? 0);
}
function stageRoomState(v, p, configured) {
    keys(v, ['object', 'program', 'no_fight', 'pigging', 'xin_count']);
    assert.equal(own(v, 'object'), '/tests/runner'); assert.equal(own(v, 'program'), '/tests/runner');
    equal(own(v, 'no_fight'), configured ? p.room_setup.no_fight : 0);
    equal(own(v, 'pigging'), configured ? p.room_setup.pigging : 0); zero(own(v, 'xin_count'));
}
function point(v, p, state) {
    const q = p.actor.properties;
    for (const [field, key] of [['contribution', 'gongxian'], ['neili', 'neili'], ['max_neili', 'max_neili'],
        ['max_jingli', 'max_jingli'], ['potential', 'potential'], ['learned_points', 'learned_points'],
        ['combat_exp', 'combat_exp'], ['shen', 'shen'], ['weiwang', 'weiwang'], ['str', 'str'], ['int', 'int'],
        ['dex', 'dex'], ['con', 'con'], ['gender', 'gender'], ['character', 'character']]) equal(own(v, field), q[key]);
    assert.equal(own(v, 'jing'), state.jing); equal(own(v, 'busy'), p.actor.busy ?? 0);
    assert.equal(own(v, 'fighting'), Number(p.fighting)); zero(own(v, 'born_family')); zero(own(v, 'doing'));
    equal(own(v, 'study_time'), state.studyTime); roomState(own(v, 'room'), p, state.stock);
    assert.deepEqual(own(v, 'conditions'), {}); assert.deepEqual(own(v, 'skills'), state.skills);
    assert.deepEqual(own(v, 'learned'), state.learned); assert.deepEqual(own(v, 'mappings'), {});
    assert.deepEqual(own(v, 'preparations'), {}); assert.deepEqual(own(v, 'grants'), {});
    assert.deepEqual(own(v, 'temp_apply'), { armor: 100 });
    assert.deepEqual(own(v, 'effective_skills'), Object.fromEntries(Object.entries(state.skills).map(([k, n]) => [k, Math.trunc(n / 2)])));
    assert.equal(own(v, 'effective_str'), q.str + Math.trunc(state.skills.unarmed / 10));
    assert.equal(own(v, 'effective_int'), q.int + Math.trunc(state.skills.literate / 10));
    assert.equal(own(v, 'effective_dex'), q.dex + Math.trunc(state.skills.dodge / 10));
    assert.equal(own(v, 'effective_force'), 500); assert.equal(own(v, 'effective_dodge'), 100);
    zero(own(v, 'reborn_family')); assert.equal(own(v, 'family'), '明教');
    zero(own(v, 'master_id')); zero(own(v, 'master_name'));
    keys(own(v, 'qualification'), qualifications); for (const k of qualifications) equal(own(v.qualification, k), q[k]);
    const r = own(v, 'recruitment'); assert.deepEqual(own(r, 'family'), { family_name: '明教' });
    assert.equal(own(r, 'family_present'), 1); for (const k of ['name', 'class', 'title']) assert.equal(own(r, k), q[k]);
    keys(own(r, 'history'), history); for (const k of history) zero(own(r.history, k));
    assert.deepEqual(own(r, 'quest'), q.quest); assert.deepEqual(own(r, 'temp_quest'), p.actor.temp.quest);
    for (const k of ['pending_apprentice', 'pending_betrayer']) assert.equal(own(r, k), '');
}
function itemPoint(v, p, stock, identity) {
    const cs = own(v, 'carriers'); keys(cs, ['student', 'right', 'room']); roomState(own(v, 'room'), p, stock);
    const ids = Object.values(cs).map(c => own(c, 'object')); assert.equal(new Set(ids).size, 3);
    const byId = new Map(Object.values(cs).map(c => [c.object, c]));
    for (const [role, c] of Object.entries(cs)) {
        assert.equal(own(c, 'program'), role === 'student' ? '/tests/teaching_actor' : role === 'right' ? '/tests/actor' : p.book_setup.room);
        if (role === 'room') {
            assert.equal(c.object, p.book_setup.room); zero(own(c, 'environment')); zero(own(c, 'is_character'));
            zero(own(c, 'encumbrance')); assert.equal(own(c, 'max_encumbrance'), 100000000000); zero(own(c, 'family'));
        } else {
            assert.match(c.object, role === 'student' ? /^\/tests\/teaching_actor#[0-9]+$/ : /^\/tests\/actor#[0-9]+$/);
            assert.equal(own(c, 'is_character'), 1); assert.equal(own(c, 'family'), '明教');
            assert.equal(own(c, 'environment'), cs.room.object); assert.ok(integer(own(c, 'encumbrance')) >= 0);
            assert.ok(integer(own(c, 'max_encumbrance')) >= 0);
        }
        const inv = own(c, 'inventory'); assert.ok(Array.isArray(inv) && inv.every(id => typeof id === 'string'));
        assert.equal(new Set(inv).size, inv.length); if (identity) assert.equal(c.object, identity[role]);
    }
    assert.ok(cs.room.inventory.includes(cs.student.object) && cs.room.inventory.includes(cs.right.object));
    if (p.book_setup.room === mishi) for (const stem of ['yangdt', 'yangfr'])
        assert.equal(cs.room.inventory.filter(id => new RegExp('^/d/mingjiao/obj/' + stem + '#[0-9]+$').test(id)).length, 1);
    const items = own(v, 'items'); assert.ok(Array.isArray(items) && items.length === 1); const i = items[0];
    assert.equal(own(i, 'key'), 'qiankun_book'); assert.ok([0, 1].includes(own(i, 'exists')));
    if (!i.exists) assert.deepEqual(i, { key: 'qiankun_book', exists: 0, object: '', program: '' });
    else {
        assert.equal(own(i, 'object'), book); assert.equal(own(i, 'program'), book); zero(own(i, 'clonep'));
        assert.equal(own(i, 'id'), 'qiankunbook'); assert.equal(own(i, 'weight'), 600); zero(own(i, 'amount'));
        assert.deepEqual(own(i, 'skill'), bookSkill); const chain = []; let cursor = own(i, 'environment');
        while (cursor !== 0 && cursor !== null) { assert.ok(byId.has(cursor) && !chain.includes(cursor));
            chain.push(cursor); cursor = byId.get(cursor).environment; }
        assert.deepEqual(own(i, 'owner_chain'), chain);
    }
    const ls = own(v, 'letters'); assert.ok(Array.isArray(ls)); const letterIds = new Set();
    for (const l of ls) {
        assert.match(own(l, 'object'), /^\/d\/mingjiao\/obj\/yixin#[0-9]+$/); assert.ok(!letterIds.has(l.object)); letterIds.add(l.object);
        assert.equal(own(l, 'program'), '/d/mingjiao/obj/yixin'); assert.equal(own(l, 'clonep'), 1);
        assert.equal(own(l, 'id'), 'yi xin'); assert.equal(own(l, 'weight'), 100); assert.equal(own(l, 'environment'), cs.room.object);
    }
    for (const c of Object.values(cs)) {
        assert.equal(c.inventory.filter(id => id === book).length, Number(i.exists && i.environment === c.object));
        for (const l of ls) assert.equal(c.inventory.filter(id => id === l.object).length, Number(l.environment === c.object));
    }
    assert.equal(cs.right.encumbrance, 0); assert.equal(cs.student.encumbrance, Number(i.exists && i.environment === cs.student.object) * 600);
    return { identities: Object.fromEntries(Object.entries(cs).map(([k, v]) => [k, v.object])), holder:
        !i.exists ? 'absent' : !i.environment ? 'unowned' : i.environment === cs.student.object ? 'student' : 'room' };
}
// Derived exact progress of the original non-weak improve_skill calls. No hidden RNG observation is fabricated.
export function mingjiaoBookProgress(level, count, clever = false, literate = 200) {
    let learned = 0, gross = 0, upgrades = 0;
    const input = Math.trunc(literate / (clever ? 5 : 10)) + 1;
    for (let n = 0; n < count; n++) {
        const gain = 1 + Math.trunc(input * 100 / (level + 100)); gross += gain; learned += gain;
        if (learned > (level + 1) ** 2) { level++; learned = 0; upgrades++; }
    }
    return { level, learned, gross, upgrades };
}
const notice = {
    stock: '你忽然发现遗骨似乎被别人翻弄过，莫非被人取走了什么东西？',
    found: '突然你抬眼看到遗骨下面，有一些东西，你看了看，原来是一封信和一张羊皮。',
    tooHeavy: '羊皮对你而言太重了。', pigging: '你还是专心拱猪吧！', busy: '你现在正忙着呢。',
    fighting: '你无法在战斗中专心下来研读新知！', times: '读书次数最少一次，最多也不能超过一百次。',
    unheld: '没这本书可读啊？', literate: '你是个文盲，先学点文化(literate)吧。', noFight: '你无法在这个地方安心读书。',
    exp: '你的实战经验不足，再怎么读也没用。', sanscrit: '你研读了一会儿，发现如果不通晓梵文的话，恐怕难以领会上面的含义。',
    max: '你研读了一会儿，但是发现上面所说的对你而言都太浅了，没有学到任何东西。',
    improve: '也许是缺乏实战经验，你对羊皮上面所说的东西总是无法领会。',
    tired: '你现在太累了，结果一行也没有看下去。', partial: '你现在已经过于疲倦，无法继续研读新知。',
};
function decision(p, state, command) {
    const d = { result: 'refused', accepted: true, completed: 0, study_fee: 0, jing_writeoff: 0,
        gross: 0, upgrades: 0, book_created: 0, letters_created: 0, book_received: 0, notice: '' };
    if (command.command_kind === 'ketou') {
        if (state.stock < 1 || ['student', 'room'].includes(state.holder)) return { ...d, notice: notice.stock };
        state.stock = 0; state.holder = 'room'; return { ...d, result: 'obtained-floor', book_created: 1, letters_created: 1, notice: notice.found };
    }
    if (command.command_kind === 'get') {
        assert.equal(state.holder, 'room'); if (p.book_setup.free_capacity < 600) return { ...d, accepted: false, notice: notice.tooHeavy };
        state.holder = 'student'; return { ...d, result: 'received', book_received: 1, notice: '捡起一张羊皮。' };
    }
    assert.equal(command.command_kind, 'study');
    const refusals = { 'study-pigging': 'pigging', 'study-busy': 'busy', 'study-fighting': 'fighting',
        'study-times-1': 'times', 'study-times101': 'times', 'study-unheld': 'unheld',
        'study-literate0': 'literate', 'study-no-fight': 'noFight', 'study-sanscrit199': 'sanscrit',
        'study311': 'max', 'study310-exp1m': 'improve' };
    if (Object.hasOwn(refusals, p.variant)) return { ...d, accepted: false, notice: notice[refusals[p.variant]] };
    if (p.variant === 'study-exp999999') return { ...d, notice: notice.exp };
    const times = Number(command.action.split(' ').at(-1)), cost = Math.max(10, Math.trunc((4000 + 45 - 60) / 20));
    const completed = Math.min(times, Math.max(0, Math.floor((state.jing - 1) / cost)));
    const fee = completed * cost, writeoff = completed < times ? state.jing - fee : 0;
    const progress = mingjiaoBookProgress(state.skills[skill], completed, !!p.actor.properties['special_skill/clever']);
    state.jing -= fee + writeoff; state.skills[skill] = progress.level;
    if (completed) state.learned[skill] = progress.learned;
    return { ...d, result: completed ? 'studied' : 'tired', completed, study_fee: fee, jing_writeoff: writeoff,
        gross: progress.gross, upgrades: progress.upgrades, notice: completed < times ? completed ? notice.partial : notice.tired : '' };
}

function boundary(v, p, side, state, carrier, inPreparation = false) {
    const config = side ? p.target : p.actor, q = config.properties;
    assert.equal(own(v, 'object'), carrier.object);
    assert.match(v.object, side ? /^\/tests\/actor#[0-9]+$/ : /^\/tests\/teaching_actor#[0-9]+$/);
    assert.equal(own(v, 'id'), side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(v, k), 1);
    for (const k of ['wizardp', 'ghost']) zero(own(v, k));
    equal(own(v, 'busy'), side ? 0 : config.busy ?? 0); assert.equal(own(v, 'fighting'), Number(p.fighting));
    for (const k of ['qi', 'eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'neili', 'max_neili', 'jingli', 'max_jingli',
        'potential', 'learned_points', 'str', 'int', 'dex', 'con', 'combat_exp', 'gender']) assert.equal(own(v, k), q[k]);
    assert.equal(own(v, 'jing'), side ? q.jing : state.jing);
    const sk = side ? config.skills : state.skills;
    assert.deepEqual(own(v, 'skills'), sk); assert.deepEqual(own(v, 'learned'), side ? {} : state.learned);
    assert.deepEqual(own(v, 'effective_skills'), Object.fromEntries(Object.entries(sk).map(([k, n]) => [k, Math.trunc(n / 2)])));
    for (const k of ['mappings', 'preparations']) assert.deepEqual(own(v, k), {});
    assert.equal(own(v, 'effective_int'), q.int + Math.trunc((sk.literate ?? 0) / 10));
    assert.equal(own(v, 'effective_str'), q.str + Math.trunc((sk.unarmed ?? 0) / 10));
    assert.equal(own(v, 'effective_dex'), q.dex + Math.trunc((sk.dodge ?? 0) / 10));
    for (const k of ['weapon', 'secondary_weapon', 'handing']) assert.equal(own(v, k), 'none');
    for (const k of ['weapon_details', 'secondary_weapon_details', 'handing_details']) assert.deepEqual(own(v, k), {});
    assert.deepEqual(own(own(v, 'temp'), 'apply'), { armor: 100 });
    const cult = own(v, 'cultivation'); assert.equal(own(cult, 'class'), ''); assert.equal(own(cult, 'family/family_name'), '明教');
    zero(own(cult, 'born_family')); zero(own(cult, 'doing')); zero(own(cult, 'env/no_learn')); zero(own(cult, 'env/auto_regenerate'));
    equal(own(cult, 'special_skill/clever'), q['special_skill/clever']);
    emptyConditions(own(v, 'conditions')); equal(own(v, 'study_time'), side ? 0 : state.studyTime);
    assert.deepEqual([...own(v, 'inventory')].sort(), [...carrier.inventory].sort());
    assert.equal(own(v, 'encumbrance'), carrier.encumbrance); assert.equal(own(v, 'max_encumbrance'), carrier.max_encumbrance);
    assert.equal(own(v, 'environment'), carrier.environment);
    if (!inPreparation) roomState(own(v, 'room'), p, state.stock);
}
function stableSnapshots(a, b, mutable = []) {
    a = copy(a); b = copy(b); for (const k of mutable) { delete a[k]; delete b[k]; }
    for (const v of [a, b]) { emptyConditions(own(v, 'conditions')); v.conditions = {};
        const temp = own(v, 'temp'); delete temp.notify_fail;
        if (Object.hasOwn(temp, 'time')) { map(temp.time); delete temp.time.study; if (!Object.keys(temp.time).length) delete temp.time; }
    }
    assert.deepEqual(a, b);
}
function stableItems(before, after, p, state, d) {
    const identity = Object.fromEntries(Object.entries(before.carriers).map(([k, v]) => [k, v.object]));
    const context = itemPoint(after, p, state.stock, identity); assert.equal(context.holder, state.holder);
    const a = copy(before), b = copy(after), bookWas = a.items[0].exists;
    if (!d.book_created) {
        assert.equal(b.items[0].exists, Number(!!bookWas));
        if (bookWas) { const ai = copy(a.items[0]), bi = copy(b.items[0]);
            for (const k of ['environment', 'owner_chain']) { delete ai[k]; delete bi[k]; } assert.deepEqual(ai, bi); }
    } else { assert.equal(bookWas, 0); assert.equal(b.items[0].exists, 1); }
    assert.equal(b.letters.length, a.letters.length + d.letters_created);
    if (d.letters_created) {
        assert.equal(a.letters.length, 0); assert.equal(b.letters.length, 1);
    } else assert.deepEqual(b.letters, a.letters);
    const special = new Set([book, ...a.letters.map(l => l.object), ...b.letters.map(l => l.object)]);
    for (const role of ['student', 'right', 'room']) {
        const ac = a.carriers[role], bc = b.carriers[role];
        assert.deepEqual(ac.inventory.filter(id => !special.has(id)).sort(), bc.inventory.filter(id => !special.has(id)).sort());
        for (const c of [ac, bc]) { delete c.inventory; delete c.encumbrance; }
        assert.deepEqual(ac, bc);
    }
    for (const v of [a, b]) { delete v.items; delete v.letters; delete v.room.xin_count; }
    assert.deepEqual(a, b);
}
function preparation(raw, p) {
    const g = own(raw, 'book_preparation'); keys(g, ['command', 'entry_actor', 'return_actor', 'book_loaded_before',
        'room_loaded_before', 'room_constructor_stock', 'setup', 'players_before', 'players_after', 'initial_state', 'item_after']);
    assert.equal(g.command, 'test_interface');
    keys(own(g, 'setup'), ['room', 'holder', 'stock', 'free_capacity']);
    // The frozen study input uses JSON null; the original LPC decode/emit records integer zero.
    // Only this reviewed field is compared against its exact runtime representation.
    assert.deepEqual(g.setup, { ...p.book_setup, stock: p.book_setup.stock === null ? 0 : p.book_setup.stock });
    assert.equal(g.book_loaded_before, 0); assert.equal(g.room_loaded_before, Number(p.book_setup.room === '/tests/runner'));
    equal(g.room_constructor_stock, p.book_setup.room === mishi ? 1 : 0);
    for (const k of ['players_before', 'players_after']) assert.ok(Array.isArray(g[k]) && g[k].length === 2);
    assert.deepEqual(g.players_after, raw.before); const state = { skills: copy(p.actor.skills), learned: {}, jing: p.actor.properties.jing,
        studyTime: 0, stock: p.book_setup.stock, holder: p.book_setup.holder === 'cold' ? 'absent' : p.book_setup.holder };
    const after = itemPoint(g.item_after, p, state.stock); const ids = after.identities;
    for (const k of ['entry_actor', 'return_actor']) assert.equal(g[k], ids.student);
    assert.equal(after.holder, state.holder); assert.equal(g.item_after.letters.length, 0);
    const initialP = { ...p, room_setup: { no_fight: 0, pigging: 0 } };
    const initial = itemPoint(g.initial_state, initialP, p.book_setup.room === mishi ? 1 : 0, ids);
    assert.equal(initial.holder, p.book_setup.holder === 'cold' ? 'absent' : 'unowned'); assert.equal(g.initial_state.letters.length, 0);
    assert.equal(g.item_after.carriers.student.max_encumbrance,
        g.item_after.carriers.student.encumbrance + p.book_setup.free_capacity);
    for (const side of [0, 1]) {
        boundary(g.players_after[side], p, side, state, g.item_after.carriers[side ? 'right' : 'student']);
        const preCarrier = { ...g.initial_state.carriers[side ? 'right' : 'student'], environment: '/tests/runner',
            inventory: [], encumbrance: 0, max_encumbrance: 89000 };
        boundary(g.players_before[side], p, side, { ...state, stock: 0 }, preCarrier, true);
        stageRoomState(own(g.players_before[side], 'room'), p, false);
        stableSnapshots(g.players_before[side], g.players_after[side], ['inventory', 'encumbrance', 'max_encumbrance', 'environment', 'room']);
    }
    const a = copy(g.initial_state), b = copy(g.item_after);
    for (const v of [a, b]) { delete v.items; delete v.room; for (const c of Object.values(v.carriers)) {
        delete c.inventory; delete c.encumbrance; } delete v.carriers.student.max_encumbrance; }
    assert.deepEqual(a, b);
    for (const role of ['student', 'right', 'room']) assert.deepEqual(
        g.initial_state.carriers[role].inventory.filter(id => id !== book).sort(),
        g.item_after.carriers[role].inventory.filter(id => id !== book).sort());
    return { ids, state, items: g.item_after };
}
export function validateMingjiaoBookRecord(raw, c) {
    const p = validateMingjiaoBookCondition(c); assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), c.id);
    assert.equal(own(raw, 'method'), 'teaching'); const index = own(raw, 'index');
    assert.ok(Number.isSafeInteger(index) && index >= 0 && index < c.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    const outcome = own(raw, 'outcome'); if (['error', 'not_applicable'].includes(outcome)) {
        assert.ok(typeof own(raw, 'reason') === 'string' && raw.reason.trim()); return [];
    }
    assert.equal(outcome, p.expected); for (const k of ['before', 'after']) assert.ok(Array.isArray(own(raw, k)) && raw[k].length === 2);
    for (const k of ['teacher_preparations', 'teacher_cleanups', 'callbacks', 'terminals']) assert.deepEqual(own(raw, k), []);
    assert.ok(!Object.hasOwn(raw, 'skill_load_context'), 'no fake Ling cold-prime context');
    const { ids, state, items } = preparation(raw, p), initialState = copy(state);
    const steps = own(raw, 'teaching'); assert.ok(Array.isArray(steps) && steps.length === p.teaching_expectations.length);
    let priorItems = items, previous; const values = [];
    for (const [n, s] of steps.entries()) {
        const command = p.teaching_expectations[n]; assert.equal(own(s, 'student'), ids.student); assert.equal(own(s, 'command'), command.action);
        for (const k of ['teacher', 'resolved_teacher', 'teacher_program']) assert.equal(own(s, k), 'none');
        assert.deepEqual(own(s, 'teacher_skills'), {}); assert.ok(Number.isFinite(own(s, 'elapsed')) && s.elapsed >= 0);
        const wall = integer(own(s, 'wall_time')); assert.ok(wall > 0);
        point(own(s, 'before'), p, state); if (previous) assert.deepEqual(s.before, previous);
        assert.deepEqual(own(s, 'item_before'), priorItems); const beforeItems = itemPoint(s.item_before, p, state.stock, ids);
        assert.equal(beforeItems.holder, state.holder);
        if (command.command_kind === 'study') assert.equal(own(s, 'resolved_book'), state.holder === 'student' ? book : '');
        else assert.ok(!Object.hasOwn(s, 'resolved_book'), 'non-study command has no book resolution field');
        const d = decision(p, state, command), accepted = integer(own(s, 'command_accepted'));
        assert.ok(d.accepted ? accepted > 0 : accepted === 0);
        if (command.command_kind === 'study' && !['study-exp999999', 'study-sanscrit199', 'study311', 'study310-exp1m',
            'study-pigging', 'study-busy', 'study-fighting', 'study-times-1', 'study-times101', 'study-unheld', 'study-literate0', 'study-no-fight'].includes(p.variant))
            state.studyTime = wall;
        point(own(s, 'after'), p, state);
        const a = copy(s.before), b = copy(s.after); for (const v of [a, b]) for (const k of ['jing', 'skills', 'learned', 'effective_skills', 'study_time', 'room']) delete v[k];
        assert.deepEqual(a, b); stableItems(s.item_before, own(s, 'item_after'), p, state, d);
        assert.equal(own(s, 'message_scope'), 'receive_message_apply_input_not_full_transcript'); assert.ok(Array.isArray(own(s, 'messages')));
        const text = s.messages.map(m => { assert.equal(typeof own(m, 'category'), 'string'); return plain(own(m, 'text')); }).join('');
        if (!d.accepted) {
            // Original notify_fail sets this temp field, but need not call receive_message.
            // All such conditions in this frozen plan contain exactly one command.
            assert.equal(steps.length, 1); assert.ok(d.notice.length > 0);
            assert.equal(plain(own(own(raw.after[0], 'temp'), 'notify_fail')), d.notice + '\n',
                'original notify_fail literal absent or changed');
        } else if (d.notice) assert.ok(text.includes(d.notice), 'original book branch notice absent: ' + d.notice);
        if (d.completed) assert.ok(text.includes('似乎有点心得。'));
        if (d.upgrades) { assert.ok(text.includes('你的「乾坤大挪移」进步了！')); assert.ok(text.includes('你潜心修炼乾坤大挪移心法，若有所悟。')); }
        values.push({ command_kind: command.command_kind, result: d.result, commands: 1, accepted: Number(accepted > 0), execution_cost: accepted,
            requested: command.command_kind === 'study' && Number(command.action.split(' ').at(-1)) >= 1 &&
                Number(command.action.split(' ').at(-1)) <= 100 ? Number(command.action.split(' ').at(-1)) : 0,
            invalid_times: Number(command.command_kind === 'study' && [ 'study-times-1', 'study-times101' ].includes(p.variant)),
            completed: d.completed, study_fee: d.study_fee, jing_writeoff: d.jing_writeoff,
            jing_cost: d.study_fee + d.jing_writeoff, source_derived_gross: d.gross, upgrades: d.upgrades,
            book_created: d.book_created, letters_created: d.letters_created, book_received: d.book_received,
            stock_consumed: command.command_kind === 'ketou' ? (s.before.room.xin_count ?? 0) - (s.after.room.xin_count ?? 0) : 0 });
        previous = s.after; priorItems = s.item_after;
    }
    boundary(raw.before[0], p, 0, initialState, items.carriers.student); boundary(raw.after[0], p, 0, state, priorItems.carriers.student);
    boundary(raw.before[1], p, 1, initialState, items.carriers.right); boundary(raw.after[1], p, 1, state, priorItems.carriers.right);
    stableSnapshots(raw.before[0], raw.after[0], ['jing', 'skills', 'learned', 'effective_skills', 'study_time', 'room', 'inventory', 'encumbrance']);
    stableSnapshots(raw.before[1], raw.after[1], ['room']);
    const cost = values.reduce((n, v) => n + v.jing_cost, 0), metrics = own(raw, 'metrics'); assert.ok(Array.isArray(metrics) && metrics.length === 2);
    for (const [side, m] of metrics.entries()) {
        for (const [k, n] of Object.entries(map(m))) { assert.ok(integer(n) >= 0); assert.equal(n, side === 0 && k === 'jing_cost' ? cost : 0); }
        if (!side && cost) assert.equal(integer(own(m, 'jing_cost')), cost);
        else if (Object.hasOwn(m, 'jing_cost')) assert.equal(integer(m.jing_cost), 0);
    }
    const cleanup = own(raw, 'book_cleanup'); keys(cleanup, ['singleton', 'room', 'letters', 'players_after_move']);
    keys(own(cleanup, 'singleton'), ['object', 'exists_after']); assert.equal(cleanup.singleton.object, book); zero(cleanup.singleton.exists_after);
    keys(own(cleanup, 'room'), ['object', 'program', 'exists_after']); assert.equal(cleanup.room.object, p.book_setup.room);
    assert.equal(cleanup.room.program, p.book_setup.room); equal(cleanup.room.exists_after, Number(p.book_setup.room === '/tests/runner'));
    const letters = own(cleanup, 'letters'); assert.ok(Array.isArray(letters) && letters.length === priorItems.letters.length);
    for (const [n, l] of letters.entries()) { keys(l, ['object', 'program', 'exists_after']);
        assert.equal(l.object, priorItems.letters[n].object); assert.equal(l.program, '/d/mingjiao/obj/yixin'); zero(l.exists_after); }
    assert.ok(Array.isArray(own(cleanup, 'players_after_move')) && cleanup.players_after_move.length === 2);
    for (const side of [0, 1]) {
        const after = cleanup.players_after_move[side]; assert.equal(own(after, 'object'), raw.after[side].object);
        assert.equal(own(after, 'environment'), '/tests/runner');
        stageRoomState(own(after, 'room'), p, true);
        assert.deepEqual([...own(after, 'inventory')].sort(), raw.after[side].inventory.filter(id => id !== book).sort());
        assert.equal(own(after, 'encumbrance'), raw.after[side].encumbrance - Number(raw.after[side].inventory.includes(book)) * 600);
        stableSnapshots(raw.after[side], after, ['environment', 'room', 'inventory', 'encumbrance']);
    }
    assert.equal(values.some(v => v.book_created || v.book_received || v.completed) ? 'observed' : 'refused', outcome);
    return values;
}
export function mingjiaoBookEffects(rows, c) {
    validateMingjiaoBookCondition(c); const all = [], unknown = [];
    for (const row of rows) {
        assert.equal(row.condition_id, c.id); assert.equal(row.outcome, own(row.raw, 'outcome'));
        const values = validateMingjiaoBookRecord(row.raw, c);
        if (['error', 'not_applicable'].includes(row.outcome)) unknown.push(row.raw.reason); else all.push(values);
    }
    const result = { samples: rows.length, validated: all.length, unknown: unknown.length, unknown_scopes: unknown };
    const sum = k => unknown.length ? null : all.flat().reduce((n, v) => n + v[k], 0);
    for (const [name, k] of [['commands', 'commands'], ['commands_accepted', 'accepted'], ['command_execution_cost', 'execution_cost'],
        ['study_requested', 'requested'], ['study_completed', 'completed'], ['study_fee', 'study_fee'], ['jing_writeoff', 'jing_writeoff'],
        ['jing_cost', 'jing_cost'], ['source_derived_gross', 'source_derived_gross'], ['upgrades', 'upgrades'],
        ['books_created', 'book_created'], ['letters_created', 'letters_created'], ['player_receipts', 'book_received'],
        ['stock_consumed', 'stock_consumed']]) result[name] = sum(k);
    result.ketou_calls = unknown.length ? null : all.flat().filter(v => v.command_kind === 'ketou').length;
    result.get_calls = unknown.length ? null : all.flat().filter(v => v.command_kind === 'get').length;
    result.study_calls = unknown.length ? null : all.flat().filter(v => v.command_kind === 'study').length;
    result.study_accepted = unknown.length ? null : all.flat().filter(v => v.command_kind === 'study' && v.accepted).length;
    result.study_invalid_times_commands = sum('invalid_times');
    result.learned_net = unknown.length ? null : rows.reduce((n, r) => n + (r.raw.after[0].learned[skill] ?? 0) - (r.raw.before[0].learned[skill] ?? 0), 0);
    result.potential_cost = unknown.length ? null : 0; result.learned_points_added = unknown.length ? null : 0;
    result.results = {}; for (const values of all) for (const v of values) result.results[v.result] = (result.results[v.result] ?? 0) + 1;
    return result;
}
