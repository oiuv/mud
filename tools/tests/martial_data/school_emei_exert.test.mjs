import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan } from './school_combat_report.mjs';
import { emeiExertConditions, emeiZhaoConditions, emeiPowerupBonus,
    validateEmeiExertRecord, validateEmeiZhaoRecord, emeiExertEffects } from './school_emei_exert_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const exert = emeiExertConditions(catalog), zhao = emeiZhaoConditions(catalog);
const pick = (cases, suffix) => {
    const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c;
};

// Synthetic rows test only the collector. Original command/driver evidence remains pending.
function state(cfg) {
    const temp = { apply: {} };
    for (const [key, value] of Object.entries(cfg.temp ?? {})) {
        if (key.startsWith('apply/')) temp.apply[key.slice(6)] = value;
        else temp[key] = value;
    }
    return { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
        max_jing: 10000, neili: 6000, max_neili: 6000, con: 36, ...cfg.properties,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), userp: 1, interactive: 1, wizardp: 0,
        busy: cfg.busy ?? 0, weapon: cfg.equipment?.type ?? 'none', temp,
        cultivation: { sex: cfg.properties.sex ?? null,
            'family/family_name': cfg.properties['family/family_name'] ?? null },
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, n]) =>
            [key, Math.trunc(n / 2) + (cfg.skills[cfg.mappings[key]] ?? 0)])) };
}

function powerup(s, success, fighting) {
    const a = structuredClone(s);
    if (success) {
        a.neili -= 100; a.temp.powerup = 1; a.busy = fighting ? 2 : 0;
        for (const [key, value] of Object.entries(emeiPowerupBonus(s))) a.temp.apply[key] = (a.temp.apply[key] ?? 0) + value;
    }
    return a;
}

function row(c, hit) {
    const p = c.parameters, before = [state(p.actor), state(p.target)];
    const success = p.expected === 'observed', sequence = p.collection_group === 'emei-zhao';
    const ready = sequence ? p.powerup_expected === 'observed' : success;
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        command_accepted: Number(success), metrics: [{}, {}], launches: [], callbacks: [],
        attacks: [], interfaces: [], reason: success ? '' : '原命令拒绝', elapsed: 0 };
    const next = powerup(before[0], ready, sequence ? false : p.fighting);
    r.immediate[0] = next;
    if (ready) r.launches.push({ skill: 'linji-zhuang', argument: 'powerup' });
    if (p.repeat_actions) {
        r.repeat_steps = p.repeat_actions.map((action, i) => ({ action,
            before: structuredClone(i ? next : before[0]), after: structuredClone(next),
            accepted: Number(!i), launches_before: i ? 1 : 0, launches_after: 1,
            refusals_before: 0, refusals_after: Number(i > 0), reason: i ? '正在运功中' : '' }));
    }
    if (sequence) {
        r.powerup = { action: 'exert powerup', before: structuredClone(before),
            after: structuredClone(r.immediate), accepted: Number(ready),
            launches_before: 0, launches_after: Number(ready), reason: ready ? '' : '原运功拒绝' };
        r.action_attempted = Number(ready);
        if (success) {
            const target = before[1], immune = target.mappings.force === 'jiuyang-shengong';
            const ap = next.effective_skills.strike + next.effective_skills.force + next.str * 5;
            const dp = target.effective_skills.dodge + target.effective_skills.force + target.con * 5;
            const direct = Number(!immune && (hit ?? (Math.trunc(ap / 2) > dp)));
            r.launches.push({ skill: 'piaoxue-zhang', argument: 'zhao' });
            next.neili -= immune || direct ? 600 : 400; next.busy = immune || direct ? 3 : 4;
            r.metrics[0].direct = direct;
            if (direct) {
                r.immediate[1].qi -= 100; r.immediate[1].eff_qi -= 100;
                r.metrics[1] = { qi_cost: 100, eff_qi_cost: 100 };
            }
        }
    }
    r.metrics[0].neili_cost = before[0].neili - next.neili;
    r.after = structuredClone(r.immediate);
    if (p.observe_seconds) {
        const end = r.after[0]; delete end.temp.powerup;
        for (const key of ['attack', 'dodge', 'damage']) end.temp.apply[key] = before[0].temp.apply[key] ?? 0;
        r.elapsed = p.observe_seconds;
        r.callbacks = [{ side: 0, phase: 'before', elapsed: before[0].skills['linji-zhuang'], state: structuredClone(next) },
            { side: 0, phase: 'after', elapsed: before[0].skills['linji-zhuang'] + 0.1, state: structuredClone(end) }];
    }
    return r;
}

