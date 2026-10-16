// Pure preparation tests, not a native sample, runtime consumer or registration test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import * as subject from './school_mingjiao_remaining_perform_cases.mjs';

const { mingjiaoRemainingPerformConditions: factory, mingjiaoRemainingPerformSourcePaths: paths,
    mingjiaoRemainingPerformReviewedSourceHash: reviewed, mingjiaoRemainingPerformAbsentPaths: absents,
    validateMingjiaoRemainingPerformCondition: validate } = subject;
const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(resolve(root, path));
const sha = value => createHash('sha256').update(value).digest('hex');
const clone = value => structuredClone(value);
// Independent source anchors. Do not import a plan/descriptor/expected-value generator from production.
const anchors = [
    ['pili-quan', 'jin', 'cuff', 10, 40, 200, 16],
    ['pili-shou', 'hun', 'hand', 10, 140, 340, 20],
    ['tougu-zhen', 'feng', 'finger', 10, 100, 350, 21],
    ['yinfeng-dao', 'jue', 'strike', 10, 140, 400, 21],
    ['yinhu-zhang', 'lao', 'staff', 8, 100, 200, 19],
    ['sougu-yingzhua', 'xue', 'claw', 8, 60, 220, 19],
    ['sougu-yingzhua', 'ying', 'claw', 7, 150, 800, 18],
    ['duoming-jinhua', 'hua', 'throwing', 9, 120, 150, 22],
    ['xiaoyao-jian', 'fei', 'sword', 8, 60, 200, 20],
    ['xiaoyao-jian', 'kuai', 'sword', 8, 120, 300, 25],
    ['xiaoyao-jian', 'qi', 'sword', 8, 160, 350, 21],
    ['nianhua-zhi', 'fuxue', 'finger', 7, 100, 200, 18],
    ['sanhua-zhang', 'san', 'strike', 8, 135, 200, 17],
    ['longzhua-gong', 'zhua', 'claw', 8, 135, 200, 15],
    ['fengyun-shou', 'qinna', 'hand', 8, 120, 100, 16],
    ['pomopima-jian', 'zui', 'sword', 8, 120, 250, 19],
    ['qiankun-danuoyi', 'nuoyi', 'parry', 7, 50, 400, 21],
];
const baseSkills = [...new Set(anchors.map(x => x[0]))];
const catalog = { skills: [
    ...baseSkills.map(skill => ({ id: skill, base_skill: skill, top_level: true,
        path: `kungfu/skill/${skill}.c`, sha256: sha(read(`kungfu/skill/${skill}.c`)), entries: [] })),
    ...anchors.map(([skill, ability, , line]) => {
        const path = `kungfu/skill/${skill}/${ability}.c`, digest = sha(read(path));
        return { id: `${skill}/${ability}`, base_skill: skill, top_level: false, path, sha256: digest,
            entries: [{ id: `${path}:${line}:perform`, function: 'perform', role: 'perform',
                evidence: { path, line, sha256: digest } }] };
    }),
] };
const formal = factory(catalog, read), smoke = factory(catalog, read, { smoke: true });
const selected = (ability, variant = 'level400') => {
    const found = formal.filter(c => c.parameters.ability === ability && c.parameters.variant === variant);
    assert.equal(found.length, 1); return found[0];
};
const p = (ability, variant) => selected(ability, variant).parameters;
const effective = (a, usage) => Math.trunc((a.skills[usage] ?? 0) / 2)
    + (a.skills[a.mappings[usage]] ?? 0) - (usage === 'dodge' && a.equipment && !a.equipment.hold ? 1 : 0);
const changedLeaves = (a, b, path = '') => {
    if (Object.is(a, b)) return [];
    if (a && b && typeof a === 'object' && typeof b === 'object') return [...new Set([...Object.keys(a), ...Object.keys(b)])]
        .flatMap(k => changedLeaves(a[k], b[k], path ? `${path}.${k}` : k));
    return [path];
};
const corrupt = (condition, edit) => { const c = clone(condition); edit(c); assert.throws(() => validate(c)); };

