import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinFistConditions, shaolinFistEffects } from './school_shaolin_fists_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = shaolinFistConditions(catalog);
const pick = (skill, ability, suffix = '', level = 200) =>
    cases.find(c => c.id === `school-shaolin-fists-${skill}-${ability}-l${level}${suffix}`);

// Fake records test the observer only, never reported as measured gameplay.
function record(c, hit = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, side) => ({
        userp: 1, interactive: 1, wizardp: 0, living: 1, object: `/tests/actor#${side}`,
        qi: 10000, max_qi: 10000, neili: 6000, max_neili: 6000, jiali: 0, effective_dex: 56, ...cfg.properties,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations ?? {}), weapon: cfg.equipment?.type ?? 'none',
        temp: { ...cfg.temp },
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        metrics: [{}, {}], attacks: [], launches: [], callbacks: [], terminals: [], reason: '' };
    if (p.expected === 'refused') { r.reason = '原条件拒绝'; return r; }
    if (c.method === 'ordinary') { r.attacks.push({ actor: 0, target: 1 }); return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    const a = r.immediate[0]; let cost;
    if (p.ability === 'xiangmo') {
        r.metrics[0].direct = +hit; cost = hit ? 30 : 10; a.busy = hit ? 2 : 3;
    } else {
        const sacrifice = a.qi <= a.max_qi * 0.4, count = Math.trunc(Math.trunc(a.skills[p.skill] / 3) / 2);
        a.temp = { jingang: 1, str: count * (sacrifice ? 10 : 2), dex: sacrifice ? 0 : -Math.trunc(a.effective_dex / 10) };
        cost = sacrifice ? a.neili : 150;
        if (sacrifice) { a.living = 0; a.max_neili -= 10; r.attacks.push({ actor: 0, target: 1 }); r.terminals.push({ side: 0, state: 'unconscious' }); }
    }
    a.neili -= cost; r.metrics[0].neili_cost = cost;
    return r;
}

test('五门拳脚57条件3054样本，原4531条件116792样本保持不变', () => {
    assert.equal(cases.length, 57); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3054);
    assert.equal(shaolinFistConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 112);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 4531); assert.equal(old.reduce((n, c) => n + c.samples, 0), 116792);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'shaolin-fists'), cases);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of cases) { assert.ok(entries.has(c.entry_id)); for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path); }
});

test('醉拳两个合法类别与擒拿双准备分别保留条件，不伪造绝招', () => {
    const z = pick('zuiquan-sanda', 'ordinary', '-unarmed'), q = pick('qinna-shibada', 'ordinary', '-dual');
    assert.equal(z.parameters.usage, 'unarmed');
    assert.deepEqual(q.parameters.actor.preparations, { unarmed: 'qinna-shibada', cuff: 'luohan-quan' });
    assert.ok(cases.filter(c => ['fuhu-quan', 'zuiquan-sanda', 'qinna-shibada'].includes(c.parameters.skill)).every(c => c.method === 'ordinary'));
    validateSchoolCombatRecord(record(z), z); validateSchoolCombatRecord(record(q), q);
});

test('罗汉降魔分别核对命中/格挡成本、忙乱与原发动记录', () => {
    for (const hit of [false, true]) {
        const c = pick('luohan-quan', 'xiangmo'), r = record(c, hit); validateSchoolCombatRecord(r, c);
        r.immediate[0].busy++; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('金刚神通高气血强化与恰好40%气血舍身分开记账', () => {
    for (const suffix of ['', '-qi4001', '-qi4000']) {
        const c = pick('jingang-quan', 'jingang', suffix), r = record(c); validateSchoolCombatRecord(r, c);
        r.immediate[0].max_neili--; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const c = pick('jingang-quan', 'jingang', '-qi4000'), r = record(c);
    const e = shaolinFistEffects([{ outcome: 'observed', raw: r }, { outcome: 'error', raw: {} }]);
    assert.equal(e.unconscious.successes, 1); assert.equal(e.max_neili_loss.mean, 10); assert.equal(e.unknown_or_unobserved, 1);
    r.terminals = []; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('原源代码没有准备/持器检查时如实观察，不改成虚构拒绝', () => {
    for (const [skill, ability] of [['luohan-quan', 'xiangmo'], ['jingang-quan', 'jingang']])
        for (const suffix of ['-unprepared', '-armed']) {
            const c = pick(skill, ability, suffix); assert.equal(c.parameters.expected, 'observed');
            validateSchoolCombatRecord(record(c), c);
        }
    assert.equal(pick('luohan-quan', 'xiangmo', '-no-grant').parameters.expected, 'observed');
    assert.equal(pick('jingang-quan', 'jingang', '-no-grant').parameters.expected, 'refused');
});

test('神通有效等级150与原始特殊等级分开；资格拒绝无扣费', () => {
    for (const key of ['force', 'cuff']) {
        const c = pick('jingang-quan', 'jingang', `-${key}-minimum`), mapped = key === 'force' ? 'hunyuan-yiqi' : 'jingang-quan';
        assert.equal(c.parameters.actor.skills[key] / 2 + c.parameters.actor.skills[mapped], 150);
    }
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) {
        const r = record(c); validateSchoolCombatRecord(r, c);
        r.immediate[1].qi--; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('自然解除须有原回调与根层属性归还，舍身上限损失不自动返还', () => {
    for (const suffix of ['-expiry', '-qi4000-expiry']) {
        const c = pick('jingang-quan', 'jingang', suffix), r = record(c);
        r.elapsed = c.parameters.observe_seconds; r.after = structuredClone(r.immediate);
        r.after[0].temp = structuredClone(r.before[0].temp);
        r.callbacks = [{ side: 0, phase: 'before' }, { side: 0, phase: 'after' }];
        validateSchoolCombatRecord(r, c); r.after[0].temp.str = 1;
        assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    assert.equal(shaolinFistEffects([]).root_str.mean, null);
});
