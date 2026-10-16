// Pure consumers of original research observations; no command execution or file writes.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { validateMingjiaoJiuyangResearchCondition } from './school_mingjiao_jiuyang_research_cases.mjs';
import { validateMingjiaoJiuyangResearchRecord } from './school_mingjiao_jiuyang_research_observation.mjs';

const group = 'mingjiao-jiuyang-research';
const map = value => { assert.ok(value && typeof value === 'object' && !Array.isArray(value)); return value; };
const own = (value, key) => { assert.ok(Object.hasOwn(map(value), key), 'missing ' + key); return value[key]; };
const integer = value => { assert.ok(Number.isSafeInteger(value) && value >= 0); return value; };
const text = value => {
    assert.equal(typeof value, 'string');
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
};
const table = (head, rows) => ['| ' + head.join(' | ') + ' |',
    '| ' + head.map(() => '---').join(' | ') + ' |', ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');

function context(manifest, condition) {
    assert.equal(own(manifest, 'format'), 1); assert.equal(own(manifest, 'kind'), 'martial_data_series');
    const identity = own(manifest, 'identity'), fingerprint = own(manifest, 'fingerprint');
    assert.equal(fingerprint, digest(identity));
    const entries = own(manifest, 'entries'); assert.ok(Array.isArray(entries));
    assert.equal(own(identity, 'entries_sha256'), digest(entries));
    const execution = own(identity, 'execution');
    assert.equal(own(execution, 'collection'), 'school-combat');
    assert.equal(typeof own(execution, 'smoke'), 'boolean', 'smoke is not inferred from sample count');
    assert.equal(condition.parameters.run_mode, execution.smoke ? 'smoke' : 'formal', 'research run mode must match original manifest execution');
    const conditions = own(identity, 'conditions'); assert.ok(Array.isArray(conditions));
    const matches = conditions.filter(c => c.id === condition.id); assert.equal(matches.length, 1);
    assert.deepEqual(matches[0], condition);
    const sources = entries.filter(e => e.id === condition.entry_id); assert.equal(sources.length, 1);
    assert.equal(own(sources[0], 'path'), condition.entry_id);
    assert.equal(own(sources[0], 'sha256'), condition.parameters.source_evidence[condition.entry_id]);
    return { fingerprint, smoke: execution.smoke };
}

const scalarKeys = ['commands', 'commands_accepted', 'commands_refused', 'command_cost', 'completed',
    'normal_jing_fee', 'jing_writeoff', 'jing_cost', 'potential_field_cost', 'learned_points_used',
    'learned_net', 'source_derived_gross', 'skill_upgrades'];
function aggregate(records) {
    if (!records.length) return null;
    const totals = Object.fromEntries(scalarKeys.map(key => [key, 0]));
    const hidden = { unobserved: 0, not_called: 0 }, same = { met: 0, not_met: 0, not_applicable: 0 };
    const progress = {};
    for (const { observation: value } of records) {
        for (const key of scalarKeys) totals[key] = integer(totals[key] + integer(own(value, key)));
        assert.ok(Object.hasOwn(hidden, value.hidden_random_input)); hidden[value.hidden_random_input]++;
        assert.ok(Object.hasOwn(same, value.same_second_status)); same[value.same_second_status]++;
        progress[value.learned_net] = (progress[value.learned_net] ?? 0) + 1;
    }
    assert.equal(totals.commands, totals.commands_accepted + totals.commands_refused);
    assert.equal(totals.jing_cost, totals.normal_jing_fee + totals.jing_writeoff);
    assert.equal(totals.completed, totals.learned_points_used);
    return { ...totals, records: records.length, hidden_random_input: hidden,
        same_second_status: same, same_second: same.met ? { trials: same.met, refused: same.met }
            : { trials: null, refused: null }, learned_net_frequencies: progress };
}

function timestamp(state) {
    const temp = own(state, 'temp');
    return Object.hasOwn(temp, 'time') && temp.time && Object.hasOwn(temp.time, 'research')
        ? { present: true, value: temp.time.research } : { present: false };
}

export function mingjiaoJiuyangResearchReport(rows, condition, manifest) {
    const p = validateMingjiaoJiuyangResearchCondition(condition); assert.equal(p.collection_group, group);
    const series = context(manifest, condition); assert.ok(Array.isArray(rows));
    assert.ok(rows.length <= condition.samples);
    const seen = new Set(), records = [], exceptional = [];
    for (const row of rows) {
        assert.equal(own(row, 'format'), 1); assert.equal(own(row, 'fingerprint'), series.fingerprint);
        assert.equal(own(row, 'condition_id'), condition.id);
        assert.equal(own(row, 'condition_sha256'), digest(condition));
        const index = integer(own(row, 'index')); assert.ok(index < condition.samples && !seen.has(index)); seen.add(index);
        const raw = map(own(row, 'raw')); assert.equal(own(row, 'raw_sha256'), digest(raw));
        assert.equal(index, own(raw, 'index')); assert.equal(own(row, 'outcome'), own(raw, 'outcome'));
        assert.equal(own(row, 'reason'), own(raw, 'reason'));
        const observation = validateMingjiaoJiuyangResearchRecord(raw, condition);
        if (!observation) exceptional.push({ index, outcome: raw.outcome, reason: raw.reason, raw_sha256: row.raw_sha256 });
        else records.push({ index, outcome: raw.outcome, reason: raw.reason, raw_sha256: row.raw_sha256,
            observation, command_steps: raw.research_steps.map(step => ({ action: step.action,
                command_cost: step.accepted, wall_time_before: step.wall_time_before, wall_time_after: step.wall_time_after,
                timestamp_before: timestamp(step.before[0]), timestamp_after: timestamp(step.after[0]) })) });
    }
    records.sort((a, b) => a.index - b.index); exceptional.sort((a, b) => a.index - b.index);
    const matched = records.filter(r => r.observation.condition_matched);
    const missing = Array.from({ length: condition.samples }, (_, i) => i).filter(i => !seen.has(i));
    const known = aggregate(records), matchedKnown = aggregate(matched);
    const complete = !missing.length && !exceptional.length && matched.length === records.length;
    return { collection_group: group, condition_id: condition.id, series, condition: structuredClone(condition),
        coverage: { planned: condition.samples, recorded: rows.length, validated: records.length,
            observed: records.filter(r => r.outcome === 'observed').length,
            refused: records.filter(r => r.outcome === 'refused').length,
            error: exceptional.filter(r => r.outcome === 'error').length,
            not_applicable: exceptional.filter(r => r.outcome === 'not_applicable').length,
            unknown: exceptional.length, matched: matched.length, unmatched: records.length - matched.length,
            missing: missing.length, missing_indices: missing, complete },
        records, exceptional, effects: { known, matched_known: matchedKnown,
            complete_plan: complete ? structuredClone(known) : null } };
}

export function mingjiaoJiuyangResearchEffects(rows, condition, manifest) {
    const r = mingjiaoJiuyangResearchReport(rows, condition, manifest);
    return { collection_group: group, condition_id: r.condition_id, series: r.series, coverage: r.coverage, ...r.effects };
}

// Original rows are mandatory: regenerate with the same oracle, not a second summary validator.
export function mingjiaoJiuyangResearchMarkdown(summary, manifest, rows) {
    const condition = own(summary, 'condition');
    assert.deepEqual(summary, mingjiaoJiuyangResearchReport(rows, condition, manifest), 'summary differs from original ledger rows');
    const p = condition.parameters, c = summary.coverage, e = summary.effects, mode = summary.series.smoke ? '烟雾' : '正式';
    const lines = ['### 九阳研究（' + mode + '）：' + text(condition.id), '',
        table(['条件', '计划/记录', '有进展/无进展', '诊断', '匹配/未匹配', '缺样本'], [[
            text(p.variant), `${c.planned}/${c.recorded}`, `${c.observed}/${c.refused}`, c.unknown,
            `${c.matched}/${c.unmatched}`, c.missing]]), '',
        summary.series.smoke ? '仅为烟雾记录，不并入正式研究统计。' : '仅为该有限正式条件，不代表完整修养或自然养成。',
        '原执行成本、命令受理次数与实际完成遍数分列；potential 字段不扣，使用量来自 learned_points 增量。',
        '跨秒记录保留真实费用与命令事实，但不计同秒匹配；未匹配、诊断或缺样本都不能完成本条件。'];
    if (!e.known) lines.push('', '研究次数、费用与熟练进展：未知（无已验证正常记录）。');
    else {
        const k = e.known;
        lines.push('', table(['已知命令', '受理/拒绝', '原执行成本', '实际完成', '正常精神费', 'SET 清零', '精神毛扣'], [[
            k.commands, `${k.commands_accepted}/${k.commands_refused}`, k.command_cost, k.completed,
            k.normal_jing_fee, k.jing_writeoff, k.jing_cost]]), '',
        table(['potential 字段扣除', '已用潜能增量', '净熟练', '源码推导毛熟练', '升级', '隐藏随机输入'], [[
            k.potential_field_cost, k.learned_points_used, k.learned_net, k.source_derived_gross, k.skill_upgrades,
            `未观察 ${k.hidden_random_input.unobserved}；未调用 ${k.hidden_random_input.not_called}`]]), '',
        table(['槽位', '原结果', '条件匹配', '命令/受理', '完成遍数', '正常费/清零', '净熟练', '同秒状态'], summary.records.map(r => {
            const v = r.observation;
            return [r.index, text(r.outcome), v.condition_matched ? '是' : '否', `${v.commands}/${v.commands_accepted}`,
                v.completed, `${v.normal_jing_fee}/${v.jing_writeoff}`, v.learned_net, text(v.same_second_status)];
        })), '', table(['槽位/步骤', '原命令', '原成本', '原时钟括', '原研究时间：前→后'],
            summary.records.flatMap(r => r.command_steps.map((step, i) => [
                `${r.index}/${i}`, text(step.action), step.command_cost,
                `${step.wall_time_before}…${step.wall_time_after}`,
                `${step.timestamp_before.present ? step.timestamp_before.value : '未写入'}→${step.timestamp_after.present ? step.timestamp_after.value : '未写入'}`]))));
    }
    lines.push('', `完整计划汇总：${e.complete_plan ? '已匹配，费用与进展均有已验证记录' : '未知（缺样本、诊断或条件未匹配）'}。`);
    if (c.missing) lines.push('缺少原件编号：' + c.missing_indices.join('、') + '。');
    if (summary.exceptional.length) lines.push('', table(['诊断槽位', '原结果', '原理由'],
        summary.exceptional.map(r => [r.index, text(r.outcome), text(r.reason)])));
    lines.push('', '毛熟练仅在此无升级窗口等于净熟练；随机输入未观察，源码支持范围不是强选随机或实测抽签。',
        '本纯消费者不证明原始日志、驱动、源副本或真实采样已验收；learned 快照的空映射不证明底层原始 null。',
        `冻结来源 ${p.qualification_sources.length} 份；摘要 ${text(p.reviewed_source_hash)}。`,
        `系列指纹 ${text(summary.series.fingerprint)}；模式 ${mode}。`);
    return lines.join('\n');
}
