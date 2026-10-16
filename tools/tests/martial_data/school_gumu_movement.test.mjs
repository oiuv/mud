import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';
import { validateExpectedOutcomes } from './execution.mjs';
import { gumuMovementProfiles, gumuMovementFixtureRequirements, gumuMovementConditions,
    gumuMovementGain, gumuMovementInterface, gumuMovementEffects, validateGumuMovementRecord } from './school_gumu_movement_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuMovementConditions(catalog);
const pick = (skill, ability, level = 200, suffix = '') => {
    const c = cases.find(c => c.id === `school-gumu-movement-${skill}-${ability}-l${level}${suffix ? '-' + suffix : ''}`);
    assert.ok(c, [skill, ability, level, suffix].join('/')); return c;
};

// These synthetic records validate the collector; they are never live samples.
function row(c, maximum = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => ({ qi: 10000, eff_qi: 10000, neili: 6000,
        jing: 10000, eff_jing: 10000, learned_points: 0,
        ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/'))),
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, weapon: cfg.equipment?.type ?? 'none',
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {},
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (k === 'dodge' && cfg.equipment ? -1 : 0)])),
        effective_int: (cfg.properties.int ?? 30) + Math.trunc((cfg.skills.literate ?? 0) / 10),
        cultivation: Object.fromEntries(['special_skill/wuxing', 'env/no_learn', 'family/family_name'].map(k => [k, cfg.properties[k] ?? null])),
        busy: cfg.busy ?? null, temp: { apply: cfg.equipment ? { dodge: -1 } : {} },
        weapon_details: cfg.equipment ? { program: '/tests/sword', skill_type: 'sword', weight: 3000, damage: 50 } : {},
    }));
    const r = { before, immediate: structuredClone(before), metrics: [{}, {}], interfaces: [], launches: [], attacks: [],
        movement_room: Object.fromEntries(['no_fight', 'practice_improve', 'research_improve'].map(k => [k, p.room[k] ?? null])),
        method: c.method, outcome: p.expected, reason: '原命令拒绝或部分完成', command_accepted: p.command_return };
    const a = r.immediate[0], count = c.method === 'interface' && p.ability === 'practice_skill'
        ? Number(p.expected === 'observed') : c.method === 'practice' ? p.completed : 0;
    a.qi -= count * p.costs.qi; a.neili -= count * p.costs.neili;
    if (c.method === 'interface') r.interfaces.push({ ...p.interface, result: gumuMovementInterface(p),
        implemented_by: ['type', 'valid_learn_level', 'valid_research'].includes(p.ability) ? '/inherit/skill/skill' : '/kungfu/skill/' + p.skill });
    else if (c.method === 'practice' && p.completed) a.learned[p.skill] = p.completed * gumuMovementGain(p);
    else if (c.method === 'research') {
        a.learned_points += p.completed; a.jing = p.clear_jing ? 0 : a.jing - p.completed * Math.trunc(1000 / a.int);
        if (p.completed) a.learned[p.skill] = p.completed * (maximum ? gumuMovementGain(p, true) : 1);
    }
    for (const k of ['qi', 'neili', 'jing', 'eff_qi', 'eff_jing']) {
        const spent = before[0][k] - a[k];
        if (spent) r.metrics[0][k + '_cost'] = spent;
    }
    return r;
}

test('追加两门身法167条件4450计划、209烟雾，旧13495条件完整内容不变', () => {
    assert.equal(cases.length, 167); assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4450);
    assert.equal(cases.filter(c => c.samples === 100).length, 42);
    assert.equal(createHash('sha256').update(JSON.stringify(cases)).digest('hex'),
        'f8ed7a0ec05be65ff7def6a236cabdc2f77b481e42a732341ae4e953a8e05f55');
    validateExpectedOutcomes(cases);
    assert.equal(gumuMovementFixtureRequirements.length, 3);
    const registered = schoolCombatConditions(catalog);
    const old = registered.slice(0, 13495);
    assert.equal(old.length, 13495); assert.equal(old.reduce((n, c) => n + c.samples, 0), 373212);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '993a3c01ca784c759d296a4bd8071aa0142dc882e46cd2f0725e0d38ef7066ca');
    assert.deepEqual(registered.filter(c => c.parameters.collection_group === 'gumu-movement'), cases);
    assert.equal(old.length + cases.length, 13662);
    assert.equal([...old, ...cases].reduce((n, c) => n + c.samples, 0), 377662);
    const smoke = gumuMovementConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 209);
    validateExpectedOutcomes(smoke);
    for (const [index, c] of cases.entries()) {
        assert.deepEqual(c.parameters, smoke[index].parameters);
        for (const file of c.parameters.qualification_sources) assert.ok(existsSync(join(root, file)), file);
        for (const skill of Object.keys(c.parameters.actor.skills)) assert.ok(catalog.skills.some(s => s.id === skill));
        for (const maximum of [false, true]) validateSchoolCombatRecord(row(c, maximum), c);
    }
    assert.throws(() => gumuMovementConditions(catalog, { samples: 0 }));
});

