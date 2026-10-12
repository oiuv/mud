// Independent preparation only: original ask callbacks, not a replacement executor.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';
import { distribution } from './statistics.mjs';

const wall = 'can_learn/yunv-xinjing/wall';
export const gumuAcquisitionLearningLessons = [
    { id: 'lin', npc: 'lin chaoying', name: '林朝英', topic: '玉女心经',
        skill: 'yunv-xinjing', function: 'ask_xinjing', acquisition: 'wall_permission' },
    { id: 'yang', npc: 'yang guo', name: '杨过', topic: '黯然销魂掌',
        skill: 'sad-strike', function: 'teach_sad', acquisition: 'initial_skill' },
];
export const gumuAcquisitionLearningSources = [...new Set([
    'cmds/std/ask.c', 'adm/single/simul_efun/message.c',
    'feature/skill.c', 'feature/attribute.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c',
    'inherit/char/char.c', 'inherit/char/npc.c', 'inherit/skill/skill.c',
    'kungfu/class/gumu/gumu.h', 'kungfu/class/gumu/lin.c', 'kungfu/class/gumu/yang.c',
    ...['force', 'yunv-xinjing', 'sad-strike', 'unarmed', 'martial-cognize', 'literate', 'dodge']
        .map(id => `kungfu/skill/${id}.c`),
])].sort();
export const gumuAcquisitionLearningReviewed = 'c3b2b690d7ae8eb188495049ce0191939293af977b9fe7705fde30c6c2749af6';
export const gumuAcquisitionLearningFixtureRequirements = [
    'Register only Lin ask_xinjing and Yang teach_sad; use the original ask and original inquiry closures, not teach_pfm or direct permission writes.',
    'Reuse real-player Gumu teacher preparation and cleanup without adding student qualifications; separate preparation from the observed asks.',
    'Extend only this profile with read-only teaching-state gender, sadly from static/sadly, and effective_str; preserve raw int/str and effective_int/force separately.',
    'Apply explicit initial wall/known-skill conditions once before observation; repeat asks retain the same student, teacher, resources, permission and skills without refill.',
    'Allow reviewed nonzero initial permissions and skill acquisition through ask in the profile validator/outcome classifier; do not relax other teaching profiles.',
    'Use the frozen condition in effects, observe all three grant keys and full skills/learned/maps; keep random ask jing cost separate from zero contribution fee.',
];

const effective = (a, id) => Math.trunc((a.skills[id] ?? 0) / 2) + (a.skills[a.mappings[id]] ?? 0);

// Source oracle only. The original callback returns 1 on grant, repeat and refusal;
// command acceptance must never be used as the acquisition-success predicate.
export function gumuAcquisitionLearningDecision(lesson, actor) {
    const q = actor.properties, s = actor.skills;
    if (q.jing < 30) return { result: 'public_refused', response_contains: '你现在的精神不太好' };
    if (lesson.id === 'lin') {
        if (q['family/master_name'] !== '林朝英')
            return { result: 'business_refused', response_contains: '口诀我只传授给我的弟子' };
        if (q[wall]) return { result: 'already_known', response_contains: '口诀我不是已经传授给你了吗' };
        if ((s['yunv-xinjing'] ?? 0) < 180)
            return { result: 'business_refused', response_contains: '你玉女心经的修为还不够' };
        return { result: 'acquired', response_contains: '现在我就将玉女心经的口诀传授给你' };
    }
    assert.equal(lesson.id, 'yang');
    if ((s['sad-strike'] ?? 0) >= 1) return { result: 'already_known', response_contains: '你不是已经会了吗' };
    for (const [denied, text] of [
        [q.gender !== '男性', '我这门武功只适合男性修炼'],
        [q['static/sadly'] < 3, '你体会不到那种思念妻子的情怀'],
        [['阴险奸诈', '心狠手辣'].includes(q.character), '你一心想着去害人'],
        [q.int < 34, '你先天悟性不足'], [q.str < 34, '你先天臂力不足'],
        [q.max_neili < 3000, '你的内力修为不足'], [effective(actor, 'force') < 320, '你内功修为不足'],
        [(s.unarmed ?? 0) < 200, '你的基本拳脚不够娴熟'],
        [(s['martial-cognize'] ?? 0) < 200, '你武学修养不足'],
    ]) if (denied) return { result: 'business_refused', response_contains: text };
    return { result: 'acquired', response_contains: '你学会了「黯然销魂掌」' };
}

