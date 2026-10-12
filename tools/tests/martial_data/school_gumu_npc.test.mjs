import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { schoolCombatEffects, schoolCombatMarkdown, validateSchoolCombatPlan } from './school_combat_report.mjs';
import { npcEntries } from './school_emei_npc_cases.mjs';
import { gumuTemporalConditions } from './school_gumu_temporal_cases.mjs';
import { createSandbox, validateExpectedOutcomes } from './execution.mjs';
import { gumuNpcGroup, gumuNpcCallbacks, gumuNpcSources, gumuNpcReviewed,
    gumuNpcConditions, gumuNpcEntries, validateGumuNpcPlan,
    validateGumuNpcRecord, gumuNpcEffects } from './school_gumu_npc_cases.mjs';

// Explicit later integration; the original fixed independent matrix is unchanged.
const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const readSource = path => readFileSync(join(root, path), 'utf8');
const cases = gumuNpcConditions(catalog, readSource);
const smoke = gumuNpcConditions(catalog, readSource, { smoke: true });
const choose = (id, index = -1, state = id === 'longnv' ? 'free' : 'original') => cases.find(c =>
    c.parameters.npc.id === id && c.parameters.npc.callback_index === index && c.parameters.npc.silver_state === state);
const clone = structuredClone;
const silver = '/clone/lonely/yinsuo';

// Synthetic module-contract cases, NOT driver output or successful global registration.
function npcState(p, number = 700) {
    const object = p.path + '#' + number;
    const inventory = p.original.gear.map((program, i) => ({
        object: program === silver ? silver : program + '#' + (number + 1 + i), program,
        name: program.split('/').at(-1), clone: program === silver ? 0 : 1, environment: object,
        skill_type: program === p.original.wield ? p.id === 'lin' ? 'sword' : 'whip'
            : program.endsWith('/fuchen2') ? 'whip' : null,
        equipped: program === p.original.wield ? 'wielded'
            : program.endsWith('/fuchen2') || program === '/clone/cloth/qingyi' ? null : 'worn',
        consistence: program === '/clone/cloth/qingyi' ? null : 100,
        weapon_prop: program === p.original.wield ? { damage: program === silver ? 150 : 25 } : {},
        armor_prop: {},
    }));
    return { object, program: p.path, name: p.original.name, clone: 1, userp: 0, playerp: null,
        interactive: 0, wizardp: 0, living: 1,
        properties: { ...clone(p.original.props), qi: p.original.props.max_qi, eff_qi: p.original.props.max_qi,
            jing: p.original.props.max_jing, eff_jing: p.original.props.max_jing,
            neili: p.original.props.max_neili, chat_chance_combat: 120, potential: null,
            id: { li: 'li mochou', lin: 'lin chaoying', longnv: 'xiao longnv', yang: 'yang guo' }[p.id],
            'couple/id': p.id === 'yang' ? 'xiao longnv' : null, 'static/marry': null },
        skills: clone(p.original.skills), mappings: clone(p.original.mappings),
        preparations: clone(p.original.preparations), learned: {}, inventory,
        weapon: p.original.wield ? p.id === 'lin' ? 'sword' : 'whip' : 'none',
        weapon_object: inventory.find(i => i.program === p.original.wield)?.object ?? '', secondary_weapon_object: '',
        combat_callbacks: gumuNpcCallbacks[p.id].map(([entry, arg]) => entry === 'command'
            ? '(: <code>() :)' : `(: ${entry}, "${arg}" :)`),
        combat_callback_owners: gumuNpcCallbacks[p.id].map(() => object),
        busy: null, temp: { apply: { attack: 150, defense: 150, damage: 100,
            unarmed_damage: 100, armor: 200, dodge: p.id === 'lin' ? -1 : 0 } }, effective_str: p.original.props.str,
        effective_dex: p.original.props.dex, callouts: [],
    };
}

