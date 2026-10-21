import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateExpectedOutcomes, validateRecord } from './execution.mjs';
import { schoolCombatEffects, schoolCombatMarkdown } from './school_combat_report.mjs';
import { publicForceEffects } from './school_public_force_report.mjs';
import { gumuPublicForceConditions, validateGumuPublicForceRecord, gumuPublicForceFixtureRequirements } from './school_gumu_public_force_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuPublicForceConditions(catalog);
const pick = suffix => { const c = cases.find(c => c.id === 'school-gumu-public-force-' + suffix); assert.ok(c, suffix); return c; };

// Synthetic contract tests only; they neither start a driver nor enter a sample ledger.
function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, side) => {
        const skills = structuredClone(cfg.skills), effective_skills = {};
        for (const [key, value] of Object.entries(skills)) effective_skills[key] = Math.trunc(value / 2) + (skills[cfg.mappings[key]] ?? 0);
        return { ...cfg.properties, object: '/tests/actor#' + side, id: side ? 'right' : 'left',
            skills, effective_skills, learned: {}, userp: 1, playerp: 1, interactive: 1, wizardp: 0,
            cultivation: { 'family/family_name': cfg.properties['family/family_name'], character: cfg.properties.character },
            mappings: structuredClone(cfg.mappings), preparations: {}, weapon: 'none',
            temp: { apply: { armor: 100 } }, conditions: null, busy: cfg.busy ?? null,
            not_living: cfg.properties.not_living ?? null };
    });
    const r = { method: 'exert', elapsed: 0.01, before, immediate: structuredClone(before), outcome: p.expected,
        reason: ['roar', 'shot'].includes(p.ability) ? '你所学的内功中没有这种功能。' : '原入口拒绝',
        launches: [], attacks: [], interfaces: [], callbacks: [], terminals: [], metrics: [{}, {}],
        command_accepted: Number(p.expected === 'observed') };
    const [b, bt] = before, [a, t] = r.immediate;
    if (r.command_accepted) {
        r.launches = [{ actor: b.object, skill: 'force', argument: p.action.slice(6) }]; let cost = 0;
        a.learned.force = 1; r.metrics[0].ability_launched = 1;
        if (p.ability === 'lifeheal') {
            cost = 150; t.eff_qi = Math.min(bt.max_qi, bt.eff_qi + 10 + Math.trunc(b.effective_skills.force / 2));
            t.qi = Math.min(t.eff_qi, bt.qi + 10 + Math.trunc(b.effective_skills.force / 3));
            r.metrics[1].qi_recovery = 10 + Math.trunc(b.effective_skills.force / 3);
            r.metrics[1].qi_cost = Math.max(0, bt.qi + r.metrics[1].qi_recovery - t.eff_qi);
            r.metrics[1].eff_qi_recovery = t.eff_qi - bt.eff_qi;
        } else if (p.ability === 'dispel') {
            if (p.effect_expected !== 'accepted_no_effect') {
                cost = p.other ? 250 : 100; a.busy = p.other ? 2 : 1;
                if (p.other) t.busy = 1;
            }
        } else if (p.ability === 'power') {
            cost = b.neili; a.temp.apply[p.power_selected] = Math.trunc(b.skills['martial-cognize'] / 5);
            a.temp.power = 1; a.busy = p.fighting ? 3 : null;
        } else if (p.ability === 'tianmo') {
            cost = b.neili; const base = b.skills.force + 215, count = Math.trunc(base / 4);
            for (const [key, extra] of [['qi', 700], ['eff_qi', 200], ['jing', 600], ['eff_jing', 100]]) {
                a[key] -= base + extra; r.metrics[0][key + '_cost'] = base + extra;
            }
            Object.assign(a.temp.apply, { str: b.str, int: b.int, con: b.con, dex: b.dex,
                attack: count, damage: b.str * 3, unarmed_damage: b.str * 3 });
            for (const key of Object.keys(b.mappings)) a.temp.apply[key] = Math.trunc(count / 2);
            a.temp.tianmo = 1; a.busy = p.fighting ? 3 : null;
        }
        a.neili -= cost; r.metrics[0].neili_cost = cost;
    }
    for (const state of r.immediate)
        for (const [key, value] of Object.entries(state.skills))
            state.effective_skills[key] = Math.trunc(value / 2) + (state.skills[state.mappings[key]] ?? 0)
                + (state.temp.apply[key] ?? 0);
    r.after = structuredClone(r.immediate); return r;
}

