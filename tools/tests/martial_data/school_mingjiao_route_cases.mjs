// Original room/command/timer conditions. A complete observation is not a successful game action.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mingjiaoBookSourcePaths } from './school_mingjiao_book_cases.mjs';

const copy = v => structuredClone(v), sha = v => createHash('sha256').update(v).digest('hex');
const group = 'mingjiao-route', prefix = 'school-scene-mingjiao-route-';
const rooms = { stone: '/d/mingjiao/shandong', zero: '/d/mingjiao/midao0', one: '/d/mingjiao/midao1',
    five: '/d/mingjiao/midao5', nine: '/d/mingjiao/midao9', chamber: '/d/mingjiao/mishi' };
export const mingjiaoRouteSourcePaths = [...mingjiaoBookSourcePaths,
    'd/mingjiao/shandong.c', 'd/mingjiao/midao0.c', 'd/mingjiao/midao1.c', 'd/mingjiao/midao5.c',
    'd/mingjiao/midao9.c', 'cmds/std/open.c', 'cmds/std/go.c', 'cmds/std/close.c',
];
export const mingjiaoRouteReviewedSourceHash = '054a8cae911c691f7c7ab662a61cc3e2ea40d69ee2b382b2791801f99a94c3d7';
const evidenceHash = e => sha(JSON.stringify(mingjiaoRouteSourcePaths.map(path => [path, e[path]])));
const command = action => ({ kind: 'command', action }), wait = seconds => ({ kind: 'wait', seconds });
const pool = { name: '试侠', gender: '男性', class: '', character: '光明磊落', race: '人类',
    str: 36, int: 40, con: 36, dex: 36, shen: 80000, combat_exp: 10000000,
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 2400, max_neili: 9000, jingli: 1000, max_jingli: 1000, potential: 10000, learned_points: 0,
    jiali: 0, 'family/family_name': '明教', 'state/go': 0, doing: 0,
    'env/auto_regenerate': 0, 'env/no_learn': 0, 'special_skill/wuxing': 0,
    'tattoo/tattoo_str': 0, 'reborn/str': 0, 'tattoo/tattoo_int': 0, 'reborn/int': 0,
    'tattoo/tattoo_dex': 0, 'reborn/dex': 0 };
