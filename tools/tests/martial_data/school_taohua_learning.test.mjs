import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256, scanSource } from './inventory.mjs';
import { taohuaLearningConditions, taohuaLearningSourcePaths, taohuaLearningReviewed,
    taohuaLearningTeachers, taohuaLearningBooks, taohuaLearningFixtureRequirements,
    taohuaLearningAllowed, taohuaLearningProgress, taohuaLearningDecision,
    validateTaohuaLearningRecord, taohuaLearningEffects } from './school_taohua_learning_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url)), read = path => readFileSync(join(root, path));
const copy = value => structuredClone(value);
const evidence = taohuaLearningSourcePaths.map(path => ({ path, sha256: sha256(read(path)) }));
const fingerprint = sha256(JSON.stringify(evidence));
const catalog = { source_fingerprint: fingerprint, skills: taohuaLearningSourcePaths
    .filter(p => p.startsWith('kungfu/skill/') && !p.slice('kungfu/skill/'.length).includes('/'))
    .map(path => ({ path, id: path.slice('kungfu/skill/'.length, -2), sha256: sha256(read(path)) })) };
const relations = { source_fingerprint: fingerprint, objects: taohuaLearningTeachers.map(t => {
    const path = t.path.slice(1) + '.c', parsed = scanSource(read(path).toString());
    assert.deepEqual(parsed.lexical_issues, []);
    return { path, sha256: sha256(read(path)), group: 'taohua', names: parsed.calls.filter(c => c.name === 'set_name')
        .map(c => ({ ...c, values: c.args.map(a => a.value ?? null) })),
        skill_assignments: parsed.calls.filter(c => c.name === 'set_skill').map(c => ({ id: c.args[0].value,
            level: c.args[1], receiver: c.receiver, function: c.function })) };
}) };
const cases = taohuaLearningConditions(relations, catalog, read), smoke = taohuaLearningConditions(relations, catalog, read, { smoke: true });
const get = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };
const t = key => taohuaLearningTeachers.find(t => t.key === key);
const b = key => taohuaLearningBooks.find(b => b.key === key);
const grants = ['can_learn/huang/count', 'can_learn/huang/bibo-shengong', 'can_learn/huang/tanzhi-shentong'];
const histories = ['detach/桃花岛', 'betrayer/桃花岛', 'betrayer/times'];
const student = '/tests/actor#1';
const ids = Object.fromEntries(taohuaLearningTeachers.map((t, i) => [t.key, t.path + '#' + (20 + i)]));

function initial(p) {
    const s = copy(p.actor); s.familyPresent = !!s.properties.family && typeof s.properties.family === 'object';
    s.pending = ''; s.pendingBetrayer = ''; s.books = Object.fromEntries((p.book_setup?.books ?? []).map(key => [key, p.book_setup.holder]));
    s.freeCapacity = p.book_setup?.free_capacity ?? 0; return s;
}

function point(s) {
    const q = s.properties, family = s.familyPresent ? q.family : {};
    return { contribution: q.gongxian, jing: q.jing, neili: q.neili, max_neili: q.max_neili,
        max_jingli: q.max_jingli, potential: q.potential, learned_points: q.learned_points,
        combat_exp: q.combat_exp, shen: q.shen, weiwang: q.weiwang,
        str: q.str, int: q.int, con: q.con, dex: q.dex, character: q.character,
        effective_int: q.int + Math.trunc((s.skills.literate ?? 0) / 10),
        effective_dex: q.dex + Math.trunc((s.skills.dodge ?? 0) / 10),
        effective_force: Math.trunc((s.skills.force ?? 0) / 2) + (s.skills[s.mappings.force] ?? 0),
        effective_dodge: Math.trunc((s.skills.dodge ?? 0) / 2) + (s.skills[s.mappings.dodge] ?? 0) - Number(!!s.equipment),
        skills: copy(s.skills), learned: copy(s.learned), mappings: copy(s.mappings),
        grants: Object.fromEntries(grants.map(k => [k, q[k] ?? 0])), reborn_family: q['reborn/family_name'],
        family: family.family_name ?? null, master_id: family.master_id ?? null, master_name: family.master_name ?? null,
        recruitment: { family: copy(family), family_present: s.familyPresent ? 1 : null,
            name: q.name, class: q.class, title: q.title, history: Object.fromEntries(histories.map(k => [k, q[k]])),
            quest: copy(q.quest || null), temp_quest: copy(s.temp.quest || null),
            pending_apprentice: s.pending ? ids[s.pending] : '', pending_betrayer: s.pendingBetrayer ? ids[s.pendingBetrayer] : '' },
        taohua: { master: s.temp['taohua/master'] || null, countbook: s.temp['taohua/countbook'] || null } };
}

