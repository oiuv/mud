// Capacity reporting. Pure consumers; no collection or file writes.
// The caller supplies an opened series manifest and its ledger rows. Native log/request,
// source-copy and driver verification remains the caller's separate evidence audit.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { validateMingjiaoJiuyangCapacityCondition }
    from './school_mingjiao_jiuyang_capacity_cases.mjs';
import { validateMingjiaoJiuyangCapacityRecord }
    from './school_mingjiao_jiuyang_capacity_observation.mjs';

const group = 'mingjiao-jiuyang-capacity';
const map = value => {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value)); return value;
};
const own = (value, key) => {
    assert.ok(Object.hasOwn(map(value), key), 'missing ' + key); return value[key];
};
const integer = value => {
    assert.ok(Number.isSafeInteger(value) && value >= 0, 'expected nonnegative safe integer'); return value;
};
const text = value => {
    assert.equal(typeof value, 'string');
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
};
const table = (head, rows) => ['| ' + head.join(' | ') + ' |', '| ' + head.map(() => '---').join(' | ') + ' |',
    ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');

function seriesContext(manifest, condition) {
    assert.equal(own(manifest, 'format'), 1); assert.equal(own(manifest, 'kind'), 'martial_data_series');
    const identity = own(manifest, 'identity'), fingerprint = own(manifest, 'fingerprint');
    assert.equal(fingerprint, digest(identity), 'series identity changed');
    const entries = own(manifest, 'entries'); assert.ok(Array.isArray(entries));
    assert.equal(own(identity, 'entries_sha256'), digest(entries));
    const execution = own(identity, 'execution');
    assert.equal(own(execution, 'collection'), 'school-combat');
    assert.equal(typeof own(execution, 'smoke'), 'boolean', 'mode must come from the frozen series');
    const conditions = own(identity, 'conditions'); assert.ok(Array.isArray(conditions));
    const matches = conditions.filter(c => c.id === condition.id);
    assert.equal(matches.length, 1); assert.deepEqual(matches[0], condition, 'condition not in this series');
    const entryMatches = entries.filter(e => e.id === condition.entry_id);
    assert.equal(entryMatches.length, 1, 'series entry must be unique');
    assert.equal(own(entryMatches[0], 'path'), condition.entry_id);
    assert.equal(own(entryMatches[0], 'sha256'), condition.parameters.source_evidence[condition.entry_id]);
    return { fingerprint, smoke: execution.smoke };
}

function knownEffects(steps) {
    if (!steps.length) return null;
    const values = {}, owners = {}; let cost = 0;
    for (const step of steps) {
        cost = integer(cost + step.command_cost); // Do not round an unsafe aggregate.
        values[step.value] = (values[step.value] ?? 0) + 1;
        owners[step.implemented_by] = (owners[step.implemented_by] ?? 0) + 1;
    }
    return { commands: steps.length, commands_accepted: steps.length, command_cost: cost,
        interface_calls: steps.length, interface_values: values, implemented_by: owners,
        actor_unchanged: steps.length, target_unchanged: steps.length };
}

export function mingjiaoJiuyangCapacityReport(rows, condition, manifest) {
    const parameters = validateMingjiaoJiuyangCapacityCondition(condition);
    assert.equal(parameters.collection_group, group);
    const series = seriesContext(manifest, condition);
    assert.ok(Array.isArray(rows)); assert.ok(rows.length <= condition.samples);
    const seen = new Set(), steps = [], exceptional = [];
    for (const row of rows) {
        assert.equal(own(row, 'format'), 1);
        assert.equal(own(row, 'fingerprint'), series.fingerprint, 'mixed series or smoke/formal rows');
        const index = integer(own(row, 'index'));
        assert.ok(index < condition.samples && !seen.has(index), 'duplicate/out-of-range slot'); seen.add(index);
        assert.equal(own(row, 'condition_id'), condition.id);
        assert.equal(own(row, 'condition_sha256'), digest(condition), 'ledger parameters differ');
        const raw = map(own(row, 'raw'));
        assert.equal(own(row, 'raw_sha256'), digest(raw), 'ledger raw hash differs');
        assert.equal(index, own(raw, 'index'));
        assert.equal(own(row, 'outcome'), own(raw, 'outcome'));
        assert.equal(own(row, 'reason'), own(raw, 'reason'));
        const result = validateMingjiaoJiuyangCapacityRecord(raw, condition);
        if (result) {
            const step = raw.interface_steps[0], actual = raw.interfaces[0];
            steps.push({ index, command: step.command, command_cost: result.command_cost,
                object: actual.object, function: actual.function, value: result.interface_value,
                implemented_by: result.implemented_by, actor: raw.before[0].object, target: raw.before[1].object,
                actor_unchanged: true, target_unchanged: true });
        } else exceptional.push({ index, outcome: raw.outcome, reason: raw.reason });
    }
    steps.sort((a, b) => a.index - b.index); exceptional.sort((a, b) => a.index - b.index);
    const missingIndices = Array.from({ length: condition.samples }, (_, i) => i).filter(i => !seen.has(i));
    const known = knownEffects(steps);
    const complete = missingIndices.length === 0 && exceptional.length === 0;
    return { collection_group: group, condition_id: condition.id, series,
        condition: structuredClone(condition),
        coverage: { planned: condition.samples, recorded: rows.length, observed: steps.length,
            error: exceptional.filter(e => e.outcome === 'error').length,
            not_applicable: exceptional.filter(e => e.outcome === 'not_applicable').length,
            unknown: exceptional.length, missing: missingIndices.length, missing_indices: missingIndices, complete },
        steps, exceptional, effects: { known, complete_plan: complete ? structuredClone(known) : null } };
}

export function mingjiaoJiuyangCapacityEffects(rows, condition, manifest) {
    const report = mingjiaoJiuyangCapacityReport(rows, condition, manifest);
    return { collection_group: group, condition_id: report.condition_id, series: report.series,
        coverage: report.coverage, ...report.effects };
}

export function mingjiaoJiuyangCapacityMarkdown(summary, manifest) {
    assert.equal(own(summary, 'collection_group'), group);
    const condition = own(summary, 'condition'), p = validateMingjiaoJiuyangCapacityCondition(condition);
    assert.equal(own(summary, 'condition_id'), condition.id);
    const series = own(summary, 'series'); assert.match(own(series, 'fingerprint'), /^[a-f0-9]{64}$/);
    assert.equal(typeof own(series, 'smoke'), 'boolean');
    assert.deepEqual(series, seriesContext(manifest, condition), 'summary differs from the original series');
    const c = own(summary, 'coverage');
    for (const key of ['planned', 'recorded', 'observed', 'error', 'not_applicable', 'unknown', 'missing']) integer(own(c, key));
    assert.equal(c.planned, condition.samples); assert.equal(c.recorded, c.observed + c.unknown);
    assert.equal(c.unknown, c.error + c.not_applicable); assert.equal(c.planned, c.recorded + c.missing);
    assert.equal(own(c, 'complete'), c.missing === 0 && c.unknown === 0);
    const steps = own(summary, 'steps'), exceptional = own(summary, 'exceptional');
    assert.ok(Array.isArray(steps) && Array.isArray(exceptional));
    assert.equal(steps.length, c.observed); assert.equal(exceptional.length, c.unknown);
    const slots = new Set();
    for (const step of steps) {
        const index = integer(own(step, 'index')); assert.ok(index < c.planned && !slots.has(index)); slots.add(index);
        assert.equal(own(step, 'command'), p.action); assert.ok(integer(own(step, 'command_cost')) > 0);
        assert.equal(own(step, 'object'), p.interface.object); assert.equal(own(step, 'function'), p.ability);
        assert.equal(integer(own(step, 'value')), p.expected_return);
        assert.equal(own(step, 'implemented_by'), p.interface.object === 'player'
            ? '/clone/user/user' : '/kungfu/skill/jiuyang-shengong');
        for (const key of ['actor', 'target']) assert.match(own(step, key), /^\/tests\/actor#\d+$/);
        assert.notEqual(step.actor, step.target);
        assert.equal(own(step, 'actor_unchanged'), true); assert.equal(own(step, 'target_unchanged'), true);
    }
    for (const row of exceptional) {
        const index = integer(own(row, 'index')); assert.ok(index < c.planned && !slots.has(index)); slots.add(index);
        assert.ok(['error', 'not_applicable'].includes(own(row, 'outcome')));
        assert.ok(typeof own(row, 'reason') === 'string' && row.reason.trim());
    }
    assert.equal(exceptional.filter(row => row.outcome === 'error').length, c.error);
    assert.equal(exceptional.filter(row => row.outcome === 'not_applicable').length, c.not_applicable);
    assert.deepEqual(own(c, 'missing_indices'), Array.from({ length: c.planned }, (_, i) => i).filter(i => !slots.has(i)));
    const e = map(own(summary, 'effects')), known = knownEffects(steps);
    assert.deepEqual(own(e, 'known'), known);
    assert.deepEqual(own(e, 'complete_plan'), c.complete ? known : null);
    const mode = series.smoke ? '烟雾' : '正式';
    const lines = ['### 九阳容量查询（' + mode + '）：' + text(condition.id), '',
        table(['原入口', '条件', '原等级配置', '计划/记录', '成功/诊断', '缺样本'], [[
            text(p.ability), text(p.variant), integer(p.level), `${c.planned}/${c.recorded}`,
            `${c.observed}/${c.unknown}`, c.missing]]), '',
        series.smoke ? '本表仅为烟雾验证，不能并入正式容量统计或宣称正式完成。'
            : '本表仅为当前正式条件的有限观察，不代表整个武学或养成路径完成。',
        '命令受理次数与原正整数执行成本分列；一个成功查询始终只计一次受理。原返回值与方法实现归属来自已验证原件，不从源码预期补造实测。',
        `已记录槽位是否齐全：${c.missing === 0 ? '是' : '否'}；本条件计划是否全部为成功观察：${c.complete ? '是' : '否'}。`];
    if (!known) lines.push('', '已验证容量返回、命令成本与双 USER 无变化证据：未知（没有成功原件）。');
    else {
        lines.push('', table(['已知子集命令', '受理次数', '正执行成本总和', '接口调用', '施术 USER 记录未变', '另一 USER 记录未变'], [[
            known.commands, known.commands_accepted, known.command_cost, known.interface_calls,
            known.actor_unchanged, known.target_unchanged]]), '',
        table(['编号', '原返回', '实现归属', '原执行成本', '施术 USER', '另一 USER', '两方记录未变'], steps.map(step => [
            step.index, step.value, text(step.implemented_by), step.command_cost, text(step.actor), text(step.target), '是／是'])));
    }
    lines.push('', e.complete_plan
        ? `本条件完整计划汇总：${mode}成功查询 ${e.complete_plan.interface_calls} 次，受理 ${e.complete_plan.commands_accepted} 次，正执行成本 ${e.complete_plan.command_cost}。`
        : '本条件完整计划汇总：未知；诊断或缺样本不能补零，已知子集不冒充完整计划。');
    if (c.missing) lines.push('', '缺少原件编号：' + c.missing_indices.join('、') + '。');
    if (exceptional.length) lines.push('', table(['诊断编号', '原结果', '原理由'], exceptional.map(row => [
        row.index, text(row.outcome), text(row.reason)])));
    lines.push('', '这里只证明传入记录的容量查询和快照表示未变，不证明自然增长、教学资格或兼修合法，也不代表原始日志、驱动与源副本已独立验收。',
        'learned 使用现有规范化快照，不能据此区分原始 null 与空映射；name/race 未在该快照中观察。', '',
        '冻结方案备注（原文，不作为本次运行状态判定）：' + text(p.qualification_note), '',
        `冻结来源 ${p.qualification_sources.length} 份；摘要 ${text(p.reviewed_source_hash)}。`,
        `系列指纹 ${text(series.fingerprint)}；模式 ${mode}。`);
    return lines.join('\n');
}
