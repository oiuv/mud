// Collector integration only; these assertions do not create gameplay evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { mingjiaoLingPerformConditions, mingjiaoLingPerformSourcePaths, mingjiaoLingPerformEffects } from './school_mingjiao_ling_perform_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoLingPerformConditions(catalog, read);
let copied;
const snapshot = () => copied ??= createSandbox(root);

test('原39项加独立超重第40项，1452正式80烟雾，仅统一尾追加', () => {
    assert.equal(cases.length, 40);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'mingjiao-ling-perform'), cases);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1452);
    assert.equal(cases.filter(c => c.parameters.random_effects).length, 14);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 26);
    assert.equal(mingjiaoLingPerformConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 80);
    assert.equal(cases.at(-1).parameters.variant, 'overweight');
    assert.equal(cases.at(-1).parameters.actor_free_capacity, 5999);
    assert.ok(cases.slice(0, 39).every(c => c.parameters.actor_free_capacity === undefined));
    for (const c of cases) assert.equal(c.parameters.capture_skill_loads, undefined);
});

test('三绝招全部实际依赖与3新工具冻结，旧15文件48观察位点不增', () => {
    const s = snapshot();
    validateQualificationSources(cases, s.files);
    for (const p of mingjiaoLingPerformSourcePaths) assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    for (const name of ['school_mingjiao_ling_perform_cases.mjs', 'school_mingjiao_ling_perform_cases.test.mjs',
        'school_mingjiao_ling_perform_integration.test.mjs']) {
        const p = 'tools/tests/martial_data/' + name;
        assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    }
    const fusion = s.probes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = s.probes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    assert.equal(probes.length, 15);
    assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.throws(() => validateQualificationSources(cases, { ...s.files,
        [mingjiaoLingPerformSourcePaths[0]]: '0'.repeat(64) }));
});

test('三招只准原命令、原装备及明确容量配置，不开放脚本/物品改写', () => {
    const s = snapshot();
    for (const mutate of [c => c.parameters.action = 'eval destruct(this_player())',
        c => c.parameters.ability = 'can', c => c.parameters.actor.equipment.program = '/tests/sword',
        c => c.parameters.actor.equipment.weight = 1,
        c => c.parameters.target.equipment = { type: 'sword', program: '/clone/weapon/gangjian' },
        c => c.parameters.actor_free_capacity = 5999,
        c => c.parameters.capture_skill_loads = []]) {
        const c = structuredClone(cases[0]); mutate(c);
        assert.throws(() => validateQualificationSources([c], s.files));
    }
    const c = structuredClone(cases.at(-1)); c.parameters.actor_free_capacity = 6000;
    assert.throws(() => validateQualificationSources([c], s.files));
});

test('Runner复用USER首载、原装备和同对象三时点，不修落点或新增随机', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.ok(runner.includes('"command": "enable sword shenghuo-ling"'));
    assert.ok(runner.includes('"original holy perform USER enable context"'));
    assert.ok(runner.includes('ob->set_max_encumbrance(ob->query_encumbrance() + 5999);'));
    for (const phase of ['before', 'immediate', 'after'])
        assert.ok(runner.includes(`observe_ling_weapon("${phase}");`));
    for (const token of ['environment(ling_target_weapon)', 'ling_target_weapon->query("equipped")',
        'ob->query_encumbrance()', 'ob->query_max_encumbrance()', '"is_item_make": !!item->is_item_make()'])
        assert.ok(runner.includes(token));
    assert.doesNotMatch(runner, /ling_target_weapon->(?:move|set|set_weight|wield)\(/);
    assert.doesNotMatch(runner, /random\([^\n]*mingjiao-ling-perform|destruct\([^\n]*shenghuo-ling/);
});

test('三招专用两表分列效果与资源，无数据保持未知，不落通用伤害排名', () => {
    const report = { fingerprint: 'renderer-test', evidence_sha256: 'not-real-evidence',
        totals: { conditions: 40, samples: 0, observed: 0, refused: 0, errors: 0 },
        conditions: cases.map(c => ({ ...c, planned: c.samples, recorded: 0, missing: c.samples,
            counts: { observed: 0, refused: 0, error: 0, not_applicable: 0 },
            mingjiao_ling_perform: mingjiaoLingPerformEffects([], c) })) };
    const before = structuredClone(report), markdown = schoolCombatMarkdown(report);
    assert.deepEqual(report, before, '排版不得改JSON统计');
    const header = markdown.indexOf('## 明教圣火令：光华令、敛心令与吸焰令');
    assert.ok(header > 0);
    assert.ok(!markdown.slice(0, header).includes('school-mingjiao-ling-perform-'));
    for (const c of cases) {
        assert.equal(markdown.split('\n').filter(line => line.startsWith(`| ${c.id} |`)).length, 2,
            '效果与资源各一行，不另填通用伤害行：' + c.id);
    }
    assert.ok(markdown.includes('未知（分母0）'));
    assert.ok(markdown.includes('精神创伤'));
    assert.ok(markdown.includes('超重'));
});