function boundary(s) {
    const p = point(s), equipped = !!s.equipment;
    return { ...copy(s.properties), ...p, object: student, id: 'left', userp: 1, playerp: 1, interactive: 1,
        wizardp: 0, living: 1, ghost: 0, busy: null, preparations: {},
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0, weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { object: '/tests/sword#90', program: '/tests/sword', id: 'practice weapon',
            weight: 3000, skill_type: 'sword', damage: 50, flag: 4, material: null, rigidity: null, no_wield: null } : {},
        handing: 'none', handing_details: {}, temp: { apply: { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) } } };
}

function bookPoint(s, p) {
    const room = '/tests/runner', itemRole = holder => holder === 'teacher' ? null
        : holder.includes('container') ? 'container' : holder;
    const holders = p.book_setup.holder;
    const carriers = { student: { object: student, program: '/tests/actor', environment: room,
        inventory: [], family: s.properties.family?.family_name ?? null, is_character: 1 },
    room: { object: room, program: room, environment: null, inventory: [], family: null, is_character: 0 } };
    for (const key of new Set(p.teaching_expectations.filter(s => s.teacher_key).map(s => s.teacher_key)))
        carriers[key] = { object: ids[key], program: t(key).path, environment: room, inventory: [], family: '桃花岛', is_character: 1 };
    if (holders.startsWith('peer') || holders.startsWith('outsider')) {
        const owner = holders.startsWith('peer') ? 'peer' : 'outsider';
        carriers[owner] = { object: '/tests/actor#70', program: '/tests/actor', environment: room, inventory: [],
            family: owner === 'peer' ? '桃花岛' : '武当派', is_character: 1 };
    }
    if (holders.includes('container')) {
        const owner = holders.startsWith('student') ? 'student' : 'outsider';
        carriers.container = { object: '/tests/container#80', program: '/tests/container',
            environment: carriers[owner].object, inventory: [], family: null, is_character: 0 };
        carriers[owner].inventory.push(carriers.container.object);
    }
    for (const c of Object.values(carriers)) if (c.environment === room) carriers.room.inventory.push(c.object);
    const items = p.book_setup.books.map(key => {
        const definition = b(key), holder = s.books[key];
        if (holder === 'cold') return { key, exists: 0, object: '', program: '' };
        const role = itemRole(holder) ?? (definition.count ? 'qu' : 'huang'), carrier = carriers[role];
        carrier.inventory.push(definition.path);
        const chain = [carrier.object]; let parent = carrier.environment;
        while (parent) { chain.push(parent); parent = Object.values(carriers).find(c => c.object === parent).environment; }
        return { key, exists: 1, object: definition.path, program: definition.path, clonep: 0, id: definition.id,
            environment: carrier.object, owner_chain: chain, weight: 500, amount: null,
            skill: { name: definition.skill, min_skill: definition.min, max_skill: definition.max,
                jing_cost: definition.jing, difficulty: definition.difficulty,
                ...(definition.count ? { exp_required: 1000000, need: { literate: 300 } } : {}) } };
    });
    for (const [role, c] of Object.entries(carriers)) {
        const bookWeight = items.filter(i => i.exists && i.owner_chain.includes(c.object)).length * 500;
        c.encumbrance = role === 'room' ? null : bookWeight + (role === 'student' && holders === 'student-container' ? 100 : 0);
        c.max_encumbrance = role === 'room' ? 100000000000 : role === 'student' ? c.encumbrance + s.freeCapacity : 100000;
    }
    return { carriers, items };
}