test('共享执行器观察实际房间、有效属性与接口归属，报告读取冻结条件', () => {
    const text = p => readFileSync(join(root, p), 'utf8');
    const runner = text('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /member_array\(current\["parameters"\]\["collection_group"\],\s+\(\{ "gumu-movement", "mingjiao-movement" \}\)\) != -1\) \{\s+result\["effective_int"\] = ob->query_int\(\);\s+result\["cultivation"\]\["env\/no_learn"\] = ob->query\("env\/no_learn"\);/);
    assert.match(runner, /\(\{ "gumu-cultivation", "gumu-movement", "mingjiao-shengong" \}\)\)[\s\S]*?call_other\(spec\["object"\], "valid_research", players\[0\]\)/);
    assert.match(runner, /"configured original movement usage"\);\s+result = call_other\(spec\["object"\], "valid_enable", spec\["argument"\]\)/);
    assert.match(runner, /\(\{ "gumu-movement", "gumu-weapon-learning", "gumu-unarmed-learning",\s+"mingjiao-ling-learning" \}\)\) != -1\)\s+current\["interfaces"\]\[<1\]\["implemented_by"\] = function_exists\(spec\["function"\],\s+load_object\(spec\["object"\]\)\)/);
    assert.match(runner, /foreach \(room_key in \(\{ "practice_improve", "research_improve" \}\)\) \{\s+delete\(room_key\);\s+if \(\(parameters\["collection_group"\] == "gumu-movement" \|\|[^)]*\|\|\s+\(parameters\["collection_group"\] == "gumu-weapon-learning" && room_key == "practice_improve"\) \|\|\s+\(member_array\(parameters\["collection_group"\],\s*\(\{ "gumu-research", "mingjiao-jiuyang-research" \}\)\) != -1 &&\s*room_key == "research_improve"\)\)/);
    const roomStart = runner.indexOf('current["movement_room"] =');
    assert.ok(roomStart > runner.indexOf('delete(room_key);', runner.indexOf('void perform_sample()')));
    assert.ok(roomStart < runner.indexOf('prepare_actor(0, parameters["actor"]);', roomStart));
    const room = runner.slice(roomStart, runner.indexOf('prepare_actor(0, parameters["actor"]);', roomStart));
    for (const key of ['no_fight', 'practice_improve', 'research_improve'])
        assert.ok(room.includes('"' + key + '": query("' + key + '")'));
    assert.ok(text('tools/tests/martial_data/execution.mjs').includes("'tools/tests/martial_data/school_gumu_movement_cases.mjs'"));
    assert.match(text('tools/tests/martial_data/school_combat_report.mjs'), /gumuMovementEffects\(rows\.filter\([\s\S]*?\['observed', 'refused'\]\.includes\(r\.outcome\)\)\.map\(r => r\.raw\), condition\)/);
});

test('轻功报告不混入伤害表，接口与部分命令分开表示', () => {
    const selected = [pick('qixing-bu', 'practice', 200, 'partial-neili'), pick('yunv-shenfa', 'valid_learn')];
    const report = { fingerprint: 'fixture', evidence_sha256: 'fixture', totals: { conditions: 2, samples: 2, observed: 2, refused: 0 },
        conditions: selected.map(c => ({ ...c, counts: { observed: 1, refused: 0 }, gumu_movement: gumuMovementEffects([row(c)], c),
            effects: { callback_start_seconds: { mean: null }, target_callback_start_seconds: { mean: null } } })) };
    const markdown = schoolCombatMarkdown(report);
    assert.match(markdown, /古墓轻功：资格、练习与研究/);
    assert.match(markdown, /接口不计练习或研究次数/);
    assert.match(markdown, /\| 0\/1 \| 1 \| 1 \| 2\.00 \| 24\.00 \| -70\.00\/-48\.00\/0\.00 \|/);
    assert.match(markdown, /\| 1\/0 \| — \| — \| — \| — \| 0\.00 \| 0\.00\/0\.00\/0\.00 \|/);
    for (const c of selected) assert.equal(markdown.split(c.id).length - 1, 1);
});

