import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { mingjiaoJiuyangFusionProbes, restoreMingjiaoJiuyangFusionProbes }
    from './school_mingjiao_jiuyang_fusion_probes.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { createSandbox, validateQualificationSources, validateRecord } from './execution.mjs';
import { taohuaCombinationConditions, taohuaCombinationSourcePaths, taohuaCombinationSkills,
    taohuaCombinationFightValues, validateTaohuaCombinationRecord,
    taohuaCombinationEffects } from './school_taohua_combination_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const conditions = taohuaCombinationConditions(catalog, read);
const copy = structuredClone;
const pair = conditions.find(c => c.parameters.combination === 'pair-round');
const solo = conditions.find(c => c.parameters.combination === 'solo-round');
const preparation = conditions.find(c => c.method === 'prepare');
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

// Source-reachable first choice in the original last-six support at level 400.
// These fixtures exercise consumers, not the driver or any RNG distribution.
const firstFight = { 'xuanfeng-tui': [30, 55, 55], 'pikong-zhang': [18, 30, 15],
    'lanhua-shou': [null, 25, null], 'luoying-shenzhang': [38, 30, 25] };
// Original first-reachable force 160/100/170/210, effective STR 76, no random bonus.
const firstDamage = { 'xuanfeng-tui': 97, 'pikong-zhang': 74,
    'lanhua-shou': 101, 'luoying-shenzhang': 116 };
const fight = values => Object.fromEntries(['attack', 'dodge', 'parry'].map((key, i) => [key, values[i]]));

function actorSnapshot(config, side) {
    const cultivation = key => key.includes('/') || key === 'character';
    const highest = Math.max(0, ...['unarmed', 'hand', 'finger', 'strike', 'claw', 'cuff']
        .map(key => config.skills[key] ?? 0));
    return { ...Object.fromEntries(Object.entries(config.properties).filter(([key]) => !cultivation(key))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([key]) => cultivation(key))),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null,
        skills: copy(config.skills), mappings: copy(config.mappings), preparations: {},
        preparation_order: [], learned: {}, conditions: null,
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, n]) =>
            [key, Math.trunc(n / 2) + (config.skills[config.mappings[key]] ?? 0)])),
        effective_str: config.properties.str + Math.trunc(highest / 10),
        effective_dex: config.properties.dex + Math.trunc(config.skills.dodge / 10),
        effective_con: config.properties.con + Math.trunc(config.skills.force / 10),
        weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {},
        temp: { user_setup: 1, apply: { armor: 100 } } };
}

function record(condition, { cost = 23, reversed = false, results = [0], zeroHit = false, wound = 0 } = {}) {
    const p = condition.parameters, before = [actorSnapshot(p.actor, 0), actorSnapshot(p.target, 1)];
    const prepared = copy(before[0]);
    prepared.preparations = copy(p.prepare_commands[0].preparations);
    prepared.preparation_order = Object.keys(prepared.preparations);
    if (reversed) prepared.preparation_order.reverse();
    const raw = { kind: 'sample', condition_id: condition.id, index: 0, method: condition.method,
        outcome: 'observed', reason: '', elapsed: 0.001, before,
        immediate: [copy(prepared), copy(before[1])], after: [], metrics: [{}, {}],
        prepare_steps: [{ action: p.prepare_commands[0].action, accepted: cost, reason: '',
            before: copy(before[0]), after: prepared }],
        attacks: [], interfaces: [], launches: [], callbacks: [], terminals: [], dropped: [] };
    if (condition.method === 'round') {
        raw.immediate[0].temp.guarding = 0;
        for (const [index, result] of results.entries()) {
            const usage = prepared.preparation_order[index], skill = p.actor.mappings[usage];
            const damage = result === 0 && !zeroHit ? firstDamage[skill] : 0;
            raw.attacks.push({ actor: 0, target: 1, type: 0, result, damage,
                attack_usage: usage, attack_skill: skill, action_flag: index === 0 ? null : 1 });
            raw.immediate[0].temp.fight = fight(firstFight[skill]);
            const metric = result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry';
            raw.metrics[0][metric] = (raw.metrics[0][metric] ?? 0) + 1;
            if (damage) {
                raw.immediate[1].qi -= damage;
                raw.metrics[1].qi_cost = (raw.metrics[1].qi_cost ?? 0) + damage;
            }
        }
        if (results.length === 2) raw.immediate[0].temp.action_flag = 0;
        if (wound) { raw.immediate[1].eff_qi -= wound; raw.metrics[1].eff_qi_cost = wound; }
    }
    raw.after = copy(raw.immediate);
    return raw;
}