export function gumuAcquisitionLearningConditions(relations, catalog, readSource, { smoke = false } = {}) {
    assert.equal(relations.source_fingerprint, catalog.source_fingerprint);
    const evidence = gumuAcquisitionLearningSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), gumuAcquisitionLearningReviewed,
        '古墓口诀/启蒙源码变化，须重新核对');
    const result = [];
    for (const lesson of gumuAcquisitionLearningLessons) {
        const path = `kungfu/class/gumu/${lesson.id}.c`, teacher = relations.objects.find(t => t.path === path);
        assert.equal(teacher?.sha256, evidence.find(e => e.path === path).sha256, '原教师来源不同');
        const src = readSource(path);
        const definitions = [...src.matchAll(new RegExp(`^\\s*(?:int|mixed) ${lesson.function}\\(\\) \\{`, 'gm'))];
        assert.equal(definitions.length, 1, '原询问函数入口不唯一');
        // Including leading whitespace must not move the physical source line.
        const offset = definitions[0].index + definitions[0][0].search(/(?:int|mixed) /);
        const line = src.slice(0, offset).split('\n').length;
        const entry = { id: `${path}:${line}:${lesson.function}`, path, line,
            function: lesson.function, sha256: teacher.sha256, role: 'teaching' };
        let origin;
        if (lesson.id === 'lin') {
            const grants = teacher.learning_permissions.filter(g => g.permission === wall && g.function === lesson.function);
            assert.equal(grants.length, 1, '原口诀权限来源不唯一');
            assert.equal(grants[0].value.value, 1); assert.equal(grants[0].receiver, 'me');
            assert.equal(grants[0].enclosing_function.line, line); origin = grants[0].evidence;
        } else {
            const assignments = teacher.skill_assignments.filter(g => g.id === 'sad-strike' && g.function === lesson.function);
            assert.equal(assignments.length, 1, '原首次启蒙来源不唯一');
            assert.equal(assignments[0].level.value, 10); assert.equal(assignments[0].receiver, 'ob');
            assert.equal(assignments[0].role, 'external_object_assignment'); origin = assignments[0].evidence;
        }
        assert.equal(origin.path, path); assert.equal(origin.sha256, teacher.sha256);
        const base = { teacher: { path: '/' + path.slice(0, -2), id: lesson.npc, sha256: teacher.sha256 },
            topic: lesson.topic, skill: lesson.skill, action: `ask ${lesson.npc} about ${lesson.topic}`,
            teaching_profile: 'gumu-acquisition-learning', teaching_kind: 'introductory_teaching',
            acquisition: lesson.acquisition, lesson: lesson.id,
            actor: { skills: { force: lesson.id === 'lin' ? 200 : 240,
                'yunv-xinjing': lesson.id === 'lin' ? 180 : 200,
                unarmed: 200, 'martial-cognize': 200, literate: 200, dodge: 200 },
                mappings: { force: 'yunv-xinjing' },
                properties: { 'family/family_name': '古墓派', 'family/master_id': lesson.npc,
                    'family/master_name': lesson.name, str: 34, int: 34, con: 30, dex: 30,
                    gender: '男性', character: '国士无双', 'static/sadly': 3,
                    shen: 0, gongxian: 0, combat_exp: 10000000, jing: 10000,
                    max_neili: 3000, neili: 3000, potential: 1000, learned_points: 0 } },
            target: { skills: { force: 1 }, mappings: {}, properties: {} },
            teaching_entry: entry, teaching_evidence: origin,
            qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
            fighting: false, observe_seconds: 0, not_applicable: '', known_issue: null,
            unchanged_properties: ['combat_exp'],
            monitored_grants: [wall, 'can_perform/sad-strike/xiao', 'can_perform/sad-strike/tuo'],
            note: '原ask询问口诀/首次启蒙，不代替自然拜师、sadly养成、后续学习或绝招领悟；两次仅核确定性状态与账目，不估计10–19精神费用的完整分布。',
        };
        const add = (variant, mutate = () => {}, repeat = false) => {
            const p = structuredClone(base); mutate(p.actor);
            for (const skill of Object.keys(p.actor.skills)) assert.ok(catalog.skills.some(s => s.id === skill), skill);
            const student = structuredClone(p.actor), expectations = [];
            for (let i = 0; i < (repeat ? 2 : 1); i++) {
                const decision = gumuAcquisitionLearningDecision(lesson, student);
                if (decision.result === 'acquired') {
                    if (lesson.id === 'lin') student.properties[wall] = 1;
                    else student.skills['sad-strike'] = 10;
                }
                expectations.push({ action: p.action, ...decision, contribution_spent: 0, learned_points_spent: 0,
                    grants_after: Object.fromEntries(p.monitored_grants.map(g => [g, student.properties[g] ?? 0])),
                    skills_after: { ...student.skills }, learned_after: {} });
                // Only the high-jing baseline repeats; even two maximum charges
                // cannot reach the public gate. No simulated charge is emitted.
                if (repeat) assert.ok(p.actor.properties.jing >= 49);
            }
            result.push({ id: `teaching-gumu-acquisition-${lesson.id}-${variant}`, stage: 'school', method: 'teaching',
                entry_id: entry.id, samples: smoke ? 1 : 2, status: 'configured_not_executed',
                parameters: { ...p, variant, expected: expectations.some(e => e.result === 'acquired') ? 'observed' : 'refused',
                    teaching_expectations: expectations } });
        };
        add('grant'); add('repeat', undefined, true);
        if (lesson.id === 'lin') {
            add('skill-low', a => { a.skills['yunv-xinjing'] = 179; });
            add('master-other', a => { a.properties['family/master_name'] = '另一位师父'; });
            add('known-low', a => { a.properties[wall] = 1; a.skills['yunv-xinjing'] = 179; });
            add('known-other-master', a => { a.properties[wall] = 1; a.properties['family/master_name'] = '另一位师父'; });
            add('jing29', a => { a.properties.jing = 29; });
            add('jing30', a => { a.properties.jing = 30; });
        } else {
            add('gender-female', a => { a.properties.gender = '女性'; });
            add('gender-sexless', a => { a.properties.gender = '无性'; });
            add('sadly-low', a => { a.properties['static/sadly'] = 2; });
            add('character-deceitful', a => { a.properties.character = '阴险奸诈'; });
            add('character-cruel', a => { a.properties.character = '心狠手辣'; });
            add('raw-int-low', a => { a.properties.int = 33; });
            add('raw-str-low', a => { a.properties.str = 33; });
            add('max-neili-low', a => { a.properties.max_neili = 2999; });
            add('effective-force-low', a => { a.skills.force = 239; });
            add('unarmed-low', a => { a.skills.unarmed = 199; });
            add('cognition-low', a => { a.skills['martial-cognize'] = 199; });
            add('known-one', a => {
                a.skills['sad-strike'] = 1; a.skills.force = 0; a.skills['yunv-xinjing'] = 0;
                a.skills.unarmed = 0; a.skills['martial-cognize'] = 0;
                a.properties.gender = '女性'; a.properties.character = '心狠手辣';
                a.properties['static/sadly'] = 0; a.properties.int = 1; a.properties.str = 1;
                a.properties.max_neili = 0; a.properties.neili = 0;
            });
            add('known-high', a => { a.skills['sad-strike'] = 200; });
            add('no-extra-gates', a => {
                a.properties['family/family_name'] = '武当派'; a.properties['family/master_id'] = 'other teacher';
                a.properties['family/master_name'] = '另一位师父'; a.properties.neili = 0;
                a.properties.gongxian = -1; a.properties.shen = -100000;
            });
            add('unmapped-force-exact', a => { a.skills.force = 640; a.mappings = {}; });
        }
    }
    return result;
}

