// Reduced combination template for 27 slice groups with valid_combine sources.
// Groups without these pairs remain outside this batch, not outside task 4.2.
import assert from 'node:assert/strict';
import { validateWudangCombinationRecord } from './school_wudang_combination_cases.mjs';

// Valid_combine pairs per slice group (bidirectional unless noted)
export const sliceCombinationPairs = {
    duan: [['jinyu-quan', 'wuluo-zhang']],
    gaibang: [['jueming-tui', 'tongchui-zhang']],
    henshan: [['biluo-zhang', 'henshan-quan']],
    honghua: [['taiji-quan', 'wudang-zhang']],  // cross-school but bidirectional valid_combine
    hu: [['chuncan-zhang', 'hujia-quan']],
    jueqing: [['chuanxin-zhang', 'tiexian-quan']],
    kunlun: [['kunlun-zhang', 'zhentian-quan'], ['sanyin-shou', 'kunlun-zhang']],
    lingjiu: [['dusha-zhang', 'lansha-shou'], ['liuyang-zhang', 'zhemei-shou']],
    lingxiao: [['lingxiao-quan', 'piaoxu-zhang']],
    meizhuang: [['longzhua-gong', 'qianye-shou']],
    miao: [['chongtian-zhang', 'panlong-zhao']],
    murong: [['banruo-zhang', 'yizhi-chan'], ['nianhua-zhi', 'sanhua-zhang'], ['fengyun-shou', 'yingzhua-gong']],
    ouyang: [['lingshe-quan', 'shedu-qiqiao']],
    riyue: [['poyue-zhao', 'zhenyu-quan']],
    shang: [['bagua-quan', 'bagua-zhang']],
    shenlong: [['chousui-zhang', 'sanyin-wugongzhao'], ['huagu-mianzhang', 'shenlong-bashi']],
    songshan: [['songshan-quan', 'songshan-zhang']],
    tianlongsi: [['dashou-yin', 'yujiamu-quan'], ['huoyan-dao', 'dashou-yin']],
    tiezhang: [['chuanxin-zhang', 'tiexian-quan']],
    wudu: [['tianchan-zhang', 'wusheng-zhao']],
    xiaoyao: [['liuyang-zhang', 'zhemei-shou'], ['panyang-zhang', 'qingyun-shou']],
    xingxiu: [['chousui-zhang', 'sanyin-wugongzhao']],
    xuanming: [['dulong-shenzhua', 'xuanming-zhang'], ['piaofeng-quan', 'feihua-zhang']],
    xuedao: [['dashou-yin', 'yujiamu-quan']],
    xueshan: [['dashou-yin', 'yujiamu-quan']],
    yunlong: [['yunlong-shou', 'yunlong-zhua']],
    zhenyuan: [['bagua-quan', 'bagua-zhang']],
};

// Asymmetric pairs: A allows B, but B does not allow A
export const sliceAsymmetricPairs = {
    jueqing: [['pokong-quan', 'guhong-zhang']],  // pokong→guhong only (guhong has no valid_combine)
};

// Skill usage mapping for prepare commands
export const sliceUsageMap = {
    'jinyu-quan': 'cuff', 'wuluo-zhang': 'strike',
    'jueming-tui': 'unarmed', 'tongchui-zhang': 'strike',
    'biluo-zhang': 'strike', 'henshan-quan': 'cuff',
    'chuncan-zhang': 'strike', 'hujia-quan': 'cuff',
    'chuanxin-zhang': 'strike', 'tiexian-quan': 'cuff',
    'pokong-quan': 'cuff', 'guhong-zhang': 'strike',
    'kunlun-zhang': 'strike', 'zhentian-quan': 'cuff', 'sanyin-shou': 'hand',
    'dusha-zhang': 'strike', 'lansha-shou': 'hand',
    'liuyang-zhang': 'strike', 'zhemei-shou': 'hand',
    'lingxiao-quan': 'cuff', 'piaoxu-zhang': 'strike',
    'longzhua-gong': 'claw', 'qianye-shou': 'hand',
    'chongtian-zhang': 'strike', 'panlong-zhao': 'claw',
    'banruo-zhang': 'strike', 'yizhi-chan': 'finger',
    'nianhua-zhi': 'finger', 'sanhua-zhang': 'strike',
    'fengyun-shou': 'hand', 'yingzhua-gong': 'claw',
    'lingshe-quan': 'cuff', 'shedu-qiqiao': 'finger',
    'poyue-zhao': 'claw', 'zhenyu-quan': 'cuff',
    'bagua-quan': 'cuff', 'bagua-zhang': 'strike',
    'chousui-zhang': 'strike', 'sanyin-wugongzhao': 'claw',
    'huagu-mianzhang': 'strike', 'shenlong-bashi': 'hand',
    'songshan-quan': 'cuff', 'songshan-zhang': 'strike',
    'dashou-yin': 'hand', 'yujiamu-quan': 'cuff', 'huoyan-dao': 'strike',
    'tianchan-zhang': 'strike', 'wusheng-zhao': 'claw',
    'panyang-zhang': 'strike', 'qingyun-shou': 'hand',
    'dulong-shenzhua': 'claw', 'xuanming-zhang': 'strike',
    'piaofeng-quan': 'cuff', 'feihua-zhang': 'strike',
    'yunlong-shou': 'hand', 'yunlong-zhua': 'claw',
    'taiji-quan': 'unarmed', 'wudang-zhang': 'strike',
};

