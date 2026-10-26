// G3 composite synthesis (yanlian) — sub-skills merge into main skill.
// Tests the actual synthesis process: yanlian command → get_finish check → set_skill(main, avg) → delete_skill(sub).
import assert from 'node:assert/strict';

// Two composites: xianglong-zhang (18 sub-skills × 150) and baihua-cuoquan (13 sub-skills × 100)
export const compositeSynthesisProfiles = [
    {
        skill: 'xianglong-zhang', family: '丐帮', teacher: 'hong',
        subSkills: [
            'kanglong-youhui', 'feilong-zaitian', 'jianlong-zaitian', 'hongjian-yulu',
            'qianlong-wuyong', 'lishe-dachuan', 'turu-qilai', 'zhenjing-baili',
            'huoyue-zaiyuan', 'shuanglong-qushui', 'yuyue-yuyuan', 'shicheng-liulong',
            'miyun-buyu', 'sunze-youfu', 'longzhan-yuye', 'lvshuang-bingzhi',
            'diyang-chufan', 'shenlong-baiwei',
        ],
        subSkillLevel: 150,  // threshold for synthesis
        mainSkillLevel: 0,   // main skill doesn't exist yet
        getReadyPrereqs: 'none (get_ready returns 1)',
        getFinishPrereqs: 'character!=阴险奸诈, gender!=无性, str>=36, con>=32, force>=300, max_neili>=3000, strike>=180',
    },
    {
        skill: 'baihua-cuoquan', family: '红花会', teacher: 'chen',
        subSkills: [
            'cha-quan', 'baji-quan', 'changquan', 'liuhe-quan', 'yanqing-quan',
            'shaolin-quan', 'bagua-zhang', 'bazhen-zhang', 'wudang-zhang',
            'huzhao-shou', 'yingzhao-shou', 'xiao-qinna', 'da-qinna',
        ],
        subSkillLevel: 100,  // threshold for synthesis
        mainSkillLevel: 0,
        getReadyPrereqs: 'none (get_ready returns 1)',
        getFinishPrereqs: 'int>=28, dex>=23, unarmed>=150, force>=250, martial-cognize>=80, max_neili>=3000',
    },
];

