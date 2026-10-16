// Reviewed interface cases for the full-skill phase. Not yet wired into the
// running frozen weapon series; these are configurations, not test results.
import assert from 'node:assert/strict';

export function learningConditions(catalog) {
    const result = [];
    const add = (id, skill, skills, properties, expected, issue, reason = '', extraSources = []) => {
        const source = catalog.skills.find(item => item.id === skill);
        const entry = source?.entries.find(item => item.function === 'valid_learn');
        if (!entry) throw new Error(`学习入口未收录：${skill}`);
        for (const name of Object.keys(skills)) {
            if (!catalog.skills.some(item => item.id === name)) throw new Error(`技能定义不存在：${name}`);
        }
        result.push({
            id, stage: 'skill', entry_id: entry.id, method: 'interface', samples: 2,
            parameters: {
                actor: { skills, mappings: {}, properties: { max_neili: 6000, neili: 6000, ...properties } },
                target: { skills: {}, mappings: {}, properties: {} },
                interface: { object: `/kungfu/skill/${skill}`, function: 'valid_learn' },
                action: 'test_interface', fighting: false, observe_seconds: 0,
                observation: 'single_action_immediate', not_applicable: '',
                qualification_sources: [source.path, 'feature/skill.c', ...extraSources],
                expected, expected_reason: reason, known_issue: issue,
                note: '直接观察原 valid_learn；不是师父传授或练功成功。只用真实技能 ID，不修正错误分支；预期值是待验证的当前行为，不代表设计正确。',
            },
        });
    };

    // The typo weakens the relative-level gate, but the absolute 80 gate remains.
    for (const strike of [80, 79]) add(`learning-chousui-strike-${strike}`, 'chousui-zhang',
        { poison: 50, force: 200, strike, 'chousui-zhang': 200 }, {},
        strike === 80 ? 'observed' : 'refused', 'MA-005.01', strike === 79 ? '掌法根基不足' : '');

    // The FORCE ancestor still requires basic force 10; do not substitute the
    // unrelated /kungfu/skill/force definition for /inherit/skill/force.
    for (const force of [10, 9]) add(`learning-lengyue-force-${force}`, 'lengyue-shengong',
        { force, 'lengyue-shengong': 100 }, { gender: '无性' },
        force === 10 ? 'observed' : 'refused', 'MA-005.07', force === 9 ? '基本内功火候不够' : '',
        ['inherit/skill/force.c']);

    for (const throwing of [20, 19]) add(`learning-xuanyuan-throwing-${throwing}`, 'xuanyuan-arrow',
        { throwing, 'xuanyuan-arrow': 200 }, {},
        throwing === 20 ? 'observed' : 'refused', 'MA-005.12', throwing === 19 ? '暗器技能不够娴熟' : '');

    for (const medical of [100, 99]) add(`learning-yaowang-medical-${medical}`, 'yaowang-miaoshu',
        { medical, 'yaowang-miaoshu': 200 }, {},
        medical === 100 ? 'observed' : 'refused', 'MA-005.13', medical === 99 ? '基本医术造诣太浅' : '');

    // Alternative real music qualifications; never create the misspelled key.
    for (const instrument of ['flute', 'qin']) add(`learning-xiaoao-${instrument}`, 'xiaoao-jianghu',
        { 'xiaoao-jianghu': 100, 'qingxin-pushan': 100,
            [instrument === 'flute' ? 'chuixiao-jifa' : 'tanqin-jifa']: 100 }, {},
        instrument === 'flute' ? 'refused' : 'observed', 'MA-005.10',
        instrument === 'flute' ? '无法领会更精妙的笑傲江湖曲' : '');

    // Test the missing prerequisite without inventing xuan-huntun. No weapon,
    // no combined huntian-baojian, and all earlier explicit gates are satisfied.
    for (const level of [0, 200]) add(`learning-diancanghai-level-${level}`, 'dian-canghai',
        { force: 200, unarmed: 200, ...(level ? { 'dian-canghai': level } : {}) }, { con: 35 },
        'refused', 'MA-006', '玄馄饨');
    return result;
}

export function validateLearningRecord(raw, condition) {
    assert.equal(condition.method, 'interface');
    assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, 'interface');
    const p = condition.parameters;
    assert.equal(raw.outcome, p.expected);
    assert.equal(raw.interfaces.length, 1);
    assert.deepEqual(raw.interfaces[0], { ...p.interface, result: p.expected === 'observed' ? 1 : 0 });
    assert.deepEqual(raw.metrics, [{}, {}]);
    assert.equal(raw.before[0].weapon, 'none');
    for (const [skill, level] of Object.entries(p.actor.skills)) assert.equal(raw.before[0].skills[skill] ?? 0, level);
    for (const [key, value] of Object.entries(p.actor.properties)) assert.equal(raw.before[0][key], value);
    for (const wrong of ['choushui-zhang', 'lenyue-shengong', 'xuanyuan-arror',
        'yaowang-mishu', 'cuhixiao-jifa', 'xuan-huntun']) assert.equal(raw.before[0].skills[wrong] ?? 0, 0);
    if (p.expected_reason) assert.ok(raw.reason.includes(p.expected_reason), '拒绝理由应来自目标分支');
    // Resources/state changes are a separate outcome, not silently accepted as
    // a harmless learning query. The runner also validates real player identity.
    // 修订（2026-10-13 契约复核）：原命令拒绝会经原 notify_fail 通道留下临时标记
    // （raw.reason 同源保存原文），属命令提示痕迹而非资源/技能/状态变化；比较时剥离该键。
    // 资源、技能、属性等真实状态变化仍会因深度比较失败而拒绝（单测反例继续有效）。
    const strip = s => { const t = { ...s, temp: { ...(s.temp ?? {}) } }; delete t.temp.notify_fail; return t; };
    assert.deepEqual(raw.immediate.map(strip), raw.before.map(strip));
    assert.deepEqual(raw.after.map(strip), raw.before.map(strip));
}
