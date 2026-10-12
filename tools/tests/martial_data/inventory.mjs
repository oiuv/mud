// Offline lexical evidence, not an LPC compiler or proof of runtime behavior.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const slash = path => path.replaceAll('\\', '/');
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const ignored = new Set(['whitespace', 'comment', 'directive']);
const opens = new Map([['(', ')'], ['{', '}'], ['[', ']'], ['(:', ':)']]);
const closes = new Set(opens.values());
const callsOfInterest = new Set([
    'set_skill', 'map_skill', 'prepare_skill', 'create_family', 'set_name',
    'teach_pfm', 'teach_exert', 'teach_skill', 'perform_action', 'exert_function',
    'query_skill', 'query_skill_mapped', 'query_skill_prepared', 'load_object',
    'clone_object', 'call_other', 'call_out', 'start_call_out', 'carry_object', 'set',
]);

function location(source, start, end) {
    const before = source.slice(0, start);
    return { start, end, line: before.split('\n').length,
        column: start - before.lastIndexOf('\n'), text: source.slice(start, end) };
}

function pairs(tokens) {
    const stack = [], matched = new Map(), issues = [];
    for (let i = 0; i < tokens.length; i++) {
        const text = tokens[i].text;
        if (opens.has(text)) stack.push(i);
        else if (closes.has(text)) {
            const top = stack.at(-1);
            if (top === undefined || opens.get(tokens[top].text) !== text) {
                issues.push({ reason: 'unmatched_delimiter', offset: tokens[i].start });
            } else { stack.pop(); matched.set(top, i); }
        }
    }
    for (const i of stack) issues.push({ reason: 'unclosed_delimiter', offset: tokens[i].start });
    return { matched, issues };
}

export function literal(tokens, source) {
    const raw = tokens.length ? source.slice(tokens[0].start, tokens.at(-1).end) : '';
    if (tokens.length === 1 && tokens[0].kind === 'string') {
        try { return { kind: 'string', value: JSON.parse(tokens[0].text), raw }; }
        catch { /* LPC-only escapes remain expressions; never eval source. */ }
    }
    if (/^-?\d+$/.test(tokens.map(t => t.text).join('')) && tokens.length <= 2) {
        const value = Number(tokens.map(t => t.text).join(''));
        if (Number.isSafeInteger(value)) return { kind: 'integer', value, raw };
    }
    return { kind: 'expression', raw };
}

function argumentsOf(tokens, open, close, matched, source) {
    const args = [];
    let start = open + 1;
    for (let i = start; i < close; i++) {
        if (matched.has(i)) { i = matched.get(i); continue; }
        if (tokens[i].text === ',') { args.push(literal(tokens.slice(start, i), source)); start = i + 1; }
    }
    if (start < close) args.push(literal(tokens.slice(start, close), source));
    return args;
}

