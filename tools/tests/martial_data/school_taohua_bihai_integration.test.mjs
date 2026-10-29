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
import { taohuaBihaiConditions, taohuaBihaiSourcePaths, validateTaohuaBihaiRecord,
    taohuaBihaiEffects } from './school_taohua_bihai_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const conditions = taohuaBihaiConditions(catalog, read);
const copy = structuredClone;
const skill = 'yuxiao-jian', grant = 'can_perform/yuxiao-jian/bihai';
let frozen;
const snapshot = () => frozen ??= createSandbox(root);
const pick = (variant = 'baseline', level = 200) => {
    const condition = conditions.find(c => c.id === 'school-taohua-bihai-l' + level + '-' + variant);
    assert.ok(condition, variant);
    return condition;
};
const body = (source, name) => {
    const match = new RegExp('(?:private\\s+)?(?:int|void|mapping)\\s+' + name
        + '\\([^;]*?\\)\\s*\\{').exec(source);
    assert.ok(match, 'actual definition: ' + name);
    const end = source.indexOf('\n}\n', match.index);
    assert.ok(end > match.index, 'complete function: ' + name);
    return source.slice(match.index, end + 3);
};

// Consumer fixtures, not a game executor: distinct actual-slot identities and hand-checked
// aggregate support examples. No stage-by-stage RNG outcome or attack event is fabricated.
function equipment(config, side, slot) {
    if (!config) return {};
    const xiao = config.type === 'xsword';
    return { object: '/tests/' + config.type + '#' + (200 + side * 10 + slot),
        program: '/tests/' + config.type, skill_type: 'sword', weight: 3000, flag: 4,
        damage: xiao ? 45 : 50, consistence: 100, material: null, rigidity: null, no_wield: null,
        valid_as_xiao: xiao ? 1 : null,
        valid_as_xiao_source: xiao ? '/inherit/misc/_xiao' : null };
}

function actorSnapshot(config, side, fighting) {
    const primary = equipment(config.equipment, side, 1);
    const held = equipment(config.handing_equipment, side, 2);
    const apply = { armor: 100, ...(config.equipment ? { damage: primary.damage, dodge: -1 } : {}) };
    const properties = Object.entries(config.properties);
    return { ...Object.fromEntries(properties.filter(([key]) => !key.includes('/'))),
        cultivation: Object.fromEntries(properties.filter(([key]) => key.includes('/'))),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: Number(fighting), busy: null,
        skills: copy(config.skills), mappings: copy(config.mappings), preparations: copy(config.preparations),
        learned: {}, conditions: null, temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: config.equipment ? 'sword' : 'none', weapon_damage: primary.damage ?? 0,
        weapon_flag: primary.flag ?? 0, weapon_details: primary,
        secondary_weapon: 'none', secondary_weapon_details: {},
        handing: config.handing_equipment ? 'sword' : 'none', handing_details: held };
}

function syntheticRecord(condition, { damage, busy = 2, progress = 1, cost = 23 } = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [actorSnapshot(p.actor, 0, p.fighting), actorSnapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: copy(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 });
        preparation.after = copy(before[1]);
    }
    const raw = { kind: 'sample', condition_id: condition.id, method: condition.method, outcome: p.expected,
        before, immediate: copy(before), after: [], metrics: [{}, {}],
        command_accepted: accepted ? cost : 0, launches: [], refusals: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [], callbacks: [],
        elapsed: 0.01, reason: '', ...(preparation ? { preparation } : {}) };
    if (accepted) {
        damage ??= p.level === 400 ? 1796 : p.level === 800 ? 3593 : {
            force0: 898, force2200: 0, minimum: 283, 'no-music-map': 100, 'target-music400': 140,
        }[p.variant] ?? 315;
        const wound = Math.trunc(2 * damage / 3);
        raw.launches.push({ actor: before[0].object, skill, argument: 'bihai right' });
        raw.metrics[0] = { ability_launched: 1, neili_cost: 200 };
        raw.metrics[1] = { jing_cost: damage, eff_jing_cost: wound };
        raw.immediate[0].busy = busy;
        raw.immediate[0].neili -= 200;
        raw.immediate[1].jing -= damage;
        raw.immediate[1].eff_jing -= wound;
        if (progress) raw.immediate[0].learned[skill] = progress;
    } else {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals.push({ actor: before[0].object, reason: raw.reason });
        raw.immediate[0].temp.notify_fail = p.refusal;
    }
    raw.after = copy(raw.immediate);
    return raw;
}