test('328 finite conditions: 162 random accepted plans, 166 refusals; 16532 formal / 656 smoke, none sampled', () => {
    assert.equal(formal.length, 328); assert.equal(new Set(formal.map(c => c.id)).size, 328);
    assert.equal(formal.reduce((n, c) => n + c.samples, 0), 16532);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 656);
    assert.equal(formal.filter(c => c.parameters.random_effects).length, 162);
    assert.equal(formal.filter(c => c.parameters.expected === 'refused').length, 166);
    assert.equal(sha(JSON.stringify(formal)), '79dc43dd74c7a9f377a447f6954209868b6a1364066ada9b257da75b845acaab');
    assert.equal(sha(JSON.stringify(smoke)), '05fd84560881a7be996eed9bdba6a4d670442528314c3fc74eaf343f2432432d');
    for (let i = 0; i < formal.length; i++) {
        const c = formal[i]; validate(c); validate(smoke[i]);
        assert.deepEqual({ ...c, samples: 2, parameters: { ...c.parameters, run_mode: 'smoke' } }, smoke[i]);
        assert.equal(c.parameters.run_mode, 'formal');
        assert.equal(c.status, 'prepared_not_sampled'); assert.equal(c.method, 'perform');
        assert.equal(c.samples, c.parameters.expected === 'refused' ? 2 : 100);
        assert.equal(c.parameters.observe_seconds, 0);
    }
});

