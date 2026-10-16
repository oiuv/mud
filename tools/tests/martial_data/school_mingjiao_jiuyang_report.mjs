// Read-only summaries of original Jiuyang records. No game or raw-data mutation.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { validateMingjiaoJiuyangCondition, validateMingjiaoJiuyangRecord,
    mingjiaoJiuyangEffects } from './school_mingjiao_jiuyang_cases.mjs';

const group = 'mingjiao-jiuyang';
const integer = v => { assert.ok(Number.isSafeInteger(v) && v >= 0, '缺少非负整数计量'); return v; };
const text = v => {
    assert.equal(typeof v, 'string');
    return v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
};
const table = (names, rows) => ['| ' + names.join(' | ') + ' |',
    '| ' + names.map(() => '---').join(' | ') + ' |', ...rows.map(r => '| ' + r.join(' | ') + ' |')].join('\n');

export function mingjiaoJiuyangReport(rows, condition) {
    const p = validateMingjiaoJiuyangCondition(condition);
    assert.equal(p.collection_group, group); assert.ok(Array.isArray(rows)); assert.ok(rows.length <= condition.samples);
    const seen = new Set(), exceptional = [];
    for (const row of rows) {
        assert.ok(row && row.raw && typeof row.raw === 'object' && !Array.isArray(row.raw));
        integer(row.index); assert.ok(row.index < condition.samples && !seen.has(row.index)); seen.add(row.index);
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.index, row.raw.index); assert.equal(row.raw.method, condition.method);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.outcome, row.raw.outcome); assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        assert.equal(row.raw_sha256, digest(row.raw));
        validateMingjiaoJiuyangRecord(row.raw, condition);
        if (['error', 'not_applicable'].includes(row.outcome)) {
            assert.ok(row.reason.trim()); exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        }
    }
    const counts = Object.fromEntries(['observed', 'refused', 'error', 'not_applicable']
        .map(outcome => [outcome, rows.filter(r => r.outcome === outcome).length]));
    return { collection_group: group, condition_id: condition.id,
        context: { skill: p.skill, ability: p.ability, variant: p.variant, level: p.level, method: condition.method,
            observe_seconds: p.observe_seconds, source_count: p.qualification_sources.length,
            reviewed_source_hash: p.reviewed_source_hash, qualification_note: p.qualification_note,
            actor: structuredClone(p.actor), target: structuredClone(p.target),
            interface: p.interface ? structuredClone(p.interface) : null },
        coverage: { planned: condition.samples, recorded: rows.length, ...counts,
            known: counts.observed + counts.refused, unknown: exceptional.length, missing: condition.samples - rows.length },
        exceptional, effects: rows.length ? mingjiaoJiuyangEffects(rows, condition) : null };
}

export function mingjiaoJiuyangMarkdown(summary) {
    assert.equal(summary?.collection_group, group);
    const { coverage: c, context } = summary;
    for (const k of ['planned', 'recorded', 'observed', 'refused', 'error', 'not_applicable', 'known', 'unknown', 'missing']) integer(c[k]);
    assert.equal(c.known, c.observed + c.refused); assert.equal(c.unknown, c.error + c.not_applicable);
    assert.equal(c.recorded, c.known + c.unknown); assert.equal(c.planned, c.recorded + c.missing);
    const lines = ['### 九阳被动／防御：' + text(summary.condition_id), '',
        table(['入口', '条件', '等级', '计划/记录', '观察/拒绝', '未知/缺样本'], [[
            text(context.ability), text(context.variant), integer(context.level), `${c.planned}/${c.recorded}`,
            `${c.observed}/${c.refused}`, `${c.unknown}/${c.missing}`]]), '', text(context.qualification_note), '',
        '原接口返回0也属于有效观察，不表示取消伤害或附伤已经触发。转世及已有武学是实验输入；未检验正常玩家取得这些资格的完整过程。', '',
        '普通攻击公共扣血／创伤与九阳被动原创伤分列。伤口还可能夹制当前气血，毛损失不与创伤或公共伤害相加；加力为0，不作DPS或胜率排名。'];
    if (!summary.effects) {
        assert.equal(c.recorded, 0); lines.push('', '未观测：无原件，不报告零取消、零附伤或零费用。');
    } else {
        const e = summary.effects; assert.equal(e.validated, c.known); assert.equal(e.unknown, c.unknown);
        const value = key => { assert.ok(Object.hasOwn(e, key)); if (c.unknown) { assert.equal(e[key], null); return '未知'; } return integer(e[key]); };
        if (!c.unknown) { assert.ok(integer(e.canceled) <= integer(e.defense_calls)); assert.ok(integer(e.triggered) <= integer(e.passive_calls)); }
        lines.push('', table(['原防御调用', '取消', '原被动调用', '附伤触发', '防御内力支出', '被动内力支出'], [[
            ...['defense_calls', 'canceled', 'passive_calls', 'triggered', 'defense_neili_cost', 'passive_neili_cost'].map(value)]]), '',
            table(['九阳原创伤', '公共扣血', '公共创伤', '双方气血毛支出', '双方有效气血毛支出'], [[
                ...['passive_wound', 'public_damage', 'public_wound', 'qi_cost', 'eff_qi_cost'].map(value)]]));
        const classifications = context.method === 'ordinary'
            ? [['ordinary_results', '普通结果码']] : [['interface_values', '接口返回分类']];
        for (const [key, label] of classifications) {
            const frequencies = e[key]; assert.ok(frequencies && typeof frequencies === 'object' && !Array.isArray(frequencies));
            const entries = Object.entries(frequencies);
            assert.equal(entries.reduce((n, [, count]) => n + integer(count), 0), c.known);
            lines.push('', table([label, '已验证记录'], entries.map(([k, count]) => [text(k), integer(count)])));
        }
        lines.push('', '调用次数是本条件实际观察量，不能把多次被动调用当独立样本；接口消息随机与是否产生附伤不同。未知原件不计正常效果、不补成失手或零费用。');
    }
    lines.push('', `冻结来源 ${integer(context.source_count)} 份；摘要 ${text(context.reviewed_source_hash)}。`);
    if (summary.exceptional.length) lines.push('', table(['未知编号', '结果', '理由'],
        summary.exceptional.map(r => [integer(r.index), text(r.outcome), text(r.reason)])));
    return lines.join('\n');
}
