// Explicitly reviewed missing Huashan grants; original MASTER_D remains in control.
import assert from 'node:assert/strict';
import { sha256, scanSource } from './inventory.mjs';

export const huashanGrantGroup = 'teaching-43-huashan-grants';
const teacherHashes = {
    'cheng-buyou': '5174b13601e5149fb0e988d893efcdb502526ba4399e0dba6539630a767de34e',
    'feng-buping': '957399dab4c07abf3e6708ef25d2c77c1b3dfc5355351d0c80ee9fbfc7d20ada',
    lao: 'fb288a4fbbf1d4b7b33d80b920dc4db489069a33902f24292e4bd7130e9f35ce',
    'yue-wife': '91a86e3059db3a1191c377d9f7f00246ac1f70ef20550ffbda73644d169e0a23',
};
const supportHashes = {
    'adm/daemons/masterd.c': '32b6b5667152b09a902ce4ed7798c0538810a2f9030c1854b508717ad5f5ae95',
    'feature/skill.c': '99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
    'inherit/skill/skill.c': '891da821f84c26820c1e540822dba751f218441cc03f2b95a1fcfcc3923294cd',
    'cmds/std/ask.c': '568ca1c612f6efda4af6ee54e2712a56ff7ba66aa44c42024978a06b5e5836c2',
    'kungfu/skill/huashan-jian.c': '249af2a2ae8973d2c10111eb62f6199403ce4de17011d1b5c70f02e3309fbdcb',
    'kungfu/skill/kuangfeng-jian.c': 'f06374553ea2b6a425206742e616b94cdd46fea29340dc4cd70fd00f3a2f6cbc',
    'kungfu/skill/huashan-zhang.c': '74ee35ff83208a8b02b023a5b4942ab99b46258357b673de0543ea65ac2aaad1',
    'kungfu/skill/huashan-quan.c': '67ee67f6af2a16723db14991e04c750790a78bbe627e32ea0c99f914146ce0dd',
    'kungfu/skill/shunv-jian.c': 'c7e40d05fadbbb4c4dd06f2d695326e9a03c5630783c090fb1cc09ac7acf9d9e',
};
export const huashanGrantLessons = [
    { key: 'cheng-long', file: 'cheng-buyou', npc: 'cheng buyou', topic: '天外飞龙',
        skill: 'huashan-jian', move: 'long', level: 150, basic: 'sword', force: 150, ceiling: true },
    { key: 'cheng-sao', file: 'cheng-buyou', npc: 'cheng buyou', topic: '风扫落叶',
        skill: 'kuangfeng-jian', move: 'sao', level: 100, basic: 'sword', secondary: [['dodge', 100]], ceiling: true },
    { key: 'feng-yong', file: 'feng-buping', npc: 'feng buping', topic: '风起云涌', display: '风起云涌 ',
        skill: 'kuangfeng-jian', move: 'yong', level: 140, basic: 'sword', secondary: [['dodge', 140]], ceiling: true },
    { key: 'feng-xian', file: 'feng-buping', npc: 'feng buping', topic: '夺命连环三仙剑',
        skill: 'huashan-jian', move: 'xian', level: 160, basic: 'sword', secondary: [['dodge', 160]], ceiling: true },
    { key: 'lao-jie', file: 'lao', npc: 'lao denuo', topic: '截手式',
        skill: 'huashan-jian', move: 'jie', level: 30, basic: 'sword', cost: 60, shen: 500 },
    { key: 'lao-piao', file: 'lao', npc: 'lao denuo', topic: '飞絮飘渺',
        skill: 'huashan-zhang', move: 'piao', level: 30, basic: 'strike', cost: 60, shen: 600 },
    { key: 'lao-song', file: 'lao', npc: 'lao denuo', topic: '苍松式',
        skill: 'huashan-quan', move: 'song', level: 40, basic: 'cuff', cost: 100, shen: 800 },
    { key: 'lao-lian', file: 'lao', npc: 'lao denuo', topic: '剑掌五连环',
        skill: 'huashan-jian', move: 'lian', level: 50, basic: 'sword', cost: 150, shen: 1200, force: 100 },
    { key: 'ning-ning', file: 'yue-wife', npc: 'yue wife', topic: '宁氏一剑',
        skill: 'shunv-jian', move: 'ning', level: 100, basic: 'sword', cost: 600, shen: 30000,
        secondary: [['force', 100], ['dodge', 100]] },
];
const grantKey = d => `can_perform/${d.skill}/${d.move}`;
const variants = d => ['grant', 'repeat', 'family-other', 'skill-zero', 'skill-low', 'contribution-low',
    ...(d.shen ? ['shen-low'] : []), ...(d.force ? ['force-low'] : []),
    ...(d.secondary ?? []).map(([skill]) => `${skill}-raw-low`),
    ...(d.ceiling ? ['max-neili-high', 'force-ceiling-at', 'force-ceiling-round', 'force-ceiling-high'] : [])];