test('临济强化32条件652条、原强化后佛光35条件658条，真实记录独立验证', () => {
    assert.equal(exert.length, 32); assert.equal(exert.reduce((n, c) => n + c.samples, 0), 652);
    assert.equal(zhao.length, 35); assert.equal(zhao.reduce((n, c) => n + c.samples, 0), 658);
    assert.equal(exert.filter(c => c.parameters.expected === 'refused').length, 6);
    assert.equal(zhao.filter(c => c.parameters.expected === 'refused').length, 14);
    assert.equal(emeiExertConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 38);
    assert.equal(emeiZhaoConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 70);
    const all = [...exert, ...zhao]; assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of all) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        assert.ok(c.parameters.actor.properties.neili <= c.parameters.actor.properties.max_neili);
        if (c.parameters.collection_group === 'emei-zhao') {
            assert.ok(!c.parameters.actor.temp?.powerup); assert.equal(c.parameters.powerup_before_combat, true);
            validateEmeiZhaoRecord(row(c), c);
        } else validateEmeiExertRecord(row(c), c);
    }
    assert.throws(() => emeiExertConditions({ skills: [] }));
    assert.throws(() => emeiZhaoConditions(catalog, { samples: 0 }));
});

test('强化与佛光接入原门派采集和校验，不改变独立条件及烟雾参数', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke });
        for (const [group, expected, validate] of [
            ['emei-exert', emeiExertConditions(catalog, { smoke }), validateEmeiExertRecord],
            ['emei-zhao', emeiZhaoConditions(catalog, { smoke }), validateEmeiZhaoRecord],
        ]) {
            const selected = all.filter(c => c.parameters.collection_group === group);
            assert.deepEqual(selected, expected);
            if (!smoke) validateSchoolCombatPlan(selected, catalog);
            for (const c of selected) { const r = row(c); validate(r, c); validateSchoolCombatRecord(r, c); }
        }
    }
});

test('临济攻击/闪避、伤害封顶和大乘加成独立；sex不是gender', () => {
    for (const [level, attack, damage] of [[200, 66, 120], [400, 133, 140], [800, 266, 180]]) {
        const c = pick(exert, 'l' + level), r = row(c);
        assert.deepEqual(emeiPowerupBonus(r.before[0]), { attack, dodge: attack, damage });
        assert.equal(emeiPowerupBonus(row(pick(exert, 'l' + level + '-sex')).before[0]).damage, level / 10);
    }
    for (const [suffix, damage] of [['l199-cap-boundary', 118], ['l200-cap-boundary', 120],
        ['l201-cap-boundary', 120], ['l1-cap-boundary', 0], ['l200-mahayana-0', 100],
        ['l200-mahayana-9', 100], ['l200-mahayana-10', 101]]) {
        assert.equal(emeiPowerupBonus(row(pick(exert, suffix)).before[0]).damage, damage);
    }
    for (const suffix of ['l200-male', 'l200-eunuch', 'l200-other-family']) {
        const c = pick(exert, suffix); assert.equal(c.parameters.expected, 'observed');
        validateEmeiExertRecord(row(c), c);
    }
});

test('强化原100内力门槛和重复拒绝，战斗忙乱必须在1至3', () => {
    const min = pick(exert, 'l200-minimum-neili'), r = row(min);
    assert.equal(r.immediate[0].neili, 0); validateEmeiExertRecord(r, min);
    const repeated = pick(exert, 'l200-repeat'), rr = row(repeated);
    assert.deepEqual(rr.repeat_steps.map(s => s.accepted), [1, 0]);
    assert.equal(rr.metrics[0].neili_cost, 100); validateEmeiExertRecord(rr, repeated);
    rr.repeat_steps[1].accepted = 1; assert.throws(() => validateEmeiExertRecord(rr, repeated));
    const c = pick(exert, 'l400-fighting');
    for (const busy of [1, 2, 3]) {
        const x = row(c); x.immediate[0].busy = busy; x.after[0].busy = busy; validateEmeiExertRecord(x, c);
    }
    for (const busy of [0, 4]) {
        const x = row(c); x.immediate[0].busy = busy; assert.throws(() => validateEmeiExertRecord(x, c));
    }
});

test('自然50秒回调保留原三项属性，不以预写解除或即时样本证明到期', () => {
    const timed = [...exert, ...zhao].filter(c => c.parameters.observe_seconds);
    assert.equal(timed.length, 4);
    for (const c of timed) {
        const validate = c.parameters.collection_group === 'emei-exert' ? validateEmeiExertRecord : validateEmeiZhaoRecord;
        const r = row(c); assert.equal(c.parameters.observe_seconds, 52); validate(r, c);
        assert.deepEqual(r.after[0].temp.apply, { attack: 7, dodge: 11, damage: 13 });
        for (const mutate of [x => { x.callbacks = []; }, x => { x.callbacks[0].elapsed = 1; },
            x => { x.after[0].temp.powerup = 1; }, x => { x.after[0].temp.apply.damage = 0; },
            x => { x.callbacks[1].state.neili++; }]) {
            const x = structuredClone(r); mutate(x); assert.throws(() => validate(x, c));
        }
    }
});

