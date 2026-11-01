// Paired reproduction of the old probe's missing NPC initialization context.
// Error reproduction is diagnostic evidence, never successful teaching.
import assert from 'node:assert/strict';
import { scanSource, sha256 } from './inventory.mjs';

export const teaching43DiagnosticsGroup = 'teaching-43-diagnostics';
const routes = [
    { key: 'li', file: 'emei/li', id: 'li mingxia', topic: '上山', fn: 'ask_back',
        setup: 'startroom', response: '你不是长脚了吗', error: 'find_object' },
    { key: 'girl', file: 'generate/girl', id: 'ya huan', topic: 'name', fn: 'accept_ask',
        setup: 'owner', response: '给我起', error: 'call_other' },
    { key: 'dugu', file: 'ultra/dugu', id: 'dugu qiubai', topic: '评价', fn: 'ask_opinion',
        setup: 'singleton', response: '用兵器攻我一招', error: 'call_other' },
    { key: 'huang-opinion', file: 'ultra/huang', id: 'huang shang', topic: '评价', fn: 'ask_opinion',
        setup: 'singleton', response: '空手攻我一招', error: 'call_other' },
    { key: 'huang-skill', file: 'ultra/huang', id: 'huang shang', topic: '摄心大法', fn: 'ask_skill',
        setup: 'singleton', response: '阁下意下如何', error: 'call_other' },
    { key: 'huoshan', file: 'ultra/huoshan', id: 'huo shan', topic: '评价', fn: 'ask_opinion',
        setup: 'singleton', response: '比拚一下内力', error: 'call_other' },
    { key: 'kuihua', file: 'ultra/kuihua', id: 'kuihua taijian', topic: '评价', fn: 'ask_opinion',
        setup: 'singleton', response: '接我一招', error: 'call_other' },
];

export function teaching43DiagnosticConditions(readSource) {
    return routes.flatMap(route => ['original', 'prepared'].map(mode => {
        const sourcePath = 'kungfu/class/' + route.file + '.c';
        const source = readSource(sourcePath), fn = scanSource(source).functions.find(f => f.name === route.fn);
        assert.ok(fn, 'diagnostic original function missing');
        assert.ok(fn.text.includes(route.response), 'diagnostic response must come from the original function');
        const sources = [sourcePath, 'feature/noclone.c', 'cmds/std/ask.c'];
        const evidence = sources.map(path => ({ path, sha256: sha256(readSource(path)) }));
        const entry = { id: `${sourcePath}:${fn.line}:${route.fn}`, path: sourcePath,
            sha256: sha256(source), function: route.fn, line: fn.line, role: 'teaching' };
        const topic = route.key === 'girl' && mode === 'original' ? 'accept_ask' : route.topic;
        const action = `ask ${route.id} about ${topic}`;
        return { id: `teaching-43-diagnostic-${route.key}-${mode}`, stage: 'school', method: 'teaching',
            entry_id: entry.id, samples: 2, status: 'configured_not_executed', parameters: {
                collection_group: teaching43DiagnosticsGroup, teaching_profile: teaching43DiagnosticsGroup,
                teaching_kind: 'diagnostic', diagnostic_mode: mode, diagnostic_setup: route.setup,
                diagnostic_response: route.response, diagnostic_error: route.error,
                teacher: { path: '/' + sourcePath.slice(0, -2), id: route.id, sha256: sha256(source) },
                topic, action, teaching_entry: entry,
                teaching_evidence: { ...entry, start: fn.start, end: fn.end },
                qualification_sources: sources, qualification_evidence: evidence,
                actor: { skills: { force: 100, dodge: 100, parry: 100 }, mappings: {},
                    properties: { name: '教学诊断', gender: '男性', class: 'commoner',
                        shen: 0, str: 30, con: 30, dex: 30, int: 30, combat_exp: 1000000,
                        gongxian: 0, max_neili: 3000, neili: 3000,
                        qi: 10000, eff_qi: 10000, max_qi: 10000,
                        jing: 10000, eff_jing: 10000, max_jing: 10000, potential: 10000, learned_points: 0 } },
                target: { skills: {}, mappings: {}, properties: {} }, named_participants: true,
                fighting: false, observe_seconds: 0, expected: mode === 'original' ? 'error' : 'refused',
                monitored_grants: [], teaching_expectations: [{ action }], not_applicable: '',
                note: mode === 'original' ? '保留旧探测的缺上下文错误，错误不计教学通过。'
                    : '仅补原 NPC 的创建/摆放上下文，观察原询问响应；不宣称传授或自然养成。',
            } };
    }));
}

export function validateTeaching43DiagnosticRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, teaching43DiagnosticsGroup);
    assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, 'teaching');
    if (p.diagnostic_mode === 'original') {
        assert.equal(raw.outcome, 'error');
        assert.ok(raw.reason.includes(p.diagnostic_error), 'original initialization failure missing');
        assert.ok(raw.caught_error?.trace?.length, 'diagnostic requires actual caught stack');
        assert.ok(raw.caught_error.trace.some(f => p.diagnostic_setup === 'singleton'
            ? f.file === '/tests/runner.lpc' || f.file === '/tests/runner.c'
            : f.file === '/' + p.teaching_entry.path && f.function === p.teaching_entry.function));
        return [{ diagnostic: true, error_reproduced: true, advanced: false }];
    }
    assert.equal(p.diagnostic_mode, 'prepared');
    assert.equal(raw.outcome, 'refused', 'response-only diagnostic is not learned-skill success');
    assert.ok(!raw.caught_error, 'prepared context must not hide an error');
    assert.equal(raw.teaching?.length, 1);
    const step = raw.teaching[0];
    assert.equal(step.command, p.action);
    assert.equal(step.teacher_program, p.teacher.path);
    assert.equal(step.command_accepted, 1);
    assert.equal(step.student, raw.before[0].object);
    assert.equal(step.student, raw.after[0].object);
    if (p.diagnostic_setup === 'singleton') assert.equal(step.teacher, p.teacher.path);
    else assert.match(step.teacher.slice(p.teacher.path.length), /^#\d+$/);
    const text = [...(step.messages ?? []), ...(step.learn_messages ?? [])].map(m => m.text ?? '').join('\n');
    assert.ok(text.includes(p.diagnostic_response), 'original NPC response missing');
    const setup = raw.teaching_context;
    assert.equal(setup?.mode, 'prepared');
    assert.equal(setup.setup, p.diagnostic_setup);
    assert.equal(setup.teacher, step.teacher);
    assert.equal(setup.singleton, p.diagnostic_setup === 'singleton' ? 1 : 0);
    if (p.diagnostic_setup === 'owner') assert.equal(setup.owner, step.student);
    if (p.diagnostic_setup === 'startroom') assert.equal(setup.startroom, '/tests/runner');
    assert.deepEqual(step.before.skills, step.after.skills);
    assert.deepEqual(step.before.learned, step.after.learned);
    for (const key of ['jing', 'neili', 'skills', 'learned']) {
        assert.deepEqual(raw.before[0][key], step.before[key]);
        assert.deepEqual(raw.after[0][key], step.after[key]);
    }
    assert.equal(step.before.learned_points, step.after.learned_points);
    const cost = step.before.jing - step.after.jing;
    assert.ok(Number.isSafeInteger(cost) && cost >= 10 && cost <= 19);
    assert.equal(step.after.neili, step.before.neili);
    return [{ diagnostic: true, response_only: true, advanced: false }];
}