// Structural synthetic traces exercise the protocol, not an LPC simulation.
// Formula/ordering tests below use independently specified numeric anchors too.
function record(condition, { cost = 23, randomEnd = 'min', referral = 'qu' } = {}) {
    const p = condition.parameters, s = initial(p), before = boundary(s), teaching = [];
    const keys = new Set(p.teaching_expectations.filter(i => i.teacher_key && i.teacher_key !== 'assigned').map(i => i.teacher_key));
    if (p.teaching_expectations.some(i => i.teacher_key === 'assigned')) for (const k of ['feng', 'lu', 'qu']) keys.add(k);
    let jingCost = 0;
    for (const [index, i] of p.teaching_expectations.entries()) {
        const key = i.teacher_key === 'assigned' ? taohuaLearningTeachers.find(t => t.name === s.temp['taohua/master']).key : i.teacher_key;
        const step = { before: point(s), student, teacher: key ? ids[key] : 'none',
            resolved_teacher: key ? ids[key] : 'none', teacher_program: key ? t(key).path : 'none',
            teacher_skills: key ? copy(p.teacher_levels[key]) : {}, command: i.action ?? `apprentice ${t(key).id}`,
            elapsed: 0.01, wall_time: 2000 + index, messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' };
        if (p.book_setup) step.item_before = bookPoint(s, p);
        if (i.command_kind === 'study') step.resolved_book = s.books[i.book] === 'student' ? b(i.book).path : '';
        const d = taohuaLearningDecision(p, i, s, { askCost: 17, referral });
        step.command_accepted = d.accepted ? cost : 0;
        s.properties.jing -= d.jing; jingCost += d.jing; s.properties.learned_points += d.learned_points ?? 0;
        Object.assign(s.properties, d.updates);
        if (d.completed) {
            const endpoint = d.support.at(randomEnd === 'max' ? -1 : 0);
            s.skills[d.skill] = endpoint.level; s.learned[d.skill] = endpoint.learned;
        }
        if (d.countbook) s.temp['taohua/countbook'] = 1;
        if (d.book) { s.books[d.book] = d.book_holder; if (d.acquired) s.freeCapacity -= 500; }
        if (d.family) { s.properties.family = copy(d.family); if (d.recruited) s.properties.family.enter_time = step.wall_time; s.familyPresent = true; }
        for (const field of ['pending', 'pendingBetrayer']) if (Object.hasOwn(d, field)) s[field] = d[field];
        if (Object.hasOwn(d, 'assignment')) s.temp['taohua/master'] = d.assignment;
        if (d.title) s.properties.title = d.title;
        if (d.first) s.properties.gongxian = 0, s.properties.quest = 0, s.temp.quest = 0;
        step.after = point(s); if (p.book_setup) step.item_after = bookPoint(s, p); teaching.push(step);
    }
    return { kind: 'sample', condition_id: condition.id, method: 'teaching', outcome: p.expected,
        before: [before, { object: '/tests/actor#2', id: 'right' }], after: [boundary(s), { object: '/tests/actor#2', id: 'right' }],
        learning_preparations: Object.keys(p.actor.learned).length ? [{ actor: student, function: 'improve_skill',
            skill: 'chuixiao-jifa', amount: 56023, weak_mode: 1,
            before: { ...copy(before), learned: {} }, after: copy(before) }] : [],
        teaching, metrics: [jingCost ? { jing_cost: jingCost } : {}, {}],
        teacher_preparations: [...keys].map(key => ({ key, command: 'test_interface', entry_actor: student, return_actor: student,
            initializer_actor: 'not_observed', teacher: ids[key], teacher_program: t(key).path,
            teacher_state: { object: ids[key], id: t(key).id, living: 1, playerp: null, skills: copy(p.teacher_levels[key]) },
            before: copy(before), after: copy(before),
            autonomy_before: { heartbeat: 1, blueprint: t(key).path, blueprint_heartbeat: 0, callbacks: [] },
            autonomy_after: { heartbeat: 0, blueprint: t(key).path, blueprint_heartbeat: 0, callbacks: [] } })),
        teacher_cleanups: [...keys].map(key => ({ object: ids[key], pending: 0, object_exists: 0 })),
        ...(p.book_setup ? { item_cleanup: { owned_remaining: 0,
            singletons: Object.fromEntries(p.book_setup.books.map(key => [b(key).path, 0])) } } : {}),
        launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [] };
}

function validate(suffix, options) { const c = get(suffix), raw = record(c, options); return [validateTaohuaLearningRecord(raw, c), raw, c]; }
const reject = (suffix, edit, pattern) => { const c = get(suffix), raw = record(c); edit(raw, c); assert.throws(() => validateTaohuaLearningRecord(raw, c), pattern); };

test('187候选仅四类公开学习业务，3608正式/187烟雾且未注册未采样', () => {
    assert.equal(cases.length, 187); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3608);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 187);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.deepEqual(['learn', 'recruit', 'books', 'study'].map(k => cases.filter(c => c.parameters.teaching_kind === k).length), [110, 22, 25, 30]);
    assert.equal(cases.filter(c => c.samples === 100).length, 33);
    assert.equal(sha256(JSON.stringify(cases)), '57fba754e43df825247babf08e7847169e6ea7aa6fe437480e8f663c07975894');
    assert.equal(sha256(JSON.stringify(smoke)), '64ef2b69bcd53c0652c2073251e9db5f4a97df4b25eacacabb2881de9aab9daa');
    for (const c of cases) { assert.equal(c.status, 'configured_not_executed'); assert.equal(c.method, 'teaching'); assert.equal(c.parameters.teaching_profile, 'taohua-learning'); }
    assert.equal(taohuaLearningFixtureRequirements.length, 7);
    for (const path of ['tools/tests/martial_data/teaching_cases.mjs', 'tools/tests/martial_data/execution.mjs'])
        assert.ok(read(path).toString().includes('school_taohua_learning_cases'), '接入后须保持注册引用');
});