function plans() {
    const result = [];
    const add = (variant, routeMode, neili, force, steps, loadOrder = []) => {
        const startRoom = routeMode === 'cold' ? rooms.nine : rooms.stone;
        const p = { school: 'mingjiao', family: '明教', collection_group: group, route_mode: routeMode,
            variant, start_room: startRoom, load_order: loadOrder, route_steps: steps,
            actor: { skills: { force, parry: 200, unarmed: 200, dodge: 200 }, mappings: {}, preparations: {},
                properties: { ...copy(pool), neili } },
            target: { skills: { force: 1 }, mappings: {}, preparations: {}, properties: { ...copy(pool), name: '试客' } },
            named_participants: true, qualification_sources: mingjiaoRouteSourcePaths,
            action: steps.find(s => s.kind === 'command').action,
            expected: 'observed', fighting: false, observe_seconds: 0, not_applicable: '', random_observation: false,
            note: '普通USER原break/open/close/go/ketou/get与原5秒call_out，玩家心跳关闭；observed只表示记录完整，开门/进入/拒绝分别核验。属性与初始房间为实验准备，不钳负内力、不补资源、不造0号甬道out出口；cold加载顺序只为构造准备，每项独立driver，不冒玩家行动。' };
        result.push({ id: prefix + (routeMode === 'cold' ? 'cold-' : 'main-') + variant,
            stage: 'school', method: 'scene', parameters: p });
    };
    add('wrong-arg', 'stone', 2400, 300, [command('break stone')]);
    add('neili1999-force300', 'stone', 1999, 300, [command('break men')]);
    add('neili2000-force299', 'stone', 2000, 299, [command('break men')]);
    add('neili2000-force300', 'stone', 2000, 300, [command('break men'), wait(6)]);
    add('neili2399-force300', 'stone', 2399, 300, [command('break men'), wait(6)]);
    add('neili2400-force300', 'stone', 2400, 300, [command('break men'), wait(6), command('go enter')]);
    add('repeat', 'stone', 4800, 300, [command('break men'), wait(2), command('break men'), wait(4), wait(2)]);
    add('natural', 'natural', 5000, 300, [
        ...['break men', 'go enter', 'go north', 'open north', 'go north', 'open north', 'go north',
            'open north', 'go north', 'ketou', 'get qiankunbook', 'go south', 'go out'].map(command), wait(6),
    ]);
    add('9-mishi-0', 'cold', 2400, 300, [command('open north'), command('go north')],
        [rooms.nine, rooms.chamber, rooms.zero]);
    for (const [variant, order] of [['mishi-9-0', [rooms.chamber, rooms.nine, rooms.zero]],
        ['0-mishi-9', [rooms.zero, rooms.chamber, rooms.nine]]])
        add(variant, 'cold', 2400, 300, ['close north', 'open north', 'go north', 'go south'].map(command), order);
    assert.equal(result.length, 11); return result;
}
function sourceEntry(plan, evidence) {
    const p = plan.parameters, path = p.route_mode === 'cold' ? p.load_order[0].slice(1) + '.c' : 'd/mingjiao/shandong.c';
    const line = p.route_mode === 'cold' ? p.load_order[0] === rooms.chamber ? 10 : 6 : 27;
    const func = p.route_mode === 'cold' ? 'create' : 'do_break';
    return { id: path + ':' + line + ':' + func, path, line, function: func, role: 'scene', sha256: evidence[path] };
}
export function mingjiaoRouteConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof readSource, 'function'); assert.equal(typeof smoke, 'boolean');
    assert.equal(mingjiaoRouteSourcePaths.length, 58); assert.equal(new Set(mingjiaoRouteSourcePaths).size, 58);
    const evidence = Object.fromEntries(mingjiaoRouteSourcePaths.map(path => [path, sha(readSource(path))]));
    assert.equal(evidenceHash(evidence), mingjiaoRouteReviewedSourceHash, 'route source closure changed; review required');
    for (const id of ['force', 'parry', 'unarmed', 'dodge'])
        assert.equal(catalog.skills.find(s => s.id === id)?.sha256, evidence['kungfu/skill/' + id + '.c']);
    return plans().map(plan => {
        const entry = sourceEntry(plan, evidence);
        assert.equal(readSource(entry.path).toString().split('\n').findIndex(s =>
            new RegExp('^(?:int|void) ' + entry.function + '\\(').test(s)) + 1, entry.line);
        return { ...plan, entry_id: entry.id, samples: plan.parameters.route_mode === 'cold' || smoke ? 1 : 2,
            status: 'prepared_not_sampled', parameters: { ...plan.parameters, source_entry: entry,
                source_evidence: copy(evidence), reviewed_source_hash: mingjiaoRouteReviewedSourceHash,
                qualification_evidence: mingjiaoRouteSourcePaths.map(path => ({ path, sha256: evidence[path] })), absent_sources: [] } };
    });
}
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v), 'mapping required'); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing ' + k); return v[k]; };
let fixedPlans;
export function validateMingjiaoRouteCondition(c) {
    fixedPlans ??= new Map(plans().map(c => [c.id, c.parameters])); const planned = fixedPlans.get(c.id); assert.ok(planned, 'unknown route condition');
    assert.equal(c.stage, 'school'); assert.equal(c.method, 'scene');
    assert.ok(Number.isSafeInteger(c.samples) && (planned.route_mode === 'cold' ? c.samples === 1 : [1, 2].includes(c.samples)));
    const { source_entry: entry, source_evidence: evidence, reviewed_source_hash, qualification_evidence,
        absent_sources, ...actual } = map(own(c, 'parameters'));
    assert.deepEqual(actual, planned, 'fixed original route parameters changed');
    assert.deepEqual(Object.keys(map(evidence)), mingjiaoRouteSourcePaths);
    for (const h of Object.values(evidence)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(evidenceHash(evidence), mingjiaoRouteReviewedSourceHash); assert.equal(reviewed_source_hash, mingjiaoRouteReviewedSourceHash);
    assert.deepEqual(qualification_evidence, mingjiaoRouteSourcePaths.map(path => ({ path, sha256: evidence[path] })));
    assert.deepEqual(absent_sources, []); assert.deepEqual(entry, sourceEntry({ parameters: planned }, evidence));
    assert.equal(c.entry_id, entry.id); return c.parameters;
}

const stage = '/tests/runner', bookPath = '/clone/book/qiankun_book';
const roomPaths = Object.values(rooms), messageScope = 'receive_message_apply_input_not_full_transcript';
const zero = v => assert.ok(v === null || v === 0, 'explicit LPC zero required');
const empty = v => { if (v === null || v === 0) return; assert.deepEqual(map(v), {}); };
const integer = v => { assert.ok(Number.isSafeInteger(v), 'integer required'); return v; };
const finite = v => { assert.ok(Number.isFinite(v) && v >= 0, 'nonnegative finite elapsed required'); return v; };
const sorted = v => { assert.ok(Array.isArray(v)); assert.equal(new Set(v).size, v.length); return [...v].sort(); };
const plain = s => s.replace(/\x1b\[[0-9;]*m/g, '');
const bookSkill = { name: 'qiankun-danuoyi', exp_required: 1000000, jing_cost: 200,
    difficulty: 45, max_skill: 310, need: { sanscrit: 200 } };
const exits = {
    [rooms.stone]: { out: '/d/mingjiao/huangtulu2' },
    [rooms.zero]: { north: rooms.one },
    [rooms.one]: { south: rooms.zero, north: rooms.five, east: '/d/mingjiao/midao2', west: '/d/mingjiao/midao4' },
    [rooms.five]: { south: rooms.one, north: rooms.nine, east: '/d/mingjiao/midao6', west: '/d/mingjiao/midao8' },
    [rooms.nine]: { south: rooms.five, north: rooms.chamber, east: '/d/mingjiao/midao10', west: '/d/mingjiao/midao12' },
    [rooms.chamber]: { south: rooms.zero, up: '/d/mingjiao/neishi' },
};
const reverse = { north: 'south', south: 'north', east: 'west', west: 'east' };
function initialDoors(path) {
    const dirs = path === rooms.stone ? [] : path === rooms.chamber ? ['south'] : Object.keys(exits[path]);
    return Object.fromEntries(dirs.map(dir => [dir, { name: '石门', id: [dir, '石门', 'door'], other_side_dir: reverse[dir],
        status: path === rooms.zero || path === rooms.chamber || path === rooms.one && dir === 'south' ? 0 : 1 }]));
}
function loadRoom(state, path) {
    if (state.loaded[path]) return;
    const doors = initialDoors(path);
    for (const [dir, d] of Object.entries(doors)) {
        const other = state.loaded[exits[path][dir]]?.doors[d.other_side_dir];
        if (other) d.status = other.status; // Original set_door/check_door, not invented reciprocal repairs.
    }
    state.loaded[path] = { exits: copy(exits[path]), doors };
}
function playerState(v, p, side, neili, initial) {
    const config = side ? p.target : p.actor, q = config.properties;
    assert.match(own(v, 'object'), side ? /^\/tests\/actor#[0-9]+$/ : /^\/tests\/teaching_actor#[0-9]+$/);
    assert.equal(own(v, 'id'), side ? 'right' : 'left');
    for (const k of ['userp', 'interactive', 'playerp', 'living']) assert.equal(own(v, k), 1);
    for (const k of ['wizardp', 'ghost', 'busy', 'force_attribute', 'nothing', 'ammunition']) zero(own(v, k));
    for (const k of ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'max_neili', 'jingli', 'max_jingli',
        'str', 'int', 'dex', 'con', 'combat_exp', 'jiali', 'potential', 'learned_points', 'shen', 'gender'])
        assert.equal(own(v, k), q[k]);
    assert.equal(own(v, 'neili'), side ? q.neili : neili); assert.equal(own(v, 'age'), 25);
    assert.deepEqual(own(v, 'skills'), config.skills); assert.deepEqual(own(v, 'learned'), {});
    assert.deepEqual(own(v, 'effective_skills'), Object.fromEntries(Object.entries(config.skills).map(([k, n]) => [k, Math.trunc(n / 2)])));
    assert.equal(own(v, 'effective_str'), q.str + Math.trunc((config.skills.unarmed ?? 0) / 10));
    assert.equal(own(v, 'effective_con'), q.con + Math.trunc(config.skills.force / 10));
    for (const k of ['mappings', 'preparations', 'weapon_details', 'handing_details']) assert.deepEqual(own(v, k), {});
    for (const k of ['weapon', 'handing']) assert.equal(own(v, k), 'none');
    for (const k of ['weapon_damage', 'weapon_flag']) zero(own(v, k));
    const grants = own(v, 'dugu_grants'); for (const k of ['qi', 'po']) zero(own(grants, k));
    const cult = own(v, 'cultivation'); assert.equal(own(cult, 'class'), ''); assert.equal(own(cult, 'family/family_name'), '明教');
    for (const k of ['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
        'special_skill/guimai', 'special_skill/wuxing', 'wudang-jiuyang', 'immune/poison']) zero(own(cult, k));
    empty(own(v, 'conditions')); assert.deepEqual(own(own(v, 'temp'), 'apply'), { armor: 100 });
    if (initial) {
        const normalize = s => { s = copy(s); delete s.neili; s.conditions = 0;
            for (const k of ['notify_fail', 'pending', 'combat_time']) delete s.temp[k]; return s; };
        assert.deepEqual(normalize(v), normalize(initial), 'unexplained player state mutation');
        for (const k of ['pending', 'combat_time']) if (Object.hasOwn(v.temp, k)) empty(v.temp[k]);
    }
}
function point(v, p, state, initial) {
    assert.deepEqual(Object.keys(map(v)).sort(), ['wall_time', 'player', 'environment', 'go_count', 'encumbrance',
        'max_encumbrance', 'inventory', 'rooms', 'pending_close', 'book', 'letters'].sort());
    integer(v.wall_time); assert.ok(v.wall_time > 0); assert.equal(v.environment, state.environment);
    assert.equal(v.go_count, state.go); assert.equal(v.max_encumbrance, 89000);
    assert.equal(v.encumbrance, state.holder === 'student' ? 600 : 0);
    assert.deepEqual(sorted(v.inventory), state.holder === 'student' ? [bookPath] : []);
    playerState(v.player, p, 0, state.neili, initial);
    assert.ok(Array.isArray(v.rooms) && v.rooms.length === 6);
    for (const [i, r] of v.rooms.entries()) {
        const path = roomPaths[i], expected = state.loaded[path]; assert.equal(own(r, 'path'), path);
        if (!expected) { assert.deepEqual(r, { path, exists: 0 }); continue; }
        assert.deepEqual(Object.keys(r).sort(), ['path', 'exists', 'object', 'program', 'clonep', 'exits', 'doors', 'door_implementation', 'xin_count', 'inventory'].sort());
        assert.equal(r.exists, 1); assert.equal(r.object, path); assert.equal(r.program, path); zero(r.clonep);
        assert.equal(r.door_implementation, '/mudcore/inherit/room');
        assert.deepEqual(r.exits, expected.exits); assert.deepEqual(r.doors, expected.doors);
        if (path === rooms.chamber) assert.equal(r.xin_count, state.stock); else zero(r.xin_count);
        const inventory = state.environment === path ? [v.player.object] : [];
        if (path === rooms.chamber) {
            if (!state.bones) {
                state.bones = r.inventory.filter(id => /^\/d\/mingjiao\/obj\/yang(?:dt|fr)#[0-9]+$/.test(id));
                assert.equal(state.bones.length, 2); assert.equal(state.bones.filter(id => id.startsWith('/d/mingjiao/obj/yangdt#')).length, 1);
            }
            inventory.push(...state.bones);
            if (state.letter) inventory.push(state.letter);
            if (state.holder === 'room') inventory.push(bookPath);
        }
        assert.deepEqual(sorted(r.inventory), sorted(inventory));
    }
    assert.ok(Array.isArray(v.pending_close) && v.pending_close.length === Number(state.pending));
    for (const e of v.pending_close) {
        assert.deepEqual(Object.keys(map(e)).sort(), ['object', 'function', 'remaining', 'tuple_size'].sort());
        assert.equal(e.object, rooms.stone); assert.equal(e.function, 'close'); assert.equal(e.tuple_size, 3);
        assert.ok(integer(e.remaining) >= 0 && e.remaining <= 5);
    }
    if (state.holder === 'absent') assert.deepEqual(v.book, { exists: 0 });
    else {
        const env = state.holder === 'student' ? v.player.object : rooms.chamber;
        assert.deepEqual(v.book, { exists: 1, object: bookPath, program: bookPath, clonep: 0,
            id: 'qiankunbook', weight: 600, environment: env,
            owner_chain: state.holder === 'student' ? [v.player.object, state.environment] : [env], skill: bookSkill });
    }
    if (!state.letter) assert.deepEqual(v.letters, []);
    else assert.deepEqual(v.letters, [{ object: state.letter, program: '/d/mingjiao/obj/yixin', clonep: 1,
        id: 'yi xin', weight: 100, environment: rooms.chamber }]);
}
function link(a, b) {
    assert.ok(b.wall_time >= a.wall_time, 'wall clock moved backwards');
    const normalized = v => { v = copy(v); delete v.wall_time; for (const e of v.pending_close) delete e.remaining; return v; };
    assert.deepEqual(normalized(a), normalized(b), 'observation chain broke');
    if (a.pending_close.length) assert.ok(b.pending_close[0].remaining <= a.pending_close[0].remaining);
}
function messages(s) {
    assert.equal(own(s, 'message_scope'), messageScope); assert.ok(Array.isArray(own(s, 'messages')));
    for (const m of s.messages) {
        assert.deepEqual(Object.keys(map(m)).sort(), ['category', 'text']);
        assert.equal(typeof m.category, 'string'); assert.equal(typeof m.text, 'string');
    }
}
function requiredNotice(s, text) {
    assert.ok(s.messages.some(m => plain(m.text).includes(text)), 'original captured message absent: ' + text);
}
function transition(state, action, p) {
    const d = { action, accepted: true, neili_cost: 0, opened: 0, closed: 0, entered: 0, book_created: 0, book_received: 0, failure: null, notice: '' };
    if (action.startsWith('break ')) {
        if (action !== 'break men') { d.accepted = false; d.failure = '你在干吗? \n'; }
        else if (state.neili < 2000) d.notice = '你运了运气，觉得自己现在的内力不济。\n';
        else {
            state.neili -= 2000; d.neili_cost = 2000;
            if (p.actor.skills.force < 300) d.notice = '看来是自己的内功火候还不够。\n';
            else { state.neili -= 400; d.neili_cost += 400; d.opened = 1; state.pending = true;
                state.loaded[rooms.stone].exits.enter = rooms.zero; }
        }
    } else if (action.startsWith('go ')) {
        const dir = action.slice(3), current = state.loaded[state.environment], destination = current.exits[dir];
        if (!destination) { d.accepted = false; d.failure = '这个方向没有出路。\n'; }
        else if (current.doors[dir]?.status === 1) { d.accepted = false; d.failure = '你必须先把石门打开！\n'; }
        else { d.failure = '你过不去。\n'; loadRoom(state, destination); state.environment = destination; state.go++; d.entered = 1; }
    } else if (action === 'open north' || action === 'close north') {
        const closed = Number(action.startsWith('close')), current = state.loaded[state.environment], door = current.doors.north;
        assert.ok(door); const other = state.loaded[current.exits.north]?.doors[door.other_side_dir];
        if (door.status === closed || other?.status === closed) {
            d.accepted = false; d.failure = closed ? '石门已经是关着的了。\n' : '石门已经是开着的了。\n';
        } else {
            door.status = closed; if (other) other.status = closed; // Original from_other_side stops here; never propagate to a third room.
            d[closed ? 'closed' : 'opened'] = 1;
        }
    } else if (action === 'ketou') {
        assert.equal(state.environment, rooms.chamber); assert.equal(state.stock, 1); assert.equal(state.holder, 'absent');
        state.stock = 0; state.holder = 'room'; d.book_created = 1;
        d.notice = '突然你抬眼看到遗骨下面，有一些东西，你看了看，原来是一封信和一张羊皮。\n';
    } else {
        assert.equal(action, 'get qiankunbook'); assert.equal(state.holder, 'room'); state.holder = 'student'; d.book_received = 1;
    }
    return d;
}
export function validateMingjiaoRouteRecord(raw, c) {
    const p = validateMingjiaoRouteCondition(c);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), c.id); assert.equal(own(raw, 'method'), 'scene');
    const index = integer(own(raw, 'index')); assert.ok(index >= 0 && index < c.samples); finite(own(raw, 'elapsed'));
    const outcome = own(raw, 'outcome'); if (['error', 'not_applicable'].includes(outcome)) {
        assert.ok(typeof own(raw, 'reason') === 'string' && raw.reason.trim()); return [];
    }
    assert.equal(outcome, 'observed'); assert.equal(own(raw, 'reason'), '');
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.ok(Array.isArray(own(raw, k)) && raw[k].length === 2);
    for (const k of ['launches', 'refusals', 'interfaces', 'attacks', 'defenses', 'passives', 'callbacks', 'terminals', 'dropped'])
        assert.deepEqual(own(raw, k), []);
    for (const k of ['actions', 'directs', 'skill_loads', 'scene_lifecycle']) if (Object.hasOwn(raw, k)) assert.deepEqual(raw[k], []);
    const state = { loaded: {}, environment: stage, go: 0, neili: p.actor.properties.neili, pending: false,
        stock: 1, holder: 'absent', letter: '', bones: null };
    const prep = own(raw, 'route_preparation'); assert.deepEqual(Object.keys(map(prep)).sort(), ['before', 'load_steps', 'after'].sort());
    point(own(prep, 'before'), p, state, raw.before[0]); assert.deepEqual(prep.before.player, raw.before[0]);
    playerState(raw.before[1], p, 1, 0); const target = raw.before[1];
    assert.ok(Array.isArray(prep.load_steps) && prep.load_steps.length === p.load_order.length);
    let previous = prep.before;
    for (const [i, s] of prep.load_steps.entries()) {
        assert.deepEqual(Object.keys(map(s)).sort(), ['path', 'before', 'after'].sort()); assert.equal(s.path, p.load_order[i]);
        point(s.before, p, state, raw.before[0]); link(previous, s.before); loadRoom(state, s.path);
        point(s.after, p, state, raw.before[0]); assert.ok(s.after.wall_time >= s.before.wall_time); previous = s.after;
    }
    loadRoom(state, p.start_room); state.environment = p.start_room;
    point(prep.after, p, state, raw.before[0]); assert.ok(prep.after.wall_time >= previous.wall_time);
    assert.deepEqual(raw.immediate[0], prep.after.player); assert.deepEqual(raw.immediate[1], target);
    const steps = own(raw, 'route_steps'); assert.ok(Array.isArray(steps) && steps.length === p.route_steps.length);
    previous = prep.after; const results = []; let cost = 0, waitElapsed = 0;
    for (const [i, s] of steps.entries()) {
        const expected = p.route_steps[i]; assert.equal(own(s, 'kind'), expected.kind);
        point(own(s, 'before'), p, state, raw.before[0]); link(previous, s.before); messages(s); finite(own(s, 'elapsed'));
        let result;
        if (s.kind === 'command') {
            assert.deepEqual(Object.keys(s).sort(), ['kind', 'action', 'before', 'accepted', 'elapsed', 'messages', 'message_scope', 'failure', 'after'].sort());
            assert.equal(s.action, expected.action); const accepted = integer(s.accepted); assert.ok(accepted >= 0);
            result = transition(state, s.action, p); assert.equal(accepted > 0, result.accepted);
            assert.ok(s.after.wall_time - s.before.wall_time <= Math.ceil(s.elapsed) + 1);
            if (result.book_created) {
                assert.ok(Array.isArray(s.after.letters) && s.after.letters.length === 1);
                state.letter = own(s.after.letters[0], 'object'); assert.match(state.letter, /^\/d\/mingjiao\/obj\/yixin#[0-9]+$/);
            }
            const emittedFailure = Object.hasOwn(own(s.after.player, 'temp'), 'notify_fail') ? s.after.player.temp.notify_fail : null;
            if (s.failure === null || s.failure === 0) zero(emittedFailure); else assert.equal(s.failure, emittedFailure);
            if (result.failure !== null) { assert.equal(typeof s.failure, 'string'); assert.equal(plain(s.failure), result.failure); }
            if (result.notice) requiredNotice(s, result.notice);
            if (result.opened && s.action === 'break men') requiredNotice(s, '缓缓移开。');
            cost += result.neili_cost;
        } else {
            assert.deepEqual(Object.keys(s).sort(), ['kind', 'seconds', 'before', 'started', 'elapsed', 'after', 'messages', 'message_scope'].sort());
            assert.equal(s.seconds, expected.seconds); assert.ok(Number.isFinite(s.started) && s.started > 0);
            assert.ok(s.elapsed >= s.seconds - 1, 'wait did not observe original scheduled interval');
            assert.ok(Math.abs(s.after.wall_time - s.before.wall_time - s.elapsed) <= 1.01);
            const expires = s.seconds === 6 || p.variant === 'repeat' && i === 4;
            result = { kind: 'wait', seconds: s.seconds, elapsed: s.elapsed, callback_closed: Number(expires) };
            if (expires) {
                assert.equal(state.pending, true); state.pending = false; delete state.loaded[rooms.stone].exits.enter;
                if (state.environment === rooms.stone) requiredNotice(s, '石门又在轧轧声响，缓缓闭上。\n');
            } else assert.equal(state.pending, true);
            waitElapsed += s.elapsed;
        }
        point(own(s, 'after'), p, state, raw.before[0]); assert.ok(s.after.wall_time >= s.before.wall_time);
        if (s.kind === 'wait' && state.pending) assert.ok(s.after.pending_close[0].remaining <= s.before.pending_close[0].remaining);
        results.push(result); previous = s.after;
    }
    if (p.variant === 'repeat') {
        const midpoint = steps[3].after.wall_time;
        assert.ok(midpoint - steps[0].after.wall_time >= 5, 'repeat midpoint has not passed the superseded deadline');
        assert.ok(midpoint - steps[2].after.wall_time <= 5, 'repeat midpoint is outside the refreshed tick window');
    }
    const final = own(raw, 'route_final'); point(final, p, state, raw.before[0]); link(previous, final);
    assert.deepEqual(raw.after[0], final.player); assert.deepEqual(raw.after[1], target);
    for (const [side, m] of raw.metrics.entries()) {
        map(m); const expected = side ? 0 : cost;
        if (expected) assert.equal(own(m, 'neili_cost'), expected);
        else if (Object.hasOwn(m, 'neili_cost')) assert.equal(m.neili_cost, 0);
        for (const [key, value] of Object.entries(m)) { integer(value); assert.equal(value, key === 'neili_cost' ? expected : 0, 'unexpected actor counter'); }
    }
    assert.equal(raw.before[0].neili - raw.after[0].neili, cost); assert.ok(raw.elapsed >= waitElapsed);
    const cleanup = own(raw, 'route_cleanup'); assert.deepEqual(Object.keys(map(cleanup)).sort(), ['before', 'destroyed', 'after'].sort());
    point(cleanup.before, p, state, raw.before[0]); link(final, cleanup.before);
    const destroyed = Object.keys(state.loaded).flatMap(path => [path, ...(path === rooms.chamber ? [...state.bones, ...(state.letter ? [state.letter] : [])] : [])]);
    if (state.holder !== 'absent') destroyed.push(bookPath);
    assert.deepEqual(sorted(own(cleanup, 'destroyed')), sorted(destroyed));
    state.loaded = {}; state.environment = stage; state.pending = false; state.holder = 'absent'; state.letter = '';
    point(cleanup.after, p, state, raw.before[0]); assert.ok(cleanup.after.wall_time >= cleanup.before.wall_time);
    return results;
}
export function mingjiaoRouteEffects(rows, c) {
    validateMingjiaoRouteCondition(c);
    const summary = { samples: rows.length, validated: 0, unknown: 0, commands: 0, commands_accepted: 0, command_refusals: 0,
        neili_cost: 0, door_openings: 0, door_closings: 0, moves: 0, waits: 0, wait_elapsed: 0, callbacks_closed: 0,
        books_created: 0, books_received: 0, results: {} };
    for (const row of rows) {
        const raw = own(row, 'raw'), events = validateMingjiaoRouteRecord(raw, c);
        if (['error', 'not_applicable'].includes(raw.outcome)) { summary.unknown++; continue; }
        summary.validated++;
        for (const e of events) {
            if (e.kind === 'wait') { summary.waits++; summary.wait_elapsed += e.elapsed; summary.callbacks_closed += e.callback_closed; }
            else { summary.commands++; summary.commands_accepted += Number(e.accepted); summary.command_refusals += Number(!e.accepted);
                summary.neili_cost += e.neili_cost; summary.door_openings += e.opened; summary.door_closings += e.closed;
                summary.moves += e.entered; summary.books_created += e.book_created; summary.books_received += e.book_received;
                const key = e.action + (e.accepted ? ':accepted' : ':refused'); summary.results[key] = (summary.results[key] ?? 0) + 1; }
        }
    }
    if (summary.unknown) for (const k of Object.keys(summary)) if (!['samples', 'validated', 'unknown', 'results'].includes(k)) summary[k] = null;
    return summary;
}