function consume(raw, condition) {
    const bytes = JSON.stringify(raw);
    validateRecord(raw, condition);
    const result = validateSchoolCombatRecord(raw, condition);
    assert.deepEqual(result, validateTaohuaCombinationRecord(raw, condition));
    assert.equal(JSON.stringify(raw), bytes, '三层消费不得归一化命令成本或回写原件');
    return result;
}

function rejects(condition, mutate, options) {
    const raw = record(condition, options);
    mutate(raw);
    raw.after = copy(raw.immediate);
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
const flat = value => value.replace(/\s+/g, ' ').trim();

test('COMBINATION仅尾增12，保护冻结15968全序及421582/26326计划', () => {
    // Independent archived reconstruction: tpassive-toolsource-v1 + tpassive-f1,
    // 166 archived MJS, grammar, 109 necessary public sources; no active registry baseline.
    const old = { formal: 'd97cfae262ab41b18407a39a71d61d5c18782ef02c15e2492c892693499e5e42',
        smoke: '1285b122ac268ce3874021a1d287a0da77b5e4c09382a3048bc77b24d477607d' };
    const tail = { formal: 'dfa064bd9999cdae5b510d91e946df7bd0631c56c5bbcda939cf41ba696b4724',
        smoke: 'cd0d3755a3c77d18591a9098ae5812053f2445dd95e9fe61ee369780501613df' };
    for (const smoke of [false, true]) {
        const key = smoke ? 'smoke' : 'formal', all = preOctober29SchoolConditions(catalog, { smoke })
            .filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['taohua-force', 'taohua-music', 'taohua-npc', 'mingjiao-core', 'mingjiao-qishang', 'mingjiao-xinfa', 'mingjiao-movement', 'mingjiao-shengong', 'mingjiao-shenghuo', 'mingjiao-ling-learning', 'mingjiao-ling-perform', 'mingjiao-apprentice-learning', 'mingjiao-public-force', 'mingjiao-teachers', 'mingjiao-recruit', 'mingjiao-gift', 'mingjiao-book', 'mingjiao-qkd', 'mingjiao-jiuyang', 'mingjiao-jiuyang-learning', 'mingjiao-jiuyang-direct', 'mingjiao-jiuyang-remaining', 'mingjiao-jiuyang-exert', 'mingjiao-jiuyang-capacity', 'mingjiao-jiuyang-research', 'mingjiao-jiuyang-fusion', 'mingjiao-remaining-perform', 'mingjiao-remaining-base', 'mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
        const own = taohuaCombinationConditions(catalog, read, { smoke });
        assert.equal(all.length, 15980);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(sha256(JSON.stringify(all.slice(0, 15968))), old[key]);
        assert.deepEqual(all.slice(15968), own);
        assert.equal(sha256(JSON.stringify(own)), tail[key]);
        assert.equal(own.length, 12);
        assert.equal(own.reduce((n, c) => n + c.samples, 0), smoke ? 12 : 808);
        assert.equal(all.reduce((n, c) => n + c.samples, 0), smoke ? 26326 : 421582);
        assert.equal(own.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.method === 'prepare').length, 4);
        assert.equal(own.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.combination === 'solo-round').length, 4);
        assert.equal(own.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.combination === 'pair-round').length, 4);
        for (const c of own) {
            const p = c.parameters;
            assert.equal(p.expected, 'observed');
            assert.equal(p.observe_seconds, 0);
            assert.equal(p.fighting, c.method === 'round');
            assert.equal(p.action, c.method === 'round' ? 'fight_round' : 'prepare_sequence');
            assert.equal(p.prepare_commands.length, 1);
            const names = p.prepare_commands[0].action.split(' ');
            assert.equal(names.shift(), 'prepare');
            assert.equal(names.length, p.combination === 'solo-round' ? 1 : 2);
            assert.equal(names[0], p.skill);
            assert.deepEqual(p.prepare_commands[0].preparations,
                Object.fromEntries(names.map(skill => [taohuaCombinationSkills[skill], skill])));
            assert.equal(p.prepare_commands[0].accepted, 1);
            assert.deepEqual(p.actor.preparations, {});
            assert.equal(p.actor.equipment, undefined);
            assert.equal(p.actor.mappings.force, undefined);
            assert.equal(p.actor.skills['jingluo-xue'], undefined);
            assert.equal(p.capture_skill_loads, undefined);
        }
    }
});

