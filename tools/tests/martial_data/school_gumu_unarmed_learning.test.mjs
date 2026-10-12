import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatEffects, schoolCombatMarkdown } from './school_combat_report.mjs';
import { validateExpectedOutcomes, validateRecord } from './execution.mjs';
import { gumuWeaponPracticeGain } from './school_gumu_weapon_learning_cases.mjs';
import { gumuUnarmedLearningProfiles, gumuUnarmedLearningFixtureRequirements, gumuUnarmedLearningConditions,
    gumuUnarmedLearningAllowed, gumuUnarmedLearningStrength, validateGumuUnarmedLearningRecord,
    gumuUnarmedLearningEffects } from './school_gumu_unarmed_learning_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory), cases = gumuUnarmedLearningConditions(catalog);
const pick = (skill, ability, level = 200, suffix = '') => {
    const c = cases.find(c => c.id === `school-gumu-unarmed-learning-${skill}-${ability}-l${level}${suffix ? '-' + suffix : ''}`);
    assert.ok(c, [skill, ability, level, suffix].join('/')); return c;
};
const accepted = (skill, ability, suffix, level = 200) => pick(skill, ability, level, suffix).parameters.expected === 'observed';

// Synthetic contract test rows only, never driver evidence or ledger input.
function row(c) {
    const p = c.parameters, fields = ['character', 'family/family_name', 'special_skill/wuxing',
        'tattoo/tattoo_str', 'reborn/str', 'env/no_learn', 'doing'];
    const before = [p.actor, p.target].map((cfg, side) => {
        const slot = cfg.equipment?.slot, apply = { armor: 100, ...(slot === 'weapon' ? { damage: 50, dodge: -1 } : {}) };
        for (const [k, v] of Object.entries(cfg.temp ?? {})) if (k.startsWith('apply/')) apply[k.slice(6)] = v;
        const details = slot ? { object: '/tests/sword#' + side, program: '/tests/sword', skill_type: 'sword',
            weight: 3000, damage: 50, flag: 4 } : {};
        const state = {
            object: '/tests/actor#' + side, qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
            max_jing: 10000, neili: 6000, max_neili: 6000, str: 30, int: 30, con: 30, dex: 30,
            jingli: null, learned_points: null, gender: '男性', combat_exp: 10000000, potential: 10000,
            userp: 1, playerp: 1, interactive: 1, wizardp: 0, busy: cfg.busy ?? null,
            skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {},
            cultivation: Object.fromEntries(fields.map(k => [k, cfg.properties[k] ?? null])),
            temp: { apply, ...(slot ? { [slot]: details.object } : {}) },
            weapon: slot === 'weapon' ? 'sword' : 'none', weapon_details: slot === 'weapon' ? details : {},
            secondary_weapon: slot === 'secondary_weapon' ? 'sword' : 'none',
            secondary_weapon_details: slot === 'secondary_weapon' ? details : {},
            weapon_damage: slot === 'weapon' ? 50 : 0, weapon_flag: slot === 'weapon' ? 4 : 0,
            effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k,
                Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (apply[k] ?? 0)])),
            effective_str: gumuUnarmedLearningStrength({ ...cfg, properties: { str: 30, ...cfg.properties } }),
            effective_int: (cfg.properties.int ?? 30) + Math.trunc((cfg.skills.literate ?? 0) / 10),
        };
        for (const [k, v] of Object.entries(cfg.properties)) if (!fields.includes(k)) state[k] = v;
        return state;
    });
    const r = { kind: 'sample', condition_id: c.id, method: c.method, elapsed: 0.01,
        before, immediate: structuredClone(before), metrics: [{}, {}],
        unarmed_learning_room: Object.fromEntries(['no_fight', 'pigging', 'practice_improve'].map(k => [k, p.room[k] ?? null])),
        attacks: [], launches: [], callbacks: [], terminals: [], interfaces: [], outcome: p.expected,
        reason: p.expected === 'refused' ? '原入口拒绝' : '', command_accepted: c.method === 'interface' ? 1 : p.command_return };
    const n = c.method === 'practice' ? p.completed : p.ability === 'practice_skill' ? Number(p.expected === 'observed') : 0;
    r.immediate[0].qi -= n * p.costs.qi; r.immediate[0].neili -= n * p.costs.neili;
    if (n) r.metrics[0] = { qi_cost: n * p.costs.qi, neili_cost: n * p.costs.neili };
    if (c.method === 'practice' && n) r.immediate[0].learned[p.skill] = n * gumuWeaponPracticeGain(p);
    if (c.method === 'interface') r.interfaces.push({ ...p.interface,
        result: Number(gumuUnarmedLearningAllowed(p)), implemented_by: p.interface.object });
    r.after = structuredClone(r.immediate);
    return r;
}

