// Read-only relationships. None of these declarations prove player eligibility.
import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { isInside, sha256 } from './inventory.mjs';

const value = arg => arg?.kind === 'string' || arg?.kind === 'integer' ? arg.value : null;
const significant = text => tokenize(text).filter(t => !['comment', 'whitespace', 'directive'].includes(t.kind));
const ref = (file, item) => ({ path: file.path, sha256: file.sha256,
    line: item.line, column: item.column, start: item.start, end: item.end, text: item.text });

export function readDictionary(source) {
    const tokens = significant(source), entries = [];
    assert.equal(tokens[0]?.text, 'dict', '公共字典格式不符');
    assert.equal(tokens[1]?.text, '(');
    assert.equal(tokens[2]?.text, '[');
    for (let i = 3; i < tokens.length; i++) {
        if (tokens[i].kind !== 'string' || tokens[i + 1]?.text !== ':' || tokens[i + 2]?.kind !== 'string') continue;
        const id = JSON.parse(tokens[i].text), name = JSON.parse(tokens[i + 2].text);
        const start = tokens[i].start, end = tokens[i + 2].end;
        entries.push({ id, name, path: 'data/e2c_dict.o', sha256: sha256(source),
            line: source.slice(0, start).split('\n').length,
            column: start - source.slice(0, start).lastIndexOf('\n'), start, end, text: source.slice(start, end) });
        i += 2;
    }
    assert.equal(new Set(entries.map(e => e.id)).size, entries.length, '公共字典含重复键，需人工确认');
    return entries;
}

export function categoryCandidates(file) {
    const declarations = [];
    for (const fn of file.functions.filter(fn => fn.name === 'valid_enable')) {
        const parameter = /\bstring\s+(\w+)/.exec(fn.signature)?.[1];
        const tokens = significant(fn.text), candidates = [];
        for (let i = 0; parameter && i < tokens.length; i++) {
            if (tokens[i].text === parameter && tokens[i + 1]?.text === '==' && tokens[i + 2]?.kind === 'string') {
                candidates.push({ value: JSON.parse(tokens[i + 2].text), form: 'equality' });
            } else if (tokens[i].kind === 'string' && tokens[i + 1]?.text === '==' && tokens[i + 2]?.text === parameter) {
                candidates.push({ value: JSON.parse(tokens[i].text), form: 'equality' });
            }
            if (tokens[i].text === 'member_array' && tokens[i + 1]?.text === '('
                && tokens[i + 2]?.text === parameter && tokens[i + 3]?.text === ',') {
                const arrayName = tokens[i + 4]?.text;
                for (const array of file.arrays.filter(array => array.name === arrayName)) {
                    for (const item of array.values.filter(item => item.kind === 'string')) {
                        candidates.push({ value: item.value, form: 'array_membership', declaration: ref(file, array) });
                    }
                }
            }
        }
        declarations.push({ status: 'runtime_unverified', evidence: ref(file, fn),
            candidates, unresolved: [...(candidates.length === 0 ? ['no_literal_candidate'] : []),
                'control_flow_and_macros_not_evaluated'],
            note: '仅为出现于判断中的类别；否定、组合条件、宏和数组后续变更均须运行期核验。' });
    }
    return declarations;
}

function entryRole(name) {
    if (name === 'perform') return 'perform';
    if (name === 'exert') return 'exert';
    if (['query_action', 'hit_ob', 'damage_level', 'query_dodge', 'query_parry', 'dodge', 'parry'].includes(name)) return 'combat_interface';
    if (/^(?:valid_|query_|skill_)/.test(name)) return 'query_or_gate';
    return 'other_function';
}

