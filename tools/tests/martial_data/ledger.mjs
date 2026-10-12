// Append-only evidence for one fixed source/fixture/condition series.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sha256 } from './inventory.mjs';

const outcomes = new Set(['observed', 'refused', 'error', 'not_applicable']);
const idPattern = /^[a-z][a-z0-9_-]*$/;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const json = path => JSON.parse(readFileSync(path, 'utf8'));
function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (object(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
    assert.ok(value === null || ['string', 'boolean'].includes(typeof value)
        || (typeof value === 'number' && Number.isFinite(value)), '台账只接受有限 JSON 值');
    return value;
}
export const digest = value => sha256(JSON.stringify(canonical(value)));

function atomicNew(path, value) {
    assert.ok(!existsSync(path), `记录已存在，禁止覆盖：${path}`);
    const pending = `${path}.${randomUUID()}.pending`;
    writeFileSync(pending, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    // Single writer per series. An interrupted pending file is retained, never counted.
    assert.ok(!existsSync(path), '同一系列不支持并发写入');
    renameSync(pending, path);
}

function validateConditions(conditions) {
    assert.ok(Array.isArray(conditions) && conditions.length > 0, '条件清单不能为空');
    assert.equal(new Set(conditions.map(c => c.id)).size, conditions.length, '条件 ID 重复');
    for (const condition of conditions) {
        assert.ok(idPattern.test(condition.id), '条件 ID 使用小写字母开头的字母/数字/下划线/短横线');
        assert.ok(['weapon', 'school', 'skill'].includes(condition.stage), '阶段无效');
        assert.ok(typeof condition.entry_id === 'string' && condition.entry_id.length > 0, '缺少源码入口 ID');
        assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0, '样本数必须是正整数');
        assert.ok(object(condition.parameters), '必须记录实际参数');
        assert.ok(typeof condition.method === 'string' && condition.method, '必须记录观察方法');
    }
    digest(conditions);
}

export function createSeries(directory, { inventory, catalog, conditions, execution, teachingEntries = [], sceneEntries = [], npcEntries = [] }) {
    assert.equal(inventory.source_fingerprint, catalog.source_fingerprint, '清单与关系索引的源码不同');
    validateConditions(conditions);
    assert.ok(object(execution) && Object.keys(execution).length > 0, '缺少驱动/夹具版本');
    const entries = catalog.skills.flatMap(skill => [
        { id: skill.path, path: skill.path, role: 'file', sha256: skill.sha256 },
        ...skill.entries.map(entry => ({ id: entry.id, path: skill.path, role: entry.role, sha256: skill.sha256 })),
    ]);
    for (const entry of teachingEntries) {
        assert.equal(entry.role, 'teaching', '附加入口必须是教学来源');
        assert.ok(entry.path.startsWith('kungfu/class/') && Number.isSafeInteger(entry.line)
            && entry.line > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entry.function), '教学入口定位无效');
        assert.equal(entry.id, `${entry.path}:${entry.line}:${entry.function}`, '教学入口身份不一致');
        assert.ok(inventory.files?.some(f => f.path === entry.path && f.sha256 === entry.sha256),
            '教学入口不属于源码快照');
        assert.ok(!entries.some(e => e.id === entry.id), '教学入口重复');
        entries.push(entry);
    }
    for (const entry of sceneEntries) {
        assert.equal(entry.role, 'scene', '场景来源不得冒充武学或教学');
        assert.ok(/^d\/[a-z0-9_/-]+\.(?:c|lpc)$/.test(entry.path)
            && !entry.path.split('/').includes('..') && Number.isSafeInteger(entry.line) && entry.line > 0
            && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entry.function), '场景入口定位无效');
        assert.equal(entry.id, `${entry.path}:${entry.line}:${entry.function}`, '场景入口身份不一致');
        assert.match(entry.sha256, /^[a-f0-9]{64}$/);
        assert.equal(execution.source_files?.[entry.path], entry.sha256, '场景入口不属于公开源码快照');
        assert.ok(!entries.some(e => e.id === entry.id), '场景入口重复');
        entries.push(entry);
    }
    for (const entry of npcEntries) {
        assert.equal(entry.role, 'npc', 'NPC 配装不得冒充武学或教学入口');
        assert.equal(entry.id, entry.path);
        assert.match(entry.path, /^kungfu\/class\/(?:emei\/[a-z0-9_-]+\.(?:c|lpc)|gumu\/(?:li|lin|longnv|yang)\.c)$/);
        assert.ok(inventory.files?.some(f => f.path === entry.path && f.sha256 === entry.sha256),
            'NPC 来源不属于当前源码快照');
        assert.ok(!entries.some(e => e.id === entry.id), 'NPC 来源重复');
        entries.push(entry);
    }
    for (const condition of conditions) assert.ok(entries.some(entry => entry.id === condition.entry_id),
        `条件引用的入口不在源码清单中：${condition.entry_id}`);
    const identity = { source_fingerprint: inventory.source_fingerprint,
        dictionary_sha256: catalog.dictionary_sha256, entries_sha256: digest(entries), execution, conditions };
    const manifest = { format: 1, kind: 'martial_data_series', created: new Date().toISOString(),
        identity, fingerprint: digest(identity), entries, versions: inventory.versions };
    assert.ok(!existsSync(join(directory, 'series.json')), '已有系列，使用续跑而不是覆盖');
    mkdirSync(join(directory, 'samples'), { recursive: true });
    mkdirSync(join(directory, 'findings'), { recursive: true });
    atomicNew(join(directory, 'series.json'), manifest);
    return manifest;
}

