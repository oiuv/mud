// Offline original-exert evidence; no driver, game or record mutation.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { probability } from './statistics.mjs';
import { validateMingjiaoJiuyangExertCondition, validateMingjiaoJiuyangExertRecord,
    mingjiaoJiuyangExertEffects } from './school_mingjiao_jiuyang_exert_cases.mjs';

const group = 'mingjiao-jiuyang-exert';
const integer = v => { assert.ok(Number.isSafeInteger(v) && v >= 0, 'missing nonnegative observation'); return v; };
const text = v => {
    assert.equal(typeof v, 'string');
    return v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
};
const table = (headers, rows) => ['| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |', ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');

export function mingjiaoJiuyangExertReport(rows, condition) {
    const p = validateMingjiaoJiuyangExertCondition(condition);
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
        validateMingjiaoJiuyangExertRecord(row.raw, condition);
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
            parameters: structuredClone(p) },
        coverage: { planned: condition.samples, recorded: rows.length, ...counts, known: counts.observed + counts.refused,
            unknown: exceptional.length, missing: condition.samples - rows.length },
        exceptional, effects: rows.length ? mingjiaoJiuyangExertEffects(rows, condition) : null };
}

export function mingjiaoJiuyangExertMarkdown(summary) {
    assert.equal(summary?.collection_group, group);
    const { context, coverage: c } = summary, p = context.parameters;
    assert.ok(['powerup', 'shield', 'roar'].includes(context.ability)); assert.equal(context.method, 'exert');
    assert.ok(['immediate', 'lifecycle'].includes(p.phase)); assert.ok(Array.isArray(p.actions) && p.actions.length);
    for (const k of ['planned', 'recorded', 'observed', 'refused', 'error', 'not_applicable', 'known', 'unknown', 'missing']) integer(c[k]);
    assert.equal(c.known, c.observed + c.refused); assert.equal(c.unknown, c.error + c.not_applicable);
    assert.equal(c.recorded, c.known + c.unknown); assert.equal(c.planned, c.recorded + c.missing);
    const lines = ['### 九阳原运功：' + text(summary.condition_id), '',
        table(['原命令序列', '条件', '等级', '计划/记录', '观察/拒绝', '未知/缺样本'], [[
            p.actions.map(text).join('<br>'), text(context.variant), integer(context.level), `${c.planned}/${c.recorded}`,
            `${c.observed}/${c.refused}`, `${c.unknown}/${c.missing}`]]), '', text(context.qualification_note), '',
        p.phase === 'lifecycle'
            ? `自然到期观察：计划原时钟等待 ${integer(p.observe_seconds)} 秒；是否实际到期须由原回调与结束状态证据判断，计划等待不等于已完成。`
            : '即时观察：只证明原命令同步作用及当时状态，不证明强化已按原时钟自然到期。',
        '技能、转世、映射、内力池及起始apply偏移是实验配置，不证明自然教学或养成。命令受理次数与正执行成本分列，不按成本值计算命令数。',
        '群体声波的原输入、有效精神创伤、当前精神夹制与各实际资源毛损分别列出，不相加作伤害，不计算DPS或强弱排名。'];
    if (!summary.effects) {
        assert.equal(c.recorded, 0); lines.push('', '未观测：没有原件，不报告零费用、零关系或自然到期完成。');
    } else {
        assert.equal(summary.effects.validated, c.known); assert.equal(summary.effects.unknown, c.unknown);
        renderExertEffects(lines, summary);
    }
    lines.push('', `冻结来源 ${integer(context.source_count)} 份；摘要 ${text(context.reviewed_source_hash)}。`);
    if (summary.exceptional.length) lines.push('', table(['未知编号', '结果', '原理由'], summary.exceptional.map(r => [integer(r.index), text(r.outcome), text(r.reason)])));
    return lines.join('\n');
}