test('六门徒手学习练习按原矩阵注册，ID与来源闭合且18条副手经公共校验', () => {
    assert.equal(gumuUnarmedLearningProfiles.length, 6); assert.equal(gumuUnarmedLearningFixtureRequirements.length, 3);
    assert.equal(cases.length, 349); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 698);
    assert.equal(cases.filter(c => c.method === 'interface').length, 207);
    assert.equal(cases.filter(c => c.method === 'practice').length, 142);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const all = schoolCombatConditions(catalog), registered = new Set(all.map(c => c.id));
    const smoke = gumuUnarmedLearningConditions(catalog, { smoke: true });
    assert.equal(smoke.length, cases.length);
    const hash = conditions => createHash('sha256').update(JSON.stringify(conditions)).digest('hex');
    assert.equal(hash(cases), 'e1c18d79fc491fc3f1497dedf44d213ba607db1c4f6d5c80ab0039a38dff863b');
    assert.equal(hash(smoke), 'ce43fa76cb7b8adb65eb3ef00f990ff3a20ecd319785b6e0d083a1b2512b6fa3');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-unarmed-learning'), cases);
    assert.deepEqual(schoolCombatConditions(catalog, { smoke: true }).filter(c =>
        c.parameters.collection_group === 'gumu-unarmed-learning'), smoke);
    assert.equal(cases.filter(c => c.parameters.actor.equipment?.slot === 'secondary_weapon').length, 18);
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    for (const [i, c] of cases.entries()) {
        assert.ok(registered.has(c.id)); assert.equal(c.samples, 2); assert.equal(smoke[i].samples, 1);
        assert.deepEqual(smoke[i].parameters, c.parameters);
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        for (const s of Object.keys(c.parameters.actor.skills)) assert.ok(catalog.skills.some(d => d.id === s), s);
        const r = row(c); assert.ok(!Object.hasOwn(r, 'parameters')); validateGumuUnarmedLearningRecord(r, c);
        validateRecord(r, c); validateSchoolCombatRecord(r, c);
    }
});

test('新增徒手组不改变旧15029条件的完整正式及烟雾JSON', () => {
    for (const [smoke, samples, hash] of [
        [false, 395880, '0d94c424298d41621d29c1ba90119e153155b6e1e52e7157d7bfbf4b6e000a2c'],
        [true, 25190, 'f84ef0e6d57f7bf9397e36ff0a2f1c0d6d7ce6895dff8ed5e50e8c79186e2e02'],
    ]) {
        const all = schoolCombatConditions(catalog, { smoke }).slice(0, 15378), old = all.filter(c =>
            c.parameters.collection_group !== 'gumu-unarmed-learning');
        assert.equal(old.length, 15029); assert.equal(old.reduce((n, c) => n + c.samples, 0), samples);
        assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'), hash);
        assert.equal(all.length, 15378); assert.equal(all.reduce((n, c) => n + c.samples, 0), smoke ? 25539 : 396578);
    }
});