export function openSeries(directory, expectedIdentity) {
    const manifest = json(join(directory, 'series.json'));
    assert.equal(manifest.format, 1, '台账格式不匹配');
    assert.equal(manifest.kind, 'martial_data_series');
    assert.equal(manifest.fingerprint, digest(manifest.identity), '系列清单被改写');
    assert.equal(manifest.identity.entries_sha256, digest(manifest.entries), '覆盖清单被改写');
    validateConditions(manifest.identity.conditions);
    if (expectedIdentity) assert.equal(digest(expectedIdentity), manifest.fingerprint,
        '源码、字典、驱动、夹具或参数不同，必须新建系列');
    return manifest;
}

function validateSample(manifest, sample) {
    assert.equal(sample.fingerprint, manifest.fingerprint, '样本来自不同系列');
    const condition = manifest.identity.conditions.find(c => c.id === sample.condition_id);
    assert.ok(condition, '未知条件');
    assert.equal(sample.condition_sha256, digest(condition), '样本参数不同');
    assert.ok(Number.isSafeInteger(sample.index) && sample.index >= 0 && sample.index < condition.samples, '样本编号越界');
    assert.ok(outcomes.has(sample.outcome), '样本状态无效');
    assert.ok(object(sample.raw) && Object.keys(sample.raw).length > 0, '不能缺少原始观察证据');
    assert.equal(sample.raw_sha256, digest(sample.raw), '原始观察证据不一致');
    if (sample.outcome !== 'observed') assert.ok(typeof sample.reason === 'string' && sample.reason.trim(),
        '拒绝/错误/不适用必须有理由');
    return condition;
}

export function recordSample(directory, manifest, { condition_id, index, outcome, reason = '', raw }) {
    const condition = manifest.identity.conditions.find(c => c.id === condition_id);
    assert.ok(condition, '未知条件');
    const record = { format: 1, fingerprint: manifest.fingerprint, condition_id,
        condition_sha256: digest(condition), index, outcome, reason, raw,
        raw_sha256: digest(raw), recorded: new Date().toISOString() };
    validateSample(manifest, record);
    atomicNew(join(directory, 'samples', `${condition_id}.${index}.json`), record);
    return record;
}

export function readSamples(directory, manifest) {
    const rows = [], seen = new Set();
    for (const name of readdirSync(join(directory, 'samples')).filter(name => name.endsWith('.json')).sort()) {
        const row = json(join(directory, 'samples', name));
        validateSample(manifest, row);
        const key = `${row.condition_id}.${row.index}`;
        assert.ok(!seen.has(key), '存在重复样本'); seen.add(key);
        assert.equal(name, key + '.json', '样本文件身份不匹配');
        rows.push(row);
    }
    return rows;
}