function record(c, options = {}) {
    const p = c.parameters.npc, before = npcState(p), after = clone(before);
    const actor = { object: '/tests/left#500', userp: 1, interactive: 1, playerp: 1, wizardp: 0, living: 1,
        busy: null, conditions: null, weapon: 'none', temp: { apply: { armor: 100 } },
        effective_skills: { force: 300, dodge: 300, parry: 300 },
        ...clone(c.parameters.actor.properties), skills: clone(c.parameters.actor.skills) };
    const bystander = { ...clone(actor), object: '/tests/right#501' };
    const raw = { kind: 'sample', method: 'npc', condition_id: c.id, outcome: 'observed',
        before: [actor, bystander], after: [clone(actor), clone(bystander)], attacks: [], npc_direct: [], callbacks: [] };
    const n = raw.npc_observation = { before, after, target_object: actor.object, room: '/tests/arena',
        called: p.callback_index < 0 ? 0 : 1, callback_index: p.callback_index,
        callback_owner: p.callback_index < 0 ? '' : before.object,
        callback_repr: p.callback_index < 0 ? '' : before.combat_callbacks[p.callback_index],
        result: p.callback_index < 0 ? null : 0, steps: [], silver: null, destroyed: 1,
        execution: { target_active_after: 1 },
        preparation: { entry_player: actor.object, returned_player: actor.object, initializer_actor: 'not_observed',
            npc_heartbeat_before: 1, npc_heartbeat_paused: 0, blueprint_heartbeat: 0,
            constructor_callbacks: [], loaded_before: [], loaded_after: [], created_npcs: [before.object] },
        cleanup: { enemies_removed: 1, objects: [before.object, ...before.inventory.map(i => i.object)]
            .map(object => ({ object, destroyed: 1 })), remaining_callbacks: [] },
    };
    if (p.id === 'longnv') {
        const companion = p.silver_state === 'occupied' ? npcState({ ...p,
            original: { ...p.original, gear: [silver, '/clone/cloth/baipao'], wield: silver } }, 900) : null;
        n.silver = { object: silver, clone: 0, state: p.silver_state,
            initial_environment: companion?.object ?? '', before_environment: companion?.object ?? before.object,
            after_environment: companion?.object ?? before.object, companion_before: companion,
            companion_after: clone(companion), companion_room: companion ? '/tests/preparation' : '' };
        if (companion) {
            n.preparation.created_npcs.push(companion.object);
            n.cleanup.objects.push(...[companion.object, ...companion.inventory.map(i => i.object)]
                .map(object => ({ object, destroyed: 1 })));
        }
    }
    const event = (type = 0, damage = 500, percent = 120) => ({ actor: -1, actor_object: before.object,
        actor_program: p.path, target: 0, target_object: actor.object, type, damage, percent });
    const spend = amount => { after.properties.neili -= amount; };
    const key = p.callback?.argument;
    if (p.callback?.entry === 'command') {
        n.result = 473;
        if (options.gateRefused) after.busy = 1;
        else n.steps = ['strike.wang', 'unarmed.you'].map((argument, i) => {
            const stepBefore = clone(after);
            after.temp.notify_fail = i === 0 ? '你必须空手才能施展「\x1b[1;37m天罗地网\x1b[0m」。\n'
                : '你必须空手才能施展「\x1b[1;32m古墓幽居\x1b[0m」。\n';
            return { argument, accepted: 0, actor_object: before.object, target_object: actor.object,
                before: stepBefore, after: clone(after), reason: '' };
        });
    } else if (key === 'powerup') {
        n.result = 1; after.busy = 2; after.temp.powerup = 1;
        const level = before.skills[before.mappings.force], surge = p.id === 'yang';
        spend(surge ? 200 : 100);
        for (const key of ['attack', 'defense']) after.temp.apply[key] += Math.trunc(level * (surge ? 2 / 5 : 1 / 3));
        if (surge) after.temp.apply.unarmed_damage += Math.trunc(level / 5);
        after.callouts.push({ owner: before.object, function: 'eval_function', remaining: level });
    } else if (p.id === 'li' && key === 'strike.huan') {
        n.result = 1; spend(options.gateRefused ? 30 : 80); after.busy = options.gateRefused ? 2 : 1;
        if (!options.gateRefused) raw.after[0].busy = 9;
    } else if (p.id === 'li' && key === 'strike.shi') {
        n.result = 1; after.busy = options.gateRefused ? 2 : 1;
        if (!options.gateRefused) {
            spend(180); raw.npc_direct.push(event(2, 650, 100));
            raw.after[0].conditions = { wudu_shenzhang: { level: 200, remain: 2000,
                id: before.properties.id, name: '噬心毒' } };
            raw.after[0].eff_jing -= 9; raw.after[0].jing -= 9;
        } else raw.after[0].busy = 1;
    } else if (p.id === 'yang' && key === 'unarmed.xiao') {
        n.result = 1; after.busy = 3;
        const count = options.attacks ?? 6, result = options.attackResult ?? 0;
        spend(420 + (result === 0 ? count * 120 : 0));
        for (let i = 0; i < count; i++) raw.attacks.push({ ...event(), result,
            apply_attack: before.temp.apply.attack + (options.gateRefused ? 0 : 115) });
        if (count < 6) n.execution.target_active_after = 0;
        if (options.growth) { after.learned.unarmed = options.growth; after.properties.potential = options.growth; }
    } else if (p.id === 'yang' && key === 'unarmed.tuo') {
        n.result = 1; after.busy = 2; spend(520); raw.npc_direct.push(event(0, 1500, 120));
        after.temp.last_perform = { 'sad-strike': { tuo: 1791800000 } };
    }
    return raw;
}

function invalid(c, mutate, options) {
    const raw = record(c, options); mutate(raw);
    assert.throws(() => validateGumuNpcRecord(raw, c));
}