test('主副手均阻止学习但原直接练习不查持器，完整practice仍先查学习资格', () => {
    for (const [skill] of gumuUnarmedLearningProfiles) for (const slot of ['weapon', 'secondary_weapon']) {
        assert.equal(accepted(skill, 'valid_learn', slot), false);
        assert.equal(accepted(skill, 'practice', slot), false);
        assert.ok(accepted(skill, 'practice_skill', slot));
        const c = pick(skill, 'practice_skill', 200, slot), r = row(c);
        assert.equal(r.before[0][slot], 'sword'); assert.equal(r.before[0][slot === 'weapon' ? 'secondary_weapon' : 'weapon'], 'none');
        assert.equal(c.parameters.actor.equipment.slot, slot);
    }
});

test('正式建档入口接受徒手完整计划，旧中文ID仍拒绝且仅60个后缀更名', () => {
    const legacySuffixes = { male: '男性', female: '女性', guangming: '光明磊落', jiaoxia: '狡黠多变',
        xinhen: '心狠手辣', yinxian: '阴险奸诈' };
    const execution = { kind: 'unit-test-no-driver', fixture_sha256: 'a'.repeat(64) };
    for (const [smoke, legacyHash] of [[false, '31b18680c1ea45fdbefeeebb20f2d6f4d5234be1164ec7f7c96b4b5d82fdc352'],
        [true, 'fea42f75e0d3812b926c43616995f06f229486789973264e8f34fb1b9d604275']]) {
        const conditions = gumuUnarmedLearningConditions(catalog, { smoke });
        const legacy = conditions.map(c => ({ ...c,
            id: c.id.replace(/-(male|female|guangming|jiaoxia|xinhen|yinxian)$/, (_, suffix) => '-' + legacySuffixes[suffix]) }));
        assert.equal(legacy.filter((c, i) => c.id !== conditions[i].id).length, 60);
        assert.equal(createHash('sha256').update(JSON.stringify(legacy)).digest('hex'), legacyHash,
            '反向还原仅ID即可重现原完整矩阵，参数、入口和样本不得改变');
        const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-unarmed-learning-ledger-test-'));
        const manifest = createSeries(directory, { inventory, catalog, conditions, execution });
        assert.deepEqual(manifest.identity.conditions, conditions);
        assert.deepEqual(openSeries(directory, manifest.identity), JSON.parse(JSON.stringify(manifest)));
        const changedIdentity = structuredClone(manifest.identity);
        changedIdentity.conditions[0].samples++;
        assert.throws(() => openSeries(directory, changedIdentity), /源码、字典、驱动、夹具或参数不同/);
        assert.ok(existsSync(join(directory, 'series.json'))); assert.ok(!existsSync(join(directory, 'runs')));
        const rejected = mkdtempSync(join(tmpdir(), 'mud-gumu-unarmed-learning-invalid-id-test-'));
        assert.throws(() => createSeries(rejected, { inventory, catalog, conditions: legacy, execution }),
            /条件 ID 使用小写字母/);
        assert.ok(!existsSync(join(rejected, 'series.json'))); assert.ok(!existsSync(join(rejected, 'samples')));
    }
});

test('性别、性格依原函数，美女拳不额外要求女性，黯然不附加教师特有条件', () => {
    for (const [skill] of gumuUnarmedLearningProfiles) for (const [suffix, gender] of [['male', '男性'], ['female', '女性']]) {
        assert.equal(accepted(skill, 'valid_learn', suffix), skill !== 'sad-strike' || gender === '男性');
        assert.equal(accepted(skill, 'practice', suffix), skill !== 'sad-strike' || gender === '男性');
        assert.ok(accepted(skill, 'practice_skill', suffix));
    }
    for (const [suffix, character] of [['guangming', '光明磊落'], ['jiaoxia', '狡黠多变'],
        ['xinhen', '心狠手辣'], ['yinxian', '阴险奸诈']]) {
        assert.equal(accepted('wudu-shenzhang', 'valid_learn', suffix), character === '心狠手辣');
        assert.equal(accepted('sad-strike', 'valid_learn', suffix), ['光明磊落', '狡黠多变'].includes(character));
        for (const skill of ['wudu-shenzhang', 'sad-strike']) assert.ok(accepted(skill, 'practice_skill', suffix));
    }
    for (const [skill] of gumuUnarmedLearningProfiles) assert.ok(accepted(skill, 'practice', 'other-family'));
    const p = pick('sad-strike', 'valid_learn').parameters;
    assert.ok(gumuUnarmedLearningAllowed(p)); assert.equal(p.actor.properties.married, undefined);
});