test('68份真实源码及78关系固定，拒收三人不被填成公开授课师承', () => {
    assert.equal(evidence.length, 68);
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), taohuaLearningReviewed);
    assert.deepEqual(['huang', 'feng', 'lu', 'qu'].map(k => cases.filter(c => c.id.includes(`learn-${k}-`) && c.id.endsWith('-baseline')).length), [34, 14, 16, 14]);
    for (const key of ['rong', 'chen', 'mei']) {
        const c = get(key + '-no-public-teaching'); assert.equal(c.parameters.actor.properties.family, 0);
        const [steps] = validate(key + '-no-public-teaching');
        assert.deepEqual(steps.map(s => [s.accepted, s.completed, s.recruited]), [[1, 0, false], [0, 0, false]]);
    }
    assert.throws(() => taohuaLearningConditions(relations, catalog, path => path.endsWith('study.c') ? Buffer.from(read(path) + '\n') : read(path)), /源码改变/);
});

test('全部187合成协议最小/最大合法随机端点通过，不把合成数据作为真实样本', () => {
    for (const c of cases) for (const randomEnd of ['min', 'max']) {
        const raw = record(c, { randomEnd });
        assert.doesNotThrow(() => validateTaohuaLearningRecord(raw, c), c.id + '/' + randomEnd);
    }
});

test('普通学习独立数值锚：100级识字实际悟性46，jing7/8/17和潜能2分别核账', () => {
    for (const [suffix, jingCost, iterations, accepted, result] of [
        ['literate-jing7', 7, 0, 1, 'accepted_no_growth'], ['literate-jing8', 8, 1, 1, 'learned'],
        ['literate-jing17-times3', 17, 2, 1, 'learned'], ['literate-potential2-times3', 0, 0, 0, 'potential_refused'],
    ]) {
        const [steps, raw] = validate(suffix); const s = steps[0];
        assert.equal(raw.teaching[0].before.effective_int, 46);
        assert.deepEqual([s.jing_cost, s.completed, s.accepted, s.result], [jingCost, iterations, accepted, result]);
        assert.equal(s.learned_points_spent, iterations); assert.equal(raw.after[0].potential, raw.before[0].potential);
    }
    const c = get('literate-jing8'), a = initial(c.parameters);
    const endpoints = taohuaLearningProgress(a, 'literate', 1, 4, 36);
    assert.deepEqual([...new Set(endpoints.map(e => e.learned))], Array.from({ length: 17 }, (_, i) => i + 3));
    assert.equal(validate('literate-jing17-times3')[0][0].gross_learned, 6);
});

test('0级首次授课真实翻倍收费/升级清进度，不把net0解释成未学', () => {
    const c = get('chuixiao-jifa-initial'); assert.ok(!Object.hasOwn(c.parameters.actor.skills, 'chuixiao-jifa'));
    const [steps, raw] = validate('chuixiao-jifa-initial');
    assert.equal(steps[0].jing_cost, 4); assert.equal(steps[0].completed, 1); assert.equal(steps[0].upgrades, 1);
    assert.equal(raw.after[0].skills['chuixiao-jifa'], 1); assert.equal(raw.after[0].learned['chuixiao-jifa'], 0);
    assert.equal(steps[0].gross_learned, null); assert.equal(steps[0].gross_learned_status, 'not_observed_after_random_upgrade_reset');
    reject('chuixiao-jifa-initial', raw => { raw.teaching[0].after.skills['chuixiao-jifa'] = 2; });
});