function consume(raw, condition) {
    const original = JSON.stringify(raw);
    validateRecord(raw, condition);
    const observation = validateSchoolCombatRecord(raw, condition);
    assert.deepEqual(observation, validateTaohuaBihaiRecord(raw, condition));
    assert.equal(JSON.stringify(raw), original, '公共及专用消费不可回写原记录');
    return observation;
}
const everyPhase = (raw, side, operation) => {
    for (const phase of ['before', 'immediate', 'after']) operation(raw[phase][side]);
};
const rejects = (condition, operation, options) => {
    const raw = syntheticRecord(condition, options);
    operation(raw);
    assert.throws(() => consume(raw, condition));
};

test('BIHAI仅尾追加23条，保留原15929完整有序正式/烟雾及固定有限矩阵', () => {
    // Independently recomputed from preserved tcombo-toolsource-v1 plus tcombo-f1/catalog,
    // not from the active registry: 164 archived modules and 102 hash-checked public inputs.
    const old = { formal: '4a0857ead6133e875b46b014a87ccd1a1174e729507e1a1ed18c18117c474b0b',
        smoke: 'abfce27d4add928a0b35cc75adc59dff451e2a72e32ad7aacf4ab22b69adc165' };
    const tails = { formal: 'd5046d8c95e6a655fccfb0b00c310515e5c192ea77cf9e5f2de9151a5e8b5794',
        smoke: 'f90cc6ab9c72930625e7e814a34e381ffa4fbea7e9b15483cf493f60a8d9b3be' };
    for (const smoke of [false, true]) {
        const key = smoke ? 'smoke' : 'formal';
        const all = preOctober29SchoolConditions(catalog, { smoke })
            .filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['taohua-passive', 'taohua-combination', 'taohua-force', 'taohua-music', 'taohua-npc', 'mingjiao-core', 'mingjiao-qishang', 'mingjiao-xinfa', 'mingjiao-movement', 'mingjiao-shengong', 'mingjiao-shenghuo', 'mingjiao-ling-learning', 'mingjiao-ling-perform', 'mingjiao-apprentice-learning', 'mingjiao-public-force', 'mingjiao-teachers', 'mingjiao-recruit', 'mingjiao-gift', 'mingjiao-book', 'mingjiao-qkd', 'mingjiao-jiuyang', 'mingjiao-jiuyang-learning', 'mingjiao-jiuyang-direct', 'mingjiao-jiuyang-remaining', 'mingjiao-jiuyang-exert', 'mingjiao-jiuyang-capacity', 'mingjiao-jiuyang-research', 'mingjiao-jiuyang-fusion', 'mingjiao-remaining-perform', 'mingjiao-remaining-base', 'mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
        const own = taohuaBihaiConditions(catalog, read, { smoke });
        assert.equal(all.length, 15952);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(sha256(JSON.stringify(all.slice(0, 15929))), old[key]);
        assert.deepEqual(all.slice(15929), own);
        assert.equal(own.length, 23);
        assert.equal(sha256(JSON.stringify(own)), tails[key]);
        assert.equal(own.reduce((n, c) => n + c.samples, 0), smoke ? 46 : 732);
        assert.equal(all.reduce((n, c) => n + c.samples, 0), smoke ? 26298 : 419664);
        assert.equal(own.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.expected === 'observed').length, 12);
        assert.equal(own.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.expected === 'refused').length, 11);
        assert.equal(own.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.target_state === 'unconscious').length, 1);
        for (const c of own) {
            assert.equal(c.method, 'perform');
            assert.equal(c.parameters.action, 'perform sword.bihai right');
            assert.equal(Object.hasOwn(c.parameters, 'qualification_sources'), false);
        }
    }
});

