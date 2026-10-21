import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinExertStep, shaolinExertEffects } from './school_shaolin_exert_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'shaolin-exert');
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('少林独有内功64条件716样本；旧6355条件146904计划样本不变', () => {
    assert.equal(cases.length, 64); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 716);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 27);
    const old = all.filter(c => !['shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 6355); assert.equal(old.reduce((n, c) => n + c.samples, 0), 146904);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.equal(schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'shaolin-exert').reduce((n, c) => n + c.samples, 0), 70);
    for (const c of cases) for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
});

// Synthetic transition rows test the validator, not the real model/driver result.
function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => {
        const temp = {};
        for (const [k, v] of Object.entries(cfg.temp ?? {})) {
            if (k.startsWith('apply/')) (temp.apply ??= {})[k.slice(6)] = v; else temp[k] = v;
        }
        return { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
            max_jing: 10000, neili: 6000, max_neili: 6000, ...cfg.properties,
            skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), temp,
            busy: cfg.busy ?? 0, userp: 1, wizardp: 0,
            cultivation: { 'family/family_name': cfg.properties['family/family_name'] ?? null } };
    });
    const r = { outcome: p.expected, before, immediate: structuredClone(before),
        command_accepted: Number(p.expected === 'observed'), interfaces: [], attacks: [], callbacks: [],
        launches: [], metrics: [{}, {}], reason: '原拒绝提示', elapsed: 0 };
    const apply = (b, success) => {
        const a = structuredClone(b);
        if (success) {
            const e = shaolinExertStep(p, b);
            a.neili -= e.cost; a.max_neili -= e.capacity; a.qi += e.qi; a.eff_qi += e.eff_qi;
            if (p.ability === 'powerup') {
                a.temp.powerup = 1; a.temp.apply ??= {};
                for (const k of ['attack', 'defense']) a.temp.apply[k] = (a.temp.apply[k] ?? 0) + e.bonus;
            }
            a.busy = p.fighting ? p.ability === 'tong' ? 4 : 2 : 0;
            r.launches.push({ skill: p.skill });
        }
        return a;
    };
    if (p.repeat_actions) {
        r.repeat_steps = [];
        for (const [i, action] of p.repeat_actions.entries()) {
            const b = r.immediate[0], n = r.launches.length;
            const success = p.ability === 'powerup' ? !i
                : b.max_neili >= 500 && b.neili >= b.skills.yijinjing * 5 && Math.trunc(b.eff_qi * 100 / b.max_qi) <= 80;
            const a = apply(b, success);
            r.repeat_steps.push({ action, before: b, after: a, accepted: Number(success),
                launches_before: n, launches_after: r.launches.length, refusals_before: 0,
                refusals_after: Number(!success), reason: success ? '' : '原拒绝提示' });
            r.immediate[0] = a;
        }
    } else r.immediate[0] = apply(before[0], p.expected === 'observed');
    const a = r.immediate[0], b = before[0];
    const steps = p.repeat_actions ? r.repeat_steps : [{ before: b, accepted: r.command_accepted }];
    const effects = steps.filter(s => s.accepted).map(s => shaolinExertStep(p, s.before));
    r.metrics[0] = { neili_cost: b.neili - a.neili, qi_recovery: a.qi - b.qi,
        eff_qi_recovery: effects.reduce((n, e) => n + e.eff_qi_added, 0),
        eff_qi_cost: effects.reduce((n, e) => n + e.eff_qi_capped, 0) };
    r.after = structuredClone(r.immediate);
    if (p.observe_seconds) {
        const end = r.after[0]; delete end.temp.powerup;
        for (const k of ['attack', 'defense']) end.temp.apply[k] = b.temp.apply[k];
        r.elapsed = p.observe_seconds;
        r.callbacks = [{ side: 0, phase: 'before', elapsed: p.level, state: a },
            { side: 0, phase: 'after', elapsed: p.level + 0.1, state: end }];
    }
    return r;
}

