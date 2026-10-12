import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, parseArgs } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { selectConditions, duguTimerProbes } from './execution.mjs';
import { schoolCombatEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const all = schoolCombatConditions(catalog);
const prefix = 'school-huashan-advanced-';
const cases = selectConditions(all, { casePrefix: prefix });

test('新增条件独立前缀，完整样本和旧111条件不混算，续跑不重新选范围', () => {
    assert.equal(cases.length, 33);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2124);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 8);
    assert.equal(parseArgs(['school-combat', '--case-prefix', prefix]).casePrefix, prefix);
    assert.throws(() => parseArgs(['school-combat', '--case-prefix', prefix, '--case', cases[0].id]), /不能同用/);
    assert.throws(() => parseArgs(['resume', '--input', 'dummy', '--case-prefix', prefix]), /无效参数/);
    assert.deepEqual(selectConditions(all, { case: cases[0].id }), [cases[0]]);
    assert.equal(selectConditions(all, { casePrefix: 'missing-' }).length, 0);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    assert.ok(cases.every(c => entries.has(c.entry_id)));
});

test('无招仅改变许可，破剑知识只改变目标类别知识，不用NPC豁免', () => {
    for (const level of [200, 400, 800]) {
        const base = cases.find(c => c.id === prefix + `dugu-jiujian-ordinary-l${level}`);
        const nothing = cases.find(c => c.id === base.id + '-nothing');
        const normalized = structuredClone(nothing.parameters.actor);
        normalized.properties['can_learn/dugu-jiujian/nothing'] = 0;
        assert.deepEqual(normalized, base.parameters.actor);
        const known = cases.find(c => c.id === prefix + `dugu-jiujian-po-l${level}-known-sword`);
        const po = cases.find(c => c.id === prefix + `dugu-jiujian-po-l${level}`);
        const actor = structuredClone(known.parameters.actor);
        delete actor.properties['can_perform/dugu-jiujian'];
        assert.deepEqual(actor, po.parameters.actor);
        assert.equal(po.parameters.actor.properties['can_perform/dugu/po'], 100);
        assert.equal(po.parameters.actor.properties.int, 39);
    }
    assert.equal(cases.filter(c => c.parameters.actor.properties.neili === 0).length, 3);
});

function row(c) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        weapon: 'sword', temp: {}, qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
    }));
    return { outcome: 'observed', before, immediate: structuredClone(before),
        launches: [{ skill: 'dugu-jiujian' }], metrics: [{ direct: 1, neili_cost: 0 }, {}] };
}

test('原三式零费用，破气和弘意按实际分支校验，状态不冒充伤害', () => {
    for (const ability of ['qi', 'yi']) {
        const c = cases.find(c => c.parameters.ability === ability && c.parameters.level === 200);
        for (const direct of [0, 1]) {
            const raw = row(c);
            raw.metrics[0].direct = direct;
            raw.immediate[0].busy = ability === 'yi' ? (direct ? 2 : 3) : (direct ? 3 : 4);
            if (ability === 'qi' && direct) raw.immediate[1].temp.no_exert = 1;
            validateSchoolCombatRecord(raw, c);
            raw.immediate[0].busy--;
            validateSchoolCombatRecord(raw, c);
            const wrongBusy = structuredClone(raw); wrongBusy.immediate[0].busy--;
            assert.throws(() => validateSchoolCombatRecord(wrongBusy, c));
            raw.metrics[0].neili_cost = 100;
            assert.throws(() => validateSchoolCombatRecord(raw, c));
        }
    }
});

test('破气原技能对象回调探针可逐字撤回，不改随机和延迟', () => {
    const original = readFileSync(join(root, 'kungfu/skill/dugu-jiujian/qi.c'), 'utf8');
    const probe = duguTimerProbes(original);
    let restored = probe.changed;
    for (const { anchor, insert } of [...probe.sites].reverse()) restored = restored.replace(anchor + insert, anchor);
    assert.equal(restored, original);
    assert.ok(probe.changed.includes('call_out("poqi_end", 10 + random(ap / 30), me, target);'));
    assert.throws(() => duguTimerProbes(original + original), /不唯一/);
});

test('破气解除用目标回调实测，不以总等待秒数充数', () => {
    const c = cases.find(c => c.id.endsWith('-expiry')), raw = row(c);
    raw.immediate[0].busy = 3;
    raw.immediate[1].temp.no_exert = 1;
    raw.after = structuredClone(raw.immediate);
    delete raw.after[1].temp.no_exert;
    raw.elapsed = 34.4;
    raw.callbacks = [{ side: 1, phase: 'before', elapsed: 18.1, state: structuredClone(raw.immediate[1]) },
        { side: 1, phase: 'after', elapsed: 18.2, state: structuredClone(raw.after[1]) }];
    validateSchoolCombatRecord(raw, c);
    const effects = schoolCombatEffects([{ outcome: 'observed', raw }]);
    assert.equal(effects.target_callback_start_seconds.mean, 18.1);
    assert.equal(effects.callback_start_seconds.mean, null);
    assert.equal(effects.target_no_exert.successes, 1);
    const tickAligned = structuredClone(raw); tickAligned.elapsed = 33.994385;
    validateSchoolCombatRecord(tickAligned, c);
    for (const mutate of [r => { r.callbacks = []; }, r => { r.after[1].temp.no_exert = 1; },
        r => { r.callbacks[0].side = 0; }, r => { r.elapsed = 30; }, r => { r.callbacks[0].elapsed = 1; }]) {
        const wrong = structuredClone(raw); mutate(wrong);
        assert.throws(() => validateSchoolCombatRecord(wrong, c));
    }
});
