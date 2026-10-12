// Original Qingfa inquiry and room action; no injected ordination permission.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

export const shaolinTonsureSources = [
    'kungfu/class/shaolin/qing-fa.c', 'kungfu/class/shaolin/qing.h',
    'kungfu/class/shaolin/shaolin.h', 'adm/daemons/named.c',
    'cmds/std/ask.c', 'feature/command.c',
];
const reviewed = 'd9e06a132fb48d66d5607b90950597cbc8d27658f90cbd9cb46f9cf40c890009';

export function shaolinTonsureConditions(relations, readSource) {
    if (relations.objects.every(t => t.learning_permissions === undefined)) return [];
    const evidence = [...shaolinTonsureSources].sort().map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), reviewed,
        '少林剃度源码变化，须重新核对');
    const path = 'kungfu/class/shaolin/qing-fa.c';
    const t = relations.objects.find(t => t.path === path);
    assert.ok(t, path);
    const teacher = { path: '/' + path.slice(0, -2), id: 'qingfa biqiu', name: '清法比丘', sha256: t.sha256 };
    const source = readSource(path), line = source.split('\n').findIndex(l => /^string ask_for_join\(\) \{/.test(l)) + 1;
    assert.ok(line > 0);
    const entry = { id: `${path}:${line}:ask_for_join`, path, function: 'ask_for_join', line, role: 'teaching', sha256: t.sha256 };
    const result = [];
    const ask = (topic = '剃度', pending = 1) => ({ action: `ask ${teacher.id} about ${topic}`,
        command_kind: 'ask', command_accepted: 1, pending });
    // No emote save is copied: a kneel without the NPC's pending flag is unhandled.
    const kneel = (tonsured = true) => ({ action: 'kneel', command_kind: 'kneel',
        command_accepted: tonsured ? 1 : 0, pending: 0, tonsured });
    function add(id, steps, overrides = {}, samples = 2) {
        const properties = { name: '试客', gender: '男性', class: '', family: 0, title: '江湖过客',
            PKS: 3, MKS: 7, K_record: 777, shen_record: 888, shen: 1234,
            gongxian: 100, str: 30, con: 30, dex: 30, int: 30, combat_exp: 10000,
            neili: 6000, max_neili: 6000, jing: 10000, potential: 10000, learned_points: 0, ...overrides };
        result.push({ id: `teaching-shaolin-tonsure-${id}`, stage: 'school', method: 'teaching',
            entry_id: entry.id, samples, status: 'configured_not_executed', parameters: {
                teacher, topic: '剃度与出家', teaching_profile: 'shaolin-tonsure', teaching_kind: 'ordination',
                action: steps[0].action, tonsure_name: properties.name,
                actor: { properties, skills: { force: 30, buddhism: 10 }, mappings: {} },
                target: { skills: {}, mappings: {}, properties: {} }, named_participants: true,
                teaching_entry: entry, teaching_evidence: entry,
                qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
                fighting: false, observe_seconds: 0, not_applicable: '', monitored_grants: [],
                teaching_expectations: steps, expected: steps.some(e => e.pending || e.tonsured) ? 'observed' : 'refused',
                variant: id, note: '只在临时角色登记初始姓名；受戒许可、更名、杀人及正邪记录由原NPC产生。剃度不等于拜师；无正式姓名或表情存档。',
            } });
    }
    for (const [id, topic] of [['tonsure', '剃度'], ['join', '出家']]) {
        add('ask-' + id, [ask(topic)]);
        add('complete-' + id, [ask(topic), kneel()], {}, id === 'tonsure' ? 100 : 2);
    }
    add('kneel-without-ask', [kneel(false)]);
    add('repeat', [ask(), ask('出家'), kneel(), kneel(false), ask('出家', 0), kneel(false)]);
    for (const [id, changes] of [['already-bonze', { class: 'bonze' }], ['female', { gender: '女性' }], ['neuter', { gender: '无性' }]])
        add(id, [ask('剃度', 0), kneel(false)], changes);
    for (const [id, family] of [['foreign', { family_name: '武当派', generation: 3, master_id: 'old', master_name: '旧师父' }],
        ['shaolin', { family_name: '少林派', generation: 41, master_id: 'other', master_name: '旧师父' }]])
        add(id, [ask(), kneel()], { family });
    add('negative-shen', [ask(), kneel()], { shen: -1234 });
    add('zero-records', [ask(), kneel()], { shen: 0, PKS: 0, MKS: 0 });
    add('single-character-name', [ask(), kneel()], { name: '测' });
    add('fresh-records', [ask(), kneel()], { K_record: 0, shen_record: 0 });
    return result;
}
