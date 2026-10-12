// Static scheduling evidence only. Never run callbacks or alter a live series.
import assert from 'node:assert/strict';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput, root } from '../../collect_martial_data.mjs';
import { verifyActionSources } from './action_tables.mjs';

const schedulers = new Set(['call_out', 'start_call_out']);
const evidence = (file, item) => ({ path: file.path, sha256: file.sha256,
    line: item.line, column: item.column, start: item.start, end: item.end, text: item.text });

function callbackReference(file, call) {
    const arg = call.args[0];
    if (call.name === 'call_out' && call.dispatch !== '->' && arg?.kind === 'string') {
        return { path: file.path, name: arg.value, form: 'local_string' };
    }
    if (arg?.kind !== 'expression') return null;
    // Only a direct function-binding closure is resolved. An expression closure
    // can perform arbitrary work and is deliberately left for source review.
    const head = /^\(\s*:\s*([A-Za-z_]\w*)\s*(?=,|:\s*\))/.exec(arg.raw);
    if (!head) return null;
    if (head[1] !== 'call_other') return { path: file.path, name: head[1], form: 'local_function_binding' };
    const nested = file.calls.filter(c => c.name === 'call_other' && c.form === 'functional_reference'
        && c.start > call.start && c.end < call.end);
    if (nested.length !== 1) return null;
    const [object, method] = nested[0].args;
    if (method?.kind !== 'string') return null;
    let path = null;
    if (object?.kind === 'expression' && object.raw === '__FILE__') path = file.path;
    else if (object?.kind === 'string' && object.value.startsWith('/')) path = object.value.slice(1);
    return path ? { path, name: method.value, form: 'call_other_function_binding',
        binding: evidence(file, nested[0]) } : null;
}

export function callbackRelations(inventory, catalog) {
    assert.equal(inventory.source_fingerprint, catalog.source_fingerprint, '清单与目录来源不一致');
    const filesByPath = new Map(inventory.files.map(f => [f.path, f]));
    const resolvePath = path => {
        // Absolute literal paths are not normalized across .. or inferred macros.
        if (path.split('/').some(part => part === '..' || part === '.')) return null;
        const candidates = /\.(?:c|lpc)$/.test(path) ? [path] : [path + '.c', path + '.lpc'];
        const found = candidates.filter(p => filesByPath.has(p));
        return found.length === 1 ? filesByPath.get(found[0]) : null;
    };
    const files = catalog.skills.map(skill => {
        const file = filesByPath.get(skill.path);
        assert.equal(file?.sha256, skill.sha256, '技能来源不一致：' + skill.path);
        const schedules = file.calls.filter(c => schedulers.has(c.name) && c.form === 'call').map(call => {
            const reference = callbackReference(file, call);
            const destination = reference ? resolvePath(reference.path) : null;
            const matches = destination?.functions.filter(f => f.name === reference.name) ?? [];
            const status = !reference ? 'dynamic_or_unrecognized_binding'
                : !destination ? 'destination_outside_inventory_or_ambiguous'
                : !matches.length ? 'no_local_declaration_inheritance_unchecked'
                : matches.length > 1 ? 'multiple_declarations_preprocessor_unchecked'
                : 'local_declaration_candidate';
            return { id: `${file.path}:${call.start}`, caller: call.function,
                scheduler: call.name, dispatch: call.dispatch, receiver: call.receiver,
                delay: call.args[1] ?? null, arguments: call.args,
                evidence: evidence(file, call), reference, status,
                declarations: matches.map(fn => evidence(destination, fn)),
                runtime: 'not_observed' };
        });
        return { path: file.path, sha256: file.sha256, id: skill.id,
            dictionary_name: skill.dictionary_name?.name ?? null, schedules };
    });
    const schedules = files.flatMap(f => f.schedules);
    const count = selector => Object.fromEntries([...new Set(schedules.map(selector))].sort()
        .map(key => [key, schedules.filter(s => selector(s) === key).length]));
    return { format: 1, kind: 'static_callback_candidates', source_fingerprint: inventory.source_fingerprint,
        dictionary_sha256: catalog.dictionary_sha256, files,
        totals: { skill_files: files.length, files_with_schedules: files.filter(f => f.schedules.length).length,
            schedules: schedules.length, by_scheduler: count(s => s.scheduler), by_status: count(s => s.status),
            literal_integer_delays: schedules.filter(s => s.delay?.kind === 'integer').length,
            dynamic_delays: schedules.filter(s => s.delay?.kind === 'expression').length },
        limits: [
            '仅整理原清单识别的 call_out/start_call_out 调用；不是完整调用图，不包含所有忙乱函数、心跳或继承接口。',
            '每行是安排回调的源码位置，不是实际触发次数；分支、宏、接收者与闭包绑定须真实驱动核验。',
            '找到本地声明不证明运行可达；未找到声明可能来自继承或清单外对象，不直接列为代码错误。',
            '延迟表达式保留原文，不换算为持续效果时间；不同入口指向同一回调也不合并样本。',
            'call_other 闭包只登记引用，不当作安排时已经执行；动态表达式不猜测目标。',
            '原始记录保存当前源码 hash 和完整位置；不读取存档、不启动游戏、不修改原系列。',
        ] };
}

export function callbackMarkdown(report) {
    const escape = text => String(text).replaceAll('|', '\\|').replaceAll('\n', ' ');
    const rows = ['# 武学延迟回调来源索引', '',
        `源码指纹：\`${report.source_fingerprint}\`。这是静态候选，不是运行期效果。`, '',
        `检查 ${report.totals.skill_files} 个技能文件；${report.totals.files_with_schedules} 个文件含`
            + ` ${report.totals.schedules} 处调度调用。`, '', ...report.limits.map(s => '- ' + s), '',
        '| 调度位置 | 所属函数 | 调度接口 | 延迟原文 | 目标线索 | 定位状态 |',
        '| --- | --- | --- | --- | --- | --- |'];
    for (const file of report.files) for (const s of file.schedules) {
        rows.push('| ' + [file.path + ':' + s.evidence.line, s.caller, s.scheduler,
            s.delay?.raw ?? '缺失', s.reference ? `${s.reference.path}:${s.reference.name}` : '动态/未识别',
            s.status].map(escape).join(' | ') + ' |');
    }
    rows.push('', '完整表达式、声明原文与 hash 见 callback-relations.json；异常候选须另行核查。', '');
    return rows.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    try {
        assert.ok(process.argv.length === 3 || process.argv.length === 4,
            '用法：node tools/tests/martial_data/callback_relations.mjs 已有清单目录 [新的仓库外报告目录]');
        const input = realpathSync(process.argv[2]);
        const read = name => JSON.parse(readFileSync(join(input, name), 'utf8'));
        const inventory = read('inventory.json');
        verifyActionSources(root, inventory);
        const report = callbackRelations(inventory, read('catalog.json')), output = newOutput(process.argv[3]);
        writeFileSync(join(output, 'callback-relations.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
        writeFileSync(join(output, 'callback-relations.md'), callbackMarkdown(report), { flag: 'wx' });
        console.log('回调来源索引：' + output);
        console.log(JSON.stringify(report.totals));
    } catch (error) { console.error('回调索引失败：' + error.message); process.exitCode = 1; }
}
