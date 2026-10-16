// Integration checks only; synthetic reports are never collection evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';
import { publicForceEffects } from './school_public_force_report.mjs';
import { mingjiaoPublicForceConditions, mingjiaoPublicForceSourcePaths,
    mingjiaoPublicForceAbsentPaths } from './school_mingjiao_public_force_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoPublicForceConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('两内功122条件1812正式244烟雾，追加注册不替代原九阳或旧样本', () => {
    assert.equal(cases.length, 122);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1812);
    assert.equal(mingjiaoPublicForceConditions(catalog, read, { smoke: true })
        .reduce((n, c) => n + c.samples, 0), 244);
    const all = schoolCombatConditions(catalog);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'mingjiao-public-force'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.deepEqual([...new Set(cases.map(c => c.parameters.skill))],
        ['shenghuo-xinfa', 'shenghuo-shengong']);
    assert.ok(cases.every(c => c.method === 'exert' && c.parameters.observe_seconds === 0));
});

test('冻结工具、来源与缺席证据齐全，既有15文件48站探针不变', () => {
    const s = snapshot(); validateQualificationSources(cases, s.files);
    for (const p of mingjiaoPublicForceSourcePaths)
        assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    for (const p of mingjiaoPublicForceAbsentPaths) assert.equal(s.files[p], undefined);
    for (const name of ['school_mingjiao_public_force_cases.mjs',
        'school_mingjiao_public_force_cases.test.mjs', 'school_mingjiao_public_force_integration.test.mjs']) {
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
});

test('参数不能改为任意命令、伪专属能力、预写增益或缺少来源', () => {
    const s = snapshot();
    for (const mutate of [c => c.parameters.action = 'eval 1',
        c => c.entry_id = 'kungfu/skill/force/lifeheal.c:6:exert',
        c => c.parameters.skill = 'jiuyang-shengong',
        c => c.parameters.actor.temp = { power: 1 },
        c => c.parameters.interface = { function: 'exert' },
        c => delete c.parameters.source_evidence[mingjiaoPublicForceSourcePaths[0]],
        c => c.parameters.absent_sources.pop()]) {
        const c = structuredClone(cases[0]); mutate(c);
        assert.throws(() => validateQualificationSources([c], s.files));
    }
    const files = { ...s.files, [mingjiaoPublicForceAbsentPaths[0]]: 'f'.repeat(64) };
    assert.throws(() => validateQualificationSources(cases, files));
});

test('真实快照增加not_living与性格，不更改时钟、随机或游戏效果', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.ok(runner.includes('"gumu-public-force", "mingjiao-public-force"'));
    assert.ok(runner.includes('result["not_living"] = ob->query("not_living")'));
    assert.ok(runner.includes('result["cultivation"]["character"] = ob->query("character")'));
    assert.ok(cases.every(c => !c.parameters.callback && !c.parameters.timed_effect));
});

test('即时运功报告非伤害单列，未采样不填写零效果，生成不改输入', () => {
    const report = { fingerprint: 'unit-only', evidence_sha256: 'not-sample-evidence',
        totals: { conditions: 122, samples: 0, observed: 0, refused: 0, errors: 0 },
        conditions: cases.map(c => ({ ...c, planned: c.samples, recorded: 0, missing: c.samples,
            counts: { observed: 0, refused: 0, error: 0, not_applicable: 0 },
            public_force: publicForceEffects([]) })) };
    const before = structuredClone(report), md = schoolCombatMarkdown(report);
    assert.deepEqual(report, before);
    assert.ok(md.includes('公共内功即时作用') && md.includes('未观测'));
    for (const c of cases) assert.equal(md.split(`| ${c.id} |`).length - 1, 1);
});