// Family names for each group
export const sliceFamilyMap = {
    duan: '段氏皇族', gaibang: '丐帮', henshan: '衡山派', honghua: '红花会',
    hu: '关外胡家', jueqing: '绝情谷', kunlun: '昆仑派', lingjiu: '灵鹫宫',
    lingxiao: '凌霄城', meizhuang: '梅庄', miao: '中原苗家', murong: '慕容世家',
    ouyang: '欧阳世家', riyue: '日月神教', shang: '商家堡', shenlong: '神龙教',
    songshan: '嵩山派', tianlongsi: '天龙寺', tiezhang: '铁掌帮', wudu: '五毒教',
    xiaoyao: '逍遥派', xingxiu: '星宿派', xuanming: '玄冥谷', xuedao: '血刀门',
    xueshan: '雪山派', yunlong: '云龙门', zhenyuan: '八卦门',
};

export function sliceCombinationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    for (const [group, pairs] of Object.entries(sliceCombinationPairs)) {
        const family = sliceFamilyMap[group] || group;
        for (const [skillA, skillB] of pairs) {
            const usageA = sliceUsageMap[skillA] || 'strike';
            const usageB = sliceUsageMap[skillB] || 'cuff';
            const sourceA = catalog.skills.find(s => s.id === skillA);
            const sourceB = catalog.skills.find(s => s.id === skillB);
            assert.ok(sourceA, '缺少组合源码：' + skillA);
            assert.ok(sourceB, '缺少组合源码：' + skillB);

            // 1. valid_combine interface: A allows B, B allows A, plus negative
            for (const [skill, combo, allowed] of [
                [skillA, skillB, 1], [skillB, skillA, 1],
                [skillA, skillA, 0], [skillB, skillB, 0],
            ]) {
                const usage = skill === skillA ? usageA : usageB;
                result.push({
                    id: `school-slice-combination-${group}-${skillA}-${skillB}-${skill}-allows-${combo}-l200`,
                    stage: 'school', entry_id: (skill === skillA ? sourceA : sourceB).path,
                    method: 'interface', samples: 2,
                    parameters: {
                        school: group, family, collection_group: 'slice-combination',
                        skill, level: 200, ability: 'valid_combine', combination: skillA + '-' + skillB,
                        observation: 'single_action_immediate',
                        actor: {
                            skills: { [skill]: 200, force: 600, [usage]: 200 },
                            mappings: { [usage]: skill },
                            preparations: {},
                            properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000,
                                jiali: 0, 'family/family_name': family },
                        },
                        target: { skills: { force: 600, dodge: 600, parry: 600 },
                            mappings: {}, properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000, jiali: 0 } },
                        action: 'test_interface',
                        interface: { object: '/kungfu/skill/' + skill, function: 'valid_combine', combo },
                        combine_result: allowed,
                        fighting: false, observe_seconds: 0,
                        not_applicable: '', expected: 'observed',
                        qualification_sources: [sourceA.path, sourceB.path,
                            'feature/skill.c', 'cmds/skill/prepare.c'],
                        qualification_note: 'valid_combine 接口方向性测试，' + skill + '对' + combo + '的互备声明。'
                            + '实验赋值不证明可学性。允许=1/拒绝=0。',
                    },
                });
            }

            // 2. prepare_sequence: pair preparation
            for (const first of [skillA, skillB]) {
                const second = first === skillA ? skillB : skillA;
                const usageFirst = first === skillA ? usageA : usageB;
                const usageSecond = second === skillA ? usageA : usageB;
                result.push({
                    id: `school-slice-combination-${group}-${skillA}-${skillB}-${first}-prepare-l200`,
                    stage: 'school', entry_id: sourceA.path,
                    method: 'prepare', samples: 2,
                    parameters: {
                        school: group, family, collection_group: 'slice-combination',
                        skill: first, level: 200, ability: 'prepare_pair', combination: skillA + '-' + skillB,
                        observation: 'single_action_immediate',
                        actor: {
                            skills: { [skillA]: 200, [skillB]: 200, force: 600,
                                [usageA]: 200, [usageB]: 200 },
                            mappings: { [usageA]: skillA, [usageB]: skillB },
                            preparations: {},
                            properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000,
                                jiali: 0, 'family/family_name': family },
                        },
                        target: { skills: { force: 600, dodge: 600, parry: 600 },
                            mappings: {}, properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000, jiali: 0 } },
                        action: 'prepare_sequence',
                        prepare_commands: [
                            { action: 'prepare ' + first, accepted: 1, preparations: { [usageFirst]: first } },
                            { action: 'prepare ' + second, accepted: 1,
                                preparations: { [usageFirst]: first, [usageSecond]: second } },
                        ],
                        fighting: false, observe_seconds: 0,
                        not_applicable: '', expected: 'observed',
                        qualification_sources: [sourceA.path, sourceB.path,
                            'cmds/skill/prepare.c', 'feature/skill.c'],
                        qualification_note: '互备准备序列，先' + first + '后' + second + '。'
                            + '原命令逐步配对，不预填prepare。',
                    },
                });
            }

            // 3. fight_round: solo and pair
            for (const mode of ['solo', 'pair']) {
                const active = mode === 'pair' ? [skillA, skillB] : [skillA];
                result.push({
                    id: `school-slice-combination-${group}-${skillA}-${skillB}-${mode}-l200`,
                    stage: 'school', entry_id: sourceA.path,
                    method: 'round', samples: smoke ? 2 : samples,
                    parameters: {
                        school: group, family, collection_group: 'slice-combination',
                        skill: skillA, level: 200, ability: mode, combination: skillA + '-' + skillB,
                        observation: 'single_action_immediate',
                        actor: {
                            skills: Object.fromEntries([...active, ...active.map(s => sliceUsageMap[s]), 'force'].map(s => [s, 200])),
                            mappings: { ...Object.fromEntries(active.map(s => [sliceUsageMap[s] || 'strike', s])) },
                            preparations: {},
                            properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000,
                                jiali: 0, 'family/family_name': family },
                        },
                        target: { skills: { force: 600, dodge: 600, parry: 600, unarmed: 600 },
                            mappings: {}, properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000, jiali: 0 } },
                        action: 'fight_round', fighting: true, observe_seconds: 0,
                        prepare_commands: active.map((s, index) => ({
                            action: 'prepare ' + s, accepted: 1,
                            preparations: Object.fromEntries(active.slice(0, index + 1).map(id => [sliceUsageMap[id], id])),
                        })),
                        not_applicable: '', expected: 'observed',
                        qualification_sources: [sourceA.path, sourceB.path,
                            'feature/attack.c', 'feature/skill.c', 'adm/daemons/combatd.c',
                            'include/combat.h', 'cmds/skill/prepare.c'],
                        qualification_note: '互备' + mode + '单轮交锋，保留守势/随机双击/反击。'
                            + '不自动perform/exert，仅一轮COMBAT_D->fight()。',
                    },
                });
            }
        }
    }
    // Asymmetric pairs: interface direction only
    for (const [group, pairs] of Object.entries(sliceAsymmetricPairs)) {
        const family = sliceFamilyMap[group] || group;
        for (const [skillA, skillB] of pairs) {
            const sourceA = catalog.skills.find(s => s.id === skillA);
            const sourceB = catalog.skills.find(s => s.id === skillB);
            assert.ok(sourceA, '缺少组合源码：' + skillA);
            assert.ok(sourceB, '缺少组合源码：' + skillB);
            const usageA = sliceUsageMap[skillA] || 'strike';
            for (const [skill, combo, allowed] of [
                [skillA, skillB, 1], [skillB, skillA, null],
            ]) {
                const usage = skill === skillA ? usageA : (sliceUsageMap[skillB] || 'cuff');
                result.push({
                    id: `school-slice-combination-${group}-${skillA}-${skillB}-${skill}-allows-${combo}-l200`,
                    stage: 'school', entry_id: (skill === skillA ? sourceA : sourceB).path,
                    method: 'interface', samples: 2,
                    parameters: {
                        school: group, family, collection_group: 'slice-combination',
                        skill, level: 200, ability: 'valid_combine_asym', combination: skillA + '-' + skillB,
                        observation: 'single_action_immediate',
                        actor: {
                            skills: { [skill]: 200, force: 600, [usage]: 200 },
                            mappings: { [usage]: skill }, preparations: {},
                            properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000,
                                jiali: 0, 'family/family_name': family },
                        },
                        target: { skills: { force: 600, dodge: 600, parry: 600 },
                            mappings: {}, properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000, jiali: 0 } },
                        action: 'test_interface',
                        interface: { object: '/kungfu/skill/' + skill, function: 'valid_combine', combo },
                        combine_result: allowed,
                        fighting: false, observe_seconds: 0,
                        not_applicable: '', expected: 'observed',
                        qualification_sources: [sourceA.path, sourceB.path, 'feature/skill.c', 'inherit/skill/skill.c'],
                        qualification_note: '非对称互备方向性：' + skill + '→' + combo
                            + (allowed ? '允许。' : '无valid_combine实现，原call_other返回未定义值，记录为null，不冒充显式返回0。')
                            + '原valid_combine声明单向。',
                    },
                });
            }
        }
    }
    return result;
}

