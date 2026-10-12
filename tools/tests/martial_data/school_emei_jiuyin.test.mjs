import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan } from './school_combat_report.mjs';
import { emeiJiuyinConditions, validateEmeiJiuyinRecord, emeiJiuyinEffects } from './school_emei_jiuyin_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = emeiJiuyinConditions(catalog);
const pick = (ability, suffix = '') => {
    const c = cases.find(c => c.parameters.ability === ability && c.id.endsWith('-l200' + suffix));
    assert.ok(c, ability + suffix); return c;
};

// Synthetic validator inputs only; never count as real martial observations.
function record(c, hit = false, second = false) {
    const p = c.parameters, before = [p.actor, p.target].map(cfg => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
        neili: 6000, max_neili: 6000, ghost: 0, ...cfg.properties,
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations ?? {}),
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)])),
        jiuyin_grants: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.startsWith('can_perform/'))),
        weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? 0, temp: { apply: {} },
    }));
    const r = { outcome: p.expected, before, immediate: structuredClone(before), metrics: [{}, {}],
        launches: [], attacks: [], dropped: [], terminals: [], reason: '', elapsed: p.observe_seconds };
    const [a, t] = r.immediate, [b, bt] = before;
    if (p.expected === 'refused') r.reason = '原拒绝';
    else if (c.method === 'ordinary') r.attacks = [{ actor: 0, target: 1, type: 0 }];
    else {
        r.launches = [{ skill: p.skill, argument: p.ability }];
        let cost, direct = hit;
        if (p.ability === 'duo') { cost = hit && !second ? 100 : 250; a.busy = cost === 100 ? 2 : 3; }
        if (p.ability === 'zhua') {
            cost = hit ? 230 : 50; a.busy = 2;
            const weak = hit && b.max_neili < Math.trunc(bt.max_neili * 4 / 5) && b.effective_skills.force < bt.effective_skills.force;
            const lethal = hit && !weak && b.max_neili > bt.max_neili * 2;
            direct = hit && !weak && !lethal;
            if (lethal) {
                for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) t[key] = 1;
                t.ghost = 1; r.terminals = [{ side: 1, state: 'death' }];
            }
            else if (direct) t.busy = 2;
        }
        if (p.ability === 'cui') {
            cost = hit ? 260 : 120; a.busy = hit ? 2 : 3;
            if (hit) { t.temp.cuixin = 1; t.temp.apply.parry = -Math.trunc(b.skills[p.skill] / 8); }
        }
        if (p.ability === 'zhu') { cost = hit ? 200 : 100; a.busy = hit ? 2 : 3; }
        a.neili -= cost; r.metrics[0] = { neili_cost: cost, direct: Number(direct) };
        if (direct) { t.qi -= 100; t.eff_qi -= 50; }
    }
    r.after = structuredClone(r.immediate);
    if (p.observe_seconds) { delete r.after[1].temp.cuixin; r.after[1].temp.apply.parry = 0; }
    return r;
}