test('COMBINATION真实输入冻结四文件、旧复用模块与26来源，不增15文件48探针', () => {
    const actual = snapshot();
    for (const name of ['school_taohua_combination_cases.mjs', 'school_taohua_combination.test.mjs',
        'school_taohua_combination_report.test.mjs', 'school_taohua_combination_integration.test.mjs',
        'school_wudang_combination_cases.mjs', 'execution.mjs', 'runner.lpc',
        'school_combat_cases.mjs', 'school_combat_report.mjs', 'statistics.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(actual.files[path], sha256(read(path)), path);
    }
    const statistics = 'tools/tests/weapon_balance/statistics.mjs';
    assert.equal(actual.files[statistics], sha256(read(statistics)));
    assert.equal(taohuaCombinationSourcePaths.length, 26);
    for (const c of conditions) {
        assert.deepEqual(Object.keys(c.parameters.source_evidence), taohuaCombinationSourcePaths);
        assert.deepEqual(c.parameters.qualification_sources, taohuaCombinationSourcePaths);
        for (const path of taohuaCombinationSourcePaths)
            assert.equal(c.parameters.source_evidence[path], actual.files[path], path);
    }
    validateQualificationSources(conditions, actual.files);
    // Only the separately reviewed yanlian probe is projected out of the old 15/48 baseline.
    const fusionPath = 'cmds/skill/yanlian.c';
    const fusionProbes = actual.probes.filter(p => p.path === fusionPath);
    assert.equal(fusionProbes.length, 1);
    const fusionSource = read(fusionPath);
    const prepared = mingjiaoJiuyangFusionProbes(fusionSource, { collectionGroup: 'mingjiao-jiuyang-fusion' });
    assert.equal(prepared.sites.length, 17);
    assert.deepEqual(fusionProbes[0], { path: fusionPath, before: sha256(fusionSource),
        after: sha256(prepared.changed), sites: prepared.sites });
    assert.equal(actual.files[fusionPath], sha256(fusionSource));
    assert.equal(restoreMingjiaoJiuyangFusionProbes(prepared.changed), fusionSource);
    for (const name of [
        'school_mingjiao_jiuyang_fusion_cases.mjs',
        'school_mingjiao_jiuyang_fusion_cases.test.mjs',
        'school_mingjiao_jiuyang_fusion_observation.mjs',
        'school_mingjiao_jiuyang_fusion_observation.test.mjs',
        'school_mingjiao_jiuyang_fusion_probes.mjs',
        'school_mingjiao_jiuyang_fusion_probes.test.mjs',
        'school_mingjiao_jiuyang_fusion_record.mjs',
        'school_mingjiao_jiuyang_fusion_record.test.mjs',
        'school_mingjiao_jiuyang_fusion_report.mjs',
        'school_mingjiao_jiuyang_fusion_report.test.mjs',
        'school_mingjiao_jiuyang_fusion_integration.test.mjs',
        'jiuyang_fusion_receivers.h',
    ]) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(actual.files[path], sha256(read(path)), path);
    }
    const historicalProbes = actual.probes.filter(p => p.path !== fusionPath);
    assert.equal(historicalProbes.length, 15);
    assert.equal(historicalProbes.reduce((n, probe) => n + probe.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(historicalProbes)),
        'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    assert.equal(Object.keys(actual.files).some(path => /taohua_combination.*\.h$/.test(path)), false);
});

test('来源入口消费者拒绝26项漂移、缺省及技能/方法/原入口错绑', () => {
    const actual = snapshot();
    const bad = operation => {
        const c = copy(pair), files = { ...actual.files };
        operation(c, files);
        assert.throws(() => validateQualificationSources([c], files));
    };
    for (const path of taohuaCombinationSourcePaths) {
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
    bad(c => { c.parameters.skill = 'taiji-quan'; });
    bad(c => { c.parameters.ability = 'perform'; });
    bad(c => { c.parameters.action = 'ordinary'; });
    bad(c => { c.method = 'perform'; c.parameters.ability = 'perform'; });
    bad(c => { c.entry_id = 'kungfu/skill/taiji-quan.c'; });
    bad(c => { c.entry_id += ':10:query_action'; });
    bad(c => { c.parameters.pair = ['xuanfeng-tui', 'lanhua-shou']; });
    bad(c => { c.parameters.pair.reverse(); });
    const c = copy(preparation);
    c.parameters.action = 'fight_round';
    assert.throws(() => validateQualificationSources([c], actual.files));
});

test('12条件原正成本1/23/137/476三层消费，双USER完整状态且不回写raw', () => {
    for (const c of conditions) for (const cost of [1, 23, 137, 476]) {
        const raw = record(c, { cost }), fact = consume(raw, c);
        assert.equal(fact.commands, 1);
        assert.equal(fact.attacks, c.method === 'round' ? 1 : 0);
        assert.equal(raw.prepare_steps[0].accepted, cost);
        assert.equal(Object.hasOwn(raw, 'parameters'), false);
        const effects = taohuaCombinationEffects([row(raw)], c);
        assert.equal(effects.commands, 1);
        assert.equal(effects.accepted, 1, '命令受理分母不能累计执行成本');
        assert.equal(effects.rejected, 0);
    }
    for (const c of [preparation, solo, pair]) {
        for (const cost of [0, -1, null, undefined, true, false, '23', 1.5, {}, [], Infinity,
            Number.MAX_SAFE_INTEGER + 1]) rejects(c, raw => { raw.prepare_steps[0].accepted = cost; });
        rejects(c, raw => { delete raw.prepare_steps[0].accepted; });
        rejects(c, raw => { raw.prepare_steps[0].action = 'prepare none'; });
        rejects(c, raw => { raw.prepare_steps[0].reason = '伪造拒绝'; });
        rejects(c, raw => { raw.prepare_steps[0].before.neili--; });
    }
    for (const side of [0, 1]) {
        const corruptAllStates = operation => rejects(pair, raw => {
            for (const state of [raw.before[side], raw.immediate[side],
                ...(side === 0 ? raw.prepare_steps.flatMap(step => [step.before, step.after]) : [])]) operation(state);
        });
        for (const [key, value] of [['userp', 0], ['playerp', 0], ['interactive', 0],
            ['wizardp', 1], ['ghost', 1], ['living', 0]]) corruptAllStates(state => { state[key] = value; });
        corruptAllStates(state => { state.temp.apply.armor = 999; });
        corruptAllStates(state => { state.temp.apply.attack = 1; });
        corruptAllStates(state => { delete state.temp.apply; });
        corruptAllStates(state => { state.learned = { force: 1 }; });
        rejects(pair, raw => { raw.immediate[side].secondary_weapon = 'sword'; });
        rejects(pair, raw => { raw.immediate[side].object = '/tests/actor#999'; });
    }
});

test('准备真实keys可异于命令顺序；单击/双击、归还标记及末六项支持三层核对', () => {
    for (const c of conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.method === 'round')) {
        const maximum = c.parameters.combination === 'pair-round' ? 2 : 1;
        for (const reversed of [false, true]) for (const results of [[0], [-1], [-2],
            ...(maximum === 2 ? [[0, -1], [-2, 0], [0, 0]] : [])]) {
            const raw = record(c, { reversed, results });
            const fact = consume(raw, c);
            assert.equal(fact.attacks, results.length);
            assert.deepEqual(raw.attacks.map(hit => hit.attack_usage),
                raw.prepare_steps[0].after.preparation_order.slice(0, results.length));
        }
    }
    for (const c of conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.combination === 'solo-round')) {
        const skill = c.parameters.skill, values = taohuaCombinationFightValues[skill];
        for (const entry of values.slice(-6)) {
            const raw = record(c, { zeroHit: true });
            raw.immediate[0].temp.fight = fight(entry);
            raw.after = copy(raw.immediate);
            consume(raw, c); // Zero final damage is independent of the selected force value.
        }
        for (const entry of values.slice(0, Math.max(0, values.length - 6)))
            rejects(c, raw => { raw.immediate[0].temp.fight = fight(entry); }, { zeroHit: true });
    }
    rejects(pair, raw => { raw.attacks[0].attack_usage = raw.prepare_steps[0].after.preparation_order[1]; });
    rejects(pair, raw => { raw.attacks[0].attack_skill = 'taiji-quan'; });
    rejects(pair, raw => { raw.attacks[0].action_flag = 1; });
    rejects(pair, raw => { raw.attacks[1].action_flag = 0; }, { results: [0, -1] });
    rejects(pair, raw => { raw.immediate[0].temp.action_flag = 1; }, { results: [0, -1] });
    rejects(pair, raw => { raw.immediate[0].preparation_order.reverse(); });
    rejects(pair, raw => { raw.prepare_steps[0].after.preparation_order.push('unarmed'); });
    rejects(pair, raw => { delete raw.prepare_steps[0].after.preparation_order; });
    rejects(solo, raw => { raw.attacks.push(copy(raw.attacks[0])); });
    rejects(solo, raw => { raw.immediate[0].temp.action_flag = 0; });
    rejects(pair, raw => { raw.attacks = []; raw.metrics = [{}, {}];
        raw.immediate[1] = copy(raw.before[1]); raw.immediate[0].temp.guarding = 1; });
    rejects(preparation, raw => { raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 0 }); });
});