export function coverage(directory) {
    const manifest = openSeries(directory), rows = readSamples(directory, manifest);
    const conditions = manifest.identity.conditions.map(condition => {
        const samples = rows.filter(row => row.condition_id === condition.id);
        const counts = Object.fromEntries([...outcomes].map(outcome => [outcome, samples.filter(row => row.outcome === outcome).length]));
        const missing = Array.from({ length: condition.samples }, (_, index) => index)
            .filter(index => !samples.some(row => row.index === index));
        return { id: condition.id, entry_id: condition.entry_id, stage: condition.stage,
            planned: condition.samples, recorded: samples.length, counts, missing,
            normal_effect: counts.observed === condition.samples ? 'sampled' : 'incomplete',
            observations_denominator: counts.observed, attempts_denominator: samples.length };
    });
    const entries = manifest.entries.map(entry => {
        const cases = conditions.filter(condition => condition.entry_id === entry.id);
        return { ...entry, conditions: cases.map(c => c.id), status: cases.length ? 'configured' : 'not_configured',
            sampled_conditions: cases.filter(c => c.normal_effect === 'sampled').length };
    });
    const pendingFiles = readdirSync(join(directory, 'samples')).filter(name => name.endsWith('.pending'));
    return { fingerprint: manifest.fingerprint, conditions, entries, pending_files: pendingFiles,
        totals: { entries: entries.length, configured_entries: entries.filter(e => e.conditions.length).length,
            conditions: conditions.length, sampled_conditions: conditions.filter(c => c.normal_effect === 'sampled').length,
            planned_samples: conditions.reduce((n, c) => n + c.planned, 0), recorded_samples: rows.length,
            observed: rows.filter(r => r.outcome === 'observed').length,
            refused: rows.filter(r => r.outcome === 'refused').length,
            errors: rows.filter(r => r.outcome === 'error').length,
            not_applicable: rows.filter(r => r.outcome === 'not_applicable').length },
    };
}

export function recordFinding(directory, manifest, finding) {
    assert.ok(idPattern.test(finding.id), '缺陷 ID 无效');
    assert.ok(['suspected', 'confirmed'].includes(finding.certainty), '须区分待查与确认问题');
    for (const key of ['title', 'expected_basis', 'trigger', 'actual', 'impact']) {
        assert.ok(typeof finding[key] === 'string' && finding[key].trim(), `缺陷缺少 ${key}`);
    }
    assert.ok(Array.isArray(finding.sources) && finding.sources.length > 0, '缺少源码证据');
    for (const source of finding.sources) {
        assert.ok(typeof source.path === 'string' && /^[a-f0-9]{64}$/.test(source.sha256)
            && Number.isSafeInteger(source.line) && source.line > 0, '源码证据须含路径/行号/hash');
        assert.ok(manifest.entries.some(entry => entry.path === source.path && entry.sha256 === source.sha256)
            || manifest.identity.execution.source_files?.[source.path] === source.sha256,
        '缺陷源码不属于本系列快照');
    }
    assert.ok(Array.isArray(finding.samples), '须记录影响/复现样本');
    const samples = readSamples(directory, manifest);
    for (const ref of finding.samples) assert.ok(samples.some(row => `${row.condition_id}.${row.index}` === ref), '缺陷引用的样本缺失');
    if (finding.certainty === 'confirmed') assert.ok(finding.samples.length > 0, '实测确认问题必须有复现样本');
    const record = { ...finding, fingerprint: manifest.fingerprint, status: 'open_deferred', recorded: new Date().toISOString() };
    atomicNew(join(directory, 'findings', finding.id + '.json'), record);
    return record;
}

export function coverageMarkdown(report) {
    const lines = ['# 武学采集覆盖', '', '仅表示既定条件下的采样状态，不是全部武学已测或强弱排名。', '',
        '| 条件 | 已记录/计划 | 正常观察 | 拒绝 | 错误 | 不适用 | 正常效果 |',
        '| --- | ---: | ---: | ---: | ---: | ---: | --- |'];
    for (const c of report.conditions) lines.push(`| ${c.id} | ${c.recorded}/${c.planned} | ${c.counts.observed} | ${c.counts.refused} | ${c.counts.error} | ${c.counts.not_applicable} | ${c.normal_effect} |`);
    lines.push('', `全部清单条目 ${report.totals.entries}；已配置 ${report.totals.configured_entries}。`,
        `未完成写入文件 ${report.pending_files.length}，不计入完成样本。`, '',
        '拒绝和错误不进入正常效果分母；正常观察不保证语义或夹具正确，须结合原始记录审查。', '');
    return lines.join('\n');
}
