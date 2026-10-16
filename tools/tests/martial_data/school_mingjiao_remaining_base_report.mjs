// Finite evidence summary; original manifest and rows remain mandatory, including for Markdown.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { distribution, probability } from './statistics.mjs';
import { validateMingjiaoRemainingBaseCondition, mingjiaoRemainingBaseSourcePaths } from './school_mingjiao_remaining_base_cases.mjs';
import { validateMingjiaoRemainingBaseRecord } from './school_mingjiao_remaining_base_record.mjs';

const own = (x, k) => { assert.ok(Object.hasOwn(x, k), 'missing ' + k); return x[k]; };
const map = x => { assert.ok(x && typeof x === 'object' && !Array.isArray(x)); return x; };
const hash = x => { assert.equal(typeof x, 'string'); assert.match(x, /^[a-f0-9]{64}$/); return x; };
const copy = x => structuredClone(x);
const sum = (items, f) => items.reduce((n, x) => n + f(x), 0);
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
function seriesContext(c, manifest) {
    const p = validateMingjiaoRemainingBaseCondition(c);
    map(manifest); assert.equal(own(manifest, 'format'), 1); assert.equal(own(manifest, 'kind'), 'martial_data_series');
    const identity = map(own(manifest, 'identity')), execution = map(own(identity, 'execution'));
    assert.equal(hash(own(manifest, 'fingerprint')), digest(identity)); hash(own(identity, 'source_fingerprint'));
    assert.equal(execution.collection, 'school-combat'); assert.equal(typeof execution.smoke, 'boolean');
    assert.equal(p.run_mode, execution.smoke ? 'smoke' : 'formal', 'original execution mode mismatch');
    assert.ok(Array.isArray(identity.conditions)); const selected = identity.conditions.filter(x => x.id === c.id);
    assert.equal(selected.length, 1); assert.deepEqual(selected[0], c);
    const entries = own(manifest, 'entries'); assert.ok(Array.isArray(entries)); assert.equal(identity.entries_sha256, digest(entries));
    const matches = entries.filter(x => x.id === c.entry_id); assert.equal(matches.length, 1, 'ambiguous original entry');
    const path = p.base_source.path, entry = matches[0];
    assert.equal(own(entry, 'path'), path); assert.equal(own(entry, 'sha256'), p.source_evidence[path]);
    const role = c.method === 'ordinary' ? 'file' : p.source_entry.function === 'hit_ob' ? 'combat_interface'
        : p.source_entry.function === 'valid_learn' ? 'query_or_gate' : 'other_function';
    assert.equal(own(entry, 'role'), role, 'actual catalog role, not planned observation role');
    if (c.method !== 'ordinary') {
        assert.equal(entry.id, p.source_entry.entry_id);
        for (const k of ['line', 'function']) if (Object.hasOwn(entry, k)) assert.equal(entry[k], p.source_entry[k]);
    }
    const files = map(own(execution, 'source_files'));
    for (const path of mingjiaoRemainingBaseSourcePaths) assert.equal(own(files, path), p.source_evidence[path], 'frozen source ' + path);
    return { fingerprint: manifest.fingerprint, source_fingerprint: identity.source_fingerprint,
        execution_sha256: digest(execution), smoke: execution.smoke, run_mode: p.run_mode,
        reviewed_source_hash: p.reviewed_source_hash };
}
function resourceSummary(values, pick = x => x.resources) {
    return [0, 1].map(side => ({ side, ...Object.fromEntries(resources.map(key => [key,
        Object.fromEntries(['decrease', 'recovery', 'net_decrease'].map(part => [part, {
            total: values.length ? sum(values, x => pick(x)[side][key][part]) : null,
            distribution: distribution(values.map(x => pick(x)[side][key][part])),
        }]))])) }));
}

