// Original Emei inquiries and room action; no injected ordination permission.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

const nuns = ['dao', 'feng', 'he', 'hui', 'jia', 'kong', 'xian', 'xin', 'xu', 'xuan', 'zhao', 'zhen'];
export const emeiTonsureSources = [...nuns, 'miejue'].map(n => `kungfu/class/emei/${n}.c`).concat([
    'kungfu/class/emei/tobebonze.h', 'kungfu/class/emei/emei.h',
    'adm/daemons/named.c', 'cmds/std/ask.c', 'cmds/std/secularize.c', 'feature/command.c',
]);
const reviewed = '4211eed40ef7f8a4d43621df719f46adf469ca0197fc6ef47abd25fc329f411f';

export function emeiTonsureConditions(relations, readSource) {
    if (relations.objects.every(t => t.learning_permissions === undefined)) return [];
    const evidence = [...emeiTonsureSources].sort().map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), reviewed,
        '峨嵋剃度源码变化，须重新核对');
    const result = [];
    for (const npc of [...nuns, 'miejue']) {
        const path = `kungfu/class/emei/${npc}.c`, source = readSource(path);
        const t = relations.objects.find(t => t.path === path);
        assert.ok(t, path);
        const [, name, id] = source.match(/set_name\("([^"]+)", \(\{ "([^"]+)"/);
        const teacher = { path: '/' + path.slice(0, -2), id, name, sha256: t.sha256 };
        const entryPath = npc === 'miejue' ? path : 'kungfu/class/emei/tobebonze.h';
        const fn = npc === 'miejue' ? 'ask_for_quit' : 'ask_for_join';
        const line = readSource(entryPath).split('\n').findIndex(l => l === `string ${fn}() {`) + 1;
        assert.ok(line > 0);
        const entry = { id: `${entryPath}:${line}:${fn}`, path: entryPath, function: fn, line,
            role: 'teaching', sha256: evidence.find(e => e.path === entryPath).sha256 };
        const ask = (topic = '剃度', pending = 1, quit_pending = 0) => ({
            action: `ask ${id} about ${topic}`, command_kind: 'ask', command_accepted: 1, pending, quit_pending });
        const kneel = (tonsured = true) => ({ action: 'kneel', command_kind: 'kneel',
            command_accepted: tonsured ? 1 : 0, pending: 0, tonsured });
        const secularize = (accepted = 1, quit_pending = 0) => ({ action: 'secularize',
            command_kind: 'secularize', command_accepted: accepted, pending: 0, quit_pending });
        function add(variant, steps, overrides = {}, samples = 2) {
            const properties = { name: '试客', gender: '女性', class: 'fighter',
                family: { family_name: '峨嵋派', generation: 5, master_id: 'li mingxia', master_name: '李明霞' },
                title: '峨嵋俗家弟子', PKS: 3, MKS: 7, K_record: 777, shen_record: 888, shen: 1234,
                'marks/old_name': '旧记录', gongxian: 100, str: 30, con: 30, dex: 30, int: 30,
                combat_exp: 10000, neili: 6000, max_neili: 6000, jing: 10000,
                potential: 10000, learned_points: 0, ...overrides };
            result.push({ id: `teaching-emei-tonsure-${npc}-${variant}`, stage: 'school', method: 'teaching',
                entry_id: entry.id, samples, status: 'configured_not_executed', parameters: {
                    teacher, topic: npc === 'miejue' ? '还俗与剃度指引' : '剃度与出家',
                    teaching_profile: 'emei-tonsure', teaching_kind: 'ordination', action: steps[0].action,
                    tonsure_name: properties.name, named_participants: true,
                    actor: { properties, skills: { force: 30, mahayana: 10 }, mappings: {} },
                    target: { properties: {}, skills: {}, mappings: {} },
                    teaching_entry: entry, teaching_evidence: entry,
                    qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
                    fighting: false, observe_seconds: 0, not_applicable: '', monitored_grants: [],
                    teaching_expectations: steps, expected: steps.some(e => e.pending || e.tonsured) ? 'observed' : 'refused',
                    variant, note: '仅布置初始姓名和师承。原询问、跪拜及还俗命令；还俗标记不算还俗成功，不改门派或模拟重入。',
                } });
        }
        if (npc === 'miejue') {
            const sequence = [ask('还俗', 0, 1), ask('还俗', 0, 1), secularize(1, 1), secularize(1, 1)];
            add('quit-bonze-blocked', sequence, { class: 'bonze' });
            add('quit-male-bonze-blocked', sequence, { class: 'bonze', gender: '男性' });
            add('quit-lay', [ask('还俗', 0), secularize(0)]);
            add('quit-foreign', [ask('还俗', 0)], { class: 'bonze', family: { family_name: '武当派' } });
            add('quit-no-family', [ask('还俗', 0)], { class: 'bonze', family: 0 });
            for (const [key, topic] of [['tonsure', '剃度'], ['join', '出家']])
                add('redirect-' + key, [ask(topic, 0), kneel(false)]);
            continue;
        }
        const available = !['dao', 'feng', 'he'].includes(npc);
        assert.equal(/"剃度": \(: ask_for_join :\)/.test(source), available);
        assert.equal(/"出家": \(: ask_for_join :\)/.test(source), available);
        if (!available) {
            for (const [key, topic] of [['tonsure', '剃度'], ['join', '出家']])
                add('unconfigured-' + key, [ask(topic, 0), kneel(false)]);
            add('kneel-without-ask', [kneel(false)]);
            continue;
        }
        for (const [key, topic] of [['tonsure', '剃度'], ['join', '出家']]) {
            add('ask-' + key, [ask(topic)]);
            add('complete-' + key, [ask(topic), kneel()], {}, key === 'tonsure' ? 100 : 2);
        }
        add('kneel-without-ask', [kneel(false)]);
        add('repeat', [ask(), ask('出家'), kneel(), kneel(false), ask('出家', 0), kneel(false)]);
        for (const [key, changes] of [
            ['already-bonze', { class: 'bonze' }], ['male', { gender: '男性' }], ['neuter', { gender: '无性' }],
            ['no-family', { family: 0 }], ['foreign', { family: { family_name: '武当派' } }],
        ]) add(key, [ask('剃度', 0), kneel(false)], changes);
        add('negative-shen', [ask(), kneel()], { shen: -1234 });
        add('zero-records', [ask(), kneel()], { shen: 0, PKS: 0, MKS: 0, K_record: 0, shen_record: 0 });
        add('purename', [ask(), kneel()], { name: '改名', purename: '本名' });
        add('single-character-name', [ask(), kneel()], { name: '测' });
        add('other-master', [ask(), kneel()], { family: { family_name: '峨嵋派', master_id: 'other', master_name: '旧师父' } });
        add('secularize-after', [ask(), kneel(), secularize(), secularize()]);
        add('quit-inquiry', [ask('还俗', 0)], { class: 'bonze' });
    }
    return result;
}