function checkState(point, actor, grants, skills, label) {
    const q = actor.properties;
    assert.ok(point && typeof point === 'object', label);
    for (const [key, value] of Object.entries({ contribution: q.gongxian, neili: q.neili, max_neili: q.max_neili,
        potential: q.potential, learned_points: q.learned_points, combat_exp: q.combat_exp,
        str: q.str, int: q.int, con: q.con, dex: q.dex, gender: q.gender, sadly: q['static/sadly'],
        character: q.character, shen: q.shen, family: q['family/family_name'],
        master_id: q['family/master_id'], master_name: q['family/master_name'],
        effective_int: q.int + Math.trunc((skills.literate ?? 0) / 10),
        effective_str: q.str + Math.trunc((skills.unarmed ?? 0) / 10),
        effective_force: effective({ ...actor, skills }, 'force'),
        effective_dodge: effective({ ...actor, skills }, 'dodge'),
    })) assert.equal(point[key], value, `${label}.${key}`);
    assert.deepEqual(point.skills, skills, label + '.skills');
    assert.deepEqual(point.learned, {}, label + '.learned');
    assert.deepEqual(point.mappings, actor.mappings, label + '.mappings');
    assert.deepEqual(point.grants, grants, label + '.grants');
    assert.ok(Number.isInteger(point.jing), label + '.jing');
}

export function validateGumuAcquisitionLearningRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.teaching_profile, 'gumu-acquisition-learning');
    assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, 'teaching');
    if (raw.outcome === 'error') return;
    assert.equal(raw.outcome, p.expected);
    const lesson = gumuAcquisitionLearningLessons.find(l => l.id === p.lesson); assert.ok(lesson);
    assert.ok(Array.isArray(raw.teaching));
    assert.equal(raw.teaching.length, p.teaching_expectations.length);
    assert.equal(raw.before.length, 2); assert.equal(raw.after.length, 2);
    let skills = { ...p.actor.skills }, grants = Object.fromEntries(p.monitored_grants.map(g => [g, p.actor.properties[g] ?? 0]));
    let jing = p.actor.properties.jing, totalCost = 0, previous, teacher;
    for (let i = 0; i < raw.teaching.length; i++) {
        const step = raw.teaching[i], e = p.teaching_expectations[i];
        assert.equal(step.student, raw.before[0].object, '原询问学生归属');
        assert.equal(step.teacher_program, p.teacher.path);
        assert.ok(typeof step.teacher === 'string' && step.teacher.startsWith(p.teacher.path + '#'), '原教师克隆身份');
        if (teacher) assert.equal(step.teacher, teacher, '重复询问必须保留同一教师');
        teacher = step.teacher;
        assert.equal(step.command, e.action); assert.equal(step.command, p.action);
        assert.equal(step.command_accepted, 1, '原ask即使拒绝也返回1');
        assert.ok(Number.isFinite(step.elapsed) && step.elapsed >= 0);
        checkState(step.before, p.actor, grants, skills, `step${i}.before`);
        assert.equal(step.before.jing, jing, '原询问前精神不得回填');
        if (previous) assert.deepEqual(step.before, previous, '重复询问不得暗补状态');
        const decision = gumuAcquisitionLearningDecision(lesson, { ...p.actor, skills,
            properties: { ...p.actor.properties, [wall]: grants[wall], jing } });
        assert.equal(e.result, decision.result, '冻结预期须符合原分支');
        assert.equal(e.response_contains, decision.response_contains);
        const cost = step.before.jing - step.after.jing;
        assert.ok(Number.isInteger(cost));
        if (decision.result === 'public_refused') assert.equal(cost, 0, '公共jing门槛不得扣费');
        else assert.ok(cost >= 10 && cost <= 19, '原ask扣10–19精神，包括已知和业务拒绝');
        if (decision.result === 'acquired') {
            if (lesson.id === 'lin') grants = { ...grants, [wall]: 1 };
            else skills = { ...skills, 'sad-strike': 10 };
        }
        assert.deepEqual(e.grants_after, grants); assert.deepEqual(e.skills_after, skills);
        assert.deepEqual(e.learned_after, {}); assert.equal(e.contribution_spent, 0); assert.equal(e.learned_points_spent, 0);
        checkState(step.after, p.actor, grants, skills, `step${i}.after`);
        assert.deepEqual({ ...step.after, jing: step.before.jing, skills: step.before.skills, grants: step.before.grants },
            step.before, '只允许原精神扣费及口诀/首次set_skill变化');
        assert.equal(step.message_scope, 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(step.messages));
        for (const m of step.messages) { assert.equal(typeof m.category, 'string'); assert.equal(typeof m.text, 'string'); }
        assert.ok(step.messages.some(m => m.text.includes(decision.response_contains)), '原分支回应缺失');
        totalCost += cost; jing = step.after.jing; previous = step.after;
    }
    const first = raw.teaching[0].before, last = raw.teaching.at(-1).after;
    for (const [snapshot, state] of [[raw.before[0], first], [raw.after[0], last]]) {
        for (const key of ['jing', 'neili', 'max_neili', 'str']) assert.equal(snapshot[key], state[key], '全样本与步骤' + key);
        for (const key of ['skills', 'learned', 'mappings']) assert.deepEqual(snapshot[key], state[key], '全样本与步骤' + key);
    }
    assert.equal(raw.after[0].object, raw.before[0].object);
    assert.deepEqual(raw.after[1], raw.before[1], '询问不得改变旁观者');
    assert.ok(Array.isArray(raw.metrics)); assert.equal(raw.metrics.length, 2);
    for (let side = 0; side < 2; side++) for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
        const metric = raw.metrics[side]; assert.ok(metric && typeof metric === 'object');
        for (const direction of ['cost', 'recovery']) {
            const key = `${resource}_${direction}`, expected = side === 0 && resource === 'jing' && direction === 'cost' ? totalCost : 0;
            if (Object.hasOwn(metric, key)) assert.ok(Number.isInteger(metric[key]) && metric[key] >= 0, key);
            assert.equal(metric[key] ?? 0, expected, '原单向资源账不允许额外相抵：' + key);
        }
    }
    for (const key of ['launches', 'attacks', 'defenses', 'passives', 'callbacks', 'terminals'])
        assert.deepEqual(raw[key], [], '询问不得伪造攻击/回调：' + key);
}

