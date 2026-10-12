import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinSwordConditions, damoMoves, shaolinSwordEffects } from './school_shaolin_sword_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = shaolinSwordConditions(catalog);
const pick = (ability, suffix = '', level = 200) => cases.find(c => c.id === `school-shaolin-sword-${ability}-l${level}${suffix}`);

// Artificial records test the collector, not game balance or real command outcomes.
function raw(c, direct = 0) {
    const before = [c.parameters.actor, c.parameters.target].map((cfg, side) => {
        const temp = { apply: {} };
        for (const [key, value] of Object.entries(cfg.temp ?? {})) {
            if (key.startsWith('apply/')) temp.apply[key.slice(6)] = value;
            else temp[key] = value;
        }
        return { id: side ? 'right' : 'left', userp: 1, interactive: 1, wizardp: 0,
            qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000, neili: 6000, max_neili: 6000,
            ...cfg.properties, skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
            weapon: cfg.equipment?.type ?? 'none', temp, conditions: {}, busy: cfg.busy ?? 0 };
    });
    const r = { outcome: c.parameters.expected, before, immediate: structuredClone(before),
        launches: [], metrics: [{ direct }, {}], attacks: [], callbacks: [], dropped: [], reason: '' };
    if (r.outcome === 'refused') { r.reason = '当前不能施展'; return r; }
    const ability = c.parameters.ability;
    if (ability === 'ordinary') r.attacks.push({ actor: 0, target: 1, type: 0 });
    else {
        r.launches.push({ skill: 'damo-jian', argument: ability });
        const cost = ability === 'sanjue' ? 75 : ability === 'qingxin' || direct ? 200 : 100;
        r.metrics[0].neili_cost = cost; r.immediate[0].neili -= cost;
        r.immediate[0].busy = ability === 'sanjue' || ability === 'qingxin' ? 1 : direct ? 2 : 4;
        if (ability === 'sanjue') r.attacks = Array.from({ length: 3 }, () => ({ actor: 0, target: 1, type: 0 }));
        if (direct) {
            const condition = { luan: 'damo_luanqi', shang: 'damo_shangshen', zhe: 'damo_zheyuan' }[ability];
            if (!c.parameters.target.properties['special_skill/piyi'])
                r.immediate[1].conditions[condition] = { id: 'left', name: '采集者', level: 200, remain: 1000 };
            if (ability !== 'luan') { r.immediate[1].jing -= 30; r.immediate[1].eff_jing -= 15; }
        }
    }
    return r;
}

test('少林86条件1936记录，历史4181条件105606样本保持独立', () => {
    assert.equal(cases.length, 86); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1936);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 4181); assert.equal(old.reduce((n, c) => n + c.samples, 0), 105606);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'shaolin-sword'), cases);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id));
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        assert.equal(c.parameters.actor.properties['family/family_name'], '少林派');
        assert.ok(!c.parameters.target.conditions);
    }
    assert.equal(shaolinSwordConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 171);
});

test('五种施展分别保留实际门槛，三绝无领悟也可调用，清心不要求最大内力2000', () => {
    for (const ability of damoMoves) {
        const n = ability === 'sanjue' ? 150 : 300;
        assert.equal(pick(ability, '-low-neili').parameters.actor.properties.neili, n - 1);
        assert.equal(pick(ability, '-minimum-neili').parameters.actor.properties.neili, n);
        assert.equal(pick(ability, '-no-grant').parameters.expected, ability === 'sanjue' ? 'observed' : 'refused');
    }
    assert.equal(pick('qingxin', '-low-max-neili').parameters.expected, 'observed');
    assert.equal(pick('luan', '-low-max-neili').parameters.expected, 'refused');
    assert.equal(pick('sanjue', '-minimum-dex').parameters.actor.properties.dex, 10);
    assert.equal(pick('sanjue', '-minimum-dodge').parameters.actor.skills['shaolin-shenfa'], 200);
    assert.equal(pick('qingxin', '-expiry').parameters.observe_seconds, 32);
});