test('周芷若额外攻招来源、固定边界与注册完整，旧10959条件指纹不变', () => {
    const all = schoolCombatConditions(catalog);
    const historical = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school));
    const old = historical.filter(c => !['emei-jiuyin', 'emei-jiuyin-buff', 'emei-yijin', 'emei-shexing', 'emei-jiuyin-learning', 'emei-jiuyin-passive', 'emei-npc', 'emei-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 10959); assert.equal(old.reduce((n, c) => n + c.samples, 0), 272752);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        'c669b91a528ccf5679c7d27628e781d7d4ed5244f273e46d23ffa52cdfbc02d0');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'emei-jiuyin'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    validateSchoolCombatPlan(cases, catalog);
    assert.deepEqual([...new Set(cases.map(c => c.parameters.skill))].sort(), ['cuixin-zhang', 'jiuyin-baiguzhao', 'yinlong-bian']);
    for (const c of cases) {
        for (const s of c.parameters.qualification_sources) assert.ok(existsSync(join(root, s)), s);
        assert.ok(c.parameters.qualification_note.includes('no_teach'));
        assert.ok(!c.parameters.actor.temp && !c.parameters.target.temp);
    }
    assert.ok(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8').includes('school_emei_jiuyin_cases.mjs'));
    for (const samples of [0, -1, 1.5]) assert.throws(() => emeiJiuyinConditions(catalog, { samples }));
    assert.throws(() => emeiJiuyinConditions({ skills: [] }));
});

test('所有新条件经过合成事件验证；拒绝不得有扣费、攻击或假玩家身份', () => {
    for (const c of cases) {
        const hit = /-(low-defense|first-hit|second-hit|expiry|twice-equal|twice-exceeded|weak-force|weak-force-equal)$/.test(c.id);
        validateSchoolCombatRecord(record(c, hit, c.id.endsWith('-second-hit')), c);
    }
    const c = pick('duo', '-no-grant');
    for (const mutate of [r => { r.metrics[0].neili_cost = 100; }, r => { r.before[0].wizardp = 1; },
        r => { r.launches.push({}); }, r => { r.immediate[1].qi--; }, r => { delete r.metrics; }]) {
        const r = record(c); mutate(r); assert.throws(() => validateEmeiJiuyinRecord(r, c));
    }
});

test('夺命连环分开首击、变招命中和两次落空，费用分别100/250', () => {
    const c = pick('duo');
    for (const [hit, second] of [[true, false], [true, true], [false, true]])
        validateEmeiJiuyinRecord(record(c, hit, second), c);
    const first = pick('duo', '-first-hit'), next = pick('duo', '-second-hit');
    assert.equal(first.parameters.target.skills.force, 2, '首击门槛必须含基本内功对根骨的贡献');
    assert.throws(() => validateEmeiJiuyinRecord(record(first, true, true), first));
    assert.throws(() => validateEmeiJiuyinRecord(record(next, true, false), next));
});

test('九阴神爪保留整门授权语义；最大内力严格比较和原死亡单列', () => {
    const prefix = 'can_perform/jiuyin-baiguzhao';
    assert.equal(pick('zhua').parameters.actor.properties[prefix], 1);
    assert.deepEqual(pick('zhua', '-duo-grant-only').parameters.actor.properties[prefix], { duo: 1 });
    for (const suffix of ['-twice-equal', '-twice-exceeded', '-weak-force', '-weak-force-equal']) {
        const c = pick('zhua', suffix); validateEmeiJiuyinRecord(record(c, true), c);
    }
    const c = pick('zhua', '-twice-exceeded'), r = record(c, true);
    r.terminals = []; assert.throws(() => validateEmeiJiuyinRecord(r, c));
    const weak = pick('zhua', '-weak-force'), w = record(weak, true);
    w.metrics[0].direct = 1; assert.throws(() => validateEmeiJiuyinRecord(w, weak));
});

test('催心未准备仍按原实现受理；减益必须自然解除，银龙检查基本而非有效内功', () => {
    assert.equal(pick('cui', '-unprepared').parameters.expected, 'observed');
    const c = pick('cui', '-expiry'), r = record(c, true);
    validateEmeiJiuyinRecord(r, c);
    for (const mutate of [r => { r.after[1].temp.cuixin = 1; }, r => { r.after[1].temp.apply.parry = -25; },
        r => { r.elapsed = 0; }]) {
        const r = record(c, true); mutate(r); assert.throws(() => validateEmeiJiuyinRecord(r, c));
    }
    assert.equal(pick('zhu', '-low-force').parameters.actor.skills.force, 129);
    assert.equal(pick('zhu', '-minimum-force').parameters.actor.skills.force, 130);
    assert.equal(emeiJiuyinConditions(catalog, { smoke: true }).find(c => c.id.endsWith('-expiry')).samples, 1);
});

test('报告区分原死亡、直伤和未知，不能将死亡状态当额外普通伤害', () => {
    const death = record(pick('zhua', '-twice-exceeded'), true);
    const e = emeiJiuyinEffects([{ outcome: 'observed', raw: death }, { outcome: 'refused' }]);
    assert.equal(e.samples, 1); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(e.deaths.successes, 1); assert.equal(e.direct.mean, 0);
    assert.equal(e.target_loss.qi.mean, 9999);
    assert.equal(emeiJiuyinEffects([]).target_loss.qi.mean, null);
});