test('有效内功与容量门槛分开，基本功相等可学却不能完整练习', () => {
    for (const [skill, , force, max, basic] of gumuUnarmedLearningProfiles) {
        assert.equal(accepted(skill, 'valid_learn', 'force' + (force - 1)), false);
        assert.ok(accepted(skill, 'valid_learn', 'force' + force));
        if (max) { assert.equal(accepted(skill, 'valid_learn', 'max' + (max - 1)), false); assert.ok(accepted(skill, 'valid_learn', 'max' + max)); }
        else assert.ok(accepted(skill, 'valid_learn', 'max0'));
        if (basic) { assert.equal(accepted(skill, 'valid_learn', 'floor' + (basic - 1), 1), false); assert.ok(accepted(skill, 'valid_learn', 'floor' + basic, 1)); }
        assert.equal(accepted(skill, 'valid_learn', 'basic199'), false); assert.ok(accepted(skill, 'valid_learn', 'basic200'));
        assert.equal(accepted(skill, 'practice', 'equal-basic'), false);
    }
});

test('黯然先天资质不能用有效加成代替，膂力取最高基本徒手而不是总和', () => {
    for (const attr of ['str', 'int']) {
        assert.equal(accepted('sad-strike', 'valid_learn', attr + '33'), false);
        assert.ok(accepted('sad-strike', 'valid_learn', attr + '34'));
        assert.ok(accepted('sad-strike', 'practice_skill', attr + '33'));
    }
    assert.equal(accepted('sad-strike', 'valid_learn', 'high-effective-low-raw'), false);
    for (const ability of ['valid_learn', 'practice']) {
        assert.equal(accepted('sad-strike', ability, 'effective-str44'), false);
        assert.ok(accepted('sad-strike', ability, 'effective-str45'));
        for (const suffix of ['tattoo-tattoo_str', 'reborn-str', 'apply-str', 'highest-basic']) assert.ok(accepted('sad-strike', ability, suffix));
    }
    assert.equal(gumuUnarmedLearningStrength(pick('sad-strike', 'valid_learn', 200, 'highest-basic').parameters.actor), 45);
    assert.ok(accepted('sad-strike', 'practice_skill', 'effective-str44'));
});

test('六门费用与门槛分别记账，冰火49和50级仅气血费用变化', () => {
    for (const [skill, , , , , qi, neili, qiCost, neiliCost] of gumuUnarmedLearningProfiles) {
        assert.equal(accepted(skill, 'practice_skill', 'qi' + (qi - 1)), false);
        assert.equal(accepted(skill, 'practice_skill', 'neili' + (neili - 1)), false);
        assert.equal(row(pick(skill, 'practice_skill', 200, 'qi' + qi)).immediate[0].qi, qi - qiCost);
        assert.equal(row(pick(skill, 'practice_skill', 200, 'neili' + neili)).immediate[0].neili, neili - neiliCost);
        for (const suffix of ['partial-qi', 'partial-neili']) {
            const c = pick(skill, 'practice', 200, suffix), r = row(c);
            assert.equal(c.parameters.completed, 2); assert.equal(r.command_accepted, 0); assert.equal(r.outcome, 'observed');
            assert.equal(r.immediate[0].learned[skill], 2 * gumuWeaponPracticeGain(c.parameters));
        }
        assert.deepEqual(row(pick(skill, 'practice_skill')).immediate[0].learned, {});
    }
    for (const ability of ['practice_skill', 'practice']) for (const level of [49, 50]) {
        const c = pick('fireice-strike', ability, level), r = row(c);
        assert.equal(c.parameters.costs.qi, level === 49 ? 30 : 50);
        assert.equal(r.immediate[0].neili, 10000 - 54);
    }
});

