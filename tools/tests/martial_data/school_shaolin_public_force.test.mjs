import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinPublicForceConditions, shaolinRoarEffects } from './school_shaolin_public_force_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = shaolinPublicForceConditions(catalog);
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('少林公共能力新增272条件5444样本，旧6895条件160724样本不变', () => {
    assert.equal(cases.length, 272); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 5444);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 6895); assert.equal(old.reduce((n, c) => n + c.samples, 0), 160724);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'shaolin-public-force'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.ok(shaolinPublicForceConditions(catalog, { smoke: true }).every(c => c.samples === 2));
    for (const c of cases) for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    assert.ok(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8').includes("'tools/tests/martial_data/school_shaolin_public_force_cases.mjs'"));
});

test('四门少林内功独立公共入口，佛学控制反噬，剑法不混用太极剑', () => {
    const commons = cases.filter(c => c.parameters.ability !== 'roar');
    assert.equal(commons.length, 240);
    for (const c of commons) {
        const p = c.parameters;
        assert.equal(p.actor.skills.buddhism, 800);
        assert.equal(p.actor.properties['family/family_name'], '少林派');
        assert.ok(!p.actor.skills['taiji-jian']);
        if (p.actor.mappings.sword) assert.equal(p.actor.mappings.sword, 'damo-jian');
        assert.ok(p.qualification_note.includes('仅即时效果'));
    }
    assert.ok(cases.filter(c => c.parameters.ability === 'shot').every(c => c.parameters.expected === 'refused'));
    const roar = cases.filter(c => c.parameters.ability === 'roar');
    assert.equal(roar.filter(c => c.parameters.expected === 'refused').length, 9);
    assert.deepEqual(roar.filter(c => c.id.endsWith('whitelist-refused')).map(c => c.parameters.skill),
        ['shaolin-xinfa', 'hunyuan-yiqi', 'shaolin-jiuyang']);
});

// Synthetic records only test the verifier; real driver evidence is collected separately.
function row(c, randomPass = true) {
    const p = c.parameters;
    const make = (config, id) => ({ ...structuredClone(config.properties), skills: structuredClone(config.skills),
        mappings: structuredClone(config.mappings), conditions: structuredClone(config.conditions ?? null),
        userp: 1, wizardp: 0, ghost: 0, living: 1, busy: config.busy ?? 0, object: '/tests/' + id, id,
        effective_skills: { force: Math.trunc(config.skills.force / 2) + (config.skills[config.mappings.force] ?? 0) },
        hostility: { enemies: [], killers: [], wants: [] } });
    const b = make(p.actor, 'left'), t = make(p.target, 'right'), third = make(p.extra_target, 'third');
    if (p.target_state === 'unconscious') Object.assign(t, { qi: 0, jing: 0, living: 0 });
    const r = { before: [b, t], immediate: structuredClone([b, t]), extra_target_before: third,
        extra_target_immediate: structuredClone(third), command_accepted: Number(p.expected === 'observed'),
        launches: [], attacks: [], interfaces: [], metrics: [{}, {}], extra_target_metrics: {},
        outcome: p.expected, reason: p.expected === 'refused' ? '原命令拒绝' : '' };
    if (r.command_accepted) {
        const a = r.immediate[0], skill = b.effective_skills.force, min = Math.trunc(skill / 2);
        a.neili -= 800; a.busy = 5; r.metrics[0].neili_cost = 800; r.launches.push({ skill: 'force' });
        for (const [before, after, m] of [[t, r.immediate[1], r.metrics[1]], [third, r.extra_target_immediate, r.extra_target_metrics]]) {
            if (!before.living || before.conditions?.die_guard || min * 2 - 1 < before.con * 2
                || (min < before.con * 2 && !randomPass)) continue;
            const damage = Math.max(0, skill - Math.trunc(before.max_neili / 10));
            const wound = before.neili < skill * 2 ? damage : 0;
            after.eff_jing = Math.max(-1, before.eff_jing - wound);
            after.jing = Math.min(after.eff_jing, Math.max(-1, before.jing - damage * 2));
            const faint = damage && (after.jing < 1 || after.eff_jing < 1);
            if (faint) { after.jing = 10; after.eff_jing += 10; after.qi = 0; after.living = 0; }
            for (const k of ['qi', 'jing', 'eff_jing']) {
                const delta = after[k] - before[k];
                if (delta) m[k + (delta < 0 ? '_cost' : '_recovery')] = Math.abs(delta);
            }
            if (after.living) { after.hostility.killers.push('left'); after.hostility.enemies.push('left'); }
            a.hostility.enemies.push(before.id); a.hostility.wants.push(before.id);
        }
    }
    r.after = structuredClone(r.immediate); r.extra_target_after = structuredClone(r.extra_target_immediate);
    return r;
}

test('狮子吼原门槛与可变根骨分支均可核验，拒绝不是成功', () => {
    for (const c of cases.filter(c => c.parameters.ability === 'roar'))
        for (const passed of [true, false]) validateSchoolCombatRecord(row(c, passed), c);
    const c = find('roar-l200-neili799'), bad = row(c); bad.command_accepted = 1;
    assert.throws(() => validateSchoolCombatRecord(bad, c));
});

test('无精神损失仍可能敌对，精神损失与有效精神损失分别核验', () => {
    const c = find('roar-l400-normal-resistance'), r = row(c);
    assert.equal(r.after[1].jing, 10000); assert.deepEqual(r.after[1].hostility.killers, ['left']);
    r.after[1].hostility.killers = []; r.immediate = structuredClone(r.after);
    assert.throws(() => validateSchoolCombatRecord(r, c));
    assert.equal(row(find('roar-l200-wound-below')).after[1].eff_jing, 9700);
    assert.equal(row(find('roar-l200-wound-equal')).after[1].eff_jing, 10000);
});

test('死亡保护和已昏迷者跳过，同室第三人独立受伤，不能只检查指定目标', () => {
    for (const suffix of ['die-guard', 'already-unconscious']) {
        const c = find('roar-l200-' + suffix), r = row(c);
        assert.deepEqual(r.after[1], r.before[1]); validateSchoolCombatRecord(r, c);
    }
    const c = find('roar-l200-both-hit'), r = row(c);
    assert.equal(r.extra_target_after.jing, 9400);
    r.extra_target_after.jing = 10000; r.extra_target_immediate = structuredClone(r.extra_target_after);
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('低精神和低有效精神组保留昏迷重置及10点回补，不当作净600伤害', () => {
    for (const suffix of ['unconscious-on-hit', 'wound-unconscious']) {
        const c = find('roar-l200-' + suffix), r = row(c);
        assert.equal(r.after[1].living, 0); assert.equal(r.after[1].jing, 10); assert.equal(r.after[1].qi, 0);
        validateSchoolCombatRecord(r, c);
        r.after[1].jing = 0; r.immediate = structuredClone(r.after);
        assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('统计保留两个目标、随机抵抗、昏迷和各自净变化', () => {
    const c = find('roar-l200-con-random');
    const effects = shaolinRoarEffects([true, false].map(pass => ({ outcome: 'observed', raw: row(c, pass) })));
    assert.equal(effects[0].hostile.successes, 1); assert.equal(effects[0].hostile.trials, 2);
    assert.equal(effects[0].jing_net.mean, -300); assert.equal(effects[1].hostile.successes, 0);
    assert.equal(shaolinRoarEffects([{ outcome: 'observed', raw: row(find('roar-l200-unconscious-on-hit')) }])[0].fainted, 1);
});
