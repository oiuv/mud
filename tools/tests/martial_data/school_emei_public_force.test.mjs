import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { emeiForces } from './school_emei_cultivation_cases.mjs';
import { emeiPublicForceConditions, validateEmeiPublicForceRecord } from './school_emei_public_force_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan } from './school_combat_report.mjs';
import { publicForceEffects } from './school_public_force_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = emeiPublicForceConditions(catalog);
const pick = suffix => { const c = cases.find(x => x.id === 'school-emei-public-force-' + suffix); assert.ok(c, suffix); return c; };

test('峨嵋公共内功接入正式与冒烟计划、专用校验和冻结输入', () => {
    for (const smoke of [false, true]) {
        const selected = schoolCombatConditions(catalog, { smoke })
            .filter(c => c.parameters.collection_group === 'emei-public-force');
        assert.deepEqual(selected, emeiPublicForceConditions(catalog, { smoke }));
        if (!smoke) validateSchoolCombatPlan(selected, catalog);
        for (const c of selected) validateSchoolCombatRecord(row(c), c);
    }
    const execution = readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8');
    assert.ok(execution.includes("'tools/tests/martial_data/school_emei_public_force_cases.mjs'"));
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.match(runner, /\(\{ "emei-public-force", "gumu-public-force", "mingjiao-public-force" \}\)\) != -1\)\s*result\["not_living"\] = ob->query\("not_living"\)/);
});

test('公共汇总区分受理、拒绝和受理无变化，不混淆两类气血或自损', () => {
    const values = ['emei-xinfa-lifeheal-l200', 'emei-xinfa-dispel-l200-neili299',
        'emei-xinfa-roar-l800', 'emei-xinfa-tianmo-l400'].map(suffix => {
        const raw = row(pick(suffix)); return { outcome: raw.outcome, raw };
    });
    const e = publicForceEffects(values);
    assert.equal(e.attempts, 4); assert.equal(e.command_accepted, 3); assert.equal(e.launched, 3);
    assert.equal(e.accepted_without_measured_change, 1);
    assert.equal(e.flags_after.tianmo, 1);
    assert.equal(e.sides[1].net.qi.mean, 110 / 4);
    assert.equal(e.sides[1].net.eff_qi.mean, 160 / 4);
    assert.equal(e.sides[0].net.qi.mean, -(615 + 700) / 4);
});

// Synthetic values validate collection assertions; no real model or driver samples here.
function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => {
        const skills = structuredClone(cfg.skills), effective_skills = {};
        for (const [key, value] of Object.entries(skills))
            effective_skills[key] = Math.trunc(value / 2) + (skills[cfg.mappings[key]] ?? 0);
        return { ...cfg.properties, userp: 1, interactive: 1, wizardp: 0, skills, effective_skills,
            cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
            mappings: structuredClone(cfg.mappings), preparations: {}, weapon: 'none',
            temp: { apply: { armor: 100 } }, conditions: null, busy: cfg.busy ?? 0 };
    });
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        reason: ['roar', 'shot'].includes(p.ability) ? '你所学的内功中没有这种功能。' : '原入口拒绝',
        launches: [], attacks: [], interfaces: [], metrics: [{}, {}], command_accepted: Number(p.expected === 'observed') };
    const [b, bt] = before, [a, t] = r.immediate;
    if (r.command_accepted) {
        r.launches = [{ skill: 'force' }]; let cost = 0;
        if (p.ability === 'lifeheal') {
            cost = 150;
            t.eff_qi = Math.min(bt.max_qi, bt.eff_qi + 10 + Math.trunc(b.effective_skills.force / 2));
            t.qi = Math.min(t.eff_qi, bt.qi + 10 + Math.trunc(b.effective_skills.force / 3));
        } else if (p.ability === 'dispel') {
            if (p.effect_expected !== 'accepted_no_effect') {
                cost = p.other ? 250 : 100; a.busy = p.other ? 2 : 1;
                if (p.other) t.busy = 1;
            }
        } else if (p.ability === 'power') {
            cost = b.neili; a.temp.apply[p.power_selected] = Math.trunc(b.skills['martial-cognize'] / 5);
            a.temp.power = 1; a.busy = p.fighting ? 3 : 0;
        } else if (p.ability === 'tianmo') {
            cost = b.neili;
            const base = b.skills.force + 215, count = Math.trunc(base / 4);
            for (const [key, delta] of [['qi', 700], ['eff_qi', 200], ['jing', 600], ['eff_jing', 100]]) {
                a[key] -= base + delta; r.metrics[0][key + '_cost'] = base + delta;
            }
            Object.assign(a.temp.apply, { str: b.str, int: b.int, con: b.con, dex: b.dex,
                attack: count, damage: b.str * 3, unarmed_damage: b.str * 3 });
            for (const key of Object.keys(b.mappings)) a.temp.apply[key] = Math.trunc(count / 2);
            a.temp.tianmo = 1; a.busy = p.fighting ? 3 : 0;
        }
        a.neili -= cost; r.metrics[0].neili_cost = cost;
    }
    r.after = structuredClone(r.immediate); return r;
}

