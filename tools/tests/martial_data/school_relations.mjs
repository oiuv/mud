// Static preparation for the school stage. No NPC execution or eligibility claim.
import assert from 'node:assert/strict';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { isInside, literal, sha256 } from './inventory.mjs';
import { newOutput, root } from '../../collect_martial_data.mjs';
import { classDependencies } from './school_dependencies.mjs';

const tokensOf = source => tokenize(source).filter(t => !['comment', 'directive', 'whitespace'].includes(t.kind));
const unique = items => [...new Set(items)].sort();

// Explicitly reviewed data flows, not an automatic solver for arbitrary LPC.
const compositeBindings = [
    { teacher: 'kungfu/class/gaibang/hong.c', function: 'try_to_learn_ds', skill: 'xianglong-zhang' },
    { teacher: 'kungfu/class/honghua/chen.c', function: 'try_to_learn_quan', skill: 'baihua-cuoquan' },
];

export function mappingFields(source) {
    const tokens = tokensOf(source), result = {};
    if (tokens[0]?.text !== '(' || tokens[1]?.text !== '['
        || tokens.at(-2)?.text !== ']' || tokens.at(-1)?.text !== ')') return null;
    let start = 2, depth = 0;
    for (let i = 2; i < tokens.length - 1; i++) {
        const token = tokens[i];
        if ((token.text === ',' || i === tokens.length - 2) && depth === 0) {
            const entry = tokens.slice(start, i); start = i + 1;
            if (!entry.length) continue;
            assert.equal(entry[0].kind, 'string', '教学 mapping 的动态键须另行调查');
            assert.equal(entry[1]?.text, ':', '教学 mapping 字段格式不符');
            const key = JSON.parse(entry[0].text);
            assert.ok(!Object.hasOwn(result, key), '教学 mapping 含重复键：' + key);
            result[key] = literal(entry.slice(2), source);
            continue;
        }
        if (['(', '[', '{', '(:'].includes(token.text)) depth++;
        else if ([')', ']', '}', ':)'].includes(token.text)) depth--;
        assert.ok(depth >= 0, '教学 mapping 分隔符不完整');
    }
    assert.equal(depth, 0, '教学 mapping 分隔符不完整');
    return result;
}