test('完整命令保留练习分段、修养加成、环境例外和招架映射，不替代原命令', () => {
    const gain = (l = 200, suffix = '') => gumuWeaponPracticeGain(pick('meinv-quan', 'practice', l, suffix).parameters);
    assert.deepEqual([200, 299, 300, 400, 499, 500, 800].map(l => gain(l)), [12, 13, 7, 7, 7, 3, 3]);
    assert.equal(gain(200, 'int9'), 23); assert.equal(gain(200, 'literate500'), 12);
    assert.equal(gain(200, 'wuxing'), 14); assert.equal(gain(200, 'cognize500'), 23); assert.equal(gain(200, 'room50'), 18);
    for (const [skill, usage] of gumuUnarmedLearningProfiles) {
        const p = pick(skill, 'practice', 200, 'parry').parameters;
        assert.equal(p.actor.mappings.parry, skill); assert.equal(p.actor.mappings[usage], undefined); assert.equal(p.expected, 'observed');
    }
    for (const suffix of ['busy', 'fighting', 'unmapped', 'no-fight', 'pigging', 'times0', 'times51', 'no-learn', 'low-exp'])
        assert.equal(accepted('meinv-quan', 'practice', suffix), false);
    assert.ok(accepted('meinv-quan', 'practice', 'scheme'));
});

test('校验拒绝丢失身份、实际属性、持器、资源、进度与原入口归属的轨迹', () => {
    const c = pick('sad-strike', 'practice');
    for (const mutate of [r => r.before[0].wizardp = 1, r => r.immediate[0].playerp = 0,
        r => delete r.before[0].cultivation.character, r => r.before[0].str++, r => r.before[0].effective_str++,
        r => delete r.before[0].secondary_weapon, r => r.immediate[0].weapon = 'sword', r => r.unarmed_learning_room.no_fight = 1,
        r => r.before[0].effective_skills.force++, r => r.immediate[0].neili++, r => r.immediate[1].qi++,
        r => r.immediate[0].learned['sad-strike']++, r => r.metrics[0] = null,
        r => r.metrics[0].direct = null, r => r.metrics[0].heartbeats = 1, r => r.callbacks.push({}),
        r => r.immediate[0].object = '/tests/unrelated#123', r => r.after[0].qi++, r => delete r.method,
        r => delete r.unarmed_learning_room.practice_improve, r => r.before[0].learned['sad-strike'] = null,
        r => r.metrics[0].qi_cost++, r => r.metrics[0].qi_recovery = 1, r => r.metrics[1].neili_cost = 1]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuUnarmedLearningRecord(r, c));
    }
    const direct = pick('meinv-quan', 'practice_skill'), r = row(direct);
    r.interfaces[0].implemented_by = '/inherit/skill/skill';
    assert.throws(() => validateGumuUnarmedLearningRecord(r, direct));
});

test('显式空闲和未设属性可为空，缺项及错误字段归属不能冒充正常快照', () => {
    const c = pick('meinv-quan', 'practice'), baseline = row(c);
    assert.equal(baseline.before[0].busy, null); assert.equal(baseline.before[1].jingli, null);
    validateGumuUnarmedLearningRecord(baseline, c);
    for (const mutate of [r => delete r.before[0].busy, r => r.before[0].busy = '0',
        r => delete r.before[1].jingli, r => r.before[0].qi = null, r => delete r.before[0].cultivation.character,
        r => r.before[0].cultivation['family/family_name'] = null, r => r.before[0].temp.apply.armor = null,
        r => r.metrics[0].qi_cost = null]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuUnarmedLearningRecord(r, c));
    }
    const scheme = pick('meinv-quan', 'practice', 200, 'scheme'), r = row(scheme);
    assert.equal(r.before[0].cultivation.doing, 'scheme'); assert.equal(r.before[0].doing, undefined);
    r.before[0].doing = r.before[0].cultivation.doing; delete r.before[0].cultivation.doing;
    assert.throws(() => validateGumuUnarmedLearningRecord(r, scheme));
});