test('BIHAI实际冻结四个新增依赖和36原来源，保持15文件48探针且不新增观察框架', () => {
    const actual = snapshot();
    const declared = ['school_taohua_bihai_cases.mjs', 'school_taohua_bihai.test.mjs',
        'school_taohua_bihai_report.test.mjs', 'school_taohua_bihai_integration.test.mjs',
        'execution.mjs', 'runner.lpc', 'school_combat_cases.mjs', 'school_combat_report.mjs', 'statistics.mjs'];
    for (const name of declared) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(actual.files[path], sha256(read(path)), path);
    }
    assert.equal(taohuaBihaiSourcePaths.length, 36);
    for (const condition of conditions) {
        assert.deepEqual(Object.keys(condition.parameters.source_evidence), taohuaBihaiSourcePaths);
        for (const path of taohuaBihaiSourcePaths)
            assert.equal(condition.parameters.source_evidence[path], actual.files[path], path);
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
});

test('BIHAI真实来源消费者拒绝缺项、源漂移及技能/命令/两源/入口错配', () => {
    const actual = snapshot(), condition = pick();
    const bad = operation => {
        const c = copy(condition), files = { ...actual.files };
        operation(c, files);
        assert.throws(() => validateQualificationSources([c], files));
    };
    for (const path of taohuaBihaiSourcePaths) {
        bad(c => { delete c.parameters.source_evidence[path]; });
        bad(c => { c.parameters.source_evidence[path] = 'f'.repeat(64); });
        bad((c, files) => { delete files[path]; });
        bad((c, files) => { files[path] = '0'.repeat(64); });
    }
    for (const value of [null, undefined, 0, 'sources', []])
        bad(c => { c.parameters.source_evidence = value; });
    bad(c => { c.parameters.source_evidence['kungfu/skill/unknown.c'] = '0'.repeat(64); });
    bad(c => { c.parameters.source_evidence = Object.fromEntries(Object.entries(c.parameters.source_evidence).reverse()); });
    for (const [key, value] of [['ability', 'xiao'], ['skill', 'tanzhi-shentong'], ['usage', 'finger'],
        ['action', 'perform sword.bihai left']]) bad(c => { c.parameters[key] = value; });
    bad(c => { c.method = 'exert'; });
    for (const key of ['ability_source', 'base_source']) {
        bad(c => { c.parameters[key].path = 'kungfu/skill/unarmed.c'; });
        bad(c => { c.parameters[key].sha256 = '0'.repeat(64); });
        bad(c => { delete c.parameters[key]; });
    }
    bad(c => { c.parameters.ability_source.entry_id = 'kungfu/skill/yuxiao-jian/bihai.c:1:other'; });
    bad(c => { c.entry_id = 'kungfu/skill/tanzhi-shentong/xiao.c:8:perform'; });
    bad(c => { c.entry_id = c.parameters.ability_source.entry_id = 'kungfu/skill/yuxiao-jian/bihai.c:8:other'; });
    bad(c => { c.entry_id = c.parameters.ability_source.entry_id = 'kungfu/skill/yuxiao-jian/bihai.c:bad:perform'; });
});