export function compositeTeaching(inventory, catalog, readSource) {
    const result = [];
    for (const binding of compositeBindings) {
        const teacher = inventory.files.find(f => f.path === binding.teacher);
        if (!teacher) continue;
        const teaching = teacher.functions.find(f => f.name === binding.function);
        assert.ok(teaching, '组合传授函数已改变，须重新核对：' + binding.teacher);
        const code = tokensOf(teaching.text).map(t => t.text).join('');
        assert.ok(code.includes(`sob=load_object(SKILL_D(${JSON.stringify(binding.skill)}))`)
            && code.includes('sub_skills=keys(sob->query_sub_skills())'),
        '组合技能来源已改变，须重新核对');
        const assignment = teacher.calls.find(c => c.function === binding.function
            && c.name === 'set_skill' && c.receiver === 'me' && c.args[0]?.raw === 'sub_skills[i]');
        assert.equal(assignment?.args[1]?.kind, 'integer', '组合技能传授值不再是固定整数');
        const skill = catalog.skills.find(s => s.id === binding.skill);
        assert.ok(skill, '组合技能来源缺失');
        assert.ok(['c', 'lpc'].some(ext => skill.path === `kungfu/skill/${binding.skill}.${ext}`),
            '组合技能路径不在已核对的公开范围');
        const file = inventory.files.find(f => f.path === skill.path);
        const source = readSource(file.path);
        assert.equal(sha256(source), file.sha256, '组合技能源码与固定清单不同，不能混合报告');
        const query = file.functions.find(f => f.name === 'query_sub_skills');
        assert.ok(query && tokensOf(query.text).map(t => t.text).join('')
            === 'query_sub_skills(){returnsub_skills;}', '组合子技能接口已改变，须重新核对');
        const tokens = tokensOf(source), declarations = [];
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].text !== 'mapping' || tokens[i + 1]?.text !== 'sub_skills'
                || tokens[i + 2]?.text !== '=' || tokens[i + 3]?.text !== '('
                || tokens[i + 4]?.text !== '['
                || file.functions.some(f => tokens[i].start >= f.start && tokens[i].start < f.end)) continue;
            let depth = 0, end = i + 3;
            for (; end < tokens.length; end++) {
                if (['(', '[', '{', '(:'].includes(tokens[end].text)) depth++;
                else if ([')', ']', '}', ':)'].includes(tokens[end].text)) depth--;
                if (depth === 0) break;
            }
            assert.equal(depth, 0, '组合子技能表不完整');
            declarations.push({ start: tokens[i].start, end: tokens[end].end,
                line: source.slice(0, tokens[i].start).split('\n').length,
                text: source.slice(tokens[i].start, tokens[end].end),
                fields: mappingFields(source.slice(tokens[i + 3].start, tokens[end].end)) });
        }
        assert.equal(declarations.length, 1, '组合子技能表不唯一，须重新核对');
        const declaration = declarations[0];
        const evidence = item => ({ path: file.path, sha256: file.sha256,
            line: item.line, start: item.start, end: item.end, text: item.text });
        const children = Object.entries(declaration.fields).map(([id, value]) => {
            const child = catalog.skills.find(s => s.id === id);
            assert.ok(child, '组合子技能定义缺失：' + id);
            assert.equal(value.kind, 'integer', '组合要求不再是固定等级：' + id);
            return { id, name: child.dictionary_name?.name ?? null,
                path: child.path, sha256: child.sha256,
                granted_level: assignment.args[1].value, composition_level: value.value };
        });
        result.push({ teacher: binding.teacher, function: binding.function, skill: binding.skill,
            assignment: { path: teacher.path, sha256: teacher.sha256,
                line: assignment.line, start: assignment.start, end: assignment.end, text: assignment.text },
            teaching_function: { path: teacher.path, sha256: teacher.sha256,
                line: teaching.line, start: teaching.start, end: teaching.end, text: teaching.text },
            query: evidence(query), declaration: evidence(declaration), children,
            role: 'player_subskill_candidates', eligibility: 'not_verified',
            status: 'static_data_flow_only',
            limits: '只展开已核对的初始化表；传授条件、低等级补齐分支及组合/练习资格仍按原函数核验，未执行教学。' });
    }
    return result;
}

function noTeachDeclarations(source) {
    const result = [];
    for (const fn of source.functions) {
        const tokens = tokensOf(fn.text);
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].text !== 'set' || tokens[i + 1]?.text !== '('
                || tokens[i + 2]?.kind !== 'string' || tokens[i + 3]?.text !== ',') continue;
            const key = JSON.parse(tokens[i + 2].text);
            if (!key.startsWith('no_teach/')) continue;
            let depth = 1, end = i + 4;
            for (; end < tokens.length; end++) {
                if (['(', '[', '{', '(:'].includes(tokens[end].text)) depth++;
                else if ([')', ']', '}', ':)'].includes(tokens[end].text)) depth--;
                if (depth === 0) break;
            }
            assert.equal(depth, 0, 'no_teach 声明不完整');
            result.push({ skill: key.slice(9), receiver: tokens[i - 1]?.text === '->' ? tokens[i - 2]?.text : null,
                value: literal(tokens.slice(i + 4, end), fn.text), function: fn.name,
                evidence: { path: source.path, sha256: source.sha256,
                    line: fn.line + fn.text.slice(0, tokens[i].start).split('\n').length - 1,
                    start: fn.start + tokens[i].start, end: fn.start + tokens[end].end,
                    text: fn.text.slice(tokens[i].start, tokens[end].end) } });
        }
    }
    return result;
}

