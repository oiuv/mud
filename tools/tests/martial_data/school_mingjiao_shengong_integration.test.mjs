// Wiring checks only; these synthetic checks are not real gameplay samples.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { mingjiaoShengongConditions, mingjiaoShengongSourcePaths, mingjiaoShengongAbsentPaths,
    mingjiaoShengongEffects } from './school_mingjiao_shengong_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoShengongConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('圣火神功尾追加51条件，788正式与102烟雾分开，研究与自然时钟不混算', () => {
    const all = schoolCombatConditions(catalog).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-shenghuo', 'mingjiao-ling-learning', 'mingjiao-ling-perform', 'mingjiao-apprentice-learning', 'mingjiao-public-force', 'mingjiao-teachers', 'mingjiao-recruit', 'mingjiao-gift', 'mingjiao-book', 'mingjiao-qkd', 'mingjiao-jiuyang', 'mingjiao-jiuyang-learning', 'mingjiao-jiuyang-direct', 'mingjiao-jiuyang-remaining', 'mingjiao-jiuyang-exert', 'mingjiao-jiuyang-capacity', 'mingjiao-jiuyang-research', 'mingjiao-jiuyang-fusion', 'mingjiao-remaining-perform', 'mingjiao-remaining-base', 'mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout'].includes(c.parameters.collection_group));
    assert.deepEqual(all.slice(-51), cases);
    assert.equal(cases.length, 51);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 788);
    assert.equal(mingjiaoShengongConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 102);
    for (const [variant, seconds, level] of [['c-powerup-expiry', 22, 20], ['c-shield-expiry', 42, 40]]) {
        const c = cases.find(c => c.parameters.variant === variant);
        assert.equal(c.samples, 2);
        assert.equal(c.parameters.observe_seconds, seconds);
        assert.equal(c.parameters.actor.skills['shenghuo-shengong'], level);
        assert.equal(c.parameters.probability_scope, 'lifecycle_only');
    }
});

test('圣火神功来源、缺席回退与三份工具冻结；变化不能沿用旧证据', () => {
    const state = snapshot();
    validateQualificationSources(cases, state.files);
    for (const path of mingjiaoShengongSourcePaths)
        assert.equal(state.files[path], sha256(readFileSync(join(root, path))));
    for (const path of mingjiaoShengongAbsentPaths) assert.ok(!Object.hasOwn(state.files, path));
    for (const name of ['school_mingjiao_shengong_cases.mjs', 'school_mingjiao_shengong_cases.test.mjs',
        'school_mingjiao_shengong_integration.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(readFileSync(join(root, path))));
    }
    assert.throws(() => validateQualificationSources(cases, { ...state.files,
        [mingjiaoShengongSourcePaths[0]]: '0'.repeat(64) }), /来源未复制或字节改变/);
    assert.throws(() => validateQualificationSources(cases, { ...state.files,
        [mingjiaoShengongAbsentPaths[0]]: '0'.repeat(64) }), /缺席入口被复制/);
    const forged = structuredClone(cases.find(c => c.method === 'research'));
    forged.parameters.action = 'research force 1';
    assert.throws(() => validateQualificationSources([forged], state.files));
    const fusion = state.probes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = state.probes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    assert.equal(probes.length, 15);
    assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.ok(probes.every(p => p.path !== 'cmds/skill/research.c'));
});

test('圣火神功复用资源set观察及原接口回调，不添加随机、人工解除或研究探针', () => {
    const source = read('tools/tests/martial_data/runner.lpc');
    assert.match(source, /"taohua-force", "mingjiao-xinfa", "mingjiao-shengong"/);
    assert.match(source, /"gumu-cultivation", "gumu-movement", "mingjiao-shengong"/);
    assert.match(source, /"configured original holy force usage"/);
    assert.match(source, /"mingjiao-shengong"\) \{\s*current\["actions"\] = \(\{\}\);\s*current\["directs"\] = \(\{\}\);/);
    assert.doesNotMatch(source, /call_other\([^\n]*shenghuo-shengong[^\n]*remove_effect/);
    assert.doesNotMatch(source, /random\([^\n]*mingjiao-shengong/);
    assert.doesNotMatch(source, /research_clearings/);
    const actor = read('tools/tests/weapon_balance/actor.lpc');
    assert.match(actor, /observe_resource\(key, query\(key\) - before\)/);
});

test('圣火神功专节空数据保留未知，不生成零伤害或虚假完成', () => {
    const c = { ...cases[0], planned: cases[0].samples, recorded: 0,
        counts: { observed: 0, refused: 0, error: 0, not_applicable: 0 }, effects: null,
        mingjiao_shengong: mingjiaoShengongEffects([], cases[0]) };
    const md = schoolCombatMarkdown({ fingerprint: 'synthetic-only', evidence_sha256: 'synthetic-only',
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 }, conditions: [c] });
    assert.match(md, /圣火神功/);
    assert.match(md, /未知/);
    assert.ok(md.includes(c.id));
    assert.equal(c.mingjiao_shengong.samples, 0);
    assert.equal(c.mingjiao_shengong.completed.mean, null);
});