test('峨嵋三门映射183条件2718计划记录；105观察与78拒绝条件分列', () => {
    assert.equal(cases.length, 183); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2718);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 105);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 78);
    assert.equal(emeiPublicForceConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 366);
    assert.deepEqual([...new Set(cases.map(c => c.parameters.skill))], emeiForces);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        for (const source of c.parameters.qualification_sources) assert.ok(existsSync(join(root, source)), source);
        assert.equal(c.method, 'exert'); assert.equal(c.parameters.observe_seconds, 0);
        validateEmeiPublicForceRecord(row(c), c);
    }
    assert.throws(() => emeiPublicForceConditions({ skills: [] }));
    assert.throws(() => emeiPublicForceConditions(catalog, { samples: 0 }));
});

test('确认原FORCE继承和公共回退，不借用完整九阳或伪造专属目录', () => {
    const teacher = readFileSync(join(root, 'kungfu/class/emei/miejue.c'), 'utf8');
    for (const force of emeiForces) {
        const source = readFileSync(join(root, 'kungfu/skill/' + force + '.c'), 'utf8');
        assert.match(source, /inherit\s+FORCE\s*;/); assert.ok(teacher.includes(`set_skill("${force}"`));
        const directory = force === 'emei-jiuyang' ? 'jiuyang-sub' : force;
        for (const ability of ['lifeheal', 'dispel', 'power', 'tianmo', 'roar', 'shot'])
            for (const extension of ['c', 'lpc'])
                assert.equal(existsSync(join(root, `kungfu/skill/${directory}/${ability}.${extension}`)), false);
    }
    for (const c of cases) {
        assert.equal(c.parameters.actor.skills['jiuyang-shengong'], undefined);
        assert.equal(c.parameters.actor.properties.gender, '女性');
    }
    const c = pick('emei-jiuyang-lifeheal-l400'), r = row(c);
    r.launches[0].skill = 'emei-jiuyang'; assert.throws(() => validateEmeiPublicForceRecord(r, c));
});

test('不把身份、有效等级、缺少资源账或错误拒绝原因当作有效采集', () => {
    const c = pick('linji-zhuang-power-l200');
    for (const change of [r => { r.before[0].wizardp = 1; }, r => { r.before[1].interactive = 0; },
        r => { r.before[0].effective_skills.force = 200; }, r => { delete r.metrics[1]; },
        r => { r.metrics[0].neili_cost = null; }, r => { r.before[0].gender = '男性'; }]) {
        const bad = row(c); change(bad); assert.throws(() => validateEmeiPublicForceRecord(bad, c));
    }
    const denied = pick('emei-xinfa-roar-l800'), bad = row(denied);
    bad.reason = '目标不存在'; assert.throws(() => validateEmeiPublicForceRecord(bad, denied));
    bad.reason = '你所学的内功中没有这种功能。'; bad.command_accepted = 1;
    assert.throws(() => validateEmeiPublicForceRecord(bad, denied));
});

