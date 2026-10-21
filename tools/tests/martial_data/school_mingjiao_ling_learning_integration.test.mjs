// Collector wiring checks, not gameplay samples.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { mingjiaoLingLearningConditions, mingjiaoLingLearningSourcePaths, mingjiaoLingLearningEffects } from './school_mingjiao_ling_learning_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoLingLearningConditions(catalog, read);
let copied;
const snapshot = () => copied ??= createSandbox(root);

test('圣火令学习40条件80计划，严格尾追加，未运行不冒充已采', () => {
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-ling-perform', 'mingjiao-apprentice-learning', 'mingjiao-public-force', 'mingjiao-teachers', 'mingjiao-recruit', 'mingjiao-gift', 'mingjiao-book', 'mingjiao-qkd', 'mingjiao-jiuyang', 'mingjiao-jiuyang-learning', 'mingjiao-jiuyang-direct', 'mingjiao-jiuyang-remaining', 'mingjiao-jiuyang-exert', 'mingjiao-jiuyang-capacity', 'mingjiao-jiuyang-research', 'mingjiao-jiuyang-fusion', 'mingjiao-remaining-perform', 'mingjiao-remaining-base', 'mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group)).slice(-40), cases);
    assert.equal(cases.length, 40);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 80);
    assert.equal(cases.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.method === 'interface').length, 24);
    assert.equal(cases.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.method === 'practice').length, 16);
    assert.equal(mingjiaoLingLearningConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 80);
    for (const c of cases) assert.equal(c.parameters.capture_skill_loads, undefined);
    assert.equal(cases[0].parameters.interface.function, 'valid_enable');
    assert.equal(cases[0].parameters.interface.argument, 'sword');
    assert.deepEqual(cases[0].parameters.actor.mappings, {});
});

test('圣火令学习来源及3工具冻结，原15文件48探针不扩展', () => {
    const s = snapshot();
    validateQualificationSources(cases, s.files);
    for (const path of mingjiaoLingLearningSourcePaths) assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    for (const name of ['school_mingjiao_ling_learning_cases.mjs', 'school_mingjiao_ling_learning_cases.test.mjs',
        'school_mingjiao_ling_learning_integration.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    }
    const fusion = s.probes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = s.probes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    assert.equal(probes.length, 15);
    assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.throws(() => validateQualificationSources(cases, { ...s.files,
        [mingjiaoLingLearningSourcePaths[0]]: '0'.repeat(64) }));
});

test('圣火令学习的原命令/接口/武器不扩成任意执行', () => {
    const s = snapshot();
    const command = structuredClone(cases.find(c => c.method === 'practice'));
    command.parameters.action = 'perform sword.can right';
    assert.throws(() => validateQualificationSources([command], s.files));
    const iface = structuredClone(cases[0]);
    iface.parameters.interface.object = '/adm/daemons/combatd';
    assert.throws(() => validateQualificationSources([iface], s.files));
    const load = structuredClone(cases[0]);
    load.parameters.capture_skill_loads = [];
    assert.throws(() => validateQualificationSources([load], s.files));
    const gear = structuredClone(cases.find(c => c.parameters.actor.equipment));
    gear.parameters.actor.equipment.program = '/tests/sword';
    assert.throws(() => validateQualificationSources([gear], s.files));
});

test('学习接口使用原USER入口，practice保留真实部分进度，无新攻击或随机探针', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /if \(!active \|\| this_player\(\) != players\[0\]\) return 0/);
    assert.ok(runner.includes('original ordinary USER learning context'));
    assert.ok(runner.includes('"entry_actor": file_name(this_player())'));
    assert.ok(runner.includes('"loaded_before": objectp(find_object(spec["object"]))'));
    assert.ok(runner.includes('current["interface_context"]["return_actor"]'));
    assert.ok(runner.includes('current["outcome"] = step["skills"][grant] > current["before"][0]["skills"][grant] || step["learned"][grant] > current["before"][0]["learned"][grant]'));
    for (const key of ['tattoo/tattoo_str', 'tattoo/tattoo_int', 'tattoo/tattoo_dex', 'env/no_learn'])
        assert.ok(runner.includes(key));
    assert.doesNotMatch(runner, /random\([^\n]*mingjiao-ling-learning|destruct\([^\n]*shenghuo-ling/);
});

test('同一练习同时含通用和圣火令统计时只展示专用行，其他通用练习保留', () => {
    // Renderer-only empty data: no synthetic trace is counted as real collection.
    const genericPractice = {
        command_accepted: 0, partial_progress: 0, progress: { mean: null },
        qi_cost: { mean: null }, neili_cost: { mean: null },
        jing_net_cost: { mean: null }, jingli_net_cost: { mean: null },
        force_attribute_delta: { mean: null },
    };
    const conditions = cases.map(c => ({
        ...c, recorded: 0, planned: c.samples, missing: c.samples,
        counts: { observed: 0, refused: 0, error: 0, not_applicable: 0 },
        mingjiao_ling_learning: mingjiaoLingLearningEffects([], c),
        ...(c.method === 'practice' ? { practice: structuredClone(genericPractice) } : {}),
    }));
    conditions.push({ id: 'generic-practice-control', method: 'practice',
        counts: { observed: 0, refused: 0 }, practice: genericPractice });
    const report = { fingerprint: 'renderer-test', evidence_sha256: 'not-real-evidence',
        totals: { conditions: 41, samples: 0, observed: 0, refused: 0, errors: 0 }, conditions };
    const before = structuredClone(report), markdown = schoolCombatMarkdown(report);
    assert.deepEqual(report, before, '排版不得修改JSON统计');
    for (const c of conditions)
        assert.equal(markdown.split('\n').filter(line => line.startsWith(`| ${c.id} |`)).length, 1, c.id);
    const generic = markdown.split('## 原命令练习：全部完成与部分进度分列')[1].split('## ')[0];
    assert.ok(generic.includes('| generic-practice-control |'));
    assert.ok(!generic.includes('school-mingjiao-ling-learning-'));
    assert.ok(markdown.includes('## 明教圣火令：资格接口与原练习进度'));
});
