import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { digest } from './ledger.mjs';
import { needleHitProbe } from './execution.mjs';
import { gumuNeedles, gumuThrowingConditions, gumuThrowingFixtureRequirements,
    validateGumuThrowingRecord, gumuThrowingEffects } from './school_gumu_throwing_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = gumuThrowingConditions(catalog), copy = structuredClone;
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
function pick(skill, suffix) {
    const c = cases.find(c => c.id === `school-gumu-throwing-${skill}-${suffix}`); assert.ok(c); return c;
}
function snapshot(cfg, side) {
    const state = { userp: 1, interactive: 1, wizardp: 0, living: 1, busy: cfg.busy ?? 0,
        id: side ? 'right' : 'left', weapon: 'none', conditions: {}, handing_details: {}, temp: { apply: {} },
        ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/'))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')),
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations),
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, n]) =>
            [k, Math.trunc(n / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (cfg.temp?.['apply/' + k] ?? 0)])) };
    for (const [k, n] of Object.entries(cfg.temp ?? {})) {
        if (k.startsWith('apply/')) state.temp.apply[k.slice(6)] = n;
        else state.temp[k] = n;
    }
    if (cfg.equipment) {
        const e = cfg.equipment, d = gumuNeedles.find(d => d.program === e.program);
        state.handing_details = { object: e.program + '#synthetic', program: e.program,
            skill_type: e.type, amount: e.amount, daub: d ? { ...d.daub_by, poison_type: d.poison.type,
                poison: { id: d.poison.id, name: d.poison.name, level: d.poison.level, remain: d.poison.remain } } : {} };
    }
    return state;
}
function settle(r) {
    r.after = copy(r.immediate);
    r.metrics = [0, 1].map(side => Object.fromEntries(health.map(k =>
        [k + '_cost', r.before[side][k] - r.immediate[side][k]])));
    return r;
}
// Synthetic traces check only the validator. These are not real-driver observations.
function trace(c, hit = null) {
    const p = c.parameters, d = gumuNeedles.find(d => d.skill === p.skill);
    const before = [p.actor, p.target].map(snapshot);
    const r = { method: c.method, outcome: p.expected, before, immediate: copy(before),
        attacks: [], launches: [], needle_hits: [], reason: p.expected === 'refused' ? '原资格拒绝' : '' };
    if (p.expected === 'refused') return settle(r);
    const [b, bt] = before, [a, t] = r.immediate;
    const ap = b.effective_skills.throwing, dp = bt.effective_skills.dodge;
    if (hit === null) hit = (d.ability === 'ying' ? Math.trunc(ap / 2) : ap) > dp;
    const vital = hit && d.ability === 'bing' && bt.effective_skills.parry < ap;
    r.launches.push({ skill: d.skill, argument: d.ability });
    a.neili -= d.cost; a.handing_details.amount--;
    a.busy = d.ability === 'ying' ? 2 : !hit ? 3 : vital ? b.busy : 1;
    const amount = a.handing_details.amount;
    r.ammo_cleanup = { checked: true, object_exists: amount > 0,
        handing_object: amount > 0 ? a.handing_details.object : null };
    if (hit) {
        const level = b.skills[d.skill];
        if (d.ability === 'ying') t.eff_qi -= level;
        else if (vital) {
            t.qi -= level; t.eff_qi -= level; t.temp.bingpo = 1;
            for (const [k, n] of [['attack', 70], ['dodge', 70], ['parry', 20]])
                t.temp.apply[k] = (t.temp.apply[k] ?? 0) - n;
        } else { t.qi -= 100; t.eff_qi -= 40; }
        t.qi = Math.min(t.qi, t.eff_qi);
        r.needle_hits.push({ actor: 0, target: 1, program: b.handing_details.program,
            damage_bonus: d.ability === 'ying' ? b.jiali + 100 : vital ? b.jiali + 180 : Math.trunc(b.jiali / 2) });
        const poison = a.handing_details.daub.poison;
        if (poison) {
            poison.remain -= poison.level;
            if (poison.id !== bt.id && poison.level >= bt.skills.poison
                && poison.level >= Math.trunc(bt.effective_skills.force / 2)) {
                if (!bt.cultivation['special_skill/piyi']) {
                    const level = Math.trunc(poison.level * 8 / 10) + 1;
                    t.conditions[a.handing_details.daub.poison_type] = {
                        id: poison.id, name: poison.name, level, remain: level };
                }
                if (poison.level >= bt.effective_skills.force) t.busy = 1;
            }
        }
    }
    return settle(r);
}

test('两门原针法77条件5740计划记录；资格、原针具、毒性与零枚清理分别留证', () => {
    assert.equal(gumuNeedles.length, 2); assert.equal(gumuThrowingFixtureRequirements.length, 5);
    assert.equal(cases.length, 77); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 5740);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 20);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        assert.ok(catalog.skills.some(s => s.entries.some(e => e.id === c.entry_id)));
        for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
        validateGumuThrowingRecord(trace(c), c);
    }
    const smoke = gumuThrowingConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 154);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    for (const samples of [0, -1, 1.5, NaN]) assert.throws(() => gumuThrowingConditions(catalog, { samples }));
    assert.throws(() => gumuThrowingConditions({ skills: [] }));
});