export function compositeSynthesisConditions(catalog, { smoke = false } = {}) {
    const result = [];
    for (const profile of compositeSynthesisProfiles) {
        const { skill, family, teacher, subSkills, subSkillLevel, getFinishPrereqs } = profile;
        // Verify all sub-skills exist in catalog
        for (const sub of subSkills) {
            assert.ok(catalog.skills.some(s => s.id === sub), '缺少子技能源码：' + sub);
        }
        const mainSource = catalog.skills.find(s => s.id === skill);
        assert.ok(mainSource, '缺少主技能源码：' + skill);

        // Actor: all sub-skills at threshold, main skill at 0, prerequisites for get_finish
        // force uses query_skill("force") without flag → effective level; set base high enough
        const actorSkills = {
            ...Object.fromEntries(subSkills.map(s => [s, subSkillLevel])),
            force: 700, unarmed: 200, strike: 200, cuff: 150, claw: 150,
            'martial-cognize': 100,
        };
        const actorProps = {
            str: 36, int: 30, con: 36, dex: 30,
            max_neili: 5000, neili: 5000, max_qi: 10000, qi: 10000,
            jing: 10000, max_jing: 10000,
            gender: '男性', 'family/family_name': family,
            combat_exp: 10000000, potential: 100000, learned_points: 0,
        };

        // Test 1: yanlian with all sub-skills at threshold (should succeed)
        result.push({
            id: `school-composite-synthesis-${skill}-success-l${subSkillLevel}`,
            stage: 'school', entry_id: mainSource.path,
            method: 'yanlian', samples: smoke ? 2 : 100,
            parameters: {
                school: family === '丐帮' ? 'gaibang' : 'honghua',
                family, collection_group: 'composite-synthesis',
                skill, ability: 'yanlian', usage: 'strike', level: subSkillLevel,
                sub_skills: subSkills, sub_skill_level: subSkillLevel,
                observation: 'original_yanlian_synthesis',
                action: `yanlian ${skill}`,
                expected: ['observed', 'refused'], not_applicable: '',
                actor: {
                    skills: actorSkills,
                    mappings: {},
                    preparations: {},
                    properties: actorProps,
                },
                target: {
                    skills: { force: 600, dodge: 600, parry: 600 },
                    mappings: {}, preparations: {},
                    properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000, jiali: 0 },
                },
                fighting: false, observe_seconds: subSkills.length * 2 + 10,
                qualification_sources: [
                    mainSource.path, 'cmds/skill/yanlian.c', 'inherit/skill/skill.c',
                    ...subSkills.map(s => `kungfu/skill/${s}.c`),
                    `kungfu/class/${family === '丐帮' ? 'gaibang/hong' : 'honghua/chen'}.c`,
                    'feature/skill.c',
                ],
                qualification_note: `yanlian 合成测试：${skill} 由 ${subSkills.length} 个子技能合成。`
                    + `子技能全部设为 ${subSkillLevel} 级，主技能初始 0。`
                    + `get_finish 前提：${getFinishPrereqs}。`
                    + `合成后主技能=子技能平均等级，子技能删除。`
                    + `经原 yanlian 命令和 practicing 回调，不预写主技能或清除子技能。`
                    + `实验赋值不证明自然可学性或同养成成本。`,
            },
        });

        // Test 2: yanlian with sub-skills below threshold (should fail at get_finish)
        const lowSkills = Object.fromEntries(subSkills.map(s => [s, Math.floor(subSkillLevel * 0.5)]));
        result.push({
            id: `school-composite-synthesis-${skill}-below-threshold-l${Math.floor(subSkillLevel * 0.5)}`,
            stage: 'school', entry_id: mainSource.path,
            method: 'yanlian', samples: smoke ? 2 : 2,
            parameters: {
                school: family === '丐帮' ? 'gaibang' : 'honghua',
                family, collection_group: 'composite-synthesis',
                skill, ability: 'yanlian', usage: 'strike', level: Math.floor(subSkillLevel * 0.5),
                sub_skills: subSkills, sub_skill_level: Math.floor(subSkillLevel * 0.5),
                observation: 'original_yanlian_synthesis',
                action: `yanlian ${skill}`,
                expected: 'refused', not_applicable: '',
                actor: {
                    skills: { ...lowSkills, force: 700, unarmed: 200, strike: 200, cuff: 150, claw: 150, 'martial-cognize': 100 },
                    mappings: {}, preparations: {},
                    properties: actorProps,
                },
                target: {
                    skills: { force: 600, dodge: 600, parry: 600 },
                    mappings: {}, preparations: {},
                    properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000, jiali: 0 },
                },
                fighting: false, observe_seconds: subSkills.length * 2 + 10,
                qualification_sources: [
                    mainSource.path, 'cmds/skill/yanlian.c', 'inherit/skill/skill.c',
                    ...subSkills.map(s => `kungfu/skill/${s}.c`),
                ],
                qualification_note: `子技能不足 ${subSkillLevel} 级时 yanlian 合成失败。`
                    + `验证 get_finish 或 practicing 中的等级检查拒绝不满足条件的合成。`,
            },
        });
    }
    return result;
}

