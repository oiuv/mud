import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { fireiceFollowupProbe } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { gumuFireiceConditions, validateGumuFireiceRecord, gumuFireiceEffects,
    gumuFireiceFixtureRequirements } from './school_gumu_fireice_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = gumuFireiceConditions(catalog);
function pick(level = 200, suffix = '') {
    const c = cases.find(x => x.id === `school-gumu-fireice-l${level}${suffix}`);
    assert.ok(c); return c;
}

// Synthetic observations exercise validators, not actual callbacks or RNG.
function trace(c, firstHit = false, secondHit = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
        neili: 6000, max_neili: 6000, ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/'))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')),
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations),
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (k === 'dodge' && cfg.equipment ? -1 : 0)])),
        weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? 0,
        temp: { apply: cfg.equipment ? { dodge: -1 } : {} },
    }));
    const r = { before, immediate: structuredClone(before),
        outcome: p.expected, immediate_metrics: [{}, {}], launches: [], attacks: [], dropped: [],
        fireice_followups: [], elapsed: 0.5, reason: '' };
    const [a, t] = r.immediate;
    const jiuyang = before[1].mappings.force === 'jiuyang-shengong';
    let scheduled = false;
    if (p.expected === 'refused') r.reason = '此刻不能施展';
    else {
        r.launches.push({ skill: p.skill, argument: p.ability });
        if (jiuyang) {
            r.immediate_metrics[0].neili_cost = firstHit ? 100 : 200;
            a.busy = firstHit ? 0 : 3;
        } else {
            r.immediate_metrics[0].neili_cost = firstHit ? 300 : 100;
            a.busy = firstHit ? 1 : 3;
            if (firstHit) {
                r.immediate_metrics[0].direct = 1; t.busy = 1;
                r.immediate_metrics[1] = { qi_cost: 100, eff_qi_cost: 30 };
                t.qi -= 100; t.eff_qi -= 30;
                scheduled = before[0].skills['fireice-strike'] > 150;
            }
        }
        a.neili -= r.immediate_metrics[0].neili_cost;
    }
    r.metrics = structuredClone(r.immediate_metrics); r.after = structuredClone(r.immediate);
    if (scheduled) {
        r.fireice_followups.push({ phase: 'entry', function: 'perform2', elapsed: 0.1,
            same_room: 1, target_living: 1, actor_neili: a.neili, metrics: structuredClone(r.immediate_metrics) });
        if (a.neili >= 600) {
            r.after[0].busy = secondHit ? 1 : 3;
            const cost = secondHit ? 300 : 100;
            r.metrics[0].neili_cost += cost; r.after[0].neili -= cost;
            if (secondHit) {
                r.metrics[0].direct++; r.metrics[1].qi_cost += 100; r.metrics[1].eff_qi_cost += 50;
                r.after[1].qi -= 100; r.after[1].eff_qi -= 50;
            }
        }
    }
    return r;
}

test('冰火35条件2128计划记录，原入口和公开来源闭合，烟雾独立', () => {
    assert.equal(cases.length, 35); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2128);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        assert.equal(c.parameters.observe_seconds, 1); assert.equal(c.parameters.actor.properties.jiali, 0);
        validateGumuFireiceRecord(trace(c), c);
        if (!c.id.endsWith('-high-parry') && !c.id.endsWith('-jiuyang-force100000'))
            validateGumuFireiceRecord(trace(c, true), c);
    }
    const smoke = gumuFireiceConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 70);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.equal(gumuFireiceFixtureRequirements.length, 5);
    assert.throws(() => gumuFireiceConditions({ skills: [] }));
    for (const samples of [0, -1, 0.5, NaN]) assert.throws(() => gumuFireiceConditions(catalog, { samples }));
});

test('回调探针只在原函数局部声明后观察，去除可逐字还原，不改原零延迟', () => {
    const source = readFileSync(join(root, 'kungfu/skill/fireice-strike/binghuo.c'), 'utf8');
    const { changed, sites } = fireiceFollowupProbe(source);
    assert.equal(sites.length, 1);
    assert.equal(changed.replace(sites[0].anchor + sites[0].insert, sites[0].anchor), source);
    assert.match(changed, /call_out\("perform2", 0, me, target\)/);
    assert.match(sites[0].insert, /observe_fireice_followup\(me, target\)/);
    for (const text of ['', source + source, source.replace('int damage;', 'int amount;')])
        assert.throws(() => fireiceFollowupProbe(text));
});

