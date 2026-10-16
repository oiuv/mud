// Pure preparation/metadata tests: no driver, native samples, random draws or evidence writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as prepared from './school_mingjiao_remaining_base_cases.mjs';

const { mingjiaoRemainingBaseProfiles: profiles, mingjiaoRemainingBaseSourcePaths: paths,
    mingjiaoRemainingBaseReviewedSourceHash: reviewedHash, mingjiaoRemainingBaseConditions: make,
    validateMingjiaoRemainingBaseCondition: validate } = prepared;
const root = fileURLToPath(new URL('../../../', import.meta.url));
const readSource = path => readFileSync(resolve(root, path));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
// Minimal catalog-shaped fixtures are derived from actual source lines, not simulated effects.
const ids = [...profiles.map(p => p.skill), 'hanbing-mianzhang'];
const catalog = { skills: ids.map(id => {
    const path = `kungfu/skill/${id}.c`, bytes = readSource(path), sha256 = sha(bytes);
    const entries = bytes.toString('utf8').split('\n').flatMap((line, index) => {
        const match = /^(?:int|mapping|mixed)\s+(valid_enable|valid_learn|practice_skill|query_action|hit_ob)\(/.exec(line);
        return match ? [{ id: `${path}:${index + 1}:${match[1]}`, function: match[1],
            evidence: { path, sha256, line: index + 1 } }] : [];
    });
    return { id, path, sha256, entries };
}) };
const conditions = make(catalog, readSource);
const select = (skill, ability, variant, level = 200) => {
    const c = conditions.find(c => c.parameters.skill === skill && c.parameters.ability === ability
        && c.parameters.variant === variant && c.parameters.level === level);
    assert.ok(c, [skill, ability, variant, level].join('/')); return c;
};
const q = (...args) => select(...args).parameters;
const total = items => items.reduce((n, c) => n + c.samples, 0);
const mutate = (c, fn) => { const changed = structuredClone(c); fn(changed); return changed; };

test('private canonical cache never trusts a previously validated mutable input or leaks factory values', () => {
    const smoke = make(catalog, readSource, { smoke: true });
    for (const c of [...conditions, ...smoke]) {
        for (const edit of [x => { x.samples++; }, x => { x.parameters.actor.properties.qi++; },
            x => { delete x.parameters.run_mode; }]) {
            const changed = structuredClone(c);
            validate(changed);
            edit(changed);
            assert.throws(() => validate(changed));
        }
    }
    const another = make(catalog, readSource);
    another[0].parameters.actor.properties.qi++;
    assert.throws(() => validate(another[0]));
    assert.deepEqual(make(catalog, readSource), conditions);
    assert.deepEqual(make(catalog, readSource, { smoke: true }), smoke);
});

test('exact 13 reviewed bodies; 12 ordinary/parry skills, no invented duoming action or defense hook', () => {
    assert.deepEqual(profiles.map(p => p.skill), [
        'pili-quan', 'pili-shou', 'tougu-zhen', 'yinfeng-dao', 'yinhu-zhang', 'sougu-yingzhua',
        'duoming-jinhua', 'xiaoyao-jian', 'nianhua-zhi', 'sanhua-zhang', 'longzhua-gong', 'fengyun-shou', 'pomopima-jian',
    ]);
    assert.equal(profiles.filter(p => p.action_line).length, 12);
    assert.equal(new Set(conditions.filter(c => c.parameters.ability === 'ordinary').map(c => c.parameters.skill)).size, 12);
    assert.equal(new Set(conditions.filter(c => c.parameters.ability === 'parry').map(c => c.parameters.skill)).size, 12);
    const flower = conditions.filter(c => c.parameters.skill === 'duoming-jinhua');
    assert.ok(flower.length > 0 && flower.every(c => c.method !== 'ordinary'));
    assert.ok(conditions.every(c => !['valid_damage', 'query_effect_parry', 'valid_parry'].includes(c.parameters.interface?.function)));
    assert.ok(!Object.keys(prepared).some(k => /Record|Effects/.test(k)), 'no pretend raw validator or measured effects');
});
test('finite deterministic factory; all prepared, formal100/random and separate smoke2', () => {
    assert.equal(new Set(conditions.map(c => c.id)).size, conditions.length);
    const smoke = make(catalog, readSource, { smoke: true });
    assert.equal(smoke.length, conditions.length); assert.equal(total(smoke), conditions.length * 2);
    assert.deepEqual(make(catalog, readSource), conditions);
    for (let i = 0; i < conditions.length; i++) {
        const c = conditions[i], p = validate(c); validate(smoke[i]);
        assert.equal(c.status, 'prepared_not_sampled'); assert.equal(p.integration.registered, false);
        assert.equal(p.integration.native_samples, 'not_collected'); assert.ok(p.integration.missing.length >= 3);
        assert.equal(c.samples, p.randomized ? 100 : 2); assert.equal(smoke[i].samples, 2);
        assert.equal(p.run_mode, 'formal'); assert.equal(smoke[i].parameters.run_mode, 'smoke');
        assert.ok(!Object.hasOwn(c, 'raw'));
    }
    assert.ok(total(conditions) > total(smoke));
});
test('normal combat baseline fixes raw stats, cognize100 and force+xinfa max300/L, without hidden grants', () => {
    for (const p of profiles.filter(p => p.action_line)) for (const l of [200, 400, 800]) {
        const a = q(p.skill, 'ordinary', 'baseline', l).actor;
        assert.equal(a.skills[p.skill], l); assert.equal(a.skills[p.usage], l);
        assert.equal(a.skills.force, Math.max(300, l)); assert.equal(a.skills['shenghuo-xinfa'], Math.max(300, l));
        assert.equal(a.skills['martial-cognize'], 100);
        assert.deepEqual([a.properties.str, a.properties.int, a.properties.con, a.properties.dex], [36, 40, 36, 34]);
        assert.equal(a.properties.character, '光明磊落'); assert.equal(a.properties.jiali, 0);
        assert.ok(!Object.keys(a.properties).some(k => k.startsWith('can_perform/') || k.startsWith('can_learn/')));
        assert.equal(a.skills.count, undefined);
        if (p.weapon) assert.deepEqual(a.equipment, { type: p.weapon, hold: false });
        else assert.deepEqual(a.preparations, { [p.usage]: p.skill });
    }
});
test('ordinary fallback and public parry controls do not pretend original special action was selected', () => {
    for (const p of profiles.filter(p => p.action_line)) {
        const fallback = q(p.skill, 'ordinary', 'unmapped-control');
        assert.equal(fallback.actor.mappings[p.usage], undefined);
        assert.equal(fallback.requirements.selected_action, 'observe_original_fallback_not_special_skill');
        if (!p.weapon) assert.deepEqual(q(p.skill, 'ordinary', 'no-prepare-control').actor.preparations, {});
        const parry = q(p.skill, 'parry', 'mapped'), unmapped = q(p.skill, 'parry', 'unmapped-control');
        assert.equal(parry.observation_role, 'defense'); assert.equal(parry.target.mappings.parry, p.skill);
        assert.equal(unmapped.target.mappings.parry, undefined); assert.deepEqual(parry.target.preparations, {});
        assert.deepEqual(parry.actor.mappings, { force: 'shenghuo-xinfa' });
        assert.equal(parry.requirements.independent_defense_hook, false);
    }
});
test('13 own practice gates and exact qi/neili costs are paired, with no learning gain claim', () => {
    for (const p of profiles) {
        const yes = q(p.skill, 'practice_skill', 'minimum');
        assert.deepEqual(yes.interface, { object: '/kungfu/skill/' + p.skill, function: 'practice_skill' });
        assert.equal(yes.actor.properties.qi, p.qi_gate); assert.equal(yes.actor.properties.neili, p.neili_gate);
        assert.equal(yes.requirements.qi_cost, p.qi_cost); assert.equal(yes.requirements.neili_cost, p.neili_cost);
        assert.equal(yes.requirements.learned_gain, 0);
        for (const v of ['qi-below', 'neili-below']) {
            const no = q(p.skill, 'practice_skill', v);
            assert.equal(no.expected, 'refused'); assert.equal(no.requirements.expected_return, 0);
            assert.equal(no.requirements.qi_cost, 0); assert.equal(no.requirements.neili_cost, 0);
        }
    }
    assert.equal(q('pili-shou', 'practice_skill', 'minimum').requirements.qi_cost, 6);
});
test('practice equipment guards only exist where original practice_skill has them', () => {
    for (const p of profiles) {
        const cases = conditions.filter(c => c.parameters.skill === p.skill && c.parameters.ability === 'practice_skill'
            && c.parameters.variant === 'equipment-refusal');
        assert.equal(cases.length, Number(Boolean(p.practice_equipment)));
        if (p.practice_equipment === 'empty') assert.deepEqual(cases[0].parameters.actor.equipment, { type: 'sword', hold: false });
        else if (p.practice_equipment) assert.equal(cases[0].parameters.actor.equipment, undefined);
    }
});
test('public practice uses true mapped basic L+1 and original qualifications; equal-level refuses before fee', () => {
    for (const p of profiles) {
        for (const l of [200, 400, 800]) {
            const c = select(p.skill, 'public_practice', 'basic-plus-one', l), x = c.parameters;
            assert.equal(c.method, 'practice'); assert.equal(x.action, `practice ${p.usage} 1`);
            assert.equal(x.fighting, false); assert.deepEqual(x.room, {});
            assert.equal(x.actor.skills[p.usage], l + 1); assert.equal(x.actor.skills[p.skill], l);
            assert.equal(x.actor.mappings[p.usage], p.skill); assert.ok(x.actor.properties.combat_exp >= Math.trunc(l ** 3 / 10));
            assert.ok(x.requirements.gates.includes('valid_learn')); assert.ok(x.requirements.gates.includes('can_learn'));
            assert.equal(x.interface, undefined);
            assert.ok(x.integration.missing.includes('original_public_practice_command_observation'));
        }
        const no = q(p.skill, 'public_practice', 'basic-equal-refusal');
        assert.equal(no.requirements.completed, 0); assert.equal(no.requirements.qi_cost, 0);
    }
});
test('source-valid learning minimum and paired force/max_neili/basic failures distinguish raw from effective', () => {
    for (const p of profiles) {
        const min = q(p.skill, 'valid_learn', 'minimum'), low = q(p.skill, 'valid_learn', 'force-below');
        const force = a => p.raw_force_gate ? a.skills.force : Math.trunc(a.skills.force / 2)
            + (a.skills[a.mappings.force] ?? 0);
        assert.equal(force(min.actor), p.force_gate); assert.equal(force(low.actor), p.force_gate - 1);
        assert.equal(min.actor.properties.max_neili, p.max_neili_gate);
        assert.equal(q(p.skill, 'valid_learn', 'max-neili-below').actor.properties.max_neili, p.max_neili_gate - 1);
        assert.equal(min.actor.skills[p.usage], min.actor.skills[p.skill]);
        assert.equal(q(p.skill, 'valid_learn', 'basic-below-special').actor.skills[p.usage], 199);
        assert.equal(min.requirements.expected_return, 1); assert.equal(low.requirements.expected_return, 0);
    }
    const sword = q('xiaoyao-jian', 'valid_learn', 'minimum');
    assert.equal(sword.actor.properties.int, 30); assert.equal(sword.actor.skills.dodge, 120);
});
test('three original poison hit_ob boundaries keep jiali0/9/10 and level79/80 distinct', () => {
    for (const s of ['hanbing-mianzhang', 'yinfeng-dao', 'tougu-zhen']) {
        for (const [v, l, j] of [['level79-jiali10', 79, 10], ['level80-jiali0', 80, 0], ['level80-jiali9', 80, 9]]) {
            const c = select(s, 'poison', v, l), p = c.parameters;
            assert.equal(p.actor.properties.jiali, j); assert.equal(p.requirements.expected_condition, 'absent');
            assert.equal(c.samples, 2); assert.equal(c.method, 'interface');
        }
        const p = q(s, 'poison', 'level80-jiali10', 80);
        assert.equal(p.requirements.expected_condition, 'present'); assert.equal(p.interface.damage, 100);
        assert.ok(p.requirements.not_proof_of.includes('player_learning_qualification'));
        for (const l of [200, 400, 800]) assert.equal(select(s, 'poison', 'legal-level' + l, l).samples, 100);
        assert.equal(q(s, 'poison', 'zero-incoming').interface.damage, 0);
        assert.equal(q(s, 'poison', 'force-blocks').target.skills.force / 2, 220);
    }
});
test('cold duration differs from yin/tou; no active feng/jue/final nor injected condition', () => {
    const cold = q('hanbing-mianzhang', 'poison', 'legal-level200').requirements.poison_support;
    assert.equal(cold.duration_expression, 'lvl/50+random(lvl/20)');
    assert.equal(cold.duration_base, 4); assert.equal(cold.duration_random_bound, 10);
    for (const s of ['yinfeng-dao', 'tougu-zhen']) {
        const p = q(s, 'poison', 'legal-level200').requirements.poison_support;
        assert.equal(p.duration_expression, 'lvl/100+random(lvl/10)');
        assert.equal(p.duration_base, 2); assert.equal(p.duration_random_bound, 20);
    }
    assert.ok(conditions.every(c => c.method !== 'perform' && !/perform|final/.test(c.parameters.action)));
    assert.ok(conditions.every(c => !c.parameters.actor.conditions && !c.parameters.target.conditions));
});
test('immunity at seed vs on original tick differs; natural ordinary and lifecycle are separate', () => {
    for (const s of ['hanbing-mianzhang', 'yinfeng-dao', 'tougu-zhen']) {
        assert.equal(q(s, 'poison', 'piyi').requirements.expected_condition, 'absent');
        for (const v of ['immune-still-seeded', 'nopoison-still-seeded'])
            assert.equal(q(s, 'poison', v).requirements.expected_condition, 'present');
        for (const l of [200, 400, 800]) {
            const c = select(s, 'ordinary_poison', 'nonzero-jiali', l);
            assert.equal(c.method, 'ordinary'); assert.equal(c.parameters.actor.properties.jiali, 10);
            assert.equal(c.parameters.requirements.effect_not_guaranteed, true);
            assert.equal(c.parameters.requirements.condition_tick_or_removal_observed, false);
        }
        for (const mode of ['normal', 'immune', 'nopoison', 'piyi']) {
            const c = select(s, 'poison_lifecycle', mode), p = c.parameters, r = p.requirements;
            assert.equal(c.method, 'condition'); assert.equal(r.seed_mode, 'original_ordinary');
            assert.equal(r.seed_attempts, 1); assert.equal(r.victim_side, 1); assert.equal(r.heartbeat_side, 1);
            assert.equal(r.preset_condition, false); assert.equal(r.seed_miss_completes_lifecycle, false);
            assert.equal(r.tick_clock, 'original_char_next_beat'); assert.equal(r.completion, 'original_condition_removal');
            assert.equal(r.watchdog_is_effect_duration, false); assert.equal(p.target.skills.force / 2, 40);
            assert.ok(p.integration.missing.includes('victim_side_1_condition_and_heartbeat_observation'));
            assert.ok(r.required_raw.includes('after_clear_conditions'));
            assert.ok(r.required_raw.includes('seed_passives')); assert.equal(c.samples, 100);
        }
    }
});
test('xiaoyao busy preserves original fee, basic gates, returned integer and zero-damage behavior', () => {
    for (const l of [200, 400, 800]) {
        const p = q('xiaoyao-jian', 'busy_passive', 'baseline', l);
        assert.equal(p.requirements.fee_on_proc, 80); assert.equal(p.requirements.returned_integer_on_proc, 1);
        assert.equal(p.requirements.busy_argument, `2+random(${Math.trunc(l / 30)})`);
        assert.equal(p.requirements.public_busy_result, 'observe_original_start_busy_not_argument_as_duration');
    }
    assert.equal(select('xiaoyao-jian', 'busy_passive', 'level129', 129).samples, 2);
    for (const [field, gate] of [['neili', 150], ['dodge', 180], ['force', 150]]) {
        const no = q('xiaoyao-jian', 'busy_passive', field + '-below'), yes = q('xiaoyao-jian', 'busy_passive', field + '-minimum');
        assert.equal((field === 'neili' ? no.actor.properties : no.actor.skills)[field], gate - 1);
        assert.equal((field === 'neili' ? yes.actor.properties : yes.actor.skills)[field], gate);
        assert.equal(no.requirements.neili_cost, 0); assert.equal(no.requirements.guard_blocks, true);
        assert.equal(yes.requirements.guard_blocks, false);
    }
    assert.equal(q('xiaoyao-jian', 'busy_passive', 'target-busy').target.busy, 2);
    assert.equal(q('xiaoyao-jian', 'busy_passive', 'dodge-impossible').target.skills.dodge, 300);
    assert.equal(q('xiaoyao-jian', 'busy_passive', 'dodge-boundary-possible').target.skills.dodge, 299);
    assert.equal(q('xiaoyao-jian', 'busy_passive', 'zero-incoming').interface.damage, 0);
    assert.equal(q('xiaoyao-jian', 'busy_passive', 'zero-incoming').requirements.guard_blocks, false);
});
test('81 selected original sources, including condition parents and public-practice gates, fail closed on drift', () => {
    assert.equal(paths.length, 81); assert.equal(new Set(paths).size, paths.length);
    assert.equal(sha(JSON.stringify(paths.map(p => [p, sha(readSource(p))]))), reviewedHash);
    for (const path of ['inherit/condition/poison.c', 'feature/condition.c', 'inherit/char/char.c',
        'kungfu/condition/ice_poison.c', 'kungfu/condition/yinfeng_dao.c', 'kungfu/condition/tougu_zhen.c',
        'cmds/skill/practice.c', 'cmds/skill/learn.c']) {
        assert.ok(paths.includes(path));
        assert.throws(() => make(catalog, p => p === path ? Buffer.from('changed') : readSource(p)));
    }
    assert.throws(() => make(catalog, () => undefined));
    assert.throws(() => make(catalog, readSource, { smoke: 1 }));
    for (const samples of [0, 1, 2, 99, 101, NaN]) assert.throws(() => make(catalog, readSource, { samples }));
});
test('catalog exact id/path/hash/function/line bindings reject missing, duplicate, stale and forged entries', () => {
    for (const edit of [x => { x.skills.pop(); }, x => { x.skills.push(structuredClone(x.skills[0])); },
        x => { x.skills[0].id = 'other'; }, x => { x.skills[0].path = 'elsewhere'; },
        x => { x.skills[0].sha256 = '0'.repeat(64); }, x => { x.skills[0].entries.pop(); },
        x => { x.skills[0].entries.push(structuredClone(x.skills[0].entries[0])); },
        x => { x.skills[0].entries[0].id += '-wrong'; }, x => { x.skills[0].entries[0].evidence.line++; },
        x => { x.skills[0].entries[0].evidence.path = 'other'; },
        x => { x.skills[0].entries[0].evidence.sha256 = '0'.repeat(64); }]) {
        const changed = structuredClone(catalog); edit(changed); assert.throws(() => make(changed, readSource));
    }
});
test('strict condition metadata rejects omissions, unsupported mutation and false native/smoke success', () => {
    const c = select('hanbing-mianzhang', 'poison_lifecycle', 'normal');
    for (const edit of [x => { x.id += '-other'; }, x => { x.raw = {}; }, x => { x.status = 'completed'; },
        x => { x.method = 'perform'; }, x => { x.entry_id += '-other'; }, x => { x.samples = 2; },
        x => { x.parameters.extra = 1; }, x => { delete x.parameters.requirements; },
        x => { x.parameters.requirements.seed_attempts = 10; }, x => { x.parameters.requirements.victim_side = 0; },
        x => { x.parameters.requirements.preset_condition = true; },
        x => { x.parameters.integration.registered = true; }, x => { x.parameters.integration.missing = []; },
        x => { x.parameters.actor.properties.int++; }, x => { x.parameters.actor.skills.count = 100; },
        x => { x.parameters.actor.properties['can_perform/hanbing-mianzhang/jue'] = 1; },
        x => { x.parameters.run_mode = 'live'; }, x => { x.parameters.base_source.sha256 = '0'.repeat(64); },
        x => { x.parameters.source_entry.line++; }, x => { x.parameters.qualification_evidence.reverse(); },
        x => { delete x.parameters.source_evidence['feature/condition.c']; },
        x => { x.parameters.source_evidence['feature/condition.c'] = '0'.repeat(64); },
        x => { x.parameters.reviewed_source_hash = '0'.repeat(64); }]) assert.throws(() => validate(mutate(c, edit)));
});
test('returned conditions do not share actors, sources or requirement arrays with each other or next generation', () => {
    const fresh = make(catalog, readSource);
    fresh[0].parameters.actor.properties.qi = 1;
    fresh[0].parameters.source_evidence[paths[0]] = '0'.repeat(64);
    fresh[0].parameters.integration.missing.push('changed');
    fresh[0].parameters.qualification_sources.reverse();
    assert.deepEqual(fresh.slice(1), conditions.slice(1));
    assert.deepEqual(make(catalog, readSource), conditions);
});