test('教师低上限/公共武学200/知识教师上限，正受理不保证增长', () => {
    for (const [suffix, accepted, completed] of [['canglang-zhi-cap139', 1, 1], ['canglang-zhi-cap140', 0, 0],
        ['yuxiao-jian-cap199', 1, 1], ['yuxiao-jian-cap200', 1, 0],
        ['chuixiao-jifa-cap399', 1, 1], ['chuixiao-jifa-cap400', 0, 0],
        ['qimen-wuxing-cap159', 1, 1], ['qimen-wuxing-cap160', 0, 0]]) {
        const [s] = validate(suffix); assert.deepEqual([s[0].accepted, s[0].completed], [accepted, completed]);
    }
    for (const key of ['huang', 'feng', 'lu', 'qu']) assert.equal(validate(`${key}-martial-cognize-baseline`)[0][0].accepted, 0);
});

test('no_teach许可与身体分层，弹指raw dex34而非有效身法', () => {
    const [steps] = validate('tanzhi-shentong-finger120-body-refusal');
    assert.deepEqual([steps[0].permission_added, steps[0].completed, steps[0].accepted], [1, 0, 0]);
    const a = copy(get('huang-tanzhi-shentong-baseline').parameters.actor); a.properties.dex = 33; a.skills.dodge = 1000;
    assert.equal(taohuaLearningAllowed('tanzhi-shentong', a), false); a.properties.dex = 34;
    assert.equal(taohuaLearningAllowed('tanzhi-shentong', a), true);
    for (const suffix of ['bibo-shengong-pregranted', 'tanzhi-shentong-pregranted']) {
        const [s] = validate(suffix); assert.equal(s[0].completed, 1); assert.equal(s[0].permission_added, 0);
    }
    reject('tanzhi-shentong-finger120-body-refusal', raw => { raw.teaching[0].after.grants['can_learn/huang/tanzhi-shentong'] = 0; });
});

test('黄非亲传认可只对mathematics限201..299，count300进入raw悟性35本体边界', () => {
    const [pass, rawPass] = validate('count-outsider-int35');
    const [fail, rawFail] = validate('count-outsider-int34');
    assert.deepEqual(pass.map(x => [x.accepted, x.permission_added, x.completed]), [[1, 1, 0], [1, 0, 1]]);
    assert.deepEqual(fail.map(x => [x.accepted, x.permission_added, x.completed]), [[1, 1, 0], [0, 0, 0]]);
    assert.deepEqual([pass[1].result, pass[1].jing_cost, pass[1].learned_points_spent], ['learned', 3, 1]);
    assert.deepEqual([fail[1].result, fail[1].jing_cost, fail[1].learned_points_spent], ['body_refused', 0, 0]);
    assert.equal(rawPass.before[0].jing - rawPass.after[0].jing, 20); // ask17 + trunc(120/35)=3
    assert.equal(rawFail.before[0].jing - rawFail.after[0].jing, 17); // permission only; body uses raw34, not effective74
    assert.equal(rawPass.after[0].skills.count, 10);
    assert.equal(rawPass.after[0].learned.count, 4); // input4 -> 1+trunc(400/110)
    assert.equal(validate('count-outsider-int35', { randomEnd: 'max' })[1].after[0].learned.count, 38);
    for (const [math, completed] of [[200, 0], [201, 1], [299, 1], [300, 0]])
        assert.equal(validate('recognize-math' + math)[0][0].completed, completed);
    assert.equal(validate('recognize-other-skill-math200')[0][0].completed, 0);
    assert.equal(validate('recognize-no-permission')[0][0].completed, 0);
});

test('认可原技能名守卫独立锚：其他技能201/299亦拒，count不继承数学认可范围', () => {
    const p = get('recognize-other-skill-math200').parameters, step = p.teaching_expectations[0];
    const source = read('kungfu/class/taohua/huang.c').toString();
    for (const comparison of ['>= 300', '> 200', '< 200'])
        assert.ok(source.includes('skill == "mathematics" && ob->query_skill("mathematics", 1) ' + comparison));
    for (const math of [199, 200, 201, 299, 300, 400]) {
        const s = initial(p); s.skills.mathematics = math; s.skills.count = 10;
        const other = taohuaLearningDecision(p, step, s);
        assert.deepEqual([other.result, other.accepted, other.completed], ['recognize_declined', 1, 0]);
        const count = taohuaLearningDecision(p, { ...step, skill: 'count' }, s);
        assert.deepEqual([count.result, count.accepted, count.completed], math < 300
            ? ['body_refused', 0, 0] : ['learned', 1, 1]);
        s.properties['can_learn/huang/count'] = 0;
        assert.equal(taohuaLearningDecision(p, { ...step, skill: 'count' }, s).result, 'recognize_declined');
    }
});

