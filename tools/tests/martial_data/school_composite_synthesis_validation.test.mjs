// Mutation tests for composite synthesis validator — each bad record must be rejected.
//
// 基线为显式合成的最小合法样本，使反例可独立运行，不依赖本机临时目录。
// 合成基线只用于验证校验器拒绝坏记录，**不构成实采证据**；实采须另有正式系列。
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCompositeSynthesisRecord } from './school_composite_synthesis_cases.mjs';

// Minimal contract-satisfying baseline derived from the condition itself.
function synthesizeObservedSample(condition) {
    const p = condition.parameters;
    const beforeSkills = { ...p.actor.skills, ...Object.fromEntries(p.sub_skills.map(s => [s, p.sub_skill_level])) };
    const afterSkills = Object.fromEntries(p.sub_skills.map(s => [s, null]));
    afterSkills[p.skill] = p.sub_skill_level;
    return {
        condition_id: `school-composite-synthesis-${p.skill}-success`,
        method: 'yanlian',
        outcome: 'observed',
        command_accepted: 1,
        yanlian_clock: 'original-user-heartbeat', yanlian_terminal: 'synthesized',
        elapsed: p.sub_skills.length + 2,
        metrics: [{ heartbeats: p.sub_skills.length + 1 }, {}],
        yanlian_steps: Array.from({ length: p.sub_skills.length + 1 }, (_, i) => ({
            driver_heartbeat: 1, step_before: i + 1,
            step_after: i === p.sub_skills.length ? 0 : i + 2,
            busy_before: 'function', busy_after: i === p.sub_skills.length ? null : 'function',
            elapsed_before: i + 1, elapsed: i + 1,
        })),
        before: [
            { skills: beforeSkills, ...p.actor.properties },
            { skills: { ...p.target.skills }, ...p.target.properties },
        ],
        after: [
            { skills: afterSkills, ...p.actor.properties, busy: null },
            { skills: { ...p.target.skills }, ...p.target.properties },
        ],
    };
}

function loadObservedSample() {
    // Pure tests do not depend on stale external evidence. Native replay is separate.
    return synthesizeObservedSample(makeCondition());
}

function makeCondition(overrides = {}) {
    return {
        parameters: {
            collection_group: 'composite-synthesis',
            skill: 'baihua-cuoquan',
            sub_skills: ['cha-quan', 'baji-quan', 'changquan', 'liuhe-quan', 'yanqing-quan',
                'shaolin-quan', 'bagua-zhang', 'bazhen-zhang', 'wudang-zhang',
                'huzhao-shou', 'yingzhao-shou', 'xiao-qinna', 'da-qinna'],
            sub_skill_level: 100,
            expected: 'observed',
            actor: {
                skills: { force: 700, unarmed: 200 },
                mappings: {}, preparations: {},
                properties: {
                    str: 36, int: 30, con: 36, dex: 30,
                    max_neili: 5000, neili: 5000,
                    gender: '男性', 'family/family_name': '红花会',
                },
            },
            target: {
                skills: { force: 600, dodge: 600, parry: 600 },
                mappings: {}, preparations: {},
                properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000, jiali: 0 },
            },
            ...overrides,
        },
    };
}

// Structured clone helper
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

test('干净成功样本通过校验', () => {
    const sample = loadObservedSample();
    assert.ok(sample, '需要合成的校验器反例基线');
    const condition = makeCondition({ skill: sample.condition_id.includes('xianglong') ? 'xianglong-zhang' : 'baihua-cuoquan' });
    // Adjust sub_skills to match the sample
    if (sample.condition_id.includes('xianglong')) {
        condition.parameters.skill = 'xianglong-zhang';
        condition.parameters.sub_skills = [
            'kanglong-youhui', 'feilong-zaitian', 'jianlong-zaitian', 'hongjian-yulu',
            'qianlong-wuyong', 'lishe-dachuan', 'turu-qilai', 'zhenjing-baili',
            'huoyue-zaiyuan', 'shuanglong-qushui', 'yuyue-yuyuan', 'shicheng-liulong',
            'miyun-buyu', 'sunze-youfu', 'longzhan-yuye', 'lvshuang-bingzhi',
            'diyang-chufan', 'shenlong-baiwei',
        ];
        condition.parameters.sub_skill_level = 150;
    }
    validateCompositeSynthesisRecord(sample, condition);
});

