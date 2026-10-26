import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatEffects, schoolCombatMarkdown } from './school_combat_report.mjs';
import { validateExpectedOutcomes, validateRecord } from './execution.mjs';
import { createSeries } from './ledger.mjs';
import { gumuWeaponLearningProfiles, gumuWeaponLearningFixtureRequirements, gumuWeaponLearningConditions,
    gumuWeaponLearningAllowed, gumuWeaponPracticeGain, validateGumuWeaponLearningRecord,
    gumuWeaponLearningEffects } from './school_gumu_weapon_learning_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory), cases = gumuWeaponLearningConditions(catalog);
const pick = (skill, ability, level = 200, suffix = '') => {
    const c = cases.find(c => c.id === `school-gumu-weapon-learning-${skill}-${ability}-l${level}${suffix ? '-' + suffix : ''}`);
    assert.ok(c, [skill, ability, level, suffix].join('/')); return c;
};
const accepted = (skill, ability, suffix, level = 200) => pick(skill, ability, level, suffix).parameters.expected === 'observed';

// Only exercises the collector's validation; never append these synthetic rows to a ledger.
function row(c) {
    const p = c.parameters, fields = ['character', 'family/family_name', 'special_skill/wuxing',
        'tattoo/tattoo_dex', 'reborn/dex', 'env/no_learn'];
    const before = [p.actor, p.target].map((cfg, side) => {
        const weapon = cfg.equipment, apply = { armor: 100, ...(weapon ? { damage: 50, dodge: -1 } : {}) };
        for (const [k, v] of Object.entries(cfg.temp ?? {})) if (k.startsWith('apply/')) apply[k.slice(6)] = v;
        const state = {
            object: '/tests/actor#' + side, qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
            max_jing: 10000, neili: 6000, max_neili: 6000, str: 30, int: 30, con: 30, dex: 30,
            jingli: null, learned_points: null, gender: '男性', combat_exp: 10000000, potential: 10000,
            userp: 1, playerp: 1, interactive: 1, wizardp: 0, busy: cfg.busy ?? null,
            skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {},
            cultivation: Object.fromEntries(fields.map(k => [k, cfg.properties[k] ?? null])),
            temp: { apply, ...(weapon ? { weapon: '/tests/' + weapon.type + '#' + side } : {}) },
            weapon: weapon?.type ?? 'none', weapon_details: weapon ? {
                object: '/tests/' + weapon.type + '#' + side, program: '/tests/' + weapon.type,
                skill_type: weapon.type, id: weapon.id, weight: 3000, damage: 50, flag: weapon.type === 'sword' ? 4 : 0,
            } : {}, weapon_damage: weapon ? 50 : 0, weapon_flag: weapon?.type === 'sword' ? 4 : 0,
            effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k,
                Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (apply[k] ?? 0)])),
            effective_dex: (cfg.properties.dex ?? 30) + Math.trunc((cfg.skills.dodge ?? 0) / 10)
                + (cfg.properties['tattoo/tattoo_dex'] ?? 0) + (cfg.properties['reborn/dex'] ?? 0) + (cfg.temp?.['apply/dex'] ?? 0),
            effective_int: (cfg.properties.int ?? 30) + Math.trunc((cfg.skills.literate ?? 0) / 10),
        };
        for (const [k, v] of Object.entries(cfg.properties)) if (!fields.includes(k)) state[k] = v;
        return state;
    });
    const r = { kind: 'sample', condition_id: c.id, method: c.method, elapsed: 0.01,
        before, immediate: structuredClone(before), metrics: [{}, {}],
        weapon_learning_room: Object.fromEntries(['no_fight', 'pigging', 'practice_improve',
            'can_practice_xiantie-jian', 'can_practice_xuantie-jian'].map(k => [k, p.room[k] ?? null])),
        attacks: [], launches: [], callbacks: [], terminals: [], interfaces: [], outcome: p.expected,
        reason: p.expected === 'refused' ? '原入口拒绝' : '', command_accepted: c.method === 'interface' ? 1 : p.command_return };
    const a = r.immediate[0], n = c.method === 'practice' ? p.completed : p.ability === 'practice_skill' ? Number(p.expected === 'observed') : 0;
    a.qi -= n * p.costs.qi; a.neili -= n * p.costs.neili;
    if (n) r.metrics[0] = { qi_cost: n * p.costs.qi, neili_cost: n * p.costs.neili };
    if (c.method === 'practice' && n) a.learned[p.skill] = n * gumuWeaponPracticeGain(p);
    if (c.method === 'interface') r.interfaces.push({ ...p.interface,
        result: Number(gumuWeaponLearningAllowed(p)), implemented_by: p.interface.object });
    r.after = structuredClone(r.immediate);
    return r;
}