test('固定四原NPC、20闭包、29条件及1136/29计划，不声称已实测', () => {
    validateGumuNpcPlan(cases, catalog, readSource);
    validateGumuNpcPlan(smoke, catalog, readSource, { smoke: true });
    assert.equal(cases.length, 29); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1136);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 29);
    assert.equal(sha256(JSON.stringify(cases)), 'aba53c8f26c82d351139c96a8c2b78578e80593b6278bbe3a7fd8eed87aa447e');
    assert.equal(sha256(JSON.stringify(smoke)), 'fc3fd53e83ec17ad6d0a5be57f9e3cbfff25c8b74bb10eebf6211430181284b7');
    assert.equal(Object.values(gumuNpcCallbacks).flat().length, 20);
    assert.equal(cases.filter(c => c.parameters.npc.callback_index < 0).length, 5);
    assert.equal(cases.filter(c => c.samples === 100).length, 11);
    assert.equal(gumuNpcEntries(cases).length, 4); assert.equal(gumuNpcSources.length, 52);
    assert.equal(sha256(JSON.stringify(gumuNpcSources.map(p => [p, sha256(readSource(p))]))), gumuNpcReviewed);
    for (const c of cases) {
        assert.equal(c.parameters.collection_group, gumuNpcGroup);
        assert.equal(c.parameters.fighting, false); assert.equal(c.parameters.observe_seconds, 0);
        assert.equal(c.parameters.expected, 'observed'); assert.equal(c.status, 'configured_not_executed');
        assert.deepEqual(c.parameters.actor.skills, { force: 600, dodge: 600, parry: 600 });
        assert.equal(c.parameters.actor.properties.jiali, 0);
    }
});

test('来源缺失/变动、原构造解析错配及入口参数被改不能伪造计划', () => {
    assert.throws(() => gumuNpcConditions({ ...catalog, teachers: [] }, readSource));
    assert.throws(() => gumuNpcConditions(catalog, p => p === gumuNpcSources[0] ? readSource(p) + '\n' : readSource(p)));
    assert.throws(() => gumuNpcConditions(catalog, p => { if (p === gumuNpcSources[0]) throw Error('missing source'); return readSource(p); }), /missing source/);
    for (const mutate of [a => { a[0].id += '.'; }, a => { a[1].id = a[0].id; },
        a => { a[0].entry_id = 'kungfu/class/emei/zhou.c'; }, a => { a[0].samples = 1; },
        a => { a[0].parameters.npc.original.skills.force = 800; },
        a => { a[0].parameters.npc.source.sha256 = '0'.repeat(64); }]) {
        const altered = clone(cases); mutate(altered);
        assert.throws(() => validateGumuNpcPlan(altered, catalog, readSource));
    }
});

test('真实台账限峨嵋和四原古墓：非法ID/缺来源/越界路径仍在建档前拒绝', () => {
    function attempt(conditions, npcEntries) {
        const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-npc-contract-'));
        assert.throws(() => createSeries(directory,
            { inventory, catalog, conditions, npcEntries, execution: { test: true } }));
        assert.equal(existsSync(join(directory, 'series.json')), false);
        assert.throws(() => openSeries(directory), /ENOENT/);
    }
    const invalidId = clone(cases); invalidId[0].id += '.';
    attempt(invalidId, gumuNpcEntries(cases)); attempt(cases, []);
    const outside = clone(gumuNpcEntries(cases)); outside[0].path = '../npc.c'; outside[0].id = outside[0].path;
    attempt(cases, outside);
    const unreviewed = clone(gumuNpcEntries(cases));
    unreviewed[0].path = unreviewed[0].id = 'kungfu/class/gumu/unreviewed.c';
    attempt(cases, unreviewed);
});

test('历史32条件仅尾追加；原15677完整内容及计划数保持，后续批次不混入旧窗口', () => {
    for (const [isSmoke, oldSamples, oldHash] of [
        [false, 407956, '01970d50d313a1c696cc1604e64eb934bf1f000a523e006c97f92fca3317d36e'],
        [true, 25879, '700e12bbebb1a8c858541767787013e90155a207423dd589203d54a7f2e716f5'],
    ]) {
        const all = schoolCombatConditions(catalog, { smoke: isSmoke });
        const old = all.slice(0, 15677), added = all.slice(15677, 15709);
        assert.equal(old.length, 15677); assert.equal(sha256(JSON.stringify(old)), oldHash);
        assert.equal(old.reduce((n, c) => n + c.samples, 0), oldSamples);
        assert.ok(all.length >= 15709);
        assert.deepEqual(added, [...(isSmoke ? smoke : cases), ...gumuTemporalConditions(catalog, { smoke: isSmoke })]);
        assert.equal(added.reduce((n, c) => n + c.samples, 0), isSmoke ? 34 : 1338);
        validateExpectedOutcomes(added);
        if (!isSmoke) validateSchoolCombatPlan(added, catalog);
        const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-npc-temporal-integration-'));
        const manifest = createSeries(directory, { inventory, catalog, conditions: added,
            npcEntries: npcEntries(added), execution: { offline_contract_only: true } });
        assert.equal(openSeries(directory, manifest.identity).fingerprint, manifest.fingerprint);
        assert.deepEqual(openSeries(directory).identity.conditions, added);
    }
});