test('反例：删除生成的主技能 → 拒绝', () => {
    const sample = clone(loadObservedSample());
    const condition = makeCondition({ skill: sample.condition_id.includes('xianglong') ? 'xianglong-zhang' : 'baihua-cuoquan' });
    if (sample.condition_id.includes('xianglong')) {
        condition.parameters.skill = 'xianglong-zhang';
        condition.parameters.sub_skills = [
            'kanglong-youhui', 'feilong-zaitian', 'jianlong-zaitian', 'hongjian-yulu',
            'qianlong-wuyong', 'lishe-dachuan', 'turu-qilai', 'zhenjing-baili',
            'huoyue-zaiyuan', 'shuanglong-qushui', 'yuyue-yuyuan', 'shicheng-liulong',
            'miyun-buyu', 'sunze-youfu', 'longzhan-yuye', 'lvshuang-bingzhi',
            'diyang-chufan', 'shenlong-baiwei',
        ];
        condition.parameters.sub_skill_level = 150;
    }
    // Mutation: delete the main skill from after
    const mainSkill = condition.parameters.skill;
    delete sample.after[0].skills[mainSkill];
    assert.throws(() => validateCompositeSynthesisRecord(sample, condition),
        /主技能.*合成后必须存在/, '删除主技能应被拒绝');
});

test('反例：保留应删除的子技能 → 拒绝', () => {
    const sample = clone(loadObservedSample());
    const condition = makeCondition();
    if (sample.condition_id.includes('xianglong')) {
        condition.parameters.skill = 'xianglong-zhang';
        condition.parameters.sub_skills = [
            'kanglong-youhui', 'feilong-zaitian', 'jianlong-zaitian', 'hongjian-yulu',
            'qianlong-wuyong', 'lishe-dachuan', 'turu-qilai', 'zhenjing-baili',
            'huoyue-zaiyuan', 'shuanglong-qushui', 'yuyue-yuyuan', 'shicheng-liulong',
            'miyun-buyu', 'sunze-youfu', 'longzhan-yuye', 'lvshuang-bingzhi',
            'diyang-chufan', 'shenlong-baiwei',
        ];
        condition.parameters.skill = 'xianglong-zhang';
        condition.parameters.sub_skill_level = 150;
    }
    // Mutation: keep a sub-skill in after that should be deleted
    const sub = condition.parameters.sub_skills[0];
    sample.after[0].skills[sub] = 100;
    assert.throws(() => validateCompositeSynthesisRecord(sample, condition),
        /合成后应被删除/, '保留子技能应被拒绝');
});

test('反例：命令受理改为 0 → 拒绝', () => {
    const sample = clone(loadObservedSample());
    const condition = makeCondition();
    if (sample.condition_id.includes('xianglong')) {
        condition.parameters.skill = 'xianglong-zhang';
        condition.parameters.sub_skills = [
            'kanglong-youhui', 'feilong-zaitian', 'jianlong-zaitian', 'hongjian-yulu',
            'qianlong-wuyong', 'lishe-dachuan', 'turu-qilai', 'zhenjing-baili',
            'huoyue-zaiyuan', 'shuanglong-qushui', 'yuyue-yuyuan', 'shicheng-liulong',
            'miyun-buyu', 'sunze-youfu', 'longzhan-yuye', 'lvshuang-bingzhi',
            'diyang-chufan', 'shenlong-baiwei',
        ];
        condition.parameters.skill = 'xianglong-zhang';
        condition.parameters.sub_skill_level = 150;
    }
    // Mutation: set command_accepted to 0
    sample.command_accepted = 0;
    assert.throws(() => validateCompositeSynthesisRecord(sample, condition),
        /command_accepted/, '命令受理为 0 应被拒绝');
});

