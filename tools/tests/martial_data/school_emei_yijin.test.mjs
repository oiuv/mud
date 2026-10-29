import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan, schoolCultivationEffects } from './school_combat_report.mjs';
import { emeiYijinConditions, yijinBonus, yijinCapacity, yijinResearchBound, yijinInterface,
    yijinCharacterLimits, yijinFields } from './school_emei_yijin_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = emeiYijinConditions(catalog);
const pick = suffix => { const c = cases.find(c => c.id === 'school-emei-yijin-' + suffix); assert.ok(c, suffix); return c; };

// Synthetic validation inputs only; not real game observations or evidence.
function record(c, max = false) {
    const p = c.parameters, before = [p.actor, p.target].map(cfg => ({
        qi: 10000, eff_qi: 10000, ...cfg.properties, userp: 1, interactive: 1, wizardp: 0,
        weapon: 'none', busy: cfg.busy ?? 0, temp: {},
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {},
        cultivation: Object.fromEntries(yijinFields.map(k => [k, cfg.properties[k] ?? null])),
    }));
    const r = { before, immediate: structuredClone(before), metrics: [{}, {}], attacks: [], launches: [], interfaces: [],
        outcome: p.expected, command_accepted: p.command_return, reason: '原接口提示' };
    if (c.method === 'interface') r.interfaces.push({ ...p.interface, result: yijinInterface(p) });
    else {
        const a = r.immediate[0]; a.learned_points += p.completed;
        a.jing = p.clear_jing ? 0 : a.jing - p.completed * Math.trunc(1000 / a.int);
        if (p.completed) a.learned[p.skill] = p.completed * (max ? yijinResearchBound(p) : 1);
    }
    return r;
}

test('易筋独立注册，旧11122条件全内容指纹保持，全部来源存在', () => {
    const all = preOctober29SchoolConditions(catalog);
    const historical = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school));
    const old = historical.filter(c => !['emei-yijin', 'emei-shexing', 'emei-jiuyin-learning', 'emei-jiuyin-passive', 'emei-npc', 'emei-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 11122); assert.equal(old.reduce((n, c) => n + c.samples, 0), 275136);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '561261e7806471626789372bc2f332257556ae1546d1c536bc6c4055f9ebef3a');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'emei-yijin'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length); validateSchoolCombatPlan(cases, catalog);
    for (const c of cases) for (const file of c.parameters.qualification_sources) assert.ok(existsSync(join(root, file)), file);
    assert.ok(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8').includes('school_emei_yijin_cases.mjs'));
    assert.throws(() => emeiYijinConditions({ skills: [] }));
    assert.throws(() => emeiYijinConditions(catalog, { samples: 0 }));
});

test('确定性2次和随机100次分开；合成上下界仅验证采集器，不充当实测', () => {
    const smoke = emeiYijinConditions(catalog, { smoke: true });
    assert.equal(smoke.length, cases.length);
    for (let i = 0; i < cases.length; i++) {
        const c = cases[i], random = c.method === 'research' && c.parameters.expected === 'observed';
        assert.equal(c.samples, random ? 100 : 2); assert.equal(smoke[i].samples, random ? 2 : 1);
        for (const max of [false, true]) validateSchoolCombatRecord(record(c, max), c);
    }
});

test('性格按同名普通属性而无性按技能读取，观察不纠正旧判断', () => {
    for (const [id, , limit] of yijinCharacterLimits) {
        assert.equal(pick(`valid_learn-l800-${id}-no-attribute`).parameters.expected, 'observed');
        assert.equal(pick(`research-l800-${id}-no-attribute`).parameters.expected, 'observed');
        for (const ability of ['valid_learn', 'research']) for (const n of [limit, limit + 1])
            assert.equal(pick(`${ability}-l200-${id}-attribute${n}`).parameters.expected, n > limit ? 'refused' : 'observed');
    }
    assert.equal(pick('valid_learn-l49-eunuch').parameters.expected, 'observed');
    assert.equal(pick('valid_learn-l50-eunuch').parameters.expected, 'refused');
    assert.equal(pick('research-l200-eunuch').parameters.expected, 'refused');
    assert.equal(pick('research-l200-irrelevant-attribute800').parameters.expected, 'observed');
});

test('容量保留原整数运算、兼修最大值和当前映射，不等于max_neili增长', () => {
    assert.deepEqual([200, 400, 800].map(yijinBonus), [540, 2160, 8640]);
    assert.deepEqual([200, 400, 800].map(l => yijinCapacity(pick(`query_neili_limit-l${l}`).parameters.actor)), [3540, 8160, 20640]);
    for (const [mapping, expected] of [['yijin-duangu', 8160], ['linji-zhuang', 9020], ['huashan-xinfa', 6000], ['unmapped', 2000]]) {
        const a = pick('query_current_neili_limit-l400-mixed-' + mapping).parameters.actor;
        assert.equal(yijinCapacity(a, true), expected); assert.equal(yijinCapacity(a), 9020);
    }
    assert.equal(yijinBonus(201), 545);
    assert.equal(yijinCapacity(pick('query_neili_limit-l201').parameters.actor), 3565);
    assert.equal(yijinCapacity(pick('query_neili_limit-l400-combined').parameters.actor), 15571);
});

test('研究保留500级分段、兼修与潜能/精神部分完成；练习拒绝不丢弃', () => {
    assert.deepEqual([200, 400, 800].map(l => yijinResearchBound(pick(`research-l${l}`).parameters)), [11, 12, 11]);
    assert.deepEqual([200, 400, 800].map(l => yijinResearchBound(pick(`research-l${l}-compatible-forces`).parameters)), [19, 21, 16]);
    const c = pick('research-l200-partial'), r = record(c);
    assert.equal(c.parameters.completed, 2); assert.equal(r.immediate[0].jing, 0);
    assert.equal(schoolCultivationEffects([{ outcome: 'observed', raw: r }], 'yijin-duangu').potential_used.mean, 2);
    assert.equal(pick('research-l200-exp799999').parameters.command_return, 1);
    assert.equal(pick('research-l200-exp799999').parameters.completed, 0);
    for (const l of [200, 400, 800]) for (const a of ['practice', 'practice_skill'])
        assert.equal(pick(`${a}-l${l}`).parameters.expected, 'refused');
});

test('丢观察、错误返回、资源串扰、异常、超界进度不得被合格格式掩盖', () => {
    const c = pick('research-l200');
    for (const mutate of [r => delete r.before[0].cultivation['yijin-duangu'],
        r => r.immediate[0].neili--, r => r.immediate[1].qi--, r => r.outcome = 'error',
        r => r.immediate[0].learned['yijin-duangu'] = 10000, r => r.immediate[0].skills.force++,
        r => r.attacks.push({}), r => r.before[0].wizardp = 1]) {
        const r = record(c); mutate(r); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const q = pick('query_neili_improve-l200'), r = record(q); r.interfaces[0].result++;
    assert.throws(() => validateSchoolCombatRecord(r, q));
});
