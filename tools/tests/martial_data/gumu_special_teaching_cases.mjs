// Independent preparation: original ask/teach_pfm only, not registered or sampled.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';
import { distribution } from './statistics.mjs';

const teachers = {
    lin: ['lin chaoying', '林朝英'], longnv: ['xiao longnv', '小龙女'], yang: ['yang guo', '杨过'],
};
const basics = {
    'suxin-jian': ['sword', 'parry'], 'yinsuo-jinling': ['whip', 'parry'],
    'yunv-jian': ['sword', 'parry'], 'tianluo-diwang': ['strike', 'parry'],
    'meinv-quan': ['unarmed', 'parry'], 'yufeng-zhen': ['throwing'],
    'xuantie-jian': ['sword', 'parry'], 'sad-strike': ['unarmed', 'parry'],
};
export const gumuSpecialTeachingLessons = [
    ['lin', 'lian', '连环剑术', 'suxin-jian', 120, 0, 100, 600, 0],
    ['lin', 'feng', '风神诀', 'yinsuo-jinling', 140, 180, 0, 700, 0],
    ['lin', 'kai', '开天辟地', 'yinsuo-jinling', 130, 180, 0, 800, 0],
    ['longnv', 'mei', '千姿百媚', 'yunv-jian', 35, 0, 30, 50, 0],
    ['longnv', 'wang', '天罗地网势', 'tianluo-diwang', 60, 0, 30, 60, 0],
    ['longnv', 'you', '古墓幽居', 'meinv-quan', 70, 70, 0, 160, 0],
    ['longnv', 'dian', '隔空点穴', 'yinsuo-jinling', 70, 90, 0, 260, 0],
    ['longnv', 'ying', '无影针', 'yufeng-zhen', 90, 100, 0, 300, 0],
    ['longnv', 'he', '双剑合壁', 'suxin-jian', 130, 120, 100, 400, 0],
    ['yang', 'juan', '卷字诀', 'xuantie-jian', 100, 400, 0, 0, 3000],
    ['yang', 'dong', '大江东去', 'xuantie-jian', 200, 400, 0, 0, 5000],
    ['yang', 'xiao', '黯然销魂', 'sad-strike', 150, 320, 0, 0, 3200],
    ['yang', 'tuo', '拖泥带水', 'sad-strike', 180, 360, 0, 0, 4000],
].map(([teacher, pfm, topic, skill, level, force, dodge, contribution, maxNeili]) => ({
    id: teacher + '-' + pfm, teacher, pfm, topic, skill, level, force, dodge, contribution,
    max_neili: maxNeili, free: teacher === 'yang' ? 1 : 0,
    grant: `can_perform/${skill}/${pfm}`, basics: basics[skill],
}));
export const gumuSpecialTeachingSources = [...new Set([
    'adm/daemons/masterd.c', 'cmds/std/ask.c', 'cmds/skill/enable.c',
    'feature/skill.c', 'feature/attribute.c', 'feature/attack.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'inherit/char/char.c', 'inherit/char/npc.c',
    'inherit/skill/skill.c', 'kungfu/class/gumu/gumu.h',
    ...Object.keys(teachers).map(n => `kungfu/class/gumu/${n}.c`),
    ...[...Object.keys(basics), ...Object.values(basics).flat(), 'martial-cognize', 'force', 'dodge']
        .map(n => `kungfu/skill/${n}.c`),
])].sort();
export const gumuSpecialTeachingReviewed = '53af35a3b4daa1b37331b83efbd06cb46f206888f421f2f025125265d2ccdaff';
export const gumuSpecialTeachingFixtureRequirements = [
    'Register only the thirteen original accept_ask/teach_pfm lessons, never NPC self-known PFMs or Li historical lessons.',
    'Reuse original Gumu teacher preparation under the real student command; record actual identities, cold-load state, autonomy and cleanup without adding student qualifications.',
    'Repeat through a second original ask with the same teacher/student and retained grants, skills and resources; do not prewrite grants or refill.',
    'Validate all thirteen grant keys, exact skill/learned rewards, contribution and the original ask jing ledger; parameters come only from the frozen condition.',
];