test('182条件2716计划注册新系列，烟雾同参数，旧13896条件完整指纹不变', () => {
    const smoke = gumuPublicForceConditions(catalog, { smoke: true });
    const all = schoolCombatConditions(catalog).slice(0, 14078);
    const registered = new Set(all.map(c => c.id)), old = all.filter(c => !['gumu-public-force', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(cases.length, 182); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2716);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 364);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 105);
    const sha = values => createHash('sha256').update(JSON.stringify(values)).digest('hex');
    assert.equal(sha(cases), 'eb7c3f66499a671173872800c342450889f0080ed652451dafc8b914f6dc2cd7');
    assert.equal(sha(smoke), 'fea8f6e07f137506a049620256f0c7f9fbf52761a5075c1995d48f3b74e276c4');
    assert.equal(old.length, 13896); assert.equal(old.reduce((n, c) => n + c.samples, 0), 383030);
    assert.equal(sha(old), 'b2155583c6940946fe76632fc1eb307a416157f342371e94892ff5ab94a3890a');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-public-force'), cases);
    assert.equal(all.length, 14078); assert.equal(all.reduce((n, c) => n + c.samples, 0), 385746);
    assert.equal(registered.size, all.length); validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    assert.equal(new Set(cases.map(c => c.id)).size, 182); assert.equal(gumuPublicForceFixtureRequirements.length, 3);
    for (const [i, c] of cases.entries()) {
        assert.deepEqual(c.parameters, smoke[i].parameters); assert.ok(registered.has(c.id));
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        const raw = { kind: 'sample', condition_id: c.id, ...row(c) };
        validateSchoolCombatRecord(raw, c); validateRecord(raw, c);
    }
    assert.throws(() => gumuPublicForceConditions(catalog, { samples: 0 }));
    assert.throws(() => gumuPublicForceConditions({ skills: [] }));
});

test('怒海roar不进入公共拒绝组；其余公共回退保持真实归属', () => {
    assert.ok(!cases.some(c => c.parameters.skill === 'surge-force' && c.parameters.ability === 'roar'));
    for (const force of ['suxin-jue', 'yunv-xinjing', 'surge-force']) {
        assert.match(readFileSync(join(root, `kungfu/skill/${force}.c`), 'utf8'), /inherit\s+FORCE\s*;/);
        for (const ability of ['lifeheal', 'dispel', 'power', 'tianmo', 'shot'])
            for (const extension of ['c', 'lpc']) assert.equal(existsSync(join(root, `kungfu/skill/${force}/${ability}.${extension}`)), false);
        assert.equal(pick(`${force}-shot-l800`).parameters.expected, 'refused');
    }
    assert.ok(existsSync(join(root, 'kungfu/skill/surge-force/roar.c')));
    const c = pick('surge-force-lifeheal-l200'), r = row(c); r.launches[0].skill = 'surge-force';
    assert.throws(() => validateGumuPublicForceRecord(r, c));
});

test('替人疗伤区分当前和有效气血，200/400/800三档及封顶不相加', () => {
    for (const force of ['suxin-jue', 'yunv-xinjing', 'surge-force']) {
        for (const [level, qi, eff] of [[200, 5110, 5160], [400, 5210, 5310], [800, 5410, 5610]]) {
            const r = row(pick(`${force}-lifeheal-l${level}`));
            assert.equal(r.immediate[1].qi, qi); assert.equal(r.immediate[1].eff_qi, eff); assert.equal(r.metrics[0].neili_cost, 150);
        }
        const cap = row(pick(`${force}-lifeheal-l200-small-wound`)); assert.equal(cap.immediate[1].qi, 10000);
        assert.equal(cap.immediate[1].eff_qi, 10000);
        assert.equal(pick(`${force}-lifeheal-l200-max-neili299`).parameters.actor.properties.neili, 299);
        assert.equal(pick(`${force}-lifeheal-l200-target-busy`).parameters.expected, 'observed');
        assert.equal(pick(`${force}-lifeheal-l200-severe`).parameters.expected, 'refused');
    }
});

test('疗伤封顶保留先加后截的110/109事件，净恢复1且拒绝额外抵消', () => {
    for (const force of ['suxin-jue', 'yunv-xinjing', 'surge-force']) {
        const c = pick(`${force}-lifeheal-l200-small-wound`), r = row(c);
        validateGumuPublicForceRecord(r, c);
        validateRecord({ kind: 'sample', condition_id: c.id, ...r }, c);
        assert.equal(r.metrics[1].qi_recovery, 110);
        assert.equal(r.metrics[1].qi_cost, 109);
        assert.equal(r.after[1].qi - r.before[1].qi, 1);
        const stats = publicForceEffects([{ outcome: r.outcome, raw: r }]);
        assert.equal(stats.sides[1].net.qi.mean, 1);
        assert.equal(stats.sides[1].recovery.qi.mean, 110);
        assert.equal(stats.sides[1].cost.qi.mean, 109);
        for (const mutate of [bad => { bad.metrics[1].qi_recovery = 1; bad.metrics[1].qi_cost = 0; },
            bad => { bad.metrics[1].qi_recovery++; bad.metrics[1].qi_cost++; },
            bad => delete bad.metrics[1].qi_cost, bad => bad.metrics[1].qi_recovery--]) {
            const bad = structuredClone(r); mutate(bad);
            assert.throws(() => validateGumuPublicForceRecord(bad, c));
        }
    }
});

