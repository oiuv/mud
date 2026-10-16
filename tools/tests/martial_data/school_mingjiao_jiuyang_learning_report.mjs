// Summaries of validated original qualification records; no gameplay or raw-data writes.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { validateMingjiaoJiuyangLearningCondition, validateMingjiaoJiuyangLearningRecord,
    mingjiaoJiuyangLearningEffects } from './school_mingjiao_jiuyang_learning_cases.mjs';

const group = 'mingjiao-jiuyang-learning';
const permission = 'can_learn/jiuyang-shengong/enable_weapon';
const integer = value => { assert.ok(Number.isSafeInteger(value) && value >= 0, 'missing nonnegative observation'); return value; };
const text = value => {
    assert.equal(typeof value, 'string');
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
};
const json = value => { const encoded = JSON.stringify(value); assert.equal(typeof encoded, 'string'); return text(encoded); };
const table = (headers, rows) => ['| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |', ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');

export function mingjiaoJiuyangLearningReport(rows, condition) {
    const p = validateMingjiaoJiuyangLearningCondition(condition);
    assert.equal(p.collection_group, group); assert.ok(Array.isArray(rows)); assert.ok(rows.length <= condition.samples);
    const seen = new Set(), exceptional = [], steps = [];
    for (const row of rows) {
        assert.ok(row && row.raw && typeof row.raw === 'object' && !Array.isArray(row.raw));
        integer(row.index); assert.ok(row.index < condition.samples && !seen.has(row.index), 'duplicate/out-of-range slot'); seen.add(row.index);
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw.condition_id, condition.id);
        assert.equal(row.condition_sha256, digest(condition), 'ledger condition differs from frozen parameters');
        assert.equal(row.index, row.raw.index); assert.equal(row.raw.method, condition.method);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.outcome, row.raw.outcome); assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        assert.equal(row.raw_sha256, digest(row.raw));
        const result = validateMingjiaoJiuyangLearningRecord(row.raw, condition);
        if (result) {
            if (condition.method === 'interface') for (const [ordinal, step] of row.raw.interface_steps.entries()) {
                steps.push({ index: row.index, ordinal: ordinal + 1, command: step.command,
                    result: step.result, reason: step.reason, messages: structuredClone(step.messages),
                    implemented_by: step.implemented_by, entry_actor: step.entry_actor, return_actor: step.return_actor,
                    permission_before: step.before.cultivation[permission], permission_after: step.after.cultivation[permission] });
            } else steps.push({ index: row.index, ordinal: 1, command: p.action, result: row.raw.command_accepted,
                reason: row.raw.reason, messages: null, implemented_by: null, entry_actor: null, return_actor: null,
                permission_before: row.raw.before[0].cultivation[permission], permission_after: row.raw.after[0].cultivation[permission] });
        } else {
            assert.ok(row.reason.trim()); exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        }
    }
    const counts = Object.fromEntries(['observed', 'refused', 'error', 'not_applicable']
        .map(outcome => [outcome, rows.filter(row => row.outcome === outcome).length]));
    return { collection_group: group, condition_id: condition.id,
        context: { skill: p.skill, usage: p.usage, ability: p.ability, variant: p.variant, level: p.level,
            method: condition.method, action: p.action, repetitions: p.interface_repetitions ?? p.repetitions,
            source_count: p.qualification_sources.length, reviewed_source_hash: p.reviewed_source_hash,
            qualification_note: p.qualification_note, actor: structuredClone(p.actor), target: structuredClone(p.target) },
        coverage: { planned: condition.samples, recorded: rows.length, ...counts, known: counts.observed + counts.refused,
            unknown: exceptional.length, missing: condition.samples - rows.length },
        steps, exceptional, effects: rows.length ? mingjiaoJiuyangLearningEffects(rows, condition) : null };
}