test('零资源费用独立于执行成本，毛净账/计数/未知分母不冒充成功零值', () => {
    const zero = record(pair, { cost: 476, zeroHit: true });
    assert.equal(consume(zero, pair).target_qi_loss, 0);
    assert.equal(zero.metrics[0].hit, 1);
    for (const side of [0, 1]) for (const key of ['neili', 'jing', 'eff_jing']) {
        rejects(pair, raw => { raw.metrics[side][key + '_cost'] = 1;
            raw.metrics[side][key + '_recovery'] = 1; });
    }
    const wounded = record(pair, { wound: 20 });
    const fact = consume(wounded, pair);
    assert.equal(fact.target_qi_loss, 97);
    assert.equal(fact.target_wound, 20);
    rejects(pair, raw => { raw.metrics[1].qi_cost++; });
    rejects(pair, raw => { raw.metrics[1].eff_qi_cost = 98; raw.immediate[1].eff_qi -= 98; });
    for (const side of [0, 1]) for (const key of ['direct', 'quick', 'riposte', 'heartbeats', 'ability_launched'])
        for (const value of [1, null, -1]) rejects(pair, raw => { raw.metrics[side][key] = value; });
    rejects(pair, raw => { raw.metrics[0].hit = 0; });
    rejects(pair, raw => { raw.metrics[1].hit = 1; });
    for (const key of ['launches', 'callbacks', 'terminals', 'interfaces', 'dropped'])
        rejects(pair, raw => { raw[key].push({ invented: 1 }); });
    const double = record(pair, { results: [0, -1], cost: 137 });
    const unknown = { condition_id: pair.id, index: 2, outcome: 'error' };
    const effects = taohuaCombinationEffects([row(zero), row(double), unknown], pair);
    assert.equal(effects.samples, 2);
    assert.equal(effects.unknown_samples, 1);
    assert.equal(effects.commands, 2);
    assert.equal(effects.accepted, 2);
    assert.equal(effects.rounds, 2);
    assert.equal(effects.primary_attacks, 3);
    assert.equal(effects.double_rounds.successes, 1);
    assert.equal(effects.double_rounds.trials, 2);
    assert.equal(effects.target_qi_loss.n, 2);
    assert.equal(effects.target_qi_loss.mean, 48.5);
    const absent = taohuaCombinationEffects([unknown], pair);
    assert.equal(absent.samples, 0);
    assert.equal(absent.target_qi_loss.n, 0);
    assert.equal(absent.target_qi_loss.mean, null);
    const prepared = taohuaCombinationEffects([row(record(preparation))], preparation);
    assert.equal(prepared.prepare_only_samples, 1);
    assert.equal(prepared.rounds, 0);
    assert.equal(prepared.primary_attacks, 0);
    assert.throws(() => taohuaCombinationEffects([{ ...row(zero), condition_id: solo.id }], pair));
    assert.throws(() => taohuaCombinationEffects([{ ...row(zero), outcome: 'error' }], pair));
    assert.throws(() => taohuaCombinationEffects([{ condition_id: pair.id, outcome: 'observed' }], pair));
});