function configuration(d, variant) {
    assert.ok(variants(d).includes(variant), 'unreviewed Huashan grant variant');
    const actor = { skills: { [d.skill]: d.level, [d.basic]: 40, parry: 40,
        force: d.force ? d.force * 2 : 200, dodge: 40, 'martial-cognize': 20,
        ...Object.fromEntries(d.secondary ?? []) }, mappings: {}, preparations: {}, properties: {
            'family/family_name': '华山派', str: 30, con: 30, int: 30, dex: 30,
            shen: d.shen ?? 0, gongxian: d.cost ?? 0, combat_exp: 10000000,
            neili: 2000, max_neili: 2000, jing: 10000, eff_jing: 10000, max_jing: 10000,
            qi: 10000, eff_qi: 10000, max_qi: 10000, potential: 10000, learned_points: 0 } };
    if (variant === 'family-other') actor.properties['family/family_name'] = '武当派';
    if (variant === 'skill-zero') actor.skills[d.skill] = 0;
    if (variant === 'skill-low') actor.skills[d.skill]--;
    if (variant === 'contribution-low') actor.properties.gongxian--;
    if (variant === 'shen-low') actor.properties.shen--;
    if (variant === 'force-low') actor.skills.force--;
    if (variant.endsWith('-raw-low')) actor.skills[variant.slice(0, -8)]--;
    if (variant === 'max-neili-high') actor.properties.max_neili = 2001;
    if (variant === 'force-ceiling-at') actor.skills.force = 410;
    if (variant === 'force-ceiling-round') actor.skills.force = 411;
    if (variant === 'force-ceiling-high') actor.skills.force = 412;
    const acquired = ['grant', 'repeat', 'force-ceiling-at', 'force-ceiling-round'].includes(variant);
    const reasons = { 'skill-zero': '何谈绝招可言', 'skill-low': '了解还不够',
        'contribution-low': '作出的贡献不够', 'shen-low': '侠义正事不够', 'force-low': '内功火候不足',
        'max-neili-high': '已入了气宗歧途', 'force-ceiling-high': '已入了气宗歧途' };
    if (variant.endsWith('-raw-low')) reasons[variant] = '了解还不'; // Original sk2/sk3 split text, observed as one reply.
    if (variant === 'family-other' && !d.ceiling) reasons[variant] = '素无渊源';
    const first = { grant: grantKey(d), value: acquired ? 1 : 0,
        contribution_spent: acquired ? d.cost ?? 0 : 0,
        ...(reasons[variant] ? { response_contains: reasons[variant] } : {}) };
    return { actor, expected: acquired ? 'observed' : 'refused', steps: [first,
        ...(variant === 'repeat' ? [{ grant: grantKey(d), value: 1, contribution_spent: 0 }] : [])] };
}

export function huashanGrantConditions(relations, readSource) {
    for (const [path, hash] of Object.entries(supportHashes))
        assert.equal(sha256(readSource(path)), hash, 're-review changed Huashan teaching support: ' + path);
    return huashanGrantLessons.flatMap(d => {
        const path = `kungfu/class/huashan/${d.file}.c`, hash = teacherHashes[d.file], source = readSource(path);
        assert.equal(sha256(source), hash, 're-review changed Huashan teacher: ' + path);
        const grants = relations.objects.find(t => t.path === path)?.grants
            .filter(g => g.function === 'accept_ask' && g.grant === grantKey(d));
        assert.equal(grants?.length, 1, 'exact Huashan grant declaration required');
        const g = grants[0];
        assert.equal(g.role, 'player_grant_candidate'); assert.equal(g.operation, 'teach_pfm');
        assert.equal(g.evidence.sha256, hash);
        const fields = { perform: grantKey(d), name: d.display ?? d.topic, sk1: d.skill, lv1: d.level,
            ...(d.cost ? { gongxian: d.cost } : {}), ...(d.shen ? { shen: d.shen } : {}),
            ...(d.force ? { force: d.force } : {}) };
        for (const [i, [skill, level]] of (d.secondary ?? []).entries())
            Object.assign(fields, { ['sk' + (i + 2)]: skill, ['lv' + (i + 2)]: level });
        assert.deepEqual(Object.fromEntries(Object.entries(g.fields).map(([k,v]) => [k,v.value])), fields,
            'reviewed Huashan teaching fields changed');
        const fn = scanSource(source).functions.find(f => f.name === 'accept_ask'); assert.ok(fn);
        const entry = { id: `${path}:${fn.line}:accept_ask`, path, sha256: hash,
            function: 'accept_ask', line: fn.line, role: 'teaching' };
        const paths = [path, ...(d.ceiling ? [] : ['kungfu/class/huashan/qizong.h']),
            ...Object.keys(supportHashes), 'kungfu/skill/martial-cognize.c',
            ...[...new Set([d.basic, 'parry', 'dodge', 'force'])].map(s => `kungfu/skill/${s}.c`)];
        const evidence = paths.map(path => ({ path, sha256: sha256(readSource(path)) }));
        return variants(d).map(variant => {
            const cfg = configuration(d,variant), action = `ask ${d.npc} about ${d.topic}`;
            return { id: `teaching-43-huashan-${d.key}-${variant}`, stage: 'school', method: 'teaching',
                entry_id: entry.id, samples: 2, status: 'configured_not_executed', parameters: {
                    collection_group: huashanGrantGroup, teaching_profile: huashanGrantGroup, lesson: d.key, variant,
                    teacher: { path: '/' + path.slice(0,-2), id: d.npc, sha256: hash }, topic: d.topic, action,
                    teaching_entry: entry, teaching_evidence: g.evidence,
                    qualification_sources: paths, qualification_evidence: evidence,
                    actor: cfg.actor, target: { skills: {}, mappings: {}, properties: {} },
                    monitored_grants: [grantKey(d)], teaching_expectations: cfg.steps, expected: cfg.expected,
                    fighting: false, observe_seconds: 0, not_applicable: '',
                    note: '通过原accept_ask及MASTER_D取得许可；资格为实验输入，重复询问不重置角色。'
                        + '剑宗内功上限和基本功奖励按原行为核验，不代表拜师、自然取得武学或绝招施展。',
                } };
        });
    });
}

