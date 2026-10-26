import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { wudangDispelConditions, dispelExpected, validateWudangDispelRecord } from './school_wudang_dispel_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { dispelEffects } from './school_public_force_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = wudangDispelConditions(catalog);
const find = suffix => { const c = cases.find(x => x.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

// Synthetic rows test the collector only, never substitute for driver measurements.
function row(c) {
    const p = c.parameters, before = [p.actor, p.target].map((cfg, side) => {
        const skills = structuredClone(cfg.skills), effective_skills = {};
        for (const [key, value] of Object.entries(skills))
            effective_skills[key] = Math.trunc(value / 2) + (skills[cfg.mappings[key]] ?? 0);
        return { ...cfg.properties, id: side ? 'right' : 'left', skills, effective_skills,
            mappings: structuredClone(cfg.mappings), conditions: structuredClone(cfg.conditions || {}),
            cultivation: Object.fromEntries(['breakup', 'special_skill/divine', 'immune/poison'].map(k => [k, cfg.properties[k]])),
            weapon: 'none', busy: cfg.busy ?? 0, temp: { apply: { armor: 100 } } };
    });
    const e = dispelExpected(before, p), immediate = structuredClone(before);
    immediate[0].neili -= e.cost; immediate[0].busy = e.actorBusy[0]; immediate[1].busy = e.targetBusy[0];
    immediate[p.other ? 1 : 0].conditions = e.conditions;
    return { before, immediate, after: structuredClone(immediate), outcome: p.expected,
        command_accepted: Number(p.expected === 'observed'), reason: p.expected === 'refused' ? '原命令拒绝' : '',
        launches: p.expected === 'observed' ? [{ skill: 'force' }] : [], attacks: [], interfaces: [],
        metrics: [{ neili_cost: e.cost }, {}] };
}

test('驱除新增条件不改旧3759条件96432样本，入口和初始状态均有原源码', () => {
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 3759); assert.equal(old.reduce((n, c) => n + c.samples, 0), 96432);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'wudang-dispel'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.ok(wudangDispelConditions(catalog, { smoke: true }).every(c => c.samples === 2));
    for (const c of cases) {
        for (const source of c.parameters.qualification_sources) assert.ok(existsSync(join(root, source)), source);
        assert.equal(c.parameters.observe_seconds, 0); validateSchoolCombatRecord(row(c), c);
    }
    const execution = readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8');
    assert.match(execution, /'tools\/tests\/martial_data\/school_wudang_dispel_cases\.mjs'/);
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.match(runner, /ob->apply_condition\(key, serializable\(value\)\)/);
    assert.doesNotMatch(runner, /ob->clear_condition\(/);
});

test('醉酒门槛、疾病额外费用和起手费按自己/他人分别计算', () => {
    for (const mode of ['self', 'other']) {
        const other = mode === 'other';
        const exact = row(find(`drunk-${mode}-l200-force-exact`));
        assert.deepEqual(exact.after[other ? 1 : 0].conditions, {});
        assert.equal(exact.metrics[0].neili_cost, other ? 250 : 100);
        const short = row(find(`drunk-${mode}-l200-force-short`));
        assert.deepEqual(short.after[other ? 1 : 0].conditions, short.before[other ? 1 : 0].conditions);
        const illness = row(find(`ill_kesou-${mode}-l200-neili-exact`));
        assert.equal(illness.metrics[0].neili_cost, other ? 700 : 400);
        assert.equal(illness.after[0].neili, 0);
        assert.deepEqual(illness.after[other ? 1 : 0].conditions, {});
        assert.equal(row(find(`ill_kesou-${mode}-l200-neili-short`)).metrics[0].neili_cost, other ? 250 : 100);
    }
});

test('毒伤与达摩部分驱除保留剩余、永久标记及来源身份', () => {
    for (const name of ['freezing', 'damo_luanqi']) for (const mode of ['self', 'other']) {
        const side = mode === 'other' ? 1 : 0;
        const r = row(find(`${name}-${mode}-l200-partial`));
        assert.equal(r.metrics[0].neili_cost, 6000);
        assert.equal(r.after[side].conditions[name].remain, side ? 17855 : 15598);
        const permanent = row(find(`${name}-${mode}-l200-permanent`));
        assert.equal(permanent.before[side].conditions[name].remain, -1);
        assert.equal(permanent.after[side].conditions[name].remain, side ? 7855 : 5598);
        const creator = row(find(`${name}-${mode}-l200-creator`));
        assert.equal(creator.metrics[0].neili_cost, side ? 400 : 200);
        assert.deepEqual(creator.after[side].conditions, {});
        assert.ok(row(find(`${name}-${mode}-l200-creator-force49`)).after[side].conditions[name]);
    }
});

test('内力阈值在起手扣费之后检查，受理不等于生效', () => {
    for (const name of ['freezing', 'damo_luanqi']) {
        const c = find(`${name}-other-l200-inner-neili199`), r = row(c);
        assert.equal(r.command_accepted, 1); assert.equal(r.metrics[0].neili_cost, 250);
        assert.equal(r.after[1].conditions[name].remain, 100);
    }
    for (const suffix of ['neili299', 'target-busy', 'target-fighting']) {
        const r = row(find(`drunk-other-l200-${suffix}`));
        assert.equal(r.command_accepted, 1); assert.equal(r.metrics[0].neili_cost, 0);
    }
    const r = row(find('drunk-self-l200-with-bandage'));
    assert.deepEqual(r.after[0].conditions, { bandaged: 20 });
});

test('医毒辅技、转世、移经易脉及免毒不是两类异常的通用等价加成', () => {
    for (const mode of ['self', 'other']) {
        const side = mode === 'other' ? 1 : 0;
        for (const suffix of ['auxiliary-gate', 'divine', 'immunity', 'full-immunity']) {
            const poison = row(find(`freezing-${mode}-l200-${suffix}`));
            // 350-level poison: divine lowers need to 252, but helping another raises it to 302.
            if (side && suffix === 'divine') assert.ok(poison.after[side].conditions.freezing);
            else assert.deepEqual(poison.after[side].conditions, {});
            assert.ok(row(find(`damo_luanqi-${mode}-l200-${suffix}`)).after[side].conditions.damo_luanqi);
        }
        const poison = row(find(`freezing-${mode}-l200-rebirth`));
        if (side) assert.ok(poison.after[side].conditions.freezing);
        else assert.deepEqual(poison.after[side].conditions, {});
        assert.deepEqual(row(find(`damo_luanqi-${mode}-l200-rebirth`)).after[side].conditions, {});
    }
});

test('拒绝伪造清除、扣费、来源、缺失初始状态、额外伤害或忙乱', () => {
    const c = find('freezing-other-l200-partial');
    for (const mutate of [
        r => r.immediate[1].conditions = {}, r => r.immediate[0].neili++,
        r => r.metrics[0].neili_cost--, r => r.before[0].id = 'foreign',
        r => delete r.before[1].conditions, r => r.immediate[1].qi--,
        r => r.immediate[0].busy = 12, r => r.launches[0].skill = c.parameters.skill,
    ]) {
        const r = row(c); mutate(r); r.after = structuredClone(r.immediate);
        assert.throws(() => validateWudangDispelRecord(r, c));
    }
    const unchanged = structuredClone(c.parameters); row(c);
    assert.deepEqual(c.parameters, unchanged, 'oracle不能修改配置或起始快照');
});

test('真实query_busy未设值可为null，但缺失观测字段不能填零', () => {
    const c = find('freezing-self-l200'), r = row(c);
    for (const state of r.before) state.busy = null;
    r.immediate[1].busy = null; r.after = structuredClone(r.immediate);
    validateWudangDispelRecord(r, c);
    delete r.before[1].busy;
    assert.throws(() => validateWudangDispelRecord(r, c));
});

test('统计只读实测状态，不用受理或期望填清除，缺失值为未知', () => {
    const names = ['freezing-self-l200', 'freezing-self-l200-partial', 'freezing-self-l200-permanent',
        'freezing-self-l200-force-short'];
    const rows = names.map(suffix => { const raw = row(find(suffix)); return { outcome: raw.outcome, raw }; });
    const bad = { outcome: 'observed', raw: { before: [{}], after: [{}] } };
    const p = find(names[0]).parameters, r = dispelEffects([...rows, bad, { outcome: 'error' }], p);
    assert.deepEqual(r.outcomes, { cleared: 1, partial: 2, unchanged: 1, other_change: 0, unknown: 1 });
    assert.equal(r.command_accepted, 4); assert.equal(r.attempts, 5);
    assert.equal(dispelEffects([bad], p).remaining_value.mean, null);
});