test('23原条件合成原件均经公共和专用三层，持箫/主手两槽身份与实际45伤害严格', () => {
    for (const c of conditions) {
        const raw = syntheticRecord(c);
        assert.equal(Object.hasOwn(raw, 'parameters'), false);
        assert.equal(consume(raw, c).accepted, c.parameters.expected === 'observed');
    }
    for (const variant of ['valid-hand-invalid-primary', 'invalid-hand-valid-primary']) {
        const c = pick(variant), raw = syntheticRecord(c);
        assert.notEqual(raw.before[0].weapon_details.object, raw.before[0].handing_details.object);
        consume(raw, c);
        rejects(c, r => {
            everyPhase(r, 0, s => { s.handing_details.object = s.weapon_details.object; });
        });
    }
    for (const variant of ['baseline', 'valid-hand-invalid-primary', 'invalid-hand-valid-primary', 'primary-only',
        'invalid-hand-only', 'invalid-primary-only']) {
        const c = pick(variant);
        for (const [slot, cfg] of [['weapon', c.parameters.actor.equipment],
            ['handing', c.parameters.actor.handing_equipment]]) {
            if (!cfg) continue;
            for (const [key, value] of [['program', '/tests/axe'], ['skill_type', 'axe'], ['weight', 2999],
                ['flag', 0], ['damage', cfg.type === 'xsword' ? 50 : 45], ['consistence', 99]]) {
                rejects(c, r => everyPhase(r, 0, s => { s[slot + '_details'][key] = value; }));
            }
            for (const key of ['valid_as_xiao', 'valid_as_xiao_source']) {
                rejects(c, r => everyPhase(r, 0, s => { delete s[slot + '_details'][key]; }));
            }
            if (cfg.type === 'xsword') {
                rejects(c, r => everyPhase(r, 0, s => { s[slot + '_details'].valid_as_xiao = null; }));
                rejects(c, r => everyPhase(r, 0, s => { s[slot + '_details'].valid_as_xiao_source = '/tests/xsword'; }));
            } else {
                for (const empty of [0, null]) {
                    const raw = syntheticRecord(c);
                    everyPhase(raw, 0, s => {
                        s[slot + '_details'].valid_as_xiao = empty;
                        s[slot + '_details'].valid_as_xiao_source = empty;
                    });
                    consume(raw, c);
                }
                for (const value of [undefined, false, '', '0', 1, {}, []])
                    rejects(c, r => everyPhase(r, 0, s => { s[slot + '_details'].valid_as_xiao = value; }));
            }
            rejects(c, r => {
                for (const phase of ['immediate', 'after']) r[phase][0][slot + '_details'].object =
                    '/tests/' + cfg.type + '#999';
            });
        }
    }
    rejects(pick(), r => everyPhase(r, 0, s => { s.temp.apply.damage = 45; }));
    rejects(pick(), r => everyPhase(r, 0, s => { s.temp.apply.dodge = -1; }));
    rejects(pick('primary-only'), r => everyPhase(r, 0, s => { s.temp.apply.damage = 0; }));
    rejects(pick(), r => everyPhase(r, 0, s => {
        s.secondary_weapon = 'sword';
        s.secondary_weapon_details = equipment({ type: 'xsword' }, 0, 3);
    }));
});

test('昏迷只用原准备证据且与测量隔离，原拒绝/角色/零空值不能伪造', () => {
    const unconscious = pick('unconscious-target');
    const raw = syntheticRecord(unconscious);
    consume(raw, unconscious);
    assert.deepEqual(raw.preparation.after, raw.before[1]);
    assert.deepEqual(raw.terminals, []);
    assert.equal(raw.metrics[1].qi_cost, undefined);
    assert.equal(raw.metrics[1].jing_cost, undefined);
    for (const operation of [
        r => { delete r.preparation; },
        r => { r.preparation.terminals = []; },
        r => { r.preparation.terminals.push({ side: 1, state: 'unconscious' }); },
        r => { r.preparation.terminals[0].side = 0; },
        r => { r.preparation.before.object = r.before[0].object; },
        r => { r.preparation.before.living = 0; },
        r => { r.preparation.before.qi = 0; },
        r => { r.preparation.after.jing = 1; },
        r => { r.terminals.push({ side: 1, state: 'unconscious' }); },
        r => { r.metrics[1].jing_cost = 100000; },
    ]) rejects(unconscious, operation);
    rejects(pick(), r => { r.preparation = copy(raw.preparation); });
    for (const condition of conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.expected === 'refused')) {
        rejects(condition, r => { r.reason = ''; r.refusals[0].reason = ''; });
        rejects(condition, r => { r.refusals[0].actor = r.before[1].object; });
        rejects(condition, r => { r.command_accepted = 23; });
        rejects(condition, r => { r.launches.push({ actor: r.before[0].object, skill, argument: 'bihai right' }); });
    }
    for (const side of [0, 1]) for (const [key, value] of [
        ['object', ''], ['id', 'someone'], ['userp', 0], ['playerp', 0], ['interactive', 0], ['wizardp', 1],
        ['ghost', 1], ['fighting_opponent', 0], ['busy', -1],
    ]) rejects(pick(), r => everyPhase(r, side, s => { s[key] = value; }));
    for (const empty of [0, null]) {
        const c = pick('no-grant'), r = syntheticRecord(c);
        everyPhase(r, 0, s => { s.cultivation[grant] = empty; });
        consume(r, c);
    }
    rejects(pick('no-grant'), r => everyPhase(r, 0, s => { delete s.cultivation[grant]; }));
    rejects(pick(), r => everyPhase(r, 0, s => { s.cultivation[grant] = null; }));
});