test('真实记录不带 parameters；显式 null 空闲可接受而缺项仍拒绝', () => {
    const c = pick('yunv-shenfa', 'practice'), r = row(c);
    assert.ok(!Object.hasOwn(r, 'parameters')); assert.equal(r.before[0].busy, null);
    validateGumuMovementRecord(r, c);
    r.before[0].busy = 0; r.immediate[0].busy = 0;
    validateGumuMovementRecord(r, c);
    for (const phase of ['before', 'immediate']) for (const side of [0, 1]) {
        const missing = row(c); delete missing[phase][side].busy;
        assert.throws(() => validateGumuMovementRecord(missing, c));
    }
});

test('有效技能与有效悟性单独核验，不改变采用先天悟性的原公式', () => {
    const c = pick('yunv-shenfa', 'practice', 200, 'effective-int'), r = row(c);
    assert.equal(r.before[0].int, 36); assert.equal(r.before[0].effective_int, 86);
    assert.deepEqual(r.before[0].effective_skills, { dodge: 300, 'yunv-shenfa': 100, literate: 250 });
    assert.equal(r.immediate[0].learned['yunv-shenfa'], 12);
    for (const change of [r => delete r.before[0].effective_int, r => r.before[0].effective_int = 36,
        r => r.before[0].effective_skills.dodge = 201, r => delete r.immediate[0].effective_skills,
        r => r.immediate[0].effective_int = 87]) {
        const bad = row(c); change(bad); assert.throws(() => validateGumuMovementRecord(bad, c));
    }
});

test('持剑原装备轻功修正计入有效等级，不改变原始等级或成长公式', () => {
    for (const { skill } of gumuMovementProfiles) for (const ability of ['practice', 'research']) {
        const c = pick(skill, ability, 200, 'armed'), r = row(c);
        assert.equal(r.before[0].skills.dodge, 201);
        assert.equal(r.before[0].temp.apply.dodge, -1);
        assert.equal(r.before[0].effective_skills.dodge, 299);
        validateGumuMovementRecord(r, c);
        for (const change of [r => r.before[0].effective_skills.dodge = 300,
            r => delete r.before[0].temp.apply, r => delete r.before[0].temp.apply.dodge,
            r => r.immediate[0].temp.apply.dodge = 0,
            r => r.before[0].weapon_details.weight = 6000,
            r => r.before[0].weapon_details.program = '/tests/other',
            r => r.immediate[0].weapon_details.damage = 51]) {
            const bad = row(c); change(bad); assert.throws(() => validateGumuMovementRecord(bad, c));
        }
    }
    const c = pick('yunv-shenfa', 'practice'), unknown = row(c);
    unknown.before[0].temp.apply.dodge = null;
    unknown.immediate[0].temp.apply.dodge = null;
    assert.throws(() => validateGumuMovementRecord(unknown, c));
});

test('房间加成须有实际观测，缺少设置或泄漏上一条件均拒绝', () => {
    for (const ability of ['practice', 'research']) {
        const c = pick('yunv-shenfa', ability, 200, 'room50');
        const r = row(c); assert.equal(r.movement_room[ability + '_improve'], 50);
        for (const change of [r => delete r.movement_room, r => delete r.movement_room[ability + '_improve'],
            r => r.movement_room[ability + '_improve'] = 0, r => r.movement_room.no_fight = 1]) {
            const bad = row(c); change(bad); assert.throws(() => validateGumuMovementRecord(bad, c));
        }
    }
    const c = pick('yunv-shenfa', 'practice'), r = row(c);
    r.movement_room.practice_improve = 50; assert.throws(() => validateGumuMovementRecord(r, c));
});

test('实际支出和精神耗尽清零同账，未知计量或意外心跳不能通过', () => {
    const c = pick('yunv-shenfa', 'research', 200, 'partial'), r = row(c);
    assert.equal(r.metrics[0].jing_cost, 60); // Two 27-point steps, then discard the last 6.
    assert.equal(r.immediate[0].learned_points, 2);
    validateGumuMovementRecord(r, c);
    for (const change of [r => r.metrics[0].jing_cost = 54, r => r.metrics[0] = {},
        r => r.metrics[0].jing_cost = null, r => r.metrics[0].heartbeats = 1,
        r => r.metrics[0].jing_recovery = 1, r => r.metrics[1].qi_cost = 1,
        r => delete r.before[0].jing]) {
        const bad = row(c); change(bad); assert.throws(() => validateGumuMovementRecord(bad, c));
    }
    const none = pick('yunv-shenfa', 'research', 200, 'jing26'), no = row(none);
    assert.equal(no.command_accepted, 1); assert.equal(no.outcome, 'refused');
    assert.equal(no.metrics[0].jing_cost, 26); validateGumuMovementRecord(no, none);
});

