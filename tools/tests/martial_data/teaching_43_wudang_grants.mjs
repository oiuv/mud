// Seven explicitly reviewed inquiry grants. No inferred topics or permission injection.
import assert from 'node:assert/strict';
import { scanSource, sha256 } from './inventory.mjs';

export const wudangGrantGroup = 'teaching-43-wudang-grants';
const hashes = {
    mo: '7e350f76d0106cb2425fdcc3af31fe12caf2aa26c1541b6f870c05bf3f784662',
    shan: '70d9ea4ae4f77f7209daf337667823fff9353bc7ad83a9d97883b4a26ae5425a',
    song: '5168ad1378e53a977613b16360bc6141204e5cf95875aa7524173b5b844d25b1',
    xi: '235caea8976bac3d606f61308bbc4812971f5a1742f7cb6749731ab3780c510e',
    yin: 'e155ec9ab1801135f7396add283869f232665915f5e258b834d03929dfbc3490',
    yu: '3e5fbbb9d76486230a95ecb5c5f6f62e343a80fd2eb041198faebc5fa7c13d64',
};
const supportHashes = {
    'feature/skill.c': '99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
    'inherit/skill/skill.c': '891da821f84c26820c1e540822dba751f218441cc03f2b95a1fcfcc3923294cd',
    'cmds/std/ask.c': '568ca1c612f6efda4af6ee54e2712a56ff7ba66aa44c42024978a06b5e5836c2',
};
export const wudangGrantLessons = [
    { key: 'mo-da', file: 'mo', npc: 'mo shenggu', fn: 'ask_skill1', topic: '隔山打牛',
        skill: 'zhenshan-zhang', move: 'da', basic: 'strike', level: 40, cost: 50, shen: 6000, neili: 200 },
    { key: 'mo-sheng', file: 'mo', npc: 'mo shenggu', fn: 'ask_skill2', topic: '太极初升',
        skill: 'wudang-jian', move: 'sheng', basic: 'sword', level: 60, cost: 80, shen: 2000, neili: 300, force: 80 },
    { key: 'shan-zheng', file: 'shan', npc: 'zhang cuishan', fn: 'ask_me', topic: '谁与争锋',
        skill: 'yitian-zhang', move: 'zheng', basic: 'strike', reward: 'zhenshan-zhang',
        level: 120, cost: 200, shen: 12000, neili: 800 },
    { key: 'song-ci', file: 'song', npc: 'song yuanqiao', fn: 'ask_skill', topic: '神门刺',
        skill: 'shenmen-jian', move: 'ci', basic: 'sword', level: 120, cost: 200, shen: 30000, force: 160 },
    { key: 'xi-huan', file: 'xi', npc: 'zhang songxi', fn: 'ask_me', topic: '乱环诀',
        skill: 'xuanxu-dao', move: 'huan', basic: 'blade', level: 100, cost: 150, shen: 10000 },
    { key: 'yin-chuankong', file: 'yin', npc: 'yin liting', fn: 'ask_me', topic: '柔月穿空',
        skill: 'raozhi-roujian', move: 'chuankong', basic: 'sword', level: 100, cost: 250, shen: 15000, force: 150 },
    { key: 'yu-juehu', file: 'yu', npc: 'yu lianzhou', fn: 'ask_me', topic: '绝户神抓',
        skill: 'huzhua-shou', move: 'juehu', basic: 'claw', level: 120, cost: 400, shen: 100000, force: 180 },
];
const grantKey = d => `can_perform/${d.skill}/${d.move}`;
const variants = d => ['grant', 'repeat', 'family-other', 'skill-zero', 'skill-low', 'contribution-low',
    'shen-low', ...(d.neili ? ['max-neili-low'] : []), ...(d.force ? ['force-low'] : [])];