export function validateCompositeSynthesisRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'composite-synthesis');
    assert.equal(raw.method, 'yanlian');

    // Initial state must match frozen condition
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before?.[side];
        assert.ok(before?.skills, 'missing initial skill state');
        for (const [skill, level] of Object.entries(config.skills))
            assert.equal(before.skills[skill], level, 'initial skill ' + skill);
        if (config.properties) {
            for (const key of Object.keys(config.properties)) {
                if (key.includes('/')) continue;
                assert.equal(before[key], config.properties[key], '初态不符：' + key);
            }
        }
    }

    if (raw.outcome === 'observed') assert.ok(raw.yanlian_steps?.length > 1, 'synthesis should have multiple steps');
    assert.equal(raw.yanlian_clock, 'original-user-heartbeat', 'missing original heartbeat evidence');
    assert.equal(raw.command_accepted, 1, 'command_accepted');
    assert.ok(raw.yanlian_steps?.length > 0, 'missing original heartbeat steps');
    assert.equal(raw.metrics?.[0]?.heartbeats, raw.yanlian_steps.length, 'heartbeat count');
    let nextStep = 1, elapsed = 0;
    for (const step of raw.yanlian_steps) {
        assert.equal(step.driver_heartbeat, 1, 'not an original driver heartbeat');
        assert.equal(step.step_before, nextStep, 'practice step chain');
        assert.ok(typeof step.busy_before === 'string', 'busy callback before original heartbeat');
        assert.ok(Number.isFinite(step.elapsed_before) && step.elapsed_before >= elapsed);
        assert.ok(Number.isFinite(step.elapsed) && step.elapsed >= step.elapsed_before && step.elapsed <= raw.elapsed);
        elapsed = step.elapsed;
        nextStep = step.step_after ?? 0;
    }
    assert.ok(raw.after[0].busy === null || raw.after[0].busy === 0, 'synthesis still busy');
    const last = raw.yanlian_steps.at(-1);
    assert.ok(last.busy_after === null || last.busy_after === 0, 'last heartbeat incomplete');
    const originalSkills = raw.before[0].skills, finalSkills = raw.after[0].skills;
    if (p.expected === 'refused') {
        assert.equal(raw.outcome, 'refused', 'below-threshold must refuse');
        assert.ok(raw.reason?.length > 0, 'refusal must carry a reason');
        assert.equal(raw.yanlian_terminal, 'practice_stopped');
        assert.ok(!finalSkills[p.skill]);
        for (const sub of p.sub_skills) assert.equal(finalSkills[sub], originalSkills[sub]);
        return;
    }
    assert.equal(raw.yanlian_steps.length, p.sub_skills.length + 1, 'full practice completed');
    assert.equal(last.step_before, p.sub_skills.length + 1, 'get_finish stage');
    assert.ok(last.step_after === null || last.step_after === 0, 'get_finish did not complete');

    // Success condition: outcome must be observed or refused (random gate)
    assert.ok(['observed', 'refused'].includes(raw.outcome), 'synthesis outcome');

    if (raw.outcome === 'observed') {
        assert.equal(raw.yanlian_terminal, 'synthesized');
        // Synthesis must have run through multiple heartbeat steps
        assert.ok(raw.yanlian_steps?.length > 1, 'synthesis should have multiple steps');

        // Command must have been accepted
        assert.ok(raw.command_accepted, 'command_accepted must be truthy on synthesis success');

        // Main skill must exist after (not before), level = integer average of sub-skills
        const beforeSkills = raw.before?.[0]?.skills ?? {};
        const afterSkills = raw.after?.[0]?.skills ?? {};
        const mainSkill = p.skill;
        assert.ok(afterSkills[mainSkill] > 0, `主技能 ${mainSkill} 合成后必须存在且等级>0`);
        assert.ok(!beforeSkills[mainSkill], `主技能 ${mainSkill} 合成前不应存在`);
        // yanlian.c: lvl = sum(sub_skill_levels) / sizeof(sub_skills) (integer division)
        const subLevels = p.sub_skills.map(s => beforeSkills[s] ?? 0);
        const expectedLevel = Math.floor(subLevels.reduce((a, b) => a + b, 0) / subLevels.length);
        assert.equal(afterSkills[mainSkill], expectedLevel,
            `主技能等级 ${afterSkills[mainSkill]} 应等于子技能均值 ${expectedLevel}`);

        // Sub-skills must be deleted after (existed before)
        for (const sub of p.sub_skills) {
            assert.ok(beforeSkills[sub] > 0, `子技能 ${sub} 合成前应存在`);
            assert.ok(!(sub in afterSkills) || afterSkills[sub] == null,
                `子技能 ${sub} 合成后应被删除`);
        }
    } else {
        assert.equal(raw.yanlian_terminal, 'finish_refused');
        assert.ok(!finalSkills[p.skill], 'refused synthesis created main skill');
        // refused on success condition = random gate; must have completed all steps
        // yanlian.c: steps = sub_skills.length (each sub-skill) + 1 (final get_finish)
        const minSteps = p.sub_skills.length + 1;
        assert.ok(raw.yanlian_steps?.length >= minSteps,
            `refused success condition must have ≥${minSteps} yanlian_steps (full practice completed), got ${raw.yanlian_steps?.length ?? 0}`);
        assert.ok(raw.command_accepted,
            'refused success condition must have command_accepted (yanlian was accepted)');
        // sub-skills must remain
        const beforeSkills = raw.before?.[0]?.skills ?? {};
        const afterSkills = raw.after?.[0]?.skills ?? {};
        for (const sub of p.sub_skills) {
            if (beforeSkills[sub] > 0) {
                assert.equal(afterSkills[sub], beforeSkills[sub], `子技能 ${sub} 在拒绝路径中必须保持原等级`);
            }
        }
    }
}