test('九门兵器学习与练习按原矩阵注册，来源和ID闭合', () => {
    assert.equal(gumuWeaponLearningProfiles.length, 9); assert.equal(gumuWeaponLearningFixtureRequirements.length, 3);
    assert.equal(cases.length, 474); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 948);
    assert.equal(cases.filter(c => c.method === 'interface').length, 291);
    assert.equal(cases.filter(c => c.method === 'practice').length, 183);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const all = schoolCombatConditions(catalog), registered = new Set(all.map(c => c.id));
    const smoke = gumuWeaponLearningConditions(catalog, { smoke: true });
    assert.equal(smoke.length, cases.length);
    const hash = conditions => createHash('sha256').update(JSON.stringify(conditions)).digest('hex');
    assert.equal(hash(cases), '2f9d1291d9a1bafcbeeb23e066159b1e37ea6ec2d17c7f80c391fc2275fcc42d');
    assert.equal(hash(smoke), 'db27b591e5722813d6b4b3e8569df54fc5bedbe1f55f89c411e22e51255c1590');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-weapon-learning'), cases);
    assert.deepEqual(schoolCombatConditions(catalog, { smoke: true }).filter(c =>
        c.parameters.collection_group === 'gumu-weapon-learning'), smoke);
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    for (const [i, c] of cases.entries()) {
        assert.ok(registered.has(c.id)); assert.equal(c.samples, 2); assert.equal(smoke[i].samples, 1);
        assert.deepEqual(smoke[i].parameters, c.parameters);
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        for (const s of Object.keys(c.parameters.actor.skills)) assert.ok(catalog.skills.some(d => d.id === s), s);
        const r = row(c); assert.ok(!Object.hasOwn(r, 'parameters')); validateRecord(r, c); validateGumuWeaponLearningRecord(r, c);
        validateSchoolCombatRecord(r, c);
    }
});

