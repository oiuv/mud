import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createSeries, openSeries, digest } from './ledger.mjs';
import { validateExpectedOutcomes, validateRecord } from './execution.mjs';
import { validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatMarkdown, schoolCombatEffects } from './school_combat_report.mjs';
import { gumuZhiConditions, gumuZhiFixtureRequirements, gumuZhiAttackPower, validateGumuZhiRecord,
    validateGumuZhiLoads, gumuZhiEffects } from './school_gumu_zhi_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
// Only the three exact source entries needed by this independent module; no full-repository inventory.
const skills = ['sanwu-shou', 'sanwu-shou/zhi', 'yinsuo-jinling'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', text = readFileSync(join(root, path), 'utf8');
    const line = id.endsWith('/zhi') ? text.split('\n').findIndex(s => s.startsWith('int perform(')) + 1 : 0;
    return { id, path, sha256: hash(text), entries: line ? [{ id: `${path}:${line}:perform`, role: 'perform' }] : [] };
});
const sourceFingerprint = digest(skills.map(s => ({ path: s.path, sha256: s.sha256 })));
const catalog = { skills, source_fingerprint: sourceFingerprint, dictionary_sha256: '0'.repeat(64) };
const cases = gumuZhiConditions(catalog), smoke = gumuZhiConditions(catalog, { smoke: true });
const pick = (tag = 'low140', level = 200) => {
    const c = cases.find(x => x.id === `school-gumu-zhi-l${level}-${tag}`); assert.ok(c, tag); return c;
};
const grant = 'can_perform/sanwu-shou/zhi';

function snapshot(cfg, side, fighting) {
    const equipment = cfg.equipment, apply = { armor: 100, ...(equipment ? { damage: 50, dodge: -1 } : {}) };
    for (const [k, v] of Object.entries(cfg.temp ?? {})) apply[k.slice('apply/'.length)] = v;
    const fields = Object.entries(cfg.properties), object = '/tests/' + (side ? 'right' : 'left') + '#1';
    return { ...Object.fromEntries(fields.filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: Object.fromEntries(fields.filter(([k]) => k.includes('/') || k === 'character')),
        object, id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1, wizardp: 0,
        living: 1, ghost: 0, fighting_opponent: Number(fighting), busy: cfg.busy ?? null,
        skills: structuredClone(cfg.skills), learned: {}, mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (apply[k] ?? 0)])),
        weapon: equipment?.type ?? 'none', weapon_damage: equipment ? 50 : 0,
        weapon_flag: equipment?.type === 'sword' ? 4 : 0,
        weapon_details: equipment ? { program: '/tests/' + equipment.type, object: '/tests/' + equipment.type + '#' + side,
            skill_type: equipment.type, weight: 3000, damage: 50, flag: equipment.type === 'sword' ? 4 : 0 } : {},
    };
}

