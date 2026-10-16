// Pure conversion tests: no source writes, registration, driver, callback or sampled record.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { formatLPC, tokenSequence } from '../../../fluffos/tools/lpc-syntax/format.mjs';
import { mingjiaoJiuyangFusionProbes as build, restoreMingjiaoJiuyangFusionProbes as restore,
    mingjiaoJiuyangFusionProbeScope as scope, mingjiaoJiuyangFusionProbePath as path,
    mingjiaoJiuyangFusionProbeSourceHash as sourceHash } from './school_mingjiao_jiuyang_fusion_probes.mjs';

const source = readFileSync(new URL('../../../' + path, import.meta.url), 'utf8');
const hash = text => createHash('sha256').update(text).digest('hex');
const code = text => tokenize(text).filter(t => !['whitespace', 'comment'].includes(t.kind));
const calls = text => {
    const tokens = code(text), names = new Set(['random', 'keys', 'query_sub_skills', 'query_action',
        'get_finish', 'get_ready', 'set_temp', 'add', 'delete_skill', 'set_skill', 'start_busy']);
    return tokens.filter((t, i) => names.has(t.text) && tokens[i + 1]?.text === '(').map(t => t.text);
};
const returnValues = text => [...text.matchAll(/\breturn ([01]);/g)].map(m => m[1]);

test('prepared exact source, 17 unique sites and full byte inverse; no disk application', () => {
    const p = build(source);
    assert.equal(p.path, 'cmds/skill/yanlian.c'); assert.equal(p.collection_group, scope);
    assert.equal(p.status, 'prepared_not_applied'); assert.equal(p.before, sourceHash);
    assert.equal(hash(source), sourceHash); assert.equal(p.after, hash(p.changed));
    assert.notEqual(p.before, p.after); assert.equal(p.sites.length, 17);
    assert.equal(new Set(p.sites.map(s => s.tag)).size, 17);
    assert.equal(restore(p.changed), source);
    assert.equal(p.sites.reduceRight((text, s) => text.replace(s.replacement, s.anchor), p.changed), source);
    for (const s of p.sites) {
        assert.equal(source.split(s.anchor).length, 2); assert.equal(p.changed.split(s.replacement).length, 2);
        assert.ok(Number.isSafeInteger(s.original_line) && s.original_line > 0);
        assert.deepEqual(s.removal, { operation: 'replace_exact', anchor_sha256: hash(s.anchor),
            replacement_sha256: hash(s.replacement) });
    }
    assert.equal(readFileSync(new URL('../../../' + path, import.meta.url), 'utf8'), source);
});

test('missing, duplicate, edited, pre-injected and foreign source fail closed', () => {
    const p = build(source);
    for (const s of p.sites) {
        assert.throws(() => build(source.replace(s.anchor, '')));
        assert.throws(() => build(source + '\n' + s.anchor));
        assert.throws(() => restore(p.changed.replace(s.replacement, s.anchor)));
        assert.throws(() => restore(p.changed + '\n' + s.replacement));
    }
    for (const bad of [undefined, null, 0, {}, Buffer.from(source), '', source + '\n', p.changed,
        source.replace('random(sizeof(color_msg))', 'random(1)')]) assert.throws(() => build(bad));
    assert.throws(() => restore(p.changed.replace('return 1;', 'return 2;')));
    assert.throws(() => restore(p.changed + '\n// extra'));
});

