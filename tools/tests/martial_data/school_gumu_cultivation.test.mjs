import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatMarkdown, schoolCultivationEffects } from './school_combat_report.mjs';
import { gumuForces, gumuCultivationSkills, gumuCultivationFields, gumuCultivationFixtureRequirements,
    gumuEffectiveAttribute, gumuCultivationCanLearn, gumuForceAllows, gumuCultivationCanStudy,
    gumuForceBonus, gumuForceCapacity, gumuResearchBound, gumuCultivationConditions,
    gumuCultivationInterface, gumuCultivationOwner, validateGumuCultivationRecord,
    gumuCultivationEffects } from './school_gumu_cultivation_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuCultivationConditions(catalog);
const pick = (skill, ability, level = 200, suffix = '') => {
    const c = cases.find(c => c.id === `school-gumu-cultivation-${skill}-${ability}-l${level}${suffix ? '-' + suffix : ''}`);
    assert.ok(c, [skill, ability, level, suffix].join('/')); return c;
};

// Validator fixtures only; no synthetic sample is saved as a driver observation.
function row(c, maximum = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => ({ qi: 10000, eff_qi: 10000,
        ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !gumuCultivationFields.includes(k))),
        userp: 1, interactive: 1, wizardp: 0, weapon: 'none', busy: cfg.busy ?? 0,
        temp: structuredClone(cfg.temp ?? {}), skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {},
        cultivation: Object.fromEntries(gumuCultivationFields.map(k => [k, cfg.properties[k] ?? null])),
        ...(cfg === p.actor ? Object.fromEntries(['str', 'int'].map(k => ['effective_' + k, gumuEffectiveAttribute(cfg, k)])) : {}),
    }));
    const r = { parameters: p, method: c.method, before, immediate: structuredClone(before), outcome: p.expected,
        reason: p.expected === 'refused' ? '原命令拒绝或没有进展' : '', attacks: [], launches: [], interfaces: [],
        metrics: [{}, {}], command_accepted: p.command_return };
    if (c.method === 'research') {
        const a = r.immediate[0]; a.learned_points += p.completed;
        a.jing = p.clear_jing ? 0 : a.jing - p.completed * Math.trunc(1000 / a.int);
        if (p.completed) a.learned[p.skill] = p.completed * (maximum ? gumuResearchBound(p) : 1);
    } else r.interfaces.push({ ...p.interface, result: gumuCultivationInterface(p), implemented_by: gumuCultivationOwner(p) });
    return r;
}

test('注册全部341条件且来源/技能真实，烟雾与正式参数不混算', () => {
    assert.equal(cases.length, 341); assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 7150);
    assert.equal(cases.filter(c => c.method === 'research').length, 116);
    assert.equal(cases.filter(c => c.samples === 100).length, 66);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 83);
    assert.equal(gumuCultivationFixtureRequirements.length, 4);
    const registered = schoolCombatConditions(catalog);
    const old = registered.slice(0, 13154);
    assert.equal(old.length, 13154); assert.equal(old.reduce((n, c) => n + c.samples, 0), 366062);
    assert.equal(sha256(JSON.stringify(old)), '81d515e5fec1b869aca99b86d65ea305a9f2dcc0d29d4e0800412e6fc4452f52');
    assert.deepEqual(registered.filter(c => c.parameters.collection_group === 'gumu-cultivation'), cases);
    assert.equal(sha256(JSON.stringify(cases)), 'c5f516e4c33feadc3c7a6675af0e9b858e580629092d0b280196d126f9e94ffd');
    const smoke = gumuCultivationConditions(catalog, { smoke: true });
    assert.equal(smoke.length, cases.length);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 407);
    for (const [index, c] of cases.entries()) {
        assert.deepEqual(c.parameters, smoke[index].parameters);
        assert.ok(catalog.skills.some(s => s.path === c.entry_id));
        for (const file of c.parameters.qualification_sources) assert.ok(existsSync(join(root, file)), file);
        for (const skill of Object.keys(c.parameters.actor.skills)) assert.ok(catalog.skills.some(s => s.id === skill), skill);
        assert.ok(c.parameters.actor.properties.neili <= c.parameters.actor.properties.max_neili);
        for (const maximum of [false, true]) validateSchoolCombatRecord(row(c, maximum), c);
    }
    assert.throws(() => gumuCultivationConditions({ skills: [] }));
    assert.throws(() => gumuCultivationConditions(catalog, { samples: 0 }));
});