test('注册后旧14555条件的完整正式及冒烟JSON指纹不变', () => {
    for (const [smoke, count, samples, hash] of [
        [false, 14555, 394932, '894229e34b2f5c85286df2ee0e9f0ebf66e1c844dad178344518f97dbf59209d'],
        [true, 14555, 24716, '271c497e6e61a252b0a5a232075506875aaf9c0f7a48325204ceb77c8b6ef773'],
    ]) {
        const all = schoolCombatConditions(catalog, { smoke }).slice(0, 15029), old = all.filter(c =>
            !['gumu-weapon-learning', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
        assert.equal(old.length, count); assert.equal(old.reduce((n, c) => n + c.samples, 0), samples);
        assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'), hash);
        assert.equal(all.length, 15029);
        assert.equal(all.reduce((n, c) => n + c.samples, 0), smoke ? 25190 : 395880);
    }
});

test('正式建档入口接受两份完整计划，旧中文ID仍拒绝且仅24个后缀更名', () => {
    const legacySuffixes = { guangming: '光明磊落', jiaoxia: '狡黠多变', xinhen: '心狠手辣', yinxian: '阴险奸诈' };
    const execution = { kind: 'unit-test-no-driver', fixture_sha256: 'a'.repeat(64) };
    for (const [smoke, legacyHash] of [[false, 'a380f2b15154795a32067b400e9f14ef8727375829c78bf91389618614d6eed2'],
        [true, '81c4ac34beb61885555ad1df836f392641d4b4939229a21a9944f970525da2ed']]) {
        const conditions = gumuWeaponLearningConditions(catalog, { smoke });
        const legacy = conditions.map(c => ({ ...c,
            id: c.id.replace(/-(guangming|jiaoxia|xinhen|yinxian)$/, (_, suffix) => '-' + legacySuffixes[suffix]) }));
        assert.equal(legacy.filter((c, i) => c.id !== conditions[i].id).length, 24);
        assert.equal(createHash('sha256').update(JSON.stringify(legacy)).digest('hex'), legacyHash,
            '反向还原仅ID即可重现原完整矩阵，参数、入口和样本不得改变');
        const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-weapon-learning-ledger-test-'));
        const manifest = createSeries(directory, { inventory, catalog, conditions, execution });
        assert.deepEqual(manifest.identity.conditions, conditions);
        assert.ok(existsSync(join(directory, 'series.json'))); assert.ok(!existsSync(join(directory, 'runs')));
        const rejected = mkdtempSync(join(tmpdir(), 'mud-gumu-weapon-learning-invalid-id-test-'));
        assert.throws(() => createSeries(rejected, { inventory, catalog, conditions: legacy, execution }),
            /条件 ID 使用小写字母/);
        assert.ok(!existsSync(join(rejected, 'series.json'))); assert.ok(!existsSync(join(rejected, 'samples')));
    }
});

test('玉女学习依原素心等级，自己的高等级不能改变该比较；完整练习仍查自己基本功', () => {
    for (const ability of ['valid_learn', 'practice_skill', 'practice']) {
        assert.ok(accepted('yunv-jian', ability, 'suxin201'));
        assert.equal(accepted('yunv-jian', ability, 'suxin202'), ability === 'practice_skill');
        assert.equal(accepted('yunv-jian', ability, 'own800-basic201', 800), ability !== 'practice');
    }
    assert.ok(accepted('yunv-jian', 'valid_learn', 'basic199'));
    assert.equal(accepted('suxin-jian', 'valid_learn', 'basic199'), false);
});

test('性别、先天资质与性格只依原学习检查，直接练习不是已通过这些资格的证明', () => {
    for (const skill of ['suxin-jian', 'yinsuo-jinling']) {
        assert.equal(accepted(skill, 'valid_learn', 'male'), false);
        assert.equal(accepted(skill, 'practice', 'male'), false);
        assert.ok(accepted(skill, 'practice_skill', 'male'));
    }
    for (const [skill, attr, floor] of [['suxin-jian', 'int', 28], ['yinsuo-jinling', 'dex', 28],
        ['xuantie-jian', 'int', 34], ['xuantie-jian', 'str', 34]]) {
        assert.equal(accepted(skill, 'valid_learn', attr + (floor - 1)), false);
        assert.ok(accepted(skill, 'valid_learn', attr + floor));
    }
    assert.equal(accepted('sanwu-shou', 'valid_learn', 'guangming'), false);
    assert.ok(accepted('sanwu-shou', 'valid_learn', 'xinhen'));
    assert.equal(accepted('xuantie-jian', 'valid_learn', 'xinhen'), false);
    assert.ok(accepted('xuantie-jian', 'valid_learn', 'jiaoxia'));
});

test('玄铁学习不检查持器或练功地点，练习使用原xiantie场地键与物品ID', () => {
    for (const suffix of ['wrong-room', 'wrong-id', 'weapon-none']) {
        assert.ok(accepted('xuantie-jian', 'valid_learn', suffix));
        assert.equal(accepted('xuantie-jian', 'practice_skill', suffix), false);
        assert.equal(accepted('xuantie-jian', 'practice', suffix), false);
    }
    const p = pick('xuantie-jian', 'practice').parameters;
    assert.equal(p.room['can_practice_xiantie-jian'], 1); assert.equal(p.actor.equipment.id, 'xuantie jian');
    assert.equal(accepted('xuantie-jian', 'valid_learn', 'force199'), false);
    assert.ok(accepted('xuantie-jian', 'valid_learn', 'force200'));
    assert.equal(accepted('xuantie-jian', 'valid_learn', 'martial-cognize219'), false);
    assert.ok(accepted('xuantie-jian', 'valid_learn', 'martial-cognize220'));
});

test('两门针法读取有效轻功与身法，练习不强行要求针具也不消耗弹药', () => {
    for (const [skill, dodge, dex] of [['bingpo-shenzhen', 100, 34], ['yufeng-zhen', 80, 26]]) {
        assert.equal(accepted(skill, 'valid_learn', 'dodge' + (dodge - 1)), false);
        assert.ok(accepted(skill, 'valid_learn', 'dodge' + dodge));
        assert.equal(accepted(skill, 'valid_learn', 'effective-dex' + (dex - 1)), false);
        assert.ok(accepted(skill, 'valid_learn', 'effective-dex' + dex));
        for (const suffix of ['tattoo-tattoo_dex', 'reborn-dex', 'apply-dex']) assert.ok(accepted(skill, 'valid_learn', suffix));
        for (const ability of ['valid_learn', 'practice_skill', 'practice']) {
            assert.ok(accepted(skill, ability, 'weapon-none')); assert.ok(accepted(skill, ability, 'weapon-sword'));
        }
    }
});

test('练习门槛与扣费、部分完成与原命令返回各自记录，不把拒绝时已得进度抹去', () => {
    for (const d of gumuWeaponLearningProfiles) {
        const [skill, , , , , , qi, neili, qiCost, neiliCost] = d;
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
});

test('公共练习分段、先天悟性与修养加成保留；招架练习不要求把主类别也激发', () => {
    const gain = (level = 200, suffix = '') => gumuWeaponPracticeGain(pick('yunv-jian', 'practice', level, suffix).parameters);
    assert.deepEqual([200, 299, 300, 400, 499, 500, 800].map(l => gain(l)), [12, 13, 7, 7, 7, 3, 3]);
    assert.equal(gain(200, 'literate500'), 12); assert.equal(gain(200, 'int9'), 23);
    const literate = row(pick('yunv-jian', 'practice', 200, 'literate500'));
    assert.equal(literate.before[0].int, 36); assert.equal(literate.before[0].effective_int, 86);
    assert.equal(gain(200, 'wuxing'), 14); assert.equal(gain(200, 'cognize500'), 23); assert.equal(gain(200, 'room50'), 18);
    assert.equal(gumuWeaponPracticeGain(pick('xuantie-jian', 'practice').parameters), 17);
    for (const [skill, usage] of gumuWeaponLearningProfiles.filter(d => d[1] !== 'throwing')) {
        const p = pick(skill, 'practice', 200, 'parry').parameters;
        assert.equal(p.actor.mappings.parry, skill); assert.equal(p.actor.mappings[usage], undefined); assert.equal(p.expected, 'observed');
    }
    for (const suffix of ['busy', 'fighting', 'unmapped', 'no-fight', 'pigging', 'times0', 'times51', 'no-learn', 'low-exp'])
        assert.equal(accepted('yunv-jian', 'practice', suffix), false);
});

test('身份、原属性、场地和武器ID、资源账、熟练度及接口归属必须真实完整', () => {
    const c = pick('xuantie-jian', 'practice');
    for (const mutate of [r => r.before[0].wizardp = 1, r => r.immediate[0].playerp = 0,
        r => delete r.before[0].cultivation.character, r => r.before[0].weapon_details.id = 'sword',
        r => r.weapon_learning_room['can_practice_xiantie-jian'] = 0, r => r.before[0].effective_skills.force++,
        r => r.before[0].effective_dex++, r => r.immediate[0].neili++, r => r.immediate[1].qi++,
        r => r.immediate[0].learned['xuantie-jian']++, r => r.metrics[0] = null,
        r => r.metrics[0].heartbeats = 1, r => r.metrics[0].direct = null, r => r.callbacks.push({})]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuWeaponLearningRecord(r, c));
    }
    const direct = pick('bingpo-shenzhen', 'practice_skill'), bad = row(direct);
    bad.interfaces[0].implemented_by = '/inherit/skill/skill';
    assert.throws(() => validateGumuWeaponLearningRecord(bad, direct));
});

test('真实空闲和未设置字段保留显式null，不要求性格出现在不存在的顶层', () => {
    const c = pick('yunv-jian', 'valid_learn'), r = row(c);
    assert.equal(r.before[0].busy, null); assert.equal(r.before[1].learned_points, null);
    assert.equal(r.before[0].character, undefined); assert.equal(r.before[0].cultivation.character, '国士无双');
    assert.deepEqual(r.before[1].weapon_details, {}); validateGumuWeaponLearningRecord(r, c);
    for (const phase of ['before', 'immediate', 'after']) for (const key of ['busy', 'jingli', 'learned_points', 'skills', 'learned', 'temp', 'object']) {
        const bad = row(c); delete bad[phase][0][key]; assert.throws(() => validateGumuWeaponLearningRecord(bad, c), phase + '/' + key);
    }
    for (const change of [r => r.before[0].skills = [], r => r.before[0].learned = [],
        r => r.before[0].learned.force = null, r => delete r.weapon_learning_room.pigging,
        r => { r.room = structuredClone(c.parameters.room); delete r.weapon_learning_room; },
        r => { delete r.before[0].cultivation.character; r.before[0].character = '国士无双'; }]) {
        const bad = row(c); change(bad); assert.throws(() => validateGumuWeaponLearningRecord(bad, c));
    }
    const busy = pick('yunv-jian', 'practice', 200, 'busy'); assert.equal(row(busy).before[0].busy, 2);
    validateGumuWeaponLearningRecord(row(busy), busy);
});

test('原三千重兵器带来的dodge减一与临时身法分开，不拿错误装备加成冒充有效技能', () => {
    for (const skill of ['yunv-jian', 'yinsuo-jinling', 'bingpo-shenzhen']) {
        const c = pick(skill, 'valid_learn', 200, skill === 'bingpo-shenzhen' ? 'weapon-sword' : '');
        const r = row(c); assert.equal(r.before[0].effective_skills.dodge, 599); assert.equal(r.before[0].effective_dex, 76);
        validateGumuWeaponLearningRecord(r, c);
        for (const change of [r => r.before[0].effective_skills.dodge = 600, r => r.before[0].temp.apply.dodge = 0,
            r => r.before[0].temp.apply.damage = null, r => r.before[0].weapon_details.weight = 1,
            r => r.before[0].temp.weapon = '/tests/other#1', r => r.before[0].weapon_details.program = '/tests/other',
            r => { delete r.before[0].temp.weapon; delete r.before[0].weapon_details.object; },
            r => r.before[0].effective_int++]) {
            const bad = row(c); change(bad); assert.throws(() => validateGumuWeaponLearningRecord(bad, c));
        }
    }
    const unarmed = row(pick('bingpo-shenzhen', 'valid_learn'));
    assert.equal(unarmed.before[0].effective_skills.dodge, 600);
    const bonus = pick('yufeng-zhen', 'valid_learn', 200, 'apply-dex');
    assert.equal(row(bonus).before[0].temp.apply.dex, 1); validateGumuWeaponLearningRecord(row(bonus), bonus);
});

test('资源账拒绝未知、负计量、扣费后恢复和无代价的伪进度', () => {
    const c = pick('suxin-jian', 'practice');
    for (const change of [r => r.metrics[0].qi_cost = null, r => r.metrics[0].jing_cost = -1,
        r => r.metrics[0].neili_cost = 0, r => { r.metrics[0].qi_cost++; r.metrics[0].qi_recovery = 1; },
        r => r.metrics[1].jing_recovery = 1,
        r => { r.immediate[0].learned['suxin-jian'] = null; r.after = structuredClone(r.immediate); },
        r => { r.immediate[0].temp.apply.damage++; r.after = structuredClone(r.immediate); },
        r => { r.after[0].object = '/tests/replacement'; r.immediate[0].object = '/tests/replacement'; }]) {
        const bad = row(c); change(bad); assert.throws(() => validateGumuWeaponLearningRecord(bad, c));
    }
});

test('效果统计使用冻结条件分清资格、直接练习和部分进度，不依赖raw.parameters', () => {
    const summarize = c => gumuWeaponLearningEffects([{ outcome: c.parameters.expected, raw: row(c) }], c);
    const q = summarize(pick('suxin-jian', 'valid_learn', 200, 'male'));
    assert.equal(q.attempts, 1); assert.equal(q.refused, 1); assert.equal(q.qualification_allowed, 0);
    assert.equal(q.command_accepted, null); assert.equal(q.completed_repetitions.n, 0);
    const direct = summarize(pick('suxin-jian', 'practice_skill'));
    assert.equal(direct.completed_repetitions.mean, 1); assert.equal(direct.learned_gain.mean, 0); assert.equal(direct.neili_cost.mean, 60);
    const c = pick('suxin-jian', 'practice', 200, 'partial-qi'), partial = summarize(c);
    assert.equal(partial.observed, 1); assert.equal(partial.command_accepted, 0); assert.equal(partial.partial_practice, 1);
    assert.equal(partial.completed_repetitions.mean, 2); assert.equal(partial.learned_gain.mean, 24);
    const wrapper = { outcome: 'observed', raw: row(c) };
    const missing = gumuWeaponLearningEffects([wrapper]); assert.equal(missing.ability, 'unknown_ability');
    assert.equal(missing.completed_repetitions.unknown, 1); assert.equal(missing.learned_gain.unknown, 1);
    const error = gumuWeaponLearningEffects([wrapper, { outcome: 'error', raw: {} }], c);
    assert.equal(error.attempts, 1); assert.equal(error.errors, 1); assert.equal(error.completed_repetitions.n, 1);
    const unknown = structuredClone(wrapper); unknown.raw.metrics[0].qi_cost = null;
    assert.equal(gumuWeaponLearningEffects([unknown], c).qi_cost.unknown, 1);
    assert.equal(gumuWeaponLearningEffects([unknown], c).completed_repetitions.unknown, 1);
    unknown.raw.immediate[0].learned[c.parameters.skill] = null;
    assert.equal(gumuWeaponLearningEffects([unknown], c).learned_gain.unknown, 1);
});

test('当前源码保留跨技能查询、玄铁场地拼写及九份固定费用，采集器不顺手修游戏', () => {
    const source = id => readFileSync(join(root, `kungfu/skill/${id}.c`), 'utf8');
    assert.match(source('yunv-jian'), /query_skill\("sword", 1\) < me->query_skill\("suxin-jian", 1\)/);
    assert.match(source('xuantie-jian'), /can_practice_xiantie-jian/);
    assert.match(source('xuantie-jian'), /weapon->query\("id"\) != "xuantie jian"/);
    assert.match(readFileSync(join(root, 'inherit/misc/equip.c'), 'utf8'), /set\("weapon_prop\/dodge", -weight\(\) \/ 3000\)/);
    for (const [skill, , , , , , , , qi, neili] of gumuWeaponLearningProfiles) {
        assert.ok(source(skill).includes(`receive_damage("qi", ${qi})`), skill);
        assert.ok(source(skill).includes(`add("neili", -${neili})`), skill);
    }
});

test('共享接线仅开放本组字段并冻结本组模块，报告使用规范化行及冻结条件', () => {
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8').replace(/\s+/g, ' ');
    assert.match(runner, /collection_group"\] == "gumu-weapon-learning" \|\|\s*member_array\(current\["parameters"\]\["teaching_profile"\],\s*\(\{[^}]*"gumu-teachers"[^}]*\}\)\) != -1\)\s*result\["id"\] = item->query\("id"\);/);
    assert.match(runner, /"gumu-weapon-learning"\) \{ result\["effective_dex"\] = ob->query_dex\(\); result\["effective_int"\] = ob->query_int\(\); foreach \(key in \(\{ "character", "tattoo\/tattoo_dex", "reborn\/dex", "env\/no_learn" \}\)\)/);
    assert.match(runner, /"gumu-weapon-learning" && side == 0 && key == "apply\/dex" && value == 1/);
    assert.match(runner, /"gumu-weapon-learning" && side == 0 && stringp\(config\["equipment"\]\["id"\]\)/);
    assert.match(runner, /weapon->set\("id", config\["equipment"\]\["id"\]\);/);
    assert.match(runner, /\(\{ "suxin-jian", "quanzhen-jian", "yinsuo-jinling", "sanwu-shou" \}\)/);
    assert.match(runner, /load_usage = member_array\(\s*key, \(\{ "suxin-jian", "quanzhen-jian" \}\)\s*\) != -1 \? "sword" : "whip";/);
    assert.match(runner, /"command": "enable " \+ load_usage \+ " " \+ key/);
    assert.match(runner, /ob->force_me\(current\["skill_load_context"\]\["command"\]\).*?ob->map_skill\(load_usage\); \}.*?foreach \(key, value in config\["mappings"\]/);
    assert.match(runner, /"gumu-weapon-learning" && room_key == "practice_improve"/);
    for (const key of ['no_fight', 'pigging', 'practice_improve', 'can_practice_xiantie-jian', 'can_practice_xuantie-jian'])
        assert.ok(runner.includes(`"${key}": query("${key}")`), key);
    assert.match(runner, /foreach \(room_key in \(\{ "pigging", "can_practice_xiantie-jian", "can_practice_xuantie-jian" \}\)\) \{ delete\(room_key\); if \(\(parameters\["collection_group"\] == "gumu-weapon-learning" \|\| \(member_array\(parameters\["collection_group"\], \(\{ "gumu-research", "mingjiao-jiuyang-research" \}\)\) != -1 && room_key == "pigging"\)[^)]*\|\|/);
    assert.match(runner, /\(\{ "gumu-movement", "gumu-weapon-learning", "gumu-unarmed-learning", "mingjiao-ling-learning" \}\)\) != -1\) current\["interfaces"\]\[<1\]\["implemented_by"\] = function_exists/);
    const execution = readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8');
    assert.ok(execution.includes("'tools/tests/martial_data/school_gumu_weapon_learning_cases.mjs'"));
    const report = readFileSync(join(root, 'tools/tests/martial_data/school_combat_report.mjs'), 'utf8');
    assert.ok(report.includes('condition.gumu_weapon_learning = gumuWeaponLearningEffects(rows.filter(r => r.condition_id === condition.id), condition);'));
});

test('原命令预加载使用冻结角色已有剑鞭基础，不假设有招架或改写角色等级', () => {
    const dynamic = { 'suxin-jian': 'sword', 'quanzhen-jian': 'sword',
        'yinsuo-jinling': 'whip', 'sanwu-shou': 'whip' };
    const enable = readFileSync(join(root, 'cmds/skill/enable.c'), 'utf8');
    assert.match(enable, /me->query_skill\(ski, 1\) < 1/);
    for (const [skill, usage] of Object.entries(dynamic)) {
        const source = readFileSync(join(root, `kungfu/skill/${skill}.c`), 'utf8');
        assert.ok(source.includes(`return usage == "${usage}" || usage == "parry";`), skill);
        const selected = cases.filter(c => c.parameters.skill === skill);
        assert.ok(selected.length > 0);
        for (const c of selected) {
            assert.ok(c.parameters.actor.skills[usage] > 0, c.id);
            assert.ok(c.parameters.actor.skills[skill] > 0, c.id);
        }
        assert.equal(pick(skill, 'valid_learn').parameters.actor.skills.parry, undefined);
        assert.equal(pick(skill, 'practice', 200, 'parry').parameters.actor.mappings[usage], undefined);
    }
});

test('Markdown分列资格、直接接口与完整练习，不放入战斗伤害表或重复练习表', () => {
    const selected = [pick('suxin-jian', 'valid_learn', 200, 'male'),
        pick('suxin-jian', 'practice_skill'), pick('suxin-jian', 'practice', 200, 'partial-qi')];
    const conditions = selected.map(c => ({ ...c,
        counts: { observed: Number(c.parameters.expected === 'observed'), refused: Number(c.parameters.expected === 'refused') },
        effects: schoolCombatEffects([{ outcome: c.parameters.expected, raw: row(c) }]),
        gumu_weapon_learning: gumuWeaponLearningEffects([{ outcome: c.parameters.expected, raw: row(c) }], c),
        ...(c.method === 'practice' ? { practice: {} } : {}),
    }));
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-not-a-series', evidence_sha256: 'synthetic',
        totals: { conditions: 3, samples: 3, observed: 2, refused: 1, errors: 0 }, conditions });
    const start = markdown.indexOf('## 古墓兵器学习与练习');
    assert.ok(start > 0); assert.ok(!markdown.slice(0, start).includes('school-gumu-weapon-learning-'));
    for (const title of ['### 学习资格', '### 直接练习接口', '### 完整练习命令']) assert.ok(markdown.includes(title));
    assert.ok(!markdown.includes('## 原命令练习：全部完成与部分进度分列'));
    assert.ok(markdown.includes(`| ${selected[0].id} | 1/0 | 0.00/0.00 |`));
    assert.ok(markdown.includes(`| ${selected[1].id} | 1/0 | 1.00 | 0.00 | 60.00/60.00 |`));
    assert.ok(markdown.includes(`| ${selected[2].id} | 1/0 | 0/1 | 2.00 | 24.00 | 120.00/120.00 |`));
});