test('原正命令成本不是受理数，零总效果仍收费；无攻击事件不得带矛盾计数或补偿扣费', () => {
    const c = pick(), rows = [1, 23, 476].map(cost => {
        const raw = syntheticRecord(c, { cost });
        consume(raw, c);
        return { condition_id: c.id, outcome: raw.outcome, raw };
    });
    const original = JSON.stringify(rows), effects = taohuaBihaiEffects(rows, c);
    assert.equal(effects.accepted_samples, 3);
    assert.deepEqual(effects, taohuaBihaiEffects(rows.map(row =>
        ({ ...row, raw: { ...row.raw, command_accepted: 1 } })), c));
    assert.equal(JSON.stringify(rows), original);
    for (const value of [0, null, undefined, -1, 0.5, '1', true, {}, [], NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
        rejects(c, r => { r.command_accepted = value; });
    rejects(c, r => { delete r.command_accepted; });
    const zero = syntheticRecord(pick('force2200'), { damage: 0 });
    assert.equal(consume(zero, pick('force2200')).positive_effect, false);
    assert.equal(zero.metrics[0].neili_cost, 200);
    assert.equal(zero.before[1].neili, zero.after[1].neili);
    for (const side of [0, 1]) for (const key of ['direct', 'quick', 'riposte', 'heartbeats', 'hit', 'dodge', 'parry']) {
        const r = syntheticRecord(c);
        r.metrics[side][key] = 0;
        consume(r, c);
        for (const value of [1, null, -1]) rejects(c, raw => { raw.metrics[side][key] = value; });
    }
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'dropped',
        'terminals', 'callbacks', 'actions', 'directs'])
        rejects(c, r => { r[key] = [{}]; });
    for (const busy of [1, 2, 3]) consume(syntheticRecord(c, { busy }), c);
    for (const busy of [0, 4]) rejects(c, () => {}, { busy });
    for (const progress of [0, 1]) consume(syntheticRecord(c, { progress }), c);
    rejects(pick('baseline', 400), () => {}, { progress: 0 });
    rejects(c, () => {}, { progress: 2 });
    rejects(c, r => {
        r.metrics[0].neili_cost++;
        r.metrics[0].neili_recovery = 1;
    });
    rejects(c, r => {
        r.metrics[1].jing_cost++;
        r.metrics[1].jing_recovery = 1;
    });
    rejects(c, r => { r.launches[0].argument = 'bihai left'; });
    rejects(c, r => { r.launches[0].actor = r.before[1].object; });
    rejects(c, r => { r.condition_id += '-other'; });
    rejects(c, r => { r.method = 'exert'; });
    rejects(c, r => { r.outcome = 'refused'; });
});

