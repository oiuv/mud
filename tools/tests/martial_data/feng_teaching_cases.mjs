// Original Feng recognize/no_teach/learn and probabilistic accept_ask.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';
import { learnedGain } from './school_huashan_learning_cases.mjs';

export const fengSources = {
    'kungfu/class/huashan/feng.c': 'c8c86d1a6ff403b9dce28d7daa5c3f930e013bde872daddd0897a87c1f320f06',
    'kungfu/skill/dugu-jiujian.c': '988894f85f8dc6c7c38e1ca81d490cc3060e09bed89c08dbf46fb7e85012fea8',
    'cmds/skill/learn.c': 'cb090d891b2bcfe93eefb34931f6e7b81be37f4ffd3c9ed6e475bc08ad041e6b',
    'cmds/std/ask.c': '568ca1c612f6efda4af6ee54e2712a56ff7ba66aa44c42024978a06b5e5836c2',
    'feature/skill.c': '99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
    'feature/dbase.c': '92199b08fca9830e3d734c5777ec1991fc8ea1085861d0f4646af4b3bd281faf',
    'feature/master.c': '8adc870cff8dbd2fcbec5d7d69972f6294f8288669c97773e3ea752ed51a2121',
    'feature/apprentice.c': 'd45dbb167fa87c5bcea3c43e1c9f1350f21570bbb3d77ab0e67fb7cd5b0f6c75',
    'feature/attribute.c': '1374357d87d48d6373d6f88cb84f0a3c5e4ebcf3b78a9c57d63148d6944f3924',
    'inherit/skill/skill.c': '891da821f84c26820c1e540822dba751f218441cc03f2b95a1fcfcc3923294cd',
    'kungfu/skill/sword.c': 'e5ab23fef7d3512584f9c00022c1ad1bf83d1b5ea8658dd0148702af64c87032',
};
export const fengTopics = {
    sword: ['破剑式', ['sword']], blade: ['破刀式', ['blade']], staff: ['破枪式', ['staff']],
    short: ['破鞭式', ['hammer', 'club', 'dagger']], whip: ['破索式', ['whip']],
    unarmed: ['破掌式', ['unarmed', 'finger', 'claw', 'strike', 'hand', 'cuff']],
    throwing: ['破箭式', ['throwing']], force: ['破气式', ['force']],
};
export const fengGrants = ['can_learn/feng/sword', 'can_learn/feng/dugu-jiujian',
    'can_perform/dugu-jiujian', 'can_perform/dugu/qi', 'can_perform/dugu/po'];