// Source-based expectation, never emitted as a runtime observation. Ordinary
// valid_learn, recruitment, equipment and perform prerequisites are not gates here.
export function gumuSpecialTeachingDenial(lesson, actor, known = false) {
    const q = actor.properties, s = actor.skills;
    if (!lesson.free && q['family/family_name'] !== '古墓派') return '素无渊源';
    if (known) return '';
    // A missing mapping value is integer zero: free does not skip this check.
    if (q.gongxian < lesson.contribution) return '作出的贡献不够';
    if ((s[lesson.skill] ?? 0) <= 0) return '未曾学过';
    if (s[lesson.skill] < lesson.level) return '了解还不够';
    const effective = id => Math.trunc((s[id] ?? 0) / 2) + (s[actor.mappings[id]] ?? 0);
    if (effective('force') < lesson.force) return '内功火候不足';
    if (effective('dodge') < lesson.dodge) return '轻功火候不足';
    if (q.max_neili < lesson.max_neili) return '内力修为不足';
    return '';
}

export function gumuSpecialTeachingReward(lesson, beforeSkills, beforeLearned, exp) {
    const skills = { ...beforeSkills }, learned = { ...beforeLearned };
    // All eight specials and these basics have empty original skill_improved.
    // Tianluo is at least 60 on a grant, so its contextual parry (>30) is enabled.
    for (const skill of [lesson.skill, ...lesson.basics, 'martial-cognize']) {
        const level = skills[skill] ?? 0, cognition = skill === 'martial-cognize';
        if (!cognition && Math.trunc(level ** 3 / 10) > exp) continue;
        let amount = cognition ? 3500000 : 1500000;
        if (!cognition) amount += Math.trunc(amount * (skills['martial-cognize'] ?? 0) / 500);
        skills[skill] = level;
        learned[skill] = (learned[skill] ?? 0) + 1 + Math.trunc(amount * 100 / (level + 100));
        if (learned[skill] > (level + 1) ** 2) { skills[skill]++; learned[skill] = 0; }
    }
    return { skills, learned };
}

