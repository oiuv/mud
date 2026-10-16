import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { mingjiaoTeachers } from './school_mingjiao_teachers_cases.mjs';
import { mingjiaoGiftConditions as conditions, mingjiaoGiftSourcePaths as sources,
    validateMingjiaoGiftRecord as validate, validateMingjiaoGiftCondition as validateCondition,
    mingjiaoGiftEffects as effects } from './school_mingjiao_gift_cases.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = p => fs.readFileSync(path.join(root, p));
const hash = v => createHash('sha256').update(v).digest('hex'), copy = v => structuredClone(v);
const catalog = { skills: ['force', 'sword', 'unarmed', 'dodge', 'parry', 'xiaoyao-jian'].map(id =>
    ({ id, sha256: hash(read('kungfu/skill/' + id + '.c')) })) };
const cases = conditions(catalog, read), get = variant => cases.find(c => c.parameters.variant === variant);
const item = '/clone/lonely/huanlingjian', npcId = '/kungfu/class/mingjiao/yangxiao#3';
const ids = { player0: '/tests/teaching_actor#1', player1: '/tests/actor#2', teacher: npcId,
    stage: '/tests/runner', remote: '/inherit/room/room#4', container: '/clone/misc/bag#5' };
const quals = ['env/no_learn', 'env/auto_regenerate', 'special_skill/wuxing', 'tattoo/tattoo_str', 'reborn/str',
    'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex'];
