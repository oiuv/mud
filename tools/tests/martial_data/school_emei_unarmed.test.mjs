import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { emeiUnarmed, emeiUnarmedConditions, validateEmeiUnarmedRecord, emeiUnarmedEffects } from './school_emei_unarmed_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan, schoolCombatMarkdown, schoolCombatEffects } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = emeiUnarmedConditions(catalog);
const pick = (skill, ability, suffix = '', level = 200) => {
    const c = cases.find(x => x.id === `school-emei-unarmed-${skill}-${ability}-l${level}${suffix}`);
    assert.ok(c); return c;
};

// Synthetic observer events exercise the collector contract, not game behavior.
function raw(c, success = false, control = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000,
        jing: 10000, eff_jing: 10000, neili: 6000, max_neili: 6000, ...cfg.properties,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations ?? {}),
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0)])),
        weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? 0, temp: { apply: {} },
    }));
    const r = { outcome: p.expected, before, immediate: structuredClone(before), metrics: [{}, {}],
        launches: [], attacks: [], dropped: [], reason: '' };
    if (r.outcome === 'refused') {
        r.reason = p.ability === 'zhao' ? '你必须将全身功力尽数提起才能施展此招。' : '此刻不能施展';
        return r;
    }
    if (c.method === 'ordinary') { r.attacks.push({ actor: 0, target: 1, type: 0 }); return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    const [b] = before, [a, t] = r.immediate;
    const direct = Number(success && ['jie', 'bashi', 'xing'].includes(p.ability));
    const cost = { jie: direct ? 200 : 100, bashi: direct ? 100 : 0,
        xing: direct ? 80 : 50, ling: success ? 100 : 30, yun: 100 }[p.ability];
    r.metrics[0].direct = direct; r.metrics[0].neili_cost = cost; a.neili -= cost;
    a.busy = { jie: direct ? 3 : 4, bashi: direct ? 2 : 3, xing: direct ? 2 : 3,
        ling: success ? 0 : 3, yun: 2 }[p.ability];
    if (p.ability === 'yun') r.attacks = Array.from({ length: 3 }, () => ({ actor: 0, target: 1, type: 0 }));
    if (p.ability === 'ling' && success) t.busy = Math.trunc(b.skills[p.skill] / 22) + 2;
    if (p.ability === 'xing' && direct && control && !t.busy)
        t.busy = Math.trunc(b.effective_skills.strike / 60) + 1;
    if (direct) {
        let qi = 100, wound = 10;
        if (p.ability === 'jie') {
            const jing = Math.trunc(b.skills[p.skill] / 2);
            t.jing -= jing; t.eff_jing -= jing;
            r.metrics[1].jing_cost = jing; r.metrics[1].eff_jing_cost = jing;
            qi += Math.trunc(jing * 3 / 2); wound += Math.trunc(jing * 3 / 2); t.busy = 1;
        }
        t.qi -= qi; t.eff_qi -= wound;
        r.metrics[1].qi_cost = qi; r.metrics[1].eff_qi_cost = wound;
    }
    return r;
}

test('峨嵋徒手五门六入口，105条件3150计划记录；佛光普照仅未强化拒绝', () => {
    assert.equal(emeiUnarmed.length, 5); assert.equal(cases.length, 105);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3150);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id), c.entry_id);
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        const p = c.parameters;
        assert.equal(p.actor.properties.gender, '女性');
        assert.equal(p.actor.properties['family/family_name'], '峨嵋派');
        assert.equal(p.actor.properties.jiali, 0); assert.ok(!p.actor.temp);
        assert.ok(p.actor.properties.neili <= p.actor.properties.max_neili);
        const certain = c.id.endsWith('-low-defense') && p.ability !== 'bashi';
        validateEmeiUnarmedRecord(raw(c, certain), c);
    }
    assert.equal(emeiUnarmedConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 210);
    assert.throws(() => emeiUnarmedConditions({ skills: [] }));
    assert.throws(() => emeiUnarmedConditions(catalog, { samples: 0 }));
});