function configuration(d, variant) {
    assert.ok(variants(d).includes(variant), 'unreviewed Wudang grant variant');
    const actor = { skills: { [d.basic]: 40, [d.skill]: d.level,
        force: d.force ? d.force * 2 : 200, 'martial-cognize': 20 }, mappings: {}, preparations: {},
        properties: { 'family/family_name': '武当派', str: 30, int: 30, con: 30, dex: 30,
            shen: d.shen, gongxian: d.cost, combat_exp: 10000000,
            neili: d.neili ?? 1000, max_neili: d.neili ?? 1000,
            jing: 10000, eff_jing: 10000, max_jing: 10000,
            qi: 10000, eff_qi: 10000, max_qi: 10000, potential: 10000, learned_points: 0 } };
    const reasons = {
        'family-other': '不是我们武当派的人', 'contribution-low': '效力还不够',
        'shen-low': d.file === 'yu' ? '这一招太过阴恨' : '行侠仗义的事情做的还很不够',
        'force-low': '你的内功的修为不够', 'max-neili-low': '你的内力修为太浅',
        'skill-zero': '还谈什么绝招可言',
        'skill-low': ['mo'].includes(d.file) ? '修为太浅'
            : d.file === 'yu' ? '你的虎爪绝户手还不到家' : '还不到家',
    };
    if (variant === 'family-other') actor.properties['family/family_name'] = '华山派';
    if (variant === 'skill-zero') actor.skills[d.skill] = 0;
    if (variant === 'skill-low') actor.skills[d.skill]--;
    if (variant === 'contribution-low') actor.properties.gongxian--;
    if (variant === 'shen-low') actor.properties.shen--;
    if (variant === 'max-neili-low') actor.properties.max_neili--;
    if (variant === 'force-low') actor.skills.force--; // floor(raw / 2), no mapped force.
    const acquired = variant === 'grant' || variant === 'repeat';
    const first = { grant: grantKey(d), value: acquired ? 1 : 0,
        contribution_spent: acquired ? d.cost : 0,
        ...(acquired ? {} : { response_contains: reasons[variant] }) };
    return { actor, expected: acquired ? 'observed' : 'refused',
        steps: [first, ...(variant === 'repeat' ? [{ grant: grantKey(d), value: 1, contribution_spent: 0 }] : [])] };
}

export function wudangGrantConditions(relations, readSource) {
    for (const [path, hash] of Object.entries(supportHashes))
        assert.equal(sha256(readSource(path)), hash, 're-review changed Wudang reward/command support: ' + path);
    return wudangGrantLessons.flatMap(d => {
        const path = `kungfu/class/wudang/${d.file}.c`, hash = hashes[d.file];
        const source = readSource(path), scan = scanSource(source);
        assert.equal(sha256(source), hash, 're-review changed Wudang teacher: ' + path);
        const teacher = relations.objects.find(t => t.path === path);
        const grants = teacher?.grants.filter(g => g.function === d.fn && g.grant === grantKey(d));
        assert.equal(grants?.length, 1, 'exact Wudang grant declaration required');
        const grant = grants[0];
        assert.equal(grant.role, 'player_grant_candidate');
        assert.equal(grant.evidence.sha256, hash);
        const fn = scan.functions.find(f => f.name === d.fn);
        assert.ok(fn);
        const entry = { id: `${path}:${fn.line}:${d.fn}`, path, sha256: hash,
            function: d.fn, line: fn.line, role: 'teaching' };
        const skills = [...new Set([d.basic, d.skill, d.reward ?? d.skill, 'force', 'martial-cognize'])];
        const paths = [path, 'kungfu/class/wudang/wudang.h', 'feature/skill.c', 'cmds/std/ask.c',
            'inherit/skill/skill.c', ...skills.map(s => `kungfu/skill/${s}.c`)];
        const evidence = paths.map(path => ({ path, sha256: sha256(readSource(path)) }));
        return variants(d).map(variant => {
            const cfg = configuration(d, variant), action = `ask ${d.npc} about ${d.topic}`;
            return { id: `teaching-43-wudang-${d.key}-${variant}`, stage: 'school', method: 'teaching',
                samples: 2, entry_id: entry.id, status: 'configured_not_executed', parameters: {
                    collection_group: wudangGrantGroup, teaching_profile: wudangGrantGroup,
                    lesson: d.key, variant, teacher: { path: '/' + path.slice(0, -2), id: d.npc, sha256: hash },
                    topic: d.topic, action, teaching_entry: entry, teaching_evidence: grant.evidence,
                    qualification_sources: paths, qualification_evidence: evidence,
                    actor: cfg.actor, target: { skills: {}, mappings: {}, properties: {} },
                    monitored_grants: [grantKey(d)], teaching_expectations: cfg.steps,
                    expected: cfg.expected, fighting: false, observe_seconds: 0, not_applicable: '',
                    note: '门派和初始武学为实验输入；经原 ask 取得许可，重复询问不重置角色。'
                        + '核对固定贡献、原1500000点奖励及拒绝，不代表拜师、养成或绝招施展。',
                } };
        });
    });
}

