// NPC grant perform entries: can_perform/<skill>/<move> granted by specific teachers.
// Covers the 17 untested grant skills identified in 4.3 ownership overlap analysis.
// Each condition tests a single perform entry with proper qualification and observation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { busy, cost, counter, range, temp, tempDelta, validateEffectPair } from './observed_effects.mjs';
import { observedEffectSources } from './observed_effect_sources.mjs';

const defaults = {
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 8000, max_neili: 8000, jiali: 0,
    jingli: 1000, max_jingli: 1000,
    combat_exp: 100000000, str: 36, int: 36, con: 36, dex: 36,
    gender: '男性', character: '光明磊落',
};

const grants = [
    { skill: "fireice-strike", move: "binghuo", usage: "strike", teacher: "gumu/yang", family: "古墓派", sources: ["kungfu/skill/fireice-strike/binghuo.c"], requiredSkills: { "yunv-xinjing": 200 }, noGrantCheck: true },
    { skill: 'feifeng-bian', move: 'xi', usage: 'whip', teacher: 'duan/daobf', armed: true,
        family: '段氏皇族', sources: ['kungfu/skill/feifeng-bian/xi.c'] },
    { skill: 'qiantian-zhi', move: 'zhi', usage: 'finger', teacher: 'duan/duanzc',
        family: '段氏皇族', sources: ['kungfu/skill/qiantian-zhi/zhi.c'] },
    { skill: 'yuezhao-gong', move: 'shi', usage: 'claw', teacher: 'duan/hua',
        family: '段氏皇族', sources: ['kungfu/skill/yuezhao-gong/shi.c'] },
    { skill: 'qingliang-daxuefa', move: 'ding', usage: 'dagger', teacher: 'duan/zhu',
        family: '段氏皇族', sources: ['kungfu/skill/qingliang-daxuefa/ding.c'], armed: true },
    { skill: 'fengmo-zhang', move: 'luan', usage: 'staff', teacher: 'gaibang/peng',
        family: '丐帮', sources: ['kungfu/skill/fengmo-zhang/luan.c'], armed: true },
    { skill: 'fumo-zhang', move: 'lun', usage: 'staff', teacher: 'gaibang/xi',
        family: '丐帮', sources: ['kungfu/skill/fumo-zhang/lun.c'], armed: true },
    { skill: 'xunlei-jian', move: 'xun', usage: 'sword', teacher: 'kunlun/hetaichong',
        family: '昆仑派', sources: ['kungfu/skill/xunlei-jian/xun.c'], armed: true },
    { skill: 'kunlun-jian', move: 'fanyin', usage: 'sword', teacher: 'kunlun/hetaichong',
        family: '昆仑派', sources: ['kungfu/skill/kunlun-jian/fanyin.c'], armed: true, requiredSkills: { 'tanqin-jifa': 200 } },
    { skill: 'wuliang-jian', move: 'qian', usage: 'sword', teacher: 'lingjiu/zuo',
        family: '灵鹫宫', sources: ['kungfu/skill/wuliang-jian/qian.c'], armed: true },
    { skill: 'yunhe-jian', move: 'chong', usage: 'sword', teacher: 'lingxiao/baiwanjian',
        family: '凌霄城', sources: ['kungfu/skill/yunhe-jian/chong.c'], armed: true },
    { skill: 'longcheng-shendao', move: 'fengyu', usage: 'blade', teacher: 'murong/longcheng',
        family: '慕容世家', sources: ['kungfu/skill/longcheng-shendao/fengyu.c'], armed: true },
    { skill: 'longcheng-shendao', move: 'feng', usage: 'blade', teacher: 'murong/murongfu',
        family: '慕容世家', sources: ['kungfu/skill/longcheng-shendao/feng.c'], armed: true },
    { skill: 'douzhuan-xingyi', move: 'yi', usage: 'parry', teacher: 'murong/murongbo',
        family: '慕容世家', sources: ['kungfu/skill/douzhuan-xingyi/yi.c'], requiredSkills: { 'zihui-xinfa': 200 } },
    { skill: 'qixing-quan', move: 'zhai', usage: 'cuff', teacher: 'murong/murongfu',
        family: '慕容世家', sources: ['kungfu/skill/qixing-quan/zhai.c'] },
    { skill: 'guyue-chan', move: 'jing', usage: 'staff', teacher: 'tiezhang/qiuqianzhang',
        family: '铁掌帮', sources: ['kungfu/skill/guyue-chan/jing.c'], armed: true },
    { skill: 'feixing-shu', move: 'hua', usage: 'throwing', teacher: 'xingxiu/zhaixing',
        family: '星宿派', sources: ['kungfu/skill/feixing-shu/hua.c'], armed: true, requiredProperties: { ammunition: 20 } },
    { skill: 'xueshan-dao', move: 'kai', usage: 'blade', teacher: 'xuedao/shengdi',
        family: '血刀门', sources: ['kungfu/skill/xueshan-dao/kai.c'], armed: true },
    { skill: 'kuimang-dao', move: 'pan', usage: 'blade', teacher: 'zhenyuan/wangjianjie',
        family: '八卦门', sources: ['kungfu/skill/kuimang-dao/pan.c'], armed: true },
    // S7 additional control entries (19 total, 3 already above)
    { skill: 'canhe-zhi', move: 'you', usage: 'finger', teacher: 'murong/murongbo',
        family: '慕容世家', sources: ['kungfu/skill/canhe-zhi/you.c'] },
    { skill: 'dabei-zhang', move: 'bei', usage: 'strike', teacher: 'shaolin/cheng-guan',
        family: '少林派', sources: ['kungfu/skill/dabei-zhang/bei.c'] },
    { skill: 'houquan', move: 'zhen', usage: 'unarmed', teacher: 'gaibang/hong',
        family: '丐帮', sources: ['kungfu/skill/houquan/zhen.c'], noGrantCheck: true },
    { skill: 'jingzhong-bafa', move: 'bafa', usage: 'blade', teacher: 'none/libai',
        family: '侠客盟', sources: ['kungfu/skill/jingzhong-bafa/bafa.c'], armed: true, noGrantCheck: true },
    { skill: 'kuangfeng-blade', move: 'kuang', usage: 'blade', teacher: 'riyue/dongfang/dongfang',
        family: '日月神教', sources: ['kungfu/skill/kuangfeng-blade/kuang.c'], armed: true, noGrantCheck: true },
    { skill: 'luohan-gun', move: 'shibaluohan', usage: 'club', teacher: 'shaolin/cheng-guan',
        family: '少林派', sources: ['kungfu/skill/luohan-gun/shibaluohan.c'], armed: true, noGrantCheck: true },
    { skill: 'qianzhu-wandushou', move: 'wan', usage: 'hand', teacher: 'wudu/panxiuda',
        family: '五毒教', sources: ['kungfu/skill/qianzhu-wandushou/wan.c'], requiredSkills: { poison: 200 } },
    { skill: 'shou-yin', move: 'jie', usage: 'hand', teacher: 'shaolin/cheng-guan',
        family: '少林派', sources: ['kungfu/skill/shou-yin/jie.c'], noGrantCheck: true },
    { skill: 'xuanfeng-leg', move: 'kuangfeng', usage: 'unarmed', teacher: 'hu/hufei',
        family: '关外胡家', sources: ['kungfu/skill/xuanfeng-leg/kuangfeng.c'], noGrantCheck: true, requiredSkills: { 'luoying-shenzhang': 200 } },
    { skill: 'zijinbagua-dao', move: 'bagua', usage: 'blade', teacher: 'zhenyuan/wangjianjie',
        family: '八卦门', sources: ['kungfu/skill/zijinbagua-dao/bagua.c'], armed: true, noGrantCheck: true },
];

