import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
// Wiring checks only. Synthetic assertions are not collected combat samples.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { mingjiaoShenghuoConditions, mingjiaoShenghuoSourcePaths, mingjiaoShenghuoEffects } from './school_mingjiao_shenghuo_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoShenghuoConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('圣火联动42有限条件尾追加，主1942与两冷载200分开，不算已有回归实证', () => {
    assert.deepEqual(preOctober29SchoolConditions(catalog).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-ling-learning', 'mingjiao-ling-perform', 'mingjiao-apprentice-learning', 'mingjiao-public-force', 'mingjiao-teachers', 'mingjiao-recruit', 'mingjiao-gift', 'mingjiao-book', 'mingjiao-qkd', 'mingjiao-jiuyang', 'mingjiao-jiuyang-learning', 'mingjiao-jiuyang-direct', 'mingjiao-jiuyang-remaining', 'mingjiao-jiuyang-exert', 'mingjiao-jiuyang-capacity', 'mingjiao-jiuyang-research', 'mingjiao-jiuyang-fusion', 'mingjiao-remaining-perform', 'mingjiao-remaining-base', 'mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group)).slice(-42), cases);
    assert.equal(cases.length, 42);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2142);
    assert.equal(mingjiaoShenghuoConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 84);
    const main = cases.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.id.startsWith('school-mingjiao-shenghuo-main-'));
    assert.equal(main.length, 40);
    assert.equal(main.reduce((n, c) => n + c.samples, 0), 1942);
    assert.equal(main[0].method, 'ordinary');
    for (const level of [400, 800]) {
        const cold = cases.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.id.startsWith(`school-mingjiao-shenghuo-cold${level}-`));
        assert.equal(cold.length, 1);
        assert.equal(cold[0].samples, 100);
        assert.equal(cold[0].method, 'ordinary');
    }
});

test('圣火联动实际来源与三份工具冻结，15文件48探针无新增随机调用', () => {
    const s = snapshot();
    validateQualificationSources(cases, s.files);
    for (const path of mingjiaoShenghuoSourcePaths)
        assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    for (const name of ['school_mingjiao_shenghuo_cases.mjs', 'school_mingjiao_shenghuo_cases.test.mjs',
        'school_mingjiao_shenghuo_integration.test.mjs']) {
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
        [mingjiaoShenghuoSourcePaths[0]]: '0'.repeat(64) }), /来源未复制或字节改变/);
    const wrong = structuredClone(cases.find(c => c.method === 'interface'));
    wrong.parameters.interface.object = '/kungfu/skill/force';
    assert.throws(() => validateQualificationSources([wrong], s.files));
});

test('圣火新组两层原同步调用单独LIFO记录，不改变旧组的非嵌套检查', () => {
    const s = read('tools/tests/martial_data/runner.lpc');
    for (const name of ['shenghuo_attack_frames', 'shenghuo_passive_frames', 'passive_events',
        'attack_id', 'parent_attack_id', 'attack_depth', 'parent_id', 'parent_passive_id', 'stack_terminal'])
        assert.ok(s.includes(name), name);
    assert.match(s, /sizeof\(shenghuo_attack_frames\) < 2/);
    assert.match(s, /sizeof\(shenghuo_passive_frames\) < 2/);
    assert.match(s, /passive observation is not nested/);
    assert.match(s, /original holy observation stacks fully returned/);
    assert.match(s, /"explicit original holy weapon"/);
    assert.doesNotMatch(s, /random\([^\n]*shenghuo|shenghuo[^\n]*random\(/);
    assert.doesNotMatch(s, /destruct\([^\n]*shenghuo-ling/);
});

test('圣火新组的动作、接口与原始兵器不能变成任意执行输入', () => {
    const s = snapshot();
    const bad = structuredClone(cases.find(c => c.method === 'perform'));
    bad.parameters.action = 'perform sword.other right';
    assert.throws(() => validateQualificationSources([bad], s.files));
    const gear = structuredClone(cases[0]);
    gear.parameters.actor.equipment.program = '/tests/sword';
    assert.throws(() => validateQualificationSources([gear], s.files));
    const load = structuredClone(cases[0]);
    load.parameters.capture_skill_loads = [];
    assert.throws(() => validateQualificationSources([load], s.files), /原首载证据缺失/);
});

test('圣火专用报告沿原名残血令，空样本不捏造零伤或概率', () => {
    const c = cases.find(c => c.method === 'perform');
    const effects = mingjiaoShenghuoEffects([], c);
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-only', evidence_sha256: 'synthetic-only',
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 },
        conditions: [{ id: c.id, recorded: 0, planned: c.samples, mingjiao_shenghuo: effects }] });
    assert.match(markdown, /残血令/);
    assert.doesNotMatch(markdown, /残焰/);
    assert.match(markdown, /普通攻击没有命令回执/);
    assert.match(markdown, /未知（分母0）/);
    assert.equal(effects.ling_damage.mean, null);
    assert.equal(effects.public_damage.mean, null);
    assert.equal(effects.force_trigger.trials, 0);
    assert.equal(effects.force_trigger.low95, null);
});