test('已知null忙乱归零但缺失不合格，准备和领悟观测必须真实存在', () => {
    const c = pick(200, '-jiuyang-force200'), r = trace(c, true);
    for (const state of [...r.before, ...r.immediate, ...r.after]) state.busy = null;
    validateGumuFireiceRecord(r, c);
    for (const mutate of [x => { delete x.before[0].busy; }, x => { delete x.after[0].busy; },
        x => { delete x.before[0].cultivation.character; },
        x => { delete x.before[0].cultivation['can_perform/fireice-strike/binghuo']; }]) {
        const bad = structuredClone(r); mutate(bad); assert.throws(() => validateGumuFireiceRecord(bad, c));
    }
});

test('原技能150级只有首掌，151级起由真实回调入口证据区分，不拿施展计数当第二掌', () => {
    const c150 = pick(150), c151 = pick(151);
    const r150 = trace(c150, true, true), r151 = trace(c151, true, true);
    validateGumuFireiceRecord(r150, c150); validateGumuFireiceRecord(r151, c151);
    assert.equal(r150.fireice_followups.length, 0); assert.equal(r150.metrics[0].direct, 1);
    assert.equal(r151.fireice_followups.length, 1); assert.equal(r151.metrics[0].direct, 2);
    assert.equal(r151.launches.length, 1);
    r151.fireice_followups = []; assert.throws(() => validateGumuFireiceRecord(r151, c151));
    r150.fireice_followups = trace(c151, true).fireice_followups;
    assert.throws(() => validateGumuFireiceRecord(r150, c150));
});

test('初始800和899首掌扣300后第二掌不足600，900恰好够；保留先后两本费用账', () => {
    for (const level of [151, 200]) for (const neili of [800, 899, 900]) {
        const c = pick(level, '-neili' + neili), r = trace(c, true, true);
        validateGumuFireiceRecord(r, c);
        assert.equal(r.immediate_metrics[0].neili_cost, 300);
        assert.equal(r.metrics[0].neili_cost, neili === 900 ? 600 : 300);
        assert.equal(r.fireice_followups.length, 1);
        const bad = structuredClone(r); bad.fireice_followups[0].actor_neili = neili;
        assert.throws(() => validateGumuFireiceRecord(bad, c));
    }
    const c = pick(200, '-neili900'), r = trace(c, true, false);
    validateGumuFireiceRecord(r, c); assert.equal(r.metrics[0].neili_cost, 400);
    assert.equal(r.metrics[0].direct, 1); assert.equal(r.after[0].busy, 3);
});

test('九阳只化解不直接伤害，反震文案不制造自伤；判定只读基本内功', () => {
    for (const suffix of ['-jiuyang-force2', '-jiuyang-force200', '-jiuyang-special120', '-jiuyang-special800']) {
        const c = pick(200, suffix);
        for (const success of [false, true]) {
            const r = trace(c, success, true); validateGumuFireiceRecord(r, c);
            assert.equal(r.metrics[0].direct ?? 0, 0); assert.equal(r.fireice_followups.length, 0);
            assert.equal(r.after[0].qi, r.before[0].qi); assert.equal(r.after[1].qi, r.before[1].qi);
        }
    }
    const c = pick(200, '-jiuyang-force100000'); validateGumuFireiceRecord(trace(c), c);
    assert.throws(() => validateGumuFireiceRecord(trace(c, true), c));
    const weak = trace(pick(200, '-jiuyang-special120'), true), strong = trace(pick(200, '-jiuyang-special800'), true);
    assert.equal(weak.before[1].skills.force, strong.before[1].skills.force);
    assert.notEqual(weak.before[1].effective_skills.force, strong.before[1].effective_skills.force);
});

test('首段招架与次段轻功分开，低防也保留random零值失败，已忙目标可被改成一忙', () => {
    const highParry = pick(200, '-high-parry'), highDodge = pick(200, '-high-dodge');
    validateGumuFireiceRecord(trace(highParry), highParry);
    assert.throws(() => validateGumuFireiceRecord(trace(highParry, true), highParry));
    validateGumuFireiceRecord(trace(highDodge, true, false), highDodge);
    assert.throws(() => validateGumuFireiceRecord(trace(highDodge, true, true), highDodge));
    const low = pick(200, '-low-dodge');
    for (const [first, second] of [[false, false], [true, false], [true, true]])
        validateGumuFireiceRecord(trace(low, first, second), low);
    const busy = pick(200, '-target-busy'), r = trace(busy, true, true);
    assert.equal(r.before[1].busy, 50); assert.equal(r.after[1].busy, 1);
    validateGumuFireiceRecord(r, busy);
});

