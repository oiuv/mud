import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { gumuComboMoves, gumuComboConditions, validateGumuComboRecord, gumuComboEffects,
    gumuComboFixtureRequirements } from './school_gumu_combo_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = gumuComboConditions(catalog);
function pick(ability, suffix = '', level = 200) {
    const d = gumuComboMoves.find(x => x.ability === ability);
    const c = cases.find(x => x.id === `school-gumu-combo-${d.skill}-${ability}-l${level}${suffix}`);
    assert.ok(c, ability + suffix); return c;
}

// Synthetic observations ONLY: no fake clocks or forced RNG enter real sampling.
function trace(c, success = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
        neili: 6000, max_neili: 6000, ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/'))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')),
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations),
        weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? 0, clock_seconds: 1000,
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (k === 'dodge' && cfg.equipment ? -1 : 0)])),
        temp: { apply: { ...(cfg.temp ? { attack: cfg.temp['apply/attack'] } : {}),
            ...(cfg.equipment ? { dodge: -1 } : {}) } },
    }));
    if (p.ability === 'tuo') before[0].temp.last_perform = { 'sad-strike': {
        tuo: p.cooldown_age_seconds === undefined ? 0 : 1000 - p.cooldown_age_seconds } };
    const r = { before, immediate: structuredClone(before),
        outcome: p.expected, metrics: [{}, {}], launches: [], attacks: [], dropped: [], reason: '' };
    if (p.expected === 'refused') { r.reason = '此刻不能施展'; return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    if (p.ability === 'tuo') {
        r.metrics[0].neili_cost = success ? 400 : 200; r.metrics[0].direct = Number(success);
        r.immediate[0].busy = 2;
        if (success) r.immediate[0].temp.last_perform['sad-strike'].tuo = 1000;
    } else {
        const level = before[0].skills[p.skill];
        const plans = p.ability === 'lian' ? 4 : 6 + (level > 600 ? Math.trunc((level - 400) / 200) : 0);
        r.metrics[0].neili_cost = plans * (p.ability === 'lian' ? 20 : 70);
        r.immediate[0].busy = 2;
        r.attacks = Array.from({ length: 3 }, () => ({ actor: 0, target: 1, type: 0, result: 1, damage: 10 }));
        r.immediate[1].busy = 0;
        r.immediate[0].temp.apply.attack = (before[0].temp.apply.attack ?? 0)
            - (p.ability === 'lian' && !success ? 70 : 0);
    }
    r.immediate[0].neili -= r.metrics[0].neili_cost;
    if (p.ability !== 'tuo' || success) {
        r.metrics[1].qi_cost = 30; r.metrics[1].eff_qi_cost = 10;
        r.immediate[1].qi -= 30; r.immediate[1].eff_qi -= 10;
    }
    return r;
}

test('三入口75条件2796计划记录，明确诊断状态且烟雾不替代正式', () => {
    assert.equal(cases.length, 75); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2796);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => s.entries.map(e => e.id)));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id)); assert.equal(c.parameters.actor.properties.jiali, 0);
        for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
        validateGumuComboRecord(trace(c, c.parameters.ability === 'tuo' && c.id.endsWith('-low-defense')), c);
        if (c.parameters.expected === 'observed' && !c.id.endsWith('-high-defense'))
            validateGumuComboRecord(trace(c, true), c);
    }
    const smoke = gumuComboConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 150);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.equal(gumuComboFixtureRequirements.length, 5);
    assert.throws(() => gumuComboConditions({ skills: [] }));
    for (const samples of [0, -1, 0.5, NaN]) assert.throws(() => gumuComboConditions(catalog, { samples }));
});

test('赤练正常教学三档均保留拒绝，错键和缺正常键为明示诊断而非修复', () => {
    for (const level of [200, 400, 800]) {
        const normal = pick('lian', '', level), diagnostic = pick('lian', '-diagnostic', level);
        assert.equal(normal.parameters.expected, 'refused'); assert.equal(normal.parameters.diagnostic_only, false);
        assert.equal(normal.parameters.actor.properties['can_perform/chilian-shenzhang/lian'], 1);
        assert.equal(normal.parameters.actor.properties['can_perform/chiilian-shenzhang/lian'], 0);
        assert.equal(diagnostic.parameters.diagnostic_only, true);
        validateGumuComboRecord(trace(normal), normal); validateGumuComboRecord(trace(diagnostic), diagnostic);
    }
    const c = pick('lian', '-diagnostic-wrong-key-only');
    assert.equal(c.parameters.actor.properties['can_perform/chilian-shenzhang/lian'], 0);
    assert.equal(c.parameters.actor.properties['can_perform/chiilian-shenzhang/lian'], 1);
    validateGumuComboRecord(trace(c), c);
    const r = trace(c); r.before[0].cultivation['can_perform/chiilian-shenzhang/lian'] = 0;
    assert.throws(() => validateGumuComboRecord(r, c));
});

