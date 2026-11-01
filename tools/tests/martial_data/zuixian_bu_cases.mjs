// Interface-level observation for zuixian-bu (醉仙望月步), the none-group core
// skill with no perform entry. Pure queries only: the local valid_learn /
// valid_enable / query_dodge_msg and the inherited defaults. practice_skill's qi
// cost boundary and dodge combat effects are explicitly out of this batch.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const zuixianBuId = 'zuixian-bu';
export const zuixianBuPath = 'kungfu/skill/zuixian-bu.c';
export const zuixianBuDodgeMsgs = Object.freeze([
    '「醉里乾坤」', '「太白醉酒」', '「移行幻影」', '「醉仙望月」', '「如梦似幻」',
]);
export const zuixianBuInterfaces = Object.freeze([
    { fn: 'valid_learn', argument: undefined, result: 1, note: '本地 valid_learn 无条件放行' },
    { fn: 'type', argument: undefined, result: 'martial', note: '继承默认 type' },
    { fn: 'valid_learn_level', argument: undefined, result: 200, note: '继承默认 valid_learn_level' },
    { fn: 'valid_enable', argument: 'dodge', usage: 'dodge', result: 1, note: '本地 valid_enable 支持 dodge' },
    { fn: 'valid_enable', argument: 'move', usage: 'move', result: 1, note: '本地 valid_enable 支持 move' },
    { fn: 'valid_enable', argument: 'sword', usage: 'sword', result: 0, note: '本地 valid_enable 拒绝非 dodge/move' },
    { fn: 'query_dodge_msg', argument: undefined, result: 'dodge_msg_member', note: '本地 query_dodge_msg 返回五式原句之一' },
]);

export function zuixianBuConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean');
    assert.ok(Array.isArray(catalog?.skills));
    const source = catalog.skills.find(s => s.id === zuixianBuId);
    assert.ok(source, 'zuixian-bu 不在技能目录');
    assert.equal(source.path, zuixianBuPath);
    const bytes = readSource(zuixianBuPath);
    assert.equal(hash(bytes), source.sha256, 'zuixian-bu 源与目录快照不一致');
    const text = bytes.toString();
    for (const marker of ['醉里乾坤', '太白醉酒', '移行幻影', '醉仙望月', '如梦似幻'])
        assert.ok(text.includes(marker), '五式原句缺失：' + marker);
    assert.match(text, /inherit SKILL;/);
    const cases = [];
    for (const spec of zuixianBuInterfaces) {
        cases.push({
            id: `zuixian-bu-${spec.fn.replaceAll('_', '-')}${spec.argument ? '-' + spec.argument : ''}`,
            stage: 'skill',
            entry_id: source.entries.find(e => e.function === spec.fn)?.id ?? zuixianBuPath,
            method: 'interface',
            samples: smoke ? 1 : 2,
            parameters: {
                collection_group: 'public-local-interfaces',
                skill: zuixianBuId,
                actor: { skills: { 'zuixian-bu': 200 }, mappings: {}, preparations: {},
                    properties: { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
                        max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000 } },
                target: { skills: {}, mappings: {}, preparations: {}, properties: {} },
                interface: { object: '/kungfu/skill/zuixian-bu', function: spec.fn,
                    ...(spec.argument ? { argument: spec.argument } : {}),
                    ...(spec.usage ? { usage: spec.usage } : {}) },
                action: 'test_interface', fighting: false, observe_seconds: 0,
                observation: 'single_action_immediate', not_applicable: '',
                expected: 'observed', expected_result: spec.result,
                qualification_sources: [zuixianBuPath, 'feature/skill.c', 'inherit/skill/skill.c'],
                note: 'none 组核心技能接口级观察；' + spec.note
                    + '。纯查询，不改变资源/技能/状态；practice_skill 费用边界与 dodge 战斗效果不在本批。',
            },
        });
    }
    return cases;
}

export function validateZuixianBuRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(condition.stage, 'skill');
    assert.equal(condition.method, 'interface');
    assert.equal(p.collection_group, 'public-local-interfaces');
    assert.equal(p.skill, zuixianBuId);
    assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, 'interface');
    assert.equal(raw.outcome, 'observed');
    assert.equal(raw.interfaces.length, 1);
    const call = raw.interfaces[0];
    assert.equal(call.object, '/kungfu/skill/zuixian-bu');
    assert.equal(call.function, p.interface.function);
    if (p.interface.argument !== undefined) assert.equal(call.argument, p.interface.argument);
    if (p.expected_result === 'dodge_msg_member')
        assert.ok(zuixianBuDodgeMsgs.some(m => String(call.result).includes(m)),
            'query_dodge_msg 结果须为五式原句之一');
    else assert.equal(call.result, p.expected_result, '接口原返回值');
    assert.deepEqual(raw.metrics, [{}, {}]);
    const strip = s => { const t = { ...s, temp: { ...(s.temp ?? {}) } }; delete t.temp.notify_fail; return t; };
    assert.deepEqual(raw.immediate.map(strip), raw.before.map(strip), '纯查询不改变状态');
    assert.deepEqual(raw.after.map(strip), raw.before.map(strip), '纯查询不改变状态');
}