function renderExertEffects(lines, summary) {
    const { context, coverage: c, effects: e } = summary, p = context.parameters, roar = context.ability === 'roar';
    const value = (key, object = e) => {
        assert.ok(Object.hasOwn(object, key), 'missing effect ' + key);
        if (c.unknown) { assert.equal(object[key], null, 'unknown is not zero'); return '未知'; }
        return integer(object[key]);
    };
    const distribution = (d, expected) => {
        assert.ok(d && typeof d === 'object'); integer(d.n); integer(d.unknown);
        if (expected !== undefined) assert.equal(d.n, expected);
        for (const k of ['mean', 'median', 'p10', 'p90', 'p95', 'min', 'max'])
            assert.ok(d.n ? Number.isFinite(d[k]) && d[k] >= 0 : d[k] === null, 'missing distribution');
        return `${d.n}；${d.mean === null ? '未观测／不适用' : d.mean.toFixed(2)}`;
    };
    const frequency = f => {
        assert.ok(f && typeof f === 'object' && !Array.isArray(f));
        return Object.entries(f).map(([k, n]) => [text(k), integer(n)]);
    };
    if (!c.unknown) {
        assert.equal(integer(e.commands_attempted), p.actions.length * c.known);
        assert.equal(integer(e.commands_accepted) + integer(e.commands_refused), e.commands_attempted);
        assert.equal(integer(e.launches), e.commands_accepted); assert.ok(integer(e.command_cost) >= e.commands_accepted);
        assert.ok(integer(e.weak_gain) <= e.commands_accepted);
        const failedPaid = roar && p.variant === 'no-fight' ? c.refused : 0;
        assert.equal(integer(e.actor_neili_cost), 100 * (e.commands_accepted + failedPaid));
        assert.equal(integer(e.actor_qi_cost), roar ? 10 * (e.commands_accepted + failedPaid) : 0);
        assert.equal(integer(e.callback_pairs), p.phase === 'lifecycle' ? c.observed : 0);
    }
    lines.push('', table(['命令尝试', '命令受理', '命令拒绝', '正执行成本总和', '原技能发动', '自身内力毛损', '自身气血毛损', '弱熟练增加'], [[
        ...['commands_attempted', 'commands_accepted', 'commands_refused', 'command_cost', 'launches', 'actor_neili_cost', 'actor_qi_cost', 'weak_gain'].map(k => value(k))]]));
    const keys = ['attack', 'parry', 'dodge', 'armor'];
    for (const k of ['buff_added', 'buff_returned']) assert.deepEqual(Object.keys(e[k]), keys);
    if (!c.unknown) for (const k of keys) {
        integer(e.buff_added[k]); integer(e.buff_returned[k]);
        if (roar) assert.equal(e.buff_added[k], 0);
        assert.equal(e.buff_returned[k], p.phase === 'lifecycle' ? e.buff_added[k] : 0);
    }
    const callbackCount = p.phase === 'lifecycle' ? c.observed : 0;
    const elapsed = distribution(e.elapsed_wait, callbackCount), callbackElapsed = distribution(e.callback_elapsed, callbackCount);
    if (callbackCount) {
        assert.ok(e.elapsed_wait.min >= p.observe_seconds - 1);
        const s = Math.trunc(p.actor.skills.force / 2) + p.actor.skills[context.skill];
        const delay = context.ability === 'powerup' ? Math.trunc(s / 2) : s;
        assert.ok(e.callback_elapsed.min >= delay - 1);
    }
    if (!roar) {
        lines.push('', table(['apply字段', '即时新增正幅度', '自然撤销正幅度'], keys.map(k => [k, value(k, e.buff_added), value(k, e.buff_returned)])), '',
            table(['原回调成对次数', '已验证实际等待 n；秒均值', '已验证原回调结束 n；秒均值'], [[
                value('callback_pairs'), elapsed, callbackElapsed]]), '',
            '强化只统计原apply增加与撤销，起始attack7/parry11/dodge13、armor107不被误算为本次效果。即时条件没有自然撤销证据；等待条件由原USER绑定eval_function前后及结束状态闭账，不直调解除、不缩短原时钟。',
            '低有效内功即时样本观察原弱熟练随机0或1；低档两次到期只证明生命周期，不拿两次抽样估计熟练概率。多步组合／重复运功按逐条原命令记账，不把整条记录受理次数当成全部步骤都成功。');
        assert.deepEqual(e.roar_targets, {});
        for (const k of ['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost']) { value(k); if (!c.unknown) assert.equal(e[k], 0); }
    } else {
        assert.ok(e.roar_targets && typeof e.roar_targets === 'object' && !Array.isArray(e.roar_targets));
        assert.deepEqual(Object.keys(e.roar_targets).sort(), c.observed ? p.extra_target ? ['1', '2'] : ['1'] : []);
        const roles = Object.entries(e.roar_targets);
        if (!c.unknown) for (const k of ['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost'])
            assert.equal(roles.reduce((n, [, r]) => n + integer(r[k]), 0), integer(e[k]));
        const costs = roles.map(([side, r]) => {
            assert.equal(integer(r.recorded), c.observed);
            const chance = r.gate_probability;
            assert.ok(chance && typeof chance === 'object'); integer(chance.successes); integer(chance.trials);
            assert.equal(chance.trials, r.recorded); assert.deepEqual(chance, probability(chance.successes, chance.trials));
            if (!c.unknown) {
                assert.equal(integer(r.gate_trials), r.recorded); assert.equal(integer(r.gate_passed), chance.successes);
                assert.ok(integer(r.damaging) <= r.gate_passed);
                for (const key of ['actor_want', 'actor_fighting']) assert.equal(integer(r[key]), r.gate_passed);
                for (const key of ['actor_killing', 'target_want']) assert.equal(integer(r[key]), 0);
                assert.equal(integer(r.target_killing), integer(r.target_fighting));
                assert.equal(r.target_fighting, side === '1' && p.target_state === 'unconscious' ? 0 : r.gate_passed);
            }
            const source = frequency(r.source_damage);
            assert.equal(source.reduce((n, [, count]) => n + count, 0), r.recorded);
            for (const key of Object.keys(r.source_damage)) assert.ok(Number.isSafeInteger(Number(key)) && String(Number(key)) === key);
            return [side, r.recorded, `${value('gate_passed', r)}/${value('gate_trials', r)}`, value('damaging', r),
                source.map(([k, n]) => `${k}: ${n}`).join('<br>') || '未观测',
                ...['qi_input', 'jing_wound_input', 'qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost', 'craze_gain'].map(k => value(k, r))];
        });
        lines.push('', table(['目标气血毛损', '目标有效气血毛损', '目标当前精神夹制毛损', '目标有效精神毛损'], [[
            ...['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost'].map(k => value(k))]]), '',
            table(['角色', '已核原件', '过门/判定', '正伤害分支', '源码差值d：频数（含未过门）', '原气血输入', '原精神创伤输入',
                '气血毛损', '有效气血毛损', '当前精神夹制毛损', '有效精神毛损', '怒气增加'], costs), '',
            table(['角色', '自身想杀目标', '自身交战目标', '自身杀意目标', '目标交战自身', '目标杀意自身', '目标想杀自身'],
                roles.map(([side, r]) => [side, ...['actor_want', 'actor_fighting', 'actor_killing', 'target_fighting', 'target_killing', 'target_want'].map(k => value(k, r))])), '',
            '狮吼功先扣100内力和10气血，再检查禁斗房间；该拒绝保留真实费用，公共回退最终提示不冒充第二次成功施展或第二条拒绝探针。原命令被受理仍可能未过门。',
            '每角色判定分母只含实际受理的原群体入口；同门、第三角色、死亡保护、天书房间及已有昏迷不自动豁免本体。d<=0仍可能过门并形成敌意；昏迷目标的反向交战／杀意可与活目标不同。',
            'd=有效内功−目标最大内力/10是源码差值，不是公共压缩伤害。正差值且过门才输入3d气血；目标当前内力<2倍有效内功时才输入2d精神创伤。当前精神毛损来自原创伤夹制而非额外receive_damage精神，和有效精神毛损不相加。',
            '角色频数保留已核样本；同一声波多个目标有关联，不把角色相加成独立施展样本。无伤害不等于未过门或无敌意。');
        value('callback_pairs'); assert.equal(callbackCount, 0);
    }
    const busy = frequency(e.actor_busy); assert.equal(busy.reduce((n, [, k]) => n + k, 0), c.known);
    for (const key of Object.keys(e.actor_busy)) assert.ok(/^(0|[1-9]\d*)$/.test(key) && Number.isSafeInteger(Number(key)));
    lines.push('', busy.length ? table(['同步结束忙乱原值', '已核原件'], busy) : '同步结束忙乱：未观测。', '',
        '未知合计保留null，不补零；等待／回调分布和角色频数只含已核原件，不冒完整计划。');
}
