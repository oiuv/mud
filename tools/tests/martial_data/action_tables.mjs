// Static action-table evidence. Never evaluate LPC expressions or rank skills.
import assert from 'node:assert/strict';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { isInside, sha256 } from './inventory.mjs';
import { mappingFields } from './school_relations.mjs';
import { newOutput, root } from '../../collect_martial_data.mjs';

const fields = ['force', 'attack', 'dodge', 'parry', 'damage', 'lvl'];
const ignored = new Set(['comment', 'directive', 'whitespace']);
const tokensOf = source => tokenize(source).filter(t => !ignored.has(t.kind));
const unique = values => [...new Set(values)].sort();

function arrayRows(array) {
    const tokens = tokensOf(array.text), rows = [];
    assert.equal(tokens[1]?.text, '=');
    assert.equal(tokens[2]?.text, '(');
    assert.equal(tokens[3]?.text, '{');
    assert.equal(tokens.at(-2)?.text, '}');
    assert.equal(tokens.at(-1)?.text, ')');
    let start = 4, depth = 0;
    for (let i = start; i < tokens.length - 1; i++) {
        const t = tokens[i];
        if ((t.text === ',' || i === tokens.length - 2) && depth === 0) {
            if (i > start) {
                const first = tokens[start], last = tokens[i - 1];
                rows.push({ start: array.start + first.start, end: array.start + last.end,
                    line: array.line + array.text.slice(0, first.start).split('\n').length - 1,
                    raw: array.text.slice(first.start, last.end) });
            }
            start = i + 1;
            continue;
        }
        if (['(', '[', '{', '(:'].includes(t.text)) depth++;
        else if ([')', ']', '}', ':)'].includes(t.text)) depth--;
        assert.ok(depth >= 0, '动作数组分隔符不完整');
    }
    assert.equal(depth, 0, '动作数组分隔符不完整');
    assert.deepEqual(rows.map(r => r.raw), array.values.map(v => v.raw), '动作数组与原清单不一致');
    return rows;
}

function contextCalls(raw) {
    const tokens = tokensOf(raw), calls = [];
    for (let i = 0; i < tokens.length - 1; i++) {
        if (['this_player', 'this_object', 'random'].includes(tokens[i].text)
            && tokens[i + 1].text === '(') calls.push(tokens[i].text);
    }
    return unique(calls);
}

export function actionTables(inventory, catalog) {
    assert.equal(inventory.source_fingerprint, catalog.source_fingerprint, '动作表与目录来源版本不同');
    const byPath = new Map(catalog.skills.map(s => [s.path, s]));
    const files = inventory.files.filter(f => f.scope === 'skill' && /\.(c|lpc)$/.test(f.path)).map(file => {
        const skill = byPath.get(file.path);
        assert.ok(skill && skill.sha256 === file.sha256, '技能来源不在同一清单：' + file.path);
        const tables = [];
        for (const array of file.arrays) {
            const rows = arrayRows(array).map((row, index) => {
                let values = null, error = null;
                try { values = mappingFields(row.raw); }
                catch (e) { error = e.message.replace('教学 mapping', '动作 mapping'); }
                return { index, ...row, fields: values, unresolved: error,
                    initialization_calls: contextCalls(row.raw) };
            });
            if (!/^actions?$/.test(array.name) && !rows.some(r => r.fields
                && (Object.hasOwn(r.fields, 'action') || Object.hasOwn(r.fields, 'damage_type')))) continue;
            const numeric = Object.fromEntries(fields.map(key => {
                const literals = rows.filter(r => r.fields?.[key]?.kind === 'integer').map(r => r.fields[key].value);
                return [key, { literal_count: literals.length,
                    min: literals.length ? Math.min(...literals) : null,
                    max: literals.length ? Math.max(...literals) : null,
                    expression_count: rows.filter(r => r.fields?.[key]?.kind === 'expression').length,
                    other_literal_count: rows.filter(r => r.fields?.[key]?.kind === 'string').length,
                    absent_count: rows.filter(r => r.fields && !Object.hasOwn(r.fields, key)).length,
                    unresolved_rows: rows.filter(r => !r.fields).length }];
            }));
            tables.push({ name: array.name, line: array.line, start: array.start, end: array.end,
                declaration: array.text, rows, numeric,
                keys: unique(rows.flatMap(r => Object.keys(r.fields ?? {}))),
                initialization_calls: unique(rows.flatMap(r => r.initialization_calls)),
                status: 'static_global_initializer_not_runtime_values' });
        }
        return { path: file.path, sha256: file.sha256, id: skill.id,
            dictionary_name: skill.dictionary_name?.name ?? null, tables,
            query_action: file.functions.filter(f => f.name === 'query_action'),
            status: tables.length ? 'global_tables_indexed' : 'no_global_table_identified' };
    });
    const tables = files.flatMap(f => f.tables), rows = tables.flatMap(t => t.rows);
    return { format: 1, kind: 'static_action_tables', source_fingerprint: inventory.source_fingerprint,
        dictionary_sha256: catalog.dictionary_sha256, files,
        totals: { skill_files: files.length, files_with_tables: files.filter(f => f.tables.length).length,
            tables: tables.length, rows: rows.length, parsed_mapping_rows: rows.filter(r => r.fields).length,
            unresolved_rows: rows.filter(r => !r.fields).length,
            files_without_global_table: files.filter(f => !f.tables.length).length,
            query_action_declarations: files.reduce((n, f) => n + f.query_action.length, 0),
            files_with_initializer_context: files.filter(f => f.tables.some(t => t.initialization_calls.length)).length,
            rows_with_initializer_context: rows.filter(r => r.initialization_calls.length).length,
            rows_with_this_player: rows.filter(r => r.initialization_calls.includes('this_player')).length,
            rows_with_dmage: rows.filter(r => Object.hasOwn(r.fields ?? {}, 'dmage')).length },
        limits: [
            '只提取原清单中全局初始化数组；函数内动态动作、继承、宏展开和运行期改写未求值。',
            '无全局表不等于无普通攻击；query_action 原文保留，仍需核对真实选择与调用。',
            '字段缺失、无法解析、表达式和非整数字面量分别保留，均不填零；dmage 等原键不自动纠正。',
            '最小/最大值只覆盖整数字面量，不包含随机/角色相关表达式，也不是最终命中、伤害或成长范围。',
            '初始化中的 this_player/this_object/random 只列依赖线索；加载上下文及实际取值另需真实驱动验证。',
        ] };
}

