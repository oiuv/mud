// Original hun/po/pi records only. No game, driver or evidence mutation.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { probability } from './statistics.mjs';
import { validateMingjiaoJiuyangDirectCondition, validateMingjiaoJiuyangDirectRecord,
    mingjiaoJiuyangDirectEffects } from './school_mingjiao_jiuyang_direct_cases.mjs';

const group = 'mingjiao-jiuyang-direct';
const integer = v => { assert.ok(Number.isSafeInteger(v) && v >= 0, 'missing nonnegative observation'); return v; };
const text = v => {
    assert.equal(typeof v, 'string');
    return v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
};
const table = (headers, rows) => ['| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |', ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');

export function mingjiaoJiuyangDirectReport(rows, condition) {
    const p = validateMingjiaoJiuyangDirectCondition(condition);
    assert.equal(p.collection_group, group); assert.ok(Array.isArray(rows)); assert.ok(rows.length <= condition.samples);
    const seen = new Set(), exceptional = [];
    for (const row of rows) {
        assert.ok(row && row.raw && typeof row.raw === 'object' && !Array.isArray(row.raw));
        integer(row.index); assert.ok(row.index < condition.samples && !seen.has(row.index)); seen.add(row.index);
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.condition_sha256, digest(condition)); assert.equal(row.index, row.raw.index);
        assert.equal(row.raw.method, condition.method);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.outcome, row.raw.outcome); assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        assert.equal(row.raw_sha256, digest(row.raw));
        validateMingjiaoJiuyangDirectRecord(row.raw, condition);
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
            actor: structuredClone(p.actor), target: structuredClone(p.target) },
        coverage: { planned: condition.samples, recorded: rows.length, ...counts, known: counts.observed + counts.refused,
            unknown: exceptional.length, missing: condition.samples - rows.length },
        exceptional, effects: rows.length ? mingjiaoJiuyangDirectEffects(rows, condition) : null };
}