export function buildCatalog(inventory, dictionarySource) {
    const dictionary = readDictionary(dictionarySource);
    const byName = new Map(dictionary.map(entry => [entry.id, entry]));
    const byPath = new Map(inventory.files.map(file => [file.path, file]));
    const macroDefinitions = inventory.files.flatMap(file => file.directives.filter(d => d.kind === 'define').flatMap(d => {
        const match = /^#\s*define\s+(\w+)(\s+)([\s\S]*)/.exec(d.text);
        if (!match) return [];
        return [{ name: match[1], value: match[3].trim(), evidence: ref(file, d), status: 'not_preprocessed' }];
    }));
    function headerRefs(file, seen = new Set()) {
        const headers = [];
        for (const directive of file.directives.filter(d => d.resolved)) {
            if (seen.has(directive.resolved)) continue;
            seen.add(directive.resolved);
            const header = byPath.get(directive.resolved);
            if (header) headers.push({ path: header.path, sha256: header.sha256,
                include_evidence: ref(file, directive) }, ...headerRefs(header, seen));
        }
        return headers;
    }
    function inheritance(file) {
        return file.inherits.map(item => ({ evidence: ref(file, item),
            literal: item.kind === 'string' ? item.value : null,
            macro_candidates: item.kind === 'expression' ? macroDefinitions.filter(macro => macro.name === item.raw.trim()) : [],
            status: 'runtime_unverified' }));
    }
    const skills = inventory.files.filter(file => file.scope === 'skill' && !file.path.endsWith('.h')).map(file => {
        const id = file.path.slice('kungfu/skill/'.length).replace(/\.(c|lpc)$/, ''), base = id.split('/')[0];
        const entries = file.functions.map(fn => ({ id: `${file.path}:${fn.line}:${fn.name}`,
            function: fn.name, role: entryRole(fn.name), evidence: ref(file, fn), normal_effect: 'not_tested' }));
        const displayNames = file.functions.filter(fn => fn.name === 'name').map(fn => ({ evidence: ref(file, fn),
            status: 'expression_not_executed' }));
        return { id, base_skill: base, top_level: !id.includes('/'), path: file.path, sha256: file.sha256,
            dictionary_name: byName.get(base) ?? null, name_functions: displayNames,
            categories: categoryCandidates(file), entries, inherits: inheritance(file), shared_headers: headerRefs(file),
            dependencies: file.calls.filter(call => ['query_skill', 'query_skill_mapped', 'query_skill_prepared', 'load_object', 'clone_object', 'call_other', 'call_out', 'start_call_out'].includes(call.name))
                .map(call => ({ name: call.name, args: call.args, form: call.form, evidence: ref(file, call) })),
            unresolved: file.lexical_issues,
        };
    });
    const teachers = inventory.files.filter(file => file.scope === 'class' && !file.path.endsWith('.h')).map(file => {
        const headers = headerRefs(file), sources = [file, ...headers.map(h => byPath.get(h.path))];
        const selected = names => sources.flatMap(source => source.calls.filter(c => names.includes(c.name))
            .map(call => ({ name: call.name, function: call.function, form: call.form,
                receiver: call.receiver, values: call.args.map(value), args: call.args, evidence: ref(source, call),
                status: 'declaration_not_execution' })));
        const teaching = selected(['teach_pfm', 'teach_exert', 'teach_skill', 'set']).filter(call => call.name !== 'set'
            || /^can_(?:perform|exert)\//.test(call.values[0] ?? ''));
        return { path: file.path, sha256: file.sha256, directory_group: file.path.split('/')[2],
            names: selected(['set_name']), families: selected(['create_family']),
            npc_skills: selected(['set_skill']), mappings: selected(['map_skill']), preparations: selected(['prepare_skill']),
            combat_references: selected(['perform_action', 'exert_function']), teaching_candidates: teaching,
            qualification_functions: sources.flatMap(source => source.functions
                .filter(fn => /^(?:accept_ask|ask_|attempt_apprentice|accept_apprentice|recognize_apprentice|valid_|permit_recruit)/.test(fn.name))
                .map(fn => ({ function: fn.name, evidence: ref(source, fn) }))),
            shared_headers: headers, inherits: inheritance(file),
            eligibility: 'not_verified', note: '配置和教学代码仅为候选；需核对所属对象、条件和公共继承后确认玩家学习路径。',
        };
    });
    const weaponHeader = byPath.get('include/weapon.h');
    const weaponTypes = weaponHeader.directives.filter(d => d.kind === 'define').flatMap(d => {
        const match = /^#\s*define\s+(\w+)\s+"(\/inherit\/weapon\/[^"\r\n]+)"/.exec(d.text);
        return match && !match[1].startsWith('F_')
            ? [{ macro: match[1], provider: match[2], evidence: ref(weaponHeader, d) }] : [];
    });
    const entryCount = skills.reduce((n, skill) => n + skill.entries.length, 0);
    return { format: 1, kind: 'static_relationship_candidates', source_fingerprint: inventory.source_fingerprint,
        dictionary_sha256: sha256(dictionarySource), weapon_types: weaponTypes, skills, teachers,
        totals: { weapon_types: weaponTypes.length, skill_files: skills.length, local_skill_functions: entryCount,
            perform_entries: skills.reduce((n, s) => n + s.entries.filter(e => e.role === 'perform').length, 0),
            exert_entries: skills.reduce((n, s) => n + s.entries.filter(e => e.role === 'exert').length, 0),
            teacher_files: teachers.length, dictionary_entries: dictionary.length },
    };
}

export function collectCatalog(root, inventory) {
    // A public exact-file exception; never walk data/ or restore an object.
    const dictionary = realpathSync(join(root, 'data/e2c_dict.o'));
    assert.ok(isInside(root, dictionary), '公共字典不得越出仓库');
    return buildCatalog(inventory, readFileSync(dictionary, 'utf8'));
}
