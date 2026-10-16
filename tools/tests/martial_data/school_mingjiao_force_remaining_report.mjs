// UNREGISTERED summary preparation. Original manifest AND original rows required.
import assert from 'node:assert/strict';
import { digest } from './ledger.mjs';
import { distribution } from './statistics.mjs';
import { validateMingjiaoForceRemainingCondition, mingjiaoForceRemainingSourcePaths } from './school_mingjiao_force_remaining_cases.mjs';
import { validateMingjiaoForceRemainingRecord } from './school_mingjiao_force_remaining_record.mjs';

const own = (v, k) => { assert.ok(v && Object.hasOwn(v, k), 'missing ' + k); return v[k]; };
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v)); return v; };
const hash = v => { assert.match(v, /^[a-f0-9]{64}$/); return v; };
const copy = v => structuredClone(v);
const sum = (rows, getter) => rows.length ? rows.reduce((n, r) => n + getter(r), 0) : null;
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
function context(c, manifest) {
    const p = validateMingjiaoForceRemainingCondition(c);
    assert.equal(own(manifest, 'format'), 1); assert.equal(own(manifest, 'kind'), 'martial_data_series');
    const id = map(own(manifest, 'identity')), execution = map(own(id, 'execution'));
    assert.equal(hash(own(manifest, 'fingerprint')), digest(id)); hash(own(id, 'source_fingerprint'));
    assert.equal(execution.collection, 'school-combat'); assert.equal(typeof execution.smoke, 'boolean');
    assert.equal(p.run_mode, execution.smoke ? 'smoke' : 'formal', 'original mode');
    const conditions = own(id, 'conditions'); assert.ok(Array.isArray(conditions));
    const matches = conditions.filter(v => v.id === c.id); assert.equal(matches.length, 1); assert.deepEqual(matches[0], c);
    const entries = own(manifest, 'entries'); assert.ok(Array.isArray(entries)); assert.equal(id.entries_sha256, digest(entries));
    const entry = entries.filter(v => v.id === c.entry_id); assert.equal(entry.length, 1);
    const path = c.entry_id.split(':')[0], primary = entry[0];
    assert.equal(primary.path, path); assert.equal(primary.sha256, p.source_evidence[path]);
    assert.equal(primary.role, c.entry_id.includes(':') ? 'exert' : 'file', 'actual catalog entry role');
    for (const path of mingjiaoForceRemainingSourcePaths) assert.equal(own(map(execution.source_files), path), p.source_evidence[path], 'frozen source ' + path);
    return { fingerprint: manifest.fingerprint, source_fingerprint: id.source_fingerprint,
        execution_sha256: digest(execution), run_mode: p.run_mode, smoke: execution.smoke,
        reviewed_source_hash: p.reviewed_source_hash };
}

export function mingjiaoForceRemainingReport(rows, condition, originalManifest) {
    const series = context(condition, originalManifest); assert.ok(Array.isArray(rows));
    const used = new Set(), records = [];
    for (const row of rows) {
        assert.equal(own(row, 'format'), 1); assert.equal(own(row, 'fingerprint'), series.fingerprint);
        assert.equal(own(row, 'condition_id'), condition.id); assert.equal(own(row, 'condition_sha256'), digest(condition));
        const index = own(row, 'index'); assert.ok(Number.isSafeInteger(index) && index >= 0 && index < condition.samples);
        assert.ok(!used.has(index), 'duplicate sample slot'); used.add(index);
        const raw = map(own(row, 'raw')); assert.equal(own(row, 'raw_sha256'), digest(raw));
        for (const k of ['index', 'outcome', 'reason']) assert.deepEqual(own(row, k), own(raw, k));
        const evidence = validateMingjiaoForceRemainingRecord(raw, condition);
        records.push({ index, outcome: raw.outcome, reason: raw.reason, raw_sha256: row.raw_sha256, elapsed: raw.elapsed, evidence });
    }
    records.sort((a, b) => a.index - b.index);
    const known = records.filter(r => r.evidence !== null), values = known.map(r => r.evidence);
    const missing = Array.from({ length: condition.samples }, (_, i) => i).filter(i => !used.has(i));
    const count = outcome => records.filter(r => r.outcome === outcome).length;
    const coverage = { planned: condition.samples, supplied: rows.length, validated: values.length,
        observed: count('observed'), refused: count('refused'), errors: count('error'), not_applicable: count('not_applicable'), missing,
        complete: missing.length === 0 && count('error') + count('not_applicable') === 0 && values.every(v => v.matched) };
    const command = values.filter(v => v.command_cost !== null);
    const effects = { known: !!values.length, command_samples: command.length,
        commands_accepted: sum(command, r => r.commands_accepted), command_cost: distribution(command.map(r => r.command_cost)),
        resources: [0, 1].map(side => ({ side, ...Object.fromEntries(resources.map(k => [k,
            Object.fromEntries(['decrease', 'recovery', 'net_decrease'].map(part => [part, {
                total: sum(values, v => v.resources[side][k][part]),
                distribution: distribution(values.map(v => v.resources[side][k][part])),
            }]))])) })),
        details: values.map(v => copy(v.detail)), hidden_random_input: null,
        unknown_samples: count('error') + count('not_applicable') + missing.length };
    return { format: 1, kind: 'mingjiao_force_remaining_report', condition: copy(condition), series,
        coverage, effects, records, elapsed: distribution(known.map(r => r.elapsed)), limitations: [
            '这是未注册消费者准备；纯测试合格不表示112条件、2772正式或215烟雾已经实测。',
            '原命令整数执行成本、受理、技能发动、接口返回与实际效果分开。驱除初态为显式实验输入，不冒充自然染毒。',
            '资源下降／恢复按原setter与登记探针闭账；显式补给不算自然恢复，净变化不代替未观察的局部请求量。',
            '原心跳、自然回调和时间括号需由未来producer实际观察；不能用看门狗或计划延时制造解除。',
            '错误、不适用、缺样及尚未观察的量保留未知；有限实验资格不证明自然养成、完整NPC自用或平衡强弱。',
        ] };
}

export function mingjiaoForceRemainingMarkdown(summary, originalManifest, originalRows) {
    map(summary); assert.ok(Array.isArray(originalRows), 'original rows required');
    assert.deepEqual(summary, mingjiaoForceRemainingReport(originalRows, summary.condition, originalManifest), 'original-row recomputation required');
    const { coverage: v, effects: e, condition: c } = summary, show = v => v === null ? '未知' : String(v);
    const lines = [`### 明教内功差量：${c.parameters.skill} / ${c.parameters.panel}`, '',
        `条件：\`${c.id}\`；${summary.series.smoke ? '烟雾，不并入正式' : '正式计划'}。`,
        `记录 ${v.supplied}/${v.planned}；观察 ${v.observed}、拒绝 ${v.refused}、错误 ${v.errors}、不适用 ${v.not_applicable}；完整 ${v.complete ? '是' : '否'}。`, '',
        '| 角色 | 资源 | 实际下降 | 恢复 | 净下降 |', '| --- | --- | ---: | ---: | ---: |'];
    for (const side of e.resources) for (const k of resources) lines.push(`| ${side.side} | ${k} | ${show(side[k].decrease.total)} | ${show(side[k].recovery.total)} | ${show(side[k].net_decrease.total)} |`);
    lines.push('', `原命令受理 ${show(e.commands_accepted)}；隐藏随机输入：未知。`,
        '核验后的原返回、进度、回调与异常处置：', '```json', JSON.stringify(e.details, null, 2), '```', '',
        ...summary.limitations.map(v => '- ' + v));
    return lines.join('\n');
}