test('隔离构建冻结两组直接模块/自检和既有观察器；不启动驱动', () => {
    const snapshot = createSandbox(root);
    for (const path of ['school_gumu_npc_cases.mjs', 'school_gumu_npc.test.mjs',
        'school_gumu_temporal_cases.mjs', 'school_gumu_temporal.test.mjs',
        'runner.lpc', 'npc_observer.lpc']) {
        const full = 'tools/tests/martial_data/' + path;
        assert.equal(snapshot.files[full], sha256(readFileSync(join(root, full))));
    }
    assert.ok(snapshot.probes.length > 0);
});

test('原NPC正常及异常清理共用确切引用，二次空清理先返回已有实物证据', () => {
    const observer = readSource('tools/tests/martial_data/npc_observer.lpc');
    const runner = readSource('tools/tests/martial_data/runner.lpc');
    const cleanup = observer.slice(observer.indexOf('mapping clear_gumu()'), observer.indexOf('void observe_gumu_step'));
    const guard = 'if (!objectp(gumu_npc) && !objectp(gumu_companion) && !sizeof(gumu_owned)) return gumu_result;';
    assert.ok(cleanup.indexOf(guard) >= 0 && cleanup.indexOf(guard) < cleanup.indexOf('cleanup = (['));
    for (const key of ['gumu_npc', 'gumu_companion', 'gumu_owned']) assert.ok(cleanup.includes(key));
    assert.match(cleanup, /gumu_result\["cleanup"\] = cleanup;/);
    assert.match(cleanup, /"destroyed": !objectp\(ob\)/);
    assert.match(observer, /clear_gumu\(\);\s+return gumu_result;/);
    const finish = runner.slice(runner.indexOf('void finish_sample() {'), runner.indexOf('int record_failure('));
    assert.match(finish, /"gumu-npc"[\s\S]*?current\["npc_observation"\] = "\/tests\/npc_observer"->clear_gumu\(\);/);
    assert.ok(finish.indexOf('->clear_gumu()') < finish.indexOf('active = 0;'));
    const failure = runner.slice(runner.indexOf('failure = catch {\n        perform_sample();'));
    assert.match(failure, /if \(failure\) \{[\s\S]*?current\["outcome"\] = "error";[\s\S]*?finish_sample\(\);/);
    // Static ownership/routing proof only: real double-cleanup observations still require driver smoke.
});

test('29个合成契约全部保留真实NPC空值形状，另覆盖原随机分支而不伪称实测', () => {
    for (const c of cases) validateGumuNpcRecord(record(c), c);
    for (const c of [choose('li', 0), choose('li', 1), choose('longnv', 0), choose('longnv', 0, 'occupied')])
        validateGumuNpcRecord(record(c, { gateRefused: true }), c);
    for (const options of [{ gateRefused: true, attackResult: -1 }, { attacks: 2, attackResult: -2 }, { growth: 3 }])
        validateGumuNpcRecord(record(choose('yang', 1), options), choose('yang', 1));
    const c = choose('li'), raw = record(c);
    raw.npc_observation.before.playerp = raw.npc_observation.after.playerp = 0;
    validateGumuNpcRecord(raw, c);
});

test('四个明确缺席字段接受显式0或null，仍拒绝缺键/错类型和实际对象缺失', () => {
    const absentFields = [
        [choose('li'), raw => raw.npc_observation, 'silver'],
        [choose('li'), raw => raw.npc_observation, 'result'],
        [choose('longnv'), raw => raw.npc_observation.silver, 'companion_before'],
        [choose('longnv'), raw => raw.npc_observation.silver, 'companion_after'],
    ];
    for (const [c, container, key] of absentFields) {
        for (const value of [0, null]) {
            const raw = record(c); container(raw)[key] = value;
            const original = clone(raw); validateGumuNpcRecord(raw, c); assert.deepEqual(raw, original);
        }
        invalid(c, raw => { delete container(raw)[key]; });
        for (const value of [1, -1, false, true, '0', '', {}, [], undefined])
            invalid(c, raw => { container(raw)[key] = value; });
    }
    const raw = record(choose('li'));
    raw.npc_observation.silver = raw.npc_observation.result = 0;
    validateGumuNpcRecord(raw, choose('li'));
    for (const value of [0, null]) {
        invalid(choose('longnv'), r => { r.npc_observation.silver = value; });
        for (const key of ['companion_before', 'companion_after'])
            invalid(choose('longnv', -1, 'occupied'), r => { r.npc_observation.silver[key] = value; });
        invalid(choose('yang', 1), r => { r.npc_observation.result = value; });
        invalid(choose('longnv', 0), r => { r.npc_observation.result = value; });
    }
    for (const change of [r => { r.npc_observation.called = 1; },
        r => { r.npc_observation.callback_index = 0; },
        r => { r.npc_observation.callback_owner = r.npc_observation.before.object; },
        r => { r.npc_observation.callback_repr = r.npc_observation.before.combat_callbacks[0]; }])
        invalid(choose('li'), change);
});

test('仅林朝英和杨过的确切青衣保留原缺省耐久及穿戴失败，不补属性或衣服槽', () => {
    for (const id of ['lin', 'yang']) {
        const c = choose(id);
        const cloth = state => state.inventory.find(item => item.program === '/clone/cloth/qingyi');
        function both(raw, change) {
            for (const state of [raw.npc_observation.before, raw.npc_observation.after]) change(state, cloth(state));
        }
        for (const consistence of [0, null]) for (const equipped of [0, null]) {
            const raw = record(c);
            both(raw, (_, item) => { item.consistence = consistence; item.equipped = equipped; });
            const original = clone(raw); validateGumuNpcRecord(raw, c); assert.deepEqual(raw, original);
        }
        for (const value of [1, -1, 100, false, true, '0', '', {}, [], undefined])
            invalid(c, raw => both(raw, (_, item) => { item.consistence = value; }));
        invalid(c, raw => both(raw, (_, item) => { delete item.consistence; }));
        invalid(c, raw => both(raw, (_, item) => { delete item.equipped; }));
        invalid(c, raw => both(raw, (_, item) => { item.equipped = 'worn'; }));
        invalid(c, raw => both(raw, (state, item) => { state.temp.armor = { cloth: item.object }; }));
        invalid(c, raw => both(raw, state => { state.temp.apply.armor += 1; }));
        invalid(c, raw => both(raw, state => { state.temp.apply.dodge += 6; }));
    }
});

test('正常衣物及兵器保留原100耐久；新增真实字段缺失不能冒充已观测', () => {
    for (const c of [choose('li'), choose('lin'), choose('longnv'), choose('longnv', -1, 'occupied')]) {
        const raw = record(c);
        validateGumuNpcRecord(raw, c);
        for (const [index, item] of raw.npc_observation.before.inventory.entries()) {
            if (item.program === '/clone/cloth/qingyi') continue;
            assert.equal(item.consistence, 100);
            for (const phase of ['before', 'after']) {
                invalid(c, r => { delete r.npc_observation[phase].inventory[index].consistence; });
                for (const value of [null, 0, 99, 101, -1, '100', false, {}, []])
                    invalid(c, r => { r.npc_observation[phase].inventory[index].consistence = value; });
            }
            if (item.equipped === 'worn') {
                for (const equipped of [0, null]) invalid(c, r => {
                    for (const phase of ['before', 'after']) r.npc_observation[phase].inventory[index].equipped = equipped;
                });
            }
        }
    }
    for (const phase of ['companion_before', 'companion_after'])
        invalid(choose('longnv', -1, 'occupied'), raw => {
            delete raw.npc_observation.silver[phase].inventory[0].consistence;
        });
    const observer = readSource('tools/tests/martial_data/npc_observer.lpc');
    const start = observer.indexOf('mapping gumu_state(object ob)');
    assert.doesNotMatch(observer.slice(0, start), /consistence/);
    const state = observer.slice(start, observer.indexOf('mapping clear_gumu()'));
    assert.match(state, /"consistence": item->query\("consistence"\)/);
    assert.doesNotMatch(observer, /->(?:set|add)\("consistence"/);
});

test('不能把实验USER、另一原克隆或缺失身份字段当被测NPC', () => {
    const c = choose('lin');
    for (const mutate of [r => { delete r.npc_observation.before.playerp; },
        r => { r.npc_observation.before.playerp = 1; }, r => { r.npc_observation.before.userp = 1; },
        r => { r.npc_observation.before.clone = 0; }, r => { r.npc_observation.before.interactive = 1; },
        r => { r.npc_observation.after.object = c.parameters.npc.path + '#999'; },
        r => { r.before[0].wizardp = 1; }, r => { r.before[0].skills.parry = 800; },
        r => { r.before[0].effective_skills.parry = 600; },
        r => { r.npc_observation.target_object = r.before[1].object; },
        r => { r.after[1].qi -= 1; }]) invalid(c, mutate);
});

test('闭包原索引/owner/repr分别核验，匿名表达式不是可读取源码', () => {
    const c = choose('longnv', 0);
    for (const mutate of [r => { r.npc_observation.callback_index = 1; },
        r => { r.npc_observation.callback_owner = '/tests/left#500'; },
        r => { r.npc_observation.before.combat_callback_owners[0] = '/tests/left#500'; },
        r => { r.npc_observation.callback_repr = '(: command, "perform strike.wang and unarmed.you" :)'; },
        r => { r.npc_observation.before.combat_callbacks[0] = '(: command("perform strike.wang and unarmed.you") :)'; }]) invalid(c, mutate);
    invalid(choose('lin', 1), r => { r.npc_observation.before.combat_callbacks[1] = '(: perform_action, "whip.feng" :)'; });
});

test('两龙女状态保留唯一银索、原回退和独立占有者，禁止接管外部物品', () => {
    const free = choose('longnv'), occupied = choose('longnv', -1, 'occupied');
    for (const mutate of [r => { r.npc_observation.silver.clone = 1; },
        r => { r.npc_observation.silver.initial_environment = '/tests/external#99'; },
        r => { r.npc_observation.before.inventory[0].weapon_prop.damage = 25; }]) invalid(free, mutate);
    for (const mutate of [r => { r.npc_observation.silver.companion_after.inventory = []; },
        r => { r.npc_observation.silver.companion_room = r.npc_observation.room; },
        r => { r.npc_observation.silver.after_environment = r.npc_observation.before.object; },
        r => { r.npc_observation.silver.initial_environment = '/tests/external#99'; },
        r => { r.npc_observation.before.inventory[0].program = silver; }]) invalid(occupied, mutate);
});

test('原冷载/心跳与清理必须可归属，不得清掉未知回调后假报正常', () => {
    const c = choose('longnv', -1, 'occupied');
    for (const mutate of [r => { r.npc_observation.preparation.initializer_actor = '/tests/left#500'; },
        r => { r.npc_observation.preparation.constructor_callbacks.push({ owner: '/tests/unknown' }); },
        r => { r.npc_observation.preparation.npc_heartbeat_paused = 1; },
        r => { r.npc_observation.preparation.loaded_before = ['/kungfu/skill/meinv-quan']; },
        r => { r.npc_observation.preparation.created_npcs.pop(); },
        r => { r.npc_observation.cleanup.objects.pop(); },
        r => { r.npc_observation.cleanup.remaining_callbacks.push({ owner: r.npc_observation.before.object }); },
        r => { r.npc_observation.destroyed = 0; }]) invalid(c, mutate);
});

test('command成功返回评估成本；互搏门失败和两子招拒绝分母不混合', () => {
    const c = choose('longnv', 0), raw = record(c);
    assert.equal(raw.npc_observation.result, 473); validateGumuNpcRecord(raw, c);
    for (const mutate of [r => { r.npc_observation.result = true; }, r => { r.npc_observation.result = 0; },
        r => { r.npc_observation.steps[0].accepted = 1; }, r => { r.npc_observation.steps.pop(); },
        r => { r.npc_observation.steps[0].actor_object = r.before[0].object; },
        r => { r.npc_observation.steps[1].argument = 'strike.wang'; },
        r => { r.npc_observation.steps = []; }, r => { r.npc_observation.after.properties.neili -= 1; }]) invalid(c, mutate);
});

test('两原子招依次写入实际notify_fail，校验不删改原快照或颜色/换行', () => {
    for (const state of ['free', 'occupied']) {
        const c = choose('longnv', 0, state), raw = record(c), preserved = clone(raw);
        const n = raw.npc_observation, [wang, you] = n.steps;
        assert.equal(Object.hasOwn(wang.before.temp, 'notify_fail'), false);
        assert.equal(wang.after.temp.notify_fail, '你必须空手才能施展「\x1b[1;37m天罗地网\x1b[0m」。\n');
        assert.equal(you.before.temp.notify_fail, wang.after.temp.notify_fail);
        assert.equal(you.after.temp.notify_fail, '你必须空手才能施展「\x1b[1;32m古墓幽居\x1b[0m」。\n');
        assert.equal(n.after.temp.notify_fail, you.after.temp.notify_fail);
        for (const step of n.steps) assert.equal(step.reason, '');
        validateGumuNpcRecord(raw, c);
        assert.deepEqual(raw, preserved, '校验不得删除或重写原证据');
    }
});

test('非交互NPC驱动reason须显式空串，不能补零/缺键或伪造ESC拒绝文本', () => {
    for (const state of ['free', 'occupied']) {
        const c = choose('longnv', 0, state);
        for (const index of [0, 1]) {
            invalid(c, r => { delete r.npc_observation.steps[index].reason; });
            for (const value of [undefined, null, 0, 1, false, true, '0', ' ', {}, [],
                '\x1b[256D\x1b[K', '你必须空手才能施展此招。\n'])
                invalid(c, r => { r.npc_observation.steps[index].reason = value; });
            invalid(c, r => { const s = r.npc_observation.steps[index]; s.reason = s.after.temp.notify_fail; });
            invalid(c, r => { const s = r.npc_observation.steps[index]; s.reason = '\x1b[256D\x1b[K' + s.after.temp.notify_fail; });
        }
    }
});

test('只排除notify_fail，原提示缺失/错配及其它状态变化仍拒绝', () => {
    for (const state of ['free', 'occupied']) {
        const c = choose('longnv', 0, state);
        for (const mutate of [
            r => { delete r.npc_observation.steps[0].after.temp.notify_fail; },
            r => { r.npc_observation.steps[0].after.temp.notify_fail = ''; },
            r => { r.npc_observation.steps[0].after.temp.notify_fail = null; },
            r => { r.npc_observation.steps[0].after.temp.notify_fail = 0; },
            r => { r.npc_observation.steps[0].after.temp.notify_fail = '这招需要空手。\n'; },
            r => { const s = r.npc_observation.steps[0]; s.after.temp.notify_fail = s.after.temp.notify_fail.replaceAll('\x1b[1;37m', ''); },
            r => { const s = r.npc_observation.steps[0]; s.after.temp.notify_fail = s.after.temp.notify_fail.trimEnd(); },
            r => { delete r.npc_observation.steps[1].before.temp.notify_fail; },
            r => { r.npc_observation.steps[1].before.temp.notify_fail = '被其他提示覆盖'; },
            r => { delete r.npc_observation.after.temp.notify_fail; },
            r => { r.npc_observation.after.temp.notify_fail = r.npc_observation.steps[0].after.temp.notify_fail; },
            r => { r.npc_observation.steps[0].after.temp.unrelated = 1; },
            r => { delete r.npc_observation.steps[0].after.temp.apply; },
            r => { r.npc_observation.steps[0].after.temp.apply.attack++; },
            r => { r.npc_observation.steps[0].after.properties.neili--; },
            r => { r.npc_observation.steps[0].after.properties.qi--; },
            r => { r.npc_observation.steps[0].after.inventory[0].weapon_prop.damage++; },
            r => { r.npc_observation.steps[0].after.weapon_object = '/clone/weapon/changbian#999'; },
            r => { r.npc_observation.steps[0].after.object = c.parameters.npc.path + '#999'; },
            r => { r.npc_observation.steps[0].after.program = '/kungfu/class/gumu/lin'; },
            r => { r.npc_observation.steps[0].after.busy = 1; },
        ]) invalid(c, mutate);
    }
});

test('原强化费用/加成/定时归属准确，实际延迟只记剩余值而非自然撤销', () => {
    for (const c of cases.filter(c => c.parameters.npc.callback?.argument === 'powerup')) {
        validateGumuNpcRecord(record(c), c);
        for (const mutate of [r => { r.npc_observation.after.properties.neili -= 1; },
            r => { r.npc_observation.after.temp.apply.attack -= 1; },
            r => { r.npc_observation.after.callouts[0].owner = '/tests/left#500'; },
            r => { r.npc_observation.after.callouts[0].function = 'unknown'; },
            r => { r.npc_observation.after.callouts = []; }]) invalid(c, mutate);
    }
});

test('李莫愁忙乱/直接伤害与原加力分别算，事件actor=-1仍必须确切引用', () => {
    const huan = choose('li', 0), shi = choose('li', 1);
    invalid(huan, r => { r.npc_observation.after.busy = 2; });
    invalid(shi, r => { r.npc_observation.after.properties.neili += 150; });
    for (const mutate of [r => { r.npc_direct[0].actor = 0; },
        r => { r.npc_direct[0].actor_object = '/kungfu/class/gumu/li#701'; },
        r => { r.npc_direct[0].actor_program = '/kungfu/class/gumu/yang'; },
        r => { r.npc_direct[0].target_object = r.before[1].object; },
        r => { r.npc_direct[0].type = 0; }, r => { r.npc_direct[0].percent = 120; }]) invalid(shi, mutate);
});

test('原控制与噬心毒保留真实靶状态，不能只看NPC扣费就接受', () => {
    const huan = choose('li', 0), shi = choose('li', 1);
    invalid(huan, r => { r.after[0].busy = 0; });
    for (const mutate of [r => { delete r.before[0].conditions; }, r => { delete r.after[0].conditions; },
        r => { r.after[0].conditions.wudu_shenzhang.id = 'unrelated'; },
        r => { r.after[0].conditions.wudu_shenzhang.level = 330; },
        r => { r.after[0].conditions.wudu_shenzhang.remain = 2001; },
        r => { r.after[0].conditions.wudu_shenzhang.remain = 3400; },
        r => { r.after[0].eff_jing = r.before[0].eff_jing; },
        r => { r.after[0].jing = r.before[0].jing; }, r => { r.after[0].neili -= 1; }]) invalid(shi, mutate);
    const raw = record(shi);
    const stats = gumuNpcEffects([{ condition_id: shi.id, outcome: 'observed', raw }], shi);
    assert.equal(stats.target_net_resource_loss.eff_jing.mean, 9);
    assert.equal(stats.target_net_resource_loss.jing.mean, 9);
    assert.equal(stats.direct_damage_input.mean, 650);
    assert.equal(stats.target_poison_observations[0].wudu_shenzhang.remain, 2000);
});

test('杨过计划6击与实际攻击/加力/增攻回收/原熟练度增长分开', () => {
    const c = choose('yang', 1);
    for (const mutate of [r => { r.npc_observation.after.properties.neili += 120; },
        r => { r.attacks[0].actor_object = '/tests/left#500'; },
        r => { delete r.attacks[0].apply_attack; }, r => { r.attacks[0].apply_attack += 1; },
        r => { r.npc_observation.after.temp.apply.attack += 115; },
        r => { r.npc_observation.after.learned = { 'sad-strike': 1 }; },
        r => { r.npc_observation.after.learned = { unarmed: 7 }; },
        r => { r.npc_observation.after.properties.potential = 7; }]) invalid(c, mutate);
    invalid(c, r => { r.npc_observation.execution.target_active_after = 1; }, { attacks: 2 });
    const partial = record(c, { attacks: 2, attackResult: -1 }); validateGumuNpcRecord(partial, c);
    assert.equal(partial.npc_observation.before.properties.neili - partial.npc_observation.after.properties.neili, 420);
});

test('固定防御面下拖泥必入成功分支，不能伪造200费失败或省略加力', () => {
    const c = choose('yang', 2);
    for (const mutate of [r => { r.npc_observation.after.properties.neili += 120; },
        r => { r.npc_direct = []; }, r => { delete r.npc_observation.after.temp.last_perform; },
        r => { r.npc_observation.before.properties['couple/id'] = null; }]) invalid(c, mutate);
});

test('拒绝原闭包不能被改成成功；完整观察与MA-113复现不是同义', () => {
    for (const c of [choose('li', 2), choose('lin', 0), choose('lin', 3), choose('longnv', 3), choose('yang', 0)]) {
        invalid(c, r => { r.npc_observation.result = 1; });
        invalid(c, r => { r.after[0].qi -= 1; });
        invalid(c, r => { r.npc_observation.after.properties.neili -= 1; });
    }
    assert.throws(() => validateGumuNpcRecord({ kind: 'sample', method: 'npc', condition_id: choose('li').id,
        outcome: 'refused' }, choose('li')));
});

test('效果只从冻结condition取参，成本/子招/计划与实际分母分列', () => {
    const c = choose('longnv', 0), raws = [record(c), record(c, { gateRefused: true })];
    assert.ok(raws.every(r => !Object.hasOwn(r, 'parameters')));
    const rows = raws.map((raw, index) => ({ condition_id: c.id, index, outcome: raw.outcome, raw }));
    const effects = gumuNpcEffects(rows, c);
    assert.equal(effects.observed, 2); assert.equal(effects.command_evaluation_cost.mean, 473);
    assert.equal(effects.npc_method_returned_one, 0); assert.equal(effects.command_steps, 2);
    assert.equal(effects.command_steps_accepted, 0); assert.equal(effects.npc_net_neili_spent.mean, 0);
    assert.equal(effects.npc_gross_resource_accounting, 'not_observed');
    assert.equal(effects.natural_heartbeats, 'not_sampled');
    const x = choose('yang', 1), raw = record(x, { attacks: 2, attackResult: -1 });
    const partial = gumuNpcEffects([{ condition_id: x.id, outcome: 'observed', raw }], x);
    assert.equal(partial.planned_xiao_attacks, 6); assert.equal(partial.attacks, 2);
    assert.throws(() => gumuNpcEffects(rows, choose('li')));
    const errored = { kind: 'sample', method: 'npc', condition_id: c.id, outcome: 'error', reason: 'synthetic failure' };
    const summary = gumuNpcEffects([...rows, { condition_id: c.id, outcome: 'error', raw: errored }], c);
    assert.equal(summary.samples, 3); assert.equal(summary.observed, 2);
    assert.equal(summary.command_evaluation_cost.n, 2);
});

test('Markdown 独列原 NPC 净资源与闭包分母，不使用防御靶或旁观者通表', () => {
    const selected = [choose('yang', 1), choose('li', 1), choose('longnv', 0)];
    const conditions = selected.map(c => {
        const raw = record(c, c.parameters.npc.id === 'yang' ? { attacks: 2, attackResult: -1 } : {});
        return { id: c.id, effects: schoolCombatEffects([]),
            gumu_npc: gumuNpcEffects([{ condition_id: c.id, outcome: 'observed', raw }], c) };
    });
    // No generic sides: rendering must use the NPC-specific source and counters.
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-not-a-series', evidence_sha256: 'synthetic',
        totals: { conditions: 3, samples: 3, observed: 3, refused: 0, errors: 0 }, conditions });
    const start = markdown.indexOf('## 古墓原 NPC：配装与逐条闭包');
    assert.ok(start > 0); assert.ok(!markdown.slice(0, start).includes('school-gumu-npc-'));
    for (const c of conditions) assert.equal(markdown.split(`| ${c.id} |`).length - 1, 1);
    assert.ok(markdown.includes(`| ${selected[0].id} | 1/1 | 0/1 | 未知 | 0/0 | 2/0 | 420.00 | 0.00/0.00 | 未知 |`));
    assert.ok(markdown.includes(`| ${selected[1].id} | 1/1 | 0/1 | 未知 | 0/0 | 0/1 | 180.00 | 0.00/0.00 | 650.00 |`));
    assert.ok(markdown.includes(`| ${selected[2].id} | 1/1 | 0/0 | 473.00 | 0/2 | 0/0 | 0.00 | 0.00/0.00 | 未知 |`));
    assert.match(markdown, /资源为前后净差，不冒充单向耗费/);
    assert.match(markdown, /本组不采自然心跳交锋或强化自然解除/);
});