// The frozen inventory retains full functions, but its call filter omits add().
// Derive these observations from that exact text without altering the snapshot.
export function incrementalGrantCalls(source) {
    return stateGrantCalls(source, 'add', /^can_(perform|exert)\//);
}

// Learning permission is not a learned skill or a perform grant. The original
// inventory omitted these set() keys but retained their full enclosing source.
export function learningPermissionCalls(source) {
    return stateGrantCalls(source, 'set', /^can_learn\//);
}

function stateGrantCalls(source, operation, keyPattern) {
    const result = [];
    for (const fn of source.functions) {
        const tokens = tokensOf(fn.text);
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].text !== operation || tokens[i + 1]?.text !== '('
                || tokens[i + 2]?.kind !== 'string' || tokens[i + 3]?.text !== ',') continue;
            const key = JSON.parse(tokens[i + 2].text);
            if (!keyPattern.test(key)) continue;
            let depth = 1, end = i + 4;
            for (; end < tokens.length; end++) {
                if (['(', '[', '{', '(:'].includes(tokens[end].text)) depth++;
                else if ([')', ']', '}', ':)'].includes(tokens[end].text)) depth--;
                if (depth === 0) break;
            }
            assert.equal(depth, 0, '教学状态声明不完整');
            const amount = literal(tokens.slice(i + 4, end), fn.text);
            const args = [literal(tokens.slice(i + 2, i + 3), fn.text), amount];
            result.push({ name: operation, function: fn.name,
                receiver: tokens[i - 1]?.text === '->' ? tokens[i - 2]?.text : null,
                values: [key, amount.kind === 'integer' ? amount.value : null], args,
                evidence: { path: source.path, sha256: source.sha256,
                    line: fn.line + fn.text.slice(0, tokens[i].start).split('\n').length - 1,
                    start: fn.start + tokens[i].start, end: fn.start + tokens[end].end,
                    text: fn.text.slice(tokens[i].start, tokens[end].end) } });
        }
    }
    return result;
}

function checkedEvidence(inventory, evidence) {
    const source = inventory.files.find(f => f.path === evidence.path);
    assert.ok(source, '关系来源不在清单中：' + evidence.path);
    assert.equal(source.sha256, evidence.sha256, '关系来源与清单指纹不同');
    assert.ok([...source.calls, ...source.functions, ...source.inherits, ...source.directives, ...source.arrays]
        .some(item => item.start === evidence.start && item.end === evidence.end && item.text === evidence.text),
    '关系原文/位置与清单不符：' + evidence.path);
    return evidence;
}