test('闪避也耗一枚和固定内力，加力不是额外资源扣费；拒绝不耗针', () => {
    for (const d of gumuNeedles) {
        const c = pick(d.skill, 'l200-j50');
        for (const hit of [false, true]) {
            const r = trace(c, hit); validateGumuThrowingRecord(r, c);
            assert.equal(r.metrics[0].neili_cost, d.cost);
            r.immediate[0].neili -= 50; settle(r);
            assert.throws(() => validateGumuThrowingRecord(r, c));
        }
        const refused = pick(d.skill, 'low-neili'), r = trace(refused);
        r.immediate[0].handing_details.amount--; assert.throws(() => validateGumuThrowingRecord(r, refused));
    }
});

test('无影创伤、寒冰轻伤和要害命中不能互相替代，原忙乱与减益保留', () => {
    const ying = pick('yufeng-zhen', 'low-dodge'), y = trace(ying);
    validateGumuThrowingRecord(y, ying); assert.equal(y.metrics[1].qi_cost, 200);
    assert.equal(y.metrics[1].eff_qi_cost, 200); assert.equal(y.immediate[0].busy, 2);
    const partial = pick('bingpo-shenzhen', 'high-parry'), r = trace(partial);
    validateGumuThrowingRecord(r, partial); assert.equal(r.metrics[1].qi_cost, 100);
    assert.equal(r.metrics[1].eff_qi_cost, 40); assert.deepEqual(r.immediate[1].temp.apply, {});
    const vital = pick('bingpo-shenzhen', 'existing-apply'), v = trace(vital);
    validateGumuThrowingRecord(v, vital); assert.equal(v.before[1].effective_skills.dodge, 24);
    assert.equal(v.before[1].effective_skills.parry, 12);
    assert.deepEqual(v.immediate[1].temp.apply, { attack: -53, dodge: -47, parry: -9 });
    assert.equal(v.immediate[0].busy, 0); v.immediate[0].busy = 1;
    assert.throws(() => validateGumuThrowingRecord(v, vital));
    r.needle_hits[0].damage_bonus = 180; assert.throws(() => validateGumuThrowingRecord(r, partial));
});

test('原随机上下界限制命中与创伤，不强迫所有概率样本成功', () => {
    for (const d of gumuNeedles) {
        const high = pick(d.skill, 'high-dodge'), low = pick(d.skill, 'low-dodge');
        assert.throws(() => validateGumuThrowingRecord(trace(high, true), high));
        assert.throws(() => validateGumuThrowingRecord(trace(low, false), low));
        const r = trace(low); r.immediate[1].eff_qi--;
        r.immediate[1].eff_qi -= 200; r.immediate[1].qi = r.immediate[1].eff_qi; settle(r);
        assert.throws(() => validateGumuThrowingRecord(r, low));
    }
});

test('毒性取实际针具而非绝招名称，命中先消耗原淬毒储量', () => {
    for (const d of gumuNeedles) {
        const other = gumuNeedles.find(n => n !== d), c = pick(d.skill, 'other-needle'), r = trace(c);
        validateGumuThrowingRecord(r, c);
        assert.deepEqual(Object.keys(r.immediate[1].conditions), [other.poison.type]);
        assert.equal(r.immediate[0].handing_details.daub.poison.remain, other.poison.remain - other.poison.level);
        r.immediate[1].conditions = {}; assert.throws(() => validateGumuThrowingRecord(r, c));
        const neutral = pick(d.skill, 'neutral-needle'), n = trace(neutral);
        validateGumuThrowingRecord(n, neutral); assert.deepEqual(n.immediate[1].conditions, {});
        assert.equal(n.needle_hits.length, 1);
    }
});

test('内功整除和毒技边界独立；辟易、免毒与临时无毒不伪装成相同即时结果', () => {
    for (const d of gumuNeedles) {
        const level = d.poison.level;
        for (const [suffix, poisoned, busy] of [
            ['poison-force' + level, true, true], ['poison-force' + (level + 1), true, false],
            ['poison-force' + (2 * level + 1), true, false], ['poison-force' + (2 * level + 2), false, false],
            ['poison-skill' + level, true, true], ['poison-skill' + (level + 1), false, false],
            ['piyi', false, true], ['immune', true, true], ['nopoison', true, true],
        ]) {
            const c = pick(d.skill, suffix), r = trace(c); validateGumuThrowingRecord(r, c);
            assert.equal(Object.keys(r.immediate[1].conditions).length, Number(poisoned), suffix);
            assert.equal(r.immediate[1].busy > 0, busy, suffix);
        }
    }
});