test('实际runner只复用原prepare逐步成本与唯一fight，读取keys且不新增选招/随机/冷加载', () => {
    const source = read('tools/tests/martial_data/runner.lpc');
    const state = body(source, 'snapshot'), observe = body(source, 'observe_attack');
    const perform = body(source, 'perform_sample');
    const start = perform.indexOf('if (arrayp(parameters["prepare_commands"]))');
    const end = perform.indexOf('if (arrayp(parameters["buff_steps"]))', start);
    assert.ok(start >= 0 && end > start);
    const branch = flat(perform.slice(start, end));
    assert.match(branch, /"taohua-combination"/);
    assert.match(branch, /member_array\(current\["method"\], \(\{ "prepare", "round" \}\)\) != -1/);
    assert.match(branch, /foreach \(expectation in parameters\["prepare_commands"\]\)/);
    assert.match(branch, /action = expectation\["action"\];/);
    assert.match(branch, /strsrch\(action, "prepare "\) == 0/);
    assert.match(branch, /"before": snapshot\(players\[0\]\)/);
    assert.match(branch, /result = players\[0\]->force_me\(action\);/);
    assert.match(branch, /step\["accepted"\] = result;/);
    assert.match(branch, /step\["after"\] = snapshot\(players\[0\]\);/);
    assert.equal((branch.match(/->force_me\(/g) ?? []).length, 1);
    assert.equal((branch.match(/COMBAT_D->fight\(/g) ?? []).length, 1);
    assert.match(branch, /if \(current\["method"\] == "round"\) \{ COMBAT_D->fight\(players\[0\], players\[1\]\);/);
    assert.match(branch, /return; \}$/);
    assert.doesNotMatch(branch, /query_action|do_attack|prepare_skill|random\(|call_out\(|observation_heartbeat|->set(?:_temp)?\(/);
    assert.match(flat(state), /"taohua-combination"[\s\S]*?result\["cultivation"\]\["character"\] = ob->query\("character"\)/);
    assert.match(flat(state), /"taohua-combination"[\s\S]*?secondary = ob->query_temp\("secondary_weapon"\)/);
    assert.match(flat(state), /"taohua-combination"[\s\S]*?result\["preparation_order"\] = keys\(ob->query_skill_prepare\(\) \|\| \(\[\]\)\)/);
    assert.match(state, /result\["effective_dex"\] = ob->query_dex\(\)/);
    assert.match(observe, /"taohua-combination"[\s\S]*?prepared = me->query_skill_prepare\(\) \|\| \(\[\]\)/);
    assert.match(observe, /value\["action_flag"\] = flag/);
    assert.match(observe, /value\["attack_usage"\] = usage/);
    assert.match(observe, /value\["attack_skill"\] = me->query_skill_mapped\(usage\)/);
    assert.doesNotMatch(observe, /query_action|random\(/);
    for (const name of ['observe_selected_action', 'begin_passive', 'prepare_actor', 'advance'])
        assert.doesNotMatch(body(source, name), /"taohua-combination"/, '不得扩大原白名单：' + name);
});