export function scanSource(source) {
    const all = tokenize(source);
    const rawTokens = all.filter(token => !ignored.has(token.kind));
    const tokens = [];
    // LPC allows whitespace in functional delimiters; tokenizer may split `(\n :`.
    for (let i = 0; i < rawTokens.length; i++) {
        const token = rawTokens[i], next = rawTokens[i + 1];
        if ((token.text === '(' && next?.text === ':') || (token.text === ':' && next?.text === ')')) {
            tokens.push({ ...token, text: token.text + next.text, end: next.end }); i++;
        } else tokens.push(token);
    }
    const { matched, issues } = pairs(tokens);
    for (const token of all) {
        if (token.unterminated || token.kind === 'unknown') {
            issues.push({ reason: token.unterminated ? 'unterminated_token' : 'unknown_token',
                offset: token.start, text: token.text.slice(0, 80) });
        }
    }
    const functions = [], calls = [], inherits = [], directives = [], arrays = [];
    let declarationStart = 0;
    // Skip global initializers as complete groups; only top-level declarations are functions.
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.text === ';') { declarationStart = i + 1; continue; }
        if (token.text === 'inherit') {
            const end = tokens.findIndex((t, index) => index > i && t.text === ';');
            if (end !== -1) inherits.push({ ...literal(tokens.slice(i + 1, end), source),
                ...location(source, token.start, tokens[end].end) });
        }
        if (token.kind === 'identifier' && tokens[i + 1]?.text === '='
            && tokens[i + 2]?.text === '(' && tokens[i + 3]?.text === '{' && matched.has(i + 3)) {
            const end = matched.get(i + 3);
            arrays.push({ name: token.text, values: argumentsOf(tokens, i + 3, end, matched, source),
                ...location(source, token.start, tokens[matched.get(i + 2) ?? end].end) });
        }
        if (token.kind === 'identifier' && tokens[i + 1]?.text === '(' && matched.has(i + 1)) {
            const endArgs = matched.get(i + 1), openBody = endArgs + 1;
            const prefix = tokens.slice(declarationStart, i);
            if (tokens[openBody]?.text === '{' && matched.has(openBody)
                && prefix.some(t => t.kind === 'type') && !prefix.some(t => t.text === '=')) {
                const endBody = matched.get(openBody);
                functions.push({ name: token.text,
                    ...location(source, token.start, tokens[endBody].end),
                    signature: source.slice(tokens[declarationStart].start, tokens[openBody].start).trim(),
                    body_start: tokens[openBody].start, body_end: tokens[endBody].end });
                i = endBody; declarationStart = i + 1; continue;
            }
        }
        if (matched.has(i)) i = matched.get(i);
    }
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!callsOfInterest.has(token.text)) continue;
        const owner = functions.find(fn => token.start > fn.body_start && token.end < fn.body_end);
        if (!owner) continue;
        let args, end, form;
        if (tokens[i + 1]?.text === '(' && matched.has(i + 1)) {
            end = matched.get(i + 1);
            args = argumentsOf(tokens, i + 1, end, matched, source); form = 'call';
        } else if (tokens[i - 1]?.text === '(:' && tokens[i + 1]?.text === ',') {
            // Functional closure is a scheduled reference, NOT an executed call.
            end = matched.get(i - 1);
            if (end === undefined) continue;
            args = argumentsOf(tokens, i + 1, end, matched, source); form = 'functional_reference';
        } else continue;
        if (token.text === 'set' && !(args[0]?.kind === 'string'
            && /^(?:can_perform\/|can_exert\/|inquiry$|family)/.test(args[0].value))) continue;
        calls.push({ name: token.text, function: owner.name, form, args,
            dispatch: ['->', '::'].includes(tokens[i - 1]?.text) ? tokens[i - 1].text : 'local',
            receiver: tokens[i - 1]?.text === '->' ? tokens[i - 2]?.text : null,
            ...location(source, token.start, tokens[end].end) });
    }
    for (const token of all.filter(t => t.kind === 'directive')) {
        const match = /^#\s*(\w+)\s*([\s\S]*)/.exec(token.text);
        if (!match) continue;
        const item = { kind: match[1], ...location(source, token.start, token.end) };
        if (item.kind === 'include') {
            const include = /^\s*([<"])([^>"\r\n]+)[>"]/.exec(match[2]);
            if (include) { item.target = include[2]; item.local = include[1] === '"'; }
        }
        directives.push(item);
    }
    return { functions, calls, inherits, directives, arrays, lexical_issues: issues };
}

export function isInside(root, path) {
    const rel = relative(root, path);
    return !isAbsolute(rel) && rel !== '..' && !rel.startsWith('..\\') && !rel.startsWith('../');
}

export function listSources(root, directory) {
    const result = [];
    function walk(path) {
        // Refuse symlinks rather than silently scanning outside the stated public source set.
        assert.ok(!lstatSync(path).isSymbolicLink(), `源码目录不能是链接：${path}`);
        assert.ok(isInside(root, realpathSync(path)), `源码越界：${path}`);
        for (const item of readdirSync(path, { withFileTypes: true })) {
            if (item.name.startsWith('.')) continue;
            const next = join(path, item.name);
            assert.ok(!item.isSymbolicLink(), `源码包含链接：${next}`);
            if (item.isDirectory()) walk(next);
            else if (/\.(c|lpc|h)$/.test(item.name)) result.push(slash(relative(root, next)));
        }
    }
    walk(join(root, directory));
    return result.sort(compare);
}

const permittedHeader = path => /^(?:kungfu\/|include\/|inherit\/|feature\/|std\/|mudcore\/(?:include|system|inherit)\/)/.test(path)
    && path.endsWith('.h') && !path.split('/').some(part => part.startsWith('.'));

