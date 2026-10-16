// Dedicated summaries of frozen, validated QKD records; no driver or data mutation.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { validateMingjiaoQkdCondition, validateMingjiaoQkdRecord,
    mingjiaoQkdEffects } from './school_mingjiao_qkd_cases.mjs';

const group = 'mingjiao-qkd';
const integer = value => {
    assert.ok(Number.isSafeInteger(value) && value >= 0, '缺少已观察的非负整数');
    return value;
};
const text = value => {
    assert.equal(typeof value, 'string', '缺少原报告文本');
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replaceAll('\x1b', '\\x1b')
        .replace(/\r\n|\r|\n/g, '<br>');
};
const table = (headers, rows) => ['| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |',
    ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');

// The shared reader proves source/archive identity. This adapter also rejects
// mismatched ledger envelopes; it never adds fields to raw or trusts raw.parameters.
export function mingjiaoQkdReport(rows, condition) {
    const p = validateMingjiaoQkdCondition(condition);
    assert.equal(p.collection_group, group); assert.ok(Array.isArray(rows));
    assert.ok(rows.length <= condition.samples, '记录超过冻结计划');
    const seen = new Set(), exceptional = [], validated = [];
    for (const row of rows) {
        assert.ok(row && row.raw && typeof row.raw === 'object' && !Array.isArray(row.raw));
        assert.equal(row.condition_id, condition.id, '台账条件不同');
        integer(row.index); assert.ok(row.index < condition.samples, '编号超出计划');
        assert.equal(row.index, row.raw.index, '内外编号不同');
        assert.equal(row.raw.condition_id, condition.id, '原件条件不同');
        assert.equal(row.raw.method, condition.method, '原件入口不同');
        assert.ok(!seen.has(row.index), '重复记录不能进入分母'); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.outcome, row.raw.outcome, '原件结果不同');
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason, '原件理由不同');
        assert.equal(row.raw_sha256, digest(row.raw), '原件摘要不同');
        const result = validateMingjiaoQkdRecord(row.raw, condition);
        if (result) validated.push({ raw: row.raw, result });
        if (['error', 'not_applicable'].includes(row.outcome)) {
            assert.ok(row.reason.trim(), '未知结果须保留实际理由');
            exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        }
    }
    const counts = Object.fromEntries(['observed', 'refused', 'error', 'not_applicable']
        .map(outcome => [outcome, rows.filter(row => row.outcome === outcome).length]));
    return { collection_group: group, condition_id: condition.id,
        context: { skill: p.skill, usage: p.usage, ability: p.ability, level: p.level,
            variant: p.variant, method: condition.method, action: p.action,
            observe_seconds: p.observe_seconds, callback_if_queued: p.callback_if_queued,
            formal_samples: p.formal_samples, source_count: p.qualification_sources.length,
            reviewed_source_hash: p.reviewed_source_hash, qualification_note: p.qualification_note,
            actor: structuredClone(p.actor), target: structuredClone(p.target),
            interface: Object.hasOwn(p, 'interface') ? structuredClone(p.interface) : null },
        coverage: { planned: condition.samples, recorded: rows.length, ...counts,
            known: counts.observed + counts.refused, unknown: exceptional.length,
            missing: condition.samples - rows.length },
        exceptional,
        incoming: rows.length && !exceptional.length ? {
            damage: validated.reduce((n, row) => n + row.raw.defenses.reduce((sum, call) => sum + call.incoming, 0), 0),
            canceled_damage: validated.reduce((n, row) => n + (row.result.canceled
                ? row.raw.defenses.reduce((sum, call) => sum + call.incoming, 0) : 0), 0),
        } : null,
        effects: rows.length ? mingjiaoQkdEffects(rows, condition) : null };
}

