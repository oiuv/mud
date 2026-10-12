import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { createSandbox, validateQualificationSources, validateRecord } from './execution.mjs';
import { taohuaPassiveConditions, taohuaPassiveSourcePaths, validateTaohuaPassiveRecord,
    taohuaPassiveEffects } from './school_taohua_passive_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const conditions = taohuaPassiveConditions(catalog, read);
const copy = structuredClone;
const skill = 'yuxiao-jian';
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const guarded = new Set(['level159', 'neili499', 'incoming119-con19', 'incoming581-con96', 'unmapped']);
const triggerText = '\x1b[1;37m$N\x1b[1;37m手中演武兵器\x1b[1;37m发出阵阵箫音，让$n\x1b[1;37m感到难受至极。\n\x1b[0m';
let frozen;
const snapshot = () => frozen ??= createSandbox(root);
const pick = (variant = 'baseline', level = 200) => {
    const condition = conditions.find(c => c.parameters.variant === variant && c.parameters.level === level);
    assert.ok(condition, variant + ':' + level);
    return condition;
};

// Independent consumer fixtures only; these do not call the game or sample RNG.
// The original ordinary sword has no extra valid_as_xiao property in its snapshot.
function actorSnapshot(config, side) {
    const equipped = !!config.equipment;
    const apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    const properties = Object.entries(config.properties);
    return { ...Object.fromEntries(properties.filter(([key]) => !key.includes('/') && key !== 'character')),
        cultivation: Object.fromEntries(properties.filter(([key]) => key.includes('/') || key === 'character')),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: 0, busy: null, conditions: null,
        skills: copy(config.skills), mappings: copy(config.mappings), preparations: copy(config.preparations),
        learned: {}, temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_con: config.properties.con + Math.trunc(config.skills.force / 10),
        effective_str: config.properties.str,
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0,
        weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { object: '/tests/sword#200', program: '/tests/sword',
            skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100,
            material: null, rigidity: null, no_wield: null } : {},
        secondary_weapon: 'none', secondary_weapon_details: {},
        handing: 'none', handing_details: {}, ammunition: 0 };
}

function sync(raw) {
    raw.after = copy(raw.immediate);
    Object.assign(raw.passives[0], { before: copy(raw.before), after: copy(raw.immediate),
        neili_after: raw.immediate[0].neili, target_eff_qi_after: raw.immediate[1].eff_qi,
        target_busy_after: raw.immediate[1].busy });
    raw.interfaces[0].result = raw.passives[0].result;
    raw.metrics = [0, 1].map(side => Object.fromEntries(resources.flatMap(key => {
        const loss = raw.before[side][key] - raw.immediate[side][key];
        return loss ? [[key + '_cost', loss]] : [];
    })));
    return raw;
}

function record(condition, { triggered = false, result = null, wound, cost = 23 } = {}) {
    const p = condition.parameters;
    const before = [actorSnapshot(p.actor, 0), actorSnapshot(p.target, 1)];
    const raw = { kind: 'sample', condition_id: condition.id, index: 0, method: 'interface',
        outcome: 'observed', reason: '', command_accepted: cost, elapsed: 0.001,
        before, immediate: copy(before), after: [], metrics: [{}, {}],
        passives: [{ actor: 0, target: 1, skill, incoming: p.interface.damage,
            factor: 0, route: 'interface', result: triggered ? triggerText : result }],
        interfaces: [{ object: '/kungfu/skill/yuxiao-jian', function: 'hit_ob', result: null }],
        actions: [], attacks: [], defenses: [], dodge_checks: [], launches: [], refusals: [],
        callbacks: [], terminals: [], dropped: [], skill_loads: [] };
    if (triggered) {
        wound ??= Math.trunc(p.interface.damage * 2 / 3);
        raw.immediate[0].neili -= 60;
        raw.immediate[1].eff_jing = Math.max(-1, before[1].eff_jing - wound);
        raw.immediate[1].jing = Math.min(before[1].jing, raw.immediate[1].eff_jing);
    }
    return sync(raw);
}

function consume(raw, condition) {
    const bytes = JSON.stringify(raw);
    validateRecord(raw, condition);
    const result = validateSchoolCombatRecord(raw, condition);
    assert.deepEqual(result, validateTaohuaPassiveRecord(raw, condition));
    assert.equal(JSON.stringify(raw), bytes, '三层消费者不得归一化或回写原件');
    return result;
}

