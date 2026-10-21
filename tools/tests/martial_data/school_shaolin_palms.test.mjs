import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinPalmConditions, shaolinPalmEffects } from './school_shaolin_palms_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = shaolinPalmConditions(catalog);
const pick = (skill, ability, suffix = '', level = 200) =>
    cases.find(c => c.id === `school-shaolin-palms-${skill}-${ability}-l${level}${suffix}`);

// Synthetic events only validate the collector; they are never game results.
function record(c, hit = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, side) => ({
        userp: 1, interactive: 1, wizardp: 0, living: 1, object: `/tests/actor#${side}`,
        qi: 10000, max_qi: 10000, neili: 6000, max_neili: 6000, jiali: 0, ...cfg.properties,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations ?? {}), weapon: cfg.equipment?.type ?? 'none', temp: { ...cfg.temp },
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        metrics: [{}, {}], attacks: [], launches: [], callbacks: [], terminals: [], passives: [], reason: '' };
    if (p.expected === 'refused') { r.reason = '原条件拒绝'; return r; }
    if (c.method === 'ordinary') { r.attacks.push({ actor: 0, target: 1 }); return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    const a = r.immediate[0]; let cost;
    if (p.ability === 'feng') {
        a.temp = { brz_feng: 1, apply: { attack: -Math.trunc(a.skills[p.skill] / 4), dodge: Math.trunc(a.skills[p.skill] / 3) } };
        cost = 100; a.busy = p.fighting ? 2 : 0;
    } else if (['san', 'po', 'bafang'].includes(p.ability)) {
        r.metrics[0].direct = +hit; cost = { san: [50, 150], po: [120, 250], bafang: [100, 350] }[p.ability][+hit];
        a.busy = hit || p.ability === 'po' ? 2 : 3;
    } else {
        const lethal = c.id.endsWith('-max-neili12001');
        cost = p.ability === 'ying' ? 150 : lethal ? 500 : 300; a.busy = lethal ? 3 : 2;
        r.attacks = Array.from({ length: p.ability === 'ying' ? 5 : lethal ? 1 : 6 }, () => ({ actor: 0, target: 1 }));
        if (lethal) {
            r.immediate[1].eff_qi = -1; r.immediate[1].eff_jing = 0;
            r.terminals.push({ side: 1, state: 'death' });
            r.elapsed = 16; r.after = structuredClone(r.immediate); r.after[1].ghost = 1;
        }
    }
    a.neili -= cost; r.metrics[0].neili_cost = cost;
    return r;
}

test('六门掌法122条件4850样本，原4588条件119846样本不变', () => {
    assert.equal(cases.length, 122); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4850);
    assert.equal(shaolinPalmConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 243);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 4588); assert.equal(old.reduce((n, c) => n + c.samples, 0), 119846);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'shaolin-palms'), cases);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of cases) { assert.ok(entries.has(c.entry_id)); for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path); }
});

test('封魔可非战斗发动、减攻击增轻功，到期才由原回调归还', () => {
    for (const suffix of ['', '-no-fight', '-expiry']) {
        const c = pick('banruo-zhang', 'feng', suffix), r = record(c);
        if (suffix === '-no-fight') r.immediate[0].busy = null;
        if (suffix === '-expiry') {
            r.elapsed = c.parameters.observe_seconds; r.after = structuredClone(r.immediate); r.after[0].temp = {};
            r.callbacks = [{ side: 0, phase: 'before' }, { side: 0, phase: 'after' }];
        }
        validateSchoolCombatRecord(r, c);
        r.immediate[0].temp.apply.attack++; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    assert.equal(pick('banruo-zhang', 'feng', '-expiry').parameters.observe_seconds, 52);
});

test('直接伤害三招分别记成功/失手的原费用与忙乱', () => {
    for (const [skill, ability] of [['sanhua-zhang', 'san'], ['woshi-zhang', 'po'], ['shenzhang-bada', 'bafang']])
        for (const hit of [false, true]) {
            const c = pick(skill, ability), r = record(c, hit); validateSchoolCombatRecord(r, c);
            r.immediate[0].busy++; assert.throws(() => validateSchoolCombatRecord(r, c));
        }
});

test('原入口准备、持器与领悟边界不统一猜测', () => {
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) {
        const r = record(c); validateSchoolCombatRecord(r, c);
        r.immediate[1].qi--; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    assert.equal(pick('sanhua-zhang', 'san', '-armed').parameters.expected, 'observed');
    assert.equal(pick('woshi-zhang', 'po', '-no-grant').parameters.expected, 'observed');
    assert.equal(pick('rulai-zhang', 'zong', '-no-grant').parameters.expected, 'refused');
    assert.equal(pick('xumishan-zhang', 'ying', '-unprepared').parameters.expected, 'refused');
});

test('群山五连与万佛六连分别验证临时加成归还，不冒充完整交锋', () => {
    for (const [skill, ability] of [['xumishan-zhang', 'ying'], ['rulai-zhang', 'zong']]) {
        const c = pick(skill, ability), r = record(c); validateSchoolCombatRecord(r, c);
        r.attacks.pop(); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('万佛朝宗严格大于两倍分支区分死亡处理与正常六连', () => {
    for (const value of [12000, 12001]) {
        const c = pick('rulai-zhang', 'zong', `-max-neili${value}`, 800), r = record(c);
        validateSchoolCombatRecord(r, c);
        if (value === 12001) {
            const e = shaolinPalmEffects([{ outcome: 'observed', raw: r }]); assert.equal(e.target_death.successes, 1);
            r.terminals = []; assert.throws(() => validateSchoolCombatRecord(r, c));
        }
    }
});

test('如来被动保留原三实参路径的零返回，缺记录不充当调用成功', () => {
    const c = pick('rulai-zhang', 'ordinary', '-action-flag1', 800), r = record(c);
    r.passives.push({ skill: 'rulai-zhang', route: 'martial', incoming: 400, result: 0 });
    validateSchoolCombatRecord(r, c);
    const e = shaolinPalmEffects([{ outcome: 'observed', raw: r }, { outcome: 'error', raw: {} }]);
    assert.equal(e.passive_calls, 1); assert.equal(e.passive_nonzero, 0); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(e.passive_incoming.mean, 400); assert.equal(shaolinPalmEffects([]).passive_incoming.mean, null);
    r.passives[0].result = 1; assert.throws(() => validateSchoolCombatRecord(r, c));
});