test('资格对照先天悟性而非读书/纹身/转世/临时悟性；膂力取六种徒手最高项', () => {
    for (const ability of ['valid_learn', 'research']) {
        assert.equal(pick('yunv-xinjing', ability, 200, 'int31').parameters.expected, 'refused');
        assert.equal(pick('yunv-xinjing', ability, 200, 'int32').parameters.expected, 'observed');
        const high = pick('yunv-xinjing', ability, 200, 'raw-int31-effective-high').parameters;
        assert.equal(gumuEffectiveAttribute(high.actor, 'int'), 84); assert.equal(high.expected, 'refused');
        for (const [suffix, allowed] of [['str44', false], ['str45', true], ['unarmed89', false], ['unarmed90', true],
            ['max-not-sum', false], ['tattoo-reborn-temp', true]]) {
            const p = pick('surge-force', ability, 200, suffix).parameters;
            assert.equal(gumuCultivationCanLearn(p.skill, p.actor), allowed);
            assert.equal(p.expected, allowed ? 'observed' : 'refused');
        }
    }
    assert.throws(() => gumuEffectiveAttribute(pick('surge-force', 'valid_learn').parameters.actor, 'dex'));
});

test('心经不限定女性、怒海只许男性、素心无性也可学；基本内功与容量门槛独立', () => {
    for (const ability of ['valid_learn', 'research']) {
        assert.equal(pick('suxin-jue', ability, 200, 'force9').parameters.expected, 'refused');
        assert.equal(pick('suxin-jue', ability, 200, 'force10').parameters.expected, 'observed');
        assert.equal(pick('suxin-jue', ability, 200, 'eunuch').parameters.expected, 'observed');
        assert.equal(pick('yunv-xinjing', ability, 200, 'female').parameters.expected, 'observed');
        assert.equal(pick('yunv-xinjing', ability, 200, 'eunuch').parameters.expected, 'refused');
        assert.equal(pick('surge-force', ability, 200, 'female').parameters.expected, 'refused');
        for (const force of ['yunv-xinjing', 'surge-force']) {
            assert.equal(pick(force, ability, 200, 'force149').parameters.expected, 'refused');
            assert.equal(pick(force, ability, 200, 'force150').parameters.expected, 'observed');
        }
        assert.equal(pick('yunv-xinjing', ability, 200, 'maxneili1999').parameters.expected, 'refused');
        assert.equal(pick('yunv-xinjing', ability, 200, 'maxneili2000').parameters.expected, 'observed');
    }
});

test('学习入口先看候选通配许可，再检查已学内功；不把反向原接口直接当兼修拒绝', () => {
    assert.equal(gumuForceAllows('suxin-jue', 'surge-force'), false);
    assert.equal(gumuForceAllows('surge-force', 'suxin-jue'), true);
    for (const ability of ['can_learn', 'research']) {
        assert.equal(pick('suxin-jue', ability, 200, 'known-surge-force').parameters.expected, 'observed');
        assert.equal(pick('surge-force', ability, 200, 'known-suxin-jue').parameters.expected, 'observed');
        assert.equal(pick('surge-force', ability, 200, 'known-huashan-xinfa').parameters.expected, 'observed');
        assert.equal(pick('suxin-jue', ability, 200, 'known-huashan-xinfa').parameters.expected, 'refused');
        assert.equal(pick('yunv-xinjing', ability, 200, 'known-xuanmen-neigong').parameters.expected, 'observed');
    }
    const a = structuredClone(pick('surge-force', 'research').parameters.actor);
    a.properties['env/no_learn'] = 'surge-force'; assert.equal(gumuCultivationCanStudy('surge-force', a), false);
    assert.throws(() => gumuForceAllows('unreviewed-force', '*'));
});