export function mingjiaoJiuyangLearningMarkdown(summary) {
    assert.equal(summary?.collection_group, group);
    const { coverage: c, context } = summary;
    for (const key of ['planned', 'recorded', 'observed', 'refused', 'error', 'not_applicable', 'known', 'unknown', 'missing']) integer(c[key]);
    assert.equal(c.known, c.observed + c.refused); assert.equal(c.unknown, c.error + c.not_applicable);
    assert.equal(c.recorded, c.known + c.unknown); assert.equal(c.planned, c.recorded + c.missing);
    integer(context.repetitions); assert.ok(context.repetitions > 0);
    const lines = ['### 九阳学习资格／许可：' + text(summary.condition_id), '',
        table(['原入口', '条件', '等级', '计划/记录', '观察/拒绝原件', '未知/缺样本'], [[
            text(context.ability), text(context.variant), integer(context.level), `${c.planned}/${c.recorded}`,
            `${c.observed}/${c.refused}`, `${c.unknown}/${c.missing}`]]), '', text(context.qualification_note), '',
        '命令受理、接口是否返回非零、学习资格允许和兵器许可写入分别记录。双调首次允许、次调拒绝可以同属一个已观察原件，不能把整条观察当两次学习成功。',
        'valid_learn 是原资格查询，difficult_level 是原难度查询；二者都不是授课、熟练增长或自然取得武学。练习原拒绝与接口返回0也不能冒称错误。'];
    const e = summary.effects;
    if (!e) { assert.equal(c.recorded, 0); assert.deepEqual(summary.steps, []); lines.push('', '未观测：没有原件，不报告零费用、零许可变化或完成学习。'); }
    else {
        assert.equal(e.validated, c.known); assert.equal(e.unknown, c.unknown);
        const value = key => {
            assert.ok(Object.hasOwn(e, key), 'missing effect ' + key);
            if (c.unknown) { assert.equal(e[key], null, 'unknown is not zero'); return '未知'; }
            return integer(e[key]);
        };
        if (!c.unknown) {
            assert.equal(integer(e.commands), c.known * context.repetitions);
            assert.equal(integer(e.allowed) + integer(e.refused), integer(e.interface_calls) + integer(e.practice_attempts));
            assert.ok(integer(e.flag_set) <= e.allowed); assert.ok(integer(e.commands_accepted) <= e.commands);
            for (const key of ['practice_completed', 'jing_cost', 'neili_cost', 'learned_points', 'skill_upgrades', 'net_learned']) assert.equal(integer(e[key]), 0);
        }
        const gateLabels = context.ability === 'valid_learn' ? ['资格允许', '资格拒绝']
            : context.method === 'practice' ? ['练习允许', '练习拒绝'] : ['非零难度返回', '零返回'];
        lines.push('', table(['原命令次数', '命令受理', '逐次接口调用', ...gateLabels, '兵器许可首次写入'], [[
            ...['commands', 'commands_accepted', 'interface_calls', 'allowed', 'refused', 'flag_set'].map(value)]]), '',
            table(['练习尝试', '练习完成', '精神支出', '内力支出', '学习点增加', '等级增长', '净熟练变化'], [[
                ...['practice_attempts', 'practice_completed', 'jing_cost', 'neili_cost', 'learned_points', 'skill_upgrades', 'net_learned'].map(value)]]));
        assert.equal(summary.steps.length, c.known * context.repetitions);
        const frequencies = e.interface_values; assert.ok(frequencies && typeof frequencies === 'object' && !Array.isArray(frequencies));
        const entries = Object.entries(frequencies), observedCalls = context.method === 'interface' ? c.known * context.repetitions : 0;
        assert.equal(entries.reduce((n, [, count]) => n + integer(count), 0), observedCalls);
        if (context.method === 'interface') lines.push('', entries.length
            ? table(['接口原返回分类', '已验证调用数'], entries.map(([key, count]) => [text(key), integer(count)])) : '接口返回：未观测。');
        if (summary.steps.length) lines.push('', table(['样本编号', '步', '原命令', '原返回', '兵器许可前/后', '原理由', '原消息'],
            summary.steps.map(step => [integer(step.index), integer(step.ordinal), text(step.command), json(step.result),
                json(step.permission_before) + ' / ' + json(step.permission_after), text(step.reason),
                step.messages === null ? '未观测／不适用' : json(step.messages)])));
        lines.push('', '接口分类分母是已验证调用数，不是原件数；练习拒绝单列。未知原件保留实际理由，合计未知不补零，已知步骤不冒完整计划。许可变化来自原步骤前后状态，不自动修改激发或发放领悟。');
    }
    lines.push('', `冻结来源 ${integer(context.source_count)} 份；摘要 ${text(context.reviewed_source_hash)}。`);
    if (summary.exceptional.length) lines.push('', table(['未知编号', '结果', '实际理由'],
        summary.exceptional.map(row => [integer(row.index), text(row.outcome), text(row.reason)])));
    return lines.join('\n');
}