test('逐条件状态校验；不允许伪装玩家、修改目标或缺少实际发动', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    const c = find('yijinjing-tong-l200');
    for (const mutate of [r => r.before[0].wizardp = 1, r => r.after[1].qi--, r => r.launches = []]) {
        const r = row(c); mutate(r); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('易筋通脉当前内力、最大内力和气血均单独核对，不把恢复直接写成伤害', () => {
    for (const [level, qi, eff] of [[200, 3600, 1600], [400, 5200, 3200], [800, 7000, 5000]]) {
        const c = find('yijinjing-tong-l' + level), r = row(c), e = shaolinExertEffects([{ outcome: 'observed', raw: r }]);
        assert.equal(e.qi_gain.mean, qi); assert.equal(e.eff_qi_gain.mean, eff);
        assert.equal(e.max_neili_delta.mean, -level / 4);
        assert.equal(r.metrics[0].neili_cost, level * 4);
        assert.equal(r.metrics[0].eff_qi_recovery, level * 8);
        assert.equal(r.metrics[0].eff_qi_cost, Math.max(0, level * 8 - 5000));
        r.immediate[0].max_neili++; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('伤势百分比按整数计算：80.99%可以发动，81%拒绝；资源门槛不等于收费', () => {
    assert.equal(find('tong-l200-percent-truncation').parameters.actor.properties.eff_qi, 8099);
    assert.equal(find('tong-l200-percent-truncation').parameters.expected, 'observed');
    assert.equal(find('tong-l200-light').parameters.expected, 'refused');
    const c = find('tong-l100-minimum'), r = row(c);
    assert.equal(r.immediate[0].neili, 100); assert.equal(r.immediate[0].max_neili, 475);
    for (const [skill, threshold] of [['hunyuan-yiqi', 150], ['yijinjing', 200]]) {
        const c = find(`${skill}-powerup-l200-minimum-neili`), r = row(c);
        assert.equal(c.parameters.actor.properties.neili, threshold); assert.equal(r.immediate[0].neili, threshold - 100);
    }
});

test('连续施展无补给：加力拒绝叠加；通脉受当前伤势和扣除后最大内力约束', () => {
    for (const [suffix, accepted] of [['hunyuan-yiqi-powerup-l200-repeat', [1, 0]],
        ['yijinjing-tong-l200-repeat', [1, 1, 0]], ['yijinjing-tong-l800-repeat-low-capacity', [1, 0]]]) {
        const c = find(suffix), r = row(c);
        assert.deepEqual(r.repeat_steps.map(s => s.accepted), accepted); validateSchoolCombatRecord(r, c);
        const e = shaolinExertEffects([{ outcome: 'observed', raw: r }]);
        assert.equal(e.accepted, accepted.reduce((n, x) => n + x, 0)); assert.equal(e.refused, 1);
        r.repeat_steps.at(-1).accepted = 1; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('原50秒到期需要完整回调证据；只撤自身增益、保留既存属性', () => {
    for (const skill of ['hunyuan-yiqi', 'yijinjing']) {
        const c = find(`${skill}-powerup-l50-expiry`), r = row(c);
        assert.equal(c.parameters.observe_seconds, 52); assert.equal(c.samples, 2);
        assert.deepEqual(r.after[0].temp.apply, { attack: 7, defense: 11 });
        for (const mutate of [r => r.callbacks = [], r => r.callbacks[0].elapsed = 1,
            r => r.after[0].temp.powerup = 1, r => r.after[0].temp.apply.attack = 0]) {
            const x = structuredClone(r); mutate(x); assert.throws(() => validateSchoolCombatRecord(x, c));
        }
    }
});

test('战斗忙乱随机条件100次，通脉固定4忙；未测到期的即时结果不伪装为到期', () => {
    const random = cases.filter(c => c.samples === 100);
    assert.equal(random.length, 6); assert.ok(random.every(c => c.parameters.ability === 'powerup' && c.parameters.fighting));
    for (const ability of ['powerup', 'tong']) {
        const c = find(`yijinjing-${ability}-l200-fighting`), r = row(c);
        assert.equal(r.callbacks.length, 0); r.immediate[0].busy = ability === 'powerup' ? 4 : 3;
        assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('少林心法/九阳无独有目录：四条明确拒绝，不声称没有公共功能', () => {
    const missing = cases.filter(c => ['shaolin-xinfa', 'shaolin-jiuyang'].includes(c.parameters.skill));
    assert.equal(missing.length, 4); assert.ok(missing.every(c => c.parameters.expected === 'refused'));
    assert.ok(!existsSync(join(root, 'kungfu/skill/shaolin-xinfa')));
    assert.ok(!existsSync(join(root, 'kungfu/skill/jiuyang-sub')));
    assert.ok(!existsSync(join(root, 'kungfu/skill/force/powerup.c')));
});

test('中文报告展示增益、恢复与最大内力代价；封顶回扣不冒充战斗伤害', () => {
    const c = find('yijinjing-tong-l800'), r = row(c);
    const md = schoolCombatMarkdown({ fingerprint: 'test', evidence_sha256: 'test',
        totals: { conditions: 1, samples: 1, observed: 1, refused: 0, errors: 0 },
        conditions: [{ ...c, counts: { observed: 1, refused: 0 },
            shaolin_exert: shaolinExertEffects([{ outcome: 'observed', raw: r }]),
            sides: [{ metrics: { neili_cost: { mean: 3200 } } }],
            effects: { callback_start_seconds: { mean: null }, target_callback_start_seconds: { mean: null } } }] });
    assert.match(md, /气血净增加/); assert.match(md, /最大内力变化/);
    assert.match(md, /7000\.00 \| 5000\.00 \| -200\.00 \| 3200\.00/);
    assert.match(md, /回扣不当战斗受伤/);
});