test('熟练度缺失键为零，数组或显式未知值不能冒充零进展', () => {
    const c = pick('yunv-shenfa', 'valid_learn');
    validateGumuMovementRecord(row(c), c);
    for (const learned of [[], { 'yunv-shenfa': null }, { unknown: -1 }, { unknown: 1.5 }]) {
        const bad = row(c); bad.immediate[0].learned = learned;
        assert.throws(() => validateGumuMovementRecord(bad, c));
    }
});

test('汇总使用冻结条件，部分完成与命令受理、未知字段分列', () => {
    const c = pick('qixing-bu', 'practice', 200, 'partial-neili'), r = row(c);
    const actual = gumuMovementEffects([r], c);
    assert.equal(actual.accepted, 0); assert.equal(actual.progressed, 1); assert.equal(actual.partial_practice, 1);
    assert.equal(actual.completed_repetitions.mean, 2); assert.equal(actual.learned_gain.mean, 24);
    assert.equal(actual.neili_delta.mean, -48);
    const unknown = gumuMovementEffects([r]);
    assert.equal(unknown.learned_gain.mean, null); assert.equal(unknown.completed_repetitions.mean, null);
    const bad = structuredClone(r); delete bad.before[0].learned; bad.metrics[0] = null; delete bad.before[0].jing;
    const missing = gumuMovementEffects([bad], c);
    assert.equal(missing.learned_gain.mean, null); assert.equal(missing.completed_repetitions.mean, null);
    assert.equal(missing.jing_delta.mean, null);
    const research = pick('yunv-shenfa', 'research', 200, 'jing26');
    const clear = gumuMovementEffects([row(research)], research);
    assert.equal(clear.accepted, 1); assert.equal(clear.progressed, 0);
    assert.equal(clear.completed_repetitions.mean, 0); assert.equal(clear.jing_delta.mean, -26);
});

test('学习资格无资源门槛；dodge/move声明与不存在的move基本技能分开', () => {
    for (const { skill } of gumuMovementProfiles) {
        assert.equal(gumuMovementInterface(pick(skill, 'valid_learn', 200, 'no-resources').parameters), 1);
        for (const arg of ['dodge', 'move', 'parry'])
            assert.equal(gumuMovementInterface(pick(skill, 'valid_enable', 200, arg).parameters), Number(arg !== 'parry'));
        assert.equal(gumuMovementInterface(pick(skill, 'valid_learn_level').parameters), 200);
        assert.ok(!cases.some(c => Object.hasOwn(c.parameters.actor.skills, 'move')));
    }
    assert.ok(!existsSync(join(root, 'kungfu/skill/move.c')) && !existsSync(join(root, 'kungfu/skill/move.lpc')));
});

test('练习门槛和成本分别核验，玉女不耗内力，七星消耗24不是检查值30', () => {
    for (const d of gumuMovementProfiles) for (const ability of ['practice_skill', 'practice']) {
        const low = pick(d.skill, ability, 200, 'low-qi'); assert.equal(low.parameters.expected, 'refused');
        const min = row(pick(d.skill, ability, 200, 'minimum-qi'));
        assert.equal(min.immediate[0].qi, d.qiFloor - d.qiCost);
        assert.equal(min.immediate[0].neili, 6000 - d.neiliCost);
        const none = pick(d.skill, ability, 200, 'neili0'); assert.equal(none.parameters.expected, d.neiliFloor ? 'refused' : 'observed');
        if (d.neiliFloor) assert.equal(row(pick(d.skill, ability, 200, 'neili30')).immediate[0].neili, 6);
    }
    const c = pick('yunv-shenfa', 'practice_skill'), r = row(c);
    assert.deepEqual(r.immediate[0].learned, {}); // Direct interface does not improve skills.
    assert.equal(row(pick('yunv-shenfa', 'practice')).immediate[0].learned['yunv-shenfa'], 12);
});