test('explicit narrow group only; guard precedes every future observation', () => {
    assert.deepEqual(build(source, { collectionGroup: scope }), build(source));
    for (const options of [null, [], 1, { collectionGroup: undefined }, { collectionGroup: 'other' },
        { native: true }, { collectionGroup: scope, active: true }]) assert.throws(() => build(source, options));
    const added = build(source).sites.flatMap(s =>
        [...s.replacement.matchAll(/if \("\/tests\/runner"->is_jiuyang_fusion_observation\(me\)\)\n\s+"\/tests\/runner"->observe_jiuyang_fusion\(/g)]);
    assert.equal(added.length, 17); // one declaration site, one dual get_finish site
    assert.equal((build(source).changed.match(/observe_jiuyang_fusion\(/g) ?? []).length, 17);
});

test('original business calls and RNG order are preserved; get_finish is evaluated exactly once', () => {
    const changed = build(source).changed;
    assert.deepEqual(calls(changed), calls(source));
    assert.equal((changed.match(/SKILL_D\(skill\)->get_finish\(me\)/g) ?? []).length, 1);
    assert.ok(changed.includes('mixed fusion_finish_result;'));
    assert.ok(changed.includes('fusion_finish_result = SKILL_D(skill)->get_finish(me);'));
    assert.ok(changed.includes('if (fusion_finish_result) {'));
    assert.ok(changed.indexOf('fusion_finish_result =') < changed.indexOf('"get_finish", "after", fusion_finish_result'));
    assert.ok(changed.indexOf('"get_finish", "after", fusion_finish_result') < changed.indexOf('if (fusion_finish_result)'));
    assert.equal((changed.match(/keys\(sub_skills\)/g) ?? []).length, 1);
    assert.equal((changed.match(/query_action\(me, me->query_temp\("weapon"\)\)/g) ?? []).length, 1);
    assert.deepEqual(returnValues(changed), returnValues(source));
    assert.doesNotMatch(changed, /function_owner|call_out\(|set_heart_beat\(|continue_action\(|force_me\(/);
});

test('every original practicing return and halt return is observed inside its branch', () => {
    const p = build(source), changed = p.changed;
    const originalBody = source.slice(source.indexOf('int practicing(object me) {'), source.indexOf('int help(object me) {'));
    const changedBody = changed.slice(changed.indexOf('int practicing(object me) {'), changed.indexOf('int help(object me) {'));
    assert.equal((originalBody.match(/\breturn [01];/g) ?? []).length, 11);
    assert.equal((changedBody.match(/"return-[^\"]+"/g) ?? []).length, 11);
    assert.match(changed, /if \(!step \|\| !stringp\(skill\)\) \{[\s\S]*?"return-invalid-pending"[\s\S]*?return 0;\n    \}/);
    assert.match(changed, /if \(!mapp\(sub_skills = SKILL_D\(skill\)->query_sub_skills\(\)\)\) \{[\s\S]*?"return-invalid-sub-skills"[\s\S]*?return 0;\n    \}/);
    for (const tag of ['missing-child', 'missing-child-file', 'insufficient-neili', 'insufficient-qi',
        'insufficient-jing', 'below-child-level', 'finished-return', 'child-return', 'halt-return']) {
        const s = p.sites.find(s => s.tag === tag);
        assert.ok(s.replacement.indexOf('observe_jiuyang_fusion') < s.replacement.lastIndexOf('return ')
            || s.tag === 'child-return' || s.tag === 'halt-return');
    }
    assert.ok(changed.indexOf('me->set_temp("pending/practice", step);') < changed.indexOf('"return-continue"'));
    assert.ok(changed.indexOf('me->set_temp("pending/practicing_skill", 0);') < changed.indexOf('"return-halt"'));
});

test('actual action and runtime keys are passed unchanged; missing force is not synthesized', () => {
    const p = build(source), action = p.sites.find(s => s.tag === 'selected-action');
    assert.match(action.replacement, /query_action[\s\S]*?"action": action/);
    assert.match(p.sites.find(s => s.tag === 'runtime-keys').replacement,
        /keys\(sub_skills\)[\s\S]*?"keys": skill_names, "sub_skills": sub_skills/);
    const added = p.sites.map(s => s.replacement.replace(s.anchor, '')).join('\n');
    assert.doesNotMatch(added, /"force"\s*:|action\["force"\]\s*=|sort_array|random\(/);
    assert.deepEqual(p.observed_functions, ['practicing', 'halt_practice']);
    assert.deepEqual(p.unobserved, ['main_return', 'get_finish_internal_random', 'original_caller_busy_clear', 'heartbeat_recovery']);
    assert.equal(p.runner_contract.compiled, false); assert.equal(p.runner_contract.native_validated, false);
});

test('original literals/comments survive and pure formatter preserves generated token order', () => {
    const changed = build(source).changed;
    for (const text of [source, changed]) for (const t of tokenize(text)) {
        assert.notEqual(t.kind, 'unknown'); assert.ok(!t.unterminated);
    }
    const protectedKinds = new Set(['string', 'char', 'textblock', 'template', 'comment', 'directive']);
    const original = tokenize(source).filter(t => protectedKinds.has(t.kind)).map(t => [t.kind, t.text]);
    const transformed = tokenize(changed).filter(t => protectedKinds.has(t.kind)).map(t => [t.kind, t.text]);
    let offset = 0;
    for (const value of original) {
        const found = transformed.findIndex((candidate, i) => i >= offset
            && candidate[0] === value[0] && candidate[1] === value[1]);
        assert.ok(found >= offset, 'original protected literal/comment changed'); offset = found + 1;
    }
    const formatted = formatLPC(changed, { indentSize: 4, printWidth: 100 });
    assert.deepEqual(tokenSequence(formatted), tokenSequence(changed));
    assert.equal(formatLPC(formatted, { indentSize: 4, printWidth: 100 }), formatted);
    // Formatting/tokenization is not LPC compilation or proof of native timing/stack behavior.
});

test('deterministic outputs and evidence cannot mutate another conversion', () => {
    const p = build(source), next = build(source);
    assert.deepEqual(p, next); p.sites[0].anchor = ''; p.runner_contract.compiled = true;
    assert.deepEqual(build(source), next); assert.equal(restore(next.changed), source);
});