test('峨嵋徒手接入原注册和报告，拒绝与复合损伤不能混算', () => {
    const registered = schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'emei-unarmed');
    assert.deepEqual(registered, cases);
    validateSchoolCombatPlan(registered, catalog);
    assert.throws(() => validateSchoolCombatPlan(emeiUnarmedConditions(catalog, { smoke: true }), catalog));
    for (const c of registered) {
        const hit = c.id.endsWith('-low-defense') && c.parameters.ability !== 'bashi';
        validateSchoolCombatRecord(raw(c, hit), c);
    }
    const c = pick('jieshou-jiushi', 'jie'), r = raw(c, true);
    assert.throws(() => validateSchoolCombatRecord({ ...r, metrics: null }, c));
    const rows = [{ outcome: 'observed', raw: r }];
    const text = schoolCombatMarkdown({ fingerprint: 'test', evidence_sha256: 'test',
        totals: { conditions: 1, samples: 1, observed: 1, refused: 0, errors: 0 },
        conditions: [{ id: c.id, parameters: c.parameters, counts: { observed: 1, refused: 0 },
            emei_unarmed: emeiUnarmedEffects(rows), effects: schoolCombatEffects(rows),
            sides: [{ metrics: { neili_cost: { mean: 200 } } },
                { metrics: { qi_cost: { mean: 250 }, eff_qi_cost: { mean: 160 } } }],
            recorded: 1, planned: 1 }] });
    assert.match(text, /峨嵋徒手：复合损伤、控制与普通连击/);
    assert.match(text, /250.00\/160.00/); assert.match(text, /100.00\/100.00/);
});

test('原始等级、有效内功和最大内力分开验证，阈值上下不预写效果', () => {
    for (const d of emeiUnarmed) {
        for (const [suffix, offset] of [['-low-skill', -1], ['-minimum-skill', 0]])
            assert.equal(pick(d.skill, d.ability, suffix).parameters.actor.skills[d.skill], d.minimum + offset);
        for (const [suffix, offset] of [['-low-neili', -1], ['-minimum-neili', 0]])
            assert.equal(pick(d.skill, d.ability, suffix).parameters.actor.properties.neili, d.neili + offset);
        if (d.force) for (const suffix of ['-low-force', '-minimum-force']) {
            const c = pick(d.skill, d.ability, suffix), r = raw(c);
            validateEmeiUnarmedRecord(r, c);
            r.before[0].effective_skills.force++; assert.throws(() => validateEmeiUnarmedRecord(r, c));
        } else assert.equal(pick(d.skill, d.ability, '-no-force-threshold').parameters.expected, 'observed');
        if (d.maxNeili) for (const [suffix, offset] of [['-low-max-neili', -1], ['-minimum-max-neili', 0]]) {
            const c = pick(d.skill, d.ability, suffix);
            assert.equal(c.parameters.actor.properties.max_neili, d.maxNeili + offset);
            assert.equal(c.parameters.expected, offset ? 'refused' : 'observed');
            validateEmeiUnarmedRecord(raw(c), c);
        }
    }
});

test('凌空指穴不额外要求空手或准备；控制成功不伪造伤害或自身忙乱', () => {
    for (const suffix of ['', '-weapon', '-unprepared', '-minimum-skill']) {
        const c = pick('tiangang-zhi', 'ling', suffix);
        for (const success of [false, true]) validateEmeiUnarmedRecord(raw(c, success), c);
    }
    const low = pick('tiangang-zhi', 'ling', '-low-defense');
    validateEmeiUnarmedRecord(raw(low, true), low);
    assert.throws(() => validateEmeiUnarmedRecord(raw(low), low));
    const high = pick('tiangang-zhi', 'ling', '-high-defense');
    validateEmeiUnarmedRecord(raw(high), high);
    assert.throws(() => validateEmeiUnarmedRecord(raw(high, true), high));
    const c = pick('tiangang-zhi', 'ling');
    for (const change of [x => { x.immediate[1].qi--; }, x => { x.metrics[0].direct = 1; },
        x => { x.immediate[0].busy = 1; }, x => { x.immediate[1].busy++; }]) {
        const r = raw(c, true); change(r); assert.throws(() => validateEmeiUnarmedRecord(r, c));
    }
    assert.equal(pick('tiangang-zhi', 'ling', '-target-busy').parameters.expected, 'refused');
});

test('截筋断脉同时记录精神、创伤与气血，不把直伤次数当全部损失', () => {
    const c = pick('jieshou-jiushi', 'jie');
    for (const success of [false, true]) validateEmeiUnarmedRecord(raw(c, success), c);
    for (const change of [x => { x.immediate[1].jing++; }, x => { x.metrics[1].eff_jing_cost = 0; },
        x => { x.metrics[1].qi_cost = 0; }, x => { x.immediate[1].busy = 0; }]) {
        const r = raw(c, true); change(r); assert.throws(() => validateEmeiUnarmedRecord(r, c));
    }
    const low = pick('jieshou-jiushi', 'jie', '-low-defense');
    validateEmeiUnarmedRecord(raw(low, true), low);
    assert.throws(() => validateEmeiUnarmedRecord(raw(low), low));
});