test('拒绝旧count300提前终止oracle和raw悟性34伪受理或伪增长', () => {
    reject('count-outsider-int35', raw => {
        const step = raw.teaching[1]; step.after = copy(step.before);
        Object.assign(raw.after[0], copy(step.before)); raw.metrics[0].jing_cost = 17;
    });
    reject('count-outsider-int34', raw => { raw.teaching[1].command_accepted = 23; });
    reject('count-outsider-int34', raw => { raw.teaching[1].after.learned.count = 4; });
    reject('count-outsider-int34', raw => { raw.teaching[1].after.jing -= 3; raw.metrics[0].jing_cost += 3; });
});

test('学习/问询原命令成本保留1/23/476，统计受理数不累计成本', () => {
    for (const cost of [1, 23, 476]) {
        const c = get('count-outsider-int35'), raw = record(c, { cost });
        const effect = taohuaLearningEffects([{ condition_id: c.id, method: 'teaching', outcome: raw.outcome, raw }], c);
        assert.equal(effect.commands_accepted, 2); assert.equal(effect.command_execution_cost, cost * 2);
    }
    for (const cost of [0, -1, 1.2, null, undefined, '23', true])
        reject('literate-jing8', raw => { raw.teaching[0].command_accepted = cost; });
    reject('literate-potential2-times3', raw => { raw.teaching[0].command_accepted = 23; });
});

test('拜师初次清任务与黄原转介后保留任务/贡献分开，取消不清指派', () => {
    const [first, rawFirst] = validate('huang-first-repeat');
    assert.deepEqual(first.map(s => [s.recruited, s.first_join_cleared]), [[true, true], [false, false]]);
    assert.equal(rawFirst.teaching[0].after.contribution, 0); assert.equal(rawFirst.teaching[0].after.recruitment.quest, null);
    for (const referral of ['feng', 'lu', 'qu']) {
        const [steps, raw] = validate('huang-real-referral', { referral });
        assert.deepEqual(steps.map(s => s.result), ['referred', 'cancelled', 'same_family_transfer']);
        assert.equal(raw.teaching[0].after.recruitment.family.master_id, undefined);
        assert.equal(raw.teaching[1].after.taohua.master, t(referral).name);
        assert.equal(raw.teaching[2].after.master_id, t(referral).id);
        assert.equal(raw.teaching[2].after.contribution, 77);
        assert.deepEqual(raw.teaching[2].after.recruitment.quest, { name: '实验旧任务', count: 7 });
    }
    reject('huang-real-referral', raw => { raw.teaching[1].after.taohua.master = null; });
    reject('huang-real-referral', raw => { raw.teaching[2].after.contribution = 0; });
});

test('正邪闭区间/有效悟性/历史/重复确认拒绝，原师承不被改掉', () => {
    for (const [value, accepted] of [[-10001, false], [-10000, true], [10000, true], [10001, false]])
        assert.equal(validate('huang-shen' + value)[0][0].recruited, accepted);
    assert.equal(validate('huang-effective-int24')[0][0].recruited, false);
    const [steps, raw] = validate('foreign-confirm-refusal');
    assert.deepEqual(steps.map(s => s.result), ['confirmation', 'family_refused']);
    assert.deepEqual(raw.teaching.at(-1).after.recruitment.family, raw.teaching[0].before.recruitment.family);
    for (let index = 0; index < 3; index++) assert.equal(validate('huang-history' + index)[0][0].recruited, false);
});

test('五书原单例/重量/配置与真实给出；499失败留师父不伪造落地', () => {
    for (const key of ['taohua', 'xiaopu', 'xuanfengtui', 'hetu', 'luoshu']) {
        const [s, raw] = validate(key + '-acquire-study');
        assert.equal(s.filter(s => s.acquired).length, 1); assert.equal(s.at(-1).result, 'studied');
        assert.equal(raw.teaching.at(-1).item_after.items[0].object, b(key).path);
        assert.equal(raw.teaching.at(-1).item_after.items[0].clonep, 0);
    }
    const [s, raw] = validate('xiaopu-capacity499');
    assert.equal(s[0].accepted, 1); assert.equal(s[0].acquired, false); assert.equal(s[0].jing_cost, 17);
    assert.equal(raw.teaching[0].item_after.items[0].environment, ids.huang);
    reject('xiaopu-capacity499', raw => { raw.teaching[0].item_after.items[0].environment = '/tests/runner'; });
    reject('xiaopu-acquire-study', raw => { raw.teaching[0].item_after.items[0].clonep = 1; });
    reject('xiaopu-acquire-study', raw => { raw.teaching[0].item_after.items[0].weight = 499; });
});

