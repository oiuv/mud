import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { mingjiaoBookSourcePaths } from './school_mingjiao_book_cases.mjs';
import { mingjiaoRouteConditions as conditions, mingjiaoRouteSourcePaths as sources,
    mingjiaoRouteReviewedSourceHash as sourceHash, validateMingjiaoRouteCondition as validate,
    validateMingjiaoRouteRecord as record, mingjiaoRouteEffects as effects } from './school_mingjiao_route_cases.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = p => fs.readFileSync(path.join(root, p)), hash = v => createHash('sha256').update(v).digest('hex');
const copy = v => structuredClone(v), ids = ['force', 'parry', 'unarmed', 'dodge'];
const catalog = { skills: ids.map(id => ({ id, sha256: hash(read('kungfu/skill/' + id + '.c')) })) };
const main = conditions(catalog, read), smoke = conditions(catalog, read, { smoke: true });
const get = variant => main.find(c => c.parameters.variant === variant);
const cmds = c => c.parameters.route_steps.filter(s => s.kind === 'command').map(s => s.action);
const bad = (c, edit) => { c = copy(c); edit(c); assert.throws(() => validate(c)); };

test('8 main conditions + three separately executed cold cases preserve 16+3 formal and 8+3 smoke plans', () => {
    assert.equal(main.length, 11); assert.equal(smoke.length, 11);
    assert.equal(main.filter(c => c.parameters.route_mode !== 'cold').length, 8);
    assert.equal(main.filter(c => c.parameters.route_mode !== 'cold').reduce((n, c) => n + c.samples, 0), 16);
    assert.equal(main.filter(c => c.parameters.route_mode === 'cold').reduce((n, c) => n + c.samples, 0), 3);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 11);
    assert.equal(new Set(main.map(c => c.id)).size, 11);
    for (const [i, c] of main.entries()) { validate(c); validate(smoke[i]); assert.deepEqual(c.parameters, smoke[i].parameters); }
    assert.ok(main.every(c => c.status === 'prepared_not_sampled' && c.method === 'scene'));
});
test('source58 exact Book50+8 append and aggregate are source-backed, including the three commands', () => {
    assert.equal(sources.length, 58); assert.deepEqual(sources.slice(0, 50), mingjiaoBookSourcePaths);
    assert.deepEqual(sources.slice(50), ['d/mingjiao/shandong.c', 'd/mingjiao/midao0.c', 'd/mingjiao/midao1.c',
        'd/mingjiao/midao5.c', 'd/mingjiao/midao9.c', 'cmds/std/open.c', 'cmds/std/go.c', 'cmds/std/close.c']);
    assert.equal(hash(JSON.stringify(sources.map(p => [p, hash(read(p))]))), sourceHash);
    assert.throws(() => conditions(catalog, p => p === 'd/mingjiao/shandong.c' ? Buffer.concat([read(p), Buffer.from('\n')]) : read(p)));
    assert.throws(() => conditions({ skills: catalog.skills.slice(1) }, read));
    const corrupt = copy(catalog); corrupt.skills[0].sha256 = '0'.repeat(64); assert.throws(() => conditions(corrupt, read));
});
test('stone original2000 gate/raw299-300 and2399 negative remainder are not replaced by2400 qualification', () => {
    const actual = ['neili1999-force300', 'neili2000-force299', 'neili2000-force300', 'neili2399-force300', 'neili2400-force300']
        .map(v => { const p = get(v).parameters; return [p.actor.properties.neili, p.actor.skills.force]; });
    assert.deepEqual(actual, [[1999, 300], [2000, 299], [2000, 300], [2399, 300], [2400, 300]]);
    assert.equal(get('wrong-arg').parameters.route_steps[0].action, 'break stone');
    bad(get('neili2000-force300'), c => { c.parameters.actor.properties.neili = 2400; });
    bad(get('neili2000-force299'), c => { c.parameters.actor.skills.force = 300; });
    assert.ok(get('neili2000-force300').parameters.actor.properties.max_neili >= 2000);
});
test('original5s closure is awaited6s; repeated break has real2/4/2 waits and no resource injection', () => {
    for (const variant of ['neili2000-force300', 'neili2399-force300'])
        assert.deepEqual(get(variant).parameters.route_steps, [{ kind: 'command', action: 'break men' }, { kind: 'wait', seconds: 6 }]);
    assert.deepEqual(get('neili2400-force300').parameters.route_steps.at(-1), { kind: 'command', action: 'go enter' });
    const repeat = get('repeat'); assert.equal(repeat.parameters.actor.properties.neili, 4800);
    assert.deepEqual(repeat.parameters.route_steps, [{ kind: 'command', action: 'break men' }, { kind: 'wait', seconds: 2 },
        { kind: 'command', action: 'break men' }, { kind: 'wait', seconds: 4 }, { kind: 'wait', seconds: 2 }]);
    bad(repeat, c => { c.parameters.route_steps.splice(1, 1); });
    bad(repeat, c => { c.parameters.route_steps.push({ kind: 'set', resource: 'neili', value: 2400 }); });
    bad(repeat, c => { c.parameters.route_steps[4].seconds = 0; });
});
test('natural13 command route includes real floor ketou/get and misdirected return0/out rejection', () => {
    const c = get('natural'); assert.equal(c.parameters.actor.properties.neili, 5000);
    assert.equal(c.parameters.start_room, '/d/mingjiao/shandong'); assert.deepEqual(c.parameters.load_order, []);
    assert.deepEqual(cmds(c), ['break men', 'go enter', 'go north', 'open north', 'go north', 'open north', 'go north',
        'open north', 'go north', 'ketou', 'get qiankunbook', 'go south', 'go out']);
    assert.equal(cmds(c).length, 13); assert.deepEqual(c.parameters.route_steps.at(-1), { kind: 'wait', seconds: 6 });
    bad(c, x => { x.parameters.route_steps.splice(10, 1); });
    bad(c, x => { x.parameters.load_order = ['/d/mingjiao/mishi']; });
    bad(c, x => { x.parameters.actor.properties['state/go'] = 1; });
});
test('three cold load orders are exact constructor preparations, not synthetic go commands', () => {
    const rows = main.filter(c => c.parameters.route_mode === 'cold');
    assert.deepEqual(rows.map(c => c.id), ['school-scene-mingjiao-route-cold-9-mishi-0',
        'school-scene-mingjiao-route-cold-mishi-9-0', 'school-scene-mingjiao-route-cold-0-mishi-9']);
    assert.deepEqual(rows.map(c => c.parameters.load_order), [
        ['/d/mingjiao/midao9', '/d/mingjiao/mishi', '/d/mingjiao/midao0'],
        ['/d/mingjiao/mishi', '/d/mingjiao/midao9', '/d/mingjiao/midao0'],
        ['/d/mingjiao/midao0', '/d/mingjiao/mishi', '/d/mingjiao/midao9']]);
    assert.ok(rows.every(c => c.samples === 1 && c.parameters.start_room === '/d/mingjiao/midao9'));
    assert.deepEqual(cmds(rows[0]), ['open north', 'go north']);
    for (const c of rows.slice(1)) assert.deepEqual(cmds(c), ['close north', 'open north', 'go north', 'go south']);
    bad(rows[0], c => { c.parameters.load_order.reverse(); }); bad(rows[1], c => { c.samples = 2; });
    bad(rows[2], c => { c.parameters.route_steps[0].action = 'open north'; });
});
test('scene source entries bind real primary function/path/line, not merely a source name prefix', () => {
    assert.ok(main.filter(c => c.parameters.route_mode !== 'cold').every(c => c.entry_id === 'd/mingjiao/shandong.c:27:do_break'));
    assert.deepEqual(main.filter(c => c.parameters.route_mode === 'cold').map(c => c.entry_id),
        ['d/mingjiao/midao9.c:6:create', 'd/mingjiao/mishi.c:10:create', 'd/mingjiao/midao0.c:6:create']);
    const c = get('natural'); bad(c, c => { c.entry_id = 'd/mingjiao/shandong.c:28:do_break'; });
    bad(c, c => { c.parameters.source_entry.line++; });
    bad(c, c => { c.parameters.source_entry.role = 'teaching'; });
    bad(c, c => { c.parameters.source_entry.sha256 = '0'.repeat(64); });
});
test('source proof completeness/absence and parameter mutations fail closed', () => {
    const c = get('natural');
    bad(c, c => { delete c.parameters.source_evidence['cmds/std/get.c']; });
    bad(c, c => { c.parameters.source_evidence['cmds/std/go.c'] = '0'.repeat(64); });
    bad(c, c => { c.parameters.qualification_evidence.pop(); });
    bad(c, c => { c.parameters.qualification_sources.reverse(); });
    bad(c, c => { c.parameters.absent_sources.push('d/mingjiao/mishi.c'); });
    bad(c, c => { delete c.parameters.reviewed_source_hash; });
    bad(c, c => { c.parameters.actor.mappings.force = 'shenghuo-shengong'; });
    bad(c, c => { c.parameters.actor.preparations.parry = 'qiankun-danuoyi'; });
    bad(c, c => { c.parameters.target.skills.force = 300; });
    bad(c, c => { c.parameters.fighting = true; });
    bad(c, c => { c.parameters.scene_steps = ['north']; });
    for (const samples of [0, 3, null, '2', false]) bad(c, c => { c.samples = samples; });
    for (const mode of [null, 'true', 1]) assert.throws(() => conditions(catalog, read, { smoke: mode }));
});

