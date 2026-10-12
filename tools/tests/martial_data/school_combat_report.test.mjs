import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan, validateSchoolRun, schoolCombatEffects, schoolCombatMarkdown } from './school_combat_report.mjs';

test('门派报告范围固定于已审核条件，增量不冒充全门派；拒绝改条件/样本量', () => {
    const catalog = collectCatalog(root, buildInventory(root));
    const cases = schoolCombatConditions(catalog);
    validateSchoolCombatPlan(cases, catalog);
    validateSchoolCombatPlan(cases.slice(0, 2), catalog);
    assert.throws(() => validateSchoolCombatPlan([...cases, cases[0]], catalog));
    const changed = structuredClone(cases);
    changed[0].parameters.actor.skills.sword++;
    assert.throws(() => validateSchoolCombatPlan(changed, catalog), /条件/);
    assert.throws(() => validateSchoolCombatPlan(schoolCombatConditions(catalog, { smoke: true }), catalog), /条件/);
});

test('状态与命令成功分开；拒绝不混入控制/增益分母，忙乱不是经过秒数', () => {
    const raw = { before: [{ weapon: 'sword' }], immediate: [{ weapon: 'sword', busy: 3, temp: {} }, { busy: null }], metrics: [{}] };
    const altered = structuredClone(raw);
    altered.immediate[0].weapon = 'none';
    altered.immediate[1].busy = 20;
    altered.metrics[0].direct = 3;
    const result = schoolCombatEffects([{ outcome: 'observed', raw }, { outcome: 'observed', raw: altered }, { outcome: 'refused' }]);
    assert.equal(result.target_controlled.trials, 2);
    assert.equal(result.target_controlled.successes, 1);
    assert.equal(result.target_busy.mean, 10);
    assert.equal(result.actor_busy.mean, 3);
    assert.equal(result.weapon_dropped.successes, 1);
    assert.equal(result.direct_resolution.successes, 1);
    assert.equal(result.ziqi.successes, 0);
    assert.equal(result.callback_start_seconds.mean, null);
    assert.equal(result.callback_end_seconds.mean, null);
    assert.equal(schoolCombatEffects([{ outcome: 'refused' }]).target_controlled.rate, null);
    const markdown = schoolCombatMarkdown({ fingerprint: 'test', evidence_sha256: 'test',
        totals: { conditions: 0, samples: 0, observed: 0, refused: 0 }, conditions: [] });
    assert.match(markdown, /即时忙乱与掉剑为样本次数，不等于中途触发次数/);
    assert.match(markdown, /对方即时忙乱样本/);
});

test('持续时长来自回调实际时间，不拿设定等级或总观察窗口冒充', () => {
    const raw = { before: [{ weapon: 'sword' }], immediate: [{ weapon: 'sword', busy: 3, temp: {} }, { busy: null }],
        metrics: [{}], elapsed: 152.8, callbacks: [
            { side: 0, phase: 'before', elapsed: 150.2 },
            { side: 0, phase: 'after', elapsed: 150.3 },
        ] };
    const result = schoolCombatEffects([{ outcome: 'observed', raw }]);
    assert.equal(result.callback_start_seconds.mean, 150.2);
    assert.equal(result.callback_end_seconds.mean, 150.3);
});

test('错误报告须显式选择且原错误为受控退出末条，信号中止或损坏不放行', () => {
    const result = { interrupted: false, process: { code: 1, signal: null }, validation_errors: [], incomplete_bytes: 0, imported: 2 };
    const records = [{ outcome: 'observed' }, { outcome: 'error', reason: 'original failure' }];
    assert.throws(() => validateSchoolRun(result, 'DATA SAMPLE ERROR', records));
    validateSchoolRun(result, 'DATA SAMPLE ERROR', records, true);
    for (const bad of [
        { ...result, interrupted: true }, { ...result, incomplete_bytes: 1 },
        { ...result, validation_errors: ['bad'] }, { ...result, imported: 1 },
        { ...result, process: { code: 1, signal: 'SIGTERM' } },
    ]) assert.throws(() => validateSchoolRun(bad, 'DATA SAMPLE ERROR', records, true));
    assert.throws(() => validateSchoolRun(result, 'DATA SAMPLE ERROR', [...records].reverse(), true));
    assert.throws(() => validateSchoolRun(result, 'DATA COMPLETE', records, true));
    assert.throws(() => validateSchoolRun(result, 'DATA SAMPLE ERROR', [{ outcome: 'observed' }, { outcome: 'observed' }], true));
    validateSchoolRun({ ...result, process: { code: 0, signal: null } }, 'DATA COMPLETE', [{ outcome: 'observed' }, { outcome: 'refused' }]);
    const md = schoolCombatMarkdown({ fingerprint: 'test', evidence_sha256: 'test',
        totals: { conditions: 1, samples: 2, observed: 0, refused: 0, errors: 2 }, conditions: [],
        runtime_errors: [{ condition_id: 'case', index: 0 }] });
    assert.match(md, /运行错误 2/); assert.match(md, /不表示效果通过/); assert.match(md, /case\.0/);
});