export function fengTeachingConditions(relations, catalog, readSource) {
    const path = 'kungfu/class/huashan/feng.c', teacher = relations.objects.find(o => o.path === path);
    if (teacher?.learning_permissions === undefined) return [];
    const evidence = Object.entries(fengSources).map(([path, hash]) => {
        assert.equal(sha256(readSource(path)), hash, '风清扬依赖变化，须重新核对：' + path);
        return { path, sha256: hash };
    });
    assert.equal(teacher.sha256, fengSources[path]);
    assert.ok(catalog.skills.some(s => s.id === 'dugu-jiujian'));
    const entry = fn => {
        const line = readSource(path).split('\n').findIndex(s => s.startsWith('int ' + fn + '(')) + 1;
        assert.ok(line > 0);
        return { id: `${path}:${line}:${fn}`, path, sha256: teacher.sha256, function: fn, line, role: 'teaching' };
    };
    const base = { teacher: { path: '/kungfu/class/huashan/feng', id: 'feng qingyang', sha256: teacher.sha256 },
        teaching_profile: 'feng', actor: {
            skills: { sword: 100, 'dugu-jiujian': 60, 'martial-cognize': 100, force: 1 }, mappings: {},
            properties: { 'family/family_name': '无门无派', str: 30, int: 39, con: 36, dex: 36,
                character: '狡黠多变', shen: 0, weiwang: 0, gongxian: 0,
                combat_exp: 1000000000, potential: 1000, learned_points: 0, jing: 10000, neili: 6000, max_neili: 6000 },
            equipment: { type: 'sword', hold: false } },
        target: { skills: { force: 1 }, mappings: {}, properties: {} },
        monitored_grants: fengGrants, qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
        fighting: false, observe_seconds: 0, not_applicable: '', known_issue: null,
        note: '经原NPC与ask/learn，技能及属性为实验赋值；不预写教师许可或兵器知识，不直接调用教学函数。随机无进展与资格拒绝分开；破枪式原写staff，不修成spear。',
    };
    const result = [];
    const add = (id, p, steps, samples) => {
        const e = entry(p.teaching_kind === 'weapon_knowledge' ? 'accept_ask' : 'recognize_apprentice');
        result.push({ id: 'teaching-feng-' + id, method: 'teaching', stage: 'school', entry_id: e.id,
            samples, status: 'configured_not_executed', parameters: { ...p, teaching_entry: e,
                teaching_evidence: { path, line: e.line, sha256: teacher.sha256 }, teaching_expectations: steps } });
    };
    function learn(id, options = {}) {
        const p = structuredClone(base), skill = options.skill ?? 'dugu-jiujian';
        Object.assign(p.actor.properties, options.properties); Object.assign(p.actor.skills, options.skills);
        if (options.unarmed) delete p.actor.equipment;
        p.topic = skill === 'sword' ? '基本剑法学习' : skill === 'force' ? '其他武学拒绝' : '独孤九剑学习';
        p.action = `learn feng qingyang ${skill} 1`; p.teaching_kind = 'ordinary_learning';
        p.learn_skill = skill;
        const permit = options.permit ?? 'dugu-jiujian', learns = options.learns ?? true;
        p.expected = permit !== 'none' || learns ? 'observed' : 'refused';
        const step = { command_kind: 'learn', permit, learns, accepted: options.accepted ?? 1,
            blocked: options.blocked ?? 0, told: options.told ?? 0,
            visited: skill === 'dugu-jiujian' && permit === 'dugu-jiujian' && !options.told ? 1 : 0 };
        add('learn-' + id, p, Array.from({ length: options.repeat ?? 1 }, () => ({ ...step })), options.checks ?? (learns ? 100 : 2));
    }
    learn('normal'); learn('basic-sword', { skill: 'sword' });
    learn('dugu0', { skills: { 'dugu-jiujian': 0 } });
    learn('dugu100', { skills: { 'dugu-jiujian': 100 } });
    learn('dugu101', { skills: { sword: 101, 'dugu-jiujian': 101 }, learns: false, told: 1 });
    for (const int of [29, 30, 34, 35, 38]) for (const skill of ['sword', 'dugu-jiujian']) {
        const permit = int >= 35 && skill === 'sword' ? 'sword' : 'none';
        learn(`${skill}-int${int}`, { skill, properties: { int }, permit, learns: permit === 'sword', blocked: int < 35 ? 1 : 0 });
    }
    for (const [id, property, value] of [['ruthless', 'character', '心狠手辣'], ['devious', 'character', '阴险奸诈'],
        ['upright', 'character', '光明磊落'], ['shen-high', 'shen', 100001], ['shen-low', 'shen', -100001],
        ['renown-high', 'weiwang', 10001]])
        learn(id, { properties: { [property]: value }, permit: 'none', learns: false, blocked: 1, repeat: 2 });
    for (const shen of [-100000, 100000]) learn('shen' + shen, { properties: { shen } });
    learn('renown10000', { properties: { weiwang: 10000 } });
    learn('basic99', { skills: { sword: 99 }, permit: 'none', learns: false });
    learn('other-skill', { skill: 'force', permit: 'none', learns: false });
    learn('unarmed', { unarmed: true, learns: false, accepted: 0 });
    learn('no-potential-repeat', { properties: { potential: 0 }, learns: false, accepted: 0, repeat: 2 });
    learn('jing0', { properties: { jing: 0 }, learns: false });
    learn('exp0', { properties: { combat_exp: 0 }, learns: false });
    for (const family of ['华山派', '华山剑宗']) learn(family === '华山派' ? 'huashan' : 'jianzong',
        { properties: { 'family/family_name': family } });

    function knowledge(id, key = 'sword', options = {}) {
        const p = structuredClone(base), [topic, types] = fengTopics[key];
        p.teaching_kind = 'weapon_knowledge'; p.topic = topic; p.knowledge_types = types;
        p.action = `ask feng qingyang about ${topic}`;
        Object.assign(p.actor.properties, options.properties); Object.assign(p.actor.skills, options.skills);
        p.expected = options.refused ? 'refused' : ['observed', 'refused'];
        add('knowledge-' + id, p, [{ command_kind: 'ask' }, { command_kind: 'ask' }], options.refused ? 2 : 100);
    }
    for (const key of Object.keys(fengTopics)) knowledge(key, key);
    for (const potential of [0, 9, 10]) knowledge('potential' + potential, 'sword', { properties: { potential }, refused: potential < 10 });
    knowledge('no-dugu', 'sword', { skills: { 'dugu-jiujian': 0 }, refused: true });
    knowledge('exp0', 'sword', { properties: { combat_exp: 0 } });
    knowledge('nothing', 'sword', { properties: { 'can_learn/dugu-jiujian/nothing': 1 } });
    knowledge('not-learning-qualified', 'sword', { properties: { int: 29, character: '心狠手辣', shen: 200000, weiwang: 20000 } });
    return result;
}