test('部分练习可以返回0但已有进度，不按整条拒绝抹去消耗', () => {
    for (const d of gumuMovementProfiles) {
        const c = pick(d.skill, 'practice', 200, 'partial-qi'), r = row(c);
        assert.equal(r.outcome, 'observed'); assert.equal(r.command_accepted, 0);
        assert.equal(r.immediate[0].learned[d.skill], 24);
        assert.equal(r.before[0].qi - r.immediate[0].qi, d.qiCost * 2);
    }
    const c = pick('qixing-bu', 'practice', 200, 'partial-neili'), r = row(c);
    assert.equal(r.immediate[0].neili, 6); assert.equal(r.immediate[0].learned['qixing-bu'], 24);
    assert.equal(pick('qixing-bu', 'practice', 200, 'basic-equal').parameters.expected, 'refused');
});

test('练习299/300与499/500分段，先天悟性在原分母，读书不替代', () => {
    const gain = (level, suffix = '') => gumuMovementGain(pick('yunv-shenfa', 'practice', level, suffix).parameters);
    assert.deepEqual([200, 299, 300, 400, 499, 500, 800].map(l => gain(l)), [12, 13, 7, 7, 7, 3, 3]);
    assert.deepEqual(['int9', 'int16', 'int64'].map(s => gain(200, s)), [23, 18, 9]);
    assert.equal(gain(200, 'effective-int'), gain(200));
    assert.equal(gain(200, 'wuxing'), 14); assert.equal(gain(200, 'cognize500'), 23);
    assert.equal(gain(200, 'room50'), 18); assert.equal(gain(200, 'all-bonuses'), 41);
});

test('研究不要求激发或基本轻功高于特殊，另一门身法不自动加成；随机上界非平均收益', () => {
    for (const { skill } of gumuMovementProfiles) {
        assert.equal(pick(skill, 'practice', 200, 'unmapped').parameters.expected, 'refused');
        assert.equal(pick(skill, 'research', 200, 'unmapped').parameters.expected, 'observed');
        assert.equal(pick(skill, 'research', 200, 'no-basic').parameters.expected, 'observed');
        assert.equal(pick(skill, 'research', 179).parameters.expected, 'refused');
        assert.equal(pick(skill, 'research', 180).parameters.expected, 'observed');
        const bound = suffix => gumuMovementGain(pick(skill, 'research', 200, suffix).parameters, true);
        assert.equal(bound(''), 8); assert.equal(bound('other-dodge'), 8); assert.equal(bound('effective-int'), 8);
        assert.equal(bound('no-basic'), 5); assert.equal(bound('low-body-resources'), 8);
    }
});

test('身份、旁观者、熟练度、费用或研究完成量污染均拒绝', () => {
    const c = pick('qixing-bu', 'practice');
    for (const change of [r => r.before[0].wizardp = 1, r => r.immediate[1].qi = 5,
        r => r.immediate[0].neili++, r => r.immediate[0].learned.dodge = 1,
        r => r.immediate[0].learned['qixing-bu']++, r => delete r.before[0].cultivation['env/no_learn'],
        r => r.immediate[0].playerp = 0, r => r.before[0].busy = 2,
        r => r.before[0].learned.dodge = 5, r => r.metrics[0] = null,
        r => r.metrics[0].qi_cost = null]) {
        const r = row(c); change(r); assert.throws(() => validateGumuMovementRecord(r, c));
    }
    const research = pick('yunv-shenfa', 'research', 200, 'partial'), rr = row(research);
    assert.equal(rr.immediate[0].learned_points, 2); assert.equal(rr.immediate[0].jing, 0);
    rr.immediate[0].learned_points = 3; assert.throws(() => validateGumuMovementRecord(rr, research));
});

test('静态依据保持原成本、研究相关筛选和实践公式，不把语义推测当游戏错误', () => {
    const text = p => readFileSync(join(root, p), 'utf8');
    assert.match(text('kungfu/skill/yunv-shenfa.c'), /receive_damage\("qi", 40\)/);
    assert.match(text('kungfu/skill/qixing-bu.c'), /add\("neili", -24\)/);
    assert.match(text('cmds/skill/practice.c'), /skill_basic <= skill/);
    assert.match(text('cmds/skill/practice.c'), /pow\(\(int\)me->query\("int"\), 1\.0 \/ 2\)/);
    assert.match(text('cmds/skill/research.c'), /SKILL_D\(ks\[i\]\)->valid_enable\(skill\)/);
    for (const { skill } of gumuMovementProfiles) assert.doesNotMatch(text(`kungfu/skill/${skill}.c`), /\b(?:difficult_level|valid_research|query_action)\s*\(/);
});