// Synthetic observations exercise the collector only; never appended to a real collection ledger.
function trace(c, options = {}) {
    const p = c.parameters, before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 });
        preparation.after = structuredClone(before[1]);
    }
    const r = { kind: 'sample', condition_id: c.id, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], command_accepted: Number(p.expected === 'observed'),
        metrics: [{}, {}], attacks: [], passives: [], actions: [], interfaces: [], launches: [], dropped: [],
        terminals: [], callbacks: [], elapsed: 0.01, reason: '', ...(preparation ? { preparation } : {}),
        skill_loads: p.capture_skill_loads.map(descriptor => ({ ...descriptor, run_id: 'synthetic-run',
            load_id: 'synthetic-first-' + descriptor.skill, state: snapshot(pick().parameters.actor, 0, false) })) };
    const finish = () => {
        r.after = structuredClone(r.immediate);
        for (const side of [0, 1]) for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            const cost = r.before[side][key] - r.immediate[side][key];
            if (cost > 0) r.metrics[side][key + '_cost'] = cost;
        }
        return r;
    };
    if (p.expected === 'refused') {
        r.reason = '原命令拒绝（合成校验资料）'; r.immediate[0].temp.notify_fail = r.reason;
        return finish();
    }
    const ap = gumuZhiAttackPower(before[0], before[1]), base = before[1].gender === '女性' ? 4 : 5;
    const branch = options.branch ?? (Math.trunc(ap / 2) > before[1].effective_skills.dodge ? 'success' : 'failure');
    const planned = options.planned ?? (branch === 'success' ? Math.min(7, base + 1) : base);
    const bonus = Math.trunc(ap / (branch === 'success' ? 8 : 15));
    const current = structuredClone(before);
    current[0].temp.apply.attack = (before[0].temp.apply.attack ?? 0) + bonus;
    current[0].neili -= planned * 20;
    const actual = options.actual ?? planned;
    for (let i = 0; i < actual; i++) {
        let action = { action: '合成原动作观察', lvl: 0, force: 90, attack: 13, dodge: 10, parry: 10, damage: 20 };
        if (options.dynamic) {
            const s = r.skill_loads[0].state.skills;
            action = { ...action, lvl: 300, force: Math.trunc(s.force / 2), attack: Math.trunc(s.whip / 4),
                dodge: Math.trunc(s.dodge / 6), parry: Math.trunc(s.parry / 6), damage: Math.trunc(s.force / 4) };
        }
        r.actions.push({ actor: 0, target: 1, skill: p.skill, action });
        const eligibility = current[1].living && current[0].neili >= 200 && current[0].skills[p.skill] >= 120;
        const triggered = !!options.triggered && eligibility && current[1].shen > 0;
        const incoming = options.incoming ?? 10, e = { actor: 0, target: 1, skill: p.skill, route: 'martial',
            incoming, factor: 0, result: triggered ? '原附伤文字（合成）' : eligibility ? 1 : 0,
            before: structuredClone(current) };
        if (triggered) {
            current[0].neili -= 30;
            current[1].eff_qi = Math.max(-1, current[1].eff_qi - incoming);
            current[1].qi = Math.min(current[1].qi, current[1].eff_qi);
        }
        e.after = structuredClone(current); e.neili_after = current[0].neili;
        e.target_eff_qi_after = current[1].eff_qi; e.target_busy_after = current[1].busy;
        r.passives.push(e);
        const damage = options.finalDamage ?? 10;
        current[1].qi = Math.max(-1, current[1].qi - damage);
        r.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage, apply_attack: current[0].temp.apply.attack });
    }
    if (options.inactive) {
        Object.assign(current[1], { living: 0, qi: 0, jing: 0, fighting_opponent: 0 });
        current[0].fighting_opponent = 0;
        r.terminals.push({ side: 1, state: 'unconscious' });
    }
    current[0].temp.apply.attack -= bonus; current[0].busy = options.busy ?? 1;
    r.immediate = current;
    r.metrics[0].hit = actual; r.metrics[0].ability_launched = 1;
    r.launches.push({ actor: before[0].object, skill: p.skill, argument: 'zhi' });
    return finish();
}
const validate = (r, c) => { validateRecord(r, c); return validateSchoolCombatRecord(r, c); };
const mutate = (c, change, options) => {
    const r = trace(c, options); change(r); assert.throws(() => validate(r, c));
};

test('固定29条件、940正式与58烟雾，920/20正式结果声明完整，非新门派矩阵', () => {
    assert.equal(cases.length, 29); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 940);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').reduce((n, c) => n + c.samples, 0), 920);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').reduce((n, c) => n + c.samples, 0), 20);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 58);
    assert.equal(hash(cases), 'b6828016772d70c562bc38d34d10ff60d5c4f2d17be0aab6a924a49a3bf466e2');
    assert.equal(hash(smoke), '0145b4d72bac6aa6dea21e4213d392a8b6a418b0ff411c43e67489c2526d71a7');
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    for (const c of cases) {
        assert.equal(c.entry_id, 'kungfu/skill/sanwu-shou/zhi.c:8:perform');
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        validate(trace(c), c);
    }
    assert.equal(gumuZhiFixtureRequirements.length, 6);
    for (const samples of [0, -1, 0.5, NaN]) assert.throws(() => gumuZhiConditions(catalog, { samples }));
    assert.throws(() => gumuZhiConditions({ skills: [] }));
});

