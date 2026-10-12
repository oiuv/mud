// A letter is obtained by the original inquiry, never supplied by the fixture.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

export const shangLetterSources = {
    'clone/special/sjmletter.c': '3e7918840e15a8b54df6334615c20dfbe54df039bd7525fdeb2f751ac9ec36d9',
    'inherit/item/item.c': '793b35504ffa07810f033d44e4b471ecf194c9a55228caf747c8ef53fb0b23ed',
};
const grant = 'can_perform/bagua-dao/tian';

export function shangLetterConditions(relations, catalog, sources, readSource) {
    const mingPath = 'kungfu/class/shang/ming.c', wangPath = 'kungfu/class/zhenyuan/wangweiyang.c';
    const ming = relations.objects.find(o => o.path === mingPath);
    const wang = relations.objects.find(o => o.path === wangPath);
    for (const teacher of [ming, wang]) assert.ok(sources.some(s => s.path === teacher.path && s.sha256 === teacher.sha256));
    const acquisitionSource = readSource(mingPath), acquisitionText = 'mixed give_letter() {';
    const offset = acquisitionSource.indexOf(acquisitionText);
    assert.ok(offset > 0 && acquisitionSource.indexOf(acquisitionText, offset + 1) === -1);
    const line = acquisitionSource.slice(0, offset).split('\n').length;
    const entry = { id: `${mingPath}:${line}:give_letter`, path: mingPath, line,
        function: 'give_letter', role: 'teaching', sha256: ming.sha256 };
    const teaching = wang.grants.find(g => g.grant === grant && g.function === 'accept_object');
    assert.equal(teaching.role, 'player_grant_candidate');
    assert.ok(catalog.skills.some(s => s.id === 'bagua-dao'));
    const wangEntry = { id: `${wangPath}:${teaching.enclosing_function.line}:accept_object`,
        path: wangPath, line: teaching.enclosing_function.line, function: 'accept_object',
        role: 'teaching', sha256: wang.sha256 };
    const evidence = sources.filter(s => [mingPath, wangPath, 'kungfu/class/shang/shang.h',
        'kungfu/class/zhenyuan/zhenyuan.h'].includes(s.path) || !s.path.startsWith('kungfu/class/'));
    for (const [path, hash] of Object.entries(shangLetterSources)) {
        assert.equal(sha256(readSource(path)), hash, '书信源码变化，须重新核对：' + path);
        evidence.push({ path, sha256: hash });
    }
    const wangTeacher = { path: '/' + wangPath.slice(0, -2), id: 'wang weiyang', sha256: wang.sha256 };
    const base = {
        teacher: { path: '/' + mingPath.slice(0, -2), id: 'shang jianming', sha256: ming.sha256 },
        topic: '天刀八势（书信转授）', action: 'ask shang jianming about 天刀八势',
        teaching_kind: 'letter_teaching', teaching_entry: entry,
        teaching_evidence: { path: mingPath, sha256: ming.sha256, line, text: acquisitionText },
        qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
        monitored_grants: [grant], tracked_item: { path: '/clone/special/sjmletter', id: 'sjm letter' },
        actor: { skills: { 'bagua-dao': 200, 'wai-bagua': 200, 'nei-bagua': 200, force: 0, parry: 0, blade: 0 },
            mappings: {}, properties: { 'family/family_name': '商家堡', gongxian: 2200,
                max_neili: 3200, shen: 0, str: 30, combat_exp: 10000000 } },
        target: { skills: { force: 1 }, mappings: {}, properties: {} },
        fighting: false, observe_seconds: 0, not_applicable: '', known_issue: null,
        note: '同一真实玩家先向商剑鸣领信、再经give交王维扬；不注入书信或领悟。取得书信为物品进展，不等于已学会绝招；商家堡初始资格是实验设置，不代表当前能够拜师。',
    };
    const acquire = { grant, value: 0, contribution_spent: 2200, item_before: 'absent', item_after: 'student', may_improve_skills: false };
    const give = { grant, value: 1, contribution_spent: 0, command_kind: 'give', teacher: wangTeacher,
        teaching_entry: wangEntry, action: 'give sjm letter to wang weiyang',
        item_before: 'student', item_after: 'teacher', reward_skill: 'bagua-dao' };
    const result = [];
    const add = (variant, p, steps, observed = true) => result.push({
        id: 'teaching-shang-letter-' + variant, stage: 'school', method: 'teaching', entry_id: p.teaching_entry.id,
        samples: 2, status: 'configured_not_executed', parameters: { ...p, expected: observed ? 'observed' : 'refused',
            teaching_expectations: structuredClone(steps) },
    });
    add('acquire', structuredClone(base), [acquire]);
    add('complete', structuredClone(base), [acquire, give]);
    const repeat = structuredClone(base); repeat.actor.properties.gongxian = 4400;
    add('repeat-held', repeat, [acquire, { ...acquire, item_before: 'student', contribution_spent: 0,
        response_contains: '快到镇远镖局找我师傅去吧' }, give]);
    add('repeat-exact-cost', structuredClone(base), [acquire, { ...acquire, item_before: 'student', contribution_spent: 0,
        response_contains: '碌碌无为' }, give]);
    add('repeat-give', structuredClone(base), [acquire, give, { ...give, item_before: 'teacher',
        command_accepted: 0, reward_skill: null, may_improve_skills: false }]);
    const missing = structuredClone(base);
    missing.teacher = wangTeacher; missing.teaching_entry = wangEntry; missing.action = give.action;
    add('without-letter', missing, [{ ...give, value: 0, item_before: 'absent', item_after: 'absent', command_accepted: 0,
        reward_skill: null, may_improve_skills: false }], false);
    const refusal = reason => ({ grant, value: 0, contribution_spent: 0,
        item_before: 'absent', item_after: 'absent', response_contains: reason });
    for (const [variant, property, value, reason] of [
        ['family-other', 'family/family_name', '八卦门', '素无来往'],
        ['family-empty', 'family/family_name', '', '素无来往'],
        ['contribution-low', 'gongxian', 2199, '碌碌无为'],
        ['max-neili-low', 'max_neili', 3199, '内力修为不足'],
    ]) {
        const p = structuredClone(base); p.actor.properties[property] = value;
        add(variant, p, [refusal(reason)], false);
    }
    for (const [skill, name] of [['bagua-dao', '八卦刀法'], ['wai-bagua', '外八卦神功'], ['nei-bagua', '内八卦神功']]) {
        for (const level of [0, 199]) {
            const p = structuredClone(base); p.actor.skills[skill] = level;
            add(skill + '-' + level, p, [refusal(level === 0 ? name + '都没学' : name + '还练得不到家')], false);
        }
    }
    return result;
}