function rejects(condition, mutate, options) {
    const raw = record(condition, options);
    mutate(raw);
    assert.throws(() => consume(raw, condition));
}

const row = raw => ({ condition_id: raw.condition_id, index: raw.index, outcome: raw.outcome, raw });
const body = (source, name) => {
    const match = new RegExp('(?:private\\s+)?(?:int|void|mapping)\\s+' + name
        + '\\([^;]*?\\)\\s*\\{').exec(source);
    assert.ok(match, 'actual definition: ' + name);
    const end = source.indexOf('\n}\n', match.index);
    assert.ok(end > match.index, 'complete function: ' + name);
    return source.slice(match.index, end + 3);
};

test('PASSIVE只尾增16条件，保护冻结15952完整正式/烟雾顺序和有限计划', () => {
    // Independently regenerated ONLY from preserved tbihai-toolsource-v1 and tbihai-f1:
    // 165 archived MJS modules, the archived grammar and 109 hash-checked public inputs.
    const old = { formal: 'd653515eed62f924f57fd7a6182f7d9e1d20ee361315e9aee3ef297bf8490866',
        smoke: 'e06b4aea90eb978e7dcade56efb146a2c493e8ccf4021dc818bbe7b4d010d3ee' };
    const tail = { formal: '1c34e98de633e6777e87df2a565ca6088ca0dbc0591e20a471051e490b289f0a',
        smoke: 'ca8207fd1539745c1e34f39f78854bd668211486bfcd3aa457fcb0afc4f2eb0b' };
    for (const smoke of [false, true]) {
        const key = smoke ? 'smoke' : 'formal';
        const all = schoolCombatConditions(catalog, { smoke })
            .filter(c => c.parameters.collection_group !== 'taohua-combination');
        const own = taohuaPassiveConditions(catalog, read, { smoke });
        assert.equal(all.length, 15968);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(sha256(JSON.stringify(all.slice(0, 15952))), old[key]);
        assert.deepEqual(all.slice(15952), own);
        assert.equal(own.length, 16);
        assert.equal(sha256(JSON.stringify(own)), tail[key]);
        assert.equal(own.reduce((n, c) => n + c.samples, 0), smoke ? 16 : 1110);
        assert.equal(all.reduce((n, c) => n + c.samples, 0), smoke ? 26314 : 420774);
        assert.equal(own.filter(c => guarded.has(c.parameters.variant)).length, 5);
        for (const c of own) {
            assert.equal(c.method, 'interface');
            assert.equal(c.parameters.action, 'test_interface');
            assert.equal(c.parameters.expected, 'observed');
            assert.equal(c.parameters.fighting, false);
            assert.equal(c.parameters.observe_seconds, 0);
            assert.deepEqual(c.parameters.capture_skill_loads, []);
            assert.deepEqual(c.parameters.actor.equipment, { type: 'sword', hold: false });
        }
    }
});

