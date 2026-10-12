// Four original ask_riyue callbacks: permission, literal level write and optional purchase.
// These cases preserve MA-047 instead of repairing the level in the fixture.
import assert from 'node:assert/strict';

const lessons = [
    { file: 'danqing', npc: 'danqing sheng', skill: 'pomopima-jian', suffixes: ['zui'] },
    { file: 'tubi', npc: 'tubi weng', skill: 'shigu-bifa', suffixes: ['feng', 'shiyi'] },
    { file: 'heibai', npc: 'heibai zi', skill: 'fenglei-panfa', suffixes: ['fenglei'] },
    { file: 'huang', npc: 'huangzhong gong', skill: 'qixian-wuxingjian', suffixes: ['yin', 'shan', 'zhu'] },
];
const permit = 'can_learn/meizhuang';
const allGrants = [permit, ...lessons.flatMap(l => l.suffixes.map(s => `can_perform/${l.skill}/${s}`))];

export function meizhuangIntroductionConditions(relations, catalog, sources) {
    const result = [];
    const metadata = lessons.map(l => {
        const path = `kungfu/class/meizhuang/${l.file}.c`;
        const teacher = relations.objects.find(o => o.path === path);
        assert.ok(teacher && sources.some(s => s.path === path && s.sha256 === teacher.sha256), '庄主版本未核对');
        assert.ok(catalog.skills.some(s => s.id === l.skill), '入门技能缺失');
        const grants = teacher.grants.filter(g => g.function === 'ask_riyue');
        assert.deepEqual(grants.map(g => g.grant).sort(), l.suffixes.map(s => `can_perform/${l.skill}/${s}`).sort());
        assert.ok(grants.every(g => g.role === 'player_grant_candidate'
            && g.enclosing_function.path === path && g.enclosing_function.sha256 === teacher.sha256));
        const line = grants[0].enclosing_function.line;
        return { ...l, teacher: { path: '/' + path.slice(0, -2), id: l.npc, sha256: teacher.sha256 },
            entry: { id: `${path}:${line}:ask_riyue`, path, line, function: 'ask_riyue',
                role: 'teaching', sha256: teacher.sha256 }, evidence: grants.map(g => g.evidence) };
    });
    const evidence = sources.filter(s => s.path.startsWith('kungfu/class/meizhuang/')
        || !s.path.startsWith('kungfu/class/'));
    for (const [i, l] of metadata.entries()) {
        const next = metadata[(i + 1) % metadata.length];
        const base = {
            teacher: l.teacher, topic: '日月神教', action: `ask ${l.npc} about 日月神教`,
            teaching_kind: 'introductory_teaching', teaching_entry: l.entry,
            teaching_evidence: l.evidence[0], qualification_sources: evidence.map(s => s.path),
            qualification_evidence: evidence, monitored_grants: allGrants,
            actor: { skills: { force: 0, ...Object.fromEntries(lessons.map(x => [x.skill, 0])) }, mappings: {},
                properties: { 'family/family_name': '日月神教', shen: 0, str: 30, gongxian: 0,
                    balance: 0, combat_exp: 10000000 } },
            target: { skills: { force: 1 }, mappings: {}, properties: {} },
            fighting: false, observe_seconds: 0, not_applicable: '', known_issue: null,
            note: '经四庄主原日月询问；许可、技能设置、贡献、存款及多个绝招分别记录。较高技能被降为10按MA-047保留，未预写许可，不代表拜师、正常养成或能施展。',
        };
        const after = paid => Object.fromEntries(allGrants.map(g => [g,
            g === permit || paid && l.suffixes.some(s => g === `can_perform/${l.skill}/${s}`) ? 1 : 0]));
        const step = (paid, repeated = false) => ({ grant: permit, value: 1,
            contribution_spent: paid && !repeated ? 10000 : 0,
            balance_spent: paid && !repeated ? 100000000 : 0,
            grants_after: after(paid), skills_after: { [l.skill]: 10 },
            ...(repeated ? { response_contains: '你不是已经会了吗' } : {}) });
        const denied = { grant: permit, value: 0, contribution_spent: 0, balance_spent: 0,
            grants_after: Object.fromEntries(allGrants.map(g => [g, 0])), skills_after: {},
            response_contains: '本庄只接待神教人士' };
        const add = (variant, p, expectations, observed = true) => result.push({
            id: `teaching-meizhuang-intro-${l.file}-${variant}`, stage: 'school', method: 'teaching',
            entry_id: l.entry.id, samples: 2, status: 'configured_not_executed',
            parameters: { ...p, expected: observed ? 'observed' : 'refused', teaching_expectations: expectations },
        });
        add('free', structuredClone(base), [step(false)]);
        for (const level of [9, 10, 20]) {
            const p = structuredClone(base); p.actor.skills[l.skill] = level;
            if (level === 20) p.known_issue = 'MA-047';
            add('level-' + level, p, [step(false)]);
        }
        const paid = structuredClone(base);
        Object.assign(paid.actor.properties, { gongxian: 10001, balance: 100000001 });
        add('paid', structuredClone(paid), [step(true)]);
        add('repeat-paid', structuredClone(paid), [step(true), step(true, true)]);
        add('repeat-free', structuredClone(base), [step(false), step(false, true)]);
        for (const [variant, gongxian, balance] of [
            ['contribution-at', 10000, 100000001], ['balance-at', 10001, 100000000],
            ['both-at', 10000, 100000000],
        ]) {
            const p = structuredClone(base); Object.assign(p.actor.properties, { gongxian, balance });
            add(variant, p, [step(false)]);
        }
        for (const [variant, family] of [['family-other', '梅庄'], ['family-empty', '']]) {
            const p = structuredClone(paid); p.actor.properties['family/family_name'] = family;
            add(variant, p, [structuredClone(denied)], false);
        }
        for (const purchase of [false, true]) {
            const p = structuredClone(purchase ? paid : base);
            const second = { ...step(purchase, true), teacher: next.teacher, teaching_entry: next.entry,
                action: `ask ${next.npc} about 日月神教`, skills_after: { [l.skill]: 10, [next.skill]: 0 } };
            add(purchase ? 'cross-paid' : 'cross-free', p, [step(purchase), second]);
        }
    }
    return result;
}
