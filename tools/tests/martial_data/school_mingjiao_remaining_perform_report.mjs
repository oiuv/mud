// Pure evidence summaries. The caller supplies the original series manifest and rows, never a reconstructed mode.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { distribution, probability } from './statistics.mjs';
import { validateMingjiaoRemainingPerformCondition, mingjiaoRemainingPerformSourcePaths } from './school_mingjiao_remaining_perform_cases.mjs';
import { validateMingjiaoRemainingPerformRecord } from './school_mingjiao_remaining_perform_record.mjs';

const own = (x, k) => { assert.ok(Object.hasOwn(x, k), 'missing ' + k); return x[k]; };
const object = x => { assert.ok(x && typeof x === 'object' && !Array.isArray(x)); return x; };
const hash = x => { assert.equal(typeof x, 'string'); assert.match(x, /^[a-f0-9]{64}$/); return x; };
const copy = x => structuredClone(x);
function context(condition, manifest) {
    const p = validateMingjiaoRemainingPerformCondition(condition);
    object(manifest); assert.equal(manifest.format, 1); assert.equal(manifest.kind, 'martial_data_series');
    const identity = object(own(manifest, 'identity'));
    assert.equal(hash(own(manifest, 'fingerprint')), digest(identity), 'manifest fingerprint mismatch');
    hash(own(identity, 'source_fingerprint'));
    const execution = object(own(identity, 'execution'));
    assert.equal(execution.collection, 'school-combat'); assert.equal(typeof execution.smoke, 'boolean');
    assert.equal(p.run_mode, execution.smoke ? 'smoke' : 'formal', 'condition mode differs from original series');
    assert.ok(Array.isArray(identity.conditions));
    const matching = identity.conditions.filter(c => c.id === condition.id);
    assert.equal(matching.length, 1); assert.deepEqual(matching[0], condition, 'condition identity drift');
    const entries = own(manifest, 'entries'); assert.ok(Array.isArray(entries));
    assert.equal(identity.entries_sha256, digest(entries));
    const entry = entries.filter(e => e.id === condition.entry_id); assert.equal(entry.length, 1, 'ambiguous original entry');
    const source = p.source_entry;
    for (const k of ['id', 'path', 'role', 'sha256']) assert.equal(entry[0][k], source[k], 'entry ' + k);
    for (const k of ['line', 'function']) if (Object.hasOwn(entry[0], k)) assert.equal(entry[0][k], source[k]);
    const files = object(own(execution, 'source_files'));
    for (const path of mingjiaoRemainingPerformSourcePaths) assert.equal(own(files, path), p.source_evidence[path], 'frozen source ' + path);
    for (const path of p.absent_sources) assert.ok(!Object.hasOwn(files, path), 'declared fallback unexpectedly exists');
    return { fingerprint: manifest.fingerprint, source_fingerprint: identity.source_fingerprint,
        smoke: execution.smoke, run_mode: p.run_mode, reviewed_source_hash: p.reviewed_source_hash };
}
const sum = (items, f) => items.reduce((total, item) => total + f(item), 0);