test('副手诊断记录保留真实槽位，不获取主手属性或伪造主手证据', () => {
    const secondary = pick('meinv-quan', 'practice_skill', 200, 'secondary_weapon'), baseline = row(secondary);
    assert.deepEqual(baseline.before[0].weapon_details, {}); assert.equal(baseline.before[0].weapon_damage, 0);
    assert.deepEqual(baseline.before[0].temp.apply, { armor: 100 });
    validateGumuUnarmedLearningRecord(baseline, secondary);
    validateRecord(baseline, secondary); validateSchoolCombatRecord(baseline, secondary);
    const foreign = structuredClone(secondary); foreign.parameters.collection_group = 'other-group';
    assert.throws(() => validateRecord(baseline, foreign), '副手诊断只为本组接入，其他组仍按原主手契约');
    for (const mutate of [r => r.before[0].secondary_weapon_details.program = '/tests/other',
        r => r.before[0].secondary_weapon_details.weight = 1, r => r.before[0].temp.secondary_weapon = '/tests/unrelated#123',
        r => r.before[0].weapon_details = r.before[0].secondary_weapon_details,
        r => r.before[0].temp.apply.damage = 50, r => r.before[0].temp.apply.dodge = -1,
        r => r.before[0].weapon_damage = 50, r => delete r.immediate[0].secondary_weapon_details]) {
        const r = row(secondary); mutate(r); assert.throws(() => validateGumuUnarmedLearningRecord(r, secondary));
    }
    const primary = pick('meinv-quan', 'practice_skill', 200, 'weapon'), r = row(primary);
    assert.deepEqual(r.before[0].temp.apply, { armor: 100, damage: 50, dodge: -1 });
    delete r.before[0].temp.apply.dodge;
    assert.throws(() => validateGumuUnarmedLearningRecord(r, primary));
});

test('强弱膂力和先天悟性依实际快照，不让有效加成或熟练度代替原门槛', () => {
    for (const suffix of ['effective-str44', 'effective-str45', 'highest-basic', 'high-effective-low-raw']) {
        const c = pick('sad-strike', 'valid_learn', 200, suffix), r = row(c);
        assert.equal(r.before[0].temp.apply.str, c.parameters.actor.temp['apply/str']);
        r.before[0].temp.apply.str++;
        assert.throws(() => validateGumuUnarmedLearningRecord(r, c));
    }
    const c = pick('meinv-quan', 'practice', 200, 'literate500'), r = row(c);
    assert.equal(r.before[0].int, 36); assert.equal(r.before[0].effective_int, 86);
    r.before[0].effective_int = 36;
    assert.throws(() => validateGumuUnarmedLearningRecord(r, c));
});

test('效果统计使用冻结条件，区分资格、直接练习、部分完成及未知计量', () => {
    const effects = c => gumuUnarmedLearningEffects([{ outcome: c.parameters.expected, raw: row(c) }], c);
    const q = pick('sad-strike', 'valid_learn', 200, 'female'), direct = pick('fireice-strike', 'practice_skill', 49);
    assert.equal(effects(q).qualification_allowed, 0); assert.equal(effects(q).command_accepted, null);
    assert.equal(effects(direct).qualification_allowed, null); assert.equal(effects(direct).learned_gain.mean, 0);
    assert.equal(effects(direct).qi_cost.mean, 30); assert.equal(effects(direct).neili_cost.mean, 54);
    assert.equal(effects(direct).completed_repetitions.mean, 1);
    const partial = pick('meinv-quan', 'practice', 200, 'partial-qi'), raw = row(partial);
    const e = effects(partial);
    assert.equal(e.partial_practice, 1); assert.equal(e.command_accepted, 0);
    assert.equal(e.completed_repetitions.mean, 2); assert.equal(e.learned_gain.mean, 24);
    const missing = gumuUnarmedLearningEffects([{ outcome: 'observed', raw }]);
    assert.equal(missing.ability, 'unknown_ability'); assert.equal(missing.learned_gain.unknown, 1);
    assert.equal(missing.completed_repetitions.unknown, 1);
    const unknown = row(partial); unknown.metrics[0].qi_cost = null; unknown.immediate[0].learned['meinv-quan'] = null;
    const result = gumuUnarmedLearningEffects([{ outcome: 'observed', raw: unknown }, { outcome: 'error', raw: {} }], partial);
    assert.equal(result.errors, 1); assert.equal(result.attempts, 1);
    assert.equal(result.qi_cost.unknown, 1); assert.equal(result.learned_gain.unknown, 1);
    assert.equal(result.completed_repetitions.unknown, 1);
});