test('药理和箫谱原领书核master_id，不以同名冒充师承或以姓名不符拒绝原ID', () => {
    for (const key of ['taohua', 'xiaopu']) {
        const p = get(key + '-acquire-study').parameters, step = p.teaching_expectations[0];
        const wrongName = initial(p); wrongName.properties.family.master_name = '曲灵风';
        assert.equal(wrongName.properties.family.master_id, 'huang yaoshi');
        assert.equal(taohuaLearningDecision(p, step, wrongName).acquired, true);
        const wrongId = initial(p); wrongId.properties.family.master_id = 'qu lingfeng';
        assert.equal(wrongId.properties.family.master_name, '黄药师');
        const rejected = taohuaLearningDecision(p, step, wrongId);
        assert.deepEqual([rejected.acquired, rejected.accepted, rejected.jing], [false, 1, 10]);
    }
});

test('归属容器/直接持有不同，无临时许可拒绝及黄许可可复用两本书', () => {
    const [s] = validate('xiaopu-student-container');
    assert.deepEqual(s.map(s => s.result), ['book_already_owned', 'book_not_directly_held']);
    assert.deepEqual(s.map(s => s.accepted), [1, 0]);
    const [reuse, raw] = validate('countbook-permission-reused');
    assert.equal(reuse.filter(s => s.acquired).length, 2); assert.equal(raw.teaching.at(-1).after.taohua.countbook, 1);
    assert.equal(validate('qu-no-countbook-permission')[0][0].acquired, false);
    reject('countbook-permission-reused', raw => { raw.teaching[1].after.taohua.countbook = null; });
    reject('xiaopu-outsider-container', raw => { raw.teaching[0].item_before.items[0].owner_chain.shift(); });
});

test('study原严格精神比较80/81/161，总费包含清余量，不扣潜能', () => {
    for (const [jing, expectedCount, expectedCost, learned] of [[80, 0, 80, 0], [81, 1, 80, 16], [161, 2, 161, 32]]) {
        const [s, raw] = validate('hetu-jing' + jing);
        assert.deepEqual([s[0].completed, s[0].jing_cost], [expectedCount, expectedCost]);
        assert.equal(raw.after[0].learned.count ?? 0, learned); assert.equal(s[0].learned_points_spent, 0);
        assert.equal(raw.after[0].potential, 10000); assert.equal(raw.after[0].learned_points, 0);
    }
    reject('hetu-jing161', raw => { raw.metrics[0].jing_cost = 160; });
});

test('study无教师且原知识/书本门槛，clever和跨cap循环用独立原值锚', () => {
    const [clever] = validate('hetu-clever'); assert.equal(clever[0].gross_learned, 31);
    const [s, raw, c] = validate('xiaopu-cross-book-cap');
    assert.equal(c.parameters.actor.learned['chuixiao-jifa'], 22500);
    assert.deepEqual([s[0].completed, s[0].upgrades, s[0].gross_learned, s[0].learned_net], [3, 1, 39, -22474]);
    assert.equal(raw.after[0].skills['chuixiao-jifa'], 150); assert.equal(raw.after[0].learned['chuixiao-jifa'], 26);
    assert.equal(raw.teacher_preparations.length, 0); assert.equal(raw.teaching[0].teacher, 'none');
    assert.equal(validate('xiaopu-int23-literate110')[0][0].accepted, 0);
    assert.equal(validate('xiaopu-int23-literate120')[0][0].accepted, 1);
    assert.equal(validate('xiaopu-int24-literate1')[0][0].accepted, 1);
    reject('hetu-clever', raw => { raw.teaching[0].teacher = ids.huang; });
    reject('xiaopu-cross-book-cap', raw => { raw.teaching[0].after.learned['chuixiao-jifa'] = 0; });
});

test('原书上界含端点、下界与教师取得门槛不同', () => {
    for (const key of ['taohua', 'xiaopu', 'xuanfengtui', 'hetu', 'luoshu']) {
        assert.equal(validate(`${key}-upper${b(key).max}`)[0][0].completed, 1);
        assert.equal(validate(`${key}-upper${b(key).max + 1}`)[0][0].completed, 0);
    }
    assert.equal(validate('taohua-lower30')[0][0].completed, 1);
    assert.equal(validate('taohua-level59')[0][0].acquired, false);
    assert.equal(validate('xuanfengtui-acquire-study')[2].parameters.actor.properties.family.master_name, '曲灵风');
});