// Called after the existing teaching identity/resource/continuity consumer.
export function validateWudangGrantRecord(raw, condition) {
    const p = condition.parameters, d = wudangGrantLessons.find(d => d.key === p.lesson);
    assert.ok(d, 'unreviewed Wudang lesson');
    const cfg = configuration(d, p.variant), path = `kungfu/class/wudang/${d.file}.c`;
    assert.equal(condition.method, 'teaching');
    assert.equal(condition.id, `teaching-43-wudang-${d.key}-${p.variant}`);
    assert.equal(p.collection_group, wudangGrantGroup);
    assert.equal(p.teaching_profile, wudangGrantGroup);
    assert.deepEqual(p.teacher, { path: '/' + path.slice(0, -2), id: d.npc, sha256: hashes[d.file] });
    assert.equal(p.teaching_entry.path, path);
    assert.equal(p.teaching_entry.sha256, hashes[d.file]);
    assert.equal(p.teaching_entry.function, d.fn);
    for (const [sourcePath, hash] of Object.entries({ ...supportHashes, [path]: hashes[d.file] }))
        assert.ok(p.qualification_evidence?.some(e => e.path === sourcePath && e.sha256 === hash),
            'missing reviewed Wudang qualification source: ' + sourcePath);
    assert.equal(p.action, `ask ${d.npc} about ${d.topic}`);
    assert.deepEqual(p.actor, cfg.actor, 'reviewed Wudang qualification changed');
    assert.deepEqual(p.monitored_grants, [grantKey(d)]);
    assert.deepEqual(p.teaching_expectations, cfg.steps);
    assert.equal(p.expected, cfg.expected);
    assert.equal(raw.outcome, cfg.expected);
    assert.equal(raw.teaching.length, cfg.steps.length);
    for (const [i, step] of raw.teaching.entries()) {
        const before = step.before, after = step.after;
        assert.equal(step.student, raw.before[0].object);
        assert.equal(step.student, raw.after[0].object);
        if (i === 0) {
            assert.deepEqual(before.skills, cfg.actor.skills, 'no hidden or prelearned reward skill');
            assert.deepEqual(before.learned, {}, 'no injected proficiency');
        }
        const skills = { ...before.skills }, learned = { ...before.learned };
        if (i === 0 && cfg.expected === 'observed') {
            // All reviewed levels are <=120 with exp=10M. can_improve_skill is true;
            // even the unbonused 1.5M reward exceeds (lvl+1)^2. Original improve_skill
            // increments only once and resets learned to 0, rather than bulk levelling.
            for (const skill of [d.basic, d.reward ?? d.skill, 'martial-cognize']) {
                const level = skills[skill] ?? 0;
                assert.ok(level <= 120 && Math.floor(150000000 / (level + 100)) > (level + 1) ** 2);
                skills[skill] = level + 1; learned[skill] = 0;
            }
        }
        assert.deepEqual(after.skills, skills, 'original reward levels or extra skill writes differ');
        assert.deepEqual(after.learned, learned, 'original reward reset/proficiency differs');
        for (const key of ['neili', 'max_neili', 'mappings', 'max_jingli', 'potential', 'learned_points',
            'family', 'master_id', 'master_name', 'shen', 'str', 'int', 'con', 'dex', 'combat_exp'])
            assert.deepEqual(after[key], before[key], 'unrelated Wudang lesson state changed: ' + key);
    }
}
