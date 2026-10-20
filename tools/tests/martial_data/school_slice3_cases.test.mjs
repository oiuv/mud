import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice3SourcePaths, slice3Conditions, validateSlice3Record, slice3Effects,
    slice3SupportSet } from './school_slice3_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = slice3Conditions(catalog, read), smoke = slice3Conditions(catalog, read, { smoke: true });

function state(cfg, side) {
    const src = side ? cfg.target : cfg.actor;
    const handSkills = ['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'];
    const improve = Math.max(0, ...handSkills.map(s => src.skills[s] || 0));
    return {
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        skills: { ...src.skills }, learned: {}, mappings: { ...src.mappings },
        preparations: { ...src.preparations },
        temp: { apply: { armor: 100, ...(src.equipment ? { damage: 50, dodge: -1 } : {}) } }, busy: null,
        qi: src.properties.qi, eff_qi: src.properties.eff_qi, jing: src.properties.jing,
        eff_jing: src.properties.eff_jing, neili: src.properties.neili, max_neili: src.properties.max_neili,
        str: src.properties.str, int: src.properties.int, con: src.properties.con,
        dex: src.properties.dex, shen: src.properties.shen, gender: src.properties.gender,
        character: src.properties.character,
        effective_str: src.properties.str + Math.trunc(improve / 10),
        effective_skills: { ...src.skills },
        conditions: 0,
    };
}

function trace(c, { hit = true, input = 100, attacks = 5, busy = 5 } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const before = [state(p, 0), state(p, 1)];
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        outcome: p.expected, elapsed: 0.01, before, immediate: structuredClone(before),
        after: structuredClone(before), metrics: [{}, {}], actions: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], callbacks: [], dropped: [], terminals: [],
        launches: [], refusals: [], directs: [], reason: '' };
    const b = raw.immediate[0], v = raw.immediate[1];
    if (c.method === 'interface') {
        raw.interfaces = [{ ...p.interface, result: accepted ? 1 : 0 }];
        if (!accepted) raw.reason = p.refusal;
    } else if (c.method === 'ordinary') {
        raw.actions = [{ actor: 0, target: 1, action: 'attack' }];
        raw.attacks = [{ actor: 0, target: 1, type: 0, result: 0, damage: 30 }];
        v.qi -= 30;
    } else if (!accepted) {
        raw.reason = p.refusal;
        raw.refusals = [{ actor: before[0].object, reason: p.refusal }];
    } else {
        raw.launches = [{ actor: before[0].object, skill: p.skill, argument: p.ability + ' right' }];
        if (p.collection_group === 'slice3-murong') {
            // Combo: 7×do_attack(type 13), flat fee 210, busy 3+random(5).
            b.neili -= 210; b.busy = busy;
            const n = attacks;
            for (let i = 0; i < n; i++) {
                raw.attacks.push({ actor: 0, target: 1, type: 13, result: 0, damage: 40 });
                raw.actions.push({ actor: 0, target: 1, action: 'attack' });
                v.qi -= 40;
            }
        } else if (p.school === 'xingxiu') {
            const fee = hit ? 300 : 200;
            b.neili -= fee; b.busy = hit ? 3 : 4;
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, damage: input }];
                raw.dodge_checks = [{ result: 0 }];
                raw.metrics[0] = { direct: 1 };
                const support = slice3SupportSet(input, 75, before[0], before[1], 'REMOTE');
                const out = support[0];
                v.qi = out.qi; v.eff_qi = out.eff_qi;
                v.eff_jing -= Math.trunc(input / 8);
                v.jing = Math.min(v.jing - Math.trunc(input / 4), v.eff_jing);
                const poison = before[0].skills.poison ?? 250;
                v.conditions = { corpse_poison: { level: poison, id: 'left', name: '腐尸毒',
                    remain: 5 + Math.trunc(poison / 20) } };
            }
        } else if (p.school === 'honghua') {
            b.neili -= 150; b.busy = 3;
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, damage: input }];
                raw.dodge_checks = [{ result: 0 }];
                raw.metrics[0] = { direct: 1 };
                const support = slice3SupportSet(input, 60, before[0], before[1], 'WEAPON');
                const out = support[0];
                v.qi = out.qi; v.eff_qi = out.eff_qi;
            }
        } else {
            // lingjiu: WEAPON direct, fee 160/80, busy 2/4.
            const fee = hit ? 160 : 80;
            b.neili -= fee; b.busy = hit ? 2 : 4;
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, damage: input }];
                raw.dodge_checks = [{ result: 0 }];
                raw.metrics[0] = { direct: 1 };
                const support = slice3SupportSet(input, 50, before[0], before[1], 'WEAPON');
                const out = support[0];
                v.qi = out.qi; v.eff_qi = out.eff_qi;
            }
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('48 条件有限矩阵：每派 10-14 条件、正式 896、烟雾 80，ID 唯一', () => {
    assert.equal(cases.length, 48);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 896);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 80);
    assert.equal(new Set(cases.map(c => c.id)).size, 48);
    for (const dir of ['lingjiu', 'murong', 'xingxiu', 'honghua']) {
        assert.ok(cases.some(c => c.parameters.collection_group === 'slice3-' + dir), dir);
    }
    for (const c of cases) {
        assert.equal(c.stage, 'school');
        assert.equal(c.parameters.not_applicable, '');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.ok(slice3SourcePaths.includes(c.parameters.base_source.path));
    }
});