export const npcGrantSourcePaths = grants.flatMap(g => [...g.sources, `kungfu/class/${g.teacher}.c`]);

export function npcGrantPerformConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof readSource, 'function');
    const result = [];
    const source_evidence = Object.fromEntries(npcGrantSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, createHash('sha256').update(bytes).digest('hex')];
    }));
    for (const g of grants) {
        const source = catalog.skills.find(s => s.id === g.skill);
        assert.ok(source, 'missing skill source: ' + g.skill);
        const entryPath = `kungfu/skill/${g.skill}/${g.move}.c`;
        // Performs without can_perform check don't have a refuse branch
        const expectedValues = g.noGrantCheck ? ['observed'] : ['observed', 'refused'];
        for (const expected of expectedValues) {
            const grantKey = `can_perform/${g.skill}/${g.move}`;
            const actorSkills = { force: 600, dodge: 400, parry: 400, [g.usage]: 400, [g.skill]: 400, ...(g.requiredSkills || {}) };
            // 只映射真实激发技能；force/dodge/parry 自映射会触发 runner 的
            // "effective skill mapping" 校验失败（同 slice-combination 历史问题）
            const actorMappings = { [g.usage]: g.skill };
            const actorPrep = { [g.usage]: g.skill };
            const actor = {
                skills: actorSkills,
                mappings: actorMappings,
                preparations: actorPrep,
                properties: { ...defaults, ...(g.requiredProperties || {}), [grantKey]: expected === 'observed' ? 1 : 0 },
                ...(g.armed ? { equipment: { type: g.usage === 'blade' ? 'blade' : g.usage, hold: g.usage === 'throwing', ...(g.usage === 'throwing' ? { amount: 20 } : {}) } } : {}),
            };
            const target = {
                skills: { force: 200, dodge: 200, parry: 200, ...(g.move === 'shibaluohan' ? { 'luohan-gun': 200, club: 200 } : {}) },
                mappings: g.move === 'shibaluohan' ? { club: 'luohan-gun' } : {},
                preparations: g.move === 'shibaluohan' ? { club: 'luohan-gun' } : {},
                properties: { ...defaults, neili: 3000, max_neili: 3000 },
                equipment: g.move === 'shibaluohan' ? { type: 'club', hold: false } : { type: 'sword', hold: false },
            };
            const abilitySource = catalog.skills.find(s => s.id === `${g.skill}/${g.move}`);
            const performEntry = abilitySource?.entries?.find(e => e.role === 'perform');
            assert.ok(abilitySource?.path, 'missing ability source path: ' + g.skill + '/' + g.move);
            assert.equal(abilitySource.sha256, source_evidence[abilitySource.path],
                'ability source hash mismatch: ' + abilitySource.path);
            for (const path of g.sources) {
                assert.ok(source_evidence[path], 'missing source hash: ' + path);
            }
            result.push({
                id: `school-npc-grant-${g.skill}-${g.move}-${expected === 'observed' ? 'grant' : 'refuse'}`,
                stage: 'school', entry_id: performEntry?.id ?? `kungfu/skill/${g.skill}/${g.move}.c`,
                method: 'perform', samples: smoke || expected === 'refused' || g.move === 'shibaluohan' ? 2 : 100,
                parameters: {
                    school: g.teacher.split('/')[0], family: g.family,
                    families: [g.family],
                    collection_group: 'b30-perform',
                    skill: g.skill, ability: g.move, usage: g.usage, level: 400,
                    kind: 'direct', variant: expected,
                    combination: g.skill + '+' + g.move,
                    actor, target,
                    named_participants: true,
                    fighting: g.move !== 'shibaluohan',
                    ...(g.move === 'shibaluohan' ? {
                        extra_target: { skills: { force: 200, dodge: 200, parry: 200 }, mappings: {}, preparations: {}, properties: { ...defaults, neili: 3000, max_neili: 3000 } },
                        extra_target_fighting: true,
                        target_fighting_extra: true,
                    } : {}),
                    target_state: 'living',
                    action: `perform ${g.usage}.${g.move} right`,
                    expected, not_applicable: '',
                    observation: 'single_action_immediate', observe_seconds: 0,
                    source_evidence: { ...source_evidence },
                    effect_dependencies: (observedEffectSources[`perform:${g.skill}/${g.move}`]?.dependencies ?? [])
                        .map(dep => {
                            assert.equal(catalog.skills.find(s => s.path === dep.path)?.sha256, dep.sha256,
                                'passive source changed; review effect contract');
                            return { ...dep };
                        }),
                    ability_source: {
                        path: abilitySource.path,
                        sha256: abilitySource.sha256,
                        entry_id: performEntry?.id ?? `${abilitySource.path}:perform`,
                    },
                    qualification_sources: [...g.sources, `kungfu/class/${g.teacher}.c`],
                    qualification_note: `NPC 授权绝招 ${g.skill}/${g.move}（${g.family}）。`
                        + (expected === 'observed'
                            ? '授予 can_perform 后观察原绝招发动、费用、忙乱与效果。'
                            : '未授予 can_perform 时验证原入口拒绝。')
                        + `来源教师 ${g.teacher}，保留原命令映射与忙乱限制。`,
                },
            });
        }
    }
    return result;
}