test('赤练失败残留负70原样验收，成功恢复原值，不能错误地为失败补回', () => {
    const c = pick('lian', '-diagnostic-existing-attack');
    const failed = trace(c), succeeded = trace(c, true);
    assert.equal(failed.immediate[0].temp.apply.attack, -53);
    assert.equal(succeeded.immediate[0].temp.apply.attack, 17);
    validateGumuComboRecord(failed, c); validateGumuComboRecord(succeeded, c);
    const high = pick('lian', '-diagnostic-existing-attack-high-defense');
    const r = trace(high); r.immediate[0].temp.apply.attack = 17;
    assert.throws(() => validateGumuComboRecord(r, high));
    const mutated = trace(c); mutated.immediate[0].temp.apply.attack--;
    assert.throws(() => validateGumuComboRecord(mutated, c));
});

test('黯然600六击601七击800八击先预扣，实际少出招也不退款或钳制负值', () => {
    for (const [level, plans, remaining] of [[600, 6, 80], [601, 7, 10], [800, 8, -60]]) {
        const c = pick('xiao', '-neili500', level), r = trace(c);
        assert.equal(r.metrics[0].neili_cost, plans * 70); assert.equal(r.immediate[0].neili, remaining);
        assert.equal(r.attacks.length, 3); validateGumuComboRecord(r, c);
        const clamped = structuredClone(r); clamped.immediate[0].neili = 0;
        assert.throws(() => validateGumuComboRecord(clamped, c));
        const refunded = structuredClone(r); refunded.metrics[0].neili_cost = 210;
        refunded.immediate[0].neili = 290; assert.throws(() => validateGumuComboRecord(refunded, c));
    }
    assert.equal(pick('xiao', '-neili499', 800).parameters.expected, 'refused');
    assert.equal(trace(pick('xiao', '-neili559', 800)).immediate[0].neili, -1);
    assert.equal(trace(pick('xiao', '-neili560', 800)).immediate[0].neili, 0);
    const c = pick('xiao', '-existing-attack'), r = trace(c);
    r.immediate[0].temp.apply.attack = 0; assert.throws(() => validateGumuComboRecord(r, c));
});

test('拖泥婚姻、真实时钟初态与成功冷却分开，失败不写冷却；持器不添加原本不存在的禁令', () => {
    for (const suffix of ['-no-partner', '-remarried', '-recent-cooldown']) {
        const c = pick('tuo', suffix); assert.equal(c.parameters.expected, 'refused');
        validateGumuComboRecord(trace(c), c);
    }
    const c = pick('tuo', '-expired-cooldown');
    for (const success of [false, true]) {
        const r = trace(c, success); validateGumuComboRecord(r, c);
        assert.equal(r.immediate[0].temp.last_perform['sad-strike'].tuo, success ? 1000 : 939);
        assert.equal(r.metrics[0].neili_cost, success ? 400 : 200);
        r.immediate[0].temp.last_perform['sad-strike'].tuo = success ? 939 : 1000;
        assert.throws(() => validateGumuComboRecord(r, c));
    }
    assert.equal(pick('tuo', '-weapon').parameters.expected, 'observed');
    for (const ability of ['lian', 'xiao'])
        assert.equal(pick(ability, ability === 'lian' ? '-diagnostic-weapon' : '-weapon').parameters.expected, 'refused');
    assert.equal(pick('tuo', '-max-neili5000').parameters.actor.properties.max_neili, 5000);
    assert.equal(pick('tuo', '-max-neili5001').parameters.actor.properties.max_neili, 5001);
});

test('每招最小有效内功独立，200档黯然内功不是200，原始与有效等级不互换', () => {
    for (const d of gumuComboMoves) {
        const prefix = d.ability === 'lian' ? '-diagnostic' : '';
        for (const low of [false, true]) {
            const c = pick(d.ability, prefix + (low ? '-low-force' : '-minimum-force')), r = trace(c);
            assert.equal(r.before[0].effective_skills.force, d.force - Number(low));
            validateGumuComboRecord(r, c);
            r.before[0].effective_skills.force++; assert.throws(() => validateGumuComboRecord(r, c));
        }
    }
    assert.equal(pick('tuo').parameters.actor.skills.force, 300);
    assert.equal(trace(pick('tuo')).before[0].effective_skills.force, 450);
});

