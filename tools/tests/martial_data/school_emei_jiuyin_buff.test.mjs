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
import { emeiJiuyinBuffConditions, validateEmeiJiuyinBuffRecord, jiuyinBuffDelta,
    emeiJiuyinBuffEffects } from './school_emei_jiuyin_buff_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = emeiJiuyinBuffConditions(catalog);
const pick = (ability, suffix = '') => {
    const c = cases.find(c => c.parameters.ability === ability && c.id.endsWith('-l200' + suffix));
    assert.ok(c, ability + suffix); return c;
};

// Synthetic protocol examples only; never reported as driver measurements.
function record(c) {
    const p = c.parameters, before = [p.actor, p.target].map(cfg => {
        const s = { userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, max_qi: 10000,
            jing: 10000, eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, ...cfg.properties,
            cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
            skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
            preparations: structuredClone(cfg.preparations), temp: { apply: {} },
            weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? 0 };
        for (const [k, v] of Object.entries(cfg.temp ?? {}))
            if (k.startsWith('apply/')) s.temp.apply[k.slice(6)] = v; else s.temp[k] = v;
        s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (s.temp.apply[k] ?? 0)]));
        s.effective_str = (cfg.properties.str ?? 36) + Math.trunc((cfg.skills.claw ?? 0) / 10) + (s.temp.apply.str ?? 0);
        s.effective_dex = (cfg.properties.dex ?? 36) + Math.trunc((cfg.skills.dodge ?? 0) / 10) + (s.temp.apply.dex ?? 0);
        return s;
    });
    const raw = { before, immediate: structuredClone(before), metrics: [{}, {}], launches: [], callbacks: [],
        attacks: [], terminals: [], outcome: p.expected, reason: p.expected === 'refused' ? '原拒绝' : '',
        command_accepted: Number(p.expected === 'observed'), elapsed: p.observe_seconds };
    const used = new Set();
    function step(ability, ok, fighting) {
        const s = raw.immediate[0];
        if (!ok) return;
        const cost = ability === 'guiyuan' ? 200 : 100;
        for (const [k, v] of Object.entries(jiuyinBuffDelta(s, ability))) s.temp.apply[k] = (s.temp.apply[k] ?? 0) + v;
        if (ability === 'guiyuan') for (const k of ['str', 'dex']) s.temp[k] = (s.temp[k] ?? 0) + Math.trunc(s.skills['shexing-lifan'] / 50);
        s.neili -= cost; raw.metrics[0].neili_cost = (raw.metrics[0].neili_cost ?? 0) + cost;
        s.temp[ability === 'guiyuan' ? 'gui_yuan' : ability] = 1;
        s.busy = fighting ? ability === 'powerup' ? 3 : 2 : 0;
        raw.launches.push({ skill: ability === 'guiyuan' ? 'shexing-lifan' : 'yijin-duangu',
            argument: ability + (!p.repeat_actions && p.action.endsWith(' right') ? ' right' : '') });
        s.effective_skills.force = Math.trunc(s.skills.force / 2) + (s.skills[s.mappings.force] ?? 0) + (s.temp.apply.force ?? 0);
    }
    if (p.repeat_actions) {
        raw.repeat_steps = [];
        for (const action of p.repeat_actions) {
            const ability = action.includes('guiyuan') ? 'guiyuan' : action.slice(6), ok = !used.has(ability);
            used.add(ability);
            const s = { action, before: structuredClone(raw.immediate[0]), accepted: Number(ok),
                launches_before: raw.launches.length, reason: ok ? '' : '原拒绝' };
            step(ability, ok, false); s.launches_after = raw.launches.length; s.after = structuredClone(raw.immediate[0]);
            raw.repeat_steps.push(s);
        }
    } else step(p.ability, p.expected === 'observed', p.fighting);
    raw.after = structuredClone(raw.immediate);
    if (p.observe_seconds) {
        raw.after[0].temp = structuredClone(before[0].temp);
        const elapsed = p.observe_seconds - 2;
        raw.callbacks = [{ side: 0, phase: 'before', elapsed, state: structuredClone(raw.immediate[0]) },
            { side: 0, phase: 'after', elapsed, state: structuredClone(raw.after[0]) }];
    }
    return raw;
}

