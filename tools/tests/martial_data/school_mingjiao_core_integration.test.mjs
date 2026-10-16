// Pure collector wiring checks; these assertions are not game-effect samples.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { mingjiaoCoreConditions, mingjiaoCoreSourcePaths, mingjiaoCoreEffects } from './school_mingjiao_core_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoCoreConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

function body(name) {
    const source = read('tools/tests/martial_data/runner.lpc');
    const start = new RegExp('(?:private\\s+)?(?:void|mapping)\\s+' + name + '\\([^;]*?\\)\\s*\\{').exec(source);
    assert.ok(start, name);
    const end = source.indexOf('\n}\n', start.index);
    assert.ok(end > start.index, name);
    return source.slice(start.index, end + 3);
}

test('明教首切片接线保持独立条件、原资格来源及明确实验靶规格', () => {
    const all = schoolCombatConditions(catalog).filter(c => c.id.startsWith('school-mingjiao-core-'));
    assert.deepEqual(all, cases);
    assert.equal(cases.length, 15);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 814);
    const smoke = mingjiaoCoreConditions(catalog, read, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 30);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(p.school, 'mingjiao');
        assert.equal(p.collection_group, 'mingjiao-core');
        assert.equal(p.actor.properties.jiali, 0);
        assert.equal(p.target.skills.parry, 3 * p.level);
        assert.equal(p.target.mappings.parry, undefined);
        assert.equal(p.named_participants, true);
        assert.ok(p.qualification_sources.includes('kungfu/class/mingjiao/weiyixiao.c'));
        assert.ok(p.qualification_sources.includes('kungfu/class/mingjiao/mingjiao.h'));
    }
});

test('明教来源冻结逐文件哈希，缺失、错入口与漂移均拒绝', () => {
    const state = snapshot();
    validateQualificationSources(cases, state.files);
    for (const path of mingjiaoCoreSourcePaths)
        assert.equal(state.files[path], sha256(readFileSync(join(root, path))));
    for (const name of ['school_mingjiao_core_cases.mjs', 'school_mingjiao_core_cases.test.mjs',
        'school_mingjiao_core_integration.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(readFileSync(join(root, path))));
    }
    for (const mutate of [
        c => { delete c.parameters.source_evidence[mingjiaoCoreSourcePaths[0]]; },
        c => { c.parameters.qualification_sources.pop(); },
        c => { c.parameters.skill = 'qishang-quan'; },
        c => { c.parameters.action = 'perform strike.xue right'; },
        c => { c.entry_id = 'kungfu/skill/other.c:1:perform'; },
    ]) {
        const wrong = structuredClone(cases[0]);
        mutate(wrong);
        assert.throws(() => validateQualificationSources([wrong], state.files));
    }
    const files = { ...state.files, [mingjiaoCoreSourcePaths[0]]: '0'.repeat(64) };
    assert.throws(() => validateQualificationSources(cases, files), /来源未复制或字节改变/);
});

test('明教观察只复用原回调，真实资格、副手、三项加成与原选招均可见', () => {
    for (const name of ['snapshot', 'prepare_actor', 'observe_attack', 'observe_selected_action',
        'begin_passive', 'observe_passive']) assert.match(body(name), /"mingjiao-core"/, name);
    assert.match(body('snapshot'), /"can_perform\/hanbing-mianzhang\/jue"/);
    assert.match(body('snapshot'), /"secondary_weapon_details"/);
    assert.match(body('snapshot'), /"fighting_opponent"/);
    for (const key of ['apply_attack', 'apply_damage', 'apply_unarmed_damage', 'neili'])
        assert.ok(body('observe_attack').includes('"' + key + '"'), key);
    assert.match(body('prepare_actor'), /present\(side \? "right" : "left", this_object\(\)\) == ob/);
    assert.doesNotMatch(body('observe_attack'), /\brandom\s*\(|do_attack\s*\(/);
    assert.doesNotMatch(body('observe_selected_action'), /query_action\s*\(|\brandom\s*\(/);
});

test('明教专节不落入旧通用effects消费，零样本显示未知而非造成功率', () => {
    const condition = { ...cases[0], planned: cases[0].samples, recorded: 0,
        counts: { observed: 0, refused: 0, error: 0, not_applicable: 0 }, effects: null,
        mingjiao_core: mingjiaoCoreEffects([], cases[0]) };
    const report = { fingerprint: 'synthetic-render-only', evidence_sha256: 'synthetic-render-only',
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 }, conditions: [condition] };
    const markdown = schoolCombatMarkdown(report);
    assert.match(markdown, /明教寒冰绵掌/);
    assert.match(markdown, /未知/);
    assert.match(markdown, /加力0不触发寒毒/);
    assert.ok(markdown.includes(condition.id));
});
