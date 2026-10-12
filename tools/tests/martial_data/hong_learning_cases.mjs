// Original learn command and Hong Qigong callbacks. No permission injection.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

export const learningSources = {
    'cmds/skill/learn.c': 'cb090d891b2bcfe93eefb34931f6e7b81be37f4ffd3c9ed6e475bc08ad041e6b',
    'kungfu/skill/dagou-bang.c': '83cefbf5ab3895775d1457064c5f0ee719b0c4cfca9ec1b8b3060f5cc4f00b1d',
    'kungfu/skill/xianglong-zhang.c': '31e86c094e90d443b4667993b98758efb75b17c5d648fb23ed92d47b9d1e9f8f',
    'feature/dbase.c': '92199b08fca9830e3d734c5777ec1991fc8ea1085861d0f4646af4b3bd281faf',
};

export const dragonSubskills = ['kanglong-youhui', 'feilong-zaitian', 'jianlong-zaitian',
    'hongjian-yulu', 'qianlong-wuyong', 'lishe-dachuan', 'turu-qilai', 'zhenjing-baili',
    'huoyue-zaiyuan', 'shuanglong-qushui', 'yuyue-yuyuan', 'shicheng-liulong', 'miyun-buyu',
    'sunze-youfu', 'longzhan-yuye', 'lvshuang-bingzhi', 'diyang-chufan', 'shenlong-baiwei'];