export function mingjiaoRemainingBaseReport(rows, condition, originalManifest) {
    const series = seriesContext(condition, originalManifest), p = condition.parameters;
    assert.ok(Array.isArray(rows)); const indices = new Set(), records = [];
    for (const row of rows) {
        map(row); assert.equal(own(row, 'format'), 1); assert.equal(own(row, 'fingerprint'), series.fingerprint);
        assert.equal(own(row, 'condition_id'), condition.id); assert.equal(own(row, 'condition_sha256'), digest(condition));
        assert.ok(Number.isSafeInteger(own(row, 'index')) && row.index >= 0 && row.index < condition.samples);
        assert.ok(!indices.has(row.index), 'duplicate sample slot'); indices.add(row.index);
        const raw = map(own(row, 'raw')); assert.equal(own(row, 'raw_sha256'), digest(raw));
        for (const key of ['index', 'outcome', 'reason']) assert.deepEqual(own(row, key), own(raw, key));
        const evidence = validateMingjiaoRemainingBaseRecord(raw, condition);
        records.push({ index: row.index, raw_sha256: row.raw_sha256, outcome: raw.outcome, reason: raw.reason,
            elapsed: raw.elapsed, evidence });
    }
    records.sort((a, b) => a.index - b.index);
    const known = records.filter(r => r.evidence !== null), values = known.map(r => r.evidence);
    const coverage = { planned: condition.samples, supplied: records.length, validated: values.length,
        observed: records.filter(r => r.outcome === 'observed').length, refused: records.filter(r => r.outcome === 'refused').length,
        errors: records.filter(r => r.outcome === 'error').length, not_applicable: records.filter(r => r.outcome === 'not_applicable').length,
        missing: Array.from({ length: condition.samples }, (_, index) => index).filter(i => !indices.has(i)),
        unmatched: known.filter(r => !r.evidence.matched).map(r => r.index), complete: false };
    coverage.complete = coverage.missing.length + coverage.unmatched.length + coverage.errors + coverage.not_applicable === 0;
    const commands = values.filter(x => x.command_cost !== null), accepted = commands.filter(x => x.commands_accepted),
        denied = commands.filter(x => !x.commands_accepted), observed = known.filter(r => r.outcome === 'observed').map(r => r.evidence),
        refused = known.filter(r => r.outcome === 'refused').map(r => r.evidence);
    const ordinary = values.filter(x => x.ordinary_invocations), practices = values.filter(x => x.practice),
        lifecycles = values.filter(x => x.lifecycle), seeded = lifecycles.filter(x => x.lifecycle.seeded),
        completed = seeded.filter(x => x.lifecycle.complete);
    const totals = key => values.length ? sum(values, x => x.actual_calls[key]) : null;
    const hitCalls = totals('hits'), attackCalls = totals('attacks');
    const effects = { known: values.length > 0, complete_plan: coverage.complete, measured_records: values.length,
        commands: { n: commands.length, accepted: commands.length ? accepted.length : null,
            refused: commands.length ? denied.length : null, cost: commands.length ? sum(commands, x => x.command_cost) : null,
            accepted_cost: distribution(accepted.map(x => x.command_cost)), refused_cost: distribution(denied.map(x => x.command_cost)) },
        resources: resourceSummary(values), observed_resources: resourceSummary(observed), refused_resources: resourceSummary(refused),
        ordinary: { n: ordinary.length, attacks: attackCalls, hits: hitCalls, dodges: totals('dodges'), parries: totals('parries'),
            call_hit_rate: attackCalls ? hitCalls / attackCalls : null,
            any_hit: probability(ordinary.filter(x => x.actual_calls.hits > 0).length, ordinary.length),
            any_target_qi_decrease: probability(ordinary.filter(x => x.resources[1].qi.decrease > 0).length, ordinary.length),
            independent_defense_hook: null },
        interface_results: values.filter(x => condition.method === 'interface').map(x => copy(x.interface_result)),
        practice: { n: practices.length, completed: practices.length ? sum(practices, x => x.practice.completed) : null,
            gain: distribution(practices.map(x => x.practice.gain)),
            total_gain: practices.length ? sum(practices, x => x.practice.gain) : null,
            skill_level_change: practices.length ? sum(practices, x => x.practice.skill_level_change) : null },
        poison: { seeded_samples: values.length ? values.filter(x => x.poison_seeds > 0).length : null,
            seed_probability: probability(values.filter(x => x.poison_seeds > 0).length, values.length),
            return_values: values.flatMap(x => x.passives.filter(v => v.kind === 'poison').map(v => copy(v.result))),
            lifecycle: { n: lifecycles.length, seeded: seeded.length, no_seed: lifecycles.filter(x => !x.lifecycle.seeded).length,
                completed: completed.length, removed_given_seed: probability(completed.length, seeded.length),
                elapsed: distribution(completed.map(x => x.lifecycle.elapsed)),
                ticks: distribution(completed.map(x => x.lifecycle.tick_count)),
                heartbeats: distribution(completed.map(x => x.lifecycle.heartbeat_count)),
                seed_resources: resourceSummary(lifecycles, x => x.lifecycle.resources.map(v => v.seed)),
                natural_resources: resourceSummary(completed, x => x.lifecycle.resources.map(v => v.natural)) } },
        busy: { calls: values.flatMap(x => x.passives.filter(v => v.kind === 'busy')),
            any_proc: probability(values.filter(x => x.passives.some(v => v.kind === 'busy' && v.proc)).length, values.length),
            duration_seconds: null },
        unknown: { requested_damage: null, requested_wound: null, independent_random_draws: null } };
    return { format: 1, kind: 'mingjiao_remaining_base_report', condition: copy(condition), series, category: p.ability,
        coverage, effects, records, elapsed: distribution(known.map(r => r.elapsed)), limitations: [
            '普通招式、公共招架、直接练习接口、公开练习、学习资格、毒种、自然毒窗与逍遥忙乱分别记录，不混作同一效果。',
            '受理仅说明命令被执行；接口返回0、未命中及未种毒仍可能是正常观察。普通COMBAT入口没有命令成本。',
            '资源单向下降与恢复来自实际setter和已登记的原dbase写入观察；净变严格闭账，不等于receive_damage/wound请求毛量。',
            '毒种不等于毒发；无种毒不计生命周期解除。只受害者原心跳推进，600秒是故障看门狗而非毒时长。',
            'start_busy原请求与即时忙乱状态不等于实测持续时间。普通命中次数相关，置信区间仅用于独立样本级事件。',
            'learned原类型与值保留；直接practice_skill不冒公开practice成长，valid_learn不证明师承或已学会。',
            '缺样、错误、不适用和未知不补零；计划参数与源码支持不是已观察数据。当前条件初态不代表自然养成。',
        ] };
}

