// Source-guided teaching discovery, not full qualification/effect acceptance.
import assert from 'node:assert/strict';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { scanSource, sha256 } from './inventory.mjs';

const significant = source => tokenize(source).filter(t => !['comment', 'whitespace', 'directive'].includes(t.kind));
const strings = source => significant(source).filter(t => t.kind === 'string').map(t => JSON.parse(t.text));
const gates = new Set(['attempt_apprentice', 'accept_apprentice', 'permit_recruit']);
const skillId = /^[a-z][a-z0-9_-]*$/;

function npcId(source) {
    const call = scanSource(source).calls.find(c => c.name === 'set_name' && c.function === 'create');
    return call?.args[1] && strings(call.args[1].raw)[0];
}

function askTopics(sources, fn) {
    const found = new Set();
    for (const source of sources) for (const call of scanSource(source).calls
        .filter(c => c.name === 'set' && c.args[0]?.value === 'inquiry')) {
        const tokens = significant(call.args[1]?.raw ?? '');
        // Walk real mapping tokens; quoted examples/comments cannot become routes.
        for (let i = 0; i < tokens.length - 4; i++) {
            if (tokens[i].kind !== 'string' || tokens[i + 1].text !== ':') continue;
            const rest = tokens.slice(i + 2, i + 9).map(t => t.text).join('');
            if (rest.startsWith(`(:${fn}:)`))
                found.add(JSON.parse(tokens[i].text));
        }
    }
    return [...found];
}

function student(overrides = {}) {
    const actor = structuredClone(overrides);
    actor.skills = { force: 100, dodge: 100, parry: 100, ...actor.skills };
    actor.mappings = { ...actor.mappings };
    // No fictitious family: it would stop apprentice at the betrayal-confirmation gate.
    actor.properties = { name: '数据采集', gender: '男性', class: 'commoner',
        shen: 0, str: 30, con: 30, dex: 30, int: 30, combat_exp: 1000000,
        gongxian: 0, weiwang: 0, max_neili: 3000, neili: 3000,
        jing: 10000, eff_jing: 10000, potential: 10000, learned_points: 0, ...actor.properties };
    return actor;
}

export function buildTeachingProbePlan(plan, crosswalk, readSource, { learningSkills = {} } = {}) {
    const byId = new Map(crosswalk.items.map(i => [i.id, i]));
    const conditions = [], pending = [];
    for (const batch of plan.batches) for (const row of batch.rows) {
        try {
            const item = byId.get(row.declaration);
            assert.ok(item, '声明不在冻结对账中');
            const sourcePath = item.source?.path ?? item.teacher;
            assert.ok([sourcePath, item.teacher].every(p =>
                /^kungfu\/class\/[a-z0-9_/-]+\.(?:c|lpc|h)$/.test(p) && !p.split('/').includes('..')),
            '教学来源不是公开教师源码');
            const teacherSource = readSource(item.teacher), declarationSource = readSource(sourcePath);
            assert.equal(sha256(declarationSource), item.source.sha256, '教学声明源码已改变');
            const id = npcId(teacherSource);
            assert.ok(id, '无法定位真实NPC ID');
            const teacherPath = '/' + item.teacher.replace(/\.(?:c|lpc)$/, '');
            const profile = row.profile ?? {};
            let action, topic, kind, skill;
            if (item.function === 'recognize_apprentice') {
                skill = row.skill ?? learningSkills[item.id];
                assert.ok(skillId.test(skill ?? ''), '学习闸口必须指定真实技能，不能用数字代替技能');
                const declarations = [teacherSource, declarationSource].flatMap(s => scanSource(s).calls)
                    .filter(c => c.name === 'set_skill' && c.args[0]?.kind === 'string')
                    .map(c => c.args[0].value);
                assert.ok(declarations.includes(skill), '技能未在该教师来源中声明，动态/公共头文件关系须先核实');
                action = `learn ${id} ${skill} 1`; topic = '学习'; kind = 'learn_gate';
            } else if (gates.has(item.function)) {
                action = `apprentice ${id}`; topic = '拜师'; kind = 'recruit_gate';
            } else {
                const topics = askTopics([teacherSource, declarationSource], item.function);
                topic = row.topic ?? (topics.length === 1 ? topics[0] : null);
                assert.ok(topic && topics.includes(topic), '没有唯一且可验证的话题路由；禁止从函数名猜话题');
                action = `ask ${id} about ${topic}`; kind = 'ask_topic';
            }
            const entry = { id: `${sourcePath}:${item.source.line}:${item.function}`,
                path: sourcePath, sha256: item.source.sha256, role: 'teaching',
                function: item.function, line: item.source.line };
            const monitored = item.kind === 'grant' && item.grant ? [item.grant] : [];
            assert.ok(Number.isSafeInteger(row.samples) && row.samples > 0);
            const repetitions = profile.command_repetitions ?? 1;
            assert.ok(Number.isSafeInteger(repetitions) && repetitions > 0 && repetitions <= 3);
            conditions.push({ id: `probe-${batch.group}-${sha256(row.declaration).slice(0, 16)}`,
                stage: 'school', method: 'teaching', entry_id: entry.id,
                samples: row.samples, status: 'configured_not_executed',
                parameters: { teacher: { path: teacherPath, id, sha256: sha256(teacherSource) },
                    topic, action, ...(skill ? { skill } : {}), teaching_profile: 'probe',
                    probe_contract: 2, teaching_kind: kind, actor: student(profile.actor),
                    teaching_evidence: { ...item.source }, teaching_entry: entry,
                    qualification_sources: [...new Set([sourcePath, item.teacher])],
                    qualification_evidence: [...new Set([sourcePath, item.teacher])]
                        .map(path => ({ path, sha256: sha256(readSource(path)) })),
                    target: { skills: {}, mappings: {}, properties: {} }, named_participants: true,
                    fighting: false, observe_seconds: profile.observe_seconds ?? 0, not_applicable: '',
                    monitored_grants: monitored, known_issue: null, expected: ['observed', 'refused'],
                    teaching_expectations: Array.from({ length: repetitions }, () => ({
                        grant: monitored[0] ?? null, value: 0, contribution_spent: 0 })),
                    probe_declaration: row.declaration, probe_function: item.function,
                    probe_group: batch.group, probe_kind: row.kind,
                    note: '调查记录，不证明完整教学资格或声明覆盖；按真实授权、学习和师承变化分类。' } });
        } catch (error) {
            pending.push({ declaration: row.declaration, group: batch.group, reason: error.message });
        }
    }
    return { conditions, pending };
}

export function teachingProbeConditions(plan, crosswalk, readSource, options = {}) {
    const result = buildTeachingProbePlan(plan, crosswalk, readSource, options);
    assert.equal(result.pending.length, 0,
        `存在 ${result.pending.length} 项待核实；先查看 buildTeachingProbePlan().pending：`
        + result.pending.map(p => p.declaration + ': ' + p.reason).join('; '));
    return result.conditions;
}