// Each pair is [hit cost, miss cost, hit busy range, miss busy range].
// Hit means the original direct damage call, not inferred HP loss.
const directContracts = {
    'qiantian-zhi/zhi': [80, 50, [2, 2], [3, 3]],
    'yuezhao-gong/shi': [150, 100, [2, 2], [3, 3]],
    'qingliang-daxuefa/ding': [200, 50, [1, 1], [3, 3]],
    'fumo-zhang/lun': [150, 80, [3, 3], [4, 4]],
    'xunlei-jian/xun': [180, 60, [2, 2], [3, 3]],
    'kunlun-jian/fanyin': [200, 50, [2, 3], [3, 3]],
    'wuliang-jian/qian': [150, 50, [2, 2], [3, 3]],
    'yunhe-jian/chong': [80, 60, [2, 2], [3, 3]],
    'qixing-quan/zhai': [100, 30, [2, 3], [2, 4]],
    'guyue-chan/jing': [80, 200, [3, 3], [4, 4]],
    'xueshan-dao/kai': [100, 50, [2, 2], [3, 3]],
    'kuimang-dao/pan': [30, 10, [2, 2], [3, 3]],
    'houquan/zhen': [80, 80, [3, 3], [3, 3]],
    'kuangfeng-blade/kuang': [60, 60, [2, 2], [2, 2]],
};
const comboContracts = {
    'feifeng-bian/xi': [100, 6, 1, 6],
    'fengmo-zhang/luan': [100, 5, 1, 5],
    'longcheng-shendao/fengyu': [120, 5, 1, 5],
    'canhe-zhi/you': [300, 6, 1, 5],
    'dabei-zhang/bei': [300, 4, 4, 6],
    'jingzhong-bafa/bafa': [150, 8, 1, 6],
    'qianzhu-wandushou/wan': [300, 5, 1, 5],
    'shou-yin/jie': [300, 9, 1, 5],
    'xuanfeng-leg/kuangfeng': [100, 6, 1, 6],
};