function grantReaders(catalog) {
    const byGrant = new Map();
    for (const skill of catalog.skills) for (const entry of skill.entries) {
        const fn = entry.evidence, tokens = tokensOf(fn.text);
        for (let i = 0; i < tokens.length - 3; i++) {
            if (tokens[i].text !== 'query' || tokens[i + 1]?.text !== '('
                || tokens[i + 2]?.kind !== 'string' || tokens[i + 3]?.text !== ')') continue;
            const grant = JSON.parse(tokens[i + 2].text);
            if (!/^can_(perform|exert)\//.test(grant)) continue;
            if (!byGrant.has(grant)) byGrant.set(grant, []);
            byGrant.get(grant).push({ path: skill.path, sha256: skill.sha256,
                function: entry.function, role: entry.role,
                line: fn.line + fn.text.slice(0, tokens[i].start).split('\n').length - 1,
                text: fn.text.slice(tokens[i].start, tokens[i + 3].end) });
        }
    }
    return byGrant;
}

function readCompositeSource(path) {
    const resolved = realpathSync(join(root, path));
    assert.ok(isInside(root, resolved), '组合技能源码不能越出仓库');
    return readFileSync(resolved, 'utf8');
}

export function schoolRelations(inventory, catalog, readSource = readCompositeSource, dependencies = null) {
    assert.equal(inventory.source_fingerprint, catalog.source_fingerprint);
    if (dependencies) assert.equal(inventory.source_fingerprint, dependencies.source_fingerprint,
        '继承来源与门派清单版本不同');
    const byPath = new Map(inventory.files.map(f => [f.path, f]));
    const skills = new Map(catalog.skills.map(s => [s.id, s]));
    const readers = grantReaders(catalog);
    const composites = compositeTeaching(inventory, catalog, readSource);
    const checked = evidence => checkedEvidence(inventory, evidence);
    const objects = catalog.teachers.map(teacher => {
        const source = byPath.get(teacher.path);
        assert.equal(source.sha256, teacher.sha256);
        const inheritance = dependencies?.objects.find(o => o.path === teacher.path);
        if (dependencies) assert.ok(inheritance, '继承报告未覆盖对象：' + teacher.path);
        const inheritedSources = inheritance?.ancestors.filter(path => path !== teacher.path).map(path => {
            const file = dependencies.files.find(f => f.path === path);
            assert.ok(file, '继承来源原文缺失：' + path);
            return { path, sha256: file.sha256,
                declared_qualification_functions: file.functions.filter(f => /^(?:accept_ask|ask_|attempt_apprentice|accept_apprentice|recognize_apprentice|valid_|permit_recruit)/.test(f.name))
                    .map(f => ({ function: f.name, line: f.line, start: f.start, end: f.end, text: f.text })),
                status: 'ancestor_declarations_not_effective_override_order' };
        }) ?? [];
        const gates = teacher.qualification_functions.map(g => ({ ...g, evidence: checked(g.evidence) }));
        const sources = [source, ...teacher.shared_headers.map(h => byPath.get(h.path))];
        // The original inventory intentionally indexes only selected set() keys.
        // Read no_teach from its preserved function text; don't rewrite that inventory.
        const blocks = sources.flatMap(noTeachDeclarations);
        const increments = sources.flatMap(incrementalGrantCalls);
        const permissions = sources.flatMap(learningPermissionCalls).map(call => {
            const fn = byPath.get(call.evidence.path).functions.find(f => f.name === call.function);
            // A suffix may identify a teacher or location as well as a skill.
            // Only an exact catalog match is a skill source, not the consumer.
            const suffix = call.values[0].slice('can_learn/'.length), skill = skills.get(suffix);
            return { role: !call.receiver && call.function === 'create'
                ? 'npc_initial_permission' : 'player_permission_candidate',
                permission: call.values[0], permission_suffix: suffix, value: call.args[1],
                receiver: call.receiver, function: call.function, evidence: call.evidence,
                skill_source: skill ? { path: skill.path, sha256: skill.sha256 } : null,
                enclosing_function: { path: call.evidence.path, sha256: call.evidence.sha256,
                    line: fn.line, text: fn.text },
                status: 'permission_only_consumer_and_eligibility_not_verified' };
        });
        const grants = [...teacher.teaching_candidates, ...increments].map(call => {
            // Incremental declarations are derived above from preserved function
            // text, not new calls invented in the frozen inventory.
            const evidence = call.name === 'add' ? call.evidence : checked(call.evidence);
            const fn = byPath.get(evidence.path).functions.find(f => f.name === call.function);
            assert.ok(fn, '教学候选缺少所属函数');
            let fields = null, unresolved = [], grant;
            if (call.name === 'teach_pfm') {
                try { fields = mappingFields(call.args[2]?.raw ?? ''); }
                catch (e) { unresolved.push(e.message); }
                if (!fields) unresolved.push('教学 mapping 不是可直接提取的字面量');
                grant = fields?.perform?.kind === 'string' ? fields.perform.value : null;
            } else grant = typeof call.values[0] === 'string' ? call.values[0] : null;
            const match = /^can_(perform|exert)\/(.+)$/.exec(grant ?? '');
            const path = match?.[2] ?? null;
            const pathCandidate = path ? skills.get(path) ?? skills.get(path.replace(/\/([^/]+)$/, `/${match[1]}/$1`)) : null;
            const actualReaders = readers.get(grant) ?? [];
            const entries = unique(actualReaders.map(r => r.path));
            if (!entries.length && pathCandidate) entries.push(pathCandidate.path);
            if (path && !entries.length) unresolved.push('未找到领悟字段读取或同名入口，需沿动作分发或特殊依赖核查');
            const role = ['set', 'add'].includes(call.name) && !call.receiver && call.function === 'create'
                ? 'npc_initial_grant' : 'player_grant_candidate';
            return { role, grant, entries, authorization_reads: actualReaders,
                operation: call.name,
                ...(call.name === 'add' ? { increment: call.args[1],
                    progression: 'must_check_enclosing_function_not_boolean_grant' } : {}),
                resolution: actualReaders.length ? 'authorization_read' : pathCandidate ? 'path_candidate_only' : 'unresolved',
                name: fields?.name ?? null, fields, receiver: call.receiver,
                caller_arguments: call.args.slice(0, call.name === 'teach_pfm' ? 2 : 0),
                function: call.function, evidence,
                enclosing_function: { path: evidence.path, sha256: evidence.sha256,
                    line: fn.line, text: fn.text },
                unresolved, eligibility: 'not_verified' };
        });
        const skillAssignments = teacher.npc_skills.map(call => {
            const id = typeof call.values[0] === 'string' ? call.values[0] : null;
            const skill = skills.get(id);
            const composite = composites.find(c => c.teacher === teacher.path
                && c.assignment.start === call.evidence.start);
            return { id, name: skill?.dictionary_name?.name ?? null,
                level: call.args[1], receiver: call.receiver, function: call.function,
                skill_source: skill ? { path: skill.path, sha256: skill.sha256 } : null,
                evidence: checked(call.evidence),
                role: call.receiver ? 'external_object_assignment' : call.function === 'create'
                    ? 'npc_initial_skill' : 'npc_other_function_assignment',
                status: 'assignment_not_player_curriculum',
                ...(composite ? { dynamic_resolution: composite } : {}) };
        });
        const inherited = teacher.inherits.map(inherit => ({ evidence: checked(inherit.evidence),
            literal: inherit.literal, macros: inherit.macro_candidates,
            status: 'not_executed' }));
        const mappingSource = call => {
            const id = typeof call.values[1] === 'string' ? call.values[1] : null;
            const skill = skills.get(id);
            return { ...call, evidence: checked(call.evidence),
                target_source: skill ? { path: skill.path, sha256: skill.sha256 } : null,
                source_status: id ? skill ? 'located_not_executed' : 'target_source_missing'
                    : call.args.length < 2 || call.values[1] === 0 ? 'cancel_mapping' : 'dynamic_target' };
        };
        return { path: teacher.path, sha256: teacher.sha256, group: teacher.directory_group,
            ...(inheritance ? { inheritance, inherited_sources: inheritedSources } : {}),
            names: teacher.names.map(c => ({ ...c, evidence: checked(c.evidence) })),
            family_declarations: teacher.families.map(c => ({ ...c, evidence: checked(c.evidence) })),
            inherits: inherited, shared_headers: teacher.shared_headers,
            skill_assignments: skillAssignments, mappings: teacher.mappings.map(mappingSource),
            preparations: teacher.preparations.map(mappingSource),
            combat_references: teacher.combat_references.map(c => ({ ...c, evidence: checked(c.evidence) })),
            no_teach_declarations: blocks, learning_permissions: permissions,
            grants, gates, status: 'source_indexed_runtime_pending' };
    });
    const groups = unique(objects.map(o => o.group)).map(group => {
        const members = objects.filter(o => o.group === group);
        return { group, objects: members.map(o => o.path),
            families: unique(members.flatMap(o => o.family_declarations.map(f => f.values[0])).filter(v => typeof v === 'string')),
            npc_skill_ids: unique(members.flatMap(o => o.skill_assignments.filter(s => s.role !== 'external_object_assignment').map(s => s.id)).filter(Boolean)),
            declarations: members.reduce((n, o) => n + o.skill_assignments.length, 0),
            player_grant_candidates: members.reduce((n, o) => n + o.grants.filter(g => g.role === 'player_grant_candidate').length, 0),
            npc_initial_grants: members.reduce((n, o) => n + o.grants.filter(g => g.role === 'npc_initial_grant').length, 0),
            no_teach_declarations: members.reduce((n, o) => n + o.no_teach_declarations.length, 0),
            status: 'runtime_pending' };
    });
    const overlaps = unique(groups.flatMap(g => g.npc_skill_ids)).map(id => ({ id,
        name: skills.get(id)?.dictionary_name?.name ?? null,
        groups: groups.filter(g => g.npc_skill_ids.includes(id)).map(g => g.group) }))
        .filter(row => row.groups.length > 1);
    const unresolved = objects.flatMap(o => [
        ...o.skill_assignments.filter(s => (!s.id || !s.skill_source) && !s.dynamic_resolution).map(s => ({ owner: o.path,
            reason: s.id ? 'skill_source_not_in_catalog' : 'dynamic_skill_id', evidence: s.evidence })),
        ...o.grants.filter(g => g.unresolved.length).map(g => ({ owner: o.path,
            reason: g.unresolved, evidence: g.evidence })),
        ...[...o.mappings, ...o.preparations].filter(c => ['target_source_missing', 'dynamic_target'].includes(c.source_status))
            .map(c => ({ owner: o.path, reason: c.source_status, evidence: c.evidence })),
    ]);
    return { format: 1, kind: 'school_source_relations', source_fingerprint: inventory.source_fingerprint,
        ...(dependencies ? { dependency_fingerprint: dependencies.dependency_fingerprint,
            dependency_totals: dependencies.totals } : {}),
        dictionary_sha256: catalog.dictionary_sha256, groups, objects, overlaps, composites, unresolved,
        totals: { directory_groups: groups.length, class_objects: objects.length,
            family_names: unique(groups.flatMap(g => g.families)).length,
            skill_assignment_declarations: groups.reduce((n, g) => n + g.declarations, 0),
            npc_skill_declarations: objects.reduce((n, o) => n + o.skill_assignments.filter(s => s.role !== 'external_object_assignment').length, 0),
            player_grant_candidates: groups.reduce((n, g) => n + g.player_grant_candidates, 0),
            incremental_grant_declarations: objects.reduce((n, o) => n + o.grants.filter(g => g.operation === 'add').length, 0),
            learning_permission_declarations: objects.reduce((n, o) => n + o.learning_permissions.length, 0),
            npc_initial_grants: groups.reduce((n, g) => n + g.npc_initial_grants, 0),
            unique_declared_skills: unique(groups.flatMap(g => g.npc_skill_ids)).length,
            cross_group_skill_ids: overlaps.length, unresolved_records: unresolved.length,
            composite_teaching_paths: composites.length,
            composite_student_skill_candidates: composites.reduce((n, c) => n + c.children.length, 0),
            missing_mapping_targets: objects.reduce((n, o) => n + [...o.mappings, ...o.preparations]
                .filter(c => c.source_status === 'target_source_missing').length, 0) },
        limits: ['目录、family 字符串及 NPC 配置不等于正式可加入门派或玩家可学清单。',
            '头文件与原函数条件保留；尚未执行预处理、继承、分支或 NPC 初始化。',
            '普通学习还须经 learn、师承/recognize_apprentice、no_teach 和技能 valid_learn 等检查。',
            '教学 mapping 数值只来自对应调用；完整前置条件还须核对所属函数及 MASTER_D。领悟键与文件名可以不同，以实际读取为线索。',
            '直接 add 型领悟另保留递增表达式与所属函数，不将一次递增当作完整学会；层数、潜能及最终扣费须实际观察。',
            'can_learn 写入单列为学习许可，不并入绝招领悟或已学技能；关联同名技能文件不证明它读取该许可，仍须核对实际消费入口。',
            '组合武学分别保存教师授予的初始等级和组合表要求的等级，子技能不计入该 NPC 自用技能数；静态展开不是实际传授成功。',
            '跨分组共享仅指配置引用重叠，不代替该门派组合的真实采集。'], };
}

export function schoolMarkdown(report) {
    const lines = ['# 门派与 class 分组来源索引', '',
        '这里只整理静态资料，未开始门派效果采集，不据此宣布拜师或传授资格。', '',
        `源码指纹：\`${report.source_fingerprint}\`。`, '',
        `覆盖 ${report.totals.directory_groups} 个目录分组、${report.totals.class_objects} 个对象；`
            + `${report.totals.family_names} 个不同 family 字符串，不等于正式门派数量。`, '',
        '| 分组 | 对象 | 源码 family 声明 | 自用技能 ID | 玩家领悟候选 |',
        '| --- | ---: | --- | ---: | ---: |'];
    for (const g of report.groups) lines.push(`| ${g.group} | ${g.objects.length} | ${g.families.join('、') || '无字面量声明'} | ${g.npc_skill_ids.length} | ${g.player_grant_candidates} |`);
    lines.push('', '## 组合武学的动态传授', '',
        '| 教师 | 组合武学 | 子技能数 | 初次传授等级 | 组合表等级 |',
        '| --- | --- | ---: | --- | --- |');
    for (const c of report.composites) lines.push(`| ${c.teacher} | ${c.skill} | ${c.children.length} | ${unique(c.children.map(x => x.granted_level)).join('、')} | ${unique(c.children.map(x => x.composition_level)).join('、')} |`);
    lines.push('', '这些是对子技能不足时的补齐值，不会把已学的较高等级降回初值；完成组合还有原技能的属性、内功及随机等检查。', '',
        `另定位 ${report.totals.learning_permission_declarations} 项 can_learn 写入声明，属于学习许可线索，未并入上表玩家领悟候选。`, '',
        '## 统计边界', '', ...report.limits.map(text => '- ' + text), '',
        `尚有 ${report.totals.unresolved_records} 个动态或未直接定位记录；这是待调查项，不自动当成代码错误。`, '',
        '完整 JSON 保存每个对象、公共头文件、调用/所属函数原文、资格函数、no_teach 声明、教学 mapping 字段及跨分组重复技能。', '');
    if (report.dependency_totals) lines.push('## 公共继承来源', '',
        `继承来源指纹：\`${report.dependency_fingerprint}\`。`, '',
        `定位 ${report.dependency_totals.located_inherit_edges}/${report.dependency_totals.inherit_edges} 条继承边，`
            + `${report.dependency_totals.dependency_files} 个公开源文件/头文件；未定位项 ${report.dependency_totals.unresolved}。`, '',
        ...Object.entries(report.dependency_totals.roles).map(([role, count]) => `- ${role}：${count} 个。`), '',
        `继承师父功能的对象共 ${report.dependency_totals.master_feature_objects} 个；这不证明实际收徒或玩家可学。`, '',
        '完整公共源码及 include 关系另存 school-dependencies.json；关系表引用同一指纹。函数覆盖和条件编译仍需驱动核验，随机 NPC 与惩罚者不混入普通师承样本。', '');
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    try {
        assert.ok(process.argv.length === 3 || process.argv.length === 4,
            '用法：node tools/tests/martial_data/school_relations.mjs 已有清单目录 [新的仓库外报告目录]');
        const input = realpathSync(process.argv[2]);
        const read = name => JSON.parse(readFileSync(join(input, name), 'utf8'));
        const inventory = read('inventory.json');
        const dependencies = classDependencies(root, inventory);
        const report = schoolRelations(inventory, read('catalog.json'), readCompositeSource, dependencies);
        const output = newOutput(process.argv[3]);
        writeFileSync(join(output, 'school-dependencies.json'), JSON.stringify(dependencies, null, 2) + '\n', { flag: 'wx' });
        writeFileSync(join(output, 'school-relations.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
        writeFileSync(join(output, 'school-relations.md'), schoolMarkdown(report), { flag: 'wx' });
        console.log('门派来源报告：' + output);
        console.log(JSON.stringify(report.totals));
    } catch (error) { console.error('关系整理失败：' + error.message); process.exitCode = 1; }
}