export function gumuSpecialTeachingConditions(relations, catalog, readSource, { smoke = false } = {}) {
    assert.equal(relations.source_fingerprint, catalog.source_fingerprint);
    const evidence = gumuSpecialTeachingSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), gumuSpecialTeachingReviewed,
        '古墓普通绝招传授源码变化，须重新核对');
    const result = [];
    for (const lesson of gumuSpecialTeachingLessons) {
        const path = `kungfu/class/gumu/${lesson.teacher}.c`, [npc, name] = teachers[lesson.teacher];
        const teacher = relations.objects.find(t => t.path === path);
        assert.equal(teacher?.sha256, evidence.find(e => e.path === path).sha256, '原教师来源不同');
        const grants = teacher.grants.filter(g => g.grant === lesson.grant && g.function === 'accept_ask');
        assert.equal(grants.length, 1, '原传授入口不唯一：' + lesson.id);
        const g = grants[0], fn = g.enclosing_function;
        assert.equal(g.operation, 'teach_pfm'); assert.equal(g.role, 'player_grant_candidate');
        assert.equal(fn.path, path); assert.equal(fn.sha256, teacher.sha256);
        const fields = Object.fromEntries(Object.entries(g.fields).map(([key, v]) => [key, v.value]));
        assert.deepEqual(fields, { perform: lesson.grant, name: lesson.topic,
            ...(lesson.free ? { free: 1 } : {}), sk1: lesson.skill, lv1: lesson.level,
            ...(lesson.force ? { force: lesson.force } : {}), ...(lesson.dodge ? { dodge: lesson.dodge } : {}),
            ...(lesson.contribution ? { gongxian: lesson.contribution } : {}),
            ...(lesson.max_neili ? { neili: lesson.max_neili } : {}) }, '原传授配置改变：' + lesson.id);
        const entry = { id: `${path}:${fn.line}:accept_ask`, path, line: fn.line,
            function: 'accept_ask', sha256: teacher.sha256, role: 'teaching' };
        const base = { teacher: { path: '/' + path.slice(0, -2), id: npc, sha256: teacher.sha256 },
            topic: lesson.topic, skill: lesson.skill, level: lesson.level,
            action: `ask ${npc} about ${lesson.topic}`, teaching_profile: 'gumu-special', teaching_kind: 'ability_grant',
            actor: { skills: { [lesson.skill]: lesson.level,
                ...Object.fromEntries(lesson.basics.map(s => [s, lesson.level])),
                force: lesson.force * 2, dodge: lesson.dodge * 2, 'martial-cognize': 100 }, mappings: {},
                properties: { 'family/family_name': '古墓派', 'family/master_id': npc, 'family/master_name': name,
                    str: 30, con: 30, dex: 30, int: 30, gender: '女性', character: '国士无双', shen: 0,
                    gongxian: lesson.contribution, combat_exp: 10000000, jing: 10000,
                    max_neili: lesson.max_neili || 6000, neili: lesson.max_neili || 6000,
                    potential: 1000, learned_points: 0 } },
            teaching_entry: entry, teaching_evidence: g.evidence,
            qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
            target: { skills: { force: 1 }, mappings: {}, properties: {} },
            fighting: false, observe_seconds: 0, not_applicable: '', known_issue: null,
            unchanged_properties: ['combat_exp'], monitored_grants: gumuSpecialTeachingLessons.map(l => l.grant),
            note: '原ask/accept_ask/teach_pfm；角色资格为实验输入，不证明自然拜师、普通学习或能够施展。2次只核确定性授予/拒绝及账目，不宣称随机精神费用完整分布。',
        };
        const add = (variant, mutate = () => {}, repeat = false) => {
            const p = structuredClone(base); mutate(p.actor);
            for (const skill of Object.keys(p.actor.skills)) assert.ok(catalog.skills.some(s => s.id === skill), skill);
            let state = { skills: { ...p.actor.skills }, learned: {} }, known = false;
            const student = structuredClone(p.actor), expectations = [];
            for (let i = 0; i < (repeat ? 2 : 1); i++) {
                const denial = gumuSpecialTeachingDenial(lesson, student, known), acquired = !denial && !known;
                if (acquired) {
                    state = gumuSpecialTeachingReward(lesson, state.skills, state.learned, student.properties.combat_exp);
                    student.skills = { ...state.skills }; student.properties.gongxian -= lesson.contribution; known = true;
                }
                expectations.push({ action: p.action, grant: lesson.grant, value: known ? 1 : 0,
                    contribution_spent: acquired ? lesson.contribution : 0, learned_points_spent: 0,
                    skills_after: { ...state.skills }, learned_after: { ...state.learned },
                    ...(denial ? { response_contains: denial } : acquired ? { response_contains: '你学会了「' } : {}) });
            }
            result.push({ id: `teaching-gumu-special-${lesson.id}-${variant}`, stage: 'school', method: 'teaching',
                entry_id: entry.id, samples: smoke ? 1 : 2, status: 'configured_not_executed',
                parameters: { ...p, variant, expected: known ? 'observed' : 'refused', teaching_expectations: expectations } });
        };
        add('grant'); add('repeat', undefined, true);
        add('family-other', a => { a.properties['family/family_name'] = '武当派'; });
        add('contribution-low', a => { a.properties.gongxian--; });
        add('skill-zero', a => { a.skills[lesson.skill] = 0; });
        add('skill-low', a => { a.skills[lesson.skill]--; });
        if (lesson.force) add('force-low', a => { a.skills.force--; });
        if (lesson.dodge) add('dodge-low', a => { a.skills.dodge--; });
        if (lesson.max_neili) add('max-neili-low', a => { a.properties.max_neili--; });
        if (['lin-lian', 'longnv-mei', 'yang-xiao'].includes(lesson.id)) add('no-extra-gates', a => {
            a.properties['family/master_id'] = 'other teacher'; a.properties['family/master_name'] = '另一位师父';
            a.properties.neili = 0; a.properties.gender = '男性'; a.properties.character = '光明磊落';
            a.properties.shen = -100000;
        });
        if (lesson.id === 'lin-lian') {
            for (const [variant, exp] of [['experience-zero', 0], ['experience-floor', Math.trunc(lesson.level ** 3 / 10)],
                ['experience-low', Math.trunc(lesson.level ** 3 / 10) - 1]])
                add(variant, a => { a.properties.combat_exp = exp; });
            add('high-level-progress', a => {
                for (const s of [lesson.skill, ...lesson.basics]) a.skills[s] = 800;
                a.properties.combat_exp = 100000000;
            });
            add('basic-reward-capped', a => { a.skills.sword = 800; });
            add('special-reward-capped', a => { a.skills[lesson.skill] = 800; });
        }
        if (lesson.id === 'longnv-wang') add('missing-basics', a => {
            delete a.skills.strike; delete a.skills.parry;
        });
    }
    assert.equal(new Set(result.map(c => c.id)).size, result.length);
    return result;
}