export function mingjiaoQkdMarkdown(summary) {
    assert.equal(summary?.collection_group, group);
    const { coverage: c, context } = summary;
    for (const value of Object.values(c)) integer(value);
    assert.equal(c.recorded, c.observed + c.refused + c.error + c.not_applicable);
    assert.equal(c.planned, c.recorded + c.missing); assert.equal(c.known, c.observed + c.refused);
    assert.equal(c.unknown, c.error + c.not_applicable);
    const lines = ['### 明教·乾坤大挪移防御', '',
        `条件：${text(summary.condition_id)}；等级 ${integer(context.level)}，入口 ${text(context.ability)}，方法 ${text(context.method)}。`, '',
        text(context.qualification_note), '',
        table(['冻结计划', '已记录', '正常观察', '预期拒绝', '错误', '不适用', '缺样本'], [[
            c.planned, c.recorded, c.observed, c.refused, c.error, c.not_applicable, c.missing,
        ]]), '',
        '正常观察不等于取消了伤害、已经排入七层回击或回击命中；接口返回0也可能是完整的原观察。错误、不适用及缺样本不补成失手或零效果。', '',
        '普通 do_attack、原 do_damage UNARMED(type 0) 与回击 REMOTE(type 2) 分开。原 type 0 仍调用乾坤招架；REMOTE 才跳过该特殊招架路径，不把直接伤害一概当成绕过乾坤。',
        '只有实际新排入守方 USER 的原 eval_function 才等待；三元队列不是名为 nuoyi 的普通 call_out，不直接调用或重新安排回击。',
        '取消的传入伤害、回击输入伤害与实际气血／有效气血损失分别统计，不相加、不计算DPS，也不把取消伤害视为返还同等伤害。',
        '此有限批不含主动 perform parry.nuoyi、多敌引导、自然NPC交锋或完整养成；实验已有技能、师承与资源不证明自然取得。'];
    const e = summary.effects;
    if (!e) {
        assert.equal(c.recorded, 0);
        lines.push('', '效果：未观测；没有原件，不能报告零次取消、零次回击或零资源损失。');
    } else {
        assert.equal(e.validated, c.known); assert.equal(e.unknown, c.unknown);
        const value = key => {
            assert.ok(Object.hasOwn(e, key), '缺少已核效果字段 ' + key);
            if (c.unknown) { assert.equal(e[key], null, '未知合计不得补零'); return '未知'; }
            return integer(e[key]);
        };
        if (!c.unknown) {
            assert.ok(integer(e.queued) <= integer(e.canceled) && e.canceled <= integer(e.defense_calls));
            assert.equal(integer(e.callback_hit) + integer(e.callback_miss) + integer(e.callback_early_return), e.queued);
            assert.ok(integer(summary.incoming.canceled_damage) <= integer(summary.incoming.damage));
        } else {
            assert.equal(summary.incoming, null);
        }
        lines.push('', table(['防御调用', '取消', '七层排队', '回调命中', '回调失手', '无交战早退'], [[
            ...['defense_calls', 'canceled', 'queued', 'callback_hit', 'callback_miss', 'callback_early_return'].map(value),
        ]]), '', '取消与排队以实际防御调用为分母，可能与样本数不同；回调命中、失手、早退以实际排队为分母。未排队单独记为 not_queued，不计回调失手，不给相关调用套独立抽样置信区间。', '',
        table(['传入伤害合计', '被取消的传入伤害', '回击输入合计', '回击实际扣血', '回击实际创伤', '外层实际扣血', '外层实际创伤', '双方当前气血毛损失', '双方有效气血毛损失'], [[
            summary.incoming ? integer(summary.incoming.damage) : '未知',
            summary.incoming ? integer(summary.incoming.canceled_damage) : '未知',
            ...['callback_input', 'callback_damage', 'callback_wound', 'public_damage', 'public_wound', 'qi_cost', 'eff_qi_cost'].map(value),
        ]]), '', '角色固定为传入攻击者 USER0／乾坤守方 USER1；七层回击方向为 USER1→USER0。外层扣血与回击扣血是公共伤害值，毛资源损失另含伤口造成的当前气血夹制，不能混成同一数值。');
        const frequencyTables = [['results', '原回调结果'], context.method === 'ordinary'
            ? ['ordinary_results', '普通攻击原结果码'] : ['interface_values', '接口原返回汇总键']];
        for (const [key, label] of frequencyTables) {
            const frequencies = e[key]; assert.ok(frequencies && typeof frequencies === 'object' && !Array.isArray(frequencies));
            const entries = Object.entries(frequencies);
            assert.equal(entries.reduce((n, [, count]) => n + integer(count), 0), c.known);
            lines.push('', entries.length ? table([label, '已验证记录数'], entries.map(([name, count]) => [text(name), integer(count)])) : label + '：未观测。');
        }
        lines.push('', '返回汇总键只分类原结果，不还原映射或隐藏随机抽值；完整返回与消息仍以原件为准。含错误／不适用时合计为未知，上表频数只保留已验证原件，不能视为完整计划统计。');
    }
    lines.push('', `冻结来源：${integer(context.source_count)}份；摘要 ${text(context.reviewed_source_hash)}。`);
    if (summary.exceptional.length) lines.push('', table(['未知原件编号', '结果', '实际理由'],
        summary.exceptional.map(row => [integer(row.index), text(row.outcome), text(row.reason)])));
    return lines.join('\n');
}