export function validateSliceCombinationRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'slice-combination');
    assert.equal(raw.outcome, p.expected);
    assert.ok(['interface', 'prepare', 'round'].includes(condition.method), '未知组合方法');
    assert.equal(raw.method, condition.method);
    assert.deepEqual(p.actor.preparations, {}, '准备必须由原命令建立，不能预填后重复准备');
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side];
        assert.equal(before.userp, 1); assert.equal(before.interactive, 1); assert.equal(before.wizardp, 0);
        assert.deepEqual(before.skills, config.skills);
        assert.deepEqual(before.mappings, config.mappings);
        assert.deepEqual(before.preparations, config.preparations ?? {});
        assert.equal(before.weapon, 'none');
        for (const [key, value] of Object.entries(config.properties))
            assert.equal(key.includes('/') ? before.cultivation[key] : before[key], value, '初态不符：' + key);
    }
    if (condition.method !== 'round') validateWudangCombinationRecord(raw, condition);
    else {
        assert.equal(raw.launches.length, 0);
        assert.equal(raw.interfaces.length, 0);
        assert.equal(raw.prepare_steps.length, p.prepare_commands.length);
        let previous = raw.before[0];
        for (const [index, step] of raw.prepare_steps.entries()) {
            const expected = p.prepare_commands[index];
            assert.equal(step.action, expected.action); assert.equal(step.accepted, expected.accepted);
            assert.deepEqual(step.before, previous);
            assert.deepEqual(step.after.preparations, expected.preparations);
            assert.deepEqual([...step.after.preparation_order].sort(), Object.keys(expected.preparations).sort());
            const a = structuredClone(step.before), b = structuredClone(step.after);
            for (const state of [a, b]) { delete state.preparations; delete state.preparation_order; delete state.temp.notify_fail; }
            assert.deepEqual(b, a, '准备不能改变资源/技能');
            previous = step.after;
        }
        assert.deepEqual(raw.immediate[0].preparations, previous.preparations);
        const hits = raw.attacks.filter(a => a.actor === 0 && a.target === 1);
        const order = previous.preparation_order;
        assert.equal(raw.immediate[0].temp.guarding, hits.length ? 0 : 1, '零出招必须有原守势状态');
        const extraSkills = ['liuyang-zhang', 'zhemei-shou'];
        const canExtra = ['逍遥派', '灵鹫宫'].includes(p.family);
        let extra = 0, previousFlag = -1;
        for (const hit of hits) {
            const flag = hit.action_flag ?? 0;
            assert.ok(Number.isInteger(flag) && flag >= 0 && flag < order.length);
            assert.ok(flag === previousFlag || flag === previousFlag + 1, '按准备次序出招');
            previousFlag = flag;
            assert.equal(hit.attack_usage, order[flag]);
            assert.equal(hit.attack_skill, p.actor.mappings[order[flag]]);
            assert.equal(hit.type, 0); assert.ok([0, -1, -2].includes(hit.result));
        }
        for (let flag = 0; flag <= previousFlag; flag++) {
            const group = hits.filter(a => (a.action_flag ?? 0) === flag);
            const skill = p.actor.mappings[order[flag]], added = group.length - 1;
            const partner = skill === 'liuyang-zhang' ? 'zhemei-shou' : 'liuyang-zhang';
            const limit = canExtra && extraSkills.includes(skill)
                ? ((p.actor.skills[partner] ?? 0) > 101 ? 2 : 1) : 0;
            assert.ok(added >= 0 && added <= limit, '追加攻击必须来自六阳/折梅原被动');
            if (added) {
                // do_attack probe is post-order: nested hits precede their successful parent.
                assert.equal(group.at(-1).result, 0);
                assert.ok(raw.passives.some(e => e.route === 'martial' && e.actor === 0 && e.target === 1 && e.skill === skill));
            }
            extra += added;
        }
        assert.equal(raw.metrics[0].neili_cost ?? 0, extra * 30, '原被动每次追加攻击扣30内力');
        assert.equal(raw.immediate[0].neili, raw.before[0].neili - extra * 30);
        assert.equal(raw.immediate[0].temp.is_attacking ?? 0, 0);
        assert.equal(raw.immediate[0].temp.action_flag ?? 0, 0);
    }
    assert.deepEqual(raw.after, raw.immediate, '即时窗口不能混入后续状态');
    if (condition.method === 'interface') assert.deepEqual(raw.immediate, raw.before);
    if (condition.method !== 'round') assert.deepEqual(raw.immediate[1], raw.before[1]);
}
