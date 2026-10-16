// Pure consumer. The caller supplies the ORIGINAL trusted series manifest.
// No execution, file writes, invented observations, or inference of run mode from samples.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { validateMingjiaoJiuyangFusionCondition } from './school_mingjiao_jiuyang_fusion_cases.mjs';
import { validateMingjiaoJiuyangFusionRecord } from './school_mingjiao_jiuyang_fusion_record.mjs';

const group = 'mingjiao-jiuyang-fusion';
const map = value => { assert.ok(value && typeof value === 'object' && !Array.isArray(value)); return value; };
const own = (value, key) => { assert.ok(Object.hasOwn(map(value), key), 'missing ' + key); return value[key]; };
const integer = value => { assert.ok(Number.isSafeInteger(value) && value >= 0); return value; };
const hash = value => { assert.match(value, /^[a-f0-9]{64}$/); return value; };
const text = value => {
    assert.equal(typeof value, 'string');
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
};
const table = (head, rows) => ['| ' + head.join(' | ') + ' |',
    '| ' + head.map(() => '---').join(' | ') + ' |', ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');

function context(manifest, condition) {
    assert.equal(own(manifest, 'format'), 1); assert.equal(own(manifest, 'kind'), 'martial_data_series');
    const identity = own(manifest, 'identity'), fingerprint = hash(own(manifest, 'fingerprint'));
    assert.equal(fingerprint, digest(identity)); hash(own(identity, 'source_fingerprint'));
    const dictionary = own(identity, 'dictionary_sha256'); if (dictionary !== null) hash(dictionary);
    const entries = own(manifest, 'entries'); assert.ok(Array.isArray(entries));
    assert.equal(own(identity, 'entries_sha256'), digest(entries));
    const execution = own(identity, 'execution'); assert.equal(own(execution, 'collection'), 'school-combat');
    assert.equal(typeof own(execution, 'smoke'), 'boolean', 'mode requires original execution.smoke');
    assert.equal(condition.parameters.run_mode, execution.smoke ? 'smoke' : 'formal', 'fusion mode differs from original manifest');
    const conditions = own(identity, 'conditions'); assert.ok(Array.isArray(conditions));
    assert.equal(new Set(conditions.map(c => own(c, 'id'))).size, conditions.length, 'duplicate manifest condition');
    const matches = conditions.filter(c => c.id === condition.id); assert.equal(matches.length, 1);
    assert.deepEqual(matches[0], condition, 'condition differs from original manifest');
    const source = condition.parameters.source_entry;
    const sources = entries.filter(e => e.id === condition.entry_id); assert.equal(sources.length, 1);
    // These two frozen interface uses retain the ORIGINAL catalog's lexical roles.
    // Do not reinterpret arbitrary interface entries or change the command's role.
    const queryRoles = {
        'kungfu/skill/jiuyang-shengong.c:109:get_ready': [109, 'get_ready', 'other_function'],
        'kungfu/skill/jiuyang-shengong.c:181:query_sub_skills': [181, 'query_sub_skills', 'query_or_gate'],
    };
    const query = queryRoles[source.id];
    if (query) assert.deepEqual([source.path, source.line, source.function, source.role],
        ['kungfu/skill/jiuyang-shengong.c', query[0], query[1], 'interface']);
    for (const key of ['id', 'path', 'sha256']) assert.equal(own(sources[0], key), source[key], 'source entry ' + key);
    assert.equal(own(sources[0], 'role'), query ? query[2] : source.role, 'source entry role');
    // Existing ledger entries encode line/function in id; do not require new ledger fields.
    for (const key of ['line', 'function']) if (Object.hasOwn(sources[0], key)) assert.equal(sources[0][key], source[key]);
    assert.equal(source.sha256, condition.parameters.source_evidence[source.path]);
    if (Object.hasOwn(execution, 'source_files')) {
        for (const [path, sha] of Object.entries(condition.parameters.source_evidence))
            assert.equal(own(execution.source_files, path), sha, 'execution source differs: ' + path);
    }
    return { fingerprint, smoke: execution.smoke };
}

function classification(observation, raw, condition) {
    if (observation.status === 'truncated') return 'truncated';
    if (observation.status === 'message_unknown') return 'message_unknown';
    if (observation.missed_interruption) return observation.interrupted_at === null ? 'missed_halt' : 'late_halt';
    if (!observation.complete || !observation.condition_matched) return 'unmatched';
    if (condition.method === 'interface') return 'interface';
    if (raw.fusion.commands[0].cost === 0) return 'command_refused';
    if (observation.interrupted_at === 2) return 'halted';
    if (observation.success) return 'fusion_success';
    if (observation.source_random_failure) return 'source_random_failure';
    return observation.get_finish_calls ? 'qualification_refused' : 'child_refused';
}

const countKeys = ['commands', 'commands_accepted', 'command_cost', 'natural_callbacks', 'child_actions',
    'get_finish_calls', 'observed_heartbeats'];
function aggregate(records, condition) {
    if (!records.length) return null;
    const totals = Object.fromEntries(countKeys.map(key => [key, 0]));
    const outcomes = Object.fromEntries(['interface', 'command_refused', 'halted', 'fusion_success',
        'source_random_failure', 'qualification_refused', 'child_refused'].map(key => [key, 0]));
    const callbackCost = { qi: 0, eff_qi: 0, jing: 0, eff_jing: 0, neili: 0 };
    const levels = {}; let elapsed = 0, starts = 0, accepted = 0;
    for (const r of records) {
        const v = r.observation;
        assert.equal(v.complete, true); assert.equal(v.condition_matched, true); assert.equal(v.status, 'closed');
        for (const key of countKeys) totals[key] = integer(totals[key] + integer(own(v, key)));
        assert.ok(Object.hasOwn(outcomes, r.classification)); outcomes[r.classification]++;
        for (const key of Object.keys(callbackCost)) callbackCost[key] = integer(callbackCost[key] + integer(own(v.callback_cost, key)));
        assert.ok(Number.isFinite(v.elapsed) && v.elapsed >= 0); elapsed += v.elapsed;
        if (condition.method === 'yanlian') { starts++; accepted += Number(r.initial_command_cost > 0); }
        if (r.classification === 'fusion_success') levels[r.merged_level] = (levels[r.merged_level] ?? 0) + 1;
    }
    const randomTrials = ['complete180', 'complete200'].includes(condition.parameters.variant)
        ? outcomes.fusion_success + outcomes.source_random_failure : 0;
    return { records: records.length, ...totals, commands_refused: totals.commands - totals.commands_accepted,
        fusion_commands: starts, fusion_commands_accepted: accepted, fusion_commands_refused: starts - accepted,
        outcomes, merged_level_frequencies: levels, callback_cost: callbackCost,
        random_trials: randomTrials,
        fusion_success_rate: randomTrials ? outcomes.fusion_success / randomTrials : null,
        source_random_failure_rate: randomTrials ? outcomes.source_random_failure / randomTrials : null,
        elapsed_total: elapsed, elapsed_mean: elapsed / records.length,
        nonempty_association_cleanup_observed: false };
}

export function mingjiaoJiuyangFusionReport(rows, condition, originalManifest) {
    const p = validateMingjiaoJiuyangFusionCondition(condition); assert.equal(p.collection_group, group);
    const series = context(originalManifest, condition); assert.ok(Array.isArray(rows)); assert.ok(rows.length <= condition.samples);
    const seen = new Set(), records = [], exceptional = [];
    for (const row of rows) {
        assert.equal(own(row, 'format'), 1); assert.equal(own(row, 'fingerprint'), series.fingerprint);
        assert.equal(own(row, 'condition_id'), condition.id); assert.equal(own(row, 'condition_sha256'), digest(condition));
        const index = integer(own(row, 'index')); assert.ok(index < condition.samples && !seen.has(index)); seen.add(index);
        const raw = map(own(row, 'raw')); assert.equal(own(row, 'raw_sha256'), digest(raw));
        assert.equal(index, own(raw, 'index')); assert.equal(own(row, 'outcome'), own(raw, 'outcome'));
        assert.equal(own(row, 'reason'), own(raw, 'reason'));
        const observation = validateMingjiaoJiuyangFusionRecord(raw, condition);
        const identity = { index, outcome: raw.outcome, reason: raw.reason, raw_sha256: row.raw_sha256 };
        if (!observation) exceptional.push(identity);
        else records.push({ ...identity, observation, classification: classification(observation, raw, condition),
            initial_command_cost: raw.fusion.commands[0].cost,
            merged_level: observation.success === true ? raw.after[0].skills['jiuyang-shengong'] : null,
            diagnostic_reason: raw.fusion.reason });
    }
    records.sort((a, b) => a.index - b.index); exceptional.sort((a, b) => a.index - b.index);
    const normal = records.filter(r => r.observation.complete && r.observation.condition_matched && r.observation.status === 'closed');
    const diagnostics = records.filter(r => !normal.includes(r));
    const missing = Array.from({ length: condition.samples }, (_, index) => index).filter(index => !seen.has(index));
    const known = aggregate(normal, condition), complete = !missing.length && !exceptional.length && !diagnostics.length;
    return { collection_group: group, condition_id: condition.id, series, condition: structuredClone(condition),
        coverage: { planned: condition.samples, recorded: rows.length, validated: records.length, normal: normal.length,
            observed: normal.filter(r => r.outcome === 'observed').length, refused: normal.filter(r => r.outcome === 'refused').length,
            error: exceptional.filter(r => r.outcome === 'error').length,
            not_applicable: exceptional.filter(r => r.outcome === 'not_applicable').length,
            diagnostics: exceptional.length + diagnostics.length, unmatched: diagnostics.length,
            missing: missing.length, missing_indices: missing, complete },
        records, exceptional, effects: { known, complete_plan: complete ? structuredClone(known) : null } };
}

export function mingjiaoJiuyangFusionEffects(rows, condition, originalManifest) {
    const r = mingjiaoJiuyangFusionReport(rows, condition, originalManifest);
    return { collection_group: group, condition_id: r.condition_id, series: r.series, coverage: r.coverage, ...r.effects };
}

export function mingjiaoJiuyangFusionMarkdown(summary, originalManifest, rows) {
    const condition = own(summary, 'condition');
    assert.deepEqual(summary, mingjiaoJiuyangFusionReport(rows, condition, originalManifest), 'summary differs from original ledger rows');
    const c = summary.coverage, k = summary.effects.known, mode = summary.series.smoke ? '烟雾' : '正式';
    const lines = ['### 九阳融合（' + mode + '）：' + text(condition.id), '',
        table(['有限条件', '记录/计划', '正常观察/拒绝', '诊断', '缺样本', '条件完成'], [[text(condition.parameters.variant),
            `${c.recorded}/${c.planned}`, `${c.observed}/${c.refused}`, c.diagnostics, c.missing, c.complete ? '是' : '否']]), '',
        summary.series.smoke ? '仅为独立烟雾记录，不并入正式统计。' : '仅为这一有限正式条件，不代表明教、全部武学或实服已验收。',
        '命令受理不等于融合成功；原随机失败、资格拒绝与正确中止分别记录。诊断不计成功或随机失败分母。'];
    if (!k) lines.push('', '融合、费用与自然回调统计：未知（无已验证且匹配的正常记录）。');
    else lines.push('', table(['命令/受理/拒绝', '原执行成本', '融合命令/受理', '自然回调', '子招', 'get_finish', '实际心跳'], [[
        `${k.commands}/${k.commands_accepted}/${k.commands_refused}`, k.command_cost,
        `${k.fusion_commands}/${k.fusion_commands_accepted}`, k.natural_callbacks, k.child_actions, k.get_finish_calls, k.observed_heartbeats]]), '',
    table(['接口', '入口拒绝', '融合成功', '原随机失败', '子技失败', '资格拒绝', '正确中止'], [[
        k.outcomes.interface, k.outcomes.command_refused, k.outcomes.fusion_success, k.outcomes.source_random_failure,
        k.outcomes.child_refused, k.outcomes.qualification_refused, k.outcomes.halted]]), '',
    `原随机终判有效样本：${k.random_trials || '未知（本条件不适用）'}；不强制实现源码概率的样本比例。`,
    `已核回调毛扣：气血 ${k.callback_cost.qi}、气血上限 ${k.callback_cost.eff_qi}、精神 ${k.callback_cost.jing}、精神上限 ${k.callback_cost.eff_jing}、内力 ${k.callback_cost.neili}。`,
    '这些费用是经原记录校验的扣除，不是零伤害；融合是技能与忙乱状态变化，不用战斗伤害代替效果。');
    if (summary.records.length) lines.push('', table(['槽位', '原结果', '分类', '匹配', '实际融合成功', '实际合成等级', '原命令成本', '诊断理由'],
        summary.records.map(r => [r.index, text(r.outcome), text(r.classification), r.observation.condition_matched ? '是' : '否',
            r.observation.success === null ? '未知/不适用' : r.observation.success ? '是' : '否', r.merged_level ?? '未知/不适用',
            r.observation.command_cost, text(r.diagnostic_reason || r.reason)])));
    if (summary.exceptional.length) lines.push('', table(['诊断槽位', '原结果', '原理由'],
        summary.exceptional.map(r => [r.index, text(r.outcome), text(r.reason)])));
    lines.push('', '晚到或错过中止仍保留实际融合结果，但不算中止条件完成；未知消息与截断也不能完成条件。',
        `完整计划汇总：${summary.effects.complete_plan ? '已核验所有原槽位且条件匹配' : '未知（缺样本、诊断或条件未匹配）'}。`);
    if (c.missing) lines.push('缺少原件编号：' + c.missing_indices.join('、') + '。');
    lines.push('预存三子技能是实验输入，不证明自然学得；空关联不证明非空映射或非零熟练已被清理。',
        '本纯消费者不证明驱动、源副本、原始日志或真实采样已验收；合成测试不是真实游戏证据。',
        `冻结来源 ${condition.parameters.qualification_sources.length} 份；摘要 ${text(condition.parameters.reviewed_source_hash)}。`,
        `系列指纹 ${text(summary.series.fingerprint)}；模式 ${mode}。`);
    return lines.join('\n');
}