test('未知计数、未记录资格、错攻击类型与资源不闭合不得冒充完整样本', () => {
    const c = pick('xiao');
    for (const mutate of [
        r => { r.before[0].userp = 0; }, r => { r.before[1].wizardp = 1; },
        r => { r.before[0].cultivation['can_perform/sad-strike/xiao'] = 0; },
        r => { r.metrics[0] = null; }, r => { r.metrics[0].neili_cost = null; },
        r => { r.immediate[1].qi--; }, r => { r.metrics[0].direct = 1; },
        r => { r.attacks[0].type = 2; }, r => { r.attacks[0].target = 0; },
        r => { r.attacks = []; }, r => { r.attacks = Array.from({ length: 10 }, () => ({ actor: 0, target: 1, type: 0 })); },
    ]) { const r = trace(c); mutate(r); assert.throws(() => validateGumuComboRecord(r, c)); }
    const refused = pick('lian'), r = trace(refused); r.metrics[0].neili_cost = 1; r.immediate[0].neili--;
    assert.throws(() => validateGumuComboRecord(r, refused));
});

test('按冻结条件分开诊断与正常，真实记录不重复参数，未知不会自动归为正常', () => {
    const rows = c => { const raw = trace(c); return [{ outcome: raw.outcome, raw }]; };
    const normal = pick('xiao', '-neili500', 800), diagnostic = pick('lian', '-diagnostic');
    const n = gumuComboEffects(rows(normal), normal), d = gumuComboEffects(rows(diagnostic), diagnostic);
    assert.equal(n.normal.samples, 1); assert.equal(n.diagnostic.samples, 0);
    assert.equal(d.diagnostic.samples, 1); assert.equal(d.normal.samples, 0);
    assert.equal(n.normal.remaining_neili.mean, -60); assert.equal(d.diagnostic.attack_residual.mean, -70);
    assert.equal(gumuComboEffects(rows(pick('lian')), pick('lian')).unobserved, 1);
    assert.equal(gumuComboEffects(rows(normal)).unknown_scope, 1);
    assert.equal(gumuComboEffects([]).normal.neili_cost.mean, null);
    const r = trace(pick('tuo')); r.metrics[0].neili_cost = null;
    assert.equal(gumuComboEffects([{ outcome: 'observed', raw: r }], pick('tuo')).normal.neili_cost.mean, null);
});

test('旧11947条件完整指纹保持，统一入口分发本批验证', () => {
    const all = schoolCombatConditions(catalog);
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
        (!c.parameters.collection_group?.startsWith('gumu-') ||
        ['gumu-control', 'gumu-direct', 'gumu-advanced', 'gumu-unarmed'].includes(c.parameters.collection_group)));
    assert.equal(old.length, 11947); assert.equal(old.reduce((n, c) => n + c.samples, 0), 302986);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '4bd9b4c46eb514d4b41ff2e82f232a360b0d249c44b7473032d7396ef4c33c9d');
    assert.deepEqual(all.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.collection_group === 'gumu-combo'), cases);
    for (const c of cases) validateSchoolCombatRecord(trace(c, c.parameters.ability === 'tuo' && c.id.endsWith('-low-defense')), c);
});

test('真实undefined忙乱及省略攻击类型可归零，缺失字段仍拒绝；拒绝文案不伪造成状态变更', () => {
    const c = pick('xiao'), r = trace(c);
    for (const state of [...r.before, r.immediate[1]]) state.busy = null;
    for (const hit of r.attacks) hit.type = null;
    validateGumuComboRecord(r, c);
    for (const mutate of [row => { delete row.before[0].busy; }, row => { delete row.immediate[1].busy; },
        row => { delete row.attacks[0].type; }, row => { delete row.before[0].cultivation.character; }]) {
        const row = structuredClone(r); mutate(row); assert.throws(() => validateGumuComboRecord(row, c));
    }
    const refused = pick('lian'), f = trace(refused);
    f.immediate[0].temp.notify_fail = '没有这种功能'; validateGumuComboRecord(f, refused);
    f.immediate[0].temp.apply.attack--; assert.throws(() => validateGumuComboRecord(f, refused));
});

test('连击遵循原普通伤害中断忙乱，直接伤害不套用普通中断规则', () => {
    for (const ability of ['lian', 'xiao']) {
        const c = pick(ability, ability === 'lian' ? '-diagnostic-target-busy' : '-target-busy');
        const r = trace(c); assert.equal(r.before[1].busy, 50); assert.equal(r.immediate[1].busy, 0);
        validateGumuComboRecord(r, c);
        const missed = structuredClone(r);
        for (const hit of missed.attacks) hit.damage = 0;
        missed.immediate[1].busy = 50; missed.immediate[1].qi = missed.before[1].qi;
        missed.immediate[1].eff_qi = missed.before[1].eff_qi; missed.metrics[1] = {};
        validateGumuComboRecord(missed, c);
        missed.immediate[1].busy = 49; assert.throws(() => validateGumuComboRecord(missed, c));
    }
    const c = pick('tuo', '-target-busy'), r = trace(c, true);
    assert.equal(r.immediate[1].busy, 50); validateGumuComboRecord(r, c);
});