test('佛光原前置消耗100，不补给；总费用与绝招费用分别统计', () => {
    const c = pick(zhao, 'l200'), r = row(c, false);
    validateEmeiZhaoRecord(r, c);
    const e = emeiExertEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(e.prelude_cost.mean, 100); assert.equal(e.action_cost.mean, 400); assert.equal(e.total_cost.mean, 500);
    const hit = row(c, true); validateEmeiZhaoRecord(hit, c);
    assert.equal(emeiExertEffects([{ outcome: 'observed', raw: hit }]).total_cost.mean, 700);
    const min = pick(zhao, 'l200-minimum-neili'), mr = row(min);
    assert.equal(mr.before[0].neili, 1100); assert.equal(mr.powerup.after[0].neili, 1000);
    validateEmeiZhaoRecord(mr, min);
    for (const mutate of [x => { x.powerup.after[0].neili += 100; }, x => { x.metrics[0].neili_cost -= 100; },
        x => { x.powerup.action = 'set powerup'; }, x => { x.launches.shift(); }]) {
        const x = row(c); mutate(x); assert.throws(() => validateEmeiZhaoRecord(x, c));
    }
});

test('前置成功后绝招拒绝仍记录费用，前置失败不伪造后续施展', () => {
    for (const c of zhao.filter(c => c.parameters.expected === 'refused')) {
        const r = row(c), ready = c.parameters.powerup_expected === 'observed';
        validateEmeiZhaoRecord(r, c);
        assert.equal(r.action_attempted, Number(ready)); assert.equal(r.command_accepted, 0);
        assert.equal(r.metrics[0].neili_cost, ready ? 100 : 0);
        assert.equal(emeiExertEffects([{ outcome: 'refused', raw: r }]).action_cost.mean, 0);
        if (!ready) {
            const missing = structuredClone(r); missing.powerup.reason = '';
            assert.throws(() => validateEmeiZhaoRecord(missing, c));
        }
        r.outcome = 'observed'; assert.throws(() => validateEmeiZhaoRecord(r, c));
    }
    const c = pick(zhao, 'l200-powerup-minimum-neili'), r = row(c);
    assert.equal(r.powerup.after[0].neili, 0); assert.equal(r.launches.length, 1);
});

test('九阳目标只走原消耗600与忙3分支，无直伤；极端对照不强制随机', () => {
    for (const level of [200, 400, 800]) {
        const c = pick(zhao, 'l' + level + '-jiuyang-target'), r = row(c);
        validateEmeiZhaoRecord(r, c); assert.equal(r.metrics[0].direct, 0);
        assert.equal(r.metrics[0].neili_cost, 700); assert.equal(r.immediate[0].busy, 3);
        assert.deepEqual(r.before[1], r.immediate[1]);
        r.metrics[0].direct = 1; assert.throws(() => validateEmeiZhaoRecord(r, c));
        for (const [suffix, hit] of [['-low-defense', true], ['-high-defense', false]]) {
            const d = pick(zhao, 'l' + level + suffix); validateEmeiZhaoRecord(row(d, hit), d);
            assert.throws(() => validateEmeiZhaoRecord(row(d, !hit), d));
        }
    }
});

test('缺失快照/未知计数不能变零，篡改身份/费用/标记须失败', () => {
    for (const [c, validate] of [[pick(exert, 'l200'), validateEmeiExertRecord], [pick(zhao, 'l200'), validateEmeiZhaoRecord]]) {
        for (const mutate of [x => { x.before[0].wizardp = 1; }, x => { x.before[0].interactive = 0; },
            x => { x.metrics[0] = null; }, x => { x.metrics[0].neili_cost = null; },
            x => { delete x.before[0].cultivation.sex; }, x => { x.immediate[0].temp.apply.dodge++; },
            x => { x.immediate[1].neili--; }, x => { x.after[0].neili++; }]) {
            const x = row(c); mutate(x); assert.throws(() => validate(x, c));
        }
    }
    const c = pick(zhao, 'l200'), r = row(c), unknown = structuredClone(r);
    delete unknown.before; delete unknown.immediate; delete unknown.powerup;
    const e = emeiExertEffects([{ outcome: 'observed', raw: r }, { outcome: 'observed', raw: unknown },
        { outcome: 'error', raw: {} }]);
    assert.equal(e.total_cost.mean, 500); assert.equal(e.total_cost.unknown, 1);
    assert.equal(e.apply.attack.unknown, 1); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(emeiExertEffects([]).total_cost.mean, null);
});