export function hongLearningConditions(relations, catalog, sources, readSource) {
    const path = 'kungfu/class/gaibang/hong.c';
    const teacher = relations.objects.find(o => o.path === path);
    // Old inventories without permission declarations retain their old scope.
    if (teacher?.learning_permissions === undefined) return [];
    const evidence = sources.filter(s => [path, 'kungfu/class/gaibang/gaibang.h',
        'feature/skill.c', 'feature/attribute.c', 'feature/apprentice.c', 'inherit/skill/skill.c'].includes(s.path));
    for (const [path, hash] of Object.entries(learningSources)) {
        assert.equal(sha256(readSource(path)), hash, '学习依赖变化，须重新核对：' + path);
        evidence.push({ path, sha256: hash });
    }
    const source = readSource(path), result = [];
    for (const skill of dragonSubskills) {
        assert.ok(catalog.skills.some(s => s.id === skill), '十八掌分招缺失：' + skill);
        assert.ok(readSource('kungfu/skill/xianglong-zhang.c').includes('"' + skill + '": 150'));
    }
    for (const [id, skill, fn, title] of [
        ['db', 'dagou-bang', 'try_to_learn_db', '打狗棒法学习'],
        ['ds', 'xianglong-zhang', 'try_to_learn_ds', '降龙十八掌入门'],
    ]) {
        const line = source.split('\n').findIndex(s => s.startsWith(`int ${fn}() {`)) + 1;
        assert.ok(line > 0, '真实学习回调缺失');
        const entry = { id: `${path}:${line}:${fn}`, path, sha256: teacher.sha256,
            function: fn, line, role: 'teaching' };
        const grant = `can_learn/hong/${skill}`;
        const base = {
            teacher: { path: '/kungfu/class/gaibang/hong', id: 'hong qigong', sha256: teacher.sha256 },
            topic: title, action: `learn hong qigong ${skill} 1`, teaching_kind: 'ordinary_learning',
            actor: { skills: id === 'db' ? { 'dagou-bang': 100, staff: 100, force: 0 }
                : { strike: 180, force: 600 }, mappings: {},
            properties: { 'family/family_name': '丐帮', 'family/master_id': 'hong qigong',
                'family/master_name': '洪七公', 'family/beggarlvl': id === 'db' ? 7 : 9,
                shen: 80000, str: 36, con: 32, dex: 26, int: 30, character: '光明磊落',
                max_neili: id === 'db' ? 1500 : 3000, neili: 3000, gongxian: 0,
                potential: 1000, learned_points: 0, combat_exp: 10000000 } },
            teaching_entry: entry, teaching_evidence: { path, line, sha256: teacher.sha256 },
            qualification_sources: evidence.map(s => s.path), qualification_evidence: evidence,
            target: { skills: { force: 1 }, mappings: {}, properties: {} },
            fighting: false, observe_seconds: 0, not_applicable: '', monitored_grants: [grant], known_issue: null,
            note: '经原 learn/no_teach/valid_learn；许可、分招等级和学习进度分开记录。未预写许可，不清除学习时钟；不代表拜师、十八掌合成或战斗验收。',
        };
        const step = (permit, skills = {}, progress = {}) => ({
            command_kind: 'learn', command_accepted: 1, grant, value: permit,
            contribution_spent: 0, jing_spent: 0, learned_points_spent: 0,
            skills_after: skills, learning_progress: progress, may_improve_skills: true,
        });
        const taught = id === 'db' ? step(1, { 'dagou-bang': 100 }, { 'dagou-bang': [3, 15] })
            : step(0, Object.fromEntries(dragonSubskills.map(s => [s, 10])));
        if (id === 'db') { taught.jing_spent = 10; taught.learned_points_spent = 1; }
        const add = (variant, actor, expectations, observed) => result.push({
            id: `teaching-hong-learn-${id}-${variant}`, stage: 'school', method: 'teaching',
            entry_id: entry.id, samples: 2, status: 'configured_not_executed',
            parameters: { ...structuredClone(base), actor, teaching_expectations: expectations,
                expected: observed ? 'observed' : 'refused' },
        });
        add('success', structuredClone(base.actor), [taught], true);
        for (const [variant, property, value] of [
            ['rank-low', 'family/beggarlvl', id === 'db' ? 6 : 8],
            ['shen-low', 'shen', 79999], ['master-other', 'family/master_id', 'other teacher'],
            ['master-name-other', 'family/master_name', '另一位师父'],
        ]) {
            const actor = structuredClone(base.actor); actor.properties[property] = value;
            add(variant, actor, [step(0)], false);
        }
        for (const [variant, property, value] of id === 'db'
            ? [['dex-low', 'dex', 25], ['max-neili-low', 'max_neili', 1499], ['potential-low', 'potential', 0]]
            : [['str-low', 'str', 35], ['con-low', 'con', 31], ['max-neili-low', 'max_neili', 2999],
                ['character-other', 'character', '阴险奸诈']]) {
            const actor = structuredClone(base.actor); actor.properties[property] = value;
            const expected = step(id === 'db' ? 1 : 0); expected.command_accepted = 0;
            add(variant, actor, [expected], id === 'db');
        }
        for (const [variant, field, value] of id === 'db'
            ? [['staff-low', 'staff', 99]] : [['strike-low', 'strike', 179], ['force-low', 'force', 599]]) {
            const actor = structuredClone(base.actor); actor.skills[field] = value;
            const expected = step(id === 'db' ? 1 : 0); expected.command_accepted = 0;
            add(variant, actor, [expected], id === 'db');
        }
        if (id === 'db') {
            const actor = structuredClone(base.actor); actor.skills['dagou-bang'] = 0;
            const first = step(1, { 'dagou-bang': 1 }); first.jing_spent = 6; first.learned_points_spent = 1;
            first.learned_after = { 'dagou-bang': 0 };
            add('first-level', actor, [first], true);
            const capped = structuredClone(base.actor); capped.skills['dagou-bang'] = 200; capped.skills.staff = 200;
            add('teacher-cap', capped, [step(1)], true);
        } else {
            add('repeat', structuredClone(base.actor), [taught, step(0)], true);
            const partial = structuredClone(base.actor);
            partial.skills[dragonSubskills[0]] = 20; partial.skills[dragonSubskills[1]] = 9;
            const expected = structuredClone(taught); expected.skills_after[dragonSubskills[0]] = 20;
            add('partial-existing', partial, [expected], true);
            const all = structuredClone(base.actor); Object.assign(all.skills, taught.skills_after);
            add('all-existing', all, [step(0)], false);
            const combined = structuredClone(base.actor); combined.skills[skill] = 100;
            add('combined-existing', combined, [step(0)], false);
        }
    }
    return result;
}