test('原制毒者与淬毒者分别保存，按实际制毒者ID校验免毒而不擅自改数据', () => {
    for (const d of gumuNeedles) {
        const xiao = pick(d.skill, 'maker-xiao-longnv'), li = pick(d.skill, 'maker-li-mochou');
        const x = trace(xiao), l = trace(li); validateGumuThrowingRecord(x, xiao); validateGumuThrowingRecord(l, li);
        assert.deepEqual(x.immediate[1].conditions, {});
        assert.equal(l.immediate[1].conditions[d.poison.type].id, 'xiao longnv');
        if (d.ability === 'bing') {
            assert.equal(l.before[0].handing_details.daub.who_id, 'li mochou');
            l.immediate[1].conditions[d.poison.type].id = 'li mochou';
            assert.throws(() => validateGumuThrowingRecord(l, li));
        }
    }
});

test('最后一枚发动时对象仍在，原零延时销毁须独立观察', () => {
    for (const d of gumuNeedles) {
        const c = pick(d.skill, 'amount1'), r = trace(c, true); validateGumuThrowingRecord(r, c);
        assert.equal(r.immediate[0].handing_details.amount, 0); assert.equal(r.ammo_cleanup.object_exists, false);
        for (const mutate of [
            r => { delete r.ammo_cleanup; }, r => { r.ammo_cleanup.checked = false; },
            r => { r.ammo_cleanup.object_exists = true; }, r => { r.ammo_cleanup.handing_object = 'stale'; },
            r => { r.immediate[0].handing_details = {}; },
        ]) { const bad = copy(r); mutate(bad); assert.throws(() => validateGumuThrowingRecord(bad, c)); }
    }
});

test('缺计量、伪装用户、偷加攻击／毒发／恢复、数值账不闭合均不能通过', () => {
    const c = pick('bingpo-shenzhen', 'low-dodge');
    for (const mutate of [
        r => { r.before[0].wizardp = 1; }, r => { r.before[0].weapon = 'throwing'; },
        r => { r.before[0].handing_details.program = '/tests/throwing'; },
        r => { r.before[0].handing_details.daub.who_id = 'other'; },
        r => { r.metrics[1] = null; }, r => { r.metrics[1].qi_cost = null; },
        r => { r.metrics[1].heartbeats = 1; }, r => { r.metrics[0].direct = 1; },
        r => { r.metrics[0].neili_recovery = 1; }, r => { r.after[1].qi++; },
        r => { r.attacks.push({ actor: 0 }); }, r => { r.needle_hits = []; },
        r => { r.immediate[1].temp.apply.attack = 0; }, r => { r.immediate[0].neili--; },
    ]) { const r = trace(c); mutate(r); assert.throws(() => validateGumuThrowingRecord(r, c)); }
});

test('缺失样本不充当未命中或零耗针，拒绝不混入成功分母', () => {
    const c = pick('bingpo-shenzhen', 'l200-j50');
    const rows = [trace(c, true), trace(c, false), { outcome: 'observed' }].map(raw => ({ outcome: 'observed', raw }));
    rows.push({ outcome: 'refused', raw: trace(pick(c.parameters.skill, 'no-map')) });
    const e = gumuThrowingEffects(rows);
    assert.equal(e.samples, 3); assert.equal(e.unknown_or_unobserved, 1); assert.equal(e.unknown_hit_samples, 1);
    assert.equal(e.hit.rate, 0.5); assert.equal(e.needle_calls.mean, 0.5); assert.equal(e.needle_calls.unknown, 1);
    assert.equal(e.ammunition_cost.mean, 1); assert.equal(e.ammunition_cost.unknown, 1);
    assert.equal(e.neili_cost.mean, 120); assert.equal(e.target_loss.qi.unknown, 1);
    assert.equal(gumuThrowingEffects([{ outcome: 'observed', raw: {} }]).hit.rate, null);
});

test('统一入口追加77条件，旧12323条件不变；所有准备轨迹通过统一校验', () => {
    const all = schoolCombatConditions(catalog);
    const old = all.slice(0, 12323);
    assert.equal(old.length, 12323);
    assert.equal(old.reduce((n, c) => n + c.samples, 0), 326768);
    // Previous registry: the earlier 12225-condition digest plus the unchanged 98 cases.
    assert.equal(digest(old), '81dc23d08cc0b0c6abc567dd54a7f420f8fac8370d2529f46461ab5d800733ef');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-throwing'), cases);
    for (const c of cases) validateSchoolCombatRecord(trace(c), c);
});

test('针具探针只观察原接口入口，去掉后逐字还原游戏源码', () => {
    const source = readFileSync(join(root, 'feature/equip.c'), 'utf8');
    const { changed, sites } = needleHitProbe(source);
    assert.equal(sites.length, 1);
    assert.equal(changed.split('->observe_needle_hit(').length, 2);
    const [{ anchor, insert }] = sites;
    assert.equal(changed.replace(anchor + insert, anchor), source);
    assert.throws(() => needleHitProbe(source + source));
});

test('真实无异常null可接受，但漏测异常状态或清理状态不可通过', () => {
    const c = pick('yufeng-zhen', 'high-dodge'), r = trace(c);
    for (const states of [r.before, r.immediate, r.after])
        for (const s of states) s.conditions = null;
    r.ammo_cleanup.checked = 1; r.ammo_cleanup.object_exists = 1;
    validateGumuThrowingRecord(r, c);
    delete r.immediate[1].conditions;
    assert.throws(() => validateGumuThrowingRecord(r, c));
});
