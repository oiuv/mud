// Source provenance only. This deliberately does not emulate LPC preprocessing or create NPCs.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { isInside, scanSource, sha256 } from './inventory.mjs';
import { newOutput, root } from '../../collect_martial_data.mjs';

const significant = text => tokenize(text).filter(t => !['whitespace', 'comment', 'directive'].includes(t.kind));
const publicSource = path => /^(?:kungfu\/(?:class|skill)\/|inherit\/|feature\/|std\/|include\/|mudcore\/(?:include|inherit|system)\/)/.test(path)
    && /\.(?:c|lpc|h)$/.test(path) && !path.split('/').some(p => p.startsWith('.'));
const ref = (file, item) => ({ path: file.path, sha256: file.sha256,
    line: item.line, start: item.start, end: item.end, text: item.text });

export function macroDeclarations(file) {
    return file.directives.filter(d => d.kind === 'define').flatMap(d => {
        const m = /^#\s*define\s+(\w+)(?:\(([^)]*)\))?[ \t]+([\s\S]*)/.exec(d.text);
        return m ? [{ name: m[1], parameters: m[2] === undefined ? null : m[2].split(',').map(s => s.trim()),
            body: m[3], evidence: ref(file, d) }] : [];
    });
}

export function sourceExpression(expression, macros) {
    const evidence = [];
    function evaluate(text, locals = new Map(), stack = []) {
        const tokens = significant(text); let at = 0;
        function atom() {
            const token = tokens[at++];
            assert.ok(token, '不完整的路径表达式');
            if (token.text === '(') {
                const value = sum(); assert.equal(tokens[at++]?.text, ')'); return value;
            }
            if (token.kind === 'string') return JSON.parse(token.text);
            assert.equal(token.kind, 'identifier', '只处理字符串路径与已声明宏');
            if (locals.has(token.text)) return locals.get(token.text);
            assert.ok(!stack.includes(token.text), '宏循环：' + token.text);
            let args = null;
            if (tokens[at]?.text === '(') {
                at++; args = [];
                if (tokens[at]?.text !== ')') {
                    args.push(sum());
                    while (tokens[at]?.text === ',') { at++; args.push(sum()); }
                }
                assert.equal(tokens[at++]?.text, ')');
            }
            const declarations = macros.filter(m => m.name === token.text
                && (args === null ? m.parameters === null : m.parameters?.length === args.length));
            assert.ok(declarations.length, '宏未定位：' + token.text);
            const values = declarations.map(m => {
                evidence.push(m.evidence);
                return evaluate(m.body, new Map(m.parameters?.map((p, i) => [p, args[i]]) ?? []), [...stack, token.text]);
            });
            assert.equal(new Set(values).size, 1, '条件宏具有不同路径，不能代替预处理选择分支');
            return values[0];
        }
        function sum() {
            let value = atom();
            while (tokens[at]?.text === '+' || tokens[at]?.kind === 'string') {
                if (tokens[at].text === '+') at++;
                value += atom();
            }
            return value;
        }
        const result = sum(); assert.equal(at, tokens.length, '路径表达式不属于字符串拼接子集');
        return result;
    }
    try { return { value: evaluate(expression), evidence, status: 'located_not_preprocessed' }; }
    catch (error) { return { value: null, evidence, status: 'unresolved_expression', reason: error.message }; }
}

