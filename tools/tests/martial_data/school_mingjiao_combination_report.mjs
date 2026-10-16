// Unregistered reports: original manifest/rows and current reviewed source context required.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { distribution, probability } from './statistics.mjs';
import { mingjiaoCombinationSourcePaths } from './school_mingjiao_combination_cases.mjs';
import { createMingjiaoCombinationRecordValidator } from './school_mingjiao_combination_record.mjs';

const own = (o, k) => { assert.ok(o && Object.hasOwn(o, k), 'missing ' + k); return o[k]; };
const map = x => { assert.ok(x && typeof x === 'object' && !Array.isArray(x)); return x; };
const list = x => { assert.ok(Array.isArray(x)); return x; };
const hash = x => { assert.match(x, /^[a-f0-9]{64}$/); return x; };
const copy = x => structuredClone(x);
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const sum = (xs, f) => xs.reduce((n, x) => n + f(x), 0);

function context(c, manifest, { catalog, readSource }) {
    map(manifest); assert.equal(manifest.format, 1); assert.equal(manifest.kind, 'martial_data_series');
    const identity = map(own(manifest, 'identity')), execution = map(own(identity, 'execution'));
    assert.equal(hash(own(manifest, 'fingerprint')), digest(identity)); hash(own(identity, 'source_fingerprint'));
    assert.equal(execution.collection, 'school-combat'); assert.equal(typeof execution.smoke, 'boolean');
    const check = createMingjiaoCombinationRecordValidator(catalog, readSource, { smoke: execution.smoke });
    check.validateCondition(c);
    const conditions = list(own(identity, 'conditions'));
    assert.ok(conditions.length && conditions.length <= 37);
    assert.equal(new Set(conditions.map(x => x.id)).size, conditions.length, 'unique manifest conditions');
    conditions.forEach(check.validateCondition);
    const selected = conditions.filter(x => x.id === c.id); assert.equal(selected.length, 1); assert.deepEqual(selected[0], c);
    const entries = list(own(manifest, 'entries')); assert.equal(identity.entries_sha256, digest(entries));
    assert.equal(new Set(entries.map(x => x.id)).size, entries.length, 'unique manifest entries');
    for (const condition of conditions) {
        const matching = entries.filter(e => e.id === condition.entry_id); assert.equal(matching.length, 1);
        const e = matching[0], path = condition.entry_id;
        assert.equal(own(e, 'path'), path); assert.equal(own(e, 'sha256'), condition.parameters.source_evidence[path]);
        assert.equal(own(e, 'role'), condition.method === 'bout' ? 'npc' : 'file', 'actual file/NPC registration role');
    }
    const files = map(own(execution, 'source_files'));
    for (const path of mingjiaoCombinationSourcePaths) assert.equal(own(files, path), c.parameters.source_evidence[path]);
    return { check, series: { fingerprint: manifest.fingerprint, source_fingerprint: identity.source_fingerprint,
        execution_sha256: digest(execution), smoke: execution.smoke, run_mode: c.parameters.run_mode,
        reviewed_source_hash: c.parameters.reviewed_source_hash } };
}