export function mingjiaoRemainingBaseMarkdown(summary, originalManifest, originalRows) {
    map(summary); assert.ok(Array.isArray(originalRows), 'original rows required');
    assert.deepEqual(summary, mingjiaoRemainingBaseReport(originalRows, summary.condition, originalManifest), 'report is not original-row recomputation');
    const { condition: c, coverage: v, effects: e, series } = summary;
    const show = value => value === null ? '未知' : String(value);
    const lines = ['### 明教原本体：' + c.parameters.skill + ' / ' + summary.category, '',
        `条件：\`${c.id}\`；${series.smoke ? '烟雾，不能并入正式统计' : '正式固定条件'}。`,
        `记录 ${v.supplied}/${v.planned}；观察 ${v.observed}、拒绝 ${v.refused}、错误 ${v.errors}、不适用 ${v.not_applicable}；完整 ${v.complete ? '是' : '否'}。`, '',
        `命令受理 ${show(e.commands.accepted)}，原整数执行成本 ${show(e.commands.cost)}；普通攻击调用 ${show(e.ordinary.attacks)}，命中 ${show(e.ordinary.hits)}，非受理率。`, '',
        '| 角色 | 资源 | 实际下降 | 恢复 | 净下降 | 下降均值/中位/P90 |',
        '| --- | --- | ---: | ---: | ---: | --- |'];
    for (const s of e.resources) for (const k of resources) {
        const r = s[k], d = r.decrease.distribution;
        lines.push(`| ${s.side} | ${k} | ${show(r.decrease.total)} | ${show(r.recovery.total)} | ${show(r.net_decrease.total)} | ${show(d.mean)}/${show(d.median)}/${show(d.p90)} |`);
    }
    lines.push('', `直接/公开方法原返回：${JSON.stringify(e.interface_results)}。公开练习完成 ${show(e.practice.completed)}，实际熟练净增 ${show(e.practice.total_gain)}。`,
        `种毒样本 ${show(e.poison.seeded_samples)}；自然窗口 ${e.poison.lifecycle.n}，无种毒 ${e.poison.lifecycle.no_seed}，原解除 ${e.poison.lifecycle.completed}。`,
        `逍遥实际被动成功 ${e.busy.any_proc.successes}/${e.busy.any_proc.trials}；持续秒数未知。`, '', ...summary.limitations.map(x => '- ' + x));
    return lines.join('\n');
}