export function validateFengObservation(steps, condition) {
    const p = condition.parameters, summaries = [];
    assert.equal(steps.length, p.teaching_expectations.length);
    let previous;
    for (const [i, step] of steps.entries()) {
        const b = step.before, a = step.after, e = p.teaching_expectations[i];
        assert.equal(step.teacher_program, p.teacher.path);
        assert.match(step.teacher, /^\/kungfu\/class\/huashan\/feng#\d+$/);
        assert.equal(step.command, p.action);
        assert.ok(Number.isFinite(step.elapsed) && step.elapsed >= 0);
        assert.equal(step.message_scope, 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(step.messages));
        assert.ok(!step.offered_item);
        if (previous) {
            assert.deepEqual(b, previous.after); assert.equal(step.student, previous.student); assert.equal(step.teacher, previous.teacher);
        } else {
            assert.deepEqual(b.skills, p.actor.skills); assert.deepEqual(b.mappings, p.actor.mappings);
            for (const key of fengGrants) assert.equal(b.grants[key], 0);
            for (const key of ['str', 'int', 'con', 'dex', 'character', 'shen', 'weiwang', 'combat_exp', 'potential', 'learned_points', 'jing', 'neili', 'max_neili'])
                assert.equal(b[key], p.actor.properties[key]);
            assert.equal(b.family, p.actor.properties['family/family_name']);
        }
        for (const key of ['str', 'int', 'con', 'dex', 'character', 'shen', 'weiwang', 'combat_exp', 'potential', 'neili', 'max_neili',
            'contribution', 'balance', 'family', 'master_id', 'master_name', 'mappings']) assert.deepEqual(a[key], b[key]);
        const grants = structuredClone(b.grants), skills = { ...b.skills }, learned = { ...b.learned };
        let acquired = false, advanced = false, learning = false, points = 0, eligible = false;
        if (p.teaching_kind === 'ordinary_learning') {
            assert.equal(step.command_accepted, e.accepted);
            if (e.permit !== 'none') {
                acquired = !b.grants['can_learn/feng/' + e.permit];
                grants['can_learn/feng/' + e.permit] = 1;
            }
            if (!b.grants['can_learn/feng/dugu-jiujian'] && e.permit === 'dugu-jiujian') {
                skills['martial-cognize']++; learned['martial-cognize'] = 0;
            }
            assert.deepEqual(a.feng_flags, { blocked: e.blocked, told: e.told, visited: e.visited });
            if (e.learns) {
                const level = b.skills[p.learn_skill], rand = Math.trunc((b.effective_int + Math.trunc(level / 5)) / 2);
                const low = learnedGain(4, level, skills['martial-cognize']);
                const high = learnedGain(3 + rand, level, skills['martial-cognize']);
                if (level === 0) { skills[p.learn_skill] = 1; learned[p.learn_skill] = 0; }
                else {
                    const delta = a.learned[p.learn_skill] - (b.learned[p.learn_skill] ?? 0);
                    assert.ok(Number.isInteger(delta) && delta >= low && delta <= high);
                    learned[p.learn_skill] = a.learned[p.learn_skill];
                }
                points = 1; learning = true;
                assert.equal(b.jing - a.jing, Math.trunc((100 + level * 2) / b.int) * (level ? 1 : 2));
            } else assert.equal(a.jing, b.jing);
            advanced = fengGrants.some(g => Number.isInteger(grants[g]) && grants[g] > b.grants[g]) || learning;
        } else {
            assert.equal(p.teaching_kind, 'weapon_knowledge'); assert.equal(step.command_accepted, 1);
            assert.ok(b.jing - a.jing >= 10 && b.jing - a.jing <= 19);
            assert.deepEqual(a.feng_flags, b.feng_flags);
            const key = 'can_perform/dugu-jiujian', known = Array.isArray(b.grants[key]) ? b.grants[key] : [];
            eligible = !!b.skills['dugu-jiujian'] && !known.includes(p.knowledge_types[0]);
            const available = b.potential - b.learned_points;
            if (eligible) points = Math.min(10, available);
            const next = Array.isArray(a.grants[key]) ? a.grants[key] : [];
            acquired = next.includes(p.knowledge_types[0]) && !known.includes(p.knowledge_types[0]);
            if (acquired) {
                assert.ok(eligible && available >= 10);
                grants[key] = [...known.filter(t => !p.knowledge_types.includes(t)), ...p.knowledge_types];
                for (const skill of ['sword', 'dugu-jiujian', 'martial-cognize']) {
                    if (skill !== 'martial-cognize' && b.combat_exp === 0) continue;
                    skills[skill]++; learned[skill] = 0;
                }
            }
            advanced = acquired;
        }
        assert.deepEqual(a.grants, grants, '实际知识/许可与声明及原随机分支不符');
        assert.deepEqual(a.skills, skills); assert.deepEqual(a.learned, learned);
        assert.equal(a.learned_points - b.learned_points, points);
        summaries.push({ command_kind: e.command_kind, advanced, acquired, skill_advanced: learning,
            contribution_spent: 0, jing_spent: b.jing - a.jing, learned_points_spent: points,
            knowledge_trial: p.teaching_kind === 'weapon_knowledge' && eligible && points === 10,
            knowledge_acquired: p.teaching_kind === 'weapon_knowledge' && acquired });
        previous = step;
    }
    return summaries;
}
