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
import { emeiShexingConditions, shexingChance, shexingEffects } from './school_emei_shexing_cases.mjs';
import { combatSceneProbes, combatExtraDodgeProbes } from './execution.mjs';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = emeiShexingConditions(catalog);
const pick = suffix => { const c = cases.find(c => c.id === 'school-emei-shexing-' + suffix); assert.ok(c, suffix); return c; };
const skill = 'shexing-lifan';
// Synthetic inputs validate collection assertions, never count as driver samples.
function record(c, negate = false) {
    const p = c.parameters, before = [p.actor, p.target].map((cfg, side) => ({
        userp: 1, interactive: 1, wizardp: 0, living: side === 1 && p.target_state ? 0 : 1,
        busy: cfg.busy ?? 0, weapon: cfg.equipment?.type ?? 'none', qi: 10000, eff_qi: 10000,
        jing: 10000, eff_jing: 10000, jingli: null, ...cfg.properties,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {}, temp: {},
        effective_skills: { dodge: Math.trunc((cfg.skills.dodge ?? 0) / 2) + (cfg.skills[cfg.mappings.dodge] ?? 0) },
    }));
    const r = { before, immediate: structuredClone(before), metrics: [{}, {}],
        attacks: [], launches: [], defenses: [], defense_messages: [], interfaces: [], outcome: p.expected, reason: '原提示' };
    if (c.method === 'practice' || p.ability === 'practice_skill') {
        const n = c.method === 'practice' ? p.completed : Number(p.expected === 'observed');
        r.immediate[0].qi -= n * 80; r.immediate[0].neili -= n * 120;
        if (c.method === 'practice') {
            r.command_accepted = Number(n > 0 && n === p.repetitions);
            if (n) r.immediate[0].learned[skill] = n * practiceGain(p.level, before[0].skills.dodge, before[0].int);
        } else r.interfaces.push({ ...p.interface, result: n });
    } else {
        let value;
        switch (p.ability) {
        case 'valid_damage':
            value = negate ? { damage: -1000, msg: '原化解文本' } : 0;
            r.defenses.push({ actor: 0, target: 1, skill, incoming: 1000, result: value, route: 'interface' }); break;
        case 'valid_enable': value = Number(p.interface.usage !== 'parry'); break;
        case 'valid_learn': value = 1; break;
        case 'query_action': value = { action: '身行' }; break;
        case 'query_dodge_msg': value = '$n原闪避文本'; break;
        case 'query_effect_dodge': value = null; break;
        default: throw Error('only synthetic interface and practice');
        }
        r.interfaces.push({ ...p.interface, result: value,
            implemented_by: p.ability === 'query_effect_dodge' ? null : '/kungfu/skill/' + skill });
    }
    return r;
}

test('新条件独立注册，旧11245条件全部内容保持，来源可定位', () => {
    const all = schoolCombatConditions(catalog);
    const historical = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school));
    const old = historical.filter(c => !['emei-shexing', 'emei-jiuyin-learning', 'emei-jiuyin-passive', 'emei-npc', 'emei-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 11245); assert.equal(old.reduce((n, c) => n + c.samples, 0), 278224);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '63282dc0e4181b7facc6deb3bfe23459696e22ae6585a7fed141b94abd570701');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'emei-shexing'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length); validateSchoolCombatPlan(cases, catalog);
    for (const c of cases) for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    assert.throws(() => emeiShexingConditions({ skills: [] }));
    assert.throws(() => emeiShexingConditions(catalog, { samples: 0 }));
});

test('概率使用count而非mathematics，100级/存活边界与严格小于保留', () => {
    const run = id => { const r = record(pick(id)); return shexingChance(...r.before); };
    assert.equal(run('valid_damage-l99-count0'), 0);
    assert.equal(run('valid_damage-l100-count0'), 0);
    assert.equal(run('valid_damage-l200-count0'), 130 / 300);
    assert.equal(run('valid_damage-l200-mathematics1200'), 130 / 300);
    assert.equal(run('valid_damage-l400-count0'), 1);
    assert.equal(run('valid_damage-l400-count400'), 210 / 700);
    assert.equal(run('valid_damage-l400-unconscious'), 0);
});

test('所有接口与练习合成边界可校验，烟雾不替代随机100样本', () => {
    const smoke = emeiShexingConditions(catalog, { smoke: true }); assert.equal(smoke.length, cases.length);
    for (const c of cases.filter(c => !['ordinary', 'direct'].includes(c.parameters.ability))) {
        const r = record(c);
        if (c.parameters.ability === 'valid_damage') {
            const q = shexingChance(...r.before);
            if (q < 1) validateSchoolCombatRecord(r, c);
            if (q > 0) validateSchoolCombatRecord(record(c, true), c);
        } else validateSchoolCombatRecord(r, c);
    }
    for (let i = 0; i < cases.length; i++) assert.equal(smoke[i].samples, cases[i].samples === 100 ? 2 : 1);
});

test('原练习费用和部分进度分别核验，持剑不人为拒绝轻功', () => {
    const partial = pick('practice-l200-partial-neili'), r = record(partial);
    assert.equal(r.immediate[0].neili, 80); assert.equal(r.immediate[0].qi, 9840);
    assert.equal(r.command_accepted, 0); assert.equal(r.outcome, 'observed');
    assert.equal(pick('practice-l200-armed').parameters.expected, 'observed');
    assert.equal(pick('practice_skill-l200-neili199').parameters.expected, 'refused');
    assert.equal(pick('practice-l200-times50').parameters.completed, 50);
});

test('缺失观察、错分路径、错误费用与虚构化解必须失败', () => {
    const c = pick('valid_damage-l200-count0');
    for (const mutate of [r => r.defenses = [], r => r.defenses[0].route = 'direct',
        r => r.defenses[0].result = { damage: -999, msg: '' }, r => delete r.interfaces[0].implemented_by,
        r => r.outcome = 'error', r => r.before[0].wizardp = 1, r => r.immediate[1].qi--]) {
        const r = record(c); mutate(r); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const p = pick('practice-l200'), r = record(p); r.immediate[0].neili++;
    assert.throws(() => validateSchoolCombatRecord(r, p));
    const n = pick('valid_damage-l99-count0'); assert.throws(() => validateSchoolCombatRecord(record(n, true), n));
    const summary = shexingEffects([{ outcome: 'observed', raw: record(c, true) }]);
    assert.equal(summary.defense_calls, 1); assert.equal(summary.negated, 1);
});

test('仅追加原dodge调用结果探针，旧探针不改，逐字可还原且不重复调用', () => {
    const original = readFileSync(join(root, 'adm/daemons/combatd.c'), 'utf8');
    const old = combatSceneProbes(original), next = combatExtraDodgeProbes(original);
    assert.equal(next.sites.length, old.sites.length + 1);
    assert.deepEqual(next.sites.slice(0, -1), old.sites);
    const site = next.sites.at(-1);
    assert.equal(next.changed.replace(site.anchor + site.insert, site.anchor), old.changed);
    assert.ok(!site.insert.includes('random(')); assert.ok(!site.insert.includes('->valid_damage('));
    assert.throws(() => combatExtraDodgeProbes(original + original));
});