test('近上限进度只经原improve_skill准备且与计量窗口隔离', () => {
    const [steps, raw, c] = validate('xiaopu-cross-book-cap');
    assert.equal(1 + Math.trunc(56023 * 100 / 249), 22500);
    assert.equal(steps[0].gross_learned, 39, '22500 priming is not measured study growth');
    assert.deepEqual(raw.learning_preparations[0].before.learned, {});
    assert.deepEqual(raw.learning_preparations[0].after, raw.before[0]);
    for (const [key, value] of [['actor', '/tests/actor#2'], ['function', 'set_skill'], ['amount', 56024],
        ['weak_mode', 0], ['skill', 'count']]) reject('xiaopu-cross-book-cap', r => { r.learning_preparations[0][key] = value; });
    reject('xiaopu-cross-book-cap', r => { r.learning_preparations = []; });
    reject('xiaopu-cross-book-cap', r => { r.learning_preparations[0].before.learned['chuixiao-jifa'] = 22500; });
    reject('xiaopu-cross-book-cap', r => { r.learning_preparations[0].before.jing--; });
    reject('xiaopu-cross-book-cap', r => { r.learning_preparations[0].after.skills['chuixiao-jifa'] = 150; });
    reject('hetu-clever', r => { r.learning_preparations.push(copy(raw.learning_preparations[0])); });
    assert.doesNotThrow(() => validateTaohuaLearningRecord(raw, c));
});

test('NULL仅限显式不存在字段，键缺失/类型错误不能当0或成功', () => {
    for (const value of [undefined, false, '', '0', 1, [], {}])
        reject('huang-first-repeat', raw => { raw.teaching[0].before.taohua.countbook = value; });
    reject('huang-first-repeat', raw => { delete raw.teaching[0].before.taohua.countbook; });
    for (const value of [0, null]) {
        const c = get('huang-first-repeat'), raw = record(c);
        raw.teaching[0].before.taohua.countbook = value;
        assert.doesNotThrow(() => validateTaohuaLearningRecord(raw, c));
    }
    reject('xiaopu-acquire-study', raw => { delete raw.teaching[0].item_after.items[0].amount; });
    reject('xiaopu-acquire-study', raw => { raw.teaching[0].item_after.carriers.room.encumbrance = undefined; });
});

test('outer/raw归属、原教师/学生/清理身份与准备前后不可串账', () => {
    reject('literate-jing8', raw => { raw.condition_id += '-other'; });
    reject('literate-jing8', raw => { raw.teaching[0].resolved_teacher = ids.feng; });
    reject('literate-jing8', raw => { raw.teacher_preparations[0].entry_actor = '/tests/actor#2'; });
    reject('literate-jing8', raw => { raw.before[0].interactive = 0; });
    reject('literate-jing8', raw => { raw.teacher_cleanups[0].object_exists = 1; });
    reject('literate-jing8', raw => { raw.teacher_preparations[0].autonomy_after.callbacks.push('unknown'); });
    const c = get('literate-jing8'), raw = record(c);
    assert.throws(() => taohuaLearningEffects([{ condition_id: c.id, method: 'teaching', outcome: 'refused', raw }], c));
    assert.throws(() => taohuaLearningEffects([{ condition_id: 'other', method: 'teaching', outcome: raw.outcome, raw }], c));
});

test('资源毛费/回血相抵、残留攻击/事件与跨步补充都必须拒绝', () => {
    reject('literate-jing8', raw => { raw.metrics[0].jing_cost += 10; raw.metrics[0].jing_recovery = 10; });
    reject('literate-jing8', raw => { raw.metrics[1].neili_cost = 10; raw.metrics[1].neili_recovery = 10; });
    for (const side of [0, 1]) for (const key of ['hit', 'dodge', 'parry', 'heartbeats'])
        reject('literate-jing8', raw => { raw.metrics[side][key] = 1; });
    reject('literate-jing8', raw => { raw.metrics[0].jing_recovery = null; });
    reject('literate-jing8', raw => { raw.callbacks.push({}); });
    reject('count-outsider-int35', raw => { raw.teaching[1].before.jing += 1; });
    reject('luoying-shenjian-baseline', raw => { raw.after[0].weapon_details.rigidity = 1; });
});