test('原六门主副手检查与费用常数仍存在，已登记的文本与互备错误不改', () => {
    const source = id => readFileSync(join(root, `kungfu/skill/${id}.c`), 'utf8');
    for (const [skill, , , , , , , qi, neili] of gumuUnarmedLearningProfiles) {
        const text = source(skill);
        assert.ok(text.includes('query_temp("secondary_weapon")'), skill);
        assert.ok(text.includes(`receive_damage("qi", ${qi})`), skill);
        assert.ok(text.includes(`add("neili", -${neili})`), skill);
    }
    assert.match(source('fireice-strike'), /query_skill\("fireice-strike", 1\) < 50/);
    assert.ok(source('fireice-strike').includes('receive_damage("qi", 30)'));
    assert.ok(source('meinv-quan').includes('vliad_combine'));
    assert.ok(source('tianluo-diwang').includes('水平水平'));
    assert.ok(source('sad-strike').includes('黯然消魂掌'));
});

test('共享准备仅读本组真实字段、保留诊断槽位并清理场地，不改兵器属性', () => {
    const read = path => readFileSync(join(root, path), 'utf8');
    const runner = read('tools/tests/martial_data/runner.lpc').replace(/\s+/g, ' ');
    assert.match(runner, /"gumu-unarmed-learning"\) \{ result\["effective_int"\] = ob->query_int\(\); foreach \(key in \(\{ "character", "tattoo\/tattoo_str", "reborn\/str", "env\/no_learn", "doing" \}\)\)/);
    assert.ok(runner.includes('result["secondary_weapon_details"] = equipment_snapshot(secondary);'));
    assert.match(runner, /"gumu-unarmed-learning" && side == 0 && key == "apply\/str"/);
    assert.match(runner, /"gumu-unarmed-learning" && side == 0 && config\["equipment"\]\["type"\] == "sword" && !config\["equipment"\]\["hold"\] && member_array\(config\["equipment"\]\["slot"\], \(\{ "weapon", "secondary_weapon" \}\)\) != -1/);
    const secondary = runner.slice(runner.indexOf('else if (config["equipment"]["slot"] == "secondary_weapon")'),
        runner.indexOf('else require(weapon->wield()'));
    assert.ok(secondary.includes('ob->set_temp("secondary_weapon", weapon);'));
    assert.ok(secondary.includes('!ob->query_temp("weapon")'));
    assert.doesNotMatch(secondary, /weapon->wield\(|weapon->set\(|apply\//);
    const start = runner.indexOf('if (parameters["collection_group"] == "gumu-unarmed-learning")');
    assert.ok(start > runner.indexOf('delete(room_key);', runner.indexOf('void perform_sample()')));
    const room = runner.slice(start, runner.indexOf('prepare_actor(0, parameters["actor"]);', start));
    for (const key of ['no_fight', 'pigging', 'practice_improve']) assert.ok(room.includes(`"${key}": query("${key}")`));
    assert.match(runner, /\(\{ "gumu-movement", "gumu-weapon-learning", "gumu-unarmed-learning" \}\)\) != -1\) current\["interfaces"\]\[<1\]\["implemented_by"\] = function_exists/);
    const execution = read('tools/tests/martial_data/execution.mjs');
    for (const name of ['school_gumu_unarmed_learning_cases.mjs', 'school_gumu_weapon_learning_cases.mjs'])
        assert.ok(execution.includes(`'tools/tests/martial_data/${name}'`));
    assert.ok(read('tools/tests/martial_data/school_combat_report.mjs').includes(
        'condition.gumu_unarmed_learning = gumuUnarmedLearningEffects(rows.filter(r => r.condition_id === condition.id), condition);'));
});

test('五毒与黯然用已有基本掌法拳脚预加载，清临时激发后恢复冻结配置', () => {
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8').replace(/\s+/g, ' ');
    const start = runner.indexOf('if (!side && current["parameters"]["collection_group"] == "gumu-unarmed-learning"');
    const preparation = runner.slice(start, runner.indexOf('foreach (key, value in config["preparations"]', start));
    assert.ok(preparation.includes('load_usage = key == "wudu-shenzhang" ? "strike" : "unarmed";'));
    assert.match(preparation, /ob->force_me\(current\["skill_load_context"\]\["command"\]\).*?ob->map_skill\(load_usage\); \} foreach \(key, value in config\["mappings"\]/);
    assert.doesNotMatch(preparation, /set_skill\(|enable parry/);
    for (const [skill, usage] of [['wudu-shenzhang', 'strike'], ['sad-strike', 'unarmed']]) {
        const original = readFileSync(join(root, `kungfu/skill/${skill}.c`), 'utf8');
        assert.ok(original.includes(`usage == "${usage}"`));
        for (const c of cases.filter(c => c.parameters.skill === skill)) {
            assert.ok(c.parameters.actor.skills[usage] > 0, c.id);
            assert.ok(c.parameters.actor.skills[skill] > 0, c.id);
        }
        assert.equal(pick(skill, 'valid_learn').parameters.actor.skills.parry, undefined);
        assert.equal(pick(skill, 'practice', 200, 'parry').parameters.actor.mappings[usage], undefined);
    }
});

test('徒手报告按三入口分列，保留诊断边界且不混入伤害或重复练习表', () => {
    const selected = [pick('sad-strike', 'valid_learn', 200, 'female'),
        pick('fireice-strike', 'practice_skill', 49), pick('meinv-quan', 'practice', 200, 'partial-qi')];
    const conditions = selected.map(c => ({ ...c,
        counts: { observed: Number(c.parameters.expected === 'observed'), refused: Number(c.parameters.expected === 'refused') },
        effects: schoolCombatEffects([{ outcome: c.parameters.expected, raw: row(c) }]),
        gumu_unarmed_learning: gumuUnarmedLearningEffects([{ outcome: c.parameters.expected, raw: row(c) }], c),
        ...(c.method === 'practice' ? { practice: {} } : {}),
    }));
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-not-a-series', evidence_sha256: 'synthetic',
        totals: { conditions: 3, samples: 3, observed: 2, refused: 1, errors: 0 }, conditions });
    const start = markdown.indexOf('## 古墓徒手学习与练习');
    assert.ok(start > 0); assert.ok(!markdown.slice(0, start).includes('school-gumu-unarmed-learning-'));
    for (const title of ['### 学习资格', '### 直接练习接口', '### 完整练习命令', '仅副手持剑为明确的隔离诊断状态'])
        assert.ok(markdown.includes(title));
    assert.ok(!markdown.includes('## 原命令练习：全部完成与部分进度分列'));
    assert.ok(!markdown.includes('## 古墓兵器学习与练习'));
    assert.ok(markdown.includes(`| ${selected[0].id} | 1/0 | 0.00/0.00 |`));
    assert.ok(markdown.includes(`| ${selected[1].id} | 1/0 | 1.00 | 0.00 | 30.00/54.00 |`));
    assert.ok(markdown.includes(`| ${selected[2].id} | 1/0 | 0/1 | 2.00 | 24.00 | 70.00/80.00 |`));
});