test('命中回调和未命中分别验证费用及忙乱；辟易阻止异常不消除直伤', () => {
    for (const ability of ['luan', 'shang', 'zhe']) for (const direct of [0, 1]) {
        const c = pick(ability), r = raw(c, direct);
        validateSchoolCombatRecord(r, c);
        const bad = structuredClone(r); bad.metrics[0].neili_cost++;
        assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
    const c = pick('zhe', '-piyi'), r = raw(c, 1);
    validateSchoolCombatRecord(r, c);
    r.immediate[1].conditions.damo_zheyuan = { id: 'left', name: '采集者', level: 200, remain: 1000 };
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('缺异常、错误所属者、非原持续单位及伪造即时内力伤害均拒绝', () => {
    const c = pick('zhe'), r = raw(c, 1);
    for (const mutate of [
        x => { x.immediate[1].conditions = {}; },
        x => { x.immediate[1].conditions.damo_zheyuan.id = 'other'; },
        x => { x.immediate[1].conditions.damo_zheyuan.level = 400; },
        x => { x.immediate[1].conditions.damo_zheyuan.remain++; },
        x => { x.immediate[1].neili--; },
    ]) { const bad = structuredClone(r); mutate(bad); assert.throws(() => validateSchoolCombatRecord(bad, c)); }
    const f = pick('luan', '-no-grant'), refused = raw(f);
    validateSchoolCombatRecord(refused, f); refused.immediate[1].qi--;
    assert.throws(() => validateSchoolCombatRecord(refused, f));
});

test('三绝原普通攻击三次并撤回攻击加成，清心无powerup仍正常扣费', () => {
    const c = pick('sanjue'), r = raw(c); validateSchoolCombatRecord(r, c);
    r.immediate[0].temp.apply.attack = 100; assert.throws(() => validateSchoolCombatRecord(r, c));
    const q = pick('qingxin', '-no-buff'), qr = raw(q); validateSchoolCombatRecord(qr, q);
    assert.equal(qr.metrics[0].neili_cost, 200);
    qr.immediate[1].temp.apply.attack = 0; assert.throws(() => validateSchoolCombatRecord(qr, q));
});

test('清心目标原30秒回调恢复，缺回调或未恢复不能算通过', () => {
    const c = pick('qingxin', '-expiry'), r = raw(c);
    r.immediate[1].temp.apply = { attack: 0, defense: 0 }; r.immediate[1].temp.damo_qingxin = 1;
    r.after = structuredClone(r.immediate); r.after[1].temp = structuredClone(r.before[1].temp);
    r.elapsed = 32.1;
    r.callbacks = [{ side: 1, phase: 'before', elapsed: 30, state: r.immediate[1] },
        { side: 1, phase: 'after', elapsed: 30.01, state: r.after[1] }];
    validateSchoolCombatRecord(r, c);
    for (const mutate of [x => { x.callbacks = []; }, x => { x.callbacks[0].elapsed = 1; },
        x => { x.after[1].temp.apply.defense++; }, x => { x.after[0].neili++; }]) {
        const bad = structuredClone(r); mutate(bad); assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
});

test('异常、气血、精神与原到期回调独立统计，错误与缺记录不填零', () => {
    const c = pick('shang'), r = raw(c, 1);
    const e = shaolinSwordEffects([{ outcome: 'observed', raw: r }, { outcome: 'error', raw: {} }]);
    assert.equal(e.samples, 1); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(e.condition_applied.rate, 1); assert.equal(e.condition_level.mean, 200);
    assert.equal(e.condition_duration_units.mean, 5); assert.equal(e.target_loss.jing.mean, 30);
    assert.equal(e.target_loss.neili.mean, 0); assert.equal(e.target_callback_end.mean, null);
    assert.equal(shaolinSwordEffects([]).target_loss.jing.mean, null);
});