test('三档内力容量单列：最大容量取最高内功，激发容量按当前映射，查询不授予学习资格', () => {
    assert.deepEqual([200, 400, 800].map(l => gumuForceBonus('yunv-xinjing', l)), [480, 1920, 7680]);
    assert.deepEqual([200, 400, 800].map(l => gumuForceBonus('surge-force', l)), [570, 2280, 9120]);
    assert.equal(gumuForceBonus('suxin-jue', 800), 0);
    for (const [mapping, expected] of [['suxin-jue', 6000], ['yunv-xinjing', 7920], ['surge-force', 8280], ['unmapped', 2000]]) {
        const a = pick('suxin-jue', 'query_current_neili_limit', 400, 'all-' + mapping).parameters.actor;
        assert.equal(gumuForceCapacity(a, true), expected); assert.equal(gumuForceCapacity(a), 8280);
    }
    assert.equal(gumuForceCapacity(pick('suxin-jue', 'query_neili_limit', 201).parameters.actor), 3010);
    const unqualified = pick('yunv-xinjing', 'query_neili_limit', 200, 'unqualified-still-query').parameters;
    assert.equal(gumuCultivationCanLearn(unqualified.skill, unqualified.actor), false);
    assert.equal(gumuCultivationInterface(unqualified), 3480);
});

test('容量加成遵循原顺序取整，古墓僧人身份不凭空增加其他门派的500', () => {
    const value = suffix => gumuCultivationInterface(pick('surge-force', 'query_neili_limit', 400, suffix).parameters);
    assert.equal(value('improve10'), 9108); assert.equal(value('breakup'), 11592);
    assert.equal(value('mystery'), 8820); assert.equal(value('guimai'), 9522);
    assert.equal(value('bonze-gumu'), 8280); assert.equal(value('bonze-emei'), 8780);
    // 8280 -> 9108 -> 12751 -> 13291 -> 15284.
    assert.equal(value('combined'), 15284);
});

test('研究难度400只作用相关技能项，500级分段与武学修养熟练度加成各自保留', () => {
    const bound = (skill, level = 200, suffix = '') => gumuResearchBound(pick(skill, 'research', level, suffix).parameters);
    assert.deepEqual([200, 400, 800].map(l => bound('suxin-jue', l)), [11, 12, 11]);
    assert.deepEqual([200, 400, 800].map(l => bound('yunv-xinjing', l)), [6, 5, 7]);
    assert.deepEqual([499, 500].map(l => bound('yunv-xinjing', l)), [5, 9]);
    assert.equal(bound('suxin-jue', 200, 'all-forces'), 19);
    // 200 * (150 + 120 + 50) / 15 / 500 -> 8; + 4 + 9 -> 21;
    // random(21) <= 20; improve_skill: 1 + 20 * 100 / 300 -> 7.
    assert.equal(bound('yunv-xinjing', 200, 'all-forces'), 7);
    assert.equal(bound('suxin-jue', 200, 'cognize500'), 22);
    assert.equal(bound('yunv-xinjing', 200, 'cognize500'), 11);
    for (const skill of gumuForces) {
        assert.ok(bound(skill, 200, 'both') >= bound(skill, 200, 'guimai'));
        for (const level of [499, 500]) validateGumuCultivationRecord(row(pick(skill, 'research', level), true), pick(skill, 'research', level));
    }
});

test('知识不靠研究；医术复用识字而非独立医疗函数，武学修养虽属martial仍拒绝学研', () => {
    for (const skill of ['literate', 'medical', 'taoism', 'martial-cognize']) {
        assert.equal(pick(skill, 'research').parameters.expected, 'refused');
        const martial = skill === 'martial-cognize';
        assert.equal(gumuCultivationInterface(pick(skill, 'type').parameters), martial ? 'martial' : 'knowledge');
        assert.equal(gumuCultivationInterface(pick(skill, 'valid_learn_level').parameters), martial ? 200 : 999);
        if (skill !== 'taoism') assert.ok(!cases.some(c => c.parameters.skill === skill && c.parameters.ability === 'practice_skill'));
    }
    assert.equal(gumuCultivationOwner(pick('medical', 'valid_learn').parameters), '/kungfu/skill/literate');
    assert.equal(gumuCultivationOwner(pick('medical', 'valid_learn_level').parameters), '/inherit/skill/skill');
    assert.equal(gumuCultivationOwner(pick('medical', 'difficult_level').parameters), null);
    assert.equal(pick('taoism', 'valid_learn', 19, 'eunuch').parameters.expected, 'observed');
    assert.equal(pick('taoism', 'valid_learn', 20, 'eunuch').parameters.expected, 'refused');
    assert.equal(pick('martial-cognize', 'valid_research').parameters.expected, 'refused');
});