// Explicit synthetic observer input, not a saved/native sample and not the production transition helper.
const R = ['/d/mingjiao/shandong', '/d/mingjiao/midao0', '/d/mingjiao/midao1', '/d/mingjiao/midao5', '/d/mingjiao/midao9', '/d/mingjiao/mishi'];
const B = '/clone/book/qiankun_book', S = '/tests/runner', L = '/d/mingjiao/obj/yixin#5';
const scope = 'receive_message_apply_input_not_full_transcript';
const ex = [{ out: '/d/mingjiao/huangtulu2' }, { north: R[2] }, { south: R[1], north: R[3], east: '/d/mingjiao/midao2', west: '/d/mingjiao/midao4' },
    { south: R[2], north: R[4], east: '/d/mingjiao/midao6', west: '/d/mingjiao/midao8' },
    { south: R[3], north: R[5], east: '/d/mingjiao/midao10', west: '/d/mingjiao/midao12' }, { south: R[1], up: '/d/mingjiao/neishi' }];
function snapshot(config, side) {
    const q = config.properties, v = Object.fromEntries(['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili',
        'jingli', 'max_jingli', 'str', 'int', 'con', 'dex', 'gender', 'combat_exp', 'jiali', 'potential', 'learned_points', 'shen'].map(k => [k, q[k]]));
    return { ...v, age: 25, id: side ? 'right' : 'left', object: side ? '/tests/actor#2' : '/tests/teaching_actor#1',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0, busy: 0,
        skills: copy(config.skills), learned: {}, effective_skills: Object.fromEntries(Object.entries(config.skills).map(([k, n]) => [k, Math.trunc(n / 2)])),
        effective_str: q.str + Math.trunc((config.skills.unarmed ?? 0) / 10), effective_con: q.con + Math.trunc(config.skills.force / 10),
        mappings: {}, preparations: {}, force_attribute: null, nothing: null, dugu_grants: { qi: null, po: null },
        cultivation: { sex: null, 'improve/neili': null, breakup: null, 'special_skill/mystery': null, 'special_skill/divine': null,
            'special_skill/guimai': null, 'special_skill/wuxing': 0, class: '', 'family/family_name': '明教', 'wudang-jiuyang': null, 'immune/poison': null },
        weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {}, handing: 'none', handing_details: {}, ammunition: 0,
        temp: { apply: { armor: 100 } }, conditions: null };
}
function fixture(c) {
    const p = c.parameters, actor = snapshot(p.actor, 0), target = snapshot(p.target, 1);
    let wall = 1791970000, env = S, go = 0, timer = 0, holder = '', letter = false, stock = 1;
    const loaded = {}, bone = ['/d/mingjiao/obj/yangdt#3', '/d/mingjiao/obj/yangfr#4'];
    const load = path => {
        if (loaded[path]) return;
        const i = R.indexOf(path), doors = {};
        for (const dir of i === 0 ? [] : i === 5 ? ['south'] : Object.keys(ex[i])) {
            const other = { north: 'south', south: 'north', east: 'west', west: 'east' }[dir];
            const status = loaded[ex[i][dir]]?.doors[other]?.status ?? (i === 1 || i === 5 || i === 2 && dir === 'south' ? 0 : 1);
            doors[dir] = { name: '石门', id: [dir, '石门', 'door'], other_side_dir: other, status };
        }
        loaded[path] = { exits: copy(ex[i]), doors };
    };
    const point = () => ({ wall_time: wall, player: copy(actor), environment: env, go_count: go,
        encumbrance: holder === 'student' ? 600 : 0, max_encumbrance: 89000, inventory: holder === 'student' ? [B] : [],
        rooms: R.map(path => !loaded[path] ? { path, exists: 0 } : { path, exists: 1, object: path, program: path, clonep: 0,
            exits: copy(loaded[path].exits), doors: copy(loaded[path].doors), door_implementation: '/mudcore/inherit/room',
            xin_count: path === R[5] ? stock : null,
            inventory: [...(env === path ? [actor.object] : []), ...(path === R[5] ? [...bone, ...(letter ? [L] : []), ...(holder === 'room' ? [B] : [])] : [])] }),
        pending_close: timer ? [{ object: R[0], function: 'close', tuple_size: 3, remaining: timer }] : [],
        book: holder ? { exists: 1, object: B, program: B, clonep: 0, id: 'qiankunbook', weight: 600,
            environment: holder === 'student' ? actor.object : R[5], owner_chain: holder === 'student' ? [actor.object, env] : [R[5]],
            skill: { name: 'qiankun-danuoyi', exp_required: 1000000, jing_cost: 200, difficulty: 45, max_skill: 310, need: { sanscrit: 200 } } } : { exists: 0 },
        letters: letter ? [{ object: L, program: '/d/mingjiao/obj/yixin', clonep: 1, id: 'yi xin', weight: 100, environment: R[5] }] : [] });
    const raw = { kind: 'sample', condition_id: c.id, method: 'scene', index: 0, outcome: 'observed', reason: '', elapsed: 0.01,
        before: [copy(actor), copy(target)], immediate: [], after: [], metrics: [{}, {}],
        launches: [], refusals: [], interfaces: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [], dropped: [],
        route_preparation: { before: point(), load_steps: [] }, route_steps: [] };
    for (const path of p.load_order) { const before = point(); load(path); raw.route_preparation.load_steps.push({ path, before, after: point() }); }
    load(p.start_room); env = p.start_room; raw.route_preparation.after = point(); raw.immediate = [copy(actor), copy(target)];
    let cost = 0;
    for (const [i, spec] of p.route_steps.entries()) {
        const s = { ...copy(spec), before: point(), elapsed: spec.kind === 'wait' ? spec.seconds : 0.001, messages: [], message_scope: scope };
        const emit = text => s.messages.push({ category: 'vision', text });
        if (spec.kind === 'wait') {
            s.started = wall; wall += spec.seconds; raw.elapsed += spec.seconds;
            if (spec.seconds === 6 || p.variant === 'repeat' && i === 4) {
                timer = 0; delete loaded[R[0]].exits.enter; if (env === R[0]) emit('石门又在轧轧声响，缓缓闭上。\n');
            } else timer -= spec.seconds;
        } else {
            s.accepted = 1; const action = spec.action;
            if (action === 'break stone') { s.accepted = 0; actor.temp.notify_fail = '你在干吗? \n'; }
            else if (action === 'break men') {
                if (actor.neili < 2000) emit('你运了运气，觉得自己现在的内力不济。\n');
                else {
                    cost += 2000; actor.neili -= 2000;
                    if (p.actor.skills.force < 300) emit('看来是自己的内功火候还不够。\n');
                    else { cost += 400; actor.neili -= 400; loaded[R[0]].exits.enter = R[1]; timer = 5; emit('石门在试侠一击之下轧轧声响，缓缓移开。\n'); }
                }
            } else if (action.startsWith('go ')) {
                const dir = action.slice(3), room = loaded[env], dest = room.exits[dir];
                if (!dest) { s.accepted = 0; actor.temp.notify_fail = '这个方向没有出路。\n'; }
                else if (room.doors[dir]?.status === 1) { s.accepted = 0; actor.temp.notify_fail = '你必须先把石门打开！\n'; }
                else { actor.temp.notify_fail = '你过不去。\n'; load(dest); env = dest; go++; }
            } else if (action.endsWith('north')) {
                const status = Number(action.startsWith('close')), room = loaded[env], d = room.doors.north, o = loaded[room.exits.north]?.doors[d.other_side_dir];
                if (d.status === status || o?.status === status) { s.accepted = 0; actor.temp.notify_fail = status ? '石门已经是关着的了。\n' : '石门已经是开着的了。\n'; }
                else { d.status = status; if (o) o.status = status; }
            } else if (action === 'ketou') { holder = 'room'; letter = true; stock = 0;
                emit('突然你抬眼看到遗骨下面，有一些东西，你看了看，原来是一封信和一张羊皮。\n'); }
            else if (action === 'get qiankunbook') holder = 'student';
            else assert.fail('unsupported fixture command');
            s.failure = actor.temp.notify_fail ?? null;
        }
        s.after = point(); raw.route_steps.push(s);
    }
    raw.route_final = point(); raw.after = [copy(actor), copy(target)]; if (cost) raw.metrics[0].neili_cost = cost;
    const destroyed = Object.keys(loaded).flatMap(path => [path, ...(path === R[5] ? [...bone, ...(letter ? [L] : [])] : [])]);
    if (holder) destroyed.push(B); const before = point(); for (const path of Object.keys(loaded)) delete loaded[path];
    env = S; timer = 0; holder = ''; letter = false; raw.route_cleanup = { before, destroyed, after: point() }; return raw;
}
const corruptRecord = (c, edit) => { const raw = fixture(c); edit(raw); assert.throws(() => record(raw, c)); };
test('all11 source-backed synthetic protocols validate while observed is not universal game success', () => {
    for (const c of main) record(fixture(c), c);
    const c = get('natural'), raw = fixture(c), e = effects([{ raw }], c);
    assert.equal(e.commands, 13); assert.equal(e.commands_accepted, 12); assert.equal(e.command_refusals, 1);
    assert.equal(e.moves, 6); assert.equal(e.neili_cost, 2400); assert.equal(e.books_created, 1); assert.equal(e.books_received, 1);
    assert.equal(e.callbacks_closed, 1); assert.equal(e.waits, 1); assert.equal(raw.after[0].neili, 2600);
    const cold = get('9-mishi-0'), a = effects([{ raw: fixture(cold) }], cold);
    assert.equal(a.commands_accepted, 0); assert.equal(a.command_refusals, 2); assert.equal(a.neili_cost, 0);
});
test('stone strict fees preserve force299 pre-deduction and genuine negative remainder, no2400 gate or recovery', () => {
    for (const [variant, final, cost] of [['neili2000-force299', 0, 2000], ['neili2000-force300', -400, 2400], ['neili2399-force300', -1, 2400]]) {
        const c = get(variant), r = fixture(c); assert.equal(r.after[0].neili, final); assert.equal(effects([{ raw: r }], c).neili_cost, cost);
        corruptRecord(c, r => { r.metrics[0].neili_cost--; }); corruptRecord(c, r => { r.after[0].neili = Math.max(0, final) + 1; });
    }
    corruptRecord(get('neili2000-force300'), r => { r.metrics[0].neili_recovery = 400; });
    corruptRecord(get('neili1999-force300'), r => { r.route_steps[0].accepted = 0; });
    corruptRecord(get('neili2000-force299'), r => { r.route_steps[0].after.rooms[0].exits.enter = R[1]; });
});
test('repeat refresh and original three-tupletimer require actual2/4/2 timing and midpointopen onepending', () => {
    const c = get('repeat'), r = fixture(c); record(r, c); assert.equal(effects([{ raw: r }], c).neili_cost, 4800);
    corruptRecord(c, r => { r.route_steps[3].after.pending_close = []; });
    corruptRecord(c, r => { r.route_steps[3].after.rooms[0].exits.enter = undefined; });
    corruptRecord(c, r => { r.route_steps[1].after.pending_close.push(copy(r.route_steps[1].after.pending_close[0])); });
    corruptRecord(c, r => { r.route_steps[0].after.pending_close[0].tuple_size = 4; });
    corruptRecord(c, r => { r.route_steps[0].after.pending_close[0].remaining = 6; });
    corruptRecord(c, r => { r.route_steps[3].elapsed = 1; });
    corruptRecord(c, r => { r.route_steps[4].messages = []; });
});
test('cold constructorhistory, sourceone-hop doors and misdirected mishi south are not repaired in fixtures', () => {
    for (const v of ['mishi-9-0', '0-mishi-9']) {
        const c = get(v), r = fixture(c); record(r, c);
        assert.equal(r.route_steps[0].after.rooms[1].doors.north.status, 0); // Not a recursive third-room close.
        assert.equal(r.route_steps[2].after.environment, R[5]); assert.equal(r.route_steps[3].after.environment, R[1]);
        corruptRecord(c, r => { r.route_steps[0].after.rooms[1].doors.north.status = 1; });
        corruptRecord(c, r => { r.route_steps[3].after.environment = R[4]; });
        corruptRecord(c, r => { r.route_preparation.load_steps.reverse(); });
    }
    corruptRecord(get('9-mishi-0'), r => { r.route_steps[0].accepted = 1; });
    corruptRecord(get('natural'), r => { r.route_steps[12].after.rooms[1].exits.out = R[0]; });
});
test('naturaloriginalblueprint/book600/yixin100/twoITEMbones and cleanup cannot be replaced or leftalive', () => {
    const c = get('natural');
    corruptRecord(c, r => { r.route_steps[9].after.book.clonep = 1; });
    corruptRecord(c, r => { r.route_steps[9].after.book.object += '#9'; });
    corruptRecord(c, r => { r.route_steps[9].after.book.skill.need.sanscrit = 199; });
    corruptRecord(c, r => { r.route_steps[9].after.letters[0].weight = 600; });
    corruptRecord(c, r => { r.route_steps[10].after.inventory = []; });
    corruptRecord(c, r => { r.route_steps[10].after.encumbrance = 0; });
    corruptRecord(c, r => { r.route_cleanup.destroyed.splice(r.route_cleanup.destroyed.indexOf(B), 1); });
    corruptRecord(c, r => { r.route_cleanup.after.book = copy(r.route_final.book); });
    corruptRecord(c, r => { r.route_cleanup.after.go_count = 0; });
});
test('strict metadata/missingpoint/fullsnapshot/counter guards distinguish unknown from zero and noevent', () => {
    const c = get('wrong-arg');
    for (const index of [null, -1, 2, '0', false]) corruptRecord(c, r => { r.index = index; });
    corruptRecord(c, r => { delete r.route_steps[0].failure; });
    corruptRecord(c, r => { r.route_steps[0].failure = '错误'; });
    corruptRecord(c, r => { delete r.metrics; }); corruptRecord(c, r => { r.metrics[1].heartbeats = 1; });
    corruptRecord(c, r => { delete r.before[0].conditions; });
    corruptRecord(c, r => { r.before[0].conditions = { poison: 1 }; });
    corruptRecord(c, r => { r.route_preparation.after.player.temp.apply.attack = 1; });
    corruptRecord(c, r => { r.route_final.player.learned.force = 1; });
    corruptRecord(c, r => { r.after[1].qi--; });
    corruptRecord(c, r => { r.attacks.push({ damage: 0 }); });
    corruptRecord(c, r => { delete r.route_cleanup.after.rooms; });
    const unknown = { kind: 'sample', condition_id: c.id, method: 'scene', index: 0, elapsed: 0, outcome: 'error', reason: '原错误保留' };
    assert.deepEqual(record(unknown, c), []); assert.equal(effects([{ raw: unknown }], c).neili_cost, null);
    const mixed = effects([{ raw: fixture(c) }, { raw: unknown }], c); assert.equal(mixed.validated, 1); assert.equal(mixed.unknown, 1); assert.equal(mixed.commands, null);
    for (const edit of [r => { delete r.reason; }, r => { r.reason = ''; }, r => { r.index = null; }, r => { r.elapsed = -1; }]) {
        const r = copy(unknown); edit(r); assert.throws(() => record(r, c));
    }
});