test('公共createSeries/openSeries真实调用私有validateConditions，入口ID及样本合同均可落账', () => {
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-zhi-unit-'));
    try {
        const inventory = { source_fingerprint: sourceFingerprint, versions: { synthetic: true } };
        const input = { inventory, catalog, conditions: cases, execution: { synthetic: true, driver_started: false } };
        const manifest = createSeries(directory, input);
        assert.deepEqual(openSeries(directory).identity.conditions, cases);
        assert.equal(openSeries(directory).fingerprint, manifest.fingerprint);
        createSeries(join(directory, 'smoke'), { ...input, conditions: smoke });
        assert.deepEqual(openSeries(join(directory, 'smoke')).identity.conditions, smoke);
        const invalid = structuredClone(input); invalid.conditions[0].id += '.';
        assert.throws(() => createSeries(join(directory, 'invalid-id'), invalid), /条件 ID/);
        invalid.conditions[0].id = cases[0].id; invalid.conditions[0].entry_id += '-invalid';
        assert.throws(() => createSeries(join(directory, 'invalid-entry'), invalid), /入口不在源码/);
    } finally {
        assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + '\\mud-gumu-zhi-unit-')
            || resolve(directory).startsWith(resolve(tmpdir()) + '/mud-gumu-zhi-unit-'));
        rmSync(directory, { recursive: true, force: true });
    }
});

test('10类原资格拒绝与技能100边界分开，低140与正常6000互不冒充', () => {
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 10);
    const minimum = pick('skill100'); assert.equal(minimum.parameters.expected, 'observed'); validate(trace(minimum), minimum);
    const wrong = pick('wrong-map'); assert.equal(wrong.parameters.actor.mappings.whip, 'yinsuo-jinling');
    assert.deepEqual(wrong.parameters.capture_skill_loads.map(x => x.skill), ['sanwu-shou', 'yinsuo-jinling']);
    for (const c of cases) for (const load of c.parameters.capture_skill_loads) {
        assert.ok(c.parameters.actor.skills.parry > 0, '原 enable parry 冷加载要求基本招架已学');
        assert.ok(c.parameters.actor.skills[load.skill] > 0);
    }
    assert.equal(pick('normal6000-good').parameters.low_neili_control, false);
    assert.equal(pick().parameters.low_neili_control, true);
    mutate(pick('no-grant'), r => { r.before[0].cultivation[grant] = 1; });
    mutate(pick('no-map'), r => { r.before[0].mappings.whip = 'sanwu-shou'; });
    mutate(pick('busy'), r => { r.before[0].busy = null; });
});

test('正邪10%再非女性15%均整数截断，女性四击、其他性别五击失败也继续', () => {
    for (const gender of ['female', 'male']) for (const shen of [-1, 0, 1]) {
        const c = pick(`failed-${gender}-shen${shen}`), r = trace(c), observed = validate(r, c);
        const expected = gender === 'female' ? shen > 0 ? 330 : 300 : shen > 0 ? 379 : 345;
        assert.equal(observed.ap, expected); assert.equal(observed.branch, 'failure');
        assert.equal(observed.planned, gender === 'female' ? 4 : 5);
        assert.equal(observed.prepaid, gender === 'female' ? 80 : 100);
    }
    assert.equal(validate(trace(pick('failed-asexual')), pick('failed-asexual')).planned, 5);
    const c = pick('failed-male-shen1');
    mutate(c, r => { r.attacks[0].apply_attack = Math.ceil(379 / 15); });
});

test('成功原随机范围与7击上限；分支失败不虚报拒绝或七击', () => {
    for (const level of [200, 400, 800]) for (const planned of [5, 6, 7]) {
        const c = pick('low140', level), r = trace(c, { branch: 'success', planned });
        assert.equal(validate(r, c).planned, planned);
    }
    mutate(pick(), () => {}, { branch: 'success', planned: 8 });
    mutate(pick('failed-male-shen0'), () => {}, { branch: 'failure', planned: 6 });
    mutate(pick('existing-attack-success'), () => {}, { branch: 'failure' });
    mutate(pick('failed-female-shen0'), () => {}, { branch: 'success' });
});

test('原计划预扣与实际部分执行分列，目标原失活保留，不按少出手退款', () => {
    const c = pick(), r = trace(c, { actual: 2, inactive: true }), result = validate(r, c);
    assert.equal(result.planned, 5); assert.equal(result.actual_attacks, 2); assert.equal(result.prepaid, 100);
    assert.equal(result.partial, true); assert.equal(result.target_inactive, true);
    mutate(c, row => { row.metrics[0].neili_cost = 40; row.immediate[0].neili = 100; row.after = structuredClone(row.immediate); },
        { actual: 2, inactive: true });
    mutate(c, () => {}, { actual: 0 });
    mutate(c, row => { row.terminals.push({ side: 0, state: 'unconscious' }); });
});

