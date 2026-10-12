// Original learn -> no_teach closure -> valid_learn -> thirteen subskills.
// Only experiment setup is supplied; permissions and teaching are never mocked.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

export const chenLearningSources = {
    'cmds/skill/learn.c': 'cb090d891b2bcfe93eefb34931f6e7b81be37f4ffd3c9ed6e475bc08ad041e6b',
    'kungfu/skill/baihua-cuoquan.c': '09d20daec738f04602362d67efe6e7a798b73f6e0cb525c111f2e3d514e18a02',
    'feature/dbase.c': '92199b08fca9830e3d734c5777ec1991fc8ea1085861d0f4646af4b3bd281faf',
    'feature/master.c': '8adc870cff8dbd2fcbec5d7d69972f6294f8288669c97773e3ea752ed51a2121',
    'mudcore/inherit/dbase.c': '097f1341d9a2be2d47798bef5400f4a7fdcbf413fe06b724581e76a512cbe8b3',
};

export const flowerSubskills = ['cha-quan', 'baji-quan', 'changquan', 'liuhe-quan',
    'yanqing-quan', 'shaolin-quan', 'bagua-zhang', 'bazhen-zhang', 'wudang-zhang',
    'huzhao-shou', 'yingzhao-shou', 'xiao-qinna', 'da-qinna'];

export function chenLearningConditions(relations, catalog, sources, readSource) {
    const path = 'kungfu/class/honghua/chen.c';
    const teacher = relations.objects.find(o => o.path === path);
    if (teacher?.learning_permissions === undefined) return [];
    const evidence = sources.filter(s => [path, 'kungfu/class/honghua/honghua.h',
        'feature/skill.c', 'feature/attribute.c', 'feature/apprentice.c', 'inherit/skill/skill.c'].includes(s.path));
    for (const [path, hash] of Object.entries(chenLearningSources)) {
        assert.equal(sha256(readSource(path)), hash, '百花学习依赖变化，须重新核对：' + path);
        evidence.push({ path, sha256: hash });
    }
    for (const skill of flowerSubskills) {
        assert.ok(catalog.skills.some(s => s.id === skill), '百花子技能缺失：' + skill);
        assert.ok(readSource('kungfu/skill/baihua-cuoquan.c').includes('"' + skill + '": 100'));
    }
    const fn = 'try_to_learn_quan';
    const line = readSource(path).split('\n').findIndex(s => s.startsWith(`int ${fn}() {`)) + 1;
    assert.ok(line > 0, '原百花学习回调缺失');
    const entry = { id: `${path}:${line}:${fn}`, path, sha256: teacher.sha256,
        function: fn, line, role: 'teaching' };
    const grant = 'can_learn/chen/baihua-cuoquan';
    const base = {
        teacher: { path: '/kungfu/class/honghua/chen', id: 'chen jialuo', sha256: teacher.sha256 },
        topic: '百花错拳入门', action: 'learn chen jialuo baihua-cuoquan 1', teaching_kind: 'ordinary_learning',
        actor: { skills: { force: 500, unarmed: 150, cuff: 100, claw: 100, strike: 100 }, mappings: {},
            properties: { 'family/family_name': '红花会', 'family/master_id': 'chen jialuo',
                'family/master_name': '陈家洛', shen: 100000, str: 30, con: 30, dex: 23, int: 28,
                character: '光明磊落', max_neili: 3000, neili: 3000, gongxian: 0,
                potential: 1000, learned_points: 0, combat_exp: 10000000 } },
        teaching_entry: entry, teaching_evidence: { path, line, sha256: teacher.sha256 },
        qualification_sources: evidence.map(s => s.path), qualification_evidence: evidence,
        target: { skills: { force: 1 }, mappings: {}, properties: {} },
        fighting: false, observe_seconds: 0, not_applicable: '', monitored_grants: [grant], known_issue: null,
        note: '经原 learn/no_teach/valid_learn；十三路补到 10 级，不预写许可或主技能。转世字段只作显式条件，不代表已完成转世养成；合成和战斗另测。',
    };
    const step = (skills = {}, accepted = 1) => ({ command_kind: 'learn', command_accepted: accepted,
        grant, value: 0, contribution_spent: 0, jing_spent: 0, learned_points_spent: 0,
        skills_after: skills, learning_progress: {}, may_improve_skills: true });
    const taught = step(Object.fromEntries(flowerSubskills.map(s => [s, 10]))), result = [];
    const actor = () => structuredClone(base.actor);
    const add = (variant, student, expectations, observed) => result.push({
        id: `teaching-chen-learn-${variant}`, stage: 'school', method: 'teaching',
        entry_id: entry.id, samples: 2, status: 'configured_not_executed',
        parameters: { ...structuredClone(base), actor: student, teaching_expectations: expectations,
            expected: observed ? 'observed' : 'refused' },
    });
    add('success', actor(), [taught], true);
    add('repeat', actor(), [taught, step()], true);
    const partial = actor(); partial.skills[flowerSubskills[0]] = 20; partial.skills[flowerSubskills[1]] = 9;
    const fill = structuredClone(taught); fill.skills_after[flowerSubskills[0]] = 20;
    add('partial-existing', partial, [fill], true);
    const all = actor(); Object.assign(all.skills, taught.skills_after);
    add('all-existing', all, [step()], false);
    const combined = actor(); combined.skills['baihua-cuoquan'] = 100;
    add('combined-existing', combined, [step()], false);
    const above = actor(); above.skills['baihua-cuoquan'] = 151;
    add('combined-above-basic', above, [step({}, 0)], false);
    for (const [variant, property, value, accepted] of [
        ['shen-low', 'shen', 99999, 1], ['int-low', 'int', 27, 0], ['dex-low', 'dex', 22, 0],
        ['max-neili-low', 'max_neili', 2999, 0],
        ['master-other', 'family/master_id', 'other teacher', 0],
        ['master-name-other', 'family/master_name', '另一位师父', 0],
    ]) {
        const student = actor(); student.properties[property] = value;
        add(variant, student, [step({}, accepted)], false);
    }
    for (const [skill, value] of [['force', 499], ['unarmed', 149], ['cuff', 99], ['claw', 99], ['strike', 99]]) {
        const student = actor(); student.skills[skill] = value;
        add(skill + '-low', student, [step({}, 0)], false);
    }
    for (const [variant, property, value, learned] of [
        ['reborn-master-other', 'family/master_id', 'other teacher', false],
        ['reborn-name-other', 'family/master_name', '另一位师父', true],
    ]) {
        const student = actor(); student.properties[property] = value;
        student.properties['reborn/family_name'] = '红花会';
        add(variant, student, [learned ? taught : step()], learned);
    }
    const armed = actor(); armed.equipment = { type: 'sword' };
    add('weapon-equipped', armed, [step({}, 0)], false);
    const empty = actor(); empty.properties.potential = 0; empty.properties.neili = 0; empty.properties.jing = 0;
    add('no-learning-resources', empty, [taught], true);
    return result;
}