export function mingjiaoRemainingPerformReport(rows, condition, originalManifest) {
    const series = context(condition, originalManifest), p = condition.parameters;
    assert.ok(Array.isArray(rows));
    const indices = new Set(), records = [];
    for (const row of rows) {
        object(row); assert.equal(own(row, 'format'), 1); assert.equal(own(row, 'fingerprint'), series.fingerprint);
        assert.equal(own(row, 'condition_id'), condition.id); assert.equal(own(row, 'condition_sha256'), digest(condition));
        assert.ok(Number.isSafeInteger(own(row, 'index')) && row.index >= 0 && row.index < condition.samples);
        assert.ok(!indices.has(row.index), 'duplicate sample slot'); indices.add(row.index);
        const raw = object(own(row, 'raw')); assert.equal(own(row, 'raw_sha256'), digest(raw));
        for (const key of ['index', 'outcome', 'reason']) assert.deepEqual(own(row, key), own(raw, key));
        const evidence = validateMingjiaoRemainingPerformRecord(raw, condition);
        records.push({ index: row.index, raw_sha256: row.raw_sha256, outcome: raw.outcome, reason: raw.reason,
            elapsed: raw.elapsed, evidence });
    }
    records.sort((a, b) => a.index - b.index);
    const normal = records.filter(r => r.evidence !== null), observations = normal.map(r => r.evidence);
    const errors = records.filter(r => r.outcome === 'error').length;
    const na = records.filter(r => r.outcome === 'not_applicable').length;
    const coverage = { planned: condition.samples, supplied: rows.length, validated: normal.length,
        observed: records.filter(r => r.outcome === 'observed').length,
        refused: records.filter(r => r.outcome === 'refused').length, errors, not_applicable: na,
        missing: Array.from({ length: condition.samples }, (_, i) => i).filter(i => !indices.has(i)),
        unmatched: normal.filter(r => !r.evidence.matched).map(r => r.index), complete: false };
    coverage.complete = !coverage.missing.length && !errors && !na && !coverage.unmatched.length;
    const roles = p.extra_target ? 3 : 2;
    const accepted = observations.filter(x => x.commands_accepted === 1), refused = observations.filter(x => x.commands_accepted === 0);
    const resourceNames = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
    const resourceDistribution = (values, side) => Object.fromEntries(resourceNames.map(key => [key,
        Object.fromEntries(['decrease', 'recovery', 'net_decrease'].map(part => [part,
            distribution(values.map(x => x.resources[side][key][part]))]))]));
    const sampleProbability = predicate => probability(accepted.filter(predicate).length, accepted.length);
    const attackCount = sum(observations, x => x.actual_calls.attacks);
    const effects = { known: observations.length > 0, complete_plan: coverage.complete,
        measured_records: observations.length, commands_accepted: observations.length ? sum(observations, x => x.commands_accepted) : null,
        command_cost: observations.length ? sum(observations, x => x.command_cost) : null,
        resources: observations.length ? Array.from({ length: roles }, (_, side) => ({ side,
            ...Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'].map(key => [key, {
                decrease: sum(observations, x => x.resources[side][key].decrease),
                recovery: sum(observations, x => x.resources[side][key].recovery),
                net_decrease: sum(observations, x => x.resources[side][key].net_decrease),
            }])) })) : null,
        actual_calls: observations.length ? Object.fromEntries(['attacks', 'direct_inputs', 'selected_actions', 'passives', 'busy_requests', 'equipment_hit_ob']
            .map(k => [k, sum(observations, x => x.actual_calls[k])])) : null,
        attack_results: observations.length ? Object.fromEntries(['hit', 'dodge', 'parry'].map(k => [k, sum(observations, x => x.attack_results[k])])) : null,
        flower: p.ability === 'hua' && observations.length ? { consumed: sum(observations, x => x.flower.consumed),
            destroyed_after_return: sum(observations, x => x.flower.destroyed_after_return) } : null,
        poison_seed_records: observations.length ? observations.filter(x => x.poison_seed.some(s => Object.keys(s).length)).length : null,
        distributions: {
            command_cost: { accepted: distribution(accepted.map(x => x.command_cost)), refused: distribution(refused.map(x => x.command_cost)) },
            resources: Array.from({ length: roles }, (_, side) => ({ side,
                accepted: resourceDistribution(accepted, side), refused: resourceDistribution(refused, side) })),
            accepted_actual_calls: Object.fromEntries(['attacks', 'direct_inputs'].map(key => [key,
                distribution(accepted.map(x => x.actual_calls[key]))])),
        },
        accepted_sample_events: {
            any_ordinary_attack: sampleProbability(x => x.actual_calls.attacks > 0),
            any_direct_input: sampleProbability(x => x.actual_calls.direct_inputs > 0),
            targets: Array.from({ length: roles - 1 }, (_, i) => ({ side: i + 1,
                increased_busy_state: sampleProbability(x => x.target_new_control[i].increased === 1),
                positive_resource_net_decrease: sampleProbability(x => resourceNames.some(key => x.resources[i + 1][key].net_decrease > 0)) })),
        },
        attack_result_rates: Object.fromEntries(['hit', 'dodge', 'parry'].map(key => [key,
            attackCount ? sum(observations, x => x.attack_results[key]) / attackCount : null])),
        unknown: { requested_gross_damage: null, requested_gross_wound: null, planned_kuai_attacks: null,
            learned_gross: null, poison_natural_lifecycle: null, busy_natural_release: null },
    };
    return { kind: 'mingjiao_remaining_perform', series,
        condition: copy(condition), coverage, effects, records,
        limits: ['只统计原件中的命令、调用和状态；计划资格不证明自然养成、可教学或兼修。',
            '资源 decrease/recovery 是实际资源状态单向变化，来自 setter 与已登记的原 dbase 写入观察；不等于 receive_damage/receive_wound 请求毛量。',
            'COMBAT direct 的 damage/percent 是调用参数，不等于最终伤害；普通命中计数仅来自原攻击事件。',
            '快剑计划总击数、弱熟练毛增量、毒的自然发作及忙乱自然解除未观察，保持未知。',
            'Wilson 95% 区间只使用已受理的独立样本槽；调用级命中率仅描述计数，不把连击当独立试验。忙乱增加是原状态事件，不等于观察到自然解除。',
            'manifest 哈希绑定版本与模式，不独自证明原件来自真实驱动；复制来源及进程证据另验。'] };
}

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('|', '&#124;').replaceAll('`', '&#96;').replaceAll('\x1b', '[ESC]').replace(/[\r\n]+/g, ' ');
const shown = value => value === null ? '未知' : String(value);
export function mingjiaoRemainingPerformMarkdown(summary, originalManifest, rows) {
    object(summary);
    const rebuilt = mingjiaoRemainingPerformReport(rows, summary.condition, originalManifest);
    assert.deepEqual(summary, rebuilt, 'Markdown must be recomputed from original manifest and rows');
    const { coverage: c, effects: e } = rebuilt, p = rebuilt.condition.parameters;
    const lines = [`### ${escape(p.skill)}/${escape(p.ability)} · ${escape(p.variant)}`,
        '', `模式：${rebuilt.series.smoke ? '烟雾（不并入正式分布）' : '正式'}；原指纹：${rebuilt.series.fingerprint}。`,
        '', '| 计划槽 | 已供原件 | 正常观察 | 拒绝 | 错误 | 不适用 | 缺样 | 期望不符 | 完整计划 |',
        '| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
        `| ${c.planned} | ${c.supplied} | ${c.observed} | ${c.refused} | ${c.errors} | ${c.not_applicable} | ${c.missing.length} | ${c.unmatched.length} | ${c.complete ? '是' : '否'} |`,
        '', `下列只汇总 ${e.measured_records} 条校验完整原件；缺样、错误、不适用不补零。`,
        '', '| 命令受理次数 | 原 command 成本和 | 原普通攻击 | 原直接调用 | 原选招 | 原被动调用 | 原忙乱请求 | 原装备 hit_ob |',
        '| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
        `| ${shown(e.commands_accepted)} | ${shown(e.command_cost)} | ${shown(e.actual_calls?.attacks ?? null)} | ${shown(e.actual_calls?.direct_inputs ?? null)} | ${shown(e.actual_calls?.selected_actions ?? null)} | ${shown(e.actual_calls?.passives ?? null)} | ${shown(e.actual_calls?.busy_requests ?? null)} | ${shown(e.actual_calls?.equipment_hit_ob ?? null)} |`,
        '', '| 角色 | 气血实际下降/恢复/净下降 | 精气实际下降/恢复/净下降 | 内力实际下降/恢复/净下降 |',
        '| --- | --- | --- | --- |'];
    if (e.resources) for (const r of e.resources) {
        const format = key => `${r[key].decrease}/${r[key].recovery}/${r[key].net_decrease}`;
        lines.push(`| USER ${r.side} | ${format('qi')} | ${format('jing')} | ${format('neili')} |`);
    } else lines.push('| 未知 | 未知 | 未知 | 未知 |');
    lines.push('', '分布分开受理与拒绝；下表资源分布仅使用已受理样本，拒绝分布保留于 JSON。',
        '', '| 指标 | 样本量 | 均值 | 中位 | P10 | P90 | P95 |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
    const distributionRow = (name, d) => lines.push(`| ${name} | ${d.n} | ${shown(d.mean)} | ${shown(d.median)} | ${shown(d.p10)} | ${shown(d.p90)} | ${shown(d.p95)} |`);
    distributionRow('受理 command 成本', e.distributions.command_cost.accepted);
    distributionRow('拒绝 command 成本', e.distributions.command_cost.refused);
    for (const r of e.distributions.resources) for (const [resource, values] of Object.entries(r.accepted))
        for (const [part, d] of Object.entries(values)) distributionRow(`USER ${r.side} ${resource}/${part}`, d);
    for (const [key, d] of Object.entries(e.distributions.accepted_actual_calls)) distributionRow('受理样本实际 ' + key, d);
    lines.push('', '| 已受理样本事件（不等于命中） | 发生/样本量 | 比例 | Wilson 95% |', '| --- | ---: | ---: | --- |');
    const probabilityRow = (name, value) => lines.push(`| ${name} | ${value.successes}/${value.trials} | ${shown(value.rate)} | ${shown(value.low95)}–${shown(value.high95)} |`);
    probabilityRow('至少一次普通攻击调用', e.accepted_sample_events.any_ordinary_attack);
    probabilityRow('至少一次直接 COMBAT 调用', e.accepted_sample_events.any_direct_input);
    for (const target of e.accepted_sample_events.targets) {
        probabilityRow(`USER ${target.side} 忙乱状态增加`, target.increased_busy_state);
        probabilityRow(`USER ${target.side} 至少一项资源净下降`, target.positive_resource_net_decrease);
    }
    lines.push('', `即时毒种子记录：${shown(e.poison_seed_records)}；花瓣实际消耗：${shown(e.flower?.consumed ?? null)}；原返回后销毁对象：${shown(e.flower?.destroyed_after_return ?? null)}。`,
        '', '| 原槽 | 结果 | 原成本 | 原理由/诊断 |', '| ---: | --- | ---: | --- |');
    for (const r of rebuilt.records) lines.push(`| ${r.index} | ${escape(r.outcome)} | ${shown(r.evidence?.command_cost ?? null)} | ${escape(r.reason)} |`);
    lines.push('', ...rebuilt.limits.map(line => '- ' + escape(line)));
    return lines.join('\n');
}