test('lingjiu 契约：WEAPON 直伤、费用 160/80、忙乱 2/4', () => {
    const hitC = cases.find(x => x.id === 'school-slice3-lingjiu-perform-hit');
    const hit = trace(hitC, { input: 260 });
    validateSlice3Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 160);
    assert.equal(hit.immediate[0].busy, 2);
    assert.equal(hit.directs.length, 1);
    const missC = cases.find(x => x.id === 'school-slice3-lingjiu-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice3Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 80);
    assert.equal(miss.immediate[0].busy, 4);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateSlice3Record(bad, hitC));
});

test('murong 契约：combo 7×do_attack(type 13)、无 directs、费用 210、忙乱 3-7', () => {
    const c = cases.find(x => x.id === 'school-slice3-murong-perform-hit-bias');
    const full = trace(c, { attacks: 7, busy: 5 });
    validateSlice3Record(full, c);
    assert.equal(full.directs.length, 0);
    assert.equal(full.attacks.length, 7);
    assert.equal(full.immediate[0].neili, 6000 - 210);
    for (const at of full.attacks) assert.equal(at.type, 13);
    assert.ok(full.immediate[0].busy >= 3 && full.immediate[0].busy <= 7);
    // Partial combo (early break) also passes.
    const partial = trace(c, { attacks: 3, busy: 4 });
    validateSlice3Record(partial, c);
    assert.equal(partial.attacks.length, 3);
    // Wrong attack type is rejected.
    const bad = structuredClone(full); bad.attacks[0].type = 0;
    assert.throws(() => validateSlice3Record(bad, c));
});

test('xingxiu 契约：REMOTE 直伤、费用 300/200、corpse_poison + jing 伤创', () => {
    const hitC = cases.find(x => x.id === 'school-slice3-xingxiu-perform-hit');
    const hit = trace(hitC, { input: 300 });
    validateSlice3Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 300);
    assert.equal(hit.immediate[0].busy, 3);
    assert.ok(hit.immediate[1].conditions.corpse_poison);
    assert.ok(hit.immediate[1].eff_jing < hit.before[1].eff_jing);
    const missC = cases.find(x => x.id === 'school-slice3-xingxiu-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice3Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 200);
    assert.equal(miss.immediate[0].busy, 4);
});

test('honghua 契约：WEAPON 直伤、平费 150、忙乱 3', () => {
    const hitC = cases.find(x => x.id === 'school-slice3-honghua-perform-hit');
    const hit = trace(hitC, { input: 200 });
    validateSlice3Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 150);
    assert.equal(hit.immediate[0].busy, 3);
    assert.equal(hit.directs.length, 1);
    const missC = cases.find(x => x.id === 'school-slice3-honghua-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice3Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 150);
    assert.equal(miss.immediate[0].busy, 3);
});

test('拒绝/接口/普通攻击契约与错误样本豁免', () => {
    const refusal = cases.find(x => x.id === 'school-slice3-lingjiu-perform-gate-force-179');
    const r = trace(refusal); validateSlice3Record(r, refusal);
    const learn = cases.find(x => x.id === 'school-slice3-honghua-interface-learn-dex-23');
    validateSlice3Record(trace(learn), learn);
    const learnOk = cases.find(x => x.id === 'school-slice3-honghua-interface-learn-dex-24');
    validateSlice3Record(trace(learnOk), learnOk);
    const ordinary = cases.find(x => x.id === 'school-slice3-murong-ordinary-baseline-l250');
    validateSlice3Record(trace(ordinary), ordinary);
    const err = trace(refusal); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateSlice3Record(err, refusal), null);
    const dup = trace(ordinary); dup.index = ordinary.samples;
    assert.throws(() => validateSlice3Record(dup, ordinary));
});

test('effects 汇总分母独立：错误不入效果、命中率有界', () => {
    const c = cases.find(x => x.id === 'school-slice3-lingjiu-perform-hit');
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c, { input: 260 }) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: trace(c) },
    ];
    rows[1].raw.outcome = 'error'; rows[1].raw.reason = 'driver interruption';
    const e = slice3Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});
