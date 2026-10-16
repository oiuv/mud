// Preparation only: this pure converter never reads/writes a sandbox or registers an executor.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const mingjiaoJiuyangFusionProbePath = 'cmds/skill/yanlian.c';
export const mingjiaoJiuyangFusionProbeScope = 'mingjiao-jiuyang-fusion';
export const mingjiaoJiuyangFusionProbeSourceHash =
    'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436';
const hash = text => createHash('sha256').update(text).digest('hex');
const occurrences = (text, part) => text.split(part).length - 1;

// The future receiver must bind the actual previous_object()/stack and USER argument.
// Non-return phases use 0 as an API placeholder, not an observed return value.
// Details reference original locals only; the receiver must copy them without mutation.
function observe(tag, fn, phase, result, details = '([])', indent = '    ') {
    return `${indent}/* ${mingjiaoJiuyangFusionProbeScope}:${tag} */\n`
        + `${indent}if ("/tests/runner"->is_jiuyang_fusion_observation(me))\n`
        + `${indent}    "/tests/runner"->observe_jiuyang_fusion(me, "${fn}", "${phase}", ${result}, ${details});\n`;
}

function sites() {
    const out = [];
    const replace = (tag, anchor, replacement) => out.push({ tag, anchor, replacement });
    const after = (tag, anchor, insert) => replace(tag, anchor, anchor + '\n' + insert.trimEnd());
    replace('finish-local', 'int practicing(object me) {\n    int i;',
        'int practicing(object me) {\n    int i;\n    mixed fusion_finish_result;');
    after('practicing-enter', '    string *color_msg = ({ HIY, HIG, HIW, HIM, HIC });',
        observe('practicing-enter', 'practicing', 'enter', '0'));
    const details = '([ "step": step, "skill": skill ])';
    for (const [tag, condition] of [
        ['invalid-pending', '!step || !stringp(skill)'],
        ['invalid-sub-skills', '!mapp(sub_skills = SKILL_D(skill)->query_sub_skills())'],
    ]) {
        const anchor = `    if (${condition})\n        return 0;`;
        replace(tag, anchor, `    if (${condition}) {\n`
            + observe(tag, 'practicing', 'return-' + tag, '0', details, '        ')
            + '        return 0;\n    }');
    }
    after('runtime-keys', '    skill_names = keys(sub_skills);',
        observe('runtime-keys', 'practicing', 'keys', '0',
            '([ "step": step, "skill": skill, "keys": skill_names, "sub_skills": sub_skills ])'));
    after('selected-action', '        action = SKILL_D(sub_skill)->query_action(me, me->query_temp("weapon"));',
        observe('selected-action', 'practicing', 'action', '0',
            '([ "step": step, "skill": skill, "sub_skill": sub_skill, "action": action ])', '        '));
    const returns = [
        ['missing-child', '                to_chinese(sub_skill) + "\\n");\n            return 0;'],
        ['missing-child-file', '                "这种武功好像失传了？\\n");\n            return 0;'],
        ['insufficient-neili', '            write("你刚欲出招，忽然间丹田真气不继，难以施为。\\n");\n            return 0;'],
        ['insufficient-qi', '            write("你觉得气力不加，疲惫不堪，无法再出招。\\n");\n            return 0;'],
        ['insufficient-jing', '            write("一阵烦恶涌上心头，你几欲呕吐。\\n");\n            return 0;'],
        ['below-child-level', '                "觉得有些迷茫，一时无法继续演练下去。\\n");\n            return 0;'],
    ];
    for (const [tag, anchor] of returns) replace(tag, anchor,
        anchor.replace('            return 0;',
            observe(tag, 'practicing', 'return-' + tag, '0',
                '([ "step": step, "skill": skill, "sub_skill": sub_skill ])', '            ')
                + '            return 0;'));
    replace('get-finish-once', '        if (SKILL_D(skill)->get_finish(me)) {',
        observe('get-finish-before', 'get_finish', 'before', '0', details, '        ')
        + '        fusion_finish_result = SKILL_D(skill)->get_finish(me);\n'
        + observe('get-finish-after', 'get_finish', 'after', 'fusion_finish_result', details, '        ')
        + '        if (fusion_finish_result) {');
    replace('finished-return', '        }\n        return 0;\n    }\n\n    step++;',
        '        }\n' + observe('finished-return', 'practicing', 'return-finished', '0', details, '        ')
        + '        return 0;\n    }\n\n    step++;');
    after('child-return', '    me->set_temp("pending/practice", step);',
        observe('child-return', 'practicing', 'return-continue', '1', details));
    replace('halt-enter', 'int halt_practice(object me) {\n    write',
        'int halt_practice(object me) {\n' + observe('halt-enter', 'halt_practice', 'enter', '0')
        + '    write');
    after('halt-return', '    me->set_temp("pending/practicing_skill", 0);',
        observe('halt-return', 'halt_practice', 'return-halt', '1'));
    return out;
}

function checkOptions(options) {
    assert.ok(options && typeof options === 'object' && !Array.isArray(options));
    assert.ok(Object.keys(options).every(key => key === 'collectionGroup'));
    if (Object.hasOwn(options, 'collectionGroup'))
        assert.equal(options.collectionGroup, mingjiaoJiuyangFusionProbeScope);
}

export function restoreMingjiaoJiuyangFusionProbes(changed) {
    assert.equal(typeof changed, 'string');
    let original = changed;
    for (const site of sites().reverse()) {
        assert.equal(occurrences(original, site.replacement), 1,
            'fusion removal must have exactly one replacement: ' + site.tag);
        original = original.replace(site.replacement, site.anchor);
    }
    assert.equal(hash(original), mingjiaoJiuyangFusionProbeSourceHash,
        'fusion removal did not restore the reviewed original bytes');
    return original;
}

export function mingjiaoJiuyangFusionProbes(source, options = {}) {
    checkOptions(options);
    assert.equal(typeof source, 'string');
    assert.equal(hash(source), mingjiaoJiuyangFusionProbeSourceHash,
        'original yanlian source changed; review required');
    let changed = source;
    const evidence = sites().map(site => {
        assert.equal(occurrences(source, site.anchor), 1, 'fusion original anchor must be unique: ' + site.tag);
        assert.equal(occurrences(changed, site.replacement), 0, 'fusion probe already present: ' + site.tag);
        assert.equal(occurrences(changed, site.anchor), 1, 'fusion replacement anchor must remain unique: ' + site.tag);
        const originalLine = source.slice(0, source.indexOf(site.anchor)).split('\n').length;
        changed = changed.replace(site.anchor, site.replacement);
        return { ...site, original_line: originalLine, removal: {
            operation: 'replace_exact', anchor_sha256: hash(site.anchor),
            replacement_sha256: hash(site.replacement),
        } };
    });
    assert.equal(restoreMingjiaoJiuyangFusionProbes(changed), source);
    return { path: mingjiaoJiuyangFusionProbePath, collection_group: mingjiaoJiuyangFusionProbeScope,
        status: 'prepared_not_applied', before: hash(source), after: hash(changed), changed, sites: evidence,
        observed_functions: ['practicing', 'halt_practice'],
        unobserved: ['main_return', 'get_finish_internal_random', 'original_caller_busy_clear', 'heartbeat_recovery'],
        runner_contract: { guard: 'is_jiuyang_fusion_observation', receiver: 'observe_jiuyang_fusion',
            requires: 'exact_active_group_and_USER0_copy_only_no_game_mutation',
            return_phases: ['return-*', 'get_finish:after'],
            non_return_result: '0_is_API_placeholder_not_an_observed_return',
            compiled: false, native_validated: false },
    };
}