test('runner 原 hand 先于 wield 且持器引用不混槽；昏迷准备分账，不为 BIHAI 增添攻击观察', () => {
    const source = read('tools/tests/martial_data/runner.lpc');
    const prepare = body(source, 'prepare_actor'), perform = body(source, 'perform_sample');
    const state = body(source, 'snapshot'), detail = body(source, 'equipment_snapshot');
    const flat = value => value.replace(/\s+/g, ' ');
    const handing = prepare.indexOf('if (mapp(config["handing_equipment"]))');
    const primary = prepare.indexOf('if (mapp(config["equipment"]))');
    const wield = prepare.indexOf('weapon->wield() && ob->query_temp("weapon") == weapon');
    const slots = prepare.indexOf('"exact BIHAI held and primary slots"');
    assert.ok(handing >= 0 && handing < primary && primary < wield && wield < slots);
    assert.match(prepare, /object\s+[^;]*\bheld\s*;/);
    const heldSetup = flat(prepare.slice(handing, primary));
    assert.ok(heldSetup.includes('require(current["parameters"]["collection_group"] == "taohua-bihai" && side == 0 &&'));
    assert.ok(heldSetup.includes('member_array(config["handing_equipment"]["type"], ({ "xsword", "sword" })) != -1'));
    assert.ok(heldSetup.includes('held = new("/tests/" + config["handing_equipment"]["type"]);'));
    assert.ok(heldSetup.includes('require(held->move(ob) && ob->force_me("hand practice weapon") && ob->query_temp("handing") == held && !ob->query_temp("weapon") && environment(held) == ob,'));
    assert.doesNotMatch(heldSetup, /->(?:set_temp|wield|set|destruct)\s*\(/);
    assert.ok(flat(prepare).includes('require(ob->query_temp("handing") == held && ob->query_temp("weapon") == weapon, "exact BIHAI held and primary slots")'));
    assert.ok(flat(prepare).includes('if (objectp(held)) require(held != weapon && environment(held) == ob,'));
    assert.ok(flat(prepare).includes('require(present(side ? "right" : "left", this_object()) == ob, "original BIHAI input resolves to exact USER")'));
    assert.match(prepare, /ob->id\(side \? "right" : "left"\), "original BIHAI input alias"/);

    assert.match(state, /weapon = ob->query_temp\("weapon"\)/);
    assert.match(state, /handing = ob->query_temp\("handing"\)/);
    for (const [slot, item] of [['weapon', 'weapon'], ['handing', 'handing']])
        assert.ok(state.includes('result["' + slot + '_details"] = equipment_snapshot(' + item + ');'));
    assert.match(flat(state), /"taohua-bihai", "taohua-passive"[^}]*\}\)\) != -1\) \{ opponent = ob == players\[0\] \? players\[1\] : players\[0\]; result\["fighting_opponent"\] = objectp\(opponent\) && !!ob->is_fighting\(opponent\);/);
    const ownStart = state.indexOf('if (current["parameters"]["collection_group"] == "taohua-bihai")');
    assert.ok(ownStart >= 0);
    const ownState = state.slice(ownStart, state.indexOf('\n    }', ownStart) + 6);
    assert.match(ownState, /result\["cultivation"\]\["can_perform\/yuxiao-jian\/bihai"\] = ob->query\("can_perform\/yuxiao-jian\/bihai"\)/);
    assert.match(ownState, /secondary = ob->query_temp\("secondary_weapon"\)/);
    assert.match(ownState, /result\["secondary_weapon_details"\] = equipment_snapshot\(secondary\)/);
    assert.ok(flat(detail).includes('if (current["parameters"]["collection_group"] == "taohua-bihai") result += ([ "valid_as_xiao": item->valid_as_xiao(), "valid_as_xiao_source": function_exists("valid_as_xiao", item) ]);'));

    const preparationStart = perform.indexOf('if (parameters["target_state"] == "unconscious")');
    const measurementStart = perform.indexOf('current["before"] = ({ snapshot(players[0]), snapshot(players[1]) });');
    assert.ok(preparationStart >= 0 && measurementStart > preparationStart);
    const preparation = perform.slice(preparationStart, measurementStart);
    assert.equal((preparation.match(/"taohua-bihai"/g) ?? []).length, 3,
        '资格、交战昏迷及准备终态隔离三处白名单');
    const before = preparation.indexOf('current["preparation"] = ([ "before": snapshot(players[1]) ]);');
    const unconscious = preparation.indexOf('players[1]->unconcious();');
    const after = preparation.indexOf('current["preparation"]["after"] = snapshot(players[1]);');
    const terminals = preparation.indexOf('current["preparation"]["terminals"] = copy(current["terminals"]);');
    const reset = preparation.indexOf('current["terminals"] = ({});');
    assert.ok(before >= 0 && before < unconscious && unconscious < after && after < terminals && terminals < reset);
    assert.ok(perform.indexOf('players[0]->start_observation(0);') > measurementStart);
    assert.ok(perform.indexOf('players[1]->start_observation(1);', measurementStart) > measurementStart);
    assert.ok(flat(perform).includes('result = players[0]->force_me(action); current["command_accepted"] = result;'));
    assert.doesNotMatch(perform, /->query_action\s*\(/);
    for (const name of ['observe_attack', 'observe_direct', 'observe_selected_action', 'begin_passive', 'observe_passive'])
        assert.doesNotMatch(body(source, name), /"taohua-bihai"/, name + ' 未增添 BIHAI 专用攻击/被动路径');
    assert.doesNotMatch(source, /#include\s+"taohua_bihai[^"\n]*"/);
});