test('17 original entry signatures, exact catalog source/bases and independent per-entry counts', () => {
    for (const [skill, ability, usage, line, minimum, neili, count] of anchors) {
        const c = selected(ability), current = c.parameters;
        assert.equal(current.skill, skill); assert.equal(current.usage, usage);
        assert.equal(c.entry_id, `kungfu/skill/${skill}/${ability}.c:${line}:perform`);
        assert.match(read(current.source_entry.path).toString().split('\n')[line - 1], /^int perform\(/);
        assert.equal(current.base_source.sha256, sha(read(`kungfu/skill/${skill}.c`)));
        assert.equal(formal.filter(x => x.parameters.skill === skill && x.parameters.ability === ability).length, count);
        assert.equal(p(ability, 'minimum').actor.skills[skill], minimum);
        assert.equal(p(ability, `neili${neili}`).expected, 'observed');
        assert.equal(p(ability, `neili${neili - 1}`).expected, 'refused');
        assert.ok(!Object.hasOwn(current, 'measured_return') && !Object.hasOwn(c, 'raw'));
    }
});

test('51 baseline inputs use the agreed same character, raw stats, mapped Xinfa and explicit non-fair targets', () => {
    for (const [skill, ability, usage] of anchors) for (const level of [200, 400, 800]) {
        const q = p(ability, `level${level}`), a = q.actor;
        assert.equal(a.properties.character, '光明磊落');
        assert.deepEqual(['str', 'int', 'con', 'dex'].map(k => a.properties[k]), [36, 40, 36, 34]);
        for (const key of [skill, usage, 'dodge', 'shenghuo-bu']) assert.equal(a.skills[key], level);
        assert.equal(a.skills.force, Math.max(300, level)); assert.equal(a.skills['shenghuo-xinfa'], Math.max(300, level));
        assert.equal(a.mappings.force, 'shenghuo-xinfa'); assert.equal(a.skills['martial-cognize'], 100);
        assert.equal(a.properties.reborn, 0); assert.equal(a.properties.jiali, 0);
        assert.ok(a.properties.neili <= a.properties.max_neili);
        for (const key of ['zuoyou-hubo', 'count', 'jiuyang-shengong']) assert.equal(Object.hasOwn(a.skills, key), false);
        assert.equal(q.target_calibration, 'source_branch_support_not_equal_strength');
        assert.equal(q.preparation_scope, 'experimental_preload_not_natural_acquisition');
        if (a.equipment && !a.equipment.hold) {
            assert.ok(['staff', 'sword'].includes(a.equipment.type)); assert.equal(Object.hasOwn(a.equipment, 'program'), false);
        }
    }
});

test('minimum and resource boundary pairs change one real input, not both sides or hidden qualifications', () => {
    for (const [skill, ability, , , , neili] of anchors) {
        const low = p(ability, 'below-minimum'), min = p(ability, 'minimum');
        assert.deepEqual(changedLeaves(low.actor, min.actor), [`skills.${skill}`]);
        assert.deepEqual(low.target, min.target); assert.equal(low.expected, 'refused'); assert.equal(min.expected, 'observed');
        const under = p(ability, `neili${neili - 1}`), exact = p(ability, `neili${neili}`);
        assert.deepEqual(changedLeaves(under.actor, exact.actor), ['properties.neili']); assert.deepEqual(under.target, exact.target);
    }
    assert.equal(effective(p('fuxue', 'minimum').actor, 'finger'), 150);
    assert.equal(effective(p('fuxue', 'below-minimum').actor, 'finger'), 149);
    assert.equal(p('fei', 'minimum').actor.skills.sword, 120);
    assert.equal(effective(p('fei', 'minimum').actor, 'dodge'), 150);
    assert.equal(p('qi', 'max-neili2200').actor.properties.max_neili, 2200); // body valid_learn separately requires 2500
});

test('independent original gate oracle classifies all fixed plans without using production plan logic', () => {
    const noGrant = new Set(['ying', 'fuxue', 'san', 'zhua', 'qinna', 'nuoyi']);
    const prepareRequired = new Set(['jin', 'hun', 'feng', 'xue']);
    const forceMinimum = { feng: 260, jue: 260, lao: 140, xue: 80, hua: 150, fuxue: 150, san: 180, zui: 150 };
    const weapon = { lao: 'staff', fei: 'sword', kuai: 'sword', qi: 'sword', zui: 'sword' };
    for (const c of formal) {
        const q = c.parameters, a = q.actor, t = q.target, ability = q.ability;
        const [, , usage, , minimum, neili] = anchors.find(x => x[1] === ability);
        let yes = !a.busy && !a.temp?.no_perform && a.mappings[usage] === q.skill && q.fighting;
        if (!noGrant.has(ability)) yes &&= a.properties[`can_perform/${q.skill}/${ability}`] === 1;
        yes &&= (ability === 'fuxue' ? effective(a, 'finger') >= 150 : a.skills[q.skill] >= minimum);
        yes &&= a.properties.neili >= neili;
        if (ability !== 'hua') yes &&= q.target_state === 'living';
        if (prepareRequired.has(ability)) yes &&= a.preparations[usage] === q.skill;
        if (forceMinimum[ability]) yes &&= effective(a, 'force') >= forceMinimum[ability];
        if (['hun', 'qi'].includes(ability)) yes &&= a.skills.force >= 160;
        if (['hun', 'feng', 'jue'].includes(ability)) yes &&= a.properties.max_neili >= 2400;
        if (ability === 'qi') yes &&= a.properties.max_neili >= 2200;
        if (weapon[ability]) yes &&= a.equipment?.type === weapon[ability] && !a.equipment.hold;
        if (ability === 'xue') yes &&= !a.equipment && !a.secondary_equipment;
        if (['ying', 'fuxue', 'fei'].includes(ability)) yes &&= !t.busy;
        if (ability === 'fei') yes &&= effective(a, 'dodge') >= 150;
        if (ability === 'ying') yes &&= a.properties.str + Math.trunc(a.skills.claw / 10) >= 30;
        if (ability === 'hua') yes &&= a.equipment?.hold === true && a.equipment.type === 'throwing' && a.equipment.amount >= 10;
        assert.equal(q.expected, yes ? 'observed' : 'refused', c.id);
    }
});

test('effective force/str/dodge versus raw force gates and their original one-unit pairs are not conflated', () => {
    for (const [ability, threshold] of Object.entries({ feng: 260, jue: 260, lao: 140, xue: 80, hua: 150,
        fuxue: 150, san: 180, zui: 150 })) {
        const a = p(ability, `effective-force${threshold}`).actor, b = p(ability, `effective-force${threshold - 1}`).actor;
        assert.equal(Object.hasOwn(a.mappings, 'force'), false); assert.equal(effective(a, 'force'), threshold);
        assert.equal(effective(b, 'force'), threshold - 1); assert.deepEqual(changedLeaves(a, b), ['skills.force']);
    }
    for (const ability of ['hun', 'qi']) {
        assert.equal(p(ability, 'raw-force160').actor.skills.force, 160);
        assert.equal(p(ability, 'raw-force159').expected, 'refused');
        assert.ok(effective(p(ability, 'raw-force159').actor, 'force') > 160);
    }
    for (const n of [150, 149]) assert.equal(effective(p('fei', 'effective-dodge' + n).actor, 'dodge'), n);
    for (const n of [30, 29]) assert.equal(p('ying', 'effective-str' + n).actor.properties.str + 20, n);
});

test('six entries have no fabricated grants; four Shaolin mappings are NPC provenance not public teaching', () => {
    for (const ability of ['ying', 'fuxue', 'san', 'zhua', 'qinna', 'nuoyi']) {
        assert.equal(Object.keys(p(ability).actor.properties).some(k => k.startsWith('can_perform/')), false);
        assert.equal(formal.some(c => c.parameters.ability === ability && c.parameters.variant === 'grant0'), false);
    }
    for (const ability of ['fuxue', 'san', 'zhua', 'qinna']) {
        assert.equal(p(ability).relation_source.path, 'kungfu/class/mingjiao/fanyao.c');
        assert.equal(p(ability).relation_source.kind, 'npc_owned_mapping_not_public_teaching');
    }
    for (const ability of ['jue', 'ying', 'fuxue', 'san', 'zhua', 'qinna']) assert.equal(p(ability, 'unprepared').expected, 'observed');
    for (const ability of ['jin', 'hun', 'feng', 'xue']) assert.equal(p(ability, 'unprepared').expected, 'refused');
});

test('original direct types, percentages and perform fees remain source-derived and exclude public costs', () => {
    for (const [ability, type, percent, hit, miss] of [
        ['jin', 'UNARMED_ATTACK', 55, 120, 80], ['hun', 'UNARMED_ATTACK', 70, 300, 200],
        ['feng', 'UNARMED_ATTACK', 65, 280, 50], ['jue', 'UNARMED_ATTACK', 70, 350, 150],
        ['lao', 'WEAPON_ATTACK', 75, 180, 100], ['xue', 'UNARMED_ATTACK', 55, 200, 100],
        ['qi', 'WEAPON_ATTACK', 78, 300, 200], ['san', 'UNARMED_ATTACK', 40, 150, 50],
        ['zhua', 'UNARMED_ATTACK', 45, 180, 60], ['qinna', 'UNARMED_ATTACK', 30, 80, 20],
        ['zui', 'WEAPON_ATTACK', 70, 200, 100],
    ]) {
        const q = p(ability), m = q.mechanics, source = read(q.source_entry.path).toString();
        assert.equal(m.direct_type, type); assert.equal(m.direct_percent, percent);
        assert.deepEqual(m.perform_neili_fees, { outer_hit: hit, outer_miss: miss });
        for (const fee of [hit, miss]) assert.ok(source.includes(`me->add("neili", -${fee})`));
        assert.equal(m.source_derived_not_measured, true); assert.ok(m.costs_exclude.includes('public_jiali'));
    }
    for (const ability of ['ying', 'fei', 'fuxue', 'hua', 'kuai', 'nuoyi']) assert.equal(p(ability).mechanics.direct_type, null);
    assert.deepEqual(p('ying').mechanics.perform_neili_fees, { outer_hit: 150, outer_miss: 0 });
    assert.deepEqual(p('fuxue').mechanics.perform_neili_fees, { outer_hit: 100, outer_miss: 30 });
});

test('feng/jue final with jiali0 is a possible zero-level poison, not an ordinary hit_ob jiali10 exemption', () => {
    for (const ability of ['feng', 'jue']) {
        const zero = p(ability), seed = p(ability, 'jiali50-poison-seed');
        assert.equal(zero.actor.properties.jiali, 0); assert.equal(seed.actor.properties.jiali, 50);
        assert.deepEqual(changedLeaves(zero.actor, seed.actor), ['properties.jiali']);
        assert.equal(seed.mechanics.poison.final_ignores_jiali10_gate, true);
        assert.match(zero.mechanics.poison.zero_jiali, /level0_remain0.*not_poison_free/);
        assert.equal(seed.poison_window, 'synchronous_seed_only_natural_damage_and_expiry_not_prepared');
        assert.equal(seed.observation_plan.natural_poison_lifetime, 'not_prepared_not_observed');
        const final = read(seed.source_entry.path).toString().split('\n').slice(67).join('\n');
        assert.ok(final.startsWith('string final(object me, object target, int lvl) {'));
        assert.ok(final.includes('affect_by')); assert.equal(/jiali[^\n]*<\s*10/.test(final), false);
    }
});

test('HUA real flower_leaf, 9/10/11 amount and no living gate; synchronous zero is not natural destruction', () => {
    assert.deepEqual(p('hua').actor.equipment, { type: 'throwing', hold: true,
        program: '/clone/weapon/flower_leaf', hand_id: 'flower leaf', amount: 50 });
    for (const amount of [9, 10, 11]) {
        const q = p('hua', 'petals' + amount);
        assert.equal(q.actor.equipment.amount, amount); assert.equal(q.expected, amount < 10 ? 'refused' : 'observed');
    }
    assert.equal(p('hua', 'unconscious-target').expected, 'observed');
    assert.equal(p('hua', 'no-held-item').expected, 'refused'); assert.equal(p('hua', 'wrong-held-item').expected, 'refused');
    assert.equal(p('hua', 'petals10').item_window, 'needs_immediate_zero_and_original_callout0_destroy_evidence');
    assert.ok(p('hua').observation_plan.required_existing_or_future_evidence.includes('each_original_item_hit_ob_not_a_synthetic_direct'));
    assert.match(read('clone/weapon/flower_leaf.c').toString(), /set_amount\(50\)/);
    assert.match(read('inherit/item/combined.c').toString(), /call_out\("destruct_me", 0\)/);
});

test('KUAI ordinary burst retains original passive boundaries and extra fee80; busy is not whole-command refusal', () => {
    for (const variant of ['xy-raw129', 'xy-raw130', 'xy-dodge179', 'xy-dodge180', 'xy-force149', 'xy-force150', 'xy-passive-impossible'])
        assert.equal(p('kuai', variant).expected, 'observed');
    assert.equal(p('kuai').mechanics.perform_neili_fees.additional_xy_passive_each, 80);
    assert.equal(p('kuai').mechanics.perform_neili_fees.accepted, '30*N');
    assert.equal(p('kuai', 'xy-passive-impossible').target.skills.dodge, 1200);
    for (const [low, high, key] of [['xy-raw129', 'xy-raw130', 'xiaoyao-jian'],
        ['xy-dodge179', 'xy-dodge180', 'dodge'], ['xy-force149', 'xy-force150', 'force']]) {
        assert.equal(p('kuai', low).target.skills.dodge, 0);
        assert.deepEqual(p('kuai', low).target, p('kuai', high).target);
        assert.deepEqual(changedLeaves(p('kuai', low).actor, p('kuai', high).actor), ['skills.' + key]);
    }
    assert.equal(p('kuai', 'target-busy2').expected, 'observed'); assert.equal(p('qinna', 'target-busy2').expected, 'observed');
    for (const ability of ['ying', 'fei', 'fuxue']) assert.equal(p(ability, 'target-busy2').expected, 'refused');
});

test('one-enemy self-selection and active QKD middle/third roles use real enemies, not a guessed target or forced RNG', () => {
    assert.equal(p('zhua').action, 'perform claw.zhua'); assert.equal(p('qinna').action, 'perform hand.qinna');
    for (const ability of ['zhua', 'qinna']) assert.equal(formal.some(c => c.parameters.ability === ability && c.parameters.extra_target), false);
    const ap = q => q.actor.skills['qiankun-danuoyi'] + Math.trunc(effective(q.actor, 'force') * 2 / 3)
        + (q.actor.skills['qiankun-danuoyi'] >= 300 ? q.actor.skills['qiankun-danuoyi'] : 0);
    assert.equal(ap(p('nuoyi', 'ap-tier299')), 599); assert.equal(ap(p('nuoyi', 'ap-tier300')), 900);
    const middle = p('nuoyi', 'middle-no-third'), redirect = p('nuoyi', 'middle-with-third');
    assert.equal(middle.target.skills.force, 0);
    const attack = ap(middle), third = Math.trunc(attack / 3), defense = middle.target.skills.dodge;
    assert.equal(defense, 2 * third - 1);
    for (let first = 0; first < third; first++) assert.equal(third + first > defense, false);
    assert.ok(third + 0 < defense); assert.ok(!(third + (attack - 1) < defense));
    assert.match(middle.branch_support, /second_random_allows_resist_or_no_other_enemy/);
    assert.match(redirect.branch_support, /second_random_allows_resist_or_actual_redirect/);
    assert.deepEqual(middle.actor, redirect.actor); assert.deepEqual(middle.target, redirect.target);
    assert.equal(Object.hasOwn(middle, 'extra_target'), false); assert.equal(redirect.extra_target_fighting, true);
    assert.match(redirect.role_contract, /actual_role1_attack_role2; loop_redraw_each_comparison/);
    for (const level of [200, 400, 800]) {
        assert.equal(p('nuoyi', 'third-enemy-level' + level).extra_target_fighting, true);
        assert.equal(p('nuoyi', 'level' + level).extra_target, undefined);
    }
});

test('source pins bind 105 actual paths; 34 basic fallback suffixes and 31 mapped-source shadows must remain absent', () => {
    assert.equal(paths.length, 105); assert.equal(new Set(paths).size, 105);
    assert.equal(reviewed, '3526c574c5f2329bf8a61d310987855496fc4d6fc0880da3e8e7d4fd53193abe');
    assert.equal(absents.length, 65); assert.equal(new Set(absents).size, 65);
    for (const [, ability, usage] of anchors) for (const ext of ['c', 'lpc'])
        assert.ok(absents.includes(`kungfu/skill/${usage}/${ability}.${ext}`));
    for (const path of ['cmds/skill/perform.c', 'feature/command.c', 'adm/daemons/combatd.c',
        'adm/single/simul_efun/message.c', 'mudcore/system/kernel/simul_efun/file.c',
        'clone/weapon/flower_leaf.c', 'inherit/item/combined.c', 'kungfu/class/mingjiao/fanyao.c']) assert.ok(paths.includes(path));
    for (const path of ['cmds/skill/perform.c', 'kungfu/skill/xiaoyao-jian.c', 'kungfu/skill/tougu-zhen/feng.c',
        'feature/skill.c', 'inherit/item/combined.c']) assert.throws(() => factory(catalog,
        name => name === path ? Buffer.concat([read(name), Buffer.from('\n')]) : read(name)), /source changed/);
    for (const path of absents) assert.throws(() => factory(catalog,
        name => name === path ? Buffer.from('int perform() { return 1; }') : read(name)), /absence|appeared/);
    for (const value of [undefined, null, '', Buffer.alloc(0)]) assert.throws(() => factory(catalog, () => value));
    for (const result of [undefined, null, '', Buffer.alloc(0)]) assert.throws(() => factory(catalog,
        name => name === absents[0] ? result : read(name)), /absence|appeared/);
    assert.throws(() => factory(catalog, name => { if (name === absents[0]) throw Object.assign(new Error('denied'), { code: 'EACCES' }); return read(name); }), /denied/);
});

test('catalog duplicate/ambiguous entry, wrong base, source, function, line or ID is refused even beside a valid row', () => {
    for (const edit of [
        c => { c.skills.push(clone(c.skills.at(-1))); },
        c => { c.skills.push(clone(c.skills[0])); },
        c => { c.skills.at(-1).sha256 = '0'.repeat(64); },
        c => { c.skills.at(-1).entries.push({ ...clone(c.skills.at(-1).entries[0]), id: 'bad' }); },
        c => { c.skills.at(-1).entries[0].evidence.line++; },
        c => { c.skills.at(-1).entries[0].evidence.path = 'kungfu/skill/force.c'; },
        c => { c.skills.at(-1).entries[0].evidence.sha256 = '0'.repeat(64); },
        c => { c.skills.at(-1).entries[0].role = 'query_or_gate'; },
        c => { c.skills.at(-1).entries[0].function = 'exert'; },
        c => { c.skills.at(-1).base_skill = 'jiuyang-shengong'; },
        c => { c.skills.at(-1).top_level = true; },
        c => { c.skills[0].sha256 = '0'.repeat(64); },
        c => { c.skills[0].id = 'other'; },
        c => { c.skills[0].top_level = false; },
        c => { c.skills = c.skills.slice(1); },
    ]) { const changed = clone(catalog); edit(changed); assert.throws(() => factory(changed, read)); }
    assert.throws(() => factory(catalog, read, { smoke: 1 })); assert.throws(() => factory(catalog, null));
});

test('fixed condition rejects changed identity, command, expected outcome, planned samples and arbitrary extra/missing/null fields', () => {
    const base = selected('jin');
    for (const edit of [
        c => { c.id += '-other'; }, c => { c.stage = 'teaching'; }, c => { c.method = 'interface'; },
        c => { c.status = 'observed'; }, c => { c.samples = 3; }, c => { c.samples = Number.MAX_SAFE_INTEGER + 1; },
        c => { c.entry_id = c.entry_id.replace(':10:', ':11:'); }, c => { c.extra = 0; }, c => { delete c.samples; },
        c => { c.parameters.actor.properties.character = '国士无双'; }, c => { c.parameters.actor.properties.dex = 36; },
        c => { c.parameters.actor.skills.force = 200; }, c => { c.parameters.actor.skills['zuoyou-hubo'] = 400; },
        c => { c.parameters.actor.properties.neili = c.parameters.actor.properties.max_neili + 1; },
        c => { c.parameters.action += ' twice'; }, c => { c.parameters.expected = 'refused'; },
        c => { c.parameters.observe_seconds = 1; }, c => { c.parameters.observation_plan.rng = 'forced'; },
        c => { c.parameters.observation_plan.missing_actual_values = 0; },
        c => { c.parameters.target.properties.combat_exp++; }, c => { c.parameters.actor = null; },
        c => { delete c.parameters.actor.preparations; }, c => { c.parameters.room = null; },
        c => { c.parameters.source_entry.line++; }, c => { c.parameters.base_source.sha256 = '0'.repeat(64); },
        c => { c.parameters.qualification_sources.reverse(); }, c => { c.parameters.qualification_evidence.pop(); },
        c => { c.parameters.absent_sources.pop(); }, c => { c.parameters.reviewed_source_hash = '0'.repeat(64); },
        c => { delete c.parameters.source_evidence[paths[0]]; }, c => { c.parameters.source_evidence[paths[0]] = null; },
        c => { c.parameters.source_evidence.extra = '0'.repeat(64); },
        c => { c.parameters.actual_return = 1; }, c => { c.raw = {}; },
    ]) corrupt(base, edit);
    for (const invalid of [null, 0, false, '', [], {}, undefined]) assert.throws(() => validate(invalid));
});

test('independent calls and conditions share no mutable actor, target, source or observation plan objects', () => {
    const other = factory(catalog, read), before = clone(other.slice(1));
    other[0].parameters.actor.skills.force = 1;
    other[0].parameters.target.properties.neili = -1;
    other[0].parameters.source_evidence[paths[0]] = '0'.repeat(64);
    other[0].parameters.observation_plan.required_existing_or_future_evidence.push('invented');
    assert.deepEqual(other.slice(1), before); assert.deepEqual(factory(catalog, read), formal);
    validate(formal[0]);
});

test('all lifecycle and native-consumer gaps are explicit; no observation is manufactured from source expectations', () => {
    assert.deepEqual(Object.keys(subject).sort(), ['mingjiaoRemainingPerformAbsentPaths', 'mingjiaoRemainingPerformConditions',
        'mingjiaoRemainingPerformReviewedSourceHash', 'mingjiaoRemainingPerformSourcePaths', 'validateMingjiaoRemainingPerformCondition']);
    for (const c of formal) {
        const q = c.parameters, o = q.observation_plan;
        assert.equal(o.status, 'unregistered_preparation'); assert.equal(o.record_validator, 'not_implemented');
        assert.equal(o.command_cost, 'actual_nonnegative_safe_integer_not_boolean');
        assert.equal(o.accepted_denominator, 'one_original_command_if_cost_positive');
        assert.equal(o.natural_busy_release, 'not_prepared_not_observed');
        assert.equal(o.natural_poison_lifetime, 'not_prepared_not_observed');
        assert.equal(o.original_clock, 'unchanged_no_manual_callback_or_busy_clear');
        assert.equal(q.mechanics.busy_unit, 'original_heartbeat_count_not_seconds');
        assert.match(q.qualification_note, /没有Record\/Effects或真实样本/);
    }
});

test('formal and smoke bind planned samples; 100-to-2 alone, missing/invalid mode and smoke100 are refused', () => {
    const c = selected('jin', 'level200'), index = formal.indexOf(c);
    corrupt(c, x => { x.samples = 2; });
    for (const edit of [x => { delete x.parameters.run_mode; }, x => { x.parameters.run_mode = null; },
        x => { x.parameters.run_mode = 'live'; }, x => { x.parameters.run_mode = 'smoke'; }]) corrupt(c, edit);
    const s = smoke[index];
    assert.equal(s.parameters.run_mode, 'smoke');
    assert.equal(s.samples, 2);
    validate(s);
    corrupt(s, x => { x.samples = 100; });
    corrupt(s, x => { x.parameters.run_mode = 'formal'; });
});