test('反例：初始内功改错 → 拒绝', () => {
    const sample = clone(loadObservedSample());
    const condition = makeCondition();
    if (sample.condition_id.includes('xianglong')) {
        condition.parameters.skill = 'xianglong-zhang';
        condition.parameters.sub_skills = [
            'kanglong-youhui', 'feilong-zaitian', 'jianlong-zaitian', 'hongjian-yulu',
            'qianlong-wuyong', 'lishe-dachuan', 'turu-qilai', 'zhenjing-baili',
            'huoyue-zaiyuan', 'shuanglong-qushui', 'yuyue-yuyuan', 'shicheng-liulong',
            'miyun-buyu', 'sunze-youfu', 'longzhan-yuye', 'lvshuang-bingzhi',
            'diyang-chufan', 'shenlong-baiwei',
        ];
        condition.parameters.skill = 'xianglong-zhang';
        condition.parameters.sub_skill_level = 150;
    }
    // Mutation: change initial force property to wrong value
    sample.before[0].force = 999;
    condition.parameters.actor.properties.force = 700;
    assert.throws(() => validateCompositeSynthesisRecord(sample, condition),
        /初态不符/, '初始内功不匹配应被拒绝');
});

test('反例：below-threshold 出现 observed → 拒绝', () => {
    const sample = clone(loadObservedSample());
    const condition = makeCondition({ expected: 'refused' });
    // sample.outcome is 'observed' but expected is 'refused'
    assert.throws(() => validateCompositeSynthesisRecord(sample, condition),
        /below-threshold must refuse/, 'below-threshold 出现 observed 应被拒绝');
});

test('反例：成功条件 observed 但 yanlian_steps 不足 → 拒绝', () => {
    const sample = clone(loadObservedSample());
    const condition = makeCondition();
    if (sample.condition_id.includes('xianglong')) {
        condition.parameters.skill = 'xianglong-zhang';
        condition.parameters.sub_skills = [
            'kanglong-youhui', 'feilong-zaitian', 'jianlong-zaitian', 'hongjian-yulu',
            'qianlong-wuyong', 'lishe-dachuan', 'turu-qilai', 'zhenjing-baili',
            'huoyue-zaiyuan', 'shuanglong-qushui', 'yuyue-yuyuan', 'shicheng-liulong',
            'miyun-buyu', 'sunze-youfu', 'longzhan-yuye', 'lvshuang-bingzhi',
            'diyang-chufan', 'shenlong-baiwei',
        ];
        condition.parameters.skill = 'xianglong-zhang';
        condition.parameters.sub_skill_level = 150;
    }
    // Mutation: truncate yanlian_steps to 1
    sample.yanlian_steps = [sample.yanlian_steps[0]];
    assert.throws(() => validateCompositeSynthesisRecord(sample, condition),
        /multiple steps/, 'yanlian_steps 不足应被拒绝');
});

test('反例：手动推进、伪造步链、心跳计数及合成等级均被拒绝', () => {
    for (const mutate of [
        raw => { raw.yanlian_clock = 'manual-continue-action'; },
        raw => { raw.yanlian_steps[0].driver_heartbeat = 0; },
        raw => { raw.yanlian_steps[1].step_before++; },
        raw => { raw.metrics[0].heartbeats--; },
        raw => { raw.after[0].skills['baihua-cuoquan'] = 60; },
        raw => { raw.after[0].busy = 'function'; },
    ]) {
        const raw = loadObservedSample(); mutate(raw);
        assert.throws(() => validateCompositeSynthesisRecord(raw, makeCondition()));
    }
});