test('替人疗伤分开当前气血与创伤，保留封顶和原最大内力门槛', () => {
    for (const force of emeiForces) {
        const c = pick(`${force}-lifeheal-l400`), r = row(c);
        assert.equal(r.immediate[1].qi, 5210); assert.equal(r.immediate[1].eff_qi, 5310);
        assert.equal(r.metrics[0].neili_cost, 150);
        const cap = row(pick(`${force}-lifeheal-l200-small-wound`));
        assert.equal(cap.immediate[1].qi, 10000); assert.equal(cap.immediate[1].eff_qi, 10000);
        const low = pick(`${force}-lifeheal-l200-max-neili299`);
        assert.equal(low.parameters.actor.properties.neili, 299); assert.equal(low.parameters.expected, 'refused');
        r.immediate[1].eff_qi++; r.after = structuredClone(r.immediate);
        assert.throws(() => validateEmeiPublicForceRecord(r, c));
    }
});

test('dispel返回受理但无作用与无异常仍扣起手费分别计量', () => {
    for (const suffix of ['neili299', 'other-neili299', 'other-busy', 'other-fighting']) {
        const c = pick('linji-zhuang-dispel-l200-' + suffix), r = row(c);
        assert.equal(r.command_accepted, 1); assert.equal(r.metrics[0].neili_cost, 0);
        validateEmeiPublicForceRecord(r, c);
        r.metrics[0].neili_cost = 100; assert.throws(() => validateEmeiPublicForceRecord(r, c));
    }
    assert.equal(row(pick('linji-zhuang-dispel-l200-minimum')).metrics[0].neili_cost, 100);
    assert.equal(row(pick('linji-zhuang-dispel-l200-other-minimum')).metrics[0].neili_cost, 250);
});

test('功力提升依已映射有效等级选择，同级不替换，耗尽全部当前内力', () => {
    for (const suffix of ['sword-highest', 'sword-tie', 'sword-unmapped']) {
        const c = pick('emei-xinfa-power-l200-' + suffix), r = row(c);
        const selected = suffix === 'sword-highest' ? 'sword' : 'force';
        assert.equal(c.parameters.power_selected, selected);
        assert.deepEqual(r.immediate[0].temp.apply, { armor: 100, [selected]: 40 });
        assert.equal(r.metrics[0].neili_cost, 6000);
        r.immediate[0].temp.apply[selected]++; r.after = structuredClone(r.immediate);
        assert.throws(() => validateEmeiPublicForceRecord(r, c));
    }
});

test('天魔四项自损、全映射增益和原资质或条件，不自动宣称自然解除', () => {
    const c = pick('emei-jiuyang-tianmo-l400-sword-map'), r = row(c);
    assert.equal(r.immediate[0].temp.apply.force, 76); assert.equal(r.immediate[0].temp.apply.sword, 76);
    assert.equal(row(pick('emei-jiuyang-tianmo-l400-extra-neili')).metrics[0].neili_cost, 9000);
    assert.equal(pick('emei-jiuyang-tianmo-l400-str30-con29').parameters.expected, 'observed');
    assert.equal(pick('emei-jiuyang-tianmo-l400-both-attributes29').parameters.expected, 'refused');
    for (const change of [x => { x.immediate[0].temp.apply.sword = 0; },
        x => { x.immediate[0].eff_jing = x.before[0].eff_jing; }, x => { x.metrics[0].qi_cost++; }]) {
        const bad = row(c); change(bad); bad.after = structuredClone(bad.immediate);
        assert.throws(() => validateEmeiPublicForceRecord(bad, c));
    }
    const power = pick('emei-xinfa-power-l200'), altered = row(power); altered.after[0].temp.power = 0;
    assert.throws(() => validateEmeiPublicForceRecord(altered, power));
    assert.ok(!cases.some(c => ['heal', 'inspire', 'xun'].includes(c.parameters.ability)));
});
