// Fengling's original inquiry closures. Qualification is experimental input;
// grants and rewards must come from ask, never from the fixture.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

export const emeiSpecialSources = ['cmds/std/ask.c', 'feature/attribute.c', 'feature/dbase.c',
    'feature/skill.c', 'inherit/skill/skill.c', 'kungfu/class/emei/emei.h',
    'kungfu/class/emei/fengling.c', 'kungfu/skill/martial-cognize.c',
    'kungfu/skill/piaoxue-zhang.c', 'kungfu/skill/strike.c', 'mudcore/inherit/dbase.c'];
const reviewed = 'e11df10ca6f7989d53347b95a4cc95fe59ccf197a799a1f8131aca6d5d490183';
const lessons = [
    { id: 'yun', topic: '云海明灯', fn: 'ask_skill1', level: 150, force: 200, neili: 2000, cost: 1800 },
    { id: 'zhao', topic: '佛光普照', fn: 'ask_skill2', level: 180, force: 300, neili: 3500, cost: 2200 },
];
const grant = id => 'can_perform/piaoxue-zhang/' + id;

// Expected reward arithmetic pinned to feature/skill.c, not a substitute for
// the real callback. can_improve is NOT called for martial-cognize by the NPC.
function reward(skills, learned, exp) {
    for (const id of ['strike', 'piaoxue-zhang', 'martial-cognize']) {
        const level = skills[id] ?? 0;
        if (id !== 'martial-cognize' && Math.trunc(level ** 3 / 10) > exp) continue;
        const amount = 1500000 + (id === 'martial-cognize' ? 0
            : Math.trunc(1500000 * (skills['martial-cognize'] ?? 0) / 500));
        learned[id] = (learned[id] ?? 0) + 1 + Math.trunc(amount * 100 / (level + 100));
        if (learned[id] > (level + 1) ** 2) { skills[id] = level + 1; learned[id] = 0; }
    }
}

export function emeiSpecialConditions(relations, catalog, readSource) {
    const path = 'kungfu/class/emei/fengling.c';
    const teacher = relations.objects.find(t => t.path === path);
    if (teacher?.learning_permissions === undefined) return [];
    const evidence = [...emeiSpecialSources].sort().map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), reviewed,
        '峨嵋特殊教学源码变化，须重新核对');
    assert.equal(teacher.sha256, evidence.find(e => e.path === path).sha256);
    for (const id of ['strike', 'piaoxue-zhang', 'martial-cognize'])
        assert.ok(catalog.skills.some(s => s.id === id), '奖励技能缺失：' + id);
    const result = [];
    for (const lesson of lessons) {
        const grants = teacher.grants.filter(g => g.grant === grant(lesson.id) && g.function === lesson.fn);
        assert.equal(grants.length, 1, '原传招记录须唯一');
        const g = grants[0], fn = g.enclosing_function;
        assert.equal(fn.path, path); assert.equal(fn.sha256, teacher.sha256);
        const entry = { id: `${path}:${fn.line}:${lesson.fn}`, path, line: fn.line,
            function: lesson.fn, sha256: teacher.sha256, role: 'teaching' };
        const base = { teacher: { path: '/kungfu/class/emei/fengling', id: 'fengling shitai', sha256: teacher.sha256 },
            topic: lesson.topic, action: `ask fengling shitai about ${lesson.topic}`,
            teaching_profile: 'emei-special', teaching_kind: 'ability_grant',
            actor: { skills: { force: lesson.force * 2, strike: lesson.level,
                'piaoxue-zhang': lesson.level, 'martial-cognize': 100 }, mappings: {},
                properties: { 'family/family_name': '峨嵋派', 'family/master_id': 'fengling shitai',
                    'family/master_name': '风陵师太', str: 30, shen: 40000, gongxian: lesson.cost,
                    combat_exp: 10000000, neili: lesson.neili, max_neili: lesson.neili,
                    potential: 1000, learned_points: 0 } },
            teaching_entry: entry, teaching_evidence: g.evidence,
            qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
            target: { skills: { force: 1 }, mappings: {}, properties: {} },
            fighting: false, observe_seconds: 0, not_applicable: '', known_issue: null,
            unchanged_properties: ['combat_exp'], monitored_grants: lessons.map(l => grant(l.id)),
            note: '原ask/风陵闭包授招；预设师承不代表自然拜师。领悟、扣费、附带技能奖励分列，不证明能够施展。',
        };
        const add = (variant, mutate = () => {}, denied = '', sequence) => {
            const p = structuredClone(base); mutate(p.actor);
            const skills = { ...p.actor.skills }, learned = {}, known = new Set();
            const expectations = (sequence ?? [lesson]).map(l => {
                const acquired = !denied && !known.has(l.id);
                if (acquired) { reward(skills, learned, p.actor.properties.combat_exp); known.add(l.id); }
                return { action: `ask fengling shitai about ${l.topic}`, grant: grant(l.id),
                    value: known.has(l.id) ? 1 : 0, contribution_spent: acquired ? l.cost : 0,
                    skills_after: { ...skills }, learned_after: { ...learned },
                    learned_points_spent: 0,
                    response_contains: denied || (!acquired ? '已经传授予你' : `你学会了「${l.topic}」`) };
            });
            result.push({ id: `teaching-emei-special-fengling-${lesson.id}-${variant}`,
                stage: 'school', method: 'teaching', entry_id: entry.id, samples: 2,
                status: 'configured_not_executed', parameters: { ...p, variant,
                    expected: denied ? 'refused' : 'observed', teaching_expectations: expectations } });
        };
        add('grant');
        add('repeat', undefined, '', [lesson, lesson]);
        for (const [variant, key, value, denied] of [
            ['contribution-low', 'gongxian', lesson.cost - 1, '贡献还不够'],
            ['max-neili-low', 'max_neili', lesson.neili - 1, '内力修行太浅'],
            ['shen-low', 'shen', 39999, '行侠仗义的事情还做得不够'],
            ['family-other', 'family/family_name', '武当派', '素无来往'],
            ['master-other', 'family/master_id', 'miejue shitai', '只有我的弟子'],
            ['master-name-other', 'family/master_name', '另一位师父', ''],
            ['current-neili-zero', 'neili', 0, ''],
            ['experience-zero', 'combat_exp', 0, ''],
            ['experience-floor', 'combat_exp', Math.trunc(lesson.level ** 3 / 10), ''],
            ['experience-low', 'combat_exp', Math.trunc(lesson.level ** 3 / 10) - 1, ''],
        ]) add(variant, a => { a.properties[key] = value; }, denied);
        for (const [variant, key, value, denied] of [
            ['skill-zero', 'piaoxue-zhang', 0, '飘雪穿云掌都没学'],
            ['skill-low', 'piaoxue-zhang', lesson.level - 1, '飘雪穿云掌火候未到'],
            ['force-low', 'force', lesson.force * 2 - 1, '内功修行太浅'],
        ]) add(variant, a => { a.skills[key] = value; }, denied);
        add('high-level-progress', a => {
            a.skills.strike = a.skills['piaoxue-zhang'] = 800; a.properties.combat_exp = 100000000;
        });
        add('basic-reward-capped', a => { a.skills.strike = 800; });
        add('special-reward-capped', a => { a.skills['piaoxue-zhang'] = 800; });
        const other = lessons.find(l => l !== lesson);
        add('both-and-repeat', a => {
            a.skills.force = 600; a.skills.strike = a.skills['piaoxue-zhang'] = 180;
            a.properties.neili = a.properties.max_neili = 3500; a.properties.gongxian = 4000;
        }, '', [lesson, other, lesson, other]);
    }
    return result;
}