// Additional exact-state checks; call alongside the existing common teaching
// and two-player validators, not instead of them. Missing maps are not zero.
export function validateGumuSpecialTeachingRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.teaching_profile, 'gumu-special'); assert.equal(condition.method, 'teaching');
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, 'teaching');
    if (raw.outcome === 'error') return;
    assert.equal(raw.outcome, p.expected);
    assert.ok(Array.isArray(raw.teaching)); assert.equal(raw.teaching.length, p.teaching_expectations.length);
    for (const [i, step] of raw.teaching.entries()) {
        const expected = p.teaching_expectations[i];
        assert.deepEqual(step.after.skills, expected.skills_after, '原特殊/基本武学奖励与全量技能不符');
        assert.deepEqual(step.after.learned, expected.learned_after, '原奖励取整或全量熟练度不符');
        for (const key of ['neili', 'max_neili', 'max_jingli', 'potential', 'learned_points',
            'mappings', 'shen', 'str', 'con', 'int', 'dex', 'character', 'combat_exp']) {
            assert.ok(Object.hasOwn(step.before, key) && Object.hasOwn(step.after, key), '教学观察缺失：' + key);
            assert.deepEqual(step.after[key], step.before[key], '传授改变未声明属性：' + key);
        }
        assert.equal(step.before.con, p.actor.properties.con); assert.equal(step.before.int, p.actor.properties.int);
        assert.equal(step.before.character, p.actor.properties.character);
    }
    for (const side of [0, 1]) {
        const metrics = raw.metrics?.[side];
        assert.ok(metrics && typeof metrics === 'object' && !Array.isArray(metrics), '公共资源账缺失');
        for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) for (const sign of ['cost', 'recovery']) {
            if (side === 0 && resource === 'jing' && sign === 'cost') continue;
            const key = resource + '_' + sign, value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
            assert.ok(Number.isSafeInteger(value), '公共资源账字段不是实际整数：' + key);
            assert.equal(value, 0, '传授不得夹杂额外伤害、恢复或内力支出');
        }
    }
    for (const field of ['attacks', 'defenses', 'passives', 'callbacks', 'terminals'])
        assert.deepEqual(raw[field], [], '普通传招不应混入战斗或自然回调：' + field);
    assert.ok(raw.before?.[1] && raw.after?.[1], '旁观者原状态缺失');
    assert.deepEqual(raw.after[1], raw.before[1], '询问不得改变旁观者');
}

export function gumuSpecialTeachingEffects(rows, condition) {
    assert.equal(condition.parameters.teaching_profile, 'gumu-special');
    const p = condition.parameters, steps = rows.flatMap(row => {
        assert.equal(row.condition_id, condition.id); validateGumuSpecialTeachingRecord(row.raw, condition);
        return row.raw.teaching;
    });
    return { samples: rows.length, asks: steps.length,
        acquired: steps.filter(s => s.after.grants[p.teaching_expectations[0].grant]
            > s.before.grants[p.teaching_expectations[0].grant]).length,
        contribution_spent: steps.reduce((n, s) => n + s.before.contribution - s.after.contribution, 0),
        jing_spent: distribution(steps.map(s => s.before.jing - s.after.jing)),
        reward_changes: steps.map(s => Object.fromEntries([...new Set([...Object.keys(s.before.skills),
            ...Object.keys(s.after.skills)])].filter(k => (s.after.skills[k] ?? 0) !== (s.before.skills[k] ?? 0)
                || (s.after.learned[k] ?? 0) !== (s.before.learned[k] ?? 0)).map(k => [k, {
                level_before: s.before.skills[k] ?? 0, level_after: s.after.skills[k] ?? 0,
                learned_before: s.before.learned[k] ?? 0, learned_after: s.after.learned[k] ?? 0,
            }]))),
    };
}