test('研究正返回但没经验/精神可无增长，部分研究消耗和末尾清零不混成完成三次', () => {
    for (const skill of gumuForces) {
        const partial = row(pick(skill, 'research', 200, 'partial'));
        assert.equal(partial.command_accepted, 1); assert.equal(partial.immediate[0].jing, 0);
        assert.equal(partial.immediate[0].learned_points, 2);
        for (const suffix of ['exp799999', 'jing26']) {
            const r = row(pick(skill, 'research', 200, suffix));
            assert.equal(r.command_accepted, 1); assert.equal(r.outcome, 'refused');
            assert.equal(r.immediate[0].learned_points, 0);
        }
        const normal = row(pick(skill, 'research', 200, 'neili0'));
        assert.equal(normal.immediate[0].neili, 0); assert.equal(normal.immediate[0].jing, 9973);
    }
});

test('校验拒绝缺失属性、伪造接口归属、资源/熟练度污染与目标变动', () => {
    const c = pick('yunv-xinjing', 'research');
    for (const mutate of [r => delete r.before[0].effective_str, r => delete r.before[0].effective_int,
        r => r.immediate[0].effective_str++, r => r.immediate[0].effective_int++,
        r => delete r.before[0].cultivation['reborn/int'],
        r => r.immediate[0].neili--, r => r.immediate[1].qi--, r => r.immediate[0].learned.force = 1,
        r => r.immediate[0].learned['yunv-xinjing'] = 9999, r => r.immediate[0].learned_points = 0,
        r => r.before[0].wizardp = 1]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuCultivationRecord(r, c));
    }
    const m = pick('medical', 'valid_learn');
    for (const mutate of [r => delete r.interfaces[0].implemented_by, r => r.interfaces[0].implemented_by = '/kungfu/skill/medical',
        r => r.interfaces[0].result = 0, r => delete r.interfaces[0].result]) {
        const r = row(m); mutate(r); assert.throws(() => validateGumuCultivationRecord(r, m));
    }
});

test('真实驱动的空闲与缺失接口null不误报，缺少结果或归属字段仍失败', () => {
    for (const c of cases.filter(c => c.method === 'interface' && gumuCultivationOwner(c.parameters) === null)) {
        const r = row(c);
        r.before[0].busy = null; r.immediate[0].busy = null;
        r.interfaces[0].result = null; r.interfaces[0].implemented_by = null;
        validateGumuCultivationRecord(r, c);
        for (const key of ['result', 'implemented_by']) {
            const missing = structuredClone(r); delete missing.interfaces[0][key];
            assert.throws(() => validateGumuCultivationRecord(missing, c));
        }
    }
    const c = pick('medical', 'valid_learn'), r = row(c);
    r.interfaces[0].result = null;
    assert.throws(() => validateGumuCultivationRecord(r, c));
});

test('摘要区分受理、实际增长和未知；不把容量接口及缺失观察混入研究收益', () => {
    const records = ['partial', 'exp799999', 'jing26'].map(s => row(pick('suxin-jue', 'research', 200, s)));
    records.push({ method: 'research', parameters: { skill: 'suxin-jue' } }, row(pick('suxin-jue', 'query_neili_limit')));
    const s = gumuCultivationEffects(records);
    assert.equal(s.research_samples, 4); assert.equal(s.accepted, 3); assert.equal(s.progressed, 1);
    assert.equal(s.completed_repetitions.unknown, 1); assert.equal(s.learned_gain.unknown, 1);
    assert.equal(s.jing_delta.unknown, 1); assert.equal(gumuCultivationEffects([]).learned_gain.mean, null);
});