test('八式合一落空零扣费，星罗棋布命中与控制分开且不覆盖已有忙乱', () => {
    const bashi = pick('jinding-zhang', 'bashi');
    for (const success of [false, true]) validateEmeiUnarmedRecord(raw(bashi, success), bashi);
    assert.equal(raw(bashi).metrics[0].neili_cost, 0);
    const low = pick('jinding-zhang', 'bashi', '-low-defense');
    for (const success of [false, true]) validateEmeiUnarmedRecord(raw(low, success), low);
    for (const suffix of ['', '-target-busy']) {
        const c = pick('sixiang-zhang', 'xing', suffix);
        for (const success of [false, true]) for (const control of [false, true])
            validateEmeiUnarmedRecord(raw(c, success, control), c);
    }
    const c = pick('sixiang-zhang', 'xing', '-target-busy'), r = raw(c, true);
    r.immediate[1].busy = 0; assert.throws(() => validateEmeiUnarmedRecord(r, c));
});

test('云海明灯只计三次普通攻击，临时攻击加成须恢复', () => {
    const c = pick('piaoxue-zhang', 'yun');
    for (const busy of [2, 3, 4]) { const r = raw(c); r.immediate[0].busy = busy; validateEmeiUnarmedRecord(r, c); }
    for (const change of [x => { x.attacks.pop(); }, x => { x.attacks[0].type = 1; },
        x => { x.metrics[0].direct = 1; }, x => { x.immediate[0].temp.apply.attack = 180; }]) {
        const r = raw(c); change(r); assert.throws(() => validateEmeiUnarmedRecord(r, c));
    }
});

test('佛光普照未强化三档拒绝不等于已测试完整绝招或九阳分支', () => {
    const all = cases.filter(c => c.parameters.ability === 'zhao');
    assert.equal(all.length, 3);
    for (const c of all) {
        assert.equal(c.samples, 2); assert.equal(c.parameters.expected, 'refused');
        const r = raw(c); validateEmeiUnarmedRecord(r, c);
        for (const change of [x => { x.before[0].temp.powerup = 1; },
            x => { x.reason = '内力不足'; }, x => { x.before[0].effective_skills.force = 299; }]) {
            const bad = structuredClone(r); change(bad); assert.throws(() => validateEmeiUnarmedRecord(bad, c));
        }
    }
});

test('空闲busy的null编码计零，缺失或非数值观察仍未知，不能只对成功控制求均值', () => {
    const c = pick('tiangang-zhi', 'ling'), idle = raw(c), controlled = raw(c, true);
    idle.before[1].busy = null; idle.immediate[1].busy = null;
    const missing = structuredClone(idle), invalid = structuredClone(idle);
    delete missing.before[1].busy; delete missing.immediate[1].busy;
    invalid.before[1].busy = 'function'; invalid.immediate[1].busy = {};
    const e = emeiUnarmedEffects([idle, controlled, missing, invalid].map(raw => ({ outcome: 'observed', raw })));
    assert.equal(e.target_busy_before.n, 2); assert.equal(e.target_busy_before.unknown, 2);
    assert.equal(e.target_busy_before.mean, 0);
    assert.equal(e.target_busy_after.n, 2); assert.equal(e.target_busy_after.unknown, 2);
    assert.equal(e.target_busy_after.mean, 5.5);
});

test('拒绝和未知计数不混为已发动或零损失，身份及状态被篡改须失败', () => {
    const c = pick('jinding-zhang', 'bashi', '-no-grant'), r = raw(c);
    for (const change of [x => { x.before[0].wizardp = 1; }, x => { x.metrics[0] = null; },
        x => { x.metrics[0].direct = null; }, x => { x.immediate[1].neili--; },
        x => { x.launches.push({ skill: 'jinding-zhang', argument: 'bashi' }); },
        x => { x.attacks.push({ actor: 0, target: 1, type: 0 }); }]) {
        const bad = structuredClone(r); change(bad); assert.throws(() => validateEmeiUnarmedRecord(bad, c));
    }
    const good = raw(pick('jieshou-jiushi', 'jie'), true), unknown = structuredClone(good);
    delete unknown.metrics; delete unknown.attacks; delete unknown.before[1].qi;
    const e = emeiUnarmedEffects([{ outcome: 'observed', raw: good }, { outcome: 'observed', raw: unknown },
        { outcome: 'refused', raw: r }, { outcome: 'error', raw: {} }]);
    assert.equal(e.samples, 2); assert.equal(e.unknown_or_unobserved, 2);
    assert.equal(e.direct_calls.mean, 1); assert.equal(e.direct_calls.unknown, 1);
    assert.equal(e.regular_attacks.unknown, 1); assert.equal(e.target_loss.qi.unknown, 1);
    assert.equal(e.target_loss.qi.mean, 250); assert.equal(e.target_loss.eff_qi.mean, 160);
    assert.equal(e.target_loss.jing.mean, 100); assert.equal(e.target_loss.eff_jing.mean, 100);
    assert.equal(emeiUnarmedEffects([]).target_loss.qi.mean, null);
});