test('无异常起手费与dispel受理无变化分开，不把返回1作为驱毒成功', () => {
    for (const suffix of ['neili299', 'other-neili299', 'other-busy', 'other-fighting']) {
        const r = row(pick('suxin-jue-dispel-l200-' + suffix));
        assert.equal(r.command_accepted, 1); assert.equal(r.metrics[0].neili_cost, 0);
    }
    assert.equal(row(pick('suxin-jue-dispel-l200-minimum')).metrics[0].neili_cost, 100);
    assert.equal(row(pick('suxin-jue-dispel-l200-other-minimum')).metrics[0].neili_cost, 250);
    const stats = publicForceEffects([pick('suxin-jue-dispel-l200-neili299'), pick('suxin-jue-dispel-l200-minimum')]
        .map(c => ({ outcome: c.parameters.expected, raw: row(c) })));
    assert.equal(stats.command_accepted, 2); assert.equal(stats.accepted_without_measured_change, 1);
});

test('power选已映射最高有效技能，同级保留内功，耗尽当前内力而非只扣100', () => {
    for (const suffix of ['sword-highest', 'sword-tie', 'sword-unmapped']) {
        const c = pick('yunv-xinjing-power-l200-' + suffix), r = row(c), selected = suffix === 'sword-highest' ? 'sword' : 'force';
        assert.equal(c.parameters.power_selected, selected); assert.equal(r.metrics[0].neili_cost, 6000);
        assert.deepEqual(r.immediate[0].temp.apply, { armor: 100, [selected]: 40 });
    }
    assert.equal(row(pick('yunv-xinjing-power-l200-minimum')).metrics[0].neili_cost, 100);
    assert.equal(row(pick('yunv-xinjing-power-l200-fighting')).immediate[0].busy, 3);
});

test('天魔先天资质为或条件，四项自损独立，映射加成不据此推论持久与养成成本', () => {
    const c = pick('surge-force-tianmo-l400-sword-map'), r = row(c);
    assert.equal(r.immediate[0].temp.apply.force, 76); assert.equal(r.immediate[0].temp.apply.sword, 76);
    assert.equal(r.metrics[0].neili_cost, 8000);
    assert.equal(pick('surge-force-tianmo-l400-str30-con29').parameters.expected, 'observed');
    assert.equal(pick('surge-force-tianmo-l400-both-attributes29').parameters.expected, 'refused');
    assert.equal(row(pick('surge-force-tianmo-l400-extra-neili')).metrics[0].neili_cost, 9000);
    r.immediate[0].eff_jing = r.before[0].eff_jing; r.after = structuredClone(r.immediate);
    assert.throws(() => validateGumuPublicForceRecord(r, c));
});

test('拒绝伪造身份、错误入口原因、未知计量及延迟/心跳污染', () => {
    const c = pick('surge-force-power-l200-fighting');
    for (const mutate of [r => r.before[0].wizardp = 1, r => r.after[1].playerp = 0,
        r => r.before[0].cultivation.character = '狡黠多变', r => r.before[0].effective_skills.force++,
        r => r.metrics[0].neili_cost = null, r => r.metrics[0].heartbeats = 1,
        r => r.immediate[0].busy = 1, r => r.callbacks.push({})]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuPublicForceRecord(r, c));
    }
    const denied = pick('yunv-xinjing-roar-l800'), r = row(denied); r.reason = '目标不存在';
    assert.throws(() => validateGumuPublicForceRecord(r, denied));
    assert.ok(!cases.some(c => ['heal', 'inspire', 'xun'].includes(c.parameters.ability)));
});