export function buildInventory(root) {
    root = realpathSync(root);
    const skills = listSources(root, 'kungfu/skill'), classes = listSources(root, 'kungfu/class');
    const primary = [...skills, ...classes].sort(compare);
    const files = new Map(), queue = [...primary, 'include/globals.h', 'include/weapon.h'];
    for (let i = 0; i < queue.length; i++) {
        const path = queue[i];
        if (files.has(path)) continue;
        const resolved = realpathSync(join(root, path));
        assert.ok(isInside(root, resolved), `源码越界：${path}`);
        if (!primary.includes(path)) assert.ok(permittedHeader(slash(relative(root, resolved))),
            `头文件链接超出公开范围：${path}`);
        const bytes = readFileSync(resolved), source = bytes.toString('utf8');
        const scanned = scanSource(source);
        const item = { path, sha256: sha256(bytes), bytes: bytes.length,
            lines: source.split('\n').length, scope: skills.includes(path) ? 'skill'
                : classes.includes(path) ? 'class' : 'header_dependency', ...scanned };
        files.set(path, item);
        for (const include of item.directives.filter(d => d.kind === 'include')) {
            if (!include.target) { include.status = 'dynamic'; continue; }
            const candidates = include.target.startsWith('/') ? [include.target.slice(1)] : [
                ...(include.local ? [slash(join(dirname(path), include.target))] : []),
                'include/' + include.target, 'mudcore/include/' + include.target,
            ];
            include.resolved = candidates.map(candidate => slash(relative(root, resolve(root, candidate))))
                .find(candidate => permittedHeader(candidate) && existsSync(join(root, candidate)));
            include.status = include.resolved ? 'located_not_preprocessed' : 'unresolved';
            if (include.resolved) queue.push(include.resolved);
        }
    }
    const sorted = [...files.values()].sort((a, b) => compare(a.path, b.path));
    assert.deepEqual(sorted.filter(f => f.scope !== 'header_dependency').map(f => f.path), primary,
        '文件清单未闭合');
    const groups = {};
    for (const path of classes) {
        const group = path.split('/')[2];
        groups[group] ??= { lpc: 0, headers: 0 };
        groups[group][path.endsWith('.h') ? 'headers' : 'lpc']++;
    }
    return { format: 1, kind: 'lexical_inventory',
        caveat: '静态候选，未预处理/执行；条件分支、宏、继承与教学资格须核验。扫描不等于效果实测。',
        totals: {
            skill_top_level: skills.filter(p => !p.endsWith('.h') && p.split('/').length === 3).length,
            skill_nested: skills.filter(p => !p.endsWith('.h') && p.split('/').length > 3).length,
            skill_headers: skills.filter(p => p.endsWith('.h')).length,
            class_lpc: classes.filter(p => !p.endsWith('.h')).length,
            class_headers: classes.filter(p => p.endsWith('.h')).length,
            class_directory_groups: Object.keys(groups).length,
            related_headers: sorted.filter(f => f.scope === 'header_dependency').length,
        }, groups, files: sorted,
        source_fingerprint: sha256(JSON.stringify(sorted.map(f => [f.path, f.sha256]))),
    };
}

export function collectVersions(root, driver, cwd) {
    const git = (directory, args) => execFileSync('git', ['-C', directory, ...args],
        { encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024 }).trim();
    driver = realpathSync(driver);
    // No config argument: mainlib.cc exits at usage before init_main()/vm_start().
    const version = spawnSync(driver, [], { cwd, windowsHide: true, encoding: 'utf8', timeout: 10000 });
    assert.ok(!version.error, `驱动版本读取失败：${version.error?.message}`);
    const output = (version.stdout || '') + (version.stderr || '');
    const name = output.match(/Version:\s*(fluffos[^\r\n]*)/i)?.[1];
    assert.ok(name && /Usage:/.test(output), '驱动未返回预期的无配置版本/用法信息');
    return { commit: git(root, ['rev-parse', 'HEAD']),
        mudcore: git(join(root, 'mudcore'), ['rev-parse', 'HEAD']),
        driver: { path: driver, sha256: sha256(readFileSync(driver)), version: name },
        source_changes: git(root, ['diff', 'HEAD', '--name-only', '--', 'kungfu', 'include', 'inherit', 'feature', 'std']).split('\n').filter(Boolean),
        node: process.version,
        tokenizer: ['tokenizer.mjs', 'lpc-grammar.json'].map(name => ({
            path: 'fluffos/tools/lpc-syntax/' + name,
            sha256: sha256(readFileSync(join(root, 'fluffos/tools/lpc-syntax', name))),
        })),
    };
}

export function inventoryMarkdown(inventory) {
    const total = inventory.totals;
    const lines = ['# 武学采集源码清单', '', `源码提交：\`${inventory.versions.commit}\`。`, '',
        '本清单是词法定位，不是编译、施展成功或平衡性结论；目录分组不等于门派。', '',
        '| 范围 | 数量 |', '| --- | ---: |',
        `| 顶层技能 LPC | ${total.skill_top_level} |`,
        `| 下级技能 LPC | ${total.skill_nested} |`,
        `| 技能头文件 | ${total.skill_headers} |`,
        `| class LPC | ${total.class_lpc} |`,
        `| class 头文件 | ${total.class_headers} |`,
        `| class 目录分组 | ${total.class_directory_groups} |`,
        `| 额外头文件依赖 | ${total.related_headers} |`, '',
        '| class 分组 | LPC | 头文件 |', '| --- | ---: | ---: |'];
    for (const [group, count] of Object.entries(inventory.groups)) lines.push(`| ${group} | ${count.lpc} | ${count.headers} |`);
    const issues = inventory.files.flatMap(f => f.lexical_issues.map(issue => ({ path: f.path, ...issue })));
    const unresolved = inventory.files.flatMap(f => f.directives.filter(d => d.kind === 'include' && d.status !== 'located_not_preprocessed'));
    lines.push('', `词法待核查项：${issues.length}；未定位/动态 include：${unresolved.length}。`, '',
        '这些是采集器的未解析项，不自动登记为游戏代码错误。原文、位置及 hash 保存在 inventory.json。', '');
    return lines.join('\n');
}