test('不增加原本没有的领悟和准备门槛，保留映射、原始玉女等级、内力上限及当前量检查', () => {
    for (const suffix of ['', '-no-prepare', '-with-grant', '-minimum-skill', '-minimum-yunv', '-minimum-max-neili', '-minimum-neili']) {
        const c = pick(200, suffix); assert.equal(c.parameters.expected, 'observed');
        validateGumuFireiceRecord(trace(c, true, true), c);
    }
    for (const suffix of ['-no-map', '-busy', '-no-fight', '-weapon', '-low-skill', '-low-yunv', '-low-max-neili', '-low-neili']) {
        const c = pick(200, suffix); assert.equal(c.parameters.expected, 'refused');
        validateGumuFireiceRecord(trace(c), c);
    }
    assert.equal(pick().parameters.actor.properties['can_perform/fireice-strike/binghuo'], 0);
});

test('漏记录回调、未知即时费用、心跳污染、错误身份和统计回退不能冒充有效记录', () => {
    const c = pick();
    for (const mutate of [
        r => { r.before[0].wizardp = 1; }, r => { r.before[1].userp = 0; },
        r => { r.immediate_metrics[0] = null; }, r => { r.metrics[0].neili_cost = null; },
        r => { r.fireice_followups[0].elapsed = r.elapsed + 1; },
        r => { r.fireice_followups[0].same_room = 0; },
        r => { r.fireice_followups[0].metrics[0].neili_cost = 0; },
        r => { r.immediate[0].qi--; }, r => { r.metrics[0].heartbeats = 1; },
        r => { r.attacks.push({ actor: 0, target: 1, type: 0 }); },
        r => { r.metrics[1].qi_cost = 99; r.after[1].qi = 9901; },
    ]) { const r = trace(c, true, true); mutate(r); assert.throws(() => validateGumuFireiceRecord(r, c)); }
});

test('按样本汇总即时和总计直伤及费用，未知不补零，进入回调不等于成功打出第二掌', () => {
    const rows = [trace(pick(151, '-neili800'), true), trace(pick(), true, true),
        trace(pick(200, '-jiuyang-force200'), false), trace(pick(200, '-low-skill'))]
        .map(raw => ({ outcome: raw.outcome, raw }));
    const result = gumuFireiceEffects(rows);
    assert.equal(result.samples, 3); assert.equal(result.callback_entered.successes, 2);
    assert.equal(result.first_direct_calls.mean, 2 / 3); assert.equal(result.total_direct_calls.mean, 1);
    assert.equal(result.followup_neili_cost.mean, 100); assert.equal(result.unobserved, 1);
    const unknown = gumuFireiceEffects([{ outcome: 'observed', raw: {} }]);
    assert.equal(unknown.unknown_callback, 1); assert.equal(unknown.total_neili_cost.mean, null);
    assert.equal(gumuFireiceEffects([]).callback_entered.rate, null);
});

test('旧12022条件完整指纹不变，新增35条件由统一入口校验', () => {
    const all = preOctober29SchoolConditions(catalog);
    const old = all.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-core', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-qishang', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-xinfa', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-movement', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-shengong', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-shenghuo', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-ling-learning', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-ling-perform', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-apprentice-learning', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-public-force', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-teachers', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-recruit', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-gift', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-book', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-qkd', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-jiuyang', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !['mingjiao-jiuyang-learning', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-direct', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-remaining', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-exert', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-capacity', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-research', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-fusion', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-perform', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-base', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) &&
        !c.parameters.collection_group?.startsWith('taohua-') &&
        (!c.parameters.collection_group?.startsWith('gumu-') && c.parameters.collection_group !== 'gumu-fireice-g6' ||
        ['gumu-control', 'gumu-direct', 'gumu-advanced', 'gumu-unarmed', 'gumu-combo'].includes(c.parameters.collection_group)));
    assert.equal(old.length, 12022); assert.equal(old.reduce((n, c) => n + c.samples, 0), 305782);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '53f7ca3efae1619e0577e3bbfc35b983587ddec367cdf216ea456d4d771cd4cf');
    assert.deepEqual(all.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.collection_group === 'gumu-fireice'), cases);
    for (const c of cases) validateSchoolCombatRecord(trace(c), c);
});
