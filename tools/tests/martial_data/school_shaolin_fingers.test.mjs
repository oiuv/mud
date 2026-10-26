import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinFingerConditions, shaolinFingerEffects } from './school_shaolin_fingers_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = shaolinFingerConditions(catalog);
const pick = (skill, ability, suffix = '', level = 200) =>
    cases.find(c => c.id === `school-shaolin-fingers-${skill}-${ability}-l${level}${suffix}`);

// Synthetic records exercise observation validation, not the game's results.
function record(c, hit = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, max_qi: 10000,
        neili: 6000, max_neili: 6000, ...cfg.properties,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations ?? {}), weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? null,
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        metrics: [{}, {}], attacks: [], launches: [], reason: '' };
    if (p.expected === 'refused') { r.reason = '原资格拒绝'; return r; }
    if (c.method === 'ordinary') { r.attacks.push({ actor: 0, target: 1 }); return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    const a = r.immediate[0], target = r.immediate[1]; let cost;
    if (p.ability === 'fuxue') {
        cost = hit ? 100 : 30; a.busy = hit ? null : 3;
        target.busy = hit ? Math.trunc(a.skills[p.skill] / 19) + 2 : null;
    } else if (p.ability === 'lingkong') {
        const damage = hit ? a.skills[p.skill] : 0;
        cost = Math.trunc(damage / 6); a.busy = hit ? 3 : 4; target.busy = hit ? 1 : null;
        r.metrics[1].qi_cost = damage; r.metrics[1].eff_qi_cost = cost; target.qi -= damage; target.eff_qi -= cost;
    } else {
        r.metrics[0].direct = +hit;
        cost = { jingmo: [60, 100], fumo: [100, 300], san: [800, 800], jimie: [200, 500], wuse: [100, 200], jueming: [150, 350] }[p.ability][+hit];
        a.busy = p.ability === 'san' ? 4 : hit ? p.ability === 'jueming' ? 1 : 2 : 3;
        if (p.ability === 'san') target.busy = hit ? Math.trunc(a.skills[p.skill] / 30) : null;
        if (p.ability === 'jimie') {
            r.metrics[0].qi_cost = Math.trunc((a.skills.finger + a.skills[p.skill]) / 4);
            a.qi -= r.metrics[0].qi_cost;
        }
    }
    a.neili -= cost; r.metrics[0].neili_cost = cost;
    return r;
}

test('八门指法八个主动174条件6718样本，原4710条件124696样本不变', () => {
    assert.equal(cases.length, 174); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 6718);
    assert.equal(shaolinFingerConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 348);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 63);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 4710); assert.equal(old.reduce((n, c) => n + c.samples, 0), 124696);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'shaolin-fingers'), cases);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id));
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    }
});

test('指法拒绝必须无扣费无伤害，持器/准备/领悟按原入口区分', () => {
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) {
        const r = record(c); validateSchoolCombatRecord(r, c);
        r.immediate[1].qi--; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    assert.equal(pick('nianhua-zhi', 'fuxue', '-armed').parameters.expected, 'observed');
    assert.equal(pick('jingang-zhi', 'san', '-unprepared').parameters.expected, 'refused');
    assert.equal(pick('wuxiang-zhi', 'wuse', '-no-grant').parameters.expected, 'observed');
});

test('八门普攻独立覆盖，天竺没有伪造主动入口', () => {
    for (const c of cases.filter(c => c.method === 'ordinary')) {
        const r = record(c); validateSchoolCombatRecord(r, c);
        r.attacks.push({ actor: 0, target: 1 }); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    assert.equal(cases.filter(c => c.parameters.skill === 'tianzhu-fuzhi').length, 3);
});

test('拈花按原控制与费用分支观察，零伤害不等于失败', () => {
    const c = pick('nianhua-zhi', 'fuxue');
    for (const hit of [false, true]) {
        const r = record(c, hit); validateSchoolCombatRecord(r, c);
        const e = shaolinFingerEffects([{ outcome: r.outcome, raw: r }]);
        assert.equal(e.qi_loss_samples.successes, 0); assert.equal(e.target_busy.mean, hit ? 12 : 0);
        r.metrics[1].qi_cost = 1; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('直接伤害成功/失手费用、忙乱和一指三脉控制分开核验', () => {
    for (const [skill, ability] of [['yizhi-chan', 'jingmo'], ['jingang-zhi', 'fumo'], ['jingang-zhi', 'san'], ['wuxiang-zhi', 'wuse'], ['xiuluo-zhi', 'jueming']])
        for (const hit of [false, true]) {
            const c = pick(skill, ability), r = record(c, hit); validateSchoolCombatRecord(r, c);
            r.metrics[0].neili_cost++; assert.throws(() => validateSchoolCombatRecord(r, c));
        }
});

test('菩提寂灭失手仍自伤，不能仅观察目标损伤', () => {
    const c = pick('duoluoye-zhi', 'jimie');
    for (const hit of [false, true]) {
        const r = record(c, hit); validateSchoolCombatRecord(r, c);
        assert.equal(shaolinFingerEffects([{ outcome: 'observed', raw: r }]).self_qi_cost.mean, 100);
        delete r.metrics[0].qi_cost; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('凌空的直接伤血和费用对应，不伪造公共do_damage调用', () => {
    const c = pick('qufannao-zhi', 'lingkong');
    for (const hit of [false, true]) {
        const r = record(c, hit); validateSchoolCombatRecord(r, c);
        r.metrics[0].direct = 1; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('经络学与少林内功资格保持原名，不注入拼错技能使效果通过', () => {
    assert.equal(pick('jingang-zhi', 'san', '-jingluo199').parameters.expected, 'refused');
    assert.equal(pick('jingang-zhi', 'san', '-jingluo800').parameters.actor.skills['jingluo-xue'], 800);
    assert.ok(cases.every(c => !Object.hasOwn(c.parameters.actor.skills, 'jinluo-xue')));
    for (const ability of ['fumo', 'san']) for (const skill of ['yijinjing', 'luohan-fumogong', 'taiji-shengong'])
        assert.equal(pick('jingang-zhi', ability, '-force-' + skill).parameters.expected, skill === 'taiji-shengong' ? 'refused' : 'observed');
});

test('拒绝和缺少原始观察不当作零效果，空分母保留未知', () => {
    const c = pick('nianhua-zhi', 'fuxue'), r = record(c, true);
    const e = shaolinFingerEffects([{ outcome: 'observed', raw: r }, { outcome: 'refused', raw: {} }]);
    assert.equal(e.samples, 1); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(shaolinFingerEffects([]).self_qi_cost.mean, null);
    assert.equal(shaolinFingerEffects([]).qi_loss_samples.rate, null);
});
