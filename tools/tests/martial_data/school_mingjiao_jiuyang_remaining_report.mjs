// Offline report only; never mutates original evidence or gameplay.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { validateMingjiaoJiuyangRemainingCondition, validateMingjiaoJiuyangRemainingRecord,
    mingjiaoJiuyangRemainingEffects } from './school_mingjiao_jiuyang_remaining_cases.mjs';

const group = 'mingjiao-jiuyang-remaining';
const integer = v => { assert.ok(Number.isSafeInteger(v) && v >= 0, 'missing nonnegative observation'); return v; };
const signed = v => { assert.ok(Number.isSafeInteger(v), 'missing signed observation'); return v; };
const text = v => {
    assert.equal(typeof v, 'string');
    return v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
};
const table = (headers, rows) => ['| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |', ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');

export function mingjiaoJiuyangRemainingReport(rows, condition) {
    const p = validateMingjiaoJiuyangRemainingCondition(condition);
    assert.equal(p.collection_group, group); assert.ok(Array.isArray(rows)); assert.ok(rows.length <= condition.samples);
    const seen = new Set(), exceptional = [];
    for (const row of rows) {
        assert.ok(row?.raw && typeof row.raw === 'object' && !Array.isArray(row.raw));
        integer(row.index); assert.ok(row.index < condition.samples && !seen.has(row.index)); seen.add(row.index);
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.condition_sha256, digest(condition)); assert.equal(row.index, row.raw.index);
        assert.equal(row.raw.method, condition.method);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.outcome, row.raw.outcome); assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        assert.equal(row.raw_sha256, digest(row.raw));
        validateMingjiaoJiuyangRemainingRecord(row.raw, condition);
        if (['error', 'not_applicable'].includes(row.outcome)) {
            assert.ok(row.reason.trim()); exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        }
    }
    const counts = Object.fromEntries(['observed', 'refused', 'error', 'not_applicable']
        .map(outcome => [outcome, rows.filter(row => row.outcome === outcome).length]));
    return { collection_group: group, condition_id: condition.id,
        context: { skill: p.skill, usage: p.usage, ability: p.ability, variant: p.variant, level: p.level,
            method: condition.method, action: p.action, source_count: p.qualification_sources.length,
            reviewed_source_hash: p.reviewed_source_hash, qualification_note: p.qualification_note,
            actor: structuredClone(p.actor), target: structuredClone(p.target),
            ...(p.extra_target ? { extra_target: structuredClone(p.extra_target), extra_target_fighting: p.extra_target_fighting } : {}) },
        coverage: { planned: condition.samples, recorded: rows.length, ...counts, known: counts.observed + counts.refused,
            unknown: exceptional.length, missing: condition.samples - rows.length },
        exceptional, effects: rows.length ? mingjiaoJiuyangRemainingEffects(rows, condition) : null };
}