test('真实记录删除parameters后按冻结条件统计研究熟练度，报告不把受理当作完成', () => {
    const c = pick('suxin-jue', 'research', 200, 'partial'), raw = row(c);
    delete raw.parameters;
    validateSchoolCombatRecord(raw, c);
    const summary = gumuCultivationEffects([raw], c);
    assert.equal(summary.learned_gain.mean, 2); assert.equal(summary.learned_gain.unknown, 0);
    assert.equal(summary.completed_repetitions.mean, 2); assert.equal(summary.accepted, 1);
    const report = { fingerprint: 'synthetic', evidence_sha256: 'not-driver-evidence',
        totals: { conditions: 1, samples: 1, observed: 1, refused: 0 }, conditions: [{
            ...c, counts: { observed: 1, refused: 0 }, gumu_cultivation: summary,
            effects: { callback_start_seconds: { mean: null }, target_callback_start_seconds: { mean: null } },
            cultivation: schoolCultivationEffects([{ outcome: raw.outcome, raw }], c.parameters.skill),
        }] };
    const text = schoolCombatMarkdown(report);
    assert.match(text, /古墓研究：命令受理与实际增长/);
    assert.match(text, /正返回但无进度/); assert.match(text, /公共知识及容量接口不计入研究收益/);
    assert.match(text, /\| 1 \| 1 \| 1 \| 2\.00 \| 2\.00 \|/);
    assert.equal(gumuCultivationEffects([raw]).learned_gain.unknown, 1);
});

test('共享夹具明确派发三类接口、真实归属和有效属性，冻结清单含本组', () => {
    const text = p => readFileSync(join(root, p), 'utf8');
    const runner = text('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /result\["effective_int"\] = ob->query_int\(\);/);
    for (const key of ['tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int', 'env/no_learn'])
        assert.ok(runner.includes('"' + key + '"'));
    assert.match(runner, /call_other\(spec\["object"\], "valid_research", players\[0\]\)/);
    assert.match(runner, /call_other\(spec\["object"\], "valid_force", spec\["argument"\]\)/);
    assert.match(runner, /call_other\(spec\["object"\], "can_learn", players\[0\], spec\["argument"\]\)/);
    assert.match(runner, /\["argument"\] = spec\["argument"\];/);
    assert.match(runner, /collection_group"\] == "gumu-cultivation"\)[\s\S]*?function_exists\(spec\["function"\],[\s\S]*?spec\["object"\] == "player" \? players\[0\]/);
    assert.match(runner, /"valid_learn", "valid_research", "can_learn", "practice_skill"/);
    assert.match(runner, /collection_group"\] == "gumu-cultivation" && side == 0 && value > 0 &&\s+member_array\(key, \(\{ "apply\/str", "apply\/int" \}\)\)/);
    assert.ok(text('tools/tests/martial_data/execution.mjs').includes("'tools/tests/martial_data/school_gumu_cultivation_cases.mjs'"));
    assert.match(text('tools/tests/martial_data/school_combat_report.mjs'), /gumuCultivationEffects\([\s\S]*?\.map\(r => r\.raw\), condition\)/);
});

test('读取本库源码证实公式和继承，不把缺失方法伪造为独立默认实现', () => {
    const text = p => readFileSync(join(root, p), 'utf8');
    assert.match(text('kungfu/skill/yunv-xinjing.c'), /query\("int", 1\) < 32/);
    assert.match(text('kungfu/skill/surge-force.c'), /query_str\(\) < 45/);
    assert.match(text('kungfu/skill/medical.c'), /replace_program\(SKILL_D\("literate"\)\)/);
    for (const skill of [...gumuForces, 'xuanmen-neigong', 'huashan-xinfa'])
        assert.doesNotMatch(text(`kungfu/skill/${skill}.c`), /\bquery_action\s*\(/);
    for (const p of ['inherit/skill/skill.c', 'inherit/skill/force.c', 'kungfu/skill/suxin-jue.c'])
        assert.doesNotMatch(text(p), /\b(?:difficult_level|query_neili_improve)\s*\(/);
    assert.match(text('cmds/skill/learn.c'), /SKILL_D\(skill_name\)->valid_force\(skill\)/);
    assert.match(text('feature/skill.c'), /amount \+= amount \* mlvl \/ 500/);
    assert.equal(gumuCultivationSkills.length, 7);
});
