// Wiring tests only; synthetic render checks are not collected gameplay evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { mingjiaoXinfaConditions, mingjiaoXinfaSourcePaths, mingjiaoXinfaAbsentPaths,
    mingjiaoXinfaEffects } from './school_mingjiao_xinfa_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoXinfaConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('圣火心法尾追加24条件，146正式与48烟雾独立，随机及生命周期不混算', () => {
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'mingjiao-xinfa'), cases);
    assert.equal(cases.length, 24);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 146);
    assert.equal(mingjiaoXinfaConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 48);
    const expiry = cases.find(c => c.parameters.variant === 'a-expiry');
    assert.equal(expiry.samples, 2);
    assert.equal(expiry.parameters.observe_seconds, 32);
    assert.equal(expiry.parameters.probability_scope, 'lifecycle_only');
    assert.equal(cases.find(c => c.parameters.variant === 'a-low30').samples, 100);
});

test('圣火心法来源及三份采集工具逐文件冻结，缺席回退也受核验', () => {
    const state = snapshot();
    validateQualificationSources(cases, state.files);
    for (const path of mingjiaoXinfaSourcePaths)
        assert.equal(state.files[path], sha256(readFileSync(join(root, path))));
    for (const path of mingjiaoXinfaAbsentPaths) assert.ok(!Object.hasOwn(state.files, path));
    for (const name of ['school_mingjiao_xinfa_cases.mjs', 'school_mingjiao_xinfa_cases.test.mjs',
        'school_mingjiao_xinfa_integration.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(readFileSync(join(root, path))));
    }
    assert.throws(() => validateQualificationSources(cases, { ...state.files,
        [mingjiaoXinfaAbsentPaths[0]]: '0'.repeat(64) }), /缺席入口被复制/);
    assert.throws(() => validateQualificationSources(cases, { ...state.files,
        [mingjiaoXinfaSourcePaths[0]]: '0'.repeat(64) }), /来源未复制或字节改变/);
});

test('圣火心法复用原快照、接口、命令及回调，不在观察器中增加施招或随机', () => {
    const source = read('tools/tests/martial_data/runner.lpc');
    assert.match(source, /"taohua-force", "mingjiao-xinfa"/);
    assert.match(source, /"gumu-cultivation",\s*"taohua-force",\s*"mingjiao-xinfa"/);
    assert.match(source, /"apply\/attack", "apply\/dodge", "apply\/parry"/);
    assert.match(source, /"mingjiao-xinfa"\) \{\s*\/\/[^\n]*\n\s*current\["actions"\] = \(\{\}\);\s*current\["directs"\] = \(\{\}\);/);
    assert.doesNotMatch(source, /call_other\([^\n]*shenghuo-xinfa[^\n]*remove_effect/);
    assert.doesNotMatch(source, /random\([^\n]*mingjiao-xinfa/);
});

test('圣火心法专节空数据保留未知，不填零伤害或假造概率', () => {
    const c = { ...cases[0], planned: cases[0].samples, recorded: 0,
        counts: { observed: 0, refused: 0, error: 0, not_applicable: 0 }, effects: null,
        mingjiao_xinfa: mingjiaoXinfaEffects([], cases[0]) };
    const md = schoolCombatMarkdown({ fingerprint: 'synthetic-only', evidence_sha256: 'synthetic-only',
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 }, conditions: [c] });
    assert.match(md, /圣火心法/);
    assert.match(md, /未知/);
    assert.ok(md.includes(c.id));
});