test('PASSIVE真实输入冻结四新增工具与22来源，原15文件48锚点不增加', () => {
    const actual = snapshot();
    for (const name of ['school_taohua_passive_cases.mjs', 'school_taohua_passive.test.mjs',
        'school_taohua_passive_report.test.mjs', 'school_taohua_passive_integration.test.mjs',
        'execution.mjs', 'runner.lpc', 'school_combat_cases.mjs', 'school_combat_report.mjs', 'statistics.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(actual.files[path], sha256(read(path)), path);
    }
    assert.equal(taohuaPassiveSourcePaths.length, 22);
    for (const c of conditions) {
        assert.deepEqual(Object.keys(c.parameters.source_evidence), taohuaPassiveSourcePaths);
        assert.deepEqual(c.parameters.qualification_sources, taohuaPassiveSourcePaths);
        for (const path of taohuaPassiveSourcePaths)
            assert.equal(c.parameters.source_evidence[path], actual.files[path], path);
    }
    validateQualificationSources(conditions, actual.files);
    assert.equal(actual.probes.length, 15);
    assert.equal(actual.probes.reduce((n, probe) => n + probe.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(actual.probes)),
        'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
});

test('PASSIVE来源消费者拒绝22项漂移、缺项、接口/方法/技能及入口错绑', () => {
    const actual = snapshot();
    const bad = operation => {
        const c = copy(pick()), files = { ...actual.files };
        operation(c, files);
        assert.throws(() => validateQualificationSources([c], files));
    };
    for (const path of taohuaPassiveSourcePaths) {
        bad(c => { delete c.parameters.source_evidence[path]; });
        bad(c => { c.parameters.source_evidence[path] = 'f'.repeat(64); });
        bad((c, files) => { delete files[path]; });
        bad((c, files) => { files[path] = '0'.repeat(64); });
    }
    for (const value of [null, undefined, 0, 'sources', []])
        bad(c => { c.parameters.source_evidence = value; });
    bad(c => { c.parameters.source_evidence['kungfu/skill/unknown.c'] = '0'.repeat(64); });
    bad(c => { c.parameters.source_evidence = Object.fromEntries(Object.entries(c.parameters.source_evidence).reverse()); });
    bad(c => { delete c.parameters.qualification_sources; });
    bad(c => { c.parameters.qualification_sources.reverse(); });
    for (const [key, value] of [['skill', 'tanzhi-shentong'], ['ability', 'perform'],
        ['usage', 'finger'], ['action', 'perform sword.bihai right']]) bad(c => { c.parameters[key] = value; });
    bad(c => { c.method = 'perform'; });
    bad(c => { c.entry_id = 'kungfu/skill/yuxiao-jian.c:205:query_action'; });
    bad(c => { c.entry_id = 'kungfu/skill/taiji-jian.c:205:hit_ob'; });
    bad(c => { c.entry_id = 'kungfu/skill/yuxiao-jian.c:bad:hit_ob'; });
    for (const [key, value] of [['object', '/kungfu/skill/taiji-jian'], ['function', 'query_action'],
        ['factor', 1], ['damage', -1], ['damage', null], ['damage', 1.5], ['damage', '600']])
        bad(c => { c.parameters.interface[key] = value; });
    bad(c => { delete c.parameters.interface.damage; });
});

test('16原条件以双USER和真实普通剑三层消费，原0/null返回均已观察而非拒绝', () => {
    for (const c of conditions) {
        for (const result of [0, null]) {
            const raw = record(c, { result });
            assert.equal(Object.hasOwn(raw, 'parameters'), false);
            const observed = consume(raw, c);
            assert.equal(observed.eligible, !guarded.has(c.parameters.variant));
            assert.equal(observed.triggered, false);
            assert.equal(raw.outcome, 'observed');
            assert.equal(raw.interfaces[0].result, result);
        }
        if (!guarded.has(c.parameters.variant)) assert.equal(consume(record(c, { triggered: true }), c).triggered, true);
        else rejects(c, () => {}, { triggered: true });
    }
    const c = pick();
    const badState = (side, operation) => rejects(c, raw => {
        operation(raw.before[side]); operation(raw.immediate[side]); sync(raw);
    });
    for (const side of [0, 1]) {
        for (const [key, value] of [['userp', 0], ['playerp', 0], ['interactive', 0],
            ['wizardp', 1], ['living', 0], ['ghost', 1], ['fighting_opponent', 1]])
            badState(side, state => { state[key] = value; });
        badState(side, state => { state.secondary_weapon = 'sword'; state.secondary_weapon_details = { object: '/tests/sword#999' }; });
        badState(side, state => { state.handing = 'sword'; state.handing_details = { object: '/tests/sword#999' }; });
    }
    badState(1, state => { state.object = '/tests/actor#100'; });
    for (const [key, value] of [['program', '/tests/xsword'], ['skill_type', 'xsword'], ['weight', 2999],
        ['damage', 45], ['flag', 0], ['consistence', 99], ['material', 'steel'], ['rigidity', 0], ['no_wield', 0]])
        badState(0, state => { state.weapon_details[key] = value; });
    badState(0, state => { state.weapon_details.valid_as_xiao = 1; });
    for (const key of ['material', 'rigidity', 'no_wield']) badState(0, state => { delete state.weapon_details[key]; });
    for (const [key, value] of [['actor', 1], ['target', 0], ['skill', 'tanzhi-shentong'],
        ['incoming', 599], ['factor', 1], ['route', 'ordinary']]) rejects(c, raw => { raw.passives[0][key] = value; });
    rejects(c, raw => { raw.passives.push(copy(raw.passives[0])); });
    rejects(c, raw => { raw.interfaces.push(copy(raw.interfaces[0])); });
});

test('PASSIVE60内力与两种实际精神夹制分账，未观察不能补零或倒推请求', () => {
    const c = pick();
    for (const wound of [400, 449]) {
        const raw = record(c, { triggered: true, wound });
        const value = consume(raw, c);
        assert.deepEqual([value.neili_cost, value.eff_jing_loss, value.jing_loss, value.clipped], [60, wound, wound, false]);
    }
    for (const wound of [399, 450]) rejects(c, () => {}, { triggered: true, wound });
    const below = pick('jing-below-eff'), belowRaw = record(below, { triggered: true, wound: 449 });
    assert.deepEqual([consume(belowRaw, below).eff_jing_loss, belowRaw.immediate[1].jing,
        consume(belowRaw, below).jing_loss], [449, 2000, 0]);
    const clipped = pick('eff-jing-clipped'), clippedRaw = record(clipped, { triggered: true, wound: 449 });
    const actual = consume(clippedRaw, clipped);
    assert.deepEqual([clippedRaw.immediate[1].eff_jing, clippedRaw.immediate[1].jing,
        actual.eff_jing_loss, actual.jing_loss, actual.neili_cost, actual.clipped], [-1, -1, 201, 101, 60, true]);
    assert.equal(clippedRaw.immediate[1].living, 1);
    assert.deepEqual(clippedRaw.terminals, []);
    rejects(clipped, raw => { raw.metrics[1].jing_cost = 449; }, { triggered: true, wound: 449 });
    rejects(clipped, raw => { raw.immediate[1].living = 0; sync(raw); }, { triggered: true, wound: 449 });
    rejects(c, raw => { raw.metrics[0].neili_cost++; raw.metrics[0].neili_recovery = 1; }, { triggered: true });
    rejects(c, raw => { raw.metrics[1].eff_jing_cost++; raw.metrics[1].eff_jing_recovery = 1; }, { triggered: true });
    const known = [row(record(c, { triggered: true, wound: 400 })), row(record(c, { result: 0 }))];
    const unknown = ['error', 'not_applicable'].map(outcome => ({ condition_id: c.id, outcome,
        raw: { condition_id: c.id, outcome } }));
    const effects = taohuaPassiveEffects([...known, ...unknown], c);
    assert.deepEqual([effects.records, effects.interface_calls, effects.unknown_or_unobserved,
        effects.no_effect_returns, effects.eligible_calls], [4, 2, 2, 1, 2]);
    assert.deepEqual([effects.trigger_per_call.successes, effects.trigger_per_call.trials,
        effects.trigger_when_eligible.trials, effects.actor_neili_cost.n, effects.actor_neili_cost.mean], [1, 2, 2, 2, 30]);
    for (const key of ['craze', 'last_damage_attribution', 'later_unconsciousness_or_death', 'ordinary_hit_rate'])
        assert.equal(effects[key], 'not_observed');
    assert.deepEqual(effects.requested_wound, { observation: 'not_observed', source_support_if_triggered: { min: 400, max: 449 } });
    const onlyUnknown = taohuaPassiveEffects(unknown, c);
    assert.equal(onlyUnknown.actor_neili_cost.mean, null);
    assert.equal(onlyUnknown.trigger_per_call.rate, null);
    assert.throws(() => taohuaPassiveEffects([{ ...known[0], condition_id: 'wrong' }], c));
    assert.throws(() => taohuaPassiveEffects([{ ...known[0], outcome: 'refused' }], c));
    assert.throws(() => taohuaPassiveEffects([{ ...known[0], raw: { ...known[0].raw, condition_id: 'wrong' } }], c));
});

test('接口命令保留1/23/476成本，未知字段和任何额外攻击/忙乱/心跳均拒绝', () => {
    const c = pick();
    const results = [1, 23, 476].map(cost => {
        const raw = record(c, { cost, triggered: true, wound: 400 });
        consume(raw, c);
        assert.equal(raw.command_accepted, cost);
        return taohuaPassiveEffects([row(raw)], c);
    });
    assert.deepEqual(results[0], results[1]); assert.deepEqual(results[1], results[2]);
    for (const cost of [0, null, undefined, -1, 1.5, '23', true, {}, [], Number.MAX_SAFE_INTEGER + 1])
        rejects(c, raw => { raw.command_accepted = cost; });
    rejects(c, raw => { delete raw.command_accepted; });
    for (const result of [undefined, false, true, 1, '', 'message', {}, []]) rejects(c, raw => {
        raw.passives[0].result = result; raw.interfaces[0].result = result;
    });
    for (const target of ['passives', 'interfaces']) rejects(c, raw => { delete raw[target][0].result; });
    for (const key of ['actions', 'attacks', 'defenses', 'dodge_checks', 'launches', 'refusals',
        'callbacks', 'terminals', 'dropped', 'skill_loads', 'directs', 'attack_rounds'])
        rejects(c, raw => { raw[key] = [{}]; });
    for (const side of [0, 1]) {
        for (const key of ['hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats', 'ability_launched'])
            for (const value of [1, null, -1]) rejects(c, raw => { raw.metrics[side][key] = value; });
        rejects(c, raw => { raw.metrics[side] = null; });
        rejects(c, raw => { raw.immediate[side].busy = 1; sync(raw); });
        rejects(c, raw => { raw.immediate[side].learned[skill] = 1; sync(raw); });
    }
    rejects(c, raw => { raw.condition_id += '-wrong'; });
    rejects(c, raw => { raw.method = 'perform'; });
    rejects(c, raw => { raw.outcome = 'refused'; });
});

test('实际runner六处窄接复用原hit_ob和双快照，不增攻击/RNG/冷加载/H', () => {
    const source = read('tools/tests/martial_data/runner.lpc');
    const state = body(source, 'snapshot'), begin = body(source, 'begin_passive');
    const observe = body(source, 'observe_passive'), action = body(source, 'do_interface');
    const advance = body(source, 'advance'), perform = body(source, 'perform_sample');
    const flat = value => value.replace(/\s+/g, ' ');
    assert.equal((source.match(/"taohua-passive"/g) ?? []).length, 6);
    assert.match(state, /"taohua-passive"[\s\S]*?result\["fighting_opponent"\] = objectp\(opponent\) && !!ob->is_fighting\(opponent\)/);
    assert.match(flat(state), /\(\{ "taohua-attack", "taohua-passive", "taohua-combination" \}\)\) != -1\) \{ result\["cultivation"\]\["character"\] = ob->query\("character"\); secondary = ob->query_temp\("secondary_weapon"\);/);
    assert.match(state, /result\["secondary_weapon_details"\] = equipment_snapshot\(secondary\)/);
    assert.match(begin, /"taohua-passive"[\s\S]*?passive_before\[route\] = \(\{ snapshot\(me\), snapshot\(target\) \}\)/);
    assert.match(observe, /"taohua-passive"[\s\S]*?current\["passives"\]\[<1\]\["before"\] = passive_before\[route\]/);
    assert.match(observe, /current\["passives"\]\[<1\]\["after"\] = \(\{ snapshot\(me\), snapshot\(target\) \}\)/);
    assert.match(flat(advance), /"taohua-passive" \}\)\) != -1\) \{ current\["actions"\] = \(\{\}\); current\["skill_loads"\] = \(\{\}\); passive_before = \(\[\]\);/);
    const start = action.indexOf('} else if (spec["function"] == "hit_ob") {');
    const end = action.indexOf('    reason = query_notify_fail();', start);
    assert.ok(start >= 0 && end > start);
    const call = flat(action.slice(start, end));
    assert.match(call, /spec\["object"\] == "\/kungfu\/skill\/yuxiao-jian" && current\["parameters"\]\["collection_group"\] == "taohua-passive"/);
    assert.match(call, /begin_passive\(players\[0\], players\[1\], "interface"\); result = call_other\( spec\["object"\], "hit_ob", players\[0\], players\[1\], spec\["damage"\], spec\["factor"\] \);/);
    assert.match(call, /observe_passive\( players\[0\], players\[1\], explode\(spec\["object"\], "\/"\)\[<1\], spec\["damage"\], spec\["factor"\], result, "interface" \);/);
    assert.doesNotMatch(call, /query_action|do_attack|do_damage|random\s*\(|perform_action|enable_skill/);
    assert.match(flat(action), /\(\{ "valid_learn", "valid_research", "can_learn", "practice_skill" \}\) \) != -1 && !result \? "refused" : "observed"/);
    assert.match(source, /add_action\("do_interface", "test_interface"\)/);
    assert.doesNotMatch(perform, /"taohua-passive"/);
    assert.doesNotMatch(source, /#include\s+["<][^">]*taohua_passive/);
});