export function mingjiaoJiuyangRemainingMarkdown(summary) {
    assert.equal(summary?.collection_group, group);
    const { context, coverage: c } = summary;
    assert.ok(['jiu', 'ri'].includes(context.ability)); assert.equal(context.method, 'perform');
    for (const k of ['planned', 'recorded', 'observed', 'refused', 'error', 'not_applicable', 'known', 'unknown', 'missing']) integer(c[k]);
    assert.equal(c.known, c.observed + c.refused); assert.equal(c.unknown, c.error + c.not_applicable);
    assert.equal(c.recorded, c.known + c.unknown); assert.equal(c.planned, c.recorded + c.missing);
    const lines = ['### 九阳剩余绝招：' + text(summary.condition_id), '',
        table(['原命令', '条件', '等级', '计划/记录', '观察/拒绝', '未知/缺样本'], [[
            text(context.action), text(context.variant), integer(context.level), `${c.planned}/${c.recorded}`,
            `${c.observed}/${c.refused}`, `${c.unknown}/${c.missing}`]]), '', text(context.qualification_note), '',
        '转世、领悟、激发、战斗关系与内力池属于实验配置，不证明自然教学或容量养成。受理不是命中；拒绝、错误、缺样本分别记账。',
        '当前气血、有效气血、当前精神与有效精神毛损分列，不把夹制损失或创伤相加为伤害，不计算DPS或强弱排名。'];
    const e = summary.effects;
    if (!e) { assert.equal(c.recorded, 0); lines.push('', '未观测：没有原件，不报告零伤害、零费用或零熟练。'); }
    else {
        assert.equal(e.validated, c.known); assert.equal(e.unknown, c.unknown);
        const value = (key, owner = e, allowSigned = false) => {
            assert.ok(Object.hasOwn(owner, key), 'missing effect ' + key);
            if (c.unknown) { assert.equal(owner[key], null, 'unknown is not zero'); return '未知'; }
            return (allowSigned ? signed : integer)(owner[key]);
        };
        const distribution = (d, n) => {
            assert.ok(d && typeof d === 'object'); integer(d.n); integer(d.unknown);
            if (n !== undefined && !c.unknown) assert.equal(d.n, n);
            for (const k of ['mean', 'median', 'p10', 'p90', 'p95', 'min', 'max'])
                assert.ok(d.n ? Number.isFinite(d[k]) && d[k] >= 0 : d[k] === null, 'missing distribution');
            return `${d.n}/${d.unknown}；${d.mean === null ? '未观测／不适用' : d.mean.toFixed(2)}`;
        };
        const frequencies = f => {
            assert.ok(f && typeof f === 'object' && !Array.isArray(f));
            return Object.entries(f).map(([k, n]) => [text(k), integer(n)]);
        };
        if (!c.unknown) { assert.equal(integer(e.accepted_commands), c.observed); assert.equal(integer(e.refused_commands), c.refused); }
        lines.push('', table(['命令受理', '命令拒绝', '自身内力毛支出', '弱熟练增加'], [[
            ...['accepted_commands', 'refused_commands', 'actor_neili_cost', 'weak_gain'].map(k => value(k))]]), '',
            table(['目标气血毛损', '目标有效气血毛损', '目标精神毛损', '目标有效精神毛损'], [[
                ...['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost'].map(k => value(k))]]));
        if (context.ability === 'jiu') {
            if (!c.unknown) {
                assert.equal(integer(e.attacks), 9 * e.accepted_commands);
                assert.equal(integer(e.hit) + integer(e.dodge) + integer(e.parry), e.attacks);
                assert.equal(integer(e.jiu_bonus_on) + integer(e.jiu_bonus_off), e.accepted_commands);
                assert.ok(integer(e.passive_triggered) <= integer(e.passive_calls) && e.passive_calls <= e.attacks);
                assert.equal(integer(e.passive_neili_cost), 50 * e.passive_triggered);
                assert.equal(e.actor_neili_cost, 300 * e.accepted_commands + e.passive_neili_cost);
            }
            lines.push('', table(['原普通攻击', '命中', '闪避', '招架', '整次强化有/无'], [[
                ...['attacks', 'hit', 'dodge', 'parry'].map(k => value(k)), `${value('jiu_bonus_on')}/${value('jiu_bonus_off')}`]]), '',
                table(['附伤调用', '实际附伤触发', '原附伤创伤', '附伤内力费用', '公共扣血分布 n/未知；均值', '公共创伤分布 n/未知；均值'], [[
                    ...['passive_calls', 'passive_triggered', 'passive_wound', 'passive_neili_cost'].map(k => value(k)),
                    distribution(e.public_damage, e.attacks), distribution(e.public_wound, e.attacks)]]), '',
                '九曦混阳整次费用300内力；实际合格附伤另扣50。强化按命令一次统计；普通命中与附伤按真实逐调用统计，九击互相关联，不当作九个独立施展样本。公共分布包含真实闪避／招架的零值，不是给缺数据补零。');
        } else {
            if (!c.unknown) {
                assert.equal(integer(e.ri_hits) + integer(e.ri_misses), integer(e.ri_enemy_trials));
                assert.equal(e.actor_neili_cost, 1000 * e.accepted_commands);
                assert.equal(integer(e.target_neili_cost) - integer(e.target_neili_recovery), signed(e.target_neili_net));
                assert.ok(integer(e.ri_damage_ambiguous) <= e.ri_hits);
            }
            lines.push('', table(['实际敌人判定', '命中', '未中', '目标内力毛扣', '目标内力清零恢复', '目标内力净扣（可负）'], [[
                ...['ri_enemy_trials', 'ri_hits', 'ri_misses', 'target_neili_cost', 'target_neili_recovery'].map(k => value(k)), value('target_neili_net', e, true)]]), '',
                table(['唯一可还原原输入 n/未知；均值', '输入有多个合法候选的命中'], [[
                    distribution(e.ri_damage, c.unknown ? undefined : e.ri_hits - e.ri_damage_ambiguous), value('ri_damage_ambiguous')]]));
            assert.ok(e.ri_targets && typeof e.ri_targets === 'object' && !Array.isArray(e.ri_targets));
            const roles = Object.entries(e.ri_targets);
            assert.deepEqual(Object.keys(e.ri_targets).sort(), c.observed ? context.extra_target ? ['1', '2'] : ['1'] : []);
            if (!c.unknown) {
                for (const k of ['trials', 'hits', 'misses']) assert.equal(roles.reduce((n, [, r]) => n + integer(r[k]), 0), e[{ trials: 'ri_enemy_trials', hits: 'ri_hits', misses: 'ri_misses' }[k]]);
                for (const k of ['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost']) assert.equal(roles.reduce((n, [, r]) => n + integer(r[k]), 0), e[k]);
                for (const [k, global] of [['neili_cost', 'target_neili_cost'], ['neili_recovery', 'target_neili_recovery'], ['neili_net', 'target_neili_net']])
                    assert.equal(roles.reduce((n, [, r]) => n + signed(r[k]), 0), e[global]);
            }
            const roleRows = roles.map(([side, r]) => {
                assert.ok(['1', '2'].includes(side)); assert.equal(typeof r.enemy, 'boolean'); integer(r.recorded);
                assert.equal(r.enemy, side === '1' || context.extra_target_fighting === true);
                assert.equal(r.recorded, c.observed);
                if (!c.unknown) {
                    assert.equal(integer(r.hits) + integer(r.misses), integer(r.trials));
                    assert.equal(integer(r.neili_cost) - integer(r.neili_recovery), signed(r.neili_net));
                    if (!r.enemy) { assert.equal(r.trials, 0); assert.equal(r.hits, 0); assert.equal(r.misses, 0); }
                }
                const supports = frequencies(r.nominal_supports);
                for (const [key] of Object.entries(r.nominal_supports)) {
                    const a = JSON.parse(key); assert.ok(Array.isArray(a) && a.length > 0);
                    a.forEach(integer); assert.deepEqual(a, [...new Set(a)].sort((a, b) => a - b));
                }
                if (!c.unknown) {
                    assert.equal(supports.reduce((n, [, count]) => n + count, 0), r.hits);
                    assert.equal(Object.entries(r.nominal_supports).filter(([key]) => JSON.parse(key).length > 1)
                        .reduce((n, [, count]) => n + count, 0), r.ambiguous_hits);
                }
                return [side, r.enemy ? '敌人' : '旁观者（无判定）', r.recorded,
                    `${value('trials', r)}/${value('hits', r)}/${value('misses', r)}`,
                    distribution(r.nominal_damage, c.unknown ? undefined : r.hits - r.ambiguous_hits), value('ambiguous_hits', r),
                    supports.length ? supports.map(([k, n]) => `${k}: ${n}`).join('<br>') : '无已验证命中支持',
                    ...['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost', 'craze_gain', 'neili_cost', 'neili_recovery'].map(k => value(k, r)), value('neili_net', r, true)];
            });
            lines.push('', table(['角色', '关系', '已核原件', '判定/中/未中', '唯一原输入 n/未知；均值', '歧义命中', '原输入合法支持：频数',
                '气血毛损', '有效气血毛损', '精神毛损', '有效精神毛损', '怒气增加', '内力毛扣', '清零恢复', '内力净扣'], roleRows), '',
                '魔光日无极费用1000内力；命中直接调用四类原资源扣减，不是公共do_damage或护甲折算。每个敌人不论命中与否都执行原负内力清零，净扣为毛扣减恢复，可为负数；旁观者不计判定或未中。',
                '原伤害输入仅由联合源码支持推导：昏迷或资源夹制可留下多个候选，不选第一个冒充真实随机值。唯一输入分布排除歧义命中，候选支持频数单列；实际四类资源账仍完整保留。');
        }
        const busy = frequencies(e.actor_busy); assert.equal(busy.reduce((n, [, k]) => n + k, 0), c.known);
        for (const key of Object.keys(e.actor_busy)) assert.ok(/^(0|[1-9]\d*)$/.test(key) && Number.isSafeInteger(Number(key)));
        lines.push('', busy.length ? table(['结束忙乱原值', '已验证原件'], busy) : '结束忙乱：未观测。', '',
            '未知合计保留null，分布／分类仅包含已验证原件，不代表完整计划；弱熟练不是原等级升级。');
    }
    lines.push('', `冻结来源 ${integer(context.source_count)} 份；摘要 ${text(context.reviewed_source_hash)}。`);
    if (summary.exceptional.length) lines.push('', table(['未知编号', '结果', '原理由'], summary.exceptional.map(r => [integer(r.index), text(r.outcome), text(r.reason)])));
    return lines.join('\n');
}