export function classDependencies(repository, inventory) {
    repository = realpathSync(repository);
    const original = new Map(inventory.files.map(f => [f.path, f]));
    const files = new Map(), headers = new Map(), edges = [], unresolved = [];
    function locate(path) {
        path = posix.normalize(path);
        if (!publicSource(path) || !existsSync(join(repository, path))) return null;
        const resolved = realpathSync(join(repository, path));
        assert.ok(isInside(repository, resolved), '依赖源码越出仓库：' + path);
        const actual = relative(repository, resolved).replaceAll('\\', '/');
        assert.ok(publicSource(actual), '依赖源码指向非公开位置：' + path);
        return path;
    }
    function read(path) {
        if (files.has(path)) return files.get(path);
        assert.ok(locate(path), '依赖源文件不存在或未授权：' + path);
        const text = readFileSync(join(repository, path), 'utf8');
        const hash = sha256(text);
        if (original.has(path)) assert.equal(original.get(path).sha256, hash, '依赖与原清单版本不符：' + path);
        const file = { path, sha256: hash, ...scanSource(text) };
        files.set(path, file); return file;
    }
    function includeClosure(path, seen = new Set()) {
        if (seen.has(path)) return [];
        seen.add(path);
        const file = read(path), result = [file];
        for (const d of file.directives.filter(d => d.kind === 'include')) {
            const candidates = !d.target ? [] : d.target.startsWith('/') ? [d.target.slice(1)]
                : [...(d.local ? [posix.join(dirname(path).replaceAll('\\', '/'), d.target)] : []),
                    'include/' + d.target, 'mudcore/include/' + d.target];
            const target = candidates.map(locate).find(Boolean);
            if (!headers.has(`${path}:${d.start}`)) {
                headers.set(`${path}:${d.start}`, { owner: path, target: target ?? null, evidence: ref(file, d),
                    status: target ? 'located_not_preprocessed' : 'include_unresolved' });
                if (!target) unresolved.push({ owner: path, reason: 'include_unresolved', evidence: ref(file, d) });
            }
            if (target) result.push(...includeClosure(target, seen));
        }
        return result;
    }
    const global = includeClosure('include/globals.h');
    const roots = inventory.files.filter(f => f.scope === 'class' && !f.path.endsWith('.h')).map(f => f.path);
    const visiting = new Set(), visited = new Set();
    function visit(path) {
        if (visiting.has(path)) { unresolved.push({ owner: path, reason: 'inheritance_cycle' }); return; }
        if (visited.has(path)) return;
        visiting.add(path);
        const file = read(path);
        const sources = [...new Map([...global, ...includeClosure(path)].map(f => [f.path, f])).values()];
        const macros = sources.flatMap(macroDeclarations);
        for (const item of file.inherits) {
            const resolution = sourceExpression(item.raw, macros);
            let target = null;
            if (resolution.value) {
                const base = resolution.value.startsWith('/') ? resolution.value.slice(1)
                    : posix.join(posix.dirname(path), resolution.value);
                const candidates = /\.(?:c|lpc)$/.test(base) ? [base] : [base + '.c', base + '.lpc'];
                const found = candidates.map(locate).filter(Boolean);
                if (found.length === 1) target = found[0];
                else resolution.reason = found.length ? 'ambiguous_source_extensions' : 'inherit_source_missing_or_excluded';
            }
            const edge = { owner: path, target, evidence: ref(file, item), resolution };
            edges.push(edge);
            if (target) visit(target);
            else unresolved.push({ owner: path, reason: resolution.reason, evidence: ref(file, item) });
        }
        visiting.delete(path); visited.add(path);
    }
    roots.forEach(visit);
    function ancestors(path, seen = new Set()) {
        if (seen.has(path)) return seen;
        seen.add(path);
        for (const edge of edges.filter(e => e.owner === path && e.target)) ancestors(edge.target, seen);
        return seen;
    }
    const objects = roots.map(path => {
        const paths = [...ancestors(path)].sort();
        const has = stem => paths.some(p => p.replace(/\.(?:c|lpc)$/, '') === stem);
        return { path, ancestors: paths, source_role: has('inherit/char/punisher') ? 'punisher_npc'
            : has('kungfu/class/generate/chinese') || has('kungfu/class/generate/super') ? 'random_generated_npc'
                : has('inherit/char/npc') ? 'npc' : has('inherit/item/item') || has('inherit/item/combined') ? 'item' : 'other_or_unresolved',
            has_master_feature: has('feature/master'), status: 'source_relationship_not_runtime_curriculum' };
    });
    const all = [...files.values()].sort((a, b) => a.path.localeCompare(b.path));
    return { format: 1, kind: 'class_dependency_sources', source_fingerprint: inventory.source_fingerprint,
        dependency_fingerprint: sha256(JSON.stringify(all.map(f => [f.path, f.sha256]))),
        objects, edges, includes: [...headers.values()], files: all, unresolved,
        totals: { class_objects: objects.length, dependency_files: all.length, inherit_edges: edges.length,
            located_inherit_edges: edges.filter(e => e.target).length, include_edges: headers.size,
            unresolved: unresolved.length, roles: Object.fromEntries([...new Set(objects.map(o => o.source_role))].sort()
                .map(role => [role, objects.filter(o => o.source_role === role).length])),
            master_feature_objects: objects.filter(o => o.has_master_feature).length },
        limits: ['宏只解析字符串路径子集；保留候选分支，不代替驱动预处理或验证函数覆盖次序。',
            '继承 F_MASTER 不证明收徒/学习放行；NPC 配置、随机分支与惩罚机制不等于玩家能力。',
            '来源清单含原函数、头文件与 hash，未运行 create、授课或战斗。'], };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    try {
        assert.ok(process.argv.length === 3 || process.argv.length === 4,
            '用法：node tools/tests/martial_data/school_dependencies.mjs 已有清单目录 [新的仓库外报告目录]');
        const input = realpathSync(process.argv[2]);
        const report = classDependencies(root, JSON.parse(readFileSync(join(input, 'inventory.json'), 'utf8')));
        const output = newOutput(process.argv[3]);
        writeFileSync(join(output, 'school-dependencies.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
        console.log('公共继承来源：' + output);
        console.log(JSON.stringify(report.totals));
    } catch (error) { console.error('继承来源整理失败：' + error.message); process.exitCode = 1; }
}