export function mingjiaoCombinationReport(rows, condition, originalManifest, sourceContext) {
    const { check, series } = context(condition, originalManifest, sourceContext), indices = new Set(), records = [];
    list(rows);
    for (const row of rows) {
        map(row); assert.equal(own(row, 'format'), 1); assert.equal(own(row, 'fingerprint'), series.fingerprint);
        assert.equal(own(row, 'condition_id'), condition.id); assert.equal(own(row, 'condition_sha256'), digest(condition));
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.ok(!indices.has(row.index), 'duplicate raw sample slot'); indices.add(row.index);
        const raw = map(own(row, 'raw')); assert.equal(own(row, 'raw_sha256'), digest(raw));
        for (const key of ['index', 'outcome', 'reason']) assert.deepEqual(own(row, key), own(raw, key));
        const evidence = check(raw, condition);
        records.push({ index: row.index, outcome: row.outcome, reason: row.reason,
            raw_sha256: row.raw_sha256, elapsed: raw.elapsed, evidence });
    }
    records.sort((a, b) => a.index - b.index);
    const good = records.filter(r => r.evidence !== null), values = good.map(r => r.evidence);
    const coverage = { planned: condition.samples, supplied: records.length, validated: good.length,
        observed: records.filter(r => r.outcome === 'observed').length,
        refused: records.filter(r => r.outcome === 'refused').length,
        errors: records.filter(r => r.outcome === 'error').length,
        not_applicable: records.filter(r => r.outcome === 'not_applicable').length,
        missing: Array.from({ length: condition.samples }, (_, i) => i).filter(i => !indices.has(i)), complete: false };
    coverage.complete = coverage.missing.length + coverage.errors + coverage.not_applicable === 0;
    const commands = values.flatMap(x => x.commands), npc = values.map(x => x.npc).filter(Boolean);
    const effects = { known: good.length > 0,
        commands: { steps: commands.length, accepted: commands.length ? sum(commands, x => x.accepted) : null,
            refused: commands.length ? commands.filter(x => !x.accepted).length : null,
            evaluation_cost: commands.length ? sum(commands, x => x.command_cost) : null,
            cost: distribution(commands.map(x => x.command_cost)) },
        interface_results: values.filter(x => x.method === 'interface').map(x => copy(x.interface_result)),
        rounds: { samples: values.filter(x => x.method === 'round').length,
            primary_attacks: distribution(values.filter(x => x.method === 'round').map(x => x.attacks.filter(a => a.actor === 0).length)),
            any_hit: probability(values.filter(x => x.method === 'round' && x.attacks.some(a => a.actor === 0 && a.result === 0)).length,
                values.filter(x => x.method === 'round').length) },
        attacks: values.length ? sum(values, x => x.attacks.length) : null,
        resources: [0, 1].map(side => ({ side, ...Object.fromEntries(resources.map(key => [key,
            Object.fromEntries(['decrease', 'recovery', 'net_decrease'].map(part => [part, {
                total: values.length ? sum(values, x => x.resources[side][key][part]) : null,
                distribution: distribution(values.map(x => x.resources[side][key][part])),
            }]))])) })),
        npc: { samples: npc.length, wins: npc.length ? npc.filter(x => x.winner === 'npc').length : null,
            user_wins: npc.length ? npc.filter(x => x.winner === 'user').length : null,
            undecided: npc.length ? npc.filter(x => x.winner === 'none').length : null,
            gross_resources: 'not_observed', elapsed: distribution(npc.map(x => x.elapsed)),
            endpoint_net_loss: Object.fromEntries(resources.map(k => [k, distribution(npc.map(x => x.endpoint_net_loss[k]))])),
            preterminal_net_loss: Object.fromEntries(resources.map(k => [k, distribution(npc.map(x => x.preterminal_net_loss[k]))])),
            choices: condition.parameters.npc?.original.callbacks.map(([entry, ...args], index) => {
                const chosen = npc.flatMap(x => x.choices).filter(x => x.index === index);
                const returned = chosen.filter(x => x.return_observation === 'observed');
                return { index, entry, arguments: copy(args), calls: npc.length ? chosen.length : null,
                    returns_observed: npc.length ? returned.length : null,
                    returns_not_observed: npc.length ? chosen.length - returned.length : null,
                    command_evaluation_cost: entry === 'command' ? distribution(returned.map(x => x.result)) : null,
                    raw_returns: returned.map(x => copy(x.result)) };
            }) ?? [] },
    };
    return { format: 1, kind: 'mingjiao_combination_report', condition: copy(condition), series,
        coverage, effects, records, limitations: [
            '仅有限37条计划；组合接口、命令每步受理、原执行成本、原fight单轮和九原NPC自然交锋分别统计。',
            '烟雾独立保存，不并入正式分布；缺失、错误和不适用不补零，不因一直拒绝缺证而通过。',
            '原command返回是执行成本，不是布尔成功；自然对白未选中记未观察，不为选到成功重采。',
            'NPC资源只列端点净差与终态前净差，销毁后的资源未知；NPC毛支出/恢复未观察，不拿USER毛账代替。',
            '原NPC存储与有效映射分开，保留原技能、装备、加力、随机、闭包及动作首载背景，不代表玩家养成成本。',
            '1v1 kill路径不证明公开fight准入或同伴协援，也不是门派/全武学完成或统一强弱排名。',
        ] };
}

export function mingjiaoCombinationMarkdown(summary, originalManifest, originalRows, sourceContext) {
    map(summary); assert.deepEqual(summary,
        mingjiaoCombinationReport(originalRows, summary.condition, originalManifest, sourceContext),
        'Markdown must recompute the original manifest and raw rows');
    const { condition: c, coverage: v, effects: e } = summary;
    const show = x => x === null ? '未知' : String(x);
    return [`### 明教组合／原NPC：${c.parameters.combination}`, '',
        `条件：\`${c.id}\`；${summary.series.smoke ? '独立烟雾，不并入正式分布' : '正式固定条件'}。`,
        `记录 ${v.supplied}/${v.planned}；观察 ${v.observed}、拒绝 ${v.refused}、错误 ${v.errors}、不适用 ${v.not_applicable}；完整 ${v.complete ? '是' : '否'}。`, '',
        `原准备命令 ${e.commands.steps} 步；受理 ${show(e.commands.accepted)}／拒绝 ${show(e.commands.refused)}；执行成本 ${show(e.commands.evaluation_cost)}（非成功率）。`,
        `原接口返回：${JSON.stringify(e.interface_results)}；实际攻击 ${show(e.attacks)}；单轮样本 ${e.rounds.samples}。`,
        `NPC ${e.npc.samples} 场：NPC胜 ${show(e.npc.wins)}／USER胜 ${show(e.npc.user_wins)}／未决 ${show(e.npc.undecided)}；NPC毛费用未知。`, '',
        '| 角色 | 资源 | 原下降 | 恢复 | 净下降 |', '| --- | --- | ---: | ---: | ---: |',
        ...e.resources.flatMap(s => resources.map(k => `| USER ${s.side} | ${k} | ${show(s[k].decrease.total)} | ${show(s[k].recovery.total)} | ${show(s[k].net_decrease.total)} |`)),
        '', ...summary.limitations.map(x => '- ' + x)].join('\n');
}