// Complements, never replaces, the existing teaching actor/command/resource consumer.
export function validateHuashanGrantRecord(raw, condition) {
    const p = condition.parameters, d = huashanGrantLessons.find(d => d.key === p.lesson);
    assert.ok(d, 'unreviewed Huashan lesson');
    const cfg = configuration(d,p.variant), path = `kungfu/class/huashan/${d.file}.c`;
    assert.equal(condition.method, 'teaching');
    assert.equal(condition.id, `teaching-43-huashan-${d.key}-${p.variant}`);
    assert.equal(p.collection_group, huashanGrantGroup); assert.equal(p.teaching_profile, huashanGrantGroup);
    assert.deepEqual(p.teacher, { path: '/' + path.slice(0,-2), id: d.npc, sha256: teacherHashes[d.file] });
    assert.equal(p.teaching_entry.path,path); assert.equal(p.teaching_entry.sha256,teacherHashes[d.file]);
    assert.equal(p.teaching_entry.function,'accept_ask');
    for (const [file, hash] of Object.entries({ ...supportHashes, [path]: teacherHashes[d.file] }))
        assert.ok(p.qualification_evidence?.some(e => e.path === file && e.sha256 === hash), 'Huashan source missing: ' + file);
    assert.equal(p.action,`ask ${d.npc} about ${d.topic}`);
    assert.deepEqual(p.actor,cfg.actor); assert.deepEqual(p.monitored_grants,[grantKey(d)]);
    assert.deepEqual(p.teaching_expectations,cfg.steps); assert.equal(p.expected,cfg.expected);
    assert.equal(raw.outcome,cfg.expected); assert.equal(raw.teaching.length,cfg.steps.length);
    for (const [i, step] of raw.teaching.entries()) {
        const a=step.before,b=step.after;
        assert.equal(step.student,raw.before[0].object); assert.equal(step.student,raw.after[0].object);
        if (i === 0) { assert.deepEqual(a.skills,cfg.actor.skills); assert.deepEqual(a.learned,{}); }
        const skills={...a.skills},learned={...a.learned};
        if (i === 0 && cfg.expected === 'observed') {
            // Every reward skill is <=160 with exp=10M. The original large reward
            // crosses one threshold, increments once and discards remaining proficiency.
            const rewarded=[d.skill,...(d.secondary ?? []).map(([s])=>s),d.basic,'parry','martial-cognize'];
            assert.equal(new Set(rewarded).size,rewarded.length);
            for (const s of rewarded) {
                const level=skills[s]??0; assert.ok(level<=160);
                assert.ok(Math.floor(150000000/(level+100))>(level+1)**2);
                skills[s]=level+1; learned[s]=0;
            }
        }
        assert.deepEqual(b.skills,skills,'Huashan reward/basic-skill levels differ');
        assert.deepEqual(b.learned,learned,'Huashan reward proficiency reset differs');
        for (const key of ['neili','max_neili','mappings','max_jingli','potential','learned_points',
            'family','master_id','master_name','shen','str','int','con','dex','combat_exp'])
            assert.deepEqual(b[key],a[key],'unrelated Huashan state changed: '+key);
    }
}