test('真实空闲null保持原样；缺字段、换对象与未实测字段不能伪造成功', () => {
    const c = pick('suxin-jue-power-l200'), original = row(c);
    assert.equal(original.before[0].busy, null); assert.equal(original.immediate[0].busy, null);
    validateGumuPublicForceRecord(original, c);
    assert.equal(original.after[0].busy, null);
    for (const mutate of [r => delete r.before[0].busy, r => delete r.before[1].conditions,
        r => delete r.before[1].not_living, r => delete r.immediate[0].neili,
        r => r.after[1].object = '/tests/actor#wrong', r => delete r.before[0].learned,
        r => r.immediate[0].effective_skills.force--, r => r.metrics[0].neili_cost = -1,
        r => delete r.method, r => delete r.elapsed]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuPublicForceRecord(r, c));
    }
});

test('公共发动者、命令实参、熟练度与恢复账缺失均拒绝，统计不依赖raw.parameters', () => {
    const c = pick('yunv-xinjing-lifeheal-l200');
    for (const mutate of [r => r.launches[0].actor = r.before[1].object,
        r => r.launches[0].argument = 'lifeheal', r => r.immediate[0].learned = {},
        r => r.after[0].learned['yunv-xinjing'] = 1, r => delete r.metrics[0].ability_launched,
        r => delete r.metrics[1].qi_recovery, r => r.after[1].learned.force = 1,
        r => { r.metrics[1].qi_cost = 10; r.metrics[1].qi_recovery += 10; },
        r => { r.metrics[0].neili_cost += 10; r.metrics[0].neili_recovery = 10; }]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuPublicForceRecord(r, c));
    }
    const r = row(c); assert.equal(Object.hasOwn(r, 'parameters'), false);
    const result = publicForceEffects([{ outcome: r.outcome, raw: r }]);
    assert.equal(result.command_accepted, 1); assert.equal(result.accepted_without_measured_change, 0);
    assert.equal(result.sides[1].net.qi.mean, 110);
});

test('共享接线只补性格与not_living观测，冻结原模块且报告按冻结条件分组', () => {
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8').replace(/\s+/g, ' ');
    assert.match(runner, /member_array\(current\["parameters"\]\["collection_group"\], \(\{ "emei-public-force", "gumu-public-force", "mingjiao-public-force" \}\)\) != -1\) result\["not_living"\] = ob->query\("not_living"\);/);
    assert.match(runner, /\(\{ "emei-healing", "emei-dispel", "emei-buffs", "gumu-public-force", "mingjiao-public-force", "gumu-healing", "gumu-dispel", "gumu-buffs" \}\)\) != -1\) result\["cultivation"\]\["character"\] = ob->query\("character"\);/);
    assert.ok(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8')
        .includes("'tools/tests/martial_data/school_gumu_public_force_cases.mjs'"));
    const report = readFileSync(join(root, 'tools/tests/martial_data/school_combat_report.mjs'), 'utf8');
    assert.match(report, /\['wudang-public-force', 'shaolin-public-force', 'emei-public-force', 'gumu-public-force', 'mingjiao-public-force'\]\.includes\(condition.parameters.collection_group\)\)\s+condition.public_force = publicForceEffects\(rows.filter\(r => r.condition_id === condition.id\)\);/);
});

test('公共内功报告保留归属和受理无变化，拒绝混入伤害与普通交锋表', () => {
    const selected = [pick('suxin-jue-dispel-l200-neili299'), pick('yunv-xinjing-lifeheal-l200'), pick('surge-force-shot-l800')];
    const rows = selected.map(c => ({ condition_id: c.id, outcome: c.parameters.expected, raw: row(c) }));
    for (const r of rows) assert.equal(Object.hasOwn(r.raw, 'parameters'), false);
    const conditions = selected.map(c => ({ ...c,
        counts: { observed: Number(c.parameters.expected === 'observed'), refused: Number(c.parameters.expected === 'refused') },
        effects: schoolCombatEffects(rows.filter(r => r.condition_id === c.id)),
        public_force: publicForceEffects(rows.filter(r => r.condition_id === c.id)) }));
    assert.equal(conditions[0].public_force.accepted_without_measured_change, 1);
    assert.equal(conditions[1].public_force.accepted_without_measured_change, 0);
    assert.equal(conditions[1].public_force.sides[1].net.qi.mean, 110);
    assert.equal(conditions[2].public_force.command_accepted, 0);
    assert.ok(conditions.every(c => c.public_force.attempts === 1));
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-not-a-series', evidence_sha256: 'synthetic',
        totals: { conditions: 3, samples: 3, observed: 2, refused: 1, errors: 0 }, conditions });
    const start = markdown.indexOf('## 公共内功即时作用'); assert.ok(start > 0);
    assert.ok(!markdown.slice(0, start).includes('school-gumu-public-force-'));
    assert.ok(!markdown.includes('## 门派组合：原心跳普通交锋'));
    for (const c of selected) assert.equal(markdown.split(`| ${c.id} |`).length - 1, 1);
});