export function verifyActionSources(repository, inventory) {
    for (const file of inventory.files.filter(f => f.scope === 'skill' && /\.(c|lpc)$/.test(f.path))) {
        const path = realpathSync(join(repository, file.path));
        assert.ok(isInside(repository, path), '动作源码不能越出仓库');
        assert.equal(sha256(readFileSync(path)), file.sha256, '动作源码已变化：' + file.path);
    }
}

export function actionMarkdown(report) {
    const lines = ['# 武学动作表原始系数', '',
        `源码指纹：\`${report.source_fingerprint}\`。仅静态资料，不是战斗效果排名。`, '',
        `检查 ${report.totals.skill_files} 个技能文件，${report.totals.files_with_tables} 个文件有候选全局动作表；`
            + `${report.totals.tables} 张表、${report.totals.rows} 行，未解析行 ${report.totals.unresolved_rows}。`, '',
        ...report.limits.map(s => '- ' + s), '',
        '| 文件 | 表 / 行 | force | attack | dodge | parry | damage | lvl | 初始化线索 |',
        '| --- | --- | --- | --- | --- | --- | --- | --- | --- |'];
    const range = x => `${x.literal_count ? `${x.min}…${x.max}` : '无字面量'}`
        + (x.expression_count ? `；表达式 ${x.expression_count}` : '')
        + (x.other_literal_count ? `；非整数字面量 ${x.other_literal_count}` : '')
        + (x.absent_count ? `；缺 ${x.absent_count}` : '')
        + (x.unresolved_rows ? `；未解析 ${x.unresolved_rows}` : '');
    for (const f of report.files) for (const t of f.tables) {
        lines.push(`| ${f.path}:${t.line} | ${t.name} / ${t.rows.length} | ${fields.map(k => range(t.numeric[k])).join(' | ')} | ${t.initialization_calls.join(', ') || '无所列调用'} |`);
    }
    lines.push('', '完整 JSON 保存每一行原文、字段、路径、hash 和位置，以及本地 query_action 原文。', '');
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    try {
        assert.ok(process.argv.length === 3 || process.argv.length === 4,
            '用法：node tools/tests/martial_data/action_tables.mjs 已有清单目录 [新的仓库外报告目录]');
        const input = realpathSync(process.argv[2]);
        const read = name => JSON.parse(readFileSync(join(input, name), 'utf8'));
        const inventory = read('inventory.json');
        verifyActionSources(root, inventory);
        const report = actionTables(inventory, read('catalog.json')), output = newOutput(process.argv[3]);
        writeFileSync(join(output, 'action-tables.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
        writeFileSync(join(output, 'action-tables.md'), actionMarkdown(report), { flag: 'wx' });
        console.log('动作表资料：' + output);
        console.log(JSON.stringify(report.totals));
    } catch (e) { console.error('动作表整理失败：' + e.message); process.exitCode = 1; }
}