export function gumuAcquisitionLearningEffects(rows, condition) {
    assert.equal(condition.parameters.teaching_profile, 'gumu-acquisition-learning');
    const p = condition.parameters, steps = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); validateGumuAcquisitionLearningRecord(row.raw, condition);
        assert.notEqual(row.raw.outcome, 'error', '错误样本不得混入效果分母');
        for (let i = 0; i < row.raw.teaching.length; i++)
            steps.push({ step: row.raw.teaching[i], result: p.teaching_expectations[i].result });
    }
    const counts = Object.fromEntries(['acquired', 'already_known', 'business_refused', 'public_refused']
        .map(result => [result, steps.filter(s => s.result === result).length]));
    const charged = steps.filter(s => s.result !== 'public_refused');
    return { samples: rows.length, asks: steps.length, result_counts: counts,
        wall_permissions_acquired: p.lesson === 'lin' ? counts.acquired : 0,
        initial_sad_skills_acquired: p.lesson === 'yang' ? counts.acquired : 0,
        contribution_spent: 0, learned_points_spent: 0,
        charged_asks: charged.length, uncharged_asks: counts.public_refused,
        charged_jing_spent: distribution(charged.map(({ step }) => step.before.jing - step.after.jing)),
        all_asks_jing_spent: distribution(steps.map(({ step }) => step.before.jing - step.after.jing)),
        skill_changes: steps.map(({ step }) => Object.fromEntries([...new Set([
            ...Object.keys(step.before.skills), ...Object.keys(step.after.skills),
        ])].filter(id => (step.before.skills[id] ?? 0) !== (step.after.skills[id] ?? 0)).map(id => [id, {
            level_before: step.before.skills[id] ?? 0, level_after: step.after.skills[id] ?? 0,
            learned_before: step.before.learned[id] ?? 0, learned_after: step.after.learned[id] ?? 0,
        }]))),
    };
}