export function mingjiaoJiuyangDirectMarkdown(summary) {
    assert.equal(summary?.collection_group, group);
    const { context, coverage: c } = summary;
    assert.ok(['hun', 'po', 'pi'].includes(context.ability)); assert.equal(context.method, 'perform');
    for (const key of ['planned', 'recorded', 'observed', 'refused', 'error', 'not_applicable', 'known', 'unknown', 'missing']) integer(c[key]);
    assert.equal(c.known, c.observed + c.refused); assert.equal(c.unknown, c.error + c.not_applicable);
    assert.equal(c.recorded, c.known + c.unknown); assert.equal(c.planned, c.recorded + c.missing);
    const lines = ['### 九阳原直伤：' + text(summary.condition_id), '',
        table(['原命令', '条件', '等级', '计划/记录', '观察/拒绝', '未知/缺样本'], [[
            text(context.action), text(context.variant), integer(context.level), `${c.planned}/${c.recorded}`,
            `${c.observed}/${c.refused}`, `${c.unknown}/${c.missing}`]]), '', text(context.qualification_note), '',
        '转世、领悟、激发和存储内力是实验配置，不证明自然学习、原enable准备或自然容量养成。目标DP=AP仅校准原随机分支，不作强弱或公平对照。',
        '受理次数不是命令执行成本，也不是命中数。直伤输入不是公共最终扣血；创伤、当前气血夹制毛损和有效气血毛损分别记录，不相加作伤害。'];
    const e = summary.effects;
    if (!e) { assert.equal(c.recorded, 0); lines.push('', '未观测：没有原件，不报告零费用、零命中或零弱熟练。'); }
    else {
        assert.equal(e.validated, c.known); assert.equal(e.unknown, c.unknown);
        const value = key => {
            assert.ok(Object.hasOwn(e, key), 'missing effect ' + key);
            if (c.unknown) { assert.equal(e[key], null, 'unknown is not zero'); return '未知'; }
            return integer(e[key]);
        };
        const chance = e.gate_probability; assert.ok(chance && typeof chance === 'object');
        integer(chance.successes); integer(chance.trials); assert.equal(chance.trials, c.observed);
        assert.deepEqual(chance, probability(chance.successes, chance.trials));
        if (!c.unknown) {
            assert.equal(integer(e.accepted_commands), c.observed); assert.equal(integer(e.refused_commands), c.refused);
            assert.equal(integer(e.gate_hits), chance.successes);
            assert.equal(integer(e.gate_hits) + integer(e.gate_misses), e.accepted_commands);
            assert.equal(integer(e.direct_calls), e.gate_hits); assert.ok(integer(e.weapon_wear) <= e.direct_calls);
            assert.equal(integer(e.jing_cost), 0); assert.equal(integer(e.eff_jing_cost), 0);
            if (context.ability === 'hun') { assert.equal(integer(e.target_neili_cost), 0); assert.equal(e.weapon_wear, 0); }
        }
        lines.push('', table(['命令受理', '命令拒绝', '原直伤调用', '招式判定命中', '招式判定未中', '武器磨损次数'], [[
            ...['accepted_commands', 'refused_commands', 'direct_calls', 'gate_hits', 'gate_misses', 'weapon_wear'].map(value)]]), '',
            table(['自身内力毛支出', '目标内力毛支出', '目标气血毛支出', '目标有效气血毛支出', '目标精神毛支出', '目标有效精神毛支出', '弱熟练增加'], [[
                ...['actor_neili_cost', 'target_neili_cost', 'qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost', 'weak_gain'].map(value)]]), '',
            `原招式判定命中：已验证受理样本 ${chance.successes}/${chance.trials}。拒绝、未知与缺样本不混入分母；未中同样可能已受理、收费并获得弱熟练。`);
        const distributions = ['input_damage', 'public_damage', 'public_wound'].map(key => {
            const d = e[key]; assert.ok(d && typeof d === 'object'); integer(d.n); integer(d.unknown);
            if (!c.unknown) assert.equal(d.n, e.direct_calls);
            for (const field of ['mean', 'median', 'p10', 'p90', 'p95', 'min', 'max'])
                assert.ok(d.n ? Number.isFinite(d[field]) && d[field] >= 0 : d[field] === null, 'missing distribution ' + key);
            return d;
        });
        lines.push('', table(['实际命中分布', '样本数/未知', '原直伤输入均值', '公共扣血均值', '公共创伤均值'], [[
            '只含实际原直伤调用', distributions.map(d => `${d.n}/${d.unknown}`).join(' / '),
            ...distributions.map(d => d.mean === null ? '未观测／不适用' : d.mean.toFixed(2))]]));
        assert.ok(e.actor_busy && typeof e.actor_busy === 'object' && !Array.isArray(e.actor_busy));
        const busy = Object.entries(e.actor_busy); assert.equal(busy.reduce((n, [, count]) => n + integer(count), 0), c.known);
        lines.push('', busy.length ? table(['结束忙乱原值', '已验证原件'], busy.map(([key, count]) => [text(key), integer(count)])) : '结束忙乱：未观测。');
        lines.push('', context.ability === 'hun'
            ? '混沌一阳未中扣50内力、命中扣250。角色直伤回调只保留原手套／毒路径，本实验没有九阳武学附伤费用。'
            : '破、劈未中扣150内力、命中扣350；原final同步按未压缩输入分别扣目标内力input/4与input/8（各自整数截断），不是延迟回调，也不是按公共扣血折算。',
        '最低档弱熟练按原有效九阳等级随机0或1；400/800档才必增1，不是原等级升级。钢剑／钢刀命中可按原耐久随机磨损，没抽到不表示不会磨损。',
        '未知合计不补零；分布和忙乱分类只保留已验证原件，不冒完整计划。无异步回调、DPS或胜率排名。');
    }
    lines.push('', `冻结来源 ${integer(context.source_count)} 份；摘要 ${text(context.reviewed_source_hash)}。`);
    if (summary.exceptional.length) lines.push('', table(['未知编号', '结果', '原理由'],
        summary.exceptional.map(row => [integer(row.index), text(row.outcome), text(row.reason)])));
    return lines.join('\n');
}
