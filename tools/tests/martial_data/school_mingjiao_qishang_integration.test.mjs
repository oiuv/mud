// Collector integration only; synthetic rendering is not real game evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { mingjiaoQishangConditions, mingjiaoQishangSourcePaths, mingjiaoQishangEffects } from './school_mingjiao_qishang_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoQishangConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

function body(name) {
    const source = read('tools/tests/martial_data/runner.lpc');
    const start = new RegExp('(?:private\\s+)?(?:varargs\\s+)?(?:void|mapping)\\s+' + name + '\\([^;]*?\\)\\s*\\{').exec(source);
    assert.ok(start, name);
    const end = source.indexOf('\n}\n', start.index);
    assert.ok(end > start.index, name);
    return source.slice(start.index, end + 3);
}

test('七伤拳main与独立冷载矩阵尾追加，烟雾及正式分母不混算', () => {
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.id.startsWith('school-mingjiao-qishang-')), cases);
    const main = cases.filter(c => c.id.startsWith('school-mingjiao-qishang-main-'));
    assert.equal(cases.length, 37);
    assert.equal(main.length, 35);
    assert.equal(main.reduce((n, c) => n + c.samples, 0), 2324);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2524);
    const smoke = mingjiaoQishangConditions(catalog, read, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 74);
    assert.equal(main[0].parameters.level, 200);
    assert.equal(main[0].method, 'ordinary');
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(p.usage, 'cuff');
        assert.equal(p.actor.properties.jiali, 0);
        assert.equal(p.target.skills.force, 3 * p.level);
        assert.equal(p.target.skills.parry, 3 * p.level);
        assert.deepEqual(p.target.mappings, {});
        assert.ok(p.actor.properties.neili <= p.actor.properties.max_neili);
        assert.deepEqual(p.capture_skill_loads.map(x => x.skill), ['qishang-quan']);
    }
});

test('七伤拳实际来源与三份工具逐文件冻结，错命令或来源漂移拒绝', () => {
    const state = snapshot();
    validateQualificationSources(cases, state.files);
    for (const path of mingjiaoQishangSourcePaths)
        assert.equal(state.files[path], sha256(readFileSync(join(root, path))));
    for (const name of ['school_mingjiao_qishang_cases.mjs', 'school_mingjiao_qishang_cases.test.mjs',
        'school_mingjiao_qishang_integration.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(readFileSync(join(root, path))));
    }
    for (const mutate of [
        c => { delete c.parameters.source_evidence[mingjiaoQishangSourcePaths[0]]; },
        c => { c.parameters.qualification_sources.pop(); },
        c => { c.parameters.ability = 'jue'; },
        c => { c.parameters.usage = 'strike'; },
        c => { c.parameters.action = 'perform cuff.other right'; },
        c => { c.entry_id = 'kungfu/skill/other.c:1:perform'; },
    ]) {
        const wrong = structuredClone(cases[1]); mutate(wrong);
        assert.throws(() => validateQualificationSources([wrong], state.files));
    }
    assert.throws(() => validateQualificationSources(cases, { ...state.files,
        [mingjiaoQishangSourcePaths[0]]: '0'.repeat(64) }), /来源未复制或字节改变/);
});

test('七伤拳共用原有首载、已选动作、被动快照及原直伤观察，不造随机或多一次选招', () => {
    for (const name of ['snapshot', 'prepare_actor', 'observe_attack', 'observe_direct',
        'observe_selected_action', 'begin_passive', 'observe_passive', 'advance'])
        assert.match(body(name), /"mingjiao-qishang"/, name);
    assert.match(body('snapshot'), /can_perform\/qishang-quan\/fei/);
    assert.match(body('snapshot'), /can_perform\/qishang-quan\/shang/);
    assert.match(body('prepare_actor'), /capture_skill_loads/);
    assert.match(body('prepare_actor'), /retain original shared skill/);
    assert.doesNotMatch(body('observe_selected_action'), /query_action\s*\(|\brandom\s*\(/);
    assert.doesNotMatch(body('observe_direct'), /do_damage\s*\(|\brandom\s*\(/);
});

test('七伤拳专节空样本为未知，不读通用effects或将自伤当对方伤害', () => {
    const c = { ...cases[0], planned: cases[0].samples, recorded: 0,
        counts: { observed: 0, refused: 0, error: 0, not_applicable: 0 }, effects: null,
        mingjiao_qishang: mingjiaoQishangEffects([], cases[0]) };
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-only', evidence_sha256: 'synthetic-only',
        totals: { conditions: 1, samples: 0, observed: 0, refused: 0, errors: 0 }, conditions: [c] });
    assert.match(markdown, /明教七伤拳/);
    assert.match(markdown, /未知/);
    assert.match(markdown, /反噬自身/);
    assert.match(markdown, /首次200级/);
    assert.ok(markdown.includes(c.id));
});