test('正常内力附伤30另账，数值1是原附加伤害，低140只允许0', () => {
    const c = pick('normal6000-good'), r = trace(c, { triggered: true }), value = validate(r, c);
    assert.equal(value.prepaid, 100); assert.equal(value.passive_cost, 150); assert.equal(value.total_cost, 250);
    assert.equal(value.passive_triggers, 5); assert.equal(value.numeric_damage_returns, 0);
    const numeric = validate(trace(pick('normal6000')), pick('normal6000'));
    assert.equal(numeric.passive_cost, 0); assert.equal(numeric.numeric_damage_returns, 5);
    assert.equal(validate(trace(pick()), pick()).numeric_damage_returns, 0);
    mutate(c, row => { row.passives[0].after[0].neili++; }, { triggered: true });
    mutate(c, row => { row.passives[0].before[0].neili += 100; }, { triggered: true });
    mutate(pick(), row => { row.passives[0].result = 1; });
    mutate(pick('normal6000'), row => { row.passives[0].result = 0; });
});

test('hit_ob在先天身法闪避前，最终伤害0仍可有真实附伤，原创伤保留负一截断', () => {
    const c = pick('normal6000-good'), zero = trace(c, { triggered: true, finalDamage: 0 });
    assert.equal(validate(zero, c).passive_triggers, 5);
    const clipped = trace(c, { triggered: true, incoming: 12000, actual: 1 });
    assert.equal(clipped.passives[0].after[1].eff_qi, -1); validate(clipped, c);
    mutate(c, row => { row.passives[0].after[1].eff_qi = -2000; }, { triggered: true, incoming: 12000, actual: 1 });
    mutate(c, row => { row.passives = []; });
});

test('实际攻击期加成统一、加成归还初值17；null不是缺字段或未知攻击值', () => {
    for (const tag of ['existing-attack-success', 'existing-attack-failure']) {
        const c = pick(tag), r = trace(c); validate(r, c); assert.equal(r.immediate[0].temp.apply.attack, 17);
        mutate(c, row => { row.immediate[0].temp.apply.attack = 0; row.after = structuredClone(row.immediate); });
        mutate(c, row => { row.attacks[0].apply_attack++; });
        mutate(c, row => { delete row.attacks[0].apply_attack; });
        mutate(c, row => { row.attacks[0].apply_attack = null; });
    }
    const c = pick(), r = trace(c);
    for (const hit of r.attacks) hit.type = null;
    validate(r, c);
    mutate(c, row => { delete row.before[0].busy; });
    mutate(c, row => { delete row.attacks[0].type; });
    mutate(c, row => { row.before[0].temp.apply.attack = null; });
    mutate(c, row => { delete row.before[0].fighting_opponent; });
});

test('附伤前后对象、技能、正邪、渠道与原资源归属不能替换或缺失', () => {
    const c = pick('normal6000-good');
    for (const change of [
        r => { r.passives[0].before[0].object = '/tests/unrelated#1'; },
        r => { r.passives[0].after[1].object = '/tests/unrelated#2'; },
        r => { r.passives[0].before[1].shen = -1; },
        r => { r.passives[0].route = 'force'; }, r => { r.passives[0].skill = 'yunv-xinjing'; },
        r => { r.passives[0].target = 0; }, r => { delete r.passives[0].result; },
        r => { r.passives[0].before = []; }, r => { r.passives[0].after[0].qi--; },
        r => { r.passives[0].neili_after++; }, r => { r.passives[0].target_eff_qi_after++; },
    ]) mutate(c, change, { triggered: true });
});

test('原昏迷准备与正式拒绝分开，保留攻击者杀意，不把准备终态算施招结果', () => {
    const c = pick('unconscious-target'), r = trace(c); validate(r, c);
    assert.equal(r.before[0].fighting_opponent, 1); assert.equal(r.before[1].living, 0);
    assert.equal(r.terminals.length, 0); assert.equal(r.preparation.terminals.length, 1);
    for (const change of [
        row => { delete row.preparation; }, row => { row.terminals = structuredClone(row.preparation.terminals); },
        row => { row.preparation.before.object = '/tests/wrong#1'; },
        row => { row.preparation.after.living = 1; }, row => { row.before[0].fighting_opponent = 0; },
    ]) mutate(c, change);
});