test('九阴增益82条件164计划记录注册，旧11040条件完整指纹保持', () => {
    const all = schoolCombatConditions(catalog);
    const historical = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school));
    const old = historical.filter(c => !['emei-jiuyin-buff', 'emei-yijin', 'emei-shexing', 'emei-jiuyin-learning', 'emei-jiuyin-passive', 'emei-npc', 'emei-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 11040); assert.equal(old.reduce((n, c) => n + c.samples, 0), 274972);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        'c51ed4a309ab5118a3eabd623a01ed3f29ddae7eae1c923cd1ac309a6f1f0fe3');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'emei-jiuyin-buff'), cases);
    assert.equal(cases.length, 82); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 164);
    assert.equal(new Set(all.map(c => c.id)).size, all.length); validateSchoolCombatPlan(cases, catalog);
    assert.ok(cases.every(c => !c.id.startsWith('school-emei-jiuyin-')), '旧攻招复现前缀不可悄然扩展');
    for (const c of cases) for (const s of c.parameters.qualification_sources) assert.ok(existsSync(join(root, s)), s);
    assert.ok(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8').includes('school_emei_jiuyin_buff_cases.mjs'));
    assert.throws(() => emeiJiuyinBuffConditions({ skills: [] }));
});

test('全部合成事件经过公共分发及严格校验，冒烟和正式次数分开', () => {
    for (const c of cases) validateSchoolCombatRecord(record(c), c);
    const smoke = emeiJiuyinBuffConditions(catalog, { smoke: true });
    assert.ok(smoke.every(c => c.samples === 1)); assert.ok(cases.every(c => c.samples === 2));
    assert.deepEqual(smoke.filter(c => c.parameters.observe_seconds).map(c => c.parameters.observe_seconds), [32, 202, 77]);
});

test('归元只增加原始临时字段，不伪造实际力量身法生效', () => {
    const c = pick('guiyuan'), r = record(c);
    assert.equal(r.immediate[0].temp.str, 4); assert.equal(r.immediate[0].effective_str, r.before[0].effective_str);
    for (const mutate of [r => { r.immediate[0].effective_str += 4; }, r => { r.immediate[0].temp.apply.dex = 4; },
        r => { r.immediate[0].temp.dex = 0; }, r => { r.immediate[0].neili++; }]) {
        const r = record(c); mutate(r); assert.throws(() => validateEmeiJiuyinBuffRecord(r, c));
    }
    assert.equal(pick('guiyuan', '-other').parameters.expected, 'observed');
    assert.equal(pick('guiyuan', '-armed').parameters.expected, 'observed');
    assert.equal(pick('guiyuan', '-force-unmapped').parameters.expected, 'observed');
});

test('护体平均等级与门槛不同，强化使用当前有效内功，组合顺序有影响', () => {
    const uneven = record(pick('shield', '-unequal-levels'));
    assert.equal(uneven.immediate[0].temp.apply.armor, 50); assert.equal(uneven.immediate[0].temp.apply.damage, 16);
    const left = record(pick('powerup', '-then-shield')), right = record(pick('shield', '-then-powerup'));
    assert.equal(left.immediate[0].temp.apply.attack, 100); assert.equal(right.immediate[0].temp.apply.attack, 116);
    assert.equal(record(pick('shield', '-minimum-neili')).immediate[0].neili, 100);
    assert.equal(record(pick('guiyuan', '-minimum-neili')).immediate[0].neili, 50);
});

test('拒绝不允许扣费或攻击，重复施展不叠加；原回调必须等待并还原已有字段', () => {
    for (const ability of ['powerup', 'shield', 'guiyuan']) {
        const c = pick(ability, '-repeat'), r = record(c);
        assert.deepEqual(r.repeat_steps.map(s => s.accepted), [1, 0]);
        const refused = pick(ability, '-low-neili');
        for (const mutate of [r => { r.attacks.push({}); }, r => { r.metrics[0].neili_cost = 1; },
            r => { r.before[0].wizardp = 1; }, r => { r.immediate[1].qi--; }, r => { r.reason = ''; }]) {
            const r = record(refused); mutate(r); assert.throws(() => validateEmeiJiuyinBuffRecord(r, refused));
        }
    }
    for (const c of cases.filter(c => c.parameters.observe_seconds)) {
        for (const mutate of [r => { r.callbacks = []; }, r => { r.callbacks[0].elapsed = 0; },
            r => { r.after[0].temp.apply.str++; }, r => { r.after[0].temp.dex++; }]) {
            const r = record(c); mutate(r); assert.throws(() => validateEmeiJiuyinBuffRecord(r, c));
        }
    }
});

test('汇总分开写入字段、实际属性与自然解除；未知观测不当作零', () => {
    const r = record(pick('guiyuan')), e = emeiJiuyinBuffEffects([{ outcome: 'observed', raw: r }, { outcome: 'refused' }]);
    assert.equal(e.samples, 1); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(e.attributes.str.temporary.mean, 4); assert.equal(e.attributes.str.effective.mean, 0);
    assert.equal(e.callback_seconds.mean, null); assert.equal(emeiJiuyinBuffEffects([]).cost.mean, null);
});