const history = ['detach/明教', 'betrayer/明教', 'betrayer/times'];
function point(p, jing) {
    const q = p.actor.properties, skills = p.actor.skills;
    return { contribution: q.gongxian, jing, neili: q.neili, max_neili: q.max_neili, max_jingli: q.max_jingli,
        potential: q.potential, learned_points: q.learned_points, combat_exp: q.combat_exp, shen: q.shen,
        weiwang: q.weiwang, str: q.str, int: q.int, dex: q.dex, con: q.con, character: q.character, gender: q.gender,
        busy: 0, born_family: 0, effective_str: q.str + Math.trunc(skills.unarmed / 10), effective_int: q.int,
        effective_dex: q.dex + Math.trunc(skills.dodge / 10), effective_force: Math.trunc(skills.force / 2),
        effective_dodge: Math.trunc(skills.dodge / 2), skills: copy(skills), learned: {}, mappings: {}, grants: {},
        reborn_family: 0, family: q.family.family_name, master_id: q.family.master_id, master_name: q.family.master_name,
        qualification: Object.fromEntries(quals.map(k => [k, 0])), recruitment: {
            family: copy(q.family), family_present: 1, name: q.name, class: q.class, title: q.title,
            history: Object.fromEntries(history.map(k => [k, 0])), quest: copy(q.quest), temp_quest: copy(p.actor.temp.quest),
            pending_apprentice: '', pending_betrayer: '' } };
}
function snapshot(p, side, carrier, jing) {
    const a = side ? p.target : p.actor, q = a.properties;
    return { object: ids['player' + side], id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1,
        living: 1, wizardp: 0, ghost: 0, busy: 0, jing,
        ...Object.fromEntries(['qi', 'eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'neili', 'max_neili', 'jingli', 'max_jingli',
            'potential', 'learned_points', 'str', 'int', 'dex', 'con', 'combat_exp'].map(k => [k, q[k]])),
        skills: copy(a.skills), effective_skills: Object.fromEntries(Object.entries(a.skills).map(([k, n]) => [k, Math.trunc(n / 2)])),
        learned: {}, mappings: {}, preparations: {}, effective_int: q.int,
        effective_str: q.str + Math.trunc((a.skills.unarmed ?? 0) / 10), effective_dex: q.dex + Math.trunc((a.skills.dodge ?? 0) / 10),
        weapon: 'none', secondary_weapon: 'none', handing: 'none', weapon_details: {}, secondary_weapon_details: {}, handing_details: {},
        weapon_damage: 0, weapon_flag: 0, temp: { apply: { armor: 100 } },
        cultivation: { class: q.class, born_family: 0, 'family/family_name': q.family.family_name },
        inventory: copy(carrier.inventory), encumbrance: carrier.encumbrance, max_encumbrance: carrier.max_encumbrance,
        environment: carrier.environment };
}
function initialItems(p) {
    const carriers = {};
    for (const role of ['player0', 'player1', 'teacher', 'stage', 'remote',
        ...(p.item_setup.holder === 'player0-container' ? ['container'] : [])]) {
        const isRoom = ['stage', 'remote'].includes(role), isContainer = role === 'container';
        carriers[role] = { object: ids[role], program: role === 'teacher' ? '/kungfu/class/mingjiao/yangxiao'
            : role === 'container' ? '/clone/misc/bag' : role === 'stage' ? '/tests/runner'
                : role === 'remote' ? '/inherit/room/room' : role === 'player0' ? '/tests/teaching_actor' : '/tests/actor',
            name: role === 'teacher' ? '杨逍' : role === 'container' ? '包裹' : isRoom ? null
                : p[role === 'player0' ? 'actor' : 'target'].properties.name,
            environment: isRoom || isContainer ? 0 : ids.stage,
            is_character: isRoom || isContainer ? 0 : 1,
            family: role === 'teacher' ? '明教' : isRoom || isContainer ? 0 : p[role === 'player0' ? 'actor' : 'target'].properties.family.family_name,
            encumbrance: role === 'teacher' ? 10000 : 0,
            max_encumbrance: isRoom ? 100000000000 : isContainer ? 4000 : role === 'teacher' ? 98600 : 89000,
            inventory: role === 'teacher' ? ['/d/items/cloth/baipao2#8', '/clone/weapon/gangjian#9']
                : role === 'stage' ? [ids.player0, ids.player1, ids.teacher] : [],
            weapon: role === 'teacher' ? '/clone/weapon/gangjian#9' : 'none', secondary_weapon: 'none',
            apply: isRoom || isContainer ? {} : role === 'teacher' ? { attack: 120, damage: 145, dodge: -2 } : { armor: 100 } };
    }
    return { carriers, items: [{ object: item, program: item, clonep: 0, id: 'huanling jian', environment: 0,
        owner_chain: [], weight: 4000, skill_type: 'sword', flag: 4, consistence: 100, material: 'steel', stable: 100,
        equipped: 0, is_weapon: 1, weapon_prop: { damage: 100, dodge: -1 }, armor_prop: { dodge: -1 } }] };
}
function relocate(point, role) {
    const result = copy(point), old = point.items[0].owner_chain;
    const env = role === 'unowned' ? 0 : ids[role === 'player0-container' ? 'container' : role], chain = [];
    let cursor = env;
    while (cursor) { chain.push(cursor); cursor = Object.values(result.carriers).find(c => c.object === cursor).environment; }
    result.items[0].environment = env; result.items[0].owner_chain = chain;
    for (const [key, c] of Object.entries(result.carriers)) {
        c.inventory = c.inventory.filter(id => id !== item); if (c.object === env) c.inventory.push(item);
        if (!['stage', 'remote'].includes(key)) c.encumbrance += (Number(chain.includes(c.object)) - Number(old.includes(c.object))) * 4000;
    }
    return result;
}
// Synthetic consumer traces, not proof of real objects, RNG or successful acquisition.
function fixture(c, fee = 10) {
    const p = c.parameters, t = mingjiaoTeachers.find(t => t.key === 'yangxiao'), first = initialItems(p);
    let current = copy(first);
    if (current.carriers.container) { current.carriers.container.environment = ids.player0; current.carriers.player0.inventory.push(ids.container); }
    current = relocate(current, p.item_setup.holder);
    current.carriers.player0.max_encumbrance = current.carriers.player0.encumbrance + p.item_setup.free_capacity;
    const playersBefore = [0, 1].map(side => snapshot(p, side, first.carriers['player' + side], p[side ? 'target' : 'actor'].properties.jing));
    const playersAfter = [0, 1].map(side => snapshot(p, side, current.carriers['player' + side], p[side ? 'target' : 'actor'].properties.jing));
    const teacherState = { object: npcId, id: 'yang xiao', living: 1, playerp: 0, skills: copy(t.levels), class: '',
        mappings: { force: 'shenghuo-xinfa', dodge: 'shenghuo-bu', cuff: 'pili-quan', parry: 'xiaoyao-jian', sword: 'xiaoyao-jian' },
        preparations: { cuff: 'pili-quan' }, no_teach: {}, env_no_teach: 0, recognize_source: 0,
        title: '明教光明左使', born_family: 0, inherit_title: 0, attempt_source: '/kungfu/class/mingjiao/yangxiao',
        family: { family_name: '明教', generation: 36, title: '弟子', privs: -1 }, family_present: 1 };
    const autonomous = heartbeat => ({ heartbeat, blueprint: '/kungfu/class/mingjiao/yangxiao', blueprint_heartbeat: 0, callbacks: [] });
    const steps = []; let jing = p.actor.properties.jing, owner = p.item_setup.holder, total = 0;
    for (const command of p.teaching_expectations) {
        const before = point(p, jing), itemBefore = copy(current); let notice, grant = false, result;
        if (jing < 30) notice = '你现在的精神不太好，没法和别人套瓷。';
        else {
            jing -= fee; total += fee;
            if (p.variant === 'other-family') notice = '与我明教素无渊源，不知此话从何说起。';
            else if (p.variant === 'other-master') notice = '只有我的弟子才配使用幻灵剑，你还是走吧。';
            else if (p.variant === 'shen79999') notice = '你目前所做的侠义正事不够，这幻灵剑暂时还不能交给你。';
            else if (p.variant === 'skill0') notice = '都未曾学过，拿幻灵剑又有何用？';
            else if (p.variant === 'skill119') notice = '火候未到，就算拿着幻灵剑也没用。';
            else if (['player0', 'player0-container'].includes(owner)) notice = '不就是你拿着在用么，怎么反倒找我来了？';
            else if (owner === 'player1') notice = p.variant === 'peer-holder'
                ? '在用，你若需要就去找他吧。' : '手中，你去把它取回来吧。';
            else if (['stage', 'remote'].includes(owner)) notice = '我已经借出去了，你还是隔段时间再来吧。';
            else { grant = true; notice = '既然这样，那这柄幻灵剑你就暂时拿去吧。'; }
        }
        if (grant) { owner = p.item_setup.free_capacity === 3999 ? 'stage' : 'player0'; current = relocate(current, owner); }
        steps.push({ student: ids.player0, teacher: npcId, resolved_teacher: npcId, teacher_program: t.path,
            teacher_skills: copy(t.levels), teacher_before: copy(teacherState), teacher_after: copy(teacherState),
            command: command.action, command_accepted: 7, elapsed: 0.001, before, after: point(p, jing),
            item_before: itemBefore, item_after: copy(current), message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: [{ category: 'vision', text: notice + (owner === 'stage' && grant ? '只好先扔在一旁。' : '') }] });
    }
    return { kind: 'sample', condition_id: c.id, method: 'teaching', index: 0, elapsed: 0.01, outcome: p.expected,
        before: copy(playersAfter), after: [snapshot(p, 0, current.carriers.player0, jing), copy(playersAfter[1])], teaching: steps,
        teacher_preparations: [{ key: 'yangxiao', command: 'test_interface', entry_actor: ids.player0, return_actor: ids.player0,
            initializer_actor: 'not_observed', teacher_program: t.path, teacher: npcId, teacher_state: teacherState,
            before: copy(playersBefore[0]), after: copy(playersBefore[0]), autonomy_before: autonomous(1), autonomy_after: autonomous(0) }],
        teacher_cleanups: [{ object: npcId, pending: 0, object_exists: 0 }],
        gift_preparation: { item, holder: p.item_setup.holder, command: 'test_interface', entry_actor: ids.player0,
            return_actor: ids.player0, singleton_loaded_before: 0, players_before: playersBefore, players_after: playersAfter,
            initial_state: first, item_after: copy(steps[0].item_before) },
        gift_cleanup: { singleton: { object: item, exists_after: 0 }, owned: [
            { object: ids.remote, program: '/inherit/room/room', exists_after: 0 },
            ...(p.item_setup.holder === 'player0-container' ? [{ object: ids.container, program: '/clone/misc/bag', exists_after: 0 }] : [])] },
        metrics: [total ? { jing_cost: total } : {}, {}], launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [] };
}
const bad = (c, edit) => { const raw = fixture(c); edit(raw); assert.throws(() => validate(raw, c)); };
test('16/32 finite conditions and 34 original asks, with frozen 122-file closure', () => {
    assert.equal(cases.length, 16); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 32);
    assert.equal(cases.reduce((n, c) => n + c.samples * c.parameters.teaching_expectations.length, 0), 34);
    assert.equal(conditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 32);
    assert.equal(sources.length, 122); assert.equal(new Set(cases.map(c => c.id)).size, 16);
    assert.throws(() => conditions(catalog, p => p === 'adm/daemons/masterd.c' ? Buffer.concat([read(p), Buffer.from('\n')]) : read(p)));
});
test('all 16 synthetic traces pass at both original fee endpoints, not runtime evidence', () => {
    for (const c of cases) for (const fee of [10, 19]) validate(fixture(c, fee), c);
});
test('repeat, teacher-held and exact-capacity player delivery are not duplicate grants', () => {
    const c = get('gift-repeat'), data = validate(fixture(c), c);
    assert.equal(data.filter(v => v.grants_attempted).length, 1); assert.equal(data[1].already_owned, 1);
    bad(c, r => { r.teaching[1].item_after.items[0].environment = 0; r.teaching[1].item_after.items[0].owner_chain = []; });
    bad(get('teacher-holder'), r => { r.teaching[0].item_after.carriers.teacher.encumbrance++; });
    bad(get('capacity4000'), r => { r.after[0].temp.apply.dodge = -1; });
});
test('overflow is observed floor transfer, never player receipt or a qualification refusal', () => {
    const c = get('capacity3999'), raw = fixture(c), v = validate(raw, c)[0];
    assert.equal(raw.outcome, 'observed'); assert.equal(v.qualification_passed, 1);
    assert.equal(v.floor_receipts, 1); assert.equal(v.player_receipts, 0);
    bad(c, r => { r.outcome = 'refused'; });
    bad(c, r => { r.teaching[0].item_after.items[0].environment = ids.player0; });
    bad(c, r => { r.teaching[0].messages = [{ category: 'vision', text: '既然这样，那这柄幻灵剑你就暂时拿去吧。' }]; });
});
test('actual family/master/raw120/shen80000 gates cannot be bypassed', () => {
    for (const variant of ['other-family', 'other-master', 'shen79999', 'skill0', 'skill119']) {
        const c = get(variant); assert.equal(validate(fixture(c), c)[0].qualification_passed, 0);
        bad(c, r => { r.teaching[0].item_after = relocate(r.teaching[0].item_after, 'player0'); });
        bad(c, r => { r.outcome = 'observed'; });
    }
    const wrong = copy(get('capacity4000')); wrong.parameters.actor.skills['xiaoyao-jian'] = 119;
    assert.throws(() => validateCondition(wrong));
});
test('self-container, peer, outsider and remote refusals preserve exact ownership', () => {
    for (const variant of ['player0-holder', 'player0-container', 'peer-holder', 'outsider-holder', 'remote-holder']) {
        const c = get(variant); bad(c, r => { r.teaching[0].item_after.items[0].owner_chain.pop(); });
        bad(c, r => { r.teaching[0].messages = []; });
    }
    bad(get('player0-container'), r => { r.gift_preparation.item_after.carriers.container.max_encumbrance = 3999; });
});
test('askjing29 costs zero; jing30 pays one original fee and no skill/contribution gains', () => {
    const c = get('jing29'); assert.equal(validate(fixture(c), c)[0].jing_cost, 0);
    bad(c, r => { r.metrics[0].jing_cost = 10; });
    for (const fee of [9, 20]) assert.throws(() => validate(fixture(get('jing30'), fee), get('jing30')));
    bad(get('jing30'), r => { r.teaching[0].after.contribution--; });
    bad(get('jing30'), r => { r.teaching[0].after.learned_points = 1; });
    bad(get('jing30'), r => { delete r.metrics[0].jing_cost; });
});
test('singleton source properties, blueprints, cycles and full direct inventories are mandatory', () => {
    const c = get('capacity4000');
    bad(c, r => { r.teaching[0].item_after.items[0].clonep = 1; });
    bad(c, r => { r.teaching[0].item_after.items[0].weapon_prop.damage = 99; });
    bad(c, r => { delete r.teaching[0].item_after.items[0].armor_prop; });
    bad(c, r => { r.teaching[0].item_after.carriers.stage.inventory.push(item); });
    bad(c, r => { r.teaching[0].item_after.carriers.player0.environment = ids.player0; });
    bad(c, r => { r.teaching[0].item_after.carriers.remote.program = '/tests/runner'; });
});
test('real USER/NPC preparation, no Ling prime, exact capacities and cleanup stay strict', () => {
    const c = get('capacity4000');
    bad(c, r => { r.before[0].wizardp = 1; });
    bad(c, r => { r.gift_preparation.return_actor = '/tests/runner'; });
    bad(c, r => { r.skill_load_context = {}; });
    bad(c, r => { r.teacher_preparations[0].teacher_state.attempt_source = 0; });
    bad(c, r => { r.teacher_preparations[0].autonomy_after.heartbeat = 1; });
    bad(c, r => { r.gift_cleanup.singleton.exists_after = 1; });
    bad(c, r => { r.gift_cleanup.owned = []; });
    bad(c, r => { r.gift_preparation.item_after.carriers.player0.max_encumbrance = 3999; });
    bad(c, r => { r.after[1].jing--; });
    bad(c, r => { delete r.teacher_preparations[0].teacher_state.mappings; });
    bad(c, r => { r.teacher_preparations[0].teacher_state.mappings.force = 'shenghuo-shengong'; });
    bad(c, r => { r.gift_preparation.item_after.carriers.teacher.apply.damage++; });
    bad(c, r => { r.gift_preparation.item_after.carriers.teacher.max_encumbrance++; });
});
test('elapsed/index and unknown diagnostics fail closed instead of faking normal state', () => {
    const c = get('gift-repeat');
    for (const index of [null, -1, 2, '0', false]) bad(c, r => { r.index = index; });
    for (const elapsed of [null, -1, Infinity, NaN, '0', false]) bad(c, r => { r.elapsed = elapsed; });
    bad(c, r => { delete r.elapsed; });
    for (const outcome of ['error', 'not_applicable']) {
        const raw = { kind: 'sample', condition_id: c.id, method: 'teaching', index: 0, elapsed: 0, outcome, reason: 'real isolated diagnostic' };
        assert.deepEqual(validate(raw, c), []);
        for (const reason of ['', ' ', null, 0]) { const wrong = copy(raw); wrong.reason = reason; assert.throws(() => validate(wrong, c)); }
        const missing = copy(raw); delete missing.reason; assert.throws(() => validate(missing, c));
    }
    bad(c, r => { r.metrics[0].heartbeats = 1; }); bad(c, r => { r.callbacks.push({ name: 'fake' }); });
});
test('Effects separate eligibility/delivery/player/floor/owner, and never invent unknown zeros', () => {
    const totals = cases.map(c => effects([0, 1].map(i => { const raw = fixture(c); raw.index = i;
        return { condition_id: c.id, outcome: raw.outcome, raw }; }), c));
    const sum = k => totals.reduce((n, v) => n + v[k], 0);
    assert.equal(sum('commands'), 34); assert.equal(sum('commands_accepted'), 34); assert.equal(sum('jing_cost'), 320);
    assert.equal(sum('grants_attempted'), 10); assert.equal(sum('player_receipts'), 8); assert.equal(sum('floor_receipts'), 2);
    assert.equal(sum('qualification_passed'), 22); assert.equal(sum('already_owned'), 6);
    const c = get('gift-repeat'), raw = { kind: 'sample', condition_id: c.id, method: 'teaching', index: 0,
        elapsed: 0, outcome: 'error', reason: 'isolated diagnostic' };
    const v = effects([{ condition_id: c.id, outcome: raw.outcome, raw }], c);
    assert.equal(v.validated, 0); assert.equal(v.unknown, 1); assert.equal(v.jing_cost, null); assert.equal(v.player_receipts, null);
    assert.throws(() => effects([{ condition_id: c.id, outcome: 'observed', raw }], c));
});
test('real sparse counters permit unchanged target and jing29 empty maps, never missing metrics or fees', () => {
    const normal = get('capacity4000'), poor = get('jing29');
    const n = fixture(normal), p = fixture(poor);
    assert.deepEqual(n.metrics[1], {}); assert.deepEqual(p.metrics, [{}, {}]);
    validate(n, normal); validate(p, poor);
    const explicit = fixture(poor); explicit.metrics = [{ jing_cost: 0 }, { jing_cost: 0 }]; validate(explicit, poor);
    bad(normal, r => { delete r.metrics[0].jing_cost; });
    bad(normal, r => { delete r.metrics; });
    bad(poor, r => { r.metrics[1] = null; });
    bad(poor, r => { r.metrics[1].jing_cost = 1; });
    bad(poor, r => { r.metrics[1].jing_cost = null; });
});

test('original side0 teaching USER and side1 ordinary USER identities cannot be swapped', () => {
    const c = get('capacity4000'), r = fixture(c);
    assert.equal(r.before[0].object, '/tests/teaching_actor#1');
    assert.equal(r.before[1].object, '/tests/actor#2');
    assert.equal(r.gift_preparation.initial_state.carriers.player0.program, '/tests/teaching_actor');
    assert.equal(r.gift_preparation.initial_state.carriers.player1.program, '/tests/actor');
    validate(r, c);
    bad(c, v => { v.gift_preparation.initial_state.carriers.player0.program = '/tests/actor'; });
    bad(c, v => { v.gift_preparation.initial_state.carriers.player1.program = '/tests/teaching_actor'; });
    bad(c, v => { v.gift_preparation.initial_state.carriers.player0.object = '/tests/actor#1'; });
    bad(c, v => { v.gift_preparation.initial_state.carriers.player1.object = '/tests/teaching_actor#2'; });
    bad(c, v => { v.before[0].object = '/tests/actor#1'; });
    bad(c, v => { v.before[1].object = '/tests/teaching_actor#2'; });
});