function comboAttacks(raw, min, max = min) {
    range(raw.attacks.length, 1, max, 'combo attack count');
    if (raw.after.every(s => s.living && !s.ghost && s.qi > 0))
        range(raw.attacks.length, min, max, 'complete living-target combo');
    for (const attack of raw.attacks) {
        assert.equal(attack.actor, 0); assert.equal(attack.target, 1);
    }
}

export function validateNpcGrantPerformRecord(raw, condition, sourceContext) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'b30-perform');
    validateEffectPair(raw, condition, 'perform', sourceContext);
    assert.equal(raw.outcome, p.expected);
    assert.equal(raw.launches.length, p.expected === 'observed' ? 1 : 0);
    if (p.expected === 'refused') {
        assert.ok(raw.reason?.length > 0, 'refusal reason');
        for (const side of [0, 1]) for (const resource of ['neili', 'qi', 'eff_qi', 'jing', 'eff_jing'])
            cost(raw, side, resource, 0);
        assert.equal(raw.attacks.length, 0);
        for (const side of [0, 1]) assert.equal(busy(raw.after[side]), busy(raw.before[side]));
    } else {
        assert.equal(raw.launches[0].skill, p.skill, 'launch skill');
        // Argument may include target (e.g. "binghuo right"); compare ability name only
        const argAbility = String(raw.launches[0].argument ?? '').split(/\s+/)[0];
        assert.equal(argAbility, p.ability, 'launch ability name');
        const key = `${p.skill}/${p.ability}`, direct = counter(raw, 0, 'direct');
        const b = raw.before[0], t = raw.before[1], a = raw.after[0], end = raw.after[1];
        range(direct, 0, 1, 'direct damage calls');
        if (directContracts[key]) {
            const [hitCost, missCost, hitBusy, missBusy] = directContracts[key];
            cost(raw, 0, 'neili', direct ? hitCost : missCost);
            range(busy(a), ...(direct ? hitBusy : missBusy), 'perform busy');
            assert.equal(raw.attacks.length, 0);
            if (!direct) for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing']) cost(raw, 1, resource, 0);
        } else if (comboContracts[key]) {
            const [fee, count, minBusy, maxBusy] = comboContracts[key];
            if (key === 'canhe-zhi/you') {
                // you.c costs 300; each original query_action may cost another 300,
                // and each successful original hit_ob costs 80. Do not confuse the
                // base fee with the total cost of the six real combat attacks.
                assert.ok(Array.isArray(raw.passives), 'missing canhe passive observations');
                assert.ok(!t.skills['liumai-shenjian'], 'use dedicated reflected-finger matrix');
                let hits = 0;
                for (const event of raw.passives) {
                    assert.equal(event.skill, 'canhe-zhi'); assert.equal(event.actor, 0);
                    assert.equal(event.target, 1); assert.equal(event.route, 'martial');
                    if (typeof event.result === 'string') {
                        assert.ok(event.result.includes('嗤嗤嗤'), 'unexpected canhe passive branch');
                        assert.ok(event.incoming >= 220); hits++;
                    } else assert.equal(event.result, 0);
                }
                range(raw.passives.length, 0, raw.attacks.length, 'canhe passive call count');
                const extraActions = (counter(raw, 0, 'neili_cost') - fee - hits * 80) / 300;
                range(extraActions, 0, raw.attacks.length, 'canhe extra query_action count');
                cost(raw, 0, 'neili', fee + extraActions * 300 + hits * 80);
            } else cost(raw, 0, 'neili', fee);
            range(busy(a), minBusy, maxBusy, 'combo busy');
            comboAttacks(raw, count);
            assert.equal(direct, key === 'dabei-zhang/bei' ? direct : 0);
            if (key === 'shou-yin/jie') cost(raw, 0, 'qi', 100);
            for (const path of ['apply/attack', 'apply/unarmed_damage']) tempDelta(raw, 0, path, 0);
            if (key === 'qianzhu-wandushou/wan')
                for (const path of ['apply/parry', 'apply/dodge']) tempDelta(raw, 1, path, 0);
        } else if (key === 'longcheng-shendao/feng') {
            const planned = counter(raw, 0, 'neili_cost') / 25;
            range(planned, 3, Math.min(7, 2 + Math.trunc(b.effective_skills.blade / 40)), 'wind attack budget');
            cost(raw, 0, 'neili', planned * 25); comboAttacks(raw, planned);
            range(busy(a), 1, planned, 'wind busy'); assert.equal(direct, 0);
        } else if (key === 'zijinbagua-dao/bagua') {
            cost(raw, 0, 'neili', 300); comboAttacks(raw, 5, 7);
            range(busy(a), 1, 6, 'bagua busy'); tempDelta(raw, 0, 'apply/attack', 0);
            assert.equal(direct, 0);
        } else if (key === 'fireice-strike/binghuo') {
            // This group is the immediate first palm only; G6 owns the natural callback window.
            assert.notEqual(t.mappings.force, 'jiuyang-shengong', 'use the dedicated jiuyang matrix');
            cost(raw, 0, 'neili', direct ? 300 : 100);
            assert.equal(busy(a), direct ? 1 : 3);
            if (direct) assert.equal(busy(end), 1);
            assert.equal(raw.attacks.length, 0);
        } else if (key === 'douzhuan-xingyi/yi') {
            cost(raw, 0, 'neili', 50); assert.equal(busy(a), 2);
            if (b.skills['douzhuan-xingyi'] + Math.trunc(b.skills['zihui-xinfa'] / 2)
                > Math.trunc(t.effective_skills.force * 13 / 10)) {
                for (const resource of ['qi', 'eff_qi']) cost(raw, 1, resource, Math.trunc(t.max_qi / 2));
                assert.equal(raw.attacks.length, 0);
            } else assert.ok(raw.attacks.length === 0 || raw.attacks.every(e => e.actor === 1), 'redirected attack actor');
        } else if (key === 'feixing-shu/hua') {
            const fee = counter(raw, 0, 'neili_cost');
            assert.ok([100, 200].includes(fee), 'throwing hit/miss cost');
            assert.equal(busy(a), 2); assert.equal(raw.attacks.length, 0);
            assert.equal(b.ammunition - a.ammunition, 10, 'ten projectiles consumed');
            if (fee === 100) cost(raw, 1, 'eff_qi', 0);
            else range(counter(raw, 1, 'eff_qi_cost'), Math.trunc(b.skills['feixing-shu'] / 3),
                2 * Math.trunc(b.skills['feixing-shu'] / 3) - 1, 'throwing wound');
        } else if (key === 'luohan-gun/shibaluohan') {
            const amount = Math.min(20, Math.trunc((Math.trunc((b.skills['luohan-gun'] + t.skills['luohan-gun']) / 10)
                + b.effective_str + t.effective_str) / 5));
            for (const side of [0, 1]) {
                cost(raw, side, 'neili', 300);
                assert.equal(raw.before[side].jingli - raw.after[side].jingli, 100);
                assert.equal(temp(raw.after[side], 'gunzhen')?.amount, amount);
                for (const path of ['apply/dex', 'apply/str']) tempDelta(raw, side, path, amount);
                assert.equal(busy(raw.after[side]), 1);
            }
            assert.equal(raw.attacks.length, 0);
        } else assert.fail('unreviewed NPC effect: ' + key);
    }
}
