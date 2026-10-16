// Wiring tests, not gameplay samples. Actual drivers use independent evidence series.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { mingjiaoMovementConditions, mingjiaoMovementSourcePaths, mingjiaoMovementEffects } from './school_mingjiao_movement_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoMovementConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('明教三轻功尾追加86条件，2622正式与172烟雾，确定性和随机样本分开', () => {
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'mingjiao-movement'), cases);
    assert.equal(cases.length, 86);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2622);
    assert.equal(mingjiaoMovementConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 172);
    assert.ok(cases.every(c => ['shenghuo-bu', 'qingfu-shenfa', 'lingxu-bu'].includes(c.parameters.skill)));
    for (const c of cases.filter(c => c.method === 'practice')) assert.equal(c.samples, 2);
});

test('明教轻功来源和三份工具逐文件冻结，错调用或来源缺失拒绝', () => {
    const s = snapshot();
    validateQualificationSources(cases, s.files);
    for (const path of mingjiaoMovementSourcePaths)
        assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    for (const name of ['school_mingjiao_movement_cases.mjs', 'school_mingjiao_movement_cases.test.mjs',
        'school_mingjiao_movement_integration.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    }
    assert.throws(() => validateQualificationSources(cases, { ...s.files,
        [mingjiaoMovementSourcePaths[0]]: '0'.repeat(64) }), /来源未复制或字节改变/);
    const wrong = structuredClone(cases[0]); wrong.parameters.interface.object = '/kungfu/skill/qiankun-danuoyi';
    assert.throws(() => validateQualificationSources([wrong], s.files));
});

test('明教轻功仅观察原消息缓冲、选招和直伤，不造RNG或重复防御查询', () => {
    const src = read('tools/tests/martial_data/runner.lpc');
    assert.match(src, /"gumu-movement", "mingjiao-movement"/);
    assert.match(src, /"emei-shexing", "gumu-defense", "mingjiao-movement"/);
    assert.match(src, /current\["bhinfo"\]\["after"\] = serializable\(COMBAT_D->query_bhinfo\(\)\);/);
    assert.match(src, /current\["bhinfo"\]\["cleared"\] = serializable\(COMBAT_D->query_bhinfo\(\)\);/);
    assert.doesNotMatch(src, /random\([^\n]*mingjiao-movement/);
    assert.match(src, /member_array\(current\["parameters"\]\["collection_group"\],\s*\(\{ "mingjiao-movement", "mingjiao-qkd", "mingjiao-jiuyang" \}\)\) != -1\) \{\s*current\["actions"\] = \(\{\}\);\s*current\["directs"\] = \(\{\}\);/);
});

test('明教三轻功专节空样本保留未知，缺接口和普通防御率不混算', () => {
    const c = { ...cases[0], planned: cases[0].samples, recorded: 0,
        counts: { observed: 0, refused: 0, error: 0, not_applicable: 0 }, effects: null,
        mingjiao_movement: mingjiaoMovementEffects([], cases[0]) };
    const md = schoolCombatMarkdown({ fingerprint: 'synthetic-only', evidence_sha256: 'synthetic-only',
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 }, conditions: [c] });
    assert.match(md, /明教三轻功/);
    assert.match(md, /未知/);
    assert.match(md, /凌虚步/);
    assert.ok(md.includes(c.id));
});