test('同一次真实加载的动态动作跨档固定，不能重建全局动作获取理想数值', () => {
    const c = pick('low140', 400), d = pick('low140', 800), first = trace(c, { dynamic: true }), next = trace(d, { dynamic: true });
    validate(first, c); validate(next, d);
    assert.deepEqual(validateGumuZhiLoads([first, next]), { loads: 1, observed_dynamic_actions: 1 });
    const changed = structuredClone(next); changed.actions[0].action.force++;
    assert.throws(() => validateGumuZhiLoads([first, changed]));
    const reload = structuredClone(next); reload.skill_loads[0].load_id += '-reload';
    assert.throws(() => validateGumuZhiLoads([first, reload]));
    mutate(c, r => { r.skill_loads[0].sha256 = 'f'.repeat(64); }, { dynamic: true });
    mutate(c, r => { r.actions[0].action.force = 400; }, { dynamic: true });
    mutate(pick(), r => { r.actions[0].action.lvl = 200; });
});

test('资源成本与恢复不能额外相抵，未知计量与错误命中统计必须拒绝', () => {
    const c = pick();
    for (const change of [
        r => { r.metrics[0] = null; }, r => { r.metrics[0].neili_cost = null; },
        r => { r.metrics[0].neili_cost++; r.metrics[0].neili_recovery = 1; },
        r => { r.immediate[1].qi--; r.after = structuredClone(r.immediate); },
        r => { r.metrics[0].hit--; }, r => { r.metrics[0].heartbeats = 1; },
        r => { r.metrics[1].quick = 1; }, r => { r.launches[0].actor = '/tests/unrelated#1'; },
        r => { r.command_accepted = 0; }, r => { r.attacks[0].target = 0; },
        r => { delete r.actions; }, r => { r.before[0].effective_skills.whip++; },
    ]) mutate(c, change);
});

test('报告必须使用冻结条件；计划、实际、额外耗费、样本级附伤分母及拒绝不混算', () => {
    const c = pick('normal6000-good'), r = trace(c, { triggered: true, actual: 2, inactive: true });
    assert.equal(Object.hasOwn(r, 'parameters'), false);
    const rows = [{ outcome: 'observed', raw: r }], report = gumuZhiEffects(rows, c);
    assert.equal(report.normal_effect_denominator, 1); assert.equal(report.planned.mean, 5);
    assert.equal(report.actual_attacks.mean, 2); assert.equal(report.prepaid.mean, 100);
    assert.equal(report.passive_cost.mean, 60); assert.equal(report.total_cost.mean, 160);
    assert.equal(report.remaining_neili.mean, 5840);
    assert.equal(report.target_qi_cost.mean, 10000); assert.equal(report.target_eff_qi_cost.mean, 20);
    assert.equal(report.any_passive.trials, 1); assert.equal(report.any_passive.successes, 1);
    assert.equal(report.partial_samples, 1); assert.equal(report.target_inactive_samples, 1);
    const refused = pick('no-grant'), rejected = gumuZhiEffects([{ outcome: 'refused', raw: trace(refused) }], refused);
    assert.equal(rejected.normal_effect_denominator, 0); assert.equal(rejected.planned.mean, null);
    assert.equal(rejected.counts.refused, 1);
    const error = gumuZhiEffects([{ outcome: 'error', raw: { outcome: 'error', method: 'perform', condition_id: c.id,
        actions: [{ skill: 'sanwu-shou', action: { lvl: 300 } }] } }], c);
    assert.equal(error.counts.error, 1); assert.equal(error.any_passive.trials, 0);
    assert.throws(() => gumuZhiEffects(rows));
    assert.throws(() => gumuZhiEffects(rows, pick()));
    assert.equal(gumuZhiEffects([], c).total_cost.mean, null);
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-only', evidence_sha256: 'no-real-samples',
        totals: { conditions: 1, samples: 1, observed: 1, refused: 0, errors: 0 },
        conditions: [{ ...c, counts: { observed: 1, refused: 0 }, gumu_zhi: report, effects: schoolCombatEffects(rows) }] });
    const heading = markdown.indexOf('## 三无三不手');
    assert.ok(heading > 0); assert.ok(!markdown.slice(0, heading).includes(c.id));
    assert.ok(markdown.includes('计划预扣、实际出手、附伤追加内力'));
});
